import * as signalR from '@microsoft/signalr';

export interface Message {
    id: string;
    projectId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export class ChatService {
    private connection: signalR.HubConnection | null = null;
    private messageCallbacks: ((message: Message) => void)[] = [];

    async connect(jwt: string) {
        // Якщо вже підключено - відключитись спочатку
        if (this.connection) {
            await this.disconnect();
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`http://localhost:5001/hubs/chat?access_token=${jwt}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.on('ReceiveMessage', (message: Message) => {
            console.log('📨 Received message:', message);
            this.messageCallbacks.forEach(callback => callback(message));
        });

        await this.connection.start();
        console.log('✅ WebSocket connected');
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            this.messageCallbacks = []; // Очистити callbacks
            console.log('❌ WebSocket disconnected');
        }
    }

    async joinProject(projectId: string) {
        if (this.connection) {
            await this.connection.invoke('JoinProject', projectId);
            console.log(`✅ Joined project: ${projectId}`);
        }
    }

    async leaveProject(projectId: string) {
        if (this.connection) {
            await this.connection.invoke('LeaveProject', projectId);
            console.log(`❌ Left project: ${projectId}`);
        }
    }

    async sendMessage(projectId: string, receiverId: string, content: string) {
        if (this.connection) {
            await this.connection.invoke('SendMessage', {
                projectId,
                receiverId: receiverId || null,
                content,
                attachmentUrl: null,
                attachmentType: null
            });
            console.log('📤 Message sent');
        }
    }

    onMessage(callback: (message: Message) => void) {
        this.messageCallbacks.push(callback);
    }

    clearCallbacks() {
        this.messageCallbacks = [];
    }
}

export const chatService = new ChatService();