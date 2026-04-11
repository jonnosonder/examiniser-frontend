// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getSubtopicOrNull, getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionSubtopicLeaf } from "@/components/questions/questionTopicScreens";
import { secondaryTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function SecondarySubtopicLeafClient({
    lng,
    topic,
    subtopic,
}: {
    lng: Locale;
    topic: string;
    subtopic: string;
}) {
    const main = getTopicOrNull("secondary", topic);
    const sub = main ? getSubtopicOrNull(main, subtopic) : null;
    if (!main || !sub) {
        notFound();
    }
    return (
        <QuestionSubtopicLeaf lng={lng} level="secondary" topicId={topic} subtopicSlug={subtopic} iconByTopicId={secondaryTopicIconMap} />
    );
}
