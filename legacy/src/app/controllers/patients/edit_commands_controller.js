/**
 * @description
 * Visualização das informações de um paciente
 */
PatientsEditOrdersCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$filter', '$stateParams', 'deviceDetector', 'Order', 'DTOptionsBuilder', 'DTColumnBuilder', 'Patient'];
function PatientsEditOrdersCtrl($scope, $rootScope, $http, $compile, $filter, $stateParams, deviceDetector, Order, DTOptionsBuilder, DTColumnBuilder, Patient) {
  var vm = this;

  vm.editOrder      = _editOrder;
  vm.dtInstance       = {};
  vm.dtOptions        = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    Order.get({
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

  vm.dtColumns  = [
    DTColumnBuilder.newColumn('code')
      .withTitle("Código")
      .withOption('width', "4%"),     
    DTColumnBuilder.newColumn('date')
      .withTitle("Data")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _date = moment(data, "YYYY-MM-DD");

        return _date.isValid() ? _date.format("DD/MM/YYYY") : null;
    }),
    DTColumnBuilder.newColumn('cost')
      .withTitle("Valor da comanda")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {

        return $filter('currency')(data, 'R$ ', 2);
    }),
    DTColumnBuilder.newColumn('discount')
      .withTitle("Desconto")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {

        return $filter('currency')(data, 'R$ ', 2);
    }),
    DTColumnBuilder.newColumn('total')
      .withTitle("Valor cobrado")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {

        return $filter('currency')(data, 'R$ ', 2);
    }),
    DTColumnBuilder.newColumn('change')
      .withTitle("Troco")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        if(typeof data != "string")
          return null;

        if(data.charAt(0) == "-") {
          return '<span class="text-danger">' + $filter('currency')(data, 'R$ ', 2) + "</span>";
        } else {
          return '<span class="text-success">' + $filter('currency')(data, 'R$ ', 2) + "</span>";
        }
    }),
    DTColumnBuilder.newColumn('closed')
      .withTitle("Fechada?")
      .withOption('width', "7%")
      .renderWith(function(data, type, raw) {
        switch(data) {
          case '0':
            return '<div class="text-danger text-center"><i class="fa fa-lg fa-minus-circle"></i> Não</div>';
          case '1':
            return '<div class="text-success text-center"><i class="fa fa-lg fa-check-circle"></i> Sim</div>';
          default:
            return null;
        }
    }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "7%")
      .notSortable()
      .renderWith(function(data, type, raw) {

        return '<form role="form" class="compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editOrder(' + raw.id + ')">' + 
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
    }),
  ];

    ////////////  

  function _editOrder(command_id) {
    $scope.$emit('$modalOrder', {
      id: command_id
    });
  }
}

angular.module('sistemizedental').controller("PatientsEditOrdersCtrl", PatientsEditOrdersCtrl);