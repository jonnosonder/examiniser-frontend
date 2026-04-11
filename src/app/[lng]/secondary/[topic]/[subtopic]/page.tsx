// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generateSecondarySubtopicStaticParams } from "@/lib/questionTopicStaticParams";
import SecondarySubtopicLeafClient from "../subtopic-leaf-client";

export function generateStaticParams() {
    return generateSecondarySubtopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string; subtopic: string }> }) {
    const { lng, topic, subtopic } = await params;
    return <SecondarySubtopicLeafClient lng={lng as Locale} topic={topic} subtopic={subtopic} />;
}
