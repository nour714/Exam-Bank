import { store } from '../../../core/state-store.js';
import { authService } from '../../../services/auth.service.js';
import { router } from '../../../core/router.js';

/**
 * App Layout Component.
 * Binds to the DOM shell defined in index.html.
 * Handles the sidebar, header, and user dropdown.
 */
export function initAppLayout() {
  const sidebar = document.getElementById('app-sidebar');
  const header = document.getElementById('app-header');
  
  if (!sidebar || !header) return;

  // Render Header
  header.style.height = 'var(--header-height)';
  header.style.borderBottom = '1px solid var(--border-color)';
  header.style.backgroundColor = 'var(--bg-primary)';
  header.className = 'flex items-center justify-between px-4';

  const title = document.createElement('h2');
  title.textContent = 'Exam Bank';
  header.appendChild(title);

  const userAction = document.createElement('div');
  userAction.className = 'flex items-center gap-4';

  // React to User State
  const renderUser = () => {
    userAction.innerHTML = '';
    const user = store.get('user');
    if (user) {
      const span = document.createElement('span');
      span.className = 'font-medium';
      span.textContent = `${user.firstName} ${user.lastName}`;
      userAction.appendChild(span);

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'text-sm text-secondary';
      logoutBtn.textContent = 'Logout';
      logoutBtn.onclick = () => authService.logout();
      userAction.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement('button');
      loginBtn.className = 'text-sm text-link';
      loginBtn.textContent = 'Log In';
      loginBtn.onclick = () => router.navigate('/login');
      userAction.appendChild(loginBtn);
    }
  };

  store.subscribe('user', renderUser);
  renderUser();
  header.appendChild(userAction);

  // Render Sidebar
  sidebar.style.width = 'var(--sidebar-width)';
  sidebar.style.backgroundColor = 'var(--bg-sidebar)';
  sidebar.style.borderRight = '1px solid var(--border-color)';
  sidebar.style.transition = 'width var(--transition-base)';
  sidebar.style.color = '#fff'; // Assuming dark sidebar from design tokens
  
  // React to User State for Sidebar visibility
  const renderSidebar = () => {
    const user = store.get('user');
    if (!user) {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'block';
      sidebar.innerHTML = `
        <div style="padding: var(--space-4)">
          <ul class="flex-col gap-2">
            <li><a href="/dashboard" class="sidebar-link block py-2 px-4 rounded text-white opacity-80 hover:opacity-100">Dashboard</a></li>
            <li><a href="/exams" class="sidebar-link block py-2 px-4 rounded text-white opacity-80 hover:opacity-100">Exams</a></li>
            ${authService.hasRole('ADMIN') || authService.hasRole('TEACHER') ? `
              <li><a href="/curriculum" class="sidebar-link block py-2 px-4 rounded text-white opacity-80 hover:opacity-100">Curriculum</a></li>
              <li><a href="/analytics" class="sidebar-link block py-2 px-4 rounded text-white opacity-80 hover:opacity-100">Analytics</a></li>
            ` : ''}
          </ul>
        </div>
      `;
    }
  };

  store.subscribe('user', renderSidebar);
  renderSidebar();
}
