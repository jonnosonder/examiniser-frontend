// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { QuestionLevel } from "@/lib/questionTopicCatalog";
import type { QuestionGeneratorWithLevels } from "./questionGeneratorCommon";
import { defaultGenerator } from "./questionGeneratorCommon";
import { primaryGenerators } from "./primaryGenerators";
import { secondaryGenerators } from "./secondaryGenerators";
import { sixthFormGenerators } from "./sixthFormGenerators";

const QUESTION_GENERATORS: Record<QuestionLevel, Record<string, QuestionGeneratorWithLevels>> = {
  primary: primaryGenerators,
  secondary: secondaryGenerators,
  sixthForm: sixthFormGenerators,
};

export function getQuestionGenerator(level: QuestionLevel, subtopicSlug: string): QuestionGeneratorWithLevels {
  return QUESTION_GENERATORS[level][subtopicSlug] ?? defaultGenerator;
}

export function getQuestionGeneratorLevels(level: QuestionLevel, subtopicSlug: string): number[] {
  return QUESTION_GENERATORS[level][subtopicSlug]?.availableDifficulties ?? [];
}
