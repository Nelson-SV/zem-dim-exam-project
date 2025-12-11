import {useEffect, useMemo, useState} from 'react';
import {ArrowLeft, Calendar, MapPin, User, CheckCircle2, Clock, TrendingUp, Camera, Box, FileText} from 'lucide-react';
import {Card} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Progress} from '../components/ui/progress';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {toast} from 'sonner';
import {format} from 'date-fns';
import {Admin3DScansView} from './3d-scans/Admin3DScansView';
import {AdminStagesView, type MilestoneViewModel} from './stages/AdminStagesView';
import {AdminPhotosView} from './photos/AdminPhotosView';
import {AdminDocumentsView} from './documents/AdminDocumentsView';
import {http} from '../lib/api';
import type { ProjectDto } from '../generated-client';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [milestones, setMilestones] = useState<MilestoneViewModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await http.projects.getProject(projectId);
        setProject(data);
      } catch (err: any) {
        toast.error(err?.message ?? 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const completedStages = useMemo(
    () => milestones.filter(m => m.status?.toLowerCase() === 'completed').length,
    [milestones]
  );

  const currentStageName = useMemo(() => {
    const active = milestones.find(m => m.status?.toLowerCase() !== 'completed');
    return active?.title ?? 'Completed';
  }, [milestones]);

  const daysRemaining = useMemo(() => {
    const end = project?.plannedEndDate ?? project?.actualEndDate;
    if (!end) return 0;
    const endDate = new Date(end as any);
    const today = new Date();
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [project]);

  if (loading) {
    return <Card className="p-6">Loading project…</Card>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="mb-2">{project.title}</h2>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                {project.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{project.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>
                    {project.startDate && format(new Date(project.startDate as any), 'dd MMM yyyy')}
                    {project.plannedEndDate && ` - ${format(new Date(project.plannedEndDate as any), 'dd MMM yyyy')}`}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant={project.status?.toLowerCase() === 'completed' ? 'secondary' : 'default'} className="shrink-0">
              {project.status}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-[#F97316] mb-2">{project.progressPercentage ?? 0}%</div>
              <p className="text-muted-foreground">Overall progress</p>
            </div>
            <Progress value={project.progressPercentage ?? 0} className="h-3" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Area</span>
              <span>{project.totalArea ?? 0} m²</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Current stage</span>
              <span>{currentStageName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 bg-[#10B981]/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#10B981]" />
                <span className="text-muted-foreground">Completed stages</span>
              </div>
              <span>{completedStages}/{milestones.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F59E0B]/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#F59E0B]" />
                <span className="text-muted-foreground">Days remaining</span>
              </div>
              <span>{daysRemaining}</span>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="stages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stages">
            <TrendingUp className="size-4 mr-2" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="size-4 mr-2" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="3d">
            <Box className="size-4 mr-2" />
            3D Scans
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="size-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <AdminStagesView projectId={projectId} onMilestonesChanged={setMilestones} />
        </TabsContent>

        <TabsContent value="photos">
          <AdminPhotosView
            projectId={projectId}
            milestones={milestones.map(m => ({ id: m.id, name: m.title }))}
            projectName={project.title!}
          />
        </TabsContent>

        <TabsContent value="3d">
          <Admin3DScansView
            projectId={projectId}
            projectName={project.title!}
            milestones={milestones.map(m => ({ id: m.id, name: m.title }))}
          />
        </TabsContent>

        <TabsContent value="documents">
          <AdminDocumentsView projectId={projectId} />
        </TabsContent>
      </Tabs>

      {project.notes && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Project Notes</h4>
          <p className="text-muted-foreground">{project.notes}</p>
        </Card>
      )}
    </div>
  );
}
