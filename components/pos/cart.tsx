'use client';

import { CartItem, SaleUnit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/ui/money';
import { Trash2, Minus, Plus } from 'lucide-react';
import { saleUnitPrice } from '@/lib/utils/units';
import { evaluateBatches } from '@/lib/utils/fefo';

interface CartProps {
  items: CartItem[];
  onUpdateItem: (index: number, updates: Partial<CartItem>) => void;
  onRemoveItem: (index: number) => void;
}

export function Cart({ items, onUpdateItem, onRemoveItem }: CartProps) {
  const handleQuantityChange = (index: number, qty: number) => {
    if (qty > 0) {
      const item = items[index];
      const newPrice = saleUnitPrice(item.product, item.sale_unit);
      onUpdateItem(index, { qty, price_unit: newPrice });
    }
  };

  const handleUnitChange = (index: number, newUnit: SaleUnit) => {
    const item = items[index];
    const newPrice = saleUnitPrice(item.product, newUnit);
    onUpdateItem(index, { sale_unit: newUnit, price_unit: newPrice });
  };

  const handleDiscountChange = (index: number, type: 'percent' | 'amount', value: number) => {
    if (type === 'percent') {
      onUpdateItem(index, { discount_pct: value, discount_lkr: undefined });
    } else {
      onUpdateItem(index, { discount_lkr: value, discount_pct: undefined });
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">Cart is empty</p>
          <p className="text-sm">Add products to start a sale</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-4">
        {items.map((item, index) => {
          const evaluatedBatch = evaluateBatches([item.batch])[0];
          const lineTotal = item.qty * item.price_unit;
          let discountedTotal = lineTotal;
          
          // Apply markdown
          if (item.markdown_pct) {
            discountedTotal *= (1 - item.markdown_pct / 100);
          }
          
          // Apply line discount
          if (item.discount_pct) {
            discountedTotal *= (1 - item.discount_pct / 100);
          }
          if (item.discount_lkr) {
            discountedTotal -= item.discount_lkr;
          }

          return (
            <div key={index} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name_en}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.batch.lot || 'No Lot'}
                    </Badge>
                    {item.batch.expiry && (
                      <Badge variant="outline" className="text-xs">
                        Exp: {new Date(item.batch.expiry).toLocaleDateString()}
                      </Badge>
                    )}
                    {evaluatedBatch?.isNearExpiry && (
                      <Badge variant="secondary" className="text-xs">
                        Near Expiry
                      </Badge>
                    )}
                    {evaluatedBatch?.isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(index, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 1)}
                      className="text-center"
                      step={0.01}
                      min={0.01}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(index, item.qty + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Unit</label>
                  <Select value={item.sale_unit} onValueChange={(value) => handleUnitChange(index, value as SaleUnit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {item.product.allowed_sale_units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Discount %</label>
                  <Input
                    type="number"
                    value={item.discount_pct || ''}
                    onChange={(e) => handleDiscountChange(index, 'percent', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Discount LKR</label>
                  <Input
                    type="number"
                    value={item.discount_lkr || ''}
                    onChange={(e) => handleDiscountChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-600">
                  <Money amount={item.price_unit} /> × {item.qty}
                  {(item.discount_pct || item.discount_lkr || item.markdown_pct) && (
                    <span className="text-red-500 ml-2">
                      -{item.discount_pct ? `${item.discount_pct}%` : ''}
                      {item.discount_lkr ? `LKR ${item.discount_lkr}` : ''}
                      {item.markdown_pct ? ` (Markdown ${item.markdown_pct}%)` : ''}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-lg">
                  <Money amount={Math.max(0, discountedTotal)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}