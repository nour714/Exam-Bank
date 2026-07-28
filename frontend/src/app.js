import { router } from './core/router.js';
import { store } from './core/state-store.js';
import { authService } from './services/auth.service.js';
import { wsClient } from './core/ws-client.js';
import { eventBus } from './core/event-bus.js';
import { moduleLoader } from './core/module-loader.js';
import { GuestOnlyRoute, ProtectedRoute } from './core/guards.js';
import { setDashboardProvider } from './services/dashboard.service.js';
import { setCurriculumProvider } from './services/curriculum.service.js';
import { setQuestionProvider } from './services/question.service.js';
import { setSettingsProvider } from './services/settings.service.js';
import { setStudyGroupsProvider } from './services/study-groups.service.js';
import { setExamsProvider } from './services/exams.service.js';
import { setEngineProvider } from './services/engine.service.js';

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

  // 0. Inject Providers
  const { DashboardMockProvider } = await import('./services/providers/dashboard.mock.provider.js');
  setDashboardProvider(DashboardMockProvider);

  const { CurriculumMockProvider } = await import('./services/providers/curriculum.mock.provider.js');
  setCurriculumProvider(CurriculumMockProvider);

  const { QuestionMockProvider } = await import('./services/providers/question.mock.provider.js');
  setQuestionProvider(QuestionMockProvider);

  const { AiMockProvider } = await import('./services/providers/ai.mock.provider.js');
  const { setAiProvider } = await import('./services/ai.service.js');
  setAiProvider(AiMockProvider);

  // NOTE: Real backend support added via new grade/pathway/emailNotifications/examReminders
  // columns on User (prisma/schema.prisma) + PUT /auth/me. Swap to SettingsApiProvider
  // (./services/providers/settings.api.provider.js) once `prisma db push` has been run
  // against a live DB.
  const { SettingsMockProvider } = await import('./services/providers/settings.mock.provider.js');
  setSettingsProvider(SettingsMockProvider);

  // NOTE: Real backend exists at src/modules/study-groups (+ the discover/join-by-code
  // endpoints added alongside this frontend work). Swap to StudyGroupsApiProvider
  // (./services/providers/study-groups.api.provider.js) once a live DB is connected.
  const { StudyGroupsMockProvider } = await import('./services/providers/study-groups.mock.provider.js');
  setStudyGroupsProvider(StudyGroupsMockProvider);

  // NOTE: Exams/Engine ship with a REAL backend implementation already
  // (src/modules/exams, src/modules/engine) matching this exact contract.
  // Once a live Postgres DB is connected, switch these two lines to:
  //   import { ExamsApiProvider } from './services/providers/exams.api.provider.js';
  //   import { EngineApiProvider } from './services/providers/engine.api.provider.js';
  // and pass those instead of the mock providers below — no other code changes needed.
  const { ExamsMockProvider } = await import('./services/providers/exams.mock.provider.js');
  setExamsProvider(ExamsMockProvider);

  const { EngineMockProvider } = await import('./services/providers/engine.mock.provider.js');
  setEngineProvider(EngineMockProvider);

  // 1. Recover session
  const isAuthenticated = await authService.recoverSession();

  // 2. We removed the global auth guard in favor of per-route guards.

  // 3. Register Routes using ModuleLoader for lazy loading
  router
    .on('/', (params) => {
      return moduleLoader.load('home', () => import('./pages/home/home.js'), params);
    }, { title: 'الرئيسية' })
    .on('/home', (params) => {
      return moduleLoader.load('home', () => import('./pages/home/home.js'), params);
    }, { title: 'الرئيسية' })
    .on('/login', (params) => {
      return moduleLoader.load('login', () => import('./pages/auth/login.js'), params);
    }, { guard: GuestOnlyRoute, title: 'تسجيل الدخول' })
    .on('/register', (params) => {
      return moduleLoader.load('register', () => import('./pages/auth/register.js'), params);
    }, { guard: GuestOnlyRoute, title: 'إنشاء حساب' })
    .on('/dashboard', (params) => {
      return moduleLoader.load('dashboard', () => import('./pages/dashboard/dashboard.js'), params);
    }, { guard: ProtectedRoute, title: 'لوحة التحكم' })
    .on('/question-bank', (params) => {
      return moduleLoader.load('question-bank.subjects', () => import('./pages/question-bank/subjects.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | المواد', breadcrumbTitle: 'بنك الأسئلة', cacheKey: 'curriculum:subjects' })
    .on('/question-bank/subjects', (params) => {
      return moduleLoader.load('question-bank.subjects', () => import('./pages/question-bank/subjects.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | المواد', breadcrumbTitle: 'المواد', cacheKey: 'curriculum:subjects' })
    .on('/question-bank/subjects/:subjectId/units', (params) => {
      return moduleLoader.load(`question-bank.units.${params.subjectId}`, () => import('./pages/question-bank/units.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | الوحدات', breadcrumbTitle: 'الوحدات', cacheKey: 'curriculum:units' })
    .on('/question-bank/subjects/:subjectId/units/:unitId/lessons', (params) => {
      return moduleLoader.load(`question-bank.lessons.${params.unitId}`, () => import('./pages/question-bank/lessons.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | الدروس', breadcrumbTitle: 'الدروس', cacheKey: 'curriculum:lessons' })
    .on('/question-bank/questions', (params) => {
      return moduleLoader.load('question-bank.questions', () => import('./pages/question-bank/questions.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | الأسئلة', breadcrumbTitle: 'تصفح الأسئلة' })
    .on('/question-bank/questions/editor', (params) => {
      return moduleLoader.load('question-bank.editor.new', () => import('./pages/question-bank/question-editor.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | إضافة سؤال جديد', breadcrumbTitle: 'إضافة سؤال' })
    .on('/question-bank/questions/editor/:id', (params) => {
      return moduleLoader.load(`question-bank.editor.${params.id}`, () => import('./pages/question-bank/question-editor.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | تعديل السؤال' })
    .on('/question-bank/questions/:id', (params) => {
      return moduleLoader.load(`question-bank.question-details.${params.id}`, () => import('./pages/question-bank/question-details.js'), params);
    }, { guard: ProtectedRoute, title: 'بنك الأسئلة | تفاصيل السؤال' })
    .on('/exams', (params) => {
      return moduleLoader.load('exams', () => import('./pages/exams/exams.js'), params);
    }, { guard: ProtectedRoute, title: 'الامتحانات' })
    .on('/exam-session/:attemptId', (params) => {
      return moduleLoader.load(`exam-session.${params.attemptId}`, () => import('./pages/exam-session/exam-session.js'), params);
    }, { guard: ProtectedRoute, title: 'جلسة الامتحان' })
    .on('/study-groups', (params) => {
      return moduleLoader.load('study-groups', () => import('./pages/study-groups/study-groups.js'), params);
    }, { guard: ProtectedRoute, title: 'مجموعات الدراسة' })
    .on('/settings', (params) => {
      return moduleLoader.load('settings', () => import('./pages/settings/settings.js'), params);
    }, { guard: ProtectedRoute, title: 'الإعدادات' })
    .notFound(() => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
          <h1 class="text-6xl font-black text-gray-200 mb-4 tracking-tight">404</h1>
          <h2 class="text-2xl font-bold text-gray-400 mb-4">الصفحة غير موجودة</h2>
          <p class="text-gray-500 mb-8 max-w-md mx-auto">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون حذفت أو نقلت.</p>
          <button id="btn-404-back" class="btn btn-primary px-8 py-3 shadow-lg shadow-primary/20">
            <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i> العودة للصفحة السابقة
          </button>
        </div>
      `;
      const backBtn = div.querySelector('#btn-404-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => window.history.back());
      }
      if (window.lucide) {
        setTimeout(() => window.lucide.createIcons({ root: div }), 0);
      }
      return div;
    });

  // 4. Initialize WebSocket if authenticated
  if (authService.isAuthenticated()) {
    // In production, this URL would come from configuration
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsClient.connect(`${protocol}//${window.location.host}/ws`);
  }

  // Listen for login/logout to manage WebSocket
  eventBus.on('auth.login', () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsClient.connect(`${protocol}//${window.location.host}/ws`);
  });

  eventBus.on('auth.logout', () => {
    wsClient.disconnect();
  });

  // 5. Pre-router initialization: Route resolution
  // If the user visits the root path, rewrite the browser history to the appropriate starting page
  // *before* the router executes its initial evaluation.
  if (window.location.pathname === '/') {
    const target = authService.isAuthenticated() ? '/dashboard' : '/home';
    window.history.replaceState(null, '', target);
  }

  // 6. Start router
  router.start();
  window.router = router;

  // 7. Register Service Worker for PWA with forced update & auto-refresh
  if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Automatically refresh the page once a new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        // Force update check on page load to immediately pick up new SW versions
        registration.update();
      }).catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
    });
  }

  // 7. Offline Behaviour
  window.addEventListener('offline', () => {
    eventBus.emit('toast.show', { 
      type: 'warning', 
      title: 'انقطع الاتصال',
      message: 'أنت الآن في وضع عدم الاتصال. بعض الميزات قد لا تعمل بشكل صحيح.' 
    });
  });

  window.addEventListener('online', () => {
    eventBus.emit('toast.show', { 
      type: 'success', 
      title: 'عاد الاتصال',
      message: 'تمت استعادة الاتصال بالإنترنت بنجاح.' 
    });
    // Auto-resume sync or connections
    if (authService.isAuthenticated()) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsClient.connect(`${protocol}//${window.location.host}/ws`);
      // Trigger dashboard background refresh on reconnect
      eventBus.emit('dashboard.refresh');
    }
  });
}

// Start app
bootstrap().catch(console.error);
