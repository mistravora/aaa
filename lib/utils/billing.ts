import { CartItem, Sale, SaleLine, Payment, TaxMode } from '../types';
import { calculateTax } from './tax';
import { db } from '../db';
import { nowColombo } from './time';

export async function generateBillNumber(): Promise<string> {
  const today = nowColombo().toISOString().split('T')[0].replace(/-/g, '');
  
  const sequence = await db.bill_sequences.where('date').equals(today).first();
  const nextSequence = (sequence?.last_sequence || 0) + 1;
  
  await db.bill_sequences.put({
    date: today,
    last_sequence: nextSequence,
  });
  
  return `DC-${today}-${nextSequence.toString().padStart(4, '0')}`;
}

export function calculateBill(
  items: CartItem[],
  billDiscount: { type: 'percent' | 'amount'; value: number } | null,
  taxMode: TaxMode,
  taxRate: number,
  roundingRule: number | null
): {
  subtotal: number;
  discountTotal: number;
  markdownTotal: number;
  vatTotal: number;
  rounding: number;
  total: number;
} {
  // Step 1: Calculate line totals with markdowns and discounts
  let subtotal = 0;
  let discountTotal = 0;
  let markdownTotal = 0;
  
  for (const item of items) {
    let lineGross = item.qty * item.price_unit;
    
    // Apply markdown first
    if (item.markdown_pct) {
      const markdown = lineGross * (item.markdown_pct / 100);
      markdownTotal += markdown;
      lineGross -= markdown;
    }
    
    // Apply line discount
    let lineDiscount = 0;
    if (item.discount_pct) {
      lineDiscount += lineGross * (item.discount_pct / 100);
    }
    if (item.discount_lkr) {
      lineDiscount += item.discount_lkr;
    }
    
    discountTotal += lineDiscount;
    subtotal += Math.max(0, lineGross - lineDiscount);
  }
  
  // Step 2: Apply bill discount
  if (billDiscount) {
    let billDiscountAmount = 0;
    if (billDiscount.type === 'percent') {
      billDiscountAmount = subtotal * (billDiscount.value / 100);
    } else {
      billDiscountAmount = billDiscount.value;
    }
    
    discountTotal += billDiscountAmount;
    subtotal = Math.max(0, subtotal - billDiscountAmount);
  }
  
  // Step 3: Apply tax
  const taxResult = calculateTax(subtotal, taxRate, taxMode);
  
  // Step 4: Apply rounding to grand total only
  let finalTotal = taxResult.total;
  let rounding = 0;
  
  if (roundingRule) {
    const rounded = Math.round(finalTotal / roundingRule) * roundingRule;
    rounding = rounded - finalTotal;
    finalTotal = rounded;
  }
  
  return {
    subtotal: taxResult.subtotal,
    discountTotal,
    markdownTotal,
    vatTotal: taxResult.tax,
    rounding,
    total: finalTotal,
  };
}

export function createSaleLines(items: CartItem[]): SaleLine[] {
  return items.map(item => ({
    product_id: item.product.id,
    batch_id: item.batch.id,
    qty: item.qty,
    sale_unit: item.sale_unit,
    price_unit: item.price_unit,
    discount_pct: item.discount_pct,
    discount_lkr: item.discount_lkr,
    markdown_pct: item.markdown_pct,
    pack_break_ref: null, // TODO: Implement pack breaking
    cogs_base: item.batch.unit_cost,
  }));
}

export async function processSale(
  items: CartItem[],
  billDiscount: { type: 'percent' | 'amount'; value: number } | null,
  payments: Payment[],
  cashierRole: string,
  taxMode: TaxMode,
  taxRate: number,
  roundingRule: number | null
): Promise<Sale> {
  const billNo = await generateBillNumber();
  const saleClientId = crypto.randomUUID();
  const calculation = calculateBill(items, billDiscount, taxMode, taxRate, roundingRule);
  
  const sale: Sale = {
    id: crypto.randomUUID(),
    billNo,
    saleClientId,
    saleAt: new Date().toISOString(),
    cashier_role: cashierRole as any,
    tax_mode: taxMode,
    tax_rate: taxRate,
    subtotal: calculation.subtotal,
    discount_total: calculation.discountTotal,
    markdown_total: calculation.markdownTotal,
    vat_total: calculation.vatTotal,
    rounding: calculation.rounding,
    total: calculation.total,
    payments,
    lines: createSaleLines(items),
  };
  
  return sale;
}