import { GAME_WIDTH, GAME_HEIGHT } from '@/shared/config/constants';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function GameBoard({ canvasRef }: GameBoardProps) {
  return (
    <div className={styles.boardWrapper}>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className={styles.canvas}
      />
    </div>
  );
}
