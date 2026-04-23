// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from 'react-i18next';
import '@/styles/landing.css';
import Navbar from '@/components/landing/navbar';
import * as React from "react";
import { Locale } from '@/lib/locales';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import "katex/dist/katex.min.css";
import type { QuestionLevel } from '@/lib/questionTopicCatalog';
import type { QuestionGeneratorWithLevels, QuestionResult } from '@/lib/questionGeneratorCommon';
import { QUESTION_CATALOG, levelRoutePrefix } from '@/lib/questionTopicCatalog';
import { generateQuestionWithTimeout } from '@/lib/questionGenerators';
import { primaryGenerators } from '@/lib/primaryGenerators';
import { secondaryGenerators } from '@/lib/secondaryGenerators';
import { sixthFormGenerators } from '@/lib/sixthFormGenerators';
import { WrappedMath } from '@/components/questions/wrapLatex';

type ButtonId = "primary" | "secondary" | "sixthForm" | "exam_paper" | null;

export default function Home({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const resolvedParams = React.use(params);
  const { lng } = resolvedParams;

  const router = useRouter();

  const [activeButton, setActiveButton] = useState<ButtonId>(null);
  const [textVisible, setTextVisible] = useState<Record<string, boolean>>({
    primary: true, secondary: true, sixthForm: true, exam_paper: true,
  });
  const [gridVisible, setGridVisible] = useState<Record<string, boolean>>({
    primary: false, secondary: false, sixthForm: false, exam_paper: false,
  });
  const [buttonsReady, setButtonsReady] = useState(false);
  const [infinityVisible, setInfinityVisible] = useState(false);

  const [maxLineWidth, setMaxLineWidth] = React.useState<number>(90);
  const questionDivRef = React.useRef<HTMLDivElement>(null);

  type GeneratorLevel = "primary" | "secondary" | "sixthForm";
  const generatorCollections = {
    primary: primaryGenerators,
    secondary: secondaryGenerators,
    sixthForm: sixthFormGenerators,
  } as const;

  const generatorLabelKeys: Record<GeneratorLevel, string> = {
    primary: 'education.primary-school',
    secondary: 'education.secondary-school',
    sixthForm: 'education.sixth-form',
  };

  const [activeGeneratorLevel, setActiveGeneratorLevel] = useState<GeneratorLevel>("primary");
  const [questionPreview, setQuestionPreview] = useState<QuestionResult | null>(null);
  const [previewPath, setPreviewPath] = useState<{
    level: GeneratorLevel;
    topicId: string;
    subtopicSlug: string;
    topicTitleKey: string;
    subtopicTitleKey: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gridBoxesVisible, setGridBoxesVisible] = React.useState(false);
  const [gridLayout, setGridLayout] = React.useState({ columns: 1, cellSize: 40, gap: 8 });

  const heroTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateDescriptionRef = React.useRef<HTMLParagraphElement | null>(null);
  const gridSectionRef = React.useRef<HTMLDivElement>(null);

  const allSubtopics = React.useMemo(() => {
    const levels: QuestionLevel[] = ["primary", "secondary", "sixthForm"];
    return levels.flatMap((level) =>
      QUESTION_CATALOG[level].flatMap((topic) =>
        topic.subtopics.map((sub) => ({ level, topicId: topic.id, slug: sub.slug }))
      )
    );
  }, []);

  const generatorLevelBoxes = React.useMemo(() => {
    const boxes: Array<{ schoolLevel: GeneratorLevel; subtopicSlug: string; difficulty: number }> = [];
    const levelGeneratorEntries: Array<[GeneratorLevel, Record<string, QuestionGeneratorWithLevels>]> = [
      ["primary", primaryGenerators],
      ["secondary", secondaryGenerators],
      ["sixthForm", sixthFormGenerators],
    ];

    levelGeneratorEntries.forEach(([schoolLevel, generators]) => {
      Object.entries(generators).forEach(([subtopicSlug, generator]) => {
        const difficulties = generator.availableDifficulties?.length ? generator.availableDifficulties : [1];
        difficulties.forEach((difficulty) => {
          boxes.push({ schoolLevel, subtopicSlug, difficulty });
        });
      });
    });

    return boxes;
  }, []);

  const levelBoxCountsBySchool = React.useMemo(
    () => ({
      primary: generatorLevelBoxes.filter((box) => box.schoolLevel === "primary").length,
      secondary: generatorLevelBoxes.filter((box) => box.schoolLevel === "secondary").length,
      sixthForm: generatorLevelBoxes.filter((box) => box.schoolLevel === "sixthForm").length,
    }),
    [generatorLevelBoxes]
  );

  React.useEffect(() => {
    const gridEl = gridSectionRef.current;
    if (!gridEl) return;

    const totalBoxes = Math.max(1, generatorLevelBoxes.length);
    const gapPx = 8;

    const updateGridLayout = () => {
      const availableWidth = gridEl.clientWidth;
      const availableHeight = gridEl.clientHeight;

      if (!availableWidth || !availableHeight) {
        return;
      }

      let bestColumns = 1;
      let bestCellSize = 12;

      for (let columns = 1; columns <= totalBoxes; columns += 1) {
        const rows = Math.ceil(totalBoxes / columns);
        const maxCellWidth = (availableWidth - gapPx * (columns - 1)) / columns;
        const maxCellHeight = (availableHeight - gapPx * (rows - 1)) / rows;
        const cellSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));

        if (cellSize > bestCellSize) {
          bestCellSize = cellSize;
          bestColumns = columns;
        }
      }

      setGridLayout({
        columns: bestColumns,
        cellSize: Math.max(10, bestCellSize),
        gap: gapPx,
      });
    };

    updateGridLayout();
    const resizeObserver = new ResizeObserver(updateGridLayout);
    resizeObserver.observe(gridEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [generatorLevelBoxes.length]);

  React.useEffect(() => {
    const titleEl = heroTitleRef.current;
    if (!titleEl) return;

    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(12px)';
    titleEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    const pEl = document.getElementById('heroP');
    if (pEl) {
      pEl.style.opacity = '0';
      pEl.style.transform = 'translateY(12px)';
      pEl.style.transition = 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s';
    }

    const timer = setTimeout(() => {
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
      if (pEl) {
        pEl.style.opacity = '1';
        pEl.style.transform = 'translateY(0)';
      }
      // Trigger buttons after text has faded in
      setTimeout(() => {
        setButtonsReady(true);
        // Infinity symbol fades in shortly after buttons appear
        setTimeout(() => setInfinityVisible(true), 300);
      }, 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add("animate-fadeInFromLeft");
            target.classList.remove("opacity-0");
            if (templateDescriptionRef.current) {
              setTimeout(() => {
                templateDescriptionRef.current?.classList.add("animate-fadeInFromLeft");
                templateDescriptionRef.current?.classList.remove("opacity-0");
              }, 100);
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.8 }
    );
    if (templateTitleRef.current) observer.observe(templateTitleRef.current);
    return () => {
      if (templateTitleRef.current) observer.unobserve(templateTitleRef.current);
    };
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setGridBoxesVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (gridSectionRef.current) observer.observe(gridSectionRef.current);
    return () => {
      if (gridSectionRef.current) observer.unobserve(gridSectionRef.current);
    };
  }, []);

  const handleOpen = (id: ButtonId) => {
    if (activeButton && activeButton !== id) {
      setGridVisible(prev => ({ ...prev, [activeButton]: false }));
      setActiveButton(null);
      setTimeout(() => setTextVisible(prev => ({ ...prev, [activeButton!]: true })), 200);
    }
    setTextVisible(prev => ({ ...prev, [id!]: false }));
    setTimeout(() => {
      setActiveButton(id);
      setTimeout(() => setGridVisible(prev => ({ ...prev, [id!]: true })), 250);
    }, 150);
  };

  const handleClose = () => {
    setGridVisible({
      primary: false,
      secondary: false,
      sixthForm: false,
      exam_paper: false,
    });

    setTimeout(() => {
      setActiveButton(null);

      setTimeout(() => {
        setTextVisible({
          primary: true,
          secondary: true,
          sixthForm: true,
          exam_paper: true,
        });
      }, 200);
    }, 150);

  };

  const getRandomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

  const handleGenerateRandomQuestion = async () => {
    setIsGenerating(true);
    const generators = generatorCollections[activeGeneratorLevel];
    const generatorKeys = Object.keys(generators);

    if (generatorKeys.length === 0) {
      setQuestionPreview({
        latex: "\\text{No available generators found}",
        answer: "",
        options: [],
        forceOption: 0,
        explanation: "No generators available",
      });
      setIsGenerating(false);
      return;
    }

    const subtopicSlug = getRandomItem(generatorKeys);
    const availableDifficulties = generators[subtopicSlug]?.availableDifficulties ?? [1];
    const difficulty = getRandomItem(availableDifficulties);

    const topicDef = QUESTION_CATALOG[activeGeneratorLevel].find((topic) =>
      topic.subtopics.some((subtopic) => subtopic.slug === subtopicSlug)
    );

    if (topicDef) {
      const subtopicDef = topicDef.subtopics.find((subtopic) => subtopic.slug === subtopicSlug)!;
      setPreviewPath({
        level: activeGeneratorLevel,
        topicId: topicDef.id,
        subtopicSlug,
        topicTitleKey: topicDef.titleKey,
        subtopicTitleKey: subtopicDef.titleKey,
      });
    } else {
      setPreviewPath(null);
    }

    const result = await generateQuestionWithTimeout({
      level: activeGeneratorLevel as QuestionLevel,
      topicId: subtopicSlug,
      subtopicSlug,
      difficulty,
    });

    setQuestionPreview(result);
    setIsGenerating(false);
  };

  const buttons: { id: ButtonId; label: string; items: string[]; links: string[]; delay: string }[] = [
    { 
      id: "primary",
      label: t("education.primary-school"),
      items: [
        "primary-topics.numbers",
        "primary-topics.fractions-decimals-percentages",
        "primary-topics.measurements",
        "primary-topics.geometry",
        "primary-topics.data-handling",
        "primary-topics.algebra",
        "general.see-all",
      ],
      links: [
        "/primary/numbers",
        "/primary/fractions-decimals-percentages",
        "/primary/measurements",
        "/primary/geometry",
        "/primary/data-handling",
        "/primary/algebra",
        "/primary",
      ],
      delay: "0ms"
    },
    { 
      id: "secondary",
      label: t("education.secondary-school"), 
      items: [
        "secondary-topics.number",
        "secondary-topics.algebra",
        "secondary-topics.geometry",
        "secondary-topics.trigonometry",
        "secondary-topics.measurement",
        "secondary-topics.statistics",
        "primary-topics.problem-solving-reasoning",
        "general.see-all",
      ],
      links: [
        "/secondary/number",
        "/secondary/algebra",
        "/secondary/geometry",
        "/secondary/trigonometry",
        "/secondary/measurement",
        "/secondary/statistics",
        "/secondary/problem-solving-reasoning",
        "/secondary",
      ],
      delay: "120ms" 
    },
    { 
      id: "exam_paper", 
      label: t("education.exam-papers"),       
      items: ["AQA", "Edexcel", "general.see-all"],  // "OCR", "Baccalauréat", "Selectividad", "大学入学共通テスト", "高考", 
      links: [
        "/exam-papers?source=aqa",
        "/exam-papers?source=edexcel",
        "/exam-papers",
        
        //"/exam-papers?source=ocr",
        //"/exam-papers?source=baccalaureat",
        //"/exam-papers?source=selectividad",
        //"/exam-papers?source=japanese-university-entrance-exam",
        //"/exam-papers?source=chinese-gaokao",
      ],
      delay: "360ms" 
    },
    { 
      id: "sixthForm", 
      label: t("education.sixth-form"),       
      items: [
        "sixth-form-topics.algebra",
        "sixth-form-topics.functions",
        "sixth-form-topics.calculus",
        "sixth-form-topics.trigonometry",
        "sixth-form-topics.vectors",
        "sixth-form-topics.statistics",
        "sixth-form-topics.mechanics",
        "sixth-form-topics.discrete",
        "general.see-all",
      ],
      links: [
        "/sixth-form/algebra",
        "/sixth-form/functions",
        "/sixth-form/calculus",
        "/sixth-form/trigonometry",
        "/sixth-form/vectors",
        "/sixth-form/statistics",
        "/sixth-form/mechanics",
        "/sixth-form/discrete",
        "/sixth-form",
      ],
      delay: "240ms" 
    },
  ];

  React.useEffect(() => {
    const updateMaxLineWidth = () => {
      if (questionDivRef.current) {
        const rect = questionDivRef.current.getBoundingClientRect();
        const innerWidth = rect.width - 52; // Subtract padding
        const charWidth = 14; // Approximate character width in pixels
        setMaxLineWidth(Math.max(20, Math.floor(innerWidth / charWidth)));
      }
    };

    updateMaxLineWidth();
    window.addEventListener('resize', updateMaxLineWidth);
    return () => window.removeEventListener('resize', updateMaxLineWidth);
  }, []);

  return (
    <>
      <style>{`
        #infinity-outline {
          stroke-dasharray: 2.42777px, 242.77666px;
          stroke-dashoffset: 0;
          animation: infinityAnim 3s linear infinite;
        }
        @keyframes infinityAnim {
          12.5% {
            stroke-dasharray: 33.98873px, 242.77666px;
            stroke-dashoffset: -26.70543px;
          }
          43.75% {
            stroke-dasharray: 84.97183px, 242.77666px;
            stroke-dashoffset: -84.97183px;
          }
          100% {
            stroke-dasharray: 2.42777px, 242.77666px;
            stroke-dashoffset: -240.34889px;
          }
        }
      `}</style>

      <div onClick={handleClose}>
        <Navbar lng={lng} pageOn='/'/>
      </div>

      <div className="w-full bg-background h-screen overflow-y-auto snap-y snap-mandatory">

      <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col snap-start">

        {/* Grid background */}
        <div className="
          absolute inset-0 z-0 
          [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] 
          [background-size:20px_20px] 
          [mask-image:radial-gradient(ellipse_70%_60%_at_50%_110%,#000_60%,transparent_100%)] 
          [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,#000_60%,transparent_100%)]"
        ></div>

        {/* Content */}
        <div className="z-[2] flex flex-col flex-1 items-center justify-center pt-16 overflow-hidden" onClick={handleClose}>

          <div className='relative'>
            {/* Infinity loop — from Uiverse.io by SouravBandyopadhyay */}
            <div
              className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                opacity: infinityVisible ? 0.1 : 0,
                transition: 'opacity 0.8s ease',
              }}
            >
              <svg
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 187.3 93.7"
                style={{ width: '120vw', height: 'auto' }}
              >
                <path
                  d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="4"
                  fill="none"
                  id="infinity-outline"
                  stroke="var(--accent)"
                />
                <path
                  d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="4"
                  stroke="var(--accent)"
                  fill="none"
                  opacity="0.1"
                />
              </svg>
            </div>

            {/* Hero text */}
            <div className='p-8 text-center mb-12'>
              {(lng === "en" || lng === "jp" || lng === "zh") && (
                <h1 ref={heroTitleRef} id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
                  <span id="heroKeywordtextSpan">{t('home.infinite')}</span>
                  {t('home.IMQ')}
                </h1>
              )}
              {lng === "es" && (
                <h1 ref={heroTitleRef} id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
                  {t('home.problems')}
                  <span id="heroKeywordtextSpan">{t('home.infinite')}</span>
                  {t('home.IMQ')}
                </h1>
              )}
              {lng === "fr" && (
                <h1 ref={heroTitleRef} id="heroTitle" className="text-primary font-inter font-bold text-2xl sm:text-3xl lg:text-5xl">
                  {t('home.IMQ')}
                  <span id="heroKeywordtextSpan">{t('home.infinite')}</span>
                </h1>
              )}
              <p id="heroP" className="mt-2 text-primary sm:text-lg lg:text-xl break-words">{t('home.question-description')}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex space-x-8' onClick={handleClose}>
            {buttons.slice(0, -1).map(({ id, label, items, links, delay }) => (
              <div
                key={id}
                className="flex items-center justify-center"
                onClick={handleClose}
                style={{
                  opacity: buttonsReady ? 1 : 0,
                  transform: buttonsReady ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`,
                }}
              >
                <div
                  className="relative overflow-visible transition-all duration-300 ease-in-out"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: activeButton === id ? "24rem" : "14rem",
                    height: activeButton === id ? "24rem" : "14rem",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  {/* Main Button */}
                  <button
                    onClick={() => handleOpen(id)}
                    className={`absolute inset-0 w-full h-full bg-white flex items-center justify-center
                      text-2xl text-black border-2 border-primary cursor-pointer rounded-[1rem]
                      transition-all duration-200 hover:shadow-[0_0_0_0.6rem_var(--contrast)] font-nunito
                      ${textVisible[id!] ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                  >
                    {label}
                  </button>

                  {/* 2x2 Grid */}
                  <div
                    className={`absolute inset-0 w-full h-full grid grid-cols-2 gap-2 p-2
                      transition-opacity duration-200 border-2 border-primary rounded-[1rem]
                      ${gridVisible[id!] ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                  >
                    {items.map((item, index) => (
                      <button
                        key={item}
                        onClick={() => {
                          router.push(`/${lng}`+links[index]);
                        }}
                        className="flex items-center justify-center text-sm font-medium p-1
                          text-black bg-white border border-gray-300 rounded-lg cursor-pointer
                          transition-shadow duration-200 hover:shadow-[0_0_0_0.2rem_var(--accent)]"
                      >
                        {t(item)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      
      {/* "But How?" section */}
      <section className="relative h-[100dvh] w-full bg-background snap-start">
        <div
          className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden
        />
        <div className="relative z-[1] h-full w-full px-8 sm:px-12 lg:px-16 pt-12 sm:pt-[5rem]" onClick={handleClose}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-inter font-semibold text-primary text-left">
            {t("home.but-how-1")}{" "}
            <span className="text-[var(--contrast)]">{t("home.but-how-2")}</span>
          </h2>
          <p className='ml-10 mt-2 text-xl '>{t("home.but-how-description")}</p>
          <div className='flex flex-col items-center justify-center mt-4'>
            <div className='flex flex-col w-3/4 bg-white rounded-[2rem] p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
              <p className='text-2xl font-bold font-nunito text-primary mb-4'>{t('home.try-it-now')}</p>
                <div className='flex flex-col w-full gap-2'>
                  <div className='grid w-full grid-cols-2 gap-3'>
                    {(["primary", "secondary"] as GeneratorLevel[]).map((level) => (
                      <button
                        key={level}
                        type='button'
                        onClick={() => setActiveGeneratorLevel(level)}
                        className={`flex h-12 w-full items-center justify-center rounded-lg text-base font-semibold transition-colors duration-200 ${
                          activeGeneratorLevel === level
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t(generatorLabelKeys[level])}
                      </button>
                    ))}
                  </div>

                  <p className='text-sm uppercase tracking-[0.22em] text-slate-400 mt-2'>{t('home.random-question-preview')}</p>
                  <div className='rounded-[1.5rem] border border-slate-200 bg-slate-100 p-6 h-[20rem] flex items-start justify-center'>
                    {questionPreview ? (
                      <div className='w-full'>
                        {previewPath && (
                          <button
                            type='button'
                            onClick={() =>
                              {
                                console.log(levelRoutePrefix(previewPath.level));
                                router.push(
                                `/${lng}/${levelRoutePrefix(previewPath.level)}/${previewPath.topicId}/${previewPath.subtopicSlug}`
                              )}
                            }
                            className='block text-sm font-medium text-primary underline transition-colors hover:text-[var(--contrast)]'
                          >
                            {t(generatorLabelKeys[previewPath.level])} &gt; {t(previewPath.topicTitleKey)} &gt; {t(previewPath.subtopicTitleKey)}
                          </button>
                        )}
                        <div className='rounded-xl p-4 text-base leading-relaxed text-slate-900 mt-0 overflow-auto h-[18rem]' ref={questionDivRef}>
                          <WrappedMath
                            latex={questionPreview.latex}
                            maxLineWidth={maxLineWidth}
                          />
                          {questionPreview.svg ? (
                            <div className="flex items-center justify-center">
                              <div
                                className="mx-auto max-w-full overflow-auto"
                                dangerouslySetInnerHTML={{ __html: questionPreview.svg  }}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className='text-center text-lg text-slate-500'>
                        {t('home.random-question-hint')}
                      </p>
                    )}
                  </div>

                  <button
                    type='button'
                    onClick={handleGenerateRandomQuestion}
                    className='inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#1f4c85] disabled:cursor-not-allowed disabled:opacity-60'
                    disabled={isGenerating}
                  >
                    {isGenerating ? t('home.generating') : t('home.generate-random-question')}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Every question in one place" section */}
      <section className="relative h-[100dvh] w-full bg-background snap-start overflow-hidden">
        <div
          className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden
        />
        <div
          className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-[var(--accent)]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute bottom-[-10rem] right-[-5rem] h-80 w-80 rounded-full bg-[var(--contrast)]/15 blur-3xl"
          aria-hidden
        />

        <div className="relative z-[1] h-full w-full px-6 sm:px-10 lg:px-16 py-10 sm:py-14" onClick={handleClose}>
          <div className="mt-6 sm:mt-8 h-[calc(100%-1.5rem)] sm:h-[calc(100%-2rem)] rounded-[2rem] border-2 border-primary/20 bg-white/70 shadow-xl backdrop-blur-sm p-5 sm:p-8 lg:p-10">
            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Topic Atlas
                  </p>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-inter font-semibold text-primary text-left leading-tight">
                    {t("home.every-question-in-one-place-1")} {" "}
                    <span className="text-[var(--contrast)]">{t("home.every-question-in-one-place-2")}</span> {" "}
                    {t("home.every-question-in-one-place-3")}
                  </h2>
                  <p className="mt-4 text-base sm:text-lg text-primary/80 max-w-2xl">
                    {t("home.every-question-in-one-place-description")}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-primary/20 bg-white p-4 sm:p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-primary/60">Library status</p>
                  <p className="mt-2 text-2xl font-nunito text-primary">{levelBoxCountsBySchool.primary + levelBoxCountsBySchool.secondary + levelBoxCountsBySchool.sixthForm} total levels, {allSubtopics.length} mapped subtopics</p>
                  <p className="mt-1 text-sm text-primary/70">Each box in the question map represents one generator level that can produce questions. Counts below show the total number of generator levels available in each section.</p>
                  <div className="mt-4 flex flex-col gap-2 text-sm sm:text-base">
                    <p className="flex items-baseline text-primary/85">
                      <span className="inline-block font-medium">{t('education.primary-school')}</span>
                      <span className="mx-2 text-primary/40">-</span>
                      <span className="font-bold tabular-nums text-[#198f8f]">{levelBoxCountsBySchool.primary}</span>
                    </p>
                    <p className="flex items-baseline text-primary/85">
                      <span className="inline-block font-medium">{t('education.secondary-school')}</span>
                      <span className="mx-2 text-primary/40">-</span>
                      <span className="font-bold tabular-nums text-[var(--contrast)]">{levelBoxCountsBySchool.secondary}</span>
                    </p>
                    <p className="flex items-baseline text-primary/85">
                      <span className="inline-block font-medium">{t('education.sixth-form')}</span>
                      <span className="mx-2 text-primary/40">-</span>
                      <span className="font-bold tabular-nums text-primary">{levelBoxCountsBySchool.sixthForm}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-primary bg-white shadow-[0_10px_30px_rgba(3,46,46,0.12)] p-4 sm:p-5 overflow-hidden flex flex-col min-h-0">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.18em] text-primary/60">Question map</p>
                  <div className="inline-flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--contrast)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/30" />
                  </div>
                </div>

                <div
                  ref={gridSectionRef}
                  className="w-full flex-1 min-h-0"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridLayout.columns}, ${gridLayout.cellSize}px)`,
                    gridAutoRows: `${gridLayout.cellSize}px`,
                    gap: `${gridLayout.gap}px`,
                    alignContent: 'start',
                  }}
                >
                  {generatorLevelBoxes.map(({ schoolLevel, subtopicSlug, difficulty }, index) => {
                    const rowIndex = Math.floor(index / gridLayout.columns);
                    const rowDelayMs = rowIndex * 80;
                    const label = schoolLevel === "primary" ? "P" : schoolLevel === "secondary" ? "S" : "C";

                    return (
                      <div
                        key={`${schoolLevel}-${subtopicSlug}-${difficulty}`}
                        title={`${schoolLevel} / ${subtopicSlug} / level ${difficulty}`}
                        className={`rounded-md border text-[10px] font-semibold flex items-center justify-center ${
                          schoolLevel === "primary"
                            ? 'border-[#198f8f] bg-[#198f8f]/15 text-[#156e6e]'
                            : schoolLevel === "secondary"
                            ? 'border-[var(--contrast)] bg-[#f59e0b]/10 text-[var(--contrast)]'
                            : 'border-primary bg-primary/15 text-primary'
                        }`}
                        style={{
                          width: `${gridLayout.cellSize}px`,
                          height: `${gridLayout.cellSize}px`,
                          opacity: gridBoxesVisible ? 1 : 0,
                          transition: `opacity 0.3s ease ${rowDelayMs}ms`,
                        }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}