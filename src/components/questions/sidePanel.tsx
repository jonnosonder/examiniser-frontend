// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ReloadLink } from '../editor/reloadLink';
import SwitchLanuageDropDown from '../editor/switchLanuageDropDown';
import { Locale } from '@/lib/locales';
import "@/styles/navbar.css"

function normalizePath(path: string): string {
    if (path.length > 1 && path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
}

export default function QuestionNavBar({
    lng,
    buttons
}: {
    lng: Locale,
    buttons: {
        label: string;
        description: string;
        delay: string;
        link: string;
        topics: string[];
        topicLinks: string[];
    }[]
}) {
    const router = useRouter();
    const pathname = normalizePath(usePathname() ?? "");

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
                {buttons.map((button) => {
                    const mainPath = normalizePath(button.link);
                    const mainActive = pathname === mainPath || pathname.startsWith(mainPath + "/");
                    return (
                        <div key={button.link} className="mb-3">
                            <button
                                type="button"
                                onClick={() => router.push(button.link)}
                                className={`
                                    w-full p-2 text-left text-primary font-nunito text-sm
                                    hover:bg-[var(--light-grey)] rounded cursor-pointer
                                    ${mainActive ? "bg-[var(--light-grey)] font-semibold" : ""}
                                `}
                            >
                                <span className="block truncate">{button.label}</span>
                            </button>
                            <ul className="mt-1 ml-1 pl-2 border-l border-[var(--grey)] flex flex-col gap-0.5">
                                {button.topics.map((topicLabel, i) => {
                                    const subPath = normalizePath(button.topicLinks[i]);
                                    const subActive = pathname === subPath;
                                    return (
                                        <li key={button.topicLinks[i]}>
                                            <button
                                                type="button"
                                                onClick={() => router.push(button.topicLinks[i])}
                                                className={`
                                                    w-full text-left p-1.5 pl-2 text-xs text-primary rounded cursor-pointer
                                                    hover:bg-[var(--light-grey)]
                                                    ${subActive ? "bg-[var(--light-grey)] font-medium" : ""}
                                                `}
                                            >
                                                {topicLabel}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className='flex items-center justify-center mb-5'>
                <SwitchLanuageDropDown current={lng} position="top-right" />
            </div>
        </div>
    );
}
