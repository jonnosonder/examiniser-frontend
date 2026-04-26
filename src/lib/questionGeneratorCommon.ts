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
    answer: string | string[];
    options?: string[];
    forceOption: 0 | 1 | 2;
    equalValue?: boolean;
    lowercaseCheck?: boolean;
    checkWeakLatexEquivalent?: boolean;
    explanation?: string;
    svg?: string;
};

export type QuestionGenerator = (args: QuestionGeneratorArgs) => QuestionResult | Promise<QuestionResult>;
export type QuestionGeneratorWithLevels = ((args: QuestionGeneratorArgs) => Promise<QuestionResult>) & {
    availableDifficulties?: number[];
};

export function createGenerator(generator: QuestionGenerator, availableDifficulties: number[]): QuestionGeneratorWithLevels {
    const fn = (async (args: QuestionGeneratorArgs) => {
        const result = await Promise.resolve(generator(args));
        const shouldFill = (result.forceOption === 0 || result.forceOption === 2);
        if ((Array.isArray(result.options) ? result.options.length === 0 : true) && shouldFill) {
            result.options = generateOptionsFromAnswer(result.answer);
        }
        if (!Array.isArray(result.options)) {
            result.options = [];
        }
        return result;
    }) as QuestionGeneratorWithLevels;
    fn.availableDifficulties = availableDifficulties;
    return fn;
}

export const defaultGenerator: QuestionGeneratorWithLevels = createGenerator(
    ({ level, subtopicSlug, difficulty }) => ({
        latex: `\\text{No generator defined for ${level}/${subtopicSlug} at level ${difficulty}}`,
        answer: "",
        explanation: "Please add a generator for this level and subtopic",
        options: [],
        forceOption: 0,
    }),
    [1]
);

function generateOptionsFromAnswer(answer: string | string[]): string[] {
    const raw = Array.isArray(answer)
        ? answer[0]
        : answer;

    const correct = raw.toString().trim();

    const isBoolean = correct === "true" || correct === "false";

    // ---- BOOLEAN SPECIAL CASE ----
    if (isBoolean) {
        const options = ["True", "False"];

        // shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return options;
    }

    const isFraction = /^\d+\/\d+$/.test(correct);
    const isDecimal = /^-?\d+\.\d+$/.test(correct);
    const isNumber = /^-?\d+$/.test(correct);
    const isWord = /^[a-zA-Z]+$/.test(correct);

    // special case: HCF/LCM or tuple answers like "3,6"
    const isTuple = correct.includes(",") && !isFraction;

    // ---- UNKNOWN TYPE ----
    if (!isNumber && !isFraction && !isDecimal && !isWord && !isTuple) {
        return [];
    }

    const optionsSet = new Set<string>();
    optionsSet.add(correct);

    // safety limit to prevent infinite loops
    let guard = 0;
    const MAX_GUARD = 50;

    while (optionsSet.size < 4 && guard < MAX_GUARD) {
        guard++;

        let wrong = "";

        // ---- TUPLE (HCF/LCM CASE) SAFE HANDLING ----
        if (isTuple) {
            const parts = correct.split(",").map((x: string) => Number(x));

            const perturbed = parts.map((v: number) => {
                const offset = Math.floor(Math.random() * 3) + 1;
                return v + (Math.random() < 0.5 ? offset : -offset);
            });

            wrong = perturbed.join(",");
        }

        // ---- FRACTION ----
        else if (isFraction) {
            const n = Math.floor(Math.random() * 6) + 1;
            const d = Math.floor(Math.random() * 6) + 2;
            wrong = `${n}/${d}`;
        }

        // ---- DECIMAL ----
        else if (isDecimal) {
            const base = parseFloat(correct);
            wrong = (base + (Math.random() - 0.5) * 2).toFixed(2);
        }

        // ---- INTEGER ----
        else if (isNumber) {
            const base = Number(correct);
            const range = Math.max(3, Math.abs(base) * 0.2);

            const rand =
                base +
                Math.floor(Math.random() * range * 2) -
                range;

            wrong = Math.round(rand).toString();
        }

        // ---- WORD ----
        else if (isWord) {
            const pool = [
                "First",
                "Second",
                "Ones",
                "Tens",
                "Hundreds",
                "Thousands",
            ];

            wrong = pool[Math.floor(Math.random() * pool.length)];
        }

        if (wrong && wrong !== correct) {
            optionsSet.add(wrong);
        }
    }

    const options = Array.from(optionsSet);

    // final safety shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}
