import { BaseComponent } from '../../core/component.js';
import { questionService } from '../../services/question.service.js';
import { StateMachine } from '../../core/state-machine.js';
import { store } from '../../core/state-store.js';
import { ErrorBoundary } from '../../core/error-boundary.js';
import { QuestionBankLayout } from './layout.js';

// Engines
import { FilterEngine } from '../../core/filter-engine.js';
import { SortEngine } from '../../core/sort-engine.js';
import { SelectionManager } from '../../core/selection-manager.js';
import { CriteriaBuilder } from '../../core/criteria-builder.js';

// Components
import { SearchBox } from './components/browser/search-box.js';
import { Toolbar } from './components/browser/toolbar.js';
import { FilterPanel } from './components/browser/filter-panel.js';
import { SortSelector } from './components/browser/sort-selector.js';
import { QuestionList } from './components/browser/question-list.js';
import { Pagination } from './components/browser/pagination.js';
import { EmptyState } from './components/browser/empty-state.js';
import { QuestionPreview } from './components/browser/question-preview.js';

class BrowserContent extends BaseComponent {
  constructor(props) {
    super(props);

    // Hydrate initial state from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hydratedCriteria = new CriteriaBuilder().fromURLSearchParams(urlParams).build();

    // 1. Initialize Core Engines
    this.selectionManager = new SelectionManager({ multi: true });
    
    this.filterEngine = new FilterEngine({
      schema: [
        { id: 'subjectId', label: 'المادة', type: 'select', group: 'curriculum', options: [
          { value: 'math', label: 'الرياضيات' },
          { value: 'physics', label: 'الفيزياء' }
        ]},
        { id: 'unitId', label: 'الوحدة', type: 'select', group: 'curriculum', options: [
          { value: 'unit1', label: 'الوحدة 1' },
          { value: 'unit2', label: 'الوحدة 2' }
        ]},
        { id: 'lessonId', label: 'الدرس', type: 'select', group: 'curriculum', options: [
          { value: 'lesson1', label: 'الدرس 1' }
        ]},
        { id: 'difficulty', label: 'الصعوبة', type: 'select', group: 'attributes', options: [
          { value: 'easy', label: 'سهل' },
          { value: 'medium', label: 'متوسط' },
          { value: 'hard', label: 'صعب' }
        ]},
        { id: 'type', label: 'نوع السؤال', type: 'select', group: 'attributes', options: [
          { value: 'multiple-choice', label: 'اختيار من متعدد' },
          { value: 'open-ended', label: 'مقال' }
        ]},
        { id: 'tags', label: 'الوسوم', type: 'text', group: 'attributes' },
        { id: 'source', label: 'المصدر', type: 'select', group: 'meta', options: [
          { value: 'internal', label: 'داخلي' },
          { value: 'ministry', label: 'الوزارة' },
          { value: 'external', label: 'خارجي' }
        ]},
        { id: 'status', label: 'الحالة', type: 'select', group: 'meta', options: [
          { value: 'draft', label: 'مسودة' },
          { value: 'published', label: 'منشور' },
          { value: 'archived', label: 'مؤرشف' },
          { value: 'deleted', label: 'المحذوفات (سلة المهملات - Deleted)' }
        ]},
        { id: 'dateRange', label: 'نطاق التاريخ', type: 'select', group: 'meta', options: [
          { value: 'today', label: 'اليوم' },
          { value: 'week', label: 'هذا الأسبوع' },
          { value: 'month', label: 'هذا الشهر' }
        ]}
      ],
      onChange: () => this.executeSearch(true)
    });

    // Hydrate FilterEngine
    for (const [key, val] of Object.entries(hydratedCriteria.filters)) {
      this.filterEngine.setFilter(key, val);
    }

    this.sortEngine = new SortEngine({
      defaultField: hydratedCriteria.sort.field,
      defaultDirection: hydratedCriteria.sort.direction,
      onChange: () => this.executeSearch(true)
    });

    this.stateMachine = new StateMachine({
      initial: 'loading',
      onChange: (newState) => this._renderState(newState)
    });

    // 2. State
    this.searchText = hydratedCriteria.q || '';
    this.items = [];
    this.nextCursor = hydratedCriteria.cursor || null;

    // 3. Initialize UI Components
    this.searchBox = new SearchBox({
      initialValue: this.searchText,
      onSearch: (text) => {
        this.searchText = text;
        this.executeSearch(true);
      }
    });

    this.aiGeneratorModal = new AIGeneratorModal({});

    this.toolbar = new Toolbar({
      selectionManager: this.selectionManager,
      onAdd: () => {
        window.router.navigate('/question-bank/questions/editor');
      },
      onGenerateAI: () => {
        this.aiGeneratorModal.open();
      },
      onTrashClick: () => {
        this.filterEngine.setFilter('status', 'deleted');
      }
    });

    this.filterPanel = new FilterPanel({ filterEngine: this.filterEngine });
    this.sortSelector = new SortSelector({ sortEngine: this.sortEngine });
    
    this.questionList = new QuestionList({ 
      selectionManager: this.selectionManager,
      onItemClick: (item) => this._openPreview(item),
      onRestore: async (q) => {
        try {
          await questionService.restore(q.id);
          this.executeSearch(true);
        } catch (e) {
          console.error('Restore failed', e);
        }
      }
    });

    this.pagination = new Pagination({
      onLoadMore: () => this.executeSearch(false)
    });

    this.emptyState = new EmptyState();

    this.questionPreview = new QuestionPreview({
      onClose: () => this._closePreview(),
      onEdit: (q) => {
        this._closePreview();
        window.router.navigate(`/question-bank/questions/editor/${q.id}`);
      },
      onDuplicate: async (q) => {
        if (confirm('هل أنت متأكد من تكرار هذا السؤال؟')) {
          try {
            const { id, ...rest } = q;
            await questionService.create(rest);
            // Refresh list
            this.executeSearch(true);
            this._closePreview();
          } catch (e) {
            console.error('Duplicate failed', e);
          }
        }
      },
      onDelete: async (q) => {
        if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
          try {
            await questionService.delete(q.id);
            this.executeSearch(true);
            this._closePreview();
          } catch (e) {
            console.error('Delete failed', e);
          }
        }
      },
      onRestore: async (q) => {
        if (confirm('هل أنت متأكد من استعادة هذا السؤال المحذوف؟')) {
          try {
            await questionService.restore(q.id);
            this.executeSearch(true);
            this._closePreview();
          } catch (e) {
            console.error('Restore failed', e);
          }
        }
      }
    });

    // Register children
    [this.searchBox, this.toolbar, this.filterPanel, this.sortSelector, this.questionList, this.pagination, this.emptyState, this.questionPreview, this.aiGeneratorModal].forEach(c => this.registerChild(c));

    // Re-render toolbar when selection changes
    this.onCleanup(this.selectionManager.subscribe(() => {
      if (this.toolbar._isMounted) this.toolbar.render();
      if (this.questionList._isMounted) this.questionList.render(); 
    }));
  }

  mount() {
    super.mount();
    this.executeSearch(true, true); 
  }

  // Helper to sync the query string without reloading
  _updateUrl(builder, previewId) {
    const newUrl = new URL(window.location.href);
    newUrl.search = builder.toURLSearchParams().toString();
    if (previewId) {
      newUrl.searchParams.set('preview', previewId);
    } else {
      newUrl.searchParams.delete('preview');
    }
    window.history.replaceState(null, '', newUrl.toString());
  }

  async executeSearch(reset = false, isInitialMount = false) {
    if (reset) {
      this.items = [];
      this.nextCursor = isInitialMount ? this.nextCursor : null;
      this.selectionManager.clear();
      this.stateMachine.transition('loading');
    } else {
      this.pagination.setState({ hasMore: true, isLoading: true });
    }

    try {
      const builder = new CriteriaBuilder()
        .withFilters(this.filterEngine.getActiveFilters())
        .withSort(this.sortEngine.getCurrentSort())
        .withSearchText(this.searchText)
        .withCursor(this.nextCursor);

      // Sync builder state to URL
      const currentPreview = new URLSearchParams(window.location.search).get('preview');
      this._updateUrl(builder, currentPreview);

      // Fetch
      const searchCriteria = builder.withFilters({
          ...this.filterEngine.getActiveFilters(),
          subjectId: store.get('qbSelectedSubject')?.id || null,
          unitId: store.get('qbSelectedUnit')?.id || null,
          lessonId: store.get('qbSelectedLesson')?.id || null
      }).build();

      const res = await questionService.search(searchCriteria);
      
      this.items = reset ? res.data : [...this.items, ...res.data];
      this.nextCursor = res.nextCursor;
      
      this.pagination.setState({ hasMore: res.hasMore, isLoading: false });

      if (this.items.length === 0) {
        this.stateMachine.transition('empty');
      } else {
        this.questionList.setItems(this.items);
        this.stateMachine.transition('ready');
        
        // Handle initial preview deep link
        if (isInitialMount && currentPreview) {
          const item = this.items.find(i => i.id === currentPreview);
          if (item) this._openPreview(item);
          else {
            // If the item wasn't in the initial page, we still need to fetch it
            this._openPreview({ id: currentPreview, content: '...', difficulty: 'medium', type: 'multiple-choice' });
          }
        }
      }

    } catch (err) {
      console.error('[QuestionBrowser] Search failed', err);
      if (reset) {
        this.stateMachine.transition('error');
      } else {
        this.pagination.setState({ hasMore: true, isLoading: false }); 
      }
    }
  }

  _openPreview(item) {
    if (!this.questionPreview) return; // not initialized yet
    
    // Sync URL
    const builder = new CriteriaBuilder()
      .withFilters(this.filterEngine.getActiveFilters())
      .withSort(this.sortEngine.getCurrentSort())
      .withSearchText(this.searchText)
      .withCursor(this.nextCursor);
    this._updateUrl(builder, item.id);

    this.questionPreview.open(item);
  }

  _closePreview() {
    // Sync URL
    const builder = new CriteriaBuilder()
      .withFilters(this.filterEngine.getActiveFilters())
      .withSort(this.sortEngine.getCurrentSort())
      .withSearchText(this.searchText)
      .withCursor(this.nextCursor);
    this._updateUrl(builder, null);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'question-browser flex flex-col gap-4 animate-fade-in';
    this._renderState(this.stateMachine.state);
    return this.element;
  }

  _renderState(state) {
    if (!this.element || !document.body.contains(this.element)) return;

    this.element.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <div id="search-slot" class="flex-1 max-w-md"></div>
        <div id="sort-slot"></div>
      </div>
      <div id="filter-slot"></div>
      <div id="toolbar-slot"></div>
      <div id="content-slot" class="min-h-[400px]"></div>
      <div id="pagination-slot"></div>
      <div id="preview-slot"></div>
      <div id="ai-modal-slot"></div>
    `;

    this.element.querySelector('#search-slot').appendChild(this.searchBox.render());
    this.element.querySelector('#sort-slot').appendChild(this.sortSelector.render());
    this.element.querySelector('#filter-slot').appendChild(this.filterPanel.render());
    this.element.querySelector('#toolbar-slot').appendChild(this.toolbar.render());
    this.element.querySelector('#pagination-slot').appendChild(this.pagination.render());
    this.element.querySelector('#preview-slot').appendChild(this.questionPreview.render());
    this.element.querySelector('#ai-modal-slot').appendChild(this.aiGeneratorModal.render());

    const contentSlot = this.element.querySelector('#content-slot');

    if (state === 'loading') {
      contentSlot.innerHTML = this._skeletonHtml();
    } else if (state === 'empty') {
      contentSlot.appendChild(this.emptyState.render());
    } else if (state === 'error') {
      contentSlot.innerHTML = `
        <div class="text-danger p-8 text-center bg-gray-800/50 rounded-xl">
          <i data-lucide="alert-triangle" class="w-12 h-12 mx-auto mb-4"></i>
          <p>تعذر تحميل الأسئلة. الرجاء المحاولة لاحقاً.</p>
        </div>
      `;
    } else if (state === 'ready') {
      contentSlot.appendChild(this.questionList.render());
    }

    if (window.lucide) window.lucide.createIcons({ root: this.element });
  }

  _skeletonHtml() {
    return Array(5).fill(`
      <div class="p-4 rounded-xl border border-gray-700 bg-gray-800 animate-pulse flex gap-4 mb-4">
        <div class="w-4 h-4 bg-gray-700 rounded mt-1"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
          <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    `).join('');
  }
}

export default class QuestionsPage extends BaseComponent {
  constructor(props) {
    super(props);
    const browser = new BrowserContent();
    const boundary = new ErrorBoundary({ child: browser, fallbackMessage: 'تعذر تحميل المتصفح.' });
    
    // The layout provides the shell (breadcrumb, title). We don't use layout's search bar here,
    // we use the Browser's specific search box.
    this.layout = new QuestionBankLayout({ childView: boundary });
    this.registerChild(this.layout);
  }

  render() {
    return this.layout.render();
  }
  
  mount() {
    super.mount();
    this.layout.mount();
  }
}
