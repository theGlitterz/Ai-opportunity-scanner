'use client';
import React, { useMemo } from 'react';
import { useAssessment, useResponses } from '../../context/AssessmentContext';
import { QUESTIONS } from '../../data/questions';
import { BUSINESS_AREAS } from '../../types';
import { FREQUENCY_LABELS, SEVERITY_LABELS } from '../../types';
import { Button } from '../ui/Button';
import { runScoringEngine } from '../../lib/engine';
import type { ScaleValue, BusinessArea } from '../../types';

function ScaleButton({ label, value, selected, onClick }: {
  label: string; value: ScaleValue; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-0 px-2 py-2 text-xs font-medium rounded-[10px] border transition-all duration-100 text-center leading-tight font-sans
        ${selected
          ? 'bg-[#4F68FF] border-[#4F68FF] text-white shadow-vrise-sm'
          : 'bg-white border-[rgba(20,35,55,0.16)] text-[#3B4960] hover:border-[#4F68FF] hover:text-[#4F68FF]'
        }`}
    >
      {label}
    </button>
  );
}

function QuestionCard({ question, value, onSelect, index }: {
  question: typeof QUESTIONS[0];
  value: ScaleValue | undefined;
  onSelect: (v: ScaleValue) => void;
  index: number;
}) {
  const labels = question.scaleType === 'frequency' ? FREQUENCY_LABELS : SEVERITY_LABELS;
  const scaleLabel = question.scaleType === 'frequency' ? 'Frequency' : 'Severity';

  return (
    <div className={`bg-white border rounded-[12px] p-5 transition-colors ${value ? 'border-[rgba(79,104,255,0.30)]' : 'border-[rgba(20,35,55,0.10)]'}`} style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(79,104,255,0.10)] text-[#4F68FF] text-xs font-semibold flex items-center justify-center mt-0.5">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0D1726] leading-snug mb-1.5">{question.text}</p>
          <p className="text-xs text-[#748094] leading-relaxed">{question.helperText}</p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-[#748094] bg-[rgba(20,35,55,0.05)] px-2 py-0.5 rounded-full">
          {scaleLabel}
        </span>
      </div>

      <div className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as ScaleValue[]).map(v => (
          <ScaleButton
            key={v}
            label={labels[v]}
            value={v}
            selected={value === v}
            onClick={() => onSelect(v)}
          />
        ))}
      </div>

      {value && (
        <div className="mt-2 flex justify-end">
          <span className="text-[10px] text-[#10A879] font-medium">✓ Answered</span>
        </div>
      )}
    </div>
  );
}

function AreaSection({ area, questionOffset }: { area: BusinessArea; questionOffset: number }) {
  const { responses, setAnswer } = useResponses();
  const areaQuestions = QUESTIONS.filter(q => q.area === area);

  const AREA_ICONS: Record<BusinessArea, string> = {
    'People': '◎',
    'Finance': '◈',
    'Operations': '◆',
    'Customer': '◉',
    'Systems & IT': '◇',
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[#4F68FF] text-lg">{AREA_ICONS[area]}</span>
        <h2 className="text-base font-bold font-heading text-[#0D1726] tracking-tight">{area}</h2>
        <div className="flex-1 h-px bg-[rgba(20,35,55,0.10)]" />
        <span className="text-xs text-[#748094]">
          {areaQuestions.filter(q => responses[q.id]).length} / {areaQuestions.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {areaQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            value={responses[q.id]}
            onSelect={v => setAnswer(q.id, v)}
            index={questionOffset + i + 1}
          />
        ))}
      </div>
    </div>
  );
}

export function AssessmentStep() {
  const { state, dispatch } = useAssessment();
  const { responses } = useResponses();

  const answeredCount = QUESTIONS.filter(q => responses[q.id] !== undefined).length;
  const totalCount = QUESTIONS.length;
  const allAnswered = answeredCount === totalCount;
  const progressPct = Math.round((answeredCount / totalCount) * 100);

  const areaOffsets = useMemo(() => {
    const offsets: Record<BusinessArea, number> = {} as Record<BusinessArea, number>;
    let offset = 0;
    for (const area of BUSINESS_AREAS) {
      offsets[area] = offset;
      offset += QUESTIONS.filter(q => q.area === area).length;
    }
    return offsets;
  }, []);

  function handleGenerateReport() {
    if (!allAnswered) {
      dispatch({ type: 'SET_ASSESSMENT_ERROR', error: 'Please answer all 15 questions before generating the report.' });
      return;
    }
    dispatch({ type: 'SET_ASSESSMENT_ERROR', error: null });
    const results = runScoringEngine(state.profile as any, responses);
    dispatch({ type: 'SET_RESULTS', results });
    dispatch({ type: 'SET_STEP', step: 'report' });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4F68FF] mb-3">Step 2 of 3</p>
        <h1 className="text-3xl font-extrabold font-heading text-[#0D1726] mb-3 tracking-tight">
          Assessment
        </h1>
        <p className="text-[#3B4960] text-sm leading-relaxed max-w-lg mb-5">
          Rate each area based on current operational reality. Higher responses indicate greater friction and AI opportunity.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[rgba(20,35,55,0.08)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F68FF] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-[#748094] w-24 text-right">
            {answeredCount} of {totalCount} answered
          </span>
        </div>
      </div>

      {BUSINESS_AREAS.map(area => (
        <AreaSection key={area} area={area} questionOffset={areaOffsets[area]} />
      ))}

      {state.ui.assessmentError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-red-600">
          {state.ui.assessmentError}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 pb-10">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'profile' })}>
          <svg className="mr-2" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleGenerateReport}
          disabled={!allAnswered}
        >
          Generate Report
          <svg className="ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}
