// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generateSixthFormTopicStaticParams } from "@/lib/questionTopicStaticParams";
import SixthFormTopicHubClient from "./topic-hub-client";

export function generateStaticParams() {
    return generateSixthFormTopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string }> }) {
    const { lng, topic } = await params;
    return <SixthFormTopicHubClient lng={lng as Locale} topic={topic} />;
}
