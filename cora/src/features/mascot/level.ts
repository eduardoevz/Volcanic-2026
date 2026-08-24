export type MascotLevel = 1 | 2 | 3 | 4 | 5;

export const MASCOT_LEVELS: MascotLevel[] = [1, 2, 3, 4, 5];

// Mismos umbrales que level_for_points() en 0010_mascot_leveling.sql — ver
// docs/PLAN_DE_IMPLEMENTACION.md §16.
export const LEVEL_THRESHOLDS: Record<MascotLevel, number> = {
  1: 0,
  2: 20,
  3: 60,
  4: 140,
  5: 280,
};

export const LEVEL_META: Record<MascotLevel, { name: string; emoji: string }> = {
  1: { name: 'Semilla', emoji: '🌰' },
  2: { name: 'Brote', emoji: '🌱' },
  3: { name: 'Cactus joven', emoji: '🌵' },
  4: { name: 'Cactus florecido', emoji: '🌸' },
  5: { name: 'Pitahaya', emoji: '🐉' },
};

/** Espejo puro (sin red) de level_for_points() — mismos umbrales exactos. */
export function levelForPoints(points: number): MascotLevel {
  if (points >= LEVEL_THRESHOLDS[5]) return 5;
  if (points >= LEVEL_THRESHOLDS[4]) return 4;
  if (points >= LEVEL_THRESHOLDS[3]) return 3;
  if (points >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

export type LevelProgress = {
  nextLevel: MascotLevel;
  remaining: number;
  progress: number; // 0..1 dentro del nivel actual
};

/** null cuando ya está en el nivel máximo — no hay "siguiente" que mostrar. */
export function pointsToNextLevel(points: number): LevelProgress | null {
  const level = levelForPoints(points);
  if (level >= 5) return null;

  const nextLevel = (level + 1) as MascotLevel;
  const currentFloor = LEVEL_THRESHOLDS[level];
  const nextFloor = LEVEL_THRESHOLDS[nextLevel];
  const span = nextFloor - currentFloor;

  return {
    nextLevel,
    remaining: nextFloor - points,
    progress: Math.min(1, Math.max(0, (points - currentFloor) / span)),
  };
}
