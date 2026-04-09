import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/features/game-engine';
import { useI18n } from '@/shared/i18n';
import { fetchTopScores, submitScore, type ScoreEntry } from '@/shared/lib/supabase';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  externalOpen: boolean;
  onClose: () => void;
}

export function Leaderboard({ externalOpen, onClose }: LeaderboardProps) {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const { t } = useI18n();

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [name, setName] = useState(() => localStorage.getItem('stackbreaker-name') || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  const isOpen = autoOpen || externalOpen;

  const loadScores = useCallback(async () => {
    try {
      const data = await fetchTopScores(10);
      setScores(data);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    if (isGameOver) {
      setSubmitted(false);
      setAutoOpen(true);
      loadScores();
    }
  }, [isGameOver, loadScores]);

  useEffect(() => {
    if (externalOpen) loadScores();
  }, [externalOpen, loadScores]);

  const handleClose = () => {
    setAutoOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || score === 0 || submitted) return;
    setLoading(true);
    try {
      localStorage.setItem('stackbreaker-name', trimmed);
      await submitScore(trimmed, score, level);
      setSubmitted(true);
      await loadScores();
    } catch {
      // silent fail
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const showSubmit = isGameOver && !submitted && score > 0;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{t.leaderboard}</span>
          <button className={styles.closeBtn} onClick={handleClose}>
            &times;
          </button>
        </div>

        {showSubmit && (
          <div className={styles.submitRow}>
            <span className={styles.yourScore}>{t.yourScore}: {score}</span>
            <div className={styles.inputRow}>
              <input
                className={styles.nameInput}
                type="text"
                maxLength={20}
                placeholder={t.enterName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading || !name.trim()}
              >
                {t.submit}
              </button>
            </div>
          </div>
        )}

        {isGameOver && submitted && (
          <div className={styles.submitted}>{t.yourScore}: {score}</div>
        )}

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colRank}>{t.rank}</span>
            <span className={styles.colName}>{t.player}</span>
            <span className={styles.colScore}>{t.score}</span>
            <span className={styles.colLevel}>{t.level}</span>
          </div>
          {scores.length === 0 && (
            <div className={styles.empty}>{t.noScores}</div>
          )}
          {scores.map((entry, i) => (
            <div
              key={entry.id}
              className={`${styles.row} ${submitted && entry.name === name.trim() && entry.score === score ? styles.rowHighlight : ''}`}
            >
              <span className={styles.colRank}>{i + 1}</span>
              <span className={styles.colName}>{entry.name}</span>
              <span className={styles.colScore}>{entry.score}</span>
              <span className={styles.colLevel}>{entry.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
