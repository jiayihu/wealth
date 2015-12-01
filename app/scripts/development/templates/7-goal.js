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
    container.getElementsByClassName('picked--' + picked)[0].classList.add('picked--show');
    container.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
  };

  var hidePickedGoal = function() {
    var goal = this.dataset.goal;
    container.getElementsByClassName('picked--' + goal)[0].classList.remove('picked--show');
    container.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
  };

  var updateModel = function() {
    gModel.pickedGoals = [];
    var pickedGoals = container.getElementsByClassName('picked--show');

    Array.prototype.forEach.call(pickedGoals, function(element) {
      gModel.pickedGoals.push({
        name: element.lastElementChild.dataset.goal,
        date: element.getElementsByClassName('goal__date__picker')[0].value
      });
    });
  };

  var init = function(container) {
    container = container;
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

    //Update the model when 'Continue' is pressed
    var continueButton = container.getElementsByClassName('continue')[0];
    continueButton.addEventListener('click', updateModel);
  };

  return {
    init: init
  };

})();
