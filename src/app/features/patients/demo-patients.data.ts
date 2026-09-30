import type {
  PatientAnamnesis,
  PatientRecord,
  PatientsPage,
  PatientsQuery,
} from './patients.models';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** Fixed roster so paging and search behave like a real dataset. */
const PATIENTS: readonly PatientRecord[] = [
  {
    id: 101,
    name: 'Marina Alves',
    phone: '+55 11 98123-4455',
    email: 'marina.alves@example.com',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1991-03-14',
    lastVisit: daysAgo(2),
    active: true,
  },
  {
    id: 102,
    name: 'Rafael Costa',
    phone: '+55 11 99420-7788',
    email: 'rafael.costa@example.com',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1985-07-02',
    lastVisit: daysAgo(5),
    active: true,
  },
  {
    id: 103,
    name: 'Helena Souza',
    phone: '+55 21 98765-1122',
    email: 'helena.souza@example.com',
    neighborhood: 'Botafogo',
    city: 'Rio de Janeiro',
    state: 'RJ',
    birthDate: '1997-11-23',
    lastVisit: daysAgo(9),
    active: true,
  },
  {
    id: 104,
    name: 'Tomás Ferreira',
    phone: '+55 31 99011-3344',
    email: null,
    neighborhood: 'Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    birthDate: '1978-01-30',
    lastVisit: null,
    active: true,
  },
  {
    id: 105,
    name: 'Júlia Barbosa',
    phone: null,
    email: 'julia.barbosa@example.com',
    neighborhood: 'Moema',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '2001-05-09',
    lastVisit: daysAgo(21),
    active: true,
  },
  {
    id: 106,
    name: 'Diego Ramos',
    phone: '+55 41 98222-5566',
    email: 'diego.ramos@example.com',
    neighborhood: 'Batel',
    city: 'Curitiba',
    state: 'PR',
    birthDate: '1989-09-17',
    lastVisit: daysAgo(34),
    active: true,
  },
  {
    id: 107,
    name: 'Patrícia Nogueira',
    phone: '+55 51 99333-7788',
    email: 'patricia.nogueira@example.com',
    neighborhood: 'Moinhos de Vento',
    city: 'Porto Alegre',
    state: 'RS',
    birthDate: '1972-12-05',
    lastVisit: daysAgo(48),
    active: true,
  },
  {
    id: 108,
    name: 'Lucas Prado',
    phone: '+55 11 97777-1200',
    email: null,
    neighborhood: 'Tatuapé',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1994-04-21',
    lastVisit: daysAgo(63),
    active: false,
  },
  {
    id: 109,
    name: 'Beatriz Campos',
    phone: '+55 85 98111-4321',
    email: 'beatriz.campos@example.com',
    neighborhood: 'Meireles',
    city: 'Fortaleza',
    state: 'CE',
    birthDate: '1966-08-11',
    lastVisit: daysAgo(12),
    active: true,
  },
  {
    id: 110,
    name: 'Otávio Menezes',
    phone: '+55 62 98444-9090',
    email: 'otavio.menezes@example.com',
    neighborhood: 'Setor Bueno',
    city: 'Goiânia',
    state: 'GO',
    birthDate: '1999-02-27',
    lastVisit: daysAgo(4),
    active: true,
  },
  {
    id: 111,
    name: 'Carla Antunes',
    phone: '+55 11 96555-3322',
    email: 'carla.antunes@example.com',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1983-06-08',
    lastVisit: daysAgo(17),
    active: true,
  },
  {
    id: 112,
    name: 'Sérgio Batista',
    phone: '+55 71 98999-1010',
    email: null,
    neighborhood: 'Barra',
    city: 'Salvador',
    state: 'BA',
    birthDate: '1958-10-19',
    lastVisit: daysAgo(96),
    active: false,
  },
  {
    id: 113,
    name: 'Renata Vieira',
    phone: '+55 11 98080-2244',
    email: 'renata.vieira@example.com',
    neighborhood: 'Perdizes',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1990-01-03',
    lastVisit: daysAgo(1),
    active: true,
  },
  {
    id: 114,
    name: 'Igor Salgado',
    phone: '+55 27 99123-8877',
    email: 'igor.salgado@example.com',
    neighborhood: 'Praia do Canto',
    city: 'Vitória',
    state: 'ES',
    birthDate: '1987-05-25',
    lastVisit: daysAgo(29),
    active: true,
  },
  {
    id: 115,
    name: 'Fernanda Rocha',
    phone: '+55 11 95111-6677',
    email: 'fernanda.rocha@example.com',
    neighborhood: 'Santana',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1975-07-30',
    lastVisit: daysAgo(7),
    active: true,
  },
  {
    id: 116,
    name: 'André Pimentel',
    phone: '+55 48 98666-4433',
    email: null,
    neighborhood: 'Centro',
    city: 'Florianópolis',
    state: 'SC',
    birthDate: '1968-03-02',
    lastVisit: daysAgo(53),
    active: true,
  },
  {
    id: 117,
    name: 'Vanessa Lopes',
    phone: '+55 11 94222-8899',
    email: 'vanessa.lopes@example.com',
    neighborhood: 'Jabaquara',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '2003-09-12',
    lastVisit: daysAgo(15),
    active: true,
  },
  {
    id: 118,
    name: 'Bruno Tavares',
    phone: '+55 61 99777-2323',
    email: 'bruno.tavares@example.com',
    neighborhood: 'Asa Sul',
    city: 'Brasília',
    state: 'DF',
    birthDate: '1981-11-08',
    lastVisit: daysAgo(41),
    active: true,
  },
  {
    id: 119,
    name: 'Larissa Peixoto',
    phone: '+55 11 93555-1177',
    email: 'larissa.peixoto@example.com',
    neighborhood: 'Brooklin',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1996-06-16',
    lastVisit: daysAgo(3),
    active: true,
  },
  {
    id: 120,
    name: 'Marcelo Duarte',
    phone: '+55 92 98333-4646',
    email: null,
    neighborhood: 'Adrianópolis',
    city: 'Manaus',
    state: 'AM',
    birthDate: '1970-04-04',
    lastVisit: daysAgo(74),
    active: false,
  },
  {
    id: 121,
    name: 'Priscila Amaral',
    phone: '+55 11 92444-5511',
    email: 'priscila.amaral@example.com',
    neighborhood: 'Lapa',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1993-08-28',
    lastVisit: daysAgo(23),
    active: true,
  },
  {
    id: 122,
    name: 'Eduardo Bastos',
    phone: '+55 81 98222-7373',
    email: 'eduardo.bastos@example.com',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    state: 'PE',
    birthDate: '1962-02-13',
    lastVisit: daysAgo(11),
    active: true,
  },
  {
    id: 123,
    name: 'Sofia Guimarães',
    phone: '+55 11 91888-9922',
    email: 'sofia.guimaraes@example.com',
    neighborhood: 'Higienópolis',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '2005-12-01',
    lastVisit: daysAgo(6),
    active: true,
  },
  {
    id: 124,
    name: 'Gustavo Leal',
    phone: '+55 11 90777-3131',
    email: null,
    neighborhood: 'Ipiranga',
    city: 'São Paulo',
    state: 'SP',
    birthDate: '1979-10-07',
    lastVisit: daysAgo(38),
    active: true,
  },
];

function haystack(patient: PatientRecord, field: PatientsQuery['field']): string {
  switch (field) {
    case 'phone_number':
      return patient.phone ?? '';
    case 'email':
      return patient.email ?? '';
    default:
      return patient.name;
  }
}

/** Medical history for a few roster patients; the rest have none on file. */
const ANAMNESES: Readonly<Record<number, PatientAnamnesis>> = {
  101: {
    allergies: ['Penicillin', 'Latex'],
    medications: ['Levothyroxine 50 mcg'],
    conditions: ['Hypothyroidism'],
    notes: 'Prefers morning appointments. Mild anxiety before procedures.',
    updatedAt: daysAgo(30),
  },
  102: {
    allergies: [],
    medications: ['Losartan 50 mg'],
    conditions: ['Hypertension'],
    notes: null,
    updatedAt: daysAgo(90),
  },
  107: {
    allergies: ['Dipyrone'],
    medications: ['Metformin 850 mg', 'Atorvastatin 20 mg'],
    conditions: ['Type 2 diabetes', 'High cholesterol'],
    notes: 'Check blood sugar before long procedures.',
    updatedAt: daysAgo(14),
  },
};

/** A single roster entry, or null when the id is unknown. */
export function demoPatientById(id: number): PatientRecord | null {
  const patient = PATIENTS.find((candidate) => candidate.id === id);
  return patient ? { ...patient, anamnesis: ANAMNESES[id] ?? null } : null;
}

/** Filters and pages the fixed roster the same way the API would. */
export function demoPatientsPage(query: PatientsQuery): PatientsPage {
  const term = query.search.trim().toLowerCase();
  const matched = term
    ? PATIENTS.filter((patient) => haystack(patient, query.field).toLowerCase().includes(term))
    : PATIENTS;

  const start = (Math.max(1, query.page) - 1) * query.pageSize;

  return {
    rows: matched.slice(start, start + query.pageSize),
    total: matched.length,
    isDemoData: true,
  };
}
