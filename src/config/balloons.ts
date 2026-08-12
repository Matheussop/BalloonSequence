export const BALLOON_SIZE = 72;
export const TOKEN_SIZE = 48;
export const TOKEN_CENTER_OFFSET = (BALLOON_SIZE - TOKEN_SIZE) / 2;

export const FINAL_ROW = {
  top: 28,
  left: 4,
  gap: 52,
} as const;

export const STAGE = {
  width: 340,
  height: 440,
} as const;

export type BalloonVariant = 'blue' | 'yellow';

export type BalloonData = {
  id: number;
  x: number;
  y: number;
  variant: BalloonVariant;
};

export const BALLOONS: BalloonData[] = [
  {id: 1, x: 30, y: 154, variant: 'blue'},
  {id: 2, x: 104, y: 116, variant: 'yellow'},
  {id: 3, x: 186, y: 144, variant: 'blue'},
  {id: 4, x: 71, y: 222, variant: 'blue'},
  {id: 5, x: 151, y: 210, variant: 'yellow'},
  {id: 6, x: 216, y: 228, variant: 'blue'},
];

export const BALLOON_COUNT = BALLOONS.length;
export const DEFAULT_NUMBERS = [1, 2, 3, 4, 5, 6];
