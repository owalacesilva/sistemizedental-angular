/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalCreateAppointmentInstanceCtrl.$inject = ['$scope', 'SweetAlert',  '$uibModalInstance', '$state', '$http', 'Appointment', 'period'];
function ModalCreateAppointmentInstanceCtrl($scope, SweetAlert,  $uibModalInstance, $state, $http, Appointment, period) {
  var vm = this;

  vm.appointment  = {
    date: period.date,
    start_at: period.start_at,
    end_at: period.end_at,
    doctor: {},
    patient: null
  };

  vm.submit               = _submit;
  vm.dateformat           = period.dateformat;
  vm.loading_patients     = false;
  vm.no_results           = false;
  vm.openPatientCreate    = _openPatientCreate;
  vm.getPatients          = _getPatients;
  vm.selectPatient        = _selectPatient;

  // var date_start_at = moment(vm.appointment.date + ' ' + vm.appointment.start_at, "DD/MM/YYYY HH:mm");
  // var date_end_at   = moment(vm.appointment.date + ' ' + vm.appointment.end_at, "DD/MM/YYYY HH:mm");

  // var diff = Math.abs(date_end_at - date_start_at);
  // vm.appointment.duration = Math.floor((diff/1000) / 60);

  /////////

  function _submit(isValid) {
    if(isValid) {
      Appointment.save({
        date: vm.appointment.date,
        start_at: vm.appointment.start_at,
        end_at: vm.appointment.end_at,
        patient_name: vm.appointment.patient_name || vm.appointment.patient,
        doctor_id: period.doctor.id,
        patient_id: vm.appointment.patient.id,
        phone_number: vm.appointment.phone_number,
        notes: vm.appointment.notes
      }, function(result) {
        if(result.success) {
          $uibModalInstance.close(result.data);
          SweetAlert.swal('Pronto', "Appointmenta marcada com sucesso", 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
      });
    }
  }

  /**
   * Abre view para cadastro de novo paciente
   */
  function _openPatientCreate() {
    $uibModalInstance.dismiss('cancel');
    $state.go('app.patients.create');
  }

  /**
   * Retorna uma lista de pacientes, baseado 
   * no retorno de um requisiçaão xhr
   */
  function _getPatients(search) {
    return $http.get( 'api/patients', {
      params: {
        q: search,
      }
    }).then(function(response){
      var result = response.data;
      if(angular.isArray(result.data)) {
        return result.data.map(function(item){
          return item;
        });
      }
    });
  }

  /**
   * Callback para quando seleciona um paciente
   */
  function _selectPatient($item, $model, $label, $event) {
    vm.appointment.patient.id   = $item.id;
    vm.appointment.phone_number    = $item.phone_number;
    vm.appointment.patient_name = $label;
  }
}

angular.module('sistemizedental').controller("ModalCreateAppointmentInstanceCtrl", ModalCreateAppointmentInstanceCtrl);