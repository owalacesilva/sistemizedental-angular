/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalPromotionInstanceCtrl.$inject = ['$scope', 'SweetAlert',  '$uibModalInstance', '$state', '$http', 'Promotion', 'promotion'];
function ModalPromotionInstanceCtrl($scope, SweetAlert,  $uibModalInstance, $state, $http, Promotion, promotion) {
  var vm = this;

  vm.promotion            = promotion;
  vm.getServices          = _getServices;
  vm.changePercentage     = _changePercentage;
  vm.changeDiscountPrice  = _changeDiscountPrice;
  vm.submit               = _submit;

  /////////

  function _submit(form) {
    if(form.$valid) {
      if( angular.isDefined(vm.promotion['id']) ) {
        Promotion.update({ 
          id: vm.promotion.id
        }, {
          service_id: vm.promotion.service ? vm.promotion.service.id : null,
          title: vm.promotion.title,
          description: vm.promotion.description,
          percentage_price: vm.promotion.percentage_price,
          discount_price: vm.promotion.discount_price,
          initial_date: moment(vm.promotion.initial_date).format('YYYY-MM-DD'),
          final_date: moment(vm.promotion.final_date).format('YYYY-MM-DD'),
          sunday: vm.promotion.sunday,
          monday: vm.promotion.monday,
          tuesday: vm.promotion.tuesday,
          wednesday: vm.promotion.wednesday,
          thursday: vm.promotion.thursday,
          friday: vm.promotion.friday,
          saturday: vm.promotion.saturday,
        }, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Promoção atualizado com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      } else {      
        Promotion.save({
          service_id: vm.promotion.service ? vm.promotion.service.id : null,
          title: vm.promotion.title,
          description: vm.promotion.description,
          percentage_price: vm.promotion.percentage_price,
          discount_price: vm.promotion.discount_price,
          initial_date: moment(vm.promotion.initial_date).format('YYYY-MM-DD'),
          final_date: moment(vm.promotion.final_date).format('YYYY-MM-DD'),
          sunday: vm.promotion.sunday,
          monday: vm.promotion.monday,
          tuesday: vm.promotion.tuesday,
          wednesday: vm.promotion.wednesday,
          thursday: vm.promotion.thursday,
          friday: vm.promotion.friday,
          saturday: vm.promotion.saturday,
        }, function(result) {
          if(result.success) {
            $uibModalInstance.close(result.data);
            SweetAlert.swal('Pronto', "Promoção adicionado com sucesso", 'success');
          } else {
            SweetAlert.swal('Atenção', result.errors, 'error');
          }
        }, function() {
          SweetAlert.swal('Atenção', 'Ocorreu uma falha de comunicação com o serviço', 'error');
        });
      }
    }
  }

  function _changePercentage() {
    if(vm.promotion.service) {

      vm.promotion.discount_price = parseFloat(((vm.promotion.percentage_price/100)*vm.promotion.service.price)-vm.promotion.service.price);
    }
  }

  function _changeDiscountPrice() {
    if(vm.promotion.service) {

      vm.promotion.percentage_price = parseFloat((((vm.promotion.discount_price*100)/vm.promotion.service.price)-100)*-1);
    }
  }

  /**
   * Retorna uma lista de pacientes, baseado 
   * no retorno de um requisiçaão xhr
   */
  function _getServices(search) {
    return $http.get( 'api/products', {
      params: {
        kind: "services",
        q: search
      }
    }).then(function(response){
      var result = response.data;
      if(angular.isArray(result.data)) {
        return result.data.map(function(item){
          return item;
        });
      }
    });
  }
}

angular.module('sistemizedental').controller("ModalPromotionInstanceCtrl", ModalPromotionInstanceCtrl);