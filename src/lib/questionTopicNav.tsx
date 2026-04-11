// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import * as React from "react";
import type { TFunction } from "i18next";
import { QUESTION_CATALOG, levelRoutePrefix, type QuestionLevel } from "@/lib/questionTopicCatalog";

export type QuestionNavButton = {
    label: string;
    description: string;
    icon: React.ReactNode;
    delay: string;
    link: string;
    topics: string[];
    topicLinks: string[];
};

export function buildQuestionNavButtons(
    lng: string,
    level: QuestionLevel,
    t: TFunction,
    iconByTopicId: Record<string, React.ReactNode>
): QuestionNavButton[] {
    const prefix = levelRoutePrefix(level);
    return QUESTION_CATALOG[level].map((topic, index) => ({
        label: t(topic.titleKey),
        description: t(topic.descriptionKey),
        icon: iconByTopicId[topic.id] ?? null,
        delay: `${index * 120}ms`,
        link: `/${lng}/${prefix}/${topic.id}`,
        topics: topic.subtopics.map((s) => t(s.titleKey)),
        topicLinks: topic.subtopics.map((s) => `/${lng}/${prefix}/${topic.id}/${s.slug}`),
    }));
}
