/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
TransactionsCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$filter', 'SweetAlert', 'deviceDetector', 'Transaction', 'DTOptionsBuilder', 'DTColumnBuilder'];
function TransactionsCtrl($scope, $rootScope, $http, $compile, $filter, SweetAlert, deviceDetector, Transaction, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  this.date_start = moment().subtract(1, 'weeks').toDate();
  this.date_end = moment().toDate();
  this.type = null
  this.paid = null
  this.editOrder = _editOrder;
  this.pay = _pay;
  this.refresh = _refresh;
  this.selectPeriod = _selectPeriod;
  this.periods = [
    { label: 'Hoje', range: [moment(), moment()] },
    { label: 'Ontem', range: [moment().subtract(1, 'days'), moment().subtract(1, 'days')] },
    { label: 'Últimos 7 dias', range: [moment().subtract(6, 'days'), moment()] },
    { label: 'Últimos 30 dias', range: [moment().subtract(29, 'days'), moment()] },
    { label: 'Este mês', range: [moment().startOf('month'), moment().endOf('month')] },
    { label: 'Mês passado', range: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
    { label: 'Próximo mês', range: [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')] },
  ];

  var cacheLimitsTable = JSON.parse(sessionStorage.getItem('cache--limits_table'));
  if (!cacheLimitsTable) {
    cacheLimitsTable = { 'transactions': 5 };
  } else if (!cacheLimitsTable['transactions']) {
    cacheLimitsTable['transactions'] = 5;
  }

  this.dtInstance = {};
  this.dtOptions  = DTOptionsBuilder.newOptions();
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    cacheLimitsTable['transactions'] = limit;
    sessionStorage.setItem('cache--limits_table', JSON.stringify(cacheLimitsTable));

    Transaction.query({
      draw,
      page,
      offset,
      limit,
      type: this.type, 
      paid: this.paid,
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
      });
    });
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
  this.dtOptions.withDisplayLength(cacheLimitsTable['transactions']);
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

  this.dtColumns  = [   
    DTColumnBuilder.newColumn('due_date')
      .withTitle("Vencimento")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _date = moment(data, "YYYY-MM-DD");

        return _date.isValid() ? _date.format("DD/MM/YYYY") : null;
    }),
    /*DTColumnBuilder.newColumn('appointment_id')
      .withTitle("Appointmenta")
      .withOption('width', "7%")
      .renderWith(function(data, type, raw) {

        return data ? '<strong class="compile text-underline"><a ui-sref="appointment({ id: ' + data + '})">Abrir</a></strong>' : "--";
    }),*/
    DTColumnBuilder.newColumn('cashier_id')
      .withTitle("Caixa")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {

        return data ? '<a class="text-underline">' + data + '</a>' : "--";
    }),
    DTColumnBuilder.newColumn('order_id')
      .withTitle("Comanda")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {

        return data ? '<span class="compile"><a class="text-underline" ng-click="vm.editOrder(' + data + ')">Abrir</a></span>' : "--";
    }),
    DTColumnBuilder.newColumn('kind')
      .withTitle("Tipo")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => {
        switch (data) {
          case "income": return '<span class="text-success">Receita</span>';
          case "expense": return '<span class="text-danger">Despesa</span>';
          case "cashout": return '<span class="text-danger">Sangria</span>';
          case "supply": return '<span class="text-success">Suprimento</span>';
          default: return "";
        }
      }),
    DTColumnBuilder.newColumn('description')
      .withTitle("Descrição"),
    DTColumnBuilder.newColumn('payment_method_id')
      .withTitle("Pagamento")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => raw.payment_method ? raw.payment_method.title : null),
    DTColumnBuilder.newColumn('total_amount')
      .withTitle("Valor")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => {
        const value = parseFloat(raw.total_amount)
        if (value < 0) {
          return `<strong class="text-danger">${$filter('currency')(value, 'R$ ', 2)}</strong>`
        } else {
          return `<strong class="text-success">${$filter('currency')(data, 'R$ ', 2)}</strong>`
        }
      }),
    DTColumnBuilder.newColumn('paid')
      .withTitle("Status")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => raw.paid ? '<strong class="text-success">PAGO</strong>'
        : '<span class="compile"><a class="text-underline text-danger" ng-click="vm.pay(' + raw.id + ')">[FALTA PAGAR]</a></span>'),
  ];

  function _pay(transaction_id) {
    SweetAlert.swal({
      title: "Pagar conta",
      text: "Você está pagando essa conta, confirma essa operação?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Sim, pagar conta!",
      cancelButtonText: "Não, cancelar!",
      closeOnConfirm: false,
      closeOnCancel: false 
    }, (confirmed) => confirmed ? 
        Transaction.update({ 
          id: transaction_id, 
          paid: true,
          paid_at: moment().toDate()
        }, (res) => {
          SweetAlert.swal("Pronto!", "Conta paga com sucesso", "success")
          vm.dtInstance.dataTable.fnDraw()
        }, ({ data: { errors } }) => {
          SweetAlert.swal("Atenção!", errors, "error")
        })
      : SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error")
    )
  }

  function _editOrder(command_id) {
    $scope.$emit('$modalOrder', {
      id: command_id
    });
  }

  function _selectPeriod(index) {
    var period = vm.periods[index];

    vm.date_start = period.range[0].toDate();
    vm.date_end = period.range[1].toDate();

    _refresh();
  }

  // Atualiza os dados da tabela
  function _refresh() {
    vm.dtInstance.dataTable.fnDraw();
  }
}

angular.module('sistemizedental').controller("TransactionsCtrl", TransactionsCtrl);