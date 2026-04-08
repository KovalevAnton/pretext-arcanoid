import { useRef, useEffect, useCallback, useState } from 'react';
import {
  createEngine,
  launchBall,
  setPaddleTarget,
  update,
  nextLevel,
  resetGame,
  toggleSound,
  getWordsRemaining,
  getActivePowerUps,
  type GameEngine,
} from './engine';
import { render } from './renderer';
import { GAME_WIDTH, GAME_HEIGHT } from '@/shared/config/constants';
import type { GameState } from '@/shared/types';

export interface UseGameReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: GameState;
  wordsRemaining: number;
  activePowerUps: string[];
  onToggleSound: () => void;
}

export function useGame(): UseGameReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    isRunning: false,
    isStarted: false,
    isGameOver: false,
    isLevelComplete: false,
    soundEnabled: false,
  });
  const [wordsRemaining, setWordsRemaining] = useState(16);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);

  const syncState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setGameState({ ...engine.state });
    setWordsRemaining(getWordsRemaining(engine));
    setActivePowerUps(getActivePowerUps(engine));
  }, []);

  const handleAction = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.state.isGameOver) {
      resetGame(engine);
      syncState();
    } else if (engine.state.isLevelComplete) {
      nextLevel(engine);
      syncState();
    } else if (!engine.state.isStarted) {
      launchBall(engine);
      syncState();
    }
  }, [syncState]);

  const handlePointerMove = useCallback((clientX: number) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const x = (clientX - rect.left) * scaleX;
    setPaddleTarget(engine, x);
  }, []);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;
    syncState();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game loop (sync React state every 4th frame to reduce re-renders)
    let frameCount = 0;
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 32);
      lastTimeRef.current = time;

      update(engine, dt);
      render(ctx, engine);

      if (++frameCount % 4 === 0) syncState();

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    // Mouse
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const onClick = () => handleAction();
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    // Touch
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX);
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX);
      handleAction();
    };
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    // Keyboard
    const keysDown = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.key);

      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        handleAction();
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleSound(engine);
        syncState();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key);
    };

    // Keyboard paddle movement
    const keyboardInterval = setInterval(() => {
      if (!engine) return;
      const speed = 12;
      if (keysDown.has('ArrowLeft') || keysDown.has('a') || keysDown.has('A')) {
        engine.paddleTargetX -= speed;
        setPaddleTarget(engine, engine.paddleTargetX);
      }
      if (keysDown.has('ArrowRight') || keysDown.has('d') || keysDown.has('D')) {
        engine.paddleTargetX += speed;
        setPaddleTarget(engine, engine.paddleTargetX);
      }
    }, 16);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(keyboardInterval);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAction, handlePointerMove, syncState]);

  const onToggleSound = useCallback(() => {
    if (engineRef.current) {
      toggleSound(engineRef.current);
      syncState();
    }
  }, [syncState]);

  return {
    canvasRef,
    gameState,
    wordsRemaining,
    activePowerUps,
    onToggleSound,
  };
}
