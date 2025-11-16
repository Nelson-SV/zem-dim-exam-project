import { useEffect, useState } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import { mockProjects } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Progress } from '../components/ui/progress';
import {http} from "../lib/api.ts";

interface AdminProjectsListProps {
  onViewProject?: (projectId: string) => void;
}

export function AdminProjectsList({ onViewProject }: AdminProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ↓↓↓ додано для дропдауна клієнтів
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<Array<{ id: string; fullName: string }>>([]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectArea, setProjectArea] = useState('');
  // clientName видалено — тепер вибір з Select

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('active');

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // завантажуємо список клієнтів при відкритті модалки
  useEffect(() => {
    if (!isAddProjectOpen) return;
    (async () => {
      try {
        // якщо фільтр активності не потрібен — прибери true
        const page = 1, pageSize = 100;
        const res = await http.userManagement.getAllUsers(page, pageSize, null, true);
        const mapped = (res.items ?? [])
            .map(u => ({
              id: u.userId!,
              fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '(no name)'
            }));
        setClients(mapped);
      } catch (e) {
        toast.error('Failed to load clients');
      }
    })();
  }, [isAddProjectOpen]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const resetForm = () => {
    setProjectName('');
    setProjectAddress('');
    setProjectArea('');
    setClientId('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    setFile(null);
    setPreview(null);
  };

  const handleAddProject = async () => {
    if (!projectName || !projectAddress || !projectArea || !clientId || !startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    const createProject = async () => {
      let thumbnailUrl: string | undefined = undefined;

      if (file) {
        const uploaded = await http.uploadProjectImage(file);
        thumbnailUrl = uploaded.url;
      }

      const dto = {
        clientId,
        title: projectName,
        description: undefined,
        address: projectAddress,
        city: undefined,
        postalCode: undefined,
        latitude: undefined,
        longitude: undefined,
        status,
        startDate,
        plannedEndDate: endDate || undefined,
        totalArea: projectArea ? Number(projectArea) : undefined,
        budget: undefined,
        progressPercentage: 0,
        thumbnailUrl
      } as unknown as import('../generated-client').CreateProjectDto;

      return await http.projects.createProject(dto);
    };

    // ✅ toast.promise автоматично керує всіма станами
    toast.promise(createProject(), {
      loading: 'Creating project...',
      success: () => {
        // Закриваємо модалку і скидаємо форму ПІСЛЯ успіху
        setIsAddProjectOpen(false);
        resetForm();
        setSubmitting(false);
        return 'Project created successfully!';
      },
      error: (err) => {
        setSubmitting(false);
        return err instanceof Error ? err.message : 'Create failed';
      },
    });
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
          <Dialog open={isAddProjectOpen} onOpenChange={(v) => { setIsAddProjectOpen(v); if (!v) resetForm(); }}>
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

                  {/* ↓↓↓ ЗАМІСТЬ текстового поля — Select клієнта */}
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start date</Label>
                    <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Expected completion</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Project photo (optional)</Label>
                  <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={onPickFile}
                  />
                  {preview && (
                      <img src={preview} alt="preview" className="mt-2 h-28 w-auto rounded-md object-cover border" />
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProjectOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddProject} disabled={submitting} className="bg-[#F97316] hover:bg-[#F97316]/90">
                  {submitting ? 'Creating...' : 'Create project'}
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
                  <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover"
                    />
                  </div>

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
