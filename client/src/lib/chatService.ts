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
            this.messageCallbacks.forEach((callback) => callback(message));
        });

        try {
            await this.connection.start();
            console.log('✅ WebSocket connected');
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
                this.messageCallbacks = []; // Очистити callbacks
                console.log('❌ WebSocket disconnected');
            } catch (error) {
                console.error('Error disconnecting:', error);
            }
        }
    }

    async joinProject(projectId: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('JoinProjectChat', projectId);
                console.log(`✅ Joined project: ${projectId}`);
            } catch (error) {
                console.error('Failed to join project:', error);
            }
        }
    }

    async leaveProject(projectId: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('LeaveProjectChat', projectId);
                console.log(`❌ Left project: ${projectId}`);
            } catch (error) {
                console.error('Failed to leave project:', error);
            }
        }
    }

    async sendMessage(projectId: string, receiverId: string, content: string) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke(
                    'SendMessage',
                    receiverId,
                    projectId,
                    content,
                    null, // attachmentUrl
                    null  // attachmentType
                );
                console.log('📤 Message sent');
            } catch (error) {
                console.error('Failed to send message:', error);
                throw error;
            }
        } else {
            throw new Error('Not connected to chat service');
        }
    }

    onMessage(callback: (message: Message) => void) {
        this.messageCallbacks.push(callback);
    }

    clearCallbacks() {
        this.messageCallbacks = [];
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

export const chatService = new ChatService();