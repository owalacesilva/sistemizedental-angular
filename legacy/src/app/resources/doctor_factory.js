DoctorFactory.$inject = ['$resource'];
function DoctorFactory($resource) {
  return $resource( 'api/accounts/:id', {
    id: '@id'
  }, {
    query: {
      url:  'api/accounts.json',
      method: 'GET', 
      isArray: false
    },
    save: {
      method: 'POST'
    },
    update: {
      method: 'PUT'
    },
    active: {
      url:  'api/doctors/:id/active',
      method: 'PUT'
    },
    working_hours: {
      url:  'api/accounts/:id/working_hours',
      method: 'PUT'
    },
    password: {
      url:  'api/accounts/:id/password',
      method: 'PUT'
    },
    appointments: {
      url:  'api/accounts/:id/appointments',
      method: 'GET'
    }
  });
}

angular.module('sistemizedental').factory("Doctor", DoctorFactory);