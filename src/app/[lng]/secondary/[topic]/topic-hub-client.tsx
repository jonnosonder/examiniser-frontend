// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { notFound } from "next/navigation";
import { Locale } from "@/lib/locales";
import { getTopicOrNull } from "@/lib/questionTopicCatalog";
import { QuestionTopicHub } from "@/components/questions/questionTopicScreens";
import { secondaryTopicIconMap } from "@/components/questions/questionTopicIconMaps";

export default function SecondaryTopicHubClient({ lng, topic }: { lng: Locale; topic: string }) {
    if (!getTopicOrNull("secondary", topic)) {
        notFound();
    }
    return <QuestionTopicHub lng={lng} level="secondary" topicId={topic} iconByTopicId={secondaryTopicIconMap} />;
}
