import { BaseComponent } from '../../core/component.js';
import { Breadcrumb } from '../../design-system/components/navigation/breadcrumb.js';
import { store } from '../../core/state-store.js';

export class QuestionBankLayout extends BaseComponent {
  constructor(props) {
    super(props);
    this.childView = props.childView;

    this.breadcrumb = new Breadcrumb({ items: [] });
    this.registerChild(this.breadcrumb);

    if (this.childView) {
      this.registerChild(this.childView);
    }

    // React to selection state changes to build breadcrumb dynamically
    this.onCleanup(store.subscribe('qbSelectedSubject', () => this._updateBreadcrumb()));
    this.onCleanup(store.subscribe('qbSelectedUnit', () => this._updateBreadcrumb()));
    this.onCleanup(store.subscribe('qbSelectedLesson', () => this._updateBreadcrumb()));
  }

  mount() {
    super.mount();
    this.breadcrumb.mount();
    if (this.childView && typeof this.childView.mount === 'function') {
      this.childView.mount();
    }
    this._updateBreadcrumb();
  }

  _updateBreadcrumb() {
    const items = [{ label: 'بنك الأسئلة', url: '/question-bank' }];
    
    const subject = store.get('qbSelectedSubject');
    if (subject) {
      items.push({ label: subject.name, url: `/question-bank/subjects/${subject.id}/units` });
    }

    const unit = store.get('qbSelectedUnit');
    if (unit) {
      items.push({ label: unit.name, url: `/question-bank/subjects/${subject?.id}/units/${unit.id}/lessons` });
    }

    const lesson = store.get('qbSelectedLesson');
    if (lesson) {
      items.push({ label: lesson.name, url: null });
    }

    // If the last item has a URL, remove it since we are currently on it
    if (items.length > 0) {
      items[items.length - 1].url = null;
    }

    this.breadcrumb.setItems(items);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'container mx-auto px-4 py-8 max-w-7xl animate-fade-in';

    this.element.innerHTML = `
      <div id="breadcrumb-slot" class="mb-4"></div>
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2" id="layout-title">بنك الأسئلة</h1>
          <p class="text-gray-400" id="layout-subtitle">تصفح المنهج الدراسي وإدارة المحتوى</p>
        </div>
        
        <div class="flex items-center gap-4 w-full md:w-auto">
          <button id="browse-questions-btn" class="btn border border-gray-600 text-white hover:bg-gray-800 transition-colors whitespace-nowrap">
            <i data-lucide="library" class="w-5 h-5 ml-2"></i> تصفح الأسئلة
          </button>
          <button class="btn btn-primary whitespace-nowrap">
            <i data-lucide="plus" class="w-5 h-5 ml-2"></i> إضافة
          </button>
        </div>
      </div>
      
      <div id="content-slot"></div>
    `;

    this.element.querySelector('#breadcrumb-slot').appendChild(this.breadcrumb.render());
    
    this.element.querySelector('#browse-questions-btn').addEventListener('click', () => {
      import('../../core/router.js').then(({ router }) => router.navigate('/question-bank/questions'));
    });
    
    if (this.childView) {
      this.element.querySelector('#content-slot').appendChild(this.childView.render());
    }

    return this.element;
  }
}
