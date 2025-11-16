import { useState } from 'react';
import { Save, Bell, Shield, Users, Building } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';

export function AdminSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [clientUpdates, setClientUpdates] = useState(true);

  const handleSaveSettings = () => {
    toast.success('Settings saved');
  };

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
          <TabsTrigger value="team">
            <Users className="size-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4 mr-2" />
            Security
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
                  <Input id="company-name" defaultValue="ZEM-DIM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company email</Label>
                  <Input id="company-email" type="email" defaultValue="info@zem-dim.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input id="company-phone" defaultValue="+380 44 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input id="company-website" defaultValue="www.zem-dim.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Office address</Label>
                <Input id="company-address" defaultValue="1 Khreshchatyk St, Kyiv, Ukraine" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Regional settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Time zone</Label>
                <Select defaultValue="kyiv">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kyiv">Europe/Kyiv (GMT+2)</SelectItem>
                    <SelectItem value="london">Europe/London (GMT+0)</SelectItem>
                    <SelectItem value="new-york">America/New_York (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="uah">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uah">UAH (₴)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Save className="size-4 mr-2" />
              Save changes
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Email notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email alerts</Label>
                  <p className="text-muted-foreground">Receive notifications by email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly reports</Label>
                  <p className="text-muted-foreground">Receive reports every Monday</p>
                </div>
                <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client updates</Label>
                  <p className="text-muted-foreground">Alerts about new messages</p>
                </div>
                <Switch checked={clientUpdates} onCheckedChange={setClientUpdates} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Push notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser notifications</Label>
                  <p className="text-muted-foreground">Receive push notifications in the browser</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Message sounds</Label>
                  <p className="text-muted-foreground">Play a sound for new messages</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Save className="size-4 mr-2" />
              Save notification settings
            </Button>
          </div>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Team members</h3>
              <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
                Invite user
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Oleksandr Ivanov', role: 'Head manager', email: 'o.ivanov@zem-dim.com' },
                { name: 'Maria Koval', role: 'Project manager', email: 'm.koval@zem-dim.com' },
                { name: 'Petro Sydorenko', role: 'Architect', email: 'p.sydorenko@zem-dim.com' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4>{member.name}</h4>
                    <p className="text-muted-foreground">{member.role}</p>
                    <p className="text-muted-foreground">{member.email}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Account security</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Two-factor authentication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-muted-foreground">Additional protection for your account</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Active sessions</h3>
            <div className="space-y-4">
              {[
                { device: 'Chrome on Windows', location: 'Kyiv, Ukraine', time: '2 minutes ago' },
                { device: 'Safari on iPhone', location: 'Kyiv, Ukraine', time: '2 hours ago' },
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4>{session.device}</h4>
                    <p className="text-muted-foreground">{session.location}</p>
                    <p className="text-muted-foreground">{session.time}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive">
                    End session
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Save className="size-4 mr-2" />
              Update security
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
