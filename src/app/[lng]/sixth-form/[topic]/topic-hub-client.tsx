// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionTopicHub } from "@/components/questions/questionTopicScreens";
import { sixthFormTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function SixthFormTopicHubClient({ lng, topic }: { lng: Locale; topic: string }) {
    if (!getTopicOrNull("sixthForm", topic)) {
        notFound();
    }
    return <QuestionTopicHub lng={lng} level="sixthForm" topicId={topic} iconByTopicId={sixthFormTopicIconMap} />;
}
