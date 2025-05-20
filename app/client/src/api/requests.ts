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
