/**
 * @description
 * Visualização das informações de um paciente
 */
PatientsEditCtrl.$inject = ['$scope', '$rootScope', '$http', '$compile', 'SweetAlert', 'Patient', 'client'];
function PatientsEditCtrl($scope, $rootScope, $http, $compile, SweetAlert, Patient, client) {
  var vm = this;

  vm.client = client;
  vm.genders = [{id: null, name: 'Selecione um sexo'},{id: 'male', name: 'Masculino'},{id: 'female', name: 'Feminino'}];
  vm.submitForm = _submitForm;
  vm.searchAddress = _searchAddress;

  // Fix birtdate
  if (vm.client.birth_date) {
    vm.client.birth_date = moment(vm.client.birth_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
  }

  ///////////

  function _submitForm(isValid) {
    if(isValid) {
      const { birth_date } = vm.client;
      let birthdate = null;
      if (birth_date) {
        const mom_birth_date = moment(birth_date, 'DD/MM/YYYY')
        birthdate = mom_birth_date.isValid() ? mom_birth_date.format('YYYY-MM-DD') : null
      }

      Patient.update({
        id: vm.client.id
      },
      {
        ...vm.client,
        birth_date: birthdate
      }, function(result) {
        SweetAlert.swal('Pronto', 'Informações atualizada com sucesso', 'success');
      }, ({ status, data: { errors }}) => {
        switch (status) {
          case 403: SweetAlert.swal('Sem permissões!', errors, 'error'); break;
          default: SweetAlert.swal('Ops!...', "Ocorreu uma falha inesperada nessa ação. Contate suporte!", 'error'); break;
        }
      });
    }
  }

  function _searchAddress() {
    $http({
      url: '//apps.widenet.com.br/busca-cep/api/' + vm.client.postal_code + '.json',
      method: 'GET',
      headers: {
        withCredentials: false
      }
    }).then(function(config) {
      var response = config.data;

      if(response.status == 1) {
        vm.client.postal_code = response.code;
        vm.client.street_address = response.address;
        vm.client.neighborhood = response.neighborhood;
        vm.client.city = response.city;
        vm.client.state = response.state;
      }
    });
  }
}

angular.module('sistemizedental').controller("PatientsEditCtrl", PatientsEditCtrl);