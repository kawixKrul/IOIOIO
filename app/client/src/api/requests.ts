import { ApplicationsResponse, ThesisTopicResponse, LoginCredentials, RegisterData, User } from './types';
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

  // getApplications: () => mockApplications,
  getApplications: (): Promise<ApplicationsResponse[]> => makeRequest("/student/applications", "GET"),

  // Apply for a thesis topic
  applyForTopic: (topicId: number, description: string): Promise<string> =>
    makeRequest("/student/apply", "POST", { topicId, description }),

  withdraw_application: async (applicationId: Number) => {
    try {
      await makeRequest(
        `/student/withdraw-application?applicationId=${applicationId}`,
        "POST"
      );
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      throw new Error("Failed to withdraw application!");
    }
  },
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
  }) => makeRequest("/supervisor/topics", "POST", topicData),

  getSupervisorTopics: async (): Promise<ThesisTopicResponse[]> => {
      //return mockTopics.filter(topic => topic.promoter.id === supervisorId);
    try {
      const response = await makeRequest(`/supervisor/topics`, "GET");
      return response as ThesisTopicResponse[];
    } catch (error) {
      console.error("Failed to fetch supervisor topics:", error);
      throw new Error("Could not load topics");
    }
  },

  confirm_application: async (applicationId: Number) => {
    try {
      await makeRequest(
        `/supervisor/confirm-application?applicationId=${applicationId}`,
        "POST"
      );
    } catch (error) {
      console.error("Failed to confirm application:", error);
      throw new Error("Failed to confirm application!");
    }
  },

    reject_application: async (applicationId: Number) => {
    try {
      await makeRequest(
        `/supervisor/reject-application?applicationId=${applicationId}`,
        "POST"
      );
    } catch (error) {
      console.error("Failed to reject application:", error);
      throw new Error("Failed to reject application!");
    }
  },


  // getApplicationsBySupervisorId: (supervisorId: number): ApplicationsResponse[] => {
  //       return mockApplications.filter(application => application.promoter.id === supervisorId);
  // }
  getSupervisorApplications: async (): Promise<ApplicationsResponse[]> => {
      //return mockTopics.filter(topic => topic.promoter.id === supervisorId);
    try {
      const response = await makeRequest(`/supervisor/applications`, "GET");
      return response as ApplicationsResponse[];
    } catch (error) {
      console.error("Failed to fetch supervisor applications:", error);
      throw new Error("Could not load applications");
    }
  },


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

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await makeRequest("/auth/profile", "GET");
    return {
      id: response.id,
      email: response.email,
      firstName: response.name, 
      lastName: response.surname, 
      role: response.role
    };
  },

  // Verify session is still valid
  verifySession: () =>
    makeRequest("/auth/verify", "GET"),
};