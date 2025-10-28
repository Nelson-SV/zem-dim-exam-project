// src/client/MessagesWithSignalR.tsx
import { useEffect, useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { chatService } from '../lib/chatService';
import { useAuth } from '../contexts/useAuth';

type Props = { projectId: string; receiverId: string; receiverName: string };

export function Messages({ projectId, receiverId, receiverName }: Props) {
  const { user, token } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    projectId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    content: string;
    createdAt: string;
  }>>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // підключення до кімнати проєкту
  useEffect(() => {
    if (!token) return;
    // chatService.connect(token) вже викликається в AuthContext під час логіну,
    // тож тут достатньо приєднатися до кімнати
    (async () => {
      await chatService.joinProject(projectId);
    })();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const off = chatService.onMessage?.bind(chatService);
    chatService.onMessage((m) => {
      if (m.projectId === projectId) {
        setMessages((prev) => [...prev, {
          id: m.id,
          projectId: m.projectId,
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          receiverId: m.receiverId,
          content: m.content,
          createdAt: m.createdAt,
        }]);
      }
    });

    return () => {
      chatService.clearCallbacks();
      chatService.leaveProject(projectId).catch(() => {});
    };
  }, [token, projectId]);

  // автоскрол вниз
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !user) return;
    await chatService.sendMessage(projectId, receiverId, text);
    // оптимістичне відображення
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        projectId,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        senderRole: user.role.toLowerCase(),
        receiverId,
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewMessage('');
  };

  return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-1">Messages</h2>
          <p className="text-muted-foreground">Chat with {receiverName}</p>
        </div>

        <Card className="flex flex-col h-[600px]">
          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                  <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="size-10">
                      <AvatarImage src={isMe
                          ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me'
                          : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peer'
                      } />
                      <AvatarFallback>
                        {(m.senderName || 'U').split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground">{m.senderName}</span>
                        <span className="text-muted-foreground">
                      {format(new Date(m.createdAt), 'HH:mm', { locale: enUS })}
                    </span>
                      </div>
                      <div className={`px-4 py-3 rounded-lg ${isMe ? 'bg-[#F97316] text-white' : 'bg-muted'}`}>
                        <p>{m.content}</p>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Paperclip className="size-5" />
              </Button>
              <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} className="bg-[#F97316] hover:bg-[#F97316]/90">
                <Send className="size-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
  );
}
