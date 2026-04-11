// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import type { QuestionLevel } from "@/lib/questionTopicCatalog";

export type QuestionGeneratorArgs = {
    level: QuestionLevel;
    topicId: string;
    subtopicSlug: string;
    difficulty: number;
};

export type QuestionResult = {
    latex: string;
    answer: string;
    explanation?: string;
};

export type QuestionGenerator = (args: QuestionGeneratorArgs) => QuestionResult;

const defaultGenerator: QuestionGenerator = ({ level, subtopicSlug, difficulty }) => ({
    latex: `\\text{No generator defined for ${level}/${subtopicSlug} at level ${difficulty}}`,
    answer: "",
    explanation: "Please add a generator for this level and subtopic in src/lib/questionGenerators.ts",
});

const primaryGenerators: Record<string, QuestionGenerator> = {
    "mental-strategies": ({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: "\\text{What is } 7 + 5 = ?",
                answer: "12",
            };
        }
        if (difficulty === 2) {
            return {
                latex: "\\text{Find } x \text{ if } x + 14 = 23.",
                answer: "9",
            };
        }
        return {
            latex: "\\text{Add } 18 + 27 = ?",
            answer: "45",
        };
    },
    "number-bonds": ({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: "\\text{Fill the missing number: } 8 + \_ = 10.",
                answer: "2",
            };
        }
        if (difficulty === 2) {
            return {
                latex: "\\text{Which number makes } 5 + x = 13?",
                answer: "8",
            };
        }
        return {
            latex: "\\text{Complete the bond: } 17 + \_ = 25.",
            answer: "8",
        };
    },
};

const secondaryGenerators: Record<string, QuestionGenerator> = {
    "expressions": ({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: "\\text{Simplify } 2x + 3x.",
                answer: "5x",
            };
        }
        if (difficulty === 2) {
            return {
                latex: "\\text{Simplify } 4x - 2x + 7.",
                answer: "2x + 7",
            };
        }
        return {
            latex: "\\text{Simplify } 3(x + 2) - x.",
            answer: "2x + 6",
        };
    },
};

const sixthFormGenerators: Record<string, QuestionGenerator> = {
    "differentiation-rules": ({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: "\\frac{d}{dx}(x^2)",
                answer: "2x",
            };
        }
        if (difficulty === 2) {
            return {
                latex: "\\frac{d}{dx}(3x^3 + 2x)",
                answer: "9x^2 + 2",
            };
        }
        return {
            latex: "\\frac{d}{dx}(5x^4 - x^2 + 7)",
            answer: "20x^3 - 2x",
        };
    },
};

const QUESTION_GENERATORS: Record<QuestionLevel, Record<string, QuestionGenerator>> = {
    primary: primaryGenerators,
    secondary: secondaryGenerators,
    sixthForm: sixthFormGenerators,
};

export function getQuestionGenerator(level: QuestionLevel, subtopicSlug: string): QuestionGenerator {
    return QUESTION_GENERATORS[level][subtopicSlug] ?? defaultGenerator;
}
