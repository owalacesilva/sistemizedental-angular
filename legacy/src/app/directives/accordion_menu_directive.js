/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function AccordionMenuDirective() {
  return {
    restrict: 'A',
    controller: function() {
      var _elems = [];

      this.addItem = function(elem) {
        _elems.push(elem);
      }

      this.activeItem = function(elem) {
        // Fecha todos os outros submenus
        _elems.forEach(function(__elem) {
          // Verifica se não existe algum link ativo nesse submenu.
          if (__elem != elem) {
            __elem.removeClass('open');
            __elem.removeClass('active');

            __elem.find('.submenu').slideUp(200);
          }
        });

        var subMenu = elem.find('.submenu');

        // Verifica se o submenu é visivel e se não existe algum
        // link ativo dentro dele, caso tenha não esconde submenu.
        if (subMenu.is(':visible') && !subMenu.find("li > a.active").length) {
          // Esconde submenu
          elem.removeClass('open');
          elem.removeClass('active');
          subMenu.slideUp(200);
        } else {
          // Ativa submenu
          elem.addClass('open');
          elem.addClass('active');

          // Mostra submenu
          subMenu.slideDown(200);
        }

      }
    }
  }
}

angular.module('sistemizedental').directive('accordionMenu', AccordionMenuDirective);