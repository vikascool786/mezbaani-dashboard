export type ApiClientConfig = {
  getToken?: () => string | null;
  onUnauthorized?: () => void;
};

export function createApiClient(config?: ApiClientConfig) {
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const token = config?.getToken?.();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

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
