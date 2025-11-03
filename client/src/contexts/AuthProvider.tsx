// src/contexts/AuthProvider.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User, RegisterData } from './auth-types';
import { authClient, userManagementClient, setupAuthHeader } from '../lib/api';
import { chatService } from '../lib/chatService';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeJwt<T = any>(jwt: string): T {
  const [, payload] = jwt.split('.');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
  return JSON.parse(atob(base64));
}
function normalizeRole(r?: string): 'admin' | 'client' {
  const v = (r ?? '').toLowerCase();
  return v === 'admin' ? 'admin' : 'client';
}
function mapUserFromPayload(payload: any): User {
  return {
    id: payload.sub ?? payload.nameid ?? payload.Id ?? '',
    email: payload.email ?? payload.Email ?? '',
    role: normalizeRole(payload[ROLE_CLAIM] ?? payload.role ?? payload.Role),
    firstName: payload.given_name ?? payload.FirstName ?? 'User',
    lastName: payload.family_name ?? payload.LastName ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedToken, setConnectedToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_jwt');
    const storedUser = localStorage.getItem('auth_user');

    (async () => {
      try {
        if (storedToken) {
          let parsed: User | null = storedUser ? JSON.parse(storedUser) : null;
          if (!parsed || !parsed.role || !parsed.id || !parsed.email) {
            parsed = mapUserFromPayload(decodeJwt<any>(storedToken));
            localStorage.setItem('auth_user', JSON.stringify(parsed));
          }
          setUser(parsed);
          setToken(storedToken);
          setupAuthHeader(storedToken);

          if (!(chatService as any).isConnected || !chatService.isConnected()) {
            await chatService.connect(storedToken);
            setConnectedToken(storedToken);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { jwt } = await authClient.login({ email, password });
    const userData = mapUserFromPayload(decodeJwt<any>(jwt));

    localStorage.setItem('auth_jwt', jwt);
    localStorage.setItem('auth_user', JSON.stringify(userData));

    setUser(userData);
    setToken(jwt);
    setupAuthHeader(jwt);

    if (!chatService.isConnected() || connectedToken !== jwt) {
      await chatService.connect(jwt);
      setConnectedToken(jwt);
    }
  };

  // ⚠️ якщо у твоєму generated-клієнті реєстрація не в AuthClient — використовуй userManagementClient
  const register = async (data: RegisterData) => {
    // A) якщо метод є в AuthClient:
    // const { jwt } = await authClient.register({...});

    // B) інакше (часто так):
    const { jwt } = await userManagementClient.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      language: 'en',
    });

    const userData = mapUserFromPayload(decodeJwt<any>(jwt));
    localStorage.setItem('auth_jwt', jwt);
    localStorage.setItem('auth_user', JSON.stringify(userData));

    setUser(userData);
    setToken(jwt);
    setupAuthHeader(jwt);

    if (!chatService.isConnected() || connectedToken !== jwt) {
      await chatService.connect(jwt);
      setConnectedToken(jwt);
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_jwt');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    try { await chatService.disconnect(); } catch {}
    setConnectedToken(null);
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout, token }}>
        {children}
      </AuthContext.Provider>
  );
}
