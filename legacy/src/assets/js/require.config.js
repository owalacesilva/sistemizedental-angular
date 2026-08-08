requirejs.config({
 	xhtml: true,
  waitSeconds: 0,
  baseUrl: ASSETS_PATH,
  paths: {
    //jquery: 'jquery-2.2.4',
    'jquery': [
    	"//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min"
    ],
    'boostrap': [
    	"//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min"
    ],
    'datatables': [
      "//cdn.datatables.net/1.10.12/js/jquery.dataTables.min"
    ],
    'datatables-responsive': [
      "//cdn.datatables.net/responsive/1.0.1/js/dataTables.responsive"
    ],
    'moment': [
      "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment-with-locales.min"
    ],
    'angular': [
      "//code.angularjs.org/1.6.3/angular.min"
    ],
    'angular-locale': [
    	"libs/angular-locale_pt-br"
    ],
    'fullcalendar': [
    	"//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.5.1/fullcalendar.min"
    ],

    app: [ APP_BUNDLE ]
  },

  shim: {
    'boostrap': {
      deps: ['jquery']
    },
    'datatables': {
      deps: ['jquery', 'angular']
    },
    'datatables-responsive': {
      deps: ['angular', 'datatables']
    },
    'moment': {
      exports: 'moment',
      deps: ['jquery', 'angular']
    },
    'angular': {
      exports: 'angular',
      deps: ['jquery']
    },
    'angular-locale': {
    	deps: ['angular']
    },
    'app': {
      deps: ['boostrap', 'moment', 'datatables-responsive', 'fullcalendar', 'angular-locale']
    },
  }
});

define([ 'require', 'angular', 'moment' ], function(require, ng, moment) {

  if (window.moment == undefined) {
    window.moment = moment || require('moment');
  }

	require(['app']);
});