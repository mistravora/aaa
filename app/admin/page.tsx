'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/stores/auth';
import { useSettingsStore } from '@/lib/stores/settings';
import { Settings, Database, CreditCard, Package, Receipt, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuthStore();
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !hasRole('owner')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  const handleResetData = async () => {
    if (!confirm('This will reset all demo data. Are you sure?')) return;
    
    setLoading(true);
    try {
      const { resetDemoData } = await import('@/lib/mock-seed');
      await resetDemoData();
      toast.success('Demo data has been reset successfully');
    } catch (error) {
      toast.error('Failed to reset demo data');
    }
    setLoading(false);
  };

  const handleSettingsUpdate = (section: string, updates: any) => {
    updateSettings({
      ...settings,
      [section]: { ...settings[section as keyof typeof settings], ...updates }
    });
    toast.success('Settings updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Admin Settings
          </h1>
          <p className="text-gray-600">Configure system settings and manage data</p>
        </div>
      </div>

      <Tabs defaultValue="taxes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Tax Settings */}
        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Tax & Currency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Taxes</Label>
                  <p className="text-sm text-gray-500">Apply tax calculations to sales</p>
                </div>
                <Switch
                  checked={settings.taxes.enabled}
                  onCheckedChange={(enabled) => 
                    handleSettingsUpdate('taxes', { enabled })
                  }
                />
              </div>

              {settings.taxes.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={settings.taxes.rate}
                        onChange={(e) => 
                          handleSettingsUpdate('taxes', { rate: parseFloat(e.target.value) || 0 })
                        }
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <Label>Tax Mode</Label>
                      <Select
                        value={settings.taxes.mode}
                        onValueChange={(mode) => handleSettingsUpdate('taxes', { mode })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">Inclusive (Tax included in prices)</SelectItem>
                          <SelectItem value="exclusive">Exclusive (Tax added to prices)</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Rounding Rule</Label>
                    <Select
                      value={settings.taxes.rounding?.toString() || 'none'}
                      onValueChange={(value) => 
                        handleSettingsUpdate('taxes', { 
                          rounding: value === 'none' ? null : parseFloat(value) 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Rounding</SelectItem>
                        <SelectItem value="1">Round to nearest 1.00</SelectItem>
                        <SelectItem value="0.5">Round to nearest 0.50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.payments).map(([method, enabled]) => (
                <div key={method} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base capitalize">{method}</Label>
                    <p className="text-sm text-gray-500">
                      {method === 'cash' && 'Physical cash payments'}
                      {method === 'card' && 'Credit/Debit card payments'}
                      {method === 'wallet' && 'Digital wallet payments (e.g., PayHere)'}
                      {method === 'bank' && 'Bank transfer payments'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate('payments', { [method]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Settings */}
        <TabsContent value="units">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Default Units & Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>KG Step</Label>
                  <Input
                    type="number"
                    value={settings.units_default.kg_step}
                    onChange={(e) => 
                      handleSettingsUpdate('units_default', { 
                        kg_step: parseFloat(e.target.value) || 0.05 
                      })
                    }
                    step={0.01}
                    min={0.01}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum increment for kg measurements</p>
                </div>
                <div>
                  <Label>G Step</Label>
                  <Input
                    type="number"
                    value={settings.units_default.g_step}
                    onChange={(e) => 
                      handleSettingsUpdate('units_default', { 
                        g_step: parseFloat(e.target.value) || 1 
                      })
                    }
                    step={1}
                    min={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum increment for gram measurements</p>
                </div>
                <div>
                  <Label>PCS Step</Label>
                  <Input
                    type="number"
                    value={settings.units_default.pcs_step}
                    onChange={(e) => 
                      handleSettingsUpdate('units_default', { 
                        pcs_step: parseFloat(e.target.value) || 1 
                      })
                    }
                    step={1}
                    min={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum increment for piece counts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Settings */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Returns Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Days Allowed for Returns</Label>
                <Input
                  type="number"
                  value={settings.returns.days_allowed}
                  onChange={(e) => 
                    handleSettingsUpdate('returns', { 
                      days_allowed: parseInt(e.target.value) || 7 
                    })
                  }
                  min={0}
                  max={365}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Require Receipt</Label>
                  <p className="text-sm text-gray-500">Must have original receipt for returns</p>
                </div>
                <Switch
                  checked={settings.returns.require_receipt}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate('returns', { require_receipt: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Limit to Original Tender</Label>
                  <p className="text-sm text-gray-500">Refund only via original payment method</p>
                </div>
                <Switch
                  checked={settings.returns.limit_to_original_tender}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate('returns', { limit_to_original_tender: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Petty Cash Settings */}
        <TabsContent value="cash">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Petty Cash Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enforce Cash Management</Label>
                  <p className="text-sm text-gray-500">Require opening float and EOD reconciliation</p>
                </div>
                <Switch
                  checked={settings.petty_cash.enforce}
                  onCheckedChange={(enforce) => 
                    handleSettingsUpdate('petty_cash', { enforce })
                  }
                />
              </div>

              {settings.petty_cash.enforce && (
                <>
                  <div>
                    <Label>Variance Threshold (LKR)</Label>
                    <Input
                      type="number"
                      value={settings.petty_cash.variance_threshold_lkr}
                      onChange={(e) => 
                        handleSettingsUpdate('petty_cash', { 
                          variance_threshold_lkr: parseFloat(e.target.value) || 50 
                        })
                      }
                      min={0}
                      step={0.01}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum allowed variance before requiring explanation
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Admin Override</Label>
                      <p className="text-sm text-gray-500">Allow owners to close without counted cash</p>
                    </div>
                    <Switch
                      checked={settings.petty_cash.admin_override}
                      onCheckedChange={(admin_override) => 
                        handleSettingsUpdate('petty_cash', { admin_override })
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Reset Demo Data</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  This will clear all existing data and reload the demo dataset. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleResetData}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Demo Data'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Data Export Templates</h3>
                <p className="text-sm text-gray-600">
                  Download CSV templates for bulk importing data
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" disabled>
                    Products Template
                  </Button>
                  <Button variant="outline" disabled>
                    Batches Template
                  </Button>
                  <Button variant="outline" disabled>
                    Suppliers Template
                  </Button>
                  <Button variant="outline" disabled>
                    Expenses Template
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Reset All Settings</h3>
                    <p className="text-sm text-gray-600">Restore all settings to default values</p>
                  </div>
                  <Button variant="outline" onClick={resetToDefaults}>
                    Reset Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}