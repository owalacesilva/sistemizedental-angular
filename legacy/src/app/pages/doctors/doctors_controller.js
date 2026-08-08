/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
DoctorsCtrl.$inject = ['$scope', '$compile',  '$http', '$state', 'Doctor', 'DoctorsCache', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function DoctorsCtrl($scope, $compile,  $http, $state, Doctor, DoctorsCache, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  vm.editDoctor    = _editDoctor;
  vm.activeDoctor  = _activeDoctor;

  vm.dtInstance = {};
  vm.dtOptions  = DTOptionsBuilder.newOptions()
  vm.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    Doctor.query({
      draw,
      page,
      offset,
      limit,
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
  vm.dtOptions.withDOM("<'row'<'col-lg-6'<'#toolbar'>><'col-lg-6 hidden-xs'>>" + 
    "<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  vm.dtOptions.withOption('drawCallback', function(settings) {
    var _   = angular.element("div#toolbar");
    var __  = angular.element("*.compile");

    _.html('<form class="form">' + 
      '<button type="button" class="btn btn-primary" ng-click="vm.editDoctor()">' + 
        'Cadastrar Dentista' + 
      '</button>' + 
    '</form>');

    $compile(_.contents())($scope);
    $compile(__.contents())($scope);
  });

  vm.dtColumns = [
    DTColumnBuilder.newColumn('full_name')
      .withTitle("Dentista")
      .renderWith(function(data, type, raw) {
        return '<span class="compile">' + 
          '<a href="javascript:void(0);" ng-click="vm.editDoctor(' + raw.id + ')">' +
            '<i class="fa fa-user fa-fw"></i>' + data +  
          '</a>' + 
        '</span>';
      }),
    DTColumnBuilder.newColumn('email')
      .withTitle("E-mail"),
    DTColumnBuilder.newColumn('phone_number')
      .withTitle("Telefone")
      .withOption('width', "12%"),
    DTColumnBuilder.newColumn('birth_date')
      .withTitle("Aniversário")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => {
        if (data != null) {
          const birth_date = moment(data);
          return birth_date.isValid() ? birth_date.format("DD/MM") : null;
        } else {
          return null;
        }
      }),
    DTColumnBuilder.newColumn('blocked')
      .withTitle("Situação")
      .withOption('width', "10%")
      .renderWith((data, type, raw) => {
        return data ? '<span class="label label-danger">Bloqueado</span>' : 
          '<span class="label label-success">Ativo</span>';
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ativo")
      .withOption('width', "10%")
      .notVisible()
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<div class="btn-group btn-group-xs" data-toggle="buttons">' + 
            '<label class="btn btn-default ' + (raw.blocked ? 'active' : '') + '" ng-click="vm.activeDoctor(' + raw.id + ',1)">' + 
              '<input type="radio" name="options" id="option2" autocomplete="off"> Sim' + 
            '</label>' + 
            '<label class="btn btn-default ' + (raw.blocked ? 'active' : '') + '" ng-click="vm.activeDoctor(' + raw.id + ',0)">' + 
              '<input type="radio" name="options" id="option3" autocomplete="off"> Não' + 
            '</label>' + 
          '</div>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editDoctor(id) {
    if(angular.isUndefined(id)) {
      $state.go('app.doctors.create');
    } else {
      $state.go('app.doctors.edition', { 
        id: id
      });
    }
  }

  // Remove um pacientes
  function _activeDoctor(id, active) {
    Doctor.active({ 
      id: id, 
    }, { active: active }, function(response) {
      if(response.success) {
        toasty.success({
          title: "Ok", 
          msg: "Dentista atualizado com sucesso"
        });

        DoctorsCache.updateCache();

        vm.dtInstance.dataTable.fnDraw();
      } else {
        toasty.error({title: "Atenção", msg: response.error});
        vm.dtInstance.dataTable.fnDraw();
      }
    }, function() {
      toasty.error({title: "Atenção", msg: "Ocorreu uma falha de comunicação com o serviço"});
      vm.dtInstance.dataTable.fnDraw();
    });
  }
}

angular.module('sistemizedental').controller("DoctorsCtrl", DoctorsCtrl);