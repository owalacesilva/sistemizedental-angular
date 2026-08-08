/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
DoctorDetailsCtrl.$inject = ['$scope', '$rootScope', '$http', '$stateParams', '$state', 'SweetAlert', 'Doctor', 'DoctorsCache', 'doctor'];
function DoctorDetailsCtrl($scope, $rootScope, $http, $stateParams, $state, SweetAlert, Doctor, DoctorsCache, doctor) {
  var vm = this

  vm.doctor = { ...doctor }
  vm.genders = [{ id: null, name: 'Selecione um sexo' }, { id: 'male', name: 'Masculino' }, { id: 'female', name: 'Feminino' }]

  var birth_date = moment(vm.doctor.birth_date, 'YYYY-MM-DD');
  if (birth_date.isValid()) {
    vm.doctor.birth_date = birth_date.format('DD/MM/YYYY');
  }

  /**
   * 
   */
  this.onSubmit = (isValid) => {
    if(isValid) {
      const { birth_date } = vm.doctor;
      let birthdate = null;
      if (birth_date) {
        const mom_birth_date = moment(birth_date, 'DD/MM/YYYY')
        birthdate = mom_birth_date.isValid() ? mom_birth_date.format('YYYY-MM-DD') : null
      }

      let data = { 
        ...vm.doctor, 
        birth_date: birthdate
      }

      if(!data.id) {
        Doctor.save(data, successCallback, errorCallback);
      } else {
        Doctor.update({ id: data.id }, data, successCallback, errorCallback);
      }

      function successCallback(res) {
        if(res.id) {
          SweetAlert.swal('Pronto', 'Informações salvas com sucesso', 'success');
          DoctorsCache.updateCache();
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

angular.module('sistemizedental').controller("DoctorDetailsCtrl", DoctorDetailsCtrl);