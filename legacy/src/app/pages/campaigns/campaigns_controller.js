/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
CampaignsCtrl.$inject = ['$scope',  '$compile', '$state', '$http', '$filter', '$uibModal', 'Campaign', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function CampaignsCtrl($scope,  $compile, $state, $http, $filter, $uibModal, Campaign, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editCampaign    = _editCampaign;
  vm.removeCampaign  = _removeCampaign;

  vm.dtInstance = null;
  vm.dtOptions  = DTOptionsBuilder.newOptions();

  vm.dtOptions.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    var orderColumn = aoData[1].value[aoData[2].value[0].column].data;
    var orderBy     = aoData[2].value[0].dir;

    Campaign.query({
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
      .withTitle("Campanha")
      .renderWith(function(data, type, raw) {
        return '<i class="fa fa-flag fa-fw"></i> <strong>' + data + '</strong>';
      }),
    DTColumnBuilder.newColumn('opened')
      .withTitle("Situação")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        switch( Number(data) ) {
          case 0:
            return '<span class="label label-default">Fechada</span>';
          case 1:
            return '<span class="label label-success">Aberta</span>';
        }
      }),
    DTColumnBuilder.newColumn('score')
      .withTitle("Pontuação")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        return data + " Pontos";
      }),
    DTColumnBuilder.newColumn('date_initial')
      .withTitle("Data Inicio")
      .withOption('width', "18%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data);
        return end_at.isValid() ? end_at.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('date_final')
      .withTitle("Data Termino")
      .withOption('width', "18%")
      .renderWith(function(data, type, raw) {
        var end_at = moment(data);
        return end_at.isValid() ? end_at.format("DD/MM/YYYY") : "";
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "8%")
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editCampaign(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editCampaign(campaign_id) {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      template: 'modal_campaign.html',
      controller: 'ModalCampaignInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        campaign: ['$q', 'Campaign', function($q, Campaign) {
          var defered = $q.defer();

          if(campaign_id) {          
            Campaign.get({
              id: campaign_id
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
            return $q.resolve();
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
  function _removeCampaign(id) {
    Campaign.delete({ 
      id: id 
    }, function(response) {
      if(response.success) {
        toasty.success({
          title: "Ok", 
          msg: "Campanha deletada com sucesso"
        });

        vm.dtInstance[0].dataTable.fnDraw();
      } else {
        toasty.error({title: "Atenção", msg: response.error});
      }
    }, function() {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
    });
  }
}

angular.module('sistemizedental').controller("CampaignsCtrl", CampaignsCtrl);