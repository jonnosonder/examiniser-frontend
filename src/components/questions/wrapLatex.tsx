import { BlockMath } from 'react-katex';
 
interface WrappedMathProps {
  latex: string;
  maxLineWidth?: number;
}

const SPACING_COMMANDS =
  /\\(left|right|big|Big|bigg|Bigg|displaystyle|textstyle|scriptstyle|scriptscriptstyle|,|;|!| |quad|qquad)/g;

const WRAPPABLE_ENVS = ['aligned', 'align', 'multline', 'gather'];

const OPERATORS = ['+', '-', '='];

type Token =
  | { type: 'text'; content: string }   // \text{...}
  | { type: 'latex'; content: string }; // everything else

/** Split a latex string into \text{} blocks and raw latex segments */
function tokenize(latex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < latex.length) {
    const textMatch = latex.slice(i).match(/^\\text\{/);
    if (textMatch) {
      // Find the matching closing brace
      let depth = 1;
      let j = i + textMatch[0].length;
      while (j < latex.length && depth > 0) {
        if (latex[j] === '{') depth++;
        else if (latex[j] === '}') depth--;
        j++;
      }
      const inner = latex.slice(i + textMatch[0].length, j - 1);
      tokens.push({ type: 'text', content: inner });
      i = j;
    } else {
      // Accumulate raw latex until the next \text{
      const next = latex.slice(i).search(/\\text\{/);
      if (next === -1) {
        tokens.push({ type: 'latex', content: latex.slice(i) });
        break;
      } else {
        tokens.push({ type: 'latex', content: latex.slice(i, i + next) });
        i += next;
      }
    }
  }

  return tokens;
}

/** Estimate the rendered width of a token */
function estimateTokenWidth(token: Token): number {
  if (token.type === 'text') {
    // Text content maps closely to character count
    return token.content.length;
  }
  // For raw latex, strip spacing commands and braces
  return token.content
    .replace(SPACING_COMMANDS, '')
    .replace(/[{}]/g, '')
    .length;
}

/** Estimate total width of a latex string */
function estimateWidth(latex: string): number {
  return tokenize(latex).reduce((sum, t) => sum + estimateTokenWidth(t), 0);
}

/** Reconstruct a token back to a latex string */
function tokenToLatex(token: Token): string {
  if (token.type === 'text') return `\\text{${token.content}}`;
  return token.content;
}

/**
 * Try to break a long line at top-level operators in latex segments,
 * or at word boundaries inside \text{} blocks.
 */
function breakLine(line: string, maxLineWidth: number): string[] {
  const tokens = tokenize(line);
  const lines: string[] = [];
  let currentTokens: Token[] = [];
  let currentWidth = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenWidth = estimateTokenWidth(token);

    if (currentWidth + tokenWidth <= maxLineWidth) {
      currentTokens.push(token);
      currentWidth += tokenWidth;
      continue;
    }

    // Token would overflow — try to break it
    if (token.type === 'text') {
      // Break at word boundaries inside \text{}
      const words = token.content.split(' ');
      let wordBuffer = '';

      for (const word of words) {
        const candidate = wordBuffer ? wordBuffer + ' ' + word : word;
        if (currentWidth + candidate.length <= maxLineWidth) {
          wordBuffer = candidate;
        } else {
          if (wordBuffer) {
            currentTokens.push({ type: 'text', content: wordBuffer });
            lines.push(currentTokens.map(tokenToLatex).join(''));
            currentTokens = [];
            currentWidth = 0;
          }
          wordBuffer = word;
        }
      }

      if (wordBuffer) {
        currentTokens.push({ type: 'text', content: wordBuffer });
        currentWidth += wordBuffer.length;
      }
    } else {
      // Try to break at a top-level operator in raw latex
      let depth = 0;
      let segment = '';
      let broke = false;

      for (let j = 0; j < token.content.length; j++) {
        const ch = token.content[j];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;

        if (
          depth === 0 &&
          OPERATORS.includes(ch) &&
          currentWidth + estimateWidth(segment) >= maxLineWidth
        ) {
          currentTokens.push({ type: 'latex', content: segment.trimEnd() });
          lines.push(currentTokens.map(tokenToLatex).join(''));
          currentTokens = [{ type: 'latex', content: '\\quad ' + ch }];
          currentWidth = 6; // \quad is roughly 6 units
          segment = '';
          broke = true;
          continue;
        }

        segment += ch;
      }

      if (segment) {
        currentTokens.push({ type: 'latex', content: segment });
        currentWidth += estimateWidth(segment);
      }

      if (!broke && currentWidth > maxLineWidth) {
        // No operator found — flush and continue
        lines.push(currentTokens.map(tokenToLatex).join(''));
        currentTokens = [];
        currentWidth = 0;
      }
    }
  }

  if (currentTokens.length > 0) {
    lines.push(currentTokens.map(tokenToLatex).join(''));
  }

  return lines.length > 0 ? lines : [line];
}

function stripLineBreaks(latex: string): string {
  return latex.replace(/\s*\\\\\s*/g, ' ').trim();
}

function wrapLatex(latex: string, maxLineWidth: number = 60): string {
  for (const env of WRAPPABLE_ENVS) {
    if (latex.includes(`\\begin{${env}}`)) {
      return latex;
    }
  }

  const cleaned = stripLineBreaks(latex);
 
  if (estimateWidth(cleaned) <= maxLineWidth) {
    return cleaned;
  }
 
  const result = breakLine(cleaned, maxLineWidth);
  const wrapped = result.join(' \\\\ ');
 
  if (result.length > 1) {
    return `\\begin{gathered} ${wrapped} \\end{gathered}`;
  }
 
  return wrapped;
}

export function WrappedMath({ latex, maxLineWidth = 60 }: WrappedMathProps) {
  const wrapped = wrapLatex(latex, maxLineWidth);
 
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%', textAlign: 'center' }}>
      <BlockMath math={wrapped} />
    </div>
  );
}