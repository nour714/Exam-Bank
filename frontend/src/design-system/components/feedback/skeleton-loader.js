import { BaseComponent } from '../../../core/component.js';

export class SkeletonLoader extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { type = 'text', count = 1, className = '' } = this.props;

    this.element = document.createElement('div');
    this.element.className = 'animate-pulse space-y-4';

    let html = '';
    for (let i = 0; i < count; i++) {
      if (type === 'text') {
        html += `<div class="h-4 bg-gray-700 rounded w-3/4 ${className}"></div>`;
      } else if (type === 'card') {
        html += `
          <div class="card p-6 ${className}">
            <div class="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div class="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-1/4 mt-4"></div>
          </div>
        `;
      } else if (type === 'avatar-text') {
        html += `
          <div class="flex items-center space-x-4 space-x-reverse ${className}">
            <div class="rounded-full bg-gray-700 h-10 w-10"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        `;
      }
    }

    this.element.innerHTML = html;
    return this.element;
  }
}
