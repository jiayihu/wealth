app.views.goal = (function($) {
  var configMap = {
    goalsWrapper: 'goals',
    pickedGoalsWrapper: 'picked-goals',
    $tooltips: '.goal__details > span',
    toggleButtons: 'toggle-goal',
    pickedGoals: 'picked-goals',
    datepicker: '.goal__date__picker'
  };

  var container, toggleButtons;

  var goalTemplate =
    '<div class="goal goal--{{id}} {{picked}}">' +
      '<div class="goal__details">' +
        '<p class="goal__title">{{title}}</p>' +
        '<span class="goal__date" data-placement="bottom" data-toggle="tooltip" title="Expected achievement date based on your data">' +
          '<i class="zmdi zmdi-calendar-alt"></i>' +
          '<span>{{date}}</span>' +
        '</span>' +
        '<span class="goal__success" data-placement="bottom" data-toggle="tooltip" title="Expected achievement probability based on your data">' +
          '<i class="zmdi zmdi-chart"></i>' +
          '<span>{{probability}}</span>' +
        '</span>' +
      '</div>' +
      '<i class="toggle-goal add-goal zmdi zmdi-plus-circle" data-goal="{{id}}"></i>' +
    '</div>';
  var pickedGoalTemplate =
    '<div class="picked picked--{{id}} {{picked}}">' +
      '<div class="picked__details">' +
        '<div class="dragger"></div>' +
        '<p class="picked__title">{{title}}</p>' +
        '<p class="picked__date">' +
          '<i class="zmdi zmdi-calendar-alt"></i>' +
          '<input class="goal__date__picker" type="text" value="{{date}}" readonly>' +
          '<i class="zmdi zmdi-edit"></i>' +
        '</p>' +
        '<p class="picked__success"><i class="zmdi zmdi-chart"></i>{{probability}}</p>' +
      '</div>' +
      '<i class="toggle-goal delete-goal zmdi zmdi-minus-circle" data-goal="{{id}}"></i>' +
    '</div>';

  /**
   * PRIVATE FUNCTIONS
   */

  var showListGoals = function(goalsList, pickedGoals) {
    var view = '';
    var template = '';

    goalsList.forEach(function(goal) {
      var goalHide = ''; // 'goal--hide' css class
      var isPicked = pickedGoals.find(function(value) {
        return value.id === goal.id;
      });

      if(isPicked) {
        goalHide = 'goal--hide';
      }

      template = goalTemplate;

      template = template.replace(/{{id}}/g, goal.id);
      template = template.replace('{{title}}', goal.title);
      template = template.replace('{{picked}}', goalHide);
      template = template.replace('{{date}}', goal.date);
      template = template.replace('{{probability}}', goal.probability);

      view += template;
    });

    container.getElementsByClassName(configMap.goalsWrapper)[0].innerHTML = view;
  };

  var showPickedGoals = function(goalsList, pickedGoals) {
    var view = '';
    var template = '';

    goalsList.forEach(function(goal) {
      var pickedShow = ''; // 'picked--show' css class
      var isPicked = pickedGoals.find(function(value) {
        return value.id === goal.id;
      });

      if(isPicked) {
        pickedShow = 'picked--show';
      }

      template = pickedGoalTemplate;

      template = template.replace(/{{id}}/g, goal.id);
      template = template.replace('{{title}}', goal.title);
      template = template.replace('{{picked}}', pickedShow);
      template = template.replace('{{date}}', goal.date);
      template = template.replace('{{probability}}', goal.probability);

      view += template;
    });

    container.getElementsByClassName(configMap.pickedGoalsWrapper)[0].innerHTML = view;
  };

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
            id: goalName,
            date: date
          });
        });
      });
    }
  };

  var init = function(initContainer, goalsList, pickedGoals) {
    container = initContainer;

    //Show list of goals to be picked and already picked
    showListGoals(goalsList, pickedGoals);
    showPickedGoals(goalsList, pickedGoals);

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
    init: init,
    showListGoals: showListGoals
  };

})($);
