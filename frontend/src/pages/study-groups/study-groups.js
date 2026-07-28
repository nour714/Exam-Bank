import { BaseComponent } from '../../core/component.js';
import { eventBus } from '../../core/event-bus.js';
import { studyGroupsService } from '../../services/study-groups.service.js';
import { showModal } from '../../design-system/components/overlays/modal.js';

export default class StudyGroupsPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.myGroups = [];
    this.publicGroups = [];
    this.myGroupsLoaded = false;
    this.publicGroupsLoaded = false;
    this.activeTab = 'my'; // 'my' | 'discover'
    this.loading = true;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'study-groups-page animate-fade-in container mx-auto px-4 py-8 max-w-6xl';

    this.element.innerHTML = `
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold mb-1">مجموعات الدراسة</h1>
          <p class="text-gray-400">انضم لزملائك أو أنشئ مجموعة مذاكرة جديدة</p>
        </div>
        <button class="btn btn-primary" id="btn-create-group">
          <i data-lucide="plus" class="w-4 h-4 ml-2"></i><span>إنشاء مجموعة</span>
        </button>
      </div>

      <div class="card p-4 mb-6 flex items-center gap-2 flex-wrap">
        <input type="text" id="invite-code-input" class="input-control flex-1 min-w-[200px]" placeholder="عندك كود دعوة؟ اكتبه هنا للانضمام">
        <button class="btn btn-outline" id="btn-join-code">انضمام بالكود</button>
      </div>

      <div class="flex gap-2 mb-6">
        <button class="btn btn-sm ${this.activeTab === 'my' ? 'btn-primary' : 'btn-outline'}" data-tab="my">مجموعاتي</button>
        <button class="btn btn-sm ${this.activeTab === 'discover' ? 'btn-primary' : 'btn-outline'}" data-tab="discover">اكتشف مجموعات</button>
      </div>

      <div id="groups-grid"></div>
    `;

    return this.element;
  }

  mount() {
    super.mount();
    this._load();

    this.addEventListener(this.element.querySelector('#btn-create-group'), 'click', () => this._promptCreateGroup());
    this.addEventListener(this.element.querySelector('#btn-join-code'), 'click', () => this._joinByCode());

    this.element.querySelectorAll('[data-tab]').forEach(btn => {
      this.addEventListener(btn, 'click', () => {
        this.activeTab = btn.dataset.tab;
        this._renderTabs();
        if (this.activeTab === 'discover' && !this.publicGroupsLoaded) {
          this._loadPublicGroups();
        } else if (this.activeTab === 'my' && !this.myGroupsLoaded) {
          this._load();
        } else {
          this._renderGrid();
        }
      });
    });
  }

  _renderTabs() {
    this.element.querySelectorAll('[data-tab]').forEach(btn => {
      const active = btn.dataset.tab === this.activeTab;
      btn.className = `btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`;
    });
  }

  async _load() {
    this.loading = true;
    this._renderGrid();
    try {
      this.myGroups = await studyGroupsService.getMyGroups();
      this.myGroupsLoaded = true;
    } catch (err) {
      console.error('[StudyGroupsPage] Failed to load my groups:', err);
      this.myGroups = [];
    }
    this.loading = false;
    this._renderGrid();
  }

  async _loadPublicGroups() {
    this.loading = true;
    this._renderGrid();
    try {
      this.publicGroups = await studyGroupsService.getPublicGroups();
      this.publicGroupsLoaded = true;
    } catch (err) {
      console.error('[StudyGroupsPage] Failed to load public groups:', err);
      this.publicGroups = [];
    }
    this.loading = false;
    this._renderGrid();
  }

  _renderGrid() {
    if (!this.element || !document.body.contains(this.element)) return;
    const grid = this.element.querySelector('#groups-grid');
    if (!grid) return;

    if (this.loading) {
      grid.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${
        Array(3).fill(0).map(() => `<div class="card p-5 animate-pulse h-40"></div>`).join('')
      }</div>`;
      return;
    }

    const list = this.activeTab === 'my' ? this.myGroups : this.publicGroups;
    const isDiscover = this.activeTab === 'discover';

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="text-center text-gray-500 py-12">
          <i data-lucide="users" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
          <p>${isDiscover ? 'لا توجد مجموعات عامة متاحة للانضمام حالياً.' : 'لسه مش عضو في أي مجموعة. جرب تبص على تبويب "اكتشف مجموعات".'}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: grid });
      return;
    }

    grid.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${list.map(g => `
        <div class="card p-5 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-lg mb-2">${g.name}</h3>
            <p class="text-sm text-gray-400 mb-4">${g.description || ''}</p>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500"><i data-lucide="users" class="w-4 h-4 inline"></i> ${g._count?.members ?? 0} عضو</span>
            ${isDiscover
              ? `<button class="btn btn-sm btn-outline" data-join="${g.id}">انضمام</button>`
              : `<span class="text-xs text-gray-600" title="كود الدعوة">${g.inviteCode || ''}</span>`}
          </div>
        </div>
      `).join('')}
    </div>`;

    if (isDiscover) {
      grid.querySelectorAll('[data-join]').forEach(btn => {
        this.addEventListener(btn, 'click', () => this._joinGroup(btn.dataset.join, btn));
      });
    }

    if (window.lucide) window.lucide.createIcons({ root: grid });
  }

  async _joinGroup(id, btn) {
    btn.disabled = true;
    try {
      await studyGroupsService.joinGroup(id);
      eventBus.emit('toast.show', { type: 'success', title: 'تم الانضمام', message: 'أصبحت الآن عضواً في المجموعة.' });
      this.publicGroups = this.publicGroups.filter(g => g.id !== id);
      this.myGroupsLoaded = false; // invalidate so "My Groups" tab refetches next time it's opened
      this._renderGrid();
    } catch (err) {
      console.error('[StudyGroupsPage] Failed to join group:', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'تعذر الانضمام للمجموعة.' });
      btn.disabled = false;
    }
  }

  async _joinByCode() {
    const input = this.element.querySelector('#invite-code-input');
    const code = input.value.trim();
    if (!code) return;

    try {
      await studyGroupsService.joinByCode(code);
      eventBus.emit('toast.show', { type: 'success', title: 'تم الانضمام', message: 'تم الانضمام للمجموعة بنجاح.' });
      input.value = '';
      this.publicGroupsLoaded = false;
      this.activeTab = 'my';
      this._renderTabs();
      await this._load();
    } catch (err) {
      console.error('[StudyGroupsPage] Failed to join by code:', err);
      eventBus.emit('toast.show', { type: 'error', title: 'خطأ', message: 'كود الدعوة غير صحيح.' });
    }
  }

  _promptCreateGroup() {
    const form = document.createElement('div');
    form.className = 'flex flex-col gap-4';
    form.innerHTML = `
      <label class="block">
        <span class="text-sm text-gray-400 block mb-1">اسم المجموعة *</span>
        <input type="text" id="modal-group-name" class="input-control w-full" placeholder="مثال: مجموعة الرياضيات">
      </label>
      <label class="block">
        <span class="text-sm text-gray-400 block mb-1">وصف مختصر</span>
        <textarea id="modal-group-desc" class="input-control w-full" rows="3" placeholder="عن ماذا تتحدث هذه المجموعة؟"></textarea>
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" id="modal-group-private">
        <span class="text-sm">مجموعة خاصة (الانضمام بكود الدعوة فقط)</span>
      </label>
      <p id="modal-group-error" class="text-danger text-sm hidden"></p>
    `;

    const footer = document.createElement('div');
    footer.className = 'flex gap-2 justify-end';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = 'إلغاء';
    const createBtn = document.createElement('button');
    createBtn.className = 'btn btn-primary';
    createBtn.textContent = 'إنشاء المجموعة';
    footer.appendChild(cancelBtn);
    footer.appendChild(createBtn);

    const modal = showModal({
      title: 'إنشاء مجموعة دراسة جديدة',
      content: form,
      footer
    });

    cancelBtn.addEventListener('click', () => modal.close());

    createBtn.addEventListener('click', async () => {
      const name = form.querySelector('#modal-group-name').value.trim();
      const description = form.querySelector('#modal-group-desc').value.trim();
      const isPrivate = form.querySelector('#modal-group-private').checked;
      const errorEl = form.querySelector('#modal-group-error');

      if (!name || name.length < 2) {
        errorEl.textContent = 'اسم المجموعة لازم يكون حرفين على الأقل.';
        errorEl.classList.remove('hidden');
        return;
      }

      createBtn.disabled = true;
      createBtn.textContent = 'جارِ الإنشاء...';

      try {
        await studyGroupsService.createGroup({ name, description, isPrivate });
        eventBus.emit('toast.show', { type: 'success', title: 'تم الإنشاء', message: 'تم إنشاء المجموعة بنجاح.' });
        modal.close();
        this.activeTab = 'my';
        this._renderTabs();
        await this._load();
      } catch (err) {
        console.error('[StudyGroupsPage] Failed to create group:', err);
        errorEl.textContent = 'تعذر إنشاء المجموعة، حاول مرة أخرى.';
        errorEl.classList.remove('hidden');
        createBtn.disabled = false;
        createBtn.textContent = 'إنشاء المجموعة';
      }
    });
  }
}
