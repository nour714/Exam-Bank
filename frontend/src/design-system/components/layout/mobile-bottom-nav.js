import { BaseComponent } from '../../../core/component.js';
import { router } from '../../../core/router.js';
import { eventBus } from '../../../core/event-bus.js';
import { authService } from '../../../services/auth.service.js';

const NAV_ITEMS = [
  { route: '/dashboard', icon: 'home', label: 'الرئيسية' },
  { route: '/question-bank', icon: 'book-open', label: 'البنك' },
  { route: '/exams', icon: 'file-text', label: 'الامتحانات' },
  { route: '/study-groups', icon: 'users', label: 'المجموعات' }
];

export class MobileBottomNav extends BaseComponent {
  render() {
    this.element = document.createElement('nav');
    this.element.className = 'mobile-bottom-nav';
    this.element.id = 'mobile-bottom-nav';

    this.element.innerHTML = `
      ${NAV_ITEMS.map(item => `
        <div class="mobile-nav-item" data-route="${item.route}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </div>
      `).join('')}
      <div class="mobile-nav-item" id="mobile-nav-more">
        <i data-lucide="more-vertical"></i>
        <span>المزيد</span>
      </div>
    `;

    return this.element;
  }

  mount() {
    super.mount();

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    this.element.querySelectorAll('[data-route]').forEach(item => {
      this.addEventListener(item, 'click', () => router.navigate(item.dataset.route));
    });

    this.addEventListener(this.element.querySelector('#mobile-nav-more'), 'click', () => this._toggleMoreMenu());

    this._updateActiveState(window.location.pathname);
    this.onCleanup(eventBus.on('router.navigated', ({ path }) => this._updateActiveState(path)));
  }

  _updateActiveState(path) {
    const items = this.element.querySelectorAll('.mobile-nav-item[data-route]');
    let bestMatch = null;
    items.forEach(item => {
      const route = item.getAttribute('data-route');
      if (path === route || path.startsWith(route + '/')) {
        if (!bestMatch || route.length > bestMatch.getAttribute('data-route').length) {
          bestMatch = item;
        }
      }
    });
    items.forEach(item => item.classList.toggle('active', item === bestMatch));
  }

  _toggleMoreMenu() {
    let menu = document.getElementById('mobile-more-menu');
    if (menu) {
      menu.remove();
      return;
    }

    menu = document.createElement('div');
    menu.className = 'mobile-more-menu';
    menu.id = 'mobile-more-menu';
    menu.innerHTML = `
      <div class="more-menu-item" data-route="/settings">
        <i data-lucide="settings"></i><span>الإعدادات</span>
      </div>
      ${authService.hasRole('ADMIN') ? `
      <div class="more-menu-item" data-external-href="/admin.html">
        <i data-lucide="shield"></i><span>لوحة المطور</span>
      </div>
      ` : ''}
      <div class="more-menu-item" id="mobile-more-logout">
        <i data-lucide="log-out"></i><span>تسجيل الخروج</span>
      </div>
    `;
    document.body.appendChild(menu);
    if (window.lucide) window.lucide.createIcons({ root: menu });

    menu.querySelectorAll('[data-route]').forEach(item => {
      item.addEventListener('click', () => {
        router.navigate(item.dataset.route);
        menu.remove();
      });
    });
    const externalItem = menu.querySelector('[data-external-href]');
    if (externalItem) {
      externalItem.addEventListener('click', () => {
        window.location.href = externalItem.dataset.externalHref;
      });
    }
    menu.querySelector('#mobile-more-logout').addEventListener('click', () => {
      authService.logout();
      menu.remove();
    });

    // Close when tapping outside
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && e.target.id !== 'mobile-nav-more') {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 0);
  }
}
