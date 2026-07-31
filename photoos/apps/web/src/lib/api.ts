const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('photoos_access_token') ||
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('photoos_access_token='))
          ?.split('=')[1]
      : undefined;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('photoos_access_token');
      document.cookie =
        'photoos_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    throw new Error('Sessão expirada. Redirecionando para login...');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Erro na requisição: ${response.statusText}`,
    );
  }

  // If status is 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
