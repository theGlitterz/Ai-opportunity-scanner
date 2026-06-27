'use client';
import React from 'react';
import { InfoTooltip } from '../ui/InfoTooltip';

type ScoreCardProps = {
  label: string;
  value: string | number;
  subLabel?: string;
  tooltip: string;
  accent?: boolean;
  delta?: boolean;
};

export function ScoreCard({ label, value, subLabel, tooltip, accent = false, delta = false }: ScoreCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isPositiveDelta = delta && numericValue > 4;
  const isNegativeDelta = delta && numericValue < -4;

  const getScoreTier = (v: number) => {
    if (v >= 70) return { label: 'Strong efficiency', color: '#10A879' };
    if (v >= 50) return { label: 'Good efficiency', color: '#3B9B78' };
    if (v >= 30) return { label: 'Scope to improve', color: '#D97706' };
    return { label: 'Significant headroom', color: '#ef4444' };
  };

  const tier = !delta && typeof value === 'number' ? getScoreTier(value) : null;

  return (
    <div
      className={`bg-white border rounded-[18px] p-5 flex flex-col gap-1 print-card ${accent ? 'border-[rgba(79,104,255,0.24)] bg-[rgba(79,104,255,0.04)]' : 'border-[rgba(20,35,55,0.10)]'}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#748094]">{label}</span>
        <InfoTooltip content={tooltip} />
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-3xl font-bold font-heading tracking-tight ${isPositiveDelta ? 'text-[#ef4444]' : isNegativeDelta ? 'text-[#10A879]' : 'text-[#0D1726]'}`}>
          {value}
        </span>
        {!delta && <span className="text-sm text-[#748094]">/ 100</span>}
      </div>
      {tier && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
          <span className="text-xs text-[#3B4960]">{tier.label}</span>
        </div>
      )}
      {subLabel && <p className="text-xs text-[#748094] mt-0.5 leading-snug">{subLabel}</p>}
    </div>
  );
}
