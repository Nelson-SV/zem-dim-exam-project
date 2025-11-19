import {
    UserManagementClient,
    ProjectsClient,
    MessagesClient,
    AuthClient,
    User3DScansClient,
    Admin3DScansClient,
    type UploadThreeDScanForm,
    type AdminThreeDScanDto
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
    private _admin3DScans: Admin3DScansClient | null = null;



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

    get admin3DScans() {
        if (!this._admin3DScans) {
            this._admin3DScans = new Admin3DScansClient(this.baseUrl, this.createHttpClient());
        }
        return this._admin3DScans;
    }

    // Reset clients when authentication changes
    resetClients() {
        this._userManagement = null;
        this._projects = null;
        this._messages = null;
        this._auth = null;
        this._user3DScans = null;
        this._admin3DScans = null;
    }
    async uploadProjectImage(file: File): Promise<{ url: string; fileName?: string; contentType?: string; size?: number }> {
        const endpoint = `${this.baseUrl}/api/FileUpload/project-thumbnail`;
        const form = new FormData();
        form.append("file", file); // Key MUST be "file"

        const client = this.createHttpClient();
        const res = await client.fetch(endpoint, {
            method: "POST",
            body: form,
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload failed (${res.status}): ${text}`);
        }
        return (await res.json()) as { url: string; fileName?: string; contentType?: string; size?: number };
    }

    async upload3DScanFormData(form: UploadThreeDScanForm): Promise<AdminThreeDScanDto> {
        const fd = new FormData();
        fd.append("ProjectId", form.projectId!);
        if (form.milestoneId) fd.append("MilestoneId", form.milestoneId);
        fd.append("RoomName", form.roomName!);
        if (form.roomArea != null) fd.append("RoomArea", form.roomArea.toString());
        if (form.scannedAt) fd.append("ScannedAt", form.scannedAt.toISOString());
        if (form.notes) fd.append("Notes", form.notes);
        fd.append("File", form.file!); 

        const client = this.createHttpClient();
        const res = await client.fetch(`${url}/api/admin/3d-scans/Upload3DScan`, {
            method: "POST",
            body: fd,
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

}

// Create and export a singleton instance
export const http = new ApiClient();
