/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalAccountableInstanceCtrl.$inject = ['$uibModalInstance', 'SweetAlert', 'Accountable', 'AccountableCategory', 'PaymentMethod', 'type', 'accountable_id']
function ModalAccountableInstanceCtrl($uibModalInstance, SweetAlert, Accountable, AccountableCategory, PaymentMethod, type, accountable_id) {
  var vm = this;

  this.SweetAlert = SweetAlert
  this.$uibModalInstance = $uibModalInstance
  this.payment_methods = []
  this.category_list = []
  this.toggle_category = false

  this.accountable = accountable_id ? Accountable.get({ id: accountable_id }) 
    : new Accountable({
      due_date: moment().toDate(),
      cost: 0.0,
      recurrences: 1,
      kind: ([null, 'income', 'expense'])[type],
      category: { 
        title: null, 
        description: null 
      }
    })

  AccountableCategory.query((res) => {
    res.count ? this.category_list.splice(0, this.category_list.length, ...res.rows) : null
  }, ({ data: { errors } }) => {
    console.log(errors)
  })

  PaymentMethod.query((res) => {
    res.count ? this.payment_methods.splice(0, this.payment_methods.length, ...res.rows) : null
  }, ({ data: { errors } }) => {
    console.log(errors)
  })

  this.accountable['due_date'] = moment(this.accountable['due_date']).toDate()
}

ModalAccountableInstanceCtrl.prototype.onSubmit = function(form) {
  if (form.$valid) {
    this.accountable.category_attributes = {
      ...this.accountable.category
    }

    const promise = this.accountable.id ? this.accountable.$update() : this.accountable.$save()
    promise.then((res) => {
      this.$uibModalInstance.close();
      this.SweetAlert.swal('Pronto', 'Conta atualizada com sucesso', 'success')
    }, ({ data: { errors } }) => {
      this.SweetAlert.swal('Atenção', errors, 'error')
    })
  }
}

angular.module('sistemizedental').controller("ModalAccountableInstanceCtrl", ModalAccountableInstanceCtrl);
