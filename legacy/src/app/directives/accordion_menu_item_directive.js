/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function AccordionMenuItemDirective() {
  return {
    restrict: 'AC',
    require: '^accordionMenu',
    link: function(scope, elem, attrs, ctrl) {
      ctrl.addItem(elem);

      elem.bind('click', function(event) {
        ctrl.activeItem(elem);
      });
    }
  }
}

angular.module('sistemizedental').directive('accordionMenuItem', AccordionMenuItemDirective);