import { BaseComponent } from '../../../core/component.js';

export class SocialButton extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { provider = 'google', label = 'المتابعة باستخدام جوجل', onClick } = this.props;
    
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'w-full flex items-center justify-center gap-3 py-3 px-4 mt-2 rounded-xl text-gray-200 transition-all cursor-pointer font-medium';
    this.element.style.cssText = 'background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(51, 65, 85, 0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.3);';
    this.element.addEventListener('mouseenter', () => {
      this.element.style.background = 'rgba(51, 65, 85, 0.6)';
      this.element.style.borderColor = 'rgba(71, 85, 105, 1)';
    });
    this.element.addEventListener('mouseleave', () => {
      this.element.style.background = 'rgba(30, 41, 59, 0.6)';
      this.element.style.borderColor = 'rgba(51, 65, 85, 0.8)';
    });
    
    let iconHtml = '';
    if (provider === 'google') {
      iconHtml = `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 4.7 1.9 7.1l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/></svg>`;
    } else {
      iconHtml = `<i data-lucide="chrome" class="w-5 h-5 text-gray-400"></i>`;
    }

    this.element.innerHTML = `
      ${iconHtml}
      <span class="font-medium text-sm text-gray-200">${label}</span>
    `;

    if (provider !== 'google' && window.lucide) {
      window.lucide.createIcons({ root: this.element });
    }

    if (onClick) {
      this.element.addEventListener('click', onClick);
    }

    return this.element;
  }
}
