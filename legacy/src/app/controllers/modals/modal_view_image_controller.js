/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalViewImageInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'photo_url'];
function ModalViewImageInstanceCtrl($scope, $uibModalInstance, photo_url) {
  var vm = this;

  vm.photo_url = photo_url;
}

angular.module('sistemizedental').controller("ModalViewImageInstanceCtrl", ModalViewImageInstanceCtrl);