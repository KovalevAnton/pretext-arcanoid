import { useRef, useEffect, useCallback } from 'react';
import {
  createEngine,
  launchBall,
  setPaddleTarget,
  update,
  nextLevel,
  resetGame,
  toggleSound,
  type GameEngine,
} from './engine';
import { render } from './renderer';
import { useGameStore } from './store';
import { GAME_WIDTH } from '@/shared/config/constants';

export function useGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const sync = useGameStore((s) => s.sync);

  const handleAction = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.state.isGameOver) resetGame(engine);
    else if (engine.state.isLevelComplete) nextLevel(engine);
    else if (!engine.state.isStarted) launchBall(engine);
    sync(engine);
  }, [sync]);

  const handlePointerMove = useCallback((clientX: number) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    setPaddleTarget(engine, (clientX - rect.left) * (GAME_WIDTH / rect.width));
  }, []);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;
    sync(engine);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game loop — sync store every 4th frame
    let frame = 0;
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const rawDt = Math.min(time - lastTimeRef.current, 32);
      lastTimeRef.current = time;

      const dt = rawDt * useGameStore.getState().gameSpeed;
      update(engine, dt);
      render(ctx, engine);
      if (++frame % 4 === 0) {
        sync(engine);
        if (engine.state.isGameOver) {
          const { highScore, setHighScore } = useGameStore.getState();
          if (engine.state.score > highScore) setHighScore(engine.state.score);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    // Mouse
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', handleAction);

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
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') handleAction();
      if (e.key === 'm' || e.key === 'M') { toggleSound(engine); sync(engine); }
    };
    const onKeyUp = (e: KeyboardEvent) => keysDown.delete(e.key);

    const keyboardInterval = setInterval(() => {
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

    // Sound toggle from HUD button
    const onToggleSound = () => { toggleSound(engine); sync(engine); };
    window.addEventListener('toggle-sound', onToggleSound);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(keyboardInterval);
      window.removeEventListener('toggle-sound', onToggleSound);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', handleAction);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAction, handlePointerMove, sync]);

  return { canvasRef };
}
