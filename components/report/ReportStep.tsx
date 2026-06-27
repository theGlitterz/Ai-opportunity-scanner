'use client';
import React from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { ScoreCard } from './ScoreCard';
import { BenchmarkGapBadge } from './BenchmarkGapBadge';
import { AreaScoreBars } from './AreaScoreBar';
import { OpportunityCard } from './OpportunityCard';
import { Button } from '../ui/Button';
import { PilotDemoLauncher } from './PilotDemoLauncher';
import { VRiseLogo } from '../ui/VRiseLogo';
import type { OpportunityTheme, RecommendationType } from '../../types';

const SCORE_TOOLTIPS = {
  overall: 'Measures current operational efficiency across all five business areas (0–100). A higher score indicates stronger overall efficiency. A lower score points to more headroom for AI-driven improvement. Area weights are calibrated by industry sector.',
  savings: 'Measures current cost and operational efficiency across Finance, Operations, and Systems & IT. A higher score indicates stronger efficiency in these areas. A lower score signals more room for improvement.',
  growth: 'Measures current capacity and growth enablement across Customer interactions, People, and Finance. A higher score indicates a stronger foundation for scaling and growth.',
};

const THEME_LABELS: Record<OpportunityTheme, string> = {
  collections: 'Collections & Cashflow',
  inbound: 'Inbound Response & Leads',
  workflow: 'Workflow Efficiency',
};

const FOUNDATION_LABELS: Record<OpportunityTheme, string> = {
  collections: 'Collections support',
  inbound: 'Inbound handling',
  workflow: 'Workflow foundations',
};

const THEME_BAR_COLORS: Record<OpportunityTheme, string> = {
  collections: '#4F68FF',
  inbound: '#5F8DFF',
  workflow: '#10A879',
};

const RECOMMENDATION_THEME: Record<RecommendationType, OpportunityTheme> = {
  collect: 'collections',
  inbound: 'inbound',
  workflow: 'workflow',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRange(low: number, high: number): string {
  return low === high ? formatCurrency(high) : `${formatCurrency(low)}–${formatCurrency(high)}`;
}

function getFoundationLabel(signal: number): 'Strong' | 'Mixed' | 'Needs work' {
  if (signal >= 70) return 'Strong';
  if (signal >= 40) return 'Mixed';
  return 'Needs work';
}

function getFoundationBadgeStyle(label: 'Strong' | 'Mixed' | 'Needs work') {
  if (label === 'Strong') return 'text-[#10A879] bg-[rgba(16,168,121,0.10)] border border-[rgba(16,168,121,0.24)]';
  if (label === 'Mixed') return 'text-[#D97706] bg-[rgba(217,119,6,0.10)] border border-[rgba(217,119,6,0.20)]';
  return 'text-[#748094] bg-[rgba(20,35,55,0.06)] border border-[rgba(20,35,55,0.12)]';
}

const DARK_PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #07111F 0%, #0D1E3D 55%, #091729 100%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(79,104,255,0.16), inset 0 1px 0 rgba(255,255,255,0.05)',
};

export function ReportStep() {
  const { state, dispatch } = useAssessment();
  const { results, profile } = state;

  if (!results) return null;

  const {
    overallEfficiencyScore, benchmarkResult, savingsOpportunityScore, growthCapacityScore,
    areaScores, topOpportunities, tldrHeadline, confidenceNote, themeValues, totalValue,
    recommendationRoute, recommendationBlock, personalisationSignals,
  } = results;
  const displayOverall = 100 - overallEfficiencyScore;
  const displaySavings = 100 - savingsOpportunityScore;
  const displayGrowth = 100 - growthCapacityScore;
  const reportDate = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  const demoTheme = RECOMMENDATION_THEME[recommendationRoute.recommendationType];

  function handlePrint() { window.print(); }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="no-print flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_STEP', step: 'assessment' })}>
          <svg className="mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 6H2M5 2L1 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Assessment
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>Print / Save PDF</Button>
          <Button size="sm" onClick={() => dispatch({ type: 'RESET' })}>New Assessment</Button>
        </div>
      </div>

      <div id="report-content">

        {/* Report header */}
        <div className="mb-10 pb-7 border-b border-[rgba(20,35,55,0.10)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <VRiseLogo variant="full-color" height={28} className="mb-3" />
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0D1726] mb-1.5 tracking-tight">
                Revenue Opportunity Scan
              </h1>
              <p className="text-sm font-semibold text-[#3B4960]">{profile.companyName || 'Assessment Report'}</p>
              <p className="text-xs text-[#748094] mt-1">{reportDate} · vrise.tech</p>
            </div>
          </div>
        </div>

        {/* Hero: total value */}
        <section className="mb-12 p-7 sm:p-10 rounded-[24px] text-white print-card" style={DARK_PANEL_STYLE}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7B9CFF] mb-3">
            Directional annual value opportunity
          </p>
          <p className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight mb-4 text-white">
            {formatRange(totalValue.low, totalValue.high)}
          </p>
          <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
            For {profile.companyName || 'your business'}, VRise estimates this range of recoverable annual value across revenue workflows, based on your answers and reported {personalisationSignals.revenueBandLabel} revenue band.
          </p>
          <p className="text-[11px] text-white/40 leading-relaxed mt-3">
            Directional annual value opportunity based on your answers and VRise benchmark assumptions. This is not a financial forecast or guarantee.
          </p>
        </section>

        {/* Biggest revenue opportunities */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold font-heading text-[#0D1726]">Your biggest revenue opportunities</h2>
            <div className="flex-1 h-px bg-[rgba(20,35,55,0.10)]" />
          </div>
          <div className="h-3 flex overflow-hidden rounded-full bg-[rgba(20,35,55,0.06)] mb-5" aria-label="Opportunity contribution breakdown">
            {themeValues.map((item) => (
              <div
                key={item.theme}
                style={{ width: `${item.contributionPct}%`, backgroundColor: THEME_BAR_COLORS[item.theme] }}
                title={`${THEME_LABELS[item.theme]}: approximately ${item.contributionPct}%`}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeValues.map((item) => (
              <div
                key={item.theme}
                className={`bg-white border rounded-[18px] p-5 print-card ${item.rank === 1 ? 'border-[rgba(79,104,255,0.30)]' : 'border-[rgba(20,35,55,0.10)]'}`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <h3 className="text-sm font-bold font-heading text-[#0D1726] mb-2">{THEME_LABELS[item.theme]}</h3>
                <p className="text-2xl font-extrabold font-heading text-[#4F68FF] mb-1">~{item.contributionPct}%</p>
                <p className="text-xs text-[#748094]">of total · {formatRange(item.valueLow, item.valueHigh)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Primary recommendation */}
        <section className="mb-12 p-7 sm:p-8 bg-[rgba(79,104,255,0.05)] border border-[rgba(79,104,255,0.16)] rounded-[18px] print-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4F68FF] mb-2">Primary recommendation</p>
          <h2 className="text-xl font-bold font-heading text-[#0D1726] mb-3">{recommendationBlock.title}</h2>
          <p className="text-sm font-semibold text-[#4F68FF] mb-3">{recommendationBlock.nextMove}</p>
          <p className="text-sm text-[#3B4960] leading-relaxed mb-4 max-w-2xl">{recommendationBlock.description}</p>
          {recommendationBlock.personalisedContext.map((sentence) => (
            <p key={sentence} className="text-sm text-[#0D1726] leading-relaxed mb-2 max-w-2xl font-medium">{sentence}</p>
          ))}
          <p className="text-sm text-[#3B4960] leading-relaxed my-5 max-w-2xl border-l-2 border-[#4F68FF] pl-4">{recommendationBlock.impactLine}</p>
          <ul className="space-y-2">
            {recommendationBlock.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-[#0D1726]">
                <span className="text-[#4F68FF] mt-0.5">●</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pilot demo launcher */}
        <div className="mb-12">
          <PilotDemoLauncher theme={demoTheme} />
        </div>

        {/* Operational foundations */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold font-heading text-[#0D1726]">Operational foundations</h2>
            <div className="flex-1 h-px bg-[rgba(20,35,55,0.10)]" />
          </div>
          <p className="text-sm text-[#748094] mb-5">A qualitative view of the foundations supporting AI agents. Detailed scores remain available below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeValues.map((item) => {
              const label = getFoundationLabel(item.signal);
              return (
                <div key={item.theme} className="flex items-center justify-between gap-3 bg-white border border-[rgba(20,35,55,0.10)] rounded-[12px] px-4 py-4 print-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <span className="text-sm font-medium text-[#0D1726]">{FOUNDATION_LABELS[item.theme]}</span>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${getFoundationBadgeStyle(label)}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed scores — collapsible */}
        <details className="mb-12 bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] print-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <summary className="detailed-context-summary cursor-pointer px-5 py-4 text-sm font-semibold text-[#4F68FF]">
            See detailed scores and benchmark context
          </summary>
          <div className="detailed-context-content px-5 pb-5">
            <h2 className="text-lg font-bold font-heading text-[#0D1726] mb-2">Detailed context</h2>
            <p className="text-sm text-[#748094] mb-5">Higher visible scores indicate stronger operational efficiency.</p>
            <div id="scores-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <ScoreCard label="Overall Efficiency" value={displayOverall} tooltip={SCORE_TOOLTIPS.overall} accent />
              <BenchmarkGapBadge gap={benchmarkResult.gap} gapLabel={benchmarkResult.gapLabel} derivationNote={benchmarkResult.derivationNote} />
              <ScoreCard label="Cost Efficiency" value={displaySavings} tooltip={SCORE_TOOLTIPS.savings} />
              <ScoreCard label="Growth & Capacity" value={displayGrowth} tooltip={SCORE_TOOLTIPS.growth} />
            </div>
            <AreaScoreBars areaScores={areaScores} />
            <div className="mt-4 p-4 bg-[rgba(20,35,55,0.04)] border border-[rgba(20,35,55,0.10)] rounded-[12px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#748094] mb-1.5">Assessment context</p>
              <p className="text-sm text-[#3B4960] leading-relaxed">{tldrHeadline}</p>
            </div>
          </div>
        </details>

        {/* Supporting opportunity detail */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold font-heading text-[#0D1726]">Supporting opportunity detail</h2>
            <div className="flex-1 h-px bg-[rgba(20,35,55,0.10)]" />
          </div>
          <div className="flex flex-col gap-4">
            {topOpportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}
          </div>
        </section>

        {/* Recommended next step CTA */}
        <div className="no-print mb-8 p-7 sm:p-8 rounded-[24px] text-white" style={DARK_PANEL_STYLE}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7B9CFF] mb-2">Recommended next step</p>
          <h3 className="text-2xl font-extrabold font-heading mb-2 tracking-tight">
            {recommendationBlock.nextMove.replace('Recommended next move: ', '').replace(/\.$/, '')}
          </h3>
          <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-xl">
            Validate the directional value range, confirm workflow scope, and define measurable pilot outcomes with the relevant team.
          </p>
          <Button size="lg" className="!bg-white !text-[#0D1726] hover:!bg-white/90 !border-0">
            Scope the Recommended Pilot
          </Button>
        </div>

        {/* Confidence note */}
        <div className="p-5 bg-[rgba(20,35,55,0.04)] border border-[rgba(20,35,55,0.10)] rounded-[12px] print-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#748094] mb-2">About This Report</p>
          <p className="text-xs text-[#748094] leading-relaxed">{confidenceNote}</p>
        </div>

      </div>
    </div>
  );
}
