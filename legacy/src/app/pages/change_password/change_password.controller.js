/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ChangePasswordCtrl.$inject = ['$scope', '$rootScope', '$window', 'Upload', 'SweetAlert', 'Account'];
function ChangePasswordCtrl($scope, $rootScope, $window, Upload, SweetAlert, Account) {
  var vm = this

  this.AccountFactory = Account
  this.SweetAlert = SweetAlert
  this.account = angular.fromJson(localStorage.getItem('acc_data')) || {}
  this.current_password = null
  this.password = null
  this.password_confirmation = null
}

ChangePasswordCtrl.prototype.onSubmit = function (form) {
  if(form.$valid) {
    this.AccountFactory.updatePassword(this.account.id, {
      current_password: this.current_password, 
      password: this.password, 
      password_confirmation: this.password_confirmation 
    }, (res) => {
      this.SweetAlert.swal({
        title: 'Pronto',
        text: 'Senha atualizada com sucesso',
        type: 'success'
      }, () => window.location.reload())
    }, ({ data: { errors }}) => 
      this.SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha na comunicação com o serviço'), 'error')
    )
  }
}

angular.module('sistemizedental').controller("ChangePasswordCtrl", ChangePasswordCtrl)
