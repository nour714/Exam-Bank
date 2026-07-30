import { BaseComponent } from '../../../core/component.js';
import { store } from '../../../core/state-store.js';
import { authService } from '../../../services/auth.service.js';
import { router } from '../../../core/router.js';

export class Header extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('header');
    this.element.className = 'app-header';
    this.element.id = 'app-header';

    const renderHeader = (user) => {
      if (!user) {
        this.element.innerHTML = `
          <div class="header-right">
            <div class="mobile-header-logo" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <span style="color: var(--color-primary-500); display: flex; background: rgba(47, 95, 168, 0.1); padding: 6px; border-radius: 8px;"><i data-lucide="graduation-cap"></i></span>
                <span style="font-weight: 800; font-size: 1.15rem;">Exam Bank</span>
            </div>
          </div>
          <div class="header-left">
            <button class="btn btn-primary btn-sm" id="btn-login-hdr">تسجيل الدخول</button>
          </div>
        `;
        
        if (window.lucide) window.lucide.createIcons({ root: this.element });

        const loginBtn = this.element.querySelector('#btn-login-hdr');
        if (loginBtn) {
          loginBtn.addEventListener('click', () => router.navigate('/login'));
        }
        return;
      }

      this.element.innerHTML = `
        <div class="header-right">
            <button class="btn-menu-toggle" id="menu-toggle">
                <i data-lucide="menu"></i>
            </button>
            <div class="mobile-header-logo" id="mobile-header-logo" style="display: none; align-items: center; gap: 8px; margin-left: 10px; cursor: pointer;">
                <span style="color: var(--color-primary-500); display: flex; background: rgba(47, 95, 168, 0.1); padding: 6px; border-radius: 8px;"><i data-lucide="graduation-cap"></i></span>
                <span style="font-weight: 800; font-size: 1.15rem;">Exam Bank</span>
            </div>
            <div class="search-bar">
                <i data-lucide="search" class="search-icon"></i>
                <input type="text" placeholder="ابحث في مواد ثالثة ثانوي..." id="global-search">
            </div>
        </div>
        <div class="header-left">
            <div class="notification-bell" id="bell-trigger">
                <i data-lucide="bell"></i>
                <span class="bell-badge">3</span>
            </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons({ root: this.element });

      const menuToggle = this.element.querySelector('#menu-toggle');
      if (menuToggle) {
        menuToggle.addEventListener('click', () => {
          document.body.classList.toggle('sidebar-open');
        });
      }
    };

    this.onCleanup(store.subscribe('user', renderHeader));
    renderHeader(store.get('user'));

    return this.element;
  }
}
