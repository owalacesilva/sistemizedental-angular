/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function DateToStringDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$formatters.push(function(value) {
        var _moment = moment(value);
        return _moment.isValid() ? _moment.toDate() : moment().toDate();
      });

      ctrl.$parsers.push(function(value) {
        var _moment = moment(value);
        return _moment.isValid() ? _moment.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
      });
    }
  }
}

angular.module('sistemizedental').directive('dateToString', DateToStringDirective);