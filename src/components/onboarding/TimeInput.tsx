// src/components/onboarding/TimeInput.tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimeInput({
  value,
  onChange,
  placeholder = '00:00',
  className,
  disabled,
}: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9:]/g, '');

    // Auto-format as user types
    if (input.length === 2 && !input.includes(':')) {
      input = input + ':';
    }

    // Limit to HH:MM format
    if (input.length > 5) {
      input = input.slice(0, 5);
    }

    onChange(input);
  };

  const handleBlur = () => {
    // Validate and auto-complete on blur
    if (value.length === 0) return;

    const parts = value.split(':');
    let hours = parts[0] || '00';
    let minutes = parts[1] || '00';

    // Pad with zeros
    hours = hours.padStart(2, '0');
    minutes = minutes.padStart(2, '0');

    // Validate ranges
    const h = parseInt(hours);
    const m = parseInt(minutes);

    if (h > 23) hours = '23';
    if (m > 59) minutes = '59';

    onChange(`${hours}:${minutes}`);
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn('font-mono text-center w-24 text-white', className)}
      disabled={disabled}
      maxLength={5}
    />
  );
}
