import { BaseComponent } from '../../../core/component.js';

export class LoadingButton extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      loading: props.loading || false,
      text: props.text || 'إرسال'
    };
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  render() {
    const { variant = 'primary', className = '', type = 'button', onClick } = this.props;

    this.element = document.createElement('button');
    this.element.type = type;
    this.element.className = `btn btn-${variant} ${className}`;
    
    if (this.state.loading) {
      this.element.disabled = true;
      this.element.innerHTML = `
        <svg class="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        جاري التحميل...
      `;
    } else {
      this.element.disabled = false;
      this.element.textContent = this.state.text;
    }

    if (onClick && !this.state.loading) {
      this.element.addEventListener('click', onClick);
    }

    return this.element;
  }
}
