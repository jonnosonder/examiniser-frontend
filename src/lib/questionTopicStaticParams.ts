// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { LocaleValues } from "@/lib/locales";
import { QUESTION_CATALOG, type QuestionLevel } from "@/lib/questionTopicCatalog";

/** { lng, topic } for one education level */
export function generateLevelTopicStaticParams(level: QuestionLevel): { lng: string; topic: string }[] {
    const topics = QUESTION_CATALOG[level].map((t) => t.id);
    return LocaleValues.flatMap((lng) => topics.map((topic) => ({ lng, topic })));
}

/** { lng, topic, subtopic } for one education level */
export function generateLevelSubtopicStaticParams(level: QuestionLevel): {
    lng: string;
    topic: string;
    subtopic: string;
}[] {
    return LocaleValues.flatMap((lng) =>
        QUESTION_CATALOG[level].flatMap((topic) =>
            topic.subtopics.map((sub) => ({
                lng,
                topic: topic.id,
                subtopic: sub.slug,
            }))
        )
    );
}

export function generatePrimaryTopicStaticParams() {
    return generateLevelTopicStaticParams("primary");
}

export function generatePrimarySubtopicStaticParams() {
    return generateLevelSubtopicStaticParams("primary");
}

export function generateSecondaryTopicStaticParams() {
    return generateLevelTopicStaticParams("secondary");
}

export function generateSecondarySubtopicStaticParams() {
    return generateLevelSubtopicStaticParams("secondary");
}

export function generateSixthFormTopicStaticParams() {
    const params = generateLevelTopicStaticParams("sixthForm");
    if (params.length > 0) {
        return params;
    }
    return LocaleValues.map((lng) => ({ lng, topic: "coming-soon" }));
}

export function generateSixthFormSubtopicStaticParams() {
    const params = generateLevelSubtopicStaticParams("sixthForm");
    if (params.length > 0) {
        return params;
    }
    return LocaleValues.map((lng) => ({ lng, topic: "coming-soon", subtopic: "coming-soon" }));
}
