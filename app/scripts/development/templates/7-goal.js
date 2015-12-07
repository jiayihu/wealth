app.views.goal = (function() {
  var configMap = {
    tooltipsClass: '.goal__details > span',
    toggleButtonsClass: 'toggle-goal',
    pickedGoalsClass: 'picked-goals',
    datepickerClass: '.goal__date__picker'
  };

  var container, toggleButtons;

  /**
   * PUBLIC FUNCTIONS
   */

  var bind = function(event, handler) {
    if(event === 'goalToggled') {
      toggleButtons.forEach(function(element) {
        element.addEventListener('click', function() {
          var goalName = this.dataset.goal;
          var toggledGoal = container.getElementsByClassName('picked--' + goalName)[0];
          toggledGoal.classList.toggle('picked--show');
          container.getElementsByClassName('goal--' + goalName)[0].classList.toggle('goal--hide');
          var date = toggledGoal.querySelector(configMap.datepickerClass).value;
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
    $(configMap.tooltipsClass).tooltip();

    //Buttons to add and delete goals
    toggleButtons = container.getElementsByClassName(configMap.toggleButtonsClass);

    //Implement drag & drop picked goals
    var pickedContainer = container.getElementsByClassName(configMap.pickedGoalsClass)[0];
    dragula([pickedContainer]);

    //Datepicker
    $(configMap.datepickerClass).datepicker({
      autoclose: true,
      format: 'M d yyyy'
    });
  };

  return {
    bind: bind,
    init: init
  };

})();
