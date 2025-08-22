interface MoneyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function Money({ amount, currency = 'LKR', className = '' }: MoneyProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span className={className}>
      {currency} {formatted}
    </span>
  );
}