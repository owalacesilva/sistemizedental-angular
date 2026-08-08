/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
CashiersCtrl.$inject = ['$scope', '$compile', 'deviceDetector', 'SweetAlert', 'Cashier', 'DTOptionsBuilder', 'DTColumnBuilder']
function CashiersCtrl($scope, $compile, deviceDetector, SweetAlert, Cashier, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  this.cashierFactory = Cashier
  this.SweetAlert = SweetAlert
  this.date_start = moment().subtract(1, 'months').toDate();
  this.date_end = moment().toDate();
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
    cacheLimitsTable = { 'cashiers': 5 };
  } else if (!cacheLimitsTable['cashiers']) {
    cacheLimitsTable['cashiers'] = 5;
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

    cacheLimitsTable['cashiers'] = limit;
    sessionStorage.setItem('cache--limits_table', JSON.stringify(cacheLimitsTable));

    Cashier.query({
      draw,
      page,
      offset,
      limit,
      order: [orderColumn, orderBy].join('-'),
      date_start: moment(this.date_start).format("YYYY-MM-DD"),
      date_end: moment(this.date_end).format("YYYY-MM-DD"),
      status: this.status
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
  this.dtOptions.withDataProp('data');
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('order', [[ 0, "desc" ]]);
  this.dtOptions.withOption('responsive', deviceDetector.isMobile());
  this.dtOptions.withOption('lengthMenu', [5, 10, 25, 50, 75, 100, 200, 500]);
  this.dtOptions.withDOM("<'row'<'col-sm-12'rt>><'row'<'col-sm-3'l><'col-sm-9'p>>");
  this.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });
  this.dtOptions.withDisplayLength(cacheLimitsTable['cashiers']);
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

  var dom = "<'row'<'col-lg-12 col-md-12 col-sm-12 col-xs-12'<\"#toolbar\">>>" +
  "<'row'<'col-sm-12'rt>>" +
  "<'row'<'col-sm-3'l><'col-sm-9'p>>";

  this.dtOptions.withDOM(dom);

  this.dtColumns  = [
    DTColumnBuilder.newColumn('id')
      .withTitle("Número")
      .withOption('width', "3%"),     
    DTColumnBuilder.newColumn('opened_at')
      .withTitle("Aberto em")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => (d = moment(data)).isValid() ? d.format("DD/MM/YYYY") : null),
    DTColumnBuilder.newColumn('closed_at')
      .withTitle("Fechado em")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => (d = moment(data)).isValid() ? d.format("DD/MM/YYYY") : null),
    DTColumnBuilder.newColumn('status')
      .withTitle("Status")
      .withOption('width', "5%")
      .renderWith((data, type, raw) => {
        switch(data) {
          case 'closed': return '<strong class="text-info">Fechado</strong>'
          case 'opened': return '<strong class="text-danger">Aberto</strong>'
          default: return null;
        }
    }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "7%")
      .notSortable()
      .renderWith((data, type, raw) => {
        return raw.closed_at ? null : '<form role="form" class="compile">' + 
          '<a title="Fechar caixa" class="text-danger" ng-click="vm.closeCashier(' + raw.id + ')">' +
            '[Fechar caixa]' + 
          '</a>' + 
        '</form>'
      })
  ]
}

CashiersCtrl.prototype.closeCashier = function (cashier_id) {
  this.SweetAlert.swal({
    title: "Fechar caixa",
    text: "Você está pagando essa conta, confirma essa operação?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Sim, fechar caixa!",
    cancelButtonText: "Não, cancelar!",
    closeOnConfirm: false,
    closeOnCancel: false 
  }, (confirmed) => confirmed ? 
      this.cashierFactory.update({ 
        id: cashier_id, 
        status: 'closed',
        closed_at: moment().toDate()
      }, (res) => {
        this.SweetAlert.swal("Pronto!", "Caixa fechado", "success")
        this.dtInstance.dataTable.fnDraw()
      }, ({ data: { errors } }) => {
        this.SweetAlert.swal("Atenção!", errors, "error")
      })
    : this.SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error")
  )
}

CashiersCtrl.prototype.selectPeriod = function (index) {
  this.date_start = this.periods[index].range[0].toDate()
  this.date_end = this.periods[index].range[1].toDate()
  this.refresh()
}

CashiersCtrl.prototype.refresh = function () {
  this.dtInstance.dataTable.fnDraw()
}

angular.module('sistemizedental').controller("CashiersCtrl", CashiersCtrl)
