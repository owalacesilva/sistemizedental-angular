AutocompleteFactory.$inject = ['$resource'];
function AutocompleteFactory($resource) {
  return $resource( 'api', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    patients: {
      url: 'api/patients',
      method: 'GET', 
      isArray: false
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Autocomplete", AutocompleteFactory);