import {
    UserManagementClient,
    ProjectsClient,
    MessagesClient,
    AuthClient,
    User3DScansClient,
    Admin3DScansClient,
    ClientDashboardClient,
    ClientProjectPhotosClient,
    type UploadThreeDScanForm,
    type AdminThreeDScanDto,
    AdminProjectDocumentsClient,
    AdminProjectMilestonesClient,
    AdminProjectPhotosClient,
    AdminUpdatesClient,
    DocumentsClient,
    type DocumentDto,
} from '../generated-client';

// const httpSchema= import.meta.env.VITE_API_HTTP_SCHEMA;
// const domain=import.meta.env.VITE_API_BASE_URL;

const url = 'https://server-damp-smoke-7275.fly.dev';
export class ApiClient {
    private baseUrl: string;

    // Individual client instances
    private _userManagement: UserManagementClient | null = null;
    private _projects: ProjectsClient | null = null;
    private _messages: MessagesClient | null = null;
    private _auth: AuthClient | null = null;
    private _user3DScans: User3DScansClient | null = null;
    private _admin3DScans: Admin3DScansClient | null = null;
    private _adminProjectDocuments: AdminProjectDocumentsClient | null = null;
    private _adminProjectMilestones: AdminProjectMilestonesClient | null = null;
    private _adminProjectPhotos: AdminProjectPhotosClient | null = null;
    private _adminUpdates: AdminUpdatesClient | null = null;
    private _clientDashboard: ClientDashboardClient | null = null;
    private _clientProjectPhotos: ClientProjectPhotosClient | null = null;
    private _documents: DocumentsClient | null = null;


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

    // Custom method to get projects for current user
    async getMyProjects(): Promise<never[]> {
        const client = this.createHttpClient();
        const res = await client.fetch(`${this.baseUrl}/api/Projects/api/admin/projects/GetMyProjects`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to get projects (${res.status}): ${text}`);
        }

        return await res.json();
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
    get documents() {
        if (!this._documents) {
            this._documents = new DocumentsClient(this.baseUrl, this.createHttpClient());
        }
        return this._documents;
    }

    get admin3DScans() {
        if (!this._admin3DScans) {
            this._admin3DScans = new Admin3DScansClient(this.baseUrl, this.createHttpClient());
        }
        return this._admin3DScans;
    }

    get adminDocuments() {
        if (!this._adminProjectDocuments) {
            this._adminProjectDocuments = new AdminProjectDocumentsClient(this.baseUrl, this.createHttpClient());
        }
        return this._adminProjectDocuments;
    }

    get adminStages() {
        if (!this._adminProjectMilestones) {
            this._adminProjectMilestones = new AdminProjectMilestonesClient(this.baseUrl, this.createHttpClient());
        }
        return this._adminProjectMilestones;
    }

    get adminPhotos() {
        if (!this._adminProjectPhotos) {
            this._adminProjectPhotos = new AdminProjectPhotosClient(this.baseUrl, this.createHttpClient());
        }
        return this._adminProjectPhotos;
    }

    get adminUpdates() {
        if (!this._adminUpdates) {
            this._adminUpdates = new AdminUpdatesClient(this.baseUrl, this.createHttpClient());
        }
        return this._adminUpdates;
    }

    get clientDashboard() {
        if (!this._clientDashboard) {
            this._clientDashboard = new ClientDashboardClient(this.baseUrl, this.createHttpClient());
        }
        return this._clientDashboard;
    }

    get clientProjectPhotos() {
        if (!this._clientProjectPhotos) {
            this._clientProjectPhotos = new ClientProjectPhotosClient(this.baseUrl, this.createHttpClient());
        }
        return this._clientProjectPhotos;
    }

    // Reset clients when authentication changes
    resetClients() {
        this._userManagement = null;
        this._projects = null;
        this._messages = null;
        this._auth = null;
        this._user3DScans = null;
        this._admin3DScans = null;
        this._adminProjectDocuments = null;
        this._adminProjectMilestones = null;
        this._adminProjectPhotos = null;
        this._adminUpdates = null;
        this._clientDashboard = null;
        this._clientProjectPhotos = null;
        this._documents = null;
    }
    
    async uploadProjectImage(file: File, projectId?: string): Promise<{ url: string; fileName?: string; contentType?: string; size?: number }> {
        const endpoint = `${this.baseUrl}/api/FileUpload/project-thumbnail`;
        const form = new FormData();
        form.append("file", file); // Key MUST be "file"
        if (projectId) form.append("projectId", projectId);

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

    async upload3DScanFile(form: UploadThreeDScanForm): Promise<AdminThreeDScanDto> {
        const fd = new FormData();
        fd.append("ProjectId", form.projectId!);
        if (form.milestoneId) fd.append("MilestoneId", form.milestoneId);
        fd.append("RoomName", form.roomName!);
        if (form.roomArea != null) fd.append("RoomArea", form.roomArea.toString());
        if (form.scannedAt) fd.append("ScannedAt", form.scannedAt.toISOString());
        if (form.notes) fd.append("Notes", form.notes);
        fd.append("File", form.file!); 

        const client = this.createHttpClient();
        const res = await client.fetch(`${this.baseUrl}/api/admin/3d-scans/Upload3DScan`, {
            method: "POST",
            body: fd,
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    async uploadProjectPhoto(projectId: string, file: File, caption?: string, takenAt?: string, milestoneId?: string) {
        const fd = new FormData();
        fd.append("File", file);
        if (caption) fd.append("Caption", caption);
        if (takenAt) fd.append("TakenAt", takenAt);
        if (milestoneId) fd.append("MilestoneId", milestoneId);

        const res = await this.createHttpClient().fetch(`${this.baseUrl}/api/admin/projects/${projectId}/photos`, {
            method: "POST",
            body: fd,
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    async uploadProjectDocument(
        file: File,
        projectId: string,
        title?: string,
        isVisibleToClient: boolean = false,
        requiresSignature: boolean = false
    ): Promise<DocumentDto> {
        const endpoint = `${this.baseUrl}/api/documents`;
        const form = new FormData();
        form.append('file', file);
        form.append('projectId', projectId);
        form.append('title', title ?? file.name);
        form.append('isVisibleToClient', isVisibleToClient.toString());
        form.append('requiresSignature', requiresSignature.toString());

        const client = this.createHttpClient();
        const res = await client.fetch(endpoint, {
            method: 'POST',
            body: form,
            headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Document upload failed (${res.status}): ${text}`);
        }

        return await res.json() as DocumentDto;
    }

    async uploadClientDocument(
        file: File,
        projectId: string,
        title?: string,
        requiresSignature: boolean = false
    ): Promise<DocumentDto> {
        const endpoint = `${this.baseUrl}/api/documents/client-upload`;
        const form = new FormData();
        form.append('file', file);
        form.append('projectId', projectId);
        if (title) form.append('title', title);
        form.append('requiresSignature', requiresSignature.toString());

        const client = this.createHttpClient();
        const res = await client.fetch(endpoint, {
            method: 'POST',
            body: form,
            headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Client document upload failed (${res.status}): ${text}`);
        }

        return await res.json() as DocumentDto;
    }

}

// Create and export a singleton instance
export const http = new ApiClient();
