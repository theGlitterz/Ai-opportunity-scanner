import { QUESTIONS } from '../../data/questions';
import type { Answers, AreaScore, BusinessArea, IndustryCluster } from '../../types';
import { BUSINESS_AREAS } from '../../types';

type AreaWeightDeltas = Partial<Record<BusinessArea, number>>;

const INDUSTRY_WEIGHT_MODIFIERS: Record<IndustryCluster, AreaWeightDeltas> = {
  'financial-pe-investment':  { Finance: +0.05, 'Systems & IT': +0.02, People: -0.03, Operations: -0.02, Customer: -0.02 },
  'professional-services':    { People: +0.05, Customer: +0.03, Finance: -0.02, Operations: -0.03, 'Systems & IT': -0.03 },
  'saas-digital':             { 'Systems & IT': +0.05, Customer: +0.03, People: -0.02, Finance: -0.03, Operations: -0.03 },
  'retail-ecommerce':         { Customer: +0.05, Operations: +0.03, Finance: -0.02, People: -0.03, 'Systems & IT': -0.03 },
  'distribution-logistics':   { Operations: +0.05, 'Systems & IT': +0.02, Customer: -0.02, Finance: -0.02, People: -0.03 },
  'manufacturing-field-ops':  { Operations: +0.05, People: +0.02, Customer: -0.03, Finance: -0.02, 'Systems & IT': -0.02 },
  'healthcare-regulated':     { People: +0.03, Finance: +0.03, 'Systems & IT': +0.02, Customer: -0.04, Operations: -0.04 },
  'other-mixed':              {},
};

export function computeAreaWeights(industryCluster: IndustryCluster): Record<BusinessArea, number> {
  const BASE = 0.2;
  const deltas = INDUSTRY_WEIGHT_MODIFIERS[industryCluster];
  const adjusted = Object.fromEntries(
    BUSINESS_AREAS.map((area) => [area, BASE + (deltas[area] ?? 0)])
  ) as Record<BusinessArea, number>;
  const total = Object.values(adjusted).reduce((s, w) => s + w, 0);
  return Object.fromEntries(
    BUSINESS_AREAS.map((area) => [area, adjusted[area] / total])
  ) as Record<BusinessArea, number>;
}

function answerToFriction(value: number): number {
  return ((value - 1) / 4) * 100;
}

function computeRawAreaScore(area: BusinessArea, answers: Answers): number | null {
  const areaQs = QUESTIONS.filter((q) => q.area === area);
  const answered = areaQs.map((q) => answers[q.id]).filter((v): v is NonNullable<typeof v> => v !== undefined);
  if (answered.length === 0) return null;
  const mean = answered.map(answerToFriction).reduce((s, v) => s + v, 0) / answered.length;
  return Math.round(mean);
}

export function computeAreaScores(answers: Answers, industryCluster: IndustryCluster): AreaScore[] {
  const weights = computeAreaWeights(industryCluster);
  return BUSINESS_AREAS.map((area) => ({
    area,
    rawScore: computeRawAreaScore(area, answers) ?? 0,
    weight: weights[area],
  }));
}
