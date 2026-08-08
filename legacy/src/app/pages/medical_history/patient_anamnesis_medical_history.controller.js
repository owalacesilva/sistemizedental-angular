/**
 * @description
 * Pagina para criação de novos pacientes
 */
PatientAnamnesisMedicalHistoryCtrl.$inject = ['SweetAlert', '$stateParams', 'Patient', 'appointment'];
function PatientAnamnesisMedicalHistoryCtrl(SweetAlert, $stateParams, Patient, appointment) {
  var vm = this;
  
  this.anamnesis = {}
  this.submit = _submit

  Patient.getAnamnesis({ id: appointment.client_id }, (res) => {
    this.anamnesis = { ...this.anamnesis, ...res }
  }, () => { })

  function _submit(form) {
    if(form.$valid) {
      Patient.anamnesis({
        id: vm.anamnesis.patient_id
      }, vm.anamnesis, function(result) {
        if(result.success) {
          SweetAlert.swal('Pronto', 'Ficha de anamnese atualizada com sucesso', 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }
}

angular.module('sistemizedental').controller("PatientAnamnesisMedicalHistoryCtrl", PatientAnamnesisMedicalHistoryCtrl);