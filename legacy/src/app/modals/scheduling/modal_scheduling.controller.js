import { prototype } from "events";

/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalSchedulingInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'SweetAlert', 'Appointment', 'calEvent'];
function ModalSchedulingInstanceCtrl($scope, $uibModalInstance, SweetAlert, Appointment, calEvent) {
  var vm = this;

  this.calendar_event = calEvent
  this.appointment = new Appointment({ ...calEvent.raw })
  this.SweetAlert = SweetAlert
  this.Appointment = Appointment
  this.$uibModalInstance = $uibModalInstance 

  const date_at_formatted = moment(vm.appointment.date_at).format('YYYY-MM-DD')
  const start_time_formatted = moment(vm.appointment.start_time).format('HH:mm')  
  this.formatted_date = moment(`${date_at_formatted} ${start_time_formatted}`).calendar()
}

ModalSchedulingInstanceCtrl.prototype.arrive = function() {
  if(this.appointment.service_id) {
    this.SweetAlert.swal({
      title: "Atenção",
      text: "Desejá criar uma comanda para essa appointmenta?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      closeOnConfirm: true,
      closeOnCancel: true 
    }, this.arriveConfirm);
  } else {
    this.arriveConfirm(false);
  }
}

ModalSchedulingInstanceCtrl.prototype.arriveConfirm = function(hasOrder) {
  this.appointment.id = this.calendar_event.cid
  this.appointment.status = 'confirmed' 
  this.appointment.command = hasOrder ? 1 : 0

  this.appointment.$updateStatus(({ order_id }) => {
    this.$uibModalInstance.close({ 
      status: 'confirmed', 
      order_id
    })
  }, ({ data: { errors } }) => {
    this.SweetAlert.swal('Atenção', errors, 'error')
  })
}

ModalSchedulingInstanceCtrl.prototype.missing = function() {
  this.Appointment.updateStatus({
    id: this.calendar_event.cid,
    account_id: this.calendar_event.raw.account_id,
    status: 'missed'
  }, () => {
    this.$uibModalInstance.close({ status: "missed" });
  }, () => {
    this.SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  });
}

ModalSchedulingInstanceCtrl.prototype.edit = function() {
  this.$uibModalInstance.close({ status: "edit" });
}

ModalSchedulingInstanceCtrl.prototype.cancel = function() {
  this.Appointment.updateStatus({
    id: this.calendar_event.cid,
    account_id: this.calendar_event.raw.account_id,
    status: 'canceled'
  }, () => {
    this.$uibModalInstance.close({ status: "canceled" });
  }, () => {
    this.SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  });
}

ModalSchedulingInstanceCtrl.prototype.remove = function() {
  this.Appointment.updateStatus({
    id: this.calendar_event.cid,
    account_id: this.calendar_event.raw.account_id,
    status: 'deleted'
  }, () => {
    this.$uibModalInstance.close({ status: "deleted" });
  }, () => {
    this.SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  });
}

ModalSchedulingInstanceCtrl.prototype.open = function() {
  this.$uibModalInstance.close({ status: "open" });
}

ModalSchedulingInstanceCtrl.prototype.finish = function() {
  this.Appointment.updateStatus({
    id: this.calendar_event.cid,
    account_id: this.calendar_event.raw.account_id,
    status: 'finished'
  }, (result) => {
    this.$uibModalInstance.close({ status: "finished" });
  }, () => {
    this.SweetAlert.swal('Atenção', 'Ocorreu uma falha na comunicação com o serviço', 'error');
  });
}

ModalSchedulingInstanceCtrl.prototype.prescription = function() {
  this.$uibModalInstance.close({ status: "prescription" });
}

angular.module('sistemizedental').controller("ModalSchedulingInstanceCtrl", ModalSchedulingInstanceCtrl)
