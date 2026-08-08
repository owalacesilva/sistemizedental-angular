/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
ShopSettingsCtrl.$inject = ['$scope', '$compile',  '$http', '$uibModal', '$state', '$filter', 'DoctorsCache', 'ProductCategory', 'Product', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function ShopSettingsCtrl($scope, $compile,  $http, $uibModal, $state, $filter, DoctorsCache, ProductCategory, Product, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editProduct   = _editProduct;
  vm.remove = _remove;

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions()
  vm.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    Product.query({
      draw,
      page,
      offset,
      limit,
      kind: "goods",
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
    DTColumnBuilder.newColumn('title')
      .withTitle("Produto")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editProduct(' + raw.id + ')">' +
            '<i class="fa fa-product-hunt fa-fw"></i>' + data +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('category_id')
      .withTitle("Categoria")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);">' +
            '<i class="fa fa-product-hunt fa-fw"></i> ' + (raw.category ? raw.category.title : null) + 
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('price')
      .withTitle("Preço de revenda")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('amount')
      .withTitle("Preço de custo")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('quantity')
      .withTitle("Quantidade")
      .withOption('width', "9%")
      .renderWith(function(data, type, raw) {
        return "coming soon";
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a class="text-info" ng-click="vm.editProduct(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>&nbsp;' + 
          '<a class="text-danger" ng-click="vm.remove(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _remove(id) {
    Product.delete({ 
      id: id 
    }, () => {
      toasty.success({ title: "Ok", msg: "Serviço removido com sucesso" })
      vm.dtInstance.dataTable.fnDraw()
    }, () => {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"})
    })
  }

  // Abrea a edição de um paciente
  function _editProduct(product_id) {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_product.view.html',
      controller: 'ModalProductInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: { product: product_id ? Product.get({ id: product_id }) : null }
    });

    modalInstance.result.then(function(result) {

      // Atualiza a tabela
      vm.dtInstance.dataTable.fnDraw();
    });
  }
}

angular.module('sistemizedental').controller("ShopSettingsCtrl", ShopSettingsCtrl);