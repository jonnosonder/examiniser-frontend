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
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "simplifying-expressions": createGenerator(({ difficulty }) => {
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
            options,
            forceOption: 0,
        };

    }, [1, 2, 3, 4, 5]),
    "substitution": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "linear-equations": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "simultaneous-equations": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "quadratic-equations": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "inequalities": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "arithmetic-sequences": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "geometric-sequences": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "functions-basic-understanding": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "linear-graphs": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "quadratic-graphs": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "angles-rules-parallel-lines": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "properties-of-polygons": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "congruence-and-similarity": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "translation": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "rotation": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "reflection": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "enlargement": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "pythagoras-theorem": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "sine-cosine-tangent": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "right-angled-triangles": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "circumference-and-area": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "arcs-and-sectors": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "area-and-perimeter": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "prisms": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "cylinders": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "spheres": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "unit-conversions": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "compound-measures": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "data-collection-methods": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "mean-median-mode": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "range": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "bar-charts": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "histograms": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "pie-charts": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "basic-probability-rules": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "tree-diagrams": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "venn-diagrams": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "multi-step-problems": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "mathematical-proofs": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "logical-deduction": createGenerator(({ difficulty }) => {
        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
};

