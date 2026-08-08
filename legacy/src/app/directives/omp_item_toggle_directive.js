/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function OmpItemToggleDirective() {
  return {
    restrict: 'AC',
    require: '^ompMenuToggle',
    link: function(scope, elem, attrs, ctrl) {
      ctrl.addItem(elem);

      elem.bind('click', function(event) {
        ctrl.activeItem(elem);
      });
    }
  }
}

angular.module('sistemizedental').directive('ompItemToggle', OmpItemToggleDirective);