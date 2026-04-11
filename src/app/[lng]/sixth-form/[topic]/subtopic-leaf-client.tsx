// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getSubtopicOrNull, getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionSubtopicLeaf } from "@/components/questions/questionTopicScreens";
import { sixthFormTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function SixthFormSubtopicLeafClient({
    lng,
    topic,
    subtopic,
}: {
    lng: Locale;
    topic: string;
    subtopic: string;
}) {
    const main = getTopicOrNull("sixthForm", topic);
    const sub = main ? getSubtopicOrNull(main, subtopic) : null;
    if (!main || !sub) {
        notFound();
    }
    return (
        <QuestionSubtopicLeaf lng={lng} level="sixthForm" topicId={topic} subtopicSlug={subtopic} iconByTopicId={sixthFormTopicIconMap} />
    );
}
