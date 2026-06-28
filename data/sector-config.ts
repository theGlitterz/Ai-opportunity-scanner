import type { ProfitLeverId, Sector } from '../types';

export type SectorConfig = {
  label: string;
  weights: Record<ProfitLeverId, number>;
  context: Partial<Record<ProfitLeverId, string>>;
};

const balanced = { 'revenue-growth': 72, 'operations-capacity': 75, 'finance-working-capital': 70, 'customer-experience': 68, 'people-productivity': 58, 'it-productivity': 58, 'legal-risk': 55 };
const sector = (label: string, weights: Partial<Record<ProfitLeverId, number>>, context: SectorConfig['context']): SectorConfig => ({ label, weights: { ...balanced, ...weights }, context });

export const SECTOR_CONFIG: Record<Sector, SectorConfig> = {
  'professional-services': sector('professional services / consulting', { 'revenue-growth': 92, 'operations-capacity': 90, 'finance-working-capital': 82, 'people-productivity': 72, 'legal-risk': 65 }, {
    'revenue-growth': 'Proposal speed, structured follow-up, and account knowledge directly affect win rate and utilisation.',
    'operations-capacity': 'Reusable knowledge and less delivery administration can release billable capacity.',
    'finance-working-capital': 'Project billing, approvals, and payment follow-up often create avoidable cash and admin drag.',
  }),
  'marketing-agency': sector('marketing / creative / agency', { 'revenue-growth': 92, 'operations-capacity': 91, 'finance-working-capital': 82, 'customer-experience': 78 }, {
    'revenue-growth': 'Faster proposals and consistent follow-up help convert more pipeline without adding sales administration.',
    'operations-capacity': 'Client reporting, briefing, and production coordination consume high-value delivery time.',
    'finance-working-capital': 'Retainer, project, and approval workflows create recurring follow-up effort.',
  }),
  'saas-technology': sector('SaaS / technology services', { 'revenue-growth': 91, 'customer-experience': 94, 'operations-capacity': 82, 'it-productivity': 86 }, {
    'revenue-growth': 'Lead qualification, onboarding, renewals, and churn signals are strong revenue levers.',
    'customer-experience': 'Support triage and knowledge assistance can improve response while protecting specialist capacity.',
    'it-productivity': 'Internal support, documentation, and access workflows are well suited to controlled automation.',
  }),
  'manufacturing': sector('manufacturing', { 'operations-capacity': 96, 'finance-working-capital': 86, 'customer-experience': 76, 'it-productivity': 68, 'legal-risk': 67, 'revenue-growth': 62 }, {
    'operations-capacity': 'Production coordination, supplier exceptions, procurement administration, and document handling drive operating drag.',
    'finance-working-capital': 'Purchasing, inventory administration, invoicing, and supplier workflows affect cash conversion.',
  }),
  'distribution-wholesale': sector('distribution / wholesale', { 'operations-capacity': 94, 'finance-working-capital': 93, 'customer-experience': 86, 'revenue-growth': 76 }, {
    'operations-capacity': 'Order processing, inventory administration, and supplier coordination create high-volume repeat work.',
    'finance-working-capital': 'Collections, disputes, and purchasing workflows have direct working-capital consequences.',
    'customer-experience': 'Automated order and exception updates can reduce inbound demand and protect account service.',
  }),
  'logistics-field-services': sector('logistics / field services', { 'operations-capacity': 98, 'customer-experience': 90, 'finance-working-capital': 87, 'people-productivity': 68, 'legal-risk': 65 }, {
    'operations-capacity': 'Scheduling, exception handling, handoffs, and status coordination are central capacity levers.',
    'customer-experience': 'Proactive status updates can reduce avoidable contacts and service escalation.',
    'finance-working-capital': 'Proof-of-service, invoice disputes, and finance follow-up can delay cash conversion.',
  }),
  'healthcare-regulated': sector('healthcare / regulated services', { 'operations-capacity': 91, 'customer-experience': 86, 'legal-risk': 91, 'people-productivity': 74 }, {
    'operations-capacity': 'Intake, scheduling, documentation, and administrative handoffs can release scarce service capacity.',
    'legal-risk': 'Compliance evidence and controlled document workflows can reduce administrative and audit risk.',
    'customer-experience': 'Approved communication support can improve response without weakening governance.',
  }),
  'legal-insurance': sector('legal / insurance / contract-heavy services', { 'legal-risk': 98, 'operations-capacity': 92, 'customer-experience': 77, 'finance-working-capital': 72 }, {
    'legal-risk': 'Obligation tracking, renewals, clause review, and compliance evidence can reduce material leakage and risk.',
    'operations-capacity': 'Document-heavy review and case administration constrain specialist throughput.',
    'customer-experience': 'Structured intake and drafting support can improve client response times.',
  }),
  'recruitment-staffing': sector('recruitment / staffing', { 'revenue-growth': 94, 'operations-capacity': 91, 'people-productivity': 86, 'finance-working-capital': 80 }, {
    'revenue-growth': 'Candidate and client follow-up speed directly influences placement conversion.',
    'operations-capacity': 'Screening, pipeline administration, onboarding, and timesheet workflows carry high repeat volume.',
    'people-productivity': 'Structured candidate matching and onboarding can release consultant capacity.',
  }),
  'financial-accounting': sector('financial / accounting services', { 'operations-capacity': 94, 'finance-working-capital': 87, 'legal-risk': 90, 'customer-experience': 78 }, {
    'operations-capacity': 'Document processing, client administration, reporting, and review queues are highly addressable.',
    'legal-risk': 'Controlled compliance workflows can improve evidence quality and reduce missed actions.',
    'customer-experience': 'Client information requests and status updates can be made faster and more consistent.',
  }),
  'retail-ecommerce': sector('retail / ecommerce', { 'customer-experience': 95, 'operations-capacity': 90, 'revenue-growth': 86, 'finance-working-capital': 75 }, {
    'customer-experience': 'Support, returns, and order enquiries create high-volume service demand.',
    'operations-capacity': 'Inventory, returns, catalogue, and reporting administration can absorb significant capacity.',
    'revenue-growth': 'Marketing operations and customer signals can improve conversion and retention activity.',
  }),
  'other-b2b': sector('B2B services', {}, {
    'revenue-growth': 'Consistent qualification and follow-up can improve conversion and account coverage.',
    'operations-capacity': 'Workflow coordination and repetitive administration are common capacity constraints.',
    'finance-working-capital': 'Finance administration and payment follow-up can create avoidable cost and cash drag.',
  }),
};
