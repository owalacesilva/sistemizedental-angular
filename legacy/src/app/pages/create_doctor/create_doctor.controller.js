/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
CreateDoctorCtrl.$inject = ['$scope', '$rootScope', '$http', '$stateParams', '$state', 'SweetAlert', 'Doctor', 'DoctorsCache'];
function CreateDoctorCtrl($scope, $rootScope, $http, $stateParams, $state, SweetAlert, Doctor, DoctorsCache) {
  var vm = this

  this.doctor = new Doctor()
  this.pwdVisible = false
  this.genders = [{ id: null, name: 'Selecione um sexo' }, { id: 'male', name: 'Masculino' }, { id: 'female', name: 'Feminino' }]

  vm.onSubmit = (isValid) => {
    if(isValid) {
      Doctor.save(vm.doctor, successCallback, errorCallback);

      function successCallback(res) {
        if(res.id) {
          SweetAlert.swal('Pronto', 'Informações salvas com sucesso', 'success');
          DoctorsCache.updateCache();

          $state.go('app.doctors.list');
        } else {
          SweetAlert.swal('Atenção', res.errors, 'error');
        }
      }

      function errorCallback(res) {
        SweetAlert.swal('Atenção', res.data.error || 'Ocorreu uma falha na comunicação com o serviço', 'error');
      }
    }
  }
}

angular.module('sistemizedental').controller("CreateDoctorCtrl", CreateDoctorCtrl);