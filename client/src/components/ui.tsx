import { ArrowLeft, Heart, Leaf, ShieldCheck, X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { whatsappUrl } from '../lib/api';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
export const icons = { leaf: Leaf, heart: Heart, shield: ShieldCheck };
export function Button({
  children,
  kind = '',
  icon = true,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: string; icon?: boolean }) {
  return (
    <button className={`btn ${kind}`} {...props}>
      {children}
      {icon && <ArrowLeft size={21} aria-hidden="true" />}
    </button>
  );
}
export function ButtonLink({
  to,
  children,
  kind = '',
  className = '',
  style,
  onClick,
}: {
  to: string;
  children: ReactNode;
  kind?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <Link className={`btn ${kind} ${className}`.trim()} to={to} style={style} onClick={onClick}>
      {children}
      <ArrowLeft size={21} aria-hidden="true" />
    </Link>
  );
}
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="link" to={to}>
      {children}
      <ArrowLeft size={20} aria-hidden="true" />
    </Link>
  );
}
export function Brand() {
  const { data } = useCatalog();
  return (
    <Link className="brand" to="/" aria-label="مركز المستقبل — الصفحة الرئيسية">
      <span className="brand-symbol">
        <img src="/assets/brand-mark.png" alt="شعار مركز المستقبل" width="47" height="47" />
      </span>
      <span className="brand-text">
        <strong className="brand-name">{data?.clinic.name || 'مركز المستقبل'}</strong>
        <small className="brand-sub">{data?.clinic.subtitle || 'للتغذية والتخسيس'}</small>
      </span>
    </Link>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (open && !el?.open) el?.showModal();
    if (!open && el?.open) el.close();
    if (open) {
      const old = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = old;
      };
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={id}
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={id}>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="إغلاق">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Loading({ label = 'جاري تحميل البيانات...' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {label}
    </div>
  );
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <h2>تعذر إكمال الخطوة الآن.</h2>
      <p>{message}</p>
      {onRetry ? (
        <Button onClick={onRetry}>حاولي مرة أخرى</Button>
      ) : (
        <ButtonLink to="/">العودة للرئيسية</ButtonLink>
      )}
    </div>
  );
}
export function WhatsAppLink({
  phone,
  message,
  children,
  kind = 'btn-whatsapp',
  className = '',
}: {
  phone: string;
  message: string;
  children: ReactNode;
  kind?: string;
  className?: string;
}) {
  return (
    <a
      className={`btn ${kind} ${className}`.trim()}
      target="_blank"
      rel="noopener noreferrer"
      href={whatsappUrl(phone, message)}
    >
      {children}
      <WhatsAppIcon size={20} color="currentColor" />
    </a>
  );
}
