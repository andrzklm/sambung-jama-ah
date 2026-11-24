let inMemoryToken = null;

export function setAuthToken(token) {
  inMemoryToken = token;
}

export function getAuthToken() {
  return inMemoryToken;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || 'Terjadi kesalahan saat menghubungi server.',
      response.status
    );
  }

  return json.data;
}
