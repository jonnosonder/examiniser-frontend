// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { useEffect, useState } from 'react';
import { getMarginValue, getViewMargin, setMarginValue, setViewMargin, getStagesBackground, setAllStagesBackground, RENDER_MAIN, stageGroupInfoData, getSpecificPageElementsInfo, pageElementsInfo, getSpecificStage, addToHistoryUndo, historyData } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { useSelectRef } from './editorContextProvider';
import { IRect } from 'konva/lib/types';

type shapeXY = {
    x: number;
    y: number;
}

type shapeXYWH = {
    x: number;
    y: number;
    width: number;
    height: number;
}


type shapeOnTransformType = {
    width: number;
    height: number;
}

export default function EditorSidePanel() {
    const [displayColorSelector, setDisplayColorSelector] = useState<boolean>(false);
    const toggleDisplayColorSelector = () => {setDisplayColorSelector(!displayColorSelector)}
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>(getStagesBackground());

    const [viewMarginEditor, setViewMarginEditor] = useState(getViewMargin());
    const toggleViewMargin = () => {setViewMarginEditor(!viewMarginEditor); setViewMargin(!viewMarginEditor); RENDER_MAIN();};
    const [marginEditorVisual, setMarginEditorVisual] = useState<string>(String(getMarginValue()));

    const [editPanelIndex, setEditPanelIndex] = useState<number | null>(-1);

    const { selectIndex } = useSelectRef();

    const [groupInformation, setGroupInformation] = useState<stageGroupInfoData | null>(null);
    const [groupClientRect, setGroupClientRect] = useState<shapeXYWH | null>(null);

    useEffect(() => {
        const handleChange = () => {
            if (selectIndex.current.pageIndex !== null && selectIndex.current.groupIndex !== null) {
                setGroupInformation(getSpecificPageElementsInfo(selectIndex.current.pageIndex, selectIndex.current.groupIndex));
            } else {
                setGroupInformation(null);
            }
        };

        window.addEventListener('selectIndexChanged', handleChange);

        return () => {
            window.removeEventListener('selectIndexChanged', handleChange);
        };
    }, []);

    useEffect(() => {
        if (selectIndex.current.pageIndex !== null && selectIndex.current.groupIndex !== null) {
            setGroupInformation(getSpecificPageElementsInfo(selectIndex.current.pageIndex, selectIndex.current.groupIndex));
        } else {
            setGroupInformation(null);
        }
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            console.log("recived drag data");
            const customEvent = e as CustomEvent<shapeXY>;
            setGroupInformation({
                ...groupInformation,
                x: customEvent.detail.x,
                y: customEvent.detail.y
            } as stageGroupInfoData)
        };

        window.addEventListener('shapeOnDrag', handler);
        return () => {
            window.removeEventListener('shapeOnDrag', handler);
        };
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            console.log("recived transform data");
            const customEvent = e as CustomEvent<shapeOnTransformType>;
            setGroupInformation({
                ...groupInformation,
                widestX: customEvent.detail.width,
                widestY: customEvent.detail.height
            } as stageGroupInfoData)
        };

        window.addEventListener('shapeOnTransform', handler);
        return () => {
            window.removeEventListener('shapeOnTransform', handler);
        };
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            console.log("recived shape client rect data");
            const customEvent = e as CustomEvent<shapeXYWH>;
            setGroupClientRect(customEvent.detail as shapeXYWH);
        };

        window.addEventListener('shapeClientRect', handler);
        return () => {
            window.removeEventListener('shapeClientRect', handler);
        };
    }, []);

    
    const toggleEditPanelSection = (index:number) => {
        setEditPanelIndex(editPanelIndex === index ? null : index);
    };

    const marginValueInputHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');

        setMarginEditorVisual(value);
        setMarginValue(Number(value.replace(/[^0-9]/g, '')));
    }

    useEffect(() => {
        setAllStagesBackground(selectedBackgroundColor);
        RENDER_MAIN();
    }, [selectedBackgroundColor])

    /*
    const selectButtonDeleteHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null) {
        deletePageElement(selectedId.page, selectedId.groupID);
        deletePageElementInfo(selectedId.page, selectedId.groupID);
    }
    setSelectedId?.({groupID: null, page: null});
    RENDER_PREVIEW();
    }

    const duplicateQuestionButtonHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null){
        duplicatePageElementsInfo(selectedId.page, selectedId.groupID);
        duplicatePageElement(selectedId.page, selectedId.groupID);
        RENDER_PAGE();
        setSelectedId?.({groupID: null, page: null});
    } else {
        notify('info', 'Please select an element');
    }
    }

    const selectButtonMoveDownElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page < stages.length-1) {
        changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page+1);
        changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page+1);
        console.log(groupsOnPage(selectedId.page+1)-1);
        setSelectedId?.({groupID: groupsOnPage(selectedId.page+1)-1, page: selectedId.page+1});
        RENDER_PAGE();
    } else {
        notify('info', 'No page bellow');
    }
    }

    const selectButtonMoveUpElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page > 0) {
        changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page-1);
        changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page-1);
        console.log(groupsOnPage(selectedId.page-1)-1);
        setSelectedId?.({groupID: groupsOnPage(selectedId.page-1)-1, page: selectedId.page-1});
        RENDER_PAGE();
    } else {
        notify('info', 'No page above');
    }
    }
    */

    const leftXAlignButtonHandler = () => {
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        if (pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x === 0) { return; }

        const elementBefore = { ...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shift = Math.round(elementBefore.x - groupClientRect.x);
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = shift;
        setGroupInformation({
            ...groupInformation,
            x: shift,
        } as stageGroupInfoData);
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            x: 0,
        });
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: elementBefore,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    const centerXAlignButtonHanlder = () => {
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shift = Math.round(groupClientRect.x - focusPageElementInfo.x);
        const newValue = focusStage.width/2 - focusPageElementInfo.widestX/2 - shift/2;
        if (focusPageElementInfo.x === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = newValue;
        setGroupInformation({
            ...groupInformation,
            x: newValue,
        } as stageGroupInfoData)
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            x: focusStage.width/2 - groupClientRect.width/2,
        });
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: focusPageElementInfo,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    const rightXAlignButtonHanlder = () => {
        console.log(groupClientRect);
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shiftX = Math.round(groupClientRect.x - focusPageElementInfo.x);
        const shiftWidth = Math.round(groupClientRect.width - focusPageElementInfo.widestX);
        const newValue = focusStage.width - focusPageElementInfo.widestX - shiftWidth - shiftX;
        if (focusPageElementInfo.x === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = newValue;
        setGroupInformation({
            ...groupInformation,
            x: newValue,
        } as stageGroupInfoData)
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            x: focusStage.width - groupClientRect.width,
        });
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: focusPageElementInfo,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    const topYAlignButtonHanlder = () => {
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        if (pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y === 0) { return; }
        const elementBefore = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shift = Math.round(elementBefore.y - groupClientRect.y);
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = shift;
        setGroupInformation({
            ...groupInformation,
            y: shift,
        } as stageGroupInfoData);
        setGroupClientRect({
            ...groupClientRect,
            y: 0,
        });
        RENDER_MAIN();
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: elementBefore,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    const centerYAlignButtonHanlder = () => {
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const newValue = focusStage.height/2 - focusPageElementInfo.widestY/2;
        if (focusPageElementInfo.y === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = newValue;
        setGroupInformation({
            ...groupInformation,
            y: newValue,
        } as stageGroupInfoData)
        RENDER_MAIN();
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: focusPageElementInfo,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
        
    }

    const bottomYAlignButtonHanlder = () => {
        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const newValue = focusStage.height - focusPageElementInfo.widestY;
        if (focusPageElementInfo.y === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = newValue;
        setGroupInformation({
            ...groupInformation,
            y: newValue,
        } as stageGroupInfoData)
        RENDER_MAIN();
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: focusPageElementInfo,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    return (
        <div className='w-full h-full'>
            {selectIndex.current.pageIndex !== null && groupInformation !== null && (
                <>
                <p className='p-2 pb-1 text-md'>Position</p>

                <p className='p-2 pb-1 text-sm'>Align</p>
                <div className='flex flex-col px-4 w-full items-center justify-center space-y-2'>
                    <div className='flex border border-grey shadow-sm rounded-md'>
                        <button className='w-6 h-6 m-[3px]' onClick={leftXAlignButtonHandler}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="3.5" y1="21" x2="3.5" y2="3" stroke="black"/><rect x="6" y="6" width="15" height="4" fill="black"/><rect x="6" y="14" width="10" height="4" fill="black"/></svg>
                        </button>
                        <span className='w-[1px] bg-grey' />
                        <button className='w-6 h-6 m-[3px]' onClick={centerXAlignButtonHanlder}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="21" x2="12" y2="3" stroke="black"/><rect x="4.5" y="6" width="15" height="4" fill="black"/><rect x="7" y="14" width="10" height="4" fill="black"/></svg>
                        </button>
                        <span className='w-[1px] bg-grey' />
                        <button className='w-6 h-6 m-[3px]' onClick={rightXAlignButtonHanlder}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20.5" y1="21" x2="20.5" y2="3" stroke="black"/><rect x="3" y="6" width="15" height="4" fill="black"/><rect x="8" y="14" width="10" height="4" fill="black"/></svg>
                        </button>
                    </div>

                    <div className='flex border border-grey shadow-sm rounded-md'>
                        <button className='w-6 h-6 m-[3px]' onClick={topYAlignButtonHanlder}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="3.5" x2="21" y2="3.5" stroke="black"/><rect x="6" y="21" width="15" height="4" transform="rotate(-90 6 21)" fill="black"/><rect x="14" y="16" width="10" height="4" transform="rotate(-90 14 16)" fill="black"/></svg>
                        </button>
                        <span className='w-[1px] bg-grey' />
                        <button className='w-6 h-6 m-[3px]' onClick={centerYAlignButtonHanlder}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12" stroke="black"/><rect x="6" y="19.5" width="15" height="4" transform="rotate(-90 6 19.5)" fill="black"/><rect x="14" y="17" width="10" height="4" transform="rotate(-90 14 17)" fill="black"/></svg>
                        </button>
                        <span className='w-[1px] bg-grey' />
                        <button className='w-6 h-6 m-[3px]' onClick={bottomYAlignButtonHanlder}>                    
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="20.5" x2="21" y2="20.5" stroke="black"/><rect x="6" y="18" width="15" height="4" transform="rotate(-90 6 18)" fill="black"/><rect x="14" y="18" width="10" height="4" transform="rotate(-90 14 18)" fill="black"/></svg>
                        </button>
                    </div>
                </div>

                <p className='p-2 pb-1 text-sm'>Position</p>
                <div className='w-full px-4 flex flex-col grid grid-cols-2 gap-x-2 text-xs text-primary'>
                    <p className='text-xs ml-1'>X</p>
                    <p className='text-xs ml-1'>Y</p>
                    <input value={groupInformation.x} className="flex text-sm w-full px-[2px] rounded-md border border-grey shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent"></input>
                    <input value={groupInformation.y} className="flex text-sm w-full px-[2px] rounded-md border border-grey shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent"></input>

                    <p className='text-xs ml-1 mt-1'>Width</p>
                    <p className='text-xs ml-1 mt-1'>Height</p>
                    <input value={groupInformation.widestX} className="flex text-sm w-full px-[2px] rounded-md border border-grey shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent"></input>
                    <input value={groupInformation.widestY} className="flex text-sm w-full px-[2px] rounded-md border border-grey shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent"></input>

                </div>

                <div className='w-full mt-2 h-[1px] bg-grey' />
                </>
            )}

            <p className='px-2 py-1'>Page</p>
            <div className="w-full">
                <button
                    className="w-full flex justify-between items-center px-4 py-1 bg-transparent text-primary border border-button-border text-base transition cursor-pointer"
                    onClick={() => toggleEditPanelSection(1)}
                >
                    Background
                    {editPanelIndex === 1 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    )}
                </button>

                <div
                    className={`flex flex-col overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                    editPanelIndex === 1 ? 'm-2' : 'max-h-0 p-0 border-0'
                    }`}
                >
                    <p className="text-sm">Background Colour</p>
                    <button style={{background: selectedBackgroundColor}} className='w-full h-5 border border-primary rounded-lg' onClick={toggleDisplayColorSelector}></button>
                    {displayColorSelector && (
                        <div className='absolute flex items-center justify-center left-[25vw]'>
                            <ColorSelectorSection onClose={() => setDisplayColorSelector(false)} passColorValue={setSelectedBackgroundColor} startingColor={selectedBackgroundColor} />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full">
                <button
                    className="w-full flex justify-between items-center px-4 py-1 bg-transparent text-primary border border-button-border text-base transition cursor-pointer"
                    onClick={() => toggleEditPanelSection(2)}
                >
                    Margin
                    {editPanelIndex === 2 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    )}
                </button>

                <div
                    className={`flex flex-col overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                    editPanelIndex === 2 ? 'm-2' : 'max-h-0 p-0 border-0'
                    }`}
                >   
                    <p className="text-sm">View Margin</p>
                    <button onClick={toggleViewMargin}>
                         {viewMarginEditor ? 'Showing' : 'Hiding'}
                    </button>
                    <p className="text-sm">Margin Size</p>
                    <input value={marginEditorVisual} onChange={marginValueInputHandler} placeholder='300px'></input>
                </div>
            </div>
        </div>
    );
}