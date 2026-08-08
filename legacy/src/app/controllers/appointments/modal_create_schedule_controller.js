/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalCreateScheduleInstanceCtrl.$inject = ['$scope', 'SweetAlert', '$uibModalInstance', '$location', '$http', 'Appointment', 'period'];
function ModalCreateScheduleInstanceCtrl($scope, SweetAlert, $uibModalInstance, $location, $http, Appointment, period) {
  var vm = this;

  vm.appointment  = {
    date: period.date,
    start_at: period.start_at,
    end_at: period.end_at,
    doctor: {},
    patient: null
  };

  vm.submit               = _submit;
  vm.close                = _close;
  vm.datecomplete         = period.datecomplete;
  vm.dateformat           = period.dateformat;
  vm.selectedPatient      = _selectedPatient;
  vm.loading_patients     = false;
  vm.no_results           = false;
  vm.openPatientCreate    = _openPatientCreate;
  vm.changeDuration       = _changeDuration;
  vm.getPatients          = _getPatients;
  vm.selectPatient        = _selectPatient;

  vm.times = [{id: 1, name: 'Selecione uma duração'},{id: 15, name: '15 Minutos'},{id: 30, name: '30 Minutos'},{id: 45, name: '45 Minutos'},{id: 60, name: '1 Hora'},{id: 75, name: '1 Hora e 15 Minutos'},{id: 90, name: '1 Hora e 30 Minutos'},{id: 105, name: '1 Hora e 45 Minutos'},{id: 120, name: '2 Hora'},{id: 135, name: '2 Hora e 15 Minutos'},{id: 150, name: '2 Hora e 30 Minutos'},{id: 165, name: '2 Hora e 45 Minutos'},{id: 180, name: '3 Hora'}];

  var date_start_at = moment(vm.appointment.date + ' ' + vm.appointment.start_at, "DD/MM/YYYY HH:mm");
  var date_end_at   = moment(vm.appointment.date + ' ' + vm.appointment.end_at, "DD/MM/YYYY HH:mm");

  var diff = Math.abs(date_end_at - date_start_at);
  vm.appointment.duration = Math.floor((diff/1000) / 60);

  /////////

  function _submit(isValid) {
    var label = null;
    if( angular.isString(vm.appointment.patient) ) {
      label = vm.appointment.patient;
    }

    if(isValid) {
      Appointment.save({
        date: vm.appointment.date,
        datecomplete: vm.datecomplete,
        start_at: vm.appointment.start_at,
        end_at: vm.appointment.end_at,
        duration: vm.appointment.duration,
        doctor_id: period.doctor.id,
        label: label,
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

  function _close() {
    $uibModalInstance.dismiss('cancel');
  }

  function _openPatientCreate() {
    $uibModalInstance.dismiss('cancel');
    $location.path('/patients/create');
  }

  function _changeDuration(minutes) {
    period.end_at = new Date(period.start_at.getTime() + minutes * 60000);
  }

  function _selectedPatient(selected) {
    vm.appointment.patient_id  = selected.originalObject.id;
    vm.appointment.phone_number   = selected.originalObject.phone_number;
  }

  function _getPatients(search) {
    return $http.get('api/patients', {
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

  function _selectPatient($item, $model, $label, $event) {
    vm.appointment.phone_number = $item.phone_number;
    vm.appointment.label     = $label;
  }
}

angular.module('sistemizedental').controller("ModalCreateScheduleInstanceCtrl", ModalCreateScheduleInstanceCtrl);