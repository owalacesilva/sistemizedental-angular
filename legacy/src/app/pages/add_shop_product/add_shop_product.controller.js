/**
 * @description
 * Pagina para criação de novos pacientes
 */
AddShopProductCtrl.$inject = ['$scope', '$state', 'SweetAlert', 'Upload', 'ShopProductCategory', 'ShopProduct', 'shop_product'];
function AddShopProductCtrl($scope, $state, SweetAlert, Upload, ShopProductCategory, ShopProduct, shop_product) {
  var vm = this;

  this.toggle_category = false;
  this.shop_product = shop_product || new ShopProduct({ 
    price: 0,
    discount_price: 0,
    status: 'active'
  })
  this.categories = [];

  ShopProductCategory.query((r) => 
    (r.rows || []).map((i) => this.categories.push(i))
  , (e) => console.log(e))

  /////////

  this.onSubmitImages = (file) => {
    if (!file) return;
    const position = this.shop_product.images_url.length

    Upload.upload({
      url: `api/mp_products/${this.shop_product.id}/images`,
      method: 'POST',
      data: { images: [file] }
    }).then(({ data: { images_url, errors } }) => {
      if (errors) {
        SweetAlert.swal('Atenção', errors, 'error')
      } else {
        this.shop_product.images_url.length = 0
        this.shop_product.images_url = images_url.map((url) => `${url}?v=${new Date().getTime()}`)
      }
    }, ({ data: { errors } }) => {
      SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço!'), 'error')
    }, evt => {
      // do something
    })
  }

  this.onSubmit = (isValid) => {
    if(isValid) {
      if( angular.isDefined(this.shop_product['id']) ) {
        ShopProduct.update({ 
          id: this.shop_product.id
        }, this.shop_product, (res) => {
          SweetAlert.swal('Pronto', "Produto atualizado com sucesso", 'success');
          $state.go('app.marketplace.products')
        }, ({ data: { errors }}) => {
          SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço'), 'error');
        });
      } else {      
        ShopProduct.save(this.shop_product, (res) => {
          SweetAlert.swal('Pronto', "Produto adicionado com sucesso", 'success');
          $state.go('app.marketplace.edit_product', {
            id: res.id
          })
        }, ({ data: { errors }}) => {
          SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço'), 'error');
        });
      }
    }
  }
}

angular.module('sistemizedental').controller("AddShopProductCtrl", AddShopProductCtrl);
