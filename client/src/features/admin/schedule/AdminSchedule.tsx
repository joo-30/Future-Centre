import { useQuery } from '@tanstack/react-query';
import { ErrorState, Loading } from '../../../components/ui';
import { adminApi } from '../../../lib/portal-api';
import { ConsoleTitle } from '../components/ConsoleTitle';
import { ScheduleEditor } from './ScheduleEditor';

export function AdminSchedule() {
  const scheduleQuery = useQuery({ queryKey: ['admin', 'schedule'], queryFn: adminApi.schedule });
  return (
    <>
      <ConsoleTitle
        title="أوقات العمل والتوافر"
        description="حددي أيام العمل والاستراحات والفترات غير المتاحة."
      />
      {scheduleQuery.isPending ? (
        <Loading />
      ) : scheduleQuery.error || !scheduleQuery.data ? (
        <ErrorState message={scheduleQuery.error?.message || 'تعذر تحميل الجدول.'} />
      ) : (
        <ScheduleEditor initial={scheduleQuery.data} />
      )}
    </>
  );
}
