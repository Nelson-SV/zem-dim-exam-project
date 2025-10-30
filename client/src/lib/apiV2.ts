import {
    UserManagementClient,
    ProjectsClient,
    MessagesClient,
    AuthClient
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


constructor() {
        this.baseUrl = url ;
    }

    private createHttpClient() {
        const jwt = localStorage.getItem('auth_jwt');

        console.log("JWT on HTTP Client: " + jwt);

        return {
            fetch: (url: RequestInfo, init?: RequestInit) => {
                // Add auth headers if JWT exists and URL is to our API
                if (jwt && url.toString().startsWith(this.baseUrl)) {
                    return fetch(url, {
                        ...init,
                        headers: {
                            ...init?.headers,
                            'Authorization': `Bearer ${jwt}`
                        }
                    });
                }
                return fetch(url, init);
            }
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

    // Reset clients when authentication changes
    resetClients() {
        this._userManagement = null;
        this._projects = null;
        this._messages = null;
        this._auth = null;
    }
}

// Create and export a singleton instance
export const http = new ApiClient();