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
 * Deep structural normalization with commutative ordering
 */
function normalize(expr: any): any {
    if (!Array.isArray(expr)) return expr;

    const [head, ...args] = expr;

    const normArgs = args.map(normalize);

    if (head === "Add" || head === "Multiply") {
        normArgs.sort((a, b) => key(a).localeCompare(key(b)));
    }

    return [head, ...normArgs];
}

/**
 * Main equivalence checker
 */
export function weakLatexEquivalent(a: string, b: string): boolean {
    try {
        const A = ce.parse(a, { form: "raw" });
        const B = ce.parse(b, { form: "raw" });

        if (!A || !B) return false;

        let Ajson = A.toJSON();
        let Bjson = B.toJSON();

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