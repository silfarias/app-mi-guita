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
  options: { defaultError: string; notFoundError?: string; allowEmpty?: boolean }
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
    // Si allowEmpty es true y el status es 404, retornar respuesta vacía en lugar de error
    if (response.status === 404) {
      if (options.allowEmpty) {
        // Retornar estructura vacía para SearchResponse
        return { data: [], metadata: { count: 0, pageSize: 10, pageNumber: 1, totalPages: 0 } } as T;
      }
      if (options.notFoundError) throw new Error(options.notFoundError);
    }
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

export async function fetchAuthPatch<T, B = unknown>(
  token: string,
  path: string,
  body: B,
  options: { defaultError: string }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    method: "PATCH",
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

export async function fetchAuthDelete<T>(
  token: string,
  path: string,
  options: { defaultError: string }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error(UNAUTHORIZED_MESSAGE);
    let message = options.defaultError;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        message = data?.errorDetails?.message ?? message;
      } else {
        const text = await response.text();
        message = text || message;
      }
    } catch {
      message = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(message);
  }

  // Manejar respuesta de texto plano (string) o JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    const text = await response.text();
    return text as T;
  }
}