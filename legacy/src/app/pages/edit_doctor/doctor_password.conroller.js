/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
DoctorPasswordCtrl.$inject = ['$scope', 'SweetAlert', 'Doctor', 'DoctorsCache', 'doctor']
function DoctorPasswordCtrl($scope, SweetAlert, Doctor, DoctorsCache, doctor) {
  var vm = this

  this.doctor = doctor
  this.old_password = null
  this.password = null
  this.password_confirmation = null

  /**
   * 
   */
  this.onSubmit = (isValid) => {
    if(isValid) {
      Doctor.password({ 
        id: vm.doctor.id 
      }, {
        old_password: vm.old_password,
        password: vm.password,
        password_confirmation: vm.password_confirmation
      }, (res) => {
        SweetAlert.swal('Pronto', 'Informações salvas com sucesso', 'success')
        DoctorsCache.updateCache()
      }, ({ data: { errors } }) => {
        SweetAlert.swal('Atenção', errors || 'Ocorreu uma falha na comunicação com o serviço', 'error');
      })
    }
  }
}

angular.module('sistemizedental').controller("DoctorPasswordCtrl", DoctorPasswordCtrl)