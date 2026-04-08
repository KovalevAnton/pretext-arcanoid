export const GAME_WIDTH = 1100;
export const GAME_HEIGHT = 700;

export const PADDLE_WIDTH = 140;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y_OFFSET = 40;
export const PADDLE_WIDEN_FACTOR = 1.8;

export const BALL_RADIUS = 8;
export const BALL_SPEED = 5;
export const BALL_MAX_SPEED = 9;
export const BALL_TRAIL_LENGTH = 28;

export const INITIAL_LIVES = 3;
export const WORD_HIT_SCORE = 10;
export const POWER_WORD_SCORE = 50;

export const POWERUP_WIDEN_DURATION = 11000;
export const POWERUP_MULTIBALL_COUNT = 3;

export const BORDER_WIDTH = 3;

// ── Text wall ───────────────────────────────────────────────────────────
export const TEXT_WALL_FONT = '600 12px "Share Tech Mono", monospace';
export const TEXT_WALL_LINE_HEIGHT = 16;
export const TEXT_WALL_ALPHA = 0.35;
export const TEXT_WALL_COLORS = ['#ffffff', '#fffeee', '#fffddd', '#fffccc'];
export const TEXT_WALL_MIN_SLOT = 18;
export const TEXT_WALL_BRICK_PAD = 8;
export const TEXT_WALL_PADDLE_PAD = 12;
export const TEXT_WALL_REGION_PAD = 14;

// ── Wake holes ──────────────────────────────────────────────────────────
export const WAKE_SPAWN_DISTANCE = 16;
export const BALL_WAKE_RADIUS = 38;
export const WAKE_HOLE_RADIUS = 30;
export const WAKE_HOLE_MAX_LIFE = 0.42;

// ── Background glyphs ──────────────────────────────────────────────────
export const BG_GLYPH_COUNT = 54;
export const BG_GLYPH_CHARS = ['.', ':', '\u00B7', '*', '+', ';'];

// ── Screen shake ────────────────────────────────────────────────────────
export const SHAKE_INTENSITY = 4;
export const SHAKE_DURATION = 150;

// ── Combo system ────────────────────────────────────────────────────────
export const COMBO_TIMEOUT = 2000;
export const COMBO_DISPLAY_DURATION = 800;

export const WORD_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff922b', '#845ef7', '#20c997', '#f06595',
  '#e8590c', '#94d82d', '#66d9e8', '#fcc419',
  '#ff8787', '#ffe066', '#69db7c', '#74c0fc',
];

export const LEVEL_WORDS: string[][] = [
  [
    'React', 'Next.js', 'TypeScript', 'Redux',
    'Zustand', 'SWR', 'GraphQL', 'Cypress',
    'ESLint', 'Prettier', 'Svelte', 'Vite',
  ],
  [
    'Expo', 'NativeWind', 'Scrum', 'React Query',
    'next-intl', 'Airtable', 'JSDoc', 'Canvas',
    'JavaScript', 'CSS', 'HTML', 'React Native',
  ],
  [
    'Web Audio', 'PHP', 'Git', 'REST',
    'Node.js', 'Tailwind', 'Webpack', 'Figma',
    'Jest', 'Docker', 'Storybook', 'SASS',
  ],
];

export type PowerWordType = 'multiBall' | 'widen';

export interface PowerWordConfig {
  text: string;
  type: PowerWordType;
  color: string;
}

export const POWER_WORDS: PowerWordConfig[] = [
  { text: 'MULTI', type: 'multiBall', color: '#845ef7' },
  { text: 'WIDEN', type: 'widen', color: '#4d96ff' },
];
