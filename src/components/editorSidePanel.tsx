// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { useEffect, useState } from 'react';
import { getMarginValue, getViewMargin, setMarginValue, setViewMargin, getStagesBackground, setAllStagesBackground, RENDER_MAIN, stageGroupInfoData, getSpecificPageElementsInfo, pageElementsInfo, getSpecificStage, addToHistoryUndo, historyData, pageElements, changePageOfElement, changePageOfElementInfo, groupsOnPage } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { useSelectRef } from './editorContextProvider';

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

type shapeXYWHR = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

type shapeOnTransformType = {
    width: number;
    height: number;
    rotation: number;
}

type visualXYWHRP = {
    x: string;
    y: string;
    width: string;
    height: string;
    rotation: string;
    page: string;
}

export default function EditorSidePanel() {
    const [displayColorSelector, setDisplayColorSelector] = useState<boolean>(false);
    const toggleDisplayColorSelector = () => {setDisplayColorSelector(!displayColorSelector)}
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>(getStagesBackground());

    const [viewMarginEditor, setViewMarginEditor] = useState(getViewMargin());
    const toggleViewMargin = () => {setViewMarginEditor(!viewMarginEditor); setViewMargin(!viewMarginEditor); RENDER_MAIN();};
    const [marginEditorVisual, setMarginEditorVisual] = useState<string>(String(getMarginValue()));

    const { selectIndex, setSelectIndex } = useSelectRef();

    const [groupInformation, setGroupInformation] = useState<stageGroupInfoData | null>(null);
    const [groupClientRect, setGroupClientRect] = useState<shapeXYWH | null>(null);

    const [lockWHRatio, setLockWHRatio] = useState<boolean>(false);

    const [visualInformation, setVisualInformation] = useState<visualXYWHRP | null>(null);

    const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

    useEffect(() => {
        const handleChange = () => {
            if (selectIndex.current.pageIndex !== null && selectIndex.current.groupIndex !== null) {
                const elementInfo = getSpecificPageElementsInfo(selectIndex.current.pageIndex, selectIndex.current.groupIndex);
                setGroupInformation(elementInfo);
                setVisualInformation({
                    x: String(elementInfo.x),
                    y: String(elementInfo.y),
                    width: String(elementInfo.widestX),
                    height: String(elementInfo.widestY),
                    rotation: String(elementInfo.rotation),
                    page: String(selectIndex.current.pageIndex+1),
                } as visualXYWHRP);
            } else {
                setGroupInformation(null);
                setVisualInformation(null);
            }
        };

        window.addEventListener('selectIndexChanged', handleChange);

        return () => {
            window.removeEventListener('selectIndexChanged', handleChange);
        };
    }, []);


    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<shapeXY>;
            setGroupInformation({
                ...groupInformation,
                x: customEvent.detail.x,
                y: customEvent.detail.y
            } as stageGroupInfoData);
            setVisualInformation(prev => ({
                ...prev,
                x: String(customEvent.detail.x),
                y: String(customEvent.detail.y)
                } as visualXYWHRP));
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
                widestY: customEvent.detail.height,
                rotation: customEvent.detail.rotation
            } as stageGroupInfoData);
            setVisualInformation(prev => ({
                ...prev,
                width: String(customEvent.detail.width),
                height: String(customEvent.detail.height),
                rotation: String(customEvent.detail.rotation),
            } as visualXYWHRP));
        };

        window.addEventListener('shapeOnTransform', handler);
        return () => {
            window.removeEventListener('shapeOnTransform', handler);
        };
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<shapeXYWHR>;
            setGroupClientRect({
                x: customEvent.detail.x,
                y: customEvent.detail.y,
                width: customEvent.detail.width,
                height: customEvent.detail.height
            } as shapeXYWH);
            setGroupInformation({
                ...groupInformation,
                rotation: customEvent.detail.rotation
            } as stageGroupInfoData);
        };

        window.addEventListener('shapeClientRect', handler);
        return () => {
            window.removeEventListener('shapeClientRect', handler);
        };
    }, []);

    const marginValueInputHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');

        setMarginEditorVisual(value);
        setMarginValue(Number(value.replace(/[^0-9]/g, '')));
        RENDER_MAIN();
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
        const shift = Math.trunc(elementBefore.x - groupClientRect.x);
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = shift;
        setGroupInformation({
            ...groupInformation,
            x: shift,
        } as stageGroupInfoData);
        setVisualInformation({
            ...visualInformation,
            x: String(shift)
        } as visualXYWHRP);
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
        const shift = groupClientRect.x - focusPageElementInfo.x;
        const newValue = Math.round(focusStage.width/2 - groupClientRect.width/2 - shift);
        if (focusPageElementInfo.x === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = newValue;
        setGroupInformation({
            ...groupInformation,
            x: newValue,
        } as stageGroupInfoData)
        setVisualInformation({
            ...visualInformation,
            x: String(newValue)
        } as visualXYWHRP);
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            x: Math.round(focusStage.width/2 - groupClientRect.width/2),
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
        const shiftX = groupClientRect.x - focusPageElementInfo.x;
        const newValue = Math.round(focusStage.width - groupClientRect.width - shiftX);
        if (focusPageElementInfo.x === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = newValue;
        setGroupInformation({
            ...groupInformation,
            x: newValue,
        } as stageGroupInfoData)
        setVisualInformation({
            ...visualInformation,
            x: String(newValue)
        } as visualXYWHRP);
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            x: Math.round(focusStage.width - groupClientRect.width),
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
        const shift = Math.trunc(elementBefore.y - groupClientRect.y);
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = shift;
        setGroupInformation({
            ...groupInformation,
            y: shift,
        } as stageGroupInfoData);
        setVisualInformation({
            ...visualInformation,
            y: String(shift)
        } as visualXYWHRP);
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
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shift = groupClientRect.y - focusPageElementInfo.y;
        const newValue = Math.round(focusStage.height/2 - groupClientRect.height/2 - shift);
        if (focusPageElementInfo.y === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = newValue;
        setGroupInformation({
            ...groupInformation,
            y: newValue,
        } as stageGroupInfoData);
        setVisualInformation({
            ...visualInformation,
            y: String(newValue)
        } as visualXYWHRP);
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            y: Math.round(focusStage.height/2 - groupClientRect.height/2),
        });
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
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const focusPageElementInfo = {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]};
        const shiftY = groupClientRect.y - focusPageElementInfo.y;
        const newValue = Math.round(focusStage.height - groupClientRect.height - shiftY);
        if (focusPageElementInfo.y === newValue) { return; }
        pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = newValue;
        setGroupInformation({
            ...groupInformation,
            y: newValue,
        } as stageGroupInfoData);
        setVisualInformation({
            ...visualInformation,
            y: String(newValue)
        } as visualXYWHRP);
        RENDER_MAIN();
        setGroupClientRect({
            ...groupClientRect,
            y: Math.round(focusStage.height - groupClientRect.height),
        });
        addToHistoryUndo({
            command: "info",
            pageIndex: focusSelectIndex.pageIndex,
            groupIndex: focusSelectIndex.groupIndex,
            from: focusPageElementInfo,
            to: {...pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex]},
        } as historyData);
    }

    const changeXInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupClientRect || !/^\d*\.?\d*$/.test(value)) { return; }

        const numberValue = Number(value);

        const currentValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x);
        const shift = Math.round(groupClientRect.x - currentValue);

        if (numberValue !== currentValue) {
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = numberValue;
            setVisualInformation({
                ...visualInformation,
                x: value
            } as visualXYWHRP);
            setGroupInformation({
                ...groupInformation,
                x: numberValue,
            } as stageGroupInfoData);
            setGroupClientRect({
                ...groupClientRect,
                x: numberValue + shift,
            });
            console.log();
            RENDER_MAIN();
        } else {
            setVisualInformation({
                ...visualInformation,
                x: value
            } as visualXYWHRP);
        }
    }

    const changeYInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupClientRect || !/^\d*\.?\d*$/.test(value)) { return; }

        const numberValue = Number(value);

        const currentValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y);
        const shift = Math.round(groupClientRect.y - currentValue);

        if (numberValue !== currentValue) {
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = numberValue;
            setVisualInformation({
                ...visualInformation,
                y: value
            } as visualXYWHRP);
            setGroupInformation({
                ...groupInformation,
                y: numberValue,
            } as stageGroupInfoData);
            setGroupClientRect({
                ...groupClientRect,
                y: numberValue + shift,
            });
            console.log();
            RENDER_MAIN();
        } else {
            setVisualInformation({
                ...visualInformation,
                y: value
            } as visualXYWHRP);
        }
    }

    const changeWidthInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const widthValue = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect || !/^\d*\.?\d*$/.test(widthValue)) { return; }

        const widthNumberValue = Number(widthValue);

        const currentWidthValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestX);
        const shiftWidth = Math.round(groupClientRect.width - currentWidthValue);

        if (widthNumberValue !== currentWidthValue && widthNumberValue >= 1) {
            const scaleX = widthNumberValue/currentWidthValue;
            for (let x = 0; x < pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].length; x++) {
                pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].x *= scaleX;
                pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].width *= scaleX;
            }
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestX = widthNumberValue;
            console.log("VS W: "+ widthValue);
            
            if (lockWHRatio) {
                const heightValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestY);
                const shiftHeight = round4(groupClientRect.height - heightValue);
                const scaleY = scaleX;
                for (let x = 0; x < pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].length; x++) {
                    pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].y = round4(pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].y * scaleY);
                    pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].height = round4(pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].height * scaleY);
                }
                const newHieghtValue = round4(heightValue * scaleY);
                pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestY = newHieghtValue;
                setVisualInformation({
                    ...visualInformation,
                    width: String(widthNumberValue),
                    height: String(newHieghtValue)
                } as visualXYWHRP);
                setGroupInformation({
                    ...groupInformation,
                    widestX: widthNumberValue,
                    widestY: newHieghtValue,
                } as stageGroupInfoData);
                setGroupClientRect({
                    ...groupClientRect,
                    width: widthNumberValue + shiftWidth,
                    height: newHieghtValue + shiftHeight,
                });
                console.log(scaleY);
                console.log({width: String(widthNumberValue), height: String(newHieghtValue)});
            } else {
                setVisualInformation({
                    ...visualInformation,
                    width: String(widthNumberValue)
                } as visualXYWHRP);
                setGroupInformation({
                    ...groupInformation,
                    widestX: widthNumberValue,
                } as stageGroupInfoData);
                setGroupClientRect({
                    ...groupClientRect,
                    width: widthNumberValue + shiftWidth,
                });
            }
            RENDER_MAIN();
        } else {
            if (widthValue === "" && lockWHRatio) {
                setVisualInformation({
                    ...visualInformation,
                    width: widthValue,
                    height: ""
                } as visualXYWHRP);
            } else {
                setVisualInformation({
                    ...visualInformation,
                    width: widthValue
                } as visualXYWHRP);
            }
        }
    }

    const changeHeightInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const heightValue = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect || !/^\d*\.?\d*$/.test(heightValue)) { return; }

        const heightNumberValue = Number(heightValue);

        const currentHeightValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestY);
        const shiftHeight = Math.round(groupClientRect.height - currentHeightValue);

        if (heightNumberValue !== currentHeightValue && heightNumberValue >= 1) {
            const scaleY = heightNumberValue/currentHeightValue;
            for (let x = 0; x < pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].length; x++) {
                pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].y *= scaleY;
                pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].height *= scaleY;
            }
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestY = heightNumberValue;
            console.log("VS W: "+ heightValue);
            
            if (lockWHRatio) {
                const widthValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestX);
                const shiftWidth = round4(groupClientRect.width - widthValue);
                const scaleX = scaleY;
                for (let x = 0; x < pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].length; x++) {
                    pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].x = round4(pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].x * scaleX);
                    pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].width = round4(pageElements[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex][x].width * scaleX);
                }
                const newWidthValue = round4(widthValue * scaleX);
                pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].widestX = newWidthValue;
                setVisualInformation({
                    ...visualInformation,
                    width: String(newWidthValue),
                    height: String(heightNumberValue)
                } as visualXYWHRP);
                setGroupInformation({
                    ...groupInformation,
                    widestX: newWidthValue,
                    widestY: heightNumberValue,
                } as stageGroupInfoData);
                setGroupClientRect({
                    ...groupClientRect,
                    width: newWidthValue + shiftWidth,
                    height: heightNumberValue + shiftHeight,
                });
                console.log(scaleY);
                console.log({width: String(newWidthValue), height: String(heightNumberValue)});
            } else {
                setVisualInformation({
                    ...visualInformation,
                    height: String(heightNumberValue)
                } as visualXYWHRP);
                setGroupInformation({
                    ...groupInformation,
                    widestY: heightNumberValue,
                } as stageGroupInfoData);
                setGroupClientRect({
                    ...groupClientRect,
                    height: heightNumberValue + shiftHeight,
                });
            }
            RENDER_MAIN();
        } else {
            if (heightValue === "" && lockWHRatio) {
                setVisualInformation({
                    ...visualInformation,
                    width: "",
                    height: heightValue
                } as visualXYWHRP);
            } else {
                setVisualInformation({
                    ...visualInformation,
                    height: heightValue
                } as visualXYWHRP);
            }
        }
    }

    const changeRotationInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupClientRect || !/^-?\d*\.?\d*$/.test(value)) { return; }

        const numberValue = Number(value);

        const currentValue = Math.trunc(pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].rotation);

        if (numberValue !== currentValue && !isNaN(numberValue)) {
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].rotation = numberValue;
            setVisualInformation({
                ...visualInformation,
                rotation: value
            } as visualXYWHRP);
            setGroupInformation({
                ...groupInformation,
                rotation: numberValue,
            } as stageGroupInfoData);
            console.log();
            RENDER_MAIN();
        } else {
            setVisualInformation({
                ...visualInformation,
                rotation: value
            } as visualXYWHRP);
        }
    }

    const changePageOnInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const focusSelectIndex = selectIndex.current;
        
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupClientRect || !/^-?\d*\.?\d*$/.test(value)) { return; }

        const numberValue = Number(value)-1;

        const currentValue = focusSelectIndex.pageIndex;

        const pageIndex = selectIndex.current.pageIndex;
        const groupIndex = selectIndex.current.groupIndex;

        if (pageIndex !== null && groupIndex !== null && numberValue !== currentValue && !isNaN(numberValue) && numberValue >= 0 && numberValue < pageElementsInfo.length) {
            setVisualInformation({
                ...visualInformation,
                page: value
            } as visualXYWHRP);
            changePageOfElement(pageIndex, groupIndex, numberValue);
            changePageOfElementInfo(pageIndex, groupIndex, numberValue);
            setSelectIndex({groupIndex: groupsOnPage(numberValue)-1, pageIndex: numberValue});
            RENDER_MAIN();
        } else {
            setVisualInformation({
                ...visualInformation,
                page: value
            } as visualXYWHRP);
        }
    }

    const movePageOnDownButtonHandler = () => {
        const pageIndex = selectIndex.current.pageIndex;
        const groupIndex = selectIndex.current.groupIndex;
        if (pageIndex !== null && groupIndex !== null && pageIndex < pageElementsInfo.length-1) {
            setVisualInformation({
                ...visualInformation,
                page: String(pageIndex+2)
            } as visualXYWHRP);
            changePageOfElement(pageIndex, groupIndex, pageIndex+1);
            changePageOfElementInfo(pageIndex, groupIndex, pageIndex+1);
            setSelectIndex({groupIndex: groupsOnPage(pageIndex+1)-1, pageIndex: pageIndex+1});
            RENDER_MAIN();
        }
    }

    const movePageOnUpButtonHandler = () => {
        const pageIndex = selectIndex.current.pageIndex;
        const groupIndex = selectIndex.current.groupIndex;
        if (pageIndex !== null && groupIndex !== null && pageIndex > 0) {
            setVisualInformation({
                ...visualInformation,
                page: String(pageIndex)
            } as visualXYWHRP);
            changePageOfElement(pageIndex, groupIndex, pageIndex-1);
            changePageOfElementInfo(pageIndex, groupIndex, pageIndex-1);
            setSelectIndex({groupIndex: groupsOnPage(pageIndex-1)-1, pageIndex: pageIndex-1});
            RENDER_MAIN();
        }
    }

    const inputXBlurCleanUpHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!visualInformation) { return; }

        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const numberValue = Number(e.target.value);
        const focusValue = pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x;
        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const shift = Math.trunc(focusValue - groupClientRect.x);
        const lowerLimit = Math.trunc(focusValue - groupClientRect.x);
        const upperLimit = Math.round(focusStage.width - groupClientRect.width + shift);
        const newValue = Math.min(Math.max(numberValue, lowerLimit), upperLimit);

        if (focusValue !== newValue) {
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].x = newValue;
            setGroupInformation({
                ...groupInformation,
                x: newValue,
            } as stageGroupInfoData);
            setVisualInformation({
                ...visualInformation,
                x: String(newValue)
            } as visualXYWHRP);
            RENDER_MAIN();
            setGroupClientRect({
                ...groupClientRect,
                x: newValue - shift,
            });
            console.log(newValue - shift);
        } else {
            setVisualInformation({
                ...visualInformation,
                x: String(newValue)
            } as visualXYWHRP);
        }
    }

    const inputYBlurCleanUpHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!visualInformation) { return; }

        const focusSelectIndex = selectIndex.current;
        if (focusSelectIndex.pageIndex === null || focusSelectIndex.groupIndex === null || !groupInformation || !groupClientRect) { return; }

        const numberValue = Number(e.target.value);
        const focusValue = pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y;
        const focusStage = getSpecificStage(focusSelectIndex.pageIndex);
        const shift = Math.trunc(focusValue - groupClientRect.y);
        const lowerLimit = Math.trunc(focusValue - groupClientRect.y);
        const upperLimit = Math.round(focusStage.height - groupClientRect.height + shift);
        const newValue = Math.min(Math.max(numberValue, lowerLimit), upperLimit);

        if (focusValue !== newValue) {
            pageElementsInfo[focusSelectIndex.pageIndex][focusSelectIndex.groupIndex].y = newValue;
            setGroupInformation({
                ...groupInformation,
                y: newValue,
            } as stageGroupInfoData);
            setVisualInformation({
                ...visualInformation,
                y: String(newValue)
            } as visualXYWHRP);
            RENDER_MAIN();
            setGroupClientRect({
                ...groupClientRect,
                y: newValue - shift,
            });
            console.log(newValue - shift);
        } else {
            setVisualInformation({
                ...visualInformation,
                y: String(newValue)
            } as visualXYWHRP);
        }
    }

    const inputRotationBlurCleanUpHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!visualInformation) { return; }

        const numberValue = Number(e.target.value) % 360;

        setVisualInformation({
            ...visualInformation,
            rotation: String(numberValue)
        } as visualXYWHRP);
        
    }

    const pageOnBlurCleanUpHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!visualInformation) { return; }

        const numberValue = Math.min(1, Math.max(pageElementsInfo.length , Number(e.target.value)));

        setVisualInformation({
            ...visualInformation,
            page: String(numberValue)
        } as visualXYWHRP);
        
    }

    const moveElementToTheBack = () => {
        const pageIndex = selectIndex.current.pageIndex;
        const groupIndex = selectIndex.current.groupIndex;
        if (pageIndex === null || groupIndex === null || groupIndex < 1) return;
        const [item] = pageElements[pageIndex].splice(groupIndex, 1);
        const [itemInfo] = pageElementsInfo[pageIndex].splice(groupIndex, 1);
        pageElements[pageIndex].unshift(item);
        pageElementsInfo[pageIndex].unshift(itemInfo);
        setSelectIndex({pageIndex: pageIndex, groupIndex: 0});
        RENDER_MAIN();
    }

    const moveElementToTheFront = () => {
        const pageIndex = selectIndex.current.pageIndex;
        const groupIndex = selectIndex.current.groupIndex;
        if (pageIndex === null || groupIndex === null || groupIndex > pageElements[pageIndex].length-1) return;
        const [item] = pageElements[pageIndex].splice(groupIndex, 1);
        const [itemInfo] = pageElementsInfo[pageIndex].splice(groupIndex, 1);
        pageElements[pageIndex].push(item);
        pageElementsInfo[pageIndex].push(itemInfo);
        setSelectIndex({pageIndex: pageIndex, groupIndex: pageElementsInfo.length});
        RENDER_MAIN();
    }

    const defaultInputClassName = "flex text-sm w-full px-[2px] rounded-md border border-grey shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.15rem_theme('colors.contrast')] focus:outline-none focus:border-transparent";
    
    return (
        <div className='w-full h-full'>
            {visualInformation !== null && selectIndex.current.pageIndex !== null && (
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
                    <input value={visualInformation.x ?? ''} onChange={changeXInputHandler} onBlur={inputXBlurCleanUpHandler} className={defaultInputClassName}></input>
                    <input value={visualInformation.y ?? ''} onChange={changeYInputHandler} onBlur={inputYBlurCleanUpHandler} className={defaultInputClassName}></input>

                    <p className='text-xs ml-1 mt-1'>Width</p>
                    <p className='text-xs ml-1 mt-1'>Height</p>
                    <input value={visualInformation.width ?? ''} onChange={changeWidthInputHandler} className={defaultInputClassName}></input>
                    <input value={visualInformation.height ?? ''} onChange={changeHeightInputHandler} className={defaultInputClassName}></input>

                    <p className='text-xs ml-1 mt-1'>W:H Ratio</p>
                    <p className='text-xs ml-1 mt-1'>Rotation</p>
                    <button className='flex w-full items-center justify-center pr-2 rounded-md hover:bg-gray-200 transition duration-300' onClick={() => setLockWHRatio(!lockWHRatio)}>
                        {lockWHRatio ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 p-[1px]' viewBox="0 0 24 24"><path d="M13.723 18.654l-3.61 3.609c-2.316 2.315-6.063 2.315-8.378 0-1.12-1.118-1.735-2.606-1.735-4.188 0-1.582.615-3.07 1.734-4.189l4.866-4.865c2.355-2.355 6.114-2.262 8.377 0 .453.453.81.973 1.089 1.527l-1.593 1.592c-.18-.613-.5-1.189-.964-1.652-1.448-1.448-3.93-1.51-5.439-.001l-.001.002-4.867 4.865c-1.5 1.499-1.5 3.941 0 5.44 1.517 1.517 3.958 1.488 5.442 0l2.425-2.424c.993.284 1.791.335 2.654.284zm.161-16.918l-3.574 3.576c.847-.05 1.655 0 2.653.283l2.393-2.389c1.498-1.502 3.94-1.5 5.44-.001 1.517 1.518 1.486 3.959 0 5.442l-4.831 4.831-.003.002c-1.438 1.437-3.886 1.552-5.439-.002-.473-.474-.785-1.042-.956-1.643l-.084.068-1.517 1.515c.28.556.635 1.075 1.088 1.528 2.245 2.245 6.004 2.374 8.378 0l4.832-4.831c2.314-2.316 2.316-6.062-.001-8.377-2.317-2.321-6.067-2.313-8.379-.002z"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 p-[1px]' viewBox="0 0 24 24"><path d="M15.193 17.331l-4.909 4.91c-2.346 2.346-6.148 2.345-8.495 0-2.345-2.346-2.345-6.148 0-8.494l4.911-4.91 1.416 1.415-4.911 4.91c-1.56 1.562-1.56 4.102 0 5.663 1.562 1.561 4.102 1.561 5.663 0l4.91-4.91 1.415 1.416zm-1.415-15.572l-4.954 4.954 1.416 1.416 4.954-4.955c1.562-1.561 4.102-1.561 5.663 0s1.561 4.101 0 5.662l-4.955 4.955 1.417 1.416 4.955-4.955c2.344-2.345 2.344-6.148 0-8.494-2.347-2.345-6.15-2.344-8.496.001z"/></svg>
                        )}
                    </button>
                    <input value={visualInformation.rotation ?? ''} onChange={changeRotationInputHandler} onBlur={inputRotationBlurCleanUpHandler} className={defaultInputClassName}></input>
                    
                    <p className='text-xs ml-1 mt-1'>Page On</p>
                    <span className='w-full' />
                    <input value={visualInformation.page ?? ''} onChange={changePageOnInputHandler} onBlur={pageOnBlurCleanUpHandler} className={defaultInputClassName}></input>
                    <div className='flex w-full items-center justify-center border border-grey rounded-md'>
                        <button onClick={movePageOnDownButtonHandler} className='flex w-full items-center justify-center'>
                            <svg className="w-5 h-5" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m5.214 14.522s4.505 4.502 6.259 6.255c.146.147.338.22.53.22s.384-.073.53-.22c1.754-1.752 6.249-6.244 6.249-6.244.144-.144.216-.334.217-.523 0-.193-.074-.386-.221-.534-.293-.293-.766-.294-1.057-.004l-4.968 4.968v-14.692c0-.414-.336-.75-.75-.75s-.75.336-.75.75v14.692l-4.979-4.978c-.289-.289-.761-.287-1.054.006-.148.148-.222.341-.221.534 0 .189.071.377.215.52z" fill="#000" fillRule="nonzero"stroke="#000" strokeWidth="0.2" strokeLinejoin="round"/></svg>
                        </button>
                        <div className='w-[1px] h-full bg-grey' />
                        <button onClick={movePageOnUpButtonHandler} className='flex w-full items-center justify-center'>
                            <svg className="w-5 h-5" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.787 9.473s-4.505-4.502-6.259-6.255c-.147-.146-.339-.22-.53-.22-.192 0-.384.074-.531.22-1.753 1.753-6.256 6.252-6.256 6.252-.147.147-.219.339-.217.532.001.19.075.38.221.525.292.293.766.295 1.056.004l4.977-4.976v14.692c0 .414.336.75.75.75.413 0 .75-.336.75-.75v-14.692l4.978 4.978c.289.29.762.287 1.055-.006.145-.145.219-.335.221-.525.002-.192-.07-.384-.215-.529z" fill="#000" fillRule="nonzero"stroke="#000" strokeWidth="0.2" strokeLinejoin="round"/></svg>
                        </button>
                    </div>
                </div>

                <p className='p-2 pb-0 text-sm'>Order</p>
                <div className='w-full px-4 flex flex-col grid grid-cols-2 gap-x-2 text-xs text-primary'>
                    <p className='text-xs ml-1 my-1'>To the back</p>
                    <p className='text-xs ml-1 my-1'>To the front</p>
                    <button onClick={moveElementToTheBack} className='flex w-full items-center justify-center border border-grey rounded-md p-1'>
                        <svg className='h-6' viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="19.5" y="5.5" width="13" height="13" fill="#88CFCF" stroke="#88CFCF"/><rect x="10.5" y="2.5" width="13" height="13" fill="black" stroke="black"/><circle cx="36" cy="14" r="6.5" fill="black" stroke="black"/></svg>
                    </button>
                    <button onClick={moveElementToTheFront} className='flex w-full items-center justify-center border border-grey rounded-md p-1'>
                        <svg className='h-6' viewBox="0 0 52 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10.5" y="2.5" width="13" height="13" fill="black" stroke="black"/><circle cx="36" cy="14" r="6.5" fill="black" stroke="black"/><rect x="19.5" y="5.5" width="13" height="13" fill="#88CFCF" stroke="#88CFCF"/></svg>
                    </button>
                </div>
                

                <div className='w-full mt-2 h-[1px] bg-grey' />
                </>
            )}

            <p className='p-2 pb-1 text-md'>Page</p>

            <p className='p-2 pb-1 text-sm'>Background</p>
            <div className='flex flex-col px-4 space-y-2'>
                <p className="text-xs">Colour</p>
                <button style={{background: selectedBackgroundColor}} className='w-full h-5 border border-grey shadow rounded-lg' onClick={toggleDisplayColorSelector}></button>
                {displayColorSelector && (
                    <div className='absolute flex items-center justify-center top-[20vh] left-[13rem]'>
                        <ColorSelectorSection onClose={() => setDisplayColorSelector(false)} passColorValue={setSelectedBackgroundColor} startingColor={selectedBackgroundColor} />
                    </div>
                )}
                <p className="text-xs">View Margin</p>
                <button className='rounded-md hover:bg-gray-200 transition duration-300' onClick={toggleViewMargin}>
                        {viewMarginEditor ? 'Showing' : 'Hiding'}
                </button>
                <p className="text-xs">Margin Size (px)</p>
                <input className="px-2 border border-grey rounded-md shadow-sm transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent" value={marginEditorVisual} onChange={marginValueInputHandler} placeholder='300px'></input>
            </div>
        </div>
    );
}