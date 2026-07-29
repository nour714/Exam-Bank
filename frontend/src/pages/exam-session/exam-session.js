import { BaseComponent } from '../../core/component.js';
import { router } from '../../core/router.js';
import { store } from '../../core/state-store.js';
import { eventBus } from '../../core/event-bus.js';
import { engineService } from '../../services/engine.service.js';

export default class ExamSessionPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.session = store.get('currentExamSession');
    this.attemptIdFromRoute = props.attemptId || null;
    this.currentIndex = 0;
    this.answers = {}; // questionId -> answerData
    this.timerInterval = null;
    this.remainingSecs = 0;
    this.submitted = false;
    this.result = null;
    this.resuming = false;
    this._navCleanups = [];
    this._questionCleanups = [];
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'exam-session-page animate-fade-in container mx-auto px-4 py-6 max-w-5xl';

    if (this.session && this.session.exam && this.session.attempt) {
      this.element.innerHTML = this._activeUiTemplate(this.session.exam);
      return this.element;
    }

    // No in-memory session (e.g. the page was refreshed mid-exam) — try to
    // resume it from the backend using the attemptId in the URL.
    if (this.attemptIdFromRoute) {
      this.resuming = true;
      this.element.innerHTML = `
        <div class="card p-8 text-center">
          <p class="text-lg">جارِ استرجاع جلسة الامتحان...</p>
        </div>
      `;
      return this.element;
    }

    this.element.innerHTML = `
      <div class="card p-8 text-center">
        <p class="text-lg mb-4">لا توجد جلسة امتحان نشطة.</p>
        <button class="btn btn-primary" id="back-to-exams">العودة إلى الامتحانات</button>
      </div>
    `;
    return this.element;
  }

  _activeUiTemplate(exam) {
    this.remainingSecs = exam.durationMins ? exam.durationMins * 60 : null;
    return `
      <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h1 class="text-xl font-bold">${exam.title}</h1>
        <div id="exam-timer" class="text-lg font-bold ${this.remainingSecs ? 'text-primary' : 'hidden'}"></div>
      </div>

      <div id="exam-nav" class="flex flex-wrap gap-2 mb-6"></div>

      <div id="exam-question-body" class="card p-6 mb-6"></div>

      <div class="flex justify-between items-center">
        <button class="btn btn-outline" id="btn-prev">السابق</button>
        <button class="btn btn-primary" id="btn-next">التالي</button>
        <button class="btn btn-danger" id="btn-submit">تسليم الامتحان</button>
      </div>

      <div id="exam-result" class="hidden"></div>
    `;
  }

  mount() {
    super.mount();

    if (this.session && this.session.exam && this.session.attempt) {
      this._wireActiveUi();
      return;
    }

    if (this.resuming) {
      this._resumeSession();
      return;
    }

    const btn = this.element.querySelector('#back-to-exams');
    if (btn) this.addEventListener(btn, 'click', () => router.navigate('/exams'));
  }

  async _resumeSession() {
    try {
      const attempt = await engineService.getAttempt(this.attemptIdFromRoute);

      if (attempt.status !== 'STARTED') {
        // Already submitted/graded — nothing to resume, send them back.
        eventBus.emit('toast.show', { type: 'info', title: 'الامتحان منتهي', message: 'تم تسليم هذا الامتحان بالفعل.' });
        router.navigate('/exams');
        return;
      }

      this.session = { attempt, exam: attempt.exam };
      store.set('currentExamSession', this.session);

      // Rebuild answers map from previously saved answers, if any.
      (attempt.answers || []).forEach(a => {
        this.answers[a.questionId] = a.answerData;
      });

      this.element.innerHTML = this._activeUiTemplate(attempt.exam);
      this._wireActiveUi();
      eventBus.emit('toast.show', { type: 'success', message: 'تم استرجاع جلسة الامتحان، كمّل من حيث وقفت.' });
    } catch (err) {
      console.error('[ExamSessionPage] Failed to resume session:', err);
      this.element.innerHTML = `
        <div class="card p-8 text-center">
          <p class="text-lg mb-4">تعذر استرجاع جلسة الامتحان. قد تكون انتهت أو غير موجودة.</p>
          <button class="btn btn-primary" id="back-to-exams">العودة إلى الامتحانات</button>
        </div>
      `;
      this.addEventListener(this.element.querySelector('#back-to-exams'), 'click', () => router.navigate('/exams'));
    }
  }

  _wireActiveUi() {
    this._renderNav();
    this._renderQuestion();

    this.addEventListener(this.element.querySelector('#btn-prev'), 'click', () => this._go(-1));
    this.addEventListener(this.element.querySelector('#btn-next'), 'click', () => this._go(1));
    this.addEventListener(this.element.querySelector('#btn-submit'), 'click', () => this._confirmSubmit());

    if (this.remainingSecs) {
      this._tickTimer();
      this.timerInterval = setInterval(() => this._tickTimer(), 1000);
      this.onCleanup(() => clearInterval(this.timerInterval));
    }
  }

  _questions() {
    return this.session.exam.questions || [];
  }

  _tickTimer() {
    if (this.remainingSecs <= 0) {
      clearInterval(this.timerInterval);
      this._submit(true);
      return;
    }
    this.remainingSecs -= 1;
    const mins = Math.floor(this.remainingSecs / 60);
    const secs = this.remainingSecs % 60;
    const el = this.element.querySelector('#exam-timer');
    if (el) el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Flush a local cleanup array, running each registered teardown function.
   */
  _clearCleanups(arr) {
    arr.forEach(fn => fn());
    arr.length = 0;
  }

  _renderNav() {
    this._clearCleanups(this._navCleanups);
    const nav = this.element.querySelector('#exam-nav');
    if (!nav) return;
    const questions = this._questions();

    nav.innerHTML = questions.map((eq, i) => {
      const answered = this.answers[eq.questionId] !== undefined;
      const isCurrent = i === this.currentIndex;
      const cls = isCurrent ? 'btn-primary' : answered ? 'btn-success' : 'btn-outline';
      return `<button class="btn btn-sm ${cls}" data-index="${i}">${i + 1}</button>`;
    }).join('');

    nav.querySelectorAll('[data-index]').forEach(btn => {
      const handler = () => {
        this.currentIndex = Number(btn.dataset.index);
        this._renderNav();
        this._renderQuestion();
      };
      btn.addEventListener('click', handler);
      this._navCleanups.push(() => btn.removeEventListener('click', handler));
    });
  }

  _renderQuestion() {
    this._clearCleanups(this._questionCleanups);
    const body = this.element.querySelector('#exam-question-body');
    if (!body) return;
    const questions = this._questions();
    const eq = questions[this.currentIndex];
    if (!eq) return;

    const question = eq.question;
    const text = question.content?.text || '';
    const savedAnswer = this.answers[eq.questionId];

    let inputHtml = '';

    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      inputHtml = (question.choices || []).map(choice => `
        <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-800 mb-2 cursor-pointer hover:border-primary">
          <input type="radio" name="q-${eq.questionId}" value="${choice.id}" ${savedAnswer === choice.id ? 'checked' : ''}>
          <span>${choice.content?.text || ''}</span>
        </label>
      `).join('');
    } else if (question.type === 'MULTI_SELECT') {
      const selected = Array.isArray(savedAnswer) ? savedAnswer : [];
      inputHtml = (question.choices || []).map(choice => `
        <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-800 mb-2 cursor-pointer hover:border-primary">
          <input type="checkbox" name="q-${eq.questionId}" value="${choice.id}" ${selected.includes(choice.id) ? 'checked' : ''}>
          <span>${choice.content?.text || ''}</span>
        </label>
      `).join('');
    } else if (question.type === 'ESSAY') {
      inputHtml = `<textarea class="input-control w-full" rows="6" id="essay-input" placeholder="اكتب إجابتك هنا...">${savedAnswer || ''}</textarea>`;
    } else if (question.type === 'MATCHING' || question.type === 'ORDERING') {
      // No dedicated drag-and-drop UI yet — accept a plain-text answer as a
      // functional fallback so the question is still answerable.
      const hint = question.type === 'MATCHING'
        ? 'اكتب كل زوج متطابق في سطر منفصل (مثال: أ - 1)'
        : 'اكتب الترتيب الصحيح مفصولاً بفواصل (مثال: 3, 1, 2, 4)';
      inputHtml = `
        <p class="text-xs text-gray-500 mb-2">${hint}</p>
        <textarea class="input-control w-full" rows="4" id="text-input">${savedAnswer || ''}</textarea>
      `;
    } else if (question.type === 'IMAGE_BASED') {
      const imageUrl = question.content?.imageUrl;
      inputHtml = `
        ${imageUrl ? `<img src="${imageUrl}" alt="صورة السؤال" class="max-w-full rounded-lg mb-4">` : ''}
        <input type="text" class="input-control w-full" id="text-input" placeholder="اكتب إجابتك" value="${savedAnswer || ''}">
      `;
    } else {
      // SHORT_ANSWER, FILL_IN_BLANK — plain text fallback
      inputHtml = `<input type="text" class="input-control w-full" id="text-input" value="${savedAnswer || ''}">`;
    }

    body.innerHTML = `
      <p class="text-xs text-gray-500 mb-2">سؤال ${this.currentIndex + 1} من ${questions.length} · ${eq.points ?? question.points} نقطة</p>
      <p class="text-lg font-medium mb-5">${text}</p>
      <div id="question-input-area">${inputHtml}</div>
    `;

    // Wire inputs — use local _questionCleanups to avoid memory leak on navigation
    const _addQListener = (el, type, handler) => {
      el.addEventListener(type, handler);
      this._questionCleanups.push(() => el.removeEventListener(type, handler));
    };

    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      body.querySelectorAll(`input[name="q-${eq.questionId}"]`).forEach(input => {
        _addQListener(input, 'change', () => this._saveAnswer(eq.questionId, input.value));
      });
    } else if (question.type === 'MULTI_SELECT') {
      body.querySelectorAll(`input[name="q-${eq.questionId}"]`).forEach(input => {
        _addQListener(input, 'change', () => {
          const checked = Array.from(body.querySelectorAll(`input[name="q-${eq.questionId}"]:checked`)).map(i => i.value);
          this._saveAnswer(eq.questionId, checked);
        });
      });
    } else if (question.type === 'ESSAY') {
      const textarea = body.querySelector('#essay-input');
      _addQListener(textarea, 'blur', () => this._saveAnswer(eq.questionId, textarea.value));
    } else if (question.type === 'MATCHING' || question.type === 'ORDERING') {
      const textarea = body.querySelector('#text-input');
      _addQListener(textarea, 'blur', () => this._saveAnswer(eq.questionId, textarea.value));
    } else {
      const input = body.querySelector('#text-input');
      _addQListener(input, 'blur', () => this._saveAnswer(eq.questionId, input.value));
    }
  }

  async _saveAnswer(questionId, answerData) {
    this.answers[questionId] = answerData;
    this._renderNav();
    try {
      await engineService.saveAnswer(this.session.attempt.id, questionId, answerData);
    } catch (err) {
      console.error('[ExamSessionPage] Failed to save answer:', err);
    }
  }

  _go(direction) {
    const total = this._questions().length;
    const next = this.currentIndex + direction;
    if (next < 0 || next >= total) return;
    this.currentIndex = next;
    this._renderNav();
    this._renderQuestion();
  }

  _confirmSubmit() {
    const total = this._questions().length;
    const answeredCount = Object.keys(this.answers).length;
    const message = answeredCount < total
      ? `لسه فاضلك ${total - answeredCount} سؤال من غير إجابة. متأكد إنك عايز تسلم الامتحان؟`
      : 'متأكد إنك عايز تسلم الامتحان؟';
    if (window.confirm(message)) {
      this._submit(false);
    }
  }

  async _submit(auto) {
    if (this.submitted) return;
    this.submitted = true;
    clearInterval(this.timerInterval);

    try {
      const result = await engineService.submitAttempt(this.session.attempt.id, this.remainingSecs ?? undefined);
      this.result = result;
      this._renderResult(auto);
      store.set('currentExamSession', null);
    } catch (err) {
      console.error('[ExamSessionPage] Failed to submit attempt:', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'تعذر تسليم الامتحان، حاول مرة أخرى.' });
      this.submitted = false;
    }
  }

  beforeUnmount() {
    this._clearCleanups(this._questionCleanups);
    this._clearCleanups(this._navCleanups);
  }

  _renderResult(auto) {
    const total = this._questions().length;
    const resultEl = this.element.querySelector('#exam-result');
    if (!resultEl) return;

    this.element.querySelector('#exam-nav').classList.add('hidden');
    this.element.querySelector('#exam-question-body').classList.add('hidden');
    this.element.querySelector('.flex.justify-between.items-center').classList.add('hidden');

    const r = this.result || {};
    const pendingReview = r.passed === null || r.passed === undefined;
    const scoreBlock = pendingReview
      ? `<p class="text-gray-400 mb-6">النتيجة: ${r.score ?? 0} نقطة (بعض الأسئلة تحتاج مراجعة يدوية قبل ظهور النتيجة النهائية)</p>`
      : `<p class="text-3xl font-bold mb-2 ${r.passed ? 'text-success' : 'text-danger'}">${r.score ?? 0} نقطة</p>
         <p class="mb-6 ${r.passed ? 'text-success' : 'text-danger'}">${r.passed ? 'ناجح ✓' : 'راسب ✗'}</p>`;

    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
      <div class="card p-8 text-center">
        ${auto ? '<p class="text-yellow-500 mb-2">انتهى الوقت — تم تسليم الامتحان تلقائياً</p>' : ''}
        <h2 class="text-2xl font-bold mb-2">تم تسليم الامتحان بنجاح</h2>
        <p class="text-gray-400 mb-2">عدد الأسئلة: ${total}</p>
        ${scoreBlock}
        <button class="btn btn-primary" id="btn-back-exams">العودة إلى الامتحانات</button>
      </div>
    `;

    this.addEventListener(resultEl.querySelector('#btn-back-exams'), 'click', () => router.navigate('/exams'));
  }
}
