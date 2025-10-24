import { Building, Users, CheckCircle2, Clock } from 'lucide-react';
import { mockProjects, mockActivities, mockClients } from '../lib/mock-data';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
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
  const activeProjects = mockProjects.filter(p => p.status === 'active');
  const completedProjects = mockProjects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Clients"
          value={mockClients.length.toString()}
          icon={<Users className="size-6 text-white" />}
          color="bg-[#F97316]"
        />
        <StatsCard
          title="Total projects"
          value={mockProjects.length.toString()}
          icon={<Building className="size-6 text-white" />}
          color="bg-[#3B82F6]"
        />
        <StatsCard
          title="Completed"
          value={completedProjects.length.toString()}
          icon={<CheckCircle2 className="size-6 text-white" />}
          color="bg-[#10B981]"
        />
        <StatsCard
          title="In progress"
          value={activeProjects.length.toString()}
          icon={<Clock className="size-6 text-white" />}
          color="bg-[#F59E0B]"
        />
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2>Active projects</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{project.name}</h3>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status === 'active' ? 'Active' : 'Completed'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Current stage</span>
                    <span>{project.currentStage}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span>{project.clientName}</span>
                  </div>

                  <div className="pt-3">
                    <Button 
                      onClick={() => onViewProject?.(project.id)}
                      className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
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

      {/* Recent Activity */}
      <div>
        <h2 className="mb-6">Latest updates</h2>
        <Card className="divide-y">
          {mockActivities.map(activity => {
            const IconComponent = activity.icon === 'Camera' ? Users : 
                                 activity.icon === 'TrendingUp' ? CheckCircle2 : 
                                 Clock;
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
