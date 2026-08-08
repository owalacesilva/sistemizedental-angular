MedicalProcedureFactory.$inject = ['$resource'];
function MedicalProcedureFactory($resource) {
  return $resource( 'api/medical_procedures/:id', { 
    id: '@id' 
  }, {
    query: {
      method: 'GET',
      isArray: false
    },
    save: {
      method: 'POST',
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    },
    update: {
      method: 'PUT',
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    },
    delete: {
      method: 'DELETE'
    }
  }, { 
    stripTrailingSlashes: true 
  })
}

angular.module('sistemizedental').factory("MedicalProcedure", MedicalProcedureFactory);