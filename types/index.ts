export type BusinessArea =
  | 'People'
  | 'Finance'
  | 'Operations'
  | 'Customer'
  | 'Systems & IT';

export const BUSINESS_AREAS: BusinessArea[] = [
  'People',
  'Finance',
  'Operations',
  'Customer',
  'Systems & IT',
];

export type ScaleType = 'frequency' | 'severity';
export type ScaleValue = 1 | 2 | 3 | 4 | 5;
export type OpportunityTheme = 'collections' | 'inbound' | 'workflow';

export const FREQUENCY_LABELS: Record<ScaleValue, string> = {
  1: 'Rarely',
  2: 'Occasionally',
  3: 'Sometimes',
  4: 'Often',
  5: 'Very often',
};

export const SEVERITY_LABELS: Record<ScaleValue, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very high',
};

export type Question = {
  id: string;
  area: BusinessArea;
  text: string;
  helperText: string;
  scaleType: ScaleType;
  opportunityTheme?: OpportunityTheme;
};

export type IndustryCluster =
  | 'financial-pe-investment'
  | 'professional-services'
  | 'saas-digital'
  | 'retail-ecommerce'
  | 'distribution-logistics'
  | 'manufacturing-field-ops'
  | 'healthcare-regulated'
  | 'other-mixed';

export type RevenueBand =
  | '500k-1m'
  | '1m-3m'
  | '3m-7m'
  | '7m-15m'
  | '15m-30m'
  | '30m-plus';

export type EmployeeBand = '5-15' | '16-35' | '36-75' | '76-150';

export type BusinessPriority =
  | 'reduce-cost'
  | 'grow-revenue'
  | 'improve-speed'
  | 'increase-capacity'
  | 'improve-visibility';

export type OperatingModel =
  | 'services-led'
  | 'product-led'
  | 'transaction-volume-led'
  | 'mixed';

export type Geography =
  | 'ireland-only'
  | 'uk-ireland'
  | 'europe-wide'
  | 'multi-region';

export type AIUsage =
  | 'no-active-use'
  | 'individual-experimentation'
  | 'some-team-usage'
  | 'defined-internal-use-cases';

export type CompanyProfile = {
  companyName: string;
  industryCluster: IndustryCluster | '';
  revenueBand: RevenueBand | '';
  employeeBand: EmployeeBand | '';
  businessPriority: BusinessPriority | '';
  operatingModel: OperatingModel | '';
  geography: Geography | '';
  currentAIUsage: AIUsage | '';
  consultantNotes?: string;
};

export type Answers = Partial<Record<string, ScaleValue>>;

export type AreaScore = {
  area: BusinessArea;
  rawScore: number;
  weight: number;
};

export type BenchmarkGapLabel =
  | 'Above benchmark'
  | 'Slightly above benchmark'
  | 'In line with benchmark'
  | 'Slightly below benchmark'
  | 'Below benchmark';

export type BenchmarkResult = {
  overallBenchmarkScore: number;
  gap: number;
  gapLabel: BenchmarkGapLabel;
  derivationNote: string;
};

export type OpportunityId =
  | 'finance-workflow-automation'
  | 'customer-response-automation'
  | 'internal-knowledge-assistant'
  | 'operations-workflow-automation'
  | 'reporting-visibility-automation'
  | 'systems-data-simplification'
  | 'it-request-documentation-assistant';

export type SavingsLever =
  | 'labour-time-reduction'
  | 'error-reduction'
  | 'process-acceleration'
  | 'overhead-reduction';

export type GrowthCapacityLever =
  | 'capacity-without-headcount'
  | 'faster-customer-response'
  | 'better-visibility-decisions'
  | 'scalable-operations';

export type OpportunityLibraryItem = {
  id: OpportunityId;
  title: string;
  shortDescription: string;
  primaryAreas: BusinessArea[];
  secondaryAreas: BusinessArea[];
  aiFitEase: 1 | 2 | 3;
  savingsLever: SavingsLever;
  growthCapacityLever: GrowthCapacityLever;
  priorityAffinities: BusinessPriority[];
  exampleUseCase: string;
};

export type RankedOpportunity = OpportunityLibraryItem & {
  rank: number;
  rationale: string;
};

export type ThemeSignal = {
  theme: OpportunityTheme;
  friction: number;
  signal: number;
  questionCount: number;
  highFrictionQuestionCount: number;
};

export type ThemeValueEstimate = ThemeSignal & {
  rank: number;
  valuePoint: number;
  valueLow: number;
  valueHigh: number;
  contributionPct: number;
};

export type ValueRange = {
  point: number;
  low: number;
  high: number;
};

export type RecommendationType = 'collect' | 'inbound' | 'workflow';

export type RecommendationRoute = {
  primaryTheme: OpportunityTheme;
  recommendationType: RecommendationType;
};

export type RecommendationBlock = {
  title: string;
  nextMove: string;
  description: string;
  impactLine: string;
  personalisedContext: string[];
  bullets: string[];
};

export type PersonalisationSignals = {
  revenueBandLabel: string;
  hasSeriousLatePaymentIssue: boolean;
  hasUnclearCollectionsOwnership: boolean;
  hasInboundResponsivenessPain: boolean;
  hasWorkflowFriction: boolean;
};

export type ReportResults = {
  areaScores: AreaScore[];
  overallEfficiencyScore: number;
  benchmarkResult: BenchmarkResult;
  savingsOpportunityScore: number;
  growthCapacityScore: number;
  topOpportunities: RankedOpportunity[];
  tldrHeadline: string;
  confidenceNote: string;
  themeSignals: ThemeSignal[];
  themeValues: ThemeValueEstimate[];
  totalValue: ValueRange;
  recommendationRoute: RecommendationRoute;
  recommendationBlock: RecommendationBlock;
  personalisationSignals: PersonalisationSignals;
};

export type AppStep = 'profile' | 'assessment' | 'report';
