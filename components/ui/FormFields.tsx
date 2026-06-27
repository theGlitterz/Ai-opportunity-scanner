'use client';
import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ label, error, options, placeholder = 'Select…', className = '', ...props }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-[#748094]">{label}</label>
      <div className="relative">
        <select
          className={`w-full px-3 py-2.5 text-sm rounded-[12px] border appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(79,104,255,0.28)] transition-all pr-8 font-sans
            ${error ? 'border-red-400 focus:ring-red-300' : 'border-[rgba(20,35,55,0.16)] hover:border-[#4F68FF]'}
            ${!props.value ? 'text-[#748094]' : 'text-[#0D1726]'}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#748094]">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-[#748094]">{label}</label>
      <input
        className={`w-full px-3 py-2.5 text-sm rounded-[12px] border bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(79,104,255,0.28)] transition-all font-sans text-[#0D1726] placeholder:text-[#748094]
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[rgba(20,35,55,0.16)] hover:border-[#4F68FF]'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'accent' | 'warm' | 'neutral' }) {
  const variants = {
    default: 'bg-[rgba(20,35,55,0.06)] text-[#3B4960]',
    accent: 'bg-[rgba(16,168,121,0.12)] text-[#0A7A58]',
    warm: 'bg-[rgba(217,119,6,0.10)] text-[#B45309]',
    neutral: 'bg-[rgba(20,35,55,0.06)] text-[#748094]',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
}
