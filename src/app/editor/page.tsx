"use client";

import useBeforeUnload from '@/components/useBeforeUnload';
import { useState, useEffect, useRef } from 'react';
import Decimal from 'decimal.js';
import { useData } from "@/context/dataContext";
import AllStages from '@/components/allStages';
import HoverExplainButton from '@/components/hoverExplainButton';
import '@/styles/editor.css';

import { addStage, addStageCopyPrevious, getGroups, getStages, stagesLength } from '@/lib/stageStore';
import QuestionCreator from '@/components/questionCreator';
import { ShapeData } from '@/lib/shapeData';
import SidePreview from '@/components/sidePreview';
import EditorSidePanel from '@/components/editorSidePanel';
import ExportPage from '@/components/exportPage';

export default function EditorPage() {
    useBeforeUnload(false); //TEMP change to true

    const [showExportPage, setShowExportPage] = useState<boolean>(false);

    const [projectNameValue, setProjectNameValue] = useState<string>("");
    const [actionWindow, setActionWindow] = useState(true);

    const { pageFormatData } = useData();

    const [leftSidePanelToggle, setLeftSidePanelToggle] = useState<boolean>(true);

    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const editButtonRef = useRef(null);
    const ignoreSelectionArray: React.RefObject<HTMLElement | null>[] = [editButtonRef];

    const [showQuestionCreator, setShowQuestionCreator] = useState<boolean>(false);
    const [newQuestionCreating, setNewQuestionCreating] = useState<boolean>(false);
    const [questionCreatorShapes, setQuestionCreatorShapes] = useState<ShapeData[]>([]);
    const [questionEditingID, setQuestionEditingID] = useState<number | null>(null);
    const handleQuestionCreatorOpen = () => setShowQuestionCreator(true);
    const handleQuestionCreatorClose = () => setShowQuestionCreator(false);

    const cursorDivRef = useRef<HTMLDivElement>(null);
    const [cursorType, setCursorType] = useState<number>(0);
    const defualtCursorRef = useRef<HTMLButtonElement>(null);
    const pageCursorRef = useRef<HTMLButtonElement>(null);

    const [manualScaler, setManualScaler] = useState(1);

    const manualScaleUpHandler = () => {
        setManualScaler(manualScaler + 0.1);
    }

    const manualScaleDownHandler = () => {
        setManualScaler(manualScaler - 0.1);
    }

    useEffect(() => {
        const el = cursorDivRef.current;
        if (!el) return;
        
        if (cursorType === 0) {
            el.className = 'cursor-default';
            el.style.cursor = '';
            if (defualtCursorRef.current){
                defualtCursorRef.current.classList.add('indented-button');
            }
            if (pageCursorRef.current){
                pageCursorRef.current.classList.remove('indented-button');
            }
        } else if (cursorType === 1) {
            el.className = '';
            el.style.cursor = `url("data:image/svg+xml,%3Csvg%20clip-rule%3D%22evenodd%22%20fill-rule%3D%22evenodd%22%20stroke-linejoin%3D%22round%22%20stroke-miterlimit%3D%222%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22m3%2017v3c0%20.621.52%201%201%201h3v-1.5h-2.5v-2.5zm8.5%204h-3.5v-1.5h3.5zm4.5%200h-3.5v-1.5h3.5zm5-4h-1.5v2.5h-2.5v1.5h3c.478%200%201-.379%201-1zm-1.5-1v-3.363h1.5v3.363zm-15-3.363v3.363h-1.5v-3.363zm15-1v-3.637h1.5v3.637zm-15-3.637v3.637h-1.5v-3.637zm12.5-5v1.5h2.5v2.5h1.5v-3c0-.478-.379-1-1-1zm-10%200h-3c-.62%200-1%20.519-1%201v3h1.5v-2.5h2.5zm4.5%201.5h-3.5v-1.5h3.5zm4.5%200h-3.5v-1.5h3.5z%22%20fill-rule%3D%22nonzero%22/%3E%3C/svg%3E") 12 12, auto`;
            if (defualtCursorRef.current){
                defualtCursorRef.current.classList.remove('indented-button');
            }
            if (pageCursorRef.current){
                pageCursorRef.current.classList.add('indented-button');
            }
        }
        
    }, [cursorType])

    useEffect(() => {
        if (stagesLength() === 0){
            const width = pageFormatData?.width != null
                ? Number(pageFormatData.width)
                : Number(new Decimal(210).times(300).div(25.4));

            const height = pageFormatData?.height != null
                ? Number(pageFormatData.height)
                : Number(new Decimal(297).times(300).div(25.4));

            if (pageFormatData?.newProject != null && pageFormatData?.projectName != null ) {
                setProjectNameValue(pageFormatData.projectName);
            }

            const backgroundColor = '#ffffff';

            addStage({
                id: `stage-${Date.now()}`,
                width: width,
                height: height,
                background: backgroundColor,
            });
        }
    }, [pageFormatData]);

    const newPageButtonHandler = () => {
        addStageCopyPrevious(`stage-${Date.now()}`);
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

    const editQuestionButtonHandler = () => {
        if (selectedQuestionId !== null){
            setNewQuestionCreating(false);
            const groups = getGroups();
            setQuestionEditingID(selectedQuestionId)
            setQuestionCreatorShapes(groups[selectedQuestionId]);
            handleQuestionCreatorOpen();
        }
    }

    return (
    <div ref={cursorDivRef} className='cursor-default'>
        {showQuestionCreator && <QuestionCreator onClose={handleQuestionCreatorClose} newQuestionCreating={newQuestionCreating} shapes={questionCreatorShapes} setShapes={setQuestionCreatorShapes} questionEditingID={questionEditingID}/>}
        <div className="flex flex-col w-full h-screen">
            <div className="flex h-10 border-b-1 border-primary">
                <div className='flex m-1'>
                    <input className='border-2 bg-background border-background rounded-lg p-1 text-ellipsis overflow-hidden whitespace-nowrap outline-none focus:border-black' type="text" onChange={fileNameOnChangeHandler} onBlur={(e) => {e.target.setSelectionRange(0, 0);}} value={projectNameValue} placeholder='Project Name'></input>
                </div>
                <div className='flex items-center justify-center border-r-2 border-l-2 border-primary '>
                    <HoverExplainButton
                        icon={<svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20 20h-15.25c-.414 0-.75.336-.75.75s.336.75.75.75h15.75c.53 0 1-.47 1-1v-15.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75zm-1-17c0-.478-.379-1-1-1h-15c-.62 0-1 .519-1 1v15c0 .621.52 1 1 1h15c.478 0 1-.379 1-1zm-15.5.5h14v14h-14zm6.25 6.25h-3c-.414 0-.75.336-.75.75s.336.75.75.75h3v3c0 .414.336.75.75.75s.75-.336.75-.75v-3h3c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3v-3c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>}
                        explanation={'Add new page'}
                        onClick={newPageButtonHandler}
                    />
                    <HoverExplainButton
                        icon={<svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11 11h-7.25c-.414 0-.75.336-.75.75s.336.75.75.75h7.25v7.25c0 .414.336.75.75.75s.75-.336.75-.75v-7.25h7.25c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-7.25v-7.25c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>}
                        explanation={'Zoom in'}
                        onClick={manualScaleUpHandler}
                    />
                    <HoverExplainButton
                        icon={<svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21 11.75c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75z" fillRule="nonzero"/></svg>}
                        explanation={'Zoom out'}
                        onClick={manualScaleDownHandler}
                    />
                </div>

                <div className='flex items-center justify-center border-r-2 border-primary '>
                    <HoverExplainButton
                        ref = {defualtCursorRef}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 4.702z"/></svg>}
                        explanation={'Selector'}
                        onClick={() => setCursorType(0)}
                    />
                    <HoverExplainButton
                        ref = {pageCursorRef}
                        icon={<svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3 17v3c0 .621.52 1 1 1h3v-1.5h-2.5v-2.5zm8.5 4h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5zm5-4h-1.5v2.5h-2.5v1.5h3c.478 0 1-.379 1-1zm-1.5-1v-3.363h1.5v3.363zm-15-3.363v3.363h-1.5v-3.363zm15-1v-3.637h1.5v3.637zm-15-3.637v3.637h-1.5v-3.637zm12.5-5v1.5h2.5v2.5h1.5v-3c0-.478-.379-1-1-1zm-10 0h-3c-.62 0-1 .519-1 1v3h1.5v-2.5h2.5zm4.5 1.5h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5z" fillRule="nonzero"/></svg>}
                        explanation={'Page Editor'}
                        onClick={() => setCursorType(1)}
                    />
                </div>
                <div className='flex m-2'>
                    <button className='h-full' onClick={() => setShowExportPage(true)}>
                        Export
                    </button>
                    {showExportPage && (<ExportPage onClose={() => setShowExportPage(false)}/>)}
                </div>
            </div>
            <div className="flex-1 w-full flex overflow-hidden">
                <div className='h-full w-[12rem]'>
                    <div className='flex w-full'>
                        <button className='flex flex-col flex-1 p-1 border border-grey text-center items-center justify-center' onClick={() => setLeftSidePanelToggle(true)}>
                            Preview
                            <div className={`flex w-full justify-center`}>
                                <div className={`mx-2 ${leftSidePanelToggle ? 'w-full' : 'w-0'} bg-accent h-1 rounded-full transition-all duration-300`}></div>
                            </div>
                        </button>
                        <button className='flex flex-col flex-1 p-1 border border-grey text-center items-center justify-center' onClick={() => setLeftSidePanelToggle(false)}>
                            Editor
                            <div className={`flex w-full justify-center`}>
                                <div className={`flex mx-2 ${!leftSidePanelToggle ? 'w-full' : 'w-0'} bg-contrast h-1 rounded-full transition-all duration-300`}></div>
                            </div>
                        </button>
                    </div>
                    {leftSidePanelToggle ? (
                        <SidePreview />
                    ) : (
                        <EditorSidePanel />
                    )}
                    
                </div>
                <div className="flex-1 bg-grey w-full flex items-center justify-center">
                    <AllStages manualScaler={manualScaler} selectedId={selectedQuestionId} setSelectedId={setSelectedQuestionId} ignoreSelectionArray={ignoreSelectionArray} />
                </div>
                <div className="h-full">
                    <div
                        className={`flex flex-col text-primary transition-width duration-300 ease-in-out h-full
                            ${!actionWindow ? 'w-16' : 'w-48'}`}
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

                        <nav className="flex-1 mt-4">
                            <button onClick={createQuestionButtonHandler} className="flex text-center items-center justify-center w-full p-3 focus:outline-none">
                                <div className="w-8 h-8 text-lg items-center justify-center">
                                    <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21 3.998c0-.478-.379-1-1-1h-16c-.62 0-1 .519-1 1v16c0 .621.52 1 1 1h16c.478 0 1-.379 1-1zm-16.5.5h15v15h-15zm6.75 6.752h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>
                                </div>
                                {actionWindow && <span className="ml-3">Add Question</span>}
                            </button>

                            <button ref={editButtonRef} onClick={editQuestionButtonHandler} className="flex text-center items-center justify-center w-full p-3 focus:outline-none">
                                <div className="w-8 h-8 text-lg items-center justify-center">
                                    <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.749c0-.414.336-.75.75-.75s.75.336.75.75v9.249c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm1.521 9.689 9.012-9.012c.133-.133.217-.329.217-.532 0-.179-.065-.363-.218-.515l-2.423-2.415c-.143-.143-.333-.215-.522-.215s-.378.072-.523.215l-9.027 8.996c-.442 1.371-1.158 3.586-1.264 3.952-.126.433.198.834.572.834.41 0 .696-.099 4.176-1.308zm-2.258-2.392 1.17 1.171c-.704.232-1.274.418-1.729.566zm.968-1.154 7.356-7.331 1.347 1.342-7.346 7.347z" fillRule="nonzero"/></svg>
                                </div>
                                {actionWindow && <span className="ml-3">Edit Question</span>}
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}