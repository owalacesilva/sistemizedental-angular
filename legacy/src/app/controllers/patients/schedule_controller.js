/**
 * @description
 * Cria novo agendamento para um paciente.
 */
PatientsScheduleCtrl.$inject = ['$scope', '$rootScope', 'Patient'];
function PatientsScheduleCtrl($scope, $rootScope, Patient) {
  var vm = this;

  vm.patient = new Patient();
  vm.submit  = _submit;

  function _submit(isValid) {
    if(isValid) {
      vm.patient.$save(function(result) {
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
}

angular.module('sistemizedental').controller("PatientsScheduleCtrl", PatientsScheduleCtrl);