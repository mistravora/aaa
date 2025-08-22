'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !hasRole('manager')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 45,230</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 356</div>
            <p className="text-xs text-muted-foreground">+3% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Reports</h3>
            <p className="text-gray-600 mb-4">
              Detailed sales analytics, inventory reports, and business insights are coming soon.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
              <div>• Sales by Category</div>
              <div>• Inventory Turnover</div>
              <div>• Profit Margins</div>
              <div>• Customer Analytics</div>
              <div>• Supplier Performance</div>
              <div>• Expense Tracking</div>
              <div>• Tax Reports</div>
              <div>• Export to Excel</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}