AccountableCategoryFactory.$inject = ['$resource'];
function AccountableCategoryFactory($resource) {
  return $resource('api/accountable_categories/:id', {
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

angular.module('sistemizedental').factory("AccountableCategory", AccountableCategoryFactory)
