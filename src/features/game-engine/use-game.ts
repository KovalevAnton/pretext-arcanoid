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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let animFrame = 0;
    let keyboardIv = 0;
    const keysDown = new Set<string>();

    // Wait for fonts before creating engine — measureWidth needs correct metrics
    document.fonts.ready.then(() => {
      if (cancelled) return;

      const engine = createEngine();
      engineRef.current = engine;
      sync(engine);

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

        animFrame = requestAnimationFrame(loop);
      };
      animFrame = requestAnimationFrame(loop);
      animFrameRef.current = animFrame;

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
      const onKeyDown = (e: KeyboardEvent) => {
        keysDown.add(e.key);
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') handleAction();
        if (e.key === 'm' || e.key === 'M') { toggleSound(engine); sync(engine); }
      };
      const onKeyUp = (e: KeyboardEvent) => keysDown.delete(e.key);

      keyboardIv = window.setInterval(() => {
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

      const onToggleSound = () => { toggleSound(engine); sync(engine); };
      window.addEventListener('toggle-sound', onToggleSound);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      // Store cleanup references for unmount
      cleanupRef.onToggleSound = onToggleSound;
      cleanupRef.onMouseMove = onMouseMove;
      cleanupRef.onTouchMove = onTouchMove;
      cleanupRef.onTouchStart = onTouchStart;
      cleanupRef.onKeyDown = onKeyDown;
      cleanupRef.onKeyUp = onKeyUp;
    });

    const cleanupRef: Record<string, EventListener> = {};

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrame);
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(keyboardIv);
      if (cleanupRef.onToggleSound) window.removeEventListener('toggle-sound', cleanupRef.onToggleSound);
      if (cleanupRef.onMouseMove) canvas.removeEventListener('mousemove', cleanupRef.onMouseMove);
      canvas.removeEventListener('click', handleAction);
      if (cleanupRef.onTouchMove) canvas.removeEventListener('touchmove', cleanupRef.onTouchMove);
      if (cleanupRef.onTouchStart) canvas.removeEventListener('touchstart', cleanupRef.onTouchStart);
      if (cleanupRef.onKeyDown) window.removeEventListener('keydown', cleanupRef.onKeyDown);
      if (cleanupRef.onKeyUp) window.removeEventListener('keyup', cleanupRef.onKeyUp);
    };
  }, [handleAction, handlePointerMove, sync]);

  return { canvasRef };
}
