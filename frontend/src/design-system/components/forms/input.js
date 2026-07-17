/**
 * Input Component.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.type='text']
 * @param {string} [props.placeholder]
 * @param {string} [props.value]
 * @param {boolean} [props.required]
 * @param {Function} [props.onChange]
 * @returns {HTMLDivElement}
 */
export function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  value = '',
  required = false,
  onChange
}) {
  const group = document.createElement('div');
  group.className = 'input-group';

  if (label) {
    const lbl = document.createElement('label');
    lbl.className = 'input-label';
    lbl.htmlFor = id;
    lbl.textContent = label + (required ? ' *' : '');
    group.appendChild(lbl);
  }

  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.className = 'input-control';
  input.placeholder = placeholder;
  input.value = value;
  if (required) input.required = true;

  if (onChange) {
    input.addEventListener('input', (e) => onChange(e.target.value));
  }

  group.appendChild(input);

  // Error container
  const errorText = document.createElement('span');
  errorText.className = 'error-text hidden';
  errorText.id = `${id}-error`;
  group.appendChild(errorText);

  return group;
}

export function setInputError(id, message) {
  const input = document.getElementById(id);
  const errorText = document.getElementById(`${id}-error`);
  if (input && errorText) {
    if (message) {
      input.classList.add('input-error');
      errorText.textContent = message;
      errorText.classList.remove('hidden');
    } else {
      input.classList.remove('input-error');
      errorText.textContent = '';
      errorText.classList.add('hidden');
    }
  }
}
