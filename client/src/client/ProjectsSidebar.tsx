import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/useAuth';
import { http } from '../lib/api';
import type { ProjectDto } from '../generated-client';
interface Props {
    projects: ProjectDto[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string) => void;
}

export function ProjectsSidebar({ projects, selectedProjectId, onSelectProject }: Props) {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;
        if (!projects.length) return;

        const loadUnreadCounts = async () => {
            const counts: Record<string, number> = {};
            await Promise.all(
                projects.map(async (project) => {
                    try {
                        const count = await http.messages.getProjectUnreadCount(project.id!);
                        counts[project.id!] = count;
                    } catch (err) {
                        console.error(`Failed to load unread count for ${project.id}:`, err);
                    }
                })
            );
            setUnreadCounts(counts);
        };

        loadUnreadCounts();

        const interval = setInterval(loadUnreadCounts, 30000);
        const onRefresh = () => loadUnreadCounts();
        window.addEventListener('messages:refreshCounts', onRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('messages:refreshCounts', onRefresh);
        };
    }, [user?.id, projects.map(p => p.id).join(',')]);

    return (
        <div className="w-80 border-r bg-card">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Projects</h3>
                <p className="text-sm text-muted-foreground">{projects.length} total</p>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-12rem)]">
                {projects.map((project) => {
                    const unreadCount = unreadCounts[project.id!] || 0;
                    const isSelected = selectedProjectId === project.id;

                    return (
                        <button
                            key={project.id}
                            onClick={() => {
                                onSelectProject(project.id!);
                                if ((unreadCounts[project.id!] || 0) > 0) {
                                    setUnreadCounts(prev => ({ ...prev, [project.id!]: 0 }));
                                }
                            }}
                            className={`w-full p-4 border-b hover:bg-muted/50 transition-colors text-left relative ${
                                isSelected ? 'bg-muted' : ''
                            } ${unreadCount > 0 ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <Avatar className="size-10">
                                        <AvatarFallback className="bg-[#F97316] text-white">
                                            {project.title!.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* ✅ New message indicator */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`font-medium truncate ${unreadCount > 0 ? 'font-bold' : ''}`}>
                                            {project.title}
                                        </p>
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
                    );
                })}
            </div>
        </div>
    );
}
