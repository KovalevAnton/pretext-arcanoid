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
  TEXT_WALL_FONT,
  WAKE_SPAWN_DISTANCE,
  WAKE_HOLE_RADIUS,
  WAKE_HOLE_MAX_LIFE,
  BG_GLYPH_COUNT,
  BG_GLYPH_CHARS,
  type PowerWordType,
} from '@/shared/config/constants';
import { measureWidth } from '@/shared/lib/text';
import { prepareWithSegments, type PreparedTextWithSegments } from '@chenglou/pretext';
import * as sound from '@/shared/lib/sound';

// ── Wake holes (temporary text wall gaps behind ball) ───────────────────

export interface WakeHole {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

// ── Background decorative glyphs ────────────────────────────────────────

export interface BackgroundGlyph {
  char: string;
  x: number;
  y: number;
  alpha: number;
  speed: number;
}

// ── Particles (letter burst from destroyed bricks) ─────────────────────

export interface Particle {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  spin: number;
  /** Radius of the gap this particle carves in the text wall. */
  wallRadius: number;
  fontSize: number;
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
  particles: Particle[];
  paddleTargetX: number;
  wakeHoles: WakeHole[];
  backgroundGlyphs: BackgroundGlyph[];
  textWallPrepared: PreparedTextWithSegments;
}

// ── Factory helpers ─────────────────────────────────────────────────────

function createBall(x: number, y: number, angle?: number): Ball {
  const a = angle ?? (-Math.PI / 2 + (Math.random() - 0.5) * 0.8);
  return {
    id: nextBallId++,
    pos: { x, y },
    vel: { x: Math.cos(a) * BALL_SPEED, y: Math.sin(a) * BALL_SPEED },
    radius: BALL_RADIUS,
    trail: [],
    isActive: true,
    wakePoint: null,
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

// ── Font strings ────────────────────────────────────────────────────────

function targetFont(fontSize: number): string {
  return `bold ${fontSize}px "Orbitron", "Share Tech Mono", monospace`;
}

// ── Layout target words (all measurement via pretext) ───────────────────

function layoutTargetWords(levelWords: string[]): TargetWord[] {
  const words: TargetWord[] = [];
  const marginX = 60;
  const marginY = 30;
  const areaWidth = GAME_WIDTH - marginX * 2;
  const areaHeight = GAME_HEIGHT - 180;

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
      const width = measureWidth(text, targetFont(fontSize)) + 20;

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

// ── Text wall copy (prepared once) ──────────────────────────────────────

function buildTextWallCopy(): string {
  const phrases = [
    'pretext layout measure cursor segment wrap glyph inline reflow stream bidi kern space split signal static dynamic vector module bounce trail track render flow',
    'text snakes between every obstacle and keeps every word alive while the field recomposes around the moving ball and the waiting paddle',
    'small copy fills the arena from border to border and the larger block labels stay readable as targets floating above the paragraph wall',
  ];
  return Array.from({ length: 80 }, (_, i) => phrases[i % phrases.length]!).join(' ');
}

// ── Background glyphs ──────────────────────────────────────────────────

function createBackgroundGlyphs(): BackgroundGlyph[] {
  const glyphs: BackgroundGlyph[] = [];
  for (let i = 0; i < BG_GLYPH_COUNT; i++) {
    glyphs.push({
      char: BG_GLYPH_CHARS[i % BG_GLYPH_CHARS.length],
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      alpha: 0.1 + Math.random() * 0.18,
      speed: 8 + Math.random() * 18,
    });
  }
  return glyphs;
}

function updateBackgroundGlyphs(engine: GameEngine, dtSec: number) {
  for (const g of engine.backgroundGlyphs) {
    g.y += g.speed * dtSec;
    if (g.y > GAME_HEIGHT + 10) {
      g.y = -10;
      g.x = 20 + Math.random() * (GAME_WIDTH - 40);
    }
  }
}

// ── Wake holes ─────────────────────────────────────────────────────────

function trackWake(engine: GameEngine, ball: Ball) {
  if (!engine.state.isRunning) return;
  if (ball.wakePoint === null) {
    ball.wakePoint = { x: ball.pos.x, y: ball.pos.y };
    return;
  }
  const dx = ball.pos.x - ball.wakePoint.x;
  const dy = ball.pos.y - ball.wakePoint.y;
  if (dx * dx + dy * dy < WAKE_SPAWN_DISTANCE * WAKE_SPAWN_DISTANCE) return;

  engine.wakeHoles.push({
    x: ball.pos.x,
    y: ball.pos.y,
    radius: WAKE_HOLE_RADIUS,
    life: 0,
    maxLife: WAKE_HOLE_MAX_LIFE,
  });
  ball.wakePoint = { x: ball.pos.x, y: ball.pos.y };
}

function updateWakeHoles(engine: GameEngine, dtSec: number) {
  for (let i = engine.wakeHoles.length - 1; i >= 0; i--) {
    const hole = engine.wakeHoles[i];
    hole.life += dtSec;
    if (hole.life >= hole.maxLife) {
      engine.wakeHoles.splice(i, 1);
    }
  }
}

// ── Particles ──────────────────────────────────────────────────────────

function spawnBurst(engine: GameEngine, word: TargetWord) {
  const cx = word.rect.x + word.rect.width / 2;
  const cy = word.rect.y + word.rect.height / 2;
  const letters = word.text.split('');
  for (let i = 0; i < letters.length; i++) {
    const angle = (Math.PI * 2 * i) / Math.max(1, letters.length) + Math.random() * 0.35;
    const speed = 80 + Math.random() * 120;
    const fs = Math.max(14, word.fontSize * 0.7);
    engine.particles.push({
      char: letters[i],
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      color: word.color,
      alpha: 1,
      life: 0,
      maxLife: 0.7 + Math.random() * 0.35,
      rotation: 0,
      spin: (Math.random() - 0.5) * 5,
      wallRadius: Math.max(10, fs * 0.72),
      fontSize: fs,
    });
  }
}

function updateParticles(engine: GameEngine, dtSec: number) {
  for (let i = engine.particles.length - 1; i >= 0; i--) {
    const p = engine.particles[i];
    p.life += dtSec;
    p.x += p.vx * dtSec;
    p.y += p.vy * dtSec;
    p.vy += 90 * dtSec; // gravity
    p.rotation += p.spin * dtSec;
    p.alpha = 1 - p.life / p.maxLife;
    if (p.life >= p.maxLife) {
      engine.particles.splice(i, 1);
    }
  }
}

// ── Engine creation ─────────────────────────────────────────────────────

export function createEngine(): GameEngine {
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
    words: layoutTargetWords(LEVEL_WORDS[0]),
    powerWords: [],
    particles: [],
    paddleTargetX: GAME_WIDTH / 2,
    wakeHoles: [],
    backgroundGlyphs: createBackgroundGlyphs(),
    textWallPrepared: prepareWithSegments(buildTextWallCopy(), TEXT_WALL_FONT),
  };
}

// ── Actions ─────────────────────────────────────────────────────────────

export function launchBall(engine: GameEngine) {
  if (engine.balls.length > 0 && engine.state.isStarted) return;

  const paddle = engine.paddle;
  engine.balls.push(createBall(
    paddle.x + paddle.width / 2,
    paddle.y - BALL_RADIUS - 2,
    -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
  ));
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
  engine.powerWords.push({
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
  });
}

function applyPowerUp(engine: GameEngine, type: PowerWordType) {
  if (engine.state.soundEnabled) sound.playPowerUp();

  if (type === 'multiBall') {
    const ref = engine.balls.find((b) => b.isActive);
    if (ref) {
      for (let i = 0; i < POWERUP_MULTIBALL_COUNT - 1; i++) {
        engine.balls.push(createBall(ref.pos.x, ref.pos.y, -Math.PI / 2 + (Math.random() - 0.5) * 1.5));
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
    const s = BALL_MAX_SPEED / speed;
    return { x: vel.x * s, y: vel.y * s };
  }
  if (speed < BALL_SPEED * 0.8) {
    const s = (BALL_SPEED * 0.8) / speed;
    return { x: vel.x * s, y: vel.y * s };
  }
  return vel;
}

// ── Main update ─────────────────────────────────────────────────────────

export function update(engine: GameEngine, dt: number) {
  const dtSec = dt / 1000;
  updateBackgroundGlyphs(engine, dtSec);
  updateWakeHoles(engine, dtSec);
  updateParticles(engine, dtSec);

  if (!engine.state.isRunning || engine.state.isGameOver || engine.state.isLevelComplete) return;

  const { paddle, balls, words, powerWords, state } = engine;

  // Time scale: frame-based physics assume ~60fps (16.67ms).
  const timeScale = dt / 16.667;

  // Paddle
  const targetX = engine.paddleTargetX - paddle.width / 2;
  paddle.x += (targetX - paddle.x) * Math.min(0.2 * timeScale, 1);
  paddle.x = Math.max(BORDER_WIDTH, Math.min(GAME_WIDTH - BORDER_WIDTH - paddle.width, paddle.x));

  if (paddle.isWidened) {
    paddle.widenTimer -= dt;
    if (paddle.widenTimer <= 0) {
      paddle.isWidened = false;
      paddle.width = PADDLE_WIDTH;
      paddle.widenTimer = 0;
    }
  }

  // Balls
  for (const ball of balls) {
    if (!ball.isActive) continue;

    ball.trail.push({ x: ball.pos.x, y: ball.pos.y });
    if (ball.trail.length > BALL_TRAIL_LENGTH) ball.trail.shift();

    ball.pos.x += ball.vel.x * timeScale;
    ball.pos.y += ball.vel.y * timeScale;

    trackWake(engine, ball);

    // Walls
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
    if (ball.pos.y + ball.radius >= GAME_HEIGHT) {
      ball.isActive = false;
      continue;
    }

    // Paddle
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

    // Words
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

        const oL = ball.pos.x + ball.radius - rect.x;
        const oR = rect.x + rect.width - (ball.pos.x - ball.radius);
        const oT = ball.pos.y + ball.radius - rect.y;
        const oB = rect.y + rect.height - (ball.pos.y - ball.radius);
        const min = Math.min(oL, oR, oT, oB);
        if (min === oL || min === oR) ball.vel.x = -ball.vel.x;
        else ball.vel.y = -ball.vel.y;

        if (state.soundEnabled) sound.playWordHit();
        spawnBurst(engine, word);
        spawnPowerWord(engine, word);
      }
    }
  }

  // Remove dead balls
  const active = balls.filter((b) => b.isActive);
  if (active.length === 0 && engine.state.isStarted) {
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
  engine.balls = active;

  // Power words
  for (const pw of powerWords) {
    if (!pw.isActive) continue;
    pw.pos.y += pw.vel.y * timeScale;
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

  // Level complete
  if (words.filter((w) => w.isAlive).length === 0) {
    state.isLevelComplete = true;
    state.isRunning = false;
    if (state.soundEnabled) sound.playLevelComplete();
  }
}

// ── Level transitions ───────────────────────────────────────────────────

export function nextLevel(engine: GameEngine) {
  const idx = engine.state.level % LEVEL_WORDS.length;
  engine.state.level++;
  engine.state.isLevelComplete = false;
  engine.state.isStarted = false;
  engine.state.isRunning = false;
  engine.balls = [];
  engine.powerWords = [];
  engine.particles = [];
  engine.paddle = createPaddle();
  engine.words = layoutTargetWords(LEVEL_WORDS[idx]);
  engine.wakeHoles = [];
}

export function resetGame(engine: GameEngine) {
  Object.assign(engine, createEngine());
}

export function toggleSound(engine: GameEngine) {
  engine.state.soundEnabled = !engine.state.soundEnabled;
}

export function getWordsRemaining(engine: GameEngine): number {
  return engine.words.filter((w) => w.isAlive).length;
}

export function getActivePowerUps(engine: GameEngine): string[] {
  const active: string[] = [];
  const n = engine.balls.filter((b) => b.isActive).length;
  if (n > 1) active.push(`${n} BALLS`);
  if (engine.paddle.isWidened) active.push(`WIDEN ${Math.ceil(engine.paddle.widenTimer / 1000)}s`);
  return active;
}
