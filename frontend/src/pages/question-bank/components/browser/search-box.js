import { BaseComponent } from '../../../../core/component.js';

export class SearchBox extends BaseComponent {
  /**
   * @param {Object} props
   * @param {Function} props.onSearch - (text) => void
   * @param {string} [props.placeholder]
   * @param {string} [props.initialValue]
   */
  constructor(props) {
    super(props);
    this.onSearch = props.onSearch;
    this.placeholder = props.placeholder || 'ابحث...';
    this.initialValue = props.initialValue || '';
    this.timeout = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'relative w-full md:w-64';

    this.element.innerHTML = `
      <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
      <input type="text" placeholder="${this.placeholder}" value="${this.initialValue}" class="form-input w-full pl-3 pr-10 bg-gray-800 border-gray-700">
    `;

    const input = this.element.querySelector('input');
    input.addEventListener('input', (e) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.onSearch(e.target.value.trim());
      }, 300);
    });

    return this.element;
  }
}
