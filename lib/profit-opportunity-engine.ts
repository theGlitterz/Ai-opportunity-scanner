import { SECTOR_CONFIG } from '../data/sector-config';
import { formatCompactCurrency } from './formatters';
import type {
  ComplexityLevel, ConfidenceLevel, DataLocation, ImpactLevel, PerformanceBlocker,
  PressureTeam, ProfitLeverId, ProfitLeverResult, ProfitOpportunityReport, RevenueModel,
  ScannerAIUsage, ScannerAnswers, ScannerEmployeeBand, ScannerProfile, ScannerRevenueBand,
  SpeedToValue, ValuePriority, WorkflowMaturity,
} from '../types';

export const REVENUE_MIDPOINTS: Record<ScannerRevenueBand, number> = {
  'under-500k': 350_000, '500k-1m': 750_000, '1m-3m': 2_000_000,
  '3m-10m': 6_500_000, '10m-30m': 20_000_000, '30m-100m': 65_000_000,
  '100m-plus': 140_000_000,
};

const EMPLOYEE_MIDPOINTS: Record<ScannerEmployeeBand, number> = {
  '1-10': 5, '11-25': 18, '26-50': 38, '51-100': 75,
  '101-250': 175, '251-500': 375, '500-plus': 650,
};

const LEVERS: Record<ProfitLeverId, { name: string; example: string; baseEase: number }> = {
  'revenue-growth': { name: 'Revenue growth & sales follow-up', baseEase: 72, example: 'AI reviews CRM activity, lead sources, open opportunities, and dormant accounts to prioritise follow-up, prepare account context, draft next actions, and flag deals that are likely to stall.' },
  'operations-capacity': { name: 'Operations productivity', baseEase: 68, example: 'AI monitors open jobs, task queues, supplier and customer updates, handoff delays, and exception notes to identify stuck work, suggest next actions, and prepare status updates.' },
  'finance-working-capital': { name: 'Finance & working capital', baseEase: 76, example: 'AI reconciles invoice, payment, and customer records; flags duplicates, partial payments, overdue items, and missing remittance details; then prepares review actions for the finance team.' },
  'customer-experience': { name: 'Customer support capacity', baseEase: 78, example: 'AI triages inbound tickets, groups repeated issues, drafts customer-ready responses, identifies escalation risk, and routes complex cases to the right owner for review.' },
  'people-productivity': { name: 'HR & people productivity', baseEase: 74, example: 'AI tracks onboarding tasks, missing documents, policy questions, candidate and admin requests, and manager follow-ups, then prepares reminders and next-step actions for HR review.' },
  'it-productivity': { name: 'IT & internal productivity', baseEase: 77, example: 'AI triages internal tickets, access requests, repeated questions, and documentation gaps; suggests fixes from approved knowledge sources; drafts responses; and escalates security-sensitive items.' },
  'legal-risk': { name: 'Legal, contracts & risk', baseEase: 57, example: 'AI reviews contract records for renewal dates, pricing clauses, obligations, approval bottlenecks, and risk terms, then flags missed actions for legal or commercial review before value leaks.' },
};

const PRIORITY_BOOSTS: Record<ValuePriority, ProfitLeverId[]> = {
  'increase-revenue': ['revenue-growth'], 'reduce-cost': ['operations-capacity', 'people-productivity', 'it-productivity'],
  'improve-cash-flow': ['finance-working-capital'], 'reduce-admin': ['operations-capacity', 'finance-working-capital', 'people-productivity'],
  'customer-speed': ['customer-experience', 'revenue-growth'], 'delivery-throughput': ['operations-capacity'],
  'reduce-risk': ['legal-risk'],
};

const TEAM_BOOSTS: Partial<Record<PressureTeam, ProfitLeverId[]>> = {
  sales: ['revenue-growth'], finance: ['finance-working-capital'], operations: ['operations-capacity'],
  customer: ['customer-experience'], hr: ['people-productivity'], it: ['it-productivity'],
  'legal-risk': ['legal-risk'], 'leadership-admin': ['operations-capacity', 'it-productivity'],
};

const BLOCKER_BOOSTS: Partial<Record<PerformanceBlocker, ProfitLeverId[]>> = {
  'team-capacity': ['operations-capacity', 'people-productivity'], 'manual-processes': ['operations-capacity', 'finance-working-capital'],
  'fragmented-data': ['it-productivity', 'operations-capacity'], 'cost-pressure': ['operations-capacity', 'finance-working-capital'],
  'slow-response': ['customer-experience', 'revenue-growth'], 'reporting-visibility': ['it-productivity', 'finance-working-capital'],
  'risk-complexity': ['legal-risk'],
};

const REVENUE_MODEL_BOOSTS: Record<RevenueModel, ProfitLeverId[]> = {
  'project-b2b': ['revenue-growth', 'operations-capacity'], 'recurring-contracts': ['revenue-growth', 'customer-experience'],
  'subscription-saas': ['customer-experience', 'revenue-growth', 'it-productivity'], 'product-sales': ['operations-capacity', 'finance-working-capital'],
  'high-volume-transactions': ['operations-capacity', 'customer-experience'], 'field-service': ['operations-capacity', 'customer-experience'],
  'marketplace-platform': ['customer-experience', 'it-productivity'], mixed: ['operations-capacity', 'revenue-growth'],
};

const asString = (answers: ScannerAnswers, key: string) => (typeof answers[key] === 'string' ? answers[key] as string : '');
const asArray = (answers: ScannerAnswers, key: string) => (Array.isArray(answers[key]) ? answers[key] as string[] : []);
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const roundMoney = (value: number) => {
  const unit = value >= 10_000_000 ? 1_000_000 : value >= 1_000_000 ? 100_000 : value >= 100_000 ? 10_000 : 5_000;
  return Math.max(unit, Math.round(value / unit) * unit);
};

function opportunityPercent(score: number, smallCompany: boolean): [number, number] {
  let range: [number, number];
  if (score < 45) range = [0.015, 0.03];
  else if (score < 65) range = [0.03, 0.06];
  else if (score < 80) range = [0.055, 0.09];
  else range = [0.08, 0.13];
  if (smallCompany) return [Math.min(range[0], 0.045), Math.min(range[1], 0.075)];
  return range;
}

function labelsForImpact(share: number, score: number): ImpactLevel {
  const signal = share * score;
  if (signal >= 18) return 'Very High';
  if (signal >= 13) return 'High';
  if (signal >= 8) return 'Medium';
  return 'Low';
}

function complexityFor(id: ProfitLeverId, employeeCount: number, fragmented: boolean, multiRegion: boolean): ComplexityLevel {
  let points = id === 'legal-risk' || id === 'operations-capacity' ? 2 : 1;
  if (fragmented) points += 1;
  if (employeeCount > 250) points += 1;
  if (multiRegion) points += 1;
  return points >= 4 ? 'High' : points >= 2 ? 'Medium' : 'Low';
}

function speedFor(complexity: ComplexityLevel, ease: number): SpeedToValue {
  if (complexity === 'High') return 'Longer';
  if (complexity === 'Low' && ease >= 72) return 'Fast';
  return 'Medium';
}

function computeConfidence(workflow: WorkflowMaturity, aiUsage: ScannerAIUsage, fragmented: boolean, largeComplex: boolean): [ConfidenceLevel, string] {
  let points = 0;
  if (workflow === 'documented-manual' || workflow === 'system-fragmented') points += 2;
  if (workflow === 'mature-measured') points += 3;
  if (workflow === 'ad-hoc') points -= 1;
  if (aiUsage === 'team-usage' || aiUsage === 'workflow-usage') points += 2;
  if (aiUsage === 'mature-adoption') points += 1;
  if (aiUsage === 'not-used') points -= 1;
  if (fragmented) points -= 1;
  if (largeComplex) points -= 1;
  const level: ConfidenceLevel = points >= 3 ? 'High' : points <= -4 ? 'Low' : 'Medium';
  const reason = level === 'High'
    ? 'Workflow definition and existing adoption signals provide a stronger basis for validating the estimate.'
    : level === 'Medium'
      ? 'The profile shows clear opportunity signals, but workflow volumes and baseline performance need pilot validation.'
      : 'The opportunity is directional because workflows are early-stage, fragmented, or not yet measured.';
  return [level, reason];
}

export function runProfitOpportunityEngine(profile: ScannerProfile, answers: ScannerAnswers): ProfitOpportunityReport {
  if (!profile.sector || !profile.revenueBand || !profile.employeeBand || !profile.revenueModel || !profile.operatingModel || !profile.geography) {
    throw new Error('A complete company profile is required to calculate the report.');
  }

  const workflow = asString(answers, 'workflowMaturity') as WorkflowMaturity;
  const dataLocation = asString(answers, 'dataLocation') as DataLocation;
  const aiUsage = asString(answers, 'aiUsage') as ScannerAIUsage;
  const blocker = asString(answers, 'performanceBlocker') as PerformanceBlocker;
  const priorities = asArray(answers, 'valuePriorities') as ValuePriority[];
  const teams = asArray(answers, 'pressureTeams') as PressureTeam[];
  const revenue = REVENUE_MIDPOINTS[profile.revenueBand];
  const employees = EMPLOYEE_MIDPOINTS[profile.employeeBand];
  const config = SECTOR_CONFIG[profile.sector];

  const manualSignal: Record<WorkflowMaturity, number> = { 'ad-hoc': 100, 'partly-documented': 86, 'documented-manual': 78, 'system-fragmented': 68, 'mature-measured': 28 };
  const fragmentationSignal: Record<DataLocation, number> = { spreadsheets: 90, crm: 48, accounting: 58, erp: 38, helpdesk: 46, 'hr-system': 48, 'disconnected-tools': 100, 'not-sure': 72 };
  const untappedSignal: Record<ScannerAIUsage, number> = { 'not-used': 100, 'individual-experimentation': 88, 'team-usage': 67, 'workflow-usage': 42, 'mature-adoption': 18 };
  const fragmented = dataLocation === 'disconnected-tools' || dataLocation === 'spreadsheets' || dataLocation === 'not-sure';
  const sectorFit = Object.values(config.weights).reduce((sum, value) => sum + value, 0) / 7;
  const scaleAdjustment = employees <= 10 ? -9 : employees <= 25 ? -3 : employees >= 500 ? 4 : 1;
  const complexitySignal = profile.operatingModel === 'field-operations' || profile.operatingModel === 'multi-location' || profile.operatingModel === 'manufacturing-warehouse' ? 4 : 0;
  const prioritySignal = clamp(priorities.length * 2, 2, 6);
  const rawScore = 14 + manualSignal[workflow] * 0.24 + fragmentationSignal[dataLocation] * 0.14
    + untappedSignal[aiUsage] * 0.14 + sectorFit * 0.27 + scaleAdjustment + complexitySignal + prioritySignal;
  const score = Math.round(clamp(rawScore, 20, 96));

  const [lowPct, highPct] = opportunityPercent(score, profile.revenueBand === 'under-500k');
  const annualLow = roundMoney(revenue * lowPct);
  const annualHigh = roundMoney(revenue * highPct);

  const weights: Record<ProfitLeverId, number> = { ...config.weights };
  for (const priority of priorities) for (const id of PRIORITY_BOOSTS[priority]) weights[id] += 18;
  for (const team of teams) for (const id of TEAM_BOOSTS[team] ?? []) weights[id] += 14;
  for (const id of BLOCKER_BOOSTS[blocker] ?? []) weights[id] += 10;
  for (const id of REVENUE_MODEL_BOOSTS[profile.revenueModel]) weights[id] += 7;
  if (profile.operatingModel === 'field-operations' || profile.operatingModel === 'manufacturing-warehouse') weights['operations-capacity'] += 12;
  if (fragmented) weights['it-productivity'] += 8;

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const allLevers = (Object.keys(weights) as ProfitLeverId[]).map((id): ProfitLeverResult => {
    const share = weights[id] / totalWeight;
    const complexity = complexityFor(id, employees, fragmented, profile.geography === 'multi-region');
    const easePenalty = fragmented ? 7 : 0;
    const easeScore = clamp(LEVERS[id].baseEase - easePenalty - (employees > 250 ? 6 : 0), 35, 90);
    return {
      id, name: LEVERS[id].name, share,
      valueLow: roundMoney(annualLow * share), valueHigh: roundMoney(annualHigh * share),
      impact: labelsForImpact(share, score), complexity, speedToValue: speedFor(complexity, easeScore),
      whyItMatters: config.context[id] ?? `Selected priorities and operating signals indicate addressable value in ${LEVERS[id].name.toLowerCase()}.`,
      exampleImplementation: LEVERS[id].example, easeScore,
    };
  }).sort((a, b) => (b.share * score + b.easeScore * 0.001) - (a.share * score + a.easeScore * 0.001));

  const largeComplex = employees > 250 && (fragmented || profile.geography === 'multi-region');
  const [confidence, confidenceReason] = computeConfidence(workflow, aiUsage, fragmented, largeComplex);
  const opportunityLevel = score >= 85 ? 'Very High' : score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low';
  const marginLow = Math.max(1, Math.round(lowPct * 100 * 0.48));
  const marginHigh = Math.max(marginLow + 1, Math.round(highPct * 100 * 0.72));
  const capacityBase = manualSignal[workflow] * 0.18 + fragmentationSignal[dataLocation] * 0.06;
  const capacityLow = Math.round(clamp(capacityBase * 0.58, 5, 18));
  const capacityHigh = Math.round(clamp(capacityBase, capacityLow + 5, 32));
  const topLever = allLevers[0];
  const first = topLever.impact === 'High' || topLever.impact === 'Very High'
    ? topLever
    : [...allLevers].sort((a, b) => (b.share * 100 + b.easeScore * 0.25) - (a.share * 100 + a.easeScore * 0.25))[0];

  return {
    score, opportunityLevel, annualOpportunity: { low: annualLow, high: annualHigh },
    marginImpact: { low: marginLow, high: marginHigh },
    capacityOpportunity: { low: capacityLow, high: capacityHigh }, confidence, confidenceReason,
    summary: `Based on your company profile, Vrise estimates a ${opportunityLevel} AI Profit Opportunity. The strongest opportunities are likely in ${allLevers.slice(0, 3).map(item => item.name.toLowerCase()).join(', ')}.`,
    topLevers: allLevers.slice(0, 3), allLevers,
    recommendation: {
      leverId: first.id, area: first.name,
      whyFirst: `${first.name} combines material financial potential with a ${first.speedToValue.toLowerCase()} speed-to-value profile. It is the strongest starting point to prove value without treating the estimate as a forecast.`,
      validate: 'Vrise would validate workflow volume, baseline time and cost, failure demand, value leakage, control requirements, and the practical automation boundary.',
      review: 'The pilot would review process steps, owners, handoffs, representative documents or records, system access, exception paths, and current performance measures.',
      output: 'A validated business case, prioritised workflow design, implementation scope, control plan, and measured first-phase delivery roadmap.',
    },
    assumptions: [
      `Revenue is modelled using a ${formatCompactCurrency(revenue)} midpoint/proxy for the selected band.`,
      'Opportunity combines revenue-equivalent uplift, cost efficiency, working-capital benefit, capacity, and risk-leakage reduction; these levers are not all EBITDA.',
      'Ranges are rounded and sector-weighted. Realisation depends on workflow volume, data quality, adoption, controls, and implementation scope.',
    ],
    revenueMidpoint: revenue,
  };
}
