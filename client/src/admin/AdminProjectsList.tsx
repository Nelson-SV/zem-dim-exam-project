import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import { mockProjects } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Progress } from '../components/ui/progress';

interface AdminProjectsListProps {
  onViewProject?: (projectId: string) => void;
}

export function AdminProjectsList({ onViewProject }: AdminProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectArea, setProjectArea] = useState('');
  const [clientName, setClientName] = useState('');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = () => {
    if (!projectName || !projectAddress || !projectArea || !clientName) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Project created successfully');
    setIsAddProjectOpen(false);
    setProjectName('');
    setProjectAddress('');
    setProjectArea('');
    setClientName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-2">All projects</h2>
          <p className="text-muted-foreground">
            Projects found: {filteredProjects.length}
          </p>
        </div>
        <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Plus className="size-4 mr-2" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
              <DialogDescription>
                Enter the basic information for the new construction project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Cottage in Vyshneve"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-address">Address</Label>
                <Input
                  id="project-address"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="15 Sosnova St, Vyshneve"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-area">Area (m²)</Label>
                  <Input
                    id="project-area"
                    type="number"
                    value={projectArea}
                    onChange={(e) => setProjectArea(e.target.value)}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-select">Client</Label>
                  <Input
                    id="client-select"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Oleksandr Kovalenko"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Expected completion</Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} className="bg-[#F97316] hover:bg-[#F97316]/90">
                Create project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Table View */}
      <div className="space-y-4">
        {filteredProjects.map(project => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Project Image */}
              <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Project Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3>{project.name}</h3>
                      <Badge variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        'outline'
                      }>
                        {project.status === 'active' ? 'Active' :
                         project.status === 'completed' ? 'Completed' :
                         'On hold'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProject?.(project.id)}>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p>{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current stage</p>
                    <p>{project.currentStage}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p>{project.area} m²</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Project progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                  <span>
                    {format(new Date(project.startDate), 'dd MMM yyyy', { locale: enUS })} - {format(new Date(project.endDate), 'dd MMM yyyy', { locale: enUS })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewProject?.(project.id)}
                  >
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
