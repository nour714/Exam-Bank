import { BaseComponent } from '../../core/component.js';
import { curriculumService } from '../../services/curriculum.service.js';
import { HierarchyBrowser } from './components/hierarchy-browser.js';
import { QuestionBankLayout } from './layout.js';
import { ErrorBoundary } from '../../core/error-boundary.js';
import { store } from '../../core/state-store.js';
import { router } from '../../core/router.js';

export default class LessonsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.subjectId = props.subjectId;
    this.unitId = props.unitId;

    // Hydrate store from URL — URL is source of truth
    const currentSubject = store.get('qbSelectedSubject');
    if (!currentSubject || currentSubject.id !== this.subjectId) {
      store.set('qbSelectedSubject', { id: this.subjectId, name: 'جاري التحميل...' });
      curriculumService.getSubjects().then(({ data }) => {
        const subject = data.find(s => s.id === this.subjectId);
        if (subject) store.set('qbSelectedSubject', subject);
      });
    }

    const currentUnit = store.get('qbSelectedUnit');
    if (!currentUnit || currentUnit.id !== this.unitId) {
      store.set('qbSelectedUnit', { id: this.unitId, name: 'جاري التحميل...' });
      curriculumService.getUnits(this.subjectId).then(({ data }) => {
        const unit = data.find(u => u.id === this.unitId);
        if (unit) store.set('qbSelectedUnit', unit);
      });
    }

    // Clear downstream selections
    store.set('qbSelectedLesson', null);

    const browser = new HierarchyBrowser({
      fetchFn: (force) => curriculumService.getLessons(this.unitId, force),
      updateEventName: 'curriculum.lessons.updated',
      emptyMessage: 'لا توجد دروس في هذه الوحدة.',
      childLabel: 'عناصر',
      // Lessons are currently leaf nodes, but architecture stays open-ended.
      // If a lesson has children (childrenCount > 0), it can navigate deeper.
      onSelect: (lesson) => {
        store.set('qbSelectedLesson', lesson);
        // For now, lessons are leaf nodes — future: navigate to lesson detail or sub-hierarchy
        // router.navigate(`/question-bank/subjects/${this.subjectId}/units/${this.unitId}/lessons/${lesson.id}`);
      }
      // No prefetchFn — lessons are currently the deepest level.
      // If future entities exist below lessons, add prefetchFn here.
    });

    const boundary = new ErrorBoundary({ 
      child: browser,
      fallbackMessage: 'تعذر تحميل قائمة الدروس.'
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
