import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Logo({ size = 'md', className = '', showText = true }) {
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
    xl: 32
  };

  return (
    <div className={`brand-logo ${className}`}>
      <div className={`brand-icon-wrap size-${size}`}>
        <ShieldCheck size={iconSizes[size] || 20} className="brand-icon" />
      </div>
      {showText && (
        <span className={`brand-logo-text size-${size}`}>
          Resolve<span className="logo-accent">X</span>
        </span>
      )}
    </div>
  );
}
