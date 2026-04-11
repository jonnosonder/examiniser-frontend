// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generateSixthFormSubtopicStaticParams } from "@/lib/questionTopicStaticParams";
import SixthFormSubtopicLeafClient from "../subtopic-leaf-client";

export function generateStaticParams() {
    return generateSixthFormSubtopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string; subtopic: string }> }) {
    const { lng, topic, subtopic } = await params;
    return <SixthFormSubtopicLeafClient lng={lng as Locale} topic={topic} subtopic={subtopic} />;
}
