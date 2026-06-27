import type { IndustryCluster, RevenueBand, EmployeeBand, Geography } from '../types';

export const BENCHMARK_CLAMP: [number, number] = [20, 80];

export const INDUSTRY_BASE_SCORES: Record<IndustryCluster, number> = {
  'financial-pe-investment': 48,
  'professional-services':   52,
  'saas-digital':            42,
  'retail-ecommerce':        55,
  'distribution-logistics':  58,
  'manufacturing-field-ops': 60,
  'healthcare-regulated':    56,
  'other-mixed':             50,
};

export const REVENUE_BAND_MODIFIERS: Record<RevenueBand, number> = {
  '500k-1m':  +4,
  '1m-3m':    +2,
  '3m-7m':     0,
  '7m-15m':   -1,
  '15m-30m':  -2,
  '30m-plus': -3,
};

export const EMPLOYEE_BAND_MODIFIERS: Record<EmployeeBand, number> = {
  '5-15':   -2,
  '16-35':   0,
  '36-75':  +2,
  '76-150': +4,
};

export const GEOGRAPHY_MODIFIERS: Record<Geography, number> = {
  'ireland-only':  0,
  'uk-ireland':   +1,
  'europe-wide':  +3,
  'multi-region': +5,
};
