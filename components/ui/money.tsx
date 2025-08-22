'use client';

import { cn } from '@/lib/utils';

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function Money({ amount, currency = 'LKR', className }: MoneyProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <span className={cn('font-medium', className)}>
      {currency} {formatAmount(amount)}
    </span>
  );
}