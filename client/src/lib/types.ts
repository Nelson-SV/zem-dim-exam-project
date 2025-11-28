export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'client';
}

export interface Client extends User {
  role: 'client';
  projectCount: number;
  registeredDate: string;
}

export interface ProjectStage {
  id: string;
  name: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress';
}

export interface Project {
  id: string;
  name: string;
  address: string;
  clientId: string;
  clientName: string;
  progress: number;
  currentStage: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  area: number;
  image: string;
  stages: ProjectStage[];
}

export interface Photo {
  id: string;
  url: string;
  projectId: string;
  stageId: string;
  stageName: string;
  uploadDate: string;
  description?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'client';
  text: string;
  timestamp: string;
  attachments?: string[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: 'company' | 'client';
  url: string;
}

export interface Activity {
  id: string;
  type: 'update' | 'upload' | 'message' | 'stage';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
export interface ProjectDto {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  status: string;
  startDate: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  totalArea?: number;
  budget?: number;
  progressPercentage: number;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectParticipantsDto {
  projectId: string;
  clientId: string;
  adminId: string;
}
