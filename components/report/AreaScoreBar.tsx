'use client';
import React from 'react';
import type { AreaScore } from '../../types';

function getEfficiencyColor(displayScore: number): string {
  if (displayScore >= 70) return '#10A879';
  if (displayScore >= 50) return '#3B9B78';
  if (displayScore >= 30) return '#D97706';
  return '#ef4444';
}

function getEfficiencyLabel(displayScore: number): string {
  if (displayScore >= 70) return 'Strong';
  if (displayScore >= 50) return 'Good';
  if (displayScore >= 30) return 'Moderate';
  return 'Low';
}

export function AreaScoreBar({ areaScore }: { areaScore: AreaScore }) {
  const { area, rawScore } = areaScore;
  const displayScore = 100 - rawScore;
  const color = getEfficiencyColor(displayScore);
  const efficiencyLabel = getEfficiencyLabel(displayScore);

  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="w-28 flex-shrink-0">
        <span className="text-sm font-medium text-[#0D1726]">{area}</span>
      </div>
      <div className="flex-1 h-2 bg-[rgba(20,35,55,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${displayScore}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-24 flex-shrink-0 flex items-center gap-2">
        <span className="text-sm font-semibold text-[#0D1726] w-8 text-right">{displayScore}</span>
        <span className="text-xs text-[#748094]">{efficiencyLabel}</span>
      </div>
    </div>
  );
}

export function AreaScoreBars({ areaScores }: { areaScores: AreaScore[] }) {
  const sorted = [...areaScores].sort((a, b) => b.rawScore - a.rawScore);
  return (
    <div className="bg-white border border-[rgba(20,35,55,0.10)] rounded-[18px] p-6 print-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold font-heading text-[#0D1726]">Operational Efficiency by Area</h3>
        <span className="text-xs text-[#748094]">Efficiency score per area (0–100)</span>
      </div>
      <div className="divide-y divide-[rgba(20,35,55,0.06)]">
        {sorted.map(score => (
          <AreaScoreBar key={score.area} areaScore={score} />
        ))}
      </div>
      <p className="mt-4 text-xs text-[#748094] leading-relaxed">
        Areas are ordered by scope for improvement — lower scores indicate more efficiency headroom and greater AI opportunity.
        Area scores are not benchmarked individually.
      </p>
    </div>
  );
}
