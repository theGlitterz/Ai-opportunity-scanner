'use client';
import React, { useState } from 'react';

export function InfoTooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5 no-print">
      <button
        type="button"
        aria-label="More information"
        className="w-4 h-4 rounded-full border border-[rgba(20,35,55,0.20)] text-[#748094] text-[10px] font-bold flex items-center justify-center hover:border-[#4F68FF] hover:text-[#4F68FF] transition-colors cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
      >
        i
      </button>
      {open && (
        <div className="absolute z-50 bottom-7 left-1/2 -translate-x-1/2 w-72 bg-[#07111F] text-white text-xs leading-relaxed rounded-[12px] px-4 py-3 shadow-2xl border border-white/10">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#07111F]" />
        </div>
      )}
    </span>
  );
}
