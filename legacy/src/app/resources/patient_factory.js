PatientFactory.$inject = ['$resource'];
function PatientFactory($resource) {
  return $resource( 'api/clients/:id', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    visit: {
      url:  'api/clients/:id/visit/:visit/opening',
      method: 'GET', 
      isArray: false
    },
    update: {
      method: 'PUT'
    },
    password: {
      url:  'api/clients/:id/password',
      method: 'PUT'
    },
    save: {
      method: 'POST'
    },
    delete: {
      method: 'DELETE'
    },
    record: {
      url:  'api/clients/:id/visit/:visit/record',
      method: 'PUT'
    },
    getAnamnesis: {
      url:  'api/clients/:id/anamnesis',
      method: 'GET', 
      isArray: false
    },
    updateAnamnesis: {
      url:  'api/clients/:id/anamnesis',
      method: 'PUT'
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Patient", PatientFactory);