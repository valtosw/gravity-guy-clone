export type GameState = 'StartScreen' | 'Playing' | 'GameOver' | 'LevelComplete';
export const GameState = {
  StartScreen: 'StartScreen' as const,
  Playing: 'Playing' as const,
  GameOver: 'GameOver' as const,
  LevelComplete: 'LevelComplete' as const,
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export const Difficulty = {
  Easy: 'Easy' as const,
  Medium: 'Medium' as const,
  Hard: 'Hard' as const,
};

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  gravity: number;
  visualRotation: number;
  targetRotation: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Coin {
  x: number;
  y: number;
  radius: number;
}

export type ObstacleType = 'Static' | 'MovingVertical' | 'MovingHorizontal';
export const ObstacleType = {
  Static: 'Static' as const,
  MovingVertical: 'MovingVertical' as const,
  MovingHorizontal: 'MovingHorizontal' as const,
};

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  speed?: number;
  direction?: number;
  minY?: number;
  maxY?: number;
  minX?: number;
  maxX?: number;
}