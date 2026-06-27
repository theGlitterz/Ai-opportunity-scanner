import type { AreaScore } from '../../types';

export function computeOverallEfficiencyScore(areaScores: AreaScore[]): number {
  const weighted = areaScores.reduce((sum, { rawScore, weight }) => sum + rawScore * weight, 0);
  return Math.round(weighted);
}
