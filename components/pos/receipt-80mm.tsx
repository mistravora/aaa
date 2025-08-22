'use client';

import { Sale, Product, Batch } from '@/lib/types';
import { Money } from '@/components/ui/money';
import { formatColombo } from '@/lib/utils/time';

interface Receipt80mmProps {
  sale: Sale;
  products: Product[];
  batches: Batch[];
}

export function Receipt80mm({ sale, products, batches }: Receipt80mmProps) {
  const getProduct = (id: string) => products.find(p => p.id === id);
  const getBatch = (id: string) => batches.find(b => b.id === id);

  return (
    <div id="receipt-80mm" className="receipt-80mm max-w-xs mx-auto bg-white font-mono text-xs leading-tight print:max-w-none print:mx-0">
      {/* Header */}
      <div className="text-center border-b pb-2 mb-2">
        <h2 className="font-bold text-sm">DUBAI STORE</h2>
        <p className="text-xs">Premium Food & Beverages</p>
        <p className="text-xs">123 Business District, Colombo 03</p>
        <p className="text-xs">Tel: +94 11 234 5678</p>
        <p className="text-xs">TIN: 123456789</p>
      </div>

      {/* Bill Details */}
      <div className="space-y-1 border-b pb-2 mb-2">
        <div className="flex justify-between">
          <span>Bill No:</span>
          <span className="font-bold">{sale.billNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatColombo(sale.saleAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span className="capitalize">{sale.cashier_role}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-b pb-2 mb-2">
        <div className="flex justify-between font-bold border-b pb-1 mb-2">
          <span>Item</span>
          <span>Total</span>
        </div>
        
        {sale.lines.map((line, index) => {
          const product = getProduct(line.product_id);
          const batch = getBatch(line.batch_id);
          
          if (!product) return null;

          let lineTotal = line.qty * line.price_unit;
          
          // Apply markdown
          if (line.markdown_pct) {
            lineTotal *= (1 - line.markdown_pct / 100);
          }
          
          // Apply discounts
          if (line.discount_pct) {
            lineTotal *= (1 - line.discount_pct / 100);
          }
          if (line.discount_lkr) {
            lineTotal -= line.discount_lkr;
          }

          return (
            <div key={index} className="space-y-1 mb-2">
              <div className="flex justify-between">
                <span className="font-medium">{product.name_en}</span>
                <Money amount={Math.max(0, lineTotal)} />
              </div>
              <div className="text-xs text-gray-600 pl-2">
                <div>{line.qty} {line.sale_unit} × <Money amount={line.price_unit} />/{line.sale_unit}</div>
                {batch?.lot && <div>Lot: {batch.lot}</div>}
                {batch?.expiry && <div>Exp: {new Date(batch.expiry).toLocaleDateString()}</div>}
                {(line.discount_pct || line.discount_lkr || line.markdown_pct) && (
                  <div className="text-red-600">
                    {line.markdown_pct && `Markdown: ${line.markdown_pct}% `}
                    {line.discount_pct && `Disc: ${line.discount_pct}% `}
                    {line.discount_lkr && `Disc: LKR ${line.discount_lkr}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="space-y-1 border-b pb-2 mb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <Money amount={sale.subtotal} />
        </div>
        {sale.markdown_total > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Markdown:</span>
            <Money amount={-sale.markdown_total} />
          </div>
        )}
        {sale.discount_total > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <Money amount={-sale.discount_total} />
          </div>
        )}
        {sale.tax_mode !== 'none' && sale.vat_total > 0 && (
          <div className="flex justify-between">
            <span>VAT ({sale.tax_rate}%):</span>
            <Money amount={sale.vat_total} />
          </div>
        )}
        {sale.rounding !== 0 && (
          <div className="flex justify-between">
            <span>Rounding:</span>
            <Money amount={sale.rounding} />
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-1">
          <span>TOTAL:</span>
          <Money amount={sale.total} />
        </div>
      </div>

      {/* Payments */}
      <div className="space-y-1 border-b pb-2 mb-2">
        <div className="font-bold">Payment:</div>
        {sale.payments.map((payment, index) => (
          <div key={index} className="flex justify-between">
            <span className="capitalize">{payment.type}:</span>
            <Money amount={payment.amount} />
          </div>
        ))}
        {sale.payments.reduce((sum, p) => sum + p.amount, 0) > sale.total && (
          <div className="flex justify-between font-bold">
            <span>Change:</span>
            <Money amount={sale.payments.reduce((sum, p) => sum + p.amount, 0) - sale.total} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs space-y-1">
        <p>Thank you for shopping with us!</p>
        <p>අපේ සේවාවට ස්තූතියි!</p>
        <p>Goods once sold cannot be returned</p>
        <p>without a valid receipt</p>
        <div className="text-center mt-4">
          <p>------- Cut Here -------</p>
        </div>
      </div>
    </div>
  );
}