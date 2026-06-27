import type {
  IndustryCluster, RevenueBand, EmployeeBand,
  BusinessPriority, OperatingModel, Geography, AIUsage,
} from '../types';

export type SelectOption<T extends string> = { value: T; label: string };

export const INDUSTRY_CLUSTER_OPTIONS: SelectOption<IndustryCluster>[] = [
  { value: 'financial-pe-investment', label: 'Financial / Private Equity / Investment' },
  { value: 'professional-services',   label: 'Professional Services' },
  { value: 'saas-digital',            label: 'SaaS / Digital Services' },
  { value: 'retail-ecommerce',        label: 'Retail / E-commerce' },
  { value: 'distribution-logistics',  label: 'Distribution / Logistics' },
  { value: 'manufacturing-field-ops', label: 'Manufacturing / Field Operations' },
  { value: 'healthcare-regulated',    label: 'Healthcare / Regulated Services' },
  { value: 'other-mixed',             label: 'Other / Mixed' },
];

export const REVENUE_BAND_OPTIONS: SelectOption<RevenueBand>[] = [
  { value: '500k-1m',  label: '€500K – €1M' },
  { value: '1m-3m',    label: '€1M – €3M' },
  { value: '3m-7m',    label: '€3M – €7M' },
  { value: '7m-15m',   label: '€7M – €15M' },
  { value: '15m-30m',  label: '€15M – €30M' },
  { value: '30m-plus', label: '€30M+' },
];

export const EMPLOYEE_BAND_OPTIONS: SelectOption<EmployeeBand>[] = [
  { value: '5-15',   label: '5 – 15' },
  { value: '16-35',  label: '16 – 35' },
  { value: '36-75',  label: '36 – 75' },
  { value: '76-150', label: '76 – 150' },
];

export const BUSINESS_PRIORITY_OPTIONS: SelectOption<BusinessPriority>[] = [
  { value: 'reduce-cost',        label: 'Reduce operating cost' },
  { value: 'grow-revenue',       label: 'Grow revenue' },
  { value: 'improve-speed',      label: 'Improve speed / turnaround' },
  { value: 'increase-capacity',  label: 'Increase capacity without hiring' },
  { value: 'improve-visibility', label: 'Improve visibility / control' },
];

export const OPERATING_MODEL_OPTIONS: SelectOption<OperatingModel>[] = [
  { value: 'services-led',           label: 'Services-led' },
  { value: 'product-led',            label: 'Product-led' },
  { value: 'transaction-volume-led', label: 'Transaction / volume-led' },
  { value: 'mixed',                  label: 'Mixed' },
];

export const GEOGRAPHY_OPTIONS: SelectOption<Geography>[] = [
  { value: 'ireland-only', label: 'Ireland only' },
  { value: 'uk-ireland',   label: 'UK / Ireland' },
  { value: 'europe-wide',  label: 'Europe-wide' },
  { value: 'multi-region', label: 'Multi-region' },
];

export const AI_USAGE_OPTIONS: SelectOption<AIUsage>[] = [
  { value: 'no-active-use',              label: 'No active use' },
  { value: 'individual-experimentation', label: 'Individual experimentation' },
  { value: 'some-team-usage',            label: 'Some team usage' },
  { value: 'defined-internal-use-cases', label: 'Defined internal use cases' },
];
