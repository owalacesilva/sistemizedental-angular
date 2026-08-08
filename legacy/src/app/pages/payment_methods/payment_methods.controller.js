/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
PaymentMethodsCtrl.$inject = ['$scope', '$compile',  '$http', '$uibModal', '$state', '$filter', 'SweetAlert', 'DoctorsCache', 'PaymentMethod', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function PaymentMethodsCtrl($scope, $compile,  $http, $uibModal, $state, $filter, SweetAlert, DoctorsCache, PaymentMethod, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editPayment = _editPayment;
  vm.removePayment = _removePayment;

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions();

  vm.dtOptions.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    var orderColumn = aoData[1].value[aoData[2].value[0].column].data;
    var orderBy     = aoData[2].value[0].dir;

    PaymentMethod.query({
      draw: aoData[0].value,
      offset: aoData[3].value,
      limit: aoData[4].value,
      order: [orderColumn, orderBy].join('-')
    }, function(response) {
      var count = response['count'] || 0;
      var rows = response['rows'] || [];

      fnCallback({
        draw: response['draw'] || 1,
        data: rows,
        recordsTotal: count,
        recordsFiltered: rows.length
      });
    }, function(reason) {
      fnCallback({
        draw: 0,
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
      });
    });
  });
  vm.dtOptions.withOption('responsive', true);
  vm.dtOptions.withOption('processing', true);
  vm.dtOptions.withOption('ordering', true);
  vm.dtOptions.withOption('serverSide', true);
  vm.dtOptions.withPaginationType('full_numbers');
  vm.dtOptions.withDOM("<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  vm.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('id')
      .notVisible(),
    DTColumnBuilder.newColumn('title')
      .withTitle("Forma de Pagamento"),
    DTColumnBuilder.newColumn('fee')
      .withTitle("Taxa Operadora")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => 
        Number(data) > 0 ? `${data}%` : "Sem taxa"
      ),
      DTColumnBuilder.newColumn('release_deadline')
      .withTitle("Carência")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => 
        Number(data) > 0 ? `${data} dias` : "À Vista"
      ),
    DTColumnBuilder.newColumn('has_installments')
      .withTitle("Parcelavel")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => data == '1' ? 'Sim' : 'Não'),
    DTColumnBuilder.newColumn('blocked')
      .withTitle("Status")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => data ? '<span class="label label-danger">Inativo</span>' 
        : '<span class="label label-success">Ativo</span>'),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "10%")
      .notSortable()
      .renderWith(function(data, type, raw) {

        return '<form role="form" class="compile">' + 
          '<a class="text-info" ng-click="vm.editPayment(' + raw.id + ')">' + 
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a class="text-danger" ng-click="vm.removePayment(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editPayment(payment_id) {
    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_payment_method.view.html',
      controller: 'ModalPaymentMethodInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: { payment_id }
    }).result.then(function modalPaymentMethodSuccess(result) {
      // Atualiza a tabela
      vm.dtInstance.dataTable.fnDraw();
    }, function modalPaymentMethodFailure(rejection) {
      console.log(rejection)
    });
  }

  // Remove um pacientes
  function _removePayment(payment_id) {
    SweetAlert.swal({
      title: "Você tem certeza?",
      text: "Você não será capaz de recuperar este registro futuramente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Sim, deletar registro!",
      cancelButtonText: "Não, cancelar!",
      closeOnConfirm: false,
      closeOnCancel: false 
    }, function(isConfirm){ 
      if(isConfirm) {
        PaymentMethod.delete({ 
          id: payment_id 
        }, function(response) {
          if(response.success) {
            SweetAlert.swal("Deletado!", "Registro deletado com sucesso.", "success");
            vm.dtInstance.dataTable.fnDraw();
          } else {
            SweetAlert.swal("Atenção!", response.errors, "error");
          }
        }, function() {
          SweetAlert.swal("Atenção!", "Ocorreu uma falha de comunicação com o serviço", "error");
        });
      } else {
        SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error");
      }
    });
  }
}

angular.module('sistemizedental').controller("PaymentMethodsCtrl", PaymentMethodsCtrl);