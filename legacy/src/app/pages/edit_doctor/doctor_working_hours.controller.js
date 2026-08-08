/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
DoctorWorkingHoursCtrl.$inject = ['$scope', '$rootScope', '$http', '$stateParams', '$state', 'SweetAlert', 'Doctor', 'DoctorsCache', 'doctor'];
function DoctorWorkingHoursCtrl($scope, $rootScope, $http, $stateParams, $state, SweetAlert, Doctor, DoctorsCache, doctor) {
  var vm = this
  
  const start_time = "00:00"
  const end_time = "23:00"
  const interval = 30
  this.doctor = { ...doctor }
  this.createDurationTimes = _createDurationTimes
  this.rangeHours  = rangeHours(start_time, end_time, interval)

  parseWorkingHours()

  this.onSubmit = (isValid) => {
    if(isValid) {
      let data = { 
        // This is just workaround
        working_hours_attributes: normalizeTimes(vm.doctor.working_hours)
      }

      Doctor.working_hours({ id: vm.doctor.id }, data, successCallback, errorCallback);

      function successCallback(res) {
        if(!res.error) {
          SweetAlert.swal('Pronto', 'Informações salvas com sucesso', 'success');
          DoctorsCache.updateCache();
        } else {
          SweetAlert.swal('Atenção', res.errors, 'error');
        }
      }

      function errorCallback(res) {
        SweetAlert.swal('Atenção', res.data.errors || 'Ocorreu uma falha na comunicação com o serviço', 'error');
      }
    }
  }

  /**
   * 
   * @param {*} times 
   */
  function normalizeTimes(times) {
    const working_hours = { ...times }

    if (working_hours['sunday_start_time']) working_hours['sunday_start_time'] = moment(working_hours['sunday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['sunday_end_time']) working_hours['sunday_end_time'] = moment(working_hours['sunday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['monday_start_time']) working_hours['monday_start_time'] = moment(working_hours['monday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['monday_end_time']) working_hours['monday_end_time'] = moment(working_hours['monday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['tuesday_start_time']) working_hours['tuesday_start_time'] = moment(working_hours['tuesday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['tuesday_end_time']) working_hours['tuesday_end_time'] = moment(working_hours['tuesday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['wednesday_start_time']) working_hours['wednesday_start_time'] = moment(working_hours['wednesday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['wednesday_end_time']) working_hours['wednesday_end_time'] = moment(working_hours['wednesday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['thursday_start_time']) working_hours['thursday_start_time'] = moment(working_hours['thursday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['thursday_end_time']) working_hours['thursday_end_time'] = moment(working_hours['thursday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['friday_start_time']) working_hours['friday_start_time'] = moment(working_hours['friday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['friday_end_time']) working_hours['friday_end_time'] = moment(working_hours['friday_end_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['saturday_start_time']) working_hours['saturday_start_time'] = moment(working_hours['saturday_start_time'], 'HH:mm').utcOffset('-03:00').toString()
    if (working_hours['saturday_end_time']) working_hours['saturday_end_time'] = moment(working_hours['saturday_end_time'], 'HH:mm').utcOffset('-03:00').toString()

    return working_hours
  }

  /**
   * 
   */
  function parseWorkingHours() {
    if (vm.doctor.working_hours) {
      if (vm.doctor.working_hours['sunday_start_time'])
        vm.doctor.working_hours['sunday_start_time'] = moment.utc(vm.doctor.working_hours['sunday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['sunday_end_time'])
        vm.doctor.working_hours['sunday_end_time'] = moment.utc(vm.doctor.working_hours['sunday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['monday_start_time'])
        vm.doctor.working_hours['monday_start_time'] = moment.utc(vm.doctor.working_hours['monday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['monday_end_time'])
        vm.doctor.working_hours['monday_end_time'] = moment.utc(vm.doctor.working_hours['monday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['tuesday_start_time'])
        vm.doctor.working_hours['tuesday_start_time'] = moment.utc(vm.doctor.working_hours['tuesday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['tuesday_end_time'])
        vm.doctor.working_hours['tuesday_end_time'] = moment.utc(vm.doctor.working_hours['tuesday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['wednesday_start_time'])
        vm.doctor.working_hours['wednesday_start_time'] = moment.utc(vm.doctor.working_hours['wednesday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['wednesday_end_time'])
        vm.doctor.working_hours['wednesday_end_time'] = moment.utc(vm.doctor.working_hours['wednesday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['thursday_start_time'])
        vm.doctor.working_hours['thursday_start_time'] = moment.utc(vm.doctor.working_hours['thursday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['thursday_end_time'])
        vm.doctor.working_hours['thursday_end_time'] = moment.utc(vm.doctor.working_hours['thursday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['friday_start_time'])
        vm.doctor.working_hours['friday_start_time'] = moment.utc(vm.doctor.working_hours['friday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['friday_end_time'])
        vm.doctor.working_hours['friday_end_time'] = moment.utc(vm.doctor.working_hours['friday_end_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['saturday_start_time'])
        vm.doctor.working_hours['saturday_start_time'] = moment.utc(vm.doctor.working_hours['saturday_start_time']).utcOffset('-03:00').format('HH:mm')
      if (vm.doctor.working_hours['saturday_end_time'])
        vm.doctor.working_hours['saturday_end_time'] = moment.utc(vm.doctor.working_hours['saturday_end_time']).utcOffset('-03:00').format('HH:mm')
    }
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
        value: times[i],
        label: times[i]
      });
    }

    return res;
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
}

angular.module('sistemizedental').controller("DoctorWorkingHoursCtrl", DoctorWorkingHoursCtrl);