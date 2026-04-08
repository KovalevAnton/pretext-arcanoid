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

  /** Sync UI-visible state from the mutable engine. */
  sync: (engine: GameEngine) => void;
  setGameSpeed: (speed: number) => void;
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

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  sync: (engine) => set({
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
  }),
}));
