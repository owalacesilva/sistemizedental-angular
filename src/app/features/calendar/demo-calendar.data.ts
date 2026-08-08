import { eachDay } from './calendar.dates';
import type { Schedule, ScheduleDoctor, ScheduleEvent, ScheduleQuery } from './calendar.models';

const DOCTORS: readonly ScheduleDoctor[] = [
  { id: 11, name: 'Dr. Alex Moreira' },
  { id: 12, name: 'Dr. Bianca Lima' },
  { id: 13, name: 'Dr. Caio Nunes' },
];

interface Slot {
  readonly hour: number;
  readonly minute: number;
  readonly minutes: number;
  readonly patientName: string;
  readonly procedure: string;
  readonly doctor: number;
  readonly status: ScheduleEvent['status'];
}

/** A plausible week: busy weekdays, a short Saturday, a closed Sunday. */
const PLANS: Record<number, readonly Slot[]> = {
  0: [],
  1: [
    {
      hour: 8,
      minute: 0,
      minutes: 60,
      patientName: 'Marina Alves',
      procedure: 'Routine cleaning',
      doctor: 0,
      status: 'confirmed',
    },
    {
      hour: 9,
      minute: 30,
      minutes: 90,
      patientName: 'Rafael Costa',
      procedure: 'Root canal — session 2',
      doctor: 1,
      status: 'confirmed',
    },
    {
      hour: 11,
      minute: 0,
      minutes: 30,
      patientName: 'Helena Souza',
      procedure: 'Orthodontic adjustment',
      doctor: 0,
      status: 'created',
    },
    {
      hour: 14,
      minute: 0,
      minutes: 60,
      patientName: 'Tomás Ferreira',
      procedure: 'Implant consultation',
      doctor: 2,
      status: 'confirmed',
    },
    {
      hour: 16,
      minute: 30,
      minutes: 45,
      patientName: 'Júlia Barbosa',
      procedure: 'Whitening follow-up',
      doctor: 1,
      status: 'created',
    },
  ],
  2: [
    {
      hour: 8,
      minute: 30,
      minutes: 45,
      patientName: 'Diego Ramos',
      procedure: 'Extraction',
      doctor: 2,
      status: 'confirmed',
    },
    {
      hour: 9,
      minute: 0,
      minutes: 60,
      patientName: 'Patrícia Nogueira',
      procedure: 'Veneer fitting',
      doctor: 0,
      status: 'arrived',
    },
    {
      hour: 13,
      minute: 0,
      minutes: 30,
      patientName: 'Lucas Prado',
      procedure: 'Routine cleaning',
      doctor: 1,
      status: 'confirmed',
    },
    {
      hour: 15,
      minute: 0,
      minutes: 90,
      patientName: 'Beatriz Campos',
      procedure: 'Crown preparation',
      doctor: 0,
      status: 'created',
    },
  ],
  3: [
    {
      hour: 8,
      minute: 0,
      minutes: 30,
      patientName: 'Otávio Menezes',
      procedure: 'Check-up',
      doctor: 1,
      status: 'finished',
    },
    {
      hour: 10,
      minute: 0,
      minutes: 60,
      patientName: 'Carla Antunes',
      procedure: 'Gum treatment',
      doctor: 2,
      status: 'confirmed',
    },
    {
      hour: 11,
      minute: 30,
      minutes: 30,
      patientName: 'Sérgio Batista',
      procedure: 'Filling',
      doctor: 0,
      status: 'missed',
    },
    {
      hour: 14,
      minute: 30,
      minutes: 60,
      patientName: 'Renata Vieira',
      procedure: 'Orthodontic adjustment',
      doctor: 1,
      status: 'confirmed',
    },
    {
      hour: 17,
      minute: 0,
      minutes: 45,
      patientName: 'Igor Salgado',
      procedure: 'Implant follow-up',
      doctor: 2,
      status: 'created',
    },
  ],
  4: [
    {
      hour: 9,
      minute: 0,
      minutes: 45,
      patientName: 'Fernanda Rocha',
      procedure: 'Whitening',
      doctor: 0,
      status: 'confirmed',
    },
    {
      hour: 10,
      minute: 30,
      minutes: 90,
      patientName: 'André Pimentel',
      procedure: 'Wisdom tooth surgery',
      doctor: 2,
      status: 'confirmed',
    },
    {
      hour: 13,
      minute: 30,
      minutes: 30,
      patientName: 'Vanessa Lopes',
      procedure: 'Routine cleaning',
      doctor: 1,
      status: 'canceled',
    },
    {
      hour: 16,
      minute: 0,
      minutes: 60,
      patientName: 'Bruno Tavares',
      procedure: 'Denture adjustment',
      doctor: 0,
      status: 'created',
    },
  ],
  5: [
    {
      hour: 8,
      minute: 30,
      minutes: 60,
      patientName: 'Larissa Peixoto',
      procedure: 'Crown fitting',
      doctor: 1,
      status: 'confirmed',
    },
    {
      hour: 10,
      minute: 0,
      minutes: 30,
      patientName: 'Marcelo Duarte',
      procedure: 'Check-up',
      doctor: 0,
      status: 'confirmed',
    },
    {
      hour: 11,
      minute: 0,
      minutes: 45,
      patientName: 'Priscila Amaral',
      procedure: 'Filling',
      doctor: 2,
      status: 'created',
    },
    {
      hour: 15,
      minute: 30,
      minutes: 60,
      patientName: 'Eduardo Bastos',
      procedure: 'Implant consultation',
      doctor: 1,
      status: 'confirmed',
    },
  ],
  6: [
    {
      hour: 9,
      minute: 0,
      minutes: 45,
      patientName: 'Sofia Guimarães',
      procedure: 'Routine cleaning',
      doctor: 0,
      status: 'confirmed',
    },
    {
      hour: 10,
      minute: 0,
      minutes: 60,
      patientName: 'Gustavo Leal',
      procedure: 'Orthodontic adjustment',
      doctor: 2,
      status: 'created',
    },
  ],
};

/** Sample agenda covering whichever window the calendar is showing. */
export function demoSchedule({ start, end }: ScheduleQuery): Schedule {
  let id = 1;

  const events = eachDay(start, end).flatMap((day) =>
    (PLANS[day.getDay()] ?? []).map((slot): ScheduleEvent => {
      const startsAt = new Date(day);
      startsAt.setHours(slot.hour, slot.minute, 0, 0);

      const endsAt = new Date(startsAt.getTime() + slot.minutes * 60_000);
      const doctor = DOCTORS[slot.doctor];

      return {
        id: id++,
        patientName: slot.patientName,
        doctorId: doctor.id,
        doctorName: doctor.name,
        procedure: slot.procedure,
        status: slot.status,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      };
    }),
  );

  return { events, doctors: DOCTORS, isDemoData: true };
}
