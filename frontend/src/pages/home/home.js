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
              <i data-lucide="play" class="w-5 h-5"></i><span>ابدأ المذاكرة</span>
            </button>
            <button class="btn btn-secondary btn-lg" id="btn-start-test">
              <i data-lucide="edit-3" class="w-5 h-5"></i><span>حل امتحان الآن</span>
            </button>
          </div>
        </div>
        <div class="hero-illustration">
          ${this._getHeroSVG()}
        </div>
      </section>

      <!-- Platform Features -->
      <section class="features-section container mx-auto px-4 py-12 max-w-6xl">
        <h2 class="section-title text-center text-3xl font-extrabold mb-10" style="color: var(--text-primary); font-family: var(--font-family-display);">لماذا إيجزام بنك؟</h2>
        <div class="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="feature-card glass-card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-orange-500/10 text-orange-500">
              <i data-lucide="brain" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary); font-family: var(--font-family-display);">تحليل مستواك بالذكاء الاصطناعي</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">تقارير تفصيلية تحدد نقاط ضعفك وقوتك وتطرح خطط دراسية مخصصة لرفع مستواك.</p>
          </div>
          <div class="feature-card glass-card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10 text-blue-500">
              <i data-lucide="help-circle" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary); font-family: var(--font-family-display);">امتحانات على النظام الجديد</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">اختبارات تحاكي تماماً نظام الامتحانات النهائي لتدريبك على إدارة الوقت والتوتر.</p>
          </div>
          <div class="feature-card glass-card p-6 text-center">
            <div class="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-purple-500/10 text-purple-500">
              <i data-lucide="book-open" class="w-7 h-7"></i>
            </div>
            <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary); font-family: var(--font-family-display);">آلاف الأسئلة المجابة</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">بنك أسئلة ضخم ومحدث لمنهج الثالث الثانوي — يغطي كل مواد الثانوية العامة بمستويات صعوبة متنوعة.</p>
          </div>
        </div>
      </section>

      <!-- Subjects Showcase -->
      <section class="subjects-section container mx-auto px-4 py-12 max-w-6xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="section-title text-2xl font-bold" style="color: var(--text-primary); font-family: var(--font-family-display);">مواد ثالثة ثانوي</h2>
          <button class="btn btn-ghost text-primary-500 hover:text-primary-600" id="btn-view-all">
            عرض الكل <i data-lucide="arrow-left" class="w-4 h-4 ms-1"></i>
          </button>
        </div>
        <div class="subjects-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
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
        const subject = card.dataset.subject || 'physics';
        router.navigate(`/question-bank/subjects/${subject}/units`);
      });
    });
  }

  _getHeroSVG() {
    // Use unique prefix to avoid ID conflicts if SVG renders multiple times
    // Composition: an "exam admission ticket" (بطاقة دخول الامتحان) as the
    // central motif — a stub + a body of answer lines + an ink stamp —
    // instead of a generic dashboard-on-a-laptop illustration.
    const p = 'home-';
    return `
      <svg viewBox="0 0 500 400" width="100%" height="100%" class="illustration-svg">
        <defs>
          <linearGradient id="${p}bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2F5FA8" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#B8862E" stop-opacity="0.06"/>
          </linearGradient>
          <linearGradient id="${p}ticketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDFCF8"/>
            <stop offset="100%" stop-color="#F3F1E9"/>
          </linearGradient>
          <linearGradient id="${p}stubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1C3862"/>
            <stop offset="100%" stop-color="#101D36"/>
          </linearGradient>
          <linearGradient id="${p}glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.97"/>
            <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.82"/>
          </linearGradient>
          <filter id="${p}shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#101D36" flood-opacity="0.18"/>
          </filter>
        </defs>

        <!-- Glowing background orbs -->
        <circle cx="250" cy="200" r="150" fill="url(#${p}bgGlow)" class="anim-pulse-slow"/>
        <circle cx="360" cy="130" r="70" fill="#B8862E" fill-opacity="0.06" class="anim-pulse-fast"/>
        <circle cx="130" cy="270" r="60" fill="#2F5FA8" fill-opacity="0.07" class="anim-pulse-medium"/>

        <!-- Central: Exam Admission Ticket -->
        <g transform="translate(105, 95) rotate(-4)" filter="url(#${p}shadow)">
          <!-- Ticket stub (left) -->
          <path d="M0 10 a10 10 0 0 1 10 -10 h70 v200 h-70 a10 10 0 0 1 -10 -10 z" fill="url(#${p}stubGrad)"/>
          <text x="45" y="60" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#FDFCF8" text-anchor="middle" transform="rotate(-90 45 60)">EXAM PASS</text>
          <circle cx="45" cy="115" r="20" fill="none" stroke="#B8862E" stroke-width="2" stroke-dasharray="3 3"/>
          <path d="M36 115 l6 7 l13 -15" fill="none" stroke="#B8862E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Perforation -->
          <line x1="80" y1="4" x2="80" y2="196" stroke="#F3F1E9" stroke-width="2" stroke-dasharray="4 5"/>

          <!-- Ticket body (right) -->
          <path d="M80 0 h190 a10 10 0 0 1 10 10 v180 a10 10 0 0 1 -10 10 h-190 z" fill="url(#${p}ticketGrad)"/>
          <rect x="100" y="24" width="130" height="10" rx="3" fill="#1C3862"/>
          <rect x="100" y="42" width="80" height="6" rx="3" fill="#C9C6BB"/>

          <rect x="100" y="72" width="150" height="1" fill="#E2DFD3"/>
          <rect x="100" y="88" width="12" height="12" rx="3" fill="#2F5FA8" fill-opacity="0.12"/>
          <rect x="120" y="91" width="110" height="6" rx="3" fill="#C9C6BB"/>
          <rect x="100" y="110" width="12" height="12" rx="3" fill="#10B981" fill-opacity="0.15"/>
          <path d="M103 116 l3 3 l6 -6" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="120" y="113" width="90" height="6" rx="3" fill="#C9C6BB"/>
          <rect x="100" y="132" width="12" height="12" rx="3" fill="#2F5FA8" fill-opacity="0.12"/>
          <rect x="120" y="135" width="100" height="6" rx="3" fill="#C9C6BB"/>

          <!-- Barcode strip -->
          <g transform="translate(100, 165)">
            <rect x="0" y="0" width="2" height="18" fill="#232320"/>
            <rect x="5" y="0" width="1" height="18" fill="#232320"/>
            <rect x="9" y="0" width="3" height="18" fill="#232320"/>
            <rect x="15" y="0" width="1" height="18" fill="#232320"/>
            <rect x="19" y="0" width="2" height="18" fill="#232320"/>
            <rect x="24" y="0" width="4" height="18" fill="#232320"/>
            <rect x="31" y="0" width="1" height="18" fill="#232320"/>
            <rect x="35" y="0" width="2" height="18" fill="#232320"/>
            <rect x="40" y="0" width="3" height="18" fill="#232320"/>
            <text x="0" y="30" font-family="'JetBrains Mono', monospace" font-size="9" fill="#7A7669">REF-2026-081</text>
          </g>
        </g>

        <!-- Floating Element 1: Ink stamp grade (Top Right) -->
        <g transform="translate(350, 35)">
          <g class="anim-float-slow" filter="url(#${p}shadow)">
            <circle cx="45" cy="45" r="45" fill="url(#${p}glassGrad)"/>
            <circle cx="45" cy="45" r="34" fill="none" stroke="#C63D2F" stroke-width="2.5" stroke-dasharray="4 4" transform="rotate(-8 45 45)"/>
            <text x="45" y="53" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="700" fill="#C63D2F" text-anchor="middle" transform="rotate(-8 45 45)">A+</text>
          </g>
        </g>

        <!-- Floating Element 2: AI analysis chip (Bottom Left) -->
        <g transform="translate(30, 235)">
          <g class="anim-float-fast" filter="url(#${p}shadow)">
            <rect x="0" y="0" width="112" height="78" rx="14" fill="url(#${p}glassGrad)" />
            <circle cx="30" cy="30" r="16" fill="#2F5FA8" fill-opacity="0.14"/>
            <path d="M30 20 v4 M30 36 v4 M20 30 h4 M36 30 h4 M23 23 l3 3 M34 34 l3 3 M23 37 l3 -3 M34 26 l3 -3" fill="none" stroke="#2F5FA8" stroke-width="2" stroke-linecap="round"/>
            <circle cx="30" cy="30" r="4.5" fill="#2F5FA8" />
            <rect x="56" y="20" width="45" height="6" rx="3" fill="#C9C6BB" />
            <rect x="56" y="33" width="32" height="6" rx="3" fill="#C9C6BB" />
            <rect x="14" y="56" width="84" height="7" rx="3.5" fill="#E9EFF8"/>
            <rect x="14" y="56" width="54" height="7" rx="3.5" fill="#2F5FA8"/>
          </g>
        </g>

        <!-- Floating Element 3: Countdown timer (Bottom Right) -->
        <g transform="translate(335, 250)">
          <g class="anim-float-medium" filter="url(#${p}shadow)">
            <rect x="0" y="0" width="115" height="60" rx="14" fill="url(#${p}glassGrad)" />
            <circle cx="24" cy="30" r="13" fill="none" stroke="#B8862E" stroke-width="2.5"/>
            <path d="M24 22 v8 l6 4" fill="none" stroke="#B8862E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="68" y="27" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#232320" text-anchor="middle" direction="ltr">02:45:00</text>
            <text x="68" y="43" font-family="'Tajawal', sans-serif" font-size="10" font-weight="600" fill="#7A7669" text-anchor="middle">وقت الامتحان</text>
          </g>
        </g>

        <!-- Sparkles -->
        <path d="M95 70 Q100 75 105 70 Q100 65 95 70" fill="#B8862E" class="anim-pulse-fast"/>
        <path d="M300 15 Q305 20 310 15 Q305 10 300 15" fill="#B8862E" class="anim-pulse-medium"/>
        <path d="M225 345 Q230 350 235 345 Q230 340 225 345" fill="#2F5FA8" class="anim-pulse-slow"/>
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
