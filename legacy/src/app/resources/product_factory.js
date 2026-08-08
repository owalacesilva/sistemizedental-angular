ProductFactory.$inject = ['$resource'];
function ProductFactory($resource) {
  return $resource( 'api/products/:id', {
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

angular.module('sistemizedental').factory("Product", ProductFactory);