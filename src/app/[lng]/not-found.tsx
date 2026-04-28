// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LocaleValues } from "@/lib/locales";

const LocalizedNotFound: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ lng?: string }>();
  const { t, i18n } = useTranslation();

  const rawLocale = params?.lng;
  const locale = rawLocale && LocaleValues.includes(rawLocale) ? rawLocale : "en";
  const homePath = `/${locale}`;

  React.useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);

  return (
    <>
      <div className="absolute left-4 top-4 flex flex-col items-center justify-center border border-grey rounded-lg shadow-lg p-2 backdrop-blur-[2px]">
        <p onClick={() => router.push(homePath)} className="text-2xl font-nunito cursor-pointer">
          Examiniser
        </p>
      </div>

      <div
        className="w-screen h-screen flex items-center justify-center text-primary"
        style={
          {
            "--color": "#E1E1E1",
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent)",
            backgroundSize: "60px 60px",
          } as React.CSSProperties
        }
      >
        <div className="flex flex-col items-center justify-center backdrop-blur-[2px] border border-grey rounded-lg shadow-lg p-8 hover:shadow-[0_0_0_1rem_theme('colors.accent')] transition-all duration-300 ease-in-out">
          <h1 className="text-6xl">404</h1>
          <h2 className="text-2xl">{t("not-found.title")}</h2>
          <p onClick={() => router.push(homePath)} className="underline cursor-pointer">
            {t("not-found.back-home")}
          </p>
        </div>
      </div>
    </>
  );
};

export default LocalizedNotFound;
