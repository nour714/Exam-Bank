/**
 * Modal Component.
 * Programmatic API for rendering modals.
 */
export function showModal({ title, content, footer, onClose }) {
  const container = document.getElementById('modal-container');
  if (!container) return null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.zIndex = 'var(--z-modal)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.animation = 'fadeIn var(--transition-fast)';

  const modal = document.createElement('div');
  modal.className = 'modal-content card';
  modal.style.width = '100%';
  modal.style.maxWidth = '500px';
  modal.style.margin = 'var(--space-4)';
  modal.style.animation = 'scaleIn var(--transition-fast)';

  // Header
  const header = document.createElement('div');
  header.className = 'card-header flex items-center justify-between';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  header.appendChild(h3);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.fontSize = 'var(--text-xl)';
  closeBtn.style.color = 'var(--text-muted)';
  closeBtn.onclick = close;
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'card-body';
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }
  modal.appendChild(body);

  // Footer
  if (footer) {
    const footerEl = document.createElement('div');
    footerEl.className = 'card-footer flex justify-end gap-2';
    if (typeof footer === 'string') {
      footerEl.innerHTML = footer;
    } else {
      footerEl.appendChild(footer);
    }
    modal.appendChild(footerEl);
  }

  overlay.appendChild(modal);
  container.appendChild(overlay);

  // Focus trap
  modal.tabIndex = -1;
  modal.focus();

  function close() {
    overlay.style.animation = 'fadeOut var(--transition-fast)';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 150);
  }

  // Close on Escape
  const keyHandler = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', keyHandler);
  
  // Cleanup listener
  const origClose = close;
  close = () => {
    document.removeEventListener('keydown', keyHandler);
    origClose();
  };

  return { close };
}
