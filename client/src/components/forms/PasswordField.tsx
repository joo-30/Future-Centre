import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

export interface PasswordFieldProps {
  name?: string;
  label?: string;
  current?: boolean;
  showStrengthMeter?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function PasswordField({
  name = 'password',
  label = 'كلمة المرور',
  current = false,
  showStrengthMeter,
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
  autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [internalVal, setInternalVal] = useState('');

  const displayStrength = showStrengthMeter !== undefined ? showStrengthMeter : true;
  const currentVal = value !== undefined ? value : internalVal;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInternalVal(e.target.value);
    if (onChange) {
      onChange(e);
    }
  }

  const effectiveMinLength = current ? 1 : minLength ?? 8;

  return (
    <div className="password-field-container">
      <label className="field">
        <span className="field-label-text">{label}</span>
        <span className="password-input">
          <input
            name={name}
            type={show ? 'text' : 'password'}
            autoComplete={autoComplete || 'new-password'}
            required={required}
            minLength={effectiveMinLength}
            maxLength={128}
            value={value !== undefined ? value : internalVal}
            onChange={handleChange}
            placeholder={placeholder || (current ? 'أدخل كلمة المرور' : 'أدخل كلمة المرور')}
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            title={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </span>
      </label>

      {displayStrength && <PasswordStrengthMeter password={currentVal} />}
    </div>
  );
}
