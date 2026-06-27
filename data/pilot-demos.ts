/*
 * IMPLEMENTATION PLAN — Pilot Demo Capability
 * ============================================
 *
 * OBJECTIVE
 * Add 5 static illustrative demo workflows to the existing report page.
 * No backend, no AI calls, no new routes. Modal pattern only.
 *
 * FILES CREATED
 * 1. data/pilot-demos.ts                      — Types + all 5 demo configs
 * 2. components/report/PilotDemoModal.tsx     — Shared modal shell (all 5 demos)
 * 3. components/report/PilotDemoLauncher.tsx  — 5 launcher cards + modal state
 *
 * FILES MODIFIED
 * 4. components/report/ReportStep.tsx         — Insert PilotDemoLauncher after opportunities
 *
 * DATA MODEL
 * Each PilotDemo has exactly 4 steps. Each step carries a `content` discriminated union:
 *   { type: 'cards' }   → card list (emails, messages, notes, report sections)
 *   { type: 'table' }   → data table (invoices, software tools)
 *   { type: 'review' }  → flagged items with approve/edit actions
 *   { type: 'outcome' } → renders outcomePoints bullets from the demo root
 * This eliminates per-area conditional logic inside the modal component.
 *
 * MODAL BEHAVIOUR
 * - Rendered via createPortal into document.body
 * - Body scroll locked while open; restored on unmount
 * - Escape key and visible close button both call onClose
 * - Focus trapped within modal; first focusable element receives focus on mount
 *   and on each step change
 * - Disclaimer visible on every step
 * - Final step shows "Discuss a tailored pilot" CTA alongside standard navigation
 *
 * DESIGN
 * - Reuses Button and Badge from components/ui/
 * - Colour tokens: #2d6a4f accent, #f7f4ef bg, #e2ddd6 border, warm #fff8f0 flagged
 * - Tables use badgeColumnIndex to colour-code a single semantic column
 * - Review items track resolved state locally (approvedItems Set<string>)
 */

import type { BusinessArea, OpportunityTheme } from '../types';

export type BadgeVariant = 'default' | 'accent' | 'warm' | 'neutral';

export type CardItem = {
  title: string;
  subtitle?: string;
  body: string;
  tags?: { label: string; variant?: BadgeVariant }[];
  flagged?: boolean;
};

export type TableRow = {
  cells: string[];
  flagged?: boolean;
};

export type ReviewItem = {
  title: string;
  context?: string;
  draft?: string;
  status: 'flagged' | 'ready';
  options?: string[];
};

export type StepContent =
  | { type: 'cards'; items: CardItem[] }
  | { type: 'table'; headers: string[]; rows: TableRow[]; badgeColumnIndex?: number }
  | { type: 'review'; items: ReviewItem[] }
  | { type: 'outcome' };

export type DemoStep = {
  stepNumber: 1 | 2 | 3 | 4;
  label: string;
  heading: string;
  description: string;
  content: StepContent;
};

export type PilotDemo = {
  id: string;
  businessArea: BusinessArea;
  supportedThemes?: OpportunityTheme[];
  title: string;
  subtitle: string;
  problemStatement: string;
  steps: [DemoStep, DemoStep, DemoStep, DemoStep];
  outcomePoints: string[];
  disclaimer: string;
};

export const PILOT_DEMOS: PilotDemo[] = [
  // ─── 1. PEOPLE ───────────────────────────────────────────────────────────────
  {
    id: 'people-hr-admin',
    businessArea: 'People',
    supportedThemes: ['workflow'],
    title: 'HR Admin Assistant',
    subtitle: 'Handling employee queries at scale',
    problemStatement:
      'HR teams spend significant time handling repetitive employee queries on leave, payroll, and policy — most of which follow predictable patterns.',
    steps: [
      {
        stepNumber: 1,
        label: 'Incoming work',
        heading: 'Employee queries received this week',
        description:
          'A typical week of incoming HR queries received via email. Each requires a response and appropriate follow-up — currently handled manually by the HR team.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Sarah Mitchell',
              subtitle: 'Annual Leave Request — 14–18 July',
              body: "I'd like to take the week of 14–18 July as annual leave. I have 12 days remaining. Please confirm if this is approved.",
              tags: [{ label: 'Leave', variant: 'accent' }],
            },
            {
              title: 'James Reilly',
              subtitle: 'Payslip query — June deduction',
              body: "My June payslip shows a deduction I don't recognise under 'Other Deductions'. Could someone explain what this is?",
              tags: [{ label: 'Payroll', variant: 'warm' }],
            },
            {
              title: 'Priya Nair',
              subtitle: 'Working from home — probation period',
              body: "I'd like to check the current WFH policy for employees on probation. Is there a written guideline I can refer to?",
              tags: [{ label: 'Policy', variant: 'default' }],
            },
            {
              title: 'Tom Brennan',
              subtitle: 'Emergency leave — family illness',
              body: 'I need to take emergency leave today and tomorrow due to a family illness. My manager is aware. Please confirm the process.',
              tags: [{ label: 'Leave', variant: 'accent' }],
            },
            {
              title: 'Aoife Burke',
              subtitle: 'Maternity leave entitlement',
              body: "I'm planning ahead and would like to understand my full maternity leave entitlement and the HR notification process.",
              tags: [{ label: 'Leave', variant: 'accent' }],
            },
            {
              title: 'David Walsh',
              subtitle: 'Tax certificate request',
              body: 'Could I get an updated tax certificate for the current year? I need it for a mortgage application as soon as possible.',
              tags: [{ label: 'Payroll', variant: 'warm' }],
            },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'AI output',
        heading: 'Queries categorised — draft responses prepared',
        description:
          'Each query has been categorised, a draft response generated, and a confidence level assigned. One item has been flagged for human review due to payroll complexity.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Sarah Mitchell',
              subtitle: 'Leave — Annual Leave Request',
              body: "Draft: Your annual leave request for 14–18 July has been received. You have 12 days remaining. This falls within the approved leave window. Your request is approved — confirmation to follow from your manager.",
              tags: [{ label: 'Leave', variant: 'accent' }, { label: 'High confidence', variant: 'neutral' }, { label: 'Ready to send', variant: 'accent' }],
            },
            {
              title: 'James Reilly',
              subtitle: 'Payroll — June deduction query',
              body: "Draft on hold: Query relates to a specific payroll deduction. Recommend payroll team verify the calculation before a response is sent.",
              tags: [{ label: 'Payroll', variant: 'warm' }, { label: 'Flagged for review', variant: 'warm' }],
              flagged: true,
            },
            {
              title: 'Priya Nair',
              subtitle: 'Policy — WFH during probation',
              body: "Draft: The current policy allows up to 1 day per week working from home during the probation period, subject to manager approval. Please refer to the Employee Handbook, Section 4.2.",
              tags: [{ label: 'Policy', variant: 'default' }, { label: 'High confidence', variant: 'neutral' }, { label: 'Ready to send', variant: 'accent' }],
            },
            {
              title: 'Tom Brennan',
              subtitle: 'Leave — Emergency leave',
              body: "Draft: Emergency leave has been noted from today. Please submit the Emergency Leave form on return. Your remaining leave balance will be updated accordingly.",
              tags: [{ label: 'Leave', variant: 'accent' }, { label: 'High confidence', variant: 'neutral' }, { label: 'Ready to send', variant: 'accent' }],
            },
            {
              title: 'Aoife Burke',
              subtitle: 'Leave — Maternity entitlement',
              body: "Draft: You are entitled to 26 weeks' maternity leave, with an optional 16 additional unpaid weeks. HR requires 4 weeks' written notice. Please contact HR to begin the formal notification process.",
              tags: [{ label: 'Leave', variant: 'accent' }, { label: 'High confidence', variant: 'neutral' }, { label: 'Ready to send', variant: 'accent' }],
            },
            {
              title: 'David Walsh',
              subtitle: 'Payroll — Tax certificate',
              body: "Draft: Your tax certificate for the current year has been requested. This will be processed within 2 business days and sent to your registered email address.",
              tags: [{ label: 'Payroll', variant: 'warm' }, { label: 'High confidence', variant: 'neutral' }, { label: 'Ready to send', variant: 'accent' }],
            },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Human review',
        heading: 'One item held for HR review before sending',
        description:
          'The payroll query has been held pending verification of the specific deduction. A draft response is prepared — the HR team reviews and approves or edits before sending.',
        content: {
          type: 'review',
          items: [
            {
              title: 'James Reilly — June payslip deduction',
              context: 'Query: "My June payslip shows a deduction I don\'t recognise under \'Other Deductions\'."',
              draft:
                "Thank you for your query. The deduction on your June payslip relates to a benefit-in-kind adjustment applied from 1 June under the updated company benefits scheme. The amount reflects 1/12 of your annual BIK liability. Please contact payroll@company.ie if you would like a full breakdown.",
              status: 'flagged',
              options: ['Approve & send', 'Edit before sending'],
            },
            {
              title: 'Sarah Mitchell — Annual leave approved',
              draft: 'Ready to send. Leave confirmed for 14–18 July.',
              status: 'ready',
            },
            {
              title: 'Priya Nair — WFH policy response',
              draft: 'Ready to send. Policy reference provided.',
              status: 'ready',
            },
            {
              title: 'Tom Brennan — Emergency leave noted',
              draft: 'Ready to send. Instructions and form reference provided.',
              status: 'ready',
            },
            {
              title: 'Aoife Burke — Maternity entitlement',
              draft: 'Ready to send. Full entitlement and process outlined.',
              status: 'ready',
            },
            {
              title: 'David Walsh — Tax certificate requested',
              draft: 'Ready to send. Processing timeline confirmed.',
              status: 'ready',
            },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Outcome',
        heading: 'What this looks like in practice',
        description:
          'Based on similar engagements, here is what this type of capability typically delivers for HR and operations teams.',
        content: { type: 'outcome' },
      },
    ],
    outcomePoints: [
      'HR admin time on routine queries reduced significantly, freeing the team to focus on complex cases and strategic work.',
      'Average response time to employees cut from 1–2 days to same-day, improving staff experience.',
      'Consistent, policy-compliant responses across all query types — reducing risk of variation or error.',
      'Audit trail of all queries and responses maintained automatically, supporting compliance requirements.',
      'High-complexity or sensitive queries are always routed for human review before any response is sent.',
    ],
    disclaimer:
      'This is an illustrative workflow based on common HR admin patterns. Your actual pilot will be designed around your systems, processes, and team structure during a structured discovery engagement.',
  },

  // ─── 2. FINANCE ──────────────────────────────────────────────────────────────
  {
    id: 'finance-invoice-reconciliation',
    businessArea: 'Finance',
    supportedThemes: ['collections'],
    title: 'Invoice Reconciliation Assistant',
    subtitle: 'Matching invoices to payments across accounts',
    problemStatement:
      'Finance teams manually match invoices to payments across spreadsheets and email, leading to delays, missed follow-ups, and poor receivables visibility.',
    steps: [
      {
        stepNumber: 1,
        label: 'Incoming work',
        heading: 'Open invoices as at end of week',
        description:
          'Current invoice register — reconciled manually against bank records and payment confirmations each week. Discrepancies and overdue items require individual investigation.',
        content: {
          type: 'table',
          headers: ['Invoice ID', 'Client', 'Amount', 'Due Date', 'Status'],
          rows: [
            { cells: ['INV-2024-0891', 'Meridian Consulting', '€12,400', '15 Jun 2024', 'Unpaid'] },
            { cells: ['INV-2024-0892', 'Hartwell Group', '€3,750', '20 Jun 2024', 'Paid'] },
            { cells: ['INV-2024-0893', 'Apex Retail Ltd', '€8,200', '12 Jun 2024', 'Overdue'], flagged: true },
            { cells: ['INV-2024-0894', "Brennan & Sons", '€1,640', '25 Jun 2024', 'Partially Paid'], flagged: true },
            { cells: ['INV-2024-0895', 'Castleview Partners', '€22,100', '30 Jun 2024', 'Unpaid'] },
            { cells: ['INV-2024-0896', 'Meridian Consulting', '€12,400', '15 Jun 2024', 'Unpaid'], flagged: true },
            { cells: ['INV-2024-0897', "O'Brien Technologies", '€5,900', '18 Jun 2024', 'Paid'] },
            { cells: ['INV-2024-0898', 'Lakeside Solutions', '€7,300', '22 Jun 2024', 'Unpaid'] },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'AI output',
        heading: 'Invoices matched — anomalies surfaced for review',
        description:
          'Each invoice has been cross-referenced against payment records. Match status assigned to each item. Two items flagged for human review.',
        content: {
          type: 'table',
          headers: ['Invoice ID', 'Client', 'Amount', 'Due Date', 'Status', 'Match Status'],
          badgeColumnIndex: 5,
          rows: [
            { cells: ['INV-2024-0891', 'Meridian Consulting', '€12,400', '15 Jun 2024', 'Unpaid', 'Unmatched'] },
            { cells: ['INV-2024-0892', 'Hartwell Group', '€3,750', '20 Jun 2024', 'Paid', 'Matched'] },
            { cells: ['INV-2024-0893', 'Apex Retail Ltd', '€8,200', '12 Jun 2024', 'Overdue', 'Unmatched'] },
            { cells: ['INV-2024-0894', "Brennan & Sons", '€1,640', '25 Jun 2024', 'Partially Paid', 'Partial match'], flagged: true },
            { cells: ['INV-2024-0895', 'Castleview Partners', '€22,100', '30 Jun 2024', 'Unpaid', 'Matched'] },
            { cells: ['INV-2024-0896', 'Meridian Consulting', '€12,400', '15 Jun 2024', 'Unpaid', 'Duplicate'], flagged: true },
            { cells: ['INV-2024-0897', "O'Brien Technologies", '€5,900', '18 Jun 2024', 'Paid', 'Matched'] },
            { cells: ['INV-2024-0898', 'Lakeside Solutions', '€7,300', '22 Jun 2024', 'Unpaid', 'Unmatched'] },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Human review',
        heading: 'Two items require a finance team decision',
        description:
          'A duplicate invoice and a partial payment discrepancy have been surfaced for review. The finance team resolves each before the reconciliation is closed.',
        content: {
          type: 'review',
          items: [
            {
              title: 'INV-2024-0896 — Duplicate invoice (Meridian Consulting)',
              context:
                'Two invoices exist for Meridian Consulting for the same amount (€12,400) with the same due date. INV-2024-0891 was issued on 1 June; INV-2024-0896 appears to be a reissue. One should be voided.',
              draft:
                'Recommend voiding INV-2024-0896. INV-2024-0891 is the original invoice and remains valid. Meridian Consulting should be notified and asked to confirm payment against INV-2024-0891 only.',
              status: 'flagged',
              options: ['Mark as resolved', 'Escalate to manager'],
            },
            {
              title: 'INV-2024-0894 — Partial payment (Brennan & Sons)',
              context:
                'Payment received: €1,200. Invoice value: €1,640. Discrepancy of €440. No remittance advice received from client.',
              draft:
                'Contact Brennan & Sons to confirm intended payment amount and request remittance advice. If the shortfall is not addressed within 5 business days, raise a follow-up as per credit control procedure.',
              status: 'flagged',
              options: ['Mark as resolved', 'Escalate to manager'],
            },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Outcome',
        heading: 'What this looks like in practice',
        description:
          'Based on similar engagements, here is what this type of capability typically delivers for finance teams.',
        content: { type: 'outcome' },
      },
    ],
    outcomePoints: [
      'Manual reconciliation time reduced substantially — matched items are processed without human involvement.',
      'Clearer receivables position available in near real-time, rather than at end of week.',
      'Faster follow-up on unpaid and overdue items, with fewer items falling through the cracks.',
      'Duplicates and discrepancies are caught systematically rather than relying on individual attention.',
      'Finance team effort is focused on the exceptions that genuinely require judgement.',
    ],
    disclaimer:
      'This is an illustrative workflow. Actual matching logic would be designed around your specific invoicing system, payment methods, and accounting platform during discovery.',
  },

  // ─── 3. OPERATIONS ───────────────────────────────────────────────────────────
  {
    id: 'operations-report-generator',
    businessArea: 'Operations',
    supportedThemes: ['workflow'],
    title: 'Weekly Ops Report Generator',
    subtitle: 'Turning raw team inputs into a management report',
    problemStatement:
      'Operations leads spend hours each week manually compiling updates from multiple sources into a management report — a task that is repetitive and delays visibility.',
    steps: [
      {
        stepNumber: 1,
        label: 'Incoming work',
        heading: 'Raw inputs received from teams — week ending 21 June',
        description:
          'Status notes from site leads, job completion data, and flagged risks — collected across the week via email and spreadsheet. Typically compiled manually into a management report.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Site A Update — Donal Murray',
              subtitle: 'Received: Friday 09:14',
              body: "Fit-out on Block C is 85% complete. Electrical sign-off expected Thursday. No current blockers. Ahead of schedule by two days.",
              tags: [{ label: 'Team update', variant: 'neutral' }],
            },
            {
              title: 'Site B Update — Clare Healy',
              subtitle: 'Received: Friday 10:02',
              body: "Plumbing rough-in delayed by 3 days due to late materials delivery. Projected to complete by end of next week. Client notified. No further impact expected.",
              tags: [{ label: 'Team update', variant: 'neutral' }],
            },
            {
              title: 'Job #4421 — Office Fit-out, Monaghan St',
              subtitle: '68% complete — On track for 28 June handover',
              body: 'Completion: 68%. On track. No blockers reported.',
              tags: [{ label: 'Job status', variant: 'accent' }],
            },
            {
              title: 'Job #4438 — Warehouse Extension, Drogheda',
              subtitle: '42% complete — Risk of delay',
              body: 'Completion: 42%. At risk due to supplier delay on steel fixings. Original handover date: 19 July.',
              tags: [{ label: 'Job status', variant: 'accent' }],
              flagged: true,
            },
            {
              title: 'Job #4445 — Commercial Refurb, Cork Rd',
              subtitle: '91% complete — Snagging in progress',
              body: 'Completion: 91%. Snagging list commenced. Practical completion expected 26 June.',
              tags: [{ label: 'Job status', variant: 'accent' }],
            },
            {
              title: 'RISK — Steel fixings, supplier delay',
              subtitle: 'Impact: Jobs #4438, #4461',
              body: 'Delivery now expected 7 July. May impact both jobs if not resolved this week. Procurement team has been notified.',
              tags: [{ label: 'Risk', variant: 'warm' }],
              flagged: true,
            },
            {
              title: 'RISK — Subcontractor availability, Weeks 27–28',
              subtitle: 'Electrical subcontractor may be unavailable',
              body: 'Key electrical subcontractor flagged potential unavailability for Weeks 27 and 28. Contingency plan required.',
              tags: [{ label: 'Risk', variant: 'warm' }],
              flagged: true,
            },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'AI output',
        heading: 'Draft management report generated from team inputs',
        description:
          'Raw inputs have been structured into a formatted management report. Sections are generated from the source material — no manual editing required at this stage.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Summary',
              body: 'Week ending 21 June 2024. Three active sites and five live jobs. Overall programme on track. One supplier issue is the primary risk requiring management attention this week.',
              tags: [{ label: 'Report section', variant: 'neutral' }],
            },
            {
              title: 'Completed This Week',
              body: 'Block C electrical rough-in near complete (Site A, ahead of schedule). Snagging list commenced on Job #4445. Plumbing phase, Site B — in progress, revised completion next week.',
              tags: [{ label: 'Report section', variant: 'neutral' }],
            },
            {
              title: 'In Progress',
              body: 'Job #4421, Monaghan St: 68% — on track for 28 June. Job #4445, Cork Rd: 91% — snagging underway. Job #4438, Drogheda: 42% — risk of delay, see below.',
              tags: [{ label: 'Report section', variant: 'neutral' }],
            },
            {
              title: 'Delayed Items',
              body: 'Site B plumbing: 3-day delay due to materials, client notified, no further impact. Job #4438 Drogheda at risk — dependent on steel fixings delivery (revised: 7 July).',
              tags: [{ label: 'Delayed', variant: 'warm' }],
            },
            {
              title: 'Risks and Actions',
              body: '1. Steel supplier delay (fixings, 7 July): escalate to procurement by Wednesday — impact on Jobs #4438 and #4461. 2. Electrical subcontractor availability Weeks 27–28: confirm contingency this week with site manager.',
              tags: [{ label: 'Action required', variant: 'warm' }],
              flagged: true,
            },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Human review',
        heading: 'Report reviewed — one section refined before sign-off',
        description:
          "The operations lead reviews the draft. The 'Risks and Actions' section is updated to clarify the escalation owner. All other sections are approved as generated.",
        content: {
          type: 'review',
          items: [
            {
              title: 'Risks and Actions — edit before approving',
              context:
                "Generated from raw team inputs. Operations lead wants to clarify the escalation owner for the steel fixings risk before the report is distributed.",
              draft:
                "1. Steel supplier delay (fixings, revised delivery 7 July): Donal Murray to escalate to procurement by COB Wednesday. Impact assessment for Jobs #4438 and #4461 required urgently.\n2. Electrical subcontractor availability Weeks 27–28: Donal to confirm contingency with site manager by Friday.",
              status: 'flagged',
              options: ['Approve section', 'Edit before approving'],
            },
            {
              title: 'Summary',
              draft: 'Approved as generated.',
              status: 'ready',
            },
            {
              title: 'Completed This Week',
              draft: 'Approved as generated.',
              status: 'ready',
            },
            {
              title: 'In Progress',
              draft: 'Approved as generated.',
              status: 'ready',
            },
            {
              title: 'Delayed Items',
              draft: 'Approved as generated.',
              status: 'ready',
            },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Outcome',
        heading: 'What this looks like in practice',
        description:
          'Based on similar engagements, here is what this type of capability typically delivers for operations teams.',
        content: { type: 'outcome' },
      },
    ],
    outcomePoints: [
      'Hours saved each week on report compilation — time returned to operational delivery rather than administration.',
      'Management visibility available sooner, with less dependency on one person to pull everything together.',
      'Consistent report structure every week — easier to compare across periods and track trends.',
      'Risks and blockers are surfaced automatically from raw inputs, reducing the chance of something being missed.',
      'Operations lead reviews and approves rather than compiles — a fundamentally different use of their time.',
    ],
    disclaimer:
      'This is an illustrative workflow. Your actual pilot would be built around your specific reporting format, data sources, and team communication channels during discovery.',
  },

  // ─── 4. CUSTOMER ─────────────────────────────────────────────────────────────
  {
    id: 'customer-inbox-copilot',
    businessArea: 'Customer',
    supportedThemes: ['inbound'],
    title: 'Customer Inbox Copilot',
    subtitle: 'Prioritising and drafting responses to open customer queries',
    problemStatement:
      'Customer-facing teams struggle to keep up with open queries and follow-ups, leading to slow response times, missed opportunities, and inconsistent communication.',
    steps: [
      {
        stepNumber: 1,
        label: 'Incoming work',
        heading: 'Open customer messages — as at Thursday afternoon',
        description:
          'Current open inbox. Each item requires a response, a decision on urgency, or a follow-up action. Items are currently reviewed and responded to individually by the team.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Marcus Bell — Highfield Capital',
              subtitle: 'Renewal discussion — 6 days open, no response sent',
              body: "Marcus mentioned he'd like to discuss renewal terms before end of month. Initial contact made but no follow-up sent.",
              tags: [{ label: 'High value', variant: 'accent' }, { label: 'Urgent', variant: 'warm' }],
              flagged: true,
            },
            {
              title: 'Rachel O\'Connor — Greenway Partners',
              subtitle: 'Intro call follow-up — 8 days open',
              body: 'Requested follow-up contact after initial call. Has not been actioned. Risk of losing early engagement.',
              tags: [{ label: 'Urgent', variant: 'warm' }],
              flagged: true,
            },
            {
              title: 'Helena Byrne — Novara Retail',
              subtitle: 'Q3 proposal — 4 days open',
              body: 'Waiting on a revised proposal from last week\'s call. No update sent.',
              tags: [{ label: 'Follow-up needed', variant: 'warm' }],
            },
            {
              title: 'Paul Tracey — Drumlin Works',
              subtitle: 'Invoice clarification — 2 days open',
              body: 'Querying line item 4 on invoice INV-0821. Amount doesn\'t match their PO.',
              tags: [{ label: 'New query', variant: 'neutral' }],
            },
            {
              title: 'Sinéad Moran — Coastal Foods',
              subtitle: 'July delivery schedule — 1 day open',
              body: 'Looking for confirmation of the July delivery schedule. Happy to discuss if easier.',
              tags: [{ label: 'New query', variant: 'neutral' }],
            },
            {
              title: 'Tom Sullivan — Avebury Logistics',
              subtitle: 'Portal login issue — 1 day open',
              body: 'Minor technical query about the client portal login. Should be straightforward to resolve.',
              tags: [{ label: 'New query', variant: 'neutral' }],
            },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'AI output',
        heading: 'Messages prioritised — draft responses prepared',
        description:
          'Messages have been grouped by priority and a draft response generated for each. Two high-value accounts are flagged for personal review before sending.',
        content: {
          type: 'cards',
          items: [
            {
              title: 'Marcus Bell — Highfield Capital',
              subtitle: 'Urgent · High value · Recommended action: Schedule call',
              body: "Draft: Marcus, thanks for your patience. I'd like to schedule a call this week to walk through the renewal options. Are you available Thursday at 2pm? Happy to adjust if that doesn't work.",
              tags: [{ label: 'Urgent', variant: 'warm' }, { label: 'High value', variant: 'accent' }, { label: 'Flagged for review', variant: 'warm' }],
              flagged: true,
            },
            {
              title: "Rachel O'Connor — Greenway Partners",
              subtitle: 'Urgent · Recommended action: Re-engage',
              body: "Draft: Rachel, apologies for the delay following our initial call. I'd love to continue the conversation — would a brief call this week suit you?",
              tags: [{ label: 'Urgent', variant: 'warm' }, { label: 'Draft ready', variant: 'neutral' }],
            },
            {
              title: 'Helena Byrne — Novara Retail',
              subtitle: 'Follow-up needed · Recommended action: Reply with proposal',
              body: "Draft: Helena, the revised proposal is ready. I'll send it across today. Apologies for the wait — let me know if you'd like to discuss before the weekend.",
              tags: [{ label: 'Follow-up needed', variant: 'warm' }, { label: 'Draft ready', variant: 'neutral' }],
            },
            {
              title: 'Paul Tracey — Drumlin Works',
              subtitle: 'New query · Recommended action: Reply',
              body: "Draft: Paul, line item 4 relates to the additional site visit on 5 June. I'll send across the supporting documentation today.",
              tags: [{ label: 'New query', variant: 'neutral' }, { label: 'Draft ready', variant: 'neutral' }],
            },
            {
              title: 'Sinéad Moran — Coastal Foods',
              subtitle: 'New query · Recommended action: Reply',
              body: "Draft: Sinéad, the July delivery schedule is confirmed — delivery week of 15 July. I'll send the full schedule shortly.",
              tags: [{ label: 'New query', variant: 'neutral' }, { label: 'Draft ready', variant: 'neutral' }],
            },
            {
              title: 'Tom Sullivan — Avebury Logistics',
              subtitle: 'New query · Recommended action: Reply',
              body: "Draft: Tom, your login should be active now — I've reset the access from our end. Let me know if you're still having issues.",
              tags: [{ label: 'New query', variant: 'neutral' }, { label: 'Draft ready', variant: 'neutral' }],
            },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Human review',
        heading: 'High-value account reviewed before sending',
        description:
          'The Marcus Bell response is held for personal review given the account value and renewal context. All other responses are queue-ready.',
        content: {
          type: 'review',
          items: [
            {
              title: 'Marcus Bell — Highfield Capital (Renewal)',
              context:
                'High-value account. Renewal due end of month. 6 days since last contact. Recommend personal sign-off before sending.',
              draft:
                "Marcus, thanks for your patience. I'd like to schedule a call this week to walk through the renewal options and make sure we have the right structure in place for your needs next year. Are you available Thursday at 2pm? Happy to adjust if that doesn't work.",
              status: 'flagged',
              options: ['Approve & send', 'Edit before sending'],
            },
            {
              title: "Rachel O'Connor — Greenway Partners",
              draft: 'Ready to send. Re-engagement message prepared.',
              status: 'ready',
            },
            {
              title: 'Helena Byrne — Novara Retail',
              draft: 'Ready to send. Proposal follow-up drafted.',
              status: 'ready',
            },
            {
              title: 'Paul Tracey — Drumlin Works',
              draft: 'Ready to send. Invoice clarification drafted.',
              status: 'ready',
            },
            {
              title: 'Sinéad Moran — Coastal Foods',
              draft: 'Ready to send. Delivery schedule confirmed.',
              status: 'ready',
            },
            {
              title: 'Tom Sullivan — Avebury Logistics',
              draft: 'Ready to send. Login access resolved.',
              status: 'ready',
            },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Outcome',
        heading: 'What this looks like in practice',
        description:
          'Based on similar engagements, here is what this type of capability typically delivers for customer-facing teams.',
        content: { type: 'outcome' },
      },
    ],
    outcomePoints: [
      'Average response time reduced — open queries are acted on systematically rather than when bandwidth allows.',
      'High-value and at-risk accounts are surfaced automatically, ensuring they receive appropriate attention.',
      'Reduced risk of missed follow-ups — every open item is visible and has a draft action prepared.',
      'Customer-facing team time shifts from composing routine responses to reviewing and personalising them.',
      'Consistent communication quality across the team, regardless of individual workload on a given day.',
    ],
    disclaimer:
      'This is an illustrative workflow. Your actual pilot would be designed around your inbox structure, CRM system, and account priorities during a structured discovery engagement.',
  },

  // ─── 5. SYSTEMS & IT ─────────────────────────────────────────────────────────
  {
    id: 'systems-saas-review',
    businessArea: 'Systems & IT',
    supportedThemes: ['workflow'],
    title: 'SaaS Licence Review Assistant',
    subtitle: 'Visibility into software spend, usage, and renewals',
    problemStatement:
      'IT and operations teams lack a clear view of software spend, usage levels, and upcoming renewals — leading to overspend on unused tools and reactive renewal decisions.',
    steps: [
      {
        stepNumber: 1,
        label: 'Incoming work',
        heading: 'Current software tool register',
        description:
          'Active software licences across the organisation. Renewal dates and usage data are currently tracked across separate spreadsheets and vendor emails — no consolidated view exists.',
        content: {
          type: 'table',
          headers: ['Tool', 'Category', 'Monthly Cost', 'Active Users', 'Renewal Date', 'Usage'],
          badgeColumnIndex: 5,
          rows: [
            { cells: ['Salesforce', 'CRM', '€2,400', '18 of 35', 'Sep 2024', 'High'] },
            { cells: ['Slack', 'Communications', '€480', '32 of 35', 'Aug 2024', 'High'] },
            { cells: ['Asana', 'Project Mgmt', '€340', '8 of 35', 'Oct 2024', 'Low'], flagged: true },
            { cells: ['Adobe CC', 'Design', '€620', '3 of 35', 'Jul 2024', 'Low'], flagged: true },
            { cells: ['HubSpot', 'Marketing', '€890', '12 of 35', 'Nov 2024', 'Medium'] },
            { cells: ['Dropbox', 'File Storage', '€210', '11 of 35', 'Aug 2024', 'Low'], flagged: true },
            { cells: ['Zoom', 'Video Conferencing', '€390', '28 of 35', 'Sep 2024', 'High'] },
            { cells: ['Monday.com', 'Project Mgmt', '€280', '6 of 35', 'Aug 2024', 'Unknown'], flagged: true },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'AI output',
        heading: 'Usage assessed — renewal recommendations generated',
        description:
          'Each tool has been assessed against usage data and licence cost. Recommendations generated for each item. Four items flagged for IT team review before upcoming renewals.',
        content: {
          type: 'table',
          headers: ['Tool', 'Category', 'Monthly Cost', 'Active Users', 'Renewal Date', 'Usage', 'Recommendation'],
          badgeColumnIndex: 6,
          rows: [
            { cells: ['Salesforce', 'CRM', '€2,400', '18 of 35', 'Sep 2024', 'High', 'Renew'] },
            { cells: ['Slack', 'Communications', '€480', '32 of 35', 'Aug 2024', 'High', 'Renew'] },
            { cells: ['Asana', 'Project Mgmt', '€340', '8 of 35', 'Oct 2024', 'Low', 'Consolidation opportunity'], flagged: true },
            { cells: ['Adobe CC', 'Design', '€620', '3 of 35', 'Jul 2024', 'Low', 'Cancel candidate'], flagged: true },
            { cells: ['HubSpot', 'Marketing', '€890', '12 of 35', 'Nov 2024', 'Medium', 'Review before renewing'] },
            { cells: ['Dropbox', 'File Storage', '€210', '11 of 35', 'Aug 2024', 'Low', 'Review before renewing'], flagged: true },
            { cells: ['Zoom', 'Video Conferencing', '€390', '28 of 35', 'Sep 2024', 'High', 'Renew'] },
            { cells: ['Monday.com', 'Project Mgmt', '€280', '6 of 35', 'Aug 2024', 'Unknown', 'Consolidation opportunity'], flagged: true },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Human review',
        heading: 'Three items flagged for IT team decision',
        description:
          'Potential cancellations and consolidation opportunities are presented for IT lead review. Each has a rationale and a set of available decisions.',
        content: {
          type: 'review',
          items: [
            {
              title: 'Adobe CC — Cancel candidate (renewal due July 2024)',
              context:
                '€620/month. 3 of 35 users active (8.6% utilisation). Renewal due this month. Cost per active user: €207/month.',
              draft:
                'Recommend cancellation or significant licence reduction. Usage is concentrated in 3 users. If design capability is still required, a smaller-tier or alternative tool (e.g. Canva Pro for the team at ~€90/month) may cover remaining needs. Confirm with active users before cancelling.',
              status: 'flagged',
              options: ['Cancel licence', 'Reduce seats', 'Renew as-is'],
            },
            {
              title: 'Asana + Monday.com — Consolidation opportunity',
              context:
                'Asana: €340/month (8 users). Monday.com: €280/month (6 users, usage unknown). Two project management tools running in parallel. Combined cost: €620/month.',
              draft:
                'Recommend consolidating to one platform. Teams appear to be using both tools for similar purposes. Standardising would save €280–340/month and reduce tool fragmentation. Recommend a team survey to identify preferred platform before the August renewal.',
              status: 'flagged',
              options: ['Begin consolidation review', 'Defer to next quarter'],
            },
            {
              title: 'Dropbox — Review before August renewal',
              context:
                '€210/month. 11 active users. Organisation also has a SharePoint licence included in Microsoft 365 subscription.',
              draft:
                'Potential overlap with SharePoint. Recommend an audit of Dropbox usage before the August renewal to identify whether the use cases can be migrated. If so, cancellation could save €210/month with no additional cost.',
              status: 'flagged',
              options: ['Begin audit', 'Renew as-is', 'Cancel'],
            },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Outcome',
        heading: 'What this looks like in practice',
        description:
          'Based on similar engagements, here is what this type of capability typically delivers for IT and operations teams.',
        content: { type: 'outcome' },
      },
    ],
    outcomePoints: [
      'Clear, consolidated view of software spend and usage — available on demand rather than assembled manually.',
      'Upcoming renewals are visible in advance, enabling considered decisions rather than reactive ones.',
      'Unused or underutilised licences are identified systematically, creating tangible cost reduction opportunities.',
      'IT team time shifts from tracking spreadsheets to reviewing recommendations and making decisions.',
      'Structured renewal calendar reduces the risk of auto-renewals for tools that are no longer needed.',
    ],
    disclaimer:
      'This is an illustrative workflow. Actual usage data would be sourced from your identity provider, vendor portals, or billing system during a structured discovery engagement.',
  },
];
