/**
 * Auth Interceptor.
 * Injects the JWT access token into outgoing requests.
 * Handles 401 responses by silently refreshing the token and retrying.
 */

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

/**
 * Request interceptor: attach Authorization header.
 */
export function authRequestInterceptor(options) {
  const token = localStorage.getItem('access_token');
  if (token) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  return options;
}

/**
 * Response interceptor: handle 401 and refresh silently.
 * @param {Response} response
 * @param {Function} retryFn - callback to retry the original request
 * @returns {Promise<Response>}
 */
export async function authResponseInterceptor(response, retryFn) {
  if (response.status !== 401) return response;

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    // No refresh token, force login
    window.dispatchEvent(new CustomEvent('auth:session_expired'));
    return response;
  }

  if (isRefreshing) {
    // Another request is already refreshing — queue this one
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    }).then(() => retryFn());
  }

  isRefreshing = true;

  try {
    const refreshResponse = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Refresh failed');
    }

    const data = await refreshResponse.json();
    localStorage.setItem('access_token', data.data.accessToken);
    localStorage.setItem('refresh_token', data.data.refreshToken);

    processQueue(null, data.data.accessToken);
    return retryFn();
  } catch (error) {
    processQueue(error, null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.dispatchEvent(new CustomEvent('auth:session_expired'));
    return response;
  } finally {
    isRefreshing = false;
  }
}
