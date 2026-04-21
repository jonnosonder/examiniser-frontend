// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

/* eslint-disable prefer-const, @typescript-eslint/no-unused-vars */

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels, QuestionResult } from './questionGeneratorCommon';

// When your site is built, this env var should point at the CloudFront URL
// serving MathSample.json. If it is not set, the placeholder is used so the
// project still compiles in development.
const WORD_PROBLEM_JSON_URL = 'https://d2lpkm1h3gh3rw.cloudfront.net/bf708822519a6c22ccfa2aa8bed72e7b86587d0a587fe7e6bbc0d86068e2c57c.json';

type WordProblemRecord = {
    category?: string;
    question: string;
    answer: string | number;
    explanation?: string;
};

let wordProblemCache: WordProblemRecord[] | null = null;

async function fetchRandomWordProblem(): Promise<QuestionResult> {
    try {
        if (!wordProblemCache) {
            const res = await fetch(WORD_PROBLEM_JSON_URL, { method: 'GET', mode: 'cors' });
            if (!res.ok) {
                throw new Error(`Failed to fetch word problems: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error('Word problems JSON is not an array');
            }
            wordProblemCache = data;
        }

        if (!wordProblemCache.length) {
            throw new Error('Word problems list is empty');
        }

        const item = wordProblemCache[Math.floor(Math.random() * wordProblemCache.length)];
        const answerText = item.answer === null || item.answer === undefined ? '' : String(item.answer);

        return {
            latex: `\\text{${item.question}}`,
            answer: answerText,
            explanation: item.explanation ?? '',
            forceOption: 0,
        };
    } catch (error) {
        console.log('Error fetching word problem:', error);
        return {
            latex: "\\text{Unable to load word problem from remote storage}",
            answer: '',
            explanation: String(error instanceof Error ? error.message : error),
            forceOption: 0,
        };
    }
}

export const primaryGenerators: Record<string, QuestionGeneratorWithLevels> = {
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
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const randomIndex = Math.floor(Math.random() * 10);
            const isForward = Math.random() < 0.5;

            const start = Math.floor(Math.random() * 91) + 10;

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
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const randomIndex = Math.floor(Math.random() * 10);
            const isForward = Math.random() < 0.5;

            const start = Math.floor(Math.random() * 991) + 10;

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
                forceOption: 0,
            };
        }

        const step = Math.floor(Math.random() * 8) + 2; // 2–9
        const randomIndex = Math.floor(Math.random() * 10);
        const start = Math.floor(Math.random() * 50) + 1;

        const numbers = Array.from({ length: 10 }, (_, i) =>
            start + i * step
        );

        const answer = numbers[randomIndex];

        const display = numbers.map((num, index) =>
            index === randomIndex ? "?" : num
        );

        return {
            latex: `\\text{Counting in ${step}, what is the missing number: } ${display.join(", ")}`,
            answer: answer.toString(),
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),
    "place-value": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // pick digit first (1–9)
            const digit = Math.floor(Math.random() * 9) + 1;

            // choose position: 0 = hundreds, 1 = tens, 2 = units
            const index = Math.floor(Math.random() * 3);

            const digits: number[] = [];

            for (let i = 0; i < 3; i++) {
                if (i === index) {
                    digits.push(digit);
                } else {
                    let d;
                    do {
                        d = Math.floor(Math.random() * 10);
                    } while (
                        d === digit ||           // avoid duplicate target digit
                        (i === 0 && d === 0)     // avoid leading zero
                    );
                    digits.push(d);
                }
            }

            const number = parseInt(digits.join(""));

            const placeValue = digit * Math.pow(10, 2 - index);

            return {
                latex: `\\text{What is the value of the digit } ${digit} \\text{ in the number } ${number}?`,
                answer: placeValue.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const places = [
                { name: "Ones", value: 1 },
                { name: "Tens", value: 10 },
                { name: "Hundreds", value: 100 },
                { name: "Thousands", value: 1000 },
                { name: "Ten Thousands", value: 10000 },
            ];

            const place = places[Math.floor(Math.random() * places.length)];

            const digit = Math.floor(Math.random() * 9) + 1;
            const value = digit * place.value;

            // --- Generate wrong options ---
            const wrongOptions = places
                .filter(p => p.name !== place.name)
                .map(p => p.name);

            // Shuffle and take 3
            for (let i = wrongOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
            }

            const selectedWrong = wrongOptions.slice(0, 3);

            // --- Combine and shuffle all options ---
            const options = [place.name, ...selectedWrong];

            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            return {
                latex: `\\text{A digit has a value of } ${value}. \\text{ What place is it in?}`,
                answer: place.name,
                options,
                forceOption: 2,
            };
        }
        if (difficulty === 3) {
            const integerPart = Math.floor(Math.random() * 9) + 1;

            // pick digit first (1–9 avoids ambiguity with leading zeros)
            const digit = Math.floor(Math.random() * 9) + 1;

            // choose position (0 = tenths, 1 = hundredths, 2 = thousandths)
            const index = Math.floor(Math.random() * 3);

            const decimalDigits = [];

            for (let i = 0; i < 3; i++) {
                if (i === index) {
                    decimalDigits.push(digit);
                } else {
                    // ensure different digit
                    let d;
                    do {
                        d = Math.floor(Math.random() * 10);
                    } while (d === digit);
                    decimalDigits.push(d);
                }
            }

            const number = `${integerPart}.${decimalDigits.join("")}`;

            const value = digit * Math.pow(10, -(index + 1));

            return {
                latex: `\\text{What is the value of the digit } ${digit} \\text{ in } ${number}?`,
                answer: value.toString(),
                forceOption: 0,
            };
        }

        const digit = Math.floor(Math.random() * 9) + 1;
        const places = [1, 10, 100, 1000];

        const i1 = Math.floor(Math.random() * places.length);
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

        // --- options (randomised order) ---
        const options = ["First", "Second"];

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            latex: `\\text{Which is greater: the value of the digit ${digit} in ${num1} or in ${num2}?}\\\\\\text{(Answer "first" or "second")}`,
            answer,
            options,
            forceOption: 2,
        };

    }, [1, 2, 3, 4]),
    "comparing-and-ordering-numbers": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 21) - 10; // -10 to 10
            const b = Math.floor(Math.random() * 21) - 10; // -10 to 10

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
                forceOption: 0,
            };
        }

        const nums: number[] = [];

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
            forceOption: 0,
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
                forceOption: 0,
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
                forceOption: 0,
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
            forceOption: 0,
        };

    }, [1, 2, 3]),
    "multiplication-and-division": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 12) + 1; // 1–12
            const b = Math.floor(Math.random() * 12) + 1; // 1–12

            const question = `${a} × ${b}`;
            const answer = a * b;

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const divisor = Math.floor(Math.random() * 12) + 1; // 1–12
            const quotient = Math.floor(Math.random() * 12) + 1; // 1–12

            const dividend = divisor * quotient; // ensures whole number result

            const question = `${dividend} ÷ ${divisor}`;
            const answer = quotient;

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
                forceOption: 0,
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
            forceOption: 0,
        };

    }, [1, 2, 3]),
    "rounding-and-estimation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const num: number = parseFloat((Math.random() * 21 - 10).toFixed(1));

            const rounded: number = Math.round(num);

            return {
                latex: `\\text{Round to the nearest whole number: } ${num}`,
                answer: rounded.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Generate a 2–5 digit number
            const numDigits = Math.floor(Math.random() * 4) + 2; // 2 to 5 digits
            const num = Math.floor(Math.random() * (10 ** numDigits));

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
                forceOption: 0,
            };
        }

        function roundTo(n: number, place: number): number {
            return Math.round(n / place) * place;
        }

        const count = Math.random() < 0.5 ? 2 : 3;

        const nums: number[] = [];
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

        const estimatedNums = nums.map(n => roundTo(n, place.value));

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
            forceOption: 0,
        };

    }, [1, 2, 3]),
    "fractions": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Identify a simple fraction from a visual description (numerator/denominator)
            const denominators = [2, 3, 4];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * denom) + 1;

            const toLatexFraction = (n: number, d: number) => `\\frac{${n}}{${d}}`;

            const answers: string[] = [toLatexFraction(numer, denom)];

            if (numer === denom) {
                if (numer === 4) {
                    answers.push(`\\frac{2}{2}`);
                }
                answers.push(`1`);
                answers.push(`1`);
            }

            const optionsSet = new Set<string>();

            // correct answer (no brackets)
            optionsSet.add(toLatexFraction(numer, denom));

            // derived answers
            for (const a of answers) {
                optionsSet.add(a);
            }

            // distractors
            while (optionsSet.size < 4) {
                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * d) + 1;
                optionsSet.add(toLatexFraction(n, d));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{A shape is split into } ${denom} \\text{ equal parts. } ${numer} \\text{ part(s) are shaded. What fraction is shaded?}`,
                answer: toLatexFraction(numer, denom),
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Identify numerator or denominator from a fraction description
            const denominators = [2, 3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * (denom - 1)) + 1; // 1 to denom-1

            const askNumerator = Math.random() < 0.5;

            return {
                latex: askNumerator
                    ? `\\text{In the fraction } \\frac{${numer}}{${denom}} \\text{, what is the numerator?}`
                    : `\\text{In the fraction } \\frac{${numer}}{${denom}} \\text{, what is the denominator?}`,
                answer: askNumerator ? numer.toString() : denom.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // Compare two fractions with the same denominator
            const denominators = [4, 5, 6, 8, 10, 12];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const a = Math.floor(Math.random() * (denom - 1)) + 1;
            let b = Math.floor(Math.random() * (denom - 1)) + 1;
            while (b === a) b = Math.floor(Math.random() * (denom - 1)) + 1;

            const isGreater = Math.random() < 0.5;
            const answer = isGreater ? (a > b).toString() : (a < b).toString();
            const symbol = isGreater ? ">" : "<";

            return {
                latex: `\\text{True or False: } \\frac{${a}}{${denom}} ${symbol} \\frac{${b}}{${denom}}`,
                answer,
                forceOption: 0,
            };
        }

        const families = [[2, 4, 8], [3, 6, 12], [2, 5, 10]];
        const family = families[Math.floor(Math.random() * families.length)];

        const fractions = family.map(denom => {
            const numer = Math.floor(Math.random() * (denom - 1)) + 1;
            return { numer, denom };
        });

        const isAscending = Math.random() < 0.5;

        // correct order
        const sorted = [...fractions].sort((a, b) =>
            isAscending
                ? a.numer / a.denom - b.numer / b.denom
                : b.numer / b.denom - a.numer / a.denom
        );

        const display = fractions.map(f => `\\frac{${f.numer}}{${f.denom}}`).join(", ");

        const correct = sorted.map(f => `\\frac{${f.numer}}{${f.denom}}`).join(",");

        // -----------------------------
        // OPTIONS (PERMUTATIONS)
        // -----------------------------
        const permutations = new Set<string>();

        // helper to shuffle array
        const shuffle = (arr: typeof fractions) =>
            [...arr].sort(() => Math.random() - 0.5);

        // add correct answer
        permutations.add(correct);

        // generate distractors
        while (permutations.size < 4) {
            const shuffled = shuffle(fractions)
                .map(f => `\\frac{${f.numer}}{${f.denom}}`)
                .join(",");

            permutations.add(shuffled);
        }

        const options = Array.from(permutations).sort(() => Math.random() - 0.5);

        // -----------------------------
        // RETURN
        // -----------------------------
        return {
            latex: `\\text{Sort in ${isAscending ? "ascending" : "descending"} order: } ${display}`,
            answer: correct,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),

    "equivalent-fractions": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Fill in the missing numerator to make equivalent fractions
            const denominators = [2, 3, 4, 5];
            const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
            const numer1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
            const multiplier = Math.floor(Math.random() * 3) + 2; // 2–4

            const denom2 = denom1 * multiplier;
            const numer2 = numer1 * multiplier;

            return {
                latex: `\\frac{${numer1}}{${denom1}} = \\frac{?}{${denom2}}`,
                answer: numer2.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Fill in the missing denominator
            const denominators = [2, 3, 4, 5, 6];
            const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
            const numer1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
            const multiplier = Math.floor(Math.random() * 3) + 2; // 2–4

            const denom2 = denom1 * multiplier;
            const numer2 = numer1 * multiplier;

            return {
                latex: `\\frac{${numer2}}{${denom2}} = \\frac{${numer1}}{?}`,
                answer: denom1.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // Simplify a fraction to its lowest terms
            const denominators = [4, 6, 8, 9, 10, 12, 15];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const factors = [];
            for (let i = 2; i <= denom; i++) {
                if (denom % i === 0) factors.push(i);
            }

            const factor = factors[Math.floor(Math.random() * factors.length)];

            const maxNumer = denom / factor - 1;

            const toLatexFraction = (n: number, d: number) =>
                `\\frac{${n}}{${d}}`;

            let numer: number;
            let simplifiedNumer: number;
            const simplifiedDenom = denom / factor;

            // fallback case
            if (maxNumer < 1) {
                numer = factor;

                const answer = simplifiedDenom === 1
                    ? `1`
                    : toLatexFraction(1, simplifiedDenom);

                const optionsSet = new Set<string>();
                optionsSet.add(answer);

                while (optionsSet.size < 4) {
                    const wrongDenom = denominators[Math.floor(Math.random() * denominators.length)];
                    const wrongFactor = Math.floor(Math.random() * (wrongDenom - 1)) + 1;

                    const wrong = wrongDenom === wrongFactor
                        ? `1`
                        : toLatexFraction(wrongFactor, wrongDenom);

                    optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Simplify: } \\frac{${factor}}{${denom}}`,
                    answer,
                    options,
                    forceOption: 0,
                };
            }

            simplifiedNumer = Math.floor(Math.random() * maxNumer) + 1;
            numer = simplifiedNumer * factor;

            const simplified = simplifiedNumer === simplifiedDenom
                ? `1`
                : toLatexFraction(simplifiedNumer, simplifiedDenom);

            const answer = simplified;

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            // correct-style distractors
            optionsSet.add(
                (simplifiedNumer + 1 === simplifiedDenom + 1)
                    ? `1`
                    : toLatexFraction(simplifiedNumer + 1, simplifiedDenom)
            );

            optionsSet.add(toLatexFraction(simplifiedNumer, simplifiedDenom + 1));
            optionsSet.add(toLatexFraction(simplifiedNumer * 2, simplifiedDenom));

            // ensure 4 options
            while (optionsSet.size < 4) {
                const wrongD = denominators[Math.floor(Math.random() * denominators.length)];
                const wrongF = Math.floor(Math.random() * (wrongD - 1)) + 1;

                const wrongSimplifiedDenom = wrongD / Math.max(2, wrongD % 3 === 0 ? 3 : 2);

                const wrong =
                    wrongF === wrongSimplifiedDenom
                        ? `1`
                        : toLatexFraction(wrongF, wrongD);

                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Simplify: } \\frac{${numer}}{${denom}}`,
                answer,
                options,
                forceOption: 0,
            };
        }

        // difficulty === 4: Are these two fractions equivalent? True/False
        const denominators4 = [2, 3, 4, 5, 6, 8, 10];
        const denom1 = denominators4[Math.floor(Math.random() * denominators4.length)];
        const numer1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
        const multiplier = Math.floor(Math.random() * 3) + 2;

        const isEquivalent = Math.random() < 0.5;

        let numer2, denom2;
        if (isEquivalent) {
            numer2 = numer1 * multiplier;
            denom2 = denom1 * multiplier;
        } else {
            denom2 = denom1 * multiplier;
            numer2 = numer1 * multiplier + 1; // deliberately off by 1
        }

        return {
            latex: `\\text{True or False: } \\frac{${numer1}}{${denom1}} = \\frac{${numer2}}{${denom2}}`,
            answer: isEquivalent.toString(),
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),

    "simple-addition-subtraction-of-fractions": createGenerator(({ difficulty }) => {
        const toLatexFraction = (n: number, d: number) =>
            `\\frac{${n}}{${d}}`;

        // -------------------------
        // D1: same denominator addition
        // -------------------------
        if (difficulty === 1) {
            const denominators = [2, 3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const a = Math.floor(Math.random() * (denom - 1)) + 1;
            const b = Math.floor(Math.random() * (denom - a)) + 1;

            const sumNumer = a + b;

            const toLatexFraction = (n: number, d: number) =>
                `\\frac{${n}}{${d}}`;

            const gcd = (x: number, y: number): number =>
                y === 0 ? x : gcd(y, x % x);

            let answers: string[] = [];

            const g = gcd(sumNumer, denom);
            const sn = sumNumer / g;
            const sd = denom / g;

            // -----------------------------
            // CASE 1: simplifies to whole number
            // -----------------------------
            if (sn === sd) {
                answers = [
                    "1",
                    toLatexFraction(sumNumer, denom) // e.g. 2/2, 3/3
                ];
            }

            // -----------------------------
            // CASE 2: general fraction
            // -----------------------------
            else if (sd === 1) {
                answers = [`${sn}`];
            } else {
                answers = [
                    toLatexFraction(sn, sd),
                    toLatexFraction(sumNumer, denom)
                ];
            }

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * (d - 1)) + 1;

                const extra = Math.floor(Math.random() * d) + 1;

                const val = extra === d
                    ? "1"
                    : toLatexFraction(extra, d);

                optionsSet.add(val);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\frac{${a}}{${denom}} + \\frac{${b}}{${denom}} = ?`,
                answer: answers,
                options,
                forceOption: 0,
            };
        }

        // -------------------------
        // D2: subtraction same denominator
        // -------------------------
        if (difficulty === 2) {
            const denominators = [3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const a = Math.floor(Math.random() * (denom - 1)) + 2;
            const b = Math.floor(Math.random() * (a - 1)) + 1;

            const diffNumer = a - b;

            const gcd = (x: number, y: number): number =>
                y === 0 ? x : gcd(y, x % y);

            const g = gcd(diffNumer, denom);
            const sn = diffNumer / g;
            const sd = denom / g;

            let answers =
                sd === 1
                    ? [`${sn}`]
                    : [
                        toLatexFraction(sn, sd),
                        toLatexFraction(diffNumer, denom)
                    ];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * (d - 1)) + 1;

                const m = Math.floor(Math.random() * n) + 1;
                const res = n - m;

                const g2 = (a: number, b: number): number =>
                    b === 0 ? a : g2(b, a % b);

                const gg = g2(res, d);
                const rn = res / gg;
                const rd = d / gg;

                optionsSet.add(rd === 1 ? `${rn}` : toLatexFraction(rn, rd));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\frac{${a}}{${denom}} - \\frac{${b}}{${denom}} = ?`,
                answer: answers,
                options,
                forceOption: 0,
            };
        }

        // -------------------------
        // D3: related denominators
        // -------------------------
        if (difficulty === 3) {

            const bases = [2, 3, 4, 5];
            const base = bases[Math.floor(Math.random() * bases.length)];
            const multiplier = Math.floor(Math.random() * 3) + 2;
            const denom2 = base * multiplier;

            const numer1 = Math.floor(Math.random() * (base - 1)) + 1;
            const numer2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

            const gcd = (a: number, b: number): number =>
                b === 0 ? a : gcd(b, a % b);

            const commonDenom = denom2;
            const equiv1 = numer1 * multiplier;
            const sumNumer = equiv1 + numer2;

            const g = gcd(sumNumer, commonDenom);
            const ansNumer = sumNumer / g;
            const ansDenom = commonDenom / g;

            let answers =
                ansDenom === 1
                    ? [`${ansNumer}`]
                    : [
                        toLatexFraction(ansNumer, ansDenom),
                        toLatexFraction(sumNumer, commonDenom)
                    ];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 10) + 1;
                const d = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
                optionsSet.add(toLatexFraction(n, d));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\frac{${numer1}}{${base}} + \\frac{${numer2}}{${denom2}} = ?`,
                answer: answers,
                options,
                forceOption: 0,
            };
        }

        // -------------------------
        // D4: mixed denominators
        // -------------------------
        const gcd = (a: number, b: number): number =>
            b === 0 ? a : gcd(b, a % b);

        const denomPairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]];
        const [denom1, denom2] = denomPairs[Math.floor(Math.random() * denomPairs.length)];

        const numer1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
        const numer2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

        const isAddition = Math.random() < 0.5;

        const lcm = (denom1 * denom2) / gcd(denom1, denom2);

        const eq1 = numer1 * (lcm / denom1);
        const eq2 = numer2 * (lcm / denom2);

        const resultNumer = isAddition ? eq1 + eq2 : Math.abs(eq1 - eq2);

        const g = gcd(resultNumer, lcm);

        const ansNumer = resultNumer / g;
        const ansDenom = lcm / g;

        let answers =
            ansDenom === 1
                ? [`${ansNumer}`]
                : [
                    toLatexFraction(ansNumer, ansDenom),
                    toLatexFraction(resultNumer, lcm)
                ];

        const optionsSet = new Set<string>(answers);

        while (optionsSet.size < 4) {
            const d1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
            const d2 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];

            const n1 = Math.floor(Math.random() * d1) + 1;
            const n2 = Math.floor(Math.random() * d2) + 1;

            const g2 = (a: number, b: number): number =>
                b === 0 ? a : g2(b, a % b);

            const gg = g2(n1 + n2, d1);
            const rn = (n1 + n2) / gg;
            const rd = d1 / gg;

            optionsSet.add(rd === 1 ? `${rn}` : toLatexFraction(rn, rd));
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        const [n1, d1, n2, d2] =
            isAddition || numer1 / denom1 >= numer2 / denom2
                ? [numer1, denom1, numer2, denom2]
                : [numer2, denom2, numer1, denom1];

        return {
            latex: `\\frac{${n1}}{${d1}} ${isAddition ? "+" : "-"} \\frac{${n2}}{${d2}} = ?`,
            answer: answers,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),

    "decimals": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Identify decimal from a tenths description
            const tenths = Math.floor(Math.random() * 10); // 0–9
            const wholes = Math.floor(Math.random() * 10); // 0–9

            return {
                latex: `\\text{Write as a decimal: } ${wholes} \\text{ and } ${tenths} \\text{ tenth(s)}`,
                answer: `${wholes}.${tenths}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Compare two decimals (tenths and hundredths)
            const a = parseFloat((Math.random() * 10).toFixed(2));
            let b = parseFloat((Math.random() * 10).toFixed(2));
            while (b === a) b = parseFloat((Math.random() * 10).toFixed(2));

            const isGreater = Math.random() < 0.5;
            const answer = isGreater ? (a > b).toString() : (a < b).toString();
            const symbol = isGreater ? ">" : "<";

            return {
                latex: `\\text{True or False: } ${a} ${symbol} ${b}`,
                answer,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // Round a decimal to the nearest whole number or nearest tenth
            const roundToTenth = Math.random() < 0.5;
            const num = parseFloat((Math.random() * 20 - 5).toFixed(2));

            let answer: string;
            if (roundToTenth) {
                answer = (Math.round(num * 10) / 10).toFixed(1);
                return {
                    latex: `\\text{Round to the nearest tenth: } ${num}`,
                    answer,
                    forceOption: 0,
                };
            } else {
                answer = Math.round(num).toString();
                return {
                    latex: `\\text{Round to the nearest whole number: } ${num}`,
                    answer,
                    forceOption: 0,
                };
            }
        }

        // difficulty === 4: Add or subtract decimals (up to hundredths)
        const a = parseFloat((Math.random() * 10).toFixed(2));
        const b = parseFloat((Math.random() * 10).toFixed(2));
        const isAddition = Math.random() < 0.5;

        let result: number;
        let question: string;

        if (isAddition) {
            result = parseFloat((a + b).toFixed(2));
            question = `${a} + ${b}`;
        } else {
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            result = parseFloat((big - small).toFixed(2));
            question = `${big} - ${small}`;
        }

        return {
            latex: `\\text{Calculate: } ${question}`,
            answer: result.toString(),
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),

    "link-between-fractions-and-decimals": createGenerator(({ difficulty }) => {
        const pairs: { numer: number; denom: number; decimal: string }[] = [
            { numer: 1, denom: 2, decimal: "0.5" },
            { numer: 1, denom: 4, decimal: "0.25" },
            { numer: 3, denom: 4, decimal: "0.75" },
            { numer: 1, denom: 5, decimal: "0.2" },
            { numer: 2, denom: 5, decimal: "0.4" },
            { numer: 3, denom: 5, decimal: "0.6" },
            { numer: 4, denom: 5, decimal: "0.8" },
            { numer: 1, denom: 10, decimal: "0.1" },
            { numer: 3, denom: 10, decimal: "0.3" },
            { numer: 7, denom: 10, decimal: "0.7" },
            { numer: 9, denom: 10, decimal: "0.9" },
        ];

        const toLatexFraction = (n: number, d: number) =>
            `\\frac{${n}}{${d}}`;

        // -------------------------
        // D1: fraction → decimal
        // -------------------------
        if (difficulty === 1) {
            const simplePairs = pairs.filter(p => [2, 4, 10].includes(p.denom));
            const pair = simplePairs[Math.floor(Math.random() * simplePairs.length)];

            const correct = pair.decimal;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const p = simplePairs[Math.floor(Math.random() * simplePairs.length)];

                const wrong = Math.random() < 0.5
                    ? p.decimal
                    : toLatexFraction(p.numer, p.denom);

                optionsSet.add(wrong);
            }

            return {
                latex: `\\text{Write } ${toLatexFraction(pair.numer, pair.denom)} \\text{ as a decimal.}`,
                answer: correct,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -------------------------
        // D2: fraction ↔ decimal
        // -------------------------
        if (difficulty === 2) {
            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            const toDecimal = Math.random() < 0.5;

            if (toDecimal) {
                const correct = pair.decimal;

                const optionsSet = new Set<string>([correct]);

                while (optionsSet.size < 4) {
                    const p = pairs[Math.floor(Math.random() * pairs.length)];

                    const wrong = Math.random() < 0.5
                        ? p.decimal
                        : toLatexFraction(p.numer, p.denom);

                    optionsSet.add(wrong);
                }

                return {
                    latex: `\\text{Write } ${toLatexFraction(pair.numer, pair.denom)} \\text{ as a decimal.}`,
                    answer: correct,
                    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                    forceOption: 0,
                };
            } else {
                const correct = toLatexFraction(pair.numer, pair.denom);

                const optionsSet = new Set<string>([correct]);

                while (optionsSet.size < 4) {
                    const p = pairs[Math.floor(Math.random() * pairs.length)];

                    const wrong = Math.random() < 0.5
                        ? toLatexFraction(p.numer, p.denom)
                        : p.decimal;

                    optionsSet.add(wrong);
                }

                return {
                    latex: `\\text{Write } ${pair.decimal} \\text{ as a fraction in its simplest form.}`,
                    answer: correct,
                    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                    forceOption: 0,
                };
            }
        }

        // -------------------------
        // D3: ordering
        // -------------------------
        if (difficulty === 3) {
            const shuffled = [...pairs].sort(() => Math.random() - 0.5).slice(0, 4);
            const isAscending = Math.random() < 0.5;

            const sorted = [...shuffled].sort((a, b) =>
                isAscending
                    ? parseFloat(a.decimal) - parseFloat(b.decimal)
                    : parseFloat(b.decimal) - parseFloat(a.decimal)
            );

            const display = shuffled.map((p, i) =>
                i % 2 === 0
                    ? toLatexFraction(p.numer, p.denom)
                    : p.decimal
            ).join(", ");

            const correct = sorted.map(p => p.decimal).join(",");

            const optionsSet = new Set<string>([correct]);

            while (optionsSet.size < 4) {
                const mix = [...pairs].sort(() => Math.random() - 0.5).slice(0, 4);
                const wrong = mix.map(p => p.decimal).join(",");
                optionsSet.add(wrong);
            }

            return {
                latex: `\\text{Sort in ${isAscending ? "ascending" : "descending"} order: } ${display}\\\\\\text{(answer as decimals separated by commas)}`,
                answer: correct,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -------------------------
        // D4: hundredths
        // -------------------------
        const numer = Math.floor(Math.random() * 99) + 1;
        const decimal = (numer / 100).toFixed(2);
        const toDecimal = Math.random() < 0.5;

        if (toDecimal) {
            const correct = decimal;

            const optionsSet = new Set<string>([correct]);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 99) + 1;
                optionsSet.add((n / 100).toFixed(2));
            }

            return {
                latex: `\\text{Write } ${toLatexFraction(numer, 100)} \\text{ as a decimal.}`,
                answer: correct,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        } else {
            const correct = toLatexFraction(numer, 100);

            const optionsSet = new Set<string>([correct]);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 99) + 1;
                optionsSet.add(toLatexFraction(n, 100));
            }

            return {
                latex: `\\text{Write } ${decimal} \\text{ as a fraction out of 100 (e.g. } \\frac{a}{100} \\text{).}`,
                answer: correct,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

    }, [1, 2, 3, 4]),

    "basic-percentages": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Understand what a percentage means (out of 100)
            const percent = [10, 20, 25, 50, 75, 100][Math.floor(Math.random() * 6)];

            const correct = `\\frac{${percent}}{100}`;

            const candidates = [10, 20, 25, 50, 75, 100];

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            // add plausible distractors
            while (optionsSet.size < 4) {
                const wrong = candidates[Math.floor(Math.random() * candidates.length)];
                optionsSet.add(`\\frac{${wrong}}{100}`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{What is } ${percent}\\% \\text{ as a fraction out of 100? (e.g. a/100)}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Find a simple percentage of a number (multiples of 10 or 25/50)
            const percents = [10, 20, 25, 50];
            const percent = percents[Math.floor(Math.random() * percents.length)];

            const multiples: Record<number, number[]> = {
                10:  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 200],
                20:  [10, 15, 20, 25, 30, 40, 50, 60, 80, 100],
                25:  [4, 8, 12, 16, 20, 40, 60, 80, 100, 200],
                50:  [2, 4, 6, 8, 10, 20, 30, 40, 50, 100],
            };

            const validNums = multiples[percent];
            const num = validNums[Math.floor(Math.random() * validNums.length)];
            const answer = (percent / 100) * num;

            return {
                latex: `\\text{Find } ${percent}\\% \\text{ of } ${num}`,
                answer: answer.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {

            const commonValues = [
                { percent: 10, fraction: [1, 10], decimal: "0.1" },
                { percent: 20, fraction: [1, 5], decimal: "0.2" },
                { percent: 25, fraction: [1, 4], decimal: "0.25" },
                { percent: 50, fraction: [1, 2], decimal: "0.5" },
                { percent: 75, fraction: [3, 4], decimal: "0.75" },
            ];

            const toLatexFraction = (n: number, d: number) =>
                `\\frac{${n}}{${d}}`;

            const val = commonValues[Math.floor(Math.random() * commonValues.length)];
            const type = Math.floor(Math.random() * 3); // 0 frac→%, 1 dec→%, 2 %→frac

            let latex = "";
            let answer = "";

            const optionsSet = new Set<string>();

            // -----------------------------
            // CASE 1: fraction → %
            // -----------------------------
            if (type === 0) {

                latex = `\\text{Write } ${toLatexFraction(val.fraction[0], val.fraction[1])} \\text{ as a percentage.}`;
                answer = `${val.percent}%`;

                optionsSet.add(answer);

                const offsets = [-10, -5, 5, 10];
                for (const o of offsets) {
                    optionsSet.add(`${Math.max(0, val.percent + o)}%`);
                }
            }

            // -----------------------------
            // CASE 2: decimal → %
            // -----------------------------
            else if (type === 1) {

                latex = `\\text{Write } ${val.decimal} \\text{ as a percentage.}`;
                answer = `${val.percent}%`;

                optionsSet.add(answer);

                const offsets = [-0.2, -0.1, 0.1, 0.2];
                for (const o of offsets) {
                    const wrong = Math.max(0, Number(val.decimal) + o);
                    optionsSet.add(`${Math.round(wrong * 100)}%`);
                }
            }

            // -----------------------------
            // CASE 3: % → fraction
            // -----------------------------
            else {

                const correct = toLatexFraction(val.fraction[0], val.fraction[1]);

                latex = `\\text{Write } ${val.percent}\\% \\text{ as a fraction in simplest form.}`;
                answer = correct;

                optionsSet.add(correct);

                const distractors = [
                    toLatexFraction(2, 4),
                    toLatexFraction(3, 6),
                    toLatexFraction(4, 8),
                    toLatexFraction(1, 3),
                    toLatexFraction(2, 5),
                    toLatexFraction(3, 5),
                    toLatexFraction(val.fraction[0] + 1, val.fraction[1]),
                    toLatexFraction(val.fraction[0], val.fraction[1] + 1),
                ];

                for (const d of distractors) {
                    optionsSet.add(d);
                }
            }

            const options = Array.from(optionsSet)
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        // difficulty === 4: Find a percentage of a number (less common percents: 5, 15, 30, 40, 60)
        const percents4 = [5, 15, 30, 40, 60];
        const percent = percents4[Math.floor(Math.random() * percents4.length)];

        // Build numbers that give clean answers
        const factor = 100 / (percent % 10 === 0 ? 10 : 20);
        const multiplier = Math.floor(Math.random() * 9) + 1;
        const num = factor * multiplier * (percent <= 10 ? 4 : 2);
        const answer = Math.round((percent / 100) * num);

        return {
            latex: `\\text{Find } ${percent}\\% \\text{ of } ${num}`,
            answer: answer.toString(),
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),
    "length-mass-volume-time": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: LENGTH ----------
        if (difficulty === 1) {
            const conversions = [
                { from: "mm", to: "cm", factor: 0.1 },
                { from: "cm", to: "mm", factor: 10 },
                { from: "cm", to: "m", factor: 0.01 },
                { from: "m", to: "cm", factor: 100 },
                { from: "m", to: "km", factor: 0.001 },
                { from: "km", to: "m", factor: 1000 },
            ];

            const c = conversions[Math.floor(Math.random() * conversions.length)];
            const value = Math.floor(Math.random() * 100) + 1;

            const correctValue = Number((value * c.factor).toFixed(2));
            const unit = c.to;

            const optionsSet = new Set<number>();
            optionsSet.add(correctValue);

            while (optionsSet.size < 4) {
                const type = Math.floor(Math.random() * 3);
                let wrong;

                if (type === 0) wrong = correctValue + (Math.floor(Math.random() * 5) - 2);
                else if (type === 1) wrong = Math.random() < 0.5 ? correctValue * 10 : correctValue / 10;
                else wrong = correctValue + (Math.floor(Math.random() * 20) - 10);

                if (wrong !== correctValue && Number.isFinite(wrong)) {
                    optionsSet.add(Number(wrong.toFixed(2)));
                }
            }

            const options = Array.from(optionsSet)
                .map(x => `${x}${unit}`)
                .sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Convert } ${value}${c.from} \\text{ to } ${c.to}`,
                answer: `${correctValue}${unit}`,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: MASS ----------
        if (difficulty === 2) {
            const conversions = [
                { from: "g", to: "kg", factor: 0.001 },
                { from: "kg", to: "g", factor: 1000 },
            ];

            const c = conversions[Math.floor(Math.random() * conversions.length)];
            const value = Math.floor(Math.random() * 1000) + 1;

            const correctValue = Number((value * c.factor).toFixed(3));
            const unit = c.to;

            const optionsSet = new Set<number>();
            optionsSet.add(correctValue);

            while (optionsSet.size < 4) {
                const type = Math.floor(Math.random() * 3);
                let wrong;

                if (type === 0) wrong = correctValue + (Math.floor(Math.random() * 5) - 2);
                else if (type === 1) wrong = Math.random() < 0.5 ? correctValue * 10 : correctValue / 10;
                else wrong = correctValue + (Math.floor(Math.random() * 20) - 10);

                if (wrong !== correctValue && Number.isFinite(wrong)) {
                    optionsSet.add(Number(wrong.toFixed(3)));
                }
            }

            const options = Array.from(optionsSet)
                .map(x => `${x}${unit}`)
                .sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Convert } ${value}${c.from} \\text{ to } ${c.to}`,
                answer: `${correctValue}${unit}`,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 3: 12h ↔ 24h ----------
        if (difficulty === 3) {

            if (Math.random() < 0.5) {
                // 12 → 24
                const hour = Math.floor(Math.random() * 12) + 1;
                const minute = Math.floor(Math.random() * 60);
                const isPM = Math.random() < 0.5;

                const minStr = minute.toString().padStart(2, "0");

                let h24 = hour % 12;
                if (isPM) h24 += 12;

                const correct = `${h24.toString().padStart(2, "0")}:${minStr}`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    let nh = (h24 + (Math.floor(Math.random() * 3) - 1) + 24) % 24;
                    let nm = minute + (Math.floor(Math.random() * 3) - 1) * 5;

                    if (nm < 0) { nm += 60; nh = (nh - 1 + 24) % 24; }
                    if (nm >= 60) { nm -= 60; nh = (nh + 1) % 24; }

                    const wrong = `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
                    if (wrong !== correct) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } ${hour}:${minStr} ${isPM ? "PM" : "AM"} \\text{ to 24-hour time}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };

            } else {
                // 24 → 12
                const h24 = Math.floor(Math.random() * 24);
                const minute = Math.floor(Math.random() * 60);

                const minStr = minute.toString().padStart(2, "0");

                const isPM = h24 >= 12;
                let h12 = h24 % 12;
                if (h12 === 0) h12 = 12;

                const correct = `${h12}:${minStr} ${isPM ? "PM" : "AM"}`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const h = Math.floor(Math.random() * 12) + 1;
                    const m = Math.floor(Math.random() * 60);
                    const pm = Math.random() < 0.5;

                    const wrong = `${h}:${m.toString().padStart(2, "0")} ${pm ? "PM" : "AM"}`;
                    if (wrong !== correct) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } ${h24.toString().padStart(2, "0")}:${minStr} \\text{ to 12-hour time}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 4: ADD TIME ----------
        if (difficulty === 4) {
            const hour = Math.floor(Math.random() * 24);
            const minute = Math.floor(Math.random() * 60);

            const addH = Math.floor(Math.random() * 5);
            const addM = Math.floor(Math.random() * 60);

            let total = hour * 60 + minute + addH * 60 + addM;
            total %= (24 * 60);

            const h = Math.floor(total / 60);
            const m = total % 60;

            const correct = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let nh = (h + (Math.floor(Math.random() * 3) - 1) + 24) % 24;
                let nm = m + (Math.floor(Math.random() * 3) - 1) * 5;

                if (nm < 0) { nm += 60; nh = (nh - 1 + 24) % 24; }
                if (nm >= 60) { nm -= 60; nh = (nh + 1) % 24; }

                const wrong = `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
                if (wrong !== correct) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
            const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

            return {
                latex: `\\text{What time will it be } ${addH}\\text{ hours and } ${addM}\\text{ minutes after } ${startTime}?`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 5: VOLUME ----------
        const l = Math.floor(Math.random() * 10) + 1;
        const w = Math.floor(Math.random() * 10) + 1;
        const h = Math.floor(Math.random() * 10) + 1;

        const correctValue = l * w * h;
        const unit = "cm^3";

        const optionsSet = new Set<number>();
        optionsSet.add(correctValue);

        while (optionsSet.size < 4) {
            const type = Math.floor(Math.random() * 3);
            let wrong;

            if (type === 0) wrong = l * w + h;
            else if (type === 1) wrong = l + w + h;
            else wrong = correctValue + (Math.floor(Math.random() * 20) - 10);

            if (wrong !== correctValue) optionsSet.add(wrong);
        }

        const options = Array.from(optionsSet)
            .map(x => `${x}${unit}`)
            .sort(() => Math.random() - 0.5);

        return {
            latex: `\\text{Find the volume of a cuboid with dimensions } ${l}cm, ${w}cm, ${h}cm`,
            answer: `${correctValue}${unit}`,
            options,
            forceOption: 0,
        };


    }, [1, 2, 3, 4, 5]),
    "units": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: CHOOSE SENSIBLE UNIT ----------
        if (difficulty === 1) {
            const questions = [
                // --- LENGTH ---
                {
                    latex: `\\text{Which is the most sensible unit to measure the length of a pencil?}`,
                    correct: "cm",
                    options: ["mm", "cm", "m", "km"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the height of a person?}`,
                    correct: "m",
                    options: ["mm", "cm", "m", "km"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the length of a football pitch?}`,
                    correct: "m",
                    options: ["cm", "m", "km", "mm"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the distance between two cities?}`,
                    correct: "km",
                    options: ["m", "cm", "mm", "km"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the thickness of a coin?}`,
                    correct: "mm",
                    options: ["mm", "cm", "m", "km"],
                },

                // --- MASS ---
                {
                    latex: `\\text{Which is the most sensible unit to measure the mass of a person?}`,
                    correct: "kg",
                    options: ["g", "kg", "mg", "tonnes"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the mass of a bag of sugar?}`,
                    correct: "kg",
                    options: ["mg", "g", "kg", "tonnes"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the mass of a paperclip?}`,
                    correct: "g",
                    options: ["mg", "g", "kg", "tonnes"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the mass of a lorry?}`,
                    correct: "tonnes",
                    options: ["g", "kg", "mg", "tonnes"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the mass of a tablet?}`,
                    correct: "mg",
                    options: ["mg", "g", "kg", "tonnes"],
                },

                // --- VOLUME ---
                {
                    latex: `\\text{Which is the most sensible unit to measure the volume of a drink?}`,
                    correct: "ml",
                    options: ["ml", "litres", "cm^3", "m^3"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the capacity of a water bottle?}`,
                    correct: "litres",
                    options: ["ml", "litres", "m^3", "cm^3"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the volume of a swimming pool?}`,
                    correct: "m^3",
                    options: ["ml", "litres", "cm^3", "m^3"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the volume of a small cube?}`,
                    correct: "cm^3",
                    options: ["ml", "litres", "cm^3", "m^3"],
                },

                // --- TIME ---
                {
                    latex: `\\text{Which is the most sensible unit to measure a journey time?}`,
                    correct: "hours",
                    options: ["seconds", "minutes", "hours", "milliseconds"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure how long a lesson lasts?}`,
                    correct: "minutes",
                    options: ["seconds", "minutes", "hours", "days"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure how long it takes to blink?}`,
                    correct: "seconds",
                    options: ["seconds", "minutes", "hours", "days"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure how long a movie lasts?}`,
                    correct: "hours",
                    options: ["seconds", "minutes", "hours", "milliseconds"],
                },

                // --- MONEY ---
                {
                    latex: `\\text{Which is the most sensible unit to measure the price of a chocolate bar?}`,
                    correct: ["£", "$", "€", "¥"],
                    options: ["mm", "£", "kg", "cm"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the price of a car?}`,
                    correct: ["£", "$", "€", "¥"],
                    options: ["mm", "£", "kg", "m"],
                },
                {
                    latex: `\\text{Which is the most sensible unit to measure the cost of a table?}`,
                    correct: ["£", "$", "€", "¥"],
                    options: ["mm", "£", "kg", "cm"],
                },
            ];

            const q = questions[Math.floor(Math.random() * questions.length)];

            const options = [...q.options].sort(() => Math.random() - 0.5);

            return {
                latex: q.latex,
                answer: q.correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: SIMPLE CONVERSIONS ----------
        if (difficulty === 2) {
            const conversions = [
                { from: "cm", to: "m", factor: 0.01 },
                { from: "m", to: "cm", factor: 100 },
                { from: "g", to: "kg", factor: 0.001 },
                { from: "kg", to: "g", factor: 1000 },
            ];

            const c = conversions[Math.floor(Math.random() * conversions.length)];
            const value = Math.floor(Math.random() * 100) + 1;

            const correctValue = Number((value * c.factor).toFixed(2));
            const correct = `${correctValue}${c.to}`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let wrongVal;

                const type = Math.floor(Math.random() * 3);

                if (type === 0) wrongVal = correctValue * 10;
                else if (type === 1) wrongVal = correctValue / 10;
                else wrongVal = correctValue + (Math.floor(Math.random() * 10) - 5);

                const wrong = `${Number(wrongVal.toFixed(2))}${c.to}`;
                if (wrong !== correct) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Convert } ${value}${c.from} \\text{ to } ${c.to}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 3: MONEY ----------
        if (difficulty === 3) {
            const pounds = Math.floor(Math.random() * 20) + 1;
            const pence = Math.floor(Math.random() * 100);

            if (Math.random() < 0.5) {
                // £ → p
                const total = pounds * 100 + pence;
                const correct = `${total}p`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrong = total + (Math.floor(Math.random() * 50) - 25);
                    const str = `${wrong}p`;
                    if (str !== correct) optionsSet.add(str);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } £${pounds}.${pence.toString().padStart(2,"0")} \\text{ to pence}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };

            } else {
                // p → £
                const total = Math.floor(Math.random() * 2000) + 1;

                const correct = `£${(total / 100).toFixed(2)}`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrong = total + (Math.floor(Math.random() * 50) - 25);
                    const str = `£${(wrong / 100).toFixed(2)}`;
                    if (str !== correct) optionsSet.add(str);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } ${total}p \\text{ to pounds}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 4: MULTI-STEP / MIXED ----------
        if (difficulty === 4) {
            if (Math.random() < 0.5) {
                // litres → millilitres
                const value = Math.floor(Math.random() * 5) + 1;

                const correctValue = value * 1000;
                const correct = `${correctValue}ml`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    let wrongVal;

                    const type = Math.floor(Math.random() * 3);

                    if (type === 0) wrongVal = correctValue * 10;
                    else if (type === 1) wrongVal = correctValue / 10;
                    else wrongVal = correctValue + (Math.floor(Math.random() * 500) - 250);

                    const wrong = `${Math.round(wrongVal)}ml`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } ${value}\\text{ litres to millilitres}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };

            } else {
                // millilitres → litres
                const value = (Math.floor(Math.random() * 5) + 1) * 1000;

                const correctValue = value / 1000;
                const correct = `${correctValue}litres`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    let wrongVal;

                    const type = Math.floor(Math.random() * 3);

                    if (type === 0) wrongVal = correctValue * 10;
                    else if (type === 1) wrongVal = correctValue / 10;
                    else wrongVal = correctValue + (Math.floor(Math.random() * 5) - 2);

                    const wrong = `${Number(wrongVal.toFixed(2))}litres`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Convert } ${value}\\text{ ml to litres}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }


        const units = [
            { name: "m", toMeters: 1 },
            { name: "km", toMeters: 1000 },
            { name: "miles", toMeters: 1600 }, // using 1 mile ≈ 1600 m
        ];

        // pick different units
        const from = units[Math.floor(Math.random() * units.length)];
        let to = units[Math.floor(Math.random() * units.length)];

        while (to.name === from.name) {
            to = units[Math.floor(Math.random() * units.length)];
        }

        // generate value (avoid awkward decimals for miles)
        let value;
        if (from.name === "m") value = Math.floor(Math.random() * 5000) + 100;
        else if (from.name === "km") value = Math.floor(Math.random() * 10) + 1;
        else value = Math.floor(Math.random() * 5) + 1; // miles

        // convert → meters → target
        const valueInMeters = value * from.toMeters;
        const correctValueRaw = valueInMeters / to.toMeters;

        // clean formatting
        const correctValue = Number(correctValueRaw.toFixed(2));
        const correct = `${correctValue}${to.name}`;

        // distractors
        const optionsSet = new Set<string>();
        optionsSet.add(correct);

        while (optionsSet.size < 4) {
            let wrongVal;

            const type = Math.floor(Math.random() * 3);

            if (type === 0) wrongVal = correctValue * 10;
            else if (type === 1) wrongVal = correctValue / 10;
            else wrongVal = correctValue + (Math.random() * 4 - 2);

            const rounded = Number(wrongVal.toFixed(2));

            if (rounded > 0) {
                const wrong = `${rounded}${to.name}`;
                if (wrong !== correct) optionsSet.add(wrong);
            }
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        // build latex (include mile info if needed)
        let latex;

        if (from.name === "miles" || to.name === "miles") {
            latex = `\\text{1 mile} = 1.600\\text{ km. } \\text{Convert } ${value}\\text{ ${from.name} to ${to.name}}`;
        } else {
            latex = `\\text{Convert } ${value}\\text{ ${from.name} to ${to.name}}`;
        }

        return {
            latex,
            answer: correct,
            options,
            forceOption: 0,
        };


    }, [1, 2, 3, 4, 5]),
    "reading-clocks": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: ANALOGUE CLOCK → DIGITAL ----------
        if (difficulty === 1) {

            const hour = Math.floor(Math.random() * 12) + 1;
            const minute = Math.floor(Math.random() * 12) * 5;

            const minuteAngle = (minute / 60) * 360;
            const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

            const correct = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;

            const svg = `
            <svg width="200" height="200" viewBox="0 0 100 100">

                <!-- clock face -->
                <circle cx="50" cy="50" r="40" stroke="black" fill="none"/>

                <!-- hour numbers -->
                ${Array.from({ length: 12 }, (_, i) => {
                    const angle = ((i + 1) / 12) * 2 * Math.PI;
                    const x = 50 + 32 * Math.sin(angle);
                    const y = 50 - 32 * Math.cos(angle);
                    return `<text x="${x}" y="${y}" font-size="6" text-anchor="middle" dominant-baseline="middle">
                                ${i + 1}
                            </text>`;
                }).join("")}

                <!-- hour hand -->
                <line x1="50" y1="50"
                    x2="${50 + 18 * Math.sin((Math.PI * hourAngle) / 180)}"
                    y2="${50 - 18 * Math.cos((Math.PI * hourAngle) / 180)}"
                    stroke="black"/>

                <!-- minute hand -->
                <line x1="50" y1="50"
                    x2="${50 + 28 * Math.sin((Math.PI * minuteAngle) / 180)}"
                    y2="${50 - 28 * Math.cos((Math.PI * minuteAngle) / 180)}"
                    stroke="black"/>

                <!-- centre dot -->
                <circle cx="50" cy="50" r="2" fill="black"/>

            </svg>`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const h = Math.floor(Math.random() * 12) + 1;
                const m = Math.floor(Math.random() * 12) * 5;

                const wrong = `${h.toString().padStart(2, "0")}:${m
                    .toString()
                    .padStart(2, "0")}`;

                if (wrong !== correct) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{What time is shown on the clock?}`,
                svg,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: WORDS → DIGITAL TIME ----------
        if (difficulty === 2) {

            const hour = Math.floor(Math.random() * 12) + 1;
            const minute = Math.floor(Math.random() * 12) * 5;

            let text;

            if (minute === 0) {
                text = `${hour} \\ o'clock`;
            } else if (minute === 15) {
                text = `quarter \\ past \\ ${hour}`;
            } else if (minute === 30) {
                text = `half \\ past \\ ${hour}`;
            } else if (minute === 45) {
                text = `quarter \\ to \\ ${hour === 12 ? 1 : hour + 1}`;
            } else if (minute < 30) {
                text = `${minute} \\ past \\ ${hour}`;
            } else {
                text = `${60 - minute} \\ to \\ ${hour === 12 ? 1 : hour + 1}`;
            }

            const correct = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const h = Math.floor(Math.random() * 12) + 1;
                const m = Math.floor(Math.random() * 12) * 5;

                const wrong = `${h.toString().padStart(2, "0")}:${m
                    .toString()
                    .padStart(2, "0")}`;

                if (wrong !== correct) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Write the time } "${text}" \\text{ in digital format}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2]),
    "money-calculations": createGenerator(({ difficulty }) => {
        // helper inline formatter (no function, just reuse pattern)
        const format = (v: number) => `£${v.toFixed(2)}`;

        // ---------- DIFFICULTY 1: ADD SIMPLE AMOUNTS ----------
        if (difficulty === 1) {
            const a = (Math.floor(Math.random() * 500) + 50) / 100;
            const b = (Math.floor(Math.random() * 500) + 50) / 100;

            const correctValue = a + b;
            const correct = format(correctValue);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let wrong;

                const type = Math.floor(Math.random() * 3);

                if (type === 0) wrong = correctValue + 1;
                else if (type === 1) wrong = correctValue - 1;
                else wrong = correctValue + (Math.random() - 0.5);

                const val = Number(wrong.toFixed(2));
                if (val > 0) optionsSet.add(format(val));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{What is } £${a.toFixed(2)} + £${b.toFixed(2)}?`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: MONEY - SUBTRACTION & CHANGE ----------
        if (difficulty === 2) {

            const format = (v: number) => `£${v.toFixed(2)}`;

            const type = Math.random() < 0.5 ? "left" : "change";

            // ---------- CASE 1: MONEY LEFT ----------
            if (type === "left") {
                const total = (Math.floor(Math.random() * 1000) + 200) / 100;
                const spend = (Math.floor(Math.random() * (total * 100 - 50)) + 50) / 100;

                const correctValue = total - spend;
                const correct = format(correctValue);

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    let wrong;

                    const t = Math.floor(Math.random() * 3);

                    if (t === 0) wrong = correctValue + 1;
                    else if (t === 1) wrong = correctValue - 1;
                    else wrong = correctValue + (Math.random() - 0.5);

                    const val = Number(wrong.toFixed(2));
                    if (val > 0) optionsSet.add(format(val));
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{You have } £${total.toFixed(2)} \\text{ and spend } £${spend.toFixed(2)}. \\text{ How much is left?}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }

            // ---------- CASE 2: FIND CHANGE ----------
            const cost = (Math.floor(Math.random() * 800) + 50) / 100;

            const paidOptions = [1, 2, 5, 10, 20];
            const paid = paidOptions.find(p => p > cost) || 10;

            const correctValue = paid - cost;
            const correct = format(correctValue);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let wrong;

                const t = Math.floor(Math.random() * 3);

                if (t === 0) wrong = correctValue + 1;
                else if (t === 1) wrong = correctValue - 1;
                else wrong = correctValue + (Math.random() - 0.5);

                const val = Number(wrong.toFixed(2));
                if (val >= 0) optionsSet.add(format(val));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{An item costs } £${cost.toFixed(2)} \\text{ and you pay } £${paid}. \\text{ How much change do you get?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 3: MULTI-ITEM TOTAL ----------
        if (difficulty === 3) {
            const a = (Math.floor(Math.random() * 400) + 50) / 100;
            const b = (Math.floor(Math.random() * 400) + 50) / 100;
            const c = (Math.floor(Math.random() * 400) + 50) / 100;

            const correctValue = a + b + c;
            const correct = format(correctValue);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let wrong;

                const type = Math.floor(Math.random() * 3);

                if (type === 0) wrong = correctValue + 1;
                else if (type === 1) wrong = correctValue - 1;
                else wrong = correctValue + (Math.random() - 0.5);

                const val = Number(wrong.toFixed(2));
                if (val > 0) optionsSet.add(format(val));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{A sandwich costs } £${a.toFixed(2)}, \\text{ a drink } £${b.toFixed(2)}, \\text{ and a snack } £${c.toFixed(2)}. \\text{ What is the total cost?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 4: MULTI-STEP CHANGE ----------
        if (difficulty === 4) {
            const a = (Math.floor(Math.random() * 400) + 50) / 100;
            const b = (Math.floor(Math.random() * 400) + 50) / 100;

            const total = a + b;
            const paidOptions = [5, 10, 20];

            const paid = paidOptions.find(p => p > total) || 10;

            const correctValue = paid - total;
            const correct = format(correctValue);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                let wrong;

                const type = Math.floor(Math.random() * 3);

                if (type === 0) wrong = correctValue + 1;
                else if (type === 1) wrong = correctValue - 1;
                else wrong = correctValue + (Math.random() - 0.5);

                const val = Number(wrong.toFixed(2));
                if (val >= 0) optionsSet.add(format(val));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{You buy items costing } £${a.toFixed(2)} \\text{ and } £${b.toFixed(2)}. \\text{ You pay } £${paid}. \\text{ How much change do you get?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "perimeter-and-area": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: PERIMETER (SQUARE/RECTANGLE) ----------
        if (difficulty === 1) {
            const isSquare = Math.random() < 0.5;

            if (isSquare) {
                const side = Math.floor(Math.random() * 10) + 1;
                const correct = `${4 * side}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = (4 * side) + (Math.floor(Math.random() * 10) - 5);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Find the perimeter of a square with side } ${side}cm`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            } else {
                const l = Math.floor(Math.random() * 10) + 1;
                const w = Math.floor(Math.random() * 10) + 1;

                const correct = `${2 * (l + w)}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = 2 * (l + w) + (Math.floor(Math.random() * 10) - 5);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Find the perimeter of a rectangle with length } ${l}cm \\text{ and width } ${w}cm`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 2: AREA (SQUARE/RECTANGLE) ----------
        if (difficulty === 2) {
            const isSquare = Math.random() < 0.5;

            if (isSquare) {
                const side = Math.floor(Math.random() * 10) + 1;
                const correct = `${side * side}cm^2`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = (side * side) + (Math.floor(Math.random() * 10) - 5);
                    const wrong = `${wrongVal}cm^2`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Find the area of a square with side } ${side}cm`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            } else {
                const l = Math.floor(Math.random() * 10) + 1;
                const w = Math.floor(Math.random() * 10) + 1;

                const correct = `${l * w}cm^2`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = (l * w) + (Math.floor(Math.random() * 10) - 5);
                    const wrong = `${wrongVal}cm^2`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{Find the area of a rectangle with length } ${l}cm \\text{ and width } ${w}cm`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 3: REVERSE (FIND MISSING SIDE FROM PERIMETER) ----------
        if (difficulty === 3) {
            const isSquare = Math.random() < 0.5;

            if (isSquare) {
                const side = Math.floor(Math.random() * 10) + 1;
                const perimeter = 4 * side;

                const correct = `${side}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = side + (Math.floor(Math.random() * 5) - 2);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{A square has perimeter } ${perimeter}cm. \\text{ Find the side length.}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            } else {
                const l = Math.floor(Math.random() * 10) + 1;
                const w = Math.floor(Math.random() * 10) + 1;

                const perimeter = 2 * (l + w);

                const correct = `${l}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = l + (Math.floor(Math.random() * 5) - 2);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{A rectangle has perimeter } ${perimeter}cm \\text{ and width } ${w}cm. \\text{ Find the length.}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 4: REVERSE AREA ----------
        if (difficulty === 4) {
            const isSquare = Math.random() < 0.5;

            if (isSquare) {
                const side = Math.floor(Math.random() * 10) + 1;
                const area = side * side;

                const correct = `${side}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = side + (Math.floor(Math.random() * 5) - 2);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{A square has area } ${area}cm^2. \\text{ Find the side length.}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            } else {
                const l = Math.floor(Math.random() * 10) + 1;
                const w = Math.floor(Math.random() * 10) + 1;

                const area = l * w;

                const correct = `${l}cm`;

                const optionsSet = new Set<string>();
                optionsSet.add(correct);

                while (optionsSet.size < 4) {
                    const wrongVal = l + (Math.floor(Math.random() * 5) - 2);
                    const wrong = `${wrongVal}cm`;
                    if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex: `\\text{A rectangle has area } ${area}cm^2 \\text{ and width } ${w}cm. \\text{ Find the length.}`,
                    answer: correct,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------- DIFFICULTY 5: MIXED PROBLEM ----------
        const l = Math.floor(Math.random() * 10) + 2;
        const w = Math.floor(Math.random() * 10) + 2;

        const type = Math.random() < 0.5 ? "area" : "perimeter";

        if (type === "area") {
            const correct = `${l * w}cm^2`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrongVal = (l * w) + (Math.floor(Math.random() * 10) - 5);
                const wrong = `${wrongVal}cm^2`;
                if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find the area of a rectangle with length } ${l}cm \\text{ and width } ${w}cm`,
                answer: correct,
                options,
                forceOption: 0,
            };
        } else {
            const correct = `${2 * (l + w)}cm`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrongVal = 2 * (l + w) + (Math.floor(Math.random() * 10) - 5);
                const wrong = `${wrongVal}cm`;
                if (wrong !== correct && wrongVal > 0) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find the perimeter of a rectangle with length } ${l}cm \\text{ and width } ${w}cm`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

    }, [1, 2, 3, 4, 5]),
    "shapes-2d": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: IDENTIFY BASIC SHAPES ----------
        if (difficulty === 1) {
            const shapes = [
                {
                    name: "Triangle",
                    svg: `<svg width="100" height="100">
                            <polygon points="10,90 90,90 50,10" stroke="black" fill="none"/>
                        </svg>`
                },
                {
                    name: "Square",
                    svg: `<svg width="100" height="100">
                            <rect x="10" y="10" width="80" height="80" stroke="black" fill="none"/>
                        </svg>`
                },
                {
                    name: "Rectangle",
                    svg: `<svg width="120" height="80">
                            <rect x="10" y="10" width="100" height="60" stroke="black" fill="none"/>
                        </svg>`
                },
                {
                    name: "Pentagon",
                    svg: `<svg width="100" height="100">
                            <polygon points="50,10 90,40 70,90 30,90 10,40" stroke="black" fill="none"/>
                        </svg>`
                },
            ];

            const q = shapes[Math.floor(Math.random() * shapes.length)];

            const optionsSet = new Set<string>();
            optionsSet.add(q.name);

            const allNames = ["Triangle", "Square", "Rectangle", "Pentagon", "Hexagon"];

            while (optionsSet.size < 4) {
                const wrong = allNames[Math.floor(Math.random() * allNames.length)];
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{What shape is this?}`,
                svg: q.svg,
                answer: q.name,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: NUMBER OF SIDES ----------
        if (difficulty === 2) {
            const shapes = [
                { name: "triangle", sides: 3 },
                { name: "square", sides: 4 },
                { name: "rectangle", sides: 4 },
                { name: "pentagon", sides: 5 },
                { name: "hexagon", sides: 6 },
            ];

            const q = shapes[Math.floor(Math.random() * shapes.length)];

            const correct = `${q.sides}`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrong = Math.floor(Math.random() * 8) + 3;
                optionsSet.add(wrong.toString());
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{How many sides does a } ${q.name} \\text{ have?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 3: IDENTIFY FROM PROPERTIES ----------
        if (difficulty === 3) {
            const questions = [
                {
                    latex: `\\text{Which shape has 4 equal sides and 4 right angles?}`,
                    correct: "Square",
                },
                {
                    latex: `\\text{Which shape has 3 sides?}`,
                    correct: "Triangle",
                },
                {
                    latex: `\\text{Which shape has 5 sides?}`,
                    correct: "Pentagon",
                },
                {
                    latex: `\\text{Which shape has 6 sides?}`,
                    correct: "Hexagon",
                },
            ];

            const q = questions[Math.floor(Math.random() * questions.length)];

            const all = ["Triangle", "Square", "Rectangle", "Pentagon", "Hexagon"];

            const optionsSet = new Set<string>();
            optionsSet.add(q.correct);

            while (optionsSet.size < 4) {
                const wrong = all[Math.floor(Math.random() * all.length)];
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: q.latex,
                answer: q.correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 4: REGULAR VS IRREGULAR ----------
        const isRegular = Math.random() < 0.5;

        // ---------- REGULAR SHAPES (PREDEFINED) ----------
        const regularShapes = [
            // triangle
            `<svg width="120" height="120" viewBox="0 0 100 100">
                <polygon points="50,10 90,80 10,80"
                        stroke="black" fill="none" stroke-width="2"/>
            </svg>`,

            // square
            `<svg width="120" height="120" viewBox="0 0 100 100">
                <rect x="20" y="20" width="60" height="60"
                    stroke="black" fill="none" stroke-width="2"/>
            </svg>`,

            // pentagon
            `<svg width="120" height="120" viewBox="0 0 100 100">
                <polygon points="50,10 85,35 70,80 30,80 15,35"
                        stroke="black" fill="none" stroke-width="2"/>
            </svg>`,

            // hexagon
            `<svg width="120" height="120" viewBox="0 0 100 100">
                <polygon points="30,10 70,10 90,50 70,90 30,90 10,50"
                        stroke="black" fill="none" stroke-width="2"/>
            </svg>`
        ];

        // ---------- IRREGULAR SHAPE (RANDOM GENERATION) ----------
        let svg: string;

        if (isRegular) {
            svg = regularShapes[Math.floor(Math.random() * regularShapes.length)];
        } else {
            const sides = Math.floor(Math.random() * 3) + 5; // 5–7

            const cx = 50;
            const cy = 50;
            const baseRadius = 35;

            const points: string[] = [];

            // generate sorted angles with spacing
            const angles: number[] = [];

            for (let i = 0; i < sides; i++) {
                angles.push((i / sides) * 2 * Math.PI);
            }

            // add small jitter (prevents perfect regularity)
            for (let i = 0; i < angles.length; i++) {
                angles[i] += (Math.random() - 0.5) * (Math.PI / sides * 0.5);
            }

            // sort again to maintain order
            angles.sort((a, b) => a - b);

            for (let i = 0; i < sides; i++) {
                // controlled radius variation (prevents sharp spikes)
                const radius = baseRadius + (Math.random() - 0.5) * 10;

                const x = cx + radius * Math.cos(angles[i]);
                const y = cy + radius * Math.sin(angles[i]);

                points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }

            svg = `<svg width="120" height="120" viewBox="0 0 100 100">
                <polygon points="${points.join(" ")}"
                        stroke="black" fill="none" stroke-width="2"/>
            </svg>`;
        }

        const correct = isRegular ? "regular" : "irregular";

        const options = ["Regular", "Irregular",]
            .sort(() => Math.random() - 0.5);

        return {
            latex: `\\text{Is this shape regular or irregular?}`,
            svg,
            answer: correct,
            options,
            forceOption: 0,
        };
        
    }, [1, 2, 3, 4]),
    "shapes-3d": createGenerator(({ difficulty }) => {

        const shapes = [
            {
                name: "cube",
                edges: 12,
                vertices: 8,
                svg: `<svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="20" y="30" width="40" height="40" stroke="black" fill="none"/>
                    <rect x="35" y="15" width="40" height="40" stroke="black" fill="none"/>
                    <line x1="20" y1="30" x2="35" y2="15" stroke="black"/>
                    <line x1="60" y1="30" x2="75" y2="15" stroke="black"/>
                    <line x1="20" y1="70" x2="35" y2="55" stroke="black"/>
                    <line x1="60" y1="70" x2="75" y2="55" stroke="black"/>
                </svg>`
            },
            {
                name: "cuboid",
                edges: 12,
                vertices: 8,
                svg: `<svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="15" y="35" width="50" height="30" stroke="black" fill="none"/>
                    <rect x="30" y="20" width="50" height="30" stroke="black" fill="none"/>
                    <line x1="15" y1="35" x2="30" y2="20" stroke="black"/>
                    <line x1="65" y1="35" x2="80" y2="20" stroke="black"/>
                    <line x1="15" y1="65" x2="30" y2="50" stroke="black"/>
                    <line x1="65" y1="65" x2="80" y2="50" stroke="black"/>
                </svg>`
            },
            {
                name: "pyramid",
                edges: 8,
                vertices: 5,
                svg: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 90H96L78 66H42L24 90Z" stroke="black" stroke-dasharray="1.5 1.5"/>
                    <path d="M24 90L60 18" stroke="black" stroke-width="1.2"/>
                    <path d="M96 90L60 18" stroke="black" stroke-width="1.2"/>
                    <path d="M78 66L60 18" stroke="black" stroke-dasharray="1.5 1.5"/>
                    <path d="M42 66L60 18" stroke="black" stroke-dasharray="1.5 1.5"/>
                    <path d="M24 90H96" stroke="black"/>
                </svg>`
            },
            {
                name: "cylinder",
                edges: 2,
                vertices: 0,
                svg: `<svg width="120" height="120" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="25" rx="25" ry="10" stroke="black" fill="none"/>
                    <ellipse cx="50" cy="75" rx="25" ry="10" stroke="black" fill="none"/>
                    <line x1="25" y1="25" x2="25" y2="75" stroke="black"/>
                    <line x1="75" y1="25" x2="75" y2="75" stroke="black"/>
                </svg>`
            },
            {
                name: "cone",
                edges: 1,
                vertices: 1,
                svg: `<svg width="120" height="120" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="75" rx="25" ry="10" stroke="black" fill="none"/>
                    <line x1="25" y1="75" x2="50" y2="20" stroke="black"/>
                    <line x1="75" y1="75" x2="50" y2="20" stroke="black"/>
                </svg>`
            },
            {
                name: "sphere",
                edges: 0,
                vertices: 0,
                svg: `<svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" stroke="black" fill="none"/>
                    <ellipse cx="50" cy="50" rx="30" ry="10" stroke="black" fill="none"/>
                </svg>`
            }
        ];

        const q = shapes[Math.floor(Math.random() * shapes.length)];

        // ---------- DIFFICULTY 1: NAME SHAPE ----------
        if (difficulty === 1) {
            const allNames = shapes.map(s => s.name);

            const optionsSet = new Set<string>();
            optionsSet.add(q.name);

            while (optionsSet.size < 4) {
                const wrong = allNames[Math.floor(Math.random() * allNames.length)];
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{What 3D shape is this?}`,
                svg: q.svg,
                answer: q.name,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: EDGES OR VERTICES ----------
        const askEdges = Math.random() < 0.5;

        const correctValue = askEdges ? q.edges : q.vertices;
        const correct = correctValue.toString();

        const optionsSet = new Set<string>();
        optionsSet.add(correct);

        while (optionsSet.size < 4) {
            const wrong = Math.floor(Math.random() * 15);
            optionsSet.add(wrong.toString());
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        return {
            latex: askEdges
                ? `\\text{How many edges does this shape have?}`
                : `\\text{How many corners (vertices) does this shape have?}`,
            svg: q.svg,
            answer: correct,
            options,
            forceOption: 0,
        };

    }, [1, 2]),
    "symmetry": createGenerator(({ difficulty }) => {
        if (difficulty !== 1) {
            throw new Error("Unhandled difficulty: symmetry only supports difficulty 1");
        }

        const shapes = [
            {
                name: "square",
                svg: `
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="25" y="25" width="50" height="50" stroke="black" fill="none"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="black" stroke-dasharray="4"/>
                </svg>`
            },
            {
                name: "rectangle",
                svg: `
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="20" y="30" width="60" height="40" stroke="black" fill="none"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="black" stroke-dasharray="4"/>
                </svg>`
            },
            {
                name: "triangle_sym",
                svg: `
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <polygon points="50,15 20,80 80,80" stroke="black" fill="none"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="black" stroke-dasharray="4"/>
                </svg>`
            },
            {
                name: "triangle_asym",
                svg: `
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <polygon points="50,15 25,80 85,70" stroke="black" fill="none"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="black" stroke-dasharray="4"/>
                </svg>`
            },
            {
                name: "irregular_asym",
                svg: `
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <polygon points="20,20 80,25 70,80 30,75" stroke="black" fill="none"/>
                    <line x1="50" y1="10" x2="50" y2="90" stroke="black" stroke-dasharray="4"/>
                </svg>`
            }
        ];

        const q = shapes[Math.floor(Math.random() * shapes.length)];

        const correct = q.name.includes("sym") ? "not symmetrical" : "symmetrical";

        const optionsSet = new Set<string>();
        optionsSet.add(correct);

        const pool = ["Symmetrical", "Not Symmetrical"];
        const options = Array.from(pool).sort(() => Math.random() - 0.5);

        return {
            latex: `\\text{Is this shape symmetrical along the dashed line?}`,
            svg: q.svg,
            answer: correct,
            options,
            forceOption: 2,
        };

    }, [1]),
    "angles": createGenerator(({ difficulty }) => {

        // ---------- DIFFICULTY 1: BASIC TOTAL ANGLES ----------
        if (difficulty === 1) {

            const questions = [
                {
                    latex: `\\text{What is the total of the interior angles in a triangle?}`,
                    answer: "180°",
                    options: ["90°", "180°", "360°", "270°"],
                },
                {
                    latex: `\\text{What is the total of the interior angles in a square?}`,
                    answer: "360°",
                    options: ["180°", "270°", "360°", "450°"],
                },
                {
                    latex: `\\text{What is the total of the interior angles in a rectangle?}`,
                    answer: "360°",
                    options: ["180°", "360°", "270°", "90°"],
                },
                {
                    latex: `\\text{What is the total of the angles in a right-angled triangle?}`,
                    answer: "180°",
                    options: ["90°", "180°", "270°", "360°"],
                }
            ];

            const q = questions[Math.floor(Math.random() * questions.length)];

            const options = [...q.options].sort(() => Math.random() - 0.5);

            return {
                latex: q.latex,
                answer: q.answer,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: MISSING ANGLE IN TRIANGLE ----------
        if (difficulty === 2) {

            const a = Math.floor(Math.random() * 100) + 10;
            const b = Math.floor(Math.random() * (160 - a)) + 10;
            const c = 180 - (a + b);

            const correct = `${c}°`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrong = `${Math.max(10, Math.min(170, c + (Math.floor(Math.random() * 21) - 10)))}°`;
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Two angles in a triangle are } ${a}° \\text{ and } ${b}°. \\text{ What is the third angle?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 3: RECTANGLE CORNER REASONING ----------
        if (difficulty === 3) {

            const known = Math.floor(Math.random() * 80) + 10;
            const correct = `${90 - known}°`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrong = `${Math.max(1, Math.min(89, (90 - known) + (Math.floor(Math.random() * 21) - 10)))}°`;
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{A right angle is } 90°. \\text{ One part is } ${known}°. \\text{ What is the other part?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 4: FULL 360° AROUND A POINT ----------
        if (difficulty === 4) {

            const a = Math.floor(Math.random() * 200) + 20;
            const b = Math.floor(Math.random() * (340 - a)) + 10;
            const c = 360 - (a + b);

            const correct = `${c}°`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrong = `${Math.max(10, Math.min(350, c + (Math.floor(Math.random() * 41) - 20)))}°`;
                optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Angles around a point add up to } 360°.\\\\\\ \\text{ Two angles are } ${a}° \\text{ and } ${b}°. \\text{ What is the missing angle?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "position-and-direction": createGenerator(({ difficulty }) => {
        const cols = ["A", "B", "C", "D", "E"];
        const rows = ["1", "2", "3", "4", "5"];

        const cellSize = 30;
        const offset = 40;

        const toCoord = (x: number, y: number) => `${cols[x]}${rows[y]}`;

        const buildGrid = (startX: number, startY: number) => {
            let svg = `<svg width="200" height="200" viewBox="0 0 200 200">`;

            // top labels (A–E)
            for (let x = 0; x < 5; x++) {
                const cx = offset + x * cellSize + cellSize / 2;
                svg += `<text x="${cx}" y="25" font-size="12" text-anchor="middle">${cols[x]}</text>`;
            }

            // left labels (1–5)
            for (let y = 0; y < 5; y++) {
                const cy = offset + y * cellSize + cellSize / 2;
                svg += `<text x="20" y="${cy + 4}" font-size="12" text-anchor="middle">${rows[4 - y]}</text>`;
            }

            // grid lines
            for (let i = 0; i <= 5; i++) {
                svg += `<line x1="${offset + i * cellSize}" y1="${offset}" x2="${offset + i * cellSize}" y2="${offset + 5 * cellSize}" stroke="black"/>`;
                svg += `<line x1="${offset}" y1="${offset + i * cellSize}" x2="${offset + 5 * cellSize}" y2="${offset + i * cellSize}" stroke="black"/>`;
            }

            // start marker
            const sx = offset + startX * cellSize + cellSize / 2;
            const sy = offset + (4 - startY) * cellSize + cellSize / 2;

            svg += `<circle cx="${sx}" cy="${sy}" r="5" fill="green"/>`;

            svg += `</svg>`;
            return svg;
        };

        // ---------------- LEVEL 1 ----------------
        // random start, identify position
        if (difficulty === 1) {
            const x = Math.floor(Math.random() * 5);
            const y = Math.floor(Math.random() * 5);

            const svg = buildGrid(x, y);
            const correct = toCoord(x, y);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                optionsSet.add(toCoord(
                    Math.floor(Math.random() * 5),
                    Math.floor(Math.random() * 5)
                ));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Where is the green circle?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // fixed start, follow directions
        if (difficulty === 2) {
            let x = 2;
            let y = 2;

            const dirs = ["left", "right", "up", "down"];
            const steps = Math.floor(Math.random() * 4) + 3;
            const sequence: string[] = [];

            for (let i = 0; i < steps; i++) {
                let moved = false;

                while (!moved) {
                    const d = dirs[Math.floor(Math.random() * dirs.length)];

                    if (d === "left" && x > 0) {
                        x--; moved = true;
                    } else if (d === "right" && x < 4) {
                        x++; moved = true;
                    } else if (d === "up" && y < 4) {
                        y++; moved = true;
                    } else if (d === "down" && y > 0) {
                        y--; moved = true;
                    }

                    if (moved) sequence.push(d);
                }
            }

            const svg = buildGrid(2, 2);
            const correct = toCoord(x, y);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                optionsSet.add(toCoord(
                    Math.floor(Math.random() * 5),
                    Math.floor(Math.random() * 5)
                ));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Start at the green circle. Follow: } ${sequence.join(", ")}. \\text{ Where do you end up?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // random start, follow directions
        if (difficulty === 3) {
            const startX = Math.floor(Math.random() * 5);
            const startY = Math.floor(Math.random() * 5);

            let x = startX;
            let y = startY;

            const dirs = ["left", "right", "up", "down"];
            const steps = Math.floor(Math.random() * 4) + 3;
            const sequence: string[] = [];

            for (let i = 0; i < steps; i++) {
                let moved = false;

                while (!moved) {
                    const d = dirs[Math.floor(Math.random() * dirs.length)];

                    if (d === "left" && x > 0) {
                        x--;
                        moved = true;
                    } else if (d === "right" && x < 4) {
                        x++;
                        moved = true;
                    } else if (d === "up" && y < 4) {
                        y++;
                        moved = true;
                    } else if (d === "down" && y > 0) {
                        y--;
                        moved = true;
                    }

                    if (moved) sequence.push(d);
                }
            }

            // IMPORTANT: grid shows START, not end
            const svg = buildGrid(startX, startY);

            const correct = toCoord(x, y);

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const rx = Math.floor(Math.random() * 5);
                const ry = Math.floor(Math.random() * 5);
                optionsSet.add(toCoord(rx, ry));
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Start at the green circle. Follow: } ${sequence.join(", ")}. \\text{ Where do you end up?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3]),
    "sorting-and-classifying": createGenerator(({ difficulty }) => {
        const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

        const uniqueNumbers = (count: number, max: number) => {
            const set = new Set<number>();
            while (set.size < count) {
                set.add(Math.floor(Math.random() * max) + 1);
            }
            return Array.from(set);
        };

        // ---------- DIFFICULTY 1: ODD ONE OUT ----------
        if (difficulty === 1) {
            const sets = [
                // --- numbers ---
                { items: ["2", "4", "6", "7"], answer: "7" },
                { items: ["1", "3", "5", "8"], answer: "8" },
                { items: ["10", "12", "14", "15"], answer: "15" },
                { items: ["21", "23", "25", "30"], answer: "30" },

                // --- food / plant vs fruit ---
                { items: ["apple", "banana", "carrot", "pear"], answer: "carrot" },
                { items: ["orange", "grape", "potato", "melon"], answer: "potato" },
                { items: ["strawberry", "blueberry", "broccoli", "raspberry"], answer: "broccoli" },
                { items: ["mango", "pineapple", "lettuce", "kiwi"], answer: "lettuce" },

                // --- 2D vs 3D shapes ---
                { items: ["triangle", "square", "circle", "cube"], answer: "cube" },
                { items: ["rectangle", "pentagon", "hexagon", "sphere"], answer: "sphere" },
                { items: ["circle", "triangle", "cube", "oval"], answer: "cube" },
                { items: ["square", "rectangle", "cylinder", "triangle"], answer: "cylinder" },

                // --- colours vs object ---
                { items: ["red", "blue", "green", "dog"], answer: "dog" },
                { items: ["yellow", "purple", "orange", "table"], answer: "table" },
                { items: ["black", "white", "pink", "car"], answer: "car" },
                { items: ["blue", "green", "brown", "chair"], answer: "chair" },

                // --- units ---
                { items: ["kg", "g", "cm", "tonne"], answer: "cm" },
                { items: ["cm", "m", "km", "kg"], answer: "kg" },
                { items: ["litre", "ml", "g", "cl"], answer: "g" },
                { items: ["seconds", "minutes", "hours", "kg"], answer: "kg" },

                // --- animals vs object ---
                { items: ["cat", "dog", "fish", "car"], answer: "car" },
                { items: ["lion", "tiger", "elephant", "bus"], answer: "bus" },
                { items: ["cow", "sheep", "goat", "chair"], answer: "chair" },
                { items: ["horse", "donkey", "zebra", "table"], answer: "table" },

            ];

            const q = sets[Math.floor(Math.random() * sets.length)];

            return {
                latex: `\\text{Which is the odd one out? } ${q.items.join(", ")}`,
                answer: q.answer,
                options: shuffle(q.items),
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: GROUP BY PROPERTY ----------
        if (difficulty === 2) {
            const type = Math.floor(Math.random() * 3);

            const buildOptions = (correct: string[], wrong: string[], size: number) => {
                const set = new Set<string>();
                set.add(correct.join(", "));

                let attempts = 0;

                while (set.size < 4 && attempts < 20) {
                    attempts++;

                    const mix: string[] = [];
                    for (let i = 0; i < size; i++) {
                        const pool = Math.random() < 0.5 ? correct : wrong;
                        mix.push(pool[Math.floor(Math.random() * pool.length)]);
                    }

                    const unique = [...new Set(mix)];
                    if (unique.join(", ") !== correct.join(", ")) {
                        set.add(unique.join(", "));
                    }
                }

                return shuffle(Array.from(set));
            };

            if (type === 0) {
                const correct = ["2", "4", "6"];
                const wrong = ["3", "5", "7"];

                return {
                    latex: `\\text{Which group contains only even numbers?}`,
                    answer: correct.join(", "),
                    options: buildOptions(correct, wrong, 3),
                    forceOption: 2,
                };
            }

            if (type === 1) {
                const correct = ["Square", "Rectangle"];
                const wrong = ["Triangle", "Circle"];

                return {
                    latex: `\\text{Which group has only 4-sided shapes?}`,
                    answer: correct.join(", "),
                    options: buildOptions(correct, wrong, 2),
                    forceOption: 2,
                };
            }

            const correct = ["cm", "m", "km"];
            const wrong = ["kg", "Litres", "Seconds"];

            return {
                latex: `\\text{Which group contains only length units?}`,
                answer: correct.join(", "),
                options: buildOptions(correct, wrong, 3),
                forceOption: 2,
            };
        }

        // ---------- DIFFICULTY 3: SORT NUMBERS ----------
        if (difficulty === 3) {
            const nums = uniqueNumbers(6, 100);

            const isAscending = Math.random() < 0.5;

            const correctArr = [...nums].sort((a, b) => 
                isAscending ? a - b : b - a
            );

            const correct = correctArr.join(", ");

            const set = new Set<string>();
            set.add(correct);

            let attempts = 0;

            while (set.size < 4 && attempts < 30) {
                attempts++;

                const shuffled = shuffle(nums).join(", ");

                // avoid accidentally matching correct answer
                if (shuffled !== correct) {
                    set.add(shuffled);
                }
            }

            return {
                latex: `\\text{Put these numbers in ${isAscending ? "ascending" : "descending"} order: } ${nums.join(", ")}`,
                answer: correct,
                options: shuffle(Array.from(set)),
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 4: CLASSIFY ITEM ----------
        if (difficulty === 4) {
            const items = [
                { item: "triangle", group: "2D shape" },
                { item: "cube", group: "3D shape" },
                { item: "kg", group: "mass unit" },
                { item: "cm", group: "length unit" },
                { item: "litre", group: "volume unit" },
                { item: "hour", group: "time unit" },
            ];

            const allGroups = ["2D Shape", "3D Shape", "Mass Unit", "Length Unit", "Volume Unit", "Time Unit"];

            const q = items[Math.floor(Math.random() * items.length)];

            const set = new Set<string>();
            set.add(q.group);

            while (set.size < 4) {
                const g = allGroups[Math.floor(Math.random() * allGroups.length)];
                set.add(g);
            }

            return {
                latex: `\\text{Which group does } ${q.item} \\text{ belong to?}`,
                answer: q.group,
                options: shuffle(Array.from(set)),
                forceOption: 2,
            };
        }

        // ---------- DIFFICULTY 5: MULTI-CRITERIA ----------
        const nums = uniqueNumbers(4, 20);

        // randomly choose condition
        const isEven = Math.random() < 0.5;

        let correctArr = nums.filter(n => isEven ? n % 2 === 0 : n % 2 !== 0);

        // Ensure at least one correct answer
        if (correctArr.length === 0) {
            // force first number to match condition
            nums[0] = isEven ? 2 : 1;
            correctArr = nums.filter(n => isEven ? n % 2 === 0 : n % 2 !== 0);
        }

        const correct = correctArr.join(", ");

        const set = new Set<string>();
        set.add(correct);

        let attempts = 0;

        while (set.size < 4 && attempts < 30) {
            attempts++;

            const subset = nums.filter(() => Math.random() < 0.5);
            if (subset.length === 0) continue;

            const str = subset.join(", ");
            if (str !== correct) set.add(str);
        }

        return {
            latex: `\\text{Select all ${isEven ? "even" : "odd"} numbers from: } ${nums.join(", ")}`,
            answer: correct,
            options: shuffle(Array.from(set)),
            forceOption: 2,
        };

    }, [1, 2, 3, 4, 5]),

    "pictograms-bar-charts": createGenerator(({ difficulty }) => {

    const categories = ["Orange", "Apple", "Pears", "Other"];

    // -----------------------------
    // D3 UNIT DEFINITION (ONLY MEANING CHANGE)
    // -----------------------------
    const unitValue = difficulty === 3
        ? Math.floor(Math.random() * 4) + 2 // 2–5 units per circle
        : 1;

    // -----------------------------
    // VALUE GENERATION
    // -----------------------------
    const values = categories.map(() => {

        if (difficulty === 1) {
            return Math.floor(Math.random() * 5) + 1;
        }

        if (difficulty === 2) {
            const full = Math.floor(Math.random() * 5) + 1;
            const hasHalf = Math.random() < 0.5 ? 0.5 : 0;
            return full + hasHalf;
        }

        // difficulty 3: still allows half-units, but in larger scale
        const base = Math.floor(Math.random() * 5 + 2) * unitValue;
        const hasHalf = Math.random() < 0.5 ? unitValue / 2 : 0;
        return base + hasHalf;
    });

    const data = categories.map((label, i) => ({
        label,
        value: values[i]
    }));

    const target = data[Math.floor(Math.random() * data.length)];
    const correct = String(target.value);

    // -----------------------------
    // OPTIONS
    // -----------------------------
    const optionsSet = new Set<string>();
    optionsSet.add(correct);

    while (optionsSet.size < 4) {
        const base = target.value;

        let wrong: number;

        if (difficulty === 3) {
            const step = unitValue / 2;
            wrong = Math.max(0, base + (Math.floor(Math.random() * 5) - 2) * step);
        } else {
            const offset = (Math.floor(Math.random() * 5) - 2) * 0.5;
            wrong = Math.max(0, base + offset);
        }

        optionsSet.add(String(wrong));
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    // -----------------------------
    // SVG
    // -----------------------------
    const svg = `
    <svg width="420" height="260" viewBox="0 0 420 260">

        <text x="210" y="20" text-anchor="middle" font-size="12">
            ${difficulty === 3
                ? `1 full circle = ${unitValue} units`
                : "1 full circle = 1 unit"
            }
        </text>

        <rect x="10" y="30" width="400" height="220" fill="none" stroke="black"/>

        ${data.map((d, i) => {

            const y = 70 + i * 45;
            const startX = 140;

            const circles: string[] = [];

            // -----------------------------
            // SHARED RENDERING LOGIC (D1 / D2 / D3)
            // -----------------------------

            let full: number;
            let half: boolean;

            if (difficulty === 3) {
                full = Math.floor(d.value / unitValue);
                half = Math.abs(d.value % unitValue - unitValue / 2) < 1e-9;
            } else {
                full = Math.floor(d.value);
                half = d.value % 1 !== 0;
            }

            let xIndex = 0;

            // FULL CIRCLES
            for (let j = 0; j < full; j++) {

                const x = startX + xIndex * 22;

                circles.push(`
                    <circle cx="${x}" cy="${y}" r="7"
                        fill="none" stroke="black"/>
                `);

                xIndex++;
            }

            // HALF CIRCLE (D2 + D3)
            if (half && (difficulty === 2 || difficulty === 3)) {

                const x = startX + xIndex * 22;
                const r = 7;

                circles.push(`
                    <path d="
                        M ${x - r} ${y}
                        A ${r} ${r} 0 0 1 ${x + r} ${y}
                        L ${x - r} ${y}
                    "
                    transform="rotate(-90 ${x} ${y})"
                    fill="none"
                    stroke="black"/>
                `);
            }

            return `
                <text x="80" y="${y + 4}" text-anchor="end">
                    ${d.label}
                </text>

                ${circles.join("")}
            `;
        }).join("")}

    </svg>`;

    return {
        latex: `\\text{How many units are shown for ${target.label}?}`,
        svg,
        answer: correct,
        options,
        forceOption: 0,
    };

}, [1, 2, 3]),

    "tables": createGenerator(({ difficulty }) => {
        // ---------- DIFFICULTY 1: READ FROM SIMPLE TABLE ----------
        if (difficulty === 1) {

            const names = ["Alice", "Ben", "Charlie", "Daisy"];
            
            const values = names.map(() => Math.floor(Math.random() * 10) + 1);

            const tableData = names.map((name, i) => ({
                name,
                value: values[i]
            }));

            const targetIndex = Math.floor(Math.random() * tableData.length);
            const target = tableData[targetIndex];

            const correct = `${target.value}`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const wrong = `${Math.floor(Math.random() * 10) + 1}`;
                if (wrong !== correct) optionsSet.add(wrong);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            const svg = `
            <svg width="260" height="180" viewBox="0 0 260 170">

                <!-- table border -->
                <rect x="10" y="10" width="240" height="160" fill="none" stroke="black"/>

                <!-- column lines -->
                <line x1="130" y1="10" x2="130" y2="170" stroke="black"/>

                <!-- row lines -->
                <line x1="10" y1="50" x2="250" y2="50" stroke="black"/>
                <line x1="10" y1="90" x2="250" y2="90" stroke="black"/>
                <line x1="10" y1="130" x2="250" y2="130" stroke="black"/>

                <!-- headers -->
                <text x="70" y="35" text-anchor="middle">Name</text>
                <text x="190" y="35" text-anchor="middle">Apples</text>

                <!-- rows -->
                ${tableData.map((row, i) => {
                    const y = 75 + i * 40;
                    return `
                        <text x="70" y="${y}" text-anchor="middle">${row.name}</text>
                        <text x="190" y="${y}" text-anchor="middle">${row.value}</text>
                    `;
                }).join("")}

            </svg>`;

            return {
                latex: `\\text{How many apples does ${target.name} have?}`,
                svg,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------- DIFFICULTY 2: COMPARE / TOTALS ----------
        if (difficulty === 2) {

            const names = ["Alex", "Bella", "Chris", "Dina"];

            const apples = names.map(() => Math.floor(Math.random() * 10) + 1);
            const oranges = names.map(() => Math.floor(Math.random() * 10) + 1);

            const rows = names.map((name, i) => ({
                name,
                apples: apples[i],
                oranges: oranges[i],
                total: apples[i] + oranges[i]
            }));

            const type = Math.random();

            let questionText: string;
            let correctValue: string;

            if (type < 0.33) {
                const best = rows.reduce((a, b) => a.total > b.total ? a : b);
                questionText = `Who has the highest total fruit?`;
                correctValue = best.name;

            } else if (type < 0.66) {
                const a = rows[0];
                const b = rows[1];
                questionText = `How many more fruits does ${a.name} have than ${b.name}?`;
                correctValue = String(Math.abs(a.total - b.total));

            } else {
                const r = rows[Math.floor(Math.random() * rows.length)];
                questionText = `How many fruits does ${r.name} have in total?`;
                correctValue = String(r.total);
            }

            const optionsSet = new Set<string>();
            optionsSet.add(`${correctValue}`);

            while (optionsSet.size < 4) {

                let wrong: string;

                // numeric answer case
                if (!isNaN(Number(correctValue))) {
                    const base = Number(correctValue);

                    wrong = String(
                        Math.max(0, base + Math.floor(Math.random() * 6 - 3))
                    );
                } 
                // string answer case (e.g. names)
                else {
                    const names = ["Alex", "Bella", "Chris", "Dina"];

                    wrong = names[Math.floor(Math.random() * names.length)];
                }

                if (wrong !== correctValue) {
                    optionsSet.add(wrong);
                }
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            const svg = `
            <svg width="320" height="200" viewBox="0 0 320 220">

                <!-- outer border -->
                <rect x="10" y="10" width="300" height="200" fill="none" stroke="black"/>

                <!-- grid -->
                <line x1="110" y1="10" x2="110" y2="210" stroke="black"/>
                <line x1="210" y1="10" x2="210" y2="210" stroke="black"/>

                <line x1="10" y1="50" x2="310" y2="50" stroke="black"/>
                <line x1="10" y1="90" x2="310" y2="90" stroke="black"/>
                <line x1="10" y1="130" x2="310" y2="130" stroke="black"/>
                <line x1="10" y1="170" x2="310" y2="170" stroke="black"/>

                <!-- headers -->
                <text x="60" y="35" text-anchor="middle">Name</text>
                <text x="160" y="35" text-anchor="middle">Apples</text>
                <text x="260" y="35" text-anchor="middle">Oranges</text>

                <!-- rows -->
                ${rows.map((r, i) => {
                    const y = 75 + i * 40;
                    return `
                        <text x="60" y="${y}" text-anchor="middle">${r.name}</text>
                        <text x="160" y="${y}" text-anchor="middle">${r.apples}</text>
                        <text x="260" y="${y}" text-anchor="middle">${r.oranges}</text>
                    `;
                }).join("")}

            </svg>`;

            return {
                latex: `\\text{${questionText}}`,
                svg,
                answer: String(correctValue),
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2]),

    "word-problems": createGenerator(async ({ difficulty }) => {
        if (difficulty === 1) {
            return await fetchRandomWordProblem();
        }
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1]),

    "patterns-and-sequences": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {

            const shapes = ["Circle", "Square", "Triangle"] as const;

            function renderShape(shape: string, cx: number, cy: number): string {
                if (shape === "Circle") {
                    return `<circle cx="${cx}" cy="${cy}" r="10" stroke="black" fill="none"/>`;
                }

                if (shape === "Square") {
                    return `<rect x="${cx - 10}" y="${cy - 10}" width="20" height="20" stroke="black" fill="none"/>`;
                }

                if (shape === "Triangle") {
                    return `
                        <polygon points="
                            ${cx},${cy - 12}
                            ${cx - 10},${cy + 10}
                            ${cx + 10},${cy + 10}
                        " stroke="black" fill="none"/>
                    `;
                }

                return "";
            }

            // -----------------------------
            // PATTERN
            // -----------------------------
            const patternLength = 2 + Math.floor(Math.random() * 2);

            const basePattern = Array.from({ length: patternLength }, () =>
                shapes[Math.floor(Math.random() * shapes.length)]
            );

            const sequenceLength = 5;

            const sequence = Array.from({ length: sequenceLength }, (_, i) =>
                basePattern[i % patternLength]
            );

            const answerShape = basePattern[sequenceLength % patternLength];

            // -----------------------------
            // OPTIONS (NO INFINITE LOOP)
            // -----------------------------
            const options = [...shapes].sort(() => Math.random() - 0.5);

            // -----------------------------
            // SVG
            // -----------------------------
            const svg = `
            <svg width="420" height="120" viewBox="0 0 420 120">

                ${sequence.map((shape, i) => {
                    const x = 60 + i * 60;
                    return renderShape(shape, x, 60);
                }).join("")}

                <text x="${60 + sequence.length * 60}" y="65" font-size="24">?</text>

            </svg>
            `;

            return {
                latex: `\\text{What is the next shape in the pattern?}`,
                svg,
                answer: answerShape,
                options,
                forceOption: 0,
            };
        }

        throw new Error("Only difficulty 1 implemented");

    }, [1]),

    "missing-numbers": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // addition or subtraction (simple integers)
            const isAdd = Math.random() < 0.5;

            if (isAdd) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;

                return {
                    latex: `\\text{ } ${a} + \\square = ${a + b}`,
                    answer: b.toString(),
                    forceOption: 0,
                };
            } else {
                const a = Math.floor(Math.random() * 20) + 5;
                const b = Math.floor(Math.random() * Math.min(10, a)) + 1;

                return {
                    latex: `\\text{ } ${a} - \\square = ${a - b}`,
                    answer: b.toString(),
                    forceOption: 0,
                };
            }
        }

        // difficulty 2
        // multiplication or division
        const isMult = Math.random() < 0.5;

        if (isMult) {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;

            return {
                latex: `\\text{ } ${a} \\times \\square = ${a * b}`,
                answer: b.toString(),
                forceOption: 0,
            };
        } else {
            const b = Math.floor(Math.random() * 10) + 1;
            const a = Math.floor(Math.random() * 10) + 1;

            return {
                latex: `\\text{ } \\square \\div ${b} = ${a}`,
                answer: (a * b).toString(),
                forceOption: 0,
            };
        }

    }, [1, 2]),
    "simple-equations": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Single variable, very simple expression
            const x = Math.floor(Math.random() * 10) + 1;

            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10) + 1;

            // expression: ax + b
            const result = a * x + b;

            return {
                latex:
                    `\\text{What does this equal:}\\\\` +
                    `x = ${x}\\\\` +
                    `${a}x + ${b} = \\ ?`,
                answer: result.toString(),
                forceOption: 0,
            };
        }

        // difficulty 2
        // slightly larger numbers, still linear only
        const x = Math.floor(Math.random() * 10) + 1;
        const y = Math.floor(Math.random() * 10) + 1;

        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 1;

        // expression: ax + by
        const result = a * x + b * y;

        return {
            latex:
                `\\text{What does this equal:}\\\\` +
                `x = ${x},\\; y = ${y}\\\\` +
                `${a}x + ${b}y = \\ ?`,
            answer: result.toString(),
            forceOption: 0,
        };

    }, [1, 2]),
};

