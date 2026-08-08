/**
 * @description
 * Overview do clientes
 * 
 * @param {[type]} $scope [description]
 */
SettingsAccountCtrl.$inject = ['$scope', '$rootScope', '$window', 'Upload', 'SweetAlert', 'Account'];
function SettingsAccountCtrl($scope, $rootScope, $window, Upload, SweetAlert, Account) {
  var vm = this;

  this.account = angular.extend({
    timezone: null
  }, angular.fromJson(localStorage.getItem('acc_data')))

  vm.submit = _submit;
  vm.uploadAvatar = _uploadAvatar;

  this.tzInts = [
    {"label":"(GMT-12:00) International Date Line West","value":"-12"},
    {"label":"(GMT-11:00) Midway Island, Samoa","value":"-11"},
    {"label":"(GMT-10:00) Hawaii","value":"-10"},
    {"label":"(GMT-09:00) Alaska","value":"-9"},
    {"label":"(GMT-08:00) Pacific Time (US & Canada)","value":"-8"},
    {"label":"(GMT-08:00) Tijuana, Baja California","value":"-8"},
    {"label":"(GMT-07:00) Arizona","value":"-7"},
    {"label":"(GMT-07:00) Chihuahua, La Paz, Mazatlan","value":"-7"},
    {"label":"(GMT-07:00) Mountain Time (US & Canada)","value":"-7"},
    {"label":"(GMT-06:00) Central America","value":"-6"},
    {"label":"(GMT-06:00) Central Time (US & Canada)","value":"-6"},
    {"label":"(GMT-05:00) Bogota, Lima, Quito, Rio Branco","value":"-5"},
    {"label":"(GMT-05:00) Eastern Time (US & Canada)","value":"-5"},
    {"label":"(GMT-05:00) Indiana (East)","value":"-5"},
    {"label":"(GMT-04:00) Atlantic Time (Canada)","value":"-4"},
    {"label":"(GMT-04:00) Caracas, La Paz","value":"-4"},
    {"label":"(GMT-04:00) Manaus","value":"-4"},
    {"label":"(GMT-04:00) Santiago","value":"-4"},
    {"label":"(GMT-03:30) Newfoundland","value":"-3.5"},
    {"label":"(GMT-03:00) Brasilia","value":"-3"},
    {"label":"(GMT-03:00) Buenos Aires, Georgetown","value":"-3"},
    {"label":"(GMT-03:00) Greenland","value":"-3"},
    {"label":"(GMT-03:00) Montevideo","value":"-3"},
    {"label":"(GMT-02:00) Mid-Atlantic","value":"-2"},
    {"label":"(GMT-01:00) Cape Verde Is.","value":"-1"},
    {"label":"(GMT-01:00) Azores","value":"-1"},
    {"label":"(GMT+00:00) Casablanca, Monrovia, Reykjavik","value":"0"},
    {"label":"(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London","value":"0"},
    {"label":"(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna","value":"1"},
    {"label":"(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague","value":"1"},
    {"label":"(GMT+01:00) Brussels, Copenhagen, Madrid, Paris","value":"1"},
    {"label":"(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb","value":"1"},
    {"label":"(GMT+01:00) West Central Africa","value":"1"},
    {"label":"(GMT+02:00) Amman","value":"2"},
    {"label":"(GMT+02:00) Athens, Bucharest, Istanbul","value":"2"},
    {"label":"(GMT+02:00) Beirut","value":"2"},
    {"label":"(GMT+02:00) Cairo","value":"2"},
    {"label":"(GMT+02:00) Harare, Pretoria","value":"2"},
    {"label":"(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius","value":"2"},
    {"label":"(GMT+02:00) Jerusalem","value":"2"},
    {"label":"(GMT+02:00) Minsk","value":"2"},
    {"label":"(GMT+02:00) Windhoek","value":"2"},
    {"label":"(GMT+03:00) Kuwait, Riyadh, Baghdad","value":"3"},
    {"label":"(GMT+03:00) Moscow, St. Petersburg, Volgograd","value":"3"},
    {"label":"(GMT+03:00) Nairobi","value":"3"},
    {"label":"(GMT+03:00) Tbilisi","value":"3"},
    {"label":"(GMT+03:30) Tehran","value":"3.5"},
    {"label":"(GMT+04:00) Abu Dhabi, Muscat","value":"4"},
    {"label":"(GMT+04:00) Baku","value":"4"},
    {"label":"(GMT+04:00) Yerevan","value":"4"},
    {"label":"(GMT+04:30) Kabul","value":"4.5"},
    {"label":"(GMT+05:00) Yekaterinburg","value":"5"},
    {"label":"(GMT+05:00) Islamabad, Karachi, Tashkent","value":"5"},
    {"label":"(GMT+05:30) Sri Jayawardenapura","value":"5.5"},
    {"label":"(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi","value":"5.5"},
    {"label":"(GMT+05:45) Kathmandu","value":"5.75"},
    {"label":"(GMT+06:00) Almaty, Novosibirsk","value":"6"},{"label":"(GMT+06:00) Astana, Dhaka","value":"6"},
    {"label":"(GMT+06:30) Yangon (Rangoon)","value":"6.5"},
    {"label":"(GMT+07:00) Bangkok, Hanoi, Jakarta","value":"7"},
    {"label":"(GMT+07:00) Krasnoyarsk","value":"7"},
    {"label":"(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi","value":"8"},
    {"label":"(GMT+08:00) Kuala Lumpur, Singapore","value":"8"},
    {"label":"(GMT+08:00) Irkutsk, Ulaan Bataar","value":"8"},
    {"label":"(GMT+08:00) Perth","value":"8"},
    {"label":"(GMT+08:00) Taipei","value":"8"},
    {"label":"(GMT+09:00) Osaka, Sapporo, Tokyo","value":"9"},
    {"label":"(GMT+09:00) Seoul","value":"9"},
    {"label":"(GMT+09:00) Yakutsk","value":"9"},
    {"label":"(GMT+09:30) Adelaide","value":"9.5"},
    {"label":"(GMT+09:30) Darwin","value":"9.5"},
    {"label":"(GMT+10:00) Brisbane","value":"10"},
    {"label":"(GMT+10:00) Canberra, Melbourne, Sydney","value":"10"},
    {"label":"(GMT+10:00) Hobart","value":"10"},
    {"label":"(GMT+10:00) Guam, Port Moresby","value":"10"},
    {"label":"(GMT+10:00) Vladivostok","value":"10"},
    {"label":"(GMT+11:00) Magadan, Solomon Is., New Caledonia","value":"11"},
    {"label":"(GMT+12:00) Auckland, Wellington","value":"12"},
    {"label":"(GMT+12:00) Fiji, Kamchatka, Marshall Is.","value":"12"},
    {"label":"(GMT+13:00) Nuku'alofa","value":"13"}
  ]

  function loadGoogleMaps(){
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src","https://maps.google.com/maps/api/js?libraries=places&callback=gMapsCallback&key=" + process.env.GOOGLE_MAPS_KEY);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  }

  $window.gMapsCallback = function() {
    $scope.map = null;
    $scope.marker = null;
    $scope.latLng = new google.maps.LatLng(-23.563068, -46.654433);
    $scope.zoom = 14;

    if(vm.account.latitude && vm.account.longitude) {
      $scope.latLng = new google.maps.LatLng(vm.account.latitude, vm.account.longitude);
    }

    $scope.map = new google.maps.Map(document.getElementById("map"), {
      center: $scope.latLng,
      zoom: $scope.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      draggable: true
    });

    $scope.marker = new google.maps.Marker({
      map: $scope.map,
      position: $scope.latLng
    });

    var geocomplete = document.getElementById('formatted_address');
    var searchBox   = new google.maps.places.SearchBox(geocomplete);

    geocomplete.value = vm.account.formatted_address || "";

    $scope.map.addListener('bounds_changed', function() {
      searchBox.setBounds($scope.map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      $scope.marker.setMap(null);
      $scope.marker = null;

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        $scope.marker = new google.maps.Marker({
          map: $scope.map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        });

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }

        vm.account.latitude                = place.geometry.location.lat();
        vm.account.longitude                = place.geometry.location.lng();
        vm.account.formatted_address  = place.formatted_address;

        for(var i in place.address_components) {
          var component = place.address_components[i];

          for(var t in component.types) {
            switch(component.types[t]) {
              case 'route':
                vm.account.street_address = component.long_name;
                break;
              case 'sublocality_level_1':
                vm.account.neighborhood = component.long_name;
                break;
              case 'locality':
                vm.account.city = component.long_name;
                break;
              case 'administrative_area_level_1':
                vm.account.state = component.short_name;
                break;
              case 'postal_code':
                vm.account.postal_code = component.long_name;
                break;
              case 'country':
                vm.account.country = component.short_name;
                break;
            }
          }
        }
      });

      $scope.map.fitBounds(bounds);
      $scope.map.setZoom(16);
    });
  }

  $scope.$on("$viewContentLoaded", function(evt) {
    if (!window.google || !google.maps || !google.maps.places) {
      loadGoogleMaps();
    }
  });

  // upload on file select or drop
  function _uploadAvatar(file) {
    Upload.upload({
      url: 'api/accounts/avatar',
      method: 'POST',
      data: { avatar: file }
    }).then(({ data: { url, errors } }) => {
      if (errors) {
        SweetAlert.swal('Atenção', errors, 'error')
      } else {
        $rootScope.avatar_url = vm.account.avatar_url = `${url}?v=${new Date().getTime()}`
        localStorage.setItem('acc_data', JSON.stringify(vm.account))
      }
    }, ({ data: { errors } }) => {
      SweetAlert.swal('Atenção', (errors || 'Ocorreu uma falha de comunicação com o serviço!'), 'error')
    }, evt => {
      // do something
    })
  }

  function _submit(form) {
    if(form.$valid) {
      Account.updateMe(vm.account, (res) => {
        localStorage.setItem('acc_data', JSON.stringify(res))
        SweetAlert.swal({
          title: 'Pronto',
          text: 'Dados atualizados com sucesso',
          type: 'success'
        }, () => window.location.reload())
      }, () => 
        SweetAlert.swal('Atenção', (catched.data.error || 'Ocorreu uma falha na comunicação com o serviço'), 'error')
      );
    }
  }
}

angular.module('sistemizedental').controller("SettingsAccountCtrl", SettingsAccountCtrl);