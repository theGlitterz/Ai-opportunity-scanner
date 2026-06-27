import { computeAreaScores } from './scoring/area-scores';
import { computeOverallEfficiencyScore } from './scoring/overall-score';
import { computeSavingsOpportunityScore, computeGrowthCapacityScore } from './scoring/savings-growth';
import { computeBenchmarkResult } from './benchmark/benchmark';
import { rankOpportunities } from './opportunities/rank-opportunities';
import { computeThemeSignals } from './opportunities/theme-signals';
import { computeValueModel } from './value/value-model';
import { routeRecommendation } from './report/report-routing';
import {
  derivePersonalisationSignals, generateTldrHeadline, generateConfidenceNote,
  generateRecommendationBlock,
} from './report/report-copy';
import { QUESTIONS } from '../data/questions';
import type { CompanyProfile, Answers, ReportResults, BusinessPriority, IndustryCluster, AIUsage, RevenueBand } from '../types';

export function runScoringEngine(profile: CompanyProfile, answers: Answers): ReportResults {
  const areaScores = computeAreaScores(answers, profile.industryCluster as IndustryCluster);
  const overallEfficiencyScore = computeOverallEfficiencyScore(areaScores);
  const benchmarkResult = computeBenchmarkResult(profile, overallEfficiencyScore);
  const savingsOpportunityScore = computeSavingsOpportunityScore(areaScores);
  const growthCapacityScore = computeGrowthCapacityScore(areaScores);
  const topOpportunities = rankOpportunities(areaScores, profile.businessPriority as BusinessPriority, 3);
  const themeSignals = computeThemeSignals(answers);
  const { themeValues, totalValue } = computeValueModel(profile.revenueBand as RevenueBand, themeSignals);
  const recommendationRoute = routeRecommendation(themeValues);
  const personalisationSignals = derivePersonalisationSignals(
    profile.revenueBand as RevenueBand,
    answers,
    themeSignals,
  );
  const primaryThemeValue = themeValues.find((item) => item.theme === recommendationRoute.primaryTheme);
  const recommendationBlock = generateRecommendationBlock(
    recommendationRoute.recommendationType,
    primaryThemeValue,
    topOpportunities,
    personalisationSignals,
  );

  const tldrHeadline = generateTldrHeadline(overallEfficiencyScore, benchmarkResult.gapLabel, areaScores, topOpportunities);

  const answeredQuestionCount = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const profileFieldCount = Object.entries(profile).filter(([k, v]) => k !== 'consultantNotes' && v !== undefined && v !== '').length;

  const confidenceNote = generateConfidenceNote({
    currentAIUsage: profile.currentAIUsage as AIUsage,
    answeredQuestionCount,
    profileFieldCount,
  });

  return {
    areaScores,
    overallEfficiencyScore,
    benchmarkResult,
    savingsOpportunityScore,
    growthCapacityScore,
    topOpportunities,
    tldrHeadline,
    confidenceNote,
    themeSignals,
    themeValues,
    totalValue,
    recommendationRoute,
    recommendationBlock,
    personalisationSignals,
  };
}
