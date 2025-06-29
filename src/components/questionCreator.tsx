'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
//import useImage from 'use-image';
import CanvasElements from '@/components/canvasElements'
import CustomContextMenu from '@/components/customContextMenu';
import { ShapeData } from '@/lib/shapeData';
import { addGroup, getMarginValue, getStageDimension } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';

type QuestionCreatorProps = {
  onClose: () => void;
};

const QuestionCreator: React.FC<QuestionCreatorProps> = ({ onClose }) => {
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false });
    const [selectedOption, setSelectedOption] = useState<string>('Nothing selected');

    const [shapes, setShapes] = useState<ShapeData[]>([]);

    const [displayColorSelector, setDisplayColorSelector] = useState<boolean>(false);
    const toggleDisplayColorSelector = () => {setDisplayColorSelector(!displayColorSelector)}
    const [selectedColorViaDisplay, setSelectedColorViaDisplay] = useState<string>("");

    useEffect(() => {
        if (selectedId) {
            setShapes((prevShapes) =>
                prevShapes.map((shape) =>
                    shape.id === selectedId
                        ? { ...shape, fill: selectedColorViaDisplay }
                        : shape
                )
            );
        }
    }, [selectedColorViaDisplay])

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
    }, [selectedOption])

    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const updateShape = (newAttrs: ShapeData) => {
        setShapes((prev) =>
        prev.map((shape) => (shape.id === newAttrs.id ? newAttrs : shape))
        );
    };

    const colourButtonDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedId) {
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
        }
        };

        const shape = shapes.find(shape => shape.id === selectedId);
        if (shape != undefined && colourButtonDivRef.current && shape.fill) {
            colourButtonDivRef.current.style.background = shape.fill;
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
                const marginVlaue = getMarginValue();
                const scaleX = stageContainerRef.current.offsetWidth / (stageDimension.width - marginVlaue*2);
                const scaleY = stageContainerRef.current.offsetHeight / (stageDimension.height  - marginVlaue*2);
                const scale = Math.max(scaleX, scaleY);
                setStageScale(scale);
                setDimensions({
                    width: (stageDimension.width - marginVlaue*2),
                    height: stageContainerRef.current.offsetHeight / scale -1,
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
            width: 300,
            height: 30,
            rotate: 0,
            fontSize: 24,
            fill: 'black',
            background: '',
            stroke: '',
            strokeWeight: 1
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
    }

    const increaseFontSizeHandle = () => {
        setShapes(prevShapes =>
            prevShapes.map(shape => {
            if (shape.id === selectedId && shape.type === 'text') {
                return { ...shape, fontSize: shape.fontSize + 1 };
            }
            return shape;
            })
        );
    };

    const decreaseFontSizeHandle = () => {
        setShapes(prevShapes =>
            prevShapes.map(shape => {
            if (shape.id === selectedId && shape.type === 'text' && shape.fontSize > 1) {
                return { ...shape, fontSize: shape.fontSize - 1 };
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
            rotate: 0,
            fill: 'black',
            stroke: 'red',
            strokeWeight: 1
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
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
            rotate: 0,
            fill: 'black',
            stroke: 'red',
            strokeWeight: 1
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
    }

    const addTriangleHandle = () => {
        const newShape: ShapeData = {
            id: 't'+Date.now(),
            type: 'tri',
            x: 20,
            y: 20,
            width: 100,
            height: 100,
            rotate: 0,
            fill: 'black',
            stroke: 'red',
            strokeWeight: 1
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
    }

    const createHandler = () => {
        let minX = Infinity;
        let minY = Infinity;

        shapes.forEach(shape => {
            if (shape.type === 'oval'){
                minX = Math.min(minX, shape.x - shape.radiusX);
                minY = Math.min(minY, shape.y - shape.radiusY);
            } else {
                minX = Math.min(minX, shape.x);
                minY = Math.min(minY, shape.y);
            }
        });

        shapes.forEach(shape => {
            shape.x -= minX;
            shape.y -= minY;
        });

        addGroup(shapes);
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
                <div className='bg-background rounded-lg p-2 border-2 border-primary rounded-xl'>
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
                        {/* Fill Colour */}
                        <button onClick={toggleDisplayColorSelector} className='w-10 h-full p-2'>
                            <div ref={colourButtonDivRef} style={{background: 'black'}} className='w-full h-full border-2 border-primary text-white flex items-center justify-center'></div>
                        </button>
                        {displayColorSelector && (
                        <div className='absolute flex items-center justify-center left-[25vw]'>
                            <ColorSelectorSection onClose={() => setDisplayColorSelector(false)} passColorValue={setSelectedColorViaDisplay}/>
                        </div>
                        )}
                        {/* Add Square */}
                        <button className='w-10 h-full' onClick={addSquareHandle}>
                            <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="5.5" y="5.5" width="13" height="13" rx="0.5" stroke="black"/>
                                <path d="M23.4847 3.196H21.2047V5.524H20.7847V3.196H18.5167V2.8H20.7847V0.46H21.2047V2.8H23.4847V3.196Z" fill="black"/>
                            </svg>
                        </button>
                        {/* Add Square */}
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
                    </div>
                    <div ref={stageContainerRef} className='w-[85vw] h-[55vh] flex overflow-y-auto overflow-x-auto border-2 border-primary bg-white'>
                        <div className='flex'
                        style={{
                        width: dimensions.width * stageScale,
                        height: dimensions.height * stageScale,
                        overflow: 'hidden',
                        transformOrigin: 'top left',
                        }}>
                            <Stage width={dimensions.width} height={dimensions.height} scaleX={stageScale} scaleY={stageScale}
                            onMouseDown={(e) => {
                                if (e.target === e.target.getStage()) {
                                setSelectedId(null);
                                }
                            }}
                            pixelRatio={300}
                            style={{
                                transformOrigin: 'top left',
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

                                            if (x < minX) x = minX;
                                            if (y < minY) y = minY;
                                            if (x > maxX) x = maxX;
                                            if (y > maxY) y = maxY;

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
                                            dragBoundFunc={dragBoundFunc}
                                        />
                                    );
                                    })}
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                    <div className='flex w-full mt-2 space-x-4'>
                        <button onClick={() => {setShapes([]);}} className='px-4 py-2 border-2 border-darkRed rounded-full bg-red text-white'>Delete</button>
                        <span className='w-full'></span>
                        <button onClick={() => {setDimensions({width: dimensions.width, height: dimensions.height * 2})}} className='px-4 py-2 border-2 border-primary rounded-full text-primary whitespace-nowrap'>Add Space</button>
                        <button onClick={() => {createHandler(); onClose();}} className='px-4 py-2 border-2 border-primary rounded-full'>Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionCreator;