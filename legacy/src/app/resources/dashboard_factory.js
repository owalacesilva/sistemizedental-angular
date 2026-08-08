DashboardFactory.$inject = ['$resource'];
function DashboardFactory($resource) {
  return $resource( 'api/dashboard', {
    /* void */
  }, {
    query: {
      method: 'GET', 
      isArray: false
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Dashboard", DashboardFactory);