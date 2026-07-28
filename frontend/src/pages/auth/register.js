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

export class RegisterPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  async handleSubmit(e) {
    e.preventDefault();

    const validations = await Promise.all([
      this.firstNameField.validateField(),
      this.lastNameField.validateField(),
      this.emailField.validateField(),
      this.passwordField.validateField()
    ]);

    if (validations.includes(false)) {
      return;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.confirmField.setError('كلمات المرور غير متطابقة');
      this.confirmField.element.querySelector('input').focus();
      return;
    }

    this.submitBtn.setLoading(true);

    try {
      await authService.register({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        password: this.state.password
      });

      // The register endpoint creates the account but does not issue a session,
      // so we immediately log in with the same credentials for a seamless flow.
      await authService.login(this.state.email, this.state.password);

      eventBus.emit('toast.show', { type: 'success', message: 'تم إنشاء حسابك بنجاح، أهلاً بك!' });
      router.navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.status === 400 || err.status === 409) {
        this.emailField.setError(err.message || 'البريد الإلكتروني مستخدم بالفعل');
        this.emailField.element.querySelector('input').focus();
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
      title: 'إنشاء حساب جديد',
      subtitle: 'انضم إلى آلاف الطلاب في رحلة المراجعة'
    });
    const cardEl = this.card.render();

    const form = document.createElement('form');
    form.noValidate = true;
    form.className = 'flex flex-col gap-4 mt-6 text-right';

    const nameRow = document.createElement('div');
    nameRow.className = 'grid grid-cols-2 gap-3';

    this.firstNameField = new FormField({
      id: 'register-first-name',
      label: 'الاسم الأول',
      type: 'text',
      placeholder: 'أحمد',
      required: true,
      validators: [Validators.required],
      onChange: (val) => this.setState({ firstName: val }, false)
    });

    this.lastNameField = new FormField({
      id: 'register-last-name',
      label: 'اسم العائلة',
      type: 'text',
      placeholder: 'محمد',
      required: true,
      validators: [Validators.required],
      onChange: (val) => this.setState({ lastName: val }, false)
    });

    this.emailField = new FormField({
      id: 'register-email',
      label: 'البريد الإلكتروني',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
      icon: 'mail',
      validators: [Validators.required, Validators.email],
      onChange: (val) => this.setState({ email: val }, false)
    });

    this.passwordField = new PasswordField({
      id: 'register-password',
      label: 'كلمة المرور',
      placeholder: '••••••••',
      required: true,
      validators: [Validators.required, Validators.passwordStrength],
      onChange: (val) => this.setState({ password: val }, false)
    });

    this.confirmField = new PasswordField({
      id: 'register-confirm-password',
      label: 'تأكيد كلمة المرور',
      placeholder: '••••••••',
      required: true,
      validators: [Validators.required],
      onChange: (val) => this.setState({ confirmPassword: val }, false)
    });

    this.submitBtn = new LoadingButton({
      text: 'إنشاء الحساب',
      type: 'submit',
      className: 'w-full py-3 text-lg font-bold'
    });

    nameRow.appendChild(this.firstNameField.render());
    nameRow.appendChild(this.lastNameField.render());

    form.appendChild(nameRow);
    form.appendChild(this.emailField.render());
    form.appendChild(this.passwordField.render());
    form.appendChild(this.confirmField.render());
    form.appendChild(this.submitBtn.render());

    const loginLink = document.createElement('p');
    loginLink.className = 'text-center text-sm text-gray-400 mt-4';
    loginLink.innerHTML = 'عندك حساب بالفعل؟ <a href="/login" id="go-to-login" class="text-primary font-medium">سجل دخولك</a>';
    form.appendChild(loginLink);

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.firstNameField.mount();
    this.lastNameField.mount();
    this.emailField.mount();
    this.passwordField.mount();
    this.confirmField.mount();
    this.submitBtn.mount();

    cardEl.querySelector('#auth-form-container').appendChild(form);
    layoutEl.querySelector('#auth-content').appendChild(cardEl);

    this.registerChild(this.layout);
    this.registerChild(this.card);
    this.registerChild(this.firstNameField);
    this.registerChild(this.lastNameField);
    this.registerChild(this.emailField);
    this.registerChild(this.passwordField);
    this.registerChild(this.confirmField);
    this.registerChild(this.submitBtn);

    this.addEventListener(loginLink.querySelector('#go-to-login'), 'click', (e) => {
      e.preventDefault();
      router.navigate('/login');
    });

    return layoutEl;
  }
}
