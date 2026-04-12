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

  const heroTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateDescriptionRef = React.useRef<HTMLParagraphElement | null>(null);

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
        "primary-topics.problem-solving-reasoning",
        "primary-topics.algebra",
        "general.see-all",
      ],
      links: [
        "/primary/numbers",
        "/primary/fractions-decimals-percentages",
        "/primary/measurements",
        "/primary/geometry",
        "/primary/data-handling",
        "/primary/problem-solving-reasoning",
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
        "secondary-topics.reasoning-problem-solving",
        "general.see-all",
      ],
      links: [
        "/secondary/number",
        "/secondary/algebra",
        "/secondary/geometry",
        "/secondary/trigonometry",
        "/secondary/measurement",
        "/secondary/statistics",
        "/secondary/reasoning-problem-solving",
        "/secondary",
      ],
      delay: "120ms" 
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
    { 
      id: "exam_paper", 
      label: t("education.exam-papers"),       
      items: ["AQA", "Edexcel", "OCR", "Baccalauréat", "Selectividad", "大学入学共通テスト", "高考", "general.see-all"],  
      links: ["/exam-board/aqa", "/exam-board/edexcel", "/exam-board/ocr", "/exam-board/baccalaureat", "/exam-board/selectividad", "/exam-board/japanese-university-entrance-exam", "/exam-board/chinese-gaokao", "/exam-board"],
      delay: "360ms" 
    }
  ];

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

      <div className="w-full bg-background">

      <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col">

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
          <div className='flex space-x-8' onClick={(e) => e.stopPropagation()}>
            {buttons.map(({ id, label, items, links, delay }) => (
              <div
                key={id}
                className="flex items-center justify-center"
                style={{
                  opacity: buttonsReady ? 1 : 0,
                  transform: buttonsReady ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`,
                }}
              >
                <div
                  className="relative overflow-visible transition-all duration-300 ease-in-out"
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
                        className="flex items-center justify-center text-sm font-medium
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
      
      {/* "But how?" section */}
      {/* 
      <section className="relative h-[100dvh] w-full bg-background">
        <div
          className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
          aria-hidden
        />
        <div className="relative z-[1] h-full w-full px-8 sm:px-12 lg:px-16 pt-12 sm:pt-16" onClick={handleClose}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-inter font-semibold text-primary text-left">
            {t("home.but-how-1")}{" "}
            <span className="text-[var(--contrast)]">{t("home.but-how-2")}</span>
          </h2>
          <p className='ml-10 mt-2 text-xl '>{t("home.but-how-description")}</p>
          <div className='flex flex-col items-center justify-center'>
              <p className='text-4xl font-bold text-primary mt-8'>Try it now!</p>
              <div className='flex w-3/4 h-72 bg-white rounded-[2rem]'>
              
              </div>
          </div>
        </div>
      </section>
      */}
      </div>
    </>
  );
}