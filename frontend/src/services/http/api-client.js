import { authRequestInterceptor, authResponseInterceptor } from './auth.interceptor.js';
import { retryInterceptor } from './retry.interceptor.js';
import { errorInterceptor } from './error.interceptor.js';
import { uploadWithProgress } from './upload.interceptor.js';

const BASE_URL = '/api/v1';

/**
 * Enterprise API Client.
 * Centralized HTTP layer with interceptor pipeline.
 * Business services never call `fetch()` directly.
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    /** @type {Map<string, AbortController>} Active request controllers for cancellation */
    this.controllers = new Map();
  }

  /**
   * Core request method.
   * @param {string} path
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async request(path, options = {}, attempt = 0) {
    const url = `${this.baseUrl}${path}`;

    // Create AbortController for cancellation support
    const requestId = options.requestId || `${options.method || 'GET'}:${path}`;
    const controller = new AbortController();

    // Cancel any previous request with the same ID
    if (this.controllers.has(requestId)) {
      this.controllers.get(requestId).abort();
    }
    this.controllers.set(requestId, controller);

    // Build fetch options
    let fetchOptions = {
      method: options.method || 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    // Request Interceptor Pipeline
    fetchOptions = authRequestInterceptor(fetchOptions);

    try {
      let response = await fetch(url, fetchOptions);

      // Response Interceptor Pipeline
      response = await authResponseInterceptor(response, () => this.request(path, options, attempt));
      response = await retryInterceptor(response, (a) => this.request(path, options, a), attempt);
      response = errorInterceptor(response);

      // Cleanup controller
      this.controllers.delete(requestId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorBody };
      }

      // Handle 204 No Content
      if (response.status === 204) return null;

      return response.json();
    } catch (error) {
      this.controllers.delete(requestId);

      if (error.name === 'AbortError') {
        console.warn(`[API] Request cancelled: ${requestId}`);
        return null;
      }

      throw error;
    }
  }

  // ─── Convenience Methods ──────────────────────────────────

  get(path, options) {
    return this.request(path, { ...options, method: 'GET' });
  }

  post(path, body, options) {
    return this.request(path, { ...options, method: 'POST', body });
  }

  put(path, body, options) {
    return this.request(path, { ...options, method: 'PUT', body });
  }

  patch(path, body, options) {
    return this.request(path, { ...options, method: 'PATCH', body });
  }

  delete(path, options) {
    return this.request(path, { ...options, method: 'DELETE' });
  }

  /**
   * Upload with progress tracking.
   */
  upload(path, formData, onProgress) {
    return uploadWithProgress(`${this.baseUrl}${path}`, formData, onProgress);
  }

  /**
   * Download a file.
   */
  async download(path, filename) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Cancel a specific pending request.
   */
  cancel(requestId) {
    const controller = this.controllers.get(requestId);
    if (controller) {
      controller.abort();
      this.controllers.delete(requestId);
    }
  }
}

export const api = new ApiClient(BASE_URL);
