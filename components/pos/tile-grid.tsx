'use client';

import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Money } from '@/components/ui/money';
import { saleUnitPrice } from '@/lib/utils/units';

interface TileGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function TileGrid({ products, onSelectProduct }: TileGridProps) {
  const displayProducts = products.slice(0, 9);

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {displayProducts.map((product, index) => (
        <Button
          key={product.id}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center p-2 text-center relative"
          onClick={() => onSelectProduct(product)}
        >
          <div className="absolute top-1 left-1 text-xs text-gray-500 bg-gray-100 px-1 rounded">
            {index + 1}
          </div>
          
          <div className="font-medium text-sm line-clamp-2 mb-1">
            {product.name_en}
          </div>
          
          <div className="text-xs text-green-600 font-semibold">
            <Money 
              amount={saleUnitPrice(product, product.default_sale_unit)} 
            />
            /{product.default_sale_unit}
          </div>
          
          {product.requires_expiry && (
            <Badge variant="secondary" className="absolute top-1 right-1 text-xs px-1 py-0">
              EXP
            </Badge>
          )}
        </Button>
      ))}
      
      {/* Fill remaining slots with empty tiles */}
      {Array.from({ length: 9 - displayProducts.length }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="h-24 border-2 border-dashed border-gray-200 rounded flex items-center justify-center"
        >
          <span className="text-gray-400 text-sm">{displayProducts.length + index + 1}</span>
        </div>
      ))}
    </div>
  );
}