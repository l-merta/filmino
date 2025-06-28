import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const { data } = await apiClient.get<T>(path, { params });
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const { data } = await apiClient.post<T>(path, body);
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPut<T>(path: string, body?: any): Promise<T> {
  const { data } = await apiClient.put<T>(path, body);
  return data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await apiClient.delete<T>(path);
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function tmdbGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const { data } = await apiClient.get<T>("/tmdb", { 
    params: { 
      path, 
      ...params 
    } 
  });
  return data;
}
