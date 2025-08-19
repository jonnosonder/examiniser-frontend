"use client";

import '../../styles/start.css';
import ArrowIcon from '@/components/arrowIcon';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Decimal from 'decimal.js';
import { useDropzone } from 'react-dropzone';
import { useData } from "@/context/dataContext";
import { useFileStore } from '@/store/useFileStore';
import Advert from '@/components/advert';

const paperSizes = {
  A3: [
    { unit: "mm", width: new Decimal(297), height: new Decimal(420) },
    { unit: "cm", width: new Decimal(29.7), height: new Decimal(42.0) },
    { unit: "in", width: new Decimal(11.69), height: new Decimal(16.54) },
    { 
      unit: "px", 
      width: new Decimal(297).times(300).div(25.4),
      height: new Decimal(420).times(300).div(25.4) 
    },
  ],
  A4: [
    { unit: "mm", width: new Decimal(210), height: new Decimal(297) },
    { unit: "cm", width: new Decimal(21.0), height: new Decimal(29.7) },
    { unit: "in", width: new Decimal(8.27), height: new Decimal(11.69) },
    { 
      unit: "px", 
      width: new Decimal(210).times(300).div(25.4),
      height: new Decimal(297).times(300).div(25.4) 
    },
  ],
  A5: [
    { unit: "mm", width: new Decimal(148), height: new Decimal(210) },
    { unit: "cm", width: new Decimal(14.8), height: new Decimal(21.0) },
    { unit: "in", width: new Decimal(5.83), height: new Decimal(8.27) },
    { 
      unit: "px", 
      width: new Decimal(148).times(300).div(25.4),
      height: new Decimal(210).times(300).div(25.4) 
    },
  ],
} as const;


type PaperSizeKey = keyof typeof paperSizes;
type Unit = (typeof paperSizes)[PaperSizeKey][number]['unit'];

type Units = 'px' | 'in' | 'cm' | 'mm';
const conversionToPx: Record<string, Decimal> = {
  px: new Decimal(1),
  in: new Decimal(300),
  cm: new Decimal(300).div(2.54),
  mm: new Decimal(300).div(25.4),
  pt: new Decimal(300).div(72),
};

function getPaperWidth(sizeKey: PaperSizeKey, unit: Unit): Decimal | null {
  const found = paperSizes[sizeKey].find(item => item.unit === unit);
  return found ? found.width : null;
}

function getPaperHeight(sizeKey: PaperSizeKey, unit: Unit): Decimal | null {
  const found = paperSizes[sizeKey].find(item => item.unit === unit);
  return found ? found.height : null;
}

export default function StartPage() {
    const { setPageFormatData } = useData();

    const router = useRouter();
    const setFileStore = useFileStore((state) => state.setFile);

    const [fileNameValue, setFileNameValue] = useState('');
    const [selectedFileDimension, setSelectedFileDimension] = useState("Custom");
    const [selectedUnitValue, setSelectedUnitValue] = useState('mm');
    const [widthPlaceHolder, setWidthPlaceHolder] = useState<string>('210mm');
    const [heightPlaceHolder, setHeightPlaceHolder] = useState<string>('297mm');
    const [widthValue, setWidthValue] = useState<Decimal | null>(null);
    const [heightValue, setHeightValue] = useState<Decimal | null>(null);
    const [visualWidthValue, setVisualWidthValue] = useState<string>("");
    const [visualHeightValue, setVisualHeightValue] = useState<string>("");

    const [file, setFile] = useState<File | null>(null);

    const fileNameRef = useRef<HTMLInputElement>(null);
    const widthInputRef = useRef<HTMLInputElement>(null);
    const heightInputRef = useRef<HTMLInputElement>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        setFileStore(uploadedFile);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        const sanitizedValue = rawValue
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '');

        setFileNameValue(sanitizedValue);
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setSelectedUnitValue(selectedValue);
        const defualtPaperSize = "A4"

        const width = getPaperWidth(defualtPaperSize, selectedValue as Unit);
        if (width !== null) {
            setWidthPlaceHolder(width !== null ? width.toString()+selectedValue : "");
        }
        const height = getPaperHeight(defualtPaperSize, selectedValue as Unit);
        if (height !== null) {
            setHeightPlaceHolder(width !== null ? height.toString()+selectedValue : "");
        }

        if (widthValue !== null) {
            const newWidth = convertUnitDecimal(widthValue, selectedUnitValue as Units, selectedValue as Units)
            if (newWidth !== null){
                setWidthValue(newWidth);
                if (selectedValue === "px" as Units){
                    setVisualWidthValue(Math.round(Number(newWidth.toFixed(3))) + selectedValue);
                } else {
                    setVisualWidthValue(parseFloat(newWidth.toFixed(3)) + selectedValue);
                }
            }
        }
        if (heightValue !== null) {
            const newHeight = convertUnitDecimal(heightValue, selectedUnitValue as Units, selectedValue as Units)
            if (newHeight !== null){
                setHeightValue(newHeight);
                if (selectedValue === "px" as Units){
                    setVisualHeightValue(Math.round(Number(newHeight.toFixed(3))) + selectedValue);
                } else {
                    setVisualHeightValue(parseFloat(newHeight.toFixed(3)) + selectedValue);
                }
            }
        }
    }

    const setFileDimension = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (selectedValue !== 'Custom') {
            const width = getPaperWidth(selectedValue as PaperSizeKey, selectedUnitValue as Unit);
            if (width !== null) {
                setWidthValue(width as Decimal);
                if (selectedUnitValue === "px" as Unit){
                    setVisualWidthValue(Math.round(Number(width)).toString()+selectedUnitValue);
                } else {
                    setVisualWidthValue(width.toString()+selectedUnitValue);
                }
            }
            const height = getPaperHeight(selectedValue as PaperSizeKey, selectedUnitValue as Unit);
            if (height !== null) {
                setHeightValue(height as Decimal);
                if (selectedUnitValue === "px" as Unit){
                    setVisualHeightValue(Math.round(Number(height)).toString()+selectedUnitValue);
                } else {
                    setVisualHeightValue(height.toString()+selectedUnitValue);
                }
            }
            setSelectedFileDimension(selectedValue);
        }
    }

    function convertUnitDecimal(
        value: string | Decimal,
        currentUnit: Units,
        targetUnit: Units
        ): Decimal | null {
        const validUnits: Units[] = ['px', 'in', 'cm', 'mm'];

        if (validUnits.includes(currentUnit) && !validUnits.includes(targetUnit)) {
            return null;
        }

        const number = new Decimal(value);
        const valueInPx = number.mul(conversionToPx[currentUnit]);
        const result = valueInPx.div(conversionToPx[targetUnit]);

        return result.toDecimalPlaces();
    }

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/[^a-zA-Z0-9.]/g, '');
        setVisualWidthValue(filteredValue);
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/[^a-zA-Z0-9.]/g, '');
        setVisualHeightValue(filteredValue);
    };

    const handleWidthBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/\s+/g, '').trim();

        if (value != ""){
            const isNumeric = /^(\d+(\.\d+)?|\.\d+)$/.test(value);
            let tempWidth : Decimal;
            if (isNumeric) {
                setWidthValue(Decimal(value));
                tempWidth = Decimal(value);
                setVisualWidthValue(value + selectedUnitValue);
            } else {
                // Check if it matches number + two letters (like 100px)
                const isNumberWithUnit = /^\d*\.?\d+[a-zA-Z]{2}$/.test(value);
                if (isNumberWithUnit) {
                    setWidthValue(Decimal(value.slice(0, -2)));
                    tempWidth = Decimal(value.slice(0, -2));
                    setVisualWidthValue(value.slice(0, -2) + selectedUnitValue);
                } else {
                    const numbersThenCharacters = /^\d*\.?\d+[a-zA-Z]+$/.test(value);
                    if (numbersThenCharacters) {
                        setWidthValue(Decimal(value.replace(/[a-zA-Z]+$/, '')));
                        tempWidth = Decimal(value.replace(/[a-zA-Z]+$/, ''));
                        setVisualWidthValue(value.replace(/[a-zA-Z]+$/, '') + selectedUnitValue);
                    } else {
                        const numbersOnly = value.replace(/[a-zA-Z]/g, '');
                        if (numbersOnly === ""){
                            setWidthValue(Decimal(0));
                            tempWidth = Decimal(0);
                            setVisualWidthValue("");
                        } else {
                            setWidthValue(Decimal(numbersOnly));
                            tempWidth = Decimal(numbersOnly);
                            setVisualWidthValue(numbersOnly + selectedUnitValue);
                        }
                    }
                }
            }
            checkIfFileDimensionNeedsUpdating(tempWidth, heightValue);
        }
    };

    const handleHeightBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/\s+/g, '').trim();

        if (value != ""){
            const isNumeric = /^(\d+(\.\d+)?|\.\d+)$/.test(value);
            let tempHeight : Decimal;
            if (isNumeric) {
                setHeightValue(Decimal(value));
                tempHeight = Decimal(value);
                setVisualHeightValue(value + selectedUnitValue);
            } else {
                // Check if it matches number + two letters (like 100px)
                const isNumberWithUnit = /^\d*\.?\d+[a-zA-Z]{2}$/.test(value);
                if (isNumberWithUnit) {
                    setHeightValue(Decimal(value.slice(0, -2)));
                    tempHeight = Decimal(value.slice(0, -2));
                    setVisualHeightValue(value.slice(0, -2) + selectedUnitValue);
                } else {
                    const numbersThenCharacters = /^\d*\.?\d+[a-zA-Z]+$/.test(value);
                    if (numbersThenCharacters) {
                        setHeightValue(Decimal(value.replace(/[a-zA-Z]+$/, '')));
                        tempHeight = Decimal(value.replace(/[a-zA-Z]+$/, ''))
                        setVisualHeightValue(value.replace(/[a-zA-Z]+$/, '') + selectedUnitValue);
                    } else {
                        const numbersOnly = value.replace(/[a-zA-Z]/g, '');
                        if (numbersOnly === ""){
                            setHeightValue(Decimal(0));
                            tempHeight = Decimal(0)
                            setVisualHeightValue("");
                        } else {
                            setHeightValue(Decimal(numbersOnly));
                            tempHeight = Decimal(numbersOnly);
                            setVisualHeightValue(numbersOnly + selectedUnitValue);
                        }
                    } 
                }
            }
            checkIfFileDimensionNeedsUpdating(widthValue, tempHeight);
        }
    };

    const hasOrintationNeedUpdating = () => {
        if (widthValue !== null && heightValue !== null){
            if (widthValue.lte(heightValue)) {
                if (!isVerticleOrintationSelected) {
                    setIsVerticleOrintationSelected(!isVerticleOrintationSelected);
                }
            } else {
                if (isVerticleOrintationSelected) {
                    setIsVerticleOrintationSelected(!isVerticleOrintationSelected);
                }
            } 
        }
    }

    useEffect(() => {
        hasOrintationNeedUpdating();
    }, [widthValue, heightValue]);

    const checkIfFileDimensionNeedsUpdating = (recentWidth: Decimal | null, recentHeight: Decimal | null) => {
        if (recentWidth !== null && recentHeight !== null && recentWidth !== Decimal(0) && recentHeight !== Decimal(0)){
            for (const [paperSizeName, sizes] of Object.entries(paperSizes)) {
                for (const size of sizes) {
                    if (
                        size.unit === selectedUnitValue &&
                        size.width.equals(recentWidth) &&
                        size.height.equals(recentHeight)
                    || 
                        size.unit === selectedUnitValue &&
                        size.width.equals(recentHeight) &&
                        size.height.equals(recentWidth)
                    ) {
                        console.log(paperSizeName);
                        if (selectedFileDimension != paperSizeName){
                            setSelectedFileDimension(paperSizeName);
                        }
                        return;
                    }
                }
            }
            
            if (selectedFileDimension != "Custom"){
                setSelectedFileDimension("Custom");
            }
        }
    }

    const firstQuestionDiv = useRef<HTMLDivElement>(null);
    const firstQuestionLeft = useRef<HTMLButtonElement>(null);
    const firstQuestionRight = useRef<HTMLButtonElement>(null);
    const createFormDiv = useRef<HTMLDivElement>(null);
    const uploadPaperFormDiv = useRef<HTMLDivElement>(null);

    const questionToCreatePaperTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = createFormDiv.current!;
        
        boxLeft.classList.remove('createNewPaperButtonWrapper');
        boxRight.classList.remove('createNewPaperButtonWrapper');
        boxLeft.classList.remove('fadeInTransition');
        boxRight.classList.remove('fadeInTransition');

        boxLeft.classList.add('fadeOutTransition');
        boxRight.classList.add('fadeOutTransition');

        void boxLeft.offsetWidth;
        void boxRight.offsetWidth;

        setTimeout(() => {
            firstDiv.classList.add("hidden");
            formDiv.classList.remove("hidden");
            formDiv.classList.add("flex");
            formDiv.classList.add("fadeInTransition");
            void formDiv.offsetWidth;
            updateOrintationBorderPosition();
        }, 400);
    }

    const createPaperToQuestionTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = createFormDiv.current!;

        formDiv.classList.remove('fadeInTransition');
        formDiv.classList.add('fadeOutTransition');
        void formDiv.offsetWidth;


        setTimeout(() => {
            firstDiv.classList.remove("hidden");
            boxLeft.classList.remove('fadeOutTransition');
            boxRight.classList.remove('fadeOutTransition');
            boxLeft.classList.add('fadeInTransition');
            boxRight.classList.add('fadeInTransition');
            void boxLeft.offsetWidth;
            void boxRight.offsetWidth;
        }, 400);
    }

    const questionToUploadPaperTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = uploadPaperFormDiv.current!;
        
        boxLeft.classList.remove('createNewPaperButtonWrapper');
        boxRight.classList.remove('createNewPaperButtonWrapper');
        boxLeft.classList.remove('fadeInTransition');
        boxRight.classList.remove('fadeInTransition');

        boxLeft.classList.add('fadeOutTransition');
        boxRight.classList.add('fadeOutTransition');

        void boxLeft.offsetWidth;
        void boxRight.offsetWidth;

        setTimeout(() => {
            firstDiv.classList.add("hidden");
            formDiv.classList.remove("hidden");
            formDiv.classList.add("flex");
            formDiv.classList.add("fadeInTransition");
            void formDiv.offsetWidth;
        }, 400);
    }

    const uploadPaperToQuestionTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = uploadPaperFormDiv.current!;

        formDiv.classList.remove('fadeInTransition');
        formDiv.classList.add('fadeOutTransition');
        void formDiv.offsetWidth;


        setTimeout(() => {
            firstDiv.classList.remove("hidden");
            boxLeft.classList.remove('fadeOutTransition');
            boxRight.classList.remove('fadeOutTransition');
            boxLeft.classList.add('fadeInTransition');
            boxRight.classList.add('fadeInTransition');
            void boxLeft.offsetWidth;
            void boxRight.offsetWidth;
        }, 400);
    }


    const [isVerticleOrintationSelected, setIsVerticleOrintationSelected] = useState(true);
    const orintationButtonBorderRef = useRef<HTMLDivElement>(null);
    const orintationButtonContainerRef = useRef<HTMLDivElement>(null);
    const orintationLandscapeWordRef = useRef<HTMLSpanElement>(null);
    const orintationVerticleWordRef = useRef<HTMLSpanElement>(null);

    const updateOrintationBorderPosition = () => {
        if (!orintationButtonBorderRef.current || !orintationLandscapeWordRef.current || !orintationVerticleWordRef.current) return;

        const targetWord = isVerticleOrintationSelected ? orintationLandscapeWordRef.current : orintationVerticleWordRef.current;
        orintationButtonBorderRef.current.style.width = `${targetWord.offsetWidth}px`;
        orintationButtonBorderRef.current.style.left = `${targetWord.offsetLeft}px`;
    };

    useEffect(() => {
        updateOrintationBorderPosition();
        window.addEventListener('resize', updateOrintationBorderPosition);
        
        return () => {
        window.removeEventListener('resize', updateOrintationBorderPosition);
        };
    }, [isVerticleOrintationSelected]);

    const switchWidthAndHeight = () => {
        if (visualWidthValue !== "" && visualHeightValue !== "") {
            const tempWidth = widthValue;
            const tempHeight = heightValue;
            const tempVisualWidth = visualWidthValue;
            const tempVisualHeight = visualHeightValue;
            setWidthValue(tempHeight);
            setHeightValue(tempWidth);
            setVisualWidthValue(tempVisualHeight !== null ? tempVisualHeight.toString() : "");
            setVisualHeightValue(tempVisualWidth !== null ? tempVisualWidth.toString() : "");
        }
    }

    const createButtonPressed = () => {
        let validation = true;

        if (fileNameValue === null || fileNameValue === "") {
            validation = false;
            if (fileNameRef.current) {
                fileNameRef.current.classList.add('shake');
                fileNameRef.current.addEventListener(
                    'animationend',
                    () => {
                    fileNameRef.current?.classList.remove('shake');
                    },
                    { once: true }
                );
            }
        }

        if (widthValue === null || visualWidthValue === "") {
            validation = false;
            if (widthInputRef.current) {
                widthInputRef.current.classList.add('shake');
                widthInputRef.current.addEventListener(
                    'animationend',
                    () => {
                    widthInputRef.current?.classList.remove('shake');
                    },
                    { once: true }
                );
            }
        }

        if (heightValue === null || visualHeightValue === "") {
            validation = false;
            if (heightInputRef.current) {
                heightInputRef.current.classList.add('shake');
                heightInputRef.current.addEventListener(
                    'animationend',
                    () => {
                    heightInputRef.current?.classList.remove('shake');
                    },
                    { once: true }
                );
            }
        }

        if (validation && widthValue != null && heightValue != null) {
            const widthValueToSend = convertUnitDecimal(widthValue, selectedUnitValue as Units, "px" as Units)
            const heightValueToSend = convertUnitDecimal(heightValue, selectedUnitValue as Units, "px" as Units)
            setPageFormatData({ 
                newProject: true,
                projectName: fileNameValue,
                fileDimension: selectedFileDimension,
                width: widthValueToSend,
                height: heightValueToSend,
                visualWidth: visualWidthValue,
                visualHeight: visualHeightValue,
            });
            setFile(null);
            router.push("/editor");
        }
    } 
   
    return (
    <>
    <div id="wholeContainer" className="w-full h-full flex">
        {/* Setup Questions */}
        <div onClick={() => router.push('/')} className="absolute bg-background z-[1] w-[3rem] sm:w-[3.5rem] lg:w-[4rem] h-[3rem] sm:h-[3.5rem] lg:h-[4rem] top-3 left-3 p-2 border-2 border-primary rounded-lg hover:shadow-[0_0_0_0.5rem_theme('colors.red')] transition-all duration-300 cursor-pointer">
                <ArrowIcon className='w-full h-full'/>
        </div>
        {/* Setup Questions */}
        <div ref={firstQuestionDiv} className="absolute w-full h-full flex justify-center items-center">
            {/* First option: new paper or continue */}
            <div className="flex flex-col sm:flex-row w-[80%] sm:w-[65%] lg:w-[50%] h-[20%] sm:h-[30%] lg:h-[40%] m-4 gap-8">
                <button ref={firstQuestionLeft} onClick={questionToCreatePaperTransition} className="createNewPaperButtonWrapper bg-background relative hover:shadow-[0_0_0_1rem_theme('colors.accent')] transition-all duration-300 ease-in-out border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Create New Paper
                </button>
                <button ref={firstQuestionRight} onClick={questionToUploadPaperTransition} className="uploadPaperButtonWrapper bg-background relative hover:shadow-[0_0_0_1rem_theme('colors.contrast')] transition-all duration-300 ease-in-out border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Upload a Paper
                </button>
            </div>
        </div>
        {/* Create paper page */}
        <div ref={createFormDiv} className="absolute hidden flex-col w-full h-full flex justify-center items-center">
            {/* First option: new paper or continue */}
            <div className="flex flex-col bg-background w-[80%] sm:w-[65%] lg:w-[50%] m-2  border-4 border-primary rounded-lg justify-center items-center">
                <div className='flex flex-col p-8 gap-6'>
                    <p className='text-center text-primary w-full text-xl sm:text-2xl lg:text-3xl font-bold'>Create File</p>
                    <div className="inline-flex items-center space-x-4">
                        <p className="text-primary">File Name:</p>
                        <input ref={fileNameRef} type="text" value={fileNameValue} onChange={handleFileNameChange} className="w-full max-w-[15rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder="Maths Exam" />
                    </div>
                    <div className='inline-flex items-center space-x-4'>
                        <p className="text-primary">File Dimension:</p>
                        <select id="fileDimensionDropBox" value={selectedFileDimension} onChange={setFileDimension} className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                            <option value="Custom">Custom</option>
                            <option value="A3">A3</option>
                            <option value="A4">A4</option>
                            <option value="A5">A5</option>
                        </select>
                        <p className="text-primary">Units:</p>
                        <select onChange={handleUnitChange} value={selectedUnitValue} className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                            <option value="px">px</option>
                            <option value="in">in</option>
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                        </select>
                    </div>
                    <div className='inline-flex items-center space-x-4'>
                        <p className="text-primary">Width:</p>
                        <input ref={widthInputRef} type="text" value={visualWidthValue} onChange={handleWidthChange} onBlur={handleWidthBlur} className="w-full max-w-[6rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder={widthPlaceHolder} />
                        <p className="text-primary">Height:</p>
                        <input ref={heightInputRef} type="text" value={visualHeightValue} onChange={handleHeightChange} onBlur={handleHeightBlur} className="w-full max-w-[6rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder={heightPlaceHolder} />
                    </div>
                    <div className='flex justify-center items-center'>
                        <div ref={orintationButtonContainerRef} onClick={switchWidthAndHeight} className='relative inline-block rounded-full cursor-pointer select-none mb-2'>
                            <div ref={orintationButtonBorderRef} className="absolute bg-transparent z-10 top-0 h-8 border-primary border-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-[0_0_0_0.4rem_theme('colors.accent')] hover:outline-none"></div>
                            <span ref={orintationLandscapeWordRef} className='relative top-1 px-3'>Vertical</span>
                            <span ref={orintationVerticleWordRef} className='relative top-1 px-3'>Landscape</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex w-[80%] sm:w-[65%] lg:w-[50%] h-[8%] sm:h-[8%] lg:h-[10%]'>
                <button onClick={createPaperToQuestionTransition} className="flex bg-background m-2 ml-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.contrast')] transition-all duration-300">
                    <ArrowIcon className='w-full h-full'/>
                </button>
                <button onClick={createButtonPressed} className="flex flex-grow bg-background w-full m-2 mr-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.accent')] transition-all duration-300 ease-in-out">
                    <p className='text-primary text-center text-lg sm:text-1xl lg:text-2xl font-bold'>Create</p>
                </button>
            </div>
        </div>

        {/* Upload paper page */}
        <div ref={uploadPaperFormDiv} className="absolute hidden flex-col w-full h-full flex justify-center items-center">
            {/* First option: new paper or continue */}
            <div className="flex flex-col relative bg-background w-[80%] sm:w-[65%] lg:w-[50%] m-2 border-4 border-primary rounded-lg justify-center items-center">
                <div className='flex flex-col p-8 gap-6'>
                    <p className='text-center text-primary w-full text-xl sm:text-2xl lg:text-3xl font-bold'>Upload File</p>
                    <p className='text-center text-primary w-full'>Continue editing your file by adding it bellow!</p>
                    <div className="w-full max-w-md ">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-primary border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                                isDragActive ? 'bg-blue-100' : 'bg-white'
                            }`}
                            >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p className="text-blue-700">Drop the file here...</p>
                            ) : (
                                <p className="text-gray-500">Drag & drop a file here, or click to select one</p>
                            )}
                            {file && (
                                <div className="mt-4">
                                <p className="font-semibold">Uploaded File</p>
                                <p>{file.name}</p>
                                <p>{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* TEMPORY UNTILL DEVELOPED */}
                <div className='absolute flex w-full h-full z-10 backdrop-blur-sm items-center justify-center'>
                    <p className='italic text-2xl'>Coming soon!</p>
                </div>
            </div>
            <div className='flex w-[80%] sm:w-[65%] lg:w-[50%] h-[8%] sm:h-[8%] lg:h-[10%]'>
                <button onClick={uploadPaperToQuestionTransition} className="flex bg-background m-2 ml-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.accent')] transition-all duration-300">
                    <ArrowIcon className='w-full h-full'/>
                </button>
                <button onClick={() => router.push("/editor")} className="flex w-full bg-background m-2 mr-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.contrast')] transition-all duration-300 ease-in-out">
                    <p className='text-primary text-center text-lg sm:text-1xl lg:text-2xl font-bold'>Start</p>
                </button>
            </div>
        </div>
    </div>
    <div className='absolute flex bottom-0 left-0 right-0 items-center justify-center z-10000 max-h-[15%]'>
        <Advert slot="6394473175" />
    </div>
    </>
);
}