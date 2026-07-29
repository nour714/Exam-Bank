import { BaseComponent } from '../../core/component.js';
import { router } from '../../core/router.js';
import { eventBus } from '../../core/event-bus.js';

/**
 * Home/Landing Page
 * Migrated from legacy-ui/index.html (Home View)
 * Features: Hero Banner, Features Section, Subjects Showcase
 */
export default class HomePage extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'home-page animate-fade-in';

    this.element.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <h1 class="hero-title">امتحاناتك... <br>معانا هتدخلها وأنت واثق 💪</h1>
          <p class="hero-subtitle">منصة مخصصة لطلاب المرحلة الثانوية. بنك أسئلة محدث لجميع الصفوف — نماذج نهائية، تحليل أداء، ومراجعات شاملة قبل يوم الامتحان.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" id="btn-start-study">
              <i data-lucide="play" class="w-5 h-5 ms-2"></i><span>ابدأ المذاكرة</span>
            </button>
            <button class="btn btn-secondary btn-lg" id="btn-start-test">
              <i data-lucide="edit-3" class="w-5 h-5 ms-2"></i><span>حل امتحان الآن</span>
            </button>
          </div>
        </div>
        <div class="hero-illustration">
          ${this._getHeroSVG()}
        </div>
      </section>

      <!-- Platform Features -->
      <section class="features-section container mx-auto px-4 py-12 max-w-6xl">
        <h2 class="section-title text-center text-2xl font-bold text-gray-200 mb-8">لماذا إيجزام بنك؟</h2>
        <div class="features-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="feature-card card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-orange-500/10 text-orange-500">
              <i data-lucide="brain" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-200 mb-2">تحليل مستواك بالذكاء الاصطناعي</h3>
            <p class="text-sm text-gray-400">تقارير تفصيلية تحدد نقاط ضعفك وقوتك وتطرح خطط دراسية مخصصة لرفع مستواك.</p>
          </div>
          <div class="feature-card card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10 text-blue-500">
              <i data-lucide="help-circle" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-200 mb-2">امتحانات على النظام الجديد</h3>
            <p class="text-sm text-gray-400">اختبارات تحاكي تماماً نظام الامتحانات النهائي لتدريبك على إدارة الوقت والتوتر.</p>
          </div>
          <div class="feature-card card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-purple-500/10 text-purple-500">
              <i data-lucide="book-open" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-200 mb-2">آلاف الأسئلة المجابة</h3>
            <p class="text-sm text-gray-400">بنك أسئلة ضخم ومحدث لمنهج الثالث الثانوي — يغطي كل مواد الثانوية العامة بمستويات صعوبة متنوعة.</p>
          </div>
        </div>
      </section>

      <!-- Subjects Showcase -->
      <section class="subjects-section container mx-auto px-4 py-12 max-w-6xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="section-title text-2xl font-bold text-gray-200">مواد ثالثة ثانوي</h2>
          <button class="btn btn-ghost text-primary-400 hover:text-primary-300" id="btn-view-all">
            عرض الكل <i data-lucide="arrow-left" class="w-4 h-4 me-1"></i>
          </button>
        </div>
        <div class="subjects-grid grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          ${this._getSubjectCards()}
        </div>
      </section>
    `;

    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons({ root: this.element }), 0);
    }

    this._bindEvents();
    return this.element;
  }

  mount() {
    super.mount();
  }

  _bindEvents() {
    const startStudyBtn = this.element.querySelector('#btn-start-study');
    const startTestBtn = this.element.querySelector('#btn-start-test');
    const viewAllBtn = this.element.querySelector('#btn-view-all');

    if (startStudyBtn) {
      this.addEventListener(startStudyBtn, 'click', () => router.navigate('/question-bank'));
    }

    if (startTestBtn) {
      this.addEventListener(startTestBtn, 'click', () => router.navigate('/dashboard'));
    }

    if (viewAllBtn) {
      this.addEventListener(viewAllBtn, 'click', () => router.navigate('/question-bank'));
    }

    // Subject card clicks
    const subjectCards = this.element.querySelectorAll('.subject-minimal-card');
    subjectCards.forEach(card => {
      this.addEventListener(card, 'click', () => {
        const subject = card.dataset.subject;
        if (subject) {
          router.navigate('/question-bank');
        }
      });
    });
  }

  _getHeroSVG() {
    // Use unique prefix to avoid ID conflicts if SVG renders multiple times
    const p = 'home-';
    return `
      <svg viewBox="0 0 500 400" width="100%" height="100%" class="illustration-svg">
        <defs>
          <linearGradient id="${p}bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.05"/>
          </linearGradient>
          <linearGradient id="${p}laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="${p}screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f2963"/>
            <stop offset="100%" stop-color="#1e1b4b"/>
          </linearGradient>
          <linearGradient id="${p}accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
          </linearGradient>
          <linearGradient id="${p}glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.75"/>
          </linearGradient>
          <filter id="${p}shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#0f2963" flood-opacity="0.15"/>
          </filter>
          <filter id="${p}glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Glowing background orbs -->
        <circle cx="250" cy="200" r="140" fill="url(#${p}bgGlow)" class="anim-pulse-slow"/>
        <circle cx="350" cy="150" r="80" fill="#8b5cf6" fill-opacity="0.06" class="anim-pulse-fast"/>
        <circle cx="150" cy="250" r="60" fill="#06b6d4" fill-opacity="0.08" class="anim-pulse-medium"/>

        <!-- Central Laptop Base -->
        <g transform="translate(130, 150)">
          <path d="M20 140 h200 l20 30 H0 z" fill="#cbd5e1" />
          <path d="M0 170 h240 v5 a10 10 0 0 1 -10 10 H10 a10 10 0 0 1 -10 -10 v-5" fill="#94a3b8" />
          <rect x="90" y="140" width="60" height="5" fill="#e2e8f0" />
        </g>

        <!-- Laptop Screen -->
        <g transform="translate(150, 60)">
          <rect x="0" y="0" width="200" height="130" rx="8" fill="url(#${p}laptopGrad)" />
          <rect x="5" y="5" width="190" height="115" rx="4" fill="url(#${p}screenGrad)" />
          
          <!-- Screen Content (Charts & Graphs) -->
          <rect x="15" y="15" width="170" height="15" rx="4" fill="#ffffff" fill-opacity="0.1" />
          <path d="M 20 100 L 50 60 L 90 80 L 140 30 L 180 50" fill="none" stroke="url(#${p}accentGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="anim-draw-line" />
          <circle cx="140" cy="30" r="6" fill="#10b981" filter="url(#${p}glow)" class="anim-pop"/>
          <circle cx="50" cy="60" r="4" fill="#8b5cf6" class="anim-pop-delay"/>
          <rect x="20" y="80" width="15" height="30" rx="2" fill="#3b82f6" fill-opacity="0.8" class="anim-bar-1"/>
          <rect x="45" y="50" width="15" height="60" rx="2" fill="#8b5cf6" fill-opacity="0.8" class="anim-bar-2"/>
          <rect x="70" y="70" width="15" height="40" rx="2" fill="#06b6d4" fill-opacity="0.8" class="anim-bar-3"/>
        </g>

        <!-- Floating Element 1: Score Card (Top Right) -->
        <g transform="translate(340, 40)">
          <g class="anim-float-slow" filter="url(#${p}shadow)">
            <rect x="0" y="0" width="120" height="70" rx="12" fill="url(#${p}glassGrad)" />
            <circle cx="30" cy="35" r="16" fill="#10b981" fill-opacity="0.15"/>
            <path d="M24 35 l4 4 l8 -8" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="55" y="25" width="45" height="6" rx="3" fill="#cbd5e1" />
            <rect x="55" y="40" width="30" height="6" rx="3" fill="#cbd5e1" />
            <text x="95" y="18" font-family="Arial" font-size="14" font-weight="bold" fill="#f59e0b" transform="rotate(15 100 15)">A+</text>
          </g>
        </g>

        <!-- Floating Element 2: AI Brain (Bottom Left) -->
        <g transform="translate(40, 200)">
          <g class="anim-float-fast" filter="url(#${p}shadow)">
            <rect x="0" y="0" width="110" height="80" rx="12" fill="url(#${p}glassGrad)" />
            <circle cx="55" cy="30" r="18" fill="#4f46e5" fill-opacity="0.15"/>
            <path d="M55 18 v4 M55 38 v4 M43 30 h4 M63 30 h4 M47 22 l3 3 M60 35 l3 3 M47 38 l3 -3 M60 22 l3 3" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
            <circle cx="55" cy="30" r="5" fill="#4f46e5" />
            <rect x="30" y="58" width="50" height="6" rx="3" fill="#94a3b8" />
          </g>
        </g>

        <!-- Floating Element 3: Exam Paper (Bottom Right) -->
        <g transform="translate(330, 230)">
          <g class="anim-float-medium" filter="url(#${p}shadow)">
            <rect x="0" y="0" width="90" height="100" rx="8" fill="#ffffff" transform="rotate(10)" />
            <rect x="15" y="20" width="60" height="4" rx="2" fill="#e2e8f0" transform="rotate(10)" />
            <rect x="15" y="35" width="40" height="4" rx="2" fill="#e2e8f0" transform="rotate(10)" />
            <rect x="15" y="50" width="50" height="4" rx="2" fill="#e2e8f0" transform="rotate(10)" />
            <circle cx="65" cy="75" r="12" fill="#ef4444" fill-opacity="0.1" transform="rotate(10)" />
            <path d="M55 70 l15 15 M70 70 l-15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round" transform="rotate(10)" />
          </g>
        </g>
        
        <!-- Stars / Sparkles -->
        <path d="M100 80 Q105 85 110 80 Q105 75 100 80" fill="#f59e0b" class="anim-pulse-fast"/>
        <path d="M300 20 Q305 25 310 20 Q305 15 300 20" fill="#f59e0b" class="anim-pulse-medium"/>
        <path d="M220 330 Q225 335 230 330 Q225 325 220 330" fill="#3b82f6" class="anim-pulse-slow"/>
      </svg>
    `;
  }

  _getSubjectCards() {
    const subjects = [
      { id: 'physics', name: 'الفيزياء', icon: 'atom', color: 'text-blue-500 bg-blue-500/10' },
      { id: 'chemistry', name: 'الكيمياء', icon: 'beaker', color: 'text-green-500 bg-green-500/10' },
      { id: 'biology', name: 'الأحياء', icon: 'dna', color: 'text-emerald-500 bg-emerald-500/10' },
      { id: 'math', name: 'الرياضيات', icon: 'calculator', color: 'text-purple-500 bg-purple-500/10' },
      { id: 'arabic', name: 'اللغة العربية', icon: 'languages', color: 'text-orange-500 bg-orange-500/10' },
      { id: 'english', name: 'اللغة الإنجليزية', icon: 'globe', color: 'text-cyan-500 bg-cyan-500/10' },
      { id: 'geology', name: 'الجيولوجيا', icon: 'mountain', color: 'text-amber-500 bg-amber-500/10' },
      { id: 'history', name: 'التاريخ', icon: 'landmark', color: 'text-rose-500 bg-rose-500/10' },
      { id: 'geography', name: 'الجغرافيا', icon: 'map', color: 'text-teal-500 bg-teal-500/10' }
    ];

    return subjects.map(s => `
      <div class="subject-minimal-card card p-4 cursor-pointer transition-all hover:scale-105 hover:border-primary-500/50 text-center" data-subject="${s.id}">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${s.color}">
          <i data-lucide="${s.icon}" class="w-6 h-6"></i>
        </div>
        <h4 class="text-sm font-medium text-gray-300">${s.name}</h4>
      </div>
    `).join('');
  }
}
