/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPrescriptionInstanceCtrl.$inject = ['$scope', 'SweetAlert', '$uibModalInstance', "Product", "Prescription", "patient"];
function ModalPrescriptionInstanceCtrl($scope, SweetAlert, $uibModalInstance, Product, Prescription, patient) {
  var vm = this;

  vm.products = Product.query();
  vm.prescription = {
    medicines: [{}],
    email: null,
    annotations: null,
  };
  vm.submit = _submit;

  patient.$promise.then(function(p) {vm.patient = p.data});

  /////////

  function _submit(form) {
    if(form.$valid) {

      post["patient_id"] = vm.patient.id;
      post["email"] = vm.prescription.email;
      post["annotations"] = vm.prescription.annotations;
      
      var post = [];
      for (var i = 0; i < vm.prescription.medicines.length; i++) {
        var item = vm.prescription.medicines[i];
        post["medicines[" + i + "][product_id]"] = item.product_id;
        post["medicines[" + i + "][quantity]"] = item.quantity;
        post["medicines[" + i + "][note]"] = item.note;
      }

      Prescription.save(post, successCallback, failedCallback);

      function successCallback(result) {
        if(result.success) {
          $uibModalInstance.close(result.data);
          SweetAlert.swal('Pronto', "Receita enviada com sucesso", 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }

      function failedCallback() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
      }
    }
  }
}

angular.module('sistemizedental').controller("ModalPrescriptionInstanceCtrl", ModalPrescriptionInstanceCtrl);