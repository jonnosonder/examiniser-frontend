// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { Locale } from '@/lib/locales';
import * as React from "react";
import { QuestionLevelOverview } from '@/components/questions/questionTopicScreens';
import { secondaryTopicIconMap } from '@/components/questions/questionTopicIconMaps';

export default function Secondary({ params }: { params: Promise<{ lng: Locale }> }) {
    const resolvedParams = React.use(params);
    const { lng } = resolvedParams;

    return (
        <QuestionLevelOverview
            lng={lng}
            level="secondary"
            headingKey="education.secondary-school"
            descriptionKey="education.secondary-school-description"
            iconByTopicId={secondaryTopicIconMap}
        />
    );
}
