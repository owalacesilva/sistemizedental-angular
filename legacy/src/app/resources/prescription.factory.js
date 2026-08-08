PrescriptionFactory.$inject = ['$resource'];
function PrescriptionFactory($resource) {
  return $resource( 'api/prescriptions/:id', {
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
    },
    delete: {
      method: 'DELETE',
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

angular.module('sistemizedental').factory("Prescription", PrescriptionFactory);