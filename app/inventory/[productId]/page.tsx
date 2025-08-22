'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/stores/auth';
import { useProductsStore } from '@/lib/stores/products';
import { useBatchesStore } from '@/lib/stores/batches';
import { Money } from '@/components/ui/money';
import { evaluateBatches } from '@/lib/utils/fefo';
import { ArrowLeft, Plus, Edit, Printer, AlertTriangle, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  params: {
    productId: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const { products, loadProducts } = useProductsStore();
  const { batches, loadBatches, getBatchesByProduct, addBatch } = useBatchesStore();

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [batchForm, setBatchForm] = useState({
    lot: '',
    expiry: '',
    unit_cost: 0,
    on_hand: 0,
  });
  const [adjustForm, setAdjustForm] = useState({
    reason: '',
    qty: 0,
    note: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
    loadProducts();
    loadBatches();
  }, [isAuthenticated, hasRole, router, loadProducts, loadBatches]);

  const product = products.find(p => p.id === params.productId);
  const productBatches = getBatchesByProduct(params.productId);
  const evaluatedBatches = evaluateBatches(productBatches);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/inventory')}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const handleAddBatch = async () => {
    if (!batchForm.unit_cost || !batchForm.on_hand) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (product.requires_expiry && !batchForm.expiry) {
      toast.error('Expiry date is required for this product');
      return;
    }

    try {
      await addBatch({
        product_id: params.productId,
        lot: batchForm.lot || undefined,
        expiry: batchForm.expiry || undefined,
        unit_cost: batchForm.unit_cost,
        on_hand: batchForm.on_hand,
      });

      toast.success('Batch added successfully');
      setShowAddBatch(false);
      setBatchForm({ lot: '', expiry: '', unit_cost: 0, on_hand: 0 });
    } catch (error) {
      toast.error('Failed to add batch');
    }
  };

  const handleStockAdjustment = () => {
    if (!adjustForm.reason || !adjustForm.qty) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Stock adjustment recorded');
    setShowAdjustStock(false);
    setAdjustForm({ reason: '', qty: 0, note: '' });
  };

  const totalStock = productBatches.reduce((sum, batch) => sum + batch.on_hand, 0);
  const totalValue = productBatches.reduce((sum, batch) => sum + (batch.on_hand * batch.unit_cost), 0);
  const nearExpiryCount = evaluatedBatches.filter(b => b.isNearExpiry && !b.isExpired).length;
  const expiredCount = evaluatedBatches.filter(b => b.isExpired).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/inventory')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name_en}</h1>
            <p className="text-gray-600">SKU: {product.sku} • Category: {product.category}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
        </div>
      </div>

      {/* Product Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock} {product.base_unit}</div>
            {product.min_stock && totalStock < product.min_stock && (
              <p className="text-xs text-red-600 flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Below minimum
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={totalValue} />
            </div>
            <p className="text-xs text-gray-500">At cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{nearExpiryCount}</div>
            <p className="text-xs text-gray-500">Batches ≤7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
            <p className="text-xs text-gray-500">Batches expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Details */}
      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Stock Batches</CardTitle>
              <div className="flex space-x-2">
                <Dialog open={showAdjustStock} onOpenChange={setShowAdjustStock}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Adjust Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Stock Adjustment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Reason *</Label>
                        <Select value={adjustForm.reason} onValueChange={(value) => setAdjustForm({...adjustForm, reason: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="damage">Damage</SelectItem>
                            <SelectItem value="melt">Melted</SelectItem>
                            <SelectItem value="wastage">Wastage</SelectItem>
                            <SelectItem value="audit">Audit Variance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity ({product.base_unit}) *</Label>
                        <Input
                          type="number"
                          value={adjustForm.qty || ''}
                          onChange={(e) => setAdjustForm({...adjustForm, qty: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Note</Label>
                        <Textarea
                          value={adjustForm.note}
                          onChange={(e) => setAdjustForm({...adjustForm, note: e.target.value})}
                          placeholder="Additional details..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAdjustStock(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleStockAdjustment}>
                          Record Adjustment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddBatch} onOpenChange={setShowAddBatch}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Batch
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Batch</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Lot/Batch Number</Label>
                        <Input
                          value={batchForm.lot}
                          onChange={(e) => setBatchForm({...batchForm, lot: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                      {product.requires_expiry && (
                        <div>
                          <Label>Expiry Date *</Label>
                          <Input
                            type="date"
                            value={batchForm.expiry}
                            onChange={(e) => setBatchForm({...batchForm, expiry: e.target.value})}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Unit Cost (per {product.base_unit}) *</Label>
                        <Input
                          type="number"
                          value={batchForm.unit_cost || ''}
                          onChange={(e) => setBatchForm({...batchForm, unit_cost: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Quantity ({product.base_unit}) *</Label>
                        <Input
                          type="number"
                          value={batchForm.on_hand || ''}
                          onChange={(e) => setBatchForm({...batchForm, on_hand: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddBatch(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddBatch}>
                          Add Batch
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>On Hand</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluatedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.lot || '-'}</TableCell>
                      <TableCell>
                        {batch.expiry ? (
                          <div className="flex items-center space-x-2">
                            <span>{new Date(batch.expiry).toLocaleDateString()}</span>
                            {batch.daysToExpiry !== undefined && (
                              <span className="text-xs text-gray-500">
                                ({batch.daysToExpiry}d)
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Money amount={batch.unit_cost} />
                      </TableCell>
                      <TableCell>{batch.on_hand} {product.base_unit}</TableCell>
                      <TableCell>
                        <Money amount={batch.on_hand * batch.unit_cost} />
                      </TableCell>
                      <TableCell>
                        {batch.isExpired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {batch.isNearExpiry && !batch.isExpired && (
                          <Badge variant="secondary">
                            <Calendar className="w-3 h-3 mr-1" />
                            Near Expiry
                          </Badge>
                        )}
                        {!batch.isExpired && !batch.isNearExpiry && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Good
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Names</Label>
                    <div className="space-y-1 text-sm">
                      <div>English: {product.name_en}</div>
                      {product.name_si && <div>Sinhala: {product.name_si}</div>}
                      {product.name_ta && <div>Tamil: {product.name_ta}</div>}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Units</Label>
                    <div className="space-y-1 text-sm">
                      <div>Base Unit: {product.base_unit}</div>
                      <div>Default Sale Unit: {product.default_sale_unit}</div>
                      <div>Allowed Units: {product.allowed_sale_units.join(', ')}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Pricing</Label>
                    <div className="space-y-1 text-sm">
                      <div>Base Price: <Money amount={product.price_base} />/{product.base_unit}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Settings</Label>
                    <div className="space-y-1 text-sm">
                      <div>Requires Expiry: {product.requires_expiry ? 'Yes' : 'No'}</div>
                      {product.min_stock && <div>Min Stock: {product.min_stock} {product.base_unit}</div>}
                      {product.reorder_point_days && <div>Reorder Point: {product.reorder_point_days} days</div>}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Barcodes</Label>
                    <div className="space-y-1">
                      {product.barcodes.map((barcode, index) => (
                        <div key={index} className="font-mono text-sm bg-gray-100 p-2 rounded">
                          {barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels">
          <Card>
            <CardHeader>
              <CardTitle>Print Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Printer className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Label Printing</h3>
                <p className="text-gray-600 mb-4">
                  Label printing functionality coming soon. Will support 80mm and 50×30mm formats.
                </p>
                <Button disabled>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Labels
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}