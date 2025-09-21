// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';
import Navbar from '@/components/navbar';
import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Locale } from '@/lib/locales';

export default function AboutPage({ params }: { params: Promise<{ lng: Locale }> }) {
    const { t } = useTranslation();
    const resolvedParams = React.use(params); // unwrap the promise
    const { lng } = resolvedParams;

    return(
        <>
            <Navbar lng={lng} pageOn='/about'/>
            <span className='w-full h-20 flex' />
            <div className='w-full flex flex-col items-center justify-center scroll-y-auto text-primary'>
                <div className='w-full md:w-[90vw] lg:w-[80vw] h-full flex flex-col p-2'>
                    <div className='flex flex-col p-2'>
                        <h1 className="text-4xl font-nunito mb-2 animate-fadeInY [animation-delay:100ms] opacity-0">{t('about.about')}</h1>
                        <p className='animate-fadeInY [animation-delay:150ms] opacity-0'>
                            {t('about.description')}
                        </p>
                    </div>
                    <div className='flex flex-col p-2'>
                        <h1 className="text-4xl font-nunito mb-2 animate-fadeInY [animation-delay:200ms] opacity-0">{t('about.contact')}</h1>
                        <p className='animate-fadeInY [animation-delay:250ms] opacity-0'>{t('about.contactInfo')}</p>
                        <div className='inline-flex items-center animate-fadeInY [animation-delay:250ms] opacity-0'>
                            <svg className='w-5 h-5 m-2 ml-0' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
                            <p onClick={() => window.location.href = `mailto:examiniser@gmail.com`} className='text-blue-500 cursor-pointer'>examiniser@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}