import { BaseComponent } from '../../../core/component.js';

export class ChartView extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.chartInstance = null;
  }

  render() {
    const { id, type, data, options = {} } = this.props;

    this.element = document.createElement('div');
    this.element.className = 'chart-container';
    this.element.style.position = 'relative';
    this.element.style.width = '100%';
    this.element.style.height = '100%';

    const canvas = document.createElement('canvas');
    canvas.id = id;
    this.element.appendChild(canvas);

    // Initialize chart
    setTimeout(() => {
      if (!window.Chart) {
        console.error('[ChartView] Chart.js is not loaded.');
        canvas.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'chart-fallback-ui flex flex-col items-center justify-center p-6 text-center text-muted rounded-lg border border-gray-700 h-full';
        fallback.style.minHeight = '180px';
        fallback.innerHTML = `
          <p class="text-sm font-medium">تعذر تحميل الرسوم البيانية</p>
          <p class="text-xs text-gray-400 mt-1">فشل تحميل مكتبة Chart.js من CDN</p>
        `;
        this.element.appendChild(fallback);
        return;
      }

      // If already initialized or element detached, abort
      if (this.chartInstance || !document.body.contains(this.element)) return;

      const ctx = canvas.getContext('2d');
      
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#9ca3af'
            }
          }
        },
        scales: type !== 'pie' && type !== 'doughnut' ? {
          x: {
            ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#6b7280' },
            grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() || '#374151' }
          },
          y: {
            ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#6b7280' },
            grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() || '#374151' }
          }
        } : {}
      };

      const mergedOptions = { ...defaultOptions, ...options };

      this.chartInstance = new window.Chart(ctx, {
        type,
        data,
        options: mergedOptions,
      });

    }, 0);

    return this.element;
  }

  // Used by parent to update data without re-rendering the whole canvas
  updateData(newData) {
    if (this.chartInstance) {
      this.chartInstance.data = newData;
      this.chartInstance.update();
    } else {
      // Not initialized yet, update props for when it mounts
      this.props.data = newData;
    }
  }

  destroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    super.destroy();
  }
}
