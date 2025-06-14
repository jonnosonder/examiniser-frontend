"use client";

import '../../styles/start.css';
import ArrowIcon from '@/components/arrowIcon';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
    const router = useRouter();

    const firstQuestionDiv = useRef<HTMLDivElement>(null);
    const firstQuestionLeft = useRef<HTMLButtonElement>(null);
    const firstQuestionRight = useRef<HTMLButtonElement>(null);
    const createFormDiv = useRef<HTMLDivElement>(null);

    const questionToCreatePaperTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = createFormDiv.current!;
        
        boxLeft.classList.remove('createNewPaperButtonWrapper');
        boxRight.classList.remove('createNewPaperButtonWrapper');
        boxLeft.classList.remove('fadeInTransition');
        boxRight.classList.remove('fadeInTransition');

        boxLeft.classList.add('fadeOutTransition');
        boxRight.classList.add('fadeOutTransition');

        void boxLeft.offsetWidth;
        void boxRight.offsetWidth;

        setTimeout(() => {
            firstDiv.classList.add("hidden");
            formDiv.classList.remove("hidden");
            formDiv.classList.add("flex");
            formDiv.classList.add("fadeInTransition");
            void formDiv.offsetWidth;
        }, 400);
    }

    const createPaperToQuestionTransition = () => {
        const boxLeft = firstQuestionLeft.current!;
        const boxRight = firstQuestionRight.current!;
        const firstDiv = firstQuestionDiv.current!;
        const formDiv = createFormDiv.current!;

        formDiv.classList.remove('fadeInTransition');
        formDiv.classList.add('fadeOutTransition');
        void formDiv.offsetWidth;


        setTimeout(() => {
            firstDiv.classList.remove("hidden");
            boxLeft.classList.remove('fadeOutTransition');
            boxRight.classList.remove('fadeOutTransition');
            boxLeft.classList.add('fadeInTransition');
            boxRight.classList.add('fadeInTransition');
            void boxLeft.offsetWidth;
            void boxRight.offsetWidth;
        }, 400);
    }
   
    return (
    <div className="w-full h-full flex">
        {/* Setup Questions */}
        <div onClick={() => router.push('/')} className="absolute z-[1] w-[4rem] h-[4rem] top-3 left-3 p-2 border-2 border-primary rounded-lg hover:shadow-[0_0_0_0.5rem_theme('colors.red')] transition-all duration-300">
            <ArrowIcon className='w-full h-full'/>
        </div>
        {/* Setup Questions */}
        <div ref={firstQuestionDiv} className="absolute w-full h-full flex justify-center items-center">
            {/* First option: new paper or continue */}
            <div className="flex flex-col sm:flex-row w-[80%] sm:w-[65%] lg:w-[50%] h-[20%] sm:h-[30%] lg:h-[40%] m-4 gap-8">
                <button ref={firstQuestionLeft} onClick={questionToCreatePaperTransition} className="createNewPaperButtonWrapper relative hover:shadow-[0_0_0_1rem_theme('colors.accent')] transition-all duration-300 ease-in-out border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Create New Paper
                </button>
                <button ref={firstQuestionRight} className="uploadPaperButtonWrapper relative hover:shadow-[0_0_0_1rem_theme('colors.contrast')] transition-all duration-300 ease-in-out border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Upload a Paper
                </button>
            </div>
        </div>
        {/* Create page */}
        <div ref={createFormDiv} className="absolute hidden flex-col w-full h-full flex justify-center items-center">
            {/* First option: new paper or continue */}
            <div className="flex flex-col w-[80%] sm:w-[65%] lg:w-[50%] m-2 p-8 gap-6 border-4 border-primary rounded-lg">
                <p className='text-center text-primary w-full text-xl sm:text-2xl lg:text-3xl font-bold'>Create File</p>
                <div className="inline-flex items-center space-x-4">
                    <p className="text-primary">File Name:</p>
                    <input type="email" className="border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder="Maths Exam" />
                </div>
                <div className="inline-flex items-center space-x-4">
                    <p className="text-primary">File Dimension:</p>
                    <select className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                        <option value="apple">Custom</option>
                        <option value="orange">A3</option>
                        <option value="banana">A4</option>
                        <option value="banana">A5</option>
                    </select>
                </div>
            </div>
            <div className='flex w-[80%] sm:w-[65%] lg:w-[50%] h-[8%] sm:h-[8%] lg:h-[10%]'>
                <div onClick={createPaperToQuestionTransition} className="flex m-2 ml-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.contrast')] transition-all duration-300">
                    <ArrowIcon className='w-full h-full'/>
                </div>
                <div className="flex w-full m-2 mr-0 p-2 border-4 border-primary rounded-lg justify-center items-center cursor-pointer hover:shadow-[0_0_0_0.5rem_theme('colors.accent')] transition-all duration-300 ease-in-out">
                    <p className='text-primary text-center text-lg sm:text-1xl lg:text-2xl font-bold'>Create</p>
                </div>
            </div>
        </div>
    </div>
);
}