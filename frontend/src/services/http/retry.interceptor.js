/**
 * Retry Interceptor.
 * Automatically retries failed requests with exponential backoff.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 500;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * @param {Response} response
 * @param {Function} retryFn - callback to retry the original request
 * @param {number} attempt - current attempt number
 */
export async function retryInterceptor(response, retryFn, attempt = 0) {
  if (!RETRYABLE_STATUSES.has(response.status)) return response;
  if (attempt >= MAX_RETRIES) return response;

  const delay = RETRY_DELAY * Math.pow(2, attempt);
  await new Promise(resolve => setTimeout(resolve, delay));

  return retryFn(attempt + 1);
}
