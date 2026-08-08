TransactionFactory.$inject = ['$resource'];
function TransactionFactory($resource) {
  return $resource( 'api/transactions/:id', {
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
    },
    pay: {
      url: 'api/transactions/:id/pay',
      method: 'PUT'
    },
    queryBillstopay: {
      url: 'api/transactions/billstopay',
      method: 'GET', 
      isArray: false
    },
    billstopay: {
      url: 'api/transactions/billstopay/:id',
      method: 'GET', 
      isArray: false
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Transaction", TransactionFactory);