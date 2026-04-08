import type { Rect } from '@/shared/types';

export interface TargetWord {
  id: number;
  text: string;
  rect: Rect;
  color: string;
  isAlive: boolean;
  fontSize: number;
  opacity: number;
}
