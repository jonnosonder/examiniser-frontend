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

const dotProduct = (left: Vector2, right: Vector2): number => left.x * right.x + left.y * right.y;

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

const powerToKey = (value: Rational): string => `${value.numerator}/${value.denominator}`;

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
            let rootA = nonZeroInt(-8, 8);
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
            let rootA = nonZeroInt(-6, 6);
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
            let rootA = randInt(1, 4);
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
                    const adjustedRightPower = 1;
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
};

