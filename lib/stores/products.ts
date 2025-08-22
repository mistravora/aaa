import { create } from 'zustand';
import { Product } from '../types';
import { db } from '../db';

interface ProductsState {
  products: Product[];
  loading: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  getProductByBarcode: (barcode: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,

  loadProducts: async () => {
    set({ loading: true });
    try {
      if (!db) {
        set({ loading: false });
        return;
      }
      const products = await db.products.where('archived').notEqual(true).toArray();
      set({ products, loading: false });
    } catch (error) {
      console.error('Error loading products:', error);
      set({ loading: false });
    }
  },

  addProduct: async (productData) => {
    const product: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.products.add(product);
    set((state) => ({ products: [...state.products, product] }));
  },

  updateProduct: async (id, updates) => {
    const updatedProduct = { ...updates, updatedAt: new Date().toISOString() };
    await db.products.update(id, updatedProduct);
    
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    }));
  },

  deleteProduct: async (id) => {
    await db.products.update(id, { archived: true });
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  getProduct: (id) => {
    return get().products.find((p) => p.id === id);
  },

  searchProducts: (query) => {
    const { products } = get();
    return products.filter(
      (p) =>
        p.name_en.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.barcodes.some((b) => b.includes(query))
    );
  },

  getProductsByCategory: (category) => {
    return get().products.filter((p) => p.category === category);
  },

  getProductByBarcode: (barcode) => {
    return get().products.find((p) => p.barcodes.includes(barcode));
  },
}));