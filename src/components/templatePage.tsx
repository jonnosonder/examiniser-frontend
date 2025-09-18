// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { useState } from "react";
import { addPageElement, addPageElementsInfo, addToHistoryUndo, getEstimatedPage, getSpecificStage, historyData, pageElementsInfo, RENDER_PAGE, stageGroupInfoData } from "@/lib/stageStore";
import { ShapeData } from "@/lib/shapeData";
import { fontNamesArray } from "@/lib/fontData";
import { useTranslation } from "react-i18next";

type TemplatePageProps = {
  onClose: () => void;
};

const sectionNames = [
    "Headers",
    "First Page",
    "Maths",
]

const TemplatePage: React.FC<TemplatePageProps> = ({ onClose }) => {
    const { t } = useTranslation();

    const [selectedSection, setSelectedSection] = useState<number>(0);
    const pageOn = getEstimatedPage();
    const scale = 300/72;

    const [selectedFontSize, setSelectedFontSize] = useState<number>(12);
    const [selectedFontSizeVisual, setSelectedFontSizeVisual] = useState<string>("12");
    const [selectedFontFamily, setSelectedFontFamily] = useState<string>("Inter");

    function measureTextWidth(text: string, font: string): number {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) return 0;

        context.font = font; // e.g., "12px Arial", "bold 14px sans-serif"
        const metrics = context.measureText(text);
        return metrics.width;
    }

    const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

    const headers_nameAndDateDoted = () => {
        const focusStage = getSpecificStage(pageOn);
        const padding = focusStage.width * 0.1
        const setHeight = round4(selectedFontSize*scale);
        const textName: ShapeData = {
            id: 't'+Date.now(),
            type: 'text',
            x: 0,
            y: 0,
            text: 'Name:................................',
            fontFamily: selectedFontFamily,
            width: measureTextWidth('Name:................................', scale*selectedFontSize+'px Inter-400'),
            height: setHeight,
            rotation: 0,
            fontSize: selectedFontSize,
            fill: 'black',
            background: '',
            stroke: 'black',
            strokeWidth: 0,
            align: "left",
            border: "",
            borderWeight: 0,
        };
        const textDate: ShapeData = {
            id: 't'+Date.now()+1,
            type: 'text',
            x: focusStage.width - measureTextWidth('Date:................................', scale*selectedFontSize+'px Inter-400') - padding*2,
            y: 0,
            text: 'Date:................................',
            fontFamily: selectedFontFamily,
            width: measureTextWidth('Date:................................', scale*selectedFontSize+'px Inter-400'),
            height: setHeight,
            rotation: 0,
            fontSize: selectedFontSize,
            fill: 'black',
            background: '',
            stroke: 'black',
            strokeWidth: 0,
            align: "left",
            border: "",
            borderWeight: 0,
        };
        
        const newGroupInfo = {id: "g-"+Date.now(), widestX:( focusStage.width - (padding*2)), widestY: setHeight, x: padding, y: padding*0.5, rotation: 0} as stageGroupInfoData

        document.fonts.load('12px '+selectedFontFamily).then(() => {
            const newData = [textName, textDate];
            addPageElementsInfo(newGroupInfo, pageOn);
            addPageElement(newData, pageOn);
            RENDER_PAGE();
            addToHistoryUndo({
              command: "create",
              pageIndex: pageOn,
              groupIndex: pageElementsInfo[pageOn].length-1,
              from: {},
              to: newGroupInfo,
              contentsTo: newData
            } as historyData);
            onClose();
        });
    }

    /*
    const headers_nameAndDateLined = () => {
        const focusStage = getSpecificStage(pageOn);
        const padding = focusStage.width * 0.1

        const textName: ShapeData = {
            id: 't'+Date.now(),
            type: 'text',
            x: 0,
            y: 0,
            text: 'Name:',
            fontFamily: 'Inter-400',
            width: measureTextWidth('Name:', scale*12+'px Inter-400'),
            height: 12*scale,
            rotation: 0,
            fontSize: 12,
            fill: 'black',
            background: '',
            stroke: 'black',
            strokeWidth: 0,
            align: "left",
            border: "",
            borderWeight: 0,
        };

        const textDate: ShapeData = {
            id: 't'+Date.now()+1,
            type: 'text',
            x: focusStage.width - measureTextWidth('Date:', scale*12+'px Inter-400') - padding*2,
            y: 0,
            text: 'Date:',
            fontFamily: 'Inter-400',
            width: measureTextWidth('Date:', scale*12+'px Inter-400'),
            height: 12*scale,
            rotation: 0,
            fontSize: 12,
            fill: 'black',
            background: '',
            stroke: 'black',
            strokeWidth: 0,
            align: "left",
            border: "",
            borderWeight: 0,
        };
        
        const newGroupInfo = {id: "g-"+Date.now(), widestX:( focusStage.width - (padding*2)), widestY: 12*scale, x: padding, y: padding*0.5, rotation: 0} as stageGroupInfoData

        document.fonts.load('12px Inter-400').then(() => {
            const newData = [textName, textDate];
            addPageElementsInfo(newGroupInfo, pageOn);
            addPageElement(newData, pageOn);
            RENDER_PAGE();
            addToHistoryUndo({
              command: "create",
              pageIndex: pageOn,
              groupIndex: pageElementsInfo[pageOn].length-1,
              from: {},
              to: newGroupInfo,
              contentsTo: newData
            } as historyData);
            onClose();
        });
    }

    */

    const selectedFontSizeValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numberPattern = /^-?\d*\.?\d+$/;
        if (numberPattern.test(value)) {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
                setSelectedFontSize(numericValue);
                setSelectedFontSizeVisual(value);
            }
        } else if (value == "") {
            setSelectedFontSizeVisual("");
        }
    }

    const onFontFamilySelectChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFontValue = e.target.value;
        setSelectedFontFamily(newFontValue);
    }

    return(
        <div className="absolute flex w-full h-full bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0">
            <div className="flex flex-col h-3/4 w-3/4 bg-background border border-grey shadow rounded-lg">
                <div className='flex w-full items-center justify-between'>
                    <h2 className="w-full p-2 pb-0 text-center text-2xl font-nunito m-0 ">{t('editor.templates')}</h2>
                    <button className='p-2 m-0 ' onClick={onClose}>
                        <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                    </button>
                </div>
                <div className="flex">
                    <p className="text-sm w-full text-center">{t('editor.templates-description')}</p>
                    <span className="flex w-6" />
                </div>
                <div className="flex flex-row w-full h-full m-0">
                    <div className="flex flex-row h-full rounded-tr-2xl border-t border-r border-primary pt-2 pr-2 pl-2 shadow-lg">
                        <div className="flex flex-col items-center justify-start rounded-md scroll-y-auto">
                            {sectionNames.map((name, index) => (
                                <button key={index} className={`${index === selectedSection && 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'} text-left w-full whitespace-nowrap p-2 hover:bg-lightGrey rounded-lg m-1`} onClick={() => setSelectedSection(index)}>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full flex flex-col p-4">
                            {selectedSection === 0 && (
                                <>
                                <div className="flex w-full space-x-2">
                                    <button className="flex flex-row w-1/3 p-4 border border-primary rounded-lg hover:bg-lightGrey" onClick={headers_nameAndDateDoted}>
                                        <p className="text-[1vw] whitespace-nowrap select-none">Name:....................</p>
                                        <span className="w-full" />
                                        <p className="text-[1vw] whitespace-nowrap select-none">Date:....................</p>
                                    </button>
                                    {/* 
                                    <button className="flex flex-row w-1/3 p-4 border border-primary rounded-lg hover:bg-lightGrey" onClick={headers_nameAndDateLined}>
                                        <p className="text-[1vw] whitespace-nowrap select-none">Name:__________</p>
                                        <span className="w-full" />
                                        <p className="text-[1vw] whitespace-nowrap select-none">Date:__________</p>
                                    </button>
                                    */}
                                </div>
                                </>
                            )}
                            {selectedSection !== 0 && (
                                <div className="w-full h-full items-center justify-center p-4">
                                    <p>Email in your ideas to <span onClick={() => window.location.href = `mailto:examiniser@gmail.com`} className='text-blue-500 cursor-pointer'>examiniser@gmail.com</span></p>
                                </div>
                            )}
                        </div>
                        <span className="w-full h-full flex flex-1"/>
                        <div className="w-full flex p-2">
                            <div className="flex border border-primary rounded-lg p-2 space-x-2 items-center justify-center">
                                <div className="flex items-center justify-center">
                                    <p className="mr-2">Font Size</p>
                                    <input value={selectedFontSizeVisual} onChange={selectedFontSizeValueHandler} className="rounded-md w-10 border border-grey px-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.15rem_theme('colors.contrast')] focus:outline-none focus:border-transparent"></input>
                                </div>
                                <div className="flex items-center justify-center">
                                    <p className="whitespace-nowrap mr-2">Font Family</p>
                                    <select className='p-1 flex w-full rounded-md border border-grey' value={selectedFontFamily} onChange={onFontFamilySelectChangeHandler} style={{fontFamily: selectedFontFamily}}>
                                        {fontNamesArray.map((font) => (
                                        <option key={font} value={font} style={{fontFamily: font}}>
                                            {font.replace("-", " ")}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            <div className='absolute bottom-0 items-center justify-center max-h-[10%] z-10000'>
            </div>
        </div>
    );
}

export default TemplatePage;