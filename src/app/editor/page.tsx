// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import useBeforeUnload from '@/components/useBeforeUnload';
import { useState, useEffect, useRef } from 'react';
import { useData } from "@/context/dataContext";
import AllStages from '@/components/allStages';
import HoverExplainButton from '@/components/hoverExplainButton';
import '@/styles/editor.css';

import { addPageElement, addPageElementsInfo, addStage, addStageCopyPrevious, deleteAll, duplicatePageElement, duplicatePageElementsInfo, getEstimatedPage, getPageElements, RENDER_PAGE, stagesLength } from '@/lib/stageStore';
import QuestionCreator from '@/components/questionCreator';
import { ShapeData } from '@/lib/shapeData';
import EditorSidePanel from '@/components/editorSidePanel';
import ExportPage from '@/components/exportPage';
import { useFileStore } from '@/store/useFileStore';
import { NotificationProvider } from '@/context/notificationContext';

import * as pdfjsLib from 'pdfjs-dist';
import { useNotification } from '@/context/notificationContext';
import AddShapeDropDown from '@/components/addShapeDropDown';
import TemplatePage from '@/components/templatePage';
import { AddImage } from '@/components/addImage';
import Advert from '@/components/advert';
import Konva from 'konva';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.mjs`;

function EditorPage() {
    useBeforeUnload(false); //TEMP change to true

    const { notify } = useNotification();

    const [showAddImagePage, setShowAddImagePage] = useState<boolean>(false);
    const [showExportPage, setShowExportPage] = useState<boolean>(false);
    const [showPremadePage, setShowPremadePage] = useState<boolean>(false);

    const [projectNameValue, setProjectNameValue] = useState<string>("");
    const [actionWindow, setActionWindow] = useState(true);

    const { pageFormatData } = useData();
    const fileUploaded = useFileStore((state) => state.file);

    const [leftSidePanelToggle, setLeftSidePanelToggle] = useState<boolean>(true);

    const transformerRef = useRef<Konva.Transformer | null>(null);
    const selectedQuestionId = useRef<{ groupID: number | null; page: number | null; transformerRef: React.RefObject<Konva.Transformer | null>}>({
        groupID: null,
        page: null,
        transformerRef,
    });
    const editButtonRef = useRef(null);
    const duplicateButtonRef = useRef(null);

    const [showQuestionCreator, setShowQuestionCreator] = useState<boolean>(false);
    const [newQuestionCreating, setNewQuestionCreating] = useState<boolean>(false);
    const [questionCreatorShapes, setQuestionCreatorShapes] = useState<ShapeData[]>([]);
    const [questionEditingID, setQuestionEditingID] = useState<{ groupID: number | null; page: number | null }>({
        groupID: null,
        page: null,
    });
    const handleQuestionCreatorOpen = () => setShowQuestionCreator(true);
    const handleQuestionCreatorClose = () => setShowQuestionCreator(false);

    const [manualScaler, setManualScaler] = useState(1);

    const manualScaleUpHandler = () => {
        setManualScaler(manualScaler + 0.1);
    }

    const manualScaleDownHandler = () => {
        if (manualScaler > 0.2) {
            setManualScaler(manualScaler - 0.1);
        }
    }

    useEffect(() => {
        if (stagesLength() === 0 && !fileUploaded){
            if (pageFormatData?.newProject != null && pageFormatData?.projectName != null ) {
                setProjectNameValue(pageFormatData.projectName);
            }
            console.log("DEFAULT ADD PAGE");
            const width = pageFormatData?.width != null
                ? Math.round(Number(pageFormatData.width))
                : Number(2480);

            const height = pageFormatData?.height != null
                ? Math.round(Number(pageFormatData.height))
                : Number(3508);

            const backgroundColor = '#ffffff';

            addStage({
                id: `stage-${Date.now()}`,
                width: width,
                height: height,
                background: backgroundColor,
            });
            RENDER_PAGE();            
        }
    }, [pageFormatData, fileUploaded]);

    const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(fileUploaded !== null ? true : false);
    const wholeLoadingBarDiv = useRef<HTMLDivElement>(null);
    const progressBarDiv = useRef<HTMLDivElement>(null);
    const progressText = useRef<HTMLParagraphElement>(null);

    const renderPdf = async (file: File) => {
        deleteAll();

        const imagePromises: Promise<null>[] = [];
        const loadImage = (pageNumber: number, elementIndex: number, element: PdfImageItem ): Promise<null> => {
            return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.src = element.data;
                img.onload = () => {
                    const newImageShape: ShapeData = {
                                id: 'i'+Date.now()+"-"+pageNumber+"-"+elementIndex,
                                type: 'image',
                                x: 0,
                                y: 0,
                                width: element.width,
                                height: element.height,
                                rotation: 0,
                                fill: '',
                                stroke: '',
                                strokeWidth: 0,
                                image: img,
                                cornerRadius: 0,
                            };
                            addPageElement([newImageShape], pageNumber);
                            addPageElementsInfo({x: element.x, y: element.y, widestX: element.width, widestY: element.height}, pageNumber);
                    resolve(null)
                };
                img.onerror = (err) => reject(err);
            });
        };

        const formData = new FormData();
        formData.append("file", file);

        if (progressBarDiv.current && progressText.current) {
            progressBarDiv.current.style.width = '5%';
            progressText.current.innerText = 'Waiting for server to read file...';
        }  


        try {
            const res = await fetch("http://localhost:8000/parse-pdf", { // BEFORE RELEASE UPDATE
                method: "POST",
                body: formData,
            });

            console.log(res);
            if (res.status !== 200 ) {
                serverFailAction();
                return;
            }

            const data = (await res.json()) as PdfParseResponse;
            console.log(data);

            if (progressBarDiv.current && progressText.current) {
                progressBarDiv.current.style.width = '10%';
                progressText.current.innerText = 'File recieved...';
            }

            const totalPages = data.pages.length
            const percentagePerElement = (98 - 10) / totalPages;

            data.pages.forEach((page) => {
                
                const pageNumber = page.page;
                if (progressBarDiv.current && progressText.current) {
                    progressBarDiv.current.style.width = ((10+pageNumber+1) * percentagePerElement) + '%';
                    progressText.current.innerText = 'Drawing elements '+pageNumber+'/'+totalPages+'...';
                }
                addStage({
                    id: `stage-${Date.now()}-`+pageNumber,
                    width: page.width,
                    height: page.height,
                    background: "white",
                });
                page.content.forEach((element, elementIndex) => {
                    switch (element.type) {
                        case "text":
                            const newText: ShapeData = { 
                                id: 't'+Date.now()+"-"+pageNumber+"-"+elementIndex,
                                type: 'text',
                                x: 0,
                                y: 0,
                                text: element.text,
                                width: element.width,
                                height: element.height,
                                rotation: 0,
                                fontSize: element.font_size,
                                fill: element.fill,
                                background:  '',
                                stroke: element.stroke,
                                strokeWidth: 1,
                                align: "left",
                                border: "",
                                borderWeight: 0,
                            };
                            addPageElement([newText], pageNumber);
                            addPageElementsInfo({x: element.x, y: element.y, widestX: element.width, widestY: element.height}, pageNumber);
                            break;
                        case "img":
                            imagePromises.push(loadImage(pageNumber, elementIndex, element));
                            break;
                        case "path":
                            const newPath: ShapeData = { 
                                id: 'p'+Date.now()+"-"+pageNumber+"-"+elementIndex,
                                type: 'path',
                                x: 0,
                                y: 0,
                                width: element.width,
                                height: element.height,
                                rotation: 0,
                                fill: element.fill,
                                stroke: element.stroke,
                                strokeWidth: 0,
                                data: element.path,
                            };
                            addPageElement([newPath], pageNumber);
                            addPageElementsInfo({x: element.x, y: element.y, widestX: element.width, widestY: element.height}, pageNumber);
                            break;
                    }
                })
            })

            if (progressBarDiv.current && progressText.current) {
                progressBarDiv.current.style.width = '98%';
                progressText.current.innerText = 'Rendering images...';
            }

            await Promise.all(imagePromises);

            if (progressBarDiv.current && progressText.current) {
                progressBarDiv.current.style.width = '99%';
                progressText.current.innerText = 'Rendering elements...';
            }

            RENDER_PAGE();
            setShowLoadingScreen(false);

            if (progressBarDiv.current && progressText.current) {
                progressBarDiv.current.style.width = '99%';
                progressText.current.innerText = 'Finished rendering file...';
            }
        } catch {
            serverFailAction();
        }

    };

    useEffect(() => {
        if (fileUploaded != null) {
            if (fileUploaded && fileUploaded.name.endsWith('.pdf')) {
                setProjectNameValue(fileUploaded.name.slice(0, -4));
                if (progressBarDiv.current && progressText.current) {
                    progressBarDiv.current.style.width = '1%';
                    progressText.current.innerText = 'Opening pdf file...';
                }
                renderPdf(fileUploaded);
            } else {
                setShowLoadingScreen(false);

                addStage({
                    id: `stage-${Date.now()}`,
                    width: 2480,
                    height: 3508,
                    background: '#ffffff',
                });

                notify('error', 'File format not recognised');
                RENDER_PAGE();      
            }
        } else {
            setShowLoadingScreen(false);
        }
    }, [fileUploaded])

    const serverFailAction = () => {
        notify('error', 'Server side fail, please try again later');
        addStage({
            id: `stage-${Date.now()}`,
            width: 2480,
            height: 3508,
            background: '#ffffff',
        });
        RENDER_PAGE();
        setShowLoadingScreen(false);
    }


    const newPageButtonHandler = () => {
        addStageCopyPrevious(`stage-${Date.now()}`);
        RENDER_PAGE()
    }

    const fileNameOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        const sanitizedValue = rawValue
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '');

        setProjectNameValue(sanitizedValue);
    }

    const createQuestionButtonHandler = () => {
        setQuestionCreatorShapes([]);
        setNewQuestionCreating(true);
        handleQuestionCreatorOpen();
    }

    const editQuestionButtonHandler = (passedPage?: number, passedGroupID?:number) => {
        if (passedPage !== undefined && passedGroupID  !== undefined) {
            setNewQuestionCreating(false);
            const pageElements = getPageElements();
            setQuestionEditingID({groupID: passedGroupID, page: passedPage})
            setQuestionCreatorShapes(pageElements[passedPage][passedGroupID]);
            handleQuestionCreatorOpen();
            return;
        }

        const currentSelectValues = selectedQuestionId.current;

        if (currentSelectValues.page !== null && currentSelectValues.groupID !== null){
            setNewQuestionCreating(false);
            const pageElements = getPageElements();
            setQuestionEditingID({groupID: currentSelectValues.groupID, page: currentSelectValues.page})
            setQuestionCreatorShapes(pageElements[currentSelectValues.page][currentSelectValues.groupID]);
            handleQuestionCreatorOpen();
            selectedQuestionId.current = {page: null, groupID: null, transformerRef: useRef(null)};
        } else {
            notify('info', 'Please select an element');
        }
    }

    const duplicateQuestionButtonHandler = () => {
        const currentSelectValues = selectedQuestionId.current;
        if (currentSelectValues.page !== null && currentSelectValues.groupID !== null){
            duplicatePageElementsInfo(currentSelectValues.page, currentSelectValues.groupID);
            duplicatePageElement(currentSelectValues.page, currentSelectValues.groupID);
            RENDER_PAGE();
            selectedQuestionId.current = {page: null, groupID: null, transformerRef: useRef(null)};
        } else {
            notify('info', 'Please select an element');
        }
    }

    const premadeButtonHandler = () => {
        setShowPremadePage(true);
    }

    const addTextToPageButtonHandler = () => {
        const pageToAddIt = getEstimatedPage();
        const newText: ShapeData = {
            id: 't'+Date.now(),
            type: 'text',
            x: 0,
            y: 0,
            text: 'Double Click to Edit!',
            width: 570,
            height: 60,
            rotation: 0,
            fontSize: 12,
            fill: 'black',
            background: '',
            stroke: '',
            strokeWidth: 1,
            align: "left",
            border: "",
            borderWeight: 0,
        };
        addPageElementsInfo({widestX: newText.width, widestY: newText.height, x:0, y:0}, pageToAddIt);
        addPageElement([newText], pageToAddIt);
        RENDER_PAGE();
    }

    const showAddImageHandler = () => {
        setShowAddImagePage(true);
    }

    const undoActionButtonHandler = () => {
        
    }

    const redoActionButtonHandler = () => {
        
    }

    return (
    <>
    {showLoadingScreen && (
        <div className='absolute flex flex-col w-full h-full left-0 right-0 top-0 bottom-0 backdrop-blur-md items-center justify-center z-50 text-primary'>
            <h1 className='text-center text-6xl font-nunito'>Examiniser</h1>
            <div className='relative m-16 items-center justify-center'>
                <div className="upload-loader">
                    <div className="upload-box upload-box-1">
                        <div className="upload-side-left"></div>
                        <div className="upload-side-right"></div>
                        <div className="upload-side-top"></div>
                    </div>
                    <div className="upload-box upload-box-2">
                        <div className="upload-side-left"></div>
                        <div className="upload-side-right"></div>
                        <div className="upload-side-top"></div>
                    </div>
                    <div className="upload-box upload-box-3">
                        <div className="upload-side-left"></div>
                        <div className="upload-side-right"></div>
                        <div className="upload-side-top"></div>
                    </div>
                    <div className="upload-box upload-box-4">
                        <div className="upload-side-left"></div>
                        <div className="upload-side-right"></div>
                        <div className="upload-side-top"></div>
                    </div>
                </div>
            </div>
            <p className='italic'>Loading file into editor...</p>
            <div ref={wholeLoadingBarDiv} className='flex relative w-[90vw] sm:w-[80vw] md:w-[75vw] lg:w-[70vw] h-8 rounded-full border-2 border-primary'>
                <div ref={progressBarDiv} style={{width: '0%'}} className='absolute top-0 left-0 bottom-0 bg-contrast rounded-full' />
                <p ref={progressText} className='absolute flex top-0 bottom-0 left-0 right-0 text-center items-center justify-center'></p>
            </div>
            
            <div className='absolute flex bottom-0 left-0 right-0 items-center justify-center z-10000 max-h-[15%]'>
                <Advert slot="2931099214" />
            </div>
        </div>
    )}
    {showQuestionCreator && <QuestionCreator onClose={handleQuestionCreatorClose} newQuestionCreating={newQuestionCreating} shapes={questionCreatorShapes} setShapes={setQuestionCreatorShapes} questionEditingID={questionEditingID}/>}
    <div className="flex flex-col w-full h-full">
        <div className="flex h-12 border-b-1 border-primary">
            <div className='flex m-1'>
                <input className='border-2 bg-background border-background rounded-lg p-1 text-ellipsis overflow-hidden whitespace-nowrap outline-none focus:border-accent' type="text" onChange={fileNameOnChangeHandler} onBlur={(e) => {e.target.setSelectionRange(0, 0);}} value={projectNameValue} placeholder='Project Name'></input>
            </div>
            <div className='flex items-center justify-center'>
                <HoverExplainButton
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className='p-1' viewBox="0 0 24 24"><path d="M12 0c-3.31 0-6.291 1.353-8.459 3.522l-2.48-2.48-1.061 7.341 7.437-.966-2.489-2.488c1.808-1.808 4.299-2.929 7.052-2.929 5.514 0 10 4.486 10 10s-4.486 10-10 10c-3.872 0-7.229-2.216-8.89-5.443l-1.717 1.046c2.012 3.803 6.005 6.397 10.607 6.397 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/></svg>}
                    explanation={'Undo'}
                    onClick={undoActionButtonHandler}
                />
                <HoverExplainButton
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className='p-1' viewBox="0 0 24 24"><path d="M12 0c3.31 0 6.291 1.353 8.459 3.522l2.48-2.48 1.061 7.341-7.437-.966 2.489-2.489c-1.808-1.807-4.299-2.928-7.052-2.928-5.514 0-10 4.486-10 10s4.486 10 10 10c3.872 0 7.229-2.216 8.89-5.443l1.717 1.046c-2.012 3.803-6.005 6.397-10.607 6.397-6.627 0-12-5.373-12-12s5.373-12 12-12z"/></svg>}
                    explanation={'Redo'}
                    onClick={redoActionButtonHandler}
                />
                <HoverExplainButton
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-7 5v2h-15v-24h10.189c3.163 0 9.811 7.223 9.811 9.614v2.386h-2v-1.543c0-4.107-6-2.457-6-2.457s1.518-6-2.638-6h-7.362v20h13z"/></svg>}
                    explanation={'Add new page'}
                    onClick={newPageButtonHandler}
                />
                <HoverExplainButton
                    icon={<svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/></svg>}
                    explanation={'Add Text'}
                    onClick={addTextToPageButtonHandler}
                />
                <HoverExplainButton
                    icon={<svg className='h-full p-[2px]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/></svg>}
                    explanation={'Add Image'}
                    onClick={showAddImageHandler}
                />
                {showAddImagePage && (<AddImage onClose={() => setShowAddImagePage(false)} showAdvert={true} mainPageMode={true}/>)}

                <AddShapeDropDown />
            </div>
            <span className='flex w-full' />
            <div className='flex items-center justify-center'>
                <HoverExplainButton
                    icon={<svg className='p-1' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007zm3.256 6.26h-6.5c-.414 0-.75.336-.75.75s.336.75.75.75h6.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" fillRule="nonzero"/></svg>}
                    explanation={'Zoom out'}
                    onClick={manualScaleDownHandler}
                />
                <p onClick={() => setManualScaler(1)} className='flex h-full text-center justify-center items-center'>{Math.round(manualScaler*100)}%</p>
                <HoverExplainButton
                    icon={<svg className='p-1'  clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007zm-.744 6.26h-2.5c-.414 0-.75.336-.75.75s.336.75.75.75h2.5v2.5c0 .414.336.75.75.75s.75-.336.75-.75v-2.5h2.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-2.5v-2.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>}
                    explanation={'Zoom in'}
                    onClick={manualScaleUpHandler}
                />
            </div>
            <div className='flex m-2'>
                <button className='h-full flex border border-primary rounded-lg p-2 items-center justify-center text-center' onClick={() => setShowExportPage(true)}>
                    Export
                </button>
                {showExportPage && (<ExportPage onClose={() => setShowExportPage(false)} exportFileName={projectNameValue}/>)}
            </div>
        </div>
        <div className="w-full h-full flex overflow-hidden">
            <div className='flex flex-col h-full w-[12rem]'>
                <div className='flex w-full'>
                    <button className='flex flex-col flex-1 p-1 border border-grey border-l-0 text-center items-center justify-center' onClick={() => setLeftSidePanelToggle(true)}>
                        Preview
                        <div className={`flex w-full justify-center`}>
                            <div className={`mx-2 ${leftSidePanelToggle ? 'w-full' : 'w-0'} bg-accent h-1 rounded-full transition-all duration-300`}></div>
                        </div>
                    </button>
                    <button className='flex flex-col flex-1 p-1 border border-grey border-r-0 text-center items-center justify-center' onClick={() => setLeftSidePanelToggle(false)}>
                        Editor
                        <div className={`flex w-full justify-center`}>
                            <div className={`flex mx-2 ${!leftSidePanelToggle ? 'w-full' : 'w-0'} bg-contrast h-1 rounded-full transition-all duration-300`}></div>
                        </div>
                    </button>
                </div>
                <div className='flex w-[12rem] h-full items-start justify-start overflow-y-auto'>
                {leftSidePanelToggle ? (
                    <AllStages previewStyle={true}/>
                ) : (
                    <EditorSidePanel />
                )}
                </div>
            </div>
            <div className="flex bg-grey w-full items-center justify-center">
                <AllStages manualScaler={manualScaler} selectedId={selectedQuestionId} previewStyle={false} editQuestionButtonHandler={editQuestionButtonHandler} actionWindow={actionWindow}/>
            </div>
            <div
                className={`flex flex-col text-primary transition-width duration-300 ease-in-out h-full
                    ${!actionWindow ? 'w-16' : 'w-56'}`}
                >
                <button
                    onClick={() => setActionWindow(!actionWindow)}
                    className="p-4 focus:outline-none"
                >
                    {!actionWindow ? 
                    (<svg className='w-8 h-8' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fillRule="nonzero"/></svg>) 
                    : 
                    (<div className='w-full'>
                        <svg className='w-8 h-8' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fillRule="nonzero"/></svg>
                    </div>)}
                </button>

                <nav className="w-full mt-4">
                    <button onClick={createQuestionButtonHandler} className="flex text-center items-center justify-start w-full p-3 focus:outline-none">
                        <div className="w-8 h-8 items-center justify-center">
                            <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21 3.998c0-.478-.379-1-1-1h-16c-.62 0-1 .519-1 1v16c0 .621.52 1 1 1h16c.478 0 1-.379 1-1zm-16.5.5h15v15h-15zm6.75 6.752h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>
                        </div>
                        {actionWindow && <span className="ml-3 text-sm lg:text-sm">Add Question</span>}
                    </button>

                    <button ref={editButtonRef} onClick={() => editQuestionButtonHandler()} className="flex text-center items-center justify-start  w-full p-3 focus:outline-none">
                        <div className="w-8 h-8 items-center justify-center">
                            <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.749c0-.414.336-.75.75-.75s.75.336.75.75v9.249c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm1.521 9.689 9.012-9.012c.133-.133.217-.329.217-.532 0-.179-.065-.363-.218-.515l-2.423-2.415c-.143-.143-.333-.215-.522-.215s-.378.072-.523.215l-9.027 8.996c-.442 1.371-1.158 3.586-1.264 3.952-.126.433.198.834.572.834.41 0 .696-.099 4.176-1.308zm-2.258-2.392 1.17 1.171c-.704.232-1.274.418-1.729.566zm.968-1.154 7.356-7.331 1.347 1.342-7.346 7.347z" fillRule="nonzero"/></svg>
                        </div>
                        {actionWindow && <span className="ml-3 text-sm lg:text-sm">Edit Question</span>}
                    </button>

                    <button ref={duplicateButtonRef} onClick={duplicateQuestionButtonHandler} className="flex text-center items-center justify-start  w-full p-3 focus:outline-none">
                        <div className="w-8 h-8 items-center justify-center">
                            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20 20h-15.25c-.414 0-.75.336-.75.75s.336.75.75.75h15.75c.53 0 1-.47 1-1v-15.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75zm-1-17c0-.478-.379-1-1-1h-15c-.62 0-1 .519-1 1v15c0 .621.52 1 1 1h15c.478 0 1-.379 1-1zm-15.5.5h14v14h-14zm6.25 6.25h-3c-.414 0-.75.336-.75.75s.336.75.75.75h3v3c0 .414.336.75.75.75s.75-.336.75-.75v-3h3c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3v-3c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>
                        </div>
                        {actionWindow && <span className="ml-3 text-sm lg:text-sm">Duplicate</span>}
                    </button>
                    
                    <button onClick={premadeButtonHandler} className="flex text-center items-center justify-start  w-full p-3 focus:outline-none">
                        <div className="w-8 h-8 items-center justify-center"> 
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1_38_2" fill="white"><rect x="3" y="3" width="18" height="18" rx="1"/></mask><rect x="3" y="3" width="18" height="18" rx="1" stroke="black" strokeWidth="3" mask="url(#path-1-inside-1_38_2)"/><path d="M7.46967 15.4697C7.17678 15.7626 7.17678 16.2374 7.46967 16.5303C7.76256 16.8232 8.23744 16.8232 8.53033 16.5303L7.46967 15.4697ZM16.75 8C16.75 7.58579 16.4142 7.25 16 7.25H9.25C8.83579 7.25 8.5 7.58579 8.5 8C8.5 8.41421 8.83579 8.75 9.25 8.75H15.25V14.75C15.25 15.1642 15.5858 15.5 16 15.5C16.4142 15.5 16.75 15.1642 16.75 14.75V8ZM8 16L8.53033 16.5303L16.5303 8.53033L16 8L15.4697 7.46967L7.46967 15.4697L8 16Z" fill="black"/></svg>
                        </div>
                        {actionWindow && <span className="ml-3 text-sm lg:text-sm">Templates</span>}
                    </button>
                    {showPremadePage && (<TemplatePage onClose={() => setShowPremadePage(false)} />)}

                </nav>
            </div>
        </div>
    </div>
    </>
    );
}

const PageWithProvider = () => (
  <NotificationProvider>
    <EditorPage />
  </NotificationProvider>
);

export default PageWithProvider;



export interface PdfTextItem {
  type: "text";
  text: string;
  x: number;       // position in px at 300 DPI
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string; // usually null for text
  font_size: number;
  font_family: string;
}

export interface PdfImageItem {
  type: "img";
  x: number;       // position in px at 300 DPI
  y: number;
  width: number;
  height: number;
  data: string;
}

export interface PdfShapeItem {
  type: 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  path: string;
}

export type PdfPageContentItem = PdfTextItem | PdfShapeItem | PdfImageItem;

export interface PdfPage {
  page: number;                // page index starting from 0
  width: number;                // px at 300 DPI
  height: number;               // px at 300 DPI
  content: PdfPageContentItem[]; // text + shapes
}

export interface PdfParseResponse {
  pages: PdfPage[];
}