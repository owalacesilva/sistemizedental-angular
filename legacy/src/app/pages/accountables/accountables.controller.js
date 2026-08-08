/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
AccountablesCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$filter', '$uibModal', 'SweetAlert', 'Accountable', 'Transaction', 'deviceDetector', 'DTOptionsBuilder', 'DTColumnBuilder'];
function AccountablesCtrl($scope, $rootScope, $http, $compile, $filter, $uibModal, SweetAlert, Accountable, Transaction, deviceDetector, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  this.kind = null

  this.modalAccountsPayable = _modalAccountsPayable;
  this.refresh = _refresh;
  this.deleteTransaction = _delete;

  var cacheLimitsTable = JSON.parse(sessionStorage.getItem('cache--limits_table'));
  if (!cacheLimitsTable) {
    cacheLimitsTable = { 'accountables': 5 };
  } else if (!cacheLimitsTable['accountables']) {
    cacheLimitsTable['accountables'] = 5;
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

    cacheLimitsTable['accountables'] = limit;
    sessionStorage.setItem('cache--limits_table', JSON.stringify(cacheLimitsTable));

    Accountable.query({
      draw,
      page,
      offset,
      limit,
      kind: this.kind, 
      order: [orderColumn, orderBy].join('-'),
      accounts: 1
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
  this.dtOptions.withDisplayLength(cacheLimitsTable['accountables']);
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
      .withTitle("Criado em")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _date = moment(data, "YYYY-MM-DD");

        return _date.isValid() ? _date.format("DD/MM/YYYY") : null;
    }),
    DTColumnBuilder.newColumn('kind')
      .withTitle("Tipo")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => {
        switch (data) {
          case "income": return '<span class="text-success">À Receber</span>'
          case "expense": return '<span class="text-danger">À Pagar</span>'
          default: return "";
        }
      }),
    DTColumnBuilder.newColumn('title')
      .withTitle("Nome")
      .renderWith((data, type, raw) => data),
    DTColumnBuilder.newColumn('category')
      .withTitle("Categoria")
      .renderWith((data, type, raw) => raw.category ? raw.category.title : null),
    DTColumnBuilder.newColumn('cost')
      .withTitle("Valor")
      .withOption('width', "12%")
      .renderWith((data, type, raw) => {
        const cost = $filter('currency')((data * -1), 'R$ ', 2)
        return `<strong>${cost}</strong>`
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "7%")
      .notSortable()
      .renderWith(function(data, type, raw) {
        return '<form role="form" class="compile">' + 
          '<a title="Editar conta" ng-click="vm.modalAccountsPayable(0, ' + raw.id + ')">' + 
            '[Editar]' + 
          '</a>&nbsp;' + 
          '<a title="Deletar conta" class="text-danger" ng-click="vm.deleteTransaction(' + raw.id + ')">' +
            '[Deletar]' + 
          '</a>' + 
        '</form>';
    }),
  ];

  //////

  function _modalAccountsPayable(type, accountable_id) {
    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      size: 'md',
      templateUrl: 'modal_accountable.view.html',
      controller: 'ModalAccountableInstanceCtrl',
      controllerAs: 'vm',
      resolve: { type, accountable_id }
    }).result.then((result) => {
      // Atualiza a tabela
      this.dtInstance.dataTable.fnDraw();
    }, (rejection) => {
      console.log(rejection)
    });
  }

  function _delete(accountable_id) {
    SweetAlert.swal({
      title: "Apagar conta",
      text: "Essa operação apagará apenas as proximas cobranças dessa conta, as cobranças passadas permaneceram no seu historico\nDeseja continuar essa ação?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Sim, deletar registro!",
      cancelButtonText: "Não, cancelar!",
      closeOnConfirm: false,
      closeOnCancel: false 
    }, (confirmed) => confirmed ? 
        Accountable.delete({ id: accountable_id }, (res) => {
          SweetAlert.swal("Deletado!", "Registro deletado com sucesso.", "success")
          this.dtInstance.dataTable.fnDraw()
        }, ({ data: { errors } }) => {
          SweetAlert.swal("Atenção!", errors, "error")
        })
      : SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error")
    )
  }

  // Atualiza os dados da tabela
  function _refresh() {
    this.dtInstance.dataTable.fnDraw();
  }
}

angular.module('sistemizedental').controller("AccountablesCtrl", AccountablesCtrl);