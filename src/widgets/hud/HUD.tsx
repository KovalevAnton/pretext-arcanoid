import type { GameState } from '@/shared/types';
import styles from './HUD.module.css';

interface HUDProps {
  gameState: GameState;
  wordsRemaining: number;
  activePowerUps: string[];
  onToggleSound: () => void;
}

export function HUD({ gameState, wordsRemaining, activePowerUps, onToggleSound }: HUDProps) {
  const hearts = '♥'.repeat(gameState.lives) + '♡'.repeat(Math.max(0, 3 - gameState.lives));

  return (
    <div className={styles.hud}>
      <div className={styles.hudTop}>
        <h1 className={styles.title}>PRETEXT BREAKER</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            SCORE <span className={styles.statValue}>{String(gameState.score).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            LIVES <span className={styles.hearts}>{hearts}</span>
          </span>
          <span className={styles.stat}>
            LEVEL <span className={styles.statValue}>{String(gameState.level).padStart(2, '0')}</span>
          </span>
        </div>
        <button className={styles.soundBtn} onClick={onToggleSound}>
          SND {gameState.soundEnabled ? 'ON' : 'OFF'}
        </button>
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
