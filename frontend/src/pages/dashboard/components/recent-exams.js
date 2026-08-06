import { BaseComponent } from '../../../core/component.js';
import { dashboardService } from '../../../services/dashboard.service.js';
import { eventBus } from '../../../core/event-bus.js';
import { measure } from '../../../core/observability.js';
import { router } from '../../../core/router.js';

/**
 * RecentExams — Independently fetches recent exams from summary data.
 * Subscribes to dashboard.summary.updated for background refreshes.
 * Shows skeleton only if no cached data exists.
 */
export class RecentExams extends BaseComponent {
  constructor(props = {}) {
    super(props);

    // Listen for background refresh of summary (which contains recentExams)
    this.onCleanup(
      eventBus.on('dashboard.summary.updated', (data) => {
        this._renderExams(data.recentExams || []);
      })
    );

    // Listen for global reconnect refresh
    this.onCleanup(
      eventBus.on('dashboard.refresh', () => {
        this._loadData(true);
      })
    );
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'card p-6';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'الاختبارات الأخيرة');

    this.element.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold">الاختبارات الأخيرة</h3>
        <button class="text-sm text-blue-500 hover:text-blue-400" tabindex="0">عرض الكل</button>
      </div>
      <div id="exams-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this._skeletonHtml()}
      </div>
    `;

    return this.element;
  }

  mount() {
    super.mount();
    this._loadData();
  }

  async _loadData(force = false) {
    try {
      const result = await measure('RecentExams', 'api', () =>
        dashboardService.getSummary(force)
      );
      this._renderExams(result.data.recentExams || []);
    } catch (err) {
      console.error('[RecentExams] Failed to load:', err);
      this._showError();
    }
  }

  _renderExams(exams) {
    if (!this.element || !document.body.contains(this.element)) return;

    const grid = this.element.querySelector('#exams-grid');
    if (!grid) return;

    if (exams.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center text-gray-500 py-8">
          <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
          <p>لم تقم بإجراء أي اختبارات مؤخراً</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: grid });
      return;
    }

    grid.innerHTML = '';

    exams.forEach(exam => {
      const progressColor = exam.score >= 85 ? 'bg-success' : exam.score >= 65 ? 'bg-warning' : 'bg-danger';

      const card = document.createElement('div');
      card.className = 'card p-5 border transition-all cursor-pointer hover:shadow-md';
      card.style.borderColor = 'var(--border-color)';
      card.setAttribute('role', 'article');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${exam.title} - النتيجة ${exam.score}%`);

      card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <i data-lucide="book-open" class="w-5 h-5"></i>
          </div>
          <span class="text-xs" style="color: var(--text-muted);">${exam.date}</span>
        </div>
        <h4 class="font-bold mb-1 truncate" style="color: var(--text-primary);" title="${exam.title}">${exam.title}</h4>
        <p class="text-sm mb-4" style="color: var(--text-secondary);">${exam.subject}</p>
        <div class="flex justify-between items-center text-sm mb-2">
          <span style="color: var(--text-secondary);">النتيجة</span>
          <span class="font-bold" style="color: var(--text-primary);">${exam.score}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5" style="background: var(--border-color);">
          <div class="${progressColor} h-1.5 rounded-full transition-all" style="width: ${exam.score}%"></div>
        </div>
      `;

      const navigate = () => router.navigate('/question-bank/questions');
      card.addEventListener('click', navigate);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });

      grid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons({ root: grid });
  }

  _showError() {
    const grid = this.element?.querySelector('#exams-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="col-span-full text-center text-danger py-4">
        <p>حدث خطأ أثناء جلب الاختبارات</p>
        <button class="btn btn-sm btn-outline-danger mt-2" id="exams-retry">إعادة المحاولة</button>
      </div>
    `;
    grid.querySelector('#exams-retry')?.addEventListener('click', () => this._loadData(true));
  }

  _skeletonHtml() {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `
        <div class="animate-pulse card p-5">
          <div class="flex justify-between mb-4">
            <div class="h-8 w-8 rounded-lg" style="background: var(--border-color);"></div>
            <div class="h-3 w-16 rounded" style="background: var(--border-color);"></div>
          </div>
          <div class="h-5 rounded w-3/4 mb-2" style="background: var(--border-color);"></div>
          <div class="h-4 rounded w-1/2 mb-4" style="background: var(--border-color);"></div>
          <div class="h-1.5 rounded-full" style="background: var(--border-color);"></div>
        </div>
      `;
    }
    return html;
  }
}
