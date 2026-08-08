import type { DashboardData } from './dashboard.models';

/** Offsets keep the sample schedule anchored to "today" whenever it is rendered. */
function todayAt(hours: number, minutes: number): string {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** Sample practice data used when the API is unreachable and demo mode is on. */
export function demoDashboardData(): DashboardData {
  return {
    isDemoData: true,
    metrics: {
      appointmentsToday: 14,
      newPatientsThisMonth: 38,
      revenueThisMonth: 48250,
      chairOccupancy: 0.82,
    },
    appointments: [
      {
        id: 1,
        patientName: 'Marina Alves',
        doctorName: 'Dr. Alex Moreira',
        startsAt: todayAt(9, 0),
        procedure: 'Routine cleaning',
        status: 'confirmed',
      },
      {
        id: 2,
        patientName: 'Rafael Costa',
        doctorName: 'Dr. Bianca Lima',
        startsAt: todayAt(10, 30),
        procedure: 'Root canal — session 2',
        status: 'confirmed',
      },
      {
        id: 3,
        patientName: 'Helena Souza',
        doctorName: 'Dr. Alex Moreira',
        startsAt: todayAt(13, 15),
        procedure: 'Orthodontic adjustment',
        status: 'pending',
      },
      {
        id: 4,
        patientName: 'Tomás Ferreira',
        doctorName: 'Dr. Caio Nunes',
        startsAt: todayAt(15, 0),
        procedure: 'Implant consultation',
        status: 'confirmed',
      },
      {
        id: 5,
        patientName: 'Júlia Barbosa',
        doctorName: 'Dr. Bianca Lima',
        startsAt: todayAt(16, 45),
        procedure: 'Whitening follow-up',
        status: 'canceled',
      },
    ],
    patients: [
      { id: 101, name: 'Marina Alves', lastVisit: daysAgo(2), phone: '+55 11 98123-4455' },
      { id: 102, name: 'Rafael Costa', lastVisit: daysAgo(5), phone: '+55 11 99420-7788' },
      { id: 103, name: 'Helena Souza', lastVisit: daysAgo(9), phone: '+55 21 98765-1122' },
      { id: 104, name: 'Tomás Ferreira', lastVisit: null, phone: '+55 31 99011-3344' },
      { id: 105, name: 'Júlia Barbosa', lastVisit: daysAgo(21), phone: null },
    ],
  };
}
