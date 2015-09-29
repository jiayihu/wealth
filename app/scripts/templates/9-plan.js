(function() {
  var actionTitles = document.getElementsByClassName('action__title');
  for(var i=0; i < actionTitles.length; i++) {
    actionTitles[i].addEventListener('click', function() {
      this.firstElementChild.classList.toggle('rotate');
    });
  }

  $('.plan-wrapper .fa-info-circle').popover({
    placement: 'left'
  });

  $('.plan-wrapper .fa-calendar').daterangepicker({
    singleDatePicker: true
  });

})();
