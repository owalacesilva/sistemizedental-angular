import type { DoctorsList } from './doctors.models';

/** Sample clinical team used when the API is unreachable and demo mode is on. */
export function demoDoctors(): DoctorsList {
  return {
    isDemoData: true,
    rows: [
      {
        id: 11,
        name: 'Dr. Alex Moreira',
        email: 'alex.moreira@sistemizedental.com',
        phone: '+55 11 98111-2233',
        birthDate: '1980-04-18',
        blocked: false,
        workingDays: [1, 2, 3, 4, 5],
      },
      {
        id: 12,
        name: 'Dr. Bianca Lima',
        email: 'bianca.lima@sistemizedental.com',
        phone: '+55 11 98222-3344',
        birthDate: '1987-09-06',
        blocked: false,
        workingDays: [1, 3, 5, 6],
      },
      {
        id: 13,
        name: 'Dr. Caio Nunes',
        email: 'caio.nunes@sistemizedental.com',
        phone: '+55 11 98333-4455',
        birthDate: '1975-12-29',
        blocked: false,
        workingDays: [2, 4, 6],
      },
      {
        id: 14,
        name: 'Dr. Daniela Prado',
        email: 'daniela.prado@sistemizedental.com',
        phone: '+55 11 98444-5566',
        birthDate: '1992-06-11',
        blocked: false,
        workingDays: [1, 2, 3, 4],
      },
      {
        id: 15,
        name: 'Dr. Eduardo Ramalho',
        email: 'eduardo.ramalho@sistemizedental.com',
        phone: '+55 11 98555-6677',
        birthDate: '1969-02-03',
        blocked: true,
        workingDays: [],
      },
      {
        id: 16,
        name: 'Dr. Fabiana Cruz',
        email: 'fabiana.cruz@sistemizedental.com',
        phone: null,
        birthDate: null,
        blocked: false,
        workingDays: [3, 4, 5],
      },
    ],
  };
}
