import type { GameEngine } from './engine';
import { GAME_WIDTH, GAME_HEIGHT, BORDER_WIDTH } from '@/shared/config/constants';
import { drawCircle, drawDottedTrail } from '@/shared/lib/canvas-utils';

export function render(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const { balls, paddle, words, powerWords, bgWords } = engine;

  // ── Background ────────────────────────────────────────────────────────
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // ── Background words (individually displaced) ─────────────────────────
  ctx.save();
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textBaseline = 'top';

  for (let i = 0; i < bgWords.length; i++) {
    const bw = bgWords[i];
    // Words close to their home are full opacity; displaced words get slightly brighter
    const dispX = bw.x - bw.homeX;
    const dispY = bw.y - bw.homeY;
    const disp = Math.sqrt(dispX * dispX + dispY * dispY);
    const alpha = 0.22 + Math.min(disp / 60, 0.2);
    ctx.fillStyle = `rgba(100, 130, 160, ${alpha})`;
    ctx.fillText(bw.text, bw.x, bw.y);
  }
  ctx.restore();

  // ── Border ────────────────────────────────────────────────────────────
  drawBorder(ctx);
  drawCorners(ctx);

  // ── Target words ──────────────────────────────────────────────────────
  for (const word of words) {
    if (!word.isAlive) continue;

    ctx.save();
    ctx.font = `bold ${word.fontSize}px 'Orbitron', 'Share Tech Mono', monospace`;
    ctx.fillStyle = word.color;
    ctx.shadowColor = word.color;
    ctx.shadowBlur = 8;
    ctx.textBaseline = 'top';
    ctx.globalAlpha = word.opacity;
    ctx.fillText(word.text, word.rect.x + 10, word.rect.y + 5);
    ctx.restore();
  }

  // ── Power words (falling, bracket style) ──────────────────────────────
  for (const pw of powerWords) {
    if (!pw.isActive) continue;

    ctx.save();
    ctx.font = 'bold 14px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = `[${pw.text}]`;
    const tw = ctx.measureText(label).width + 16;
    const th = 22;
    const px = pw.pos.x - tw / 2;
    const py = pw.pos.y - th / 2;

    // Background fill
    ctx.fillStyle = 'rgba(10, 14, 23, 0.85)';
    ctx.fillRect(px, py, tw, th);

    // Border
    ctx.strokeStyle = pw.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, tw, th);

    // Text
    ctx.fillStyle = pw.color;
    ctx.shadowColor = pw.color;
    ctx.shadowBlur = 6;
    ctx.fillText(label, pw.pos.x, pw.pos.y);
    ctx.restore();
  }

  // ── Balls ─────────────────────────────────────────────────────────────
  for (const ball of balls) {
    if (!ball.isActive) continue;

    drawDottedTrail(ctx, ball.trail, 'rgba(255, 215, 0, 0.5)');
    drawCircle(ctx, ball.pos, ball.radius + 3, 'rgba(255, 200, 50, 0.12)', false);
    drawCircle(ctx, ball.pos, ball.radius, '#ffd700', true);

    // Highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.pos.x - 2, ball.pos.y - 2, ball.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.restore();
  }

  // ── Paddle ────────────────────────────────────────────────────────────
  drawPaddle(ctx, paddle);

  // ── Overlays ──────────────────────────────────────────────────────────
  if (engine.state.isGameOver) {
    drawOverlay(ctx, 'GAME OVER', 'Press SPACE or tap to restart');
  } else if (engine.state.isLevelComplete) {
    drawOverlay(ctx, `LEVEL ${engine.state.level} COMPLETE`, 'Press SPACE or tap for next level');
  } else if (!engine.state.isStarted) {
    drawOverlay(ctx, '', 'Press UP / tap to launch the glyph');
  }
}

// ── Sub-renderers ───────────────────────────────────────────────────────

function drawPaddle(ctx: CanvasRenderingContext2D, paddle: { x: number; y: number; width: number; height: number }) {
  const { x, y, width, height } = paddle;

  ctx.save();
  ctx.fillStyle = '#1a2a3a';
  ctx.strokeStyle = 'rgba(100, 180, 220, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 3);
  ctx.fill();
  ctx.stroke();

  // Segments
  const segCount = Math.floor(width / 10);
  ctx.strokeStyle = 'rgba(100, 180, 220, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < segCount; i++) {
    const sx = x + (i / segCount) * width;
    ctx.beginPath();
    ctx.moveTo(sx, y + 2);
    ctx.lineTo(sx, y + height - 2);
    ctx.stroke();
  }

  // Brackets
  ctx.fillStyle = 'rgba(100, 180, 220, 0.8)';
  ctx.font = 'bold 16px "Share Tech Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText('[', x + 8, y + height / 2);
  ctx.textAlign = 'left';
  ctx.fillText(']', x + width - 8, y + height / 2);
  ctx.restore();
}

function drawBorder(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(80, 140, 180, 0.45)';
  ctx.lineWidth = BORDER_WIDTH;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    BORDER_WIDTH / 2,
    BORDER_WIDTH / 2,
    GAME_WIDTH - BORDER_WIDTH,
    GAME_HEIGHT - BORDER_WIDTH,
  );
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCorners(ctx: CanvasRenderingContext2D) {
  const size = 14;
  const offset = BORDER_WIDTH + 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(80, 160, 200, 0.55)';
  ctx.lineWidth = 2;

  const corners: [number, number, number, number][] = [
    [offset, offset, 1, 1],
    [GAME_WIDTH - offset, offset, -1, 1],
    [offset, GAME_HEIGHT - offset, 1, -1],
    [GAME_WIDTH - offset, GAME_HEIGHT - offset, -1, -1],
  ];

  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * size);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * size, cy);
    ctx.stroke();
  }

  // Small cross decorations along the border
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

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 10, 20, 0.6)';
  ctx.fillRect(0, GAME_HEIGHT / 2 - 60, GAME_WIDTH, 120);

  if (title) {
    ctx.font = 'bold 36px "Orbitron", monospace';
    ctx.fillStyle = '#ff6b6b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 12;
    ctx.fillText(title, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 15);
  }

  ctx.shadowBlur = 0;
  ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(180, 200, 220, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25);
  ctx.restore();
}
