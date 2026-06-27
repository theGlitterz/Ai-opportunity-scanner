import { OPPORTUNITY_LIBRARY } from '../../data/opportunity-library';
import type { AreaScore, BusinessArea, BusinessPriority, OpportunityLibraryItem, RankedOpportunity } from '../../types';

const IMPACT_WEIGHT = 0.70;
const FIT_EASE_WEIGHT = 0.20;
const PRIORITY_WEIGHT = 0.10;

function buildAreaScoreMap(areaScores: AreaScore[]): Record<BusinessArea, number> {
  return Object.fromEntries(areaScores.map(({ area, rawScore }) => [area, rawScore])) as Record<BusinessArea, number>;
}

function computeImpactScore(opp: OpportunityLibraryItem, map: Record<BusinessArea, number>): number {
  const pMean = opp.primaryAreas.length > 0
    ? opp.primaryAreas.reduce((s, a) => s + (map[a] ?? 0), 0) / opp.primaryAreas.length : 0;
  const sMean = opp.secondaryAreas.length > 0
    ? opp.secondaryAreas.reduce((s, a) => s + (map[a] ?? 0), 0) / opp.secondaryAreas.length : 0;
  return pMean * 0.7 + sMean * 0.3;
}

function normaliseFitEase(v: 1 | 2 | 3): number { return ((v - 1) / 2) * 100; }

function computePriorityAffinity(opp: OpportunityLibraryItem, priority: BusinessPriority): number {
  return opp.priorityAffinities.includes(priority) ? 100 : 0;
}

function computeScore(opp: OpportunityLibraryItem, map: Record<BusinessArea, number>, priority: BusinessPriority): number {
  return computeImpactScore(opp, map) * IMPACT_WEIGHT
    + normaliseFitEase(opp.aiFitEase) * FIT_EASE_WEIGHT
    + computePriorityAffinity(opp, priority) * PRIORITY_WEIGHT;
}

function rankWithCap(opps: OpportunityLibraryItem[], map: Record<BusinessArea, number>, priority: BusinessPriority): OpportunityLibraryItem[] {
  const impactOnlyOrder = [...opps]
    .sort((a, b) =>
      (computeImpactScore(b, map) * (IMPACT_WEIGHT + PRIORITY_WEIGHT) + normaliseFitEase(b.aiFitEase) * FIT_EASE_WEIGHT) -
      (computeImpactScore(a, map) * (IMPACT_WEIGHT + PRIORITY_WEIGHT) + normaliseFitEase(a.aiFitEase) * FIT_EASE_WEIGHT)
    )
    .map((o) => o.id);

  const result = [...opps].sort((a, b) => computeScore(b, map, priority) - computeScore(a, map, priority));

  let changed = true; let passes = 0;
  while (changed && passes < 10) {
    changed = false; passes++;
    for (let i = 0; i < result.length; i++) {
      const shift = i - impactOnlyOrder.indexOf(result[i].id);
      if (shift > 1 && i > 0) { [result[i - 1], result[i]] = [result[i], result[i - 1]]; changed = true; }
      else if (shift < -1 && i < result.length - 1) { [result[i], result[i + 1]] = [result[i + 1], result[i]]; changed = true; }
    }
  }
  return result;
}

function generateRationale(opp: OpportunityLibraryItem, map: Record<BusinessArea, number>): string {
  const topArea = opp.primaryAreas.reduce((best, area) => (map[area] ?? 0) > (map[best] ?? 0) ? area : best);
  const rawScore = map[topArea] ?? 0;
  const scopeWord = rawScore >= 70 ? 'Strong improvement potential' : rawScore >= 45 ? 'Clear efficiency headroom' : 'Improvement potential';
  const easeWord = opp.aiFitEase === 3 ? 'strong AI deployment fit' : opp.aiFitEase === 2 ? 'good AI deployment fit' : 'clear AI use-case potential';
  return `${scopeWord} in ${topArea}, with ${easeWord}.`;
}

export function rankOpportunities(areaScores: AreaScore[], businessPriority: BusinessPriority, topN = 3): RankedOpportunity[] {
  const map = buildAreaScoreMap(areaScores);
  const ranked = rankWithCap(OPPORTUNITY_LIBRARY, map, businessPriority);
  return ranked.slice(0, topN).map((opp, i) => ({ ...opp, rank: i + 1, rationale: generateRationale(opp, map) }));
}
