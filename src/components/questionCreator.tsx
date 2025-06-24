'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image } from 'react-konva';
//import useImage from 'use-image';
import CanvasElements from '@/components/canvasElements'
import CustomContextMenu from '@/components/customContextMenu';
import { ShapeData } from '@/lib/shapeData';

type QuestionCreatorProps = {
  onClose: () => void;
};

const QuestionCreator: React.FC<QuestionCreatorProps> = ({ onClose }) => {
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false });
    const [selectedOption, setSelectedOption] = useState<string>('Nothing selected');

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, show: true });
    };

    const closeContextMenu = () => {
        setContextMenu(prev => ({ ...prev, show: false }));
    };

    const handleSelect = (option: string) => {
        setSelectedOption(option);

        if (option === "delete" && selectedId) {
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
        }
    };

    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

    const [shapes, setShapes] = useState<ShapeData[]>([
        { id: 'c1', type: 'circle', x: 200, y: 100, radius: 50, fill: 'blue' },
        { id: 't1', type: 'text', x: 50, y: 200, text: 'Hello Konva!', width: 200, height: 200, fontSize: 24, frontColor: 'black', backColor: '' },
        { id: 'i1', type: 'image', x: 300, y: 50, width: 100, height: 100, src: 'https://konvajs.org/assets/lion.png', fill: '' },
    ]);

    useEffect(() => {
        const updateSize = () => {
            if (stageContainerRef.current) {
                setDimensions({
                width: stageContainerRef.current.offsetWidth,
                height: stageContainerRef.current.offsetHeight,
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
            text: 'Lorem ipsum',
            width: 200,
            height: 30,
            fontSize: 24,
            frontColor: 'black',
            backColor: ''
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
    }

    const addSquareHandle = () => {
        const newShape: ShapeData = {
            id: 'r'+Date.now(),
            type: 'rect',
            x: 20,
            y: 20,
            width: 100,
            height: 100,
            fill: 'black'
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
    }

    const addCircleHandle = () => {
        const newShape: ShapeData = {
            id: 'c'+Date.now(),
            type: 'circle',
            x: 50,
            y: 50,
            radius: 40,
            fill: 'black'
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
            fill: 'black'
        };
        setShapes(prevShapes => [...prevShapes, newShape]);
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
                        <button>  
                            <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                <path d="M23.1007 6.664L22.7047 6.808L20.9887 2.464L19.2607 6.808L18.9007 6.664L20.8327 1.84H21.1687L23.1007 6.664Z" fill="black"/>
                            </svg>
                        </button>
                        {/* Text Decrease Font Size */}
                        <button>
                            <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.67406 6.4H17.3141V9.66H16.7941L16.2141 7.56C16.1741 7.4 16.1274 7.28667 16.0741 7.22C16.0341 7.14 15.9474 7.09333 15.8141 7.08C15.6807 7.05333 15.4541 7.04 15.1341 7.04H12.8741V18.38C12.8741 18.8467 12.8941 19.12 12.9341 19.2C12.9741 19.28 13.1007 19.3333 13.3141 19.36L14.4141 19.48V20H9.59406V19.48L10.6941 19.36C10.9074 19.3333 11.0341 19.28 11.0741 19.2C11.1141 19.12 11.1341 18.8467 11.1341 18.38V7.04H8.85406C8.5474 7.04 8.32073 7.05333 8.17406 7.08C8.04073 7.09333 7.9474 7.14 7.89406 7.22C7.85406 7.28667 7.81406 7.4 7.77406 7.56L7.19406 9.66H6.67406V6.4Z" fill="black"/>
                                <path d="M18.8993 2.336L19.2953 2.192L21.0113 6.536L22.7393 2.192L23.0993 2.336L21.167 7.16H20.8313L18.8993 2.336Z" fill="black"/>
                            </svg>
                        </button>
                        {/* Fill Colour */}
                        <button className='w-10 h-full p-2'>
                            <div ref={colourButtonDivRef} style={{background: 'black'}} className='w-full h-full border-2 border-primary text-white flex items-center justify-center'></div>
                        </button>
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
                    <div>
                        <div ref={stageContainerRef} className='w-[80vw]  h-[30vh]'>
                            <Stage width={dimensions.width-2} height={dimensions.height-2} className='flex border-2 border-primary bg-white w-full h-full'
                            onMouseDown={(e) => {
                                if (e.target === e.target.getStage()) {
                                setSelectedId(null);
                                }
                            }}>
                                <Layer>
                                    {shapes.map((shape) => (
                                        <CanvasElements
                                            key={shape.id}
                                            shape={shape}
                                            isSelected={shape.id === selectedId}
                                            onSelect={() => setSelectedId(shape.id)}
                                            onChange={updateShape}
                                        />
                                    ))}
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                    <div className='flex w-full mt-2 space-x-4'>
                        <span className='w-full'></span>
                        <button onClick={() => {setShapes([]);}} className='px-4 py-2 border-2 border-darkRed rounded-full bg-red text-white'>Delete</button>
                        <button className='px-4 py-2 border-2 border-primary rounded-full'>Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionCreator;