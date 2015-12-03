app.views.retirement = (function() {
  var configMap = {
    jsonUrl: 'scripts/model/actions.json'
  };

  /**
   * DOM FUNCTIONS
   */

   var createActions = function(data) {
     var docFragment = document.createDocumentFragment(),
     row;

     data.actions.forEach(function(element, index) {
       row = document.createElement('tr');
       row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
         '<td>' + element.todo + '</td>' +
         '<td>' + element.todonot + '</td>' +
         '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
         docFragment.appendChild(row);
     });
     return docFragment;
   };

   /**
    * EVENT HANDLERS
    */

  /**
   * PUBLIC FUNCTIONS
   */

  var init = function(container) {
    var request = new XMLHttpRequest();
    request.open('GET', configMap.jsonUrl, true);
    request.onload = function() {
      if(request.status >=200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        var tbody = container.getElementsByTagName('tbody')[0];
        tbody.appendChild(createActions(data));
        var checks = container.getElementsByClassName('zmdi-check-circle');
        checks.forEach(function(element) {
          element.addEventListener('click', function() {
            this.classList.toggle('saved');
            wealthApp.model.toggleActions(data.actions[parseInt(this.dataset.action)]);
          });
        });
        //Tooltips
        $('.retirement-wrapper .zmdi-info-outline').tooltip();
      } else {
        console.log('Error with the connection.');
      }
    };
    request.onerror = function() {
      console.log('Error with the connection.');
    };
    request.send();
  };

  return {
    init: init
  };

})();
