AccountFactory.$inject = ['$resource'];
function AccountFactory($resource) {
  return $resource('api/accounts', {
    /* void */
  }, {
    token: {
      url:  'api/accounts/token',
      method: 'POST'
    },
    getAttachmentImages: {
      url: 'api/attachments',
      method: 'GET',
      isArray: true
    },
    updateMe: {
      url:  'api/accounts/me',
      method: 'PUT'
    },
    updateLinks: {
      url: 'api/accounts/links',
      method: 'PUT'
    },
    updatePassword: {
      url: 'api/accounts/password',
      method: 'PUT'
    }
  }, {
    stripTrailingSlashes: true
  });
}

angular.module('sistemizedental').factory("Account", AccountFactory);