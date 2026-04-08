import { useGameStore } from '@/features/game-engine';
import styles from './HUD.module.css';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const activePowerUps = useGameStore((s) => s.activePowerUps);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const setGameSpeed = useGameStore((s) => s.setGameSpeed);
  const combo = useGameStore((s) => s.combo);
  const highScore = useGameStore((s) => s.highScore);
  const cvUnlocked = useGameStore((s) => s.cvUnlocked);

  const speeds = [0.5, 1, 1.5, 2];
  const hearts = '\u2665'.repeat(lives) + '\u2661'.repeat(Math.max(0, 3 - lives));

  return (
    <div className={styles.hud}>
      <div className={styles.hudTop}>
        <div className={styles.stats}>
          <span className={styles.stat}>
            SCORE <span className={styles.statValue}>{String(score).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            HI <span className={styles.statValue}>{String(highScore).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            LIVES <span className={styles.hearts}>{hearts}</span>
          </span>
          <span className={styles.stat}>
            LEVEL <span className={styles.statValue}>{String(level).padStart(2, '0')}</span>
          </span>
          {combo > 1 && (
            <span className={styles.combo}>x{combo}</span>
          )}
          {activePowerUps.length > 0 && (
            <span className={styles.powerUps}>{activePowerUps.join(' | ')}</span>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.cvGroup}>
            {cvUnlocked ? (
              <a href="/resume.pdf" download className={styles.cvBtn}>
                DOWNLOAD CV
              </a>
            ) : (
              <span className={styles.cvBtnLocked}>
                CV LOCKED &mdash; complete level 1
              </span>
            )}
            <a
              href="/resume.pdf"
              download
              className={styles.cvRush}
            >
              i'm in a hurry
            </a>
          </div>
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
    </div>
  );
}
