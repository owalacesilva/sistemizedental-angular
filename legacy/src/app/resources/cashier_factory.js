CashierFactory.$inject = ['$resource'];
function CashierFactory($resource) {
  return $resource( 'api/cashiers/:id', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    get: {
      method: 'GET', 
      isArray: false
    },
    save: {
      url: 'api/cashiers',
      method: 'POST'
    },
    update: {
      url: 'api/cashiers/:id',
      method: 'PUT'
    },
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Cashier", CashierFactory);