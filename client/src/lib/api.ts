import {
    UserManagementClient,
    ProjectsClient,
    MessagesClient,
    AuthClient,
    User3DScansClient
} from '../generated-client';

// const httpSchema= import.meta.env.VITE_API_HTTP_SCHEMA;
// const domain=import.meta.env.VITE_API_BASE_URL;

const url = 'http://localhost:5001';
export class ApiClient {
    private baseUrl: string;

    // Individual client instances
    private _userManagement: UserManagementClient | null = null;
    private _projects: ProjectsClient | null = null;
    private _messages: MessagesClient | null = null;
    private _auth: AuthClient | null = null;
    private _user3DScans: User3DScansClient | null = null;



    constructor() {
        this.baseUrl = url;
    }

    private createHttpClient() {
        return {
            fetch: (url: RequestInfo, init?: RequestInit) => {
                const u = typeof url === 'string' ? url : url.toString();

                // If the call is for reset-password, prefer the temp token
                const temp = localStorage.getItem('temp_auth_jwt');
                const auth = localStorage.getItem('auth_jwt');

                const isResetPassword = u.toLowerCase().includes('/api/auth/resetpassword');
                const jwt = (isResetPassword && temp) ? temp : auth;

                if (jwt && u.startsWith(this.baseUrl)) {
                    return fetch(u, {
                        ...init,
                        headers: {
                            ...init?.headers,
                            'Authorization': `Bearer ${jwt}`,
                        },
                    });
                }
                return fetch(u, init);
            },
        };
    }

    // Lazy-loaded client getters

    get userManagement() {
        if (!this._userManagement) {
            this._userManagement = new UserManagementClient(this.baseUrl, this.createHttpClient());
        }
        return this._userManagement;
    }

    get projects() {
        if (!this._projects) {
            this._projects = new ProjectsClient(this.baseUrl, this.createHttpClient());
        }
        return this._projects;
    }

    get messages() {
        if (!this._messages) {
            this._messages = new MessagesClient(this.baseUrl, this.createHttpClient());
        }
        return this._messages;
    }

    get auth() {
        if (!this._auth) {
            this._auth = new AuthClient(this.baseUrl, this.createHttpClient());
        }
        return this._auth;
    }

    get user3DScans() {
        if (!this._user3DScans) {
            this._user3DScans = new User3DScansClient(this.baseUrl, this.createHttpClient());
        }
        return this._user3DScans;
    }

    // Reset clients when authentication changes
    resetClients() {
        this._userManagement = null;
        this._projects = null;
        this._messages = null;
        this._auth = null;
        this._user3DScans = null;
    }
}

// Create and export a singleton instance
export const http = new ApiClient();