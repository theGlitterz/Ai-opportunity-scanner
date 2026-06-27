import type { AreaScore } from '../../types';

const SAVINGS_AREA_WEIGHTS: Partial<Record<string, number>> = {
  Finance: 0.35, Operations: 0.35, 'Systems & IT': 0.30,
};

export function computeSavingsOpportunityScore(areaScores: AreaScore[]): number {
  let score = 0; let total = 0;
  for (const { area, rawScore } of areaScores) {
    const w = SAVINGS_AREA_WEIGHTS[area];
    if (w !== undefined) { score += rawScore * w; total += w; }
  }
  return total > 0 ? Math.round(score / total) : 0;
}

const GROWTH_AREA_WEIGHTS: Partial<Record<string, number>> = {
  Customer: 0.45, People: 0.35, Finance: 0.20,
};

export function computeGrowthCapacityScore(areaScores: AreaScore[]): number {
  let score = 0; let total = 0;
  for (const { area, rawScore } of areaScores) {
    const w = GROWTH_AREA_WEIGHTS[area];
    if (w !== undefined) { score += rawScore * w; total += w; }
  }
  return total > 0 ? Math.round(score / total) : 0;
}
