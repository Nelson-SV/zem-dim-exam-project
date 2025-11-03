import type { ProjectDto, ProjectParticipantsDto } from './types';

import {
    AuthClient,
    UserManagementClient,
    MessagesClient,
    ProjectsClient,
    type FileResponse,
} from '../generated-client.ts';

const API_URL = 'http://localhost:5001';

export const authClient = new AuthClient(API_URL);
export const messagesClient = new MessagesClient(API_URL);
export const projectsClient = new ProjectsClient(API_URL);
export const userManagementClient = new UserManagementClient(API_URL);


async function readJson<T>(fr: FileResponse): Promise<T> {
    const txt = await fr.data.text();
    return JSON.parse(txt) as T;
}


export type User = {
    id: string;
    email: string;
    role: 'Admin' | 'Client';
    jwt: string;
};


export type Project = ProjectDto;

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

export function setupAuthHeader(token: string) {
    const authHttp = {
        fetch: (url: RequestInfo, init?: RequestInit) => {
            const headers = new Headers(init?.headers ?? {});
            headers.set('Authorization', `Bearer ${token}`);
            return window.fetch(url, { ...init, headers });
        },
    };

    // Set for all clients
    (authClient as any)['http'] = authHttp;
    (messagesClient as any)['http'] = authHttp;
    (projectsClient as any)['http'] = authHttp;
}

export async function getUserProjects(userId: string): Promise<ProjectDto[]> {
    const fr = await projectsClient.getUserProjects(userId);
    return readJson<ProjectDto[]>(fr);
}

export async function getProject(projectId: string): Promise<ProjectDto> {
    const fr = await projectsClient.getProject(projectId);
    return readJson<ProjectDto>(fr);
}

export async function getProjectMessages(projectId: string): Promise<Message[]> {
    const fr = await messagesClient.getProjectMessages(projectId);
    return readJson<Message[]>(fr);
}

export async function getProjectById(projectId: string): Promise<ProjectDto> {
    const fr = await projectsClient.getProject(projectId);
    return readJson<ProjectDto>(fr);
}

export async function getProjectParticipants(projectId: string): Promise<ProjectParticipantsDto> {
    const fr = await projectsClient.getProjectParticipants(projectId);
    return readJson<ProjectParticipantsDto>(fr);
}
export async function getTotalUnreadCount(): Promise<number> {
    const fr = await messagesClient.getTotalUnreadCount();
    const data = await readJson<{ count: number }>(fr);
    return data.count;
}

export async function getProjectUnreadCount(projectId: string): Promise<number> {
    const fr = await messagesClient.getProjectUnreadCount(projectId);
    const data = await readJson<{ count: number }>(fr);
    return data.count;
}

export async function markMessageAsRead(messageId: string): Promise<void> {
    await messagesClient.markAsRead(messageId);
}