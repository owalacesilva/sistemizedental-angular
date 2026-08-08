AccountableFactory.$inject = ['$resource'];
function AccountableFactory($resource) {
  return $resource( 'api/accountables/:id', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    save: {
      method: 'POST'
    },
    delete: {
      method: 'DELETE'
    },
    update: {
      method: 'PUT'
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Accountable", AccountableFactory);