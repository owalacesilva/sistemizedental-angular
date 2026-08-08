ClinicFactory.$inject = ['$resource'];
function ClinicFactory($resource) {
  return $resource( 'api/accounts', 
  { /* void */ }, {
    assets: {
      url: 'api/accounts/assets',
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
    address: {
      url: 'api/accounts/address',
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
    settings: {
      url: 'api/accounts/settings',
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
    getAddress: {
      url: 'api/accounts/address',
      method: 'GET',
      isArray: false
    },
    getExpedients: {
      url: 'api/accounts/expedients',
      method: 'GET',
      isArray: false
    },
    postExpedient: {
      url: 'api/accounts/expedients',
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

angular.module('sistemizedental').factory("Clinic", ClinicFactory);