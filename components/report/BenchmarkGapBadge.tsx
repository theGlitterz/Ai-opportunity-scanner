'use client';
import React from 'react';
import type { BenchmarkGapLabel } from '../../types';
import { InfoTooltip } from '../ui/InfoTooltip';

type Props = {
  gap: number;
  gapLabel: BenchmarkGapLabel;
  derivationNote: string;
};

const GAP_STYLES: Record<BenchmarkGapLabel, { bg: string; text: string; border: string; dot: string }> = {
  'Above benchmark':          { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5', dot: '#ef4444' },
  'Slightly above benchmark': { bg: '#fff7ed', text: '#c2410c', border: '#fdba74', dot: '#f97316' },
  'In line with benchmark':   { bg: 'rgba(20,35,55,0.05)', text: '#3B4960', border: 'rgba(20,35,55,0.16)', dot: '#748094' },
  'Slightly below benchmark': { bg: 'rgba(16,168,121,0.08)', text: '#10A879', border: 'rgba(16,168,121,0.24)', dot: '#10A879' },
  'Below benchmark':          { bg: 'rgba(16,168,121,0.12)', text: '#0A7A58', border: 'rgba(16,168,121,0.32)', dot: '#10A879' },
};

const PERFORMANCE_BADGE_LABEL: Record<BenchmarkGapLabel, string> = {
  'Above benchmark':          'Below benchmark',
  'Slightly above benchmark': 'Slightly below benchmark',
  'In line with benchmark':   'In line with benchmark',
  'Slightly below benchmark': 'Slightly above benchmark',
  'Below benchmark':          'Above benchmark',
};

const TOOLTIP =
  'Compares your overall efficiency position against similar businesses by size, sector, and operating context, ' +
  'using our internal benchmark model. Being above benchmark indicates stronger relative efficiency. ' +
  'Being below benchmark points to more room for improvement relative to your peer group. ' +
  'This is an overall-level comparison only.';

export function BenchmarkGapBadge({ gap, gapLabel, derivationNote }: Props) {
  const s = GAP_STYLES[gapLabel];
  const performanceBadgeLabel = PERFORMANCE_BADGE_LABEL[gapLabel];
  const isNeutral = gapLabel === 'In line with benchmark';
  const magnitude = Math.abs(gap);
  const direction = gap > 0 ? 'below' : 'above';

  return (
    <div className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] p-5 print-card flex flex-col gap-1" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#748094] leading-tight">
          Benchmark Position
        </span>
        <InfoTooltip content={TOOLTIP} />
      </div>

      {isNeutral ? (
        <div className="text-[22px] font-bold font-heading tracking-tight text-[#0D1726] leading-snug mt-1">
          In line with<br />benchmark
        </div>
      ) : (
        <div className="mt-1 leading-none">
          <span className="text-[30px] font-bold font-heading tracking-tight text-[#0D1726]">
            {magnitude}
          </span>
          <span className="text-sm text-[#748094] ml-1">
            points {direction} benchmark
          </span>
        </div>
      )}

      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold mt-1 self-start"
        style={{ background: s.bg, color: s.text, borderColor: s.border }}
      >
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: s.dot }}
        />
        {performanceBadgeLabel}
      </div>

      <p className="text-[10px] text-[#748094] mt-1.5 leading-relaxed">{derivationNote}</p>
    </div>
  );
}
