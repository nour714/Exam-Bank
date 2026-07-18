/**
 * Error Interceptor.
 * Maps HTTP errors to user-friendly error objects and dispatches UI events.
 */

import { eventBus } from '../../core/event-bus.js';

const ERROR_MAP = {
  400: { title: 'Bad Request', message: 'The request was invalid.' },
  403: { title: 'Forbidden', message: 'You do not have permission to perform this action.' },
  404: { title: 'Not Found', message: 'The requested resource was not found.' },
  409: { title: 'Conflict', message: 'This action conflicts with existing data.' },
  422: { title: 'Validation Error', message: 'Please check your input and try again.' },
  429: { title: 'Too Many Requests', message: 'Please slow down and try again later.' },
  500: { title: 'Server Error', message: 'An unexpected error occurred. Please try again.' },
};

/**
 * @param {Response} response
 * @returns {Response} The same response (for chaining)
 */
export function errorInterceptor(response) {
  if (response.ok) return response;

  const mapped = ERROR_MAP[response.status] || {
    title: 'Error',
    message: `Request failed with status ${response.status}`,
  };

  // Dispatch a toast notification for non-401 errors (401 is handled by auth interceptor)
  if (response.status !== 401) {
    eventBus.emit('toast.show', {
      type: 'error',
      title: mapped.title,
      message: mapped.message,
    });
  }

  return response;
}
