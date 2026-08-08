/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalEditScheduleInstanceCtrl.$inject = ['$scope', '$http', '$uibModalInstance', 'appointment'];
function ModalEditScheduleInstanceCtrl($scope, $http, $uibModalInstance, appointment) {
  var vm = this;

  vm.close          = _close;
  vm.getPatients    = _getPatients;
  vm.selectPatient  = _selectPatient;
  vm.getDoctors     = _getDoctors;
  vm.appointment        = {
    date: appointment.start.format('DD/MM/YYYY'),
    patient: {
      id: appointment.raw.patient_id,
      name: appointment.raw.patient_name
    },
    phone_number: appointment.raw.patient_phone_number,
    doctor: {
      id: appointment.raw.doctor_id,
      name: appointment.raw.doctor_name,
      expedient: {
        duration: appointment.raw.doctor_expedient_duration
      }
    }
  }
  vm.createDurationTimes = _createDurationTimes;

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

  function _getDoctors(search) {
    return $http.get('api/doctors', {
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

  function _close() {
    $uibModalInstance.dismiss();
  }
}

angular.module('sistemizedental').controller("ModalEditScheduleInstanceCtrl", ModalEditScheduleInstanceCtrl);