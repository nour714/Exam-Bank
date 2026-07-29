import { BaseComponent } from '../../../core/component.js';
import { router } from '../../../core/router.js';

/**
 * Generic Breadcrumb Navigation.
 * Expects props.items as an array of { label: string, url: string|null }.
 */
export class Breadcrumb extends BaseComponent {
  /**
   * @param {Object} props
   * @param {Array<{label: string, url: string|null}>} props.items
   */
  constructor(props) {
    super(props);
    this.items = props.items || [];
  }

  setItems(items) {
    this.items = items;
    if (this._isMounted) {
      this._renderContent();
    }
  }

  render() {
    this.element = document.createElement('nav');
    this.element.className = 'flex text-sm text-gray-400 mb-6';
    this.element.setAttribute('aria-label', 'Breadcrumb');
    
    this._renderContent();
    return this.element;
  }

  _renderContent() {
    this.element.innerHTML = '';
    const ol = document.createElement('ol');
    ol.className = 'inline-flex items-center space-x-1 space-x-reverse md:space-x-3 md:space-x-reverse';

    this.items.forEach((item, index) => {
      const isLast = index === this.items.length - 1;
      const li = document.createElement('li');
      li.className = 'inline-flex items-center';

      let innerHtml = '';
      
      // Chevron separator for all but the first item
      if (index !== 0) {
        innerHtml += `<i data-lucide="chevron-left" class="w-4 h-4 mx-1"></i>`;
      }

      if (isLast || !item.url) {
        innerHtml += `<span class="text-white font-medium ms-1 md:ms-2">${item.label}</span>`;
      } else {
        innerHtml += `<a href="${item.url}" class="inline-flex items-center hover:text-white transition-colors cursor-pointer ms-1 md:ms-2">${item.label}</a>`;
      }

      li.innerHTML = innerHtml;

      if (!isLast && item.url) {
        const link = li.querySelector('a');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          router.navigate(item.url);
        });
      }

      ol.appendChild(li);
    });

    this.element.appendChild(ol);

    if (window.lucide) {
      window.lucide.createIcons({ root: this.element });
    }
  }
}
