import { BaseComponent } from '../../../../core/component.js';
import { router } from '../../../../core/router.js';

export class QuickActions extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';

    const actions = [
      { id: 'start-exam', title: 'اختبار جديد', icon: 'play', color: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20', path: '/exams/new' },
      { id: 'question-bank', title: 'بنك الأسئلة', icon: 'database', color: 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/20', path: '/questions' },
      { id: 'study-groups', title: 'مجموعات', icon: 'users', color: 'text-green-500 bg-green-500/10 hover:bg-green-500/20', path: '/groups' },
      { id: 'performance', title: 'الأداء', icon: 'bar-chart-2', color: 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20', path: '/performance' }
    ];

    let html = '';
    actions.forEach(action => {
      html += `
        <button id="${action.id}" class="card flex flex-col items-center justify-center p-6 transition-all cursor-pointer border border-transparent hover:border-gray-600">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${action.color}">
            <i data-lucide="${action.icon}" class="w-6 h-6"></i>
          </div>
          <span class="text-sm font-medium text-gray-300">${action.title}</span>
        </button>
      `;
    });

    this.element.innerHTML = html;

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    actions.forEach(action => {
      const btn = this.element.querySelector(`#${action.id}`);
      if (btn) {
        btn.addEventListener('click', () => router.navigate(action.path));
      }
    });

    return this.element;
  }
}
