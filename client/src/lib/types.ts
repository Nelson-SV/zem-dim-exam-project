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
  status: 'completed' | 'in-progress' | 'pending';
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
