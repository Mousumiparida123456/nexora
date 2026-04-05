const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : "";

export type ApiHealth = {
  status: string;
};

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${apiBaseUrl}/api/healthz`, { signal });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }

  return response.json() as Promise<ApiHealth>;
}
