// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';
import Navbar from '@/components/landing/navbar';
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
                    <div className='flex flex-col p-2'>
                        <h1 className="text-4xl font-nunito mb-2 animate-fadeInY [animation-delay:300ms] opacity-0">{t('about.how-to-show-support')}</h1>
                        <p className='animate-fadeInY [animation-delay:350ms] opacity-0'>{t('about.how-to-show-support-info')}</p>
                        <div className='inline-flex items-center animate-fadeInY [animation-delay:350ms] opacity-0'>
                            <svg className='w-5 h-5 m-2 ml-0' viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_730_27126)">
                                    <path d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z" fill="black"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_730_27126">
                                        <rect width="98" height="96" fill="white"/>
                                    </clipPath>
                                </defs>
                            </svg>
                            <p className='text-blue-500 cursor-pointer'>
                                <a href="https://github.com/jonnosonder/examiniser-frontend/" target="_blank" rel="noopener noreferrer">
                                    Github - Examiniser
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}