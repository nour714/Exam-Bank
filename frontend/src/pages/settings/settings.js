import { BaseComponent } from '../../core/component.js';
import { store } from '../../core/state-store.js';
import { eventBus } from '../../core/event-bus.js';
import { settingsService } from '../../services/settings.service.js';
import { authService } from '../../services/auth.service.js';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const PATHWAYS = ['علمي علوم', 'علمي رياضة', 'أدبي'];

export default class SettingsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.settings = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'settings-page animate-fade-in container mx-auto px-4 py-8 max-w-4xl';

    const user = store.get('user') || {};

    this.element.innerHTML = `
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1">الإعدادات</h1>
        <p class="text-gray-400">إدارة بياناتك الشخصية وتفضيلات الحساب</p>
      </div>

      <div id="settings-body">
        <div class="card p-6 animate-pulse space-y-4">
          <div class="h-4 bg-gray-700 rounded w-1/3"></div>
          <div class="h-10 bg-gray-700 rounded"></div>
          <div class="h-10 bg-gray-700 rounded"></div>
        </div>
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
      this.settings = await settingsService.getSettings();
    } catch (err) {
      console.error('[SettingsPage] Failed to load settings:', err);
      this.settings = { grade: GRADES[2], pathway: PATHWAYS[0], emailNotifications: true, examReminders: true };
    }
    this._renderForm();
  }

  _renderForm() {
    if (!this.element || !document.body.contains(this.element)) return;
    const body = this.element.querySelector('#settings-body');
    if (!body) return;

    const user = store.get('user') || {};
    const s = this.settings;
    const isDark = document.documentElement.classList.contains('dark-theme');

    body.innerHTML = `
      <!-- Profile Section -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-bold mb-4">الملف الشخصي</h3>
        <div class="flex items-center gap-4 mb-6">
          <img class="w-16 h-16 rounded-full" alt="صورة المستخدم"
               src="${user.avatar || "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22><circle cx=%2212%22 cy=%228%22 r=%225%22/><path d=%22M3 21v-2a7 7 0 0114 0v2%22/></svg>"}">
          <div>
            <p class="font-bold">${user.name || user.firstName || 'طالب'}</p>
            <p class="text-sm text-gray-400">${user.email || '—'}</p>
          </div>
        </div>

        <label class="block mb-4">
          <span class="text-sm text-gray-400 block mb-1">الصف الدراسي</span>
          <select id="settings-grade" class="input-control w-full">
            ${GRADES.map(g => `<option value="${g}" ${g === s.grade ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </label>

        <label class="block">
          <span class="text-sm text-gray-400 block mb-1">الشعبة</span>
          <select id="settings-pathway" class="input-control w-full">
            ${PATHWAYS.map(p => `<option value="${p}" ${p === s.pathway ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </label>
      </div>

      <!-- Preferences Section -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-bold mb-4">التفضيلات</h3>

        <div class="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p class="font-medium">الوضع الليلي</p>
            <p class="text-sm text-gray-400">تفعيل المظهر الداكن للتطبيق</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settings-dark-mode" ${isDark ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p class="font-medium">إشعارات البريد الإلكتروني</p>
            <p class="text-sm text-gray-400">استقبال تحديثات ونتائج الاختبارات بالبريد</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settings-email-notif" ${s.emailNotifications ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between py-3">
          <div>
            <p class="font-medium">تذكير بمواعيد الامتحانات</p>
            <p class="text-sm text-gray-400">تنبيه قبل مواعيد الاختبارات المجدولة</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settings-exam-reminders" ${s.examReminders ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <button class="btn btn-primary" id="settings-save-btn">حفظ التغييرات</button>
    `;

    this.addEventListener(body.querySelector('#settings-dark-mode'), 'change', (e) => {
      const enabled = e.target.checked;
      document.documentElement.classList.toggle('dark-theme', enabled);
      document.body.classList.toggle('dark-theme', enabled);
      localStorage.setItem('darkMode', String(enabled));
    });

    this.addEventListener(body.querySelector('#settings-save-btn'), 'click', () => this._save());
  }

  async _save() {
    const body = this.element.querySelector('#settings-body');
    const btn = body.querySelector('#settings-save-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'جارِ الحفظ...';

    try {
      const payload = {
        grade: body.querySelector('#settings-grade').value,
        pathway: body.querySelector('#settings-pathway').value,
        emailNotifications: body.querySelector('#settings-email-notif').checked,
        examReminders: body.querySelector('#settings-exam-reminders').checked
      };
      await settingsService.saveSettings(payload);
      this.settings = payload;
      eventBus.emit('toast.show', { type: 'success', title: 'تم الحفظ', message: 'تم حفظ إعداداتك بنجاح.' });
    } catch (err) {
      console.error('[SettingsPage] Failed to save settings:', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'تعذر حفظ الإعدادات، حاول مرة أخرى.' });
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}
