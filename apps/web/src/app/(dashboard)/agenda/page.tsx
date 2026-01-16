import { Header } from '@/components/dashboard/Header';
import { SchedulingCalendar } from '@/components/scheduling/SchedulingCalendar';

export const metadata = {
  title: 'Agenda | JurisNexo',
};

export default function SchedulePage() {
  return (
    <>
      <Header showSearch={false} />
      <div className="p-8">
        <SchedulingCalendar />
      </div>
    </>
  );
}
