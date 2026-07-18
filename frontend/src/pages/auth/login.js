import { BaseComponent } from '../../core/component.js';
import { authService } from '../../services/auth.service.js';
import { router } from '../../core/router.js';
import { eventBus } from '../../core/event-bus.js';
import { Validators } from '../../core/validation.js';

import { AuthLayout } from './components/auth-layout.js';
import { AuthCard } from './components/auth-card.js';
import { FormField } from '../../design-system/components/forms/form-field.js';
import { PasswordField } from '../../design-system/components/forms/password-field.js';
import { LoadingButton } from '../../design-system/components/forms/loading-button.js';
import { RememberMe } from './components/remember-me.js';
import { SocialButton } from './components/social-button.js';

export class LoginPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      rememberMe: false,
      loading: false
    };
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields asynchronously
    const isEmailValid = await this.emailField.validateField();
    const isPasswordValid = await this.passwordField.validateField();

    if (!isEmailValid || !isPasswordValid) {
      // UX Improvement: autofocus on the first invalid field
      if (!isEmailValid) {
        this.emailField.element.querySelector('input').focus();
      } else {
        this.passwordField.element.querySelector('input').focus();
      }
      return;
    }

    this.submitBtn.setLoading(true);
    
    try {
      await authService.login(this.state.email, this.state.password);
      eventBus.emit('toast.show', { type: 'success', message: 'تم تسجيل الدخول بنجاح.' });
      // Router redirection is handled via global guards or explicit navigation
      router.navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.status === 401) {
        this.passwordField.setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        eventBus.emit('toast.show', { type: 'error', message: err.message || 'حدث خطأ غير متوقع' });
      }
    } finally {
      this.submitBtn.setLoading(false);
    }
  }

  render() {
    this.layout = new AuthLayout();
    const layoutEl = this.layout.render();

    this.card = new AuthCard({
      title: 'أهلاً بك مجدداً',
      subtitle: 'سجل دخولك لمتابعة تقدمك في المراجعة'
    });
    const cardEl = this.card.render();

    const form = document.createElement('form');
    form.noValidate = true;
    form.className = 'flex flex-col gap-4 mt-6 text-right';

    this.emailField = new FormField({
      id: 'login-email',
      label: 'البريد الإلكتروني',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
      icon: 'mail',
      validators: [Validators.required, Validators.email],
      onChange: (val) => this.setState({ email: val }, false)
    });

    this.passwordField = new PasswordField({
      id: 'login-password',
      label: 'كلمة المرور',
      placeholder: '••••••••',
      required: true,
      validators: [Validators.required],
      onChange: (val) => this.setState({ password: val }, false)
    });

    this.rememberMe = new RememberMe({
      id: 'login-remember',
      checked: this.state.rememberMe,
      onChange: (val) => this.setState({ rememberMe: val }, false),
      onForgotClick: () => router.navigate('/forgot-password')
    });

    this.submitBtn = new LoadingButton({
      text: 'تسجيل الدخول',
      type: 'submit',
      className: 'w-full py-3 text-lg font-bold'
    });

    const googleBtn = new SocialButton({
      provider: 'google',
      label: 'المتابعة باستخدام جوجل',
      onClick: () => {
        eventBus.emit('toast.show', { type: 'info', message: 'جاري تسجيل الدخول عبر جوجل...' });
        // Implement OAuth logic via authService later
      }
    });

    form.appendChild(this.emailField.render());
    form.appendChild(this.passwordField.render());
    form.appendChild(this.rememberMe.render());
    form.appendChild(this.submitBtn.render());
    
    const divider = document.createElement('div');
    divider.className = 'flex items-center my-4 gap-3 text-gray-500 text-sm';
    divider.innerHTML = '<div class="h-px bg-gray-600 flex-1"></div><span>أو</span><div class="h-px bg-gray-600 flex-1"></div>';
    form.appendChild(divider);
    
    form.appendChild(googleBtn.render());

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Mount children
    this.emailField.mount();
    this.passwordField.mount();
    this.rememberMe.mount();
    this.submitBtn.mount();
    googleBtn.mount();

    cardEl.querySelector('#auth-form-container').appendChild(form);
    layoutEl.querySelector('#auth-content').appendChild(cardEl);

    // Register children for proper disposal
    this.registerChild(this.layout);
    this.registerChild(this.card);
    this.registerChild(this.emailField);
    this.registerChild(this.passwordField);
    this.registerChild(this.rememberMe);
    this.registerChild(this.submitBtn);
    this.registerChild(googleBtn);

    return layoutEl;
  }
}
