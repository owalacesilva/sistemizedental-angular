/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ResizeDirective.$inject = ['$window'];
function ResizeDirective($window) {

  return function (scope, element) {
    var _window = angular.element($window);

    var changeHeight = function() {
      element.css('height', _window.height() + 'px' );
    };
      
    // when window size gets changed
    _window.bind('resize', function () {        
      changeHeight();
    });

    // when page loads
    changeHeight();
  }
}

angular.module('sistemizedental').directive('resize', ResizeDirective);