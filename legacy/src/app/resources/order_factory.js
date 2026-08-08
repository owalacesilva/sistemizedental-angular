OrderFactory.$inject = ['$resource'];
function OrderFactory($resource) {
  return $resource( 'api/orders/:id', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    update: {
      method: 'PUT'
    },
    save: {
      method: 'POST'
    },
    delete: {
      method: 'DELETE'
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Order", OrderFactory);