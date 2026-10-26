const SERVER_API_URL = (process.env.API_URL ?? 'http://localhost:3002').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = (
      payload as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null
    )?.error;

    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Bir hata oluştu.',
      error?.fields,
    );
  }

  return payload as T;
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SERVER_API_URL}/api${path}`, {
    ...init,
    cache: 'no-store',
  });
  return parseResponse<T>(response);
}

export async function clientApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
  });
  return parseResponse<T>(response);
}
