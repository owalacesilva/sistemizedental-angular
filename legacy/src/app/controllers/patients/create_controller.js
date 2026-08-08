/**
 * @description
 * Pagina para criação de novos pacientes
 */
PatientsCreateCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', 'SweetAlert', 'PostalCode', 'Patient'];
function PatientsCreateCtrl($scope, $rootScope, $http, $location, SweetAlert, PostalCode, Patient) {
  var vm = this;

  vm.patient        = {};
  vm.genders        = [{id: null, name: 'Selecione um sexo'},{id: 'M', name: 'Masculino'},{id: 'F', name: 'Feminino'}];
  vm.submit         = _submit;
  vm.searchAddress  = _searchAddress;

  /**
   * Submete o formulario para o servidor
   * ====================================
   */
  function _submit(isValid) {
    if(isValid) {
      Patient.save(vm.patient, function(result) {
        if(result.success) {
          SweetAlert.swal('Pronto', 'Paciente adicionado com sucesso', 'success');
          $location.path('/patients');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }

  /**
   * Busca o endereço baseado no CEP digitado
   * ========================================
   */
  function _searchAddress() {
    PostalCode.get({
      code: vm.patient.postal_code
    }, function(response) {
      if(response.status == 1) {
        vm.patient.postal_code    = response.code;
        vm.patient.street_address = response.address;
        vm.patient.district       = response.district;
        vm.patient.city           = response.city;
        vm.patient.state          = response.state;
      }
    });
  }
}

angular.module('sistemizedental').controller("PatientsCreateCtrl", PatientsCreateCtrl);