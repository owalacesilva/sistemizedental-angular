/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalExpedientInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'SweetAlert', 'DoctorsCache', 'Expedient', 'expedient'];
function ModalExpedientInstanceCtrl($scope, $uibModalInstance, SweetAlert, DoctorsCache, Expedient, expedient) {
  var vm = this;

  vm.expedient  = expedient || {
    weekday: [{weekday: 0, active: 0, has_interval: 0},{weekday: 1, active: 0, has_interval: 0},{weekday: 2, active: 0, has_interval: 0},
      {weekday: 3, active: 0, has_interval: 0},{weekday: 4, active: 0, has_interval: 0},{weekday: 5, active: 0, has_interval: 0},{weekday: 6, active: 0, has_interval: 0}]
  };
  vm.submit     = _submit;
  vm.close      = _close;
  vm.times      = [{id: 0, name: 'Selecione uma duração'},{id: 15, name: '15 Minutos'},{id: 30, name: '30 Minutos'},{id: 45, name: '45 Minutos'},{id: 60, name: '1 Hora'},{id: 75, name: '1 Hora e 15 Minutos'},{id: 90, name: '1 Hora e 30 Minutos'},{id: 105, name: '1 Hora e 45 Minutos'},{id: 120, name: '2 Hora'},{id: 135, name: '2 Hora e 15 Minutos'},{id: 150, name: '2 Hora e 30 Minutos'},{id: 165, name: '2 Hora e 45 Minutos'},{id: 180, name: '3 Hora'}];
  vm.rangeHours = [];

  var start_time  = "00:00:00";
  var end_time    = "23:00:00";
  var interval    = 60;
  vm.rangeHours   = rangeHours(start_time, end_time, interval);

  function _submit(isValid) {
    if(isValid) {

      if(vm.expedient.id) {
        Expedient.update(vm.expedient, requestSuccess, requestFail);
      } else {
        Expedient.save(vm.expedient, requestSuccess, requestFail);
      }
    }
  }

  function requestSuccess(result) {
    if(result.success) {
      $uibModalInstance.close(result.data);
      SweetAlert.swal('Pronto', 'Informações atualizadas com sucesso', 'success');

      if(vm.expedient.id) {
        // Atualiza o cache de doutores
        DoctorsCache.updateCache();
      }
    } else {
      SweetAlert.swal('Atenção', result.errors, 'error');
    }
  }

  function requestFail() {
    SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  }

  function _close() {
    $uibModalInstance.close('dismiss');
  }

  /**
   * Cria um range de horas baseado em uma hora inicial
   * e uma hora final dentro de um intervalo recebido.
   * 
   * @param  {[type]} start    [description]
   * @param  {[type]} end      [description]
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  function rangeHours(start_time, end_time, interval) {
    var start = start_time.split(':').map(Number);
    var end   = end_time.split(':').map(Number);


    var res   = [];
    var times = [];

    while (!(start[0] > end[0] && start[1] >= end[1])) {
      times.push((start[0] < 10 ? '0' + start[0] : start[0]) + 
        ':' + (start[1] < 10 ? '0' + start[1] : start[1]));

      start[1] += interval;

      if (start[1] > 59) {
        start[0] += 1;
        start[1] %= 60;
      }
    }

    for (var i = 0; i < times.length; i++) {
      res.push({
        value: times[i] + ":00",
        label: times[i]
      });
    }

    return res;
  }  
}

angular.module('sistemizedental').controller("ModalExpedientInstanceCtrl", ModalExpedientInstanceCtrl);