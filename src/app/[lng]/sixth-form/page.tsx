// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { Locale } from '@/lib/locales';
import * as React from "react";
import { QuestionLevelOverview } from '@/components/questions/questionTopicScreens';
import { sixthFormTopicIconMap } from '@/components/questions/questionTopicIconMaps';

export default function SixthForm({ params }: { params: Promise<{ lng: Locale }> }) {
    const resolvedParams = React.use(params);
    const { lng } = resolvedParams;

    return (
        <QuestionLevelOverview
            lng={lng}
            level="sixthForm"
            headingKey="education.sixth-form"
            descriptionKey="education.sixth-form-description"
            iconByTopicId={sixthFormTopicIconMap}
        />
    );
}
