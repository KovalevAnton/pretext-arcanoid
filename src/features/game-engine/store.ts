import { create } from 'zustand';
import type { GameEngine } from './engine';
import { getWordsRemaining, getActivePowerUps } from './engine';

interface GameStore {
  score: number;
  lives: number;
  level: number;
  wordsRemaining: number;
  activePowerUps: string[];
  isRunning: boolean;
  isStarted: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  soundEnabled: boolean;
  gameSpeed: number;
  combo: number;
  maxCombo: number;
  highScore: number;
  cvUnlocked: boolean;

  sync: (engine: GameEngine) => void;
  setGameSpeed: (speed: number) => void;
  setHighScore: (score: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  lives: 3,
  level: 1,
  wordsRemaining: 16,
  activePowerUps: [],
  isRunning: false,
  isStarted: false,
  isGameOver: false,
  isLevelComplete: false,
  soundEnabled: false,
  gameSpeed: 1,
  combo: 0,
  maxCombo: 0,
  highScore: parseInt(localStorage.getItem('stackbreaker-highscore') || '0', 10),
  cvUnlocked: localStorage.getItem('stackbreaker-cv-unlocked') === '1',

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  setHighScore: (score) => {
    localStorage.setItem('stackbreaker-highscore', String(score));
    set({ highScore: score });
  },
  sync: (engine) => {
    const justUnlocked = engine.state.level >= 2 ||
      (engine.state.isLevelComplete && engine.state.level === 1);
    if (justUnlocked) localStorage.setItem('stackbreaker-cv-unlocked', '1');
    set({
      score: engine.state.score,
      lives: engine.state.lives,
      level: engine.state.level,
      isRunning: engine.state.isRunning,
      isStarted: engine.state.isStarted,
      isGameOver: engine.state.isGameOver,
      isLevelComplete: engine.state.isLevelComplete,
      soundEnabled: engine.state.soundEnabled,
      wordsRemaining: getWordsRemaining(engine),
      activePowerUps: getActivePowerUps(engine),
      combo: engine.combo,
      maxCombo: engine.maxCombo,
      cvUnlocked: justUnlocked || localStorage.getItem('stackbreaker-cv-unlocked') === '1',
    });
  },
}));
