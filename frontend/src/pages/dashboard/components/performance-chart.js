import { BaseComponent } from '../../../../core/component.js';
import { dashboardService } from '../../../../services/dashboard.service.js';
import { eventBus } from '../../../../core/event-bus.js';
import { measure } from '../../../../core/observability.js';
import { ChartView } from '../../../../design-system/components/charts/chart-view.js';

/**
 * PerformanceChart — Independently fetches performance data.
 * Subscribes to dashboard.performance.updated for background refreshes.
 * Shows skeleton only if no cached data exists.
 * Properly destroys Chart.js instance on unmount.
 */
export class PerformanceChart extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.chartView = null;

    // Listen for background refresh
    this.onCleanup(
      eventBus.on('dashboard.performance.updated', (data) => {
        this._applyData(data);
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
    this.element.className = 'card p-6 flex flex-col';
    this.element.style.minHeight = '400px';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'رسم بياني للأداء');

    this.element.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">أداء المراجعة</h3>
      </div>
      <div id="chart-content" class="flex-1 relative">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="spinner spinner-lg"></div>
        </div>
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
      const result = await measure('PerformanceChart', 'api', () =>
        dashboardService.getPerformanceData(force)
      );
      this._applyData(result.data);
    } catch (err) {
      console.error('[PerformanceChart] Failed to load:', err);
      this._showError();
    }
  }

  _applyData(data) {
    if (!this.element || !document.body.contains(this.element)) return;

    const wrapper = this.element.querySelector('#chart-content');
    if (!wrapper) return;

    const chartData = {
      labels: data.labels || ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      datasets: [
        {
          label: 'درجات الاختبارات',
          data: data.scores || [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // If chart already exists, update data in-place (no flicker)
    if (this.chartView) {
      this.chartView.updateData(chartData);
      return;
    }

    // First render — clear skeleton and create chart
    wrapper.innerHTML = '';
    this.chartView = new ChartView({
      id: 'dashboard-performance-chart',
      type: 'line',
      data: chartData,
      options: {
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });

    wrapper.appendChild(this.chartView.render());
    this.registerChild(this.chartView);
    this.chartView.mount();
  }

  _showError() {
    const wrapper = this.element?.querySelector('#chart-content');
    if (!wrapper) return;

    wrapper.innerHTML = `
      <div class="absolute inset-0 flex items-center justify-center text-center">
        <div>
          <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2 text-danger"></i>
          <p class="text-danger">حدث خطأ أثناء تحميل الرسم البياني</p>
          <button class="btn btn-sm btn-outline-danger mt-3" id="chart-retry">إعادة المحاولة</button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: wrapper });
    wrapper.querySelector('#chart-retry')?.addEventListener('click', () => this._loadData(true));
  }

  destroy() {
    // ChartView.destroy() handles Chart.js cleanup via registerChild
    this.chartView = null;
    super.destroy();
  }
}
