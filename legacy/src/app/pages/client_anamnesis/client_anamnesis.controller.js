/**
 * @description
 * Pagina para criação de novos pacientes
 */
ClientAnamnesisCtrl.$inject = ['$stateParams', 'SweetAlert', 'Patient', 'client'];
function ClientAnamnesisCtrl($stateParams, SweetAlert, Patient, client) {
  var vm = this;

  this.anamnesis = {}
  this.client = client
  this.patientFactory = Patient
  this.SweetAlert = SweetAlert
  this.genders = [{id: null, name: 'Selecione um sexo'},{id: 'M', name: 'Masculino'},{id: 'F', name: 'Feminino'}]
  Patient.getAnamnesis({ 
    id: $stateParams.id 
  }, (res) => {
    this.anamnesis = { ...this.anamnesis, ...res }
  }, ({ data: { errors }}) => {
    console.log(errors)
  })
}

ClientAnamnesisCtrl.prototype.onSubmit = function (form) {
  if(form.$valid) {
    this.patientFactory.updateAnamnesis({
      id: this.client.id,
      ...this.anamnesis
    }, (res) => {
      this.SweetAlert.swal('Pronto', 'Paciente adicionado com sucesso', 'success')
    }, ({ data: { errors }}) => {
      this.SweetAlert.swal('Atenção', errors, 'error')
    });
  }
}

angular.module('sistemizedental').controller("ClientAnamnesisCtrl", ClientAnamnesisCtrl);
