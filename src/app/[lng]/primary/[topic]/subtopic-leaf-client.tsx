// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getSubtopicOrNull, getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionSubtopicLeaf } from "@/components/questions/questionTopicScreens";
import { primaryTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function PrimarySubtopicLeafClient({
    lng,
    topic,
    subtopic,
}: {
    lng: Locale;
    topic: string;
    subtopic: string;
}) {
    const main = getTopicOrNull("primary", topic);
    const sub = main ? getSubtopicOrNull(main, subtopic) : null;
    if (!main || !sub) {
        notFound();
    }
    return (
        <QuestionSubtopicLeaf lng={lng} level="primary" topicId={topic} subtopicSlug={subtopic} iconByTopicId={primaryTopicIconMap} />
    );
}
