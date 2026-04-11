// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";
import { useTranslation } from 'react-i18next';
import * as React from "react";
import { Locale } from '@/lib/locales';
import SidePanel from '@/components/questions/sidePanel';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { NumbersIcon, AdditionSubtractionIcon, MultiplicationDivisionIcon, FractionsIcon, MeasurementIcon, GeometryIcon, AlgebraIcon, StatisticsIcon, ProblemSolvingIcon } from '@/assets/icons/primary';

export default function Numbers({ params }: { params: Promise<{ lng: Locale }> }) {
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

    const buttons: { label: string; description: string; icon: React.ReactNode; delay: string; link: string; topics: string[]; topicLinks: string[] }[] = [
        {
            label: t("primary-topics.counting"),
            description: "Learn to count, read, write, compare, and understand numbers, including place value and rounding.",
            icon: <NumbersIcon />,
            delay: "0ms",
            link: `/${lng}/primary/numbers`,
            topics: [t("primary-topics.counting"), t("primary-topics.reading-and-writing-numbers"), t("primary-topics.place-value"), t("primary-topics.comparing-and-ordering-numbers"), t("primary-topics.rounding-numbers")],
            topicLinks: []
        },
        {
            label: t("primary-topics.reading-and-writing-numbers"),
            description: "Develop skills in adding and subtracting numbers using different methods and solving simple problems.",
            icon: <AdditionSubtractionIcon />,
            delay: "120ms",
            link: `/${lng}/primary/addition-subtraction`,
            topics: [],
            topicLinks: []
        },
        {
            label: t("primary-topics.place-value"),
            description: "Understand multiplication and division, including times tables, grouping, and sharing.",
            icon: <MultiplicationDivisionIcon />,
            delay: "240ms",
            link: "/multiplication-division",
            topics: [],
            topicLinks: []
        },
        {
            label: t("primary-topics.comparing-and-ordering-numbers"),
            description: "Explore fractions, decimals, and percentages and learn how they relate to each other.",
            icon: <FractionsIcon />,
            delay: "360ms",
            link: "/fractions-decimals-percentages",
            topics: [],
            topicLinks: []
        },
        {
            label: t("primary-topics.rounding-numbers"),
            description: "Learn to measure length, mass, volume, time, and money using standard units.",
            icon: <MeasurementIcon />,
            delay: "480ms",
            link: `/${lng}/primary/measurement`,
            topics: [],
            topicLinks: []
        }
    ];

    return (
        <div className='flex w-full bg-background'>
            <SidePanel lng={lng} pageOn={"/"} buttons={buttons} />
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
                    {t("primary-topics.numbers")}
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
                            onClick={() => router.push(button.link)}
                            style={{
                                opacity: buttonsReady ? 1 : 0,
                                transform: buttonsReady ? 'translateY(0)' : 'translateY(16px)',
                                transition: `opacity 0.5s ease ${button.delay}, transform 0.5s ease ${button.delay}, box-shadow 0.2s ease`,
                            }}
                            className="w-[16rem] h-[16rem] items-center justify-start text-primary
                                border-2 border-primary rounded-[1rem] flex flex-col p-4 text-xl 
                                hover:shadow-[0_0_0_0.6rem_var(--contrast)]"
                        >
                            {t(button.label)}
                            <div className='flex flex-1 items-center justify-center'>
                                <div className="w-20 h-20 my-2">{button.icon}</div>
                            </div>
                            <p className='text-sm'>{button.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}