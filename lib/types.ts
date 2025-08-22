export type UnitBase = "g" | "pcs";
export type SaleUnit = "kg" | "g" | "100g" | "pcs" | "pack";
export type TaxMode = "none" | "inclusive" | "exclusive";
export type Role = "owner" | "manager" | "cashier";
export type PaymentMethod = "cash" | "card" | "wallet" | "bank";

export interface User {
  email: string;
  role: Role;
  password: string;
}

export interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  category?: string;
  base_unit: UnitBase;
  default_sale_unit: SaleUnit;
  allowed_sale_units: SaleUnit[];
  price_base: number;
  vat_rate?: number;
  barcodes: string[];
  requires_expiry: boolean;
  pack_bom?: { piece_sku: string; count: number };
  min_stock?: number;
  reorder_point_days?: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  product_id: string;
  lot?: string;
  expiry?: string;
  unit_cost: number;
  on_hand: number;
  reserved?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleLine {
  product_id: string;
  batch_id: string;
  qty: number;
  sale_unit: SaleUnit;
  price_unit: number;
  discount_pct?: number;
  discount_lkr?: number;
  markdown_pct?: number;
  pack_break_ref?: { from_pack_sku: string; count: number } | null;
  cogs_base?: number;
}

export interface Payment {
  type: PaymentMethod;
  amount: number;
  ref?: string;
}

export interface Sale {
  id: string;
  billNo: string;
  saleClientId: string;
  saleAt: string;
  cashier_role: Role;
  tax_mode: TaxMode;
  tax_rate: number;
  subtotal: number;
  discount_total: number;
  markdown_total: number;
  vat_total: number;
  rounding: number;
  total: number;
  payments: Payment[];
  lines: SaleLine[];
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  terms_days?: number;
  trn?: string;
  note?: string;
}

export interface SupplierInvoice {
  id: string;
  supplier_id: string;
  invoice_no: string;
  date: string;
  due_date: string;
  total: number;
  balance: number;
}

export interface SupplierPayment {
  id: string;
  invoice_id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  ref?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  payee?: string;
  note?: string;
  doc_url?: string;
}

export interface Register {
  id: string;
  opened_by: Role;
  opened_ts: string;
  opening_float: number;
  closed_by?: Role;
  closed_ts?: string;
  counted_cash?: number;
  expected_cash?: number;
  variance?: number;
}

export interface PettyCashEntry {
  id: string;
  register_id: string;
  type: "opening_float" | "cash_in" | "cash_out" | "eod_count";
  amount: number;
  reason?: string;
  user_role: Role;
  ts: string;
}

export interface Settings {
  taxes: {
    enabled: boolean;
    rate: number;
    mode: TaxMode;
    rounding: 1 | 0.5 | 0 | null;
  };
  payments: {
    cash: boolean;
    card: boolean;
    wallet: boolean;
    bank: boolean;
  };
  units_default: {
    base_loose: "g";
    sale_loose: "kg";
    allowed_loose: SaleUnit[];
    kg_step: number;
    g_step: number;
    pcs_step: number;
  };
  petty_cash: {
    enforce: boolean;
    variance_threshold_lkr: number;
    admin_override: boolean;
  };
  returns: {
    days_allowed: number;
    require_receipt: boolean;
    refund_methods: ("cash" | "bank")[];
    limit_to_original_tender: boolean;
  };
}

export interface CartItem {
  product: Product;
  batch: Batch;
  qty: number;
  sale_unit: SaleUnit;
  price_unit: number;
  discount_pct?: number;
  discount_lkr?: number;
  markdown_pct?: number;
}

export interface BillSequence {
  date: string;
  last_sequence: number;
}