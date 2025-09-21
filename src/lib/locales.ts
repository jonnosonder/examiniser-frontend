// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import en from "../../public/locales/en.json";
import es from "../../public/locales/es.json";
import fr from "../../public/locales/fr.json";
import zh from "../../public/locales/zh.json";

export type Locale = "en" | "es" |"fr" | "zh";
export const LocaleValues = ["en", "es", "fr", "zh"];
export const LocaleValuesDict = { en: "en", es: "es", fr: "fr", zh: "zh" };
export const LocaleResources = { en: { translation: en }, es: { translation: es }, fr: { translation: fr }, zh: { translation: zh } };