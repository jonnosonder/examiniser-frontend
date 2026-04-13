// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels } from './questionGeneratorCommon';

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
                forceOption: 0,
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
                forceOption: 0,
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
            let a = Math.floor(Math.random() * 12) + 1; // 1–12
            let b = Math.floor(Math.random() * 12) + 1; // 1–12

            const question = `${a} × ${b}`;
            const answer = a * b;

            return {
                latex: `\\text{Calculate: } ${question}`,
                answer: answer.toString(),
                forceOption: 0,
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
            let num: number = parseFloat((Math.random() * 21 - 10).toFixed(1));

            const rounded: number = Math.round(num);

            return {
                latex: `\\text{Round to the nearest whole number: } ${num}`,
                answer: rounded.toString(),
                forceOption: 0,
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
                forceOption: 0,
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
            forceOption: 0,
        };

    }, [1, 2, 3]),
    "fractions": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Identify a simple fraction from a visual description (numerator/denominator)
            const denominators = [2, 3, 4];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * denom) + 1; // 1 to denom

            let answers = [`${numer}/${denom}`];
            if (numer === denom) {
                if (numer === 4) {
                    answers.push(`2/2`);
                }
                answers.push(`1/1`);
                answers.push(`1`);                
            }


            return {
                latex: `\\text{A shape is split into } ${denom} \\text{ equal parts. } ${numer} \\text{ part(s) are shaded. What fraction is shaded?}`,
                answer: answers,
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
            let a = Math.floor(Math.random() * (denom - 1)) + 1;
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

        // difficulty === 4: Order fractions with different denominators (use 2, 4, 8 family or 3, 6)
        const families = [[2, 4, 8], [3, 6, 12], [2, 5, 10]];
        const family = families[Math.floor(Math.random() * families.length)];

        const fractions = family.map(denom => {
            const numer = Math.floor(Math.random() * (denom - 1)) + 1;
            return { numer, denom };
        });

        const isAscending = Math.random() < 0.5;
        const sorted = [...fractions].sort((a, b) =>
            isAscending
                ? a.numer / a.denom - b.numer / b.denom
                : b.numer / b.denom - a.numer / a.denom
        );

        const display = fractions.map(f => `\\frac{${f.numer}}{${f.denom}}`).join(", ");
        const answer = sorted.map(f => `${f.numer}/${f.denom}`).join(",");

        return {
            latex: `\\text{Sort in ${isAscending ? "ascending" : "descending"} order: } ${display}\\\\\\text{(answer as a/b,c/d,e/f)}`,
            answer,
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

            // Find a numerator that shares a common factor with denom
            const factors = [];
            for (let i = 2; i <= denom; i++) {
                if (denom % i === 0) factors.push(i);
            }
            const factor = factors[Math.floor(Math.random() * factors.length)];

            const maxNumer = denom / factor - 1;
            if (maxNumer < 1) {
                // fallback: just use 1/denom simplified
                return {
                    latex: `\\text{Simplify: } \\frac{${factor}}{${denom}}`,
                    answer: `1/${denom / factor}`,
                    forceOption: 0,
                };
            }

            const simplifiedNumer = Math.floor(Math.random() * maxNumer) + 1;
            const numer = simplifiedNumer * factor;
            const simplifiedDenom = denom / factor;

            return {
                latex: `\\text{Simplify: } \\frac{${numer}}{${denom}}`,
                answer: `${simplifiedNumer}/${simplifiedDenom}`,
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
        if (difficulty === 1) {
            // Add two fractions with the same denominator, no simplification needed
            const denominators = [2, 3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const a = Math.floor(Math.random() * (denom - 1)) + 1;
            let b = Math.floor(Math.random() * (denom - a)) + 1; // ensure sum <= denom
            if (b === 0) b = 1;

            const sumNumer = a + b;

            return {
                latex: `\\frac{${a}}{${denom}} + \\frac{${b}}{${denom}} = ?\\\\\\text{(answer as a/b or a whole number)}`,
                answer: sumNumer === denom ? "1" : `${sumNumer}/${denom}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Subtract two fractions with the same denominator
            const denominators = [3, 4, 5, 6, 8, 10];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];

            const a = Math.floor(Math.random() * (denom - 1)) + 2; // at least 2
            const b = Math.floor(Math.random() * (a - 1)) + 1;     // b < a

            const diffNumer = a - b;

            return {
                latex: `\\frac{${a}}{${denom}} - \\frac{${b}}{${denom}} = ?\\\\\\text{(answer as a/b)}`,
                answer: `${diffNumer}/${denom}`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // Add fractions with related denominators (one is a multiple of the other)
            const bases = [2, 3, 4, 5];
            const base = bases[Math.floor(Math.random() * bases.length)];
            const multiplier = Math.floor(Math.random() * 3) + 2; // 2–4
            const denom2 = base * multiplier;

            const numer1 = Math.floor(Math.random() * (base - 1)) + 1;
            const numer2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

            // Convert to common denominator
            const commonDenom = denom2;
            const equiv1 = numer1 * multiplier;
            const sumNumer = equiv1 + numer2;

            // Simplify answer
            function gcd(a: number, b: number): number {
                return b === 0 ? a : gcd(b, a % b);
            }
            const g = gcd(sumNumer, commonDenom);
            const ansNumer = sumNumer / g;
            const ansDenom = commonDenom / g;

            return {
                latex: `\\frac{${numer1}}{${base}} + \\frac{${numer2}}{${denom2}} = ?\\\\\\text{(answer as a/b or a whole number)}`,
                answer: ansDenom === 1 ? ansNumer.toString() : `${ansNumer}/${ansDenom}`,
                forceOption: 0,
            };
        }

        // difficulty === 4: Add or subtract fractions with unrelated denominators (small values)
        function gcd(a: number, b: number): number {
            return b === 0 ? a : gcd(b, a % b);
        }

        const denomPairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]];
        const [denom1, denom2] = denomPairs[Math.floor(Math.random() * denomPairs.length)];

        const numer1 = Math.floor(Math.random() * (denom1 - 1)) + 1;
        const numer2 = Math.floor(Math.random() * (denom2 - 1)) + 1;

        const isAddition = Math.random() < 0.5;

        const lcm = (denom1 * denom2) / gcd(denom1, denom2);
        const eq1 = numer1 * (lcm / denom1);
        const eq2 = numer2 * (lcm / denom2);

        let resultNumer = isAddition ? eq1 + eq2 : Math.abs(eq1 - eq2);
        const g = gcd(resultNumer, lcm);
        const ansNumer = resultNumer / g;
        const ansDenom = lcm / g;

        const op = isAddition ? "+" : "-";
        const [n1, d1, n2, d2] = isAddition || numer1 / denom1 >= numer2 / denom2
            ? [numer1, denom1, numer2, denom2]
            : [numer2, denom2, numer1, denom1];

        return {
            latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}} = ?\\\\\\text{(answer as a/b or a whole number)}`,
            answer: ansDenom === 1 ? ansNumer.toString() : `${ansNumer}/${ansDenom}`,
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
        // Common fraction–decimal pairs used across difficulties
        const pairs: { numer: number; denom: number; decimal: string }[] = [
            { numer: 1, denom: 2,  decimal: "0.5"   },
            { numer: 1, denom: 4,  decimal: "0.25"  },
            { numer: 3, denom: 4,  decimal: "0.75"  },
            { numer: 1, denom: 5,  decimal: "0.2"   },
            { numer: 2, denom: 5,  decimal: "0.4"   },
            { numer: 3, denom: 5,  decimal: "0.6"   },
            { numer: 4, denom: 5,  decimal: "0.8"   },
            { numer: 1, denom: 10, decimal: "0.1"   },
            { numer: 3, denom: 10, decimal: "0.3"   },
            { numer: 7, denom: 10, decimal: "0.7"   },
            { numer: 9, denom: 10, decimal: "0.9"   },
        ];

        if (difficulty === 1) {
            // Convert a simple fraction (halves, quarters, tenths) to a decimal
            const simplePairs = pairs.filter(p => [2, 4, 10].includes(p.denom));
            const pair = simplePairs[Math.floor(Math.random() * simplePairs.length)];

            return {
                latex: `\\text{Write } \\frac{${pair.numer}}{${pair.denom}} \\text{ as a decimal.}`,
                answer: pair.decimal,
                options: [],
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            // Convert a decimal to a fraction (fifths and tenths included)
            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            const toDecimal = Math.random() < 0.5;

            if (toDecimal) {
                return {
                    latex: `\\text{Write } \\frac{${pair.numer}}{${pair.denom}} \\text{ as a decimal.}`,
                    answer: pair.decimal,
                    forceOption: 0,
                };
            } else {
                return {
                    latex: `\\text{Write } ${pair.decimal} \\text{ as a fraction in its simplest form.}`,
                    answer: `${pair.numer}/${pair.denom}`,
                    forceOption: 0,
                };
            }
        }

        if (difficulty === 3) {
            // Place fractions and decimals in order
            // Pick 4 mixed values from the pairs list
            const shuffled = [...pairs].sort(() => Math.random() - 0.5).slice(0, 4);
            const isAscending = Math.random() < 0.5;

            const sorted = [...shuffled].sort((a, b) =>
                isAscending
                    ? parseFloat(a.decimal) - parseFloat(b.decimal)
                    : parseFloat(b.decimal) - parseFloat(a.decimal)
            );

            // Display half as fractions, half as decimals
            const display = shuffled.map((p, i) =>
                i % 2 === 0
                    ? `\\frac{${p.numer}}{${p.denom}}`
                    : p.decimal
            ).join(", ");

            const answer = sorted.map(p => p.decimal).join(",");

            return {
                latex: `\\text{Sort in ${isAscending ? "ascending" : "descending"} order: } ${display}\\\\\\text{(answer as decimals separated by commas)}`,
                answer,
                forceOption: 0,
            };
        }

        // difficulty === 4: Convert a fraction with denominator 100 (hundredths) to a decimal and back
        const numer = Math.floor(Math.random() * 99) + 1; // 1–99
        const decimal = (numer / 100).toFixed(2);
        const toDecimal = Math.random() < 0.5;

        if (toDecimal) {
            return {
                latex: `\\text{Write } \\frac{${numer}}{100} \\text{ as a decimal.}`,
                answer: decimal,
                forceOption: 0,
            };
        } else {
            return {
                latex: `\\text{Write } ${decimal} \\text{ as a fraction out of 100 (e.g. a/100).}`,
                answer: `${numer}/100`,
                forceOption: 0,
            };
        }

    }, [1, 2, 3, 4]),

    "basic-percentages": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            // Understand what a percentage means (out of 100)
            const percent = [10, 20, 25, 50, 75, 100][Math.floor(Math.random() * 6)];

            return {
                latex: `\\text{What is } ${percent}\\% \\text{ as a fraction out of 100? (e.g. a/100)}`,
                answer: `${percent}/100`,
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
            // Convert between percentages, fractions, and decimals
            const commonValues = [
                { percent: 10, fraction: "1/10", decimal: "0.1" },
                { percent: 20, fraction: "1/5",  decimal: "0.2" },
                { percent: 25, fraction: "1/4",  decimal: "0.25" },
                { percent: 50, fraction: "1/2",  decimal: "0.5" },
                { percent: 75, fraction: "3/4",  decimal: "0.75" },
            ];

            const val = commonValues[Math.floor(Math.random() * commonValues.length)];
            const type = Math.floor(Math.random() * 3); // 0=fraction→%, 1=decimal→%, 2=%→fraction

            if (type === 0) {
                return {
                    latex: `\\text{Write } ${val.fraction} \\text{ as a percentage.}`,
                    answer: `${val.percent}%`,
                    forceOption: 0,
                };
            } else if (type === 1) {
                return {
                    latex: `\\text{Write } ${val.decimal} \\text{ as a percentage.}`,
                    answer: `${val.percent}%`,
                    forceOption: 0,
                };
            } else {
                return {
                    latex: `\\text{Write } ${val.percent}\\% \\text{ as a fraction in its simplest form.}`,
                    answer: val.fraction,
                    forceOption: 0,
                };
            }
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

