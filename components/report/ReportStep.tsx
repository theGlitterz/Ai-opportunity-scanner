'use client';

import React from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { formatCompactCurrencyRange } from '../../lib/formatters';
import { buildContextExplanation, buildLeverReason, buildRecommendationReason, getReportInputs } from '../../lib/report/presentation';
import { sendScanEvent, type ScanSummary } from '../../lib/scan-client';
import type { ProfitLeverResult } from '../../types';
import { Button } from '../ui/Button';
import { VRiseLogo } from '../ui/VRiseLogo';
import { WorkflowExplorer } from './WorkflowExplorer';

const DARK_PANEL_STYLE = {
  background: 'radial-gradient(circle at 82% 12%, rgba(79,104,255,.28), transparent 38%), linear-gradient(135deg, #07111F 0%, #0D1E3D 100%)',
  boxShadow: '0 12px 34px rgba(7,17,31,.16)',
};

function SectionHeading({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg sm:text-xl font-bold font-heading text-[#0D1726] tracking-tight">{title}</h2>
      {copy && <p className="text-sm text-[#748094] mt-1.5 max-w-3xl leading-relaxed">{copy}</p>}
    </div>
  );
}

function MetricCard({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className={`rounded-[14px] p-4 border ${accent ? 'bg-[#4F68FF] border-[#4F68FF] text-white' : 'bg-white border-[rgba(20,35,55,.10)] text-[#0D1726]'}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${accent ? 'text-white/70' : 'text-[#748094]'}`}>{label}</p>
      <p className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight [overflow-wrap:anywhere]">{value}</p>
      <p className={`text-[11px] mt-1.5 leading-relaxed ${accent ? 'text-white/70' : 'text-[#748094]'}`}>{note}</p>
    </div>
  );
}

function LeverCard({ lever, rank, reason }: { lever: ProfitLeverResult; rank: number; reason: string }) {
  return (
    <article className="bg-white border border-[rgba(20,35,55,.10)] rounded-[16px] p-5 flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-full bg-[#0D1726] text-white text-[11px] font-bold flex items-center justify-center">{rank}</span>
        <h3 className="text-base font-bold font-heading text-[#0D1726] leading-snug">{lever.name}</h3>
      </div>
      <p className="text-xl font-extrabold font-heading text-[#4F68FF] mb-4">{formatCompactCurrencyRange(lever.valueLow, lever.valueHigh)}</p>
      <div className="space-y-3 text-sm leading-relaxed">
        <div><p className="text-[10px] uppercase tracking-wider font-semibold text-[#748094] mb-1">Why this appeared</p><p className="text-[#3B4960]">{reason}</p></div>
        <div><p className="text-[10px] uppercase tracking-wider font-semibold text-[#748094] mb-1">What AI could do</p><p className="text-[#3B4960]">{lever.exampleImplementation}</p></div>
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-4">
        <span className="rounded-full bg-[rgba(16,168,121,.10)] text-[#087D5B] px-2.5 py-1 text-[11px] font-semibold">Speed to value: {lever.speedToValue}</span>
        <span className="rounded-full bg-[rgba(20,35,55,.06)] text-[#59667A] px-2.5 py-1 text-[11px] font-semibold">Complexity: {lever.complexity}</span>
      </div>
    </article>
  );
}

function ExecutiveReviewForm({ scan }: { scan: ScanSummary }) {
  const [form, setForm] = React.useState({ name: '', email: '', company: scan.profile.companyName, role: '', website: '', marketingOptIn: false });
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  function updateField(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    try {
      await sendScanEvent({ eventType: 'contact_requested', ...scan, contact: form });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-[10px] border border-[rgba(20,35,55,.16)] bg-white px-3 py-2.5 text-sm text-[#0D1726] outline-none transition focus:border-[#4F68FF] focus:ring-2 focus:ring-[rgba(79,104,255,.12)]';

  return (
    <section className="no-print mb-4 rounded-[18px] border border-[rgba(20,35,55,.10)] bg-white p-5 sm:p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-lg sm:text-xl font-bold font-heading text-[#0D1726]">Review these findings with VRise</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[#59667A]">Discuss the assumptions, validate the highest-value workflow, and determine whether it is worth taking into a focused pilot.</p>
      {status === 'success' ? (
        <div className="mt-5 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Thank you. Your executive review request has been received, and VRise will respond using the details you provided.</div>
      ) : (
        <form className="mt-5" onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#3B4960]">Name<span className="text-red-600"> *</span><input className={inputClass} name="name" value={form.name} onChange={updateField} required maxLength={150} autoComplete="name" /></label>
            <label className="text-xs font-semibold text-[#3B4960]">Work email<span className="text-red-600"> *</span><input className={inputClass} name="email" value={form.email} onChange={updateField} required maxLength={254} type="email" autoComplete="email" /></label>
            <label className="text-xs font-semibold text-[#3B4960]">Company<input className={inputClass} name="company" value={form.company} onChange={updateField} maxLength={200} autoComplete="organization" /></label>
            <label className="text-xs font-semibold text-[#3B4960]">Role <span className="font-normal text-[#748094]">(optional)</span><input className={inputClass} name="role" value={form.role} onChange={updateField} maxLength={150} autoComplete="organization-title" /></label>
          </div>
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label>Website<input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" /></label></div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-[#3B4960]"><input className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#4F68FF]" type="checkbox" name="marketingOptIn" checked={form.marketingOptIn} onChange={updateField} /><span>Send me occasional practical AI insights from VRise.</span></label>
          <p className="mt-3 text-xs leading-relaxed text-[#748094]">We’ll use these details to respond about this assessment. We won’t add you to a marketing list unless you select the option above.</p>
          {status === 'error' && <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">We couldn’t submit your request. Please check your details and try again.</div>}
          <button type="submit" disabled={status === 'submitting'} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#4F68FF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3D55DF] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{status === 'submitting' ? 'Submitting…' : 'Request an executive review'}</button>
        </form>
      )}
    </section>
  );
}

export function ReportStep() {
  const { state, dispatch } = useAssessment();
  const { results, profile, responses, scan, referralSource } = state;
  const notificationStarted = React.useRef(false);

  React.useEffect(() => {
    if (!results || !scan || notificationStarted.current) return;
    const storageKey = `vrise-scan-notified:${scan.id}`;
    if (sessionStorage.getItem(storageKey)) return;
    notificationStarted.current = true;
    sendScanEvent({ eventType: 'scan_completed', scanId: scan.id, completedAt: scan.completedAt, referralSource, profile, answers: responses, report: results })
      .then(() => sessionStorage.setItem(storageKey, '1'))
      .catch(() => { notificationStarted.current = false; });
  }, [results, scan, referralSource, profile, responses]);

  if (!results) return null;

  const reportInputs = getReportInputs(profile, responses);
  const contextExplanation = buildContextExplanation(profile, responses);
  const recommendationReason = buildRecommendationReason(results.recommendation.leverId, results.allLevers, profile, responses);
  const reportDate = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  const reportOwner = (profile.companyName ?? '').trim() || 'Prepared by Vrise';
  const executiveHeadline = results.opportunityLevel === 'Very High'
    ? 'High-value AI profit opportunity identified'
    : results.opportunityLevel === 'Low'
      ? 'Targeted AI profit opportunity identified'
      : 'Significant AI profit opportunity identified';
  const topLeverNames = results.topLevers.map(lever => lever.name.toLowerCase());
  const topLeverSummary = topLeverNames.length === 3
    ? `${topLeverNames[0]}, ${topLeverNames[1]}, and ${topLeverNames[2]}`
    : topLeverNames.join(' and ');
  const scanSummary: ScanSummary | null = scan ? { scanId: scan.id, completedAt: scan.completedAt, referralSource, profile, answers: responses, report: results } : null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_STEP', step: 'assessment' })}>← Back to diagnostic</Button>
        <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => window.print()}>Print / Save PDF</Button><Button size="sm" onClick={() => dispatch({ type: 'RESET' })}>New scan</Button></div>
      </div>

      <div id="report-content">
        <header className="flex items-start justify-between gap-5 mb-5 pb-4 border-b border-[rgba(20,35,55,.10)]">
          <div><VRiseLogo variant="full-color" height={25} className="mb-3" /><h1 className="text-xl sm:text-2xl font-bold font-heading text-[#0D1726] tracking-tight">AI Profit Opportunity Report</h1><p className="text-xs text-[#748094] mt-1.5">{reportOwner} · {reportDate}</p></div>
          <span className="hidden sm:inline-flex rounded-full bg-[rgba(16,168,121,.10)] text-[#087D5B] px-3 py-1.5 text-xs font-semibold">{results.confidence} confidence</span>
        </header>

        <section className="rounded-[20px] p-6 sm:p-8 text-white mb-4 print-card" style={DARK_PANEL_STYLE}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8EA5FF] mb-2">Executive result</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight leading-tight">{executiveHeadline}</h2>
          <p className="text-sm text-white/72 leading-relaxed mt-3 max-w-3xl">Based on your company size, sector, business model, and operating maturity, Vrise estimates a meaningful opportunity to improve profit through AI-enabled workflows.</p>
          <p className="text-sm text-white/72 leading-relaxed mt-1.5 max-w-3xl">The largest value pools appear in {topLeverSummary}.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <MetricCard accent label="Estimated annual opportunity" value={formatCompactCurrencyRange(results.annualOpportunity.low, results.annualOpportunity.high)} note="Directional value pool to validate" />
          <MetricCard label="EBITDA-equivalent impact" value={`${results.marginImpact.low}–${results.marginImpact.high}%`} note="Indicative profit/margin potential" />
          <MetricCard label="Confidence" value={results.confidence} note="Based on workflow clarity, selected inputs, and AI readiness signals" />
        </section>
        <div className="mb-9 rounded-[12px] border border-[rgba(20,35,55,.08)] bg-white/65 px-4 py-3 text-xs text-[#59667A] leading-relaxed">
          <p>The annual opportunity is the estimated value pool across revenue uplift, cost efficiency, operating capacity, working-capital improvement, and risk leakage reduction. EBITDA-equivalent impact is directional and would be validated during a paid pilot using real workflows, tools, and business data.</p>
          <p className="mt-1">This is not a guaranteed saving figure.</p>
        </div>

        <section className="mb-9">
          <SectionHeading title="What we based this on" copy="These inputs determine the sector weighting, scale, opportunity range, implementation complexity, and confidence level." />
          <div className="bg-white border border-[rgba(20,35,55,.10)] rounded-[16px] p-4 sm:p-5 print-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {reportInputs.map(item => <div key={item.label}><p className="text-[9px] uppercase tracking-wider font-semibold text-[#748094] mb-1">{item.label}</p><div className="flex flex-wrap gap-1">{item.values.map(value => <span key={value} className="rounded-full bg-[rgba(79,104,255,.08)] text-[#334ED8] px-2 py-1 text-[10px] font-semibold leading-tight">{value}</span>)}</div></div>)}
            </div>
            <p className="mt-4 pt-4 border-t border-[rgba(20,35,55,.08)] text-sm text-[#3B4960] leading-relaxed">{contextExplanation}</p>
          </div>
        </section>

        <section className="mb-9">
          <SectionHeading title="Top 3 AI profit opportunities" copy="These are the highest-value areas indicated by your selected profile and operating pressures." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">{results.topLevers.map((lever, index) => <LeverCard key={lever.id} lever={lever} rank={index + 1} reason={buildLeverReason(lever.id, profile, responses)} />)}</div>
        </section>

        <section className="mb-9 p-5 sm:p-6 rounded-[18px] bg-[rgba(79,104,255,.055)] border border-[rgba(79,104,255,.16)] print-card">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#4F68FF] mb-1.5">Recommended first area</p>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[#0D1726]">{results.recommendation.area}</h2>
          <p className="text-sm text-[#3B4960] leading-relaxed mt-2 max-w-3xl">{recommendationReason} In a paid pilot, Vrise would inspect the current workflow, available data, leakage points, and practical automation boundary.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
            {['Where work currently drops or slows', 'What data and system access are available', 'What can be automated safely', 'Expected impact and implementation effort'].map(item => <div key={item} className="flex items-start gap-2 text-sm text-[#3B4960]"><span className="text-[#4F68FF]">✓</span><span>{item}</span></div>)}
          </div>
          <p className="text-xs text-[#59667A] mt-4 pt-4 border-t border-[rgba(79,104,255,.14)]"><strong className="text-[#0D1726]">Client output:</strong> {results.recommendation.output}</p>
        </section>

        <section className="mb-9 no-print"><SectionHeading title="Explore example AI workflows" copy="Open any function to walk through incoming work, AI output, human review, and an illustrative pilot outcome." /><WorkflowExplorer /></section>

        {scanSummary && <ExecutiveReviewForm scan={scanSummary} />}

        <section className="no-print rounded-[20px] p-6 sm:p-7 text-white mb-7" style={DARK_PANEL_STYLE}>
          <h2 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">Discuss your AI opportunity report</h2>
          <p className="text-sm text-white/70 mt-2 mb-5 max-w-2xl leading-relaxed">Walk through the estimate, validate the biggest workflow opportunity, and decide whether a paid pilot is worth doing.</p>
          <div className="flex flex-col sm:flex-row gap-2.5"><a href="mailto:hello@vrise.tech?subject=Discuss%20my%20AI%20Opportunity%20Report" className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#0D1726] rounded-full text-sm font-semibold hover:bg-white/90">Discuss this report</a><a href="mailto:hello@vrise.tech?subject=Vrise%20AI%20Opportunity%20Pilot" className="inline-flex items-center justify-center px-5 py-2.5 border border-white/25 text-white rounded-full text-sm font-semibold hover:bg-white/10">Book a Vrise AI Opportunity Pilot</a></div>
        </section>

        <section className="p-4 bg-[rgba(20,35,55,.035)] border border-[rgba(20,35,55,.09)] rounded-[14px] print-card">
          <h2 className="text-sm font-bold font-heading text-[#0D1726] mb-1.5">How to read these numbers</h2>
          <p className="text-xs text-[#59667A] leading-relaxed">These estimates are indicative and based on your selected company profile, sector patterns, operating maturity, and AI readiness. They are not guaranteed savings or a financial forecast. Vrise validates the opportunity during a paid pilot using real workflows, tools, and business data.</p>
          <ul className="space-y-1 mt-2">{results.assumptions.map(item => <li key={item} className="text-[10px] text-[#748094] leading-relaxed">• {item}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
