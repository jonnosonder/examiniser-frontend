// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels } from './questionGeneratorCommon';

export const sixthFormGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "differentiation-rules": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: "\\frac{d}{dx}(x^2)",
                answer: "2x",
                forceOption: 0,
            };
        }
        if (difficulty === 2) {
            return {
                latex: "\\frac{d}{dx}(3x^3 + 2x)",
                answer: "9x^2 + 2",
                forceOption: 0,
            };
        }
        return {
            latex: "\\frac{d}{dx}(5x^4 - x^2 + 7)",
            answer: "20x^3 - 2x",
            forceOption: 0,
        };
    }, [1, 2, 3]),
};

