// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { I18nextProvider, initReactI18next } from "react-i18next";
import i18next, { i18n as I18nType } from "i18next";
import type { ReactNode } from "react";
import { LocaleResources } from "@/lib/locales";

interface I18nWithReact extends I18nType {
  _reactInitialized?: boolean;
}

interface Props {
  children: ReactNode;
  lng: string;
}

export default function I18nProvider({ children, lng }: Props) {
  const i18n = i18next as I18nWithReact;

  if (!i18n._reactInitialized) {
    i18n.use(initReactI18next).init({
      resources: LocaleResources,
      lng,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
    i18n._reactInitialized = true;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
