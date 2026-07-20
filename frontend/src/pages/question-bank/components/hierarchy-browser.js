import { BaseComponent } from '../../../core/component.js';
import { StateMachine } from '../../../core/state-machine.js';
import { measure } from '../../../core/observability.js';
import { eventBus } from '../../../core/event-bus.js';

/**
 * Generic Hierarchical Browser
 * 
 * Renders any collection of educational entities conforming to the stable contract:
 * { id, name, slug, parentId, childrenCount, order, icon, color, metadata }
 * 
 * The component never knows what entity type it is rendering — Subjects, Units,
 * Lessons, Chapters, Topics, or Sections are all treated identically.
 * 
 * Supports:
 *  - Prefetch on hover via props.prefetchFn
 *  - Optimistic navigation via immediate state update + router.navigate
 *  - Background refresh via EventBus
 */
export class HierarchyBrowser extends BaseComponent {
  /**
   * @param {Object} props
   * @param {Function} props.fetchFn        - Async: (force) => { data: Entity[] }
   * @param {Function} props.onSelect       - (item) => void
   * @param {Function} [props.prefetchFn]   - (item) => void — called on hover to warm the cache
   * @param {string}   [props.emptyMessage] - Text when no items exist
   * @param {string}   [props.childLabel]   - Label for childrenCount (e.g. 'وحدات', 'دروس')
   * @param {string}   [props.updateEventName] - EventBus event for live refresh
   */
  constructor(props) {
    super(props);
    this.fetchFn = props.fetchFn;
    this.onSelect = props.onSelect;
    this.prefetchFn = props.prefetchFn || null;
    this.emptyMessage = props.emptyMessage || 'لا توجد بيانات متاحة.';
    this.childLabel = props.childLabel || 'عناصر';
    
    this.stateMachine = new StateMachine({
      initial: 'loading',
      onChange: (newState, oldState, data) => this._renderState(newState, data)
    });

    // Optional: listen for background refreshes
    if (props.updateEventName) {
      this.onCleanup(
        eventBus.on(props.updateEventName, (data) => {
          if (!this.stateMachine.is('error')) {
            this._renderState('ready', data);
          }
        })
      );
    }
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'hierarchy-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in';
    return this.element;
  }

  mount() {
    super.mount();
    this.loadData();
  }

  async loadData(force = false) {
    if (!this.stateMachine.is('ready')) this.stateMachine.transition('loading');
    
    try {
      const result = await measure('HierarchyBrowser', 'api', () => this.fetchFn(force));
      const items = result.data;
      
      if (!items || items.length === 0) {
        this.stateMachine.transition('empty');
      } else {
        // Respect the entity contract: sort by order
        const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
        this.stateMachine.transition('ready', sorted);
      }
    } catch (err) {
      console.error('[HierarchyBrowser] Failed to load data:', err);
      this.stateMachine.transition('error', err);
    }
  }

  _renderState(state, items) {
    if (!this.element || !document.body.contains(this.element)) return;

    this.element.innerHTML = '';
    
    if (state === 'loading') {
      this.element.innerHTML = this._skeletonHtml();
    } else if (state === 'empty') {
      this.element.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
          <i data-lucide="folder-open" class="w-16 h-16 mb-4 opacity-50"></i>
          <h3 class="text-xl mb-2 font-bold text-white">${this.emptyMessage}</h3>
        </div>
      `;
    } else if (state === 'error') {
      this.element.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-danger">
          <i data-lucide="alert-circle" class="w-16 h-16 mb-4"></i>
          <h3 class="text-xl mb-4 font-bold text-white">حدث خطأ أثناء تحميل البيانات</h3>
          <button class="btn btn-primary" id="retry-btn">
            <i data-lucide="refresh-cw" class="w-4 h-4 ml-2"></i> إعـادة المحاولة
          </button>
        </div>
      `;
      this.element.querySelector('#retry-btn')?.addEventListener('click', () => this.loadData(true));
    } else if (state === 'ready') {
      this._renderCards(items);
    }

    if (window.lucide) {
      window.lucide.createIcons({ root: this.element });
    }
  }

  _renderCards(items) {
    items.forEach(item => {
      const color = item.color || 'blue';
      const icon = item.icon || 'folder';
      const questionCount = item.metadata?.questionCount;
      
      const card = document.createElement('div');
      card.className = `card p-6 border border-gray-700 hover:border-${color}-500 transition-all cursor-pointer group`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      
      // Build stats from the stable contract
      let statsHtml = '';
      if (item.childrenCount > 0) {
        statsHtml += `
          <div class="flex items-center gap-1">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>${item.childrenCount} ${this.childLabel}</span>
          </div>
        `;
      }
      if (questionCount != null) {
        statsHtml += `
          <div class="flex items-center gap-1">
            <i data-lucide="help-circle" class="w-4 h-4"></i>
            <span>${questionCount} سؤال</span>
          </div>
        `;
      }

      // Show chevron only if this entity has children (not a leaf node)
      const chevronHtml = item.childrenCount > 0 ? `
        <div class="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white transition-colors">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </div>
      ` : '';

      card.innerHTML = `
        <div class="flex items-center justify-between mb-6">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform">
            <i data-lucide="${icon}" class="w-6 h-6"></i>
          </div>
          ${chevronHtml}
        </div>
        <h3 class="text-lg font-bold text-white mb-2">${item.name}</h3>
        <div class="flex items-center gap-4 text-sm text-gray-400 mt-4">
          ${statsHtml}
        </div>
      `;
      
      // Optimistic navigation: update state immediately, then navigate
      const selectAction = () => this.onSelect(item);
      card.addEventListener('click', selectAction);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectAction(); });
      
      // Prefetch on hover (immediate next level only)
      if (this.prefetchFn) {
        let prefetched = false;
        const doPrefetch = () => {
          if (!prefetched) {
            prefetched = true;
            this.prefetchFn(item);
          }
        };
        card.addEventListener('mouseenter', doPrefetch);
        card.addEventListener('touchstart', doPrefetch, { passive: true });
      }
      
      this.element.appendChild(card);
    });
  }

  _skeletonHtml() {
    return Array(8).fill(`
      <div class="card p-6 animate-pulse">
        <div class="w-12 h-12 bg-gray-700 rounded-xl mb-6"></div>
        <div class="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div class="flex gap-4">
          <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          <div class="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    `).join('');
  }
}
