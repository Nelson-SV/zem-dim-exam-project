import type { Client, Project, Photo, Message, Document, Activity } from './types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Oleksandr Kovalenko',
    email: 'o.kovalenko@email.com',
    phone: '+380 67 123 4567',
    role: 'client',
    projectCount: 1,
    registeredDate: '2024-09-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: '2',
    name: 'Maria Shevchenko',
    email: 'm.shevchenko@email.com',
    phone: '+380 50 234 5678',
    role: 'client',
    projectCount: 1,
    registeredDate: '2024-08-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
  },
  {
    id: '3',
    name: 'Ivan Petrenko',
    email: 'i.petrenko@email.com',
    phone: '+380 63 345 6789',
    role: 'client',
    projectCount: 2,
    registeredDate: '2024-07-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan'
  },
  {
    id: '4',
    name: 'Olena Melnyk',
    email: 'o.melnyk@email.com',
    phone: '+380 95 456 7890',
    role: 'client',
    projectCount: 1,
    registeredDate: '2024-10-05',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olena'
  },
  {
    id: '5',
    name: 'Andriy Bondarenko',
    email: 'a.bondarenko@email.com',
    phone: '+380 66 567 8901',
    role: 'client',
    projectCount: 1,
    registeredDate: '2024-09-25',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andriy'
  },
  {
    id: '6',
    name: 'Natalia Tkachenko',
    email: 'n.tkachenko@email.com',
    phone: '+380 73 678 9012',
    role: 'client',
    projectCount: 1,
    registeredDate: '2024-08-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Cottage in Vyshneve',
    address: '15 Sosnova St, Vyshneve',
    clientId: '1',
    clientName: 'Oleksandr Kovalenko',
    progress: 75,
    currentStage: 'Finishing Works',
    startDate: '2024-09-01',
    endDate: '2025-03-01',
    status: 'active',
    area: 180,
    image: 'https://images.unsplash.com/photo-1684691376857-5dfb87f6bc65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGNvbnN0cnVjdGlvbnxlbnwxfHx8fDE3NTk5MDAxNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stages: [
      {
        id: 's1',
        name: 'Foundation',
        description: 'Construction of the monolithic foundation',
        progress: 100,
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        status: 'completed'
      },
      {
        id: 's2',
        name: 'Walls and Slabs',
        description: 'Erection of aerated concrete walls',
        progress: 100,
        startDate: '2024-10-01',
        endDate: '2024-11-15',
        status: 'completed'
      },
      {
        id: 's3',
        name: 'Roof',
        description: 'Roof frame and covering installation',
        progress: 100,
        startDate: '2024-11-16',
        endDate: '2024-12-20',
        status: 'completed'
      },
      {
        id: 's4',
        name: 'Finishing Works',
        description: 'Interior finishes and facade',
        progress: 60,
        startDate: '2024-12-21',
        endDate: '2025-02-28',
        status: 'in-progress'
      },
      {
        id: 's5',
        name: 'Landscaping',
        description: 'Landscaping works',
        progress: 0,
        startDate: '2025-03-01',
        endDate: '2025-03-31',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '2',
    name: 'House in Bucha',
    address: '42 Polova St, Bucha',
    clientId: '2',
    clientName: 'Maria Shevchenko',
    progress: 45,
    currentStage: 'Walls and Slabs',
    startDate: '2024-10-01',
    endDate: '2025-06-01',
    status: 'active',
    area: 220,
    image: 'https://images.unsplash.com/photo-1636367393690-1f07c7413851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU5OTI5NDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stages: [
      {
        id: 's1',
        name: 'Foundation',
        description: 'Construction of the monolithic foundation',
        progress: 100,
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'completed'
      },
      {
        id: 's2',
        name: 'Walls and Slabs',
        description: 'Brick wall construction',
        progress: 45,
        startDate: '2024-11-01',
        endDate: '2025-01-15',
        status: 'in-progress'
      },
      {
        id: 's3',
        name: 'Roof',
        description: 'Roof installation',
        progress: 0,
        startDate: '2025-01-16',
        endDate: '2025-03-01',
        status: 'in-progress'
      }
    ]
  },
  {
    id: '3',
    name: 'Townhouse in Irpin',
    address: '8 Lisova St, Irpin',
    clientId: '4',
    clientName: 'Olena Melnyk',
    progress: 30,
    currentStage: 'Foundation',
    startDate: '2024-11-15',
    endDate: '2025-07-01',
    status: 'active',
    area: 150,
    image: 'https://images.unsplash.com/photo-1580063665421-4c9cbe9ec11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGNvbnN0cnVjdGlvbiUyMHByb2dyZXNzfGVufDF8fHx8MTc2MDAwNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stages: [
      {
        id: 's1',
        name: 'Foundation',
        description: 'Foundation preparation and pouring',
        progress: 30,
        startDate: '2024-11-15',
        endDate: '2024-12-15',
        status: 'in-progress'
      },
      {
        id: 's2',
        name: 'Walls',
        description: 'Wall construction',
        progress: 0,
        startDate: '2024-12-16',
        endDate: '2025-02-28',
        status: 'in-progress'
      }
    ]
  }
];

export const mockPhotos: Photo[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1570894410457-adb47d89a36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWlsZGluZyUyMGZvdW5kYXRpb24lMjB3b3JrfGVufDF8fHx8MTc2MDAwNTkxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    projectId: '1',
    stageId: 's1',
    stageName: 'Foundation',
    uploadDate: '2024-09-15',
    description: 'Foundation pouring'
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1636367393690-1f07c7413851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU5OTI5NDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    projectId: '1',
    stageId: 's2',
    stageName: 'Walls and Slabs',
    uploadDate: '2024-10-20',
    description: 'First-floor wall construction'
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1580063665421-4c9cbe9ec11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGNvbnN0cnVjdGlvbiUyMHByb2dyZXNzfGVufDF8fHx8MTc2MDAwNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    projectId: '1',
    stageId: 's3',
    stageName: 'Roof',
    uploadDate: '2024-12-05',
    description: 'Roof covering installation'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'admin',
    senderName: 'ZEM-DIM Manager',
    senderRole: 'admin',
    text: 'Good afternoon! Today we finished installing the windows. Photos have been added to the gallery.',
    timestamp: '2025-01-08T10:30:00',
  },
  {
    id: 'm2',
    senderId: '1',
    senderName: 'Oleksandr Kovalenko',
    senderRole: 'client',
    text: 'Thank you! When do you plan to start the facade work?',
    timestamp: '2025-01-08T11:15:00',
  },
  {
    id: 'm3',
    senderId: 'admin',
    senderName: 'ZEM-DIM Manager',
    senderRole: 'admin',
    text: 'We plan to start the facade work next week, weather permitting.',
    timestamp: '2025-01-08T14:20:00',
  },
  {
    id: 'm4',
    senderId: '1',
    senderName: 'Oleksandr Kovalenko',
    senderRole: 'client',
    text: 'Great, looking forward to the updates!',
    timestamp: '2025-01-09T09:00:00',
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    name: 'Construction Contract.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2024-09-01',
    uploadedBy: 'company',
    url: '#'
  },
  {
    id: 'd2',
    name: 'Project Documentation.pdf',
    type: 'PDF',
    size: '8.7 MB',
    uploadDate: '2024-09-01',
    uploadedBy: 'company',
    url: '#'
  },
  {
    id: 'd3',
    name: 'Construction Permit.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadDate: '2024-09-05',
    uploadedBy: 'client',
    url: '#'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'upload',
    title: 'New photos',
    description: 'Added 5 photos for the "Finishing Works" stage',
    timestamp: '2025-01-08T15:30:00',
    icon: 'Camera'
  },
  {
    id: 'a2',
    type: 'stage',
    title: 'Progress update',
    description: 'Stage "Finishing Works" is 60% complete',
    timestamp: '2025-01-07T10:00:00',
    icon: 'TrendingUp'
  },
  {
    id: 'a3',
    type: 'message',
    title: 'New message',
    description: 'The ZEM-DIM Manager sent a message',
    timestamp: '2025-01-08T10:30:00',
    icon: 'MessageCircle'
  }
];
