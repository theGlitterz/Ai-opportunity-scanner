import type { ScannerQuestion } from '../types';

const option = (value: string, label: string) => ({ value, label });

export const PROFILE_QUESTIONS: ScannerQuestion[] = [
  {
    id: 'sector', section: 'Company profile', type: 'single',
    text: 'Industry / sector',
    options: [
      option('professional-services', 'Professional services / consulting'),
      option('marketing-agency', 'Marketing / creative / agency'),
      option('saas-technology', 'SaaS / technology services'),
      option('manufacturing', 'Manufacturing'),
      option('distribution-wholesale', 'Distribution / wholesale'),
      option('logistics-field-services', 'Logistics / field services'),
      option('healthcare-regulated', 'Healthcare / regulated services'),
      option('legal-insurance', 'Legal / insurance / contract-heavy services'),
      option('recruitment-staffing', 'Recruitment / staffing'),
      option('financial-accounting', 'Financial / accounting services'),
      option('retail-ecommerce', 'Retail / ecommerce'),
      option('other-b2b', 'Other B2B services'),
    ],
  },
  {
    id: 'revenueBand', section: 'Company profile', type: 'single', text: 'Annual revenue band',
    options: [
      option('under-500k', 'Under €500k'), option('500k-1m', '€500k–€1m'),
      option('1m-3m', '€1m–€3m'), option('3m-10m', '€3m–€10m'),
      option('10m-30m', '€10m–€30m'), option('30m-100m', '€30m–€100m'),
      option('100m-plus', '€100m+'),
    ],
  },
  {
    id: 'employeeBand', section: 'Company profile', type: 'single', text: 'Employee count',
    options: [
      option('1-10', '1–10'), option('11-25', '11–25'), option('26-50', '26–50'),
      option('51-100', '51–100'), option('101-250', '101–250'),
      option('251-500', '251–500'), option('500-plus', '500+'),
    ],
  },
  {
    id: 'geography', section: 'Company profile', type: 'single', text: 'Geography / operating region',
    options: [
      option('ireland', 'Ireland'), option('uk-ireland', 'UK & Ireland'), option('europe', 'Europe'),
      option('north-america', 'US / North America'), option('multi-region', 'Multi-region'), option('other', 'Other'),
    ],
  },
  {
    id: 'revenueModel', section: 'Operating model', type: 'single', text: 'Main revenue model',
    options: [
      option('project-b2b', 'Project-based B2B work'), option('recurring-contracts', 'Recurring contracts / retainers'),
      option('subscription-saas', 'Subscription / SaaS'), option('product-sales', 'Product sales'),
      option('high-volume-transactions', 'High-volume transactions'), option('field-service', 'Field or service operations'),
      option('marketplace-platform', 'Marketplace / platform'), option('mixed', 'Mixed model'),
    ],
  },
  {
    id: 'operatingModel', section: 'Operating model', type: 'single', text: 'Main operating model',
    options: [
      option('office-services', 'Office-based service delivery'), option('digital-services', 'Digital / service delivery'),
      option('field-operations', 'Field operations'), option('multi-location', 'Multi-location operations'),
      option('manufacturing-warehouse', 'Manufacturing / warehouse operations'), option('hybrid', 'Hybrid / mixed'),
    ],
  },
];

export const DIAGNOSTIC_QUESTIONS: ScannerQuestion[] = [
  {
    id: 'valuePriorities', section: 'Profit pressure', type: 'multi',
    text: 'Where could improvement create the most business value?', helperText: 'Select up to three.',
    options: [
      option('increase-revenue', 'Increase sales / revenue'), option('reduce-cost', 'Reduce operating cost'),
      option('improve-cash-flow', 'Improve cash flow / working capital'), option('reduce-admin', 'Reduce manual admin'),
      option('customer-speed', 'Improve customer response speed'), option('delivery-throughput', 'Improve delivery speed / throughput'),
      option('reduce-risk', 'Reduce risk, compliance, or contract leakage'),
    ],
  },
  {
    id: 'pressureTeams', section: 'Profit pressure', type: 'multi',
    text: 'Which teams are most stretched by manual or repetitive work?', helperText: 'Select all that materially apply.',
    options: [
      option('sales', 'Sales'), option('finance', 'Finance'), option('operations', 'Operations'),
      option('customer', 'Customer support / success'), option('hr', 'HR / people'), option('it', 'IT'),
      option('legal-risk', 'Legal / contracts / compliance'), option('leadership-admin', 'Leadership / admin'),
      option('not-sure', 'Not sure'),
    ],
  },
  {
    id: 'workflowMaturity', section: 'Readiness', type: 'single', text: 'How standardised are core workflows today?',
    options: [
      option('ad-hoc', 'Mostly ad hoc'), option('partly-documented', 'Partly documented'),
      option('documented-manual', 'Documented but still manual'), option('system-fragmented', 'System-supported but fragmented'),
      option('mature-measured', 'Mature and measured'),
    ],
  },
  {
    id: 'dataLocation', section: 'Readiness', type: 'single', text: 'Where does most operational data currently live?',
    options: [
      option('spreadsheets', 'Spreadsheets'), option('crm', 'CRM'), option('accounting', 'Accounting system'),
      option('erp', 'ERP'), option('helpdesk', 'Support / helpdesk tool'), option('hr-system', 'HR system'),
      option('disconnected-tools', 'Multiple disconnected tools'), option('not-sure', 'Not sure'),
    ],
  },
  {
    id: 'aiUsage', section: 'Readiness', type: 'single', text: 'Current AI usage',
    options: [
      option('not-used', 'Not used'), option('individual-experimentation', 'Individual experimentation'),
      option('team-usage', 'Some team usage'), option('workflow-usage', 'Workflow-level usage'),
      option('mature-adoption', 'Mature AI adoption'),
    ],
  },
  {
    id: 'performanceBlocker', section: 'Readiness', type: 'single', text: 'Biggest blocker to better performance',
    options: [
      option('team-capacity', 'Team capacity'), option('manual-processes', 'Manual processes'),
      option('fragmented-data', 'Fragmented tools / data'), option('cost-pressure', 'Cost pressure'),
      option('slow-response', 'Slow customer / admin response'), option('reporting-visibility', 'Reporting visibility'),
      option('risk-complexity', 'Risk / compliance complexity'), option('not-sure', 'Not sure'),
    ],
  },
];

export const SCANNER_QUESTIONS = [...PROFILE_QUESTIONS, ...DIAGNOSTIC_QUESTIONS];
