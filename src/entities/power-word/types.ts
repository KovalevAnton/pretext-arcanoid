import type { PowerWordType } from '@/shared/config/constants';
import type { Vector2 } from '@/shared/types';

export interface PowerWord {
  id: number;
  text: string;
  type: PowerWordType;
  pos: Vector2;
  vel: Vector2;
  color: string;
  isActive: boolean;
  width: number;
  height: number;
}
