import { BaseComponent } from '../../core/component.js';
import { curriculumService } from '../../services/curriculum.service.js';
import { HierarchyBrowser } from './components/hierarchy-browser.js';
import { QuestionBankLayout } from './layout.js';
import { ErrorBoundary } from '../../core/error-boundary.js';
import { store } from '../../core/state-store.js';
import { router } from '../../core/router.js';

export default class UnitsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.subjectId = props.subjectId;

    // Hydrate store from URL — URL is source of truth
    const currentSubject = store.get('qbSelectedSubject');
    if (!currentSubject || currentSubject.id !== this.subjectId) {
      store.set('qbSelectedSubject', { id: this.subjectId, name: 'جاري التحميل...' });
      // Background hydrate the full entity
      curriculumService.getSubjects().then(({ data }) => {
        const subject = data.find(s => s.id === this.subjectId);
        if (subject) store.set('qbSelectedSubject', subject);
      });
    }

    // Clear downstream selections
    store.set('qbSelectedUnit', null);
    store.set('qbSelectedLesson', null);

    const browser = new HierarchyBrowser({
      fetchFn: (force) => curriculumService.getUnits(this.subjectId, force),
      updateEventName: 'curriculum.units.updated',
      emptyMessage: 'لا توجد وحدات في هذه المادة.',
      childLabel: 'دروس',
      // Optimistic navigation
      onSelect: (unit) => {
        store.set('qbSelectedUnit', unit);
        router.navigate(`/question-bank/subjects/${this.subjectId}/units/${unit.id}/lessons`);
      },
      // Prefetch immediate next level on hover
      prefetchFn: (unit) => {
        curriculumService.getLessons(unit.id);
      }
    });

    const boundary = new ErrorBoundary({ 
      child: browser,
      fallbackMessage: 'تعذر تحميل قائمة الوحدات.'
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
