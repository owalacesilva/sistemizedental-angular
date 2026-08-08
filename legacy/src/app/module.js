// Cria uma modulo angular com dependencias afins 
// =============================================================================
"use strict";

import angular from 'angular';
import angularResource from 'angular-resource';
import angularTooltips from 'angular-tooltips';
import angularUiRouter from 'angular-ui-router';
import angularBusy from 'angular-busy';
import angularBootstrap from 'angular-bootstrap';
import angularLoadingBar from 'angular-loading-bar';
import angularDatabases from 'angular-datatables';
import angularInputMasks from 'angular-input-masks';
import angularMessages from 'angular-messages';
import angularSanitize from 'angular-sanitize';
import angularUiMask from 'angular-ui-mask';
import ngFileUpload from 'ng-file-upload';

angular.module('sistemizedental', [
    angularResource
  , angularUiRouter
  , angularTooltips
  , angularBusy
  , 'chart.js'
  , 'ui.calendar'
  , 'angularPromiseButtons'
  , 'oitozero.ngSweetAlert'
  , 'ng.deviceDetector'
  , 'angular-toasty'
  , 'angular-tour'
  , 'ngLetterAvatar'
  , 'angulartics'
  , 'angulartics.google.analytics'
  , 'daterangepicker'
  , angularBootstrap
  , angularLoadingBar
  , angularDatabases
  , angularInputMasks
  , angularMessages
  , angularSanitize
  , angularUiMask
  , ngFileUpload
])
.config(['$provide', '$stateProvider', '$urlRouterProvider', '$resourceProvider', '$httpProvider', 'tooltipsConfProvider', 'toastyConfigProvider', 'cfpLoadingBarProvider', 'tourConfig', '$analyticsProvider', configModule])
.run(['$rootScope', '$window', '$location', '$state', 'SweetAlert', 'DTDefaultOptions', runModule]);

// Configurações do modulo
// =============================================================================
function configModule($provide, $stateProvider, $urlRouterProvider, $resourceProvider, $httpProvider, tooltipsConfProvider, toastyConfigProvider, cfpLoadingBarProvider, tourConfig, $analyticsProvider) {

	// Add configuration code as desired
  	//.setAccount('UA-87401760-2')

  $analyticsProvider.virtualPageviews(true);

  $provide.decorator('$locale', ['$delegate', ($delegate) => {
    if($delegate.id == 'pt-br') {
      $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
      $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
    }

    return $delegate;
  }]);

  $httpProvider.interceptors.push('HttpInterceptor');
  $httpProvider.defaults.withCredentials = true;

  angular.extend(tourConfig, {
    placement: 'top', // default placement relative to target. 'top', 'right', 'left', 'bottom'
    animation: true, // if tips fade in
    nextLabel: "Próximo", // default text in the next tip button
    scrollSpeed: 500, // page scrolling speed in milliseconds
    margin: 28, // how many pixels margin the tip is from the target
    backDrop: true, // if there is a backdrop (gray overlay) when tour starts
    useSourceScope: true, // only target scope should be used (only when using virtual steps)
    containerElement: 'body' // default container element to parent tourtips to
  });

  cfpLoadingBarProvider.includeSpinner    = false;
  cfpLoadingBarProvider.includeBar        = true;
  cfpLoadingBarProvider.latencyThreshold  = 1;
  cfpLoadingBarProvider.parentSelector    = ".loading-bar-container";

  tooltipsConfProvider.configure({
    'smart':true,
    'size':'large',
    'speed': 'slow',
    'show-trigger': 'mouseover click',
    'hide-trigger': 'mouseleave click',
    'close-button': false
  });

  toastyConfigProvider.setConfig({
    sound: true,
    html: true,
    timeout: 30000,
    theme: 'material',
    clickToClose: true,
    shake: false
  });

  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = true;

  $stateProvider

    .state('auth', {
      url: "/auth",
      templateUrl: 'auth.view.html',
      controller: "AuthCtrl",
      controllerAs: "vm"
    })

    .state('app', {
      url: '/',
      abstract: true,
      templateUrl: 'application.view.html',
      controller: "ApplicationCtrl",
      controllerAs: "vm",
      resolve: {
        account: () => angular.fromJson( localStorage.getItem('acc_data') )
      }
    })

    .state('app.dashboard', {
      url: "dashboard",
      templateUrl: 'dashboard.html',
      controller: "DashboardCtrl",
      controllerAs: "vm"
    })

    /**
     * Rota para visualização da lista de agendamentos da clinica
     */
    .state('app.calendar', {
      url: 'calendar',
      templateUrl: 'calendar.view.html',
      controller: "CalendarCtrl",
      controllerAs: "vm",
      resolve: {
        accounts: ['$q', 'DoctorsCache', 'toasty', ($q, DoctorsCache, toasty) => {
          var $defered = $q.defer();

          DoctorsCache.getDoctors().then((res) => {
            $defered.resolve(res);
          }, (reject) => {
            toasty.error({ title: "Atenção", msg: reject });
            $defered.reject(null);
          });

          return $defered.promise;
        }]
      }
    })

    /**
     * Rota abertura de novo prontuário
     */
    .state('app.appointments', {
      url: "appointments",
      templateUrl: 'appointments.view.html', 
      controller: "AppointmentsCtrl",
      controllerAs: "vm",
      resolve: {
        doctors: ['$q', 'Doctor', function resolveAppointmentsState($q, Doctor) {
          var $defer = $q.defer();

          // Busca os dentistas
          Doctor.query((result) => {
            $defer.resolve(result.data);
          }, () => {
            $defer.reject('Ocorreu uma falha de comunicação com o serviço');
          });

          return $defer.promise;
        }]
      }
    })

    /**
     * Rota abertura de novo prontuário
     */
    .state('app.medical_history', {
      url: "medical_history/{id:int}",
      resolve: {
        appointment: ['$q', '$stateParams', 'Appointment', ($q, $stateParams, Appointment) => {
          return Appointment.get({ id: $stateParams.id }).$promise
        }]
      },
      views: {
        '': {
          templateUrl: "medical_history.html",
          controller: "MedicalHistoryCtrl",
          controllerAs: "vm"
        },
        'patient@app.medical_history': {
          templateUrl: "patient_medical_history.html",
          controller: "PatientMedicalHistoryCtrl",
          controllerAs: "vm"
        },
        'anamnesis@app.medical_history': {
          templateUrl: "patient_anamnesis_medical_history.html",
          controller: "PatientAnamnesisMedicalHistoryCtrl",
          controllerAs: "vm"
        },
        'attachments@app.medical_history': {
          templateUrl: "medical_history_attachments.html",
          controller: "MedicalHistoryAttachmentsCtrl",
          controllerAs: "vm"
        },
        'records@app.medical_history': {
          templateUrl: "medical_history_records.html",
          controller: "MedicalHistoryRecordsCtrl",
          controllerAs: "vm"
        }
      }
    })

    .state('app.patients', {
      url: "patients",
      abstract: true,
      template: '<div ui-view></div>'
    })
      .state('app.patients.list', {
        url: "",
        templateUrl: 'clients.view.html',
        controller: "ClientsCtrl",
        controllerAs: "vm"
      })
      .state('app.patients.create', {
        url: "/create",
        templateUrl: 'create_patient.html',
        controller: "PatientsCreateCtrl",
        controllerAs: "vm"
      })
      .state('app.patients.edit', {
        url: "/{id:int}",
        resolve: {
          client: ['$q', '$stateParams', 'Patient', ($q, $stateParams, Patient) => {
            return Patient.get({ id: $stateParams.id }).$promise
          }]
        },
        views: {
          '': {
            templateUrl: 'edit_patient.html',
            controller: "PatientsEditCtrl",
            controllerAs: "vm"
          },
          'anamnesis@app.patients.edit': {
            templateUrl: "client_anamnesis.view.html",
            controller: "ClientAnamnesisCtrl",
            controllerAs: "vm"
          },
          'appointments@app.patients.edit': {
            templateUrl: "patients_edit_appointments.html",
            controller: "PatientsEditAppointmentsCtrl",
            controllerAs: "vm"
          },
          'commands@app.patients.edit': {
            templateUrl: "patients_edit_commands.html",
            controller: "PatientsEditOrdersCtrl",
            controllerAs: "vm"
          }
        }
      })
      .state('app.patients.anamnese', {
        url: "/{id:int}/anamnese",
        templateUrl: "patients_anamnese.html",
        controller: "AnamneseCtrl",
        controllerAs: "vm",
        resolve: {
          patient: ['$q', '$routeParams', 'Patient', ($q, $routeParams, Patient) => {
            $defered = $q.defer();
            // Busca o paciente
            Patient.anamnese({ id: $routeParams.id }, (result) => {
              if(result.success) {
                $defered.resolve(result.data);
              } else {
                $defered.reject(result.error);
              }
            }, () => {
              $defered.reject('Ocorreu uma falha de comunicação com o serviço');
            });

            return $defered.promise;
          }]
        }
      })

    .state('app.doctors', {
      url: "doctors",
      abstract: true,
      template: '<div ui-view></div>'
    })
      .state('app.doctors.list', {
        url: "",
        templateUrl: 'doctors.html',
        controller: "DoctorsCtrl",
        controllerAs: "vm"
      })
      .state('app.doctors.create', {
        url: "/create",
        templateUrl: 'create_doctor.view.html',
        controller: "CreateDoctorCtrl",
        controllerAs: "vm"
      })
      .state('app.doctors.edition', {
        url: '/{id:int}',
        resolve: {
          doctor: ['$stateParams', 'Doctor', ($stateParams, Doctor) => {
            return Doctor.get({ id: $stateParams.id }).$promise
          }]
        },
        params: {
          tab: 0
        },
        views: {
          '': {
            templateUrl: "index.view.html",
            controller: "EditDoctorCtrl",
            controllerAs: "vm"
          },
          'details@app.doctors.edition': {
            templateUrl: "doctor_details.view.html",
            controller: "DoctorDetailsCtrl",
            controllerAs: "vm"
          },
          'working_hours@app.doctors.edition': {
            templateUrl: "doctor_working_hours.view.html",
            controller: "DoctorWorkingHoursCtrl",
            controllerAs: "vm"
          },
          'password@app.doctors.edition': {
            templateUrl: "doctor_password.view.html",
            controller: "DoctorPasswordCtrl",
            controllerAs: "vm"
          }
        }
      })

    .state('app.orders', {
      url: "orders",
      templateUrl: 'orders.view.html',
      controller: "OrdersCtrl",
      controllerAs: "vm"
    })

    .state('app.financial', {
      url: "financial",
      abstract: true,
      templateUrl: 'financial.view.html',
      controller: "FinancialCtrl",
      controllerAs: "vm"
    })
      .state('app.financial.transactions', {
        url: "/transactions",
        templateUrl: 'transactions.view.html',
        controller: "TransactionsCtrl",
        controllerAs: "vm"
      })

      .state('app.financial.cashiers', {
        url: "/cashiers",
        templateUrl: 'cashiers.view.html',
        controller: "CashiersCtrl",
        controllerAs: "vm"
      })

      .state('app.financial.accountables', {
        url: "/accountables",
        templateUrl: 'accountables.view.html',
        controller: "AccountablesCtrl",
        controllerAs: "vm"
      })

      .state('app.financial.payment_methods', {
        url: "/payment_methods",
        templateUrl: 'payment_methods.view.html',
        controller: "PaymentMethodsCtrl",
        controllerAs: "vm"
      })

    .state('app.resources', {
      url: 'resources',
      views: {
        '': {
          templateUrl: "resources.view.html",
          controller: "ResourcesCtrl",
          controllerAs: "vm"
        },
        'services@app.resources': {
          templateUrl: "services.view.html",
          controller: "ServicesListCtrl",
          controllerAs: "vm"
        },
        'products@app.resources': {
          templateUrl: "products.view.html",
          controller: "ProductsCtrl",
          controllerAs: "vm"
        }
      }
    })

    .state('app.campaigns', {
      url: "/campaigns",
      abstract: true,
      template: '<div ui-view></div>'
    })
      .state('app.campaigns.list', {
        url: "",
        templateUrl: 'campaigns.html',
        controller: "CampaignsCtrl",
        controllerAs: "vm"
      })
      .state('app.campaigns.create', {
        url: "/create",
        templateUrl: "doctors_edit.html",
        controller: "DoctorsEditCtrl",
        controllerAs: "vm",
        resolve: {
          doctor: () => {
            return null;
          }
        }
      })
      .state('app.campaigns.edit', {
        url: "/{id:int}",
        templateUrl: "doctors_edit.html",
        controller: "DoctorsEditCtrl",
        controllerAs: "vm",
        resolve: {
          doctor: ['$q', '$stateParams', 'Doctor', ($q, $stateParams, Doctor) => {
            var defered = $q.defer();
            // Busca o paciente
            Doctor.get({ 
              id: $stateParams.id 
            }, (response) => {
              if(response.success) {
                defered.resolve(response.data);
              } else {
                defered.reject(response.error);
              }
            }, () => {
              defered.reject('Ocorreu uma falha de comunicação com o serviço');
            });

            return defered.promise;
          }]
        }
      })

    .state('app.page_settings', {
      url: "page_settings",
      templateUrl: 'page_settings.html',
      controller: "PageSettingsCtrl",
      controllerAs: "vm"
    })

    .state('app.settings', {
      url: "settings",
      views: {
        '': {        
          templateUrl: 'settings_account.view.html',
          controller: "SettingsAccountCtrl",
          controllerAs: "vm"
        },
        'password@app.settings': {
          templateUrl: 'change_password.view.html',
          controller: "ChangePasswordCtrl",
          controllerAs: "vm"
        },
        'gallery@app.settings': {
          templateUrl: 'settings_gallery.html',
          controller: "SettingsGalleryCtrl",
          controllerAs: "vm"
        },
        'social_media@app.settings': {
          templateUrl: 'settings_social_media.html',
          controller: "SettingsSocialMediaCtrl",
          controllerAs: "vm"
        }
      }
    })

    .state('app.marketplace', {
      url: "marketplace",
      abstract: true,
      template: '<div ui-view></div>'
    })
      .state('app.marketplace.analytics', {
        url: "/analytics",
        templateUrl: 'shop_analytics.view.html',
        controller: "ShopAnalyticsCtrl",
        controllerAs: "vm"
      })
      .state('app.marketplace.products', {
        url: "/products",
        templateUrl: 'shop_products.view.html',
        controller: "ShopProductsCtrl",
        controllerAs: "vm"
      })
      .state('app.marketplace.settings', {
        url: "/settings",
        templateUrl: 'shop_settings.view.html',
        controller: "ShopSettingsCtrl",
        controllerAs: "vm"
      })
      .state('app.marketplace.create_product', {
        url: "/create_product",
        templateUrl: 'add_shop_product.view.html',
        controller: "AddShopProductCtrl",
        controllerAs: "vm",
        resolve: { shop_product: () => null }
      })
      .state('app.marketplace.edit_product', {
        url: "/products/{id:int}",
        templateUrl: 'add_shop_product.view.html',
        controller: "AddShopProductCtrl",
        controllerAs: "vm",
        resolve: {
          shop_product: ['$stateParams', 'ShopProduct', ($stateParams, ShopProduct) => {
            return $stateParams.id ? ShopProduct.get({ id: $stateParams.id }) : null
          }]
        }
      })

    .state('app.support', {
      url: "support",
      templateUrl: "support.html",
      controller: "SupportCtrl",
      controllerAs: "vm"
    })

    // Redirecionamento padrão 
    $urlRouterProvider.otherwise('/calendar');
}
// Configurações do modulo
// =============================================================================
function runModule($rootScope, $window, $location, $state, SweetAlert, DTDefaultOptions) {

  // Get metadatas
  // $window.document.getElementsByName('title')[0].content = tagData.title;

  // configs
  $rootScope.url_paths = {
    account_page_path: angular.element('[name="account_page_path"]').attr('content') || $window.location.origin,
    sign_up_path: angular.element('[name="sign_up_path"]').attr('content') || $window.location.origin,
    forgot_password_path: angular.element('[name="forgot_password_path"]').attr('content') || $window.location.origin,
    account_confirmation_path: angular.element('[name="account_confirmation_path"]').attr('content') || $window.location.origin,
    private_policy_path: angular.element('[name="private_policy_path"]').attr('content') || $window.location.origin,
    terms_path: angular.element('[name="terms_path"]').attr('content') || $window.location.origin,
  }

  $rootScope.offline_mode = {
    enabled: false
  };

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    console.log(`$stateChangeStart: ${fromState.url} to ${toState.url}`)
    if (!localStorage.getItem("acc_token")) {
      $location.path("/auth")
      return false;
    }
  });

  $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    setTimeout(() => {
      $("#app-sidebar, #app-content").removeClass("closed");
    }, 300);
  });

  $rootScope.$on("$stateNotFound", function (event, unfoundState, fromState, fromParams) {
    const state_url = angular.isDefined(unfoundState) ? unfoundState : null
    console.log(`$stateNotFound: ${fromState.url} to ${state_url}`, unfoundState)
  });

  $rootScope.$on("$stateChangeError", function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
    console.log(`$stateChangeError: ${fromState.url} to ${toState.url}`, error)
  });

  angular.element(document).ready(() => {
    var _window = angular.element($window);

    var contentWrapper = angular.element('#content-wrapper');
    contentWrapper.css('min-height', (_window.height() - 50) + "px");
  });

  // Organiza a transação do accordion do menu principal
  $('#sidebar .collapse').on('show.bs.collapse', function (e) {
    var actives = $('#sidebar').find('.in, .collapsing');
    actives.each( function (index, element) {
      $(element).collapse('hide');
    });
  });

  $(document).on("click", ".page-toggle-sidebar", () => {
    $("#app-sidebar, #app-content").toggleClass("closed");
  });

  $('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
    alert('oi')
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
  });

  setTimeout(() => {
    jQuery(".modal-auto").modal('show');
  }, 1200);

  // Configura a altura do sidebar e do conteudo
  var sidebarAndContentHeight = () => {
    var content = $('.page-inner'),
        header  = $('.page-header'),
        sidebar = $('.page-sidebar'),
        body    = $('body'),
        height;
    
    content.attr('style', 'min-height:' + sidebar.height() + 'px !important');

    height = sidebar.height();
    if (height < $(window).height()) {
      height = $(window).height() - header.height();
    }

    if (height >= content.height()) {
      content.attr('style', 'min-height:' + height + 'px !important');
    }
  };

  DTDefaultOptions.setDisplayLength(10);
  DTDefaultOptions.setLanguage({
    "lengthMenu": "Mostrar _MENU_ registros",
    "zeroRecords": "Nenhum registro encontrado",
    "info": "Mostrando página _PAGE_ de _PAGES_",
    "emptyTable": "Nenhum registro disponivel",
    "infoEmpty": "Nenhum registro disponivel",
    "infoFiltered": "(filtered from _MAX_ total records)",
    "search": "Procurar",
    "loading": "Buscando...",
    "paginate": {
      "first":      "Primeiro",
      "last":       "Último",
      "next":       "Proximo",
      "previous":   "Anterior"
    }
  });
  DTDefaultOptions.setBootstrapOptions({
    TableTools: {
      classes: {
        container: 'btn-group',
        buttons: {
          normal: 'btn btn-danger'
        }
      }
    },
    ColVis: {
      classes: {
        masterButton: 'btn btn-primary'
      }
    }
  });
}