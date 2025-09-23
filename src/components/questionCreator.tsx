// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
//import useImage from 'use-image';
import CanvasElements from '@/components/canvasElements'
import CustomContextMenu from '@/components/customContextMenu';
import { ShapeData } from '@/lib/shapeData';
import { addPageElement, addPageElementsInfo, addToHistoryUndo, deletePageElement, deletePageElementInfo, getEstimatedPage, getSpecificPageElementsInfo, getSpecificStage, getStageDimension, historyData, newShapeSizePercent, pageElementsInfo, RENDER_PAGE, setPageElement, setPageElementsInfo, stageGroupInfoData } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { KonvaEventObject } from 'konva/lib/Node';
import '@/styles/QuestionCreator.css'
import { AddImage } from './addImage';
import { getFontNamesArray } from '@/lib/fontData';
import { useTranslation } from 'react-i18next';
import { useSelectRef } from './editorContextProvider';

type QuestionCreatorProps = {
  onClose: () => void;
  newQuestionCreating: boolean;
  shapes: ShapeData[];
  setShapes: React.Dispatch<React.SetStateAction<ShapeData[]>>;
  questionEditingID: questionEditingIDType;
};

type questionEditingIDType = {
  groupID: number | null;
  page: number | null;
};

const QuestionCreator: React.FC<QuestionCreatorProps> = ({ onClose, newQuestionCreating, shapes, setShapes, questionEditingID }) => {
    const { t } = useTranslation();

    const { setSelectIndex } = useSelectRef();

    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false });
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [contextClipBoard, setContextClipBoard] = useState<ShapeData | null>(null);

    const [cropTickBox, setCropTickBox] = useState(true);
    const dashArray = cropTickBox ? '70.5096664428711 9999999' : '241 9999999';
    const dashOffset = cropTickBox ? -262.2723388671875 : 0;

    const [selectedFillColorViaDisplay, setSelectedFillColorViaDisplay] = useState<string>("");
    const [selectedStrokeColorViaDisplay, setSelectedStrokeColorViaDisplay] = useState<string>("");
    const [showAddImagePage, setShowAddImagePage] = useState<boolean>(false);
    const [displayFillColorSelector, setDisplayFillColorSelector] = useState<boolean>(false);
    const toggleDisplayFillColorSelector = () => {setDisplayFillColorSelector(!displayFillColorSelector); if (!displayFillColorSelector && displayStrokeColorSelector) {setDisplayStrokeColorSelector(false)}}
    const [displayStrokeColorSelector, setDisplayStrokeColorSelector] = useState<boolean>(false);
    const toggleDisplayStrokeColorSelector = () => {setDisplayStrokeColorSelector(!displayStrokeColorSelector); if (!displayStrokeColorSelector && displayFillColorSelector) {setDisplayFillColorSelector(false)}}
    
    const [parameterPanelIndex, setParameterPanelIndex] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]));
    const toggleParameterPanelSection = (index:number) => {
        setParameterPanelIndex(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
            newSet.delete(index);
            } else {
            newSet.add(index);
            }
            return newSet;
        });
    };
    const checkParameterPanelSection = (index: number): boolean => {
        return parameterPanelIndex.has(index);
    };

    const [initalShapes, setInitalShapes] = useState<ShapeData[]>([]);

    useEffect(() => {
        setInitalShapes(shapes);
    }, [])

    useEffect(() => {
        if (!newQuestionCreating) {
            let smallestX = Infinity;
            let smallestY = Infinity;

            shapes.forEach((shape) => {
                if (smallestX > shape.x) {
                    smallestX = shape.x;
                }
                if (smallestY > shape.y) {
                    smallestY = shape.y;
                }
                if (smallestX === 0 && smallestY === 0) {return;}
            });

            if (smallestX !== 0 || smallestY !== 0) {
                setCropTickBox(false);
            }
        }
    }, [])

    useEffect(() => {
        if (selectedId) {
            setShapes((prevShapes) =>
                prevShapes.map((shape) =>
                    shape.id === selectedId
                        ? { ...shape, fill: selectedFillColorViaDisplay }
                        : shape
                )
            );
        }
    }, [selectedFillColorViaDisplay]);

    useEffect(() => {
        if (selectedId) {
            setShapes((prevShapes) =>
                prevShapes.map((shape) =>
                    shape.id === selectedId
                        ? { ...shape, stroke: selectedStrokeColorViaDisplay }
                        : shape
                )
            );
        }
    }, [selectedStrokeColorViaDisplay]);

    const [selectedFont, setSelectedFont] = useState<string>('Inter');

    const onFontSelectChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedId) {
            const newFontValue = e.target.value;
            setSelectedFont(newFontValue);
            document.fonts.load('12px '+newFontValue).then(() => {
                setShapes((prevShapes) =>
                    prevShapes.map((shape) =>
                        shape.id === selectedId
                            ? { ...shape, fontFamily: newFontValue }
                            : shape
                    )
                );       
            });
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, show: true });
    };

    const closeContextMenu = () => {
        setContextMenu(prev => ({ ...prev, show: false }));
    };

    const handleSelect = (option: string) => {
        setSelectedOption(option);
    };

    useEffect(() => {
        if (selectedOption === "copy" && selectedId) {
            shapes.forEach((shape) => {
                if (shape.id === selectedId) {
                    setContextClipBoard(shape);
                }
            });
        } else if (selectedOption === "cut" && selectedId) {
            shapes.forEach((shape) => {
                if (shape.id === selectedId) {
                    setContextClipBoard(shape);
                }
            });
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
        } else if (selectedOption === "paste" && contextClipBoard !== null) {
            const toPasteShape = {
                ...contextClipBoard,
                id: contextClipBoard.type + "-" + Date.now()
            };
            setShapes(prevShapes => [...prevShapes, toPasteShape]);
            setSelectedId(contextClipBoard.id);
        } else if (selectedOption === "delete" && selectedId) {
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
        }

        setSelectedOption('');
    }, [selectedOption])

    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedShapeType, setSelectedShapeType] = useState<string | null>(null);
    const [isAnInputActive, setIsAnInputActive] = useState<boolean>(false);

    const updateShape = (newAttrs: ShapeData) => {
        setShapes((prev) =>
            prev.map((shape) => (shape.id === newAttrs.id ? newAttrs : shape))
        );
    };

    const colourFillButtonDivRef = useRef<HTMLDivElement>(null);
    const colourStrokeButtonDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedId && !isAnInputActive) {
                console.log(isAnInputActive);
                setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, isAnInputActive]);

    useEffect(() => {
        const shape = shapes.find(shape => shape.id === selectedId);
        if (shape){
            setSelectedShapeType(shape.type);
            setEditorXpositionValue(String(shape.x));
            setEditorYpositionValue(String(shape.y));
            if (shape.type !== 'oval'){
                setEditorWidthValue(String(shape.width));
                setEditorHeightValue(String(shape.height));
            } else {
                setEditorWidthValue(String(shape.width/2));
                setEditorHeightValue(String(shape.height/2));
            }
            setEditorRotateValue(String(shape.rotation));
            if (shape.type === 'rect' || shape.type === 'image' || shape.type === 'tri' || shape.type === 'rightAngleTri') {
                setEditorCornerRadiusValue(String(shape.cornerRadius));
            } else {
                setEditorCornerRadiusValue("0");
            }
            setEditorStrokeWeightValue(String(shape.strokeWidth));
            if (shape.type === 'text') {
                setEditorTextSizeValue(String(shape.fontSize));
                setEditorTextAlignValue(String(shape.align));
                setSelectedFont(shape.fontFamily);
            }
            if (shape.type === 'star') {
                setEditorStarNumPointsValue(String(shape.numPoints));
            }
            setSelectedFillColorViaDisplay(shape.fill);
            setSelectedStrokeColorViaDisplay(shape.stroke);
        } else {
            setSelectedFillColorViaDisplay("");
            setSelectedStrokeColorViaDisplay("");
            setSelectedShapeType(null);
            setEditorXpositionValue("0");
            setEditorYpositionValue("0");
            setEditorWidthValue("0");
            setEditorHeightValue("0");
            setEditorRotateValue("0");
            setEditorCornerRadiusValue("0");
            setEditorStrokeWeightValue("0");
            setEditorTextSizeValue("0");
            setEditorTextAlignValue("");
        }
        if (shape != undefined && colourFillButtonDivRef.current && shape.fill) {
            colourFillButtonDivRef.current.style.background = shape.fill;
        }

        if (shape != undefined && colourStrokeButtonDivRef.current && shape.stroke) {
            colourStrokeButtonDivRef.current.style.background = shape.stroke;
        }

        setShapes(prev => {
            const index = prev.findIndex(s => s.id === selectedId);
            if (index === -1) return prev;

            const newShapes = [...prev];
            const [item] = newShapes.splice(index, 1);
            newShapes.push(item);

            return newShapes;
        });
    }, [selectedId]);

    useEffect(() => {
        const updateSize = () => {
            if (stageContainerRef.current) {
                const stageDimension = getStageDimension();
                const scaleClac = stageContainerRef.current.offsetWidth / stageDimension.width;
                setStageScale(scaleClac);
                setDimensions({
                    width: stageDimension.width,
                    height: stageDimension.height,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const addTextHandle = () => {
        const newShape: ShapeData = {
            id: 't'+Date.now(),
            type: 'text',
            x: 20,
            y: 20,
            text: 'Double Click to Edit!',
            fontFamily: 'Inter-400',
            width: 570,
            height: 60,
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
        document.fonts.load('12px Inter-400').then(() => {
            setShapes(prevShapes => [...prevShapes, newShape]);
            setSelectedId(newShape.id);
        });
    }

    const addSquareHandle = () => {
        const pageToAddIt = getEstimatedPage();
        const focusStage = getSpecificStage(pageToAddIt);
        const size = Math.round(Math.min(focusStage.width * newShapeSizePercent, focusStage.height * newShapeSizePercent));
        const newShape: ShapeData = {
            id: 'r'+Date.now(),
            type: 'rect',
            x: 20,
            y: 20,
            width: size,
            height: size,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
            cornerRadius: 0,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addCircleHandle = () => {
        const pageToAddIt = getEstimatedPage();
        const focusStage = getSpecificStage(pageToAddIt);
        const size = Math.round(Math.min(focusStage.width * newShapeSizePercent, focusStage.height * newShapeSizePercent));
        const newShape: ShapeData = {
            id: 'c'+Date.now(),
            type: 'oval',
            x: size * 0.5,
            y: size * 0.5,
            width: size,
            height: size,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addTriangleHandle = () => {
        const pageToAddIt = getEstimatedPage();
        const focusStage = getSpecificStage(pageToAddIt);
        const size = Math.round(Math.min(focusStage.width * newShapeSizePercent, focusStage.height * newShapeSizePercent));
        const newShape: ShapeData = {
            id: 't'+Date.now(),
            type: 'tri',
            x: 20,
            y: 20,
            width: size,
            height: size,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
            cornerRadius: 0,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addRightAngledTriangleHandle = () => {
        const pageToAddIt = getEstimatedPage();
        const focusStage = getSpecificStage(pageToAddIt);
        const size = Math.round(Math.min(focusStage.width * newShapeSizePercent, focusStage.height * newShapeSizePercent));
        const newShape: ShapeData = {
            id: 'rat'+Date.now(),
            type: 'rightAngleTri',
            x: 20,
            y: 20,
            width: size,
            height: size,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
            cornerRadius: 0,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addStarHandle = () => {
        const pageToAddIt = getEstimatedPage();
        const focusStage = getSpecificStage(pageToAddIt);
        const size = Math.round(Math.min(focusStage.width * newShapeSizePercent, focusStage.height * newShapeSizePercent));
        const newShape: ShapeData = {
            id: 's'+Date.now(),
            type: 'star',
            x: size * 0.5,
            y: size * 0.5,
            width: size,
            height: size,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
            numPoints: 5,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const createHandler = () => {
        if (shapes.length === 0) {
            if (newQuestionCreating) {
                return;
            } else {
                if (questionEditingID.page !== null && questionEditingID.groupID !== null) {
                    deletePageElementInfo(questionEditingID.page, questionEditingID.groupID);
                    deletePageElement(questionEditingID.page, questionEditingID.groupID);
                    RENDER_PAGE();
                    return;
                }
            }
        }

        if (shapes === initalShapes) { return; }

        let widestX:number = 0;
        let widestY:number = 0;

        if (cropTickBox) { 
            let shiftX:number = Infinity;
            let shiftY:number = Infinity;

            shapes.forEach((element) => {
                let x: number;
                let y: number;
                if (element.type === "star" || element.type === "oval") {
                    x = element.x + element.width/2;
                    y = element.y + element.height/2;
                    if (shiftX > element.x - element.width/2) {
                        shiftX = element.x - element.width/2;
                    }
                    if (shiftY > element.y - element.height/2) {
                        shiftY = element.y - element.height/2;
                    }
                } else {
                    x = element.x + element.width;
                    y = element.y + element.height;
                    if (shiftX > element.x) {
                        shiftX = element.x;
                    }
                    if (shiftY > element.y) {
                        shiftY = element.y;
                    }
                }
                if (x > widestX) widestX = x;
                if (y > widestY) widestY = y;
            });

            //console.log(shapes[0].x);
            //console.log(shapes[0].y);
            //console.log(shiftX);
            //console.log(shiftY);

            shapes.forEach((element, i) => {
                shapes[i].x = element.x - shiftX;
                shapes[i].y = element.y - shiftY;
            })

            widestX -= shiftX;
            widestY -= shiftY;
        } else {
            shapes.forEach((element) => {
                let x: number;
                let y: number;
                if (element.type === "star" || element.type === "oval") {
                    x = element.x + element.width/2;
                    y = element.y + element.height/2;
                } else {
                    x = element.x + element.width;
                    y = element.y + element.height;
                }
                if (x > widestX) widestX = x;
                if (y > widestY) widestY = y;
            });
        }

        if (newQuestionCreating) {
            const pageOn = getEstimatedPage();
            const newGroupInfo = {id: "g-"+Date.now(), widestX, widestY, x:0, y:0, rotation:0} as stageGroupInfoData;
            addPageElementsInfo(newGroupInfo, pageOn);
            addPageElement(shapes, pageOn);
            addToHistoryUndo({
                command: "create",
                pageIndex: pageOn,
                groupIndex: pageElementsInfo[pageOn].length-1,
                from: {},
                to: newGroupInfo,
                contentsTo: shapes
            } as historyData);
            setSelectIndex({pageIndex: pageOn, groupIndex: pageElementsInfo[pageOn].length-1});
        } else {
            if (questionEditingID.page !== null && questionEditingID.groupID !== null) {
                const previousGroupInfo = getSpecificPageElementsInfo(questionEditingID.page, questionEditingID.groupID);
                console.log(previousGroupInfo);
                const newGroupInfo = {id: previousGroupInfo.id, widestX, widestY, x: previousGroupInfo.x, y: previousGroupInfo.y, rotation: previousGroupInfo.rotation} as stageGroupInfoData;
                setPageElementsInfo(newGroupInfo, questionEditingID.page, questionEditingID.groupID);
                setPageElement(shapes, questionEditingID.page, questionEditingID.groupID);
                
                addToHistoryUndo({
                    command: "info-contents",
                    pageIndex: questionEditingID.page,
                    groupIndex: questionEditingID.groupID,
                    from: previousGroupInfo,
                    to: newGroupInfo,
                    contentsFrom: initalShapes,
                    contentsTo: shapes
                } as historyData);

            }
        }
        RENDER_PAGE();
    }

    const deleteButtonHandler = () => {
        if (selectedId) { 
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
        }
    }

    const [editorXpositionValue, setEditorXpositionValue] = useState<string>("0");
    const [editorYpositionValue, setEditorYpositionValue] = useState<string>("0");
    const [editorWidthValue, setEditorWidthValue] = useState<string>("0");
    const [editorHeightValue, setEditorHeightValue] = useState<string>("0");
    const [editorRotateValue, setEditorRotateValue] = useState<string>("0");
    const [editorCornerRadiusValue, setEditorCornerRadiusValue] = useState<string>("0");
    const [editorStrokeWeightValue, setEditorStrokeWeightValue] = useState<string>("0");
    const [editorTextSizeValue, setEditorTextSizeValue] = useState<string>("0");
    const [editorTextAlignValue, setEditorTextAlignValue] = useState<string>("left");
    const [editorStarNumPointsValue, setEditorStarNumPointsValue] = useState<string>("0");

    const editorXpositionHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorXpositionValue("");
            } else if (Number(value) === 0) {
                setEditorXpositionValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, x: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorXpositionValue(String(roundedValue)+".");
                } else {
                    setEditorXpositionValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, x: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorYpositionHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorYpositionValue("");
            } else if (Number(value) === 0) {
                setEditorYpositionValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, y: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorYpositionValue(String(roundedValue)+".");
                } else {
                    setEditorYpositionValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, y: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorWidthValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorWidthValue("");
            } else if (Number(value) === 0) {
                setEditorWidthValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId && shape.type !== "oval") {
                        return { ...shape, width: 0 };
                    } else if (shape.id === selectedId && shape.type === "oval") {
                        return { ...shape, radiusX: 0, width: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorWidthValue(String(roundedValue)+".");
                } else {
                    setEditorWidthValue(String(roundedValue));
                }

                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId && shape.type !== "oval") {
                        return { ...shape, width: roundedValue };
                    } else if (shape.id === selectedId && shape.type === "oval") {
                        return { ...shape, radiusX: roundedValue, width: roundedValue*2 };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorHeightValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorHeightValue("");
            } else if (Number(value) === 0) {
                setEditorHeightValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId && shape.type !== "oval") {
                        return { ...shape, height: 0 };
                    } else if (shape.id === selectedId && shape.type === "oval") {
                        return { ...shape, radiusX: 0, height: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorHeightValue(String(roundedValue)+".");
                } else {
                    setEditorHeightValue(String(roundedValue));
                }

                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId && shape.type !== "oval") {
                        return { ...shape, height: roundedValue };
                    } else if (shape.id === selectedId && shape.type === "oval") {
                        return { ...shape, radiusX: roundedValue, height: roundedValue*2 };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorRotateValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorRotateValue("");
            } else if (Number(value) === 0) {
                setEditorRotateValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, rotation: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorRotateValue(String(roundedValue)+".");
                } else {
                    setEditorRotateValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, rotation: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorCornerRadiusValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedShapeType === "rect" || selectedShapeType === "img" || selectedShapeType === "tri" || selectedShapeType === "rightAngleTri") {
            const value = e.target.value;

            if (/^\d*\.?\d*$/.test(value)) {
                if (value === "") {
                    setEditorCornerRadiusValue("");
                } else if (Number(value) === 0) {
                    setEditorCornerRadiusValue(value);
                    setShapes(prevShapes =>
                        prevShapes.map(shape => {
                        if (shape.id === selectedId) {
                            return { ...shape, cornerRadius: 0 };
                        }
                        return shape;
                        })
                    );
                } else {
                    const roundedValue = Math.min(Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000, 100);
                    if (value.endsWith(".")) {
                        setEditorCornerRadiusValue(String(roundedValue)+".");
                    } else {
                        setEditorCornerRadiusValue(String(roundedValue));
                    }
                
                    setShapes(prevShapes =>
                        prevShapes.map(shape => {
                        if (shape.id === selectedId) {
                            return { ...shape, cornerRadius: roundedValue };
                        }
                        return shape;
                        })
                    );
                }
            }
        }
    }

    const editorStrokeWeightValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorStrokeWeightValue("");
            } else if (Number(value) === 0) {
                setEditorStrokeWeightValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, strokeWidth: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorStrokeWeightValue(String(roundedValue)+".");
                } else {
                    setEditorStrokeWeightValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, strokeWidth: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorTextSizeValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorTextSizeValue("");
            } else if (Number(value) === 0) {
                setEditorTextSizeValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, fontSize: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                if (Number(value) <= 0) {
                    return;
                }
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorTextSizeValue(String(roundedValue)+".");
                } else {
                    setEditorTextSizeValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, fontSize: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }

    const editorStarNumPointsValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorStarNumPointsValue("");
            } else if (Number(value) === 0) {
                setEditorStarNumPointsValue(value);
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, numPoints: 0 };
                    }
                    return shape;
                    })
                );
            } else {
                if (Number(value) <= 0) {
                    return;
                }
                const roundedValue = Math.trunc((Number(value) + Number.EPSILON) * 10000) / 10000;
                if (value.endsWith(".")) {
                    setEditorStarNumPointsValue(String(roundedValue)+".");
                } else {
                    setEditorStarNumPointsValue(String(roundedValue));
                }
            
                setShapes(prevShapes =>
                    prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        return { ...shape, numPoints: roundedValue };
                    }
                    return shape;
                    })
                );
            }
        }
    }


    const editorShapeOnDragHandler = (e: KonvaEventObject<MouseEvent>) => {
        setEditorXpositionValue(String(Math.round(e.target.x())));
        setEditorYpositionValue(String(Math.round(e.target.y())));
    }

    const editorShapeOnTranformHandler = (e: KonvaEventObject<Event>) => {
        const node = e.target;
        const newWidth = Math.max(5, node.width() * node.scaleX());
        const newHeight = Math.max(5, node.height() * node.scaleY());
        const newRotation = node.rotation();
        if (selectedShapeType !== "oval" && selectedShapeType !== "star"){
            setEditorWidthValue(String(Math.round(newWidth)));
            setEditorHeightValue(String(Math.round(newHeight)));
        } else {
            setEditorWidthValue(String(Math.round(newWidth)));
            setEditorHeightValue(String(Math.round(newHeight)));
        }
        setEditorRotateValue(String(Math.round(Number(newRotation))));
    }

    type alginType = "left" | "center" | "right" | "justify";

    const editorTextAlignHanlder = (newAlign: string) => {
        setShapes(prevShapes =>
            prevShapes.map(shape => {
            if (shape.id === selectedId) {
                return { ...shape, align: newAlign as alginType };
            }
            return shape;
            })
        );
        setEditorTextAlignValue(newAlign);
    }

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            setIsAnInputActive(true);
        });

        input.addEventListener('blur', function() {
            setIsAnInputActive(false);
        });
    });

    const fontNames = getFontNamesArray();

    const defaultInputClassName = "text-base max-w-20 shadow-md rounded-md border border-grey px-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.contrast')] focus:outline-none focus:border-transparent";

    return(
        <>
        <div onContextMenu={handleContextMenu}>
            <CustomContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                onClose={closeContextMenu}
                onSelect={handleSelect}
            />
            <div className='absolute flex z-10 w-full h-full bg-opacity-50 backdrop-blur-sm justify-center'>
                <div className='absolute flex top-5 w-full items-center justify-center h-[90%] p-4'>
                    <div className='bg-background flex flex-col rounded-lg p-2 m-2 border-2 border-primary rounded-xl w-full h-full'>
                        <div className='flex justify-between items-center justify-center'>
                            <h3 className='text-lg'>{t('editor.question-creator-editor')}</h3>
                            <button onClick={onClose} className='w-6 h-6'>
                                <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                            </button>
                        </div>
                        <span className='flex w-full flex-1' />
                        <div className='flex flex-row w-full h-10 my-2 space-x-2 overflow-x-auto'>
                            {/* Add Text */}
                            <button onClick={addTextHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                </svg>
                            </button>
                            {/* Add Image */}
                            <button onClick={() => setShowAddImagePage(true)}>
                                <svg className='h-full p-[2px]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
                                    <path d="M24 22h-24v-20h24v20zm-1-19h-22v18h22v-18zm-1 16h-19l4-7.492 3 3.048 5.013-7.556 6.987 12zm-11.848-2.865l-2.91-2.956-2.574 4.821h15.593l-5.303-9.108-4.806 7.243zm-4.652-11.135c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5zm0 1c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z"/>
                                </svg>
                            </button>
                            {/* Add Square */}
                            <button className='w-10 h-full' onClick={addSquareHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2.5" y="2.5" width="19" height="19" stroke="black"/>
                                </svg>
                            </button>
                            {/* Add Circle */}
                            <button className='w-10 h-full' onClick={addCircleHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="9.5" stroke="black"/>
                                </svg>
                            </button>
                            {/* Add Triangle */}
                            <button className='w-10 h-full' onClick={addTriangleHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.0264 20.5H2.97363L12.5 3.99902L22.0264 20.5Z" stroke="black"/>
                                </svg>
                            </button>
                            {/* Right Angle Triangle */}
                            <button className='w-10 h-full' onClick={addRightAngledTriangleHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.793 21.5H2.5V3.20703L20.793 21.5Z" stroke="black"/>
                                </svg>
                            </button>
                            {/* Add Star */}
                            <button className='w-10 h-full' onClick={addStarHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.3154 9.36914L14.4326 9.65137L14.7373 9.67578L20.748 10.1572L16.1689 14.0801L15.9365 14.2793L16.0078 14.5762L17.4062 20.4414L12.2607 17.2979L12 17.1387L11.7393 17.2979L6.59277 20.4414L7.99219 14.5762L8.06348 14.2793L7.83105 14.0801L3.25098 10.1572L9.2627 9.67578L9.56738 9.65137L9.68457 9.36914L12 3.80273L14.3154 9.36914Z" stroke="black"/>
                                </svg>
                            </button>
                            <span className='w-full flex' />
                            {/* Delete Button */}
                            <button className='w-10 h-full' onClick={deleteButtonHandler}>
                                <svg className='h-full p-2' viewBox='0 0 24 24' xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-17h-1v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2h-1v17c0 1.104-.896 2-2 2zm0-19h-14v16.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-16.5zm-9 4c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm-2-7h-4v1h4v-1z"/></svg>
                            </button>
                        </div>
                        <div ref={stageContainerRef} className='w-full h-[65vh] flex overflow-y-auto overflow-x-auto scrollbar-hide border-2 border-primary bg-white justify-start'>
                            <div 
                                className='flex'
                                style={{
                                    width: dimensions.width * stageScale,
                                    height: dimensions.height * stageScale,
                                    overflow: 'hidden',
                                    transformOrigin: 'top left',
                            }}>
                                
                                <Stage 
                                width={dimensions.width * stageScale} 
                                height={dimensions.height * stageScale} 
                                scaleX={stageScale}
                                scaleY={stageScale}
                                pixelRatio={300}
                                onMouseDown={(e) => {
                                    if (e.target === e.target.getStage()) {
                                    setSelectedId(null);
                                    }
                                }}
                                style={{
                                    transformOrigin: 'top left',
                                    zIndex: '100',
                                }}
                                >
                                    <Layer>
                                        {shapes.map((shape) => {
                                            const dragBoundFunc = (pos: { x: number; y: number }) => {

                                                // Convert from pixel space → logical stage space
                                                let x = pos.x / stageScale;
                                                let y = pos.y / stageScale;
                                                //console.log({x, y});

                                                // Clamp to the stage bounds
                                                let shiftX: number;
                                                let shiftY: number;
                                                let maxX: number;
                                                let maxY: number;

                                                if (shape.type === "star" || shape.type === "oval") {
                                                    shiftX = shape.width/2;
                                                    shiftY = shape.height/2;
                                                    maxX = dimensions.width - shape.width/2;
                                                    maxY = dimensions.height - shape.height/2;
                                                } else {
                                                    shiftX = 0;
                                                    shiftY = 0;
                                                    maxX = dimensions.width - shape.width;
                                                    maxY = dimensions.height - shape.height;
                                                }

                                                if (x < shiftX) {
                                                    x = shiftX;
                                                    setEditorXpositionValue(String(x));
                                                }
                                                if (y < shiftY) {
                                                    y = shiftY;
                                                    setEditorYpositionValue(String(y));
                                                }
                                                if (x > maxX) {
                                                    x = maxX;
                                                    setEditorXpositionValue(String(x));
                                                }
                                                if (y > maxY) {
                                                    y = maxY;
                                                    setEditorYpositionValue(String(y));
                                                }

                                                // Convert back to pixel space
                                                return {
                                                    x: Math.round(x * stageScale),
                                                    y: Math.round(y * stageScale),
                                                };
                                            };
                                        
                                            return (
                                                <CanvasElements
                                                    key={shape.id}
                                                    shape={shape}
                                                    isSelected={shape.id === selectedId}
                                                    onSelect={() => setSelectedId(shape.id)}
                                                    onChange={updateShape}
                                                    stageScale={stageScale}
                                                    dragBoundFunc={dragBoundFunc}
                                                    stageWidth={dimensions.width}
                                                    stageHeight={dimensions.height}
                                                    onDragMoveUpdates={editorShapeOnDragHandler}
                                                    onTransformUpdates={editorShapeOnTranformHandler}
                                                />
                                            );
                                        })}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>
                        <div className='flex w-full mt-2 space-x-4 items-center'>
                            <button onClick={() => {setShapes([]);}} className='px-4 py-2 border-2 border-darkRed rounded-full bg-red text-white whitespace-nowrap'>{t("editor.delete-all")}</button>
                            <span className='flex w-full'></span>
                            {/*
                            <button onClick={() => {setDimensions({width: dimensions.width, height: dimensions.height * 2})}} className='px-4 py-2 border-2 border-primary rounded-full text-primary whitespace-nowrap'>Add Space</button>
                            */}
                            <div className='flex items-center'>
                            <p className='text-sm whitespace-nowrap m-0 mr-2'>{t("editor.crop-question")}</p>
                            <label className="cursor-pointer inline-flex items-center justify-center w-4 h-4">
                                <input
                                    type="checkbox"
                                    checked={cropTickBox}
                                    onChange={(e) => setCropTickBox(e.target.checked)}
                                    className="hidden"
                                />
                                <svg
                                    viewBox="0 0 64 64"
                                    className="w-full h-full overflow-visible"
                                >
                                    <path
                                    d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                                    pathLength="575.0541381835938"
                                    style={{
                                        strokeDasharray: dashArray,
                                        strokeDashoffset: dashOffset,
                                    }}
                                    className="transition-[stroke-dasharray,stroke-dashoffset] duration-500 ease-in-out fill-none stroke-primary stroke-[6] stroke-linecap-round stroke-linejoin-round"
                                    />
                                </svg>
                            </label>
                            </div>
                            <button onClick={() => {createHandler(); onClose();}} className='px-4 py-2 border-2 border-primary rounded-full whitespace-nowrap'>
                                {newQuestionCreating ? t("start.create") : t("editor.apply-edit")}
                            </button>
                        </div>
                    </div>
                    <div className='bg-background rounded-lg p-2 m-2 border-2 border-primary rounded-xl min-w-[14rem] max-w-[20rem] h-full scroll-y-auto'>
                        <h3 className='text-center text-primary text-lg'>{t('editor.parameters')}</h3>
                        
                        {/* Default Parameters */}
                        {selectedShapeType !== null ? (
                        <>
                        <div className="w-full">
                            <button
                                className="w-full flex justify-between items-center bg-transparent text-primary text-base text-md transition cursor-pointer"
                                onClick={() => toggleParameterPanelSection(1)}
                            >
                                {t('editor.transform')}
                                {checkParameterPanelSection(1) ? (
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
                                checkParameterPanelSection(1) ? '' : 'max-h-0 p-0 border-0'
                                }`}
                            >       
                                <div className='flex w-full items-center justify-center p-2 px-4'>
                                    <div className='flex-row items-center justify-center grid grid-cols-2 gap-x-4  text-sm'>
                                        <p className='text-primary pl-1'>X</p>
                                        <p className='text-primary pl-1'>Y</p>
                                        <input className={defaultInputClassName} value={editorXpositionValue} onChange={editorXpositionHandler}></input>
                                        <input className={defaultInputClassName} value={editorWidthValue} onChange={editorWidthValueHandler}></input>
                                        <span className='h-1' />
                                        <span className='h-1' />
                                        <p className='text-primary pl-1'>{t('start.width')}</p>
                                        <p className='text-primary pl-1'>{t('start.height')}</p>
                                        <input className={defaultInputClassName} value={editorYpositionValue} onChange={editorYpositionHandler}></input>
                                        <input className={defaultInputClassName} value={editorHeightValue} onChange={editorHeightValueHandler}></input>
                                        <span className='h-1' />
                                        <span className='h-1' />
                                        <span className='h-1' />
                                        <p className='text-primary pl-1'>{t('editor.rotation')}</p>
                                        <span className='h-1' />
                                        <input className={defaultInputClassName} value={editorRotateValue} onChange={editorRotateValueHandler}></input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Styling Parameters */}
                        <div className="w-full">
                            <button
                                className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                onClick={() => toggleParameterPanelSection(2)}
                            >
                                {t('editor.style')}
                                {checkParameterPanelSection(2) ? (
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
                                checkParameterPanelSection(2) ? '' : 'max-h-0 p-0 border-0'
                                }`}
                            >
                                <div className='flex w-full items-center justify-center p-2 px-4'>
                                    <div className='flex-row items-center justify-center grid grid-cols-2 gap-x-4 text-sm'>
                                        <p className='text-start pl-1'>{t('editor.fill')}</p>
                                        <p className='text-start pl-1'>{t('editor.stroke')}</p>
                                        <button onClick={() => {if (selectedFillColorViaDisplay !== "") {toggleDisplayFillColorSelector()}}} className='h-6'>
                                            <div ref={colourFillButtonDivRef} style={{background: selectedFillColorViaDisplay || 'white'}} className='w-full h-full border border-grey flex items-center justify-center rounded-md'></div>
                                        </button>
                                        {displayFillColorSelector && (
                                        <div className='absolute flex items-center justify-center left-[22vw]'>
                                            <ColorSelectorSection onClose={() => setDisplayFillColorSelector(false)} passColorValue={setSelectedFillColorViaDisplay} startingColor={selectedFillColorViaDisplay}/>
                                        </div>
                                        )}
                                        <button onClick={() => {if (selectedStrokeColorViaDisplay !== "") {toggleDisplayStrokeColorSelector()}}} className='h-6'>
                                            <div ref={colourStrokeButtonDivRef} style={{background: selectedStrokeColorViaDisplay || 'white'}} className='w-full h-full border border-grey flex items-center justify-center rounded-md'></div>
                                        </button>
                                        {displayStrokeColorSelector && (
                                        <div className='absolute flex items-center justify-center left-[25vw]'>
                                            <ColorSelectorSection onClose={() => setDisplayStrokeColorSelector(false)} passColorValue={setSelectedStrokeColorViaDisplay} startingColor={selectedStrokeColorViaDisplay}/>
                                        </div>
                                        )}
                                        <span className='h-1' />
                                        <span className='h-1' />
                                        <p className='text-start pl-1'>{t('editor.bevel')} <span className='text-xs'>(%)</span></p>
                                        <p className='text-start pl-1'>{t('editor.weight')}</p>
                                        <input className={defaultInputClassName} value={editorCornerRadiusValue} onChange={editorCornerRadiusValueHandler}></input>
                                        <input className={defaultInputClassName} value={editorStrokeWeightValue} onChange={editorStrokeWeightValueHandler}></input>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>
                        ) : (
                            <p className='text-center italic'>{t('editor.select-an-element')}</p>
                        )}

                        {/* Text Aditional Features */}
                        {selectedShapeType === "text" && (

                            <div className="w-full">
                                <button
                                    className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                    onClick={() => toggleParameterPanelSection(3)}
                                >
                                    {t('editor.font')}
                                    {checkParameterPanelSection(3) ? (
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
                                    checkParameterPanelSection(3) ? 'm-2' : 'max-h-0 p-0 border-0'
                                    }`}
                                >
                                    <div className='flex w-full flex-col items-center justify-center p-2 px-4'>
                                        <div className='flex w-full flex-col items-center justify-center'>
                                            <p className='text-left w-full pl-1'>{t('editor.font-family')}</p>
                                            <select className='p-1 flex w-full rounded-md border border-grey' value={selectedFont} onChange={onFontSelectChangeHandler} style={{fontFamily: selectedFont}}>
                                                {fontNames.map((font) => (
                                                <option key={font} value={font} style={{fontFamily: font}}>
                                                    {font.replace("-", " ")}
                                                </option>
                                                ))}
                                            </select>

                                            <span className='h-4' />
                                            
                                            <div className='flex flex-row'>
                                                <svg className='h-10' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3.88109 6.4H14.5211V9.66H14.0011L13.4211 7.56C13.3811 7.4 13.3344 7.28667 13.2811 7.22C13.2411 7.14 13.1544 7.09333 13.0211 7.08C12.8878 7.05333 12.6611 7.04 12.3411 7.04H10.0811V18.38C10.0811 18.8467 10.1011 19.12 10.1411 19.2C10.1811 19.28 10.3078 19.3333 10.5211 19.36L11.6211 19.48V20H6.80109V19.48L7.90109 19.36C8.11443 19.3333 8.24109 19.28 8.28109 19.2C8.32109 19.12 8.34109 18.8467 8.34109 18.38V7.04H6.06109C5.75443 7.04 5.52776 7.05333 5.38109 7.08C5.24776 7.09333 5.15443 7.14 5.10109 7.22C5.06109 7.28667 5.02109 7.4 4.98109 7.56L4.40109 9.66H3.88109V6.4ZM14.923 13.2H20.243V14.83H19.983L19.693 13.78C19.673 13.7 19.6496 13.6433 19.623 13.61C19.603 13.57 19.5596 13.5467 19.493 13.54C19.4263 13.5267 19.313 13.52 19.153 13.52H18.023V19.19C18.023 19.4233 18.033 19.56 18.053 19.6C18.073 19.64 18.1363 19.6667 18.243 19.68L18.793 19.74V20H16.383V19.74L16.933 19.68C17.0396 19.6667 17.103 19.64 17.123 19.6C17.143 19.56 17.153 19.4233 17.153 19.19V13.52H16.013C15.8596 13.52 15.7463 13.5267 15.673 13.54C15.6063 13.5467 15.5596 13.57 15.533 13.61C15.513 13.6433 15.493 13.7 15.473 13.78L15.183 14.83H14.923V13.2Z" fill="black"/>
                                                </svg>

                                                {/* Text Size Input */}
                                                <input className={'flex w-10' + defaultInputClassName} type="number" onChange={editorTextSizeValueHandler} value={editorTextSizeValue}></input>
                                            </div>
                                            
                                            <span className='h-4' />
                                            <p className='flex w-full pl-1'>{t('editor.align')}</p>
                                            <div className='flex w-full h-10 flex-row items-center justify-center space-x-2 m-2'>    
                                                <button onClick={() => editorTextAlignHanlder("left")} className={`number-input w-10 transition-all duration-200 ease-in-out ${editorTextAlignValue === "left" && "[box-shadow:inset_4px_4px_10px_#bcbcbc,inset_-4px_-4px_10px_#ffffff]"}`}>
                                                    <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m17 17.75c0-.414-.336-.75-.75-.75h-13.5c-.414 0-.75.336-.75.75s.336.75.75.75h13.5c.414 0 .75-.336.75-.75zm5-4c0-.414-.336-.75-.75-.75h-18.5c-.414 0-.75.336-.75.75s.336.75.75.75h18.5c.414 0 .75-.336.75-.75zm-9-4c0-.414-.336-.75-.75-.75h-9.5c-.414 0-.75.336-.75.75s.336.75.75.75h9.5c.414 0 .75-.336.75-.75zm7-4c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75z" fillRule="nonzero"/></svg>
                                                </button>
                                                <button onClick={() => editorTextAlignHanlder("center")} className={`number-input w-10 transition-all duration-200 ease-in-out ${editorTextAlignValue === "center" && "[box-shadow:inset_4px_4px_10px_#bcbcbc,inset_-4px_-4px_10px_#ffffff]"}`}>
                                                    <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m6 17.75c0-.414.336-.75.75-.75h10.5c.414 0 .75.336.75.75s-.336.75-.75.75h-10.5c-.414 0-.75-.336-.75-.75zm-4-4c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm0-4c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm4-4c0-.414.336-.75.75-.75h10.5c.414 0 .75.336.75.75s-.336.75-.75.75h-10.5c-.414 0-.75-.336-.75-.75z" fillRule="nonzero"/></svg>
                                                </button>
                                                <button onClick={() => editorTextAlignHanlder("right")} className={`number-input w-10 transition-all duration-200 ease-in-out ${editorTextAlignValue === "right" && "[box-shadow:inset_4px_4px_10px_#bcbcbc,inset_-4px_-4px_10px_#ffffff]"}`}>
                                                    <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 17.75c0-.414.336-.75.75-.75h13.5c.414 0 .75.336.75.75s-.336.75-.75.75h-13.5c-.414 0-.75-.336-.75-.75zm-5-4c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm9-4c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-7-4c0-.414.336-.75.75-.75h16.5c.414 0 .75.336.75.75s-.336.75-.75.75h-16.5c-.414 0-.75-.336-.75-.75z" fillRule="nonzero"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                       
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Star Aditional Features */}
                        {selectedShapeType === "star" && (

                            <div className="w-full">
                                <button
                                    className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                    onClick={() => toggleParameterPanelSection(4)}
                                >
                                    {t('shapes.star')}
                                    {checkParameterPanelSection(4) ? (
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
                                    checkParameterPanelSection(4) ? '' : 'max-h-0 p-0 border-0'
                                    }`}
                                >
                                    <div className='flex-row items-center justify-center grid grid-cols-2 gap-x-4 text-sm p-2 px-4'>
                                            <p className='flex w-full text-left pl-1'>{t('editor.corners')}</p>
                                            <input className={defaultInputClassName} onChange={editorStarNumPointsValueHandler} value={editorStarNumPointsValue}></input>


                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className='absolute bottom-0 items-center justify-center max-h-[10vh] z-30'>
                </div>
            </div>
        </div>
        {showAddImagePage && (<AddImage onClose={() => setShowAddImagePage(false)} showAdvert={false} mainPageMode={false} setShapes={setShapes} setSelectedId={setSelectedId}/>)}
        </>
    );
}

export default QuestionCreator;