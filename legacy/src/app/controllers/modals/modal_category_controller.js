/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalCategoryInstanceCtrl.$inject = ['$scope', 'SweetAlert', '$uibModalInstance', 'ProductCategory', 'category'];
function ModalCategoryInstanceCtrl($scope, SweetAlert, $uibModalInstance, ProductCategory, category) {
  var vm = this;

  vm.category = category;
  vm.submit   = _submit;

  /////////

  function _submit(form) {
    if(form.$valid) {
      if( angular.isDefined(vm.category['id']) ) {
        ProductCategory.update({ 
          id: vm.category.id
        }, vm.category, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Categoria atualizada com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      } else {      
        ProductCategory.save(vm.category, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Categoria adicionada com sucesso", 'success');
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

angular.module('sistemizedental').controller("ModalCategoryInstanceCtrl", ModalCategoryInstanceCtrl);