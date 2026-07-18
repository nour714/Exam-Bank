import { BaseComponent } from '../../../../core/component.js';
import { validate } from '../../../../core/validation.js';

export class FormField extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      value: props.value || '',
      error: null,
      touched: false
    };
  }

  async validateField() {
    if (!this.props.validators) return true;
    const error = await validate(this.state.value, this.props.validators);
    this.setState({ error, touched: true });
    return !error;
  }

  getValue() {
    return this.state.value;
  }

  setError(error) {
    this.setState({ error, touched: true });
  }

  render() {
    const { id, label, type = 'text', placeholder = '', required, icon } = this.props;
    const hasError = this.state.touched && this.state.error;

    this.element = document.createElement('div');
    this.element.className = 'input-group relative';

    let iconHtml = '';
    if (icon) {
      iconHtml = `<i data-lucide="${icon}" class="absolute right-3 top-[38px] text-gray-400 w-5 h-5" style="top: 38px;"></i>`;
    }

    this.element.innerHTML = `
      <label for="${id}" class="input-label">${label}${required ? ' *' : ''}</label>
      <div style="position: relative;">
          ${iconHtml}
          <input 
            type="${type}" 
            id="${id}" 
            class="input-control w-full ${hasError ? 'input-error' : ''} ${icon ? 'pr-10' : ''}" 
            placeholder="${placeholder}"
            value="${this.state.value}"
            ${required ? 'required' : ''}
            aria-invalid="${hasError ? 'true' : 'false'}"
            aria-describedby="${id}-error"
          />
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

    return this.element;
  }
}
