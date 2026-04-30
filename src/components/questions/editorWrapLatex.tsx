import { BlockMath } from 'react-katex';

interface EditorWrapLatexProps {
  latex: string;
  maxLineWidth?: number;
  fontSize: number;
  textAlign?: 'left' | 'center' | 'right';
  debug?: boolean;
}

type LineAlign = EditorWrapLatexProps['textAlign'];

const SPACING_COMMAND_PATTERN = /^(left|right|big|Big|bigg|Bigg|displaystyle|textstyle|scriptstyle|scriptscriptstyle|,|;|!| |quad|qquad)$/;
const OPERATORS = ['+', '-', '='];
const TEXT_WIDTH_SAFETY_FACTOR = 1.1;
const LATEX_WIDTH_SAFETY_FACTOR = 1.14;
const SCRIPT_WIDTH_FACTOR = 1;
const BASE_FONT_SIZE = 2.4;
const EARLY_WRAP_RATIO = 0.80;
const MATRIX_VECTOR_ENV_PATTERN = /\\begin\{(matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix)\}[\s\S]*?\\end\{\1\}/g;
const MATRIX_VECTOR_PLACEHOLDER_PATTERN = /__MATRIX_BLOCK_(\d+)__/g;

type Token =
  | { type: 'text'; content: string }
  | { type: 'latex'; content: string };

function readCommand(input: string, start: number): { command: string; next: number } {
  let i = start + 1;
  while (i < input.length && /[A-Za-z]/.test(input[i])) i++;
  if (i === start + 1) {
    return { command: input[start + 1] ?? '', next: Math.min(start + 2, input.length) };
  }
  return { command: input.slice(start + 1, i), next: i };
}

function findMatchingBrace(input: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < input.length; i++) {
    if (input[i] === '{') depth++;
    else if (input[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return input.length - 1;
}

function tokenize(latex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < latex.length) {
    const textMatch = latex.slice(i).match(/^\\text\{/);
    if (textMatch) {
      let depth = 1;
      let j = i + textMatch[0].length;
      while (j < latex.length && depth > 0) {
        if (latex[j] === '{') depth++;
        else if (latex[j] === '}') depth--;
        j++;
      }
      tokens.push({ type: 'text', content: latex.slice(i + textMatch[0].length, j - 1) });
      i = j;
      continue;
    }

    const next = latex.slice(i).search(/\\text\{/);
    if (next === -1) {
      tokens.push({ type: 'latex', content: latex.slice(i) });
      break;
    }

    tokens.push({ type: 'latex', content: latex.slice(i, i + next) });
    i += next;
  }

  return tokens;
}

function estimateLatexVisualWidth(input: string): number {
  let width = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '^' || ch === '_') {
      const next = i + 1;
      if (next >= input.length) continue;

      if (input[next] === '{') {
        const end = findMatchingBrace(input, next);
        width += estimateLatexVisualWidth(input.slice(next + 1, end)) * SCRIPT_WIDTH_FACTOR;
        i = end;
      } else if (input[next] === '\\') {
        const { command, next: afterCommand } = readCommand(input, next);
        width += (command.length > 1 ? 1 : 0.8) * SCRIPT_WIDTH_FACTOR;
        i = afterCommand - 1;
      } else {
        width += 0.75 * SCRIPT_WIDTH_FACTOR;
        i = next;
      }
      continue;
    }

    if (ch === '\\') {
      const { command, next } = readCommand(input, i);
      if (command === '\\') {
        width += 1;
      } else if (!SPACING_COMMAND_PATTERN.test(command)) {
        width += command.length > 1 ? 1 : 0.8;
      }
      i = next - 1;
      continue;
    }

    if (ch === '{' || ch === '}') continue;
    if (ch.trim() === '') {
      width += 0.35;
      continue;
    }

    width += 1;
  }

  return width;
}

function estimatePlainTextWidth(text: string): number {
  let width = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === ' ') {
      width += 0.45;
      continue;
    }

    if (ch >= '0' && ch <= '9') {
      width += 1;
      continue;
    }

    if (ch === ',' || ch === '.' || ch === ';' || ch === ':' || ch === '!' || ch === '?') {
      width += 0.65;
      continue;
    }

    if (ch === '\'' || ch === '"') {
      width += 0.45;
      continue;
    }

    width += 1.08;
  }

  return width * TEXT_WIDTH_SAFETY_FACTOR;
}

function getFontScale(fontSize: number): number {
  return Math.max(0.5, fontSize / BASE_FONT_SIZE);
}

function estimateTokenWidth(token: Token, fontSize: number): number {
  const fontScale = getFontScale(fontSize);
  const rawWidth = token.type === 'text'
    ? estimatePlainTextWidth(token.content)
    : estimateLatexVisualWidth(token.content) * LATEX_WIDTH_SAFETY_FACTOR;
  return rawWidth * fontScale;
}

function getTargetLineWidth(maxLineWidth: number): number {
  return Math.max(8, maxLineWidth * EARLY_WRAP_RATIO);
}

function estimateWidth(latex: string, fontSize: number): number {
  return tokenize(latex).reduce((sum, token) => sum + estimateTokenWidth(token, fontSize), 0);
}

function tokenToLatex(token: Token): string {
  return token.type === 'text' ? `\\text{${token.content}}` : token.content;
}

function findOpeningBracketInLookback(segment: string, lookback: number): number {
  const start = Math.max(0, segment.length - lookback);

  for (let i = segment.length - 1; i >= start; i--) {
    const ch = segment[i];
    let bracketStart = -1;

    if (ch === '(' || ch === '[') {
      bracketStart = i;
    } else if (ch === '\\' && (segment.slice(i, i + 7) === '\\left(' || segment.slice(i, i + 7) === '\\left[')) {
      bracketStart = i;
    }

    if (bracketStart >= 0) {
      const before = segment.slice(0, bracketStart).trimEnd();
      const lastSpace = before.lastIndexOf(' ');
      const trailing = before.slice(lastSpace + 1);
      if (trailing.length > 0 && trailing.length <= 3) {
        return lastSpace + 1;
      }
      return bracketStart;
    }
  }

  return -1;
}

function findBackwardTextWrapBoundary(text: string, fromIndex: number): number {
  for (let i = Math.min(fromIndex, text.length - 1); i >= 0; i--) {
    const ch = text[i];
    if (ch === ' ' || ch === '\\') {
      return i + 1;
    }
  }
  return -1;
}

function logWrapDebug(debug: boolean, message: string, details?: unknown) {
  if (!debug) return;
  if (details === undefined) {
    console.debug(`[EditorWrapLatex] ${message}`);
    return;
  }
  console.debug(`[EditorWrapLatex] ${message}`, details);
}

function breakLine(line: string, maxLineWidth: number, fontSize: number, debug: boolean): string[] {
  const tokens = tokenize(line);
  const lines: string[] = [];
  let currentTokens: Token[] = [];
  let currentWidth = 0;
  const fontScale = getFontScale(fontSize);
  const targetLineWidth = getTargetLineWidth(maxLineWidth);

  logWrapDebug(debug, 'breakLine:start', {
    line,
    tokenCount: tokens.length,
    maxLineWidth,
    targetLineWidth,
    fontSize,
    fontScale,
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenWidth = estimateTokenWidth(token, fontSize);

    if (currentWidth + tokenWidth <= targetLineWidth) {
      currentTokens.push(token);
      currentWidth += tokenWidth;
      logWrapDebug(debug, 'token:fits', {
        tokenIndex: i,
        tokenType: token.type,
        tokenWidth,
        currentWidth,
        targetLineWidth,
      });
      continue;
    }

    logWrapDebug(debug, 'token:overflow', {
      tokenIndex: i,
      tokenType: token.type,
      tokenWidth,
      currentWidth,
      targetLineWidth,
    });

    if (token.type === 'text') {
      let remaining = token.content;

      while (remaining.length > 0) {
        const available = Math.max(0.5, targetLineWidth - currentWidth);

        if (estimatePlainTextWidth(remaining) * fontScale <= available) {
          currentTokens.push({ type: 'text', content: remaining });
          currentWidth += estimatePlainTextWidth(remaining) * fontScale;
          remaining = '';
          break;
        }

        let breakAt = -1;
        let consumed = 0;
        let lastColonBreak = -1;

        for (let k = 0; k < remaining.length; k++) {
          const char = remaining[k];
          consumed += estimatePlainTextWidth(char) * fontScale;

          if (char === ':') {
            lastColonBreak = k + 1;
          }

          if (consumed > available) {
            if (lastColonBreak > 0) {
              breakAt = lastColonBreak;
              if (remaining[breakAt] === ' ') breakAt++;
              logWrapDebug(debug, 'text:break-at-colon', {
                tokenIndex: i,
                available,
                consumed,
                breakAt,
              });
            } else {
              const colonAhead = remaining.indexOf(':', k);
              if (colonAhead >= 0 && colonAhead - k <= 6) {
                const uptoColon = remaining.slice(0, colonAhead + 1);
                if (estimatePlainTextWidth(uptoColon) * fontScale <= available * 1.15) {
                  breakAt = colonAhead + 1;
                  if (remaining[breakAt] === ' ') breakAt++;
                  logWrapDebug(debug, 'text:break-at-nearby-colon', {
                    tokenIndex: i,
                    available,
                    consumed,
                    breakAt,
                  });
                }
              }
            }

            if (breakAt < 0) {
              const backwardBoundary = findBackwardTextWrapBoundary(remaining, k);

              if (backwardBoundary > 0) {
                breakAt = backwardBoundary;
                logWrapDebug(debug, 'text:break-at-backward-space-or-slash', {
                  tokenIndex: i,
                  available,
                  consumed,
                  chosenBreakAt: breakAt,
                });
              } else if (currentTokens.length > 0) {
                // Keep words intact: move the full remainder to the next line if current line has content.
                breakAt = 0;
                logWrapDebug(debug, 'text:carry-word-to-next-line', {
                  tokenIndex: i,
                  available,
                  consumed,
                });
              } else {
                breakAt = Math.max(1, k);
                logWrapDebug(debug, 'text:hard-break-fallback', {
                  tokenIndex: i,
                  available,
                  consumed,
                  chosenBreakAt: breakAt,
                });
              }
            }
            break;
          }
        }

        if (breakAt < 0) {
          breakAt = remaining.length;
        }

        const piece = remaining.slice(0, breakAt);
        if (piece.length > 0) {
          currentTokens.push({ type: 'text', content: piece });
        }

        logWrapDebug(debug, 'line:push-from-text', {
          tokenIndex: i,
          linePreview: currentTokens.map(tokenToLatex).join(''),
          remainingAfterBreak: remaining.slice(breakAt).trimStart(),
        });
        lines.push(currentTokens.map(tokenToLatex).join(''));
        currentTokens = [];
        currentWidth = 0;
        remaining = remaining.slice(breakAt).trimStart();
      }

      continue;
    }

    let depth = 0;
    let segment = '';
    let broke = false;

    for (let j = 0; j < token.content.length; j++) {
      const ch = token.content[j];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;

      if (depth === 0 && OPERATORS.includes(ch) && currentWidth + estimateWidth(segment, fontSize) >= targetLineWidth) {
        const bracketIndex = findOpeningBracketInLookback(segment, 20);

        if (bracketIndex > 0) {
          const beforeBracket = segment.slice(0, bracketIndex).trimEnd();
          const fromBracket = segment.slice(bracketIndex).trimStart();

          if (beforeBracket) {
            currentTokens.push({ type: 'latex', content: beforeBracket });
          }

          if (currentTokens.length > 0) {
            logWrapDebug(debug, 'line:push-from-latex-bracket-split', {
              tokenIndex: i,
              operator: ch,
              bracketIndex,
              linePreview: currentTokens.map(tokenToLatex).join(''),
            });
            lines.push(currentTokens.map(tokenToLatex).join(''));
          }

          currentTokens = [];
          currentWidth = 0;

          if (fromBracket) {
            currentTokens.push({ type: 'latex', content: fromBracket });
            currentWidth += estimateWidth(fromBracket, fontSize);
          }

          segment = ch;
          broke = true;
          continue;
        }

        currentTokens.push({ type: 'latex', content: segment.trimEnd() });
        logWrapDebug(debug, 'line:push-from-latex-operator-split', {
          tokenIndex: i,
          operator: ch,
          linePreview: currentTokens.map(tokenToLatex).join(''),
        });
        lines.push(currentTokens.map(tokenToLatex).join(''));
        currentTokens = [{ type: 'latex', content: '\\quad ' + ch }];
        currentWidth = estimateWidth('\\quad ' + ch, fontSize);
        segment = '';
        broke = true;
        continue;
      }

      segment += ch;
    }

    if (segment) {
      currentTokens.push({ type: 'latex', content: segment });
      currentWidth += estimateWidth(segment, fontSize);
    }

    if (!broke && currentWidth > targetLineWidth) {
      logWrapDebug(debug, 'line:push-from-post-token-overflow', {
        tokenIndex: i,
        currentWidth,
        targetLineWidth,
        linePreview: currentTokens.map(tokenToLatex).join(''),
      });
      lines.push(currentTokens.map(tokenToLatex).join(''));
      currentTokens = [];
      currentWidth = 0;
    }
  }

  if (currentTokens.length > 0) {
    logWrapDebug(debug, 'line:push-final', {
      linePreview: currentTokens.map(tokenToLatex).join(''),
    });
    lines.push(currentTokens.map(tokenToLatex).join(''));
  }

  logWrapDebug(debug, 'breakLine:done', {
    lineCount: lines.length,
    lines,
  });
  return lines.length > 0 ? lines : [line];
}

function withProtectedMatrixBlocks(latex: string, transform: (value: string) => string): string {
  const blocks: string[] = [];
  const masked = latex.replace(MATRIX_VECTOR_ENV_PATTERN, (match) => {
    const placeholder = `__MATRIX_BLOCK_${blocks.length}__`;
    blocks.push(match);
    return placeholder;
  });

  const transformed = transform(masked);
  return transformed.replace(MATRIX_VECTOR_PLACEHOLDER_PATTERN, (_, indexText: string) => {
    const index = Number.parseInt(indexText, 10);
    return blocks[index] ?? '';
  });
}

function stripLineBreaks(latex: string): string {
  return latex.trim();
}

function normalizeSpacingAndPunctuation(latex: string): string {
  return withProtectedMatrixBlocks(latex, (value) => (
    value
      .replace(/\s*\\\\\s*/g, ' ')
      .replace(/\.([A-Z])/g, '. $1')
      .replace(/ {2,}/g, ' ')
      .trim()
  ));
}

function normalizeLineStartAfterBreak(line: string): string {
  let normalized = line;

  if (normalized.startsWith('\\ ')) {
    normalized = normalized.slice(2).trimStart();
  }

  if (normalized.startsWith('\\text{ ')) {
    normalized = `\\text{${normalized.slice('\\text{ '.length)}`;
  }

  return normalized;
}

function getArrayAlignment(textAlign: LineAlign): 'l' | 'c' | 'r' {
  if (textAlign === 'left') return 'l';
  if (textAlign === 'right') return 'r';
  return 'c';
}

function wrapLatex(latex: string, maxLineWidth: number, fontSize: number, textAlign: LineAlign, debug: boolean): string {
  const cleaned = normalizeSpacingAndPunctuation(stripLineBreaks(latex));
  const targetLineWidth = getTargetLineWidth(maxLineWidth);
  const estimated = estimateWidth(cleaned, fontSize);

  logWrapDebug(debug, 'wrapLatex:input', {
    latex,
    cleaned,
    fontSize,
    maxLineWidth,
    targetLineWidth,
    estimated,
    textAlign,
  });

  if (estimated <= targetLineWidth) {
    logWrapDebug(debug, 'wrapLatex:no-wrap-needed', {
      cleaned,
      estimated,
      targetLineWidth,
    });
    return cleaned;
  }

  const result = breakLine(cleaned, maxLineWidth, fontSize, debug);
  const normalizedResult = result.map((line, index) => (
    index === 0 ? line : normalizeLineStartAfterBreak(line)
  ));
  const wrapped = normalizedResult.join(' \\\\ ');
  if (result.length <= 1) {
    logWrapDebug(debug, 'wrapLatex:single-line-after-break', { wrapped });
    return wrapped;
  }

  const alignment = getArrayAlignment(textAlign);
  const wrappedArray = `\\begin{array}{${alignment}} ${wrapped} \\end{array}`;
  logWrapDebug(debug, 'wrapLatex:wrapped-array', {
    alignment,
    lineCount: normalizedResult.length,
    wrappedArray,
  });
  return wrappedArray;
}

export function EditorWrapLatex({ latex, maxLineWidth = 60, fontSize = 18, textAlign = 'center', debug = false }: EditorWrapLatexProps) {
  const wrapped = wrapLatex(latex, maxLineWidth, fontSize, textAlign, debug);

  console.log(`Final wrapped LaTeX: ${wrapped}`);
  return (
    <>
      <div
        className={`editor-wrapped-math editor-wrapped-math-${textAlign}`}
        style={{
          overflow: 'hidden',
          width: '100%',
          textAlign,
          fontSize: `${fontSize}px`,
          paddingTop: '0.6em',
          paddingBottom: '0.4em',
        }}
      >
        <BlockMath math={wrapped} />
      </div>
      <style jsx global>{`
        .editor-wrapped-math .katex-display {
          margin: 0;
        }

        .editor-wrapped-math .katex-display > .katex {
          width: 100%;
          white-space: normal;
        }

        .editor-wrapped-math-left .katex-display {
          text-align: left;
        }

        .editor-wrapped-math-left .katex-display > .katex {
          margin-left: 0;
          margin-right: auto;
          text-align: left;
        }

        .editor-wrapped-math-center .katex-display {
          text-align: center;
        }

        .editor-wrapped-math-center .katex-display > .katex {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .editor-wrapped-math-right .katex-display {
          text-align: right;
        }

        .editor-wrapped-math-right .katex-display > .katex {
          margin-left: auto;
          margin-right: 0;
          text-align: right;
        }
      `}</style>
    </>
  );
}