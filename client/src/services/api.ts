import {
    AuthClient,
    MessagesClient,
    ProjectsClient,
    type FileResponse,
} from '../generated-client';

const API_URL = 'http://localhost:5001';

export const authClient = new AuthClient(API_URL);
export const messagesClient = new MessagesClient(API_URL);
export const projectsClient = new ProjectsClient(API_URL);

// Допоміжне: розпарсити FileResponse у JSON
async function readJson<T>(fr: FileResponse): Promise<T> {
    const txt = await fr.data.text();
    return JSON.parse(txt) as T;
}

/** Типи, які ми очікуємо від API (звузив до головного) */
export type User = {
    id: string;
    email: string;
    role: 'Admin' | 'Client';
    jwt: string;
};

export type Project = {
    id: string;
    title: string;
    status?: string;
    progressPercentage?: number;
    clientId: string;
    clientName: string;
};

export type Message = {
    id: string;
    projectId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
};



export async function getUserProjects(userId: string): Promise<Project[]> {
    const fr = await projectsClient.getUserProjects(userId);
    return readJson<Project[]>(fr);
}

export async function getProject(projectId: string): Promise<Project> {
    const fr = await projectsClient.getProject(projectId);
    return readJson<Project>(fr);
}

export async function getProjectMessages(projectId: string): Promise<Message[]> {
    const fr = await messagesClient.getProjectMessages(projectId);
    return readJson<Message[]>(fr);
}
