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

export default function QuestionNavBar({
    lng,
    pageOn,
    buttons
}: {
    lng: Locale,
    pageOn: String,
    buttons: {
        label: string;
        description: string;
        delay: string;
        link: string;
        topics: string[];
        topicLinks: string[];
    }[]
}) {
    const { t } = useTranslation();
    const router = useRouter();

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className='sticky top-0 flex flex-col h-screen w-44 sm:w-48 lg:w-52 border-r border-r-[var(--grey)] bg-white shadow-[0.1rem_0_6px_-1px_var(--grey)]'>
            <ReloadLink
                reload={true}
                href={'/' + lng}
                router={router}
                className="w-full inline-flex items-center text-center justify-center text-primary font-nunito text-2xl sm:text-3xl lg:text-4xl cursor-pointer mt-2"
            >
                Examiniser
            </ReloadLink>

            <div className="flex-1 m-2 overflow-y-auto">
                {buttons.map((button, index) => (
                    <div key={index} className="mb-2">
                        {/* Dropdown header */}
                        <div
                            className="
                                w-full p-2 text-left text-primary font-nunito 
                                hover:bg-[var(--light-grey)] cursor-pointer
                                flex justify-between items-center text-sm
                            "
                            onClick={() => toggleDropdown(index)}
                        >
                            <span className="truncate">{button.label}</span>
                            <span>{openIndex === index ? "▲" : "▼"}</span>
                        </div>

                        {/* Dropdown content */}
                        {openIndex === index && (
                            <div className="mt-1 ml-2 flex flex-col">
                                {button.topics.map((topic, i) => (
                                    <button
                                        key={i}
                                        className="
                                            text-left p-2 text-sm text-primary
                                            hover:bg-[var(--light-grey)] rounded
                                        "
                                        onClick={() => router.push(button.topicLinks[i])}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className='flex items-center justify-center mb-5'>
                <SwitchLanuageDropDown current={lng} position="top-right" />
            </div>
        </div>
    );
}