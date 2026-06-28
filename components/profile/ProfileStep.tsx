'use client';

import { useAssessment, useProfile } from '../../context/AssessmentContext';
import { PROFILE_QUESTIONS } from '../../data/scanner-questions';
import type { ScannerProfile } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormFields';

const REQUIRED_FIELDS: (keyof ScannerProfile)[] = ['sector', 'revenueBand', 'employeeBand', 'geography', 'revenueModel', 'operatingModel'];

export function ProfileStep() {
  const { dispatch } = useAssessment();
  const { profile, errors, setField } = useProfile();

  function handleContinue() {
    const nextErrors: Partial<Record<keyof ScannerProfile, string>> = {};
    for (const field of REQUIRED_FIELDS) if (!profile[field]) nextErrors[field] = 'Select an option to continue';
    if (Object.keys(nextErrors).length) {
      dispatch({ type: 'SET_PROFILE_ERRORS', errors: nextErrors });
      return;
    }
    dispatch({ type: 'SET_STEP', step: 'assessment' });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4F68FF] mb-3">AI Profit Opportunity Scanner · Step 1 of 3</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1726] mb-3 tracking-tight leading-[1.1]">Find where AI can increase profit, reduce operating drag, and unlock capacity.</h1>
        <p className="text-[#3B4960] text-sm sm:text-base leading-relaxed max-w-2xl">Answer 12 focused questions about company scale, operating pressure, and implementation readiness.</p>
      </div>

      <div className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] p-5 sm:p-7" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="mb-6 pb-6 border-b border-[rgba(20,35,55,0.08)]">
          <Input label="Company name (optional)" placeholder="e.g. Acme Group" value={profile.companyName} onChange={event => setField('companyName', event.target.value)} />
        </div>

        <section>
          <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#4F68FF] mb-1">Step 1 · Company profile</p><h2 className="text-base font-bold font-heading text-[#0D1726]">Company scale and market</h2><p className="text-xs text-[#748094] mt-1">This helps estimate company scale and sector-specific AI opportunity.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PROFILE_QUESTIONS.filter(question => question.section === 'Company profile').map(question => (
            <Select
              key={question.id}
              label={question.text}
              options={question.options}
              value={String(profile[question.id as keyof ScannerProfile] ?? '')}
              onChange={event => setField(question.id as keyof ScannerProfile, event.target.value)}
              error={errors[question.id as keyof ScannerProfile]}
              className={question.id === 'sector' ? 'sm:col-span-2' : ''}
            />
            ))}
          </div>
        </section>

        <section className="mt-7 pt-6 border-t border-[rgba(20,35,55,0.08)]">
          <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#4F68FF] mb-1">Step 2 · How the business runs</p><h2 className="text-base font-bold font-heading text-[#0D1726]">Revenue and delivery model</h2><p className="text-xs text-[#748094] mt-1">This helps identify where revenue, delivery, or operating leakage may appear.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PROFILE_QUESTIONS.filter(question => question.section === 'Operating model').map(question => (
              <Select key={question.id} label={question.text} options={question.options} value={String(profile[question.id as keyof ScannerProfile] ?? '')} onChange={event => setField(question.id as keyof ScannerProfile, event.target.value)} error={errors[question.id as keyof ScannerProfile]} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-[#748094]">6 of 12 questions · approximately 3 minutes</p>
        <Button size="lg" onClick={handleContinue}>Assess operating opportunity <span className="ml-2" aria-hidden>→</span></Button>
      </div>
    </div>
  );
}
