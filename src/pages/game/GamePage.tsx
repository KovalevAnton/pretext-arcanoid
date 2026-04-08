import { useGame } from '@/features/game-engine';
import { HUD } from '@/widgets/hud/HUD';
import { GameBoard } from '@/widgets/game-board/GameBoard';
import { Footer } from '@/widgets/footer/Footer';
import styles from './GamePage.module.css';

export function GamePage() {
  const { canvasRef, gameState, wordsRemaining, activePowerUps, onToggleSound } = useGame();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <HUD
          gameState={gameState}
          wordsRemaining={wordsRemaining}
          activePowerUps={activePowerUps}
          onToggleSound={onToggleSound}
        />
        <GameBoard canvasRef={canvasRef} />
        <Footer />
      </div>
    </div>
  );
}
