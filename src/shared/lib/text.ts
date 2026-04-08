import {
  prepareWithSegments,
  layoutWithLines,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

const preparedCache = new Map<string, PreparedTextWithSegments>();

function getPrepared(text: string, font: string): PreparedTextWithSegments {
  const key = `${text}\0${font}`;
  let p = preparedCache.get(key);
  if (!p) {
    p = prepareWithSegments(text, font);
    preparedCache.set(key, p);
  }
  return p;
}

/** Measure the natural (unwrapped) width of a text string via pretext. */
export function measureWidth(text: string, font: string): number {
  const p = getPrepared(text, font);
  const result = layoutWithLines(p, Infinity, 1);
  return result.lines[0]?.width ?? 0;
}
