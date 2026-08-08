/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
CategoriesCtrl.$inject = ['$scope', '$compile',  '$http', '$uibModal', '$state', 'ProductCategory', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function CategoriesCtrl($scope, $compile,  $http, $uibModal, $state, ProductCategory, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editCategory    = _editCategory;
  vm.removeCategory  = _removeCategory;

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions();

  vm.dtOptions.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    var orderColumn = aoData[1].value[aoData[2].value[0].column].data;
    var orderBy     = aoData[2].value[0].dir;

    ProductCategory.query({
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
    DTColumnBuilder.newColumn('title')
      .withTitle("Categoria")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editCategory(' + raw.id + ')">' +
            '<i class="fa fa-tag fa-fw"></i>' + data +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('type')
      .withTitle("Tipo")
      .renderWith(function(data, type, raw) {
        switch(data) {
          case '1':
            return '<label class="label label-success">Serviços</label>';
          case '2':
            return '<label class="label label-primary">Produtos</label>';
          default:
            return null;
        }
      }),
    DTColumnBuilder.newColumn('description')
      .withTitle("Descrição"),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "14%")
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editCategory(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i> Abrir' + 
          '</a>&nbsp;' + 
          '<a href="javascript:void(0);" class="text-danger" ng-click="vm.removeCategory(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i> Excluir' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _removeCategory(category_id) {
    ProductCategory.delete({ 
      id: category_id 
    }, function(response) {
      if(response.success) {
        toasty.success({title: "Pronto", msg: "Categoria removida com sucesso"});
        // Atualiza agendamentos
        vm.dtInstance.dataTable.fnDraw();
      } else {
        toasty.error({title: "Atenção", msg: response.error});
      }
    }, function() {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
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
            ProductCategory.get({ 
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
            });
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
}

angular.module('sistemizedental').controller("CategoriesCtrl", CategoriesCtrl);