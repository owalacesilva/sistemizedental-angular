/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
ServicesListCtrl.$inject = ['$scope',  '$compile', '$location', '$http', '$filter', '$uibModal', 'Product', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function ServicesListCtrl($scope,  $compile, $location, $http, $filter, $uibModal, Product, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editService    = _editService;
  vm.editCategory   = _editCategory;
  vm.remove  = _remove;

  $scope.selected = function() {
  	if($.fn.dataTable) {
   		$.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  	}
  }

  vm.dtInstance  = [];
  vm.dtOptions   = DTOptionsBuilder.newOptions()
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
      kind: "service",
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
      .withTitle("Serviço")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editService(' + raw.id + ')">' +
            '<i class="fa fa-clipboard fa-fw"></i> <strong>' + data + '</strong>' + 
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('category_id')
      .withTitle("Categoria do serviços")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editCategory(' + raw.category_id + ')">' +
            '<i class="fa fa-product-hunt fa-fw"></i> ' + (raw.category ? raw.category.title : null) + 
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('amount')
      .withTitle("Custo do serviço")
      .withOption('width', "15%")
      .renderWith(function(data, type, raw) {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('duration_time')
      .withTitle("Tempo")
      .withOption('width', "9%")
      .renderWith(function(data, type, raw) {
        return data;
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editService(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>&nbsp;' + 
          '<a href="javascript:void(0);" class="text-danger" ng-click="vm.remove(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editService(service_id) {
    $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_service.view.html',
      controller: 'ModalServiceInstanceCtrl',
      controllerAs: 'vm',
      size: 'lg',
      resolve: { service: service_id ? Product.get({ id: service_id }) : null }
    }).result.then(function modalServiceSuccess(result) {
      // Atualiza a tabela
      vm.dtInstance.dataTable.fnDraw();
    }, function modalServiceFailure(rejection) {
      console.log(rejection)
    });
  }

  // Abrea a edição de um paciente
  function _editCategory(category_id) {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_category.html',
      controller: 'ModalCategoryInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        category: ['$q', 'ProductCategory', function($q, ProductCategory) {
          var defered = $q.defer();

          if( angular.isDefined(category_id) ) {
            defered.resolve([]);
            /*ProductCategory.get({ 
              id: category_id 
            }, function(response) {
              if(response.success) {
                defered.resolve(response.data);
              } else {
                toasty.error({title: "Atenção", msg: response.error});
                defered.reject();
              }
            }, function() {
              toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
              defered.reject();
            });*/
          } else {
            defered.resolve(null);
          }

          return defered.promise;
        }]
      }
    });

    modalInstance.result.then(function(result) {

      // Atualiza agendamentos
      vm.dtInstance.dataTable.fnDraw();
    });
  }

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
}

angular.module('sistemizedental').controller("ServicesListCtrl", ServicesListCtrl);