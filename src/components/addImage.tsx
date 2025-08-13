// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { useRef, useState } from "react";
import Advert from "./advert";
import { addPageElement, addPageElementsInfo, getEstimatedPage, RENDER_PAGE } from "@/lib/stageStore";
import { ShapeData } from "@/lib/shapeData";
import "@/styles/addImage.css"
import { useDropzone } from "react-dropzone";

type AddImageProps = {
  onClose: () => void;
  showAdvert: boolean;
  mainPageMode: boolean;
  setShapes?: React.Dispatch<React.SetStateAction<ShapeData[]>>;
  setSelectedId?: React.Dispatch<React.SetStateAction<string | null>>;
};

export const AddImage: React.FC<AddImageProps>  = ({onClose, showAdvert, mainPageMode, setShapes, setSelectedId}) => {
    const imageUrlRef = useRef<HTMLInputElement>(null);
    const fileDropRef = useRef<HTMLDivElement>(null);
    const [imageUrlValue, setImageUrlValue] = useState<string>("");
    const loadingInformationRef = useRef<HTMLDivElement>(null);
    const loadingAnimationRef = useRef<HTMLDivElement>(null);
    const tickRef = useRef<SVGSVGElement>(null);
    const crossRef = useRef<SVGSVGElement>(null);
    const pLoadingRef = useRef<HTMLParagraphElement>(null);

    const imageUrlInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const imageUrl = e.target.value;
        setImageUrlValue(imageUrl); // Always update
    }

    const addButtonHandler = () => {
        if (imageUrlValue !== "" || file) {
            if (tickRef.current) {
                tickRef.current.style.display = 'none';
            }
            if (crossRef.current) {
                crossRef.current.style.display = 'none';
            }
            if (loadingInformationRef.current) {
                loadingInformationRef.current.style.display="inline-flex";
            }
            if (loadingAnimationRef.current) {
                loadingAnimationRef.current.classList.remove('pausedAnimation');
                loadingAnimationRef.current.style.display = 'flex';
            }

            if (imageUrlValue !== "") {
                if (pLoadingRef.current) {
                    pLoadingRef.current.textContent = "Getting image from URL...";
                }
                const image = new Image();
                if (imageUrlValue !== "") {
                    image.crossOrigin = 'Anonymous';
                    image.src = imageUrlValue;
                }

                image.onload = () => {
                    if (pLoadingRef.current) {
                        pLoadingRef.current.textContent = "Image loaded...";
                    }
                    const pageToAddOn = getEstimatedPage();

                    const newImageShape: ShapeData = {
                        id: 'i'+Date.now(),
                        type: 'image',
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                        rotation: 0,
                        fill: '',
                        stroke: '',
                        strokeWidth: 0,
                        image: image,
                        cornerRadius: 0,
                    };

                    if (mainPageMode) { 
                        addPageElement([newImageShape], pageToAddOn);
                        addPageElementsInfo({widestX: image.width, widestY: image.height, x: 0, y: 0, rotation: 0}, pageToAddOn);
                        RENDER_PAGE();
                    } else {
                        setShapes?.(prevShapes => [...prevShapes, newImageShape]);
                        setSelectedId?.(newImageShape.id);
                    }

                    if (pLoadingRef.current) {
                        pLoadingRef.current.textContent = "Image added successfully!";
                    }
                    if (loadingAnimationRef.current) {
                        loadingAnimationRef.current.classList.add('pausedAnimation');
                        loadingAnimationRef.current.style.display = 'none';
                    }
                    if (tickRef.current) {
                        tickRef.current.style.display = 'flex';
                    }
                    
                    onClose();
                };

                image.onerror = () => {
                    if (pLoadingRef.current) {
                        pLoadingRef.current.textContent = "Failed to get image from URL!";
                    }
                    if (loadingAnimationRef.current) {
                        loadingAnimationRef.current.classList.add('pausedAnimation');
                        loadingAnimationRef.current.style.display = 'none';
                    }
                    if (crossRef.current) {
                        crossRef.current.style.display = 'flex';
                    }
                    if (imageUrlRef.current) {
                        imageUrlRef.current.classList.add('shake');
                        imageUrlRef.current.addEventListener(
                            'animationend',
                            () => {
                            imageUrlRef.current?.classList.remove('shake');
                            },
                            { once: true }
                        );
                    }
                };
            } else if (file) {
                if (pLoadingRef.current) {
                    pLoadingRef.current.textContent = "Getting image from file...";
                }
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();
                    const result = e.target?.result;
                    if (!result) return;
                    img.src = result as string;
                    
                    img.onload = () => {
                        const pageToAddOn = getEstimatedPage();

                        const newImageShape: ShapeData = {
                            id: 'i'+Date.now(),
                            type: 'image',
                            x: 0,
                            y: 0,
                            width: img.width,
                            height: img.height,
                            rotation: 0,
                            fill: '',
                            stroke: '',
                            strokeWidth: 0,
                            image: img,
                            cornerRadius: 0,
                        };

                        if (mainPageMode) { 
                            addPageElement([newImageShape], pageToAddOn);
                            addPageElementsInfo({widestX: img.width, widestY: img.height, x:0, y:0, rotation: 0}, pageToAddOn);
                            RENDER_PAGE();
                        } else {
                            setShapes?.(prevShapes => [...prevShapes, newImageShape]);
                            setSelectedId?.(newImageShape.id);
                        }


                        if (pLoadingRef.current) {
                            pLoadingRef.current.textContent = "Image added successfully!";
                        }
                        if (loadingAnimationRef.current) {
                            loadingAnimationRef.current.classList.add('pausedAnimation');
                            loadingAnimationRef.current.style.display = 'none';
                        }
                        if (tickRef.current) {
                            tickRef.current.style.display = 'flex';
                        }
                        onClose();
                    };

                    img.onerror = () => {
                        if (pLoadingRef.current) {
                            pLoadingRef.current.textContent = "Failed to load image from file!";
                        }
                        if (loadingAnimationRef.current) {
                            loadingAnimationRef.current.classList.add('pausedAnimation');
                            loadingAnimationRef.current.style.display = 'none';
                        }
                        if (crossRef.current) {
                            crossRef.current.style.display = 'flex';
                        }
                        if (fileDropRef.current) {
                            fileDropRef.current.classList.add('shake');
                            fileDropRef.current.addEventListener(
                                'animationend',
                                () => {
                                fileDropRef.current?.classList.remove('shake');
                                },
                                { once: true }
                            );
                        }
                    };
                };

                reader.readAsDataURL(file);
            }
        } else {
            if (imageUrlRef.current) {
                imageUrlRef.current.classList.add('shake');
                imageUrlRef.current.addEventListener(
                    'animationend',
                    () => {
                    imageUrlRef.current?.classList.remove('shake');
                    },
                    { once: true }
                );
            }
            if (fileDropRef.current) {
                fileDropRef.current.classList.add('shake');
                fileDropRef.current.addEventListener(
                    'animationend',
                    () => {
                    fileDropRef.current?.classList.remove('shake');
                    },
                    { once: true }
                );
            }
        }
    }

    const [file, setFile] = useState<File | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const uploadedFiles = acceptedFiles[0];
        setFile(uploadedFiles);
        if (loadingInformationRef.current) {
            loadingInformationRef.current.style.display = 'none';
        }
        setImageUrlValue('');
    };
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'image/*': []  // Accept all image types
        }
    });

    return (
        <div className='absolute flex z-20 w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0 right-0'>
            <div className="flex flex-col bg-background border border-grey space-y-4 p-2 rounded-lg max-h-[80%]">
                <div className="flex w-full items-center justify-between">
                    <h2 className="p-2">Add Image</h2>
                    <button className='p-2 m-0 ' onClick={onClose}>
                        <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                    </button>
                </div>
                <div className="flex flex-col w-full h-full items-center justify-center p-2 space-y-4">
                    <div className="flex flex-col w-full items-center justify-center">
                        <p>Image URL</p>
                        <input ref={imageUrlRef} value={imageUrlValue} onChange={imageUrlInputHandler} className="w-full border-2 border-primary rounded-md m-2 p-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder="https://your-image-url"></input>
                    </div>
                    <div className="flex flex-row w-full items-center justify-center">
                        <div className="h-[1px] rounded flex w-full bg-primary" />
                        <p className="flex mx-2">Or</p>
                        <div className="h-[1px] rounded flex w-full bg-primary" />
                    </div>
                    <div className="flex flex-col w-full items-center justify-center">
                        <p>Upload File</p>
                        <div ref={fileDropRef} className="w-full max-w-md m-2">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-primary border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                                    isDragActive ? 'bg-blue-100' : 'bg-white'
                                }`}
                                >
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p className="text-blue-700">Drop the file here...</p>
                                ) : (
                                    <p className="text-gray-500">Drag & drop a file here, or click to select one</p>
                                )}
                                {file && (
                                    <div className="mt-4">
                                    <p className="font-semibold">Uploaded File</p>
                                    <p className="w-full text-center truncate">{file.name}</p>
                                    <p>{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full justify-between">
                    <div className="items-end justify-center mb-1 mr-4" style={{display: 'none'}} ref={loadingInformationRef}>
                        <div className='loader mx-2' ref={loadingAnimationRef} style={{display: 'none'}}></div>
                        <svg ref={tickRef} style={{display: 'none'}} className="w-5 h-5 mx-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 17L7.01809 20.8601C7.82727 21.4825 8.99159 21.3081 9.5829 20.4759L22 3" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <svg ref={crossRef} style={{display: 'none'}} className="w-5 h-5 mx-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 22L22 2M2 2L22 22" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/>
                        </svg>

                        <p className="text-sm" ref={pLoadingRef}></p>
                    </div>
                    <span className='flex'></span>
                    <button onClick={addButtonHandler} className="border-2 border-primary text-primary text-lg rounded-lg py-1 px-4 transition-shadow duration-300 hover:shadow-[0_0_0_0.4rem_theme('colors.accent')] hover:outline-none">Add</button>
                </div>
            </div>
            {showAdvert && (
                <div className="absolute bottom-0 max-h-[10%]">
                    <Advert slot="1021151555" />
                </div>
            )}
        </div>
    );
} 