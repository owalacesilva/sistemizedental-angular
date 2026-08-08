/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalCashierInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'SweetAlert', 'PaymentMethod', 'Cashier']
function ModalCashierInstanceCtrl($scope, $uibModalInstance, SweetAlert, PaymentMethod, Cashier) {
  var vm = this;

  this.SweetAlert = SweetAlert
  this.$uibModalInstance = $uibModalInstance
  this.payment_methods = []
  this.cashier = new Cashier()

  PaymentMethod.query((res) => {
    res.count ? this.payment_methods.splice(0, this.payment_methods.length, ...res.rows) : null
  }, ({ data }) => {
    console.log(data.error)
  })
}

ModalCashierInstanceCtrl.prototype.onSubmit = function(form) {
  if (form.$valid) {
    const promise = this.cashier.id ? this.cashier.$update() : this.cashier.$save()
    promise.then((res) => {
      this.$uibModalInstance.close(res);
      this.SweetAlert.swal('Pronto', 'Conta atualizada com sucesso', 'success')
    }, ({ data }) => {
      this.SweetAlert.swal('Atenção', data.errors, 'error')
    })
  }
}

angular.module('sistemizedental').controller("ModalCashierInstanceCtrl", ModalCashierInstanceCtrl);