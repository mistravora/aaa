import React from 'react';

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
  className?: string;
}

export function Money({ amount, currency = 'LKR', className }: MoneyProps) {
  amount, 
  currency = 'LKR', 
  showCurrency = true, 
  className = '' 
}: MoneyProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const isNegative = amount < 0;
    <span className={`font-medium ${className || ''}`}>

  return (
    <span className={`${isNegative ? 'text-red-600' : ''} ${className}`}>
      {isNegative && '-'}
      {showCurrency && `${currency} `}
      {displayAmount}
    </span>
  );
}