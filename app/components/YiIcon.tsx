import React from 'react';

export function YiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="ring-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Background */}
      <circle cx="50" cy="50" r="48" fill="url(#icon-bg)" />
      
      {/* Decorative Rings */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ring-grad)" strokeWidth="1" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 4" />

      {/* Seal Script Character "易" */}
      <g stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
        {/* Top horizontal line */}
        <path d="M 32 26 L 68 26" />
        
        {/* U-shape */}
        <path d="M 38 26 L 40 34 C 40 43, 60 43, 62 34 L 64 26" />
        
        {/* Inner dot (triangle) */}
        <path d="M 48 31 L 52 31 L 50 35 Z" fill="#ffffff" strokeWidth="1" />
        
        {/* Main stem and right arc */}
        <path d="M 51 40 L 51 48 Q 78 65 58 88" />
        
        {/* Three left sweeps */}
        <path d="M 49 46 Q 35 55 20 66" />
        <path d="M 53 56 Q 38 66 22 79" />
        <path d="M 57 67 Q 44 77 32 90" />
      </g>
    </svg>
  );
}
