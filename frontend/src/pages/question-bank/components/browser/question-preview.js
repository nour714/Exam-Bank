import { BaseComponent } from '../../../../core/component.js';
import { questionService } from '../../../../services/question.service.js';

export class QuestionPreview extends BaseComponent {
  /**
   * @param {Object} props
   * @param {Function} props.onClose
   * @param {Function} props.onEdit
   * @param {Function} props.onDuplicate
   * @param {Function} props.onDelete
   */
  constructor(props) {
    super(props);
    this.onClose = props.onClose;
    this.onEdit = props.onEdit;
    this.onDuplicate = props.onDuplicate;
    this.onDelete = props.onDelete;
    
    this.isOpen = false;
    this.isLoadingRich = false;
    this.question = null; // The basic search list item
    this.fullQuestion = null; // The hydrated rich payload
  }

  /**
   * Open the drawer with the initial search item (for optimistic display),
   * then fetch the rich content.
   */
  async open(item) {
    this.isOpen = true;
    this.question = item;
    this.fullQuestion = null;
    this.isLoadingRich = true;
    
    if (this._isMounted) this.render();

    try {
      this.fullQuestion = await questionService.getById(item.id);
    } catch (e) {
      console.error('[QuestionPreview] Failed to fetch rich content', e);
    } finally {
      this.isLoadingRich = false;
      if (this._isMounted && this.isOpen) this.render();
    }
  }

  close() {
    this.isOpen = false;
    this.question = null;
    this.fullQuestion = null;
    if (this._isMounted) this.render();
    if (this.onClose) this.onClose();
  }

  render() {
    if (!this.element) {
      this.element = document.createElement('div');
    }

    if (!this.isOpen || !this.question) {
      this.element.innerHTML = '';
      this.element.className = 'hidden';
      return this.element;
    }

    this.element.className = 'fixed inset-0 z-50 flex justify-end';

    const q = this.fullQuestion || this.question; // Use full if available, otherwise fallback to list item
    const badgeColor = q.difficulty === 'hard' ? 'red' : (q.difficulty === 'medium' ? 'orange' : 'green');
    const difficultyLabel = q.difficulty === 'hard' ? 'صعب' : (q.difficulty === 'medium' ? 'متوسط' : 'سهل');

    this.element.innerHTML = `
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" id="preview-backdrop"></div>
      
      <!-- Drawer Panel -->
      <div class="relative w-full max-w-2xl bg-gray-900 border-l border-gray-700 h-full shadow-2xl flex flex-col animate-slide-in-right transform transition-transform duration-300">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-800">
          <div class="flex items-center gap-3">
            <span class="px-2 py-1 rounded text-xs font-bold bg-${badgeColor}-500/10 text-${badgeColor}-500 border border-${badgeColor}-500/20">
              ${difficultyLabel}
            </span>
            <span class="px-2 py-1 rounded text-xs font-bold bg-gray-700 text-gray-300">
              ${q.type === 'multiple-choice' ? 'اختيار من متعدد' : 'سؤال مقالي'}
            </span>
            <span class="text-sm text-gray-400">ID: ${q.id}</span>
          </div>
          <button id="close-preview-btn" class="p-2 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          <!-- Basic Content (Instant) -->
          <div class="prose prose-invert max-w-none mb-8">
            <h3 class="text-xl font-bold text-white mb-4">نص السؤال</h3>
            ${q.richContent || `<p class="text-lg text-gray-300">${q.content}</p>`}
          </div>

          <!-- Progressive Loading State -->
          ${this.isLoadingRich ? `
            <div class="animate-pulse space-y-4 pt-4 border-t border-gray-800">
              <div class="h-4 bg-gray-800 rounded w-1/4"></div>
              <div class="h-10 bg-gray-800 rounded w-full"></div>
              <div class="h-10 bg-gray-800 rounded w-full"></div>
              <div class="h-10 bg-gray-800 rounded w-full"></div>
            </div>
          ` : ''}

          <!-- Rich Data: Options (Multiple Choice) -->
          ${q.options && !this.isLoadingRich ? `
            <div class="mb-8 pt-6 border-t border-gray-800">
              <h4 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">الخيارات</h4>
              <div class="space-y-3">
                ${q.options.map(opt => `
                  <div class="flex items-center gap-3 p-4 rounded-xl border ${opt.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-300'}">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center border ${opt.isCorrect ? 'bg-green-500 text-white border-green-500' : 'bg-gray-700 border-gray-600'}">
                      ${opt.isCorrect ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                    </div>
                    <span class="flex-1 font-medium">${opt.text}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Rich Data: Explanation -->
          ${q.explanation && !this.isLoadingRich ? `
            <div class="mb-8 pt-6 border-t border-gray-800">
              <h4 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">الشرح والإجابة النموذجية</h4>
              <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200">
                ${q.explanation}
              </div>
            </div>
          ` : ''}

          <!-- Rich Data: Metadata Tags -->
          ${!this.isLoadingRich ? `
            <div class="pt-6 border-t border-gray-800">
              <div class="flex flex-wrap gap-2 text-sm text-gray-400">
                ${(q.tags || []).map(tag => `<span class="px-2 py-1 bg-gray-800 rounded-md">#${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-gray-800 bg-gray-800/30 flex justify-between items-center">
            <button id="view-details-btn" class="btn text-gray-300 hover:text-white hover:bg-gray-800 text-sm">
              <i data-lucide="external-link" class="w-4 h-4 me-2"></i> التفاصيل الكاملة
            </button>
            <button id="delete-btn" class="btn text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm">
              <i data-lucide="trash-2" class="w-4 h-4 me-2"></i> حذف
            </button>
            <div class="flex-1"></div>
            <button id="duplicate-btn" class="btn text-gray-300 hover:text-white hover:bg-gray-800 text-sm">
              <i data-lucide="copy" class="w-4 h-4 me-2"></i> تكرار
            </button>
            <button id="edit-btn" class="btn btn-primary text-sm">
              <i data-lucide="edit-2" class="w-4 h-4 me-2"></i> تعديل
            </button>
          </div>
        </div>
      </div>
    `;

    // Listeners
    this.element.querySelector('#preview-backdrop').addEventListener('click', () => this.close());
    this.element.querySelector('#close-preview-btn').addEventListener('click', () => this.close());
    
    this.element.querySelector('#view-details-btn').addEventListener('click', () => {
      // Use router to navigate to details page
      window.router.navigate(`/question-bank/questions/${q.id}`);
      this.close();
    });

    this.element.querySelector('#edit-btn').addEventListener('click', () => {
      if (this.onEdit) this.onEdit(q);
    });
    this.element.querySelector('#duplicate-btn').addEventListener('click', () => {
      if (this.onDuplicate) this.onDuplicate(q);
    });
    this.element.querySelector('#delete-btn').addEventListener('click', () => {
      if (this.onDelete) this.onDelete(q);
    });

    if (window.lucide) window.lucide.createIcons({ root: this.element });
    return this.element;
  }
}
