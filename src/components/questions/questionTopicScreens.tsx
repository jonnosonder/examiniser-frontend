// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from "react-i18next";
import * as React from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Locale } from "@/lib/locales";
import SidePanel from "@/components/questions/sidePanel";
import MathShorthandEditor from "@/components/questions/MathShorthandEditor";
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
    const [questionAnswers, setQuestionAnswers] = React.useState<string[]>([]);
    const [questionOptions, setQuestionOptions] = React.useState<string[]>([]);
    const [questionForceOption, setQuestionForceOption] = React.useState<0 | 1 | 2>(0);
    const [answerMode, setAnswerMode] = React.useState<"typed" | "multipleChoice">("typed");
    const [userAnswer, setUserAnswer] = React.useState("");
    const [userAnswerLatex, setUserAnswerLatex] = React.useState("");
    const [answerCorrect, setAnswerCorrect] = React.useState<boolean | null>(null);
    const [feedback, setFeedback] = React.useState("");
    const [keyboardOpen, setKeyboardOpen] = React.useState(false);

    const canType = questionForceOption !== 2;
    const canChoose = questionOptions.length > 0 && questionForceOption !== 1;
    const effectiveAnswerMode = answerMode === "multipleChoice" && canChoose ? "multipleChoice" : "typed";

    React.useEffect(() => {
        setQuestionLatex("");
        setQuestionAnswers([]);
        setQuestionOptions([]);
        setQuestionForceOption(0);
        setAnswerMode("typed");
        setUserAnswer("");
        setUserAnswerLatex("");
        setAnswerCorrect(null);
        setFeedback("");
    }, [selectedDifficulty]);

    const levels = availableLevels;

    const keyboardButtons = React.useMemo(
        () => [
            [
                { label: "7", value: "7" },
                { label: "8", value: "8" },
                { label: "9", value: "9" },
                { label: "(", value: "(" },
                { label: ")", value: ")" },
                { label: "√", value: "√(" },
            ],
            [
                { label: "4", value: "4" },
                { label: "5", value: "5" },
                { label: "6", value: "6" },
                { label: "/", value: "/" },
                { label: "^", value: "^" },
                { label: "π", value: "π" },
            ],
            [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "×", value: "×" },
                { label: "÷", value: "÷" },
                { label: "^2", value: "^2" },
            ],
            [
                { label: "0", value: "0" },
                { label: ".", value: "." },
                { label: "-", value: "-" },
                { label: "+", value: "+" },
                { label: "=", value: "=" },
                { label: "θ", value: "theta" },
            ],
            [
                { label: "sin", value: "sin(" },
                { label: "cos", value: "cos(" },
                { label: "tan", value: "tan(" },
                { label: "log", value: "log(" },
                { label: "ln", value: "ln(" },
                { label: "√(", value: "√(" },
            ],
            [
                { label: <BlockMath math="\\frac{1}{2}" />, value: "1/2" },
                { label: <BlockMath math="\\frac{1}{3}" />, value: "1/3" },
                { label: <BlockMath math="\\frac{1}{4}" />, value: "1/4" },
                { label: <BlockMath math="\\frac{3}{4}" />, value: "3/4" },
                { label: <BlockMath math="\\frac{\\pi}{2}" />, value: "π/2" },
                { label: <BlockMath math="\\frac{\\pi}{4}" />, value: "π/4" },
            ],
            [
                { label: "x", value: "x" },
                { label: "y", value: "y" },
                { label: "z", value: "z" },
                { label: "{", value: "{" },
                { label: "}", value: "}" },
                { label: "[", value: "[" },
            ],
            [
                { label: "⌫", value: "backspace" },
                { label: t("questions.clear"), value: "clear" },
                { label: t("questions.space"), value: "space" },
            ],
        ],
        [t]
    );

    const handleKeyboardInput = (value: string) => {
        if (value === "backspace") {
            setUserAnswer((current) => current.slice(0, -1));
            return;
        }

        if (value === "clear") {
            setUserAnswer("");
            return;
        }

        if (value === "space") {
            setUserAnswer((current) => `${current} `);
            return;
        }

        setUserAnswer((current) => `${current}${value}`);
    };

    const handleGenerateQuestion = () => {
        const hadPreviousSelectedOption = answerMode === "multipleChoice" && questionOptions.includes(userAnswer);
        const generator = getQuestionGenerator(level, subtopicSlug);
        const result = generator({ level, topicId, subtopicSlug, difficulty: selectedDifficulty });
        const options = Array.isArray(result.options) ? result.options : [];
        const previousOption = hadPreviousSelectedOption ? userAnswer : undefined;
        const nextUserAnswer = result.forceOption === 1
            ? ""
            : previousOption
                ? options.includes(previousOption)
                    ? previousOption
                    : options[0] ?? ""
                : result.forceOption === 2
                    ? options[0] ?? ""
                    : "";

        setQuestionLatex(result.latex);
        setQuestionAnswers(Array.isArray(result.answer) ? result.answer : [result.answer]);
        setQuestionOptions(options);
        setQuestionForceOption(result.forceOption ?? 0);
        setAnswerMode(
            result.forceOption === 2 || (answerMode === "multipleChoice" && result.forceOption !== 1)
                ? "multipleChoice"
                : "typed"
        );
        setUserAnswer(nextUserAnswer);
        setUserAnswerLatex("");
        setAnswerCorrect(null);
        setFeedback("");
    };

    const handleCheckAnswer = () => {
        const normalized = userAnswer
            .trim()
            .replace(/\s+/g, "")
            .replace(/ /g, "");

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

        const expectedAnswers = questionAnswers.map((answer) =>
            answer
                .toString()
                .trim()
                .replace(/\s+/g, "")
                .replace(/ /g, "")
                .toLowerCase()
        );

        const correct = expectedAnswers.some((expected) => normalized.toLowerCase() === expected);

        setAnswerCorrect(correct);
        setFeedback(
            correct
                ? t("questions.correct")
                : t("questions.wrong", { answer: questionAnswers.join(", ") })
        );
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

                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-primary">
                                    {t("questions.your-answer")}
                                </label>

                                <div className="flex w-full flex-wrap items-center gap-3">
                                    <div className={`flex-1 min-w-[12rem] mr-2 transition-shadow duration-200 ease-in-out ${
                                        answerCorrect === true
                                            ? "rounded-2xl shadow-[0_0_0_0.6rem_rgba(34,197,94,0.25)]"
                                            : answerCorrect === false
                                            ? "rounded-2xl shadow-[0_0_0_0.6rem_rgba(239,68,68,0.25)]"
                                            : ""
                                    }`}>
                                        {canType && canChoose ? (
                                            <div className="mb-4 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAnswerMode("typed");
                                                        setUserAnswer("");
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
                                                        setUserAnswer("");
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
                                                            setUserAnswer(option);
                                                            setUserAnswerLatex("");
                                                            setAnswerCorrect(null);
                                                            setFeedback("");
                                                        }}
                                                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                                                            userAnswer === option
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-primary/20 bg-primary/5 text-primary"
                                                        }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <MathShorthandEditor
                                                value={userAnswer}
                                                onChange={(value, latex) => {
                                                    setUserAnswer(value);
                                                    setUserAnswerLatex(latex);
                                                    setAnswerCorrect(null);
                                                    setFeedback("");
                                                }}
                                                placeholder={t("questions.enter-answer-here")}
                                            />
                                        )}
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

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setKeyboardOpen((current) => !current)}
                                        className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary transition hover:bg-primary/10"
                                    >
                                        {keyboardOpen ? t("questions.hide-keyboard") : t("questions.show-keyboard")}
                                    </button>
                                    <p className="text-xs text-muted-foreground">
                                        {t("questions.keyboard-hint")}
                                    </p>
                                </div>
                            </div>

                            {feedback ? (
                                <p className={`text-sm ${answerCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                    {feedback}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {keyboardOpen ? (
                        <div className="mt-5 w-full rounded-[1.5rem] border border-primary/10 bg-slate-950/95 p-3 text-white shadow-inner">
                            {keyboardButtons.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid gap-2 sm:grid-cols-6 mb-2 last:mb-0">
                                    {row.map((key) => (
                                        <button
                                            key={key.value}
                                            type="button"
                                            onClick={() => handleKeyboardInput(key.value)}
                                            className={`rounded-2xl border border-white/10 bg-white/10 px-2 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/20 ${key.value === "backspace" || key.value === "clear" ? "col-span-2 sm:col-span-2" : ""}`}
                                        >
                                            {key.label}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
