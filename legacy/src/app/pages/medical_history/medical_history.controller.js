/**
 * @description
 * Pagina para criação de novos pacientes
 */
MedicalHistoryCtrl.$inject = ['appointment'];
function MedicalHistoryCtrl(appointment) {
  var vm = this

  this.appointment = {
    ...appointment,
    created_at: moment(appointment.created_at).utc().format("DD/MM/YYYY"),
    date_at: moment(appointment.date_at).utc().format("DD/MM/YYYY"),
    start_time: moment(appointment.start_time).utc().format("HH:mm"),
    end_time: moment(appointment.end_time).utc().format("HH:mm")
  }
}

angular.module('sistemizedental').controller("MedicalHistoryCtrl", MedicalHistoryCtrl)
