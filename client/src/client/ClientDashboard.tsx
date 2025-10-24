import { Calendar, Clock, TrendingUp, Camera, MessageCircle, CheckCircle2 } from 'lucide-react';
import { mockProjects, mockActivities } from '../lib/mock-data';
import { enUS } from 'date-fns/locale';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export function ClientDashboard() {
  const project = mockProjects[0];
  const daysRemaining = differenceInDays(new Date(project.endDate), new Date());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return Camera;
      case 'stage':
        return TrendingUp;
      case 'message':
        return MessageCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] rounded-lg p-8 text-white">
        <h2 className="mb-2">Welcome, Oleksandr!</h2>
        <p className="opacity-90">
          Your project is {project.progress}% complete. {daysRemaining} days remaining until the finish date.
        </p>
      </div>

      {/* Main Project Card */}
      <Card className="overflow-hidden">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <h2 className="mb-2">{project.name}</h2>
              <p className="text-muted-foreground">{project.address}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-[#10B981]">
                <CheckCircle2 className="size-3 mr-1" />
                {project.progress}% complete
              </Badge>
              <Badge variant="outline">
                {project.area} m²
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">Start date</p>
                <p>{format(new Date(project.startDate), 'dd MMMM yyyy', { locale: enUS })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#F59E0B]/10">
                <Clock className="size-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-muted-foreground">Planned completion</p>
                <p>{format(new Date(project.endDate), 'dd MMMM yyyy', { locale: enUS })}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span>Overall progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-primary" />
              <div>
                <p>Current stage</p>
                <p className="text-muted-foreground">{project.currentStage}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Stages Timeline */}
      <div>
        <h3 className="mb-6">Construction stages</h3>
        <Card className="p-6">
          <div className="space-y-4">
            {project.stages.map((stage, index) => (
              <div key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`size-10 rounded-full flex items-center justify-center ${
                    stage.status === 'completed' ? 'bg-[#10B981]' :
                    stage.status === 'in-progress' ? 'bg-[#F97316]' :
                    'bg-muted'
                  }`}>
                    {stage.status === 'completed' && (
                      <CheckCircle2 className="size-5 text-white" />
                    )}
                    {stage.status === 'in-progress' && (
                      <Clock className="size-5 text-white" />
                    )}
                    {stage.status === 'pending' && (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  {index < project.stages.length - 1 && (
                    <div className={`w-0.5 h-16 ${
                      stage.status === 'completed' ? 'bg-[#10B981]' : 'bg-border'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4>{stage.name}</h4>
                    <Badge variant={
                      stage.status === 'completed' ? 'default' :
                      stage.status === 'in-progress' ? 'secondary' :
                      'outline'
                    }>
                      {stage.status === 'completed' ? 'Completed' :
                       stage.status === 'in-progress' ? 'In Progress' :
                       'Pending'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{stage.description}</p>
                  {stage.status !== 'pending' && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{stage.progress}%</span>
                      </div>
                      <Progress value={stage.progress} className="h-2" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Updates */}
      <div>
        <h3 className="mb-6">Latest updates</h3>
        <Card className="divide-y">
          {mockActivities.map(activity => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4>{activity.title}</h4>
                  <p className="text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: enUS })}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
