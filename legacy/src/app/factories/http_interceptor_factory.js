HttpInterceptorFactory.$inject = ['$q', '$window', '$location', '$rootScope', 'API_SERVER'];
function HttpInterceptorFactory($q, $window, $location, $rootScope, API_SERVER) {
  return {
    // optional method
    'request': function(config) {
      if( /^api\//g.test(config.url) ) {
        var authToken = localStorage.getItem('acc_token');
        
        config.headers['Authorization'] = config.headers['Authorization'] || authToken;
        config.url = API_SERVER + config.url; 
        console.log(`Call api route: ${config.url}`)
      }

      // do something on success
      return config;
    },

    // optional method
   'requestError': function(config) {
      // do something on error
      return $q.reject(config);
    },

    // optional method
    'response': function(config) {
      // do something on success
      return config || $q.when(config);
    },

    // optional method
   'responseError': function(config) {
      // do something on error
      switch (config.status) {
        case -1:
          // Envia um broadcast para modo offline
          $rootScope.$broadcast("$serverError")
          return $q.reject(config);
        case 401: // unauthorized
          console.log("Redirect to auth after unauthorized response")
          localStorage.removeItem('acc_token')
          $location.path("/auth")
          return $q.resolve(config);
        case 404: // not Found
          return $q.reject(config);
        default: 
          return $q.reject(config);
      }
    }
  };
}

angular.module('sistemizedental').factory("HttpInterceptor", HttpInterceptorFactory);