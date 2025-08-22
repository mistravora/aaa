import React from 'react';

interface MoneyProps {
  amount: number;
  currency?: string;
  showCurrency?: boolean;
  className?: string;
}

export function Money({ 
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
  const displayAmount = formatAmount(amount);

  return (
    <span className={`${isNegative ? 'text-red-600' : ''} ${className}`}>
      {isNegative && '-'}
      {showCurrency && `${currency} `}
      {displayAmount}
    </span>
  );
}