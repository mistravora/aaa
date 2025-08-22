import { TaxMode } from '../types';

export function applyInclusive(grossAmount: number, taxRate: number): { net: number; tax: number } {
  const net = grossAmount / (1 + taxRate / 100);
  const tax = grossAmount - net;
  return { net, tax };
}

export function applyExclusive(netAmount: number, taxRate: number): { gross: number; tax: number } {
  const tax = netAmount * (taxRate / 100);
  const gross = netAmount + tax;
  return { gross, tax };
}

export function calculateTax(amount: number, taxRate: number, taxMode: TaxMode): {
  subtotal: number;
  tax: number;
  total: number;
} {
  switch (taxMode) {
    case 'none':
      return { subtotal: amount, tax: 0, total: amount };
    case 'inclusive': {
      const { net, tax } = applyInclusive(amount, taxRate);
      return { subtotal: net, tax, total: amount };
    }
    case 'exclusive': {
      const { gross, tax } = applyExclusive(amount, taxRate);
      return { subtotal: amount, tax, total: gross };
    }
    default:
      throw new Error(`Invalid tax mode: ${taxMode}`);
  }
}