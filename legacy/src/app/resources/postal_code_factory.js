PostalCodeFactory.$inject = ['$resource'];
function PostalCodeFactory($resource) {
  return $resource("http://apps.widenet.com.br/busca-cep/api/cep/:code.json", 
    { code: '@code' }, { /* methods */ }, {
      stripTrailingSlashes: true
    });
}

angular.module('sistemizedental').factory("PostalCode", PostalCodeFactory);