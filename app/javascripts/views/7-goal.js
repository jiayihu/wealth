/**
 * Screen #7 - Goal module
 * @module 7-Goal
 */

'use strict';

var $ = require('jQuery');
var dragula = require('dragula');

var configMap = {
  goalsWrapper: 'goals',
  pickedGoalsWrapper: 'picked-goals',
  $tooltips: '.goal__details > span',
  toggleButtons: 'toggle-goal',
  pickedGoals: 'picked-goals',
  datepicker: '.goal__date__picker'
};

var container, toggleButtons;


///////////////
// TEMPLATES //
///////////////

/**
 * Templates for goals to be picked and the picked one. We are using templates
 * here in Javascript instead of putting it directly into HTML files because
 * it's easier to generate and manipulate them dinamically based on the Model.
 * @type {string}
 */
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


///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

/**
 * Generates the HTML list of goals to be picked. If the goal is already picked
 * we add a CSS class to hide it. In this way it's faster to hide/show goals in
 * both lists (to be picked & already picked) when the user interacts and moreover
 * we avoid recreating DOM for the goals each time.
 * @param  {array} goalsList List of available goals
 * @param  {array} pickedGoals Goals already picked by the user
 * @return {string}
 */
var getListGoals = function(goalsList, pickedGoals) {
  var view = '';
  var template = '';

  goalsList.forEach(function(goal) {
    var goalHide = ''; // 'goal--hide' css class
    var isPicked = pickedGoals.find(function(value) {
      return value.id === goal.id;
    });

    if (isPicked) {
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

  return view;
};

/**
 * Generates the HTML list of goals already picked by the user. If the goal is
 * not already picked we don't add a CSS class and it remains hidden.
 * @param  {array} goalsList List of available goals
 * @param  {array} pickedGoals Goals already picked by the user
 * @return {string}
 */
var getPickedGoals = function(goalsList, pickedGoals) {
  var view = '';
  var template = '';

  goalsList.forEach(function(goal) {
    var pickedShow = ''; // 'picked--show' css class
    var isPicked = pickedGoals.find(function(value) {
      return value.id === goal.id;
    });

    if (isPicked) {
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

  return view;
};



//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if (event === 'goalToggled') {
    /**
     * Every time a button to add/remove a goal (in both lists) is clicked
     * we toggle the visibility of the goal and call the shell's function to
     * update the Model
     */
    toggleButtons.forEach(function(element) {
      /* @FIXME This could need an improvement with 'Event Delegation' if the
        number of goals increase because we are adding an Event Listener to each
        goal */
      element.addEventListener('click', function() {
        var goalName = this.dataset.goal;
        var toggledGoal = container.get('picked--' + goalName);
        var date = toggledGoal.querySelector(configMap.datepicker).value;

        toggledGoal.classList.toggle('picked--show');
        container.get('goal--' + goalName).classList.toggle('goal--hide');

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
  var goalsView = getListGoals(goalsList, pickedGoals);
  container.get(configMap.goalsWrapper).innerHTML = goalsView;
  var pickedView = getPickedGoals(goalsList, pickedGoals);
  container.get(configMap.pickedGoalsWrapper).innerHTML = pickedView;

  //Create tooltips (Bootstrap)
  $(configMap.$tooltips).tooltip();

  //Buttons to add and delete goals
  toggleButtons = container.getAll(configMap.toggleButtons);

  //Implement drag & drop picked goals
  var pickedContainer = container.get(configMap.pickedGoals);
  dragula([pickedContainer]);

  //Datepicker
  $(configMap.datepicker).datepicker({
    autoclose: true,
    format: 'M d yyyy'
  });
};

module.exports = {
  bind: bind,
  init: init
};
