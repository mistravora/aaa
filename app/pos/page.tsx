'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/stores/auth';
import { useProductsStore } from '@/lib/stores/products';
import { useBatchesStore } from '@/lib/stores/batches';
import { useCartStore } from '@/lib/stores/cart';
import { useSalesStore } from '@/lib/stores/sales';
import { useSettingsStore } from '@/lib/stores/settings';
import { TileGrid } from '@/components/pos/tile-grid';
import { Cart } from '@/components/pos/cart';
import { BatchPicker } from '@/components/pos/batch-picker';
import { PaymentDrawer } from '@/components/pos/payment-drawer';
import { Receipt80mm } from '@/components/pos/receipt-80mm';
import { Money } from '@/components/ui/money';
import { Product, CartItem, Batch, Sale } from '@/lib/types';
import { selectFefoBatch, calculateMarkdown, evaluateBatches } from '@/lib/utils/fefo';
import { saleUnitPrice, toBase } from '@/lib/utils/units';
import { calculateBill, processSale } from '@/lib/utils/billing';
import { printElement } from '@/lib/utils/print';
import { Search, ShoppingBag, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function POSPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { products, loadProducts, getProduct, searchProducts, getProductsByCategory, getProductByBarcode } = useProductsStore();
  const { batches, loadBatches, getBatchesByProduct, consumeStock } = useBatchesStore();
  const { items, addItem, updateItem, removeItem, clearCart, billDiscount, setBillDiscount, getSubtotal, getDiscountTotal, getMarkdownTotal } = useCartStore();
  const { addSale } = useSalesStore();
  const { settings } = useSettingsStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isOnline, setIsOnline] = useState(true);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Get filtered products
  const filteredProducts = searchQuery 
    ? searchProducts(searchQuery)
    : activeCategory === 'All' 
      ? products 
      : getProductsByCategory(activeCategory);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadProducts();
    loadBatches();

    // Setup offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, router, loadProducts, loadBatches]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (filteredProducts[index] && !showBatchPicker && !showPayment) {
          handleProductSelect(filteredProducts[index]);
        }
      } else if (e.key === 'Tab' && !showBatchPicker && !showPayment) {
        e.preventDefault();
        const searchInput = document.getElementById('product-search');
        searchInput?.focus();
      } else if (e.ctrlKey && e.key === 'p' && completedSale) {
        e.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredProducts, showBatchPicker, showPayment, completedSale]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    const productBatches = getBatchesByProduct(product.id).filter(b => b.on_hand > (b.reserved || 0));
    
    if (productBatches.length === 0) {
      toast.error('No stock available for this product');
      return;
    }

    if (productBatches.length === 1) {
      handleBatchSelect(productBatches[0]);
    } else {
      setAvailableBatches(productBatches);
      setShowBatchPicker(true);
    }
  };

  const handleBatchSelect = (batch: Batch, overrideReason?: string) => {
    if (!selectedProduct) return;

    const evaluatedBatch = evaluateBatches([batch])[0];
    const markdownPct = calculateMarkdown(evaluatedBatch, selectedProduct.price_base);
    const basePrice = saleUnitPrice(selectedProduct, selectedProduct.default_sale_unit);
    const finalPrice = basePrice * (1 - markdownPct / 100);

    const cartItem: CartItem = {
      product: selectedProduct,
      batch,
      qty: selectedProduct.base_unit === 'g' ? 0.5 : 1, // Default quantities
      sale_unit: selectedProduct.default_sale_unit,
      price_unit: finalPrice,
      markdown_pct: markdownPct > 0 ? markdownPct : undefined,
    };

    addItem(cartItem);
    setSelectedProduct(null);
    setShowBatchPicker(false);
    
    if (overrideReason) {
      toast.info(`Expired product added with override: ${overrideReason}`);
    }
  };

  const handlePayment = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const handleConfirmPayment = async (payments: any[]) => {
    try {
      const sale = await processSale(
        items,
        billDiscount,
        payments,
        user?.role || 'cashier',
        settings.taxes.mode,
        settings.taxes.rate,
        settings.taxes.rounding
      );

      // Consume stock for each line
      for (const line of sale.lines) {
        const product = getProduct(line.product_id);
        if (product) {
          const baseQty = toBase(product, line.qty, line.sale_unit);
          await consumeStock(line.batch_id, baseQty);
        }
      }

      await addSale(sale);
      
      setCompletedSale(sale);
      setShowReceipt(true);
      setShowPayment(false);
      clearCart();
      
      toast.success('Sale completed successfully!');
    } catch (error) {
      toast.error('Failed to process sale');
      console.error('Sale processing error:', error);
    }
  };

  const handlePrint = () => {
    if (completedSale) {
      printElement('receipt-80mm', 'Receipt');
    }
  };

  // Calculate totals
  const calculation = calculateBill(
    items,
    billDiscount,
    settings.taxes.mode,
    settings.taxes.rate,
    settings.taxes.rounding
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center flex items-center justify-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span>Working Offline - Data will sync when connection is restored</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="w-1/3 border-r flex flex-col bg-white">
          {/* Categories */}
          <div className="border-b p-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 4).map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Product Tiles */}
          <div className="flex-1 overflow-y-auto">
            <TileGrid products={filteredProducts.slice(0, 9)} onSelectProduct={handleProductSelect} />
          </div>
        </div>

        {/* Middle Panel - Cart */}
        <div className="w-1/3 border-r flex flex-col bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Cart ({items.length})
            </h2>
          </div>
          
          <Cart 
            items={items} 
            onUpdateItem={updateItem} 
            onRemoveItem={removeItem} 
          />
        </div>

        {/* Right Panel - Search & Totals */}
        <div className="w-1/3 flex flex-col bg-white">
          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="product-search"
                type="text"
                placeholder="Search products or scan barcode... (Tab to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press 1-9 to select items • Tab to search • Ctrl+P to print
            </p>
          </div>

          {/* Totals */}
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <Money amount={calculation.subtotal} />
              </div>
              
              {calculation.markdownTotal > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Markdown:</span>
                  <Money amount={-calculation.markdownTotal} />
                </div>
              )}
              
              {calculation.discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <Money amount={-calculation.discountTotal} />
                </div>
              )}
              
              {settings.taxes.enabled && calculation.vatTotal > 0 && (
                <div className="flex justify-between">
                  <span>VAT ({settings.taxes.rate}%):</span>
                  <Money amount={calculation.vatTotal} />
                </div>
              )}
              
              {calculation.rounding !== 0 && (
                <div className="flex justify-between">
                  <span>Rounding:</span>
                  <Money amount={calculation.rounding} />
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <Money amount={calculation.total} />
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              className="w-full h-12 text-lg"
              disabled={items.length === 0}
            >
              Pay - <Money amount={calculation.total} />
            </Button>

            {completedSale && (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                  <p className="text-green-800 font-medium">Sale Completed!</p>
                  <p className="text-green-600 text-sm">Bill: {completedSale.billNo}</p>
                </div>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  Print Receipt (Ctrl+P)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Picker Modal */}
      {selectedProduct && (
        <BatchPicker
          product={selectedProduct}
          batches={availableBatches}
          open={showBatchPicker}
          onClose={() => setShowBatchPicker(false)}
          onSelectBatch={handleBatchSelect}
        />
      )}

      {/* Payment Drawer */}
      <PaymentDrawer
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handleConfirmPayment}
        total={calculation.total}
        subtotal={calculation.subtotal}
        discountTotal={calculation.discountTotal}
        markdownTotal={calculation.markdownTotal}
        vatTotal={calculation.vatTotal}
        rounding={calculation.rounding}
        billDiscount={billDiscount}
        onBillDiscountChange={setBillDiscount}
      />

      {/* Hidden Receipt for Printing */}
      {completedSale && (
        <div className="hidden print:block">
          <Receipt80mm 
            sale={completedSale}
            products={products}
            batches={batches}
          />
        </div>
      )}
    </div>
  );
}