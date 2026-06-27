import type { RecommendationRoute, ThemeValueEstimate } from '../../types';

const PRIMARY_FIT_THRESHOLD = 55;

export function routeRecommendation(themeValues: ThemeValueEstimate[]): RecommendationRoute {
  const rankedPrimary = themeValues[0];
  const collections = themeValues.find((item) => item.theme === 'collections');
  const inbound = themeValues.find((item) => item.theme === 'inbound');

  if (
    rankedPrimary?.theme === 'collections'
    && collections
    && collections.friction > PRIMARY_FIT_THRESHOLD
    && collections.highFrictionQuestionCount >= 2
  ) {
    return { primaryTheme: 'collections', recommendationType: 'collect' };
  }

  if (
    rankedPrimary?.theme === 'inbound'
    && inbound
    && inbound.friction > PRIMARY_FIT_THRESHOLD
  ) {
    return { primaryTheme: 'inbound', recommendationType: 'inbound' };
  }

  return { primaryTheme: rankedPrimary?.theme ?? 'workflow', recommendationType: 'workflow' };
}
