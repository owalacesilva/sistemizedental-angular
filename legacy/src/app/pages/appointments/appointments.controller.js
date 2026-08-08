/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
AppointmentsCtrl.$inject = ['$scope',  '$compile', '$state', 'deviceDetector', 'Appointment', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder', 'doctors'];
function AppointmentsCtrl($scope,  $compile, $state, deviceDetector, Appointment, toasty, DTOptionsBuilder, DTColumnBuilder, doctors) {
  var vm = this;

  this.date_start = moment().toDate();
  this.date_end = moment().toDate();

  this.editPatient = _editPatient;
  this.editDoctor = _editDoctor;
  this.removeAppointment = _removeAppointment;
  this.doctor_id = null;
  this.origin = null;
  this.refresh = _refresh;
  this.doctors = doctors;
  this.selectPeriod = _selectPeriod;
  this.periods = [
    { label: 'Hoje', range: [moment(), moment()] },
    { label: 'Ontem', range: [moment().subtract(1, 'days'), moment().subtract(1, 'days')] },
    { label: 'Últimos 7 dias', range: [moment().subtract(6, 'days'), moment()] },
    { label: 'Últimos 30 dias', range: [moment().subtract(29, 'days'), moment()] },
    { label: 'Este mês', range: [moment().startOf('month'), moment().endOf('month')] },
    { label: 'Mês passado', range: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
  ];

  var cacheLimitsTable = JSON.parse(sessionStorage.getItem('cache--limits_table'));
  if (!cacheLimitsTable) {
    cacheLimitsTable = { 'appointments': 5 };
  } else if (!cacheLimitsTable['appointments']) {
    cacheLimitsTable['appointments'] = 5;
  }

  this.dtInstance = {};
  this.dtOptions  = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    cacheLimitsTable['appointments'] = limit;
    sessionStorage.setItem('cache--limits_table', JSON.stringify(cacheLimitsTable));

    Appointment.query({
      draw,
      page,
      offset,
      limit,
      date_start: moment(this.date_start).format("YYYY-MM-DD"),
      date_end: moment(this.date_end).format("YYYY-MM-DD"),
      origin: this.origin,
      doctor_id: this.doctor_id,
      order: [orderColumn, orderBy].join('-')
    }, (res) => {
      const count = res.count || 0;
      const rows = res.rows || [];

      fnCallback({
        draw: res.draw || 0,
        data: rows,
        recordsTotal: count,
        recordsFiltered: count
      });
    }, (reason) => {
      fnCallback({
        draw: 0,
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
      })
    })
  });
  this.dtOptions.withOption('lengthMenu', [10, 25, 50, 100, 300]);
  this.dtOptions.withOption('responsive', true);
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withOption('responsive', deviceDetector.isMobile());
  this.dtOptions.withOption('lengthMenu', [5, 10, 25, 50, 75, 100, 200, 500]);
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withDOM("rt<'container-fluid'<'row'<'col-sm-3'l><'col-sm-9'p>>>");
  this.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });
  this.dtOptions.withDisplayLength(cacheLimitsTable['appointments']);
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withLanguage({
    "processing": "Buscando registros....",
    "info": "Mostrando página _PAGE_ de _PAGES_",
    "lengthMenu": "Mostrar _MENU_ registros",
    "emptyTable": "Nenhuma registro encontrado",
    "paginate": {
      "first": "Primeira",
      "last": "Última",
      "previous": "<",
      "next": ">",
    }
  });

  this.dtColumns = [
    DTColumnBuilder.newColumn('id')
      .withTitle("COD")
      .withOption('width', "5%"),
    DTColumnBuilder.newColumn('client_id')
      .withTitle("Nome do Paciente")
      .renderWith(function(data, type, raw) {
        return '<div class="compile">' + 
          '<div class="pull-left">' +
            '<ng-letter-avatar data="' + raw.client.full_name + '" charCount="2" width="40px" height="40px" fontSize="20px"></ng-letter-avatar>' + 
          '</div>' +
          '<div style="padding-left: 45px">' + 
            '<a href="javascript:void(0);" ng-click="vm.editPatient(' + raw.client_id + ')">' +
              '<strong>' + raw.client.full_name + '</strong>' + 
            '</a><br>' + 
            '<span>' + raw.client.phone_number + '</span>' + 
          '</div>' +
        '</div>';
      }),
    DTColumnBuilder.newColumn('account_id')
      .withTitle("Dentista")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ui-sref="app.doctors.edition({ id: ' + raw.account_id + ' })">' +
            '<i class="fa fa-user-md fa-fw"></i>' + raw.account.full_name +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('date_at')
      .withTitle("Data")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data).utc()
        return end_at.isValid() ? end_at.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Horário")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        const start_time = moment(raw.start_time)
        const end_time = moment(raw.end_time)

        if (start_time.isValid() && end_time.isValid()) {
          return `${start_time.utc().format("HH:mm")} àte ${end_time.utc().format("HH:mm")}`
        } else {
          return '--'
        }
      }),
    DTColumnBuilder.newColumn('created_at')
      .withTitle("Marcado em")
      .withOption('width', "15%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data);
        var formatted = end_at.isValid() ? end_at.format("DD/MM/YYYY [\n] HH:mm") : "";
        return '<span class="text-center">' + formatted + '</span>';
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "7%")
      .withOption('sortable', false)
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ui-sref="app.medical_history({ id: ' + raw.id + ' })">' +
            '<i class="fa fa-eye fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a href="javascript:void(0);" class="text-danger hide" ng-click="vm.removeAppointment(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editPatient(id) {
    $state.go('app.patients.edit', {
      id: id
    });
  }

  // Abrea a edição de um paciente
  function _editDoctor(id) {
    $state.go('app.doctors.edition', {
      id: id
    });
  }

  function _selectPeriod(index) {
    var period = vm.periods[index];

    vm.date_start = period.range[0].toDate();
    vm.date_end = period.range[1].toDate();

    _refresh();
  }

  // Remove um pacientes
  function _removeAppointment(id) {
    Appointment.delete({ 
      id: id 
    }, function(response) {
      if(response.success) {
        toasty.success({
          title: "Ok", 
          msg: "Appointmenta removido com sucesso"
        });

        vm.dtInstance.dataTable.fnDraw();
      } else {
        toasty.error({title: "Atenção", msg: response.error});
      }
    }, function() {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
    });
  }

  // Atualiza os dados da tabela
  function _refresh() {
    vm.dtInstance.dataTable.fnDraw();
  }
}

angular.module('sistemizedental').controller("AppointmentsCtrl", AppointmentsCtrl);