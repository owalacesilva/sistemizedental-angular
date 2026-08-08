/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
ShopProductsCtrl.$inject = ['$scope', '$compile',  '$http', 'API_SERVER', '$state', '$filter', 'SweetAlert', 'ShopProductCategory', 'ShopProduct', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function ShopProductsCtrl($scope, $compile,  $http, API_SERVER, $state, $filter, SweetAlert, ShopProductCategory, ShopProduct, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  this.dtInstance = {};
  this.dtOptions = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    ShopProduct.query({
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
  this.dtOptions.withOption('responsive', true);
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withDOM("<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  this.dtOptions.withOption('drawCallback', (settings) => {
    $compile(angular.element("*.compile").contents())($scope);
  });

  this.dtColumns = [
    DTColumnBuilder.newColumn('title')
      .withTitle("Produto")
      .renderWith((data, type, raw) =>
        `<span class="compile">
          <a href="javascript:void(0);" ng-click="vm.editShopProduct('${raw.id}')">
            ${data}
          </a>
        </span>`
      ),
    DTColumnBuilder.newColumn('price')
      .withTitle("Preço")
      .withOption('width', "12%")
      .renderWith((data, type, raw) => {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('discount_price')
      .withTitle("Preço com %")
      .withOption('width', "12%")
      .renderWith((data, type, raw) => {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('quantity')
      .withTitle("Quantidade")
      .withOption('width', "9%")
      .renderWith((data, type, raw) => {
        return data;
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "12%")
      .renderWith((data, type, raw) => 
        `<form class="form compile">
          <a class="text-info" ng-click="vm.openShopProduct('${raw.permalink}')">
            <i class="fa fa-shopping-cart fa-lg fa-fw"></i>
          </a>&nbsp;
          <a class="text-info" ng-click="vm.editShopProduct('${raw.id}')">
            <i class="fa fa-pencil-square-o fa-lg fa-fw"></i>
          </a>&nbsp;
          <a class="text-danger" ng-click="vm.remove('${raw.id}')">
            <i class="fa fa-trash fa-lg fa-fw"></i>
          </a>
        </form>`
      ),
  ];

  // Abrea a edição de um paciente
  this.remove = (id) => {
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
    }, (isConfirm) => { 
      if (isConfirm) {
        ShopProduct.delete({ 
          id: id 
        }, () => {
          SweetAlert.swal("Deletado!", "Registro deletado com sucesso.", "success");
          this.dtInstance.dataTable.fnDraw()
        }, ({ data: errors }) => {
          SweetAlert.swal("Atenção!", errors, "error")
        })
      } else {
        SweetAlert.swal("Cancelado!", "Seu registro está seguro :)", "error");
      }
    })
  }

  // Abrea a edição de um paciente
  this.openShopProduct = (permalink) => {
    const win = window.open(`${API_SERVER}mp/${permalink}`, '_blank')
    win.focus()
  }

  // Abrea a edição de um paciente
  this.editShopProduct = (shop_product_id) => {
    $state.go('app.marketplace.edit_product', {
      id: shop_product_id
    })
  }
}

angular.module('sistemizedental').controller("ShopProductsCtrl", ShopProductsCtrl);