import { BaseComponent } from '../../../core/component.js';

export class AuthLayout extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    this.element = document.createElement('div');
    this.element.id = 'login-screen';
    this.element.className = 'w-full min-h-screen flex items-center justify-center relative overflow-hidden';
    this.element.style.cssText = 'background: #0F1115;';

    this.element.innerHTML = `
      <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div class="absolute rounded-full blur-3xl" style="width: 800px; height: 800px; background: rgba(47, 95, 168, 0.10); top: -160px; right: -160px; animation: bgOrbFloat1 15s infinite alternate ease-in-out;"></div>
          <div class="absolute rounded-full blur-3xl" style="width: 600px; height: 600px; background: rgba(184, 134, 46, 0.08); bottom: 0; left: -80px; animation: bgOrbFloat2 12s infinite alternate-reverse ease-in-out;"></div>
          
          <!-- Grid Pattern -->
          <div class="absolute inset-0 opacity-25" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg=='); animation: bgGridSlide 20s linear infinite;"></div>
      </div>
      
      <div class="relative z-10 w-full flex justify-center px-4 py-8 animate-fade-in">
        <div id="auth-content"></div>
      </div>
    `;

    return this.element;
  }
}
