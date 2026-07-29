import { BaseComponent } from '../../core/component.js';
import { eventBus } from '../../core/event-bus.js';
import { measure } from '../../core/observability.js';
import { widgetRegistry } from '../../core/widget-registry.js';
import { ErrorBoundary } from '../../core/error-boundary.js';

// Import widgets to register them (in a real app, this might happen in a separate bootstrap file)
import { WelcomeCard } from './components/welcome-card.js';
import { StatsRow } from './components/stats-row.js';
import { QuickActions } from './components/quick-actions.js';
import { PerformanceChart } from './components/performance-chart.js';
import { ActivityTimeline } from './components/activity-timeline.js';
import { RecentExams } from './components/recent-exams.js';

// Register default widgets
widgetRegistry.register('dashboard', 'welcome', WelcomeCard, { order: 1 });
widgetRegistry.register('dashboard', 'actions', QuickActions, { order: 2 });
widgetRegistry.register('dashboard', 'stats', StatsRow, { order: 3 });
widgetRegistry.register('dashboard', 'chart', PerformanceChart, { order: 4 });
widgetRegistry.register('dashboard', 'exams', RecentExams, { order: 5 });
widgetRegistry.register('dashboard', 'timeline', ActivityTimeline, { order: 6 });

/**
 * DashboardPage — Pure composition layer dynamically using WidgetRegistry.
 */
export default class DashboardPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.widgetBoundaries = [];

    const widgets = widgetRegistry.getWidgets('dashboard');
    widgets.forEach(({ componentClass }) => {
      const widgetInstance = new componentClass();
      const boundary = new ErrorBoundary({ child: widgetInstance, fallbackMessage: 'تعذر تحميل هذه الأداة' });
      this.widgetBoundaries.push(boundary);
      this.registerChild(boundary);
    });
  }

  render() {
    return measure('DashboardPage', 'render', () => {
      this.element = document.createElement('div');
      this.element.className = 'dashboard-page container mx-auto px-4 py-8 max-w-7xl';
      this.element.style.animation = 'fadeIn 0.4s ease-out';

      this.element.innerHTML = `
        <div class="flex flex-col gap-8">
          <div id="slot-0"></div>
          <div id="slot-1"></div>
          <div id="slot-2"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 flex flex-col gap-6">
              <div id="slot-3"></div>
              <div id="slot-4"></div>
            </div>
            <div class="lg:col-span-1">
              <div id="slot-5" class="h-full"></div>
            </div>
          </div>
        </div>
      `;

      // Mount boundaries into slots dynamically
      this.widgetBoundaries.forEach((boundary, index) => {
        const slot = this.element.querySelector(`#slot-${index}`);
        if (slot) {
          slot.appendChild(boundary.render());
        }
      });

      return this.element;
    });
  }

  mount() {
    super.mount();
    this.widgetBoundaries.forEach(boundary => boundary.mount());
  }
}
