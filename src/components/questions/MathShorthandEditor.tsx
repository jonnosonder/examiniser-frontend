// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import * as React from "react";
import { MathfieldElement } from "mathlive";
import { t } from "i18next";
MathfieldElement.fontsDirectory = "/fonts/mathlive";

export type MathShorthandEditorProps = {
    value: string;
    onChange: (value: string, latex: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export function shorthandToLatex(value: string): string {
    if (typeof window === "undefined" || value.trim().length === 0) {
        return "";
    }

    const mathfield = new MathfieldElement();
    mathfield.setValue(value, { format: "ascii-math" });
    return mathfield.getValue("latex");
}

export default function MathShorthandEditor({ value, onChange, placeholder, disabled }: MathShorthandEditorProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const mathfieldRef = React.useRef<MathfieldElement | null>(null);

    React.useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const mathfield = new MathfieldElement();
        mathfield.smartFence = true;
        mathfield.smartSuperscript = true;
        mathfield.style.width = "100%";
        mathfield.style.height = "100%";
        mathfield.style.minHeight = "2rem";
        mathfield.style.padding = "0.75rem 0.5rem";
        mathfield.style.border = "1px solid rgba(156, 163, 175, 0.6)";
        mathfield.style.borderRadius = "1.5rem";
        mathfield.style.outline = "none";
        mathfield.style.boxShadow = "none";
        mathfield.style.fontSize = "1.3rem";
        mathfield.style.transition = "box-shadow 200ms ease";
        mathfield.style.setProperty("--ml-caret-color", "var(--accent)");
        mathfield.style.setProperty("--caret-color", "var(--accent)");
        mathfield.style.setProperty("--contains-highlight-background-color", "transparent");
        mathfield.style.setProperty("--highlight-text", "transparent");

        mathfield.style.setProperty("--ml-focus-border-color", "transparent");
        mathfield.style.setProperty("--ml-focus-ring-color", "transparent");
        mathfield.style.setProperty("--ml-contains-highlight-color", "transparent");
        mathfield.placeholder = placeholder ?? "Type math shorthand here. Example: a/b, sqrt(2), pi, theta.";
        mathfield.readOnly = Boolean(disabled);
        mathfield.setValue(value || "", { format: "ascii-math", selectionMode: "after" });
        mathfield.setAttribute("virtual-keyboard-mode", "manual");

        const handleInput = () => {
            const asciiValue = mathfield.getValue("ascii-math");
            const latexValue = mathfield.getValue("latex");
            onChange(asciiValue, latexValue);
        };

        mathfield.addEventListener("input", handleInput);
        containerRef.current.appendChild(mathfield);
        mathfieldRef.current = mathfield;

        const focusShadow = "0 0 0 0.2rem var(--accent)";
        mathfield.addEventListener("focusin", () => {
            mathfield.style.boxShadow = focusShadow;
        });

        mathfield.addEventListener("focusout", () => {
            mathfield.style.boxShadow = "none";
        });

        return () => {
            mathfield.removeEventListener("input", handleInput);
            mathfield.remove();
            mathfieldRef.current = null;
        };
    }, []);

    React.useEffect(() => {
        const mathfield = mathfieldRef.current;
        if (!mathfield) {
            return;
        }

        mathfield.placeholder = placeholder ?? "Type math shorthand here. Example: a/b, sqrt(2), pi, theta.";
        mathfield.readOnly = Boolean(disabled);

        const currentValue = mathfield.getValue("ascii-math");
        if (value !== currentValue) {
            mathfield.setValue(value || "", { format: "ascii-math", selectionMode: "after" });
        }
    }, [value, placeholder, disabled]);

    return (
        <div ref={containerRef} className="min-h-[4rem] w-full" />
    );
}
