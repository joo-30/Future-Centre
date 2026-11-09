import { Check, Circle, ShieldCheck } from 'lucide-react';

export interface PasswordStrengthProps {
  password?: string;
  showDetails?: boolean;
}

export function computePasswordScore(password: string = ''): {
  score: number;
  label: string;
  colorClass: string;
  hasLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
  hasBonus: boolean;
} {
  const p = password || '';
  if (!p) {
    return {
      score: 0,
      label: 'بانتظار الإدخال...',
      colorClass: 'pwm-idle',
      hasLength: false,
      hasNumber: false,
      hasLetter: false,
      hasBonus: false,
    };
  }

  const hasLength = p.length >= 8;
  const hasNumber = /\d/.test(p);
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(p);
  const hasBonus = /[^a-zA-Z0-9\u0600-\u06FF]/.test(p) || /[A-Z]/.test(p) || p.length >= 10;

  let score = 1;

  if (p.length < 6) {
    score = 1;
  } else {
    let passed = 0;
    if (hasLength) passed++;
    if (hasNumber && hasLetter) passed++;
    if (hasBonus) passed++;

    if (passed === 0) score = 1;
    else if (passed === 1) score = 2;
    else if (passed === 2) score = 3;
    else score = 4;
  }

  const levels: Record<number, { label: string; colorClass: string }> = {
    1: { label: 'ضعيفة جداً', colorClass: 'pwm-weak' },
    2: { label: 'مقبولة', colorClass: 'pwm-fair' },
    3: { label: 'جيدة ومناسبة', colorClass: 'pwm-good' },
    4: { label: 'قوية ومحمية', colorClass: 'pwm-strong' },
  };

  const level = levels[score] || levels[1];

  return {
    score,
    label: level.label,
    colorClass: level.colorClass,
    hasLength,
    hasNumber,
    hasLetter,
    hasBonus,
  };
}

export function PasswordStrengthMeter({ password = '', showDetails = true }: PasswordStrengthProps) {
  const { score, label, colorClass, hasLength, hasNumber, hasLetter } = computePasswordScore(password);

  return (
    <div className={`password-strength-meter ${colorClass}`} aria-live="polite">
      {/* Top Header Row with Score Label */}
      <div className="pwm-header">
        <span className="pwm-title">مستوى أمان كلمة المرور:</span>
        <span className={`pwm-badge ${colorClass}`}>{label}</span>
      </div>

      {/* 4-Segment Progress Bar */}
      <div className="pwm-bars" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
        <div className={`pwm-bar ${score >= 1 ? 'filled' : ''}`} />
        <div className={`pwm-bar ${score >= 2 ? 'filled' : ''}`} />
        <div className={`pwm-bar ${score >= 3 ? 'filled' : ''}`} />
        <div className={`pwm-bar ${score >= 4 ? 'filled' : ''}`} />
      </div>

      {/* Checklist Pills */}
      {showDetails && (
        <div className="pwm-checklist">
          <span className={`pwm-check-pill ${hasLength ? 'valid' : ''}`}>
            {hasLength ? <Check size={12} className="check-icon" /> : <Circle size={10} className="dot-icon" />}
            <span>8 أحرف على الأقل</span>
          </span>

          <span className={`pwm-check-pill ${hasNumber ? 'valid' : ''}`}>
            {hasNumber ? <Check size={12} className="check-icon" /> : <Circle size={10} className="dot-icon" />}
            <span>أرقام (0-9)</span>
          </span>

          <span className={`pwm-check-pill ${hasLetter ? 'valid' : ''}`}>
            {hasLetter ? <Check size={12} className="check-icon" /> : <Circle size={10} className="dot-icon" />}
            <span>حروف (إنجليزية أو عربية)</span>
          </span>
        </div>
      )}

      {/* Security Assurance Footer */}
      <div className="pwm-assurance">
        <ShieldCheck size={14} className="shield-icon" />
        <span>تشفير سريري آمن (scrypt) · لا يتم تخزين كلمة المرور بصيغة مقروءة إطلاقاً لحماية سرية ملفك الطبي.</span>
      </div>
    </div>
  );
}
