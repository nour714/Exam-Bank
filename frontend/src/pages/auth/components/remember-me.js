import { BaseComponent } from '../../../../core/component.js';

export class RememberMe extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      checked: props.checked || false
    };
  }

  getValue() {
    return this.state.checked;
  }

  render() {
    const { id = 'remember-me', label = 'تذكرني', onForgotClick } = this.props;

    this.element = document.createElement('div');
    this.element.className = 'flex items-center justify-between mt-2 mb-6';
    
    this.element.innerHTML = `
      <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
          <input type="checkbox" id="${id}" class="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" ${this.state.checked ? 'checked' : ''}>
          <span>${label}</span>
      </label>
      <button type="button" id="btn-forgot" class="text-sm text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer p-0">
          نسيت كلمة المرور؟
      </button>
    `;

    const checkbox = this.element.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      this.state.checked = e.target.checked;
      if (this.props.onChange) this.props.onChange(this.state.checked);
    });

    const forgotBtn = this.element.querySelector('#btn-forgot');
    if (onForgotClick) {
      forgotBtn.addEventListener('click', onForgotClick);
    }

    return this.element;
  }
}
