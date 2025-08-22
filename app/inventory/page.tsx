'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/lib/stores/auth';
import { useProductsStore } from '@/lib/stores/products';
import { useBatchesStore } from '@/lib/stores/batches';
import { Money } from '@/components/ui/money';
import { evaluateBatches } from '@/lib/utils/fefo';
import { Package, Search, Plus, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const { products, loadProducts } = useProductsStore();
  const { batches, loadBatches, getBatchesByProduct } = useBatchesStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }

    loadProducts();
    loadBatches();
  }, [isAuthenticated, hasRole, router, loadProducts, loadBatches]);

  const filteredProducts = products.filter(product =>
    product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductStatus = (productId: string) => {
    const productBatches = getBatchesByProduct(productId);
    const evaluatedBatches = evaluateBatches(productBatches);
    
    const totalStock = productBatches.reduce((sum, batch) => sum + batch.on_hand, 0);
    const nearExpiryCount = evaluatedBatches.filter(b => b.isNearExpiry && !b.isExpired).length;
    const expiredCount = evaluatedBatches.filter(b => b.isExpired).length;
    
    const product = products.find(p => p.id === productId);
    const isLowStock = product?.min_stock ? totalStock < product.min_stock : false;

    return {
      totalStock,
      nearExpiryCount,
      expiredCount,
      isLowStock,
      value: productBatches.reduce((sum, batch) => sum + (batch.on_hand * batch.unit_cost), 0)
    };
  };

  // Summary statistics
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => getProductStatus(p.id).isLowStock).length;
  const nearExpiryProducts = products.filter(p => getProductStatus(p.id).nearExpiryCount > 0).length;
  const totalValue = products.reduce((sum, p) => sum + getProductStatus(p.id).value, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Package className="w-8 h-8 mr-3" />
            Inventory Management
          </h1>
          <p className="text-gray-600">Manage products, stock levels, and batch information</p>
        </div>
        <Button asChild>
          <Link href="/inventory/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{nearExpiryProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={totalValue} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getProductStatus(product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name_en}</div>
                        {product.name_si && (
                          <div className="text-sm text-gray-500">{product.name_si}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{status.totalStock} {product.base_unit}</span>
                        {status.isLowStock && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Money amount={status.value} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {status.expiredCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {status.expiredCount} Expired
                          </Badge>
                        )}
                        {status.nearExpiryCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {status.nearExpiryCount} Near Expiry
                          </Badge>
                        )}
                        {!status.expiredCount && !status.nearExpiryCount && !status.isLowStock && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Good
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inventory/${product.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}