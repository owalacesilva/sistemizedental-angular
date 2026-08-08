/**
 * @description
 * Lista todos os pacientes que agendaram um serviço
 * com a clinica desse conta.
 */
ClientsCtrl.$inject = ['$scope',  '$compile', '$state', '$http', 'Patient', 'SweetAlert', 'toasty', 'DTOptionsBuilder', 'DTColumnBuilder'];
function ClientsCtrl($scope,  $compile, $state, $http, Patient, SweetAlert, toasty, DTOptionsBuilder, DTColumnBuilder) {
  var vm = this;

  this.search         = "";
  this.type           = "first_name";
  this.editPatient    = _editPatient;
  this.removePatient  = _removePatient;
  this.filter         = _filter;

  this.dtInstance = {};
  this.dtOptions  = DTOptionsBuilder.newOptions()
  this.dtOptions.withFnServerData((sSource, aoData, fnCallback, oSettings) => {
    const orderColumn = aoData[1].value[aoData[2].value[0].column].data
    const draw = aoData[0].value
    const orderBy = aoData[2].value[0].dir
    const limit = aoData[4].value
    const offset = aoData[3].value
    const page = (offset / limit) + 1

    Patient.query({
      draw,
      page,
      offset,
      limit,
      order: [orderColumn, orderBy].join('-'),
      type: this.type,
      search: this.search
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
  this.dtOptions.withOption('responsive', true);
  this.dtOptions.withOption('processing', true);
  this.dtOptions.withOption('ordering', true);
  this.dtOptions.withOption('serverSide', true);
  this.dtOptions.withPaginationType('full_numbers');
  this.dtOptions.withDOM("<'row'<'col-lg-6'<'#toolbar'>><'col-lg-6 hidden-xs'>>" + 
    "<'row'<'col-lg-12'tr>>" + 
    "<'row'<'col-lg-4'l><'col-lg-8'p>>");

  this.dtOptions.withOption('drawCallback', function(settings) {
    var _   = angular.element("div#toolbar");
    var __  = angular.element("*.compile");

    _.html('<form class="form">' + 
      '<button type="button" class="btn btn-primary" ng-click="vm.editPatient()">' + 
        'Cadastra paciente' + 
      '</button>' + 
    '</form>');

    $compile(_.contents())($scope);
    $compile(__.contents())($scope);
  });

  this.dtColumns = [
    DTColumnBuilder.newColumn('full_name')
      .withTitle("Nome do Paciente")
      .renderWith(function(data, type, raw) {
        return '<div class="compile">' + 
          '<div class="pull-left">' +
            '<ng-letter-avatar data="' + data + '" charCount="2" width="40px" height="40px" fontSize="20px"></ng-letter-avatar>' + 
          '</div>' +
          '<div style="padding-left: 45px">' + 
            '<a href="javascript:void(0);" ng-click="vm.editPatient(' + raw.id + ')">' +
              '<strong>' + data + '</strong>' + 
            '</a><br>' + 
            '<span>' + raw.phone_number + '</span>' + 
          '</div>' +
        '</div>';
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Região")
      .withOption('width', "15%")
      .renderWith((data, type, raw) => {
        let html = new String();
        if (raw.neighborhood != null) 
          html += `${raw.neighborhood}</br>`
        if (raw.city != null) {
          html += `${raw.city}`
          if (raw.state != null)
            html += ` - ${raw.state}`
        } else {
          if (raw.state != null)
            html += `${raw.state}`
        }

        return html;
      }),
    DTColumnBuilder.newColumn('birth_date')
      .withTitle("Aniversário")
      .withOption('width', "9%")
      .renderWith(function(data, type, raw) {
        const birth_date = moment(data);
        return birth_date.isValid() ? birth_date.format("DD/MM") : null;
      }),
    DTColumnBuilder.newColumn('status')
      .withTitle("Situação")
      .withOption('width', "10%")
      .renderWith(function(data, type, raw) {
        return '<span class="label label-success">Ativo</span>';
      }),
    DTColumnBuilder.newColumn('id')
      .withTitle("Ações")
      .withOption('width', "13%")
      .withOption('sortable', false)
      .renderWith(function(data, type, raw) {
        return '<form class="form compile">' + 
          '<a href="javascript:void(0);" class="text-info" ng-click="vm.editPatient(' + raw.id + ')">' +
            '<i class="fa fa-pencil-square-o fa-lg fa-fw"></i>' + 
          '</a>' + 
          '<a href="javascript:void(0);" class="text-danger" ng-click="vm.removePatient(' + raw.id + ')">' +
            '<i class="fa fa-trash fa-lg fa-fw"></i>' + 
          '</a>' + 
        '</form>';
      }),
  ];

  // Abrea a edição de um paciente
  function _editPatient(id) {
    if(angular.isUndefined(id)) {
      $state.go('app.patients.create');
    } else {
      $state.go('app.patients.edit', { 
        id: id
      });
    }
  }

  // Remove um pacientes
  function _removePatient(id) {
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
        Patient.delete({ 
          id: id 
        }, function(response) {
          if(response.success) {
            SweetAlert.swal("Deletado!", "Registro deletado com sucesso.", "success");
            this.dtInstance.dataTable.fnDraw();
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

  function _filter() {
    this.dtInstance.dataTable.fnDraw();
  }
}

angular.module('sistemizedental').controller("ClientsCtrl", ClientsCtrl);