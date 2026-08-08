/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalViewAppointmentInstanceCtrl.$inject = ['$scope', '$location', '$uibModalInstance', 'SweetAlert', 'Appointment', 'appointment'];
function ModalViewAppointmentInstanceCtrl($scope, $location, $uibModalInstance, SweetAlert, Appointment, appointment) {
  var vm = this;

  vm.appointment  = appointment;
  vm.close    = _close;
  vm.appointment.procedures = [];

  Appointment.procedure({
    id: vm.appointment.id
  }, function(result) {
    if(result.success) {
      vm.appointment.procedures = result.data;
    } else {
      SweetAlert.swal('Atenção', result.errors, 'error');
    }
  }, function() {
    SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  });

  function _close() {
    $uibModalInstance.close('dismiss');
  }
}

angular.module('sistemizedental').controller("ModalViewAppointmentInstanceCtrl", ModalViewAppointmentInstanceCtrl);