import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, TaxMode } from '../types';

interface SettingsState {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  taxes: {
    enabled: true,
    rate: 18,
    mode: 'inclusive' as TaxMode,
    rounding: 1,
  },
  payments: {
    cash: true,
    card: true,
    wallet: true,
    bank: true,
  },
  units_default: {
    base_loose: 'g',
    sale_loose: 'kg',
    allowed_loose: ['kg', 'g', '100g'],
    kg_step: 0.05,
    g_step: 1,
    pcs_step: 1,
  },
  petty_cash: {
    enforce: true,
    variance_threshold_lkr: 50,
    admin_override: true,
  },
  returns: {
    days_allowed: 7,
    require_receipt: false,
    refund_methods: ['cash', 'bank'],
    limit_to_original_tender: false,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetToDefaults: () =>
        set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'settings-storage',
    }
  )
);