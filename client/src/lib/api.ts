const DEFAULT_API_BASE = 'http://localhost:50000';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE;
}

export type MeResponse = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export type TokenResponse = {
  access_token: string;
};

export type ShortenResponse = {
  short_url: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function parseMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Lỗi không xác định';
  const msg = (payload as { message?: unknown }).message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg) && msg.every((m) => typeof m === 'string')) return msg.join(', ');
  return 'Lỗi không xác định';
}

export async function apiJson<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has('Content-Type') && rest.body != null) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...rest, headers });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(parseMessage(data), res.status);
  }

  return data as T;
}

export async function shortenLink(
  body: { url: string; customAlias?: string },
  token: string | null,
): Promise<ShortenResponse> {
  return apiJson<ShortenResponse>('/shorten', {
    method: 'POST',
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

export async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  return apiJson<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(email: string, password: string): Promise<TokenResponse> {
  return apiJson<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function meRequest(token: string): Promise<MeResponse> {
  return apiJson<MeResponse>('/auth/me', { method: 'GET', token });
}
