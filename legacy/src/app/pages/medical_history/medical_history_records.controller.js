/**
 * @description
 * Pagina para criação de novos pacientes
 */
MedicalHistoryRecordsCtrl.$inject = ['$scope', '$state', '$stateParams', '$compile', 'Appointment', 'DTOptionsBuilder', 'DTColumnBuilder', 'appointment'];
function MedicalHistoryRecordsCtrl($scope, $state, $stateParams, $compile, Appointment, DTOptionsBuilder, DTColumnBuilder, appointment) {
  var vm = this;

  this.appointment  = appointment;
  this.editAppointment  = _editAppointment;
  this.editDoctor   = _editDoctor;
  this.client_id = null;
  this.doctor_id = null;
  this.origin = null;

  this.dtInstance = {};
  this.dtOptions = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    Appointment.get({
      draw,
      page,
      offset,
      limit,
      // date_start: moment(this.date_start).format("YYYY-MM-DD"),
      // date_end: moment(this.date_end).format("YYYY-MM-DD"),
      // origin: this.origin,
      client_id: this.appointment.client_id,
      account_id: this.appointment.account_id,
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
  })
  this.dtOptions.withOption('lengthMenu', [10, 25, 50, 100, 300]);
  this.dtOptions.withOption('responsive', true);
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withDOM("<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  this.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });

  this.dtColumns = [
    DTColumnBuilder.newColumn('id')
      .withTitle("COD")
      .withOption('width', "5%"),
    DTColumnBuilder.newColumn('account_id')
      .withTitle("Dentista")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ui-sref="app.doctors.edition({ id: ' + raw.account_id + ' })">' +
            '<i class="fa fa-user fa-fw"></i>' + raw.account['full_name'] +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('created_at')
      .withTitle("Data do agendamento")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _data = moment(data);
        return _data.isValid() ? _data.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('date')
      .withTitle("Data da consulta")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _data = moment(data);
        return _data.isValid() ? _data.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('start_at')
      .withTitle("Hora inicial")
      .withOption('width', "9%")
      .renderWith(function(data, type, raw) {
        var _data = moment(data, 'HH:ss:ii');
        return _data.isValid() ? _data.format("HH:ss") : "";
      }),
    DTColumnBuilder.newColumn('end_at')
      .withTitle("Hora final")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {
        var _data = moment(data, 'HH:ss:ii');
        return _data.isValid() ? _data.format("HH:ss") : "";
      }),

    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "12%")
      .withOption('sortable', false)
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ui-sref="app.medical_history({ id: ' + raw.id + ' })">' +
            '<i class="fa fa-pencil fa-lg fa-fw"></i>&nbsp;Visualizar' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editAppointment(id) {
    $state.go('app.appointment', {
      id: id
    });
  }

  // Abrea a edição de um paciente
  function _editDoctor(id) {
    $state.go('app.doctors.edition', {
      id: id
    });
  }
}

angular.module('sistemizedental').controller("MedicalHistoryRecordsCtrl", MedicalHistoryRecordsCtrl);