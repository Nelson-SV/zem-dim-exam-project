import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Progress } from '../components/ui/progress';
import { http } from "../lib/api.ts";
import { PaginationComponent } from "../components/PaginationComponent.tsx";
import type { ProjectDto } from '../generated-client';
import ConfirmationWindowModal from "../components/ConfirmationWindowModal";
import { ProjectModal } from "./ProjectModal";

interface AdminProjectsListProps {
  onViewProject?: (projectId: string) => void;
}

export function AdminProjectsList({ onViewProject }: AdminProjectsListProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const locale = i18n.language === 'uk' ? uk : enUS;

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
      toast.error(err?.message ?? t('projects.failedToLoadProjects'));
    }
  }, [searchQuery, statusFilter, page, pageSize, t]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateModal = () => {
    setProjectModalMode('create');
    setSelectedProject(null);
    setProjectModalOpen(true);
  };

  const openEditModal = (project: ProjectDto) => {
    setProjectModalMode('edit');
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const handleModalClose = () => {
    setProjectModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectSaved = (_project: ProjectDto, _mode: 'create' | 'edit') => {
    loadProjects();
    handleModalClose();
  };

  const openDeleteModal = (project: ProjectDto) => {
    setSelectedProject(project);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject?.id) {
      toast.error(t('projects.projectNotFound'));
      return;
    }
    try {
      await http.projects.deleteProject(selectedProject.id);
      toast.success(t('projects.projectDeleted'));
      loadProjects();
    } catch (err: any) {
      toast.error(err?.message ?? t('projects.failedToDeleteProject'));
    } finally {
      setConfirmDeleteOpen(false);
      setSelectedProject(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t('projects.count')}: {total}
          </p>
        </div>
        <Button className="bg-[#F97316] hover:bg-[#F97316]/90" onClick={openCreateModal}>
          <Plus className="size-4 mr-2" />
          {t('projects.newProject')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t('projects.searchProjects')}
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
            <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
            <SelectItem value="In Progress">{t('projects.inProgress')}</SelectItem>
            <SelectItem value="Completed">{t('projects.completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                {project.thumbnailUrl == null || project.thumbnailUrl === "" ? t('projects.projectOfClient') + ': ' + project.clientName
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
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(project)}>
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => openDeleteModal(project)}>
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground">{t('projects.client')}</p>
                    <p>{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('projects.currentStage')}</p>
                      <p>{project.currentStageTitle ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('projects.area')}</p>
                    <p>{project.totalArea ?? 0} m²</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{t('projects.projectProgress')}</span>
                    <span>{project.progressPercentage ?? 0}%</span>
                  </div>
                  <Progress value={project.progressPercentage ?? 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                  <span>
                    {project.startDate && format(new Date(project.startDate), 'dd MMM yyyy', { locale })} - {project.plannedEndDate && format(new Date(project.plannedEndDate), 'dd MMM yyyy', { locale })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProject?.(project.id!)}
                  >
                    {t('dashboard.viewDetails')}
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

      <ProjectModal
        open={projectModalOpen}
        mode={projectModalMode}
        project={selectedProject}
        onClose={handleModalClose}
        onSaved={handleProjectSaved}
      />

      <ConfirmationWindowModal
        isOpen={confirmDeleteOpen}
        title={t('projects.confirmDelete')}
        message={`${t('projects.confirmDeleteMessage')} "${selectedProject?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
