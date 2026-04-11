// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generatePrimarySubtopicStaticParams } from "@/lib/questionTopicStaticParams";
import PrimarySubtopicLeafClient from "../subtopic-leaf-client";

export function generateStaticParams() {
    return generatePrimarySubtopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string; subtopic: string }> }) {
    const { lng, topic, subtopic } = await params;
    return <PrimarySubtopicLeafClient lng={lng as Locale} topic={topic} subtopic={subtopic} />;
}
