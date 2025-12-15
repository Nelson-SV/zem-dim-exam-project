import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, TrendingUp, Camera, MessageCircle, CheckCircle2, Loader2, Building } from 'lucide-react';
import { uk, enUS } from 'date-fns/locale';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { http } from '../lib/api';
import { useAuth } from '../contexts/useAuth';
import type { ClientDashboardProjectDto, UpdateDto } from '../generated-client';

const UPDATES_LIMIT = 5;

const parseDate = (value?: Date | string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const normalizeStatus = (status?: string) =>
  (status ?? '').trim().toLowerCase().replace(/\s+/g, '-');

function UpdateIcon(type?: string) {
  const t = (type ?? '').toLowerCase();
  if (t.includes('photo')) return Camera;
  if (t.includes('message')) return MessageCircle;
  if (t.includes('stage') || t.includes('progress')) return TrendingUp;
  return Clock;
}

export function ClientDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === 'uk' ? uk : enUS;

  const [projects, setProjects] = useState<ClientDashboardProjectDto[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await http.clientDashboard.getClientProjects(user?.id, undefined, UPDATES_LIMIT);
        setProjects(res.projects ?? []);
        setClientName(res.clientName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
        setSelectedProjectId(prev => prev ?? res.projects?.[0]?.id ?? null);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setError(t('clientDashboard.couldNotLoad'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    if (!projects.length) return;
    if (selectedProjectId && projects.some(p => p.id === selectedProjectId)) return;
    setSelectedProjectId(projects[0]?.id ?? null);
  }, [projects, selectedProjectId]);

  const project = useMemo(
    () => projects.find(p => p.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );

  const plannedEnd = parseDate(project?.plannedEndDate);
  const progress = project?.progressPercentage ?? 0;
  const daysRemaining = plannedEnd ? differenceInDays(plannedEnd, new Date()) : null;

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>{t('clientDashboard.loadingDashboard')}</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!project) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-2">{t('dashboard.noProjects')}</h3>
        <p className="text-muted-foreground">{t('dashboard.noProjectsDesc')}</p>
      </Card>
    );
  }

  const projectStart = parseDate(project.startDate);
  const currentStage = project.currentStageTitle ?? '—';
  const area = project.totalArea ?? undefined;

  const formatDisplayDate = (date: Date | null, fallback = '—') =>
    date ? format(date, 'dd MMMM yyyy', { locale }) : fallback;

  const badgeVariant = (status?: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'completed') return 'default';
    if (normalized === 'in-progress') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-8">
      {/* Project switcher */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id ?? null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                p.id === project.id ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#F97316] to-[#F59E0B] rounded-lg p-8 text-white">
        <h2 className="mb-2">{t('clientDashboard.welcomeClient', { name: clientName || t('dashboard.client') })}</h2>
        <p className="opacity-90">
          {t('clientDashboard.projectPercentComplete', { percent: progress })}
          {' '}
          {daysRemaining !== null && (
            <span>{t('clientDashboard.daysRemainingUntil', { days: daysRemaining })}</span>
          )}
        </p>
      </div>

      {/* Main Project Card */}
      <Card className="overflow-hidden">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Building className="size-8 mr-2" /> {t('clientDashboard.noImageAvailable')}
            </div>
          )}
        </div>
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <h2 className="mb-2">{project.title}</h2>
              <p className="text-muted-foreground">
                {project.address}, {project.postalCode} {project.city}
              </p>
              <p className="text-muted-foreground">
                Notes: {project.notes}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-[#10B981]">
                <CheckCircle2 className="size-3 mr-1" />
                {progress}% {t('dashboard.completed').toLowerCase()}
              </Badge>
              {area !== undefined && (
                <Badge variant="outline">
                  {area} m²
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">{t('clientDashboard.startDate')}</p>
                <p>{formatDisplayDate(projectStart)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#F59E0B]/10">
                <Clock className="size-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-muted-foreground">{t('clientDashboard.plannedCompletion')}</p>
                <p>{formatDisplayDate(plannedEnd)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span>{t('clientDashboard.overallProgress')}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-primary" />
              <div>
                <p>{t('dashboard.currentStage')}</p>
                <p className="text-muted-foreground">{currentStage}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Stages Timeline */}
      <div>
        <h3 className="mb-6">{t('clientDashboard.constructionStages')}</h3>
        <Card className="p-6">
          <div className="space-y-4">
            {(project.stages ?? []).map((stage, index) => {
              const status = normalizeStatus(stage.status);
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in-progress';
              const StageIcon = isCompleted ? CheckCircle2 : Clock;
              return (
                <div key={stage.id ?? index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-[#10B981]' :
                      isInProgress ? 'bg-[#F97316]' :
                      'bg-muted'
                    }`}>
                      <StageIcon className="size-5 text-white" />
                    </div>
                    {index < (project.stages?.length ?? 0) - 1 && (
                      <div className={`w-0.5 h-16 ${isCompleted ? 'bg-[#10B981]' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4>{stage.title}</h4>
                      <Badge variant={badgeVariant(stage.status)}>
                        {isCompleted ? t('clientDashboard.completed') : isInProgress ? t('clientDashboard.inProgress') : (stage.status ?? t('clientDashboard.pending'))}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {stage.notes || t('clientDashboard.noDescriptionProvided')}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">{t('clientDashboard.progress')}</span>
                      <span>{stage.progressPercentage ?? 0}%</span>
                    </div>
                    <Progress value={stage.progressPercentage ?? 0} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Updates */}
      <div>
        <h3 className="mb-6">{t('clientDashboard.latestUpdates')}</h3>
        <Card className="divide-y">
          {(project.latestUpdates ?? []).length === 0 && (
            <div className="p-4 text-muted-foreground">{t('clientDashboard.noUpdatesYet')}</div>
          )}
          {(project.latestUpdates ?? []).map((activity: UpdateDto) => {
            const IconComponent = UpdateIcon(activity.updateType);
            const createdAt = parseDate(activity.createdAt);
            return (
              <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4>{activity.title}</h4>
                  <p className="text-muted-foreground">{activity.description || activity.updateType}</p>
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {createdAt
                    ? formatDistanceToNow(createdAt, { addSuffix: true, locale })
                    : t('clientDashboard.justNow')}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
