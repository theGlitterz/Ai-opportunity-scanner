'use client';

import { useState } from 'react';
import { PROFIT_WORKFLOW_DEMOS } from '../../data/profit-workflow-demos';
import type { PilotDemo } from '../../data/pilot-demos';
import { PilotDemoModal } from './PilotDemoModal';

const FUNCTION_MARKS: Record<string, string> = {
  Sales: 'S', Finance: 'F', Operations: 'O', 'Customer support': 'C', HR: 'H', IT: 'IT', 'Legal / contracts': 'L',
};

export function WorkflowExplorer() {
  const [openDemo, setOpenDemo] = useState<PilotDemo | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 rounded-[13px] border border-[rgba(79,104,255,.13)] bg-[rgba(79,104,255,.035)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-[#0D1726]">Interactive one-minute walkthroughs</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[#59667A]">See the incoming work, the AI action, the human checkpoint, and the illustrative outcome.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#4F68FF]">Choose a workflow below <span aria-hidden>↓</span></span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible" aria-label="Interactive example AI workflows">
        {PROFIT_WORKFLOW_DEMOS.map(demo => (
          <button key={demo.id} type="button" onClick={() => setOpenDemo(demo)}
            className="group min-w-[230px] lg:min-w-0 text-left rounded-[15px] border border-[rgba(20,35,55,.10)] bg-white p-4 hover:border-[#4F68FF] hover:shadow-vrise-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,.28)]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="w-8 h-8 rounded-[9px] bg-[rgba(79,104,255,.09)] text-[#4F68FF] flex items-center justify-center text-[11px] font-bold">{FUNCTION_MARKS[demo.businessArea]}</span>
              <span className="rounded-full bg-[rgba(16,168,121,.09)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#087D5B]">Interactive · {demo.businessArea}</span>
            </div>
            <h3 className="text-sm font-bold font-heading text-[#0D1726] leading-snug mb-1.5">{demo.title}</h3>
            <p className="text-xs text-[#748094] leading-relaxed line-clamp-2 mb-3">{demo.subtitle}</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F68FF] group-hover:underline">Open the walkthrough <span aria-hidden>→</span></span>
          </button>
        ))}
      </div>
      {openDemo && <PilotDemoModal demo={openDemo} onClose={() => setOpenDemo(null)} />}
    </>
  );
}
