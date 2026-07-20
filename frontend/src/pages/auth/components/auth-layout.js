import { BaseComponent } from '../../../core/component.js';

export class AuthLayout extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('div');
    this.element.id = 'login-screen';
    this.element.className = 'w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0b1120]';

    // Particle and Orb Background
    this.element.innerHTML = `
      <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div class="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -top-40 -right-40" style="animation: bgOrbFloat1 15s infinite alternate ease-in-out;"></div>
          <div class="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl bottom-0 -left-20" style="animation: bgOrbFloat2 12s infinite alternate-reverse ease-in-out;"></div>
          
          <!-- Particles -->
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30" style="animation: bgGridSlide 20s linear infinite;"></div>
      </div>
      
      <div class="relative z-10 w-full flex justify-center px-4 py-8 animate-fade-in" style="animation: fadeIn 0.5s ease-out;">
        <div id="auth-content"></div>
      </div>
    `;

    return this.element;
  }
}
