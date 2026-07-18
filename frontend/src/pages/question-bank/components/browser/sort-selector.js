import { BaseComponent } from '../../../../core/component.js';

export class SortSelector extends BaseComponent {
  /**
   * @param {Object} props
   * @param {import('../../../../core/sort-engine.js').SortEngine} props.sortEngine
   * @param {Array<{label: string, field: string, direction: string}>} props.options
   */
  constructor(props) {
    super(props);
    this.sortEngine = props.sortEngine;
    this.options = props.options || [
      { label: 'الأحدث', field: 'createdAt', direction: 'desc' },
      { label: 'الأقدم', field: 'createdAt', direction: 'asc' },
      { label: 'الأصعب', field: 'difficulty', direction: 'desc' },
      { label: 'الأسهل', field: 'difficulty', direction: 'asc' }
    ];
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'flex items-center gap-2';

    const currentSort = this.sortEngine.getCurrentSort();
    const currentValue = `${currentSort.field}|${currentSort.direction}`;

    this.element.innerHTML = `
      <i data-lucide="arrow-down-up" class="w-4 h-4 text-gray-400"></i>
      <select class="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer">
        ${this.options.map(opt => {
          const val = `${opt.field}|${opt.direction}`;
          return `<option value="${val}" ${currentValue === val ? 'selected' : ''} class="bg-gray-800">${opt.label}</option>`;
        }).join('')}
      </select>
    `;

    this.element.querySelector('select').addEventListener('change', (e) => {
      const [field, direction] = e.target.value.split('|');
      this.sortEngine.setSort(field, direction);
    });

    return this.element;
  }
}
