/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalEditAppointmentInstanceCtrl.$inject = ['$scope', '$http', '$uibModalInstance', 'Appointment', 'SweetAlert',  'appointment'];
function ModalEditAppointmentInstanceCtrl($scope, $http, $uibModalInstance, Appointment, SweetAlert,  appointment) {
  var vm = this;

  vm.getPatients          =  _getPatients;
  vm.selectPatient        = _selectPatient;
  vm.getDoctors           = _getDoctors;
  vm.createDurationTimes  = _createDurationTimes;
  vm.submit               = _submit;

  if(appointment != null) {
    vm.appointment      = {
      id: appointment.raw.id,
      status: appointment.raw.status,
      date: appointment.start.toDate(),
      start_at: appointment.start.toDate(),
      end_at: appointment.end.toDate(),
      phone_number: appointment.raw.patient_phone_number,
      notes: appointment.raw.notes,
      patient: {
        id: appointment.raw.patient_id,
        name: appointment.raw.patient_name
      },
      doctor: {
        id: appointment.raw.doctor_id,
        name: appointment.raw.doctor_name,
        expedient: {
          duration: appointment.raw.doctor_expedient_duration
        }
      }
    }
  } else {
    vm.appointment = {};
  }
  
  //////////

  function _getPatients(search) {
    return $http.get( "api/patients", {
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
    vm.appointment.phone_number    = $item.phone_number;
    vm.appointment.patient_name = $label;
  }

  function _getDoctors(search) {
    return $http.get( "api/doctors", {
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
   * Função que cria uma lista de intervalos
   * 
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  function _createDurationTimes(interval) {
    var times = [];
    var start = interval;

    while(start <= 720) {
      var value   = "";
      var hours   = parseInt(start / 60);
      var minutes = parseInt(start - (hours * 60));

      if (hours == 1) {
        value = "1 hora";
      } else if (hours > 1) {
        value = hours + " horas";
      }

      value += (hours > 0 && minutes > 0) ? " e " : "";

      if (minutes > 0) {
        value += minutes + " minutos";
      }

      times.push({ id: start, value: value });
      start = start + interval;
    }

    return times;
  }

  function _submit(form) {
    if(form.$valid) {
      var params = {
        date: moment(vm.appointment.date).format("YYYY-MM-DD"),
        start_at: moment(vm.appointment.start_at).format("HH:mm"),
        end_at: moment(vm.appointment.end_at).format("HH:mm"),
        doctor_id: vm.appointment.doctor.id,
        patient_id: vm.appointment.patient.id,
        phone_number: vm.appointment.phone_number,
        notes: vm.appointment.notes
      };

      if(!vm.appointment.id) {
        params['patient_name'] = vm.appointment.patient_name || vm.appointment.patient;

        Appointment.save(params, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Appointmenta marcada com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      } else {
        params['status'] = vm.appointment.status;

        if(!params.patient_id) {
          params['patient_name'] = vm.appointment.patient;
        }

        Appointment.update({
          id: vm.appointment.id
        }, params, function(result) {
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
  }
}

angular.module('sistemizedental').controller("ModalEditAppointmentInstanceCtrl", ModalEditAppointmentInstanceCtrl);