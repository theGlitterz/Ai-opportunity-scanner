import { INDUSTRY_BASE_SCORES, REVENUE_BAND_MODIFIERS, EMPLOYEE_BAND_MODIFIERS, GEOGRAPHY_MODIFIERS, BENCHMARK_CLAMP } from '../../data/benchmarks';
import type { CompanyProfile, BenchmarkResult, BenchmarkGapLabel } from '../../types';

export function getGapLabel(gap: number): BenchmarkGapLabel {
  if (gap >= 10)  return 'Above benchmark';
  if (gap >= 5)   return 'Slightly above benchmark';
  if (gap >= -4)  return 'In line with benchmark';
  if (gap >= -9)  return 'Slightly below benchmark';
  return 'Below benchmark';
}

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(max, Math.max(min, value));
}

export function computeBenchmarkResult(profile: CompanyProfile, overallEfficiencyScore: number): BenchmarkResult {
  const applied: string[] = [];
  let score = INDUSTRY_BASE_SCORES[profile.industryCluster as keyof typeof INDUSTRY_BASE_SCORES] ?? 50;
  applied.push('sector');

  if (profile.revenueBand) {
    score += REVENUE_BAND_MODIFIERS[profile.revenueBand as keyof typeof REVENUE_BAND_MODIFIERS] ?? 0;
    applied.push('revenue band');
  }
  if (profile.employeeBand) {
    score += EMPLOYEE_BAND_MODIFIERS[profile.employeeBand as keyof typeof EMPLOYEE_BAND_MODIFIERS] ?? 0;
    applied.push('employee band');
  }
  if (profile.geography) {
    score += GEOGRAPHY_MODIFIERS[profile.geography as keyof typeof GEOGRAPHY_MODIFIERS] ?? 0;
    applied.push('geography');
  }

  const overallBenchmarkScore = clamp(score, BENCHMARK_CLAMP);
  const gap = overallEfficiencyScore - overallBenchmarkScore;
  const gapLabel = getGapLabel(gap);
  const derivationNote = `Based on ${applied.join(', ')}.`;

  return { overallBenchmarkScore, gap, gapLabel, derivationNote };
}
