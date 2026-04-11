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
export type QuestionGeneratorWithLevels = QuestionGenerator & {
    availableDifficulties?: number[];
};

function createGenerator(generator: QuestionGenerator, availableDifficulties: number[]): QuestionGeneratorWithLevels {
    const fn = generator as QuestionGeneratorWithLevels;
    fn.availableDifficulties = availableDifficulties;
    return fn;
}

const defaultGenerator: QuestionGeneratorWithLevels = createGenerator(
    ({ level, subtopicSlug, difficulty }) => ({
        latex: `\\text{No generator defined for ${level}/${subtopicSlug} at level ${difficulty}}`,
        answer: "",
        explanation: "Please add a generator for this level and subtopic",
    }),
    [1]
);

const primaryGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "counting": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const randomIndex = Math.floor(Math.random() * 10);
            const isForward = Math.random() < 0.5;

            const numbers: (number | string)[] = isForward
                ? Array.from({ length: 10 }, (_, i) => i + 1)
                : Array.from({ length: 10 }, (_, i) => 10 - i);

            const answer = numbers[randomIndex];
            numbers[randomIndex] = "?";

            return {
                latex: `\\text{What is the missing number: } ${numbers.join(", ")}`,
                answer: answer.toString(),
            };
        }

        if (difficulty === 2) {
            const randomIndex = Math.floor(Math.random() * 10);
            const isForward = Math.random() < 0.5;

            const start = Math.floor(Math.random() * 91) + 10; // avoid negatives when going backwards

            const numbers = Array.from({ length: 10 }, (_, i) =>
                isForward ? start + i : start - i
            );

            const answer = numbers[randomIndex];

            const display = numbers.map((num, index) =>
                index === randomIndex ? "?" : num
            );

            return {
                latex: `\\text{What is the missing number: } ${display.join(", ")}`,
                answer: answer.toString(),
            };
        }

        const randomIndex = Math.floor(Math.random() * 10);
        const isForward = Math.random() < 0.5;

        const start = Math.floor(Math.random() * 991) + 10; // avoid negatives

        const numbers = Array.from({ length: 10 }, (_, i) =>
            isForward ? start + i : start - i
        );

        const answer = numbers[randomIndex];

        const display = numbers.map((num, index) =>
            index === randomIndex ? "?" : num
        );

        return {
            latex: `\\text{What is the missing number: } ${display.join(", ")}`,
            answer: answer.toString(),
        };

    }, [1, 2, 3]),
    "mental-strategies": createGenerator(({ difficulty }) => {
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
    }, [1, 2, 3]),
    "number-bonds": createGenerator(({ difficulty }) => {
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
    }, [1, 2, 3]),
};

const secondaryGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "expressions": createGenerator(({ difficulty }) => {
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
    }, [1, 2, 3]),
};

const sixthFormGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "differentiation-rules": createGenerator(({ difficulty }) => {
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
    }, [1, 2, 3]),
};

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
