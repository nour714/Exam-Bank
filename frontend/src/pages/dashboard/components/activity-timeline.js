import { BaseComponent } from '../../../core/component.js';
import { dashboardService } from '../../../services/dashboard.service.js';
import { eventBus } from '../../../core/event-bus.js';
import { measure } from '../../../core/observability.js';
import { StateMachine } from '../../../core/state-machine.js';

/**
 * ActivityTimeline — Independently fetches activity data.
 * Subscribes to dashboard.activity.updated for background refreshes.
 * Uses StateMachine for robust loading/error/empty/ready handling.
 */
export class ActivityTimeline extends BaseComponent {
  constructor(props = {}) {
    super(props);

    this.stateMachine = new StateMachine({
      initial: 'loading',
      onChange: (newState, oldState, data) => this._renderState(newState, data)
    });

    // Listen for background refresh
    this.onCleanup(
      eventBus.on('dashboard.activity.updated', (data) => {
        this._renderActivities(data);
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
    this.element.className = 'card p-6 h-full';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'النشاط الأخير');

    this.element.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold">النشاط الأخير</h3>
        <button class="text-sm text-blue-500 hover:text-blue-400" tabindex="0">عرض الكل</button>
      </div>
      <div id="timeline-content" class="relative">
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
    if (!this.stateMachine.is('ready')) this.stateMachine.transition('loading');
    
    try {
      const result = await measure('ActivityTimeline', 'api', () =>
        dashboardService.getActivity(force)
      );
      
      const activities = result.data;
      if (!activities || activities.length === 0) {
        this.stateMachine.transition('empty');
      } else {
        this.stateMachine.transition('ready', activities);
      }
    } catch (err) {
      console.error('[ActivityTimeline] Failed to load:', err);
      this.stateMachine.transition('error', err);
    }
  }

  _renderActivities(activities) {
    if (!activities || activities.length === 0) {
      this.stateMachine.transition('empty');
    } else {
      this.stateMachine.transition('ready', activities);
    }
  }

  _renderState(state, data) {
    if (!this.element || !document.body.contains(this.element)) return;

    const content = this.element.querySelector('#timeline-content');
    if (!content) return;

    if (state === 'loading') {
      content.innerHTML = this._skeletonHtml();
    } else if (state === 'empty') {
      content.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
          <p>لا توجد نشاطات حديثة</p>
        </div>
      `;
    } else if (state === 'error') {
      content.innerHTML = `
        <div class="text-center text-danger py-4">
          <p>تعذر تحميل النشاط الأخير</p>
          <button class="btn btn-sm btn-outline-danger mt-2" id="timeline-retry">إعادة المحاولة</button>
        </div>
      `;
      content.querySelector('#timeline-retry')?.addEventListener('click', () => this._loadData(true));
    } else if (state === 'ready') {
      this._buildTimelineList(content, data);
    }

    if (window.lucide) window.lucide.createIcons({ root: content });
  }

  _buildTimelineList(container, activities) {

    const iconMap = {
      'exam_completed': 'check-circle',
      'exam_started': 'play-circle',
      'achievement': 'award'
    };
    const colorMap = {
      'exam_completed': 'text-success bg-success/10',
      'exam_started': 'text-blue-500 bg-blue-500/10',
      'achievement': 'text-yellow-500 bg-yellow-500/10'
    };

    let html = '<div class="absolute right-5 top-0 bottom-0 w-px bg-gray-700"></div><ul class="space-y-6 relative" role="list">';

    activities.forEach(activity => {
      const icon = iconMap[activity.type] || 'circle';
      const color = colorMap[activity.type] || 'text-gray-400 bg-gray-800';

      html += `
        <li class="flex items-start" role="listitem">
          <div class="relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${color} me-4 shrink-0">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1">
            <p class="font-medium text-white text-sm">${activity.title}</p>
            <p class="text-gray-400 text-xs mt-1">${activity.description}</p>
            <span class="text-gray-500 text-xs mt-2 inline-block">${activity.time}</span>
          </div>
        </li>
      `;
    });

    html += '</ul>';
    container.innerHTML = html;
  }

  _skeletonHtml() {
    let html = '<div class="animate-pulse space-y-6">';
    for (let i = 0; i < 3; i++) {
      html += `
        <div class="flex items-start">
          <div class="rounded-full bg-gray-700 h-10 w-10 me-4 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  }
}
