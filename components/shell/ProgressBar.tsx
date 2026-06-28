'use client';
import React from 'react';
import type { AppStep } from '../../types';

const STEPS: { id: AppStep; label: string }[] = [
  { id: 'profile', label: 'Company' },
  { id: 'assessment', label: 'Diagnostic' },
  { id: 'report', label: 'Opportunity Report' },
];

const STEP_ORDER: AppStep[] = ['profile', 'assessment', 'report'];

export function ProgressBar({ currentStep }: { currentStep: AppStep }) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${isComplete ? 'bg-[#4F68FF] text-white' : isCurrent ? 'bg-[#4F68FF] text-white ring-2 ring-[rgba(79,104,255,0.28)]' : 'bg-[rgba(20,35,55,0.08)] text-[#748094]'}`}>
                {isComplete ? (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${isCurrent ? 'text-[#0D1726]' : 'text-[#748094]'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px transition-all ${i < currentIndex ? 'bg-[#4F68FF]' : 'bg-[rgba(20,35,55,0.10)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
