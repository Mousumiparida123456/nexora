const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : "http://localhost:3000";

export const API_URL = import.meta.env.VITE_API_URL || `${apiBaseUrl}/api/v1`;

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl?: string | null;
}

export type ApiHealth = {
  status: string;
};

class ApiClient {
  private getHeaders(options: RequestInit = {}): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...this.getHeaders(options),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  startLogin(returnTo = "/dashboard"): void {
    const loginUrl = new URL("/api/v1/login", apiBaseUrl);
    loginUrl.searchParams.set("returnTo", returnTo);
    window.location.assign(loginUrl.toString());
  }

  logout(): void {
    const logoutUrl = new URL("/api/v1/logout", apiBaseUrl);
    window.location.assign(logoutUrl.toString());
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const response = await this.request<{ user: AuthUser | null }>("/auth/user", {
      method: "GET",
    });
    return response.user ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return Boolean(user);
    } catch {
      return false;
    }
  }

  // Generic requests
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${apiBaseUrl}/api/healthz`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }

  return response.json() as Promise<ApiHealth>;
}
