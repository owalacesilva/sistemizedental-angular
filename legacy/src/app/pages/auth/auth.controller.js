/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
AuthCtrl.$inject = ["$scope", "$window", "$location", '$rootScope', '$http', 'SweetAlert'];
function AuthCtrl($scope, $window, $location, $rootScope, $http, SweetAlert) {
  var vm = this;

  vm.email = 'demo@sistemizedental.com';
  vm.password = 'sis12345'; 
  vm.submit = _submit;
  vm.pwdVisible = false;

  ////////////

  function _submit(isValid) {
    if (isValid) {
      $http.get('api/accounts/token.json', {}, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${vm.email}:${vm.password}`)
        }
      }).then(({ status, data }) => {
        if (status == 201 || status == 200) {
          const { token, account } = data
          localStorage.setItem('acc_token', token)
          localStorage.setItem('acc_data', JSON.stringify(account))
          
          sessionStorage.removeItem('account_id_selected')
          sessionStorage.removeItem('account_list_cached')
          $location.path("/calendar")
        } else {
          const { errors } = data
          const msg = (errs) => Array.isArray(errs) ? errs.join(' ') : errs
          SweetAlert.swal("Atenção", msg(errors), "error")
        }
      }, () => {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }
}

angular.module('sistemizedental').controller("AuthCtrl", AuthCtrl);