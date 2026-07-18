import { BaseComponent } from '../../core/component.js';
import { curriculumService } from '../../services/curriculum.service.js';
import { HierarchyBrowser } from './components/hierarchy-browser.js';
import { QuestionBankLayout } from './layout.js';
import { ErrorBoundary } from '../../core/error-boundary.js';
import { store } from '../../core/state-store.js';
import { router } from '../../core/router.js';

export default class SubjectsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    
    // Clear all downstream selections — we are at root
    store.set('qbSelectedSubject', null);
    store.set('qbSelectedUnit', null);
    store.set('qbSelectedLesson', null);

    const browser = new HierarchyBrowser({
      fetchFn: (force) => curriculumService.getSubjects(force),
      updateEventName: 'curriculum.subjects.updated',
      emptyMessage: 'لا توجد مواد دراسية.',
      childLabel: 'وحدات',
      // Optimistic navigation
      onSelect: (subject) => {
        store.set('qbSelectedSubject', subject);
        router.navigate(`/question-bank/subjects/${subject.id}/units`);
      },
      // Prefetch immediate next level on hover
      prefetchFn: (subject) => {
        curriculumService.getUnits(subject.id);
      }
    });

    const boundary = new ErrorBoundary({ 
      child: browser,
      fallbackMessage: 'تعذر تحميل قائمة المواد الدراسية.'
    });

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
