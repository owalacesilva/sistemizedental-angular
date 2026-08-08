(function() {
angular
  .module('sistemizedental')
  .controller("ApplicationCtrl", ApplicationCtrl);

/**
 * @description
 * Pagina para criação de novos pacientes
 */
ApplicationCtrl.$inject = ['$scope', '$rootScope', '$window', "$location", '$timeout', '$uibModal', 'deviceDetector', "account"]
function ApplicationCtrl($scope, $rootScope, $window, $location, $timeout, $uibModal, deviceDetector, account) {
  var vm = this

  this.$rootScope = $rootScope
  this.$window = $window
  this.$location = $location
  this.$timeout = $timeout
  this.$uibModal = $uibModal

  this.account = account
  const { avatar_url, banner_url, subscriptions = [], plans = [] } = this.account
  this.$rootScope.avatar_url = avatar_url
  this.$rootScope.banner_url = banner_url

  // Find the first subscription with available or trialing
  if (this.account && subscriptions.filter((f) => f.status === 'available' || f.status === 'trialing').length) {
    const { status, trial_start, trial_end } = subscriptions[0]
    const remaining_days = moment(trial_end, 'YYYY-MM-DD').diff(moment(), 'days')

    this.$rootScope.sbs = {
      [status]: true,
      trial_start: trial_start, 
      trial_end: trial_end, 
      remaining_days: remaining_days
    }
  } else {
    this.$rootScope.sbs = {}
    this.modal_blocking_promise = $timeout(() => this.openModalBlocking(), 5 * 1000 /* 1 minute */)
  }

  if (plans.length) {
    this.$rootScope.plan = plans[0]
  }

  // if(TRIALEXPIRED == true) {
  //   _modalSubscription('static', false, false);
  // }

  $scope.currentStep = 10;
  angular.element(".modal-auto").on("hidden.bs.modal", function() {
    if(!deviceDetector.isMobile()) {
      setTimeout(function() {
        // load cookie, or start new tour
        $scope.$apply(function() {
          $scope.currentStep = 0;
        });
      }, 500);
    }
  });

  $scope.tourEnded = function() {
    //angular.element(".modal-auto").modal('show');
  }

  $scope.tourComplete = function() {
    //angular.element(".modal-auto").modal('show');
  }

  //////

  // Modo Offline
  $rootScope.$on("$serverError", function() {
    onModoOffline();
  });

  // Eventos gerais da aplicação
  $rootScope.$on("$modalOrder", (event, args) => {
    this.modalOrder(args ? args.id : null)
  })
}

/**
 * Modal para apresentação e upgrade de novos planos
 */
ApplicationCtrl.prototype.getResource = function(resource) {
  /*if (this.$rootScope.sbs.trialing) return true;
  switch (this.$rootScope.plan['nickname']) {
    case 'free':
      return ['schedule', 'appointments', 'clients', 'products', 'doctors', 'settings'].indexOf(resource) > -1;
    case 'basic':
      return ['schedule', 'appointments', 'clients', 'products', 'doctors', 'settings'].indexOf(resource) > -1;
    case 'premium':
      return ['schedule', 'appointments', 'clients', 'orders', 'transactions', 'products', 'doctors', 'settings'].indexOf(resource) > -1;
  }*/
  return true;
}

/**
 * Modal para apresentação e upgrade de novos planos
 */
ApplicationCtrl.prototype.openModalBlocking = function() {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    templateUrl: 'modal_blocking.view.html',
    controller: 'ModalBlockingInstanceCtrl',
    controllerAs: 'vm',
    size: 'lg'
  }).result.then((result) => {
    this.$timeout.cancel(this.modal_blocking_promise)
    this.doLogout()
  }, (rejection) => {
    this.$timeout.cancel(this.modal_blocking_promise)
    this.doLogout()
  })
}

/**
 * Modal para apresentação e upgrade de novos planos
 */
ApplicationCtrl.prototype.modalPlans = function() {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    templateUrl: 'modal_plans.html',
    controller: 'ModalPlansInstanceCtrl',
    controllerAs: 'vm',
    size: 'lg'
  }).result.then(function modalPlansSuccess(result) {
    // Atualiza agendamentos
  }, function modalPlansFailure(rejection) {
    console.log(rejection)
  });
}

/**
 * Modal para apresentação e upgrade de novos planos
 */
ApplicationCtrl.prototype.modalSubscription = function(backdrop, keyboard, close) {
  this.$uibModal.open({
    backdrop: backdrop,
    keyboard: keyboard,
    animation: true,
    templateUrl: 'modal_subscription.html',
    controller: 'ModalSubscriptionInstanceCtrl',
    controllerAs: 'vm',
    windowClass: 'modal-subscription',
    size: 'lg',
    resolve: { close: () => close }
  }).result.then(() => {
    // Atualiza agendamentos
  }, (rejection) => console.log(rejection))
}

/**
 * Modal para apresentação e upgrade de novos planos
 */
ApplicationCtrl.prototype.modalOfflineMode = function() {
  this.$uibModal.open({
    backdrop: true,
    keyboard: true,
    animation: true,
    templateUrl: 'modal_offline_mode.html',
    controller: 'ModalOfflineModeInstanceCtrl',
    controllerAs: 'vm',
    windowClass: 'modal-subscription',
    size: 'md'
  });
}

/**
 * Listener para invocação
 */
ApplicationCtrl.prototype.modalOrder = function(order_id) {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    templateUrl: 'modal_order.view.html',
    controller: 'ModalOrderInstanceCtrl',
    controllerAs: 'vm',
    windowClass: 'modal-command',
    resolve: { order_id }
  }).result.then((result) => {
    window.location.reload();
  }, (rejection) => console.log(rejection))
}

/**
 * 
 */
ApplicationCtrl.prototype.modalAppointment = function(event, args) {
  this.$uibModal.open({
    backdrop: 'static',
    keyboard: false,
    animation: true,
    templateUrl: 'modal_appointment.view.html',
    controller: 'ModalAppointmentInstanceCtrl',
    controllerAs: 'vm',
    size: 'lg',
    windowClass: 'modal-special dark',
    resolve: {
      appointment: ['$q', 'Appointment', 'toasty', function($q, Appointment, toasty) {
        var defer = $q.defer();

        if(args && angular.isDefined(args['id']) && args['id'] != null) {
          Appointment.get({
            id: args['id']
          }, function(result) {
            if(result.success) {

              defered.resolve(result.rows);
            } else {
              defered.resolve(null);
            }
          }, function(reject) {
            toasty.error({title: "Atenção", msg: reject});

            defered.reject();
          });
        } else {
          defer.resolve( null );
        }

        return defer.promise;
      }]
    }
  }).result.then(function modalAppointmentSuccess(result) {
    // Atualiza agendamentos
    window.location.reload();
  }, function modalAppointmentFailure(rejection) {
    console.log(rejection)
  });
}

/**
 * 
 */
ApplicationCtrl.prototype.onModoOffline = function() {
  if(!$rootScope.offline_mode.enabled) this.modalOfflineMode()
  $rootScope.offline_mode.enabled = true;
}

/**
 * 
 */
ApplicationCtrl.prototype.doLogout = function() {
  localStorage.removeItem('acc_token')
  localStorage.removeItem('acc_data')
  sessionStorage.removeItem('account_id_selected')
  sessionStorage.removeItem('account_list_cached')
  
  this.$location.path("/auth")
  this.$window.location.reload()
}
})();