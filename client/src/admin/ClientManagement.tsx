import { useState } from 'react';
import { Search, Plus, Mail, Phone, Building, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { mockClients } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';

export function ClientManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = () => {
    if (!clientName || !clientEmail || !clientPhone) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Client added successfully');
    setIsAddClientOpen(false);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
  };

  const handleDeleteClient = (clientName: string) => {
    toast.success(`Client ${clientName} removed`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-2">Client management</h2>
          <p className="text-muted-foreground">
            Total clients: {filteredClients.length}
          </p>
        </div>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Plus className="size-4 mr-2" />
              Add client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add a new client</DialogTitle>
              <DialogDescription>
                Enter the new client details to register them in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Full name</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ivan Ivanenko"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ivanov@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+380 67 123 4567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient} className="bg-[#F97316] hover:bg-[#F97316]/90">
                Add client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="size-12">
                <AvatarImage src={client.avatar} />
                <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="mb-1">{client.name}</h4>
                <Badge variant="secondary">
                  {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building className="size-4 shrink-0" />
                <span>
                  Registered: {format(new Date(client.registeredDate), 'dd MMM yyyy', { locale: enUS })}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" className="flex-1" size="sm">
                <Eye className="size-4 mr-1" />
                Overview
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Edit className="size-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteClient(client.name)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
