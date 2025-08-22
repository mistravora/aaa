'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Package,
  TruckIcon,
  Users,
  Receipt,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  {
    name: 'POS',
    href: '/pos',
    icon: ShoppingCart,
    roles: ['owner', 'manager', 'cashier'],
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Stock In',
    href: '/stock-in',
    icon: TruckIcon,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Users,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: Receipt,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Cash',
    href: '/cash',
    icon: DollarSign,
    roles: ['owner', 'manager', 'cashier'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    roles: ['owner'],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dubai Store POS</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.email} ({user.role})
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}