'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
//import useImage from 'use-image';
import CanvasElements from '@/components/canvasElements'
import CustomContextMenu from '@/components/customContextMenu';
import { ShapeData } from '@/lib/shapeData';
import { addPageElement, addPageElementsInfo, deletePageElement, deletePageElementInfo, getEstimatedPage, getGlobalStageScale, getMarginValue, getSpecificPageElementsInfo, getStageDimension, setPageElement, setPageElementsInfo } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';
import { KonvaEventObject } from 'konva/lib/Node';
import Advert from './advert';

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
    const [displayFillColorSelector, setDisplayFillColorSelector] = useState<boolean>(false);
    const toggleDisplayFillColorSelector = () => {setDisplayFillColorSelector(!displayFillColorSelector); if (!displayFillColorSelector && displayStrokeColorSelector) {setDisplayStrokeColorSelector(false);}}
    const [displayStrokeColorSelector, setDisplayStrokeColorSelector] = useState<boolean>(false);
    const toggleDisplayStrokeColorSelector = () => {setDisplayStrokeColorSelector(!displayStrokeColorSelector); if (!displayStrokeColorSelector && displayFillColorSelector) {setDisplayFillColorSelector(false);}}

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
    const [fontScale, setFontScale] = useState(1);

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
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
        }
        };

        const shape = shapes.find(shape => shape.id === selectedId);
        if (shape){
            setSelectedShapeType(shape.type);
            setEditorXpositionValue(String(shape.x));
            setEditorYpositionValue(String(shape.y));
            if (shape.type !== "oval"){
                setEditorWidthValue(String(shape.width));
                setEditorHeightValue(String(shape.height));
            } else {
                setEditorWidthValue(String(shape.radiusX));
                setEditorHeightValue(String(shape.radiusY));
            }
            setEditorRotateValue(String(shape.rotation));
            setSelectedFillColorViaDisplay(shape.fill);
            setSelectedStrokeColorViaDisplay(shape.stroke);
        } else {
            setSelectedShapeType(null);
            setEditorXpositionValue("0");
            setEditorYpositionValue("0");
            setEditorWidthValue("0");
            setEditorHeightValue("0");
            setEditorRotateValue("0");
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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    useEffect(() => {
        const updateSize = () => {
            if (stageContainerRef.current) {
                const stageDimension = getStageDimension();
                const scaleClac = stageContainerRef.current.offsetWidth / stageDimension.width;
                setStageScale(scaleClac);
                setFontScale(getGlobalStageScale());
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
            strokeWeight: 1
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
        setSelectedId(newShape.id);
    }

    const increaseFontSizeHandle = () => {
        setShapes(prevShapes =>
            prevShapes.map(shape => {
            if (shape.id === selectedId && shape.type === 'text') {
                return { ...shape, fontSize: (shape.fontSize + 1) };
            }
            return shape;
            })
        );
    };

    const decreaseFontSizeHandle = () => {
        setShapes(prevShapes =>
            prevShapes.map(shape => {
            if (shape.id === selectedId && shape.type === 'text' && shape.fontSize > 1) {
                return { ...shape, fontSize: (shape.fontSize - 1) };
            }
            return shape;
            })
        );
    };

    const addSquareHandle = () => {
        const newShape: ShapeData = {
            id: 'r'+Date.now(),
            type: 'rect',
            x: 20,
            y: 20,
            width: 100,
            height: 100,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWeight: 1
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
            radiusX: 40,
            radiusY: 40,
            width: 80,
            height: 80,
            rotation: 0,
            fill: 'black',
            stroke: 'red',
            strokeWeight: 1
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
            strokeWeight: 1
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
                    return;
                }
            }
        }

        let widestX = 0;
        let widestY = 0;

        shapes.forEach((element) => {
            let x: number;
            let y: number;
            if (element.type === "oval"){
                x = element.x + element.width/2;
                y = element.y + element.height/2;
            } else {
                x = element.x + element.width;
                y = element.y + element.height;
            }
            if (x > widestX) widestX = x;
            if (y > widestY) widestY = y;
        });

        if (newQuestionCreating) {
            const pageOn = getEstimatedPage();
            addPageElementsInfo({widestX, widestY, x:0, y:0}, pageOn);
            addPageElement(shapes, pageOn);
            console.log(shapes);
        } else {
            if (questionEditingID.page !== null && questionEditingID.groupID !== null) {
                const previousGroupInfo = getSpecificPageElementsInfo(questionEditingID.page, questionEditingID.groupID);
                setPageElementsInfo({widestX, widestY, x:previousGroupInfo.x, y:previousGroupInfo.y}, questionEditingID.page, questionEditingID.groupID);
                setPageElement(shapes, questionEditingID.page, questionEditingID.groupID);
            }
        }
    }

    const [editorXpositionValue, setEditorXpositionValue] = useState<string>("0");
    const [editorYpositionValue, setEditorYpositionValue] = useState<string>("0");
    const [editorWidthValue, setEditorWidthValue] = useState<string>("0");
    const [editorHeightValue, setEditorHeightValue] = useState<string>("0");
    const [editorRotateValue, setEditorRotateValue] = useState<string>("0");

    const editorXpositionHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            if (value === "") {
                setEditorXpositionValue("");
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

    const editorShapeOnDragHandler = (e: KonvaEventObject<MouseEvent>) => {
        setEditorXpositionValue(String(Math.round((e.target.x() + Number.EPSILON) * 10000) / 10000));
        setEditorYpositionValue(String(Math.round((e.target.y() + Number.EPSILON) * 10000) / 10000));
    }

    const editorShapeOnTranformHandler = (e: KonvaEventObject<Event>) => {
        const node = e.target;
        const newWidth = Math.max(5, node.width() * node.scaleX());
        const newHeight = Math.max(5, node.height() * node.scaleY());
        const newRotation = node.rotation();
        if (selectedShapeType !== "oval"){
            setEditorWidthValue(String(Math.round((newWidth + Number.EPSILON) * 10000) / 10000));
            setEditorHeightValue(String(Math.round((newHeight + Number.EPSILON) * 10000) / 10000));
        } else {
            setEditorWidthValue(String(Math.round((newWidth + Number.EPSILON) * 10000) / 20000));
            setEditorHeightValue(String(Math.round((newHeight + Number.EPSILON) * 10000) / 20000));
        }
        setEditorRotateValue(String(Math.round((Number(newRotation) + Number.EPSILON) * 10000) / 10000));
    }

    return(
        <div onContextMenu={handleContextMenu}>
            <CustomContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                onClose={closeContextMenu}
                onSelect={handleSelect}
            />
            <div className='absolute flex z-10 w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center'>
                <div className='flex w-full items-center justify-center space-x-2 h-3/4'>
                    <div className='bg-background rounded-lg p-2 border-2 border-primary rounded-xl w-[75vw] h-full'>
                        <div className='flex justify-between items-center justify-center'>
                            <h3 className='text-lg'>Question Creator Editor</h3>
                            <button onClick={onClose} className='w-6 h-6'>
                                <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                            </button>
                        </div>
                        <div className='flex flex-row w-full h-10 my-2'>
                            {/* Add Text */}
                            <button onClick={addTextHandle}>
                                <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
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

                            {/* Text Aditional Features */}
                            {selectedShapeType === "text" && (
                                <>  
                                {/* Text Increase Font Size */}
                                <button onClick={increaseFontSizeHandle}>  
                                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                        <path d="M23.1007 6.664L22.7047 6.808L20.9887 2.464L19.2607 6.808L18.9007 6.664L20.8327 1.84H21.1687L23.1007 6.664Z" fill="black"/>
                                    </svg>
                                </button>
                                {/* Text Decrease Font Size */}
                                <button onClick={decreaseFontSizeHandle}>
                                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                        <path d="M18.8993 2.336L19.2953 2.192L21.0113 6.536L22.7393 2.192L23.0993 2.336L21.167 7.16H20.8313L18.8993 2.336Z" fill="black"/>
                                    </svg>
                                </button>
                                </>
                            )}

                        </div>
                        <div ref={stageContainerRef} className='w-full h-[55vh] flex overflow-y-auto overflow-x-auto border-2 border-primary bg-white justify-start'>
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
                                                let minX: number;
                                                let minY: number;
                                                let maxX: number;
                                                let maxY: number;

                                                if (shape.type === "oval") {
                                                    minX = +shape.radiusX;
                                                    minY = +shape.radiusY;
                                                    maxX = dimensions.width - shape.radiusX;
                                                    maxY = dimensions.height - shape.radiusY;
                                                } else {
                                                    minX = 0;
                                                    minY = 0;
                                                    maxX = dimensions.width - shape.width;
                                                    maxY = dimensions.height - shape.height;
                                                }

                                                if (x < minX) {
                                                    x = minX;
                                                    setEditorXpositionValue(String(x));
                                                }
                                                if (y < minY) {
                                                    y = minY;
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
                                                setDraggable={true}
                                                stageScale={stageScale}
                                                fontScale={fontScale}
                                                dragBoundFunc={dragBoundFunc}
                                                stageWidth={dimensions.width}
                                                stageHeight={dimensions.height}
                                                listening={true}
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
                            <button onClick={() => {setShapes([]);}} className='px-4 py-2 border-2 border-darkRed rounded-full bg-red text-white'>Delete</button>
                            <span className='flex w-full'></span>
                            <button onClick={() => {setDimensions({width: dimensions.width, height: dimensions.height * 2})}} className='px-4 py-2 border-2 border-primary rounded-full text-primary whitespace-nowrap'>Add Space</button>
                            <button onClick={() => {createHandler(); onClose();}} className='px-4 py-2 border-2 border-primary rounded-full whitespace-nowrap'>
                                {newQuestionCreating ? "Create" : "Set Edit"}
                            </button>
                        </div>
                    </div>
                    <div className='bg-background rounded-lg p-2 border-2 border-primary rounded-xl w-[20vw] h-full'>
                        <h3 className='flex text-left text-primary text-lg'>Parameters</h3>
                        <div className='w-full h-[1px] bg-grey rounded-full my-2'></div>
                        {/* Default Parameters */}
                        <div className='flex flex-col w-full space-y-2'>
                            <p className='text-center text-primary'>Transform</p>
                            <div className='flex flex-row w-full space-x-2 items-center justify-center'>
                                <p className='text-primary'>x</p>
                                <input className='w-20 rounded-sm border border-primary' value={editorXpositionValue} onChange={editorXpositionHandler}></input>
                                <p className='text-primary'>y</p>
                                <input className='w-20 rounded-sm border border-primary' value={editorYpositionValue} onChange={editorYpositionHandler}></input>
                            </div>
                            <div className='flex flex-row w-full space-x-2 items-center justify-center'>
                                <p className='text-primary'>w</p>
                                <input className='w-20 rounded-sm border border-primary' value={editorWidthValue} onChange={editorWidthValueHandler}></input>
                                <p className='text-primary'>h</p>
                                <input className='w-20 rounded-sm border border-primary' value={editorHeightValue} onChange={editorHeightValueHandler}></input>
                            </div>
                            <div className='flex flex-row w-full space-x-2 items-center justify-center'>
                                <svg className='w-4 h-4' version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 122.88 103.56"><g><path d="M59.49,1.72c1.03-1.69,3.24-2.23,4.94-1.2c1.69,1.03,2.23,3.24,1.2,4.94L34.75,55.92c6.65,4.72,12.18,10.9,16.11,18.07 c3.69,6.72,5.99,14.31,6.51,22.37h61.91c1.99,0,3.6,1.61,3.6,3.6c0,1.99-1.61,3.6-3.6,3.6H3.59v-0.01c-0.64,0-1.29-0.17-1.87-0.53 c-1.69-1.03-2.23-3.24-1.2-4.94L59.49,1.72L59.49,1.72z M31,62.05L10.01,96.36h40.14c-0.51-6.82-2.47-13.23-5.59-18.91 C41.22,71.36,36.57,66.1,31,62.05L31,62.05z"/></g></svg>
                                <input className='w-20 rounded-sm border border-primary' value={editorRotateValue} onChange={editorRotateValueHandler}></input>
                            </div>
                        </div>
                        <div className='w-full h-[1px] bg-grey rounded-full my-2'></div>
                        {/* Styling Parameters */}
                        <div className='flex flex-col w-full space-y-2'>
                            <p className='text-center text-primary'>Style</p>
                            <div className='flex w-full flex-row items-center justify-center'>
                                <div className='flex flex-col items-left justify-center h-20'>
                                    <p className='p-2 text-start'>Fill</p>
                                    <p className='p-2 text-start'>Stroke</p>
                                </div>
                                <div className='flex flex-col items-center justify-center'>
                                    {/* Fill Colour */}
                                    <button onClick={toggleDisplayFillColorSelector} className='w-24 h-10 p-2'>
                                        <div ref={colourFillButtonDivRef} style={{background: selectedFillColorViaDisplay || 'white'}} className='w-full h-full border border-primary flex items-center justify-center rounded-sm'></div>
                                    </button>
                                    {displayFillColorSelector && (
                                    <div className='absolute flex items-center justify-center left-[22vw]'>
                                        <ColorSelectorSection onClose={() => setDisplayFillColorSelector(false)} passColorValue={setSelectedFillColorViaDisplay} startingColor={selectedFillColorViaDisplay}/>
                                    </div>
                                    )}
                                    {/* Stroke Colour */}
                                    <button onClick={toggleDisplayStrokeColorSelector} className='w-24 h-10 p-2'>
                                        <div ref={colourStrokeButtonDivRef} style={{background: selectedStrokeColorViaDisplay || 'black'}} className='w-full h-full border border-primary flex items-center justify-center rounded-sm'></div>
                                    </button>
                                    {displayStrokeColorSelector && (
                                    <div className='absolute flex items-center justify-center left-[25vw]'>
                                        <ColorSelectorSection onClose={() => setDisplayStrokeColorSelector(false)} passColorValue={setSelectedStrokeColorViaDisplay} startingColor={selectedStrokeColorViaDisplay}/>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='w-full h-[1px] bg-grey rounded-full my-2'></div>
                    </div>
                </div>
                <div className='absolute bottom-2 w-full max-h-[10%] z-10000'>
                    <Advert slot="1234567890" />
                </div>
            </div>
        </div>
    );
}

export default QuestionCreator;