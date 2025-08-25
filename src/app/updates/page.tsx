// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";
import pkg from '@/../package.json';
const { version } = pkg;
import Navbar from '@/components/navbar';
import { useState } from 'react';

export default function Contact() {
    const [editPanelIndex, setEditPanelIndex] = useState<number | null>(-1);
        
    const toggleEditPanelSection = (index:number) => {
        setEditPanelIndex(editPanelIndex === index ? null : index);
    };

    return(
        <>
            <Navbar />
            <span className='w-full h-20 flex' />
            <div className='w-full h-[calc(100vh-5rem)] flex flex-col items-center justify-between overflow-y-auto text-primary'>
                <div className='w-[90vw] flex flex-col items-center justify-center'>
                    <h1 className="text-6xl p-2 font-nunito">Updates</h1>
                    <p className='p-2 pb-0'>Here is a track of each update to the website, feel free to email and suggest any ideas or problems.</p>
                    <p className='text-sm'>(This website is currently in beta versions, meaning this is not close to the final product)</p>
                    <div className='w-full flex flex-col items-center justify-center'>
                        <div className="w-full md:w-[80vw] lg:w-[70vw] p-2">
                            <p>Beta Releases</p>
                        </div>
                        <div className='space-y-2'>
                            <div className="w-full md:w-[80vw] lg:w-[70vw] border border-primary rounded-xl">
                                <button
                                    className="w-full text-2xl flex justify-between items-center px-4 py-2 bg-transparent text-primary text-base transition cursor-pointer"
                                    onClick={() => toggleEditPanelSection(2)}
                                >   
                                    <div>
                                        0.0.2 <span className='text-grey ml-1 text-sm'>— 25/08/2025</span>
                                    </div>
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
                                    className={`flex flex-col px-2 overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                                    editPanelIndex === 2 ? 'm-2 mt-0' : 'max-h-0 p-0 border-0'
                                    }`}
                                >   
                                    <p className="text-sm">
                                        - Link issues fixed <br/>
                                        - Secure connection added <br/>
                                        - Question Creator side parameter panel UI update and fixes <br/>
                                        - Export UI updated <br/>
                                        - Fixed key button &#39;delete&#39; whilst on Question Creator <br/>
                                        - Can now move elements to different pages <br/>
                                        - Template UI made <br/>
                                    </p>
                                    
                                </div>
                            </div>
                            <div className="w-full md:w-[80vw] lg:w-[70vw] border border-primary rounded-xl">
                                <button
                                    className="w-full text-2xl flex justify-between items-center px-4 py-2 bg-transparent text-primary text-base transition cursor-pointer"
                                    onClick={() => toggleEditPanelSection(1)}
                                >   
                                    <div>
                                        0.0.1 <span className='text-grey ml-1 text-sm'>— 22/08/2025</span>
                                    </div>
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
                                    className={`flex flex-col px-2 overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                                    editPanelIndex === 1 ? 'm-2 mt-0' : 'max-h-0 p-0 border-0'
                                    }`}
                                >   
                                    <p className="text-sm">
                                        - Initial release <br/>
                                        - Icon created <br/>
                                        - Pages home, about, updates, start, editor, 404 created <br/>
                                        - General editor functions completed <br/>
                                        - Start page only allows you to create a new project, can&#39;t import files (development started) <br/>
                                        - Limited shapes added <br/>
                                        - Export file type only has pdf <br/>
                                        - No templates added (in development) <br/>
                                        - Desktop focus layout <br/>
                                    </p>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full text-right p-2'>
                    <p>Version: {version}</p>
                </div>
            </div>
        </>
    );
}