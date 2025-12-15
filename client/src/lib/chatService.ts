// src/lib/chatService.ts
import * as signalR from '@microsoft/signalr';

export interface Message {
    id: string; projectId: string;
    senderId: string; senderName: string; senderRole: string;
    receiverId: string; content: string; isRead: boolean;
    createdAt: string;
}

export class ChatService {
    private connection: signalR.HubConnection | null = null;
    private messageCallbacks: ((message: Message) => void)[] = [];

    async connect(jwt: string) {
        if (this.connection) await this.disconnect();

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`http://localhost:5001/hubs/chat?access_token=${jwt}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.on('ReceiveMessage', (message: Message) => {
            this.messageCallbacks.forEach(cb => cb(message));
        });

        await this.connection.start();
        console.log('✅ WebSocket connected');
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            this.messageCallbacks = [];
            this.connection = null;
            console.log('❌ WebSocket disconnected');
        }
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    async joinProject(projectId: string) {
        if (this.isConnected()) {
            await this.connection!.invoke('JoinProject', projectId);
            console.log(`✅ Joined project: ${projectId}`);
        }
    }

    async leaveProject(projectId: string) {
        if (this.isConnected()) {
            await this.connection!.invoke('LeaveProject', projectId);
            console.log(`❌ Left project: ${projectId}`);
        }
    }

    async sendMessage(projectId: string, receiverId: string, content: string) {
        if (!this.isConnected()) throw new Error('Not connected to chat service');
        await this.connection!.invoke('SendMessage', {
            projectId, receiverId, content,
            attachmentUrl: null, attachmentType: null,
        });
        console.log('📤 Message sent');
    }

    onMessage(callback: (message: Message) => void) {
        this.messageCallbacks.push(callback);
        return () => { this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback); };
    }

    clearCallbacks() { this.messageCallbacks = []; }
}

export const chatService = new ChatService();
