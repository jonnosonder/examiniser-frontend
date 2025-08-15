// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { useEffect, useState } from 'react';
import { getMarginValue, getViewMargin, setMarginValue, setViewMargin, getStagesBackground, setAllStagesBackground, RENDER_MAIN, pageElements, pageElementsInfo, stageGroupInfoData, getSpecificPageElementsInfo, subscribePreviewStage } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { useSelectRef } from './editorContextProvider';

type shapeOnDragType = {
    x: number;
    y: number;
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
            const customEvent = e as CustomEvent<shapeOnDragType>;
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

    return (
        <div className='w-full h-full'>
            {selectIndex.current.pageIndex !== null && groupInformation !== null && (
                <>
                <p className='p-2 pb-1 text-md'>Position</p>

                <p className='p-2 pb-1 text-sm'>Align</p>
                <div className='flex w-full px-4'>
                    
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