import { API_URL } from "@/constants/api";

const UNAUTHORIZED_MESSAGE = "Sesión expirada. Por favor, inicia sesión nuevamente";

type QueryValue = string | number | boolean | undefined | null;

export function buildSearchQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const str = typeof value === "string" ? value.trim() : String(value);
    if (str !== "") searchParams.set(key, str);
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchAuthGet<T>(
  token: string,
  path: string,
  options: { defaultError: string; notFoundError?: string }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error(UNAUTHORIZED_MESSAGE);
    if (response.status === 404 && options.notFoundError) throw new Error(options.notFoundError);
    let message = options.defaultError;
    try {
      const data = await response.json();
      message = data?.errorDetails?.message ?? message;
    } catch {
      message = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchAuthPost<T, B = unknown>(
  token: string,
  path: string,
  body: B,
  options: { defaultError: string }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error(UNAUTHORIZED_MESSAGE);
    let message = options.defaultError;
    try {
      const data = await response.json();
      message = data?.errorDetails?.message ?? message;
    } catch {
      message = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}
