/**
 * Lightweight SPA Router.
 * Uses the History API for clean URL navigation.
 * Supports route guards, lazy loading, and nested layouts.
 */
import { eventBus } from './event-bus.js';

class Router {
  constructor() {
    /** @type {Map<string, {handler: Function, guard?: Function, layout?: string}>} */
    this.routes = new Map();
    this.notFoundHandler = null;
    this.currentRoute = null;
    this.beforeEachGuard = null;

    window.addEventListener('popstate', () => this._resolve());
    document.addEventListener('click', (e) => this._interceptLinks(e));
  }

  /**
   * Register a route.
   * @param {string} path - URL pattern (supports :param syntax)
   * @param {Function} handler - async fn(params) => HTMLElement | string
   * @param {Object} [options] - { guard, layout, title }
   */
  on(path, handler, options = {}) {
    this.routes.set(path, { handler, ...options });
    return this;
  }

  /**
   * Register a global guard executed before every navigation.
   * @param {Function} guardFn - async (to, from) => boolean
   */
  beforeEach(guardFn) {
    this.beforeEachGuard = guardFn;
    return this;
  }

  /**
   * Register a 404 handler.
   */
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Programmatic navigation.
   */
  navigate(path, { replace = false } = {}) {
    if (replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }
    this._resolve();
  }

  /**
   * Start the router (resolve current URL).
   */
  start() {
    this._resolve();
  }

  /**
   * Intercept anchor clicks for SPA navigation.
   * @private
   */
  _interceptLinks(e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');

    // Skip external links, hash links, and download links
    if (!href || href.startsWith('http') || href.startsWith('#') || anchor.hasAttribute('download') || anchor.target === '_blank') {
      return;
    }

    e.preventDefault();
    this.navigate(href);
  }

  /**
   * Match the current URL against registered routes and render.
   * @private
   */
  async _resolve() {
    const path = window.location.pathname;
    const from = this.currentRoute;

    for (const [pattern, route] of this.routes) {
      const params = this._matchRoute(pattern, path);
      if (params !== null) {
        // Global guard
        if (this.beforeEachGuard) {
          const allowed = await this.beforeEachGuard(path, from);
          if (!allowed) return;
        }

        // Route-specific guard
        if (route.guard) {
          const allowed = await route.guard(params);
          if (!allowed) return;
        }

        this.currentRoute = path;
        eventBus.emit('router.navigated', { path, params });

        // Set page title
        if (route.title) {
          document.title = `${route.title} — Exam Bank`;
        }

        // Call handler and mount into app-main
        const content = await route.handler(params);
        this._mount(content);
        return;
      }
    }

    // 404
    if (this.notFoundHandler) {
      this.currentRoute = path;
      const content = await this.notFoundHandler();
      this._mount(content);
    }
  }

  /**
   * Match a route pattern against a path, extracting params.
   * @private
   * @returns {Object|null} params object or null if no match
   */
  _matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }

  /**
   * Mount content into the main container.
   * @private
   */
  _mount(content) {
    const container = document.getElementById('app-main') || document.querySelector('.content-container') || document.querySelector('.main-layout') || document.body;
    if (!container) return;

    container.innerHTML = '';

    if (typeof content === 'string') {
      container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      container.appendChild(content);
    }

    // Trigger page enter animation
    container.firstElementChild?.classList.add('page-enter');

    // Scroll to top on navigation
    container.scrollTop = 0;
  }
}

export const router = new Router();
