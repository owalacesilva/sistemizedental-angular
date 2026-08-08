require.config({
  xhtml: true,
  waitSeconds: 200,
  urlArgs: "v=" + VERSION_CODE,

  // alias libraries paths
  paths: {
    "jquery": [
      '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min'
    ],
    "bootstrap": [
      '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min'
    ],
    "moment": [
      "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment-with-locales.min"
    ],
    "fullcalendar": [
      "//cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.9.1/fullcalendar.min"
    ],
    "datatables": [
      "//cdn.datatables.net/1.10.12/js/jquery.dataTables.min"
    ],
    'datatables-responsive': [
      "//cdn.datatables.net/responsive/1.0.1/js/dataTables.responsive"
    ],
    "gcal": [
      "//cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.9.1/gcal"
    ],
    'fullcalendar_lang-pt-br': [
      "//cdnjs.cloudflare.com/ajax/libs/fullcalendar/2.9.1/lang/pt-br"
    ],
    "lodash": [
      "//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.11.2/lodash.min"
    ],
    "string-mask": [
      "./string-mask"
    ],
    "br-validations": [
      "./br-validations.min"
    ],
    "angular-input-masks": [
      "./angular-input-masks"
    ],
    "sweetalert": [
      "//cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min"
    ],
    'chart': [
      "./Chart.min"
    ],
    'angular': [
      "//code.angularjs.org/1.6.0/angular.min"
    ],
    'vendor': [
      "./vendor.min"
    ],
    'ui.views': [
      "./ui-views.tpls"
    ],
    'app': [
      "./app.min"
    ]
  },

  // angular does not support AMD out of the box, put it in a shim
  shim: {
    'moment': {
      exports: 'moment',
      deps: ['jquery']
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'fullcalendar': {
      deps: ['jquery', 'moment']
    },
    'gcal': {
      deps: ['fullcalendar']
    },
    'fullcalendar_lang-pt-br': {
      deps: ['fullcalendar']
    },
    'datatables': {
      deps: ['jquery']
    },
    'datatables-responsive': {
      deps: ['datatables']
    },
    'lodash': {
      deps: ['jquery']
    },
    'sweetalert': {
      exports: 'sweetAlert',
      deps: ['jquery']
    },
    'angular': {
      exports: 'angular',
      deps: ['jquery']
    },
    'angular-input-masks': {
      deps: ['angular', 'string-mask', 'br-validations']
    },
    'vendor': {
      deps: ['jquery', 'angular', 'moment', 'datatables-responsive', 'fullcalendar', 'lodash', 'sweetalert', 'chart', 'angular-input-masks']
    },
    'app': {
      deps: ['vendor', 'ui.views']
    }
  }
});

/**
 * bootstraps angular onto the window.document node
 */
define([
  'require',
  'angular',
  'moment',
  'chart',
  'datatables',
  'bootstrap',
  'fullcalendar',
  'gcal',
  'fullcalendar_lang-pt-br',
  'sweetalert',
  'lodash',
  'vendor'
], function (require, ng, moment, Chart) {
  'use strict';

  window.Chart = Chart;

  if(window.moment == undefined) {
    window.moment = require('moment') || moment;
  }

  require([ 'app' ], function() {
    angular.bootstrap(document, ['ng', 'sistemizedental', 'sistemizedental.tpls']);

    require(['https://sistemizedental.agilecrm.com/stats/min/agile-min.js'], function() {
      _agile.set_account('a3c1qfqjdff8v8tp2i3tl22d1t', 'sistemizedental');
      _agile.track_page_view();
      _agile_execute_web_rules();

      _agile.set_email(CUSTOMER_EMAIL);
    });

    require(['https://embed.tawk.to/57bf6b2f2b03647ba16babbf/default'], function() {
      window.Tawk_API       = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
    });
  });
});