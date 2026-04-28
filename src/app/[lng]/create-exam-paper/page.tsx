// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { Locale } from "@/lib/locales";
import { QUESTION_CATALOG, type MainTopicDef, type QuestionLevel, type SubtopicDef } from "@/lib/questionTopicCatalog";
import { getQuestionGeneratorLevels } from "@/lib/questionGeneratorRegistry";
import { generateQuestionWithTimeout } from "@/lib/questionGenerators";
import { EditorWrapLatex } from "../../../components/questions/editorWrapLatex";
import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import Link from "next/link";
import React from "react";
import { Layer, Rect, Stage, Text } from "react-konva";
import "katex/dist/katex.min.css";

type QuestionItem = {
    id: number;
    title: string;
    level: number;
    levelMode: "fixed" | "random";
    stage: QuestionLevel;
    topicId: string;
    subtopicSlug: string;
    latex: string;
};

type StageOption = {
    id: QuestionLevel;
    label: string;
};

type TopicResult = {
    topic: MainTopicDef;
    subtopic: SubtopicDef;
    topicLabel: string;
    subtopicLabel: string;
};

type SidebarSection = "layout" | "styling" | "questions" | null;

const INITIAL_QUESTIONS: QuestionItem[] = [];
const STAGE_OPTIONS: StageOption[] = [
    { id: "primary", label: "Primary" },
    { id: "secondary", label: "Secondary" },
    { id: "sixthForm", label: "Sixth Form" },
];

const PAGE_WIDTH = 900;
const PAGE_HEIGHT = 1240;
const PAGE_GAP = 40;
const PAGE_MARGIN_X = 72;
// Approximate a default A4 document margin at this canvas scale.
const QUESTION_MARGIN_X = 96;
const PAGE_MARGIN_TOP = 96;
const PAGE_MARGIN_BOTTOM = 80;
const DEFAULT_QUESTION_GAP = 0;
const MIN_QUESTION_GAP = 0;
const MAX_QUESTION_GAP = 48;
const QUESTION_RENDER_PADDING_Y = 12;
const MIN_QUESTION_HEIGHT = 84;
const QUESTION_HEIGHT_BUFFER = 12;
const MIN_ZOOM_PERCENT = 50;
const MAX_ZOOM_PERCENT = 200;
const ZOOM_STEP = 10;
const PX_TO_MM = 25.4 / 96;

type PdfCompressionLevel = "high" | "medium" | "low" | "none";
type JsPdfImageCompression = "NONE" | "FAST" | "MEDIUM" | "SLOW";

const PDF_COMPRESSION_OPTIONS: Array<{
    key: PdfCompressionLevel;
    label: string;
    imageCompression: JsPdfImageCompression;
    imageQuality: number;
}> = [
    { key: "none", label: "None", imageCompression: "NONE", imageQuality: 1 },
    { key: "low", label: "Low", imageCompression: "FAST", imageQuality: 0.92 },
    { key: "medium", label: "Medium", imageCompression: "MEDIUM", imageQuality: 0.84 },
    { key: "high", label: "High", imageCompression: "SLOW", imageQuality: 0.74 },
];

function estimateMaxLineWidth(contentWidth: number, fontSize: number): number {
    const maxQuestionWidth = contentWidth - 12;
    return Math.max(20, Math.floor(maxQuestionWidth / Math.max(8.2, fontSize * 0.62)));
}

function toTitleFromSlug(value: string) {
    return value
        .split("-")
        .map((segment) => {
            if (!segment) return "";
            return segment[0].toUpperCase() + segment.slice(1);
        })
        .join(" ");
}

function stageLabel(stage: QuestionLevel) {
    return STAGE_OPTIONS.find((option) => option.id === stage)?.label ?? "Secondary";
}

function randomFromArray<T>(items: T[]): T | null {
    if (!items.length) return null;
    return items[Math.floor(Math.random() * items.length)] ?? null;
}

function sanitizeFileName(value: string): string {
    return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
}

function HammerIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14.4 4L20 9.6L17.2 12.4L11.6 6.8L14.4 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21L12.2 11.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 5.5L11.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronUpIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 8.5L7 4.5L11 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function DragHandleIcon() {
    return (
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="4" cy="4" r="1.25" fill="currentColor"/>
            <circle cx="10" cy="4" r="1.25" fill="currentColor"/>
            <circle cx="4" cy="9" r="1.25" fill="currentColor"/>
            <circle cx="10" cy="9" r="1.25" fill="currentColor"/>
            <circle cx="4" cy="14" r="1.25" fill="currentColor"/>
            <circle cx="10" cy="14" r="1.25" fill="currentColor"/>
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 20H8L18 10C18.5 9.5 18.5 8.7 18 8.2L15.8 6C15.3 5.5 14.5 5.5 14 6L4 16V20Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 7L17 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function DuplicateIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

function DeleteIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 7H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M12 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M16 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6.5 7L7.2 18.2C7.26 19.17 8.06 19.92 9.03 19.92H14.97C15.94 19.92 16.74 19.17 16.8 18.2L17.5 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SectionToggleIcon({ open }: { open: boolean }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            aria-hidden="true"
        >
            <path d="M8 5L16 12L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function CreateExamPaper({ params }: { params: Promise<{ lng: Locale }> }) {
    const resolvedParams = React.use(params);
    const { lng } = resolvedParams;

    const [selectedLayout, setSelectedLayout] = React.useState<"linear" | "grid">("linear");
    const [activeSidebarSection, setActiveSidebarSection] = React.useState<SidebarSection>("questions");
    const [paperTitle, setPaperTitle] = React.useState("Exam Paper");
    const [questionNumberStyle, setQuestionNumberStyle] = React.useState<"short" | "long">("long");
    const [questionTextAlign, setQuestionTextAlign] = React.useState<"left" | "center" | "right">("left");
    const [questionFontSize, setQuestionFontSize] = React.useState(12);
    const [questionFontSizeInput, setQuestionFontSizeInput] = React.useState("12");
    const [questionSpacing, setQuestionSpacing] = React.useState(DEFAULT_QUESTION_GAP);
    const [questionSpacingInput, setQuestionSpacingInput] = React.useState(String(DEFAULT_QUESTION_GAP));
    const [exportFileName, setExportFileName] = React.useState("Exam Paper");
    const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);
    const [downloadCompression, setDownloadCompression] = React.useState<PdfCompressionLevel>("medium");
    const [isExportingPdf, setIsExportingPdf] = React.useState(false);
    const [zoomPercent, setZoomPercent] = React.useState(100);
    const [questions, setQuestions] = React.useState<QuestionItem[]>(INITIAL_QUESTIONS);
    const [editingQuestionId, setEditingQuestionId] = React.useState<number | null>(null);
    const [editingQuestionTitle, setEditingQuestionTitle] = React.useState("");
    const [editingQuestionStage, setEditingQuestionStage] = React.useState<QuestionLevel>("primary");
    const [editingQuestionLevelMode, setEditingQuestionLevelMode] = React.useState<"fixed" | "random">("fixed");
    const [editingQuestionLevel, setEditingQuestionLevel] = React.useState(1);
    const [editingTopicQuery, setEditingTopicQuery] = React.useState("");
    const [editingTopicDropdownOpen, setEditingTopicDropdownOpen] = React.useState(false);
    const [editingTopicId, setEditingTopicId] = React.useState<string | null>(null);
    const [editingSubtopicSlug, setEditingSubtopicSlug] = React.useState<string | null>(null);
    const [isSavingQuestionEdit, setIsSavingQuestionEdit] = React.useState(false);
    const [draggedQuestionId, setDraggedQuestionId] = React.useState<number | null>(null);
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [modalStage, setModalStage] = React.useState<QuestionLevel>("primary");
    const [topicQuery, setTopicQuery] = React.useState("");
    const [topicDropdownOpen, setTopicDropdownOpen] = React.useState(false);
    const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null);
    const [selectedSubtopicSlug, setSelectedSubtopicSlug] = React.useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = React.useState<"random" | number>("random");
    const [quantity, setQuantity] = React.useState(1);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = React.useState(false);
    const [regeneratingQuestionIds, setRegeneratingQuestionIds] = React.useState<Record<number, boolean>>({});
    const nextQuestionId = React.useRef(INITIAL_QUESTIONS.length + 1);
    const questionMeasureRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
    const exportPageRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const [questionHeights, setQuestionHeights] = React.useState<Record<number, number>>({});
    const [canvasMaxLineWidth, setCanvasMaxLineWidth] = React.useState(() => estimateMaxLineWidth(PAGE_WIDTH - QUESTION_MARGIN_X * 2, questionFontSize));

    const questionContentWidth = PAGE_WIDTH - QUESTION_MARGIN_X * 2;
    const zoomScale = zoomPercent / 100;
    const scaledPageWidth = PAGE_WIDTH * zoomScale;

    const stageCatalog = React.useMemo(() => QUESTION_CATALOG[modalStage], [modalStage]);

    const allTopicResults = React.useMemo<TopicResult[]>(() => {
        const results: TopicResult[] = [];
        for (const topic of stageCatalog) {
            const topicLabel = toTitleFromSlug(topic.id);
            for (const subtopic of topic.subtopics) {
                const subtopicLabel = toTitleFromSlug(subtopic.slug);
                results.push({ topic, subtopic, topicLabel, subtopicLabel });
            }
        }

        return results;
    }, [stageCatalog]);

    const topicResults = React.useMemo<TopicResult[]>(() => {
        const normalizedQuery = topicQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return allTopicResults.slice(0, 80);
        }

        const results = allTopicResults.filter((result) => {
            const searchText = `${result.topicLabel} ${result.subtopicLabel}`.toLowerCase();
            return searchText.includes(normalizedQuery);
        });

        return results.slice(0, 40);
    }, [allTopicResults, topicQuery]);

    const selectedSubtopic = React.useMemo(() => {
        if (!selectedTopicId || !selectedSubtopicSlug) {
            return null;
        }

        return topicResults.find((item) => item.topic.id === selectedTopicId && item.subtopic.slug === selectedSubtopicSlug)
            ?? stageCatalog
                .flatMap((topic) => topic.subtopics.map((subtopic) => ({ topic, subtopic })))
                .find((item) => item.topic.id === selectedTopicId && item.subtopic.slug === selectedSubtopicSlug)
            ?? null;
    }, [selectedSubtopicSlug, selectedTopicId, stageCatalog, topicResults]);

    const availableDifficulties = React.useMemo(() => {
        if (!selectedSubtopicSlug) {
            return [];
        }
        return getQuestionGeneratorLevels(modalStage, selectedSubtopicSlug);
    }, [modalStage, selectedSubtopicSlug]);

    const canAddFromModal = Boolean(selectedTopicId && selectedSubtopicSlug && quantity > 0);
    const editingQuestion = React.useMemo(() => (
        editingQuestionId === null
            ? null
            : questions.find((question) => question.id === editingQuestionId) ?? null
    ), [editingQuestionId, questions]);
    const editingQuestionAvailableDifficulties = React.useMemo(() => {
        if (!editingSubtopicSlug) {
            return [];
        }

        return getQuestionGeneratorLevels(editingQuestionStage, editingSubtopicSlug);
    }, [editingQuestionStage, editingSubtopicSlug]);
    const editingStageCatalog = React.useMemo(() => (
        QUESTION_CATALOG[editingQuestionStage]
    ), [editingQuestionStage]);
    const editingAllTopicResults = React.useMemo<TopicResult[]>(() => {
        const results: TopicResult[] = [];

        for (const topic of editingStageCatalog) {
            const topicLabel = toTitleFromSlug(topic.id);
            for (const subtopic of topic.subtopics) {
                const subtopicLabel = toTitleFromSlug(subtopic.slug);
                results.push({ topic, subtopic, topicLabel, subtopicLabel });
            }
        }

        return results;
    }, [editingStageCatalog]);
    const editingTopicResults = React.useMemo<TopicResult[]>(() => {
        const normalizedQuery = editingTopicQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return editingAllTopicResults.slice(0, 80);
        }

        return editingAllTopicResults
            .filter((result) => `${result.topicLabel} ${result.subtopicLabel}`.toLowerCase().includes(normalizedQuery))
            .slice(0, 40);
    }, [editingAllTopicResults, editingTopicQuery]);
    const editingSelectedSubtopic = React.useMemo(() => {
        if (!editingTopicId || !editingSubtopicSlug) {
            return null;
        }

        return editingTopicResults.find((item) => item.topic.id === editingTopicId && item.subtopic.slug === editingSubtopicSlug)
            ?? editingStageCatalog
                .flatMap((topic) => topic.subtopics.map((subtopic) => ({ topic, subtopic })))
                .find((item) => item.topic.id === editingTopicId && item.subtopic.slug === editingSubtopicSlug)
            ?? null;
    }, [editingStageCatalog, editingSubtopicSlug, editingTopicId, editingTopicResults]);

    React.useLayoutEffect(() => {
        if (!questions.length) {
            setQuestionHeights({});
            return;
        }

        const nextHeights: Record<number, number> = {};
        for (const question of questions) {
            const node = questionMeasureRefs.current[question.id];
            if (!node) {
                continue;
            }
            // offsetHeight gives CSS layout height, unaffected by parent CSS transforms (zoom scale).
            nextHeights[question.id] = Math.ceil(node.offsetHeight);
        }

        setQuestionHeights((currentHeights) => {
            const currentKeys = Object.keys(currentHeights);
            const nextKeys = Object.keys(nextHeights);
            if (currentKeys.length !== nextKeys.length) {
                return nextHeights;
            }

            for (const key of nextKeys) {
                if (Math.abs((currentHeights[Number(key)] ?? 0) - (nextHeights[Number(key)] ?? 0)) > 1) {
                    return nextHeights;
                }
            }

            return currentHeights;
        });
    }, [questions, canvasMaxLineWidth, questionFontSize, questionTextAlign]);

    const questionPlacements = React.useMemo(() => {
        type Placement = {
            id: number;
            pageIndex: number;
            x: number;
            y: number;
            width: number;
            measuredHeight: number;
        };

        const placements: Placement[] = [];
        let pageIndex = 0;
        let cursorY = PAGE_MARGIN_TOP;

        for (const question of questions) {
            const measuredHeight = Math.max(MIN_QUESTION_HEIGHT, (questionHeights[question.id] ?? MIN_QUESTION_HEIGHT) + QUESTION_HEIGHT_BUFFER);
            const willOverflow = cursorY + measuredHeight > PAGE_HEIGHT - PAGE_MARGIN_BOTTOM;

            if (willOverflow && cursorY > PAGE_MARGIN_TOP) {
                pageIndex += 1;
                cursorY = PAGE_MARGIN_TOP;
            }

            placements.push({
                id: question.id,
                pageIndex,
                x: QUESTION_MARGIN_X,
                y: cursorY,
                width: questionContentWidth,
                measuredHeight,
            });

            cursorY += measuredHeight + questionSpacing;
        }

        return {
            placements,
            pageCount: Math.max(1, pageIndex + 1),
        };
    }, [questionContentWidth, questionHeights, questionSpacing, questions]);

    const stageHeight = React.useMemo(() => {
        return questionPlacements.pageCount * PAGE_HEIGHT + (questionPlacements.pageCount - 1) * PAGE_GAP;
    }, [questionPlacements.pageCount]);
    const scaledStageHeight = stageHeight * zoomScale;
    const compressionIndex = React.useMemo(() => {
        const index = PDF_COMPRESSION_OPTIONS.findIndex((option) => option.key === downloadCompression);
        return index >= 0 ? index : 2;
    }, [downloadCompression]);

    React.useEffect(() => {
        exportPageRefs.current = exportPageRefs.current.slice(0, questionPlacements.pageCount);
    }, [questionPlacements.pageCount]);

    const placeTop = React.useCallback((pageIndex: number, y: number) => {
        return pageIndex * (PAGE_HEIGHT + PAGE_GAP) + y;
    }, []);

    const formatQuestionNumber = React.useCallback((index: number) => {
        const questionNumber = index + 1;
        return questionNumberStyle === "short" ? `Q${questionNumber}` : `Question ${questionNumber}`;
    }, [questionNumberStyle]);

    const formatQuestionLevel = React.useCallback((question: QuestionItem) => {
        return question.levelMode === "random"
            ? `Random (${question.level})`
            : `Level ${question.level}`;
    }, []);

    const zoomOut = React.useCallback(() => {
        setZoomPercent((currentZoom) => Math.max(MIN_ZOOM_PERCENT, currentZoom - ZOOM_STEP));
    }, []);

    const zoomIn = React.useCallback(() => {
        setZoomPercent((currentZoom) => Math.min(MAX_ZOOM_PERCENT, currentZoom + ZOOM_STEP));
    }, []);

    const toggleSidebarSection = React.useCallback((section: Exclude<SidebarSection, null>) => {
        setActiveSidebarSection((currentSection) => currentSection === section ? null : section);
    }, []);

    const closeEditQuestionModal = React.useCallback(() => {
        if (isSavingQuestionEdit) {
            return;
        }

        setEditingQuestionId(null);
        setEditingQuestionTitle("");
        setEditingQuestionStage("primary");
        setEditingQuestionLevelMode("fixed");
        setEditingQuestionLevel(1);
        setEditingTopicQuery("");
        setEditingTopicDropdownOpen(false);
        setEditingTopicId(null);
        setEditingSubtopicSlug(null);
    }, [isSavingQuestionEdit]);

    const openEditQuestionModal = React.useCallback((question: QuestionItem) => {
        setEditingQuestionId(question.id);
        setEditingQuestionTitle(question.title);
        setEditingQuestionStage(question.stage);
        setEditingQuestionLevelMode(question.levelMode);
        setEditingQuestionLevel(question.level);
        setEditingTopicQuery("");
        setEditingTopicDropdownOpen(false);
        setEditingTopicId(question.topicId);
        setEditingSubtopicSlug(question.subtopicSlug);
    }, []);

    const commitQuestionFontSize = React.useCallback((rawValue: string) => {
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
            setQuestionFontSizeInput("");
            return;
        }

        const parsed = Number.parseInt(trimmedValue, 10);
        if (Number.isNaN(parsed)) {
            setQuestionFontSizeInput(String(questionFontSize));
            return;
        }

        const nextFontSize = Math.min(36, Math.max(10, parsed));
        setQuestionFontSize(nextFontSize);
        setQuestionFontSizeInput(String(nextFontSize));
    }, [questionFontSize]);

    const handleQuestionFontSizeChange = React.useCallback((rawValue: string) => {
        setQuestionFontSizeInput(rawValue);

        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
            return;
        }

        const parsed = Number.parseInt(trimmedValue, 10);
        if (Number.isNaN(parsed)) {
            return;
        }

        if (parsed >= 10 && parsed <= 36) {
            setQuestionFontSize(parsed);
        }
    }, []);

    const commitQuestionSpacing = React.useCallback((rawValue: string) => {
        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
            setQuestionSpacingInput("");
            return;
        }

        const parsed = Number.parseInt(trimmedValue, 10);
        if (Number.isNaN(parsed)) {
            setQuestionSpacingInput(String(questionSpacing));
            return;
        }

        const nextSpacing = Math.min(MAX_QUESTION_GAP, Math.max(MIN_QUESTION_GAP, parsed));
        setQuestionSpacing(nextSpacing);
        setQuestionSpacingInput(String(nextSpacing));
    }, [questionSpacing]);

    const handleQuestionSpacingChange = React.useCallback((rawValue: string) => {
        setQuestionSpacingInput(rawValue);

        const trimmedValue = rawValue.trim();
        if (!trimmedValue) {
            return;
        }

        const parsed = Number.parseInt(trimmedValue, 10);
        if (Number.isNaN(parsed)) {
            return;
        }

        if (parsed >= MIN_QUESTION_GAP && parsed <= MAX_QUESTION_GAP) {
            setQuestionSpacing(parsed);
        }
    }, []);

    React.useEffect(() => {
        setQuestionFontSizeInput(String(questionFontSize));
    }, [questionFontSize]);

    React.useEffect(() => {
        setQuestionSpacingInput(String(questionSpacing));
    }, [questionSpacing]);

    React.useEffect(() => {
        const recalculateLineWidth = () => {
            setCanvasMaxLineWidth(estimateMaxLineWidth(questionContentWidth, questionFontSize));
        };

        recalculateLineWidth();
        window.addEventListener("resize", recalculateLineWidth);
        return () => window.removeEventListener("resize", recalculateLineWidth);
    }, [questionContentWidth, questionFontSize]);

    const moveQuestion = React.useCallback((fromIndex: number, toIndex: number) => {
        setQuestions((currentQuestions) => {
            if (
                fromIndex === toIndex
                || fromIndex < 0
                || toIndex < 0
                || fromIndex >= currentQuestions.length
                || toIndex >= currentQuestions.length
            ) {
                return currentQuestions;
            }

            const reorderedQuestions = [...currentQuestions];
            const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1);
            reorderedQuestions.splice(toIndex, 0, movedQuestion);
            return reorderedQuestions;
        });
    }, []);

    const duplicateQuestion = React.useCallback((questionId: number) => {
        setQuestions((currentQuestions) => {
            const sourceIndex = currentQuestions.findIndex((question) => question.id === questionId);
            if (sourceIndex < 0) {
                return currentQuestions;
            }

            const sourceQuestion = currentQuestions[sourceIndex];
            const duplicatedQuestion: QuestionItem = {
                ...sourceQuestion,
                id: nextQuestionId.current,
            };
            nextQuestionId.current += 1;

            const nextQuestions = [...currentQuestions];
            nextQuestions.splice(sourceIndex + 1, 0, duplicatedQuestion);
            return nextQuestions;
        });
    }, []);

    const deleteQuestion = React.useCallback((questionId: number) => {
        setQuestions((currentQuestions) => currentQuestions.filter((question) => question.id !== questionId));
        setRegeneratingQuestionIds((current) => {
            if (!current[questionId]) {
                return current;
            }

            const next = { ...current };
            delete next[questionId];
            return next;
        });

        if (editingQuestionId === questionId) {
            closeEditQuestionModal();
        }
    }, [closeEditQuestionModal, editingQuestionId]);

    const addQuestionsFromModal = React.useCallback(async () => {
        if (!selectedTopicId || !selectedSubtopicSlug || quantity < 1) {
            return;
        }

        const selectedTopic = QUESTION_CATALOG[modalStage].find((topic) => topic.id === selectedTopicId);
        const selectedSubtopicData = selectedTopic?.subtopics.find((subtopic) => subtopic.slug === selectedSubtopicSlug);
        if (!selectedTopic || !selectedSubtopicData) {
            return;
        }

        setIsGeneratingQuestions(true);

        const subtopicLabel = toTitleFromSlug(selectedSubtopicData.slug);
        const pendingQuestions: Array<Omit<QuestionItem, "latex">> = Array.from({ length: quantity }, () => {
            const nextId = nextQuestionId.current;
            nextQuestionId.current += 1;
            const randomDifficulty = randomFromArray(availableDifficulties) ?? 1;
            const resolvedDifficulty = selectedDifficulty === "random" ? randomDifficulty : selectedDifficulty;

            return {
                id: nextId,
                title: subtopicLabel,
                level: resolvedDifficulty,
                levelMode: selectedDifficulty === "random" ? "random" : "fixed",
                stage: modalStage,
                topicId: selectedTopic.id,
                subtopicSlug: selectedSubtopicData.slug,
            };
        });

        try {
            const generationResults = await Promise.all(
                pendingQuestions.map((question) =>
                    generateQuestionWithTimeout({
                        level: question.stage,
                        topicId: question.topicId,
                        subtopicSlug: question.subtopicSlug,
                        difficulty: question.level,
                    })
                )
            );

            const generatedQuestions: QuestionItem[] = pendingQuestions.map((question, index) => ({
                ...question,
                latex: generationResults[index]?.latex ?? "\\text{Question generation unavailable}",
            }));

            setQuestions((currentQuestions) => [...currentQuestions, ...generatedQuestions]);
            setAddModalOpen(false);
            setTopicQuery("");
            setSelectedTopicId(null);
            setSelectedSubtopicSlug(null);
            setSelectedDifficulty("random");
            setQuantity(1);
        } finally {
            setIsGeneratingQuestions(false);
        }
    }, [availableDifficulties, modalStage, quantity, selectedDifficulty, selectedSubtopicSlug, selectedTopicId]);

    React.useEffect(() => {
        setTopicQuery("");
        setTopicDropdownOpen(false);
        setSelectedTopicId(null);
        setSelectedSubtopicSlug(null);
        setSelectedDifficulty("random");
    }, [modalStage]);

    React.useEffect(() => {
        if (!addModalOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setAddModalOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [addModalOpen]);

    const regenerateQuestion = React.useCallback(async (questionId: number) => {
        const currentQuestion = questions.find((question) => question.id === questionId);
        if (!currentQuestion) {
            return;
        }

        if (regeneratingQuestionIds[questionId]) {
            return;
        }

        setRegeneratingQuestionIds((current) => ({
            ...current,
            [questionId]: true,
        }));

        const availableLevels = getQuestionGeneratorLevels(currentQuestion.stage, currentQuestion.subtopicSlug);
        const nextDifficulty = currentQuestion.levelMode === "random"
            ? (randomFromArray(availableLevels) ?? 1)
            : currentQuestion.level;


        setQuestions((currentQuestions) => currentQuestions.map((question) => {
            if (question.id !== questionId) {
                return question;
            }

            return {
                ...question,
                level: nextDifficulty,
                latex: "\\text{Regenerating question...}",
            };
        }));

        try {
            const regeneratedResult = await generateQuestionWithTimeout({
                level: currentQuestion.stage,
                topicId: currentQuestion.topicId,
                subtopicSlug: currentQuestion.subtopicSlug,
                difficulty: nextDifficulty,
            });

            setQuestions((currentQuestions) => currentQuestions.map((question) => {
                if (question.id !== questionId) {
                    return question;
                }

                return {
                    ...question,
                    level: nextDifficulty,
                    latex: regeneratedResult.latex || "\\text{Question generation unavailable}",
                };
            }));
        } finally {
            setRegeneratingQuestionIds((current) => {
                if (!current[questionId]) {
                    return current;
                }

                const next = { ...current };
                delete next[questionId];
                return next;
            });
        }
    }, [questions, regeneratingQuestionIds]);

    const saveEditedQuestion = React.useCallback(async () => {
        if (!editingQuestion) {
            return;
        }

        const normalizedTitle = editingQuestionTitle.trim() || editingQuestion.title;
        const nextStage = editingQuestionStage;
        const nextTopicId = editingTopicId ?? editingQuestion.topicId;
        const nextSubtopicSlug = editingSubtopicSlug ?? editingQuestion.subtopicSlug;
        const normalizedAvailableDifficulties = editingQuestionLevelMode === "random"
            ? editingQuestionAvailableDifficulties
            : editingQuestionAvailableDifficulties.filter((difficulty) => difficulty === editingQuestionLevel);
        const nextDifficulty = editingQuestionLevelMode === "random"
            ? (randomFromArray(normalizedAvailableDifficulties) ?? randomFromArray(editingQuestionAvailableDifficulties) ?? 1)
            : (editingQuestionAvailableDifficulties.includes(editingQuestionLevel)
                ? editingQuestionLevel
                : (editingQuestionAvailableDifficulties[0] ?? editingQuestionLevel));
        const shouldRegenerate = editingQuestion.levelMode !== editingQuestionLevelMode
            || (editingQuestionLevelMode === "fixed" && editingQuestion.level !== editingQuestionLevel);
        const stageChanged = editingQuestion.stage !== nextStage;
        const topicChanged = editingQuestion.topicId !== nextTopicId || editingQuestion.subtopicSlug !== nextSubtopicSlug;

        setIsSavingQuestionEdit(true);

        if (!shouldRegenerate && !topicChanged && !stageChanged) {
            setQuestions((currentQuestions) => currentQuestions.map((question) => (
                question.id === editingQuestion.id
                    ? {
                        ...question,
                        title: normalizedTitle,
                    }
                    : question
            )));
            setIsSavingQuestionEdit(false);
            closeEditQuestionModal();
            return;
        }

        setQuestions((currentQuestions) => currentQuestions.map((question) => (
            question.id === editingQuestion.id
                ? {
                    ...question,
                    title: normalizedTitle,
                    stage: nextStage,
                    topicId: nextTopicId,
                    subtopicSlug: nextSubtopicSlug,
                    levelMode: editingQuestionLevelMode,
                    level: nextDifficulty,
                    latex: "\\text{Updating question...}",
                }
                : question
        )));

        try {
            const regeneratedResult = await generateQuestionWithTimeout({
                level: nextStage,
                topicId: nextTopicId,
                subtopicSlug: nextSubtopicSlug,
                difficulty: nextDifficulty,
            });

            setQuestions((currentQuestions) => currentQuestions.map((question) => (
                question.id === editingQuestion.id
                    ? {
                        ...question,
                        title: normalizedTitle,
                        stage: nextStage,
                        topicId: nextTopicId,
                        subtopicSlug: nextSubtopicSlug,
                        levelMode: editingQuestionLevelMode,
                        level: nextDifficulty,
                        latex: regeneratedResult.latex || "\\text{Question generation unavailable}",
                    }
                    : question
            )));
            closeEditQuestionModal();
        } finally {
            setIsSavingQuestionEdit(false);
        }
    }, [closeEditQuestionModal, editingQuestion, editingQuestionAvailableDifficulties, editingQuestionLevel, editingQuestionLevelMode, editingQuestionStage, editingQuestionTitle, editingSubtopicSlug, editingTopicId]);

    const closeDownloadModal = React.useCallback(() => {
        if (isExportingPdf) {
            return;
        }
        setDownloadModalOpen(false);
    }, [isExportingPdf]);

    const exportPdf = React.useCallback(async () => {
        setIsExportingPdf(true);

        try {
            const safeFileName = sanitizeFileName(exportFileName) || "Exam Paper";
            const compressionOption = PDF_COMPRESSION_OPTIONS.find((option) => option.key === downloadCompression) ?? PDF_COMPRESSION_OPTIONS[2];
            if (typeof document !== "undefined" && "fonts" in document) {
                await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
            }

            const doc = new jsPDF({
                unit: "mm",
                format: [PAGE_WIDTH * PX_TO_MM, PAGE_HEIGHT * PX_TO_MM],
                compress: compressionOption.key !== "none",
                putOnlyUsedFonts: true,
            });

            doc.setProperties({
                title: (paperTitle || safeFileName).trim() || safeFileName,
                author: "examiniser.com",
                creator: "examiniser.com",
                subject: "Exam paper",
            });

            const questionIndexById = new Map(questions.map((question, index) => [question.id, index]));

            for (let pageIndex = 0; pageIndex < questionPlacements.pageCount; pageIndex += 1) {
                const exportNode = exportPageRefs.current[pageIndex];
                if (!exportNode) {
                    continue;
                }

                if (pageIndex > 0) {
                    doc.addPage([PAGE_WIDTH * PX_TO_MM, PAGE_HEIGHT * PX_TO_MM], "portrait");
                }

                const renderedCanvas = await toCanvas(exportNode, {
                    backgroundColor: "#ffffff",
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    pixelRatio: 2,
                    cacheBust: true,
                    filter: (node) => {
                        if (!(node instanceof Element)) {
                            return true;
                        }
                        return !(
                            node.getAttribute("data-export-vector-text") === "true"
                            ||
                            node.classList.contains("katex-mathml")
                            || node.matches("math, semantics, annotation")
                        );
                    },
                    style: {
                        textShadow: "none",
                    },
                });

                const imageType = "PNG";
                const imageData = renderedCanvas.toDataURL(
                    imageType === "PNG" ? "image/png" : "image/jpeg",
                    compressionOption.imageQuality,
                );
                doc.addImage(
                    imageData,
                    imageType,
                    0,
                    0,
                    PAGE_WIDTH * PX_TO_MM,
                    PAGE_HEIGHT * PX_TO_MM,
                    undefined,
                    compressionOption.imageCompression,
                );

                const titleText = (paperTitle || "Exam Paper").trim() || "Exam Paper";
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(19.5);
                doc.text(
                    titleText,
                    PAGE_MARGIN_X * PX_TO_MM,
                    (42 + 26) * PX_TO_MM,
                );

                doc.setTextColor(90, 90, 90);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10.5);
                doc.text(
                    `Page ${pageIndex + 1}`,
                    (PAGE_WIDTH - PAGE_MARGIN_X) * PX_TO_MM,
                    (PAGE_HEIGHT - 42 + 14) * PX_TO_MM,
                    { align: "right" },
                );

                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                questionPlacements.placements
                    .filter((placement) => placement.pageIndex === pageIndex)
                    .forEach((placement) => {
                        const questionIndex = questionIndexById.get(placement.id);
                        if (questionIndex === undefined) {
                            return;
                        }

                        doc.text(
                            formatQuestionNumber(questionIndex),
                            (placement.x + 8) * PX_TO_MM,
                            (placement.y + QUESTION_RENDER_PADDING_Y + 12) * PX_TO_MM,
                        );
                    });
            }

            doc.save(`${safeFileName}.pdf`);
            setDownloadModalOpen(false);
        } finally {
            setIsExportingPdf(false);
        }
    }, [downloadCompression, exportFileName, formatQuestionNumber, paperTitle, questionPlacements.pageCount, questionPlacements.placements, questions]);

    React.useEffect(() => {
        if (!downloadModalOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeDownloadModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [closeDownloadModal, downloadModalOpen]);

    return (
        <div className="flex h-screen w-full flex-col items-center overflow-hidden">
            <div className="flex w-full h-12 p-2 border-b border-grey items-center">
                <Link href={`/${lng}/`} className="font-nunito text-2xl text-primary mr-4">
                    Examiniser
                </Link>
                <input
                    value={exportFileName}
                    onChange={(event) => setExportFileName(sanitizeFileName(event.target.value))}
                    className="h-full w-48 border border-grey rounded-md p-1 overflow-hidden whitespace-nowrap overflow-ellipsis transition-shadow duration-200 ease-out focus:outline-none focus:shadow-[0_0_0_3px_var(--accent)]"
                    onBlur={(event) => {
                        event.currentTarget.scrollLeft = 0;
                    }}
                    placeholder="Enter file name here..."
                />
                <div className="ml-4 flex h-full items-center gap-1">
                    <button
                        type="button"
                        className="flex h-full min-w-10 items-center justify-center rounded-md border border-black bg-white px-3 text-black transition-shadow duration-200 ease-out hover:shadow-[0_0_0_3px_var(--contrast)] disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={zoomOut}
                        disabled={zoomPercent <= MIN_ZOOM_PERCENT}
                        aria-label="Zoom out"
                    >
                        -
                    </button>
                    <span className="min-w-16 text-center font-nunito text-sm text-black">
                        {zoomPercent}%
                    </span>
                    <button
                        type="button"
                        className="flex h-full min-w-10 items-center justify-center rounded-md border border-black bg-white px-3 text-black transition-shadow duration-200 ease-out hover:shadow-[0_0_0_3px_var(--contrast)] disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={zoomIn}
                        disabled={zoomPercent >= MAX_ZOOM_PERCENT}
                        aria-label="Zoom in"
                    >
                        +
                    </button>
                </div>
                <span className="flex flex-1" />
                <button
                    type="button"
                    onClick={() => setDownloadModalOpen(true)}
                    className="h-full px-4 bg-white text-black border border-black rounded-md transition-shadow duration-200 ease-out hover:outline-none hover:shadow-[0_0_0_3px_var(--contrast)]"
                >
                    Download
                </button>
            </div>
            <div className="flex min-h-0 flex-1 w-full">
                <div className="flex min-h-0 flex-1 overflow-auto bg-[#d7d2ca] p-6">
                    <div className="mx-auto">
                        <div className="relative pb-6" style={{ width: scaledPageWidth, minHeight: scaledStageHeight + 24 }}>
                            <div
                                className="origin-top-left"
                                style={{
                                    width: PAGE_WIDTH,
                                    minHeight: stageHeight,
                                    transform: `scale(${zoomScale})`,
                                }}
                            >
                                <div className="relative" style={{ width: PAGE_WIDTH, minHeight: stageHeight }}>
                                    <Stage width={PAGE_WIDTH} height={stageHeight}>
                                        <Layer>
                                            {Array.from({ length: questionPlacements.pageCount }, (_, index) => {
                                                const pageY = index * (PAGE_HEIGHT + PAGE_GAP);
                                                return (
                                                    <React.Fragment key={`page-${index}`}>
                                                        <Rect
                                                            x={0}
                                                            y={pageY}
                                                            width={PAGE_WIDTH}
                                                            height={PAGE_HEIGHT}
                                                            fill="#fffdfa"
                                                            stroke="#ddd6c8"
                                                            strokeWidth={1.5}
                                                            cornerRadius={8}
                                                            shadowColor="#201812"
                                                            shadowBlur={20}
                                                            shadowOpacity={0.12}
                                                            shadowOffsetY={8}
                                                        />
                                                        <Text
                                                            x={PAGE_MARGIN_X}
                                                            y={pageY + 42}
                                                            text={paperTitle || "Exam Paper"}
                                                            fontSize={26}
                                                            fontFamily="Nunito"
                                                            fontStyle="700"
                                                            fill="#141414"
                                                        />
                                                        <Text
                                                            x={PAGE_WIDTH - PAGE_MARGIN_X - 130}
                                                            y={pageY + PAGE_HEIGHT - 42}
                                                            width={130}
                                                            align="right"
                                                            text={`Page ${index + 1}`}
                                                            fontSize={14}
                                                            fontFamily="Nunito"
                                                            fill="#5a5a5a"
                                                        />
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Layer>
                                    </Stage>

                                    <div className="pointer-events-none absolute inset-0">
                                        {!questions.length && (
                                            <div
                                                className="pointer-events-none absolute rounded-2xl border border-dashed border-black/25 bg-[#fffdf8]/90 p-6"
                                                style={{
                                                    left: PAGE_MARGIN_X,
                                                    top: PAGE_MARGIN_TOP,
                                                    width: questionContentWidth,
                                                }}
                                            >
                                                <p className="font-nunito text-base text-black">No questions yet.</p>
                                                <p className="mt-1 font-nunito text-sm text-grey">Use the add button in the sidebar to generate questions and fill pages automatically.</p>
                                            </div>
                                        )}

                                        {questionPlacements.placements.map((placement) => {
                                            const question = questions.find((item) => item.id === placement.id);
                                            if (!question) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={`canvas-question-${question.id}`}
                                                    className="pointer-events-auto absolute px-2"
                                                    style={{
                                                        left: placement.x,
                                                        top: placeTop(placement.pageIndex, placement.y),
                                                        width: placement.width,
                                                        paddingTop: QUESTION_RENDER_PADDING_Y,
                                                        paddingBottom: QUESTION_RENDER_PADDING_Y,
                                                    }}
                                                >
                                                    <p className="font-nunito text-xs uppercase tracking-[0.18em] text-black">
                                                        {formatQuestionNumber(questions.findIndex((item) => item.id === question.id))}
                                                    </p>
                                                    <div className="mt-2 text-black">
                                                        <EditorWrapLatex latex={question.latex} maxLineWidth={canvasMaxLineWidth} textAlign={questionTextAlign} fontSize={questionFontSize} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pointer-events-none absolute -z-10 left-[-99999px] top-0" style={{ width: questionContentWidth }}>
                                        {questions.map((question, index) => (
                                            <div
                                                key={`measure-${question.id}`}
                                                ref={(node) => {
                                                    questionMeasureRefs.current[question.id] = node;
                                                }}
                                                className="mb-4 px-2"
                                                style={{
                                                    paddingTop: QUESTION_RENDER_PADDING_Y,
                                                    paddingBottom: QUESTION_RENDER_PADDING_Y,
                                                }}
                                            >
                                                <p className="font-nunito text-xs uppercase tracking-[0.18em] text-black">
                                                    {formatQuestionNumber(index)}
                                                </p>
                                                <div className="mt-2 text-black">
                                                    <EditorWrapLatex latex={question.latex} maxLineWidth={canvasMaxLineWidth} textAlign={questionTextAlign} fontSize={questionFontSize} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex min-h-0 h-full w-96 flex-col border-l border-grey bg-white">
                    <p className="text-center font-bold text-xl text-black mt-2 font-nunito">
                        Customise
                    </p>
                    <div className="w-full shrink-0 bg-white">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-black"
                            onClick={() => toggleSidebarSection("layout")}
                            aria-expanded={activeSidebarSection === "layout"}
                        >
                            <span className="font-nunito text-lg font-semibold">Layout</span>
                            <SectionToggleIcon open={activeSidebarSection === "layout"} />
                        </button>
                        {activeSidebarSection === "layout" && (
                            <div className="px-4 pb-4">
                                <div className="flex w-full justify-center py-3">
                                    <button onClick={() => setSelectedLayout("linear")} className={`items-center justify-center flex flex-col rounded-md m-2 ${selectedLayout === "linear" ? "transition duration-200 shadow-[0_0_0_0.2rem_var(--accent)]" : ""}`}>
                                        <p className="text-center text-grey text-sm">Linear</p>
                                        <div className="items-center justify-center flex">
                                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="4.5" y="4.5" width="39" height="39" rx="5.5" stroke="black"/>
                                                <line x1="4" y1="24" x2="44" y2="24" stroke="black"/>
                                                <line x1="4" y1="14.5" x2="44" y2="14.5" stroke="black"/>
                                                <line x1="4" y1="33.5" x2="44" y2="33.5" stroke="black"/>
                                            </svg>
                                        </div>
                                    </button>
                                    <button onClick={() => setSelectedLayout("grid")} className={`items-center justify-center flex flex-col rounded-md m-2 ${selectedLayout === "grid" ? "transition duration-200 shadow-[0_0_0_0.2rem_var(--accent)]" : ""}`}>
                                        <p className="text-center text-grey text-sm">Grid</p>
                                        <div className="items-center justify-center flex">
                                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="4.5" y="4.5" width="39" height="39" rx="5.5" stroke="black"/>
                                                <line x1="4" y1="24" x2="44" y2="24" stroke="black"/>
                                                <line x1="24" y1="44" x2="24" y2="4" stroke="black"/>
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                                <label htmlFor="question-spacing" className="mb-2 mt-2 block font-nunito text-center text-xs uppercase tracking-[0.18em] text-grey">
                                    Question Spacing
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="question-spacing"
                                        type="number"
                                        min={MIN_QUESTION_GAP}
                                        max={MAX_QUESTION_GAP}
                                        value={questionSpacingInput}
                                        onChange={(event) => handleQuestionSpacingChange(event.target.value)}
                                        onBlur={(event) => commitQuestionSpacing(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                commitQuestionSpacing(event.currentTarget.value);
                                                event.currentTarget.blur();
                                            }
                                        }}
                                        className="h-11 w-20 shrink-0 rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                    />
                                    <input
                                        type="range"
                                        min={MIN_QUESTION_GAP}
                                        max={MAX_QUESTION_GAP}
                                        step={1}
                                        value={questionSpacing}
                                        onChange={(event) => setQuestionSpacing(Number.parseInt(event.target.value, 10))}
                                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/15 accent-black"
                                        aria-label="Question spacing"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full shrink-0 border-t border-black/10 bg-white">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-black"
                            onClick={() => toggleSidebarSection("styling")}
                            aria-expanded={activeSidebarSection === "styling"}
                        >
                            <span className="font-nunito text-lg font-semibold">Styling</span>
                            <SectionToggleIcon open={activeSidebarSection === "styling"} />
                        </button>
                        {activeSidebarSection === "styling" && (
                            <div className="px-4 pb-4">
                                <label htmlFor="paper-title" className="mb-2 block font-nunito text-xs uppercase tracking-[0.18em] text-grey">
                                    Title
                                </label>
                                <input
                                    id="paper-title"
                                    value={paperTitle}
                                    onChange={(event) => setPaperTitle(event.target.value)}
                                    placeholder="Exam Paper"
                                    className="mb-4 h-11 w-full rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                />
                                <label htmlFor="question-number-style" className="mb-2 block font-nunito text-xs uppercase tracking-[0.18em] text-grey">
                                    Question Number Style
                                </label>
                                <select
                                    id="question-number-style"
                                    value={questionNumberStyle}
                                    onChange={(event) => setQuestionNumberStyle(event.target.value as "short" | "long")}
                                    className="mb-4 h-11 w-full rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                >
                                    <option value="short">Q1</option>
                                    <option value="long">Question 1</option>
                                </select>
                                <p className="mb-2 block font-nunito text-xs uppercase tracking-[0.18em] text-grey">
                                    Question Text Alignment
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: "left", label: "Left" },
                                        { value: "center", label: "Center" },
                                        { value: "right", label: "Right" },
                                    ] as const).map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setQuestionTextAlign(option.value)}
                                            className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${questionTextAlign === option.value
                                                ? "border-black bg-black text-white"
                                                : "border-black/20 bg-white text-black hover:border-black"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <label htmlFor="question-font-size" className="mb-2 mt-4 block font-nunito text-xs uppercase tracking-[0.18em] text-grey">
                                    Question Font Size
                                </label>
                                <input
                                    id="question-font-size"
                                    type="number"
                                    min={10}
                                    max={36}
                                    value={questionFontSizeInput}
                                    onChange={(event) => handleQuestionFontSizeChange(event.target.value)}
                                    onBlur={(event) => commitQuestionFontSize(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            commitQuestionFontSize(event.currentTarget.value);
                                            event.currentTarget.blur();
                                        }
                                    }}
                                    className="h-11 w-full rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex min-h-0 flex-1 w-full flex-col border bg-white">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-black"
                            onClick={() => toggleSidebarSection("questions")}
                            aria-expanded={activeSidebarSection === "questions"}
                        >
                            <span className="font-nunito text-lg font-semibold">Questions</span>
                            <SectionToggleIcon open={activeSidebarSection === "questions"} />
                        </button>
                        {activeSidebarSection === "questions" && (
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex w-full items-center justify-between px-4 pb-3 pt-3">
                                    <p className="font-nunito text-sm uppercase tracking-[0.24em] text-grey">
                                        {questions.length} questions
                                    </p>
                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-white text-black transition-shadow duration-200 ease-out hover:shadow-[0_0_0_3px_var(--contrast)]"
                                        onClick={() => setAddModalOpen(true)}
                                        aria-label="Add question"
                                    >
                                        <PlusIcon />
                                    </button>
                                </div>
                                <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4">
                                    {questions.map((question, index) => (
                                        <div
                                            key={question.id}
                                            className={`relative flex items-center gap-2 rounded-2xl border bg-white m-1 p-3 shadow-[0_12px_25px_rgba(0,0,0,0.05)] transition duration-200 ${draggedQuestionId === question.id ? "scale-[0.98] opacity-70" : "hover:scale-[1.01] hover:shadow-[0_16px_30px_rgba(0,0,0,0.08)]"}`}
                                            draggable
                                            onDragStart={() => setDraggedQuestionId(question.id)}
                                            onDragEnd={() => setDraggedQuestionId(null)}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                            }}
                                            onDrop={() => {
                                                if (draggedQuestionId === null) {
                                                    return;
                                                }

                                                const fromIndex = questions.findIndex((item) => item.id === draggedQuestionId);
                                                moveQuestion(fromIndex, index);
                                                setDraggedQuestionId(null);
                                            }}
                                        >
                                            <div className="flex flex-col items-center gap-1 text-grey">
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                    onClick={() => moveQuestion(index, index - 1)}
                                                    disabled={index === 0}
                                                    aria-label={`Move ${question.title} up`}
                                                >
                                                    <ChevronUpIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 cursor-grab items-center justify-center rounded-full border border-black/10 bg-[#f3f0ea] text-black active:cursor-grabbing"
                                                    aria-label={`Drag ${question.title}`}
                                                >
                                                    <DragHandleIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                    onClick={() => moveQuestion(index, index + 1)}
                                                    disabled={index === questions.length - 1}
                                                    aria-label={`Move ${question.title} down`}
                                                >
                                                    <ChevronDownIcon />
                                                </button>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-nunito text-[0.68rem] uppercase tracking-[0.22em] text-grey">
                                                    Question {index + 1}
                                                </p>
                                                <p className="truncate font-nunito text-base font-bold text-black">
                                                    {question.title}
                                                </p>
                                                <div className="font-nunito text-xs text-grey">
                                                    <p>{stageLabel(question.stage)}</p>
                                                    <p>{formatQuestionLevel(question)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-full border border-black px-3 py-2 font-nunito text-sm text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    onDragStart={(event) => event.preventDefault()}
                                                    onClick={() => regenerateQuestion(question.id)}
                                                    disabled={Boolean(regeneratingQuestionIds[question.id])}
                                                >
                                                    {regeneratingQuestionIds[question.id] ? "Regenerating..." : "Regenerate"}
                                                </button>
                                            </div>
                                            <div className="ml-1 flex min-h-[88px] flex-col items-center justify-between gap-2">
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors duration-200 hover:bg-black hover:text-white"
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    onDragStart={(event) => event.preventDefault()}
                                                    onClick={() => openEditQuestionModal(question)}
                                                    aria-label={`Edit ${question.title}`}
                                                >
                                                    <PencilIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors duration-200 hover:bg-black hover:text-white"
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    onDragStart={(event) => event.preventDefault()}
                                                    onClick={() => duplicateQuestion(question.id)}
                                                    aria-label={`Duplicate ${question.title}`}
                                                >
                                                    <DuplicateIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors duration-200 hover:bg-black hover:text-white"
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    onDragStart={(event) => event.preventDefault()}
                                                    onClick={() => deleteQuestion(question.id)}
                                                    aria-label={`Delete ${question.title}`}
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="pointer-events-none fixed left-[-100000px] top-0 z-[-1]" aria-hidden="true">
                {Array.from({ length: questionPlacements.pageCount }, (_, pageIndex) => {
                    const pagePlacements = questionPlacements.placements.filter((placement) => placement.pageIndex === pageIndex);

                    return (
                        <div
                            key={`export-capture-page-${pageIndex}`}
                            ref={(node) => {
                                exportPageRefs.current[pageIndex] = node;
                            }}
                            className="relative overflow-hidden"
                            style={{
                                width: PAGE_WIDTH,
                                height: PAGE_HEIGHT,
                                background: "#fffdfa",
                            }}
                        >
                            <p
                                className="absolute font-nunito text-black"
                                data-export-vector-text="true"
                                style={{
                                    left: PAGE_MARGIN_X,
                                    top: 42,
                                    fontSize: 26,
                                    fontWeight: 700,
                                }}
                            >
                                {paperTitle || "Exam Paper"}
                            </p>
                            <p
                                className="absolute font-nunito text-[#5a5a5a]"
                                data-export-vector-text="true"
                                style={{
                                    right: PAGE_MARGIN_X,
                                    top: PAGE_HEIGHT - 42,
                                    fontSize: 14,
                                }}
                            >
                                {`Page ${pageIndex + 1}`}
                            </p>

                            {pagePlacements.map((placement) => {
                                const question = questions.find((item) => item.id === placement.id);
                                if (!question) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={`export-capture-question-${question.id}`}
                                        className="absolute px-2"
                                        style={{
                                            left: placement.x,
                                            top: placement.y,
                                            width: placement.width,
                                            paddingTop: QUESTION_RENDER_PADDING_Y,
                                            paddingBottom: QUESTION_RENDER_PADDING_Y,
                                        }}
                                    >
                                        <p className="font-nunito text-xs uppercase tracking-[0.18em] text-black" data-export-vector-text="true">
                                            {formatQuestionNumber(questions.findIndex((item) => item.id === question.id))}
                                        </p>
                                        <div className="mt-2 text-black">
                                            <EditorWrapLatex
                                                latex={question.latex}
                                                maxLineWidth={canvasMaxLineWidth}
                                                textAlign={questionTextAlign}
                                                fontSize={questionFontSize}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            {addModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/15 bg-[#fffdf8] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                        <div className="border-b border-black/10 bg-[#f6f2e8] px-5 py-4">
                            <p className="font-nunito text-xs uppercase tracking-[0.26em] text-grey">Question Builder</p>
                            <h2 className="mt-1 font-nunito text-2xl font-bold text-black">Add Questions</h2>
                        </div>

                        <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-5 py-5">
                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Pick Stage</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {STAGE_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setModalStage(option.id)}
                                            className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${modalStage === option.id
                                                ? "border-black bg-black text-white"
                                                : "border-black/20 bg-white text-black hover:border-black"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Hammer Search Topic</p>
                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey">
                                        <HammerIcon />
                                    </div>
                                    <input
                                        value={topicQuery}
                                        onChange={(event) => {
                                            setTopicQuery(event.target.value);
                                            setTopicDropdownOpen(true);
                                        }}
                                        onFocus={() => setTopicDropdownOpen(true)}
                                        placeholder="Search by topic or subtopic"
                                        className="h-11 w-full rounded-xl border border-black/20 bg-white pl-10 pr-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                    />
                                </div>
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setTopicDropdownOpen((open) => !open)}
                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-black/20 bg-white px-3 text-left font-nunito text-sm text-black transition duration-200 hover:border-black"
                                    >
                                        <span className="truncate">
                                            {selectedSubtopic
                                                ? `${toTitleFromSlug(selectedSubtopic.topic.id)} • ${toTitleFromSlug(selectedSubtopic.subtopic.slug)}`
                                                : "Select topic from dropdown"}
                                        </span>
                                        <SectionToggleIcon open={topicDropdownOpen} />
                                    </button>
                                    {topicDropdownOpen && (
                                        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-black/15 bg-white">
                                            {!topicResults.length && (
                                                <p className="px-3 py-3 font-nunito text-sm text-grey">No matches for this search.</p>
                                            )}
                                            {topicResults.map((result) => {
                                                const isSelected = result.topic.id === selectedTopicId && result.subtopic.slug === selectedSubtopicSlug;
                                                return (
                                                    <button
                                                        key={`${result.topic.id}-${result.subtopic.slug}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTopicId(result.topic.id);
                                                            setSelectedSubtopicSlug(result.subtopic.slug);
                                                            setTopicQuery("");
                                                            setTopicDropdownOpen(false);
                                                        }}
                                                        className={`flex w-full flex-col border-b border-black/10 px-3 py-2 text-left font-nunito last:border-b-0 ${isSelected
                                                            ? "bg-black text-white"
                                                            : "bg-white text-black hover:bg-[#f8f3e7]"
                                                            }`}
                                                    >
                                                        <span className="text-xs uppercase tracking-[0.16em] opacity-70">{result.topicLabel}</span>
                                                        <span className="text-sm font-semibold">{result.subtopicLabel}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Choose Level</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDifficulty("random")}
                                        className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${selectedDifficulty === "random"
                                            ? "border-black bg-black text-white"
                                            : "border-black/20 bg-white text-black hover:border-black"
                                            }`}
                                    >
                                        Random
                                    </button>
                                    {availableDifficulties.map((difficulty) => (
                                        <button
                                            key={difficulty}
                                            type="button"
                                            onClick={() => setSelectedDifficulty(difficulty)}
                                            className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${selectedDifficulty === difficulty
                                                ? "border-black bg-black text-white"
                                                : "border-black/20 bg-white text-black hover:border-black"
                                                }`}
                                        >
                                            Level {difficulty}
                                        </button>
                                    ))}
                                </div>
                                {Boolean(selectedSubtopicSlug) && !availableDifficulties.length && (
                                    <p className="mt-2 font-nunito text-xs text-grey">No fixed levels listed for this subtopic, random will use level 1.</p>
                                )}
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">How Many</p>
                                <input
                                    type="number"
                                    min={1}
                                    max={40}
                                    value={quantity}
                                    onChange={(event) => {
                                        const parsed = Number.parseInt(event.target.value, 10);
                                        if (Number.isNaN(parsed)) {
                                            setQuantity(1);
                                            return;
                                        }
                                        setQuantity(Math.min(40, Math.max(1, parsed)));
                                    }}
                                    className="h-11 w-28 rounded-lg border border-black/20 px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                />
                            </div>

                            <div className="rounded-xl border border-black/15 bg-white px-3 py-2">
                                <p className="font-nunito text-xs uppercase tracking-[0.16em] text-grey">Preview</p>
                                <p className="mt-1 font-nunito text-sm text-black">
                                    {selectedSubtopic
                                        ? `${stageLabel(modalStage)} • ${toTitleFromSlug(selectedSubtopic.topic.id)} • ${toTitleFromSlug(selectedSubtopic.subtopic.slug)}`
                                        : "Pick a stage and search-select a topic."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-black/10 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="rounded-lg border border-black/20 bg-white px-4 py-2 font-nunito text-sm text-black transition duration-200 hover:border-black"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addQuestionsFromModal}
                                disabled={!canAddFromModal || isGeneratingQuestions}
                                className="rounded-lg border border-black bg-black px-4 py-2 font-nunito text-sm text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isGeneratingQuestions
                                    ? "Generating..."
                                    : `Add ${quantity} Question${quantity === 1 ? "" : "s"}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {downloadModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
                    <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/15 bg-[#fffdf8] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                        <div className="border-b border-black/10 bg-[#f6f2e8] px-5 py-4">
                            <p className="font-nunito text-xs uppercase tracking-[0.26em] text-grey">Export</p>
                            <h2 className="mt-1 font-nunito text-2xl font-bold text-black">Download PDF</h2>
                        </div>

                        <div className="flex flex-col gap-4 px-5 py-5">
                            <div>
                                <label htmlFor="download-file-name" className="mb-2 block font-nunito text-sm uppercase tracking-[0.22em] text-grey">
                                    File Name
                                </label>
                                <input
                                    id="download-file-name"
                                    value={exportFileName}
                                    onChange={(event) => setExportFileName(sanitizeFileName(event.target.value))}
                                    placeholder="Exam Paper"
                                    className="h-11 w-full rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                />
                            </div>

                            <div>
                                <p className="mb-2 block font-nunito text-sm uppercase tracking-[0.22em] text-grey">
                                    Compression Level
                                </p>
                                <div className="rounded-lg border border-black/20 bg-white px-4 pb-3 pt-5">
                                    <div className="relative">
                                        <div className="h-1 rounded-full bg-black/15" />
                                        <div
                                            className="absolute left-0 top-0 h-1 rounded-full bg-black transition-all duration-200"
                                            style={{ width: `${(compressionIndex / Math.max(1, PDF_COMPRESSION_OPTIONS.length - 1)) * 100}%` }}
                                        />
                                        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                                            {PDF_COMPRESSION_OPTIONS.map((option) => (
                                                <span
                                                    key={`compression-stop-${option.key}`}
                                                    className={`h-3 w-3 rounded-full border ${downloadCompression === option.key
                                                        ? "border-black bg-black"
                                                        : "border-black/40 bg-white"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={PDF_COMPRESSION_OPTIONS.length - 1}
                                            step={1}
                                            value={compressionIndex}
                                            onChange={(event) => {
                                                const nextIndex = Number.parseInt(event.target.value, 10);
                                                const option = PDF_COMPRESSION_OPTIONS[nextIndex] ?? PDF_COMPRESSION_OPTIONS[2];
                                                setDownloadCompression(option.key);
                                            }}
                                            className="absolute -top-2 h-6 w-full cursor-pointer opacity-0"
                                            aria-label="Compression level"
                                        />
                                    </div>
                                    <div className="mt-3 flex items-start justify-between gap-1">
                                        {PDF_COMPRESSION_OPTIONS.map((option) => (
                                            <button
                                                key={`compression-label-${option.key}`}
                                                type="button"
                                                onClick={() => setDownloadCompression(option.key)}
                                                className={`min-w-0 flex-1 text-center font-nunito text-xs transition-colors ${downloadCompression === option.key
                                                    ? "font-bold text-black"
                                                    : "text-grey hover:text-black"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-black/10 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={closeDownloadModal}
                                disabled={isExportingPdf}
                                className="rounded-lg border border-black/20 bg-white px-4 py-2 font-nunito text-sm text-black transition duration-200 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={exportPdf}
                                disabled={isExportingPdf}
                                className="rounded-lg border border-black bg-black px-4 py-2 font-nunito text-sm text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isExportingPdf ? "Exporting..." : "Export"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editingQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-black/15 bg-[#fffdf8] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                        <div className="border-b border-black/10 bg-[#f6f2e8] px-5 py-4">
                            <p className="font-nunito text-xs uppercase tracking-[0.26em] text-grey">Question Editor</p>
                            <h2 className="mt-1 font-nunito text-2xl font-bold text-black">Edit Question</h2>
                        </div>

                        <div className="flex flex-col gap-4 px-5 py-5">
                            <div className="rounded-xl border border-black/15 bg-white px-3 py-2">
                                <p className="font-nunito text-xs uppercase tracking-[0.16em] text-grey">Topic</p>
                                <p className="mt-1 font-nunito text-sm text-black">
                                    {stageLabel(editingQuestionStage)} • {editingSelectedSubtopic
                                        ? `${toTitleFromSlug(editingSelectedSubtopic.topic.id)} • ${toTitleFromSlug(editingSelectedSubtopic.subtopic.slug)}`
                                        : `${toTitleFromSlug(editingQuestion.topicId)} • ${toTitleFromSlug(editingQuestion.subtopicSlug)}`}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Pick Stage</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {STAGE_OPTIONS.map((option) => (
                                        <button
                                            key={`edit-stage-${option.id}`}
                                            type="button"
                                            onClick={() => {
                                                setEditingQuestionStage(option.id);
                                                setEditingTopicQuery("");
                                                setEditingTopicDropdownOpen(false);
                                                setEditingTopicId(null);
                                                setEditingSubtopicSlug(null);
                                                setEditingQuestionLevelMode("random");
                                            }}
                                            className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${editingQuestionStage === option.id
                                                ? "border-black bg-black text-white"
                                                : "border-black/20 bg-white text-black hover:border-black"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Change Topic</p>
                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey">
                                        <HammerIcon />
                                    </div>
                                    <input
                                        value={editingTopicQuery}
                                        onChange={(event) => {
                                            setEditingTopicQuery(event.target.value);
                                            setEditingTopicDropdownOpen(true);
                                        }}
                                        onFocus={() => setEditingTopicDropdownOpen(true)}
                                        placeholder="Search by topic or subtopic"
                                        className="h-11 w-full rounded-xl border border-black/20 bg-white pl-10 pr-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                    />
                                </div>
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTopicDropdownOpen((open) => !open)}
                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-black/20 bg-white px-3 text-left font-nunito text-sm text-black transition duration-200 hover:border-black"
                                    >
                                        <span className="truncate">
                                            {editingSelectedSubtopic
                                                ? `${toTitleFromSlug(editingSelectedSubtopic.topic.id)} • ${toTitleFromSlug(editingSelectedSubtopic.subtopic.slug)}`
                                                : "Select topic from dropdown"}
                                        </span>
                                        <SectionToggleIcon open={editingTopicDropdownOpen} />
                                    </button>
                                    {editingTopicDropdownOpen && (
                                        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-black/15 bg-white">
                                            {!editingTopicResults.length && (
                                                <p className="px-3 py-3 font-nunito text-sm text-grey">No matches for this search.</p>
                                            )}
                                            {editingTopicResults.map((result) => {
                                                const isSelected = result.topic.id === editingTopicId && result.subtopic.slug === editingSubtopicSlug;
                                                return (
                                                    <button
                                                        key={`edit-topic-${result.topic.id}-${result.subtopic.slug}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingTopicId(result.topic.id);
                                                            setEditingSubtopicSlug(result.subtopic.slug);
                                                            setEditingTopicQuery("");
                                                            setEditingTopicDropdownOpen(false);
                                                        }}
                                                        className={`flex w-full flex-col border-b border-black/10 px-3 py-2 text-left font-nunito last:border-b-0 ${isSelected
                                                            ? "bg-black text-white"
                                                            : "bg-white text-black hover:bg-[#f8f3e7]"
                                                            }`}
                                                    >
                                                        <span className="text-xs uppercase tracking-[0.16em] opacity-70">{result.topicLabel}</span>
                                                        <span className="text-sm font-semibold">{result.subtopicLabel}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="editing-question-title" className="mb-2 block font-nunito text-sm uppercase tracking-[0.22em] text-grey">
                                    Title
                                </label>
                                <input
                                    id="editing-question-title"
                                    value={editingQuestionTitle}
                                    onChange={(event) => setEditingQuestionTitle(event.target.value)}
                                    className="h-11 w-full rounded-lg border border-black/20 bg-white px-3 font-nunito text-sm text-black outline-none transition-shadow duration-200 focus:shadow-[0_0_0_3px_var(--accent)]"
                                />
                            </div>

                            <div>
                                <p className="mb-2 font-nunito text-sm uppercase tracking-[0.22em] text-grey">Level</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingQuestionLevelMode("random")}
                                        className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${editingQuestionLevelMode === "random"
                                            ? "border-black bg-black text-white"
                                            : "border-black/20 bg-white text-black hover:border-black"
                                            }`}
                                    >
                                        Random
                                    </button>
                                    {editingQuestionAvailableDifficulties.map((difficulty) => (
                                        <button
                                            key={`edit-difficulty-${difficulty}`}
                                            type="button"
                                            onClick={() => {
                                                setEditingQuestionLevelMode("fixed");
                                                setEditingQuestionLevel(difficulty);
                                            }}
                                            className={`rounded-lg border px-3 py-2 font-nunito text-sm transition duration-200 ${editingQuestionLevelMode === "fixed" && editingQuestionLevel === difficulty
                                                ? "border-black bg-black text-white"
                                                : "border-black/20 bg-white text-black hover:border-black"
                                                }`}
                                        >
                                            Level {difficulty}
                                        </button>
                                    ))}
                                </div>
                                {editingQuestionLevelMode === "random" && (
                                    <p className="mt-2 font-nunito text-xs text-grey">
                                        Save or regenerate will reroll from the available levels.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-black/10 bg-white px-5 py-4">
                            <button
                                type="button"
                                onClick={closeEditQuestionModal}
                                disabled={isSavingQuestionEdit}
                                className="rounded-lg border border-black/20 bg-white px-4 py-2 font-nunito text-sm text-black transition duration-200 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveEditedQuestion}
                                disabled={isSavingQuestionEdit}
                                className="rounded-lg border border-black bg-black px-4 py-2 font-nunito text-sm text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSavingQuestionEdit ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
