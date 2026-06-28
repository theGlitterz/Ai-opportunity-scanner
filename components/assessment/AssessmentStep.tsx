'use client';

import { useAssessment, useResponses } from '../../context/AssessmentContext';
import { DIAGNOSTIC_QUESTIONS, SCANNER_QUESTIONS } from '../../data/scanner-questions';
import { runProfitOpportunityEngine } from '../../lib/profit-opportunity-engine';
import type { ScannerQuestion } from '../../types';
import { Button } from '../ui/Button';

function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`text-left px-4 py-3 rounded-[12px] border text-sm font-medium transition-all ${selected
        ? 'bg-[rgba(79,104,255,0.08)] border-[#4F68FF] text-[#263FDD] ring-1 ring-[rgba(79,104,255,0.15)]'
        : 'bg-white border-[rgba(20,35,55,0.13)] text-[#3B4960] hover:border-[rgba(79,104,255,0.55)] hover:text-[#0D1726]'}`}>
      <span className="flex items-start gap-2.5"><span className={`mt-0.5 w-4 h-4 flex-shrink-0 border flex items-center justify-center ${selected ? 'rounded-full bg-[#4F68FF] border-[#4F68FF]' : 'rounded-[5px] border-[rgba(20,35,55,0.25)]'}`}>{selected && <span className="text-white text-[10px]">✓</span>}</span>{label}</span>
    </button>
  );
}

function QuestionCard({ question, index }: { question: ScannerQuestion; index: number }) {
  const { responses, setAnswer } = useResponses();
  const current = responses[question.id];
  const selectedValues = Array.isArray(current) ? current : [];

  function select(value: string) {
    if (question.type === 'single') {
      setAnswer(question.id, value);
      return;
    }
    if (value === 'not-sure') {
      setAnswer(question.id, selectedValues.includes(value) ? [] : [value]);
      return;
    }
    const withoutUnsure = selectedValues.filter(item => item !== 'not-sure');
    if (withoutUnsure.includes(value)) setAnswer(question.id, withoutUnsure.filter(item => item !== value));
    else if (question.id === 'valuePriorities' && withoutUnsure.length >= 3) return;
    else setAnswer(question.id, [...withoutUnsure, value]);
  }

  return (
    <article className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] p-5 sm:p-7" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-start gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-[#0D1726] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{index}</span>
        <div><h2 className="text-base font-bold font-heading text-[#0D1726]">{question.text}</h2>{question.helperText && <p className="text-xs text-[#748094] mt-1">{question.helperText}</p>}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {question.options.map(item => <ChoiceButton key={item.value} label={item.label} selected={Array.isArray(current) ? current.includes(item.value) : current === item.value} onClick={() => select(item.value)} />)}
      </div>
    </article>
  );
}

export function AssessmentStep() {
  const { state, dispatch } = useAssessment();
  const { responses } = useResponses();
  const isAnswered = (question: ScannerQuestion) => Array.isArray(responses[question.id]) ? (responses[question.id] as string[]).length > 0 : Boolean(responses[question.id]);
  const answered = DIAGNOSTIC_QUESTIONS.filter(isAnswered).length;
  const allAnswered = answered === DIAGNOSTIC_QUESTIONS.length;
  const profitQuestions = DIAGNOSTIC_QUESTIONS.filter(question => question.section === 'Profit pressure');
  const maturityQuestions = DIAGNOSTIC_QUESTIONS.filter(question => question.section === 'Readiness');

  function generateReport() {
    if (!allAnswered) {
      dispatch({ type: 'SET_ASSESSMENT_ERROR', error: `Complete all ${SCANNER_QUESTIONS.length} questions to generate the report.` });
      return;
    }
    const results = runProfitOpportunityEngine(state.profile, responses);
    dispatch({ type: 'SET_RESULTS', results });
    dispatch({ type: 'SET_STEP', step: 'report' });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4F68FF] mb-3">AI Profit Opportunity Scanner · Step 2 of 3</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1726] mb-3 tracking-tight">Operating opportunity diagnostic</h1>
        <p className="text-[#3B4960] text-sm sm:text-base leading-relaxed max-w-2xl">Estimate where revenue, margin, working capital, capacity, and risk outcomes are being constrained today.</p>
        <div className="mt-5 flex items-center gap-3"><div className="flex-1 h-1.5 bg-[rgba(20,35,55,0.08)] rounded-full overflow-hidden"><div className="h-full bg-[#4F68FF] transition-all" style={{ width: `${50 + (answered / DIAGNOSTIC_QUESTIONS.length) * 50}%` }} /></div><span className="text-xs font-medium text-[#748094]">{6 + answered} / 12</span></div>
      </div>

      <section className="mb-7">
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#4F68FF] mb-1">Step 3 · Where profit leaks</p><h2 className="text-lg font-bold font-heading text-[#0D1726]">Value and team pressure</h2><p className="text-xs text-[#748094] mt-1 max-w-2xl">This helps prioritise the business functions where AI may create the most financial impact.</p></div>
        <div className="flex flex-col gap-3">{profitQuestions.map((question, index) => <QuestionCard key={question.id} question={question} index={index + 7} />)}</div>
      </section>

      <section>
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#4F68FF] mb-1">Step 4 · Operating maturity</p><h2 className="text-lg font-bold font-heading text-[#0D1726]">Readiness and implementation conditions</h2><p className="text-xs text-[#748094] mt-1 max-w-2xl">This helps estimate implementation complexity, confidence, and speed to value.</p></div>
        <div className="flex flex-col gap-3">{maturityQuestions.map((question, index) => <QuestionCard key={question.id} question={question} index={index + 9} />)}</div>
      </section>
      {state.ui.assessmentError && <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-red-700">{state.ui.assessmentError}</div>}
      <div className="flex items-center justify-between pt-7 pb-10">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'profile' })}>← Back</Button>
        <Button size="lg" onClick={generateReport} disabled={!allAnswered}>Generate profit opportunity report <span className="ml-2">→</span></Button>
      </div>
    </div>
  );
}
