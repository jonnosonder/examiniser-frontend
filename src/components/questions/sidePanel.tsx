// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReloadLink } from '../editor/reloadLink';
import { useTranslation } from 'react-i18next';
import SwitchLanuageDropDown from '../editor/switchLanuageDropDown';
import { Locale } from '@/lib/locales';
import "@/styles/navbar.css"

export default function QuestionNavBar({ lng, pageOn } : {lng: Locale, pageOn: String}) {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <div className='sticky top-0 flex flex-col h-screen w-44 sm:w-48 lg:w-52 border-r border-r-[var(--grey)] bg-white shadow-[0.1rem_0_6px_-1px_var(--grey)]'>
            <ReloadLink reload={true} href={'/'+lng} router={router} className="w-full inline-flex items-center text-center justify-center text-primary font-nunito text-2xl sm:text-3xl lg:text-4xl cursor-pointer mt-2">
                Examiniser
            </ReloadLink>

            <div className="flex-1">
                {/* Your content here */}
            </div>

            <div className='flex items-center justify-center mb-5'>
                <SwitchLanuageDropDown current={lng}  position="top-right"/>
            </div>
        </div>
    );
}