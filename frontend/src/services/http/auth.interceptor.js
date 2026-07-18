/**
 * Auth Interceptor.
 * Injects the JWT access token into outgoing requests.
 * Handles 401 responses by silently refreshing the token and retrying.
 */
import { TokenManager } from './token-manager.js';
import { eventBus } from '../../core/event-bus.js';

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
  const token = TokenManager.getToken();
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
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // refreshToken is sent via cookie
    });

    if (!refreshResponse.ok) {
      throw new Error('Refresh failed');
    }

    const data = await refreshResponse.json();
    TokenManager.setToken(data.data.accessToken);
    eventBus.emit('auth.token.refreshed');

    processQueue(null, data.data.accessToken);
    return retryFn();
  } catch (error) {
    processQueue(error, null);
    TokenManager.clearToken();
    eventBus.emit('auth:expired');
    return response;
  } finally {
    isRefreshing = false;
  }
}


