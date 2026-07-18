import { BaseComponent } from '../../../../core/component.js';

export class StatisticCard extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { title, value, icon, trend, trendLabel, colorClass = 'text-primary-color', bgClass = 'bg-primary-color/10' } = this.props;
    
    this.element = document.createElement('div');
    this.element.className = 'card stat-card p-6';

    let trendHtml = '';
    if (trend) {
      const isPositive = trend > 0;
      const trendColor = isPositive ? 'text-success' : 'text-danger';
      const trendIcon = isPositive ? 'trending-up' : 'trending-down';
      trendHtml = `
        <div class="mt-4 flex items-center text-sm">
          <i data-lucide="${trendIcon}" class="${trendColor} w-4 h-4 ml-1"></i>
          <span class="${trendColor} font-bold ml-2">${Math.abs(trend)}%</span>
          <span class="text-gray-400">${trendLabel || 'منذ الشهر الماضي'}</span>
        </div>
      `;
    }

    this.element.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <p class="text-gray-400 text-sm font-medium mb-1">${title}</p>
          <h3 class="text-2xl font-bold text-white">${value}</h3>
        </div>
        <div class="p-3 rounded-xl ${bgClass} ${colorClass}">
          <i data-lucide="${icon}" class="w-6 h-6"></i>
        </div>
      </div>
      ${trendHtml}
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    return this.element;
  }
}
