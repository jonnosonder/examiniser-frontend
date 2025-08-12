// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";
import { useRouter } from 'next/navigation';
import '@/styles/landing.css';
import Navbar from '@/components/navbar';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      {/*Hero section*/}
      <div className="flex w-full h-full">
        {/*Animation section*/}
        <div className="absolute z-[-1] flex flex-col w-full h-full items-center justify-center gap-6 bg-background">
          <svg id="q1svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" stroke="var(--primary)" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="var(--primary)"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="var(--primary)"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="var(--primary)"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="var(--primary)"/>
          </svg>
          <svg id="q2svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" stroke="var(--primary)" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="var(--primary)"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="var(--primary)"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="var(--primary)"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="var(--primary)"/>
          </svg>
          <svg id="q3svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" stroke="var(--primary)" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="var(--primary)"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="var(--primary)"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="var(--primary)"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="var(--primary)"/>
          </svg>
          <svg className='absolute h-[30%] sm:h-[40%] lg:h-[50%]' id="papersvg" viewBox="0 0 97 134" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="93" height="130" rx="10" stroke="var(--primary)" strokeWidth="2"/>
            <line x1="11" y1="13.5" x2="87" y2="13.5" stroke="var(--primary)"/>
            <line x1="11" y1="21.5" x2="87" y2="21.5" stroke="var(--primary)"/>
            <line x1="11" y1="29.5" x2="87" y2="29.5" stroke="var(--primary)"/>
            <line x1="11" y1="37.5" x2="73" y2="37.5" stroke="var(--primary)"/>
            <line x1="11" y1="54.5" x2="87" y2="54.5" stroke="var(--primary)"/>
            <line x1="11" y1="62.5" x2="87" y2="62.5" stroke="var(--primary)"/>
            <line x1="11" y1="70.5" x2="87" y2="70.5" stroke="var(--primary)"/>
            <line x1="11" y1="78.5" x2="73" y2="78.5" stroke="var(--primary)"/>
            <line x1="11" y1="95.5" x2="87" y2="95.5" stroke="var(--primary)"/>
            <line x1="11" y1="103.5" x2="87" y2="103.5" stroke="var(--primary)"/>
            <line x1="11" y1="111.5" x2="87" y2="111.5" stroke="var(--primary)"/>
            <line x1="11" y1="119.5" x2="73" y2="119.5" stroke="var(--primary)"/>
          </svg>
        </div>
        {/*Contents section*/}
        <div className="flex flex-col w-[50vw] items-center justify-center">
          <div className='p-8'>
            <h1 id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
              Create Exam Papers<br />
              <span id="heroKeywordtextSpan">Quick</span> and <span id="heroKeywordtextSpan">Easy</span></h1>
            <p id="heroP" className="max-w-sm sm:max-w-md lg:max-w-xl text-primary sm:text-lg lg:text-xl break-words">An editor specialised in making question and exam papers. Easy to create and navigate with inbuilt templaets all for free!</p>
            <div id="heroButtonWrapper">
              <button className="mt-4 px-5 py-2 text-sm sm:text-base lg:text-lg hover:shadow-[0_0_0_0.5rem_theme('colors.accent')] transition-all duration-300 ease-in-out border-2 border-primary rounded-lg" onClick={() => router.push('/start')}>
                Start Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
