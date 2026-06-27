import type {
  RevenueBand, ThemeSignal, ThemeValueEstimate, ValueRange,
} from '../../types';

const REVENUE_PROXIES: Record<RevenueBand, number> = {
  '500k-1m': 750_000,
  '1m-3m': 1_500_000,
  '3m-7m': 4_000_000,
  '7m-15m': 9_000_000,
  '15m-30m': 18_000_000,
  '30m-plus': 30_000_000,
};

const MAX_VALUE_RATES = {
  collections: 0.02,
  inbound: 0.01,
  workflow: 0.006,
} as const;

function roundBusinessValue(value: number): number {
  return Math.round(value / 1_000) * 1_000;
}

export function getRevenueEstimate(revenueBand: RevenueBand): number {
  return REVENUE_PROXIES[revenueBand];
}

export function computeValueModel(
  revenueBand: RevenueBand,
  themeSignals: ThemeSignal[],
): { themeValues: ThemeValueEstimate[]; totalValue: ValueRange } {
  const revenueEstimate = getRevenueEstimate(revenueBand);
  const unranked = themeSignals.map((themeSignal) => {
    // Opportunity value follows friction intensity. Using the inverted `signal`
    // here would assign more value to themes where the business is already strong.
    const valuePoint = revenueEstimate
      * MAX_VALUE_RATES[themeSignal.theme]
      * (themeSignal.friction / 100);

    return {
      ...themeSignal,
      valuePoint: roundBusinessValue(valuePoint),
      valueLow: roundBusinessValue(valuePoint * 0.75),
      valueHigh: roundBusinessValue(valuePoint),
    };
  });

  const totalPoint = unranked.reduce((sum, item) => sum + item.valuePoint, 0);
  const ranked = [...unranked]
    .sort((a, b) => b.valuePoint - a.valuePoint || a.theme.localeCompare(b.theme))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      contributionPct: totalPoint > 0 ? Math.round((item.valuePoint / totalPoint) * 100) : 0,
    }));

  return {
    themeValues: ranked,
    totalValue: {
      point: totalPoint,
      low: ranked.reduce((sum, item) => sum + item.valueLow, 0),
      high: ranked.reduce((sum, item) => sum + item.valueHigh, 0),
    },
  };
}
