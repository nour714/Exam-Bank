import { BaseComponent } from '../../../core/component.js';
import { store } from '../../../core/state-store.js';

export class WelcomeCard extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      user: store.get('user') || null,
    };

    // Subscribe to user changes
    this.onCleanup(
      store.subscribe('user', (newUser) => {
        if (this.state.user !== newUser) {
          this.setState({ user: newUser });
        }
      })
    );
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'welcome-card card text-white overflow-hidden relative';
    
    const userName = this.state.user?.name || 'طالب';

    this.element.innerHTML = `
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      
      <div class="card-body relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8">
        <div>
          <h2 class="text-3xl font-bold mb-2">أهلاً بك مرة أخرى، ${userName}! 👋</h2>
          <p class="text-blue-100 text-lg">أنت تبلي بلاءً حسناً. استمر في التدريب لتحقيق أهدافك.</p>
        </div>
        <div class="flex gap-4">
          <a href="/question-bank/questions" class="btn bg-white text-blue-600 hover:bg-gray-100" data-nav>بدء اختبار جديد</a>
        </div>
      </div>
    `;

    return this.element;
  }
}
