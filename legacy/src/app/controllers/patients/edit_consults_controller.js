/**
 * @description
 * Visualização das informações de um paciente
 */
PatientsEditAppointmentsCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$stateParams', 'deviceDetector', 'Appointment', 'DTOptionsBuilder', 'DTColumnBuilder', 'Patient'];
function PatientsEditAppointmentsCtrl($scope, $rootScope, $http, $compile, $stateParams, deviceDetector, Appointment, DTOptionsBuilder, DTColumnBuilder, Patient) {
  var vm = this;

  vm.dtInstance       = {};
  vm.dtOptions        = DTOptionsBuilder.newOptions()
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
      order: [orderColumn, orderBy].join('-'),
      patient_id: $stateParams['id'] || null
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
  vm.dtOptions.withOption('lengthMenu', [10, 25, 50, 100, 300]);
  vm.dtOptions.withOption('responsive', true);
  vm.dtOptions.withOption('processing', true);
  vm.dtOptions.withOption('ordering', true);
  vm.dtOptions.withOption('responsive', deviceDetector.isMobile());
  vm.dtOptions.withOption('serverSide', true);
  vm.dtOptions.withPaginationType('full_numbers');
  vm.dtOptions.withDOM("<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  vm.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('id')
      .withTitle("COD")
      .withOption('width', "5%"),
    DTColumnBuilder.newColumn('doctor_name')
      .withTitle("Dentista")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ui-sref="doctors.edit({ id: ' + raw.doctor_id + ' })">' +
            '<i class="fa fa-user fa-fw"></i>' + data +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('created_at')
      .withTitle("Marcado em")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data);
        return end_at.isValid() ? end_at.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('date')
      .withTitle("Realizada em")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data);
        return end_at.isValid() ? end_at.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('start_at')
      .withTitle("Hora inicial")
      .withOption('width', "9%")
      .renderWith(function(data, type, raw) {
        var start_at = moment(data, 'HH:ss:ii');
        return start_at.isValid() ? start_at.format("HH:ss") : "";
      }),
    DTColumnBuilder.newColumn('end_at')
      .withTitle("Hora final")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data, 'HH:ss:ii');
        return end_at.isValid() ? end_at.format("HH:ss") : "";
      }),

    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "7%")
      .withOption('sortable', false)
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ui-sref="appointment({ id: ' + raw.id + ' })">' +
            '<i class="fa fa-eye fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a href="javascript:void(0);" class="text-danger hide" ng-click="vm.removeAppointment(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];
}

angular.module('sistemizedental').controller("PatientsEditAppointmentsCtrl", PatientsEditAppointmentsCtrl);