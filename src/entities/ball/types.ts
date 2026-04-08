import type { Vector2 } from '@/shared/types';

export interface Ball {
  id: number;
  pos: Vector2;
  vel: Vector2;
  radius: number;
  trail: Vector2[];
  isActive: boolean;
}
