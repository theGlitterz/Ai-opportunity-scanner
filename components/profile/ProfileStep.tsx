'use client';
import React, { useState } from 'react';
import { useAssessment, useProfile } from '../../context/AssessmentContext';
import { Button } from '../ui/Button';
import { Select, Input } from '../ui/FormFields';
import {
  INDUSTRY_CLUSTER_OPTIONS, REVENUE_BAND_OPTIONS, EMPLOYEE_BAND_OPTIONS,
  BUSINESS_PRIORITY_OPTIONS, OPERATING_MODEL_OPTIONS, GEOGRAPHY_OPTIONS, AI_USAGE_OPTIONS,
} from '../../data/profile-options';
import type { CompanyProfile } from '../../types';

const REQUIRED_FIELDS: (keyof CompanyProfile)[] = [
  'companyName', 'industryCluster', 'revenueBand', 'employeeBand',
  'businessPriority', 'operatingModel', 'geography', 'currentAIUsage',
];

const FIELD_LABELS: Partial<Record<keyof CompanyProfile, string>> = {
  companyName: 'Company name',
  industryCluster: 'Industry',
  revenueBand: 'Revenue range',
  employeeBand: 'Employee band',
  businessPriority: 'Primary business priority',
  operatingModel: 'Operating model',
  geography: 'Geography',
  currentAIUsage: 'Current AI usage',
};

export function ProfileStep() {
  const { dispatch } = useAssessment();
  const { profile, errors, setField } = useProfile();
  const [notesOpen, setNotesOpen] = useState(false);

  function validate(): Partial<Record<keyof CompanyProfile, string>> {
    const errs: Partial<Record<keyof CompanyProfile, string>> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!profile[field]) {
        errs[field] = `${FIELD_LABELS[field] ?? field} is required`;
      }
    }
    return errs;
  }

  function handleContinue() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      dispatch({ type: 'SET_PROFILE_ERRORS', errors: errs });
      return;
    }
    dispatch({ type: 'SET_STEP', step: 'assessment' });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4F68FF] mb-3">Step 1 of 3</p>
        <h1 className="text-3xl font-extrabold font-heading text-[#0D1726] mb-3 tracking-tight">
          Company Profile
        </h1>
        <p className="text-[#3B4960] text-sm leading-relaxed max-w-lg">
          Complete the profile below to calibrate the assessment against your business context. All fields are required.
        </p>
      </div>

      <div className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] p-8" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Group"
            value={profile.companyName}
            onChange={e => setField('companyName', e.target.value)}
            error={errors.companyName}
            className="sm:col-span-2"
          />

          <Select
            label="Industry"
            options={INDUSTRY_CLUSTER_OPTIONS}
            value={profile.industryCluster}
            onChange={e => setField('industryCluster', e.target.value)}
            error={errors.industryCluster}
          />

          <Select
            label="Annual Revenue"
            options={REVENUE_BAND_OPTIONS}
            value={profile.revenueBand}
            onChange={e => setField('revenueBand', e.target.value)}
            error={errors.revenueBand}
          />

          <Select
            label="Employees"
            options={EMPLOYEE_BAND_OPTIONS}
            value={profile.employeeBand}
            onChange={e => setField('employeeBand', e.target.value)}
            error={errors.employeeBand}
          />

          <Select
            label="Geography"
            options={GEOGRAPHY_OPTIONS}
            value={profile.geography}
            onChange={e => setField('geography', e.target.value)}
            error={errors.geography}
          />

          <Select
            label="Primary Business Priority"
            options={BUSINESS_PRIORITY_OPTIONS}
            value={profile.businessPriority}
            onChange={e => setField('businessPriority', e.target.value)}
            error={errors.businessPriority}
            className="sm:col-span-2"
          />

          <Select
            label="Operating Model"
            options={OPERATING_MODEL_OPTIONS}
            value={profile.operatingModel}
            onChange={e => setField('operatingModel', e.target.value)}
            error={errors.operatingModel}
          />

          <Select
            label="Current AI Usage"
            options={AI_USAGE_OPTIONS}
            value={profile.currentAIUsage}
            onChange={e => setField('currentAIUsage', e.target.value)}
            error={errors.currentAIUsage}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-[rgba(20,35,55,0.08)]">
          <button
            type="button"
            onClick={() => setNotesOpen(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#748094] hover:text-[#3B4960] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${notesOpen ? 'rotate-90' : ''}`}>
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Consultant Notes
            <span className="normal-case tracking-normal font-normal text-[#748094]">— internal only, not shown in report</span>
          </button>
          {notesOpen && (
            <div className="mt-3">
              <textarea
                value={profile.consultantNotes ?? ''}
                onChange={e => setField('consultantNotes', e.target.value)}
                placeholder="Add any internal context, pre-assessment observations, or session notes here…"
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-[12px] border border-[rgba(20,35,55,0.16)] bg-[rgba(20,35,55,0.02)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,104,255,0.28)] transition-all resize-none text-[#0D1726] placeholder:text-[#748094] font-sans"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleContinue}>
          Begin Assessment
          <svg className="ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}
