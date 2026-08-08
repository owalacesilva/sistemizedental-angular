/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalAppointmentInstanceCtrl.$inject = ['$scope', '$http', '$uibModalInstance', 'SweetAlert', 'toasty', 'Appointment', 'DoctorsCache', 'Product', 'appointment'];
function ModalAppointmentInstanceCtrl($scope, $http, $uibModalInstance, SweetAlert, toasty, Appointment, DoctorsCache, Product, appointment) {
  var vm = this;

  this.$http = $http
  this.$uibModalInstance = $uibModalInstance
  this.SweetAlert = SweetAlert

	var interval = 5;
	this.rangeHours = [];
	this.rangeMinutes = [];
	this.accountList = [];
	this.serviceList = [];
  this.duration_times = this.createDurationTimes(interval);
  const client_default = {
    id: null,
    full_name: null, 
    phone_number: null,
    email: null,
    balance: 0
  }

  if(appointment) {
    const client = appointment['client'] || client_default
    this.appointment = new Appointment({ 
      ...appointment, 
  		service_id: null, 
  		additional_services: [],
      client: {
        ...client_default, 
        ...client
      } 
    })
  } else {
    this.appointment = new Appointment({
  		date: moment().toDate(),
  		start_time: moment(),
  		end_time: moment(),
  		account_id: parseInt(sessionStorage.getItem('account_id_selected')) || null,
  		note: null,
  		client: { ...client_default }, 
  		hours: null, 
      minutes: null, 
      duration_time: null, 
  		service_id: null,
  		additional_services: []
    }); 
  }

  this.getDoctors(DoctorsCache)
  this.getServices(Product)
}

/**
 * [changeDurationAppointment description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeDurationAppointment = function() {
  const { start_time, service_id } = this.appointment
  var duration_time = null

  if (service_id) {
    const service = this.serviceList.filter((s) => s.id === service_id)[0]
    duration_time = Number(service.duration_time)
    
    angular.forEach(this.appointment.additional_services, (item) => {
      if(item.value && item.value.id) {
        // Busca o tempo do serviço
        duration_time += Number(item.value.duration_time)
      }
    });
  }
  
  this.appointment.duration_time = duration_time
  this.appointment.end_time = moment(start_time).add(duration_time, 'minutes')
}

/**
 * [changeStartTime description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeStartTime = function() {
  const { hours, minutes, duration_time } = this.appointment
  const time = moment({ hours: hours, minutes: minutes })

  this.appointment.start_time = moment(time)
  this.appointment.end_time = moment(time).add(duration_time, 'minutes')
}

/**
 * [changeOnlyDurationTime description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeOnlyDurationTime = function() {
  const { hours, minutes, duration_time } = this.appointment
  const time = moment({ hours: hours, minutes: minutes })

  this.appointment.start_time = moment(time)
  this.appointment.end_time = moment(time).add(duration_time, 'minutes')
}

/**
 * [_changeService description]
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeService = function() {
  this.changeDurationAppointment()
}

/**
 * [_addService description]
 */
ModalAppointmentInstanceCtrl.prototype.addAdditionalService = function() {
  if (this.appointment.additional_services) {
    this.appointment.additional_services.push({
      lingers: angular.copy(this.serviceList)
    })
  } else {
    this.appointment.additional_services = new Array({
      lingers: angular.copy(this.serviceList)
    })
  }

  this.changeDurationAppointment();
}

/**
 * [removeAdditionalService description]
 * 
 * @param  {[type]} service [description]
 * @return {[type]}         [description]
 */
ModalAppointmentInstanceCtrl.prototype.removeAdditionalService = function (service) {
  var index = this.appointment.additional_services.indexOf(service);

  if(index > -1) {
    this.appointment.additional_services.splice(index, 1);
  }

  this.changeDurationAppointment();
}

/**
 * [changeDoctorOrDate description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeDoctorOrDate = function() {
  if(!this.appointment.account_id) return;

  const filtered = this.accountList.filter(d => d.id === this.appointment.account_id)
  if (!filtered.length) return;

  const working_hours = filtered[0].working_hours
  let start_time = "00:00";
  let end_time   = "23:00";
  
  var date = null;
  if(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/.test(this.appointment.date_at)) {
    date = moment(this.appointment.date_at, 'YYYY-MM-DD');
  } else {
    date = moment(this.appointment.date_at);
  }

  switch(date.day()) {
    case 0: 
      start_time = working_hours['sunday_start_time'] || start_time;
      end_time   = working_hours['sunday_end_time'] || end_time;
      break;
    case 1: 
      start_time = working_hours['monday_start_time'] || start_time;
      end_time   = working_hours['monday_end_time'] || end_time;
      break;
    case 2: 
      start_time = working_hours['tuesday_start_time'] || start_time;
      end_time   = working_hours['tuesday_end_time'] || end_time;
      break;
    case 3: 
      start_time = working_hours['wednesday_start_time'] || start_time;
      end_time   = working_hours['wednesday_end_time'] || end_time;
      break;
    case 4: 
      start_time = working_hours['thursday_start_time'] || start_time;
      end_time   = working_hours['thursday_end_time'] || end_time;
      break;
    case 5: 
      start_time = working_hours['friday_start_time'] || start_time;
      end_time   = working_hours['friday_end_time'] || end_time;
      break;
    case 6: 
      start_time = working_hours['saturday_start_time'] || start_time;
      end_time   = working_hours['saturday_end_time'] || end_time;
      break;
  }

  const start_at = moment(start_time).utcOffset('-03:00').hours()
  const end_at = moment(end_time).utcOffset('-03:00').hours()

  this.rangeHours.length = 0;
  for(var i = start_at; i <= end_at; i++) {
    var tmp = i;
    if (tmp < 10) { tmp = '0' + tmp; }
    this.rangeHours.push(tmp + '');
  }

  this.rangeMinutes.length = 0;
  for(var i = 0; i < 60; i++) {
    var tmp = i;
    if (tmp < 10) { tmp = '0' + tmp; }
    this.rangeMinutes.push(tmp + '');
  }
}

/**
 * [changeDate description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeDate = function() {
  this.changeDoctorOrDate();
}

/**
 * [changeDoctor description]
 * 
 * @return {[type]} [description]
 */
ModalAppointmentInstanceCtrl.prototype.changeDoctor = function() {
  this.changeDoctorOrDate();
}

/**
 * [getClients description]
 * 
 * @param  {[type]} search [description]
 * @return {[type]}        [description]
 */
ModalAppointmentInstanceCtrl.prototype.getClients = function(search) {
  return this.$http.get('api/clients', {
    params: { q: search }
  }).then((res) => {
    var data = res.data;
    return data && data.count ? data.rows.map(item => item) : null
  })
}

/**
 * [selectClient description]
 * 
 * @param  {[type]} $item  [description]
 * @param  {[type]} $model [description]
 * @param  {[type]} $label [description]
 * @param  {[type]} $event [description]
 * @return {[type]}        [description]
 */
ModalAppointmentInstanceCtrl.prototype.selectClient = function($item, $model, $label, $event) {
  this.appointment.client_id = $item.id; // workaround
  this.appointment.client.id = $item.id;
  this.appointment.client.full_name = $item.full_name;
  this.appointment.client.balance = $item.balance;
  this.appointment.client.phone_number = $item.phone_number;
  this.appointment.client.email = $item.email;
}

/**
 * [selectClient description]
 * 
 * @return {[type]}        [description]
 */
ModalAppointmentInstanceCtrl.prototype.clearClient = function() {
  this.appointment.client_id = null; // workaround
  this.appointment.client.id = null;
  this.appointment.client.full_name = null;
  this.appointment.client.balance = 0.0;
  this.appointment.client.phone_number = null;
  this.appointment.client.email = null;
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
ModalAppointmentInstanceCtrl.prototype.rangeHours = function(start_time, end_time, interval) {
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

/**
 * Função que cria uma lista de intervalos
 * 
 * @param  {[type]} interval [description]
 * @return {[type]}          [description]
 */
ModalAppointmentInstanceCtrl.prototype.createDurationTimes = function(interval) {
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

/**
 * [onSubmit description]
 * 
 * @param  {[type]} form [description]
 * @return {[type]}      [description]
 */
ModalAppointmentInstanceCtrl.prototype.onSubmit = function(form) {
  if (form.$valid) {
    if ( 
      !this.appointment.client_id && 
      !this.appointment.client && 
      !this.appointment.client.id && 
      !this.appointment.client.full_name ) {
      this.SweetAlert.swal('Atenção', "Nenhum paciente foi selecionado para essa appointmenta", 'error'); return;
    }

    // Normalize times
    const { start_time, end_time } = this.appointment
    start_time.local()
    end_time.local()
    this.appointment.start_time = start_time.toString()
    this.appointment.end_time = end_time.toString()

    let promise = null
    if (this.appointment.id) { 
      promise = this.appointment.$update()
    } else {
      promise = this.appointment.$save()
    }

    promise.then((res) => {
      if(!res.error) {
        this.$uibModalInstance.close(res);

        this.SweetAlert.swal('Pronto', "Consulta marcada com sucesso", 'success');
      } else {
        this.SweetAlert.swal('Atenção', res.errors, 'error');
      }
    }, (res) => {
      this.SweetAlert.swal('Atenção', (res.data.error || 'Ocorreu uma falha de comunicação com o serviço'), 'error')
    })
  }
}

/**
 * 
 */
ModalAppointmentInstanceCtrl.prototype.getDoctors = function(DoctorsCache) {
  DoctorsCache.getDoctors().then(res => {
    this.accountList.splice(0, this.accountList.length, ...res)
    this.changeDoctorOrDate()
  }, (reject) => {
    toasty.error({ title: "Atenção", msg: reject })
  })
}

/**
 * 
 */
ModalAppointmentInstanceCtrl.prototype.getServices = function (Product) {  
  Product.query({
    limit: 100
  }, (res) => {
    res.count ? this.serviceList.splice(0, this.serviceList.length, ...res.rows) : null
  }, (reject) => {
    toasty.error({ title: "Atenção", msg: reject })
  })
}

angular.module('sistemizedental').controller("ModalAppointmentInstanceCtrl", ModalAppointmentInstanceCtrl);
