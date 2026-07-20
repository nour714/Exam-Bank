import { BaseComponent } from '../../../core/component.js';

export class AuthCard extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { title, subtitle } = this.props;
    
    this.element = document.createElement('div');
    this.element.className = 'login-box'; // Uses legacy class for exact styling match
    
    this.element.innerHTML = `
      <div class="login-icon">
          <i data-lucide="shield-check" class="text-white w-8 h-8"></i>
      </div>
      <h1>${title}</h1>
      <p>${subtitle}</p>
      
      <div id="auth-form-container"></div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    return this.element;
  }
}
