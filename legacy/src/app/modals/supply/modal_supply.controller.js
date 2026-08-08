/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalSupplyInstanceCtrl.$inject = ['$uibModalInstance', 'SweetAlert', 'PaymentMethod', 'Transaction'];
function ModalSupplyInstanceCtrl($uibModalInstance, SweetAlert, PaymentMethod, Transaction) {
  var vm = this;

  this.SweetAlert = SweetAlert
  this.$uibModalInstance = $uibModalInstance
  this.payment_methods = []
  this.transaction = new Transaction({
    kind: 'supply', 
    paid: true,
    due_date: moment().toDate()
  })

  PaymentMethod.query((res) => {
    res.count ? this.payment_methods.splice(0, this.payment_methods.length, ...res.rows) : null
  }, ({ data }) => {
    console.log(data.error)
  })  
}

ModalSupplyInstanceCtrl.prototype.onSubmit = function(form) {
  if (form.$valid) {
    this.transaction.$save().then((res) => {
      this.$uibModalInstance.close(res);
      this.SweetAlert.swal('Pronto', 'Conta atualizada com sucesso', 'success')
    }, ({ data }) => {
      this.SweetAlert.swal('Atenção', data.errors, 'error')
    })
  }
}

angular.module('sistemizedental').controller("ModalSupplyInstanceCtrl", ModalSupplyInstanceCtrl)
