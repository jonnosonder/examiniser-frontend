// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { Locale } from "@/lib/locales";
import { generateSecondaryTopicStaticParams } from "@/lib/questionTopicStaticParams";
import SecondaryTopicHubClient from "./topic-hub-client";

export function generateStaticParams() {
    return generateSecondaryTopicStaticParams();
}

export default async function Page({ params }: { params: Promise<{ lng: string; topic: string }> }) {
    const { lng, topic } = await params;
    return <SecondaryTopicHubClient lng={lng as Locale} topic={topic} />;
}
