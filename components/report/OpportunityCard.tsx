'use client';
import React, { useState } from 'react';
import type { RankedOpportunity } from '../../types';
import { Badge } from '../ui/FormFields';

const EASE_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Complex deployment',
  2: 'Moderate fit',
  3: 'High AI fit',
};

const RANK_LABELS = [
  'Primary opportunity',
  'Second opportunity',
  'Third opportunity',
];

const RANK_STRIPE_COLORS = ['#4F68FF', '#5F8DFF', 'rgba(79,104,255,0.45)'];

export function OpportunityCard({ opportunity }: { opportunity: RankedOpportunity }) {
  const [expanded, setExpanded] = useState(false);
  const rankIndex = opportunity.rank - 1;

  return (
    <article
      aria-label={`Opportunity ${opportunity.rank}: ${opportunity.title}`}
      className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] overflow-hidden print-card"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        aria-hidden="true"
        className="h-1"
        style={{ background: RANK_STRIPE_COLORS[rankIndex] ?? '#4F68FF' }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              aria-hidden="true"
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                rankIndex === 0 ? 'bg-[#4F68FF] text-white' : 'bg-[rgba(20,35,55,0.07)] text-[#3B4960]',
              ].join(' ')}
            >
              {opportunity.rank}
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#748094] mb-0.5">
                {RANK_LABELS[rankIndex]}
              </p>
              <h3 className="text-[14px] font-bold font-heading text-[#0D1726] leading-snug">
                {opportunity.title}
              </h3>
            </div>
          </div>

          <Badge variant={opportunity.aiFitEase === 3 ? 'accent' : 'default'}>
            {EASE_LABELS[opportunity.aiFitEase]}
          </Badge>
        </div>

        <p className="text-[13px] text-[#3B4960] leading-relaxed mb-2">
          {opportunity.shortDescription}
        </p>

        <p className="text-[11px] text-[#748094] italic mb-4">{opportunity.rationale}</p>

        <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Relevant business areas">
          {opportunity.primaryAreas.map(a => (
            <span
              key={a}
              className="px-2 py-0.5 bg-[rgba(79,104,255,0.10)] text-[#4F68FF] border border-[rgba(79,104,255,0.20)] rounded-full text-[10px] font-semibold"
            >
              {a}
            </span>
          ))}
          {opportunity.secondaryAreas.map(a => (
            <span
              key={a}
              className="px-2 py-0.5 bg-[rgba(20,35,55,0.05)] text-[#748094] border border-[rgba(20,35,55,0.10)] rounded-full text-[10px]"
            >
              {a}
            </span>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`use-case-${opportunity.id}`}
          onClick={() => setExpanded(v => !v)}
          className={[
            'no-print flex items-center gap-1.5 text-[11px] font-semibold text-[#4F68FF]',
            'hover:text-[#3D55DF] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.28)] rounded',
          ].join(' ')}
        >
          <svg
            aria-hidden="true"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          >
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {expanded ? 'Hide example' : 'See example use case'}
        </button>

        <div
          id={`use-case-${opportunity.id}`}
          className={[
            'mt-3 p-3.5 bg-[rgba(79,104,255,0.05)] border border-[rgba(79,104,255,0.16)] rounded-[12px]',
            expanded ? 'block' : 'hidden print:block',
          ].join(' ')}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#4F68FF] mb-1.5">
            Example Use Case
          </p>
          <p className="text-[12px] text-[#0D1726] leading-relaxed">{opportunity.exampleUseCase}</p>
        </div>
      </div>
    </article>
  );
}
