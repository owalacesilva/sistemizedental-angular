ShopProductFactory.$inject = ['$resource'];
function ShopProductFactory($resource) {
  return $resource( 'api/mp_products/:id', {
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
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("ShopProduct", ShopProductFactory);