import { authService } from '../../services/auth.service.js';
import { router } from '../../core/router.js';
import { eventBus } from '../../core/event-bus.js';
import { Input, setInputError } from '../../design-system/components/forms/input.js';
import { Button } from '../../design-system/components/forms/button.js';

export async function LoginPage() {
  const container = document.createElement('div');
  container.className = 'flex items-center justify-center h-full w-full';
  
  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = '100%';
  card.style.maxWidth = '400px';

  const header = document.createElement('div');
  header.className = 'card-header text-center';
  const title = document.createElement('h2');
  title.textContent = 'Welcome Back';
  const subtitle = document.createElement('p');
  subtitle.className = 'text-muted text-sm mt-2';
  subtitle.textContent = 'Enter your credentials to access your account.';
  header.appendChild(title);
  header.appendChild(subtitle);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'card-body flex-col gap-4';

  let emailValue = '';
  let passwordValue = '';

  const emailInput = Input({
    id: 'login-email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
    onChange: (val) => emailValue = val
  });

  const passwordInput = Input({
    id: 'login-password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
    onChange: (val) => passwordValue = val
  });

  body.appendChild(emailInput);
  body.appendChild(passwordInput);

  const submitBtn = Button({
    label: 'Log In',
    variant: 'primary',
    size: 'lg',
    type: 'submit'
  });
  submitBtn.style.width = '100%';

  body.appendChild(submitBtn);

  const footer = document.createElement('div');
  footer.className = 'card-footer text-center';
  const registerText = document.createElement('p');
  registerText.className = 'text-sm text-secondary';
  registerText.innerHTML = `Don't have an account? <a href="/register">Sign up</a>`;
  footer.appendChild(registerText);

  card.appendChild(body);
  card.appendChild(footer);
  container.appendChild(card);

  // Form Submission Logic
  submitBtn.onclick = async () => {
    setInputError('login-email', '');
    setInputError('login-password', '');

    if (!emailValue) return setInputError('login-email', 'Email is required');
    if (!passwordValue) return setInputError('login-password', 'Password is required');

    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Logging in...';
    submitBtn.disabled = true;

    try {
      await authService.login(emailValue, passwordValue);
      eventBus.emit('toast:show', { type: 'success', title: 'Success', message: 'Logged in successfully.' });
      router.navigate('/dashboard');
    } catch (err) {
      if (err.status === 401) {
        setInputError('login-email', 'Invalid email or password.');
      } else {
        eventBus.emit('toast:show', { type: 'error', title: 'Login Failed', message: err.message || 'An error occurred' });
      }
    } finally {
      submitBtn.textContent = 'Log In';
      submitBtn.disabled = false;
    }
  };

  return container;
}
