/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

/**
 * Fully flattens nested Multiply nodes
 */
function flattenMultiply(expr: any): any {
    if (!Array.isArray(expr)) return expr;

    const [head, ...args] = expr;

    const normArgs = args.map(flattenMultiply);

    if (head !== "Multiply") {
        return [head, ...normArgs];
    }

    const flat: any[] = [];

    for (const a of normArgs) {
        if (Array.isArray(a) && a[0] === "Multiply") {
            flat.push(...a.slice(1));
        } else {
            flat.push(a);
        }
    }

    return ["Multiply", ...flat];
}

/**
 * Generates a stable canonical sorting key
 * (NO JSON reliance for ordering decisions)
 */
function key(expr: any): string {
    if (!Array.isArray(expr)) return String(expr);

    const [head, ...args] = expr;

    const argKeys = args.map(key).sort();

    return `${head}(${argKeys.join(",")})`;
}

/**
 * Computes a numeric value for expressions that contain only numbers.
 */
function numericValue(expr: any): number | null {
    if (!Array.isArray(expr)) {
        if (typeof expr === "number") return expr;
        const parsed = Number(expr);
        return Number.isFinite(parsed) ? parsed : null;
    }

    const [head, ...args] = expr;
    const values = args.map(numericValue);
    if (values.some((value) => value === null)) return null;
    const numericArgs = values as number[];

    switch (head) {
        case "Number":
            return Number(args[0]);
        case "Rational":
            return numericArgs.length === 2 ? numericArgs[0] / numericArgs[1] : null;
        case "Add":
            return numericArgs.reduce((sum, value) => sum + value, 0);
        case "Subtract":
            return numericArgs.length === 2 ? numericArgs[0] - numericArgs[1] : null;
        case "Multiply":
            return numericArgs.reduce((product, value) => product * value, 1);
        case "Divide":
            return numericArgs.length === 2 && numericArgs[1] !== 0 ? numericArgs[0] / numericArgs[1] : null;
        case "Negate":
            return numericArgs.length === 1 ? -numericArgs[0] : null;
        case "Power":
            return numericArgs.length === 2 ? Math.pow(numericArgs[0], numericArgs[1]) : null;
        default:
            return null;
    }
}

/**
 * Deep structural normalization with commutative ordering
 * and subtraction canonicalization.
 */
function normalize(expr: any): any {
    if (!Array.isArray(expr)) return expr;

    const [head, ...args] = expr;
    const normArgs = args.map(normalize);

    if (head === "InvisibleOperator") {
        return normalize(["Multiply", ...normArgs]);
    }

    if (head === "Subtract" && normArgs.length === 2) {
        return normalize(["Add", normArgs[0], ["Negate", normArgs[1]]]);
    }

    if (head === "Add") {
        const flatArgs: any[] = [];

        for (const arg of normArgs) {
            if (Array.isArray(arg) && arg[0] === "Add") {
                flatArgs.push(...arg.slice(1));
            } else {
                flatArgs.push(arg);
            }
        }

        const filteredArgs = flatArgs.filter((arg) => {
            if (arg === 0) return false;
            if (Array.isArray(arg) && arg[0] === "Number" && arg[1] === 0) return false;
            return true;
        });

        if (filteredArgs.length === 0) return 0;
        if (filteredArgs.length === 1) return filteredArgs[0];

        filteredArgs.sort((a, b) => key(a).localeCompare(key(b)));
        return ["Add", ...filteredArgs];
    }

    if (head === "Multiply") {
        let negativeCount = 0;
        const positiveArgs: any[] = [];

        for (const arg of normArgs) {
            if (Array.isArray(arg) && arg[0] === "Negate" && arg.length === 2) {
                negativeCount += 1;
                positiveArgs.push(arg[1]);
            } else if (
                Array.isArray(arg) &&
                arg[0] === "Divide" &&
                arg.length === 3 &&
                Array.isArray(arg[1]) &&
                arg[1][0] === "Negate" &&
                arg[1].length === 2
            ) {
                negativeCount += 1;
                positiveArgs.push(["Divide", arg[1][1], arg[2]]);
            } else if (
                Array.isArray(arg) &&
                arg[0] === "Divide" &&
                arg.length === 3 &&
                Array.isArray(arg[2]) &&
                arg[2][0] === "Negate" &&
                arg[2].length === 2
            ) {
                negativeCount += 1;
                positiveArgs.push(["Divide", arg[1], arg[2][1]]);
            } else {
                positiveArgs.push(arg);
            }
        }

        const filteredArgs = positiveArgs.filter((arg) => {
            if (arg === 1) return false;
            if (Array.isArray(arg) && arg[0] === "Number" && arg[1] === 1) return false;
            return true;
        });

        if (filteredArgs.length === 0) {
            return negativeCount % 2 === 1 ? ["Negate", 1] : 1;
        }

        if (filteredArgs.length === 1) {
            return negativeCount % 2 === 1 ? normalize(["Negate", filteredArgs[0]]) : filteredArgs[0];
        }

        const product = ["Multiply", ...filteredArgs];
        return negativeCount % 2 === 1 ? normalize(["Negate", product]) : product;
    }

    if (head === "Negate" && normArgs.length === 1) {
        const arg = normArgs[0];
        if (Array.isArray(arg) && arg[0] === "Divide" && arg.length === 3) {
            return normalize(["Divide", ["Negate", arg[1]], arg[2]]);
        }
        if (Array.isArray(arg) && arg[0] === "Negate" && arg.length === 2) {
            return normalize(arg[1]);
        }
    }

    if (head === "Add" || head === "Multiply") {
        normArgs.sort((a, b) => key(a).localeCompare(key(b)));
    }

    return [head, ...normArgs];
}

/**
 * Main equivalence checker
 */
export function weakLatexEquivalent(a: string, b: string): boolean {
    //console.log(a, b)
    try {
        const A = ce.parse(a, { form: "raw" });
        const B = ce.parse(b, { form: "raw" });

        if (!A || !B) return false;

        let Ajson = A.toJSON();
        let Bjson = B.toJSON();

        const numericA = numericValue(Ajson);
        const numericB = numericValue(Bjson);

        if (numericA !== null && numericB !== null) {
            return Object.is(numericA, numericB);
        }

        // Step 1: flatten multiplication structure
        Ajson = flattenMultiply(Ajson);
        Bjson = flattenMultiply(Bjson);

        // Step 2: normalize commutative ordering
        const normA = normalize(Ajson);
        const normB = normalize(Bjson);

        // Step 3: final canonical comparison
        return key(normA) === key(normB);

    } catch {
        return false;
    }
}

/**
 * Quick test helper for manual validation.
 *
 * Example command:
 *   import { testWeakLatexEquivalent } from "./weakLatexEquivalent";
 *   testWeakLatexEquivalent();
 * 
 * cd /d c:\examiniser\examiniser-frontend
 * npx --yes tsx -e "import { testWeakLatexEquivalent } from './src/components/questions/weakLatexEquivalent.ts'; testWeakLatexEquivalent();
 *
 * Or call directly:
 *   console.log(weakLatexEquivalent("0.5", "\\frac{1}{2}"));
 */
export function testWeakLatexEquivalent(): void {
    const cases: Array<[string, string]> = [
        // all bellow should return true
        ["0.5", "\\frac{1}{2}"],
        ["4n - 2", "-2 + 4n"],
        ["a + b", "b + a"],
        ["2^3", "8"],
        ["\\frac{1}{2}x - \\frac{1}{2}", "\\frac{-1}{2} + \\frac{1}{2}x"],
        ["-1y+1", "1-y"],
        ["-1y+1", "-y+1"],
        ["1a + \\frac{4}{3}", "a + \\frac{4}{3}"],
        ["-\\frac{1}{2}y - \\frac{1}{6}", "-\\frac{1}{6} - \\frac{1}{2}y"],
        ["y=x+1", "y=1+x"],
        ["x^2 - x - 12", "x^2 - 12 - x"],
        // all bellow should return false
        ["a+2","1(a+2)"]
    ];

    cases.forEach(([a, b]) => {
        const result = weakLatexEquivalent(a, b);
        console.log(`${a} ⇔ ${b} -> ${result}`);
    });
}
