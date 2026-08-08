// Cria uma modulo angular com dependencias afins 
// =============================================================================
"use strict";

var angular = require('angular');

(function main() {
  
  // checkIfServerUp();
  initApplication({});

  function checkIfServerUp() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");

    return $http.get([process.env.API_SERVER, 'api', '/accounts'].join(''), {
      dataType: "json",
      withCredentials: true
    })
    .then(bootstrapApplication)
    .catch(errorResponse);
  }

  function bootstrapApplication(config) {
    var response = config.data || {};

    if(response.success) {
      // initApplication(response.data || {});
    } else {
      var mgs = 'Nenhuma comunicação com servidor';
      console.error(mgs)
      window.alert(mgs);
    }
  }

  function errorResponse(res) {
    // Handle error case
    if (res.status === 401 /** unathorization */) {
      console.log('invoke login screen')
    } else {
      /* TODO: Redirect to 500 page */
      console.log("Bootstrap failed: ", res)
    }
  }

  function initApplication(options) {
    var configs = options || {}
    let api_url = process.env.API_SERVER

    if (api_url.substr(api_url.length - 1) != '/') {
      api_url += '/'
    }

    angular
      .module('sistemizedental')
      .constant('API_SERVER', api_url);

    moment.locale('pt-br');

    // Bootstrap the application into document body
    angular.element(document).ready(function() {
      angular.bootstrap(document, ["sistemizedental"]);
    });
  }
}());