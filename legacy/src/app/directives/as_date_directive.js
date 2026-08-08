/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function AsDateDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {

      ctrl.$formatters.push(function(value) {
        return moment(value).toDate();
      });
    }
  }
}

angular.module('sistemizedental').directive('asDate', AsDateDirective);