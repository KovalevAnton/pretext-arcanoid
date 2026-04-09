import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/features/game-engine';
import { useI18n, type Locale } from '@/shared/i18n';
import styles from './HUD.module.css';

const localeOrder: Locale[] = ['en', 'es', 'ru'];
const speeds = [0.5, 1, 1.5, 2];

interface HUDProps {
  onOpenLeaderboard: () => void;
}

function DropMenu({ label, items, activeKey, onSelect }: {
  label: string;
  items: { key: string; label: string }[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  return (
    <div className={styles.dropWrap} ref={ref}>
      <button
        className={`${styles.tBtn} ${open ? styles.tBtnActive : ''}`}
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      {open && (
        <div className={styles.dropMenu}>
          {items.map((item) => (
            <button
              key={item.key}
              className={`${styles.dropItem} ${item.key === activeKey ? styles.dropItemActive : ''}`}
              onClick={() => { onSelect(item.key); close(); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HUD({ onOpenLeaderboard }: HUDProps) {
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
  const { locale, setLocale, t } = useI18n();

  const hearts = '\u2665'.repeat(lives) + '\u2661'.repeat(Math.max(0, 3 - lives));

  return (
    <div className={styles.hud}>
      <div className={styles.hudTop}>
        <div className={styles.stats}>
          <span className={styles.stat}>
            {t.score} <span className={styles.statValue}>{String(score).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            {t.hi} <span className={styles.statValue}>{String(highScore).padStart(5, '0')}</span>
          </span>
          <span className={styles.stat}>
            {t.lives} <span className={styles.hearts}>{hearts}</span>
          </span>
          <span className={styles.stat}>
            {t.level} <span className={styles.statValue}>{String(level).padStart(2, '0')}</span>
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
              <a href="/ANTON_KOVALEV_FRONTEND.pdf" download="ANTON_KOVALEV_FRONTEND.pdf" className={styles.cvBtn}>
                {t.downloadCv}
              </a>
            ) : (
              <span className={styles.cvBtnLocked}>
                {t.cvLocked}
              </span>
            )}
            <a
              href="/ANTON_KOVALEV_FRONTEND.pdf"
              download="ANTON_KOVALEV_FRONTEND.pdf"
              className={styles.cvRush}
            >
              {t.imInAHurry}
            </a>
          </div>
          <div className={styles.toolbar}>
            <DropMenu
              label={`${gameSpeed}x`}
              items={speeds.map((s) => ({ key: String(s), label: `${s}x` }))}
              activeKey={String(gameSpeed)}
              onSelect={(k) => setGameSpeed(Number(k))}
            />
            <span className={styles.sep} />
            <DropMenu
              label={locale.toUpperCase()}
              items={localeOrder.map((l) => ({ key: l, label: l.toUpperCase() }))}
              activeKey={locale}
              onSelect={(k) => setLocale(k as Locale)}
            />
            <span className={styles.sep} />
            <button
              className={`${styles.tBtn} ${soundEnabled ? styles.tBtnActive : ''}`}
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-sound'))}
            >
              {soundEnabled ? '\u266b' : '\u266b\u0338'}
            </button>
            <span className={styles.sep} />
            <button className={styles.topBtn} onClick={onOpenLeaderboard}>
              TOP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
