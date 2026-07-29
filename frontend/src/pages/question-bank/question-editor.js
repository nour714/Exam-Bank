import { BaseComponent } from '../../core/component.js';
import { questionService } from '../../services/question.service.js';
import { StateMachine } from '../../core/state-machine.js';
import { authService } from '../../services/auth.service.js';
import { eventBus } from '../../core/event-bus.js';

export default class QuestionEditorPage extends BaseComponent {
  /**
   * @param {Object} props
   * @param {string} [props.id] - Optional ID for edit mode
   */
  constructor(props) {
    super(props);
    this.questionId = props.id;
    this.isEditMode = !!this.questionId;
    
    // Check permission for permanent delete
    this.canPermanentDelete = authService.hasPermission?.('questions:delete_permanent') || true; // Mock true

    this.stateMachine = new StateMachine({
      initial: 'loading',
      onChange: (state) => this._renderState(state)
    });

    this.formData = this._getInitialFormData();
    this.originalData = null;
    this.autosaveTimer = null;
    this.isSaving = false;
  }

  _getInitialFormData() {
    return {
      subjectId: 'math',
      unitId: 'unit1',
      lessonId: 'lesson1',
      type: 'multiple-choice',
      difficulty: 'medium',
      source: 'internal',
      tags: '',
      content: '',
      explanation: '',
      options: [
        { id: 'o1', text: '', isCorrect: true },
        { id: 'o2', text: '', isCorrect: false },
        { id: 'o3', text: '', isCorrect: false },
        { id: 'o4', text: '', isCorrect: false }
      ]
    };
  }

  _getDraftKey() {
    return `draft_question_${this.questionId || 'new'}`;
  }

  mount() {
    super.mount();
    this.loadData();

    // Prevent losing unsaved changes
    this.beforeUnloadHandler = (e) => {
      if (this._hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  destroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    super.destroy();
  }

  async loadData() {
    this.stateMachine.transition('loading');
    
    try {
      if (this.isEditMode) {
        const data = await questionService.getById(this.questionId);
        this.originalData = JSON.parse(JSON.stringify(data));
        this.formData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          options: data.options || this._getInitialFormData().options
        };
      }

      // Check draft
      const draft = localStorage.getItem(this._getDraftKey());
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        if (confirm('يوجد مسودة غير محفوظة. هل تريد استعادتها؟')) {
          this.formData = parsedDraft;
        } else {
          localStorage.removeItem(this._getDraftKey());
        }
      }

      this.stateMachine.transition('ready');
    } catch (err) {
      console.error('[QuestionEditor] Load failed', err);
      this.stateMachine.transition('error');
    }
  }

  _hasUnsavedChanges() {
    if (this.isEditMode && this.originalData) {
      // Basic comparison for unsaved changes
      return this.formData.content !== this.originalData.content || 
             this.formData.explanation !== this.originalData.explanation;
    }
    return this.formData.content.trim() !== '';
  }

  _triggerAutosave() {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => {
      localStorage.setItem(this._getDraftKey(), JSON.stringify(this.formData));
      eventBus.emit('toast.show', { type: 'info', message: 'تم حفظ المسودة محلياً' });
    }, 3000);
  }

  _updateForm(field, value) {
    this.formData[field] = value;
    if (field === 'type' && value === 'open-ended') {
      this.formData.options = null;
    } else if (field === 'type' && value === 'multiple-choice' && !this.formData.options) {
      this.formData.options = this._getInitialFormData().options;
    }
    this._triggerAutosave();
    this.render(); // Simple full re-render for this step, though granular updates are better
  }

  _updateOption(index, field, value) {
    if (!this.formData.options) return;
    
    if (field === 'isCorrect') {
      // Only one correct answer for basic multiple-choice
      this.formData.options.forEach(o => o.isCorrect = false);
    }
    this.formData.options[index][field] = value;
    this._triggerAutosave();
    this.render();
  }

  async _save() {
    // Basic validation
    if (!this.formData.content.trim()) {
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'نص السؤال مطلوب' });
      return;
    }
    if (this.formData.type === 'multiple-choice') {
      const hasCorrect = this.formData.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'يجب تحديد إجابة صحيحة واحدة على الأقل' });
        return;
      }
    }

    this.isSaving = true;
    this.render();

    try {
      const payload = {
        ...this.formData,
        tags: typeof this.formData.tags === 'string' ? this.formData.tags.split(',').map(t => t.trim()).filter(Boolean) : this.formData.tags
      };

      if (this.isEditMode) {
        await questionService.update(this.questionId, payload);
        eventBus.emit('toast.show', { type: 'success', title: 'تم الحفظ', message: 'تم تحديث السؤال بنجاح' });
      } else {
        await questionService.create(payload);
        eventBus.emit('toast.show', { type: 'success', title: 'تم الإنشاء', message: 'تم إضافة السؤال بنجاح' });
      }

      // Clear draft
      localStorage.removeItem(this._getDraftKey());
      
      // Navigate back
      window.history.back();
    } catch (err) {
      console.error('Save failed', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'فشل حفظ السؤال' });
      this.isSaving = false;
      this.render();
    }
  }

  _renderState(state) {
    if (!this.element || !document.body.contains(this.element)) return;

    if (state === 'loading') {
      this.element.innerHTML = `<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>`;
      return;
    }

    if (state === 'error') {
      this.element.innerHTML = `<div class="text-center py-12"><p class="text-danger">حدث خطأ أثناء تحميل البيانات.</p></div>`;
      return;
    }

    if (state === 'ready') {
      const fd = this.formData;

      this.element.innerHTML = `
        <div class="max-w-4xl mx-auto pb-12 animate-fade-in">
          
          <div class="flex items-center justify-between mb-8 sticky top-0 bg-gray-900/90 backdrop-blur-md z-10 py-4 border-b border-gray-800">
            <div class="flex items-center gap-4">
              <button id="cancel-btn" class="btn text-gray-400 hover:text-white transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i> إلغاء
              </button>
              <h1 class="text-2xl font-bold text-white">${this.isEditMode ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h1>
              ${fd.deleted ? '<span class="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold border border-red-500/20">محذوف مؤقتاً</span>' : ''}
            </div>
            <div class="flex gap-3">
              ${this.isEditMode ? `
                ${fd.deleted ? `
                  <button id="restore-btn" class="btn border border-gray-600 hover:bg-gray-700 text-white transition-colors">
                    <i data-lucide="rotate-ccw" class="w-4 h-4 ms-2"></i> استعادة
                  </button>
                  ${this.canPermanentDelete ? `
                    <button id="permanent-delete-btn" class="btn text-danger hover:bg-red-500/10 transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4 ms-2"></i> حذف نهائي
                    </button>
                  ` : ''}
                ` : `
                  <button id="soft-delete-btn" class="btn text-danger hover:bg-red-500/10 transition-colors">
                    <i data-lucide="trash" class="w-4 h-4 ms-2"></i> حذف
                  </button>
                `}
              ` : ''}
              
              <button id="save-draft-btn" class="btn border border-gray-700 hover:bg-gray-800 text-gray-300">
                حفظ كمسودة
              </button>
              <button id="save-btn" class="btn btn-primary" ${this.isSaving || fd.deleted ? 'disabled' : ''}>
                ${this.isSaving ? '<i class="animate-spin" data-lucide="loader"></i> جاري الحفظ...' : '<i data-lucide="save" class="w-4 h-4 ms-2"></i> حفظ السؤال'}
              </button>
            </div>
          </div>

          <div class="space-y-8">
            
            <!-- Context Section -->
            <div class="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 class="text-lg font-bold text-white mb-4">السياق التعليمي</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">المادة</label>
                  <select id="field-subject" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="math" ${fd.subjectId === 'math' ? 'selected' : ''}>الرياضيات</option>
                    <option value="physics" ${fd.subjectId === 'physics' ? 'selected' : ''}>الفيزياء</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">الوحدة</label>
                  <select id="field-unit" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="unit1" ${fd.unitId === 'unit1' ? 'selected' : ''}>الوحدة 1</option>
                    <option value="unit2" ${fd.unitId === 'unit2' ? 'selected' : ''}>الوحدة 2</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">الدرس</label>
                  <select id="field-lesson" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="lesson1" ${fd.lessonId === 'lesson1' ? 'selected' : ''}>الدرس 1</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Metadata Section -->
            <div class="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 class="text-lg font-bold text-white mb-4">خصائص السؤال</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">نوع السؤال</label>
                  <select id="field-type" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="multiple-choice" ${fd.type === 'multiple-choice' ? 'selected' : ''}>اختيار من متعدد</option>
                    <option value="open-ended" ${fd.type === 'open-ended' ? 'selected' : ''}>سؤال مقالي</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">الصعوبة</label>
                  <select id="field-difficulty" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="easy" ${fd.difficulty === 'easy' ? 'selected' : ''}>سهل</option>
                    <option value="medium" ${fd.difficulty === 'medium' ? 'selected' : ''}>متوسط</option>
                    <option value="hard" ${fd.difficulty === 'hard' ? 'selected' : ''}>صعب</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">المصدر</label>
                  <select id="field-source" class="form-select w-full bg-gray-800 border-gray-700 rounded-lg">
                    <option value="internal" ${fd.source === 'internal' ? 'selected' : ''}>داخلي</option>
                    <option value="ministry" ${fd.source === 'ministry' ? 'selected' : ''}>الوزارة</option>
                    <option value="external" ${fd.source === 'external' ? 'selected' : ''}>خارجي</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Content Section -->
            <div class="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 class="text-lg font-bold text-white mb-4">نص السؤال</h3>
              <textarea id="field-content" class="form-input w-full bg-gray-800 border-gray-700 rounded-lg p-4 h-48" placeholder="اكتب نص السؤال هنا... يدعم هذا الحقل النص الغني لاحقاً">${fd.content}</textarea>
            </div>

            <!-- Options Section (If multiple choice) -->
            ${fd.type === 'multiple-choice' ? `
              <div class="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-white">الخيارات</h3>
                  <span class="text-xs text-gray-400">اختر الإجابة الصحيحة عبر النقر على الدائرة</span>
                </div>
                <div class="space-y-3" id="options-container">
                  ${fd.options.map((opt, i) => `
                    <div class="flex items-center gap-3">
                      <button data-opt-idx="${i}" class="opt-correct-btn w-6 h-6 rounded-full flex items-center justify-center border ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-700 border-gray-600'}">
                        ${opt.isCorrect ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                      </button>
                      <input type="text" data-opt-text="${i}" value="${opt.text}" class="form-input flex-1 bg-gray-800 border-gray-700 rounded-lg" placeholder="اكتب الخيار هنا...">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Additional Details -->
            <div class="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 class="text-lg font-bold text-white mb-4">تفاصيل إضافية</h3>
              
              <div class="mb-6">
                <label class="block text-sm text-gray-400 mb-2">الشرح والإجابة النموذجية</label>
                <textarea id="field-explanation" class="form-input w-full bg-gray-800 border-gray-700 rounded-lg p-4 h-32" placeholder="اكتب الشرح هنا...">${fd.explanation}</textarea>
              </div>

              <div>
                <label class="block text-sm text-gray-400 mb-2">الوسوم (مفصول بفواصل)</label>
                <input id="field-tags" type="text" class="form-input w-full bg-gray-800 border-gray-700 rounded-lg" value="${fd.tags}" placeholder="مثال: جبر, أساسيات">
              </div>
            </div>

          </div>
        </div>
      `;

      // Event Listeners for Fields
      this.element.querySelector('#cancel-btn').addEventListener('click', () => {
        if (this._hasUnsavedChanges() && !confirm('هل أنت متأكد من إلغاء التعديلات؟ سيتم فقدان التغييرات غير المحفوظة.')) {
          return;
        }
        window.history.back();
      });

      this.element.querySelector('#save-draft-btn').addEventListener('click', () => {
        this.formData.status = 'draft';
        this._save();
      });

      this.element.querySelector('#save-btn').addEventListener('click', () => {
        this.formData.status = 'published';
        this._save();
      });

      if (this.isEditMode) {
        this.element.querySelector('#soft-delete-btn')?.addEventListener('click', async () => {
          if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            try {
              await questionService.delete(this.questionId);
              eventBus.emit('toast.show', { type: 'success', message: 'تم حذف السؤال بنجاح' });
              window.history.back();
            } catch (err) {
              console.error(err);
              eventBus.emit('toast.show', { type: 'error', message: 'فشل حذف السؤال' });
            }
          }
        });

        this.element.querySelector('#restore-btn')?.addEventListener('click', async () => {
          try {
            await questionService.restore(this.questionId);
            eventBus.emit('toast.show', { type: 'success', message: 'تم استعادة السؤال بنجاح' });
            this.loadData(); // reload
          } catch (err) {
            console.error(err);
            eventBus.emit('toast.show', { type: 'error', message: 'فشل الاستعادة' });
          }
        });

        this.element.querySelector('#permanent-delete-btn')?.addEventListener('click', async () => {
          if (confirm('تحذير: سيتم حذف هذا السؤال بشكل نهائي ولا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟')) {
            try {
              await questionService.permanentDelete(this.questionId);
              eventBus.emit('toast.show', { type: 'success', message: 'تم الحذف النهائي بنجاح' });
              window.history.back();
            } catch (err) {
              console.error(err);
              eventBus.emit('toast.show', { type: 'error', message: 'فشل الحذف النهائي' });
            }
          }
        });
      }

      // Bind simple inputs
      ['subject', 'unit', 'lesson', 'type', 'difficulty', 'source'].forEach(id => {
        this.element.querySelector(`#field-${id}`)?.addEventListener('change', (e) => this._updateForm(`${id}${id==='type'||id==='difficulty'||id==='source'?'':'Id'}`, e.target.value));
      });
      
      this.element.querySelector('#field-content')?.addEventListener('input', (e) => {
        this.formData.content = e.target.value;
        this._triggerAutosave();
      });
      this.element.querySelector('#field-explanation')?.addEventListener('input', (e) => {
        this.formData.explanation = e.target.value;
        this._triggerAutosave();
      });
      this.element.querySelector('#field-tags')?.addEventListener('input', (e) => {
        this.formData.tags = e.target.value;
        this._triggerAutosave();
      });

      // Bind options
      if (fd.type === 'multiple-choice') {
        this.element.querySelectorAll('.opt-correct-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-opt-idx');
            this._updateOption(parseInt(idx, 10), 'isCorrect', true);
          });
        });
        this.element.querySelectorAll('input[data-opt-text]').forEach(input => {
          input.addEventListener('input', (e) => {
            const idx = e.target.getAttribute('data-opt-text');
            this._updateOption(parseInt(idx, 10), 'text', e.target.value);
          });
        });
      }

      if (window.lucide) window.lucide.createIcons({ root: this.element });
    }
  }

  render() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'w-full h-full bg-gray-900';
    }
    return this.element;
  }
}
