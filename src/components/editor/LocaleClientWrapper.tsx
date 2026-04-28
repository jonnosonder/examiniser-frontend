// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useEffect, useState } from "react";
import I18nProvider from "./I18nProvider";

interface Props {
  children: React.ReactNode;
  lng?: string; // optional, will detect if not passed
}

export default function LocaleClientWrapper({ children, lng }: Props) {
  const [locale, setLocale] = useState<string>(lng || "en");

  useEffect(() => {
    if (!lng) {
      const browserLang = navigator.language.slice(0, 2);
      const supported: Record<string, "en" | "es" | "fr" | "jp" | "zh"> = {
        en: "en",
        es: "es",
        fr: "fr",
        jp: "jp",
        zh: "zh",
      };
      setLocale(supported[browserLang] || "en");
      return;
    }

    if (locale !== lng) {
      setLocale(lng);
    }
  }, [lng]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nProvider lng={locale}>{children}</I18nProvider>;
}
