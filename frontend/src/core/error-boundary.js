import { BaseComponent } from './component.js';
import { measure } from './observability.js';

/**
 * ErrorBoundary Component
 * Wraps a child component, catches rendering/mounting errors, and displays a fallback UI.
 */
export class ErrorBoundary extends BaseComponent {
  /**
   * @param {Object} props
   * @param {BaseComponent} props.child - The component to wrap
   * @param {string} [props.fallbackMessage='حدث خطأ غير متوقع'] - Custom error message
   * @param {Function} [props.onRetry] - Optional custom retry logic
   */
  constructor(props) {
    super(props);
    this.child = props.child;
    this.hasError = false;
    this.errorMessage = null;

    if (this.child) {
      this.registerChild(this.child);
    }
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'error-boundary-wrapper h-full w-full';
    
    this._renderContent();
    return this.element;
  }

  mount() {
    super.mount();
    if (!this.hasError && this.child && typeof this.child.mount === 'function') {
      try {
        this.child.mount();
      } catch (err) {
        this._handleError(err, 'mount');
      }
    }
  }

  _renderContent() {
    this.element.innerHTML = '';
    if (this.hasError) {
      this.element.appendChild(this._createFallbackUI());
    } else if (this.child) {
      try {
        const childEl = this.child.render();
        this.element.appendChild(childEl);
      } catch (err) {
        this._handleError(err, 'render');
      }
    }
  }

  _handleError(err, phase) {
    console.error(`[ErrorBoundary] Caught error during ${phase}:`, err);
    
    // Log to observability (simulated here with measure, but ideally a dedicated error logger)
    // measure(`error:${this.child.constructor.name || 'UnknownComponent'}`, 'error', () => { throw err }).catch(()=>{});
    
    this.hasError = true;
    this.errorMessage = err.message;
    
    if (this._isMounted) {
      this._renderContent();
    }
  }

  _createFallbackUI() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center justify-center p-8 text-center bg-gray-800/50 rounded-xl border border-danger/20';
    
    const msg = this.props.fallbackMessage || 'حدث خطأ أثناء تحميل هذا العنصر';
    
    wrapper.innerHTML = `
      <i data-lucide="alert-triangle" class="w-12 h-12 text-danger mb-4"></i>
      <h3 class="text-lg font-bold text-white mb-2">عذراً، حدث خطأ!</h3>
      <p class="text-gray-400 mb-4 text-sm">${msg}</p>
      <button class="btn btn-primary" id="boundary-retry">
        <i data-lucide="refresh-cw" class="w-4 h-4 ml-2"></i>
        إعادة المحاولة
      </button>
    `;

    wrapper.querySelector('#boundary-retry').addEventListener('click', () => this.retry());

    if (window.lucide) {
      window.lucide.createIcons({ root: wrapper });
    }
    return wrapper;
  }

  retry() {
    this.hasError = false;
    this.errorMessage = null;
    
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // Default retry: recreate the child component if a factory is provided, or just try re-rendering
      // If the child's constructor takes no args, we can try to re-instantiate it, but it's risky without a factory.
      // Easiest generic fallback is just forcing a re-render/re-mount of the existing instance,
      // though if its internal state is corrupted, a factory pattern would be better.
      this._renderContent();
      if (this.child && typeof this.child.mount === 'function') {
        try { this.child.mount(); } catch (err) { this._handleError(err, 'remount'); }
      }
    }
  }
}
