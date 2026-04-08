export const GAME_WIDTH = 1100;
export const GAME_HEIGHT = 700;

export const PADDLE_WIDTH = 140;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y_OFFSET = 40;
export const PADDLE_SPEED = 10;
export const PADDLE_WIDEN_FACTOR = 1.8;

export const BALL_RADIUS = 8;
export const BALL_SPEED = 5;
export const BALL_MAX_SPEED = 9;
export const BALL_TRAIL_LENGTH = 8;

export const INITIAL_LIVES = 3;
export const WORD_HIT_SCORE = 10;
export const POWER_WORD_SCORE = 50;

export const POWERUP_WIDEN_DURATION = 11000;
export const POWERUP_MULTIBALL_COUNT = 3;

export const BORDER_WIDTH = 3;
export const HUD_HEIGHT = 0;

export const BACKGROUND_WORDS = [
  'pretext', 'layout', 'measure', 'cursor', 'segment', 'wrap',
  'glyph', 'inline', 'reflow', 'stream', 'bidi', 'kern', 'space',
  'split', 'signal', 'static', 'dynamic', 'vector', 'module',
  'bounce', 'trail', 'track', 'render', 'flow', 'text', 'snakes',
  'between', 'every', 'obstacle', 'and', 'keeps', 'every', 'word',
  'alive', 'while', 'the', 'field', 'recomposes', 'around', 'the',
  'moving', 'ball', 'and', 'the', 'waiting', 'paddle', 'small', 'copy',
  'fills', 'the', 'arena', 'from', 'border', 'to', 'border', 'and',
  'the', 'larger', 'block', 'labels', 'stay', 'readable', 'as',
  'targets', 'floating', 'above', 'the', 'paragraph', 'wall',
];

export const BALL_REPULSION_RADIUS = 70;
export const BALL_REPULSION_STRENGTH = 55;
export const WORD_REPULSION_PADDING = 22;
export const WORD_REPULSION_STRENGTH = 35;
export const BG_WORD_RETURN_SPEED = 0.12;

export const WORD_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff922b', '#845ef7', '#20c997', '#f06595',
  '#e8590c', '#94d82d', '#66d9e8', '#fcc419',
  '#ff8787', '#ffe066', '#69db7c', '#74c0fc',
];

export const LEVEL_WORDS: string[][] = [
  [
    'Pretext', 'turns', 'motion', 'into', 'language',
    'while', 'bright', 'words', 'hold', 'fast', 'and', 'the',
    'wall', 'bends', 'around', 'them',
  ],
  [
    'Canvas', 'draws', 'light', 'across', 'the',
    'every', 'pixel', 'frame', 'burns', 'sharp', 'and', 'clear',
    'glyph', 'renders', 'clean', 'lines',
  ],
  [
    'React', 'builds', 'state', 'through', 'hooks',
    'compose', 'views', 'that', 'update', 'fast', 'in', 'the',
    'render', 'loop', 'again', 'now',
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
