AppointmentFactory.$inject = ['$resource'];
function AppointmentFactory($resource) {
  return $resource( 'api/appointments/:id', 
    { id: '@id' }, 
    {
      query: {
        method: 'GET',
        isArray: false
      },
      inList: {
        url: 'api/appointments/list',
        method: 'GET',
        isArray: false
      },
      save: {
        method: 'POST'
      },
      update: {
        method: 'PUT'
      },
      updateStatus: {
        url: 'api/appointments/:id/status',
        method: 'PUT'
      },
      opening: {
        url: 'api/appointments/:id/opening',
        method: 'GET'
      },
      patient: {
        url: 'api/appointments/:id/patient',
        method: 'GET',
        isArray: false
      },
      patientAnamnesis: {
        url: 'api/appointments/:id/patient/anamnesis',
        method: 'GET',
        isArray: false
      },
      procedure: {
        url: 'api/appointments/:id/procedures',
        method: 'GET',
        isArray: false
      },
      saveProcedure: {
        url: 'api/appointments/:id/procedures',
        method: 'POST'
      }
    }, 
    { stripTrailingSlashes: true });
}

angular.module('sistemizedental').factory("Appointment", AppointmentFactory);