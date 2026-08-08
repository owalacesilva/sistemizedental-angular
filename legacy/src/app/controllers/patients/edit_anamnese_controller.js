/**
 * @description
 * Visualização das informações de um paciente
 */
PatientsEditAnamneseCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$stateParams', 'SweetAlert', 'Patient', 'anamnesis'];
function PatientsEditAnamneseCtrl($scope, $rootScope, $http, $compile, $stateParams, SweetAlert, Patient, anamnesis) {
  var vm = this;

  vm.anamnesis          = anamnesis;
  vm.genders            = [{id: null, name: 'Selecione um sexo'},{id: 'M', name: 'Masculino'},{id: 'F', name: 'Feminino'}];
  vm.submitFormAnamnes  = _submitFormAnamnes;

  ///////////

  function _submitFormAnamnes(isValid) {
    if(isValid) {
      Patient.updateAnamnesis({
        id: $stateParams['id']
      }, 
      vm.anamnesis,
      function(result) {
        if(result.success) {
          SweetAlert.swal('Pronto', 'Ficha de anamnese atualizada com sucesso', 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }
}

angular.module('sistemizedental').controller("PatientsEditAnamneseCtrl", PatientsEditAnamneseCtrl);