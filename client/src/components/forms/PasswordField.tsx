import { NEW_PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@future/shared';
import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

export interface PasswordFieldProps {
  name?: string;
  label?: string;
  current?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

export function PasswordField({
  name = 'password',
  label = 'كلمة المرور',
  current = false,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const hintId = useId();

  return (
    <div className="password-field-container">
      <label className="field">
        <span className="field-label-text">{label}</span>
        <span className="password-input">
          <input
            name={name}
            type={show ? 'text' : 'password'}
            autoComplete={autoComplete || (current ? 'current-password' : 'new-password')}
            required={required}
            minLength={current ? undefined : NEW_PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-describedby={current ? undefined : hintId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
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

      {!current && (
        <p id={hintId} className="password-field-hint">
          {NEW_PASSWORD_MIN_LENGTH} خانات على الأقل.
        </p>
      )}
    </div>
  );
}
