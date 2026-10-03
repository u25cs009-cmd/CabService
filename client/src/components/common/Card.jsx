import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = true,
  variant = 'default',
  ...props
}) {
  const base = 'rounded-2xl p-6 transition-all duration-300';

  const variants = {
    default: 'bg-white border border-slate-200/80 shadow-xs text-slate-800',
    glass: 'glass-card shadow-sm text-slate-900',
    dark: 'bg-slate-900 border border-slate-800 text-white shadow-xl',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-medium shadow-lg shadow-amber-500/20'
  };

  const hover = hoverEffect ? 'hover:shadow-md hover:-translate-y-1 hover:border-slate-300' : '';

  return (
    <div className={`${base} ${variants[variant] || variants.default} ${hover} ${className}`} {...props}>
      {children}
    </div>
  );
}
