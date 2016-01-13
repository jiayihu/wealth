app.views.goal = (function() {
  var configMap = {
    $tooltips: '.goal__details > span',
    toggleButtons: 'toggle-goal',
    pickedGoals: 'picked-goals',
    datepicker: '.goal__date__picker'
  };

  var container, toggleButtons;

  var goalTemplate
    = '<div class="goal goal--college">' +
        '<div class="goal__details">' +
          '<p class="goal__title">Save for college</p>' +
          '<span class="goal__date" data-placement="bottom" data-toggle="tooltip" title="Expected achievement date based on your data">' +
            '<i class="zmdi zmdi-calendar-alt"></i>' +
            '<span>January 2018</span>' +
          '</span>' +
          '<span class="goal__success" data-placement="bottom" data-toggle="tooltip" title="Expected achievement probability based on your data">' +
            '<i class="zmdi zmdi-chart"></i>' +
            '<span>85%</span>' +
          '</span>' +
        '</div>' +
        '<i class="toggle-goal add-goal zmdi zmdi-plus-circle" data-goal="college"></i>' +
      '</div>';

  /**
   * PUBLIC FUNCTIONS
   */

  var bind = function(event, handler) {
    if(event === 'goalToggled') {
      toggleButtons.forEach(function(element) {
        element.addEventListener('click', function() {
          var goalName = this.dataset.goal;
          var toggledGoal = container.getElementsByClassName('picked--' + goalName)[0];
          var date = toggledGoal.querySelector(configMap.datepicker).value;

          toggledGoal.classList.toggle('picked--show');
          container.getElementsByClassName('goal--' + goalName)[0].classList.toggle('goal--hide');

          handler({
            name: goalName,
            date: date
          });
        });
      });
    }
  };

  var init = function(initContainer) {
    container = initContainer;
    //Create tooltips
    $(configMap.$tooltips).tooltip();

    //Buttons to add and delete goals
    toggleButtons = container.getElementsByClassName(configMap.toggleButtons);

    //Implement drag & drop picked goals
    var pickedContainer = container.getElementsByClassName(configMap.pickedGoals)[0];
    dragula([pickedContainer]);

    //Datepicker
    $(configMap.datepicker).datepicker({
      autoclose: true,
      format: 'M d yyyy'
    });
  };

  return {
    bind: bind,
    init: init
  };

})();
