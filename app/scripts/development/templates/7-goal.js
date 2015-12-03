app.views.goal = (function() {
  var configMap = {
    tooltipsClass: '.goal__details > span',
    addButtonsClass: 'add-goal',
    deleteButtonsClass: 'delete-goal',
    pickedGoalsClass: 'picked-goals',
    datepickerClass: '.goal__date__picker'
  };

  var container;

  var displayPickedGoal = function() {
    var picked = this.dataset.picked;
    var pickedGoal = container.getElementsByClassName('picked--' + picked)[0];
    pickedGoal.classList.add('picked--show');
    container.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
    var date = pickedGoal.querySelector(configMap.datepickerClass).value;
    wealthApp.model.toggleGoal({
      name: picked,
      date: date
    });
  };

  var hidePickedGoal = function() {
    var goal = this.dataset.goal;
    var removedGoal = container.getElementsByClassName('picked--' + goal)[0];
    removedGoal.classList.remove('picked--show');
    container.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
    wealthApp.model.toggleGoal({
      name: goal
    });
  };

  var init = function(initContainer) {
    container = initContainer;
    //Create tooltips
    $(configMap.tooltipsClass).tooltip();

    //Buttons to add and delete goals
    var addButtons = container.getElementsByClassName(configMap.addButtonsClass);
    Array.prototype.forEach.call(addButtons, function(element) {
      element.addEventListener('click', displayPickedGoal);
    });

    var deleteButtons = container.getElementsByClassName(configMap.deleteButtonsClass);
    Array.prototype.forEach.call(deleteButtons, function(element) {
      element.addEventListener('click', hidePickedGoal);
    });

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
    init: init
  };

})();
