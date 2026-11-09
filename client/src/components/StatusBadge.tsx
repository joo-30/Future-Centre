import { statusLabels } from '@future/shared';

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    ...statusLabels,
    new: 'طلب جديد',
    contacted: 'تم التواصل',
    converted: 'تمت المتابعة',
    closed: 'مغلق',
    active: 'نشط',
    paused: 'متوقف مؤقتًا',
  };
  return (
    <span className={'state-badge state-' + status}>
      <i />
      {labels[status] || status}
    </span>
  );
}
