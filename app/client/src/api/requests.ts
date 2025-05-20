export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function makeRequest(url: string, method: HttpMethod, body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }    // No need for urlPrefix as we'll use relative URLs and rely on the proxy configuration
    const urlPrefix = "http://localhost:8080";
    const response = await fetch(urlPrefix+url, options);

    if (response.ok) {
      // For 204 No Content, response.json() will throw an error.
      if (response.status === 204) {
        return null;
      }
      // For login, the backend sends plain text on success, let's handle that.
      // For other successful requests, it might be JSON or text.
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return response.text(); // Or handle as plain text if appropriate
    } else {
      const errorText = await response.text();
      // Throw an error object so TanStack Query can catch it
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Operation error:", error);
    // Re-throw the error so TanStack Query can handle it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during the request.");
  }
}

/**
 * API Client for Student endpoints
 */
export const studentApi = {
  // Get available thesis topics
  getTopics: () => makeRequest("/student/topics", "GET"),

  // Apply for a thesis topic
  applyForTopic: (topicId: number, description: string) => 
    makeRequest("/student/apply", "POST", { topicId, description }),

  // TODO: Backend endpoint for this should be implemented
  // For now we'll use simulated data in the UI component
  getApplications: () => {
    console.warn('Backend endpoint /student/applications does not exist yet, using mock data');
    return Promise.resolve([
      {
        id: 1,
        topicId: 1,
        topicTitle: "Artificial Intelligence in Healthcare",
        description: "I'm interested in exploring AI applications in healthcare.",
        status: 0, // pending
        promoterName: "John",
        promoterSurname: "Doe"
      },
      {
        id: 2,
        topicId: 2,
        topicTitle: "Blockchain Technology Applications",
        description: "I want to research blockchain applications in finance.",
        status: 1, // accepted
        promoterName: "Jane",
        promoterSurname: "Smith"
      }
    ]);
  }
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
