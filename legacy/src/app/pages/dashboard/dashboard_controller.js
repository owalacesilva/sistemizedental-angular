/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
DashboardCtrl.$inject = ['$scope', 'toasty', 'Appointment', 'Patient', 'account'];
function DashboardCtrl($scope, toasty, Appointment, Patient, account) {
  var vm = this;

  this.account = account
  this.patientList = []
  this.appointmentList = []

  Appointment.query({
    limit: 5
  }, (res) => {
    res.count ? this.appointmentList.splice(0, this.appointmentList.length, ...res.rows) : null
  }, ({ data: errors }) => {
    toasty.error({ title: "Atenção", msg: errors })
  })

  Patient.query({
    limit: 5
  }, (res) => {
    res.count ? this.patientList.splice(0, this.patientList.length, ...res.rows) : null
  }, ({ data: errors }) => {
    toasty.error({ title: "Atenção", msg: errors })
  })
}

angular.module('sistemizedental').controller("DashboardCtrl", DashboardCtrl);