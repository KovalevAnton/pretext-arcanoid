import { useGameStore } from '@/features/game-engine';
import styles from './HUD.module.css';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const wordsRemaining = useGameStore((s) => s.wordsRemaining);
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);

  const speeds = [0.5, 1, 1.5, 2];

  const hearts = '\u2665'.repeat(lives) + '\u2661'.repeat(Math.max(0, 3 - lives));

  return (
    <div className={styles.hud}>
      <div className={styles.hudTop}>
        <h1 className={styles.title}>PRETEXT BREAKER</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            SCORE <span className={styles.statValue}>{String(score).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            LIVES <span className={styles.hearts}>{hearts}</span>
          </span>
          <span className={styles.stat}>
            LEVEL <span className={styles.statValue}>{String(level).padStart(2, '0')}</span>
          </span>
        </div>
        <div className={styles.controls}>
          <div className={styles.speedGroup}>
            {speeds.map((s) => (
              <button
                key={s}
                className={`${styles.speedBtn} ${gameSpeed === s ? styles.speedBtnActive : ''}`}
                onClick={() => setGameSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            className={styles.soundBtn}
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sound'))}
          >
            SND {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      <div className={styles.hudBottom}>
        <span className={styles.info}>
          {wordsRemaining} words remain. Angle the glyph off the paddle and keep it above the footer.
        </span>
        {activePowerUps.length > 0 && (
          <span className={styles.powerUps}>
            POWER WORDS: {activePowerUps.join('  |  ')}
          </span>
        )}
      </div>
    </div>
  );
}
