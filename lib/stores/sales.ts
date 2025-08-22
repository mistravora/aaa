import { create } from 'zustand';
import { Sale } from '../types';
import { db } from '../db';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  loadSales: () => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[];
  getTodaysSales: () => Sale[];
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  loading: false,

  loadSales: async () => {
    set({ loading: true });
    try {
      if (!db) {
        set({ loading: false });
        return;
      }
      const sales = await db.sales.orderBy('saleAt').reverse().toArray();
      set({ sales, loading: false });
    } catch (error) {
      console.error('Error loading sales:', error);
      set({ loading: false });
    }
  },

  addSale: async (sale) => {
    await db.sales.add(sale);
    set((state) => ({ sales: [sale, ...state.sales] }));
  },

  getSalesByDateRange: (startDate, endDate) => {
    return get().sales.filter(
      (s) => s.saleAt >= startDate && s.saleAt <= endDate
    );
  },

  getTodaysSales: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sales.filter((s) => s.saleAt.startsWith(today));
  },
}));