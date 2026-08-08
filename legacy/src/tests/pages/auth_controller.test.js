var angular = require('angular');

require('angular-mocks');

describe('sorting the list of users', function() {
  /** Returns the module used */
  beforeEach(function() {
    angular.mock
      .module('sistemizedental')
      .constant('$buildConfigs', {
        'API_SERVER': 'http://localhost:3000'
      })
  });

  it('sorts in descending order by default', angular.mock.inject(function($controller, $rootScope, $httpBackend) {
    var $scope = $rootScope.$new();
    var controller = $controller('AuthCtrl', { $scope: $scope, $http: $httpBackend });
    $scope.submit()

    expect('scope').toEqual('strong')
  }));
});