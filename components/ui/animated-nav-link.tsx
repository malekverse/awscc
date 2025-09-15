'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnimatedNavLinkProps {
  href: string;
  isActive: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function AnimatedNavLink({ 
  href, 
  isActive, 
  onClick, 
  children,
  className,
  activeClassName
}: AnimatedNavLinkProps) {
  const isMobileStyle = className?.includes('block w-full');
  
  return (
    <Link
      href={href}
      className={cn(
        "relative transition-colors duration-200",
        isMobileStyle ? "" : "py-2 px-1",
        className
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          'relative z-10',
          !isMobileStyle && 'relative z-10',
          isActive && activeClassName
        )}
      >
        {children}
      </span>
      {isActive && !isMobileStyle && (
        <motion.span
          layoutId="navbar-underline"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30
          }}
        />
      )}
      {!isMobileStyle && (
        <motion.span
          className="absolute inset-0 rounded-md z-0"
          initial={false}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}
