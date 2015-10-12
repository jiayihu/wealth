(function() {
  var goalModule = {
    config: {
      wrapper: 'goal-wrapper',
      tooltipsClass: '.goal__details > span',
      addButtonsClass: 'add-goal',
      deleteButtonsClass: 'delete-goal',
      pickedGoalsClass: 'picked-goals',
      datepickerClass: '.goal__date__picker'
    },

    init: function() {
      goalModule.wrapper = document.getElementsByClassName(goalModule.config.wrapper)[0];

      //Create tooltips
      $(goalModule.config.tooltipsClass).tooltip();

      //Buttons to add and delete goals
      var addButtons = goalModule.wrapper.getElementsByClassName(goalModule.config.addButtonsClass);
      Array.prototype.forEach.call(addButtons, function(element) {
        element.addEventListener('click', goalModule.displayPickedGoal);
      });

      var deleteButtons = goalModule.wrapper.getElementsByClassName(goalModule.config.deleteButtonsClass);
      Array.prototype.forEach.call(deleteButtons, function(element) {
        element.addEventListener('click', goalModule.hidePickedGoal);
      });

      //Implement drag & drop picked goals
      var pickedContainer = goalModule.wrapper.getElementsByClassName(goalModule.config.pickedGoalsClass)[0];
      dragula([pickedContainer]);

      //Datepicker
      $(goalModule.config.datepickerClass).datepicker({
        autoclose: true,
        format: 'M d yyyy'
      });

      //Update the model when 'Continue' is pressed
      goalModule.continueButton = goalModule.wrapper.getElementsByClassName('continue')[0];
      goalModule.continueButton.addEventListener('click', goalModule.updateModel);
    },

    displayPickedGoal: function() {
      var picked = this.dataset.picked;
      goalModule.wrapper.getElementsByClassName('picked--' + picked)[0].classList.add('picked--show');
      goalModule.wrapper.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
    },

    hidePickedGoal: function() {
      var goal = this.dataset.goal;
      goalModule.wrapper.getElementsByClassName('picked--' + goal)[0].classList.remove('picked--show');
      goalModule.wrapper.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
    },

    updateModel: function() {
      gModel.pickedGoals = [];
      var pickedGoals = goalModule.wrapper.getElementsByClassName('picked--show');

      Array.prototype.forEach.call(pickedGoals, function(element) {
        gModel.pickedGoals.push({
          name: element.lastElementChild.dataset.goal,
          date: element.getElementsByClassName('goal__date__picker')[0].value
        });
      });
      console.log(gModel.pickedGoals);
    }
  };

  goalModule.init();

})();
