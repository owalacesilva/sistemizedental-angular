/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
ServicesPromotionsCtrl.$inject = ['$scope',  '$compile', '$state', '$http', '$filter', '$uibModal', 'toasty', 'Promotion', 'DTOptionsBuilder', 'DTColumnBuilder'];
function ServicesPromotionsCtrl($scope,  $compile, $state, $http, $filter, $uibModal, toasty, Promotion, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editPromotion    = _editPromotion;
  vm.removePromotion  = _removePromotion;

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions();

  vm.dtOptions.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    var orderColumn = aoData[1].value[aoData[2].value[0].column].data;
    var orderBy     = aoData[2].value[0].dir;

    Promotion.query({
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
      .withTitle("Título da Promoção")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editPromotion(' + raw.id + ')">' +
            '<i class="fa fa-user fa-fw"></i>' + data +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('service_title')
      .withTitle("Serviço")
      .renderWith(function(data, type, raw) {
        return data ? '<span class="compile">' + 
          '<a href="javascript:void(0);" ui-sref="services.edit({ id: ' + raw.service_id + ' })">' +
            '<i class="fa fa-user fa-fw"></i>' + data +  
          '</a>' + 
        '</span>' : null;
      }),
    DTColumnBuilder.newColumn('discount_price')
      .withTitle("Preço sem desconto")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        return $filter('currency')(raw.service_price, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('percentage_price')
      .withTitle("% Desconto")
      .withOption('width', "9%"),
    DTColumnBuilder.newColumn('discount_price')
      .withTitle("Preço com desconto")
      .withOption('width', "12%")
      .renderWith(function(data, type, raw) {
        return $filter('currency')(data, 'R$ ', 2);
      }),
    DTColumnBuilder.newColumn('initial_date')
      .withTitle("Data de inicio")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _date = moment(data);
        return _date.isValid() ? _date.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('final_date')
      .withTitle("Data de término")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        var _date = moment(data);
        return _date.isValid() ? _date.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "8%")
      .withOption('sortable', false)
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editPromotion(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a href="javascript:void(0);" class="text-danger" ng-click="vm.removePromotion(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editPromotion(promotion_id) {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'modal_promotion.html',
      controller: 'ModalPromotionInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        promotion: ['$q', 'Promotion', function($q, Promotion) {
          var defered = $q.defer();

          if( angular.isDefined(promotion_id) ) {
            Promotion.get({ 
              id: promotion_id 
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

      // Atualiza a tabela
      vm.dtInstance.dataTable.fnDraw();
    });
  }

  // Remove um pacientes
  function _removePromotion(id) {
    Promotion.delete({ 
      id: id 
    }, function(response) {
      if(response.success) {
        toasty.success({
          title: "Ok", 
          msg: "Promoção removido com sucesso"
        });

        vm.dtInstance.dataTable.fnDraw();
      } else {
        toasty.error({title: "Atenção", msg: response.error});
      }
    }, function() {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
    });
  }
}

angular.module('sistemizedental').controller("ServicesPromotionsCtrl", ServicesPromotionsCtrl);