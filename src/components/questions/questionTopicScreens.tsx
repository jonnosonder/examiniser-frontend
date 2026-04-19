// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from "react-i18next";
import * as React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Locale } from "@/lib/locales";
import SidePanel from "@/components/questions/sidePanel";
import MathShorthandEditor, { shorthandToLatex } from "@/components/questions/MathShorthandEditor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildQuestionNavButtons } from "@/lib/questionTopicNav";
import { generateQuestionWithTimeout, getQuestionGeneratorLevels } from "@/lib/questionGenerators";
import { getSubtopicOrNull, getTopicOrNull, levelRoutePrefix, type QuestionLevel } from "@/lib/questionTopicCatalog";
import { weakLatexEquivalent } from "./weakLatexEquivalent";
import { WrappedMath } from "./wrapLatex";

type IconMap = Record<string, React.ReactNode>  

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
    const [questionSvg, setQuestionSvg] = React.useState("");
    const [questionAnswers, setQuestionAnswers] = React.useState<string[]>([]);
    const [questionOptions, setQuestionOptions] = React.useState<string[]>([]);
    const [questionForceOption, setQuestionForceOption] = React.useState<0 | 1 | 2>(0);
    const [answerMode, setAnswerMode] = React.useState<"typed" | "multipleChoice">("typed");
    const [userAnswerLatex, setUserAnswerLatex] = React.useState("");
    const [answerCorrect, setAnswerCorrect] = React.useState<boolean | null>(null);
    const [checkWeakLatexEquivalent, setcheckWeakLatexEquivalent] = React.useState<boolean>(false);
    const [feedback, setFeedback] = React.useState("");
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [maxLineWidth, setMaxLineWidth] = React.useState<number>(90);
    const questionDivRef = React.useRef<HTMLDivElement>(null);

    const canType = questionForceOption !== 2;
    const canChoose = questionOptions.length > 0 && questionForceOption !== 1;
    const effectiveAnswerMode = answerMode === "multipleChoice" && canChoose ? "multipleChoice" : "typed";

    React.useEffect(() => {
        setQuestionLatex("");
        setQuestionSvg("");
        setQuestionAnswers([]);
        setQuestionOptions([]);
        setQuestionForceOption(0);
        setAnswerMode("typed");
        setUserAnswerLatex("");
        setAnswerCorrect(null);
        setFeedback("");
    }, [selectedDifficulty]);

    React.useEffect(() => {
        const updateMaxLineWidth = () => {
            if (questionDivRef.current) {
                const rect = questionDivRef.current.getBoundingClientRect();
                const innerWidth = rect.width - 4; // Subtract padding
                const charWidth = 10; // Approximate character width in pixels
                setMaxLineWidth(Math.max(20, Math.floor(innerWidth / charWidth)));
            }
        };

        updateMaxLineWidth();
        window.addEventListener('resize', updateMaxLineWidth);
        return () => window.removeEventListener('resize', updateMaxLineWidth);
    }, []);

    const levels = availableLevels;

    const renderOptionLabel = React.useCallback((option: string) => {
        const trimmed = option.trim();
        const isLatex = /\\|\^|_|\{|\}|=|\\+|\\frac|\\sqrt|\\pi|\\theta|\\times|\\div|\\sin|\\cos|\\tan|\\log|\\ln/.test(trimmed);
        const isNumeric = /^-?\d+(?:\.\d+)?$/.test(trimmed);

        if (isLatex || isNumeric) {
            return (
                <div className="flex w-full items-center justify-center">
                    <BlockMath math={trimmed} />
                </div>
            );
        }

        return <span className="flex text-center items-center justify-center">{trimmed}</span>;
    }, []);


    const handleGenerateQuestion = async () => {
        setIsGenerating(true);
        setFeedback("");
        setAnswerCorrect(null);
        setUserAnswerLatex("");

        const result = await generateQuestionWithTimeout(
            { level, topicId, subtopicSlug, difficulty: selectedDifficulty },
            3000
        );

        setIsGenerating(false);

        if (result.explanation === "Question generator timed out after 3 seconds") {
            setQuestionLatex(result.latex);
            setQuestionAnswers([]);
            setQuestionOptions([]);
            setQuestionForceOption(0);
            setAnswerMode("typed");
            setFeedback("Question generation timed out after 3 seconds. Please try again.");
            return;
        }

        const options = result.options ?? [];
        const hadPreviousSelectedOption = answerMode === "multipleChoice" && questionOptions.includes(userAnswerLatex);
        const previousOption = hadPreviousSelectedOption ? userAnswerLatex : undefined;

        setQuestionLatex(result.latex);
        setQuestionSvg(result.svg ?? "");
        setQuestionAnswers(Array.isArray(result.answer) ? result.answer : [result.answer]);
        setQuestionOptions(options);
        setcheckWeakLatexEquivalent(result.checkWeakLatexEquivalent ?? false)
        setQuestionForceOption(result.forceOption ?? 0);
        setAnswerMode(
            result.forceOption === 2 || (answerMode === "multipleChoice" && result.forceOption !== 1)
                ? "multipleChoice"
                : "typed"
        );
        setUserAnswerLatex(previousOption ?? "");
        setAnswerCorrect(null);
    };

    const normalizeAnswer = (answer: string) => {
        const trimmed = answer.trim().replace(/\s+/g, "");
        const isLatex = /\\|\^|_|\{|\}|\\frac|\\sqrt|\\pi|\\theta|\\sin|\\cos|\\tan|\\log|\\ln/.test(trimmed);
        const fixFractions = addFractionFences(trimmed);
        return isLatex ? fixFractions : fixFractions.toLowerCase();
    };

    const addFractionFences = (latex: string): string => { // mathlive outputs \frac12 instead of \frac{1}{2}, which causes issues when comparing user input to expected answers. This function adds the necessary braces around single-digit numerators and denominators.
        return latex.replace(
            /\\frac\s*(\d)\s*(\d)/g,
            "\\frac{$1}{$2}"
        );
    }

    const handleCheckAnswer = () => {
        const answerToCheck = userAnswerLatex;
        const normalized = normalizeAnswer(answerToCheck);

        if (!questionAnswers.length) {
            setFeedback("Generate a question first before checking your answer.");
            setAnswerCorrect(null);
            return;
        }

        if (!normalized) {
            setFeedback("Enter an answer before checking your answer.");
            setAnswerCorrect(null);
            return;
        }

        const expectedAnswers = questionAnswers.map((answer) => normalizeAnswer(answer.toString()));

        let correct = expectedAnswers.some((expected) => normalized === expected);

        if (!correct && checkWeakLatexEquivalent) {
            expectedAnswers.forEach(answer => {
                const result = weakLatexEquivalent(answer, normalized)
                if (result){
                    correct = true
                    return
                }
            });

            
        }

        setAnswerCorrect(correct);
        setFeedback(
            correct
                ? t("questions.correct")
                : t("questions.wrong", { answer: questionAnswers.join(" or ") })
        );

    };

    const handleClearAnswer = () => {
        setUserAnswerLatex("");
        setAnswerCorrect(null);
        setFeedback("");
    };

    React.useEffect(() => {
        if (!availableLevels.includes(selectedDifficulty)) {
            setSelectedDifficulty(availableLevels[0] ?? 1);
        }
    }, [availableLevels, selectedDifficulty]);

    if (!topic || !sub) {
        return null;
    }

    return (
        <div className="relative flex w-full bg-background">
            <div className="relative flex-shrink-0 w-44 sm:w-48 lg:w-52">
                <SidePanel lng={lng} buttons={navButtons} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col items-center justify-start ml-10 mr-10 transition-all duration-300">
                <div className="flex w-full flex-wrap justify-between items-center gap-y-2 mt-5 gap-x-4">
                    <Link href={hubHref} className="text-sm text-primary">
                        ←&nbsp;<span className="underline">{t("general.back-to-topic", { topic: t(topic.titleKey) })}</span>
                    </Link>
                    <Link href={`/${lng}/`} className="text-sm text-primary">
                        <span className="underline">{t("general.back-to-home")}</span>&nbsp;→
                    </Link>
                </div>
                <div className="flex flex-1 flex-col items-center justify-start max-w-4xl mt-2 w-full">
                    <div className="w-full flex flex-col items-center text-center">
                        <h1 className="text-4xl font-nunito text-primary">{t(sub.titleKey)}</h1>
                        <p className="text-base leading-relaxed text-muted-foreground">{t(sub.descriptionKey)}</p>
                    </div>

                    <div className="mt-2 w-full rounded-[2rem] border border-primary/20 bg-white p-6 shadow-lg">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
                                    {t("questions.level")}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
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
                                        disabled={isGenerating}
                                        className={`rounded-[1rem] border-2 border-primary bg-white px-7 py-3 text-primary transition hover:bg-primary/10 ${isGenerating ? "cursor-not-allowed opacity-60" : "hover:bg-primary/10"}`}
                                    >
                                        {isGenerating
                                            ? t("questions.generating", { defaultValue: "Generating..." })
                                            : t("questions.generate-question")}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-primary/10 bg-[var(--background)] p-6 min-h-[12rem]" ref={questionDivRef}>
                                {questionLatex ? (
                                    <WrappedMath
                                        latex={questionLatex}
                                        maxLineWidth={maxLineWidth}
                                    />
                                ) : levels.length !== 0 ? (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t("questions.no-question-generated")}
                                    </p>
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t("questions.no-questions-made")}
                                    </p>
                                )}
                                {questionSvg ? (
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="mx-auto max-w-full overflow-auto"
                                            dangerouslySetInnerHTML={{ __html: questionSvg }}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-primary">
                                    {t("questions.your-answer")}
                                </label>

                                <div className="flex w-full flex-wrap items-center gap-3">
                                    <div className="flex-1 min-w-[12rem] mr-2 transition-shadow duration-200 ease-in-out">
                                        {canType && canChoose ? (
                                            <div className="mb-4 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAnswerMode("typed");
                                                        setUserAnswerLatex("");
                                                        setAnswerCorrect(null);
                                                        setFeedback("");
                                                    }}
                                                    className={`rounded-2xl border px-4 py-2 text-sm transition ${
                                                        effectiveAnswerMode === "typed"
                                                            ? "border-primary bg-primary text-white"
                                                            : "border-primary/20 bg-primary/5 text-primary"
                                                    }`}
                                                >
                                                    {t("questions.type-answer", { defaultValue: "Type your answer" })}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAnswerMode("multipleChoice");
                                                        setUserAnswerLatex("");
                                                        setAnswerCorrect(null);
                                                        setFeedback("");
                                                    }}
                                                    className={`rounded-2xl border px-4 py-2 text-sm transition ${
                                                        effectiveAnswerMode === "multipleChoice"
                                                            ? "border-primary bg-primary text-white"
                                                            : "border-primary/20 bg-primary/5 text-primary"
                                                    }`}
                                                >
                                                    {t("questions.multiple-choice", { defaultValue: "Multiple choice" })}
                                                </button>
                                            </div>
                                        ) : null}

                                        {effectiveAnswerMode === "multipleChoice" && questionOptions.length > 0 ? (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {questionOptions.map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            setUserAnswerLatex(option);
                                                            setAnswerCorrect(null);
                                                            setFeedback("");
                                                        }}
                                                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                                                            userAnswerLatex === option
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-primary/20 bg-primary/5 text-primary"
                                                        }
                                                        ${ userAnswerLatex === option && (
                                                            answerCorrect === true
                                                            ? "rounded-2xl shadow-[0_0_0_0.4rem_rgba(34,197,94,0.5)]"
                                                            : answerCorrect === false
                                                            ? "rounded-2xl shadow-[0_0_0_0.4rem_rgba(239,68,68,0.5)]"
                                                            : ""
                                                            )
                                                        }
                                                        `}
                                                    >
                                                        {renderOptionLabel(option)}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`flex ${answerCorrect === true
                                            ? "rounded-[1.5rem] shadow-[0_0_0_0.6rem_rgba(34,197,94,0.5)]"
                                            : answerCorrect === false
                                            ? "rounded-[1.5rem] shadow-[0_0_0_0.6rem_rgba(239,68,68,0.5)]"
                                            : ""}`}>
                                                <MathShorthandEditor
                                                    value={userAnswerLatex}
                                                    onChange={(_, latex) => {
                                                        if (latex === userAnswerLatex) {
                                                            return;
                                                        }
                                                        setUserAnswerLatex(latex);
                                                        setAnswerCorrect(null);
                                                        setFeedback("");
                                                    }}
                                                    placeholder={t("questions.enter-answer-here").replaceAll(" ", " \\ ")}
                                                />
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex w-full flex-col gap-3 lg:w-auto">
                                        <button
                                            type="button"
                                            onClick={handleCheckAnswer}
                                            className="w-full lg:w-auto rounded-2xl bg-primary px-6 py-3 text-white transition hover:bg-primary/90 disabled:opacity-50"
                                            disabled={!questionLatex}
                                        >
                                            {t("questions.check-answer")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClearAnswer}
                                            className="w-full lg:w-auto rounded-2xl border-2 border-primary bg-white px-6 py-3 text-primary transition hover:bg-primary/10"
                                        >
                                            {t("questions.clear-answer")}
                                        </button>
                                    </div>
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
