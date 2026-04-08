import { prepare, layout } from '@chenglou/pretext';

export interface TextMeasurement {
  width: number;
  height: number;
}

const measureCache = new Map<string, TextMeasurement>();

export function measureText(
  text: string,
  font: string,
): TextMeasurement {
  const key = `${text}::${font}`;
  const cached = measureCache.get(key);
  if (cached) return cached;

  const prepared = prepare(text, font);
  const result = layout(prepared, Infinity, parseFloat(font));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  const metrics = ctx.measureText(text);

  const measurement: TextMeasurement = {
    width: metrics.width,
    height: result.height || parseFloat(font),
  };
  measureCache.set(key, measurement);
  return measurement;
}

export function generateBackgroundText(
  words: string[],
  areaWidth: number,
  areaHeight: number,
  font: string,
): string {
  const fullText = words.join(' ');
  const prepared = prepare(fullText, font);
  const result = layout(prepared, areaWidth, parseFloat(font) * 1.4);

  const linesNeeded = Math.ceil(areaHeight / (parseFloat(font) * 1.4));
  let text = '';
  for (let i = 0; i < Math.max(linesNeeded, result.lineCount) + 5; i++) {
    text += fullText + ' ';
  }
  return text;
}
