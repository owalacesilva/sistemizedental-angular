/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPaymentInstanceCtrl.$inject = ['$scope', 'SweetAlert', '$uibModalInstance', 'PaymentMethod', 'payment'];
function ModalPaymentInstanceCtrl($scope, SweetAlert, $uibModalInstance, PaymentMethod, payment) {
  var vm = this;

  vm.payment    = payment;
  vm.submit     = _submit;

  /////////

  function _submit(form) {
    if(form.$valid) {
      if( angular.isDefined(vm.payment['id']) ) {
        PaymentMethod.update({ 
          id: vm.payment.id
        }, vm.payment, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Forma de Pagamento atualizado com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      } else {      
        PaymentMethod.save(vm.payment, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Forma de Pagamento adicionado com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      }
    }
  }
}

angular.module('sistemizedental').controller("ModalPaymentInstanceCtrl", ModalPaymentInstanceCtrl);