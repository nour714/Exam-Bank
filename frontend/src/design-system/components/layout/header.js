import { BaseComponent } from '../../../core/component.js';
import { store } from '../../../core/state-store.js';
import { authService } from '../../../services/auth.service.js';
import { router } from '../../../core/router.js';

export class Header extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  _toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    const themeBtn = this.element.querySelector('.theme-toggle-btn');
    if (themeBtn) {
      themeBtn.setAttribute('title', isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
      themeBtn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
      if (window.lucide) window.lucide.createIcons({ root: themeBtn });
    }
  }

  render() {
    this.element = document.createElement('header');
    this.element.className = 'app-header';
    this.element.id = 'app-header';

    const renderHeader = (user) => {
      const isDark = document.documentElement.classList.contains('dark-theme') || localStorage.getItem('darkMode') !== 'false';

      if (!user) {
        this.element.innerHTML = `
          <div class="header-right">
            <div class="mobile-header-logo" id="hdr-brand-logo" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="color: var(--color-primary-500); display: flex; background: rgba(47, 95, 168, 0.12); padding: 8px; border-radius: 12px;"><i data-lucide="graduation-cap"></i></span>
                <span style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary); font-family: var(--font-family-display);">Exam Bank</span>
            </div>
          </div>
          <div class="header-left" style="display: flex; align-items: center; gap: 12px;">
            <button class="theme-toggle-btn btn-icon" id="btn-theme-toggle" title="${isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}">
              <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
            </button>
            <button class="btn btn-primary btn-sm" id="btn-login-hdr">تسجيل الدخول</button>
          </div>
        `;
        
        if (window.lucide) window.lucide.createIcons({ root: this.element });

        const loginBtn = this.element.querySelector('#btn-login-hdr');
        if (loginBtn) {
          loginBtn.addEventListener('click', () => router.navigate('/login'));
        }
        const brandLogo = this.element.querySelector('#hdr-brand-logo');
        if (brandLogo) {
          brandLogo.addEventListener('click', () => router.navigate('/'));
        }
        const themeBtn = this.element.querySelector('#btn-theme-toggle');
        if (themeBtn) {
          themeBtn.addEventListener('click', () => this._toggleTheme());
        }
        return;
      }

      this.element.innerHTML = `
        <div class="header-right">
            <button class="btn-menu-toggle" id="menu-toggle" aria-label="القائمة">
                <i data-lucide="menu"></i>
            </button>
            <div class="mobile-header-logo" id="mobile-header-logo" style="display: none; align-items: center; gap: 8px; margin-left: 10px; cursor: pointer;">
                <span style="color: var(--color-primary-500); display: flex; background: rgba(47, 95, 168, 0.12); padding: 6px; border-radius: 8px;"><i data-lucide="graduation-cap"></i></span>
                <span style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary); font-family: var(--font-family-display);">Exam Bank</span>
            </div>
            <div class="search-bar">
                <i data-lucide="search" class="search-icon"></i>
                <input type="text" placeholder="ابحث في مواد ثالثة ثانوي..." id="global-search">
            </div>
        </div>
        <div class="header-left" style="display: flex; align-items: center; gap: 12px;">
            <button class="theme-toggle-btn btn-icon" id="btn-theme-toggle" title="${isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}">
              <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
            </button>
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
      const themeBtn = this.element.querySelector('#btn-theme-toggle');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => this._toggleTheme());
      }
      const mobileLogo = this.element.querySelector('#mobile-header-logo');
      if (mobileLogo) {
        mobileLogo.addEventListener('click', () => router.navigate('/dashboard'));
      }
    };

    this.onCleanup(store.subscribe('user', renderHeader));
    renderHeader(store.get('user'));

    return this.element;
  }
}
