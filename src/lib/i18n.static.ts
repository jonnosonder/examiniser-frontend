// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import i18next from "i18next";
import en from "../../public/locales/en.json";
import fr from "../../public/locales/fr.json";
import zh from "../../public/locales/zh.json";

const resources = { en: { translation: en }, fr: { translation: fr }, zh: { translation: zh } };
let initialized = false;

export function initI18n(lng: "en" | "fr" | "zh") {
  if (!initialized) {
    i18next.init({
      resources,
      lng,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
    initialized = true;
  }
  return i18next;
}
