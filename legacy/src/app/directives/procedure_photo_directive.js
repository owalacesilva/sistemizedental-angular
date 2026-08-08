/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
ProcedurePhotoDirective.$inject = [];
function ProcedurePhotoDirective() {
  return {
    restrict: 'AE',
    scope: {
      urlPhotoFoot: "=",
      dataClass: "@",
    },
    template: '<div ng-class="{{ dataClass }}">{{ provider }}</div>',
    controller: ['$q', '$uibModal', function($q, $uibModal) {

      // Decodifica um arquivo usando FileReader
      this.decodeFile = function(file) {
        var defered = $q.defer();

        var fileReader = new FileReader();
        
        fileReader.onload = function(event) {
          var result = (event.target || event.currentTarget).result;

          defered.resolve(result);
        }

        fileReader.readAsDataURL(file);

        return defered.promise;
      }

      this.openImage = function(photo_url) {
        var instance = $uibModal.open({
          keyboard: true,
          animation: true,
          size: 'lg',
          templateUrl: 'views/modals/modal_view_image.html',
          controller: 'ModalViewImageInstanceCtrl',
          controllerAs: 'vm',
          resolve: {
            photo_url: function() {
              return photo_url;
            }
          }
        });
      }
    }],
    link: function(scope, elem, attrs, ctrl) {
      var img   = document.createElement('IMG');
      var input = document.createElement('INPUT');
      
      input.type  = "file";

      if(scope.urlPhotoFoot != null) {
        img.src = "photos/" + scope.urlPhotoFoot;
        elem.bind('click', function(evt) {
          ctrl.openImage("photos/" + scope.urlPhotoFoot);
        });
      } else {
        elem.bind('click', function(evt) {
          input.click();
        });
      }

      input.onchange = function(evt) {
        var fileList = (evt.target || evt.currentTarget).files;

        if(fileList.length) {

          ctrl.decodeFile( fileList[0] ).then(function(data) {
            img.src = data;
            scope.urlPhotoFoot = data;
          });
        }
      };

      elem.append(img);
    }
  }
}

angular.module('sistemizedental').directive('procedurePhoto', ProcedurePhotoDirective);