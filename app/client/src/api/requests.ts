import { mockApplications } from "./mock_data";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function makeRequest(
  endpoint: string,
  method: string,
  data?: unknown,
  headers?: Record<string, string>
) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // This is crucial for session cookies
    body: data ? JSON.stringify(data) : undefined,
  });

  if (response.status === 401) {
    window.location.href = '/'; 
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  // Handle responses that might not have JSON content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

/**
 * API Client for Student endpoints
 */
export const studentApi = {
  // Get student profile
  getProfile: (): Promise<string> => makeRequest("/profile", "GET"),

  // Get available thesis topics
  getTopics: (): Promise<ThesisTopicResponse[]> => makeRequest("/student/topics", "GET"),
  // Search thesis topics with optional filters
  searchTopics: (query: string, degree?: 'bsc' | 'msc'): Promise<ThesisTopicResponse[]> => {
    const params = new URLSearchParams({ q: query });
    if (degree) {
      params.append('degree', degree);
    }
    return makeRequest(`/student/topics/search?${params.toString()}`, "GET");
  },

  // TODO: Implement getApplications endpoint on backend
  getApplications: () => mockApplications,

  // Apply for a thesis topic
  applyForTopic: (topicId: number, description: string): Promise<string> =>
    makeRequest("/student/apply", "POST", { topicId, description }),
}

/**
 * API Client for Supervisor endpoints
 */
export const supervisorApi = {
  // Get supervisor profile
  getProfile: () => makeRequest("/supervisor/profile", "GET"),

  // Add a new thesis topic
  addTopic: (topicData: {
    title: string;
    description: string;
    degreeLevel: string;
    availableSlots: number;
    tags: string[];
  }) => makeRequest("/supervisor/topics", "POST", topicData)
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'SUPERVISOR';
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'supervisor' | 'student' | string;
}

// Student-related types
export interface PromoterInfo {
  id: number;
  name: string;
  surname: string;
  expertiseField: string;
}

export interface ThesisTopicResponse {
  id: number;
  title: string;
  description: string;
  degreeLevel: string;
  availableSlots: number;
  tags: string[];
  promoter: PromoterInfo;
}

export interface ApplyTopicRequest {
  topicId: number;
  description: string;
}

/**
 * Authentication API Client
 */
export const authApi = {
  // Login user
  login: (credentials: LoginCredentials) =>
    makeRequest("/login", "POST", credentials),

  // Register new user
  register: (userData: RegisterData) =>
    makeRequest("/register", "POST", userData),

  // Logout user (clear session)
  logout: () =>
    makeRequest("/logout", "POST"),

  // Check if user is authenticated and get user info - endpoint might not exist yet
  getProfile: (): Promise<User> =>
    makeRequest("/auth/profile", "GET").catch(() => {
      throw new Error("Profile endpoint not implemented");
    }),

  // Verify session is still valid
  verifySession: () =>
    makeRequest("/auth/verify", "GET"),
};
