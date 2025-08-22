'use client';

import { useState } from 'react';
import { Batch, Product } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { evaluateBatches, selectFefoBatch } from '@/lib/utils/fefo';
import { Money } from '@/components/ui/money';

interface BatchPickerProps {
  product: Product;
  batches: Batch[];
  open: boolean;
  onClose: () => void;
  onSelectBatch: (batch: Batch, overrideReason?: string) => void;
}

export function BatchPicker({ product, batches, open, onClose, onSelectBatch }: BatchPickerProps) {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const evaluatedBatches = evaluateBatches(batches);
  const recommendedBatch = selectFefoBatch(batches, 1);

  const handleSelectBatch = (batch: Batch) => {
    const evaluated = evaluatedBatches.find(b => b.id === batch.id);
    
    if (evaluated?.isExpired) {
      setSelectedBatch(batch);
      setShowOverride(true);
    } else {
      onSelectBatch(batch);
      onClose();
    }
  };

  const handleOverrideConfirm = () => {
    if (selectedBatch && overrideReason.trim()) {
      onSelectBatch(selectedBatch, overrideReason);
      setShowOverride(false);
      setOverrideReason('');
      setSelectedBatch(null);
      onClose();
    }
  };

  if (showOverride) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manager Override Required</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">Expired Batch Selected</p>
              <p className="text-red-600 text-sm">
                This batch has expired and requires manager approval to sell.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Override
              </label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter reason for selling expired product..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowOverride(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleOverrideConfirm}
                disabled={!overrideReason.trim()}
              >
                Override & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Batch - {product.name_en}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {recommendedBatch && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-medium text-sm">
                FEFO Recommended: Lot {recommendedBatch.lot}
              </p>
            </div>
          )}
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {evaluatedBatches.map((batch) => (
              <div
                key={batch.id}
                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                  batch.id === recommendedBatch?.id ? 'ring-2 ring-green-500' : ''
                } ${
                  batch.isExpired ? 'bg-red-50 border-red-200' : 
                  batch.isNearExpiry ? 'bg-yellow-50 border-yellow-200' : ''
                }`}
                onClick={() => handleSelectBatch(batch)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      Lot: {batch.lot || 'No Lot'}
                      {batch.id === recommendedBatch?.id && (
                        <Badge variant="default" className="ml-2">FEFO</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>On Hand: {batch.on_hand} {product.base_unit}</span>
                      <span>Cost: <Money amount={batch.unit_cost} />/{product.base_unit}</span>
                    </div>
                    
                    {batch.expiry && (
                      <div className="text-sm">
                        Expiry: {new Date(batch.expiry).toLocaleDateString()}
                        {batch.daysToExpiry !== undefined && (
                          <span className="ml-2">
                            ({batch.daysToExpiry} days)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {batch.isExpired && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {batch.isNearExpiry && !batch.isExpired && (
                      <Badge variant="secondary">Near Expiry</Badge>
                    )}
                    {batch.reserved && batch.reserved > 0 && (
                      <Badge variant="outline">Reserved: {batch.reserved}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}