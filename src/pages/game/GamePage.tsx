import { useGame } from "@/features/game-engine";
import { HUD } from "@/widgets/hud/HUD";
import { GameBoard } from "@/widgets/game-board/GameBoard";
import { Footer } from "@/widgets/footer/Footer";
import styles from "./GamePage.module.css";

export function GamePage() {
  const { canvasRef } = useGame();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <HUD />
        <GameBoard canvasRef={canvasRef} />
        <Footer />
      </div>

      <div className={styles.rotateOverlay}>
        <div className={styles.rotateCard}>
          <span className={styles.rotateName}>ANTON KOVALEV</span>
          <span className={styles.rotateRole}>Senior Frontend Developer</span>
          <span className={styles.rotateStack}>
            React &middot; Next.js &middot; TypeScript &middot; 9+ years
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
          Rotate your device to play
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
