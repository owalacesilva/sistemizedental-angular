/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function StringToNumberDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$parsers.push(function(value) {
        return '' + value;
      });

      ctrl.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  }
}

angular.module('sistemizedental').directive('stringToNumber', StringToNumberDirective);