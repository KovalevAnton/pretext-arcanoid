import { useGame } from '@/features/game-engine';
import { HUD } from '@/widgets/hud/HUD';
import { GameBoard } from '@/widgets/game-board/GameBoard';
import { Footer } from '@/widgets/footer/Footer';
import styles from './GamePage.module.css';

export function GamePage() {
  const { canvasRef } = useGame();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <HUD />
        <GameBoard canvasRef={canvasRef} />
        <Footer />
      </div>
    </div>
  );
}
