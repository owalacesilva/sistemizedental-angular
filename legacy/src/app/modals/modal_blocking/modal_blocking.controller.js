/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalBlockingInstanceCtrl.$inject = ["$scope", "$uibModalInstance"]
function ModalBlockingInstanceCtrl($scope, $uibModalInstance) {
  var vm = this

  this.$uibModalInstance = $uibModalInstance
}

ModalBlockingInstanceCtrl.prototype.onLogout = function () {
  this.$uibModalInstance.close()
}

angular.module('sistemizedental').controller("ModalBlockingInstanceCtrl", ModalBlockingInstanceCtrl)