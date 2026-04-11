// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionTopicHub } from "@/components/questions/questionTopicScreens";
import { primaryTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function PrimaryTopicHubClient({ lng, topic }: { lng: Locale; topic: string }) {
    if (!getTopicOrNull("primary", topic)) {
        notFound();
    }
    return <QuestionTopicHub lng={lng} level="primary" topicId={topic} iconByTopicId={primaryTopicIconMap} />;
}
