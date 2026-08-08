/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalCampaignInstanceCtrl.$inject = ['$scope', 'SweetAlert',  '$uibModalInstance', '$state', '$http', 'Campaign', 'campaign'];
function ModalCampaignInstanceCtrl($scope, SweetAlert,  $uibModalInstance, $state, $http, Campaign, campaign) {
  var vm = this;

  vm.campaign = campaign;
  vm.submit   = _submit;

  /////////

  function _submit(form) {
    if(form.$valid) {
      if( angular.isDefined(vm.campaign['id']) ) {
        Campaign.update({ 
          id: vm.campaign.id
        }, {
          title: vm.campaign.title,
          score: vm.campaign.score,
          opened: vm.campaign.opened,
          date_initial: moment(vm.campaign.date_initial).format('YYYY-MM-DD'),
          date_final: moment(vm.campaign.date_final).format('YYYY-MM-DD')
        }, function(result) {
          if(result.success) {
            $uibModalInstance.close();
            SweetAlert.swal('Pronto', "Campanha atualizado com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      } else {      
        Campaign.save({
          title: vm.campaign.title,
          score: vm.campaign.score,
          date_initial: moment(vm.campaign.date_initial).format('YYYY-MM-DD'),
          date_final: moment(vm.campaign.date_final).format('YYYY-MM-DD')
        }, function(result) {
          if(result.success) {
            $uibModalInstance.close();
            SweetAlert.swal('Pronto', "Campanha criada com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      }
    }
  }
}

angular.module('sistemizedental').controller("ModalCampaignInstanceCtrl", ModalCampaignInstanceCtrl);