import Dexie, { Table } from 'dexie';
import {
  Product,
  Batch,
  Sale,
  Supplier,
  SupplierInvoice,
  SupplierPayment,
  Expense,
  Register,
  PettyCashEntry,
  BillSequence,
} from './types';

export class PosDatabase extends Dexie {
  products!: Table<Product>;
  batches!: Table<Batch>;
  sales!: Table<Sale>;
  suppliers!: Table<Supplier>;
  supplier_invoices!: Table<SupplierInvoice>;
  supplier_payments!: Table<SupplierPayment>;
  expenses!: Table<Expense>;
  registers!: Table<Register>;
  petty_cash_entries!: Table<PettyCashEntry>;
  bill_sequences!: Table<BillSequence>;

  constructor() {
    super('DubaiPosDB');
    
    this.version(1).stores({
      products: 'id, sku, name_en, category, *barcodes, archived',
      batches: 'id, product_id, expiry, on_hand',
      sales: 'id, billNo, saleClientId, saleAt, cashier_role, total',
      suppliers: 'id, name',
      supplier_invoices: 'id, supplier_id, invoice_no, date, due_date, balance',
      supplier_payments: 'id, invoice_id, date, amount',
      expenses: 'id, category, date, amount',
      registers: 'id, opened_ts, closed_ts, opened_by',
      petty_cash_entries: 'id, register_id, type, ts, user_role',
      bill_sequences: 'date, last_sequence',
    });
  }
}

// Only initialize database in browser environment
export const db = typeof window !== 'undefined' ? new PosDatabase() : null as any;