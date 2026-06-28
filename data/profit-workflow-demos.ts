import type { PilotDemo, PilotFunction, TableRow, ReviewItem } from './pilot-demos';

const DISCLAIMER = 'This is an illustrative workflow. Actual logic would be designed around your specific systems, data, and process during discovery.';

type DemoConfig = {
  id: string;
  businessArea: PilotFunction;
  title: string;
  subtitle: string;
  problem: string;
  incoming: { heading: string; description: string; headers: string[]; rows: TableRow[]; badgeColumnIndex?: number };
  output: { heading: string; description: string; headers: string[]; rows: TableRow[]; badgeColumnIndex?: number };
  review: { heading: string; description: string; items: ReviewItem[] };
  outcomes: string[];
};

function createDemo(config: DemoConfig): PilotDemo {
  return {
    id: config.id,
    businessArea: config.businessArea,
    title: config.title,
    subtitle: config.subtitle,
    problemStatement: config.problem,
    steps: [
      { stepNumber: 1, label: 'Incoming work', heading: config.incoming.heading, description: config.incoming.description, content: { type: 'table', headers: config.incoming.headers, rows: config.incoming.rows, badgeColumnIndex: config.incoming.badgeColumnIndex } },
      { stepNumber: 2, label: 'AI output', heading: config.output.heading, description: config.output.description, content: { type: 'table', headers: config.output.headers, rows: config.output.rows, badgeColumnIndex: config.output.badgeColumnIndex } },
      { stepNumber: 3, label: 'Human review', heading: config.review.heading, description: config.review.description, content: { type: 'review', items: config.review.items } },
      { stepNumber: 4, label: 'Outcome', heading: 'Illustrative pilot outcome', description: 'The pilot would validate these outcomes against real workflow volumes, controls, and baseline measures.', content: { type: 'outcome' } },
    ],
    outcomePoints: config.outcomes,
    disclaimer: DISCLAIMER,
  };
}

export const PROFIT_WORKFLOW_DEMOS: PilotDemo[] = [
  createDemo({
    id: 'sales-revenue-follow-up', businessArea: 'Sales', title: 'Revenue Follow-up Assistant', subtitle: 'Prioritising accounts, dormant leads, and follow-up actions',
    problem: 'Warm leads and dormant accounts are missed when follow-up depends on individual discipline and incomplete CRM records.',
    incoming: { heading: 'Open opportunities and dormant accounts', description: 'CRM records arrive with different values, response gaps, and next-action quality.', headers: ['Account', 'Opportunity', 'Value', 'Last contact', 'Status'], badgeColumnIndex: 4, rows: [
      { cells: ['Highfield Capital', 'Renewal', '€180k', '6 days', 'No next action'], flagged: true },
      { cells: ['Novara Retail', 'Q3 proposal', '€95k', '4 days', 'Proposal sent'] },
      { cells: ['Greenway Partners', 'Dormant lead', '€60k', '43 days', 'Inactive'], flagged: true },
    ] },
    output: { heading: 'AI-prioritised follow-up queue', description: 'The assistant combines deal value, inactivity, stage, and account history to propose the next action.', headers: ['Account', 'Priority', 'Signal', 'Suggested next action'], badgeColumnIndex: 1, rows: [
      { cells: ['Highfield Capital', 'High', 'Renewal risk', 'Schedule sponsor call today'], flagged: true },
      { cells: ['Greenway Partners', 'High', 'Revival signal', 'Send relevant case study and meeting request'] },
      { cells: ['Novara Retail', 'Medium', 'Proposal idle', 'Confirm decision process and timing'] },
    ] },
    review: { heading: 'Follow-ups ready for approval', description: 'A salesperson keeps judgement and relationship ownership while reviewing suggested messages.', items: [
      { title: 'Highfield Capital — renewal follow-up', context: '€180k renewal · six days without action', draft: 'Marcus, I wanted to close the loop on the renewal discussion and confirm the priorities for the next term. Would Tuesday afternoon suit for a short review?', status: 'flagged', options: ['Approve', 'Edit', 'Hold'] },
      { title: 'Greenway Partners — dormant opportunity', context: 'No contact for 43 days', draft: 'Rachel, we recently completed a similar engagement and thought the operating results might be relevant to your earlier priorities. Would it be useful to reconnect?', status: 'flagged', options: ['Approve', 'Edit', 'Archive'] },
    ] },
    outcomes: ['Faster response on high-value accounts', 'Fewer missed or dormant opportunities', 'More consistent follow-up discipline', 'Cleaner pipeline data and next-action ownership'],
  }),
  createDemo({
    id: 'finance-invoice-reconciliation-v2', businessArea: 'Finance', title: 'Invoice Reconciliation Assistant', subtitle: 'Matching invoices to payments across accounts',
    problem: 'Finance teams spend time comparing bank receipts, invoice records, remittances, and customer messages before they can focus on exceptions.',
    incoming: { heading: 'Invoices and bank receipts awaiting reconciliation', description: 'The queue contains exact matches, partial payments, missing references, and possible duplicates.', headers: ['Reference', 'Customer', 'Invoice', 'Payment', 'Status'], badgeColumnIndex: 4, rows: [
      { cells: ['INV-0892', 'Arden Foods', '€12,400', '€12,400', 'Pending'] },
      { cells: ['INV-0894', 'Brennan & Sons', '€8,750', '€6,000', 'Partial'], flagged: true },
      { cells: ['INV-0896', 'Meridian Consulting', '€4,200', '€4,200 × 2', 'Possible duplicate'], flagged: true },
    ] },
    output: { heading: 'AI reconciliation results', description: 'Invoice, payment, reference, amount, and account history are compared before exceptions are routed for review.', headers: ['Reference', 'Result', 'Confidence', 'Recommended action'], badgeColumnIndex: 1, rows: [
      { cells: ['INV-0892', 'Matched', '99%', 'Post receipt'] },
      { cells: ['INV-0894', 'Partial match', '96%', 'Allocate €6,000 and follow up balance'], flagged: true },
      { cells: ['INV-0896', 'Duplicate', '93%', 'Hold second receipt and verify'], flagged: true },
    ] },
    review: { heading: 'Exceptions requiring finance judgement', description: 'Only ambiguous or higher-risk items are presented to finance with evidence and a suggested action.', items: [
      { title: 'INV-0896 — possible duplicate payment', context: 'Two receipts of €4,200 posted 18 minutes apart', draft: 'Suggested action: hold the second receipt, confirm the originating account, and contact the customer before refund or allocation.', status: 'flagged', options: ['Hold & verify', 'Allocate', 'Escalate'] },
      { title: 'INV-0894 — partial payment', context: '€2,750 balance remains', draft: 'Suggested action: allocate the confirmed payment and send a balance summary referencing the original invoice.', status: 'flagged', options: ['Approve follow-up', 'Edit', 'Dispute review'] },
    ] },
    outcomes: ['Less manual invoice-to-payment comparison', 'Clearer receivables and exception ownership', 'Faster follow-up on partial or unmatched payments', 'Finance time focused on judgement rather than routine matching'],
  }),
  createDemo({
    id: 'operations-exception', businessArea: 'Operations', title: 'Operations Exception Assistant', subtitle: 'Surfacing delays, handoffs, and service exceptions',
    problem: 'Delivery risks remain hidden across schedules, inboxes, and team updates until they cause delay or customer escalation.',
    incoming: { heading: 'Live delivery and task queue', description: 'The assistant reads current status, ownership, blockers, and service commitments.', headers: ['Work item', 'Owner', 'Due', 'Status', 'Blocker'], badgeColumnIndex: 3, rows: [
      { cells: ['Job 4438', 'Clare', 'Today 15:00', 'At risk', 'Supplier confirmation'], flagged: true },
      { cells: ['Route 118', 'Donal', 'Today 13:30', 'Delayed', 'Vehicle exception'], flagged: true },
      { cells: ['Job 4445', 'Aoife', 'Tomorrow', 'On track', '—'] },
    ] },
    output: { heading: 'Prioritised exception queue', description: 'Exceptions are ranked using customer impact, timing, dependency, and available recovery actions.', headers: ['Exception', 'Priority', 'Impact', 'Recommended next action'], badgeColumnIndex: 1, rows: [
      { cells: ['Route 118', 'High', 'Customer SLA at risk', 'Reassign vehicle and notify customer'], flagged: true },
      { cells: ['Job 4438', 'High', 'Two downstream tasks blocked', 'Escalate supplier and resequence work'], flagged: true },
      { cells: ['Job 4445', 'Low', 'No current impact', 'Monitor'] },
    ] },
    review: { heading: 'Recovery actions ready for an operator', description: 'Operations approves changes that affect customers, schedules, or accountable owners.', items: [
      { title: 'Route 118 — service recovery', context: 'SLA breach forecast in 42 minutes', draft: 'Reassign vehicle V-24, move the remaining stop to Route 121, and send the customer a revised 14:10 arrival window.', status: 'flagged', options: ['Approve plan', 'Edit', 'Escalate'] },
      { title: 'Job 4438 — supplier delay', context: 'Two work packages blocked', draft: 'Escalate confirmation to procurement, resequence internal work, and update the delivery owner at 14:00.', status: 'flagged', options: ['Approve plan', 'Edit', 'Assign owner'] },
    ] },
    outcomes: ['Earlier detection of delivery and service exceptions', 'Clearer ownership and escalation paths', 'Fewer handoff delays', 'Faster throughput without more status-chasing'],
  }),
  createDemo({
    id: 'customer-support-triage', businessArea: 'Customer support', title: 'Support Triage Assistant', subtitle: 'Classifying requests, drafting replies, and escalating risk',
    problem: 'Routine and high-risk requests enter the same queue, slowing first response and consuming specialist support capacity.',
    incoming: { heading: 'New support requests', description: 'Requests arrive through email, chat, and the helpdesk with inconsistent detail.', headers: ['Ticket', 'Customer', 'Channel', 'Age', 'Message'], rows: [
      { cells: ['#4821', 'Oakline Ltd', 'Email', '22 min', 'Unable to access month-end report'], flagged: true },
      { cells: ['#4822', 'Harbour Group', 'Chat', '9 min', 'How do I add a new user?'] },
      { cells: ['#4823', 'Northstar', 'Portal', '31 min', 'Incorrect charge on latest invoice'], flagged: true },
    ] },
    output: { heading: 'AI triage and response preparation', description: 'The assistant identifies category, urgency, approved knowledge, and escalation requirements.', headers: ['Ticket', 'Category', 'Urgency', 'Action', 'Risk'], badgeColumnIndex: 2, rows: [
      { cells: ['#4821', 'Access', 'High', 'Draft recovery steps', 'Executive reporting blocked'], flagged: true },
      { cells: ['#4823', 'Billing', 'High', 'Route to finance with summary', 'Commercial dispute'], flagged: true },
      { cells: ['#4822', 'How-to', 'Low', 'Draft cited answer', 'Low'] },
    ] },
    review: { heading: 'Responses and escalations ready for review', description: 'Support retains approval for customer communication and sensitive escalations.', items: [
      { title: '#4821 — access recovery response', context: 'High urgency · month-end report blocked', draft: 'We have identified an access-token issue. Please use the secure reset link below; if access is not restored within ten minutes, this case will route to platform support.', status: 'flagged', options: ['Send', 'Edit', 'Escalate'] },
      { title: '#4823 — billing dispute handoff', context: 'Finance review required', draft: 'Summary for finance: customer disputes a €1,250 service charge; contract and prior invoice attached; response due today.', status: 'flagged', options: ['Route to finance', 'Edit', 'Request detail'] },
    ] },
    outcomes: ['Faster first response', 'Reduced support backlog', 'More consistent approved answers', 'Higher-risk cases escalated with complete context'],
  }),
  createDemo({
    id: 'hr-people-admin', businessArea: 'HR', title: 'People Admin Assistant', subtitle: 'Reducing repetitive HR admin and onboarding follow-up',
    problem: 'Onboarding tasks and employee requests require repeated checking, reminders, and coordination across HR, managers, IT, and payroll.',
    incoming: { heading: 'People administration queue', description: 'New-starter tasks and employee requests arrive with different owners and missing information.', headers: ['Item', 'Employee', 'Owner', 'Due', 'Status'], badgeColumnIndex: 4, rows: [
      { cells: ['Right-to-work document', 'Maya Patel', 'HR', 'Today', 'Missing'], flagged: true },
      { cells: ['Laptop and access', 'Maya Patel', 'IT', 'Tomorrow', 'Not started'], flagged: true },
      { cells: ['Policy question', 'Liam Byrne', 'HR', 'Today', 'Open'] },
    ] },
    output: { heading: 'Missing items and next actions', description: 'The assistant checks the onboarding plan, policy sources, owners, and deadlines.', headers: ['Item', 'Finding', 'Next action', 'Owner'], badgeColumnIndex: 1, rows: [
      { cells: ['Right-to-work document', 'Required item missing', 'Send secure reminder', 'HR'], flagged: true },
      { cells: ['Laptop and access', 'Start-date risk', 'Create IT request with role template', 'IT'], flagged: true },
      { cells: ['Policy question', 'Approved answer found', 'Draft answer with policy link', 'HR'] },
    ] },
    review: { heading: 'Tasks and reminders ready for approval', description: 'HR reviews communication and retains control over employee-sensitive actions.', items: [
      { title: 'Maya Patel — missing document reminder', context: 'Start date in three working days', draft: 'Please upload the outstanding right-to-work document using the secure link below. HR will confirm once the check is complete.', status: 'flagged', options: ['Send reminder', 'Edit', 'Call employee'] },
      { title: 'Maya Patel — IT onboarding request', context: 'Role template: Client Operations Manager', draft: 'Create laptop, email, CRM, shared-drive, and approved application access tasks for manager confirmation.', status: 'flagged', options: ['Create tasks', 'Edit', 'Ask manager'] },
    ] },
    outcomes: ['Faster onboarding readiness', 'Fewer missed steps and overdue tasks', 'Less repetitive HR follow-up', 'Clear ownership across HR, managers, IT, and payroll'],
  }),
  createDemo({
    id: 'it-internal-support', businessArea: 'IT', title: 'Internal IT Support Assistant', subtitle: 'Triaging support tickets, access requests, and knowledge lookup',
    problem: 'Routine tickets and incomplete access requests interrupt technical teams while higher-risk work waits in the same queue.',
    incoming: { heading: 'Internal IT queue', description: 'Tickets arrive with different urgency, security implications, and levels of detail.', headers: ['Ticket', 'Requester', 'Request', 'Age', 'Status'], badgeColumnIndex: 4, rows: [
      { cells: ['IT-1842', 'Finance', 'ERP access for contractor', '46 min', 'Incomplete'], flagged: true },
      { cells: ['IT-1843', 'Sales', 'VPN connection failure', '18 min', 'Open'] },
      { cells: ['IT-1844', 'Operations', 'Shared mailbox access', '11 min', 'Open'] },
    ] },
    output: { heading: 'Triage, likely fix, and control checks', description: 'The assistant retrieves knowledge, identifies missing approvals, and separates routine resolution from security review.', headers: ['Ticket', 'Category', 'Suggested action', 'Risk'], badgeColumnIndex: 3, rows: [
      { cells: ['IT-1842', 'Privileged access', 'Collect sponsor, end date, and role', 'High'], flagged: true },
      { cells: ['IT-1843', 'Connectivity', 'Apply approved VPN reset steps', 'Low'] },
      { cells: ['IT-1844', 'Access', 'Route owner approval', 'Medium'] },
    ] },
    review: { heading: 'Actions awaiting IT approval', description: 'Technical or access changes remain controlled by IT and the required business approver.', items: [
      { title: 'IT-1842 — contractor ERP access', context: 'Privileged access · missing sponsor and end date', draft: 'Request sponsor approval, contract end date, required ERP role, and confirmation that least-privilege access is sufficient.', status: 'flagged', options: ['Request detail', 'Reject', 'Security review'] },
      { title: 'IT-1843 — VPN reset', context: 'Approved knowledge article matched', draft: 'Run the approved token reset, confirm device compliance, and close only after successful reconnection.', status: 'flagged', options: ['Approve action', 'Edit', 'Escalate'] },
    ] },
    outcomes: ['Faster resolution of routine tickets', 'Fewer repeated questions and incomplete requests', 'Better reuse of internal documentation', 'Security-sensitive access changes kept under human control'],
  }),
  createDemo({
    id: 'legal-contract-obligation', businessArea: 'Legal / contracts', title: 'Contract Obligation Assistant', subtitle: 'Tracking renewals, obligations, risks, and missed commercial terms',
    problem: 'Renewal dates, obligations, risk clauses, and price escalations are difficult to track consistently across separate contracts and spreadsheets.',
    incoming: { heading: 'Active contract register', description: 'Contracts are reviewed for upcoming dates, obligations, commercial terms, and evidence requirements.', headers: ['Contract', 'Value', 'Renewal', 'Key term', 'Owner'], rows: [
      { cells: ['Northstar MSA', '€420k', '31 Jul', '90-day notice', 'Commercial'], flagged: true },
      { cells: ['Atlas Supply', '€180k', '15 Aug', 'CPI price review', 'Procurement'], flagged: true },
      { cells: ['Harbour DPA', '—', 'Ongoing', 'Annual evidence update', 'Legal'] },
    ] },
    output: { heading: 'Obligation and leakage signals', description: 'The assistant extracts dates and clauses, compares them with records, and proposes the required action.', headers: ['Contract', 'Signal', 'Due', 'Recommended action'], badgeColumnIndex: 1, rows: [
      { cells: ['Northstar MSA', 'Renewal risk', '2 Jul', 'Decide renewal position and issue notice'], flagged: true },
      { cells: ['Atlas Supply', 'Price escalation', '15 Jul', 'Calculate CPI adjustment and approve'], flagged: true },
      { cells: ['Harbour DPA', 'Evidence obligation', '30 Sep', 'Request current controls evidence'] },
    ] },
    review: { heading: 'Legal and commercial decisions', description: 'The assistant prepares evidence and actions, but legal and commercial owners approve interpretation and communication.', items: [
      { title: 'Northstar MSA — renewal decision', context: '€420k contract · notice deadline approaching', draft: 'Confirm commercial renewal position, review service-performance evidence, and prepare the contractual notice for legal approval.', status: 'flagged', options: ['Prepare notice', 'Renewal review', 'Escalate'] },
      { title: 'Atlas Supply — CPI adjustment', context: 'Price review clause found in section 8.2', draft: 'Apply the published CPI measure specified in the contract, calculate the proposed adjustment, and route to procurement and finance.', status: 'flagged', options: ['Calculate', 'Legal review', 'Waive'] },
    ] },
    outcomes: ['Fewer missed renewals and notice dates', 'Better obligation ownership and evidence tracking', 'Reduced contract and pricing leakage', 'Faster legal review focused on material decisions'],
  }),
];
