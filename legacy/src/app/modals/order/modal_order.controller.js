/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ModalOrderInstanceCtrl.$inject = ['$state', '$uibModalInstance', '$http', '$filter', 'SweetAlert',  'Order', 'DoctorsCache', 'Product', 'PaymentMethod', 'order_id']
function ModalOrderInstanceCtrl($state, $uibModalInstance, $http, $filter, SweetAlert,  Order, DoctorsCache, Product, PaymentMethod, order_id) {
  var vm = this;

  this.Order = Order
  this.SweetAlert = SweetAlert
  this.$uibModalInstance = $uibModalInstance
  this.$http = $http
  this.$filter = $filter
  this.$state = $state
  this.doctor_list = []
  this.original_service_list = []
  this.original_product_list = []
  this.payment_methods = []
  this.client_default = {
    id: null,
    full_name: null, 
    phone_number: null,
    balance: 0
  }

  PaymentMethod.query((res) => {
    res.count ? this.payment_methods.splice(0, this.payment_methods.length, ...res.rows) : null
    if (order_id)
      this.initOrder(order_id) 
    else 
      this.order = this.createOrder()
  }, ({ data }) => {
    console.log(data.error)
  })

  DoctorsCache.getDoctors().then((res) => {
    this.doctor_list.splice(0, this.doctor_list.length, ...res)
  }, ({ data }) => {
    console.log(data.error)
  })

  Product.query((res) => {
    res.count ? this.original_service_list.splice(0, this.original_service_list.length, ...res.rows) : null
  }, ({ data }) => {
    console.log(data.error)
  })

  Product.query((res) => {
    res.count ? this.original_product_list.splice(0, this.original_product_list.length, ...res.rows) : null
  }, ({ data }) => {
    console.log(data.error)
  })
}

/**
 * 
 */
ModalOrderInstanceCtrl.prototype.initOrder = function(order_id) {
  const groupBy = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), 
    {},
  )

  this.Order.get({ id: order_id }).$promise.then((order) => {
    order.reference_date = moment(order.reference_date).toDate()
    order.items = order.items.map((item) => {
      if (item.service_id) {
        item.services = [ ...this.original_service_list ]
      } else if (item.product_id) {
        item.products = [ ...this.original_product_list ]
      }
      return item
    })
    // group transactions
    const transactions_grouped = groupBy(order.transactions, 'payment_method_id')
    const transactions = []
    for (let index in transactions_grouped) {
      const pre_transaction = transactions_grouped[index]
      const transaction = pre_transaction.reduce((total, item) => ({
        ...total,
        installments: pre_transaction.length,
        total_amount: (parseFloat(total.total_amount) + parseFloat(item.total_amount)).toFixed(2)
      }))
      transactions.push(transaction)
    }

    order.transactions = this.payment_methods.map((p) => {
      const t = transactions.filter((f) => f.payment_method_id == p.id)[0]
      return {
        ...t,
        payment_method_id: p.id,
        title: p.title,
        has_installments: p.has_installments,
        installments: (t ? t.installments : 1), 
        installments_limit: parseInt(p.installments_limit)
      }
    })
    this.order = order
  }, ({ data }) => {
    this.order = this.createOrder()
  })
}

/**
 * 
 */
ModalOrderInstanceCtrl.prototype.createOrder = function () {
  return new this.Order({
    client: { ...this.client_default },
    reference_date: moment().toDate(),
    reference_code: null,
    items: [], // Items da comanda
    // Formas de pagamento
    transactions: this.payment_methods.map((method) => ({
      total_amount: 0.0,
      installments: 1, 
      payment_method_id: method.id,  
      title: method.title,  
      has_installments: method.has_installments, 
      installments_limit: method.installments_limit 
    })), 
    notes: null,
    discount: 0.00,
    total_amount: 0.00,
    total_pay: 0.00,
    remaining_amount: 0.00
  })
}

/**
 * Adiciona um novo serviço na comanda
 */
ModalOrderInstanceCtrl.prototype.addService = function() {
  this.order.items.push({
    service_id: null,
    services: [ ...this.original_service_list ],
    account_id: null,
    quantity: 1,
    price: 0.00,
    discount: 0,
    total_cost: 0.00
  });
}

/**
 * Adiciona um novo produto na comanda
 */
ModalOrderInstanceCtrl.prototype.addProduct = function() {
  this.order.items.push({
    product_id: null,
    products: [ ...this.original_product_list ],
    account_id: null,
    quantity: 1,
    price: 0.00,
    discount: 0,
    total_cost: 0.00
  });
}

/**
 * Remove um item na comanda
 */
ModalOrderInstanceCtrl.prototype.removeItem = function(item) {
  var index = this.order.items.indexOf(item);

  if(index > -1) {
    this.order.items.splice(index, 1);
  }

  this.updateTotalAmount();
  this.updateRemainingAmount();
}

/**
 * Atualiza um serviço da comanda
 */
ModalOrderInstanceCtrl.prototype.changeService = function(item) {
  angular.forEach(item.services, function(service) {
    if(service.id == item.service_id) {
      item.total_cost = item.price = service.price;
      item.quantity = 1;
    }
  });

  this.updateTotalAmount();
  this.updateRemainingAmount();
}

/**
 * Atualiza um produto da comanda
 */
ModalOrderInstanceCtrl.prototype.changeProduct = function(item) {
  angular.forEach(item.products, function(product) {
    if(product.id == item.product_id) {
      item.total_cost = item.price = product.price;
      item.quantity = 1;
    }
  });

  this.updateTotalAmount();
  this.updateRemainingAmount();
}

/**
 * Altera o valor total de um item
 */
ModalOrderInstanceCtrl.prototype.updateItemTotalAmount = function(item) {
  item.total_cost = parseFloat(item.price) * parseInt(item.quantity);

  this.updateTotalAmount();
  this.updateRemainingAmount();
}

/**
 * Altera o total da comanda
 */
ModalOrderInstanceCtrl.prototype.updateTotalAmount = function() {
  // Reset
  this.order.total_amount = 0.00;
  this.order.total_pay = 0.00;

  var totalAmount = 0.00;
  var discount = parseFloat(this.order.discount);

  angular.forEach(this.order.items, function(item) {
    var itemTotalAmount = Number(item.total_cost);

    if(angular.isNumber(itemTotalAmount) && itemTotalAmount > 0.00) {
      totalAmount += itemTotalAmount;
    }
  });

  this.order.total_amount = totalAmount;
  this.order.total_pay = totalAmount - discount;
}

/**
 * Atualiza o troco da comanda
 */
ModalOrderInstanceCtrl.prototype.updateRemainingAmount = function() {
  let total_paid = 0.00;
  const total_amount = parseFloat(this.order.total_pay);

  // Soma todas as forma de pagamento
  angular.forEach(this.order.transactions, (transactions) => {
    const amount = Number(transactions.total_amount)
    total_paid = amount > 0.00 ? total_paid + amount : total_paid
  });

  this.order.remaining_amount = (total_amount - total_paid) * -1
}

/**
 * 
 */
ModalOrderInstanceCtrl.prototype.updateDiscount = function() {
  this.updateTotalAmount();
  this.updateRemainingAmount();
}

/**
 * [getClients description]
 * 
 * @param  {[type]} search [description]
 * @return {[type]}        [description]
 */
ModalOrderInstanceCtrl.prototype.getClients = function(search) {
  return this.$http.get('api/clients', {
    params: { q: search }
  }).then(({ data }) => 
    data && data.count ? data.rows.map(item => item) : null
  )
}

/**
 * [selectClient description]
 * 
 * @param  {[type]} $item  [description]
 * @param  {[type]} $model [description]
 * @param  {[type]} $label [description]
 * @param  {[type]} $event [description]
 * @return {[type]}        [description]
 */
ModalOrderInstanceCtrl.prototype.selectClient = function($item, $model, $label, $event) {
  this.order.client_id = $item.id; // workaround
  this.order.client.id = $item.id;
  this.order.client.full_name = $item.full_name;
  this.order.client.balance = $item.balance;
  this.order.client.phone_number = $item.phone_number;
}

/**
 * [selectClient description]
 * 
 * @return {[type]}        [description]
 */
ModalOrderInstanceCtrl.prototype.clearClient = function() {
  this.order.client_id = null; // workaround
  this.order.client.id = null;
  this.order.client.full_name = null;
  this.order.client.balance = 0.0;
  this.order.client.phone_number = null;
}

/**
 * [_selectPatient description]
 * 
 * @return {[type]}        [description]
 */
ModalOrderInstanceCtrl.prototype.editPatient = function() {
  this.$uibModalInstance.dismiss();
  this.$state.go("app.clients.edit", { id: this.order.client_id })
}

/**
 * 
 */
ModalOrderInstanceCtrl.prototype.validate = function(form, finalize) {
  console.log(form)
  if (form.$valid) {
    if (!this.order.items.length) {
      // Abort
      this.SweetAlert.swal('Atenção', 'Selecione no minimo um serviço ou produto', 'error');
      return false;
    }

    if (this.order.remaining_amount > 0) {
      var strRemainingValue = this.$filter('currency')(this.order.remaining_amount, 'R$ ', 2);
      if (this.order.client.balance < 0) {
        var strBalance = this.$filter('currency')(this.order.client.balance, 'R$ ', 2);
        var text = "Existe " + strRemainingValue + " de troco em aberto na comanda\ne seu paciente possue " + strBalance + " em débito\n\nDeseja abater o troco na dívida desse paciente?";
        var confirmButtonText = "Sim, abater";
      } else {
        var text = "Existe " + strRemainingValue + " de troco em aberto na comanda\nDeseja adicionar como crédito na conta do paciente?";
        var confirmButtonText = "Sim, adicionar crédito";
      }
    } else if(this.order.remaining_amount < 0) {
      var strRemainingValue = this.$filter('currency')(this.order.remaining_amount, 'R$ ', 2);
      if (this.order.client.balance > 0.0) {
        var strBalance = this.$filter('currency')(this.order.client.balance, 'R$ ', 2);
        var text = "Restam " + strRemainingValue + " à pagar na comanda\ne seu paciente possue " + strBalance + " em créditos\n\nDeseja abater esse valor nos créditos do paciente?";
        var confirmButtonText = "Sim, abater";
      } else {
        var text = "Restam " + strRemainingValue + " à pagar na comanda\nDeseja adicionar como dédito na conta do paciente?";
        var confirmButtonText = "Sim, adicionar débito";
      }
    } else {
      (this.onSubmit())(true);
      return true;
    }

    this.SweetAlert.swal({
      animation: false, 
      title: "Atenção",
      text: text,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Não, voltar",
      closeOnConfirm: true,
      closeOnCancel: true 
    }, this.onSubmit());

    return true;
  }
}

/**
 * 
 */
ModalOrderInstanceCtrl.prototype.onSubmit = function() {
  return (save_change) => {
    if (!save_change) return true;
    this.order.save_change = save_change
    
    const promise = this.order['id'] ? this.order.$update() : this.order.$save()
    promise.then((res) => {
      this.$uibModalInstance.close(res);
      this.SweetAlert.swal('Pronto', "Comanda salva com sucesso", 'success');
    }, ({ data: { errors } }) => {
      msg = Array.isArray(errors) ? errors.join("\n") : errors
      this.SweetAlert.swal('Atenção', msg, 'error');
    })
  }
}

angular.module('sistemizedental').controller("ModalOrderInstanceCtrl", ModalOrderInstanceCtrl);
