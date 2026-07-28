import { Sidebar } from './sidebar.js';
import { Header } from './header.js';
import { MobileBottomNav } from './mobile-bottom-nav.js';

/**
 * App Layout Component.
 * Binds to the DOM shell defined in index.html.
 * Handles the sidebar, header, and user dropdown.
 */
export function initAppLayout() {
  const sidebarContainer = document.getElementById('app-sidebar');
  const headerContainer = document.getElementById('app-header-container');
  const mobileNavContainer = document.getElementById('mobile-bottom-nav-container');

  if (sidebarContainer) {
    const sidebar = new Sidebar();
    const el = sidebar.render();
    sidebar.mount();
    sidebarContainer.replaceWith(el);
  }

  if (headerContainer) {
    const header = new Header();
    const el = header.render();
    header.mount();
    headerContainer.replaceWith(el);
  }

  if (mobileNavContainer) {
    const mobileNav = new MobileBottomNav();
    const el = mobileNav.render();
    mobileNav.mount();
    mobileNavContainer.replaceWith(el);
  }
}
