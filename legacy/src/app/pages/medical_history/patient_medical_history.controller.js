/**
 * @description
 * Pagina para criação de novos pacientes
 */
PatientMedicalHistoryCtrl.$inject = ['SweetAlert', '$stateParams', 'PostalCode', 'Patient', 'appointment']
function PatientMedicalHistoryCtrl(SweetAlert, $stateParams, PostalCode, Patient, appointment) {
  var vm = this;
  
  this.patient = {}
  this.submit = _submit
  this.searchAddress  = _searchAddress

  Patient.get({ id: appointment.client_id }, (res) => {
    this.patient = { ...this.patient, ...res }
  }, () => { })

  function _submit(form) {
    if(form.$isValid) {
      Patient.update({
        id: this.patient.id
      }, this.patient, function(result) {
        if(result.success) {
          SweetAlert.swal('Pronto', 'Informações atualizada com sucesso', 'success');
        } else {
          SweetAlert.swal('Atenção', result.errors, 'error');
        }
      }, function() {
        SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
      });
    }
  }

  function _searchAddress() {
    PostalCode.get(this.patient.postal_code, function(response) {
      if(response.status == 1) {
        this.patient.postal_code    = response.code;
        this.patient.street_address = response.address;
        this.patient.district       = response.district;
        this.patient.city           = response.city;
        this.patient.state          = response.state;
      }
    });
  }
}

angular.module('sistemizedental').controller("PatientMedicalHistoryCtrl", PatientMedicalHistoryCtrl);