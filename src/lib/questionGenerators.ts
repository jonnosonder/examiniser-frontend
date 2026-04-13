// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

export type { QuestionGeneratorArgs, QuestionResult, QuestionGenerator, QuestionGeneratorWithLevels } from "./questionGeneratorCommon";
import { getQuestionGenerator, getQuestionGeneratorLevels } from "./questionGeneratorRegistry";

export async function generateQuestionWithTimeout(
    args: import("./questionGeneratorCommon").QuestionGeneratorArgs,
    timeoutMs = 3000
): Promise<import("./questionGeneratorCommon").QuestionResult> {
    const fallback: import("./questionGeneratorCommon").QuestionResult = {
        latex: "\\text{Question generation timed out}",
        answer: "",
        options: [],
        forceOption: 0,
        explanation: "Question generator timed out after 3 seconds",
    };

    if (typeof Worker === "undefined") {
        const generator = getQuestionGenerator(args.level, args.subtopicSlug);
        return Promise.race([
            Promise.resolve(generator(args)).catch(() => fallback),
            new Promise<import("./questionGeneratorCommon").QuestionResult>((resolve) =>
                setTimeout(() => resolve(fallback), timeoutMs)
            ),
        ]).then((result) => result ?? fallback);
    }

    return new Promise<import("./questionGeneratorCommon").QuestionResult>((resolve) => {
        const worker = new Worker(new URL("./questionGeneratorWorker.ts", import.meta.url), {
            type: "module",
        });

        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const timeoutId = setTimeout(() => {
            worker.terminate();
            resolve(fallback);
        }, timeoutMs);

        worker.onmessage = (event: MessageEvent<{ id: string; result: import("./questionGeneratorCommon").QuestionResult }>) => {
            if (event.data.id !== id) return;
            clearTimeout(timeoutId);
            worker.terminate();
            resolve(event.data.result);
        };

        worker.onerror = () => {
            clearTimeout(timeoutId);
            worker.terminate();
            resolve(fallback);
        };

        worker.postMessage({ id, args });
    });
}

export { getQuestionGeneratorLevels };
