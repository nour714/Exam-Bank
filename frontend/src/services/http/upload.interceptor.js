/**
 * Upload Interceptor.
 * Provides progress tracking for file uploads using XMLHttpRequest.
 */

/**
 * Upload a file with progress tracking.
 * @param {string} url
 * @param {FormData} formData
 * @param {Function} onProgress - (percent) => void
 * @returns {Promise<Object>}
 */
export function uploadWithProgress(url, formData, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(data);
        }
      } catch {
        reject(new Error('Invalid response'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', url);

    // Attach auth token
    const token = localStorage.getItem('access_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}
