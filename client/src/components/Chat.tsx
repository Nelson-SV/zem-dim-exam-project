import React, { useState, useEffect, useRef } from 'react';
import type {User} from '../services/api';
import { chatService, type Message } from '../services/chat';

interface ChatProps {
    user: User;
    onLogout: () => void;
}

const PROJECT_ID = '33333333-3333-3333-3333-333333333333';
const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const CLIENT_ID = '22222222-2222-2222-2222-222222222222';

export const Chat: React.FC<ChatProps> = ({ user, onLogout }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const receiverId = user.role === 'Admin' ? CLIENT_ID : ADMIN_ID;

    useEffect(() => {
        const initChat = async () => {
            try {
                await chatService.connect(user.jwt);
                await chatService.joinProject(PROJECT_ID);
                setConnected(true);

                chatService.onMessage((message) => {
                    setMessages(prev => [...prev, message]);
                });
            } catch (error) {
                console.error('❌ Chat init error:', error);
            }
        };

        initChat();

        return () => {
            chatService.disconnect();
        };
    }, [user.jwt]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connected) return;

        try {
            await chatService.sendMessage(PROJECT_ID, receiverId, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('❌ Send error:', error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.headerTitle}>💬 Chat</h2>
                    <p style={styles.userInfo}>
                        {user.email} ({user.role})
                        {connected ? ' 🟢' : ' 🔴'}
                    </p>
                </div>
                <button onClick={onLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>

            <div style={styles.messagesContainer}>
                {messages.length === 0 && (
                    <p style={styles.emptyState}>No messages yet. Start chatting!</p>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            ...styles.message,
                            ...(message.senderId === user.id ? styles.myMessage : styles.theirMessage)
                        }}
                    >
                        <div style={{
                            ...styles.messageSender,
                            color: message.senderId === user.id ? 'rgba(255,255,255,0.9)' : '#333'
                        }}>
                            {message.senderName} ({message.senderRole})
                        </div>
                        <div style={{
                            ...styles.messageContent,
                            color: message.senderId === user.id ? 'white' : '#000'
                        }}>
                            {message.content}
                        </div>
                        <div style={{
                            ...styles.messageTime,
                            color: message.senderId === user.id ? 'rgba(255,255,255,0.7)' : '#666'
                        }}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={styles.input}
                    disabled={!connected}
                />
                <button
                    type="submit"
                    disabled={!connected || !newMessage.trim()}
                    style={{
                        ...styles.sendButton,
                        opacity: (!connected || !newMessage.trim()) ? 0.5 : 1
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        width: '100vw',
        margin: 0,
        backgroundColor: 'white',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    header: {
        padding: '1rem 2rem',
        backgroundColor: '#F97316',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.5rem'
    },
    userInfo: {
        margin: 0,
        fontSize: '0.875rem',
        opacity: 0.9
    },
    logoutButton: {
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        color: '#F97316',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        transition: 'transform 0.2s'
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column' as const
    },
    emptyState: {
        textAlign: 'center' as const,
        color: '#999',
        marginTop: '2rem'
    },
    message: {
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        maxWidth: '85%', // ← Змінено з 70% на 85%
        minWidth: '200px', // ← Додано мінімальну ширину
        wordWrap: 'break-word' as const,
        display: 'flex',
        flexDirection: 'column' as const
    },
    myMessage: {
        backgroundColor: '#F97316',
        color: 'white',
        alignSelf: 'flex-end' as const,
        borderBottomRightRadius: '4px'
    },
    theirMessage: {
        backgroundColor: 'white',
        color: '#000',
        alignSelf: 'flex-start' as const,
        borderBottomLeftRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    messageSender: {
        fontSize: '0.75rem',
        fontWeight: 'bold' as const,
        marginBottom: '0.25rem'
    },
    messageContent: {
        marginBottom: '0.25rem',
        fontSize: '0.95rem',
        lineHeight: 1.4
    },
    messageTime: {
        fontSize: '0.7rem'
    },
    inputContainer: {
        display: 'flex',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #ddd',
        backgroundColor: 'white',
        gap: '0.5rem',
        flexShrink: 0
    },
    input: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '24px',
        fontSize: '1rem',
        outline: 'none' as const
    },
    sendButton: {
        padding: '0.75rem 2rem',
        backgroundColor: '#F97316',
        color: 'white',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '1rem',
        transition: 'all 0.2s'
    }
};