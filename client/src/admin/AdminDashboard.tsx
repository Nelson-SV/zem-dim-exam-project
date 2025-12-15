import { Building, Users, CheckCircle2, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { http } from '../lib/api';
import type { ProjectDto, UpdateDto } from '../generated-client';
import { PaginationComponent } from '../components/PaginationComponent';

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
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [updates, setUpdates] = useState<UpdateDto[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'completed' | 'in-progress' | 'all'>('in-progress');
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const [totalProjects, setTotalProjects] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);

  const normalizeStatus = (status?: string | null) => status?.replace(/\s+/g, '').toLowerCase() ?? '';
  const locale = i18n.language === 'uk' ? uk : enUS;

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
        const [all, completed, inProgress, users] = await Promise.all([
          http.projects.searchProjects(undefined, undefined, 1, 1),
          http.projects.searchProjects(undefined, 'Completed', 1, 1),
          http.projects.searchProjects(undefined, 'In Progress', 1, 1),
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
        case 'completed':
          return s === 'completed';
        case 'in-progress':
          return s === 'inprogress';
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
          title={t('dashboard.clients')}
          value={loadingStats ? '...' : clientsCount.toString()}
          icon={<Users className="size-6 text-white" />}
          color="bg-[#F97316]"
        />
        <StatsCard
          title={t('dashboard.totalProjects')}
          value={loadingStats ? '...' : totalProjects.toString()}
          icon={<Building className="size-6 text-white" />}
          color="bg-[#3B82F6]"
        />
        <StatsCard
          title={t('dashboard.completed')}
          value={loadingStats ? '...' : completedCount.toString()}
          icon={<CheckCircle2 className="size-6 text-white" />}
          color={`bg-[#10B981] ${statusFilter === 'completed' ? 'ring-2 ring-offset-2 ring-[#10B981]/60' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'completed' ? 'all' : 'completed')}
        />
        <StatsCard
          title={t('dashboard.inProgress')}
          value={loadingStats ? '...' : inProgressCount.toString()}
          icon={<Clock className="size-6 text-white" />}
          color={`bg-[#F59E0B] ${statusFilter === 'in-progress' ? 'ring-2 ring-offset-2 ring-[#F59E0B]/60' : ''}`}
          onClick={() => setStatusFilter(prev => prev === 'in-progress' ? 'all' : 'in-progress')}
        />
      </div>

      {/* Active Projects */}
      <div>
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.searchProjects')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loadingProjects && <p className="text-muted-foreground">{t('dashboard.loadingProjects')}</p>}

          {!loadingProjects && pagedProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
              <div className="relative px-3 pt-3 pb-0">
                <div className="w-full h-56 bg-white rounded-md overflow-hidden flex items-center justify-center">
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      {t('dashboard.noImage')}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 text-left flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{project.title}</h3>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>
                  <Badge variant={normalizeStatus(project.status) === 'completed' ? 'secondary' : 'default'}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">{t('projects.progress')}</span>
                      <span>{project.progressPercentage ?? 0}%</span>
                    </div>
                    <Progress value={project.progressPercentage ?? 0} className="h-2" />
                  </div>

                  <div className="pt-3 border-t text-base leading-relaxed space-y-3 min-h-[108px]">
                    <p className="text-muted-foreground line-clamp-2" title={project.notes ?? ''}>{t('dashboard.currentStage')}: <span className="text-foreground">{project.notes ?? '—'}</span></p>
                    <p className="text-muted-foreground">{t('projects.client')}: <span className="text-foreground">{project.clientName}</span></p>
                  </div>
                </div>

                <div className="pt-2 mt-auto">
                  <Button 
                    onClick={() => onViewProject?.(project.id!)}
                    className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
                  >
                    {t('dashboard.viewDetails')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {!loadingProjects && pagedProjects.length === 0 && (
            <p className="text-muted-foreground">{t('projects.noProjects')}</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <PaginationComponent currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-6">{t('dashboard.latestUpdates')}</h2>
        <Card className="divide-y">
          {loadingUpdates && <p className="p-4 text-muted-foreground">{t('dashboard.loadingUpdates')}</p>}
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
                    <p className="text-xs text-muted-foreground mt-1">{t('documents.project')}: {update.projectTitle}</p>
                  )}
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {update.createdAt ? formatDistanceToNow(new Date(update.createdAt), { addSuffix: true, locale }) : '—'}
                </span>
              </div>
            );
          })}

          {!loadingUpdates && updates.length === 0 && (
            <p className="p-4 text-muted-foreground">{t('dashboard.noUpdatesYet')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
