// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import * as React from "react";

export type MathShorthandEditorProps = {
    value: string;
    onChange: (value: string, latex: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

type MathNode =
    | { type: "text"; value: string; start: number; end: number }
    | { type: "symbol"; display: string; latex: string; start: number; end: number }
    | { type: "group"; children: MathNode[]; start: number; end: number }
    | { type: "frac"; numerator: MathNode[]; denominator: MathNode[]; start: number; end: number }
    | { type: "sqrt"; body: MathNode[]; start: number; end: number }
    | { type: "sup"; base: MathNode[]; exponent: MathNode[]; start: number; end: number }
    | { type: "sub"; base: MathNode[]; subscript: MathNode[]; start: number; end: number }
    | { type: "placeholder"; start: number; end: number };

const SYMBOL_PATTERNS = [
    { keys: ["infinity", "inf"], display: "∞", latex: "\\infty" },
    { keys: ["theta"], display: "θ", latex: "\\theta" },
    { keys: ["pi"], display: "π", latex: "\\pi" },
    { keys: ["sin"], display: "sin", latex: "\\sin" },
    { keys: ["cos"], display: "cos", latex: "\\cos" },
    { keys: ["tan"], display: "tan", latex: "\\tan" },
    { keys: ["log"], display: "log", latex: "\\log" },
    { keys: ["ln"], display: "ln", latex: "\\ln" },
    { keys: [">="], display: "≥", latex: "\\ge" },
    { keys: ["<="], display: "≤", latex: "\\le" },
    { keys: ["!="], display: "≠", latex: "\\neq" },
    { keys: ["*"], display: "×", latex: "\\times" },
    { keys: ["√"], display: "√", latex: "\\sqrt" },
];

const SPECIAL_CHARS = new Set(["(", ")", "^", "_", "/", "*", "+", "-", ">", "<", "!", " ", "\t", "\n"]);

function isLetterOrDigit(character: string) {
    return /[a-zA-Z0-9.]/.test(character);
}

function skipWhitespace(source: string, pos: number) {
    while (pos < source.length && /[\s]/.test(source[pos])) {
        pos += 1;
    }
    return pos;
}

function matchSymbol(source: string, pos: number): MathNode | null {
    for (const { keys, display, latex } of SYMBOL_PATTERNS) {
        for (const key of keys) {
            const slice = source.slice(pos, pos + key.length).toLowerCase();
            if (slice === key && key.length > 0) {
                return { type: "symbol", display, latex, start: pos, end: pos + key.length };
            }
        }
    }

    const char = source[pos];
    if (char === "√") {
        return { type: "symbol", display: "√", latex: "\\sqrt", start: pos, end: pos + 1 };
    }

    return null;
}

function parseMathExpression(source: string): MathNode[] {
    let pos = 0;
    let placeholderCounter = 0;

    const createPlaceholder = (): MathNode => {
        const position = source.length + 1 + placeholderCounter;
        placeholderCounter += 1;
        return { type: "placeholder", start: position, end: position };
    };

    const shouldAddPlaceholder = (node: MathNode) =>
        node.type === "group" || node.type === "frac" || node.type === "sqrt" || node.type === "sup" || node.type === "sub";

    const parseExpression = (insideGroup = false): MathNode[] => {
        const nodes: MathNode[] = [];
        while (pos < source.length) {
            if (source[pos] === ")") {
                if (insideGroup) {
                    // Let the caller consume the ')'
                    break;
                } else {
                    // Lone ')' at top level — emit as plain text
                    const start = pos;
                    pos += 1;
                    nodes.push({ type: "text", value: ")", start, end: pos });
                    continue;
                }
            }
            const node = parseTerm();
            nodes.push(node);
            if (shouldAddPlaceholder(node)) {
                nodes.push(createPlaceholder());
            }
        }
        return nodes;
    };

    const parseTerm = (): MathNode => {
        let node = parseFactor();
        while (true) {
            pos = skipWhitespace(source, pos);
            if (source[pos] !== "/") {
                break;
            }
            const start = node.start;
            pos += 1;
            const denominator = parseFactor();
            node = { type: "frac", numerator: [node], denominator: [denominator], start, end: denominator.end };
        }
        return node;
    };

    const parseFactor = (): MathNode => {
        let node = parseBase();
        while (true) {
            pos = skipWhitespace(source, pos);
            if (source[pos] === "^") {
                pos += 1;
                const exponent = parseBase();
                node = { type: "sup", base: [node], exponent: [exponent], start: node.start, end: exponent.end };
                continue;
            }
            if (source[pos] === "_") {
                pos += 1;
                const subscript = parseBase();
                node = { type: "sub", base: [node], subscript: [subscript], start: node.start, end: subscript.end };
                continue;
            }
            break;
        }
        return node;
    };

    const parseBase = (): MathNode => {
        pos = skipWhitespace(source, pos);
        if (pos >= source.length) {
            return { type: "text", value: "", start: pos, end: pos };
        }

        if (source[pos] === "(") {
            // Only create a group if there is a matching closing paren ahead
            const matchingClose = source.indexOf(")", pos + 1);
            if (matchingClose !== -1) {
                const start = pos;
                pos += 1;
                const children = parseExpression(true);
                if (source[pos] === ")") {
                    pos += 1;
                }
                return { type: "group", children, start, end: pos };
            }
            // No closing paren found — treat '(' as plain text
            const start = pos;
            pos += 1;
            return { type: "text", value: "(", start, end: pos };
        }

        const symbol = matchSymbol(source, pos);
        if (symbol && symbol.type === "symbol") {
            if (symbol.latex === "\\sqrt" && source[pos] !== "√") {
                pos = symbol.end;
                const body = [parseBase()];
                return { type: "sqrt", body, start: symbol.start, end: body[0]?.end ?? symbol.end };
            }
            pos = symbol.end;
            return symbol;
        }
        if (symbol) {
            pos = symbol.end;
            return symbol;
        }

        if (source[pos] === "+" || source[pos] === "-") {
            const start = pos;
            pos += 1;
            return { type: "text", value: source[start], start, end: pos };
        }

        const start = pos;
        while (pos < source.length && !SPECIAL_CHARS.has(source[pos])) {
            pos += 1;
        }
        const value = source.slice(start, pos);
        return { type: "text", value, start, end: pos };
    };

    return parseExpression();
}

function renderLaTeX(nodes: MathNode[]): string {
    return nodes
        .map((node) => {
            switch (node.type) {
                case "text":
                    return node.value.replace(/([_^{}])/g, "\\$1");
                case "symbol":
                    return node.latex;
                case "group":
                    return `\\left(${renderLaTeX(node.children)}\\right)`;
                case "frac":
                    return `\\frac{${renderLaTeX(node.numerator)}}{${renderLaTeX(node.denominator)}}`;
                case "sqrt":
                    return `\\sqrt{${renderLaTeX(node.body)}}`;
                case "sup":
                    return `{${renderLaTeX(node.base)}}^{${renderLaTeX(node.exponent)}}`;
                case "sub":
                    return `{${renderLaTeX(node.base)}}_{${renderLaTeX(node.subscript)}}`;
                case "placeholder":
                    return "";
                default:
                    return "";
            }
        })
        .join("");
}

function findFractionTabTarget(nodes: MathNode[], cursor: number): number | null {
    for (const node of nodes) {
        if (node.type === "frac") {
            const numeratorStart = node.numerator[0]?.start ?? node.start;
            const numeratorEnd = node.numerator[node.numerator.length - 1]?.end ?? node.end;
            const denominatorStart = node.denominator[0]?.start ?? node.start;
            if (cursor >= numeratorStart && cursor <= numeratorEnd) {
                return denominatorStart;
            }
            const nested = findFractionTabTarget(node.numerator, cursor) ?? findFractionTabTarget(node.denominator, cursor);
            if (nested !== null) {
                return nested;
            }
        }
        if (node.type === "group") {
            const nested = findFractionTabTarget(node.children, cursor);
            if (nested !== null) {
                return nested;
            }
        }
        if (node.type === "sqrt") {
            const nested = findFractionTabTarget(node.body, cursor);
            if (nested !== null) {
                return nested;
            }
        }
        if (node.type === "sup") {
            const nested = findFractionTabTarget(node.base, cursor) ?? findFractionTabTarget(node.exponent, cursor);
            if (nested !== null) {
                return nested;
            }
        }
        if (node.type === "sub") {
            const nested = findFractionTabTarget(node.base, cursor) ?? findFractionTabTarget(node.subscript, cursor);
            if (nested !== null) {
                return nested;
            }
        }
    }
    return null;
}

function getTokenDeleteRange(source: string, cursorIndex: number) {
    let index = cursorIndex;
    while (index > 0 && /[\s]/.test(source[index - 1])) {
        index -= 1;
    }

    const candidateTokens = ["infinity", "theta", "sqrt", "pi", "inf", "sin", "cos", "tan", "log", "ln", ">=", "<=", "!=", "*", "√", "/", "^", "_"];
    for (const token of candidateTokens) {
        const start = index - token.length;
        if (start >= 0 && source.slice(start, index).toLowerCase() === token) {
            return { start, end: index };
        }
    }

    const char = source[index - 1];
    if (/\w|\d|\./.test(char)) {
        let start = index - 1;
        while (start > 0 && /[a-zA-Z0-9.]/.test(source[start - 1])) {
            start -= 1;
        }
        return { start, end: index };
    }

    return { start: index - 1, end: index };
}

function isActiveRange(cursor: number, start: number, end: number) {
    return cursor >= start && cursor <= end;
}

type NodeRegion = "root" | "children" | "numerator" | "denominator" | "body" | "exponent" | "subscript" | "group";

type MathNodePathEntry = {
    node: MathNode;
    parent: MathNodePathEntry | null;
    siblings: MathNode[];
    region: NodeRegion;
    index: number;
};

function getLastNodeEnd(nodes: MathNode[]) {
    return nodes[nodes.length - 1]?.end ?? 0;
}

function findNodePath(
    nodes: MathNode[],
    cursor: number,
    parent: MathNodePathEntry | null = null,
    region: NodeRegion = "root",
    index = 0
): MathNodePathEntry[] | null {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (cursor < node.start || cursor > node.end) {
            continue;
        }

        const entry: MathNodePathEntry = { node, parent, siblings: nodes, region, index: i };

        if (node.type === "group") {
            // cursor on the '(' itself (node.start) or ')' (node.end-1) stays at group level
            // cursor strictly inside the brackets explores children
            if (cursor > node.start && cursor < node.end) {
                const nested = findNodePath(node.children, cursor, entry, "group");
                return nested ? [entry, ...nested] : [entry];
            }
            return [entry];
        }

        if (node.type === "frac") {
            const numeratorEnd = getLastNodeEnd(node.numerator);
            const denominatorStart = node.denominator[0]?.start ?? numeratorEnd;
            if (cursor >= (node.numerator[0]?.start ?? node.start) && cursor <= numeratorEnd) {
                const nested = findNodePath(node.numerator, cursor, entry, "numerator");
                return nested ? [entry, ...nested] : [entry];
            }
            if (cursor >= denominatorStart && cursor <= getLastNodeEnd(node.denominator)) {
                const nested = findNodePath(node.denominator, cursor, entry, "denominator");
                return nested ? [entry, ...nested] : [entry];
            }
            return [entry];
        }

        if (node.type === "sqrt") {
            const nested = findNodePath(node.body, cursor, entry, "body");
            return nested ? [entry, ...nested] : [entry];
        }

        if (node.type === "sup") {
            const baseEnd = getLastNodeEnd(node.base);
            if (cursor >= (node.base[0]?.start ?? node.start) && cursor <= baseEnd) {
                const nested = findNodePath(node.base, cursor, entry, "children");
                return nested ? [entry, ...nested] : [entry];
            }
            const exponentEnd = getLastNodeEnd(node.exponent);
            if (cursor >= (node.exponent[0]?.start ?? node.start) && cursor <= exponentEnd) {
                const nested = findNodePath(node.exponent, cursor, entry, "exponent");
                return nested ? [entry, ...nested] : [entry];
            }
            return [entry];
        }

        if (node.type === "sub") {
            const baseEnd = getLastNodeEnd(node.base);
            if (cursor >= (node.base[0]?.start ?? node.start) && cursor <= baseEnd) {
                const nested = findNodePath(node.base, cursor, entry, "children");
                return nested ? [entry, ...nested] : [entry];
            }
            const subscriptEnd = getLastNodeEnd(node.subscript);
            if (cursor >= (node.subscript[0]?.start ?? node.start) && cursor <= subscriptEnd) {
                const nested = findNodePath(node.subscript, cursor, entry, "subscript");
                return nested ? [entry, ...nested] : [entry];
            }
            return [entry];
        }

        return [entry];
    }

    return null;
}

function getPlaceholderAfter(entry: MathNodePathEntry): number | null {
    const next = entry.siblings[entry.index + 1];
    if (next?.type === "placeholder") {
        return next.start;
    }
    return null;
}

function getEscapePositionForRight(path: MathNodePathEntry[], cursor: number): number | null {
    if (path.length === 0) {
        return null;
    }

    const current = path[path.length - 1];
    const parent = path[path.length - 2] ?? null;

    if (current.region === "numerator" && parent?.node.type === "frac") {
        const numeratorEnd = getLastNodeEnd(parent.node.numerator);
        if (cursor === numeratorEnd) {
            return parent.node.denominator[0]?.start ?? parent.node.end;
        }
    }

    if (current.region === "denominator" && parent?.node.type === "frac") {
        const denominatorEnd = getLastNodeEnd(parent.node.denominator);
        if (cursor === denominatorEnd) {
            return getPlaceholderAfter(parent) ?? parent.node.end;
        }
    }

    if (current.region === "exponent" && parent?.node.type === "sup") {
        const exponentEnd = getLastNodeEnd(parent.node.exponent);
        if (cursor === exponentEnd) {
            return getPlaceholderAfter(parent) ?? parent.node.end;
        }
    }

    if (current.region === "subscript" && parent?.node.type === "sub") {
        const subscriptEnd = getLastNodeEnd(parent.node.subscript);
        if (cursor === subscriptEnd) {
            return getPlaceholderAfter(parent) ?? parent.node.end;
        }
    }

    if (current.region === "body" && parent?.node.type === "sqrt") {
        const bodyEnd = getLastNodeEnd(parent.node.body);
        if (cursor === bodyEnd) {
            return getPlaceholderAfter(parent) ?? parent.node.end;
        }
    }

    // FIX: group escape — when cursor is at the last child's end (just before ')'),
    // right arrow should land AFTER the closing bracket (node.end), not before '('.
    if (current.region === "group") {
        // The group node.end is the position after ')'. Escape to after ')'.
        const groupContentEnd = getLastNodeEnd(current.node.type === "group" ? (current.node as Extract<MathNode, {type:"group"}>).children : []);
        if (cursor === groupContentEnd || cursor === current.node.end - 1) {
            // Land after the closing paren — that's node.end
            return getPlaceholderAfter(current) ?? current.node.end;
        }
    }

    return null;
}

function getEscapePositionForLeft(path: MathNodePathEntry[], cursor: number): number | null {
    if (path.length < 2) {
        return null;
    }

    const current = path[path.length - 1];
    const parent = path[path.length - 2];

    if (current.region === "numerator" && parent?.node.type === "frac") {
        if (cursor === current.node.start) {
            return parent.node.start;
        }
    }

    if (current.region === "denominator" && parent?.node.type === "frac") {
        if (cursor === current.node.start) {
            return getLastNodeEnd(parent.node.numerator);
        }
    }

    if (current.region === "exponent" && parent?.node.type === "sup") {
        if (cursor === current.node.start) {
            return getLastNodeEnd(parent.node.base);
        }
    }

    if (current.region === "subscript" && parent?.node.type === "sub") {
        if (cursor === current.node.start) {
            return getLastNodeEnd(parent.node.base);
        }
    }

    if (current.region === "body" && parent?.node.type === "sqrt") {
        if (cursor === current.node.start) {
            return parent.node.start;
        }
    }

    // FIX: group escape left — when cursor is at the first child's start (just after '('),
    // left arrow should land BEFORE the opening bracket (parent.node.start), not after ')'.
    if (current.region === "group" && parent) {
        const groupNode = current.node as Extract<MathNode, {type:"group"}>;
        const firstChildStart = groupNode.children[0]?.start ?? (groupNode.start + 1);
        if (cursor === firstChildStart || cursor === groupNode.start + 1) {
            return parent.node.start;
        }
    }

    return null;
}

function renderCursorElement(key: string) {
    return (
        <span
            key={`cursor-${key}`}
            className="inline-block h-6 w-[1px] bg-primary animate-pulse"
            aria-hidden="true"
        />
    );
}

function shouldRenderCursorAtBoundary(
    node: MathNode,
    cursor: number,
    boundary: "start" | "end",
    cursorPath: MathNodePathEntry[]
) {
    const position = boundary === "start" ? node.start : node.end;
    if (cursor !== position) {
        return false;
    }

    const deepest = cursorPath[cursorPath.length - 1]?.node;
    if (!deepest) {
        return false;
    }

    if (deepest === node) {
        return true;
    }

    return !(deepest.start === cursor || deepest.end === cursor);
}

function renderMathNodes(
    nodes: MathNode[],
    cursor: number,
    onClick: (position: number) => void,
    cursorPath: MathNodePathEntry[],
    isFocused: boolean
): React.ReactNode {
    const renderCursor = (key: string) => (isFocused ? renderCursorElement(key) : null);

    const renderNode = (node: MathNode, index: number): React.ReactNode => {
        const commonProps = {
            key: `${node.type}-${index}-${node.start}-${node.end}`,
            onClick: () => onClick(node.start),
            className: "inline-flex items-center",
        };

        if (node.type === "text") {
            const insideText = cursor >= node.start && cursor <= node.end;
            const offset = insideText ? Math.max(0, Math.min(cursor - node.start, node.value.length)) : -1;
            const beforeText = node.value.slice(0, Math.max(0, offset));
            const afterText = node.value.slice(Math.max(0, offset));
            const showCursor = insideText && cursorPath[cursorPath.length - 1]?.node === node;

            return (
                <span
                    {...commonProps}
                    className="inline-flex items-center whitespace-pre text-base text-primary"
                >
                    {beforeText}
                    {showCursor && isFocused ? renderCursor(`text-${index}-${node.start}-${node.end}-${offset}`) : null}
                    {afterText || " "}
                </span>
            );
        }

        if (node.type === "symbol") {
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            const showCursorAfter = shouldRenderCursorAtBoundary(node, cursor, "end", cursorPath);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex items-center px-1 text-base text-primary`}
                >
                    {showCursorBefore && renderCursor(`symbol-before-${index}-${node.start}`)}
                    {node.display}
                    {showCursorAfter && renderCursor(`symbol-after-${index}-${node.end}`)}
                </span>
            );
        }

        if (node.type === "placeholder") {
            const showCursor = cursor === node.start && cursorPath[cursorPath.length - 1]?.node === node;
            return (
                <span
                    {...commonProps}
                    className="inline-flex items-center"
                    style={{ width: 0, minWidth: 0, padding: 0, margin: 0 }}
                >
                    {showCursor ? renderCursor(`placeholder-${index}-${node.start}`) : null}
                </span>
            );
        }

        if (node.type === "group") {
            const groupNode = node as Extract<MathNode, {type:"group"}>;

            // Cursor is before '(' — show before the opening bracket
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            // Cursor is after ')' — show after the closing bracket
            const showCursorAfter = cursor === node.end && cursorPath[cursorPath.length - 1]?.node === node;

            // FIX: cursor is inside the brackets but NOT inside any child node
            // This handles the case where children exist but cursor is between them or at boundary
            const deepestNode = cursorPath[cursorPath.length - 1]?.node;
            const cursorIsInsideGroup = cursor > node.start && cursor < node.end;

            // Check if cursor is inside the group region at the group level (not in a child)
            const pathHasGroupEntry = cursorPath.some(e => e.node === node && e.region === "group");
            // If we're in the group region, the cursor rendering is handled by inner renderMathNodes call
            // But if no children contain the cursor, we need to show it ourselves
            const innerCursorInEmptyGroup = groupNode.children.length === 0 && cursor > node.start && cursor < node.end;

            // For non-empty groups: show cursor if cursor is at node.end - 1 (just before ')')
            // and no child claimed the cursor
            const cursorJustBeforeClose = cursor === node.end - 1 && cursorIsInsideGroup && !groupNode.children.some(c => cursor >= c.start && cursor <= c.end);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex items-center`}
                >
                    {showCursorBefore && renderCursor(`group-before-${index}-${node.start}`)}
                    <span
                        className="px-0.5"
                        onClick={(e) => { e.stopPropagation(); onClick(node.start + 1); }}
                    >(</span>
                    {groupNode.children.length === 0 ? (
                        <span className="inline-flex items-center min-w-[0.75rem]">
                            {innerCursorInEmptyGroup ? renderCursor(`group-inner-${index}-${node.start}`) : " "}
                        </span>
                    ) : (
                        <span className="inline-flex items-center">
                            {renderMathNodes(groupNode.children, cursor, onClick, cursorPath, isFocused)}
                        </span>
                    )}
                    <span
                        className="px-0.5"
                        onClick={(e) => { e.stopPropagation(); onClick(node.end); }}
                    >)</span>
                    {showCursorAfter && renderCursor(`group-after-${index}-${node.end}`)}
                </span>
            );
        }

        if (node.type === "frac") {
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            const showCursorAfter = shouldRenderCursorAtBoundary(node, cursor, "end", cursorPath);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex flex-col items-center mx-0.5`}
                >
                    {showCursorBefore && renderCursor(`frac-before-${index}-${node.start}`)}
                    <span
                        className="border-b border-current px-2 py-1"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick(node.numerator[0]?.start ?? node.start);
                        }}
                    >
                        {renderMathNodes(node.numerator, cursor, onClick, cursorPath, isFocused)}
                    </span>
                    <span
                        className="px-2 py-1"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick(node.denominator[0]?.start ?? node.start);
                        }}
                    >
                        {renderMathNodes(node.denominator, cursor, onClick, cursorPath, isFocused)}
                    </span>
                    {showCursorAfter && renderCursor(`frac-after-${index}-${node.end}`)}
                </span>
            );
        }

        if (node.type === "sqrt") {
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            const showCursorAfter = shouldRenderCursorAtBoundary(node, cursor, "end", cursorPath);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex items-center mx-0.5`}
                >
                    {showCursorBefore && renderCursor(`sqrt-before-${index}-${node.start}`)}
                    <span className="text-lg">√</span>
                    <span className="border border-current rounded-sm px-2 py-1">
                        {renderMathNodes(node.body, cursor, onClick, cursorPath, isFocused)}
                    </span>
                    {showCursorAfter && renderCursor(`sqrt-after-${index}-${node.end}`)}
                </span>
            );
        }

        if (node.type === "sup") {
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            const showCursorAfter = shouldRenderCursorAtBoundary(node, cursor, "end", cursorPath);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex items-baseline mx-0.5`}
                >
                    {showCursorBefore && renderCursor(`sup-before-${index}-${node.start}`)}
                    {renderMathNodes(node.base, cursor, onClick, cursorPath, isFocused)}
                    <sup className="text-sm leading-none">{renderMathNodes(node.exponent, cursor, onClick, cursorPath, isFocused)}</sup>
                    {showCursorAfter && renderCursor(`sup-after-${index}-${node.end}`)}
                </span>
            );
        }

        if (node.type === "sub") {
            const showCursorBefore = shouldRenderCursorAtBoundary(node, cursor, "start", cursorPath);
            const showCursorAfter = shouldRenderCursorAtBoundary(node, cursor, "end", cursorPath);

            return (
                <span
                    {...commonProps}
                    className={`inline-flex items-baseline mx-0.5`}
                >
                    {showCursorBefore && renderCursor(`sub-before-${index}-${node.start}`)}
                    {renderMathNodes(node.base, cursor, onClick, cursorPath, isFocused)}
                    <sub className="text-sm leading-none">{renderMathNodes(node.subscript, cursor, onClick, cursorPath, isFocused)}</sub>
                    {showCursorAfter && renderCursor(`sub-after-${index}-${node.end}`)}
                </span>
            );
        }

        return null;
    };

    return nodes.map(renderNode);
}

export default function MathShorthandEditor({ value, onChange, placeholder, disabled }: MathShorthandEditorProps) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [cursorIndex, setCursorIndex] = React.useState(value.length);
    const [isFocused, setIsFocused] = React.useState(false);

    const nodes = React.useMemo(() => parseMathExpression(value), [value]);
    const latex = React.useMemo(() => renderLaTeX(nodes), [nodes]);
    const cursorPath = React.useMemo(() => findNodePath(nodes, cursorIndex) ?? [], [nodes, cursorIndex]);

    React.useEffect(() => {
        onChange(value, latex);
    }, [value, latex, onChange]);

    React.useEffect(() => {
        const input = inputRef.current;
        if (input && document.activeElement === input) {
            input.setSelectionRange(cursorIndex, cursorIndex);
        }
    }, [cursorIndex]);

    const handleRawChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        const selection = event.target.selectionStart ?? text.length;
        setCursorIndex(selection);
        onChange(text, renderLaTeX(parseMathExpression(text)));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            return;
        }

        if (event.key === "Tab") {
            event.preventDefault();
            const next = findFractionTabTarget(nodes, cursorIndex);
            if (next !== null) {
                setCursorIndex(next);
            }
        }

        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            const path = findNodePath(nodes, cursorIndex);
            if (path) {
                const nextCursor =
                    event.key === "ArrowRight"
                        ? getEscapePositionForRight(path, cursorIndex)
                        : getEscapePositionForLeft(path, cursorIndex);

                if (nextCursor !== null && nextCursor !== cursorIndex) {
                    event.preventDefault();
                    setCursorIndex(nextCursor);
                    return;
                }
            }
        }

        if (event.key === "Backspace") {
            const input = inputRef.current;
            if (!input || input.selectionStart !== input.selectionEnd) {
                return;
            }
            const range = getTokenDeleteRange(value, cursorIndex);
            if (range.start < cursorIndex && range.end === cursorIndex && range.end - range.start > 1) {
                event.preventDefault();
                const updated = value.slice(0, range.start) + value.slice(cursorIndex);
                setCursorIndex(range.start);
                onChange(updated, renderLaTeX(parseMathExpression(updated)));
            }
        }
    };

    const focusInput = React.useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const handleClickPosition = (position: number) => {
        setCursorIndex(position);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full rounded-2xl border border-primary/20 bg-white p-3 text-primary">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleRawChange}
                onKeyDown={handleKeyDown}
                onClick={(event) => {
                    setCursorIndex(event.currentTarget.selectionStart ?? value.length);
                }}
                onSelect={(event) => {
                    setCursorIndex(event.currentTarget.selectionStart ?? value.length);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                className="pointer-events-none absolute inset-0 opacity-0 h-full w-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="text"
            />
            <div
                onClick={focusInput}
                className="relative min-h-[4rem] cursor-text text-left"
            >
                {value.trim().length === 0 ? (
                    <div className="min-h-[4rem] flex items-start">
                        {isFocused ? (
                            <span className="inline-block h-6 w-[1px] bg-primary animate-pulse mt-0.5" aria-hidden="true" />
                        ) : (
                            <span className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                {placeholder || "Type math shorthand here. Example: a/b, sqrt(2), pi, theta."}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-0.5 text-base leading-relaxed">
                        {renderMathNodes(nodes, cursorIndex, handleClickPosition, cursorPath, isFocused)}
                    </div>
                )}
            </div>
            {/* Debug panel 
            <div className="mt-3 rounded-2xl border border-primary/10 bg-primary/5 p-3 text-xs text-primary">
                <div className="mb-2 font-semibold text-sm">Debug</div>
                <div className="mb-1">
                    <span className="font-medium">LaTeX:</span>{" "}
                    <code className="font-mono break-all">{latex || ""}</code>
                </div>
                <div className="mb-1">
                    <span className="font-medium">Cursor:</span>{" "}{cursorIndex}
                </div>
                <div>
                    <span className="font-medium">Path:</span>{" "}
                    <span className="font-mono break-all">
                        {cursorPath.length > 0
                            ? cursorPath
                                  .map((entry, idx) =>
                                      `${idx > 0 ? " > " : ""}${entry.region}:${entry.node.type}[${entry.node.start}-${entry.node.end}]`
                                  )
                                  .join("")
                            : "root"}
                    </span>
                </div>
            </div>
            */}
        </div>
    );
}