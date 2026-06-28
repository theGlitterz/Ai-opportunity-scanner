import { DIAGNOSTIC_QUESTIONS, PROFILE_QUESTIONS } from '../../data/scanner-questions';
import { formatCompactCurrencyRange } from '../formatters';
import type { ProfitLeverId, ProfitLeverResult, ScannerAnswers, ScannerProfile } from '../../types';

const allQuestions = [...PROFILE_QUESTIONS, ...DIAGNOSTIC_QUESTIONS];

function optionLabel(questionId: string, value: string): string {
  return allQuestions.find(question => question.id === questionId)?.options.find(option => option.value === value)?.label ?? value;
}

function answerValues(answers: ScannerAnswers, key: string): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
}

const lowerFirst = (value: string) => value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
const humanList = (values: string[]) => values.length <= 1 ? values.join('') : values.length === 2 ? values.join(' and ') : `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;

export type ReportInputItem = { label: string; values: string[] };

export function getReportInputs(profile: ScannerProfile, answers: ScannerAnswers): ReportInputItem[] {
  return [
    { label: 'Sector', values: [optionLabel('sector', profile.sector)] },
    { label: 'Revenue band', values: [optionLabel('revenueBand', profile.revenueBand)] },
    { label: 'Team size', values: [optionLabel('employeeBand', profile.employeeBand)] },
    { label: 'Region', values: [optionLabel('geography', profile.geography)] },
    { label: 'Revenue model', values: [optionLabel('revenueModel', profile.revenueModel)] },
    { label: 'Operating model', values: [optionLabel('operatingModel', profile.operatingModel)] },
    { label: 'Value priorities', values: answerValues(answers, 'valuePriorities').map(value => optionLabel('valuePriorities', value)) },
    { label: 'Stretched teams', values: answerValues(answers, 'pressureTeams').map(value => optionLabel('pressureTeams', value)) },
    { label: 'Workflow maturity', values: answerValues(answers, 'workflowMaturity').map(value => optionLabel('workflowMaturity', value)) },
    { label: 'Data / tools', values: answerValues(answers, 'dataLocation').map(value => optionLabel('dataLocation', value)) },
    { label: 'AI usage', values: answerValues(answers, 'aiUsage').map(value => optionLabel('aiUsage', value)) },
    { label: 'Biggest blocker', values: answerValues(answers, 'performanceBlocker').map(value => optionLabel('performanceBlocker', value)) },
  ];
}

export function buildContextExplanation(profile: ScannerProfile, answers: ScannerAnswers): string {
  const teams = answerValues(answers, 'pressureTeams');
  const teamLabels = humanList(teams.map(value => lowerFirst(optionLabel('pressureTeams', value).replace(' / success', '').replace(' / people', ''))));
  const issues: string[] = [];
  if (teams.includes('sales')) issues.push('missed follow-up');
  if (teams.includes('finance')) issues.push('finance administration and cash visibility gaps');
  if (teams.includes('operations')) issues.push('repeated handoffs and manual coordination');
  if (teams.includes('customer')) issues.push('slow response and support backlog');
  if (teams.includes('legal-risk')) issues.push('contract or compliance leakage');
  if (answerValues(answers, 'dataLocation').some(value => value === 'disconnected-tools' || value === 'spreadsheets')) issues.push('underused business data');
  if (issues.length === 0) issues.push('manual administration and limited operating visibility');

  return `You selected a ${optionLabel('employeeBand', profile.employeeBand)} employee ${lowerFirst(optionLabel('sector', profile.sector))} company with ${lowerFirst(optionLabel('revenueModel', profile.revenueModel))}, ${lowerFirst(optionLabel('dataLocation', answerValues(answers, 'dataLocation')[0] ?? ''))}, and pressure in the ${teamLabels || 'relevant operating'} team${teams.length === 1 ? '' : 's'}. This profile usually creates profit leakage through ${humanList(issues.slice(0, 4))}.`;
}

export function buildLeverReason(id: ProfitLeverId, profile: ScannerProfile, answers: ScannerAnswers): string {
  const teams = answerValues(answers, 'pressureTeams');
  const priorities = answerValues(answers, 'valuePriorities');
  const workflow = lowerFirst(optionLabel('workflowMaturity', answerValues(answers, 'workflowMaturity')[0] ?? ''));
  const data = lowerFirst(optionLabel('dataLocation', answerValues(answers, 'dataLocation')[0] ?? ''));
  const revenueModel = lowerFirst(optionLabel('revenueModel', profile.revenueModel));
  const operatingModel = lowerFirst(optionLabel('operatingModel', profile.operatingModel));
  const blocker = lowerFirst(optionLabel('performanceBlocker', answerValues(answers, 'performanceBlocker')[0] ?? ''));
  const sector = lowerFirst(optionLabel('sector', profile.sector));

  const signals: Record<ProfitLeverId, string[]> = {
    'revenue-growth': [revenueModel, data, teams.includes('sales') ? 'sales as a stretched team' : '', priorities.includes('increase-revenue') ? 'revenue growth as a priority' : ''].filter(Boolean),
    'operations-capacity': [operatingModel, `${workflow} workflows`, blocker, teams.includes('operations') ? 'operations among the stretched teams' : '', priorities.includes('delivery-throughput') ? 'delivery throughput as a priority' : ''].filter(Boolean),
    'finance-working-capital': [data, teams.includes('finance') ? 'finance as a stretched team' : '', priorities.includes('improve-cash-flow') ? 'working-capital improvement as a priority' : ''].filter(Boolean),
    'customer-experience': [operatingModel, `${workflow} workflows`, teams.includes('customer') ? 'customer support as a stretched team' : '', priorities.includes('customer-speed') ? 'response speed as a priority' : ''].filter(Boolean),
    'people-productivity': [`${workflow} workflows`, blocker, teams.includes('hr') ? 'HR among the stretched teams' : '', priorities.includes('reduce-admin') ? 'manual administration as a priority' : ''].filter(Boolean),
    'it-productivity': [data, profile.geography === 'multi-region' ? 'multi-region operations' : operatingModel, teams.includes('it') ? 'IT as a stretched team' : ''].filter(Boolean),
    'legal-risk': [sector, teams.includes('legal-risk') ? 'legal, contracts, or compliance as a stretched team' : '', priorities.includes('reduce-risk') ? 'risk reduction as a priority' : ''].filter(Boolean),
  };

  const reasons: Record<ProfitLeverId, string> = {
    'revenue-growth': `Your inputs include ${humanList(signals['revenue-growth'])}. That profile is exposed to slow response, missed follow-up, stalled deals, and underused account data.`,
    'operations-capacity': `Your inputs include ${humanList(signals['operations-capacity'])}. That combination creates repeated handoffs, status-chasing, exception work, and delivery delays.`,
    'finance-working-capital': `Your inputs include ${humanList(signals['finance-working-capital'])}. That profile creates invoice administration, inconsistent payment follow-up, reconciliation exceptions, and cash visibility gaps.`,
    'customer-experience': `Your inputs include ${humanList(signals['customer-experience'])}. That combination increases support backlog, repeated queries, slow response, and escalation risk.`,
    'people-productivity': `Your inputs include ${humanList(signals['people-productivity'])}. Candidate, onboarding, policy, and employee tasks can therefore absorb capacity through repeated checking and follow-up.`,
    'it-productivity': `Your inputs include ${humanList(signals['it-productivity'])}. That profile increases ticket queues, access-request effort, repeated questions, reporting work, and documentation gaps.`,
    'legal-risk': `Your inputs include ${humanList(signals['legal-risk'])}. That increases the likelihood of missed renewals, obligations, review delays, unmanaged risk terms, and contract leakage.`,
  };
  return reasons[id];
}

export function buildRecommendationReason(recommendedId: ProfitLeverId, levers: ProfitLeverResult[], profile: ScannerProfile, answers: ScannerAnswers): string {
  const recommended = levers.find(lever => lever.id === recommendedId) ?? levers[0];
  if (!recommended) return '';

  const speedRank = { Fast: 0, Medium: 1, Longer: 2 } as const;
  const faster = levers.find(lever => lever.id !== recommended.id && speedRank[lever.speedToValue] < speedRank[recommended.speedToValue]);
  const teams = answerValues(answers, 'pressureTeams');
  const priorities = answerValues(answers, 'valuePriorities');
  const workflow = lowerFirst(optionLabel('workflowMaturity', answerValues(answers, 'workflowMaturity')[0] ?? ''));
  const blocker = lowerFirst(optionLabel('performanceBlocker', answerValues(answers, 'performanceBlocker')[0] ?? ''));

  const selectedEvidence: Record<ProfitLeverId, string> = {
    'revenue-growth': `${teams.includes('sales') ? 'sales-team pressure, ' : ''}${priorities.includes('increase-revenue') ? 'revenue growth as a priority, ' : ''}${lowerFirst(optionLabel('revenueModel', profile.revenueModel))}, and missed follow-up risk`,
    'operations-capacity': `${teams.includes('operations') ? 'operations-team pressure, ' : ''}${priorities.some(value => value === 'reduce-cost' || value === 'reduce-admin' || value === 'delivery-throughput') ? 'cost, administration, or throughput priorities, ' : ''}${workflow} workflows, and ${blocker}`,
    'finance-working-capital': `${teams.includes('finance') ? 'finance-team pressure, ' : ''}${priorities.includes('improve-cash-flow') ? 'working-capital improvement as a priority, ' : ''}${lowerFirst(optionLabel('dataLocation', answerValues(answers, 'dataLocation')[0] ?? ''))}, and cash visibility risk`,
    'customer-experience': `${teams.includes('customer') ? 'customer-support pressure, ' : ''}${priorities.includes('customer-speed') ? 'response speed as a priority, ' : ''}${workflow} workflows, and response-time risk`,
    'people-productivity': `${teams.includes('hr') ? 'HR-team pressure, ' : ''}${priorities.includes('reduce-admin') ? 'administration reduction as a priority, ' : ''}${workflow} workflows, and recurring people administration`,
    'it-productivity': `${teams.includes('it') ? 'IT-team pressure, ' : ''}${priorities.includes('reduce-cost') ? 'operating-cost reduction as a priority, ' : ''}${lowerFirst(optionLabel('dataLocation', answerValues(answers, 'dataLocation')[0] ?? ''))}, and repeated internal requests`,
    'legal-risk': `${teams.includes('legal-risk') ? 'legal/contracts pressure, ' : ''}${priorities.includes('reduce-risk') ? 'risk reduction as a priority, ' : ''}${lowerFirst(optionLabel('sector', profile.sector))}, and renewal or obligation leakage risk`,
  };

  const comparison = faster ? `Although ${faster.name.toLowerCase()} may be faster to start, ` : '';
  const recommendationLead = faster ? 'we recommend' : 'We recommend';
  return `${comparison}${recommendationLead} ${recommended.name.toLowerCase()} first because its ${formatCompactCurrencyRange(recommended.valueLow, recommended.valueHigh)} estimated value pool is supported by ${selectedEvidence[recommended.id]}. Its ${recommended.speedToValue.toLowerCase()} speed to value and ${recommended.complexity.toLowerCase()} complexity offer the best balance of impact and evidence that can be validated in a pilot.`;
}
