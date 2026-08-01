import { BaseComponent } from '../../../../core/component.js';

export class QuestionList extends BaseComponent {
  /**
   * @param {Object} props
   * @param {import('../../../../core/selection-manager.js').SelectionManager} props.selectionManager
   * @param {Function} props.onItemClick
   */
  constructor(props) {
    super(props);
    this.selectionManager = props.selectionManager;
    this.onItemClick = props.onItemClick;
    this.onRestore = props.onRestore;
    this.items = [];
  }

  setItems(items) {
    this.items = items;
    if (this._isMounted) {
      this._renderItems();
    }
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'flex flex-col gap-4';
    this._renderItems();
    return this.element;
  }

  _renderItems() {
    this.element.innerHTML = '';
    
    // In the future, this loop can be replaced with a Virtual Scroller
    this.items.forEach(item => {
      const isSelected = this.selectionManager.isSelected(item.id);
      const isDeleted = item.deleted || item.status === 'deleted';
      
      const card = document.createElement('div');
      card.className = `p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${isSelected ? 'bg-primary/5 border-primary' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`;
      
      let badgeColor = item.difficulty === 'hard' ? 'red' : (item.difficulty === 'medium' ? 'orange' : 'green');
      let difficultyLabel = item.difficulty === 'hard' ? 'صعب' : (item.difficulty === 'medium' ? 'متوسط' : 'سهل');

      card.innerHTML = `
        <div class="flex flex-col pt-1">
          <input type="checkbox" class="form-checkbox text-primary bg-gray-900 border-gray-600 rounded" ${isSelected ? 'checked' : ''}>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-${badgeColor}-500/10 text-${badgeColor}-500 border border-${badgeColor}-500/20">
              ${difficultyLabel}
            </span>
            <span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
              ${item.type === 'multiple-choice' ? 'اختيار من متعدد' : 'سؤال مقالي'}
            </span>
            ${isDeleted ? `
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                محذوف (سلة المهملات - Deleted)
              </span>
            ` : ''}
          </div>
          <p class="text-white text-lg line-clamp-2">${item.content}</p>
          <div class="flex gap-2 mt-3 text-sm text-gray-400">
            ${(item.tags || []).map(tag => `<span class="opacity-70">#${tag}</span>`).join('')}
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${isDeleted ? `
            <button class="btn-restore-item btn bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/30 text-xs py-1 px-3 rounded-lg font-bold flex items-center gap-1" title="استعادة (Restore / استرجاع)">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> استعادة (Restore)
            </button>
          ` : `
            <button class="p-2 text-gray-400 hover:text-white transition-colors">
              <i data-lucide="more-vertical" class="w-5 h-5"></i>
            </button>
          `}
        </div>
      `;

      // Checkbox click
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectionManager.toggle(item.id);
      });

      // Restore button click
      const restoreBtn = card.querySelector('.btn-restore-item');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.onRestore) this.onRestore(item);
        });
      }

      // Card click
      card.addEventListener('click', () => {
        if (this.onItemClick) this.onItemClick(item);
      });

      this.element.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons({ root: this.element });
  }
}
