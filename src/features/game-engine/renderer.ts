import type { GameEngine } from './engine';
import type { Vector2 } from '@/shared/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BORDER_WIDTH,
  TEXT_WALL_LINE_HEIGHT,
  TEXT_WALL_ALPHA,
  TEXT_WALL_COLORS,
  TEXT_WALL_MIN_SLOT,
  TEXT_WALL_BRICK_PAD,
  TEXT_WALL_PADDLE_PAD,
  TEXT_WALL_REGION_PAD,
  BALL_WAKE_RADIUS,
  COMBO_DISPLAY_DURATION,
} from '@/shared/config/constants';
import { measureWidth } from '@/shared/lib/text';
import { layoutNextLine, type LayoutCursor } from '@chenglou/pretext';

const PW_FONT = 'bold 14px "Share Tech Mono", monospace';
const WALL_FONT = '600 12px "Share Tech Mono", monospace';

// ── Easing ──────────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── Interval types for slot carving ─────────────────────────────────────

type Interval = { left: number; right: number };

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// ── Slot carving: subtract blocked intervals from a base interval ───────

function pushCircleInterval(
  blocked: Interval[],
  cx: number,
  cy: number,
  radius: number,
  bandTop: number,
  bandBottom: number,
) {
  const sampleY = (bandTop + bandBottom) / 2;
  const dy = sampleY - cy;
  if (Math.abs(dy) >= radius) return;
  const halfWidth = Math.sqrt(radius * radius - dy * dy);
  blocked.push({ left: cx - halfWidth, right: cx + halfWidth });
}

function carveSlots(base: Interval, blocked: Interval[]): Interval[] {
  if (blocked.length === 0) return [base];

  const merged = blocked
    .map((iv) => ({
      left: clamp(iv.left, base.left, base.right),
      right: clamp(iv.right, base.left, base.right),
    }))
    .filter((iv) => iv.right > iv.left)
    .sort((a, b) => a.left - b.left);

  const normalized: Interval[] = [];
  for (const iv of merged) {
    const prev = normalized[normalized.length - 1];
    if (!prev || iv.left > prev.right) {
      normalized.push({ left: iv.left, right: iv.right });
    } else {
      prev.right = Math.max(prev.right, iv.right);
    }
  }

  const slots: Interval[] = [];
  let cursor = base.left;
  for (const iv of normalized) {
    if (iv.left - cursor >= TEXT_WALL_MIN_SLOT) {
      slots.push({ left: cursor, right: iv.left });
    }
    cursor = Math.max(cursor, iv.right);
  }
  if (base.right - cursor >= TEXT_WALL_MIN_SLOT) {
    slots.push({ left: cursor, right: base.right });
  }
  return slots;
}

function getTextWallSlots(
  engine: GameEngine,
  regionX: number,
  regionRight: number,
  bandTop: number,
  bandBottom: number,
): Interval[] {
  const blocked: Interval[] = [];

  for (const word of engine.words) {
    if (!word.isAlive) continue;
    if (bandBottom <= word.rect.y - TEXT_WALL_BRICK_PAD) continue;
    if (bandTop >= word.rect.y + word.rect.height + TEXT_WALL_BRICK_PAD) continue;
    blocked.push({
      left: word.rect.x - TEXT_WALL_BRICK_PAD,
      right: word.rect.x + word.rect.width + TEXT_WALL_BRICK_PAD,
    });
  }

  const p = engine.paddle;
  const paddleTop = p.y - 6;
  const paddleBottom = p.y + p.height + 6;
  if (bandBottom > paddleTop && bandTop < paddleBottom) {
    blocked.push({
      left: p.x - TEXT_WALL_PADDLE_PAD,
      right: p.x + p.width + TEXT_WALL_PADDLE_PAD,
    });
  }

  for (const ball of engine.balls) {
    if (!ball.isActive) continue;
    pushCircleInterval(blocked, ball.pos.x, ball.pos.y, BALL_WAKE_RADIUS, bandTop, bandBottom);
  }

  for (const hole of engine.wakeHoles) {
    pushCircleInterval(blocked, hole.x, hole.y, hole.radius, bandTop, bandBottom);
  }

  for (const pw of engine.powerWords) {
    if (!pw.isActive) continue;
    const pwTop = pw.pos.y - pw.height / 2 - 4;
    const pwBottom = pw.pos.y + pw.height / 2 + 4;
    if (bandBottom <= pwTop || bandTop >= pwBottom) continue;
    blocked.push({
      left: pw.pos.x - pw.width / 2 - 10,
      right: pw.pos.x + pw.width / 2 + 10,
    });
  }

  for (const particle of engine.particles) {
    if (particle.alpha <= 0.08 || particle.wallRadius <= 0) continue;
    pushCircleInterval(blocked, particle.x, particle.y, particle.wallRadius, bandTop, bandBottom);
  }

  return carveSlots({ left: regionX, right: regionRight }, blocked);
}

// ── Text wall rendering ─────────────────────────────────────────────────

function drawTextWall(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const regionX = BORDER_WIDTH + TEXT_WALL_REGION_PAD;
  const regionY = BORDER_WIDTH + TEXT_WALL_REGION_PAD;
  const regionRight = GAME_WIDTH - BORDER_WIDTH - TEXT_WALL_REGION_PAD;
  const regionBottom = GAME_HEIGHT - BORDER_WIDTH - TEXT_WALL_REGION_PAD;

  ctx.save();
  ctx.font = WALL_FONT;
  ctx.textBaseline = 'top';
  ctx.globalAlpha = TEXT_WALL_ALPHA;

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };

  for (let lineTop = regionY; lineTop + TEXT_WALL_LINE_HEIGHT <= regionBottom; lineTop += TEXT_WALL_LINE_HEIGHT) {
    const bandTop = lineTop;
    const bandBottom = lineTop + TEXT_WALL_LINE_HEIGHT;

    const slots = getTextWallSlots(engine, regionX, regionRight, bandTop, bandBottom);
    if (slots.length === 0) continue;

    for (let si = 0; si < slots.length; si++) {
      const slot = slots[si];
      const width = slot.right - slot.left;
      if (width < TEXT_WALL_MIN_SLOT) continue;

      let line = layoutNextLine(engine.textWallPrepared, cursor, width);
      if (line === null) {
        cursor = { segmentIndex: 0, graphemeIndex: 0 };
        line = layoutNextLine(engine.textWallPrepared, cursor, width);
      }
      if (line === null) break;

      const color = TEXT_WALL_COLORS[
        (Math.floor(lineTop / TEXT_WALL_LINE_HEIGHT) + si) % TEXT_WALL_COLORS.length
      ];
      ctx.fillStyle = color;
      ctx.fillText(line.text, slot.left, lineTop);
      cursor = line.end;
    }
  }

  ctx.restore();
}

// ── Background glyphs ──────────────────────────────────────────────────

function drawBackgroundGlyphs(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  ctx.save();
  ctx.font = '600 15px "Share Tech Mono", monospace';
  ctx.textBaseline = 'top';
  for (const g of engine.backgroundGlyphs) {
    ctx.fillStyle = '#4a6a80';
    ctx.globalAlpha = g.alpha;
    ctx.shadowColor = 'rgba(80, 160, 200, 0.1)';
    ctx.shadowBlur = 3;
    ctx.fillText(g.char, g.x, g.y);
  }
  ctx.restore();
}

// ── Combo floating text ────────────────────────────────────────────────

function drawComboText(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const hit = engine.lastComboHit;
  if (!hit) return;
  const progress = 1 - hit.timer / COMBO_DISPLAY_DURATION;
  const alpha = 1 - progress;
  const yOffset = progress * -30;
  ctx.save();
  ctx.font = 'bold 28px "Orbitron", monospace';
  ctx.fillStyle = '#ffd93d';
  ctx.shadowColor = '#ffd93d';
  ctx.shadowBlur = 10;
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hit.text, hit.x, hit.y + yOffset);
  ctx.restore();
}

// ── Main render ─────────────────────────────────────────────────────────

export function render(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const { balls, paddle, words, powerWords } = engine;

  // ── Background (before shake) ─────────────────────────────────────────
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#040609';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // ── Screen shake wrapper ──────────────────────────────────────────────
  ctx.save();
  const shake = engine.screenShake;
  if (shake.elapsed < shake.duration) {
    const decay = 1 - shake.elapsed / shake.duration;
    const ox = (Math.random() - 0.5) * 2 * shake.intensity * decay;
    const oy = (Math.random() - 0.5) * 2 * shake.intensity * decay;
    ctx.translate(ox, oy);
  }

  // ── Background glyphs ─────────────────────────────────────────────────
  drawBackgroundGlyphs(ctx, engine);

  // ── Reflowing text wall ───────────────────────────────────────────────
  drawTextWall(ctx, engine);

  // ── Border ────────────────────────────────────────────────────────────
  drawBorder(ctx);
  drawCorners(ctx);

  // ── Target words (with intro animation) ───────────────────────────────
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word.isAlive) continue;

    let drawX = word.rect.x;
    let drawY = word.rect.y;

    if (engine.introProgress < 1 && engine.introStartPositions[i]) {
      const t = easeOutCubic(engine.introProgress);
      const start = engine.introStartPositions[i];
      drawX = start.x + (word.rect.x - start.x) * t;
      drawY = start.y + (word.rect.y - start.y) * t;
    }

    ctx.save();
    ctx.font = `bold ${word.fontSize}px "Orbitron", "Share Tech Mono", monospace`;
    ctx.fillStyle = word.color;
    ctx.shadowColor = word.color;
    ctx.shadowBlur = 8;
    ctx.textBaseline = 'top';
    ctx.globalAlpha = word.opacity * Math.min(1, engine.introProgress * 2);
    ctx.fillText(word.text, drawX + 10, drawY + 5);
    ctx.restore();
  }

  // ── Power words ([MULTI] / [WIDEN]) ───────────────────────────────────
  for (const pw of powerWords) {
    if (!pw.isActive) continue;
    ctx.save();
    ctx.font = PW_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = `[${pw.text}]`;
    const tw = measureWidth(label, PW_FONT) + 16;
    const th = 22;
    const px = pw.pos.x - tw / 2;
    const py = pw.pos.y - th / 2;

    ctx.fillStyle = 'rgba(4, 6, 9, 0.9)';
    ctx.fillRect(px, py, tw, th);
    ctx.strokeStyle = pw.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, tw, th);
    ctx.fillStyle = pw.color;
    ctx.shadowColor = pw.color;
    ctx.shadowBlur = 6;
    ctx.fillText(label, pw.pos.x, pw.pos.y);
    ctx.restore();
  }

  // ── Particles (letter burst debris) ────────────────────────────────────
  for (const p of engine.particles) {
    if (p.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.font = `bold ${p.fontSize}px "Orbitron", "Share Tech Mono", monospace`;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.char, 0, 0);
    ctx.restore();
  }

  // ── Combo text ────────────────────────────────────────────────────────
  drawComboText(ctx, engine);

  // ── Balls ─────────────────────────────────────────────────────────────
  for (const ball of balls) {
    if (!ball.isActive) continue;
    drawDottedTrail(ctx, ball.trail);
    drawCircle(ctx, ball.pos, ball.radius + 3, 'rgba(255, 200, 50, 0.12)', false);
    drawCircle(ctx, ball.pos, ball.radius, '#ffd700', true);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.pos.x - 2, ball.pos.y - 2, ball.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.restore();
  }

  // ── Paddle ────────────────────────────────────────────────────────────
  drawPaddle(ctx, paddle);

  // ── End shake wrapper ─────────────────────────────────────────────────
  ctx.restore();

  // ── Overlays (outside shake) ──────────────────────────────────────────
  if (engine.state.isGameOver) {
    drawOverlay(ctx, 'GAME OVER', 'Press SPACE or tap to restart');
  } else if (engine.state.isLevelComplete) {
    drawOverlay(ctx, `LEVEL ${engine.state.level} COMPLETE`, 'Press SPACE or tap for next level');
  } else if (!engine.state.isStarted) {
    drawOverlay(ctx, '', 'Press UP / tap to launch the glyph');
  }
}

// ── Inlined draw helpers ────────────────────────────────────────────────

function drawCircle(ctx: CanvasRenderingContext2D, pos: Vector2, radius: number, color: string, glow: boolean) {
  ctx.save();
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawDottedTrail(ctx: CanvasRenderingContext2D, trail: Vector2[]) {
  const len = trail.length;
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const alpha = t * 0.7;
    const r = 1 + t * 2.5;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.fill();
  }
}

function drawPaddle(ctx: CanvasRenderingContext2D, p: { x: number; y: number; width: number; height: number }) {
  ctx.save();
  ctx.fillStyle = '#1a2a3a';
  ctx.strokeStyle = 'rgba(100, 180, 220, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.width, p.height, 3);
  ctx.fill();
  ctx.stroke();

  const segCount = Math.floor(p.width / 10);
  ctx.strokeStyle = 'rgba(100, 180, 220, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < segCount; i++) {
    const sx = p.x + (i / segCount) * p.width;
    ctx.beginPath();
    ctx.moveTo(sx, p.y + 2);
    ctx.lineTo(sx, p.y + p.height - 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(100, 180, 220, 0.8)';
  ctx.font = 'bold 16px "Share Tech Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText('[', p.x + 8, p.y + p.height / 2);
  ctx.textAlign = 'left';
  ctx.fillText(']', p.x + p.width - 8, p.y + p.height / 2);
  ctx.restore();
}

function drawBorder(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(80, 140, 180, 0.45)';
  ctx.lineWidth = BORDER_WIDTH;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(BORDER_WIDTH / 2, BORDER_WIDTH / 2, GAME_WIDTH - BORDER_WIDTH, GAME_HEIGHT - BORDER_WIDTH);
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCorners(ctx: CanvasRenderingContext2D) {
  const size = 14;
  const off = BORDER_WIDTH + 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(80, 160, 200, 0.55)';
  ctx.lineWidth = 2;

  for (const [cx, cy, sx, sy] of [[off, off, 1, 1], [GAME_WIDTH - off, off, -1, 1], [off, GAME_HEIGHT - off, 1, -1], [GAME_WIDTH - off, GAME_HEIGHT - off, -1, -1]] as const) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * size);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * size, cy);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(80, 160, 200, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 80; i < GAME_WIDTH - 80; i += 100) {
    drawCross(ctx, i, BORDER_WIDTH + 1, 3);
    drawCross(ctx, i, GAME_HEIGHT - BORDER_WIDTH - 1, 3);
  }
  for (let i = 80; i < GAME_HEIGHT - 80; i += 100) {
    drawCross(ctx, BORDER_WIDTH + 1, i, 3);
    drawCross(ctx, GAME_WIDTH - BORDER_WIDTH - 1, i, 3);
  }
  ctx.restore();
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s);
  ctx.lineTo(x, y + s);
  ctx.stroke();
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.save();
  ctx.fillStyle = 'rgba(4, 6, 9, 0.7)';
  ctx.fillRect(0, GAME_HEIGHT / 2 - 70, GAME_WIDTH, 140);
  if (title) {
    ctx.font = 'bold 36px "Orbitron", monospace';
    ctx.fillStyle = '#ff6b6b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 12;
    ctx.fillText(title, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
  }
  ctx.shadowBlur = 0;
  ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(180, 200, 220, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18);

  if (title === 'GAME OVER') {
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(122, 154, 181, 0.6)';
    ctx.fillText('Built by Anton Kovalev', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45);
  }
  ctx.restore();
}
