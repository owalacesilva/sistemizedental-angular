PromotionFactory.$inject = ['$resource'];
function PromotionFactory($resource) {
  return $resource( 'api/promotions/:id', {
    id: '@id'
  }, {
    query: {
      method: 'GET', 
      isArray: false
    },
    update: {
      method: 'PUT',
      headers: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      transformRequest: function (data, headersGetter) {
        var str = [];
        for (var d in data) {
          if(typeof data[d] != 'function' && data[d] != null) {
            str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
          }
        }
        
        return str.join("&");
      }
    },
    save: {
      method: 'POST',
      headers: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      transformRequest: function (data, headersGetter) {
        var str = [];
        for (var d in data) {
          if(typeof data[d] != 'function' && data[d] != null) {
            str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
          }
        }
        
        return str.join("&");
      }
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Promotion", PromotionFactory);