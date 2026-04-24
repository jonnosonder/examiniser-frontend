// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

/* eslint-disable prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels, QuestionResult } from './questionGeneratorCommon';

// You can override this via NEXT_PUBLIC_WORD_PROBLEM_JSON_URL.
// For static export deployments, /MathSample.json avoids cross-origin CORS issues.
const WORD_PROBLEM_JSON_URL = 'https://d2lpkm1h3gh3rw.cloudfront.net/bf708822519a6c22ccfa2aa8bed72e7b86587d0a587fe7e6bbc0d86068e2c57c.json';
const ENV_WORD_PROBLEM_JSON_URL = process.env.NEXT_PUBLIC_WORD_PROBLEM_JSON_URL?.trim();

const WORD_PROBLEM_SOURCE_URLS = [
    '/bf708822519a6c22ccfa2aa8bed72e7b86587d0a587fe7e6bbc0d86068e2c57c.json',
    ENV_WORD_PROBLEM_JSON_URL,
    WORD_PROBLEM_JSON_URL,
].filter((url): url is string => Boolean(url && url.length > 0));

type WordProblemRecord = {
    category?: string;
    question: string;
    answer: string | number;
    explanation?: string;
};

let wordProblemCache: WordProblemRecord[] | null = null;
let wordProblemBatch: WordProblemRecord[] = [];
let wordProblemBatchIndex = 0;

const WORD_PROBLEM_BATCH_SIZE = 100;

function shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildRandomWordProblemBatch(records: WordProblemRecord[], batchSize: number): WordProblemRecord[] {
    if (records.length === 0) {
        return [];
    }

    // If there are enough records, sample without replacement.
    if (records.length >= batchSize) {
        const shuffled = shuffleInPlace([...records]);
        return shuffled.slice(0, batchSize);
    }

    // If there are fewer than requested, cycle through shuffled copies until full.
    const result: WordProblemRecord[] = [];
    while (result.length < batchSize) {
        const shuffled = shuffleInPlace([...records]);
        for (const item of shuffled) {
            result.push(item);
            if (result.length >= batchSize) {
                break;
            }
        }
    }

    return result;
}

function normalizeWordProblemRecords(data: unknown): WordProblemRecord[] {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .filter((item): item is WordProblemRecord => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as Partial<WordProblemRecord>;
            return typeof candidate.question === 'string';
        })
        .map((item) => ({
            category: item.category,
            question: item.question,
            answer: item.answer ?? '',
            explanation: item.explanation,
        }));
}

async function loadWordProblems(): Promise<WordProblemRecord[]> {
    const failures: string[] = [];

    for (const url of WORD_PROBLEM_SOURCE_URLS) {
        try {
            const res = await fetch(url, { method: 'GET' });

            if (!res.ok) {
                failures.push(`${url}: ${res.status} ${res.statusText}`);
                continue;
            }

            const data = await res.json();
            const normalized = normalizeWordProblemRecords(data);

            if (!normalized.length) {
                failures.push(`${url}: payload was empty or invalid`);
                continue;
            }

            return normalized;
        } catch (error) {
            failures.push(`${url}: ${String(error instanceof Error ? error.message : error)}`);
        }
    }

    throw new Error(`Failed to load word problems from all sources. ${failures.join(' | ')}`);
}

async function fetchRandomWordProblem(): Promise<QuestionResult> {
    try {
        if (wordProblemBatchIndex >= wordProblemBatch.length) {
            // Refresh source and build a new local batch of 100 random questions.
            wordProblemCache = await loadWordProblems();
            wordProblemBatch = buildRandomWordProblemBatch(wordProblemCache, WORD_PROBLEM_BATCH_SIZE);
            wordProblemBatchIndex = 0;
        }

        if (!wordProblemBatch.length) {
            throw new Error('Word problems batch is empty');
        }

        const item = wordProblemBatch[wordProblemBatchIndex];
        wordProblemBatchIndex += 1;
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



export const secondaryGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "negative-integers": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        let latex = "";
        let answer: string = "";

        const solve = (a: number, b: number, op: string) => {
            switch (op) {
                case "+": return a + b;
                case "-": return a - b;
                case "×": return a * b;
                case "÷": return a / b;
                default: return 0;
            }
        };

        // -----------------------------
        // D1: sign practice
        // -----------------------------
        if (difficulty === 1) {

            const a = randInt(-20, 20);
            const b = randInt(-20, 20);
            const op = Math.random() < 0.5 ? "+" : "-";

            latex = `\\text{Calculate: } ${a} ${op} ${b}`;
            answer = String(solve(a, b, op));
        }

        // -----------------------------
        // D2: missing operator
        // -----------------------------
        else if (difficulty === 2) {

            const a = randInt(-15, 15);
            const b = randInt(-15, 15);

            const ops = ["+", "-", "×"] as const;
            const op = ops[randInt(0, 2)];

            const result = solve(a, b, op);

            latex = `\\text{Fill in the missing sign: } ${a} \\; \\square \\; ${b} = ${result}`;

            answer = op;
        }

        // -----------------------------
        // D3: multi-step
        // -----------------------------
        else if (difficulty === 3) {

            const a = randInt(-10, 10);
            const b = randInt(-10, 10);
            const c = randInt(-10, 10);

            latex = `\\text{Calculate: } (${a} + ${b}) - ${c}`;

            answer = String((a + b) - c);
        }

        // -----------------------------
        // D4: brackets + negatives
        // -----------------------------
        else if (difficulty === 4) {

            const a = randInt(-10, 10);
            const b = randInt(-10, 10);
            const c = randInt(-10, 10);

            const op = Math.random() < 0.5 ? "+" : "-";

            const inner = op === "+"
                ? (a + b)
                : (a - b);

            const result = inner * c;

            latex = `\\text{Calculate: } (${a} ${op} ${b}) \\times ${c}`;

            answer = String(result);
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        // -----------------------------
        // OPTIONS (FIXED)
        // -----------------------------

        let options: string[] = [];

        // operator question (D2)
        if (difficulty === 2) {
            options = ["+", "-", "×"].sort(() => Math.random() - 0.5);
        }

        // numeric questions (D1, D3, D4)
        else {
            const answerNum = Number(answer);

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const offset = randInt(-5, 5);
                optionsSet.add(String(answerNum + offset));
            }

            options = Array.from(optionsSet)
                .sort(() => Math.random() - 0.5);
        }

        return {
            latex,
            answer,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),
    "factors-multiples-primes": createGenerator(({ difficulty }) => {
        // -----------------------------
        // HELPERS
        // -----------------------------
        const isPrime = (n: number) => {
            if (n < 2) return false;
            for (let i = 2; i * i <= n; i++) {
                if (n % i === 0) return false;
            }
            return true;
        };

        const getFactors = (n: number) => {
            const factors: number[] = [];
            for (let i = 1; i <= n; i++) {
                if (n % i === 0) factors.push(i);
            }
            return factors;
        };

        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        let latex = "";
        let answer: any = null;
        let options: string[] = [];

        // -----------------------------
        // D1: factors of a number
        // -----------------------------
        if (difficulty === 1) {

            const n = randInt(10, 60);
            const factors = getFactors(n);

            latex = `\\text{What are the factors of }${n}\\text{? } \\\\ \\text{List them in accending order, separated by commas.}`;
            answer = factors.join(", ");

            options = [
                answer,
                getFactors(n + randInt(1, 5)).join(", "),
                getFactors(n - randInt(1, 5)).join(", "),
                getFactors(n + randInt(6, 10)).join(", ")
            ];
        }

        // -----------------------------
        // D2: multiples classification
        // -----------------------------
        else if (difficulty === 2) {

            const x = randInt(2, 12);
            const numbers = Array.from({ length: 10 }, () => randInt(10, 60));

            const multiples = numbers.filter(n => n % x === 0);

            latex = `\\text{Which numbers are multiples of } ${x}\\text{? } \\\\\\  ${numbers.join(", ")} \\text{. }  \\\\ \\text{List them in accending order, separated by commas.}`;

            answer = multiples.join(", ");

            options = [
                answer,
                numbers.filter(n => n % (x + 1) === 0).join(", "),
                numbers.filter(n => n % (x + 2) === 0).join(", "),
                numbers.filter(n => n % (x + 3) === 0).join(", ")
            ];
        }

        // -----------------------------
        // D3: primes between range
        // -----------------------------
        else if (difficulty === 3) {

            const start = randInt(10, 50);
            const end = start + 10;

            const primes = [];
            for (let i = start; i <= end; i++) {
                if (isPrime(i)) primes.push(i);
            }

            latex = `\\text{List all prime numbers between } ${start} \\text{ and } ${end} \\text{. } \\\\ \\text{List them in accending order, separated by commas.}`;

            answer = primes.join(", ");

            options = [
                answer,
                primes.filter(n => n % 2 === 0).join(", "),
                primes.filter(n => n % 3 === 0).join(", "),
                primes.filter(n => n % 5 === 0).join(", ")
            ];
        }

        // -----------------------------
        // D4: mixed reasoning (harder primes + factors combo)
        // -----------------------------
        else if (difficulty === 4) {

            const a = randInt(20, 80);

            const factors = getFactors(a);
            const primes = factors.filter(isPrime);

            latex = `\\text{Find the prime factors of } ${a} \\text{. } \\\\ \\text{List them in accending order, separated by commas.}`;

            answer = primes.join(", ");

            options = [
                answer,
                factors.filter(n => n !== 1).join(", "),
                getFactors(a + 1).filter(isPrime).join(", "),
                getFactors(a - 1).filter(isPrime).join(", ")
            ];
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        // -----------------------------
        // FINAL OUTPUT
        // -----------------------------
        return {
            latex,
            answer: String(answer),
            options: options.map(String).sort(() => Math.random() - 0.5),
            forceOption: 0,
        };

    }, [1, 2, 3, 4]),
    "lcm-hcf": createGenerator(({ difficulty }) => {
        let latex = "";
        let answer = 0;

        // helpers
        const gcd = (a: number, b: number): number =>
            b === 0 ? a : gcd(b, a % b);

        const lcm = (a: number, b: number): number =>
            (a * b) / gcd(a, b);

        const gcd3 = (a: number, b: number, c: number): number =>
            gcd(gcd(a, b), c);

        const lcm3 = (a: number, b: number, c: number): number =>
            lcm(lcm(a, b), c);

        // -----------------------------
        // D1: LCM of two numbers
        // -----------------------------
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 10) + 2;
            const b = Math.floor(Math.random() * 10) + 2;

            latex = `\\text{Find the LCM of } ${a} \\text{ and } ${b}`;
            answer = lcm(a, b);
        }

        // -----------------------------
        // D2: HCF of two numbers
        // -----------------------------
        else if (difficulty === 2) {
            const a = Math.floor(Math.random() * 50) + 10;
            const b = Math.floor(Math.random() * 50) + 10;

            latex = `\\text{Find the HCF of } ${a} \\text{ and } ${b}`;
            answer = gcd(a, b);
        }

        // -----------------------------
        // D3: Worded LCM
        // -----------------------------
        else if (difficulty === 3) {
            const a = Math.floor(Math.random() * 10) + 2;
            const b = Math.floor(Math.random() * 10) + 2;

            const templates: [string, string][] = [
                [
                    `Two lights flash every ${a} seconds and ${b} seconds.`,
                    `When will they next flash together?`
                ],
                [
                    `Two buses arrive every ${a} minutes and ${b} minutes.`,
                    `When will they next arrive together?`
                ],
                [
                    `Two bells ring every ${a} seconds and ${b} seconds.`,
                    `When will they ring together again?`
                ],
                [
                    `Two traffic lights change every ${a} and ${b} seconds.`,
                    `When will they next change together?`
                ],
                [
                    `Two runners complete laps in ${a} and ${b} minutes.`,
                    `When will they next finish at the same time?`
                ],
                [
                    `Two machines operate in cycles of ${a} and ${b} seconds.`,
                    `When will they next operate together?`
                ],
                [
                    `Two alarms go off every ${a} and ${b} minutes.`,
                    `When will they go off together again?`
                ],
                [
                    `Two systems repeat every ${a} and ${b} seconds.`,
                    `When will they next repeat together?`
                ]
            ];

            const [line1, line2] = templates[Math.floor(Math.random() * templates.length)];

            latex = `\\text{${line1}}\\\\\\text{${line2}}`;
            answer = lcm(a, b);
        }

        // -----------------------------
        // D4: Worded HCF
        // -----------------------------
        else if (difficulty === 4) {
            const a = Math.floor(Math.random() * 50) + 10;
            const b = Math.floor(Math.random() * 50) + 10;

            const templates: [string, string][] = [
                [
                    `You have ${a} apples and ${b} oranges.`,
                    `What is the largest number of equal groups you can make?`
                ],
                [
                    `A ribbon of ${a} cm and ${b} cm is cut into pieces.`,
                    `What is the greatest possible length of each piece?`
                ],
                [
                    `Divide ${a} and ${b} into equal groups.`,
                    `What is the largest possible group size?`
                ],
                [
                    `A teacher has ${a} pencils and ${b} pens.`,
                    `What is the largest equal group size?`
                ],
                [
                    `You have ${a} beads and ${b} buttons.`,
                    `What is the greatest number per group?`
                ],
                [
                    `Cut ropes of ${a} m and ${b} m into equal pieces.`,
                    `What is the longest possible piece length?`
                ],
                [
                    `Split ${a} sweets and ${b} chocolates into groups.`,
                    `What is the largest equal group size?`
                ],
                [
                    `You want to arrange ${a} and ${b} items equally.`,
                    `What is the greatest group size?`
                ]
            ];

            const [line1, line2] = templates[Math.floor(Math.random() * templates.length)];

            latex = `\\text{${line1}}\\\\\\text{${line2}}`;
            answer = gcd(a, b);
        }

        // -----------------------------
        // D5: LCM of 3 numbers
        // -----------------------------
        else if (difficulty === 5) {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 2;
            const c = Math.floor(Math.random() * 8) + 2;

            latex = `\\text{Find the LCM of } ${a}, ${b} \\text{ and } ${c}`;
            answer = lcm3(a, b, c);
        }

        // -----------------------------
        // D6: HCF of 3 numbers
        // -----------------------------
        else if (difficulty === 6) {
            const a = Math.floor(Math.random() * 50) + 10;
            const b = Math.floor(Math.random() * 50) + 10;
            const c = Math.floor(Math.random() * 50) + 10;

            latex = `\\text{Find the HCF of } ${a}, ${b} \\text{ and } ${c}`;
            answer = gcd3(a, b, c);
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        // -----------------------------
        // OPTIONS
        // -----------------------------
        const optionsSet = new Set<number>();
        optionsSet.add(answer);

        while (optionsSet.size < 4) {
            const wrong = answer + (Math.floor(Math.random() * 10) - 5);
            if (wrong > 0) optionsSet.add(wrong);
        }

        const options = Array.from(optionsSet)
            .map(String)
            .sort(() => Math.random() - 0.5);

        return {
            latex,
            answer: String(answer),
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4, 5, 6]),
    "powers-and-roots": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        let latex = "";
        let answer = "";

        // -----------------------------
        // D1: simple powers
        // -----------------------------
        if (difficulty === 1) {

            const base = randInt(2, 6);
            const exp = randInt(2, 4);

            const result = Math.pow(base, exp);

            latex = `\\text{Calculate: } ${base}^{${exp}}`;
            answer = String(result);
        }

        // -----------------------------
        // D2: square and cube roots
        // -----------------------------
        else if (difficulty === 2) {

            const type = Math.random() < 0.5 ? "sqrt" : "cbrt";

            let n: number;
            let result: number;

            if (type === "sqrt") {
                const base = randInt(2, 12);
                n = base * base;
                result = base;

                latex = `\\text{Calculate: } \\sqrt{${n}}`;
            } else {
                const base = randInt(2, 6);
                n = base * base * base;
                result = base;

                latex = `\\text{Calculate: } \\sqrt[3]{${n}}`;
            }

            answer = String(result);
        }

        // -----------------------------
        // D3: mixed evaluation
        // -----------------------------
        else if (difficulty === 3) {

            const base = randInt(2, 5);
            const exp = randInt(2, 3);

            const rootBase = randInt(2, 6);
            const squared = rootBase * rootBase;

            const useRoot = Math.random() < 0.5;

            if (useRoot) {
                latex = `\\text{Calculate: } ${base}^{${exp}} + \\sqrt{${squared}}`;
                answer = String(Math.pow(base, exp) + rootBase);
            } else {
                const cubeBase = randInt(2, 4);
                const cube = cubeBase * cubeBase * cubeBase;

                latex = `\\text{Calculate: } ${base}^{${exp}} + \\sqrt[3]{${cube}}`;
                answer = String(Math.pow(base, exp) + cubeBase);
            }
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        // -----------------------------
        // OPTIONS
        // -----------------------------
        const optionsSet = new Set<string>();
        optionsSet.add(answer);

        const answerNum = Number(answer);

        while (optionsSet.size < 4) {
            const offset = randInt(-5, 5);
            optionsSet.add(String(answerNum + offset));
        }

        const options = Array.from(optionsSet)
            .sort(() => Math.random() - 0.5);

        return {
            latex,
            answer,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3]),
    "standard-form": createGenerator(({ difficulty }) => {

        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const randDecimal = () => {
            const options = [1.2, 1.5, 2.5, 3.2, 4.8, 5.5, 6.4, 7.2, 8.1, 9.6];
            return options[randInt(0, options.length - 1)];
        };

        const toStandard = (n: number) => {
            if (n === 0) return { a: 0, b: 0 };
            const b = Math.floor(Math.log10(Math.abs(n)));
            const a = n / Math.pow(10, b);
            return { a: Number(a.toFixed(2)), b };
        };

        let latex = "";
        let answer: string = "";
        let options: string[] = [];

        // -----------------------------
        // D1: integer → standard form
        // -----------------------------
        if (difficulty === 1) {

            const useSmallDecimal = Math.random() < 0.4;

            let n: number;

            if (useSmallDecimal) {
                // generate numbers like 0.00xxx to 0.xxxx (clean decimals)
                const exponent = randInt(3, 6); // controls number of leading zeros
                const base = randInt(1, 9999);

                n = base / Math.pow(10, exponent);
            } else {
                n = randInt(1000, 999999);
            }

            const { a, b } = toStandard(n);

            latex = `\\text{Write } ${n} \\text{ in standard form.}`;
            answer = `${a} \\times 10^{${b}}`;

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                const wrongUseDecimal = Math.random() < 0.3;

                let wrong: number;

                if (wrongUseDecimal) {
                    const exponent = randInt(3, 6);
                    const base = randInt(1, 9999);
                    wrong = base / Math.pow(10, exponent);
                } else {
                    wrong = randInt(1000, 999999);
                }

                const { a: wa, b: wb } = toStandard(Math.abs(wrong));
                set.add(`${wa} \\times 10^{${wb}}`);
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }

        // -----------------------------
        // D2: standard form → number (with negatives introduced)
        // -----------------------------
        else if (difficulty === 2) {

            const b = Math.random() < 0.3 ? randInt(-3, -1) : randInt(2, 6);
            const a = randDecimal();

            const n = a * Math.pow(10, b);

            latex = `\\text{Write } ${a} \\times 10^{${b}} \\text{ as an ordinary number.}`;
            answer = String(n);

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                set.add(String(n + randInt(-500, 500)));
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }

        // -----------------------------
        // D3: comparison (includes negatives)
        // -----------------------------
        else if (difficulty === 3) {

            const a1 = randDecimal();
            const a2 = randDecimal();

            const b1 = randInt(-2, 6);
            const b2 = randInt(-2, 6);

            const n1 = a1 * Math.pow(10, b1);
            const n2 = a2 * Math.pow(10, b2);

            const symbols = ["<", ">", "="] as const;
            const symbol = symbols[randInt(0, 2)];

            const correct =
                symbol === ">" ? n1 > n2 :
                symbol === "<" ? n1 < n2 :
                n1 === n2;

            latex = `\\text{True or false: } ${a1} \\times 10^{${b1}} \\; ${symbol} \\; ${a2} \\times 10^{${b2}}`;

            answer = correct ? "True" : "False";

            options = ["True", "False"].sort(() => Math.random() - 0.5);
        }

        // -----------------------------
        // D4: arithmetic (positive + negative powers)
        // -----------------------------
        else if (difficulty === 4) {

            const a1 = randDecimal();
            const a2 = randDecimal();

            const b = randInt(-3, 6);

            const n1 = a1 * Math.pow(10, b);
            const n2 = a2 * Math.pow(10, b);

            const op = Math.random() < 0.5 ? "+" : "-";

            const result = op === "+" ? n1 + n2 : n1 - n2;
            const { a, b: exp } = toStandard(result);

            latex = `\\text{Calculate: } (${a1} \\times 10^{${b}}) ${op} (${a2} \\times 10^{${b}})`;
            answer = `${a} \\times 10^{${exp}}`;

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                set.add(`${randDecimal()} \\times 10^{${randInt(-3, 6)}}`);
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }

        // -----------------------------
        // D5: mixed (negative + positive + multiplication)
        // -----------------------------
        else if (difficulty === 5) {

            const a = randDecimal();
            const b = randDecimal();
            const c = randInt(2, 9);

            const exp1 = randInt(2, 5);
            const exp2 = randInt(-3, 2);

            const n1 = a * Math.pow(10, exp1);
            const n2 = b * Math.pow(10, exp2);

            const result = n1 + (n2 * c);

            const { a: sa, b: sb } = toStandard(result);

            latex = `\\text{Calculate: } (${a} \\times 10^{${exp1}}) + (${b} \\times 10^{${exp2}}) \\times ${c}`;
            answer = `${sa} \\times 10^{${sb}}`;

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                set.add(`${randDecimal()} \\times 10^{${randInt(-3, 6)}}`);
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }

        // -----------------------------
        // D6: division in standard form
        // -----------------------------
        else if (difficulty === 6) {

            const a1 = randDecimal();
            const a2 = randDecimal();

            const b = randInt(2, 6);

            const n1 = a1 * Math.pow(10, b);
            const n2 = a2 * Math.pow(10, b);

            const result = n1 / n2;

            const toStandard = (n: number) => {
                if (n === 0) return { a: 0, b: 0 };
                const b = Math.floor(Math.log10(Math.abs(n)));
                const a = n / Math.pow(10, b);
                return { a: Number(a.toFixed(2)), b };
            };

            const { a, b: exp } = toStandard(result);

            latex = `\\text{Calculate and give your answer in standard form: } \\\\ \\frac{${a1} \\times 10^{${b}}}{${a2} \\times 10^{${b}}}`;

            answer = `${a} \\times 10^{${exp}}`;

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                const noise = result + randInt(-2, 2);
                const { a: wa, b: wb } = toStandard(noise);
                set.add(`${wa} \\times 10^{${wb}}`);
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }
        // -----------------------------
        // D7: full composite (mixed operations + negative powers)
        // -----------------------------
        else if (difficulty === 7) {

            const a = randDecimal();
            const b = randDecimal();
            const c = randDecimal();

            const e1 = randInt(3, 6);
            const e2 = randInt(-3, 3);

            const n1 = a * Math.pow(10, e1);
            const n2 = b * Math.pow(10, e2);

            const result = (n1 + n2) / c;

            const { a: sa, b: sb } = toStandard(result);

            latex = `\\text{Calculate: } \\frac{(${a} \\times 10^{${e1}} + ${b} \\times 10^{${e2}})}{${c}}`;

            answer = `${sa} \\times 10^{${sb}}`;

            const set = new Set<string>([answer]);

            while (set.size < 4) {
                set.add(`${randDecimal()} \\times 10^{${randInt(-3, 6)}}`);
            }

            options = Array.from(set).sort(() => Math.random() - 0.5);
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        return {
            latex,
            answer,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4, 5, 6, 7]),
    "fractions-decimals-percentages": createGenerator(({ difficulty }) => {
        // -----------------------------
        // D1: same denominator add/sub
        // -----------------------------
        if (difficulty === 1) {

            const denominators = [2, 3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const a = Math.floor(Math.random() * (denom - 1)) + 1;
            const b = Math.floor(Math.random() * (denom - 1)) + 1;

            const isAddition = Math.random() < 0.5;

            let numer1 = a;
            let numer2 = b;

            if (!isAddition && numer2 > numer1) {
                [numer1, numer2] = [numer2, numer1];
            }

            const resultNumer = isAddition ? numer1 + numer2 : numer1 - numer2;

            const gcd = (x: number, y: number): number =>
                y === 0 ? x : gcd(y, x % y);

            const g = gcd(resultNumer, denom);
            const sn = resultNumer / g;
            const sd = denom / g;

            let answers: string[] = [];

            if (sd === 1) {
                answers = [`${sn}`];
            } else{
                answers = [`\\frac{${sn}}{${sd}}`];
            }

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * d) + 1;
                optionsSet.add(n === d ? "1" : `\\frac{${n}}{${d}}`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex: `\\frac{${numer1}}{${denom}} ${isAddition ? "+" : "-"} \\frac{${numer2}}{${denom}} = ?`,
                answer: answers,
                equalValue: true,
                options,
                forceOption: 0,
            };
        }

        // -----------------------------
        // D2: simplify fractions
        // -----------------------------
        if (difficulty === 2) {

            const denom = [4, 6, 8, 9, 10, 12][Math.floor(Math.random() * 6)];
            const factor = Math.floor(Math.random() * (denom / 2)) + 2;

            const base = Math.floor(Math.random() * 4) + 1;
            const numer = base * factor;

            const gcd = (x: number, y: number): number =>
                y === 0 ? x : gcd(y, x % y);

            const g = gcd(numer, denom);
            const sn = numer / g;
            const sd = denom / g;

            const answers = [
                `\\frac{${sn}}{${sd}}`,
                `\\frac{${numer}}{${denom}}`
            ];

            if (sn === sd) answers.push("1");

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 10) + 2;
                optionsSet.add(`\\frac{${n}}{${d}}`);
            }

            return {
                latex: `\\text{Simplify: } \\frac{${numer}}{${denom}}`,
                answer: answers,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D3: add different denominators
        // -----------------------------
        if (difficulty === 3) {

            const denomList = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            const d1 = denomList[Math.floor(Math.random() * denomList.length)];

            let d2 = denomList[Math.floor(Math.random() * denomList.length)];
            while (d2 === d1) {
                d2 = denomList[Math.floor(Math.random() * denomList.length)];
            }

            const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
            const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;

            const gcd = (a: number, b: number): number =>
                b === 0 ? a : gcd(b, a % b);

            const lcm = (d1 * d2) / gcd(d1, d2);

            const sum = n1 * (lcm / d1) + n2 * (lcm / d2);

            const g = gcd(sum, lcm);

            const sn = sum / g;
            const sd = lcm / g;

            const answers = sd === 1
                ? [`${sn}`]
                : [`\\frac{${sn}}{${sd}}`];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 10) + 2;
                optionsSet.add(`\\frac{${n}}{${d}}`);
            }

            return {
                latex: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = ?`,
                answer: answers,
                equalValue: true,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D4: convert between forms
        // -----------------------------
        if (difficulty === 4) {

            const types = ["fraction", "decimal", "percent"];

            const from = types[Math.floor(Math.random() * types.length)];

            let to = types[Math.floor(Math.random() * types.length)];
            while (to === from) {
                to = types[Math.floor(Math.random() * types.length)];
            }

            // generate fraction that converts cleanly
            const denominators = [2, 4, 5, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * (denom - 1)) + 1;

            const decimal = (numer / denom).toString();
            const percent = `${(numer / denom) * 100}\\%`;
            const fraction = `\\frac{${numer}}{${denom}}`;

            const get = (type: string) => {
                if (type === "fraction") return fraction;
                if (type === "decimal") return decimal;
                return percent;
            };

            const latex = `\\text{Convert } ${get(from)} \\text{ to a ${to}.}`;
            const answer = get(to);

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            while (optionsSet.size < 4) {

                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * (d - 1)) + 1;

                const dec = (n / d).toString();
                const per = `${(n / d) * 100}\\%`;
                const frac = `\\frac{${n}}{${d}}`;

                optionsSet.add(
                    to === "fraction" ? frac :
                    to === "decimal" ? dec :
                    per
                );
            }

            return {
                latex,
                answer,
                equalValue: true,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D5: add decimals
        // -----------------------------
        if (difficulty === 5) {

            const a = (Math.random() * 5).toFixed(2);
            const b = (Math.random() * 5).toFixed(2);

            const sum = (Number(a) + Number(b)).toFixed(2);

            const options = [
                sum,
                (Number(sum) + 1).toFixed(2),
                (Number(sum) - 1).toFixed(2),
                (Number(sum) + 0.5).toFixed(2)
            ].sort(() => Math.random() - 0.5);

            return {
                latex: `${a} + ${b}`,
                answer: sum,
                options,
                forceOption: 0,
            };
        }

        // -----------------------------
        // D6: percentage of value
        // -----------------------------
        if (difficulty === 6) {

            const percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
            const value = Math.floor(Math.random() * 100) + 20;

            const result = (percent / 100) * value;

            const options = [
                `${result}`,
                `${result + 10}`,
                `${result - 10}`,
                `${result * 2}`
            ].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find } ${percent}\\% \\text{ of } ${value}`,
                answer: `${result}`,
                options,
                forceOption: 0,
            };
        }

        // -----------------------------
        // D7: reverse percentage
        // -----------------------------
        if (difficulty === 7) {

            const percent = [50, 25, 20][Math.floor(Math.random() * 3)];
            const original = Math.floor(Math.random() * 100) + 50;

            const reduced = parseFloat(((percent / 100) * original).toFixed(2));

            const options = [
                `${original}`,
                `${original + 20}`,
                `${original - 20}`,
                `${original * 2}`
            ].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{${reduced} is ${percent}\\% of what number?}`,
                answer: `${original}`,
                equalValue: true,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4, 5, 6, 7]),
    "ratio-and-proportion": createGenerator(({ difficulty }) => {
        const gcd = (a: number, b: number): number =>
            b === 0 ? a : gcd(b, a % b);

        // -----------------------------
        // D1: ratio from context
        // -----------------------------
        if (difficulty === 1) {

            const red = Math.floor(Math.random() * 10) + 1;
            const blue = Math.floor(Math.random() * 10) + 1;

            const answer = `${red}:${blue}`;

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const r = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                optionsSet.add(`${r}:${b}`);
            }

            return {
                latex: `\\text{A bag contains } ${red} \\text{ red balls and } ${blue} \\text{ blue balls. Write the ratio of red to blue.}`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D2: simplify ratio
        // -----------------------------
        if (difficulty === 2) {

            const baseA = Math.floor(Math.random() * 5) + 1;
            const baseB = Math.floor(Math.random() * 5) + 1;
            const factor = Math.floor(Math.random() * 5) + 2;

            const a = baseA * factor;
            const b = baseB * factor;

            const g = gcd(a, b);

            const simplified = `${a / g}:${b / g}`;

            const answers = [
                simplified,
                `${a}:${b}`
            ];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const r = Math.floor(Math.random() * 10) + 1;
                const s = Math.floor(Math.random() * 10) + 1;
                optionsSet.add(`${r}:${s}`);
            }

            return {
                latex: `\\text{Simplify the ratio } ${a}:${b}`,
                answer: answers,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D3: scale ratio
        // -----------------------------
        if (difficulty === 3) {

            const redRatio = Math.floor(Math.random() * 5) + 1;
            const blueRatio = Math.floor(Math.random() * 5) + 1;

            const multiplier = Math.floor(Math.random() * 5) + 2;

            const red = redRatio * multiplier;
            const blue = blueRatio * multiplier;

            const answer = `${blue}`;

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                optionsSet.add(String(Math.floor(Math.random() * 50) + 1));
            }

            return {
                latex: `\\text{The ratio of red to blue balls is } ${redRatio}:${blueRatio}. \\ \\\\\\text{If there are } ${red} \\ \\text{ red balls, how many blue balls are there?}`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D4: combine ratios
        // -----------------------------
        if (difficulty === 4) {

            const a = Math.floor(Math.random() * 5) + 1;
            const b1 = Math.floor(Math.random() * 5) + 1;
            const b2 = Math.floor(Math.random() * 5) + 1;
            const c = Math.floor(Math.random() * 5) + 1;

            // a:b and b:c → scale so middle matches
            const lcm = (b1 * b2) / gcd(b1, b2);

            const scale1 = lcm / b1;
            const scale2 = lcm / b2;

            const A = a * scale1;
            const B = lcm;
            const C = c * scale2;

            const g = gcd(gcd(A, B), C);

            const simplified = `${A / g}:${B / g}:${C / g}`;

            const answers = [
                simplified,
                `${A}:${B}:${C}`
            ];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const x = Math.floor(Math.random() * 10) + 1;
                const y = Math.floor(Math.random() * 10) + 1;
                const z = Math.floor(Math.random() * 10) + 1;
                optionsSet.add(`${x}:${y}:${z}`);
            }

            return {
                latex: `\\text{Given } a:b = ${a}:${b1} \\text{ and } b:c = ${b2}:${c}, \\\\ \\text{find } a:b:c \\text{ in its simplest form.}`,
                answer: answers,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "financial-maths": createGenerator(({ difficulty }) => {
        // -----------------------------
        // D1: profit / markup / loss
        // -----------------------------
        if (difficulty === 1) {

            const type = Math.floor(Math.random() * 3);
            let latex = "";
            let answer = "";
            const optionsSet = new Set<string>();

            if (type === 0) {
                // percentage profit
                const cost = (Math.floor(Math.random() * 200) + 50);
                const profitPercent = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
                const sell = parseFloat((cost * (1 + profitPercent / 100)).toFixed(2));

                latex = `\\text{An item costs £${cost} and is sold for £${sell}. Find the percentage profit.}`;

                answer = `${profitPercent}\\%`;

                optionsSet.add(answer);
                optionsSet.add(`${profitPercent + 5}\\%`);
                optionsSet.add(`${Math.max(0, profitPercent - 5)}\\%`);
                optionsSet.add(`${profitPercent + 10}\\%`);
            }

            else if (type === 1) {
                // markup → selling price
                const cost = Math.floor(Math.random() * 100) + 20;
                const markup = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
                const sell = cost * (1 + markup / 100);

                latex = `\\text{A shop buys an item for £${cost} and sells it at a } ${markup}\\% \\ \\text{markup. Find the selling price.}`;

                answer = `£${sell.toFixed(2)}`;

                optionsSet.add(answer);
                optionsSet.add(`£${(sell + 10).toFixed(2)}`);
                optionsSet.add(`£${Math.max(1, sell - 10).toFixed(2)}`);
                optionsSet.add(`£${(sell + 20).toFixed(2)}`);
            }

            else {
                // loss → original price
                const original = Math.floor(Math.random() * 400) + 200;
                const loss = [10, 20, 25, 30][Math.floor(Math.random() * 4)];
                const sell = parseFloat((original * (1 - loss / 100)).toFixed(2));

                latex = `\\text{An item is sold for £${sell} at a } ${loss}\\% \\ \\text{loss. Find the original price.}`;

                answer = `£${original}`;

                optionsSet.add(answer);
                optionsSet.add(`£${original + 50}`);
                optionsSet.add(`£${Math.max(1, original - 50)}`);
                optionsSet.add(`£${original + 100}`);
            }

            return {
                latex,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D2: currency conversion
        // -----------------------------
        if (difficulty === 2) {

            const type = Math.floor(Math.random() * 3);
            let latex = "";
            let answer = "";
            const optionsSet = new Set<string>();

            if (type === 0) {
                const rate = 1.1 + Math.random() * 0.5;
                const pounds = Math.floor(Math.random() * 500) + 50;
                const euros = Math.round(pounds * rate);

                latex = `\\text{£1 = €${rate.toFixed(2)}. Convert £${pounds} to euros.}`;
                answer = `€${euros}`;
            }

            else if (type === 1) {
                const rate = 1.1 + Math.random() * 0.5;
                const euros = Math.floor(Math.random() * 500) + 50;
                const pounds = Math.round(euros / rate);

                latex = `\\text{€${euros} is converted to pounds at £1 = €${rate.toFixed(2)}. How many pounds?}`;
                answer = `£${pounds}`;
            }

            else {
                const rate = 1.2 + Math.random() * 0.6;
                const dollars = Math.floor(Math.random() * 1000) + 100;
                const pounds = Math.round(dollars / rate);

                latex = `\\text{A cost is } \\$${dollars}. \\ \\text{If } £1 = \\$${rate.toFixed(2)}, \\text{find the cost in pounds.}`;
                answer = `£${pounds}`;
            }

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const noise = Math.floor(Math.random() * 50) - 25;
                const num = parseInt(answer.replace(/[^\d]/g, "")) + noise;

                if (answer.startsWith("£")) optionsSet.add(`£${Math.max(1, num)}`);
                else optionsSet.add(`€${Math.max(1, num)}`);
            }

            return {
                latex,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D3: simple interest
        // -----------------------------
        if (difficulty === 3) {

            const type = Math.floor(Math.random() * 3);
            let latex = "";
            let answer = "";
            const optionsSet = new Set<string>();

            if (type === 0) {
                const P = Math.floor(Math.random() * 1000) + 200;
                const r = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const t = Math.floor(Math.random() * 5) + 2;

                const interest = P * r * t / 100;
                const total = P + interest;

                latex = `\\text{£${P} is invested at } ${r}\\% \\text{ per year for } ${t} \\ \\text{years. Find the total amount.}`;
                answer = `£${total}`;
            }

            else if (type === 1) {
                const P = Math.floor(Math.random() * 1000) + 200;
                const r = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
                const t = Math.floor(Math.random() * 4) + 1;

                const interest = P * r * t / 100;

                latex = `\\text{A loan of £${P} is taken at } ${r}\\% \\text{ simple interest for } ${t} \\ \\text{years. How much interest is paid?}`;
                answer = `£${interest}`;
            }

            else {
                const P = 1000;
                const r = [2, 4, 5][Math.floor(Math.random() * 3)];
                const interest = Math.floor(Math.random() * 400) + 100;

                const t = interest / (P * r / 100);

                latex = `\\text{How long will it take £${P} to earn £${interest} interest at } ${r}\\% \\ \\text{per year?}`;
                answer = `${t} \\text{ years}`;
            }

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const noise = Math.floor(Math.random() * 200) - 100;
                const num = parseInt(answer.replace(/[^\d]/g, "")) + noise;

                if (answer.includes("years")) {
                    optionsSet.add(`${Math.max(1, num)} \\text{ years}`);
                } else {
                    optionsSet.add(`£${Math.max(1, num)}`);
                }
            }

            return {
                latex,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -----------------------------
        // D4: compound interest / growth
        // -----------------------------
        if (difficulty === 4) {

            const type = Math.floor(Math.random() * 3);
            let latex = "";
            let answer = "";
            const optionsSet = new Set<string>();

            if (type === 0) {
                const P = Math.floor(Math.random() * 1000) + 500;
                const r = [2, 3, 5][Math.floor(Math.random() * 3)];
                const t = Math.floor(Math.random() * 4) + 2;

                const A = Math.round(P * Math.pow(1 + r / 100, t));

                latex = `\\text{£${P} is invested at } ${r}\\% \\ \\text{compound interest for } ${t} \\ \\text{years. Find the final amount.}`;
                answer = `£${A}`;
            }

            else if (type === 1) {
                const P = Math.floor(Math.random() * 800) + 200;
                const r = [1, 2, 3][Math.floor(Math.random() * 3)];
                const t = Math.floor(Math.random() * 6) + 3;

                const A = Math.round(P * Math.pow(1 + r / 100, t));

                latex = `\\text{A savings account offers } ${r}\\% \\ \\text{compound interest annually.} \\\\\\text{How much will £${P} become after } ${t} \\ \\text{years?}`;
                answer = `£${A}`;
            }

            else {
                const P = Math.floor(Math.random() * 50000) + 10000;
                const r = [2, 3, 4][Math.floor(Math.random() * 3)];
                const t = Math.floor(Math.random() * 5) + 2;

                const A = Math.round(P * Math.pow(1 + r / 100, t));

                latex = `\\text{A population starts at } ${P}. \\ \\text{It grows by } ${r}\\% \\ \\text{ per year. Find the population after } ${t} \\ \\text{years.}`;
                answer = `${A}`;
            }

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const noise = Math.floor(Math.random() * 500) - 250;
                const num = parseInt(answer.replace(/[^\d]/g, "")) + noise;

                if (answer.startsWith("£")) {
                    optionsSet.add(`£${Math.max(1, num)}`);
                } else {
                    optionsSet.add(`${Math.max(1, num)}`);
                }
            }

            return {
                latex,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "algebraic-notation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {

            const variables = ["x", "y", "a", "b"];
            const ops = [
                { word: "add", type: "add", symbol: "+" },
                { word: "plus", type: "add", symbol: "+" },
                { word: "subtract", type: "sub", symbol: "-" },
                { word: "minus", type: "sub", symbol: "-" },
                { word: "times", type: "mul" },
                { word: "multiplied by", type: "mul" },
                { word: "divide by", type: "div" }
            ];

            const num = Math.floor(Math.random() * 9) + 1;
            const variable = variables[Math.floor(Math.random() * variables.length)];

            // random order: number-variable OR variable-number
            const leftIsNum = Math.random() < 0.5;

            const left = leftIsNum ? num : variable;
            const right = leftIsNum ? variable : num;

            const op = ops[Math.floor(Math.random() * ops.length)];

            const latex = `\\text{${left} ${op.word} ${right}. Write the exact algebraic notation.}`;

            let answer = "";

            // -----------------------------
            // ADD / SUB
            // -----------------------------
            if (op.type === "add") {
                answer = `${num}${variable}`; // order irrelevant for + but normalized
            }

            else if (op.type === "sub") {
                if (leftIsNum) {
                    answer = `${num} - ${variable}`;
                } else {
                    answer = `${variable} - ${num}`;
                }
            }

            // -----------------------------
            // MULTIPLICATION
            // -----------------------------
            else if (op.type === "mul") {
                answer = `${num}${variable}`;
            }

            // -----------------------------
            // DIVISION
            // -----------------------------
            else if (op.type === "div") {
                if (leftIsNum) {
                    answer = `\\frac{${num}}{${variable}}`;
                } else {
                    answer = `\\frac{${variable}}{${num}}`;
                }
            }

            const optionsSet = new Set<string>();
            optionsSet.add(answer);

            while (optionsSet.size < 4) {

                const wrongOp = ops[Math.floor(Math.random() * ops.length)];

                let wrong = "";

                if (wrongOp.type === "add") {
                    wrong = `${num}${variable}`;
                }
                else if (wrongOp.type === "sub") {
                    wrong = Math.random() < 0.5
                        ? `${num} - ${variable}`
                        : `${variable} - ${num}`;
                }
                else if (wrongOp.type === "mul") {
                    wrong = `${num}${variable}`;
                }
                else if (wrongOp.type === "div") {
                    wrong = Math.random() < 0.5
                        ? `\\frac{${num}}{${variable}}`
                        : `\\frac{${variable}}{${num}}`;
                }

                optionsSet.add(wrong);
            }

            return {
                latex,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1]),
    "simplifying-expressions": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const randVar = () => ["a", "x", "y", "z"][randInt(0, 3)];

        const simplifyFrac = (n: number, d: number) => {
            const g = gcd(n, d);
            n /= g;
            d /= g;
            if (d < 0) {
                n *= -1;
                d *= -1;
            }
            return { n, d };
        };

        const gcd = (a: number, b: number): number =>
            b === 0 ? Math.abs(a) : gcd(b, a % b);

        const frac = (n: number, d: number) => {
            if (n === 0) return "0";

            const sign = n * d < 0 ? "-" : "";
            const nn = Math.abs(n);
            const dd = Math.abs(d);

            const g = gcd(nn, dd);
            const sn = nn / g;
            const sd = dd / g;

            return sd === 1
                ? `${sign}${sn}`
                : `${sign}\\frac{${sn}}{${sd}}`;
        };

        const formatTerm = (c: number, v?: string) => {
            if (c === 0) return "";
            if (!v) return `${c}`;
            if (c === 1) return v;
            if (c === -1) return `-${v}`;
            return `${c}${v}`;
        };

        function buildExpression(terms: string[]): string {
            const filtered = terms
                .map(t => t?.trim())
                .filter(t => t && t !== "0");

            if (filtered.length === 0) return "0";

            let result = "";
            console.log(filtered)

            for (let i = 0; i < filtered.length; i++) {
                const term = filtered[i];

                if (i === 0) {
                    result += term.startsWith("-") ? term : term;
                } else {
                    if (term.startsWith("-")) {
                        result += " - " + term.slice(1);
                    } else {
                        result += " + " + term;
                    }
                }
            }
            console.log(result)

            return result;
        }

        const makeOptions = (correct: string, generator: () => string) => {
            const set = new Set<string>();
            set.add(correct);

            while (set.size < 4) {
                const opt = generator();
                if (opt && !opt.includes("0x") && opt !== "0") {
                    set.add(opt);
                }
            }

            return Array.from(set).sort(() => Math.random() - 0.5);
        };

        // -------------------------------------------------
        // D1: collect like terms (FIXED AGGREGATION MODEL)
        // -------------------------------------------------
        if (difficulty === 1) {
            const VAR_POOL = ["a", "x", "y", "z"];

            const vars: string[] = [];
            while (vars.length < 3) {
                const v = VAR_POOL[randInt(0, VAR_POOL.length - 1)];
                if (!vars.includes(v)) vars.push(v);
            }

            const coeffMap: Record<string, number> = Object.fromEntries(
                vars.map(v => [v, 0])
            );

            let constantSum = 0;
            const rawTerms: string[] = [];

            const termCount = randInt(4, 7);

            for (let i = 0; i < termCount; i++) {
                const type = randInt(0, 2);

                if (type === 0 || type === 1) {
                    const c = (type === 0 ? 1 : -1) * randInt(1, 5);
                    const v = vars[randInt(0, vars.length - 1)];

                    coeffMap[v] += c;
                    rawTerms.push(formatTerm(c, v));
                } else {
                    const c = randInt(-5, 5);
                    if (c !== 0) {
                        constantSum += c;
                        rawTerms.push(`${c}`);
                    }
                }
            }

            const simplified: string[] = [];

            for (const v of new Set(vars)) {
                const c = coeffMap[v];
                if (c !== 0) simplified.push(formatTerm(c, v));
            }

            if (constantSum !== 0) {
                simplified.push(`${constantSum}`);
            }
            
            console.log(coeffMap)
            console.log(simplified)

            const answer = simplified.length ? buildExpression(simplified) : "0";

            // question is purely raw expression (unsimplified)
            const question = buildExpression(rawTerms) || "0";

            const options = makeOptions(answer, () => {
                const v = randVar();
                const c = randInt(-5, 5);
                const k = randInt(-5, 5);

                const parts: string[] = [];
                if (c !== 0) parts.push(formatTerm(c, v));
                if (k !== 0) parts.push(`${k}`);

                return buildExpression(parts.length ? parts : ["0"]);
            });

            return {
                latex: `\\text{Simplify: } ${question}`,
                answer,
                checkWeakLatexEquivalent: true,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2: expand brackets
        // -------------------------------------------------
        if (difficulty === 2) {
            const c = randInt(-5, 5) || 1;
            const v = randVar();
            const a = randInt(-5, 5);
            const b = randInt(-5, 5);

            const latex = `\\text{Expand: } ${c}(${a}${v} + ${b})`;

            const x = c * a;
            const k = c * b;

            // FIX: filter empty strings so buildExpression doesn't produce " + 5"
            const answer = buildExpression(
                [x !== 0 ? formatTerm(x, v) : "", k !== 0 ? `${k}` : ""].filter(Boolean)
            ) || "0";

            return {
                latex,
                answer,
                checkWeakLatexEquivalent: true,
                options: makeOptions(answer, () => {
                    const c2 = randInt(-5, 5) || 1;
                    const a2 = randInt(-5, 5);
                    const b2 = randInt(-5, 5);

                    const x2 = c2 * a2;
                    const k2 = c2 * b2;

                    return buildExpression(
                        [x2 !== 0 ? formatTerm(x2, v) : "", k2 !== 0 ? `${k2}` : ""].filter(Boolean)
                    ) || "0";
                }),
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D3: fractions outside brackets
        // -------------------------------------------------
        if (difficulty === 3) {
            const n = randInt(-5, 5) || 1;
            const d = randInt(2, 6);

            const v = randVar();
            const a = randInt(-5, 5);
            const b = randInt(-5, 5);

            const latex = `\\text{Expand: } ${frac(n, d)}(${a}${v} + ${b})`;

            // FIX: filter empty strings
            const answer = buildExpression(
                [
                    a !== 0 ? `${frac(n * a, d)}${v}` : "",
                    b !== 0 ? `${frac(n * b, d)}` : "",
                ].filter(Boolean)
            ) || "0";

            return {
                latex,
                answer,
                checkWeakLatexEquivalent: true,
                options: makeOptions(answer, () => {
                    const n2 = randInt(-5, 5) || 1;
                    const d2 = randInt(2, 6);
                    const a2 = randInt(-5, 5) || 1;  // FIX: guaranteed non-zero to avoid stalling makeOptions
                    const b2 = randInt(-5, 5);

                    return buildExpression(
                        [
                            `${frac(n2 * a2, d2)}${v}`,
                            b2 !== 0 ? `${frac(n2 * b2, d2)}` : "",
                        ].filter(Boolean)
                    ) || "0";
                }),
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D4: mixed expressions
        // -------------------------------------------------
        if (difficulty === 4) {
            const v = randVar();

            const c1 = randInt(1, 4);
            const c2 = randInt(1, 4);

            const n1 = randInt(-4, 4) || 1;
            const d1 = randInt(2, 5);

            const n2 = randInt(-4, 4) || 1;
            const d2 = randInt(2, 5);

            const k1 = randInt(-5, 5);
            const k2 = randInt(-5, 5);
            const k3 = randInt(-5, 5);

            const term1Var = simplifyFrac(c1 * n1, d1);
            const term2Var = simplifyFrac(c2 * n2, d2);

            const varCoeff = simplifyFrac(
                term1Var.n * term2Var.d - term2Var.n * term1Var.d,
                term1Var.d * term2Var.d
            );

            const constTotal = c1 * k1 - c2 * k2 + k3;

            const latex =
                `\\text{Simplify: } ${c1}(${frac(n1, d1)}${v} + ${k1}) - ${c2}(${frac(n2, d2)}${v} + ${k2}) + ${k3}`;

            const answerParts: string[] = [];

            if (varCoeff.n !== 0) {
                answerParts.push(
                    varCoeff.d === 1
                        ? formatTerm(varCoeff.n, v)
                        : `${frac(varCoeff.n, varCoeff.d)}${v}`
                );
            }

            if (constTotal !== 0) {
                answerParts.push(`${constTotal}`);
            }

            // FIX: use buildExpression instead of manual join + brittle regex replace
            const answer = answerParts.length ? buildExpression(answerParts) : "0";

            return {
                latex,
                answer,
                checkWeakLatexEquivalent: true,
                options: makeOptions(answer, () => {
                    const a = randInt(-3, 3) || 1;
                    const b = randInt(-3, 3) || 1;
                    const c = randInt(-3, 3) || 1;

                    const coeff = simplifyFrac(a, randInt(2, 5));

                    const parts: string[] = [];

                    if (coeff.n !== 0) {
                        parts.push(
                            coeff.d === 1 ? formatTerm(coeff.n, v) : `${frac(coeff.n, coeff.d)}${v}`
                        );
                    }

                    // FIX: collapse b and c into a single constant term
                    // (previously pushed separately, producing "3x + 2 + -1")
                    const constD = b + c;
                    if (constD !== 0) parts.push(`${constD}`);

                    return buildExpression(parts.length ? parts : ["0"]);
                }),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "expanding-and-factorising": createGenerator(({ difficulty }) => {
        let latex = "";
        let answer = "";

        // -----------------------------
        // DIFFICULTY 1: a(x + b)
        // -----------------------------
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 9) + 1;

            latex = `\\text{Expand: } ${a}(x + ${b})`;
            answer = `${a}x + ${a * b}`;
        }

        // -----------------------------
        // DIFFICULTY 2: (x + a)(x + b)
        // -----------------------------
        else if (difficulty === 2) {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;

            const middle = a + b;
            const constant = a * b;

            latex = `\\text{Expand: } (x + ${a})(x + ${b})`;
            answer = `x^2 + ${middle}x + ${constant}`;
        }

        // -----------------------------
        // DIFFICULTY 3: factorise ax + ab
        // -----------------------------
        else if (difficulty === 3) {
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 9) + 1;

            latex = `\\text{Factorise: } ${a}x + ${a * b}`;
            answer = `${a}(x + ${b})`;
        }

        // -----------------------------
        // DIFFICULTY 4: factorise quadratic
        // -----------------------------
        else if (difficulty === 4) {
            const a = Math.floor(Math.random() * 9) + 1;
            const b = Math.floor(Math.random() * 9) + 1;

            const middle = a + b;
            const constant = a * b;

            latex = `\\text{Factorise: } x^2 + ${middle}x + ${constant}`;
            answer = `(x + ${a})(x + ${b})`;
        }

        // -----------------------------
        // DIFFICULTY 5: expand + simplify (multiple parts, randomised)
        // -----------------------------
        else if (difficulty === 5) {

            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 5) + 1;

            const p = Math.floor(Math.random() * 5) + 1; // replaces 1
            const q = Math.floor(Math.random() * 3) + 1; // coefficient of x

            const e = Math.floor(Math.random() * 4) + 1;
            const c = Math.floor(Math.random() * 5) + 1;
            const d = Math.floor(Math.random() * 5) + 1;

            // expression
            latex = `\\text{Expand and simplify: } (${a}x + ${b})(${p} - ${q}x) + ${e}x(${c} + ${d})`;

            // expand (ax + b)(p - qx)
            // = apx - aqx^2 + bp - bqx
            const x2 = -a * q;
            const x1_part1 = a * p - b * q;
            const constant = b * p;

            // expand ex(c + d)
            const x1_part2 = e * (c + d);

            const x1 = x1_part1 + x1_part2;

            // build answer
            const parts: string[] = [];

            if (x2 === -1) parts.push(`-x^2`);
            else if (x2 === 1) parts.push(`x^2`);
            else parts.push(`${x2}x^2`);

            if (x1 !== 0) parts.push(`${x1}x`);
            if (constant !== 0) parts.push(`${constant}`);

            answer = parts.join(" + ").replace(/\+\s-/g, "- ");
        }

        else {
            throw new Error(`Unhandled difficulty: ${difficulty}`);
        }

        // -----------------------------
        // OPTIONS
        // -----------------------------
        const optionsSet = new Set<string>();
        optionsSet.add(answer);

        while (optionsSet.size < 4) {
            const variation = Math.floor(Math.random() * 5) - 2;

            const wrong = answer
                .replace(/\d+/g, (n) => String(Math.max(1, Number(n) + variation)));

            optionsSet.add(wrong);
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        return {
            latex,
            answer,
            checkWeakLatexEquivalent: true,
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4, 5]),
    "substitution": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {

            // variable values
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;

            // coefficients
            const c1 = Math.floor(Math.random() * 8) + 1;
            const c2 = Math.floor(Math.random() * 8) + 1;

            // optional constant
            const constant = Math.floor(Math.random() * 11) - 5;

            // randomly choose signs
            const sign1 = Math.random() < 0.5 ? 1 : -1;
            const sign2 = Math.random() < 0.5 ? 1 : -1;

            // build expression string manually
            let expression = "";

            // first term
            const term1 = sign1 * c1;
            expression += (term1 === 1 ? "a" : term1 === -1 ? "-a" : `${term1}a`);

            // second term
            const term2 = sign2 * c2;
            if (term2 < 0) {
                expression += " - " + (Math.abs(term2) === 1 ? "b" : `${Math.abs(term2)}b`);
            } else {
                expression += " + " + (term2 === 1 ? "b" : `${term2}b`);
            }

            // constant term (optional)
            if (constant !== 0) {
                if (constant < 0) {
                    expression += " - " + Math.abs(constant);
                } else {
                    expression += " + " + constant;
                }
            }

            // calculate answer
            const answerValue =
                term1 * a +
                term2 * b +
                constant;

            const answer = `${answerValue}`;

            // simple wrong options
            const options = [answer];
            while (options.length < 4) {
                const wrong = `${answerValue + (Math.floor(Math.random() * 11) - 5)}`;
                if (!options.includes(wrong)) {
                    options.push(wrong);
                }
            }

            // shuffle
            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{If } a=${a},\\ b=${b},\\ \\text{ find } ${expression}`,
                answer,
                checkEqualMathJS: false,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // variable values
            let a = Math.floor(Math.random() * 5) + 1;
            let b = Math.floor(Math.random() * 5) + 1;

            const type = Math.floor(Math.random() * 3);

            let expression = "";
            let answerValue = 0;

            // -----------------------------
            // TYPE 1: a^2 + b^2
            // -----------------------------
            if (type === 0) {

                expression = `a^2 + b^2`;
                answerValue = a * a + b * b;
            }

            // -----------------------------
            // TYPE 2: √a + b^2 (force a square)
            // -----------------------------
            else if (type === 1) {

                const squareValues = [1, 4, 9, 16];
                a = squareValues[Math.floor(Math.random() * squareValues.length)];

                expression = `\\sqrt{a} + b^2`;
                answerValue = Math.sqrt(a) + b * b;
            }

            // -----------------------------
            // TYPE 3: 2a^2 - √b (force b square)
            // -----------------------------
            else {

                const squareValues = [1, 4, 9, 16];
                b = squareValues[Math.floor(Math.random() * squareValues.length)];

                expression = `2a^2 - \\sqrt{b}`;
                answerValue = 2 * a * a - Math.sqrt(b);
            }

            const answer = `${answerValue}`;

            // options
            const options = [answer];
            while (options.length < 4) {
                const wrong = `${answerValue + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) {
                    options.push(wrong);
                }
            }

            // shuffle
            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{If } a=${a},\\ b=${b},\\ \\text{ find } ${expression}`,
                answer,
                checkEqualMathJS: false,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2]),
    "linear-equations": createGenerator(({ difficulty }) => {
        // -----------------------------
        // D1: ax + b = c
        // -----------------------------
        if (difficulty === 1) {

            const v = ["x", "y", "a"][Math.floor(Math.random() * 3)];

            const solution = Math.floor(Math.random() * 10) - 5;

            const m = Math.floor(Math.random() * 5) + 1;
            const c = Math.floor(Math.random() * 11) - 5;

            const rhs = m * solution + c;

            let left = m === 1 ? v : `${m}${v}`;
            if (c !== 0) left += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;

            const equation = `${left} = ${rhs}`;
            const answer = `${solution}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${solution + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Solve: } ${equation}`,
                answer,
                checkEqualMathJS: false,
                options,
                forceOption: 0,
            };
        }

        // -----------------------------
        // D2: ax + b = cx + d
        // -----------------------------
        if (difficulty === 2) {

            const v = ["x", "y", "a"][Math.floor(Math.random() * 3)];

            const solution = Math.floor(Math.random() * 10) - 5;

            let a = Math.floor(Math.random() * 5) + 1;
            let c = Math.floor(Math.random() * 5) + 1;

            // ensure a ≠ c (otherwise no solution or infinite)
            while (a === c) {
                c = Math.floor(Math.random() * 5) + 1;
            }

            const b = Math.floor(Math.random() * 11) - 5;
            const d = Math.floor(Math.random() * 11) - 5;

            // build equation using solution
            const leftVal = a * solution + b;
            const rightVal = c * solution + d;

            // build left side
            let left = a === 1 ? v : `${a}${v}`;
            if (b !== 0) left += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;

            // build right side
            let right = c === 1 ? v : `${c}${v}`;
            if (d !== 0) right += d > 0 ? ` + ${d}` : ` - ${Math.abs(d)}`;

            const equation = `${left} = ${right}`;
            const answer = `${solution}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${solution + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Solve: } ${equation}`,
                answer,
                checkEqualMathJS: false,
                options,
                forceOption: 0,
            };
        }

        // -----------------------------
        // D3: a(x + b) = c  OR  (x + b)/a = c
        // -----------------------------
        if (difficulty === 3) {

            const v = ["x", "y", "a"][Math.floor(Math.random() * 3)];

            const solution = Math.floor(Math.random() * 10) - 5;

            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 6) - 3;

            // build bracket expression
            let bracket = v;
            if (b !== 0) {
                bracket += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            const isMultiply = Math.random() < 0.5;

            let equation: string;

            if (isMultiply) {
                // a(x + b) = RHS
                const rhs = a * (solution + b);
                equation = `${a}(${bracket}) = ${rhs}`;
            } else {
                // (x + b)/a = RHS
                const rhs = (solution + b) / a;

                // avoid ugly decimals → force integer RHS
                if (!Number.isInteger(rhs)) {
                    // fallback to multiplication case
                    const rhsFix = a * (solution + b);
                    equation = `${a}(${bracket}) = ${rhsFix}`;
                } else {
                    equation = `\\frac{${bracket}}{${a}} = ${rhs}`;
                }
            }

            const answer = `${solution}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${solution + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Solve: } ${equation}`,
                answer,
                checkEqualMathJS: false,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3]),
    "simultaneous-equations": createGenerator(({ difficulty }) => {

        if (difficulty === 1) {

            // generate clean integer solution first
            const xVal = Math.floor(Math.random() * 7) - 3; // -3 to 3
            const yVal = Math.floor(Math.random() * 7) - 3;

            // coefficients (keep simple)
            const a1 = 1; // ensures easy solving
            const b1 = Math.floor(Math.random() * 5) + 1;

            const a2 = 1;
            const b2 = -(Math.floor(Math.random() * 5) + 1);

            // build RHS using solution
            const c1 = a1 * xVal + b1 * yVal;
            const c2 = a2 * xVal + b2 * yVal;

            // build equation 1: x + by = c
            let eq1 = "x";
            if (b1 !== 0) {
                eq1 += b1 > 0 ? ` + ${b1}y` : ` - ${Math.abs(b1)}y`;
            }
            eq1 += ` = ${c1}`;

            // build equation 2: x - by = c
            let eq2 = "x";
            if (b2 !== 0) {
                eq2 += b2 > 0 ? ` + ${Math.abs(b2)}y` : ` - ${Math.abs(b2)}y`;
            }
            eq2 += ` = ${c2}`;

            const answer = [`x=${xVal}, y=${yVal}`, `y=${yVal}, x=${xVal}`];

            // simple wrong options
            const options = [`x=${xVal}, y=${yVal}`];
            while (options.length < 4) {
                const wrongX = xVal + (Math.floor(Math.random() * 5) - 2);
                const wrongY = yVal + (Math.floor(Math.random() * 5) - 2);
                const wrong = `x=${wrongX}, y=${wrongY}`;
                if (!options.includes(wrong)) {
                    options.push(wrong);
                }
            }

            // shuffle
            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Solve, } \\\\ ${eq1} \\\\ ${eq2} \\\\ \\text{. Give your answer in the form } x=?,\\ y=?`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {

            // generate clean integer solution
            const xVal = Math.floor(Math.random() * 7) - 3;
            const yVal = Math.floor(Math.random() * 7) - 3;

            // coefficients (now not identical → requires elimination step)
            let a1 = Math.floor(Math.random() * 3) + 1; // 1–3
            let a2 = Math.floor(Math.random() * 3) + 1;

            // ensure at least one coefficient > 1
            if (a1 === 1 && a2 === 1) {
                if (Math.random() < 0.5) {
                    a1 = Math.floor(Math.random() * 2) + 2; // 2–3
                } else {
                    a2 = Math.floor(Math.random() * 2) + 2; // 2–3
                }
            }

            let b1 = Math.floor(Math.random() * 3) + 1;
            let b2 = -(Math.floor(Math.random() * 3) + 1);

            // avoid proportional equations (no unique solution)
            while (a1 * b2 === a2 * b1) {
                a2 = Math.floor(Math.random() * 3) + 1;
                b2 = -(Math.floor(Math.random() * 3) + 1);
            }

            // build RHS
            const c1 = a1 * xVal + b1 * yVal;
            const c2 = a2 * xVal + b2 * yVal;

            // equation 1
            let eq1 = a1 === 1 ? "x" : `${a1}x`;
            if (b1 !== 0) {
                eq1 += b1 > 0 ? ` + ${b1}y` : ` - ${Math.abs(b1)}y`;
            }
            eq1 += ` = ${c1}`;

            // equation 2
            let eq2 = a2 === 1 ? "x" : `${a2}x`;
            if (b2 !== 0) {
                eq2 += b2 > 0 ? ` + ${Math.abs(b2)}y` : ` - ${Math.abs(b2)}y`;
            }
            eq2 += ` = ${c2}`;

            const answer = [`x=${xVal}, y=${yVal}`, `y=${yVal}, x=${xVal}`];

            // options
            const options = [`x=${xVal}, y=${yVal}`];
            while (options.length < 4) {
                const wrongX = xVal + (Math.floor(Math.random() * 5) - 2);
                const wrongY = yVal + (Math.floor(Math.random() * 5) - 2);
                const wrong = `x=${wrongX}, y=${wrongY}`;
                if (!options.includes(wrong)) {
                    options.push(wrong);
                }
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Solve, } \\\\ ${eq1} \\\\ ${eq2} \\\\ \\text{. Give your answer in the form } x=?,\\ y=?`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // -------------------------------------------------
            // 1. GENERATE SOLUTION FIRST
            // -------------------------------------------------
            const xVal = Math.floor(Math.random() * 6) + 1; // strictly positive
            const yVal = Math.floor(Math.random() * 6) + 1; // strictly positive

            // -------------------------------------------------
            // 2. TEMPLATE BANK (NO RANDOM INSIDE)
            // -------------------------------------------------
            const templates = [

                // -------------------------------------------------
                // 1. SHOP PURCHASES (2 independent transactions)
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{A shop sells item A for £${p1} and item B for £${p2}. } \\\\
            \\text{Customer 1 buys ${a} of A and ${b} of B costing £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Customer 2 buys ${c} of A and ${d} of B costing £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 2. STATIONERY SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Pens cost £${p1} and pencils cost £${p2}. } \\\\
            \\text{A student buys ${a} pens and ${b} pencils costing £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Another student buys ${c} pens and ${d} pencils costing £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 3. SWEETS
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Chocolates cost £${p1}, sweets cost £${p2}. } \\\\
            \\text{Order 1: ${a} chocolates and ${b} sweets cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} chocolates and ${d} sweets cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 4. CAFE
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Coffee costs £${p1}, tea costs £${p2}. } \\\\
            \\text{Order 1: ${a} coffees and ${b} teas cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} coffees and ${d} teas cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 5. CINEMA SNACK BAR
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Popcorn costs £${p1}, drinks cost £${p2}. } \\\\
            \\text{Order 1: ${a} popcorn and ${b} drinks cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} popcorn and ${d} drinks cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 6. SPORTS SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Footballs cost £${p1}, basketballs cost £${p2}. } \\\\
            \\text{Order 1: ${a} footballs and ${b} basketballs cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} footballs and ${d} basketballs cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 7. BOOKSTORE
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Novels cost £${p1}, comics cost £${p2}. } \\\\
            \\text{Order 1: ${a} novels and ${b} comics cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} novels and ${d} comics cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 8. SCHOOL SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Notebooks cost £${p1}, folders cost £${p2}. } \\\\
            \\text{Order 1: ${a} notebooks and ${b} folders cost £${p1 * (a * xVal + b * yVal)}. } \\\\
            \\text{Order 2: ${c} notebooks and ${d} folders cost £${p1 * (c * xVal + d * yVal)}. } \\\\
            \\text{Find } x \\text{ and } y.`,
                })

            ];

            // -------------------------------------------------
            // 3. SAFE PARAMETERS (NO NEGATIVE USAGE)
            // -------------------------------------------------
            const price1 = Math.floor(Math.random() * 5) + 2;
            const price2 = Math.floor(Math.random() * 4) + 1;
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 3) + 1;
            const c = Math.floor(Math.random() * 3) + 1;
            const d = Math.floor(Math.random() * 3) + 1;

            // -------------------------------------------------
            // 4. PICK TEMPLATE
            // -------------------------------------------------
            const templateFn = templates[Math.floor(Math.random() * templates.length)];

            const { latex } = templateFn(price1, price2, a, b, c, d);

            // -------------------------------------------------
            // 5. ANSWER
            // -------------------------------------------------
            const answer = [`x=${xVal}, y=${yVal}`, `y=${yVal}, x=${xVal}`];

            // -------------------------------------------------
            // 6. OPTIONS
            // -------------------------------------------------
            const options = [`x=${xVal}, y=${yVal}`];

            while (options.length < 4) {
                const wrongX = Math.max(1, xVal + (Math.floor(Math.random() * 3) - 1));
                const wrongY = Math.max(1, yVal + (Math.floor(Math.random() * 3) - 1));

                const wrong = `x=${wrongX}, y=${wrongY}`;
                if (!options.includes(wrong)) {
                    options.push(wrong);
                }
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3]),
    "quadratic-equations": createGenerator(({ difficulty }) => {
        // -------------------------------------------------
        // D1: (x+a)(x+b)=0
        // -------------------------------------------------
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 6) + 1;
            const b = Math.floor(Math.random() * 6) + 1;

            const r1 = -a;
            const r2 = -b;

            const latex =
                `\\text{Solve: } (x + ${a})(x + ${b}) = 0`;

            const answer = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`
            ];

            const options = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`,
            ];

            while (options.length < 4) {
                const dx = Math.floor(Math.random() * 5) - 2;
                const dy = Math.floor(Math.random() * 5) - 2;

                const x = r1 + dx;
                const y = r2 + dy;

                if (x === 0 || y === 0) continue;

                const opt = `x=${x}, ${y}`;
                if (!options.includes(opt)) options.push(opt);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2: (ax+b)(cx+d)=0
        // -------------------------------------------------
        if (difficulty === 2) {
            const a = Math.floor(Math.random() * 4) + 1;
            const b = Math.floor(Math.random() * 6) + 1;
            const c = Math.floor(Math.random() * 4) + 1;
            const d = Math.floor(Math.random() * 6) + 1;

            const r1 = -b / a;
            const r2 = -d / c;

            const r1i = Math.round(r1);
            const r2i = Math.round(r2);

            const latex =
                `\\text{Solve: } (${a}x + ${b})(${c}x + ${d}) = 0`;

            const answer = [
                `x=${r1i}, ${r2i}`,
                `x=${r2i}, ${r1i}`
            ];

            const options = [
                `x=${r1i}, ${r2i}`,
                `x=${r2i}, ${r1i}`,
            ];

            while (options.length < 4) {
                const dx = Math.floor(Math.random() * 5) - 2;
                const dy = Math.floor(Math.random() * 5) - 2;

                const x = r1i + dx;
                const y = r2i + dy;

                if (x === 0 || y === 0) continue;

                const opt = `x=${x}, ${y}`;
                if (!options.includes(opt)) options.push(opt);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D3: x^2 + ax + b
        // -------------------------------------------------
        if (difficulty === 3) {
            const r1 = Math.floor(Math.random() * 8) + 1;
            const r2 = Math.floor(Math.random() * 8) + 1;

            const a = -(r1 + r2);
            const b = r1 * r2;

            const latex =
                `\\text{Solve: } x^2 + ${a}x + ${b} = 0`;

            const answer = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`
            ];

            const options = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`,
            ];

            while (options.length < 4) {
                const dx = Math.floor(Math.random() * 5) - 2;
                const dy = Math.floor(Math.random() * 5) - 2;

                const x = r1 + dx;
                const y = r2 + dy;

                if (x === 0 || y === 0) continue;

                const opt = `x=${x}, ${y}`;
                if (!options.includes(opt)) options.push(opt);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D4: ax^2 + bx + c (factorable)
        // -------------------------------------------------
        if (difficulty === 4) {
            const r1 = Math.floor(Math.random() * 8) + 1;
            const r2 = Math.floor(Math.random() * 8) + 1;

            const a = Math.floor(Math.random() * 4) + 1;

            const b = -a * (r1 + r2);
            const c = a * r1 * r2;

            const latex =
                `\\text{Solve: } ${a}x^2 + ${b}x + ${c} = 0`;

            const answer = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`
            ];

            const options = [
                `x=${r1}, ${r2}`,
                `x=${r2}, ${r1}`,
            ];

            while (options.length < 4) {
                const dx = Math.floor(Math.random() * 5) - 2;
                const dy = Math.floor(Math.random() * 5) - 2;

                const x = r1 + dx;
                const y = r2 + dy;

                if (x === 0 || y === 0) continue;

                const opt = `x=${x}, ${y}`;
                if (!options.includes(opt)) options.push(opt);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "inequalities": createGenerator(({ difficulty }) => {
        const rels = ["<", "<=", ">", ">="];

        const makeOptions = (correct: string, x: number) => {
            const options = new Set<string>();
            options.add(correct);

            const all = [
                `x < ${x}`,
                `x <= ${x}`,
                `x > ${x}`,
                `x >= ${x}`,
                `x < ${x + 1}`,
                `x > ${x - 1}`,
                `x <= ${x + 1}`,
                `x >= ${x - 1}`
            ];

            while (options.size < 4) {
                const opt = all[Math.floor(Math.random() * all.length)];
                options.add(opt);
            }

            return Array.from(options).sort(() => Math.random() - 0.5);
        };

        // -------------------------------------------------
        // D1
        // -------------------------------------------------
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 5) + 1;
            const x = Math.floor(Math.random() * 8) + 1;
            const b = Math.floor(Math.random() * 10);

            const rhs = a * x + b;

            const flip = Math.random() < 0.5;
            const rel = flip ? "<=" : "<";

            const latex =
                `\\text{Solve: } ${a}x + ${b} ${rel} ${rhs}`;

            const correct = flip
                ? `x <= ${x}`
                : `x < ${x}`;

            const options = makeOptions(correct, x);

            return {
                latex,
                answer: [correct],
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2
        // -------------------------------------------------
        if (difficulty === 2) {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10);

            let c = Math.floor(Math.random() * 5) + 1;
            while (c === a) {
                c = Math.floor(Math.random() * 5) + 1;
            }

            const d = Math.floor(Math.random() * 10);
            const x = Math.floor(Math.random() * 8) + 1;

            const lhsAtX = a * x + b;
            const rhsAtX = c * x + d;

            const isLess = lhsAtX < rhsAtX;

            const latex =
                `\\text{Solve: } ${a}x + ${b} < ${c}x + ${d}`;

            const correct = isLess ? `x < ${x}` : `x > ${x}`;

            const options = makeOptions(correct, x);

            return {
                latex,
                answer: [correct],
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D3
        // -------------------------------------------------
        if (difficulty === 3) {
            const a = Math.floor(Math.random() * 4) + 1;
            const b = Math.floor(Math.random() * 5) + 1;
            const c = Math.floor(Math.random() * 4) + 1;
            const d = Math.floor(Math.random() * 5) + 1;

            const x = Math.floor(Math.random() * 8) + 1;

            const latex =
                `\\text{Solve: } ${a}(x + ${b}) < ${c}(x + ${d})`;

            const rel = Math.random() < 0.5 ? "<" : "<=";

            const correct =
                Math.random() < 0.5
                    ? `x ${rel} ${x}`
                    : `x ${rel === "<" ? "<=" : ">="} ${x}`;

            const options = makeOptions(correct, x);

            return {
                latex,
                answer: [correct],
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D4
        // -------------------------------------------------
        if (difficulty === 4) {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10);

            const x = Math.floor(Math.random() * 5) + 1;

            const lhs = a * x + b;

            const left = lhs - (Math.floor(Math.random() * 5) + 1);
            const right = lhs + (Math.floor(Math.random() * 5) + 1);

            const middle = b === 0 ? `${a}x` : `${a}x + ${b}`;

            const latex =
                `\\text{Solve: } ${left} < ${middle} < ${right}`;

            // -------------------------------------------------
            // FRACTION CONVERTER (inline, no helpers)
            // -------------------------------------------------
            const format = (n: number, d: number) => {
                const sign = n * d < 0 ? "-" : "";
                n = Math.abs(n);
                d = Math.abs(d);

                const g = (a: number, b: number): number =>
                    b === 0 ? a : g(b, a % b);

                const gg = g(n, d);

                n /= gg;
                d /= gg;

                return d === 1
                    ? `${sign}${n}`
                    : `${sign}\\frac{${n}}{${d}}`;
            };

            const solLeft = (left - b);
            const solRight = (right - b);

            const min = solLeft / a;
            const max = solRight / a;

            const answer = [
                `${format(min, 1)} < x < ${format(max, 1)}`, `${format(max, 1)} > x > ${format(min, 1)}`
            ];

            const options = [
                answer[0],
                `${format(min + 1, 1)} < x < ${format(max, 1)}`,
                `${format(min, 1)} < x < ${format(max + 1, 1)}`,
                `${format(min - 1, 1)} < x < ${format(max, 1)}`
            ].sort(() => Math.random() - 0.5);

            return {
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "arithmetic-sequences": createGenerator(({ difficulty }) => {
        // -------------------------------------------------
        // D1: given nth term → list first 5 terms
        // -------------------------------------------------
        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 7) - 3; // can be negative
            const b = Math.floor(Math.random() * 10) - 5;

            // build expression cleanly
            let expr = `${a}n`;
            if (b !== 0) {
                expr += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            const terms: number[] = [];
            for (let n = 1; n <= 5; n++) {
                terms.push(a * n + b);
            }

            const answer = terms.join(", ");

            const options = [answer];
            while (options.length < 4) {
                const wrong = terms
                    .map(t => t + (Math.floor(Math.random() * 5) - 2))
                    .join(", ");

                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{The nth term is } ${expr}. \\\\ \\text{Write the first 5 terms.}`,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2: given sequence → find nth term
        // -------------------------------------------------
        if (difficulty === 2) {
            const a = Math.floor(Math.random() * 6) + 1; // keep positive for clarity
            const b = Math.floor(Math.random() * 10) - 5;

            const seq: number[] = [];
            for (let n = 1; n <= 5; n++) {
                seq.push(a * n + b);
            }

            let expr = `${a}n`;
            if (b !== 0) {
                expr += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            const answer = expr;

            const options = [answer];
            while (options.length < 4) {
                const wrongA = a + (Math.floor(Math.random() * 3) - 1);
                const wrongB = b + (Math.floor(Math.random() * 5) - 2);

                let wrong = `${wrongA}n`;
                if (wrongB !== 0) {
                    wrong += wrongB > 0 ? ` + ${wrongB}` : ` - ${Math.abs(wrongB)}`;
                }

                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find the nth term of the sequence: } ${seq.join(", ")}`,
                answer,
                checkWeakLatexEquivalent: true,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D3: quadratic (n^2 type) → list first 5 terms
        // -------------------------------------------------
        if (difficulty === 3) {
            const a = Math.floor(Math.random() * 3) + 1; // keep small
            const b = Math.floor(Math.random() * 5) - 2;

            let expr = `${a}n^2`;
            if (b !== 0) {
                expr += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            const terms: number[] = [];
            for (let n = 1; n <= 5; n++) {
                terms.push(a * n * n + b);
            }

            const answer = terms.join(", ");

            const options = [answer];
            while (options.length < 4) {
                const wrong = terms
                    .map(t => t + (Math.floor(Math.random() * 5) - 2))
                    .join(", ");

                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{The nth term is } ${expr}. \\\\ \\text{Write the first 5 terms.}`,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3]),
    "geometric-sequences": createGenerator(({ difficulty }) => {
        // -------------------------------------------------
        // D1: find common ratio
        // -------------------------------------------------
        if (difficulty === 1) {

            const start = Math.floor(Math.random() * 5) + 1;

            let ratio = Math.floor(Math.random() * 5) + 2; // 2 → 6
            if (Math.random() < 0.3) ratio *= -1; // sometimes negative

            const seq: number[] = [start];

            for (let i = 1; i < 5; i++) {
                seq.push(seq[i - 1] * ratio);
            }

            const answer = `${ratio}`;

            const options = [answer];

            while (options.length < 4) {
                const wrong = `${ratio + (Math.floor(Math.random() * 5) - 2)}`;
                if (
                    wrong !== answer &&
                    wrong !== "1" &&   // avoid trivial
                    !options.includes(wrong)
                ) {
                    options.push(wrong);
                }
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find the multiplier between terms in the sequence: } ${seq.join(", ")}`,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1]),
    "functions-basic-understanding": createGenerator(({ difficulty }) => {
        // -------------------------------------------------
        // D1: function machine (SVG)
        // -------------------------------------------------
        if (difficulty === 1) {

            const x = Math.floor(Math.random() * 6) + 1;

            const ops = ["add", "sub", "mul", "div"];
            const opType = ops[Math.floor(Math.random() * ops.length)];

            const k = Math.floor(Math.random() * 5) + 1;

            let output = 0;
            let label = "";

            if (opType === "add") {
                output = x + k;
                label = `+${k}`;
            } else if (opType === "sub") {
                output = x - k;
                label = `-${k}`;
            } else if (opType === "mul") {
                output = x * k;
                label = `×${k}`;
            } else {
                output = x / k;
                label = `÷${k}`;
            }

            const svg = `
            <svg width="220" height="100" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="50" x2="70" y2="50" stroke="black"/>
                <line x1="150" y1="50" x2="210" y2="50" stroke="black"/>
                <rect x="70" y="25" width="80" height="50" fill="none" stroke="black"/>
                <text x="25" y="45" font-size="12">input</text>
                <text x="160" y="45" font-size="12">output</text>
                <text x="110" y="58" font-size="28" text-anchor="middle">${label}</text>
            </svg>
            `;

            const answer = `${output}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${output + (Math.floor(Math.random() * 5) - 2)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{If the input is } ${x}, \\text{ what is the output?}`,
                svg,
                checkWeakLatexEquivalent: true,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2: f(x) = ax + b
        // -------------------------------------------------
        if (difficulty === 2) {

            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10) - 5;
            const x = Math.floor(Math.random() * 6) + 1;

            const result = a * x + b;

            let expr = `${a}x`;
            if (b !== 0) {
                expr += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            const answer = `${result}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${result + (Math.floor(Math.random() * 5) - 2)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Given } f(x) = ${expr}, \\text{ find } f(${x}).`,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D3: f(x) = ax^2 + bx + c
        // -------------------------------------------------
        if (difficulty === 3) {

            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 6) - 3;
            const c = Math.floor(Math.random() * 6) - 3;
            const x = Math.floor(Math.random() * 5) + 1;

            const result = a * x * x + b * x + c;

            let expr = `${a}x^2`;

            if (b !== 0) {
                expr += b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
            }

            if (c !== 0) {
                expr += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
            }

            const answer = `${result}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${result + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Given } f(x) = ${expr}, \\text{ find } f(${x}).`,
                answer,
                options,
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D4: composite functions f(g(x))
        // -------------------------------------------------
        if (difficulty === 4) {

            const a = Math.floor(Math.random() * 4) + 1;
            const b = Math.floor(Math.random() * 5) - 2;

            const c = Math.floor(Math.random() * 4) + 1;
            const d = Math.floor(Math.random() * 5) - 2;

            const x = Math.floor(Math.random() * 5) + 1;

            const gx = c * x + d;
            const result = a * gx + b;

            let fExpr = `${a}x`;
            if (b !== 0) {
                fExpr += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
            }

            let gExpr = `${c}x`;
            if (d !== 0) {
                gExpr += d > 0 ? ` + ${d}` : ` - ${Math.abs(d)}`;
            }

            const answer = `${result}`;

            const options = [answer];
            while (options.length < 4) {
                const wrong = `${result + (Math.floor(Math.random() * 7) - 3)}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            options.sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Given } f(x) = ${fExpr} \\text{ and } g(x) = ${gExpr}, \\\\ \\text{find } f(g(${x})).`,
                answer,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2, 3, 4]),
    "linear-graphs": createGenerator(({ difficulty }) => {
        const formatSlopeTerm = (slope: number) => {
            if (slope === 1) return "x";
            if (slope === -1) return "-x";
            if (slope === 0.5) return `\\frac{1}{2}x`;
            if (slope === -0.5) return `-\\frac{1}{2}x`;
            return `${slope}x`;
        };

        const formatInterceptTerm = (c: number) => {
            if (c === 0) return "";
            return c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
        };

        const formatEquation = (m: number, c: number) => {
            const slopeStr = formatSlopeTerm(m);
            const interceptStr = formatInterceptTerm(c);
            return `y=${slopeStr}${interceptStr}`;
        };

        const chooseRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

        if (difficulty === 1) {
            const questions = [
                {
                    latex: `\\text{Which of these is the general equation of a straight line?}`,
                    answer: `y=mx+c`,
                    options: [`y = mx + c`, `y=ax^2+bx+c`, `x^2+y^2=r^2`, `y=\\frac{m}{x}+c`],
                },
                {
                    latex: `\\text{In } y=mx+c, \\text{what does } m \\text{ represent?}`,
                    answer: `gradient`,
                    options: [`Gradient`, `y-Intercept`, `x-Intercept`, `Constant`],
                },
                {
                    latex: `\\text{In } y=mx+c, \\text{what does } c \\text{ represent?}`,
                    answer: `y-intercept`,
                    options: [`Gradient`, `y-Intercept`, `x-Intercept`, `Constant`],
                },
                {
                    latex: `\\text{True or false: } y=mx+c \\text{ always represents a straight line.}`,
                    answer: `True`,
                    options: [`True`, `False`],
                },
            ];

            const question = chooseRandom(questions);
            return {
                latex: question.latex,
                answer: question.answer,
                options: question.options.sort(() => Math.random() - 0.5),
                forceOption: 2,
            };
        }

        const xMin = 0;
        const xMax = 6;
        const yMin = 0;
        const yMax = 10;
        const graphWidth = 160;
        const graphHeight = 160;
        const left = 40;
        const top = 20;

        const slopeOptions = [2, 1, 0.5, -0.5, -1, -2];
        const interceptOptions = [0, 1, 2, 3, 4, 5];

        let slope = 1;
        let intercept = 0;
        let x0 = 0;
        let y0 = 0;
        let x1 = 3;
        let y1 = 0;

        const x1Candidate = (s: number) => (s === 0.5 || s === -0.5 ? 4 : 3);

        for (let attempts = 0; attempts < 50; attempts++) {
            slope = chooseRandom(slopeOptions);
            intercept = chooseRandom(interceptOptions);
            x1 = x1Candidate(slope);
            y0 = intercept;
            y1 = slope * x1 + intercept;

            if (y0 >= yMin && y0 <= yMax && y1 >= yMin && y1 <= yMax) {
                break;
            }
        }

        const answer = formatEquation(slope, intercept);

        const wrongEquations = new Set<string>();
        const candidateSlopes = [slope + 1, slope - 1, -slope, slope === 0.5 ? 1 : 0.5, slope === -0.5 ? -1 : -0.5];
        const candidateIntercepts = [intercept + 1, intercept - 1, intercept + 2, intercept - 2];

        for (const m of candidateSlopes) {
            if (wrongEquations.size >= 3) break;
            if (m === slope) continue;
            wrongEquations.add(formatEquation(m, intercept));
        }

        for (const c of candidateIntercepts) {
            if (wrongEquations.size >= 3) break;
            if (c === intercept) continue;
            if (c >= yMin && c <= yMax) {
                wrongEquations.add(formatEquation(slope, c));
            }
        }

        while (wrongEquations.size < 3) {
            const m = chooseRandom([1, 2, -1, -2, 0.5, -0.5]);
            const c = chooseRandom([0, 1, 2, 3, 4, 5]);
            const wrong = formatEquation(m, c);
            if (wrong !== answer) wrongEquations.add(wrong);
        }

        const options = [answer, ...Array.from(wrongEquations).slice(0, 3)];

        const toPx = (x: number, y: number) => {
            const px = left + ((x - xMin) / (xMax - xMin)) * graphWidth;
            const py = top + graphHeight - ((y - yMin) / (yMax - yMin)) * graphHeight;
            return { px, py };
        };

        const p0 = toPx(x0, y0);
        const p1 = toPx(x1, y1);

        const tickLines = Array.from({ length: xMax - xMin + 1 }, (_, i) => {
            const x = xMin + i;
            const px = left + (i / (xMax - xMin)) * graphWidth;
            return `<line x1="${px}" y1="${top}" x2="${px}" y2="${top + graphHeight}" stroke="#ddd" stroke-width="1" />`;
        }).join("\n");

        const yTicks = Array.from({ length: yMax - yMin + 1 }, (_, i) => {
            const y = yMin + i;
            const py = top + graphHeight - (i / (yMax - yMin)) * graphHeight;
            return `<line x1="${left}" y1="${py}" x2="${left + graphWidth}" y2="${py}" stroke="#eee" stroke-width="1" />`;
        }).join("\n");

        const labelX = Math.max(0, p0.px - 34);

        const svg = `
            <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                ${tickLines}
                ${yTicks}
                <line x1="${left}" y1="${top}" x2="${left}" y2="${top + graphHeight}" stroke="black" stroke-width="2" />
                <line x1="${left}" y1="${top + graphHeight}" x2="${left + graphWidth}" y2="${top + graphHeight}" stroke="black" stroke-width="2" />
                <text x="${left + graphWidth + 8}" y="${top + graphHeight + 4}" font-size="12">x</text>
                <text x="${left - 10}" y="${top - 6}" font-size="12">y</text>
                <line x1="${p0.px}" y1="${p0.py}" x2="${p1.px}" y2="${p1.py}" stroke="blue" stroke-width="2" />
                <circle cx="${p0.px}" cy="${p0.py}" r="3" fill="red" />
                <circle cx="${p1.px}" cy="${p1.py}" r="3" fill="red" />
                <text x="${labelX}" y="${p0.py - 6}" font-size="10">(${x0},${y0})</text>
                <text x="${p1.px + 6}" y="${p1.py - 6}" font-size="10">(${x1},${y1})</text>
            </svg>
        `;

        return {
            latex: `\\text{Write down the equation of the line shown on the graph.}`,
            svg,
            answer,
            checkWeakLatexEquivalent: true,
            options: options.sort(() => Math.random() - 0.5),
            forceOption: 0,
        };
    }, [1, 2]),
    "quadratic-graphs": createGenerator(({ difficulty }) => {
        const chooseRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

        if (difficulty === 1) {
            const questions = [
                {
                    latex: `\\text{What is the general form of a quadratic equation?}`,
                    answer: `ax^2 + bx + c = 0`,
                    options: [`ax^2 + bx + c = 0`, `ax + b = 0`, `ax^2 + bx + c`, `x^2 + y^2 = r^2`],
                },
                {
                    latex: `\\text{What does the discriminant ($b^2 - 4ac$) tell us about the roots?}`,
                    answer: `Number of real roots`,
                    options: [`Number of real roots`, `The roots themselves`, `The vertex`, `The axis of symmetry`],
                },
                {
                    latex: `\\text{If the discriminant is positive, how many real roots does the quadratic have?}`,
                    answer: `Two distinct real roots`,
                    options: [`Two distinct real roots`, `One real root`, `No real roots`, `Complex roots`],
                },
                {
                    latex: `\\text{If the discriminant is zero, how many real roots does the quadratic have?}`,
                    answer: `One repeated real root`,
                    options: [`One repeated real root`, `Two distinct real roots`, `No real roots`, `Complex roots`],
                },
                {
                    latex: `\\text{If the discriminant is negative, how many real roots does the quadratic have?}`,
                    answer: `No real roots`,
                    options: [`No real roots`, `One real root`, `Two distinct real roots`, `Complex roots`],
                },
            ];

            const question = chooseRandom(questions);
            return {
                latex: question.latex,
                answer: question.answer,
                options: question.options.sort(() => Math.random() - 0.5),
                forceOption: 2,
            };
        }

        const xMin = -8;
        const xMax = 8;
        const yMin = -8;
        const yMax = 8;
        const graphWidth = 400;
        const graphHeight = 400;
        const left = 60;
        const top = 40;
        const svgWidth = left + graphWidth + 60;
        const svgHeight = top + graphHeight + 50;

        const toPx = (x: number, y: number) => {
            const px = left + ((x - xMin) / (xMax - xMin)) * graphWidth;
            const py = top + graphHeight - ((y - yMin) / (yMax - yMin)) * graphHeight;
            return { px, py };
        };

        const buildGridAndLabels = () => {
            const parts: string[] = [];
            const { px: originPx, py: originPy } = toPx(0, 0);

            for (let i = xMin; i <= xMax; i++) {
                const { px } = toPx(i, 0);
                parts.push(`<line x1="${px}" y1="${top}" x2="${px}" y2="${top + graphHeight}" stroke="#e0e0e0" stroke-width="1" />`);
                if (i !== 0) {
                    parts.push(`<text x="${px}" y="${originPy + 18}" font-size="13" text-anchor="middle" fill="#333">${i}</text>`);
                }
            }

            for (let i = yMin; i <= yMax; i++) {
                const { py } = toPx(0, i);
                parts.push(`<line x1="${left}" y1="${py}" x2="${left + graphWidth}" y2="${py}" stroke="#e0e0e0" stroke-width="1" />`);
                if (i !== 0) {
                    parts.push(`<text x="${originPx - 10}" y="${py + 4}" font-size="13" text-anchor="end" fill="#333">${i}</text>`);
                }
            }

            parts.push(`<text x="${originPx - 10}" y="${originPy + 16}" font-size="13" text-anchor="middle" fill="#333">0</text>`);

            return parts.join('\n');
        };

        const buildAxes = () => {
            const { px: originPx, py: originPy } = toPx(0, 0);
            return `
                <line x1="${originPx}" y1="${top}" x2="${originPx}" y2="${top + graphHeight}" stroke="black" stroke-width="2" />
                <line x1="${left}" y1="${originPy}" x2="${left + graphWidth}" y2="${originPy}" stroke="black" stroke-width="2" />
                <text x="${left + graphWidth + 20}" y="${originPy + 4}" font-size="15" fill="black">x</text>
                <text x="${originPx + 8}" y="${top - 10}" font-size="15" fill="black">y</text>
            `;
        };

        const buildPath = (a: number, b: number, c: number) => {
            const pathPoints: string[] = [];
            let penDown = false;
            for (let x = xMin - 0.5; x <= xMax + 0.5; x += 0.05) {
                const y = a * x * x + b * x + c;
                const xInBounds = x >= xMin && x <= xMax;
                const yInBounds = y >= yMin && y <= yMax;

                if (!xInBounds || !yInBounds) {
                    penDown = false;
                    continue;
                }

                const { px, py } = toPx(x, y);
                pathPoints.push(`${penDown ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`);
                penDown = true;
            }
            return pathPoints.join(' ');
        };

        const generateRootsAndCoeffs = () => {
            const root1 = Math.floor(Math.random() * 9) - 4;
            let root2 = Math.floor(Math.random() * 9) - 4;
            while (root2 === root1) root2 = Math.floor(Math.random() * 9) - 4;

            // Constrain a so the vertex stays within yMin/yMax
            // vertex_y = a * (root1*root2 - (root1+root2)^2/4)
            const vertexFactor = Math.abs(root1 * root2 - Math.pow(root1 + root2, 2) / 4);
            const maxA = vertexFactor > 0 ? Math.floor(8 / vertexFactor) : 3;
            const a = Math.min(Math.max(1, Math.floor(Math.random() * 3) + 1), Math.max(1, maxA));

            const b = -a * (root1 + root2);
            const c = a * root1 * root2;

            return { root1, root2, a, b, c };
        };

        if (difficulty === 2) {
            const { root1, root2, a, b, c } = generateRootsAndCoeffs();

            const answer = [`x=${root1}, ${root2}`, `x=${root2}, ${root1}`];

            const options = [`x=${root1}, ${root2}`];
            while (options.length < 4) {
                const wrong1 = root1 + (Math.floor(Math.random() * 3) - 1);
                const wrong2 = root2 + (Math.floor(Math.random() * 3) - 1);
                const wrong = `x=${wrong1}, ${wrong2}`;
                if (!options.includes(wrong)) options.push(wrong);
            }

            const pathData = buildPath(a, b, c);

            const svg = `
                <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
                    ${buildGridAndLabels()}
                    ${buildAxes()}
                    <path d="${pathData}" stroke="blue" stroke-width="2.5" fill="none" />
                </svg>
            `;

            return {
                latex: `\\text{Find the roots of the quadratic shown on the graph.}`,
                svg,
                answer,
                options: options.sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const { root1, root2, a, b, c } = generateRootsAndCoeffs();

            const formatTerm = (coeff: number, power: number) => {
                if (coeff === 0) return "";
                if (power === 2) {
                    if (coeff === 1) return "x^2";
                    if (coeff === -1) return "-x^2";
                    return `${coeff}x^2`;
                }
                if (power === 1) {
                    if (coeff === 1) return "x";
                    if (coeff === -1) return "-x";
                    return `${coeff}x`;
                }
                return `${coeff}`;
            };

            const terms = [];
            if (a !== 0) terms.push(formatTerm(a, 2));
            if (b !== 0) terms.push(formatTerm(b, 1));
            if (c !== 0) terms.push(formatTerm(c, 0));
            const equation = terms.join(" + ").replace(/\+ -/g, "- ");

            const answer = equation;

            const options = [answer];
            while (options.length < 4) {
                const wrongA = a + (Math.floor(Math.random() * 3) - 1);
                const wrongB = b + (Math.floor(Math.random() * 3) - 1);
                const wrongC = c + (Math.floor(Math.random() * 3) - 1);
                const wrongTerms = [];
                if (wrongA !== 0) wrongTerms.push(formatTerm(wrongA, 2));
                if (wrongB !== 0) wrongTerms.push(formatTerm(wrongB, 1));
                if (wrongC !== 0) wrongTerms.push(formatTerm(wrongC, 0));
                const wrong = wrongTerms.join(" + ").replace(/\+ -/g, "- ");
                if (wrong && !options.includes(wrong)) options.push(wrong);
            }

            const pathData = buildPath(a, b, c);

            const svg = `
                <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
                    ${buildGridAndLabels()}
                    ${buildAxes()}
                    <path d="${pathData}" stroke="blue" stroke-width="2.5" fill="none" />
                </svg>
            `;

            return {
                latex: `\\text{Write down the equation of the quadratic shown on the graph.}`,
                svg,
                answer,
                checkWeakLatexEquivalent: true,
                options: options.sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3]),
    "angles-rules-parallel-lines": createGenerator(({ difficulty }) => {
        const chooseRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

        // Helper to draw an arc with angle label
        const drawArcWithLabel = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number, label: string) => {
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const start = toRad(startAngle);
            const end = toRad(endAngle);
            const x1 = cx + radius * Math.cos(start);
            const y1 = cy + radius * Math.sin(start);
            const x2 = cx + radius * Math.cos(end);
            const y2 = cy + radius * Math.sin(end);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            const midAngle = toRad((startAngle + endAngle) / 2);
            const labelRadius = radius + 20;
            const lx = cx + labelRadius * Math.cos(midAngle);
            const ly = cy + labelRadius * Math.sin(midAngle);
            return {
                arc: `<path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}" stroke="black" stroke-width="3" fill="none" />`,
                label: `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="black">${label}</text>`,
            };
        };

        // -------------------------------------------------
        // D1: Identify the angle rule
        // -------------------------------------------------
        if (difficulty === 1) {
            const rules = Math.floor(Math.random() * 5);
            let svg = "";
            let answer = "";

            if (rules === 0) {
                // Alternate angles
                answer = "Alternate";
                const y1 = 80, y2 = 180;
                const arc1 = drawArcWithLabel(100, y1, 30, 0, 58, "a");
                const arc2 = drawArcWithLabel(160, y2, 30, 180, 238, "a");
                svg = `
                    <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="${y1}" x2="240" y2="${y1}" stroke="black" stroke-width="2" />
                        <line x1="20" y1="${y2}" x2="240" y2="${y2}" stroke="black" stroke-width="2" />
                        <line x1="80" y1="40" x2="180" y2="220" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                    </svg>
                `;
            } else if (rules === 1) {
                // Allied angles
                answer = "Allied";
                const y1 = 80, y2 = 180;
                const arc1 = drawArcWithLabel(100, y1, 30, 0, 58, "b");
                const arc2 = drawArcWithLabel(160, y2, 30, -122, 0, "b");
                svg = `
                    <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="${y1}" x2="240" y2="${y1}" stroke="black" stroke-width="2" />
                        <line x1="20" y1="${y2}" x2="240" y2="${y2}" stroke="black" stroke-width="2" />
                        <line x1="80" y1="40" x2="180" y2="220" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                    </svg>
                `;
            } else if (rules === 2) {
                // Corresponding angles
                answer = "Corresponding";
                const y1 = 80, y2 = 180;
                const arc1 = drawArcWithLabel(100, y1, 30, 0, 58, "c");
                const arc2 = drawArcWithLabel(158, y2, 30, 0, 60, "c");
                svg = `
                    <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="${y1}" x2="240" y2="${y1}" stroke="black" stroke-width="2" />
                        <line x1="20" y1="${y2}" x2="240" y2="${y2}" stroke="black" stroke-width="2" />
                        <line x1="80" y1="40" x2="180" y2="220" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                    </svg>
                `;
            } else if (rules === 3) {
                // Vertical opposite angles
                answer = "Vertical Opposite";
                const arc1 = drawArcWithLabel(120, 120, 30, -45, 45, "d");
                const arc2 = drawArcWithLabel(120, 120, 30, 135, 225, "d");
                svg = `
                    <svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="40" y1="40" x2="200" y2="200" stroke="black" stroke-width="2" />
                        <line x1="200" y1="40" x2="40" y2="200" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                    </svg>
                `;
            } else {
                // Angles around a point
                answer = "Angles Around a Point";
                const angles = [360];
                let currentAngle = 0;
                let svgArcs = "";
                const labels = ["a"];

                for (let i = 0; i < angles.length; i++) {
                    const arc = drawArcWithLabel(140, 140, 50, currentAngle, currentAngle + angles[i], labels[i]);
                    svgArcs += arc.arc + arc.label;
                    currentAngle += angles[i];
                }

                svg = `
                    <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="140" cy="140" r="50" fill="none" stroke="#ddd" stroke-width="1" />
                        <circle cx="140" cy="140" r="3" fill="black" />
                        ${svgArcs}
                    </svg>
                `;
            }

            return {
                latex: `\\text{What angle rule is shown?}`,
                svg,
                answer,
                options: ["Alternate", "Allied", "Corresponding", "Vertical Opposite", "Angles Around a Point"].sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // -------------------------------------------------
        // D2: One-step angle finding with visual
        // -------------------------------------------------
        if (difficulty === 2) {
            const ruleType = Math.floor(Math.random() * 5);
            let svg = "";
            let answer = "";

            if (ruleType === 0) {
                // Alternate angles
                const givenAngle = Math.floor(Math.random() * 70) + 30;
                answer = `${givenAngle}`;

                const y1 = 90, y2 = 190;
                const cx = 150;

                // arcs stay the same but centered around middle
                const arc1 = drawArcWithLabel(120, y1, 30, 0, 58, `${givenAngle}°`);
                const arc2 = drawArcWithLabel(175, y2, 30, 180, 238, "?");

                svg = `
                <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">

                    <!-- horizontal lines (centered) -->
                    <line x1="50" y1="${y1}" x2="250" y2="${y1}" stroke="black" stroke-width="2" />
                    <line x1="50" y1="${y2}" x2="250" y2="${y2}" stroke="black" stroke-width="2" />

                    <!-- slanted transversal (centered) -->
                    <line x1="${cx - 50}" y1="50" x2="${cx + 50}" y2="240" stroke="black" stroke-width="2" />

                    ${arc1.arc}
                    ${arc1.label}
                    ${arc2.arc}
                    ${arc2.label}

                    <text x="150" y="270" text-anchor="middle" font-size="14" fill="#666">
                        Diagram not drawn accurately
                    </text>
                </svg>
                `;
            } else if (ruleType === 1) {
                // Allied angles
                const givenAngle = Math.floor(Math.random() * 70) + 30;
                const unknownAngle = 180 - givenAngle;
                answer = `${unknownAngle}`;
                const y1 = 80, y2 = 180;
                const arc1 = drawArcWithLabel(100, y1, 30, 0, 58, `${givenAngle}°`);
                const arc2 = drawArcWithLabel(160, y2, 30, -122, 0, "?");
                svg = `
                    <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="${y1}" x2="240" y2="${y1}" stroke="black" stroke-width="2" />
                        <line x1="20" y1="${y2}" x2="240" y2="${y2}" stroke="black" stroke-width="2" />
                        <line x1="80" y1="40" x2="180" y2="220" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                        <text x="150" y="270" text-anchor="middle" font-size="14" fill="#666">Diagram not drawn accurately</text>
                    </svg>
                `;
            } else if (ruleType === 2) {
                // Corresponding angles
                const givenAngle = Math.floor(Math.random() * 70) + 30;
                answer = `${givenAngle}`;
                const y1 = 80, y2 = 180;
                const arc1 = drawArcWithLabel(100, y1, 30, 0, 58, `${givenAngle}°`);
                const arc2 = drawArcWithLabel(158, y2, 30, 0, 60, "?");
                svg = `
                    <svg width="300" height="280" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="${y1}" x2="240" y2="${y1}" stroke="black" stroke-width="2" />
                        <line x1="20" y1="${y2}" x2="240" y2="${y2}" stroke="black" stroke-width="2" />
                        <line x1="80" y1="40" x2="180" y2="220" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                        <text x="150" y="270" text-anchor="middle" font-size="14" fill="#666">Diagram not drawn accurately</text>
                    </svg>
                `;
            } else if (ruleType === 3) {
                // Vertical opposite angles
                const givenAngle = Math.floor(Math.random() * 70) + 30;
                answer = `${givenAngle}`;
                const arc1 = drawArcWithLabel(120, 120, 30, -45, 45, `${givenAngle}°`);
                const arc2 = drawArcWithLabel(120, 120, 30, 135, 225, "?");
                svg = `
                    <svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                        <line x1="40" y1="40" x2="200" y2="200" stroke="black" stroke-width="2" />
                        <line x1="200" y1="40" x2="40" y2="200" stroke="black" stroke-width="2" />
                        ${arc1.arc}
                        ${arc1.label}
                        ${arc2.arc}
                        ${arc2.label}
                        <text x="140" y="270" text-anchor="middle" font-size="14" fill="#666">Diagram not drawn accurately</text>
                    </svg>
                `;
            } else {
                // Angles around a point
                const angle1 = Math.floor(Math.random() * 60) + 40;
                const angle2 = Math.floor(Math.random() * 60) + 40;
                const angle3 = Math.floor(Math.random() * 60) + 40;
                const unknown = 360 - angle1 - angle2 - angle3;
                answer = `${unknown}`;

                const angles = [angle1, angle2, angle3, unknown];
                let currentAngle = 0;
                let svgArcs = "";
                const labels = [`${angle1}°`, `${angle2}°`, `${angle3}°`, "?"];

                for (let i = 0; i < angles.length; i++) {
                    const arc = drawArcWithLabel(140, 140, 50, currentAngle, currentAngle + angles[i], labels[i]);
                    svgArcs += arc.arc + arc.label;
                    currentAngle += angles[i];
                }

                svg = `
                    <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="140" cy="140" r="50" fill="none" stroke="#ddd" stroke-width="1" />
                        <circle cx="140" cy="140" r="3" fill="black" />
                        ${svgArcs}
                        <text x="150" y="270" text-anchor="middle" font-size="14" fill="#666">Diagram not drawn accurately</text>
                    </svg>
                `;
            }

            const answerNum = Number(answer);
            const options = [answer];
            while (options.length < 4) {
                const offset = Math.floor(Math.random() * 20) - 10;
                const wrong = String(Math.max(1, answerNum + offset));
                if (!options.includes(wrong)) options.push(wrong);
            }

            return {
                latex: `\\text{Find the angle marked with } ?`,
                svg,
                answer,
                options: options.sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2]),
    "properties-of-polygons": createGenerator(({ difficulty }) => {
        const chooseRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
        // Polygon data: name, sides, interior angle (regular), exterior angle
        const polygons = [
            { name: "Triangle",     sides: 3,  interior: 60,  exterior: 120 },
            { name: "Quadrilateral",sides: 4,  interior: 90,  exterior: 90  },
            { name: "Pentagon",     sides: 5,  interior: 108, exterior: 72  },
            { name: "Hexagon",      sides: 6,  interior: 120, exterior: 60  },
            { name: "Heptagon",     sides: 7,  interior: Math.round(900/7), exterior: Math.round(360/7) },
            { name: "Octagon",      sides: 8,  interior: 135, exterior: 45  },
            { name: "Nonagon",      sides: 9,  interior: 140, exterior: 40  },
            { name: "Decagon",      sides: 10, interior: 144, exterior: 36  },
        ];

        // Draw a regular polygon SVG centred at (cx,cy) with given radius and n sides
        const drawPolygon = (n: number, cx: number, cy: number, r: number, showAngle: "interior" | "exterior" | "none" = "none") => {
            const points: [number, number][] = [];
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
            }
            const ptStr = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
            let angleMarkup = "";

            if (showAngle !== "none" && n >= 3) {
                // Use the first vertex (top) and its two neighbours
                const [vx, vy] = points[0];
                const [ax, ay] = points[n - 1]; // previous vertex
                const [bx, by] = points[1];     // next vertex

                const len = 28;
                // unit vectors from vertex toward each neighbour
                const dAx = ax - vx, dAy = ay - vy;
                const dBx = bx - vx, dBy = by - vy;
                const magA = Math.hypot(dAx, dAy);
                const magB = Math.hypot(dBx, dBy);
                const uAx = dAx / magA, uAy = dAy / magA;
                const uBx = dBx / magB, uBy = dBy / magB;

                if (showAngle === "interior") {
                    // Arc between the two edges, inside the polygon
                    const p1x = vx + uAx * len, p1y = vy + uAy * len;
                    const p2x = vx + uBx * len, p2y = vy + uBy * len;
                    // interior angle < 180 always for convex polygon → largeArc = 0
                    angleMarkup = `
                        <path d="M ${p1x.toFixed(1)} ${p1y.toFixed(1)} A ${len} ${len} 0 0 1 ${p2x.toFixed(1)} ${p2y.toFixed(1)}"
                            stroke="#E24B4A" stroke-width="2" fill="none"/>
                        <text x="${(vx + (uAx + uBx) * 24).toFixed(1)}" y="${(vy + (uAy + uBy) * 24 + 5).toFixed(1)}"
                            text-anchor="middle" font-size="15" font-weight="bold" fill="#E24B4A">?</text>`;
                } else {
                    // Exterior angle: extend edge A beyond the vertex, arc to edge B direction
                    const extX = vx - uAx * len, extY = vy - uAy * len; // extension of incoming edge
                    const p2x = vx + uBx * len, p2y = vy + uBy * len;
                    angleMarkup = `
                        <path d="M ${extX.toFixed(1)} ${extY.toFixed(1)} A ${len} ${len} 0 0 1 ${p2x.toFixed(1)} ${p2y.toFixed(1)}"
                            stroke="#185FA5" stroke-width="2" fill="none"/>
                        <line x1="${vx.toFixed(1)}" y1="${vy.toFixed(1)}" x2="${(vx - uAx * (len + 10)).toFixed(1)}" y2="${(vy - uAy * (len + 10)).toFixed(1)}"
                            stroke="black" stroke-width="1.5" stroke-dasharray="4 3"/>
                        <text x="${(vx + (-uAx + uBx) * 22).toFixed(1)}" y="${(vy + (-uAy + uBy) * 22 - 8).toFixed(1)}"
                            text-anchor="middle" font-size="15" font-weight="bold" fill="#185FA5">?</text>`;
                }
            }

            return { ptStr, angleMarkup, points };
        };

        // ─────────────────────────────────────────────────────────────────────
        // D1: Name a polygon → how many edges?
        // ─────────────────────────────────────────────────────────────────────
        if (difficulty === 1) {
            const poly = chooseRandom(polygons);

            const wrongSides = new Set<string>();
            const candidates = [poly.sides - 1, poly.sides + 1, poly.sides - 2, poly.sides + 2]
                .filter(n => n >= 3 && n !== poly.sides);
            for (const c of candidates) {
                if (wrongSides.size < 3) wrongSides.add(String(c));
            }
            while (wrongSides.size < 3) {
                const offset = Math.floor(Math.random() * 4) + 1;
                const w = String(poly.sides + (Math.random() < 0.5 ? offset : -offset));
                if (Number(w) >= 3 && w !== String(poly.sides)) wrongSides.add(w);
            }

            const options = [String(poly.sides), ...wrongSides].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{How many edges does a } \\textbf{${poly.name}} \\text{ have?}`,
                svg: "",
                answer: String(poly.sides),
                options,
                forceOption: 0,
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // D2: Show polygon SVG → find interior or exterior angle
        // ─────────────────────────────────────────────────────────────────────
        if (difficulty === 2) {
            const eligiblePolygons = polygons.filter(p => p.sides !== 7);
            const poly = chooseRandom(eligiblePolygons);
            const angleType = Math.random() < 0.5 ? "interior" : "exterior";
            const correctAngle = angleType === "interior" ? poly.interior : poly.exterior;

            const W = 300, H = 300;
            const cx = 140, cy = 145, r = 100;

            // Build polygon points
            const points: [number, number][] = [];
            for (let i = 0; i < poly.sides; i++) {
                const angle = (Math.PI * 2 * i) / poly.sides - Math.PI / 2;
                points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
            }
            const ptStr = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

            // Use vertex index 0 (top) and its neighbours
            const [vx, vy] = points[0];
            const [ax, ay] = points[poly.sides - 1]; // previous vertex (left neighbour)
            const [bx, by] = points[1];              // next vertex (right neighbour)

            const arcR = 30;
            // Unit vectors FROM vertex TOWARD each neighbour (i.e. along the edges, inward)
            const dAx = ax - vx, dAy = ay - vy;
            const dBx = bx - vx, dBy = by - vy;
            const magA = Math.hypot(dAx, dAy);
            const magB = Math.hypot(dBx, dBy);
            const uAx = dAx / magA, uAy = dAy / magA;
            const uBx = dBx / magB, uBy = dBy / magB;

            let angleMarkup = "";

            if (angleType === "interior") {
                // Arc from edge-toward-A to edge-toward-B, sweeping INSIDE the polygon.
                // For a convex polygon with vertex at top, A is bottom-left and B is bottom-right,
                // so we sweep clockwise (sweep-flag=1) from the A-side to the B-side.
                const p1x = vx + uAx * arcR, p1y = vy + uAy * arcR;
                const p2x = vx + uBx * arcR, p2y = vy + uBy * arcR;

                // Label: push along the average inward direction, further from vertex
                const midUx = uAx + uBx, midUy = uAy + uBy;
                const midMag = Math.hypot(midUx, midUy);
                const labelDist = 52;
                const lx = vx + (midUx / midMag) * labelDist;
                const ly = vy + (midUy / midMag) * labelDist;

                angleMarkup = `
                    <path d="M ${p1x.toFixed(1)} ${p1y.toFixed(1)} A ${arcR} ${arcR} 0 0 0 ${p2x.toFixed(1)} ${p2y.toFixed(1)}"
                        stroke="#000000" stroke-width="2" fill="none"/>
                    <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
                        text-anchor="middle" dominant-baseline="middle"
                        font-size="15" font-weight="bold" fill="#000000">?</text>`;
            } else {
                // Exterior angle: arc between the extended-incoming-edge and the outgoing edge.
                // Extend the edge coming FROM A (i.e. reverse uA direction) beyond the vertex.
                const extX = vx - uAx * arcR, extY = vy - uAy * arcR;
                const p2x = vx + uBx * arcR, p2y = vy + uBy * arcR;

                // Label: average of the two arms (-uA and uB), pushed further out
                const midUx = -uAx + uBx, midUy = -uAy + uBy;
                const midMag = Math.hypot(midUx, midUy);
                const labelDist = 50;
                const lx = vx + (midUx / midMag) * labelDist;
                const ly = vy + (midUy / midMag) * labelDist;

                angleMarkup = `
                    <line x1="${vx.toFixed(1)}" y1="${vy.toFixed(1)}"
                        x2="${(vx - uAx * (arcR + 14)).toFixed(1)}" y2="${(vy - uAy * (arcR + 14)).toFixed(1)}"
                        stroke="black" stroke-width="1.5" stroke-dasharray="4 3"/>
                    <path d="M ${extX.toFixed(1)} ${extY.toFixed(1)} A ${arcR} ${arcR} 0 0 1 ${p2x.toFixed(1)} ${p2y.toFixed(1)}"
                        stroke="#000000" stroke-width="2" fill="none"/>
                    <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
                        text-anchor="middle" dominant-baseline="middle"
                        font-size="15" font-weight="bold" fill="#000000">?</text>`;
            }

            const angleLabel = angleType === "interior" ? "interior" : "exterior";

            const svg = `
            <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
                <polygon points="${ptStr}" fill="none" stroke="black" stroke-width="2"/>
                ${angleMarkup}
            </svg>`;

            const wrongAngles = new Set<string>();
            const complement = angleType === "interior" ? poly.exterior : poly.interior;
            wrongAngles.add(String(complement));
            const offsets = [10, 15, 20, 25, 30].filter(o => {
                const lo = correctAngle - o, hi = correctAngle + o;
                return lo > 0 && lo !== correctAngle && hi < 360 && hi !== correctAngle;
            });
            for (const o of offsets) {
                if (wrongAngles.size >= 3) break;
                const candidate = Math.random() < 0.5 ? correctAngle - o : correctAngle + o;
                const s = String(candidate);
                if (s !== String(correctAngle)) wrongAngles.add(s);
            }
            while (wrongAngles.size < 3) {
                const o = Math.floor(Math.random() * 20) + 5;
                const s = String(correctAngle + o);
                if (s !== String(correctAngle)) wrongAngles.add(s);
            }

            const options = [String(correctAngle), ...wrongAngles].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Find the } \\textbf{${angleLabel} angle} \\text{ of a regular } \\textbf{${poly.name}}`,
                svg,
                answer: String(correctAngle),
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);

    }, [1, 2]),
    "congruence-and-similarity": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "translation": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const buildGrid = (points: {x: number, y: number}[]) => {
            const cellSize = 25;
            const offset = 70; // Increased offset for more space
            const gridSize = 10; // -5 to 5

            let svg = `<svg width="350" height="350" viewBox="0 0 350 350">`; // Increased size

            // grid lines
            for (let i = -5; i <= 5; i++) {
                const pos = offset + (i + 5) * cellSize;
                // vertical lines
                svg += `<line x1="${pos}" y1="${offset}" x2="${pos}" y2="${offset + 10 * cellSize}" stroke="#ddd"/>`;
                // horizontal lines
                svg += `<line x1="${offset}" y1="${pos}" x2="${offset + 10 * cellSize}" y2="${pos}" stroke="#ddd"/>`;
            }

            // axes
            svg += `<line x1="${offset}" y1="${offset + 5 * cellSize}" x2="${offset + 10 * cellSize}" y2="${offset + 5 * cellSize}" stroke="black" stroke-width="2"/>`;
            svg += `<line x1="${offset + 5 * cellSize}" y1="${offset}" x2="${offset + 5 * cellSize}" y2="${offset + 10 * cellSize}" stroke="black" stroke-width="2"/>`;

            // axis labels
            for (let i = -5; i <= 5; i++) {
                if (i === 0) continue;
                const pos = offset + (i + 5) * cellSize;
                // x-axis labels
                svg += `<text x="${pos}" y="${offset + 5 * cellSize + 15}" font-size="10" text-anchor="middle">${i}</text>`;
                // y-axis labels
                svg += `<text x="${offset + 5 * cellSize - 15}" y="${pos + 3}" font-size="10" text-anchor="middle">${-i}</text>`;
            }

            // points
            points.forEach((point, index) => {
                const px = offset + (point.x + 5) * cellSize;
                const py = offset + (-point.y + 5) * cellSize; // y is inverted in SVG
                svg += `<circle cx="${px}" cy="${py}" r="4" fill="red"/>`;
                // label points A, B, C, etc. - positioned outside the grid
                const label = String.fromCharCode(65 + index); // A, B, C...
                const labelOffset = 12;
                let labelX = px;
                let labelY = py;

                // Position labels outside the point based on position relative to center
                if (point.x >= 0) {
                    labelX += labelOffset; // right
                } else {
                    labelX -= labelOffset; // left
                }
                if (point.y >= 0) {
                    labelY -= labelOffset; // up
                } else {
                    labelY += labelOffset; // down
                }

                svg += `<text x="${labelX}" y="${labelY}" font-size="12" fill="red" text-anchor="middle">${label}</text>`;
            });

            // connect points if more than 2
            if (points.length > 2) {
                const pathData = points.map((point, index) => {
                    const px = offset + (point.x + 5) * cellSize;
                    const py = offset + (-point.y + 5) * cellSize;
                    return `${index === 0 ? 'M' : 'L'} ${px} ${py}`;
                }).join(' ') + ' Z';
                svg += `<path d="${pathData}" fill="none" stroke="red" stroke-width="2"/>`;
            }

            svg += `</svg>`;
            return svg;
        };

        // ---------------- LEVEL 1 ----------------
        // simple translation
        if (difficulty === 1) {
            const startX = randInt(-4, 4);
            const startY = randInt(-4, 4);

            const minTransX = -5 - startX;
            const maxTransX = 5 - startX;
            const minTransY = -5 - startY;
            const maxTransY = 5 - startY;

            let transX: number, transY: number;

            do {
                transX = randInt(Math.max(-3, minTransX), Math.min(3, maxTransX));
                transY = randInt(Math.max(-3, minTransY), Math.min(3, maxTransY));
            } while (transX === 0 && transY === 0);

            const endX = startX + transX;
            const endY = startY + transY;

            const svg = buildGrid([{x: startX, y: startY}]);
            const correct = `\\left(${endX}, ${endY}\\right)`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const ox = randInt(-5, 5);
                const oy = randInt(-5, 5);
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Translate the red point by } \\begin{pmatrix}${transX}\\\\${transY}\\end{pmatrix}. \\text{ What are the new coordinates?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // translation of shapes
        if (difficulty === 2) {
            // Generate a random shape
            const shapeType = randInt(0, 2); // 0: triangle, 1: square, 2: rectangle
            let originalPoints: {x: number, y: number}[] = [];

            if (shapeType === 0) {
                // Triangle
                const baseX = randInt(-3, 3);
                const baseY = randInt(-3, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + randInt(1, 3), y: baseY},
                    {x: baseX + randInt(0, 2), y: baseY + randInt(1, 3)}
                ];
            } else if (shapeType === 1) {
                // Square
                const baseX = randInt(-3, 2);
                const baseY = randInt(-3, 2);
                const size = randInt(1, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + size, y: baseY},
                    {x: baseX + size, y: baseY + size},
                    {x: baseX, y: baseY + size}
                ];
            } else {
                // Rectangle
                const baseX = randInt(-3, 2);
                const baseY = randInt(-3, 2);
                const width = randInt(1, 3);
                const height = randInt(1, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + width, y: baseY},
                    {x: baseX + width, y: baseY + height},
                    {x: baseX, y: baseY + height}
                ];
            }

            // Generate translation vector
            const transX = randInt(-3, 3);
            const transY = randInt(-3, 3);

            // Ensure translation doesn't push points out of bounds
            const translatedPoints = originalPoints.map(point => ({
                x: Math.max(-5, Math.min(5, point.x + transX)),
                y: Math.max(-5, Math.min(5, point.y + transY))
            }));

            // Choose one random vertex to ask about
            const vertexIndex = randInt(0, originalPoints.length - 1);
            const vertexLabel = String.fromCharCode(65 + vertexIndex); // A, B, C, etc.

            const svg = buildGrid(originalPoints);
            const correct = `\\left(${translatedPoints[vertexIndex].x}, ${translatedPoints[vertexIndex].y}\\right)`;

            // Generate wrong options
            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const ox = Math.max(-5, Math.min(5, translatedPoints[vertexIndex].x + randInt(-2, 2)));
                const oy = Math.max(-5, Math.min(5, translatedPoints[vertexIndex].y + randInt(-2, 2)));
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Translate the shape by the vector } \\begin{pmatrix}${transX}\\\\${transY}\\end{pmatrix}.\\\\\\text{ What are the coordinates of vertex } ${vertexLabel}\\text{ after translation?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "rotation": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const buildGrid = (points: {x: number, y: number}[]) => {
            const cellSize = 25;
            const offset = 70; // Increased offset for more space
            const gridSize = 10; // -5 to 5

            let svg = `<svg width="350" height="350" viewBox="0 0 350 350">`; // Increased size

            // grid lines
            for (let i = -5; i <= 5; i++) {
                const pos = offset + (i + 5) * cellSize;
                // vertical lines
                svg += `<line x1="${pos}" y1="${offset}" x2="${pos}" y2="${offset + 10 * cellSize}" stroke="#ddd"/>`;
                // horizontal lines
                svg += `<line x1="${offset}" y1="${pos}" x2="${offset + 10 * cellSize}" y2="${pos}" stroke="#ddd"/>`;
            }

            // axes
            svg += `<line x1="${offset}" y1="${offset + 5 * cellSize}" x2="${offset + 10 * cellSize}" y2="${offset + 5 * cellSize}" stroke="black" stroke-width="2"/>`;
            svg += `<line x1="${offset + 5 * cellSize}" y1="${offset}" x2="${offset + 5 * cellSize}" y2="${offset + 10 * cellSize}" stroke="black" stroke-width="2"/>`;

            // axis labels
            for (let i = -5; i <= 5; i++) {
                if (i === 0) continue;
                const pos = offset + (i + 5) * cellSize;
                // x-axis labels
                svg += `<text x="${pos}" y="${offset + 5 * cellSize + 15}" font-size="10" text-anchor="middle">${i}</text>`;
                // y-axis labels
                svg += `<text x="${offset + 5 * cellSize - 15}" y="${pos + 3}" font-size="10" text-anchor="middle">${-i}</text>`;
            }

            // points
            points.forEach((point, index) => {
                const px = offset + (point.x + 5) * cellSize;
                const py = offset + (-point.y + 5) * cellSize; // y is inverted in SVG
                svg += `<circle cx="${px}" cy="${py}" r="4" fill="blue"/>`;
                // label points A, B, C, etc. - positioned outside the grid
                const label = String.fromCharCode(65 + index); // A, B, C...
                const labelOffset = 12;
                let labelX = px;
                let labelY = py;

                // Position labels outside the point based on position relative to center
                if (point.x >= 0) {
                    labelX += labelOffset; // right
                } else {
                    labelX -= labelOffset; // left
                }
                if (point.y >= 0) {
                    labelY -= labelOffset; // up
                } else {
                    labelY += labelOffset; // down
                }

                svg += `<text x="${labelX}" y="${labelY}" font-size="12" fill="blue" text-anchor="middle">${label}</text>`;
            });

            // connect points if more than 2
            if (points.length > 2) {
                const pathData = points.map((point, index) => {
                    const px = offset + (point.x + 5) * cellSize;
                    const py = offset + (-point.y + 5) * cellSize;
                    return `${index === 0 ? 'M' : 'L'} ${px} ${py}`;
                }).join(' ') + ' Z';
                svg += `<path d="${pathData}" fill="none" stroke="blue" stroke-width="2"/>`;
            }

            svg += `</svg>`;
            return svg;
        };

        // Helper function to rotate a point around origin
        const rotatePoint = (x: number, y: number, degrees: number): {x: number, y: number} => {
            const radians = (degrees * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const newX = Math.round(x * cos - y * sin);
            const newY = Math.round(x * sin + y * cos);

            return { x: newX, y: newY };
        };

        // ---------------- LEVEL 1 ----------------
        // simple rotation of a point
        if (difficulty === 1) {
            const startX = randInt(-4, 4);
            const startY = randInt(-4, 4);

            // Choose rotation angle: 90, 180, or 270 degrees
            const angles = [90, 180, 270];
            const angle = angles[randInt(0, 2)];

            const endPoint = rotatePoint(startX, startY, angle);

            // Ensure rotated point stays within bounds
            const finalX = Math.max(-5, Math.min(5, endPoint.x));
            const finalY = Math.max(-5, Math.min(5, endPoint.y));

            const svg = buildGrid([{x: startX, y: startY}]);
            const correct = `\\left(${finalX}, ${finalY}\\right)`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const ox = Math.max(-5, Math.min(5, finalX + randInt(-2, 2)));
                const oy = Math.max(-5, Math.min(5, finalY + randInt(-2, 2)));
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Rotate the blue point } ${angle}^\\circ \\text{ clockwise around the origin. What are the new coordinates?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // rotation of shapes
        if (difficulty === 2) {
            // Generate a random shape
            const shapeType = randInt(0, 2); // 0: triangle, 1: square, 2: rectangle
            let originalPoints: {x: number, y: number}[] = [];

            if (shapeType === 0) {
                // Triangle
                const baseX = randInt(-3, 3);
                const baseY = randInt(-3, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + randInt(1, 3), y: baseY},
                    {x: baseX + randInt(0, 2), y: baseY + randInt(1, 3)}
                ];
            } else if (shapeType === 1) {
                // Square
                const baseX = randInt(-3, 2);
                const baseY = randInt(-3, 2);
                const size = randInt(1, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + size, y: baseY},
                    {x: baseX + size, y: baseY + size},
                    {x: baseX, y: baseY + size}
                ];
            } else {
                // Rectangle
                const baseX = randInt(-3, 2);
                const baseY = randInt(-3, 2);
                const width = randInt(1, 3);
                const height = randInt(1, 3);
                originalPoints = [
                    {x: baseX, y: baseY},
                    {x: baseX + width, y: baseY},
                    {x: baseX + width, y: baseY + height},
                    {x: baseX, y: baseY + height}
                ];
            }

            // Choose rotation angle: 90 or 180 degrees (270 is same as -90)
            const angles = [90, 180];
            const angle = angles[randInt(0, 1)];

            // Rotate all points
            const rotatedPoints = originalPoints.map(point => {
                const rotated = rotatePoint(point.x, point.y, angle);
                return {
                    x: Math.max(-5, Math.min(5, rotated.x)),
                    y: Math.max(-5, Math.min(5, rotated.y))
                };
            });

            // Choose one random vertex to ask about
            const vertexIndex = randInt(0, originalPoints.length - 1);
            const vertexLabel = String.fromCharCode(65 + vertexIndex); // A, B, C, etc.

            const svg = buildGrid(originalPoints);
            const correct = `\\left(${rotatedPoints[vertexIndex].x}, ${rotatedPoints[vertexIndex].y}\\right)`;

            // Generate wrong options
            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const ox = Math.max(-5, Math.min(5, rotatedPoints[vertexIndex].x + randInt(-2, 2)));
                const oy = Math.max(-5, Math.min(5, rotatedPoints[vertexIndex].y + randInt(-2, 2)));
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: `\\text{Rotate the shape } ${angle}^\\circ \\text{ clockwise around the origin.} \\\\ \\text{ What are the coordinates of vertex } ${vertexLabel}\\text{ after rotation?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "reflection": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const buildGrid = (points: { x: number, y: number }[], extraSVG = "") => {
            const cellSize = 25;
            const offset = 70;

            let svg = `<svg width="350" height="350" viewBox="0 0 350 350">`;

            // grid
            for (let i = -5; i <= 5; i++) {
                const pos = offset + (i + 5) * cellSize;

                svg += `<line x1="${pos}" y1="${offset}" x2="${pos}" y2="${offset + 10 * cellSize}" stroke="#ddd"/>`;
                svg += `<line x1="${offset}" y1="${pos}" x2="${offset + 10 * cellSize}" y2="${pos}" stroke="#ddd"/>`;
            }

            // axes
            svg += `<line x1="${offset}" y1="${offset + 5 * cellSize}" x2="${offset + 10 * cellSize}" y2="${offset + 5 * cellSize}" stroke="black" stroke-width="2"/>`;
            svg += `<line x1="${offset + 5 * cellSize}" y1="${offset}" x2="${offset + 5 * cellSize}" y2="${offset + 10 * cellSize}" stroke="black" stroke-width="2"/>`;

            // axis labels
            for (let i = -5; i <= 5; i++) {
                if (i === 0) continue;
                const pos = offset + (i + 5) * cellSize;

                svg += `<text x="${pos}" y="${offset + 5 * cellSize + 15}" font-size="10" text-anchor="middle">${i}</text>`;
                svg += `<text x="${offset + 5 * cellSize - 15}" y="${pos + 3}" font-size="10" text-anchor="middle">${-i}</text>`;
            }

            // points
            points.forEach((point, index) => {
                const px = offset + (point.x + 5) * cellSize;
                const py = offset + (-point.y + 5) * cellSize;

                svg += `<circle cx="${px}" cy="${py}" r="4" fill="red"/>`;

                const label = String.fromCharCode(65 + index);
                svg += `<text x="${px + 10}" y="${py - 10}" font-size="12" fill="red">${label}</text>`;
            });

            // shape outline if needed
            if (points.length > 2) {
                const path = points
                    .map((p, i) => {
                        const px = offset + (p.x + 5) * cellSize;
                        const py = offset + (-p.y + 5) * cellSize;
                        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
                    })
                    .join(" ") + " Z";

                svg += `<path d="${path}" fill="none" stroke="red" stroke-width="2"/>`;
            }

            svg += extraSVG;
            svg += `</svg>`;
            return svg;
        };

        // ---------------- LEVEL 1 ----------------
        if (difficulty === 1) {
            const x = randInt(-4, 4);
            const y = randInt(-4, 4);

            const isVertical = randInt(0, 1) === 0;
            let k: number, rx: number, ry: number, line: string, latex: string;

            if (isVertical) {
                k = randInt(-3, 3);
                rx = 2 * k - x;
                ry = y;

                line = `<line x1="${70 + (k + 5) * 25}" y1="70" x2="${70 + (k + 5) * 25}" y2="320" stroke="blue" stroke-width="2"/>`;

                latex = `\\text{Reflect the point in the line } x = ${k}.`;
            } else {
                k = randInt(-3, 3);
                rx = x;
                ry = 2 * k - y;

                line = `<line x1="70" y1="${70 + (-k + 5) * 25}" x2="320" y2="${70 + (-k + 5) * 25}" stroke="blue" stroke-width="2"/>`;

                latex = `\\text{Reflect the point in the line } y = ${k}.`;
            }

            const svg = buildGrid([{ x, y }], line);

            const correct = `\\left(${rx}, ${ry}\\right)`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const ox = randInt(-5, 5);
                const oy = randInt(-5, 5);
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex: latex + `\\\\\\text{What are the new coordinates?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        if (difficulty === 2) {
            const shapeType = randInt(0, 2);
            let originalPoints: { x: number; y: number }[] = [];

            // safe bounds so shapes + reflections stay in [-5, 5]
            const safeMin = -3;
            const safeMax = 3;

            if (shapeType === 0) {
                const bx = randInt(-2, 2);
                const by = randInt(-2, 2);

                originalPoints = [
                    { x: bx, y: by },
                    { x: Math.max(-5, Math.min(5, bx + randInt(1, 2))), y: by },
                    { x: bx, y: Math.max(-5, Math.min(5, by + randInt(1, 2))) }
                ];
            } else if (shapeType === 1) {
                const s = randInt(1, 2);

                const bx = randInt(-3, 3 - s);
                const by = randInt(-3, 3 - s);

                originalPoints = [
                    { x: bx, y: by },
                    { x: bx + s, y: by },
                    { x: bx + s, y: by + s },
                    { x: bx, y: by + s }
                ];
            } else {
                const w = randInt(1, 2);
                const h = randInt(1, 2);

                const bx = randInt(-3, 3 - w);
                const by = randInt(-3, 3 - h);

                originalPoints = [
                    { x: bx, y: by },
                    { x: bx + w, y: by },
                    { x: bx + w, y: by + h },
                    { x: bx, y: by + h }
                ];
            }

            const isVertical = randInt(0, 1) === 0;

            // reflection line also constrained so result stays in grid
            const k = randInt(-2, 2);

            const reflected = originalPoints.map(p =>
                isVertical
                    ? { x: 2 * k - p.x, y: p.y }
                    : { x: p.x, y: 2 * k - p.y }
            );

            const vertexIndex = randInt(0, originalPoints.length - 1);
            const vertexLabel = String.fromCharCode(65 + vertexIndex);

            const svg = buildGrid(
                originalPoints,
                isVertical
                    ? `<line x1="${70 + (k + 5) * 25}" y1="70" x2="${70 + (k + 5) * 25}" y2="320" stroke="blue" stroke-width="2"/>`
                    : `<line x1="70" y1="${70 + (-k + 5) * 25}" x2="320" y2="${70 + (-k + 5) * 25}" stroke="blue" stroke-width="2"/>`
            );

            const correct = `\\left(${reflected[vertexIndex].x}, ${reflected[vertexIndex].y}\\right)`;

            const optionsSet = new Set<string>();
            optionsSet.add(correct);

            while (optionsSet.size < 4) {
                const p = reflected[vertexIndex];
                const ox = Math.max(-5, Math.min(5, p.x + randInt(-1, 1)));
                const oy = Math.max(-5, Math.min(5, p.y + randInt(-1, 1)));
                optionsSet.add(`(${ox}, ${oy})`);
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                svg,
                latex:
                    `\\text{Reflect the shape in the line } ${isVertical ? `x = ${k}` : `y = ${k}`}.\\\\` +
                    `\\text{What are the coordinates of vertex } ${vertexLabel}\\text{ after reflection?}`,
                answer: correct,
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "enlargement": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const gridMin = -6;
        const gridMax = 6;
        const cell = 24;
        const offset = 56;
        const size = (gridMax - gridMin) * cell;
        const svgW = offset * 2 + size;
        const svgH = svgW;

        const toPx = (x: number, y: number) => ({
            px: offset + (x - gridMin) * cell,
            py: offset + (gridMax - y) * cell,
        });

        const buildGrid = (args: {
            original: { x: number; y: number }[];
            image?: { x: number; y: number }[];
            center?: { x: number; y: number };
            showOriginalLabels?: boolean;
            showImageLabels?: boolean;
        }) => {
            const {
                original,
                image = [],
                center,
                showOriginalLabels = true,
                showImageLabels = true,
            } = args;

            let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">`;

            for (let i = gridMin; i <= gridMax; i++) {
                const p = offset + (i - gridMin) * cell;
                svg += `<line x1="${p}" y1="${offset}" x2="${p}" y2="${offset + size}" stroke="#d8dde5" stroke-width="1"/>`;
                svg += `<line x1="${offset}" y1="${p}" x2="${offset + size}" y2="${p}" stroke="#d8dde5" stroke-width="1"/>`;
            }

            const xAxisY = toPx(0, 0).py;
            const yAxisX = toPx(0, 0).px;

            svg += `<line x1="${offset}" y1="${xAxisY}" x2="${offset + size}" y2="${xAxisY}" stroke="black" stroke-width="2"/>`;
            svg += `<line x1="${yAxisX}" y1="${offset}" x2="${yAxisX}" y2="${offset + size}" stroke="black" stroke-width="2"/>`;

            for (let i = gridMin; i <= gridMax; i++) {
                if (i === 0) continue;
                const { px } = toPx(i, 0);
                const { py } = toPx(0, i);
                svg += `<text x="${px}" y="${xAxisY + 15}" font-size="10" text-anchor="middle" fill="#222">${i}</text>`;
                svg += `<text x="${yAxisX - 14}" y="${py + 4}" font-size="10" text-anchor="middle" fill="#222">${i}</text>`;
            }

            svg += `<text x="${offset + size + 14}" y="${xAxisY + 4}" font-size="12" fill="#111">x</text>`;
            svg += `<text x="${yAxisX + 8}" y="${offset - 10}" font-size="12" fill="#111">y</text>`;

            if (center) {
                const c = toPx(center.x, center.y);
                svg += `<circle cx="${c.px}" cy="${c.py}" r="4" fill="#111"/>`;
                svg += `<text x="${c.px + 9}" y="${c.py - 8}" font-size="12" fill="#111">C</text>`;
            }

            if (original.length > 1) {
                const path = original
                    .map((p, i) => {
                        const q = toPx(p.x, p.y);
                        return `${i === 0 ? "M" : "L"} ${q.px} ${q.py}`;
                    })
                    .join(" ") + " Z";
                svg += `<path d="${path}" fill="none" stroke="#2563eb" stroke-width="2"/>`;
            }

            if (image.length > 1) {
                const path = image
                    .map((p, i) => {
                        const q = toPx(p.x, p.y);
                        return `${i === 0 ? "M" : "L"} ${q.px} ${q.py}`;
                    })
                    .join(" ") + " Z";
                svg += `<path d="${path}" fill="none" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 3"/>`;
            }

            original.forEach((p, i) => {
                const q = toPx(p.x, p.y);
                const label = String.fromCharCode(65 + i);
                svg += `<circle cx="${q.px}" cy="${q.py}" r="3.5" fill="#2563eb"/>`;
                if (showOriginalLabels) {
                    svg += `<text x="${q.px + 7}" y="${q.py - 7}" font-size="12" fill="#1d4ed8">${label}</text>`;
                }
            });

            image.forEach((p, i) => {
                const q = toPx(p.x, p.y);
                const label = `${String.fromCharCode(65 + i)}'`;
                svg += `<circle cx="${q.px}" cy="${q.py}" r="3.5" fill="#16a34a"/>`;
                if (showImageLabels) {
                    svg += `<text x="${q.px + 7}" y="${q.py - 7}" font-size="12" fill="#15803d">${label}</text>`;
                }
            });

            svg += `</svg>`;
            return svg;
        };

        const makeCoordinateOptions = (x: number, y: number) => {
            const set = new Set<string>();
            set.add(`\\left(${x}, ${y}\\right)`);

            while (set.size < 4) {
                const ox = Math.max(gridMin, Math.min(gridMax, x + randInt(-2, 2)));
                const oy = Math.max(gridMin, Math.min(gridMax, y + randInt(-2, 2)));
                set.add(`\\left(${ox}, ${oy}\\right)`);
            }

            return Array.from(set).sort(() => Math.random() - 0.5);
        };

        const isOnGrid = (p: { x: number; y: number }) =>
            p.x >= gridMin && p.x <= gridMax && p.y >= gridMin && p.y <= gridMax;

        // ---------------- LEVEL 1 ----------------
        // Point enlarged from origin by integer scale factor
        if (difficulty === 1) {
            const sf = randInt(2, 3);
            let x = 0;
            let y = 0;

            while (x === 0 && y === 0) {
                x = randInt(-2, 2);
                y = randInt(-2, 2);
            }

            const imageX = x * sf;
            const imageY = y * sf;

            const svg = buildGrid({
                original: [{ x, y }],
                center: { x: 0, y: 0 },
                showImageLabels: false,
            });

            return {
                svg,
                latex: `\\text{Point } A(${x}, ${y}) \\text{ is enlarged about the origin with scale factor } ${sf} \\text{. }\\\\\\text{Find the coordinates of } A'.`,
                answer: `\\left(${imageX}, ${imageY}\\right)`,
                options: makeCoordinateOptions(imageX, imageY),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Triangle enlarged from origin by integer scale factor
        if (difficulty === 2) {
            const sf = randInt(2, 3);
            const baseX = randInt(-2, 1);
            const baseY = randInt(-2, 1);

            const original = [
                { x: baseX, y: baseY },
                { x: baseX + randInt(1, 2), y: baseY },
                { x: baseX, y: baseY + randInt(1, 2) },
            ];

            const image = original.map((p) => ({ x: p.x * sf, y: p.y * sf }));

            const vertexIndex = randInt(0, original.length - 1);
            const vertexLabel = String.fromCharCode(65 + vertexIndex);
            const target = image[vertexIndex];

            const svg = buildGrid({
                original,
                center: { x: 0, y: 0 },
                showImageLabels: false,
            });

            return {
                svg,
                latex: `\\text{Triangle } ABC \\text{ is enlarged about the origin by scale factor } ${sf}\\text{. } \\\\\\text{Find the coordinates of } ${vertexLabel}'.`,
                answer: `\\left(${target.x}, ${target.y}\\right)`,
                options: makeCoordinateOptions(target.x, target.y),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // Determine scale factor (includes reduction)
        if (difficulty === 3) {
            const factors = [
                { label: "2", num: 2, den: 1 },
                { label: "3", num: 3, den: 1 },
                { label: "0.5", num: 1, den: 2 },
            ];
            const k = factors[randInt(0, factors.length - 1)];

            const den = k.den;
            let start = { x: 0, y: 0 };
            let image = { x: 0, y: 0 };

            while (true) {
                const x = randInt(-4, 4);
                const y = randInt(-4, 4);
                start = {
                    x: x - (x % den),
                    y: y - (y % den),
                };

                image = {
                    x: (start.x * k.num) / k.den,
                    y: (start.y * k.num) / k.den,
                };

                if ((start.x !== 0 || start.y !== 0) && isOnGrid(start) && isOnGrid(image)) {
                    break;
                }
            }

            const svg = buildGrid({
                original: [start],
                image: [image],
                center: { x: 0, y: 0 },
            });

            const optionsSet = new Set<string>([k.label]);
            ["0.5", "2", "3", "-2", "-1"].forEach((v) => {
                if (optionsSet.size < 4 && v !== k.label) optionsSet.add(v);
            });

            return {
                svg,
                latex: `\\text{Point } A \\text{ maps to } A' \\text{ under an enlargement about the origin. }\\\\\\text{Find the scale factor.}`,
                answer: k.label,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 4 ----------------
        // Enlargement with a non-origin centre and variable scale factor
        if (difficulty === 4) {
            const scaleFactors = [-4, -3, -2, -1, 1, 2, 3, 4];
            let sf = scaleFactors[randInt(0, scaleFactors.length - 1)];

            let center = { x: 0, y: 0 };
            let signX = 1;
            let signY = 1;

            const templates = [
                [
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                ],
                [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 },
                    { x: 2, y: 1 },
                ],
                [
                    { x: 1, y: 0 },
                    { x: 1, y: 2 },
                    { x: 2, y: 1 },
                ],
            ] as const;

            let original: { x: number; y: number }[] = [];
            let image: { x: number; y: number }[] = [];

            let attempts = 0;
            while (attempts < 200) {
                attempts++;
                center = { x: randInt(-2, 2), y: randInt(-2, 2) };
                signX = Math.random() < 0.5 ? -1 : 1;
                signY = Math.random() < 0.5 ? -1 : 1;
                sf = scaleFactors[randInt(0, scaleFactors.length - 1)];

                const template = templates[randInt(0, templates.length - 1)];

                original = template.map((p) => ({
                    x: center.x + signX * p.x,
                    y: center.y + signY * p.y,
                }));

                image = original.map((p) => ({
                    x: center.x + sf * (p.x - center.x),
                    y: center.y + sf * (p.y - center.y),
                }));

                const allOnGrid = [...original, ...image].every(isOnGrid);

                if (allOnGrid) break;
            }

            const vertexIndex = randInt(0, original.length - 1);
            const vertexLabel = String.fromCharCode(65 + vertexIndex);
            const target = image[vertexIndex];

            const svg = buildGrid({
                original,
                center,
                showImageLabels: false,
            });

            return {
                svg,
                latex: `\\text{Triangle } ABC \\text{ is enlarged with centre } O(${center.x}, ${center.y}) \\text{ and scale factor } ${sf}\\text{. }\\\\\\text{Find the coordinates of } ${vertexLabel}'.`,
                answer: `\\left(${target.x}, ${target.y}\\right)`,
                options: makeCoordinateOptions(target.x, target.y),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "pythagoras-theorem": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        // Helper function to check if three numbers form a Pythagorean triple
        const isPythagoreanTriple = (a: number, b: number, c: number): boolean => {
            const sides = [a, b, c].sort((x, y) => x - y);
            return Math.abs(sides[0] ** 2 + sides[1] ** 2 - sides[2] ** 2) < 0.01;
        };

        // ---------------- LEVEL 1 ----------------
        // Identify sides in a right-angled triangle
        if (difficulty === 1) {
            // Create an SVG of a 30-60-90 triangle with all sides labeled
            // Using approximate coordinates for a 30-60-90 triangle
            const svg = `<svg width="250" height="200" viewBox="0 0 250 200">
                <!-- Triangle (30-60-90) -->
                <polygon points="50,150 50,50 173.2,150" fill="none" stroke="black" stroke-width="2"/>
                <!-- Right angle marker at (50,150) -->
                <polygon points="50,140 60,140 60,150" fill="none" stroke="black" stroke-width="1"/>
                <!-- Angle labels -->
                <text x="125" y="140" font-size="12" text-anchor="middle">30°</text>

                <!-- Side labels -->
                <text x="25" y="105" font-size="14" text-anchor="middle">A</text>
                <text x="111.6" y="175" font-size="14" text-anchor="middle">B</text>
                <text x="125" y="95" font-size="14" text-anchor="middle">C</text>
            </svg>`;

            // Randomly choose question type
            const questionTypes = [
                { question: "what is the name of edge A", answer: "opposite" },
                { question: "what is the name of edge B", answer: "adjacent" },
                { question: "what is the name of edge C", answer: "hypotenuse" },
                { question: "which edge is the hypotenuse", answer: "C" },
                { question: "which edge is the opposite", answer: "A" },
                { question: "which edge is the adjacent", answer: "B" }
            ];

            const selectedQuestion = questionTypes[randInt(0, questionTypes.length - 1)];

            let latex: string;
            let answer: string;
            let options: string[];

            if (selectedQuestion.question.includes("what is the name")) {
                latex = `\\text{${selectedQuestion.question} (relative to the 30° angle)?}`;
                if (selectedQuestion.answer === "hypotenuse") {
                    options = ["Hypotenuse", "Opposite", "Adjacent"];
                } else {
                    options = ["Hypotenuse", "Opposite", "Adjacent"];
                }
            } else {
                latex = `\\text{${selectedQuestion.question} (relative to the 30° angle)?}`;
                options = ["A", "B", "C"];
            }

            answer = selectedQuestion.answer;
            options = options.sort(() => Math.random() - 0.5);

            return {
                svg,
                latex,
                answer,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Find shorter side or use decimals
        if (difficulty === 2) {
            const questionType = randInt(0, 1); // 0: find shorter side, 1: decimals

            if (questionType === 0) {
                // Find shorter side
                const c = randInt(10, 20); // hypotenuse
                const a = randInt(3, c - 3); // one side
                const b = Math.sqrt(c * c - a * a);
                const bRounded = Math.abs(b - Math.round(b)) < 0.01 ? Math.round(b) : Math.round(b * 10) / 10;

                const latex = `\\text{In a right-angled triangle, the hypotenuse is } ${c}\\text{ cm and one side is } ${a}\\text{ cm.} \\\\ \\text{ What is the length of the other side?}`;
                const answer = bRounded.toString();

                const optionsSet = new Set<string>();
                optionsSet.add(answer);

                while (optionsSet.size < 4) {
                    const offset = randInt(-3, 3);
                    const wrongAnswer = (bRounded + offset).toString();
                    if (parseFloat(wrongAnswer) > 0) {
                        optionsSet.add(wrongAnswer);
                    }
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex,
                    answer,
                    options,
                    forceOption: 0,
                };
            } else {
                // Use decimals
                const a = randInt(20, 50) / 10; // 2.0 to 5.0
                const b = randInt(30, 60) / 10; // 3.0 to 6.0
                const c = Math.sqrt(a * a + b * b);
                const cRounded = Math.round(c * 100) / 100; // Round to 2 decimal places

                const latex = `\\text{Calculate the length of the hypotenuse when the two shorter sides are } ${a}\\text{ cm and } ${b}\\text{ cm.}`;
                const answer = cRounded.toString();

                const optionsSet = new Set<string>();
                optionsSet.add(answer);

                while (optionsSet.size < 4) {
                    const offset = (randInt(-20, 20)) / 100;
                    const wrongAnswer = (cRounded + offset).toFixed(2);
                    if (parseFloat(wrongAnswer) > 0) {
                        optionsSet.add(wrongAnswer);
                    }
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex,
                    answer,
                    options,
                    forceOption: 0,
                };
            }
        }

        // ---------------- LEVEL 3 ----------------
        // Word problems
        if (difficulty === 3) {
            const scenarioType = randInt(0, 2);

            let setup = "";
            let question = "";
            let a: number, b: number;

            if (scenarioType === 0) {
                // Ladder (find height)
                const base = randInt(2, 10);
                const height = randInt(base + 1, 15);
                const ladder = Math.sqrt(base * base + height * height);

                setup = `A ladder leans against a wall. The base of the ladder is ${base}m from the wall and the ladder is ${ladder.toFixed(2)}m long.`;
                question = "How high up the wall does the ladder reach? Give your answer to 1 decimal place.";

                a = base;
                b = ladder;

            } else if (scenarioType === 1) {
                // Pole + wire (find base)
                const height = randInt(5, 15);
                const base = randInt(3, 12);
                const wire = Math.sqrt(height * height + base * base);

                setup = `A guy wire is attached to the top of a ${height}m pole. The wire is ${wire.toFixed(2)}m long.`;
                question = "How far from the base of the pole is the wire attached to the ground? Give your answer to 1 decimal place.";

                a = height;
                b = wire;

            } else {
                // Rectangle (find length)
                const width = randInt(3, 10);
                const length = randInt(width + 1, 15);
                const diagonal = Math.sqrt(width * width + length * length);

                setup = `A rectangle has diagonal ${diagonal.toFixed(2)}cm and width ${width}cm.`;
                question = "What is the length of the rectangle? Give your answer to 1 decimal place.";

                a = width;
                b = diagonal;
            }

            // Calculate answer
            const answer = Math.sqrt(b * b - a * a);

            // Always round to 1 decimal place
            const answerRounded = Math.round(answer * 10) / 10;
            const answerStr = answerRounded.toFixed(1);

            const latex = `\\text{${setup}} \\\\ \\text{${question}}`;

            const optionsSet = new Set<string>();
            optionsSet.add(answerStr);

            while (optionsSet.size < 4) {
                const offset = (randInt(-20, 20)) / 10; // decimal offsets
                const wrongAnswer = (answerRounded + offset).toFixed(1);

                if (parseFloat(wrongAnswer) > 0) {
                    optionsSet.add(wrongAnswer);
                }
            }

            const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

            return {
                latex,
                answer: answerStr,
                options,
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 4 ----------------
        // Rearrangement and verification
        if (difficulty === 4) {
            const questionType = randInt(0, 1); // 0: verify triple, 1: rearrange formula

            if (questionType === 0) {
                // --- VERIFY PYTHAGOREAN TRIPLE ---
                const triples = [
                    [3, 4, 5],
                    [5, 12, 13],
                    [6, 8, 10],
                    [7, 24, 25],
                    [8, 15, 17],
                    [9, 12, 15],
                    [10, 24, 26]
                ];

                const correctTriple = triples[randInt(0, triples.length - 1)];

                const isCorrect = Math.random() < 0.5; // balanced now (50/50)

                let sides: number[];

                if (isCorrect) {
                    sides = [...correctTriple];
                } else {
                    // generate guaranteed non-Pythagorean triple
                    do {
                        sides = [
                            randInt(2, 20),
                            randInt(2, 20),
                            randInt(2, 20)
                        ];
                    } while (
                        isPythagoreanTriple(sides[0], sides[1], sides[2])
                    );
                }

                // shuffle
                sides.sort(() => Math.random() - 0.5);

                const latex = `\\text{Do the sides } ${sides[0]}, ${sides[1]}, ${sides[2]} \\text{ form a right-angled triangle?}`;

                const answer = isCorrect ? "Yes" : "No";
                const options = ["Yes", "No"].sort(() => Math.random() - 0.5);

                return {
                    latex,
                    answer,
                    options,
                    forceOption: 0,
                };
            } else {
                // --- REARRANGE FORMULA (clean integer triangles) ---
                const b = randInt(3, 20);
                const a = randInt(3, 20);

                const c = Math.sqrt(a * a + b * b);

                // ensure c is clean-ish (1 decimal max)
                const cRounded = Math.round(c * 10) / 10;

                const latex = `\\text{Rearrange } c^2 = a^2 + b^2 \\text{ to find } c \\text{ when } a = ${a}, b = ${b}.`;

                const answer = cRounded.toFixed(1);

                const optionsSet = new Set<string>();
                optionsSet.add(answer);

                while (optionsSet.size < 4) {
                    const offset = randInt(-30, 30) / 10;
                    const wrong = (cRounded + offset).toFixed(1);

                    if (parseFloat(wrong) > 0) {
                        optionsSet.add(wrong);
                    }
                }

                const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

                return {
                    latex,
                    answer,
                    options,
                    forceOption: 0,
                };
            }
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "sine-cosine-tangent": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        if (difficulty === 1) {
            const funcs = ["\\sin", "\\cos", "\\tan"] as const;
            const func = funcs[randInt(0, funcs.length - 1)];

            // Keep angles away from undefined tan values and very steep extremes.
            const anglePool = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
            const angle = anglePool[randInt(0, anglePool.length - 1)];

            const radians = (angle * Math.PI) / 180;
            const value =
                func === "\\sin" ? Math.sin(radians)
                : func === "\\cos" ? Math.cos(radians)
                : Math.tan(radians);

            const rounded = Number(value.toFixed(3));
            const answer = rounded.toFixed(3);

            const optionsSet = new Set<string>([answer]);
            while (optionsSet.size < 4) {
                const delta = randInt(-4, 4) / 10;
                const wrong = (rounded + delta).toFixed(3);
                if (wrong !== answer && Number(wrong) >= 0) {
                    optionsSet.add(wrong);
                }
            }

            return {
                latex: `\\text{Use your calculator to work out } ${func}(${angle}^\\circ)\\text{. Give your answer to 3 decimal place.}`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1]),
    "right-angled-triangles": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const A = { x: 70, y: 120 };   // right-angle vertex
        const B = { x: 70, y: 20 };
        const C = { x: 243.2, y: 120 };

        const midpoint = (p: { x: number; y: number }, q: { x: number; y: number }) => ({
            x: (p.x + q.x) / 2,
            y: (p.y + q.y) / 2,
        });

        const fmt = (n: number, dp = 2) => Number(n.toFixed(dp)).toFixed(dp);

        const makeNumericOptions = (answer: number, dp = 2) => {
            const set = new Set<string>([fmt(answer, dp)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 200) {
                const delta = (randInt(-25, 25) / 10) * (dp === 2 ? 0.1 : 1);
                const wrong = answer + delta;
                if (wrong > 0) set.add(fmt(wrong, dp));
            }
            return Array.from(set).sort(() => Math.random() - 0.5);
        };

        const drawTriangleSvg = (args: {
            sideAB?: string;
            sideAC?: string;
            sideBC?: string;
            angleB?: string;
            angleC?: string;
        }) => {
            const mAB = midpoint(A, B);
            const mAC = midpoint(A, C);
            const mBC = midpoint(B, C);

            return `
                <svg width="340" height="180" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}" fill="none" stroke="black" stroke-width="2.5"/>
                    <polyline points="${A.x},${A.y - 12} ${A.x + 12},${A.y - 12} ${A.x + 12},${A.y}" fill="none" stroke="black" stroke-width="2"/>

                    ${args.sideAB ? `<text x="${mAB.x - 20}" y="${mAB.y}" text-anchor="end" font-size="12" fill="#000000">${args.sideAB}</text>` : ""}
                    ${args.sideAC ? `<text x="${mAC.x}" y="${mAC.y + 18}" text-anchor="middle" font-size="12" fill="#000000">${args.sideAC}</text>` : ""}
                    ${args.sideBC ? `<text x="${mBC.x + 12}" y="${mBC.y - 8}" text-anchor="start" font-size="12" fill="#000000">${args.sideBC}</text>` : ""}

                    ${args.angleB ? `<path d="M ${B.x} ${B.y + 24} A 24 24 0 0 0 ${B.x + 20.8} ${B.y + 12}" fill="none" stroke="#000000" stroke-width="2"/>` : ""}
                    ${args.angleB ? `<text x="${B.x + 8}" y="${B.y + 36}" text-anchor="start" font-size="13" fill="#000000">${args.angleB}</text>` : ""}
                    ${args.angleC ? `<path d="M ${C.x - 34.64} ${C.y - 20} A 34 34 0 0 0 ${C.x - 34.64} ${C.y}" fill="none" stroke="#000000" stroke-width="2"/>` : ""}
                    ${args.angleC ? `<text x="${C.x - 42}" y="${C.y - 8}" text-anchor="end" font-size="13" fill="#000000">${args.angleC}</text>` : ""}
                </svg>
            `;
        };

        const relationForCorner = (corner: "B" | "C") => {
            if (corner === "C") {
                return { opposite: "AB", adjacent: "AC", hypotenuse: "BC" } as const;
            }
            return { opposite: "AC", adjacent: "AB", hypotenuse: "BC" } as const;
        };

        const sideNameByEdge = {
            AB: "A",
            AC: "B",
            BC: "C",
        } as const;

        const withSideLabels = (labels: Partial<Record<"AB" | "AC" | "BC", string>>, angleB?: string, angleC?: string) =>
            drawTriangleSvg({
                sideAB: labels.AB,
                sideAC: labels.AC,
                sideBC: labels.BC,
                angleB,
                angleC,
            });

        // ---------------- LEVEL 1 ----------------
        // Identify whether sin/cos/tan is needed to find angle x.
        if (difficulty === 1) {
            const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
            const corner: "B" | "C" = "C";
            const rel = relationForCorner(corner);

            const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {
                AB: sideNameByEdge.AB,
                AC: sideNameByEdge.AC,
                BC: sideNameByEdge.BC,
            };

            let sideOne = "";
            let sideTwo = "";
            if (fn === "sin") {
                sideOne = sideNameByEdge[rel.opposite];
                sideTwo = sideNameByEdge[rel.hypotenuse];
            } else if (fn === "cos") {
                sideOne = sideNameByEdge[rel.adjacent];
                sideTwo = sideNameByEdge[rel.hypotenuse];
            } else {
                sideOne = sideNameByEdge[rel.opposite];
                sideTwo = sideNameByEdge[rel.adjacent];
            }

            const svg = withSideLabels(labels, undefined, "x");

            return {
                svg,
                latex: `\\text{Which trigonometric function should you use first to find angle } x \\text{ using sides } ${sideOne} \\ \\text{ and } ${sideTwo}\\text{?}`,
                answer: fn,
                options: ["sin", "cos", "tan"].sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Given an angle and one side, identify sin/cos/tan to find another side.
        if (difficulty === 2) {
            const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
            const corner: "B" | "C" = "C";
            const rel = relationForCorner(corner);

            const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {
                AB: sideNameByEdge.AB,
                AC: sideNameByEdge.AC,
                BC: sideNameByEdge.BC,
            };

            let question = "";
            if (fn === "sin") {
                const given = sideNameByEdge[rel.hypotenuse];
                const target = sideNameByEdge[rel.opposite];
                question = `\\text{Given angle } x \\text{ and side } ${given}\\text{, which trigonometric function should you use to find side } ${target}\\text{?}`;
            } else if (fn === "cos") {
                const given = sideNameByEdge[rel.hypotenuse];
                const target = sideNameByEdge[rel.adjacent];
                question = `\\text{Given angle } x \\text{ and side } ${given}\\text{, which trigonometric function should you use to find side } ${target}\\text{?}`;
            } else {
                const given = sideNameByEdge[rel.adjacent];
                const target = sideNameByEdge[rel.opposite];
                question = `\\text{Given angle } x \\text{ and side } ${given}\\text{, which trigonometric function should you use to find side } ${target}\\text{?}`;
            }

            const svg = withSideLabels(
                labels,
                undefined,
                "x"
            );

            return {
                svg,
                latex: question,
                answer: fn,
                options: ["sin", "cos", "tan"].sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // Calculate angles/sides using trig, answers to 2 d.p.
        if (difficulty === 3) {
            const mode = randInt(0, 1); // 0 -> find angle (inverse trig), 1 -> find side

            if (mode === 0) {
                const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
                const trueAngle = randInt(20, 70);
                const rad = (trueAngle * Math.PI) / 180;
                const hyp = randInt(8, 22);
                const opp = hyp * Math.sin(rad);
                const adj = hyp * Math.cos(rad);

                const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {};
                if (fn === "sin") {
                    labels.AB = `${fmt(opp, 2)} cm`;
                    labels.BC = `${fmt(hyp, 2)} cm`;
                } else if (fn === "cos") {
                    labels.AC = `${fmt(adj, 2)} cm`;
                    labels.BC = `${fmt(hyp, 2)} cm`;
                } else {
                    labels.AB = `${fmt(opp, 2)} cm`;
                    labels.AC = `${fmt(adj, 2)} cm`;
                }

                const svg = withSideLabels(labels, undefined, "x");
                const answer = Number(trueAngle.toFixed(2));

                return {
                    svg,
                    latex: `\\text{Work out angle } x\\text{ to 2 decimal places.}`,
                    answer: fmt(answer, 2),
                    options: makeNumericOptions(answer, 2),
                    forceOption: 0,
                };
            }

            const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
            const angle = randInt(20, 70);
            const rad = (angle * Math.PI) / 180;
            const base = randInt(8, 20);

            const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {};
            let answer = 0;
            let prompt = "";

            if (fn === "sin") {
                labels.BC = `${base} cm`;
                labels.AB = "?";
                answer = base * Math.sin(rad);
                prompt = `\\text{Work out the side marked } ?\\text{ to 2 decimal places.}`;
            } else if (fn === "cos") {
                labels.BC = `${base} cm`;
                labels.AC = "?";
                answer = base * Math.cos(rad);
                prompt = `\\text{Work out the side marked } ?\\text{ to 2 decimal places.}`;
            } else {
                labels.AC = `${base} cm`;
                labels.AB = "?";
                answer = base * Math.tan(rad);
                prompt = `\\text{Work out the side marked } ?\\text{ to 2 decimal places.}`;
            }

            const svg = withSideLabels(labels, undefined, `${angle}°`);

            return {
                svg,
                latex: prompt,
                answer: fmt(answer, 2),
                options: makeNumericOptions(answer, 2),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 4 ----------------
        // 30-60-90 triangle, angle location varies between 30 and 60 corners.
        if (difficulty === 4) {
            const corner: "B" | "C" = Math.random() < 0.5 ? "B" : "C";
            const angleAtCorner = corner === "B" ? 60 : 30;
            const rel = relationForCorner(corner);

            const k = randInt(4, 12);
            const lengths = {
                AB: k,
                AC: k * Math.sqrt(3),
                BC: 2 * k,
            };

            const mode = randInt(0, 1); // 0 angle, 1 side

            if (mode === 0) {
                const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
                const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {};

                if (fn === "sin") {
                    labels[rel.opposite] = `${fmt(lengths[rel.opposite], 2)} cm`;
                    labels[rel.hypotenuse] = `${fmt(lengths[rel.hypotenuse], 2)} cm`;
                } else if (fn === "cos") {
                    labels[rel.adjacent] = `${fmt(lengths[rel.adjacent], 2)} cm`;
                    labels[rel.hypotenuse] = `${fmt(lengths[rel.hypotenuse], 2)} cm`;
                } else {
                    labels[rel.opposite] = `${fmt(lengths[rel.opposite], 2)} cm`;
                    labels[rel.adjacent] = `${fmt(lengths[rel.adjacent], 2)} cm`;
                }

                const svg = withSideLabels(labels, corner === "B" ? "x" : undefined, corner === "C" ? "x" : undefined);

                return {
                    svg,
                    latex: `\\text{Find angle } x\\text{ to 2 decimal places.}`,
                    answer: fmt(angleAtCorner, 2),
                    options: makeNumericOptions(angleAtCorner, 2),
                    forceOption: 0,
                };
            }

            const fn = ["sin", "cos", "tan"][randInt(0, 2)] as "sin" | "cos" | "tan";
            const labels: Partial<Record<"AB" | "AC" | "BC", string>> = {};
            let answer = 0;

            if (fn === "sin") {
                labels[rel.hypotenuse] = `${fmt(lengths[rel.hypotenuse], 2)} cm`;
                labels[rel.opposite] = "?";
                answer = lengths[rel.hypotenuse] * Math.sin((angleAtCorner * Math.PI) / 180);
            } else if (fn === "cos") {
                labels[rel.hypotenuse] = `${fmt(lengths[rel.hypotenuse], 2)} cm`;
                labels[rel.adjacent] = "?";
                answer = lengths[rel.hypotenuse] * Math.cos((angleAtCorner * Math.PI) / 180);
            } else {
                labels[rel.adjacent] = `${fmt(lengths[rel.adjacent], 2)} cm`;
                labels[rel.opposite] = "?";
                answer = lengths[rel.adjacent] * Math.tan((angleAtCorner * Math.PI) / 180);
            }

            const svg = withSideLabels(
                labels,
                corner === "B" ? `${angleAtCorner}°` : undefined,
                corner === "C" ? `${angleAtCorner}°` : undefined
            );

            return {
                svg,
                latex: `\\text{Find the side marked } ?\\text{ to 2 decimal places.}`,
                answer: fmt(answer, 2),
                options: makeNumericOptions(answer, 2),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "circumference-and-area": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const fmt2 = (n: number) => Number(n.toFixed(2)).toFixed(2);
        const piTerm = (coeff: number) => (coeff === 1 ? `π` : `${coeff}π`);

        if (difficulty === 1) {
            const r = randInt(3, 14);
            const d = 2 * r;
            const c = 2 * Math.PI * r;
            const cStr = fmt2(c);

            const targets = ["radius", "diameter", "circumference"] as const;
            const target = targets[randInt(0, targets.length - 1)];
            const radiusLabel = `${r} cm`;
            const circumferenceLabel = `${cStr} cm`;

            const answer =
                target === "radius" ? String(r)
                : target === "diameter" ? String(d)
                : cStr;

            const optionsSet = new Set<string>([answer]);
            while (optionsSet.size < 4) {
                if (target === "circumference") {
                    const wrong = fmt2(c + randInt(-25, 25) / 10);
                    if (Number(wrong) > 0) optionsSet.add(wrong);
                } else {
                    const base = target === "radius" ? r : d;
                    const wrong = String(base + randInt(-4, 4));
                    if (Number(wrong) > 0) optionsSet.add(wrong);
                }
            }

            const cx = 150;
            const cy = 115;
            const radPx = 70;

            const svg = `
                <svg width="320" height="230" viewBox="0 0 320 230" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${cx}" cy="${cy}" r="${radPx}" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="${cx}" cy="${cy}" r="2.5" fill="black"/>

                    <line x1="${cx}" y1="${cy}" x2="${cx + radPx}" y2="${cy}" stroke="#000000" stroke-width="2"/>

                    <text x="${cx + 8}" y="${cy - 8}" font-size="12" fill="#000000">r = ${radiusLabel}</text>
                    <text x="${cx + 72}" y="${cy - 26}" font-size="12" fill="#000000">C = ${circumferenceLabel}</text>
                </svg>
            `;

            const prompt =
                target === "radius" ? `\\text{find the radius.}`
                : target === "diameter" ? `\\text{find the diameter.}`
                : `\\text{find the circumference. }`;

            return {
                svg,
                latex: `\\text{Use the labelled circle to }\\\\${prompt}`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const r = randInt(3, 14);
            const d = 2 * r;
            const cCoeff = 2 * r;

            const targets = ["radius", "diameter", "circumference"] as const;
            const target = targets[randInt(0, targets.length - 1)];
            const radiusFocus = Math.random() < 0.5;

            let radiusLabel = "?";
            let diameterLabel = "?";
            let circumferenceLabel = "?";
            let answer = "";
            let prompt = "";
            let showRadius = false;
            let showDiameter = false;

            if (target === "radius") {
                showRadius = true;
                radiusLabel = "?";
                circumferenceLabel = `${piTerm(cCoeff)} cm`;
                answer = String(r);
                prompt = `\\text{find the radius.}`;
            } else if (target === "diameter") {
                showDiameter = true;
                diameterLabel = "?";
                circumferenceLabel = `${piTerm(cCoeff)} cm`;
                answer = String(d);
                prompt = `\\text{find the diameter.}`;
            } else {
                showRadius = radiusFocus;
                showDiameter = !radiusFocus;
                radiusLabel = radiusFocus ? `${r} cm` : "?";
                diameterLabel = radiusFocus ? "?" : `${d} cm`;
                circumferenceLabel = "?";
                answer = piTerm(cCoeff);
                prompt = `\\text{find the circumference in terms of } \\pi\\text{.}`;
            }

            const optionsSet = new Set<string>([answer]);
            while (optionsSet.size < 4) {
                if (target === "circumference") {
                    const wrongCoeff = cCoeff + randInt(-8, 8);
                    if (wrongCoeff > 0) optionsSet.add(piTerm(wrongCoeff));
                } else {
                    const base = target === "radius" ? r : d;
                    const wrong = String(base + randInt(-4, 4));
                    if (Number(wrong) > 0) optionsSet.add(wrong);
                }
            }

            const cx = 150;
            const cy = 115;
            const radPx = 70;

            const svg = `
                <svg width="320" height="230" viewBox="0 0 320 230" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${cx}" cy="${cy}" r="${radPx}" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="${cx}" cy="${cy}" r="2.5" fill="black"/>

                    ${showRadius ? `<line x1="${cx}" y1="${cy}" x2="${cx + radPx}" y2="${cy}" stroke="#000000" stroke-width="2"/>` : ""}
                    ${showDiameter ? `<line x1="${cx - radPx}" y1="${cy}" x2="${cx + radPx}" y2="${cy}" stroke="#000000" stroke-width="1.8"/>` : ""}

                    ${showRadius ? `<text x="${cx + 8}" y="${cy - 8}" font-size="12" fill="#000000">r = ${radiusLabel}</text>` : ""}
                    ${showDiameter ? `<text x="${cx - 36}" y="${cy + 16}" font-size="12" fill="#000000">d = ${diameterLabel}</text>` : ""}
                    <text x="${cx + 72}" y="${cy - 26}" font-size="12" fill="#000000">C = ${circumferenceLabel}</text>
                </svg>
            `;

            return {
                svg,
                latex: `\\text{Use the labelled circle to } ${prompt}`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "arcs-and-sectors": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const fmt2 = (n: number) => Number(n.toFixed(2)).toFixed(2);

        const arcLength = (r: number, theta: number) => (theta / 360) * 2 * Math.PI * r;
        const sectorArea = (r: number, theta: number) => (theta / 360) * Math.PI * r * r;
        const sectorPerimeter = (r: number, theta: number) => arcLength(r, theta) + 2 * r;

        const makeDecimalOptions = (answer: number) => {
            const set = new Set<string>([fmt2(answer)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 300) {
                const wrong = answer + randInt(-30, 30) / 10;
                if (wrong > 0 && Math.abs(wrong - answer) > 0.05) {
                    set.add(fmt2(wrong));
                }
            }
            return Array.from(set).sort(() => Math.random() - 0.5);
        };

        const makeAngleOptions = (answer: number) => {
            const set = new Set<string>([String(answer)]);
            while (set.size < 4) {
                const wrong = answer + randInt(-40, 40);
                if (wrong > 0 && wrong < 360) {
                    set.add(String(wrong));
                }
            }
            return Array.from(set).sort(() => Math.random() - 0.5);
        };

        const drawSectorSvg = (args: {
            radius: number;
            theta: number;
            angleLabel?: string;
            radiusLabel?: string;
            interiorLabel?: string;
            exteriorLabel?: string;
            radiusLabelSide?: "top" | "bottom";
        }) => {
            const { radius, theta, angleLabel, radiusLabel, interiorLabel, exteriorLabel, radiusLabelSide } = args;
            const cx = 165;
            const cy = 140;
            const rPx = 80;

            const startX = cx + rPx;
            const startY = cy;
            const endRad = (-theta * Math.PI) / 180;
            const endX = cx + rPx * Math.cos(endRad);
            const endY = cy + rPx * Math.sin(endRad);
            const largeArc = theta > 180 ? 1 : 0;

            const angleMid = (-theta / 2) * (Math.PI / 180);
            const angleTx = cx + 28 * Math.cos(angleMid);
            const angleTy = cy + 28 * Math.sin(angleMid);

            return `
                <svg width="340" height="250" viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg">
                    <path d="M ${cx} ${cy} L ${startX} ${startY} A ${rPx} ${rPx} 0 ${largeArc} 0 ${endX} ${endY} Z" fill="none" stroke="black" stroke-width="2"/>
                    <line x1="${cx}" y1="${cy}" x2="${startX}" y2="${startY}" stroke="#000000" stroke-width="2"/>
                    <line x1="${cx}" y1="${cy}" x2="${endX}" y2="${endY}" stroke="#000000" stroke-width="2"/>
                    <circle cx="${cx}" cy="${cy}" r="2.5" fill="black"/>

                    ${angleLabel ? `<text x="${angleTx}" y="${angleTy}" font-size="13" text-anchor="middle" fill="#000000">${angleLabel}</text>` : ""}
                    ${interiorLabel ? `<text x="${cx - 34}" y="${cy + 18}" font-size="12" fill="#000000">${interiorLabel}</text>` : ""}
                    ${exteriorLabel ? `<text x="${cx+14}" y="${cy + 20}" font-size="12" fill="#000000">${exteriorLabel}</text>` : ""}
                    ${radiusLabel ? `<text x="${cx + 18}" y="${cy + (radiusLabelSide === "top" ? -8 : 14)}" font-size="12" fill="#000000">r = ${radiusLabel}</text>` : ""}
                </svg>
            `;
        };

        // ---------------- LEVEL 1 ----------------
        // Given radius and central angle, find area or perimeter.
        if (difficulty === 1) {
            const anglePool = [60, 72, 100, 120, 135, 150, 180, 210, 240, 270];
            const theta = anglePool[randInt(0, anglePool.length - 1)];
            const r = randInt(4, 14);
            const askArea = Math.random() < 0.5;

            const answerNum = askArea ? sectorArea(r, theta) : sectorPerimeter(r, theta);

            const svg = drawSectorSvg({
                radius: r,
                theta,
                angleLabel: `${theta}°`,
                radiusLabel: `${r} cm`,
                radiusLabelSide: "bottom",
            });

            return {
                svg,
                latex: askArea
                    ? `\\text{Given the sector shown, calculate the area. Give your answer to 2 decimal places.}`
                    : `\\text{Given the sector shown, calculate the perimeter. Give your answer to 2 decimal places.}`,
                answer: fmt2(answerNum),
                options: makeDecimalOptions(answerNum),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Given exterior angle, find perimeter or area.
        if (difficulty === 2) {
            const exteriorPool = [60, 72, 90, 120, 135, 150, 180, 210, 240, 270];
            const exterior = exteriorPool[randInt(0, exteriorPool.length - 1)];
            const theta = 360 - exterior;
            const r = randInt(4, 12);
            const askArea = Math.random() < 0.5;

            const answerNum = askArea ? sectorArea(r, theta) : sectorPerimeter(r, theta);

            const svg = drawSectorSvg({
                radius: r,
                theta,
                radiusLabel: `${r} cm`,
                radiusLabelSide: "top",
                exteriorLabel: `${exterior}°`,
            });

            return {
                svg,
                latex: askArea
                    ? `\\text{Use the exterior angle to find the area of the sector. Give your answer to 2 decimal places.}`
                    : `\\text{Use the exterior angle to find the perimeter of the sector. Give your answer to 2 decimal places.}`,
                answer: fmt2(answerNum),
                options: makeDecimalOptions(answerNum),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // Given circumference (arc length) or area and radius, find angle.
        if (difficulty === 3) {
            const anglePool = [45, 60, 72, 90, 120, 135, 150, 180, 210, 240, 270, 300];
            const theta = anglePool[randInt(0, anglePool.length - 1)];
            const r = randInt(4, 12);
            const useArc = Math.random() < 0.5;

            const givenVal = useArc ? arcLength(r, theta) : sectorArea(r, theta);

            const svg = drawSectorSvg({
                radius: r,
                theta,
                angleLabel: "x",
                radiusLabel: `${r} cm`,
                radiusLabelSide: "bottom",
            });

            return {
                svg,
                latex: useArc
                    ? `\\text{Given the arc circumference is ${fmt2(givenVal)} cm and radius ${r} cm, find angle } x\\text{ in degrees.}`
                    : `\\text{Given the sector area is ${fmt2(givenVal)} } cm^{2} \\ \\text{ and radius ${r} cm, find angle } x\\text{ in degrees.}`,
                answer: String(theta),
                options: makeAngleOptions(theta),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3]),
    "area-and-perimeter": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randFloat = (min: number, max: number, dp = 1) =>
            parseFloat((Math.random() * (max - min) + min).toFixed(dp));

        const makeOptions = (correct: number | string, gen: () => number, count = 4): string[] => {
            const s = new Set([String(correct)]);
            let tries = 0;
            while (s.size < count && tries++ < 200) {
                const v = gen();
                if (v > 0) s.add(String(v));
            }
            return [...s].sort(() => Math.random() - 0.5);
        };

        // ──────────────── LEVEL 1 ────────────────
        // Basic area & perimeter of squares, rectangles, triangles (whole numbers)
        if (difficulty === 1) {
            const shapes = ["square", "rectangle", "triangle"];
            const shape = shapes[randInt(0, 2)];
            const qType = randInt(0, 1); // 0=area, 1=perimeter

            if (shape === "square") {
                const a = randInt(2, 12);
                const [answer, label] = qType === 0 ? [a * a, "area"] : [4 * a, "perimeter"];
                return {
                    latex: `\\text{Find the ${label} of a square with side length } ${a} \\text{ cm.}`,
                    answer: String(answer),
                    options: makeOptions(answer, () => randInt(1, 144)),
                    forceOption: 0,
                };
            }

            if (shape === "rectangle") {
                const w = randInt(2, 15), h = randInt(2, 12);
                const [answer, label] = qType === 0 ? [w * h, "area"] : [2 * (w + h), "perimeter"];
                return {
                    latex: `\\text{Find the ${label} of a rectangle } ${w} \\text{ cm} \\times ${h} \\text{ cm.}`,
                    answer: String(answer),
                    options: makeOptions(answer, () => randInt(1, 200)),
                    forceOption: 0,
                };
            }

            // triangle
            const b = randInt(4, 14), h = randInt(3, 10);
            if (qType === 0) {
                const area = parseFloat((0.5 * b * h).toFixed(1));
                return {
                    latex: `\\text{Find the area of a triangle with base } ${b} \\text{ cm and height } ${h} \\text{ cm.}`,
                    answer: String(area),
                    options: makeOptions(area, () => parseFloat((randInt(5, 80) * 0.5).toFixed(1))),
                    forceOption: 0,
                };
            } else {
                const s1 = randInt(4, 12), s2 = randInt(4, 12);
                const p = b + s1 + s2;
                return {
                    latex: `\\text{A triangle has sides } ${b} \\text{ cm, } ${s1} \\text{ cm, and } ${s2} \\text{ cm. Find the perimeter.}`,
                    answer: String(p),
                    options: makeOptions(p, () => randInt(10, 50)),
                    forceOption: 0,
                };
            }
        }

        // ──────────────── LEVEL 2 ────────────────
        // Circles (area & circumference), parallelogram, trapezium — introduces decimals & π
        if (difficulty === 2) {
            const qChoice = randInt(0, 2);

            if (qChoice === 0) {
                // Circle
                const r = randInt(2, 10);
                const qType = randInt(0, 1);
                const area = parseFloat((Math.PI * r * r).toFixed(1));
                const circ = parseFloat((2 * Math.PI * r).toFixed(1));
                if (qType === 0) {
                    return {
                        latex: `\\text{Find the area of a circle with radius } ${r} \\text{ cm. Give your answer to 1 d.p.}`,
                        answer: String(area),
                        options: makeOptions(area, () => parseFloat((randInt(5, 350) * 0.3).toFixed(1))),
                        forceOption: 0,
                    };
                } else {
                    return {
                        latex: `\\text{Find the circumference of a circle with radius } ${r} \\text{ cm. Give your answer to 1 d.p.}`,
                        answer: String(circ),
                        options: makeOptions(circ, () => parseFloat((randInt(10, 150) * 0.4).toFixed(1))),
                        forceOption: 0,
                    };
                }
            }

            if (qChoice === 1) {
                // Parallelogram
                const b = randInt(4, 14), h = randInt(3, 10);
                const area = b * h;
                return {
                    latex: `\\text{Find the area of a parallelogram with base } ${b} \\text{ cm and perpendicular height } ${h} \\text{ cm.}`,
                    answer: String(area),
                    options: makeOptions(area, () => randInt(10, 150)),
                    forceOption: 0,
                };
            }

            // Trapezium
            const a = randInt(3, 10), b = randInt(a + 2, 15), h = randInt(3, 10);
            const area = parseFloat((0.5 * (a + b) * h).toFixed(1));
            return {
                latex: `\\text{A trapezium has parallel sides } ${a} \\text{ cm and } ${b} \\text{ cm, and height } ${h} \\text{ cm. Find the area.}`,
                answer: String(area),
                options: makeOptions(area, () => parseFloat((randInt(15, 150) * 0.5).toFixed(1))),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 3 ────────────────
        // Compound shapes & reverse problems (find missing side from area)
        if (difficulty === 3) {
            const qChoice = randInt(0, 2);

            if (qChoice === 0) {
                // Rectangle + triangle on top
                const rw = randInt(6, 14), rh = randInt(4, 10), th = randInt(3, 8);
                const area = parseFloat((rw * rh + 0.5 * rw * th).toFixed(1));
                return {
                    latex: `\\text{A compound shape is a rectangle } (${rw} \\times ${rh} \\text{ cm}) \\text{ with a triangle on top (base } ${rw} \\text{ cm, height } ${th} \\text{ cm). } \\\\ \\text{Find the total area.}`,
                    answer: String(area),
                    options: makeOptions(area, () => parseFloat((randInt(30, 250) * 0.5).toFixed(1))),
                    forceOption: 0,
                };
            }

            if (qChoice === 1) {
                // Reverse: find missing side given area
                const s1 = randInt(4, 12), s2 = randInt(4, 12);
                const a2 = s1 * s2;
                return {
                    latex: `\\text{A rectangle has area } ${a2} \\text{ cm}^2 \\text{ and one side of length } ${s1} \\text{ cm. } \\\\ \\text{What is the other side?}`,
                    answer: String(s2),
                    options: makeOptions(s2, () => randInt(3, 15)),
                    forceOption: 0,
                };
            }

            // Rectangle with circular hole
            const rw = randInt(10, 20), rh = randInt(8, 16), r = randInt(2, Math.min(rw, rh) / 2 - 1);
            const area = parseFloat((rw * rh - Math.PI * r * r).toFixed(1));
            return {
                latex: `\\text{A rectangle } (${rw} \\times ${rh} \\text{ cm}) \\text{ has a circular hole of radius } ${r} \\text{ cm removed. } \\\\ \\text{Find the remaining area to 1 d.p.}`,
                answer: String(area),
                options: makeOptions(area, () => parseFloat((randInt(80, 300) - randInt(10, 50) * 0.1).toFixed(1))),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 4 ────────────────
        // Real-world word problems: cost of tiling/fencing, scale factor, sector area
        if (difficulty === 4) {
            const qChoice = randInt(0, 2);

            if (qChoice === 0) {
                const w = randInt(5, 20), h = randInt(5, 20);
                if (randInt(0, 1) === 0) {
                    const costPer = randInt(2, 8);
                    const total = w * h * costPer;
                    return {
                        latex: `\\text{A rectangular room is } ${w} \\text{m} \\times ${h} \\text{m. Tiles cost £}${costPer} \\text{ per m}^2\\text{. What is the total cost?}`,
                        answer: String(total),
                        options: makeOptions(total, () => randInt(50, 2000)),
                        forceOption: 0,
                    };
                } else {
                    const costPer = randInt(3, 12);
                    const total = 2 * (w + h) * costPer;
                    return {
                        latex: `\\text{A rectangular garden is } ${w} \\text{m} \\times ${h} \\text{m. Fencing costs £}${costPer} \\text{ per metre. } \\\\ \\text{What is the total cost to fence all four sides?}`,
                        answer: String(total),
                        options: makeOptions(total, () => randInt(50, 2000)),
                        forceOption: 0,
                    };
                }
            }

            if (qChoice === 1) {
                const origSide = randInt(3, 10);
                const scale = randInt(2, 4);
                const origArea = origSide * origSide;
                const newArea = origArea * scale * scale;
                return {
                    latex: `\\text{A square has side } ${origSide} \\text{ cm (area = } ${origArea} \\text{ cm}^2\\text{). All sides are scaled by factor } ${scale}\\text{. What is the new area?}`,
                    answer: String(newArea),
                    options: makeOptions(newArea, () => randInt(10, 1000)),
                    forceOption: 0,
                };
            }

            // Sector area
            const r = randInt(4, 12);
            const fracs: [number, number][] = [[1, 2], [1, 4], [3, 4], [1, 3]];
            const [num, den] = fracs[randInt(0, 3)];
            const area = parseFloat(((num / den) * Math.PI * r * r).toFixed(1));
            const fracLabel = `\\frac{${num}}{${den}}`;
            return {
                latex: `\\text{Find the area of } ${fracLabel} \\text{ of a circle with radius } ${r} \\text{ cm. Give your answer to 1 d.p.}`,
                answer: String(area),
                options: makeOptions(area, () => parseFloat((randInt(10, 600) * 0.1).toFixed(1))),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "prisms": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randFloat = (min: number, max: number, dp = 1) =>
            parseFloat((Math.random() * (max - min) + min).toFixed(dp));

        const makeOptions = (
            correct: number | string,
            gen: () => number | string,
            count = 4
            ): string[] => {
            const s = new Set([String(correct)]);
            let tries = 0;

            while (s.size < count && tries++ < 200) {
                const v = gen();
                if (Number(v) > 0 || typeof v === "string") {
                s.add(String(v));
                }
            }

            return [...s].sort(() => Math.random() - 0.5);
        };

        // ──────────────── LEVEL 1: 🟢 Easy ────────────────
        if (difficulty === 1) {
            const qType = randInt(0, 2);

            if (qType === 0) {
                // Rectangular prism volume
                const w = randInt(3, 8), d = randInt(2, 6), l = randInt(8, 15);
                const vol = w * d * l;
                return {
                    latex: `\\text{A prism has a rectangular cross-section measuring } ${w} \\text{ cm by } ${d} \\text{ cm and length } ${l} \\text{ cm. Find the volume.}`,
                    answer: String(vol),
                    options: makeOptions(vol, () => randInt(50, 600)),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                // Triangular prism volume
                const b = randInt(4, 10), h = randInt(3, 8), l = randInt(6, 14);
                const vol = parseFloat((0.5 * b * h * l).toFixed(1));
                return {
                    latex: `\\text{A triangular prism has a triangle with base } ${b} \\text{ cm and height } ${h} \\text{ cm. The length of the prism is } ${l} \\text{ cm. Find the volume.}`,
                    answer: String(vol),
                    options: makeOptions(vol, () => parseFloat((randInt(30, 400) * 0.5).toFixed(1))),
                    forceOption: 0,
                };
            }

            // Cuboid total surface area
            const l = randInt(4, 10), w = randInt(2, 7), h = randInt(3, 9);
            const sa = 2 * (l * w + l * h + w * h);
            return {
                latex: `\\text{A cuboid has dimensions } ${l} \\text{ cm} \\times ${w} \\text{ cm} \\times ${h} \\text{ cm. Find the total surface area.}`,
                answer: String(sa),
                options: makeOptions(sa, () => randInt(80, 500)),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 2: 🟡 Medium ────────────────
        if (difficulty === 2) {
            const qType = randInt(0, 3);

            if (qType === 0) {
                // Trapezium prism volume
                const a = randInt(5, 12), b = randInt(a + 3, 18), ht = randInt(4, 9), l = randInt(10, 20);
                const vol = parseFloat((0.5 * (a + b) * ht * l).toFixed(1));
                return {
                    latex: `\\text{A prism has a trapezium cross-section with parallel sides } ${a} \\text{ cm and } ${b} \\text{ cm, and height } ${ht} \\text{ cm. The length is } ${l} \\text{ cm. Find the volume.}`,
                    answer: String(vol),
                    options: makeOptions(vol, () => parseFloat((randInt(100, 800) * 0.6).toFixed(1))),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                // Given cross-sectional area
                const area = randInt(12, 40);
                const l = randInt(7, 18);
                const vol = area * l;
                return {
                    latex: `\\text{A triangular prism has cross-sectional area } ${area} \\text{ cm}^2 \\text{ and length } ${l} \\text{ cm. Find the volume.}`,
                    answer: String(vol),
                    options: makeOptions(vol, () => randInt(80, 700)),
                    forceOption: 0,
                };
            }

            if (qType === 2) {
                // Rectangular prism surface area
                const w = randInt(5, 12), d = randInt(4, 10), l = randInt(15, 30);
                const sa = 2 * (w * d + w * l + d * l);
                return {
                    latex: `\\text{A prism has a rectangular cross-section } ${w} \\text{ cm by } ${d} \\text{ cm and length } ${l} \\text{ cm. Find the total surface area.}`,
                    answer: String(sa),
                    options: makeOptions(sa, () => randInt(200, 1200)),
                    forceOption: 0,
                };
            }

            // Rate of flow problem
            const area = randInt(20, 45);
            const height = randInt(8, 20);
            const rate = randInt(40, 80);
            const time = parseFloat(((area * height) / rate).toFixed(1));
            return {
                latex: `\\text{Water flows into a prism-shaped tank at } ${rate} \\text{ cm}^3\\text{/s. The tank has a constant cross-sectional area of } ${area} \\text{ cm}^2\\text{. How long does it take to fill the tank to a height of } ${height} \\text{ cm?}`,
                answer: String(time),
                options: makeOptions(time, () => randFloat(2, 25, 1)),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 3: 🟠 Hard ────────────────
        if (difficulty === 3) {
            const qType = randInt(0, 2);

            if (qType === 0) {
                // Triangular prism total surface area
                const leg1 = randInt(6, 12), leg2 = randInt(8, 15), l = randInt(12, 25);
                const hyp = Math.sqrt(leg1**2 + leg2**2);
                const sa = leg1*l + leg2*l + hyp*l + leg1*leg2;
                const roundedSA = parseFloat(sa.toFixed(1));
                return {
                    latex: `\\text{A prism has a right-angled triangular cross-section with legs } ${leg1} \\text{ cm and } ${leg2} \\text{ cm. The length is } ${l} \\text{ cm. Find the total surface area to 1 d.p.}`,
                    answer: String(roundedSA),
                    options: makeOptions(roundedSA, () => randInt(300, 1500)),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                // Reverse: solve for x
                const base = randInt(5, 12);
                const extra = randInt(1, 4);
                const l = randInt(5, 10);
                const vol = parseFloat((0.5 * base * (base + extra) * l).toFixed(1));
                return {
                    latex: `\\text{A prism has volume } ${vol} \\text{ cm}^3\\text{. Its triangular cross-section has base } x \\text{ cm and height } x+${extra} \\text{ cm. The length is } ${l} \\text{ cm. Solve for } x\\text{.}`,
                    answer: String(base),
                    options: makeOptions(base, () => randInt(3, 18)),
                    forceOption: 0,
                };
            }

            // Prism melted into cube
            const a = randInt(6, 12), b = randInt(a + 4, 18), ht = randInt(4, 8), len = randInt(8, 15);
            const vol = parseFloat((0.5 * (a + b) * ht * len).toFixed(1));
            const side = parseFloat(Math.pow(vol, 1/3).toFixed(2));
            return {
                latex: `\\text{A solid prism with trapezium cross-section (parallel sides } ${a} \\text{ cm and } ${b} \\text{ cm, height } ${ht} \\text{ cm) and length } ${len} \\text{ cm is melted and recast into a cube. Find the side length of the cube to 2 d.p.}`,
                answer: String(side),
                options: makeOptions(side, () => randFloat(4, 12, 2)),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 4: 🔴 Very Hard ────────────────
        if (difficulty === 4) {
            const qType = randInt(0, 2);

            if (qType === 0) {
                // Semicircle prism volume (in terms of π)
                const r = randInt(5, 12);
                const l = randInt(15, 30);
                const volPi = parseFloat((0.5 * Math.PI * r * r * l).toFixed(1));
                return {
                    latex: `\\text{A prism has a uniform semicircular cross-section with radius } ${r} \\text{ cm. The length of the prism is } ${l} \\text{ cm. Find the volume, giving your answer in terms of } \\pi\\text{.}`,
                    answer: String(volPi) + " \\pi",
                    options: makeOptions(String(volPi) + " \\pi", () => `${randFloat(80, 600).toFixed(1)} \\pi`),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                // Displacement verification
                const crossArea = randInt(35, 55);
                const cuboidVol = 60; // 5×4×3
                const calculatedRise = parseFloat((cuboidVol / crossArea).toFixed(2));
                const givenRise = randFloat(1.0, 2.5, 1);
                const isCorrect = Math.abs(calculatedRise - givenRise) < 0.15;
                return {
                    latex: `\\text{A prism-shaped container has a constant cross-sectional area of } ${crossArea} \\text{ cm}^2\\text{. When a } 5 \\times 4 \\times 3 \\text{ cm cuboid is fully submerged, the water level rises by } ${givenRise} \\text{ cm. Is this correct?}`,
                    answer: isCorrect ? "Yes" : "No",
                    options: ["Yes", "No", "Cannot be determined", "Approximately yes"],
                    forceOption: 0,
                };
            }

            // ───── House-shaped prism (Randomly volume OR surface area) ─────
            const w = randInt(8, 14);
            const rectH = randInt(5, 9);
            const triH = randInt(3, 7);
            const len = randInt(12, 25);

            const crossArea = w * rectH + 0.5 * w * triH;
            const volume = parseFloat((crossArea * len).toFixed(1));

            // Approximate total surface area (lateral faces + 2 ends)
            const sa = 2 * crossArea + (2 * w + 2 * rectH + 2 * triH) * len; // simplified

            const askVolume = randInt(0, 1) === 0;

            if (askVolume) {
                return {
                    latex: `\\text{A prism has a "house" cross-section: a rectangle (width ${w} cm, height ${rectH} cm) topped with a triangle (base ${w} cm, height ${triH} cm). The length of the prism is ${len} cm. Find the volume of the prism.}`,
                    answer: String(volume),
                    options: makeOptions(volume, () => parseFloat((randInt(300, 1800) * 0.7).toFixed(1))),
                    forceOption: 0,
                };
            } else {
                const roundedSA = Math.round(sa);
                return {
                    latex: `\\text{A prism has a "house" cross-section: a rectangle (width ${w} cm, height ${rectH} cm) topped with a triangle (base ${w} cm, height ${triH} cm). The length of the prism is ${len} cm. Find the total surface area of the prism (to the nearest whole number).}`,
                    answer: String(roundedSA),
                    options: makeOptions(roundedSA, () => randInt(800, 3000)),
                    forceOption: 0,
                };
            }
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "cylinders": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randFloat = (min: number, max: number, dp = 1) =>
            parseFloat((Math.random() * (max - min) + min).toFixed(dp));

        const makeOptions = (correct: number | string, gen: () => number, count = 4): string[] => {
            const s = new Set([String(correct)]);
            let tries = 0;
            while (s.size < count && tries++ < 200) {
                const v = gen();
                if (v > 0) s.add(String(v));
            }
            return [...s].sort(() => Math.random() - 0.5);
        };

        // ──────────────── LEVEL 1 ────────────────
        // Combined basic cylinder questions:
        // Volume, Curved Surface Area, Total Surface Area
        // Mostly whole numbers, some simple decimals, introduces π
        if (difficulty === 1) {
            const qType = randInt(0, 2); // 0 = Volume, 1 = Curved SA, 2 = Total SA

            if (qType === 0) {
                // Volume
                const r = randInt(2, 9);
                const h = randInt(4, 14);
                const volume = parseFloat((Math.PI * r * r * h).toFixed(1));
                return {
                    latex: `\\text{Find the volume of a cylinder with radius } ${r} \\text{ cm and height } ${h} \\text{ cm. Give your answer to 1 d.p.}`,
                    answer: String(volume),
                    options: makeOptions(volume, () => parseFloat((randInt(30, 900) * 0.35).toFixed(1))),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                // Curved Surface Area
                const r = randInt(2, 8);
                const h = randInt(5, 15);
                const csa = parseFloat((2 * Math.PI * r * h).toFixed(1));
                return {
                    latex: `\\text{Find the curved surface area of a cylinder with radius } ${r} \\text{ cm and height } ${h} \\text{ cm. Give your answer to 1 d.p.}`,
                    answer: String(csa),
                    options: makeOptions(csa, () => parseFloat((randInt(40, 500) * 0.3).toFixed(1))),
                    forceOption: 0,
                };
            }

            // Total Surface Area
            const r = randInt(3, 9);
            const h = randInt(4, 12);
            const tsa = parseFloat((2 * Math.PI * r * h + 2 * Math.PI * r * r).toFixed(1));
            return {
                latex: `\\text{Find the total surface area of a cylinder with radius } ${r} \\text{ cm and height } ${h} \\text{ cm. Give your answer to 1 d.p.}`,
                answer: String(tsa),
                options: makeOptions(tsa, () => parseFloat((randInt(60, 750) * 0.45).toFixed(1))),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 2 ────────────────
        // Reverse problems + decimal radius
        if (difficulty === 2) {
            const qChoice = randInt(0, 1);

            if (qChoice === 0) {
                // Find height given volume and radius
                const r = randInt(3, 8);
                const h = randInt(5, 16);
                const volume = parseFloat((Math.PI * r * r * h).toFixed(1));
                return {
                    latex: `\\text{A cylinder has a volume of } ${volume} \\text{ cm}^3 \\text{ and a radius of } ${r} \\text{ cm. Find its height.}`,
                    answer: String(h),
                    options: makeOptions(h, () => randInt(4, 25)),
                    forceOption: 0,
                };
            }


            // Find radius given volume and height (integer radius)
            const h = randInt(6, 15);
            const r = randInt(2, 7);
            const volume = parseFloat((Math.PI * r * r * h).toFixed(1));
            return {
                latex: `\\text{A cylinder has a volume of } ${volume} \\text{ cm}^3 \\text{ and height } ${h} \\text{ cm. Find its radius.}`,
                answer: String(r),
                options: makeOptions(r, () => randInt(1, 12)),
                forceOption: 0,
            };
            
        }

        // ──────────────── LEVEL 3 ────────────────
        // More challenging reverse + total surface area reverse
        if (difficulty === 3) {
            const qChoice = randInt(0, 1);

            if (qChoice === 0) {
                // Find height given total surface area and radius
                const r = randInt(3, 9);
                const h = randInt(5, 14);
                const tsa = parseFloat((2 * Math.PI * r * h + 2 * Math.PI * r * r).toFixed(1));
                return {
                    latex: `\\text{A cylinder has total surface area } ${tsa} \\text{ cm}^2 \\text{ and radius } ${r} \\text{ cm. Find the height.}`,
                    answer: String(h),
                    options: makeOptions(h, () => randInt(3, 22)),
                    forceOption: 0,
                };
            }

            // Find radius given total surface area and height (harder)
            const h = randInt(6, 16);
            const r = randInt(3, 8);
            const tsa = parseFloat((2 * Math.PI * r * h + 2 * Math.PI * r * r).toFixed(1));
            return {
                latex: `\\text{A cylinder has total surface area } ${tsa} \\text{ cm}^2 \\text{ and height } ${h} \\text{ cm. Find the radius.}`,
                answer: String(r),
                options: makeOptions(r, () => randInt(2, 13)),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 4 ────────────────
        // Real-world applications: cost, capacity, scale factor
        if (difficulty === 4) {
            const qChoice = randInt(0, 2);

            if (qChoice === 0) {
                // Painting cost (curved surface)
                const r = randInt(15, 40);
                const h = randInt(25, 60);
                const costPer = randInt(5, 15);
                const areaM2 = parseFloat(((2 * Math.PI * r * h) / 10000).toFixed(3));
                const totalCost = parseFloat((areaM2 * costPer).toFixed(2));
                return {
                    latex: `\\text{The curved surface of a cylindrical tank (radius ${r} cm, height ${h} cm) is painted. Paint costs £${costPer} per m}^2\\text{. Calculate the total cost to 2 d.p.}`,
                    answer: String(totalCost),
                    options: makeOptions(totalCost, () => randFloat(12, 180, 2)),
                    forceOption: 0,
                };
            }

            if (qChoice === 1) {
                // Capacity in litres
                const r = randInt(8, 20);
                const h = randInt(15, 40);
                const volCM3 = parseFloat((Math.PI * r * r * h).toFixed(1));
                const litres = parseFloat((volCM3 / 1000).toFixed(1));
                return {
                    latex: `\\text{A cylindrical water tank has radius } ${r} \\text{ cm and height } ${h} \\text{ cm. How many litres can it hold? (1 litre = 1000 cm}^3\\text{) Answer to 1 d.p.}`,
                    answer: String(litres),
                    options: makeOptions(litres, () => parseFloat((randInt(5, 45) * 1.1).toFixed(1))),
                    forceOption: 0,
                };
            }

            // Scale factor on volume
            const origR = randInt(4, 9);
            const origH = randInt(6, 14);
            const scale = randInt(2, 4);
            const origVol = parseFloat((Math.PI * origR * origR * origH).toFixed(1));
            const newVol = parseFloat((origVol * Math.pow(scale, 3)).toFixed(1));
            return {
                latex: `\\text{A cylinder has radius } ${origR} \\text{ cm and height } ${origH} \\text{ cm (volume = } ${origVol} \\text{ cm}^3\\text{). If all lengths are multiplied by } ${scale}\\text{, what is the new volume to 1 d.p.?}`,
                answer: String(newVol),
                options: makeOptions(newVol, () => parseFloat((randInt(200, 4000) * 0.25).toFixed(1))),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "spheres": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const fmt2 = (n: number) => Number(n.toFixed(2)).toFixed(2);

        if (difficulty === 1) {
            const radius = randInt(2, 12);
            const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);

            const askVolume = Math.random() < 0.5;

            const answer = askVolume ? fmt2(volume) : String(radius);

            const optionsSet = new Set<string>([answer]);
            while (optionsSet.size < 4) {
                if (askVolume) {
                    const wrong = fmt2(volume + randInt(-80, 80));
                    if (Number(wrong) > 0 && wrong !== answer) optionsSet.add(wrong);
                } else {
                    const wrong = String(radius + randInt(-4, 4));
                    if (Number(wrong) > 0 && wrong !== answer) optionsSet.add(wrong);
                }
            }

            const question = askVolume
                ? `\\text{If the radius is } ${radius} \\text{ cm, what is the volume of the sphere? Give your answer to 2 d.p. }`
                : `\\text{If the volume is } ${fmt2(volume)} \\text{ cm}^3\\text{, what is the radius of the sphere? }`;

            return {
                latex: `${question} \\\\ \\text{Formula: } V = \\frac{4}{3}\\pi r^3`,
                answer,
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1]),
    "unit-conversions": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randFloat = (min: number, max: number, dp = 1) =>
            parseFloat((Math.random() * (max - min) + min).toFixed(dp));
        const pick = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

        const makeOptions = (correct: number | string, gen: () => number, count = 4): string[] => {
            const fmt = (n: number | string) =>
                typeof n === "string" ? n : String(parseFloat(Number(n).toFixed(4)));
            const s = new Set([fmt(correct)]);
            let tries = 0;
            while (s.size < count && tries++ < 300) {
                const v = gen();
                if (v > 0) s.add(fmt(v));
            }
            return [...s].sort(() => Math.random() - 0.5);
        };

        // ──────────────── LEVEL 1 ────────────────
        // Single-step metric conversions (length & mass, whole numbers or simple decimals)
        if (difficulty === 1) {
            const groups = [
                {
                    cat: "Length",
                    qs: [
                        () => { const v = randInt(1, 20); return { q: `Convert ${v} km to metres.`, a: v * 1000, gen: () => randInt(100, 25000) }; },
                        () => { const v = randInt(100, 9900); return { q: `Convert ${v} m to kilometres.`, a: v / 1000, gen: () => randFloat(0.1, 10, 2) }; },
                        () => { const v = randInt(1, 500); return { q: `Convert ${v} cm to millimetres.`, a: v * 10, gen: () => randInt(10, 5000) }; },
                        () => { const v = randInt(10, 5000); return { q: `Convert ${v} mm to centimetres.`, a: v / 10, gen: () => randFloat(1, 500, 1) }; },
                        () => { const v = randInt(1, 200); return { q: `Convert ${v} cm to metres.`, a: parseFloat((v / 100).toFixed(2)), gen: () => randFloat(0.01, 2, 2) }; },
                        () => { const v = randFloat(0.5, 5, 1); return { q: `Convert ${v} m to centimetres.`, a: v * 100, gen: () => randInt(10, 600) }; },
                    ],
                },
                {
                    cat: "Mass",
                    qs: [
                        () => { const v = randInt(1, 20); return { q: `Convert ${v} kg to grams.`, a: v * 1000, gen: () => randInt(100, 25000) }; },
                        () => { const v = randInt(500, 9500); return { q: `Convert ${v} g to kilograms.`, a: parseFloat((v / 1000).toFixed(2)), gen: () => randFloat(0.1, 10, 2) }; },
                        () => { const v = randInt(1, 10); return { q: `Convert ${v} tonnes to kilograms.`, a: v * 1000, gen: () => randInt(100, 12000) }; },
                        () => { const v = randInt(1, 500); return { q: `Convert ${v} mg to grams.`, a: parseFloat((v / 1000).toFixed(3)), gen: () => randFloat(0.001, 0.5, 3) }; },
                    ],
                },
            ];

            const grp = pick(groups);
            const { q, a, gen } = pick(grp.qs)();
            return {
                latex: `\\text{${q}}`,
                answer: String(parseFloat(Number(a).toFixed(4))),
                options: makeOptions(a, gen),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 2 ────────────────
        // Imperial ↔ metric conversions + time
        if (difficulty === 2) {
            const pools = [
                {
                    cat: "Length (imperial ↔ metric)",
                    qs: [
                        () => { const v = randInt(1, 20); return { q: `Convert ${v} miles to kilometres. (1 mile = 1.6 km)`, a: parseFloat((v * 1.6).toFixed(1)), gen: () => randFloat(1, 35, 1) }; },
                        () => { const v = randInt(2, 30); return { q: `Convert ${v} km to miles. (1 mile = 1.6 km)`, a: parseFloat((v / 1.6).toFixed(1)), gen: () => randFloat(1, 20, 1) }; },
                        () => { const v = randInt(1, 10); return { q: `Convert ${v} inches to centimetres. (1 inch = 2.54 cm)`, a: parseFloat((v * 2.54).toFixed(2)), gen: () => randFloat(1, 30, 2) }; },
                        () => { const v = randInt(1, 6); return { q: `Convert ${v} feet to metres. (1 foot = 30.48 cm)`, a: parseFloat((v * 0.3048).toFixed(2)), gen: () => randFloat(0.2, 2, 2) }; },
                    ],
                },
                {
                    cat: "Mass (imperial ↔ metric)",
                    qs: [
                        () => { const v = randInt(1, 15); return { q: `\\text{Convert } ${v} \\text{ pounds to kilograms. (1 kg }\\approx\\text{ 2.2 lb)}`, a: parseFloat((v / 2.2).toFixed(2)), gen: () => randFloat(0.3, 7, 2) }; },
                        () => { const v = randInt(1, 10); return { q: `\\text{Convert } ${v} \\text{ kg to pounds. (1 kg }\\approx\\text{ 2.2 lb)}`, a: parseFloat((v * 2.2).toFixed(1)), gen: () => randFloat(1, 25, 1) }; },
                        () => { const v = randInt(1, 8); return { q: `Convert ${v} stones to kilograms. (1 stone = 6.35 kg)`, a: parseFloat((v * 6.35).toFixed(1)), gen: () => randFloat(3, 55, 1) }; },
                    ],
                },
                {
                    cat: "Time",
                    qs: [
                        () => { const v = randInt(2, 8); return { q: `Convert ${v} hours to minutes.`, a: v * 60, gen: () => randInt(60, 600) }; },
                        () => { const v = randInt(2, 5); return { q: `Convert ${v} days to hours.`, a: v * 24, gen: () => randInt(24, 130) }; },
                        () => { const v = randInt(2, 10); return { q: `Convert ${v} weeks to days.`, a: v * 7, gen: () => randInt(7, 75) }; },
                        () => { const v = randInt(60, 300); return { q: `Convert ${v} seconds to minutes. Give your answer as a decimal.`, a: parseFloat((v / 60).toFixed(2)), gen: () => randFloat(0.5, 6, 2) }; },
                    ],
                },
            ];

            const pool = pick(pools);
            const { q, a, gen } = pick(pool.qs)();
            return {
                latex: q.includes("\\approx") || q.includes("^{") ? q : `\\text{${q}}`,
                answer: String(parseFloat(Number(a).toFixed(4))),
                options: makeOptions(a, gen),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 3 ────────────────
        // Area, volume, and speed conversions — introduces squared/cubed scaling
        if (difficulty === 3) {
            const pools = [
                {
                    cat: "Area",
                    qs: [
                        () => { const v = randInt(1, 10); return { q: `Convert ${v} m² to cm².`, a: v * 10000, gen: () => randInt(1000, 120000) }; },
                        () => { const v = randInt(10000, 90000); return { q: `Convert ${v} cm² to m².`, a: parseFloat((v / 10000).toFixed(2)), gen: () => randFloat(0.1, 10, 2) }; },
                        () => { const v = randInt(1, 8); return { q: `Convert ${v} km² to m².`, a: v * 1000000, gen: () => randInt(100000, 9000000) }; },
                        () => { const v = randInt(1, 5); return { q: `Convert ${v} hectares to m². (1 hectare = 10,000 m²)`, a: v * 10000, gen: () => randInt(5000, 60000) }; },
                        () => { const v = randInt(1, 6); return { q: `Convert ${v} m² to mm².`, a: v * 1000000, gen: () => randInt(200000, 8000000) }; },
                    ],
                },
                {
                    cat: "Volume",
                    qs: [
                        () => { const v = randInt(1, 10); return { q: `Convert ${v} litres to millilitres.`, a: v * 1000, gen: () => randInt(200, 12000) }; },
                        () => { const v = randInt(500, 4500); return { q: `Convert ${v} ml to litres.`, a: parseFloat((v / 1000).toFixed(2)), gen: () => randFloat(0.1, 5, 2) }; },
                        () => { const v = randInt(1, 5); return { q: `Convert ${v} m³ to cm³.`, a: v * 1000000, gen: () => randInt(100000, 6000000) }; },
                        () => { const v = randInt(1, 8); return { q: `Convert ${v} litres to cm³. (1 litre = 1000 cm³)`, a: v * 1000, gen: () => randInt(500, 10000) }; },
                        () => { const v = randInt(1, 6); return { q: `Convert ${v} cm³ to mm³.`, a: v * 1000, gen: () => randInt(200, 8000) }; },
                    ],
                },
                {
                    cat: "Speed",
                    qs: [
                        () => { const v = randInt(10, 120); return { q: `Convert ${v} km/h to m/s. Give your answer to 2 d.p.`, a: parseFloat((v / 3.6).toFixed(2)), gen: () => randFloat(1, 35, 2) }; },
                        () => { const v = randInt(2, 30); return { q: `Convert ${v} m/s to km/h.`, a: parseFloat((v * 3.6).toFixed(1)), gen: () => randFloat(5, 110, 1) }; },
                        () => { const v = randInt(20, 80); return { q: `Convert ${v} mph to km/h. (1 mile = 1.6 km)`, a: parseFloat((v * 1.6).toFixed(1)), gen: () => randFloat(20, 140, 1) }; },
                        () => { const v = randInt(30, 110); return { q: `A car travels at ${v} km/h. How far does it travel in 1 second? Give your answer in metres to 2 d.p.`, a: parseFloat((v * 1000 / 3600).toFixed(2)), gen: () => randFloat(1, 40, 2) }; },
                    ],
                },
            ];

            const pool = pick(pools);
            const { q, a, gen } = pick(pool.qs)();
            return {
                latex: `\\text{${q}}`,
                answer: String(parseFloat(Number(a).toFixed(4))),
                options: makeOptions(a, gen),
                forceOption: 0,
            };
        }

        // ──────────────── LEVEL 4 ────────────────
        // Multi-step chains and real-world word problems
        if (difficulty === 4) {
            const pools = [
                {
                    cat: "Multi-step",
                    qs: [
                        () => {
                            const km = randInt(2, 15), hrs = randInt(1, 3), mins = pick([15, 20, 30, 45]);
                            const totalHrs = hrs + mins / 60;
                            const speed = parseFloat((km / totalHrs).toFixed(2));
                            return { q: `A cyclist travels ${km} km in ${hrs} hour${hrs > 1 ? "s" : ""} ${mins} minutes. What is their average speed in km/h? Give your answer to 2 d.p.`, a: speed, gen: () => randFloat(2, 20, 2) };
                        },
                        () => {
                            const ms = randInt(5, 25);
                            const kmh = parseFloat((ms * 3.6).toFixed(1));
                            const mph = parseFloat((kmh / 1.6).toFixed(1));
                            return { q: `A train travels at ${ms} m/s. Convert this speed to mph. (1 mile = 1.6 km)`, a: mph, gen: () => randFloat(5, 60, 1) };
                        },
                        () => {
                            const ha = randInt(2, 20);
                            const km2 = parseFloat((ha * 10000 / 1000000).toFixed(4));
                            return { q: `\\text{Convert } ${ha} \\text{ hectares to km}^{2}\\text{. (1 ha = 10,000 m}^{2}\\text{, 1 km}^{2}\\text{ = 1,000,000 m}^{2}\\text{)}`, a: km2, gen: () => randFloat(0.01, 0.25, 4) };
                        },
                    ],
                },
                {
                    cat: "Real-world problems",
                    qs: [
                        () => {
                            const lPerKm = randFloat(5, 12, 1), miles = randInt(20, 200);
                            const km = parseFloat((miles * 1.6).toFixed(1));
                            const litres = parseFloat((lPerKm * km / 100).toFixed(1));
                            return { q: `A car uses ${lPerKm} litres per 100 km. How many litres are needed for a ${miles}-mile journey? (1 mile = 1.6 km) Give your answer to 1 d.p.`, a: litres, gen: () => randFloat(1, 30, 1) };
                        },
                        () => {
                            const st = randInt(8, 15), lb = pick([0, 4, 7, 10]);
                            const totalLb = st * 14 + lb;
                            const kg = parseFloat((totalLb / 2.2).toFixed(1));
                            return { q: `\\text{A person weighs } ${st} \\text{ stone } ${lb} \\text{ lb. Convert this to kilograms. (14 lb = 1 stone, 1 kg }\\approx\\text{ 2.2 lb) Give to 1 d.p.}`, a: kg, gen: () => randFloat(40, 100, 1) };
                        },
                        () => {
                            const speedMph = pick([20, 30, 40, 50, 60, 70]);
                            const ms = parseFloat((speedMph * 1.6 * 1000 / 3600).toFixed(2));
                            return { q: `A speed limit is ${speedMph} mph. Convert this to m/s. (1 mile = 1.6 km) Give your answer to 2 d.p.`, a: ms, gen: () => randFloat(1, 40, 2) };
                        },
                        () => {
                            const poolL = randInt(200, 2000) * 10;
                            const m3 = parseFloat((poolL / 1000).toFixed(1));
                            return { q: `\\text{A swimming pool holds } ${poolL.toLocaleString()} \\text{ litres of water. What is this volume in m}^{3}\\text{? (1 m}^{3}\\text{ = 1000 litres)}`, a: m3, gen: () => randFloat(1, 25, 1) };
                        },
                    ],
                },
            ];

            const pool = pick(pools);
            const { q, a, gen } = pick(pool.qs)();
            return {
                latex: q.includes("^{") || q.includes("\\approx") ? q : `\\text{${q}}`,
                answer: String(parseFloat(Number(a).toFixed(4))),
                options: makeOptions(a, gen),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "compound-measures": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const randFloat = (min: number, max: number, dp = 1) =>
            parseFloat((Math.random() * (max - min) + min).toFixed(dp));

        const pick = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

        const makeNumericOptions = (correct: number, gen: () => number, dp = 2): string[] => {
            const fmt = (n: number) => String(parseFloat(n.toFixed(dp)));
            const set = new Set<string>([fmt(correct)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const v = gen();
                if (v > 0) set.add(fmt(v));
            }
            return [...set].sort(() => Math.random() - 0.5);
        };

        // ---------------- LEVEL 1 ----------------
        // Identify the correct formula for speed, density, or pressure
        if (difficulty === 1) {
            const topics = [
                {
                    name: "speed",
                    answer: "v = \\frac{d}{t}",
                    wrong: [
                        "v = d \\times t",
                        "v = \\frac{t}{d}",
                        "v = d - t",
                    ],
                },
                {
                    name: "density",
                    answer: "\\rho = \\frac{m}{V}",
                    wrong: [
                        "\\rho = m \\times V",
                        "\\rho = \\frac{V}{m}",
                        "\\rho = m - V",
                    ],
                },
                {
                    name: "pressure",
                    answer: "P = \\frac{F}{A}",
                    wrong: [
                        "P = F \\times A",
                        "P = \\frac{A}{F}",
                        "P = F - A",
                    ],
                },
            ] as const;

            const q = pick(topics);
            const options = [q.answer, ...q.wrong].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{Which is the correct formula for } ${q.name}\\text{?}`,
                answer: q.answer,
                options,
                forceOption: 2,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Use/rearrange formula to solve direct GCSE-style questions
        if (difficulty === 2) {
            const questionType = randInt(0, 5);

            if (questionType === 0) {
                const d = randInt(60, 300);
                const t = randInt(2, 8);
                const v = d / t;
                return {
                    latex: `\\text{A car travels } ${d} \\text{ km in } ${t} \\text{ hours. Find the speed in km/h.}`,
                    answer: String(v),
                    options: makeNumericOptions(v, () => randFloat(10, 140, 1), 1),
                    forceOption: 0,
                };
            }

            if (questionType === 1) {
                const v = randInt(40, 110);
                const t = randFloat(1.5, 5, 1);
                const d = v * t;
                return {
                    latex: `\\text{A cyclist travels at } ${v} \\text{ km/h for } ${t} \\text{ hours. Find the distance in km.}`,
                    answer: String(parseFloat(d.toFixed(1))),
                    options: makeNumericOptions(d, () => randFloat(40, 600, 1), 1),
                    forceOption: 0,
                };
            }

            if (questionType === 2) {
                const m = randFloat(120, 900, 1);
                const v = randFloat(2, 12, 1);
                const density = m / v;
                return {
                    latex: `\\text{An object has mass } ${m} \\text{ kg and volume } ${v} \\text{ m}^3\\text{. Find its density in kg/m}^3\\text{.}`,
                    answer: String(parseFloat(density.toFixed(2))),
                    options: makeNumericOptions(density, () => randFloat(20, 400, 2), 2),
                    forceOption: 0,
                };
            }

            if (questionType === 3) {
                const density = randFloat(40, 250, 1);
                const v = randFloat(2, 15, 1);
                const m = density * v;
                return {
                    latex: `\\text{A substance has density } ${density} \\text{ kg/m}^3\\text{ and volume } ${v} \\text{ m}^3\\text{. Find its mass in kg.}`,
                    answer: String(parseFloat(m.toFixed(1))),
                    options: makeNumericOptions(m, () => randFloat(20, 3000, 1), 1),
                    forceOption: 0,
                };
            }

            if (questionType === 4) {
                const force = randFloat(100, 1200, 1);
                const area = randFloat(0.4, 5, 2);
                const pressure = force / area;
                return {
                    latex: `\\text{A force of } ${force} \\text{ N acts on an area of } ${area} \\text{ m}^2\\text{. Find the pressure in N/m}^2\\text{.}`,
                    answer: String(parseFloat(pressure.toFixed(2))),
                    options: makeNumericOptions(pressure, () => randFloat(20, 3000, 2), 2),
                    forceOption: 0,
                };
            }

            const pressure = randFloat(80, 1200, 1);
            const force = randFloat(100, 1800, 1);
            const area = force / pressure;
            return {
                latex: `\\text{Pressure is } ${pressure} \\text{ N/m}^2\\text{ and force is } ${force} \\text{ N. Find the area in m}^2\\text{.}`,
                answer: String(parseFloat(area.toFixed(3))),
                options: makeNumericOptions(area, () => randFloat(0.1, 20, 3), 3),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // Worded problems with random values
        if (difficulty === 3) {
            const cases = [
                () => {
                    const dist = randInt(90, 420);
                    const time = randFloat(1.5, 6, 1);
                    const speed = dist / time;
                    return {
                        latex: `\\text{A coach drives } ${dist} \\text{ km to a match in } ${time} \\text{ hours.}\\\\\\text{Find the average speed in km/h.}`,
                        answer: speed,
                        dp: 1,
                        gen: () => randFloat(20, 160, 1),
                    };
                },
                () => {
                    const density = randFloat(2.4, 11.3, 1);
                    const volume = randFloat(0.6, 6, 2);
                    const mass = density * volume;
                    return {
                        latex: `\\text{A metal block has density } ${density} \\text{ g/cm}^3\\text{ and volume } ${volume} \\text{ cm}^3\\text{.}\\\\\\text{Find the mass in g.}`,
                        answer: mass,
                        dp: 2,
                        gen: () => randFloat(1, 100, 2),
                    };
                },
                () => {
                    const force = randFloat(400, 2400, 1);
                    const area = randFloat(0.8, 4.8, 2);
                    const pressure = force / area;
                    return {
                        latex: `\\text{A hydraulic press applies } ${force} \\text{ N over } ${area} \\text{ m}^2\\text{.}\\\\\\text{Calculate the pressure in N/m}^2\\text{.}`,
                        answer: pressure,
                        dp: 2,
                        gen: () => randFloat(50, 5000, 2),
                    };
                },
                () => {
                    const speed = randInt(45, 110);
                    const distance = randInt(120, 560);
                    const time = distance / speed;
                    return {
                        latex: `\\text{A van travels at } ${speed} \\text{ km/h and covers } ${distance} \\text{ km.}\\\\\\text{How long does the journey take in hours?}`,
                        answer: time,
                        dp: 2,
                        gen: () => randFloat(1, 12, 2),
                    };
                },
            ] as const;

            const q = pick(cases)();
            return {
                latex: q.latex,
                answer: String(parseFloat(q.answer.toFixed(q.dp))),
                options: makeNumericOptions(q.answer, q.gen, q.dp),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3]),
    "data-collection-methods": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "mean-median-mode": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const pick = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

        const meanOf = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const medianOf = (arr: number[]) => {
            const s = [...arr].sort((a, b) => a - b);
            const n = s.length;
            if (n % 2 === 1) return s[(n - 1) / 2];
            return (s[n / 2 - 1] + s[n / 2]) / 2;
        };

        const modeOf = (arr: number[]) => {
            const freq = new Map<number, number>();
            for (const n of arr) freq.set(n, (freq.get(n) ?? 0) + 1);
            let best = arr[0];
            let bestCount = 0;
            for (const [k, v] of freq) {
                if (v > bestCount) {
                    best = k;
                    bestCount = v;
                }
            }
            return best;
        };

        const makeOptions = (correct: string, gen: () => string): string[] => {
            const set = new Set<string>([correct]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const w = gen();
                if (w !== correct) set.add(w);
            }
            return [...set].sort(() => Math.random() - 0.5);
        };

        // ---------------- LEVEL 1 ----------------
        // Meaning of mean / median / mode
        if (difficulty === 1) {
            const items = [
                {
                    key: "mean",
                    answer: "The total of all values divided by the number of values",
                    wrong: [
                        "The middle value when the data is ordered",
                        "The value that appears most often",
                        "The difference between highest and lowest values",
                    ],
                },
                {
                    key: "median",
                    answer: "The middle value when the data is ordered",
                    wrong: [
                        "The total of all values divided by the number of values",
                        "The value that appears most often",
                        "The difference between highest and lowest values",
                    ],
                },
                {
                    key: "mode",
                    answer: "The value that appears most often",
                    wrong: [
                        "The total of all values divided by the number of values",
                        "The middle value when the data is ordered",
                        "The difference between highest and lowest values",
                    ],
                },
            ] as const;

            const q = pick(items);
            return {
                latex: `\\text{Which statement best describes the } ${q.key}\\text{?}`,
                answer: q.answer,
                options: [q.answer, ...q.wrong].sort(() => Math.random() - 0.5),
                forceOption: 2,
            };
        }

        // ---------------- LEVEL 2 ----------------
        // Find mean / median / mode from a list
        if (difficulty === 2) {
            const kind = pick(["mean", "median", "mode"] as const);

            let data: number[] = [];
            if (kind === "mean") {
                const n = randInt(5, 8);
                data = Array.from({ length: n }, () => randInt(3, 30));
                const answerVal = meanOf(data);
                const answer = String(parseFloat(answerVal.toFixed(2)));
                return {
                    latex: `\\text{Find the mean of: } ${data.join(", ")}`,
                    answer,
                    options: makeOptions(answer, () => String(parseFloat((answerVal + randInt(-6, 6)).toFixed(2)))),
                    forceOption: 0,
                };
            }

            if (kind === "median") {
                const n = randInt(5, 8);
                data = Array.from({ length: n }, () => randInt(1, 40));
                const answerVal = medianOf(data);
                const answer = String(parseFloat(answerVal.toFixed(2)));
                return {
                    latex: `\\text{Find the median of: } ${data.join(", ")}`,
                    answer,
                    options: makeOptions(answer, () => String(parseFloat((Number(answer) + randInt(-6, 6)).toFixed(2)))),
                    forceOption: 0,
                };
            }

            const base = randInt(3, 12);
            const modeCount = randInt(3, 4);
            data = Array.from({ length: modeCount }, () => base);
            while (data.length < 7) {
                const n = randInt(1, 20);
                if (n !== base && !data.includes(n)) data.push(n);
            }
            data = data.sort(() => Math.random() - 0.5);
            const answer = String(modeOf(data));

            return {
                latex: `\\text{Find the mode of: } ${data.join(", ")}`,
                answer,
                options: makeOptions(answer, () => String(randInt(1, 20))),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 ----------------
        // Reverse: given mean / median / mode, find missing number
        if (difficulty === 3) {
            const kind = pick(["mean", "median", "mode"] as const);

            if (kind === "mean") {
                const n = randInt(5, 8);
                const known = Array.from({ length: n - 1 }, () => randInt(3, 25));
                const x = randInt(2, 30);
                const targetMean = meanOf([...known, x]);
                const answer = String(x);

                return {
                    latex: `\\text{The mean of the numbers } ${known.join(", ")}, x \\text{ is } ${parseFloat(targetMean.toFixed(2))}\\text{. Find } x\\text{.}`,
                    answer,
                    options: makeOptions(answer, () => String(x + randInt(-6, 6))),
                    forceOption: 0,
                };
            }

            if (kind === "median") {
                const a = randInt(2, 10);
                const xVal = a + randInt(2, 8);
                const c = xVal + randInt(1, 6);
                const d = c + randInt(1, 6);

                // For an even-sized ordered list of 4 values, median = average of 2nd and 3rd terms.
                const m = (xVal + c) / 2;
                const answer = String(xVal);

                return {
                    latex: `\\text{The median of the ordered list } ${a}, x, ${c}, ${d} \\text{ is } ${parseFloat(m.toFixed(2))}\\text{. Find } x\\text{.}`,
                    answer,
                    options: makeOptions(answer, () => String(xVal + randInt(-6, 6))),
                    forceOption: 0,
                };
            }

            const mode = randInt(4, 15);
            const other1 = mode + randInt(2, 6);
            const other2 = mode - randInt(2, 3);
            const answer = String(mode);

            return {
                latex: `\\text{The mode of the list } ${mode}, ${other1}, ${other2}, x, ${mode} \\text{ is } ${mode}\\text{. Find } x\\text{.}`,
                answer,
                options: makeOptions(answer, () => String(mode + randInt(-4, 4))),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3]),
    "range": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        if (difficulty === 1) {
            const len = randInt(6, 9);
            const numbers = Array.from({ length: len }, () => randInt(3, 50));

            const max = Math.max(...numbers);
            const min = Math.min(...numbers);
            const range = max - min;

            // Shuffle to ensure list is not presented in sorted order.
            const shuffled = [...numbers].sort(() => Math.random() - 0.5);

            const optionsSet = new Set<string>([String(range)]);
            while (optionsSet.size < 4) {
                const wrong = range + randInt(-10, 10);
                if (wrong >= 0) optionsSet.add(String(wrong));
            }

            return {
                latex: `\\text{Find the range of the numbers: } ${shuffled.join(", ")}`,
                answer: String(range),
                options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1]),
    "bar-charts": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

        const makeNumberOptions = (answer: number) => {
            const options = new Set<string>([String(answer)]);
            let tries = 0;
            while (options.size < 4 && tries++ < 250) {
                const wrong = answer + randInt(-12, 12);
                if (wrong >= 0 && wrong !== answer) options.add(String(wrong));
            }
            return shuffle(Array.from(options));
        };

        const buildBarChartSvg = (args: {
            labels: string[];
            values: number[];
            xAxisLabel: string;
            yAxisLabel: string;
        }) => {
            const { labels, values, xAxisLabel, yAxisLabel } = args;

            const width = 420;
            const height = 280;
            const left = 58;
            const right = 18;
            const top = 24;
            const bottom = 56;

            const chartW = width - left - right;
            const chartH = height - top - bottom;

            const maxValRaw = Math.max(...values);
            const yStep = maxValRaw <= 12 ? 2 : 5;
            const yMax = Math.ceil((maxValRaw + 1) / yStep) * yStep;

            const slotW = chartW / labels.length;
            const barW = slotW * 0.58;

            const bars = values
                .map((v, i) => {
                    const h = (v / yMax) * chartH;
                    const x = left + i * slotW + (slotW - barW) / 2;
                    const y = top + chartH - h;
                    const labelX = left + i * slotW + slotW / 2;
                    const valueY = y - 5;

                    return `
                        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="#6aaed6" stroke="#245b7a" stroke-width="1.2"/>
                        <text x="${labelX.toFixed(1)}" y="${(top + chartH + 18).toFixed(1)}" text-anchor="middle" font-size="13">${labels[i]}</text>
                        <text x="${labelX.toFixed(1)}" y="${valueY.toFixed(1)}" text-anchor="middle" font-size="11" fill="#245b7a">${v}</text>
                    `;
                })
                .join("");

            const yTicks: string[] = [];
            for (let t = 0; t <= yMax; t += yStep) {
                const y = top + chartH - (t / yMax) * chartH;
                yTicks.push(`
                    <line x1="${left - 5}" y1="${y.toFixed(1)}" x2="${left}" y2="${y.toFixed(1)}" stroke="black" stroke-width="1"/>
                    <line x1="${left}" y1="${y.toFixed(1)}" x2="${(left + chartW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e3eef5" stroke-width="1"/>
                    <text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11">${t}</text>
                `);
            }

            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

                    ${yTicks.join("")}

                    <line x1="${left}" y1="${top}" x2="${left}" y2="${top + chartH}" stroke="black" stroke-width="2"/>
                    <line x1="${left}" y1="${top + chartH}" x2="${left + chartW}" y2="${top + chartH}" stroke="black" stroke-width="2"/>

                    ${bars}

                    <text x="${left + chartW / 2}" y="${height - 12}" text-anchor="middle" font-size="13" font-weight="bold">${xAxisLabel}</text>
                    <text x="18" y="${top + chartH / 2}" text-anchor="middle" font-size="13" font-weight="bold" transform="rotate(-90 18 ${top + chartH / 2})">${yAxisLabel}</text>
                </svg>
            `;
        };

        const contexts = [
            {
                title: "favourite fruit",
                xAxisLabel: "Fruit",
                yAxisLabel: "Number of Students",
                labels: ["Apple", "Banana", "Orange", "Grapes", "Pear"],
            },
            {
                title: "books read",
                xAxisLabel: "Student",
                yAxisLabel: "Books Read",
                labels: ["A", "B", "C", "D", "E"],
            },
            {
                title: "pets owned",
                xAxisLabel: "Type of Pet",
                yAxisLabel: "Frequency",
                labels: ["Dog", "Cat", "Fish", "Bird", "Rabbit"],
            },
        ] as const;

        if (difficulty === 1) {
            const context = contexts[randInt(0, contexts.length - 1)];
            const values = context.labels.map(() => randInt(2, 18));
            const idx = randInt(0, context.labels.length - 1);

            return {
                svg: buildBarChartSvg({
                    labels: [...context.labels],
                    values,
                    xAxisLabel: context.xAxisLabel,
                    yAxisLabel: context.yAxisLabel,
                }),
                latex: `\\text{The bar chart shows ${context.title}. What is the value for ${context.labels[idx]}?}`,
                answer: String(values[idx]),
                options: makeNumberOptions(values[idx]),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const context = contexts[randInt(0, contexts.length - 1)];
            const values = context.labels.map(() => randInt(2, 18));

            const countToSum = randInt(2, 3);
            const chosenIdx = new Set<number>();
            while (chosenIdx.size < countToSum) {
                chosenIdx.add(randInt(0, context.labels.length - 1));
            }
            const idxList = Array.from(chosenIdx);
            const total = idxList.reduce((acc, i) => acc + values[i], 0);

            const names = idxList.map(i => context.labels[i]);
            const labelText = names.length === 2
                ? `${names[0]} and ${names[1]}`
                : `${names[0]}, ${names[1]} and ${names[2]}`;

            return {
                svg: buildBarChartSvg({
                    labels: [...context.labels],
                    values,
                    xAxisLabel: context.xAxisLabel,
                    yAxisLabel: context.yAxisLabel,
                }),
                latex: `\\text{The bar chart shows ${context.title}. Find the total for ${labelText}.}`,
                answer: String(total),
                options: makeNumberOptions(total),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "histograms": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

        const makeNumberOptions = (answer: number) => {
            const set = new Set<string>([String(answer)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const wrong = answer + randInt(-25, 25);
                if (wrong >= 0 && wrong !== answer) set.add(String(wrong));
            }
            return shuffle(Array.from(set));
        };

        const buildHistogramSvg = (args: {
            edges: number[];
            densities: number[];
            xAxisLabel: string;
            yAxisLabel: string;
        }) => {
            const { edges, densities, xAxisLabel, yAxisLabel } = args;

            const width = 440;
            const height = 290;
            const left = 60;
            const right = 24;
            const top = 24;
            const bottom = 58;

            const chartW = width - left - right;
            const chartH = height - top - bottom;

            const minX = edges[0];
            const maxX = edges[edges.length - 1];
            const xSpan = maxX - minX;

            const maxDensityRaw = Math.max(...densities);
            const yStep = maxDensityRaw <= 8 ? 1 : 2;
            const yMax = Math.ceil((maxDensityRaw + 1) / yStep) * yStep;

            const xToPx = (x: number) => left + ((x - minX) / xSpan) * chartW;
            const yToPx = (y: number) => top + chartH - (y / yMax) * chartH;

            const yTicks: string[] = [];
            for (let t = 0; t <= yMax; t += yStep) {
                const y = yToPx(t);
                yTicks.push(`
                    <line x1="${left - 5}" y1="${y.toFixed(1)}" x2="${left}" y2="${y.toFixed(1)}" stroke="black" stroke-width="1"/>
                    <line x1="${left}" y1="${y.toFixed(1)}" x2="${(left + chartW).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6edf2" stroke-width="1"/>
                    <text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11">${t}</text>
                `);
            }

            const xTicks = edges
                .map((e) => {
                    const x = xToPx(e);
                    return `
                        <line x1="${x.toFixed(1)}" y1="${top + chartH}" x2="${x.toFixed(1)}" y2="${top + chartH + 5}" stroke="black" stroke-width="1"/>
                        <text x="${x.toFixed(1)}" y="${top + chartH + 20}" text-anchor="middle" font-size="11">${e}</text>
                    `;
                })
                .join("");

            const bars = densities
                .map((density, i) => {
                    const x1 = xToPx(edges[i]);
                    const x2 = xToPx(edges[i + 1]);
                    const y = yToPx(density);
                    const w = x2 - x1;
                    const h = yToPx(0) - y;
                    return `<rect x="${x1.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#7bb6d9" stroke="#1f4c7a" stroke-width="1.2"/>`;
                })
                .join("");

            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                    ${yTicks.join("")}
                    ${bars}
                    <line x1="${left}" y1="${top}" x2="${left}" y2="${top + chartH}" stroke="black" stroke-width="2"/>
                    <line x1="${left}" y1="${top + chartH}" x2="${left + chartW}" y2="${top + chartH}" stroke="black" stroke-width="2"/>
                    ${xTicks}
                    <text x="${left + chartW / 2}" y="${height - 13}" text-anchor="middle" font-size="13" font-weight="bold">${xAxisLabel}</text>
                    <text x="18" y="${top + chartH / 2}" text-anchor="middle" font-size="13" font-weight="bold" transform="rotate(-90 18 ${top + chartH / 2})">${yAxisLabel}</text>
                </svg>
            `;
        };

        const edges = [0, 10, 20, 35, 50];
        const widths = [10, 10, 15, 15];
        const densities = widths.map(() => randInt(2, 9));
        const frequencies = densities.map((d, i) => d * widths[i]);

        if (difficulty === 1) {
            const idx = randInt(0, widths.length - 1);
            const answer = frequencies[idx];

            return {
                svg: buildHistogramSvg({
                    edges,
                    densities,
                    xAxisLabel: "Time (minutes)",
                    yAxisLabel: "Frequency Density",
                }),
                latex: `\\text{The histogram shows journey times. Find the frequency in the class ${edges[idx]}-${edges[idx + 1]}.}`,
                answer: String(answer),
                options: makeNumberOptions(answer),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const startIdx = randInt(0, widths.length - 2);
            const useThree = Math.random() < 0.5 && startIdx === 0;
            const classCount = useThree ? 3 : 2;
            const endIdx = startIdx + classCount - 1;

            let total = 0;
            for (let i = startIdx; i <= endIdx; i++) {
                total += frequencies[i];
            }

            return {
                svg: buildHistogramSvg({
                    edges,
                    densities,
                    xAxisLabel: "Time (minutes)",
                    yAxisLabel: "Frequency Density",
                }),
                latex: `\\text{Using the histogram, find the total frequency from ${edges[startIdx]} to ${edges[endIdx + 1]} minutes.}`,
                answer: String(total),
                options: makeNumberOptions(total),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "pie-charts": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

        const makeNumberOptions = (answer: number) => {
            const set = new Set<string>([String(answer)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const wrong = answer + randInt(-20, 20);
                if (wrong >= 0 && wrong !== answer) set.add(String(wrong));
            }
            return shuffle(Array.from(set));
        };

        const buildAngles = (): number[] => {
            const pool = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
            for (let tries = 0; tries < 300; tries++) {
                const a = pool[randInt(0, pool.length - 1)];
                const b = pool[randInt(0, pool.length - 1)];
                const c = pool[randInt(0, pool.length - 1)];
                const d = 360 - (a + b + c);
                if (d >= 30 && d <= 140 && d % 10 === 0) {
                    return [a, b, c, d];
                }
            }
            return [90, 80, 100, 90];
        };

        const buildPieSvg = (labels: string[], angles: number[]) => {
            const cx = 145;
            const cy = 130;
            const r = 90;
            const colors = ["#7bb6d9", "#f2b880", "#9bcf9b", "#c3a2d9", "#f2d479", "#9ed9d3"];

            let current = -90;
            const sectors: string[] = [];

            for (let i = 0; i < angles.length; i++) {
                const start = (current * Math.PI) / 180;
                const endDeg = current + angles[i];
                const end = (endDeg * Math.PI) / 180;

                const x1 = cx + r * Math.cos(start);
                const y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end);
                const y2 = cy + r * Math.sin(end);
                const largeArc = angles[i] > 180 ? 1 : 0;

                sectors.push(
                    `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${colors[i % colors.length]}" stroke="white" stroke-width="1.5"/>`
                );

                const midDeg = current + angles[i] / 2;
                const mid = (midDeg * Math.PI) / 180;
                const tx = cx + (r * 0.58) * Math.cos(mid);
                const ty = cy + (r * 0.58) * Math.sin(mid);
                sectors.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="bold" fill="#1b2a34">${angles[i]}°</text>`);

                current = endDeg;
            }

            const legend = labels
                .map((label, i) => {
                    const y = 46 + i * 24;
                    return `
                        <rect x="285" y="${y - 11}" width="12" height="12" fill="${colors[i % colors.length]}" stroke="#444" stroke-width="0.6"/>
                        <text x="304" y="${y}" font-size="12" dominant-baseline="middle">${label}</text>
                    `;
                })
                .join("");

            return `
                <svg width="430" height="270" viewBox="0 0 430 270" xmlns="http://www.w3.org/2000/svg">
                    ${sectors.join("")}
                    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#333" stroke-width="1.2"/>
                    ${legend}
                </svg>
            `;
        };

        const contexts = [
            { title: "favourite sports", labels: ["Football", "Tennis", "Swimming", "Rugby"] },
            { title: "travel to school", labels: ["Walk", "Bus", "Car", "Bike"] },
            { title: "favourite snacks", labels: ["Crisps", "Fruit", "Biscuits", "Nuts"] },
        ] as const;

        if (difficulty === 1) {
            const context = contexts[randInt(0, contexts.length - 1)];
            const angles = buildAngles();
            const total = [72, 108, 144][randInt(0, 2)];
            const idx = randInt(0, context.labels.length - 1);

            const answer = (angles[idx] * total) / 360;

            return {
                svg: buildPieSvg([...context.labels], angles),
                latex: `\\text{The pie chart shows ${context.title} for ${total} students. How many chose ${context.labels[idx]}?}`,
                answer: String(answer),
                options: makeNumberOptions(answer),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const context = contexts[randInt(0, contexts.length - 1)];
            const angles = buildAngles();

            const knownIdx = randInt(0, context.labels.length - 1);
            const scale = randInt(1, 4);
            const knownCount = angles[knownIdx] * scale;

            const targets = [0, 1, 2, 3].filter(i => i !== knownIdx);
            const firstTarget = targets[randInt(0, targets.length - 1)];
            const remaining = targets.filter(i => i !== firstTarget);
            const secondTarget = remaining[randInt(0, remaining.length - 1)];
            const answer = (angles[firstTarget] + angles[secondTarget]) * scale;

            return {
                svg: buildPieSvg([...context.labels], angles),
                latex: `\\text{The pie chart shows ${context.title}. If ${knownCount} people are in ${context.labels[knownIdx]}, how many are in ${context.labels[firstTarget]} and ${context.labels[secondTarget]} combined?}`,
                answer: String(answer),
                options: makeNumberOptions(answer),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2]),
    "basic-probability-rules": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const pick = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

        const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

        const frac = (n: number, d: number): string => {
            if (d === 0) return "0";
            const g = gcd(n, d);
            const sn = n / g;
            const sd = d / g;
            if (sd === 1) return String(sn);
            return `\\frac{${sn}}{${sd}}`;
        };

        const dec = (n: number, dp = 2): string => String(parseFloat(n.toFixed(dp)));

        const makeOptions = (correct: string, gen: () => string): string[] => {
            const set = new Set<string>([correct]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const w = gen();
                if (w !== correct) set.add(w);
            }
            return [...set].sort(() => Math.random() - 0.5);
        };

        // ---------------- LEVEL 1 (Easy) ----------------
        if (difficulty === 1) {
            const qType = randInt(0, 3);

            if (qType === 0) {
                const answer = frac(1, 2);
                return {
                    latex: `\\text{A fair coin is flipped. What is the probability of getting heads?}`,
                    answer,
                    options: [answer, frac(1, 3), frac(2, 3), frac(1, 4)].sort(() => Math.random() - 0.5),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                const red = randInt(3, 10);
                const blue = randInt(3, 10);
                const answer = frac(red, red + blue);
                return {
                    latex: `\\text{A bag contains } ${red} \\text{ red and } ${blue} \\text{ blue balls. One is picked at random. Find } P(\\text{red}).`,
                    answer,
                    options: makeOptions(answer, () => frac(randInt(1, red + blue), red + blue)),
                    forceOption: 0,
                };
            }

            if (qType === 2) {
                const rain = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
                const answer = dec(1 - rain, 1);
                return {
                    latex: `\\text{The probability it rains tomorrow is } ${rain}\\text{. Find the probability it does not rain.}`,
                    answer,
                    options: makeOptions(answer, () => dec(pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]), 1)),
                    forceOption: 0,
                };
            }

            const threshold = randInt(2, 5);
            const favourable = Math.max(0, 6 - threshold);
            const answer = frac(favourable, 6);
            return {
                latex: `\\text{A fair die is rolled. What is the probability of getting a number greater than } ${threshold}\\text{?}`,
                answer,
                options: makeOptions(answer, () => frac(randInt(0, 6), 6)),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 2 (Medium) ----------------
        if (difficulty === 2) {
            const qType = randInt(0, 3);

            if (qType === 0) {
                const g = randInt(2, 6);
                const y = randInt(2, 6);
                const b = randInt(3, 8);
                const answer = frac(y, g + y + b);
                return {
                    latex: `\\text{A bag has } ${g} \\text{ green, } ${y} \\text{ yellow, and } ${b} \\ \\text{ blue balls. Find the probability of picking a yellow ball.}`,
                    answer,
                    options: makeOptions(answer, () => frac(randInt(1, g + y + b), g + y + b)),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                const sections = randInt(3, 6);
                const letters = ["A", "B", "C", "D", "E", "F"].slice(0, sections);
                const target = pick(letters);
                const answer = frac(1, sections * sections);
                return {
                    latex: `\\text{A spinner has } ${sections} \\text{ equal sections: } ${letters.join(", ")}\\text{. It is spun twice. Find the probability of getting } ${target} \\text{ both times.}`,
                    answer,
                    options: makeOptions(answer, () => frac(1, randInt(4, 40))),
                    forceOption: 0,
                };
            }

            if (qType === 2) {
                const pass = pick([0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
                const answer = dec(1 - pass, 1);
                return {
                    latex: `\\text{The probability a student passes Maths is } ${pass}\\text{. Find the probability they fail.}`,
                    answer,
                    options: makeOptions(answer, () => dec(pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]), 1)),
                    forceOption: 0,
                };
            }

            const pA = pick([0.2, 0.3, 0.4, 0.5, 0.6]);
            const pB = pick([0.2, 0.3, 0.4, 0.5, 0.6]);
            const answer = dec(pA * pB, 2);
            return {
                latex: `\\text{Two independent events } A \\text{ and } B\\text{ have } P(A)=${pA}\\text{ and } P(B)=${pB}\\text{. Find } P(A \\cap B).`,
                answer,
                options: makeOptions(answer, () => dec(randInt(1, 60) / 100, 2)),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 3 (Hard) ----------------
        if (difficulty === 3) {
            const qType = randInt(0, 3);

            if (qType === 0) {
                const red = randInt(3, 7);
                const blue = randInt(2, 6);
                const total = red + blue;
                const answer = frac(red * (red - 1), total * (total - 1));
                return {
                    latex: `\\text{A bag contains } ${red} \\text{ red and } ${blue} \\ \\text{ blue balls. Two balls are picked without replacement. Find the probability both are red.}`,
                    answer,
                    options: makeOptions(answer, () => frac(randInt(1, total * total), total * total)),
                    forceOption: 0,
                };
            }

            if (qType === 1) {
                let pA = 0.6;
                let pB = 0.5;
                let pInt = 0.2;
                for (let i = 0; i < 100; i++) {
                    pA = pick([0.4, 0.5, 0.6, 0.7, 0.8]);
                    pB = pick([0.3, 0.4, 0.5, 0.6, 0.7]);
                    pInt = pick([0.1, 0.2, 0.3, 0.4]);
                    if (pInt <= Math.min(pA, pB) && pA + pB - pInt <= 1) break;
                }
                const answer = dec(pA + pB - pInt, 2);
                return {
                    latex: `\\text{Given } P(A)=${pA}, P(B)=${pB}, P(A \\cap B)=${pInt}\\text{, find } P(A \\cup B).`,
                    answer,
                    options: makeOptions(answer, () => dec(randInt(5, 95) / 100, 2)),
                    forceOption: 0,
                };
            }

            if (qType === 2) {
                const boys = pick([50, 55, 60, 65, 70, 75, 80]);
                const boysFootball = pick([15, 20, 25, 30, 35, 40, 45]);
                const joint = Math.min(boysFootball, boys);
                const answer = frac(joint, boys);
                return {
                    latex: `\\text{In a class, } ${boys}\\% \\text{ are boys and } ${joint}\\% \\ \\text{ are boys who play football. Find the probability that a randomly chosen boy plays football.}`,
                    answer,
                    options: makeOptions(answer, () => frac(randInt(1, boys), boys)),
                    forceOption: 0,
                };
            }

            const pairs = [
                { a: 1, b: 4 },
                { a: 1, b: 3 },
                { a: 2, b: 5 },
                { a: 3, b: 8 },
            ] as const;
            const p = pick(pairs);
            const step = p.b - p.a;
            const blueMultiplier = randInt(2, 6);
            const blue = step * blueMultiplier;
            const red = (p.a * blue) / step;
            const answer = String(red);
            return {
                latex: `\\text{A bag contains red and blue balls. The probability of picking red is } ${dec(p.a / p.b, 2)}\\text{. There are } ${blue} \\text{ blue balls. How many red balls are there?}`,
                answer,
                options: makeOptions(answer, () => String(red + randInt(-6, 6))),
                forceOption: 0,
            };
        }

        // ---------------- LEVEL 4 (Challenge) ----------------
        if (difficulty === 4) {
            const qType = randInt(0, 1);

            if (qType === 0) {
                const pH = pick([0.6, 0.7, 0.8, 0.9]);
                const answer = dec(Math.pow(pH, 3), 3);
                return {
                    latex: `\\text{A biased coin has } P(\\text{heads})=${pH}\\text{. It is flipped 3 times. Find the probability of all heads.}`,
                    answer,
                    options: makeOptions(answer, () => dec(randInt(1, 999) / 1000, 3)),
                    forceOption: 0,
                };
            }

            const red = randInt(3, 6);
            const blue = randInt(2, 5);
            const green = randInt(2, 5);
            const total = red + blue + green;
            const answer = frac(red * green, total * total);
            return {
                latex: `\\text{A bag contains } ${red} \\text{ red, } ${blue} \\text{ blue and } ${green} \\ \\text{ green balls. Two balls are picked with replacement. Find the probability the first is red and the second is green.}`,
                answer,
                options: makeOptions(answer, () => frac(randInt(1, total * total), total * total)),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "tree-diagrams": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

        const frac = (n: number, d: number): string => {
            if (d === 0) return "0";
            const g = gcd(n, d);
            const sn = n / g;
            const sd = d / g;
            if (sd === 1) return String(sn);
            return `\\frac{${sn}}{${sd}}`;
        };

        const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

        const makeFracOptions = (answer: string, maxDen = 20) => {
            const set = new Set<string>([answer]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const d = randInt(2, maxDen);
                const n = randInt(1, d - 1);
                const w = frac(n, d);
                if (w !== answer) set.add(w);
            }
            return shuffle(Array.from(set));
        };

        const makeNumberOptions = (answer: number) => {
            const set = new Set<string>([String(answer)]);
            let tries = 0;
            while (set.size < 4 && tries++ < 250) {
                const w = answer + randInt(-5, 5);
                if (w >= 0 && w !== answer) set.add(String(w));
            }
            return shuffle(Array.from(set));
        };

        const parseLatexFrac = (value: string): { n: string; d: string } | null => {
            const m = value.match(/^\\frac\{(-?\d+)\}\{(-?\d+)\}$/);
            if (!m) return null;
            return { n: m[1], d: m[2] };
        };

        const svgProbLabel = (
            x: number,
            y: number,
            value: string,
            fontSize: number,
            color = "#000000"
        ): string => {
            const fracParts = parseLatexFrac(value);
            if (!fracParts) {
                return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="${color}">${value}</text>`;
            }

            const barWidth = Math.max(16, Math.max(fracParts.n.length, fracParts.d.length) * (fontSize * 0.65));
            const numY = y - (fontSize * 0.3);
            const denY = y + (fontSize * 1.2);
            const barY = y + 1;

            return `
                <g fill="${color}" stroke="${color}">
                    <text x="${x}" y="${numY}" text-anchor="middle" font-size="${fontSize}">${fracParts.n}</text>
                    <line x1="${x - barWidth / 2}" y1="${barY}" x2="${x + barWidth / 2}" y2="${barY}" stroke-width="1.4"/>
                    <text x="${x}" y="${denY}" text-anchor="middle" font-size="${fontSize}">${fracParts.d}</text>
                </g>
            `;
        };

        const buildSingleStageTreeSvg = (args: {
            topLabel: string;
            bottomLabel: string;
            pTop: string;
            pBottom: string;
        }) => {
            const { topLabel, bottomLabel, pTop, pBottom } = args;
            return `
                <svg width="340" height="220" viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
                    <line x1="30" y1="110" x2="145" y2="65" stroke="black" stroke-width="2"/>
                    <line x1="30" y1="110" x2="145" y2="155" stroke="black" stroke-width="2"/>

                    <circle cx="30" cy="110" r="2.5" fill="black"/>

                    ${svgProbLabel(86, 60, pTop, 14)}
                    ${svgProbLabel(86, 155, pBottom, 14)}

                    <text x="155" y="68" font-size="14" fill="black">${topLabel}</text>
                    <text x="155" y="160" font-size="14" fill="black">${bottomLabel}</text>
                </svg>
            `;
        };

        const buildTwoStageTreeSvg = (args: {
            topLabel: string;
            bottomLabel: string;
            pTop: string;
            pBottom: string;
            topTopLabel: string;
            topBottomLabel: string;
            bottomTopLabel: string;
            bottomBottomLabel: string;
            pTopTop: string;
            pTopBottom: string;
            pBottomTop: string;
            pBottomBottom: string;
        }) => {
            const {
                topLabel,
                bottomLabel,
                pTop,
                pBottom,
                topTopLabel,
                topBottomLabel,
                bottomTopLabel,
                bottomBottomLabel,
                pTopTop,
                pTopBottom,
                pBottomTop,
                pBottomBottom,
            } = args;

            return `
                <svg width="420" height="230" viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg">
                    <line x1="30" y1="115" x2="135" y2="70" stroke="black" stroke-width="2"/>
                    <line x1="30" y1="115" x2="135" y2="160" stroke="black" stroke-width="2"/>

                    <line x1="135" y1="70" x2="275" y2="35" stroke="black" stroke-width="2"/>
                    <line x1="135" y1="70" x2="275" y2="95" stroke="black" stroke-width="2"/>
                    <line x1="135" y1="160" x2="275" y2="130" stroke="black" stroke-width="2"/>
                    <line x1="135" y1="160" x2="275" y2="195" stroke="black" stroke-width="2"/>

                    <circle cx="30" cy="115" r="2.5" fill="black"/>
                    <circle cx="135" cy="70" r="2" fill="black"/>
                    <circle cx="135" cy="160" r="2" fill="black"/>

                    ${svgProbLabel(78, 70, pTop, 13)}
                    ${svgProbLabel(78, 155, pBottom, 13)}

                    ${svgProbLabel(180, 40, pTopTop, 12)}
                    ${svgProbLabel(183, 95, pTopBottom, 12)}
                    ${svgProbLabel(180, 130, pBottomTop, 12)}
                    ${svgProbLabel(183, 192, pBottomBottom, 12)}

                    <text x="135" y="60" font-size="13">${topLabel}</text>
                    <text x="135" y="180" font-size="13">${bottomLabel}</text>

                    <text x="283" y="39" font-size="13">${topTopLabel}</text>
                    <text x="283" y="98" font-size="13">${topBottomLabel}</text>
                    <text x="283" y="134" font-size="13">${bottomTopLabel}</text>
                    <text x="283" y="199" font-size="13">${bottomBottomLabel}</text>
                </svg>
            `;
        };

        if (difficulty === 1) {
            const contexts = [
                { topLabel: "Rain", bottomLabel: "No Rain" },
                { topLabel: "Win", bottomLabel: "Lose" },
                { topLabel: "Bus", bottomLabel: "Walk" },
                { topLabel: "Red", bottomLabel: "Blue" },
            ] as const;

            const c = contexts[randInt(0, contexts.length - 1)];
            const den = randInt(3, 10);
            const num = randInt(1, den - 1);
            const pTop = frac(num, den);
            const pBottom = frac(den - num, den);
            const askTop = Math.random() < 0.5;
            const targetLabel = askTop ? c.topLabel : c.bottomLabel;
            const answer = askTop ? pTop : pBottom;
            const optionsSet = new Set<string>([pTop, pBottom]);
            while (optionsSet.size < 4) {
                const d = randInt(2, 12);
                const n = randInt(1, d - 1);
                optionsSet.add(frac(n, d));
            }

            return {
                svg: buildSingleStageTreeSvg({
                    topLabel: c.topLabel,
                    bottomLabel: c.bottomLabel,
                    pTop,
                    pBottom,
                }),
                latex: `\\text{Using the tree diagram, find the probability of ${targetLabel.toLowerCase()}.}`,
                answer,
                options: shuffle(Array.from(optionsSet)),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const d1 = randInt(2, 6);
            const n1 = randInt(1, d1 - 1);
            const d2 = randInt(2, 6);
            const n2 = randInt(1, d2 - 1);

            const pA = frac(n1, d1);
            const pNotA = frac(d1 - n1, d1);
            const pB = frac(n2, d2);
            const pNotB = frac(d2 - n2, d2);

            const answer = frac(n1 * n2, d1 * d2);

            return {
                svg: buildTwoStageTreeSvg({
                    topLabel: "A",
                    bottomLabel: "A'",
                    pTop: pA,
                    pBottom: pNotA,
                    topTopLabel: "B",
                    topBottomLabel: "B'",
                    bottomTopLabel: "B",
                    bottomBottomLabel: "B'",
                    pTopTop: pB,
                    pTopBottom: pNotB,
                    pBottomTop: pB,
                    pBottomBottom: pNotB,
                }),
                latex: `\\text{The events are independent. Using the tree, find } P(A \\cap B)\text{.}`,
                answer,
                options: makeFracOptions(answer, 24),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const red = randInt(3, 7);
            const blue = randInt(3, 7);
            const total = red + blue;

            const pR1 = frac(red, total);
            const pB1 = frac(blue, total);
            const pR2GivenR = frac(red - 1, total - 1);
            const pB2GivenR = frac(blue, total - 1);
            const pR2GivenB = frac(red, total - 1);
            const pB2GivenB = frac(blue - 1, total - 1);

            const sameNumer = red * (red - 1) + blue * (blue - 1);
            const sameDenom = total * (total - 1);
            const answer = frac(sameNumer, sameDenom);

            return {
                svg: buildTwoStageTreeSvg({
                    topLabel: "R",
                    bottomLabel: "B",
                    pTop: pR1,
                    pBottom: pB1,
                    topTopLabel: "R",
                    topBottomLabel: "B",
                    bottomTopLabel: "R",
                    bottomBottomLabel: "B",
                    pTopTop: pR2GivenR,
                    pTopBottom: pB2GivenR,
                    pBottomTop: pR2GivenB,
                    pBottomBottom: pB2GivenB,
                }),
                latex: `\\text{A bag has } ${red} \\text{ red and } ${blue} \\text{ blue counters. Two are chosen without replacement.}\\\\\\text{Using the tree, find the probability of getting two counters of the same colour.}`,
                answer,
                options: makeFracOptions(answer, 42),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const den = randInt(4, 10);
            const num = randInt(1, den - 1);

            const qPairs = [
                { n: 1, d: 2 },
                { n: 1, d: 3 },
                { n: 2, d: 3 },
                { n: 1, d: 4 },
                { n: 3, d: 4 },
                { n: 2, d: 5 },
                { n: 3, d: 5 },
            ] as const;
            const q = qPairs[randInt(0, qPairs.length - 1)];

            const pA = frac(num, den);
            const pNotA = frac(den - num, den);
            const pGivenA = frac(q.n, q.d);
            const pNotGivenA = frac(q.d - q.n, q.d);

            const otherDen = randInt(3, 7);
            const otherNum = randInt(1, otherDen - 1);
            const pGivenNotA = frac(otherNum, otherDen);
            const pNotGivenNotA = frac(otherDen - otherNum, otherDen);

            const unknownCases = [
                {
                    key: "pTopTop" as const,
                    pathLatex: "P(A \\cap B)",
                    pathProb: frac(num * q.n, den * q.d),
                    answer: pGivenA,
                },
                {
                    key: "pTopBottom" as const,
                    pathLatex: "P(A \\cap B')",
                    pathProb: frac(num * (q.d - q.n), den * q.d),
                    answer: pNotGivenA,
                },
                {
                    key: "pBottomTop" as const,
                    pathLatex: "P(A' \\cap B)",
                    pathProb: frac((den - num) * otherNum, den * otherDen),
                    answer: pGivenNotA,
                },
                {
                    key: "pBottomBottom" as const,
                    pathLatex: "P(A' \\cap B')",
                    pathProb: frac((den - num) * (otherDen - otherNum), den * otherDen),
                    answer: pNotGivenNotA,
                },
            ];

            const chosenUnknown = unknownCases[randInt(0, unknownCases.length - 1)];

            const secondStage = {
                pTopTop: pGivenA,
                pTopBottom: pNotGivenA,
                pBottomTop: pGivenNotA,
                pBottomBottom: pNotGivenNotA,
            };

            secondStage[chosenUnknown.key] = "?";

            return {
                svg: buildTwoStageTreeSvg({
                    topLabel: "A",
                    bottomLabel: "A'",
                    pTop: pA,
                    pBottom: pNotA,
                    topTopLabel: "B",
                    topBottomLabel: "B'",
                    bottomTopLabel: "B",
                    bottomBottomLabel: "B'",
                    pTopTop: secondStage.pTopTop,
                    pTopBottom: secondStage.pTopBottom,
                    pBottomTop: secondStage.pBottomTop,
                    pBottomBottom: secondStage.pBottomBottom,
                }),
                latex: `\\text{In a survey, event } A \\text{ is "owns a pet" and } B \\text{ is "owns a bicycle". }\\\\\\text{Given } ${chosenUnknown.pathLatex}=${chosenUnknown.pathProb} \\text{, find the missing probability on the tree.}`,
                answer: chosenUnknown.answer,
                options: makeFracOptions(chosenUnknown.answer, 20),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "venn-diagrams": createGenerator(({ difficulty }) => {
        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

        const makeNumberOptions = (answer: number) => {
            const options = new Set<string>([String(answer)]);
            let tries = 0;

            while (options.size < 4 && tries++ < 250) {
                const wrong = answer + randInt(-8, 8);
                if (wrong >= 0 && wrong !== answer) {
                    options.add(String(wrong));
                }
            }

            return shuffle(Array.from(options));
        };

        type ShadedPart =
            | "none"
            | "aOnly"
            | "intersection"
            | "bOnly"
            | "aUnionB"
            | "a"
            | "b";

        const buildVennSvg = (args?: {
            aOnly?: string;
            intersection?: string;
            bOnly?: string;
            outside?: string;
            labels?: { aOnly?: string; intersection?: string; bOnly?: string; outside?: string };
            shaded?: ShadedPart;
        }) => {
            const aOnly = args?.aOnly ?? "";
            const intersection = args?.intersection ?? "";
            const bOnly = args?.bOnly ?? "";
            const outside = args?.outside ?? "";
            const labels = args?.labels;
            const shaded = args?.shaded ?? "none";

            let shading = "";
            if (shaded === "a") {
                shading = `<circle cx="130" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />`;
            } else if (shaded === "b") {
                shading = `<circle cx="190" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />`;
            } else if (shaded === "aUnionB") {
                shading = `
                    <circle cx="130" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />
                    <circle cx="190" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />
                `;
            } else if (shaded === "intersection") {
                shading = `<circle cx="190" cy="110" r="60" fill="#9fd4ff" opacity="0.7" clip-path="url(#clipLeft)" />`;
            } else if (shaded === "aOnly") {
                shading = `
                    <circle cx="130" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />
                    <circle cx="190" cy="110" r="60" fill="white" clip-path="url(#clipLeft)" />
                `;
            } else if (shaded === "bOnly") {
                shading = `
                    <circle cx="190" cy="110" r="60" fill="#9fd4ff" opacity="0.7" />
                    <circle cx="130" cy="110" r="60" fill="white" clip-path="url(#clipRight)" />
                `;
            }

            return `
                <svg width="340" height="230" viewBox="0 0 340 230" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <clipPath id="clipLeft">
                            <circle cx="130" cy="110" r="60"/>
                        </clipPath>
                        <clipPath id="clipRight">
                            <circle cx="190" cy="110" r="60"/>
                        </clipPath>
                    </defs>
                    <rect x="20" y="15" width="300" height="190" fill="white" stroke="black" stroke-width="2"/>
                    ${shading}
                    <circle cx="130" cy="110" r="60" fill="none" stroke="black" stroke-width="2"/>
                    <circle cx="190" cy="110" r="60" fill="none" stroke="black" stroke-width="2"/>

                    <text x="95" y="48" font-size="16" font-weight="bold">A</text>
                    <text x="223" y="48" font-size="16" font-weight="bold">B</text>
                    <text x="292" y="35" font-size="16" font-weight="bold">ξ</text>

                    <text x="103" y="113" text-anchor="middle" dominant-baseline="middle" font-size="16">${aOnly}</text>
                    <text x="160" y="113" text-anchor="middle" dominant-baseline="middle" font-size="16">${intersection}</text>
                    <text x="217" y="113" text-anchor="middle" dominant-baseline="middle" font-size="16">${bOnly}</text>
                    <text x="278" y="175" text-anchor="middle" dominant-baseline="middle" font-size="16">${outside}</text>

                    ${labels?.aOnly ? `<text x="103" y="110" text-anchor="middle" font-size="14" fill="#1f4c7a">${labels.aOnly}</text>` : ""}
                    ${labels?.intersection ? `<text x="160" y="110" text-anchor="middle" font-size="14" fill="#1f4c7a">${labels.intersection}</text>` : ""}
                    ${labels?.bOnly ? `<text x="217" y="110" text-anchor="middle" font-size="14" fill="#1f4c7a">${labels.bOnly}</text>` : ""}
                    ${labels?.outside ? `<text x="278" y="180" text-anchor="middle" font-size="14" fill="#1f4c7a">${labels.outside}</text>` : ""}
                </svg>
            `;
        };

        if (difficulty === 1) {
            const notationBank = [
                {
                    latexExpr: "A'",
                    answer: "Not in A",
                    distractors: ["In both A and B", "In A or B (or both)", "The universal set"],
                },
                {
                    latexExpr: "A \\cap B",
                    answer: "In both A and B",
                    distractors: ["Not in A", "In A or B (or both)", "Only in A"],
                },
                {
                    latexExpr: "A \\cup B",
                    answer: "In A or B (or both)",
                    distractors: ["In both A and B", "Not in A", "Only outside both sets"],
                },
                {
                    latexExpr: "A \\setminus B",
                    answer: "Only in A",
                    distractors: ["In both A and B", "Only in B", "Not in A"],
                },
                {
                    latexExpr: "\\xi",
                    answer: "The universal set",
                    distractors: ["The empty set", "In both A and B", "Only in A"],
                },
            ] as const;

            const chosen = notationBank[randInt(0, notationBank.length - 1)];

            return {
                svg: buildVennSvg(),
                latex: `\\text{What does } ${chosen.latexExpr} \\text{ mean in a Venn diagram?}`,
                answer: chosen.answer,
                options: shuffle([chosen.answer, ...chosen.distractors]),
                forceOption: 2,
            };
        }

        if (difficulty === 2) {
            const regionLabels = {
                aOnly: "p",
                intersection: "q",
                bOnly: "r",
                outside: "s",
            };

            const askBank = [
                { latexExpr: "A \\cap B", answer: regionLabels.intersection },
                { latexExpr: "A \\setminus B", answer: regionLabels.aOnly },
                { latexExpr: "B \\setminus A", answer: regionLabels.bOnly },
                { latexExpr: "(A \\cup B)'", answer: regionLabels.outside },
            ] as const;

            const chosen = askBank[randInt(0, askBank.length - 1)];

            return {
                svg: buildVennSvg({ labels: regionLabels }),
                latex: `\\text{Write down the labelled section for } ${chosen.latexExpr}\\text{.}`,
                answer: chosen.answer,
                options: shuffle([regionLabels.aOnly, regionLabels.intersection, regionLabels.bOnly, regionLabels.outside]),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const shadingBank = [
                { shaded: "intersection" as ShadedPart, answer: "A \\cap B" },
                { shaded: "aUnionB" as ShadedPart, answer: "A \\cup B" },
                { shaded: "aOnly" as ShadedPart, answer: "A \\setminus B" },
                { shaded: "bOnly" as ShadedPart, answer: "B \\setminus A" },
                { shaded: "a" as ShadedPart, answer: "A" },
                { shaded: "b" as ShadedPart, answer: "B" },
            ];

            const chosen = shadingBank[randInt(0, shadingBank.length - 1)];

            const optionsSet = new Set<string>([chosen.answer]);
            while (optionsSet.size < 4) {
                const candidate = shadingBank[randInt(0, shadingBank.length - 1)].answer;
                optionsSet.add(candidate);
            }

            return {
                svg: buildVennSvg({ shaded: chosen.shaded }),
                latex: `\\text{The shaded region is shown. Which section is it?}`,
                answer: chosen.answer,
                options: shuffle(Array.from(optionsSet)),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const contexts = [
                { aName: "play football", bName: "play basketball", group: "students" },
                { aName: "study French", bName: "study Spanish", group: "students" },
                { aName: "like tea", bName: "like coffee", group: "people" },
                { aName: "take the bus", bName: "cycle to school", group: "students" },
            ] as const;

            const context = contexts[randInt(0, contexts.length - 1)];

            const aOnly = randInt(4, 15);
            const intersection = randInt(2, 10);
            const bOnly = randInt(4, 15);
            const outside = randInt(2, 10);
            const total = aOnly + intersection + bOnly + outside;

            const regionKeys = ["aOnly", "intersection", "bOnly", "outside"] as const;
            const missingKey = regionKeys[randInt(0, regionKeys.length - 1)];

            const values = {
                aOnly: String(aOnly),
                intersection: String(intersection),
                bOnly: String(bOnly),
                outside: String(outside),
            };

            const answer = values[missingKey];
            values[missingKey] = "?";

            const regionText = {
                aOnly: `only ${context.aName}`,
                intersection: `both ${context.aName} and ${context.bName}`,
                bOnly: `only ${context.bName}`,
                outside: `neither ${context.aName} nor ${context.bName}`,
            };

            return {
                svg: buildVennSvg(values),
                latex: `\\text{In a group of } ${total} \\text{ ${context.group}, set } A \\text{ means ${context.aName} and set } B \\text{ means ${context.bName}. }\\\\\\text{Find the missing value for those who are ${regionText[missingKey]}.}`,
                answer,
                options: makeNumberOptions(Number(answer)),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
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
};


