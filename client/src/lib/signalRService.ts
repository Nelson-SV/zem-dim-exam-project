import * as signalR from '@microsoft/signalr';

export interface MessageDto {
    id: string;
    projectId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    readAt?: string;
    attachmentUrl?: string;
    attachmentType?: string;
    timestamp: string;
}

export interface MessageReadDto {
    messageId: string;
    readAt: string;
}

export interface UserTypingDto {
    userId: string;
    isTyping: boolean;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private token: string | null = null;
    

    /**
     * Initialize SignalR connection with JWT token
     */
    async connect(jwtToken: string): Promise<void> {
        this.token = jwtToken;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(API_URL + '/hubs/chat', {
                accessTokenFactory: () => this.token || '',

            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.elapsedMilliseconds < 60000) {
                        return Math.random() * 10000;
                    } else {
                        return null; // Stop reconnecting after 1 minute
                    }
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Set up event handlers
        this.setupEventHandlers();

        try {
            await this.connection.start();
            console.log('SignalR Connected');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            throw err;
        }
    }

    /**
     * Disconnect from SignalR hub
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            console.log('SignalR Disconnected');
        }
    }

    /**
     * Setup connection event handlers
     */
    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.onclose((error) => {
            console.log('SignalR connection closed', error);
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected', connectionId);
        });
    }

    /**
     * Send a message to another user
     */
    async sendMessage(
        receiverId: string,
        projectId: string,
        content: string,
        attachmentUrl?: string,
        attachmentType?: string
    ): Promise<void> {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        try {
            await this.connection.invoke(
                'SendMessage',
                receiverId,
                projectId,
                content,
                attachmentUrl || null,
                attachmentType || null
            );
        } catch (err) {
            console.error('Error sending message:', err);
            throw err;
        }
    }

    /**
     * Mark a message as read
     */
    async markMessageAsRead(messageId: string): Promise<void> {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        try {
            await this.connection.invoke('MarkMessageAsRead', messageId);
        } catch (err) {
            console.error('Error marking message as read:', err);
            throw err;
        }
    }

    /**
     * Join a project chat room
     */
    async joinProjectChat(projectId: string): Promise<void> {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        try {
            await this.connection.invoke('JoinProjectChat', projectId);
        } catch (err) {
            console.error('Error joining project chat:', err);
            throw err;
        }
    }

    /**
     * Leave a project chat room
     */
    async leaveProjectChat(projectId: string): Promise<void> {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        try {
            await this.connection.invoke('LeaveProjectChat', projectId);
        } catch (err) {
            console.error('Error leaving project chat:', err);
            throw err;
        }
    }

    /**
     * Notify that user is typing
     */
    async notifyTyping(receiverId: string, isTyping: boolean): Promise<void> {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        try {
            await this.connection.invoke('UserTyping', receiverId, isTyping);
        } catch (err) {
            console.error('Error notifying typing:', err);
            throw err;
        }
    }

    /**
     * Subscribe to receive messages
     */
    onReceiveMessage(callback: (message: MessageDto) => void): void {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        this.connection.on('ReceiveMessage', callback);
    }

    /**
     * Subscribe to message read events
     */
    onMessageRead(callback: (data: MessageReadDto) => void): void {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        this.connection.on('MessageRead', callback);
    }

    /**
     * Subscribe to user typing events
     */
    onUserTyping(callback: (data: UserTypingDto) => void): void {
        if (!this.connection) {
            throw new Error('SignalR connection is not established');
        }

        this.connection.on('UserTyping', callback);
    }

    /**
     * Get connection state
     */
    getConnectionState(): signalR.HubConnectionState {
        return this.connection?.state || signalR.HubConnectionState.Disconnected;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Export singleton instance
export const signalRService = new SignalRService();