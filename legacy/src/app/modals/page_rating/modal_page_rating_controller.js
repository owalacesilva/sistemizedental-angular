/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPageRatingInstanceCtrl.$inject = ['$scope', 'SweetAlert',  '$uibModalInstance', 'PageRatings', 'page_rating'];
function ModalPageRatingInstanceCtrl($scope, SweetAlert,  $uibModalInstance, PageRatings, page_rating) {
  var vm = this;

  vm.page_rating = page_rating;
  vm.submit      = _submit;

  /////////

  function _submit(form) {
    if(form.$valid) {
      PageRatings.update({ 
        id: vm.page_rating.id
      }, {
        status: vm.page_rating.status,
      }, function(result) {
        if(result.success) {
          $uibModalInstance.close();
          SweetAlert.swal('Pronto', "Avaliação atualizado com sucesso", 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
      });
    }
  }
}

angular.module('sistemizedental').controller("ModalPageRatingInstanceCtrl", ModalPageRatingInstanceCtrl);