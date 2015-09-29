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

})();
