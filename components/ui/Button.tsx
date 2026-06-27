'use client';
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,104,255,0.40)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed font-sans';
  const variants = {
    primary: 'bg-[#4F68FF] text-white hover:bg-[#3D55DF] rounded-full',
    secondary: 'border border-[rgba(20,35,55,0.20)] text-[#0D1726] hover:bg-[rgba(79,104,255,0.06)] hover:border-[#4F68FF] hover:text-[#4F68FF] rounded-full',
    ghost: 'text-[#3B4960] hover:bg-[rgba(20,35,55,0.05)] hover:text-[#0D1726] rounded-[10px]',
  };
  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-sm',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
