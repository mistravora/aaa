import { Batch, Product } from '../types';

export interface BatchWithExpiry extends Batch {
  isExpired: boolean;
  isNearExpiry: boolean;
  daysToExpiry?: number;
}

export function evaluateBatches(batches: Batch[]): BatchWithExpiry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return batches.map(batch => {
    const result: BatchWithExpiry = {
      ...batch,
      isExpired: false,
      isNearExpiry: false,
    };
    
    if (batch.expiry) {
      const expiryDate = new Date(batch.expiry);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      result.daysToExpiry = daysDiff;
      
      if (daysDiff < 0) {
        result.isExpired = true;
      } else if (daysDiff <= 7) {
        result.isNearExpiry = true;
      }
    }
    
    return result;
  });
}

export function selectFefoBatch(batches: Batch[], qtyNeeded: number): Batch | null {
  const availableBatches = batches.filter(b => (b.on_hand - (b.reserved || 0)) > 0);
  const evaluatedBatches = evaluateBatches(availableBatches);
  
  // Filter out expired batches for automatic selection
  const validBatches = evaluatedBatches.filter(b => !b.isExpired);
  
  if (validBatches.length === 0) {
    return null;
  }
  
  // Sort by expiry date (earliest first), then by creation date
  validBatches.sort((a, b) => {
    if (a.expiry && b.expiry) {
      const dateA = new Date(a.expiry).getTime();
      const dateB = new Date(b.expiry).getTime();
      if (dateA !== dateB) return dateA - dateB;
    } else if (a.expiry && !b.expiry) {
      return -1; // Expiring items first
    } else if (!a.expiry && b.expiry) {
      return 1;
    }
    
    // Secondary sort by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  return validBatches[0];
}

export function calculateMarkdown(batch: BatchWithExpiry, basePrice: number): number {
  if (batch.isNearExpiry && batch.daysToExpiry !== undefined) {
    if (batch.daysToExpiry <= 1) return 30; // 30% off for 1 day or less
    if (batch.daysToExpiry <= 3) return 20; // 20% off for 2-3 days
    if (batch.daysToExpiry <= 7) return 10; // 10% off for 4-7 days
  }
  return 0;
}