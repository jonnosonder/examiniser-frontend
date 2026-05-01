import { BlockMath } from 'react-katex';
import katex from 'katex';

interface EditorWrapLatexProps {
  latex: string;
  maxLineWidth?: number;
  fontSize: number;
  textAlign?: 'left' | 'center' | 'right';
  debug?: boolean;
}

type LineAlign = EditorWrapLatexProps['textAlign'];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPACING_COMMAND_PATTERN =
  /^(left|right|big|Big|bigg|Bigg|displaystyle|textstyle|scriptstyle|scriptscriptstyle|,|;|!| |quad|qquad)$/;

/** LaTeX operators that are valid line-break points. */
const OPERATORS = ['+', '-', '='];

/** Safety margins applied after measurement to avoid tight wrapping. */
const TEXT_WIDTH_SAFETY_FACTOR = 1.1;
const LATEX_WIDTH_SAFETY_FACTOR = 1.1;

/**
 * Reference font size used for em-unit normalisation.
 * KaTeX inline mode renders math at the surrounding font size; we ask it to
 * render at exactly REFERENCE_FONT_PX so that `widthPx / REFERENCE_FONT_PX`
 * gives a stable em value regardless of page styles.
 */
const REFERENCE_FONT_PX = 16;

/**
 * Fraction of maxLineWidth we actually try to fill.
 * Leaving headroom avoids off-by-one overflows caused by measurement error.
 */
const EARLY_WRAP_RATIO = 0.9;

const MATRIX_VECTOR_ENV_PATTERN =
  /\\begin\{(matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix)\}[\s\S]*?\\end\{\1\}/g;
const MATRIX_VECTOR_PLACEHOLDER_PATTERN = /__MATRIX_BLOCK_(\d+)__/g;

/** Text-mode command names whose content should be measured as plain text. */
const TEXT_MODE_COMMANDS = new Set([
  'text',
  'mathrm',
  'mathbf',
  'mathit',
  'mathsf',
  'mathtt',
  'operatorname',
  'textrm',
  'textbf',
  'textit',
  'textsf',
  'texttt',
]);

// ---------------------------------------------------------------------------
// Caches
// ---------------------------------------------------------------------------

const textWidthCache = new Map<string, number>();
const latexWidthCache = new Map<string, number>();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Token =
  | { type: 'text'; content: string }
  | { type: 'latex'; content: string };

type SegmentDecision = {
  segment: string;
  estimatedWidth: number;
  wrapped: boolean;
  outputLines: string[];
};

type WrapDebugTrace = {
  cleaned: string;
  targetLineWidth: number;
  segments: SegmentDecision[];
  finalLines: string[];
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Read a LaTeX command starting at `start` (which must be the `\` character).
 * Returns the command name (without leading `\`) and the index of the first
 * character after the command.
 */
function readCommand(
  input: string,
  start: number,
): { command: string; next: number } {
  let i = start + 1;
  // Single non-letter character after backslash (e.g. \\ \, \; \! \  )
  if (i < input.length && !/[A-Za-z]/.test(input[i])) {
    return { command: input[i] ?? '', next: i + 1 };
  }
  while (i < input.length && /[A-Za-z]/.test(input[i])) i++;
  return { command: input.slice(start + 1, i), next: i };
}

/**
 * Find the index of the `}` that closes the `{` at `openIndex`.
 */
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

function logWrapDebug(debug: boolean, message: string, details?: unknown) {
  if (!debug) return;
  if (details === undefined) {
    console.debug(`[EditorWrapLatex] ${message}`);
  } else {
    console.debug(`[EditorWrapLatex] ${message}`, details);
  }
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Split a LaTeX string into runs of plain text (inside text-mode commands such
 * as `\text{}`, `\mathrm{}`, `\mathbf{}`, etc.) and runs of math LaTeX.
 *
 * This matters because the two need different width-estimation strategies.
 */
function tokenize(latex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < latex.length) {
    // Check whether the current position starts a text-mode command.
    if (latex[i] === '\\') {
      const { command, next: afterCommand } = readCommand(latex, i);

      if (TEXT_MODE_COMMANDS.has(command) && latex[afterCommand] === '{') {
        // Consume the braced argument, honouring nested braces.
        let depth = 1;
        let j = afterCommand + 1;
        while (j < latex.length && depth > 0) {
          if (latex[j] === '{') depth++;
          else if (latex[j] === '}') depth--;
          j++;
        }
        tokens.push({
          type: 'text',
          content: latex.slice(afterCommand + 1, j - 1),
        });
        i = j;
        continue;
      }
    }

    // Find the next text-mode command.
    const rest = latex.slice(i);
    let nextTextCmd = -1;

    for (const cmd of TEXT_MODE_COMMANDS) {
      const idx = rest.search(new RegExp(`\\\\${cmd}\\{`));
      if (idx !== -1 && (nextTextCmd === -1 || idx < nextTextCmd)) {
        nextTextCmd = idx;
      }
    }

    if (nextTextCmd === -1) {
      // No more text-mode commands — everything remaining is LaTeX.
      if (rest.length > 0) tokens.push({ type: 'latex', content: rest });
      break;
    }

    if (nextTextCmd > 0) {
      tokens.push({ type: 'latex', content: rest.slice(0, nextTextCmd) });
    }
    i += nextTextCmd;
  }

  return tokens;
}

function tokenToLatex(token: Token): string {
  return token.type === 'text' ? `\\text{${token.content}}` : token.content;
}

// ---------------------------------------------------------------------------
// Width estimation – plain text (canvas)
// ---------------------------------------------------------------------------

let _canvasCtx: CanvasRenderingContext2D | null | undefined; // undefined = not yet initialised

function getMeasureCanvasContext(): CanvasRenderingContext2D | null {
  if (_canvasCtx !== undefined) return _canvasCtx;
  if (typeof document === 'undefined') {
    _canvasCtx = null;
    return null;
  }
  const canvas = document.createElement('canvas');
  _canvasCtx = canvas.getContext('2d');
  return _canvasCtx;
}

/**
 * Estimate the rendered width of a plain-text string in ems.
 * Uses a canvas with the KaTeX text font for accuracy; falls back to a
 * character-width heuristic in non-browser environments.
 */
function estimatePlainTextWidth(text: string): number {
  if (!text) return 0;

  const cached = textWidthCache.get(text);
  if (cached !== undefined) return cached;

  const ctx = getMeasureCanvasContext();
  let result: number;

  if (ctx) {
    // Match KaTeX's default text font as closely as possible.
    ctx.font = `${REFERENCE_FONT_PX}px KaTeX_Main, "Times New Roman", serif`;
    result = (ctx.measureText(text).width / REFERENCE_FONT_PX) * TEXT_WIDTH_SAFETY_FACTOR;
  } else {
    result = estimatePlainTextWidthHeuristic(text);
  }

  textWidthCache.set(text, result);
  return result;
}

function estimatePlainTextWidthHeuristic(text: string): number {
  // Approximate per-character widths in ems for a serif font.
  const NARROW_CHARS = new Set([
    'i', 'j', 'l', 'r', 't', 'f', '1', '!', '|', '.',
    ',', ';', ':', "'", '"', '`',
  ]);
  const WIDE_CHARS = new Set(['m', 'w', 'M', 'W']);

  let width = 0;
  for (const ch of text) {
    if (ch === ' ') { width += 0.3; continue; }
    if (NARROW_CHARS.has(ch)) { width += 0.45; continue; }
    if (WIDE_CHARS.has(ch)) { width += 1.3; continue; }
    if (ch >= '0' && ch <= '9') { width += 0.9; continue; }
    width += 1.0;
  }
  return width * TEXT_WIDTH_SAFETY_FACTOR;
}

// ---------------------------------------------------------------------------
// Width estimation – LaTeX (KaTeX DOM measurement)
// ---------------------------------------------------------------------------

/** Singleton hidden container reused across measurements to avoid layout thrash. */
let _measureContainer: HTMLSpanElement | null = null;

function getMeasureContainer(): HTMLSpanElement | null {
  if (typeof document === 'undefined') return null;
  if (_measureContainer && document.body.contains(_measureContainer)) {
    return _measureContainer;
  }
  const span = document.createElement('span');
  span.style.cssText = [
    'visibility:hidden',
    'position:absolute',
    'left:-99999px',
    'top:0',
    'white-space:nowrap',
    'pointer-events:none',
    // Force a known font size so that px→em conversion is stable.
    `font-size:${REFERENCE_FONT_PX}px`,
  ].join(';');
  document.body.appendChild(span);
  _measureContainer = span;
  return span;
}

/**
 * Estimate the rendered width of a LaTeX fragment in ems.
 * When running in a browser, renders via KaTeX into a hidden span and measures
 * the result. Falls back to a heuristic in non-browser environments.
 */
function estimateLatexVisualWidth(input: string): number {
  if (!input) return 0;

  const cached = latexWidthCache.get(input);
  if (cached !== undefined) return cached;

  if (typeof document === 'undefined') {
    return estimateLatexVisualWidthHeuristic(input);
  }

  const container = getMeasureContainer();
  if (!container) return estimateLatexVisualWidthHeuristic(input);

  let measuredEms = 0;
  try {
    katex.render(input, container, {
      throwOnError: false,
      displayMode: false,
      // Render at the reference size; the container already has font-size set.
    });
    const widthPx = container.getBoundingClientRect().width;
    measuredEms = widthPx / REFERENCE_FONT_PX;
  } catch {
    measuredEms = estimateLatexVisualWidthHeuristic(input);
  }

  latexWidthCache.set(input, measuredEms);
  return measuredEms;
}

function estimateLatexCommandWidth(
  command: string,
  shortW: number,
  defaultW: number,
): number {
  if (!command) return shortW;
  // Commands that have a well-known visual footprint.
  if (command === 'sqrt') return 2.8;
  if (command === 'frac' || command === 'dfrac' || command === 'tfrac') return 2.6;
  if (command === 'sum' || command === 'prod' || command === 'int') return 2.2;
  if (command === 'left' || command === 'right') return 0.4;
  if (command === 'cdot' || command === 'times' || command === 'div') return 1.0;
  if (command === 'leq' || command === 'geq' || command === 'neq') return 1.2;
  if (command === 'infty') return 1.4;
  return command.length > 1 ? defaultW : shortW;
}

/**
 * Heuristic width estimator used when KaTeX DOM measurement is unavailable.
 * Walks the LaTeX token stream and sums per-token width estimates.
 */
function estimateLatexVisualWidthHeuristic(input: string): number {
  const CHAR_WIDTH = 1.35;
  const SHORT_CMD_WIDTH = 1.0;
  const CMD_WIDTH = 1.2;
  const SPACE_WIDTH = 0.35;
  /**
   * FIX: superscripts/subscripts render at ~65% of normal size, so their
   * contribution to *horizontal* width is smaller, not larger.
   * (The old value of 1.2 was wrong — it inflated widths.)
   */
  const SCRIPT_WIDTH_FACTOR = 0.65;

  let width = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // ---- Superscript / subscript ----------------------------------------
    if (ch === '^' || ch === '_') {
      const next = i + 1;
      if (next >= input.length) continue;

      if (input[next] === '{') {
        const end = findMatchingBrace(input, next);
        width +=
          estimateLatexVisualWidthHeuristic(input.slice(next + 1, end)) *
          SCRIPT_WIDTH_FACTOR;
        i = end;
      } else if (input[next] === '\\') {
        const { command, next: afterCmd } = readCommand(input, next);
        width +=
          estimateLatexCommandWidth(command, SHORT_CMD_WIDTH, CMD_WIDTH) *
          SCRIPT_WIDTH_FACTOR;
        i = afterCmd - 1;
      } else {
        width += 0.9 * SCRIPT_WIDTH_FACTOR;
        i = next;
      }
      continue;
    }

    // ---- Commands --------------------------------------------------------
    if (ch === '\\') {
      const { command, next } = readCommand(input, i);
      if (command === '\\') {
        // Line break — no width contribution.
      } else if (SPACING_COMMAND_PATTERN.test(command)) {
        width += SPACE_WIDTH;
      } else {
        width += estimateLatexCommandWidth(command, SHORT_CMD_WIDTH, CMD_WIDTH);
      }
      i = next - 1;
      continue;
    }

    // ---- Braces ----------------------------------------------------------
    if (ch === '{' || ch === '}') continue;

    // ---- Whitespace ------------------------------------------------------
    if (ch.trim() === '') {
      width += SPACE_WIDTH;
      continue;
    }

    // ---- Regular character -----------------------------------------------
    width += CHAR_WIDTH;
  }

  return width;
}

// ---------------------------------------------------------------------------
// Token-level width + line width helpers
// ---------------------------------------------------------------------------

/**
 * Convert a font size in pixels to an em scale factor relative to the
 * reference font size used during KaTeX measurement.
 *
 * FIX: the original code used BASE_FONT_SIZE = 1 as the denominator, which
 * turned `fontSize=18` into a scale of 18 — multiplying all widths by 18×.
 * We normalise against REFERENCE_FONT_PX (16) instead.
 */
function getFontScale(fontSize: number): number {
  return Math.max(0.5, fontSize / REFERENCE_FONT_PX);
}

function estimateTokenWidth(token: Token, fontSize: number): number {
  const fontScale = getFontScale(fontSize);
  const rawWidth =
    token.type === 'text'
      ? estimatePlainTextWidth(token.content)
      : estimateLatexVisualWidth(token.content) * LATEX_WIDTH_SAFETY_FACTOR;
  return rawWidth * fontScale;
}

function estimateWidth(latex: string, fontSize: number): number {
  return tokenize(latex).reduce(
    (sum, token) => sum + estimateTokenWidth(token, fontSize),
    0,
  );
}

function getTargetLineWidth(maxLineWidth: number): number {
  const normalizedLineWidth = maxLineWidth / REFERENCE_FONT_PX;
  return Math.max(8, normalizedLineWidth * EARLY_WRAP_RATIO);
}

// ---------------------------------------------------------------------------
// Break-point search helpers
// ---------------------------------------------------------------------------

/**
 * Walk backwards from `fromIndex` looking for a whitespace or `\` character
 * that can serve as a word-wrap boundary inside a plain-text run.
 */
function findBackwardTextWrapBoundary(text: string, fromIndex: number): number {
  for (let i = Math.min(fromIndex, text.length - 1); i >= 0; i--) {
    const ch = text[i];
    if (ch === ' ' || ch === '\\') return i + 1;
  }
  return -1;
}

/**
 * Search backwards for a space in a LaTeX segment and return split index
 * (character after the space). Returns -1 when no boundary is found.
 */
function findBackwardLatexSpaceBoundary(segment: string): number {
  for (let i = segment.length - 1; i >= 0; i--) {
    if (segment[i] === ' ') {
      return i + 1;
    }
  }
  return -1;
}

function forceSplitLineByBackwardSpace(
  line: string,
  targetLineWidth: number,
  fontSize: number,
): string[] {
  let remaining = line.trim();
  const output: string[] = [];
  let guard = 0;

  while (remaining.length > 0 && guard < 200) {
    const width = estimateWidth(remaining, fontSize);
    if (width <= targetLineWidth) {
      output.push(remaining);
      break;
    }

    const boundary = findBackwardLatexSpaceBoundary(remaining);
    if (boundary <= 0 || boundary >= remaining.length) {
      output.push(remaining);
      break;
    }

    const beforeSpace = remaining.slice(0, boundary).trimEnd();
    const afterSpace = remaining.slice(boundary).trimStart();
    if (!beforeSpace) {
      output.push(remaining);
      break;
    }

    output.push(beforeSpace);
    remaining = afterSpace;
    guard += 1;
  }

  return output;
}

function collectBackwardSpaceBoundaries(value: string, limit = 4): number[] {
  const boundaries: number[] = [];
  for (let i = value.length - 1; i >= 0 && boundaries.length < limit; i--) {
    if (value[i] === ' ') {
      boundaries.push(i + 1);
    }
  }
  return boundaries;
}

function rebalanceShortOrphanLines(
  inputLines: string[],
  targetLineWidth: number,
  fontSize: number,
): string[] {
  if (inputLines.length < 2) return inputLines;

  const lines = [...inputLines];
  const minOrphanWidth = Math.max(1.6, targetLineWidth * 0.42);
  const minPreviousWidthForBorrow = targetLineWidth * 0.65;
  const minResidualPreviousWidth = targetLineWidth * 0.48;
  const minGain = Math.max(0.2, targetLineWidth * 0.03);
  const desiredFilledWidth = Math.max(minOrphanWidth, targetLineWidth * 0.36);

  for (let i = 1; i < lines.length; i++) {
    const current = lines[i].trim();
    const currentWidth = estimateWidth(current, fontSize);

    if (currentWidth >= minOrphanWidth) continue;

    const previous = lines[i - 1].trimEnd();
    const previousWidth = estimateWidth(previous, fontSize);
    if (
      previousWidth <= 0 ||
      previousWidth < minPreviousWidthForBorrow
    ) {
      continue;
    }

    const boundaries = collectBackwardSpaceBoundaries(previous);

    let bestPrev = previous;
    let bestCurrent = current;
    let bestCurrentWidth = currentWidth;
    let foundCandidateAtTarget = false;

    for (const boundary of boundaries) {
      if (boundary <= 0 || boundary >= previous.length) continue;

      const moved = previous.slice(boundary).trim();
      const nextPrev = previous.slice(0, boundary).trimEnd();
      const nextCurrent = moved ? `${moved} ${current}`.trim() : current;

      if (!nextPrev || !nextCurrent) continue;

      const nextPrevWidth = estimateWidth(nextPrev, fontSize);
      const nextCurrentWidth = estimateWidth(nextCurrent, fontSize);

      if (
        nextPrevWidth > targetLineWidth ||
        nextCurrentWidth > targetLineWidth ||
        nextPrevWidth < minResidualPreviousWidth
      ) {
        continue;
      }

      const reachesTarget = nextCurrentWidth >= desiredFilledWidth;

      if (reachesTarget) {
        if (!foundCandidateAtTarget) {
          foundCandidateAtTarget = true;
          bestPrev = nextPrev;
          bestCurrent = nextCurrent;
          bestCurrentWidth = nextCurrentWidth;
          continue;
        }

        // Once target fill is reached, preserve as much width as possible on
        // the previous line (move the minimum needed text).
        const bestPrevWidth = estimateWidth(bestPrev, fontSize);
        if (nextPrevWidth > bestPrevWidth + 0.05) {
          bestPrev = nextPrev;
          bestCurrent = nextCurrent;
          bestCurrentWidth = nextCurrentWidth;
        }
        continue;
      }

      if (!foundCandidateAtTarget && nextCurrentWidth > bestCurrentWidth + minGain) {
        bestPrev = nextPrev;
        bestCurrent = nextCurrent;
        bestCurrentWidth = nextCurrentWidth;
      }
    }

    if (bestCurrentWidth > currentWidth + minGain) {
      lines[i - 1] = bestPrev;
      lines[i] = bestCurrent;
    }
  }

  return lines;
}

/**
 * Walk backwards through a LaTeX segment looking for an opening bracket
 * `(`, `[`, `\left(`, or `\left[` that could be a natural continuation point
 * for the next line.
 *
 * Returns the index at which to split (before the bracket, or after a short
 * leading term), or -1 if none is found within `lookback` characters.
 */
function findOpeningBracketInLookback(
  segment: string,
  lookback: number,
): number {
  const start = Math.max(0, segment.length - lookback);

  for (let i = segment.length - 1; i >= start; i--) {
    const ch = segment[i];
    let bracketStart = -1;

    if (ch === '(' || ch === '[') {
      bracketStart = i;
    } else if (
      ch === '\\' &&
      (segment.slice(i, i + 7) === '\\left(' ||
        segment.slice(i, i + 7) === '\\left[')
    ) {
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

// ---------------------------------------------------------------------------
// Core line-breaker
// ---------------------------------------------------------------------------

/**
 * Break a single (already-normalised) LaTeX line into multiple lines, each
 * no wider than `maxLineWidth` ems at the given `fontSize`.
 */
function breakLine(
  line: string,
  maxLineWidth: number,
  fontSize: number,
  debug: boolean,
): string[] {
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

  const flushLine = (reason: string) => {
    if (currentTokens.length === 0) return;
    const lineStr = currentTokens.map(tokenToLatex).join('');
    logWrapDebug(debug, `line:push(${reason})`, { lineStr });
    lines.push(lineStr);
    currentTokens = [];
    currentWidth = 0;
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenWidth = estimateTokenWidth(token, fontSize);

    // ---- Token fits on current line -------------------------------------
    if (currentWidth + tokenWidth <= targetLineWidth) {
      currentTokens.push(token);
      currentWidth += tokenWidth;
      logWrapDebug(debug, 'token:fits', { tokenWidth, currentWidth });
      continue;
    }

    logWrapDebug(debug, 'token:overflow', { tokenWidth, currentWidth });

    // ---- Plain-text token overflows -------------------------------------
    if (token.type === 'text') {
      let remaining = token.content;

      while (remaining.length > 0) {
        const available = Math.max(0.5, targetLineWidth - currentWidth);
        const remainingWidth = estimatePlainTextWidth(remaining) * fontScale;

        if (remainingWidth <= available) {
          currentTokens.push({ type: 'text', content: remaining });
          currentWidth += remainingWidth;
          remaining = '';
          break;
        }

        let breakAt = -1;
        let consumed = 0;

        for (let k = 0; k < remaining.length; k++) {
          consumed += estimatePlainTextWidth(remaining[k]) * fontScale;

          if (consumed > available) {
            const backwardBoundary = findBackwardTextWrapBoundary(remaining, k);

            if (backwardBoundary > 0) {
              breakAt = backwardBoundary;
            } else if (currentTokens.length > 0) {
              // Move intact word to the next line.
              breakAt = 0;
            } else {
              // Hard break — no other option.
              breakAt = Math.max(1, k);
            }
            break;
          }
        }

        if (breakAt < 0) breakAt = remaining.length;

        const piece = remaining.slice(0, breakAt);
        if (piece.length > 0) {
          currentTokens.push({ type: 'text', content: piece });
        }

        flushLine('text-overflow');
        remaining = remaining.slice(breakAt).trimStart();
      }

      continue;
    }

    // ---- LaTeX token overflows ------------------------------------------
    // Walk the token character-by-character, splitting at operators when the
    // accumulated segment would exceed the target width.
    let depth = 0;
    let segment = '';
    let broke = false;

    for (let j = 0; j < token.content.length; j++) {
      const ch = token.content[j];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;

      const segmentWidth = estimateWidth(segment, fontSize);
      const wouldExceed = currentWidth + segmentWidth >= targetLineWidth;

      if (depth === 0 && OPERATORS.includes(ch) && wouldExceed) {
        // Try to split before a nearby opening bracket first.
        const bracketIndex = findOpeningBracketInLookback(segment, 20);

        if (bracketIndex > 0) {
          const beforeBracket = segment.slice(0, bracketIndex).trimEnd();
          const fromBracket = segment.slice(bracketIndex);

          if (beforeBracket) {
            currentTokens.push({ type: 'latex', content: beforeBracket });
          }
          flushLine('latex-bracket-split');

          if (fromBracket) {
            currentTokens.push({ type: 'latex', content: fromBracket });
            currentWidth += estimateWidth(fromBracket, fontSize);
          }

          segment = ch;
          broke = true;
          continue;
        }

        // Split at the operator itself.
        if (segment.trimEnd()) {
          currentTokens.push({ type: 'latex', content: segment.trimEnd() });
        }
        flushLine('latex-operator-split');

        // Start the next line with the operator.
        currentTokens = [{ type: 'latex', content: ch }];
        currentWidth = estimateWidth(ch, fontSize);
        segment = '';
        broke = true;
        continue;
      }

      if (depth === 0 && wouldExceed) {
        const spaceBoundary = findBackwardLatexSpaceBoundary(segment);
        if (spaceBoundary > 0) {
          const beforeSpace = segment.slice(0, spaceBoundary).trimEnd();
          const afterSpace = segment.slice(spaceBoundary).trimStart();

          if (beforeSpace) {
            currentTokens.push({ type: 'latex', content: beforeSpace });
          }
          flushLine('latex-space-split');

          if (afterSpace) {
            currentTokens.push({ type: 'latex', content: afterSpace });
            currentWidth += estimateWidth(afterSpace, fontSize);
          }

          segment = ch;
          broke = true;
          continue;
        }
      }

      segment += ch;
    }

    if (segment) {
      currentTokens.push({ type: 'latex', content: segment });
      currentWidth += estimateWidth(segment, fontSize);
    }

    if (!broke && currentWidth > targetLineWidth) {
      const lineStr = currentTokens.map(tokenToLatex).join('');
      const lateBoundary = findBackwardLatexSpaceBoundary(lineStr);

      if (lateBoundary > 0) {
        const beforeSpace = lineStr.slice(0, lateBoundary).trimEnd();
        const afterSpace = lineStr.slice(lateBoundary).trimStart();

        currentTokens = [];
        currentWidth = 0;

        if (beforeSpace) {
          currentTokens.push({ type: 'latex', content: beforeSpace });
        }
        flushLine('post-token-space-split');

        if (afterSpace) {
          currentTokens.push({ type: 'latex', content: afterSpace });
          currentWidth = estimateWidth(afterSpace, fontSize);
        }
      } else {
        flushLine('post-token-overflow');
      }
    }
  }

  flushLine('final');

  const enforcedLines = lines.flatMap((lineStr) =>
    forceSplitLineByBackwardSpace(lineStr, targetLineWidth, fontSize),
  );
  const rebalancedLines = rebalanceShortOrphanLines(
    enforcedLines,
    targetLineWidth,
    fontSize,
  );

  logWrapDebug(debug, 'breakLine:done', {
    lineCount: rebalancedLines.length,
    lines: rebalancedLines,
  });
  return rebalancedLines.length > 0 ? rebalancedLines : [line];
}

// ---------------------------------------------------------------------------
// Matrix/env block protection
// ---------------------------------------------------------------------------

function withProtectedMatrixBlocks(
  latex: string,
  transform: (value: string) => string,
): string {
  const blocks: string[] = [];
  const masked = latex.replace(MATRIX_VECTOR_ENV_PATTERN, (match) => {
    const placeholder = `__MATRIX_BLOCK_${blocks.length}__`;
    blocks.push(match);
    return placeholder;
  });

  const transformed = transform(masked);
  return transformed.replace(
    MATRIX_VECTOR_PLACEHOLDER_PATTERN,
    (_, indexText: string) => {
      const index = Number.parseInt(indexText, 10);
      return blocks[index] ?? '';
    },
  );
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function stripLeadingTrailingWhitespace(latex: string): string {
  return latex.trim();
}

/**
 * Normalise spacing and punctuation without discarding intentional `\\` line
 * breaks that already exist in the source.
 *
 * FIX: the original code replaced `\s*\\\\\s*` with a space, which silently
 * deleted all existing line breaks before the wrapping logic ran, making it
 * impossible to honour them.
 */
function normalizeSpacingAndPunctuation(latex: string): string {
  return withProtectedMatrixBlocks(latex, (value) =>
    value
      // Remove explicit LaTeX line-break commands outside matrix/vector blocks.
      .replace(/\s*\\\\\s*/g, ' ')
      // Remove control-space artefacts left by removed line-breaks.
      .replace(/\\\s+(?=\\[A-Za-z])/g, ' ')
      // Collapse runs of 3+ spaces to 1.
      .replace(/ {3,}/g, ' ')
      // Add a space after sentence-ending periods followed by a capital.
      .replace(/\.([A-Z])/g, '. $1')
      .trim(),
  );
}

/**
 * Clean up the very start of a continuation line produced by breakLine.
 * Removes leading `\\ ` artefacts and trims spurious leading spaces inside
 * `\text{…}`.
 */
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

/**
 * Final output pass: when a non-space character is followed by spacing and a
 * `\text{...}` block, preserve the gap using an explicit LaTeX space command.
 * Also remove leading spaces right after `{` for those `\text{...}` blocks.
 * Example: `6  \text{ at}` -> `6\ \text{at}`
 */
function normalizeFinalOutputSpacing(latex: string): string {
  const withExplicitGap = latex.replace(/([^\s\\])\s+\\text\{/g, '$1\\ \\text{');
  const withTrimmedLeadingTextSpace = withExplicitGap.replace(
    /\\ \\text\{\s+/g,
    '\\ \\text{',
  );
  return withTrimmedLeadingTextSpace.replace(
    /\\text\{([^{}]*?)\s+\}(\\ \\text\{)/g,
    '\\text{$1}$2',
  );
}

// ---------------------------------------------------------------------------
// Main wrapping function
// ---------------------------------------------------------------------------

/**
 * Wrap `latex` so that no rendered line exceeds `maxLineWidth` ems at
 * `fontSize` pixels.
 *
 * When the input already contains `\\` breaks, each existing segment is
 * wrapped independently so that hand-authored breaks are always honoured.
 */
function wrapLatex(
  latex: string,
  maxLineWidth: number,
  fontSize: number,
  textAlign: LineAlign,
  debug: boolean,
): { wrapped: string; trace: WrapDebugTrace } {
  const cleaned = normalizeSpacingAndPunctuation(
    stripLeadingTrailingWhitespace(latex),
  );
  const targetLineWidth = getTargetLineWidth(maxLineWidth);
  const trace: WrapDebugTrace = {
    cleaned,
    targetLineWidth,
    segments: [],
    finalLines: [],
  };

  logWrapDebug(debug, 'wrapLatex:input', {
    latex,
    cleaned,
    fontSize,
    maxLineWidth,
    targetLineWidth,
    textAlign,
  });

  // ---- Split on existing \\ breaks first ---------------------------------
  // This lets us wrap each authored segment independently.
  const inputSegments = cleaned
    .split(/\s*\\\\\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const allOutputLines: string[] = [];

  for (const segment of inputSegments) {
    const estimatedWidth = estimateWidth(segment, fontSize);

    logWrapDebug(debug, 'wrapLatex:segment', {
      segment,
      estimatedWidth,
      targetLineWidth,
    });

    if (estimatedWidth <= targetLineWidth) {
      trace.segments.push({
        segment,
        estimatedWidth,
        wrapped: false,
        outputLines: [segment],
      });
      allOutputLines.push(segment);
    } else {
      const broken = breakLine(segment, maxLineWidth, fontSize, debug);
      trace.segments.push({
        segment,
        estimatedWidth,
        wrapped: true,
        outputLines: broken,
      });
      allOutputLines.push(...broken);
    }
  }

  const normalizedLines = allOutputLines.map((line, index) =>
    index === 0 ? line : normalizeLineStartAfterBreak(line),
  );
  const enforcedFinalLines = normalizedLines.flatMap((lineStr) =>
    forceSplitLineByBackwardSpace(lineStr, targetLineWidth, fontSize),
  );
  const rebalancedFinalLines = rebalanceShortOrphanLines(
    enforcedFinalLines,
    targetLineWidth,
    fontSize,
  );
  const finalLines = rebalancedFinalLines.map((line) =>
    normalizeFinalOutputSpacing(line),
  );
  trace.finalLines = finalLines;

  if (finalLines.length <= 1) {
    logWrapDebug(debug, 'wrapLatex:single-line', {
      result: finalLines[0] ?? cleaned,
    });
    return { wrapped: finalLines[0] ?? cleaned, trace };
  }

  const joined = finalLines.join(' \\\\ ');
  const alignment = getArrayAlignment(textAlign);
  const wrappedArray = `\\begin{array}{${alignment}} ${joined} \\end{array}`;

  logWrapDebug(debug, 'wrapLatex:wrapped-array', {
    alignment,
    lineCount: finalLines.length,
    wrappedArray,
  });

  return { wrapped: wrappedArray, trace };
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

export function EditorWrapLatex({
  latex,
  maxLineWidth = 60,
  fontSize = 18,
  textAlign = 'center',
  debug = false,
}: EditorWrapLatexProps) {
  const { wrapped, trace } = wrapLatex(latex, maxLineWidth, fontSize, textAlign, debug);

  if (debug) {
    console.log('[EditorWrapLatex] Final wrapped LaTeX:', wrapped);
  }

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
      {debug && (
        <div className="mt-2 rounded-lg border border-black/20 bg-white p-3 text-left">
          <p className="font-semibold text-[11px] uppercase tracking-[0.16em] text-[#444]">
            Wrap Debugger
          </p>
          <p className="mt-1 text-xs text-[#444]">
            Target Width: <strong>{trace.targetLineWidth.toFixed(2)} em</strong>
          </p>
          <p className="mt-1 text-xs text-[#444] break-words">
            Cleaned Input: {trace.cleaned}
          </p>

          <div className="mt-2 space-y-2">
            {trace.segments.map((segment, index) => (
              <div key={`segment-debug-${index}`} className="rounded border border-black/10 bg-[#faf8f2] p-2">
                <p className="text-[11px] text-[#333]">
                  Segment {index + 1}: {segment.wrapped ? 'wrapped' : 'fits'} ({segment.estimatedWidth.toFixed(2)} em)
                </p>
                <p className="mt-1 break-words text-[11px] text-[#555]">{segment.segment}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-1">
            {trace.finalLines.map((line, index) => {
              const width = estimateWidth(line, fontSize);
              const exceeds = width > trace.targetLineWidth;
              return (
                <div key={`line-debug-${index}`} className={`rounded border p-2 text-[11px] ${exceeds ? 'border-[#b42318] bg-[#fff5f5]' : 'border-black/10 bg-[#f7f7f7]'}`}>
                  <p className="font-semibold text-[#333]">
                    Line {index + 1}: {width.toFixed(2)} em {exceeds ? '(exceeds target)' : '(within target)'}
                  </p>
                  <p className="mt-1 break-words text-[#555]">{line}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
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