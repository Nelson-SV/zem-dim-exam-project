import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { mockMessages } from '../lib/mock-data';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function Messages() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `m${messages.length + 1}`,
      senderId: '1',
      senderName: 'Oleksandr Kovalenko',
      senderRole: 'client' as const,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1">Messages</h2>
        <p className="text-muted-foreground">Communicate with your project manager</p>
      </div>

      <Card className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.senderRole === 'client' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="size-10">
                <AvatarImage src={message.senderRole === 'admin' 
                  ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' 
                  : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
                } />
                <AvatarFallback>
                  {message.senderName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex flex-col ${
                  message.senderRole === 'client' ? 'items-end' : 'items-start'
                } max-w-[70%]`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground">
                    {message.senderName}
                  </span>
                  <span className="text-muted-foreground">
                    {format(new Date(message.timestamp), 'HH:mm', { locale: enUS })}
                  </span>
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.senderRole === 'client'
                      ? 'bg-[#F97316] text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="size-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend}
              className="bg-[#F97316] hover:bg-[#F97316]/90"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
