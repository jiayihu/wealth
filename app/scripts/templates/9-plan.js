(function() {
  var actionTitles = document.getElementsByClassName('action__title');
  for(var i=0; i < actionTitles.length; i++) {
    actionTitles[i].addEventListener('click', function() {
      this.firstElementChild.classList.toggle('rotate');
    });
  }

  $('.plan-wrapper .zmdi-info-outline').popover({
    placement: 'left'
  });

  $('.plan-wrapper .zmdi-calendar-alt').daterangepicker({
    singleDatePicker: true
  });


  //Print page
  var printButton = document.getElementsByClassName('print')[0];
  printButton.addEventListener('click', function() {
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
  });

})();
