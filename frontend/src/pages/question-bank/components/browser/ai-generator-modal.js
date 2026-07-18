import { BaseComponent } from '../../../../core/component.js';
import { aiService } from '../../../../services/ai.service.js';
import { eventBus } from '../../../../core/event-bus.js';
import { StateMachine } from '../../../../core/state-machine.js';

export class AIGeneratorModal extends BaseComponent {
  constructor(props) {
    super(props);
    this.onAcceptAndSave = props.onAcceptAndSave;
    this.onEdit = props.onEdit;

    this.stateMachine = new StateMachine({
      initial: 'closed',
      onChange: (state) => this._renderState(state)
    });

    this.currentJobId = null;
    this.progress = 0;
    this.results = [];
    this.observability = null;

    // Listen for generation events
    this.progressHandler = (data) => {
      if (data.jobId === this.currentJobId) {
        this.progress = data.progress;
        this._renderState('generating');
      }
    };
    this.completedHandler = (data) => {
      if (data.jobId === this.currentJobId) {
        this.results = data.results.map(q => ({ ...q, accepted: true }));
        this.observability = data.observability;
        this.currentJobId = null;
        this.stateMachine.transition('review');
      }
    };
    this.failedHandler = (data) => {
      if (data.jobId === this.currentJobId) {
        this.currentJobId = null;
        eventBus.emit('toast.show', { type: 'error', message: data.error || 'فشل التوليد' });
        this.stateMachine.transition('form');
      }
    };

    eventBus.on('ai.generation.progress', this.progressHandler);
    eventBus.on('ai.generation.completed', this.completedHandler);
    eventBus.on('ai.generation.failed', this.failedHandler);
  }

  unmount() {
    eventBus.off('ai.generation.progress', this.progressHandler);
    eventBus.off('ai.generation.completed', this.completedHandler);
    eventBus.off('ai.generation.failed', this.failedHandler);
    super.unmount();
  }

  open() {
    this.results = [];
    this.progress = 0;
    this.observability = null;
    this.stateMachine.transition('form');
  }

  close() {
    if (this.currentJobId) {
      aiService.cancelGeneration(this.currentJobId).catch(console.error);
      this.currentJobId = null;
    }
    this.stateMachine.transition('closed');
  }

  async _startGeneration(params) {
    this.progress = 0;
    this.stateMachine.transition('generating');
    try {
      const { jobId } = await aiService.generateQuestions(params);
      this.currentJobId = jobId;
    } catch (err) {
      console.error(err);
      eventBus.emit('toast.show', { type: 'error', message: 'فشل بدء التوليد' });
      this.stateMachine.transition('form');
    }
  }

  _saveAccepted() {
    const accepted = this.results.filter(r => r.accepted).map(({ accepted, id, ...rest }) => rest); // remove internal temp state
    if (accepted.length === 0) {
      eventBus.emit('toast.show', { type: 'warning', message: 'لم يتم قبول أي أسئلة' });
      return;
    }
    if (this.onAcceptAndSave) {
      this.onAcceptAndSave(accepted);
    }
    this.close();
  }

  _renderState(state) {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.id = 'ai-generator-modal';
      document.body.appendChild(this.element);
    }

    if (state === 'closed') {
      this.element.innerHTML = '';
      return;
    }

    const modalContent = `
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-purple-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <i data-lucide="sparkles" class="w-6 h-6 text-purple-400"></i> التوليد بالذكاء الاصطناعي
            </h2>
            <button id="ai-close-btn" class="text-gray-400 hover:text-white transition-colors">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1">
            ${this._renderBody(state)}
          </div>
          
        </div>
      </div>
    `;

    this.element.innerHTML = modalContent;

    // Bind common
    this.element.querySelector('#ai-close-btn').addEventListener('click', () => this.close());

    // Bind specific state events
    if (state === 'form') {
      this.element.querySelector('#ai-start-btn').addEventListener('click', () => {
        const params = {
          subjectId: this.element.querySelector('#ai-subject').value,
          unitId: this.element.querySelector('#ai-unit').value,
          lessonId: this.element.querySelector('#ai-lesson').value,
          difficulty: this.element.querySelector('#ai-difficulty').value,
          type: this.element.querySelector('#ai-type').value,
          bloomTaxonomy: this.element.querySelector('#ai-bloom').value,
          count: parseInt(this.element.querySelector('#ai-count').value, 10),
          prompt: this.element.querySelector('#ai-prompt').value
        };
        this._startGeneration(params);
      });
    }

    if (state === 'generating') {
      this.element.querySelector('#ai-cancel-btn').addEventListener('click', () => {
        this.close();
      });
    }

    if (state === 'review') {
      this.element.querySelector('#ai-save-btn').addEventListener('click', () => this._saveAccepted());
      this.element.querySelector('#ai-regenerate-all-btn').addEventListener('click', () => {
        // Simple retry with last known params (we can just trigger a re-gen if we saved params, but let's just go back to form for now)
        this.stateMachine.transition('form');
      });

      this.element.querySelectorAll('.ai-reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = e.currentTarget.getAttribute('data-idx');
          this.results[idx].accepted = false;
          this._renderState('review'); // re-render to hide it or mark it
        });
      });

      this.element.querySelectorAll('.ai-restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = e.currentTarget.getAttribute('data-idx');
          this.results[idx].accepted = true;
          this._renderState('review');
        });
      });

      this.element.querySelectorAll('.ai-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = e.currentTarget.getAttribute('data-idx');
          const q = this.results[idx];
          if (this.onEdit) {
            this.onEdit(q);
            this.close();
          }
        });
      });
    }

    if (window.lucide) window.lucide.createIcons({ root: this.element });
  }

  _renderBody(state) {
    if (state === 'form') {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">المادة</label>
              <select id="ai-subject" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="math">الرياضيات</option>
                <option value="physics">الفيزياء</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">الوحدة</label>
              <select id="ai-unit" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="unit1">الوحدة 1</option>
                <option value="unit2">الوحدة 2</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">الدرس</label>
              <select id="ai-lesson" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="lesson1">الدرس 1</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">نوع السؤال</label>
              <select id="ai-type" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="multiple-choice">اختيار من متعدد</option>
                <option value="open-ended">سؤال مقالي</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">الصعوبة</label>
              <select id="ai-difficulty" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="easy">سهل</option>
                <option value="medium" selected>متوسط</option>
                <option value="hard">صعب</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">تصنيف بلوم (Bloom's Taxonomy)</label>
              <select id="ai-bloom" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                <option value="remembering">التذكر</option>
                <option value="understanding" selected>الفهم</option>
                <option value="applying">التطبيق</option>
                <option value="analyzing">التحليل</option>
                <option value="evaluating">التقييم</option>
                <option value="creating">الابتكار</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">عدد الأسئلة</label>
              <input type="number" id="ai-count" min="1" max="10" value="3" class="form-input w-full bg-gray-800 border-gray-700 rounded-lg">
            </div>
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-400 mb-2">تعليمات إضافية للمولد (اختياري)</label>
            <textarea id="ai-prompt" class="form-input w-full bg-gray-800 border-gray-700 rounded-lg h-24" placeholder="مثال: ركز على القوانين الأساسية ووفر أمثلة من الحياة اليومية..."></textarea>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <button id="ai-start-btn" class="btn bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto">
            <i data-lucide="zap" class="w-4 h-4 ml-2"></i> بدء التوليد
          </button>
        </div>
      `;
    }

    if (state === 'generating') {
      return `
        <div class="flex flex-col items-center justify-center h-64 text-center">
          <div class="relative w-24 h-24 mb-6">
            <svg class="animate-spin w-full h-full text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
              ${this.progress}%
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-2 animate-pulse">جاري التوليد بواسطة الذكاء الاصطناعي...</h3>
          <p class="text-gray-400 mb-8">يقوم النموذج بتحليل المنهج وبناء أسئلة متوافقة مع معاييرك</p>
          <button id="ai-cancel-btn" class="btn border border-gray-700 hover:bg-gray-800 text-gray-300">إلغاء العملية</button>
        </div>
      `;
    }

    if (state === 'review') {
      const obs = this.observability || {};
      return `
        <div class="space-y-6">
          
          <!-- Observability Card -->
          <div class="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl flex items-center justify-between text-xs text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1"><i data-lucide="cpu" class="w-4 h-4"></i> النموذج: <strong class="text-white">${obs.model || 'N/A'}</strong></span>
              <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> الوقت: <strong class="text-white">${obs.durationMs ? obs.durationMs + 'ms' : 'N/A'}</strong></span>
            </div>
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1"><i data-lucide="hash" class="w-4 h-4"></i> التوكنز: <strong class="text-white">${obs.tokens || 'N/A'}</strong></span>
              <span class="flex items-center gap-1 text-green-400"><i data-lucide="check-circle" class="w-4 h-4"></i> الحالة: ${obs.status || 'Success'}</span>
            </div>
          </div>

          <!-- Results List -->
          <div class="space-y-4">
            ${this.results.map((q, idx) => `
              <div class="p-4 rounded-xl border ${q.accepted ? 'bg-gray-800/50 border-gray-700' : 'bg-red-900/10 border-red-500/20 opacity-50'} transition-all">
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">توليد الذكاء الاصطناعي</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700 text-gray-300">بلوم: ${q.metadata.bloomTaxonomy}</span>
                    </div>
                    <p class="text-white font-medium text-lg">${q.content}</p>
                  </div>
                  <div class="flex gap-2">
                    ${q.accepted ? `
                      <button data-idx="${idx}" class="ai-edit-btn btn btn-sm border border-gray-600 hover:bg-gray-700" title="تحرير قبل الحفظ">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                      </button>
                      <button data-idx="${idx}" class="ai-reject-btn btn btn-sm border border-red-900/50 hover:bg-red-500/10 text-red-400" title="استبعاد">
                        <i data-lucide="x" class="w-4 h-4"></i>
                      </button>
                    ` : `
                      <button data-idx="${idx}" class="ai-restore-btn btn btn-sm bg-gray-700 hover:bg-gray-600 text-white" title="تضمين مرة أخرى">
                        <i data-lucide="rotate-ccw" class="w-4 h-4 ml-1"></i> تراجع
                      </button>
                    `}
                  </div>
                </div>

                ${q.options ? `
                  <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                    ${q.options.map(opt => `
                      <div class="p-2 rounded border ${opt.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-900/50 border-gray-800 text-gray-400'}">
                        ${opt.isCorrect ? '✓ ' : ''}${opt.text}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div class="flex items-center justify-between pt-6 border-t border-gray-800">
            <button id="ai-regenerate-all-btn" class="btn border border-gray-700 hover:bg-gray-800 text-gray-300">
              <i data-lucide="rotate-cw" class="w-4 h-4 ml-2"></i> إعادة توليد الدفعة
            </button>
            <button id="ai-save-btn" class="btn bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
              <i data-lucide="check" class="w-4 h-4 ml-2"></i> حفظ الأسئلة المقبولة (${this.results.filter(r => r.accepted).length})
            </button>
          </div>
        </div>
      `;
    }
  }
}
