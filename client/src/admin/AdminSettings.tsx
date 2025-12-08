import { useState, useEffect } from 'react';
import { Save, Bell, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  currency?: string;
}

interface UserSettingsData {
  id: string;
  userId: string;
  emailAlerts: boolean;
  reportFrequency: string;
  clientUpdates: boolean;
}

const API_URL = 'http://localhost:5001';

export function AdminSettings() {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Company state
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [currency, setCurrency] = useState('UAH');

  // Notification settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reportFrequency, setReportFrequency] = useState('Weekly');
  const [clientUpdates, setClientUpdates] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeaders = () => {
    const jwt = localStorage.getItem('auth_jwt');
    return {
      'Content-Type': 'application/json',
      'Authorization': jwt ? `Bearer ${jwt}` : '',
    };
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Fetch company info and user settings in parallel
      const [companyResponse, settingsResponse] = await Promise.all([
        fetch(`${API_URL}/api/settings/company`, {
          method: 'GET',
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/api/settings/notifications`, {
          method: 'GET',
          headers: getAuthHeaders(),
        }),
      ]);

      if (companyResponse.ok) {
        const companyData: CompanyData = await companyResponse.json();
        setCompanyName(companyData.name);
        setCompanyEmail(companyData.email);
        setCompanyPhone(companyData.phone || '');
        setCompanyWebsite(companyData.website || '');
        setCompanyAddress(companyData.address || '');
        setCurrency(companyData.currency || 'UAH');
      }

      if (settingsResponse.ok) {
        const settingsData: UserSettingsData = await settingsResponse.json();
        setEmailAlerts(settingsData.emailAlerts);
        setReportFrequency(settingsData.reportFrequency);
        setClientUpdates(settingsData.clientUpdates);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setSavingCompany(true);

      const companyDto = {
        name: companyName,
        email: companyEmail,
        phone: companyPhone || undefined,
        website: companyWebsite || undefined,
        address: companyAddress || undefined,
        currency: currency,
      };

      const response = await fetch(`${API_URL}/api/settings/company`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company information');
      }

      toast.success('Company information updated successfully');
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update company information');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);

      const settingsDto = {
        emailAlerts,
        reportFrequency,
        clientUpdates,
      };

      const response = await fetch(`${API_URL}/api/settings/notifications`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settingsDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification settings');
      }

      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update notification settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Building className="size-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Company information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="Company email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="Website URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Office address</Label>
                <Input
                  id="company-address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Office address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAH">UAH (₴)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveCompany}
              disabled={savingCompany}
              className="bg-[#F97316] hover:bg-[#F97316]/90"
            >
              {savingCompany ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Notification preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email alerts</Label>
                  <p className="text-muted-foreground">Receive notifications by email</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Report frequency</Label>
                <Select value={reportFrequency} onValueChange={setReportFrequency}>
                  <SelectTrigger id="report-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">How often you receive summary reports</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client updates</Label>
                  <p className="text-muted-foreground">Alerts about new client messages and activity</p>
                </div>
                <Switch checked={clientUpdates} onCheckedChange={setClientUpdates} />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="bg-[#F97316] hover:bg-[#F97316]/90"
            >
              {savingNotifications ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save notification settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
