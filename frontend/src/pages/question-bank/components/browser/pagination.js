import { BaseComponent } from '../../../../core/component.js';

export class Pagination extends BaseComponent {
  /**
   * @param {Object} props
   * @param {Function} props.onLoadMore - () => void
   */
  constructor(props) {
    super(props);
    this.onLoadMore = props.onLoadMore;
    this.hasMore = false;
    this.isLoading = false;
  }

  setState({ hasMore, isLoading }) {
    this.hasMore = hasMore;
    this.isLoading = isLoading;
    if (this._isMounted) this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'mt-8 flex justify-center pb-8';

    if (!this.hasMore) {
      this.element.innerHTML = `<span class="text-gray-500 text-sm">نهاية القائمة</span>`;
      return this.element;
    }

    if (this.isLoading) {
      this.element.innerHTML = `
        <button disabled class="btn btn-secondary opacity-70 cursor-wait">
          <i data-lucide="loader" class="w-5 h-5 ms-2 animate-spin"></i> جاري التحميل...
        </button>
      `;
    } else {
      this.element.innerHTML = `
        <button id="load-more-btn" class="btn border border-gray-600 hover:bg-gray-800 text-white transition-colors">
          تحميل المزيد
        </button>
      `;
      this.element.querySelector('#load-more-btn').addEventListener('click', () => {
        if (this.onLoadMore) this.onLoadMore();
      });
    }

    if (window.lucide) window.lucide.createIcons({ root: this.element });
    return this.element;
  }
}
