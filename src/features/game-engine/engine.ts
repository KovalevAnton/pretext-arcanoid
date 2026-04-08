import type { Ball } from '@/entities/ball/types';
import type { Paddle } from '@/entities/paddle/types';
import type { TargetWord } from '@/entities/word/types';
import type { PowerWord } from '@/entities/power-word/types';
import type { GameState, Vector2 } from '@/shared/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y_OFFSET,
  PADDLE_WIDEN_FACTOR,
  BALL_RADIUS,
  BALL_SPEED,
  BALL_MAX_SPEED,
  BALL_TRAIL_LENGTH,
  INITIAL_LIVES,
  WORD_HIT_SCORE,
  POWER_WORD_SCORE,
  BORDER_WIDTH,
  LEVEL_WORDS,
  WORD_COLORS,
  POWER_WORDS,
  POWERUP_WIDEN_DURATION,
  POWERUP_MULTIBALL_COUNT,
  BALL_REPULSION_RADIUS,
  BALL_REPULSION_STRENGTH,
  WORD_REPULSION_PADDING,
  WORD_REPULSION_STRENGTH,
  BG_WORD_RETURN_SPEED,
  BACKGROUND_WORDS,
  type PowerWordType,
} from '@/shared/config/constants';
import * as sound from '@/shared/lib/sound';
import { prepare, layout } from '@chenglou/pretext';

// ── Background word particle ────────────────────────────────────────────

export interface BgWord {
  text: string;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── IDs ─────────────────────────────────────────────────────────────────

let nextBallId = 0;
let nextWordId = 0;
let nextPowerWordId = 0;

// ── Engine state ────────────────────────────────────────────────────────

export interface GameEngine {
  state: GameState;
  balls: Ball[];
  paddle: Paddle;
  words: TargetWord[];
  powerWords: PowerWord[];
  paddleTargetX: number;
  bgWords: BgWord[];
}

// ── Factory helpers ─────────────────────────────────────────────────────

function createBall(x: number, y: number, angle?: number): Ball {
  const a = angle ?? (-Math.PI / 2 + (Math.random() - 0.5) * 0.8);
  return {
    id: nextBallId++,
    pos: { x, y },
    vel: {
      x: Math.cos(a) * BALL_SPEED,
      y: Math.sin(a) * BALL_SPEED,
    },
    radius: BALL_RADIUS,
    trail: [],
    isActive: true,
  };
}

function createPaddle(): Paddle {
  return {
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - PADDLE_Y_OFFSET,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    isWidened: false,
    widenTimer: 0,
  };
}

// ── Measure helpers (uses pretext + canvas fallback) ────────────────────

const _measureCanvas = document.createElement('canvas');
const _measureCtx = _measureCanvas.getContext('2d')!;

function measureWord(text: string, font: string): { width: number; height: number } {
  try {
    const prepared = prepare(text, font);
    const result = layout(prepared, Infinity, parseFloat(font));
    _measureCtx.font = font;
    return { width: _measureCtx.measureText(text).width, height: result.height || parseFloat(font) };
  } catch {
    _measureCtx.font = font;
    const m = _measureCtx.measureText(text);
    return { width: m.width, height: parseFloat(font) };
  }
}

function measureTargetWord(text: string, fontSize: number): number {
  _measureCtx.font = `bold ${fontSize}px 'Orbitron', 'Share Tech Mono', monospace`;
  return _measureCtx.measureText(text).width;
}

// ── Layout target words ─────────────────────────────────────────────────

function layoutTargetWords(levelWords: string[]): TargetWord[] {
  const words: TargetWord[] = [];
  const marginX = 60;
  const marginY = 30;
  const areaWidth = GAME_WIDTH - marginX * 2;
  const areaHeight = GAME_HEIGHT - 180;

  // Arrange in rows matching the phrase structure: 5 / 7 / 4 for 16 words
  const rowCounts = levelWords.length === 16
    ? [5, 7, 4]
    : levelWords.length === 12
      ? [4, 4, 4]
      : [Math.ceil(levelWords.length / 3), Math.ceil(levelWords.length / 3), levelWords.length - 2 * Math.ceil(levelWords.length / 3)];

  const rows = rowCounts.length;
  const rowHeight = areaHeight / rows;
  let wordIdx = 0;

  for (let row = 0; row < rows; row++) {
    const count = rowCounts[row];
    const cellWidth = areaWidth / count;

    for (let col = 0; col < count && wordIdx < levelWords.length; col++) {
      const text = levelWords[wordIdx];
      const fontSize = text.length <= 3 ? 50 : text.length <= 5 ? 44 : text.length <= 7 ? 38 : 32;
      const width = measureTargetWord(text, fontSize) + 20;

      const x = marginX + col * cellWidth + cellWidth / 2 - width / 2;
      const y = marginY + row * rowHeight + rowHeight / 2 - fontSize / 2;

      words.push({
        id: nextWordId++,
        text,
        rect: { x, y, width, height: fontSize + 10 },
        color: WORD_COLORS[wordIdx % WORD_COLORS.length],
        isAlive: true,
        fontSize,
        opacity: 1,
      });
      wordIdx++;
    }
  }
  return words;
}

// ── Background word layout (per-word particles) ─────────────────────────

function createBgWords(): BgWord[] {
  const font = '11px "Share Tech Mono", monospace';
  const lineHeight = 19;
  const padding = BORDER_WIDTH + 6;
  const areaWidth = GAME_WIDTH - padding * 2;
  const words: BgWord[] = [];

  let x = padding;
  let y = padding;
  let wordIdx = 0;

  while (y < GAME_HEIGHT - padding) {
    const text = BACKGROUND_WORDS[wordIdx % BACKGROUND_WORDS.length];
    const m = measureWord(text, font);
    const spaceWidth = 6;

    if (x + m.width > GAME_WIDTH - padding) {
      x = padding;
      y += lineHeight;
      if (y > GAME_HEIGHT - padding) break;
    }

    words.push({
      text,
      homeX: x,
      homeY: y,
      x,
      y,
      width: m.width,
      height: lineHeight,
    });

    x += m.width + spaceWidth;
    wordIdx++;
  }

  return words;
}

// ── Update background word positions (repulsion) ────────────────────────

function updateBgWords(engine: GameEngine) {
  const { bgWords, balls, words } = engine;

  for (let i = 0; i < bgWords.length; i++) {
    const bw = bgWords[i];
    let dx = 0;
    let dy = 0;

    // Center of background word
    const bwCx = bw.homeX + bw.width / 2;
    const bwCy = bw.homeY + bw.height / 2;

    // Repulsion from balls
    for (let j = 0; j < balls.length; j++) {
      const ball = balls[j];
      if (!ball.isActive) continue;

      const diffX = bwCx - ball.pos.x;
      const diffY = bwCy - ball.pos.y;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      if (dist < BALL_REPULSION_RADIUS && dist > 0.1) {
        const force = (1 - dist / BALL_REPULSION_RADIUS) * BALL_REPULSION_STRENGTH;
        dx += (diffX / dist) * force;
        dy += (diffY / dist) * force;
      }
    }

    // Repulsion from alive target words
    for (let j = 0; j < words.length; j++) {
      const tw = words[j];
      if (!tw.isAlive) continue;

      const pad = WORD_REPULSION_PADDING;
      const twLeft = tw.rect.x - pad;
      const twRight = tw.rect.x + tw.rect.width + pad;
      const twTop = tw.rect.y - pad;
      const twBottom = tw.rect.y + tw.rect.height + pad;

      // Check if bg word center is within the repulsion zone
      if (bwCx > twLeft && bwCx < twRight && bwCy > twTop && bwCy < twBottom) {
        const twCx = tw.rect.x + tw.rect.width / 2;
        const twCy = tw.rect.y + tw.rect.height / 2;
        const diffX = bwCx - twCx;
        const diffY = bwCy - twCy;
        const dist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (dist > 0.1) {
          // Stronger push perpendicular to the word (mostly horizontal or vertical)
          const halfW = tw.rect.width / 2 + pad;
          const halfH = tw.rect.height / 2 + pad;
          const normX = diffX / halfW;
          const normY = diffY / halfH;
          const normLen = Math.sqrt(normX * normX + normY * normY);

          if (normLen > 0.01) {
            const force = WORD_REPULSION_STRENGTH * (1 - Math.min(normLen, 1));
            dx += (normX / normLen) * force;
            dy += (normY / normLen) * force;
          }
        }
      }
    }

    // Apply displacement with smooth return to home
    const targetX = bw.homeX + dx;
    const targetY = bw.homeY + dy;
    bw.x += (targetX - bw.x) * BG_WORD_RETURN_SPEED;
    bw.y += (targetY - bw.y) * BG_WORD_RETURN_SPEED;
  }
}

// ── Engine creation ─────────────────────────────────────────────────────

export function createEngine(): GameEngine {
  const levelIdx = 0;
  const levelWords = LEVEL_WORDS[levelIdx];

  return {
    state: {
      score: 0,
      lives: INITIAL_LIVES,
      level: 1,
      isRunning: false,
      isStarted: false,
      isGameOver: false,
      isLevelComplete: false,
      soundEnabled: false,
    },
    balls: [],
    paddle: createPaddle(),
    words: layoutTargetWords(levelWords),
    powerWords: [],
    paddleTargetX: GAME_WIDTH / 2,
    bgWords: createBgWords(),
  };
}

// ── Actions ─────────────────────────────────────────────────────────────

export function launchBall(engine: GameEngine) {
  if (engine.balls.length > 0 && engine.state.isStarted) return;

  const paddle = engine.paddle;
  const ball = createBall(
    paddle.x + paddle.width / 2,
    paddle.y - BALL_RADIUS - 2,
    -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
  );

  engine.balls.push(ball);
  engine.state.isStarted = true;
  engine.state.isRunning = true;
}

export function setPaddleTarget(engine: GameEngine, x: number) {
  engine.paddleTargetX = Math.max(
    BORDER_WIDTH + engine.paddle.width / 2,
    Math.min(GAME_WIDTH - BORDER_WIDTH - engine.paddle.width / 2, x),
  );
}

function spawnPowerWord(engine: GameEngine, fromWord: TargetWord) {
  if (Math.random() > 0.35) return;

  const config = POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)];
  const pw: PowerWord = {
    id: nextPowerWordId++,
    text: config.text,
    type: config.type,
    pos: {
      x: fromWord.rect.x + fromWord.rect.width / 2,
      y: fromWord.rect.y + fromWord.rect.height / 2,
    },
    vel: { x: 0, y: 1.5 },
    color: config.color,
    isActive: true,
    width: 70,
    height: 20,
  };
  engine.powerWords.push(pw);
}

function applyPowerUp(engine: GameEngine, type: PowerWordType) {
  if (engine.state.soundEnabled) sound.playPowerUp();

  if (type === 'multiBall') {
    const refBall = engine.balls.find((b) => b.isActive);
    if (refBall) {
      for (let i = 0; i < POWERUP_MULTIBALL_COUNT - 1; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const newBall = createBall(refBall.pos.x, refBall.pos.y, angle);
        engine.balls.push(newBall);
      }
    }
  } else if (type === 'widen') {
    engine.paddle.isWidened = true;
    engine.paddle.width = PADDLE_WIDTH * PADDLE_WIDEN_FACTOR;
    engine.paddle.widenTimer = POWERUP_WIDEN_DURATION;
  }
}

function clampSpeed(vel: Vector2): Vector2 {
  const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  if (speed > BALL_MAX_SPEED) {
    const scale = BALL_MAX_SPEED / speed;
    return { x: vel.x * scale, y: vel.y * scale };
  }
  if (speed < BALL_SPEED * 0.8) {
    const scale = (BALL_SPEED * 0.8) / speed;
    return { x: vel.x * scale, y: vel.y * scale };
  }
  return vel;
}

// ── Main update ─────────────────────────────────────────────────────────

export function update(engine: GameEngine, dt: number) {
  // Always update bg words so the repulsion feels alive even when paused
  updateBgWords(engine);

  if (!engine.state.isRunning || engine.state.isGameOver || engine.state.isLevelComplete) return;

  const { paddle, balls, words, powerWords, state } = engine;

  // Paddle position (smooth follow)
  const targetX = engine.paddleTargetX - paddle.width / 2;
  const paddleDx = targetX - paddle.x;
  paddle.x += paddleDx * 0.2;
  paddle.x = Math.max(BORDER_WIDTH, Math.min(GAME_WIDTH - BORDER_WIDTH - paddle.width, paddle.x));

  // Widen timer
  if (paddle.isWidened) {
    paddle.widenTimer -= dt;
    if (paddle.widenTimer <= 0) {
      paddle.isWidened = false;
      paddle.width = PADDLE_WIDTH;
      paddle.widenTimer = 0;
    }
  }

  // Update balls
  for (const ball of balls) {
    if (!ball.isActive) continue;

    // Trail
    ball.trail.push({ x: ball.pos.x, y: ball.pos.y });
    if (ball.trail.length > BALL_TRAIL_LENGTH) ball.trail.shift();

    // Move
    ball.pos.x += ball.vel.x;
    ball.pos.y += ball.vel.y;

    // Wall collisions
    if (ball.pos.x - ball.radius <= BORDER_WIDTH) {
      ball.pos.x = BORDER_WIDTH + ball.radius;
      ball.vel.x = Math.abs(ball.vel.x);
      if (state.soundEnabled) sound.playBounceWall();
    }
    if (ball.pos.x + ball.radius >= GAME_WIDTH - BORDER_WIDTH) {
      ball.pos.x = GAME_WIDTH - BORDER_WIDTH - ball.radius;
      ball.vel.x = -Math.abs(ball.vel.x);
      if (state.soundEnabled) sound.playBounceWall();
    }
    if (ball.pos.y - ball.radius <= BORDER_WIDTH) {
      ball.pos.y = BORDER_WIDTH + ball.radius;
      ball.vel.y = Math.abs(ball.vel.y);
      if (state.soundEnabled) sound.playBounceWall();
    }

    // Bottom — lose ball
    if (ball.pos.y + ball.radius >= GAME_HEIGHT) {
      ball.isActive = false;
      continue;
    }

    // Paddle collision
    if (
      ball.vel.y > 0 &&
      ball.pos.y + ball.radius >= paddle.y &&
      ball.pos.y + ball.radius <= paddle.y + paddle.height + 4 &&
      ball.pos.x >= paddle.x &&
      ball.pos.x <= paddle.x + paddle.width
    ) {
      const hitPos = (ball.pos.x - paddle.x) / paddle.width;
      const angle = -Math.PI / 2 + (hitPos - 0.5) * 1.2;
      const speed = Math.sqrt(ball.vel.x * ball.vel.x + ball.vel.y * ball.vel.y);
      ball.vel.x = Math.cos(angle) * speed;
      ball.vel.y = Math.sin(angle) * speed;
      ball.pos.y = paddle.y - ball.radius;
      if (state.soundEnabled) sound.playBouncePaddle();
    }

    ball.vel = clampSpeed(ball.vel);

    // Word collisions
    for (const word of words) {
      if (!word.isAlive) continue;

      const { rect } = word;
      if (
        ball.pos.x + ball.radius > rect.x &&
        ball.pos.x - ball.radius < rect.x + rect.width &&
        ball.pos.y + ball.radius > rect.y &&
        ball.pos.y - ball.radius < rect.y + rect.height
      ) {
        word.isAlive = false;
        word.opacity = 0;
        state.score += WORD_HIT_SCORE;

        const overlapLeft = ball.pos.x + ball.radius - rect.x;
        const overlapRight = rect.x + rect.width - (ball.pos.x - ball.radius);
        const overlapTop = ball.pos.y + ball.radius - rect.y;
        const overlapBottom = rect.y + rect.height - (ball.pos.y - ball.radius);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.vel.x = -ball.vel.x;
        } else {
          ball.vel.y = -ball.vel.y;
        }

        if (state.soundEnabled) sound.playWordHit();
        spawnPowerWord(engine, word);
      }
    }
  }

  // Remove inactive balls
  const activeBalls = balls.filter((b) => b.isActive);
  if (activeBalls.length === 0 && engine.state.isStarted) {
    state.lives--;
    if (state.soundEnabled) sound.playLifeLost();

    if (state.lives <= 0) {
      state.isGameOver = true;
      state.isRunning = false;
      if (state.soundEnabled) sound.playGameOver();
    } else {
      engine.state.isStarted = false;
      engine.state.isRunning = false;
    }
  }
  engine.balls = activeBalls;

  // Update power words
  for (const pw of powerWords) {
    if (!pw.isActive) continue;
    pw.pos.y += pw.vel.y;

    if (
      pw.pos.y + pw.height / 2 >= paddle.y &&
      pw.pos.y - pw.height / 2 <= paddle.y + paddle.height &&
      pw.pos.x + pw.width / 2 >= paddle.x &&
      pw.pos.x - pw.width / 2 <= paddle.x + paddle.width
    ) {
      pw.isActive = false;
      state.score += POWER_WORD_SCORE;
      applyPowerUp(engine, pw.type);
    }

    if (pw.pos.y > GAME_HEIGHT + 30) pw.isActive = false;
  }
  engine.powerWords = powerWords.filter((pw) => pw.isActive);

  // Check level complete
  if (words.filter((w) => w.isAlive).length === 0) {
    state.isLevelComplete = true;
    state.isRunning = false;
    if (state.soundEnabled) sound.playLevelComplete();
  }
}

// ── Level transitions ───────────────────────────────────────────────────

export function nextLevel(engine: GameEngine) {
  const nextLevelIdx = engine.state.level % LEVEL_WORDS.length;
  engine.state.level++;
  engine.state.isLevelComplete = false;
  engine.state.isStarted = false;
  engine.state.isRunning = false;
  engine.balls = [];
  engine.powerWords = [];
  engine.paddle = createPaddle();
  engine.words = layoutTargetWords(LEVEL_WORDS[nextLevelIdx]);
  engine.bgWords = createBgWords();
}

export function resetGame(engine: GameEngine) {
  const fresh = createEngine();
  Object.assign(engine, fresh);
}

export function toggleSound(engine: GameEngine) {
  engine.state.soundEnabled = !engine.state.soundEnabled;
}

export function getWordsRemaining(engine: GameEngine): number {
  return engine.words.filter((w) => w.isAlive).length;
}

export function getActivePowerUps(engine: GameEngine): string[] {
  const active: string[] = [];
  const multiBallCount = engine.balls.filter((b) => b.isActive).length;
  if (multiBallCount > 1) active.push(`${multiBallCount} BALLS`);
  if (engine.paddle.isWidened) active.push(`WIDEN ${Math.ceil(engine.paddle.widenTimer / 1000)}s`);
  return active;
}
