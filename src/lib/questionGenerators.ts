// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

export type { QuestionGeneratorArgs, QuestionResult, QuestionGenerator, QuestionGeneratorWithLevels } from "./questionGeneratorCommon";
import { getQuestionGenerator, getQuestionGeneratorLevels } from "./questionGeneratorRegistry";

type WorkerMessage = { id: string; result: import("./questionGeneratorCommon").QuestionResult };

type PendingRequest = {
    resolve: (result: import("./questionGeneratorCommon").QuestionResult) => void;
    timeoutId: ReturnType<typeof setTimeout>;
};

let sharedGeneratorWorker: Worker | null = null;
const pendingRequests = new Map<string, PendingRequest>();

function getFallbackResult(): import("./questionGeneratorCommon").QuestionResult {
    return {
        latex: "\\text{Question generation timed out}",
        answer: "",
        options: [],
        forceOption: 0,
        explanation: "Question generator timed out after 3 seconds",
    };
}

function resetSharedWorker(): void {
    if (sharedGeneratorWorker) {
        sharedGeneratorWorker.terminate();
        sharedGeneratorWorker = null;
    }
}

function getSharedWorker(): Worker {
    if (sharedGeneratorWorker) {
        return sharedGeneratorWorker;
    }

    const worker = new Worker(new URL("./questionGeneratorWorker.ts", import.meta.url), {
        type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const pending = pendingRequests.get(event.data.id);
        if (!pending) return;

        clearTimeout(pending.timeoutId);
        pendingRequests.delete(event.data.id);
        pending.resolve(event.data.result ?? getFallbackResult());
    };

    worker.onerror = () => {
        const fallback = getFallbackResult();
        for (const [id, pending] of pendingRequests.entries()) {
            clearTimeout(pending.timeoutId);
            pending.resolve(fallback);
            pendingRequests.delete(id);
        }
        resetSharedWorker();
    };

    sharedGeneratorWorker = worker;
    return worker;
}

export async function generateQuestionWithTimeout(
    args: import("./questionGeneratorCommon").QuestionGeneratorArgs,
    timeoutMs = 3000
): Promise<import("./questionGeneratorCommon").QuestionResult> {
    const fallback = getFallbackResult();

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
        const worker = getSharedWorker();
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const timeoutId = setTimeout(() => {
            pendingRequests.delete(id);
            resolve(fallback);
        }, timeoutMs);

        pendingRequests.set(id, { resolve, timeoutId });

        worker.postMessage({ id, args });
    });
}

export { getQuestionGeneratorLevels };
