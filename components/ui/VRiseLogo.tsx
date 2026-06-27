'use client';
import React from 'react';

type Props = {
  variant?: 'full-color' | 'dark' | 'white' | 'mark';
  height?: number;
  className?: string;
};

export function VRiseLogo({ variant = 'full-color', height = 32, className = '' }: Props) {
  if (variant === 'mark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        width={height}
        height={height}
        className={className}
        aria-label="VRise"
        role="img"
      >
        <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="white" stroke="rgba(20,35,55,0.12)" />
        <path d="M5 22.5 13.2 9.5 19.2 20.2 27 6.5" stroke="#4F68FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.8 6.8h5.5" stroke="#4F68FF" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  const w = Math.round((260 / 48) * height);

  if (variant === 'white') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 260 48"
        fill="none"
        width={w}
        height={height}
        className={className}
        aria-label="VRise"
        role="img"
      >
        <path d="M8 31 17 13 23 27 31 9" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25.6 9.4h5.4" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
        <text x="52" y="31" fontFamily="Plus Jakarta Sans, Inter, Segoe UI, Arial, sans-serif" fontSize="28" fontWeight="800" letterSpacing="-1.2" fill="#FFFFFF">Vrise</text>
      </svg>
    );
  }

  if (variant === 'dark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 260 48"
        fill="none"
        width={w}
        height={height}
        className={className}
        aria-label="VRise"
        role="img"
      >
        <rect x="0.75" y="4.75" width="38.5" height="38.5" rx="12" fill="white" stroke="rgba(20,35,55,0.12)" />
        <path d="M8 31 17 13 23 27 31 9" stroke="#0D1726" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25.6 9.4h5.4" stroke="#0D1726" strokeWidth="3.4" strokeLinecap="round" />
        <text x="52" y="31" fontFamily="Plus Jakarta Sans, Inter, Segoe UI, Arial, sans-serif" fontSize="28" fontWeight="800" letterSpacing="-1.2" fill="#0D1726">Vrise</text>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 48"
      fill="none"
      width={w}
      height={height}
      className={className}
      aria-label="VRise"
      role="img"
    >
      <rect x="0.75" y="4.75" width="38.5" height="38.5" rx="12" fill="white" stroke="rgba(20,35,55,0.12)" />
      <path d="M8 31 17 13 23 27 31 9" stroke="#4F68FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.6 9.4h5.4" stroke="#4F68FF" strokeWidth="3.4" strokeLinecap="round" />
      <text x="52" y="31" fontFamily="Plus Jakarta Sans, Inter, Segoe UI, Arial, sans-serif" fontSize="28" fontWeight="800" letterSpacing="-1.2">
        <tspan fill="#4F68FF">V</tspan><tspan fill="#0D1726">rise</tspan>
      </text>
    </svg>
  );
}
