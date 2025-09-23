// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from 'react-i18next';
import '@/styles/landing.css';
import Navbar from '@/components/navbar';
import Link from 'next/link';
import * as React from "react";
import { Locale } from '@/lib/locales';

export default function Home({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const resolvedParams = React.use(params); // unwrap the promise
  const { lng } = resolvedParams;

  const templateTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateDescriptionRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add("animate-fadeInFromLeft");
            target.classList.remove("opacity-0");

            if (templateDescriptionRef.current) {
              setTimeout(() => {
                templateDescriptionRef.current?.classList.add("animate-fadeInFromLeft");
                templateDescriptionRef.current?.classList.remove("opacity-0");
              }, 100);
            }

            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.8,
      }
    );

    if (templateTitleRef.current) {
      observer.observe(templateTitleRef.current);
    }

    return () => {
      if (templateTitleRef.current) {
        observer.unobserve(templateTitleRef.current);
      }
    };
  }, []);

  return (
    <>
      <Navbar lng={lng} pageOn='/'/>
      {/*Hero section*/}
      <div className="flex flex-col w-full bg-background overflow-y-auto hide-scrollbar scrolling-smooth">
        <div className="
          absolute inset-0 z-0 
          [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] 
          [background-size:20px_20px] 
          [mask-image:radial-gradient(ellipse_70%_60%_at_50%_110%,#000_60%,transparent_100%)] 
          [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,#000_60%,transparent_100%)]"
        ></div>
        {/*Animation section*/}
        <div className="absolute z-[1] flex flex-col w-full h-full items-center justify-center gap-6">
          <svg id="q1svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" fill="white" stroke="black" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="black"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="black"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="black"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="black"/>
          </svg>
          <svg id="q2svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" fill="white" stroke="black" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="black"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="black"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="black"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="black"/>
          </svg>
          <svg id="q3svg" className='h-[10%] sm:h-[15%] lg:h-[20%]' viewBox="0 0 190 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="186" height="92" rx="10" fill="white" stroke="black" strokeWidth="2"/>
            <line x1="20" y1="25.5" x2="172" y2="25.5" stroke="black"/>
            <line x1="20" y1="41.5" x2="172" y2="41.5" stroke="black"/>
            <line x1="20" y1="57.5" x2="172" y2="57.5" stroke="black"/>
            <line x1="20" y1="73.5" x2="144" y2="73.5" stroke="black"/>
            </svg>
          <svg className='absolute h-[30%] sm:h-[40%] lg:h-[50%]' id="papersvg" viewBox="0 0 97 134" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="93" height="130" rx="10" fill="white" stroke="black" strokeWidth="2"/>
            <line x1="11" y1="13.5" x2="87" y2="13.5" stroke="black"/>
            <line x1="11" y1="21.5" x2="87" y2="21.5" stroke="black"/>
            <line x1="11" y1="29.5" x2="87" y2="29.5" stroke="black"/>
            <line x1="11" y1="37.5" x2="73" y2="37.5" stroke="black"/>
            <line x1="11" y1="54.5" x2="87" y2="54.5" stroke="black"/>
            <line x1="11" y1="62.5" x2="87" y2="62.5" stroke="black"/>
            <line x1="11" y1="70.5" x2="87" y2="70.5" stroke="black"/>
            <line x1="11" y1="78.5" x2="73" y2="78.5" stroke="black"/>
            <line x1="11" y1="95.5" x2="87" y2="95.5" stroke="black"/>
            <line x1="11" y1="103.5" x2="87" y2="103.5" stroke="black"/>
            <line x1="11" y1="111.5" x2="87" y2="111.5" stroke="black"/>
            <line x1="11" y1="119.5" x2="73" y2="119.5" stroke="black"/>
          </svg>

        </div>
        {/*Hero Section*/}
        <div className="flex flex-col h-[100vh] z-[2] w-[50vw] items-center justify-center">
          <div className='p-8'>
            {(lng === "en" || lng === "es" || lng === "fr") && (
              <h1 id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
              {t('home.CEP')} <br/>
              <span id="heroKeywordtextSpan">{t('home.quick')}</span> {t('home.and')} <span id="heroKeywordtextSpan">{t('home.easy')}</span></h1>
            )}
            {(lng === "jp") && (
              <h1 id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
              {t('home.CEP')}
              <span id="heroKeywordtextSpan">{t('home.quick')}</span><br/>{t('home.and')} <span id="heroKeywordtextSpan">{t('home.easy')}</span> {t('home.creation')}</h1>
            )}
            {lng === "zh" && (
              <h1 id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
              <span id="heroKeywordtextSpan">{t('home.quick')}</span>{t('home.and')}<span id="heroKeywordtextSpan">{t('home.easy')}</span>
              {t('home.CEP')}</h1>
            )}            
            <p id="heroP" className="mt-2 max-w-sm sm:max-w-md lg:max-w-xl text-primary sm:text-lg lg:text-xl break-words">{t('home.description')}</p>
            <div id="heroButtonWrapper">
              <button className="mt-4 flex text-sm sm:text-base lg:text-lg hover:shadow-[0_0_0_0.5rem_theme('colors.accent')] transition-all duration-300 ease-in-out border-2 border-primary rounded-lg">
                <Link className='w-full h-full px-5 py-2' href={`/${lng}/start`}>
                  {t('home.Start-Now')}
                </Link>
              </button>
            </div>
          </div>
        </div>
        {/*Template Section
        <div className="flex flex-col h-[90vh] z-[2] items-center justify-center relative">
            <div className="
              absolute inset-0 z-0
              [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] 
              [background-size:20px_20px] 
              "
            ></div>
            <div className='flex flex-col h-full w-[90vw] z-10'>
              <h1 className="text-primary w-full flex font-inter font-bold text-2xl sm:text-3xl lg:text-5xl mb-2 opacity-0" ref={templateTitleRef}>Templates</h1>
              <p className="text-primary w-full flex font-nunito sm:text-lg lg:text-xl ml-2 opacity-0" ref={templateDescriptionRef}>Range of templates to add instantly</p>
            </div>
        </div>
        */}
      </div>
    </>
  );
}
