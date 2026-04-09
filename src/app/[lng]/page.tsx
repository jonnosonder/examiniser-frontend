// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useTranslation } from 'react-i18next';
import '@/styles/landing.css';
import Navbar from '@/components/landing/navbar';
import * as React from "react";
import { Locale } from '@/lib/locales';
import { useState } from 'react';

type ButtonId = "primary" | "secondary" | "sixthForm" | null;

export default function Home({ params }: { params: Promise<{ lng: Locale }> }) {
  const { t } = useTranslation();
  const resolvedParams = React.use(params);
  const { lng } = resolvedParams;

  const [activeButton, setActiveButton] = useState<ButtonId>(null);
  const [textVisible, setTextVisible] = useState<Record<string, boolean>>({
    primary: true, secondary: true, sixthForm: true,
  });
  const [gridVisible, setGridVisible] = useState<Record<string, boolean>>({
    primary: false, secondary: false, sixthForm: false,
  });
  const [buttonsReady, setButtonsReady] = useState(false);

  const heroTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateTitleRef = React.useRef<HTMLHeadingElement | null>(null);
  const templateDescriptionRef = React.useRef<HTMLParagraphElement | null>(null);

  // Fade in hero text, then trigger buttons after
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
      setTimeout(() => setButtonsReady(true), 100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for template section (kept from original)
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

  const handleClose = (id: ButtonId) => {
    setGridVisible(prev => ({ ...prev, [id!]: false }));
    setTimeout(() => {
      setActiveButton(null);
      setTimeout(() => setTextVisible(prev => ({ ...prev, [id!]: true })), 200);
    }, 150);
  };

  const buttons: { id: ButtonId; label: string; items: string[]; delay: string }[] = [
    { id: "primary",   label: "Primary School", items: ["Year 1", "Year 2", "Year 3", "Year 4"],       delay: "0ms" },
    { id: "secondary", label: "Secondary",       items: ["Year 7", "Year 8", "Year 9", "Year 10"],     delay: "120ms" },
    { id: "sixthForm", label: "Sixth Form",      items: ["Year 12", "Year 13", "AS Level", "A Level"], delay: "240ms" },
  ];

  return (
    <>
      <Navbar lng={lng} pageOn='/'/>
      <div className="h-[100dvh] w-full bg-background overflow-hidden flex flex-col">
        
        {/* Grid background */}
        <div className="
          absolute inset-0 z-0 
          [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] 
          [background-size:20px_20px] 
          [mask-image:radial-gradient(ellipse_70%_60%_at_50%_110%,#000_60%,transparent_100%)] 
          [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,#000_60%,transparent_100%)]"
        ></div>

        {/* Content */}
        <div className="relative z-[2] flex flex-col flex-1 items-center justify-center pt-16 overflow-hidden">
          
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

          {/* Buttons */}
          <div className='flex space-x-8'>
            {buttons.map(({ id, label, items, delay }) => (
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
                    width: activeButton === id ? "24rem" : "12rem",
                    height: activeButton === id ? "24rem" : "12rem",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  {/* Main Button */}
                  <button
                    onClick={() => handleOpen(id)}
                    className={`absolute inset-0 w-full h-full bg-white flex items-center justify-center
                      text-lg font-medium text-black border-2 border-primary cursor-pointer rounded-[1rem]
                      transition-all duration-200 hover:shadow-[0_0_0_0.6rem_rgba(245,124,34,1)]
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
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleClose(id)}
                        className="flex items-center justify-center text-sm font-medium
                          text-black bg-white border border-gray-200 rounded-lg cursor-pointer
                          transition-shadow duration-200 hover:shadow-[0_0_0_3px_rgba(249,115,22,0.4)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}