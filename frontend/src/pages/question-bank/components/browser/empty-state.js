import { BaseComponent } from '../../../../core/component.js';

export class EmptyState extends BaseComponent {
  render() {
    this.element = document.createElement('div');
    this.element.className = 'flex flex-col items-center justify-center py-20';
    this.element.style.color = 'var(--text-muted)';

    this.element.innerHTML = `
      <i data-lucide="search-x" class="w-16 h-16 mb-4 opacity-50"></i>
      <h3 class="text-xl mb-2 font-bold" style="color: var(--text-primary);">لم يتم العثور على نتائج</h3>
      <p>لا توجد أسئلة تطابق معايير البحث الحالية. جرب تغيير عوامل التصفية.</p>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.element });
    return this.element;
  }
}
