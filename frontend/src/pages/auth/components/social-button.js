import { BaseComponent } from '../../../core/component.js';

export class SocialButton extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { provider = 'google', label = 'المتابعة باستخدام جوجل', onClick } = this.props;
    
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'w-full flex items-center justify-center gap-3 py-3 px-4 mt-4 bg-transparent border border-gray-600 rounded-xl text-white hover:bg-white/5 transition-colors cursor-pointer';
    
    // We'll just use a generic icon for now, or lucide icons if available
    const iconMap = {
      'google': 'chrome',
      'github': 'github',
      'facebook': 'facebook'
    };

    const icon = iconMap[provider] || 'chrome';

    this.element.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5"></i>
      <span class="font-medium">${label}</span>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    if (onClick) {
      this.element.addEventListener('click', onClick);
    }

    return this.element;
  }
}
