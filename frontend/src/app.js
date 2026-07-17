import { router } from './core/router.js';
import { store } from './core/state-store.js';
import { authService } from './services/auth.service.js';
import { wsClient } from './core/ws-client.js';
import { eventBus } from './core/event-bus.js';
import { moduleLoader } from './core/module-loader.js';

import { initAppLayout } from './design-system/components/layout/app-layout.js';
import { initToastSystem } from './design-system/components/feedback/toast.js';

// Pages are loaded dynamically via ModuleLoader

/**
 * App Bootstrap
 */
async function bootstrap() {
  console.log('Bootstrapping Exam Bank Enterprise SPA...');

  initAppLayout();
  initToastSystem();

  // 1. Recover session
  const isAuthenticated = await authService.recoverSession();

  // 2. Setup global router guards
  router.beforeEach(async (to, from) => {
    const isPublic = ['/login', '/register'].includes(to);
    const hasToken = authService.isAuthenticated();

    if (!isPublic && !hasToken) {
      router.navigate('/login', { replace: true });
      return false;
    }

    if (isPublic && hasToken) {
      router.navigate('/dashboard', { replace: true });
      return false;
    }

    return true;
  });

  // 3. Register Routes using ModuleLoader for lazy loading
  router
    .on('/login', (params) => {
      return moduleLoader.load('login', () => import('./pages/auth/login.js'), params);
    })
    .on('/dashboard', (params) => {
      return moduleLoader.load('dashboard', () => import('./pages/dashboard/dashboard.js'), params);
    })
    .notFound(() => {
      const div = document.createElement('div');
      div.innerHTML = '<div class="container py-8 text-center"><h1>404 Not Found</h1><p class="text-muted mt-2">The page you requested does not exist.</p></div>';
      return div;
    });

  // 4. Initialize WebSocket if authenticated
  if (authService.isAuthenticated()) {
    // In production, this URL would come from configuration
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsClient.connect(`${protocol}//${window.location.host}/ws`);
  }

  // Listen for login/logout to manage WebSocket
  eventBus.on('auth:logged_in', () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsClient.connect(`${protocol}//${window.location.host}/ws`);
  });

  eventBus.on('auth:logged_out', () => {
    wsClient.disconnect();
  });

  // 5. Start router
  router.start();

  // If root URL, redirect based on auth
  if (window.location.pathname === '/') {
    router.navigate(authService.isAuthenticated() ? '/dashboard' : '/login', { replace: true });
  }

  // 6. Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
    });
  }
}

// Start app
bootstrap().catch(console.error);
