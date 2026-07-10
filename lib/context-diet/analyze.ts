// Context Diet — analyzer core.
//
// A 1:1 TypeScript port of content/reports/context-diet-lab-001/context_diet.py.
// Pure and offline: no network, no storage. This is the privacy backbone of the
// lab — pasted context is measured entirely in the browser and never leaves it.
//
// Fidelity notes (verified against baseline.json):
//   * approxTokens uses Python's round-half-to-even (banker's rounding). A naive
//     Math.round would diverge on exact .5 values, e.g. 1130 chars -> 282 (not 283).
//   * Sections are split on lines that KEEP their terminators, so the section
//     char counts sum to the file total (matching Python's splitlines(keepends=True)).
//   * chars = String.length (UTF-16 code units). Python uses code points. These
//     agree for ASCII/BMP text; astral chars/emoji would differ, which is
//     irrelevant for real agent-context files.

import type { Section, Measured } from "./types";

export const DEFAULT_LIMIT = 40_000;
export const TOKENS_PER_CHAR = 0.25; // chars/4 heuristic; the record's unit is chars.

const HEADING = /^(#{1,6})\s+(.*)$/;

/**
 * Normalize CRLF/CR to LF, matching Python's universal-newline text read
 * (Path.read_text), which is what produced the Lab 001 baseline. Browsers
 * already normalize <textarea> values to LF, so this only matters for files
 * loaded with raw byte-preserving readers.
 */
function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

/** Round half to even, matching Python's built-in round(). */
function roundHalfToEven(x: number): number {
  const floor = Math.floor(x);
  const frac = x - floor;
  if (frac < 0.5) return floor;
  if (frac > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function approxTokens(chars: number): number {
  return roundHalfToEven(chars * TOKENS_PER_CHAR);
}

/**
 * Split text into lines that retain their terminators, matching Python's
 * str.splitlines(keepends=True) for the universal newlines (\n, \r, \r\n).
 * The concatenation of the result equals the input, so downstream char sums
 * stay exact.
 */
function splitLinesKeepEnds(text: string): string[] {
  const lines: string[] = [];
  const n = text.length;
  let start = 0;
  let i = 0;
  while (i < n) {
    const ch = text[i];
    if (ch === "\n") {
      lines.push(text.slice(start, i + 1));
      i += 1;
      start = i;
    } else if (ch === "\r") {
      if (i + 1 < n && text[i + 1] === "\n") {
        lines.push(text.slice(start, i + 2));
        i += 2;
      } else {
        lines.push(text.slice(start, i + 1));
        i += 1;
      }
      start = i;
    } else {
      i += 1;
    }
  }
  if (start < n) lines.push(text.slice(start));
  return lines;
}

/**
 * Split on headings at `atLevel` (default ## = 2). Content above the first such
 * heading is bucketed as a synthetic "(preamble)" section so every byte is
 * accounted for and the section chars sum to the file total.
 */
export function splitSections(text: string, atLevel = 2): Section[] {
  const lines = splitLinesKeepEnds(normalizeNewlines(text));
  const sections: Section[] = [];

  let curTitle = "(preamble)";
  let curLevel = 0;
  let curLines: string[] = [];
  let curStart = 1;

  const flush = (title: string, level: number, buf: string[], start: number): void => {
    const body = buf.join("");
    if (body === "" && sections.length === 0) return; // skip an empty leading preamble
    sections.push({
      title,
      level,
      chars: body.length,
      approxTokens: approxTokens(body.length),
      lineStart: start,
    });
  };

  lines.forEach((line, idx) => {
    // idx is 0-based; Python enumerates from 1.
    const lineNo = idx + 1;
    // Python's `$` (no MULTILINE) matches before a trailing newline; JS's does
    // not — so strip the line terminator before testing the heading pattern.
    const m = HEADING.exec(line.replace(/\n$/, ""));
    if (m && m[1].length === atLevel) {
      flush(curTitle, curLevel, curLines, curStart);
      curTitle = m[2].trim();
      curLevel = m[1].length;
      curLines = [line];
      curStart = lineNo;
    } else {
      curLines.push(line);
    }
  });
  flush(curTitle, curLevel, curLines, curStart);
  return sections;
}

/** Measure a context file against a char budget. Mirrors context_diet.py:measure. */
export function measure(
  text: string,
  limit = DEFAULT_LIMIT,
  atLevel = 2,
  file = "pasted",
): Measured {
  const normalized = normalizeNewlines(text);
  const totalChars = normalized.length;
  const sections = splitSections(normalized, atLevel);
  const ranked = [...sections].sort((a, b) => b.chars - a.chars);
  const overBy = Math.max(0, totalChars - limit);
  return {
    file,
    totalChars,
    approxTokens: approxTokens(totalChars),
    limit,
    overLimit: totalChars > limit,
    overBy,
    headroom: Math.max(0, limit - totalChars),
    sectionCount: sections.length,
    sections,
    ranked,
  };
}
