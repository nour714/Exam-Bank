import { FormField } from './form-field.js';

export class PasswordField extends FormField {
  constructor(props = {}) {
    super(props);
    this.state = {
      ...this.state,
      showPassword: false
    };
  }

  toggleVisibility() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    const { id, label = 'كلمة المرور', placeholder = '••••••••', required } = this.props;
    const hasError = this.state.touched && this.state.error;
    const inputType = this.state.showPassword ? 'text' : 'password';
    const eyeIcon = this.state.showPassword ? 'eye-off' : 'eye';

    this.element = document.createElement('div');
    this.element.className = 'input-group relative';

    this.element.innerHTML = `
      <label for="${id}" class="input-label">${label}${required ? ' *' : ''}</label>
      <div class="relative flex items-center">
          <i data-lucide="lock" class="absolute right-3 text-gray-400 w-5 h-5 pointer-events-none"></i>
          <input 
            type="${inputType}" 
            id="${id}" 
            class="input-control w-full ${hasError ? 'input-error' : ''} pr-10 pl-10" 
            placeholder="${placeholder}"
            value="${this.state.value}"
            ${required ? 'required' : ''}
            aria-invalid="${hasError ? 'true' : 'false'}"
            aria-describedby="${id}-error"
          />
          <button type="button" class="absolute left-3 text-gray-400 hover:text-primary-color bg-transparent border-none cursor-pointer p-0 flex items-center justify-center" aria-label="Toggle password visibility">
              <i data-lucide="${eyeIcon}" class="w-5 h-5"></i>
          </button>
      </div>
      <span id="${id}-error" class="error-text ${hasError ? '' : 'hidden'}" aria-live="polite">${hasError ? this.state.error : ''}</span>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.element });

    const inputEl = this.element.querySelector('input');
    inputEl.addEventListener('input', (e) => {
      this.state.value = e.target.value;
      if (this.state.touched) {
        this.validateField();
      }
      if (this.props.onChange) {
        this.props.onChange(this.state.value);
      }
    });

    inputEl.addEventListener('blur', () => {
      this.setState({ touched: true });
      this.validateField();
    });

    const toggleBtn = this.element.querySelector('button');
    toggleBtn.addEventListener('click', () => {
      this.toggleVisibility();
    });

    return this.element;
  }
}
