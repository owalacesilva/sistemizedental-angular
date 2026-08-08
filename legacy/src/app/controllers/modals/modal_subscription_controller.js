/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalSubscriptionInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$http', 'SweetAlert', 'close'];
function ModalSubscriptionInstanceCtrl($scope, $uibModalInstance, $http, SweetAlert, close) {
  var vm = this;

  vm.base          = 39.90;
  vm.price         = 39.90;
  vm.billing_cycle = null;
  vm.picpay_value  = null;
  vm.picpay_code   = null;
  vm.close         = close;
  vm.billingCycle  = _billingCycle;
  vm.process       = _process;

  ///////

  function _billingCycle() {
    switch(vm.billing_cycle) {
      case '3':
        vm.price = (vm.base - ((vm.base * 10) / 100));
        break;
      case '6':
        vm.price = (vm.base - ((vm.base * 20) / 100));
        break;
      case '12':
        vm.price = (vm.base - ((vm.base * 30) / 100));
        break;
      default:
        vm.price = vm.base;
        break;
    }
  }

  function _process(method) {
    $http.post("/signature", {
      payment_method: method,
      billing_cycle: vm.billing_cycle,
      picpay_value: vm.picpay_value,
      picpay_code: vm.picpay_code
    }, {
      headers: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      transformRequest: function (data, headersGetter) {
        var str = [];
        for (var d in data) {
          if(typeof data[d] != 'function' && data[d] != null) {
            str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
          }
        }
        
        return str.join("&");
      }
    }).then(function(config) {
      var response = config.data;

      if(response.success) {
        switch(method) {
          case 1:
            window.location.href = response.checkout_url || '/';
            break;
          case 2:
            window.location.reload();
            break;
        }
      } else {
        SweetAlert.swal('Atenção', response.errors, 'error');
      }
    }, function() {
      SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
    });
  }
}

angular.module('sistemizedental').controller("ModalSubscriptionInstanceCtrl", ModalSubscriptionInstanceCtrl);