// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from "react-i18next";
import * as React from "react";
import { Locale } from "@/lib/locales";
import SidePanel from "@/components/questions/sidePanel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildQuestionNavButtons } from "@/lib/questionTopicNav";
import { getSubtopicOrNull, getTopicOrNull, levelRoutePrefix, type QuestionLevel } from "@/lib/questionTopicCatalog";

type IconMap = Record<string, React.ReactNode>;

export function QuestionLevelOverview({
    lng,
    level,
    headingKey,
    descriptionKey,
    iconByTopicId,
}: {
    lng: Locale;
    level: QuestionLevel;
    headingKey: string;
    descriptionKey: string;
    iconByTopicId: IconMap;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const [buttonsReady, setButtonsReady] = React.useState(false);
    const titleRef = React.useRef<HTMLHeadingElement | null>(null);
    const descRef = React.useRef<HTMLParagraphElement | null>(null);

    const buttons = React.useMemo(
        () => buildQuestionNavButtons(lng, level, t, iconByTopicId),
        [lng, level, t, iconByTopicId]
    );

    React.useEffect(() => {
        const titleEl = titleRef.current;
        const descEl = descRef.current;
        if (!titleEl || !descEl) return;
        titleEl.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        descEl.style.transition = "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s";
        const timer = setTimeout(() => {
            titleEl.style.opacity = "1";
            titleEl.style.transform = "translateY(0)";
            descEl.style.opacity = "1";
            descEl.style.transform = "translateY(0)";
            setTimeout(() => setButtonsReady(true), 100);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const levelPath = levelRoutePrefix(level);

    return (
        <div className="flex w-full bg-background">
            <SidePanel lng={lng} buttons={buttons} />
            <div className="flex-1 flex flex-col items-center justify-start ml-10 mr-10">
                <Link href={`/${lng}/`} className="flex w-full items-center justify-end self-end mt-5 text-sm text-primary">
                    <span className="underline">{t("general.back-to-home")}</span>&nbsp;→
                </Link>
                <h1
                    ref={titleRef}
                    style={{ opacity: 0, transform: "translateY(12px)" }}
                    className="text-4xl mt-10 font-nunito text-primary"
                >
                    {t(headingKey)}
                </h1>
                <p ref={descRef} style={{ opacity: 0, transform: "translateY(12px)" }} className="mt-2 text-center">
                    {t(descriptionKey)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mt-10 mb-10">
                    {buttons.map((button, index) => (
                        <button
                            key={button.link}
                            type="button"
                            onClick={() => router.push(button.link)}
                            style={{
                                opacity: buttonsReady ? 1 : 0,
                                transform: buttonsReady ? "translateY(0)" : "translateY(16px)",
                                transition: `opacity 0.5s ease ${button.delay}, transform 0.5s ease ${button.delay}, box-shadow 0.2s ease`,
                            }}
                            className="w-[16rem] h-[16rem] items-center justify-start text-primary border-2 border-primary rounded-[1rem] flex flex-col p-4 text-xl hover:shadow-[0_0_0_0.6rem_var(--contrast)]"
                        >
                            {button.label}
                            <div className="flex flex-1 items-center justify-center">
                                <div className="w-20 h-20 my-2">{button.icon}</div>
                            </div>
                            <p className="text-sm text-left">{button.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function QuestionTopicHub({
    lng,
    level,
    topicId,
    iconByTopicId,
}: {
    lng: Locale;
    level: QuestionLevel;
    topicId: string;
    iconByTopicId: IconMap;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const topic = getTopicOrNull(level, topicId);
    const [buttonsReady, setButtonsReady] = React.useState(false);
    const titleRef = React.useRef<HTMLHeadingElement | null>(null);
    const descRef = React.useRef<HTMLParagraphElement | null>(null);

    const navButtons = React.useMemo(
        () => buildQuestionNavButtons(lng, level, t, iconByTopicId),
        [lng, level, t, iconByTopicId]
    );

    React.useEffect(() => {
        const titleEl = titleRef.current;
        const descEl = descRef.current;
        if (!titleEl || !descEl) return;
        titleEl.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        descEl.style.transition = "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s";
        const timer = setTimeout(() => {
            titleEl.style.opacity = "1";
            titleEl.style.transform = "translateY(0)";
            descEl.style.opacity = "1";
            descEl.style.transform = "translateY(0)";
            setTimeout(() => setButtonsReady(true), 100);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const levelPath = levelRoutePrefix(level);
    const overviewHref = `/${lng}/${levelPath}`;
    const parentIcon = iconByTopicId[topicId] ?? null;

    if (!topic) {
        return null;
    }

    const sectionDescription = t(topic.descriptionKey);

    return (
        <div className="flex w-full bg-background">
            <SidePanel lng={lng} buttons={navButtons} />
            <div className="flex-1 flex flex-col items-center justify-start ml-10 mr-10">
                <div className="flex w-full flex-wrap justify-between items-center gap-y-2 mt-5 gap-x-4">
                    <Link href={overviewHref} className="text-sm text-primary">
                        ←&nbsp;<span className="underline">{t("general.back-to-level", { level: t(level === "primary" ? "education.primary-school" : level === "secondary" ? "education.secondary-school" : "education.sixth-form") })}</span>
                    </Link>
                    <Link href={`/${lng}/`} className="text-sm text-primary">
                        <span className="underline">{t("general.back-to-home")}</span>&nbsp;→
                    </Link>
                </div>
                <h1
                    ref={titleRef}
                    style={{ opacity: 0, transform: "translateY(12px)" }}
                    className="text-4xl mt-10 font-nunito text-primary text-center"
                >
                    {t(topic.titleKey)}
                </h1>
                <p ref={descRef} style={{ opacity: 0, transform: "translateY(12px)" }} className="mt-2 text-center max-w-2xl">
                    {sectionDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mt-10 mb-10">
                    {topic.subtopics.map((sub, index) => {
                        const delay = `${index * 120}ms`;
                        const href = `/${lng}/${levelPath}/${topicId}/${sub.slug}`;
                        return (
                            <button
                                key={sub.slug}
                                type="button"
                                onClick={() => router.push(href)}
                                style={{
                                    opacity: buttonsReady ? 1 : 0,
                                    transform: buttonsReady ? "translateY(0)" : "translateY(16px)",
                                    transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}, box-shadow 0.2s ease`,
                                }}
                                className="w-[16rem] h-[16rem] items-center justify-start text-primary border-2 border-primary rounded-[1rem] flex flex-col p-4 text-xl hover:shadow-[0_0_0_0.6rem_var(--contrast)]"
                            >
                                {t(sub.titleKey)}
                                <div className="flex flex-1 items-center justify-center">
                                    <div className="w-20 h-20 my-2">{parentIcon}</div>
                                </div>
                                <p className="text-sm text-left">{t(sub.descriptionKey)}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function QuestionSubtopicLeaf({
    lng,
    level,
    topicId,
    subtopicSlug,
    iconByTopicId,
}: {
    lng: Locale;
    level: QuestionLevel;
    topicId: string;
    subtopicSlug: string;
    iconByTopicId: IconMap;
}) {
    const { t } = useTranslation();
    const topic = getTopicOrNull(level, topicId);
    const sub = topic ? getSubtopicOrNull(topic, subtopicSlug) : null;
    const levelPath = levelRoutePrefix(level);
    const hubHref = `/${lng}/${levelPath}/${topicId}`;

    const navButtons = React.useMemo(
        () => buildQuestionNavButtons(lng, level, t, iconByTopicId),
        [lng, level, t, iconByTopicId]
    );

    if (!topic || !sub) {
        return null;
    }

    const parentIcon = iconByTopicId[topicId] ?? null;

    return (
        <div className="flex w-full bg-background">
            <SidePanel lng={lng} buttons={navButtons} />
            <div className="flex-1 flex flex-col items-center justify-start ml-10 mr-10 pb-16">
                <div className="flex w-full flex-wrap justify-between items-center gap-y-2 mt-5 gap-x-4">
                    <Link href={hubHref} className="text-sm text-primary">
                        ←&nbsp;<span className="underline">{t("general.back-to-topic", { topic: t(topic.titleKey) })}</span>
                    </Link>
                    <Link href={`/${lng}/`} className="text-sm text-primary">
                        <span className="underline">{t("general.back-to-home")}</span>&nbsp;→
                    </Link>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center max-w-xl mt-12">
                    <div className="w-24 h-24 mb-6 text-primary">{parentIcon}</div>
                    <h1 className="text-4xl font-nunito text-primary text-center">{t(sub.titleKey)}</h1>
                    <p className="mt-4 text-center text-base leading-relaxed">{t(sub.descriptionKey)}</p>
                    <p className="mt-8 text-sm text-muted-foreground">{t("start.coming-soon")}</p>
                </div>
            </div>
        </div>
    );
}
