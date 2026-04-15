// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels } from './questionGeneratorCommon';

const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(items: T[]): T => items[randInt(0, items.length - 1)];

const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

const lcm = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a * b) / gcd(a, b));
};

const simplifyFraction = (numer: number, denom: number): string => {
    const g = gcd(numer, denom);
    numer /= g;
    denom /= g;
    return denom === 1 ? `${numer}` : `${numer}/${denom}`;
};

const formatDecimal = (value: number, places = 2): string => {
    const text = value.toFixed(places);
    return text.includes('.') ? text.replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1') : text;
};

export const secondaryGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "integers": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = randInt(-10, 10);
            const b = randInt(-10, 10);
            const symbol = Math.random() < 0.5 ? '>' : '<';
            const answer = (symbol === '>' ? a > b : a < b).toString();
            return {
                latex: `\\text{True or False: } ${a} ${symbol} ${b}`,
                answer,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const value = randInt(-20, 20);
            return {
                latex: `\\text{What is } |${value}|?`,
                answer: Math.abs(value).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const a = randInt(-15, 15);
            const b = randInt(-15, 15);
            const op = Math.random() < 0.5 ? '+' : '-';
            const answer = op === '+' ? a + b : a - b;
            return {
                latex: `\\text{Calculate: } ${a} ${op} ${b}`,
                answer: answer.toString(),
                forceOption: 0,
            };
        }

        const numbers = Array.from({ length: 4 }, () => randInt(-20, 20));
        const sorted = [...numbers].sort((a, b) => a - b);
        return {
            latex: `\\text{Order these integers from least to greatest: } ${numbers.join(', ')}`,
            answer: sorted.join(','),
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "factors-multiples-primes": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const n = randInt(2, 20);
            const factor = randomChoice([2, 3, 4, 5, 6, 10]);
            const answer = (n % factor === 0).toString();
            return {
                latex: `\\text{True or False: } ${factor} \\text{ is a factor of } ${n}`,
                answer,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const n = randInt(10, 50);
            const isPrime = n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
            return {
                latex: `\\text{Is } ${n} \\text{ prime?}`,
                answer: isPrime.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const candidates = [12, 14, 15, 16, 18, 20, 21, 24, 27, 28];
            const num = randomChoice(candidates);
            const factors = Array.from({ length: num }, (_, i) => i + 1).filter((d) => num % d === 0);
            return {
                latex: `\\text{List the positive factors of } ${num} \\text{(answer separated by commas)}`,
                answer: factors.join(','),
                forceOption: 0,
            };
        }

        const multipleBase = randInt(2, 8);
        const target = multipleBase * randInt(2, 6);
        const answer = `\\text{Multiples of } ${multipleBase} \\text{ up to } ${target}: ${Array.from({ length: target / multipleBase }, (_, i) => (i + 1) * multipleBase).join(', ')}`;
        return {
            latex: `\\text{List the first ${target / multipleBase} multiples of } ${multipleBase}`,
            answer: answer,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "lcm-hcf": createGenerator(({ difficulty }) => {
        const a = randInt(2, 15);
        const b = randInt(2, 15);
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the highest common factor of } ${a} \\text{ and } ${b}`,
                answer: gcd(a, b).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the least common multiple of } ${a} \\text{ and } ${b}`,
                answer: lcm(a, b).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the HCF and LCM of } ${a} \\text{ and } ${b} \\text{(answer as HCF,LCM)}`,
                answer: `${gcd(a, b)},${lcm(a, b)}`,
                forceOption: 0,
            };
        }

        const x = randInt(2, 12);
        const y = randInt(2, 12);
        return {
            latex: `\\text{Two numbers have a product of } ${x * y} \\text{ and an HCF of } ${x}. \\text{ What is their LCM?}`,
            answer: ((x * y) / x).toString(),
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "powers-and-roots": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const base = randInt(2, 5);
            return {
                latex: `\\text{Calculate } ${base}^2`,
                answer: (base * base).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const base = randInt(2, 5);
            return {
                latex: `\\text{Calculate } \\sqrt{${base * base}}`,
                answer: base.toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const exponent = randInt(2, 4);
            const base = randInt(2, 4);
            return {
                latex: `\\text{Calculate } ${base}^{${exponent}}`,
                answer: Math.pow(base, exponent).toString(),
                forceOption: 0,
            };
        }

        const base = randInt(2, 4);
        const power = randInt(2, 3);
        const value = Math.pow(base, power);
        return {
            latex: `\\text{If } x^${power} = ${value}, \\text{ what is } x?`,
            answer: base.toString(),
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "standard-form": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const num = randInt(1, 9) * Math.pow(10, randInt(2, 4));
            const exponent = Math.log10(num);
            return {
                latex: `\\text{Write } ${num} \\text{ in standard form}`,
                answer: `${num / Math.pow(10, exponent)} \\times 10^{${exponent}}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const coeff = randInt(1, 9) + randInt(1, 9) / 10;
            const power = randInt(2, 4);
            return {
                latex: `\\text{Write } ${formatDecimal(coeff)} \\times 10^{${power}} \\text{ as an ordinary number}`,
                answer: Math.round(coeff * Math.pow(10, power)).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const coeff = randInt(1, 9) + randInt(1, 9) / 10;
            const exponent = randInt(3, 5);
            return {
                latex: `\\text{Calculate } ${formatDecimal(coeff)} \\times 10^{${exponent}}`,
                answer: Math.round(coeff * Math.pow(10, exponent)).toString(),
                forceOption: 0,
            };
        }

        const a = randInt(2, 9);
        const b = randInt(2, 9);
        return {
            latex: `\\text{Write } ${a * Math.pow(10, b)} \\text{ in standard form}`,
            answer: `${a} \\times 10^{${b}}`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "fractions-decimals-percentages": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const denom = randomChoice([2, 4, 5, 10]);
            const numer = denom === 10 ? randInt(1, 9) : randInt(1, denom - 1);
            const decimal = formatDecimal(numer / denom, denom === 10 ? 1 : 2);
            return {
                latex: `\\text{Write } \\frac{${numer}}{${denom}} \\text{ as a decimal}`,
                answer: decimal,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const percent = randomChoice([10, 20, 25, 50]);
            const total = 100;
            return {
                latex: `\\text{What is } ${percent}\\% \\text{ of } ${total}?`,
                answer: ((percent / 100) * total).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const denom = randomChoice([4, 5, 8, 10]);
            const numer = randInt(1, denom - 1);
            const answer = formatDecimal((numer / denom) * 100, 1);
            return {
                latex: `\\text{Convert } \\frac{${numer}}{${denom}} \\text{ to a percentage}`,
                answer: `${answer}\\%`,
                forceOption: 0,
            };
        }

        const a = randInt(1, 9);
        const b = randInt(1, 9);
        const denom = randomChoice([4, 5, 8, 10]);
        const answer = simplifyFraction(a + b, denom);
        return {
            latex: `\\text{Add } \\frac{${a}}{${denom}} + \\frac{${b}}{${denom}}`,
            answer,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "ratio-and-proportion": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = randInt(1, 6);
            const b = randInt(1, 6);
            return {
                latex: `\\text{Write the ratio } ${a}:${b} \\text{ in simplest form}`,
                answer: `${a / gcd(a, b)}:${b / gcd(a, b)}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const total = randInt(10, 30);
            const ratioA = randInt(1, 4);
            const ratioB = randInt(1, 4);
            const share = total / (ratioA + ratioB);
            return {
                latex: `\\text{Share } ${total} \\text{ in the ratio } ${ratioA}:${ratioB}. \\ \\text{How much does the first part get?}`,
                answer: (share * ratioA).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const scale = randInt(2, 5);
            const a = randInt(2, 8);
            return {
                latex: `\\text{If a model is } ${scale} \\text{ times smaller than the real object, and the model measures }\\\\ ${a} \\text{ cm, how long is the real object?}`,
                answer: (a * scale).toString(),
                forceOption: 0,
            };
        }

        const value = randInt(10, 50);
        const ratio = randInt(2, 5);
        return {
            latex: `\\text{If } y \\text{ is directly proportional to } x \\text{ and } y = ${value} \\text{ when } x = ${ratio}, \\text{ find } y \\text{ when } x = ${ratio * 3}.`,
            answer: (value * 3).toString(),
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "financial-maths": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = randInt(2, 15);
            const b = randInt(2, 15);
            return {
                latex: `\\text{Calculate the total cost of items priced } £${a} \\text{ and } £${b}`,
                answer: (a + b).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const price = randInt(5, 50);
            const paid = price + randInt(1, 20);
            return {
                latex: `\\text{If you pay } £${paid} \\text{ for an item costing } £${price}, \\text{ how much change should you get?}`,
                answer: (paid - price).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const price = randInt(10, 80);
            const discount = randomChoice([10, 20, 25]);
            return {
                latex: `\\text{Find the sale price after a } ${discount}\\% \\text{ discount on } £${price}`,
                answer: (price * (100 - discount) / 100).toString(),
                forceOption: 0,
            };
        }

        const cost = randInt(20, 80);
        const sell = cost + randInt(5, 40);
        return {
            latex: `\\text{A shop buys an item for } £${cost} \\text{ and sells it for } £${sell}. \\text{What is the profit?}`,
            answer: (sell - cost).toString(),
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "algebraic-notation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const a = randInt(1, 9);
            return {
                latex: `\\text{What is } 5x \\text{ when } x = ${a}?`,
                answer: (5 * a).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const a = randInt(1, 6);
            const b = randInt(1, 6);
            return {
                latex: `\\text{If } p = ${a} \\text{ and } q = ${b}, \\text{ find } 2p + 3q`,
                answer: (2 * a + 3 * b).toString(),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Translate into algebra: seven more than a number } x`,
                answer: `x + 7`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Translate into algebra: three times a number } x \\text{ decreased by five}`,
            answer: `3x - 5`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "simplifying-expressions": createGenerator(({ difficulty }) => {
        const optionsSet = new Set<string>();

        let latex = "";
        let answer = "";

        if (difficulty === 1) {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;

            latex = `\\text{Simplify: } ${a}x + ${b}x`;
            answer = `${a + b}x`;

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const wrongCoeff = (a + b) + (Math.floor(Math.random() * 5) - 2);
                optionsSet.add(`${wrongCoeff}x`);
            }
        }

        else if (difficulty === 2) {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;

            latex = `\\text{Simplify: } ${a}a + ${b}b - a`;
            const coeffA = a - 1;

            answer = `${coeffA}a + ${b}b`;

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const wrongA = coeffA + (Math.floor(Math.random() * 3) - 1);
                const wrongB = b + (Math.floor(Math.random() * 3) - 1);
                optionsSet.add(`${wrongA}a + ${wrongB}b`);
            }
        }

        else if (difficulty === 3) {
            const a = Math.floor(Math.random() * 4) + 2;

            latex = `\\text{Simplify: } ${a}x + 3(x + 4)`;

            const coeffX = a + 3;
            const constant = 12;

            answer = `${coeffX}x + ${constant}`;

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const wrongCoeff = coeffX + (Math.floor(Math.random() * 3) - 1);
                const wrongConst = constant + (Math.floor(Math.random() * 6) - 3);
                optionsSet.add(`${wrongCoeff}x + ${wrongConst}`);
            }
        }

        else {
            const a = Math.floor(Math.random() * 5) + 2;

            latex = `\\text{Simplify: } ${a}x - 2(x - 3)`;

            const coeffX = a - 2;
            const constant = 6;

            answer = `${coeffX}x + ${constant}`;

            optionsSet.add(answer);

            while (optionsSet.size < 4) {
                const wrongCoeff = coeffX + (Math.floor(Math.random() * 3) - 1);
                const wrongConst = constant + (Math.floor(Math.random() * 6) - 3);
                optionsSet.add(`${wrongCoeff}x + ${wrongConst}`);
            }
        }

        const options = Array.from(optionsSet);

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            latex,
            answer,
            options,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "expanding-and-factorising": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Expand: } 3(x + 2)`,
                answer: `3x + 6`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Factorise: } 4x + 12`,
                answer: `4(x + 3)`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Expand: } (x + 2)(x + 3)`,
                answer: `x^2 + 5x + 6`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Factorise: } x^2 + 5x + 6`,
            answer: `(x + 2)(x + 3)`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "substitution": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If } x = 4, \\text{ what is } 2x + 1?`,
                answer: `9`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If } a = 2 \\text{ and } b = 3, \\text{ find } 2a + b`,
                answer: `7`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If } x = 3 \\text{ and } y = -1, \\text{ find } x^2 + 2y`,
                answer: `7`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If } p = 4, q = 2, \\text{ find } 3p - 2q`,
            answer: `8`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "linear-equations": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Solve: } x + 5 = 12`,
                answer: `7`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Solve: } 2x = 14`,
                answer: `7`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Solve: } 3x - 4 = 11`,
                answer: `5`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Solve: } 2(x + 3) = 14`,
            answer: `4`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "simultaneous-equations": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Solve the system: } x + y = 5,\\ x = 2`,
                answer: `x=2,y=3`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Solve the system: } x + y = 7,\\ x - y = 1`,
                answer: `x=4,y=3`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Solve the system: } 2x + y = 8,\\ x + y = 5`,
                answer: `x=3,y=2`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Solve the system: } x + 2y = 6,\\ 2x - y = 1`,
            answer: `x=2,y=2`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "quadratic-equations": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Solve: } x^2 - 5x + 6 = 0`,
                answer: `2,3`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Solve: } x^2 - 4 = 0`,
                answer: `2,-2`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Solve: } x^2 + 3x - 10 = 0`,
                answer: `2,-5`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Solve: } 2x^2 - 8 = 0`,
            answer: `2,-2`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "inequalities": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Solve: } x + 2 > 5`,
                answer: `x > 3`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Solve: } 2x \\le 8`,
                answer: `x \\le 4`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Solve: } 3x - 1 \\ge 5`,
                answer: `x \\ge 2`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Solve: } -2x + 6 < 10`,
            answer: `x > -2`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "arithmetic-sequences": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const start = randInt(1, 5);
            const diff = randInt(1, 5);
            return {
                latex: `\\text{Find the next term in the sequence: } ${start}, ${start + diff}, ${start + 2 * diff}`,
                answer: `${start + 3 * diff}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const start = randInt(1, 5);
            const diff = randInt(1, 5);
            return {
                latex: `\\text{Find the 5th term of the arithmetic sequence with first term } ${start} \\text{ and common difference } ${diff}`,
                answer: `${start + 4 * diff}`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const start = randInt(1, 5);
            const diff = randInt(1, 5);
            return {
                latex: `\\text{If the 4th term of an arithmetic sequence is } ${start + 3 * diff}, \\text{ what is the first term?}`,
                answer: `${start}`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the common difference of the sequence: } 3, 7, 11, 15`,
            answer: `4`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "geometric-sequences": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            const start = randInt(1, 5);
            const ratio = randInt(2, 4);
            return {
                latex: `\\text{Find the next term in the sequence: } ${start}, ${start * ratio}, ${start * ratio * ratio}`,
                answer: `${start * ratio * ratio * ratio}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const start = randInt(1, 4);
            const ratio = randInt(2, 4);
            return {
                latex: `\\text{Find the 4th term of the geometric sequence starting with } ${start} \\text{ and ratio } ${ratio}`,
                answer: `${start * Math.pow(ratio, 3)}`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{In a geometric sequence, the first term is } 3 \\text{ and the ratio is } 2. \\text{ What is the 6th term?}`,
                answer: `${3 * Math.pow(2, 5)}`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the common ratio of the sequence: } 5, 15, 45`,
            answer: `3`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "functions-basic-understanding": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If } f(x)=2x+1, \\text{ find } f(3)`,
                answer: `7`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If } f(x)=x^2-1, \\text{ what is } f(2)?`,
                answer: `3`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Which value is the input of a function?}`,
                answer: `x`,
                options: ['x', 'f(x)', 'y', '2x'],
                forceOption: 2,
            };
        }

        return {
            latex: `\\text{If } f(x)=3x-2, \\text{ find } x \\text{ when } f(x)=7`,
            answer: `3`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "linear-graphs": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{What is the gradient of the line through } (0,0) \\text{ and } (2,4)?`,
                answer: `2`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{What is the y-intercept of the line } y = 3x - 5?`,
                answer: `-5`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Write the equation of the line with gradient } 2 \\text{ and y-intercept } 1`,
                answer: `y = 2x + 1`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Are the lines } y = 2x + 3 \\text{ and } y = 2x - 1 \\text{ parallel?}`,
            answer: `true`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "quadratic-graphs": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{The graph of } y = x^2 - 4x + 3. \\text{ What are the x-intercepts?}`,
                answer: `1,3`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{What is the vertex of } y = x^2 - 6x + 8?`,
                answer: `(3, -1)`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{True or False: } y = x^2 \\text{ is a quadratic graph}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find } y \\text{ when } x = 2 \\text{ for } y = x^2 + 2x - 3`,
            answer: `3`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "angles-rules-parallel-lines": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If alternate interior angles are equal, are they } True \\text{ or } False?`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If one angle is } 70^\\circ \\text{ and it is corresponding to another angle, what is the other angle?}`,
                answer: `70`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If two parallel lines are cut by a transversal and one interior angle is } 110^\\circ, \\text{ what is the adjacent interior angle?}`,
                answer: `70`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If an exterior angle of a triangle is } 120^\\circ, \\text{ what is the sum of the opposite interior angles?}`,
            answer: `120`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "properties-of-polygons": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the interior angle sum of a triangle}`,
                answer: `180`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the interior angle sum of a hexagon}`,
                answer: `720`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the exterior angle of a regular octagon}`,
                answer: `45`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{How many sides does a polygon with interior angle sum } 900^\\circ \\text{ have?}`,
            answer: `7`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "congruence-and-similarity": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If two triangles have equal corresponding sides and equal angles, are they congruent?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A triangle is enlarged by a scale factor of } 2. \\text{ If the original side is } 5, \\text{ what is the new side?}`,
                answer: `10`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If two similar shapes have a linear scale factor of } 3, \\text{ what is the area scale factor?}`,
                answer: `9`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A triangle has sides } 3,4,5 \\text{ and a similar triangle has a side of } 6 \\text{ corresponding to } 3. \\text{ What is the length corresponding to } 4?`,
            answer: `8`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "translation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Translate the point } (2,3) \\text{ by } (4,-1)`,
                answer: `(6,2)`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Translate the point } (-1,4) \\text{ by } (-3,2)`,
            answer: `(-4,6)`,
            forceOption: 0,
        };
    }, [1, 4]),

    "rotation": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Rotate } (1,2) \\text{ through } 90^\\circ \\text{ anticlockwise around the origin}`,
                answer: `(-2,1)`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Rotate } (2,-1) \\text{ through } 180^\\circ \\text{ around the origin}`,
            answer: `(-2,1)`,
            forceOption: 0,
        };
    }, [1, 4]),

    "reflection": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Reflect } (3,4) \\text{ in the x-axis}`,
                answer: `(3,-4)`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Reflect } (2,-5) \\text{ in the y-axis}`,
            answer: `(-2,-5)`,
            forceOption: 0,
        };
    }, [1, 4]),

    "enlargement": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Enlarge } (2,3) \\text{ by scale factor } 3`,
                answer: `(6,9)`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Enlarge } (-1,2) \\text{ by scale factor } 2`,
            answer: `(-2,4)`,
            forceOption: 0,
        };
    }, [1, 4]),

    "pythagoras-theorem": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the hypotenuse of a right triangle with legs } 3 \\text{ and } 4`,
                answer: `5`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the missing leg if the hypotenuse is } 13 \\text{ and one leg is } 5`,
                answer: `12`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A right triangle has sides } 6,8,10.\\text{ Is it right-angled?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the length of the hypotenuse of a right triangle with legs } 7 \\text{ and } 24`,
            answer: `25`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "sine-cosine-tangent": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{True or False: } \\sin \\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{In a right triangle, if opposite = 3 and hypotenuse = 5, what is } \\sin \\theta?`,
                answer: `0.6`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If } \\tan \\theta = 1, \\text{ what is } \\theta \\text{ in degrees?}`,
                answer: `45`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If } \\cos \\theta = 0.6 \\text{ and hypotenuse is } 5, \\text{ what is the adjacent side?}`,
            answer: `3`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "right-angled-triangles": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A right triangle has base } 6 \\text{ and height } 4. \\text{ What is the area?}`,
                answer: `12`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the hypotenuse of a right triangle with legs } 5 \\text{ and } 12`,
                answer: `13`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If } \\sin \\theta = 0.6 \\text{ and hypotenuse }=10, \\text{ find the opposite side}`,
                answer: `6`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A right triangle has an angle of } 30^\\circ \\text{ and hypotenuse } 10. \\text{ Find the opposite side rounded to 1 dp}`,
            answer: `5.0`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "circumference-and-area": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the area of a rectangle with width } 4 \\text{ and height } 5`,
                answer: `20`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the circumference of a circle with radius } 7 \\text{ (use } \\\pi=3.14\\text{)}`,
                answer: `43.96`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the area of a circle with radius } 3 \\text{ (use } \\\pi=3.14\\text{)}`,
                answer: `28.26`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the perimeter of a square with side } 9`,
            answer: `36`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "arcs-and-sectors": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A circle has radius } 7. \\text{Find the area of a quarter circle using } \\\pi=3.14`,
                answer: `38.465`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A circle has radius } 10 \\text{. Find the length of a semicircular arc using } \\\pi=3.14`,
                answer: `31.4`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A sector has central angle } 90^\\circ \\text{ in a circle of radius } 8. \\text{Find its area using } \\\pi=3.14`,
                answer: `50.24`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A sector of angle } 60^\\circ \\text{ has radius } 12. \\text{Find its arc length using } \\\pi=3.14`,
            answer: `12.56`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "area-and-perimeter": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the perimeter of a rectangle with sides } 3 \\text{ and } 8`,
                answer: `22`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the area of a triangle with base } 6 \\text{ and height } 5`,
                answer: `15`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the area of a parallelogram with base } 7 \\text{ and height } 4`,
                answer: `28`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the perimeter of an isosceles triangle with equal sides } 5 \\text{ and base } 6`,
            answer: `16`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "prisms": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the volume of a cuboid with dimensions } 3 \\times 4 \\times 5`,
                answer: `60`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the surface area of a cube with side } 4`,
                answer: `96`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the volume of a triangular prism with base area } 10 \\text{ and length } 8`,
                answer: `80`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A prism has volume } 120 \\text{ and base area } 6. \\text{Find its height}`,
            answer: `20`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "cylinders": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the volume of a cylinder with radius } 2 \\text{ and height } 5 \\text{ using } \\\pi=3.14`,
                answer: `62.8`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the curved surface area of a cylinder with radius } 3 \\text{ and height } 7 \\text{ using } \\\pi=3.14`,
                answer: `65.94`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A cylinder has volume } 282.6 \\text{ and radius } 3. \\text{Find its height using } \\\pi=3.14`,
                answer: `10`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the total surface area of a closed cylinder with radius } 2 \\text{ and height } 5 \\text{ using } \\\pi=3.14`,
            answer: `87.92`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "spheres": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the volume of a sphere with radius } 3 \\text{ using } \\\pi=3.14`,
                answer: `113.04`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the surface area of a sphere with radius } 3 \\text{ using } \\\pi=3.14`,
                answer: `113.04`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A sphere has volume } 904.32 \\text{ using } \\\pi=3.14. \\text{Find its radius}`,
                answer: `5`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the volume of a sphere with radius } 5 \\text{ using } \\\pi=3.14`,
            answer: `523.33`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "unit-conversions": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Convert } 500 \\text{ cm to metres}`,
                answer: `5`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Convert } 2.5 \\text{ km to metres}`,
                answer: `2500`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Convert } 120 \\text{ minutes to hours}`,
                answer: `2`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Convert } 3.5 \\text{ litres to millilitres}`,
            answer: `3500`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "compound-measures": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A car travels } 60 \\text{ km in } 2 \\text{ hours. What is its speed in km/h?}`,
                answer: `30`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A courier delivers } 90 \\text{ parcels in } 3 \\text{ hours. What is the rate per hour?}`,
                answer: `30`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A distance of } 150 \\text{ km is covered in } 2.5 \\text{ hours. What is the average speed?}`,
                answer: `60`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A cyclist travels at } 12 \\text{ km/h for } 2.5 \\text{ hours. How far do they go?}`,
            answer: `30`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "data-collection-methods": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{Is a questionnaire an example of primary or secondary data?}`,
                answer: `primary`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Is census data primary or secondary data?}`,
                answer: `secondary`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A researcher uses government statistics. Is this primary or secondary data?}`,
                answer: `secondary`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Which is more likely to be biased: a small sample or a large sample?}`,
            answer: `small sample`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "mean-median-mode": createGenerator(({ difficulty }) => {
        const values = [2, 3, 3, 5, 7];
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the mean of } ${values.join(', ')}`,
                answer: `${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{Find the median of } ${values.join(', ')}`,
                answer: `3`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Find the mode of } ${values.join(', ')}`,
                answer: `3`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Which measure of average is most affected by an outlier?}`,
            answer: `mean`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "range": createGenerator(({ difficulty }) => {
        const data = [4, 7, 2, 9, 5];
        if (difficulty === 1) {
            return {
                latex: `\\text{Find the range of } ${data.join(', ')}`,
                answer: `${Math.max(...data) - Math.min(...data)}`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If one value changes from 9 to 12 in } ${data.join(', ')}, \\text{ what is the new range?}`,
                answer: `10`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{Does adding an outlier always increase the range?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{Find the range of the values } 8, 11, 14, 14, 16`,
            answer: `8`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "bar-charts": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A bar chart shows 5 apples, 3 bananas and 2 oranges. How many fruits total?}`,
                answer: `10`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If the bar for Monday is 4 and Tuesday is 7, what is the difference?}`,
                answer: `3`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If a bar chart shows 8 red cars, 6 blue cars and 10 green cars, how many cars are there altogether?}`,
                answer: `24`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If the frequencies are 3, 5 and 7 for categories A, B and C, which category has the highest frequency?}`,
            answer: `C`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "histograms": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A histogram has a bar covering } 0-10 \\text{ with frequency } 5. \\text{What is the frequency?}`,
                answer: `5`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A histogram has classes } 0-4, 5-9, 10-14. If the middle bar has frequency 7, what is the bar value?}`,
                answer: `7`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{True or False: histograms show continuous data}`,
            answer: `true`,
            forceOption: 0,
        };
    }, [1, 2, 3]),

    "pie-charts": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If 25\\% of a pie chart is apples, what angle does that sector have?}`,
                answer: `90`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{What angle corresponds to 50\\% of a pie chart?}`,
                answer: `180`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A pie chart has 120^\\circ for oranges. What percentage is this?}`,
            answer: `33.33`,
            forceOption: 0,
        };
    }, [1, 2, 3]),

    "basic-probability-rules": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A bag has 3 red and 2 blue balls. What is the probability of selecting a red ball?}`,
                answer: `3/5`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If the probability of rain is } 0.2, \\text{ what is the probability it does not rain?}`,
                answer: `0.8`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A coin is flipped twice. What is the probability of two heads?}`,
                answer: `1/4`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A die is rolled. What is the probability of an even number?}`,
            answer: `1/2`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "tree-diagrams": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{A coin is flipped and a die is rolled. How many outcomes are there?}`,
                answer: `12`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A bag has 2 red and 3 blue balls. A ball is chosen and replaced, then chosen again. How many outcomes?}`,
                answer: `4`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A coin is tossed then a spinner with 3 equal regions is spun. How many combined outcomes?}`,
                answer: `6`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A coin has probability 1/2 of heads. A second coin is tossed. What is the probability of one head and one tail?}`,
            answer: `1/2`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "venn-diagrams": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If 10 students like cats, 8 like dogs and 4 like both, how many like cats or dogs?}`,
                answer: `14`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If 20 students were surveyed and 5 like neither cats nor dogs, how many like cats or dogs?}`,
                answer: `15`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If 12 like A, 9 like B and 4 like both, how many like only A?}`,
                answer: `8`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If 18 students like maths, 12 like science and 6 like both, how many like at least one?}`,
            answer: `24`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "multi-step-problems": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If Sam has } 5 \\text{ apples and buys } 3 \\text{ more, how many does he have?}`,
                answer: `8`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{A book costs } £8. \\text{Two books cost how much?}`,
                answer: `16`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{A packet contains 4 sweets. How many sweets are in 7 packets?}`,
                answer: `28`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{A bus ticket costs } £2.50. If you buy 4 tickets, how much do you pay?}`,
            answer: `10`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "mathematical-proofs": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{True or False: } \\text{If all squares are rectangles, then all rectangles are squares.}`,
                answer: `false`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{True or False: } \\text{If a shape is a square, it has 4 right angles.}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If two angles are supplementary, their sum is } 180^\\circ. \\text{Is this true?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If all even numbers are divisible by 2, is 14 even?}`,
            answer: `true`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),

    "logical-deduction": createGenerator(({ difficulty }) => {
        if (difficulty === 1) {
            return {
                latex: `\\text{If it is raining, the ground is wet. It is raining. Is the ground wet?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            return {
                latex: `\\text{If all cats are animals and Fluffy is a cat, is Fluffy an animal?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            return {
                latex: `\\text{If John is taller than Mary and Mary is taller than Sam, is John taller than Sam?}`,
                answer: `true`,
                forceOption: 0,
            };
        }

        return {
            latex: `\\text{If A implies B and B implies C, does A imply C?}`,
            answer: `true`,
            forceOption: 0,
        };
    }, [1, 2, 3, 4]),
};

