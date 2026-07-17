/**
 * Button Component.
 * @param {Object} props
 * @param {string} props.label - Button text
 * @param {string} [props.variant] - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} [props.size] - 'sm' | 'md' | 'lg'
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {string} [props.type] - 'button' | 'submit'
 * @param {Function} [props.onClick]
 * @returns {HTMLButtonElement}
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick
}) {
  const btn = document.createElement('button');
  btn.type = type;
  btn.className = `btn btn-${variant} btn-${size}`;
  if (disabled || loading) btn.disabled = true;

  if (loading) {
    btn.innerHTML = `<span class="spinner spinner-sm"></span> ${label}`;
  } else {
    btn.textContent = label;
  }

  if (onClick && !disabled && !loading) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}
