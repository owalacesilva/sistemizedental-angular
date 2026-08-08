/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalProductInstanceCtrl.$inject = ['$scope', 'SweetAlert', '$uibModalInstance', 'Product', 'ProductCategory', 'product'];
function ModalProductInstanceCtrl($scope, SweetAlert, $uibModalInstance, Product, ProductCategory, product) {
  var vm = this;

  vm.toggle_category = false;
  vm.product = product || new Product({ 
    kind: 'goods',
    price: 0,
    amount: 0
  })
  vm.categories = [];
  vm.submit = _submit;

  ProductCategory.query((r) => 
    (r.rows || []).map((i) => vm.categories.push(i))
  , (e) => console.log(e))

  /////////

  function _submit(form) {
    if(form.$valid) {
      if (!vm.product.category_id) {
        vm.product.category_attributes = { ...vm.product.category }
      }

      if( angular.isDefined(vm.product['id']) ) {
        Product.update({ 
          id: vm.product.id,
          kind: "goods"
        }, vm.product, function(result) {
          if(result.error) {
            SweetAlert.swal('Atenção', result.errors, 'error');
          } else {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Produto atualizado com sucesso", 'success');
          }
        }, function(catched) {
          SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha de comunicação com o serviço'), 'error');
        });
      } else {      
        Product.save(vm.product, function(result) {
          if(result.error) {
            SweetAlert.swal('Atenção', result.errors, 'error');
          } else {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Produto adicionado com sucesso", 'success');
          }
        }, function(catched) {
          SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha de comunicação com o serviço'), 'error');
        });
      }
    }
  }
}

angular.module('sistemizedental').controller("ModalProductInstanceCtrl", ModalProductInstanceCtrl);