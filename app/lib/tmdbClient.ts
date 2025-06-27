import { axiosInstance } from "./axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function tmdbGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const { data } = await axiosInstance.get<T>(path, { params });
  return data;
}
