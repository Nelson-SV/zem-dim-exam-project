// src/contexts/AuthProvider.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { LoginResult, User } from './auth-types';
import { chatService } from '../lib/chatService';
import { http } from '../lib/api';

const AUTH_JWT_KEY = 'auth_jwt';
const AUTH_USER_KEY = 'auth_user';
const AUTH_REFRESH_KEY = 'auth_refresh';
const TEMP_AUTH_JWT_KEY = 'temp_auth_jwt';
const TEMP_AUTH_USER_KEY = 'temp_auth_user';
const AUTH_UPDATED_EVENT = 'auth:updated';
const AUTH_LOGOUT_EVENT = 'auth:logout';


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
    const [connectedToken, setConnectedToken] = useState<string | null>(null);

    const syncFromStorage = async () => {
        const storedToken = localStorage.getItem(AUTH_JWT_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken) {
            try {
                let parsed: User = storedUser ? JSON.parse(storedUser) : null;

                if (!parsed || !parsed.role || !parsed.id || !parsed.email) {
                    const payload = decodeJwt<any>(storedToken);
                    parsed = mapUserFromPayload(payload);
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed));
                }

                setUser(parsed);
                setToken(storedToken);

                if (!chatService.isConnected() || connectedToken !== storedToken) {
                    chatService
                        .connect(storedToken)
                        .then(() => setConnectedToken(storedToken))
                        .catch(console.error);
                }
            } catch {
                localStorage.removeItem(AUTH_JWT_KEY);
                localStorage.removeItem(AUTH_USER_KEY);
                localStorage.removeItem(AUTH_REFRESH_KEY);
                setUser(null);
                setToken(null);
            }
        } else {
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem(AUTH_REFRESH_KEY);
            setUser(null);
            setToken(null);
            chatService.disconnect();
            setConnectedToken(null);
        }
    };

    useEffect(() => {
        syncFromStorage().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const handleAuthUpdated = () => {
            syncFromStorage();
        };

        window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
        window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthUpdated);

        return () => {
            window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
            window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthUpdated);
        };
    }, [connectedToken]);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        const { jwt, refreshToken, mustChangePassword } = await http.auth.login({ email, password });

        if (mustChangePassword) {
            localStorage.removeItem(AUTH_JWT_KEY);
            localStorage.removeItem(AUTH_REFRESH_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.setItem(TEMP_AUTH_JWT_KEY, jwt);
            const payload = decodeJwt<any>(jwt);
            const userData = mapUserFromPayload(payload);
            setUser(userData);
            return { mustChangePassword: true };
        }

        if (!refreshToken) {
            throw new Error('Login response missing refresh token. Is the API updated?');
        }

        const payload = decodeJwt<any>(jwt);
        const userData = mapUserFromPayload(payload);

        localStorage.setItem(AUTH_JWT_KEY, jwt);
        localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));

        setUser(userData);
        setToken(jwt);

        if (!chatService.isConnected() || connectedToken !== jwt) {
            await chatService.connect(jwt);
            setConnectedToken(jwt);
        }
        return { mustChangePassword: false, role: userData.role };
    };

    const logout = async () => {
        try {
            await http.auth.logout();
        } catch (error) {
            console.warn('Logout request failed, clearing local session', error);
        }

        localStorage.removeItem(AUTH_JWT_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_REFRESH_KEY);
        localStorage.removeItem(TEMP_AUTH_JWT_KEY);
        localStorage.removeItem(TEMP_AUTH_USER_KEY);

        setUser(null);
        setToken(null);

        chatService.disconnect();
        setConnectedToken(null);
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
}
