import { useEffect, useState, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { chatService } from '../lib/chatService';
import { getProjectMessages, markMessageAsRead } from '../lib/api';
import { useAuth } from '../contexts/useAuth';

type Props = {
  projectId: string;
  receiverId: string | null;
  receiverName: string;
};

export function MessagesChat({ projectId, receiverId, receiverName }: Props) {
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
  const [loadingHistory, setLoadingHistory] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const joinedProjectRef = useRef<string | null>(null);

  // ⛔️ Anti-duplicate: store all received message ids
  const receivedIdsRef = useRef<Set<string>>(new Set());

  // 1) Loading history + marking unread as read for the current user
  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        setLoadingHistory(true);
        const history = await getProjectMessages(projectId);

        const formatted = history.map(msg => ({
          id: msg.id,
          projectId: msg.projectId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          receiverId: msg.receiverId,
          content: msg.content,
          createdAt: msg.createdAt,
        }));

        // populate the id cache for anti-duplicate
        receivedIdsRef.current = new Set(formatted.map(m => m.id));

        setMessages(formatted);

        // mark unread for me
        if (user) {
          const unreadForMe = history.filter(m => m.receiverId === user.id && !m.isRead);
          if (unreadForMe.length) {
            await Promise.all(unreadForMe.map(m => markMessageAsRead(m.id)));
            // update badges (Navigation listens to this event)
            window.dispatchEvent(new CustomEvent('messages:refreshCounts'));
          }
        }
      } catch (err) {
        console.error('❌ Failed to load message history:', err);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [projectId, user?.id]);

  // 2) WebSocket subscription
  useEffect(() => {
    if (!token || !receiverId) return;
    if (joinedProjectRef.current === projectId) return;

    let off: (() => void) | undefined;

    (async () => {
      if (joinedProjectRef.current && joinedProjectRef.current !== projectId) {
        await chatService.leaveProject(joinedProjectRef.current).catch(() => {});
      }
      await chatService.joinProject(projectId);
      joinedProjectRef.current = projectId;
    })();

    off = chatService.onMessage(async (m) => {
      if (m.projectId !== projectId) return;


      if (receivedIdsRef.current.has(m.id)) {
        // console.debug('⚠️ Duplicate message prevented:', m.id);
        return;
      }
      receivedIdsRef.current.add(m.id);

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

      // if this is incoming for me - immediately mark as read
      if (user && m.receiverId === user.id) {
        try {
          await markMessageAsRead(m.id);
          window.dispatchEvent(new CustomEvent('messages:refreshCounts'));
        } catch (e) {
          console.error('markMessageAsRead failed', e);
        }
      }
    });

    return () => { off?.(); };
  }, [token, projectId, receiverId, user?.id]);

  // 3) Cleanup when unmounting
  useEffect(() => {
    return () => {
      if (joinedProjectRef.current) {
        chatService.leaveProject(joinedProjectRef.current).catch(() => {});
        joinedProjectRef.current = null;
      }
    };
  }, []);

  // 4) autoscroll
  useEffect(() => {
    if (!loadingHistory) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loadingHistory]);

  const canSend = receiverId !== null && receiverId !== '' && Boolean(user);
  const isLoading = receiverId === null || receiverId === '';

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !user || !receiverId) return;

    try {
      // without optimistic addition (to avoid duplication, the server will send with id)
      await chatService.sendMessage(projectId, receiverId, text);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
      <div className="flex flex-col h-full w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Messages</h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
                <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Resolving recipient…
            </span>
            ) : (
                `Chat with ${receiverName}`
            )}
          </p>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="size-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
          ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
          ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                    <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="size-10">
                        <AvatarImage src={isMe ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peer'} />
                        <AvatarFallback>{(m.senderName || 'U').split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">{m.senderName}</span>
                          <span className="text-xs text-muted-foreground">
                      {format(new Date(m.createdAt), 'HH:mm', { locale: enUS })}
                    </span>
                        </div>
                        <div className={`px-4 py-3 rounded-lg ${isMe ? 'bg-[#F97316] text-white' : 'bg-muted'}`}>
                          <p>{m.content}</p>
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={!canSend}>
              <Paperclip className="size-5" />
            </Button>
            <Input
                placeholder={isLoading ? 'Waiting for recipient…' : 'Type a message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && canSend && handleSend()}
                disabled={!canSend}
            />
            <Button
                onClick={handleSend}
                disabled={!canSend || !newMessage.trim()}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </div>
  );
}
