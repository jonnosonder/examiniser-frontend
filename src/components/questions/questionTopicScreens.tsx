// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from "react-i18next";
import * as React from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Locale } from "@/lib/locales";
import SidePanel from "@/components/questions/sidePanel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildQuestionNavButtons } from "@/lib/questionTopicNav";
import { getQuestionGenerator, getQuestionGeneratorLevels } from "@/lib/questionGenerators";
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
                    {buttons.map((button) => (
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
                    {topic.subtopics.map((sub) => {
                        const delay = `${topic.subtopics.indexOf(sub) * 120}ms`;
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

    const availableLevels = React.useMemo(
        () => getQuestionGeneratorLevels(level, subtopicSlug),
        [level, subtopicSlug]
    );

    const [selectedDifficulty, setSelectedDifficulty] = React.useState<number>(availableLevels[0] ?? 1);
    const [questionLatex, setQuestionLatex] = React.useState("");
    const [questionAnswer, setQuestionAnswer] = React.useState("");
    const [userAnswer, setUserAnswer] = React.useState("");
    const [answerCorrect, setAnswerCorrect] = React.useState<boolean | null>(null);
    const [feedback, setFeedback] = React.useState("");

    const levels = availableLevels;

    const handleGenerateQuestion = () => {
        const generator = getQuestionGenerator(level, subtopicSlug);
        const result = generator({ level, topicId, subtopicSlug, difficulty: selectedDifficulty });
        setQuestionLatex(result.latex);
        setQuestionAnswer(result.answer);
        setUserAnswer("");
        setAnswerCorrect(null);
        setFeedback("");
    };

    const handleCheckAnswer = () => {
        const normalized = userAnswer.trim().replace(/\s+/g, "");
        const expected = questionAnswer.trim().replace(/\s+/g, "");
        if (!questionAnswer) {
            setFeedback("Generate a question first before checking your answer.");
            setAnswerCorrect(null);
            return;
        }
        if (!normalized) {
            setFeedback("Enter an answer before checking.");
            setAnswerCorrect(null);
            return;
        }
        const correct = normalized.toLowerCase() === expected.toLowerCase();
        setAnswerCorrect(correct);
        setFeedback(correct ? t("questions.correct") : t("questions.wrong", { answer: questionAnswer }));
    };

    React.useEffect(() => {
        if (!availableLevels.includes(selectedDifficulty)) {
            setSelectedDifficulty(availableLevels[0] ?? 1);
        }
    }, [availableLevels, selectedDifficulty]);

    if (!topic || !sub) {
        return null;
    }

    const parentIcon = iconByTopicId[topicId] ?? null;

    return (
        <div className="flex w-full bg-background">
            <SidePanel lng={lng} buttons={navButtons} />
            <div className="flex-1 flex flex-col items-center justify-start ml-10 mr-10">
                <div className="flex w-full flex-wrap justify-between items-center gap-y-2 mt-5 gap-x-4">
                    <Link href={hubHref} className="text-sm text-primary">
                        ←&nbsp;<span className="underline">{t("general.back-to-topic", { topic: t(topic.titleKey) })}</span>
                    </Link>
                    <Link href={`/${lng}/`} className="text-sm text-primary">
                        <span className="underline">{t("general.back-to-home")}</span>&nbsp;→
                    </Link>
                </div>
                <div className="flex flex-1 flex-col items-center justify-start max-w-4xl mt-4 w-full">
                    <div className="w-full flex flex-col items-center text-center">
                        <div className="flex items-center justify-center">
                            <h1 className="text-4xl font-nunito text-primary mr-4">{t(sub.titleKey)}</h1>
                            <div className="w-24 h-24 text-primary">{parentIcon}</div>
                        </div>
                        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{t(sub.descriptionKey)}</p>
                    </div>

                    <div className="mt-5 w-full rounded-[2rem] border border-primary/20 bg-white p-8 shadow-lg">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
                                    {t("questions.level")}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-3">
                                        {levels.map((levelNumber) => (
                                            <button
                                                key={levelNumber}
                                                type="button"
                                                onClick={() => setSelectedDifficulty(levelNumber)}
                                                className={`min-w-[4rem] rounded-2xl border px-4 py-3 text-lg font-semibold transition ${
                                                    selectedDifficulty === levelNumber
                                                        ? "border-primary bg-primary text-white"
                                                        : "border-primary/20 bg-primary/5 text-primary"
                                                }`}
                                            >
                                                {levelNumber}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGenerateQuestion}
                                        className="rounded-[1rem] border-2 border-primary bg-white px-7 py-3 text-primary transition hover:bg-primary/10"
                                    >
                                        {t("questions.generate-question")}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-primary/10 bg-[var(--background)] p-6 min-h-[12rem]">
                                {questionLatex ? (
                                    <BlockMath math={questionLatex} />
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t("questions.no-question-generated")}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-primary">
                                    {t("questions.your-answer")}
                                </label>

                                <div className="flex w-full flex-wrap items-center gap-3">
                                    <div className="flex-1 min-w-[12rem]">
                                        <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(event) => setUserAnswer(event.target.value)}
                                            className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-3 text-lg outline-none focus:border-primary"
                                            placeholder={t("questions.enter-answer-here")}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCheckAnswer}
                                        className="w-full lg:w-auto rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary/90 disabled:opacity-50"
                                        disabled={!questionLatex}
                                    >
                                        {t("questions.check-answer")}
                                    </button>
                                </div>
                            </div>

                            {feedback ? (
                                <p className={`text-sm ${answerCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                    {feedback}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
