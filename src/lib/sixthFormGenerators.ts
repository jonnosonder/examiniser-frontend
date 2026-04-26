// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { createGenerator } from './questionGeneratorCommon';
import type { QuestionGeneratorWithLevels } from './questionGeneratorCommon';

const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const choose = <T,>(items: T[]): T => items[randInt(0, items.length - 1)];

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

const nonZeroInt = (min: number, max: number): number => {
    let value = 0;
    while (value === 0) {
        value = randInt(min, max);
    }
    return value;
};

const formatPower = (power: number): string => {
    if (power === 0) return '1';
    if (power === 1) return 'x';
    return `x^{${power}}`;
};

const formatSignedNumber = (value: number): string => {
    return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
};

const formatLinear = (coefficient: number, constant: number): string => {
    let expression = coefficient === 1 ? 'x' : coefficient === -1 ? '-x' : `${coefficient}x`;

    if (constant !== 0) {
        expression += constant > 0 ? ` + ${constant}` : ` - ${Math.abs(constant)}`;
    }

    return expression;
};

const formatQuadratic = (xCoefficient: number, constant: number): string => {
    let expression = 'x^2';

    if (xCoefficient !== 0) {
        if (xCoefficient === 1) {
            expression += ' + x';
        } else if (xCoefficient === -1) {
            expression += ' - x';
        } else {
            expression += xCoefficient > 0
                ? ` + ${xCoefficient}x`
                : ` - ${Math.abs(xCoefficient)}x`;
        }
    }

    if (constant !== 0) {
        expression += constant > 0 ? ` + ${constant}` : ` - ${Math.abs(constant)}`;
    }

    return expression;
};

const formatCubic = (quadraticCoefficient: number, linearCoefficient: number, constant: number): string => {
    let expression = 'x^3';

    if (quadraticCoefficient !== 0) {
        if (quadraticCoefficient === 1) {
            expression += ' + x^2';
        } else if (quadraticCoefficient === -1) {
            expression += ' - x^2';
        } else {
            expression += quadraticCoefficient > 0
                ? ` + ${quadraticCoefficient}x^2`
                : ` - ${Math.abs(quadraticCoefficient)}x^2`;
        }
    }

    if (linearCoefficient !== 0) {
        if (linearCoefficient === 1) {
            expression += ' + x';
        } else if (linearCoefficient === -1) {
            expression += ' - x';
        } else {
            expression += linearCoefficient > 0
                ? ` + ${linearCoefficient}x`
                : ` - ${Math.abs(linearCoefficient)}x`;
        }
    }

    if (constant !== 0) {
        expression += constant > 0 ? ` + ${constant}` : ` - ${Math.abs(constant)}`;
    }

    return expression;
};

const formatFactor = (root: number): string => {
    return root >= 0 ? `(x - ${root})` : `(x + ${Math.abs(root)})`;
};

const formatFactorised = (rootA: number, rootB: number): string => {
    const [left, right] = [rootA, rootB].sort((a, b) => a - b);
    return `${formatFactor(left)}${formatFactor(right)}`;
};

const formatRootPair = (rootA: number, rootB: number): string => {
    const [left, right] = [rootA, rootB].sort((a, b) => a - b);
    return `${left}, ${right}`;
};

const formatInverse = (coefficient: number, constant: number): string => {
    const numerator = constant === 0
        ? 'x'
        : constant > 0
            ? `x - ${constant}`
            : `x + ${Math.abs(constant)}`;

    return `\\frac{${numerator}}{${coefficient}}`;
};

const buildOptions = (correct: string, distractors: string[], fallbackFactory?: () => string): string[] => {
    const options = new Set<string>([correct]);

    for (const distractor of distractors) {
        if (distractor && distractor !== correct) {
            options.add(distractor);
        }
        if (options.size >= 4) break;
    }

    let guard = 0;
    while (options.size < 4 && fallbackFactory && guard < 20) {
        const candidate = fallbackFactory();
        if (candidate && candidate !== correct) {
            options.add(candidate);
        }
        guard += 1;
    }

    return shuffle(Array.from(options).slice(0, 4));
};

type Vector2 = {
    x: number;
    y: number;
};

const formatVectorIJ = (vector: Vector2): string => {
    const parts: string[] = [];

    if (vector.x !== 0) {
        if (vector.x === 1) parts.push('\\mathbf{i}');
        else if (vector.x === -1) parts.push('-\\mathbf{i}');
        else parts.push(`${vector.x}\\mathbf{i}`);
    }

    if (vector.y !== 0) {
        if (parts.length === 0) {
            if (vector.y === 1) parts.push('\\mathbf{j}');
            else if (vector.y === -1) parts.push('-\\mathbf{j}');
            else parts.push(`${vector.y}\\mathbf{j}`);
        } else {
            if (vector.y === 1) parts.push('+ \\mathbf{j}');
            else if (vector.y === -1) parts.push('- \\mathbf{j}');
            else if (vector.y > 0) parts.push(`+ ${vector.y}\\mathbf{j}`);
            else parts.push(`- ${Math.abs(vector.y)}\\mathbf{j}`);
        }
    }

    if (parts.length === 0) return '\\mathbf{0}';
    return `(${parts.join(' ')})`;
};

const formatVectorPair = (vector: Vector2): string => `(${vector.x}, ${vector.y})`;

const addVectors = (left: Vector2, right: Vector2): Vector2 => ({
    x: left.x + right.x,
    y: left.y + right.y,
});

const subtractVectors = (left: Vector2, right: Vector2): Vector2 => ({
    x: left.x - right.x,
    y: left.y - right.y,
});

const scaleVector = (vector: Vector2, scalar: number): Vector2 => ({
    x: vector.x * scalar,
    y: vector.y * scalar,
});

const vectorMagnitude = (vector: Vector2): number => Math.sqrt(vector.x * vector.x + vector.y * vector.y);

const bearingFromVelocity = (velocity: Vector2): number => {
    const angle = (Math.atan2(velocity.x, velocity.y) * 180) / Math.PI;
    const bearing = (angle + 360) % 360;
    return Math.round(bearing);
};

const formatBearing = (bearing: number): string => `${bearing}`.padStart(3, '0') + '°';

const randomVector = (min: number, max: number, allowZero = false): Vector2 => {
    let vector = { x: randInt(min, max), y: randInt(min, max) };
    while (!allowZero && vector.x === 0 && vector.y === 0) {
        vector = { x: randInt(min, max), y: randInt(min, max) };
    }
    return vector;
};

const nCr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    const reduced = Math.min(r, n - r);
    let value = 1;

    for (let i = 1; i <= reduced; i += 1) {
        value = (value * (n - reduced + i)) / i;
    }

    return Math.round(value);
};

const binomialPmf = (n: number, p: number, r: number): number => {
    return nCr(n, r) * (p ** r) * ((1 - p) ** (n - r));
};

const binomialRange = (n: number, p: number, from: number, to: number): number => {
    let total = 0;
    for (let r = from; r <= to; r += 1) {
        total += binomialPmf(n, p, r);
    }
    return total;
};

const formatProbability = (value: number): string => value.toFixed(3);

const clampProbability = (value: number): number => {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
};

const buildProbabilityOptions = (answerValue: number, distractors: number[]): string[] => {
    const answer = formatProbability(clampProbability(answerValue));
    return buildOptions(answer, distractors.map((value) => formatProbability(clampProbability(value))), () => {
        return formatProbability(randInt(0, 1000) / 1000);
    });
};

type Rational = {
    numerator: number;
    denominator: number;
};

type DifferentiationTerm = {
    coefficient: Rational;
    power: Rational;
};

const gcd = (a: number, b: number): number => {
    let left = Math.abs(a);
    let right = Math.abs(b);

    while (right !== 0) {
        const temp = left % right;
        left = right;
        right = temp;
    }

    return left || 1;
};

const simplifyRational = (numerator: number, denominator: number): Rational => {
    if (denominator === 0) {
        throw new Error('Denominator cannot be zero');
    }

    if (numerator === 0) {
        return { numerator: 0, denominator: 1 };
    }

    const sign = denominator < 0 ? -1 : 1;
    const factor = gcd(numerator, denominator);

    return {
        numerator: (numerator / factor) * sign,
        denominator: Math.abs(denominator) / factor,
    };
};

const rational = (numerator: number, denominator = 1): Rational => simplifyRational(numerator, denominator);

const multiplyRational = (left: Rational, right: Rational): Rational => {
    return simplifyRational(left.numerator * right.numerator, left.denominator * right.denominator);
};

const subtractRational = (left: Rational, right: Rational): Rational => {
    return simplifyRational(
        left.numerator * right.denominator - right.numerator * left.denominator,
        left.denominator * right.denominator
    );
};

const rationalToLatex = (value: Rational): string => {
    if (value.denominator === 1) {
        return `${value.numerator}`;
    }

    if (value.numerator < 0) {
        return `-\\frac{${Math.abs(value.numerator)}}{${value.denominator}}`;
    }

    return `\\frac{${value.numerator}}{${value.denominator}}`;
};

const powerToLatex = (value: Rational): string => {
    if (value.denominator === 1) {
        return `${value.numerator}`;
    }

    const absNumerator = Math.abs(value.numerator);
    const fraction = `\\frac{${absNumerator}}{${value.denominator}}`;
    return value.numerator < 0 ? `-${fraction}` : fraction;
};

const formatDifferentiationTerm = (term: DifferentiationTerm): string => {
    const coefficient = simplifyRational(term.coefficient.numerator, term.coefficient.denominator);
    const power = simplifyRational(term.power.numerator, term.power.denominator);

    if (coefficient.numerator === 0) {
        return '0';
    }

    if (power.numerator === 0) {
        return rationalToLatex(coefficient);
    }

    let variablePart = 'x';
    if (!(power.numerator === 1 && power.denominator === 1)) {
        variablePart += `^{${powerToLatex(power)}}`;
    }

    if (coefficient.numerator === coefficient.denominator) {
        return variablePart;
    }

    if (coefficient.numerator === -coefficient.denominator) {
        return `-${variablePart}`;
    }

    return `${rationalToLatex(coefficient)}${variablePart}`;
};

const joinExpressionParts = (parts: string[]): string => {
    if (parts.length === 0) {
        return '0';
    }

    return parts.reduce((expression, part, index) => {
        if (index === 0) {
            return part;
        }

        if (part.startsWith('-')) {
            return `${expression} - ${part.slice(1)}`;
        }

        return `${expression} + ${part}`;
    }, '');
};

const formatDifferentiationExpression = (terms: DifferentiationTerm[]): string => {
    const parts = terms
        .map(formatDifferentiationTerm)
        .filter((part) => part !== '0');

    return joinExpressionParts(parts);
};

const differentiateTerm = (term: DifferentiationTerm): DifferentiationTerm => {
    return {
        coefficient: multiplyRational(term.coefficient, term.power),
        power: subtractRational(term.power, rational(1)),
    };
};

const differentiateTerms = (terms: DifferentiationTerm[]): DifferentiationTerm[] => {
    return terms
        .filter((term) => term.power.numerator !== 0)
        .map(differentiateTerm)
        .filter((term) => term.coefficient.numerator !== 0);
};

const evaluateTermAt = (term: DifferentiationTerm, xValue: number): number => {
    const coefficient = term.coefficient.numerator / term.coefficient.denominator;
    const power = term.power.numerator / term.power.denominator;
    return coefficient * (xValue ** power);
};

const buildDerivativeDistractor = (terms: DifferentiationTerm[], mode: 'keepPower' | 'keepCoefficient' | 'increasePower'): string => {
    const transformed = terms
        .filter((term) => term.power.numerator !== 0)
        .map((term) => {
            if (mode === 'keepPower') {
                return {
                    coefficient: multiplyRational(term.coefficient, term.power),
                    power: term.power,
                };
            }

            if (mode === 'keepCoefficient') {
                return {
                    coefficient: term.coefficient,
                    power: subtractRational(term.power, rational(1)),
                };
            }

            return {
                coefficient: multiplyRational(term.coefficient, rational(term.power.numerator + term.power.denominator, term.power.denominator)),
                power: rational(term.power.numerator + term.power.denominator, term.power.denominator),
            };
        })
        .filter((term) => term.coefficient.numerator !== 0);

    return formatDifferentiationExpression(transformed);
};

const randomDistinctPowers = (pool: Rational[], count: number): Rational[] => {
    return shuffle(pool).slice(0, count);
};

const sortTermsDescending = (terms: DifferentiationTerm[]): DifferentiationTerm[] => {
    return [...terms].sort((left, right) => (right.power.numerator / right.power.denominator) - (left.power.numerator / left.power.denominator));
};

export const sixthFormGenerators: Record<string, QuestionGeneratorWithLevels> = {
    "algebra-and-functions": createGenerator(async ({ difficulty }) => {
        if (difficulty === 1) {
            const exponentA = randInt(2, 7);
            const exponentB = randInt(2, 7);
            const divisorExponent = randInt(1, exponentA + exponentB - 1);
            const finalPower = exponentA + exponentB - divisorExponent;

            const answer = formatPower(finalPower);
            const options = buildOptions(answer, [
                formatPower(exponentA + exponentB),
                formatPower(exponentA + exponentB + divisorExponent),
                formatPower(divisorExponent - exponentA - exponentB),
            ], () => formatPower(randInt(-3, 12)));

            return {
                latex: `\\text{Simplify } \\frac{x^{${exponentA}} \\cdot x^{${exponentB}}}{x^{${divisorExponent}}}.`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const rootA = nonZeroInt(-8, 8);
            let rootB = nonZeroInt(-8, 8);

            while (rootB === rootA) {
                rootB = nonZeroInt(-8, 8);
            }

            const xCoefficient = -(rootA + rootB);
            const constant = rootA * rootB;
            

            const options = buildOptions(formatRootPair(rootA, rootB), [
                formatRootPair(-rootA, -rootB),
                formatRootPair(rootA, -rootB),
                formatRootPair(-rootA, rootB),
            ], () => formatRootPair(nonZeroInt(-8, 8), nonZeroInt(-8, 8)));

            const answer = [`x=${formatRootPair(rootA, rootB)}`, formatRootPair(rootA, rootB)];

            return {
                latex: `\\text{Solve } ${formatQuadratic(xCoefficient, constant)} = 0. \\ \\\\ \\text{Give your answers in ascending order.}`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const rootA = nonZeroInt(-6, 6);
            let rootB = nonZeroInt(-6, 6);

            while (rootB === rootA || rootB === -rootA) {
                rootB = nonZeroInt(-6, 6);
            }

            const xCoefficient = -(rootA + rootB);
            const constant = rootA * rootB;
            const answer = formatFactorised(rootA, rootB);

            const options = buildOptions(answer, [
                formatFactorised(-rootA, -rootB),
                formatFactorised(rootA, -rootB),
                formatFactorised(-rootA, rootB),
            ], () => formatFactorised(nonZeroInt(-6, 6), nonZeroInt(-6, 6)));

            return {
                latex: `\\text{Factorise } ${formatQuadratic(xCoefficient, constant)}.`,
                answer,
                checkWeakLatexEquivalent: true,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const firstConstant = nonZeroInt(-5, 5);
            let secondConstant = nonZeroInt(-5, 5);
            let thirdConstant = nonZeroInt(-5, 5);

            while (secondConstant === firstConstant) {
                secondConstant = nonZeroInt(-5, 5);
            }

            while (thirdConstant === firstConstant || thirdConstant === secondConstant) {
                thirdConstant = nonZeroInt(-5, 5);
            }

            const quadraticCoefficient = firstConstant + secondConstant + thirdConstant;
            const linearCoefficient =
                firstConstant * secondConstant +
                firstConstant * thirdConstant +
                secondConstant * thirdConstant;
            const constant = firstConstant * secondConstant * thirdConstant;
            const answer = formatCubic(quadraticCoefficient, linearCoefficient, constant);

            const options = buildOptions(answer, [
                formatCubic(quadraticCoefficient, linearCoefficient, -constant),
                formatCubic(-quadraticCoefficient, linearCoefficient, constant),
                formatCubic(quadraticCoefficient, -linearCoefficient, constant),
            ], () => formatCubic(randInt(-8, 8), randInt(-12, 12), randInt(-30, 30)));

            return {
                latex: `\\text{Expand and simplify } (x ${formatSignedNumber(firstConstant)})(x ${formatSignedNumber(secondConstant)})(x ${formatSignedNumber(thirdConstant)}).`,
                answer,
                checkWeakLatexEquivalent: true,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            if (Math.random() < 0.5) {
                const coefficient = randInt(2, 5);
                const constant = nonZeroInt(-8, 8);
                const answer = formatInverse(coefficient, constant);

                const options = buildOptions(answer, [
                    `\\frac{x ${constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`}}{${coefficient}}`,
                    `${coefficient}x ${constant > 0 ? `- ${constant}` : `+ ${Math.abs(constant)}`}`,
                    `\\frac{${coefficient}x ${constant > 0 ? `- ${constant}` : `+ ${Math.abs(constant)}`}}{1}`,
                ], () => `\\frac{x ${choose(['+ 1', '- 1', '+ 2', '- 2'])}}{${randInt(2, 6)}}`);

                return {
                    latex: `\\text{Given } f(x) = ${formatLinear(coefficient, constant)}, \\text{ find } f^{-1}(x).`,
                    answer,
                    options,
                    forceOption: 0,
                };
            }

            const a = randInt(2, 4);
            const b = randInt(-4, 4);
            const c = randInt(2, 4);
            const d = randInt(-4, 4);
            const input = randInt(1, 5);
            const result = a * (c * input + d) + b;
            const answer = `${result}`;

            const options = buildOptions(answer, [
                `${result + a}`,
                `${a * input + b}`,
                `${c * input + d}`,
            ], () => `${result + randInt(-6, 6)}`);

            return {
                latex: `\\text{Given } f(x) = ${formatLinear(a, b)} \\text{ and } g(x) = ${formatLinear(c, d)}, \\\\ \\text{find } f(g(${input})).`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 6) {
            if (Math.random() < 0.5) {
                const horizontalShift = nonZeroInt(-5, 5);
                const verticalShift = nonZeroInt(-4, 4);

                const horizontalDirection = horizontalShift > 0 ? `right ${horizontalShift}` : `left ${Math.abs(horizontalShift)}`;
                const verticalDirection = verticalShift > 0 ? `up ${verticalShift}` : `down ${Math.abs(verticalShift)}`;
                const answer = `${horizontalDirection}, ${verticalDirection}`;

                const options = buildOptions(answer, [
                    `${horizontalShift > 0 ? `left ${horizontalShift}` : `right ${Math.abs(horizontalShift)}`}, ${verticalDirection}`,
                    `${horizontalDirection}, ${verticalShift > 0 ? `down ${verticalShift}` : `up ${Math.abs(verticalShift)}`}`,
                    `${horizontalShift > 0 ? `left ${horizontalShift}` : `right ${Math.abs(horizontalShift)}`}, ${verticalShift > 0 ? `down ${verticalShift}` : `up ${Math.abs(verticalShift)}`}`,
                ]);

                return {
                    latex: `\\text{Describe the translation that maps } y = f(x) \\text{ to } y = f(x ${horizontalShift > 0 ? ` - ${horizontalShift}` : ` + ${Math.abs(horizontalShift)}`})${verticalShift > 0 ? ` + ${verticalShift}` : ` - ${Math.abs(verticalShift)}`}.`,
                    answer,
                    options,
                    forceOption: 2,
                };
            }

            const scale = randInt(2, 4);
            const midpoint = randInt(-4, 4);
            const width = randInt(2, 5);
            const left = midpoint - width;
            const right = midpoint + width;
            const constant = -scale * midpoint;
            const answer = `${left} < x < ${right}`;

            const options = buildOptions(answer, [
                `x < ${left} \text{ or } x > ${right}`,
                `${left} \\leq x \\leq ${right}`,
                `${left} > x > ${right}`,
            ]);

            return {
                latex: `\\text{Solve } |${scale}x ${constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`}| < ${scale * width}.`,
                answer,
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 7) {
            const power = choose([1, 3]);
            const rootA = randInt(1, 4);
            let rootB = randInt(1, 4);

            while (rootB === rootA) {
                rootB = randInt(1, 4);
            }

            const smallerRoot = Math.min(rootA, rootB);
            const largerRoot = Math.max(rootA, rootB);
            const substitutionRootA = power === 1 ? smallerRoot : smallerRoot ** 3;
            const substitutionRootB = power === 1 ? largerRoot : largerRoot ** 3;
            const middleCoefficient = -(substitutionRootA + substitutionRootB);
            const constant = substitutionRootA * substitutionRootB;
            const xSolutionA = smallerRoot ** 2;
            const xSolutionB = largerRoot ** 2;
            const answerValue = `${xSolutionA}, ${xSolutionB}`;
            const options = buildOptions(answerValue, [
                `${smallerRoot}, ${largerRoot}`,
                `${xSolutionA}, ${largerRoot}`,
                `${smallerRoot}, ${xSolutionB}`,
            ], () => `${randInt(1, 16)}, ${randInt(1, 16)}`);

            return {
                latex: power === 1
                    ? `\\text{Solve } x ${middleCoefficient > 0 ? `+ ${middleCoefficient}` : `- ${Math.abs(middleCoefficient)}`}\\sqrt{x} + ${constant} = 0. \\ \\\\ \\text{Give your answers in ascending order.}`
                    : `\\text{Solve } x^3 ${middleCoefficient > 0 ? `+ ${middleCoefficient}` : `- ${Math.abs(middleCoefficient)}`}x^{\\frac{3}{2}} + ${constant} = 0. \\ \\\\ \\text{Give your answers in ascending order.}`,
                answer: [answerValue, `x=${answerValue}`, `x = ${answerValue}`],
                options,
                forceOption: 0,
            };
        }

        if (difficulty === 8) {
            const solution = randInt(-3, 6);

            if (Math.random() < 0.5) {
                const primeBase = choose([2, 3, 5]);
                const leftPower = choose([2, 3]);
                const rightPower = choose([1, 4, 5].filter((value) => value !== leftPower));
                const shift = randInt(-4, 4);
                const rightExponent = (leftPower * (solution + shift)) / rightPower;

                if (!Number.isInteger(rightExponent)) {
                    const adjustedRightExponent = leftPower * (solution + shift);
                    const answerValue = `${solution}`;
                    const displayAnswer = `x=${solution}`;
                    const options = buildOptions(displayAnswer, [
                        `x=${solution + 1}`,
                        `x=${solution - 1}`,
                        `x=${-solution}`,
                    ], () => `x=${randInt(-5, 7)}`);

                    return {
                        latex: `\\text{Solve } ${primeBase ** leftPower}^{x ${shift >= 0 ? `+ ${shift}` : `- ${Math.abs(shift)}`}} = ${primeBase}^{${adjustedRightExponent}}.`,
                        answer: [answerValue, displayAnswer, `x = ${solution}`],
                        options,
                        forceOption: 0,
                    };
                }

                const answerValue = `${solution}`;
                const displayAnswer = `x=${solution}`;
                const options = buildOptions(displayAnswer, [
                    `x=${solution + 1}`,
                    `x=${solution - 1}`,
                    `x=${-solution}`,
                ], () => `x=${randInt(-5, 7)}`);

                return {
                    latex: `\\text{Solve } ${primeBase ** leftPower}^{x ${shift >= 0 ? `+ ${shift}` : `- ${Math.abs(shift)}`}} = ${primeBase ** rightPower}^{${rightExponent}}.`,
                    answer: [answerValue, displayAnswer, `x = ${solution}`],
                    options,
                    forceOption: 0,
                };
            }

            const primeBase = choose([2, 3]);
            const leftPower = choose([2, 3]);
            const rightPower = leftPower === 2 ? 1 : 2;
            const coefficient = choose([1, 2, 3]);
            const constant = randInt(-5, 5);
            const scaledExponent = leftPower * (coefficient * solution + constant);

            let rightExponent = scaledExponent / rightPower;
            if (!Number.isInteger(rightExponent)) {
                rightExponent = scaledExponent;
            }

            const answerValue = `${solution}`;
            const displayAnswer = `x=${solution}`;
            const options = buildOptions(displayAnswer, [
                `x=${solution + 1}`,
                `x=${solution - 1}`,
                `x=${solution + 2}`,
            ], () => `x=${randInt(-5, 7)}`);

            const rightBase = Number.isInteger(scaledExponent / rightPower)
                ? primeBase ** rightPower
                : primeBase;

            return {
                latex: `\\text{Solve } ${primeBase ** leftPower}^{${coefficient === 1 ? 'x' : `${coefficient}x`}${constant > 0 ? ` + ${constant}` : constant < 0 ? ` - ${Math.abs(constant)}` : ''}} = ${rightBase}^{${rightExponent}}.`,
                answer: [answerValue, displayAnswer, `x = ${solution}`],
                options,
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5, 6, 7, 8]),
    "differentiation": createGenerator(async ({ difficulty }) => {
        if (difficulty === 1) {
            const xTermCount = randInt(2, 5);
            const powers = randomDistinctPowers(
                [1, 2, 3, 4, 5, 6].map((power) => rational(power)),
                xTermCount
            );

            const terms = sortTermsDescending(
                powers.map((power) => ({
                    coefficient: rational(randInt(2, 9)),
                    power,
                }))
            );

            if (Math.random() < 0.5) {
                terms.push({ coefficient: rational(randInt(1, 9)), power: rational(0) });
            }

            const derivativeTerms = differentiateTerms(terms);
            const answer = formatDifferentiationExpression(derivativeTerms);

            return {
                latex: `\\text{Differentiate with respect to } x:\\ ${formatDifferentiationExpression(terms)}`,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    buildDerivativeDistractor(terms, 'keepPower'),
                    buildDerivativeDistractor(terms, 'keepCoefficient'),
                    buildDerivativeDistractor(terms, 'increasePower'),
                ], () => formatDifferentiationExpression(sortTermsDescending(randomDistinctPowers(
                    [1, 2, 3, 4, 5].map((power) => rational(power)),
                    randInt(2, 4)
                ).map((power) => ({
                    coefficient: rational(randInt(1, 12)),
                    power,
                }))))),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const powerPool = [
                rational(-2),
                rational(-1),
                rational(-1, 2),
                rational(1, 2),
                rational(1),
                rational(3, 2),
                rational(2),
                rational(5, 2),
                rational(3),
            ];

            const xTermCount = randInt(2, 4);
            const powers = randomDistinctPowers(powerPool, xTermCount);
            const terms = sortTermsDescending(
                powers.map((power) => ({
                    coefficient: rational(nonZeroInt(-8, 8)),
                    power,
                }))
            );

            if (Math.random() < 0.35) {
                terms.push({ coefficient: rational(nonZeroInt(-6, 6)), power: rational(0) });
            }

            const derivativeTerms = differentiateTerms(terms);
            const answer = formatDifferentiationExpression(derivativeTerms);

            return {
                latex: `\\text{Differentiate with respect to } x:\\ ${formatDifferentiationExpression(terms)}`,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    buildDerivativeDistractor(terms, 'keepPower'),
                    buildDerivativeDistractor(terms, 'keepCoefficient'),
                    buildDerivativeDistractor(terms, 'increasePower'),
                ], () => formatDifferentiationExpression(sortTermsDescending(randomDistinctPowers(powerPool, randInt(2, 3)).map((power) => ({
                    coefficient: rational(nonZeroInt(-8, 8)),
                    power,
                }))))),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const xTermCount = randInt(2, 3);
            const powers = randomDistinctPowers([2, 3, 4, 5].map((power) => rational(power)), xTermCount);
            const terms = sortTermsDescending(
                powers.map((power) => ({
                    coefficient: rational(nonZeroInt(-6, 6)),
                    power,
                }))
            );

            if (Math.random() < 0.5) {
                terms.push({ coefficient: rational(nonZeroInt(-5, 5)), power: rational(0) });
            }

            const xValue = choose([-2, -1, 1, 2, 3]);
            const derivativeTerms = differentiateTerms(terms);
            const gradient = derivativeTerms.reduce((total, term) => total + evaluateTermAt(term, xValue), 0);
            const answer = `${gradient}`;

            return {
                latex: `\\text{Differentiate } y = ${formatDifferentiationExpression(terms)} \\text{ and find the gradient when } x = ${xValue}.`,
                answer,
                options: buildOptions(answer, [
                    `${gradient + randInt(1, 4)}`,
                    `${gradient - randInt(1, 4)}`,
                    `${-gradient}`,
                ], () => `${gradient + randInt(-8, 8)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const trigMode = choose(['sin', 'cos', 'mix']);

            if (trigMode === 'mix') {
                const sinCoefficient = nonZeroInt(-6, 6);
                const cosCoefficient = nonZeroInt(-6, 6);
                const constant = Math.random() < 0.4 ? nonZeroInt(-5, 5) : 0;
                const questionTerms: string[] = [];
                questionTerms.push(formatDifferentiationTerm({ coefficient: rational(sinCoefficient), power: rational(1) }).replace(/x$/, '\\sin x'));
                questionTerms.push(formatDifferentiationTerm({ coefficient: rational(cosCoefficient), power: rational(1) }).replace(/x$/, '\\cos x'));
                if (constant !== 0) {
                    questionTerms.push(`${constant}`);
                }

                const answer = joinExpressionParts([
                    formatDifferentiationTerm({ coefficient: rational(sinCoefficient), power: rational(1) }).replace(/x$/, '\\cos x'),
                    formatDifferentiationTerm({ coefficient: rational(-cosCoefficient), power: rational(1) }).replace(/x$/, '\\sin x'),
                ]);

                return {
                    latex: `\\text{Differentiate with respect to } x:\\ ${joinExpressionParts(questionTerms)}`,
                    answer,
                    checkWeakLatexEquivalent: true,
                    options: buildOptions(answer, [
                        joinExpressionParts([
                            formatDifferentiationTerm({ coefficient: rational(sinCoefficient), power: rational(1) }).replace(/x$/, '\\sin x'),
                            formatDifferentiationTerm({ coefficient: rational(cosCoefficient), power: rational(1) }).replace(/x$/, '\\cos x'),
                        ]),
                        joinExpressionParts([
                            formatDifferentiationTerm({ coefficient: rational(sinCoefficient), power: rational(1) }).replace(/x$/, '\\cos x'),
                            formatDifferentiationTerm({ coefficient: rational(cosCoefficient), power: rational(1) }).replace(/x$/, '\\sin x'),
                        ]),
                        joinExpressionParts([
                            formatDifferentiationTerm({ coefficient: rational(-sinCoefficient), power: rational(1) }).replace(/x$/, '\\cos x'),
                            formatDifferentiationTerm({ coefficient: rational(-cosCoefficient), power: rational(1) }).replace(/x$/, '\\sin x'),
                        ]),
                    ]),
                    forceOption: 0,
                };
            }

            const coefficient = nonZeroInt(-7, 7);
            const trigFunction = trigMode === 'sin' ? '\\sin x' : '\\cos x';
            const answerFunction = trigMode === 'sin' ? '\\cos x' : '\\sin x';
            const sign = trigMode === 'sin' ? 1 : -1;
            const answer = joinExpressionParts([
                `${rationalToLatex(rational(sign * coefficient))}${answerFunction}`.replace(/^1\\/, '\\').replace(/^-1\\/, '-\\')
            ]);
            const question = `${rationalToLatex(rational(coefficient))}${trigFunction}`.replace(/^1\\/, '\\').replace(/^-1\\/, '-\\');

            return {
                latex: `\\text{Differentiate with respect to } x:\\ ${question}`,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    `${rationalToLatex(rational(coefficient))}${answerFunction}`.replace(/^1\\/, '\\').replace(/^-1\\/, '-\\'),
                    `${rationalToLatex(rational(sign * coefficient))}${trigFunction}`.replace(/^1\\/, '\\').replace(/^-1\\/, '-\\'),
                    `${rationalToLatex(rational(-sign * coefficient))}${answerFunction}`.replace(/^1\\/, '\\').replace(/^-1\\/, '-\\'),
                ]),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4]),
    "numerical-methods": createGenerator(async ({ difficulty }) => {
        if (difficulty === 1) {
            // Location of roots: sign-change argument on f(x) = x³ + ax + b
            let a = 0;
            let b = 0;
            let signIntervals: Array<[number, number]> = [];
            let noSignIntervals: string[] = [];

            let guard = 0;
            do {
                a = randInt(-4, 4);
                b = nonZeroInt(-6, 6);
                signIntervals = [];
                noSignIntervals = [];
                for (let n = -4; n <= 3; n++) {
                    const fn = n ** 3 + a * n + b;
                    const fn1 = (n + 1) ** 3 + a * (n + 1) + b;
                    if (fn * fn1 < 0) {
                        signIntervals.push([n, n + 1]);
                    } else if (fn !== 0 && fn1 !== 0) {
                        noSignIntervals.push(`(${n}, ${n + 1})`);
                    }
                }
                guard++;
            } while (signIntervals.length === 0 && guard < 100);

            if (signIntervals.length === 0) {
                a = 0; b = -5;
                signIntervals = [[1, 2]];
                noSignIntervals = ['(-1, 0)', '(0, 1)', '(2, 3)'];
            }

            const [ra, rb] = choose(signIntervals);
            const answer = `(${ra}, ${rb})`;
            const fStr = formatCubic(0, a, b);

            const phrasing = choose([
                `\\text{Which of the following intervals contains a root of } f(x) = ${fStr}?`,
                `\\text{The equation } ${fStr} = 0 \\text{ has a root in one of the intervals below.} \\\\ \\text{Using a sign-change argument, which interval contains a root?}`,
                `\\text{By evaluating } f(x) = ${fStr} \\ \\text{ at the endpoints, identify the interval that contains a root.}`,
                `\\text{Use a sign-change argument to show } f(x) = ${fStr} \\ \\text{ has a root. Which interval below contains it?}`,
            ]);

            return {
                latex: phrasing,
                answer,
                options: buildOptions(answer, shuffle(noSignIntervals).slice(0, 3)),
                forceOption: 2,
            };
        }

        if (difficulty === 2) {
            // Fixed-point iteration: x_{n+1} = ∛(k − a·xₙ), find x₁
            // Equation: x³ + ax − k = 0, rearranged as x = ∛(k − ax)
            const a = choose([1, 2, 3]);
            const x0 = choose([1, 2]);
            const extra = randInt(2, 7);
            const k = x0 ** 3 + a * x0 + extra; // ensures f(x0) = −extra < 0 so x0 < root
            const x1 = Math.cbrt(k - a * x0);   // = Math.cbrt(x0³ + extra)
            const answer = x1.toFixed(3);

            const aStr = a === 1 ? '' : `${a}`;
            const iterFormula = `x_{n+1} = \\sqrt[3]{${k} - ${aStr}x_n}`;
            const fStr = formatCubic(0, a, -k);

            const phrasing = choose([
                `\\text{The equation } f(x) = ${fStr} \\text{ has a root near } x = ${x0}. \\ \\\\ \\text{Using the iterative formula } ${iterFormula} \\text{ with } x_0 = ${x0}, \\text{ find } x_1 \\text{ to 3 d.p.}`,
                `\\text{The iterative formula } ${iterFormula} \\text{ is used to find a root of } ${fStr} = 0. \\ \\\\ \\text{Starting from } x_0 = ${x0}, \\text{ calculate } x_1 \\text{ to 3 d.p.}`,
                `\\text{Use the recurrence relation } ${iterFormula} \\text{ with starting value } x_0 = ${x0}. \\\\ \\text{Calculate } x_1 \\text{ to 3 d.p.}`,
                `\\text{Given the iterative sequence defined by } ${iterFormula} \\text{ and } x_0 = ${x0}, \\\\ \\text{find the value of } x_1 \\text{ to 3 d.p.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    Math.cbrt(k - a * (x0 + 1)).toFixed(3), // wrong x0
                    Math.cbrt(k - a * x0 + 1).toFixed(3),   // off-by-one inside
                    Math.cbrt(k + a * x0).toFixed(3),        // added instead of subtracted
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            // Fixed-point iteration: x_{n+1} = ∛(k − a·xₙ), find x₃
            const a = choose([1, 2, 3]);
            const x0 = choose([1, 2]);
            const extra = randInt(2, 7);
            const k = x0 ** 3 + a * x0 + extra;
            const iterate = (x: number) => Math.cbrt(k - a * x);
            const x1 = iterate(x0);
            const x2 = iterate(x1);
            const x3 = iterate(x2);
            const answer = x3.toFixed(3);

            const aStr = a === 1 ? '' : `${a}`;
            const iterFormula = `x_{n+1} = \\sqrt[3]{${k} - ${aStr}x_n}`;
            const fStr = formatCubic(0, a, -k);

            const phrasing = choose([
                `\\text{Using the iterative formula } ${iterFormula} \\text{ with } x_0 = ${x0}, \\text{ find } x_3 \\text{ to 3 d.p.}`,
                `\\text{The iterative formula } ${iterFormula} \\text{ approximates a root of } ${fStr} = 0. \\ \\\\ \\text{Starting with } x_0 = ${x0}, \\text{ find } x_3 \\text{ to 3 d.p.}`,
                `\\text{Given } ${iterFormula} \\text{ with } x_0 = ${x0}, \\text{ calculate } x_3 \\text{ to 3 d.p.}`,
                `\\text{Use the recurrence } ${iterFormula} \\text{ with starting value } x_0 = ${x0} \\text{ to obtain } x_3 \\ \\text{ to 3 d.p.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    x1.toFixed(3),   // stopped after 1 iteration
                    x2.toFixed(3),   // stopped after 2 iterations
                    iterate(x3).toFixed(3), // did 4 iterations instead
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            // Newton-Raphson: f(x) = x³ + ax + b, find x₁
            let a = 0;
            let b = 0;
            let x0 = 1;
            let x1 = 0;
            let guard = 0;

            do {
                a = randInt(-3, 4);
                b = nonZeroInt(-8, 8);
                x0 = choose([1, 2, -1]);
                const fx0 = x0 ** 3 + a * x0 + b;
                const dfx0 = 3 * x0 ** 2 + a;
                x1 = x0 - fx0 / dfx0;
                guard++;
            } while ((Math.abs(3 * x0 ** 2 + a) < 1 || Math.abs(x1 - x0) < 0.05) && guard < 100);

            const fStr = formatCubic(0, a, b);
            const answer = x1.toFixed(3);

            const fx0 = x0 ** 3 + a * x0 + b;
            const dfx0 = 3 * x0 ** 2 + a;
            const wrongDeriv1 = (x0 - fx0 / (3 * x0 ** 2)).toFixed(3);           // forgot +a in f'
            const wrongSign   = (x0 + fx0 / dfx0).toFixed(3);                     // added instead of subtracted
            const wrongFx     = (x0 - (x0 ** 3 + a * x0) / dfx0).toFixed(3);     // forgot constant b

            const phrasing = choose([
                `\\text{Use the Newton-Raphson method once, starting from } x_0 = ${x0}, \\text{ to find } x_1 \\text{ for } f(x) = ${fStr}.\\ \\\\ \\text{Give your answer to 3 d.p.}`,
                `\\text{Given } f(x) = ${fStr}, \\text{ apply one Newton-Raphson step with } x_0 = ${x0} \\text{ to find } x_1 \\text{ to 3 d.p.}`,
                `\\text{The Newton-Raphson formula is } x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}. \\ \\\\ \\text{Given } f(x) = ${fStr} \\text{ and } x_0 = ${x0}, \\text{ find } x_1 \\text{ to 3 d.p.}`,
                `\\text{For } f(x) = ${fStr}, \\text{ perform one Newton-Raphson iteration from } x_0 = ${x0}. \\ \\\\ \\text{Find } x_1 \\text{ to 3 d.p.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                equalValue: true,
                options: buildOptions(answer, [wrongDeriv1, wrongSign, wrongFx]),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            // Newton-Raphson: iterate to convergence, find root to 3 d.p.
            let a = 0;
            let b = 0;
            let x0 = 1;
            let root = 0;
            let valid = false;
            let guard = 0;

            do {
                a = choose([-3, -2, -1, 1, 2, 3]);
                b = choose([-9, -8, -7, -6, 5, 6, 7, 8, 9]);
                x0 = choose([1, 2, -1, -2]);

                let x = x0;
                let converged = false;
                for (let iter = 0; iter < 100; iter++) {
                    const fx = x ** 3 + a * x + b;
                    const dfx = 3 * x ** 2 + a;
                    if (Math.abs(dfx) < 1e-10) break;
                    const xNext = x - fx / dfx;
                    if (Math.abs(xNext - x) < 5e-7) {
                        root = xNext;
                        converged = true;
                        break;
                    }
                    x = xNext;
                }

                if (converged && Math.abs(root - Math.round(root)) > 0.05) {
                    const fRoot = root ** 3 + a * root + b;
                    if (Math.abs(fRoot) < 0.001) {
                        valid = true;
                    }
                }
                guard++;
            } while (!valid && guard < 200);

            const fStr = formatCubic(0, a, b);
            const answer = root.toFixed(3);

            // Distractors: one step only, wrong derivative, slightly wrong
            const x1FromX0 = x0 - (x0 ** 3 + a * x0 + b) / (3 * x0 ** 2 + a);

            let wrongRoot = 0;
            let wX = x0;
            for (let iter = 0; iter < 50; iter++) {
                const fx = wX ** 3 + a * wX + b;
                const dfx = 2 * wX ** 2 + a; // wrong: 2x² instead of 3x²
                if (Math.abs(dfx) < 1e-10) break;
                const wXNext = wX - fx / dfx;
                if (Math.abs(wXNext - wX) < 5e-7) { wrongRoot = wXNext; break; }
                wX = wXNext;
            }

            const phrasing = choose([
                `\\text{Use the Newton-Raphson method, starting with } x_0 = ${x0}, \\text{ to find a root of } f(x) = ${fStr}. \\ \\\\ \\text{Give your answer to 3 d.p.}`,
                `\\text{Apply Newton-Raphson with } x_0 = ${x0} \\text{ to find a root of } ${fStr} = 0 \\text{ to 3 d.p.}`,
                `\\text{The equation } ${fStr} = 0 \\text{ has a root near } x = ${x0}. \\ \\text{ Use Newton-Raphson to find this root to 3 d.p.}`,
                `\\text{Starting from } x_0 = ${x0}, \\text{ use the Newton-Raphson formula to find a root of } f(x) = ${fStr} \\text{ to 3 d.p.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    x1FromX0.toFixed(3),
                    wrongRoot !== 0 ? wrongRoot.toFixed(3) : (root + 0.1).toFixed(3),
                    (root + 0.001).toFixed(3),
                ], () => (root + (randInt(1, 9) * 0.01)).toFixed(3)),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5]),
    "binomial-expansion": createGenerator(async ({ difficulty }) => {
        const termToLatex = (coefficient: number, power: number): string => {
            return formatDifferentiationTerm({ coefficient: rational(coefficient), power: rational(power) });
        };

        const termsToLatex = (terms: Array<{ coefficient: number; power: number }>): string => {
            const formatted = terms
                .map(({ coefficient, power }) => termToLatex(coefficient, power))
                .filter((part) => part !== '0');
            return joinExpressionParts(formatted);
        };

        const expandLinearPower = (a: number, b: number, n: number): string => {
            const terms: Array<{ coefficient: number; power: number }> = [];

            for (let k = 0; k <= n; k += 1) {
                const coefficient = nCr(n, k) * (a ** (n - k)) * (b ** k);
                const power = n - k;
                terms.push({ coefficient, power });
            }

            return termsToLatex(terms);
        };

        const generalisedCoefficient = (nValue: Rational, k: number): Rational => {
            let coefficient = rational(1);

            for (let i = 0; i < k; i += 1) {
                const factor = rational(nValue.numerator - i * nValue.denominator, nValue.denominator);
                coefficient = multiplyRational(coefficient, factor);
                coefficient = multiplyRational(coefficient, rational(1, i + 1));
            }

            return coefficient;
        };

        const scaleRationalByIntPower = (value: Rational, base: number, power: number): Rational => {
            return multiplyRational(value, rational(base ** power));
        };

        const rationalToNumber = (value: Rational): number => value.numerator / value.denominator;

        const formatBinomialPower = (nValue: Rational): string => {
            if (nValue.denominator === 1) return `${nValue.numerator}`;
            return nValue.numerator < 0
                ? `-\\frac{${Math.abs(nValue.numerator)}}{${nValue.denominator}}`
                : `\\frac{${nValue.numerator}}{${nValue.denominator}}`;
        };

        const generalisedTermsToLatex = (nValue: Rational, m: number, upToPower: number): string => {
            const terms: DifferentiationTerm[] = [];

            for (let k = 0; k <= upToPower; k += 1) {
                const coeff = scaleRationalByIntPower(generalisedCoefficient(nValue, k), m, k);
                terms.push({
                    coefficient: coeff,
                    power: rational(k),
                });
            }

            return formatDifferentiationExpression(sortTermsDescending(terms));
        };

        if (difficulty === 1) {
            const a = choose([2, 3, 4, 5]);
            const sign = Math.random() < 0.5 ? 1 : -1;
            const constant = sign * a;
            const n = choose([3, 4, 5]);

            const answer = expandLinearPower(1, constant, n);
            const wrongSign = expandLinearPower(1, -constant, n);
            const wrongPower = expandLinearPower(1, constant, Math.max(2, n - 1));
            const wrongMixed = expandLinearPower(1, choose([-5, -4, -3, 3, 4, 5]), n);

            const phrasing = choose([
                `\\text{Expand and simplify } (x ${formatSignedNumber(constant)})^{${n}}.`,
                `\\text{Find the full expansion of } (x ${formatSignedNumber(constant)})^{${n}} \\text{ in descending powers of } x.`,
                `\\text{Write } (x ${formatSignedNumber(constant)})^{${n}} \\text{ as a polynomial in } x.`,
                `\\text{Expand } (x ${formatSignedNumber(constant)})^{${n}} \\text{ and collect like terms.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [wrongSign, wrongPower, wrongMixed], () => {
                    const c = choose([-6, -5, -4, -3, 3, 4, 5, 6]);
                    const p = choose([3, 4, 5]);
                    return expandLinearPower(1, c, p);
                }),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const a = choose([2, 3, 4]);
            const b = choose([-5, -4, -3, 2, 3, 4, 5]);
            const n = choose([3, 4, 5]);

            const answer = expandLinearPower(a, b, n);
            const wrongA = expandLinearPower(1, b, n);
            const wrongB = expandLinearPower(a, -b, n);
            const wrongN = expandLinearPower(a, b, Math.max(2, n - 1));

            const phrasing = choose([
                `\\text{Expand and simplify } (${a}x ${formatSignedNumber(b)})^{${n}}.`,
                `\\text{Find the expansion of } (${a}x ${formatSignedNumber(b)})^{${n}} \\text{ in descending powers of } x.`,
                `\\text{Write } (${a}x ${formatSignedNumber(b)})^{${n}} \\text{ as a polynomial in } x.`,
                `\\text{Use the binomial theorem to expand } (${a}x ${formatSignedNumber(b)})^{${n}}.`,
            ]);

            return {
                latex: phrasing,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [wrongA, wrongB, wrongN], () => {
                    const aa = choose([2, 3, 4, 5]);
                    const bb = choose([-6, -5, -4, -3, 3, 4, 5, 6]);
                    const nn = choose([3, 4, 5]);
                    return expandLinearPower(aa, bb, nn);
                }),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const n = choose([5, 6, 7, 8]);
            const a = choose([2, 3, 4]);
            const b = choose([-4, -3, -2, 2, 3, 4]);
            const power = randInt(1, n - 1);
            const k = n - power;
            const coefficient = nCr(n, k) * (a ** power) * (b ** k);
            const answer = `${coefficient}`;

            const adjacentLow = nCr(n, Math.min(n, k + 1)) * (a ** Math.max(0, power - 1)) * (b ** Math.min(n, k + 1));
            const adjacentHigh = nCr(n, Math.max(0, k - 1)) * (a ** Math.min(n, power + 1)) * (b ** Math.max(0, k - 1));
            const signError = Math.abs(coefficient);

            const phrasing = choose([
                `\\text{Find the coefficient of } x^{${power}} \\text{ in the expansion of } (${a}x ${formatSignedNumber(b)})^{${n}}.`,
                `\\text{In } (${a}x ${formatSignedNumber(b)})^{${n}}, \\text{ determine the coefficient of } x^{${power}}.`,
                `\\text{Use the binomial theorem to find the coefficient of } x^{${power}} \\text{ in } (${a}x ${formatSignedNumber(b)})^{${n}}.`,
                `\\text{What is the coefficient of } x^{${power}} \\text{ in } (${a}x ${formatSignedNumber(b)})^{${n}}?`,
            ]);

            return {
                latex: phrasing,
                answer,
                options: buildOptions(answer, [
                    `${adjacentLow}`,
                    `${adjacentHigh}`,
                    `${signError}`,
                ], () => `${coefficient + randInt(-60, 60)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const nValue = choose([rational(-2), rational(-3), rational(-1, 2), rational(1, 2)]);
            const m = choose([-3, -2, 2, 3]);
            const answer = generalisedTermsToLatex(nValue, m, 3);

            const wrongSign = generalisedTermsToLatex(nValue, -m, 3);
            const wrongIndex = generalisedTermsToLatex(rational(nValue.numerator + nValue.denominator, nValue.denominator), m, 3);
            const wrongNoScale = generalisedTermsToLatex(nValue, 1, 3);

            const phrasing = choose([
                `\\text{Find the first four terms in ascending powers of } x \\text{ for } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}}.`,
                `\\text{Expand } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\text{ up to and including the term in } x^3.`,
                `\\text{Using the binomial expansion for fractional/negative powers, write } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\text{ up to } x^3.`,
                `\\text{Obtain the first four terms of } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\text{ in ascending powers of } x.`,
            ]);

            return {
                latex: `${phrasing} \\ \\text{(Assume } |${m}x| < 1 \\ \\text{ where needed.)}`,
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [wrongSign, wrongIndex, wrongNoScale], () => {
                    const nn = choose([rational(-2), rational(-1, 2), rational(1, 2)]);
                    const mm = choose([-3, -2, 2, 3]);
                    return generalisedTermsToLatex(nn, mm, 3);
                }),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const nValue = choose([rational(-2), rational(-1, 2), rational(1, 2), rational(3, 2)]);
            const m = choose([-3, -2, 2, 3]);
            const xValue = choose([0.05, -0.05, 0.1, -0.1]);
            const mx = m * xValue;

            const c1 = rationalToNumber(generalisedCoefficient(nValue, 1));
            const c2 = rationalToNumber(generalisedCoefficient(nValue, 2));
            const c3 = rationalToNumber(generalisedCoefficient(nValue, 3));

            const approximation = 1 + c1 * mx + c2 * (mx ** 2) + c3 * (mx ** 3);
            const answer = approximation.toFixed(4);

            const twoTerm = (1 + c1 * mx + c2 * (mx ** 2)).toFixed(4);
            const wrongSign = (1 - c1 * mx + c2 * (mx ** 2) - c3 * (mx ** 3)).toFixed(4);
            const exact = ((1 + mx) ** (nValue.numerator / nValue.denominator)).toFixed(4);

            const phrasing = choose([
                `\\text{Use the first four terms of the binomial expansion to estimate } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\ \\text{ when } x = ${xValue}.`,
                `\\text{Given } f(x) = (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}}, \\text{ use a binomial expansion up to } x^3 \\text{ to estimate } f(${xValue}).`,
                `\\text{Apply a binomial approximation (up to the term in } x^3\\text{) to find an estimate for } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\text{ at } x=${xValue}.`,
                `\\text{Using binomial expansion terms up to } x^3, \\text{ estimate } (1 ${m >= 0 ? `+ ${m}x` : `- ${Math.abs(m)}x`})^{${formatBinomialPower(nValue)}} \\text{ for } x=${xValue}. \\`,
            ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 4 d.p.}`,
                answer,
                equalValue: true,
                options: buildOptions(answer, [twoTerm, wrongSign, exact], () => {
                    return (approximation + randInt(-30, 30) / 1000).toFixed(4);
                }),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5]),
    "sequences-and-series": createGenerator(async ({ difficulty }) => {
        const formatLinearInN = (coefficient: number, constant: number): string => {
            if (coefficient === 0) return `${constant}`;

            let expression = coefficient === 1 ? 'n' : coefficient === -1 ? '-n' : `${coefficient}n`;
            if (constant > 0) expression += ` + ${constant}`;
            if (constant < 0) expression += ` - ${Math.abs(constant)}`;
            return expression;
        };

        const formatArithmeticRule = (firstTerm: number, difference: number): string => {
            return `u_n = ${formatLinearInN(difference, firstTerm - difference)}`;
        };

        const formatGeometricRule = (firstTerm: number, ratio: number, exponent = 'n-1'): string => {
            return `u_n = ${firstTerm}(${ratio})^{${exponent}}`;
        };

        const formatRationalOption = (value: Rational): string => {
            if (value.denominator === 1) return `${value.numerator}`;
            return `\\frac{${value.numerator}}{${value.denominator}}`;
        };

        if (difficulty === 1) {
            const mode = choose(['arithmetic', 'geometric'] as const);

            if (mode === 'arithmetic') {
                const firstTerm = choose([-9, -8, -7, -6, -5, -4, -3, 2, 3, 4, 5, 6, 7, 8, 9]);
                const difference = choose([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
                const terms = Array.from({ length: 4 }, (_, index) => firstTerm + index * difference);

                const answer = formatArithmeticRule(firstTerm, difference);
                const wrongShift = `u_n = ${formatLinearInN(difference, firstTerm + difference)}`;
                const wrongSign = formatArithmeticRule(firstTerm, -difference);
                const wrongSwap = `u_n = ${formatLinearInN(firstTerm, difference)}`;

                return {
                    latex: choose([
                        `\\text{The first four terms of a sequence are } ${terms.join(', ')}. \\ \\text{Which equation correctly defines } u_n \\text{?}`,
                        `\\text{A sequence begins } ${terms.join(', ')}. \\ \\text{Choose the correct formula for } u_n \\text{.}`,
                        `\\text{An arithmetic sequence has first terms } ${terms.join(', ')}. \\ \\text{Which option gives the correct } n \\text{th term?}`,
                        `\\text{An arithmetic sequence starts with } ${terms.join(', ')}. \\ \\text{Select the correct expression for } u_n \\text{.}`,
                    ]),
                    answer,
                    options: buildOptions(answer, [wrongShift, wrongSign, wrongSwap], () => {
                        const a = choose([-8, -6, -4, -3, 2, 3, 4, 5, 6, 8]);
                        const d = choose([-5, -4, -3, -2, 2, 3, 4, 5]);
                        return formatArithmeticRule(a, d);
                    }),
                    forceOption: 2,
                };
            }

            const firstTerm = choose([-6, -5, -4, -3, 2, 3, 4, 5, 6]);
            const ratio = choose([-3, -2, 2, 3]);
            const terms = Array.from({ length: 4 }, (_, index) => firstTerm * (ratio ** index));

            const answer = formatGeometricRule(firstTerm, ratio, 'n-1');
            const wrongPower = formatGeometricRule(firstTerm, ratio, 'n');
            const wrongFirst = formatGeometricRule(firstTerm * ratio, ratio, 'n-1');
            const wrongRatio = formatGeometricRule(firstTerm, -ratio, 'n-1');

            return {
                latex: choose([
                    `\\text{The first four terms of a sequence are } ${terms.join(', ')}. \\ \\ \\text{Which equation correctly defines } u_n \\text{?}`,
                    `\\text{A sequence begins } ${terms.join(', ')}. \\ \\text{Choose the correct formula for } u_n \\text{.}`,
                    `\\text{A geometric sequence has first terms } ${terms.join(', ')}. \\ \\text{Which option gives the correct } n \\text{th term?}`,
                    `\\text{A geometric sequence starts with } ${terms.join(', ')}. \\ \\text{Select the correct expression for } u_n \\text{.}`,
                ]),
                answer,
                options: buildOptions(answer, [wrongPower, wrongFirst, wrongRatio], () => {
                    const a = choose([-5, -4, -3, 2, 3, 4, 5]);
                    const r = choose([-3, -2, 2, 3]);
                    return formatGeometricRule(a, r, 'n-1');
                }),
                forceOption: 2,
            };
        }

        if (difficulty === 2) {
            const firstTerm = choose([-12, -10, -8, -6, -4, 3, 4, 5, 6, 8, 10, 12]);
            const difference = choose([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
            const nValue = randInt(12, 28);
            const answerValue = firstTerm + (nValue - 1) * difference;
            const answer = `${answerValue}`;

            const wrongN = `${firstTerm + nValue * difference}`;
            const wrongSign = `${firstTerm - (nValue - 1) * difference}`;
            const wrongBefore = `${firstTerm + (nValue - 2) * difference}`;

            return {
                latex: choose([
                    `\\text{An arithmetic sequence has first term } ${firstTerm} \\text{ and common difference } ${difference}. \\ \\text{Find } u_{${nValue}}\\text{.}`,
                    `\\text{Given } u_1=${firstTerm} \\text{ and } d=${difference} \\text{ for an arithmetic sequence, calculate } u_{${nValue}}\\text{.}`,
                    `\\text{For an arithmetic progression with } a=${firstTerm} \\text{ and } d=${difference}, \\text{ work out the value of the } ${nValue}^{\\text{th}} \\text{ term.}`,
                    `\\text{A sequence is arithmetic with } u_1=${firstTerm}, d=${difference}. \\ \\text{Find } u_{${nValue}}\\text{.}`,
                ]),
                answer,
                options: buildOptions(answer, [wrongN, wrongSign, wrongBefore], () => `${answerValue + randInt(-40, 40)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const firstTerm = choose([-5, -4, -3, -2, 2, 3, 4, 5]);
            const ratio = choose([-3, -2, 2, 3]);
            const nValue = randInt(5, 8);
            const answerValue = firstTerm * (ratio ** (nValue - 1));
            const answer = `${answerValue}`;

            const wrongN = `${firstTerm * (ratio ** nValue)}`;
            const wrongPrev = `${firstTerm * (ratio ** (nValue - 2))}`;
            const wrongAbs = `${firstTerm * ((Math.abs(ratio)) ** (nValue - 1))}`;

            return {
                latex: choose([
                    `\\text{A geometric sequence has first term } ${firstTerm} \\text{ and common ratio } ${ratio}. \\ \\text{Find } u_{${nValue}}\\text{.}`,
                    `\\text{Given } u_1=${firstTerm} \\text{ and } r=${ratio}, \\text{ calculate the } ${nValue}^{\\text{th}} \\text{ term of the geometric sequence.}`,
                    `\\text{For a geometric progression with } a=${firstTerm} \\text{ and } r=${ratio}, \\text{ work out } u_{${nValue}}\\text{.}`,
                    `\\text{A sequence is geometric with } u_1=${firstTerm}, r=${ratio}. \\ \\text{Find } u_{${nValue}}\\text{.}`,
                ]),
                answer,
                options: buildOptions(answer, [wrongN, wrongPrev, wrongAbs], () => `${answerValue + randInt(-120, 120)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const firstTerm = choose([-10, -8, -6, -4, 3, 4, 5, 6, 8, 10]);
            const difference = choose([-5, -4, -3, -2, 2, 3, 4, 5]);
            const nValue = choose([10, 12, 14, 16, 18, 20]);

            const sum = (nValue * (2 * firstTerm + (nValue - 1) * difference)) / 2;
            const answer = `${sum}`;

            const wrongNoHalf = `${nValue * (2 * firstTerm + (nValue - 1) * difference)}`;
            const wrongNd = `${(nValue * (2 * firstTerm + nValue * difference)) / 2}`;
            const lastTerm = firstTerm + (nValue - 1) * difference;
            const wrongNoHalfAL = `${nValue * (firstTerm + lastTerm)}`;

            return {
                latex: choose([
                    `\\text{An arithmetic series has first term } ${firstTerm} \\text{ and common difference } ${difference}. \\ \\text{Find } S_{${nValue}}\\text{.}`,
                    `\\text{Given an arithmetic progression with } a=${firstTerm},\\ d=${difference}, \\text{ calculate the sum of the first } ${nValue} \\text{ terms.}`,
                    `\\text{For an arithmetic series where } u_1=${firstTerm} \\text{ and } d=${difference}, \\text{ work out } S_{${nValue}}\\text{.}`,
                    `\\text{Find the sum of the first } ${nValue} \\text{ terms of an arithmetic sequence with } a=${firstTerm} \\text{ and } d=${difference}.`,
                ]),
                answer,
                options: buildOptions(answer, [wrongNoHalf, wrongNd, wrongNoHalfAL], () => `${sum + randInt(-200, 200)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const firstTerm = choose([2, 3, 4, 5, 6, 8, 9, 10, 12]);
            const [ratioNumerator, ratioDenominator] = choose([
                [1, 2],
                [2, 3],
                [3, 4],
                [-1, 2],
                [-2, 3],
            ] as const);

            const ratioDisplay = `\\frac{${ratioNumerator}}{${ratioDenominator}}`;

            const answerRational = simplifyRational(
                firstTerm * ratioDenominator,
                ratioDenominator - ratioNumerator
            );
            const answerFraction = formatRationalOption(answerRational);
            const answerDecimal = (answerRational.numerator / answerRational.denominator).toFixed(3);

            const wrongPlusRational = simplifyRational(
                firstTerm * ratioDenominator,
                ratioDenominator + ratioNumerator
            );
            const wrongPartialRational = simplifyRational(
                firstTerm * (ratioDenominator + ratioNumerator),
                ratioDenominator
            );
            const wrongFraction = `${firstTerm}`;

            return {
                latex: choose([
                    `\\text{A geometric series has first term } ${firstTerm} \\text{ and common ratio } ${ratioDisplay}. \\ \\text{Given } |r|<1, \\text{ find } S_{\\infty}.`,
                    `\\text{For a geometric progression with } a=${firstTerm} \\text{ and } r=${ratioDisplay}, \\text{ calculate the sum to infinity.}`,
                    `\\text{Given } u_1=${firstTerm} \\text{ and common ratio } r=${ratioDisplay} \\text{ with } |r|<1, \\text{ work out } S_{\\infty}.`,
                    `\\text{Find the sum to infinity of a geometric series where } a=${firstTerm} \\text{ and } r=${ratioDisplay}.`,
                ]),
                answer: [answerFraction, answerDecimal],
                equalValue: true,
                options: buildOptions(answerFraction, [
                    formatRationalOption(wrongPlusRational),
                    formatRationalOption(wrongPartialRational),
                    wrongFraction,
                ], () => {
                    const offset = randInt(-6, 6);
                    const variant = simplifyRational(answerRational.numerator + offset, answerRational.denominator);
                    return formatRationalOption(variant);
                }),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5]),
    "integration": createGenerator(async ({ difficulty }) => {
        const formatSignedLinearBracket = (coefficient: number, constant: number): string => {
            let expression = coefficient === 1 ? 'x' : coefficient === -1 ? '-x' : `${coefficient}x`;

            if (constant > 0) expression += ` + ${constant}`;
            if (constant < 0) expression += ` - ${Math.abs(constant)}`;

            return expression;
        };

        const simplifyNumber = (value: number): string => {
            if (Math.abs(value - Math.round(value)) < 1e-9) {
                return `${Math.round(value)}`;
            }

            return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
        };

        const formatTrigTerm = (coefficient: number, trig: 'sin' | 'cos'): string => {
            if (coefficient === 0) return '';
            const absCoefficient = Math.abs(coefficient);
            const coeffPart = absCoefficient === 1 ? '' : `${absCoefficient}`;
            const trigPart = trig === 'sin' ? '\\sin x' : '\\cos x';
            return coefficient < 0 ? `-${coeffPart}${trigPart}` : `${coeffPart}${trigPart}`;
        };

        const joinTerms = (parts: string[]): string => {
            return parts.reduce((expression, part, index) => {
                if (index === 0) return part;
                if (part.startsWith('-')) {
                    return `${expression} - ${part.slice(1)}`;
                }
                return `${expression} + ${part}`;
            }, '');
        };

        const buildLogIntegralAnswer = (numerator: number, denominatorCoeff: number, denominatorConst: number): string => {
            const scalar = numerator / denominatorCoeff;
            const scalarPart = Math.abs(scalar) === 1
                ? (scalar < 0 ? '-' : '')
                : simplifyNumber(scalar);
            return `${scalarPart}\\ln|${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}| + C`;
        };

        const buildLogTerm = (numerator: number, denominatorCoeff: number, denominatorConst: number): string => {
            return buildLogIntegralAnswer(numerator, denominatorCoeff, denominatorConst).replace(' + C', '');
        };

        const buildLogTermWithoutAbs = (numerator: number, denominatorCoeff: number, denominatorConst: number): string => {
            const scalar = numerator / denominatorCoeff;
            const scalarPart = Math.abs(scalar) === 1
                ? (scalar < 0 ? '-' : '')
                : simplifyNumber(scalar);
            return `${scalarPart}\\ln(${formatSignedLinearBracket(denominatorCoeff, denominatorConst)})`;
        };

        const integrateTerms = (terms: DifferentiationTerm[]): DifferentiationTerm[] => {
            return terms.map((term) => {
                const newPower = rational(term.power.numerator + term.power.denominator, term.power.denominator);
                return {
                    coefficient: multiplyRational(term.coefficient, rational(newPower.denominator, newPower.numerator)),
                    power: newPower,
                };
            });
        };

        const formatIntegralExpression = (terms: DifferentiationTerm[], constantLabel = 'C'): string => {
            const expression = formatDifferentiationExpression(sortTermsDescending(terms));
            return expression === '0' ? constantLabel : `${expression} + ${constantLabel}`;
        };

        const buildIntegralDistractor = (
            terms: DifferentiationTerm[],
            mode: 'noDivide' | 'keepPower' | 'signError'
        ): string => {
            const transformed = sortTermsDescending(terms.map((term) => {
                const newPower = rational(term.power.numerator + term.power.denominator, term.power.denominator);

                if (mode === 'noDivide') {
                    return {
                        coefficient: term.coefficient,
                        power: newPower,
                    };
                }

                if (mode === 'keepPower') {
                    return {
                        coefficient: multiplyRational(term.coefficient, rational(newPower.denominator, newPower.numerator)),
                        power: term.power,
                    };
                }

                return {
                    coefficient: multiplyRational(term.coefficient, rational(-newPower.denominator, newPower.numerator)),
                    power: newPower,
                };
            }));

            return formatIntegralExpression(transformed);
        };

        const formatNumericAnswer = (value: number): string => {
            if (Math.abs(value - Math.round(value)) < 1e-9) {
                return `${Math.round(value)}`;
            }

            return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
        };

        const evaluateTerms = (terms: DifferentiationTerm[], xValue: number): number => {
            return terms.reduce((total, term) => total + evaluateTermAt(term, xValue), 0);
        };

        if (difficulty === 1) {
            const termCount = randInt(2, 4);
            const powers = randomDistinctPowers([1, 2, 3, 4, 5].map((power) => rational(power)), termCount);
            const terms = sortTermsDescending(powers.map((power) => ({
                coefficient: rational(nonZeroInt(-8, 8)),
                power,
            })));

            if (Math.random() < 0.5) {
                terms.push({ coefficient: rational(nonZeroInt(-6, 6)), power: rational(0) });
            }

            const answerTerms = integrateTerms(terms);
            const answer = formatIntegralExpression(answerTerms);

            return {
                latex: choose([
                    `\\text{Find } \\int (${formatDifferentiationExpression(terms)}) \\, dx.`,
                    `\\text{Integrate with respect to } x:\\ ${formatDifferentiationExpression(terms)}`,
                    `\\text{Find an antiderivative of } ${formatDifferentiationExpression(terms)} \\text{ with respect to } x.`,
                    `\\text{Given } \\frac{dy}{dx} = ${formatDifferentiationExpression(terms)}, \\text{ find } y.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                lowercaseCheck: true,
                options: buildOptions(answer, [
                    buildIntegralDistractor(terms, 'noDivide'),
                    buildIntegralDistractor(terms, 'keepPower'),
                    buildIntegralDistractor(terms, 'signError'),
                ], () => formatIntegralExpression(integrateTerms(sortTermsDescending(
                    randomDistinctPowers(
                        [1, 2, 3, 4].map((power) => rational(power)),
                        randInt(2, 3)
                    ).map((power) => ({
                        coefficient: rational(nonZeroInt(-6, 6)),
                        power,
                    }))
                )))),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const powerPool = [
                rational(-3),
                rational(-2),
                rational(-1, 2),
                rational(1, 2),
                rational(1),
                rational(3, 2),
                rational(2),
                rational(5, 2),
                rational(3),
            ];
            const termCount = randInt(2, 4);
            const powers = randomDistinctPowers(powerPool, termCount);
            const terms = sortTermsDescending(powers.map((power) => ({
                coefficient: rational(nonZeroInt(-8, 8)),
                power,
            })));

            const answerTerms = integrateTerms(terms);
            const answer = formatIntegralExpression(answerTerms);

            return {
                latex: choose([
                    `\\text{Integrate with respect to } x:\\ ${formatDifferentiationExpression(terms)}`,
                    `\\text{Find } \\int (${formatDifferentiationExpression(terms)}) \\, dx.`,
                    `\\text{Find an antiderivative of } ${formatDifferentiationExpression(terms)} \\text{ with respect to } x.`,
                    `\\text{Given } \\frac{dy}{dx} = ${formatDifferentiationExpression(terms)}, \\text{ find } y.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                lowercaseCheck: true,
                options: buildOptions(answer, [
                    buildIntegralDistractor(terms, 'noDivide'),
                    buildIntegralDistractor(terms, 'keepPower'),
                    buildIntegralDistractor(terms, 'signError'),
                ], () => formatIntegralExpression(integrateTerms(sortTermsDescending(
                    randomDistinctPowers(
                        powerPool,
                        randInt(2, 3)
                    ).map((power) => ({
                        coefficient: rational(nonZeroInt(-6, 6)),
                        power,
                    }))
                )))),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const termCount = randInt(2, 4);
            const powers = randomDistinctPowers([0, 1, 2, 3, 4].map((power) => rational(power)), termCount);
            const terms = sortTermsDescending(powers.map((power) => ({
                coefficient: rational(nonZeroInt(-7, 7)),
                power,
            })));
            const lowerBound = choose([0, 1]);
            const upperBound = choose([2, 3]);
            const antiderivativeTerms = integrateTerms(terms);
            const answerValue = evaluateTerms(antiderivativeTerms, upperBound) - evaluateTerms(antiderivativeTerms, lowerBound);
            const answer = formatNumericAnswer(answerValue);

            return {
                latex: choose([
                    `\\text{Evaluate } \\int_{${lowerBound}}^{${upperBound}} (${formatDifferentiationExpression(terms)}) \\, dx.`,
                    `\\text{Find the exact value of } \\int_{${lowerBound}}^{${upperBound}} ${formatDifferentiationExpression(terms)} \\, dx.`,
                    `\\text{Calculate } \\int_{${lowerBound}}^{${upperBound}} (${formatDifferentiationExpression(terms)}) \\, dx.`,
                    `\\text{Work out the definite integral } \\int_{${lowerBound}}^{${upperBound}} (${formatDifferentiationExpression(terms)}) \\, dx.`,
                ]),
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    formatNumericAnswer(evaluateTerms(antiderivativeTerms, upperBound)),
                    formatNumericAnswer(evaluateTerms(antiderivativeTerms, lowerBound) - evaluateTerms(antiderivativeTerms, upperBound)),
                    formatNumericAnswer(answerValue + randInt(-6, 6)),
                ], () => formatNumericAnswer(answerValue + randInt(-12, 12))),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const rootA = randInt(1, 3);
            const rootB = rootA + randInt(1, 3);
            const scale = choose([1, 2, 3]);
            const quadraticTerms: DifferentiationTerm[] = [
                { coefficient: rational(scale), power: rational(2) },
                { coefficient: rational(-scale * (rootA + rootB)), power: rational(1) },
                { coefficient: rational(scale * rootA * rootB), power: rational(0) },
            ];
            const integrand = formatDifferentiationExpression(quadraticTerms);
            const antiderivativeTerms = integrateTerms(quadraticTerms);
            const answerValue = evaluateTerms(antiderivativeTerms, rootB) - evaluateTerms(antiderivativeTerms, rootA);
            const answer = formatNumericAnswer(answerValue);

            return {
                latex: choose([
                    `\\text{The curve } y=${integrand} \\text{ crosses the } x\\text{-axis at } x=${rootA} \\text{ and } x=${rootB}. \\ \\text{Find the area enclosed between the curve and the } x\\text{-axis.}`,
                    `\\text{Find the area between } y=${integrand} \\text{ and the } x\\text{-axis from } x=${rootA} \\text{ to } x=${rootB}.`,
                    `\\text{Calculate the exact area bounded by } y=${integrand}, \\ x=${rootA}, \\ x=${rootB} \\text{ and the } x\\text{-axis.}`,
                    `\\text{Find the area of the finite region enclosed by } y=${integrand} \\text{ and the } x\\text{-axis between } x=${rootA} \\text{ and } x=${rootB}.`,
                ]),
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    formatNumericAnswer(answerValue / 2),
                    formatNumericAnswer(-answerValue),
                    formatNumericAnswer(answerValue + randInt(1, 8)),
                ], () => formatNumericAnswer(answerValue + randInt(-10, 10))),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const xPoint = choose([-2, -1, 1, 2]);
            const constantOfIntegration = nonZeroInt(-8, 8);
            const termCount = randInt(2, 3);
            const powers = randomDistinctPowers([1, 2, 3, 4].map((power) => rational(power)), termCount);
            const derivativeTerms = sortTermsDescending(powers.map((power) => ({
                coefficient: rational(nonZeroInt(-6, 6)),
                power,
            })));
            const antiderivativeTerms = integrateTerms(derivativeTerms);
            const yPoint = evaluateTerms(antiderivativeTerms, xPoint) + constantOfIntegration;
            const answer = formatIntegralExpression([
                ...antiderivativeTerms,
                { coefficient: rational(constantOfIntegration), power: rational(0) },
            ], '');

            const answerWithoutTrailing = answer.replace(/ \+ $/, '').replace(/ \+\s*$/, '');
            const wrongConstant = formatIntegralExpression([
                ...antiderivativeTerms,
                { coefficient: rational(-constantOfIntegration), power: rational(0) },
            ], '').replace(/ \+ $/, '').replace(/ \+\s*$/, '');
            const wrongNoConstant = formatDifferentiationExpression(sortTermsDescending(antiderivativeTerms));
            const wrongNoDivide = formatDifferentiationExpression(sortTermsDescending(derivativeTerms.map((term) => ({
                coefficient: term.coefficient,
                power: rational(term.power.numerator + term.power.denominator, term.power.denominator),
            }))));

            return {
                latex: choose([
                    `\\text{Given } \\frac{dy}{dx} = ${formatDifferentiationExpression(derivativeTerms)} \\text{ and the curve passes through } (${xPoint}, ${formatNumericAnswer(yPoint)}), \\text{ find } y.`,
                    `\\text{A curve satisfies } \\frac{dy}{dx} = ${formatDifferentiationExpression(derivativeTerms)} \\text{ and passes through } (${xPoint}, ${formatNumericAnswer(yPoint)}). \\ \\text{Find the equation of the curve.}`,
                    `\\text{Find the function } y \\text{ if } \\frac{dy}{dx} = ${formatDifferentiationExpression(derivativeTerms)} \\text{ and } y=${formatNumericAnswer(yPoint)} \\text{ when } x=${xPoint}.`,
                    `\\text{The derivative of a curve is } ${formatDifferentiationExpression(derivativeTerms)}. \\text{Given that the curve goes through } (${xPoint}, ${formatNumericAnswer(yPoint)}), \\text{ determine } y.`,
                ]),
                answer: [answerWithoutTrailing, answerWithoutTrailing.replace(/\+\s/g, '+').replace(/-\s/g, '-')],
                checkWeakLatexEquivalent: true,
                options: buildOptions(answerWithoutTrailing, [
                    wrongConstant,
                    wrongNoConstant,
                    wrongNoDivide,
                ], () => wrongNoConstant),
                forceOption: 0,
            };
        }

        if (difficulty === 6) {
            const denominatorCoeff = choose([1, 2, 3, 4]);
            const denominatorConst = choose([-7, -5, -3, -2, 2, 3, 5, 7]);
            const scalar = choose([-4, -3, -2, -1, 1, 2, 3, 4]);
            const numerator = scalar * denominatorCoeff;
            const answer = buildLogIntegralAnswer(numerator, denominatorCoeff, denominatorConst);
            const wrongNoDivide = `${buildLogTerm(numerator * denominatorCoeff, denominatorCoeff, denominatorConst)} + C`;
            const wrongNoAbs = `${buildLogTermWithoutAbs(numerator, denominatorCoeff, denominatorConst)} + C`;
            const wrongSign = buildLogIntegralAnswer(-numerator, denominatorCoeff, denominatorConst);

            return {
                latex: choose([
                    `\\text{Find } \\int \\frac{${numerator}}{${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}} \\, dx.`,
                    `\\text{Integrate with respect to } x:\\ \\frac{${numerator}}{${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}}`,
                    `\\text{Given } \\frac{dy}{dx} = \\frac{${numerator}}{${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}}, \\text{ find } y.`,
                    `\\text{Find an antiderivative of } \\frac{${numerator}}{${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}} \\text{ with respect to } x.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                lowercaseCheck: true,
                options: buildOptions(answer, [wrongNoDivide, wrongNoAbs, wrongSign], () => {
                    const a = choose([1, 2, 3, 4]);
                    const b = choose([-6, -4, -2, 2, 4, 6]);
                    const k = choose([-3, -2, -1, 1, 2, 3]);
                    return buildLogIntegralAnswer(k * a, a, b);
                }),
                forceOption: 0,
            };
        }

        if (difficulty === 7) {
            const denominatorCoeff = choose([1, 2, 3]);
            const denominatorConst = choose([-6, -4, -2, 2, 4, 6]);
            const logScalar = choose([-3, -2, -1, 1, 2, 3]);
            const numerator = logScalar * denominatorCoeff;
            const sinCoeff = nonZeroInt(-4, 4);
            const cosCoeff = nonZeroInt(-4, 4);

            const logPart = buildLogTerm(numerator, denominatorCoeff, denominatorConst);
            const trigAnswerParts = [
                logPart,
                formatTrigTerm(-cosCoeff, 'cos'),
                formatTrigTerm(sinCoeff, 'sin'),
            ].filter((part) => part !== '');
            const answer = `${joinTerms(trigAnswerParts)} + C`;

            const wrongLogSign = `${joinTerms([
                buildLogIntegralAnswer(-numerator, denominatorCoeff, denominatorConst).replace(' + C', ''),
                formatTrigTerm(-cosCoeff, 'cos'),
                formatTrigTerm(sinCoeff, 'sin'),
            ].filter((part) => part !== ''))} + C`;
            const wrongTrigSigns = `${joinTerms([
                logPart,
                formatTrigTerm(cosCoeff, 'cos'),
                formatTrigTerm(-sinCoeff, 'sin'),
            ].filter((part) => part !== ''))} + C`;
            const wrongNoDivide = `${joinTerms([
                buildLogTerm(numerator * denominatorCoeff, denominatorCoeff, denominatorConst),
                formatTrigTerm(-cosCoeff, 'cos'),
                formatTrigTerm(sinCoeff, 'sin'),
            ].filter((part) => part !== ''))} + C`;
            const integrand = joinTerms([
                `\\frac{${numerator}}{${formatSignedLinearBracket(denominatorCoeff, denominatorConst)}}`,
                formatTrigTerm(sinCoeff, 'cos'),
                formatTrigTerm(cosCoeff, 'sin'),
            ].filter((part) => part !== ''));

            return {
                latex: choose([
                    `\\text{Find } \\int \\left(${integrand}\\right) \\, dx.`,
                    `\\text{Integrate with respect to } x:\\ ${integrand}`,
                    `\\text{Given } \\frac{dy}{dx} = ${integrand}, \\text{ find } y.`,
                    `\\text{Find an antiderivative of } ${integrand} \\text{ with respect to } x.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                lowercaseCheck: true,
                options: buildOptions(answer, [wrongLogSign, wrongTrigSigns, wrongNoDivide], () => answer),
                forceOption: 2,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5, 6, 7]),
    "parametric-equations": createGenerator(async ({ difficulty }) => {
        const rationalToDisplay = (value: Rational): string => {
            if (value.denominator === 1) {
                return `${value.numerator}`;
            }

            return `\\frac{${value.numerator}}{${value.denominator}}`;
        };

        const formatLinearInXFromRational = (slope: Rational, intercept: Rational): string => {
            const slopeIsZero = slope.numerator === 0;
            const interceptIsZero = intercept.numerator === 0;

            if (slopeIsZero) {
                return rationalToDisplay(intercept);
            }

            let expression = '';
            if (slope.numerator === slope.denominator) {
                expression = 'x';
            } else if (slope.numerator === -slope.denominator) {
                expression = '-x';
            } else {
                expression = `${rationalToDisplay(slope)}x`;
            }

            if (interceptIsZero) {
                return expression;
            }

            if (intercept.numerator > 0) {
                return `${expression} + ${rationalToDisplay(intercept)}`;
            }

            return `${expression} - ${rationalToDisplay(rational(Math.abs(intercept.numerator), intercept.denominator))}`;
        };

        const formatSignedLinearInT = (coefficient: number, constant: number): string => {
            const variablePart = coefficient === 1 ? 't' : coefficient === -1 ? '-t' : `${coefficient}t`;
            if (constant === 0) return variablePart;
            if (constant > 0) return `${variablePart} + ${constant}`;
            return `${variablePart} - ${Math.abs(constant)}`;
        };

        const formatPoint = (x: number, y: number): string => `(${x}, ${y})`;

        if (difficulty === 1) {
            const a = nonZeroInt(-5, 5);
            const c = nonZeroInt(-5, 5);
            const b = randInt(-8, 8);
            const d = randInt(-8, 8);

            const slope = simplifyRational(c, a);
            const intercept = simplifyRational(d * a - c * b, a);
            const answer = `y = ${formatLinearInXFromRational(slope, intercept)}`;

            const wrongSlope = simplifyRational(a, c);
            const wrongInterceptSign = simplifyRational(d * a + c * b, a);
            const wrongNoScale = rational(c * b + d, 1);

            return {
                latex: choose([
                    `\\text{Given } x = ${formatSignedLinearInT(a, b)} \\text{ and } y = ${formatSignedLinearInT(c, d)}, \\text{ eliminate } t \\text{ and write } y \\text{ in terms of } x.`,
                    `\\text{A curve is defined by } x = ${formatSignedLinearInT(a, b)}, \\ y = ${formatSignedLinearInT(c, d)}. \\ \\text{Find the Cartesian equation.}`,
                    `\\text{For } x = ${formatSignedLinearInT(a, b)} \\text{ and } y = ${formatSignedLinearInT(c, d)}, \\text{express } y \\text{ as a function of } x.`,
                    `\\text{The parametric equations } x = ${formatSignedLinearInT(a, b)}, \\ y = ${formatSignedLinearInT(c, d)} \\text{ represent a straight line.} \\ \\text{Find its equation in the form } y=mx+c.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    `y = ${formatLinearInXFromRational(wrongSlope, intercept)}`,
                    `y = ${formatLinearInXFromRational(slope, wrongInterceptSign)}`,
                    `y = ${formatLinearInXFromRational(rational(c, 1), wrongNoScale)}`,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const p = randInt(-6, 6);
            const q = randInt(-8, 8);
            const tValue = choose([-4, -3, -2, 2, 3, 4]);

            const dxdt = 2 * tValue + p;
            const dydt = 3 * tValue * tValue + q;

            if (dxdt === 0) {
                const fallback = `${dydt}`;
                return {
                    latex: `\\text{Given } x=t^2 ${p >= 0 ? `+ ${p}t` : `- ${Math.abs(p)}t`} \\text{ and } y=t^3 ${q >= 0 ? `+ ${q}t` : `- ${Math.abs(q)}t`}, \\text{ find } \\frac{dy}{dx} \\text{ when } t=${tValue}.`,
                    answer: fallback,
                    options: buildOptions(fallback, [`${dydt + 2}`, `${dydt - 2}`, `${-dydt}`]),
                    forceOption: 0,
                };
            }

            const gradient = simplifyRational(dydt, dxdt);
            const answer = rationalToDisplay(gradient);

            return {
                latex: choose([
                    `\\text{Given } x=t^2 ${p >= 0 ? `+ ${p}t` : `- ${Math.abs(p)}t`} \\text{ and } y=t^3 ${q >= 0 ? `+ ${q}t` : `- ${Math.abs(q)}t`}, \\text{ find } \\frac{dy}{dx} \\text{ when } t=${tValue}.`,
                    `\\text{A curve is defined parametrically by } x=t^2 ${p >= 0 ? `+ ${p}t` : `- ${Math.abs(p)}t`}, \\ y=t^3 ${q >= 0 ? `+ ${q}t` : `- ${Math.abs(q)}t`}. \\ \\text{Calculate the gradient at } t=${tValue}.`,
                    `\\text{For } x=t^2 ${p >= 0 ? `+ ${p}t` : `- ${Math.abs(p)}t`} \\text{ and } y=t^3 ${q >= 0 ? `+ ${q}t` : `- ${Math.abs(q)}t`}, \\text{evaluate } \\frac{dy}{dx} \\text{ at } t=${tValue}.`,
                    `\\text{The parametric curve } x=t^2 ${p >= 0 ? `+ ${p}t` : `- ${Math.abs(p)}t`}, \\ y=t^3 ${q >= 0 ? `+ ${q}t` : `- ${Math.abs(q)}t`} \\text{ has parameter } t. \\ \\text{Find } \\frac{dy}{dx} \\text{ at } t=${tValue}.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    rationalToDisplay(simplifyRational(dxdt, dydt)),
                    `${dydt}`,
                    rationalToDisplay(simplifyRational(3 * tValue + q, dxdt)),
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const m = randInt(1, 4);
            const p = randInt(-6, 6);

            const xValue = m * m + p;
            const yTop = 2 * m * m * m;
            const yBottom = -2 * m * m * m;

            const answerPrimary = `${formatPoint(xValue, yTop)} \\text{ and } ${formatPoint(xValue, yBottom)}`;
            const answerSecondary = `${formatPoint(xValue, yBottom)} \\text{ and } ${formatPoint(xValue, yTop)}`;

            return {
                latex: choose([
                    `\\text{The curve } C \\text{ is defined by } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`}, \\ y=t^3 - ${3 * m * m}t. \\ \\text{Find the coordinates of the stationary points of } C.`,
                    `\\text{Given } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`} \\text{ and } y=t^3 - ${3 * m * m}t, \\text{determine the stationary points on the curve.}`,
                    `\\text{A parametric curve is given by } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`}, \\ y=t^3 - ${3 * m * m}t. \\ \\text{Find all points where the tangent is horizontal.}`,
                    `\\text{For } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`} \\text{ and } y=t^3 - ${3 * m * m}t, \\text{find the stationary points.}`,
                ]),
                answer: [answerPrimary, answerSecondary],
                checkWeakLatexEquivalent: true,
                options: buildOptions(answerPrimary, [
                    `${formatPoint(xValue + m, yTop)} \\text{ and } ${formatPoint(xValue - m, yBottom)}`,
                    `${formatPoint(xValue, m * m * m)} \\text{ and } ${formatPoint(xValue, -m * m * m)}`,
                    `${formatPoint(xValue + p, yTop)} \\text{ and } ${formatPoint(xValue + p, yBottom)}`,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const a = randInt(-5, 5);
            const b = randInt(-5, 5);
            const t0 = choose([-3, -2, -1, 1, 2, 3]);

            const x0 = t0 * t0 + a;
            const y0 = t0 * t0 * t0 + b * t0;
            const gradient = simplifyRational(3 * t0 * t0 + b, 2 * t0);
            const intercept = subtractRational(rational(y0), multiplyRational(gradient, rational(x0)));
            const answer = `y = ${formatLinearInXFromRational(gradient, intercept)}`;

            const reciprocal = simplifyRational(gradient.denominator, gradient.numerator);
            const wrongIntercept = subtractRational(rational(y0), multiplyRational(reciprocal, rational(x0)));
            const wrongSignIntercept = subtractRational(rational(y0), multiplyRational(rational(-gradient.numerator, gradient.denominator), rational(x0)));

            return {
                latex: choose([
                    `\\text{The curve } C \\text{ is defined by } x=t^2 ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`}, \\ y=t^3 ${b >= 0 ? `+ ${b}t` : `- ${Math.abs(b)}t`}. \\ \\text{Find the equation of the tangent to } C \\text{ at } t=${t0}.`,
                    `\\text{Given } x=t^2 ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`} \\text{ and } y=t^3 ${b >= 0 ? `+ ${b}t` : `- ${Math.abs(b)}t`}, \\text{find the tangent at parameter value } t=${t0}.`,
                    `\\text{A parametric curve has equations } x=t^2 ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`}, \\ y=t^3 ${b >= 0 ? `+ ${b}t` : `- ${Math.abs(b)}t`}. \\ \\text{Determine the equation of the tangent line when } t=${t0}.`,
                    `\\text{For } x=t^2 ${a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`} \\text{ and } y=t^3 ${b >= 0 ? `+ ${b}t` : `- ${Math.abs(b)}t`}, \\text{write down the tangent equation at } t=${t0}.`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    `y = ${formatLinearInXFromRational(reciprocal, wrongIntercept)}`,
                    `y = ${formatLinearInXFromRational(gradient, wrongSignIntercept)}`,
                    `y = ${formatLinearInXFromRational(gradient, rational(y0))}`,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const p = randInt(1, 5);
            const q = randInt(1, 6);
            const tUpper = choose([2, 3, 4]);

            const areaNumerator = 2 * tUpper * tUpper * tUpper + 3 * q * tUpper * tUpper;
            const area = simplifyRational(areaNumerator, 3);
            const answer = rationalToDisplay(area);

            const wrongNoDxdt = simplifyRational(tUpper * tUpper + 2 * q * tUpper, 2);
            const wrongNegative = rational(-area.numerator, area.denominator);
            const wrongBoundary = simplifyRational(2 * (tUpper - 1) ** 3 + 3 * q * (tUpper - 1) ** 2, 3);

            return {
                latex: choose([
                    `\\text{The curve } C \\text{ is defined by } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`}, \\ y=t+${q}, \ 0 \\leq t \\leq ${tUpper}. \\ \\text{Find the exact area enclosed by } C, \\text{the } x\\text{-axis and the lines } t=0, t=${tUpper}.`,
                    `\\text{Given } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`} \\text{ and } y=t+${q} \\text{ for } 0 \\leq t \\leq ${tUpper}, \\text{find } \\int y \\, dx \\ \\text{ exactly over this interval.}`,
                    `\\text{A parametric curve has equations } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`}, \\ y=t+${q}, \ 0 \\leq t \\leq ${tUpper}. \\ \\text{Find the exact area under the curve.}`,
                    `\\text{For } x=t^2 ${p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`} \\text{ and } y=t+${q}, \ 0 \\leq t \\leq ${tUpper}, \\text{calculate the exact area under } C \\ \\text{ with respect to the } x\\text{-axis.}`,
                ]),
                answer,
                checkWeakLatexEquivalent: true,
                options: buildOptions(answer, [
                    rationalToDisplay(wrongNoDxdt),
                    rationalToDisplay(wrongNegative),
                    rationalToDisplay(wrongBoundary),
                ]),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5]),
    "vectors": createGenerator(async ({ difficulty }) => {
        if (difficulty === 1) {
            const triples: Array<[number, number, number]> = [
                [3, 4, 5],
                [5, 12, 13],
                [8, 15, 17],
                [7, 24, 25],
            ];
            const [a, b, m] = choose(triples);
            const signX = Math.random() < 0.5 ? -1 : 1;
            const signY = Math.random() < 0.5 ? -1 : 1;
            const scale = randInt(1, 3);
            const velocity = { x: signX * a * scale, y: signY * b * scale };
            const speed = m * scale;
            const answer = `${speed}`;

            const phrasing = choose([
                `\\text{Relative to a fixed origin } O, \\text{ unit vectors } \\mathbf{i} \\text{ and } \\mathbf{j} \\text{ point east and north. } \\\\ \\text{A particle moves with velocity } \\mathbf{v} = ${formatVectorIJ(velocity)} \\text{ m s}^{-1}. \\     \\text{ Find the speed of the particle.}`,
                `\\text{A boat travels with velocity } ${formatVectorIJ(velocity)} \\text{ m s}^{-1}, \\text{ where } \\mathbf{i} \\ \\text{ is east and } \\mathbf{j} \\text{ is north. } \\\\ \\text{Calculate the speed of the boat.}`,
                `\\text{An aircraft has velocity vector } \\mathbf{v} = ${formatVectorIJ(velocity)} \\text{ m s}^{-1}. \\ \\\\ \\text{Find } |\\mathbf{v}|, \\text{ the magnitude of its velocity.}`,
                `\\text{At time } t, \\text{ a particle has velocity } ${formatVectorIJ(velocity)} \\text{ m s}^{-1}. \\ \\\\ \\text{Find the speed of the particle at this instant.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                options: buildOptions(answer, [
                    `${Math.abs(velocity.x) + Math.abs(velocity.y)}`,
                    `${Math.abs(Math.abs(velocity.x) - Math.abs(velocity.y))}`,
                    `${speed + randInt(1, 5)}`,
                ], () => `${speed + randInt(-6, 6)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const r0 = randomVector(-12, 12, true);
            const v = randomVector(-6, 6);
            const t = randInt(2, 7);
            const position = addVectors(r0, scaleVector(v, t));
            const answer = formatVectorPair(position);

            const phrasing = choose([
                `\\text{Relative to a fixed origin } O, \\text{ a particle has position vector } \\mathbf{r} = ${formatVectorIJ(r0)} + t${formatVectorIJ(v)}. \\ \\\\ \\text{Find the position vector of the particle when } t = ${t}.`,
                `\\text{A body moves so that its displacement from } O \\text{ at time } t \\text{ seconds is } \\\\ \\mathbf{r} = ${formatVectorIJ(r0)} + t${formatVectorIJ(v)} \\ \\text{ m. Find the position of the body when } t = ${t}.`,
                `\\text{A particle starts at } ${formatVectorIJ(r0)} \\ \\text{ and moves with constant velocity } ${formatVectorIJ(v)} \\ \\text{ m s}^{-1}. \\ \\\\ \\text{Find its position vector after } ${t} \\text{ seconds.}`,
                `\\text{The position vector of a particle at time } t \\text{ is } \\mathbf{r} = ${formatVectorIJ(r0)} + t${formatVectorIJ(v)}. \\ \\\\ \\text{State the coordinates of the particle when } t = ${t}.`,
            ]);

            return {
                latex: phrasing,
                answer,
                options: buildOptions(answer, [
                    formatVectorPair(addVectors(r0, v)),
                    formatVectorPair(subtractVectors(r0, scaleVector(v, t))),
                    formatVectorPair(addVectors(scaleVector(r0, t), v)),
                ], () => formatVectorPair(randomVector(-40, 40, true))),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            let velocity = randomVector(-8, 8);
            while (velocity.x === 0 && velocity.y === 0) {
                velocity = randomVector(-8, 8);
            }

            const bearing = bearingFromVelocity(velocity);
            const answer = formatBearing(bearing);

            const phrasing = choose([
                `\\text{A ship sails with constant velocity } ${formatVectorIJ(velocity)} \\ \\text{ km h}^{-1}, \\text{ where } \\mathbf{i} \\ \\text{ is east and } \\mathbf{j} \\ \\text{ is north.} \\ \\\\ \\text{Find the bearing of the ship's motion, to the nearest degree.}`,
                `\\text{A drone flies with velocity vector } ${formatVectorIJ(velocity)} \\ \\text{ m s}^{-1}. \\ \\\\ \\text{Given that } \\mathbf{i} \\ \\text{ points east and } \\mathbf{j} \\ \\text{ points north, find the bearing of its flight.}`,
                `\\text{A particle moves with constant velocity } ${formatVectorIJ(velocity)} \\ \\text{ m s}^{-1}, \\text{ where } \\mathbf{i} \\ \\text{ and } \\mathbf{j} \\ \\text{ are the east and north unit vectors.} \\ \\\\ \\text{Find the bearing of its motion to the nearest degree.}`,
                `\\text{A boat travels with velocity } ${formatVectorIJ(velocity)} \\ \\text{ km h}^{-1} \\text{ relative to a fixed origin.} \\ \\\\ \\text{Taking } \\mathbf{i} \\ \\text{ as east and } \\mathbf{j} \\ \\text{ as north, find the bearing of travel.}`,
            ]);

            return {
                latex: phrasing,
                answer,
                options: buildOptions(answer, [
                    formatBearing((360 - bearing) % 360),
                    formatBearing((bearing + 90) % 360),
                    formatBearing((bearing + 180) % 360),
                ], () => formatBearing(randInt(0, 359))),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const tAligned = randInt(2, 9);
            const rA = randomVector(-12, 12, true);
            const vA = randomVector(-6, 6);
            const vB = randomVector(-6, 6);

            let adjustedVB = vB;
            while (adjustedVB.x === vA.x) {
                adjustedVB = randomVector(-6, 6);
            }

            const xB0 = rA.x + (vA.x - adjustedVB.x) * tAligned;
            const yB0 = randInt(-14, 14);
            const rB = { x: xB0, y: yB0 };
            const answer = `${tAligned}`;

            const setup = `\\text{Particles } A \\text{ and } B \\text{ have position vectors} \\\\ \\mathbf{r}_A = ${formatVectorIJ(rA)} + t${formatVectorIJ(vA)} \\text{ and } \\mathbf{r}_B = ${formatVectorIJ(rB)} + t${formatVectorIJ(adjustedVB)}. \\`;
            const question = choose([
                `\\text{Find the time } t \\text{ when } A \\text{ and } B \\text{ are due north/south of each other.}`,
                `\\text{Find the value of } t \\text{ when } A \\text{ is directly north or south of } B.`,
                `\\text{Find the time at which } A \\text{ and } B \\text{ lie on the same north-south line.}`,
                `\\text{Find } t \\text{ such that the east-west displacement between } A \\text{ and } B \\text{ is zero.}`,
            ]);

            return {
                latex: `${setup} \\\\ ${question}`,
                answer: [answer, `t=${answer}`, `t = ${answer}`],
                options: buildOptions(answer, [
                    `${tAligned + 1}`,
                    `${Math.max(1, tAligned - 1)}`,
                    `${tAligned + 2}`,
                ], () => `${randInt(1, 12)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const tMeet = randInt(2, 9);
            const rA = randomVector(-14, 14, true);
            const vA = randomVector(-6, 6);
            const vRel = randomVector(-4, 4);
            const vB = addVectors(vA, vRel);
            const rB = subtractVectors(rA, scaleVector(vRel, tMeet));
            const answer = `${tMeet}`;

            const setup = `\\text{Particles } A \\text{ and } B \\text{ move with} \\\\ \\mathbf{r}_A = ${formatVectorIJ(rA)} + t${formatVectorIJ(vA)} \\text{ and } \\mathbf{r}_B = ${formatVectorIJ(rB)} + t${formatVectorIJ(vB)}. \\`;
            const question = choose([
                `\\text{Find the time at which the particles collide.}`,
                `\\text{Show that } A \\text{ and } B \\text{ meet, and find the time of their collision.}`,
                `\\text{Find the value of } t \\text{ at which } A \\text{ and } B \\text{ are at the same position.}`,
                `\\text{Verify that the particles collide and state the time at which this occurs.}`,
            ]);

            return {
                latex: `${setup} \\\\ ${question}`,
                answer: [answer, `t=${answer}`, `t = ${answer}`],
                options: buildOptions(answer, [
                    `${tMeet + 1}`,
                    `${Math.max(1, tMeet - 1)}`,
                    `${tMeet + 2}`,
                ], () => `${randInt(1, 12)}`),
                forceOption: 0,
            };
        }

        if (difficulty === 6) {
            const triples: Array<[number, number, number]> = [
                [3, 4, 5],
                [5, 12, 13],
                [8, 15, 17],
            ];
            const [a, b, m] = choose(triples);
            const relVelocity = { x: a, y: b };
            const tClosest = randInt(2, 8);
            const k = choose([1, 2, 3]);
            const perp = { x: -b * k, y: a * k };

            const rA0 = randomVector(-10, 10, true);
            const vA = randomVector(-5, 5);
            const vB = addVectors(vA, relVelocity);
            const delta0 = subtractVectors(perp, scaleVector(relVelocity, tClosest));
            const rB0 = addVectors(rA0, delta0);
            const minDistance = m * k;
            const answer = `${minDistance}`;

            const setup = `\\text{Particles } A \\text{ and } B \\text{ move with } \\\\ \\mathbf{r}_A = ${formatVectorIJ(rA0)} + t${formatVectorIJ(vA)} \\text{ and } \\mathbf{r}_B = ${formatVectorIJ(rB0)} + t${formatVectorIJ(vB)}. \\`;
            const question = choose([
                `\\text{Find the minimum distance between } A \\text{ and } B.`,
                `\\text{Find the least distance between the two particles during their motion.}`,
                `\\text{Find the closest distance between } A \\text{ and } B.`,
                `\\text{Find the minimum value of } |\\mathbf{r}_A - \\mathbf{r}_B|.`,
            ]);

            return {
                latex: `${setup} \\\\ ${question}`,
                answer,
                options: buildOptions(answer, [
                    `${minDistance + m}`,
                    `${Math.max(1, minDistance - m)}`,
                    `${Math.round(vectorMagnitude(delta0))}`,
                ], () => `${randInt(2, 40)}`),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5, 6]),
    "binomial-distribution": createGenerator(async ({ difficulty }) => {
        const probabilityPool = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7];

        if (difficulty === 1) {
            const n = randInt(4, 8);
            const p = choose(probabilityPool.filter((value) => value >= 0.2 && value <= 0.7));
            const r = randInt(0, n);
            const context = choose([
                { item: 'emails', success: 'gets a reply' },
                { item: 'bulbs', success: 'is faulty' },
                { item: 'students', success: 'passes a test' },
            ]);

            const answerValue = binomialPmf(n, p, r);
            const answer = formatProbability(answerValue);
            const phrasing = choose([
                `\\text{A random variable } X \\text{ follows } B(${n}, ${p}). \\text{ Find } P(X=${r}).`,
                `\\text{In a binomial model with } n=${n} \\text{ and } p=${p}, \\text{ calculate the probability that there are exactly } ${r} \\text{ successes.}`,
                `\\text{Each of } ${n} \\text{ independent } \\text{${context.item}} \\text{ has probability } ${p} \\text{ of success (it } \\text{${context.success}} \\text{).} \\ \\\\ \\text{Find the probability of exactly } ${r} \\text{ successes.}`,
                `\\text{Let } X \\sim B(${n}, ${p}). \\text{ Work out } P(X=${r}).`,
            ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    binomialPmf(n, p, Math.max(0, Math.min(n, r + 1))),
                    binomialPmf(n, p, Math.max(0, r - 1)),
                    1 - answerValue,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const n = randInt(6, 10);
            const p = choose(probabilityPool.filter((value) => value >= 0.2 && value <= 0.6));
            const k = randInt(1, n - 1);
            const mode = choose(['atMost', 'atLeast']);

            const atMost = binomialRange(n, p, 0, k);
            const atLeast = binomialRange(n, p, k, n);
            const exact = binomialPmf(n, p, k);
            const answerValue = mode === 'atMost' ? atMost : atLeast;
            const answer = formatProbability(answerValue);

            const phrasing = mode === 'atMost'
                ? choose([
                    `\\text{A random variable } X \\sim B(${n}, ${p}). \\text{ Find } P(X \\leq ${k}).  `,
                    `\\text{For } X \\sim B(${n}, ${p}), \\text{ calculate the probability that there are at most } ${k} \\ \\text{ successes. }`,
                    `\\text{The number of successful outcomes } X \\text{ in } ${n} \\text{ trials is binomial with } p=${p}. \\ \\\\ \\text{Find } P(X \\leq ${k}). \\`,
                    `\\text{Given } X \\sim B(${n}, ${p}), \\text{ work out the probability that } X \\text{ does not exceed } ${k}.`,
                ])
                : choose([
                    `\\text{A random variable } X \\sim B(${n}, ${p}). \\text{ Find } P(X \\geq ${k}).  `,
                    `\\text{For } X \\sim B(${n}, ${p}), \\text{ calculate the probability of at least } ${k} \\ \\text{ successes. }`,
                    `\\text{The number of successes } X \\text{ in } ${n} \\text{ independent trials follows } B(${n}, ${p}). \\ \\\\ \\text{Find } P(X \\geq ${k}). \\`,
                    `\\text{Given } X \\sim B(${n}, ${p}), \\text{ find the probability that } X \\text{ is } ${k} \\text{ or more. }`,
                ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    mode === 'atMost' ? atLeast : atMost,
                    exact,
                    1 - answerValue,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const n = randInt(10, 14);
            const p = choose(probabilityPool.filter((value) => value >= 0.25 && value <= 0.6));
            const lower = randInt(1, n - 4);
            const upper = randInt(lower + 1, n - 1);
            const answerValue = binomialRange(n, p, lower, upper);
            const answer = formatProbability(answerValue);

            const phrasing = choose([
                `\\text{Let } X \\sim B(${n}, ${p}). \\text{ Find } P(${lower} \\leq X \\leq ${upper}).`,
                `\\text{A call centre records the number } X \\text{ of successful callbacks out of } ${n} \\ \\text{ attempts, with success probability } ${p}. \\ \\\\ \\text{Find } P(${lower} \\leq X \\leq ${upper}). \\`,
                `\\text{A random variable is modelled by } B(${n}, ${p}). \\ \\text{Calculate the probability that } X \\text{ is between } ${lower} \\text{ and } ${upper} \\text{ inclusive.}`,
                `\\text{For } X \\sim B(${n}, ${p}), \\text{ work out } P(${lower} \\leq X \\leq ${upper}).`,
            ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    binomialRange(n, p, lower + 1, upper),
                    binomialRange(n, p, lower, upper - 1),
                    1 - answerValue,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const parameterSet = choose([
                { n: 10, p: 0.3 },
                { n: 12, p: 0.25 },
                { n: 15, p: 0.4 },
                { n: 20, p: 0.35 },
                { n: 16, p: 0.5 },
            ]);
            const n = parameterSet.n;
            const p = parameterSet.p;
            const mean = n * p;
            const r = randInt(1, Math.max(1, n - 2));
            const answerValue = binomialPmf(n, p, r);
            const answer = formatProbability(answerValue);

            const phrasing = choose([
                `\\text{A random variable } X \\sim B(${n}, p). \\text{ Given that } E(X) = ${mean}, \\text{ find } P(X=${r}). \\`,
                `\\text{The number of successes } X \\text{ in } ${n} \\text{ trials is binomial with parameter } p. \\ \\text{If } E(X)=${mean}, \\text{ calculate } P(X=${r}). \\`,
                `\\text{Let } X \\sim B(${n}, p) \\text{ and suppose the mean is } ${mean}. \\ \\\\ \\text{Find the probability of exactly } ${r} \\text{ successes.}`,
                `\\text{A binomial variable has } n=${n} \\text{ and unknown } p. \\ \\text{Given } E(X)=${mean}, \\text{work out } P(X=${r}). \\`,
            ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    binomialPmf(n, p, Math.max(0, r - 1)),
                    binomialPmf(n, p, Math.min(n, r + 1)),
                    1 - answerValue,
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const n = randInt(9, 15);
            const p = choose(probabilityPool.filter((value) => value >= 0.2 && value <= 0.6));
            const mode = choose(['givenAtLeastOne', 'givenAtLeastThreshold']);

            if (mode === 'givenAtLeastOne') {
                const r = randInt(1, n);
                const numerator = binomialPmf(n, p, r);
                const denominator = 1 - binomialPmf(n, p, 0);
                const answerValue = numerator / denominator;
                const answer = formatProbability(answerValue);

                const phrasing = choose([
                    `\\text{Let } X \\sim B(${n}, ${p}). \\text{ Find } P(X=${r} \\mid X \\geq 1).`,
                    `\\text{A quality-control process gives } X \\sim B(${n}, ${p}). \\ \\text{Given that at least one item is defective, find } P(X=${r}).`,
                    `\\text{The random variable } X \\text{ follows } B(${n}, ${p}). \\text{Calculate } P(X=${r} \\mid X>0).`,
                    `\\text{In } ${n} \\text{ independent trials with success probability } ${p}, \\text{let } X \\text{ be the number of successes.} \\ \\\\ \\text{Find } P(X=${r} \\mid X \\geq 1).`,
                ]);

                return {
                    latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                    answer,
                    options: buildProbabilityOptions(answerValue, [
                        numerator,
                        denominator,
                        1 - answerValue,
                    ]),
                    forceOption: 0,
                };
            }

            const threshold = randInt(1, n - 2);
            const r = randInt(threshold, n);
            const numerator = binomialPmf(n, p, r);
            const denominator = binomialRange(n, p, threshold, n);
            const answerValue = numerator / denominator;
            const answer = formatProbability(answerValue);

            const phrasing = choose([
                `\\text{Let } X \\sim B(${n}, ${p}). \\text{ Find } P(X=${r} \\mid X \\geq ${threshold}).`,
                `\\text{A random variable } X \\text{ is binomial with parameters } ${n} \\text{ and } ${p}. \\text{Given that } X \\geq ${threshold}, \\text{find } P(X=${r}).`,
                `\\text{For } X \\sim B(${n}, ${p}), \\text{ calculate the conditional probability } P(X=${r} \\mid X \\geq ${threshold}).`,
                `\\text{In a binomial model with } n=${n} \\text{ and } p=${p}, \\text{work out } P(X=${r} \\mid X \\geq ${threshold}).`,
            ]);

            return {
                latex: `${phrasing} \\text{ Give your answer to 3 d.p.}`,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    numerator,
                    denominator,
                    1 - answerValue,
                ]),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5]),
    "normal-distribution": createGenerator(async ({ difficulty }) => {
        const erf = (value: number): number => {
            const sign = value < 0 ? -1 : 1;
            const x = Math.abs(value);
            const a1 = 0.254829592;
            const a2 = -0.284496736;
            const a3 = 1.421413741;
            const a4 = -1.453152027;
            const a5 = 1.061405429;
            const p = 0.3275911;

            const t = 1 / (1 + p * x);
            const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
            return sign * y;
        };

        const normalCdf = (z: number): number => 0.5 * (1 + erf(z / Math.sqrt(2)));

        const formatNormal = (mean: number, sigma: number): string => `N(${mean}, ${sigma ** 2})`;

        const formatNumber = (value: number): string => {
            if (Math.abs(value - Math.round(value)) < 1e-9) {
                return `${Math.round(value)}`;
            }
            return value.toFixed(1).replace(/\.0$/, '');
        };

        const formatProbabilityAnswer = (value: number): string => formatProbability(clampProbability(value));

        const zPool = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

        if (difficulty === 1) {
            const zMagnitude = choose(zPool);
            const z = Math.random() < 0.5 ? zMagnitude : -zMagnitude;
            const mode = choose(['lessThan', 'greaterThan'] as const);
            const answerValue = mode === 'lessThan' ? normalCdf(z) : 1 - normalCdf(z);
            const answer = formatProbabilityAnswer(answerValue);
            const oppositeTail = formatProbabilityAnswer(mode === 'lessThan' ? 1 - normalCdf(z) : normalCdf(z));
            const absTail = formatProbabilityAnswer(normalCdf(Math.abs(z)));
            const mirroredTail = formatProbabilityAnswer(normalCdf(-Math.abs(z)));

            const phrasing = mode === 'lessThan'
                ? choose([
                    `\\text{Let } Z \\sim N(0,1). \\text{ Find } P(Z < ${formatNumber(z)}).`,
                    `\\text{A standard normal variable } Z \\text{ satisfies } Z \\sim N(0,1). \\text{Calculate } P(Z < ${formatNumber(z)}).`,
                    `\\text{For } Z \\sim N(0,1), \\text{ work out } P(Z \\leq ${formatNumber(z)}).`,
                    `\\text{Find the probability that a standard normal variable is less than } ${formatNumber(z)}.`,
                ])
                : choose([
                    `\\text{Let } Z \\sim N(0,1). \\text{ Find } P(Z > ${formatNumber(z)}).`,
                    `\\text{A standard normal variable } Z \\text{ satisfies } Z \\sim N(0,1). \\text{Calculate } P(Z > ${formatNumber(z)}).`,
                    `\\text{For } Z \\sim N(0,1), \\text{ work out } P(Z \\geq ${formatNumber(z)}).`,
                    `\\text{Find the probability that a standard normal variable exceeds } ${formatNumber(z)}.`,
                ]);

            return {
                latex: `${phrasing} \\ \\text{Give your answer to 3 d.p.}`,
                answer,
                equalValue: true,
                options: buildProbabilityOptions(answerValue, [
                    Number(oppositeTail),
                    Number(absTail),
                    Number(mirroredTail),
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 2) {
            const mean = choose([40, 50, 60, 70, 80]);
            const sigma = choose([4, 5, 6, 8, 10]);
            const zMagnitude = choose([0.5, 1, 1.5, 2]);
            const z = Math.random() < 0.5 ? zMagnitude : -zMagnitude;
            const boundary = mean + z * sigma;
            const mode = choose(['lessThan', 'greaterThan'] as const);
            const answerValue = mode === 'lessThan' ? normalCdf(z) : 1 - normalCdf(z);
            const answer = formatProbabilityAnswer(answerValue);

            const phrasing = mode === 'lessThan'
                ? choose([
                    `\\text{A random variable } X \\sim ${formatNormal(mean, sigma)}. \\text{ Find } P(X < ${formatNumber(boundary)}).`,
                    `\\text{Given } X \\sim ${formatNormal(mean, sigma)}, \\text{ calculate } P(X < ${formatNumber(boundary)}).`,
                    `\\text{For } X \\sim ${formatNormal(mean, sigma)}, \\text{ work out } P(X \\leq ${formatNumber(boundary)}).`,
                    `\\text{The variable } X \\text{ is normally distributed with } X \\sim ${formatNormal(mean, sigma)}. \\text{Find } P(X < ${formatNumber(boundary)}).`,
                ])
                : choose([
                    `\\text{A random variable } X \\sim ${formatNormal(mean, sigma)}. \\text{ Find } P(X > ${formatNumber(boundary)}).`,
                    `\\text{Given } X \\sim ${formatNormal(mean, sigma)}, \\text{ calculate } P(X > ${formatNumber(boundary)}).`,
                    `\\text{For } X \\sim ${formatNormal(mean, sigma)}, \\text{ work out } P(X \\geq ${formatNumber(boundary)}).`,
                    `\\text{The variable } X \\text{ is normally distributed with } X \\sim ${formatNormal(mean, sigma)}. \\text{Find } P(X > ${formatNumber(boundary)}).`,
                ]);

            return {
                latex: `${phrasing} \\ \\text{Give your answer to 3 d.p.}`,
                answer,
                equalValue: true,
                options: buildProbabilityOptions(answerValue, [
                    mode === 'lessThan' ? 1 - normalCdf(z) : normalCdf(z),
                    normalCdf(Math.abs(z)),
                    normalCdf(-Math.abs(z)),
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 3) {
            const mean = choose([35, 40, 50, 65, 80]);
            const sigma = choose([4, 5, 6, 8]);
            const zLower = choose([-2, -1.5, -1, -0.5]);
            const zUpper = choose([0.5, 1, 1.5, 2]);
            const lower = mean + zLower * sigma;
            const upper = mean + zUpper * sigma;
            const answerValue = normalCdf(zUpper) - normalCdf(zLower);
            const answer = formatProbabilityAnswer(answerValue);

            return {
                latex: choose([
                    `\\text{Let } X \\sim ${formatNormal(mean, sigma)}. \\text{ Find } P(${formatNumber(lower)} < X < ${formatNumber(upper)}). \\text{ Give your answer to 3 d.p.}`,
                    `\\text{A normal variable } X \\text{ has distribution } ${formatNormal(mean, sigma)}. \\text{Calculate } P(${formatNumber(lower)} < X < ${formatNumber(upper)}). \\text{ Give your answer to 3 d.p.}`,
                    `\\text{For } X \\sim ${formatNormal(mean, sigma)}, \\text{ work out } P(${formatNumber(lower)} \\leq X \\leq ${formatNumber(upper)}). \\text{ Give your answer to 3 d.p.}`,
                    `\\text{The variable } X \\sim ${formatNormal(mean, sigma)}. \\text{Find the probability that } X \\text{ lies between } ${formatNumber(lower)} \\text{ and } ${formatNumber(upper)}. \\text{ Give your answer to 3 d.p.}`,
                ]),
                equalValue: true,
                answer,
                options: buildProbabilityOptions(answerValue, [
                    normalCdf(zUpper),
                    1 - normalCdf(zLower),
                    normalCdf(zUpper) - normalCdf(Math.abs(zLower)),
                ]),
                forceOption: 0,
            };
        }

        if (difficulty === 4) {
            const mean = choose([50, 60, 70, 80, 90]);
            const sigma = choose([2, 4, 6, 8]);
            const z = choose([0.5, 1, 1.5, 2]);
            const mode = choose(['lessThan', 'greaterThan'] as const);
            const probability = mode === 'lessThan' ? normalCdf(z) : 1 - normalCdf(z);
            const boundary = mean + z * sigma;
            const answer = `${formatNumber(boundary)}`;

            const phrasing = mode === 'lessThan'
                ? choose([
                    `\\text{A random variable } X \\sim ${formatNormal(mean, sigma)}. \\text{Given that } P(X < k) = ${formatProbabilityAnswer(probability)}, \\text{ find } k.`,
                    `\\text{For } X \\sim ${formatNormal(mean, sigma)}, \\text{ the probability that } X \\text{ is less than } k \\text{ is } ${formatProbabilityAnswer(probability)}. \\ \\text{Find } k.`,
                    `\\text{If } X \\sim ${formatNormal(mean, sigma)} \\text{ and } P(X < k) = ${formatProbabilityAnswer(probability)}, \\text{ calculate } k.`,
                    `\\text{The variable } X \\sim ${formatNormal(mean, sigma)}. \\ \\text{Given } P(X \\leq k) = ${formatProbabilityAnswer(probability)}, \\text{work out } k.`,
                ])
                : choose([
                    `\\text{A random variable } X \\sim ${formatNormal(mean, sigma)}. \\ \\text{Given that } P(X > k) = ${formatProbabilityAnswer(probability)}, \\text{ find } k.`,
                    `\\text{For } X \\sim ${formatNormal(mean, sigma)}, \\text{ the probability that } X \\text{ exceeds } k \\text{ is } ${formatProbabilityAnswer(probability)}. \\ \\text{Find } k.`,
                    `\\text{If } X \\sim ${formatNormal(mean, sigma)} \\text{ and } P(X > k) = ${formatProbabilityAnswer(probability)}, \\text{ calculate } k.`,
                    `\\text{The variable } X \\sim ${formatNormal(mean, sigma)}. \\ \\text{Given } P(X \\geq k) = ${formatProbabilityAnswer(probability)}, \\text{work out } k.`,
                ]);

            return {
                latex: phrasing,
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    `${formatNumber(mean - z * sigma)}`,
                    `${formatNumber(mean + (z + 0.5) * sigma)}`,
                    `${formatNumber(mean + (z - 0.5) * sigma)}`,
                ], () => `${formatNumber(boundary + choose([-8, -4, 4, 8]))}`),
                forceOption: 0,
            };
        }

        if (difficulty === 5) {
            const mode = choose(['findMean', 'findSigma'] as const);

            if (mode === 'findMean') {
                const sigma = choose([2, 4, 6, 8]);
                const z = choose([0.5, 1, 1.5, 2]);
                const mean = choose([40, 50, 60, 70, 80]);
                const boundary = mean + z * sigma;
                const probability = normalCdf(z);
                const answer = `${mean}`;

                return {
                    latex: choose([
                        `\\text{A random variable } X \\sim N(\\mu, ${sigma ** 2}). \\text{ Given that } P(X < ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{ find } \\mu.`,
                        `\\text{The variable } X \\text{ is normally distributed with } X \\sim N(\\mu, ${sigma ** 2}). \\ \\text{If } P(X < ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{calculate } \\mu.`,
                        `\\text{For } X \\sim N(\\mu, ${sigma ** 2}), \\text{ the probability that } X < ${formatNumber(boundary)} \\text{ is } ${formatProbabilityAnswer(probability)}. \\ \\text{Find } \\mu.`,
                        `\\text{Given } X \\sim N(\\mu, ${sigma ** 2}) \\text{ and } P(X \\leq ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{ work out } \\mu.`,
                    ]),
                    answer,
                    equalValue: true,
                    options: buildOptions(answer, [
                        `${mean + sigma}`,
                        `${mean - sigma}`,
                        `${boundary}`,
                    ], () => `${mean + choose([-12, -8, -4, 4, 8, 12])}`),
                    forceOption: 0,
                };
            }

            const mean = choose([50, 60, 70, 80]);
            const sigma = choose([2, 4, 6, 8]);
            const z = choose([0.5, 1, 1.5, 2]);
            const boundary = mean + z * sigma;
            const probability = normalCdf(z);
            const answer = `${sigma}`;

            return {
                latex: choose([
                    `\\text{A random variable } X \\sim N(${mean}, \\sigma^2). \\text{ Given that } P(X < ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{ find } \\sigma.`,
                    `\\text{The variable } X \\text{ is normally distributed with } X \\sim N(${mean}, \\sigma^2). \\text{If } P(X < ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{calculate } \\sigma.`,
                    `\\text{For } X \\sim N(${mean}, \\sigma^2), \\text{ the probability that } X < ${formatNumber(boundary)} \\text{ is } ${formatProbabilityAnswer(probability)}. \\ \\text{Find } \\sigma.`,
                    `\\text{Given } X \\sim N(${mean}, \\sigma^2) \\text{ and } P(X \\leq ${formatNumber(boundary)}) = ${formatProbabilityAnswer(probability)}, \\text{ work out } \\sigma.`,
                ]),
                answer,
                equalValue: true,
                options: buildOptions(answer, [
                    `${sigma + 2}`,
                    `${Math.max(1, sigma - 2)}`,
                    `${z * sigma}`,
                ], () => `${choose([2, 4, 6, 8, 10])}`),
                forceOption: 0,
            };
        }

        throw new Error(`Unhandled difficulty: ${difficulty}`);
    }, [1, 2, 3, 4, 5])
};

