import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  thickness?: 'thin' | 'normal' | 'thick';
  color?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  thickness = 'normal',
  color = 'text-blue-500',
  className
}: LoadingSpinnerProps) {

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const thicknessClasses = {
    thin: 'border',
    normal: 'border-2',
    thick: 'border-4',
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        thicknessClasses[thickness],
        sizeClasses[size],
        "border-gray-300",
        "border-t-transparent",
        color,
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
