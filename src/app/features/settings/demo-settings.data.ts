import type { ClinicSettings } from './settings.models';

/** Sample clinic record used when the API is unreachable and demo mode is on. */
export function demoSettings(): ClinicSettings {
  return {
    isDemoData: true,
    profile: {
      displayName: 'Sistemize Dental — Clínica Modelo',
      email: 'contato@sistemizedental.com',
      phone: '+55 11 3555-0100',
      username: 'clinica-modelo',
      shortAbout: 'Odontologia geral, ortodontia e implantes.',
      about:
        'Atendimento de segunda a sábado, com equipe multidisciplinar e agenda integrada. ' +
        'Convênios aceitos sob consulta.',
      timezone: 'America/Sao_Paulo',
      searchable: true,
    },
    address: {
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      complement: 'Conjunto 42',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
  };
}
