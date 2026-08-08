/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
FinancialCtrl.$inject = ['$scope', '$state'];
function FinancialCtrl($scope, $state) {
  var vm = this;

  vm.select = _select;

  function _select(index) {
    switch (index) {
      case 0: $state.go('app.financial.transactions'); break;
      case 1: $state.go('app.financial.accountables'); break;
      case 2: $state.go('app.financial.cashiers'); break;
      case 3: $state.go('app.financial.payment_methods'); break;
    }
  }
}

angular.module('sistemizedental').controller("FinancialCtrl", FinancialCtrl);