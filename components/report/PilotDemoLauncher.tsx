'use client';
import React, { useState } from 'react';
import { PILOT_DEMOS } from '../../data/pilot-demos';
import type { PilotDemo } from '../../data/pilot-demos';
import type { OpportunityTheme } from '../../types';
import { PilotDemoModal } from './PilotDemoModal';

const AREA_ICONS: Record<string, React.ReactNode> = {
  People: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 8a3 3 0 110-6M17 15c0-2.5-1.5-4-4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Finance: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 8h16" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="11" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  ),
  Operations: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Customer: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15 3H3a2 2 0 00-2 2v7a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  'Systems & IT': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 16h6M9 12v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const PREFERRED_DEMO_IDS: Record<OpportunityTheme, string> = {
  collections: 'finance-invoice-reconciliation',
  inbound: 'customer-inbox-copilot',
  workflow: 'operations-report-generator',
};

export function PilotDemoLauncher({ theme }: { theme?: OpportunityTheme }) {
  const [openDemo, setOpenDemo] = useState<PilotDemo | null>(null);
  const matchingDemos = theme
    ? PILOT_DEMOS.filter((demo) => demo.supportedThemes?.includes(theme))
    : PILOT_DEMOS;
  const preferredDemo = theme
    ? matchingDemos.find((demo) => demo.id === PREFERRED_DEMO_IDS[theme]) ?? matchingDemos[0]
    : undefined;
  const visibleDemos = preferredDemo ? [preferredDemo] : matchingDemos;

  if (visibleDemos.length === 0) return null;

  return (
    <>
      <div className="mb-8 no-print">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-bold font-heading text-[#0D1726]">
            {theme ? 'See the recommended pilot in practice' : 'See example pilot workflows'}
          </h2>
          <div className="flex-1 h-px bg-[rgba(20,35,55,0.10)]" />
        </div>
        <p className="text-sm text-[#748094] mb-5">
          {theme
            ? 'This illustrative workflow shows how the recommended starting point could work in practice. It is an example, not a projection for your business.'
            : 'Each business area has an illustrative example of what an AI pilot could look like in practice. These are based on common patterns — not projections for your specific business.'}
        </p>

        <div className={theme ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
          {visibleDemos.map(demo => (
            <button
              key={demo.id}
              onClick={() => setOpenDemo(demo)}
              className="group text-left rounded-[12px] border border-[rgba(20,35,55,0.10)] bg-white p-4 hover:border-[#4F68FF] hover:shadow-vrise-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.28)] focus-visible:ring-offset-1"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[#4F68FF] opacity-60 group-hover:opacity-100 transition-opacity">
                  {AREA_ICONS[demo.businessArea]}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#748094] group-hover:text-[#4F68FF] transition-colors">
                  {demo.businessArea}
                </span>
              </div>
              <p className="text-sm font-bold font-heading text-[#0D1726] mb-1 leading-snug">
                {demo.title}
              </p>
              <p className="text-xs text-[#748094] leading-relaxed mb-3 line-clamp-2">
                {demo.problemStatement}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4F68FF] group-hover:underline">
                View example
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>

      {openDemo && (
        <PilotDemoModal demo={openDemo} onClose={() => setOpenDemo(null)} />
      )}
    </>
  );
}
