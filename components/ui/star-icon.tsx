'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  fill?: string;
  glow?: boolean;
}

export function StarIcon({ 
  size = 24, 
  className, 
  fill = '#9B6DFF', 
  glow = true,
  ...props 
}: StarIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-float', className)}
      style={{ animationDelay: `${Math.random() * 2}s` }}
      {...props}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={fill}
        stroke={fill}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={glow ? 'filter drop-shadow-[0_0_5px_rgba(155,109,255,0.7)]' : ''}
      />
    </svg>
  );
}