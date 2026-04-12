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
    "place-value": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const number = Math.floor(100 + Math.random() * 900); // 3-digit number
            const digits = number.toString().split("");

            const validIndexes = digits
                .map((d, i) => (d !== "0" ? i : -1))
                .filter(i => i !== -1);

            const index = validIndexes[Math.floor(Math.random() * validIndexes.length)];
            const digit = parseInt(digits[index]);

            const placeValue = digit * Math.pow(10, digits.length - index - 1);

            return {
                latex: `\\text{What is the value of the digit } ${digit} \\text{ in the number } ${number}?`,
                answer: placeValue.toString(),
            };
        }

        if (difficulty === 2) {
            const places = [
                { name: "ones", value: 1 },
                { name: "tens", value: 10 },
                { name: "hundreds", value: 100 },
                { name: "thousands", value: 1000 },
                { name: "ten thousands", value: 10000 },
            ];

            const place = places[Math.floor(Math.random() * places.length)];

            const digit = Math.floor(Math.random() * 9) + 1;

            const value = digit * place.value;

            return {
                latex: `\\text{A digit has a value of } ${value}. \\text{ What place is it in?}`,
                answer: place.name,
            };
        }

        if (difficulty === 3) {
            const integerPart = Math.floor(Math.random() * 9) + 1; // 1–9

            const decimalDigits = Array.from({ length: 3 }, () =>
                Math.floor(Math.random() * 10)
            );

            const validIndexes = decimalDigits
                .map((d, i) => (d !== 0 ? i : -1))
                .filter(i => i !== -1);

            if (validIndexes.length === 0) {
                decimalDigits[0] = Math.floor(Math.random() * 9) + 1;
                validIndexes.push(0);
            }

            const index = validIndexes[Math.floor(Math.random() * validIndexes.length)];
            const digit = decimalDigits[index];

            const number = `${integerPart}.${decimalDigits.join("")}`;

            const value = digit * Math.pow(10, -(index + 1));

            return {
                latex: `\\text{What is the value of the digit } ${digit} \\text{ in } ${number}?`,
                answer: value.toString(),
            };
        }

        const digit = Math.floor(Math.random() * 9) + 1;
        const places = [1, 10, 100, 1000];

        let i1 = Math.floor(Math.random() * places.length);
        let i2;
        do {
            i2 = Math.floor(Math.random() * places.length);
        } while (i2 === i1);

        const p1 = places[i1];
        const p2 = places[i2];

        function buildNumber(digit: number, place: number): number {
            const totalDigits = place.toString().length;
            const digits = Array.from({ length: totalDigits }, () =>
                Math.floor(Math.random() * 10)
            );

            const index = totalDigits - 1 - Math.log10(place);
            digits[index] = digit;

            if (digits[0] === 0) digits[0] = Math.floor(Math.random() * 9) + 1;

            return parseInt(digits.join(""));
        }

        const num1 = buildNumber(digit, p1);
        const num2 = buildNumber(digit, p2);

        const value1 = digit * p1;
        const value2 = digit * p2;

        let answer;
        if (value1 > value2) {
            answer = "first";
        } else {
            answer = "second";
        }

        return {
            latex: `\\text{Which is greater: the value of the digit ${digit} in ${num1} or in ${num2}?}\\\\\\text{(Answer "first" or "second")}`,
            answer: answer,
        };

    }, [1, 2, 3, 4]),
    "comparing-and-ordering-numbers": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            let a = Math.floor(Math.random() * 21) - 10; // -10 to 10
            let b = Math.floor(Math.random() * 21) - 10; // -10 to 10

            const isGreaterThan = Math.random() < 0.5;

            let question;
            let answer;

            if (isGreaterThan) {
                question = `${a} > ${b}`;
                answer = a > b;
            } else {
                question = `${a} < ${b}`;
                answer = a < b;
            }

            return {
                latex: `\\text{True or False: } ${question}`,
                answer: answer.toString(),
            };
        }

        let nums = [];

        for (let i = 0; i < 5; i++) {
            nums.push(Math.floor(Math.random() * 21) - 10); // -10 to 10
        }

        const isAscending = Math.random() < 0.5;

        let question;
        let answer;

        if (isAscending) {
            answer = [...nums].sort((a, b) => a - b);
            question = `${nums.join(", ")}\\text{ in ascending order}`;
        } else {
            answer = [...nums].sort((a, b) => b - a);
            question = `${nums.join(", ")}\\text{ in descending order}`;
        }

        return {
            latex: `\\text{Sort the numbers: } ${question}\\\\\\text{(answer with commas to seperate the numbers)}`,
            answer: answer.join(","),
        };

    }, [1, 2]),
    "addition-and-subtraction": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            let a = Math.floor(Math.random() * 11); // 0–10
            let b = Math.floor(Math.random() * 11); // 0–10

            const isAddition = Math.random() < 0.5;

            let question;
            let answer;

            if (isAddition) {
                question = `${a} + ${b}`;
                answer = a + b;
            } else {
                // ensure b <= a
                if (b > a) {
                    [a, b] = [b, a];
                }
                question = `${a} - ${b}`;
                answer = a - b;
            }

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
            };
        }

        if (difficulty === 2) {
            const a = Math.floor(Math.random() * 11); // 0–10
            const b = Math.floor(Math.random() * 11); // 0–10
            const isAddThenSubtract = Math.random() < 0.5;

            let c;
            let question;
            let answer;

            if (isAddThenSubtract) {
                // a + b - c >= 0 → c ≤ (a + b), but also ≤ 10
                const maxC = Math.min(10, a + b);
                c = Math.floor(Math.random() * (maxC + 1));

                question = `${a} + ${b} - ${c}`;
                answer = a + b - c;
            } else {
                // ensure b ≤ a without changing range
                const safeB = Math.min(b, a);

                // c still 0–10
                c = Math.floor(Math.random() * 11);

                question = `${a} - ${safeB} + ${c}`;
                answer = a - safeB + c;
            }

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
            };
        }

        let a = Math.floor(Math.random() * 101); // 0–100
        let b = Math.floor(Math.random() * 101); // 0–100

        const isAddition = Math.random() < 0.5;

        let question;
        let answer;

        if (isAddition) {
            question = `${a} + ${b}`;
            answer = a + b;
        } else {
            // ensure no negative result
            if (b > a) {
                [a, b] = [b, a];
            }

            question = `${a} - ${b}`;
            answer = a - b;
        }

        return {
            latex: `\\text{Calculate: } ${question}`,
            answer: answer.toString(),
        };

    }, [1, 2, 3]),
    "multiplication-and-division": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            let a = Math.floor(Math.random() * 12) + 1; // 1–12
            let b = Math.floor(Math.random() * 12) + 1; // 1–12

            const question = `${a} × ${b}`;
            const answer = a * b;

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
            };
        }

        if (difficulty === 2) {
            let divisor = Math.floor(Math.random() * 12) + 1; // 1–12
            let quotient = Math.floor(Math.random() * 12) + 1; // 1–12

            let dividend = divisor * quotient; // ensures whole number result

            const question = `${dividend} ÷ ${divisor}`;
            const answer = quotient;

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
            };
        }

        let a, b, c;
        let question;
        let answer;
        const isMultiplication = Math.random() < 0.5;

        if (isMultiplication) {
            do {
                a = Math.floor(Math.random() * 12) + 1;
                b = Math.floor(Math.random() * 12) + 1;
                c = Math.floor(Math.random() * 12) + 1;
                answer = a * b * c;
            } while (answer >= 144);
            question = `${a} × ${b} × ${c}`;
        } else {
            do {
                a = Math.floor(Math.random() * 12) + 1;
                b = Math.floor(Math.random() * 12) + 1;
                c = Math.floor(Math.random() * 12) + 1;
            } while ((a % b !== 0) || ((a / b) % c !== 0));
            answer = a / b / c;
            question = `${a} ÷ ${b} ÷ ${c}`;
        }

        return {
            latex: `\\text{Calculate: } ${question}`,
            answer: answer.toString(),
        };

    }, [1, 2, 3]),
    "rounding-and-estimation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            let num: number = parseFloat((Math.random() * 21 - 10).toFixed(1));

            const rounded: number = Math.round(num);

            return {
                latex: `\\text{Round to the nearest whole number: } ${num}`,
                answer: rounded.toString(),
            };
        }

        if (difficulty === 2) {
            // Generate a 2–5 digit number
            let numDigits = Math.floor(Math.random() * 4) + 2; // 2 to 5 digits
            let num = Math.floor(Math.random() * (10 ** numDigits));

            // Only valid rounding places for 2+ digit numbers
            const places = [
                { name: "tens", value: 10 },
                { name: "hundreds", value: 100 },
                { name: "thousands", value: 1000 }
            ];

            const place = places[Math.floor(Math.random() * places.length)];

            const answer = Math.round(num / place.value) * place.value;

            return {
                latex: `\\text{Round } ${num} \\text{ to the nearest ${place.name}.}`,
                answer: answer.toString(),
            };
        }

        function roundTo(n: number, place: number): number {
            return Math.round(n / place) * place;
        }

        const count = Math.random() < 0.5 ? 2 : 3;

        let nums = [];
        for (let i = 0; i < count; i++) {
            nums.push(Math.floor(Math.random() * 9000) + 100);
        }

        const isAddition = Math.random() < 0.5;

        const places = [
            { name: "tens", value: 10 },
            { name: "hundreds", value: 100 },
            { name: "thousands", value: 1000 }
        ];

        const place = places[Math.floor(Math.random() * places.length)];

        let estimatedNums = nums.map(n => roundTo(n, place.value));

        let answer;
        let question;

        if (isAddition) {
            answer = estimatedNums.reduce((a, b) => a + b, 0);
            question = nums.join(" + ");
        } else {
            answer = estimatedNums.reduce((a, b) => a - b);
            question = nums.join(" - ");
        }

        return {
            latex: `\\text{Estimate to the nearest ${place.name}: } ${question}`,
            answer: answer.toString(),
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
