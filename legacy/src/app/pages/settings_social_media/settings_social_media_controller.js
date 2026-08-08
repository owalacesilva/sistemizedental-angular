/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
SettingsSocialMediaCtrl.$inject = ['SweetAlert', 'Account'];
function SettingsSocialMediaCtrl(SweetAlert, Account) {
  var vm = this;

  vm.account = angular.fromJson(localStorage.getItem('acc_data')) || {};
  vm.links = []
  vm.submit = _submit;

  vm.account.links.map((i) => vm.links[`${i.label}`] = i.source_url)

  function _submit(is_valid) {
    if(is_valid) {
      var params = []
      for (let key in vm.links) {
        params.push({
          label: key,
          source_url: vm.links[key]
        })
      }
      
      Account.updateLinks({ 
        links: params 
      }, (res) => {
        localStorage.setItem('acc_data', JSON.stringify(res))
        SweetAlert.swal({
          title: 'Pronto',
          text: 'Dados atualizados com sucesso',
          type: 'success'
        }, () => window.location.reload())
      }, () => 
        SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha na comunicação com o serviço'), 'error')
      );
    }
  }
}

angular.module('sistemizedental').controller("SettingsSocialMediaCtrl", SettingsSocialMediaCtrl);