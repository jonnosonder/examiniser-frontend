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

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, args } = event.data;
  const generator = getQuestionGenerator(args.level, args.subtopicSlug);

  let result: QuestionResult;

  try {
    result = await Promise.resolve(generator(args));
  } catch (error) {
    result = {
      latex: "\\text{Question generation error}",
      answer: "",
      options: [],
      forceOption: 0,
      explanation: String(error instanceof Error ? error.message : error),
    };
  }

  const response: WorkerResponse = { id, result };
  self.postMessage(response);
});
