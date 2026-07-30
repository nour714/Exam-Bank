import { BaseComponent } from '../../../core/component.js';
import { store } from '../../../core/state-store.js';
import { authService } from '../../../services/auth.service.js';
import { router } from '../../../core/router.js';
import { eventBus } from '../../../core/event-bus.js';

export class Sidebar extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';
    this.element.id = 'main-sidebar';
    
    this.element.classList.add('hidden');
    document.body.classList.add('sidebar-hidden');

    this.onCleanup(store.subscribe('user', (user) => {
      if (!user) {
        this.element.classList.add('hidden');
        document.body.classList.add('sidebar-hidden');
        return;
      }
      this.element.classList.remove('hidden');
      document.body.classList.remove('sidebar-hidden');
      
      this.element.innerHTML = `
        <div class="sidebar-brand">
            <span class="brand-logo"><i data-lucide="graduation-cap"></i></span>
            <span class="brand-name">Exam Bank</span>
        </div>
        
        <div class="user-profile-widget">
            <div class="avatar-container">
                <img src="${user.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22><circle cx=%2212%22 cy=%228%22 r=%225%22/><path d=%22M3 21v-2a7 7 0 0114 0v2%22/></svg>'}" alt="صورة المستخدم" class="user-avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22><circle cx=%2212%22 cy=%228%22 r=%225%22/><path d=%22M3 21v-2a7 7 0 0114 0v2%22/></svg>'">
                <span class="status-indicator online"></span>
            </div>
            <h3 class="username">${user.name || user.firstName || 'طالب'}</h3>
            <span class="user-badge">${user.role === 'ADMIN' ? 'مدير النظام' : 'طالب ثانوي'}</span>
        </div>

        <nav class="sidebar-menu">
            <ul>
                <li class="menu-item" data-route="/dashboard">
                    <i data-lucide="home"></i>
                    <span>الرئيسية</span>
                </li>
                <li class="menu-item" data-route="/question-bank">
                    <i data-lucide="book-open"></i>
                    <span>بنك الأسئلة</span>
                </li>
                <li class="menu-item" data-route="/exams">
                    <i data-lucide="file-text"></i>
                    <span>الامتحانات</span>
                </li>
                <li class="menu-item" data-route="/study-groups">
                    <i data-lucide="users"></i>
                    <span>مجموعات الدراسة</span>
                </li>
                <li class="menu-item" data-route="/settings">
                    <i data-lucide="settings"></i>
                    <span>الإعدادات</span>
                </li>
                ${authService.hasRole('ADMIN') ? `
                <li class="menu-item" data-external-href="/admin.html">
                    <i data-lucide="shield"></i>
                    <span>لوحة المطور</span>
                </li>
                ` : ''}
            </ul>
        </nav>

        <div class="sidebar-footer">
            <button class="btn btn-outline btn-logout" id="btn-logout">
                <i data-lucide="log-out"></i>
                <span>تسجيل الخروج</span>
            </button>
        </div>
      `;
      
      if (window.lucide) {
        window.lucide.createIcons({ root: this.element });
      }
      
      const logoutBtn = this.element.querySelector('#btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => authService.logout());
      }

      this._updateActiveState(window.location.pathname);

      const menuItems = this.element.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const externalHref = item.getAttribute('data-external-href');
          if (externalHref) {
            window.location.href = externalHref;
            return;
          }
          const route = item.getAttribute('data-route');
          if (route) {
             router.navigate(route);
          }
        });
      });
    }));

    // Keep the active nav item in sync with the current route, regardless of
    // whether navigation happened via a sidebar click, a link elsewhere in the
    // app, or the browser back/forward buttons.
    this.onCleanup(eventBus.on('router.navigated', ({ path }) => this._updateActiveState(path)));

    return this.element;
  }

  _updateActiveState(path) {
    if (!this.element) return;
    const menuItems = this.element.querySelectorAll('.menu-item[data-route]');
    let bestMatch = null;
    menuItems.forEach(item => {
      const route = item.getAttribute('data-route');
      if (path === route || path.startsWith(route + '/')) {
        if (!bestMatch || route.length > bestMatch.getAttribute('data-route').length) {
          bestMatch = item;
        }
      }
    });
    menuItems.forEach(item => item.classList.toggle('active', item === bestMatch));
  }
}
