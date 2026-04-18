// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels } from './questionGeneratorCommon';


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

            latex = `\\text{What are the factors of }${n}\\text{?} \\\\ \\text{List them in accending order, separated by commas.}`;
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

            latex = `\\text{Which numbers are multiples of } ${x}\\text{? } \\\\\\  ${numbers.join(", ")}  \\\\ \\text{List them in accending order, separated by commas.}`;

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

            latex = `\\text{List all prime numbers between } ${start} \\text{ and } ${end} \\\\ \\text{List them in accending order, separated by commas.}`;

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

            latex = `\\text{Find the prime factors of } ${a} \\\\ \\text{List them in accending order, separated by commas.}`;

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
                answers = [`${sn}`, `\\frac{${resultNumer}}{${denom}}`];
            } else if (g > 1) {
                answers = [`\\frac{${sn}}{${sd}}`, `\\frac{${resultNumer}}{${denom}}`];
            } else {
                answers = [`\\frac{${sn}}{${sd}}`];
            }

            if (resultNumer === denom) {
                answers = [`\\frac{${resultNumer}}{${denom}}`, "1"];
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
                ? [`${sn}`, `\\frac{${sum}}{${lcm}}`]
                : [`\\frac{${sn}}{${sd}}`, `\\frac{${sum}}{${lcm}}`];

            const optionsSet = new Set<string>(answers);

            while (optionsSet.size < 4) {
                const n = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 10) + 2;
                optionsSet.add(`\\frac{${n}}{${d}}`);
            }

            return {
                latex: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = ?`,
                answer: answers,
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

            const reduced = (percent / 100) * original;

            const options = [
                `${original}`,
                `${original + 20}`,
                `${original - 20}`,
                `${original * 2}`
            ].sort(() => Math.random() - 0.5);

            return {
                latex: `\\text{${reduced} is ${percent}\\% of what number?}`,
                answer: `${original}`,
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
                latex: `\\text{The ratio of red to blue balls is } ${redRatio}:${blueRatio}.\\\\\\text{If there are } ${red} \\text{ red balls, how many blue balls are there?}`,
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
                const cost = Math.floor(Math.random() * 200) + 50;
                const profitPercent = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
                const sell = cost * (1 + profitPercent / 100);

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
                const sell = Math.round(cost * (1 + markup / 100));

                latex = `\\text{A shop buys an item for £${cost} and sells it at a } ${markup}\\% \\text{ markup. Find the selling price.}`;

                answer = `£${sell}`;

                optionsSet.add(answer);
                optionsSet.add(`£${sell + 10}`);
                optionsSet.add(`£${Math.max(1, sell - 10)}`);
                optionsSet.add(`£${sell + 20}`);
            }

            else {
                // loss → original price
                const original = Math.floor(Math.random() * 400) + 200;
                const loss = [10, 20, 25, 30][Math.floor(Math.random() * 4)];
                const sell = Math.round(original * (1 - loss / 100));

                latex = `\\text{An item is sold for £${sell} at a } ${loss}\\% \\text{ loss. Find the original price.}`;

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

                latex = `\\text{A cost is $${dollars}. If £1 = $${rate.toFixed(2)}, find the cost in pounds.}`;
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

                latex = `\\text{£${P} is invested at } ${r}\\% \\text{ per year for } ${t} \\text{ years. Find the total amount.}`;
                answer = `£${total}`;
            }

            else if (type === 1) {
                const P = Math.floor(Math.random() * 1000) + 200;
                const r = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
                const t = Math.floor(Math.random() * 4) + 1;

                const interest = P * r * t / 100;

                latex = `\\text{A loan of £${P} is taken at } ${r}\\% \\text{ simple interest for } ${t} \\text{ years. How much interest is paid?}`;
                answer = `£${interest}`;
            }

            else {
                const P = 1000;
                const r = [2, 4, 5][Math.floor(Math.random() * 3)];
                const interest = Math.floor(Math.random() * 400) + 100;

                const t = interest / (P * r / 100);

                latex = `\\text{How long will it take £${P} to earn £${interest} interest at } ${r}\\% \\text{ per year?}`;
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

                latex = `\\text{£${P} is invested at } ${r}\\% \\text{ compound interest for } ${t} \\text{ years. Find the final amount.}`;
                answer = `£${A}`;
            }

            else if (type === 1) {
                const P = Math.floor(Math.random() * 800) + 200;
                const r = [1, 2, 3][Math.floor(Math.random() * 3)];
                const t = Math.floor(Math.random() * 6) + 3;

                const A = Math.round(P * Math.pow(1 + r / 100, t));

                latex = `\\text{A savings account offers } ${r}\\% \\text{ compound interest annually.} \\\\\\text{How much will £${P} become after } ${t} \\text{ years?}`;
                answer = `£${A}`;
            }

            else {
                const P = Math.floor(Math.random() * 50000) + 10000;
                const r = [2, 3, 4][Math.floor(Math.random() * 3)];
                const t = Math.floor(Math.random() * 5) + 2;

                const A = Math.round(P * Math.pow(1 + r / 100, t));

                latex = `\\text{A population starts at } ${P}. \\text{ It grows by } ${r}\\% \\text{ per year. Find the population after } ${t} \\text{ years.}`;
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
                latex: `\\text{Solve, } \\\\ ${eq1} \\\\ ${eq2} \\\\ \\text{Give your answer in the form } x=?,\\ y=?`,
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
                latex: `\\text{Solve, } \\\\ ${eq1} \\\\ ${eq2} \\\\ \\text{Give your answer in the form } x=?,\\ y=?`,
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
            `\\text{A shop sells item A for £${p1} and item B for £${p2}.} \\\\
            \\text{Customer 1 buys ${a} of A and ${b} of B costing £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Customer 2 buys ${c} of A and ${d} of B costing £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 2. STATIONERY SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Pens cost £${p1} and pencils cost £${p2}.} \\\\
            \\text{A student buys ${a} pens and ${b} pencils costing £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Another student buys ${c} pens and ${d} pencils costing £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 3. SWEETS
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Chocolates cost £${p1}, sweets cost £${p2}.} \\\\
            \\text{Order 1: ${a} chocolates and ${b} sweets cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} chocolates and ${d} sweets cost £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 4. CAFE
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Coffee costs £${p1}, tea costs £${p2}.} \\\\
            \\text{Order 1: ${a} coffees and ${b} teas cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} coffees and ${d} teas cost £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 5. CINEMA SNACK BAR
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Popcorn costs £${p1}, drinks cost £${p2}.} \\\\
            \\text{Order 1: ${a} popcorn and ${b} drinks cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} popcorn and ${d} drinks cost £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 6. SPORTS SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Footballs cost £${p1}, basketballs cost £${p2}.} \\\\
            \\text{Order 1: ${a} footballs and ${b} basketballs cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} footballs and ${d} basketballs cost £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 7. BOOKSTORE
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Novels cost £${p1}, comics cost £${p2}.} \\\\
            \\text{Order 1: ${a} novels and ${b} comics cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} novels and ${d} comics cost £${p1 * (c * xVal + d * yVal)}.} \\\\
            \\text{Find } x \\text{ and } y.`,
                }),

                // -------------------------------------------------
                // 8. SCHOOL SHOP
                // -------------------------------------------------
                (p1: number, p2: number, a: number, b: number, c: number, d: number) => ({
                    latex:
            `\\text{Notebooks cost £${p1}, folders cost £${p2}.} \\\\
            \\text{Order 1: ${a} notebooks and ${b} folders cost £${p1 * (a * xVal + b * yVal)}.} \\\\
            \\text{Order 2: ${c} notebooks and ${d} folders cost £${p1 * (c * xVal + d * yVal)}.} \\\\
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
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),

    "properties-of-polygons": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "congruence-and-similarity": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "translation": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "rotation": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "reflection": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "enlargement": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "pythagoras-theorem": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "sine-cosine-tangent": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "right-angled-triangles": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "circumference-and-area": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "arcs-and-sectors": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "area-and-perimeter": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "prisms": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "cylinders": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "spheres": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "unit-conversions": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "compound-measures": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "data-collection-methods": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "mean-median-mode": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "range": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "bar-charts": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "histograms": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "pie-charts": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "basic-probability-rules": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "tree-diagrams": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "venn-diagrams": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "multi-step-problems": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "mathematical-proofs": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
    "logical-deduction": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, []),
};

