/**
 * @description
 * Pagina para criação de novos pacientes
 */
PatientsCreateCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', 'SweetAlert', 'Patient'];
function PatientsCreateCtrl($scope, $rootScope, $http, $location, SweetAlert, Patient) {
  var vm = this;

  vm.client = {
    state: null
  };
  vm.genders = [{id: null, name: 'Selecione um sexo'},{id: 'male', name: 'Masculino'},{id: 'female', name: 'Feminino'}];
  vm.submit = _submit;
  vm.searchAddress = _searchAddress;

  /**
   * Submete o formulario para o servidor
   * ====================================
   */
  function _submit(isValid) {
    if(isValid) {
      const { birth_date } = vm.client;
      if (birth_date) {
        const mom_birth_date = moment(birth_date, 'DD/MM/YYYY')
        vm.client.birth_date = mom_birth_date.isValid() ? mom_birth_date.format('YYYY-MM-DD') : null
      }

      Patient.save(vm.client, function(result) {
        if(result['created_at']) {
          SweetAlert.swal('Pronto', 'Paciente adicionado com sucesso', 'success');
          $location.path('/patients');
        } else {
          SweetAlert.swal('Atenção', result['error'], 'error');
        }
      }, function(result) {
        SweetAlert.swal('Atenção', result.data.error || 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }

  /**
   * Busca o endereço baseado no CEP digitado
   * ========================================
   */
  function _searchAddress() {
    $http({
      url: '//apps.widenet.com.br/busca-cep/api/' + vm.client.postal_code + '.json',
      method: 'GET'
    }).then(function searchAddressSuccess(config) {
      var response = config.data;

      if(response.status == 1) {
        vm.client.postal_code    = response.code;
        vm.client.street_address = response.address;
        vm.client.district       = response.district;
        vm.client.city           = response.city;
        vm.client.state          = response.state;
      }
    }, function searchAddressFailure(rejection) {
      vm.client.postal_code = null
      console.log(rejection)
    });
  }
}

angular.module('sistemizedental').controller("PatientsCreateCtrl", PatientsCreateCtrl);