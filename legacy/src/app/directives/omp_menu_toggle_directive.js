/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
function OmpMenuToggleDirective() {
  return {
    restrict: 'A',
    controller: function() {
      var elems = [];

      // Adiciona o link n estrutura directive
      this.addItem = function(elem) {
        elems.push(elem); // add
      }

      // Ativa uma accordion dentro do menu principal
      this.activeItem = function(elem) {
        var subMenu = elem.find('.sub-menu');

        elems.forEach(function(subElem) {
          subElem.removeClass('open');
          subElem.removeClass('active');

          // Esconde todos os submenus abertos
          subElem.find('.sub-menu').hide();
        });

        // Caso o submenu ja esteja visivel, esconde novamente
        if (!subMenu.is(':visible')) {
          elem.addClass('open');
          elem.addClass('active');

          subMenu.show();
        } else {
          // Mostra submenu
          subMenu.hide(200);
        }
      }
    }
  }
}

angular.module('sistemizedental').directive('ompMenuToggle', OmpMenuToggleDirective);