'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth';
import { Money } from '@/components/ui/money';
import { Users, Plus, CreditCard, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for suppliers
const mockSuppliers = [
  {
    id: '1',
    name: 'Cocoa Imports Lanka',
    phone: '+94112345678',
    email: 'orders@cocoaimports.lk',
    address: '123 Import Avenue, Colombo 01',
    terms_days: 30,
    trn: '134567890',
  },
  {
    id: '2',
    name: 'Premium Nuts & Dates',
    phone: '+94117654321',
    email: 'sales@premiumnutsdates.lk',
    address: '456 Trade Center, Negombo',
    terms_days: 45,
    trn: '234567891',
  },
  {
    id: '3',
    name: 'Beverage Supplies Lanka',
    phone: '+94812345678',
    email: 'wholesale@beveragesupplies.lk',
    address: '789 Industrial Zone, Kandy',
    terms_days: 21,
    trn: '345678912',
  },
];

// Mock invoices
const mockInvoices = [
  {
    id: '1',
    supplier_id: '1',
    invoice_no: 'CIL-2024-001',
    date: '2024-12-15',
    due_date: '2025-01-14',
    total: 125000,
    balance: 125000,
    status: 'pending',
  },
  {
    id: '2',
    supplier_id: '2',
    invoice_no: 'PND-2024-015',
    date: '2024-11-01',
    due_date: '2024-12-16',
    total: 89000,
    balance: 35000,
    status: 'overdue',
  },
  {
    id: '3',
    supplier_id: '3',
    invoice_no: 'BSL-2024-089',
    date: '2024-12-20',
    due_date: '2025-01-10',
    total: 25000,
    balance: 0,
    status: 'paid',
  },
];

// Mock payments
const mockPayments = [
  {
    id: '1',
    invoice_id: '2',
    date: '2024-12-01',
    amount: 54000,
    method: 'bank' as const,
    ref: 'TXN-001234',
  },
  {
    id: '2',
    invoice_id: '3',
    date: '2024-12-22',
    amount: 25000,
    method: 'cash' as const,
  },
];

export default function SuppliersPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'card' | 'wallet'>('bank');
  const [paymentRef, setPaymentRef] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  const supplier = selectedSupplier ? mockSuppliers.find(s => s.id === selectedSupplier) : null;
  const supplierInvoices = selectedSupplier ? mockInvoices.filter(i => i.supplier_id === selectedSupplier) : [];
  const supplierPayments = supplierInvoices.length > 0 
    ? mockPayments.filter(p => supplierInvoices.some(i => i.id === p.invoice_id))
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const handleAddPayment = () => {
    if (!paymentAmount || !selectedInvoice) return;
    
    toast.success('Payment recorded successfully');
    setShowAddPayment(false);
    setPaymentAmount('');
    setPaymentRef('');
    setSelectedInvoice(null);
  };

  // Calculate aging buckets
  const calculateAging = () => {
    const today = new Date();
    const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    
    supplierInvoices.forEach(invoice => {
      if (invoice.balance > 0) {
        const dueDate = new Date(invoice.due_date);
        const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPastDue <= 30) aging['0-30'] += invoice.balance;
        else if (daysPastDue <= 60) aging['31-60'] += invoice.balance;
        else if (daysPastDue <= 90) aging['61-90'] += invoice.balance;
        else aging['90+'] += invoice.balance;
      }
    });
    
    return aging;
  };

  const aging = supplier ? calculateAging() : { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

  if (selectedSupplier && supplier) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" onClick={() => setSelectedSupplier(null)} className="mb-2">
              ← Back to Suppliers
            </Button>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-gray-600">{supplier.email} • {supplier.phone}</p>
          </div>
          <Button onClick={() => window.print()}>
            <FileText className="w-4 h-4 mr-2" />
            Print Statement
          </Button>
        </div>

        {/* Aging Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">0-30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <Money amount={aging['0-30']} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                <Money amount={aging['31-60']} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                <Money amount={aging['61-90']} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">90+ Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                <Money amount={aging['90+']} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                  <DialogTrigger asChild>
                    <Button>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Invoice</Label>
                        <Select value={selectedInvoice || ''} onValueChange={setSelectedInvoice}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {supplierInvoices.filter(i => i.balance > 0).map(invoice => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                {invoice.invoice_no} - <Money amount={invoice.balance} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="wallet">E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reference</Label>
                        <Input
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="Transaction reference"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddPayment}>
                          Record Payment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                        <TableCell><Money amount={invoice.total} /></TableCell>
                        <TableCell><Money amount={invoice.balance} /></TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierPayments.map((payment) => {
                      const invoice = mockInvoices.find(i => i.id === payment.invoice_id);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{invoice?.invoice_no}</TableCell>
                          <TableCell><Money amount={payment.amount} /></TableCell>
                          <TableCell className="capitalize">{payment.method}</TableCell>
                          <TableCell>{payment.ref || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Suppliers
          </h1>
          <p className="text-gray-600">Manage suppliers and track payments</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSuppliers.map((supplier) => {
                const outstanding = mockInvoices
                  .filter(i => i.supplier_id === supplier.id)
                  .reduce((sum, i) => sum + i.balance, 0);
                
                return (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-gray-500">TRN: {supplier.trn}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{supplier.email}</div>
                        <div className="text-gray-500">{supplier.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.terms_days} days</TableCell>
                    <TableCell>
                      <Money amount={outstanding} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedSupplier(supplier.id)}
                      >
                        View Ledger
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}