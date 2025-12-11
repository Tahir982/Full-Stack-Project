export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  code: string; // e.g., CS-101
  title: string;
  description: string;
  credits: number;
  department: string;
  instructor: string;
  schedule: string; // e.g., "Mon/Wed 10:00 AM"
  capacity: number;
  enrolledCount: number;
  isActive: boolean; // For soft delete
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  status: string;
  createdBy: string;
  organizer: string;
  imageUrl: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}