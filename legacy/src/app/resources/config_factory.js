ConfigFactory.$inject = ['$resource'];
function ConfigFactory($resource) {
  return $resource( 'api/configs', { /* params */ }, { /* resources */ }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Config", ConfigFactory);