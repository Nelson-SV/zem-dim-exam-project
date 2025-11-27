import { Building, Users, CheckCircle2, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { http } from '../lib/api';
import type { ProjectDto, UpdateDto } from '../generated-client';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatsCard({ title, value, icon, color, onClick }: StatsCardProps) {
  return (
    <Card onClick={onClick} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{title}</p>
          <h3 className="mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface AdminDashboardProps {
  onViewProject?: (projectId: string) => void;
}

export function AdminDashboard({ onViewProject }: AdminDashboardProps) {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [updates, setUpdates] = useState<UpdateDto[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'in-progress' | 'pending' | 'all'>('active');
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [totalProjects, setTotalProjects] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);

  const normalizeStatus = (status?: string | null) => status?.replace(/\s+/g, '').toLowerCase() ?? '';

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        // Fetch a reasonable chunk; backend lacks multi-status filtering.
        const res = await http.projects.searchProjects(search || undefined, undefined, 1, 100);
        setProjects(res.items ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [search]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [all, completed, inProgress, _pending, users] = await Promise.all([
          http.projects.searchProjects(undefined, undefined, 1, 1),
          http.projects.searchProjects(undefined, 'Completed', 1, 1),
          http.projects.searchProjects(undefined, 'In Progress', 1, 1),
          http.projects.searchProjects(undefined, 'Pending', 1, 1),
          http.userManagement.getAllUsers(1, 1, undefined, true)
        ]);

        setTotalProjects(all.totalItems ?? 0);
        setCompletedCount(completed.totalItems ?? 0);
        setInProgressCount(inProgress.totalItems ?? 0);
        setClientsCount(users.totalItems ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoadingUpdates(true);
      try {
        const res = await http.adminUpdates.getUpdates(1, 10, undefined, undefined, undefined);
        setUpdates(res.items ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUpdates(false);
      }
    };
    fetchUpdates();
  }, []);

  const filteredProjects = useMemo(() => {
    const statusNormalized = statusFilter;

    let list = projects.filter(p => {
      const term = search.trim().toLowerCase();
      const matchesSearch = term.length === 0 ||
        p.title?.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term) ||
        p.clientName?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const s = normalizeStatus(p.status);
      switch (statusNormalized) {
        case 'active':
          return s !== 'completed';
        case 'completed':
          return s === 'completed';
        case 'in-progress':
          return s === 'inprogress';
        case 'pending':
          return s === 'pending';
        case 'all':
        default:
          return true;
      }
    });

    list = list.sort((a, b) => (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0));
    return list;
  }, [projects, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const pagedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Clients"
          value={loadingStats ? '...' : clientsCount.toString()}
          icon={<Users className="size-6 text-white" />}
          color={`bg-[#F97316] ${statusFilter === 'all' ? 'ring-2 ring-offset-2 ring-[#F97316]/60' : ''}`}
          onClick={() => setStatusFilter('all')}
        />
        <StatsCard
          title="Total projects"
          value={loadingStats ? '...' : totalProjects.toString()}
          icon={<Building className="size-6 text-white" />}
          color={`bg-[#3B82F6] ${statusFilter === 'all' ? 'ring-2 ring-offset-2 ring-[#3B82F6]/60' : ''}`}
          onClick={() => setStatusFilter('all')}
        />
        <StatsCard
          title="Completed"
          value={loadingStats ? '...' : completedCount.toString()}
          icon={<CheckCircle2 className="size-6 text-white" />}
          color={`bg-[#10B981] ${statusFilter === 'completed' ? 'ring-2 ring-offset-2 ring-[#10B981]/60' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'completed' ? 'active' : 'completed')}
        />
        <StatsCard
          title="In progress"
          value={loadingStats ? '...' : inProgressCount.toString()}
          icon={<Clock className="size-6 text-white" />}
          color={`bg-[#F59E0B] ${statusFilter === 'in-progress' ? 'ring-2 ring-offset-2 ring-[#F59E0B]/60' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'in-progress' ? 'active' : 'in-progress')}
        />
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2>Active projects</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loadingProjects && <p className="text-muted-foreground">Loading projects...</p>}

          {!loadingProjects && pagedProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {project.thumbnailUrl ? (
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{project.title}</h3>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>
                  <Badge variant={normalizeStatus(project.status) === 'completed' ? 'secondary' : 'default'}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{project.progressPercentage ?? 0}%</span>
                    </div>
                    <Progress value={project.progressPercentage ?? 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Current stage</span>
                    <span>{project.notes ?? '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span>{project.clientName}</span>
                  </div>

                  <div className="pt-3">
                    <Button 
                      onClick={() => onViewProject?.(project.id!)}
                      className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!loadingProjects && pagedProjects.length === 0 && (
            <p className="text-muted-foreground">No projects found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="self-center text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-6">Latest updates</h2>
        <Card className="divide-y">
          {loadingUpdates && <p className="p-4 text-muted-foreground">Loading updates...</p>}
          {!loadingUpdates && updates.map(update => {
            const type = update.updateType?.toLowerCase();
            const IconComponent = type?.includes('photo') ? Users : type?.includes('progress') ? CheckCircle2 : Clock;
            return (
              <div key={update.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4>{update.title}</h4>
                  <p className="text-muted-foreground">{update.description}</p>
                  {update.projectTitle && (
                    <p className="text-xs text-muted-foreground mt-1">Project: {update.projectTitle}</p>
                  )}
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {update.createdAt ? formatDistanceToNow(new Date(update.createdAt), { addSuffix: true, locale: enUS }) : '—'}
                </span>
              </div>
            );
          })}

          {!loadingUpdates && updates.length === 0 && (
            <p className="p-4 text-muted-foreground">No updates yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
