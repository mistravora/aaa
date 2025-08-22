'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/ui/money';
import { PaymentType, Payment } from '@/lib/types';
import { CreditCard, Wallet, Building2, Banknote } from 'lucide-react';

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payments: Payment[]) => void;
  total: number;
  subtotal: number;
  discountTotal: number;
  markdownTotal: number;
  vatTotal: number;
  rounding: number;
  billDiscount?: { type: 'percent' | 'amount'; value: number } | null;
  onBillDiscountChange: (discount: { type: 'percent' | 'amount'; value: number } | null) => void;
}

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  wallet: Wallet,
  bank: Building2,
};

export function PaymentDrawer({
  open,
  onClose,
  onConfirm,
  total,
  subtotal,
  discountTotal,
  markdownTotal,
  vatTotal,
  rounding,
  billDiscount,
  onBillDiscountChange,
}: PaymentDrawerProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({
    type: 'cash',
    amount: total,
  });
  const [billDiscountType, setBillDiscountType] = useState<'percent' | 'amount'>('percent');
  const [billDiscountValue, setBillDiscountValue] = useState(billDiscount?.value || 0);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const handleAddPayment = () => {
    if (currentPayment.type && currentPayment.amount && currentPayment.amount > 0) {
      setPayments([...payments, currentPayment as Payment]);
      setCurrentPayment({
        type: 'cash',
        amount: remaining,
      });
    }
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (totalPaid >= total) {
      onConfirm(payments);
    }
  };

  const handleBillDiscountChange = () => {
    const discount = billDiscountValue > 0 ? {
      type: billDiscountType,
      value: billDiscountValue
    } : null;
    onBillDiscountChange(discount);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Process Payment</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Bill Discount */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Bill Discount</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={billDiscountType} onValueChange={(value: 'percent' | 'amount') => setBillDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="amount">LKR</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={billDiscountValue}
                onChange={(e) => setBillDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min={0}
                step={0.01}
                className="col-span-2"
              />
            </div>
            <Button onClick={handleBillDiscountChange} variant="outline" size="sm">
              Apply Bill Discount
            </Button>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Order Summary</Label>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <Money amount={subtotal} />
              </div>
              {markdownTotal > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Markdown:</span>
                  <Money amount={-markdownTotal} />
                </div>
              )}
              {discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <Money amount={-discountTotal} />
                </div>
              )}
              {vatTotal > 0 && (
                <div className="flex justify-between">
                  <span>VAT (18%):</span>
                  <Money amount={vatTotal} />
                </div>
              )}
              {rounding !== 0 && (
                <div className="flex justify-between">
                  <span>Rounding:</span>
                  <Money amount={rounding} />
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <Money amount={total} />
            </div>
          </div>

          <Separator />

          {/* Current Payments */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Payments</Label>
              {payments.map((payment, index) => {
                const Icon = PAYMENT_ICONS[payment.type];
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{payment.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Money amount={payment.amount} />
                      <Button variant="ghost" size="sm" onClick={() => handleRemovePayment(index)}>
                        ×
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Payment */}
          {remaining > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Add Payment</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Method</Label>
                  <Select
                    value={currentPayment.type}
                    onValueChange={(value: PaymentType) => setCurrentPayment({ ...currentPayment, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">E-Wallet</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Amount</Label>
                  <Input
                    type="number"
                    value={currentPayment.amount || ''}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, amount: parseFloat(e.target.value) || 0 })}
                    step={0.01}
                    min={0}
                  />
                </div>
              </div>
              {currentPayment.type !== 'cash' && (
                <div>
                  <Label className="text-sm">Reference</Label>
                  <Input
                    value={currentPayment.ref || ''}
                    onChange={(e) => setCurrentPayment({ ...currentPayment, ref: e.target.value })}
                    placeholder="Transaction reference"
                  />
                </div>
              )}
              <Button onClick={handleAddPayment} className="w-full">
                Add Payment
              </Button>
            </div>
          )}

          {/* Payment Status */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Paid:</span>
              <Money amount={totalPaid} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <Money amount={remaining} />
            </div>
            {change > 0 && (
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>Change:</span>
                <Money amount={change} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={totalPaid < total}
              className="flex-1"
            >
              Complete Sale
              {totalPaid >= total && (
                <Badge variant="secondary" className="ml-2">
                  ✓
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}