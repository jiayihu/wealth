(function() {
  var retirementModule = {
    config: {
      wrapper: 'retirement-wrapper',
      jsonUrl: 'scripts/model/actions.json'
    },

    init: function() {
      retirementModule.wrapper = document.getElementsByClassName(retirementModule.config.wrapper)[0];
      retirementModule.loadJson(retirementModule.config.jsonUrl);
    },

    loadJson: function(jsonUrl) {
      var request = new XMLHttpRequest();
      request.open('GET', jsonUrl, true);
      request.onload = function() {
        if(request.status >=200 && request.status < 400) {
          retirementModule.data = JSON.parse(request.responseText);
          retirementModule.createActions();

          //Tooltips
          $('.retirement-wrapper .zmdi-info-outline').tooltip();

          //Update the model when 'Continue' is pressed
          retirementModule.continueButton = retirementModule.wrapper.getElementsByClassName('continue')[0];
          retirementModule.continueButton.addEventListener('click', retirementModule.updateModel);
        } else {
          console.log('Error with the connection.');
        }
      };
      request.onerror = function() {
        console.log('Error with the connection.');
      };
      request.send();
    },

    createActions: function() {
      var tbody = retirementModule.wrapper.getElementsByTagName('tbody')[0],
        row;

      retirementModule.data.actions.forEach(function(element, index) {
        row = document.createElement('tr');
        row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
          '<td>' + element.todo + '</td>' +
          '<td>' + element.todonot + '</td>' +
          '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
          tbody.appendChild(row);
      });

      retirementModule.checkEventListener();
    },

    checkEventListener: function() {
      var checks = retirementModule.wrapper.getElementsByClassName('zmdi-check-circle');
      Array.prototype.forEach.call(checks, function(element) {
        element.addEventListener('click', function() {
          this.classList.toggle('saved');
        });
      });
    },

    updateModel: function() {
      gModel.savedActions = [];
      var checkedActions = retirementModule.wrapper.getElementsByClassName('saved');
      Array.prototype.forEach.call(checkedActions, function(element) {
        gModel.savedActions.push(retirementModule.data.actions[parseInt(element.dataset.action)]);
      });
      console.log(gModel.savedActions);
    }

  };

})();
