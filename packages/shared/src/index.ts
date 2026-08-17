export type UserRole = 'user' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: UserRole;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
