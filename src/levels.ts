import { Difficulty, ObstacleType } from "./types";

export interface ObstacleDef {
  offsetX: number;
  width: number;
  height: number;
  type: ObstacleType;
  speed?: number;
}

export interface PlatformDef {
  width: number;
  gap: number;
  obstacles?: ObstacleDef[];
  y?: number;
}

type LevelChunk = PlatformDef[];

const easyChunks: LevelChunk[] = [
  [
    { gap: 200, width: 300 },
    { gap: 150, width: 250, y: 300 },
    {
      gap: 150,
      width: 350,
      obstacles: [
        { offsetX: 150, width: 40, height: 40, type: ObstacleType.Static },
      ],
    },
    {
      gap: 200,
      width: 400,
      obstacles: [
        {
          offsetX: 20,
          width: 60,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 1.5,
        },
      ],
    },
  ],
  [
    {
      gap: 250,
      width: 450,
      obstacles: [
        {
          offsetX: 200,
          width: 50,
          height: 60,
          type: ObstacleType.MovingVertical,
          speed: 1.5,
        },
      ],
    },
    { gap: 280, width: 500 },
  ],
  [
    { gap: 180, width: 250, y: 350 },
    { gap: 180, width: 250, y: 250 },
    {
      gap: 200,
      width: 300,
      obstacles: [
        { offsetX: 100, width: 30, height: 30, type: ObstacleType.Static },
      ],
    },
    {
      gap: 180,
      width: 350,
      obstacles: [
        {
          offsetX: 20,
          width: 80,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 2,
        },
      ],
    },
  ],
];

const mediumChunks: LevelChunk[] = [
  [
    {
      gap: 150,
      width: 200,
      obstacles: [
        { offsetX: 80, width: 40, height: 40, type: ObstacleType.Static },
      ],
    },
    {
      gap: 160,
      width: 280,
      obstacles: [
        {
          offsetX: 10,
          width: 50,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 2.5,
        },
      ],
    },
    {
      gap: 150,
      width: 220,
      y: 300,
      obstacles: [
        {
          offsetX: 110,
          width: 50,
          height: 80,
          type: ObstacleType.MovingVertical,
          speed: 2,
        },
      ],
    },
    { gap: 160, width: 200 },
  ],
  [
    { gap: 200, width: 350 },
    {
      gap: 150,
      width: 150,
      obstacles: [
        { offsetX: 50, width: 50, height: 50, type: ObstacleType.Static },
      ],
    },
    { gap: 150, width: 150, y: 400 },
    {
      gap: 220,
      width: 400,
      obstacles: [
        {
          offsetX: 180,
          width: 60,
          height: 90,
          type: ObstacleType.MovingVertical,
          speed: 2.5,
        },
      ],
    },
  ],
  [
    { gap: 120, width: 150, y: 200 },
    { gap: 120, width: 150, y: 400 },
    {
      gap: 120,
      width: 400,
      obstacles: [
        { offsetX: 150, width: 40, height: 40, type: ObstacleType.Static },
        {
          offsetX: 20,
          width: 70,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 3,
        },
      ],
    },
  ],
];

const hardChunks: LevelChunk[] = [
  [
    {
      gap: 120,
      width: 100,
      obstacles: [
        {
          offsetX: 30,
          width: 40,
          height: 60,
          type: ObstacleType.MovingVertical,
          speed: 3,
        },
      ],
    },
    {
      gap: 130,
      width: 220,
      y: 300,
      obstacles: [
        {
          offsetX: 10,
          width: 40,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 4,
        },
      ],
    },
    {
      gap: 120,
      width: 100,
      obstacles: [
        { offsetX: 30, width: 40, height: 40, type: ObstacleType.Static },
      ],
    },
    { gap: 130, width: 120 },
    { gap: 120, width: 100 },
  ],
  [
    { gap: 100, width: 150, y: 450 },
    { gap: 100, width: 150, y: 150 },
    {
      gap: 100,
      width: 250,
      obstacles: [
        {
          offsetX: 50,
          width: 50,
          height: 100,
          type: ObstacleType.MovingVertical,
          speed: 3.5,
        },
        {
          offsetX: 150,
          width: 50,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 3,
        },
      ],
    },
  ],
  [
    { gap: 150, width: 250 },
    {
      gap: 100,
      width: 100,
      obstacles: [
        { offsetX: 20, width: 60, height: 60, type: ObstacleType.Static },
      ],
    },
    {
      gap: 100,
      width: 220,
      y: 300,
      obstacles: [
        {
          offsetX: 10,
          width: 60,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 4.5,
        },
      ],
    },
    {
      gap: 180,
      width: 120,
      obstacles: [
        { offsetX: 40, width: 40, height: 40, type: ObstacleType.Static },
      ],
    },
  ],
  [
    {
      gap: 80,
      width: 80,
      obstacles: [
        {
          offsetX: 20,
          width: 40,
          height: 40,
          type: ObstacleType.MovingVertical,
          speed: 4,
        },
      ],
    },
    { gap: 80, width: 80, y: 200 },
    {
      gap: 80,
      width: 180,
      obstacles: [
        {
          offsetX: 10,
          width: 50,
          height: 20,
          type: ObstacleType.MovingHorizontal,
          speed: 5,
        },
      ],
    },
    { gap: 80, width: 80, y: 400 },
    { gap: 80, width: 80 },
  ],
];

export const levelChunks = {
  [Difficulty.Easy]: easyChunks,
  [Difficulty.Medium]: mediumChunks,
  [Difficulty.Hard]: hardChunks,
};
