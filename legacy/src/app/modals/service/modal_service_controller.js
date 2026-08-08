/**
 * @description
 * Visualização das informações de um paciente
 */
ModalServiceInstanceCtrl.$inject = ['$scope', '$rootScope', '$http', 'SweetAlert', 'Product', '$uibModalInstance', 'ProductCategory', 'service'];
function ModalServiceInstanceCtrl($scope, $rootScope, $http, SweetAlert, Product, $uibModalInstance, ProductCategory, service) {
  var vm = this;

  vm.service = service || new Product({ kind: "service"})
  vm.toggle_category = false;
  vm.categories = [];
  vm.durations  = durationTimes(5);
  vm.submit = _submit;

  ProductCategory.query((r) => 
    (r.rows || []).map((i) => vm.categories.push(i))
  , (e) => console.log(e))

  /////////

  function _submit(form) {
    if(form.$valid) {
      if (!vm.service.category_id) {
        vm.service.category_attributes = { ...vm.service.category }
      }

      if( angular.isDefined(vm.service['id']) ) {
        Product.update({ 
          id: vm.service.id,
          kind: "service"
        }, vm.service, function(result) {
          if(result.error) {
            SweetAlert.swal('Atenção', result.errors, 'error');
          } else {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Serviço atualizado com sucesso", 'success');
          }
        }, function (catched) {
          SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha de comunicação com o serviço'), 'error')
        });
      } else {      
        Product.save(vm.service, function(result) {
          if(result.error) {
            SweetAlert.swal('Atenção', result.errors, 'error');
          } else {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Serviço adicionado com sucesso", 'success');
          }
        }, function (catched) {
          SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha de comunicação com o serviço'), 'error')
        });
      }
    }
  }

  /**
   * Função que cria uma lista de intervalos
   * 
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  function durationTimes(interval) {
    var times = [];
    var start = interval;

    while(start <= 720) {
      var value   = "";
      var hours   = parseInt(start / 60);
      var minutes = parseInt(start - (hours * 60));

      if (hours == 1) {
        value = "1 hora";
      } else if (hours > 1) {
        value = hours + " horas";
      }

      value += (hours > 0 && minutes > 0) ? " e " : "";

      if (minutes > 0) {
        value += minutes + " minutos";
      }

      times.push({ id: start, value: value });
      start = start + interval;
    }

    return times;
  }
}

angular.module('sistemizedental').controller("ModalServiceInstanceCtrl", ModalServiceInstanceCtrl);