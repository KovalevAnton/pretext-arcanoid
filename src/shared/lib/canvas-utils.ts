import type { Vector2 } from '@/shared/types';

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  pos: Vector2,
  radius: number,
  color: string,
  glow = false,
) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: Vector2[],
  radius: number,
  color: string,
) {
  for (let i = 0; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.4;
    const r = radius * (0.3 + (i / trail.length) * 0.7);
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.fill();
  }
}

export function drawDottedTrail(
  ctx: CanvasRenderingContext2D,
  trail: Vector2[],
  color: string,
) {
  for (let i = 0; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.6;
    const r = 1.5 + (i / trail.length) * 1.5;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.fill();
  }
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

export function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  borderWidth: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    width - borderWidth,
    height - borderWidth,
  );
  ctx.setLineDash([]);
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
  glow = false,
) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
  }
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}
