Array.prototype.groupBy = function(properties) {
  // Armazena os grupos de elementos
  var groups = []; 

  // Interage com cada item da array original
  this.forEach(function(item){

    // Verifica se o item está alocado em algum grupo
    var added = groups.some(function(group){
      // Verifica se o item está alocado nesse grupo
      var shouldAdd = properties.every(function(prop){
        return (group[0][prop] === item[prop]);
      });

      // Adiciona o item a esse grupo
      if (shouldAdd) {
        group.push(item);
      }

      // Sai do loop quando o item já é 
      // adicionado, canso contrario continua o loop
      return shouldAdd;
    });

    // Se nenhum grupo foi encontrado, um novo é criado com o mesmo item
    if (!added) {
      groups.push( [item] );
    }
  });

  return groups;
};

/**
 * Cria um range de horas baseado em uma hora inicial
 * e uma hora final dentro de um intervalo recebido.
 * 
 * @param  {[type]} start    [description]
 * @param  {[type]} end      [description]
 * @param  {[type]} interval [description]
 * @return {[type]}          [description]
 */
function rangeHours(start_time, end_time, interval) {
  var start = start_time.split(':').map(Number);
  var end   = end_time.split(':').map(Number);


  var res   = [];
  var times = [];

  while (!(start[0] > end[0] && start[1] >= end[1])) {
    times.push((start[0] < 10 ? '0' + start[0] : start[0]) + 
      ':' + (start[1] < 10 ? '0' + start[1] : start[1]));

    start[1] += interval;

    if (start[1] > 59) {
      start[0] += 1;
      start[1] %= 60;
    }
  }

  for (var i = 0; i < times.length; i++) {
    res.push({
      value: times[i] + ":00",
      label: times[i]
    });
  }

  return res;
}

/**
 * Função que cria uma lista de intervalos
 * 
 * @param  {[type]} interval [description]
 * @return {[type]}          [description]
 */
function durationTimes(interval) {
  var times = [];
  var start = interval;

  while(start <= 720) {
    var value   = "";
    var hours   = parseInt(start / 60);
    var minutes = parseInt(start - (hours * 60));

    if (hours == 1) {
      value = "1 hora";
    } else if (hours > 1) {
      value = hours + " horas";
    }

    value += (hours > 0 && minutes > 0) ? " e " : "";

    if (minutes > 0) {
      value += minutes + " minutos";
    }

    times.push({ id: "" + start, value: value });
    start = start + interval;
  }

  return times;
}