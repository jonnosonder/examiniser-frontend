// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";
import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Locale } from '@/lib/locales';
import SidePanel from '@/components/questions/sidePanel';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Primary({ params }: { params: Promise<{ lng: Locale }> }) {
    const { t } = useTranslation();
    const resolvedParams = React.use(params);
    const { lng } = resolvedParams;
    const router = useRouter();

    const [buttonsReady, setButtonsReady] = React.useState(false);

    const titleRef = React.useRef<HTMLHeadingElement | null>(null);
    const descRef = React.useRef<HTMLParagraphElement | null>(null);

    React.useEffect(() => {
        const titleEl = titleRef.current;
        const descEl = descRef.current;
        if (!titleEl || !descEl) return;

        // Kick off the transitions
        titleEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        descEl.style.transition = 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s';

        const timer = setTimeout(() => {
            titleEl.style.opacity = '1';
            titleEl.style.transform = 'translateY(0)';
            descEl.style.opacity = '1';
            descEl.style.transform = 'translateY(0)';
            setTimeout(() => setButtonsReady(true), 100);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const buttons: { label: string; description: string, delay: string, link: string }[] = [
        { 
            label: t("primary-topics.numbers"),
            description: "",
            delay: "0ms",
            link: "/numbers"
        },
        {
            label: t("primary-topics.addition-subtraction"),
            description: "",
            delay: "120ms",
            link: "/addition-subtraction"
        },
        {
            label: t("primary-topics.multiplication-division"),
            description: "",
            delay: "240ms",
            link: "/multiplication-division"
        },
        {
            label: t("primary-topics.fractions-decimals-percentages"),
            description: "",
            delay: "360ms",
            link: "/fractions-decimals-percentages"
        },
        {
            label: t("primary-topics.measurement"),
            description: "",
            delay: "480ms",
            link: "/measurement"
        },
        {
            label: t("primary-topics.geometry"),
            description: "",
            delay: "600ms",
            link: "/geometry"
        },
        {
            label: t("primary-topics.algebra"),
            description: "",
            delay: "720ms",
            link: "/algebra"
        },
        {
            label: t("primary-topics.statistics"),
            description: "",
            delay: "840ms",
            link: "/statistics"
        },
        {
            label: t("primary-topics.problem-solving"),
            description: "",
            delay: "960ms",
            link: "/problem-solving"
        }
    ];

    return (
        <div className='flex w-full bg-background'>
            <SidePanel lng={lng} pageOn={"/"} />
            <div className='flex-1 flex flex-col items-center justify-start ml-10 mr-10'>
                <Link href={`/${lng}/`} className='flex w-full items-center justify-end self-end mt-5 text-sm text-primary'>
                    <span className='underline'>{t("general.back-to-home")}</span>&nbsp;→
                </Link>

                {/* ↓ Start hidden via inline style — no flash on first paint */}
                <h1
                    ref={titleRef}
                    style={{ opacity: 0, transform: 'translateY(12px)' }}
                    className='text-4xl mt-10 font-nunito text-primary'
                >
                    {t("education.primary-school")}
                </h1>
                <p
                    ref={descRef}
                    style={{ opacity: 0, transform: 'translateY(12px)' }}
                    className='mt-2 text-center'
                >
                    {t("education.primary-school-description")}
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mt-10 mb-10'>
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(`/${lng}/primary` + button.link)}
                            style={{
                                opacity: buttonsReady ? 1 : 0,
                                transform: buttonsReady ? 'translateY(0)' : 'translateY(16px)',
                                transition: `opacity 0.5s ease ${button.delay}, transform 0.5s ease ${button.delay}`,
                            }}
                            className="w-[16rem] h-[16rem] items-center justify-start text-primary
                                border-2 border-primary rounded-[1rem] flex flex-col p-4 text-xl
                                hover:shadow-[0_0_0_0.6rem_var(--contrast)]"
                        >
                            {t(button.label)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}