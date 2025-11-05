import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from './auth-types';
import { authClient } from '../lib/api';
import { chatService } from '../lib/chatService';


function decodeJwt<T = any>(jwt: string): T {
    const [, payload] = jwt.split('.');

    const base64 = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    return JSON.parse(atob(base64));
}

function normalizeRole(r?: string): 'admin' | 'client' {
    const v = (r ?? '').toLowerCase();
    return v === 'admin' ? 'admin' : 'client';
}


function mapUserFromPayload(payload: any): User {
    const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    return {
        id: payload.sub ?? '',
        email: payload.email ?? '',
        role: normalizeRole(payload[ROLE_CLAIM] ?? ''),
        firstName: payload.given_name ?? '',
        lastName: payload.family_name ?? '',
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [connectedToken, setConnectedToken] = useState<string | null>(null); // guard SignalR dup

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_jwt');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken) {
            try {
                let parsed: User = storedUser ? JSON.parse(storedUser) : null;

                // If old/local user is missing fields, rebuild from token
                if (!parsed || !parsed.role || !parsed.id || !parsed.email) {
                    const payload = decodeJwt<any>(storedToken);
                    parsed = mapUserFromPayload(payload);
                    localStorage.setItem('auth_user', JSON.stringify(parsed));
                }

                setUser(parsed);
                setToken(storedToken);
                if (!chatService.isConnected() || connectedToken !== storedToken) {
                    chatService.connect(storedToken).then(() => setConnectedToken(storedToken)).catch(console.error);
                }
            } catch {
                localStorage.removeItem('auth_jwt');
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { jwt, mustChangePassword } = await authClient.login({ email, password });

        if (mustChangePassword) {
            localStorage.setItem('temp_auth_jwt', jwt);
            throw new Error('mustChangePassword'); // we’ll handle this in Login page
        }

        const payload = decodeJwt<any>(jwt);
        const userData = mapUserFromPayload(payload);

        localStorage.setItem('auth_jwt', jwt);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        setUser(userData);
        setToken(jwt);

        if (!chatService.isConnected() || connectedToken !== jwt) {
            await chatService.connect(jwt);
            setConnectedToken(jwt);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_jwt');
        localStorage.removeItem('auth_user');

        setUser(null);
        setToken(null);

        chatService.disconnect();
        setConnectedToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
}
