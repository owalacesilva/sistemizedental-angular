/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
CalendarCtrl.$inject = ['$scope', '$rootScope', 'SweetAlert', 'toasty', '$state', '$uibModal', 'uiCalendarConfig', 'deviceDetector', 'Appointment', 'Doctor', "Patient", "Product", 'accounts'];
function CalendarCtrl($scope, $rootScope, SweetAlert, toasty, $state, $uibModal, uiCalendarConfig, deviceDetector, Appointment, Doctor, Patient, Product, accounts) {
  var vm = this;

  const account_id_selected = sessionStorage.getItem('account_id_selected') || 0
  if (!account_id_selected) {  
    if (accounts && accounts.length) {
      vm.doctor = vm.account_selected = accounts[0]
    } else {
      toasty.error({ title: "Atenção!", msg: "Erro ao abrir agenda" })
      vm.doctor = vm.account_selected = {}
    }
  } else {
    vm.doctor = vm.account_selected = accounts.filter((f) => parseInt(f.id) === parseInt(account_id_selected))[0]
  }

  vm.accounts           = accounts;
  vm.changeDoctor       = _changeDoctor;
  vm.changeCalendar     = _changeCalendar;
  vm.changeDate         = _changeDate;
  vm.syncCalendar       = _syncCalendar;
  vm.editDoctor       = _editDoctor;
  vm.modalEditAppointment = _modalEditAppointment;
  vm.openSchedule       = _openSchedule;
  vm.calendarPromise    = null;
  vm.date_at = moment().toDate();
  vm.calendarConfig     = {
    calendar:{
      lang: 'pt-br',
      columnFormat: deviceDetector.isMobile() ? "ddd\nDD\nMMM" : "dddd\nDD-MMM",
      timeFormat: "H(:mm)t",
      axisFormat: "HH:mm",
      slotLabelFormat: "HH:mm",
      titleFormat: "DD MMMM YYYY",
      height: 650,
      editable: true,
      defaultDate: moment(vm.date_at).utc(),
      select: _selectCalendar,
      selectable: true,
      selectHelper: true,
      unselectAuto: true,
      allDaySlot: false,
      nowIndicator: true,
      defaultView: 'agendaWeek',
      slotDuration: '00:30',
      minTime: '00:00',
      maxTime: '24:00',
      header: false,
      eventClick: _openSchedule,
      eventDrop: handleDroppingOrResizingOfEvent,
      eventResize: handleDroppingOrResizingOfEvent,
      eventConstraint: "businessHours",
      selectConstraint: "businessHours",
      events: _updateEvents
    }
  };

  vm.eventSources = [];

  //////

  /**
   * Evento disparado quando se arrasta um agendamento
   * Evento disparado quando se redimenciona um agendamento
   */
  function handleDroppingOrResizingOfEvent(event, delta, revertFunc, jsEvent, ui, view) {
    const { cid, title, start, end, raw } = event

    const appointment = new Appointment({
      id: Number(cid), 
      account_id: raw.account_id
    })

    if (start && start.isValid()) {
      start.local()
      appointment.date_at = start.format('YYYY-MM-DD')
      appointment.start_time = start.toString()
    } else {
      appointment.start_time = moment(raw.start).toString()
    }

    if (end && end.isValid()) {
      end.local()
      appointment.end_time = event.end.toString()
    } else {
      appointment.end_time = moment(raw.end).toString()
    }

    appointment.$update()
      .then((res) => {
        const { date_at, start_time, end_time } = res
        var c = moment(start_time)
        
        // atualiza calendario
        uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
        toasty.success({
          title: "Consulta atualizada", 
          msg: `<b>${title}</b><br>Remarcada para:
            <br>${moment(date_at).format('DD/MM/YYYY')} ás ${moment.utc(start_time).local().format('HH:mm')}`
        })
      }, (res) => {
        toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
        revertFunc();
      })
  }

  function _selectCalendar(start, end, jsEvent, view) {
    start.local()
    end.local()

    var date_at = start.format("YYYY-MM-DD");
    var start_time = start.format("HH:mm");
    var end_time = end.format("HH:mm");

    const appointment = {
      account_id: vm.account_selected['id'],
      date_at,
      start_time: start,
      end_time: end,
      hours: start_time.split(':')[0],
      minutes: start_time.split(':')[1],
      duration_time: end.diff(start, 'minutes')
    }

    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_appointment.view.html',
      controller: 'ModalAppointmentInstanceCtrl',
      controllerAs: 'vm',
      size: 'lg',
      windowClass: 'modal-special dark',
      resolve: { appointment }
    }).result.then((new_appointment) => {
      //http://jsfiddle.net/mccannf/azmjv/16/
      // Atualiza os eventos da agenda
      uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
    }, (reject) => console.log(reject));
  }

  /**
   * Função que troca todos os vendos do calendario
   * conforme o profissional escolhido.
   */
  function _updateEvents(date_start, date_end, timezone, callback) {
    // Salva o dentista que foi selecionado recentimente
    sessionStorage.setItem('account_id_selected', vm.account_selected['id']);

    // Configura o expediente do calendario
    var business_hours = [];
    var min_time = '24:00';
    var max_time = '00:00';
    var working_hours = vm.account_selected.working_hours || {};

    // Domingo
    if (working_hours['works_sunday']) {
      let start_time = moment.utc(working_hours['sunday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['sunday_end_time']).utcOffset('-03:00').format('HH:mm')

      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [0],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Segunda
    if (working_hours['works_monday']) {
      let start_time = moment.utc(working_hours['monday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['monday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [1],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Terca
    if (working_hours['works_tuesday']) {
      let start_time = moment.utc(working_hours['tuesday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['tuesday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [2],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Quarta
    if (working_hours['works_wednesday']) {
      let start_time = moment.utc(working_hours['wednesday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['wednesday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [3],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Quinta
    if (working_hours['works_thursday']) {
      let start_time = moment.utc(working_hours['thursday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['thursday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [4],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Sexta
    if (working_hours['works_friday']) {
      let start_time = moment.utc(working_hours['friday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['friday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [5],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    // Sabado
    if (working_hours['works_saturday']) {
      let start_time = moment.utc(working_hours['saturday_start_time']).utcOffset('-03:00').format('HH:mm')
      let end_time = moment.utc(working_hours['saturday_end_time']).utcOffset('-03:00').format('HH:mm')
      
      if (start_time < min_time) min_time = start_time
      if (end_time > max_time) max_time = end_time

      business_hours.push({
        className: 'fc-nonbusiness',
        // Dias da Semana 
        dow: [6],
        // Hoarios desse dia
        start: start_time,
        end: end_time,
        rendering: 'inverse-background'
      });
    }

    if(min_time > max_time) {
      var tmp  = min_time;
      min_time = max_time;
      max_time = tmp;
    }

    if(working_hours.interval) {
      slot_duration = moment()
        .utc()
        .startOf('day')
        .add(working_hours.interval, 'minutes')
        .format('HH:mm:ss');
    }

    // Define os horarios bloqueados do calendario
    vm.calendarConfig.calendar.businessHours = business_hours;
    //vm.calendarConfig.calendar.slotDuration  = slot_duration;
    vm.calendarConfig.calendar.minTime       = min_time || '00:00';
    vm.calendarConfig.calendar.maxTime       = max_time || '24:00';
    vm.calendarConfig.calendar.defaultDate   = moment(vm.date_at).utc();

    var defered = Appointment.get({
      account_id: vm.account_selected['id'],
      date_start: date_start.format('YYYY-MM-DD'),
      date_end: date_end.format('YYYY-MM-DD')
    }, function(result) {
      const appointments = result.rows;

      // Cached appointments list
      sessionStorage.setItem('appointments_cached', angular.toJson(appointments));
      // Formatting appointments list before sending to events calendar
      callback( _formatEvents(appointments) ); 
    }, function(reason) {
      // Verifica se o sistema está no modo offline
      // caso esteja, completa com o cache de consultas
      if( $rootScope.offline_mode.enabled ) {
        var cache_appointments = sessionStorage.getItem('appointments_cached');

        if(cache_appointments != null) {
          // Atualiza a lista de consultas e o dentista selecionado
          var events = _formatEvents( angular.fromJson(cache_appointments) );

          // Responde para o componente calendar
          callback( events ); 
        }
      }
    });

    vm.calendarPromise = defered.$promise;
  }

  function _openSchedule(calendar_event) {
    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_scheduling.view.html',
      controller: 'ModalSchedulingInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        calEvent: ['$q', function ($q) {
          return $q.resolve(calendar_event);
        }]
      }
    }).result.then((result) => {
      if ( result.status == "open" ) {
        $state.go('app.medical_history', { 
          id: calendar_event.raw.id
        })
      } else if ( result.status == "edit" ) {
        _modalEditAppointment(calendar_event)
      } else if (result.status == "confirmed" && result.order_id) {
        $scope.$emit('$modalOrder', { id: result.order_id })
        uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents')
      } else if (result.status == "prescription") {
        _modalPrescription(calendar_event)
        uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents')
      } else {
        uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents')
      }
    })
  }

  function _modalPrescription(calEvent) {
    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_prescription.view.html',
      controller: 'ModalPrescriptionInstanceCtrl',
      controllerAs: 'vm',
      size: 'lg',
      windowClass: "",
      resolve: { patient: Patient.get({ id: calEvent.raw.patient_id }) }
    }).result.then(function(result) {
      // Atualiza agendamentos
      uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
    });
  }

  function _modalEditAppointment(calendar_event = {}) {
    const start = calendar_event.start || moment().utc()
    const end = calendar_event.end || moment().utc()
    const date_at = start.format("YYYY-MM-DD")
    const start_time = start.format("HH:mm")
    const end_time = end.format("HH:mm")

    const appointment = {
      ...(calendar_event.raw || {}), // pre datas
      account_id: vm.account_selected['id'],
      date_at,
      start_time,
      end_time,
      hours: start_time.split(':')[0],
      minutes: start_time.split(':')[1],
      duration_time: end.diff(start, 'minutes')
    }

    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_appointment.view.html',
      controller: 'ModalAppointmentInstanceCtrl',
      controllerAs: 'vm',
      size: 'lg',
      windowClass: 'modal-special dark',
      resolve: { appointment }
    }).result.then(function(result) {
      // Atualiza agendamentos
      uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
    });
  }

  /**
   * Evento dispardo quando troca um dentista
   */
  function _changeDoctor(doctor) {
    if (angular.isDefined(doctor)) {
      vm.account_selected = doctor;
    } else {
      vm.account_selected = vm.doctor;
    }

    // Requisita as consultas da semana selecionada
    uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
  }

  /**
   * Evento disparado quando a data é trocada
   */
  function _changeDate() {
    // Leva a agenda para a semana da data selecionada
    uiCalendarConfig.calendars.calendar.fullCalendar('gotoDate', moment(vm.date_at).utc());
  }

  function _changeCalendar(action) {
    switch(action) {
      case 'today':
        vm.date_at = moment().utc().toDate();
        break;
      case 'back':
        vm.date_at = moment(vm.date_at).subtract(1, 'weeks').utc().toDate();
        break;
      case 'next':
        vm.date_at = moment(vm.date_at).add(1, 'weeks').utc().toDate();
        break;
    }

    _changeDate();
  }

  /**
   * Essa função formata as consultas recebidas do servidor
   * e eventos do calendario.
   * 
   * @param  {[type]} appointments [description]
   */
  function _formatEvents(appointments) {    
    const status_colors = { 'created': '#66BB6A', 'confirmed': '#1E88E5', 'canceled': '#EF5350', 'missed': '#A94276', 'arrived': '#374456', 'finished': '#BDBDBD' }  
    return appointments.map((item) => {
      // Get start and end times and create moments objects with UTC
      const utc_date_at = moment.utc(item.date_at)
      const utc_start_time = moment.utc(item.start_time)
      const utc_end_time = moment.utc(item.end_time)
      
      // Creates already on Timezone local
      const start = moment.utc({ 
        year: utc_date_at.year(), 
        month: utc_date_at.month(), 
        date: utc_date_at.date(), 
        hour: utc_start_time.hours(), 
        minute: utc_start_time.minutes()
      }).utcOffset('-03:00')

      const end = moment.utc({ 
        year: utc_date_at.year(), 
        month: utc_date_at.month(), 
        date: utc_date_at.date(), 
        hour: utc_end_time.hours(), 
        minute: utc_end_time.minutes()
      }).utcOffset('-03:00')
  
      return {
        cid: item.id,
        title: (item.client || {})['full_name'],
        status: item.status,
        start: start, // As ISO 8061 String
        end: end, // As ISO 8061 String
        startEditable: ['created', 'confirmed', 'missed'].indexOf(item.status) > -1,
        durationEditable: ['created', 'confirmed', 'missed'].indexOf(item.status) > -1,
        overlap: false,
        backgroundColor: status_colors[item.status],
        borderColor: status_colors[item.status],
        className: "cal-event",
        raw: item,
      }
    })
  }

  function _editDoctor() {
    if (vm.account_selected) {
      $state.go('app.doctors.edition', {
        id: vm.account_selected.id,
        tab: 1
      })
    }
  }

  function _syncCalendar() {
    $rootScope.offline_mode.enabled = false;
  }
}

angular.module('sistemizedental').controller("CalendarCtrl", CalendarCtrl);