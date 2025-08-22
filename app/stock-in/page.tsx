'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { useProductsStore } from '@/lib/stores/products';
import { useBatchesStore } from '@/lib/stores/batches';
import { Money } from '@/components/ui/money';
import { TruckIcon, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StockInLine {
  id: string;
  product_id: string;
  qty: number;
  unit_cost: number;
  lot?: string;
  expiry?: string;
}

const mockSuppliers = [
  { id: '1', name: 'Cocoa Imports Lanka' },
  { id: '2', name: 'Premium Nuts & Dates' },
  { id: '3', name: 'Beverage Supplies Lanka' },
];

export default function StockInPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const { products, loadProducts } = useProductsStore();
  const { addBatch } = useBatchesStore();

  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<StockInLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
    loadProducts();
  }, [isAuthenticated, hasRole, router, loadProducts]);

  const addLine = () => {
    const newLine: StockInLine = {
      id: crypto.randomUUID(),
      product_id: '',
      qty: 0,
      unit_cost: 0,
      lot: '',
      expiry: '',
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<StockInLine>) => {
    setLines(lines.map(line => line.id === id ? { ...line, ...updates } : line));
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const handleSave = async () => {
    if (!supplierId || !invoiceNo || lines.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate lines
    for (const line of lines) {
      if (!line.product_id || line.qty <= 0 || line.unit_cost <= 0) {
        toast.error('Please complete all line items');
        return;
      }

      const product = products.find(p => p.id === line.product_id);
      if (product?.requires_expiry && !line.expiry) {
        toast.error(`Expiry date required for ${product.name_en}`);
        return;
      }
    }

    setLoading(true);
    try {
      // Create batches for each line
      for (const line of lines) {
        const product = products.find(p => p.id === line.product_id);
        if (product) {
          await addBatch({
            product_id: line.product_id,
            lot: line.lot || undefined,
            expiry: line.expiry || undefined,
            unit_cost: line.unit_cost,
            on_hand: line.qty,
          });
        }
      }

      toast.success('Stock received successfully');
      
      // Reset form
      setSupplierId('');
      setInvoiceNo('');
      setDate(new Date().toISOString().split('T')[0]);
      setLines([]);
    } catch (error) {
      toast.error('Failed to save stock in');
    }
    setLoading(false);
  };

  const getProduct = (id: string) => products.find(p => p.id === id);
  const totalValue = lines.reduce((sum, line) => sum + (line.qty * line.unit_cost), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <TruckIcon className="w-8 h-8 mr-3" />
            Stock In
          </h1>
          <p className="text-gray-600">Receive stock from suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Invoice Number *</Label>
              <Input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value:</span>
                <span className="text-lg font-bold">
                  <Money amount={totalValue} />
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Receipt'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button onClick={addLine} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {lines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TruckIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet</p>
                <p className="text-sm">Click "Add Item" to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lines.map((line) => {
                  const product = getProduct(line.product_id);
                  return (
                    <div key={line.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Product *</Label>
                            <Select 
                              value={line.product_id} 
                              onValueChange={(value) => updateLine(line.id, { product_id: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name_en} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Quantity * ({product?.base_unit || 'units'})</Label>
                            <Input
                              type="number"
                              value={line.qty || ''}
                              onChange={(e) => updateLine(line.id, { qty: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <Label>Unit Cost * (per {product?.base_unit || 'unit'})</Label>
                            <Input
                              type="number"
                              value={line.unit_cost || ''}
                              onChange={(e) => updateLine(line.id, { unit_cost: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <Label>Lot/Batch</Label>
                            <Input
                              value={line.lot || ''}
                              onChange={(e) => updateLine(line.id, { lot: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>

                          {product?.requires_expiry && (
                            <div className="md:col-span-2">
                              <Label>Expiry Date *</Label>
                              <Input
                                type="date"
                                value={line.expiry || ''}
                                onChange={(e) => updateLine(line.id, { expiry: e.target.value })}
                              />
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {product && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{product.sku}</Badge>
                            {product.requires_expiry && (
                              <Badge variant="secondary">Requires Expiry</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Line Total</div>
                            <div className="font-semibold">
                              <Money amount={line.qty * line.unit_cost} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}