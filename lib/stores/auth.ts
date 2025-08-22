import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (requiredRole: Role) => boolean;
}

const DEMO_USERS: User[] = [
  { email: 'owner@demo', password: 'demo123', role: 'owner' },
  { email: 'manager@demo', password: 'demo123', role: 'manager' },
  { email: 'cashier@demo', password: 'demo123', role: 'cashier' },
];

const roleHierarchy: Record<Role, number> = {
  owner: 3,
  manager: 2,
  cashier: 1,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (requiredRole: Role) => {
        const { user } = get();
        if (!user) return false;
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);