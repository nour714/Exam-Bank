import { BaseComponent } from '../../../../core/component.js';
import { dashboardService } from '../../../../services/dashboard.service.js';
import { eventBus } from '../../../../core/event-bus.js';
import { measure } from '../../../../core/observability.js';
import { StatisticCard } from './statistic-card.js';

/**
 * StatsRow — Independently fetches and renders the 4 KPI stat cards.
 * Subscribes to dashboard.summary.updated for background refreshes.
 * Shows skeletons only if no cached data exists.
 */
export class StatsRow extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.statCards = [];

    // Listen for background refresh of summary data
    this.onCleanup(
      eventBus.on('dashboard.summary.updated', (data) => {
        this._renderStats(data);
      })
    );

    // Listen for global dashboard refresh (e.g. reconnect)
    this.onCleanup(
      eventBus.on('dashboard.refresh', () => {
        this._loadData(true);
      })
    );
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'إحصائيات سريعة');

    // Show skeleton placeholders initially
    this._showSkeletons();

    return this.element;
  }

  mount() {
    super.mount();
    this._loadData();
  }

  async _loadData(force = false) {
    try {
      const result = await measure('StatsRow', 'api', () =>
        dashboardService.getSummary(force)
      );

      this._renderStats(result.data);

      // If the data came from cache, the service may have triggered a background
      // refresh. The EventBus listener above will handle the update.
    } catch (err) {
      console.error('[StatsRow] Failed to load summary:', err);
      // Don't block other widgets — show error state in this row only
      if (!this.statCards.length) {
        this.element.innerHTML = `
          <div class="col-span-full text-center text-danger py-4">
            <p>تعذر تحميل الإحصائيات</p>
            <button class="btn btn-sm btn-outline-danger mt-2" id="stats-retry">إعادة المحاولة</button>
          </div>
        `;
        this.element.querySelector('#stats-retry')?.addEventListener('click', () => this._loadData(true));
      }
    }
  }

  _renderStats(summary) {
    if (!this.element || !document.body.contains(this.element)) return;

    // Destroy old cards
    this.statCards.forEach(card => card.destroy());
    this.statCards = [];
    this.element.innerHTML = '';

    const statConfig = [
      { title: 'الاختبارات المنجزة', value: summary.completedExams || '0', icon: 'check-circle', colorClass: 'text-success', bgClass: 'bg-success/10', trend: 12 },
      { title: 'متوسط الدرجات', value: (summary.averageScore || 0) + '%', icon: 'award', colorClass: 'text-primary-color', bgClass: 'bg-primary-color/10', trend: 5 },
      { title: 'أيام الدراسة المتتالية', value: summary.studyStreak || '0', icon: 'flame', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', trend: -2 },
      { title: 'الساعات الدراسية', value: summary.studyHours || '0', icon: 'clock', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', trend: 8 }
    ];

    statConfig.forEach(config => {
      const card = new StatisticCard(config);
      this.statCards.push(card);
      this.registerChild(card);
      this.element.appendChild(card.render());
      card.mount();
    });
  }

  _showSkeletons() {
    this.element.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'animate-pulse h-32 bg-gray-800 rounded-xl';
      this.element.appendChild(skeleton);
    }
  }

  destroy() {
    this.statCards.forEach(card => card.destroy());
    this.statCards = [];
    super.destroy();
  }
}
