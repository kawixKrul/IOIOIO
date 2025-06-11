import { mockApplications, mockTopics } from "./mock_data";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Update your makeRequest function (likely in api/requests.ts)
export async function makeRequest(
  url: string,
  method: string,
  data?: any,
  headers?: Record<string, string>
) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // This is crucial for cookies
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

/**
 * API Client for Student endpoints
 */
export const studentApi = {
  // Get available thesis topics
  getTopics: () => mockTopics,

  // Apply for a thesis topic
  applyForTopic: (topicId: number, description: string) =>
    makeRequest("/student/apply", "POST", { topicId, description }),

  // TODO: Backend endpoint for this should be implemented
  // For now we'll use simulated data in the UI component
  getApplications: () => mockApplications
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
