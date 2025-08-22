'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/stores/auth';
import { Money } from '@/components/ui/money';
import { Receipt, Plus, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

// Mock expenses data
const mockExpenses = [
  {
    id: '1',
    category: 'Utilities',
    amount: 12500,
    date: '2024-12-25',
    payee: 'Ceylon Electricity Board',
    note: 'Monthly electricity bill',
  },
  {
    id: '2',
    category: 'Transport',
    amount: 8500,
    date: '2024-12-27',
    payee: 'Delivery Services Ltd',
    note: 'Product delivery charges',
  },
  {
    id: '3',
    category: 'Marketing',
    amount: 25000,
    date: '2024-12-23',
    payee: 'Digital Marketing Pro',
    note: 'Social media advertising',
  },
  {
    id: '4',
    category: 'Maintenance',
    amount: 15000,
    date: '2024-12-18',
    payee: 'Shop Repair Services',
    note: 'Air conditioning service',
  },
  {
    id: '5',
    category: 'Office Supplies',
    amount: 3500,
    date: '2024-12-28',
    payee: 'Stationery Mart',
    note: 'Printer paper and ink',
  },
  {
    id: '6',
    category: 'Insurance',
    amount: 18000,
    date: '2024-12-10',
    payee: 'Lanka Insurance Company',
    note: 'Monthly business insurance premium',
  },
];

const expenseCategories = [
  'Utilities',
  'Transport',
  'Marketing',
  'Maintenance',
  'Office Supplies',
  'Insurance',
  'Rent',
  'Staff',
  'Professional Services',
  'Other',
];

export default function ExpensesPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  const handleAddExpense = () => {
    if (!category || !amount || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Expense added successfully');
    setShowAddExpense(false);
    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPayee('');
    setNote('');
  };

  const filteredExpenses = mockExpenses.filter(expense =>
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.payee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary statistics
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = mockExpenses
    .filter(expense => expense.date.startsWith('2024-12'))
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryTotals = mockExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Receipt className="w-8 h-8 mr-3" />
            Expenses
          </h1>
          <p className="text-gray-600">Track business expenses and spending</p>
        </div>
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (LKR) *</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Payee</Label>
                <Input
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="Who was paid?"
                />
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={totalExpenses} />
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={thisMonthExpenses} />
            </div>
            <p className="text-xs text-muted-foreground">December 2024</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={topCategory?.[1] || 0} />
            </div>
            <p className="text-xs text-muted-foreground">{topCategory?.[0] || 'N/A'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Day</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Money amount={Math.round(thisMonthExpenses / 30)} />
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell>{expense.payee || '-'}</TableCell>
                  <TableCell>
                    <Money amount={expense.amount} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.note || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}