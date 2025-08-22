import React from 'react';

interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
}

export function Money(props: MoneyProps) {
  const {
    amount,
    currency,
    showCurrency,
    className
  } = props;
  
  const finalCurrency = currency || 'LKR';
  const finalShowCurrency = showCurrency !== undefined ? showCurrency : true;
  const finalClassName = className || '';
  
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const isNegative = amount < 0;
    <span className={finalClassName}>
      {finalShowCurrency && `${finalCurrency} `}{formatAmount(amount)}
  return (
    <span className={`${isNegative ? 'text-red-600' : ''} ${className}`}>
      {isNegative && '-'}
      {showCurrency && `${currency} `}
      {displayAmount}
    </span>
  );
}