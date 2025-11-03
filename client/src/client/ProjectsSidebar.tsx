import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import type { ProjectDto } from '../lib/types';

interface Props {
    projects: ProjectDto[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string) => void;
}

export function ProjectsSidebar({ projects, selectedProjectId, onSelectProject }: Props) {
    return (
        <div className="w-80 border-r bg-card">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Projects</h3>
                <p className="text-sm text-muted-foreground">{projects.length} total</p>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-12rem)]">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className={`w-full p-4 border-b hover:bg-muted/50 transition-colors text-left ${
                            selectedProjectId === project.id ? 'bg-muted' : ''
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <Avatar className="size-10">
                                <AvatarFallback className="bg-[#F97316] text-white">
                                    {project.title.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium truncate">{project.title}</p>
                                    {project.status && (
                                        <Badge variant="outline" className="ml-2">
                                            {project.status}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {project.clientName}
                                </p>
                                {project.progressPercentage !== undefined && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{project.progressPercentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#F97316]"
                                                style={{ width: `${project.progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}