export interface User {
    id: string;
    email: string;
    role: 'admin' | 'client';
    firstName: string;
    lastName: string;
}

export type LoginResult = {
  mustChangePassword: boolean;
  role?: 'admin' | 'client'; // present when not mustChangePassword
};

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    token: string | null;
}
