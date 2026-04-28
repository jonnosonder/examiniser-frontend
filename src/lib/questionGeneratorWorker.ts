// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { getQuestionGenerator } from "./questionGeneratorRegistry";
import type { QuestionGeneratorArgs, QuestionResult } from "./questionGeneratorCommon";

type WorkerRequest = {
  id: string;
  args: QuestionGeneratorArgs;
};

type WorkerResponse = {
  id: string;
  result: QuestionResult;
};

let previousLatex: string | null = null;

async function generateQuestionResult(args: QuestionGeneratorArgs): Promise<QuestionResult> {
  const generator = getQuestionGenerator(args.level, args.subtopicSlug);

  try {
    let result = await Promise.resolve(generator(args));

    if (previousLatex && result.latex === previousLatex) {
      result = await Promise.resolve(generator(args));
    }

    previousLatex = result.latex;
    return result;
  } catch (error) {
    return {
      latex: "\\text{Question generation error}",
      answer: "",
      options: [],
      forceOption: 0,
      explanation: String(error instanceof Error ? error.message : error),
    };
  }
}

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, args } = event.data;
  const result = await generateQuestionResult(args);

  const response: WorkerResponse = { id, result };
  self.postMessage(response);
});
