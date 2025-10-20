import React, { useState } from 'react';
import { authClient, type User } from '../services/api';

interface LoginProps {
    onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authClient.login({ email, password });

            // Decode JWT to get user info
            const payload = JSON.parse(atob(response.jwt.split('.')[1]));

            const user: User = {
                id: payload.sub,
                email: payload.email,
                role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                jwt: response.jwt
            };

            onLogin(user);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (userEmail: string, userPassword: string) => {
        setEmail(userEmail);
        setPassword(userPassword);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🏗️ ZEM-DIM Chat</h1>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={styles.quickLogin}>
                    <p style={styles.quickLoginTitle}>Quick Login:</p>
                    <button
                        onClick={() => quickLogin('admin@zemdim.com', 'Password123!')}
                        style={styles.quickButton}
                        type="button"
                    >
                        👨‍💼 Login as Admin
                    </button>
                    <button
                        onClick={() => quickLogin('client@test.com', 'Password123!')}
                        style={styles.quickButton}
                        type="button"
                    >
                        👤 Login as Client
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        margin: 0,
        backgroundColor: '#f5f5f5',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    card: {
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
    },
    title: {
        textAlign: 'center' as const,
        marginBottom: '2rem',
        color: '#333',
        fontSize: '2rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem'
    },
    input: {
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none' as const,
        transition: 'border-color 0.2s'
    },
    button: {
        padding: '1rem',
        backgroundColor: '#F97316',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        transition: 'all 0.2s',
        marginTop: '0.5rem'
    },
    error: {
        color: '#EF4444',
        margin: 0,
        fontSize: '0.875rem',
        textAlign: 'center' as const
    },
    quickLogin: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid #eee'
    },
    quickLoginTitle: {
        fontSize: '0.875rem',
        color: '#666',
        marginBottom: '1rem',
        textAlign: 'center' as const
    },
    quickButton: {
        width: '100%',
        padding: '0.75rem',
        marginBottom: '0.75rem',
        backgroundColor: '#3B82F6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500' as const,
        transition: 'all 0.2s'
    }
};