import { NEW_PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '@future/shared';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useId, useState } from 'react';

export interface PasswordFieldProps {
  name?: string;
  label?: string;
  labelTag?: string;
  current?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  showLockIcon?: boolean;
}

export function PasswordField({
  name = 'password',
  label = 'كلمة المرور',
  labelTag,
  current = false,
  value,
  onChange,
  placeholder = '••••••••',
  required = true,
  autoComplete,
  showLockIcon = true,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const hintId = useId();

  return (
    <div className="password-field-container">
      <label className="field">
        <div className="field-label-row">
          <span className="field-label-text">{label}</span>
          {labelTag && <span className="field-label-tag">{labelTag}</span>}
        </div>
        <div className="password-input">
          {showLockIcon && (
            <span className="password-field-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
          )}
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
            className={showLockIcon ? 'has-lock-icon' : ''}
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            title={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={() => setShow(!show)}
            tabIndex={-1}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {!current && (
        <p id={hintId} className="password-field-hint">
          {NEW_PASSWORD_MIN_LENGTH} خانات على الأقل.
        </p>
      )}
    </div>
  );
}
