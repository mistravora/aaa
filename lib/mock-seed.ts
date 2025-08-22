import { Product, Batch, Supplier, SupplierInvoice, Expense } from './types';
import { db } from './db';
import { addDays } from './utils/time';

export async function seedMockData() {
  try {
    // Clear existing data
    await Promise.all([
      db.products.clear(),
      db.batches.clear(),
      db.suppliers.clear(),
      db.supplier_invoices.clear(),
      db.expenses.clear(),
    ]);

    // Seed products
    const products: Product[] = [
      {
        id: '1',
        sku: 'CHOC001',
        name_en: 'Dark Chocolate Bar 85%',
        name_si: 'අදුනු චොකලට් බාර් 85%',
        category: 'Chocolates',
        base_unit: 'pcs',
        default_sale_unit: 'pcs',
        allowed_sale_units: ['pcs'],
        price_base: 850,
        barcodes: ['4791234567890', '2001234567890'],
        requires_expiry: true,
        min_stock: 20,
        reorder_point_days: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        sku: 'CHOC002',
        name_en: 'Milk Chocolate Truffles',
        name_si: 'කිරි චොකලට් ට්‍රෆල්',
        category: 'Chocolates',
        base_unit: 'g',
        default_sale_unit: 'kg',
        allowed_sale_units: ['kg', 'g', '100g'],
        price_base: 4.5,
        barcodes: ['4791234567891'],
        requires_expiry: true,
        min_stock: 1000,
        reorder_point_days: 21,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        sku: 'DATES001',
        name_en: 'Medjool Dates Premium',
        name_si: 'මෙද්ජුල් දෙහි ප්‍රීමියම්',
        category: 'Dates & Nuts',
        base_unit: 'g',
        default_sale_unit: 'kg',
        allowed_sale_units: ['kg', 'g', '100g'],
        price_base: 3.2,
        barcodes: ['4791234567892'],
        requires_expiry: true,
        min_stock: 2000,
        reorder_point_days: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        sku: 'NUTS001',
        name_en: 'Cashew Nuts Raw',
        name_si: 'කජු අමු',
        category: 'Dates & Nuts',
        base_unit: 'g',
        default_sale_unit: 'kg',
        allowed_sale_units: ['kg', 'g', '100g'],
        price_base: 2.8,
        barcodes: ['4791234567893'],
        requires_expiry: false,
        min_stock: 5000,
        reorder_point_days: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        sku: 'BEV001',
        name_en: 'Ceylon Black Tea Premium',
        name_si: 'ලංකා කළු තේ ප්‍රීමියම්',
        category: 'Beverages',
        base_unit: 'g',
        default_sale_unit: 'g',
        allowed_sale_units: ['g', '100g'],
        price_base: 0.15,
        barcodes: ['4791234567894'],
        requires_expiry: true,
        min_stock: 2000,
        reorder_point_days: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.products.bulkAdd(products);

    // Seed batches
    const today = new Date();
    const batches: Batch[] = [
      {
        id: '1',
        product_id: '1',
        lot: 'LOT001',
        expiry: addDays(today, 120).toISOString().split('T')[0],
        unit_cost: 650,
        on_hand: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        product_id: '1',
        lot: 'LOT002',
        expiry: addDays(today, 5).toISOString().split('T')[0], // Near expiry
        unit_cost: 650,
        on_hand: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        product_id: '2',
        lot: 'LOT003',
        expiry: addDays(today, 90).toISOString().split('T')[0],
        unit_cost: 3.2,
        on_hand: 2500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        product_id: '2',
        lot: 'LOT004',
        expiry: addDays(today, -2).toISOString().split('T')[0], // Expired
        unit_cost: 3.2,
        on_hand: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        product_id: '3',
        lot: 'LOT005',
        expiry: addDays(today, 60).toISOString().split('T')[0],
        unit_cost: 2.5,
        on_hand: 3000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        product_id: '4',
        lot: 'LOT006',
        unit_cost: 2.3,
        on_hand: 8000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        product_id: '5',
        lot: 'LOT007',
        expiry: addDays(today, 730).toISOString().split('T')[0],
        unit_cost: 0.12,
        on_hand: 5000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.batches.bulkAdd(batches);

    // Seed suppliers
    const suppliers: Supplier[] = [
      {
        id: '1',
        name: 'Premium Chocolates Ltd',
        phone: '+94112345678',
        email: 'orders@premiumchoc.lk',
        address: '123 Chocolate Street, Colombo 03',
        terms_days: 30,
        trn: '134567890',
      },
      {
        id: '2',
        name: 'Tropical Nuts & Dates Co.',
        phone: '+94117654321',
        email: 'sales@tropical.lk',
        address: '456 Export Avenue, Negombo',
        terms_days: 45,
        trn: '234567891',
      },
      {
        id: '3',
        name: 'Ceylon Tea Estates',
        phone: '+94812345678',
        email: 'wholesale@ceylontea.lk',
        address: '789 Tea Garden Road, Kandy',
        terms_days: 21,
        trn: '345678912',
      },
    ];

    await db.suppliers.bulkAdd(suppliers);

    // Seed supplier invoices
    const invoices: SupplierInvoice[] = [
      {
        id: '1',
        supplier_id: '1',
        invoice_no: 'PC-2024-001',
        date: addDays(today, -15).toISOString().split('T')[0],
        due_date: addDays(today, 15).toISOString().split('T')[0],
        total: 45000,
        balance: 45000,
      },
      {
        id: '2',
        supplier_id: '2',
        invoice_no: 'TN-2024-015',
        date: addDays(today, -60).toISOString().split('T')[0],
        due_date: addDays(today, -15).toISOString().split('T')[0], // Overdue
        total: 78000,
        balance: 25000,
      },
      {
        id: '3',
        supplier_id: '3',
        invoice_no: 'CTE-2024-089',
        date: addDays(today, -10).toISOString().split('T')[0],
        due_date: addDays(today, 11).toISOString().split('T')[0],
        total: 15000,
        balance: 0,
      },
    ];

    await db.supplier_invoices.bulkAdd(invoices);

    // Seed expenses
    const expenses: Expense[] = [
      {
        id: '1',
        category: 'Utilities',
        amount: 12500,
        date: addDays(today, -5).toISOString().split('T')[0],
        payee: 'Ceylon Electricity Board',
        note: 'Monthly electricity bill',
      },
      {
        id: '2',
        category: 'Transport',
        amount: 8500,
        date: addDays(today, -3).toISOString().split('T')[0],
        payee: 'Delivery Services Ltd',
        note: 'Product delivery charges',
      },
      {
        id: '3',
        category: 'Marketing',
        amount: 25000,
        date: addDays(today, -7).toISOString().split('T')[0],
        payee: 'Digital Marketing Pro',
        note: 'Social media advertising',
      },
      {
        id: '4',
        category: 'Maintenance',
        amount: 15000,
        date: addDays(today, -12).toISOString().split('T')[0],
        payee: 'Shop Repair Services',
        note: 'Air conditioning service',
      },
      {
        id: '5',
        category: 'Office Supplies',
        amount: 3500,
        date: addDays(today, -2).toISOString().split('T')[0],
        payee: 'Stationery Mart',
        note: 'Printer paper and ink',
      },
      {
        id: '6',
        category: 'Insurance',
        amount: 18000,
        date: addDays(today, -20).toISOString().split('T')[0],
        payee: 'Lanka Insurance Company',
        note: 'Monthly business insurance premium',
      },
    ];

    await db.expenses.bulkAdd(expenses);

    console.log('Mock data seeded successfully');
  } catch (error) {
    console.error('Error seeding mock data:', error);
  }
}

export async function resetDemoData() {
  await seedMockData();
}