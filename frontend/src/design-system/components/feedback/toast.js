import { eventBus } from '../../../core/event-bus.js';

/**
 * Toast Component.
 * Listens to 'toast:show' events.
 */
export function initToastSystem() {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Add styles dynamically or assume they are in components.css
  container.style.position = 'fixed';
  container.style.bottom = 'var(--space-6)';
  container.style.right = 'var(--space-6)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = 'var(--space-2)';
  container.style.zIndex = 'var(--z-toast)';

  eventBus.on('toast:show', ({ type = 'info', title, message, duration = 5000 }) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Inline styles for simplicity, but ideally in components.css
    toast.style.minWidth = '300px';
    toast.style.backgroundColor = 'var(--surface-card)';
    toast.style.border = '1px solid var(--border-color)';
    if (type === 'error') toast.style.borderLeft = '4px solid var(--color-danger-500)';
    if (type === 'success') toast.style.borderLeft = '4px solid var(--color-success-500)';
    
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.padding = 'var(--space-4)';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.animation = 'fadeInRight var(--transition-base) forwards';

    const titleEl = document.createElement('h4');
    titleEl.textContent = title;
    titleEl.style.marginBottom = 'var(--space-1)';
    toast.appendChild(titleEl);

    const msgEl = document.createElement('p');
    msgEl.textContent = message;
    msgEl.style.fontSize = 'var(--text-sm)';
    msgEl.style.color = 'var(--text-secondary)';
    toast.appendChild(msgEl);

    container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.style.animation = 'fadeOutRight var(--transition-base) forwards';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  });
}
