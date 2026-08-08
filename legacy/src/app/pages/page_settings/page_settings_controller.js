/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
PageSettingsCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', '$uibModal', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder', 'PageRatings'];
function PageSettingsCtrl($scope, $rootScope, $http, $compile, $uibModal, toasty, DTOptionsBuilder, DTColumnBuilder, PageRatings) {
  var vm = this;

  vm.showPageRating   = _showPageRating;
  vm.removePageRating = _removePageRating;
  
  $scope.votes_count = 0;
  $scope.votes       = [];

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions();

  vm.dtOptions.withFnServerData(function(sSource, aoData, fnCallback, oSettings) {
    var orderColumn = aoData[1].value[aoData[2].value[0].column].data;
    var orderBy     = aoData[2].value[0].dir;

    PageRatings.query({
      draw: aoData[0].value,
      offset: aoData[3].value,
      limit: aoData[4].value,
      order: [orderColumn, orderBy].join('-')
    }, function(response) {
      response.recordsTotal     = response.records;
      response.recordsFiltered  = response.records;

      fnCallback(response);
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
  vm.dtOptions.withDOM("<'row'<'col-lg-6'<'#toolbar'>><'col-lg-6 hidden-xs'>>" + 
    "<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  vm.dtOptions.withOption('drawCallback', function(settings) {
    $compile(angular.element("*.compile").contents())($scope);
  });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('id')
      .notVisible(),
    DTColumnBuilder.newColumn('created_at')
      .withTitle("Data")
      .withOption('width', "14%")
      .withClass('vertical-middle')
      .renderWith(function(data, type, raw) {
        var _date = moment(data);
        return _date.isValid() ? _date.format("DD/MM/YYYY HH:mm") : "";
      }),
    DTColumnBuilder.newColumn('patient_name')
      .withTitle("Pessoa")
      .renderWith(function(data, type, raw) {
        return '<div class="compile">' + 
          '<div class="pull-left">' +
            '<ng-letter-avatar data="' + data + '" charCount="2" width="40px" height="40px" fontSize="20px"></ng-letter-avatar>' + 
          '</div>' +
          '<div style="padding-left: 45px">' + 
            '<a href="javascript:void(0);" ng-click="vm.editPatient(' + raw.id + ')">' +
              '<strong>' + data + '</strong>' + 
            '</a>' + 
            '<p class="m-b-xxs">' + raw.patient_phone_number + '</p>' + 
            '<div class="text-wrap-message">' + raw.message + '</div>' + 
          '</div>' +
        '</div>';
      }),
    DTColumnBuilder.newColumn('vote')
      .withTitle("Nota atribuida")
      .withOption('width', "12%")
      .withClass('vertical-middle')
      .renderWith(function(data, type, raw) {
        $scope.votes[$scope.votes_count] = Number(data);

        return '<div class="text-center compile ratings-star">' + 
          '<h4 class="no-s">' + (Number(data) * 1.0) + '</h4>' + 
          '<span uib-rating ng-model="votes[' + ($scope.votes_count++) + ']" read-only="\'true\'" aria-labelledby="default-rating"></span>' + 
        '</div>';
      }),
    DTColumnBuilder.newColumn('status')
      .withTitle("Situação")
      .withOption('width', "12%")
      .withClass('vertical-middle')
      .renderWith(function(data, type, raw) {
        switch(data) {
          case 'pending':
            return '<span class="label label-default">Pendente</span>';
          case 'approved':
            return '<span class="label label-success">Aprovada</span>';
          case 'blocked':
            return '<span class="label label-danger">Bloqueada</span>';
        }
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "10%")
      .withClass('vertical-middle')
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.showPageRating(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>&nbsp;' + 
          '<a href="javascript:void(0);" class="text-danger" ng-click="vm.removePageRating(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _showPageRating(id) {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      keyboard: false,
      animation: true,
      templateUrl: 'page_settings.html',
      controller: 'ModalPageRatingInstanceCtrl',
      controllerAs: 'vm',
      size: 'md',
      resolve: {
        page_rating: ['$q', 'PageRatings', function($q, PageRatings) {
          var defered = $q.defer();

          PageRatings.get({ 
            id: id 
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

          return defered.promise;
        }]
      }
    });

    modalInstance.result.then(function(result) {

      // Atualiza agendamentos
      vm.dtInstance.dataTable.fnDraw();
    });
  }

  // Remove um pacientes
  function _removePageRating(id) {
    PageRatings.delete({ 
      id: id 
    }, function(response) {
      if(response.success) {
        toasty.success({
          title: "Ok", 
          msg: "Serviço removido com sucesso"
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

angular.module('sistemizedental').controller("PageSettingsCtrl", PageSettingsCtrl);