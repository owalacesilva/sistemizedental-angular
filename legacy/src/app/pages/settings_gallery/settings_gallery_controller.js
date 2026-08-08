/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
SettingsGalleryCtrl.$inject = ['Upload', 'SweetAlert', 'account']
function SettingsGalleryCtrl(Upload, SweetAlert, account) {
  var vm = this;

  vm.account = account
  vm.updaloadBanner = _updaloadBanner
  vm.uploadImage = _uploadImage

  // upload on file select or drop
  function _updaloadBanner(file) {
    Upload.upload({
      url: 'api/accounts/banner',
      method: 'POST',
      data: { banner: file }
    }).then(({ data: { url, errors } }) => {
      if (errors) {
        SweetAlert.swal('Atenção', errors, 'error')
      } else {
        vm.account.banner_url = `${url}?v=${new Date().getTime()}`
        localStorage.setItem('acc_data', JSON.stringify(vm.account))
      }
    }, ({ data: { errors } }) => {
      SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço!'), 'error')
    }, evt => {
      // do something
    })
  }

  // upload on file select or drop
  function _uploadImage(file) {
    if (!file) return;
    const position = vm.account.images_url.length

    Upload.upload({
      url: 'api/accounts/images',
      method: 'POST',
      data: { images: [file] }
    }).then(({ data: { images_url, errors } }) => {
      if (errors) {
        SweetAlert.swal('Atenção', errors, 'error')
      } else {
        vm.account.images_url.length = 0
        vm.account.images_url = images_url.map((url) => `${url}?v=${new Date().getTime()}`)
        localStorage.setItem('acc_data', JSON.stringify(vm.account))
      }
    }, ({ data: { errors } }) => {
      SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço!'), 'error')
    }, evt => {
      // do something
    })
  }
}

angular.module('sistemizedental').controller("SettingsGalleryCtrl", SettingsGalleryCtrl)
