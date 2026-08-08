/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
OrdersCtrl.$inject = ['$scope', '$rootScope', '$compile', '$filter',  '$uibModal', 'deviceDetector', 'Transaction', 'PaymentMethod', 'Cashier', 'Order', 'SweetAlert', 'DTOptionsBuilder', 'DTColumnBuilder'];
function OrdersCtrl($scope, $rootScope, $compile, $filter,  $uibModal, deviceDetector, Transaction, PaymentMethod, Cashier, Order, SweetAlert, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;
  
  /** 
   * TODO creates an factory to load and to keep values into angular 
   * @see http://jsfiddle.net/HEdJF/
   */
  const cashier_data = angular.fromJson(localStorage.getItem('acc_data') || '')['cashier'] || {
    id: null,
    credit_card: 0.00,
    debit_card: 0.00,
    check: 0.00,
    money: 0.00,
    total: 0.00,
  };
  this.cashier = new Cashier({
    ...cashier_data
  })
  this.cashouts = []
  this.$scope = $scope
  this.SweetAlert = SweetAlert
  this.$uibModal = $uibModal
  this.orderFactory = Order
  this.popoverPaymentMethods = null
  this.payment_methods = []
  this.total_payments = []
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
    cacheLimitsTable = { 'commands': 5 };
  } else if (!cacheLimitsTable['commands']) {
    cacheLimitsTable['commands'] = 5;
  }

  var cacheDataRanges = JSON.parse(sessionStorage.getItem('cache--dataranges'));
  if (!cacheDataRanges) {
    cacheDataRanges = { 'commands': { 'start_date': moment().toDate(), 'end_date': moment().toDate() } };
  } else if (!cacheDataRanges['commands']) {
    cacheDataRanges['commands'] = { 'start_date': moment().toDate(), 'end_date': moment().toDate() };
  }

  this.date_start = moment(cacheDataRanges['commands']['start_date']).toDate();
  this.date_end = moment(cacheDataRanges['commands']['end_date']).toDate();

  this.dtInstance = {};
  this.dtOptions  = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    cacheLimitsTable['commands'] = limit;
    sessionStorage.setItem('cache--limits_table', JSON.stringify(cacheLimitsTable));

    Order.query({
      draw,
      page,
      offset,
      limit,
      order: [orderColumn, orderBy].join('-'),
      date_start: moment(this.date_start).format("YYYY-MM-DD"),
      date_end: moment(this.date_end).format("YYYY-MM-DD"),
      cashier_id: this.cashier.id,
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

    PaymentMethod.getStatement((res) => {
      this.calcPaymentMethods(res.count ? res.rows: [])
    }, ({ data }) => {
      console.log(data.error)
    })

    Transaction.query({
      status: 'cashout'
    }, (res) => {
      res.count ? this.cashouts.splice(0, this.cashouts.length, ...res) : null
    }, (reason) => {
      console.log(reason)
    })
  })
  this.dtOptions.withDataProp('data');
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('order', [[ 0, "desc" ]]);
  this.dtOptions.withOption('responsive', deviceDetector.isMobile());
  this.dtOptions.withOption('lengthMenu', [5, 10, 25, 50, 75, 100, 200, 500]);
  this.dtOptions.withDOM("<rt><'container-fluid'<'row'<'col-sm-3'l><'col-sm-9'p>>>");
  this.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withDisplayLength(cacheLimitsTable['commands']);
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
    DTColumnBuilder.newColumn('reference_date')
      .withTitle("Data")
      .withOption('width', "7%")
      .renderWith((data, type, raw) => (d = moment(data)).isValid() ? d.format("DD/MM/YYYY") : null),
    DTColumnBuilder.newColumn('appointment_id')
      .withTitle("Consulta")
      .withOption('width', "7%")
      .renderWith(function(data, type, raw) {

        return data ? '<span class="compile text-underline"><a ui-sref="app.medical_history({ id: ' + data + '})">Abrir</a></span>' : "--";
    }),
    DTColumnBuilder.newColumn('client_id')
      .withTitle("Paciente")
      .renderWith((data, type, raw) => {
        const client = raw.client || {}
        return `<span class="compile text-underline">
          <a ui-sref="app.patients.edit({ id: '${data}' })">${client.full_name}</a>
        </span>`
      }
      ),
    DTColumnBuilder.newColumn('total_amount')
      .withTitle("Valor da Comanda")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => {
        var filtered = $filter('currency')(data, 'R$ ', 2)
        if (data > 0) {
          return `<span class="text-success">${filtered}</span>`
        } else if (data < 0) {
          return `<span class="text-danger">${filtered}</span>`
        } else {
          return `<span>${filtered}</span>`
        }
      }),
    DTColumnBuilder.newColumn('discount')
      .withTitle("Desconto")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var filtered = $filter('currency')(data * -1, 'R$ ', 2)
        if (data > 0) {
          return `<span class="text-danger">${filtered}</span>`
        } else {
          return `<span>${filtered}</span>`
        }
    }),
    DTColumnBuilder.newColumn('total_pay')
      .withTitle("Total á Pagar")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var filtered = $filter('currency')(data, 'R$ ', 2);
        if (data > 0) {
          return `<span class="text-success">${filtered}</span>`
        } else if (data < 0) {
          return `<span class="text-danger">${filtered}</span>`
        } else {
          return `<span>${filtered}</span>`
        }
    }),
    DTColumnBuilder.newColumn('transactions')
      .withTitle("Pagamentos")
      .withOption('width', "10%")
      .notSortable()
      .renderWith(function(data, type, raw) {
        if (data && Array.isArray(data) && data.length) {
          return '<span class="compile"><a href="" ng-click="vm.popoverOpen(\'' + btoa(JSON.stringify(data)) + '\')" class="text-underline" uib-popover-template="\'commands_payment_methods.html\'" popover-trigger="\'outsideClick\'" popover-placement="top" popover-title="Formas de Pagamento">Visualizar</a></span>';
        } else {
          return "--";
        }
    }),
    DTColumnBuilder.newColumn('closed')
      .withTitle("Status")
      .withOption('width', "7%")
      .renderWith(function(data, type, raw) {
        switch(data) {
          case false: return '<span class="text-success">Aberta</span>';
          case true: return '<span class="text-danger">Fechada</spanstrong>';
          default: return null;
        }
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "10%")
      .notSortable()
      .renderWith((data, type, raw) => {
        return '<form role="form" class="compile">' + 
          '<a class="text-info" ng-click="vm.editOrder(' + raw.id + ')">' + 
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a class="text-danger" ng-click="vm.removeOrder(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>'
      }),
  ]
}

OrdersCtrl.prototype.editOrder = function(order_id) {
  this.$scope.$emit('$modalOrder', {
    id: order_id
  });
}

OrdersCtrl.prototype.popoverOpen = function(baseHash) {
  this.popoverPaymentMethods = JSON.parse(atob(baseHash))
}

OrdersCtrl.prototype.openCashier = function() {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    size: 'md',
    templateUrl: 'modal_cashier.view.html',
    controller: 'ModalCashierInstanceCtrl',
    controllerAs: 'vm'
  }).result.then((cashier) => {
    const account = angular.fromJson(localStorage.getItem('acc_data')) || {}
    account.cashier = { ...cashier }
    localStorage.setItem('acc_data', JSON.stringify(account))

    // Atualiza a tabela
    window.location.reload();
  }, (rejection) => {
    console.log(rejection)
  });
}

OrdersCtrl.prototype.closeCashier = function() {
  this.SweetAlert.swal({
    title: "Você tem certeza?",
    text: "Você deseja realmente fechar esse caixa?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Sim, fechar caixa!",
    cancelButtonText: "Não, cancelar!",
    closeOnConfirm: false,
    closeOnCancel: false 
  }, (confirmed) => confirmed ? 
      this.cashier.$update().then((result) => {
        this.SweetAlert.swal('Pronto', "Caixa fechado com sucesso", 'success');
        // Atualiza a tabela
        window.location.reload()
      }, ({ data }) => {
        this.SweetAlert.swal('Atenção', data.errors, 'error');
      })
    : this.SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error")
  )
}

OrdersCtrl.prototype.createIncome = function() {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    size: 'md',
    templateUrl: 'modal_supply.view.html',
    controller: 'ModalSupplyInstanceCtrl',
    controllerAs: 'vm'
  }).result.then((result) => {
    // Atualiza a tabela
    this.refresh()
  }, (rejection) => {
    console.log(rejection)
  });
}

OrdersCtrl.prototype.createExpense = function() {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    size: 'md',
    templateUrl: 'modal_cashout.view.html',
    controller: 'ModalCashoutInstanceCtrl',
    controllerAs: 'vm'
  }).result.then((result) => {
    // Atualiza a tabela
    this.refresh()
  }, (rejection) => {
    console.log(rejection)
  });
}

OrdersCtrl.prototype.calcPaymentMethods = function(payment_methods) {
  this.payment_methods.splice(0, this.payment_methods.length, ...payment_methods)
  let income = supply = cashout = expense = total_amount = 0.00

  for (let i = 0; i < this.payment_methods.length; i++) {
    const item = this.payment_methods[i]

    income += Number(item.income)
    supply += Number(item.supply)
    cashout += Number(item.cashout)
    expense += Number(item.expense)
    total_amount += Number(item.total_amount)
  };

  this.total_payments['income'] = income.toFixed(2)
  this.total_payments['supply'] = supply.toFixed(2)
  this.total_payments['cashout'] = cashout.toFixed(2)
  this.total_payments['expense'] = expense.toFixed(2)
  this.total_payments['total_amount'] = total_amount.toFixed(2)
}

OrdersCtrl.prototype.selectPeriod = function(index) {
  var period = this.periods[index];

  this.date_start = period.range[0].toDate();
  this.date_end = period.range[1].toDate();

  cacheDataRanges['commands']['start_date'] = this.date_start;
  cacheDataRanges['commands']['end_date'] = this.date_end;
  sessionStorage.setItem('cache--dataranges', JSON.stringify(cacheDataRanges));

  this.refresh();
}

// Remove um pacientes
OrdersCtrl.prototype.removeOrder = function(order_id) {
  this.SweetAlert.swal({
    title: "Você tem certeza?",
    text: "Você não será capaz de recuperar este registro futuramente!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Sim, deletar registro!",
    cancelButtonText: "Não, cancelar!",
    closeOnConfirm: false,
    closeOnCancel: false 
  }, (confirmed) => confirmed ? 
      this.orderFactory.delete({ id: order_id }, (res) => {
        this.SweetAlert.swal("Deletado!", "Registro deletado com sucesso.", "success")
        this.dtInstance.dataTable.fnDraw()
      }, ({ data: { errors } }) => {
        this.SweetAlert.swal("Atenção!", errors, "error")
      })
    : this.SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error")
  )
}

// Atualiza os dados da tabela
OrdersCtrl.prototype.refresh = function() {
  this.dtInstance.dataTable.fnDraw();
}

angular.module('sistemizedental').controller("OrdersCtrl", OrdersCtrl)
