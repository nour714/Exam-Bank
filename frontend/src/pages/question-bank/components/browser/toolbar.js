import { BaseComponent } from '../../../../core/component.js';

export class Toolbar extends BaseComponent {
  /**
   * @param {Object} props
   * @param {import('../../../../core/selection-manager.js').SelectionManager} props.selectionManager
   * @param {Function} props.onAdd
   */
  constructor(props) {
    super(props);
    this.selectionManager = props.selectionManager;
    this.onAdd = props.onAdd;
    this.onGenerateAI = props.onGenerateAI;
    this.onTrashClick = props.onTrashClick;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'flex items-center justify-between mb-6';

    const selectedCount = this.selectionManager.selectedCount;

    let actionsHtml = '';
    if (selectedCount > 0) {
      actionsHtml = `
        <div class="flex items-center gap-4 bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20 animate-fade-in">
          <span class="font-bold">${selectedCount} محدد</span>
          <div class="w-px h-4 bg-primary/20"></div>
          <button class="hover:text-white transition-colors" title="إضافة للتقييم"><i data-lucide="plus-circle" class="w-5 h-5"></i></button>
          <button class="hover:text-white transition-colors" title="نقل"><i data-lucide="folder-output" class="w-5 h-5"></i></button>
          <button class="text-danger hover:text-red-400 transition-colors" title="حذف"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
          <button id="clear-selection-btn" class="hover:text-white transition-colors me-2" title="إلغاء التحديد"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="flex items-center gap-2 flex-wrap">
          ${this.onGenerateAI ? `
            <button id="generate-ai-btn" class="btn bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 transition-colors">
              <i data-lucide="sparkles" class="w-4 h-4 me-2"></i> توليد بالذكاء الاصطناعي
            </button>
          ` : ''}
          <button id="trash-btn" class="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors" title="الأسئلة المحذوفة (سلة المهملات)">
            <i data-lucide="trash-2" class="w-4 h-4 me-2"></i> سلة المهملات (المحذوفات)
          </button>
          <button id="add-btn" class="btn btn-primary">
            <i data-lucide="plus" class="w-5 h-5 me-2"></i> إضافة سؤال
          </button>
        </div>
      `;
    }

    this.element.innerHTML = `
      <div class="flex-1" id="toolbar-actions">
        ${actionsHtml}
      </div>
      <div id="toolbar-sort" class="me-4"></div>
    `;

    if (selectedCount > 0) {
      this.element.querySelector('#clear-selection-btn')?.addEventListener('click', () => {
        this.selectionManager.clear();
      });
    } else {
      this.element.querySelector('#add-btn')?.addEventListener('click', () => {
        if (this.onAdd) this.onAdd();
      });
      if (this.onGenerateAI) {
        this.element.querySelector('#generate-ai-btn')?.addEventListener('click', () => {
          this.onGenerateAI();
        });
      }
      if (this.onTrashClick) {
        this.element.querySelector('#trash-btn')?.addEventListener('click', () => {
          this.onTrashClick();
        });
      }
    }

    return this.element;
  }
}
