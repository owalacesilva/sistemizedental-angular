ShopProductCategoryFactory.$inject = ['$resource'];
function ShopProductCategoryFactory($resource) {
  return $resource( 'api/mp_product_categories/:id', {
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

angular.module('sistemizedental').factory("ShopProductCategory", ShopProductCategoryFactory);