export type ApiClientConfig = {
  getToken?: () => string | null;
  onUnauthorized?: () => void;
};

export function createApiClient(config?: ApiClientConfig) {
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    const token = config?.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      config?.onUnauthorized?.();
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "API Error");
    }

    return res.json();
  };

  return { apiCall };
}

export const apiClient = createApiClient({
  getToken: () => localStorage.getItem("authToken"),
  onUnauthorized: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
});
