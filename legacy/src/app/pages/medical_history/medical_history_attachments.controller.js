/**
 * @description
 * Pagina para criação de novos pacientes
 */
MedicalHistoryAttachmentsCtrl.$inject = ['$scope', '$uibModal', 'SweetAlert', 'MedicalProcedure', 'Upload', 'appointment']
function MedicalHistoryAttachmentsCtrl($scope, $uibModal, SweetAlert, MedicalProcedure, Upload, appointment) {
  var vm = this
  
  this.$uibModal = $uibModal
  this.SweetAlert = SweetAlert
  this.appointment = appointment
  this.procedures = appointment.medical_procedures.map((item) => {
    return new MedicalProcedure({
      appointment_id: this.appointment.id, 
      ...item
    })
  })

  this.addProcedure = () => {
    const procedure = new MedicalProcedure({
      appointment_id: this.appointment.id, 
      picture_left: undefined,
      picture_right: undefined,
      title: undefined,
      annotation: undefined
    })
    this.procedures.unshift(procedure)
  }

  this.saveProcedure = (procedure) => {
    /*procedure.$save(() => {
      this.SweetAlert.swal('Pronto', 'Procedimento salvo com sucesso', 'success')
    }, ({ data: { errors } }) => {
      this.SweetAlert.swal('Atenção', errors, 'error')
    })*/
    Upload.upload({
      url: 'api/medical_procedures',
      method: 'POST',
      data: { 
        appointment_id: procedure.appointment_id, 
        picture_left: procedure.picture_left,
        picture_right: procedure.picture_right,
        title: procedure.title,
        annotation: procedure.annotation
      }
    }).then(({ data: { id, picture_left_url, picture_right_url } }) => {
      procedure.id = id
      procedure.picture_left = picture_left_url
      procedure.picture_right = picture_right_url
    }, ({ data: { errors } }) => {
      SweetAlert.swal('Atenção', errors, 'error')
    }, evt => {
      // do something
    })
  }
}

MedicalHistoryAttachmentsCtrl.prototype.addPictureLeft = function(procedure, $file) {
  procedure.picture_left = $file
}

MedicalHistoryAttachmentsCtrl.prototype.addPictureRight = function(procedure, $file) {
  procedure.picture_right = $file
}

MedicalHistoryAttachmentsCtrl.prototype.removeProcedure = function(procedure) {
  const delete_fn = () => {
    const index_of = this.procedures.indexOf(procedure)
    if (index_of > -1) this.procedures.splice(index_of, 1)
  }

  if (procedure.id) {
    procedure.$delete(() => {
      delete_fn()
    }, ({ data: { errors } }) => {
      this.SweetAlert.swal('Atenção', errors, 'error')
    })
  } else {
    delete_fn()
  }
}

MedicalHistoryAttachmentsCtrl.prototype.seeProcedure = function(appointment) {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    size: 'lg',
    templateUrl: 'modal_view_appointment.html',
    controller: 'ModalViewAppointmentInstanceCtrl',
    controllerAs: 'vm',
    resolve: { appointment }
  });
}

angular.module('sistemizedental').controller("MedicalHistoryAttachmentsCtrl", MedicalHistoryAttachmentsCtrl)
