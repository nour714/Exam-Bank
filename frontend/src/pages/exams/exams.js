import { BaseComponent } from '../../core/component.js';
import { router } from '../../core/router.js';
import { store } from '../../core/state-store.js';
import { eventBus } from '../../core/event-bus.js';
import { examsService } from '../../services/exams.service.js';
import { engineService } from '../../services/engine.service.js';

const SUBJECT_ICON_MAP = {
  math: { icon: 'calculator', color: 'text-blue-500 bg-blue-500/10' },
  physics: { icon: 'zap', color: 'text-orange-500 bg-orange-500/10' },
  chemistry: { icon: 'flask-conical', color: 'text-success bg-success/10' },
  history: { icon: 'scroll-text', color: 'text-yellow-500 bg-yellow-500/10' }
};

export default class ExamsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.exams = [];
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'exams-page animate-fade-in container mx-auto px-4 py-8 max-w-6xl';

    this.element.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-1">الامتحانات</h1>
        <p class="text-gray-400">اختبر نفسك بامتحانات محاكاة لكل مادة قبل يوم الامتحان الحقيقي</p>
      </div>

      <div class="card p-6 mb-8 flex items-center justify-between flex-wrap gap-4" style="background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));">
        <div>
          <h2 class="text-xl font-bold text-white mb-1">جاهز لاختبار نفسك؟ 💪</h2>
          <p class="text-white/80">اختر مادة وابدأ امتحاناً محاكياً لظروف الامتحان الحقيقي</p>
        </div>
      </div>

      <div id="exams-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${Array(4).fill(0).map(() => `<div class="card p-5 animate-pulse h-44"></div>`).join('')}
      </div>
    `;

    return this.element;
  }

  mount() {
    super.mount();
    this._load();
  }

  async _load() {
    try {
      this.exams = await examsService.getExams();
    } catch (err) {
      console.error('[ExamsPage] Failed to load exams:', err);
      this.exams = [];
    }
    this._renderGrid();
  }

  _renderGrid() {
    if (!this.element || !document.body.contains(this.element)) return;
    const grid = this.element.querySelector('#exams-grid');
    if (!grid) return;

    if (this.exams.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-12">لا توجد امتحانات منشورة حالياً.</div>`;
      return;
    }

    grid.innerHTML = this.exams.map(exam => {
      const visual = SUBJECT_ICON_MAP[exam.subjectId] || { icon: 'file-text', color: 'text-gray-400 bg-gray-800' };
      return `
        <div class="card p-5 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4 ${visual.color}">
              <i data-lucide="${visual.icon}" class="w-6 h-6"></i>
            </div>
            <h3 class="font-bold text-lg mb-1">${exam.title}</h3>
            <p class="text-sm text-gray-500 mb-2">${exam.description || ''}</p>
            <p class="text-sm text-gray-400 mb-4">${exam.durationMins ? exam.durationMins + ' دقيقة' : 'بدون وقت محدد'} · ${exam.totalPoints} نقطة</p>
          </div>
          <button class="btn btn-primary w-full" data-exam-id="${exam.id}">
            <i data-lucide="play" class="w-4 h-4 ml-2"></i><span>ابدأ الامتحان</span>
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-exam-id]').forEach(btn => {
      this.addEventListener(btn, 'click', () => this._startExam(btn.dataset.examId, btn));
    });

    if (window.lucide) window.lucide.createIcons({ root: grid });
  }

  async _startExam(examId, btn) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'جارِ التحضير...';

    try {
      const [attempt, exam] = await Promise.all([
        engineService.startAttempt(examId),
        examsService.getExamById(examId)
      ]);

      store.set('currentExamSession', { attempt, exam });
      router.navigate(`/exam-session/${attempt.id}`);
    } catch (err) {
      console.error('[ExamsPage] Failed to start exam:', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'تعذر بدء الامتحان، حاول مرة أخرى.' });
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}
