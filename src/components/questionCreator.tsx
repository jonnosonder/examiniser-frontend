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
import { addPageElement, addPageElementsInfo, deletePageElement, deletePageElementInfo, getEstimatedPage, getSpecificPageElementsInfo, getStageDimension, RENDER_PAGE, RENDER_PREVIEW, setPageElement, setPageElementsInfo } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { KonvaEventObject } from 'konva/lib/Node';
import Advert from './advert';
import '@/styles/QuestionCreator.css'
import { AddImage } from './addImage';

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
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false });
    const [selectedOption, setSelectedOption] = useState<string>('');

    const [selectedFillColorViaDisplay, setSelectedFillColorViaDisplay] = useState<string>("");
    const [selectedStrokeColorViaDisplay, setSelectedStrokeColorViaDisplay] = useState<string>("");
    const [showAddImagePage, setShowAddImagePage] = useState<boolean>(false);
    const [displayFillColorSelector, setDisplayFillColorSelector] = useState<boolean>(false);
    const toggleDisplayFillColorSelector = () => {setDisplayFillColorSelector(!displayFillColorSelector); if (!displayFillColorSelector && displayStrokeColorSelector) {setDisplayStrokeColorSelector(false)}}
    const [displayStrokeColorSelector, setDisplayStrokeColorSelector] = useState<boolean>(false);
    const toggleDisplayStrokeColorSelector = () => {setDisplayStrokeColorSelector(!displayStrokeColorSelector); if (!displayStrokeColorSelector && displayFillColorSelector) {setDisplayFillColorSelector(false)}}
    

    const [parameterPanelIndex, setParameterPanelIndex] = useState<Set<number>>(new Set([1]));
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
        if (selectedOption === "delete" && selectedId) {
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
    }, [selectedId, isAnInputActive])

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
            }
            setSelectedFillColorViaDisplay(shape.fill);
            setSelectedStrokeColorViaDisplay(shape.stroke);
        } else {
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
                console.log("width: "+ (stageDimension.width * scaleClac));
                console.log("height: "+ (stageDimension.height * scaleClac));
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
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addSquareHandle = () => {
        const newShape: ShapeData = {
            id: 'r'+Date.now(),
            type: 'rect',
            x: 20,
            y: 20,
            width: 200,
            height: 200,
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
        const newShape: ShapeData = {
            id: 'c'+Date.now(),
            type: 'oval',
            x: 50,
            y: 50,
            width: 40*2,
            height: 40*2,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWidth: 1,
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const addTriangleHandle = () => {
        const newShape: ShapeData = {
            id: 't'+Date.now(),
            type: 'tri',
            x: 20,
            y: 20,
            width: 100,
            height: 100,
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
        const newShape: ShapeData = {
            id: 's'+Date.now(),
            type: 'star',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
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

        let shiftX:number = Infinity;
        let shiftY:number = Infinity;
        let widestX:number = 0;
        let widestY:number = 0;

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

        console.log(shapes[0].x);
        console.log(shapes[0].y);
        console.log(shiftX);
        console.log(shiftY);

        shapes.forEach((element, i) => {
            shapes[i].x = element.x - shiftX;
            shapes[i].y = element.y - shiftY;
        })

        widestX -= shiftX;
        widestY -= shiftY;

        if (newQuestionCreating) {
            const pageOn = getEstimatedPage();
            addPageElementsInfo({widestX, widestY, x:0, y:0, rotation:0}, pageOn);
            addPageElement(shapes, pageOn);
            console.log(shapes);
        } else {
            if (questionEditingID.page !== null && questionEditingID.groupID !== null) {
                const previousGroupInfo = getSpecificPageElementsInfo(questionEditingID.page, questionEditingID.groupID);
                setPageElementsInfo({widestX, widestY, x:previousGroupInfo.x, y:previousGroupInfo.y, rotation: previousGroupInfo.rotation}, questionEditingID.page, questionEditingID.groupID);
                setPageElement(shapes, questionEditingID.page, questionEditingID.groupID);
            }
        }
        RENDER_PAGE();
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


    const editorShapeOnDragHandler = (e: KonvaEventObject<MouseEvent>) => {
        setEditorXpositionValue(String(Math.round((e.target.x() + Number.EPSILON) * 10000) / 10000));
        setEditorYpositionValue(String(Math.round((e.target.y() + Number.EPSILON) * 10000) / 10000));
    }

    const editorShapeOnTranformHandler = (e: KonvaEventObject<Event>) => {
        const node = e.target;
        const newWidth = Math.max(5, node.width() * node.scaleX());
        const newHeight = Math.max(5, node.height() * node.scaleY());
        const newRotation = node.rotation();
        if (selectedShapeType !== "oval" && selectedShapeType !== "star"){
            setEditorWidthValue(String(Math.round((newWidth + Number.EPSILON) * 10000) / 10000));
            setEditorHeightValue(String(Math.round((newHeight + Number.EPSILON) * 10000) / 10000));
        } else {
            setEditorWidthValue(String(Math.round((newWidth + Number.EPSILON) * 10000) / 20000));
            setEditorHeightValue(String(Math.round((newHeight + Number.EPSILON) * 10000) / 20000));
        }
        setEditorRotateValue(String(Math.round((Number(newRotation) + Number.EPSILON) * 10000) / 10000));
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
                <div className='absolute flex top-5 w-full items-center justify-center h-[85%]'>
                    <div className='bg-background flex flex-col rounded-lg p-2 m-2 border-2 border-primary rounded-xl w-[75vw] h-full'>
                        <div className='flex justify-between items-center justify-center'>
                            <h3 className='text-lg'>Question Creator Editor</h3>
                            <button onClick={onClose} className='w-6 h-6'>
                                <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                            </button>
                        </div>
                        <span className='flex w-full flex-1' />
                        <div className='flex flex-row w-full h-10 my-2'>
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
                                    <rect x="5.5" y="5.5" width="13" height="13" rx="0.5" stroke="black"/>
                                    <path d="M23.4847 3.196H21.2047V5.524H20.7847V3.196H18.5167V2.8H20.7847V0.46H21.2047V2.8H23.4847V3.196Z" fill="black"/>
                                </svg>
                            </button>
                            {/* Add Circle */}
                            <button className='w-10 h-full' onClick={addCircleHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.4847 3.196H21.2047V5.524H20.7847V3.196H18.5167V2.8H20.7847V0.46H21.2047V2.8H23.4847V3.196Z" fill="black"/>
                                    <circle cx="12" cy="12" r="6.5" stroke="black"/>
                                </svg>
                            </button>
                            {/* Add Triangle */}
                            <button className='w-10 h-full' onClick={addTriangleHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.4847 3.196H21.2047V5.524H20.7847V3.196H18.5167V2.8H20.7847V0.46H21.2047V2.8H23.4847V3.196Z" fill="black"/>
                                    <path d="M19.7949 18.5H4.20508L12 4.99902L19.7949 18.5Z" stroke="black"/>
                                </svg>
                            </button>
                            {/* Add Star */}
                            <button className='w-10 h-full' onClick={addStarHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23.4847 3.196H21.2047V5.524H20.7847V3.196H18.5167V2.8H20.7847V0.46H21.2047V2.8H23.4847V3.196Z" fill="black"/>
                                    <path d="M11.5254 5.31168C11.6136 5.12084 11.7984 5 12 5C12.2023 5 12.3864 5.12084 12.4746 5.31168C13.1564 6.78389 14.3296 9.32011 14.3296 9.32011C14.3296 9.32011 16.9973 9.70621 18.545 9.93095C18.8271 9.97147 19 10.2227 19 10.4814C19 10.6214 18.9496 10.7636 18.8383 10.8763C17.7113 12.0096 15.7709 13.9644 15.7709 13.9644C15.7709 13.9644 16.2448 16.7401 16.5192 18.3501C16.5773 18.6905 16.3267 19 15.9998 19C15.9144 19 15.829 18.9786 15.7513 18.9344C14.3737 18.1622 12 16.8337 12 16.8337C12 16.8337 9.6263 18.1622 8.2487 18.9344C8.171 18.9786 8.0849 19 7.9995 19C7.674 19 7.422 18.6898 7.4808 18.3501C7.7559 16.7401 8.2298 13.9644 8.2298 13.9644C8.2298 13.9644 6.2887 12.0096 5.1624 10.8763C5.0504 10.7636 5 10.6214 5 10.4821C5 10.2227 5.1743 9.97074 5.4557 9.93095C7.0034 9.70621 9.6704 9.32011 9.6704 9.32011C9.6704 9.32011 10.8443 6.78389 11.5254 5.31168ZM12 6.80968L10.3473 10.3406L6.6751 10.8704L9.3687 13.5547L8.7051 17.4268L12 15.5811L15.2949 17.4268L14.6292 13.5687L17.3249 10.8704L13.6051 10.3134L12 6.80968Z" fill="black"/>
                                </svg>
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
                                                    x: x * stageScale,
                                                    y: y * stageScale,
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
                        <div className='flex w-full mt-2 space-x-4'>
                            <button onClick={() => {setShapes([]);}} className='px-4 py-2 border-2 border-darkRed rounded-full bg-red text-white whitespace-nowrap'>Delete All</button>
                            <span className='flex w-full'></span>
                            <button onClick={() => {setDimensions({width: dimensions.width, height: dimensions.height * 2})}} className='px-4 py-2 border-2 border-primary rounded-full text-primary whitespace-nowrap'>Add Space</button>
                            <button onClick={() => {createHandler(); onClose();}} className='px-4 py-2 border-2 border-primary rounded-full whitespace-nowrap'>
                                {newQuestionCreating ? "Create" : "Set Edit"}
                            </button>
                        </div>
                    </div>
                    <div className='bg-background rounded-lg p-2 m-2 border-2 border-primary rounded-xl w-[20rem] h-full'>
                        <h3 className='text-center text-primary text-lg'>Parameters</h3>
                        
                        {/* Default Parameters */}
                        <div className="w-full">
                            <button
                                className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                onClick={() => toggleParameterPanelSection(1)}
                            >
                                Transform
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
                                checkParameterPanelSection(1) ? 'm-2' : 'max-h-0 p-0 border-0'
                                }`}
                            >       
                                <div className='flex w-full flex-row items-center justify-center'>
                                    <div className='flex flex-col space-y-2 items-start justify-center p-2'>
                                        <p className='text-primary'>x</p>
                                        <p className='text-primary'>w</p>
                                    </div>
                                    <div className='flex flex-col w-full space-y-2 items-start justify-center'>
                                        <input className='w-20 rounded-sm border border-primary px-1' value={editorXpositionValue} onChange={editorXpositionHandler}></input>
                                        <input className='w-20 rounded-sm border border-primary px-1' value={editorWidthValue} onChange={editorWidthValueHandler}></input>
                                    </div>
                                    <div className='flex flex-col space-y-2 items-start justify-center p-2'>
                                        <p className='text-primary'>y</p>
                                        <p className='text-primary'>h</p>
                                    </div>
                                    <div className='flex flex-col w-full space-y-2 items-start justify-center'>
                                        <input className='w-20 rounded-sm border border-primary px-1' value={editorYpositionValue} onChange={editorYpositionHandler}></input>
                                        <input className='w-20 rounded-sm border border-primary px-1' value={editorHeightValue} onChange={editorHeightValueHandler}></input>
                                    </div>
                                </div>
                                <div className='flex flex-row w-full space-x-2 items-center justify-center'>
                                    <svg className='w-4 h-4' version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 122.88 103.56"><g><path d="M59.49,1.72c1.03-1.69,3.24-2.23,4.94-1.2c1.69,1.03,2.23,3.24,1.2,4.94L34.75,55.92c6.65,4.72,12.18,10.9,16.11,18.07 c3.69,6.72,5.99,14.31,6.51,22.37h61.91c1.99,0,3.6,1.61,3.6,3.6c0,1.99-1.61,3.6-3.6,3.6H3.59v-0.01c-0.64,0-1.29-0.17-1.87-0.53 c-1.69-1.03-2.23-3.24-1.2-4.94L59.49,1.72L59.49,1.72z M31,62.05L10.01,96.36h40.14c-0.51-6.82-2.47-13.23-5.59-18.91 C41.22,71.36,36.57,66.1,31,62.05L31,62.05z"/></g></svg>
                                    <input className='w-20 rounded-sm border border-primary px-1' value={editorRotateValue} onChange={editorRotateValueHandler}></input>
                                </div>
                            </div>
                        </div>

                        {/* Styling Parameters */}
                        <div className="w-full">
                            <button
                                className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                onClick={() => toggleParameterPanelSection(2)}
                            >
                                Style
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
                                checkParameterPanelSection(2) ? 'm-2' : 'max-h-0 p-0 border-0'
                                }`}
                            >
                                <div className='flex w-full flex-row items-center justify-center h-20'>
                                    <div className='flex flex-col items-left justify-center'>
                                        <p className='p-2 text-start'>Fill</p>
                                        <p className='p-2 text-start'>Stroke</p>
                                    </div>
                                    <div className='flex flex-col items-center justify-center'>
                                        {/* Fill Colour */}
                                        <button onClick={toggleDisplayFillColorSelector} className='w-16 h-10 p-2'>
                                            <div ref={colourFillButtonDivRef} style={{background: selectedFillColorViaDisplay || 'white'}} className='w-full h-full border border-primary flex items-center justify-center rounded-sm'></div>
                                        </button>
                                        {displayFillColorSelector && (
                                        <div className='absolute flex items-center justify-center left-[22vw]'>
                                            <ColorSelectorSection onClose={() => setDisplayFillColorSelector(false)} passColorValue={setSelectedFillColorViaDisplay} startingColor={selectedFillColorViaDisplay}/>
                                        </div>
                                        )}
                                        {/* Stroke Colour */}
                                        <button onClick={toggleDisplayStrokeColorSelector} className='w-16 h-10 p-2'>
                                            <div ref={colourStrokeButtonDivRef} style={{background: selectedStrokeColorViaDisplay || 'black'}} className='w-full h-full border border-primary flex items-center justify-center rounded-sm'></div>
                                        </button>
                                        {displayStrokeColorSelector && (
                                        <div className='absolute flex items-center justify-center left-[25vw]'>
                                            <ColorSelectorSection onClose={() => setDisplayStrokeColorSelector(false)} passColorValue={setSelectedStrokeColorViaDisplay} startingColor={selectedStrokeColorViaDisplay}/>
                                        </div>
                                        )}
                                    </div>
                                    <div className='flex flex-col items-left justify-center'>
                                        <p className='p-2 text-start'>Belve (%)</p>
                                        <p className='p-2 text-start'>Weight</p>
                                    </div>
                                    <div className="flex flex-col items-left justify-center">
                                        {/* Belve Weight */}
                                        <input className='w-12 rounded-sm border border-primary px-1 m-2' value={editorCornerRadiusValue} onChange={editorCornerRadiusValueHandler}></input>
                                        {/* Stroke Weight */}
                                        <input className='w-12 rounded-sm border border-primary px-1 m-2' value={editorStrokeWeightValue} onChange={editorStrokeWeightValueHandler}></input>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Aditional Features */}
                        {selectedShapeType === "text" && (

                            <div className="w-full">
                                <button
                                    className="w-full flex justify-between items-center py-1 bg-transparent text-primary text-base transition cursor-pointer"
                                    onClick={() => toggleParameterPanelSection(3)}
                                >
                                    Font
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
                                    <div className='flex w-full flex-col items-center justify-center'>
                                        <div className='flex w-full h-10 flex-row items-center justify-center space-x-2'>
                                            {/*<p className='whitespace-nowrap'>Font Size</p>*/}

                                            
                                            <svg className='h-10' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.88109 6.4H14.5211V9.66H14.0011L13.4211 7.56C13.3811 7.4 13.3344 7.28667 13.2811 7.22C13.2411 7.14 13.1544 7.09333 13.0211 7.08C12.8878 7.05333 12.6611 7.04 12.3411 7.04H10.0811V18.38C10.0811 18.8467 10.1011 19.12 10.1411 19.2C10.1811 19.28 10.3078 19.3333 10.5211 19.36L11.6211 19.48V20H6.80109V19.48L7.90109 19.36C8.11443 19.3333 8.24109 19.28 8.28109 19.2C8.32109 19.12 8.34109 18.8467 8.34109 18.38V7.04H6.06109C5.75443 7.04 5.52776 7.05333 5.38109 7.08C5.24776 7.09333 5.15443 7.14 5.10109 7.22C5.06109 7.28667 5.02109 7.4 4.98109 7.56L4.40109 9.66H3.88109V6.4ZM14.923 13.2H20.243V14.83H19.983L19.693 13.78C19.673 13.7 19.6496 13.6433 19.623 13.61C19.603 13.57 19.5596 13.5467 19.493 13.54C19.4263 13.5267 19.313 13.52 19.153 13.52H18.023V19.19C18.023 19.4233 18.033 19.56 18.053 19.6C18.073 19.64 18.1363 19.6667 18.243 19.68L18.793 19.74V20H16.383V19.74L16.933 19.68C17.0396 19.6667 17.103 19.64 17.123 19.6C17.143 19.56 17.153 19.4233 17.153 19.19V13.52H16.013C15.8596 13.52 15.7463 13.5267 15.673 13.54C15.6063 13.5467 15.5596 13.57 15.533 13.61C15.513 13.6433 15.493 13.7 15.473 13.78L15.183 14.83H14.923V13.2Z" fill="black"/>
                                            </svg>

                                            {/*
                                            <button className='h-8' onClick={decreaseFontSizeHandle}>
                                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3.88109 6.4H14.5211V9.66H14.0011L13.4211 7.56C13.3811 7.4 13.3344 7.28667 13.2811 7.22C13.2411 7.14 13.1544 7.09333 13.0211 7.08C12.8878 7.05333 12.6611 7.04 12.3411 7.04H10.0811V18.38C10.0811 18.8467 10.1011 19.12 10.1411 19.2C10.1811 19.28 10.3078 19.3333 10.5211 19.36L11.6211 19.48V20H6.80109V19.48L7.90109 19.36C8.11443 19.3333 8.24109 19.28 8.28109 19.2C8.32109 19.12 8.34109 18.8467 8.34109 18.38V7.04H6.06109C5.75443 7.04 5.52776 7.05333 5.38109 7.08C5.24776 7.09333 5.15443 7.14 5.10109 7.22C5.06109 7.28667 5.02109 7.4 4.98109 7.56L4.40109 9.66H3.88109V6.4ZM14.923 13.2H20.243V14.83H19.983L19.693 13.78C19.673 13.7 19.6496 13.6433 19.623 13.61C19.603 13.57 19.5596 13.5467 19.493 13.54C19.4263 13.5267 19.313 13.52 19.153 13.52H18.023V19.19C18.023 19.4233 18.033 19.56 18.053 19.6C18.073 19.64 18.1363 19.6667 18.243 19.68L18.793 19.74V20H16.383V19.74L16.933 19.68C17.0396 19.6667 17.103 19.64 17.123 19.6C17.143 19.56 17.153 19.4233 17.153 19.19V13.52H16.013C15.8596 13.52 15.7463 13.5267 15.673 13.54C15.6063 13.5467 15.5596 13.57 15.533 13.61C15.513 13.6433 15.493 13.7 15.473 13.78L15.183 14.83H14.923V13.2Z" fill="black"/>
                                                </svg>
                                            </button>
                                            */}
                                            {/* Text Size Input */}
                                            <input className='flex w-10' type="number" onChange={editorTextSizeValueHandler} value={editorTextSizeValue}></input>
                                            {/*
                                            <button className='h-8' onClick={increaseFontSizeHandle}>  
                                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                                    <path d="M23.1007 6.664L22.7047 6.808L20.9887 2.464L19.2607 6.808L18.9007 6.664L20.8327 1.84H21.1687L23.1007 6.664Z" fill="black"/>
                                                </svg>
                                            </button>
                                            */}
                                        </div>
                                        <div className='flex w-full h-10 flex-row items-center justify-center space-x-2'>
                                            <p>Align</p>
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
                        )}

                    </div>
                </div>
                <div className='absolute bottom-0 items-center justify-center max-h-[10vh] z-30'>
                    <Advert slot="4588173114" />
                </div>
            </div>
        </div>
        {showAddImagePage && (<AddImage onClose={() => setShowAddImagePage(false)} showAdvert={false} mainPageMode={false} setShapes={setShapes} setSelectedId={setSelectedId}/>)}
        </>
    );
}

export default QuestionCreator;