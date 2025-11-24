import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
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
import { http } from "../lib/api.ts";
import { PaginationComponent } from "../components/PaginationComponent.tsx";
import type { CreateProjectDto, PatchProjectDto, ProjectDto } from '../generated-client';
import { Textarea } from '../components/ui/textarea.tsx';

interface AdminProjectsListProps {
  onViewProject?: (projectId: string) => void;
}

export function AdminProjectsList({ onViewProject }: AdminProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // ↓↓↓ Added for the client dropdown
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<Array<{ id: string; fullName: string }>>([]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectCity, setProjectCity] = useState('');
  const [projectPostal, setProjectPostal] = useState('');
  const [projectArea, setProjectArea] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  // clientName removed - now selection happens via the Select

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('Pending');

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await http.projects.searchProjects(
        searchQuery || undefined,
        statusFilter === 'all' ? undefined : statusFilter,
        page,
        pageSize,
      );
      setProjects(res.items ?? []);
      setTotal(res.totalItems ?? (res.items?.length ?? 0));
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load projects');
    }
  }, [searchQuery, statusFilter, page, pageSize]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load the client list when the modal opens
  useEffect(() => {
    if (!isAddProjectOpen) return;
    (async () => {
      try {
        // If the activity filter is not needed, remove the true flag
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
    setProjectCity('');
    setProjectPostal('');
    setProjectArea('');
    setProjectBudget('');
    setProjectNotes('');
    setClientId('');
    setStartDate('');
    setEndDate('');
    setStatus('Pending');
    setFile(null);
    setPreview(null);
  };

  const handleAddProject = async () => {
    const totalAreaNum = projectArea === '' ? 0 : Number(projectArea);
    const budgetNum = projectBudget === '' ? 0 : Number(projectBudget);

    if (!projectName || !projectAddress || !projectCity || !projectPostal || projectArea === '' || !clientId || !startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (Number.isNaN(totalAreaNum) || totalAreaNum < 0) {
      toast.error('Total area must be zero or a positive number');
      return;
    }

    if (Number.isNaN(budgetNum) || budgetNum < 0) {
      toast.error('Budget must be zero or a positive number');
      return;
    }

    setSubmitting(true);

    const createProject = async () => {
      const dto: CreateProjectDto = {
        clientId,
        title: projectName,
        notes: projectNotes || undefined,
        address: projectAddress,
        city: projectCity,
        postalCode: projectPostal,
        status,
        startDate: startDate,
        plannedEndDate: endDate,
        totalArea: totalAreaNum,
        budget: budgetNum,
        progressPercentage: 0,
        thumbnailUrl: undefined
      };

      const created = await http.projects.createProject(dto);

      if (file && created.id) {
        try {
          const uploaded = await http.uploadProjectImage(file, created.id);
          const patchedDto: PatchProjectDto = {
            title: created.title,
            notes: created.notes,
            address: created.address,
            city: created.city,
            postalCode: created.postalCode,
            status: created.status,
            startDate: new Date(created.startDate!).toISOString(),
            plannedEndDate: new Date(created.plannedEndDate!).toISOString(),
            totalArea: created.totalArea,
            budget: created.budget,
            progressPercentage: created.progressPercentage,
            thumbnailUrl: uploaded.url
          };
          await http.projects.patchProject(created.id, patchedDto);
          created.thumbnailUrl = uploaded.url;
        } catch (err) {
          console.error(err);
          // Continue without failing the promise; toast handled outside
        }
      }

      return created;
    };

    // ✅ toast.promise automatically handles every state
    toast.promise(createProject(), {
      loading: 'Creating project...',
      success: () => {
        // Close the modal and reset the form AFTER a successful call
        setIsAddProjectOpen(false);
        resetForm();
        setSubmitting(false);
        loadProjects();
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
          <p className="text-muted-foreground">
            Projects: {total}
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
                  <Label htmlFor="project-city">City</Label>
                  <Input
                    id="project-city"
                    value={projectCity}
                    onChange={(e) => setProjectCity(e.target.value)}
                    placeholder="Vyshneve"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-postal">Postal code</Label>
                  <Input
                    id="project-postal"
                    value={projectPostal}
                    onChange={(e) => setProjectPostal(e.target.value)}
                    placeholder="08132"
                  />
                </div>
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
                  <Label htmlFor="project-budget">Budget</Label>
                  <Input
                    id="project-budget"
                    type="number"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    placeholder="100000"
                  />
                </div>
              </div>

              {/* ↓↓↓ Replaced the text field with the client Select */}
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="project-notes">Notes (optional)</Label>
                <Textarea
                  id="project-notes"
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Additional notes about the project"
                />
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
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Table View */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                {project.thumbnailUrl == null || project.thumbnailUrl == "" ? 'Project of Client: ' + project.clientName
                  : (<img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />)}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3>{project.title}</h3>
                      <Badge variant={
                        project.status?.toLowerCase() === 'inprogress' ? 'default' :
                          project.status?.toLowerCase() === 'completed' ? 'secondary' :
                            'outline'
                      }>
                        {project.status}
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
                      <DropdownMenuItem onClick={() => onViewProject?.(project.id!)}>
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
                    <p>{'Here we still need to check which is the last stage of the project'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p>{project.totalArea ?? 0} m²</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Project progress</span>
                    <span>{project.progressPercentage ?? 0}%</span>
                  </div>
                  <Progress value={project.progressPercentage ?? 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                  <span>
                    {project.startDate && format(new Date(project.startDate), 'dd MMM yyyy', { locale: enUS })} - {project.plannedEndDate && format(new Date(project.plannedEndDate), 'dd MMM yyyy', { locale: enUS })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProject?.(project.id!)}
                  >
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {total > pageSize && (
        <PaginationComponent currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
