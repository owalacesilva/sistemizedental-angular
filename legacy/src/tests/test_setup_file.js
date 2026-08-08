var localStorageMock = /* ... some mock code ... */
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// This packages are in bower_components folder
require('angular');
require('./../../bower_components/fullcalendar/dist/fullcalendar.min.js');
require('./../../bower_components/angular-toasty/dist/angular-toasty');
require('./../../bower_components/angular-tour/dist/angular-tour');
require('./../../bower_components/ng-device-detector/ng-device-detector');
require('./../../bower_components/ngSweetAlert/SweetAlert');
require('./../../bower_components/re-tree/re-tree');
require('./../../bower_components/angular-chart.js/dist/angular-chart');
require('./../../bower_components/angular-ui-calendar/src/calendar');
require('./../../bower_components/angular-promise-buttons/dist/angular-promise-buttons');
require('./../../node_modules/ngletteravatar/ngletteravatar');
require('./../../bower_components/angulartics/dist/angulartics.min');
require('./../../bower_components/angulartics-google-analytics/dist/angulartics-ga.min');
require('./../app/module.js');
require('./../app/shared/http_interceptor_factory');
require('./../app/pages/auth/auth_controller');