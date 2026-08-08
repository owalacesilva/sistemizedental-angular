/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPaymentMethodInstanceCtrl.$inject = ['SweetAlert', '$uibModalInstance', 'PaymentMethod', 'payment_id'];
function ModalPaymentMethodInstanceCtrl(SweetAlert, $uibModalInstance, PaymentMethod, payment_id) {
  var vm = this;

  this.SweetAlert = SweetAlert
  this.$uibModalInstance = $uibModalInstance
  this.payment_method = payment_id ? PaymentMethod.get({ id: payment_id }) 
    : new PaymentMethod({
      fee: 0.0,
      release_deadline: 0,
      has_installments: false,
      installments_limit: 1,
      blocked: false
    })
}

ModalPaymentMethodInstanceCtrl.prototype.onSubmit = function (form) {
  if(form.$valid) {
    let promise = null
    if (this.payment_method.id) {
      promise = this.payment_method.$update()
    } else {      
      promise = this.payment_method.$save()
    }

    promise.then((res) => {
      this.$uibModalInstance.close(res);
      this.SweetAlert.swal('Pronto', "Forma de Pagamento adicionado com sucesso", 'success');
    }, ({ data }) => {
      this.SweetAlert.swal('Atenção', data.errors, 'error');
    })
  }
}

angular.module('sistemizedental').controller("ModalPaymentMethodInstanceCtrl", ModalPaymentMethodInstanceCtrl);