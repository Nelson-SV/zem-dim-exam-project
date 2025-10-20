import { authClient, projectsClient, messagesClient } from './api';
import type { User } from './api';

// простий декодер JWT без перевірки підпису (тільки payload)
export function decodeJwt<T = any>(jwt: string): T {
    const [, payload] = jwt.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

// створюємо fetch, що підставляє Authorization
function makeAuthedFetch(token: string) {
    return {
        fetch: (url: RequestInfo, init?: RequestInit) => {
            const headers = new Headers(init?.headers ?? {});
            headers.set('Authorization', `Bearer ${token}`);
            return window.fetch(url, { ...init, headers });
        },
    };
}

// викликати ПІСЛЯ логіну/відновлення, щоб усі клієнти ходили з токеном
export function setAuthToken(token: string) {
    const http = makeAuthedFetch(token);
    (projectsClient as any)['http'] = http;
    (messagesClient as any)['http'] = http;
}

export async function login(email: string, password: string): Promise<User> {
    const { jwt } = await authClient.login({ email, password });
    const payload = decodeJwt<any>(jwt);

    const user: User = {
        id: payload.sub,                 // GUID як string
        email: payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        jwt,
    };

    // запам'ятати сесію
    localStorage.setItem('auth_jwt', jwt);
    localStorage.setItem('auth_user', JSON.stringify(user));

    // підключити авторизацію для REST
    setAuthToken(jwt);

    return user;
}

export function restoreUser(): User | null {
    const jwt = localStorage.getItem('auth_jwt');
    const u = localStorage.getItem('auth_user');
    if (!jwt || !u) return null;

    try {
        const user: User = JSON.parse(u);
        setAuthToken(jwt);
        return user;
    } catch {
        localStorage.removeItem('auth_jwt');
        localStorage.removeItem('auth_user');
        return null;
    }
}

export function logout() {
    localStorage.removeItem('auth_jwt');
    localStorage.removeItem('auth_user');
}
