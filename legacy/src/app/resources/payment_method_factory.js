PaymentMethodFactory.$inject = ['$resource'];
function PaymentMethodFactory($resource) {
  return $resource( 'api/payment_methods/:id', {
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
    getStatement: {
      url: 'api/payment_methods/statement', 
      method: 'GET', 
      isArray: false
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("PaymentMethod", PaymentMethodFactory);