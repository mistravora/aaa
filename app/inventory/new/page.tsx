'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { useProductsStore } from '@/lib/stores/products';
import { Product, SaleUnit, UnitBase } from '@/lib/types';
import { generateInternalBarcode } from '@/lib/utils/barcode';
import { Package, Save, ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'Chocolates',
  'Dates & Nuts',
  'Beverages',
  'Confectionery',
  'Gift Items',
  'Seasonal',
];

const saleUnits: SaleUnit[] = ['kg', 'g', '100g', 'pcs', 'pack'];

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const { addProduct } = useProductsStore();

  const [formData, setFormData] = useState({
    sku: '',
    name_en: '',
    name_si: '',
    name_ta: '',
    category: '',
    base_unit: 'g' as UnitBase,
    default_sale_unit: 'kg' as SaleUnit,
    allowed_sale_units: ['kg', 'g'] as SaleUnit[],
    price_base: 0,
    requires_expiry: false,
    min_stock: 0,
    reorder_point_days: 30,
  });

  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [newBarcode, setNewBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaleUnitToggle = (unit: SaleUnit, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        allowed_sale_units: [...prev.allowed_sale_units, unit]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        allowed_sale_units: prev.allowed_sale_units.filter(u => u !== unit)
      }));
    }
  };

  const addBarcode = () => {
    if (newBarcode.trim() && !barcodes.includes(newBarcode.trim())) {
      setBarcodes([...barcodes, newBarcode.trim()]);
      setNewBarcode('');
    }
  };

  const removeBarcode = (barcode: string) => {
    setBarcodes(barcodes.filter(b => b !== barcode));
  };

  const generateInternalCode = () => {
    if (formData.sku) {
      const internalCode = generateInternalBarcode(formData.sku);
      if (!barcodes.includes(internalCode)) {
        setBarcodes([...barcodes, internalCode]);
      }
    } else {
      toast.error('Please enter SKU first');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name_en || !formData.category || formData.price_base <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.allowed_sale_units.length === 0) {
      toast.error('Please select at least one sale unit');
      return;
    }

    if (!formData.allowed_sale_units.includes(formData.default_sale_unit)) {
      toast.error('Default sale unit must be in allowed sale units');
      return;
    }

    setLoading(true);
    try {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        barcodes,
        vat_rate: undefined,
        pack_bom: undefined,
        min_stock: formData.min_stock || undefined,
        reorder_point_days: formData.reorder_point_days || undefined,
        archived: false,
      };

      await addProduct(productData);
      toast.success('Product created successfully');
      router.push('/inventory');
    } catch (error) {
      toast.error('Failed to create product');
    }
    setLoading(false);
  };

  const getCompatibleUnits = (baseUnit: UnitBase): SaleUnit[] => {
    if (baseUnit === 'g') {
      return ['kg', 'g', '100g'];
    } else {
      return ['pcs', 'pack'];
    }
  };

  const compatibleUnits = getCompatibleUnits(formData.base_unit);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Package className="w-8 h-8 mr-3" />
            Add New Product
          </h1>
          <p className="text-gray-600">Create a new product in your inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>SKU *</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="e.g., DC001"
                  required
                />
              </div>

              <div>
                <Label>Product Name (English) *</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  placeholder="e.g., Premium Dark Chocolate"
                  required
                />
              </div>

              <div>
                <Label>Product Name (Sinhala)</Label>
                <Input
                  value={formData.name_si}
                  onChange={(e) => handleInputChange('name_si', e.target.value)}
                  placeholder="සිංහල නම"
                />
              </div>

              <div>
                <Label>Product Name (Tamil)</Label>
                <Input
                  value={formData.name_ta}
                  onChange={(e) => handleInputChange('name_ta', e.target.value)}
                  placeholder="தமிழ் பெயர்"
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Units & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Units & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Base Unit *</Label>
                <Select 
                  value={formData.base_unit} 
                  onValueChange={(value: UnitBase) => {
                    handleInputChange('base_unit', value);
                    const compatible = getCompatibleUnits(value);
                    handleInputChange('allowed_sale_units', compatible.slice(0, 2));
                    handleInputChange('default_sale_unit', compatible[0]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Price per {formData.base_unit} (LKR) *</Label>
                <Input
                  type="number"
                  value={formData.price_base || ''}
                  onChange={(e) => handleInputChange('price_base', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label>Default Sale Unit *</Label>
                <Select 
                  value={formData.default_sale_unit} 
                  onValueChange={(value: SaleUnit) => handleInputChange('default_sale_unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {compatibleUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Allowed Sale Units *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {compatibleUnits.map(unit => (
                    <div key={unit} className="flex items-center space-x-2">
                      <Checkbox
                        id={unit}
                        checked={formData.allowed_sale_units.includes(unit)}
                        onCheckedChange={(checked) => handleSaleUnitToggle(unit, checked as boolean)}
                      />
                      <Label htmlFor={unit}>{unit}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barcodes */}
          <Card>
            <CardHeader>
              <CardTitle>Barcodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  placeholder="Enter barcode"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBarcode())}
                />
                <Button type="button" onClick={addBarcode} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button type="button" onClick={generateInternalCode} variant="outline" size="sm">
                Generate Internal Code
              </Button>

              <div className="space-y-2">
                {barcodes.map((barcode, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{barcode}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBarcode(barcode)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_expiry"
                  checked={formData.requires_expiry}
                  onCheckedChange={(checked) => handleInputChange('requires_expiry', checked)}
                />
                <Label htmlFor="requires_expiry">Requires Expiry Date</Label>
              </div>

              <div>
                <Label>Minimum Stock ({formData.base_unit})</Label>
                <Input
                  type="number"
                  value={formData.min_stock || ''}
                  onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label>Reorder Point (Days)</Label>
                <Input
                  type="number"
                  value={formData.reorder_point_days || ''}
                  onChange={(e) => handleInputChange('reorder_point_days', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}