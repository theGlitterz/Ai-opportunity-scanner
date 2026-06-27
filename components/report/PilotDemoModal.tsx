'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PilotDemo, StepContent, BadgeVariant } from '../../data/pilot-demos';
import { Button } from '../ui/Button';
import { Badge } from '../ui/FormFields';

type Props = {
  demo: PilotDemo;
  onClose: () => void;
};

function badgeVariantForValue(val: string): BadgeVariant {
  const v = val.toLowerCase();
  if (v === 'matched' || v === 'renew' || v === 'high') return 'accent';
  if (
    v.includes('cancel') ||
    v === 'unmatched' ||
    v === 'duplicate' ||
    v === 'low' ||
    v === 'overdue'
  )
    return 'warm';
  if (v === 'medium' || v === 'unknown' || v.includes('partial')) return 'neutral';
  return 'default';
}

function StepContentRenderer({
  content,
  outcomePoints,
  resolvedItems,
  onResolve,
}: {
  content: StepContent;
  outcomePoints: string[];
  resolvedItems: Record<string, string>;
  onResolve: (title: string, option: string) => void;
}) {
  if (content.type === 'cards') {
    return (
      <div className="flex flex-col gap-3">
        {content.items.map((item, i) => (
          <div
            key={i}
            className={`rounded-[12px] border p-4 bg-white ${
              item.flagged
                ? 'border-l-4 border-l-[#D97706] border-[rgba(20,35,55,0.10)]'
                : 'border-[rgba(20,35,55,0.10)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0D1726] leading-snug">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-[#748094] mt-0.5">{item.subtitle}</p>
                )}
              </div>
              {item.flagged && (
                <span className="flex-shrink-0 text-xs font-medium text-[#D97706] bg-[rgba(217,119,6,0.10)] px-2 py-0.5 rounded-full">
                  Needs review
                </span>
              )}
            </div>
            <p className="text-sm text-[#3B4960] mt-2 leading-relaxed">{item.body}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {item.tags.map((tag, ti) => (
                  <Badge key={ti} variant={tag.variant ?? 'neutral'}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (content.type === 'table') {
    return (
      <div className="overflow-x-auto rounded-[12px] border border-[rgba(20,35,55,0.10)]">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="bg-[rgba(20,35,55,0.04)] border-b border-[rgba(20,35,55,0.10)]">
              {content.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#748094] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(20,35,55,0.07)]">
            {content.rows.map((row, ri) => (
              <tr
                key={ri}
                className={`${
                  row.flagged ? 'bg-[rgba(217,119,6,0.04)]' : 'bg-white hover:bg-[rgba(20,35,55,0.02)]'
                } transition-colors`}
              >
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2.5 text-[#0D1726] whitespace-nowrap">
                    {content.badgeColumnIndex === ci ? (
                      <Badge variant={badgeVariantForValue(cell)}>{cell}</Badge>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (content.type === 'review') {
    return (
      <div className="flex flex-col gap-3">
        {content.items.map((item, i) => {
          const resolved = resolvedItems[item.title];
          const isFlagged = item.status === 'flagged';
          return (
            <div
              key={i}
              className={`rounded-[12px] border p-4 ${
                isFlagged
                  ? 'border-[#D97706] bg-[rgba(217,119,6,0.05)] border-l-4 border-l-[#D97706]'
                  : 'border-[rgba(16,168,121,0.24)] bg-[rgba(16,168,121,0.05)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm font-semibold text-[#0D1726]">{item.title}</p>
                {isFlagged ? (
                  resolved ? (
                    <span className="text-xs font-medium text-[#10A879] bg-[rgba(16,168,121,0.12)] px-2 py-0.5 rounded-full flex-shrink-0">
                      ✓ {resolved}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#D97706] bg-[rgba(217,119,6,0.10)] px-2 py-0.5 rounded-full flex-shrink-0">
                      Awaiting review
                    </span>
                  )
                ) : (
                  <span className="text-xs font-medium text-[#10A879] bg-[rgba(16,168,121,0.12)] px-2 py-0.5 rounded-full flex-shrink-0">
                    Ready to send
                  </span>
                )}
              </div>
              {item.context && (
                <p className="text-xs text-[#748094] mb-2 italic">{item.context}</p>
              )}
              {item.draft && (
                <div
                  className={`rounded-[8px] p-3 text-sm text-[#3B4960] leading-relaxed whitespace-pre-line ${
                    isFlagged ? 'bg-white border border-[rgba(20,35,55,0.10)]' : 'bg-white/60'
                  }`}
                >
                  {item.draft}
                </div>
              )}
              {isFlagged && item.options && item.options.length > 0 && !resolved && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => onResolve(item.title, opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.28)] focus-visible:ring-offset-1 ${
                        oi === 0
                          ? 'bg-[#4F68FF] text-white hover:bg-[#3D55DF]'
                          : 'border border-[rgba(20,35,55,0.20)] text-[#3B4960] hover:border-[#4F68FF] hover:text-[#4F68FF]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (content.type === 'outcome') {
    return (
      <ul className="flex flex-col gap-3">
        {outcomePoints.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(16,168,121,0.15)] flex items-center justify-center mt-0.5">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4l3 3 5-6"
                  stroke="#10A879"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-sm text-[#3B4960] leading-relaxed">{point}</p>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export function PilotDemoModal({ demo, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [resolvedItems, setResolvedItems] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const getFocusable = () =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const first = getFocusable()[0];
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentStep]);

  const step = demo.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === demo.steps.length - 1;

  function handleResolve(title: string, option: string) {
    setResolvedItems(prev => ({ ...prev, [title]: option }));
  }

  if (!mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${demo.title} — example pilot workflow`}
    >
      <div
        className="absolute inset-0 bg-[#07111F]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#EEF2F8] rounded-[24px] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-[rgba(20,35,55,0.10)] bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4F68FF] mb-1">
                Example pilot workflow · {demo.businessArea}
              </p>
              <h2 className="text-xl font-bold font-heading text-[#0D1726]">
                {demo.title}
              </h2>
              <p className="text-sm text-[#748094] mt-0.5">{demo.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center text-[#748094] hover:bg-[rgba(20,35,55,0.06)] hover:text-[#0D1726] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.28)]"
              aria-label="Close demo"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 mt-4">
            {demo.steps.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => setCurrentStep(i)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.28)] ${
                    i === currentStep
                      ? 'bg-[#4F68FF] text-white font-medium'
                      : i < currentStep
                      ? 'text-[#4F68FF] font-medium hover:bg-[rgba(79,104,255,0.10)]'
                      : 'text-[#748094] hover:bg-[rgba(20,35,55,0.06)]'
                  }`}
                  aria-current={i === currentStep ? 'step' : undefined}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i === currentStep
                        ? 'bg-white/20'
                        : i < currentStep
                        ? 'bg-[rgba(79,104,255,0.15)]'
                        : 'bg-[rgba(20,35,55,0.08)]'
                    }`}
                  >
                    {i < currentStep ? (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="#4F68FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      s.stepNumber
                    )}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < demo.steps.length - 1 && (
                  <div className={`flex-1 h-px max-w-[24px] ${i < currentStep ? 'bg-[#4F68FF]' : 'bg-[rgba(20,35,55,0.12)]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-[#0D1726] mb-1">{step.heading}</h3>
            <p className="text-sm text-[#748094] leading-relaxed">{step.description}</p>
          </div>

          <StepContentRenderer
            content={step.content}
            outcomePoints={demo.outcomePoints}
            resolvedItems={resolvedItems}
            onResolve={handleResolve}
          />
        </div>

        <div className="flex-shrink-0 px-6 py-3 bg-[rgba(20,35,55,0.04)] border-t border-[rgba(20,35,55,0.08)]">
          <p className="text-xs text-[#748094] leading-relaxed">
            <span className="font-semibold">Note: </span>
            {demo.disclaimer}
          </p>
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-[rgba(20,35,55,0.10)] flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={isFirst}
          >
            <svg className="mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {isLast ? (
              <Button size="sm">
                Discuss a tailored pilot
                <svg className="ml-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            ) : (
              <Button size="sm" onClick={() => setCurrentStep(s => s + 1)}>
                Next
                <svg className="ml-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
