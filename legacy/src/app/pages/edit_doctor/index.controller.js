/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
EditDoctorCtrl.$inject = ['$scope', 'doctor', '$stateParams']
function EditDoctorCtrl($scope, doctor, $stateParams) {
  var vm = this;

  this.active = $stateParams.tab || 0
}

angular.module('sistemizedental').controller("EditDoctorCtrl", EditDoctorCtrl)