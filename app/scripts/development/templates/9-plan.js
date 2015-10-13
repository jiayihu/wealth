(function() {
  var planModule = {
    config: {
      wrapper: 'plan-wrapper',
      actionTitleClasses: 'action__title',
      popoverClasses: '.plan-wrapper .zmdi-info-outline',
      datepickerClasses: '.plan-wrapper .zmdi-calendar-alt'
    },

    init: function() {
      planModule.wrapper = document.getElementsByClassName(planModule.config.wrapper)[0];

      //Popover
      $(planModule.popoverClasses).popover({
        placement: 'left'
      });

      //Datepickers
      $(planModule.config.datepickerClasses)
        .datepicker({
          autoclose: true,
          format: 'M d yyyy'
        })
        .on('changeDate', function(event) {
          this.dataset.date = event.format();
        });

      var printButton = planModule.wrapper.getElementsByClassName('print')[0];
      printButton.addEventListener('click', planModule.printPlan);

      planModule.rotateChevron();
    },

    printPlan: function() {
      var printPage = document.createElement('div'),
        html = '<h1 class="text-center">Your Action Plan</h1>';

      printPage.classList.add('print-page');

      var planActions = [
        {
          title: 'Play a stay-cation',
          type: 'Variable expense',
          date: 'November 28th 2016',
          details: 'Bank what you save'
        },
        {
          title: 'Play a stay-cation',
          type: 'Variable expense',
          date: 'November 28th 2016',
          details: 'Bank what you save'
        },
        {
          title: 'Play a stay-cation',
          type: 'Variable expense',
          date: 'November 28th 2016',
          details: 'Bank what you save'
        },
        {
          title: 'Play a stay-cation',
          type: 'Variable expense',
          date: 'November 28th 2016',
          details: 'Bank what you save'
        },
        {
          title: 'Play a stay-cation',
          type: 'Variable expense',
          date: 'November 28th 2016',
          details: 'Bank what you save'
        }
      ];

      var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
        tBody = '<tbody>';

        for(var i = 0; i < planActions.length; i++) {
          tBody += '<tr><td>' + planActions[i].title + '</td>' +
            '<td>' + planActions[i].type + '</td>' +
            '<td>' + planActions[i].date + '</td>' +
            '<td>' + planActions[i].details + '</td><tr>';
        }

        tBody += '</tbody></table>';
        html += tHead + tBody;

        printPage.innerHTML = html;
        document.body.appendChild(printPage);
        document.body.classList.add('no-print');

        window.print();

        document.body.classList.remove('no-print');
        printPage.innerHTML = '';
    },

    rotateChevron: function() {
      var actionTitles = document.getElementsByClassName(planModule.config.actionTitleClasses);
      Array.prototype.forEach.call(actionTitles, function(element) {
        element.addEventListener('click', function() {
          this.firstElementChild.classList.toggle('rotate');
        });
      });
    }
  };

  planModule.init();

})();
