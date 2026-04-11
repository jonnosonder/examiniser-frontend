// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generatePrimaryTopicStaticParams } from "@/lib/questionTopicStaticParams";
import PrimaryTopicHubClient from "./topic-hub-client";

export function generateStaticParams() {
    return generatePrimaryTopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string }> }) {
    const { lng, topic } = await params;
    return <PrimaryTopicHubClient lng={lng as Locale} topic={topic} />;
}
