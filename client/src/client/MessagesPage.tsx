import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/useAuth';
import { getUserProjects, getProjectParticipants } from '../lib/api';
import { ProjectsSidebar } from './ProjectsSidebar';
import { MessagesChat } from './MessagesChat';
import type { ProjectDto, ProjectParticipantsDto } from '../lib/types';
import { Card } from '../components/ui/card';
import { MessageSquare, Loader2 } from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ProjectParticipantsDto | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getUserProjects(user.id);
        setProjects(data ?? []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedProjectId) {
      setParticipants(null);
      setLoadingParticipants(false);
      return;
    }

    setLoadingParticipants(true);
    setParticipants(null);

    (async () => {
      try {
        const data = await getProjectParticipants(selectedProjectId);
        setParticipants(data);
      } catch (err) {
        console.error('❌ Failed to load participants:', err);
        setParticipants(null);
      } finally {
        setLoadingParticipants(false);
      }
    })();
  }, [selectedProjectId]);

  const chatData = useMemo(() => {
    if (!user || !selectedProjectId || !participants) {
      return { receiverId: null, receiverName: 'Loading…' };
    }

    const userRole = user.role.toLowerCase();

    if (userRole === 'client') {
      return {
        receiverId: participants.adminId || null,
        receiverName: 'Project Manager',
      };
    }

    const project = projects.find(p => p.id === selectedProjectId);
    return {
      receiverId: participants.clientId || null,
      receiverName: project?.clientName || 'Client',
    };
  }, [user, participants, selectedProjectId, projects]);

  return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Messages</h2>
          <p className="text-muted-foreground">
            {user?.role.toLowerCase() === 'admin' ? 'Communicate with your clients' : 'Chat with your project manager'}
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex" style={{ height: '600px' }}>
            <ProjectsSidebar
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
            />

            <div className="flex-1 flex flex-col">
              {!selectedProjectId && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="size-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a project to start messaging</p>
                    </div>
                  </div>
              )}

              {selectedProjectId && loadingParticipants && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="size-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                      <p className="text-muted-foreground">Loading chat...</p>
                    </div>
                  </div>
              )}

              {selectedProjectId && !loadingParticipants && participants && (
                  <MessagesChat
                      projectId={selectedProjectId}
                      receiverId={chatData.receiverId}
                      receiverName={chatData.receiverName}
                  />
              )}
            </div>
          </div>
        </Card>
      </div>
  );
}