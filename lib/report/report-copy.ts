import type {
  AreaScore, BenchmarkGapLabel, RankedOpportunity, AIUsage,
  Answers, PersonalisationSignals, RecommendationBlock,
  RecommendationType, RevenueBand, ThemeSignal, ThemeValueEstimate,
} from '../../types';

const REVENUE_BAND_LABELS: Record<RevenueBand, string> = {
  '500k-1m': '€500K–€1M',
  '1m-3m': '€1M–€3M',
  '3m-7m': '€3M–€7M',
  '7m-15m': '€7M–€15M',
  '15m-30m': '€15M–€30M',
  '30m-plus': '€30M+',
};

export function derivePersonalisationSignals(
  revenueBand: RevenueBand,
  answers: Answers,
  themeSignals: ThemeSignal[],
): PersonalisationSignals {
  const workflowFriction = themeSignals.find((item) => item.theme === 'workflow')?.friction ?? 0;
  const inboundAnswers = ['customer-1', 'customer-2', 'customer-3'].map((id) => answers[id] ?? 1);

  return {
    revenueBandLabel: REVENUE_BAND_LABELS[revenueBand],
    hasSeriousLatePaymentIssue: (answers['finance-2'] ?? 1) >= 4,
    hasUnclearCollectionsOwnership: (answers['people-3'] ?? 1) >= 4,
    hasInboundResponsivenessPain: inboundAnswers.some((answer) => answer >= 4),
    hasWorkflowFriction: workflowFriction > 55,
  };
}

export function generateRecommendationBlock(
  recommendationType: RecommendationType,
  _primaryThemeValue: ThemeValueEstimate | undefined,
  _topOpportunities: RankedOpportunity[],
  personalisation: PersonalisationSignals,
): RecommendationBlock {
  if (recommendationType === 'collect') {
    const personalisedContext = [
      personalisation.hasSeriousLatePaymentIssue
        ? 'You indicated that customer invoices are often paid later than agreed, which is why Collections & cashflow surfaces as the leading opportunity.'
        : null,
      personalisation.hasUnclearCollectionsOwnership
        ? 'You also noted that ownership of overdue follow-up is not fully clear across the business, which typically allows actions to slip and cash to remain outstanding.'
        : null,
    ].filter((sentence): sentence is string => sentence !== null);

    return {
      title: 'VRise Collect: Collections & cashflow',
      nextMove: 'Recommended next move: prioritise a VRise Collect pilot focused on turning overdue invoices into governed follow-up and measurable cash recovery.',
      description: 'VRise Collect continuously monitors open invoices, prioritises which accounts to act on each day, and runs governed follow-up sequences in your tone. It uses context from prior interactions and replies, routes complex cases for approval, and records every step so you can see how much cash it is unlocking, how days sales outstanding is moving, and how much manual chasing it has replaced.',
      impactLine: `Given your reported revenue band of ${personalisation.revenueBandLabel}, even a 1–2% improvement in cash collection and faster recovery of overdue invoices is material. The directional range above shows what may be on the table if this workflow is tightened.`,
      personalisedContext,
      bullets: [
        'Every morning, get a ranked list of overdue accounts and the right next action—gentle nudge, firmer follow-up, or escalation—based on value, age, and recent behaviour.',
        'Review ready-to-approve email or SMS messages written in your tone using the full customer history, rather than starting each follow-up from scratch.',
        'Track promises to pay automatically and bring an account back to the team only when the promised date passes without payment.',
      ],
    };
  }

  if (recommendationType === 'inbound') {
    return {
      title: 'Inbound response & leads opportunity',
      nextMove: 'Recommended next move: prioritise an inbound response pilot.',
      description: 'The strongest near-term value sits in capturing enquiries consistently, responding while intent is high, and making sure every viable lead reaches the right person with its context intact.',
      impactLine: `Given your reported revenue band of ${personalisation.revenueBandLabel}, recovering even a small share of missed or slow-moving enquiries can create a material annual revenue impact.`,
      personalisedContext: personalisation.hasInboundResponsivenessPain
        ? ['You highlighted slow or inconsistent handling of customer and prospect enquiries, which is why the report emphasises Inbound Response & Leads.']
        : [],
      bullets: [
        'Capture missed and after-hours calls, record what the prospect needs, and create a clear follow-up task for the right owner.',
        'Sort new enquiries by urgency and commercial intent so high-value leads are handled first.',
        'Prepare the first response with the full enquiry context so the team can act quickly without rereading every message or call note.',
      ],
    };
  }

  return {
    title: 'Workflow efficiency opportunity',
    nextMove: 'Recommended next move: prioritise a workflow automation review.',
    description: 'Your answers suggest the strongest near-term value sits in repetitive internal workflows rather than a single collections or inbound issue. The first goal should be to identify the one process where AI can remove friction fastest.',
    impactLine: `Given your reported revenue band of ${personalisation.revenueBandLabel}, reducing repeated coordination and reporting work can release meaningful capacity without adding headcount.`,
    personalisedContext: personalisation.hasWorkflowFriction
      ? ['You reported material friction across internal coordination, reporting, or systems work, which is why Workflow Efficiency is the recommended starting point.']
      : [],
    bullets: [
      'Replace manual chasing for updates with one weekly summary of stuck items, who is blocking them, and what needs to move next.',
      'Run standard follow-ups automatically so the team spends its time on exceptions, decisions, and sensitive cases.',
      'Turn recurring management reporting into a consistent view assembled from the systems your teams already use.',
    ],
  };
}

function getTopOpportunityAreas(areaScores: AreaScore[], n: number): string[] {
  return [...areaScores].sort((a, b) => b.rawScore - a.rawScore).slice(0, n).map((a) => a.area);
}

function describeBenchmarkPosition(gapLabel: BenchmarkGapLabel): string {
  switch (gapLabel) {
    case 'Above benchmark':
      return 'is operating below the efficiency level of similar businesses by size, sector, and operating context';
    case 'Slightly above benchmark':
      return 'is operating slightly below the efficiency level of similar businesses by size, sector, and operating context';
    case 'In line with benchmark':
      return 'is broadly in line with similar businesses by size, sector, and operating context';
    case 'Slightly below benchmark':
      return 'is operating at a slightly stronger efficiency level than similar businesses in its modeled peer group';
    case 'Below benchmark':
      return 'is operating at a meaningfully stronger efficiency level than comparable businesses in its modeled peer group';
  }
}

export function generateTldrHeadline(
  overallEfficiencyScore: number,
  gapLabel: BenchmarkGapLabel,
  areaScores: AreaScore[],
  topOpportunities: RankedOpportunity[]
): string {
  // overallEfficiencyScore is the internal friction score (higher = more friction = more improvement headroom).
  // Branch thresholds are unchanged; only the client-facing copy is updated.
  const topAreas = getTopOpportunityAreas(areaScores, 2);
  const top1 = topOpportunities[0]?.title.toLowerCase() ?? null;
  const top2 = topOpportunities[1]?.title.toLowerCase() ?? null;
  const oppPhrase = top1 && top2 ? `${top1} and ${top2}` : top1 ?? 'identified opportunity areas';
  const areaPhrase = topAreas[1] ? `${topAreas[0]} and ${topAreas[1]}` : topAreas[0];
  const benchPhrase = describeBenchmarkPosition(gapLabel);

  if (overallEfficiencyScore >= 65 && (gapLabel === 'Above benchmark' || gapLabel === 'Slightly above benchmark')) {
    return `The greatest efficiency headroom is in ${areaPhrase}. The business ${benchPhrase}, pointing to clear AI deployment priorities — particularly ${oppPhrase}.`;
  }
  if (overallEfficiencyScore >= 65) {
    return `The assessment identifies material efficiency headroom across ${areaPhrase}. The business ${benchPhrase}, with strong AI opportunity in ${oppPhrase}.`;
  }
  if (overallEfficiencyScore >= 40) {
    return `The business ${benchPhrase}, with efficiency headroom concentrated in ${areaPhrase}. Automation potential is strongest in ${oppPhrase}.`;
  }
  return `The assessment identifies a well-managed operational baseline, with the most actionable AI opportunity in ${oppPhrase}.`;
}

export function generateConfidenceNote(inputs: {
  currentAIUsage: AIUsage;
  answeredQuestionCount: number;
  profileFieldCount: number;
}): string {
  const { currentAIUsage, answeredQuestionCount, profileFieldCount } = inputs;
  const signalQuality = answeredQuestionCount === 15 ? 'a complete set of assessment responses'
    : answeredQuestionCount >= 12 ? 'a near-complete set of assessment responses'
    : 'a partial set of assessment responses';
  const profileCompleteness = profileFieldCount >= 7 ? 'a well-specified company profile' : 'an indicative company profile';
  const aiContext = currentAIUsage === 'no-active-use'
    ? 'As the business has no current AI activity, the identified opportunities represent a first-entry point into applied AI.'
    : currentAIUsage === 'individual-experimentation'
    ? 'With individual AI experimentation underway, the recommended areas represent structured next steps beyond informal use.'
    : currentAIUsage === 'some-team-usage'
    ? 'Existing team-level AI activity provides a foundation for the structured deployment opportunities identified here.'
    : 'Given the existing defined AI use cases, this assessment highlights where further workflow-level deployment can extend current gains.';

  return [
    `This report is based on ${signalQuality} and ${profileCompleteness}.`,
    `Scores and rankings are generated using our internal benchmark model, calibrated against similar businesses by size, sector, and operating context.`,
    `The modeled peer benchmark is intended as a directional reference, not a precise external measurement.`,
    `Annual value ranges are directional opportunities based on assessment responses, revenue-band proxies, and VRise benchmark assumptions; they are not forecasts or guarantees.`,
    aiContext,
    `Findings are indicative. A structured discovery engagement would validate and prioritise these areas with greater precision.`,
  ].join(' ');
}
