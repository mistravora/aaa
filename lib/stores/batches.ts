import { create } from 'zustand';
import { Batch } from '../types';
import { db } from '../db';

interface BatchesState {
  batches: Batch[];
  loading: boolean;
  loadBatches: () => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  getBatchesByProduct: (productId: string) => Batch[];
  getAvailableBatches: (productId: string) => Batch[];
  reserveStock: (batchId: string, qty: number) => Promise<void>;
  releaseStock: (batchId: string, qty: number) => Promise<void>;
  consumeStock: (batchId: string, qty: number) => Promise<void>;
}

export const useBatchesStore = create<BatchesState>((set, get) => ({
  batches: [],
  loading: false,

  loadBatches: async () => {
    set({ loading: true });
    try {
      const batches = await db.batches.toArray();
      set({ batches, loading: false });
    } catch (error) {
      console.error('Error loading batches:', error);
      set({ loading: false });
    }
  },

  addBatch: async (batchData) => {
    const batch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.batches.add(batch);
    set((state) => ({ batches: [...state.batches, batch] }));
  },

  updateBatch: async (id, updates) => {
    const updatedBatch = { ...updates, updatedAt: new Date().toISOString() };
    await db.batches.update(id, updatedBatch);
    
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === id ? { ...b, ...updatedBatch } : b
      ),
    }));
  },

  getBatchesByProduct: (productId) => {
    return get().batches.filter((b) => b.product_id === productId);
  },

  getAvailableBatches: (productId) => {
    return get().batches.filter(
      (b) => b.product_id === productId && (b.on_hand - (b.reserved || 0)) > 0
    );
  },

  reserveStock: async (batchId, qty) => {
    const { batches, updateBatch } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      await updateBatch(batchId, {
        reserved: (batch.reserved || 0) + qty,
      });
    }
  },

  releaseStock: async (batchId, qty) => {
    const { batches, updateBatch } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      await updateBatch(batchId, {
        reserved: Math.max(0, (batch.reserved || 0) - qty),
      });
    }
  },

  consumeStock: async (batchId, qty) => {
    const { batches, updateBatch } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      await updateBatch(batchId, {
        on_hand: Math.max(0, batch.on_hand - qty),
        reserved: Math.max(0, (batch.reserved || 0) - qty),
      });
    }
  },
}));