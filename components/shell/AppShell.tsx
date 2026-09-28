'use client';
import React from 'react';
import { AssessmentProvider, useAssessment } from '../../context/AssessmentContext';
import { ProfileStep } from '../profile/ProfileStep';
import { AssessmentStep } from '../assessment/AssessmentStep';
import { ReportStep } from '../report/ReportStep';
import { ProgressBar } from './ProgressBar';
import { VRiseLogo } from '../ui/VRiseLogo';

function AppContent() {
  const { state, dispatch } = useAssessment();
  const { step } = state.ui;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  React.useEffect(() => {
    const referralSource = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 100) ?? '';
    dispatch({ type: 'SET_REFERRAL_SOURCE', referralSource });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#EEF2F8]">
      <header className="no-print border-b border-[rgba(20,35,55,0.10)] bg-white/90 backdrop-blur-sm sticky top-0 z-40" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <VRiseLogo variant="full-color" height={30} />
          <ProgressBar currentStep={step} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {step === 'profile' && <ProfileStep />}
        {step === 'assessment' && <AssessmentStep />}
        {step === 'report' && <ReportStep />}
      </main>
    </div>
  );
}

export default function AppShell() {
  return (
    <AssessmentProvider>
      <AppContent />
    </AssessmentProvider>
  );
}
