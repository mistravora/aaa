import { create } from 'zustand';
import { CartItem, SaleUnit } from '../types';

interface CartState {
  items: CartItem[];
  billDiscount: { type: 'percent' | 'amount'; value: number } | null;
  addItem: (item: CartItem) => void;
  updateItem: (index: number, updates: Partial<CartItem>) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setBillDiscount: (discount: { type: 'percent' | 'amount'; value: number } | null) => void;
  getSubtotal: () => number;
  getDiscountTotal: () => number;
  getMarkdownTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  billDiscount: null,

  addItem: (item) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.product.id === item.product.id && i.batch.id === item.batch.id && i.sale_unit === item.sale_unit
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          qty: updatedItems[existingIndex].qty + item.qty,
        };
        return { items: updatedItems };
      } else {
        return { items: [...state.items, item] };
      }
    });
  },

  updateItem: (index, updates) => {
    set((state) => ({
      items: state.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }));
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  clearCart: () => {
    set({ items: [], billDiscount: null });
  },

  setBillDiscount: (discount) => {
    set({ billDiscount: discount });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      let lineTotal = item.qty * item.price_unit;
      
      // Apply markdown
      if (item.markdown_pct) {
        lineTotal *= (1 - item.markdown_pct / 100);
      }
      
      // Apply line discount
      if (item.discount_pct) {
        lineTotal *= (1 - item.discount_pct / 100);
      }
      if (item.discount_lkr) {
        lineTotal -= item.discount_lkr;
      }
      
      return total + Math.max(0, lineTotal);
    }, 0);
  },

  getDiscountTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      let lineTotal = item.qty * item.price_unit;
      let discount = 0;
      
      if (item.discount_pct) {
        discount += lineTotal * (item.discount_pct / 100);
      }
      if (item.discount_lkr) {
        discount += item.discount_lkr;
      }
      
      return total + discount;
    }, 0);
  },

  getMarkdownTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      if (item.markdown_pct) {
        const lineTotal = item.qty * item.price_unit;
        return total + (lineTotal * (item.markdown_pct / 100));
      }
      return total;
    }, 0);
  },
}));