'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CloudShapeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  fill?: string;
  glow?: boolean;
}

export function CloudShape({ 
  size = 100, 
  className, 
  fill = '#E9E1FF', 
  glow = true,
  ...props 
}: CloudShapeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={Math.floor(size * 0.6)}
      viewBox="0 0 100 60"
      fill="none"
      className={cn('animate-float', className)}
      style={{ animationDelay: `${Math.random() * 3}s` }}
      {...props}
    >
      <path
        d="M90 40C90 51.0457 81.0457 60 70 60H30C18.9543 60 10 51.0457 10 40C10 28.9543 18.9543 20 30 20C30 8.95431 38.9543 0 50 0C61.0457 0 70 8.95431 70 20C81.0457 20 90 28.9543 90 40Z"
        fill={fill}
        className={glow ? 'filter drop-shadow-[0_0_10px_rgba(155,109,255,0.3)]' : ''}
      />
    </svg>
  );
}