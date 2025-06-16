export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'supervisor' | 'student' | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  role: 'STUDENT' | 'SUPERVISOR';
  expertiseField?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: 'admin' | 'supervisor' | 'student';
  isActive: boolean;
  createdAt?: string;
}