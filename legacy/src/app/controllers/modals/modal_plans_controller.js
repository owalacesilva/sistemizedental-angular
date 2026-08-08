/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPlansInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$http', 'toasty'];
function ModalPlansInstanceCtrl($scope, $uibModalInstance, $http, toasty) {
  var vm = this;
  
  vm.plan       = null;
  vm.duration   = ['1', '1', '1'];
  vm.choosePlan = _choosePlan;
  vm.submit     = _submit;

  ///////
  
  function _choosePlan(plan) {
    vm.plan = plan;
  }

  function _submit(form) {
    if(form.$valid) {
      $http.post({
        plan: vm.plan,
        duration: vm.duration[vm.plan],
        payment_method: vm.payment_method,
      }).then(function(config) {
        var response = config.data;

        if(response.status) {
          toasty.success("Plano atualizado com sucesso", "<b>Pronto!</b>");
        } else {
          toasty.error(response.message, "<b>Atenção</b>");
        }
      }, function(config) {
        var response = config.data;
        toasty.error(response.message, "<b>Atenção</b>");
      });
    }
  }
}

angular.module('sistemizedental').controller("ModalPlansInstanceCtrl", ModalPlansInstanceCtrl);