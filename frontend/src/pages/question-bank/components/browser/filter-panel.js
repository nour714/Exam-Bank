import { BaseComponent } from '../../../../core/component.js';

export class FilterPanel extends BaseComponent {
  /**
   * @param {Object} props
   * @param {import('../../../../core/filter-engine.js').FilterEngine} props.filterEngine
   */
  constructor(props) {
    super(props);
    this.filterEngine = props.filterEngine;
    this.isExpanded = false; // toggle for mobile or collapsible groups
  }

  _getLabelForValue(def, value) {
    if (def.type === 'select' && def.options) {
      const opt = def.options.find(o => o.value === value);
      return opt ? opt.label : value;
    }
    return value;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'mb-6';

    const { schema } = this.filterEngine;
    const activeFilters = this.filterEngine.getActiveFilters();
    const activeCount = Object.keys(activeFilters).length;

    // Build the Groups
    const groups = {
      curriculum: { label: 'المنهج', defs: [] },
      attributes: { label: 'خصائص السؤال', defs: [] },
      meta: { label: 'بيانات إضافية', defs: [] }
    };

    schema.forEach(def => {
      const g = def.group || 'meta';
      if (!groups[g]) groups[g] = { label: 'أخرى', defs: [] };
      groups[g].defs.push(def);
    });

    let groupsHtml = '';
    for (const [key, group] of Object.entries(groups)) {
      if (group.defs.length === 0) continue;
      
      groupsHtml += `
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-400 mb-2">${group.label}</h4>
          <div class="flex flex-wrap gap-4">
      `;

      group.defs.forEach(def => {
        const value = activeFilters[def.id] || '';
        if (def.type === 'select') {
          groupsHtml += `
            <div class="flex flex-col gap-1 w-full sm:w-auto">
              <label class="text-xs text-gray-500">${def.label}</label>
              <select data-filter-id="${def.id}" class="form-select bg-gray-800 border-gray-700 text-sm py-1.5 pl-3 pr-8 rounded-lg">
                <option value="all">الكل</option>
                ${def.options.map(opt => `
                  <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>
                `).join('')}
              </select>
            </div>
          `;
        } else if (def.type === 'text') {
          groupsHtml += `
            <div class="flex flex-col gap-1 w-full sm:w-auto">
              <label class="text-xs text-gray-500">${def.label}</label>
              <input type="text" data-filter-id="${def.id}" value="${value}" placeholder="بحث..." class="form-input bg-gray-800 border-gray-700 text-sm py-1.5 px-3 rounded-lg">
            </div>
          `;
        }
      });

      groupsHtml += `</div></div>`;
    }

    // Build Active Chips
    let chipsHtml = '';
    for (const [id, value] of Object.entries(activeFilters)) {
      const def = schema.find(d => d.id === id);
      if (!def) continue;

      const displayValue = this._getLabelForValue(def, value);
      chipsHtml += `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm">
          ${def.label}: ${displayValue}
          <button data-clear-id="${id}" class="hover:text-white transition-colors ms-1">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </span>
      `;
    }

    // Render Full Layout
    this.element.innerHTML = `
      <div class="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
        <!-- Header / Toggle -->
        <div class="flex justify-between items-center cursor-pointer select-none" id="filter-toggle-btn">
          <div class="flex items-center gap-2">
            <i data-lucide="filter" class="w-5 h-5 text-gray-400"></i>
            <span class="font-bold text-white">تصفية متقدمة</span>
            ${activeCount > 0 ? `<span class="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">${activeCount}</span>` : ''}
          </div>
          <div class="flex items-center gap-4">
            ${activeCount > 0 ? `
              <button id="clear-all-filters-btn" class="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 z-10" onclick="event.stopPropagation()">
                مسح الكل
              </button>
            ` : ''}
            <i data-lucide="${this.isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-5 h-5 text-gray-400"></i>
          </div>
        </div>

        <!-- Active Chips Row -->
        ${activeCount > 0 && !this.isExpanded ? `
          <div class="flex flex-wrap gap-2 mt-3 animate-fade-in">
            ${chipsHtml}
          </div>
        ` : ''}

        <!-- Expanded Panel -->
        <div class="mt-4 pt-4 border-t border-gray-700/50 ${this.isExpanded ? 'block animate-fade-in' : 'hidden'}">
          ${groupsHtml}
          
          <!-- Chips inside expanded view too -->
          ${activeCount > 0 ? `
            <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700/50">
              ${chipsHtml}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Listeners
    this.element.querySelector('#filter-toggle-btn').addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render();
    });

    this.element.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        const id = e.target.getAttribute('data-filter-id');
        if (val === 'all') {
          this.filterEngine.removeFilter(id);
        } else {
          this.filterEngine.setFilter(id, val);
        }
      });
    });

    // Handle text input filters (debounce)
    this.element.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const val = e.target.value.trim();
        const id = e.target.getAttribute('data-filter-id');
        if (!val) {
          this.filterEngine.removeFilter(id);
        } else {
          this.filterEngine.setFilter(id, val);
        }
      });
    });

    this.element.querySelectorAll('[data-clear-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.filterEngine.removeFilter(e.currentTarget.getAttribute('data-clear-id'));
      });
    });

    this.element.querySelector('#clear-all-filters-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filterEngine.clearFilters();
    });

    if (window.lucide) window.lucide.createIcons({ root: this.element });
    return this.element;
  }
}
