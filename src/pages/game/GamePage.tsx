import { useState, useCallback } from "react";
import { useGame } from "@/features/game-engine";
import { useI18n } from "@/shared/i18n";
import { HUD } from "@/widgets/hud/HUD";
import { GameBoard } from "@/widgets/game-board/GameBoard";
import { Footer } from "@/widgets/footer/Footer";
import { Leaderboard } from "@/widgets/leaderboard/Leaderboard";
import styles from "./GamePage.module.css";

export function GamePage() {
  const { canvasRef } = useGame();
  const { t } = useI18n();
  const [lbOpen, setLbOpen] = useState(false);

  const openLb = useCallback(() => setLbOpen(true), []);
  const closeLb = useCallback(() => setLbOpen(false), []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <HUD onOpenLeaderboard={openLb} />
        <GameBoard canvasRef={canvasRef} />
        <Footer />
      </div>

      <Leaderboard externalOpen={lbOpen} onClose={closeLb} />

      <div className={styles.rotateOverlay}>
        <div className={styles.rotateCard}>
          <span className={styles.rotateName}>ANTON KOVALEV</span>
          <span className={styles.rotateRole}>{t.role}</span>
          <span className={styles.rotateStack}>
            React &middot; Next.js &middot; TypeScript &middot; {t.experience}
          </span>
          <div className={styles.rotateActions}>
            <a
              href="https://www.linkedin.com/in/kovalevantondev/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rotateLinkedIn}
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className={styles.rotateHint}>
          {t.rotateHint}
          <span className={styles.phoneIcon}>
            <span className={styles.phone}>
              <span className={styles.phoneScreen} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
