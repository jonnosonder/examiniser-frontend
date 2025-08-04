// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';
import Navbar from '@/components/navbar';

export default function About() {

    return(
        <>
            <Navbar />
            <span className='w-full h-20 flex' />
            <div className='w-full flex flex-col items-center justify-center scroll-y-auto text-primary'>
                <div className='w-full md:w-[90vw] lg:w-[80vw] h-full flex flex-col p-2'>
                    <div className='flex flex-col p-2'>
                        <h1 className="text-4xl font-nunito mb-2">About</h1>
                        <p className=''>
                            This website is made by a solo developer with the aim of helping people affiliated to eduction to make exam papers.
                            The aim is to put everything in one place, and make it accessible to anyone.
                        </p>
                    </div>
                    <div className='flex flex-col p-2'>
                        <h1 className="text-4xl font-nunito mb-2">Contact</h1>
                        <p>Feel free to email about any suggestions or problems.</p>
                        <div className='inline-flex items-center'>
                            <svg className='w-5 h-5 m-2 ml-0' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
                            <p onClick={() => window.location.href = `mailto:examiniser@gmail.com`} className='text-blue-500 cursor-pointer'>examiniser@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}