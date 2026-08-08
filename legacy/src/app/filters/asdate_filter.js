AsDateFilter.$inject = [];
function AsDateFilter() {
  return function (input) {
    return new Date(input);
  }
}

angular.module('sistemizedental').filter("asDate", AsDateFilter);