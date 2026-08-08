/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ThumbnailUploadDirective.$inject = ['urls'];
function ThumbnailUploadDirective(urls) {
  return {
    restrict: 'AE',
    scope: {
      imgDefaultSrc: "@",
      imgAlt: "@",
      imgClass: "@",
      method: "@",
      endpoint: "@",
      xhrParams: "="
    },
    link: function(scope, elem, attrs) {
      var img   = angular.element( document.createElement('IMG') );
      var input = document.createElement('INPUT');

      img.attr('alt', scope.imgAlt);
      img.attr('class', scope.imgClass);
      img.attr('src', scope.imgDefaultSrc);
      input.type = "file";

      elem.bind('click', function(event) {
        input.click();
      });

      input.onchange = function(event) {
        var target  = event.target || event.currentTarget;
        var fileList = target.files;
        var resource = null;

        if(fileList.length > 0) {
          resource = fileList[0];
          decodeFile(resource);
        }
      };

      elem.html(img);

      ///////////////////

      function decodeFile(file) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
          var target    = event.target || event.currentTarget;
          var result    = target.result;

          img.attr('src', result);

          // Cria uma formulario key/value para envido de dados
          var formData  = new FormData();
          formData.append('file', file);

          for(var param in scope.xhrParams) {
            formData.append(param, scope.xhrParams[param]);
          }

          sendRequest(formData);
        }

        fileReader.readAsDataURL(file);
      }

      function sendRequest(formData) {
        var xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function(event) {
          if(event.lengthComputable) {
            percentCompleted = Math.round(event.loaded / event.total * 100);
          }
        }

        xhr.upload.onload = function(event) {

        }

        // Inicializa uma request
        xhr.open(scope.method || 'POST', urls.BASE_API + scope.endpoint, true);

        // Envia a requisição iniciada anteriormente
        xhr.send(formData);
      }
    }
  }
}

angular.module('sistemizedental').directive('thumbnailUpload', ThumbnailUploadDirective);