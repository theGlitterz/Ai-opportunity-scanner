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

// AI Profit Opportunity Scanner
export type Sector =
  | 'professional-services' | 'marketing-agency' | 'saas-technology'
  | 'manufacturing' | 'distribution-wholesale' | 'logistics-field-services'
  | 'healthcare-regulated' | 'legal-insurance' | 'recruitment-staffing'
  | 'financial-accounting' | 'retail-ecommerce' | 'other-b2b';

export type ScannerRevenueBand =
  | 'under-500k' | '500k-1m' | '1m-3m' | '3m-10m'
  | '10m-30m' | '30m-100m' | '100m-plus';

export type ScannerEmployeeBand =
  | '1-10' | '11-25' | '26-50' | '51-100'
  | '101-250' | '251-500' | '500-plus';

export type ScannerGeography =
  | 'ireland' | 'uk-ireland' | 'europe' | 'north-america' | 'multi-region' | 'other';

export type RevenueModel =
  | 'project-b2b' | 'recurring-contracts' | 'subscription-saas' | 'product-sales'
  | 'high-volume-transactions' | 'field-service' | 'marketplace-platform' | 'mixed';

export type ScannerOperatingModel =
  | 'office-services' | 'digital-services' | 'field-operations'
  | 'multi-location' | 'manufacturing-warehouse' | 'hybrid';

export type ValuePriority =
  | 'increase-revenue' | 'reduce-cost' | 'improve-cash-flow' | 'reduce-admin'
  | 'customer-speed' | 'delivery-throughput' | 'reduce-risk';

export type PressureTeam =
  | 'sales' | 'finance' | 'operations' | 'customer' | 'hr'
  | 'it' | 'legal-risk' | 'leadership-admin' | 'not-sure';

export type WorkflowMaturity =
  | 'ad-hoc' | 'partly-documented' | 'documented-manual'
  | 'system-fragmented' | 'mature-measured';

export type DataLocation =
  | 'spreadsheets' | 'crm' | 'accounting' | 'erp' | 'helpdesk'
  | 'hr-system' | 'disconnected-tools' | 'not-sure';

export type ScannerAIUsage =
  | 'not-used' | 'individual-experimentation' | 'team-usage'
  | 'workflow-usage' | 'mature-adoption';

export type PerformanceBlocker =
  | 'team-capacity' | 'manual-processes' | 'fragmented-data' | 'cost-pressure'
  | 'slow-response' | 'reporting-visibility' | 'risk-complexity' | 'not-sure';

export type ScannerProfile = {
  companyName: string;
  sector: Sector | '';
  revenueBand: ScannerRevenueBand | '';
  employeeBand: ScannerEmployeeBand | '';
  geography: ScannerGeography | '';
  revenueModel: RevenueModel | '';
  operatingModel: ScannerOperatingModel | '';
};

export type ScannerAnswerValue = string | string[];
export type ScannerAnswers = Partial<Record<string, ScannerAnswerValue>>;

export type ScannerQuestion = {
  id: string;
  section: 'Company profile' | 'Operating model' | 'Profit pressure' | 'Readiness';
  text: string;
  helperText?: string;
  type: 'single' | 'multi';
  options: { value: string; label: string }[];
};

export type ProfitLeverId =
  | 'revenue-growth' | 'operations-capacity' | 'finance-working-capital'
  | 'customer-experience' | 'people-productivity' | 'it-productivity' | 'legal-risk';

export type ImpactLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type ComplexityLevel = 'Low' | 'Medium' | 'High';
export type SpeedToValue = 'Fast' | 'Medium' | 'Longer';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type ProfitLeverResult = {
  id: ProfitLeverId;
  name: string;
  valueLow: number;
  valueHigh: number;
  share: number;
  impact: ImpactLevel;
  complexity: ComplexityLevel;
  speedToValue: SpeedToValue;
  whyItMatters: string;
  exampleImplementation: string;
  easeScore: number;
};

export type PilotRecommendation = {
  leverId: ProfitLeverId;
  area: string;
  whyFirst: string;
  validate: string;
  review: string;
  output: string;
};

export type ProfitOpportunityReport = {
  score: number;
  opportunityLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  annualOpportunity: { low: number; high: number };
  marginImpact: { low: number; high: number };
  capacityOpportunity: { low: number; high: number };
  confidence: ConfidenceLevel;
  confidenceReason: string;
  summary: string;
  topLevers: ProfitLeverResult[];
  allLevers: ProfitLeverResult[];
  recommendation: PilotRecommendation;
  assumptions: string[];
  revenueMidpoint: number;
};
