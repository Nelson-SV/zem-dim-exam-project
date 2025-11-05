export interface User {
    id: string;
    email: string;
    role: 'admin' | 'client';
    firstName: string;
    lastName: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    token: string | null;
}
