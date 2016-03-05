'use strict';

var viewsNames = [
  'about',
  'you',
  'pyramid',
  'scenarios',
  'goal',
  'retirement',
  'plan'
];
var views = [
  require('./views/about'),
  require('./views/expenses'),
  require('./views/comparison'),
  require('./views/scenarios'),
  require('./views/goal'),
  require('./views/retirement'),
  require('./views/plan'),
  require('./views/nav'),
  require('./views/continue')
];

var getViews = function() {
  return views;
};

var init = function() {
  views.forEach(function(view, index) {
    var container = index < 7? document.get(viewsNames[index] + '-wrapper') : null;
    view.setStateMap(container);
  });
};

module.exports = {
  init: init,
  getViews: getViews
};