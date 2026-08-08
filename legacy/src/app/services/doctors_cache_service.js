DoctorsCacheService.$inject = ['$q', 'Doctor'];
function DoctorsCacheService($q, Doctor) {

  /**
   * Verifica se as informaçẽos estão armazenadas
   * em cache, e retorna uma promise do resultado,
   */
  function _getDoctors() {
    var _json = sessionStorage.getItem('account_list_cached');

    if(Array.isArray(_json) && _json.length > 0) {
      return $q.resolve( angular.fromJson(_json) );
    } else {
      return _updateCache();
    }
  }

  /**
   * Atualiza o cache de doutores
   */
  function _updateCache() {
    var $defered = $q.defer();

    // Busca todos doutores
    Doctor.query({ active: 1 },function(result) {
      if(result.rows) {
        var json = angular.toJson(result.rows);
        sessionStorage.setItem('account_list_cached', json);

        $defered.resolve(result.rows);
      } else {
        $defered.reject(result.error);
      }
    }, function() {
      $defered.reject("Ocorreu uma falha de comunicação com o serviço");
    });

    return $defered.promise;
  }

  return {
    getDoctors: _getDoctors,
    updateCache: _updateCache
  };
}

angular.module('sistemizedental').service("DoctorsCache", DoctorsCacheService);