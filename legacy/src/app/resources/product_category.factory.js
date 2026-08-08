ProductCategoryFactory.$inject = ['$resource'];
function ProductCategoryFactory($resource) {
  return $resource( 'api/product_categories/:id', {
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

angular.module('sistemizedental').factory("ProductCategory", ProductCategoryFactory);