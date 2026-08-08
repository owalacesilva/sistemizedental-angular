ExpedientFactory.$inject = ['$resource'];
function ExpedientFactory($resource) {
  return $resource( 'api/expedients/:id', 
    { 
      id: '@id' 
    }, {
      query: {
        method: 'GET',
        isArray: false
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"
        },
        transformRequest: function (data, headersGetter) {
          // Formata os dias da semana
          var formData = new Array();
          for(var i = 0; i < data.weekday.length; i++) {
            var day = data.weekday[i];

            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][active]" + "=" + encodeURIComponent(day.active));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][start_time]" + "=" + encodeURIComponent(day.start_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][end_time]" + "=" + encodeURIComponent(day.end_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][has_interval]" + "=" + encodeURIComponent(day.has_interval));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][interval_start_time]" + "=" + encodeURIComponent(day.interval_start_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][interval_end_time]" + "=" + encodeURIComponent(day.interval_end_time || ""));
          }

          formData.push("duration" + "=" + data.duration);
          formData.push("title" + "=" + data.title);

          return formData.join("&");
        }
      },
      update: {
        method: 'PUT',
        headers: {
          'Content-Type': "application/x-www-form-urlencoded"
        },
        transformRequest: function (data, headersGetter) {
          // Formata os dias da semana
          var formData = new Array();
          for(var i = 0; i < data.weekday.length; i++) {
            var day = data.weekday[i];

            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][active]" + "=" + encodeURIComponent(day.active));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][start_time]" + "=" + encodeURIComponent(day.start_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][end_time]" + "=" + encodeURIComponent(day.end_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][has_interval]" + "=" + encodeURIComponent(day.has_interval));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][interval_start_time]" + "=" + encodeURIComponent(day.interval_start_time || ""));
            formData.push("weekday[" + encodeURIComponent(day.weekday) + "][interval_end_time]" + "=" + encodeURIComponent(day.interval_end_time || ""));
          }

          formData.push("duration" + "=" + data.duration);
          formData.push("title" + "=" + data.title);

          return formData.join("&");
        }
      }
    }, {
      stripTrailingSlashes: true
    });
}

angular.module('sistemizedental').factory("Expedient", ExpedientFactory);