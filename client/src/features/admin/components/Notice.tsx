import { Check } from 'lucide-react';

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return message ? (
    <p className={error ? 'form-error' : 'save-notice'} role={error ? 'alert' : 'status'}>
      {!error && <Check size={18} />} {message}
    </p>
  ) : null;
}
