/**
 * Screen #7 - Goal module
 * @module 7-Goal
 */

'use strict';

var helpers = require('../helpers');
var $ = require('jQuery');
var dragula = require('dragula');

var configMap = {
  toggleButtons: 'toggle-goal',
  datepicker: '.goal__date__picker'
};

var stateMap = {
  freeGoals: null,
  pickedGoals: null,
  toggleButtons: null
};


///////////////
// TEMPLATES //
///////////////

/**
 * Templates for goals to be picked and the picked one. We are using templates
 * here in Javascript instead of putting it directly into HTML files because
 * it's easier to generate and manipulate them dinamically based on the Model.
 * @type {string}
 */
var freeGoalTemplate =
  '<div class="goal goal--{id} {picked}">' +
    '<div class="goal__details">' +
      '<p class="goal__title">{title}</p>' +
      '<span class="goal__date" data-placement="bottom" data-toggle="tooltip" title="Expected achievement date based on your data">' +
        '<i class="zmdi zmdi-calendar-alt"></i>' +
        '<span>{date}</span>' +
      '</span>' +
      '<span class="goal__success" data-placement="bottom" data-toggle="tooltip" title="Expected achievement probability based on your data">' +
        '<i class="zmdi zmdi-chart"></i>' +
        '<span>{probability}</span>' +
      '</span>' +
    '</div>' +
    '<i class="toggle-goal add-goal zmdi zmdi-plus-circle" data-goal="{id}"></i>' +
  '</div>';
var pickedGoalTemplate =
  '<div class="picked picked--{id} {picked}">' +
    '<div class="picked__details">' +
      '<div class="dragger"></div>' +
      '<p class="picked__title">{title}</p>' +
      '<p class="picked__date">' +
        '<i class="zmdi zmdi-calendar-alt"></i>' +
        '<input class="goal__date__picker" type="text" value="{date}" readonly>' +
        '<i class="zmdi zmdi-edit"></i>' +
      '</p>' +
      '<p class="picked__success"><i class="zmdi zmdi-chart"></i>{probability}</p>' +
    '</div>' +
    '<i class="toggle-goal delete-goal zmdi zmdi-minus-circle" data-goal="{id}"></i>' +
  '</div>';

/*
 * Generates the HTML list of goals to be picked. If the goal is already picked
 * we add a CSS class to hide it. In this way it's faster to hide/show goals in
 * both lists (to be picked & already picked) when the user interacts and moreover
 * we avoid recreating DOM for the goals each time.
 * @param  {array} goalsList List of available goals
 * @param  {array} pickedGoals Goals already picked by the user
 * @return {string}
 */
var getListGoals = function(goalsList, pickedGoals, template, className) {
  var view = '';

  goalsList.forEach(function(goal) {
    var goalClassName = '';
    var isPicked = pickedGoals.find(function(pickedGoal) {
      return pickedGoal.id === goal.id;
    });

    if (isPicked) {
      goalClassName = className;
    }

    view += helpers.template(template, {
      id: goal.id,
      title: goal.title,
      picked: goalClassName,
      date: goal.date,
      probability: goal.probability
    });
  });

  return view;
};


//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showGoals = function(data) {
  var goalsList = data.goalsList;
  var pickedGoals = data.pickedGoals;

  if( !Array.isArray(goalsList) || !Array.isArray(pickedGoals) ) {
    helpers.makeError('params', data);
  }

  var freeGoalsView = getListGoals(goalsList, pickedGoals, freeGoalTemplate, 'goal--hide');
  var pickedGoalsView = getListGoals(goalsList, pickedGoals, pickedGoalTemplate, 'picked--show');
  stateMap.freeGoals.innerHTML = freeGoalsView;
  stateMap.pickedGoals.innerHTML = pickedGoalsView;
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
    stateMap.toggleButtons.forEach(function(element) {
      /* @FIXME This could need an improvement with 'Event Delegation' if the
        number of goals increase because we are adding an Event Listener to each
        goal */
      element.addEventListener('click', function() {
        var goalName = this.dataset.goal;
        var toggledGoal = stateMap.pickedGoals.get('picked--' + goalName);
        var date = toggledGoal.querySelector(configMap.datepicker).value;

        toggledGoal.classList.toggle('picked--show');
        stateMap.freeGoals.get('goal--' + goalName).classList.toggle('goal--hide');

        handler({
          id: goalName,
          date: date
        });
      });
    });
  }
};

var setStateMap = function(container) {
  stateMap.freeGoals = container.get('goals');
  stateMap.pickedGoals = container.get('picked-goals');

  stateMap.toggleButtons = container.getAll(configMap.toggleButtons);
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showGoals':
      showGoals(data);
      break;
    case 'createTooltips':
      $('.goal__details > span').tooltip();
      break;
    case 'setDragDrop':
      dragula([stateMap.pickedGoals]);
      break;
    case 'createDatepickers':
      $(configMap.datepicker).datepicker({
        autoclose: true,
        format: 'M d yyyy'
      });
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};
