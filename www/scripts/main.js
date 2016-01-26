(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');
var model = require('./model');
var shell = require('./shell');

var init = function() {
  helpers.init();
  model.init('wealthApp');
  shell.init();
};

init();

},{"./helpers":5,"./model":6,"./shell":14}],2:[function(require,module,exports){
/**
 * Continue buttons module
 * @module continue
 */

'use strict';

var configMap = {
  continueClass: 'continue',
  navClass: 'nav'
};
var continueButtons;

/**
 * DOM FUNCTIONS
 */

var setActive = function(newActive, className) {
  var oldActive = document.getElementsByClassName(className)[0];
  oldActive.classList.remove(className);
  newActive.classList.add(className);
};

var activateNav = function() {
  var nav = document.getElementsByClassName(configMap.navClass)[0];
  var newActiveNavLink = nav.getElementsByClassName('active')[0].nextElementSibling;

  //Check if it is the last nav link, which doesn't have siblings
  if (newActiveNavLink) {
    //Activate the navigation item
    if (newActiveNavLink.classList.contains('disabled')) {
      newActiveNavLink.classList.remove('disabled');
    }
    setActive(newActiveNavLink, 'active');
    return newActiveNavLink;
  }

  return false;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'continueClicked') {
    continueButtons.forEach(function(element) {
      element.addEventListener('click', function() {
        var nextStep = this.dataset.template;
        var nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
        setActive(nextStepElement, 'show');
        var nextActiveNavLink = activateNav();
        handler(nextActiveNavLink);
      });
    });
  }
};

var init = function() {
  continueButtons = document.getElementsByClassName(configMap.continueClass);
};

module.exports = {
  bind: bind,
  init: init
};

},{}],3:[function(require,module,exports){
'use strict';

var toggleHandler = function(toggle) {
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    if (this.classList.contains('is-active')) {
      document.body.classList.remove('menu-open');
      this.classList.remove('is-active');
    } else {
      document.body.classList.add('menu-open');
      this.classList.add('is-active');
    }
  });
};

var init = function() {
  var toggle = document.querySelector('.c-hamburger');
  toggleHandler(toggle);
};

module.exports = {
  init: init
};

},{}],4:[function(require,module,exports){
var configMap = {
  blocking: true, //Whether steps should be disabled if not seen yet
  navClass: 'nav'
};
var nav;

var setActive = function(newActive, className) {
  var oldActive = document.getElementsByClassName(className)[0];
  oldActive.classList.remove(className);
  newActive.classList.add(className);
};

var onNavClick = function(e) {
  var nodeName = e.target.nodeName,
    nextStep, nextStepElement, clickedLink;

  //If it is the 'Reset Model' button
  if (nodeName === 'A') {
    return;
  }

  if (nodeName === 'SPAN') {
    nextStep = e.target.dataset.template;
    clickedLink = e.target.parentNode;
  } else if (nodeName === 'LI') {
    nextStep = e.target.firstElementChild.dataset.template;
    clickedLink = e.target;
  }
  if (!clickedLink.classList.contains('disabled') && configMap.blocking) {
    setActive(clickedLink, 'active');
    nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
    setActive(nextStepElement, 'show');
  }
};

/**
 * PUBLIC FUNCTIONS
 */

var init = function() {
  nav = document.getElementsByClassName(configMap.navClass)[0];
  nav.addEventListener('click', onNavClick);
};

/**
 * Adds 'disabled' class to navigation links from the item number 'start'
 * @param  {number} start Number of the first link to start with
 */
var setDisabledLinks = function(start) {
  var navItems = nav.getElementsByTagName('li');
  for (var i = start, len = navItems.length; i < len; i++) {
    navItems[i].classList.add('disabled');
  }
};

module.exports = {
  init: init,
  setDisabledLinks: setDisabledLinks
};

},{}],5:[function(require,module,exports){
/**
 * Helpers module
 * @module helpers
 */

'use strict';

var noUiSlider = require('nouislider');

var init = function() {
  /**
   *   JQUERY FUNCTIONS
   */

  // Get element(s) by CSS selector:
  window.qs = function(selector, scope) {
    return (scope || document).querySelector(selector);
  };
  window.qsa = function(selector, scope) {
    return (scope || document).querySelectorAll(selector);
  };

  // addEventListener wrapper:
  window.$on = function(target, type, callback, useCapture) {
    target.addEventListener(type, callback, !!useCapture);
  };

  // Find the element's parent with the given tag name:
  // $parent(qs('a'), 'div');
  window.$parent = function(element, tagName) {
    if (!element.parentNode) {
      return;
    }
    if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
      return element.parentNode;
    }
    return window.$parent(element.parentNode, tagName);
  };

  /**
   * [function description]
   * @param  {Function} callback Callback
   */
  window.$ready = function(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  };

  /**
   *   NO JQUERY FUNCTIONS
   */

  /**
   * Throws a new Error
   */
  window.makeError = function(name, msg, data) {
    var error = {};
    error.name = name;
    error.msg = msg;
    if (data) {
      error.data = data;
    }
    console.error(error.msg);
  };

  /**
   * Create a slider using noUiSlider
   * @param  {object} element HTML Node of the slider
   * @param  {object} options Slider options
   */
  window.createSlider = function(element, options) {
    if (typeof noUiSlider === 'undefined') {
      window.makeError('Nouislider', 'nouislider object is not declared.');
    }
    noUiSlider.create(element, options);
    element.handle = element.getElementsByClassName('noUi-handle')[0];
    element.tooltip = document.createElement('div');
    element.handle.appendChild(element.tooltip);

    element.tooltip.classList.add('slider-tooltip');
    element.tooltip.innerHTML = '<span></span>';
    element.tooltip = element.tooltip.firstElementChild;
  };

  /**
   * Set the configMap of the module - It goes deep in the object
   */
  window.setConfigMap = function(inputMap, configMap) {
    var key;

    for (key in inputMap) {
      if (configMap.hasOwnProperty(key)) {
        if (inputMap[key] instanceof Object) {
          window.setConfigMap(inputMap[key], configMap[key]);
        } else {
          configMap[key] = inputMap[key];
        }
      } else {
        window.makeError('Wrong inputMap', 'Property "' + key + '" is not available in configMap');
      }
    }
  };

  /**
   * PROTOTYPE FUNCTIONS
   */

  // Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
  // qsa('.foo').forEach(function () {})
  NodeList.prototype.forEach = Array.prototype.forEach;
  HTMLCollection.prototype.forEach = Array.prototype.forEach;

  /**
   * Implement the ECMAScript 2015 'find' function in Arrays
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
   * @param  {function} !Array.prototype.find Function to execute on each value in the array
   * @return {undefined}
   */
  if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }
};

module.exports = {
  init: init
};

},{"nouislider":24}],6:[function(require,module,exports){
/**
 * Model module
 * @module model
 */


'use strict';

var stateMap = {
  dbName: ''
};

var defaultModel = {
  aboutAge: 35,
  aboutSituation: 'married',
  aboutLiving: 'own',
  aboutIncome: 60000,
  aboutBasicRate: 45,
  aboutDiscretionaryRate: 25,
  aboutSavingsRate: 30,
  annualSavings: 18000,
  currentSavings: 10000,
  //aboutStage: 'home',
  basicNeeds: 27000,
  lastUserStep: 1,
  discretionaryExpenses: 15000,
  pickedGoals: [],
  savedActions: []
};

var goalsList = [
  {
    id: 'college',
    title: 'Save for college',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'home',
    title: 'Buy a home',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'car',
    title: 'Save for car',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'funds',
    title: 'Emergency funds',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'cards',
    title: 'Pay-down Credit Cards',
    date: 'January 2017',
    probability: '50%'
  },
  {
    id: 'retire',
    title: 'Retire',
    date: 'January 2017',
    probability: '50%'
  }
];

/**
 * Returns the value of the property in the model.
 * @param  {string} property The name of the property
 */
var read = function(property) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var user = data.user;

  if(typeof property === 'undefined') {
    return user;
  }

  return user[property];
};

/**
 * Updates model by giving it the property name and its value.
 * @param  {string} property   The name of the property to update
 * @param  {object} updateData The new value of the property
 */
var update = function (property, updateData, callback) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var user = data.user;

  user[property] = updateData;

  localStorage[stateMap.dbName] = JSON.stringify(data);

  callback = callback || function() {};
  callback(updateData);
};

/**
 * Removes data from model
 * @param  {string} property The name of the property to be removed from model.
 */
var remove = function (property) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var user = data.user;

  delete user[property];

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * WARNING: Will remove ALL data from storage.
 */
var reset = function () {
  localStorage[stateMap.dbName] = JSON.stringify({ user: defaultModel });
};

/**
 * SPECIFIC MODEL DATA-FUNCTIONS
 */

/**
 * Returns the list of available goals
 * @return {array}
 */
var getGoals = function() {
  return goalsList;
};

/**
 * Update basic needs, discretionary and annual savings actual values based on rates
 */
var updateMoneyValues = function(callback) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var user = data.user;

  user.basicNeeds = user.aboutIncome * user.aboutBasicRate * 0.01;
  user.discretionaryExpenses = user.aboutIncome * user.aboutDiscretionaryRate * 0.01;
  user.annualSavings = user.aboutIncome * user.aboutSavingsRate * 0.01;

  localStorage[stateMap.dbName] = JSON.stringify(data);

  callback = callback || function() {};

  callback({
    basicNeeds: user.basicNeeds,
    discretionaryExpenses: user.discretionaryExpenses,
    annualSavings: user.annualSaving
  });
};

/**
 * Update the array of picked goals adding or removing the goal
 * @param  {object} goal The goal to remove or add to the list
 */
var toggleGoal = function(goal) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var goals = data.user.pickedGoals;

  var alreadyPicked = false;
  for(var i = 0, len = goals.length; i < len && !alreadyPicked; i++) {
    if(goals[i].id === goal.id) {
      goals.splice(i, 1);
      alreadyPicked = true;
    }
  }

  if(!alreadyPicked) {
    goals.push(goal);
  }

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * Update the array of saved adding or removing the goal
 * @param  {object} action The action to remove or add to the list
 */
var toggleActions = function(action) {
  var data = JSON.parse(localStorage[stateMap.dbName]);
  var actions = data.user.savedActions;

  var alreadySaved = false;
  for(var i = 0, len = actions.length; i < len && !alreadySaved; i++) {
    if(actions[i].id === action.id) {
      actions.splice(i, 1);
      alreadySaved = true;
    }
  }

  if(!alreadySaved) {
    actions.push(action);
  }

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

var init = function(name) {
  stateMap.dbName = name;

  if(typeof window.Storage === undefined) {
    window.makeError('localStorage support', 'Error: localStorage is not supported.');
    return;
  }

  if(!localStorage[name]) {
    var data = {
      user: defaultModel
    };

    localStorage[name] = JSON.stringify(data);
  }
};

module.exports = {
  getGoals: getGoals,
  init: init,
  read: read,
  reset: reset,
  remove: remove,
  toggleActions: toggleActions,
  toggleGoal: toggleGoal,
  update: update,
  updateMoneyValues: updateMoneyValues
};

},{}],7:[function(require,module,exports){
(function (global){
/**
 * Screen #2 - About module
 * @module 2-about
 */

'use strict';

var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);

var configMap = {
  ageSlider: 'about__age__slider',
  incomeSlider: 'about__income__slider',
  ageOptions: {
    start: 35,
    step: 1,
    range: {
      'min': 18,
      'max': 65
    },
    pips: {
      mode: 'values',
      values: [20, 30, 40, 50, 60, 65],
      density: 5
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  incomeOptions: {
    start: 60000,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  optionLists: 'about__select',
  aboutSituation: 'married-kids',
  aboutLiving: 'rent'
};

var ageSlider, incomeSlider,
  situation, living;

/**
 * EVENT HANDLERS
 */

var showSliderTooltip = function(slider, values) {
  var tooltip = slider.getElementsByTagName('span')[0];
  if (slider.classList.contains(configMap.incomeSlider)) {
    tooltip.innerHTML = '$' + values[0];
  } else {
    tooltip.innerHTML = values[0];
  }
};

/**
 * DOM FUNCTIONS
 */

var createSliders = function() {
  window.createSlider(ageSlider, configMap.ageOptions);
  window.createSlider(incomeSlider, configMap.incomeOptions);

  ageSlider.noUiSlider.on('update', function(values) {
    showSliderTooltip(ageSlider, values);
  });

  incomeSlider.noUiSlider.on('update', function(values) {
    showSliderTooltip(incomeSlider, values);
  });
};

var setOptionLists = function() {
  situation.value = configMap.aboutSituation;
  living.value = configMap.aboutLiving;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'ageChanged') {
    ageSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0]));
    });
  } else if (event === 'incomeChanged') {
    incomeSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0].replace('.', '')));
    });
  } else if (event === 'situationChanged') {
    situation.addEventListener('change', function(event) {
      handler(event.target.value);
    });
  } else if (event === 'livingChanged') {
    living.addEventListener('change', function(event) {
      handler(event.target.value);
    });
  }
};

var configModule = function(inputMap) {
  window.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  //DOM elements
  ageSlider = container.getElementsByClassName(configMap.ageSlider)[0];
  incomeSlider = container.getElementsByClassName(configMap.incomeSlider)[0];
  situation = container.getElementsByClassName('about__select')[0];
  living = container.getElementsByClassName('about__select')[1];

  createSliders();

  setOptionLists();
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){
/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Chartist = require('chartist');

var configMap = {
  aboutIncome: 60000,
  needsSlider: 'about__savings__slider--needs',
  expensesSlider: 'about__savings__slider--expenses',
  savingsSlider: 'current-savings__slider',
  //Slider options
  needsOptions: {
    start: 45,
    step: 1,
    range: {
      'min': 1,
      'max': 60
    },
    format: wNumb({
      decimals: 0
    })
  },
  expensesOptions: {
    start: 25,
    step: 1,
    range: {
      'min': 1,
      'max': 40
    },
    format: wNumb({
      decimals: 0
    })
  },
  savingsOptions: {
    start: 10000,
    step: 1000,
    range: {
      'min': 1000,
      'max': 100000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  //Doughnut options
  doughnutClass: 'about__savings__circle',
  doughnutData: {
    series: [{
      value: 45,
      name: 'Basic Needs'
    }, {
      value: 25,
      name: 'Discretionary'
    }]
  },
  doughnutOptions: {
    donut: true,
    donutWidth: 20,
    chartPadding: 10,
    labelOffset: 50,
    width: '220px',
    height: '220px'
  },
  doughnutResponsiveOptions: [
    ['screen and (max-width: 480px)', {
      width: '170px',
      height: '170px'
    }]
  ]
};

var $pieChart, needsSlider, expensesSlider, savingsSlider;

/**
 * DOM FUNCTIONS
 */

var animateDoughnut = function($pieChart) {
  $pieChart.on('draw', function(data) {
    if (data.type === 'slice') {
      var pathLength = data.element._node.getTotalLength();
      data.element.attr({
        'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
      });
      var animationDefinition = {
        'stroke-dashoffset': {
          id: 'anim' + data.index,
          dur: 1000,
          from: -pathLength + 'px',
          to: '0px',
          easing: Chartist.Svg.Easing.easeOutQuint,
          fill: 'freeze'
        }
      };

      if (data.index !== 0) {
        animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
      }

      data.element.attr({
        'stroke-dashoffset': -pathLength + 'px'
      });
      data.element.animate(animationDefinition, false);
    }
  });
};

var createDoughnutTooltip = function() {
  var $chart = $('.' + configMap.doughnutClass),
    $toolTip = $chart
    .append('<div class="pie-tooltip"></div>')
    .find('.pie-tooltip')
    .hide(),
    moneyFormat = wNumb({
      thousand: '.',
      prefix: '$ '
    });

  var isTooltipShown = false;

  $chart.on('mouseenter', '.ct-slice-donut', function() {
    var $slice = $(this),
      value = $slice.attr('ct:value'),
      seriesName = $slice.parent().attr('ct:series-name');
    $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
      moneyFormat.to(Number(value) / 100 * configMap.aboutIncome)).show();
  });

  //For mobiles
  $chart.on('click', '.ct-slice-donut', function() {
    if (!isTooltipShown) {
      var $slice = $(this),
        value = $slice.attr('ct:value'),
        seriesName = $slice.parent().attr('ct:series-name');
      $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
        moneyFormat.to(Number(value) / 100 * configMap.aboutIncome)).show();
      isTooltipShown = true;
    } else {
      $toolTip.hide();
      isTooltipShown = false;
    }
  });

  $chart.on('mouseleave', '.ct-slice-donut', function() {
    $toolTip.hide();
  });

  $chart.on('mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
    });
  });
};

var createChart = function(htmlNode) {
  configMap.doughnutData.series[2] = {
    value: 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value,
    name: 'Savings'
  };

  $pieChart = new Chartist.Pie(htmlNode,
    configMap.doughnutData,
    configMap.doughnutOptions,
    configMap.doughnutResponsiveOptions);

  animateDoughnut($pieChart);
  createDoughnutTooltip();

};

/**
 * EVENT HANDLERS
 */

var showSliderTooltip = function(slider, values) {
  var tooltip = slider.getElementsByTagName('span')[0];
  if (slider.classList.contains(configMap.savingsSlider)) {
    tooltip.innerHTML = '$' + values[0];
  } else {
    tooltip.innerHTML = values[0] + '%';
  }
};


/**
 * Update the view of the Doughnut when sliders value change
 * @param {string} slider The name of the slider which changed
 */
var updateDOMDoughnut = function(slider, values) {
  if (slider === 'needsSlider') {
    configMap.doughnutData.series[0].value = Number(values[0]);
  } else {
    configMap.doughnutData.series[1].value = Number(values[0]);
  }
  configMap.doughnutData.series[2].value = 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value;
  $pieChart.update();
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'basicNeedsChanged') {
    needsSlider.noUiSlider.on('change', function(values) {
      updateDOMDoughnut('needsSlider', values);
      handler(configMap.doughnutData.series[0].value, configMap.doughnutData.series[2].value);
    });
  } else if (event === 'expensesChanged') {
    expensesSlider.noUiSlider.on('change', function(values) {
      updateDOMDoughnut('expensesSlider', values);
      handler(configMap.doughnutData.series[1].value, configMap.doughnutData.series[2].value);
    });
  } else if (event === 'savingsChanged') {
    savingsSlider.noUiSlider.on('change', function(values) {
      handler(Number(values[0].replace('.', '')));
    });
  }
};

var configModule = function(inputMap) {
  window.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  needsSlider = container.getElementsByClassName(configMap.needsSlider)[0];
  expensesSlider = container.getElementsByClassName(configMap.expensesSlider)[0];
  savingsSlider = container.getElementsByClassName(configMap.savingsSlider)[0];

  //Create sliders
  window.createSlider(needsSlider, configMap.needsOptions);
  needsSlider.noUiSlider.on('update', function(values) {
    showSliderTooltip(needsSlider, values);
  });

  window.createSlider(expensesSlider, configMap.expensesOptions);
  expensesSlider.noUiSlider.on('update', function(values) {
    showSliderTooltip(expensesSlider, values);
  });

  window.createSlider(savingsSlider, configMap.savingsOptions);
  savingsSlider.noUiSlider.on('update', function(values) {
    showSliderTooltip(savingsSlider, values);
  });

  //Init Doughnut Chart
  var doughnutHtml = container.getElementsByClassName(configMap.doughnutClass)[0];
  createChart(doughnutHtml);
};

module.exports = {
  bind: bind,
  configModule: configModule,
  init: init
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"chartist":16}],9:[function(require,module,exports){
(function (global){
/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);

var configMap = {
  savingsId: '#pyramid-savings',
  basicId: '#pyramid-basic',
  discretiotionaryId: '#pyramid-discretionary',
  incomeId: '#pyramid-income',
  basicNeeds: 0,
  annualSavings: 0,
  discretionaryExpenses: 0,
  aboutIncome: 0
};

var savingsText, basicText, discretionaryText, incomeText;

/**
 * DOM FUNCTIONS
 */

var updateLabels = function() {
  var moneyFormat = wNumb({
    thousand: ',',
    prefix: '$ '
  });

  savingsText.textContent = ' ' + moneyFormat.to(configMap.annualSavings) + '/yr';
  basicText.textContent = moneyFormat.to(configMap.basicNeeds) + '/yr';
  discretionaryText.textContent = moneyFormat.to(configMap.discretionaryExpenses) + '/yr';
  incomeText.textContent = moneyFormat.to(configMap.aboutIncome) + '/yr';
};

/**
 * PUBLIC FUNCTIONS
 */

var configModule = function(inputMap) {
  window.setConfigMap(inputMap, configMap);
};

var init = function(container) {
  savingsText = container.querySelector(configMap.savingsId);
  basicText = container.querySelector(configMap.basicId);
  discretionaryText = container.querySelector(configMap.discretiotionaryId);
  incomeText = container.querySelector(configMap.incomeId);

  updateLabels();
};

module.exports = {
  configModule: configModule,
  init: init,
  updateLabels: updateLabels
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){
/**
 * Screen #6 - Scenarios module
 * @module 6-Scenarios
 */

'use strict';

var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var Chartist = require('chartist');

var configMap = {
  savingsRate: 30,
  income: 60000,
  annualSavings: 18000,
  aboutAge: 35,
  //compound interest
  currentSavings: 1000,
  annualInterestRate: 0.06,
  investmentTermYrs: 30,
  //Advanced settings
  investment: 100,
  retirementAge: 65,
  //Sliders options
  savingRateSlider: 'option__slider--saving',
  incomeRateSlider: 'option__slider--income',
  investmentRateSlider: 'option__slider--investment',
  retirementSlider: 'option__slider--retirement',
  savingRateOptions: {
    start: 30,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  },
  incomeOptions: {
    start: 60000,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  },
  investmentOptions: {
    start: 100,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  },
  retirementOptions: {
    start: 65,
    step: 1,
    range: {
      'min': 65,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  },
  //Line chart options
  chartClass: '.scenario__chart',
  chartData: {
    labels: [18, 25, 35, 45, 55, 65],
    series: [
      [35000, 245000, 595000, 945000, 1295000, 1645000]
    ]
  },
  chartOptions: {
    axisY: {
      type: Chartist.FixedScaleAxis,
      high: 2000000,
      ticks: [0, 250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000]
    },
    showArea: true,
    width: '400px',
    height: '250px',
    plugins: [

    ]
  },
  //savings at retirement age
  retirementSavingsHTML: 'savings__amount'
};

var savingRateSlider, incomeRateSlider, investmentRateSlider, retirementSlider,
  investmentStyleButtons,
  lineChart,
  retirementSavings;
var moneyFormat = wNumb({
  thousand: ','
});

/**
 * DOM FUNCTIONS
 */

var createSliders = function() {
  window.createSlider(savingRateSlider, configMap.savingRateOptions);
  savingRateSlider.noUiSlider.on('update', function(values) {
    sliderEventHandler(savingRateSlider, values, '%');
  });

  window.createSlider(incomeRateSlider, configMap.incomeOptions);
  incomeRateSlider.noUiSlider.on('update', function(values) {
    sliderEventHandler(incomeRateSlider, values, '$');
  });

  window.createSlider(investmentRateSlider, configMap.investmentOptions);
  investmentRateSlider.noUiSlider.on('update', function(values) {
    sliderEventHandler(investmentRateSlider, values, '%');
  });

  window.createSlider(retirementSlider, configMap.retirementOptions);
  retirementSlider.noUiSlider.on('update', function(values) {
    sliderEventHandler(retirementSlider, values);
  });
};

var createLineChart = function(htmlNode, data, options) {
  lineChart = new Chartist.Line(htmlNode, data, options);
};

/**
 * EVENT HANDLERS
 */

var investmentStyleButtonsHandler = function(event) {
  var investmentStyle = event.target.value;

  switch (investmentStyle) {
  case 'safe':
    configMap.annualInterestRate = 0.02;
    break;
  case 'moderate':
    configMap.annualInterestRate = 0.06;
    break;
  case 'risky':
    configMap.annualInterestRate = 0.15;
    break;
  }

  updateLineChart();
};

var sliderEventHandler = function(slider, values, format) {
  var tooltip = slider.getElementsByTagName('span')[0];
  if (format === '%') {
    tooltip.innerHTML = values[0] + '%';
  } else if (format === '$') {
    tooltip.innerHTML = '$' + values[0];
  } else {
    tooltip.innerHTML = values[0];
  }
};

var bindSlidersToChart = function() {
  savingRateSlider.noUiSlider.on('change', function(values) {
    configMap.savingsRate = Number(values[0]);
    updateLineChart();
  });
  incomeRateSlider.noUiSlider.on('change', function(values) {
    configMap.income = Number(values[0].replace('.', ''));
    updateLineChart();
  });

  //Advanced options
  investmentRateSlider.noUiSlider.on('change', function(values) {
    configMap.investment = Number(values[0]);
    updateLineChart();
  });
  retirementSlider.noUiSlider.on('change', function(values) {
    configMap.retirementAge = Number(values[0]);
    updateLineChart();
  });
};

/**
 * COMPOUND INTEREST FUNCTIONS
 */

/**
 * Returns the accumulated money
 * @param  {number} interestRate % of interest (from 0 to 1)
 * @param  {number} term Years
 * @param  {number} amtInvested Initial investment
 * @param  {number} contribAmt Monthly contribution
 * @module.exports = {number}
 */
var getAccumulatedValue = function(interestRate, term, amtInvested, contribAmt) {
  var app = [];
  app[0] = amtInvested;
  var total = 0;
  var monthlyTerm = term * 12;
  var monthlyContribAmt = contribAmt / 12;

  for (var i = 1; i <= monthlyTerm; i++) {
    var appreciation = (interestRate / 12) * (app[i - 1]);
    app[i] = appreciation + app[i - 1] + monthlyContribAmt;
    total = app[i - 1];
  }
  app = null;
  return Math.round(total);
};

/**
 * PUBLIC FUNCTIONS
 */

/**
 * Returns an array containing the values for x axis
 * @param  {Number} firstValue First value of the axis
 * @param  {Number} lastValue Last value of the axis
 * @module.exports = {Array}
 */
var getAbscissas = function(firstValue, lastValue) {
  var values = [];
  values[0] = firstValue;
  values[5] = lastValue;

  var difference = (lastValue - firstValue) / 5;
  for (var i = 1; i < 5; i++) {
    values[i] = Math.round(firstValue + (difference * i));
  }

  return values;
};

var updateLineChart = function() {
  var xValues = getAbscissas(configMap.aboutAge, configMap.retirementAge);
  var i = 0;

  configMap.chartData.labels = xValues;
  configMap.annualSavings = (configMap.savingsRate / 100) * configMap.income * (configMap.investment / 100);

  configMap.chartData.series[0][0] = configMap.currentSavings;
  for (i = 1; i < 6; i += 1) {
    configMap.chartData.series[0][i] =
      getAccumulatedValue(configMap.annualInterestRate, xValues[i] - xValues[0], configMap.currentSavings, configMap.annualSavings);
  }

  configMap.chartOptions.axisY.ticks[0] = configMap.currentSavings;

  lineChart.update(configMap.chartData, configMap.chartOptions);
  retirementSavings.childNodes[1].textContent = moneyFormat.to(configMap.chartData.series[0][5]);
};

var configModule = function(inputMap) {
  window.setConfigMap(inputMap, configMap);
};

var setSlider = function(slider, value) {
  if (slider === 'income') {
    incomeRateSlider.noUiSlider.set(value);
  } else if (slider === 'savingsRate') {
    savingRateSlider.noUiSlider.set(value);
  }
};

var init = function(container) {
  savingRateSlider = container.getElementsByClassName(configMap.savingRateSlider)[0];
  incomeRateSlider = container.getElementsByClassName(configMap.incomeRateSlider)[0];
  investmentRateSlider = container.getElementsByClassName(configMap.investmentRateSlider)[0];
  retirementSlider = container.getElementsByClassName(configMap.retirementSlider)[0];
  retirementSavings = container.getElementsByClassName(configMap.retirementSavingsHTML)[0];

  investmentStyleButtons = container.querySelectorAll('input[name="investment-style"]');
  investmentStyleButtons.forEach(function(element) {
    element.addEventListener('change', investmentStyleButtonsHandler);
  });

  createSliders();

  //Line Chart
  createLineChart(configMap.chartClass, configMap.chartData, configMap.chartOptions);
  updateLineChart();
  bindSlidersToChart();
};

module.exports = {
  updateLineChart: updateLineChart,
  configModule: configModule,
  init: init,
  getAbscissas: getAbscissas,
  setSlider: setSlider
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"chartist":16}],11:[function(require,module,exports){
(function (global){
/**
 * Screen #7 - Goal module
 * @module 7-Goal
 */

'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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

  container.getElementsByClassName(configMap.pickedGoalsWrapper)[0].innerHTML = view;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'goalToggled') {
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

module.exports = {
  bind: bind,
  init: init,
  showListGoals: showListGoals
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"dragula":23}],12:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var configMap = {
  jsonUrl: 'scripts/model/actions.json'
};

var tbody,
  data;

/**
 * DOM FUNCTIONS
 */

var createActions = function(data) {
  var docFragment = document.createDocumentFragment(),
    row;

  data.actions.forEach(function(element, index) {
    row = document.createElement('tr');
    row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
      '<td>' + element.todo + '</td>' +
      '<td>' + element.todonot + '</td>' +
      '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
    docFragment.appendChild(row);
  });
  return docFragment;
};

/**
 * EVENT HANDLERS
 */

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'actionToggled') {
    tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        handler(data.actions[Number(target.dataset.action)]);
      }
    });
  }
};

var init = function(container) {
  tbody = container.getElementsByTagName('tbody')[0];

  var request = new XMLHttpRequest();
  request.open('GET', configMap.jsonUrl, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      data = JSON.parse(request.responseText);
      tbody.appendChild(createActions(data));
      //Tooltips
      $('.retirement-wrapper .zmdi-info-outline').tooltip();
    } else {
      console.log('Error with the connection.');
    }
  };
  request.onerror = function() {
    console.log('Error with the connection.');
  };
  request.send();
};

module.exports = {
  bind: bind,
  init: init
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var configMap = {
  actionTitleClasses: 'action__title',
  popoverClasses: '.plan-wrapper .zmdi-info-outline',
  datepickerClasses: '.plan-wrapper .zmdi-calendar-alt'
};

/**
 * DOM FUNCTIONS
 */

var printPlan = function() {
  var printPage = document.createElement('div'),
    html = '<h1 class="text-center">Your Action Plan</h1>';

  printPage.classList.add('print-page');

  var planActions = [{
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }, {
    title: 'Play a stay-cation',
    type: 'Variable expense',
    date: 'November 28th 2016',
    details: 'Bank what you save'
  }];

  var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
    tBody = '<tbody>';

  for (var i = 0, len = planActions.length; i < len; i++) {
    tBody += '<tr><td>' + planActions[i].title + '</td>' +
      '<td>' + planActions[i].type + '</td>' +
      '<td>' + planActions[i].date + '</td>' +
      '<td>' + planActions[i].details + '</td><tr>';
  }

  tBody += '</tbody></table>';
  html += tHead + tBody;

  printPage.innerHTML = html;
  document.body.appendChild(printPage);
  document.body.classList.add('no-print');

  window.print();

  document.body.classList.remove('no-print');
  printPage.innerHTML = '';
};

/**
 * PUBLIC FUNCTIONS
 */

var init = function(container) {

  //Popover
  $(configMap.popoverClasses).popover({
    placement: 'left'
  });

  //Datepickers
  $(configMap.datepickerClasses)
    .datepicker({
      autoclose: true,
      format: 'M d yyyy'
    })
    .on('changeDate', function(event) {
      this.dataset.date = event.format();
    });

  var printButton = container.getElementsByClassName('print')[0];
  printButton.addEventListener('click', printPlan);

  var actionTitles = container.getElementsByClassName(configMap.actionTitleClasses);
  actionTitles.forEach(function(element) {
    element.addEventListener('click', function() {
      this.firstElementChild.classList.toggle('rotate');
    });
  });
};

module.exports = {
  init: init
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
/**
 * Shell module
 * @module shell
 */

'use strict';

var PubSub = require('pubsub-js');
var model = require('./model');
var views = {
  //Screens
  about: require('./screens/2-about'),
  you: require('./screens/3-you'),
  pyramid: require('./screens/5-pyramid'),
  scenarios: require('./screens/6-scenarios'),
  goal: require('./screens/7-goal'),
  retirement: require('./screens/8-retirement'),
  plan: require('./screens/9-plan'),

  //Components
  nav: require('./components/nav'),
  hamburger: require('./components/hamburger'),
  continue: require('./components/continue')
};

var data;

/**
 * VIEWS CONTROLLERS
 */

/**
 * 2-About
 */
var aboutController = function() {
  views.about.bind('ageChanged', function(value) {
    model.update('aboutAge', value, function(value) {
      PubSub.publish('ageChanged', value);
    });
  });
  views.about.bind('incomeChanged', function(value) {
    model.update('aboutIncome', value, function(value) {
      PubSub.publish('aboutIncomeChanged', value);
    });
    model.updateMoneyValues(function(moneyValues) {
      PubSub.publish('moneyValuesChanged', moneyValues);
    });
  });
  views.about.bind('situationChanged', function(value) {
    model.update('aboutSituation', value);
  });
  views.about.bind('livingChanged', function(value) {
    model.update('aboutLiving', value);
  });
};

/**
 * 3-You
 */
var youSubscriber = function(topic, data) {
  if (topic === 'aboutIncomeChanged') {
    views.you.configModule({
      aboutIncome: data
    });
  }
};

var youController = function() {
  views.you.bind('basicNeedsChanged', function(basicRate, savingsRate) {
    model.update('aboutBasicRate', basicRate);
    model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
      PubSub.publish('savingsRateChanged', savingsRate);
    });
    model.updateMoneyValues(function(moneyValues) {
      PubSub.publish('moneyValuesChanged', moneyValues);
    });
  });
  views.you.bind('expensesChanged', function(expensesRate, savingsRate) {
    model.update('aboutDiscretionaryRate', expensesRate);
    model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
      PubSub.publish('savingsRateChanged', savingsRate);
    });
    model.updateMoneyValues(function(moneyValues) {
      PubSub.publish('moneyValuesChanged', moneyValues);
    });
  });
  views.you.bind('savingsChanged', function(currentSavings) {
    model.update('currentSavings', currentSavings, function(currentSavings) {
      PubSub.publish('currentSavingsChanged', currentSavings);
    });
  });

  PubSub.subscribe('aboutIncomeChanged', youSubscriber);
};

/**
 * 5-Pyramid
 */
var pyramidSubscriber = function(topic, data) {
  if (topic === 'aboutIncomeChanged') {
    views.pyramid.configModule({
      aboutIncome: data
    });
  } else if (topic === 'moneyValuesChanged') {
    views.pyramid.configModule(data);
  }
  views.pyramid.updateLabels();
};

var pyramidController = function() {
  PubSub.subscribe('aboutIncomeChanged', pyramidSubscriber);
  PubSub.subscribe('moneyValuesChanged', pyramidSubscriber);
};

/**
 * 6-Scenarios
 */
var scenariosSubscriber = function(topic, data) {
  if (topic === 'ageChanged') {
    views.scenarios.configModule({
      aboutAge: data
    });
  } else if (topic === 'aboutIncomeChanged') {
    views.scenarios.configModule({
      income: data
    });
    views.scenarios.setSlider('income', data);
  } else if (topic === 'savingsRateChanged') {
    views.scenarios.configModule({
      savingsRate: data
    });
    views.scenarios.setSlider('savingsRate', data);
  } else if (topic === 'currentSavingsChanged') {
    views.scenarios.configModule({
      currentSavings: data
    });
  }

  views.scenarios.updateLineChart();
};

var scenariosController = function() {
  PubSub.subscribe('ageChanged', scenariosSubscriber);
  PubSub.subscribe('aboutIncomeChanged', scenariosSubscriber);
  PubSub.subscribe('savingsRateChanged', scenariosSubscriber);
  PubSub.subscribe('currentSavingsChanged', scenariosSubscriber);
};

/**
 * 7-Goal
 */
var goalController = function() {
  views.goal.bind('goalToggled', function(goal) {
    model.toggleGoal(goal);
  });
};

/**
 * 8-Retirement
 */
var retirementController = function() {
  views.retirement.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};

/**
 * COMPONENTS CONTROLLERS
 */

/**
 * Navigation
 */
var navController = function() {
  views.nav.setDisabledLinks(data.lastUserStep);
};

/**
 * Continue button
 */
var continueController = function() {
  views.continue.bind('continueClicked', function(nextActiveNavLink) {
    //When user is on the last step the value of 'nextActiveNavLink' is 'false'
    if (nextActiveNavLink) {
      var lastUserStep = Number(
        nextActiveNavLink
        .getElementsByClassName('step-number')[0]
        .textContent
      );
      var savedLastStep = data.lastUserStep;
      if (lastUserStep > savedLastStep) {
        model.update('lastUserStep', lastUserStep);
      }
    }
  });
};


/**
 * PUBLIC FUNCTIONS
 */

var init = function() {
  data = model.read();
  //Screen #2
  var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
  views.about.configModule({
    ageOptions: {
      start: data.aboutAge
    },
    incomeOptions: {
      start: data.aboutIncome
    },
    aboutSituation: data.aboutSituation,
    aboutLiving: data.aboutLiving
  });
  views.about.init(aboutContainer);
  aboutController();

  //Screen #3
  var youContainer = document.getElementsByClassName('you-wrapper')[0];
  views.you.configModule({
    aboutIncome: data.aboutIncome,
    needsOptions: {
      start: data.aboutBasicRate
    },
    expensesOptions: {
      start: data.aboutDiscretionaryRate
    },
    savingsOptions: {
      start: data.currentSavings
    },
    doughnutData: {
      series: [{
        value: data.aboutBasicRate,
        name: 'Basic Needs'
      }, {
        value: data.aboutDiscretionaryRate,
        name: 'Discretionary'
      }]
    }
  });
  views.you.init(youContainer);
  youController();

  //Screen #5
  var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
  views.pyramid.configModule({
    basicNeeds: data.basicNeeds,
    annualSavings: data.annualSavings,
    discretionaryExpenses: data.discretionaryExpenses,
    aboutIncome: data.aboutIncome
  });
  views.pyramid.init(pyramidContainer);
  pyramidController();

  //Screen #6
  var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
  views.scenarios.configModule({
    savingsRate: data.aboutSavingsRate,
    income: data.aboutIncome,
    annualSavings: data.annualSavings,
    aboutAge: data.aboutAge,
    currentSavings: data.currentSavings,
    savingRateOptions: {
      start: data.aboutSavingsRate
    },
    incomeOptions: {
      start: data.aboutIncome
    },
    chartData: {
      labels: views.scenarios.getAbscissas(data.aboutAge, 65)
    }
  });
  views.scenarios.init(scenariosContainer);
  scenariosController();

  //Screen #7
  var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
  views.goal.init(goalContainer, model.getGoals(), data.pickedGoals);
  goalController();

  //Screen #8
  var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
  views.retirement.init(retirementContainer);
  retirementController();

  //Screen #9
  var planContainer = document.getElementsByClassName('plan-wrapper')[0];
  views.plan.init(planContainer);


  /* COMPONENTS */

  //Navigation
  views.nav.init();
  navController();

  //Continue buttons
  views.continue.init();
  continueController();

  //Hamburger menu
  views.hamburger.init();

  /* DEVELOPMENT ONLY */
  var resetButton = document.getElementsByClassName('reset-model')[0];
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
};

module.exports = {
  init: init
};

},{"./components/continue":2,"./components/hamburger":3,"./components/nav":4,"./model":6,"./screens/2-about":7,"./screens/3-you":8,"./screens/5-pyramid":9,"./screens/6-scenarios":10,"./screens/7-goal":11,"./screens/8-retirement":12,"./screens/9-plan":13,"pubsub-js":25}],15:[function(require,module,exports){
module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

},{}],16:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['Chartist'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Chartist'] = factory();
  }
}(this, function () {

/* Chartist.js 0.9.5
 * Copyright © 2015 Gion Kunz
 * Free to use under the WTFPL license.
 * http://www.wtfpl.net/
 */
/**
 * The core module of Chartist that is mainly providing static functions and higher level functions for chart modules.
 *
 * @module Chartist.Core
 */
var Chartist = {
  version: '0.9.5'
};

(function (window, document, Chartist) {
  'use strict';

  /**
   * Helps to simplify functional style code
   *
   * @memberof Chartist.Core
   * @param {*} n This exact value will be returned by the noop function
   * @return {*} The same value that was provided to the n parameter
   */
  Chartist.noop = function (n) {
    return n;
  };

  /**
   * Generates a-z from a number 0 to 26
   *
   * @memberof Chartist.Core
   * @param {Number} n A number from 0 to 26 that will result in a letter a-z
   * @return {String} A character from a-z based on the input number n
   */
  Chartist.alphaNumerate = function (n) {
    // Limit to a-z
    return String.fromCharCode(97 + n % 26);
  };

  /**
   * Simple recursive object extend
   *
   * @memberof Chartist.Core
   * @param {Object} target Target object where the source will be merged into
   * @param {Object...} sources This object (objects) will be merged into target and then target is returned
   * @return {Object} An object that has the same reference as target but is extended and merged with the properties of source
   */
  Chartist.extend = function (target) {
    target = target || {};

    var sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var prop in source) {
        if (typeof source[prop] === 'object' && source[prop] !== null && !(source[prop] instanceof Array)) {
          target[prop] = Chartist.extend({}, target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
    });

    return target;
  };

  /**
   * Replaces all occurrences of subStr in str with newSubStr and returns a new string.
   *
   * @memberof Chartist.Core
   * @param {String} str
   * @param {String} subStr
   * @param {String} newSubStr
   * @return {String}
   */
  Chartist.replaceAll = function(str, subStr, newSubStr) {
    return str.replace(new RegExp(subStr, 'g'), newSubStr);
  };

  /**
   * Converts a number to a string with a unit. If a string is passed then this will be returned unmodified.
   *
   * @memberof Chartist.Core
   * @param {Number} value
   * @param {String} unit
   * @return {String} Returns the passed number value with unit.
   */
  Chartist.ensureUnit = function(value, unit) {
    if(typeof value === 'number') {
      value = value + unit;
    }

    return value;
  };

  /**
   * Converts a number or string to a quantity object.
   *
   * @memberof Chartist.Core
   * @param {String|Number} input
   * @return {Object} Returns an object containing the value as number and the unit as string.
   */
  Chartist.quantity = function(input) {
    if (typeof input === 'string') {
      var match = (/^(\d+)\s*(.*)$/g).exec(input);
      return {
        value : +match[1],
        unit: match[2] || undefined
      };
    }
    return { value: input };
  };

  /**
   * This is a wrapper around document.querySelector that will return the query if it's already of type Node
   *
   * @memberof Chartist.Core
   * @param {String|Node} query The query to use for selecting a Node or a DOM node that will be returned directly
   * @return {Node}
   */
  Chartist.querySelector = function(query) {
    return query instanceof Node ? query : document.querySelector(query);
  };

  /**
   * Functional style helper to produce array with given length initialized with undefined values
   *
   * @memberof Chartist.Core
   * @param length
   * @return {Array}
   */
  Chartist.times = function(length) {
    return Array.apply(null, new Array(length));
  };

  /**
   * Sum helper to be used in reduce functions
   *
   * @memberof Chartist.Core
   * @param previous
   * @param current
   * @return {*}
   */
  Chartist.sum = function(previous, current) {
    return previous + (current ? current : 0);
  };

  /**
   * Multiply helper to be used in `Array.map` for multiplying each value of an array with a factor.
   *
   * @memberof Chartist.Core
   * @param {Number} factor
   * @returns {Function} Function that can be used in `Array.map` to multiply each value in an array
   */
  Chartist.mapMultiply = function(factor) {
    return function(num) {
      return num * factor;
    };
  };

  /**
   * Add helper to be used in `Array.map` for adding a addend to each value of an array.
   *
   * @memberof Chartist.Core
   * @param {Number} addend
   * @returns {Function} Function that can be used in `Array.map` to add a addend to each value in an array
   */
  Chartist.mapAdd = function(addend) {
    return function(num) {
      return num + addend;
    };
  };

  /**
   * Map for multi dimensional arrays where their nested arrays will be mapped in serial. The output array will have the length of the largest nested array. The callback function is called with variable arguments where each argument is the nested array value (or undefined if there are no more values).
   *
   * @memberof Chartist.Core
   * @param arr
   * @param cb
   * @return {Array}
   */
  Chartist.serialMap = function(arr, cb) {
    var result = [],
        length = Math.max.apply(null, arr.map(function(e) {
          return e.length;
        }));

    Chartist.times(length).forEach(function(e, index) {
      var args = arr.map(function(e) {
        return e[index];
      });

      result[index] = cb.apply(null, args);
    });

    return result;
  };

  /**
   * This helper function can be used to round values with certain precision level after decimal. This is used to prevent rounding errors near float point precision limit.
   *
   * @memberof Chartist.Core
   * @param {Number} value The value that should be rounded with precision
   * @param {Number} [digits] The number of digits after decimal used to do the rounding
   * @returns {number} Rounded value
   */
  Chartist.roundWithPrecision = function(value, digits) {
    var precision = Math.pow(10, digits || Chartist.precision);
    return Math.round(value * precision) / precision;
  };

  /**
   * Precision level used internally in Chartist for rounding. If you require more decimal places you can increase this number.
   *
   * @memberof Chartist.Core
   * @type {number}
   */
  Chartist.precision = 8;

  /**
   * A map with characters to escape for strings to be safely used as attribute values.
   *
   * @memberof Chartist.Core
   * @type {Object}
   */
  Chartist.escapingMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };

  /**
   * This function serializes arbitrary data to a string. In case of data that can't be easily converted to a string, this function will create a wrapper object and serialize the data using JSON.stringify. The outcoming string will always be escaped using Chartist.escapingMap.
   * If called with null or undefined the function will return immediately with null or undefined.
   *
   * @memberof Chartist.Core
   * @param {Number|String|Object} data
   * @return {String}
   */
  Chartist.serialize = function(data) {
    if(data === null || data === undefined) {
      return data;
    } else if(typeof data === 'number') {
      data = ''+data;
    } else if(typeof data === 'object') {
      data = JSON.stringify({data: data});
    }

    return Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, key, Chartist.escapingMap[key]);
    }, data);
  };

  /**
   * This function de-serializes a string previously serialized with Chartist.serialize. The string will always be unescaped using Chartist.escapingMap before it's returned. Based on the input value the return type can be Number, String or Object. JSON.parse is used with try / catch to see if the unescaped string can be parsed into an Object and this Object will be returned on success.
   *
   * @memberof Chartist.Core
   * @param {String} data
   * @return {String|Number|Object}
   */
  Chartist.deserialize = function(data) {
    if(typeof data !== 'string') {
      return data;
    }

    data = Object.keys(Chartist.escapingMap).reduce(function(result, key) {
      return Chartist.replaceAll(result, Chartist.escapingMap[key], key);
    }, data);

    try {
      data = JSON.parse(data);
      data = data.data !== undefined ? data.data : data;
    } catch(e) {}

    return data;
  };

  /**
   * Create or reinitialize the SVG element for the chart
   *
   * @memberof Chartist.Core
   * @param {Node} container The containing DOM Node object that will be used to plant the SVG element
   * @param {String} width Set the width of the SVG element. Default is 100%
   * @param {String} height Set the height of the SVG element. Default is 100%
   * @param {String} className Specify a class to be added to the SVG element
   * @return {Object} The created/reinitialized SVG element
   */
  Chartist.createSvg = function (container, width, height, className) {
    var svg;

    width = width || '100%';
    height = height || '100%';

    // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
    // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
    Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
      return svg.getAttributeNS('http://www.w3.org/2000/xmlns/', Chartist.xmlNs.prefix);
    }).forEach(function removePreviousElement(svg) {
      container.removeChild(svg);
    });

    // Create svg object with width and height or use 100% as default
    svg = new Chartist.Svg('svg').attr({
      width: width,
      height: height
    }).addClass(className).attr({
      style: 'width: ' + width + '; height: ' + height + ';'
    });

    // Add the DOM node to our container
    container.appendChild(svg._node);

    return svg;
  };


  /**
   * Reverses the series, labels and series data arrays.
   *
   * @memberof Chartist.Core
   * @param data
   */
  Chartist.reverseData = function(data) {
    data.labels.reverse();
    data.series.reverse();
    for (var i = 0; i < data.series.length; i++) {
      if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
        data.series[i].data.reverse();
      } else if(data.series[i] instanceof Array) {
        data.series[i].reverse();
      }
    }
  };

  /**
   * Convert data series into plain array
   *
   * @memberof Chartist.Core
   * @param {Object} data The series object that contains the data to be visualized in the chart
   * @param {Boolean} reverse If true the whole data is reversed by the getDataArray call. This will modify the data object passed as first parameter. The labels as well as the series order is reversed. The whole series data arrays are reversed too.
   * @param {Boolean} multi Create a multi dimensional array from a series data array where a value object with `x` and `y` values will be created.
   * @return {Array} A plain array that contains the data to be visualized in the chart
   */
  Chartist.getDataArray = function (data, reverse, multi) {
    // If the data should be reversed but isn't we need to reverse it
    // If it's reversed but it shouldn't we need to reverse it back
    // That's required to handle data updates correctly and to reflect the responsive configurations
    if(reverse && !data.reversed || !reverse && data.reversed) {
      Chartist.reverseData(data);
      data.reversed = !data.reversed;
    }

    // Recursively walks through nested arrays and convert string values to numbers and objects with value properties
    // to values. Check the tests in data core -> data normalization for a detailed specification of expected values
    function recursiveConvert(value) {
      if(Chartist.isFalseyButZero(value)) {
        // This is a hole in data and we should return undefined
        return undefined;
      } else if((value.data || value) instanceof Array) {
        return (value.data || value).map(recursiveConvert);
      } else if(value.hasOwnProperty('value')) {
        return recursiveConvert(value.value);
      } else {
        if(multi) {
          var multiValue = {};

          // Single series value arrays are assumed to specify the Y-Axis value
          // For example: [1, 2] => [{x: undefined, y: 1}, {x: undefined, y: 2}]
          // If multi is a string then it's assumed that it specified which dimension should be filled as default
          if(typeof multi === 'string') {
            multiValue[multi] = Chartist.getNumberOrUndefined(value);
          } else {
            multiValue.y = Chartist.getNumberOrUndefined(value);
          }

          multiValue.x = value.hasOwnProperty('x') ? Chartist.getNumberOrUndefined(value.x) : multiValue.x;
          multiValue.y = value.hasOwnProperty('y') ? Chartist.getNumberOrUndefined(value.y) : multiValue.y;

          return multiValue;

        } else {
          return Chartist.getNumberOrUndefined(value);
        }
      }
    }

    return data.series.map(recursiveConvert);
  };

  /**
   * Converts a number into a padding object.
   *
   * @memberof Chartist.Core
   * @param {Object|Number} padding
   * @param {Number} [fallback] This value is used to fill missing values if a incomplete padding object was passed
   * @returns {Object} Returns a padding object containing top, right, bottom, left properties filled with the padding number passed in as argument. If the argument is something else than a number (presumably already a correct padding object) then this argument is directly returned.
   */
  Chartist.normalizePadding = function(padding, fallback) {
    fallback = fallback || 0;

    return typeof padding === 'number' ? {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    } : {
      top: typeof padding.top === 'number' ? padding.top : fallback,
      right: typeof padding.right === 'number' ? padding.right : fallback,
      bottom: typeof padding.bottom === 'number' ? padding.bottom : fallback,
      left: typeof padding.left === 'number' ? padding.left : fallback
    };
  };

  Chartist.getMetaData = function(series, index) {
    var value = series.data ? series.data[index] : series[index];
    return value ? Chartist.serialize(value.meta) : undefined;
  };

  /**
   * Calculate the order of magnitude for the chart scale
   *
   * @memberof Chartist.Core
   * @param {Number} value The value Range of the chart
   * @return {Number} The order of magnitude
   */
  Chartist.orderOfMagnitude = function (value) {
    return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
  };

  /**
   * Project a data length into screen coordinates (pixels)
   *
   * @memberof Chartist.Core
   * @param {Object} axisLength The svg element for the chart
   * @param {Number} length Single data value from a series array
   * @param {Object} bounds All the values to set the bounds of the chart
   * @return {Number} The projected data length in pixels
   */
  Chartist.projectLength = function (axisLength, length, bounds) {
    return length / bounds.range * axisLength;
  };

  /**
   * Get the height of the area in the chart for the data series
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @return {Number} The height of the area in the chart for the data series
   */
  Chartist.getAvailableHeight = function (svg, options) {
    return Math.max((Chartist.quantity(options.height).value || svg.height()) - (options.chartPadding.top +  options.chartPadding.bottom) - options.axisX.offset, 0);
  };

  /**
   * Get highest and lowest value of data array. This Array contains the data that will be visualized in the chart.
   *
   * @memberof Chartist.Core
   * @param {Array} data The array that contains the data to be visualized in the chart
   * @param {Object} options The Object that contains the chart options
   * @param {String} dimension Axis dimension 'x' or 'y' used to access the correct value and high / low configuration
   * @return {Object} An object that contains the highest and lowest value that will be visualized on the chart.
   */
  Chartist.getHighLow = function (data, options, dimension) {
    // TODO: Remove workaround for deprecated global high / low config. Axis high / low configuration is preferred
    options = Chartist.extend({}, options, dimension ? options['axis' + dimension.toUpperCase()] : {});

    var highLow = {
        high: options.high === undefined ? -Number.MAX_VALUE : +options.high,
        low: options.low === undefined ? Number.MAX_VALUE : +options.low
      };
    var findHigh = options.high === undefined;
    var findLow = options.low === undefined;

    // Function to recursively walk through arrays and find highest and lowest number
    function recursiveHighLow(data) {
      if(data === undefined) {
        return undefined;
      } else if(data instanceof Array) {
        for (var i = 0; i < data.length; i++) {
          recursiveHighLow(data[i]);
        }
      } else {
        var value = dimension ? +data[dimension] : +data;

        if (findHigh && value > highLow.high) {
          highLow.high = value;
        }

        if (findLow && value < highLow.low) {
          highLow.low = value;
        }
      }
    }

    // Start to find highest and lowest number recursively
    if(findHigh || findLow) {
      recursiveHighLow(data);
    }

    // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
    // used to generate the chart. This is useful when the chart always needs to contain the position of the
    // invisible reference value in the view i.e. for bipolar scales.
    if (options.referenceValue || options.referenceValue === 0) {
      highLow.high = Math.max(options.referenceValue, highLow.high);
      highLow.low = Math.min(options.referenceValue, highLow.low);
    }

    // If high and low are the same because of misconfiguration or flat data (only the same value) we need
    // to set the high or low to 0 depending on the polarity
    if (highLow.high <= highLow.low) {
      // If both values are 0 we set high to 1
      if (highLow.low === 0) {
        highLow.high = 1;
      } else if (highLow.low < 0) {
        // If we have the same negative value for the bounds we set bounds.high to 0
        highLow.high = 0;
      } else {
        // If we have the same positive value for the bounds we set bounds.low to 0
        highLow.low = 0;
      }
    }

    return highLow;
  };

  /**
   * Checks if the value is a valid number or string with a number.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {Boolean}
   */
  Chartist.isNum = function(value) {
    return !isNaN(value) && isFinite(value);
  };

  /**
   * Returns true on all falsey values except the numeric value 0.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {boolean}
   */
  Chartist.isFalseyButZero = function(value) {
    return !value && value !== 0;
  };

  /**
   * Returns a number if the passed parameter is a valid number or the function will return undefined. On all other values than a valid number, this function will return undefined.
   *
   * @memberof Chartist.Core
   * @param value
   * @returns {*}
   */
  Chartist.getNumberOrUndefined = function(value) {
    return isNaN(+value) ? undefined : +value;
  };

  /**
   * Gets a value from a dimension `value.x` or `value.y` while returning value directly if it's a valid numeric value. If the value is not numeric and it's falsey this function will return undefined.
   *
   * @param value
   * @param dimension
   * @returns {*}
   */
  Chartist.getMultiValue = function(value, dimension) {
    if(Chartist.isNum(value)) {
      return +value;
    } else if(value) {
      return value[dimension || 'y'] || 0;
    } else {
      return 0;
    }
  };

  /**
   * Pollard Rho Algorithm to find smallest factor of an integer value. There are more efficient algorithms for factorization, but this one is quite efficient and not so complex.
   *
   * @memberof Chartist.Core
   * @param {Number} num An integer number where the smallest factor should be searched for
   * @returns {Number} The smallest integer factor of the parameter num.
   */
  Chartist.rho = function(num) {
    if(num === 1) {
      return num;
    }

    function gcd(p, q) {
      if (p % q === 0) {
        return q;
      } else {
        return gcd(q, p % q);
      }
    }

    function f(x) {
      return x * x + 1;
    }

    var x1 = 2, x2 = 2, divisor;
    if (num % 2 === 0) {
      return 2;
    }

    do {
      x1 = f(x1) % num;
      x2 = f(f(x2)) % num;
      divisor = gcd(Math.abs(x1 - x2), num);
    } while (divisor === 1);

    return divisor;
  };

  /**
   * Calculate and retrieve all the bounds for the chart and return them in one array
   *
   * @memberof Chartist.Core
   * @param {Number} axisLength The length of the Axis used for
   * @param {Object} highLow An object containing a high and low property indicating the value range of the chart.
   * @param {Number} scaleMinSpace The minimum projected length a step should result in
   * @param {Boolean} onlyInteger
   * @return {Object} All the values to set the bounds of the chart
   */
  Chartist.getBounds = function (axisLength, highLow, scaleMinSpace, onlyInteger) {
    var i,
      optimizationCounter = 0,
      newMin,
      newMax,
      bounds = {
        high: highLow.high,
        low: highLow.low
      };

    bounds.valueRange = bounds.high - bounds.low;
    bounds.oom = Chartist.orderOfMagnitude(bounds.valueRange);
    bounds.step = Math.pow(10, bounds.oom);
    bounds.min = Math.floor(bounds.low / bounds.step) * bounds.step;
    bounds.max = Math.ceil(bounds.high / bounds.step) * bounds.step;
    bounds.range = bounds.max - bounds.min;
    bounds.numberOfSteps = Math.round(bounds.range / bounds.step);

    // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
    // If we are already below the scaleMinSpace value we will scale up
    var length = Chartist.projectLength(axisLength, bounds.step, bounds);
    var scaleUp = length < scaleMinSpace;
    var smallestFactor = onlyInteger ? Chartist.rho(bounds.range) : 0;

    // First check if we should only use integer steps and if step 1 is still larger than scaleMinSpace so we can use 1
    if(onlyInteger && Chartist.projectLength(axisLength, 1, bounds) >= scaleMinSpace) {
      bounds.step = 1;
    } else if(onlyInteger && smallestFactor < bounds.step && Chartist.projectLength(axisLength, smallestFactor, bounds) >= scaleMinSpace) {
      // If step 1 was too small, we can try the smallest factor of range
      // If the smallest factor is smaller than the current bounds.step and the projected length of smallest factor
      // is larger than the scaleMinSpace we should go for it.
      bounds.step = smallestFactor;
    } else {
      // Trying to divide or multiply by 2 and find the best step value
      while (true) {
        if (scaleUp && Chartist.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
          bounds.step *= 2;
        } else if (!scaleUp && Chartist.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
          bounds.step /= 2;
          if(onlyInteger && bounds.step % 1 !== 0) {
            bounds.step *= 2;
            break;
          }
        } else {
          break;
        }

        if(optimizationCounter++ > 1000) {
          throw new Error('Exceeded maximum number of iterations while optimizing scale step!');
        }
      }
    }

    // Narrow min and max based on new step
    newMin = bounds.min;
    newMax = bounds.max;
    while(newMin + bounds.step <= bounds.low) {
      newMin += bounds.step;
    }
    while(newMax - bounds.step >= bounds.high) {
      newMax -= bounds.step;
    }
    bounds.min = newMin;
    bounds.max = newMax;
    bounds.range = bounds.max - bounds.min;

    bounds.values = [];
    for (i = bounds.min; i <= bounds.max; i += bounds.step) {
      bounds.values.push(Chartist.roundWithPrecision(i));
    }

    return bounds;
  };

  /**
   * Calculate cartesian coordinates of polar coordinates
   *
   * @memberof Chartist.Core
   * @param {Number} centerX X-axis coordinates of center point of circle segment
   * @param {Number} centerY X-axis coordinates of center point of circle segment
   * @param {Number} radius Radius of circle segment
   * @param {Number} angleInDegrees Angle of circle segment in degrees
   * @return {{x:Number, y:Number}} Coordinates of point on circumference
   */
  Chartist.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  /**
   * Initialize chart drawing rectangle (area where chart is drawn) x1,y1 = bottom left / x2,y2 = top right
   *
   * @memberof Chartist.Core
   * @param {Object} svg The svg element for the chart
   * @param {Object} options The Object that contains all the optional values for the chart
   * @param {Number} [fallbackPadding] The fallback padding if partial padding objects are used
   * @return {Object} The chart rectangles coordinates inside the svg element plus the rectangles measurements
   */
  Chartist.createChartRect = function (svg, options, fallbackPadding) {
    var hasAxis = !!(options.axisX || options.axisY);
    var yAxisOffset = hasAxis ? options.axisY.offset : 0;
    var xAxisOffset = hasAxis ? options.axisX.offset : 0;
    // If width or height results in invalid value (including 0) we fallback to the unitless settings or even 0
    var width = svg.width() || Chartist.quantity(options.width).value || 0;
    var height = svg.height() || Chartist.quantity(options.height).value || 0;
    var normalizedPadding = Chartist.normalizePadding(options.chartPadding, fallbackPadding);

    // If settings were to small to cope with offset (legacy) and padding, we'll adjust
    width = Math.max(width, yAxisOffset + normalizedPadding.left + normalizedPadding.right);
    height = Math.max(height, xAxisOffset + normalizedPadding.top + normalizedPadding.bottom);

    var chartRect = {
      padding: normalizedPadding,
      width: function () {
        return this.x2 - this.x1;
      },
      height: function () {
        return this.y1 - this.y2;
      }
    };

    if(hasAxis) {
      if (options.axisX.position === 'start') {
        chartRect.y2 = normalizedPadding.top + xAxisOffset;
        chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
      } else {
        chartRect.y2 = normalizedPadding.top;
        chartRect.y1 = Math.max(height - normalizedPadding.bottom - xAxisOffset, chartRect.y2 + 1);
      }

      if (options.axisY.position === 'start') {
        chartRect.x1 = normalizedPadding.left + yAxisOffset;
        chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
      } else {
        chartRect.x1 = normalizedPadding.left;
        chartRect.x2 = Math.max(width - normalizedPadding.right - yAxisOffset, chartRect.x1 + 1);
      }
    } else {
      chartRect.x1 = normalizedPadding.left;
      chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
      chartRect.y2 = normalizedPadding.top;
      chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
    }

    return chartRect;
  };

  /**
   * Creates a grid line based on a projected value.
   *
   * @memberof Chartist.Core
   * @param position
   * @param index
   * @param axis
   * @param offset
   * @param length
   * @param group
   * @param classes
   * @param eventEmitter
   */
  Chartist.createGrid = function(position, index, axis, offset, length, group, classes, eventEmitter) {
    var positionalData = {};
    positionalData[axis.units.pos + '1'] = position;
    positionalData[axis.units.pos + '2'] = position;
    positionalData[axis.counterUnits.pos + '1'] = offset;
    positionalData[axis.counterUnits.pos + '2'] = offset + length;

    var gridElement = group.elem('line', positionalData, classes.join(' '));

    // Event for grid draw
    eventEmitter.emit('draw',
      Chartist.extend({
        type: 'grid',
        axis: axis,
        index: index,
        group: group,
        element: gridElement
      }, positionalData)
    );
  };

  /**
   * Creates a label based on a projected value and an axis.
   *
   * @memberof Chartist.Core
   * @param position
   * @param length
   * @param index
   * @param labels
   * @param axis
   * @param axisOffset
   * @param labelOffset
   * @param group
   * @param classes
   * @param useForeignObject
   * @param eventEmitter
   */
  Chartist.createLabel = function(position, length, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
    var labelElement;
    var positionalData = {};

    positionalData[axis.units.pos] = position + labelOffset[axis.units.pos];
    positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
    positionalData[axis.units.len] = length;
    positionalData[axis.counterUnits.len] = axisOffset - 10;

    if(useForeignObject) {
      // We need to set width and height explicitly to px as span will not expand with width and height being
      // 100% in all browsers
      var content = '<span class="' + classes.join(' ') + '" style="' +
        axis.units.len + ': ' + Math.round(positionalData[axis.units.len]) + 'px; ' +
        axis.counterUnits.len + ': ' + Math.round(positionalData[axis.counterUnits.len]) + 'px">' +
        labels[index] + '</span>';

      labelElement = group.foreignObject(content, Chartist.extend({
        style: 'overflow: visible;'
      }, positionalData));
    } else {
      labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
    }

    eventEmitter.emit('draw', Chartist.extend({
      type: 'label',
      axis: axis,
      index: index,
      group: group,
      element: labelElement,
      text: labels[index]
    }, positionalData));
  };

  /**
   * Helper to read series specific options from options object. It automatically falls back to the global option if
   * there is no option in the series options.
   *
   * @param {Object} series Series object
   * @param {Object} options Chartist options object
   * @param {string} key The options key that should be used to obtain the options
   * @returns {*}
   */
  Chartist.getSeriesOption = function(series, options, key) {
    if(series.name && options.series && options.series[series.name]) {
      var seriesOptions = options.series[series.name];
      return seriesOptions.hasOwnProperty(key) ? seriesOptions[key] : options[key];
    } else {
      return options[key];
    }
  };

  /**
   * Provides options handling functionality with callback for options changes triggered by responsive options and media query matches
   *
   * @memberof Chartist.Core
   * @param {Object} options Options set by user
   * @param {Array} responsiveOptions Optional functions to add responsive behavior to chart
   * @param {Object} eventEmitter The event emitter that will be used to emit the options changed events
   * @return {Object} The consolidated options object from the defaults, base and matching responsive options
   */
  Chartist.optionsProvider = function (options, responsiveOptions, eventEmitter) {
    var baseOptions = Chartist.extend({}, options),
      currentOptions,
      mediaQueryListeners = [],
      i;

    function updateCurrentOptions(preventChangedEvent) {
      var previousOptions = currentOptions;
      currentOptions = Chartist.extend({}, baseOptions);

      if (responsiveOptions) {
        for (i = 0; i < responsiveOptions.length; i++) {
          var mql = window.matchMedia(responsiveOptions[i][0]);
          if (mql.matches) {
            currentOptions = Chartist.extend(currentOptions, responsiveOptions[i][1]);
          }
        }
      }

      if(eventEmitter && !preventChangedEvent) {
        eventEmitter.emit('optionsChanged', {
          previousOptions: previousOptions,
          currentOptions: currentOptions
        });
      }
    }

    function removeMediaQueryListeners() {
      mediaQueryListeners.forEach(function(mql) {
        mql.removeListener(updateCurrentOptions);
      });
    }

    if (!window.matchMedia) {
      throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
    } else if (responsiveOptions) {

      for (i = 0; i < responsiveOptions.length; i++) {
        var mql = window.matchMedia(responsiveOptions[i][0]);
        mql.addListener(updateCurrentOptions);
        mediaQueryListeners.push(mql);
      }
    }
    // Execute initially so we get the correct options
    updateCurrentOptions(true);

    return {
      removeMediaQueryListeners: removeMediaQueryListeners,
      getCurrentOptions: function getCurrentOptions() {
        return Chartist.extend({}, currentOptions);
      }
    };
  };

}(window, document, Chartist));
;/**
 * Chartist path interpolation functions.
 *
 * @module Chartist.Interpolation
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  Chartist.Interpolation = {};

  /**
   * This interpolation function does not smooth the path and the result is only containing lines and no curves.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.none({
   *     fillHoles: false
   *   })
   * });
   *
   *
   * @memberof Chartist.Interpolation
   * @return {Function}
   */
  Chartist.Interpolation.none = function(options) {
    var defaultOptions = {
      fillHoles: false
    };
    options = Chartist.extend({}, defaultOptions, options);
    return function none(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();
      var hole = true;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var currData = valueData[i / 2];

        if(currData.value !== undefined) {

          if(hole) {
            path.move(currX, currY, false, currData);
          } else {
            path.line(currX, currY, false, currData);
          }

          hole = false;
        } else if(!options.fillHoles) {
          hole = true;
        }
      }

      return path;
    };
  };

  /**
   * Simple smoothing creates horizontal handles that are positioned with a fraction of the length between two data points. You can use the divisor option to specify the amount of smoothing.
   *
   * Simple smoothing can be used instead of `Chartist.Smoothing.cardinal` if you'd like to get rid of the artifacts it produces sometimes. Simple smoothing produces less flowing lines but is accurate by hitting the points and it also doesn't swing below or above the given data point.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The simple interpolation function accepts one configuration parameter `divisor`, between 1 and ∞, which controls the smoothing characteristics.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.simple({
   *     divisor: 2,
   *     fillHoles: false
   *   })
   * });
   *
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the simple interpolation factory function.
   * @return {Function}
   */
  Chartist.Interpolation.simple = function(options) {
    var defaultOptions = {
      divisor: 2,
      fillHoles: false
    };
    options = Chartist.extend({}, defaultOptions, options);

    var d = 1 / Math.max(1, options.divisor);

    return function simple(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();
      var prevX, prevY, prevData;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var length = (currX - prevX) * d;
        var currData = valueData[i / 2];

        if(currData.value !== undefined) {

          if(prevData === undefined) {
            path.move(currX, currY, false, currData);
          } else {
            path.curve(
              prevX + length,
              prevY,
              currX - length,
              currY,
              currX,
              currY,
              false,
              currData
            );
          }

          prevX = currX;
          prevY = currY;
          prevData = currData;
        } else if(!options.fillHoles) {
          prevX = currX = prevData = undefined;
        }
      }

      return path;
    };
  };

  /**
   * Cardinal / Catmull-Rome spline interpolation is the default smoothing function in Chartist. It produces nice results where the splines will always meet the points. It produces some artifacts though when data values are increased or decreased rapidly. The line may not follow a very accurate path and if the line should be accurate this smoothing function does not produce the best results.
   *
   * Cardinal splines can only be created if there are more than two data points. If this is not the case this smoothing will fallback to `Chartist.Smoothing.none`.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The cardinal interpolation function accepts one configuration parameter `tension`, between 0 and 1, which controls the smoothing intensity.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 1,
   *     fillHoles: false
   *   })
   * });
   *
   * @memberof Chartist.Interpolation
   * @param {Object} options The options of the cardinal factory function.
   * @return {Function}
   */
  Chartist.Interpolation.cardinal = function(options) {
    var defaultOptions = {
      tension: 1,
      fillHoles: false
    };

    options = Chartist.extend({}, defaultOptions, options);

    var t = Math.min(1, Math.max(0, options.tension)),
      c = 1 - t;

    // This function will help us to split pathCoordinates and valueData into segments that also contain pathCoordinates
    // and valueData. This way the existing functions can be reused and the segment paths can be joined afterwards.
    // This functionality is necessary to treat "holes" in the line charts
    function splitIntoSegments(pathCoordinates, valueData) {
      var segments = [];
      var hole = true;

      for(var i = 0; i < pathCoordinates.length; i += 2) {
        // If this value is a "hole" we set the hole flag
        if(valueData[i / 2].value === undefined) {
          if(!options.fillHoles) {
            hole = true;
          }
        } else {
          // If it's a valid value we need to check if we're coming out of a hole and create a new empty segment
          if(hole) {
            segments.push({
              pathCoordinates: [],
              valueData: []
            });
            // As we have a valid value now, we are not in a "hole" anymore
            hole = false;
          }

          // Add to the segment pathCoordinates and valueData
          segments[segments.length - 1].pathCoordinates.push(pathCoordinates[i], pathCoordinates[i + 1]);
          segments[segments.length - 1].valueData.push(valueData[i / 2]);
        }
      }

      return segments;
    }

    return function cardinal(pathCoordinates, valueData) {
      // First we try to split the coordinates into segments
      // This is necessary to treat "holes" in line charts
      var segments = splitIntoSegments(pathCoordinates, valueData);

      // If the split resulted in more that one segment we need to interpolate each segment individually and join them
      // afterwards together into a single path.
      if(segments.length > 1) {
        var paths = [];
        // For each segment we will recurse the cardinal function
        segments.forEach(function(segment) {
          paths.push(cardinal(segment.pathCoordinates, segment.valueData));
        });
        // Join the segment path data into a single path and return
        return Chartist.Svg.Path.join(paths);
      } else {
        // If there was only one segment we can proceed regularly by using pathCoordinates and valueData from the first
        // segment
        pathCoordinates = segments[0].pathCoordinates;
        valueData = segments[0].valueData;

        // If less than two points we need to fallback to no smoothing
        if(pathCoordinates.length <= 4) {
          return Chartist.Interpolation.none()(pathCoordinates, valueData);
        }

        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1], false, valueData[0]),
          z;

        for (var i = 0, iLen = pathCoordinates.length; iLen - 2 * !z > i; i += 2) {
          var p = [
            {x: +pathCoordinates[i - 2], y: +pathCoordinates[i - 1]},
            {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]},
            {x: +pathCoordinates[i + 2], y: +pathCoordinates[i + 3]},
            {x: +pathCoordinates[i + 4], y: +pathCoordinates[i + 5]}
          ];
          if (z) {
            if (!i) {
              p[0] = {x: +pathCoordinates[iLen - 2], y: +pathCoordinates[iLen - 1]};
            } else if (iLen - 4 === i) {
              p[3] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
            } else if (iLen - 2 === i) {
              p[2] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
              p[3] = {x: +pathCoordinates[2], y: +pathCoordinates[3]};
            }
          } else {
            if (iLen - 4 === i) {
              p[3] = p[2];
            } else if (!i) {
              p[0] = {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]};
            }
          }

          path.curve(
            (t * (-p[0].x + 6 * p[1].x + p[2].x) / 6) + (c * p[2].x),
            (t * (-p[0].y + 6 * p[1].y + p[2].y) / 6) + (c * p[2].y),
            (t * (p[1].x + 6 * p[2].x - p[3].x) / 6) + (c * p[2].x),
            (t * (p[1].y + 6 * p[2].y - p[3].y) / 6) + (c * p[2].y),
            p[2].x,
            p[2].y,
            false,
            valueData[(i + 2) / 2]
          );
        }

        return path;
      }
    };
  };

  /**
   * Step interpolation will cause the line chart to move in steps rather than diagonal or smoothed lines. This interpolation will create additional points that will also be drawn when the `showPoint` option is enabled.
   *
   * All smoothing functions within Chartist are factory functions that accept an options parameter. The step interpolation function accepts one configuration parameter `postpone`, that can be `true` or `false`. The default value is `true` and will cause the step to occur where the value actually changes. If a different behaviour is needed where the step is shifted to the left and happens before the actual value, this option can be set to `false`.
   *
   * @example
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [[1, 2, 8, 1, 7]]
   * }, {
   *   lineSmooth: Chartist.Interpolation.step({
   *     postpone: true,
   *     fillHoles: false
   *   })
   * });
   *
   * @memberof Chartist.Interpolation
   * @param options
   * @returns {Function}
   */
  Chartist.Interpolation.step = function(options) {
    var defaultOptions = {
      postpone: true,
      fillHoles: false
    };

    options = Chartist.extend({}, defaultOptions, options);

    return function step(pathCoordinates, valueData) {
      var path = new Chartist.Svg.Path();

      var prevX, prevY, prevData;

      for (var i = 0; i < pathCoordinates.length; i += 2) {
        var currX = pathCoordinates[i];
        var currY = pathCoordinates[i + 1];
        var currData = valueData[i / 2];

        // If the current point is also not a hole we can draw the step lines
        if(currData.value !== undefined) {
          if(prevData === undefined) {
            path.move(currX, currY, false, currData);
          } else {
            if(options.postpone) {
              // If postponed we should draw the step line with the value of the previous value
              path.line(currX, prevY, false, prevData);
            } else {
              // If not postponed we should draw the step line with the value of the current value
              path.line(prevX, currY, false, currData);
            }
            // Line to the actual point (this should only be a Y-Axis movement
            path.line(currX, currY, false, currData);
          }

          prevX = currX;
          prevY = currY;
          prevData = currData;
        } else if(!options.fillHoles) {
          prevX = prevY = prevData = undefined;
        }
      }

      return path;
    };
  };

}(window, document, Chartist));
;/**
 * A very basic event module that helps to generate and catch events.
 *
 * @module Chartist.Event
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  Chartist.EventEmitter = function () {
    var handlers = [];

    /**
     * Add an event handler for a specific event
     *
     * @memberof Chartist.Event
     * @param {String} event The event name
     * @param {Function} handler A event handler function
     */
    function addEventHandler(event, handler) {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
    }

    /**
     * Remove an event handler of a specific event name or remove all event handlers for a specific event.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name where a specific or all handlers should be removed
     * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
     */
    function removeEventHandler(event, handler) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        // If handler is set we will look for a specific handler and only remove this
        if(handler) {
          handlers[event].splice(handlers[event].indexOf(handler), 1);
          if(handlers[event].length === 0) {
            delete handlers[event];
          }
        } else {
          // If no handler is specified we remove all handlers for this event
          delete handlers[event];
        }
      }
    }

    /**
     * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
     *
     * @memberof Chartist.Event
     * @param {String} event The event name that should be triggered
     * @param {*} data Arbitrary data that will be passed to the event handler callback functions
     */
    function emit(event, data) {
      // Only do something if there are event handlers with this name existing
      if(handlers[event]) {
        handlers[event].forEach(function(handler) {
          handler(data);
        });
      }

      // Emit event to star event handlers
      if(handlers['*']) {
        handlers['*'].forEach(function(starHandler) {
          starHandler(event, data);
        });
      }
    }

    return {
      addEventHandler: addEventHandler,
      removeEventHandler: removeEventHandler,
      emit: emit
    };
  };

}(window, document, Chartist));
;/**
 * This module provides some basic prototype inheritance utilities.
 *
 * @module Chartist.Class
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  function listToArray(list) {
    var arr = [];
    if (list.length) {
      for (var i = 0; i < list.length; i++) {
        arr.push(list[i]);
      }
    }
    return arr;
  }

  /**
   * Method to extend from current prototype.
   *
   * @memberof Chartist.Class
   * @param {Object} properties The object that serves as definition for the prototype that gets created for the new class. This object should always contain a constructor property that is the desired constructor for the newly created class.
   * @param {Object} [superProtoOverride] By default extens will use the current class prototype or Chartist.class. With this parameter you can specify any super prototype that will be used.
   * @return {Function} Constructor function of the new class
   *
   * @example
   * var Fruit = Class.extend({
     * color: undefined,
     *   sugar: undefined,
     *
     *   constructor: function(color, sugar) {
     *     this.color = color;
     *     this.sugar = sugar;
     *   },
     *
     *   eat: function() {
     *     this.sugar = 0;
     *     return this;
     *   }
     * });
   *
   * var Banana = Fruit.extend({
     *   length: undefined,
     *
     *   constructor: function(length, sugar) {
     *     Banana.super.constructor.call(this, 'Yellow', sugar);
     *     this.length = length;
     *   }
     * });
   *
   * var banana = new Banana(20, 40);
   * console.log('banana instanceof Fruit', banana instanceof Fruit);
   * console.log('Fruit is prototype of banana', Fruit.prototype.isPrototypeOf(banana));
   * console.log('bananas prototype is Fruit', Object.getPrototypeOf(banana) === Fruit.prototype);
   * console.log(banana.sugar);
   * console.log(banana.eat().sugar);
   * console.log(banana.color);
   */
  function extend(properties, superProtoOverride) {
    var superProto = superProtoOverride || this.prototype || Chartist.Class;
    var proto = Object.create(superProto);

    Chartist.Class.cloneDefinitions(proto, properties);

    var constr = function() {
      var fn = proto.constructor || function () {},
        instance;

      // If this is linked to the Chartist namespace the constructor was not called with new
      // To provide a fallback we will instantiate here and return the instance
      instance = this === Chartist ? Object.create(proto) : this;
      fn.apply(instance, Array.prototype.slice.call(arguments, 0));

      // If this constructor was not called with new we need to return the instance
      // This will not harm when the constructor has been called with new as the returned value is ignored
      return instance;
    };

    constr.prototype = proto;
    constr.super = superProto;
    constr.extend = this.extend;

    return constr;
  }

  // Variable argument list clones args > 0 into args[0] and retruns modified args[0]
  function cloneDefinitions() {
    var args = listToArray(arguments);
    var target = args[0];

    args.splice(1, args.length - 1).forEach(function (source) {
      Object.getOwnPropertyNames(source).forEach(function (propName) {
        // If this property already exist in target we delete it first
        delete target[propName];
        // Define the property with the descriptor from source
        Object.defineProperty(target, propName,
          Object.getOwnPropertyDescriptor(source, propName));
      });
    });

    return target;
  }

  Chartist.Class = {
    extend: extend,
    cloneDefinitions: cloneDefinitions
  };

}(window, document, Chartist));
;/**
 * Base for all chart types. The methods in Chartist.Base are inherited to all chart types.
 *
 * @module Chartist.Base
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  // TODO: Currently we need to re-draw the chart on window resize. This is usually very bad and will affect performance.
  // This is done because we can't work with relative coordinates when drawing the chart because SVG Path does not
  // work with relative positions yet. We need to check if we can do a viewBox hack to switch to percentage.
  // See http://mozilla.6506.n7.nabble.com/Specyfing-paths-with-percentages-unit-td247474.html
  // Update: can be done using the above method tested here: http://codepen.io/gionkunz/pen/KDvLj
  // The problem is with the label offsets that can't be converted into percentage and affecting the chart container
  /**
   * Updates the chart which currently does a full reconstruction of the SVG DOM
   *
   * @param {Object} [data] Optional data you'd like to set for the chart before it will update. If not specified the update method will use the data that is already configured with the chart.
   * @param {Object} [options] Optional options you'd like to add to the previous options for the chart before it will update. If not specified the update method will use the options that have been already configured with the chart.
   * @param {Boolean} [override] If set to true, the passed options will be used to extend the options that have been configured already. Otherwise the chart default options will be used as the base
   * @memberof Chartist.Base
   */
  function update(data, options, override) {
    if(data) {
      this.data = data;
      // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
      this.eventEmitter.emit('data', {
        type: 'update',
        data: this.data
      });
    }

    if(options) {
      this.options = Chartist.extend({}, override ? this.options : this.defaultOptions, options);

      // If chartist was not initialized yet, we just set the options and leave the rest to the initialization
      // Otherwise we re-create the optionsProvider at this point
      if(!this.initializeTimeoutId) {
        this.optionsProvider.removeMediaQueryListeners();
        this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
      }
    }

    // Only re-created the chart if it has been initialized yet
    if(!this.initializeTimeoutId) {
      this.createChart(this.optionsProvider.getCurrentOptions());
    }

    // Return a reference to the chart object to chain up calls
    return this;
  }

  /**
   * This method can be called on the API object of each chart and will un-register all event listeners that were added to other components. This currently includes a window.resize listener as well as media query listeners if any responsive options have been provided. Use this function if you need to destroy and recreate Chartist charts dynamically.
   *
   * @memberof Chartist.Base
   */
  function detach() {
    // Only detach if initialization already occurred on this chart. If this chart still hasn't initialized (therefore
    // the initializationTimeoutId is still a valid timeout reference, we will clear the timeout
    if(!this.initializeTimeoutId) {
      window.removeEventListener('resize', this.resizeListener);
      this.optionsProvider.removeMediaQueryListeners();
    } else {
      window.clearTimeout(this.initializeTimeoutId);
    }

    return this;
  }

  /**
   * Use this function to register event handlers. The handler callbacks are synchronous and will run in the main thread rather than the event loop.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event. Check the examples for supported events.
   * @param {Function} handler The handler function that will be called when an event with the given name was emitted. This function will receive a data argument which contains event data. See the example for more details.
   */
  function on(event, handler) {
    this.eventEmitter.addEventHandler(event, handler);
    return this;
  }

  /**
   * Use this function to un-register event handlers. If the handler function parameter is omitted all handlers for the given event will be un-registered.
   *
   * @memberof Chartist.Base
   * @param {String} event Name of the event for which a handler should be removed
   * @param {Function} [handler] The handler function that that was previously used to register a new event handler. This handler will be removed from the event handler list. If this parameter is omitted then all event handlers for the given event are removed from the list.
   */
  function off(event, handler) {
    this.eventEmitter.removeEventHandler(event, handler);
    return this;
  }

  function initialize() {
    // Add window resize listener that re-creates the chart
    window.addEventListener('resize', this.resizeListener);

    // Obtain current options based on matching media queries (if responsive options are given)
    // This will also register a listener that is re-creating the chart based on media changes
    this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
    // Register options change listener that will trigger a chart update
    this.eventEmitter.addEventHandler('optionsChanged', function() {
      this.update();
    }.bind(this));

    // Before the first chart creation we need to register us with all plugins that are configured
    // Initialize all relevant plugins with our chart object and the plugin options specified in the config
    if(this.options.plugins) {
      this.options.plugins.forEach(function(plugin) {
        if(plugin instanceof Array) {
          plugin[0](this, plugin[1]);
        } else {
          plugin(this);
        }
      }.bind(this));
    }

    // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
    this.eventEmitter.emit('data', {
      type: 'initial',
      data: this.data
    });

    // Create the first chart
    this.createChart(this.optionsProvider.getCurrentOptions());

    // As chart is initialized from the event loop now we can reset our timeout reference
    // This is important if the chart gets initialized on the same element twice
    this.initializeTimeoutId = undefined;
  }

  /**
   * Constructor of chart base class.
   *
   * @param query
   * @param data
   * @param defaultOptions
   * @param options
   * @param responsiveOptions
   * @constructor
   */
  function Base(query, data, defaultOptions, options, responsiveOptions) {
    this.container = Chartist.querySelector(query);
    this.data = data;
    this.defaultOptions = defaultOptions;
    this.options = options;
    this.responsiveOptions = responsiveOptions;
    this.eventEmitter = Chartist.EventEmitter();
    this.supportsForeignObject = Chartist.Svg.isSupported('Extensibility');
    this.supportsAnimations = Chartist.Svg.isSupported('AnimationEventsAttribute');
    this.resizeListener = function resizeListener(){
      this.update();
    }.bind(this);

    if(this.container) {
      // If chartist was already initialized in this container we are detaching all event listeners first
      if(this.container.__chartist__) {
        this.container.__chartist__.detach();
      }

      this.container.__chartist__ = this;
    }

    // Using event loop for first draw to make it possible to register event listeners in the same call stack where
    // the chart was created.
    this.initializeTimeoutId = setTimeout(initialize.bind(this), 0);
  }

  // Creating the chart base class
  Chartist.Base = Chartist.Class.extend({
    constructor: Base,
    optionsProvider: undefined,
    container: undefined,
    svg: undefined,
    eventEmitter: undefined,
    createChart: function() {
      throw new Error('Base chart type can\'t be instantiated!');
    },
    update: update,
    detach: detach,
    on: on,
    off: off,
    version: Chartist.version,
    supportsForeignObject: false
  });

}(window, document, Chartist));
;/**
 * Chartist SVG module for simple SVG DOM abstraction
 *
 * @module Chartist.Svg
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  var svgNs = 'http://www.w3.org/2000/svg',
    xmlNs = 'http://www.w3.org/2000/xmlns/',
    xhtmlNs = 'http://www.w3.org/1999/xhtml';

  Chartist.xmlNs = {
    qualifiedName: 'xmlns:ct',
    prefix: 'ct',
    uri: 'http://gionkunz.github.com/chartist-js/ct'
  };

  /**
   * Chartist.Svg creates a new SVG object wrapper with a starting element. You can use the wrapper to fluently create sub-elements and modify them.
   *
   * @memberof Chartist.Svg
   * @constructor
   * @param {String|Element} name The name of the SVG element to create or an SVG dom element which should be wrapped into Chartist.Svg
   * @param {Object} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} className This class or class list will be added to the SVG element
   * @param {Object} parent The parent SVG wrapper object where this newly created wrapper and it's element will be attached to as child
   * @param {Boolean} insertFirst If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   */
  function Svg(name, attributes, className, parent, insertFirst) {
    // If Svg is getting called with an SVG element we just return the wrapper
    if(name instanceof Element) {
      this._node = name;
    } else {
      this._node = document.createElementNS(svgNs, name);

      // If this is an SVG element created then custom namespace
      if(name === 'svg') {
        this._node.setAttributeNS(xmlNs, Chartist.xmlNs.qualifiedName, Chartist.xmlNs.uri);
      }
    }

    if(attributes) {
      this.attr(attributes);
    }

    if(className) {
      this.addClass(className);
    }

    if(parent) {
      if (insertFirst && parent._node.firstChild) {
        parent._node.insertBefore(this._node, parent._node.firstChild);
      } else {
        parent._node.appendChild(this._node);
      }
    }
  }

  /**
   * Set attributes on the current SVG element of the wrapper you're currently working on.
   *
   * @memberof Chartist.Svg
   * @param {Object|String} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added. If this parameter is a String then the function is used as a getter and will return the attribute value.
   * @param {String} ns If specified, the attributes will be set as namespace attributes with ns as prefix.
   * @return {Object|String} The current wrapper object will be returned so it can be used for chaining or the attribute value if used as getter function.
   */
  function attr(attributes, ns) {
    if(typeof attributes === 'string') {
      if(ns) {
        return this._node.getAttributeNS(ns, attributes);
      } else {
        return this._node.getAttribute(attributes);
      }
    }

    Object.keys(attributes).forEach(function(key) {
      // If the attribute value is undefined we can skip this one
      if(attributes[key] === undefined) {
        return;
      }

      if(ns) {
        this._node.setAttributeNS(ns, [Chartist.xmlNs.prefix, ':', key].join(''), attributes[key]);
      } else {
        this._node.setAttribute(key, attributes[key]);
      }
    }.bind(this));

    return this;
  }

  /**
   * Create a new SVG element whose wrapper object will be selected for further operations. This way you can also create nested groups easily.
   *
   * @memberof Chartist.Svg
   * @param {String} name The name of the SVG element that should be created as child element of the currently selected element wrapper
   * @param {Object} [attributes] An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper object that can be used to modify the containing SVG data
   */
  function elem(name, attributes, className, insertFirst) {
    return new Chartist.Svg(name, attributes, className, this, insertFirst);
  }

  /**
   * Returns the parent Chartist.SVG wrapper object
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper around the parent node of the current node. If the parent node is not existing or it's not an SVG node then this function will return null.
   */
  function parent() {
    return this._node.parentNode instanceof SVGElement ? new Chartist.Svg(this._node.parentNode) : null;
  }

  /**
   * This method returns a Chartist.Svg wrapper around the root SVG element of the current tree.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The root SVG element wrapped in a Chartist.Svg element
   */
  function root() {
    var node = this._node;
    while(node.nodeName !== 'svg') {
      node = node.parentNode;
    }
    return new Chartist.Svg(node);
  }

  /**
   * Find the first child SVG element of the current element that matches a CSS selector. The returned object is a Chartist.Svg wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg} The SVG wrapper for the element found or null if no element was found
   */
  function querySelector(selector) {
    var foundNode = this._node.querySelector(selector);
    return foundNode ? new Chartist.Svg(foundNode) : null;
  }

  /**
   * Find the all child SVG elements of the current element that match a CSS selector. The returned object is a Chartist.Svg.List wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} selector A CSS selector that is used to query for child SVG elements
   * @return {Chartist.Svg.List} The SVG wrapper list for the element found or null if no element was found
   */
  function querySelectorAll(selector) {
    var foundNodes = this._node.querySelectorAll(selector);
    return foundNodes.length ? new Chartist.Svg.List(foundNodes) : null;
  }

  /**
   * This method creates a foreignObject (see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) that allows to embed HTML content into a SVG graphic. With the help of foreignObjects you can enable the usage of regular HTML elements inside of SVG where they are subject for SVG positioning and transformation but the Browser will use the HTML rendering capabilities for the containing DOM.
   *
   * @memberof Chartist.Svg
   * @param {Node|String} content The DOM Node, or HTML string that will be converted to a DOM Node, that is then placed into and wrapped by the foreignObject
   * @param {String} [attributes] An object with properties that will be added as attributes to the foreignObject element that is created. Attributes with undefined values will not be added.
   * @param {String} [className] This class or class list will be added to the SVG element
   * @param {Boolean} [insertFirst] Specifies if the foreignObject should be inserted as first child
   * @return {Chartist.Svg} New wrapper object that wraps the foreignObject element
   */
  function foreignObject(content, attributes, className, insertFirst) {
    // If content is string then we convert it to DOM
    // TODO: Handle case where content is not a string nor a DOM Node
    if(typeof content === 'string') {
      var container = document.createElement('div');
      container.innerHTML = content;
      content = container.firstChild;
    }

    // Adding namespace to content element
    content.setAttribute('xmlns', xhtmlNs);

    // Creating the foreignObject without required extension attribute (as described here
    // http://www.w3.org/TR/SVG/extend.html#ForeignObjectElement)
    var fnObj = this.elem('foreignObject', attributes, className, insertFirst);

    // Add content to foreignObjectElement
    fnObj._node.appendChild(content);

    return fnObj;
  }

  /**
   * This method adds a new text element to the current Chartist.Svg wrapper.
   *
   * @memberof Chartist.Svg
   * @param {String} t The text that should be added to the text element that is created
   * @return {Chartist.Svg} The same wrapper object that was used to add the newly created element
   */
  function text(t) {
    this._node.appendChild(document.createTextNode(t));
    return this;
  }

  /**
   * This method will clear all child nodes of the current wrapper object.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The same wrapper object that got emptied
   */
  function empty() {
    while (this._node.firstChild) {
      this._node.removeChild(this._node.firstChild);
    }

    return this;
  }

  /**
   * This method will cause the current wrapper to remove itself from its parent wrapper. Use this method if you'd like to get rid of an element in a given DOM structure.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The parent wrapper object of the element that got removed
   */
  function remove() {
    this._node.parentNode.removeChild(this._node);
    return this.parent();
  }

  /**
   * This method will replace the element with a new element that can be created outside of the current DOM.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} newElement The new Chartist.Svg object that will be used to replace the current wrapper object
   * @return {Chartist.Svg} The wrapper of the new element
   */
  function replace(newElement) {
    this._node.parentNode.replaceChild(newElement._node, this._node);
    return newElement;
  }

  /**
   * This method will append an element to the current element as a child.
   *
   * @memberof Chartist.Svg
   * @param {Chartist.Svg} element The Chartist.Svg element that should be added as a child
   * @param {Boolean} [insertFirst] Specifies if the element should be inserted as first child
   * @return {Chartist.Svg} The wrapper of the appended object
   */
  function append(element, insertFirst) {
    if(insertFirst && this._node.firstChild) {
      this._node.insertBefore(element._node, this._node.firstChild);
    } else {
      this._node.appendChild(element._node);
    }

    return this;
  }

  /**
   * Returns an array of class names that are attached to the current wrapper element. This method can not be chained further.
   *
   * @memberof Chartist.Svg
   * @return {Array} A list of classes or an empty array if there are no classes on the current element
   */
  function classes() {
    return this._node.getAttribute('class') ? this._node.getAttribute('class').trim().split(/\s+/) : [];
  }

  /**
   * Adds one or a space separated list of classes to the current element and ensures the classes are only existing once.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function addClass(names) {
    this._node.setAttribute('class',
      this.classes(this._node)
        .concat(names.trim().split(/\s+/))
        .filter(function(elem, pos, self) {
          return self.indexOf(elem) === pos;
        }).join(' ')
    );

    return this;
  }

  /**
   * Removes one or a space separated list of classes from the current element.
   *
   * @memberof Chartist.Svg
   * @param {String} names A white space separated list of class names
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeClass(names) {
    var removedClasses = names.trim().split(/\s+/);

    this._node.setAttribute('class', this.classes(this._node).filter(function(name) {
      return removedClasses.indexOf(name) === -1;
    }).join(' '));

    return this;
  }

  /**
   * Removes all classes from the current element.
   *
   * @memberof Chartist.Svg
   * @return {Chartist.Svg} The wrapper of the current element
   */
  function removeAllClasses() {
    this._node.setAttribute('class', '');

    return this;
  }

  /**
   * "Save" way to get property value from svg BoundingBox.
   * This is a workaround. Firefox throws an NS_ERROR_FAILURE error if getBBox() is called on an invisible node.
   * See [NS_ERROR_FAILURE: Component returned failure code: 0x80004005](http://jsfiddle.net/sym3tri/kWWDK/)
   *
   * @memberof Chartist.Svg
   * @param {SVGElement} node The svg node to
   * @param {String} prop The property to fetch (ex.: height, width, ...)
   * @returns {Number} The value of the given bbox property
   */
  function getBBoxProperty(node, prop) {
    try {
      return node.getBBox()[prop];
    } catch(e) {}

    return 0;
  }

  /**
   * Get element height with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Svg
   * @return {Number} The elements height in pixels
   */
  function height() {
    return this._node.clientHeight || Math.round(getBBoxProperty(this._node, 'height')) || this._node.parentNode.clientHeight;
  }

  /**
   * Get element width with fallback to svg BoundingBox or parent container dimensions:
   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
   *
   * @memberof Chartist.Core
   * @return {Number} The elements width in pixels
   */
  function width() {
    return this._node.clientWidth || Math.round(getBBoxProperty(this._node, 'width')) || this._node.parentNode.clientWidth;
  }

  /**
   * The animate function lets you animate the current element with SMIL animations. You can add animations for multiple attributes at the same time by using an animation definition object. This object should contain SMIL animation attributes. Please refer to http://www.w3.org/TR/SVG/animate.html for a detailed specification about the available animation attributes. Additionally an easing property can be passed in the animation definition object. This can be a string with a name of an easing function in `Chartist.Svg.Easing` or an array with four numbers specifying a cubic Bézier curve.
   * **An animations object could look like this:**
   * ```javascript
   * element.animate({
   *   opacity: {
   *     dur: 1000,
   *     from: 0,
   *     to: 1
   *   },
   *   x1: {
   *     dur: '1000ms',
   *     from: 100,
   *     to: 200,
   *     easing: 'easeOutQuart'
   *   },
   *   y1: {
   *     dur: '2s',
   *     from: 0,
   *     to: 100
   *   }
   * });
   * ```
   * **Automatic unit conversion**
   * For the `dur` and the `begin` animate attribute you can also omit a unit by passing a number. The number will automatically be converted to milli seconds.
   * **Guided mode**
   * The default behavior of SMIL animations with offset using the `begin` attribute is that the attribute will keep it's original value until the animation starts. Mostly this behavior is not desired as you'd like to have your element attributes already initialized with the animation `from` value even before the animation starts. Also if you don't specify `fill="freeze"` on an animate element or if you delete the animation after it's done (which is done in guided mode) the attribute will switch back to the initial value. This behavior is also not desired when performing simple one-time animations. For one-time animations you'd want to trigger animations immediately instead of relative to the document begin time. That's why in guided mode Chartist.Svg will also use the `begin` property to schedule a timeout and manually start the animation after the timeout. If you're using multiple SMIL definition objects for an attribute (in an array), guided mode will be disabled for this attribute, even if you explicitly enabled it.
   * If guided mode is enabled the following behavior is added:
   * - Before the animation starts (even when delayed with `begin`) the animated attribute will be set already to the `from` value of the animation
   * - `begin` is explicitly set to `indefinite` so it can be started manually without relying on document begin time (creation)
   * - The animate element will be forced to use `fill="freeze"`
   * - The animation will be triggered with `beginElement()` in a timeout where `begin` of the definition object is interpreted in milli seconds. If no `begin` was specified the timeout is triggered immediately.
   * - After the animation the element attribute value will be set to the `to` value of the animation
   * - The animate element is deleted from the DOM
   *
   * @memberof Chartist.Svg
   * @param {Object} animations An animations object where the property keys are the attributes you'd like to animate. The properties should be objects again that contain the SMIL animation attributes (usually begin, dur, from, and to). The property begin and dur is auto converted (see Automatic unit conversion). You can also schedule multiple animations for the same attribute by passing an Array of SMIL definition objects. Attributes that contain an array of SMIL definition objects will not be executed in guided mode.
   * @param {Boolean} guided Specify if guided mode should be activated for this animation (see Guided mode). If not otherwise specified, guided mode will be activated.
   * @param {Object} eventEmitter If specified, this event emitter will be notified when an animation starts or ends.
   * @return {Chartist.Svg} The current element where the animation was added
   */
  function animate(animations, guided, eventEmitter) {
    if(guided === undefined) {
      guided = true;
    }

    Object.keys(animations).forEach(function createAnimateForAttributes(attribute) {

      function createAnimate(animationDefinition, guided) {
        var attributeProperties = {},
          animate,
          timeout,
          easing;

        // Check if an easing is specified in the definition object and delete it from the object as it will not
        // be part of the animate element attributes.
        if(animationDefinition.easing) {
          // If already an easing Bézier curve array we take it or we lookup a easing array in the Easing object
          easing = animationDefinition.easing instanceof Array ?
            animationDefinition.easing :
            Chartist.Svg.Easing[animationDefinition.easing];
          delete animationDefinition.easing;
        }

        // If numeric dur or begin was provided we assume milli seconds
        animationDefinition.begin = Chartist.ensureUnit(animationDefinition.begin, 'ms');
        animationDefinition.dur = Chartist.ensureUnit(animationDefinition.dur, 'ms');

        if(easing) {
          animationDefinition.calcMode = 'spline';
          animationDefinition.keySplines = easing.join(' ');
          animationDefinition.keyTimes = '0;1';
        }

        // Adding "fill: freeze" if we are in guided mode and set initial attribute values
        if(guided) {
          animationDefinition.fill = 'freeze';
          // Animated property on our element should already be set to the animation from value in guided mode
          attributeProperties[attribute] = animationDefinition.from;
          this.attr(attributeProperties);

          // In guided mode we also set begin to indefinite so we can trigger the start manually and put the begin
          // which needs to be in ms aside
          timeout = Chartist.quantity(animationDefinition.begin || 0).value;
          animationDefinition.begin = 'indefinite';
        }

        animate = this.elem('animate', Chartist.extend({
          attributeName: attribute
        }, animationDefinition));

        if(guided) {
          // If guided we take the value that was put aside in timeout and trigger the animation manually with a timeout
          setTimeout(function() {
            // If beginElement fails we set the animated attribute to the end position and remove the animate element
            // This happens if the SMIL ElementTimeControl interface is not supported or any other problems occured in
            // the browser. (Currently FF 34 does not support animate elements in foreignObjects)
            try {
              animate._node.beginElement();
            } catch(err) {
              // Set animated attribute to current animated value
              attributeProperties[attribute] = animationDefinition.to;
              this.attr(attributeProperties);
              // Remove the animate element as it's no longer required
              animate.remove();
            }
          }.bind(this), timeout);
        }

        if(eventEmitter) {
          animate._node.addEventListener('beginEvent', function handleBeginEvent() {
            eventEmitter.emit('animationBegin', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }.bind(this));
        }

        animate._node.addEventListener('endEvent', function handleEndEvent() {
          if(eventEmitter) {
            eventEmitter.emit('animationEnd', {
              element: this,
              animate: animate._node,
              params: animationDefinition
            });
          }

          if(guided) {
            // Set animated attribute to current animated value
            attributeProperties[attribute] = animationDefinition.to;
            this.attr(attributeProperties);
            // Remove the animate element as it's no longer required
            animate.remove();
          }
        }.bind(this));
      }

      // If current attribute is an array of definition objects we create an animate for each and disable guided mode
      if(animations[attribute] instanceof Array) {
        animations[attribute].forEach(function(animationDefinition) {
          createAnimate.bind(this)(animationDefinition, false);
        }.bind(this));
      } else {
        createAnimate.bind(this)(animations[attribute], guided);
      }

    }.bind(this));

    return this;
  }

  Chartist.Svg = Chartist.Class.extend({
    constructor: Svg,
    attr: attr,
    elem: elem,
    parent: parent,
    root: root,
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    foreignObject: foreignObject,
    text: text,
    empty: empty,
    remove: remove,
    replace: replace,
    append: append,
    classes: classes,
    addClass: addClass,
    removeClass: removeClass,
    removeAllClasses: removeAllClasses,
    height: height,
    width: width,
    animate: animate
  });

  /**
   * This method checks for support of a given SVG feature like Extensibility, SVG-animation or the like. Check http://www.w3.org/TR/SVG11/feature for a detailed list.
   *
   * @memberof Chartist.Svg
   * @param {String} feature The SVG 1.1 feature that should be checked for support.
   * @return {Boolean} True of false if the feature is supported or not
   */
  Chartist.Svg.isSupported = function(feature) {
    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#' + feature, '1.1');
  };

  /**
   * This Object contains some standard easing cubic bezier curves. Then can be used with their name in the `Chartist.Svg.animate`. You can also extend the list and use your own name in the `animate` function. Click the show code button to see the available bezier functions.
   *
   * @memberof Chartist.Svg
   */
  var easingCubicBeziers = {
    easeInSine: [0.47, 0, 0.745, 0.715],
    easeOutSine: [0.39, 0.575, 0.565, 1],
    easeInOutSine: [0.445, 0.05, 0.55, 0.95],
    easeInQuad: [0.55, 0.085, 0.68, 0.53],
    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
    easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
    easeInCubic: [0.55, 0.055, 0.675, 0.19],
    easeOutCubic: [0.215, 0.61, 0.355, 1],
    easeInOutCubic: [0.645, 0.045, 0.355, 1],
    easeInQuart: [0.895, 0.03, 0.685, 0.22],
    easeOutQuart: [0.165, 0.84, 0.44, 1],
    easeInOutQuart: [0.77, 0, 0.175, 1],
    easeInQuint: [0.755, 0.05, 0.855, 0.06],
    easeOutQuint: [0.23, 1, 0.32, 1],
    easeInOutQuint: [0.86, 0, 0.07, 1],
    easeInExpo: [0.95, 0.05, 0.795, 0.035],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeInOutExpo: [1, 0, 0, 1],
    easeInCirc: [0.6, 0.04, 0.98, 0.335],
    easeOutCirc: [0.075, 0.82, 0.165, 1],
    easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
    easeInBack: [0.6, -0.28, 0.735, 0.045],
    easeOutBack: [0.175, 0.885, 0.32, 1.275],
    easeInOutBack: [0.68, -0.55, 0.265, 1.55]
  };

  Chartist.Svg.Easing = easingCubicBeziers;

  /**
   * This helper class is to wrap multiple `Chartist.Svg` elements into a list where you can call the `Chartist.Svg` functions on all elements in the list with one call. This is helpful when you'd like to perform calls with `Chartist.Svg` on multiple elements.
   * An instance of this class is also returned by `Chartist.Svg.querySelectorAll`.
   *
   * @memberof Chartist.Svg
   * @param {Array<Node>|NodeList} nodeList An Array of SVG DOM nodes or a SVG DOM NodeList (as returned by document.querySelectorAll)
   * @constructor
   */
  function SvgList(nodeList) {
    var list = this;

    this.svgElements = [];
    for(var i = 0; i < nodeList.length; i++) {
      this.svgElements.push(new Chartist.Svg(nodeList[i]));
    }

    // Add delegation methods for Chartist.Svg
    Object.keys(Chartist.Svg.prototype).filter(function(prototypeProperty) {
      return ['constructor',
          'parent',
          'querySelector',
          'querySelectorAll',
          'replace',
          'append',
          'classes',
          'height',
          'width'].indexOf(prototypeProperty) === -1;
    }).forEach(function(prototypeProperty) {
      list[prototypeProperty] = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        list.svgElements.forEach(function(element) {
          Chartist.Svg.prototype[prototypeProperty].apply(element, args);
        });
        return list;
      };
    });
  }

  Chartist.Svg.List = Chartist.Class.extend({
    constructor: SvgList
  });
}(window, document, Chartist));
;/**
 * Chartist SVG path module for SVG path description creation and modification.
 *
 * @module Chartist.Svg.Path
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Contains the descriptors of supported element types in a SVG path. Currently only move, line and curve are supported.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var elementDescriptions = {
    m: ['x', 'y'],
    l: ['x', 'y'],
    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y']
  };

  /**
   * Default options for newly created SVG path objects.
   *
   * @memberof Chartist.Svg.Path
   * @type {Object}
   */
  var defaultOptions = {
    // The accuracy in digit count after the decimal point. This will be used to round numbers in the SVG path. If this option is set to false then no rounding will be performed.
    accuracy: 3
  };

  function element(command, params, pathElements, pos, relative, data) {
    var pathElement = Chartist.extend({
      command: relative ? command.toLowerCase() : command.toUpperCase()
    }, params, data ? { data: data } : {} );

    pathElements.splice(pos, 0, pathElement);
  }

  function forEachParam(pathElements, cb) {
    pathElements.forEach(function(pathElement, pathElementIndex) {
      elementDescriptions[pathElement.command.toLowerCase()].forEach(function(paramName, paramIndex) {
        cb(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      });
    });
  }

  /**
   * Used to construct a new path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {Boolean} close If set to true then this path will be closed when stringified (with a Z at the end)
   * @param {Object} options Options object that overrides the default objects. See default options for more details.
   * @constructor
   */
  function SvgPath(close, options) {
    this.pathElements = [];
    this.pos = 0;
    this.close = close;
    this.options = Chartist.extend({}, defaultOptions, options);
  }

  /**
   * Gets or sets the current position (cursor) inside of the path. You can move around the cursor freely but limited to 0 or the count of existing elements. All modifications with element functions will insert new elements at the position of this cursor.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} [pos] If a number is passed then the cursor is set to this position in the path element array.
   * @return {Chartist.Svg.Path|Number} If the position parameter was passed then the return value will be the path object for easy call chaining. If no position parameter was passed then the current position is returned.
   */
  function position(pos) {
    if(pos !== undefined) {
      this.pos = Math.max(0, Math.min(this.pathElements.length, pos));
      return this;
    } else {
      return this.pos;
    }
  }

  /**
   * Removes elements from the path starting at the current position.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} count Number of path elements that should be removed from the current position.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function remove(count) {
    this.pathElements.splice(this.pos, count);
    return this;
  }

  /**
   * Use this function to add a new move SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the move element.
   * @param {Number} y The y coordinate for the move element.
   * @param {Boolean} [relative] If set to true the move element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function move(x, y, relative, data) {
    element('M', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new line SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The x coordinate for the line element.
   * @param {Number} y The y coordinate for the line element.
   * @param {Boolean} [relative] If set to true the line element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function line(x, y, relative, data) {
    element('L', {
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x1 The x coordinate for the first control point of the bezier curve.
   * @param {Number} y1 The y coordinate for the first control point of the bezier curve.
   * @param {Number} x2 The x coordinate for the second control point of the bezier curve.
   * @param {Number} y2 The y coordinate for the second control point of the bezier curve.
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function curve(x1, y1, x2, y2, x, y, relative, data) {
    element('C', {
      x1: +x1,
      y1: +y1,
      x2: +x2,
      y2: +y2,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Use this function to add a new non-bezier curve SVG path element.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} rx The radius to be used for the x-axis of the arc.
   * @param {Number} ry The radius to be used for the y-axis of the arc.
   * @param {Number} xAr Defines the orientation of the arc
   * @param {Number} lAf Large arc flag
   * @param {Number} sf Sweep flag
   * @param {Number} x The x coordinate for the target point of the curve element.
   * @param {Number} y The y coordinate for the target point of the curve element.
   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function arc(rx, ry, xAr, lAf, sf, x, y, relative, data) {
    element('A', {
      rx: +rx,
      ry: +ry,
      xAr: +xAr,
      lAf: +lAf,
      sf: +sf,
      x: +x,
      y: +y
    }, this.pathElements, this.pos++, relative, data);
    return this;
  }

  /**
   * Parses an SVG path seen in the d attribute of path elements, and inserts the parsed elements into the existing path object at the current cursor position. Any closing path indicators (Z at the end of the path) will be ignored by the parser as this is provided by the close option in the options of the path object.
   *
   * @memberof Chartist.Svg.Path
   * @param {String} path Any SVG path that contains move (m), line (l) or curve (c) components.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function parse(path) {
    // Parsing the SVG path string into an array of arrays [['M', '10', '10'], ['L', '100', '100']]
    var chunks = path.replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .split(/[\s,]+/)
      .reduce(function(result, element) {
        if(element.match(/[A-Za-z]/)) {
          result.push([]);
        }

        result[result.length - 1].push(element);
        return result;
      }, []);

    // If this is a closed path we remove the Z at the end because this is determined by the close option
    if(chunks[chunks.length - 1][0].toUpperCase() === 'Z') {
      chunks.pop();
    }

    // Using svgPathElementDescriptions to map raw path arrays into objects that contain the command and the parameters
    // For example {command: 'M', x: '10', y: '10'}
    var elements = chunks.map(function(chunk) {
        var command = chunk.shift(),
          description = elementDescriptions[command.toLowerCase()];

        return Chartist.extend({
          command: command
        }, description.reduce(function(result, paramName, index) {
          result[paramName] = +chunk[index];
          return result;
        }, {}));
      });

    // Preparing a splice call with the elements array as var arg params and insert the parsed elements at the current position
    var spliceArgs = [this.pos, 0];
    Array.prototype.push.apply(spliceArgs, elements);
    Array.prototype.splice.apply(this.pathElements, spliceArgs);
    // Increase the internal position by the element count
    this.pos += elements.length;

    return this;
  }

  /**
   * This function renders to current SVG path object into a final SVG string that can be used in the d attribute of SVG path elements. It uses the accuracy option to round big decimals. If the close parameter was set in the constructor of this path object then a path closing Z will be appended to the output string.
   *
   * @memberof Chartist.Svg.Path
   * @return {String}
   */
  function stringify() {
    var accuracyMultiplier = Math.pow(10, this.options.accuracy);

    return this.pathElements.reduce(function(path, pathElement) {
        var params = elementDescriptions[pathElement.command.toLowerCase()].map(function(paramName) {
          return this.options.accuracy ?
            (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
            pathElement[paramName];
        }.bind(this));

        return path + pathElement.command + params.join(',');
      }.bind(this), '') + (this.close ? 'Z' : '');
  }

  /**
   * Scales all elements in the current SVG path object. There is an individual parameter for each coordinate. Scaling will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to scale the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to scale the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function scale(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] *= paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * Translates all elements in the current SVG path object. The translation is relative and there is an individual parameter for each coordinate. Translation will also be done for control points of curves, affecting the given coordinate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Number} x The number which will be used to translate the x, x1 and x2 of all path elements.
   * @param {Number} y The number which will be used to translate the y, y1 and y2 of all path elements.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function translate(x, y) {
    forEachParam(this.pathElements, function(pathElement, paramName) {
      pathElement[paramName] += paramName[0] === 'x' ? x : y;
    });
    return this;
  }

  /**
   * This function will run over all existing path elements and then loop over their attributes. The callback function will be called for every path element attribute that exists in the current path.
   * The method signature of the callback function looks like this:
   * ```javascript
   * function(pathElement, paramName, pathElementIndex, paramIndex, pathElements)
   * ```
   * If something else than undefined is returned by the callback function, this value will be used to replace the old value. This allows you to build custom transformations of path objects that can't be achieved using the basic transformation functions scale and translate.
   *
   * @memberof Chartist.Svg.Path
   * @param {Function} transformFnc The callback function for the transformation. Check the signature in the function description.
   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
   */
  function transform(transformFnc) {
    forEachParam(this.pathElements, function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
      var transformed = transformFnc(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
      if(transformed || transformed === 0) {
        pathElement[paramName] = transformed;
      }
    });
    return this;
  }

  /**
   * This function clones a whole path object with all its properties. This is a deep clone and path element objects will also be cloned.
   *
   * @memberof Chartist.Svg.Path
   * @param {Boolean} [close] Optional option to set the new cloned path to closed. If not specified or false, the original path close option will be used.
   * @return {Chartist.Svg.Path}
   */
  function clone(close) {
    var c = new Chartist.Svg.Path(close || this.close);
    c.pos = this.pos;
    c.pathElements = this.pathElements.slice().map(function cloneElements(pathElement) {
      return Chartist.extend({}, pathElement);
    });
    c.options = Chartist.extend({}, this.options);
    return c;
  }

  /**
   * Split a Svg.Path object by a specific command in the path chain. The path chain will be split and an array of newly created paths objects will be returned. This is useful if you'd like to split an SVG path by it's move commands, for example, in order to isolate chunks of drawings.
   *
   * @memberof Chartist.Svg.Path
   * @param {String} command The command you'd like to use to split the path
   * @return {Array<Chartist.Svg.Path>}
   */
  function splitByCommand(command) {
    var split = [
      new Chartist.Svg.Path()
    ];

    this.pathElements.forEach(function(pathElement) {
      if(pathElement.command === command.toUpperCase() && split[split.length - 1].pathElements.length !== 0) {
        split.push(new Chartist.Svg.Path());
      }

      split[split.length - 1].pathElements.push(pathElement);
    });

    return split;
  }

  /**
   * This static function on `Chartist.Svg.Path` is joining multiple paths together into one paths.
   *
   * @memberof Chartist.Svg.Path
   * @param {Array<Chartist.Svg.Path>} paths A list of paths to be joined together. The order is important.
   * @param {boolean} close If the newly created path should be a closed path
   * @param {Object} options Path options for the newly created path.
   * @return {Chartist.Svg.Path}
   */

  function join(paths, close, options) {
    var joinedPath = new Chartist.Svg.Path(close, options);
    for(var i = 0; i < paths.length; i++) {
      var path = paths[i];
      for(var j = 0; j < path.pathElements.length; j++) {
        joinedPath.pathElements.push(path.pathElements[j]);
      }
    }
    return joinedPath;
  }

  Chartist.Svg.Path = Chartist.Class.extend({
    constructor: SvgPath,
    position: position,
    remove: remove,
    move: move,
    line: line,
    curve: curve,
    arc: arc,
    scale: scale,
    translate: translate,
    transform: transform,
    parse: parse,
    stringify: stringify,
    clone: clone,
    splitByCommand: splitByCommand
  });

  Chartist.Svg.Path.elementDescriptions = elementDescriptions;
  Chartist.Svg.Path.join = join;
}(window, document, Chartist));
;/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  var axisUnits = {
    x: {
      pos: 'x',
      len: 'width',
      dir: 'horizontal',
      rectStart: 'x1',
      rectEnd: 'x2',
      rectOffset: 'y2'
    },
    y: {
      pos: 'y',
      len: 'height',
      dir: 'vertical',
      rectStart: 'y2',
      rectEnd: 'y1',
      rectOffset: 'x1'
    }
  };

  function Axis(units, chartRect, ticks, options) {
    this.units = units;
    this.counterUnits = units === axisUnits.x ? axisUnits.y : axisUnits.x;
    this.chartRect = chartRect;
    this.axisLength = chartRect[units.rectEnd] - chartRect[units.rectStart];
    this.gridOffset = chartRect[units.rectOffset];
    this.ticks = ticks;
    this.options = options;
  }

  function createGridAndLabels(gridGroup, labelGroup, useForeignObject, chartOptions, eventEmitter) {
    var axisOptions = chartOptions['axis' + this.units.pos.toUpperCase()];
    var projectedValues = this.ticks.map(this.projectValue.bind(this));
    var labelValues = this.ticks.map(axisOptions.labelInterpolationFnc);

    projectedValues.forEach(function(projectedValue, index) {
      var labelOffset = {
        x: 0,
        y: 0
      };

      // TODO: Find better solution for solving this problem
      // Calculate how much space we have available for the label
      var labelLength;
      if(projectedValues[index + 1]) {
        // If we still have one label ahead, we can calculate the distance to the next tick / label
        labelLength = projectedValues[index + 1] - projectedValue;
      } else {
        // If we don't have a label ahead and we have only two labels in total, we just take the remaining distance to
        // on the whole axis length. We limit that to a minimum of 30 pixel, so that labels close to the border will
        // still be visible inside of the chart padding.
        labelLength = Math.max(this.axisLength - projectedValue, 30);
      }

      // Skip grid lines and labels where interpolated label values are falsey (execpt for 0)
      if(!labelValues[index] && labelValues[index] !== 0) {
        return;
      }

      // Transform to global coordinates using the chartRect
      // We also need to set the label offset for the createLabel function
      if(this.units.pos === 'x') {
        projectedValue = this.chartRect.x1 + projectedValue;
        labelOffset.x = chartOptions.axisX.labelOffset.x;

        // If the labels should be positioned in start position (top side for vertical axis) we need to set a
        // different offset as for positioned with end (bottom)
        if(chartOptions.axisX.position === 'start') {
          labelOffset.y = this.chartRect.padding.top + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
        } else {
          labelOffset.y = this.chartRect.y1 + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
        }
      } else {
        projectedValue = this.chartRect.y1 - projectedValue;
        labelOffset.y = chartOptions.axisY.labelOffset.y - (useForeignObject ? labelLength : 0);

        // If the labels should be positioned in start position (left side for horizontal axis) we need to set a
        // different offset as for positioned with end (right side)
        if(chartOptions.axisY.position === 'start') {
          labelOffset.x = useForeignObject ? this.chartRect.padding.left + chartOptions.axisY.labelOffset.x : this.chartRect.x1 - 10;
        } else {
          labelOffset.x = this.chartRect.x2 + chartOptions.axisY.labelOffset.x + 10;
        }
      }

      if(axisOptions.showGrid) {
        Chartist.createGrid(projectedValue, index, this, this.gridOffset, this.chartRect[this.counterUnits.len](), gridGroup, [
          chartOptions.classNames.grid,
          chartOptions.classNames[this.units.dir]
        ], eventEmitter);
      }

      if(axisOptions.showLabel) {
        Chartist.createLabel(projectedValue, labelLength, index, labelValues, this, axisOptions.offset, labelOffset, labelGroup, [
          chartOptions.classNames.label,
          chartOptions.classNames[this.units.dir],
          chartOptions.classNames[axisOptions.position]
        ], useForeignObject, eventEmitter);
      }
    }.bind(this));
  }

  Chartist.Axis = Chartist.Class.extend({
    constructor: Axis,
    createGridAndLabels: createGridAndLabels,
    projectValue: function(value, index, data) {
      throw new Error('Base axis can\'t be instantiated!');
    }
  });

  Chartist.Axis.units = axisUnits;

}(window, document, Chartist));
;/**
 * The auto scale axis uses standard linear scale projection of values along an axis. It uses order of magnitude to find a scale automatically and evaluates the available space in order to find the perfect amount of ticks for your chart.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
 *   high: 100,
 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
 *   low: 0,
 *   // This option will be used when finding the right scale division settings. The amount of ticks on the scale will be determined so that as many ticks as possible will be displayed, while not violating this minimum required space (in pixel).
 *   scaleMinSpace: 20,
 *   // Can be set to true or false. If set to true, the scale will be generated with whole numbers only.
 *   onlyInteger: true,
 *   // The reference value can be used to make sure that this value will always be on the chart. This is especially useful on bipolar charts where the bipolar center always needs to be part of the chart.
 *   referenceValue: 5
 * };
 * ```
 *
 * @module Chartist.AutoScaleAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function AutoScaleAxis(axisUnit, data, chartRect, options) {
    // Usually we calculate highLow based on the data but this can be overriden by a highLow object in the options
    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
    this.bounds = Chartist.getBounds(chartRect[axisUnit.rectEnd] - chartRect[axisUnit.rectStart], highLow, options.scaleMinSpace || 20, options.onlyInteger);
    this.range = {
      min: this.bounds.min,
      max: this.bounds.max
    };

    Chartist.AutoScaleAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      this.bounds.values,
      options);
  }

  function projectValue(value) {
    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.bounds.min) / this.bounds.range;
  }

  Chartist.AutoScaleAxis = Chartist.Axis.extend({
    constructor: AutoScaleAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The fixed scale axis uses standard linear projection of values along an axis. It makes use of a divisor option to divide the range provided from the minimum and maximum value or the options high and low that will override the computed minimum and maximum.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
 *   high: 100,
 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
 *   low: 0,
 *   // If specified then the value range determined from minimum to maximum (or low and high) will be divided by this number and ticks will be generated at those division points. The default divisor is 1.
 *   divisor: 4,
 *   // If ticks is explicitly set, then the axis will not compute the ticks with the divisor, but directly use the data in ticks to determine at what points on the axis a tick need to be generated.
 *   ticks: [1, 10, 20, 30]
 * };
 * ```
 *
 * @module Chartist.FixedScaleAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function FixedScaleAxis(axisUnit, data, chartRect, options) {
    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
    this.divisor = options.divisor || 1;
    this.ticks = options.ticks || Chartist.times(this.divisor).map(function(value, index) {
      return highLow.low + (highLow.high - highLow.low) / this.divisor * index;
    }.bind(this));
    this.ticks.sort(function(a, b) {
      return a - b;
    });
    this.range = {
      min: highLow.low,
      max: highLow.high
    };

    Chartist.FixedScaleAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      this.ticks,
      options);

    this.stepLength = this.axisLength / this.divisor;
  }

  function projectValue(value) {
    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.range.min) / (this.range.max - this.range.min);
  }

  Chartist.FixedScaleAxis = Chartist.Axis.extend({
    constructor: FixedScaleAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The step axis for step based charts like bar chart or step based line charts. It uses a fixed amount of ticks that will be equally distributed across the whole axis length. The projection is done using the index of the data value rather than the value itself and therefore it's only useful for distribution purpose.
 * **Options**
 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
 * ```javascript
 * var options = {
 *   // Ticks to be used to distribute across the axis length. As this axis type relies on the index of the value rather than the value, arbitrary data that can be converted to a string can be used as ticks.
 *   ticks: ['One', 'Two', 'Three'],
 *   // If set to true the full width will be used to distribute the values where the last value will be at the maximum of the axis length. If false the spaces between the ticks will be evenly distributed instead.
 *   stretch: true
 * };
 * ```
 *
 * @module Chartist.StepAxis
 */
/* global Chartist */
(function (window, document, Chartist) {
  'use strict';

  function StepAxis(axisUnit, data, chartRect, options) {
    Chartist.StepAxis.super.constructor.call(this,
      axisUnit,
      chartRect,
      options.ticks,
      options);

    this.stepLength = this.axisLength / (options.ticks.length - (options.stretch ? 1 : 0));
  }

  function projectValue(value, index) {
    return this.stepLength * index;
  }

  Chartist.StepAxis = Chartist.Axis.extend({
    constructor: StepAxis,
    projectValue: projectValue
  });

}(window, document, Chartist));
;/**
 * The Chartist line chart can be used to draw Line or Scatter charts. If used in the browser you can access the global `Chartist` namespace where you find the `Line` function as a main entry point.
 *
 * For examples on how to use the line chart please check the examples of the `Chartist.Line` method.
 *
 * @module Chartist.Line
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Line
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the labels to the chart area
      offset: 30,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'end',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // Set the axis type to be used to project values on this axis. If not defined, Chartist.StepAxis will be used for the X-Axis, where the ticks option will be set to the labels in the data and the stretch option will be set to the global fullWidth option. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
      type: undefined
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the labels to the chart area
      offset: 40,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'start',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // Set the axis type to be used to project values on this axis. If not defined, Chartist.AutoScaleAxis will be used for the Y-Axis, where the high and low options will be set to the global high and low options. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
      type: undefined,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // If the line should be drawn or not
    showLine: true,
    // If dots should be drawn or not
    showPoint: true,
    // If the line chart should draw an area
    showArea: false,
    // The base for the area chart that will be used to close the area shape (is normally 0)
    areaBase: 0,
    // Specify if the lines should be smoothed. This value can be true or false where true will result in smoothing using the default smoothing interpolation function Chartist.Interpolation.cardinal and false results in Chartist.Interpolation.none. You can also choose other smoothing / interpolation functions available in the Chartist.Interpolation module, or write your own interpolation function. Check the examples for a brief description.
    lineSmooth: true,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 10
    },
    // When set to true, the last grid line on the x-axis is not drawn and the chart elements will expand to the full available width of the chart. For the last label to be drawn correctly you might need to add chart padding or offset the last label with a draw event handler.
    fullWidth: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-line',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      line: 'ct-line',
      point: 'ct-point',
      area: 'ct-area',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal',
      start: 'ct-start',
      end: 'ct-end'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var data = {
      raw: this.data,
      normalized: Chartist.getDataArray(this.data, options.reverseData, true)
    };

    // Create new svg object
    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);
    // Create groups for labels, grid and series
    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
    var seriesGroup = this.svg.elem('g');
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
    var axisX, axisY;

    if(options.axisX.type === undefined) {
      axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
        ticks: data.raw.labels,
        stretch: options.fullWidth
      }));
    } else {
      axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
    }

    if(options.axisY.type === undefined) {
      axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
        high: Chartist.isNum(options.high) ? options.high : options.axisY.high,
        low: Chartist.isNum(options.low) ? options.low : options.axisY.low
      }));
    } else {
      axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
    }

    axisX.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
    axisY.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);

    // Draw the series
    data.raw.series.forEach(function(series, seriesIndex) {
      var seriesElement = seriesGroup.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesElement.attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesElement.addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      var pathCoordinates = [],
        pathData = [];

      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
        var p = {
          x: chartRect.x1 + axisX.projectValue(value, valueIndex, data.normalized[seriesIndex]),
          y: chartRect.y1 - axisY.projectValue(value, valueIndex, data.normalized[seriesIndex])
        };
        pathCoordinates.push(p.x, p.y);
        pathData.push({
          value: value,
          valueIndex: valueIndex,
          meta: Chartist.getMetaData(series, valueIndex)
        });
      }.bind(this));

      var seriesOptions = {
        lineSmooth: Chartist.getSeriesOption(series, options, 'lineSmooth'),
        showPoint: Chartist.getSeriesOption(series, options, 'showPoint'),
        showLine: Chartist.getSeriesOption(series, options, 'showLine'),
        showArea: Chartist.getSeriesOption(series, options, 'showArea'),
        areaBase: Chartist.getSeriesOption(series, options, 'areaBase')
      };

      var smoothing = typeof seriesOptions.lineSmooth === 'function' ?
        seriesOptions.lineSmooth : (seriesOptions.lineSmooth ? Chartist.Interpolation.cardinal() : Chartist.Interpolation.none());
      // Interpolating path where pathData will be used to annotate each path element so we can trace back the original
      // index, value and meta data
      var path = smoothing(pathCoordinates, pathData);

      // If we should show points we need to create them now to avoid secondary loop
      // Points are drawn from the pathElements returned by the interpolation function
      // Small offset for Firefox to render squares correctly
      if (seriesOptions.showPoint) {

        path.pathElements.forEach(function(pathElement) {
          var point = seriesElement.elem('line', {
            x1: pathElement.x,
            y1: pathElement.y,
            x2: pathElement.x + 0.01,
            y2: pathElement.y
          }, options.classNames.point).attr({
            'value': [pathElement.data.value.x, pathElement.data.value.y].filter(function(v) {
                return v;
              }).join(','),
            'meta': pathElement.data.meta
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', {
            type: 'point',
            value: pathElement.data.value,
            index: pathElement.data.valueIndex,
            meta: pathElement.data.meta,
            series: series,
            seriesIndex: seriesIndex,
            axisX: axisX,
            axisY: axisY,
            group: seriesElement,
            element: point,
            x: pathElement.x,
            y: pathElement.y
          });
        }.bind(this));
      }

      if(seriesOptions.showLine) {
        var line = seriesElement.elem('path', {
          d: path.stringify()
        }, options.classNames.line, true);

        this.eventEmitter.emit('draw', {
          type: 'line',
          values: data.normalized[seriesIndex],
          path: path.clone(),
          chartRect: chartRect,
          index: seriesIndex,
          series: series,
          seriesIndex: seriesIndex,
          axisX: axisX,
          axisY: axisY,
          group: seriesElement,
          element: line
        });
      }

      // Area currently only works with axes that support a range!
      if(seriesOptions.showArea && axisY.range) {
        // If areaBase is outside the chart area (< min or > max) we need to set it respectively so that
        // the area is not drawn outside the chart area.
        var areaBase = Math.max(Math.min(seriesOptions.areaBase, axisY.range.max), axisY.range.min);

        // We project the areaBase value into screen coordinates
        var areaBaseProjected = chartRect.y1 - axisY.projectValue(areaBase);

        // In order to form the area we'll first split the path by move commands so we can chunk it up into segments
        path.splitByCommand('M').filter(function onlySolidSegments(pathSegment) {
          // We filter only "solid" segments that contain more than one point. Otherwise there's no need for an area
          return pathSegment.pathElements.length > 1;
        }).map(function convertToArea(solidPathSegments) {
          // Receiving the filtered solid path segments we can now convert those segments into fill areas
          var firstElement = solidPathSegments.pathElements[0];
          var lastElement = solidPathSegments.pathElements[solidPathSegments.pathElements.length - 1];

          // Cloning the solid path segment with closing option and removing the first move command from the clone
          // We then insert a new move that should start at the area base and draw a straight line up or down
          // at the end of the path we add an additional straight line to the projected area base value
          // As the closing option is set our path will be automatically closed
          return solidPathSegments.clone(true)
            .position(0)
            .remove(1)
            .move(firstElement.x, areaBaseProjected)
            .line(firstElement.x, firstElement.y)
            .position(solidPathSegments.pathElements.length + 1)
            .line(lastElement.x, areaBaseProjected);

        }).forEach(function createArea(areaPath) {
          // For each of our newly created area paths, we'll now create path elements by stringifying our path objects
          // and adding the created DOM elements to the correct series group
          var area = seriesElement.elem('path', {
            d: areaPath.stringify()
          }, options.classNames.area, true).attr({
            'values': data.normalized[seriesIndex]
          }, Chartist.xmlNs.uri);

          // Emit an event for each area that was drawn
          this.eventEmitter.emit('draw', {
            type: 'area',
            values: data.normalized[seriesIndex],
            path: areaPath.clone(),
            series: series,
            seriesIndex: seriesIndex,
            axisX: axisX,
            axisY: axisY,
            chartRect: chartRect,
            index: seriesIndex,
            group: seriesElement,
            element: area
          });
        }.bind(this));
      }
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: axisY.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new line chart.
   *
   * @memberof Chartist.Line
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple line chart
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // As options we currently only set a static size of 300x200 px
   * var options = {
   *   width: '300px',
   *   height: '200px'
   * };
   *
   * // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
   * new Chartist.Line('.ct-chart', data, options);
   *
   * @example
   * // Use specific interpolation function with configuration from the Chartist.Interpolation module
   *
   * var chart = new Chartist.Line('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5],
   *   series: [
   *     [1, 1, 8, 1, 7]
   *   ]
   * }, {
   *   lineSmooth: Chartist.Interpolation.cardinal({
   *     tension: 0.2
   *   })
   * });
   *
   * @example
   * // Create a line chart with responsive options
   *
   * var data = {
   *   // A labels array that can contain any sort of values
   *   labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
   *   // Our series array that contains series objects or in this case series data arrays
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In adition to the regular options we specify responsive option overrides that will override the default configutation based on the matching media queries.
   * var responsiveOptions = [
   *   ['screen and (min-width: 641px) and (max-width: 1024px)', {
   *     showPoint: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return Mon, Tue, Wed etc. on medium screens
   *         return value.slice(0, 3);
   *       }
   *     }
   *   }],
   *   ['screen and (max-width: 640px)', {
   *     showLine: false,
   *     axisX: {
   *       labelInterpolationFnc: function(value) {
   *         // Will return M, T, W etc. on small screens
   *         return value[0];
   *       }
   *     }
   *   }]
   * ];
   *
   * new Chartist.Line('.ct-chart', data, null, responsiveOptions);
   *
   */
  function Line(query, data, options, responsiveOptions) {
    Chartist.Line.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating line chart type in Chartist namespace
  Chartist.Line = Chartist.Base.extend({
    constructor: Line,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The bar chart module of Chartist that can be used to draw unipolar or bipolar bar and grouped bar charts.
 *
 * @module Chartist.Bar
 */
/* global Chartist */
(function(window, document, Chartist){
  'use strict';

  /**
   * Default options in bar charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Bar
   */
  var defaultOptions = {
    // Options for X-Axis
    axisX: {
      // The offset of the chart drawing area to the border of the container
      offset: 30,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'end',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum width in pixel of the scale steps
      scaleMinSpace: 30,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Options for Y-Axis
    axisY: {
      // The offset of the chart drawing area to the border of the container
      offset: 40,
      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
      position: 'start',
      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
      labelOffset: {
        x: 0,
        y: 0
      },
      // If labels should be shown or not
      showLabel: true,
      // If the axis grid should be drawn or not
      showGrid: true,
      // Interpolation function that allows you to intercept the value from the axis label
      labelInterpolationFnc: Chartist.noop,
      // This value specifies the minimum height in pixel of the scale steps
      scaleMinSpace: 20,
      // Use only integer values (whole numbers) for the scale steps
      onlyInteger: false
    },
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
    high: undefined,
    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
    low: undefined,
    // Use only integer values (whole numbers) for the scale steps
    onlyInteger: false,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 10
    },
    // Specify the distance in pixel of bars in a group
    seriesBarDistance: 15,
    // If set to true this property will cause the series bars to be stacked. Check the `stackMode` option for further stacking options.
    stackBars: false,
    // If set to 'overlap' this property will force the stacked bars to draw from the zero line.
    // If set to 'accumulate' this property will form a total for each series point. This will also influence the y-axis and the overall bounds of the chart. In stacked mode the seriesBarDistance property will have no effect.
    stackMode: 'accumulate',
    // Inverts the axes of the bar chart in order to draw a horizontal bar chart. Be aware that you also need to invert your axis settings as the Y Axis will now display the labels and the X Axis the values.
    horizontalBars: false,
    // If set to true then each bar will represent a series and the data array is expected to be a one dimensional array of data values rather than a series array of series. This is useful if the bar chart should represent a profile rather than some data over time.
    distributeSeries: false,
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false,
    // Override the class names that get used to generate the SVG structure of the chart
    classNames: {
      chart: 'ct-chart-bar',
      horizontalBars: 'ct-horizontal-bars',
      label: 'ct-label',
      labelGroup: 'ct-labels',
      series: 'ct-series',
      bar: 'ct-bar',
      grid: 'ct-grid',
      gridGroup: 'ct-grids',
      vertical: 'ct-vertical',
      horizontal: 'ct-horizontal',
      start: 'ct-start',
      end: 'ct-end'
    }
  };

  /**
   * Creates a new chart
   *
   */
  function createChart(options) {
    var data = {
      raw: this.data,
      normalized: options.distributeSeries ? Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y').map(function(value) {
        return [value];
      }) : Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y')
    };

    var highLow;

    // Create new svg element
    this.svg = Chartist.createSvg(
      this.container,
      options.width,
      options.height,
      options.classNames.chart + (options.horizontalBars ? ' ' + options.classNames.horizontalBars : '')
    );

    // Drawing groups in correct order
    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
    var seriesGroup = this.svg.elem('g');
    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);

    if(options.stackBars) {
      // If stacked bars we need to calculate the high low from stacked values from each series
      var serialSums = Chartist.serialMap(data.normalized, function serialSums() {
        return Array.prototype.slice.call(arguments).map(function(value) {
          return value;
        }).reduce(function(prev, curr) {
          return {
            x: prev.x + curr.x || 0,
            y: prev.y + curr.y || 0
          };
        }, {x: 0, y: 0});
      });

      highLow = Chartist.getHighLow([serialSums], Chartist.extend({}, options, {
        referenceValue: 0
      }), options.horizontalBars ? 'x' : 'y');
    } else {
      highLow = Chartist.getHighLow(data.normalized, Chartist.extend({}, options, {
        referenceValue: 0
      }), options.horizontalBars ? 'x' : 'y');
    }
    // Overrides of high / low from settings
    highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
    highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);

    var valueAxis,
      labelAxisTicks,
      labelAxis,
      axisX,
      axisY;

    // We need to set step count based on some options combinations
    if(options.distributeSeries && options.stackBars) {
      // If distributed series are enabled and bars need to be stacked, we'll only have one bar and therefore should
      // use only the first label for the step axis
      labelAxisTicks = data.raw.labels.slice(0, 1);
    } else {
      // If distributed series are enabled but stacked bars aren't, we should use the series labels
      // If we are drawing a regular bar chart with two dimensional series data, we just use the labels array
      // as the bars are normalized
      labelAxisTicks = data.raw.labels;
    }

    // Set labelAxis and valueAxis based on the horizontalBars setting. This setting will flip the axes if necessary.
    if(options.horizontalBars) {
      if(options.axisX.type === undefined) {
        valueAxis = axisX = new Chartist.AutoScaleAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
          highLow: highLow,
          referenceValue: 0
        }));
      } else {
        valueAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
          highLow: highLow,
          referenceValue: 0
        }));
      }

      if(options.axisY.type === undefined) {
        labelAxis = axisY = new Chartist.StepAxis(Chartist.Axis.units.y, data, chartRect, {
          ticks: labelAxisTicks
        });
      } else {
        labelAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
      }
    } else {
      if(options.axisX.type === undefined) {
        labelAxis = axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, {
          ticks: labelAxisTicks
        });
      } else {
        labelAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
      }

      if(options.axisY.type === undefined) {
        valueAxis = axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
          highLow: highLow,
          referenceValue: 0
        }));
      } else {
        valueAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
          highLow: highLow,
          referenceValue: 0
        }));
      }
    }

    // Projected 0 point
    var zeroPoint = options.horizontalBars ? (chartRect.x1 + valueAxis.projectValue(0)) : (chartRect.y1 - valueAxis.projectValue(0));
    // Used to track the screen coordinates of stacked bars
    var stackedBarValues = [];

    labelAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
    valueAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);

    // Draw the series
    data.raw.series.forEach(function(series, seriesIndex) {
      // Calculating bi-polar value of index for seriesOffset. For i = 0..4 biPol will be -1.5, -0.5, 0.5, 1.5 etc.
      var biPol = seriesIndex - (data.raw.series.length - 1) / 2;
      // Half of the period width between vertical grid lines used to position bars
      var periodHalfLength;
      // Current series SVG element
      var seriesElement;

      // We need to set periodHalfLength based on some options combinations
      if(options.distributeSeries && !options.stackBars) {
        // If distributed series are enabled but stacked bars aren't, we need to use the length of the normaizedData array
        // which is the series count and divide by 2
        periodHalfLength = labelAxis.axisLength / data.normalized.length / 2;
      } else if(options.distributeSeries && options.stackBars) {
        // If distributed series and stacked bars are enabled we'll only get one bar so we should just divide the axis
        // length by 2
        periodHalfLength = labelAxis.axisLength / 2;
      } else {
        // On regular bar charts we should just use the series length
        periodHalfLength = labelAxis.axisLength / data.normalized[seriesIndex].length / 2;
      }

      // Adding the series group to the series element
      seriesElement = seriesGroup.elem('g');

      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
      seriesElement.attr({
        'series-name': series.name,
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesElement.addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
      ].join(' '));

      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
        var projected,
          bar,
          previousStack,
          labelAxisValueIndex;

        // We need to set labelAxisValueIndex based on some options combinations
        if(options.distributeSeries && !options.stackBars) {
          // If distributed series are enabled but stacked bars aren't, we can use the seriesIndex for later projection
          // on the step axis for label positioning
          labelAxisValueIndex = seriesIndex;
        } else if(options.distributeSeries && options.stackBars) {
          // If distributed series and stacked bars are enabled, we will only get one bar and therefore always use
          // 0 for projection on the label step axis
          labelAxisValueIndex = 0;
        } else {
          // On regular bar charts we just use the value index to project on the label step axis
          labelAxisValueIndex = valueIndex;
        }

        // We need to transform coordinates differently based on the chart layout
        if(options.horizontalBars) {
          projected = {
            x: chartRect.x1 + valueAxis.projectValue(value && value.x ? value.x : 0, valueIndex, data.normalized[seriesIndex]),
            y: chartRect.y1 - labelAxis.projectValue(value && value.y ? value.y : 0, labelAxisValueIndex, data.normalized[seriesIndex])
          };
        } else {
          projected = {
            x: chartRect.x1 + labelAxis.projectValue(value && value.x ? value.x : 0, labelAxisValueIndex, data.normalized[seriesIndex]),
            y: chartRect.y1 - valueAxis.projectValue(value && value.y ? value.y : 0, valueIndex, data.normalized[seriesIndex])
          }
        }

        // If the label axis is a step based axis we will offset the bar into the middle of between two steps using
        // the periodHalfLength value. Also we do arrange the different series so that they align up to each other using
        // the seriesBarDistance. If we don't have a step axis, the bar positions can be chosen freely so we should not
        // add any automated positioning.
        if(labelAxis instanceof Chartist.StepAxis) {
          // Offset to center bar between grid lines, but only if the step axis is not stretched
          if(!labelAxis.options.stretch) {
            projected[labelAxis.units.pos] += periodHalfLength * (options.horizontalBars ? -1 : 1);
          }
          // Using bi-polar offset for multiple series if no stacked bars or series distribution is used
          projected[labelAxis.units.pos] += (options.stackBars || options.distributeSeries) ? 0 : biPol * options.seriesBarDistance * (options.horizontalBars ? -1 : 1);
        }

        // Enter value in stacked bar values used to remember previous screen value for stacking up bars
        previousStack = stackedBarValues[valueIndex] || zeroPoint;
        stackedBarValues[valueIndex] = previousStack - (zeroPoint - projected[labelAxis.counterUnits.pos]);

        // Skip if value is undefined
        if(value === undefined) {
          return;
        }

        var positions = {};
        positions[labelAxis.units.pos + '1'] = projected[labelAxis.units.pos];
        positions[labelAxis.units.pos + '2'] = projected[labelAxis.units.pos];

        if(options.stackBars && (options.stackMode === 'accumulate' || !options.stackMode)) {
          // Stack mode: accumulate (default)
          // If bars are stacked we use the stackedBarValues reference and otherwise base all bars off the zero line
          // We want backwards compatibility, so the expected fallback without the 'stackMode' option
          // to be the original behaviour (accumulate)
          positions[labelAxis.counterUnits.pos + '1'] = previousStack;
          positions[labelAxis.counterUnits.pos + '2'] = stackedBarValues[valueIndex];
        } else {
          // Draw from the zero line normally
          // This is also the same code for Stack mode: overlap
          positions[labelAxis.counterUnits.pos + '1'] = zeroPoint;
          positions[labelAxis.counterUnits.pos + '2'] = projected[labelAxis.counterUnits.pos];
        }

        // Limit x and y so that they are within the chart rect
        positions.x1 = Math.min(Math.max(positions.x1, chartRect.x1), chartRect.x2);
        positions.x2 = Math.min(Math.max(positions.x2, chartRect.x1), chartRect.x2);
        positions.y1 = Math.min(Math.max(positions.y1, chartRect.y2), chartRect.y1);
        positions.y2 = Math.min(Math.max(positions.y2, chartRect.y2), chartRect.y1);

        // Create bar element
        bar = seriesElement.elem('line', positions, options.classNames.bar).attr({
          'value': [value.x, value.y].filter(function(v) {
            return v;
          }).join(','),
          'meta': Chartist.getMetaData(series, valueIndex)
        }, Chartist.xmlNs.uri);

        this.eventEmitter.emit('draw', Chartist.extend({
          type: 'bar',
          value: value,
          index: valueIndex,
          meta: Chartist.getMetaData(series, valueIndex),
          series: series,
          seriesIndex: seriesIndex,
          axisX: axisX,
          axisY: axisY,
          chartRect: chartRect,
          group: seriesElement,
          element: bar
        }, positions));
      }.bind(this));
    }.bind(this));

    this.eventEmitter.emit('created', {
      bounds: valueAxis.bounds,
      chartRect: chartRect,
      axisX: axisX,
      axisY: axisY,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new bar chart and returns API object that you can use for later changes.
   *
   * @memberof Chartist.Bar
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object that needs to consist of a labels and a series array
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object which exposes the API for the created chart
   *
   * @example
   * // Create a simple bar chart
   * var data = {
   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
   *   series: [
   *     [5, 2, 4, 2, 0]
   *   ]
   * };
   *
   * // In the global name space Chartist we call the Bar function to initialize a bar chart. As a first parameter we pass in a selector where we would like to get our chart created and as a second parameter we pass our data object.
   * new Chartist.Bar('.ct-chart', data);
   *
   * @example
   * // This example creates a bipolar grouped bar chart where the boundaries are limitted to -10 and 10
   * new Chartist.Bar('.ct-chart', {
   *   labels: [1, 2, 3, 4, 5, 6, 7],
   *   series: [
   *     [1, 3, 2, -5, -3, 1, -6],
   *     [-5, -2, -4, -1, 2, -3, 1]
   *   ]
   * }, {
   *   seriesBarDistance: 12,
   *   low: -10,
   *   high: 10
   * });
   *
   */
  function Bar(query, data, options, responsiveOptions) {
    Chartist.Bar.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating bar chart type in Chartist namespace
  Chartist.Bar = Chartist.Base.extend({
    constructor: Bar,
    createChart: createChart
  });

}(window, document, Chartist));
;/**
 * The pie chart module of Chartist that can be used to draw pie, donut or gauge charts
 *
 * @module Chartist.Pie
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  /**
   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
   *
   * @memberof Chartist.Pie
   */
  var defaultOptions = {
    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
    width: undefined,
    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
    height: undefined,
    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
    chartPadding: 5,
    // Override the class names that are used to generate the SVG structure of the chart
    classNames: {
      chartPie: 'ct-chart-pie',
      chartDonut: 'ct-chart-donut',
      series: 'ct-series',
      slicePie: 'ct-slice-pie',
      sliceDonut: 'ct-slice-donut',
      label: 'ct-label'
    },
    // The start angle of the pie chart in degrees where 0 points north. A higher value offsets the start angle clockwise.
    startAngle: 0,
    // An optional total you can specify. By specifying a total value, the sum of the values in the series must be this total in order to draw a full pie. You can use this parameter to draw only parts of a pie or gauge charts.
    total: undefined,
    // If specified the donut CSS classes will be used and strokes will be drawn instead of pie slices.
    donut: false,
    // Specify the donut stroke width, currently done in javascript for convenience. May move to CSS styles in the future.
    // This option can be set as number or string to specify a relative width (i.e. 100 or '30%').
    donutWidth: 60,
    // If a label should be shown or not
    showLabel: true,
    // Label position offset from the standard position which is half distance of the radius. This value can be either positive or negative. Positive values will position the label away from the center.
    labelOffset: 0,
    // This option can be set to 'inside', 'outside' or 'center'. Positioned with 'inside' the labels will be placed on half the distance of the radius to the border of the Pie by respecting the 'labelOffset'. The 'outside' option will place the labels at the border of the pie and 'center' will place the labels in the absolute center point of the chart. The 'center' option only makes sense in conjunction with the 'labelOffset' option.
    labelPosition: 'inside',
    // An interpolation function for the label value
    labelInterpolationFnc: Chartist.noop,
    // Label direction can be 'neutral', 'explode' or 'implode'. The labels anchor will be positioned based on those settings as well as the fact if the labels are on the right or left side of the center of the chart. Usually explode is useful when labels are positioned far away from the center.
    labelDirection: 'neutral',
    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
    reverseData: false
  };

  /**
   * Determines SVG anchor position based on direction and center parameter
   *
   * @param center
   * @param label
   * @param direction
   * @return {string}
   */
  function determineAnchorPosition(center, label, direction) {
    var toTheRight = label.x > center.x;

    if(toTheRight && direction === 'explode' ||
      !toTheRight && direction === 'implode') {
      return 'start';
    } else if(toTheRight && direction === 'implode' ||
      !toTheRight && direction === 'explode') {
      return 'end';
    } else {
      return 'middle';
    }
  }

  /**
   * Creates the pie chart
   *
   * @param options
   */
  function createChart(options) {
    var seriesGroups = [],
      labelsGroup,
      chartRect,
      radius,
      labelRadius,
      totalDataSum,
      startAngle = options.startAngle,
      dataArray = Chartist.getDataArray(this.data, options.reverseData);

    // Create SVG.js draw
    this.svg = Chartist.createSvg(this.container, options.width, options.height,options.donut ? options.classNames.chartDonut : options.classNames.chartPie);
    // Calculate charting rect
    chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
    // Get biggest circle radius possible within chartRect
    radius = Math.min(chartRect.width() / 2, chartRect.height() / 2);
    // Calculate total of all series to get reference value or use total reference from optional options
    totalDataSum = options.total || dataArray.reduce(function(previousValue, currentValue) {
      return previousValue + currentValue;
    }, 0);

    var donutWidth = Chartist.quantity(options.donutWidth);
    if (donutWidth.unit === '%') {
      donutWidth.value *= radius / 100;
    }

    // If this is a donut chart we need to adjust our radius to enable strokes to be drawn inside
    // Unfortunately this is not possible with the current SVG Spec
    // See this proposal for more details: http://lists.w3.org/Archives/Public/www-svg/2003Oct/0000.html
    radius -= options.donut ? donutWidth.value / 2  : 0;

    // If labelPosition is set to `outside` or a donut chart is drawn then the label position is at the radius,
    // if regular pie chart it's half of the radius
    if(options.labelPosition === 'outside' || options.donut) {
      labelRadius = radius;
    } else if(options.labelPosition === 'center') {
      // If labelPosition is center we start with 0 and will later wait for the labelOffset
      labelRadius = 0;
    } else {
      // Default option is 'inside' where we use half the radius so the label will be placed in the center of the pie
      // slice
      labelRadius = radius / 2;
    }
    // Add the offset to the labelRadius where a negative offset means closed to the center of the chart
    labelRadius += options.labelOffset;

    // Calculate end angle based on total sum and current data value and offset with padding
    var center = {
      x: chartRect.x1 + chartRect.width() / 2,
      y: chartRect.y2 + chartRect.height() / 2
    };

    // Check if there is only one non-zero value in the series array.
    var hasSingleValInSeries = this.data.series.filter(function(val) {
      return val.hasOwnProperty('value') ? val.value !== 0 : val !== 0;
    }).length === 1;

    //if we need to show labels we create the label group now
    if(options.showLabel) {
      labelsGroup = this.svg.elem('g', null, null, true);
    }

    // Draw the series
    // initialize series groups
    for (var i = 0; i < this.data.series.length; i++) {
      var series = this.data.series[i];
      seriesGroups[i] = this.svg.elem('g', null, null, true);

      // If the series is an object and contains a name or meta data we add a custom attribute
      seriesGroups[i].attr({
        'series-name': series.name
      }, Chartist.xmlNs.uri);

      // Use series class from series data or if not set generate one
      seriesGroups[i].addClass([
        options.classNames.series,
        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(i))
      ].join(' '));

      var endAngle = startAngle + dataArray[i] / totalDataSum * 360;
      // If we need to draw the arc for all 360 degrees we need to add a hack where we close the circle
      // with Z and use 359.99 degrees
      if(endAngle - startAngle === 360) {
        endAngle -= 0.01;
      }

      var start = Chartist.polarToCartesian(center.x, center.y, radius, startAngle - (i === 0 || hasSingleValInSeries ? 0 : 0.2)),
        end = Chartist.polarToCartesian(center.x, center.y, radius, endAngle);

      // Create a new path element for the pie chart. If this isn't a donut chart we should close the path for a correct stroke
      var path = new Chartist.Svg.Path(!options.donut)
        .move(end.x, end.y)
        .arc(radius, radius, 0, endAngle - startAngle > 180, 0, start.x, start.y);

      // If regular pie chart (no donut) we add a line to the center of the circle for completing the pie
      if(!options.donut) {
        path.line(center.x, center.y);
      }

      // Create the SVG path
      // If this is a donut chart we add the donut class, otherwise just a regular slice
      var pathElement = seriesGroups[i].elem('path', {
        d: path.stringify()
      }, options.donut ? options.classNames.sliceDonut : options.classNames.slicePie);

      // Adding the pie series value to the path
      pathElement.attr({
        'value': dataArray[i],
        'meta': Chartist.serialize(series.meta)
      }, Chartist.xmlNs.uri);

      // If this is a donut, we add the stroke-width as style attribute
      if(options.donut) {
        pathElement.attr({
          'style': 'stroke-width: ' + donutWidth.value + 'px'
        });
      }

      // Fire off draw event
      this.eventEmitter.emit('draw', {
        type: 'slice',
        value: dataArray[i],
        totalDataSum: totalDataSum,
        index: i,
        meta: series.meta,
        series: series,
        group: seriesGroups[i],
        element: pathElement,
        path: path.clone(),
        center: center,
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      });

      // If we need to show labels we need to add the label for this slice now
      if(options.showLabel) {
        // Position at the labelRadius distance from center and between start and end angle
        var labelPosition = Chartist.polarToCartesian(center.x, center.y, labelRadius, startAngle + (endAngle - startAngle) / 2),
          interpolatedValue = options.labelInterpolationFnc(this.data.labels ? this.data.labels[i] : dataArray[i], i);

        if(interpolatedValue || interpolatedValue === 0) {
          var labelElement = labelsGroup.elem('text', {
            dx: labelPosition.x,
            dy: labelPosition.y,
            'text-anchor': determineAnchorPosition(center, labelPosition, options.labelDirection)
          }, options.classNames.label).text('' + interpolatedValue);

          // Fire off draw event
          this.eventEmitter.emit('draw', {
            type: 'label',
            index: i,
            group: labelsGroup,
            element: labelElement,
            text: '' + interpolatedValue,
            x: labelPosition.x,
            y: labelPosition.y
          });
        }
      }

      // Set next startAngle to current endAngle. Use slight offset so there are no transparent hairline issues
      // (except for last slice)
      startAngle = endAngle;
    }

    this.eventEmitter.emit('created', {
      chartRect: chartRect,
      svg: this.svg,
      options: options
    });
  }

  /**
   * This method creates a new pie chart and returns an object that can be used to redraw the chart.
   *
   * @memberof Chartist.Pie
   * @param {String|Node} query A selector query string or directly a DOM element
   * @param {Object} data The data object in the pie chart needs to have a series property with a one dimensional data array. The values will be normalized against each other and don't necessarily need to be in percentage. The series property can also be an array of value objects that contain a value property and a className property to override the CSS class name for the series group.
   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
   * @return {Object} An object with a version and an update method to manually redraw the chart
   *
   * @example
   * // Simple pie chart example with four series
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * });
   *
   * @example
   * // Drawing a donut chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [10, 2, 4, 3]
   * }, {
   *   donut: true
   * });
   *
   * @example
   * // Using donut, startAngle and total to draw a gauge chart
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   donut: true,
   *   donutWidth: 20,
   *   startAngle: 270,
   *   total: 200
   * });
   *
   * @example
   * // Drawing a pie chart with padding and labels that are outside the pie
   * new Chartist.Pie('.ct-chart', {
   *   series: [20, 10, 30, 40]
   * }, {
   *   chartPadding: 30,
   *   labelOffset: 50,
   *   labelDirection: 'explode'
   * });
   *
   * @example
   * // Overriding the class names for individual series as well as a name and meta data.
   * // The name will be written as ct:series-name attribute and the meta data will be serialized and written
   * // to a ct:meta attribute.
   * new Chartist.Pie('.ct-chart', {
   *   series: [{
   *     value: 20,
   *     name: 'Series 1',
   *     className: 'my-custom-class-one',
   *     meta: 'Meta One'
   *   }, {
   *     value: 10,
   *     name: 'Series 2',
   *     className: 'my-custom-class-two',
   *     meta: 'Meta Two'
   *   }, {
   *     value: 70,
   *     name: 'Series 3',
   *     className: 'my-custom-class-three',
   *     meta: 'Meta Three'
   *   }]
   * });
   */
  function Pie(query, data, options, responsiveOptions) {
    Chartist.Pie.super.constructor.call(this,
      query,
      data,
      defaultOptions,
      Chartist.extend({}, defaultOptions, options),
      responsiveOptions);
  }

  // Creating pie chart type in Chartist namespace
  Chartist.Pie = Chartist.Base.extend({
    constructor: Pie,
    createChart: createChart,
    determineAnchorPosition: determineAnchorPosition
  });

}(window, document, Chartist));

return Chartist;

}));

},{}],17:[function(require,module,exports){
'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};

},{"ticky":26}],18:[function(require,module,exports){
'use strict';

var atoa = require('atoa');
var debounce = require('./debounce');

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};

},{"./debounce":17,"atoa":15}],19:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = global.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./eventmap":20,"custom-event":21}],20:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],22:[function(require,module,exports){
'use strict';

var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};

},{}],23:[function(require,module,exports){
(function (global){
'use strict';

var emitter = require('contra/emitter');
var crossvent = require('crossvent');
var classes = require('./classes');
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }
    // truthy check fixes #239, equality fixes #207
    if (e.clientX !== void 0 && e.clientX === _moveX && e.clientY !== void 0 && e.clientY === _moveY) {
      return;
    }
    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e);
      var clientY = getCoord('clientY', e);
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent === _source && _copy) {
      parent.removeChild(_copy);
    }
    var initial = isInitialPlacement(parent);
    if (initial === false && !_copy && reverts) {
      _source.insertBefore(item, _initialSibling);
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e);
    var clientY = getCoord('clientY', e);
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      reference === null ||
      reference !== item &&
      reference !== nextEl(item) &&
      reference !== _currentSibling
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && rect.left > x) { return el; }
        if (!horizontal && rect.top > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (global.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (global.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.buttons !== void 0) { return e.buttons; }
  if (e.which !== void 0) { return e.which; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof global[offsetProp] !== 'undefined') {
    return global[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  var p = point || {};
  var state = p.className;
  var el;
  p.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  p.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes":22,"contra/emitter":18,"crossvent":19}],24:[function(require,module,exports){
/*! nouislider - 8.2.1 - 2015-12-02 21:43:14 */

(function (factory) {

    if ( typeof define === 'function' && define.amd ) {

        // AMD. Register as an anonymous module.
        define([], factory);

    } else if ( typeof exports === 'object' ) {

        // Node/CommonJS
        module.exports = factory();

    } else {

        // Browser globals
        window.noUiSlider = factory();
    }

}(function( ){

	'use strict';


	// Removes duplicates from an array.
	function unique(array) {
		return array.filter(function(a){
			return !this[a] ? this[a] = true : false;
		}, {});
	}

	// Round a value to the closest 'to'.
	function closest ( value, to ) {
		return Math.round(value / to) * to;
	}

	// Current position of an element relative to the document.
	function offset ( elem ) {

	var rect = elem.getBoundingClientRect(),
		doc = elem.ownerDocument,
		docElem = doc.documentElement,
		pageOffset = getPageOffset();

		// getBoundingClientRect contains left scroll in Chrome on Android.
		// I haven't found a feature detection that proves this. Worst case
		// scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
		if ( /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) ) {
			pageOffset.x = 0;
		}

		return {
			top: rect.top + pageOffset.y - docElem.clientTop,
			left: rect.left + pageOffset.x - docElem.clientLeft
		};
	}

	// Checks whether a value is numerical.
	function isNumeric ( a ) {
		return typeof a === 'number' && !isNaN( a ) && isFinite( a );
	}

	// Rounds a number to 7 supported decimals.
	function accurateNumber( number ) {
		var p = Math.pow(10, 7);
		return Number((Math.round(number*p)/p).toFixed(7));
	}

	// Sets a class and removes it after [duration] ms.
	function addClassFor ( element, className, duration ) {
		addClass(element, className);
		setTimeout(function(){
			removeClass(element, className);
		}, duration);
	}

	// Limits a value to 0 - 100
	function limit ( a ) {
		return Math.max(Math.min(a, 100), 0);
	}

	// Wraps a variable as an array, if it isn't one yet.
	function asArray ( a ) {
		return Array.isArray(a) ? a : [a];
	}

	// Counts decimals
	function countDecimals ( numStr ) {
		var pieces = numStr.split(".");
		return pieces.length > 1 ? pieces[1].length : 0;
	}

	// http://youmightnotneedjquery.com/#add_class
	function addClass ( el, className ) {
		if ( el.classList ) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	}

	// http://youmightnotneedjquery.com/#remove_class
	function removeClass ( el, className ) {
		if ( el.classList ) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	// http://youmightnotneedjquery.com/#has_class
	function hasClass ( el, className ) {
		if ( el.classList ) {
			el.classList.contains(className);
		} else {
			new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
	function getPageOffset ( ) {

		var supportPageOffset = window.pageXOffset !== undefined,
			isCSS1Compat = ((document.compatMode || "") === "CSS1Compat"),
			x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
			y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

		return {
			x: x,
			y: y
		};
	}

	// Shorthand for stopPropagation so we don't have to create a dynamic method
	function stopPropagation ( e ) {
		e.stopPropagation();
	}

	// todo
	function addCssPrefix(cssPrefix) {
		return function(className) {
			return cssPrefix + className;
		};
	}


	var
	// Determine the events to bind. IE11 implements pointerEvents without
	// a prefix, which breaks compatibility with the IE10 implementation.
	/** @const */
	actions = window.navigator.pointerEnabled ? {
		start: 'pointerdown',
		move: 'pointermove',
		end: 'pointerup'
	} : window.navigator.msPointerEnabled ? {
		start: 'MSPointerDown',
		move: 'MSPointerMove',
		end: 'MSPointerUp'
	} : {
		start: 'mousedown touchstart',
		move: 'mousemove touchmove',
		end: 'mouseup touchend'
	},
	defaultCssPrefix = 'noUi-';


// Value calculation

	// Determine the size of a sub-range in relation to a full range.
	function subRangeRatio ( pa, pb ) {
		return (100 / (pb - pa));
	}

	// (percentage) How many percent is this value of this range?
	function fromPercentage ( range, value ) {
		return (value * 100) / ( range[1] - range[0] );
	}

	// (percentage) Where is this value on this range?
	function toPercentage ( range, value ) {
		return fromPercentage( range, range[0] < 0 ?
			value + Math.abs(range[0]) :
				value - range[0] );
	}

	// (value) How much is this percentage on this range?
	function isPercentage ( range, value ) {
		return ((value * ( range[1] - range[0] )) / 100) + range[0];
	}


// Range conversion

	function getJ ( value, arr ) {

		var j = 1;

		while ( value >= arr[j] ){
			j += 1;
		}

		return j;
	}

	// (percentage) Input a value, find where, on a scale of 0-100, it applies.
	function toStepping ( xVal, xPct, value ) {

		if ( value >= xVal.slice(-1)[0] ){
			return 100;
		}

		var j = getJ( value, xVal ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return pa + (toPercentage([va, vb], value) / subRangeRatio (pa, pb));
	}

	// (value) Input a percentage, find where it is on the specified range.
	function fromStepping ( xVal, xPct, value ) {

		// There is no range group that fits 100
		if ( value >= 100 ){
			return xVal.slice(-1)[0];
		}

		var j = getJ( value, xPct ), va, vb, pa, pb;

		va = xVal[j-1];
		vb = xVal[j];
		pa = xPct[j-1];
		pb = xPct[j];

		return isPercentage([va, vb], (value - pa) * subRangeRatio (pa, pb));
	}

	// (percentage) Get the step that applies at a certain value.
	function getStep ( xPct, xSteps, snap, value ) {

		if ( value === 100 ) {
			return value;
		}

		var j = getJ( value, xPct ), a, b;

		// If 'snap' is set, steps are used as fixed points on the slider.
		if ( snap ) {

			a = xPct[j-1];
			b = xPct[j];

			// Find the closest position, a or b.
			if ((value - a) > ((b-a)/2)){
				return b;
			}

			return a;
		}

		if ( !xSteps[j-1] ){
			return value;
		}

		return xPct[j-1] + closest(
			value - xPct[j-1],
			xSteps[j-1]
		);
	}


// Entry parsing

	function handleEntryPoint ( index, value, that ) {

		var percentage;

		// Wrap numerical input in an array.
		if ( typeof value === "number" ) {
			value = [value];
		}

		// Reject any invalid input, by testing whether value is an array.
		if ( Object.prototype.toString.call( value ) !== '[object Array]' ){
			throw new Error("noUiSlider: 'range' contains invalid value.");
		}

		// Covert min/max syntax to 0 and 100.
		if ( index === 'min' ) {
			percentage = 0;
		} else if ( index === 'max' ) {
			percentage = 100;
		} else {
			percentage = parseFloat( index );
		}

		// Check for correct input.
		if ( !isNumeric( percentage ) || !isNumeric( value[0] ) ) {
			throw new Error("noUiSlider: 'range' value isn't numeric.");
		}

		// Store values.
		that.xPct.push( percentage );
		that.xVal.push( value[0] );

		// NaN will evaluate to false too, but to keep
		// logging clear, set step explicitly. Make sure
		// not to override the 'step' setting with false.
		if ( !percentage ) {
			if ( !isNaN( value[1] ) ) {
				that.xSteps[0] = value[1];
			}
		} else {
			that.xSteps.push( isNaN(value[1]) ? false : value[1] );
		}
	}

	function handleStepPoint ( i, n, that ) {

		// Ignore 'false' stepping.
		if ( !n ) {
			return true;
		}

		// Factor to range ratio
		that.xSteps[i] = fromPercentage([
			 that.xVal[i]
			,that.xVal[i+1]
		], n) / subRangeRatio (
			that.xPct[i],
			that.xPct[i+1] );
	}


// Interface

	// The interface to Spectrum handles all direction-based
	// conversions, so the above values are unaware.

	function Spectrum ( entry, snap, direction, singleStep ) {

		this.xPct = [];
		this.xVal = [];
		this.xSteps = [ singleStep || false ];
		this.xNumSteps = [ false ];

		this.snap = snap;
		this.direction = direction;

		var index, ordered = [ /* [0, 'min'], [1, '50%'], [2, 'max'] */ ];

		// Map the object keys to an array.
		for ( index in entry ) {
			if ( entry.hasOwnProperty(index) ) {
				ordered.push([entry[index], index]);
			}
		}

		// Sort all entries by value (numeric sort).
		if ( ordered.length && typeof ordered[0][0] === "object" ) {
			ordered.sort(function(a, b) { return a[0][0] - b[0][0]; });
		} else {
			ordered.sort(function(a, b) { return a[0] - b[0]; });
		}


		// Convert all entries to subranges.
		for ( index = 0; index < ordered.length; index++ ) {
			handleEntryPoint(ordered[index][1], ordered[index][0], this);
		}

		// Store the actual step values.
		// xSteps is sorted in the same order as xPct and xVal.
		this.xNumSteps = this.xSteps.slice(0);

		// Convert all numeric steps to the percentage of the subrange they represent.
		for ( index = 0; index < this.xNumSteps.length; index++ ) {
			handleStepPoint(index, this.xNumSteps[index], this);
		}
	}

	Spectrum.prototype.getMargin = function ( value ) {
		return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
	};

	Spectrum.prototype.toStepping = function ( value ) {

		value = toStepping( this.xVal, this.xPct, value );

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.fromStepping = function ( value ) {

		// Invert the value if this is a right-to-left slider.
		if ( this.direction ) {
			value = 100 - value;
		}

		return accurateNumber(fromStepping( this.xVal, this.xPct, value ));
	};

	Spectrum.prototype.getStep = function ( value ) {

		// Find the proper step for rtl sliders by search in inverse direction.
		// Fixes issue #262.
		if ( this.direction ) {
			value = 100 - value;
		}

		value = getStep(this.xPct, this.xSteps, this.snap, value );

		if ( this.direction ) {
			value = 100 - value;
		}

		return value;
	};

	Spectrum.prototype.getApplicableStep = function ( value ) {

		// If the value is 100%, return the negative step twice.
		var j = getJ(value, this.xPct), offset = value === 100 ? 2 : 1;
		return [this.xNumSteps[j-2], this.xVal[j-offset], this.xNumSteps[j-offset]];
	};

	// Outside testing
	Spectrum.prototype.convert = function ( value ) {
		return this.getStep(this.toStepping(value));
	};

/*	Every input option is tested and parsed. This'll prevent
	endless validation in internal methods. These tests are
	structured with an item for every option available. An
	option can be marked as required by setting the 'r' flag.
	The testing function is provided with three arguments:
		- The provided value for the option;
		- A reference to the options object;
		- The name for the option;

	The testing function returns false when an error is detected,
	or true when everything is OK. It can also modify the option
	object, to make sure all values can be correctly looped elsewhere. */

	var defaultFormatter = { 'to': function( value ){
		return value !== undefined && value.toFixed(2);
	}, 'from': Number };

	function testStep ( parsed, entry ) {

		if ( !isNumeric( entry ) ) {
			throw new Error("noUiSlider: 'step' is not numeric.");
		}

		// The step option can still be used to set stepping
		// for linear sliders. Overwritten if set in 'range'.
		parsed.singleStep = entry;
	}

	function testRange ( parsed, entry ) {

		// Filter incorrect input.
		if ( typeof entry !== 'object' || Array.isArray(entry) ) {
			throw new Error("noUiSlider: 'range' is not an object.");
		}

		// Catch missing start or end.
		if ( entry.min === undefined || entry.max === undefined ) {
			throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
		}

		// Catch equal start or end.
		if ( entry.min === entry.max ) {
			throw new Error("noUiSlider: 'range' 'min' and 'max' cannot be equal.");
		}

		parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.dir, parsed.singleStep);
	}

	function testStart ( parsed, entry ) {

		entry = asArray(entry);

		// Validate input. Values aren't tested, as the public .val method
		// will always provide a valid location.
		if ( !Array.isArray( entry ) || !entry.length || entry.length > 2 ) {
			throw new Error("noUiSlider: 'start' option is incorrect.");
		}

		// Store the number of handles.
		parsed.handles = entry.length;

		// When the slider is initialized, the .val method will
		// be called with the start options.
		parsed.start = entry;
	}

	function testSnap ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.snap = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'snap' option must be a boolean.");
		}
	}

	function testAnimate ( parsed, entry ) {

		// Enforce 100% stepping within subranges.
		parsed.animate = entry;

		if ( typeof entry !== 'boolean' ){
			throw new Error("noUiSlider: 'animate' option must be a boolean.");
		}
	}

	function testConnect ( parsed, entry ) {

		if ( entry === 'lower' && parsed.handles === 1 ) {
			parsed.connect = 1;
		} else if ( entry === 'upper' && parsed.handles === 1 ) {
			parsed.connect = 2;
		} else if ( entry === true && parsed.handles === 2 ) {
			parsed.connect = 3;
		} else if ( entry === false ) {
			parsed.connect = 0;
		} else {
			throw new Error("noUiSlider: 'connect' option doesn't match handle count.");
		}
	}

	function testOrientation ( parsed, entry ) {

		// Set orientation to an a numerical value for easy
		// array selection.
		switch ( entry ){
		  case 'horizontal':
			parsed.ort = 0;
			break;
		  case 'vertical':
			parsed.ort = 1;
			break;
		  default:
			throw new Error("noUiSlider: 'orientation' option is invalid.");
		}
	}

	function testMargin ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'margin' option must be numeric.");
		}

		parsed.margin = parsed.spectrum.getMargin(entry);

		if ( !parsed.margin ) {
			throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.");
		}
	}

	function testLimit ( parsed, entry ) {

		if ( !isNumeric(entry) ){
			throw new Error("noUiSlider: 'limit' option must be numeric.");
		}

		parsed.limit = parsed.spectrum.getMargin(entry);

		if ( !parsed.limit ) {
			throw new Error("noUiSlider: 'limit' option is only supported on linear sliders.");
		}
	}

	function testDirection ( parsed, entry ) {

		// Set direction as a numerical value for easy parsing.
		// Invert connection for RTL sliders, so that the proper
		// handles get the connect/background classes.
		switch ( entry ) {
		  case 'ltr':
			parsed.dir = 0;
			break;
		  case 'rtl':
			parsed.dir = 1;
			parsed.connect = [0,2,1,3][parsed.connect];
			break;
		  default:
			throw new Error("noUiSlider: 'direction' option was not recognized.");
		}
	}

	function testBehaviour ( parsed, entry ) {

		// Make sure the input is a string.
		if ( typeof entry !== 'string' ) {
			throw new Error("noUiSlider: 'behaviour' must be a string containing options.");
		}

		// Check if the string contains any keywords.
		// None are required.
		var tap = entry.indexOf('tap') >= 0,
			drag = entry.indexOf('drag') >= 0,
			fixed = entry.indexOf('fixed') >= 0,
			snap = entry.indexOf('snap') >= 0,
			hover = entry.indexOf('hover') >= 0;

		// Fix #472
		if ( drag && !parsed.connect ) {
			throw new Error("noUiSlider: 'drag' behaviour must be used with 'connect': true.");
		}

		parsed.events = {
			tap: tap || snap,
			drag: drag,
			fixed: fixed,
			snap: snap,
			hover: hover
		};
	}

	function testTooltips ( parsed, entry ) {

		var i;

		if ( entry === false ) {
			return;
		} else if ( entry === true ) {

			parsed.tooltips = [];

			for ( i = 0; i < parsed.handles; i++ ) {
				parsed.tooltips.push(true);
			}

		} else {

			parsed.tooltips = asArray(entry);

			if ( parsed.tooltips.length !== parsed.handles ) {
				throw new Error("noUiSlider: must pass a formatter for all handles.");
			}

			parsed.tooltips.forEach(function(formatter){
				if ( typeof formatter !== 'boolean' && (typeof formatter !== 'object' || typeof formatter.to !== 'function') ) {
					throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.");
				}
			});
		}
	}

	function testFormat ( parsed, entry ) {

		parsed.format = entry;

		// Any object with a to and from method is supported.
		if ( typeof entry.to === 'function' && typeof entry.from === 'function' ) {
			return true;
		}

		throw new Error( "noUiSlider: 'format' requires 'to' and 'from' methods.");
	}

	function testCssPrefix ( parsed, entry ) {

		if ( entry !== undefined && typeof entry !== 'string' ) {
			throw new Error( "noUiSlider: 'cssPrefix' must be a string.");
		}

		parsed.cssPrefix = entry;
	}

	// Test all developer settings and parse to assumption-safe values.
	function testOptions ( options ) {

		// To prove a fix for #537, freeze options here.
		// If the object is modified, an error will be thrown.
		// Object.freeze(options);

		var parsed = {
			margin: 0,
			limit: 0,
			animate: true,
			format: defaultFormatter
		}, tests;

		// Tests are executed in the order they are presented here.
		tests = {
			'step': { r: false, t: testStep },
			'start': { r: true, t: testStart },
			'connect': { r: true, t: testConnect },
			'direction': { r: true, t: testDirection },
			'snap': { r: false, t: testSnap },
			'animate': { r: false, t: testAnimate },
			'range': { r: true, t: testRange },
			'orientation': { r: false, t: testOrientation },
			'margin': { r: false, t: testMargin },
			'limit': { r: false, t: testLimit },
			'behaviour': { r: true, t: testBehaviour },
			'format': { r: false, t: testFormat },
			'tooltips': { r: false, t: testTooltips },
			'cssPrefix': { r: false, t: testCssPrefix }
		};

		var defaults = {
			'connect': false,
			'direction': 'ltr',
			'behaviour': 'tap',
			'orientation': 'horizontal'
		};

		// Run all options through a testing mechanism to ensure correct
		// input. It should be noted that options might get modified to
		// be handled properly. E.g. wrapping integers in arrays.
		Object.keys(tests).forEach(function( name ){

			// If the option isn't set, but it is required, throw an error.
			if ( options[name] === undefined && defaults[name] === undefined ) {

				if ( tests[name].r ) {
					throw new Error("noUiSlider: '" + name + "' is required.");
				}

				return true;
			}

			tests[name].t( parsed, options[name] === undefined ? defaults[name] : options[name] );
		});

		// Forward pips options
		parsed.pips = options.pips;

		// Pre-define the styles.
		parsed.style = parsed.ort ? 'top' : 'left';

		return parsed;
	}


function closure ( target, options ){

	// All variables local to 'closure' are prefixed with 'scope_'
	var scope_Target = target,
		scope_Locations = [-1, -1],
		scope_Base,
		scope_Handles,
		scope_Spectrum = options.spectrum,
		scope_Values = [],
		scope_Events = {},
		scope_Self;

  var cssClasses = [
    /*  0 */  'target'
    /*  1 */ ,'base'
    /*  2 */ ,'origin'
    /*  3 */ ,'handle'
    /*  4 */ ,'horizontal'
    /*  5 */ ,'vertical'
    /*  6 */ ,'background'
    /*  7 */ ,'connect'
    /*  8 */ ,'ltr'
    /*  9 */ ,'rtl'
    /* 10 */ ,'draggable'
    /* 11 */ ,''
    /* 12 */ ,'state-drag'
    /* 13 */ ,''
    /* 14 */ ,'state-tap'
    /* 15 */ ,'active'
    /* 16 */ ,''
    /* 17 */ ,'stacking'
    /* 18 */ ,'tooltip'
    /* 19 */ ,''
    /* 20 */ ,'pips'
    /* 21 */ ,'marker'
    /* 22 */ ,'value'
  ].map(addCssPrefix(options.cssPrefix || defaultCssPrefix));


	// Delimit proposed values for handle positions.
	function getPositions ( a, b, delimit ) {

		// Add movement to current position.
		var c = a + b[0], d = a + b[1];

		// Only alter the other position on drag,
		// not on standard sliding.
		if ( delimit ) {
			if ( c < 0 ) {
				d += Math.abs(c);
			}
			if ( d > 100 ) {
				c -= ( d - 100 );
			}

			// Limit values to 0 and 100.
			return [limit(c), limit(d)];
		}

		return [c,d];
	}

	// Provide a clean event with standardized offset values.
	function fixEvent ( e, pageOffset ) {

		// Prevent scrolling and panning on touch events, while
		// attempting to slide. The tap event also depends on this.
		e.preventDefault();

		// Filter the event to register the type, which can be
		// touch, mouse or pointer. Offset changes need to be
		// made on an event specific basis.
		var touch = e.type.indexOf('touch') === 0,
			mouse = e.type.indexOf('mouse') === 0,
			pointer = e.type.indexOf('pointer') === 0,
			x,y, event = e;

		// IE10 implemented pointer events with a prefix;
		if ( e.type.indexOf('MSPointer') === 0 ) {
			pointer = true;
		}

		if ( touch ) {
			// noUiSlider supports one movement at a time,
			// so we can select the first 'changedTouch'.
			x = e.changedTouches[0].pageX;
			y = e.changedTouches[0].pageY;
		}

		pageOffset = pageOffset || getPageOffset();

		if ( mouse || pointer ) {
			x = e.clientX + pageOffset.x;
			y = e.clientY + pageOffset.y;
		}

		event.pageOffset = pageOffset;
		event.points = [x, y];
		event.cursor = mouse || pointer; // Fix #435

		return event;
	}

	// Append a handle to the base.
	function addHandle ( direction, index ) {

		var origin = document.createElement('div'),
			handle = document.createElement('div'),
			additions = [ '-lower', '-upper' ];

		if ( direction ) {
			additions.reverse();
		}

		addClass(handle, cssClasses[3]);
		addClass(handle, cssClasses[3] + additions[index]);

		addClass(origin, cssClasses[2]);
		origin.appendChild(handle);

		return origin;
	}

	// Add the proper connection classes.
	function addConnection ( connect, target, handles ) {

		// Apply the required connection classes to the elements
		// that need them. Some classes are made up for several
		// segments listed in the class list, to allow easy
		// renaming and provide a minor compression benefit.
		switch ( connect ) {
			case 1:	addClass(target, cssClasses[7]);
					addClass(handles[0], cssClasses[6]);
					break;
			case 3: addClass(handles[1], cssClasses[6]);
					/* falls through */
			case 2: addClass(handles[0], cssClasses[7]);
					/* falls through */
			case 0: addClass(target, cssClasses[6]);
					break;
		}
	}

	// Add handles to the slider base.
	function addHandles ( nrHandles, direction, base ) {

		var index, handles = [];

		// Append handles.
		for ( index = 0; index < nrHandles; index += 1 ) {

			// Keep a list of all added handles.
			handles.push( base.appendChild(addHandle( direction, index )) );
		}

		return handles;
	}

	// Initialize a single slider.
	function addSlider ( direction, orientation, target ) {

		// Apply classes and data to the target.
		addClass(target, cssClasses[0]);
		addClass(target, cssClasses[8 + direction]);
		addClass(target, cssClasses[4 + orientation]);

		var div = document.createElement('div');
		addClass(div, cssClasses[1]);
		target.appendChild(div);
		return div;
	}


	function addTooltip ( handle, index ) {

		if ( !options.tooltips[index] ) {
			return false;
		}

		var element = document.createElement('div');
		element.className = cssClasses[18];
		return handle.firstChild.appendChild(element);
	}

	// The tooltips option is a shorthand for using the 'update' event.
	function tooltips ( ) {

		if ( options.dir ) {
			options.tooltips.reverse();
		}

		// Tooltips are added with options.tooltips in original order.
		var tips = scope_Handles.map(addTooltip);

		if ( options.dir ) {
			tips.reverse();
			options.tooltips.reverse();
		}

		bindEvent('update', function(f, o, r) {
			if ( tips[o] ) {
				tips[o].innerHTML = options.tooltips[o] === true ? f[o] : options.tooltips[o].to(r[o]);
			}
		});
	}


	function getGroup ( mode, values, stepped ) {

		// Use the range.
		if ( mode === 'range' || mode === 'steps' ) {
			return scope_Spectrum.xVal;
		}

		if ( mode === 'count' ) {

			// Divide 0 - 100 in 'count' parts.
			var spread = ( 100 / (values-1) ), v, i = 0;
			values = [];

			// List these parts and have them handled as 'positions'.
			while ((v=i++*spread) <= 100 ) {
				values.push(v);
			}

			mode = 'positions';
		}

		if ( mode === 'positions' ) {

			// Map all percentages to on-range values.
			return values.map(function( value ){
				return scope_Spectrum.fromStepping( stepped ? scope_Spectrum.getStep( value ) : value );
			});
		}

		if ( mode === 'values' ) {

			// If the value must be stepped, it needs to be converted to a percentage first.
			if ( stepped ) {

				return values.map(function( value ){

					// Convert to percentage, apply step, return to value.
					return scope_Spectrum.fromStepping( scope_Spectrum.getStep( scope_Spectrum.toStepping( value ) ) );
				});

			}

			// Otherwise, we can simply use the values.
			return values;
		}
	}

	function generateSpread ( density, mode, group ) {

		function safeIncrement(value, increment) {
			// Avoid floating point variance by dropping the smallest decimal places.
			return (value + increment).toFixed(7) / 1;
		}

		var originalSpectrumDirection = scope_Spectrum.direction,
			indexes = {},
			firstInRange = scope_Spectrum.xVal[0],
			lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length-1],
			ignoreFirst = false,
			ignoreLast = false,
			prevPct = 0;

		// This function loops the spectrum in an ltr linear fashion,
		// while the toStepping method is direction aware. Trick it into
		// believing it is ltr.
		scope_Spectrum.direction = 0;

		// Create a copy of the group, sort it and filter away all duplicates.
		group = unique(group.slice().sort(function(a, b){ return a - b; }));

		// Make sure the range starts with the first element.
		if ( group[0] !== firstInRange ) {
			group.unshift(firstInRange);
			ignoreFirst = true;
		}

		// Likewise for the last one.
		if ( group[group.length - 1] !== lastInRange ) {
			group.push(lastInRange);
			ignoreLast = true;
		}

		group.forEach(function ( current, index ) {

			// Get the current step and the lower + upper positions.
			var step, i, q,
				low = current,
				high = group[index+1],
				newPct, pctDifference, pctPos, type,
				steps, realSteps, stepsize;

			// When using 'steps' mode, use the provided steps.
			// Otherwise, we'll step on to the next subrange.
			if ( mode === 'steps' ) {
				step = scope_Spectrum.xNumSteps[ index ];
			}

			// Default to a 'full' step.
			if ( !step ) {
				step = high-low;
			}

			// Low can be 0, so test for false. If high is undefined,
			// we are at the last subrange. Index 0 is already handled.
			if ( low === false || high === undefined ) {
				return;
			}

			// Find all steps in the subrange.
			for ( i = low; i <= high; i = safeIncrement(i, step) ) {

				// Get the percentage value for the current step,
				// calculate the size for the subrange.
				newPct = scope_Spectrum.toStepping( i );
				pctDifference = newPct - prevPct;

				steps = pctDifference / density;
				realSteps = Math.round(steps);

				// This ratio represents the ammount of percentage-space a point indicates.
				// For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-devided.
				// Round the percentage offset to an even number, then divide by two
				// to spread the offset on both sides of the range.
				stepsize = pctDifference/realSteps;

				// Divide all points evenly, adding the correct number to this subrange.
				// Run up to <= so that 100% gets a point, event if ignoreLast is set.
				for ( q = 1; q <= realSteps; q += 1 ) {

					// The ratio between the rounded value and the actual size might be ~1% off.
					// Correct the percentage offset by the number of points
					// per subrange. density = 1 will result in 100 points on the
					// full range, 2 for 50, 4 for 25, etc.
					pctPos = prevPct + ( q * stepsize );
					indexes[pctPos.toFixed(5)] = ['x', 0];
				}

				// Determine the point type.
				type = (group.indexOf(i) > -1) ? 1 : ( mode === 'steps' ? 2 : 0 );

				// Enforce the 'ignoreFirst' option by overwriting the type for 0.
				if ( !index && ignoreFirst ) {
					type = 0;
				}

				if ( !(i === high && ignoreLast)) {
					// Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
					indexes[newPct.toFixed(5)] = [i, type];
				}

				// Update the percentage count.
				prevPct = newPct;
			}
		});

		// Reset the spectrum.
		scope_Spectrum.direction = originalSpectrumDirection;

		return indexes;
	}

	function addMarking ( spread, filterFunc, formatter ) {

		var style = ['horizontal', 'vertical'][options.ort],
			element = document.createElement('div');

		addClass(element, cssClasses[20]);
		addClass(element, cssClasses[20] + '-' + style);

		function getSize( type ){
			return [ '-normal', '-large', '-sub' ][type];
		}

		function getTags( offset, source, values ) {
			return 'class="' + source + ' ' +
				source + '-' + style + ' ' +
				source + getSize(values[1]) +
				'" style="' + options.style + ': ' + offset + '%"';
		}

		function addSpread ( offset, values ){

			if ( scope_Spectrum.direction ) {
				offset = 100 - offset;
			}

			// Apply the filter function, if it is set.
			values[1] = (values[1] && filterFunc) ? filterFunc(values[0], values[1]) : values[1];

			// Add a marker for every point
			element.innerHTML += '<div ' + getTags(offset, cssClasses[21], values) + '></div>';

			// Values are only appended for points marked '1' or '2'.
			if ( values[1] ) {
				element.innerHTML += '<div '+getTags(offset, cssClasses[22], values)+'>' + formatter.to(values[0]) + '</div>';
			}
		}

		// Append all points.
		Object.keys(spread).forEach(function(a){
			addSpread(a, spread[a]);
		});

		return element;
	}

	function pips ( grid ) {

	var mode = grid.mode,
		density = grid.density || 1,
		filter = grid.filter || false,
		values = grid.values || false,
		stepped = grid.stepped || false,
		group = getGroup( mode, values, stepped ),
		spread = generateSpread( density, mode, group ),
		format = grid.format || {
			to: Math.round
		};

		return scope_Target.appendChild(addMarking(
			spread,
			filter,
			format
		));
	}


	// Shorthand for base dimensions.
	function baseSize ( ) {
		return scope_Base['offset' + ['Width', 'Height'][options.ort]];
	}

	// External event handling
	function fireEvent ( event, handleNumber, tap ) {

		if ( handleNumber !== undefined && options.handles !== 1 ) {
			handleNumber = Math.abs(handleNumber - options.dir);
		}

		Object.keys(scope_Events).forEach(function( targetEvent ) {

			var eventType = targetEvent.split('.')[0];

			if ( event === eventType ) {
				scope_Events[targetEvent].forEach(function( callback ) {
					// .reverse is in place
					// Return values as array, so arg_1[arg_2] is always valid.
					callback.call(scope_Self, asArray(valueGet()), handleNumber, asArray(inSliderOrder(Array.prototype.slice.call(scope_Values))), tap || false);
				});
			}
		});
	}

	// Returns the input array, respecting the slider direction configuration.
	function inSliderOrder ( values ) {

		// If only one handle is used, return a single value.
		if ( values.length === 1 ){
			return values[0];
		}

		if ( options.dir ) {
			return values.reverse();
		}

		return values;
	}


	// Handler for attaching events trough a proxy.
	function attach ( events, element, callback, data ) {

		// This function can be used to 'filter' events to the slider.
		// element is a node, not a nodeList

		var method = function ( e ){

			if ( scope_Target.hasAttribute('disabled') ) {
				return false;
			}

			// Stop if an active 'tap' transition is taking place.
			if ( hasClass(scope_Target, cssClasses[14]) ) {
				return false;
			}

			e = fixEvent(e, data.pageOffset);

			// Ignore right or middle clicks on start #454
			if ( events === actions.start && e.buttons !== undefined && e.buttons > 1 ) {
				return false;
			}

			// Ignore right or middle clicks on start #454
			if ( data.hover && e.buttons ) {
				return false;
			}

			e.calcPoint = e.points[ options.ort ];

			// Call the event handler with the event [ and additional data ].
			callback ( e, data );

		}, methods = [];

		// Bind a closure on the target for every event type.
		events.split(' ').forEach(function( eventName ){
			element.addEventListener(eventName, method, false);
			methods.push([eventName, method]);
		});

		return methods;
	}

	// Handle movement on document for handle and range drag.
	function move ( event, data ) {

		// Fix #498
		// Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
		// https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
		// IE9 has .buttons and .which zero on mousemove.
		// Firefox breaks the spec MDN defines.
		if ( navigator.appVersion.indexOf("MSIE 9") === -1 && event.buttons === 0 && data.buttonsProperty !== 0 ) {
			return end(event, data);
		}

		var handles = data.handles || scope_Handles, positions, state = false,
			proposal = ((event.calcPoint - data.start) * 100) / data.baseSize,
			handleNumber = handles[0] === scope_Handles[0] ? 0 : 1, i;

		// Calculate relative positions for the handles.
		positions = getPositions( proposal, data.positions, handles.length > 1);

		state = setHandle ( handles[0], positions[handleNumber], handles.length === 1 );

		if ( handles.length > 1 ) {

			state = setHandle ( handles[1], positions[handleNumber?0:1], false ) || state;

			if ( state ) {
				// fire for both handles
				for ( i = 0; i < data.handles.length; i++ ) {
					fireEvent('slide', i);
				}
			}
		} else if ( state ) {
			// Fire for a single handle
			fireEvent('slide', handleNumber);
		}
	}

	// Unbind move events on document, call callbacks.
	function end ( event, data ) {

		// The handle is no longer active, so remove the class.
		var active = scope_Base.querySelector( '.' + cssClasses[15] ),
			handleNumber = data.handles[0] === scope_Handles[0] ? 0 : 1;

		if ( active !== null ) {
			removeClass(active, cssClasses[15]);
		}

		// Remove cursor styles and text-selection events bound to the body.
		if ( event.cursor ) {
			document.body.style.cursor = '';
			document.body.removeEventListener('selectstart', document.body.noUiListener);
		}

		var d = document.documentElement;

		// Unbind the move and end events, which are added on 'start'.
		d.noUiListeners.forEach(function( c ) {
			d.removeEventListener(c[0], c[1]);
		});

		// Remove dragging class.
		removeClass(scope_Target, cssClasses[12]);

		// Fire the change and set events.
		fireEvent('set', handleNumber);
		fireEvent('change', handleNumber);

		// If this is a standard handle movement, fire the end event.
		if ( data.handleNumber !== undefined ) {
			fireEvent('end', data.handleNumber);
		}
	}

	// Fire 'end' when a mouse or pen leaves the document.
	function documentLeave ( event, data ) {
		if ( event.type === "mouseout" && event.target.nodeName === "HTML" && event.relatedTarget === null ){
			end ( event, data );
		}
	}

	// Bind move events on document.
	function start ( event, data ) {

		var d = document.documentElement;

		// Mark the handle as 'active' so it can be styled.
		if ( data.handles.length === 1 ) {
			addClass(data.handles[0].children[0], cssClasses[15]);

			// Support 'disabled' handles
			if ( data.handles[0].hasAttribute('disabled') ) {
				return false;
			}
		}

		// Fix #551, where a handle gets selected instead of dragged.
		event.preventDefault();

		// A drag should never propagate up to the 'tap' event.
		event.stopPropagation();

		// Attach the move and end events.
		var moveEvent = attach(actions.move, d, move, {
			start: event.calcPoint,
			baseSize: baseSize(),
			pageOffset: event.pageOffset,
			handles: data.handles,
			handleNumber: data.handleNumber,
			buttonsProperty: event.buttons,
			positions: [
				scope_Locations[0],
				scope_Locations[scope_Handles.length - 1]
			]
		}), endEvent = attach(actions.end, d, end, {
			handles: data.handles,
			handleNumber: data.handleNumber
		});

		var outEvent = attach("mouseout", d, documentLeave, {
			handles: data.handles,
			handleNumber: data.handleNumber
		});

		d.noUiListeners = moveEvent.concat(endEvent, outEvent);

		// Text selection isn't an issue on touch devices,
		// so adding cursor styles can be skipped.
		if ( event.cursor ) {

			// Prevent the 'I' cursor and extend the range-drag cursor.
			document.body.style.cursor = getComputedStyle(event.target).cursor;

			// Mark the target with a dragging state.
			if ( scope_Handles.length > 1 ) {
				addClass(scope_Target, cssClasses[12]);
			}

			var f = function(){
				return false;
			};

			document.body.noUiListener = f;

			// Prevent text selection when dragging the handles.
			document.body.addEventListener('selectstart', f, false);
		}

		if ( data.handleNumber !== undefined ) {
			fireEvent('start', data.handleNumber);
		}
	}

	// Move closest handle to tapped location.
	function tap ( event ) {

		var location = event.calcPoint, total = 0, handleNumber, to;

		// The tap event shouldn't propagate up and cause 'edge' to run.
		event.stopPropagation();

		// Add up the handle offsets.
		scope_Handles.forEach(function(a){
			total += offset(a)[ options.style ];
		});

		// Find the handle closest to the tapped position.
		handleNumber = ( location < total/2 || scope_Handles.length === 1 ) ? 0 : 1;

		location -= offset(scope_Base)[ options.style ];

		// Calculate the new position.
		to = ( location * 100 ) / baseSize();

		if ( !options.events.snap ) {
			// Flag the slider as it is now in a transitional state.
			// Transition takes 300 ms, so re-enable the slider afterwards.
			addClassFor( scope_Target, cssClasses[14], 300 );
		}

		// Support 'disabled' handles
		if ( scope_Handles[handleNumber].hasAttribute('disabled') ) {
			return false;
		}

		// Find the closest handle and calculate the tapped point.
		// The set handle to the new position.
		setHandle( scope_Handles[handleNumber], to );

		fireEvent('slide', handleNumber, true);
		fireEvent('set', handleNumber, true);
		fireEvent('change', handleNumber, true);

		if ( options.events.snap ) {
			start(event, { handles: [scope_Handles[handleNumber]] });
		}
	}

	// Fires a 'hover' event for a hovered mouse/pen position.
	function hover ( event ) {

		var location = event.calcPoint - offset(scope_Base)[ options.style ],
			to = scope_Spectrum.getStep(( location * 100 ) / baseSize()),
			value = scope_Spectrum.fromStepping( to );

		Object.keys(scope_Events).forEach(function( targetEvent ) {
			if ( 'hover' === targetEvent.split('.')[0] ) {
				scope_Events[targetEvent].forEach(function( callback ) {
					callback.call( scope_Self, value );
				});
			}
		});
	}

	// Attach events to several slider parts.
	function events ( behaviour ) {

		var i, drag;

		// Attach the standard drag event to the handles.
		if ( !behaviour.fixed ) {

			for ( i = 0; i < scope_Handles.length; i += 1 ) {

				// These events are only bound to the visual handle
				// element, not the 'real' origin element.
				attach ( actions.start, scope_Handles[i].children[0], start, {
					handles: [ scope_Handles[i] ],
					handleNumber: i
				});
			}
		}

		// Attach the tap event to the slider base.
		if ( behaviour.tap ) {

			attach ( actions.start, scope_Base, tap, {
				handles: scope_Handles
			});
		}

		// Fire hover events
		if ( behaviour.hover ) {
			attach ( actions.move, scope_Base, hover, { hover: true } );
			for ( i = 0; i < scope_Handles.length; i += 1 ) {
				['mousemove MSPointerMove pointermove'].forEach(function( eventName ){
					scope_Handles[i].children[0].addEventListener(eventName, stopPropagation, false);
				});
			}
		}

		// Make the range draggable.
		if ( behaviour.drag ){

			drag = [scope_Base.querySelector( '.' + cssClasses[7] )];
			addClass(drag[0], cssClasses[10]);

			// When the range is fixed, the entire range can
			// be dragged by the handles. The handle in the first
			// origin will propagate the start event upward,
			// but it needs to be bound manually on the other.
			if ( behaviour.fixed ) {
				drag.push(scope_Handles[(drag[0] === scope_Handles[0] ? 1 : 0)].children[0]);
			}

			drag.forEach(function( element ) {
				attach ( actions.start, element, start, {
					handles: scope_Handles
				});
			});
		}
	}


	// Test suggested values and apply margin, step.
	function setHandle ( handle, to, noLimitOption ) {

		var trigger = handle !== scope_Handles[0] ? 1 : 0,
			lowerMargin = scope_Locations[0] + options.margin,
			upperMargin = scope_Locations[1] - options.margin,
			lowerLimit = scope_Locations[0] + options.limit,
			upperLimit = scope_Locations[1] - options.limit;

		// For sliders with multiple handles,
		// limit movement to the other handle.
		// Apply the margin option by adding it to the handle positions.
		if ( scope_Handles.length > 1 ) {
			to = trigger ? Math.max( to, lowerMargin ) : Math.min( to, upperMargin );
		}

		// The limit option has the opposite effect, limiting handles to a
		// maximum distance from another. Limit must be > 0, as otherwise
		// handles would be unmoveable. 'noLimitOption' is set to 'false'
		// for the .val() method, except for pass 4/4.
		if ( noLimitOption !== false && options.limit && scope_Handles.length > 1 ) {
			to = trigger ? Math.min ( to, lowerLimit ) : Math.max( to, upperLimit );
		}

		// Handle the step option.
		to = scope_Spectrum.getStep( to );

		// Limit to 0/100 for .val input, trim anything beyond 7 digits, as
		// JavaScript has some issues in its floating point implementation.
		to = limit(parseFloat(to.toFixed(7)));

		// Return false if handle can't move
		if ( to === scope_Locations[trigger] ) {
			return false;
		}

		// Set the handle to the new position.
		// Use requestAnimationFrame for efficient painting.
		// No significant effect in Chrome, Edge sees dramatic
		// performace improvements.
		if ( window.requestAnimationFrame ) {
			window.requestAnimationFrame(function(){
				handle.style[options.style] = to + '%';
			});
		} else {
			handle.style[options.style] = to + '%';
		}

		// Force proper handle stacking
		if ( !handle.previousSibling ) {
			removeClass(handle, cssClasses[17]);
			if ( to > 50 ) {
				addClass(handle, cssClasses[17]);
			}
		}

		// Update locations.
		scope_Locations[trigger] = to;

		// Convert the value to the slider stepping/range.
		scope_Values[trigger] = scope_Spectrum.fromStepping( to );

		fireEvent('update', trigger);

		return true;
	}

	// Loop values from value method and apply them.
	function setValues ( count, values ) {

		var i, trigger, to;

		// With the limit option, we'll need another limiting pass.
		if ( options.limit ) {
			count += 1;
		}

		// If there are multiple handles to be set run the setting
		// mechanism twice for the first handle, to make sure it
		// can be bounced of the second one properly.
		for ( i = 0; i < count; i += 1 ) {

			trigger = i%2;

			// Get the current argument from the array.
			to = values[trigger];

			// Setting with null indicates an 'ignore'.
			// Inputting 'false' is invalid.
			if ( to !== null && to !== false ) {

				// If a formatted number was passed, attemt to decode it.
				if ( typeof to === 'number' ) {
					to = String(to);
				}

				to = options.format.from( to );

				// Request an update for all links if the value was invalid.
				// Do so too if setting the handle fails.
				if ( to === false || isNaN(to) || setHandle( scope_Handles[trigger], scope_Spectrum.toStepping( to ), i === (3 - options.dir) ) === false ) {
					fireEvent('update', trigger);
				}
			}
		}
	}

	// Set the slider value.
	function valueSet ( input ) {

		var count, values = asArray( input ), i;

		// The RTL settings is implemented by reversing the front-end,
		// internal mechanisms are the same.
		if ( options.dir && options.handles > 1 ) {
			values.reverse();
		}

		// Animation is optional.
		// Make sure the initial values where set before using animated placement.
		if ( options.animate && scope_Locations[0] !== -1 ) {
			addClassFor( scope_Target, cssClasses[14], 300 );
		}

		// Determine how often to set the handles.
		count = scope_Handles.length > 1 ? 3 : 1;

		if ( values.length === 1 ) {
			count = 1;
		}

		setValues ( count, values );

		// Fire the 'set' event for both handles.
		for ( i = 0; i < scope_Handles.length; i++ ) {
			fireEvent('set', i);
		}
	}

	// Get the slider value.
	function valueGet ( ) {

		var i, retour = [];

		// Get the value from all handles.
		for ( i = 0; i < options.handles; i += 1 ){
			retour[i] = options.format.to( scope_Values[i] );
		}

		return inSliderOrder( retour );
	}

	// Removes classes from the root and empties it.
	function destroy ( ) {
		cssClasses.forEach(function(cls){
			if ( !cls ) { return; } // Ignore empty classes
			removeClass(scope_Target, cls);
		});
		scope_Target.innerHTML = '';
		delete scope_Target.noUiSlider;
	}

	// Get the current step size for the slider.
	function getCurrentStep ( ) {

		// Check all locations, map them to their stepping point.
		// Get the step point, then find it in the input list.
		var retour = scope_Locations.map(function( location, index ){

			var step = scope_Spectrum.getApplicableStep( location ),

				// As per #391, the comparison for the decrement step can have some rounding issues.
				// Round the value to the precision used in the step.
				stepDecimals = countDecimals(String(step[2])),

				// Get the current numeric value
				value = scope_Values[index],

				// To move the slider 'one step up', the current step value needs to be added.
				// Use null if we are at the maximum slider value.
				increment = location === 100 ? null : step[2],

				// Going 'one step down' might put the slider in a different sub-range, so we
				// need to switch between the current or the previous step.
				prev = Number((value - step[2]).toFixed(stepDecimals)),

				// If the value fits the step, return the current step value. Otherwise, use the
				// previous step. Return null if the slider is at its minimum value.
				decrement = location === 0 ? null : (prev >= step[1]) ? step[2] : (step[0] || false);

			return [decrement, increment];
		});

		// Return values in the proper order.
		return inSliderOrder( retour );
	}

	// Attach an event to this slider, possibly including a namespace
	function bindEvent ( namespacedEvent, callback ) {
		scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
		scope_Events[namespacedEvent].push(callback);

		// If the event bound is 'update,' fire it immediately for all handles.
		if ( namespacedEvent.split('.')[0] === 'update' ) {
			scope_Handles.forEach(function(a, index){
				fireEvent('update', index);
			});
		}
	}

	// Undo attachment of event
	function removeEvent ( namespacedEvent ) {

		var event = namespacedEvent.split('.')[0],
			namespace = namespacedEvent.substring(event.length);

		Object.keys(scope_Events).forEach(function( bind ){

			var tEvent = bind.split('.')[0],
				tNamespace = bind.substring(tEvent.length);

			if ( (!event || event === tEvent) && (!namespace || namespace === tNamespace) ) {
				delete scope_Events[bind];
			}
		});
	}

	// Updateable: margin, limit, step, range, animate, snap
	function updateOptions ( optionsToUpdate ) {

		var v = valueGet(), i, newOptions = testOptions({
			start: [0, 0],
			margin: optionsToUpdate.margin,
			limit: optionsToUpdate.limit,
			step: optionsToUpdate.step,
			range: optionsToUpdate.range,
			animate: optionsToUpdate.animate,
			snap: optionsToUpdate.snap === undefined ? options.snap : optionsToUpdate.snap
		});

		['margin', 'limit', 'step', 'range', 'animate'].forEach(function(name){
			if ( optionsToUpdate[name] !== undefined ) {
				options[name] = optionsToUpdate[name];
			}
		});

		scope_Spectrum = newOptions.spectrum;

		// Invalidate the current positioning so valueSet forces an update.
		scope_Locations = [-1, -1];
		valueSet(v);

		for ( i = 0; i < scope_Handles.length; i++ ) {
			fireEvent('update', i);
		}
	}


	// Throw an error if the slider was already initialized.
	if ( scope_Target.noUiSlider ) {
		throw new Error('Slider was already initialized.');
	}

	// Create the base element, initialise HTML and set classes.
	// Add handles and links.
	scope_Base = addSlider( options.dir, options.ort, scope_Target );
	scope_Handles = addHandles( options.handles, options.dir, scope_Base );

	// Set the connect classes.
	addConnection ( options.connect, scope_Target, scope_Handles );

	if ( options.pips ) {
		pips(options.pips);
	}

	if ( options.tooltips ) {
		tooltips();
	}

	scope_Self = {
		destroy: destroy,
		steps: getCurrentStep,
		on: bindEvent,
		off: removeEvent,
		get: valueGet,
		set: valueSet,
		updateOptions: updateOptions
	};

	// Attach user events.
	events( options.events );

	return scope_Self;

}


	// Run the standard initializer
	function initialize ( target, originalOptions ) {

		if ( !target.nodeName ) {
			throw new Error('noUiSlider.create requires a single element.');
		}

		// Test the options and create the slider environment;
		var options = testOptions( originalOptions, target ),
			slider = closure( target, options );

		// Use the public value method to set the start values.
		slider.set(options.start);

		target.noUiSlider = slider;
		return slider;
	}

	// Use an object instead of a function for future expansibility;
	return {
		create: initialize
	};

}));
},{}],25:[function(require,module,exports){
/*
Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/
(function (root, factory){
	'use strict';

    if (typeof define === 'function' && define.amd){
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object'){
        // CommonJS
        factory(exports);

    }

    // Browser globals
    var PubSub = {};
    root.PubSub = PubSub;
    factory(PubSub);
    
}(( typeof window === 'object' && window ) || this, function (PubSub){
	'use strict';

	var messages = {},
		lastUid = -1;

	function hasKeys(obj){
		var key;

		for (key in obj){
			if ( obj.hasOwnProperty(key) ){
				return true;
			}
		}
		return false;
	}

	/**
	 *	Returns a function that throws the passed exception, for use as argument for setTimeout
	 *	@param { Object } ex An Error object
	 */
	function throwException( ex ){
		return function reThrowException(){
			throw ex;
		};
	}

	function callSubscriberWithDelayedExceptions( subscriber, message, data ){
		try {
			subscriber( message, data );
		} catch( ex ){
			setTimeout( throwException( ex ), 0);
		}
	}

	function callSubscriberWithImmediateExceptions( subscriber, message, data ){
		subscriber( message, data );
	}

	function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
		var subscribers = messages[matchedMessage],
			callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
			s;

		if ( !messages.hasOwnProperty( matchedMessage ) ) {
			return;
		}

		for (s in subscribers){
			if ( subscribers.hasOwnProperty(s)){
				callSubscriber( subscribers[s], originalMessage, data );
			}
		}
	}

	function createDeliveryFunction( message, data, immediateExceptions ){
		return function deliverNamespaced(){
			var topic = String( message ),
				position = topic.lastIndexOf( '.' );

			// deliver the message as it is now
			deliverMessage(message, message, data, immediateExceptions);

			// trim the hierarchy and deliver message to each level
			while( position !== -1 ){
				topic = topic.substr( 0, position );
				position = topic.lastIndexOf('.');
				deliverMessage( message, topic, data, immediateExceptions );
			}
		};
	}

	function messageHasSubscribers( message ){
		var topic = String( message ),
			found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
			position = topic.lastIndexOf( '.' );

		while ( !found && position !== -1 ){
			topic = topic.substr( 0, position );
			position = topic.lastIndexOf( '.' );
			found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]));
		}

		return found;
	}

	function publish( message, data, sync, immediateExceptions ){
		var deliver = createDeliveryFunction( message, data, immediateExceptions ),
			hasSubscribers = messageHasSubscribers( message );

		if ( !hasSubscribers ){
			return false;
		}

		if ( sync === true ){
			deliver();
		} else {
			setTimeout( deliver, 0 );
		}
		return true;
	}

	/**
	 *	PubSub.publish( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message, passing the data to it's subscribers
	**/
	PubSub.publish = function( message, data ){
		return publish( message, data, false, PubSub.immediateExceptions );
	};

	/**
	 *	PubSub.publishSync( message[, data] ) -> Boolean
	 *	- message (String): The message to publish
	 *	- data: The data to pass to subscribers
	 *	Publishes the the message synchronously, passing the data to it's subscribers
	**/
	PubSub.publishSync = function( message, data ){
		return publish( message, data, true, PubSub.immediateExceptions );
	};

	/**
	 *	PubSub.subscribe( message, func ) -> String
	 *	- message (String): The message to subscribe to
	 *	- func (Function): The function to call when a new message is published
	 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
	 *	you need to unsubscribe
	**/
	PubSub.subscribe = function( message, func ){
		if ( typeof func !== 'function'){
			return false;
		}

		// message is not registered yet
		if ( !messages.hasOwnProperty( message ) ){
			messages[message] = {};
		}

		// forcing token as String, to allow for future expansions without breaking usage
		// and allow for easy use as key names for the 'messages' object
		var token = 'uid_' + String(++lastUid);
		messages[message][token] = func;

		// return token for unsubscribing
		return token;
	};

	/* Public: Clears all subscriptions
	 */
	PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
		messages = {};
	};

	/*Public: Clear subscriptions by the topic
	*/
	PubSub.clearSubscriptions = function clearSubscriptions(topic){
		var m; 
		for (m in messages){
			if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0){
				delete messages[m];
			}
		}
	};

	/* Public: removes subscriptions.
	 * When passed a token, removes a specific subscription.
	 * When passed a function, removes all subscriptions for that function
	 * When passed a topic, removes all subscriptions for that topic (hierarchy)
	 *
	 * value - A token, function or topic to unsubscribe.
	 *
	 * Examples
	 *
	 *		// Example 1 - unsubscribing with a token
	 *		var token = PubSub.subscribe('mytopic', myFunc);
	 *		PubSub.unsubscribe(token);
	 *
	 *		// Example 2 - unsubscribing with a function
	 *		PubSub.unsubscribe(myFunc);
	 *
	 *		// Example 3 - unsubscribing a topic
	 *		PubSub.unsubscribe('mytopic');
	 */
	PubSub.unsubscribe = function(value){
		var isTopic    = typeof value === 'string' && messages.hasOwnProperty(value),
			isToken    = !isTopic && typeof value === 'string',
			isFunction = typeof value === 'function',
			result = false,
			m, message, t;

		if (isTopic){
			delete messages[value];
			return;
		}

		for ( m in messages ){
			if ( messages.hasOwnProperty( m ) ){
				message = messages[m];

				if ( isToken && message[value] ){
					delete message[value];
					result = value;
					// tokens are unique, so we can just stop here
					break;
				}

				if (isFunction) {
					for ( t in message ){
						if (message.hasOwnProperty(t) && message[t] === value){
							delete message[t];
							result = true;
						}
					}
				}
			}
		}

		return result;
	};
}));

},{}],26:[function(require,module,exports){
var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvamF2YXNjcmlwdHMvYXBwLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvY29udGludWUuanMiLCJhcHAvamF2YXNjcmlwdHMvY29tcG9uZW50cy9oYW1idXJnZXIuanMiLCJhcHAvamF2YXNjcmlwdHMvY29tcG9uZW50cy9uYXYuanMiLCJhcHAvamF2YXNjcmlwdHMvaGVscGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC5qcyIsImFwcC9qYXZhc2NyaXB0cy9zY3JlZW5zLzItYWJvdXQuanMiLCJhcHAvamF2YXNjcmlwdHMvc2NyZWVucy8zLXlvdS5qcyIsImFwcC9qYXZhc2NyaXB0cy9zY3JlZW5zLzUtcHlyYW1pZC5qcyIsImFwcC9qYXZhc2NyaXB0cy9zY3JlZW5zLzYtc2NlbmFyaW9zLmpzIiwiYXBwL2phdmFzY3JpcHRzL3NjcmVlbnMvNy1nb2FsLmpzIiwiYXBwL2phdmFzY3JpcHRzL3NjcmVlbnMvOC1yZXRpcmVtZW50LmpzIiwiYXBwL2phdmFzY3JpcHRzL3NjcmVlbnMvOS1wbGFuLmpzIiwiYXBwL2phdmFzY3JpcHRzL3NoZWxsLmpzIiwibm9kZV9tb2R1bGVzL2F0b2EvYXRvYS5qcyIsIm5vZGVfbW9kdWxlcy9jaGFydGlzdC9kaXN0L2NoYXJ0aXN0LmpzIiwibm9kZV9tb2R1bGVzL2NvbnRyYS9kZWJvdW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb250cmEvZW1pdHRlci5qcyIsIm5vZGVfbW9kdWxlcy9jcm9zc3ZlbnQvc3JjL2Nyb3NzdmVudC5qcyIsIm5vZGVfbW9kdWxlcy9jcm9zc3ZlbnQvc3JjL2V2ZW50bWFwLmpzIiwibm9kZV9tb2R1bGVzL2N1c3RvbS1ldmVudC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kcmFndWxhL2NsYXNzZXMuanMiLCJub2RlX21vZHVsZXMvZHJhZ3VsYS9kcmFndWxhLmpzIiwibm9kZV9tb2R1bGVzL25vdWlzbGlkZXIvZGlzdHJpYnV0ZS9ub3Vpc2xpZGVyLmpzIiwibm9kZV9tb2R1bGVzL3B1YnN1Yi1qcy9zcmMvcHVic3ViLmpzIiwibm9kZV9tb2R1bGVzL3RpY2t5L3RpY2t5LWJyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGhJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3psQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3QwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBtb2RlbCA9IHJlcXVpcmUoJy4vbW9kZWwnKTtcbnZhciBzaGVsbCA9IHJlcXVpcmUoJy4vc2hlbGwnKTtcblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgaGVscGVycy5pbml0KCk7XG4gIG1vZGVsLmluaXQoJ3dlYWx0aEFwcCcpO1xuICBzaGVsbC5pbml0KCk7XG59O1xuXG5pbml0KCk7XG4iLCIvKipcbiAqIENvbnRpbnVlIGJ1dHRvbnMgbW9kdWxlXG4gKiBAbW9kdWxlIGNvbnRpbnVlXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uZmlnTWFwID0ge1xuICBjb250aW51ZUNsYXNzOiAnY29udGludWUnLFxuICBuYXZDbGFzczogJ25hdidcbn07XG52YXIgY29udGludWVCdXR0b25zO1xuXG4vKipcbiAqIERPTSBGVU5DVElPTlNcbiAqL1xuXG52YXIgc2V0QWN0aXZlID0gZnVuY3Rpb24obmV3QWN0aXZlLCBjbGFzc05hbWUpIHtcbiAgdmFyIG9sZEFjdGl2ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKVswXTtcbiAgb2xkQWN0aXZlLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgbmV3QWN0aXZlLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbn07XG5cbnZhciBhY3RpdmF0ZU5hdiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmF2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAubmF2Q2xhc3MpWzBdO1xuICB2YXIgbmV3QWN0aXZlTmF2TGluayA9IG5hdi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKVswXS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgLy9DaGVjayBpZiBpdCBpcyB0aGUgbGFzdCBuYXYgbGluaywgd2hpY2ggZG9lc24ndCBoYXZlIHNpYmxpbmdzXG4gIGlmIChuZXdBY3RpdmVOYXZMaW5rKSB7XG4gICAgLy9BY3RpdmF0ZSB0aGUgbmF2aWdhdGlvbiBpdGVtXG4gICAgaWYgKG5ld0FjdGl2ZU5hdkxpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNhYmxlZCcpKSB7XG4gICAgICBuZXdBY3RpdmVOYXZMaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIHNldEFjdGl2ZShuZXdBY3RpdmVOYXZMaW5rLCAnYWN0aXZlJyk7XG4gICAgcmV0dXJuIG5ld0FjdGl2ZU5hdkxpbms7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFBVQkxJQyBGVU5DVElPTlNcbiAqL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIGlmIChldmVudCA9PT0gJ2NvbnRpbnVlQ2xpY2tlZCcpIHtcbiAgICBjb250aW51ZUJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0U3RlcCA9IHRoaXMuZGF0YXNldC50ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5leHRTdGVwRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUobmV4dFN0ZXAgKyAnLXdyYXBwZXInKVswXTtcbiAgICAgICAgc2V0QWN0aXZlKG5leHRTdGVwRWxlbWVudCwgJ3Nob3cnKTtcbiAgICAgICAgdmFyIG5leHRBY3RpdmVOYXZMaW5rID0gYWN0aXZhdGVOYXYoKTtcbiAgICAgICAgaGFuZGxlcihuZXh0QWN0aXZlTmF2TGluayk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgY29udGludWVCdXR0b25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAuY29udGludWVDbGFzcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgaW5pdDogaW5pdFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvZ2dsZUhhbmRsZXIgPSBmdW5jdGlvbih0b2dnbGUpIHtcbiAgdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21lbnUtb3BlbicpO1xuICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdtZW51LW9wZW4nKTtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0b2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYy1oYW1idXJnZXInKTtcbiAgdG9nZ2xlSGFuZGxlcih0b2dnbGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGluaXRcbn07XG4iLCJ2YXIgY29uZmlnTWFwID0ge1xuICBibG9ja2luZzogdHJ1ZSwgLy9XaGV0aGVyIHN0ZXBzIHNob3VsZCBiZSBkaXNhYmxlZCBpZiBub3Qgc2VlbiB5ZXRcbiAgbmF2Q2xhc3M6ICduYXYnXG59O1xudmFyIG5hdjtcblxudmFyIHNldEFjdGl2ZSA9IGZ1bmN0aW9uKG5ld0FjdGl2ZSwgY2xhc3NOYW1lKSB7XG4gIHZhciBvbGRBY3RpdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZSlbMF07XG4gIG9sZEFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gIG5ld0FjdGl2ZS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG59O1xuXG52YXIgb25OYXZDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIG5vZGVOYW1lID0gZS50YXJnZXQubm9kZU5hbWUsXG4gICAgbmV4dFN0ZXAsIG5leHRTdGVwRWxlbWVudCwgY2xpY2tlZExpbms7XG5cbiAgLy9JZiBpdCBpcyB0aGUgJ1Jlc2V0IE1vZGVsJyBidXR0b25cbiAgaWYgKG5vZGVOYW1lID09PSAnQScpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAobm9kZU5hbWUgPT09ICdTUEFOJykge1xuICAgIG5leHRTdGVwID0gZS50YXJnZXQuZGF0YXNldC50ZW1wbGF0ZTtcbiAgICBjbGlja2VkTGluayA9IGUudGFyZ2V0LnBhcmVudE5vZGU7XG4gIH0gZWxzZSBpZiAobm9kZU5hbWUgPT09ICdMSScpIHtcbiAgICBuZXh0U3RlcCA9IGUudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmRhdGFzZXQudGVtcGxhdGU7XG4gICAgY2xpY2tlZExpbmsgPSBlLnRhcmdldDtcbiAgfVxuICBpZiAoIWNsaWNrZWRMaW5rLmNsYXNzTGlzdC5jb250YWlucygnZGlzYWJsZWQnKSAmJiBjb25maWdNYXAuYmxvY2tpbmcpIHtcbiAgICBzZXRBY3RpdmUoY2xpY2tlZExpbmssICdhY3RpdmUnKTtcbiAgICBuZXh0U3RlcEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKG5leHRTdGVwICsgJy13cmFwcGVyJylbMF07XG4gICAgc2V0QWN0aXZlKG5leHRTdGVwRWxlbWVudCwgJ3Nob3cnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQVUJMSUMgRlVOQ1RJT05TXG4gKi9cblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgbmF2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAubmF2Q2xhc3MpWzBdO1xuICBuYXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbk5hdkNsaWNrKTtcbn07XG5cbi8qKlxuICogQWRkcyAnZGlzYWJsZWQnIGNsYXNzIHRvIG5hdmlnYXRpb24gbGlua3MgZnJvbSB0aGUgaXRlbSBudW1iZXIgJ3N0YXJ0J1xuICogQHBhcmFtICB7bnVtYmVyfSBzdGFydCBOdW1iZXIgb2YgdGhlIGZpcnN0IGxpbmsgdG8gc3RhcnQgd2l0aFxuICovXG52YXIgc2V0RGlzYWJsZWRMaW5rcyA9IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gIHZhciBuYXZJdGVtcyA9IG5hdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0LCBsZW4gPSBuYXZJdGVtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIG5hdkl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBpbml0LFxuICBzZXREaXNhYmxlZExpbmtzOiBzZXREaXNhYmxlZExpbmtzXG59O1xuIiwiLyoqXG4gKiBIZWxwZXJzIG1vZHVsZVxuICogQG1vZHVsZSBoZWxwZXJzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9VaVNsaWRlciA9IHJlcXVpcmUoJ25vdWlzbGlkZXInKTtcblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgLyoqXG4gICAqICAgSlFVRVJZIEZVTkNUSU9OU1xuICAgKi9cblxuICAvLyBHZXQgZWxlbWVudChzKSBieSBDU1Mgc2VsZWN0b3I6XG4gIHdpbmRvdy5xcyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzY29wZSkge1xuICAgIHJldHVybiAoc2NvcGUgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xuICB3aW5kb3cucXNhID0gZnVuY3Rpb24oc2VsZWN0b3IsIHNjb3BlKSB7XG4gICAgcmV0dXJuIChzY29wZSB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG5cbiAgLy8gYWRkRXZlbnRMaXN0ZW5lciB3cmFwcGVyOlxuICB3aW5kb3cuJG9uID0gZnVuY3Rpb24odGFyZ2V0LCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCAhIXVzZUNhcHR1cmUpO1xuICB9O1xuXG4gIC8vIEZpbmQgdGhlIGVsZW1lbnQncyBwYXJlbnQgd2l0aCB0aGUgZ2l2ZW4gdGFnIG5hbWU6XG4gIC8vICRwYXJlbnQocXMoJ2EnKSwgJ2RpdicpO1xuICB3aW5kb3cuJHBhcmVudCA9IGZ1bmN0aW9uKGVsZW1lbnQsIHRhZ05hbWUpIHtcbiAgICBpZiAoIWVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gdGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICByZXR1cm4gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gd2luZG93LiRwYXJlbnQoZWxlbWVudC5wYXJlbnROb2RlLCB0YWdOYW1lKTtcbiAgfTtcblxuICAvKipcbiAgICogW2Z1bmN0aW9uIGRlc2NyaXB0aW9uXVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2tcbiAgICovXG4gIHdpbmRvdy4kcmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiAgIE5PIEpRVUVSWSBGVU5DVElPTlNcbiAgICovXG5cbiAgLyoqXG4gICAqIFRocm93cyBhIG5ldyBFcnJvclxuICAgKi9cbiAgd2luZG93Lm1ha2VFcnJvciA9IGZ1bmN0aW9uKG5hbWUsIG1zZywgZGF0YSkge1xuICAgIHZhciBlcnJvciA9IHt9O1xuICAgIGVycm9yLm5hbWUgPSBuYW1lO1xuICAgIGVycm9yLm1zZyA9IG1zZztcbiAgICBpZiAoZGF0YSkge1xuICAgICAgZXJyb3IuZGF0YSA9IGRhdGE7XG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IubXNnKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgc2xpZGVyIHVzaW5nIG5vVWlTbGlkZXJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEhUTUwgTm9kZSBvZiB0aGUgc2xpZGVyXG4gICAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBTbGlkZXIgb3B0aW9uc1xuICAgKi9cbiAgd2luZG93LmNyZWF0ZVNsaWRlciA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG5vVWlTbGlkZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cubWFrZUVycm9yKCdOb3Vpc2xpZGVyJywgJ25vdWlzbGlkZXIgb2JqZWN0IGlzIG5vdCBkZWNsYXJlZC4nKTtcbiAgICB9XG4gICAgbm9VaVNsaWRlci5jcmVhdGUoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgZWxlbWVudC5oYW5kbGUgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25vVWktaGFuZGxlJylbMF07XG4gICAgZWxlbWVudC50b29sdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5oYW5kbGUuYXBwZW5kQ2hpbGQoZWxlbWVudC50b29sdGlwKTtcblxuICAgIGVsZW1lbnQudG9vbHRpcC5jbGFzc0xpc3QuYWRkKCdzbGlkZXItdG9vbHRpcCcpO1xuICAgIGVsZW1lbnQudG9vbHRpcC5pbm5lckhUTUwgPSAnPHNwYW4+PC9zcGFuPic7XG4gICAgZWxlbWVudC50b29sdGlwID0gZWxlbWVudC50b29sdGlwLmZpcnN0RWxlbWVudENoaWxkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNvbmZpZ01hcCBvZiB0aGUgbW9kdWxlIC0gSXQgZ29lcyBkZWVwIGluIHRoZSBvYmplY3RcbiAgICovXG4gIHdpbmRvdy5zZXRDb25maWdNYXAgPSBmdW5jdGlvbihpbnB1dE1hcCwgY29uZmlnTWFwKSB7XG4gICAgdmFyIGtleTtcblxuICAgIGZvciAoa2V5IGluIGlucHV0TWFwKSB7XG4gICAgICBpZiAoY29uZmlnTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKGlucHV0TWFwW2tleV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICB3aW5kb3cuc2V0Q29uZmlnTWFwKGlucHV0TWFwW2tleV0sIGNvbmZpZ01hcFtrZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25maWdNYXBba2V5XSA9IGlucHV0TWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5tYWtlRXJyb3IoJ1dyb25nIGlucHV0TWFwJywgJ1Byb3BlcnR5IFwiJyArIGtleSArICdcIiBpcyBub3QgYXZhaWxhYmxlIGluIGNvbmZpZ01hcCcpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUFJPVE9UWVBFIEZVTkNUSU9OU1xuICAgKi9cblxuICAvLyBBbGxvdyBmb3IgbG9vcGluZyBvbiBub2RlcyBieSBjaGFpbmluZyBhbmQgdXNpbmcgZm9yRWFjaCBvbiBib3RoIE5vZGVsaXN0cyBhbmQgSFRNTENvbGxlY3Rpb25zXG4gIC8vIHFzYSgnLmZvbycpLmZvckVhY2goZnVuY3Rpb24gKCkge30pXG4gIE5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gIEhUTUxDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGUgRUNNQVNjcmlwdCAyMDE1ICdmaW5kJyBmdW5jdGlvbiBpbiBBcnJheXNcbiAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZmluZFxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gIUFycmF5LnByb3RvdHlwZS5maW5kIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXlcbiAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgKi9cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5wcm90b3R5cGUuZmluZCBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIHZhciBsaXN0ID0gT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBpbml0XG59O1xuIiwiLyoqXG4gKiBNb2RlbCBtb2R1bGVcbiAqIEBtb2R1bGUgbW9kZWxcbiAqL1xuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0YXRlTWFwID0ge1xuICBkYk5hbWU6ICcnXG59O1xuXG52YXIgZGVmYXVsdE1vZGVsID0ge1xuICBhYm91dEFnZTogMzUsXG4gIGFib3V0U2l0dWF0aW9uOiAnbWFycmllZCcsXG4gIGFib3V0TGl2aW5nOiAnb3duJyxcbiAgYWJvdXRJbmNvbWU6IDYwMDAwLFxuICBhYm91dEJhc2ljUmF0ZTogNDUsXG4gIGFib3V0RGlzY3JldGlvbmFyeVJhdGU6IDI1LFxuICBhYm91dFNhdmluZ3NSYXRlOiAzMCxcbiAgYW5udWFsU2F2aW5nczogMTgwMDAsXG4gIGN1cnJlbnRTYXZpbmdzOiAxMDAwMCxcbiAgLy9hYm91dFN0YWdlOiAnaG9tZScsXG4gIGJhc2ljTmVlZHM6IDI3MDAwLFxuICBsYXN0VXNlclN0ZXA6IDEsXG4gIGRpc2NyZXRpb25hcnlFeHBlbnNlczogMTUwMDAsXG4gIHBpY2tlZEdvYWxzOiBbXSxcbiAgc2F2ZWRBY3Rpb25zOiBbXVxufTtcblxudmFyIGdvYWxzTGlzdCA9IFtcbiAge1xuICAgIGlkOiAnY29sbGVnZScsXG4gICAgdGl0bGU6ICdTYXZlIGZvciBjb2xsZWdlJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfSxcbiAge1xuICAgIGlkOiAnaG9tZScsXG4gICAgdGl0bGU6ICdCdXkgYSBob21lJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfSxcbiAge1xuICAgIGlkOiAnY2FyJyxcbiAgICB0aXRsZTogJ1NhdmUgZm9yIGNhcicsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH0sXG4gIHtcbiAgICBpZDogJ2Z1bmRzJyxcbiAgICB0aXRsZTogJ0VtZXJnZW5jeSBmdW5kcycsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NhcmRzJyxcbiAgICB0aXRsZTogJ1BheS1kb3duIENyZWRpdCBDYXJkcycsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH0sXG4gIHtcbiAgICBpZDogJ3JldGlyZScsXG4gICAgdGl0bGU6ICdSZXRpcmUnLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9XG5dO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbW9kZWwuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxuICovXG52YXIgcmVhZCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBkYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSk7XG4gIHZhciB1c2VyID0gZGF0YS51c2VyO1xuXG4gIGlmKHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gdXNlcjtcbiAgfVxuXG4gIHJldHVybiB1c2VyW3Byb3BlcnR5XTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyBtb2RlbCBieSBnaXZpbmcgaXQgdGhlIHByb3BlcnR5IG5hbWUgYW5kIGl0cyB2YWx1ZS5cbiAqIEBwYXJhbSAge3N0cmluZ30gcHJvcGVydHkgICBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gdXBkYXRlXG4gKiBAcGFyYW0gIHtvYmplY3R9IHVwZGF0ZURhdGEgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcbiAqL1xudmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdXBkYXRlRGF0YSwgY2FsbGJhY2spIHtcbiAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdKTtcbiAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG5cbiAgdXNlcltwcm9wZXJ0eV0gPSB1cGRhdGVEYXRhO1xuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuICBjYWxsYmFjayh1cGRhdGVEYXRhKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBkYXRhIGZyb20gbW9kZWxcbiAqIEBwYXJhbSAge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGJlIHJlbW92ZWQgZnJvbSBtb2RlbC5cbiAqL1xudmFyIHJlbW92ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICB2YXIgZGF0YSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW3N0YXRlTWFwLmRiTmFtZV0pO1xuICB2YXIgdXNlciA9IGRhdGEudXNlcjtcblxuICBkZWxldGUgdXNlcltwcm9wZXJ0eV07XG5cbiAgbG9jYWxTdG9yYWdlW3N0YXRlTWFwLmRiTmFtZV0gPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbn07XG5cbi8qKlxuICogV0FSTklORzogV2lsbCByZW1vdmUgQUxMIGRhdGEgZnJvbSBzdG9yYWdlLlxuICovXG52YXIgcmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VyOiBkZWZhdWx0TW9kZWwgfSk7XG59O1xuXG4vKipcbiAqIFNQRUNJRklDIE1PREVMIERBVEEtRlVOQ1RJT05TXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBnb2Fsc1xuICogQHJldHVybiB7YXJyYXl9XG4gKi9cbnZhciBnZXRHb2FscyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ29hbHNMaXN0O1xufTtcblxuLyoqXG4gKiBVcGRhdGUgYmFzaWMgbmVlZHMsIGRpc2NyZXRpb25hcnkgYW5kIGFubnVhbCBzYXZpbmdzIGFjdHVhbCB2YWx1ZXMgYmFzZWQgb24gcmF0ZXNcbiAqL1xudmFyIHVwZGF0ZU1vbmV5VmFsdWVzID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdKTtcbiAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG5cbiAgdXNlci5iYXNpY05lZWRzID0gdXNlci5hYm91dEluY29tZSAqIHVzZXIuYWJvdXRCYXNpY1JhdGUgKiAwLjAxO1xuICB1c2VyLmRpc2NyZXRpb25hcnlFeHBlbnNlcyA9IHVzZXIuYWJvdXRJbmNvbWUgKiB1c2VyLmFib3V0RGlzY3JldGlvbmFyeVJhdGUgKiAwLjAxO1xuICB1c2VyLmFubnVhbFNhdmluZ3MgPSB1c2VyLmFib3V0SW5jb21lICogdXNlci5hYm91dFNhdmluZ3NSYXRlICogMC4wMTtcblxuICBsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuXG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcblxuICBjYWxsYmFjayh7XG4gICAgYmFzaWNOZWVkczogdXNlci5iYXNpY05lZWRzLFxuICAgIGRpc2NyZXRpb25hcnlFeHBlbnNlczogdXNlci5kaXNjcmV0aW9uYXJ5RXhwZW5zZXMsXG4gICAgYW5udWFsU2F2aW5nczogdXNlci5hbm51YWxTYXZpbmdcbiAgfSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgYXJyYXkgb2YgcGlja2VkIGdvYWxzIGFkZGluZyBvciByZW1vdmluZyB0aGUgZ29hbFxuICogQHBhcmFtICB7b2JqZWN0fSBnb2FsIFRoZSBnb2FsIHRvIHJlbW92ZSBvciBhZGQgdG8gdGhlIGxpc3RcbiAqL1xudmFyIHRvZ2dsZUdvYWwgPSBmdW5jdGlvbihnb2FsKSB7XG4gIHZhciBkYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSk7XG4gIHZhciBnb2FscyA9IGRhdGEudXNlci5waWNrZWRHb2FscztcblxuICB2YXIgYWxyZWFkeVBpY2tlZCA9IGZhbHNlO1xuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBnb2Fscy5sZW5ndGg7IGkgPCBsZW4gJiYgIWFscmVhZHlQaWNrZWQ7IGkrKykge1xuICAgIGlmKGdvYWxzW2ldLmlkID09PSBnb2FsLmlkKSB7XG4gICAgICBnb2Fscy5zcGxpY2UoaSwgMSk7XG4gICAgICBhbHJlYWR5UGlja2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZighYWxyZWFkeVBpY2tlZCkge1xuICAgIGdvYWxzLnB1c2goZ29hbCk7XG4gIH1cblxuICBsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGFycmF5IG9mIHNhdmVkIGFkZGluZyBvciByZW1vdmluZyB0aGUgZ29hbFxuICogQHBhcmFtICB7b2JqZWN0fSBhY3Rpb24gVGhlIGFjdGlvbiB0byByZW1vdmUgb3IgYWRkIHRvIHRoZSBsaXN0XG4gKi9cbnZhciB0b2dnbGVBY3Rpb25zID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gIHZhciBkYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSk7XG4gIHZhciBhY3Rpb25zID0gZGF0YS51c2VyLnNhdmVkQWN0aW9ucztcblxuICB2YXIgYWxyZWFkeVNhdmVkID0gZmFsc2U7XG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IGFjdGlvbnMubGVuZ3RoOyBpIDwgbGVuICYmICFhbHJlYWR5U2F2ZWQ7IGkrKykge1xuICAgIGlmKGFjdGlvbnNbaV0uaWQgPT09IGFjdGlvbi5pZCkge1xuICAgICAgYWN0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICBhbHJlYWR5U2F2ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmKCFhbHJlYWR5U2F2ZWQpIHtcbiAgICBhY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgfVxuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59O1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgc3RhdGVNYXAuZGJOYW1lID0gbmFtZTtcblxuICBpZih0eXBlb2Ygd2luZG93LlN0b3JhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIHdpbmRvdy5tYWtlRXJyb3IoJ2xvY2FsU3RvcmFnZSBzdXBwb3J0JywgJ0Vycm9yOiBsb2NhbFN0b3JhZ2UgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZighbG9jYWxTdG9yYWdlW25hbWVdKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICB1c2VyOiBkZWZhdWx0TW9kZWxcbiAgICB9O1xuXG4gICAgbG9jYWxTdG9yYWdlW25hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRHb2FsczogZ2V0R29hbHMsXG4gIGluaXQ6IGluaXQsXG4gIHJlYWQ6IHJlYWQsXG4gIHJlc2V0OiByZXNldCxcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIHRvZ2dsZUFjdGlvbnM6IHRvZ2dsZUFjdGlvbnMsXG4gIHRvZ2dsZUdvYWw6IHRvZ2dsZUdvYWwsXG4gIHVwZGF0ZTogdXBkYXRlLFxuICB1cGRhdGVNb25leVZhbHVlczogdXBkYXRlTW9uZXlWYWx1ZXNcbn07XG4iLCIvKipcbiAqIFNjcmVlbiAjMiAtIEFib3V0IG1vZHVsZVxuICogQG1vZHVsZSAyLWFib3V0XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAgYWdlU2xpZGVyOiAnYWJvdXRfX2FnZV9fc2xpZGVyJyxcbiAgaW5jb21lU2xpZGVyOiAnYWJvdXRfX2luY29tZV9fc2xpZGVyJyxcbiAgYWdlT3B0aW9uczoge1xuICAgIHN0YXJ0OiAzNSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMTgsXG4gICAgICAnbWF4JzogNjVcbiAgICB9LFxuICAgIHBpcHM6IHtcbiAgICAgIG1vZGU6ICd2YWx1ZXMnLFxuICAgICAgdmFsdWVzOiBbMjAsIDMwLCA0MCwgNTAsIDYwLCA2NV0sXG4gICAgICBkZW5zaXR5OiA1XG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAxLFxuICAgICAgdGhvdXNhbmQ6ICcuJ1xuICAgIH0pXG4gIH0sXG4gIGluY29tZU9wdGlvbnM6IHtcbiAgICBzdGFydDogNjAwMDAsXG4gICAgc3RlcDogMTAwMCxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDE4MDAwLFxuICAgICAgJ21heCc6IDIwMDAwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMSxcbiAgICAgIHRob3VzYW5kOiAnLidcbiAgICB9KVxuICB9LFxuICBvcHRpb25MaXN0czogJ2Fib3V0X19zZWxlY3QnLFxuICBhYm91dFNpdHVhdGlvbjogJ21hcnJpZWQta2lkcycsXG4gIGFib3V0TGl2aW5nOiAncmVudCdcbn07XG5cbnZhciBhZ2VTbGlkZXIsIGluY29tZVNsaWRlcixcbiAgc2l0dWF0aW9uLCBsaXZpbmc7XG5cbi8qKlxuICogRVZFTlQgSEFORExFUlNcbiAqL1xuXG52YXIgc2hvd1NsaWRlclRvb2x0aXAgPSBmdW5jdGlvbihzbGlkZXIsIHZhbHVlcykge1xuICB2YXIgdG9vbHRpcCA9IHNsaWRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICBpZiAoc2xpZGVyLmNsYXNzTGlzdC5jb250YWlucyhjb25maWdNYXAuaW5jb21lU2xpZGVyKSkge1xuICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gJyQnICsgdmFsdWVzWzBdO1xuICB9IGVsc2Uge1xuICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gdmFsdWVzWzBdO1xuICB9XG59O1xuXG4vKipcbiAqIERPTSBGVU5DVElPTlNcbiAqL1xuXG52YXIgY3JlYXRlU2xpZGVycyA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cuY3JlYXRlU2xpZGVyKGFnZVNsaWRlciwgY29uZmlnTWFwLmFnZU9wdGlvbnMpO1xuICB3aW5kb3cuY3JlYXRlU2xpZGVyKGluY29tZVNsaWRlciwgY29uZmlnTWFwLmluY29tZU9wdGlvbnMpO1xuXG4gIGFnZVNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICBzaG93U2xpZGVyVG9vbHRpcChhZ2VTbGlkZXIsIHZhbHVlcyk7XG4gIH0pO1xuXG4gIGluY29tZVNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICBzaG93U2xpZGVyVG9vbHRpcChpbmNvbWVTbGlkZXIsIHZhbHVlcyk7XG4gIH0pO1xufTtcblxudmFyIHNldE9wdGlvbkxpc3RzID0gZnVuY3Rpb24oKSB7XG4gIHNpdHVhdGlvbi52YWx1ZSA9IGNvbmZpZ01hcC5hYm91dFNpdHVhdGlvbjtcbiAgbGl2aW5nLnZhbHVlID0gY29uZmlnTWFwLmFib3V0TGl2aW5nO1xufTtcblxuLyoqXG4gKiBQVUJMSUMgRlVOQ1RJT05TXG4gKi9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBpZiAoZXZlbnQgPT09ICdhZ2VDaGFuZ2VkJykge1xuICAgIGFnZVNsaWRlci5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgIGhhbmRsZXIoTnVtYmVyKHZhbHVlc1swXSkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGV2ZW50ID09PSAnaW5jb21lQ2hhbmdlZCcpIHtcbiAgICBpbmNvbWVTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0ucmVwbGFjZSgnLicsICcnKSkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGV2ZW50ID09PSAnc2l0dWF0aW9uQ2hhbmdlZCcpIHtcbiAgICBzaXR1YXRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGhhbmRsZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChldmVudCA9PT0gJ2xpdmluZ0NoYW5nZWQnKSB7XG4gICAgbGl2aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBoYW5kbGVyKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBjb25maWdNb2R1bGUgPSBmdW5jdGlvbihpbnB1dE1hcCkge1xuICB3aW5kb3cuc2V0Q29uZmlnTWFwKGlucHV0TWFwLCBjb25maWdNYXApO1xufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgLy9ET00gZWxlbWVudHNcbiAgYWdlU2xpZGVyID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLmFnZVNsaWRlcilbMF07XG4gIGluY29tZVNsaWRlciA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZ01hcC5pbmNvbWVTbGlkZXIpWzBdO1xuICBzaXR1YXRpb24gPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWJvdXRfX3NlbGVjdCcpWzBdO1xuICBsaXZpbmcgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYWJvdXRfX3NlbGVjdCcpWzFdO1xuXG4gIGNyZWF0ZVNsaWRlcnMoKTtcblxuICBzZXRPcHRpb25MaXN0cygpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIGNvbmZpZ01vZHVsZTogY29uZmlnTW9kdWxlLFxuICBpbml0OiBpbml0XG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzMgLSBZb3UgbW9kdWxlXG4gKiBAbW9kdWxlIDMteW91XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG5cbnZhciBjb25maWdNYXAgPSB7XG4gIGFib3V0SW5jb21lOiA2MDAwMCxcbiAgbmVlZHNTbGlkZXI6ICdhYm91dF9fc2F2aW5nc19fc2xpZGVyLS1uZWVkcycsXG4gIGV4cGVuc2VzU2xpZGVyOiAnYWJvdXRfX3NhdmluZ3NfX3NsaWRlci0tZXhwZW5zZXMnLFxuICBzYXZpbmdzU2xpZGVyOiAnY3VycmVudC1zYXZpbmdzX19zbGlkZXInLFxuICAvL1NsaWRlciBvcHRpb25zXG4gIG5lZWRzT3B0aW9uczoge1xuICAgIHN0YXJ0OiA0NSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMSxcbiAgICAgICdtYXgnOiA2MFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH0sXG4gIGV4cGVuc2VzT3B0aW9uczoge1xuICAgIHN0YXJ0OiAyNSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMSxcbiAgICAgICdtYXgnOiA0MFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH0sXG4gIHNhdmluZ3NPcHRpb25zOiB7XG4gICAgc3RhcnQ6IDEwMDAwLFxuICAgIHN0ZXA6IDEwMDAsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxMDAwLFxuICAgICAgJ21heCc6IDEwMDAwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMSxcbiAgICAgIHRob3VzYW5kOiAnLidcbiAgICB9KVxuICB9LFxuICAvL0RvdWdobnV0IG9wdGlvbnNcbiAgZG91Z2hudXRDbGFzczogJ2Fib3V0X19zYXZpbmdzX19jaXJjbGUnLFxuICBkb3VnaG51dERhdGE6IHtcbiAgICBzZXJpZXM6IFt7XG4gICAgICB2YWx1ZTogNDUsXG4gICAgICBuYW1lOiAnQmFzaWMgTmVlZHMnXG4gICAgfSwge1xuICAgICAgdmFsdWU6IDI1LFxuICAgICAgbmFtZTogJ0Rpc2NyZXRpb25hcnknXG4gICAgfV1cbiAgfSxcbiAgZG91Z2hudXRPcHRpb25zOiB7XG4gICAgZG9udXQ6IHRydWUsXG4gICAgZG9udXRXaWR0aDogMjAsXG4gICAgY2hhcnRQYWRkaW5nOiAxMCxcbiAgICBsYWJlbE9mZnNldDogNTAsXG4gICAgd2lkdGg6ICcyMjBweCcsXG4gICAgaGVpZ2h0OiAnMjIwcHgnXG4gIH0sXG4gIGRvdWdobnV0UmVzcG9uc2l2ZU9wdGlvbnM6IFtcbiAgICBbJ3NjcmVlbiBhbmQgKG1heC13aWR0aDogNDgwcHgpJywge1xuICAgICAgd2lkdGg6ICcxNzBweCcsXG4gICAgICBoZWlnaHQ6ICcxNzBweCdcbiAgICB9XVxuICBdXG59O1xuXG52YXIgJHBpZUNoYXJ0LCBuZWVkc1NsaWRlciwgZXhwZW5zZXNTbGlkZXIsIHNhdmluZ3NTbGlkZXI7XG5cbi8qKlxuICogRE9NIEZVTkNUSU9OU1xuICovXG5cbnZhciBhbmltYXRlRG91Z2hudXQgPSBmdW5jdGlvbigkcGllQ2hhcnQpIHtcbiAgJHBpZUNoYXJ0Lm9uKCdkcmF3JywgZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhLnR5cGUgPT09ICdzbGljZScpIHtcbiAgICAgIHZhciBwYXRoTGVuZ3RoID0gZGF0YS5lbGVtZW50Ll9ub2RlLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICBkYXRhLmVsZW1lbnQuYXR0cih7XG4gICAgICAgICdzdHJva2UtZGFzaGFycmF5JzogcGF0aExlbmd0aCArICdweCAnICsgcGF0aExlbmd0aCArICdweCdcbiAgICAgIH0pO1xuICAgICAgdmFyIGFuaW1hdGlvbkRlZmluaXRpb24gPSB7XG4gICAgICAgICdzdHJva2UtZGFzaG9mZnNldCc6IHtcbiAgICAgICAgICBpZDogJ2FuaW0nICsgZGF0YS5pbmRleCxcbiAgICAgICAgICBkdXI6IDEwMDAsXG4gICAgICAgICAgZnJvbTogLXBhdGhMZW5ndGggKyAncHgnLFxuICAgICAgICAgIHRvOiAnMHB4JyxcbiAgICAgICAgICBlYXNpbmc6IENoYXJ0aXN0LlN2Zy5FYXNpbmcuZWFzZU91dFF1aW50LFxuICAgICAgICAgIGZpbGw6ICdmcmVlemUnXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChkYXRhLmluZGV4ICE9PSAwKSB7XG4gICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb25bJ3N0cm9rZS1kYXNob2Zmc2V0J10uYmVnaW4gPSAnYW5pbScgKyAoZGF0YS5pbmRleCAtIDEpICsgJy5lbmQnO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmVsZW1lbnQuYXR0cih7XG4gICAgICAgICdzdHJva2UtZGFzaG9mZnNldCc6IC1wYXRoTGVuZ3RoICsgJ3B4J1xuICAgICAgfSk7XG4gICAgICBkYXRhLmVsZW1lbnQuYW5pbWF0ZShhbmltYXRpb25EZWZpbml0aW9uLCBmYWxzZSk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBjcmVhdGVEb3VnaG51dFRvb2x0aXAgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRjaGFydCA9ICQoJy4nICsgY29uZmlnTWFwLmRvdWdobnV0Q2xhc3MpLFxuICAgICR0b29sVGlwID0gJGNoYXJ0XG4gICAgLmFwcGVuZCgnPGRpdiBjbGFzcz1cInBpZS10b29sdGlwXCI+PC9kaXY+JylcbiAgICAuZmluZCgnLnBpZS10b29sdGlwJylcbiAgICAuaGlkZSgpLFxuICAgIG1vbmV5Rm9ybWF0ID0gd051bWIoe1xuICAgICAgdGhvdXNhbmQ6ICcuJyxcbiAgICAgIHByZWZpeDogJyQgJ1xuICAgIH0pO1xuXG4gIHZhciBpc1Rvb2x0aXBTaG93biA9IGZhbHNlO1xuXG4gICRjaGFydC5vbignbW91c2VlbnRlcicsICcuY3Qtc2xpY2UtZG9udXQnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgJHNsaWNlID0gJCh0aGlzKSxcbiAgICAgIHZhbHVlID0gJHNsaWNlLmF0dHIoJ2N0OnZhbHVlJyksXG4gICAgICBzZXJpZXNOYW1lID0gJHNsaWNlLnBhcmVudCgpLmF0dHIoJ2N0OnNlcmllcy1uYW1lJyk7XG4gICAgJHRvb2xUaXAuaHRtbCgnPHN0cm9uZz4nICsgc2VyaWVzTmFtZSArICc8L3N0cm9uZz46ICcgKyB2YWx1ZSArICclLyAnICtcbiAgICAgIG1vbmV5Rm9ybWF0LnRvKE51bWJlcih2YWx1ZSkgLyAxMDAgKiBjb25maWdNYXAuYWJvdXRJbmNvbWUpKS5zaG93KCk7XG4gIH0pO1xuXG4gIC8vRm9yIG1vYmlsZXNcbiAgJGNoYXJ0Lm9uKCdjbGljaycsICcuY3Qtc2xpY2UtZG9udXQnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWlzVG9vbHRpcFNob3duKSB7XG4gICAgICB2YXIgJHNsaWNlID0gJCh0aGlzKSxcbiAgICAgICAgdmFsdWUgPSAkc2xpY2UuYXR0cignY3Q6dmFsdWUnKSxcbiAgICAgICAgc2VyaWVzTmFtZSA9ICRzbGljZS5wYXJlbnQoKS5hdHRyKCdjdDpzZXJpZXMtbmFtZScpO1xuICAgICAgJHRvb2xUaXAuaHRtbCgnPHN0cm9uZz4nICsgc2VyaWVzTmFtZSArICc8L3N0cm9uZz46ICcgKyB2YWx1ZSArICclLyAnICtcbiAgICAgICAgbW9uZXlGb3JtYXQudG8oTnVtYmVyKHZhbHVlKSAvIDEwMCAqIGNvbmZpZ01hcC5hYm91dEluY29tZSkpLnNob3coKTtcbiAgICAgIGlzVG9vbHRpcFNob3duID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHRvb2xUaXAuaGlkZSgpO1xuICAgICAgaXNUb29sdGlwU2hvd24gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gICRjaGFydC5vbignbW91c2VsZWF2ZScsICcuY3Qtc2xpY2UtZG9udXQnLCBmdW5jdGlvbigpIHtcbiAgICAkdG9vbFRpcC5oaWRlKCk7XG4gIH0pO1xuXG4gICRjaGFydC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAkdG9vbFRpcC5jc3Moe1xuICAgICAgbGVmdDogKGV2ZW50Lm9mZnNldFggfHwgZXZlbnQub3JpZ2luYWxFdmVudC5sYXllclgpIC0gJHRvb2xUaXAud2lkdGgoKSAvIDIgLSAxMCxcbiAgICAgIHRvcDogKGV2ZW50Lm9mZnNldFkgfHwgZXZlbnQub3JpZ2luYWxFdmVudC5sYXllclkpIC0gJHRvb2xUaXAuaGVpZ2h0KCkgLSAzMFxuICAgIH0pO1xuICB9KTtcbn07XG5cbnZhciBjcmVhdGVDaGFydCA9IGZ1bmN0aW9uKGh0bWxOb2RlKSB7XG4gIGNvbmZpZ01hcC5kb3VnaG51dERhdGEuc2VyaWVzWzJdID0ge1xuICAgIHZhbHVlOiAxMDAgLSBjb25maWdNYXAuZG91Z2hudXREYXRhLnNlcmllc1swXS52YWx1ZSAtIGNvbmZpZ01hcC5kb3VnaG51dERhdGEuc2VyaWVzWzFdLnZhbHVlLFxuICAgIG5hbWU6ICdTYXZpbmdzJ1xuICB9O1xuXG4gICRwaWVDaGFydCA9IG5ldyBDaGFydGlzdC5QaWUoaHRtbE5vZGUsXG4gICAgY29uZmlnTWFwLmRvdWdobnV0RGF0YSxcbiAgICBjb25maWdNYXAuZG91Z2hudXRPcHRpb25zLFxuICAgIGNvbmZpZ01hcC5kb3VnaG51dFJlc3BvbnNpdmVPcHRpb25zKTtcblxuICBhbmltYXRlRG91Z2hudXQoJHBpZUNoYXJ0KTtcbiAgY3JlYXRlRG91Z2hudXRUb29sdGlwKCk7XG5cbn07XG5cbi8qKlxuICogRVZFTlQgSEFORExFUlNcbiAqL1xuXG52YXIgc2hvd1NsaWRlclRvb2x0aXAgPSBmdW5jdGlvbihzbGlkZXIsIHZhbHVlcykge1xuICB2YXIgdG9vbHRpcCA9IHNsaWRlci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdO1xuICBpZiAoc2xpZGVyLmNsYXNzTGlzdC5jb250YWlucyhjb25maWdNYXAuc2F2aW5nc1NsaWRlcikpIHtcbiAgICB0b29sdGlwLmlubmVySFRNTCA9ICckJyArIHZhbHVlc1swXTtcbiAgfSBlbHNlIHtcbiAgICB0b29sdGlwLmlubmVySFRNTCA9IHZhbHVlc1swXSArICclJztcbiAgfVxufTtcblxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgdmlldyBvZiB0aGUgRG91Z2hudXQgd2hlbiBzbGlkZXJzIHZhbHVlIGNoYW5nZVxuICogQHBhcmFtIHtzdHJpbmd9IHNsaWRlciBUaGUgbmFtZSBvZiB0aGUgc2xpZGVyIHdoaWNoIGNoYW5nZWRcbiAqL1xudmFyIHVwZGF0ZURPTURvdWdobnV0ID0gZnVuY3Rpb24oc2xpZGVyLCB2YWx1ZXMpIHtcbiAgaWYgKHNsaWRlciA9PT0gJ25lZWRzU2xpZGVyJykge1xuICAgIGNvbmZpZ01hcC5kb3VnaG51dERhdGEuc2VyaWVzWzBdLnZhbHVlID0gTnVtYmVyKHZhbHVlc1swXSk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnTWFwLmRvdWdobnV0RGF0YS5zZXJpZXNbMV0udmFsdWUgPSBOdW1iZXIodmFsdWVzWzBdKTtcbiAgfVxuICBjb25maWdNYXAuZG91Z2hudXREYXRhLnNlcmllc1syXS52YWx1ZSA9IDEwMCAtIGNvbmZpZ01hcC5kb3VnaG51dERhdGEuc2VyaWVzWzBdLnZhbHVlIC0gY29uZmlnTWFwLmRvdWdobnV0RGF0YS5zZXJpZXNbMV0udmFsdWU7XG4gICRwaWVDaGFydC51cGRhdGUoKTtcbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbnZhciBiaW5kID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgaWYgKGV2ZW50ID09PSAnYmFzaWNOZWVkc0NoYW5nZWQnKSB7XG4gICAgbmVlZHNTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB1cGRhdGVET01Eb3VnaG51dCgnbmVlZHNTbGlkZXInLCB2YWx1ZXMpO1xuICAgICAgaGFuZGxlcihjb25maWdNYXAuZG91Z2hudXREYXRhLnNlcmllc1swXS52YWx1ZSwgY29uZmlnTWFwLmRvdWdobnV0RGF0YS5zZXJpZXNbMl0udmFsdWUpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGV2ZW50ID09PSAnZXhwZW5zZXNDaGFuZ2VkJykge1xuICAgIGV4cGVuc2VzU2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdXBkYXRlRE9NRG91Z2hudXQoJ2V4cGVuc2VzU2xpZGVyJywgdmFsdWVzKTtcbiAgICAgIGhhbmRsZXIoY29uZmlnTWFwLmRvdWdobnV0RGF0YS5zZXJpZXNbMV0udmFsdWUsIGNvbmZpZ01hcC5kb3VnaG51dERhdGEuc2VyaWVzWzJdLnZhbHVlKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChldmVudCA9PT0gJ3NhdmluZ3NDaGFuZ2VkJykge1xuICAgIHNhdmluZ3NTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0ucmVwbGFjZSgnLicsICcnKSkpO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgY29uZmlnTW9kdWxlID0gZnVuY3Rpb24oaW5wdXRNYXApIHtcbiAgd2luZG93LnNldENvbmZpZ01hcChpbnB1dE1hcCwgY29uZmlnTWFwKTtcbn07XG5cbnZhciBpbml0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIG5lZWRzU2xpZGVyID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLm5lZWRzU2xpZGVyKVswXTtcbiAgZXhwZW5zZXNTbGlkZXIgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAuZXhwZW5zZXNTbGlkZXIpWzBdO1xuICBzYXZpbmdzU2xpZGVyID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLnNhdmluZ3NTbGlkZXIpWzBdO1xuXG4gIC8vQ3JlYXRlIHNsaWRlcnNcbiAgd2luZG93LmNyZWF0ZVNsaWRlcihuZWVkc1NsaWRlciwgY29uZmlnTWFwLm5lZWRzT3B0aW9ucyk7XG4gIG5lZWRzU2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHNob3dTbGlkZXJUb29sdGlwKG5lZWRzU2xpZGVyLCB2YWx1ZXMpO1xuICB9KTtcblxuICB3aW5kb3cuY3JlYXRlU2xpZGVyKGV4cGVuc2VzU2xpZGVyLCBjb25maWdNYXAuZXhwZW5zZXNPcHRpb25zKTtcbiAgZXhwZW5zZXNTbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgc2hvd1NsaWRlclRvb2x0aXAoZXhwZW5zZXNTbGlkZXIsIHZhbHVlcyk7XG4gIH0pO1xuXG4gIHdpbmRvdy5jcmVhdGVTbGlkZXIoc2F2aW5nc1NsaWRlciwgY29uZmlnTWFwLnNhdmluZ3NPcHRpb25zKTtcbiAgc2F2aW5nc1NsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICBzaG93U2xpZGVyVG9vbHRpcChzYXZpbmdzU2xpZGVyLCB2YWx1ZXMpO1xuICB9KTtcblxuICAvL0luaXQgRG91Z2hudXQgQ2hhcnRcbiAgdmFyIGRvdWdobnV0SHRtbCA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZ01hcC5kb3VnaG51dENsYXNzKVswXTtcbiAgY3JlYXRlQ2hhcnQoZG91Z2hudXRIdG1sKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICBjb25maWdNb2R1bGU6IGNvbmZpZ01vZHVsZSxcbiAgaW5pdDogaW5pdFxufTtcbiIsIi8qKlxuICogU2NyZWVuICM1IC0gUHlyYW1pZCBtb2R1bGVcbiAqIEBtb2R1bGUgNS1QeXJhbWlkXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAgc2F2aW5nc0lkOiAnI3B5cmFtaWQtc2F2aW5ncycsXG4gIGJhc2ljSWQ6ICcjcHlyYW1pZC1iYXNpYycsXG4gIGRpc2NyZXRpb3Rpb25hcnlJZDogJyNweXJhbWlkLWRpc2NyZXRpb25hcnknLFxuICBpbmNvbWVJZDogJyNweXJhbWlkLWluY29tZScsXG4gIGJhc2ljTmVlZHM6IDAsXG4gIGFubnVhbFNhdmluZ3M6IDAsXG4gIGRpc2NyZXRpb25hcnlFeHBlbnNlczogMCxcbiAgYWJvdXRJbmNvbWU6IDBcbn07XG5cbnZhciBzYXZpbmdzVGV4dCwgYmFzaWNUZXh0LCBkaXNjcmV0aW9uYXJ5VGV4dCwgaW5jb21lVGV4dDtcblxuLyoqXG4gKiBET00gRlVOQ1RJT05TXG4gKi9cblxudmFyIHVwZGF0ZUxhYmVscyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW9uZXlGb3JtYXQgPSB3TnVtYih7XG4gICAgdGhvdXNhbmQ6ICcsJyxcbiAgICBwcmVmaXg6ICckICdcbiAgfSk7XG5cbiAgc2F2aW5nc1RleHQudGV4dENvbnRlbnQgPSAnICcgKyBtb25leUZvcm1hdC50byhjb25maWdNYXAuYW5udWFsU2F2aW5ncykgKyAnL3lyJztcbiAgYmFzaWNUZXh0LnRleHRDb250ZW50ID0gbW9uZXlGb3JtYXQudG8oY29uZmlnTWFwLmJhc2ljTmVlZHMpICsgJy95cic7XG4gIGRpc2NyZXRpb25hcnlUZXh0LnRleHRDb250ZW50ID0gbW9uZXlGb3JtYXQudG8oY29uZmlnTWFwLmRpc2NyZXRpb25hcnlFeHBlbnNlcykgKyAnL3lyJztcbiAgaW5jb21lVGV4dC50ZXh0Q29udGVudCA9IG1vbmV5Rm9ybWF0LnRvKGNvbmZpZ01hcC5hYm91dEluY29tZSkgKyAnL3lyJztcbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbnZhciBjb25maWdNb2R1bGUgPSBmdW5jdGlvbihpbnB1dE1hcCkge1xuICB3aW5kb3cuc2V0Q29uZmlnTWFwKGlucHV0TWFwLCBjb25maWdNYXApO1xufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc2F2aW5nc1RleHQgPSBjb250YWluZXIucXVlcnlTZWxlY3Rvcihjb25maWdNYXAuc2F2aW5nc0lkKTtcbiAgYmFzaWNUZXh0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoY29uZmlnTWFwLmJhc2ljSWQpO1xuICBkaXNjcmV0aW9uYXJ5VGV4dCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGNvbmZpZ01hcC5kaXNjcmV0aW90aW9uYXJ5SWQpO1xuICBpbmNvbWVUZXh0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoY29uZmlnTWFwLmluY29tZUlkKTtcblxuICB1cGRhdGVMYWJlbHMoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb25maWdNb2R1bGU6IGNvbmZpZ01vZHVsZSxcbiAgaW5pdDogaW5pdCxcbiAgdXBkYXRlTGFiZWxzOiB1cGRhdGVMYWJlbHNcbn07XG4iLCIvKipcbiAqIFNjcmVlbiAjNiAtIFNjZW5hcmlvcyBtb2R1bGVcbiAqIEBtb2R1bGUgNi1TY2VuYXJpb3NcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB3TnVtYiA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3TnVtYiddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd051bWInXSA6IG51bGwpO1xudmFyIENoYXJ0aXN0ID0gcmVxdWlyZSgnY2hhcnRpc3QnKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAgc2F2aW5nc1JhdGU6IDMwLFxuICBpbmNvbWU6IDYwMDAwLFxuICBhbm51YWxTYXZpbmdzOiAxODAwMCxcbiAgYWJvdXRBZ2U6IDM1LFxuICAvL2NvbXBvdW5kIGludGVyZXN0XG4gIGN1cnJlbnRTYXZpbmdzOiAxMDAwLFxuICBhbm51YWxJbnRlcmVzdFJhdGU6IDAuMDYsXG4gIGludmVzdG1lbnRUZXJtWXJzOiAzMCxcbiAgLy9BZHZhbmNlZCBzZXR0aW5nc1xuICBpbnZlc3RtZW50OiAxMDAsXG4gIHJldGlyZW1lbnRBZ2U6IDY1LFxuICAvL1NsaWRlcnMgb3B0aW9uc1xuICBzYXZpbmdSYXRlU2xpZGVyOiAnb3B0aW9uX19zbGlkZXItLXNhdmluZycsXG4gIGluY29tZVJhdGVTbGlkZXI6ICdvcHRpb25fX3NsaWRlci0taW5jb21lJyxcbiAgaW52ZXN0bWVudFJhdGVTbGlkZXI6ICdvcHRpb25fX3NsaWRlci0taW52ZXN0bWVudCcsXG4gIHJldGlyZW1lbnRTbGlkZXI6ICdvcHRpb25fX3NsaWRlci0tcmV0aXJlbWVudCcsXG4gIHNhdmluZ1JhdGVPcHRpb25zOiB7XG4gICAgc3RhcnQ6IDMwLFxuICAgIHN0ZXA6IDEsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxLFxuICAgICAgJ21heCc6IDEwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH0sXG4gIGluY29tZU9wdGlvbnM6IHtcbiAgICBzdGFydDogNjAwMDAsXG4gICAgc3RlcDogMTAwMCxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDE4MDAwLFxuICAgICAgJ21heCc6IDIwMDAwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMSxcbiAgICAgIHRob3VzYW5kOiAnLidcbiAgICB9KVxuICB9LFxuICBpbnZlc3RtZW50T3B0aW9uczoge1xuICAgIHN0YXJ0OiAxMDAsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDEsXG4gICAgICAnbWF4JzogMTAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfSxcbiAgcmV0aXJlbWVudE9wdGlvbnM6IHtcbiAgICBzdGFydDogNjUsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDY1LFxuICAgICAgJ21heCc6IDcwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfSxcbiAgLy9MaW5lIGNoYXJ0IG9wdGlvbnNcbiAgY2hhcnRDbGFzczogJy5zY2VuYXJpb19fY2hhcnQnLFxuICBjaGFydERhdGE6IHtcbiAgICBsYWJlbHM6IFsxOCwgMjUsIDM1LCA0NSwgNTUsIDY1XSxcbiAgICBzZXJpZXM6IFtcbiAgICAgIFszNTAwMCwgMjQ1MDAwLCA1OTUwMDAsIDk0NTAwMCwgMTI5NTAwMCwgMTY0NTAwMF1cbiAgICBdXG4gIH0sXG4gIGNoYXJ0T3B0aW9uczoge1xuICAgIGF4aXNZOiB7XG4gICAgICB0eXBlOiBDaGFydGlzdC5GaXhlZFNjYWxlQXhpcyxcbiAgICAgIGhpZ2g6IDIwMDAwMDAsXG4gICAgICB0aWNrczogWzAsIDI1MDAwMCwgNTAwMDAwLCA3NTAwMDAsIDEwMDAwMDAsIDEyNTAwMDAsIDE1MDAwMDAsIDE3NTAwMDAsIDIwMDAwMDBdXG4gICAgfSxcbiAgICBzaG93QXJlYTogdHJ1ZSxcbiAgICB3aWR0aDogJzQwMHB4JyxcbiAgICBoZWlnaHQ6ICcyNTBweCcsXG4gICAgcGx1Z2luczogW1xuXG4gICAgXVxuICB9LFxuICAvL3NhdmluZ3MgYXQgcmV0aXJlbWVudCBhZ2VcbiAgcmV0aXJlbWVudFNhdmluZ3NIVE1MOiAnc2F2aW5nc19fYW1vdW50J1xufTtcblxudmFyIHNhdmluZ1JhdGVTbGlkZXIsIGluY29tZVJhdGVTbGlkZXIsIGludmVzdG1lbnRSYXRlU2xpZGVyLCByZXRpcmVtZW50U2xpZGVyLFxuICBpbnZlc3RtZW50U3R5bGVCdXR0b25zLFxuICBsaW5lQ2hhcnQsXG4gIHJldGlyZW1lbnRTYXZpbmdzO1xudmFyIG1vbmV5Rm9ybWF0ID0gd051bWIoe1xuICB0aG91c2FuZDogJywnXG59KTtcblxuLyoqXG4gKiBET00gRlVOQ1RJT05TXG4gKi9cblxudmFyIGNyZWF0ZVNsaWRlcnMgPSBmdW5jdGlvbigpIHtcbiAgd2luZG93LmNyZWF0ZVNsaWRlcihzYXZpbmdSYXRlU2xpZGVyLCBjb25maWdNYXAuc2F2aW5nUmF0ZU9wdGlvbnMpO1xuICBzYXZpbmdSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHNsaWRlckV2ZW50SGFuZGxlcihzYXZpbmdSYXRlU2xpZGVyLCB2YWx1ZXMsICclJyk7XG4gIH0pO1xuXG4gIHdpbmRvdy5jcmVhdGVTbGlkZXIoaW5jb21lUmF0ZVNsaWRlciwgY29uZmlnTWFwLmluY29tZU9wdGlvbnMpO1xuICBpbmNvbWVSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHNsaWRlckV2ZW50SGFuZGxlcihpbmNvbWVSYXRlU2xpZGVyLCB2YWx1ZXMsICckJyk7XG4gIH0pO1xuXG4gIHdpbmRvdy5jcmVhdGVTbGlkZXIoaW52ZXN0bWVudFJhdGVTbGlkZXIsIGNvbmZpZ01hcC5pbnZlc3RtZW50T3B0aW9ucyk7XG4gIGludmVzdG1lbnRSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHNsaWRlckV2ZW50SGFuZGxlcihpbnZlc3RtZW50UmF0ZVNsaWRlciwgdmFsdWVzLCAnJScpO1xuICB9KTtcblxuICB3aW5kb3cuY3JlYXRlU2xpZGVyKHJldGlyZW1lbnRTbGlkZXIsIGNvbmZpZ01hcC5yZXRpcmVtZW50T3B0aW9ucyk7XG4gIHJldGlyZW1lbnRTbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgc2xpZGVyRXZlbnRIYW5kbGVyKHJldGlyZW1lbnRTbGlkZXIsIHZhbHVlcyk7XG4gIH0pO1xufTtcblxudmFyIGNyZWF0ZUxpbmVDaGFydCA9IGZ1bmN0aW9uKGh0bWxOb2RlLCBkYXRhLCBvcHRpb25zKSB7XG4gIGxpbmVDaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKGh0bWxOb2RlLCBkYXRhLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRVZFTlQgSEFORExFUlNcbiAqL1xuXG52YXIgaW52ZXN0bWVudFN0eWxlQnV0dG9uc0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgaW52ZXN0bWVudFN0eWxlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuXG4gIHN3aXRjaCAoaW52ZXN0bWVudFN0eWxlKSB7XG4gIGNhc2UgJ3NhZmUnOlxuICAgIGNvbmZpZ01hcC5hbm51YWxJbnRlcmVzdFJhdGUgPSAwLjAyO1xuICAgIGJyZWFrO1xuICBjYXNlICdtb2RlcmF0ZSc6XG4gICAgY29uZmlnTWFwLmFubnVhbEludGVyZXN0UmF0ZSA9IDAuMDY7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ3Jpc2t5JzpcbiAgICBjb25maWdNYXAuYW5udWFsSW50ZXJlc3RSYXRlID0gMC4xNTtcbiAgICBicmVhaztcbiAgfVxuXG4gIHVwZGF0ZUxpbmVDaGFydCgpO1xufTtcblxudmFyIHNsaWRlckV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKHNsaWRlciwgdmFsdWVzLCBmb3JtYXQpIHtcbiAgdmFyIHRvb2x0aXAgPSBzbGlkZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgaWYgKGZvcm1hdCA9PT0gJyUnKSB7XG4gICAgdG9vbHRpcC5pbm5lckhUTUwgPSB2YWx1ZXNbMF0gKyAnJSc7XG4gIH0gZWxzZSBpZiAoZm9ybWF0ID09PSAnJCcpIHtcbiAgICB0b29sdGlwLmlubmVySFRNTCA9ICckJyArIHZhbHVlc1swXTtcbiAgfSBlbHNlIHtcbiAgICB0b29sdGlwLmlubmVySFRNTCA9IHZhbHVlc1swXTtcbiAgfVxufTtcblxudmFyIGJpbmRTbGlkZXJzVG9DaGFydCA9IGZ1bmN0aW9uKCkge1xuICBzYXZpbmdSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIGNvbmZpZ01hcC5zYXZpbmdzUmF0ZSA9IE51bWJlcih2YWx1ZXNbMF0pO1xuICAgIHVwZGF0ZUxpbmVDaGFydCgpO1xuICB9KTtcbiAgaW5jb21lUmF0ZVNsaWRlci5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICBjb25maWdNYXAuaW5jb21lID0gTnVtYmVyKHZhbHVlc1swXS5yZXBsYWNlKCcuJywgJycpKTtcbiAgICB1cGRhdGVMaW5lQ2hhcnQoKTtcbiAgfSk7XG5cbiAgLy9BZHZhbmNlZCBvcHRpb25zXG4gIGludmVzdG1lbnRSYXRlU2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIGNvbmZpZ01hcC5pbnZlc3RtZW50ID0gTnVtYmVyKHZhbHVlc1swXSk7XG4gICAgdXBkYXRlTGluZUNoYXJ0KCk7XG4gIH0pO1xuICByZXRpcmVtZW50U2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIGNvbmZpZ01hcC5yZXRpcmVtZW50QWdlID0gTnVtYmVyKHZhbHVlc1swXSk7XG4gICAgdXBkYXRlTGluZUNoYXJ0KCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDT01QT1VORCBJTlRFUkVTVCBGVU5DVElPTlNcbiAqL1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIG1vbmV5XG4gKiBAcGFyYW0gIHtudW1iZXJ9IGludGVyZXN0UmF0ZSAlIG9mIGludGVyZXN0IChmcm9tIDAgdG8gMSlcbiAqIEBwYXJhbSAge251bWJlcn0gdGVybSBZZWFyc1xuICogQHBhcmFtICB7bnVtYmVyfSBhbXRJbnZlc3RlZCBJbml0aWFsIGludmVzdG1lbnRcbiAqIEBwYXJhbSAge251bWJlcn0gY29udHJpYkFtdCBNb250aGx5IGNvbnRyaWJ1dGlvblxuICogQG1vZHVsZS5leHBvcnRzID0ge251bWJlcn1cbiAqL1xudmFyIGdldEFjY3VtdWxhdGVkVmFsdWUgPSBmdW5jdGlvbihpbnRlcmVzdFJhdGUsIHRlcm0sIGFtdEludmVzdGVkLCBjb250cmliQW10KSB7XG4gIHZhciBhcHAgPSBbXTtcbiAgYXBwWzBdID0gYW10SW52ZXN0ZWQ7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBtb250aGx5VGVybSA9IHRlcm0gKiAxMjtcbiAgdmFyIG1vbnRobHlDb250cmliQW10ID0gY29udHJpYkFtdCAvIDEyO1xuXG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IG1vbnRobHlUZXJtOyBpKyspIHtcbiAgICB2YXIgYXBwcmVjaWF0aW9uID0gKGludGVyZXN0UmF0ZSAvIDEyKSAqIChhcHBbaSAtIDFdKTtcbiAgICBhcHBbaV0gPSBhcHByZWNpYXRpb24gKyBhcHBbaSAtIDFdICsgbW9udGhseUNvbnRyaWJBbXQ7XG4gICAgdG90YWwgPSBhcHBbaSAtIDFdO1xuICB9XG4gIGFwcCA9IG51bGw7XG4gIHJldHVybiBNYXRoLnJvdW5kKHRvdGFsKTtcbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSB2YWx1ZXMgZm9yIHggYXhpc1xuICogQHBhcmFtICB7TnVtYmVyfSBmaXJzdFZhbHVlIEZpcnN0IHZhbHVlIG9mIHRoZSBheGlzXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGxhc3RWYWx1ZSBMYXN0IHZhbHVlIG9mIHRoZSBheGlzXG4gKiBAbW9kdWxlLmV4cG9ydHMgPSB7QXJyYXl9XG4gKi9cbnZhciBnZXRBYnNjaXNzYXMgPSBmdW5jdGlvbihmaXJzdFZhbHVlLCBsYXN0VmFsdWUpIHtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICB2YWx1ZXNbMF0gPSBmaXJzdFZhbHVlO1xuICB2YWx1ZXNbNV0gPSBsYXN0VmFsdWU7XG5cbiAgdmFyIGRpZmZlcmVuY2UgPSAobGFzdFZhbHVlIC0gZmlyc3RWYWx1ZSkgLyA1O1xuICBmb3IgKHZhciBpID0gMTsgaSA8IDU7IGkrKykge1xuICAgIHZhbHVlc1tpXSA9IE1hdGgucm91bmQoZmlyc3RWYWx1ZSArIChkaWZmZXJlbmNlICogaSkpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbnZhciB1cGRhdGVMaW5lQ2hhcnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHhWYWx1ZXMgPSBnZXRBYnNjaXNzYXMoY29uZmlnTWFwLmFib3V0QWdlLCBjb25maWdNYXAucmV0aXJlbWVudEFnZSk7XG4gIHZhciBpID0gMDtcblxuICBjb25maWdNYXAuY2hhcnREYXRhLmxhYmVscyA9IHhWYWx1ZXM7XG4gIGNvbmZpZ01hcC5hbm51YWxTYXZpbmdzID0gKGNvbmZpZ01hcC5zYXZpbmdzUmF0ZSAvIDEwMCkgKiBjb25maWdNYXAuaW5jb21lICogKGNvbmZpZ01hcC5pbnZlc3RtZW50IC8gMTAwKTtcblxuICBjb25maWdNYXAuY2hhcnREYXRhLnNlcmllc1swXVswXSA9IGNvbmZpZ01hcC5jdXJyZW50U2F2aW5ncztcbiAgZm9yIChpID0gMTsgaSA8IDY7IGkgKz0gMSkge1xuICAgIGNvbmZpZ01hcC5jaGFydERhdGEuc2VyaWVzWzBdW2ldID1cbiAgICAgIGdldEFjY3VtdWxhdGVkVmFsdWUoY29uZmlnTWFwLmFubnVhbEludGVyZXN0UmF0ZSwgeFZhbHVlc1tpXSAtIHhWYWx1ZXNbMF0sIGNvbmZpZ01hcC5jdXJyZW50U2F2aW5ncywgY29uZmlnTWFwLmFubnVhbFNhdmluZ3MpO1xuICB9XG5cbiAgY29uZmlnTWFwLmNoYXJ0T3B0aW9ucy5heGlzWS50aWNrc1swXSA9IGNvbmZpZ01hcC5jdXJyZW50U2F2aW5ncztcblxuICBsaW5lQ2hhcnQudXBkYXRlKGNvbmZpZ01hcC5jaGFydERhdGEsIGNvbmZpZ01hcC5jaGFydE9wdGlvbnMpO1xuICByZXRpcmVtZW50U2F2aW5ncy5jaGlsZE5vZGVzWzFdLnRleHRDb250ZW50ID0gbW9uZXlGb3JtYXQudG8oY29uZmlnTWFwLmNoYXJ0RGF0YS5zZXJpZXNbMF1bNV0pO1xufTtcblxudmFyIGNvbmZpZ01vZHVsZSA9IGZ1bmN0aW9uKGlucHV0TWFwKSB7XG4gIHdpbmRvdy5zZXRDb25maWdNYXAoaW5wdXRNYXAsIGNvbmZpZ01hcCk7XG59O1xuXG52YXIgc2V0U2xpZGVyID0gZnVuY3Rpb24oc2xpZGVyLCB2YWx1ZSkge1xuICBpZiAoc2xpZGVyID09PSAnaW5jb21lJykge1xuICAgIGluY29tZVJhdGVTbGlkZXIubm9VaVNsaWRlci5zZXQodmFsdWUpO1xuICB9IGVsc2UgaWYgKHNsaWRlciA9PT0gJ3NhdmluZ3NSYXRlJykge1xuICAgIHNhdmluZ1JhdGVTbGlkZXIubm9VaVNsaWRlci5zZXQodmFsdWUpO1xuICB9XG59O1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBzYXZpbmdSYXRlU2xpZGVyID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLnNhdmluZ1JhdGVTbGlkZXIpWzBdO1xuICBpbmNvbWVSYXRlU2xpZGVyID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLmluY29tZVJhdGVTbGlkZXIpWzBdO1xuICBpbnZlc3RtZW50UmF0ZVNsaWRlciA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZ01hcC5pbnZlc3RtZW50UmF0ZVNsaWRlcilbMF07XG4gIHJldGlyZW1lbnRTbGlkZXIgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAucmV0aXJlbWVudFNsaWRlcilbMF07XG4gIHJldGlyZW1lbnRTYXZpbmdzID0gY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLnJldGlyZW1lbnRTYXZpbmdzSFRNTClbMF07XG5cbiAgaW52ZXN0bWVudFN0eWxlQnV0dG9ucyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwiaW52ZXN0bWVudC1zdHlsZVwiXScpO1xuICBpbnZlc3RtZW50U3R5bGVCdXR0b25zLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaW52ZXN0bWVudFN0eWxlQnV0dG9uc0hhbmRsZXIpO1xuICB9KTtcblxuICBjcmVhdGVTbGlkZXJzKCk7XG5cbiAgLy9MaW5lIENoYXJ0XG4gIGNyZWF0ZUxpbmVDaGFydChjb25maWdNYXAuY2hhcnRDbGFzcywgY29uZmlnTWFwLmNoYXJ0RGF0YSwgY29uZmlnTWFwLmNoYXJ0T3B0aW9ucyk7XG4gIHVwZGF0ZUxpbmVDaGFydCgpO1xuICBiaW5kU2xpZGVyc1RvQ2hhcnQoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cGRhdGVMaW5lQ2hhcnQ6IHVwZGF0ZUxpbmVDaGFydCxcbiAgY29uZmlnTW9kdWxlOiBjb25maWdNb2R1bGUsXG4gIGluaXQ6IGluaXQsXG4gIGdldEFic2Npc3NhczogZ2V0QWJzY2lzc2FzLFxuICBzZXRTbGlkZXI6IHNldFNsaWRlclxufTtcbiIsIi8qKlxuICogU2NyZWVuICM3IC0gR29hbCBtb2R1bGVcbiAqIEBtb2R1bGUgNy1Hb2FsXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgZHJhZ3VsYSA9IHJlcXVpcmUoJ2RyYWd1bGEnKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAgZ29hbHNXcmFwcGVyOiAnZ29hbHMnLFxuICBwaWNrZWRHb2Fsc1dyYXBwZXI6ICdwaWNrZWQtZ29hbHMnLFxuICAkdG9vbHRpcHM6ICcuZ29hbF9fZGV0YWlscyA+IHNwYW4nLFxuICB0b2dnbGVCdXR0b25zOiAndG9nZ2xlLWdvYWwnLFxuICBwaWNrZWRHb2FsczogJ3BpY2tlZC1nb2FscycsXG4gIGRhdGVwaWNrZXI6ICcuZ29hbF9fZGF0ZV9fcGlja2VyJ1xufTtcblxudmFyIGNvbnRhaW5lciwgdG9nZ2xlQnV0dG9ucztcblxudmFyIGdvYWxUZW1wbGF0ZSA9XG4gICc8ZGl2IGNsYXNzPVwiZ29hbCBnb2FsLS17e2lkfX0ge3twaWNrZWR9fVwiPicgK1xuICAnPGRpdiBjbGFzcz1cImdvYWxfX2RldGFpbHNcIj4nICtcbiAgJzxwIGNsYXNzPVwiZ29hbF9fdGl0bGVcIj57e3RpdGxlfX08L3A+JyArXG4gICc8c3BhbiBjbGFzcz1cImdvYWxfX2RhdGVcIiBkYXRhLXBsYWNlbWVudD1cImJvdHRvbVwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRXhwZWN0ZWQgYWNoaWV2ZW1lbnQgZGF0ZSBiYXNlZCBvbiB5b3VyIGRhdGFcIj4nICtcbiAgJzxpIGNsYXNzPVwiem1kaSB6bWRpLWNhbGVuZGFyLWFsdFwiPjwvaT4nICtcbiAgJzxzcGFuPnt7ZGF0ZX19PC9zcGFuPicgK1xuICAnPC9zcGFuPicgK1xuICAnPHNwYW4gY2xhc3M9XCJnb2FsX19zdWNjZXNzXCIgZGF0YS1wbGFjZW1lbnQ9XCJib3R0b21cIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkV4cGVjdGVkIGFjaGlldmVtZW50IHByb2JhYmlsaXR5IGJhc2VkIG9uIHlvdXIgZGF0YVwiPicgK1xuICAnPGkgY2xhc3M9XCJ6bWRpIHptZGktY2hhcnRcIj48L2k+JyArXG4gICc8c3Bhbj57e3Byb2JhYmlsaXR5fX08L3NwYW4+JyArXG4gICc8L3NwYW4+JyArXG4gICc8L2Rpdj4nICtcbiAgJzxpIGNsYXNzPVwidG9nZ2xlLWdvYWwgYWRkLWdvYWwgem1kaSB6bWRpLXBsdXMtY2lyY2xlXCIgZGF0YS1nb2FsPVwie3tpZH19XCI+PC9pPicgK1xuICAnPC9kaXY+JztcbnZhciBwaWNrZWRHb2FsVGVtcGxhdGUgPVxuICAnPGRpdiBjbGFzcz1cInBpY2tlZCBwaWNrZWQtLXt7aWR9fSB7e3BpY2tlZH19XCI+JyArXG4gICc8ZGl2IGNsYXNzPVwicGlja2VkX19kZXRhaWxzXCI+JyArXG4gICc8ZGl2IGNsYXNzPVwiZHJhZ2dlclwiPjwvZGl2PicgK1xuICAnPHAgY2xhc3M9XCJwaWNrZWRfX3RpdGxlXCI+e3t0aXRsZX19PC9wPicgK1xuICAnPHAgY2xhc3M9XCJwaWNrZWRfX2RhdGVcIj4nICtcbiAgJzxpIGNsYXNzPVwiem1kaSB6bWRpLWNhbGVuZGFyLWFsdFwiPjwvaT4nICtcbiAgJzxpbnB1dCBjbGFzcz1cImdvYWxfX2RhdGVfX3BpY2tlclwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCJ7e2RhdGV9fVwiIHJlYWRvbmx5PicgK1xuICAnPGkgY2xhc3M9XCJ6bWRpIHptZGktZWRpdFwiPjwvaT4nICtcbiAgJzwvcD4nICtcbiAgJzxwIGNsYXNzPVwicGlja2VkX19zdWNjZXNzXCI+PGkgY2xhc3M9XCJ6bWRpIHptZGktY2hhcnRcIj48L2k+e3twcm9iYWJpbGl0eX19PC9wPicgK1xuICAnPC9kaXY+JyArXG4gICc8aSBjbGFzcz1cInRvZ2dsZS1nb2FsIGRlbGV0ZS1nb2FsIHptZGkgem1kaS1taW51cy1jaXJjbGVcIiBkYXRhLWdvYWw9XCJ7e2lkfX1cIj48L2k+JyArXG4gICc8L2Rpdj4nO1xuXG4vKipcbiAqIFBSSVZBVEUgRlVOQ1RJT05TXG4gKi9cblxudmFyIHNob3dMaXN0R29hbHMgPSBmdW5jdGlvbihnb2Fsc0xpc3QsIHBpY2tlZEdvYWxzKSB7XG4gIHZhciB2aWV3ID0gJyc7XG4gIHZhciB0ZW1wbGF0ZSA9ICcnO1xuXG4gIGdvYWxzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGdvYWwpIHtcbiAgICB2YXIgZ29hbEhpZGUgPSAnJzsgLy8gJ2dvYWwtLWhpZGUnIGNzcyBjbGFzc1xuICAgIHZhciBpc1BpY2tlZCA9IHBpY2tlZEdvYWxzLmZpbmQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5pZCA9PT0gZ29hbC5pZDtcbiAgICB9KTtcblxuICAgIGlmIChpc1BpY2tlZCkge1xuICAgICAgZ29hbEhpZGUgPSAnZ29hbC0taGlkZSc7XG4gICAgfVxuXG4gICAgdGVtcGxhdGUgPSBnb2FsVGVtcGxhdGU7XG5cbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL3t7aWR9fS9nLCBnb2FsLmlkKTtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7dGl0bGV9fScsIGdvYWwudGl0bGUpO1xuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3twaWNrZWR9fScsIGdvYWxIaWRlKTtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7ZGF0ZX19JywgZ29hbC5kYXRlKTtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3t7cHJvYmFiaWxpdHl9fScsIGdvYWwucHJvYmFiaWxpdHkpO1xuXG4gICAgdmlldyArPSB0ZW1wbGF0ZTtcbiAgfSk7XG5cbiAgY29udGFpbmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnTWFwLmdvYWxzV3JhcHBlcilbMF0uaW5uZXJIVE1MID0gdmlldztcbn07XG5cbnZhciBzaG93UGlja2VkR29hbHMgPSBmdW5jdGlvbihnb2Fsc0xpc3QsIHBpY2tlZEdvYWxzKSB7XG4gIHZhciB2aWV3ID0gJyc7XG4gIHZhciB0ZW1wbGF0ZSA9ICcnO1xuXG4gIGdvYWxzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGdvYWwpIHtcbiAgICB2YXIgcGlja2VkU2hvdyA9ICcnOyAvLyAncGlja2VkLS1zaG93JyBjc3MgY2xhc3NcbiAgICB2YXIgaXNQaWNrZWQgPSBwaWNrZWRHb2Fscy5maW5kKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaWQgPT09IGdvYWwuaWQ7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNQaWNrZWQpIHtcbiAgICAgIHBpY2tlZFNob3cgPSAncGlja2VkLS1zaG93JztcbiAgICB9XG5cbiAgICB0ZW1wbGF0ZSA9IHBpY2tlZEdvYWxUZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgve3tpZH19L2csIGdvYWwuaWQpO1xuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgne3t0aXRsZX19JywgZ29hbC50aXRsZSk7XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3BpY2tlZH19JywgcGlja2VkU2hvdyk7XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e2RhdGV9fScsIGdvYWwuZGF0ZSk7XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKCd7e3Byb2JhYmlsaXR5fX0nLCBnb2FsLnByb2JhYmlsaXR5KTtcblxuICAgIHZpZXcgKz0gdGVtcGxhdGU7XG4gIH0pO1xuXG4gIGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZ01hcC5waWNrZWRHb2Fsc1dyYXBwZXIpWzBdLmlubmVySFRNTCA9IHZpZXc7XG59O1xuXG4vKipcbiAqIFBVQkxJQyBGVU5DVElPTlNcbiAqL1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIGlmIChldmVudCA9PT0gJ2dvYWxUb2dnbGVkJykge1xuICAgIHRvZ2dsZUJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBnb2FsTmFtZSA9IHRoaXMuZGF0YXNldC5nb2FsO1xuICAgICAgICB2YXIgdG9nZ2xlZEdvYWwgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGlja2VkLS0nICsgZ29hbE5hbWUpWzBdO1xuICAgICAgICB2YXIgZGF0ZSA9IHRvZ2dsZWRHb2FsLnF1ZXJ5U2VsZWN0b3IoY29uZmlnTWFwLmRhdGVwaWNrZXIpLnZhbHVlO1xuXG4gICAgICAgIHRvZ2dsZWRHb2FsLmNsYXNzTGlzdC50b2dnbGUoJ3BpY2tlZC0tc2hvdycpO1xuICAgICAgICBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZ29hbC0tJyArIGdvYWxOYW1lKVswXS5jbGFzc0xpc3QudG9nZ2xlKCdnb2FsLS1oaWRlJyk7XG5cbiAgICAgICAgaGFuZGxlcih7XG4gICAgICAgICAgaWQ6IGdvYWxOYW1lLFxuICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbihpbml0Q29udGFpbmVyLCBnb2Fsc0xpc3QsIHBpY2tlZEdvYWxzKSB7XG4gIGNvbnRhaW5lciA9IGluaXRDb250YWluZXI7XG5cbiAgLy9TaG93IGxpc3Qgb2YgZ29hbHMgdG8gYmUgcGlja2VkIGFuZCBhbHJlYWR5IHBpY2tlZFxuICBzaG93TGlzdEdvYWxzKGdvYWxzTGlzdCwgcGlja2VkR29hbHMpO1xuICBzaG93UGlja2VkR29hbHMoZ29hbHNMaXN0LCBwaWNrZWRHb2Fscyk7XG5cbiAgLy9DcmVhdGUgdG9vbHRpcHNcbiAgJChjb25maWdNYXAuJHRvb2x0aXBzKS50b29sdGlwKCk7XG5cbiAgLy9CdXR0b25zIHRvIGFkZCBhbmQgZGVsZXRlIGdvYWxzXG4gIHRvZ2dsZUJ1dHRvbnMgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAudG9nZ2xlQnV0dG9ucyk7XG5cbiAgLy9JbXBsZW1lbnQgZHJhZyAmIGRyb3AgcGlja2VkIGdvYWxzXG4gIHZhciBwaWNrZWRDb250YWluZXIgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWdNYXAucGlja2VkR29hbHMpWzBdO1xuICBkcmFndWxhKFtwaWNrZWRDb250YWluZXJdKTtcblxuICAvL0RhdGVwaWNrZXJcbiAgJChjb25maWdNYXAuZGF0ZXBpY2tlcikuZGF0ZXBpY2tlcih7XG4gICAgYXV0b2Nsb3NlOiB0cnVlLFxuICAgIGZvcm1hdDogJ00gZCB5eXl5J1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICBpbml0OiBpbml0LFxuICBzaG93TGlzdEdvYWxzOiBzaG93TGlzdEdvYWxzXG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzggLSBSZXRpcmVtZW50IG1vZHVsZVxuICogQG1vZHVsZSA4LVJldGlyZW1lbnRcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAganNvblVybDogJ3NjcmlwdHMvbW9kZWwvYWN0aW9ucy5qc29uJ1xufTtcblxudmFyIHRib2R5LFxuICBkYXRhO1xuXG4vKipcbiAqIERPTSBGVU5DVElPTlNcbiAqL1xuXG52YXIgY3JlYXRlQWN0aW9ucyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGRvY0ZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxuICAgIHJvdztcblxuICBkYXRhLmFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xuICAgIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG4gICAgcm93LmlubmVySFRNTCA9ICc8dGQ+PGkgY2xhc3M9XCJ6bWRpIHptZGktY2hlY2stY2lyY2xlXCIgZGF0YS1hY3Rpb249XCInICsgaW5kZXggKyAnXCI+PC9pPjwvdGQ+JyArXG4gICAgICAnPHRkPicgKyBlbGVtZW50LnRvZG8gKyAnPC90ZD4nICtcbiAgICAgICc8dGQ+JyArIGVsZW1lbnQudG9kb25vdCArICc8L3RkPicgK1xuICAgICAgJzx0ZD48aSBjbGFzcz1cInptZGkgem1kaS1pbmZvLW91dGxpbmVcIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBkYXRhLXBsYWNlbWVudD1cImxlZnRcIiB0aXRsZT1cIicgKyBlbGVtZW50LndoeSArICdcIj48L2k+PC90ZD4nO1xuICAgIGRvY0ZyYWdtZW50LmFwcGVuZENoaWxkKHJvdyk7XG4gIH0pO1xuICByZXR1cm4gZG9jRnJhZ21lbnQ7XG59O1xuXG4vKipcbiAqIEVWRU5UIEhBTkRMRVJTXG4gKi9cblxuLyoqXG4gKiBQVUJMSUMgRlVOQ1RJT05TXG4gKi9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBpZiAoZXZlbnQgPT09ICdhY3Rpb25Ub2dnbGVkJykge1xuICAgIHRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09PSAnSScgJiYgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnem1kaS1jaGVjay1jaXJjbGUnKSkge1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgnc2F2ZWQnKTtcbiAgICAgICAgaGFuZGxlcihkYXRhLmFjdGlvbnNbTnVtYmVyKHRhcmdldC5kYXRhc2V0LmFjdGlvbildKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgdGJvZHkgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3Rib2R5JylbMF07XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBjb25maWdNYXAuanNvblVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgZGF0YSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQoY3JlYXRlQWN0aW9ucyhkYXRhKSk7XG4gICAgICAvL1Rvb2x0aXBzXG4gICAgICAkKCcucmV0aXJlbWVudC13cmFwcGVyIC56bWRpLWluZm8tb3V0bGluZScpLnRvb2x0aXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdpdGggdGhlIGNvbm5lY3Rpb24uJyk7XG4gICAgfVxuICB9O1xuICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3Igd2l0aCB0aGUgY29ubmVjdGlvbi4nKTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgaW5pdDogaW5pdFxufTtcbiIsIi8qKlxuICogU2NyZWVuICM4IC0gUmV0aXJlbWVudCBtb2R1bGVcbiAqIEBtb2R1bGUgOC1SZXRpcmVtZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgY29uZmlnTWFwID0ge1xuICBhY3Rpb25UaXRsZUNsYXNzZXM6ICdhY3Rpb25fX3RpdGxlJyxcbiAgcG9wb3ZlckNsYXNzZXM6ICcucGxhbi13cmFwcGVyIC56bWRpLWluZm8tb3V0bGluZScsXG4gIGRhdGVwaWNrZXJDbGFzc2VzOiAnLnBsYW4td3JhcHBlciAuem1kaS1jYWxlbmRhci1hbHQnXG59O1xuXG4vKipcbiAqIERPTSBGVU5DVElPTlNcbiAqL1xuXG52YXIgcHJpbnRQbGFuID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwcmludFBhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICBodG1sID0gJzxoMSBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91ciBBY3Rpb24gUGxhbjwvaDE+JztcblxuICBwcmludFBhZ2UuY2xhc3NMaXN0LmFkZCgncHJpbnQtcGFnZScpO1xuXG4gIHZhciBwbGFuQWN0aW9ucyA9IFt7XG4gICAgdGl0bGU6ICdQbGF5IGEgc3RheS1jYXRpb24nLFxuICAgIHR5cGU6ICdWYXJpYWJsZSBleHBlbnNlJyxcbiAgICBkYXRlOiAnTm92ZW1iZXIgMjh0aCAyMDE2JyxcbiAgICBkZXRhaWxzOiAnQmFuayB3aGF0IHlvdSBzYXZlJ1xuICB9LCB7XG4gICAgdGl0bGU6ICdQbGF5IGEgc3RheS1jYXRpb24nLFxuICAgIHR5cGU6ICdWYXJpYWJsZSBleHBlbnNlJyxcbiAgICBkYXRlOiAnTm92ZW1iZXIgMjh0aCAyMDE2JyxcbiAgICBkZXRhaWxzOiAnQmFuayB3aGF0IHlvdSBzYXZlJ1xuICB9LCB7XG4gICAgdGl0bGU6ICdQbGF5IGEgc3RheS1jYXRpb24nLFxuICAgIHR5cGU6ICdWYXJpYWJsZSBleHBlbnNlJyxcbiAgICBkYXRlOiAnTm92ZW1iZXIgMjh0aCAyMDE2JyxcbiAgICBkZXRhaWxzOiAnQmFuayB3aGF0IHlvdSBzYXZlJ1xuICB9LCB7XG4gICAgdGl0bGU6ICdQbGF5IGEgc3RheS1jYXRpb24nLFxuICAgIHR5cGU6ICdWYXJpYWJsZSBleHBlbnNlJyxcbiAgICBkYXRlOiAnTm92ZW1iZXIgMjh0aCAyMDE2JyxcbiAgICBkZXRhaWxzOiAnQmFuayB3aGF0IHlvdSBzYXZlJ1xuICB9LCB7XG4gICAgdGl0bGU6ICdQbGF5IGEgc3RheS1jYXRpb24nLFxuICAgIHR5cGU6ICdWYXJpYWJsZSBleHBlbnNlJyxcbiAgICBkYXRlOiAnTm92ZW1iZXIgMjh0aCAyMDE2JyxcbiAgICBkZXRhaWxzOiAnQmFuayB3aGF0IHlvdSBzYXZlJ1xuICB9XTtcblxuICB2YXIgdEhlYWQgPSAnPHRhYmxlIGNsYXNzPVwidGFibGVcIj48dGhlYWQ+PHRyPjx0aD5UaXRsZTwvdGg+PHRoPnR5cGU8L3RoPjx0aD5EYXRlPC90aD48dGg+RGV0YWlsczwvdGg+PC90cj48L3RoZWFkPicsXG4gICAgdEJvZHkgPSAnPHRib2R5Pic7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBsYW5BY3Rpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdEJvZHkgKz0gJzx0cj48dGQ+JyArIHBsYW5BY3Rpb25zW2ldLnRpdGxlICsgJzwvdGQ+JyArXG4gICAgICAnPHRkPicgKyBwbGFuQWN0aW9uc1tpXS50eXBlICsgJzwvdGQ+JyArXG4gICAgICAnPHRkPicgKyBwbGFuQWN0aW9uc1tpXS5kYXRlICsgJzwvdGQ+JyArXG4gICAgICAnPHRkPicgKyBwbGFuQWN0aW9uc1tpXS5kZXRhaWxzICsgJzwvdGQ+PHRyPic7XG4gIH1cblxuICB0Qm9keSArPSAnPC90Ym9keT48L3RhYmxlPic7XG4gIGh0bWwgKz0gdEhlYWQgKyB0Qm9keTtcblxuICBwcmludFBhZ2UuaW5uZXJIVE1MID0gaHRtbDtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwcmludFBhZ2UpO1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLXByaW50Jyk7XG5cbiAgd2luZG93LnByaW50KCk7XG5cbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1wcmludCcpO1xuICBwcmludFBhZ2UuaW5uZXJIVE1MID0gJyc7XG59O1xuXG4vKipcbiAqIFBVQkxJQyBGVU5DVElPTlNcbiAqL1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuXG4gIC8vUG9wb3ZlclxuICAkKGNvbmZpZ01hcC5wb3BvdmVyQ2xhc3NlcykucG9wb3Zlcih7XG4gICAgcGxhY2VtZW50OiAnbGVmdCdcbiAgfSk7XG5cbiAgLy9EYXRlcGlja2Vyc1xuICAkKGNvbmZpZ01hcC5kYXRlcGlja2VyQ2xhc3NlcylcbiAgICAuZGF0ZXBpY2tlcih7XG4gICAgICBhdXRvY2xvc2U6IHRydWUsXG4gICAgICBmb3JtYXQ6ICdNIGQgeXl5eSdcbiAgICB9KVxuICAgIC5vbignY2hhbmdlRGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0aGlzLmRhdGFzZXQuZGF0ZSA9IGV2ZW50LmZvcm1hdCgpO1xuICAgIH0pO1xuXG4gIHZhciBwcmludEJ1dHRvbiA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwcmludCcpWzBdO1xuICBwcmludEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByaW50UGxhbik7XG5cbiAgdmFyIGFjdGlvblRpdGxlcyA9IGNvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZ01hcC5hY3Rpb25UaXRsZUNsYXNzZXMpO1xuICBhY3Rpb25UaXRsZXMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QudG9nZ2xlKCdyb3RhdGUnKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogaW5pdFxufTtcbiIsIi8qKlxuICogU2hlbGwgbW9kdWxlXG4gKiBAbW9kdWxlIHNoZWxsXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG52YXIgbW9kZWwgPSByZXF1aXJlKCcuL21vZGVsJyk7XG52YXIgdmlld3MgPSB7XG4gIC8vU2NyZWVuc1xuICBhYm91dDogcmVxdWlyZSgnLi9zY3JlZW5zLzItYWJvdXQnKSxcbiAgeW91OiByZXF1aXJlKCcuL3NjcmVlbnMvMy15b3UnKSxcbiAgcHlyYW1pZDogcmVxdWlyZSgnLi9zY3JlZW5zLzUtcHlyYW1pZCcpLFxuICBzY2VuYXJpb3M6IHJlcXVpcmUoJy4vc2NyZWVucy82LXNjZW5hcmlvcycpLFxuICBnb2FsOiByZXF1aXJlKCcuL3NjcmVlbnMvNy1nb2FsJyksXG4gIHJldGlyZW1lbnQ6IHJlcXVpcmUoJy4vc2NyZWVucy84LXJldGlyZW1lbnQnKSxcbiAgcGxhbjogcmVxdWlyZSgnLi9zY3JlZW5zLzktcGxhbicpLFxuXG4gIC8vQ29tcG9uZW50c1xuICBuYXY6IHJlcXVpcmUoJy4vY29tcG9uZW50cy9uYXYnKSxcbiAgaGFtYnVyZ2VyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvaGFtYnVyZ2VyJyksXG4gIGNvbnRpbnVlOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29udGludWUnKVxufTtcblxudmFyIGRhdGE7XG5cbi8qKlxuICogVklFV1MgQ09OVFJPTExFUlNcbiAqL1xuXG4vKipcbiAqIDItQWJvdXRcbiAqL1xudmFyIGFib3V0Q29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xuICB2aWV3cy5hYm91dC5iaW5kKCdhZ2VDaGFuZ2VkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICBtb2RlbC51cGRhdGUoJ2Fib3V0QWdlJywgdmFsdWUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBQdWJTdWIucHVibGlzaCgnYWdlQ2hhbmdlZCcsIHZhbHVlKTtcbiAgICB9KTtcbiAgfSk7XG4gIHZpZXdzLmFib3V0LmJpbmQoJ2luY29tZUNoYW5nZWQnLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIG1vZGVsLnVwZGF0ZSgnYWJvdXRJbmNvbWUnLCB2YWx1ZSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdhYm91dEluY29tZUNoYW5nZWQnLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgbW9kZWwudXBkYXRlTW9uZXlWYWx1ZXMoZnVuY3Rpb24obW9uZXlWYWx1ZXMpIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdtb25leVZhbHVlc0NoYW5nZWQnLCBtb25leVZhbHVlcyk7XG4gICAgfSk7XG4gIH0pO1xuICB2aWV3cy5hYm91dC5iaW5kKCdzaXR1YXRpb25DaGFuZ2VkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICBtb2RlbC51cGRhdGUoJ2Fib3V0U2l0dWF0aW9uJywgdmFsdWUpO1xuICB9KTtcbiAgdmlld3MuYWJvdXQuYmluZCgnbGl2aW5nQ2hhbmdlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgbW9kZWwudXBkYXRlKCdhYm91dExpdmluZycsIHZhbHVlKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIDMtWW91XG4gKi9cbnZhciB5b3VTdWJzY3JpYmVyID0gZnVuY3Rpb24odG9waWMsIGRhdGEpIHtcbiAgaWYgKHRvcGljID09PSAnYWJvdXRJbmNvbWVDaGFuZ2VkJykge1xuICAgIHZpZXdzLnlvdS5jb25maWdNb2R1bGUoe1xuICAgICAgYWJvdXRJbmNvbWU6IGRhdGFcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHlvdUNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcbiAgdmlld3MueW91LmJpbmQoJ2Jhc2ljTmVlZHNDaGFuZ2VkJywgZnVuY3Rpb24oYmFzaWNSYXRlLCBzYXZpbmdzUmF0ZSkge1xuICAgIG1vZGVsLnVwZGF0ZSgnYWJvdXRCYXNpY1JhdGUnLCBiYXNpY1JhdGUpO1xuICAgIG1vZGVsLnVwZGF0ZSgnYWJvdXRTYXZpbmdzUmF0ZScsIHNhdmluZ3NSYXRlLCBmdW5jdGlvbihzYXZpbmdzUmF0ZSkge1xuICAgICAgUHViU3ViLnB1Ymxpc2goJ3NhdmluZ3NSYXRlQ2hhbmdlZCcsIHNhdmluZ3NSYXRlKTtcbiAgICB9KTtcbiAgICBtb2RlbC51cGRhdGVNb25leVZhbHVlcyhmdW5jdGlvbihtb25leVZhbHVlcykge1xuICAgICAgUHViU3ViLnB1Ymxpc2goJ21vbmV5VmFsdWVzQ2hhbmdlZCcsIG1vbmV5VmFsdWVzKTtcbiAgICB9KTtcbiAgfSk7XG4gIHZpZXdzLnlvdS5iaW5kKCdleHBlbnNlc0NoYW5nZWQnLCBmdW5jdGlvbihleHBlbnNlc1JhdGUsIHNhdmluZ3NSYXRlKSB7XG4gICAgbW9kZWwudXBkYXRlKCdhYm91dERpc2NyZXRpb25hcnlSYXRlJywgZXhwZW5zZXNSYXRlKTtcbiAgICBtb2RlbC51cGRhdGUoJ2Fib3V0U2F2aW5nc1JhdGUnLCBzYXZpbmdzUmF0ZSwgZnVuY3Rpb24oc2F2aW5nc1JhdGUpIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdzYXZpbmdzUmF0ZUNoYW5nZWQnLCBzYXZpbmdzUmF0ZSk7XG4gICAgfSk7XG4gICAgbW9kZWwudXBkYXRlTW9uZXlWYWx1ZXMoZnVuY3Rpb24obW9uZXlWYWx1ZXMpIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdtb25leVZhbHVlc0NoYW5nZWQnLCBtb25leVZhbHVlcyk7XG4gICAgfSk7XG4gIH0pO1xuICB2aWV3cy55b3UuYmluZCgnc2F2aW5nc0NoYW5nZWQnLCBmdW5jdGlvbihjdXJyZW50U2F2aW5ncykge1xuICAgIG1vZGVsLnVwZGF0ZSgnY3VycmVudFNhdmluZ3MnLCBjdXJyZW50U2F2aW5ncywgZnVuY3Rpb24oY3VycmVudFNhdmluZ3MpIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdjdXJyZW50U2F2aW5nc0NoYW5nZWQnLCBjdXJyZW50U2F2aW5ncyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2Fib3V0SW5jb21lQ2hhbmdlZCcsIHlvdVN1YnNjcmliZXIpO1xufTtcblxuLyoqXG4gKiA1LVB5cmFtaWRcbiAqL1xudmFyIHB5cmFtaWRTdWJzY3JpYmVyID0gZnVuY3Rpb24odG9waWMsIGRhdGEpIHtcbiAgaWYgKHRvcGljID09PSAnYWJvdXRJbmNvbWVDaGFuZ2VkJykge1xuICAgIHZpZXdzLnB5cmFtaWQuY29uZmlnTW9kdWxlKHtcbiAgICAgIGFib3V0SW5jb21lOiBkYXRhXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodG9waWMgPT09ICdtb25leVZhbHVlc0NoYW5nZWQnKSB7XG4gICAgdmlld3MucHlyYW1pZC5jb25maWdNb2R1bGUoZGF0YSk7XG4gIH1cbiAgdmlld3MucHlyYW1pZC51cGRhdGVMYWJlbHMoKTtcbn07XG5cbnZhciBweXJhbWlkQ29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xuICBQdWJTdWIuc3Vic2NyaWJlKCdhYm91dEluY29tZUNoYW5nZWQnLCBweXJhbWlkU3Vic2NyaWJlcik7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ21vbmV5VmFsdWVzQ2hhbmdlZCcsIHB5cmFtaWRTdWJzY3JpYmVyKTtcbn07XG5cbi8qKlxuICogNi1TY2VuYXJpb3NcbiAqL1xudmFyIHNjZW5hcmlvc1N1YnNjcmliZXIgPSBmdW5jdGlvbih0b3BpYywgZGF0YSkge1xuICBpZiAodG9waWMgPT09ICdhZ2VDaGFuZ2VkJykge1xuICAgIHZpZXdzLnNjZW5hcmlvcy5jb25maWdNb2R1bGUoe1xuICAgICAgYWJvdXRBZ2U6IGRhdGFcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0b3BpYyA9PT0gJ2Fib3V0SW5jb21lQ2hhbmdlZCcpIHtcbiAgICB2aWV3cy5zY2VuYXJpb3MuY29uZmlnTW9kdWxlKHtcbiAgICAgIGluY29tZTogZGF0YVxuICAgIH0pO1xuICAgIHZpZXdzLnNjZW5hcmlvcy5zZXRTbGlkZXIoJ2luY29tZScsIGRhdGEpO1xuICB9IGVsc2UgaWYgKHRvcGljID09PSAnc2F2aW5nc1JhdGVDaGFuZ2VkJykge1xuICAgIHZpZXdzLnNjZW5hcmlvcy5jb25maWdNb2R1bGUoe1xuICAgICAgc2F2aW5nc1JhdGU6IGRhdGFcbiAgICB9KTtcbiAgICB2aWV3cy5zY2VuYXJpb3Muc2V0U2xpZGVyKCdzYXZpbmdzUmF0ZScsIGRhdGEpO1xuICB9IGVsc2UgaWYgKHRvcGljID09PSAnY3VycmVudFNhdmluZ3NDaGFuZ2VkJykge1xuICAgIHZpZXdzLnNjZW5hcmlvcy5jb25maWdNb2R1bGUoe1xuICAgICAgY3VycmVudFNhdmluZ3M6IGRhdGFcbiAgICB9KTtcbiAgfVxuXG4gIHZpZXdzLnNjZW5hcmlvcy51cGRhdGVMaW5lQ2hhcnQoKTtcbn07XG5cbnZhciBzY2VuYXJpb3NDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2FnZUNoYW5nZWQnLCBzY2VuYXJpb3NTdWJzY3JpYmVyKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRJbmNvbWVDaGFuZ2VkJywgc2NlbmFyaW9zU3Vic2NyaWJlcik7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ3NhdmluZ3NSYXRlQ2hhbmdlZCcsIHNjZW5hcmlvc1N1YnNjcmliZXIpO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdjdXJyZW50U2F2aW5nc0NoYW5nZWQnLCBzY2VuYXJpb3NTdWJzY3JpYmVyKTtcbn07XG5cbi8qKlxuICogNy1Hb2FsXG4gKi9cbnZhciBnb2FsQ29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xuICB2aWV3cy5nb2FsLmJpbmQoJ2dvYWxUb2dnbGVkJywgZnVuY3Rpb24oZ29hbCkge1xuICAgIG1vZGVsLnRvZ2dsZUdvYWwoZ29hbCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiA4LVJldGlyZW1lbnRcbiAqL1xudmFyIHJldGlyZW1lbnRDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG4gIHZpZXdzLnJldGlyZW1lbnQuYmluZCgnYWN0aW9uVG9nZ2xlZCcsIGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIG1vZGVsLnRvZ2dsZUFjdGlvbnMoYWN0aW9uKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIENPTVBPTkVOVFMgQ09OVFJPTExFUlNcbiAqL1xuXG4vKipcbiAqIE5hdmlnYXRpb25cbiAqL1xudmFyIG5hdkNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcbiAgdmlld3MubmF2LnNldERpc2FibGVkTGlua3MoZGF0YS5sYXN0VXNlclN0ZXApO1xufTtcblxuLyoqXG4gKiBDb250aW51ZSBidXR0b25cbiAqL1xudmFyIGNvbnRpbnVlQ29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xuICB2aWV3cy5jb250aW51ZS5iaW5kKCdjb250aW51ZUNsaWNrZWQnLCBmdW5jdGlvbihuZXh0QWN0aXZlTmF2TGluaykge1xuICAgIC8vV2hlbiB1c2VyIGlzIG9uIHRoZSBsYXN0IHN0ZXAgdGhlIHZhbHVlIG9mICduZXh0QWN0aXZlTmF2TGluaycgaXMgJ2ZhbHNlJ1xuICAgIGlmIChuZXh0QWN0aXZlTmF2TGluaykge1xuICAgICAgdmFyIGxhc3RVc2VyU3RlcCA9IE51bWJlcihcbiAgICAgICAgbmV4dEFjdGl2ZU5hdkxpbmtcbiAgICAgICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3N0ZXAtbnVtYmVyJylbMF1cbiAgICAgICAgLnRleHRDb250ZW50XG4gICAgICApO1xuICAgICAgdmFyIHNhdmVkTGFzdFN0ZXAgPSBkYXRhLmxhc3RVc2VyU3RlcDtcbiAgICAgIGlmIChsYXN0VXNlclN0ZXAgPiBzYXZlZExhc3RTdGVwKSB7XG4gICAgICAgIG1vZGVsLnVwZGF0ZSgnbGFzdFVzZXJTdGVwJywgbGFzdFVzZXJTdGVwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuXG4vKipcbiAqIFBVQkxJQyBGVU5DVElPTlNcbiAqL1xuXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBkYXRhID0gbW9kZWwucmVhZCgpO1xuICAvL1NjcmVlbiAjMlxuICB2YXIgYWJvdXRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhYm91dC13cmFwcGVyJylbMF07XG4gIHZpZXdzLmFib3V0LmNvbmZpZ01vZHVsZSh7XG4gICAgYWdlT3B0aW9uczoge1xuICAgICAgc3RhcnQ6IGRhdGEuYWJvdXRBZ2VcbiAgICB9LFxuICAgIGluY29tZU9wdGlvbnM6IHtcbiAgICAgIHN0YXJ0OiBkYXRhLmFib3V0SW5jb21lXG4gICAgfSxcbiAgICBhYm91dFNpdHVhdGlvbjogZGF0YS5hYm91dFNpdHVhdGlvbixcbiAgICBhYm91dExpdmluZzogZGF0YS5hYm91dExpdmluZ1xuICB9KTtcbiAgdmlld3MuYWJvdXQuaW5pdChhYm91dENvbnRhaW5lcik7XG4gIGFib3V0Q29udHJvbGxlcigpO1xuXG4gIC8vU2NyZWVuICMzXG4gIHZhciB5b3VDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd5b3Utd3JhcHBlcicpWzBdO1xuICB2aWV3cy55b3UuY29uZmlnTW9kdWxlKHtcbiAgICBhYm91dEluY29tZTogZGF0YS5hYm91dEluY29tZSxcbiAgICBuZWVkc09wdGlvbnM6IHtcbiAgICAgIHN0YXJ0OiBkYXRhLmFib3V0QmFzaWNSYXRlXG4gICAgfSxcbiAgICBleHBlbnNlc09wdGlvbnM6IHtcbiAgICAgIHN0YXJ0OiBkYXRhLmFib3V0RGlzY3JldGlvbmFyeVJhdGVcbiAgICB9LFxuICAgIHNhdmluZ3NPcHRpb25zOiB7XG4gICAgICBzdGFydDogZGF0YS5jdXJyZW50U2F2aW5nc1xuICAgIH0sXG4gICAgZG91Z2hudXREYXRhOiB7XG4gICAgICBzZXJpZXM6IFt7XG4gICAgICAgIHZhbHVlOiBkYXRhLmFib3V0QmFzaWNSYXRlLFxuICAgICAgICBuYW1lOiAnQmFzaWMgTmVlZHMnXG4gICAgICB9LCB7XG4gICAgICAgIHZhbHVlOiBkYXRhLmFib3V0RGlzY3JldGlvbmFyeVJhdGUsXG4gICAgICAgIG5hbWU6ICdEaXNjcmV0aW9uYXJ5J1xuICAgICAgfV1cbiAgICB9XG4gIH0pO1xuICB2aWV3cy55b3UuaW5pdCh5b3VDb250YWluZXIpO1xuICB5b3VDb250cm9sbGVyKCk7XG5cbiAgLy9TY3JlZW4gIzVcbiAgdmFyIHB5cmFtaWRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdweXJhbWlkLXdyYXBwZXInKVswXTtcbiAgdmlld3MucHlyYW1pZC5jb25maWdNb2R1bGUoe1xuICAgIGJhc2ljTmVlZHM6IGRhdGEuYmFzaWNOZWVkcyxcbiAgICBhbm51YWxTYXZpbmdzOiBkYXRhLmFubnVhbFNhdmluZ3MsXG4gICAgZGlzY3JldGlvbmFyeUV4cGVuc2VzOiBkYXRhLmRpc2NyZXRpb25hcnlFeHBlbnNlcyxcbiAgICBhYm91dEluY29tZTogZGF0YS5hYm91dEluY29tZVxuICB9KTtcbiAgdmlld3MucHlyYW1pZC5pbml0KHB5cmFtaWRDb250YWluZXIpO1xuICBweXJhbWlkQ29udHJvbGxlcigpO1xuXG4gIC8vU2NyZWVuICM2XG4gIHZhciBzY2VuYXJpb3NDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzY2VuYXJpb3Mtd3JhcHBlcicpWzBdO1xuICB2aWV3cy5zY2VuYXJpb3MuY29uZmlnTW9kdWxlKHtcbiAgICBzYXZpbmdzUmF0ZTogZGF0YS5hYm91dFNhdmluZ3NSYXRlLFxuICAgIGluY29tZTogZGF0YS5hYm91dEluY29tZSxcbiAgICBhbm51YWxTYXZpbmdzOiBkYXRhLmFubnVhbFNhdmluZ3MsXG4gICAgYWJvdXRBZ2U6IGRhdGEuYWJvdXRBZ2UsXG4gICAgY3VycmVudFNhdmluZ3M6IGRhdGEuY3VycmVudFNhdmluZ3MsXG4gICAgc2F2aW5nUmF0ZU9wdGlvbnM6IHtcbiAgICAgIHN0YXJ0OiBkYXRhLmFib3V0U2F2aW5nc1JhdGVcbiAgICB9LFxuICAgIGluY29tZU9wdGlvbnM6IHtcbiAgICAgIHN0YXJ0OiBkYXRhLmFib3V0SW5jb21lXG4gICAgfSxcbiAgICBjaGFydERhdGE6IHtcbiAgICAgIGxhYmVsczogdmlld3Muc2NlbmFyaW9zLmdldEFic2Npc3NhcyhkYXRhLmFib3V0QWdlLCA2NSlcbiAgICB9XG4gIH0pO1xuICB2aWV3cy5zY2VuYXJpb3MuaW5pdChzY2VuYXJpb3NDb250YWluZXIpO1xuICBzY2VuYXJpb3NDb250cm9sbGVyKCk7XG5cbiAgLy9TY3JlZW4gIzdcbiAgdmFyIGdvYWxDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdnb2FsLXdyYXBwZXInKVswXTtcbiAgdmlld3MuZ29hbC5pbml0KGdvYWxDb250YWluZXIsIG1vZGVsLmdldEdvYWxzKCksIGRhdGEucGlja2VkR29hbHMpO1xuICBnb2FsQ29udHJvbGxlcigpO1xuXG4gIC8vU2NyZWVuICM4XG4gIHZhciByZXRpcmVtZW50Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncmV0aXJlbWVudC13cmFwcGVyJylbMF07XG4gIHZpZXdzLnJldGlyZW1lbnQuaW5pdChyZXRpcmVtZW50Q29udGFpbmVyKTtcbiAgcmV0aXJlbWVudENvbnRyb2xsZXIoKTtcblxuICAvL1NjcmVlbiAjOVxuICB2YXIgcGxhbkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BsYW4td3JhcHBlcicpWzBdO1xuICB2aWV3cy5wbGFuLmluaXQocGxhbkNvbnRhaW5lcik7XG5cblxuICAvKiBDT01QT05FTlRTICovXG5cbiAgLy9OYXZpZ2F0aW9uXG4gIHZpZXdzLm5hdi5pbml0KCk7XG4gIG5hdkNvbnRyb2xsZXIoKTtcblxuICAvL0NvbnRpbnVlIGJ1dHRvbnNcbiAgdmlld3MuY29udGludWUuaW5pdCgpO1xuICBjb250aW51ZUNvbnRyb2xsZXIoKTtcblxuICAvL0hhbWJ1cmdlciBtZW51XG4gIHZpZXdzLmhhbWJ1cmdlci5pbml0KCk7XG5cbiAgLyogREVWRUxPUE1FTlQgT05MWSAqL1xuICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyZXNldC1tb2RlbCcpWzBdO1xuICByZXNldEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIG1vZGVsLnJlc2V0KCk7XG4gICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGluaXRcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGF0b2EgKGEsIG4pIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGEsIG4pOyB9XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZSB1bmxlc3MgYW1kTW9kdWxlSWQgaXMgc2V0XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKHJvb3RbJ0NoYXJ0aXN0J10gPSBmYWN0b3J5KCkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290WydDaGFydGlzdCddID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuLyogQ2hhcnRpc3QuanMgMC45LjVcbiAqIENvcHlyaWdodCDCqSAyMDE1IEdpb24gS3VuelxuICogRnJlZSB0byB1c2UgdW5kZXIgdGhlIFdURlBMIGxpY2Vuc2UuXG4gKiBodHRwOi8vd3d3Lnd0ZnBsLm5ldC9cbiAqL1xuLyoqXG4gKiBUaGUgY29yZSBtb2R1bGUgb2YgQ2hhcnRpc3QgdGhhdCBpcyBtYWlubHkgcHJvdmlkaW5nIHN0YXRpYyBmdW5jdGlvbnMgYW5kIGhpZ2hlciBsZXZlbCBmdW5jdGlvbnMgZm9yIGNoYXJ0IG1vZHVsZXMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5Db3JlXG4gKi9cbnZhciBDaGFydGlzdCA9IHtcbiAgdmVyc2lvbjogJzAuOS41J1xufTtcblxuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIEhlbHBzIHRvIHNpbXBsaWZ5IGZ1bmN0aW9uYWwgc3R5bGUgY29kZVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0geyp9IG4gVGhpcyBleGFjdCB2YWx1ZSB3aWxsIGJlIHJldHVybmVkIGJ5IHRoZSBub29wIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4geyp9IFRoZSBzYW1lIHZhbHVlIHRoYXQgd2FzIHByb3ZpZGVkIHRvIHRoZSBuIHBhcmFtZXRlclxuICAgKi9cbiAgQ2hhcnRpc3Qubm9vcCA9IGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIG47XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhLXogZnJvbSBhIG51bWJlciAwIHRvIDI2XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBuIEEgbnVtYmVyIGZyb20gMCB0byAyNiB0aGF0IHdpbGwgcmVzdWx0IGluIGEgbGV0dGVyIGEtelxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IEEgY2hhcmFjdGVyIGZyb20gYS16IGJhc2VkIG9uIHRoZSBpbnB1dCBudW1iZXIgblxuICAgKi9cbiAgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZSA9IGZ1bmN0aW9uIChuKSB7XG4gICAgLy8gTGltaXQgdG8gYS16XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoOTcgKyBuICUgMjYpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaW1wbGUgcmVjdXJzaXZlIG9iamVjdCBleHRlbmRcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCBUYXJnZXQgb2JqZWN0IHdoZXJlIHRoZSBzb3VyY2Ugd2lsbCBiZSBtZXJnZWQgaW50b1xuICAgKiBAcGFyYW0ge09iamVjdC4uLn0gc291cmNlcyBUaGlzIG9iamVjdCAob2JqZWN0cykgd2lsbCBiZSBtZXJnZWQgaW50byB0YXJnZXQgYW5kIHRoZW4gdGFyZ2V0IGlzIHJldHVybmVkXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBzYW1lIHJlZmVyZW5jZSBhcyB0YXJnZXQgYnV0IGlzIGV4dGVuZGVkIGFuZCBtZXJnZWQgd2l0aCB0aGUgcHJvcGVydGllcyBvZiBzb3VyY2VcbiAgICovXG4gIENoYXJ0aXN0LmV4dGVuZCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG5cbiAgICB2YXIgc291cmNlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2VbcHJvcF0gPT09ICdvYmplY3QnICYmIHNvdXJjZVtwcm9wXSAhPT0gbnVsbCAmJiAhKHNvdXJjZVtwcm9wXSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgIHRhcmdldFtwcm9wXSA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgdGFyZ2V0W3Byb3BdLCBzb3VyY2VbcHJvcF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZXMgYWxsIG9jY3VycmVuY2VzIG9mIHN1YlN0ciBpbiBzdHIgd2l0aCBuZXdTdWJTdHIgYW5kIHJldHVybnMgYSBuZXcgc3RyaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdWJTdHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5ld1N1YlN0clxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBDaGFydGlzdC5yZXBsYWNlQWxsID0gZnVuY3Rpb24oc3RyLCBzdWJTdHIsIG5ld1N1YlN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKHN1YlN0ciwgJ2cnKSwgbmV3U3ViU3RyKTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBudW1iZXIgdG8gYSBzdHJpbmcgd2l0aCBhIHVuaXQuIElmIGEgc3RyaW5nIGlzIHBhc3NlZCB0aGVuIHRoaXMgd2lsbCBiZSByZXR1cm5lZCB1bm1vZGlmaWVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVuaXRcbiAgICogQHJldHVybiB7U3RyaW5nfSBSZXR1cm5zIHRoZSBwYXNzZWQgbnVtYmVyIHZhbHVlIHdpdGggdW5pdC5cbiAgICovXG4gIENoYXJ0aXN0LmVuc3VyZVVuaXQgPSBmdW5jdGlvbih2YWx1ZSwgdW5pdCkge1xuICAgIGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUgKyB1bml0O1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBudW1iZXIgb3Igc3RyaW5nIHRvIGEgcXVhbnRpdHkgb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IGlucHV0XG4gICAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdmFsdWUgYXMgbnVtYmVyIGFuZCB0aGUgdW5pdCBhcyBzdHJpbmcuXG4gICAqL1xuICBDaGFydGlzdC5xdWFudGl0eSA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBtYXRjaCA9ICgvXihcXGQrKVxccyooLiopJC9nKS5leGVjKGlucHV0KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlIDogK21hdGNoWzFdLFxuICAgICAgICB1bml0OiBtYXRjaFsyXSB8fCB1bmRlZmluZWRcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7IHZhbHVlOiBpbnB1dCB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgd3JhcHBlciBhcm91bmQgZG9jdW1lbnQucXVlcnlTZWxlY3RvciB0aGF0IHdpbGwgcmV0dXJuIHRoZSBxdWVyeSBpZiBpdCdzIGFscmVhZHkgb2YgdHlwZSBOb2RlXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IHF1ZXJ5IFRoZSBxdWVyeSB0byB1c2UgZm9yIHNlbGVjdGluZyBhIE5vZGUgb3IgYSBET00gbm9kZSB0aGF0IHdpbGwgYmUgcmV0dXJuZWQgZGlyZWN0bHlcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG4gIENoYXJ0aXN0LnF1ZXJ5U2VsZWN0b3IgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgIHJldHVybiBxdWVyeSBpbnN0YW5jZW9mIE5vZGUgPyBxdWVyeSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBGdW5jdGlvbmFsIHN0eWxlIGhlbHBlciB0byBwcm9kdWNlIGFycmF5IHdpdGggZ2l2ZW4gbGVuZ3RoIGluaXRpYWxpemVkIHdpdGggdW5kZWZpbmVkIHZhbHVlc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gbGVuZ3RoXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgQ2hhcnRpc3QudGltZXMgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICByZXR1cm4gQXJyYXkuYXBwbHkobnVsbCwgbmV3IEFycmF5KGxlbmd0aCkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdW0gaGVscGVyIHRvIGJlIHVzZWQgaW4gcmVkdWNlIGZ1bmN0aW9uc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gcHJldmlvdXNcbiAgICogQHBhcmFtIGN1cnJlbnRcbiAgICogQHJldHVybiB7Kn1cbiAgICovXG4gIENoYXJ0aXN0LnN1bSA9IGZ1bmN0aW9uKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgcmV0dXJuIHByZXZpb3VzICsgKGN1cnJlbnQgPyBjdXJyZW50IDogMCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IGhlbHBlciB0byBiZSB1c2VkIGluIGBBcnJheS5tYXBgIGZvciBtdWx0aXBseWluZyBlYWNoIHZhbHVlIG9mIGFuIGFycmF5IHdpdGggYSBmYWN0b3IuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBmYWN0b3JcbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIGluIGBBcnJheS5tYXBgIHRvIG11bHRpcGx5IGVhY2ggdmFsdWUgaW4gYW4gYXJyYXlcbiAgICovXG4gIENoYXJ0aXN0Lm1hcE11bHRpcGx5ID0gZnVuY3Rpb24oZmFjdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG51bSkge1xuICAgICAgcmV0dXJuIG51bSAqIGZhY3RvcjtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgaGVscGVyIHRvIGJlIHVzZWQgaW4gYEFycmF5Lm1hcGAgZm9yIGFkZGluZyBhIGFkZGVuZCB0byBlYWNoIHZhbHVlIG9mIGFuIGFycmF5LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gYWRkZW5kXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCBpbiBgQXJyYXkubWFwYCB0byBhZGQgYSBhZGRlbmQgdG8gZWFjaCB2YWx1ZSBpbiBhbiBhcnJheVxuICAgKi9cbiAgQ2hhcnRpc3QubWFwQWRkID0gZnVuY3Rpb24oYWRkZW5kKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG51bSkge1xuICAgICAgcmV0dXJuIG51bSArIGFkZGVuZDtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBNYXAgZm9yIG11bHRpIGRpbWVuc2lvbmFsIGFycmF5cyB3aGVyZSB0aGVpciBuZXN0ZWQgYXJyYXlzIHdpbGwgYmUgbWFwcGVkIGluIHNlcmlhbC4gVGhlIG91dHB1dCBhcnJheSB3aWxsIGhhdmUgdGhlIGxlbmd0aCBvZiB0aGUgbGFyZ2VzdCBuZXN0ZWQgYXJyYXkuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB2YXJpYWJsZSBhcmd1bWVudHMgd2hlcmUgZWFjaCBhcmd1bWVudCBpcyB0aGUgbmVzdGVkIGFycmF5IHZhbHVlIChvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIG1vcmUgdmFsdWVzKS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIGFyclxuICAgKiBAcGFyYW0gY2JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBDaGFydGlzdC5zZXJpYWxNYXAgPSBmdW5jdGlvbihhcnIsIGNiKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICBsZW5ndGggPSBNYXRoLm1heC5hcHBseShudWxsLCBhcnIubWFwKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICByZXR1cm4gZS5sZW5ndGg7XG4gICAgICAgIH0pKTtcblxuICAgIENoYXJ0aXN0LnRpbWVzKGxlbmd0aCkuZm9yRWFjaChmdW5jdGlvbihlLCBpbmRleCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcnIubWFwKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGVbaW5kZXhdO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3VsdFtpbmRleF0gPSBjYi5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvIHJvdW5kIHZhbHVlcyB3aXRoIGNlcnRhaW4gcHJlY2lzaW9uIGxldmVsIGFmdGVyIGRlY2ltYWwuIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IHJvdW5kaW5nIGVycm9ycyBuZWFyIGZsb2F0IHBvaW50IHByZWNpc2lvbiBsaW1pdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIFRoZSB2YWx1ZSB0aGF0IHNob3VsZCBiZSByb3VuZGVkIHdpdGggcHJlY2lzaW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbZGlnaXRzXSBUaGUgbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBkZWNpbWFsIHVzZWQgdG8gZG8gdGhlIHJvdW5kaW5nXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFJvdW5kZWQgdmFsdWVcbiAgICovXG4gIENoYXJ0aXN0LnJvdW5kV2l0aFByZWNpc2lvbiA9IGZ1bmN0aW9uKHZhbHVlLCBkaWdpdHMpIHtcbiAgICB2YXIgcHJlY2lzaW9uID0gTWF0aC5wb3coMTAsIGRpZ2l0cyB8fCBDaGFydGlzdC5wcmVjaXNpb24pO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogcHJlY2lzaW9uKSAvIHByZWNpc2lvbjtcbiAgfTtcblxuICAvKipcbiAgICogUHJlY2lzaW9uIGxldmVsIHVzZWQgaW50ZXJuYWxseSBpbiBDaGFydGlzdCBmb3Igcm91bmRpbmcuIElmIHlvdSByZXF1aXJlIG1vcmUgZGVjaW1hbCBwbGFjZXMgeW91IGNhbiBpbmNyZWFzZSB0aGlzIG51bWJlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHR5cGUge251bWJlcn1cbiAgICovXG4gIENoYXJ0aXN0LnByZWNpc2lvbiA9IDg7XG5cbiAgLyoqXG4gICAqIEEgbWFwIHdpdGggY2hhcmFjdGVycyB0byBlc2NhcGUgZm9yIHN0cmluZ3MgdG8gYmUgc2FmZWx5IHVzZWQgYXMgYXR0cmlidXRlIHZhbHVlcy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIENoYXJ0aXN0LmVzY2FwaW5nTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICAnXFwnJzogJyYjMDM5OydcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBzZXJpYWxpemVzIGFyYml0cmFyeSBkYXRhIHRvIGEgc3RyaW5nLiBJbiBjYXNlIG9mIGRhdGEgdGhhdCBjYW4ndCBiZSBlYXNpbHkgY29udmVydGVkIHRvIGEgc3RyaW5nLCB0aGlzIGZ1bmN0aW9uIHdpbGwgY3JlYXRlIGEgd3JhcHBlciBvYmplY3QgYW5kIHNlcmlhbGl6ZSB0aGUgZGF0YSB1c2luZyBKU09OLnN0cmluZ2lmeS4gVGhlIG91dGNvbWluZyBzdHJpbmcgd2lsbCBhbHdheXMgYmUgZXNjYXBlZCB1c2luZyBDaGFydGlzdC5lc2NhcGluZ01hcC5cbiAgICogSWYgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQgdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGltbWVkaWF0ZWx5IHdpdGggbnVsbCBvciB1bmRlZmluZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ3xPYmplY3R9IGRhdGFcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgQ2hhcnRpc3Quc2VyaWFsaXplID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSB7XG4gICAgICBkYXRhID0gJycrZGF0YTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoe2RhdGE6IGRhdGF9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoQ2hhcnRpc3QuZXNjYXBpbmdNYXApLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgICAgcmV0dXJuIENoYXJ0aXN0LnJlcGxhY2VBbGwocmVzdWx0LCBrZXksIENoYXJ0aXN0LmVzY2FwaW5nTWFwW2tleV0pO1xuICAgIH0sIGRhdGEpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGRlLXNlcmlhbGl6ZXMgYSBzdHJpbmcgcHJldmlvdXNseSBzZXJpYWxpemVkIHdpdGggQ2hhcnRpc3Quc2VyaWFsaXplLiBUaGUgc3RyaW5nIHdpbGwgYWx3YXlzIGJlIHVuZXNjYXBlZCB1c2luZyBDaGFydGlzdC5lc2NhcGluZ01hcCBiZWZvcmUgaXQncyByZXR1cm5lZC4gQmFzZWQgb24gdGhlIGlucHV0IHZhbHVlIHRoZSByZXR1cm4gdHlwZSBjYW4gYmUgTnVtYmVyLCBTdHJpbmcgb3IgT2JqZWN0LiBKU09OLnBhcnNlIGlzIHVzZWQgd2l0aCB0cnkgLyBjYXRjaCB0byBzZWUgaWYgdGhlIHVuZXNjYXBlZCBzdHJpbmcgY2FuIGJlIHBhcnNlZCBpbnRvIGFuIE9iamVjdCBhbmQgdGhpcyBPYmplY3Qgd2lsbCBiZSByZXR1cm5lZCBvbiBzdWNjZXNzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YVxuICAgKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfE9iamVjdH1cbiAgICovXG4gIENoYXJ0aXN0LmRlc2VyaWFsaXplID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmKHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgZGF0YSA9IE9iamVjdC5rZXlzKENoYXJ0aXN0LmVzY2FwaW5nTWFwKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICAgIHJldHVybiBDaGFydGlzdC5yZXBsYWNlQWxsKHJlc3VsdCwgQ2hhcnRpc3QuZXNjYXBpbmdNYXBba2V5XSwga2V5KTtcbiAgICB9LCBkYXRhKTtcblxuICAgIHRyeSB7XG4gICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIGRhdGEgPSBkYXRhLmRhdGEgIT09IHVuZGVmaW5lZCA/IGRhdGEuZGF0YSA6IGRhdGE7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBvciByZWluaXRpYWxpemUgdGhlIFNWRyBlbGVtZW50IGZvciB0aGUgY2hhcnRcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOb2RlfSBjb250YWluZXIgVGhlIGNvbnRhaW5pbmcgRE9NIE5vZGUgb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHBsYW50IHRoZSBTVkcgZWxlbWVudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gd2lkdGggU2V0IHRoZSB3aWR0aCBvZiB0aGUgU1ZHIGVsZW1lbnQuIERlZmF1bHQgaXMgMTAwJVxuICAgKiBAcGFyYW0ge1N0cmluZ30gaGVpZ2h0IFNldCB0aGUgaGVpZ2h0IG9mIHRoZSBTVkcgZWxlbWVudC4gRGVmYXVsdCBpcyAxMDAlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgU3BlY2lmeSBhIGNsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjcmVhdGVkL3JlaW5pdGlhbGl6ZWQgU1ZHIGVsZW1lbnRcbiAgICovXG4gIENoYXJ0aXN0LmNyZWF0ZVN2ZyA9IGZ1bmN0aW9uIChjb250YWluZXIsIHdpZHRoLCBoZWlnaHQsIGNsYXNzTmFtZSkge1xuICAgIHZhciBzdmc7XG5cbiAgICB3aWR0aCA9IHdpZHRoIHx8ICcxMDAlJztcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgJzEwMCUnO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBwcmV2aW91cyBTVkcgZWxlbWVudCBpbiB0aGUgY29udGFpbmVyIHRoYXQgY29udGFpbnMgdGhlIENoYXJ0aXN0IFhNTCBuYW1lc3BhY2UgYW5kIHJlbW92ZSBpdFxuICAgIC8vIFNpbmNlIHRoZSBET00gQVBJIGRvZXMgbm90IHN1cHBvcnQgbmFtZXNwYWNlcyB3ZSBuZWVkIHRvIG1hbnVhbGx5IHNlYXJjaCB0aGUgcmV0dXJuZWQgbGlzdCBodHRwOi8vd3d3LnczLm9yZy9UUi9zZWxlY3RvcnMtYXBpL1xuICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdzdmcnKSkuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckNoYXJ0aXN0U3ZnT2JqZWN0cyhzdmcpIHtcbiAgICAgIHJldHVybiBzdmcuZ2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvJywgQ2hhcnRpc3QueG1sTnMucHJlZml4KTtcbiAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzRWxlbWVudChzdmcpIHtcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzdmcpO1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIHN2ZyBvYmplY3Qgd2l0aCB3aWR0aCBhbmQgaGVpZ2h0IG9yIHVzZSAxMDAlIGFzIGRlZmF1bHRcbiAgICBzdmcgPSBuZXcgQ2hhcnRpc3QuU3ZnKCdzdmcnKS5hdHRyKHtcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSkuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hdHRyKHtcbiAgICAgIHN0eWxlOiAnd2lkdGg6ICcgKyB3aWR0aCArICc7IGhlaWdodDogJyArIGhlaWdodCArICc7J1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIHRoZSBET00gbm9kZSB0byBvdXIgY29udGFpbmVyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHN2Zy5fbm9kZSk7XG5cbiAgICByZXR1cm4gc3ZnO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIFJldmVyc2VzIHRoZSBzZXJpZXMsIGxhYmVscyBhbmQgc2VyaWVzIGRhdGEgYXJyYXlzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gZGF0YVxuICAgKi9cbiAgQ2hhcnRpc3QucmV2ZXJzZURhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YS5sYWJlbHMucmV2ZXJzZSgpO1xuICAgIGRhdGEuc2VyaWVzLnJldmVyc2UoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuc2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0eXBlb2YoZGF0YS5zZXJpZXNbaV0pID09PSAnb2JqZWN0JyAmJiBkYXRhLnNlcmllc1tpXS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0YS5zZXJpZXNbaV0uZGF0YS5yZXZlcnNlKCk7XG4gICAgICB9IGVsc2UgaWYoZGF0YS5zZXJpZXNbaV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBkYXRhLnNlcmllc1tpXS5yZXZlcnNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGRhdGEgc2VyaWVzIGludG8gcGxhaW4gYXJyYXlcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHNlcmllcyBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgZGF0YSB0byBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBieSB0aGUgZ2V0RGF0YUFycmF5IGNhbGwuIFRoaXMgd2lsbCBtb2RpZnkgdGhlIGRhdGEgb2JqZWN0IHBhc3NlZCBhcyBmaXJzdCBwYXJhbWV0ZXIuIFRoZSBsYWJlbHMgYXMgd2VsbCBhcyB0aGUgc2VyaWVzIG9yZGVyIGlzIHJldmVyc2VkLiBUaGUgd2hvbGUgc2VyaWVzIGRhdGEgYXJyYXlzIGFyZSByZXZlcnNlZCB0b28uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbXVsdGkgQ3JlYXRlIGEgbXVsdGkgZGltZW5zaW9uYWwgYXJyYXkgZnJvbSBhIHNlcmllcyBkYXRhIGFycmF5IHdoZXJlIGEgdmFsdWUgb2JqZWN0IHdpdGggYHhgIGFuZCBgeWAgdmFsdWVzIHdpbGwgYmUgY3JlYXRlZC5cbiAgICogQHJldHVybiB7QXJyYXl9IEEgcGxhaW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgZGF0YSB0byBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydFxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0RGF0YUFycmF5ID0gZnVuY3Rpb24gKGRhdGEsIHJldmVyc2UsIG11bHRpKSB7XG4gICAgLy8gSWYgdGhlIGRhdGEgc2hvdWxkIGJlIHJldmVyc2VkIGJ1dCBpc24ndCB3ZSBuZWVkIHRvIHJldmVyc2UgaXRcbiAgICAvLyBJZiBpdCdzIHJldmVyc2VkIGJ1dCBpdCBzaG91bGRuJ3Qgd2UgbmVlZCB0byByZXZlcnNlIGl0IGJhY2tcbiAgICAvLyBUaGF0J3MgcmVxdWlyZWQgdG8gaGFuZGxlIGRhdGEgdXBkYXRlcyBjb3JyZWN0bHkgYW5kIHRvIHJlZmxlY3QgdGhlIHJlc3BvbnNpdmUgY29uZmlndXJhdGlvbnNcbiAgICBpZihyZXZlcnNlICYmICFkYXRhLnJldmVyc2VkIHx8ICFyZXZlcnNlICYmIGRhdGEucmV2ZXJzZWQpIHtcbiAgICAgIENoYXJ0aXN0LnJldmVyc2VEYXRhKGRhdGEpO1xuICAgICAgZGF0YS5yZXZlcnNlZCA9ICFkYXRhLnJldmVyc2VkO1xuICAgIH1cblxuICAgIC8vIFJlY3Vyc2l2ZWx5IHdhbGtzIHRocm91Z2ggbmVzdGVkIGFycmF5cyBhbmQgY29udmVydCBzdHJpbmcgdmFsdWVzIHRvIG51bWJlcnMgYW5kIG9iamVjdHMgd2l0aCB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgLy8gdG8gdmFsdWVzLiBDaGVjayB0aGUgdGVzdHMgaW4gZGF0YSBjb3JlIC0+IGRhdGEgbm9ybWFsaXphdGlvbiBmb3IgYSBkZXRhaWxlZCBzcGVjaWZpY2F0aW9uIG9mIGV4cGVjdGVkIHZhbHVlc1xuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZUNvbnZlcnQodmFsdWUpIHtcbiAgICAgIGlmKENoYXJ0aXN0LmlzRmFsc2V5QnV0WmVybyh2YWx1ZSkpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIGhvbGUgaW4gZGF0YSBhbmQgd2Ugc2hvdWxkIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZigodmFsdWUuZGF0YSB8fCB2YWx1ZSkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlLmRhdGEgfHwgdmFsdWUpLm1hcChyZWN1cnNpdmVDb252ZXJ0KTtcbiAgICAgIH0gZWxzZSBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKSkge1xuICAgICAgICByZXR1cm4gcmVjdXJzaXZlQ29udmVydCh2YWx1ZS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihtdWx0aSkge1xuICAgICAgICAgIHZhciBtdWx0aVZhbHVlID0ge307XG5cbiAgICAgICAgICAvLyBTaW5nbGUgc2VyaWVzIHZhbHVlIGFycmF5cyBhcmUgYXNzdW1lZCB0byBzcGVjaWZ5IHRoZSBZLUF4aXMgdmFsdWVcbiAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogWzEsIDJdID0+IFt7eDogdW5kZWZpbmVkLCB5OiAxfSwge3g6IHVuZGVmaW5lZCwgeTogMn1dXG4gICAgICAgICAgLy8gSWYgbXVsdGkgaXMgYSBzdHJpbmcgdGhlbiBpdCdzIGFzc3VtZWQgdGhhdCBpdCBzcGVjaWZpZWQgd2hpY2ggZGltZW5zaW9uIHNob3VsZCBiZSBmaWxsZWQgYXMgZGVmYXVsdFxuICAgICAgICAgIGlmKHR5cGVvZiBtdWx0aSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG11bHRpVmFsdWVbbXVsdGldID0gQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQodmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtdWx0aVZhbHVlLnkgPSBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbXVsdGlWYWx1ZS54ID0gdmFsdWUuaGFzT3duUHJvcGVydHkoJ3gnKSA/IENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkKHZhbHVlLngpIDogbXVsdGlWYWx1ZS54O1xuICAgICAgICAgIG11bHRpVmFsdWUueSA9IHZhbHVlLmhhc093blByb3BlcnR5KCd5JykgPyBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCh2YWx1ZS55KSA6IG11bHRpVmFsdWUueTtcblxuICAgICAgICAgIHJldHVybiBtdWx0aVZhbHVlO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhLnNlcmllcy5tYXAocmVjdXJzaXZlQ29udmVydCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbnVtYmVyIGludG8gYSBwYWRkaW5nIG9iamVjdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R8TnVtYmVyfSBwYWRkaW5nXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbZmFsbGJhY2tdIFRoaXMgdmFsdWUgaXMgdXNlZCB0byBmaWxsIG1pc3NpbmcgdmFsdWVzIGlmIGEgaW5jb21wbGV0ZSBwYWRkaW5nIG9iamVjdCB3YXMgcGFzc2VkXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBwYWRkaW5nIG9iamVjdCBjb250YWluaW5nIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCBwcm9wZXJ0aWVzIGZpbGxlZCB3aXRoIHRoZSBwYWRkaW5nIG51bWJlciBwYXNzZWQgaW4gYXMgYXJndW1lbnQuIElmIHRoZSBhcmd1bWVudCBpcyBzb21ldGhpbmcgZWxzZSB0aGFuIGEgbnVtYmVyIChwcmVzdW1hYmx5IGFscmVhZHkgYSBjb3JyZWN0IHBhZGRpbmcgb2JqZWN0KSB0aGVuIHRoaXMgYXJndW1lbnQgaXMgZGlyZWN0bHkgcmV0dXJuZWQuXG4gICAqL1xuICBDaGFydGlzdC5ub3JtYWxpemVQYWRkaW5nID0gZnVuY3Rpb24ocGFkZGluZywgZmFsbGJhY2spIHtcbiAgICBmYWxsYmFjayA9IGZhbGxiYWNrIHx8IDA7XG5cbiAgICByZXR1cm4gdHlwZW9mIHBhZGRpbmcgPT09ICdudW1iZXInID8ge1xuICAgICAgdG9wOiBwYWRkaW5nLFxuICAgICAgcmlnaHQ6IHBhZGRpbmcsXG4gICAgICBib3R0b206IHBhZGRpbmcsXG4gICAgICBsZWZ0OiBwYWRkaW5nXG4gICAgfSA6IHtcbiAgICAgIHRvcDogdHlwZW9mIHBhZGRpbmcudG9wID09PSAnbnVtYmVyJyA/IHBhZGRpbmcudG9wIDogZmFsbGJhY2ssXG4gICAgICByaWdodDogdHlwZW9mIHBhZGRpbmcucmlnaHQgPT09ICdudW1iZXInID8gcGFkZGluZy5yaWdodCA6IGZhbGxiYWNrLFxuICAgICAgYm90dG9tOiB0eXBlb2YgcGFkZGluZy5ib3R0b20gPT09ICdudW1iZXInID8gcGFkZGluZy5ib3R0b20gOiBmYWxsYmFjayxcbiAgICAgIGxlZnQ6IHR5cGVvZiBwYWRkaW5nLmxlZnQgPT09ICdudW1iZXInID8gcGFkZGluZy5sZWZ0IDogZmFsbGJhY2tcbiAgICB9O1xuICB9O1xuXG4gIENoYXJ0aXN0LmdldE1ldGFEYXRhID0gZnVuY3Rpb24oc2VyaWVzLCBpbmRleCkge1xuICAgIHZhciB2YWx1ZSA9IHNlcmllcy5kYXRhID8gc2VyaWVzLmRhdGFbaW5kZXhdIDogc2VyaWVzW2luZGV4XTtcbiAgICByZXR1cm4gdmFsdWUgPyBDaGFydGlzdC5zZXJpYWxpemUodmFsdWUubWV0YSkgOiB1bmRlZmluZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgb3JkZXIgb2YgbWFnbml0dWRlIGZvciB0aGUgY2hhcnQgc2NhbGVcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIFRoZSB2YWx1ZSBSYW5nZSBvZiB0aGUgY2hhcnRcbiAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgb3JkZXIgb2YgbWFnbml0dWRlXG4gICAqL1xuICBDaGFydGlzdC5vcmRlck9mTWFnbml0dWRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5sb2coTWF0aC5hYnModmFsdWUpKSAvIE1hdGguTE4xMCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBkYXRhIGxlbmd0aCBpbnRvIHNjcmVlbiBjb29yZGluYXRlcyAocGl4ZWxzKVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gYXhpc0xlbmd0aCBUaGUgc3ZnIGVsZW1lbnQgZm9yIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFNpbmdsZSBkYXRhIHZhbHVlIGZyb20gYSBzZXJpZXMgYXJyYXlcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvdW5kcyBBbGwgdGhlIHZhbHVlcyB0byBzZXQgdGhlIGJvdW5kcyBvZiB0aGUgY2hhcnRcbiAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcHJvamVjdGVkIGRhdGEgbGVuZ3RoIGluIHBpeGVsc1xuICAgKi9cbiAgQ2hhcnRpc3QucHJvamVjdExlbmd0aCA9IGZ1bmN0aW9uIChheGlzTGVuZ3RoLCBsZW5ndGgsIGJvdW5kcykge1xuICAgIHJldHVybiBsZW5ndGggLyBib3VuZHMucmFuZ2UgKiBheGlzTGVuZ3RoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGhlaWdodCBvZiB0aGUgYXJlYSBpbiB0aGUgY2hhcnQgZm9yIHRoZSBkYXRhIHNlcmllc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gc3ZnIFRoZSBzdmcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBPYmplY3QgdGhhdCBjb250YWlucyBhbGwgdGhlIG9wdGlvbmFsIHZhbHVlcyBmb3IgdGhlIGNoYXJ0XG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGhlaWdodCBvZiB0aGUgYXJlYSBpbiB0aGUgY2hhcnQgZm9yIHRoZSBkYXRhIHNlcmllc1xuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0QXZhaWxhYmxlSGVpZ2h0ID0gZnVuY3Rpb24gKHN2Zywgb3B0aW9ucykge1xuICAgIHJldHVybiBNYXRoLm1heCgoQ2hhcnRpc3QucXVhbnRpdHkob3B0aW9ucy5oZWlnaHQpLnZhbHVlIHx8IHN2Zy5oZWlnaHQoKSkgLSAob3B0aW9ucy5jaGFydFBhZGRpbmcudG9wICsgIG9wdGlvbnMuY2hhcnRQYWRkaW5nLmJvdHRvbSkgLSBvcHRpb25zLmF4aXNYLm9mZnNldCwgMCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBoaWdoZXN0IGFuZCBsb3dlc3QgdmFsdWUgb2YgZGF0YSBhcnJheS4gVGhpcyBBcnJheSBjb250YWlucyB0aGUgZGF0YSB0aGF0IHdpbGwgYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRhdGEgVGhlIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBjaGFydCBvcHRpb25zXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkaW1lbnNpb24gQXhpcyBkaW1lbnNpb24gJ3gnIG9yICd5JyB1c2VkIHRvIGFjY2VzcyB0aGUgY29ycmVjdCB2YWx1ZSBhbmQgaGlnaCAvIGxvdyBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGhpZ2hlc3QgYW5kIGxvd2VzdCB2YWx1ZSB0aGF0IHdpbGwgYmUgdmlzdWFsaXplZCBvbiB0aGUgY2hhcnQuXG4gICAqL1xuICBDaGFydGlzdC5nZXRIaWdoTG93ID0gZnVuY3Rpb24gKGRhdGEsIG9wdGlvbnMsIGRpbWVuc2lvbikge1xuICAgIC8vIFRPRE86IFJlbW92ZSB3b3JrYXJvdW5kIGZvciBkZXByZWNhdGVkIGdsb2JhbCBoaWdoIC8gbG93IGNvbmZpZy4gQXhpcyBoaWdoIC8gbG93IGNvbmZpZ3VyYXRpb24gaXMgcHJlZmVycmVkXG4gICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucywgZGltZW5zaW9uID8gb3B0aW9uc1snYXhpcycgKyBkaW1lbnNpb24udG9VcHBlckNhc2UoKV0gOiB7fSk7XG5cbiAgICB2YXIgaGlnaExvdyA9IHtcbiAgICAgICAgaGlnaDogb3B0aW9ucy5oaWdoID09PSB1bmRlZmluZWQgPyAtTnVtYmVyLk1BWF9WQUxVRSA6ICtvcHRpb25zLmhpZ2gsXG4gICAgICAgIGxvdzogb3B0aW9ucy5sb3cgPT09IHVuZGVmaW5lZCA/IE51bWJlci5NQVhfVkFMVUUgOiArb3B0aW9ucy5sb3dcbiAgICAgIH07XG4gICAgdmFyIGZpbmRIaWdoID0gb3B0aW9ucy5oaWdoID09PSB1bmRlZmluZWQ7XG4gICAgdmFyIGZpbmRMb3cgPSBvcHRpb25zLmxvdyA9PT0gdW5kZWZpbmVkO1xuXG4gICAgLy8gRnVuY3Rpb24gdG8gcmVjdXJzaXZlbHkgd2FsayB0aHJvdWdoIGFycmF5cyBhbmQgZmluZCBoaWdoZXN0IGFuZCBsb3dlc3QgbnVtYmVyXG4gICAgZnVuY3Rpb24gcmVjdXJzaXZlSGlnaExvdyhkYXRhKSB7XG4gICAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcmVjdXJzaXZlSGlnaExvdyhkYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZGltZW5zaW9uID8gK2RhdGFbZGltZW5zaW9uXSA6ICtkYXRhO1xuXG4gICAgICAgIGlmIChmaW5kSGlnaCAmJiB2YWx1ZSA+IGhpZ2hMb3cuaGlnaCkge1xuICAgICAgICAgIGhpZ2hMb3cuaGlnaCA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbmRMb3cgJiYgdmFsdWUgPCBoaWdoTG93Lmxvdykge1xuICAgICAgICAgIGhpZ2hMb3cubG93ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdGFydCB0byBmaW5kIGhpZ2hlc3QgYW5kIGxvd2VzdCBudW1iZXIgcmVjdXJzaXZlbHlcbiAgICBpZihmaW5kSGlnaCB8fCBmaW5kTG93KSB7XG4gICAgICByZWN1cnNpdmVIaWdoTG93KGRhdGEpO1xuICAgIH1cblxuICAgIC8vIE92ZXJyaWRlcyBvZiBoaWdoIC8gbG93IGJhc2VkIG9uIHJlZmVyZW5jZSB2YWx1ZSwgaXQgd2lsbCBtYWtlIHN1cmUgdGhhdCB0aGUgaW52aXNpYmxlIHJlZmVyZW5jZSB2YWx1ZSBpc1xuICAgIC8vIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGNoYXJ0LiBUaGlzIGlzIHVzZWZ1bCB3aGVuIHRoZSBjaGFydCBhbHdheXMgbmVlZHMgdG8gY29udGFpbiB0aGUgcG9zaXRpb24gb2YgdGhlXG4gICAgLy8gaW52aXNpYmxlIHJlZmVyZW5jZSB2YWx1ZSBpbiB0aGUgdmlldyBpLmUuIGZvciBiaXBvbGFyIHNjYWxlcy5cbiAgICBpZiAob3B0aW9ucy5yZWZlcmVuY2VWYWx1ZSB8fCBvcHRpb25zLnJlZmVyZW5jZVZhbHVlID09PSAwKSB7XG4gICAgICBoaWdoTG93LmhpZ2ggPSBNYXRoLm1heChvcHRpb25zLnJlZmVyZW5jZVZhbHVlLCBoaWdoTG93LmhpZ2gpO1xuICAgICAgaGlnaExvdy5sb3cgPSBNYXRoLm1pbihvcHRpb25zLnJlZmVyZW5jZVZhbHVlLCBoaWdoTG93Lmxvdyk7XG4gICAgfVxuXG4gICAgLy8gSWYgaGlnaCBhbmQgbG93IGFyZSB0aGUgc2FtZSBiZWNhdXNlIG9mIG1pc2NvbmZpZ3VyYXRpb24gb3IgZmxhdCBkYXRhIChvbmx5IHRoZSBzYW1lIHZhbHVlKSB3ZSBuZWVkXG4gICAgLy8gdG8gc2V0IHRoZSBoaWdoIG9yIGxvdyB0byAwIGRlcGVuZGluZyBvbiB0aGUgcG9sYXJpdHlcbiAgICBpZiAoaGlnaExvdy5oaWdoIDw9IGhpZ2hMb3cubG93KSB7XG4gICAgICAvLyBJZiBib3RoIHZhbHVlcyBhcmUgMCB3ZSBzZXQgaGlnaCB0byAxXG4gICAgICBpZiAoaGlnaExvdy5sb3cgPT09IDApIHtcbiAgICAgICAgaGlnaExvdy5oaWdoID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoaGlnaExvdy5sb3cgPCAwKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgdGhlIHNhbWUgbmVnYXRpdmUgdmFsdWUgZm9yIHRoZSBib3VuZHMgd2Ugc2V0IGJvdW5kcy5oaWdoIHRvIDBcbiAgICAgICAgaGlnaExvdy5oaWdoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgdGhlIHNhbWUgcG9zaXRpdmUgdmFsdWUgZm9yIHRoZSBib3VuZHMgd2Ugc2V0IGJvdW5kcy5sb3cgdG8gMFxuICAgICAgICBoaWdoTG93LmxvdyA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGhpZ2hMb3c7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgdmFsdWUgaXMgYSB2YWxpZCBudW1iZXIgb3Igc3RyaW5nIHdpdGggYSBudW1iZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIENoYXJ0aXN0LmlzTnVtID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gIWlzTmFOKHZhbHVlKSAmJiBpc0Zpbml0ZSh2YWx1ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBvbiBhbGwgZmFsc2V5IHZhbHVlcyBleGNlcHQgdGhlIG51bWVyaWMgdmFsdWUgMC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgQ2hhcnRpc3QuaXNGYWxzZXlCdXRaZXJvID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gIXZhbHVlICYmIHZhbHVlICE9PSAwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbnVtYmVyIGlmIHRoZSBwYXNzZWQgcGFyYW1ldGVyIGlzIGEgdmFsaWQgbnVtYmVyIG9yIHRoZSBmdW5jdGlvbiB3aWxsIHJldHVybiB1bmRlZmluZWQuIE9uIGFsbCBvdGhlciB2YWx1ZXMgdGhhbiBhIHZhbGlkIG51bWJlciwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gaXNOYU4oK3ZhbHVlKSA/IHVuZGVmaW5lZCA6ICt2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyBhIHZhbHVlIGZyb20gYSBkaW1lbnNpb24gYHZhbHVlLnhgIG9yIGB2YWx1ZS55YCB3aGlsZSByZXR1cm5pbmcgdmFsdWUgZGlyZWN0bHkgaWYgaXQncyBhIHZhbGlkIG51bWVyaWMgdmFsdWUuIElmIHRoZSB2YWx1ZSBpcyBub3QgbnVtZXJpYyBhbmQgaXQncyBmYWxzZXkgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZGltZW5zaW9uXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0TXVsdGlWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBkaW1lbnNpb24pIHtcbiAgICBpZihDaGFydGlzdC5pc051bSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiArdmFsdWU7XG4gICAgfSBlbHNlIGlmKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWVbZGltZW5zaW9uIHx8ICd5J10gfHwgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQb2xsYXJkIFJobyBBbGdvcml0aG0gdG8gZmluZCBzbWFsbGVzdCBmYWN0b3Igb2YgYW4gaW50ZWdlciB2YWx1ZS4gVGhlcmUgYXJlIG1vcmUgZWZmaWNpZW50IGFsZ29yaXRobXMgZm9yIGZhY3Rvcml6YXRpb24sIGJ1dCB0aGlzIG9uZSBpcyBxdWl0ZSBlZmZpY2llbnQgYW5kIG5vdCBzbyBjb21wbGV4LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gbnVtIEFuIGludGVnZXIgbnVtYmVyIHdoZXJlIHRoZSBzbWFsbGVzdCBmYWN0b3Igc2hvdWxkIGJlIHNlYXJjaGVkIGZvclxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgc21hbGxlc3QgaW50ZWdlciBmYWN0b3Igb2YgdGhlIHBhcmFtZXRlciBudW0uXG4gICAqL1xuICBDaGFydGlzdC5yaG8gPSBmdW5jdGlvbihudW0pIHtcbiAgICBpZihudW0gPT09IDEpIHtcbiAgICAgIHJldHVybiBudW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2NkKHAsIHEpIHtcbiAgICAgIGlmIChwICUgcSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnY2QocSwgcCAlIHEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGYoeCkge1xuICAgICAgcmV0dXJuIHggKiB4ICsgMTtcbiAgICB9XG5cbiAgICB2YXIgeDEgPSAyLCB4MiA9IDIsIGRpdmlzb3I7XG4gICAgaWYgKG51bSAlIDIgPT09IDApIHtcbiAgICAgIHJldHVybiAyO1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIHgxID0gZih4MSkgJSBudW07XG4gICAgICB4MiA9IGYoZih4MikpICUgbnVtO1xuICAgICAgZGl2aXNvciA9IGdjZChNYXRoLmFicyh4MSAtIHgyKSwgbnVtKTtcbiAgICB9IHdoaWxlIChkaXZpc29yID09PSAxKTtcblxuICAgIHJldHVybiBkaXZpc29yO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYW5kIHJldHJpZXZlIGFsbCB0aGUgYm91bmRzIGZvciB0aGUgY2hhcnQgYW5kIHJldHVybiB0aGVtIGluIG9uZSBhcnJheVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gYXhpc0xlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBBeGlzIHVzZWQgZm9yXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoaWdoTG93IEFuIG9iamVjdCBjb250YWluaW5nIGEgaGlnaCBhbmQgbG93IHByb3BlcnR5IGluZGljYXRpbmcgdGhlIHZhbHVlIHJhbmdlIG9mIHRoZSBjaGFydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlTWluU3BhY2UgVGhlIG1pbmltdW0gcHJvamVjdGVkIGxlbmd0aCBhIHN0ZXAgc2hvdWxkIHJlc3VsdCBpblxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9ubHlJbnRlZ2VyXG4gICAqIEByZXR1cm4ge09iamVjdH0gQWxsIHRoZSB2YWx1ZXMgdG8gc2V0IHRoZSBib3VuZHMgb2YgdGhlIGNoYXJ0XG4gICAqL1xuICBDaGFydGlzdC5nZXRCb3VuZHMgPSBmdW5jdGlvbiAoYXhpc0xlbmd0aCwgaGlnaExvdywgc2NhbGVNaW5TcGFjZSwgb25seUludGVnZXIpIHtcbiAgICB2YXIgaSxcbiAgICAgIG9wdGltaXphdGlvbkNvdW50ZXIgPSAwLFxuICAgICAgbmV3TWluLFxuICAgICAgbmV3TWF4LFxuICAgICAgYm91bmRzID0ge1xuICAgICAgICBoaWdoOiBoaWdoTG93LmhpZ2gsXG4gICAgICAgIGxvdzogaGlnaExvdy5sb3dcbiAgICAgIH07XG5cbiAgICBib3VuZHMudmFsdWVSYW5nZSA9IGJvdW5kcy5oaWdoIC0gYm91bmRzLmxvdztcbiAgICBib3VuZHMub29tID0gQ2hhcnRpc3Qub3JkZXJPZk1hZ25pdHVkZShib3VuZHMudmFsdWVSYW5nZSk7XG4gICAgYm91bmRzLnN0ZXAgPSBNYXRoLnBvdygxMCwgYm91bmRzLm9vbSk7XG4gICAgYm91bmRzLm1pbiA9IE1hdGguZmxvb3IoYm91bmRzLmxvdyAvIGJvdW5kcy5zdGVwKSAqIGJvdW5kcy5zdGVwO1xuICAgIGJvdW5kcy5tYXggPSBNYXRoLmNlaWwoYm91bmRzLmhpZ2ggLyBib3VuZHMuc3RlcCkgKiBib3VuZHMuc3RlcDtcbiAgICBib3VuZHMucmFuZ2UgPSBib3VuZHMubWF4IC0gYm91bmRzLm1pbjtcbiAgICBib3VuZHMubnVtYmVyT2ZTdGVwcyA9IE1hdGgucm91bmQoYm91bmRzLnJhbmdlIC8gYm91bmRzLnN0ZXApO1xuXG4gICAgLy8gT3B0aW1pemUgc2NhbGUgc3RlcCBieSBjaGVja2luZyBpZiBzdWJkaXZpc2lvbiBpcyBwb3NzaWJsZSBiYXNlZCBvbiBob3Jpem9udGFsR3JpZE1pblNwYWNlXG4gICAgLy8gSWYgd2UgYXJlIGFscmVhZHkgYmVsb3cgdGhlIHNjYWxlTWluU3BhY2UgdmFsdWUgd2Ugd2lsbCBzY2FsZSB1cFxuICAgIHZhciBsZW5ndGggPSBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIGJvdW5kcy5zdGVwLCBib3VuZHMpO1xuICAgIHZhciBzY2FsZVVwID0gbGVuZ3RoIDwgc2NhbGVNaW5TcGFjZTtcbiAgICB2YXIgc21hbGxlc3RGYWN0b3IgPSBvbmx5SW50ZWdlciA/IENoYXJ0aXN0LnJobyhib3VuZHMucmFuZ2UpIDogMDtcblxuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHdlIHNob3VsZCBvbmx5IHVzZSBpbnRlZ2VyIHN0ZXBzIGFuZCBpZiBzdGVwIDEgaXMgc3RpbGwgbGFyZ2VyIHRoYW4gc2NhbGVNaW5TcGFjZSBzbyB3ZSBjYW4gdXNlIDFcbiAgICBpZihvbmx5SW50ZWdlciAmJiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIDEsIGJvdW5kcykgPj0gc2NhbGVNaW5TcGFjZSkge1xuICAgICAgYm91bmRzLnN0ZXAgPSAxO1xuICAgIH0gZWxzZSBpZihvbmx5SW50ZWdlciAmJiBzbWFsbGVzdEZhY3RvciA8IGJvdW5kcy5zdGVwICYmIENoYXJ0aXN0LnByb2plY3RMZW5ndGgoYXhpc0xlbmd0aCwgc21hbGxlc3RGYWN0b3IsIGJvdW5kcykgPj0gc2NhbGVNaW5TcGFjZSkge1xuICAgICAgLy8gSWYgc3RlcCAxIHdhcyB0b28gc21hbGwsIHdlIGNhbiB0cnkgdGhlIHNtYWxsZXN0IGZhY3RvciBvZiByYW5nZVxuICAgICAgLy8gSWYgdGhlIHNtYWxsZXN0IGZhY3RvciBpcyBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgYm91bmRzLnN0ZXAgYW5kIHRoZSBwcm9qZWN0ZWQgbGVuZ3RoIG9mIHNtYWxsZXN0IGZhY3RvclxuICAgICAgLy8gaXMgbGFyZ2VyIHRoYW4gdGhlIHNjYWxlTWluU3BhY2Ugd2Ugc2hvdWxkIGdvIGZvciBpdC5cbiAgICAgIGJvdW5kcy5zdGVwID0gc21hbGxlc3RGYWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRyeWluZyB0byBkaXZpZGUgb3IgbXVsdGlwbHkgYnkgMiBhbmQgZmluZCB0aGUgYmVzdCBzdGVwIHZhbHVlXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoc2NhbGVVcCAmJiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIGJvdW5kcy5zdGVwLCBib3VuZHMpIDw9IHNjYWxlTWluU3BhY2UpIHtcbiAgICAgICAgICBib3VuZHMuc3RlcCAqPSAyO1xuICAgICAgICB9IGVsc2UgaWYgKCFzY2FsZVVwICYmIENoYXJ0aXN0LnByb2plY3RMZW5ndGgoYXhpc0xlbmd0aCwgYm91bmRzLnN0ZXAgLyAyLCBib3VuZHMpID49IHNjYWxlTWluU3BhY2UpIHtcbiAgICAgICAgICBib3VuZHMuc3RlcCAvPSAyO1xuICAgICAgICAgIGlmKG9ubHlJbnRlZ2VyICYmIGJvdW5kcy5zdGVwICUgMSAhPT0gMCkge1xuICAgICAgICAgICAgYm91bmRzLnN0ZXAgKj0gMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9wdGltaXphdGlvbkNvdW50ZXIrKyA+IDEwMDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2VlZGVkIG1heGltdW0gbnVtYmVyIG9mIGl0ZXJhdGlvbnMgd2hpbGUgb3B0aW1pemluZyBzY2FsZSBzdGVwIScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTmFycm93IG1pbiBhbmQgbWF4IGJhc2VkIG9uIG5ldyBzdGVwXG4gICAgbmV3TWluID0gYm91bmRzLm1pbjtcbiAgICBuZXdNYXggPSBib3VuZHMubWF4O1xuICAgIHdoaWxlKG5ld01pbiArIGJvdW5kcy5zdGVwIDw9IGJvdW5kcy5sb3cpIHtcbiAgICAgIG5ld01pbiArPSBib3VuZHMuc3RlcDtcbiAgICB9XG4gICAgd2hpbGUobmV3TWF4IC0gYm91bmRzLnN0ZXAgPj0gYm91bmRzLmhpZ2gpIHtcbiAgICAgIG5ld01heCAtPSBib3VuZHMuc3RlcDtcbiAgICB9XG4gICAgYm91bmRzLm1pbiA9IG5ld01pbjtcbiAgICBib3VuZHMubWF4ID0gbmV3TWF4O1xuICAgIGJvdW5kcy5yYW5nZSA9IGJvdW5kcy5tYXggLSBib3VuZHMubWluO1xuXG4gICAgYm91bmRzLnZhbHVlcyA9IFtdO1xuICAgIGZvciAoaSA9IGJvdW5kcy5taW47IGkgPD0gYm91bmRzLm1heDsgaSArPSBib3VuZHMuc3RlcCkge1xuICAgICAgYm91bmRzLnZhbHVlcy5wdXNoKENoYXJ0aXN0LnJvdW5kV2l0aFByZWNpc2lvbihpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGNhcnRlc2lhbiBjb29yZGluYXRlcyBvZiBwb2xhciBjb29yZGluYXRlc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gY2VudGVyWCBYLWF4aXMgY29vcmRpbmF0ZXMgb2YgY2VudGVyIHBvaW50IG9mIGNpcmNsZSBzZWdtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjZW50ZXJZIFgtYXhpcyBjb29yZGluYXRlcyBvZiBjZW50ZXIgcG9pbnQgb2YgY2lyY2xlIHNlZ21lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgY2lyY2xlIHNlZ21lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuZ2xlSW5EZWdyZWVzIEFuZ2xlIG9mIGNpcmNsZSBzZWdtZW50IGluIGRlZ3JlZXNcbiAgICogQHJldHVybiB7e3g6TnVtYmVyLCB5Ok51bWJlcn19IENvb3JkaW5hdGVzIG9mIHBvaW50IG9uIGNpcmN1bWZlcmVuY2VcbiAgICovXG4gIENoYXJ0aXN0LnBvbGFyVG9DYXJ0ZXNpYW4gPSBmdW5jdGlvbiAoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBhbmdsZUluRGVncmVlcykge1xuICAgIHZhciBhbmdsZUluUmFkaWFucyA9IChhbmdsZUluRGVncmVlcyAtIDkwKSAqIE1hdGguUEkgLyAxODAuMDtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBjZW50ZXJYICsgKHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKSksXG4gICAgICB5OiBjZW50ZXJZICsgKHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKSlcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGNoYXJ0IGRyYXdpbmcgcmVjdGFuZ2xlIChhcmVhIHdoZXJlIGNoYXJ0IGlzIGRyYXduKSB4MSx5MSA9IGJvdHRvbSBsZWZ0IC8geDIseTIgPSB0b3AgcmlnaHRcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IHN2ZyBUaGUgc3ZnIGVsZW1lbnQgZm9yIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgT2JqZWN0IHRoYXQgY29udGFpbnMgYWxsIHRoZSBvcHRpb25hbCB2YWx1ZXMgZm9yIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge051bWJlcn0gW2ZhbGxiYWNrUGFkZGluZ10gVGhlIGZhbGxiYWNrIHBhZGRpbmcgaWYgcGFydGlhbCBwYWRkaW5nIG9iamVjdHMgYXJlIHVzZWRcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2hhcnQgcmVjdGFuZ2xlcyBjb29yZGluYXRlcyBpbnNpZGUgdGhlIHN2ZyBlbGVtZW50IHBsdXMgdGhlIHJlY3RhbmdsZXMgbWVhc3VyZW1lbnRzXG4gICAqL1xuICBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QgPSBmdW5jdGlvbiAoc3ZnLCBvcHRpb25zLCBmYWxsYmFja1BhZGRpbmcpIHtcbiAgICB2YXIgaGFzQXhpcyA9ICEhKG9wdGlvbnMuYXhpc1ggfHwgb3B0aW9ucy5heGlzWSk7XG4gICAgdmFyIHlBeGlzT2Zmc2V0ID0gaGFzQXhpcyA/IG9wdGlvbnMuYXhpc1kub2Zmc2V0IDogMDtcbiAgICB2YXIgeEF4aXNPZmZzZXQgPSBoYXNBeGlzID8gb3B0aW9ucy5heGlzWC5vZmZzZXQgOiAwO1xuICAgIC8vIElmIHdpZHRoIG9yIGhlaWdodCByZXN1bHRzIGluIGludmFsaWQgdmFsdWUgKGluY2x1ZGluZyAwKSB3ZSBmYWxsYmFjayB0byB0aGUgdW5pdGxlc3Mgc2V0dGluZ3Mgb3IgZXZlbiAwXG4gICAgdmFyIHdpZHRoID0gc3ZnLndpZHRoKCkgfHwgQ2hhcnRpc3QucXVhbnRpdHkob3B0aW9ucy53aWR0aCkudmFsdWUgfHwgMDtcbiAgICB2YXIgaGVpZ2h0ID0gc3ZnLmhlaWdodCgpIHx8IENoYXJ0aXN0LnF1YW50aXR5KG9wdGlvbnMuaGVpZ2h0KS52YWx1ZSB8fCAwO1xuICAgIHZhciBub3JtYWxpemVkUGFkZGluZyA9IENoYXJ0aXN0Lm5vcm1hbGl6ZVBhZGRpbmcob3B0aW9ucy5jaGFydFBhZGRpbmcsIGZhbGxiYWNrUGFkZGluZyk7XG5cbiAgICAvLyBJZiBzZXR0aW5ncyB3ZXJlIHRvIHNtYWxsIHRvIGNvcGUgd2l0aCBvZmZzZXQgKGxlZ2FjeSkgYW5kIHBhZGRpbmcsIHdlJ2xsIGFkanVzdFxuICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIHlBeGlzT2Zmc2V0ICsgbm9ybWFsaXplZFBhZGRpbmcubGVmdCArIG5vcm1hbGl6ZWRQYWRkaW5nLnJpZ2h0KTtcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIHhBeGlzT2Zmc2V0ICsgbm9ybWFsaXplZFBhZGRpbmcudG9wICsgbm9ybWFsaXplZFBhZGRpbmcuYm90dG9tKTtcblxuICAgIHZhciBjaGFydFJlY3QgPSB7XG4gICAgICBwYWRkaW5nOiBub3JtYWxpemVkUGFkZGluZyxcbiAgICAgIHdpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLngyIC0gdGhpcy54MTtcbiAgICAgIH0sXG4gICAgICBoZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTEgLSB0aGlzLnkyO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZihoYXNBeGlzKSB7XG4gICAgICBpZiAob3B0aW9ucy5heGlzWC5wb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICBjaGFydFJlY3QueTIgPSBub3JtYWxpemVkUGFkZGluZy50b3AgKyB4QXhpc09mZnNldDtcbiAgICAgICAgY2hhcnRSZWN0LnkxID0gTWF0aC5tYXgoaGVpZ2h0IC0gbm9ybWFsaXplZFBhZGRpbmcuYm90dG9tLCBjaGFydFJlY3QueTIgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJ0UmVjdC55MiA9IG5vcm1hbGl6ZWRQYWRkaW5nLnRvcDtcbiAgICAgICAgY2hhcnRSZWN0LnkxID0gTWF0aC5tYXgoaGVpZ2h0IC0gbm9ybWFsaXplZFBhZGRpbmcuYm90dG9tIC0geEF4aXNPZmZzZXQsIGNoYXJ0UmVjdC55MiArIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5heGlzWS5wb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICBjaGFydFJlY3QueDEgPSBub3JtYWxpemVkUGFkZGluZy5sZWZ0ICsgeUF4aXNPZmZzZXQ7XG4gICAgICAgIGNoYXJ0UmVjdC54MiA9IE1hdGgubWF4KHdpZHRoIC0gbm9ybWFsaXplZFBhZGRpbmcucmlnaHQsIGNoYXJ0UmVjdC54MSArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhcnRSZWN0LngxID0gbm9ybWFsaXplZFBhZGRpbmcubGVmdDtcbiAgICAgICAgY2hhcnRSZWN0LngyID0gTWF0aC5tYXgod2lkdGggLSBub3JtYWxpemVkUGFkZGluZy5yaWdodCAtIHlBeGlzT2Zmc2V0LCBjaGFydFJlY3QueDEgKyAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2hhcnRSZWN0LngxID0gbm9ybWFsaXplZFBhZGRpbmcubGVmdDtcbiAgICAgIGNoYXJ0UmVjdC54MiA9IE1hdGgubWF4KHdpZHRoIC0gbm9ybWFsaXplZFBhZGRpbmcucmlnaHQsIGNoYXJ0UmVjdC54MSArIDEpO1xuICAgICAgY2hhcnRSZWN0LnkyID0gbm9ybWFsaXplZFBhZGRpbmcudG9wO1xuICAgICAgY2hhcnRSZWN0LnkxID0gTWF0aC5tYXgoaGVpZ2h0IC0gbm9ybWFsaXplZFBhZGRpbmcuYm90dG9tLCBjaGFydFJlY3QueTIgKyAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhcnRSZWN0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZ3JpZCBsaW5lIGJhc2VkIG9uIGEgcHJvamVjdGVkIHZhbHVlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gcG9zaXRpb25cbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBheGlzXG4gICAqIEBwYXJhbSBvZmZzZXRcbiAgICogQHBhcmFtIGxlbmd0aFxuICAgKiBAcGFyYW0gZ3JvdXBcbiAgICogQHBhcmFtIGNsYXNzZXNcbiAgICogQHBhcmFtIGV2ZW50RW1pdHRlclxuICAgKi9cbiAgQ2hhcnRpc3QuY3JlYXRlR3JpZCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBpbmRleCwgYXhpcywgb2Zmc2V0LCBsZW5ndGgsIGdyb3VwLCBjbGFzc2VzLCBldmVudEVtaXR0ZXIpIHtcbiAgICB2YXIgcG9zaXRpb25hbERhdGEgPSB7fTtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLnBvcyArICcxJ10gPSBwb3NpdGlvbjtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLnBvcyArICcyJ10gPSBwb3NpdGlvbjtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMSddID0gb2Zmc2V0O1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMuY291bnRlclVuaXRzLnBvcyArICcyJ10gPSBvZmZzZXQgKyBsZW5ndGg7XG5cbiAgICB2YXIgZ3JpZEVsZW1lbnQgPSBncm91cC5lbGVtKCdsaW5lJywgcG9zaXRpb25hbERhdGEsIGNsYXNzZXMuam9pbignICcpKTtcblxuICAgIC8vIEV2ZW50IGZvciBncmlkIGRyYXdcbiAgICBldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsXG4gICAgICBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICB0eXBlOiAnZ3JpZCcsXG4gICAgICAgIGF4aXM6IGF4aXMsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgZ3JvdXA6IGdyb3VwLFxuICAgICAgICBlbGVtZW50OiBncmlkRWxlbWVudFxuICAgICAgfSwgcG9zaXRpb25hbERhdGEpXG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxhYmVsIGJhc2VkIG9uIGEgcHJvamVjdGVkIHZhbHVlIGFuZCBhbiBheGlzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gcG9zaXRpb25cbiAgICogQHBhcmFtIGxlbmd0aFxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGxhYmVsc1xuICAgKiBAcGFyYW0gYXhpc1xuICAgKiBAcGFyYW0gYXhpc09mZnNldFxuICAgKiBAcGFyYW0gbGFiZWxPZmZzZXRcbiAgICogQHBhcmFtIGdyb3VwXG4gICAqIEBwYXJhbSBjbGFzc2VzXG4gICAqIEBwYXJhbSB1c2VGb3JlaWduT2JqZWN0XG4gICAqIEBwYXJhbSBldmVudEVtaXR0ZXJcbiAgICovXG4gIENoYXJ0aXN0LmNyZWF0ZUxhYmVsID0gZnVuY3Rpb24ocG9zaXRpb24sIGxlbmd0aCwgaW5kZXgsIGxhYmVscywgYXhpcywgYXhpc09mZnNldCwgbGFiZWxPZmZzZXQsIGdyb3VwLCBjbGFzc2VzLCB1c2VGb3JlaWduT2JqZWN0LCBldmVudEVtaXR0ZXIpIHtcbiAgICB2YXIgbGFiZWxFbGVtZW50O1xuICAgIHZhciBwb3NpdGlvbmFsRGF0YSA9IHt9O1xuXG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5wb3NdID0gcG9zaXRpb24gKyBsYWJlbE9mZnNldFtheGlzLnVuaXRzLnBvc107XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMucG9zXSA9IGxhYmVsT2Zmc2V0W2F4aXMuY291bnRlclVuaXRzLnBvc107XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5sZW5dID0gbGVuZ3RoO1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMuY291bnRlclVuaXRzLmxlbl0gPSBheGlzT2Zmc2V0IC0gMTA7XG5cbiAgICBpZih1c2VGb3JlaWduT2JqZWN0KSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIHNldCB3aWR0aCBhbmQgaGVpZ2h0IGV4cGxpY2l0bHkgdG8gcHggYXMgc3BhbiB3aWxsIG5vdCBleHBhbmQgd2l0aCB3aWR0aCBhbmQgaGVpZ2h0IGJlaW5nXG4gICAgICAvLyAxMDAlIGluIGFsbCBicm93c2Vyc1xuICAgICAgdmFyIGNvbnRlbnQgPSAnPHNwYW4gY2xhc3M9XCInICsgY2xhc3Nlcy5qb2luKCcgJykgKyAnXCIgc3R5bGU9XCInICtcbiAgICAgICAgYXhpcy51bml0cy5sZW4gKyAnOiAnICsgTWF0aC5yb3VuZChwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLmxlbl0pICsgJ3B4OyAnICtcbiAgICAgICAgYXhpcy5jb3VudGVyVW5pdHMubGVuICsgJzogJyArIE1hdGgucm91bmQocG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMubGVuXSkgKyAncHhcIj4nICtcbiAgICAgICAgbGFiZWxzW2luZGV4XSArICc8L3NwYW4+JztcblxuICAgICAgbGFiZWxFbGVtZW50ID0gZ3JvdXAuZm9yZWlnbk9iamVjdChjb250ZW50LCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICBzdHlsZTogJ292ZXJmbG93OiB2aXNpYmxlOydcbiAgICAgIH0sIHBvc2l0aW9uYWxEYXRhKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhYmVsRWxlbWVudCA9IGdyb3VwLmVsZW0oJ3RleHQnLCBwb3NpdGlvbmFsRGF0YSwgY2xhc3Nlcy5qb2luKCcgJykpLnRleHQobGFiZWxzW2luZGV4XSk7XG4gICAgfVxuXG4gICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgdHlwZTogJ2xhYmVsJyxcbiAgICAgIGF4aXM6IGF4aXMsXG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgICBncm91cDogZ3JvdXAsXG4gICAgICBlbGVtZW50OiBsYWJlbEVsZW1lbnQsXG4gICAgICB0ZXh0OiBsYWJlbHNbaW5kZXhdXG4gICAgfSwgcG9zaXRpb25hbERhdGEpKTtcbiAgfTtcblxuICAvKipcbiAgICogSGVscGVyIHRvIHJlYWQgc2VyaWVzIHNwZWNpZmljIG9wdGlvbnMgZnJvbSBvcHRpb25zIG9iamVjdC4gSXQgYXV0b21hdGljYWxseSBmYWxscyBiYWNrIHRvIHRoZSBnbG9iYWwgb3B0aW9uIGlmXG4gICAqIHRoZXJlIGlzIG5vIG9wdGlvbiBpbiB0aGUgc2VyaWVzIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzZXJpZXMgU2VyaWVzIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBDaGFydGlzdCBvcHRpb25zIG9iamVjdFxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBvcHRpb25zIGtleSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIG9idGFpbiB0aGUgb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIENoYXJ0aXN0LmdldFNlcmllc09wdGlvbiA9IGZ1bmN0aW9uKHNlcmllcywgb3B0aW9ucywga2V5KSB7XG4gICAgaWYoc2VyaWVzLm5hbWUgJiYgb3B0aW9ucy5zZXJpZXMgJiYgb3B0aW9ucy5zZXJpZXNbc2VyaWVzLm5hbWVdKSB7XG4gICAgICB2YXIgc2VyaWVzT3B0aW9ucyA9IG9wdGlvbnMuc2VyaWVzW3Nlcmllcy5uYW1lXTtcbiAgICAgIHJldHVybiBzZXJpZXNPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkgPyBzZXJpZXNPcHRpb25zW2tleV0gOiBvcHRpb25zW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zW2tleV07XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBvcHRpb25zIGhhbmRsaW5nIGZ1bmN0aW9uYWxpdHkgd2l0aCBjYWxsYmFjayBmb3Igb3B0aW9ucyBjaGFuZ2VzIHRyaWdnZXJlZCBieSByZXNwb25zaXZlIG9wdGlvbnMgYW5kIG1lZGlhIHF1ZXJ5IG1hdGNoZXNcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBzZXQgYnkgdXNlclxuICAgKiBAcGFyYW0ge0FycmF5fSByZXNwb25zaXZlT3B0aW9ucyBPcHRpb25hbCBmdW5jdGlvbnMgdG8gYWRkIHJlc3BvbnNpdmUgYmVoYXZpb3IgdG8gY2hhcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RW1pdHRlciBUaGUgZXZlbnQgZW1pdHRlciB0aGF0IHdpbGwgYmUgdXNlZCB0byBlbWl0IHRoZSBvcHRpb25zIGNoYW5nZWQgZXZlbnRzXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNvbnNvbGlkYXRlZCBvcHRpb25zIG9iamVjdCBmcm9tIHRoZSBkZWZhdWx0cywgYmFzZSBhbmQgbWF0Y2hpbmcgcmVzcG9uc2l2ZSBvcHRpb25zXG4gICAqL1xuICBDaGFydGlzdC5vcHRpb25zUHJvdmlkZXIgPSBmdW5jdGlvbiAob3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMsIGV2ZW50RW1pdHRlcikge1xuICAgIHZhciBiYXNlT3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucyksXG4gICAgICBjdXJyZW50T3B0aW9ucyxcbiAgICAgIG1lZGlhUXVlcnlMaXN0ZW5lcnMgPSBbXSxcbiAgICAgIGk7XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVDdXJyZW50T3B0aW9ucyhwcmV2ZW50Q2hhbmdlZEV2ZW50KSB7XG4gICAgICB2YXIgcHJldmlvdXNPcHRpb25zID0gY3VycmVudE9wdGlvbnM7XG4gICAgICBjdXJyZW50T3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgYmFzZU9wdGlvbnMpO1xuXG4gICAgICBpZiAocmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNpdmVPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIG1xbCA9IHdpbmRvdy5tYXRjaE1lZGlhKHJlc3BvbnNpdmVPcHRpb25zW2ldWzBdKTtcbiAgICAgICAgICBpZiAobXFsLm1hdGNoZXMpIHtcbiAgICAgICAgICAgIGN1cnJlbnRPcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKGN1cnJlbnRPcHRpb25zLCByZXNwb25zaXZlT3B0aW9uc1tpXVsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGV2ZW50RW1pdHRlciAmJiAhcHJldmVudENoYW5nZWRFdmVudCkge1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdCgnb3B0aW9uc0NoYW5nZWQnLCB7XG4gICAgICAgICAgcHJldmlvdXNPcHRpb25zOiBwcmV2aW91c09wdGlvbnMsXG4gICAgICAgICAgY3VycmVudE9wdGlvbnM6IGN1cnJlbnRPcHRpb25zXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnMoKSB7XG4gICAgICBtZWRpYVF1ZXJ5TGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obXFsKSB7XG4gICAgICAgIG1xbC5yZW1vdmVMaXN0ZW5lcih1cGRhdGVDdXJyZW50T3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5tYXRjaE1lZGlhKSB7XG4gICAgICB0aHJvdyAnd2luZG93Lm1hdGNoTWVkaWEgbm90IGZvdW5kISBNYWtlIHN1cmUgeW91XFwncmUgdXNpbmcgYSBwb2x5ZmlsbC4nO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2l2ZU9wdGlvbnMpIHtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNpdmVPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBtcWwgPSB3aW5kb3cubWF0Y2hNZWRpYShyZXNwb25zaXZlT3B0aW9uc1tpXVswXSk7XG4gICAgICAgIG1xbC5hZGRMaXN0ZW5lcih1cGRhdGVDdXJyZW50T3B0aW9ucyk7XG4gICAgICAgIG1lZGlhUXVlcnlMaXN0ZW5lcnMucHVzaChtcWwpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBFeGVjdXRlIGluaXRpYWxseSBzbyB3ZSBnZXQgdGhlIGNvcnJlY3Qgb3B0aW9uc1xuICAgIHVwZGF0ZUN1cnJlbnRPcHRpb25zKHRydWUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnM6IHJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnMsXG4gICAgICBnZXRDdXJyZW50T3B0aW9uczogZnVuY3Rpb24gZ2V0Q3VycmVudE9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiBDaGFydGlzdC5leHRlbmQoe30sIGN1cnJlbnRPcHRpb25zKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBDaGFydGlzdCBwYXRoIGludGVycG9sYXRpb24gZnVuY3Rpb25zLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbiA9IHt9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGludGVycG9sYXRpb24gZnVuY3Rpb24gZG9lcyBub3Qgc21vb3RoIHRoZSBwYXRoIGFuZCB0aGUgcmVzdWx0IGlzIG9ubHkgY29udGFpbmluZyBsaW5lcyBhbmQgbm8gY3VydmVzLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgKiAgIHNlcmllczogW1sxLCAyLCA4LCAxLCA3XV1cbiAgICogfSwge1xuICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZSh7XG4gICAqICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKi9cbiAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICB9O1xuICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gbm9uZShwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSkge1xuICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKTtcbiAgICAgIHZhciBob2xlID0gdHJ1ZTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIgY3VyclggPSBwYXRoQ29vcmRpbmF0ZXNbaV07XG4gICAgICAgIHZhciBjdXJyWSA9IHBhdGhDb29yZGluYXRlc1tpICsgMV07XG4gICAgICAgIHZhciBjdXJyRGF0YSA9IHZhbHVlRGF0YVtpIC8gMl07XG5cbiAgICAgICAgaWYoY3VyckRhdGEudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgaWYoaG9sZSkge1xuICAgICAgICAgICAgcGF0aC5tb3ZlKGN1cnJYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aC5saW5lKGN1cnJYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBob2xlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZighb3B0aW9ucy5maWxsSG9sZXMpIHtcbiAgICAgICAgICBob2xlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaW1wbGUgc21vb3RoaW5nIGNyZWF0ZXMgaG9yaXpvbnRhbCBoYW5kbGVzIHRoYXQgYXJlIHBvc2l0aW9uZWQgd2l0aCBhIGZyYWN0aW9uIG9mIHRoZSBsZW5ndGggYmV0d2VlbiB0d28gZGF0YSBwb2ludHMuIFlvdSBjYW4gdXNlIHRoZSBkaXZpc29yIG9wdGlvbiB0byBzcGVjaWZ5IHRoZSBhbW91bnQgb2Ygc21vb3RoaW5nLlxuICAgKlxuICAgKiBTaW1wbGUgc21vb3RoaW5nIGNhbiBiZSB1c2VkIGluc3RlYWQgb2YgYENoYXJ0aXN0LlNtb290aGluZy5jYXJkaW5hbGAgaWYgeW91J2QgbGlrZSB0byBnZXQgcmlkIG9mIHRoZSBhcnRpZmFjdHMgaXQgcHJvZHVjZXMgc29tZXRpbWVzLiBTaW1wbGUgc21vb3RoaW5nIHByb2R1Y2VzIGxlc3MgZmxvd2luZyBsaW5lcyBidXQgaXMgYWNjdXJhdGUgYnkgaGl0dGluZyB0aGUgcG9pbnRzIGFuZCBpdCBhbHNvIGRvZXNuJ3Qgc3dpbmcgYmVsb3cgb3IgYWJvdmUgdGhlIGdpdmVuIGRhdGEgcG9pbnQuXG4gICAqXG4gICAqIEFsbCBzbW9vdGhpbmcgZnVuY3Rpb25zIHdpdGhpbiBDaGFydGlzdCBhcmUgZmFjdG9yeSBmdW5jdGlvbnMgdGhhdCBhY2NlcHQgYW4gb3B0aW9ucyBwYXJhbWV0ZXIuIFRoZSBzaW1wbGUgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBhY2NlcHRzIG9uZSBjb25maWd1cmF0aW9uIHBhcmFtZXRlciBgZGl2aXNvcmAsIGJldHdlZW4gMSBhbmQg4oieLCB3aGljaCBjb250cm9scyB0aGUgc21vb3RoaW5nIGNoYXJhY3RlcmlzdGljcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1XSxcbiAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAqIH0sIHtcbiAgICogICBsaW5lU21vb3RoOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLnNpbXBsZSh7XG4gICAqICAgICBkaXZpc29yOiAyLFxuICAgKiAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgb3B0aW9ucyBvZiB0aGUgc2ltcGxlIGludGVycG9sYXRpb24gZmFjdG9yeSBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLnNpbXBsZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBkaXZpc29yOiAyLFxuICAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgIH07XG4gICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgdmFyIGQgPSAxIC8gTWF0aC5tYXgoMSwgb3B0aW9ucy5kaXZpc29yKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBzaW1wbGUocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpIHtcbiAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCk7XG4gICAgICB2YXIgcHJldlgsIHByZXZZLCBwcmV2RGF0YTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIgY3VyclggPSBwYXRoQ29vcmRpbmF0ZXNbaV07XG4gICAgICAgIHZhciBjdXJyWSA9IHBhdGhDb29yZGluYXRlc1tpICsgMV07XG4gICAgICAgIHZhciBsZW5ndGggPSAoY3VyclggLSBwcmV2WCkgKiBkO1xuICAgICAgICB2YXIgY3VyckRhdGEgPSB2YWx1ZURhdGFbaSAvIDJdO1xuXG4gICAgICAgIGlmKGN1cnJEYXRhLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgIGlmKHByZXZEYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHBhdGgubW92ZShjdXJyWCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGguY3VydmUoXG4gICAgICAgICAgICAgIHByZXZYICsgbGVuZ3RoLFxuICAgICAgICAgICAgICBwcmV2WSxcbiAgICAgICAgICAgICAgY3VyclggLSBsZW5ndGgsXG4gICAgICAgICAgICAgIGN1cnJZLFxuICAgICAgICAgICAgICBjdXJyWCxcbiAgICAgICAgICAgICAgY3VyclksXG4gICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICBjdXJyRGF0YVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwcmV2WCA9IGN1cnJYO1xuICAgICAgICAgIHByZXZZID0gY3Vyclk7XG4gICAgICAgICAgcHJldkRhdGEgPSBjdXJyRGF0YTtcbiAgICAgICAgfSBlbHNlIGlmKCFvcHRpb25zLmZpbGxIb2xlcykge1xuICAgICAgICAgIHByZXZYID0gY3VyclggPSBwcmV2RGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYXJkaW5hbCAvIENhdG11bGwtUm9tZSBzcGxpbmUgaW50ZXJwb2xhdGlvbiBpcyB0aGUgZGVmYXVsdCBzbW9vdGhpbmcgZnVuY3Rpb24gaW4gQ2hhcnRpc3QuIEl0IHByb2R1Y2VzIG5pY2UgcmVzdWx0cyB3aGVyZSB0aGUgc3BsaW5lcyB3aWxsIGFsd2F5cyBtZWV0IHRoZSBwb2ludHMuIEl0IHByb2R1Y2VzIHNvbWUgYXJ0aWZhY3RzIHRob3VnaCB3aGVuIGRhdGEgdmFsdWVzIGFyZSBpbmNyZWFzZWQgb3IgZGVjcmVhc2VkIHJhcGlkbHkuIFRoZSBsaW5lIG1heSBub3QgZm9sbG93IGEgdmVyeSBhY2N1cmF0ZSBwYXRoIGFuZCBpZiB0aGUgbGluZSBzaG91bGQgYmUgYWNjdXJhdGUgdGhpcyBzbW9vdGhpbmcgZnVuY3Rpb24gZG9lcyBub3QgcHJvZHVjZSB0aGUgYmVzdCByZXN1bHRzLlxuICAgKlxuICAgKiBDYXJkaW5hbCBzcGxpbmVzIGNhbiBvbmx5IGJlIGNyZWF0ZWQgaWYgdGhlcmUgYXJlIG1vcmUgdGhhbiB0d28gZGF0YSBwb2ludHMuIElmIHRoaXMgaXMgbm90IHRoZSBjYXNlIHRoaXMgc21vb3RoaW5nIHdpbGwgZmFsbGJhY2sgdG8gYENoYXJ0aXN0LlNtb290aGluZy5ub25lYC5cbiAgICpcbiAgICogQWxsIHNtb290aGluZyBmdW5jdGlvbnMgd2l0aGluIENoYXJ0aXN0IGFyZSBmYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IGFjY2VwdCBhbiBvcHRpb25zIHBhcmFtZXRlci4gVGhlIGNhcmRpbmFsIGludGVycG9sYXRpb24gZnVuY3Rpb24gYWNjZXB0cyBvbmUgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgYHRlbnNpb25gLCBiZXR3ZWVuIDAgYW5kIDEsIHdoaWNoIGNvbnRyb2xzIHRoZSBzbW9vdGhpbmcgaW50ZW5zaXR5LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgKiAgIHNlcmllczogW1sxLCAyLCA4LCAxLCA3XV1cbiAgICogfSwge1xuICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwoe1xuICAgKiAgICAgdGVuc2lvbjogMSxcbiAgICogICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkludGVycG9sYXRpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgb2YgdGhlIGNhcmRpbmFsIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKi9cbiAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0ZW5zaW9uOiAxLFxuICAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgIH07XG5cbiAgICBvcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB2YXIgdCA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIG9wdGlvbnMudGVuc2lvbikpLFxuICAgICAgYyA9IDEgLSB0O1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGhlbHAgdXMgdG8gc3BsaXQgcGF0aENvb3JkaW5hdGVzIGFuZCB2YWx1ZURhdGEgaW50byBzZWdtZW50cyB0aGF0IGFsc28gY29udGFpbiBwYXRoQ29vcmRpbmF0ZXNcbiAgICAvLyBhbmQgdmFsdWVEYXRhLiBUaGlzIHdheSB0aGUgZXhpc3RpbmcgZnVuY3Rpb25zIGNhbiBiZSByZXVzZWQgYW5kIHRoZSBzZWdtZW50IHBhdGhzIGNhbiBiZSBqb2luZWQgYWZ0ZXJ3YXJkcy5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgbmVjZXNzYXJ5IHRvIHRyZWF0IFwiaG9sZXNcIiBpbiB0aGUgbGluZSBjaGFydHNcbiAgICBmdW5jdGlvbiBzcGxpdEludG9TZWdtZW50cyhwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSkge1xuICAgICAgdmFyIHNlZ21lbnRzID0gW107XG4gICAgICB2YXIgaG9sZSA9IHRydWU7XG5cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgLy8gSWYgdGhpcyB2YWx1ZSBpcyBhIFwiaG9sZVwiIHdlIHNldCB0aGUgaG9sZSBmbGFnXG4gICAgICAgIGlmKHZhbHVlRGF0YVtpIC8gMl0udmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmKCFvcHRpb25zLmZpbGxIb2xlcykge1xuICAgICAgICAgICAgaG9sZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGl0J3MgYSB2YWxpZCB2YWx1ZSB3ZSBuZWVkIHRvIGNoZWNrIGlmIHdlJ3JlIGNvbWluZyBvdXQgb2YgYSBob2xlIGFuZCBjcmVhdGUgYSBuZXcgZW1wdHkgc2VnbWVudFxuICAgICAgICAgIGlmKGhvbGUpIHtcbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goe1xuICAgICAgICAgICAgICBwYXRoQ29vcmRpbmF0ZXM6IFtdLFxuICAgICAgICAgICAgICB2YWx1ZURhdGE6IFtdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEFzIHdlIGhhdmUgYSB2YWxpZCB2YWx1ZSBub3csIHdlIGFyZSBub3QgaW4gYSBcImhvbGVcIiBhbnltb3JlXG4gICAgICAgICAgICBob2xlID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWRkIHRvIHRoZSBzZWdtZW50IHBhdGhDb29yZGluYXRlcyBhbmQgdmFsdWVEYXRhXG4gICAgICAgICAgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0ucGF0aENvb3JkaW5hdGVzLnB1c2gocGF0aENvb3JkaW5hdGVzW2ldLCBwYXRoQ29vcmRpbmF0ZXNbaSArIDFdKTtcbiAgICAgICAgICBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS52YWx1ZURhdGEucHVzaCh2YWx1ZURhdGFbaSAvIDJdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VnbWVudHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGNhcmRpbmFsKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKSB7XG4gICAgICAvLyBGaXJzdCB3ZSB0cnkgdG8gc3BsaXQgdGhlIGNvb3JkaW5hdGVzIGludG8gc2VnbWVudHNcbiAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IHRvIHRyZWF0IFwiaG9sZXNcIiBpbiBsaW5lIGNoYXJ0c1xuICAgICAgdmFyIHNlZ21lbnRzID0gc3BsaXRJbnRvU2VnbWVudHMocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpO1xuXG4gICAgICAvLyBJZiB0aGUgc3BsaXQgcmVzdWx0ZWQgaW4gbW9yZSB0aGF0IG9uZSBzZWdtZW50IHdlIG5lZWQgdG8gaW50ZXJwb2xhdGUgZWFjaCBzZWdtZW50IGluZGl2aWR1YWxseSBhbmQgam9pbiB0aGVtXG4gICAgICAvLyBhZnRlcndhcmRzIHRvZ2V0aGVyIGludG8gYSBzaW5nbGUgcGF0aC5cbiAgICAgIGlmKHNlZ21lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdmFyIHBhdGhzID0gW107XG4gICAgICAgIC8vIEZvciBlYWNoIHNlZ21lbnQgd2Ugd2lsbCByZWN1cnNlIHRoZSBjYXJkaW5hbCBmdW5jdGlvblxuICAgICAgICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNlZ21lbnQpIHtcbiAgICAgICAgICBwYXRocy5wdXNoKGNhcmRpbmFsKHNlZ21lbnQucGF0aENvb3JkaW5hdGVzLCBzZWdtZW50LnZhbHVlRGF0YSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gSm9pbiB0aGUgc2VnbWVudCBwYXRoIGRhdGEgaW50byBhIHNpbmdsZSBwYXRoIGFuZCByZXR1cm5cbiAgICAgICAgcmV0dXJuIENoYXJ0aXN0LlN2Zy5QYXRoLmpvaW4ocGF0aHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG9ubHkgb25lIHNlZ21lbnQgd2UgY2FuIHByb2NlZWQgcmVndWxhcmx5IGJ5IHVzaW5nIHBhdGhDb29yZGluYXRlcyBhbmQgdmFsdWVEYXRhIGZyb20gdGhlIGZpcnN0XG4gICAgICAgIC8vIHNlZ21lbnRcbiAgICAgICAgcGF0aENvb3JkaW5hdGVzID0gc2VnbWVudHNbMF0ucGF0aENvb3JkaW5hdGVzO1xuICAgICAgICB2YWx1ZURhdGEgPSBzZWdtZW50c1swXS52YWx1ZURhdGE7XG5cbiAgICAgICAgLy8gSWYgbGVzcyB0aGFuIHR3byBwb2ludHMgd2UgbmVlZCB0byBmYWxsYmFjayB0byBubyBzbW9vdGhpbmdcbiAgICAgICAgaWYocGF0aENvb3JkaW5hdGVzLmxlbmd0aCA8PSA0KSB7XG4gICAgICAgICAgcmV0dXJuIENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZSgpKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCkubW92ZShwYXRoQ29vcmRpbmF0ZXNbMF0sIHBhdGhDb29yZGluYXRlc1sxXSwgZmFsc2UsIHZhbHVlRGF0YVswXSksXG4gICAgICAgICAgejtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaUxlbiA9IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGlMZW4gLSAyICogIXogPiBpOyBpICs9IDIpIHtcbiAgICAgICAgICB2YXIgcCA9IFtcbiAgICAgICAgICAgIHt4OiArcGF0aENvb3JkaW5hdGVzW2kgLSAyXSwgeTogK3BhdGhDb29yZGluYXRlc1tpIC0gMV19LFxuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaV0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDFdfSxcbiAgICAgICAgICAgIHt4OiArcGF0aENvb3JkaW5hdGVzW2kgKyAyXSwgeTogK3BhdGhDb29yZGluYXRlc1tpICsgM119LFxuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDRdLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyA1XX1cbiAgICAgICAgICBdO1xuICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgcFswXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzW2lMZW4gLSAyXSwgeTogK3BhdGhDb29yZGluYXRlc1tpTGVuIC0gMV19O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gNCA9PT0gaSkge1xuICAgICAgICAgICAgICBwWzNdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbMF0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbMV19O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gMiA9PT0gaSkge1xuICAgICAgICAgICAgICBwWzJdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbMF0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbMV19O1xuICAgICAgICAgICAgICBwWzNdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbMl0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbM119O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaUxlbiAtIDQgPT09IGkpIHtcbiAgICAgICAgICAgICAgcFszXSA9IHBbMl07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpKSB7XG4gICAgICAgICAgICAgIHBbMF0gPSB7eDogK3BhdGhDb29yZGluYXRlc1tpXSwgeTogK3BhdGhDb29yZGluYXRlc1tpICsgMV19O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGguY3VydmUoXG4gICAgICAgICAgICAodCAqICgtcFswXS54ICsgNiAqIHBbMV0ueCArIHBbMl0ueCkgLyA2KSArIChjICogcFsyXS54KSxcbiAgICAgICAgICAgICh0ICogKC1wWzBdLnkgKyA2ICogcFsxXS55ICsgcFsyXS55KSAvIDYpICsgKGMgKiBwWzJdLnkpLFxuICAgICAgICAgICAgKHQgKiAocFsxXS54ICsgNiAqIHBbMl0ueCAtIHBbM10ueCkgLyA2KSArIChjICogcFsyXS54KSxcbiAgICAgICAgICAgICh0ICogKHBbMV0ueSArIDYgKiBwWzJdLnkgLSBwWzNdLnkpIC8gNikgKyAoYyAqIHBbMl0ueSksXG4gICAgICAgICAgICBwWzJdLngsXG4gICAgICAgICAgICBwWzJdLnksXG4gICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlRGF0YVsoaSArIDIpIC8gMl1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogU3RlcCBpbnRlcnBvbGF0aW9uIHdpbGwgY2F1c2UgdGhlIGxpbmUgY2hhcnQgdG8gbW92ZSBpbiBzdGVwcyByYXRoZXIgdGhhbiBkaWFnb25hbCBvciBzbW9vdGhlZCBsaW5lcy4gVGhpcyBpbnRlcnBvbGF0aW9uIHdpbGwgY3JlYXRlIGFkZGl0aW9uYWwgcG9pbnRzIHRoYXQgd2lsbCBhbHNvIGJlIGRyYXduIHdoZW4gdGhlIGBzaG93UG9pbnRgIG9wdGlvbiBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBBbGwgc21vb3RoaW5nIGZ1bmN0aW9ucyB3aXRoaW4gQ2hhcnRpc3QgYXJlIGZhY3RvcnkgZnVuY3Rpb25zIHRoYXQgYWNjZXB0IGFuIG9wdGlvbnMgcGFyYW1ldGVyLiBUaGUgc3RlcCBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGFjY2VwdHMgb25lIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyIGBwb3N0cG9uZWAsIHRoYXQgY2FuIGJlIGB0cnVlYCBvciBgZmFsc2VgLiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAgYW5kIHdpbGwgY2F1c2UgdGhlIHN0ZXAgdG8gb2NjdXIgd2hlcmUgdGhlIHZhbHVlIGFjdHVhbGx5IGNoYW5nZXMuIElmIGEgZGlmZmVyZW50IGJlaGF2aW91ciBpcyBuZWVkZWQgd2hlcmUgdGhlIHN0ZXAgaXMgc2hpZnRlZCB0byB0aGUgbGVmdCBhbmQgaGFwcGVucyBiZWZvcmUgdGhlIGFjdHVhbCB2YWx1ZSwgdGhpcyBvcHRpb24gY2FuIGJlIHNldCB0byBgZmFsc2VgLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgKiAgIHNlcmllczogW1sxLCAyLCA4LCAxLCA3XV1cbiAgICogfSwge1xuICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24uc3RlcCh7XG4gICAqICAgICBwb3N0cG9uZTogdHJ1ZSxcbiAgICogICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkludGVycG9sYXRpb25cbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgKi9cbiAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5zdGVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHBvc3Rwb25lOiB0cnVlLFxuICAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgIH07XG5cbiAgICBvcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gc3RlcChwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSkge1xuICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKTtcblxuICAgICAgdmFyIHByZXZYLCBwcmV2WSwgcHJldkRhdGE7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBjdXJyWCA9IHBhdGhDb29yZGluYXRlc1tpXTtcbiAgICAgICAgdmFyIGN1cnJZID0gcGF0aENvb3JkaW5hdGVzW2kgKyAxXTtcbiAgICAgICAgdmFyIGN1cnJEYXRhID0gdmFsdWVEYXRhW2kgLyAyXTtcblxuICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBwb2ludCBpcyBhbHNvIG5vdCBhIGhvbGUgd2UgY2FuIGRyYXcgdGhlIHN0ZXAgbGluZXNcbiAgICAgICAgaWYoY3VyckRhdGEudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmKHByZXZEYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHBhdGgubW92ZShjdXJyWCwgY3VyclksIGZhbHNlLCBjdXJyRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMucG9zdHBvbmUpIHtcbiAgICAgICAgICAgICAgLy8gSWYgcG9zdHBvbmVkIHdlIHNob3VsZCBkcmF3IHRoZSBzdGVwIGxpbmUgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgICAgICAgIHBhdGgubGluZShjdXJyWCwgcHJldlksIGZhbHNlLCBwcmV2RGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBJZiBub3QgcG9zdHBvbmVkIHdlIHNob3VsZCBkcmF3IHRoZSBzdGVwIGxpbmUgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgICAgICAgcGF0aC5saW5lKHByZXZYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIExpbmUgdG8gdGhlIGFjdHVhbCBwb2ludCAodGhpcyBzaG91bGQgb25seSBiZSBhIFktQXhpcyBtb3ZlbWVudFxuICAgICAgICAgICAgcGF0aC5saW5lKGN1cnJYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwcmV2WCA9IGN1cnJYO1xuICAgICAgICAgIHByZXZZID0gY3Vyclk7XG4gICAgICAgICAgcHJldkRhdGEgPSBjdXJyRGF0YTtcbiAgICAgICAgfSBlbHNlIGlmKCFvcHRpb25zLmZpbGxIb2xlcykge1xuICAgICAgICAgIHByZXZYID0gcHJldlkgPSBwcmV2RGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9O1xuICB9O1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBBIHZlcnkgYmFzaWMgZXZlbnQgbW9kdWxlIHRoYXQgaGVscHMgdG8gZ2VuZXJhdGUgYW5kIGNhdGNoIGV2ZW50cy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkV2ZW50XG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgQ2hhcnRpc3QuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYW5kbGVycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQWRkIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGEgc3BlY2lmaWMgZXZlbnRcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5FdmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgQSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyc1tldmVudF0gPSBoYW5kbGVyc1tldmVudF0gfHwgW107XG4gICAgICBoYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gZXZlbnQgaGFuZGxlciBvZiBhIHNwZWNpZmljIGV2ZW50IG5hbWUgb3IgcmVtb3ZlIGFsbCBldmVudCBoYW5kbGVycyBmb3IgYSBzcGVjaWZpYyBldmVudC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5FdmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZSB3aGVyZSBhIHNwZWNpZmljIG9yIGFsbCBoYW5kbGVycyBzaG91bGQgYmUgcmVtb3ZlZFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSBBbiBvcHRpb25hbCBldmVudCBoYW5kbGVyIGZ1bmN0aW9uLiBJZiBzcGVjaWZpZWQgb25seSB0aGlzIHNwZWNpZmljIGhhbmRsZXIgd2lsbCBiZSByZW1vdmVkIGFuZCBvdGhlcndpc2UgYWxsIGhhbmRsZXJzIGFyZSByZW1vdmVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcikge1xuICAgICAgLy8gT25seSBkbyBzb21ldGhpbmcgaWYgdGhlcmUgYXJlIGV2ZW50IGhhbmRsZXJzIHdpdGggdGhpcyBuYW1lIGV4aXN0aW5nXG4gICAgICBpZihoYW5kbGVyc1tldmVudF0pIHtcbiAgICAgICAgLy8gSWYgaGFuZGxlciBpcyBzZXQgd2Ugd2lsbCBsb29rIGZvciBhIHNwZWNpZmljIGhhbmRsZXIgYW5kIG9ubHkgcmVtb3ZlIHRoaXNcbiAgICAgICAgaWYoaGFuZGxlcikge1xuICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaGFuZGxlcnNbZXZlbnRdLmluZGV4T2YoaGFuZGxlciksIDEpO1xuICAgICAgICAgIGlmKGhhbmRsZXJzW2V2ZW50XS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIG5vIGhhbmRsZXIgaXMgc3BlY2lmaWVkIHdlIHJlbW92ZSBhbGwgaGFuZGxlcnMgZm9yIHRoaXMgZXZlbnRcbiAgICAgICAgICBkZWxldGUgaGFuZGxlcnNbZXZlbnRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gZW1pdCBhbiBldmVudC4gQWxsIGhhbmRsZXJzIHRoYXQgYXJlIGxpc3RlbmluZyBmb3IgdGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aXRoIHRoZSBkYXRhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5FdmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZSB0aGF0IHNob3VsZCBiZSB0cmlnZ2VyZWRcbiAgICAgKiBAcGFyYW0geyp9IGRhdGEgQXJiaXRyYXJ5IGRhdGEgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgZXZlbnQgaGFuZGxlciBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAvLyBPbmx5IGRvIHNvbWV0aGluZyBpZiB0aGVyZSBhcmUgZXZlbnQgaGFuZGxlcnMgd2l0aCB0aGlzIG5hbWUgZXhpc3RpbmdcbiAgICAgIGlmKGhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgICBoYW5kbGVyc1tldmVudF0uZm9yRWFjaChmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICAgICAgaGFuZGxlcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVtaXQgZXZlbnQgdG8gc3RhciBldmVudCBoYW5kbGVyc1xuICAgICAgaWYoaGFuZGxlcnNbJyonXSkge1xuICAgICAgICBoYW5kbGVyc1snKiddLmZvckVhY2goZnVuY3Rpb24oc3RhckhhbmRsZXIpIHtcbiAgICAgICAgICBzdGFySGFuZGxlcihldmVudCwgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBhZGRFdmVudEhhbmRsZXI6IGFkZEV2ZW50SGFuZGxlcixcbiAgICAgIHJlbW92ZUV2ZW50SGFuZGxlcjogcmVtb3ZlRXZlbnRIYW5kbGVyLFxuICAgICAgZW1pdDogZW1pdFxuICAgIH07XG4gIH07XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHNvbWUgYmFzaWMgcHJvdG90eXBlIGluaGVyaXRhbmNlIHV0aWxpdGllcy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkNsYXNzXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBsaXN0VG9BcnJheShsaXN0KSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGlmIChsaXN0Lmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKGxpc3RbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byBleHRlbmQgZnJvbSBjdXJyZW50IHByb3RvdHlwZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIFRoZSBvYmplY3QgdGhhdCBzZXJ2ZXMgYXMgZGVmaW5pdGlvbiBmb3IgdGhlIHByb3RvdHlwZSB0aGF0IGdldHMgY3JlYXRlZCBmb3IgdGhlIG5ldyBjbGFzcy4gVGhpcyBvYmplY3Qgc2hvdWxkIGFsd2F5cyBjb250YWluIGEgY29uc3RydWN0b3IgcHJvcGVydHkgdGhhdCBpcyB0aGUgZGVzaXJlZCBjb25zdHJ1Y3RvciBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgY2xhc3MuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc3VwZXJQcm90b092ZXJyaWRlXSBCeSBkZWZhdWx0IGV4dGVucyB3aWxsIHVzZSB0aGUgY3VycmVudCBjbGFzcyBwcm90b3R5cGUgb3IgQ2hhcnRpc3QuY2xhc3MuIFdpdGggdGhpcyBwYXJhbWV0ZXIgeW91IGNhbiBzcGVjaWZ5IGFueSBzdXBlciBwcm90b3R5cGUgdGhhdCB3aWxsIGJlIHVzZWQuXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBDb25zdHJ1Y3RvciBmdW5jdGlvbiBvZiB0aGUgbmV3IGNsYXNzXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHZhciBGcnVpdCA9IENsYXNzLmV4dGVuZCh7XG4gICAgICogY29sb3I6IHVuZGVmaW5lZCxcbiAgICAgKiAgIHN1Z2FyOiB1bmRlZmluZWQsXG4gICAgICpcbiAgICAgKiAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihjb2xvciwgc3VnYXIpIHtcbiAgICAgKiAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgICAqICAgICB0aGlzLnN1Z2FyID0gc3VnYXI7XG4gICAgICogICB9LFxuICAgICAqXG4gICAgICogICBlYXQ6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICB0aGlzLnN1Z2FyID0gMDtcbiAgICAgKiAgICAgcmV0dXJuIHRoaXM7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAqXG4gICAqIHZhciBCYW5hbmEgPSBGcnVpdC5leHRlbmQoe1xuICAgICAqICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICpcbiAgICAgKiAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihsZW5ndGgsIHN1Z2FyKSB7XG4gICAgICogICAgIEJhbmFuYS5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsICdZZWxsb3cnLCBzdWdhcik7XG4gICAgICogICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgKlxuICAgKiB2YXIgYmFuYW5hID0gbmV3IEJhbmFuYSgyMCwgNDApO1xuICAgKiBjb25zb2xlLmxvZygnYmFuYW5hIGluc3RhbmNlb2YgRnJ1aXQnLCBiYW5hbmEgaW5zdGFuY2VvZiBGcnVpdCk7XG4gICAqIGNvbnNvbGUubG9nKCdGcnVpdCBpcyBwcm90b3R5cGUgb2YgYmFuYW5hJywgRnJ1aXQucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYmFuYW5hKSk7XG4gICAqIGNvbnNvbGUubG9nKCdiYW5hbmFzIHByb3RvdHlwZSBpcyBGcnVpdCcsIE9iamVjdC5nZXRQcm90b3R5cGVPZihiYW5hbmEpID09PSBGcnVpdC5wcm90b3R5cGUpO1xuICAgKiBjb25zb2xlLmxvZyhiYW5hbmEuc3VnYXIpO1xuICAgKiBjb25zb2xlLmxvZyhiYW5hbmEuZWF0KCkuc3VnYXIpO1xuICAgKiBjb25zb2xlLmxvZyhiYW5hbmEuY29sb3IpO1xuICAgKi9cbiAgZnVuY3Rpb24gZXh0ZW5kKHByb3BlcnRpZXMsIHN1cGVyUHJvdG9PdmVycmlkZSkge1xuICAgIHZhciBzdXBlclByb3RvID0gc3VwZXJQcm90b092ZXJyaWRlIHx8IHRoaXMucHJvdG90eXBlIHx8IENoYXJ0aXN0LkNsYXNzO1xuICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoc3VwZXJQcm90byk7XG5cbiAgICBDaGFydGlzdC5DbGFzcy5jbG9uZURlZmluaXRpb25zKHByb3RvLCBwcm9wZXJ0aWVzKTtcblxuICAgIHZhciBjb25zdHIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmbiA9IHByb3RvLmNvbnN0cnVjdG9yIHx8IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBpbnN0YW5jZTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBsaW5rZWQgdG8gdGhlIENoYXJ0aXN0IG5hbWVzcGFjZSB0aGUgY29uc3RydWN0b3Igd2FzIG5vdCBjYWxsZWQgd2l0aCBuZXdcbiAgICAgIC8vIFRvIHByb3ZpZGUgYSBmYWxsYmFjayB3ZSB3aWxsIGluc3RhbnRpYXRlIGhlcmUgYW5kIHJldHVybiB0aGUgaW5zdGFuY2VcbiAgICAgIGluc3RhbmNlID0gdGhpcyA9PT0gQ2hhcnRpc3QgPyBPYmplY3QuY3JlYXRlKHByb3RvKSA6IHRoaXM7XG4gICAgICBmbi5hcHBseShpbnN0YW5jZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSk7XG5cbiAgICAgIC8vIElmIHRoaXMgY29uc3RydWN0b3Igd2FzIG5vdCBjYWxsZWQgd2l0aCBuZXcgd2UgbmVlZCB0byByZXR1cm4gdGhlIGluc3RhbmNlXG4gICAgICAvLyBUaGlzIHdpbGwgbm90IGhhcm0gd2hlbiB0aGUgY29uc3RydWN0b3IgaGFzIGJlZW4gY2FsbGVkIHdpdGggbmV3IGFzIHRoZSByZXR1cm5lZCB2YWx1ZSBpcyBpZ25vcmVkXG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcblxuICAgIGNvbnN0ci5wcm90b3R5cGUgPSBwcm90bztcbiAgICBjb25zdHIuc3VwZXIgPSBzdXBlclByb3RvO1xuICAgIGNvbnN0ci5leHRlbmQgPSB0aGlzLmV4dGVuZDtcblxuICAgIHJldHVybiBjb25zdHI7XG4gIH1cblxuICAvLyBWYXJpYWJsZSBhcmd1bWVudCBsaXN0IGNsb25lcyBhcmdzID4gMCBpbnRvIGFyZ3NbMF0gYW5kIHJldHJ1bnMgbW9kaWZpZWQgYXJnc1swXVxuICBmdW5jdGlvbiBjbG9uZURlZmluaXRpb25zKCkge1xuICAgIHZhciBhcmdzID0gbGlzdFRvQXJyYXkoYXJndW1lbnRzKTtcbiAgICB2YXIgdGFyZ2V0ID0gYXJnc1swXTtcblxuICAgIGFyZ3Muc3BsaWNlKDEsIGFyZ3MubGVuZ3RoIC0gMSkuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKHByb3BOYW1lKSB7XG4gICAgICAgIC8vIElmIHRoaXMgcHJvcGVydHkgYWxyZWFkeSBleGlzdCBpbiB0YXJnZXQgd2UgZGVsZXRlIGl0IGZpcnN0XG4gICAgICAgIGRlbGV0ZSB0YXJnZXRbcHJvcE5hbWVdO1xuICAgICAgICAvLyBEZWZpbmUgdGhlIHByb3BlcnR5IHdpdGggdGhlIGRlc2NyaXB0b3IgZnJvbSBzb3VyY2VcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcE5hbWUsXG4gICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHByb3BOYW1lKSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICBDaGFydGlzdC5DbGFzcyA9IHtcbiAgICBleHRlbmQ6IGV4dGVuZCxcbiAgICBjbG9uZURlZmluaXRpb25zOiBjbG9uZURlZmluaXRpb25zXG4gIH07XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIEJhc2UgZm9yIGFsbCBjaGFydCB0eXBlcy4gVGhlIG1ldGhvZHMgaW4gQ2hhcnRpc3QuQmFzZSBhcmUgaW5oZXJpdGVkIHRvIGFsbCBjaGFydCB0eXBlcy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkJhc2VcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPRE86IEN1cnJlbnRseSB3ZSBuZWVkIHRvIHJlLWRyYXcgdGhlIGNoYXJ0IG9uIHdpbmRvdyByZXNpemUuIFRoaXMgaXMgdXN1YWxseSB2ZXJ5IGJhZCBhbmQgd2lsbCBhZmZlY3QgcGVyZm9ybWFuY2UuXG4gIC8vIFRoaXMgaXMgZG9uZSBiZWNhdXNlIHdlIGNhbid0IHdvcmsgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyB3aGVuIGRyYXdpbmcgdGhlIGNoYXJ0IGJlY2F1c2UgU1ZHIFBhdGggZG9lcyBub3RcbiAgLy8gd29yayB3aXRoIHJlbGF0aXZlIHBvc2l0aW9ucyB5ZXQuIFdlIG5lZWQgdG8gY2hlY2sgaWYgd2UgY2FuIGRvIGEgdmlld0JveCBoYWNrIHRvIHN3aXRjaCB0byBwZXJjZW50YWdlLlxuICAvLyBTZWUgaHR0cDovL21vemlsbGEuNjUwNi5uNy5uYWJibGUuY29tL1NwZWN5ZmluZy1wYXRocy13aXRoLXBlcmNlbnRhZ2VzLXVuaXQtdGQyNDc0NzQuaHRtbFxuICAvLyBVcGRhdGU6IGNhbiBiZSBkb25lIHVzaW5nIHRoZSBhYm92ZSBtZXRob2QgdGVzdGVkIGhlcmU6IGh0dHA6Ly9jb2RlcGVuLmlvL2dpb25rdW56L3Blbi9LRHZMalxuICAvLyBUaGUgcHJvYmxlbSBpcyB3aXRoIHRoZSBsYWJlbCBvZmZzZXRzIHRoYXQgY2FuJ3QgYmUgY29udmVydGVkIGludG8gcGVyY2VudGFnZSBhbmQgYWZmZWN0aW5nIHRoZSBjaGFydCBjb250YWluZXJcbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNoYXJ0IHdoaWNoIGN1cnJlbnRseSBkb2VzIGEgZnVsbCByZWNvbnN0cnVjdGlvbiBvZiB0aGUgU1ZHIERPTVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGFdIE9wdGlvbmFsIGRhdGEgeW91J2QgbGlrZSB0byBzZXQgZm9yIHRoZSBjaGFydCBiZWZvcmUgaXQgd2lsbCB1cGRhdGUuIElmIG5vdCBzcGVjaWZpZWQgdGhlIHVwZGF0ZSBtZXRob2Qgd2lsbCB1c2UgdGhlIGRhdGEgdGhhdCBpcyBhbHJlYWR5IGNvbmZpZ3VyZWQgd2l0aCB0aGUgY2hhcnQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uYWwgb3B0aW9ucyB5b3UnZCBsaWtlIHRvIGFkZCB0byB0aGUgcHJldmlvdXMgb3B0aW9ucyBmb3IgdGhlIGNoYXJ0IGJlZm9yZSBpdCB3aWxsIHVwZGF0ZS4gSWYgbm90IHNwZWNpZmllZCB0aGUgdXBkYXRlIG1ldGhvZCB3aWxsIHVzZSB0aGUgb3B0aW9ucyB0aGF0IGhhdmUgYmVlbiBhbHJlYWR5IGNvbmZpZ3VyZWQgd2l0aCB0aGUgY2hhcnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW292ZXJyaWRlXSBJZiBzZXQgdG8gdHJ1ZSwgdGhlIHBhc3NlZCBvcHRpb25zIHdpbGwgYmUgdXNlZCB0byBleHRlbmQgdGhlIG9wdGlvbnMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZCBhbHJlYWR5LiBPdGhlcndpc2UgdGhlIGNoYXJ0IGRlZmF1bHQgb3B0aW9ucyB3aWxsIGJlIHVzZWQgYXMgdGhlIGJhc2VcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhc2VcbiAgICovXG4gIGZ1bmN0aW9uIHVwZGF0ZShkYXRhLCBvcHRpb25zLCBvdmVycmlkZSkge1xuICAgIGlmKGRhdGEpIHtcbiAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAvLyBFdmVudCBmb3IgZGF0YSB0cmFuc2Zvcm1hdGlvbiB0aGF0IGFsbG93cyB0byBtYW5pcHVsYXRlIHRoZSBkYXRhIGJlZm9yZSBpdCBnZXRzIHJlbmRlcmVkIGluIHRoZSBjaGFydHNcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RhdGEnLCB7XG4gICAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgb3ZlcnJpZGUgPyB0aGlzLm9wdGlvbnMgOiB0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICAgICAgLy8gSWYgY2hhcnRpc3Qgd2FzIG5vdCBpbml0aWFsaXplZCB5ZXQsIHdlIGp1c3Qgc2V0IHRoZSBvcHRpb25zIGFuZCBsZWF2ZSB0aGUgcmVzdCB0byB0aGUgaW5pdGlhbGl6YXRpb25cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSByZS1jcmVhdGUgdGhlIG9wdGlvbnNQcm92aWRlciBhdCB0aGlzIHBvaW50XG4gICAgICBpZighdGhpcy5pbml0aWFsaXplVGltZW91dElkKSB7XG4gICAgICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyLnJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5vcHRpb25zUHJvdmlkZXIgPSBDaGFydGlzdC5vcHRpb25zUHJvdmlkZXIodGhpcy5vcHRpb25zLCB0aGlzLnJlc3BvbnNpdmVPcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT25seSByZS1jcmVhdGVkIHRoZSBjaGFydCBpZiBpdCBoYXMgYmVlbiBpbml0aWFsaXplZCB5ZXRcbiAgICBpZighdGhpcy5pbml0aWFsaXplVGltZW91dElkKSB7XG4gICAgICB0aGlzLmNyZWF0ZUNoYXJ0KHRoaXMub3B0aW9uc1Byb3ZpZGVyLmdldEN1cnJlbnRPcHRpb25zKCkpO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgY2hhcnQgb2JqZWN0IHRvIGNoYWluIHVwIGNhbGxzXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2FuIGJlIGNhbGxlZCBvbiB0aGUgQVBJIG9iamVjdCBvZiBlYWNoIGNoYXJ0IGFuZCB3aWxsIHVuLXJlZ2lzdGVyIGFsbCBldmVudCBsaXN0ZW5lcnMgdGhhdCB3ZXJlIGFkZGVkIHRvIG90aGVyIGNvbXBvbmVudHMuIFRoaXMgY3VycmVudGx5IGluY2x1ZGVzIGEgd2luZG93LnJlc2l6ZSBsaXN0ZW5lciBhcyB3ZWxsIGFzIG1lZGlhIHF1ZXJ5IGxpc3RlbmVycyBpZiBhbnkgcmVzcG9uc2l2ZSBvcHRpb25zIGhhdmUgYmVlbiBwcm92aWRlZC4gVXNlIHRoaXMgZnVuY3Rpb24gaWYgeW91IG5lZWQgdG8gZGVzdHJveSBhbmQgcmVjcmVhdGUgQ2hhcnRpc3QgY2hhcnRzIGR5bmFtaWNhbGx5LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgKi9cbiAgZnVuY3Rpb24gZGV0YWNoKCkge1xuICAgIC8vIE9ubHkgZGV0YWNoIGlmIGluaXRpYWxpemF0aW9uIGFscmVhZHkgb2NjdXJyZWQgb24gdGhpcyBjaGFydC4gSWYgdGhpcyBjaGFydCBzdGlsbCBoYXNuJ3QgaW5pdGlhbGl6ZWQgKHRoZXJlZm9yZVxuICAgIC8vIHRoZSBpbml0aWFsaXphdGlvblRpbWVvdXRJZCBpcyBzdGlsbCBhIHZhbGlkIHRpbWVvdXQgcmVmZXJlbmNlLCB3ZSB3aWxsIGNsZWFyIHRoZSB0aW1lb3V0XG4gICAgaWYoIXRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCkge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplTGlzdGVuZXIpO1xuICAgICAgdGhpcy5vcHRpb25zUHJvdmlkZXIucmVtb3ZlTWVkaWFRdWVyeUxpc3RlbmVycygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnMuIFRoZSBoYW5kbGVyIGNhbGxiYWNrcyBhcmUgc3luY2hyb25vdXMgYW5kIHdpbGwgcnVuIGluIHRoZSBtYWluIHRocmVhZCByYXRoZXIgdGhhbiB0aGUgZXZlbnQgbG9vcC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhc2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIHN1cHBvcnRlZCBldmVudHMuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgd2FzIGVtaXR0ZWQuIFRoaXMgZnVuY3Rpb24gd2lsbCByZWNlaXZlIGEgZGF0YSBhcmd1bWVudCB3aGljaCBjb250YWlucyBldmVudCBkYXRhLiBTZWUgdGhlIGV4YW1wbGUgZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIGZ1bmN0aW9uIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byB1bi1yZWdpc3RlciBldmVudCBoYW5kbGVycy4gSWYgdGhlIGhhbmRsZXIgZnVuY3Rpb24gcGFyYW1ldGVyIGlzIG9taXR0ZWQgYWxsIGhhbmRsZXJzIGZvciB0aGUgZ2l2ZW4gZXZlbnQgd2lsbCBiZSB1bi1yZWdpc3RlcmVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQgZm9yIHdoaWNoIGEgaGFuZGxlciBzaG91bGQgYmUgcmVtb3ZlZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaGFuZGxlcl0gVGhlIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB0aGF0IHdhcyBwcmV2aW91c2x5IHVzZWQgdG8gcmVnaXN0ZXIgYSBuZXcgZXZlbnQgaGFuZGxlci4gVGhpcyBoYW5kbGVyIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudCBoYW5kbGVyIGxpc3QuIElmIHRoaXMgcGFyYW1ldGVyIGlzIG9taXR0ZWQgdGhlbiBhbGwgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBnaXZlbiBldmVudCBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0LlxuICAgKi9cbiAgZnVuY3Rpb24gb2ZmKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgLy8gQWRkIHdpbmRvdyByZXNpemUgbGlzdGVuZXIgdGhhdCByZS1jcmVhdGVzIHRoZSBjaGFydFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIC8vIE9idGFpbiBjdXJyZW50IG9wdGlvbnMgYmFzZWQgb24gbWF0Y2hpbmcgbWVkaWEgcXVlcmllcyAoaWYgcmVzcG9uc2l2ZSBvcHRpb25zIGFyZSBnaXZlbilcbiAgICAvLyBUaGlzIHdpbGwgYWxzbyByZWdpc3RlciBhIGxpc3RlbmVyIHRoYXQgaXMgcmUtY3JlYXRpbmcgdGhlIGNoYXJ0IGJhc2VkIG9uIG1lZGlhIGNoYW5nZXNcbiAgICB0aGlzLm9wdGlvbnNQcm92aWRlciA9IENoYXJ0aXN0Lm9wdGlvbnNQcm92aWRlcih0aGlzLm9wdGlvbnMsIHRoaXMucmVzcG9uc2l2ZU9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcbiAgICAvLyBSZWdpc3RlciBvcHRpb25zIGNoYW5nZSBsaXN0ZW5lciB0aGF0IHdpbGwgdHJpZ2dlciBhIGNoYXJ0IHVwZGF0ZVxuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmFkZEV2ZW50SGFuZGxlcignb3B0aW9uc0NoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIC8vIEJlZm9yZSB0aGUgZmlyc3QgY2hhcnQgY3JlYXRpb24gd2UgbmVlZCB0byByZWdpc3RlciB1cyB3aXRoIGFsbCBwbHVnaW5zIHRoYXQgYXJlIGNvbmZpZ3VyZWRcbiAgICAvLyBJbml0aWFsaXplIGFsbCByZWxldmFudCBwbHVnaW5zIHdpdGggb3VyIGNoYXJ0IG9iamVjdCBhbmQgdGhlIHBsdWdpbiBvcHRpb25zIHNwZWNpZmllZCBpbiB0aGUgY29uZmlnXG4gICAgaWYodGhpcy5vcHRpb25zLnBsdWdpbnMpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5wbHVnaW5zLmZvckVhY2goZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgICAgIGlmKHBsdWdpbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgcGx1Z2luWzBdKHRoaXMsIHBsdWdpblsxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGx1Z2luKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIEV2ZW50IGZvciBkYXRhIHRyYW5zZm9ybWF0aW9uIHRoYXQgYWxsb3dzIHRvIG1hbmlwdWxhdGUgdGhlIGRhdGEgYmVmb3JlIGl0IGdldHMgcmVuZGVyZWQgaW4gdGhlIGNoYXJ0c1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RhdGEnLCB7XG4gICAgICB0eXBlOiAnaW5pdGlhbCcsXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgZmlyc3QgY2hhcnRcbiAgICB0aGlzLmNyZWF0ZUNoYXJ0KHRoaXMub3B0aW9uc1Byb3ZpZGVyLmdldEN1cnJlbnRPcHRpb25zKCkpO1xuXG4gICAgLy8gQXMgY2hhcnQgaXMgaW5pdGlhbGl6ZWQgZnJvbSB0aGUgZXZlbnQgbG9vcCBub3cgd2UgY2FuIHJlc2V0IG91ciB0aW1lb3V0IHJlZmVyZW5jZVxuICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGlmIHRoZSBjaGFydCBnZXRzIGluaXRpYWxpemVkIG9uIHRoZSBzYW1lIGVsZW1lbnQgdHdpY2VcbiAgICB0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0b3Igb2YgY2hhcnQgYmFzZSBjbGFzcy5cbiAgICpcbiAgICogQHBhcmFtIHF1ZXJ5XG4gICAqIEBwYXJhbSBkYXRhXG4gICAqIEBwYXJhbSBkZWZhdWx0T3B0aW9uc1xuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKiBAcGFyYW0gcmVzcG9uc2l2ZU9wdGlvbnNcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBCYXNlKHF1ZXJ5LCBkYXRhLCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IENoYXJ0aXN0LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5yZXNwb25zaXZlT3B0aW9ucyA9IHJlc3BvbnNpdmVPcHRpb25zO1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyID0gQ2hhcnRpc3QuRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QgPSBDaGFydGlzdC5TdmcuaXNTdXBwb3J0ZWQoJ0V4dGVuc2liaWxpdHknKTtcbiAgICB0aGlzLnN1cHBvcnRzQW5pbWF0aW9ucyA9IENoYXJ0aXN0LlN2Zy5pc1N1cHBvcnRlZCgnQW5pbWF0aW9uRXZlbnRzQXR0cmlidXRlJyk7XG4gICAgdGhpcy5yZXNpemVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKCl7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGlmKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICAvLyBJZiBjaGFydGlzdCB3YXMgYWxyZWFkeSBpbml0aWFsaXplZCBpbiB0aGlzIGNvbnRhaW5lciB3ZSBhcmUgZGV0YWNoaW5nIGFsbCBldmVudCBsaXN0ZW5lcnMgZmlyc3RcbiAgICAgIGlmKHRoaXMuY29udGFpbmVyLl9fY2hhcnRpc3RfXykge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5fX2NoYXJ0aXN0X18uZGV0YWNoKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29udGFpbmVyLl9fY2hhcnRpc3RfXyA9IHRoaXM7XG4gICAgfVxuXG4gICAgLy8gVXNpbmcgZXZlbnQgbG9vcCBmb3IgZmlyc3QgZHJhdyB0byBtYWtlIGl0IHBvc3NpYmxlIHRvIHJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVycyBpbiB0aGUgc2FtZSBjYWxsIHN0YWNrIHdoZXJlXG4gICAgLy8gdGhlIGNoYXJ0IHdhcyBjcmVhdGVkLlxuICAgIHRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoaW5pdGlhbGl6ZS5iaW5kKHRoaXMpLCAwKTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIHRoZSBjaGFydCBiYXNlIGNsYXNzXG4gIENoYXJ0aXN0LkJhc2UgPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBCYXNlLFxuICAgIG9wdGlvbnNQcm92aWRlcjogdW5kZWZpbmVkLFxuICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgIHN2ZzogdW5kZWZpbmVkLFxuICAgIGV2ZW50RW1pdHRlcjogdW5kZWZpbmVkLFxuICAgIGNyZWF0ZUNoYXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmFzZSBjaGFydCB0eXBlIGNhblxcJ3QgYmUgaW5zdGFudGlhdGVkIScpO1xuICAgIH0sXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgZGV0YWNoOiBkZXRhY2gsXG4gICAgb246IG9uLFxuICAgIG9mZjogb2ZmLFxuICAgIHZlcnNpb246IENoYXJ0aXN0LnZlcnNpb24sXG4gICAgc3VwcG9ydHNGb3JlaWduT2JqZWN0OiBmYWxzZVxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogQ2hhcnRpc3QgU1ZHIG1vZHVsZSBmb3Igc2ltcGxlIFNWRyBET00gYWJzdHJhY3Rpb25cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LlN2Z1xuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHN2Z05zID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgICB4bWxOcyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zLycsXG4gICAgeGh0bWxOcyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJztcblxuICBDaGFydGlzdC54bWxOcyA9IHtcbiAgICBxdWFsaWZpZWROYW1lOiAneG1sbnM6Y3QnLFxuICAgIHByZWZpeDogJ2N0JyxcbiAgICB1cmk6ICdodHRwOi8vZ2lvbmt1bnouZ2l0aHViLmNvbS9jaGFydGlzdC1qcy9jdCdcbiAgfTtcblxuICAvKipcbiAgICogQ2hhcnRpc3QuU3ZnIGNyZWF0ZXMgYSBuZXcgU1ZHIG9iamVjdCB3cmFwcGVyIHdpdGggYSBzdGFydGluZyBlbGVtZW50LiBZb3UgY2FuIHVzZSB0aGUgd3JhcHBlciB0byBmbHVlbnRseSBjcmVhdGUgc3ViLWVsZW1lbnRzIGFuZCBtb2RpZnkgdGhlbS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgU1ZHIGVsZW1lbnQgdG8gY3JlYXRlIG9yIGFuIFNWRyBkb20gZWxlbWVudCB3aGljaCBzaG91bGQgYmUgd3JhcHBlZCBpbnRvIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyBBbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhZGRlZCBhcyBhdHRyaWJ1dGVzIHRvIHRoZSBTVkcgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWQuIEF0dHJpYnV0ZXMgd2l0aCB1bmRlZmluZWQgdmFsdWVzIHdpbGwgbm90IGJlIGFkZGVkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIFRoaXMgY2xhc3Mgb3IgY2xhc3MgbGlzdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyZW50IFRoZSBwYXJlbnQgU1ZHIHdyYXBwZXIgb2JqZWN0IHdoZXJlIHRoaXMgbmV3bHkgY3JlYXRlZCB3cmFwcGVyIGFuZCBpdCdzIGVsZW1lbnQgd2lsbCBiZSBhdHRhY2hlZCB0byBhcyBjaGlsZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluc2VydEZpcnN0IElmIHRoaXMgcGFyYW0gaXMgc2V0IHRvIHRydWUgaW4gY29uanVuY3Rpb24gd2l0aCBhIHBhcmVudCBlbGVtZW50IHRoZSBuZXdseSBjcmVhdGVkIGVsZW1lbnQgd2lsbCBiZSBhZGRlZCBhcyBmaXJzdCBjaGlsZCBlbGVtZW50IGluIHRoZSBwYXJlbnQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gU3ZnKG5hbWUsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgcGFyZW50LCBpbnNlcnRGaXJzdCkge1xuICAgIC8vIElmIFN2ZyBpcyBnZXR0aW5nIGNhbGxlZCB3aXRoIGFuIFNWRyBlbGVtZW50IHdlIGp1c3QgcmV0dXJuIHRoZSB3cmFwcGVyXG4gICAgaWYobmFtZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX25vZGUgPSBuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHN2Z05zLCBuYW1lKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhbiBTVkcgZWxlbWVudCBjcmVhdGVkIHRoZW4gY3VzdG9tIG5hbWVzcGFjZVxuICAgICAgaWYobmFtZSA9PT0gJ3N2ZycpIHtcbiAgICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGVOUyh4bWxOcywgQ2hhcnRpc3QueG1sTnMucXVhbGlmaWVkTmFtZSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihhdHRyaWJ1dGVzKSB7XG4gICAgICB0aGlzLmF0dHIoYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgaWYoY2xhc3NOYW1lKSB7XG4gICAgICB0aGlzLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfVxuXG4gICAgaWYocGFyZW50KSB7XG4gICAgICBpZiAoaW5zZXJ0Rmlyc3QgJiYgcGFyZW50Ll9ub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcGFyZW50Ll9ub2RlLmluc2VydEJlZm9yZSh0aGlzLl9ub2RlLCBwYXJlbnQuX25vZGUuZmlyc3RDaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQuX25vZGUuYXBwZW5kQ2hpbGQodGhpcy5fbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhdHRyaWJ1dGVzIG9uIHRoZSBjdXJyZW50IFNWRyBlbGVtZW50IG9mIHRoZSB3cmFwcGVyIHlvdSdyZSBjdXJyZW50bHkgd29ya2luZyBvbi5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGF0dHJpYnV0ZXMgQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC4gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgYSBTdHJpbmcgdGhlbiB0aGUgZnVuY3Rpb24gaXMgdXNlZCBhcyBhIGdldHRlciBhbmQgd2lsbCByZXR1cm4gdGhlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5zIElmIHNwZWNpZmllZCwgdGhlIGF0dHJpYnV0ZXMgd2lsbCBiZSBzZXQgYXMgbmFtZXNwYWNlIGF0dHJpYnV0ZXMgd2l0aCBucyBhcyBwcmVmaXguXG4gICAqIEByZXR1cm4ge09iamVjdHxTdHJpbmd9IFRoZSBjdXJyZW50IHdyYXBwZXIgb2JqZWN0IHdpbGwgYmUgcmV0dXJuZWQgc28gaXQgY2FuIGJlIHVzZWQgZm9yIGNoYWluaW5nIG9yIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaWYgdXNlZCBhcyBnZXR0ZXIgZnVuY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBhdHRyKGF0dHJpYnV0ZXMsIG5zKSB7XG4gICAgaWYodHlwZW9mIGF0dHJpYnV0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZihucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZS5nZXRBdHRyaWJ1dGVOUyhucywgYXR0cmlidXRlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIC8vIElmIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaXMgdW5kZWZpbmVkIHdlIGNhbiBza2lwIHRoaXMgb25lXG4gICAgICBpZihhdHRyaWJ1dGVzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKG5zKSB7XG4gICAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlTlMobnMsIFtDaGFydGlzdC54bWxOcy5wcmVmaXgsICc6Jywga2V5XS5qb2luKCcnKSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFNWRyBlbGVtZW50IHdob3NlIHdyYXBwZXIgb2JqZWN0IHdpbGwgYmUgc2VsZWN0ZWQgZm9yIGZ1cnRoZXIgb3BlcmF0aW9ucy4gVGhpcyB3YXkgeW91IGNhbiBhbHNvIGNyZWF0ZSBuZXN0ZWQgZ3JvdXBzIGVhc2lseS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgY3JlYXRlZCBhcyBjaGlsZCBlbGVtZW50IG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudCB3cmFwcGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbYXR0cmlidXRlc10gQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtjbGFzc05hbWVdIFRoaXMgY2xhc3Mgb3IgY2xhc3MgbGlzdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpbnNlcnRGaXJzdF0gSWYgdGhpcyBwYXJhbSBpcyBzZXQgdG8gdHJ1ZSBpbiBjb25qdW5jdGlvbiB3aXRoIGEgcGFyZW50IGVsZW1lbnQgdGhlIG5ld2x5IGNyZWF0ZWQgZWxlbWVudCB3aWxsIGJlIGFkZGVkIGFzIGZpcnN0IGNoaWxkIGVsZW1lbnQgaW4gdGhlIHBhcmVudCBlbGVtZW50XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gUmV0dXJucyBhIENoYXJ0aXN0LlN2ZyB3cmFwcGVyIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIG1vZGlmeSB0aGUgY29udGFpbmluZyBTVkcgZGF0YVxuICAgKi9cbiAgZnVuY3Rpb24gZWxlbShuYW1lLCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIGluc2VydEZpcnN0KSB7XG4gICAgcmV0dXJuIG5ldyBDaGFydGlzdC5TdmcobmFtZSwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCB0aGlzLCBpbnNlcnRGaXJzdCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGFyZW50IENoYXJ0aXN0LlNWRyB3cmFwcGVyIG9iamVjdFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gUmV0dXJucyBhIENoYXJ0aXN0LlN2ZyB3cmFwcGVyIGFyb3VuZCB0aGUgcGFyZW50IG5vZGUgb2YgdGhlIGN1cnJlbnQgbm9kZS4gSWYgdGhlIHBhcmVudCBub2RlIGlzIG5vdCBleGlzdGluZyBvciBpdCdzIG5vdCBhbiBTVkcgbm9kZSB0aGVuIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gbnVsbC5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5wYXJlbnROb2RlIGluc3RhbmNlb2YgU1ZHRWxlbWVudCA/IG5ldyBDaGFydGlzdC5TdmcodGhpcy5fbm9kZS5wYXJlbnROb2RlKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhIENoYXJ0aXN0LlN2ZyB3cmFwcGVyIGFyb3VuZCB0aGUgcm9vdCBTVkcgZWxlbWVudCBvZiB0aGUgY3VycmVudCB0cmVlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHJvb3QgU1ZHIGVsZW1lbnQgd3JhcHBlZCBpbiBhIENoYXJ0aXN0LlN2ZyBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiByb290KCkge1xuICAgIHZhciBub2RlID0gdGhpcy5fbm9kZTtcbiAgICB3aGlsZShub2RlLm5vZGVOYW1lICE9PSAnc3ZnJykge1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDaGFydGlzdC5Tdmcobm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgZmlyc3QgY2hpbGQgU1ZHIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgZWxlbWVudCB0aGF0IG1hdGNoZXMgYSBDU1Mgc2VsZWN0b3IuIFRoZSByZXR1cm5lZCBvYmplY3QgaXMgYSBDaGFydGlzdC5Tdmcgd3JhcHBlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgQSBDU1Mgc2VsZWN0b3IgdGhhdCBpcyB1c2VkIHRvIHF1ZXJ5IGZvciBjaGlsZCBTVkcgZWxlbWVudHNcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgU1ZHIHdyYXBwZXIgZm9yIHRoZSBlbGVtZW50IGZvdW5kIG9yIG51bGwgaWYgbm8gZWxlbWVudCB3YXMgZm91bmRcbiAgICovXG4gIGZ1bmN0aW9uIHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICB2YXIgZm91bmROb2RlID0gdGhpcy5fbm9kZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gZm91bmROb2RlID8gbmV3IENoYXJ0aXN0LlN2Zyhmb3VuZE5vZGUpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBhbGwgY2hpbGQgU1ZHIGVsZW1lbnRzIG9mIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBtYXRjaCBhIENTUyBzZWxlY3Rvci4gVGhlIHJldHVybmVkIG9iamVjdCBpcyBhIENoYXJ0aXN0LlN2Zy5MaXN0IHdyYXBwZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIEEgQ1NTIHNlbGVjdG9yIHRoYXQgaXMgdXNlZCB0byBxdWVyeSBmb3IgY2hpbGQgU1ZHIGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5MaXN0fSBUaGUgU1ZHIHdyYXBwZXIgbGlzdCBmb3IgdGhlIGVsZW1lbnQgZm91bmQgb3IgbnVsbCBpZiBubyBlbGVtZW50IHdhcyBmb3VuZFxuICAgKi9cbiAgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcikge1xuICAgIHZhciBmb3VuZE5vZGVzID0gdGhpcy5fbm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gZm91bmROb2Rlcy5sZW5ndGggPyBuZXcgQ2hhcnRpc3QuU3ZnLkxpc3QoZm91bmROb2RlcykgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBmb3JlaWduT2JqZWN0IChzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvU1ZHL0VsZW1lbnQvZm9yZWlnbk9iamVjdCkgdGhhdCBhbGxvd3MgdG8gZW1iZWQgSFRNTCBjb250ZW50IGludG8gYSBTVkcgZ3JhcGhpYy4gV2l0aCB0aGUgaGVscCBvZiBmb3JlaWduT2JqZWN0cyB5b3UgY2FuIGVuYWJsZSB0aGUgdXNhZ2Ugb2YgcmVndWxhciBIVE1MIGVsZW1lbnRzIGluc2lkZSBvZiBTVkcgd2hlcmUgdGhleSBhcmUgc3ViamVjdCBmb3IgU1ZHIHBvc2l0aW9uaW5nIGFuZCB0cmFuc2Zvcm1hdGlvbiBidXQgdGhlIEJyb3dzZXIgd2lsbCB1c2UgdGhlIEhUTUwgcmVuZGVyaW5nIGNhcGFiaWxpdGllcyBmb3IgdGhlIGNvbnRhaW5pbmcgRE9NLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7Tm9kZXxTdHJpbmd9IGNvbnRlbnQgVGhlIERPTSBOb2RlLCBvciBIVE1MIHN0cmluZyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgRE9NIE5vZGUsIHRoYXQgaXMgdGhlbiBwbGFjZWQgaW50byBhbmQgd3JhcHBlZCBieSB0aGUgZm9yZWlnbk9iamVjdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2F0dHJpYnV0ZXNdIEFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGFkZGVkIGFzIGF0dHJpYnV0ZXMgdG8gdGhlIGZvcmVpZ25PYmplY3QgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWQuIEF0dHJpYnV0ZXMgd2l0aCB1bmRlZmluZWQgdmFsdWVzIHdpbGwgbm90IGJlIGFkZGVkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2NsYXNzTmFtZV0gVGhpcyBjbGFzcyBvciBjbGFzcyBsaXN0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNWRyBlbGVtZW50XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2luc2VydEZpcnN0XSBTcGVjaWZpZXMgaWYgdGhlIGZvcmVpZ25PYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIGFzIGZpcnN0IGNoaWxkXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gTmV3IHdyYXBwZXIgb2JqZWN0IHRoYXQgd3JhcHMgdGhlIGZvcmVpZ25PYmplY3QgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gZm9yZWlnbk9iamVjdChjb250ZW50LCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIGluc2VydEZpcnN0KSB7XG4gICAgLy8gSWYgY29udGVudCBpcyBzdHJpbmcgdGhlbiB3ZSBjb252ZXJ0IGl0IHRvIERPTVxuICAgIC8vIFRPRE86IEhhbmRsZSBjYXNlIHdoZXJlIGNvbnRlbnQgaXMgbm90IGEgc3RyaW5nIG5vciBhIERPTSBOb2RlXG4gICAgaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgIGNvbnRlbnQgPSBjb250YWluZXIuZmlyc3RDaGlsZDtcbiAgICB9XG5cbiAgICAvLyBBZGRpbmcgbmFtZXNwYWNlIHRvIGNvbnRlbnQgZWxlbWVudFxuICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCd4bWxucycsIHhodG1sTnMpO1xuXG4gICAgLy8gQ3JlYXRpbmcgdGhlIGZvcmVpZ25PYmplY3Qgd2l0aG91dCByZXF1aXJlZCBleHRlbnNpb24gYXR0cmlidXRlIChhcyBkZXNjcmliZWQgaGVyZVxuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9leHRlbmQuaHRtbCNGb3JlaWduT2JqZWN0RWxlbWVudClcbiAgICB2YXIgZm5PYmogPSB0aGlzLmVsZW0oJ2ZvcmVpZ25PYmplY3QnLCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIGluc2VydEZpcnN0KTtcblxuICAgIC8vIEFkZCBjb250ZW50IHRvIGZvcmVpZ25PYmplY3RFbGVtZW50XG4gICAgZm5PYmouX25vZGUuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICByZXR1cm4gZm5PYmo7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgYWRkcyBhIG5ldyB0ZXh0IGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHQgVGhlIHRleHQgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHRleHQgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgc2FtZSB3cmFwcGVyIG9iamVjdCB0aGF0IHdhcyB1c2VkIHRvIGFkZCB0aGUgbmV3bHkgY3JlYXRlZCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiB0ZXh0KHQpIHtcbiAgICB0aGlzLl9ub2RlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHQpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIGNsZWFyIGFsbCBjaGlsZCBub2RlcyBvZiB0aGUgY3VycmVudCB3cmFwcGVyIG9iamVjdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBzYW1lIHdyYXBwZXIgb2JqZWN0IHRoYXQgZ290IGVtcHRpZWRcbiAgICovXG4gIGZ1bmN0aW9uIGVtcHR5KCkge1xuICAgIHdoaWxlICh0aGlzLl9ub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMuX25vZGUucmVtb3ZlQ2hpbGQodGhpcy5fbm9kZS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIGNhdXNlIHRoZSBjdXJyZW50IHdyYXBwZXIgdG8gcmVtb3ZlIGl0c2VsZiBmcm9tIGl0cyBwYXJlbnQgd3JhcHBlci4gVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSdkIGxpa2UgdG8gZ2V0IHJpZCBvZiBhbiBlbGVtZW50IGluIGEgZ2l2ZW4gRE9NIHN0cnVjdHVyZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBwYXJlbnQgd3JhcHBlciBvYmplY3Qgb2YgdGhlIGVsZW1lbnQgdGhhdCBnb3QgcmVtb3ZlZFxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgIHRoaXMuX25vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9ub2RlKTtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJlcGxhY2UgdGhlIGVsZW1lbnQgd2l0aCBhIG5ldyBlbGVtZW50IHRoYXQgY2FuIGJlIGNyZWF0ZWQgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBET00uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtDaGFydGlzdC5Tdmd9IG5ld0VsZW1lbnQgVGhlIG5ldyBDaGFydGlzdC5Tdmcgb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgdGhlIGN1cnJlbnQgd3JhcHBlciBvYmplY3RcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgbmV3IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2UobmV3RWxlbWVudCkge1xuICAgIHRoaXMuX25vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3RWxlbWVudC5fbm9kZSwgdGhpcy5fbm9kZSk7XG4gICAgcmV0dXJuIG5ld0VsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCBhcHBlbmQgYW4gZWxlbWVudCB0byB0aGUgY3VycmVudCBlbGVtZW50IGFzIGEgY2hpbGQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtDaGFydGlzdC5Tdmd9IGVsZW1lbnQgVGhlIENoYXJ0aXN0LlN2ZyBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIGFkZGVkIGFzIGEgY2hpbGRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zZXJ0Rmlyc3RdIFNwZWNpZmllcyBpZiB0aGUgZWxlbWVudCBzaG91bGQgYmUgaW5zZXJ0ZWQgYXMgZmlyc3QgY2hpbGRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgYXBwZW5kZWQgb2JqZWN0XG4gICAqL1xuICBmdW5jdGlvbiBhcHBlbmQoZWxlbWVudCwgaW5zZXJ0Rmlyc3QpIHtcbiAgICBpZihpbnNlcnRGaXJzdCAmJiB0aGlzLl9ub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMuX25vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQuX25vZGUsIHRoaXMuX25vZGUuZmlyc3RDaGlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25vZGUuYXBwZW5kQ2hpbGQoZWxlbWVudC5fbm9kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBjbGFzcyBuYW1lcyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGUgY3VycmVudCB3cmFwcGVyIGVsZW1lbnQuIFRoaXMgbWV0aG9kIGNhbiBub3QgYmUgY2hhaW5lZCBmdXJ0aGVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0FycmF5fSBBIGxpc3Qgb2YgY2xhc3NlcyBvciBhbiBlbXB0eSBhcnJheSBpZiB0aGVyZSBhcmUgbm8gY2xhc3NlcyBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBjbGFzc2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSA/IHRoaXMuX25vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpLnRyaW0oKS5zcGxpdCgvXFxzKy8pIDogW107XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBvbmUgb3IgYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzc2VzIHRvIHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kIGVuc3VyZXMgdGhlIGNsYXNzZXMgYXJlIG9ubHkgZXhpc3Rpbmcgb25jZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXMgQSB3aGl0ZSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzcyBuYW1lc1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIGFkZENsYXNzKG5hbWVzKSB7XG4gICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJyxcbiAgICAgIHRoaXMuY2xhc3Nlcyh0aGlzLl9ub2RlKVxuICAgICAgICAuY29uY2F0KG5hbWVzLnRyaW0oKS5zcGxpdCgvXFxzKy8pKVxuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGVsZW0sIHBvcywgc2VsZikge1xuICAgICAgICAgIHJldHVybiBzZWxmLmluZGV4T2YoZWxlbSkgPT09IHBvcztcbiAgICAgICAgfSkuam9pbignICcpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgb25lIG9yIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3NlcyBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzIEEgd2hpdGUgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3MgbmFtZXNcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhuYW1lcykge1xuICAgIHZhciByZW1vdmVkQ2xhc3NlcyA9IG5hbWVzLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuXG4gICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhpcy5jbGFzc2VzKHRoaXMuX25vZGUpLmZpbHRlcihmdW5jdGlvbihuYW1lKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlZENsYXNzZXMuaW5kZXhPZihuYW1lKSA9PT0gLTE7XG4gICAgfSkuam9pbignICcpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGNsYXNzZXMgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlQWxsQ2xhc3NlcygpIHtcbiAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnJyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBcIlNhdmVcIiB3YXkgdG8gZ2V0IHByb3BlcnR5IHZhbHVlIGZyb20gc3ZnIEJvdW5kaW5nQm94LlxuICAgKiBUaGlzIGlzIGEgd29ya2Fyb3VuZC4gRmlyZWZveCB0aHJvd3MgYW4gTlNfRVJST1JfRkFJTFVSRSBlcnJvciBpZiBnZXRCQm94KCkgaXMgY2FsbGVkIG9uIGFuIGludmlzaWJsZSBub2RlLlxuICAgKiBTZWUgW05TX0VSUk9SX0ZBSUxVUkU6IENvbXBvbmVudCByZXR1cm5lZCBmYWlsdXJlIGNvZGU6IDB4ODAwMDQwMDVdKGh0dHA6Ly9qc2ZpZGRsZS5uZXQvc3ltM3RyaS9rV1dESy8pXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBub2RlIFRoZSBzdmcgbm9kZSB0b1xuICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcCBUaGUgcHJvcGVydHkgdG8gZmV0Y2ggKGV4LjogaGVpZ2h0LCB3aWR0aCwgLi4uKVxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgdmFsdWUgb2YgdGhlIGdpdmVuIGJib3ggcHJvcGVydHlcbiAgICovXG4gIGZ1bmN0aW9uIGdldEJCb3hQcm9wZXJ0eShub2RlLCBwcm9wKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBub2RlLmdldEJCb3goKVtwcm9wXTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZWxlbWVudCBoZWlnaHQgd2l0aCBmYWxsYmFjayB0byBzdmcgQm91bmRpbmdCb3ggb3IgcGFyZW50IGNvbnRhaW5lciBkaW1lbnNpb25zOlxuICAgKiBTZWUgW2J1Z3ppbGxhLm1vemlsbGEub3JnXShodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01MzA5ODUpXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgZWxlbWVudHMgaGVpZ2h0IGluIHBpeGVsc1xuICAgKi9cbiAgZnVuY3Rpb24gaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLmNsaWVudEhlaWdodCB8fCBNYXRoLnJvdW5kKGdldEJCb3hQcm9wZXJ0eSh0aGlzLl9ub2RlLCAnaGVpZ2h0JykpIHx8IHRoaXMuX25vZGUucGFyZW50Tm9kZS5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGVsZW1lbnQgd2lkdGggd2l0aCBmYWxsYmFjayB0byBzdmcgQm91bmRpbmdCb3ggb3IgcGFyZW50IGNvbnRhaW5lciBkaW1lbnNpb25zOlxuICAgKiBTZWUgW2J1Z3ppbGxhLm1vemlsbGEub3JnXShodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01MzA5ODUpXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGVsZW1lbnRzIHdpZHRoIGluIHBpeGVsc1xuICAgKi9cbiAgZnVuY3Rpb24gd2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUuY2xpZW50V2lkdGggfHwgTWF0aC5yb3VuZChnZXRCQm94UHJvcGVydHkodGhpcy5fbm9kZSwgJ3dpZHRoJykpIHx8IHRoaXMuX25vZGUucGFyZW50Tm9kZS5jbGllbnRXaWR0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYW5pbWF0ZSBmdW5jdGlvbiBsZXRzIHlvdSBhbmltYXRlIHRoZSBjdXJyZW50IGVsZW1lbnQgd2l0aCBTTUlMIGFuaW1hdGlvbnMuIFlvdSBjYW4gYWRkIGFuaW1hdGlvbnMgZm9yIG11bHRpcGxlIGF0dHJpYnV0ZXMgYXQgdGhlIHNhbWUgdGltZSBieSB1c2luZyBhbiBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QuIFRoaXMgb2JqZWN0IHNob3VsZCBjb250YWluIFNNSUwgYW5pbWF0aW9uIGF0dHJpYnV0ZXMuIFBsZWFzZSByZWZlciB0byBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvYW5pbWF0ZS5odG1sIGZvciBhIGRldGFpbGVkIHNwZWNpZmljYXRpb24gYWJvdXQgdGhlIGF2YWlsYWJsZSBhbmltYXRpb24gYXR0cmlidXRlcy4gQWRkaXRpb25hbGx5IGFuIGVhc2luZyBwcm9wZXJ0eSBjYW4gYmUgcGFzc2VkIGluIHRoZSBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QuIFRoaXMgY2FuIGJlIGEgc3RyaW5nIHdpdGggYSBuYW1lIG9mIGFuIGVhc2luZyBmdW5jdGlvbiBpbiBgQ2hhcnRpc3QuU3ZnLkVhc2luZ2Agb3IgYW4gYXJyYXkgd2l0aCBmb3VyIG51bWJlcnMgc3BlY2lmeWluZyBhIGN1YmljIELDqXppZXIgY3VydmUuXG4gICAqICoqQW4gYW5pbWF0aW9ucyBvYmplY3QgY291bGQgbG9vayBsaWtlIHRoaXM6KipcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBlbGVtZW50LmFuaW1hdGUoe1xuICAgKiAgIG9wYWNpdHk6IHtcbiAgICogICAgIGR1cjogMTAwMCxcbiAgICogICAgIGZyb206IDAsXG4gICAqICAgICB0bzogMVxuICAgKiAgIH0sXG4gICAqICAgeDE6IHtcbiAgICogICAgIGR1cjogJzEwMDBtcycsXG4gICAqICAgICBmcm9tOiAxMDAsXG4gICAqICAgICB0bzogMjAwLFxuICAgKiAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xuICAgKiAgIH0sXG4gICAqICAgeTE6IHtcbiAgICogICAgIGR1cjogJzJzJyxcbiAgICogICAgIGZyb206IDAsXG4gICAqICAgICB0bzogMTAwXG4gICAqICAgfVxuICAgKiB9KTtcbiAgICogYGBgXG4gICAqICoqQXV0b21hdGljIHVuaXQgY29udmVyc2lvbioqXG4gICAqIEZvciB0aGUgYGR1cmAgYW5kIHRoZSBgYmVnaW5gIGFuaW1hdGUgYXR0cmlidXRlIHlvdSBjYW4gYWxzbyBvbWl0IGEgdW5pdCBieSBwYXNzaW5nIGEgbnVtYmVyLiBUaGUgbnVtYmVyIHdpbGwgYXV0b21hdGljYWxseSBiZSBjb252ZXJ0ZWQgdG8gbWlsbGkgc2Vjb25kcy5cbiAgICogKipHdWlkZWQgbW9kZSoqXG4gICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIFNNSUwgYW5pbWF0aW9ucyB3aXRoIG9mZnNldCB1c2luZyB0aGUgYGJlZ2luYCBhdHRyaWJ1dGUgaXMgdGhhdCB0aGUgYXR0cmlidXRlIHdpbGwga2VlcCBpdCdzIG9yaWdpbmFsIHZhbHVlIHVudGlsIHRoZSBhbmltYXRpb24gc3RhcnRzLiBNb3N0bHkgdGhpcyBiZWhhdmlvciBpcyBub3QgZGVzaXJlZCBhcyB5b3UnZCBsaWtlIHRvIGhhdmUgeW91ciBlbGVtZW50IGF0dHJpYnV0ZXMgYWxyZWFkeSBpbml0aWFsaXplZCB3aXRoIHRoZSBhbmltYXRpb24gYGZyb21gIHZhbHVlIGV2ZW4gYmVmb3JlIHRoZSBhbmltYXRpb24gc3RhcnRzLiBBbHNvIGlmIHlvdSBkb24ndCBzcGVjaWZ5IGBmaWxsPVwiZnJlZXplXCJgIG9uIGFuIGFuaW1hdGUgZWxlbWVudCBvciBpZiB5b3UgZGVsZXRlIHRoZSBhbmltYXRpb24gYWZ0ZXIgaXQncyBkb25lICh3aGljaCBpcyBkb25lIGluIGd1aWRlZCBtb2RlKSB0aGUgYXR0cmlidXRlIHdpbGwgc3dpdGNoIGJhY2sgdG8gdGhlIGluaXRpYWwgdmFsdWUuIFRoaXMgYmVoYXZpb3IgaXMgYWxzbyBub3QgZGVzaXJlZCB3aGVuIHBlcmZvcm1pbmcgc2ltcGxlIG9uZS10aW1lIGFuaW1hdGlvbnMuIEZvciBvbmUtdGltZSBhbmltYXRpb25zIHlvdSdkIHdhbnQgdG8gdHJpZ2dlciBhbmltYXRpb25zIGltbWVkaWF0ZWx5IGluc3RlYWQgb2YgcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50IGJlZ2luIHRpbWUuIFRoYXQncyB3aHkgaW4gZ3VpZGVkIG1vZGUgQ2hhcnRpc3QuU3ZnIHdpbGwgYWxzbyB1c2UgdGhlIGBiZWdpbmAgcHJvcGVydHkgdG8gc2NoZWR1bGUgYSB0aW1lb3V0IGFuZCBtYW51YWxseSBzdGFydCB0aGUgYW5pbWF0aW9uIGFmdGVyIHRoZSB0aW1lb3V0LiBJZiB5b3UncmUgdXNpbmcgbXVsdGlwbGUgU01JTCBkZWZpbml0aW9uIG9iamVjdHMgZm9yIGFuIGF0dHJpYnV0ZSAoaW4gYW4gYXJyYXkpLCBndWlkZWQgbW9kZSB3aWxsIGJlIGRpc2FibGVkIGZvciB0aGlzIGF0dHJpYnV0ZSwgZXZlbiBpZiB5b3UgZXhwbGljaXRseSBlbmFibGVkIGl0LlxuICAgKiBJZiBndWlkZWQgbW9kZSBpcyBlbmFibGVkIHRoZSBmb2xsb3dpbmcgYmVoYXZpb3IgaXMgYWRkZWQ6XG4gICAqIC0gQmVmb3JlIHRoZSBhbmltYXRpb24gc3RhcnRzIChldmVuIHdoZW4gZGVsYXllZCB3aXRoIGBiZWdpbmApIHRoZSBhbmltYXRlZCBhdHRyaWJ1dGUgd2lsbCBiZSBzZXQgYWxyZWFkeSB0byB0aGUgYGZyb21gIHZhbHVlIG9mIHRoZSBhbmltYXRpb25cbiAgICogLSBgYmVnaW5gIGlzIGV4cGxpY2l0bHkgc2V0IHRvIGBpbmRlZmluaXRlYCBzbyBpdCBjYW4gYmUgc3RhcnRlZCBtYW51YWxseSB3aXRob3V0IHJlbHlpbmcgb24gZG9jdW1lbnQgYmVnaW4gdGltZSAoY3JlYXRpb24pXG4gICAqIC0gVGhlIGFuaW1hdGUgZWxlbWVudCB3aWxsIGJlIGZvcmNlZCB0byB1c2UgYGZpbGw9XCJmcmVlemVcImBcbiAgICogLSBUaGUgYW5pbWF0aW9uIHdpbGwgYmUgdHJpZ2dlcmVkIHdpdGggYGJlZ2luRWxlbWVudCgpYCBpbiBhIHRpbWVvdXQgd2hlcmUgYGJlZ2luYCBvZiB0aGUgZGVmaW5pdGlvbiBvYmplY3QgaXMgaW50ZXJwcmV0ZWQgaW4gbWlsbGkgc2Vjb25kcy4gSWYgbm8gYGJlZ2luYCB3YXMgc3BlY2lmaWVkIHRoZSB0aW1lb3V0IGlzIHRyaWdnZXJlZCBpbW1lZGlhdGVseS5cbiAgICogLSBBZnRlciB0aGUgYW5pbWF0aW9uIHRoZSBlbGVtZW50IGF0dHJpYnV0ZSB2YWx1ZSB3aWxsIGJlIHNldCB0byB0aGUgYHRvYCB2YWx1ZSBvZiB0aGUgYW5pbWF0aW9uXG4gICAqIC0gVGhlIGFuaW1hdGUgZWxlbWVudCBpcyBkZWxldGVkIGZyb20gdGhlIERPTVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhbmltYXRpb25zIEFuIGFuaW1hdGlvbnMgb2JqZWN0IHdoZXJlIHRoZSBwcm9wZXJ0eSBrZXlzIGFyZSB0aGUgYXR0cmlidXRlcyB5b3UnZCBsaWtlIHRvIGFuaW1hdGUuIFRoZSBwcm9wZXJ0aWVzIHNob3VsZCBiZSBvYmplY3RzIGFnYWluIHRoYXQgY29udGFpbiB0aGUgU01JTCBhbmltYXRpb24gYXR0cmlidXRlcyAodXN1YWxseSBiZWdpbiwgZHVyLCBmcm9tLCBhbmQgdG8pLiBUaGUgcHJvcGVydHkgYmVnaW4gYW5kIGR1ciBpcyBhdXRvIGNvbnZlcnRlZCAoc2VlIEF1dG9tYXRpYyB1bml0IGNvbnZlcnNpb24pLiBZb3UgY2FuIGFsc28gc2NoZWR1bGUgbXVsdGlwbGUgYW5pbWF0aW9ucyBmb3IgdGhlIHNhbWUgYXR0cmlidXRlIGJ5IHBhc3NpbmcgYW4gQXJyYXkgb2YgU01JTCBkZWZpbml0aW9uIG9iamVjdHMuIEF0dHJpYnV0ZXMgdGhhdCBjb250YWluIGFuIGFycmF5IG9mIFNNSUwgZGVmaW5pdGlvbiBvYmplY3RzIHdpbGwgbm90IGJlIGV4ZWN1dGVkIGluIGd1aWRlZCBtb2RlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGd1aWRlZCBTcGVjaWZ5IGlmIGd1aWRlZCBtb2RlIHNob3VsZCBiZSBhY3RpdmF0ZWQgZm9yIHRoaXMgYW5pbWF0aW9uIChzZWUgR3VpZGVkIG1vZGUpLiBJZiBub3Qgb3RoZXJ3aXNlIHNwZWNpZmllZCwgZ3VpZGVkIG1vZGUgd2lsbCBiZSBhY3RpdmF0ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudEVtaXR0ZXIgSWYgc3BlY2lmaWVkLCB0aGlzIGV2ZW50IGVtaXR0ZXIgd2lsbCBiZSBub3RpZmllZCB3aGVuIGFuIGFuaW1hdGlvbiBzdGFydHMgb3IgZW5kcy5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgY3VycmVudCBlbGVtZW50IHdoZXJlIHRoZSBhbmltYXRpb24gd2FzIGFkZGVkXG4gICAqL1xuICBmdW5jdGlvbiBhbmltYXRlKGFuaW1hdGlvbnMsIGd1aWRlZCwgZXZlbnRFbWl0dGVyKSB7XG4gICAgaWYoZ3VpZGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGd1aWRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoYW5pbWF0aW9ucykuZm9yRWFjaChmdW5jdGlvbiBjcmVhdGVBbmltYXRlRm9yQXR0cmlidXRlcyhhdHRyaWJ1dGUpIHtcblxuICAgICAgZnVuY3Rpb24gY3JlYXRlQW5pbWF0ZShhbmltYXRpb25EZWZpbml0aW9uLCBndWlkZWQpIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZVByb3BlcnRpZXMgPSB7fSxcbiAgICAgICAgICBhbmltYXRlLFxuICAgICAgICAgIHRpbWVvdXQsXG4gICAgICAgICAgZWFzaW5nO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGFuIGVhc2luZyBpcyBzcGVjaWZpZWQgaW4gdGhlIGRlZmluaXRpb24gb2JqZWN0IGFuZCBkZWxldGUgaXQgZnJvbSB0aGUgb2JqZWN0IGFzIGl0IHdpbGwgbm90XG4gICAgICAgIC8vIGJlIHBhcnQgb2YgdGhlIGFuaW1hdGUgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICAgICAgICBpZihhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZykge1xuICAgICAgICAgIC8vIElmIGFscmVhZHkgYW4gZWFzaW5nIELDqXppZXIgY3VydmUgYXJyYXkgd2UgdGFrZSBpdCBvciB3ZSBsb29rdXAgYSBlYXNpbmcgYXJyYXkgaW4gdGhlIEVhc2luZyBvYmplY3RcbiAgICAgICAgICBlYXNpbmcgPSBhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZyBpbnN0YW5jZW9mIEFycmF5ID9cbiAgICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nIDpcbiAgICAgICAgICAgIENoYXJ0aXN0LlN2Zy5FYXNpbmdbYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmddO1xuICAgICAgICAgIGRlbGV0ZSBhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG51bWVyaWMgZHVyIG9yIGJlZ2luIHdhcyBwcm92aWRlZCB3ZSBhc3N1bWUgbWlsbGkgc2Vjb25kc1xuICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luID0gQ2hhcnRpc3QuZW5zdXJlVW5pdChhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luLCAnbXMnKTtcbiAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5kdXIgPSBDaGFydGlzdC5lbnN1cmVVbml0KGFuaW1hdGlvbkRlZmluaXRpb24uZHVyLCAnbXMnKTtcblxuICAgICAgICBpZihlYXNpbmcpIHtcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmNhbGNNb2RlID0gJ3NwbGluZSc7XG4gICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5rZXlTcGxpbmVzID0gZWFzaW5nLmpvaW4oJyAnKTtcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmtleVRpbWVzID0gJzA7MSc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGRpbmcgXCJmaWxsOiBmcmVlemVcIiBpZiB3ZSBhcmUgaW4gZ3VpZGVkIG1vZGUgYW5kIHNldCBpbml0aWFsIGF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAgICAgaWYoZ3VpZGVkKSB7XG4gICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5maWxsID0gJ2ZyZWV6ZSc7XG4gICAgICAgICAgLy8gQW5pbWF0ZWQgcHJvcGVydHkgb24gb3VyIGVsZW1lbnQgc2hvdWxkIGFscmVhZHkgYmUgc2V0IHRvIHRoZSBhbmltYXRpb24gZnJvbSB2YWx1ZSBpbiBndWlkZWQgbW9kZVxuICAgICAgICAgIGF0dHJpYnV0ZVByb3BlcnRpZXNbYXR0cmlidXRlXSA9IGFuaW1hdGlvbkRlZmluaXRpb24uZnJvbTtcbiAgICAgICAgICB0aGlzLmF0dHIoYXR0cmlidXRlUHJvcGVydGllcyk7XG5cbiAgICAgICAgICAvLyBJbiBndWlkZWQgbW9kZSB3ZSBhbHNvIHNldCBiZWdpbiB0byBpbmRlZmluaXRlIHNvIHdlIGNhbiB0cmlnZ2VyIHRoZSBzdGFydCBtYW51YWxseSBhbmQgcHV0IHRoZSBiZWdpblxuICAgICAgICAgIC8vIHdoaWNoIG5lZWRzIHRvIGJlIGluIG1zIGFzaWRlXG4gICAgICAgICAgdGltZW91dCA9IENoYXJ0aXN0LnF1YW50aXR5KGFuaW1hdGlvbkRlZmluaXRpb24uYmVnaW4gfHwgMCkudmFsdWU7XG4gICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5iZWdpbiA9ICdpbmRlZmluaXRlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGFuaW1hdGUgPSB0aGlzLmVsZW0oJ2FuaW1hdGUnLCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6IGF0dHJpYnV0ZVxuICAgICAgICB9LCBhbmltYXRpb25EZWZpbml0aW9uKSk7XG5cbiAgICAgICAgaWYoZ3VpZGVkKSB7XG4gICAgICAgICAgLy8gSWYgZ3VpZGVkIHdlIHRha2UgdGhlIHZhbHVlIHRoYXQgd2FzIHB1dCBhc2lkZSBpbiB0aW1lb3V0IGFuZCB0cmlnZ2VyIHRoZSBhbmltYXRpb24gbWFudWFsbHkgd2l0aCBhIHRpbWVvdXRcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gSWYgYmVnaW5FbGVtZW50IGZhaWxzIHdlIHNldCB0aGUgYW5pbWF0ZWQgYXR0cmlidXRlIHRvIHRoZSBlbmQgcG9zaXRpb24gYW5kIHJlbW92ZSB0aGUgYW5pbWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaWYgdGhlIFNNSUwgRWxlbWVudFRpbWVDb250cm9sIGludGVyZmFjZSBpcyBub3Qgc3VwcG9ydGVkIG9yIGFueSBvdGhlciBwcm9ibGVtcyBvY2N1cmVkIGluXG4gICAgICAgICAgICAvLyB0aGUgYnJvd3Nlci4gKEN1cnJlbnRseSBGRiAzNCBkb2VzIG5vdCBzdXBwb3J0IGFuaW1hdGUgZWxlbWVudHMgaW4gZm9yZWlnbk9iamVjdHMpXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBhbmltYXRlLl9ub2RlLmJlZ2luRWxlbWVudCgpO1xuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gU2V0IGFuaW1hdGVkIGF0dHJpYnV0ZSB0byBjdXJyZW50IGFuaW1hdGVkIHZhbHVlXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVByb3BlcnRpZXNbYXR0cmlidXRlXSA9IGFuaW1hdGlvbkRlZmluaXRpb24udG87XG4gICAgICAgICAgICAgIHRoaXMuYXR0cihhdHRyaWJ1dGVQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbmltYXRlIGVsZW1lbnQgYXMgaXQncyBubyBsb25nZXIgcmVxdWlyZWRcbiAgICAgICAgICAgICAgYW5pbWF0ZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcyksIHRpbWVvdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZXZlbnRFbWl0dGVyKSB7XG4gICAgICAgICAgYW5pbWF0ZS5fbm9kZS5hZGRFdmVudExpc3RlbmVyKCdiZWdpbkV2ZW50JywgZnVuY3Rpb24gaGFuZGxlQmVnaW5FdmVudCgpIHtcbiAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdhbmltYXRpb25CZWdpbicsIHtcbiAgICAgICAgICAgICAgZWxlbWVudDogdGhpcyxcbiAgICAgICAgICAgICAgYW5pbWF0ZTogYW5pbWF0ZS5fbm9kZSxcbiAgICAgICAgICAgICAgcGFyYW1zOiBhbmltYXRpb25EZWZpbml0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5pbWF0ZS5fbm9kZS5hZGRFdmVudExpc3RlbmVyKCdlbmRFdmVudCcsIGZ1bmN0aW9uIGhhbmRsZUVuZEV2ZW50KCkge1xuICAgICAgICAgIGlmKGV2ZW50RW1pdHRlcikge1xuICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2FuaW1hdGlvbkVuZCcsIHtcbiAgICAgICAgICAgICAgZWxlbWVudDogdGhpcyxcbiAgICAgICAgICAgICAgYW5pbWF0ZTogYW5pbWF0ZS5fbm9kZSxcbiAgICAgICAgICAgICAgcGFyYW1zOiBhbmltYXRpb25EZWZpbml0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihndWlkZWQpIHtcbiAgICAgICAgICAgIC8vIFNldCBhbmltYXRlZCBhdHRyaWJ1dGUgdG8gY3VycmVudCBhbmltYXRlZCB2YWx1ZVxuICAgICAgICAgICAgYXR0cmlidXRlUHJvcGVydGllc1thdHRyaWJ1dGVdID0gYW5pbWF0aW9uRGVmaW5pdGlvbi50bztcbiAgICAgICAgICAgIHRoaXMuYXR0cihhdHRyaWJ1dGVQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgYW5pbWF0ZSBlbGVtZW50IGFzIGl0J3Mgbm8gbG9uZ2VyIHJlcXVpcmVkXG4gICAgICAgICAgICBhbmltYXRlLnJlbW92ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgY3VycmVudCBhdHRyaWJ1dGUgaXMgYW4gYXJyYXkgb2YgZGVmaW5pdGlvbiBvYmplY3RzIHdlIGNyZWF0ZSBhbiBhbmltYXRlIGZvciBlYWNoIGFuZCBkaXNhYmxlIGd1aWRlZCBtb2RlXG4gICAgICBpZihhbmltYXRpb25zW2F0dHJpYnV0ZV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBhbmltYXRpb25zW2F0dHJpYnV0ZV0uZm9yRWFjaChmdW5jdGlvbihhbmltYXRpb25EZWZpbml0aW9uKSB7XG4gICAgICAgICAgY3JlYXRlQW5pbWF0ZS5iaW5kKHRoaXMpKGFuaW1hdGlvbkRlZmluaXRpb24sIGZhbHNlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWF0ZUFuaW1hdGUuYmluZCh0aGlzKShhbmltYXRpb25zW2F0dHJpYnV0ZV0sIGd1aWRlZCk7XG4gICAgICB9XG5cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBDaGFydGlzdC5TdmcgPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBTdmcsXG4gICAgYXR0cjogYXR0cixcbiAgICBlbGVtOiBlbGVtLFxuICAgIHBhcmVudDogcGFyZW50LFxuICAgIHJvb3Q6IHJvb3QsXG4gICAgcXVlcnlTZWxlY3RvcjogcXVlcnlTZWxlY3RvcixcbiAgICBxdWVyeVNlbGVjdG9yQWxsOiBxdWVyeVNlbGVjdG9yQWxsLFxuICAgIGZvcmVpZ25PYmplY3Q6IGZvcmVpZ25PYmplY3QsXG4gICAgdGV4dDogdGV4dCxcbiAgICBlbXB0eTogZW1wdHksXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgcmVwbGFjZTogcmVwbGFjZSxcbiAgICBhcHBlbmQ6IGFwcGVuZCxcbiAgICBjbGFzc2VzOiBjbGFzc2VzLFxuICAgIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgICByZW1vdmVDbGFzczogcmVtb3ZlQ2xhc3MsXG4gICAgcmVtb3ZlQWxsQ2xhc3NlczogcmVtb3ZlQWxsQ2xhc3NlcyxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgYW5pbWF0ZTogYW5pbWF0ZVxuICB9KTtcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY2hlY2tzIGZvciBzdXBwb3J0IG9mIGEgZ2l2ZW4gU1ZHIGZlYXR1cmUgbGlrZSBFeHRlbnNpYmlsaXR5LCBTVkctYW5pbWF0aW9uIG9yIHRoZSBsaWtlLiBDaGVjayBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlIGZvciBhIGRldGFpbGVkIGxpc3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZlYXR1cmUgVGhlIFNWRyAxLjEgZmVhdHVyZSB0aGF0IHNob3VsZCBiZSBjaGVja2VkIGZvciBzdXBwb3J0LlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIG9mIGZhbHNlIGlmIHRoZSBmZWF0dXJlIGlzIHN1cHBvcnRlZCBvciBub3RcbiAgICovXG4gIENoYXJ0aXN0LlN2Zy5pc1N1cHBvcnRlZCA9IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uaGFzRmVhdHVyZSgnaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvZmVhdHVyZSMnICsgZmVhdHVyZSwgJzEuMScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIE9iamVjdCBjb250YWlucyBzb21lIHN0YW5kYXJkIGVhc2luZyBjdWJpYyBiZXppZXIgY3VydmVzLiBUaGVuIGNhbiBiZSB1c2VkIHdpdGggdGhlaXIgbmFtZSBpbiB0aGUgYENoYXJ0aXN0LlN2Zy5hbmltYXRlYC4gWW91IGNhbiBhbHNvIGV4dGVuZCB0aGUgbGlzdCBhbmQgdXNlIHlvdXIgb3duIG5hbWUgaW4gdGhlIGBhbmltYXRlYCBmdW5jdGlvbi4gQ2xpY2sgdGhlIHNob3cgY29kZSBidXR0b24gdG8gc2VlIHRoZSBhdmFpbGFibGUgYmV6aWVyIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKi9cbiAgdmFyIGVhc2luZ0N1YmljQmV6aWVycyA9IHtcbiAgICBlYXNlSW5TaW5lOiBbMC40NywgMCwgMC43NDUsIDAuNzE1XSxcbiAgICBlYXNlT3V0U2luZTogWzAuMzksIDAuNTc1LCAwLjU2NSwgMV0sXG4gICAgZWFzZUluT3V0U2luZTogWzAuNDQ1LCAwLjA1LCAwLjU1LCAwLjk1XSxcbiAgICBlYXNlSW5RdWFkOiBbMC41NSwgMC4wODUsIDAuNjgsIDAuNTNdLFxuICAgIGVhc2VPdXRRdWFkOiBbMC4yNSwgMC40NiwgMC40NSwgMC45NF0sXG4gICAgZWFzZUluT3V0UXVhZDogWzAuNDU1LCAwLjAzLCAwLjUxNSwgMC45NTVdLFxuICAgIGVhc2VJbkN1YmljOiBbMC41NSwgMC4wNTUsIDAuNjc1LCAwLjE5XSxcbiAgICBlYXNlT3V0Q3ViaWM6IFswLjIxNSwgMC42MSwgMC4zNTUsIDFdLFxuICAgIGVhc2VJbk91dEN1YmljOiBbMC42NDUsIDAuMDQ1LCAwLjM1NSwgMV0sXG4gICAgZWFzZUluUXVhcnQ6IFswLjg5NSwgMC4wMywgMC42ODUsIDAuMjJdLFxuICAgIGVhc2VPdXRRdWFydDogWzAuMTY1LCAwLjg0LCAwLjQ0LCAxXSxcbiAgICBlYXNlSW5PdXRRdWFydDogWzAuNzcsIDAsIDAuMTc1LCAxXSxcbiAgICBlYXNlSW5RdWludDogWzAuNzU1LCAwLjA1LCAwLjg1NSwgMC4wNl0sXG4gICAgZWFzZU91dFF1aW50OiBbMC4yMywgMSwgMC4zMiwgMV0sXG4gICAgZWFzZUluT3V0UXVpbnQ6IFswLjg2LCAwLCAwLjA3LCAxXSxcbiAgICBlYXNlSW5FeHBvOiBbMC45NSwgMC4wNSwgMC43OTUsIDAuMDM1XSxcbiAgICBlYXNlT3V0RXhwbzogWzAuMTksIDEsIDAuMjIsIDFdLFxuICAgIGVhc2VJbk91dEV4cG86IFsxLCAwLCAwLCAxXSxcbiAgICBlYXNlSW5DaXJjOiBbMC42LCAwLjA0LCAwLjk4LCAwLjMzNV0sXG4gICAgZWFzZU91dENpcmM6IFswLjA3NSwgMC44MiwgMC4xNjUsIDFdLFxuICAgIGVhc2VJbk91dENpcmM6IFswLjc4NSwgMC4xMzUsIDAuMTUsIDAuODZdLFxuICAgIGVhc2VJbkJhY2s6IFswLjYsIC0wLjI4LCAwLjczNSwgMC4wNDVdLFxuICAgIGVhc2VPdXRCYWNrOiBbMC4xNzUsIDAuODg1LCAwLjMyLCAxLjI3NV0sXG4gICAgZWFzZUluT3V0QmFjazogWzAuNjgsIC0wLjU1LCAwLjI2NSwgMS41NV1cbiAgfTtcblxuICBDaGFydGlzdC5TdmcuRWFzaW5nID0gZWFzaW5nQ3ViaWNCZXppZXJzO1xuXG4gIC8qKlxuICAgKiBUaGlzIGhlbHBlciBjbGFzcyBpcyB0byB3cmFwIG11bHRpcGxlIGBDaGFydGlzdC5TdmdgIGVsZW1lbnRzIGludG8gYSBsaXN0IHdoZXJlIHlvdSBjYW4gY2FsbCB0aGUgYENoYXJ0aXN0LlN2Z2AgZnVuY3Rpb25zIG9uIGFsbCBlbGVtZW50cyBpbiB0aGUgbGlzdCB3aXRoIG9uZSBjYWxsLiBUaGlzIGlzIGhlbHBmdWwgd2hlbiB5b3UnZCBsaWtlIHRvIHBlcmZvcm0gY2FsbHMgd2l0aCBgQ2hhcnRpc3QuU3ZnYCBvbiBtdWx0aXBsZSBlbGVtZW50cy5cbiAgICogQW4gaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBpcyBhbHNvIHJldHVybmVkIGJ5IGBDaGFydGlzdC5TdmcucXVlcnlTZWxlY3RvckFsbGAuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtBcnJheTxOb2RlPnxOb2RlTGlzdH0gbm9kZUxpc3QgQW4gQXJyYXkgb2YgU1ZHIERPTSBub2RlcyBvciBhIFNWRyBET00gTm9kZUxpc3QgKGFzIHJldHVybmVkIGJ5IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gU3ZnTGlzdChub2RlTGlzdCkge1xuICAgIHZhciBsaXN0ID0gdGhpcztcblxuICAgIHRoaXMuc3ZnRWxlbWVudHMgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuc3ZnRWxlbWVudHMucHVzaChuZXcgQ2hhcnRpc3QuU3ZnKG5vZGVMaXN0W2ldKSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGRlbGVnYXRpb24gbWV0aG9kcyBmb3IgQ2hhcnRpc3QuU3ZnXG4gICAgT2JqZWN0LmtleXMoQ2hhcnRpc3QuU3ZnLnByb3RvdHlwZSkuZmlsdGVyKGZ1bmN0aW9uKHByb3RvdHlwZVByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gWydjb25zdHJ1Y3RvcicsXG4gICAgICAgICAgJ3BhcmVudCcsXG4gICAgICAgICAgJ3F1ZXJ5U2VsZWN0b3InLFxuICAgICAgICAgICdxdWVyeVNlbGVjdG9yQWxsJyxcbiAgICAgICAgICAncmVwbGFjZScsXG4gICAgICAgICAgJ2FwcGVuZCcsXG4gICAgICAgICAgJ2NsYXNzZXMnLFxuICAgICAgICAgICdoZWlnaHQnLFxuICAgICAgICAgICd3aWR0aCddLmluZGV4T2YocHJvdG90eXBlUHJvcGVydHkpID09PSAtMTtcbiAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uKHByb3RvdHlwZVByb3BlcnR5KSB7XG4gICAgICBsaXN0W3Byb3RvdHlwZVByb3BlcnR5XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgIGxpc3Quc3ZnRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgQ2hhcnRpc3QuU3ZnLnByb3RvdHlwZVtwcm90b3R5cGVQcm9wZXJ0eV0uYXBwbHkoZWxlbWVudCwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBDaGFydGlzdC5TdmcuTGlzdCA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IFN2Z0xpc3RcbiAgfSk7XG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBDaGFydGlzdCBTVkcgcGF0aCBtb2R1bGUgZm9yIFNWRyBwYXRoIGRlc2NyaXB0aW9uIGNyZWF0aW9uIGFuZCBtb2RpZmljYXRpb24uXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5TdmcuUGF0aFxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIENvbnRhaW5zIHRoZSBkZXNjcmlwdG9ycyBvZiBzdXBwb3J0ZWQgZWxlbWVudCB0eXBlcyBpbiBhIFNWRyBwYXRoLiBDdXJyZW50bHkgb25seSBtb3ZlLCBsaW5lIGFuZCBjdXJ2ZSBhcmUgc3VwcG9ydGVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHZhciBlbGVtZW50RGVzY3JpcHRpb25zID0ge1xuICAgIG06IFsneCcsICd5J10sXG4gICAgbDogWyd4JywgJ3knXSxcbiAgICBjOiBbJ3gxJywgJ3kxJywgJ3gyJywgJ3kyJywgJ3gnLCAneSddLFxuICAgIGE6IFsncngnLCAncnknLCAneEFyJywgJ2xBZicsICdzZicsICd4JywgJ3knXVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIG5ld2x5IGNyZWF0ZWQgU1ZHIHBhdGggb2JqZWN0cy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gVGhlIGFjY3VyYWN5IGluIGRpZ2l0IGNvdW50IGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LiBUaGlzIHdpbGwgYmUgdXNlZCB0byByb3VuZCBudW1iZXJzIGluIHRoZSBTVkcgcGF0aC4gSWYgdGhpcyBvcHRpb24gaXMgc2V0IHRvIGZhbHNlIHRoZW4gbm8gcm91bmRpbmcgd2lsbCBiZSBwZXJmb3JtZWQuXG4gICAgYWNjdXJhY3k6IDNcbiAgfTtcblxuICBmdW5jdGlvbiBlbGVtZW50KGNvbW1hbmQsIHBhcmFtcywgcGF0aEVsZW1lbnRzLCBwb3MsIHJlbGF0aXZlLCBkYXRhKSB7XG4gICAgdmFyIHBhdGhFbGVtZW50ID0gQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgIGNvbW1hbmQ6IHJlbGF0aXZlID8gY29tbWFuZC50b0xvd2VyQ2FzZSgpIDogY29tbWFuZC50b1VwcGVyQ2FzZSgpXG4gICAgfSwgcGFyYW1zLCBkYXRhID8geyBkYXRhOiBkYXRhIH0gOiB7fSApO1xuXG4gICAgcGF0aEVsZW1lbnRzLnNwbGljZShwb3MsIDAsIHBhdGhFbGVtZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvckVhY2hQYXJhbShwYXRoRWxlbWVudHMsIGNiKSB7XG4gICAgcGF0aEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24ocGF0aEVsZW1lbnQsIHBhdGhFbGVtZW50SW5kZXgpIHtcbiAgICAgIGVsZW1lbnREZXNjcmlwdGlvbnNbcGF0aEVsZW1lbnQuY29tbWFuZC50b0xvd2VyQ2FzZSgpXS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtTmFtZSwgcGFyYW1JbmRleCkge1xuICAgICAgICBjYihwYXRoRWxlbWVudCwgcGFyYW1OYW1lLCBwYXRoRWxlbWVudEluZGV4LCBwYXJhbUluZGV4LCBwYXRoRWxlbWVudHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCB0byBjb25zdHJ1Y3QgYSBuZXcgcGF0aCBvYmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlIElmIHNldCB0byB0cnVlIHRoZW4gdGhpcyBwYXRoIHdpbGwgYmUgY2xvc2VkIHdoZW4gc3RyaW5naWZpZWQgKHdpdGggYSBaIGF0IHRoZSBlbmQpXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0IHRoYXQgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IG9iamVjdHMuIFNlZSBkZWZhdWx0IG9wdGlvbnMgZm9yIG1vcmUgZGV0YWlscy5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBTdmdQYXRoKGNsb3NlLCBvcHRpb25zKSB7XG4gICAgdGhpcy5wYXRoRWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLnBvcyA9IDA7XG4gICAgdGhpcy5jbG9zZSA9IGNsb3NlO1xuICAgIHRoaXMub3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCBwb3NpdGlvbiAoY3Vyc29yKSBpbnNpZGUgb2YgdGhlIHBhdGguIFlvdSBjYW4gbW92ZSBhcm91bmQgdGhlIGN1cnNvciBmcmVlbHkgYnV0IGxpbWl0ZWQgdG8gMCBvciB0aGUgY291bnQgb2YgZXhpc3RpbmcgZWxlbWVudHMuIEFsbCBtb2RpZmljYXRpb25zIHdpdGggZWxlbWVudCBmdW5jdGlvbnMgd2lsbCBpbnNlcnQgbmV3IGVsZW1lbnRzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGlzIGN1cnNvci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbcG9zXSBJZiBhIG51bWJlciBpcyBwYXNzZWQgdGhlbiB0aGUgY3Vyc29yIGlzIHNldCB0byB0aGlzIHBvc2l0aW9uIGluIHRoZSBwYXRoIGVsZW1lbnQgYXJyYXkuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofE51bWJlcn0gSWYgdGhlIHBvc2l0aW9uIHBhcmFtZXRlciB3YXMgcGFzc2VkIHRoZW4gdGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIHRoZSBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLiBJZiBubyBwb3NpdGlvbiBwYXJhbWV0ZXIgd2FzIHBhc3NlZCB0aGVuIHRoZSBjdXJyZW50IHBvc2l0aW9uIGlzIHJldHVybmVkLlxuICAgKi9cbiAgZnVuY3Rpb24gcG9zaXRpb24ocG9zKSB7XG4gICAgaWYocG9zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMucG9zID0gTWF0aC5tYXgoMCwgTWF0aC5taW4odGhpcy5wYXRoRWxlbWVudHMubGVuZ3RoLCBwb3MpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3M7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgZWxlbWVudHMgZnJvbSB0aGUgcGF0aCBzdGFydGluZyBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgcGF0aCBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlKGNvdW50KSB7XG4gICAgdGhpcy5wYXRoRWxlbWVudHMuc3BsaWNlKHRoaXMucG9zLCBjb3VudCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYWRkIGEgbmV3IG1vdmUgU1ZHIHBhdGggZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBtb3ZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSBtb3ZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlbGF0aXZlXSBJZiBzZXQgdG8gdHJ1ZSB0aGUgbW92ZSBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZCB3aXRoIHJlbGF0aXZlIGNvb3JkaW5hdGVzIChsb3dlcmNhc2UgbGV0dGVyKVxuICAgKiBAcGFyYW0geyp9IFtkYXRhXSBBbnkgZGF0YSB0aGF0IHNob3VsZCBiZSBzdG9yZWQgd2l0aCB0aGUgZWxlbWVudCBvYmplY3QgdGhhdCB3aWxsIGJlIGFjY2Vzc2libGUgaW4gcGF0aEVsZW1lbnRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBtb3ZlKHgsIHksIHJlbGF0aXZlLCBkYXRhKSB7XG4gICAgZWxlbWVudCgnTScsIHtcbiAgICAgIHg6ICt4LFxuICAgICAgeTogK3lcbiAgICB9LCB0aGlzLnBhdGhFbGVtZW50cywgdGhpcy5wb3MrKywgcmVsYXRpdmUsIGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBsaW5lIFNWRyBwYXRoIGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgbGluZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgbGluZSBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZWxhdGl2ZV0gSWYgc2V0IHRvIHRydWUgdGhlIGxpbmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICogQHBhcmFtIHsqfSBbZGF0YV0gQW55IGRhdGEgdGhhdCBzaG91bGQgYmUgc3RvcmVkIHdpdGggdGhlIGVsZW1lbnQgb2JqZWN0IHRoYXQgd2lsbCBiZSBhY2Nlc3NpYmxlIGluIHBhdGhFbGVtZW50XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gbGluZSh4LCB5LCByZWxhdGl2ZSwgZGF0YSkge1xuICAgIGVsZW1lbnQoJ0wnLCB7XG4gICAgICB4OiAreCxcbiAgICAgIHk6ICt5XG4gICAgfSwgdGhpcy5wYXRoRWxlbWVudHMsIHRoaXMucG9zKyssIHJlbGF0aXZlLCBkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgY3VydmUgU1ZHIHBhdGggZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4MSBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgZmlyc3QgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgKiBAcGFyYW0ge051bWJlcn0geTEgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIGZpcnN0IGNvbnRyb2wgcG9pbnQgb2YgdGhlIGJlemllciBjdXJ2ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHgyIFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgKiBAcGFyYW0ge051bWJlcn0geTIgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIHNlY29uZCBjb250cm9sIHBvaW50IG9mIHRoZSBiZXppZXIgY3VydmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSB0YXJnZXQgcG9pbnQgb2YgdGhlIGN1cnZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSB0YXJnZXQgcG9pbnQgb2YgdGhlIGN1cnZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlbGF0aXZlXSBJZiBzZXQgdG8gdHJ1ZSB0aGUgY3VydmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICogQHBhcmFtIHsqfSBbZGF0YV0gQW55IGRhdGEgdGhhdCBzaG91bGQgYmUgc3RvcmVkIHdpdGggdGhlIGVsZW1lbnQgb2JqZWN0IHRoYXQgd2lsbCBiZSBhY2Nlc3NpYmxlIGluIHBhdGhFbGVtZW50XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gY3VydmUoeDEsIHkxLCB4MiwgeTIsIHgsIHksIHJlbGF0aXZlLCBkYXRhKSB7XG4gICAgZWxlbWVudCgnQycsIHtcbiAgICAgIHgxOiAreDEsXG4gICAgICB5MTogK3kxLFxuICAgICAgeDI6ICt4MixcbiAgICAgIHkyOiAreTIsXG4gICAgICB4OiAreCxcbiAgICAgIHk6ICt5XG4gICAgfSwgdGhpcy5wYXRoRWxlbWVudHMsIHRoaXMucG9zKyssIHJlbGF0aXZlLCBkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgbm9uLWJlemllciBjdXJ2ZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJ4IFRoZSByYWRpdXMgdG8gYmUgdXNlZCBmb3IgdGhlIHgtYXhpcyBvZiB0aGUgYXJjLlxuICAgKiBAcGFyYW0ge051bWJlcn0gcnkgVGhlIHJhZGl1cyB0byBiZSB1c2VkIGZvciB0aGUgeS1heGlzIG9mIHRoZSBhcmMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4QXIgRGVmaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0ge051bWJlcn0gbEFmIExhcmdlIGFyYyBmbGFnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzZiBTd2VlcCBmbGFnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSB0YXJnZXQgcG9pbnQgb2YgdGhlIGN1cnZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSB0YXJnZXQgcG9pbnQgb2YgdGhlIGN1cnZlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlbGF0aXZlXSBJZiBzZXQgdG8gdHJ1ZSB0aGUgY3VydmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICogQHBhcmFtIHsqfSBbZGF0YV0gQW55IGRhdGEgdGhhdCBzaG91bGQgYmUgc3RvcmVkIHdpdGggdGhlIGVsZW1lbnQgb2JqZWN0IHRoYXQgd2lsbCBiZSBhY2Nlc3NpYmxlIGluIHBhdGhFbGVtZW50XG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gYXJjKHJ4LCByeSwgeEFyLCBsQWYsIHNmLCB4LCB5LCByZWxhdGl2ZSwgZGF0YSkge1xuICAgIGVsZW1lbnQoJ0EnLCB7XG4gICAgICByeDogK3J4LFxuICAgICAgcnk6ICtyeSxcbiAgICAgIHhBcjogK3hBcixcbiAgICAgIGxBZjogK2xBZixcbiAgICAgIHNmOiArc2YsXG4gICAgICB4OiAreCxcbiAgICAgIHk6ICt5XG4gICAgfSwgdGhpcy5wYXRoRWxlbWVudHMsIHRoaXMucG9zKyssIHJlbGF0aXZlLCBkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW4gU1ZHIHBhdGggc2VlbiBpbiB0aGUgZCBhdHRyaWJ1dGUgb2YgcGF0aCBlbGVtZW50cywgYW5kIGluc2VydHMgdGhlIHBhcnNlZCBlbGVtZW50cyBpbnRvIHRoZSBleGlzdGluZyBwYXRoIG9iamVjdCBhdCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb24uIEFueSBjbG9zaW5nIHBhdGggaW5kaWNhdG9ycyAoWiBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoKSB3aWxsIGJlIGlnbm9yZWQgYnkgdGhlIHBhcnNlciBhcyB0aGlzIGlzIHByb3ZpZGVkIGJ5IHRoZSBjbG9zZSBvcHRpb24gaW4gdGhlIG9wdGlvbnMgb2YgdGhlIHBhdGggb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggQW55IFNWRyBwYXRoIHRoYXQgY29udGFpbnMgbW92ZSAobSksIGxpbmUgKGwpIG9yIGN1cnZlIChjKSBjb21wb25lbnRzLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgICAvLyBQYXJzaW5nIHRoZSBTVkcgcGF0aCBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBhcnJheXMgW1snTScsICcxMCcsICcxMCddLCBbJ0wnLCAnMTAwJywgJzEwMCddXVxuICAgIHZhciBjaHVua3MgPSBwYXRoLnJlcGxhY2UoLyhbQS1aYS16XSkoWzAtOV0pL2csICckMSAkMicpXG4gICAgICAucmVwbGFjZSgvKFswLTldKShbQS1aYS16XSkvZywgJyQxICQyJylcbiAgICAgIC5zcGxpdCgvW1xccyxdKy8pXG4gICAgICAucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgZWxlbWVudCkge1xuICAgICAgICBpZihlbGVtZW50Lm1hdGNoKC9bQS1aYS16XS8pKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW10pO1xuXG4gICAgLy8gSWYgdGhpcyBpcyBhIGNsb3NlZCBwYXRoIHdlIHJlbW92ZSB0aGUgWiBhdCB0aGUgZW5kIGJlY2F1c2UgdGhpcyBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBjbG9zZSBvcHRpb25cbiAgICBpZihjaHVua3NbY2h1bmtzLmxlbmd0aCAtIDFdWzBdLnRvVXBwZXJDYXNlKCkgPT09ICdaJykge1xuICAgICAgY2h1bmtzLnBvcCgpO1xuICAgIH1cblxuICAgIC8vIFVzaW5nIHN2Z1BhdGhFbGVtZW50RGVzY3JpcHRpb25zIHRvIG1hcCByYXcgcGF0aCBhcnJheXMgaW50byBvYmplY3RzIHRoYXQgY29udGFpbiB0aGUgY29tbWFuZCBhbmQgdGhlIHBhcmFtZXRlcnNcbiAgICAvLyBGb3IgZXhhbXBsZSB7Y29tbWFuZDogJ00nLCB4OiAnMTAnLCB5OiAnMTAnfVxuICAgIHZhciBlbGVtZW50cyA9IGNodW5rcy5tYXAoZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjaHVuay5zaGlmdCgpLFxuICAgICAgICAgIGRlc2NyaXB0aW9uID0gZWxlbWVudERlc2NyaXB0aW9uc1tjb21tYW5kLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgICAgIHJldHVybiBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmRcbiAgICAgICAgfSwgZGVzY3JpcHRpb24ucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgcGFyYW1OYW1lLCBpbmRleCkge1xuICAgICAgICAgIHJlc3VsdFtwYXJhbU5hbWVdID0gK2NodW5rW2luZGV4XTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCB7fSkpO1xuICAgICAgfSk7XG5cbiAgICAvLyBQcmVwYXJpbmcgYSBzcGxpY2UgY2FsbCB3aXRoIHRoZSBlbGVtZW50cyBhcnJheSBhcyB2YXIgYXJnIHBhcmFtcyBhbmQgaW5zZXJ0IHRoZSBwYXJzZWQgZWxlbWVudHMgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICB2YXIgc3BsaWNlQXJncyA9IFt0aGlzLnBvcywgMF07XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3BsaWNlQXJncywgZWxlbWVudHMpO1xuICAgIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodGhpcy5wYXRoRWxlbWVudHMsIHNwbGljZUFyZ3MpO1xuICAgIC8vIEluY3JlYXNlIHRoZSBpbnRlcm5hbCBwb3NpdGlvbiBieSB0aGUgZWxlbWVudCBjb3VudFxuICAgIHRoaXMucG9zICs9IGVsZW1lbnRzLmxlbmd0aDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gcmVuZGVycyB0byBjdXJyZW50IFNWRyBwYXRoIG9iamVjdCBpbnRvIGEgZmluYWwgU1ZHIHN0cmluZyB0aGF0IGNhbiBiZSB1c2VkIGluIHRoZSBkIGF0dHJpYnV0ZSBvZiBTVkcgcGF0aCBlbGVtZW50cy4gSXQgdXNlcyB0aGUgYWNjdXJhY3kgb3B0aW9uIHRvIHJvdW5kIGJpZyBkZWNpbWFscy4gSWYgdGhlIGNsb3NlIHBhcmFtZXRlciB3YXMgc2V0IGluIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGlzIHBhdGggb2JqZWN0IHRoZW4gYSBwYXRoIGNsb3NpbmcgWiB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBvdXRwdXQgc3RyaW5nLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gc3RyaW5naWZ5KCkge1xuICAgIHZhciBhY2N1cmFjeU11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgdGhpcy5vcHRpb25zLmFjY3VyYWN5KTtcblxuICAgIHJldHVybiB0aGlzLnBhdGhFbGVtZW50cy5yZWR1Y2UoZnVuY3Rpb24ocGF0aCwgcGF0aEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IGVsZW1lbnREZXNjcmlwdGlvbnNbcGF0aEVsZW1lbnQuY29tbWFuZC50b0xvd2VyQ2FzZSgpXS5tYXAoZnVuY3Rpb24ocGFyYW1OYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hY2N1cmFjeSA/XG4gICAgICAgICAgICAoTWF0aC5yb3VuZChwYXRoRWxlbWVudFtwYXJhbU5hbWVdICogYWNjdXJhY3lNdWx0aXBsaWVyKSAvIGFjY3VyYWN5TXVsdGlwbGllcikgOlxuICAgICAgICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZXR1cm4gcGF0aCArIHBhdGhFbGVtZW50LmNvbW1hbmQgKyBwYXJhbXMuam9pbignLCcpO1xuICAgICAgfS5iaW5kKHRoaXMpLCAnJykgKyAodGhpcy5jbG9zZSA/ICdaJyA6ICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FsZXMgYWxsIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IFNWRyBwYXRoIG9iamVjdC4gVGhlcmUgaXMgYW4gaW5kaXZpZHVhbCBwYXJhbWV0ZXIgZm9yIGVhY2ggY29vcmRpbmF0ZS4gU2NhbGluZyB3aWxsIGFsc28gYmUgZG9uZSBmb3IgY29udHJvbCBwb2ludHMgb2YgY3VydmVzLCBhZmZlY3RpbmcgdGhlIGdpdmVuIGNvb3JkaW5hdGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgbnVtYmVyIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBzY2FsZSB0aGUgeCwgeDEgYW5kIHgyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgbnVtYmVyIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBzY2FsZSB0aGUgeSwgeTEgYW5kIHkyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHNjYWxlKHgsIHkpIHtcbiAgICBmb3JFYWNoUGFyYW0odGhpcy5wYXRoRWxlbWVudHMsIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUpIHtcbiAgICAgIHBhdGhFbGVtZW50W3BhcmFtTmFtZV0gKj0gcGFyYW1OYW1lWzBdID09PSAneCcgPyB4IDogeTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2xhdGVzIGFsbCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBTVkcgcGF0aCBvYmplY3QuIFRoZSB0cmFuc2xhdGlvbiBpcyByZWxhdGl2ZSBhbmQgdGhlcmUgaXMgYW4gaW5kaXZpZHVhbCBwYXJhbWV0ZXIgZm9yIGVhY2ggY29vcmRpbmF0ZS4gVHJhbnNsYXRpb24gd2lsbCBhbHNvIGJlIGRvbmUgZm9yIGNvbnRyb2wgcG9pbnRzIG9mIGN1cnZlcywgYWZmZWN0aW5nIHRoZSBnaXZlbiBjb29yZGluYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIG51bWJlciB3aGljaCB3aWxsIGJlIHVzZWQgdG8gdHJhbnNsYXRlIHRoZSB4LCB4MSBhbmQgeDIgb2YgYWxsIHBhdGggZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zbGF0ZSB0aGUgeSwgeTEgYW5kIHkyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZSh4LCB5KSB7XG4gICAgZm9yRWFjaFBhcmFtKHRoaXMucGF0aEVsZW1lbnRzLCBmdW5jdGlvbihwYXRoRWxlbWVudCwgcGFyYW1OYW1lKSB7XG4gICAgICBwYXRoRWxlbWVudFtwYXJhbU5hbWVdICs9IHBhcmFtTmFtZVswXSA9PT0gJ3gnID8geCA6IHk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIHJ1biBvdmVyIGFsbCBleGlzdGluZyBwYXRoIGVsZW1lbnRzIGFuZCB0aGVuIGxvb3Agb3ZlciB0aGVpciBhdHRyaWJ1dGVzLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IHBhdGggZWxlbWVudCBhdHRyaWJ1dGUgdGhhdCBleGlzdHMgaW4gdGhlIGN1cnJlbnQgcGF0aC5cbiAgICogVGhlIG1ldGhvZCBzaWduYXR1cmUgb2YgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGxvb2tzIGxpa2UgdGhpczpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBmdW5jdGlvbihwYXRoRWxlbWVudCwgcGFyYW1OYW1lLCBwYXRoRWxlbWVudEluZGV4LCBwYXJhbUluZGV4LCBwYXRoRWxlbWVudHMpXG4gICAqIGBgYFxuICAgKiBJZiBzb21ldGhpbmcgZWxzZSB0aGFuIHVuZGVmaW5lZCBpcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIHRoaXMgdmFsdWUgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgdGhlIG9sZCB2YWx1ZS4gVGhpcyBhbGxvd3MgeW91IHRvIGJ1aWxkIGN1c3RvbSB0cmFuc2Zvcm1hdGlvbnMgb2YgcGF0aCBvYmplY3RzIHRoYXQgY2FuJ3QgYmUgYWNoaWV2ZWQgdXNpbmcgdGhlIGJhc2ljIHRyYW5zZm9ybWF0aW9uIGZ1bmN0aW9ucyBzY2FsZSBhbmQgdHJhbnNsYXRlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtRm5jIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uLiBDaGVjayB0aGUgc2lnbmF0dXJlIGluIHRoZSBmdW5jdGlvbiBkZXNjcmlwdGlvbi5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0odHJhbnNmb3JtRm5jKSB7XG4gICAgZm9yRWFjaFBhcmFtKHRoaXMucGF0aEVsZW1lbnRzLCBmdW5jdGlvbihwYXRoRWxlbWVudCwgcGFyYW1OYW1lLCBwYXRoRWxlbWVudEluZGV4LCBwYXJhbUluZGV4LCBwYXRoRWxlbWVudHMpIHtcbiAgICAgIHZhciB0cmFuc2Zvcm1lZCA9IHRyYW5zZm9ybUZuYyhwYXRoRWxlbWVudCwgcGFyYW1OYW1lLCBwYXRoRWxlbWVudEluZGV4LCBwYXJhbUluZGV4LCBwYXRoRWxlbWVudHMpO1xuICAgICAgaWYodHJhbnNmb3JtZWQgfHwgdHJhbnNmb3JtZWQgPT09IDApIHtcbiAgICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXSA9IHRyYW5zZm9ybWVkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2xvbmVzIGEgd2hvbGUgcGF0aCBvYmplY3Qgd2l0aCBhbGwgaXRzIHByb3BlcnRpZXMuIFRoaXMgaXMgYSBkZWVwIGNsb25lIGFuZCBwYXRoIGVsZW1lbnQgb2JqZWN0cyB3aWxsIGFsc28gYmUgY2xvbmVkLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtCb29sZWFufSBbY2xvc2VdIE9wdGlvbmFsIG9wdGlvbiB0byBzZXQgdGhlIG5ldyBjbG9uZWQgcGF0aCB0byBjbG9zZWQuIElmIG5vdCBzcGVjaWZpZWQgb3IgZmFsc2UsIHRoZSBvcmlnaW5hbCBwYXRoIGNsb3NlIG9wdGlvbiB3aWxsIGJlIHVzZWQuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofVxuICAgKi9cbiAgZnVuY3Rpb24gY2xvbmUoY2xvc2UpIHtcbiAgICB2YXIgYyA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aChjbG9zZSB8fCB0aGlzLmNsb3NlKTtcbiAgICBjLnBvcyA9IHRoaXMucG9zO1xuICAgIGMucGF0aEVsZW1lbnRzID0gdGhpcy5wYXRoRWxlbWVudHMuc2xpY2UoKS5tYXAoZnVuY3Rpb24gY2xvbmVFbGVtZW50cyhwYXRoRWxlbWVudCkge1xuICAgICAgcmV0dXJuIENoYXJ0aXN0LmV4dGVuZCh7fSwgcGF0aEVsZW1lbnQpO1xuICAgIH0pO1xuICAgIGMub3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcbiAgICByZXR1cm4gYztcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdCBhIFN2Zy5QYXRoIG9iamVjdCBieSBhIHNwZWNpZmljIGNvbW1hbmQgaW4gdGhlIHBhdGggY2hhaW4uIFRoZSBwYXRoIGNoYWluIHdpbGwgYmUgc3BsaXQgYW5kIGFuIGFycmF5IG9mIG5ld2x5IGNyZWF0ZWQgcGF0aHMgb2JqZWN0cyB3aWxsIGJlIHJldHVybmVkLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3UnZCBsaWtlIHRvIHNwbGl0IGFuIFNWRyBwYXRoIGJ5IGl0J3MgbW92ZSBjb21tYW5kcywgZm9yIGV4YW1wbGUsIGluIG9yZGVyIHRvIGlzb2xhdGUgY2h1bmtzIG9mIGRyYXdpbmdzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbW1hbmQgVGhlIGNvbW1hbmQgeW91J2QgbGlrZSB0byB1c2UgdG8gc3BsaXQgdGhlIHBhdGhcbiAgICogQHJldHVybiB7QXJyYXk8Q2hhcnRpc3QuU3ZnLlBhdGg+fVxuICAgKi9cbiAgZnVuY3Rpb24gc3BsaXRCeUNvbW1hbmQoY29tbWFuZCkge1xuICAgIHZhciBzcGxpdCA9IFtcbiAgICAgIG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpXG4gICAgXTtcblxuICAgIHRoaXMucGF0aEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24ocGF0aEVsZW1lbnQpIHtcbiAgICAgIGlmKHBhdGhFbGVtZW50LmNvbW1hbmQgPT09IGNvbW1hbmQudG9VcHBlckNhc2UoKSAmJiBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXS5wYXRoRWxlbWVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHNwbGl0LnB1c2gobmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCkpO1xuICAgICAgfVxuXG4gICAgICBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXS5wYXRoRWxlbWVudHMucHVzaChwYXRoRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3BsaXQ7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBzdGF0aWMgZnVuY3Rpb24gb24gYENoYXJ0aXN0LlN2Zy5QYXRoYCBpcyBqb2luaW5nIG11bHRpcGxlIHBhdGhzIHRvZ2V0aGVyIGludG8gb25lIHBhdGhzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtBcnJheTxDaGFydGlzdC5TdmcuUGF0aD59IHBhdGhzIEEgbGlzdCBvZiBwYXRocyB0byBiZSBqb2luZWQgdG9nZXRoZXIuIFRoZSBvcmRlciBpcyBpbXBvcnRhbnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2xvc2UgSWYgdGhlIG5ld2x5IGNyZWF0ZWQgcGF0aCBzaG91bGQgYmUgYSBjbG9zZWQgcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBQYXRoIG9wdGlvbnMgZm9yIHRoZSBuZXdseSBjcmVhdGVkIHBhdGguXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofVxuICAgKi9cblxuICBmdW5jdGlvbiBqb2luKHBhdGhzLCBjbG9zZSwgb3B0aW9ucykge1xuICAgIHZhciBqb2luZWRQYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKGNsb3NlLCBvcHRpb25zKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXRoID0gcGF0aHNbaV07XG4gICAgICBmb3IodmFyIGogPSAwOyBqIDwgcGF0aC5wYXRoRWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgam9pbmVkUGF0aC5wYXRoRWxlbWVudHMucHVzaChwYXRoLnBhdGhFbGVtZW50c1tqXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBqb2luZWRQYXRoO1xuICB9XG5cbiAgQ2hhcnRpc3QuU3ZnLlBhdGggPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBTdmdQYXRoLFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICBtb3ZlOiBtb3ZlLFxuICAgIGxpbmU6IGxpbmUsXG4gICAgY3VydmU6IGN1cnZlLFxuICAgIGFyYzogYXJjLFxuICAgIHNjYWxlOiBzY2FsZSxcbiAgICB0cmFuc2xhdGU6IHRyYW5zbGF0ZSxcbiAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnksXG4gICAgY2xvbmU6IGNsb25lLFxuICAgIHNwbGl0QnlDb21tYW5kOiBzcGxpdEJ5Q29tbWFuZFxuICB9KTtcblxuICBDaGFydGlzdC5TdmcuUGF0aC5lbGVtZW50RGVzY3JpcHRpb25zID0gZWxlbWVudERlc2NyaXB0aW9ucztcbiAgQ2hhcnRpc3QuU3ZnLlBhdGguam9pbiA9IGpvaW47XG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgYXhpc1VuaXRzID0ge1xuICAgIHg6IHtcbiAgICAgIHBvczogJ3gnLFxuICAgICAgbGVuOiAnd2lkdGgnLFxuICAgICAgZGlyOiAnaG9yaXpvbnRhbCcsXG4gICAgICByZWN0U3RhcnQ6ICd4MScsXG4gICAgICByZWN0RW5kOiAneDInLFxuICAgICAgcmVjdE9mZnNldDogJ3kyJ1xuICAgIH0sXG4gICAgeToge1xuICAgICAgcG9zOiAneScsXG4gICAgICBsZW46ICdoZWlnaHQnLFxuICAgICAgZGlyOiAndmVydGljYWwnLFxuICAgICAgcmVjdFN0YXJ0OiAneTInLFxuICAgICAgcmVjdEVuZDogJ3kxJyxcbiAgICAgIHJlY3RPZmZzZXQ6ICd4MSdcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gQXhpcyh1bml0cywgY2hhcnRSZWN0LCB0aWNrcywgb3B0aW9ucykge1xuICAgIHRoaXMudW5pdHMgPSB1bml0cztcbiAgICB0aGlzLmNvdW50ZXJVbml0cyA9IHVuaXRzID09PSBheGlzVW5pdHMueCA/IGF4aXNVbml0cy55IDogYXhpc1VuaXRzLng7XG4gICAgdGhpcy5jaGFydFJlY3QgPSBjaGFydFJlY3Q7XG4gICAgdGhpcy5heGlzTGVuZ3RoID0gY2hhcnRSZWN0W3VuaXRzLnJlY3RFbmRdIC0gY2hhcnRSZWN0W3VuaXRzLnJlY3RTdGFydF07XG4gICAgdGhpcy5ncmlkT2Zmc2V0ID0gY2hhcnRSZWN0W3VuaXRzLnJlY3RPZmZzZXRdO1xuICAgIHRoaXMudGlja3MgPSB0aWNrcztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlR3JpZEFuZExhYmVscyhncmlkR3JvdXAsIGxhYmVsR3JvdXAsIHVzZUZvcmVpZ25PYmplY3QsIGNoYXJ0T3B0aW9ucywgZXZlbnRFbWl0dGVyKSB7XG4gICAgdmFyIGF4aXNPcHRpb25zID0gY2hhcnRPcHRpb25zWydheGlzJyArIHRoaXMudW5pdHMucG9zLnRvVXBwZXJDYXNlKCldO1xuICAgIHZhciBwcm9qZWN0ZWRWYWx1ZXMgPSB0aGlzLnRpY2tzLm1hcCh0aGlzLnByb2plY3RWYWx1ZS5iaW5kKHRoaXMpKTtcbiAgICB2YXIgbGFiZWxWYWx1ZXMgPSB0aGlzLnRpY2tzLm1hcChheGlzT3B0aW9ucy5sYWJlbEludGVycG9sYXRpb25GbmMpO1xuXG4gICAgcHJvamVjdGVkVmFsdWVzLmZvckVhY2goZnVuY3Rpb24ocHJvamVjdGVkVmFsdWUsIGluZGV4KSB7XG4gICAgICB2YXIgbGFiZWxPZmZzZXQgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG5cbiAgICAgIC8vIFRPRE86IEZpbmQgYmV0dGVyIHNvbHV0aW9uIGZvciBzb2x2aW5nIHRoaXMgcHJvYmxlbVxuICAgICAgLy8gQ2FsY3VsYXRlIGhvdyBtdWNoIHNwYWNlIHdlIGhhdmUgYXZhaWxhYmxlIGZvciB0aGUgbGFiZWxcbiAgICAgIHZhciBsYWJlbExlbmd0aDtcbiAgICAgIGlmKHByb2plY3RlZFZhbHVlc1tpbmRleCArIDFdKSB7XG4gICAgICAgIC8vIElmIHdlIHN0aWxsIGhhdmUgb25lIGxhYmVsIGFoZWFkLCB3ZSBjYW4gY2FsY3VsYXRlIHRoZSBkaXN0YW5jZSB0byB0aGUgbmV4dCB0aWNrIC8gbGFiZWxcbiAgICAgICAgbGFiZWxMZW5ndGggPSBwcm9qZWN0ZWRWYWx1ZXNbaW5kZXggKyAxXSAtIHByb2plY3RlZFZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIGxhYmVsIGFoZWFkIGFuZCB3ZSBoYXZlIG9ubHkgdHdvIGxhYmVscyBpbiB0b3RhbCwgd2UganVzdCB0YWtlIHRoZSByZW1haW5pbmcgZGlzdGFuY2UgdG9cbiAgICAgICAgLy8gb24gdGhlIHdob2xlIGF4aXMgbGVuZ3RoLiBXZSBsaW1pdCB0aGF0IHRvIGEgbWluaW11bSBvZiAzMCBwaXhlbCwgc28gdGhhdCBsYWJlbHMgY2xvc2UgdG8gdGhlIGJvcmRlciB3aWxsXG4gICAgICAgIC8vIHN0aWxsIGJlIHZpc2libGUgaW5zaWRlIG9mIHRoZSBjaGFydCBwYWRkaW5nLlxuICAgICAgICBsYWJlbExlbmd0aCA9IE1hdGgubWF4KHRoaXMuYXhpc0xlbmd0aCAtIHByb2plY3RlZFZhbHVlLCAzMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZ3JpZCBsaW5lcyBhbmQgbGFiZWxzIHdoZXJlIGludGVycG9sYXRlZCBsYWJlbCB2YWx1ZXMgYXJlIGZhbHNleSAoZXhlY3B0IGZvciAwKVxuICAgICAgaWYoIWxhYmVsVmFsdWVzW2luZGV4XSAmJiBsYWJlbFZhbHVlc1tpbmRleF0gIT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUcmFuc2Zvcm0gdG8gZ2xvYmFsIGNvb3JkaW5hdGVzIHVzaW5nIHRoZSBjaGFydFJlY3RcbiAgICAgIC8vIFdlIGFsc28gbmVlZCB0byBzZXQgdGhlIGxhYmVsIG9mZnNldCBmb3IgdGhlIGNyZWF0ZUxhYmVsIGZ1bmN0aW9uXG4gICAgICBpZih0aGlzLnVuaXRzLnBvcyA9PT0gJ3gnKSB7XG4gICAgICAgIHByb2plY3RlZFZhbHVlID0gdGhpcy5jaGFydFJlY3QueDEgKyBwcm9qZWN0ZWRWYWx1ZTtcbiAgICAgICAgbGFiZWxPZmZzZXQueCA9IGNoYXJ0T3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC54O1xuXG4gICAgICAgIC8vIElmIHRoZSBsYWJlbHMgc2hvdWxkIGJlIHBvc2l0aW9uZWQgaW4gc3RhcnQgcG9zaXRpb24gKHRvcCBzaWRlIGZvciB2ZXJ0aWNhbCBheGlzKSB3ZSBuZWVkIHRvIHNldCBhXG4gICAgICAgIC8vIGRpZmZlcmVudCBvZmZzZXQgYXMgZm9yIHBvc2l0aW9uZWQgd2l0aCBlbmQgKGJvdHRvbSlcbiAgICAgICAgaWYoY2hhcnRPcHRpb25zLmF4aXNYLnBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgbGFiZWxPZmZzZXQueSA9IHRoaXMuY2hhcnRSZWN0LnBhZGRpbmcudG9wICsgY2hhcnRPcHRpb25zLmF4aXNYLmxhYmVsT2Zmc2V0LnkgKyAodXNlRm9yZWlnbk9iamVjdCA/IDUgOiAyMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFiZWxPZmZzZXQueSA9IHRoaXMuY2hhcnRSZWN0LnkxICsgY2hhcnRPcHRpb25zLmF4aXNYLmxhYmVsT2Zmc2V0LnkgKyAodXNlRm9yZWlnbk9iamVjdCA/IDUgOiAyMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2plY3RlZFZhbHVlID0gdGhpcy5jaGFydFJlY3QueTEgLSBwcm9qZWN0ZWRWYWx1ZTtcbiAgICAgICAgbGFiZWxPZmZzZXQueSA9IGNoYXJ0T3B0aW9ucy5heGlzWS5sYWJlbE9mZnNldC55IC0gKHVzZUZvcmVpZ25PYmplY3QgPyBsYWJlbExlbmd0aCA6IDApO1xuXG4gICAgICAgIC8vIElmIHRoZSBsYWJlbHMgc2hvdWxkIGJlIHBvc2l0aW9uZWQgaW4gc3RhcnQgcG9zaXRpb24gKGxlZnQgc2lkZSBmb3IgaG9yaXpvbnRhbCBheGlzKSB3ZSBuZWVkIHRvIHNldCBhXG4gICAgICAgIC8vIGRpZmZlcmVudCBvZmZzZXQgYXMgZm9yIHBvc2l0aW9uZWQgd2l0aCBlbmQgKHJpZ2h0IHNpZGUpXG4gICAgICAgIGlmKGNoYXJ0T3B0aW9ucy5heGlzWS5wb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgIGxhYmVsT2Zmc2V0LnggPSB1c2VGb3JlaWduT2JqZWN0ID8gdGhpcy5jaGFydFJlY3QucGFkZGluZy5sZWZ0ICsgY2hhcnRPcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnggOiB0aGlzLmNoYXJ0UmVjdC54MSAtIDEwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxhYmVsT2Zmc2V0LnggPSB0aGlzLmNoYXJ0UmVjdC54MiArIGNoYXJ0T3B0aW9ucy5heGlzWS5sYWJlbE9mZnNldC54ICsgMTA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoYXhpc09wdGlvbnMuc2hvd0dyaWQpIHtcbiAgICAgICAgQ2hhcnRpc3QuY3JlYXRlR3JpZChwcm9qZWN0ZWRWYWx1ZSwgaW5kZXgsIHRoaXMsIHRoaXMuZ3JpZE9mZnNldCwgdGhpcy5jaGFydFJlY3RbdGhpcy5jb3VudGVyVW5pdHMubGVuXSgpLCBncmlkR3JvdXAsIFtcbiAgICAgICAgICBjaGFydE9wdGlvbnMuY2xhc3NOYW1lcy5ncmlkLFxuICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jbGFzc05hbWVzW3RoaXMudW5pdHMuZGlyXVxuICAgICAgICBdLCBldmVudEVtaXR0ZXIpO1xuICAgICAgfVxuXG4gICAgICBpZihheGlzT3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgQ2hhcnRpc3QuY3JlYXRlTGFiZWwocHJvamVjdGVkVmFsdWUsIGxhYmVsTGVuZ3RoLCBpbmRleCwgbGFiZWxWYWx1ZXMsIHRoaXMsIGF4aXNPcHRpb25zLm9mZnNldCwgbGFiZWxPZmZzZXQsIGxhYmVsR3JvdXAsIFtcbiAgICAgICAgICBjaGFydE9wdGlvbnMuY2xhc3NOYW1lcy5sYWJlbCxcbiAgICAgICAgICBjaGFydE9wdGlvbnMuY2xhc3NOYW1lc1t0aGlzLnVuaXRzLmRpcl0sXG4gICAgICAgICAgY2hhcnRPcHRpb25zLmNsYXNzTmFtZXNbYXhpc09wdGlvbnMucG9zaXRpb25dXG4gICAgICAgIF0sIHVzZUZvcmVpZ25PYmplY3QsIGV2ZW50RW1pdHRlcik7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIENoYXJ0aXN0LkF4aXMgPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBBeGlzLFxuICAgIGNyZWF0ZUdyaWRBbmRMYWJlbHM6IGNyZWF0ZUdyaWRBbmRMYWJlbHMsXG4gICAgcHJvamVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmFzZSBheGlzIGNhblxcJ3QgYmUgaW5zdGFudGlhdGVkIScpO1xuICAgIH1cbiAgfSk7XG5cbiAgQ2hhcnRpc3QuQXhpcy51bml0cyA9IGF4aXNVbml0cztcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIGF1dG8gc2NhbGUgYXhpcyB1c2VzIHN0YW5kYXJkIGxpbmVhciBzY2FsZSBwcm9qZWN0aW9uIG9mIHZhbHVlcyBhbG9uZyBhbiBheGlzLiBJdCB1c2VzIG9yZGVyIG9mIG1hZ25pdHVkZSB0byBmaW5kIGEgc2NhbGUgYXV0b21hdGljYWxseSBhbmQgZXZhbHVhdGVzIHRoZSBhdmFpbGFibGUgc3BhY2UgaW4gb3JkZXIgdG8gZmluZCB0aGUgcGVyZmVjdCBhbW91bnQgb2YgdGlja3MgZm9yIHlvdXIgY2hhcnQuXG4gKiAqKk9wdGlvbnMqKlxuICogVGhlIGZvbGxvd2luZyBvcHRpb25zIGFyZSB1c2VkIGJ5IHRoaXMgYXhpcyBpbiBhZGRpdGlvbiB0byB0aGUgZGVmYXVsdCBheGlzIG9wdGlvbnMgb3V0bGluZWQgaW4gdGhlIGF4aXMgY29uZmlndXJhdGlvbiBvZiB0aGUgY2hhcnQgZGVmYXVsdCBzZXR0aW5ncy5cbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBvcHRpb25zID0ge1xuICogICAvLyBJZiBoaWdoIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBheGlzIHdpbGwgZGlzcGxheSB2YWx1ZXMgZXhwbGljaXRseSB1cCB0byB0aGlzIHZhbHVlIGFuZCB0aGUgY29tcHV0ZWQgbWF4aW11bSBmcm9tIHRoZSBkYXRhIGlzIGlnbm9yZWRcbiAqICAgaGlnaDogMTAwLFxuICogICAvLyBJZiBsb3cgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGF4aXMgd2lsbCBkaXNwbGF5IHZhbHVlcyBleHBsaWNpdGx5IGRvd24gdG8gdGhpcyB2YWx1ZSBhbmQgdGhlIGNvbXB1dGVkIG1pbmltdW0gZnJvbSB0aGUgZGF0YSBpcyBpZ25vcmVkXG4gKiAgIGxvdzogMCxcbiAqICAgLy8gVGhpcyBvcHRpb24gd2lsbCBiZSB1c2VkIHdoZW4gZmluZGluZyB0aGUgcmlnaHQgc2NhbGUgZGl2aXNpb24gc2V0dGluZ3MuIFRoZSBhbW91bnQgb2YgdGlja3Mgb24gdGhlIHNjYWxlIHdpbGwgYmUgZGV0ZXJtaW5lZCBzbyB0aGF0IGFzIG1hbnkgdGlja3MgYXMgcG9zc2libGUgd2lsbCBiZSBkaXNwbGF5ZWQsIHdoaWxlIG5vdCB2aW9sYXRpbmcgdGhpcyBtaW5pbXVtIHJlcXVpcmVkIHNwYWNlIChpbiBwaXhlbCkuXG4gKiAgIHNjYWxlTWluU3BhY2U6IDIwLFxuICogICAvLyBDYW4gYmUgc2V0IHRvIHRydWUgb3IgZmFsc2UuIElmIHNldCB0byB0cnVlLCB0aGUgc2NhbGUgd2lsbCBiZSBnZW5lcmF0ZWQgd2l0aCB3aG9sZSBudW1iZXJzIG9ubHkuXG4gKiAgIG9ubHlJbnRlZ2VyOiB0cnVlLFxuICogICAvLyBUaGUgcmVmZXJlbmNlIHZhbHVlIGNhbiBiZSB1c2VkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoaXMgdmFsdWUgd2lsbCBhbHdheXMgYmUgb24gdGhlIGNoYXJ0LiBUaGlzIGlzIGVzcGVjaWFsbHkgdXNlZnVsIG9uIGJpcG9sYXIgY2hhcnRzIHdoZXJlIHRoZSBiaXBvbGFyIGNlbnRlciBhbHdheXMgbmVlZHMgdG8gYmUgcGFydCBvZiB0aGUgY2hhcnQuXG4gKiAgIHJlZmVyZW5jZVZhbHVlOiA1XG4gKiB9O1xuICogYGBgXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5BdXRvU2NhbGVBeGlzXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gQXV0b1NjYWxlQXhpcyhheGlzVW5pdCwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zKSB7XG4gICAgLy8gVXN1YWxseSB3ZSBjYWxjdWxhdGUgaGlnaExvdyBiYXNlZCBvbiB0aGUgZGF0YSBidXQgdGhpcyBjYW4gYmUgb3ZlcnJpZGVuIGJ5IGEgaGlnaExvdyBvYmplY3QgaW4gdGhlIG9wdGlvbnNcbiAgICB2YXIgaGlnaExvdyA9IG9wdGlvbnMuaGlnaExvdyB8fCBDaGFydGlzdC5nZXRIaWdoTG93KGRhdGEubm9ybWFsaXplZCwgb3B0aW9ucywgYXhpc1VuaXQucG9zKTtcbiAgICB0aGlzLmJvdW5kcyA9IENoYXJ0aXN0LmdldEJvdW5kcyhjaGFydFJlY3RbYXhpc1VuaXQucmVjdEVuZF0gLSBjaGFydFJlY3RbYXhpc1VuaXQucmVjdFN0YXJ0XSwgaGlnaExvdywgb3B0aW9ucy5zY2FsZU1pblNwYWNlIHx8IDIwLCBvcHRpb25zLm9ubHlJbnRlZ2VyKTtcbiAgICB0aGlzLnJhbmdlID0ge1xuICAgICAgbWluOiB0aGlzLmJvdW5kcy5taW4sXG4gICAgICBtYXg6IHRoaXMuYm91bmRzLm1heFxuICAgIH07XG5cbiAgICBDaGFydGlzdC5BdXRvU2NhbGVBeGlzLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIGF4aXNVbml0LFxuICAgICAgY2hhcnRSZWN0LFxuICAgICAgdGhpcy5ib3VuZHMudmFsdWVzLFxuICAgICAgb3B0aW9ucyk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9qZWN0VmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5heGlzTGVuZ3RoICogKCtDaGFydGlzdC5nZXRNdWx0aVZhbHVlKHZhbHVlLCB0aGlzLnVuaXRzLnBvcykgLSB0aGlzLmJvdW5kcy5taW4pIC8gdGhpcy5ib3VuZHMucmFuZ2U7XG4gIH1cblxuICBDaGFydGlzdC5BdXRvU2NhbGVBeGlzID0gQ2hhcnRpc3QuQXhpcy5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBBdXRvU2NhbGVBeGlzLFxuICAgIHByb2plY3RWYWx1ZTogcHJvamVjdFZhbHVlXG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgZml4ZWQgc2NhbGUgYXhpcyB1c2VzIHN0YW5kYXJkIGxpbmVhciBwcm9qZWN0aW9uIG9mIHZhbHVlcyBhbG9uZyBhbiBheGlzLiBJdCBtYWtlcyB1c2Ugb2YgYSBkaXZpc29yIG9wdGlvbiB0byBkaXZpZGUgdGhlIHJhbmdlIHByb3ZpZGVkIGZyb20gdGhlIG1pbmltdW0gYW5kIG1heGltdW0gdmFsdWUgb3IgdGhlIG9wdGlvbnMgaGlnaCBhbmQgbG93IHRoYXQgd2lsbCBvdmVycmlkZSB0aGUgY29tcHV0ZWQgbWluaW11bSBhbmQgbWF4aW11bS5cbiAqICoqT3B0aW9ucyoqXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgYXJlIHVzZWQgYnkgdGhpcyBheGlzIGluIGFkZGl0aW9uIHRvIHRoZSBkZWZhdWx0IGF4aXMgb3B0aW9ucyBvdXRsaW5lZCBpbiB0aGUgYXhpcyBjb25maWd1cmF0aW9uIG9mIHRoZSBjaGFydCBkZWZhdWx0IHNldHRpbmdzLlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIG9wdGlvbnMgPSB7XG4gKiAgIC8vIElmIGhpZ2ggaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGF4aXMgd2lsbCBkaXNwbGF5IHZhbHVlcyBleHBsaWNpdGx5IHVwIHRvIHRoaXMgdmFsdWUgYW5kIHRoZSBjb21wdXRlZCBtYXhpbXVtIGZyb20gdGhlIGRhdGEgaXMgaWdub3JlZFxuICogICBoaWdoOiAxMDAsXG4gKiAgIC8vIElmIGxvdyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgYXhpcyB3aWxsIGRpc3BsYXkgdmFsdWVzIGV4cGxpY2l0bHkgZG93biB0byB0aGlzIHZhbHVlIGFuZCB0aGUgY29tcHV0ZWQgbWluaW11bSBmcm9tIHRoZSBkYXRhIGlzIGlnbm9yZWRcbiAqICAgbG93OiAwLFxuICogICAvLyBJZiBzcGVjaWZpZWQgdGhlbiB0aGUgdmFsdWUgcmFuZ2UgZGV0ZXJtaW5lZCBmcm9tIG1pbmltdW0gdG8gbWF4aW11bSAob3IgbG93IGFuZCBoaWdoKSB3aWxsIGJlIGRpdmlkZWQgYnkgdGhpcyBudW1iZXIgYW5kIHRpY2tzIHdpbGwgYmUgZ2VuZXJhdGVkIGF0IHRob3NlIGRpdmlzaW9uIHBvaW50cy4gVGhlIGRlZmF1bHQgZGl2aXNvciBpcyAxLlxuICogICBkaXZpc29yOiA0LFxuICogICAvLyBJZiB0aWNrcyBpcyBleHBsaWNpdGx5IHNldCwgdGhlbiB0aGUgYXhpcyB3aWxsIG5vdCBjb21wdXRlIHRoZSB0aWNrcyB3aXRoIHRoZSBkaXZpc29yLCBidXQgZGlyZWN0bHkgdXNlIHRoZSBkYXRhIGluIHRpY2tzIHRvIGRldGVybWluZSBhdCB3aGF0IHBvaW50cyBvbiB0aGUgYXhpcyBhIHRpY2sgbmVlZCB0byBiZSBnZW5lcmF0ZWQuXG4gKiAgIHRpY2tzOiBbMSwgMTAsIDIwLCAzMF1cbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gRml4ZWRTY2FsZUF4aXMoYXhpc1VuaXQsIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucykge1xuICAgIHZhciBoaWdoTG93ID0gb3B0aW9ucy5oaWdoTG93IHx8IENoYXJ0aXN0LmdldEhpZ2hMb3coZGF0YS5ub3JtYWxpemVkLCBvcHRpb25zLCBheGlzVW5pdC5wb3MpO1xuICAgIHRoaXMuZGl2aXNvciA9IG9wdGlvbnMuZGl2aXNvciB8fCAxO1xuICAgIHRoaXMudGlja3MgPSBvcHRpb25zLnRpY2tzIHx8IENoYXJ0aXN0LnRpbWVzKHRoaXMuZGl2aXNvcikubWFwKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgcmV0dXJuIGhpZ2hMb3cubG93ICsgKGhpZ2hMb3cuaGlnaCAtIGhpZ2hMb3cubG93KSAvIHRoaXMuZGl2aXNvciAqIGluZGV4O1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy50aWNrcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcbiAgICB0aGlzLnJhbmdlID0ge1xuICAgICAgbWluOiBoaWdoTG93LmxvdyxcbiAgICAgIG1heDogaGlnaExvdy5oaWdoXG4gICAgfTtcblxuICAgIENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIGF4aXNVbml0LFxuICAgICAgY2hhcnRSZWN0LFxuICAgICAgdGhpcy50aWNrcyxcbiAgICAgIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5zdGVwTGVuZ3RoID0gdGhpcy5heGlzTGVuZ3RoIC8gdGhpcy5kaXZpc29yO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvamVjdFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuYXhpc0xlbmd0aCAqICgrQ2hhcnRpc3QuZ2V0TXVsdGlWYWx1ZSh2YWx1ZSwgdGhpcy51bml0cy5wb3MpIC0gdGhpcy5yYW5nZS5taW4pIC8gKHRoaXMucmFuZ2UubWF4IC0gdGhpcy5yYW5nZS5taW4pO1xuICB9XG5cbiAgQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXMgPSBDaGFydGlzdC5BeGlzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IEZpeGVkU2NhbGVBeGlzLFxuICAgIHByb2plY3RWYWx1ZTogcHJvamVjdFZhbHVlXG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgc3RlcCBheGlzIGZvciBzdGVwIGJhc2VkIGNoYXJ0cyBsaWtlIGJhciBjaGFydCBvciBzdGVwIGJhc2VkIGxpbmUgY2hhcnRzLiBJdCB1c2VzIGEgZml4ZWQgYW1vdW50IG9mIHRpY2tzIHRoYXQgd2lsbCBiZSBlcXVhbGx5IGRpc3RyaWJ1dGVkIGFjcm9zcyB0aGUgd2hvbGUgYXhpcyBsZW5ndGguIFRoZSBwcm9qZWN0aW9uIGlzIGRvbmUgdXNpbmcgdGhlIGluZGV4IG9mIHRoZSBkYXRhIHZhbHVlIHJhdGhlciB0aGFuIHRoZSB2YWx1ZSBpdHNlbGYgYW5kIHRoZXJlZm9yZSBpdCdzIG9ubHkgdXNlZnVsIGZvciBkaXN0cmlidXRpb24gcHVycG9zZS5cbiAqICoqT3B0aW9ucyoqXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgYXJlIHVzZWQgYnkgdGhpcyBheGlzIGluIGFkZGl0aW9uIHRvIHRoZSBkZWZhdWx0IGF4aXMgb3B0aW9ucyBvdXRsaW5lZCBpbiB0aGUgYXhpcyBjb25maWd1cmF0aW9uIG9mIHRoZSBjaGFydCBkZWZhdWx0IHNldHRpbmdzLlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIG9wdGlvbnMgPSB7XG4gKiAgIC8vIFRpY2tzIHRvIGJlIHVzZWQgdG8gZGlzdHJpYnV0ZSBhY3Jvc3MgdGhlIGF4aXMgbGVuZ3RoLiBBcyB0aGlzIGF4aXMgdHlwZSByZWxpZXMgb24gdGhlIGluZGV4IG9mIHRoZSB2YWx1ZSByYXRoZXIgdGhhbiB0aGUgdmFsdWUsIGFyYml0cmFyeSBkYXRhIHRoYXQgY2FuIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZyBjYW4gYmUgdXNlZCBhcyB0aWNrcy5cbiAqICAgdGlja3M6IFsnT25lJywgJ1R3bycsICdUaHJlZSddLFxuICogICAvLyBJZiBzZXQgdG8gdHJ1ZSB0aGUgZnVsbCB3aWR0aCB3aWxsIGJlIHVzZWQgdG8gZGlzdHJpYnV0ZSB0aGUgdmFsdWVzIHdoZXJlIHRoZSBsYXN0IHZhbHVlIHdpbGwgYmUgYXQgdGhlIG1heGltdW0gb2YgdGhlIGF4aXMgbGVuZ3RoLiBJZiBmYWxzZSB0aGUgc3BhY2VzIGJldHdlZW4gdGhlIHRpY2tzIHdpbGwgYmUgZXZlbmx5IGRpc3RyaWJ1dGVkIGluc3RlYWQuXG4gKiAgIHN0cmV0Y2g6IHRydWVcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LlN0ZXBBeGlzXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gU3RlcEF4aXMoYXhpc1VuaXQsIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucykge1xuICAgIENoYXJ0aXN0LlN0ZXBBeGlzLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIGF4aXNVbml0LFxuICAgICAgY2hhcnRSZWN0LFxuICAgICAgb3B0aW9ucy50aWNrcyxcbiAgICAgIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5zdGVwTGVuZ3RoID0gdGhpcy5heGlzTGVuZ3RoIC8gKG9wdGlvbnMudGlja3MubGVuZ3RoIC0gKG9wdGlvbnMuc3RyZXRjaCA/IDEgOiAwKSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9qZWN0VmFsdWUodmFsdWUsIGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RlcExlbmd0aCAqIGluZGV4O1xuICB9XG5cbiAgQ2hhcnRpc3QuU3RlcEF4aXMgPSBDaGFydGlzdC5BeGlzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IFN0ZXBBeGlzLFxuICAgIHByb2plY3RWYWx1ZTogcHJvamVjdFZhbHVlXG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgQ2hhcnRpc3QgbGluZSBjaGFydCBjYW4gYmUgdXNlZCB0byBkcmF3IExpbmUgb3IgU2NhdHRlciBjaGFydHMuIElmIHVzZWQgaW4gdGhlIGJyb3dzZXIgeW91IGNhbiBhY2Nlc3MgdGhlIGdsb2JhbCBgQ2hhcnRpc3RgIG5hbWVzcGFjZSB3aGVyZSB5b3UgZmluZCB0aGUgYExpbmVgIGZ1bmN0aW9uIGFzIGEgbWFpbiBlbnRyeSBwb2ludC5cbiAqXG4gKiBGb3IgZXhhbXBsZXMgb24gaG93IHRvIHVzZSB0aGUgbGluZSBjaGFydCBwbGVhc2UgY2hlY2sgdGhlIGV4YW1wbGVzIG9mIHRoZSBgQ2hhcnRpc3QuTGluZWAgbWV0aG9kLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuTGluZVxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGluIGxpbmUgY2hhcnRzLiBFeHBhbmQgdGhlIGNvZGUgdmlldyB0byBzZWUgYSBkZXRhaWxlZCBsaXN0IG9mIG9wdGlvbnMgd2l0aCBjb21tZW50cy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkxpbmVcbiAgICovXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAvLyBPcHRpb25zIGZvciBYLUF4aXNcbiAgICBheGlzWDoge1xuICAgICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgbGFiZWxzIHRvIHRoZSBjaGFydCBhcmVhXG4gICAgICBvZmZzZXQ6IDMwLFxuICAgICAgLy8gUG9zaXRpb24gd2hlcmUgbGFiZWxzIGFyZSBwbGFjZWQuIENhbiBiZSBzZXQgdG8gYHN0YXJ0YCBvciBgZW5kYCB3aGVyZSBgc3RhcnRgIGlzIGVxdWl2YWxlbnQgdG8gbGVmdCBvciB0b3Agb24gdmVydGljYWwgYXhpcyBhbmQgYGVuZGAgaXMgZXF1aXZhbGVudCB0byByaWdodCBvciBib3R0b20gb24gaG9yaXpvbnRhbCBheGlzLlxuICAgICAgcG9zaXRpb246ICdlbmQnLFxuICAgICAgLy8gQWxsb3dzIHlvdSB0byBjb3JyZWN0IGxhYmVsIHBvc2l0aW9uaW5nIG9uIHRoaXMgYXhpcyBieSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSB4IGFuZCB5IG9mZnNldC5cbiAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgICAgLy8gSWYgdGhlIGF4aXMgZ3JpZCBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgIC8vIEludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCB0aGUgdmFsdWUgZnJvbSB0aGUgYXhpcyBsYWJlbFxuICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgICAgLy8gU2V0IHRoZSBheGlzIHR5cGUgdG8gYmUgdXNlZCB0byBwcm9qZWN0IHZhbHVlcyBvbiB0aGlzIGF4aXMuIElmIG5vdCBkZWZpbmVkLCBDaGFydGlzdC5TdGVwQXhpcyB3aWxsIGJlIHVzZWQgZm9yIHRoZSBYLUF4aXMsIHdoZXJlIHRoZSB0aWNrcyBvcHRpb24gd2lsbCBiZSBzZXQgdG8gdGhlIGxhYmVscyBpbiB0aGUgZGF0YSBhbmQgdGhlIHN0cmV0Y2ggb3B0aW9uIHdpbGwgYmUgc2V0IHRvIHRoZSBnbG9iYWwgZnVsbFdpZHRoIG9wdGlvbi4gVGhpcyB0eXBlIGNhbiBiZSBjaGFuZ2VkIHRvIGFueSBheGlzIGNvbnN0cnVjdG9yIGF2YWlsYWJsZSAoZS5nLiBDaGFydGlzdC5GaXhlZFNjYWxlQXhpcyksIHdoZXJlIGFsbCBheGlzIG9wdGlvbnMgc2hvdWxkIGJlIHByZXNlbnQgaGVyZS5cbiAgICAgIHR5cGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgLy8gT3B0aW9ucyBmb3IgWS1BeGlzXG4gICAgYXhpc1k6IHtcbiAgICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGxhYmVscyB0byB0aGUgY2hhcnQgYXJlYVxuICAgICAgb2Zmc2V0OiA0MCxcbiAgICAgIC8vIFBvc2l0aW9uIHdoZXJlIGxhYmVscyBhcmUgcGxhY2VkLiBDYW4gYmUgc2V0IHRvIGBzdGFydGAgb3IgYGVuZGAgd2hlcmUgYHN0YXJ0YCBpcyBlcXVpdmFsZW50IHRvIGxlZnQgb3IgdG9wIG9uIHZlcnRpY2FsIGF4aXMgYW5kIGBlbmRgIGlzIGVxdWl2YWxlbnQgdG8gcmlnaHQgb3IgYm90dG9tIG9uIGhvcml6b250YWwgYXhpcy5cbiAgICAgIHBvc2l0aW9uOiAnc3RhcnQnLFxuICAgICAgLy8gQWxsb3dzIHlvdSB0byBjb3JyZWN0IGxhYmVsIHBvc2l0aW9uaW5nIG9uIHRoaXMgYXhpcyBieSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSB4IGFuZCB5IG9mZnNldC5cbiAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgICAgLy8gSWYgdGhlIGF4aXMgZ3JpZCBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgIC8vIEludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCB0aGUgdmFsdWUgZnJvbSB0aGUgYXhpcyBsYWJlbFxuICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgICAgLy8gU2V0IHRoZSBheGlzIHR5cGUgdG8gYmUgdXNlZCB0byBwcm9qZWN0IHZhbHVlcyBvbiB0aGlzIGF4aXMuIElmIG5vdCBkZWZpbmVkLCBDaGFydGlzdC5BdXRvU2NhbGVBeGlzIHdpbGwgYmUgdXNlZCBmb3IgdGhlIFktQXhpcywgd2hlcmUgdGhlIGhpZ2ggYW5kIGxvdyBvcHRpb25zIHdpbGwgYmUgc2V0IHRvIHRoZSBnbG9iYWwgaGlnaCBhbmQgbG93IG9wdGlvbnMuIFRoaXMgdHlwZSBjYW4gYmUgY2hhbmdlZCB0byBhbnkgYXhpcyBjb25zdHJ1Y3RvciBhdmFpbGFibGUgKGUuZy4gQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXMpLCB3aGVyZSBhbGwgYXhpcyBvcHRpb25zIHNob3VsZCBiZSBwcmVzZW50IGhlcmUuXG4gICAgICB0eXBlOiB1bmRlZmluZWQsXG4gICAgICAvLyBUaGlzIHZhbHVlIHNwZWNpZmllcyB0aGUgbWluaW11bSBoZWlnaHQgaW4gcGl4ZWwgb2YgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBzY2FsZU1pblNwYWNlOiAyMCxcbiAgICAgIC8vIFVzZSBvbmx5IGludGVnZXIgdmFsdWVzICh3aG9sZSBudW1iZXJzKSBmb3IgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBvbmx5SW50ZWdlcjogZmFsc2VcbiAgICB9LFxuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCB3aWR0aCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgaGVpZ2h0IGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAvLyBJZiB0aGUgbGluZSBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgc2hvd0xpbmU6IHRydWUsXG4gICAgLy8gSWYgZG90cyBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgc2hvd1BvaW50OiB0cnVlLFxuICAgIC8vIElmIHRoZSBsaW5lIGNoYXJ0IHNob3VsZCBkcmF3IGFuIGFyZWFcbiAgICBzaG93QXJlYTogZmFsc2UsXG4gICAgLy8gVGhlIGJhc2UgZm9yIHRoZSBhcmVhIGNoYXJ0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIGNsb3NlIHRoZSBhcmVhIHNoYXBlIChpcyBub3JtYWxseSAwKVxuICAgIGFyZWFCYXNlOiAwLFxuICAgIC8vIFNwZWNpZnkgaWYgdGhlIGxpbmVzIHNob3VsZCBiZSBzbW9vdGhlZC4gVGhpcyB2YWx1ZSBjYW4gYmUgdHJ1ZSBvciBmYWxzZSB3aGVyZSB0cnVlIHdpbGwgcmVzdWx0IGluIHNtb290aGluZyB1c2luZyB0aGUgZGVmYXVsdCBzbW9vdGhpbmcgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsIGFuZCBmYWxzZSByZXN1bHRzIGluIENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZS4gWW91IGNhbiBhbHNvIGNob29zZSBvdGhlciBzbW9vdGhpbmcgLyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9ucyBhdmFpbGFibGUgaW4gdGhlIENoYXJ0aXN0LkludGVycG9sYXRpb24gbW9kdWxlLCBvciB3cml0ZSB5b3VyIG93biBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgYnJpZWYgZGVzY3JpcHRpb24uXG4gICAgbGluZVNtb290aDogdHJ1ZSxcbiAgICAvLyBPdmVycmlkaW5nIHRoZSBuYXR1cmFsIGxvdyBvZiB0aGUgY2hhcnQgYWxsb3dzIHlvdSB0byB6b29tIGluIG9yIGxpbWl0IHRoZSBjaGFydHMgbG93ZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgIGxvdzogdW5kZWZpbmVkLFxuICAgIC8vIE92ZXJyaWRpbmcgdGhlIG5hdHVyYWwgaGlnaCBvZiB0aGUgY2hhcnQgYWxsb3dzIHlvdSB0byB6b29tIGluIG9yIGxpbWl0IHRoZSBjaGFydHMgaGlnaGVzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICBoaWdoOiB1bmRlZmluZWQsXG4gICAgLy8gUGFkZGluZyBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBjb250YWluZXIgZWxlbWVudCBhbmQgbGFiZWxzIGFzIGEgbnVtYmVyIG9yIHBhZGRpbmcgb2JqZWN0IHt0b3A6IDUsIHJpZ2h0OiA1LCBib3R0b206IDUsIGxlZnQ6IDV9XG4gICAgY2hhcnRQYWRkaW5nOiB7XG4gICAgICB0b3A6IDE1LFxuICAgICAgcmlnaHQ6IDE1LFxuICAgICAgYm90dG9tOiA1LFxuICAgICAgbGVmdDogMTBcbiAgICB9LFxuICAgIC8vIFdoZW4gc2V0IHRvIHRydWUsIHRoZSBsYXN0IGdyaWQgbGluZSBvbiB0aGUgeC1heGlzIGlzIG5vdCBkcmF3biBhbmQgdGhlIGNoYXJ0IGVsZW1lbnRzIHdpbGwgZXhwYW5kIHRvIHRoZSBmdWxsIGF2YWlsYWJsZSB3aWR0aCBvZiB0aGUgY2hhcnQuIEZvciB0aGUgbGFzdCBsYWJlbCB0byBiZSBkcmF3biBjb3JyZWN0bHkgeW91IG1pZ2h0IG5lZWQgdG8gYWRkIGNoYXJ0IHBhZGRpbmcgb3Igb2Zmc2V0IHRoZSBsYXN0IGxhYmVsIHdpdGggYSBkcmF3IGV2ZW50IGhhbmRsZXIuXG4gICAgZnVsbFdpZHRoOiBmYWxzZSxcbiAgICAvLyBJZiB0cnVlIHRoZSB3aG9sZSBkYXRhIGlzIHJldmVyc2VkIGluY2x1ZGluZyBsYWJlbHMsIHRoZSBzZXJpZXMgb3JkZXIgYXMgd2VsbCBhcyB0aGUgd2hvbGUgc2VyaWVzIGRhdGEgYXJyYXlzLlxuICAgIHJldmVyc2VEYXRhOiBmYWxzZSxcbiAgICAvLyBPdmVycmlkZSB0aGUgY2xhc3MgbmFtZXMgdGhhdCBnZXQgdXNlZCB0byBnZW5lcmF0ZSB0aGUgU1ZHIHN0cnVjdHVyZSBvZiB0aGUgY2hhcnRcbiAgICBjbGFzc05hbWVzOiB7XG4gICAgICBjaGFydDogJ2N0LWNoYXJ0LWxpbmUnLFxuICAgICAgbGFiZWw6ICdjdC1sYWJlbCcsXG4gICAgICBsYWJlbEdyb3VwOiAnY3QtbGFiZWxzJyxcbiAgICAgIHNlcmllczogJ2N0LXNlcmllcycsXG4gICAgICBsaW5lOiAnY3QtbGluZScsXG4gICAgICBwb2ludDogJ2N0LXBvaW50JyxcbiAgICAgIGFyZWE6ICdjdC1hcmVhJyxcbiAgICAgIGdyaWQ6ICdjdC1ncmlkJyxcbiAgICAgIGdyaWRHcm91cDogJ2N0LWdyaWRzJyxcbiAgICAgIHZlcnRpY2FsOiAnY3QtdmVydGljYWwnLFxuICAgICAgaG9yaXpvbnRhbDogJ2N0LWhvcml6b250YWwnLFxuICAgICAgc3RhcnQ6ICdjdC1zdGFydCcsXG4gICAgICBlbmQ6ICdjdC1lbmQnXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNoYXJ0XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDaGFydChvcHRpb25zKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICByYXc6IHRoaXMuZGF0YSxcbiAgICAgIG5vcm1hbGl6ZWQ6IENoYXJ0aXN0LmdldERhdGFBcnJheSh0aGlzLmRhdGEsIG9wdGlvbnMucmV2ZXJzZURhdGEsIHRydWUpXG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBuZXcgc3ZnIG9iamVjdFxuICAgIHRoaXMuc3ZnID0gQ2hhcnRpc3QuY3JlYXRlU3ZnKHRoaXMuY29udGFpbmVyLCBvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCwgb3B0aW9ucy5jbGFzc05hbWVzLmNoYXJ0KTtcbiAgICAvLyBDcmVhdGUgZ3JvdXBzIGZvciBsYWJlbHMsIGdyaWQgYW5kIHNlcmllc1xuICAgIHZhciBncmlkR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmdyaWRHcm91cCk7XG4gICAgdmFyIHNlcmllc0dyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpO1xuICAgIHZhciBsYWJlbEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5sYWJlbEdyb3VwKTtcblxuICAgIHZhciBjaGFydFJlY3QgPSBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QodGhpcy5zdmcsIG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zLnBhZGRpbmcpO1xuICAgIHZhciBheGlzWCwgYXhpc1k7XG5cbiAgICBpZihvcHRpb25zLmF4aXNYLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXhpc1ggPSBuZXcgQ2hhcnRpc3QuU3RlcEF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWCwge1xuICAgICAgICB0aWNrczogZGF0YS5yYXcubGFiZWxzLFxuICAgICAgICBzdHJldGNoOiBvcHRpb25zLmZ1bGxXaWR0aFxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlzWCA9IG9wdGlvbnMuYXhpc1gudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucy5heGlzWCk7XG4gICAgfVxuXG4gICAgaWYob3B0aW9ucy5heGlzWS50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGF4aXNZID0gbmV3IENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWSwge1xuICAgICAgICBoaWdoOiBDaGFydGlzdC5pc051bShvcHRpb25zLmhpZ2gpID8gb3B0aW9ucy5oaWdoIDogb3B0aW9ucy5heGlzWS5oaWdoLFxuICAgICAgICBsb3c6IENoYXJ0aXN0LmlzTnVtKG9wdGlvbnMubG93KSA/IG9wdGlvbnMubG93IDogb3B0aW9ucy5heGlzWS5sb3dcbiAgICAgIH0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpc1kgPSBvcHRpb25zLmF4aXNZLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMuYXhpc1kpO1xuICAgIH1cblxuICAgIGF4aXNYLmNyZWF0ZUdyaWRBbmRMYWJlbHMoZ3JpZEdyb3VwLCBsYWJlbEdyb3VwLCB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCwgb3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuICAgIGF4aXNZLmNyZWF0ZUdyaWRBbmRMYWJlbHMoZ3JpZEdyb3VwLCBsYWJlbEdyb3VwLCB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCwgb3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuXG4gICAgLy8gRHJhdyB0aGUgc2VyaWVzXG4gICAgZGF0YS5yYXcuc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oc2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgICAgdmFyIHNlcmllc0VsZW1lbnQgPSBzZXJpZXNHcm91cC5lbGVtKCdnJyk7XG5cbiAgICAgIC8vIFdyaXRlIGF0dHJpYnV0ZXMgdG8gc2VyaWVzIGdyb3VwIGVsZW1lbnQuIElmIHNlcmllcyBuYW1lIG9yIG1ldGEgaXMgdW5kZWZpbmVkIHRoZSBhdHRyaWJ1dGVzIHdpbGwgbm90IGJlIHdyaXR0ZW5cbiAgICAgIHNlcmllc0VsZW1lbnQuYXR0cih7XG4gICAgICAgICdzZXJpZXMtbmFtZSc6IHNlcmllcy5uYW1lLFxuICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LnNlcmlhbGl6ZShzZXJpZXMubWV0YSlcbiAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgIC8vIFVzZSBzZXJpZXMgY2xhc3MgZnJvbSBzZXJpZXMgZGF0YSBvciBpZiBub3Qgc2V0IGdlbmVyYXRlIG9uZVxuICAgICAgc2VyaWVzRWxlbWVudC5hZGRDbGFzcyhbXG4gICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMsXG4gICAgICAgIChzZXJpZXMuY2xhc3NOYW1lIHx8IG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMgKyAnLScgKyBDaGFydGlzdC5hbHBoYU51bWVyYXRlKHNlcmllc0luZGV4KSlcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgdmFyIHBhdGhDb29yZGluYXRlcyA9IFtdLFxuICAgICAgICBwYXRoRGF0YSA9IFtdO1xuXG4gICAgICBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIHZhbHVlSW5kZXgpIHtcbiAgICAgICAgdmFyIHAgPSB7XG4gICAgICAgICAgeDogY2hhcnRSZWN0LngxICsgYXhpc1gucHJvamVjdFZhbHVlKHZhbHVlLCB2YWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKSxcbiAgICAgICAgICB5OiBjaGFydFJlY3QueTEgLSBheGlzWS5wcm9qZWN0VmFsdWUodmFsdWUsIHZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pXG4gICAgICAgIH07XG4gICAgICAgIHBhdGhDb29yZGluYXRlcy5wdXNoKHAueCwgcC55KTtcbiAgICAgICAgcGF0aERhdGEucHVzaCh7XG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIHZhbHVlSW5kZXg6IHZhbHVlSW5kZXgsXG4gICAgICAgICAgbWV0YTogQ2hhcnRpc3QuZ2V0TWV0YURhdGEoc2VyaWVzLCB2YWx1ZUluZGV4KVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHZhciBzZXJpZXNPcHRpb25zID0ge1xuICAgICAgICBsaW5lU21vb3RoOiBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24oc2VyaWVzLCBvcHRpb25zLCAnbGluZVNtb290aCcpLFxuICAgICAgICBzaG93UG9pbnQ6IENoYXJ0aXN0LmdldFNlcmllc09wdGlvbihzZXJpZXMsIG9wdGlvbnMsICdzaG93UG9pbnQnKSxcbiAgICAgICAgc2hvd0xpbmU6IENoYXJ0aXN0LmdldFNlcmllc09wdGlvbihzZXJpZXMsIG9wdGlvbnMsICdzaG93TGluZScpLFxuICAgICAgICBzaG93QXJlYTogQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uKHNlcmllcywgb3B0aW9ucywgJ3Nob3dBcmVhJyksXG4gICAgICAgIGFyZWFCYXNlOiBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24oc2VyaWVzLCBvcHRpb25zLCAnYXJlYUJhc2UnKVxuICAgICAgfTtcblxuICAgICAgdmFyIHNtb290aGluZyA9IHR5cGVvZiBzZXJpZXNPcHRpb25zLmxpbmVTbW9vdGggPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBzZXJpZXNPcHRpb25zLmxpbmVTbW9vdGggOiAoc2VyaWVzT3B0aW9ucy5saW5lU21vb3RoID8gQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCgpIDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lKCkpO1xuICAgICAgLy8gSW50ZXJwb2xhdGluZyBwYXRoIHdoZXJlIHBhdGhEYXRhIHdpbGwgYmUgdXNlZCB0byBhbm5vdGF0ZSBlYWNoIHBhdGggZWxlbWVudCBzbyB3ZSBjYW4gdHJhY2UgYmFjayB0aGUgb3JpZ2luYWxcbiAgICAgIC8vIGluZGV4LCB2YWx1ZSBhbmQgbWV0YSBkYXRhXG4gICAgICB2YXIgcGF0aCA9IHNtb290aGluZyhwYXRoQ29vcmRpbmF0ZXMsIHBhdGhEYXRhKTtcblxuICAgICAgLy8gSWYgd2Ugc2hvdWxkIHNob3cgcG9pbnRzIHdlIG5lZWQgdG8gY3JlYXRlIHRoZW0gbm93IHRvIGF2b2lkIHNlY29uZGFyeSBsb29wXG4gICAgICAvLyBQb2ludHMgYXJlIGRyYXduIGZyb20gdGhlIHBhdGhFbGVtZW50cyByZXR1cm5lZCBieSB0aGUgaW50ZXJwb2xhdGlvbiBmdW5jdGlvblxuICAgICAgLy8gU21hbGwgb2Zmc2V0IGZvciBGaXJlZm94IHRvIHJlbmRlciBzcXVhcmVzIGNvcnJlY3RseVxuICAgICAgaWYgKHNlcmllc09wdGlvbnMuc2hvd1BvaW50KSB7XG5cbiAgICAgICAgcGF0aC5wYXRoRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihwYXRoRWxlbWVudCkge1xuICAgICAgICAgIHZhciBwb2ludCA9IHNlcmllc0VsZW1lbnQuZWxlbSgnbGluZScsIHtcbiAgICAgICAgICAgIHgxOiBwYXRoRWxlbWVudC54LFxuICAgICAgICAgICAgeTE6IHBhdGhFbGVtZW50LnksXG4gICAgICAgICAgICB4MjogcGF0aEVsZW1lbnQueCArIDAuMDEsXG4gICAgICAgICAgICB5MjogcGF0aEVsZW1lbnQueVxuICAgICAgICAgIH0sIG9wdGlvbnMuY2xhc3NOYW1lcy5wb2ludCkuYXR0cih7XG4gICAgICAgICAgICAndmFsdWUnOiBbcGF0aEVsZW1lbnQuZGF0YS52YWx1ZS54LCBwYXRoRWxlbWVudC5kYXRhLnZhbHVlLnldLmZpbHRlcihmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgIH0pLmpvaW4oJywnKSxcbiAgICAgICAgICAgICdtZXRhJzogcGF0aEVsZW1lbnQuZGF0YS5tZXRhXG4gICAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICB0eXBlOiAncG9pbnQnLFxuICAgICAgICAgICAgdmFsdWU6IHBhdGhFbGVtZW50LmRhdGEudmFsdWUsXG4gICAgICAgICAgICBpbmRleDogcGF0aEVsZW1lbnQuZGF0YS52YWx1ZUluZGV4LFxuICAgICAgICAgICAgbWV0YTogcGF0aEVsZW1lbnQuZGF0YS5tZXRhLFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNJbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgICBheGlzWDogYXhpc1gsXG4gICAgICAgICAgICBheGlzWTogYXhpc1ksXG4gICAgICAgICAgICBncm91cDogc2VyaWVzRWxlbWVudCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IHBvaW50LFxuICAgICAgICAgICAgeDogcGF0aEVsZW1lbnQueCxcbiAgICAgICAgICAgIHk6IHBhdGhFbGVtZW50LnlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH1cblxuICAgICAgaWYoc2VyaWVzT3B0aW9ucy5zaG93TGluZSkge1xuICAgICAgICB2YXIgbGluZSA9IHNlcmllc0VsZW1lbnQuZWxlbSgncGF0aCcsIHtcbiAgICAgICAgICBkOiBwYXRoLnN0cmluZ2lmeSgpXG4gICAgICAgIH0sIG9wdGlvbnMuY2xhc3NOYW1lcy5saW5lLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3Jywge1xuICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICB2YWx1ZXM6IGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0sXG4gICAgICAgICAgcGF0aDogcGF0aC5jbG9uZSgpLFxuICAgICAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgICAgIGluZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgICAgICBzZXJpZXNJbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgICAgICBncm91cDogc2VyaWVzRWxlbWVudCxcbiAgICAgICAgICBlbGVtZW50OiBsaW5lXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBcmVhIGN1cnJlbnRseSBvbmx5IHdvcmtzIHdpdGggYXhlcyB0aGF0IHN1cHBvcnQgYSByYW5nZSFcbiAgICAgIGlmKHNlcmllc09wdGlvbnMuc2hvd0FyZWEgJiYgYXhpc1kucmFuZ2UpIHtcbiAgICAgICAgLy8gSWYgYXJlYUJhc2UgaXMgb3V0c2lkZSB0aGUgY2hhcnQgYXJlYSAoPCBtaW4gb3IgPiBtYXgpIHdlIG5lZWQgdG8gc2V0IGl0IHJlc3BlY3RpdmVseSBzbyB0aGF0XG4gICAgICAgIC8vIHRoZSBhcmVhIGlzIG5vdCBkcmF3biBvdXRzaWRlIHRoZSBjaGFydCBhcmVhLlxuICAgICAgICB2YXIgYXJlYUJhc2UgPSBNYXRoLm1heChNYXRoLm1pbihzZXJpZXNPcHRpb25zLmFyZWFCYXNlLCBheGlzWS5yYW5nZS5tYXgpLCBheGlzWS5yYW5nZS5taW4pO1xuXG4gICAgICAgIC8vIFdlIHByb2plY3QgdGhlIGFyZWFCYXNlIHZhbHVlIGludG8gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgICAgIHZhciBhcmVhQmFzZVByb2plY3RlZCA9IGNoYXJ0UmVjdC55MSAtIGF4aXNZLnByb2plY3RWYWx1ZShhcmVhQmFzZSk7XG5cbiAgICAgICAgLy8gSW4gb3JkZXIgdG8gZm9ybSB0aGUgYXJlYSB3ZSdsbCBmaXJzdCBzcGxpdCB0aGUgcGF0aCBieSBtb3ZlIGNvbW1hbmRzIHNvIHdlIGNhbiBjaHVuayBpdCB1cCBpbnRvIHNlZ21lbnRzXG4gICAgICAgIHBhdGguc3BsaXRCeUNvbW1hbmQoJ00nKS5maWx0ZXIoZnVuY3Rpb24gb25seVNvbGlkU2VnbWVudHMocGF0aFNlZ21lbnQpIHtcbiAgICAgICAgICAvLyBXZSBmaWx0ZXIgb25seSBcInNvbGlkXCIgc2VnbWVudHMgdGhhdCBjb250YWluIG1vcmUgdGhhbiBvbmUgcG9pbnQuIE90aGVyd2lzZSB0aGVyZSdzIG5vIG5lZWQgZm9yIGFuIGFyZWFcbiAgICAgICAgICByZXR1cm4gcGF0aFNlZ21lbnQucGF0aEVsZW1lbnRzLmxlbmd0aCA+IDE7XG4gICAgICAgIH0pLm1hcChmdW5jdGlvbiBjb252ZXJ0VG9BcmVhKHNvbGlkUGF0aFNlZ21lbnRzKSB7XG4gICAgICAgICAgLy8gUmVjZWl2aW5nIHRoZSBmaWx0ZXJlZCBzb2xpZCBwYXRoIHNlZ21lbnRzIHdlIGNhbiBub3cgY29udmVydCB0aG9zZSBzZWdtZW50cyBpbnRvIGZpbGwgYXJlYXNcbiAgICAgICAgICB2YXIgZmlyc3RFbGVtZW50ID0gc29saWRQYXRoU2VnbWVudHMucGF0aEVsZW1lbnRzWzBdO1xuICAgICAgICAgIHZhciBsYXN0RWxlbWVudCA9IHNvbGlkUGF0aFNlZ21lbnRzLnBhdGhFbGVtZW50c1tzb2xpZFBhdGhTZWdtZW50cy5wYXRoRWxlbWVudHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAvLyBDbG9uaW5nIHRoZSBzb2xpZCBwYXRoIHNlZ21lbnQgd2l0aCBjbG9zaW5nIG9wdGlvbiBhbmQgcmVtb3ZpbmcgdGhlIGZpcnN0IG1vdmUgY29tbWFuZCBmcm9tIHRoZSBjbG9uZVxuICAgICAgICAgIC8vIFdlIHRoZW4gaW5zZXJ0IGEgbmV3IG1vdmUgdGhhdCBzaG91bGQgc3RhcnQgYXQgdGhlIGFyZWEgYmFzZSBhbmQgZHJhdyBhIHN0cmFpZ2h0IGxpbmUgdXAgb3IgZG93blxuICAgICAgICAgIC8vIGF0IHRoZSBlbmQgb2YgdGhlIHBhdGggd2UgYWRkIGFuIGFkZGl0aW9uYWwgc3RyYWlnaHQgbGluZSB0byB0aGUgcHJvamVjdGVkIGFyZWEgYmFzZSB2YWx1ZVxuICAgICAgICAgIC8vIEFzIHRoZSBjbG9zaW5nIG9wdGlvbiBpcyBzZXQgb3VyIHBhdGggd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGNsb3NlZFxuICAgICAgICAgIHJldHVybiBzb2xpZFBhdGhTZWdtZW50cy5jbG9uZSh0cnVlKVxuICAgICAgICAgICAgLnBvc2l0aW9uKDApXG4gICAgICAgICAgICAucmVtb3ZlKDEpXG4gICAgICAgICAgICAubW92ZShmaXJzdEVsZW1lbnQueCwgYXJlYUJhc2VQcm9qZWN0ZWQpXG4gICAgICAgICAgICAubGluZShmaXJzdEVsZW1lbnQueCwgZmlyc3RFbGVtZW50LnkpXG4gICAgICAgICAgICAucG9zaXRpb24oc29saWRQYXRoU2VnbWVudHMucGF0aEVsZW1lbnRzLmxlbmd0aCArIDEpXG4gICAgICAgICAgICAubGluZShsYXN0RWxlbWVudC54LCBhcmVhQmFzZVByb2plY3RlZCk7XG5cbiAgICAgICAgfSkuZm9yRWFjaChmdW5jdGlvbiBjcmVhdGVBcmVhKGFyZWFQYXRoKSB7XG4gICAgICAgICAgLy8gRm9yIGVhY2ggb2Ygb3VyIG5ld2x5IGNyZWF0ZWQgYXJlYSBwYXRocywgd2UnbGwgbm93IGNyZWF0ZSBwYXRoIGVsZW1lbnRzIGJ5IHN0cmluZ2lmeWluZyBvdXIgcGF0aCBvYmplY3RzXG4gICAgICAgICAgLy8gYW5kIGFkZGluZyB0aGUgY3JlYXRlZCBET00gZWxlbWVudHMgdG8gdGhlIGNvcnJlY3Qgc2VyaWVzIGdyb3VwXG4gICAgICAgICAgdmFyIGFyZWEgPSBzZXJpZXNFbGVtZW50LmVsZW0oJ3BhdGgnLCB7XG4gICAgICAgICAgICBkOiBhcmVhUGF0aC5zdHJpbmdpZnkoKVxuICAgICAgICAgIH0sIG9wdGlvbnMuY2xhc3NOYW1lcy5hcmVhLCB0cnVlKS5hdHRyKHtcbiAgICAgICAgICAgICd2YWx1ZXMnOiBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdXG4gICAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAgIC8vIEVtaXQgYW4gZXZlbnQgZm9yIGVhY2ggYXJlYSB0aGF0IHdhcyBkcmF3blxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICB0eXBlOiAnYXJlYScsXG4gICAgICAgICAgICB2YWx1ZXM6IGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0sXG4gICAgICAgICAgICBwYXRoOiBhcmVhUGF0aC5jbG9uZSgpLFxuICAgICAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgICAgICBzZXJpZXNJbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgICBheGlzWDogYXhpc1gsXG4gICAgICAgICAgICBheGlzWTogYXhpc1ksXG4gICAgICAgICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgICAgICAgIGluZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICAgIGdyb3VwOiBzZXJpZXNFbGVtZW50LFxuICAgICAgICAgICAgZWxlbWVudDogYXJlYVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdjcmVhdGVkJywge1xuICAgICAgYm91bmRzOiBheGlzWS5ib3VuZHMsXG4gICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgIHN2ZzogdGhpcy5zdmcsXG4gICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBsaW5lIGNoYXJ0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuTGluZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBxdWVyeSBBIHNlbGVjdG9yIHF1ZXJ5IHN0cmluZyBvciBkaXJlY3RseSBhIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB0aGF0IG5lZWRzIHRvIGNvbnNpc3Qgb2YgYSBsYWJlbHMgYW5kIGEgc2VyaWVzIGFycmF5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0IHdpdGggb3B0aW9ucyB0aGF0IG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuIENoZWNrIHRoZSBleGFtcGxlcyBmb3IgYSBkZXRhaWxlZCBsaXN0LlxuICAgKiBAcGFyYW0ge0FycmF5fSBbcmVzcG9uc2l2ZU9wdGlvbnNdIFNwZWNpZnkgYW4gYXJyYXkgb2YgcmVzcG9uc2l2ZSBvcHRpb24gYXJyYXlzIHdoaWNoIGFyZSBhIG1lZGlhIHF1ZXJ5IGFuZCBvcHRpb25zIG9iamVjdCBwYWlyID0+IFtbbWVkaWFRdWVyeVN0cmluZywgb3B0aW9uc09iamVjdF0sW21vcmUuLi5dXVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB3aGljaCBleHBvc2VzIHRoZSBBUEkgZm9yIHRoZSBjcmVhdGVkIGNoYXJ0XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIENyZWF0ZSBhIHNpbXBsZSBsaW5lIGNoYXJ0XG4gICAqIHZhciBkYXRhID0ge1xuICAgKiAgIC8vIEEgbGFiZWxzIGFycmF5IHRoYXQgY2FuIGNvbnRhaW4gYW55IHNvcnQgb2YgdmFsdWVzXG4gICAqICAgbGFiZWxzOiBbJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknXSxcbiAgICogICAvLyBPdXIgc2VyaWVzIGFycmF5IHRoYXQgY29udGFpbnMgc2VyaWVzIG9iamVjdHMgb3IgaW4gdGhpcyBjYXNlIHNlcmllcyBkYXRhIGFycmF5c1xuICAgKiAgIHNlcmllczogW1xuICAgKiAgICAgWzUsIDIsIDQsIDIsIDBdXG4gICAqICAgXVxuICAgKiB9O1xuICAgKlxuICAgKiAvLyBBcyBvcHRpb25zIHdlIGN1cnJlbnRseSBvbmx5IHNldCBhIHN0YXRpYyBzaXplIG9mIDMwMHgyMDAgcHhcbiAgICogdmFyIG9wdGlvbnMgPSB7XG4gICAqICAgd2lkdGg6ICczMDBweCcsXG4gICAqICAgaGVpZ2h0OiAnMjAwcHgnXG4gICAqIH07XG4gICAqXG4gICAqIC8vIEluIHRoZSBnbG9iYWwgbmFtZSBzcGFjZSBDaGFydGlzdCB3ZSBjYWxsIHRoZSBMaW5lIGZ1bmN0aW9uIHRvIGluaXRpYWxpemUgYSBsaW5lIGNoYXJ0LiBBcyBhIGZpcnN0IHBhcmFtZXRlciB3ZSBwYXNzIGluIGEgc2VsZWN0b3Igd2hlcmUgd2Ugd291bGQgbGlrZSB0byBnZXQgb3VyIGNoYXJ0IGNyZWF0ZWQuIFNlY29uZCBwYXJhbWV0ZXIgaXMgdGhlIGFjdHVhbCBkYXRhIG9iamVjdCBhbmQgYXMgYSB0aGlyZCBwYXJhbWV0ZXIgd2UgcGFzcyBpbiBvdXIgb3B0aW9uc1xuICAgKiBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0JywgZGF0YSwgb3B0aW9ucyk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFVzZSBzcGVjaWZpYyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHdpdGggY29uZmlndXJhdGlvbiBmcm9tIHRoZSBDaGFydGlzdC5JbnRlcnBvbGF0aW9uIG1vZHVsZVxuICAgKlxuICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgKiAgIHNlcmllczogW1xuICAgKiAgICAgWzEsIDEsIDgsIDEsIDddXG4gICAqICAgXVxuICAgKiB9LCB7XG4gICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCh7XG4gICAqICAgICB0ZW5zaW9uOiAwLjJcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gQ3JlYXRlIGEgbGluZSBjaGFydCB3aXRoIHJlc3BvbnNpdmUgb3B0aW9uc1xuICAgKlxuICAgKiB2YXIgZGF0YSA9IHtcbiAgICogICAvLyBBIGxhYmVscyBhcnJheSB0aGF0IGNhbiBjb250YWluIGFueSBzb3J0IG9mIHZhbHVlc1xuICAgKiAgIGxhYmVsczogWydNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5J10sXG4gICAqICAgLy8gT3VyIHNlcmllcyBhcnJheSB0aGF0IGNvbnRhaW5zIHNlcmllcyBvYmplY3RzIG9yIGluIHRoaXMgY2FzZSBzZXJpZXMgZGF0YSBhcnJheXNcbiAgICogICBzZXJpZXM6IFtcbiAgICogICAgIFs1LCAyLCA0LCAyLCAwXVxuICAgKiAgIF1cbiAgICogfTtcbiAgICpcbiAgICogLy8gSW4gYWRpdGlvbiB0byB0aGUgcmVndWxhciBvcHRpb25zIHdlIHNwZWNpZnkgcmVzcG9uc2l2ZSBvcHRpb24gb3ZlcnJpZGVzIHRoYXQgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBjb25maWd1dGF0aW9uIGJhc2VkIG9uIHRoZSBtYXRjaGluZyBtZWRpYSBxdWVyaWVzLlxuICAgKiB2YXIgcmVzcG9uc2l2ZU9wdGlvbnMgPSBbXG4gICAqICAgWydzY3JlZW4gYW5kIChtaW4td2lkdGg6IDY0MXB4KSBhbmQgKG1heC13aWR0aDogMTAyNHB4KScsIHtcbiAgICogICAgIHNob3dQb2ludDogZmFsc2UsXG4gICAqICAgICBheGlzWDoge1xuICAgKiAgICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAqICAgICAgICAgLy8gV2lsbCByZXR1cm4gTW9uLCBUdWUsIFdlZCBldGMuIG9uIG1lZGl1bSBzY3JlZW5zXG4gICAqICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIDMpO1xuICAgKiAgICAgICB9XG4gICAqICAgICB9XG4gICAqICAgfV0sXG4gICAqICAgWydzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDY0MHB4KScsIHtcbiAgICogICAgIHNob3dMaW5lOiBmYWxzZSxcbiAgICogICAgIGF4aXNYOiB7XG4gICAqICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICogICAgICAgICAvLyBXaWxsIHJldHVybiBNLCBULCBXIGV0Yy4gb24gc21hbGwgc2NyZWVuc1xuICAgKiAgICAgICAgIHJldHVybiB2YWx1ZVswXTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfVxuICAgKiAgIH1dXG4gICAqIF07XG4gICAqXG4gICAqIG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCBkYXRhLCBudWxsLCByZXNwb25zaXZlT3B0aW9ucyk7XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBMaW5lKHF1ZXJ5LCBkYXRhLCBvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucykge1xuICAgIENoYXJ0aXN0LkxpbmUuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgcXVlcnksXG4gICAgICBkYXRhLFxuICAgICAgZGVmYXVsdE9wdGlvbnMsXG4gICAgICBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKSxcbiAgICAgIHJlc3BvbnNpdmVPcHRpb25zKTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIGxpbmUgY2hhcnQgdHlwZSBpbiBDaGFydGlzdCBuYW1lc3BhY2VcbiAgQ2hhcnRpc3QuTGluZSA9IENoYXJ0aXN0LkJhc2UuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogTGluZSxcbiAgICBjcmVhdGVDaGFydDogY3JlYXRlQ2hhcnRcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBiYXIgY2hhcnQgbW9kdWxlIG9mIENoYXJ0aXN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gZHJhdyB1bmlwb2xhciBvciBiaXBvbGFyIGJhciBhbmQgZ3JvdXBlZCBiYXIgY2hhcnRzLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuQmFyXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgaW4gYmFyIGNoYXJ0cy4gRXhwYW5kIHRoZSBjb2RlIHZpZXcgdG8gc2VlIGEgZGV0YWlsZWQgbGlzdCBvZiBvcHRpb25zIHdpdGggY29tbWVudHMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXJcbiAgICovXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAvLyBPcHRpb25zIGZvciBYLUF4aXNcbiAgICBheGlzWDoge1xuICAgICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBib3JkZXIgb2YgdGhlIGNvbnRhaW5lclxuICAgICAgb2Zmc2V0OiAzMCxcbiAgICAgIC8vIFBvc2l0aW9uIHdoZXJlIGxhYmVscyBhcmUgcGxhY2VkLiBDYW4gYmUgc2V0IHRvIGBzdGFydGAgb3IgYGVuZGAgd2hlcmUgYHN0YXJ0YCBpcyBlcXVpdmFsZW50IHRvIGxlZnQgb3IgdG9wIG9uIHZlcnRpY2FsIGF4aXMgYW5kIGBlbmRgIGlzIGVxdWl2YWxlbnQgdG8gcmlnaHQgb3IgYm90dG9tIG9uIGhvcml6b250YWwgYXhpcy5cbiAgICAgIHBvc2l0aW9uOiAnZW5kJyxcbiAgICAgIC8vIEFsbG93cyB5b3UgdG8gY29ycmVjdCBsYWJlbCBwb3NpdGlvbmluZyBvbiB0aGlzIGF4aXMgYnkgcG9zaXRpdmUgb3IgbmVnYXRpdmUgeCBhbmQgeSBvZmZzZXQuXG4gICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9LFxuICAgICAgLy8gSWYgbGFiZWxzIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgc2hvd0dyaWQ6IHRydWUsXG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgdGhlIHZhbHVlIGZyb20gdGhlIGF4aXMgbGFiZWxcbiAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgIC8vIFRoaXMgdmFsdWUgc3BlY2lmaWVzIHRoZSBtaW5pbXVtIHdpZHRoIGluIHBpeGVsIG9mIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgc2NhbGVNaW5TcGFjZTogMzAsXG4gICAgICAvLyBVc2Ugb25seSBpbnRlZ2VyIHZhbHVlcyAod2hvbGUgbnVtYmVycykgZm9yIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgb25seUludGVnZXI6IGZhbHNlXG4gICAgfSxcbiAgICAvLyBPcHRpb25zIGZvciBZLUF4aXNcbiAgICBheGlzWToge1xuICAgICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBib3JkZXIgb2YgdGhlIGNvbnRhaW5lclxuICAgICAgb2Zmc2V0OiA0MCxcbiAgICAgIC8vIFBvc2l0aW9uIHdoZXJlIGxhYmVscyBhcmUgcGxhY2VkLiBDYW4gYmUgc2V0IHRvIGBzdGFydGAgb3IgYGVuZGAgd2hlcmUgYHN0YXJ0YCBpcyBlcXVpdmFsZW50IHRvIGxlZnQgb3IgdG9wIG9uIHZlcnRpY2FsIGF4aXMgYW5kIGBlbmRgIGlzIGVxdWl2YWxlbnQgdG8gcmlnaHQgb3IgYm90dG9tIG9uIGhvcml6b250YWwgYXhpcy5cbiAgICAgIHBvc2l0aW9uOiAnc3RhcnQnLFxuICAgICAgLy8gQWxsb3dzIHlvdSB0byBjb3JyZWN0IGxhYmVsIHBvc2l0aW9uaW5nIG9uIHRoaXMgYXhpcyBieSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSB4IGFuZCB5IG9mZnNldC5cbiAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgICAgLy8gSWYgdGhlIGF4aXMgZ3JpZCBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgIC8vIEludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCB0aGUgdmFsdWUgZnJvbSB0aGUgYXhpcyBsYWJlbFxuICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgICAgLy8gVGhpcyB2YWx1ZSBzcGVjaWZpZXMgdGhlIG1pbmltdW0gaGVpZ2h0IGluIHBpeGVsIG9mIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgc2NhbGVNaW5TcGFjZTogMjAsXG4gICAgICAvLyBVc2Ugb25seSBpbnRlZ2VyIHZhbHVlcyAod2hvbGUgbnVtYmVycykgZm9yIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgb25seUludGVnZXI6IGZhbHNlXG4gICAgfSxcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgd2lkdGggZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIGhlaWdodCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgaGVpZ2h0OiB1bmRlZmluZWQsXG4gICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBoaWdoIG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBoaWdoZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgIGhpZ2g6IHVuZGVmaW5lZCxcbiAgICAvLyBPdmVycmlkaW5nIHRoZSBuYXR1cmFsIGxvdyBvZiB0aGUgY2hhcnQgYWxsb3dzIHlvdSB0byB6b29tIGluIG9yIGxpbWl0IHRoZSBjaGFydHMgbG93ZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgIGxvdzogdW5kZWZpbmVkLFxuICAgIC8vIFVzZSBvbmx5IGludGVnZXIgdmFsdWVzICh3aG9sZSBudW1iZXJzKSBmb3IgdGhlIHNjYWxlIHN0ZXBzXG4gICAgb25seUludGVnZXI6IGZhbHNlLFxuICAgIC8vIFBhZGRpbmcgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQgYW5kIGxhYmVscyBhcyBhIG51bWJlciBvciBwYWRkaW5nIG9iamVjdCB7dG9wOiA1LCByaWdodDogNSwgYm90dG9tOiA1LCBsZWZ0OiA1fVxuICAgIGNoYXJ0UGFkZGluZzoge1xuICAgICAgdG9wOiAxNSxcbiAgICAgIHJpZ2h0OiAxNSxcbiAgICAgIGJvdHRvbTogNSxcbiAgICAgIGxlZnQ6IDEwXG4gICAgfSxcbiAgICAvLyBTcGVjaWZ5IHRoZSBkaXN0YW5jZSBpbiBwaXhlbCBvZiBiYXJzIGluIGEgZ3JvdXBcbiAgICBzZXJpZXNCYXJEaXN0YW5jZTogMTUsXG4gICAgLy8gSWYgc2V0IHRvIHRydWUgdGhpcyBwcm9wZXJ0eSB3aWxsIGNhdXNlIHRoZSBzZXJpZXMgYmFycyB0byBiZSBzdGFja2VkLiBDaGVjayB0aGUgYHN0YWNrTW9kZWAgb3B0aW9uIGZvciBmdXJ0aGVyIHN0YWNraW5nIG9wdGlvbnMuXG4gICAgc3RhY2tCYXJzOiBmYWxzZSxcbiAgICAvLyBJZiBzZXQgdG8gJ292ZXJsYXAnIHRoaXMgcHJvcGVydHkgd2lsbCBmb3JjZSB0aGUgc3RhY2tlZCBiYXJzIHRvIGRyYXcgZnJvbSB0aGUgemVybyBsaW5lLlxuICAgIC8vIElmIHNldCB0byAnYWNjdW11bGF0ZScgdGhpcyBwcm9wZXJ0eSB3aWxsIGZvcm0gYSB0b3RhbCBmb3IgZWFjaCBzZXJpZXMgcG9pbnQuIFRoaXMgd2lsbCBhbHNvIGluZmx1ZW5jZSB0aGUgeS1heGlzIGFuZCB0aGUgb3ZlcmFsbCBib3VuZHMgb2YgdGhlIGNoYXJ0LiBJbiBzdGFja2VkIG1vZGUgdGhlIHNlcmllc0JhckRpc3RhbmNlIHByb3BlcnR5IHdpbGwgaGF2ZSBubyBlZmZlY3QuXG4gICAgc3RhY2tNb2RlOiAnYWNjdW11bGF0ZScsXG4gICAgLy8gSW52ZXJ0cyB0aGUgYXhlcyBvZiB0aGUgYmFyIGNoYXJ0IGluIG9yZGVyIHRvIGRyYXcgYSBob3Jpem9udGFsIGJhciBjaGFydC4gQmUgYXdhcmUgdGhhdCB5b3UgYWxzbyBuZWVkIHRvIGludmVydCB5b3VyIGF4aXMgc2V0dGluZ3MgYXMgdGhlIFkgQXhpcyB3aWxsIG5vdyBkaXNwbGF5IHRoZSBsYWJlbHMgYW5kIHRoZSBYIEF4aXMgdGhlIHZhbHVlcy5cbiAgICBob3Jpem9udGFsQmFyczogZmFsc2UsXG4gICAgLy8gSWYgc2V0IHRvIHRydWUgdGhlbiBlYWNoIGJhciB3aWxsIHJlcHJlc2VudCBhIHNlcmllcyBhbmQgdGhlIGRhdGEgYXJyYXkgaXMgZXhwZWN0ZWQgdG8gYmUgYSBvbmUgZGltZW5zaW9uYWwgYXJyYXkgb2YgZGF0YSB2YWx1ZXMgcmF0aGVyIHRoYW4gYSBzZXJpZXMgYXJyYXkgb2Ygc2VyaWVzLiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgYmFyIGNoYXJ0IHNob3VsZCByZXByZXNlbnQgYSBwcm9maWxlIHJhdGhlciB0aGFuIHNvbWUgZGF0YSBvdmVyIHRpbWUuXG4gICAgZGlzdHJpYnV0ZVNlcmllczogZmFsc2UsXG4gICAgLy8gSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBpbmNsdWRpbmcgbGFiZWxzLCB0aGUgc2VyaWVzIG9yZGVyIGFzIHdlbGwgYXMgdGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICByZXZlcnNlRGF0YTogZmFsc2UsXG4gICAgLy8gT3ZlcnJpZGUgdGhlIGNsYXNzIG5hbWVzIHRoYXQgZ2V0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIFNWRyBzdHJ1Y3R1cmUgb2YgdGhlIGNoYXJ0XG4gICAgY2xhc3NOYW1lczoge1xuICAgICAgY2hhcnQ6ICdjdC1jaGFydC1iYXInLFxuICAgICAgaG9yaXpvbnRhbEJhcnM6ICdjdC1ob3Jpem9udGFsLWJhcnMnLFxuICAgICAgbGFiZWw6ICdjdC1sYWJlbCcsXG4gICAgICBsYWJlbEdyb3VwOiAnY3QtbGFiZWxzJyxcbiAgICAgIHNlcmllczogJ2N0LXNlcmllcycsXG4gICAgICBiYXI6ICdjdC1iYXInLFxuICAgICAgZ3JpZDogJ2N0LWdyaWQnLFxuICAgICAgZ3JpZEdyb3VwOiAnY3QtZ3JpZHMnLFxuICAgICAgdmVydGljYWw6ICdjdC12ZXJ0aWNhbCcsXG4gICAgICBob3Jpem9udGFsOiAnY3QtaG9yaXpvbnRhbCcsXG4gICAgICBzdGFydDogJ2N0LXN0YXJ0JyxcbiAgICAgIGVuZDogJ2N0LWVuZCdcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY2hhcnRcbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHJhdzogdGhpcy5kYXRhLFxuICAgICAgbm9ybWFsaXplZDogb3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzID8gQ2hhcnRpc3QuZ2V0RGF0YUFycmF5KHRoaXMuZGF0YSwgb3B0aW9ucy5yZXZlcnNlRGF0YSwgb3B0aW9ucy5ob3Jpem9udGFsQmFycyA/ICd4JyA6ICd5JykubWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBbdmFsdWVdO1xuICAgICAgfSkgOiBDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhLCBvcHRpb25zLmhvcml6b250YWxCYXJzID8gJ3gnIDogJ3knKVxuICAgIH07XG5cbiAgICB2YXIgaGlnaExvdztcblxuICAgIC8vIENyZWF0ZSBuZXcgc3ZnIGVsZW1lbnRcbiAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2ZyhcbiAgICAgIHRoaXMuY29udGFpbmVyLFxuICAgICAgb3B0aW9ucy53aWR0aCxcbiAgICAgIG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLmNoYXJ0ICsgKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAnICcgKyBvcHRpb25zLmNsYXNzTmFtZXMuaG9yaXpvbnRhbEJhcnMgOiAnJylcbiAgICApO1xuXG4gICAgLy8gRHJhd2luZyBncm91cHMgaW4gY29ycmVjdCBvcmRlclxuICAgIHZhciBncmlkR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmdyaWRHcm91cCk7XG4gICAgdmFyIHNlcmllc0dyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpO1xuICAgIHZhciBsYWJlbEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5sYWJlbEdyb3VwKTtcblxuICAgIGlmKG9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAvLyBJZiBzdGFja2VkIGJhcnMgd2UgbmVlZCB0byBjYWxjdWxhdGUgdGhlIGhpZ2ggbG93IGZyb20gc3RhY2tlZCB2YWx1ZXMgZnJvbSBlYWNoIHNlcmllc1xuICAgICAgdmFyIHNlcmlhbFN1bXMgPSBDaGFydGlzdC5zZXJpYWxNYXAoZGF0YS5ub3JtYWxpemVkLCBmdW5jdGlvbiBzZXJpYWxTdW1zKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5tYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHByZXYueCArIGN1cnIueCB8fCAwLFxuICAgICAgICAgICAgeTogcHJldi55ICsgY3Vyci55IHx8IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9LCB7eDogMCwgeTogMH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGhpZ2hMb3cgPSBDaGFydGlzdC5nZXRIaWdoTG93KFtzZXJpYWxTdW1zXSwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLCB7XG4gICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICB9KSwgb3B0aW9ucy5ob3Jpem9udGFsQmFycyA/ICd4JyA6ICd5Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZ2hMb3cgPSBDaGFydGlzdC5nZXRIaWdoTG93KGRhdGEubm9ybWFsaXplZCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLCB7XG4gICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICB9KSwgb3B0aW9ucy5ob3Jpem9udGFsQmFycyA/ICd4JyA6ICd5Jyk7XG4gICAgfVxuICAgIC8vIE92ZXJyaWRlcyBvZiBoaWdoIC8gbG93IGZyb20gc2V0dGluZ3NcbiAgICBoaWdoTG93LmhpZ2ggPSArb3B0aW9ucy5oaWdoIHx8IChvcHRpb25zLmhpZ2ggPT09IDAgPyAwIDogaGlnaExvdy5oaWdoKTtcbiAgICBoaWdoTG93LmxvdyA9ICtvcHRpb25zLmxvdyB8fCAob3B0aW9ucy5sb3cgPT09IDAgPyAwIDogaGlnaExvdy5sb3cpO1xuXG4gICAgdmFyIGNoYXJ0UmVjdCA9IENoYXJ0aXN0LmNyZWF0ZUNoYXJ0UmVjdCh0aGlzLnN2Zywgb3B0aW9ucywgZGVmYXVsdE9wdGlvbnMucGFkZGluZyk7XG5cbiAgICB2YXIgdmFsdWVBeGlzLFxuICAgICAgbGFiZWxBeGlzVGlja3MsXG4gICAgICBsYWJlbEF4aXMsXG4gICAgICBheGlzWCxcbiAgICAgIGF4aXNZO1xuXG4gICAgLy8gV2UgbmVlZCB0byBzZXQgc3RlcCBjb3VudCBiYXNlZCBvbiBzb21lIG9wdGlvbnMgY29tYmluYXRpb25zXG4gICAgaWYob3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzICYmIG9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYXJlIGVuYWJsZWQgYW5kIGJhcnMgbmVlZCB0byBiZSBzdGFja2VkLCB3ZSdsbCBvbmx5IGhhdmUgb25lIGJhciBhbmQgdGhlcmVmb3JlIHNob3VsZFxuICAgICAgLy8gdXNlIG9ubHkgdGhlIGZpcnN0IGxhYmVsIGZvciB0aGUgc3RlcCBheGlzXG4gICAgICBsYWJlbEF4aXNUaWNrcyA9IGRhdGEucmF3LmxhYmVscy5zbGljZSgwLCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFyZSBlbmFibGVkIGJ1dCBzdGFja2VkIGJhcnMgYXJlbid0LCB3ZSBzaG91bGQgdXNlIHRoZSBzZXJpZXMgbGFiZWxzXG4gICAgICAvLyBJZiB3ZSBhcmUgZHJhd2luZyBhIHJlZ3VsYXIgYmFyIGNoYXJ0IHdpdGggdHdvIGRpbWVuc2lvbmFsIHNlcmllcyBkYXRhLCB3ZSBqdXN0IHVzZSB0aGUgbGFiZWxzIGFycmF5XG4gICAgICAvLyBhcyB0aGUgYmFycyBhcmUgbm9ybWFsaXplZFxuICAgICAgbGFiZWxBeGlzVGlja3MgPSBkYXRhLnJhdy5sYWJlbHM7XG4gICAgfVxuXG4gICAgLy8gU2V0IGxhYmVsQXhpcyBhbmQgdmFsdWVBeGlzIGJhc2VkIG9uIHRoZSBob3Jpem9udGFsQmFycyBzZXR0aW5nLiBUaGlzIHNldHRpbmcgd2lsbCBmbGlwIHRoZSBheGVzIGlmIG5lY2Vzc2FyeS5cbiAgICBpZihvcHRpb25zLmhvcml6b250YWxCYXJzKSB7XG4gICAgICBpZihvcHRpb25zLmF4aXNYLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YWx1ZUF4aXMgPSBheGlzWCA9IG5ldyBDaGFydGlzdC5BdXRvU2NhbGVBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1gsIHtcbiAgICAgICAgICBoaWdoTG93OiBoaWdoTG93LFxuICAgICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlQXhpcyA9IGF4aXNYID0gb3B0aW9ucy5heGlzWC50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1gsIHtcbiAgICAgICAgICBoaWdoTG93OiBoaWdoTG93LFxuICAgICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgaWYob3B0aW9ucy5heGlzWS50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGFiZWxBeGlzID0gYXhpc1kgPSBuZXcgQ2hhcnRpc3QuU3RlcEF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIHtcbiAgICAgICAgICB0aWNrczogbGFiZWxBeGlzVGlja3NcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbEF4aXMgPSBheGlzWSA9IG9wdGlvbnMuYXhpc1kudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucy5heGlzWSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKG9wdGlvbnMuYXhpc1gudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxhYmVsQXhpcyA9IGF4aXNYID0gbmV3IENoYXJ0aXN0LlN0ZXBBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCB7XG4gICAgICAgICAgdGlja3M6IGxhYmVsQXhpc1RpY2tzXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWxBeGlzID0gYXhpc1ggPSBvcHRpb25zLmF4aXNYLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMuYXhpc1gpO1xuICAgICAgfVxuXG4gICAgICBpZihvcHRpb25zLmF4aXNZLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YWx1ZUF4aXMgPSBheGlzWSA9IG5ldyBDaGFydGlzdC5BdXRvU2NhbGVBeGlzKENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1ksIHtcbiAgICAgICAgICBoaWdoTG93OiBoaWdoTG93LFxuICAgICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICAgIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlQXhpcyA9IGF4aXNZID0gb3B0aW9ucy5heGlzWS50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMuYXhpc1ksIHtcbiAgICAgICAgICBoaWdoTG93OiBoaWdoTG93LFxuICAgICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcm9qZWN0ZWQgMCBwb2ludFxuICAgIHZhciB6ZXJvUG9pbnQgPSBvcHRpb25zLmhvcml6b250YWxCYXJzID8gKGNoYXJ0UmVjdC54MSArIHZhbHVlQXhpcy5wcm9qZWN0VmFsdWUoMCkpIDogKGNoYXJ0UmVjdC55MSAtIHZhbHVlQXhpcy5wcm9qZWN0VmFsdWUoMCkpO1xuICAgIC8vIFVzZWQgdG8gdHJhY2sgdGhlIHNjcmVlbiBjb29yZGluYXRlcyBvZiBzdGFja2VkIGJhcnNcbiAgICB2YXIgc3RhY2tlZEJhclZhbHVlcyA9IFtdO1xuXG4gICAgbGFiZWxBeGlzLmNyZWF0ZUdyaWRBbmRMYWJlbHMoZ3JpZEdyb3VwLCBsYWJlbEdyb3VwLCB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCwgb3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuICAgIHZhbHVlQXhpcy5jcmVhdGVHcmlkQW5kTGFiZWxzKGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QsIG9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcblxuICAgIC8vIERyYXcgdGhlIHNlcmllc1xuICAgIGRhdGEucmF3LnNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKHNlcmllcywgc2VyaWVzSW5kZXgpIHtcbiAgICAgIC8vIENhbGN1bGF0aW5nIGJpLXBvbGFyIHZhbHVlIG9mIGluZGV4IGZvciBzZXJpZXNPZmZzZXQuIEZvciBpID0gMC4uNCBiaVBvbCB3aWxsIGJlIC0xLjUsIC0wLjUsIDAuNSwgMS41IGV0Yy5cbiAgICAgIHZhciBiaVBvbCA9IHNlcmllc0luZGV4IC0gKGRhdGEucmF3LnNlcmllcy5sZW5ndGggLSAxKSAvIDI7XG4gICAgICAvLyBIYWxmIG9mIHRoZSBwZXJpb2Qgd2lkdGggYmV0d2VlbiB2ZXJ0aWNhbCBncmlkIGxpbmVzIHVzZWQgdG8gcG9zaXRpb24gYmFyc1xuICAgICAgdmFyIHBlcmlvZEhhbGZMZW5ndGg7XG4gICAgICAvLyBDdXJyZW50IHNlcmllcyBTVkcgZWxlbWVudFxuICAgICAgdmFyIHNlcmllc0VsZW1lbnQ7XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gc2V0IHBlcmlvZEhhbGZMZW5ndGggYmFzZWQgb24gc29tZSBvcHRpb25zIGNvbWJpbmF0aW9uc1xuICAgICAgaWYob3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzICYmICFvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYXJlIGVuYWJsZWQgYnV0IHN0YWNrZWQgYmFycyBhcmVuJ3QsIHdlIG5lZWQgdG8gdXNlIHRoZSBsZW5ndGggb2YgdGhlIG5vcm1haXplZERhdGEgYXJyYXlcbiAgICAgICAgLy8gd2hpY2ggaXMgdGhlIHNlcmllcyBjb3VudCBhbmQgZGl2aWRlIGJ5IDJcbiAgICAgICAgcGVyaW9kSGFsZkxlbmd0aCA9IGxhYmVsQXhpcy5heGlzTGVuZ3RoIC8gZGF0YS5ub3JtYWxpemVkLmxlbmd0aCAvIDI7XG4gICAgICB9IGVsc2UgaWYob3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzICYmIG9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhbmQgc3RhY2tlZCBiYXJzIGFyZSBlbmFibGVkIHdlJ2xsIG9ubHkgZ2V0IG9uZSBiYXIgc28gd2Ugc2hvdWxkIGp1c3QgZGl2aWRlIHRoZSBheGlzXG4gICAgICAgIC8vIGxlbmd0aCBieSAyXG4gICAgICAgIHBlcmlvZEhhbGZMZW5ndGggPSBsYWJlbEF4aXMuYXhpc0xlbmd0aCAvIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPbiByZWd1bGFyIGJhciBjaGFydHMgd2Ugc2hvdWxkIGp1c3QgdXNlIHRoZSBzZXJpZXMgbGVuZ3RoXG4gICAgICAgIHBlcmlvZEhhbGZMZW5ndGggPSBsYWJlbEF4aXMuYXhpc0xlbmd0aCAvIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0ubGVuZ3RoIC8gMjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkaW5nIHRoZSBzZXJpZXMgZ3JvdXAgdG8gdGhlIHNlcmllcyBlbGVtZW50XG4gICAgICBzZXJpZXNFbGVtZW50ID0gc2VyaWVzR3JvdXAuZWxlbSgnZycpO1xuXG4gICAgICAvLyBXcml0ZSBhdHRyaWJ1dGVzIHRvIHNlcmllcyBncm91cCBlbGVtZW50LiBJZiBzZXJpZXMgbmFtZSBvciBtZXRhIGlzIHVuZGVmaW5lZCB0aGUgYXR0cmlidXRlcyB3aWxsIG5vdCBiZSB3cml0dGVuXG4gICAgICBzZXJpZXNFbGVtZW50LmF0dHIoe1xuICAgICAgICAnc2VyaWVzLW5hbWUnOiBzZXJpZXMubmFtZSxcbiAgICAgICAgJ21ldGEnOiBDaGFydGlzdC5zZXJpYWxpemUoc2VyaWVzLm1ldGEpXG4gICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgIHNlcmllc0VsZW1lbnQuYWRkQ2xhc3MoW1xuICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzLFxuICAgICAgICAoc2VyaWVzLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShzZXJpZXNJbmRleCkpXG4gICAgICBdLmpvaW4oJyAnKSk7XG5cbiAgICAgIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgdmFsdWVJbmRleCkge1xuICAgICAgICB2YXIgcHJvamVjdGVkLFxuICAgICAgICAgIGJhcixcbiAgICAgICAgICBwcmV2aW91c1N0YWNrLFxuICAgICAgICAgIGxhYmVsQXhpc1ZhbHVlSW5kZXg7XG5cbiAgICAgICAgLy8gV2UgbmVlZCB0byBzZXQgbGFiZWxBeGlzVmFsdWVJbmRleCBiYXNlZCBvbiBzb21lIG9wdGlvbnMgY29tYmluYXRpb25zXG4gICAgICAgIGlmKG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyAmJiAhb3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYXJlIGVuYWJsZWQgYnV0IHN0YWNrZWQgYmFycyBhcmVuJ3QsIHdlIGNhbiB1c2UgdGhlIHNlcmllc0luZGV4IGZvciBsYXRlciBwcm9qZWN0aW9uXG4gICAgICAgICAgLy8gb24gdGhlIHN0ZXAgYXhpcyBmb3IgbGFiZWwgcG9zaXRpb25pbmdcbiAgICAgICAgICBsYWJlbEF4aXNWYWx1ZUluZGV4ID0gc2VyaWVzSW5kZXg7XG4gICAgICAgIH0gZWxzZSBpZihvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgJiYgb3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYW5kIHN0YWNrZWQgYmFycyBhcmUgZW5hYmxlZCwgd2Ugd2lsbCBvbmx5IGdldCBvbmUgYmFyIGFuZCB0aGVyZWZvcmUgYWx3YXlzIHVzZVxuICAgICAgICAgIC8vIDAgZm9yIHByb2plY3Rpb24gb24gdGhlIGxhYmVsIHN0ZXAgYXhpc1xuICAgICAgICAgIGxhYmVsQXhpc1ZhbHVlSW5kZXggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9uIHJlZ3VsYXIgYmFyIGNoYXJ0cyB3ZSBqdXN0IHVzZSB0aGUgdmFsdWUgaW5kZXggdG8gcHJvamVjdCBvbiB0aGUgbGFiZWwgc3RlcCBheGlzXG4gICAgICAgICAgbGFiZWxBeGlzVmFsdWVJbmRleCA9IHZhbHVlSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBuZWVkIHRvIHRyYW5zZm9ybSBjb29yZGluYXRlcyBkaWZmZXJlbnRseSBiYXNlZCBvbiB0aGUgY2hhcnQgbGF5b3V0XG4gICAgICAgIGlmKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMpIHtcbiAgICAgICAgICBwcm9qZWN0ZWQgPSB7XG4gICAgICAgICAgICB4OiBjaGFydFJlY3QueDEgKyB2YWx1ZUF4aXMucHJvamVjdFZhbHVlKHZhbHVlICYmIHZhbHVlLnggPyB2YWx1ZS54IDogMCwgdmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSksXG4gICAgICAgICAgICB5OiBjaGFydFJlY3QueTEgLSBsYWJlbEF4aXMucHJvamVjdFZhbHVlKHZhbHVlICYmIHZhbHVlLnkgPyB2YWx1ZS55IDogMCwgbGFiZWxBeGlzVmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSlcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2plY3RlZCA9IHtcbiAgICAgICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIGxhYmVsQXhpcy5wcm9qZWN0VmFsdWUodmFsdWUgJiYgdmFsdWUueCA/IHZhbHVlLnggOiAwLCBsYWJlbEF4aXNWYWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKSxcbiAgICAgICAgICAgIHk6IGNoYXJ0UmVjdC55MSAtIHZhbHVlQXhpcy5wcm9qZWN0VmFsdWUodmFsdWUgJiYgdmFsdWUueSA/IHZhbHVlLnkgOiAwLCB2YWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSBsYWJlbCBheGlzIGlzIGEgc3RlcCBiYXNlZCBheGlzIHdlIHdpbGwgb2Zmc2V0IHRoZSBiYXIgaW50byB0aGUgbWlkZGxlIG9mIGJldHdlZW4gdHdvIHN0ZXBzIHVzaW5nXG4gICAgICAgIC8vIHRoZSBwZXJpb2RIYWxmTGVuZ3RoIHZhbHVlLiBBbHNvIHdlIGRvIGFycmFuZ2UgdGhlIGRpZmZlcmVudCBzZXJpZXMgc28gdGhhdCB0aGV5IGFsaWduIHVwIHRvIGVhY2ggb3RoZXIgdXNpbmdcbiAgICAgICAgLy8gdGhlIHNlcmllc0JhckRpc3RhbmNlLiBJZiB3ZSBkb24ndCBoYXZlIGEgc3RlcCBheGlzLCB0aGUgYmFyIHBvc2l0aW9ucyBjYW4gYmUgY2hvc2VuIGZyZWVseSBzbyB3ZSBzaG91bGQgbm90XG4gICAgICAgIC8vIGFkZCBhbnkgYXV0b21hdGVkIHBvc2l0aW9uaW5nLlxuICAgICAgICBpZihsYWJlbEF4aXMgaW5zdGFuY2VvZiBDaGFydGlzdC5TdGVwQXhpcykge1xuICAgICAgICAgIC8vIE9mZnNldCB0byBjZW50ZXIgYmFyIGJldHdlZW4gZ3JpZCBsaW5lcywgYnV0IG9ubHkgaWYgdGhlIHN0ZXAgYXhpcyBpcyBub3Qgc3RyZXRjaGVkXG4gICAgICAgICAgaWYoIWxhYmVsQXhpcy5vcHRpb25zLnN0cmV0Y2gpIHtcbiAgICAgICAgICAgIHByb2plY3RlZFtsYWJlbEF4aXMudW5pdHMucG9zXSArPSBwZXJpb2RIYWxmTGVuZ3RoICogKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAtMSA6IDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBVc2luZyBiaS1wb2xhciBvZmZzZXQgZm9yIG11bHRpcGxlIHNlcmllcyBpZiBubyBzdGFja2VkIGJhcnMgb3Igc2VyaWVzIGRpc3RyaWJ1dGlvbiBpcyB1c2VkXG4gICAgICAgICAgcHJvamVjdGVkW2xhYmVsQXhpcy51bml0cy5wb3NdICs9IChvcHRpb25zLnN0YWNrQmFycyB8fCBvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMpID8gMCA6IGJpUG9sICogb3B0aW9ucy5zZXJpZXNCYXJEaXN0YW5jZSAqIChvcHRpb25zLmhvcml6b250YWxCYXJzID8gLTEgOiAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVudGVyIHZhbHVlIGluIHN0YWNrZWQgYmFyIHZhbHVlcyB1c2VkIHRvIHJlbWVtYmVyIHByZXZpb3VzIHNjcmVlbiB2YWx1ZSBmb3Igc3RhY2tpbmcgdXAgYmFyc1xuICAgICAgICBwcmV2aW91c1N0YWNrID0gc3RhY2tlZEJhclZhbHVlc1t2YWx1ZUluZGV4XSB8fCB6ZXJvUG9pbnQ7XG4gICAgICAgIHN0YWNrZWRCYXJWYWx1ZXNbdmFsdWVJbmRleF0gPSBwcmV2aW91c1N0YWNrIC0gKHplcm9Qb2ludCAtIHByb2plY3RlZFtsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvc10pO1xuXG4gICAgICAgIC8vIFNraXAgaWYgdmFsdWUgaXMgdW5kZWZpbmVkXG4gICAgICAgIGlmKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcG9zaXRpb25zID0ge307XG4gICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMudW5pdHMucG9zICsgJzEnXSA9IHByb2plY3RlZFtsYWJlbEF4aXMudW5pdHMucG9zXTtcbiAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy51bml0cy5wb3MgKyAnMiddID0gcHJvamVjdGVkW2xhYmVsQXhpcy51bml0cy5wb3NdO1xuXG4gICAgICAgIGlmKG9wdGlvbnMuc3RhY2tCYXJzICYmIChvcHRpb25zLnN0YWNrTW9kZSA9PT0gJ2FjY3VtdWxhdGUnIHx8ICFvcHRpb25zLnN0YWNrTW9kZSkpIHtcbiAgICAgICAgICAvLyBTdGFjayBtb2RlOiBhY2N1bXVsYXRlIChkZWZhdWx0KVxuICAgICAgICAgIC8vIElmIGJhcnMgYXJlIHN0YWNrZWQgd2UgdXNlIHRoZSBzdGFja2VkQmFyVmFsdWVzIHJlZmVyZW5jZSBhbmQgb3RoZXJ3aXNlIGJhc2UgYWxsIGJhcnMgb2ZmIHRoZSB6ZXJvIGxpbmVcbiAgICAgICAgICAvLyBXZSB3YW50IGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCBzbyB0aGUgZXhwZWN0ZWQgZmFsbGJhY2sgd2l0aG91dCB0aGUgJ3N0YWNrTW9kZScgb3B0aW9uXG4gICAgICAgICAgLy8gdG8gYmUgdGhlIG9yaWdpbmFsIGJlaGF2aW91ciAoYWNjdW11bGF0ZSlcbiAgICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMSddID0gcHJldmlvdXNTdGFjaztcbiAgICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMiddID0gc3RhY2tlZEJhclZhbHVlc1t2YWx1ZUluZGV4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBEcmF3IGZyb20gdGhlIHplcm8gbGluZSBub3JtYWxseVxuICAgICAgICAgIC8vIFRoaXMgaXMgYWxzbyB0aGUgc2FtZSBjb2RlIGZvciBTdGFjayBtb2RlOiBvdmVybGFwXG4gICAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzEnXSA9IHplcm9Qb2ludDtcbiAgICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMiddID0gcHJvamVjdGVkW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExpbWl0IHggYW5kIHkgc28gdGhhdCB0aGV5IGFyZSB3aXRoaW4gdGhlIGNoYXJ0IHJlY3RcbiAgICAgICAgcG9zaXRpb25zLngxID0gTWF0aC5taW4oTWF0aC5tYXgocG9zaXRpb25zLngxLCBjaGFydFJlY3QueDEpLCBjaGFydFJlY3QueDIpO1xuICAgICAgICBwb3NpdGlvbnMueDIgPSBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbnMueDIsIGNoYXJ0UmVjdC54MSksIGNoYXJ0UmVjdC54Mik7XG4gICAgICAgIHBvc2l0aW9ucy55MSA9IE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9ucy55MSwgY2hhcnRSZWN0LnkyKSwgY2hhcnRSZWN0LnkxKTtcbiAgICAgICAgcG9zaXRpb25zLnkyID0gTWF0aC5taW4oTWF0aC5tYXgocG9zaXRpb25zLnkyLCBjaGFydFJlY3QueTIpLCBjaGFydFJlY3QueTEpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBiYXIgZWxlbWVudFxuICAgICAgICBiYXIgPSBzZXJpZXNFbGVtZW50LmVsZW0oJ2xpbmUnLCBwb3NpdGlvbnMsIG9wdGlvbnMuY2xhc3NOYW1lcy5iYXIpLmF0dHIoe1xuICAgICAgICAgICd2YWx1ZSc6IFt2YWx1ZS54LCB2YWx1ZS55XS5maWx0ZXIoZnVuY3Rpb24odikge1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgfSkuam9pbignLCcpLFxuICAgICAgICAgICdtZXRhJzogQ2hhcnRpc3QuZ2V0TWV0YURhdGEoc2VyaWVzLCB2YWx1ZUluZGV4KVxuICAgICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBpbmRleDogdmFsdWVJbmRleCxcbiAgICAgICAgICBtZXRhOiBDaGFydGlzdC5nZXRNZXRhRGF0YShzZXJpZXMsIHZhbHVlSW5kZXgpLFxuICAgICAgICAgIHNlcmllczogc2VyaWVzLFxuICAgICAgICAgIHNlcmllc0luZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICBheGlzWDogYXhpc1gsXG4gICAgICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgICAgIGdyb3VwOiBzZXJpZXNFbGVtZW50LFxuICAgICAgICAgIGVsZW1lbnQ6IGJhclxuICAgICAgICB9LCBwb3NpdGlvbnMpKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2NyZWF0ZWQnLCB7XG4gICAgICBib3VuZHM6IHZhbHVlQXhpcy5ib3VuZHMsXG4gICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgIHN2ZzogdGhpcy5zdmcsXG4gICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBiYXIgY2hhcnQgYW5kIHJldHVybnMgQVBJIG9iamVjdCB0aGF0IHlvdSBjYW4gdXNlIGZvciBsYXRlciBjaGFuZ2VzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFyXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IHF1ZXJ5IEEgc2VsZWN0b3IgcXVlcnkgc3RyaW5nIG9yIGRpcmVjdGx5IGEgRE9NIGVsZW1lbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IHRoYXQgbmVlZHMgdG8gY29uc2lzdCBvZiBhIGxhYmVscyBhbmQgYSBzZXJpZXMgYXJyYXlcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3Qgd2l0aCBvcHRpb25zIHRoYXQgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBhIGRldGFpbGVkIGxpc3QuXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtyZXNwb25zaXZlT3B0aW9uc10gU3BlY2lmeSBhbiBhcnJheSBvZiByZXNwb25zaXZlIG9wdGlvbiBhcnJheXMgd2hpY2ggYXJlIGEgbWVkaWEgcXVlcnkgYW5kIG9wdGlvbnMgb2JqZWN0IHBhaXIgPT4gW1ttZWRpYVF1ZXJ5U3RyaW5nLCBvcHRpb25zT2JqZWN0XSxbbW9yZS4uLl1dXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdoaWNoIGV4cG9zZXMgdGhlIEFQSSBmb3IgdGhlIGNyZWF0ZWQgY2hhcnRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gQ3JlYXRlIGEgc2ltcGxlIGJhciBjaGFydFxuICAgKiB2YXIgZGF0YSA9IHtcbiAgICogICBsYWJlbHM6IFsnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaSddLFxuICAgKiAgIHNlcmllczogW1xuICAgKiAgICAgWzUsIDIsIDQsIDIsIDBdXG4gICAqICAgXVxuICAgKiB9O1xuICAgKlxuICAgKiAvLyBJbiB0aGUgZ2xvYmFsIG5hbWUgc3BhY2UgQ2hhcnRpc3Qgd2UgY2FsbCB0aGUgQmFyIGZ1bmN0aW9uIHRvIGluaXRpYWxpemUgYSBiYXIgY2hhcnQuIEFzIGEgZmlyc3QgcGFyYW1ldGVyIHdlIHBhc3MgaW4gYSBzZWxlY3RvciB3aGVyZSB3ZSB3b3VsZCBsaWtlIHRvIGdldCBvdXIgY2hhcnQgY3JlYXRlZCBhbmQgYXMgYSBzZWNvbmQgcGFyYW1ldGVyIHdlIHBhc3Mgb3VyIGRhdGEgb2JqZWN0LlxuICAgKiBuZXcgQ2hhcnRpc3QuQmFyKCcuY3QtY2hhcnQnLCBkYXRhKTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gVGhpcyBleGFtcGxlIGNyZWF0ZXMgYSBiaXBvbGFyIGdyb3VwZWQgYmFyIGNoYXJ0IHdoZXJlIHRoZSBib3VuZGFyaWVzIGFyZSBsaW1pdHRlZCB0byAtMTAgYW5kIDEwXG4gICAqIG5ldyBDaGFydGlzdC5CYXIoJy5jdC1jaGFydCcsIHtcbiAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1LCA2LCA3XSxcbiAgICogICBzZXJpZXM6IFtcbiAgICogICAgIFsxLCAzLCAyLCAtNSwgLTMsIDEsIC02XSxcbiAgICogICAgIFstNSwgLTIsIC00LCAtMSwgMiwgLTMsIDFdXG4gICAqICAgXVxuICAgKiB9LCB7XG4gICAqICAgc2VyaWVzQmFyRGlzdGFuY2U6IDEyLFxuICAgKiAgIGxvdzogLTEwLFxuICAgKiAgIGhpZ2g6IDEwXG4gICAqIH0pO1xuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gQmFyKHF1ZXJ5LCBkYXRhLCBvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucykge1xuICAgIENoYXJ0aXN0LkJhci5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBxdWVyeSxcbiAgICAgIGRhdGEsXG4gICAgICBkZWZhdWx0T3B0aW9ucyxcbiAgICAgIENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLFxuICAgICAgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICB9XG5cbiAgLy8gQ3JlYXRpbmcgYmFyIGNoYXJ0IHR5cGUgaW4gQ2hhcnRpc3QgbmFtZXNwYWNlXG4gIENoYXJ0aXN0LkJhciA9IENoYXJ0aXN0LkJhc2UuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogQmFyLFxuICAgIGNyZWF0ZUNoYXJ0OiBjcmVhdGVDaGFydFxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIHBpZSBjaGFydCBtb2R1bGUgb2YgQ2hhcnRpc3QgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmF3IHBpZSwgZG9udXQgb3IgZ2F1Z2UgY2hhcnRzXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5QaWVcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgaW4gbGluZSBjaGFydHMuIEV4cGFuZCB0aGUgY29kZSB2aWV3IHRvIHNlZSBhIGRldGFpbGVkIGxpc3Qgb2Ygb3B0aW9ucyB3aXRoIGNvbW1lbnRzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuUGllXG4gICAqL1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIHdpZHRoIGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCBoZWlnaHQgZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIGhlaWdodDogdW5kZWZpbmVkLFxuICAgIC8vIFBhZGRpbmcgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQgYW5kIGxhYmVscyBhcyBhIG51bWJlciBvciBwYWRkaW5nIG9iamVjdCB7dG9wOiA1LCByaWdodDogNSwgYm90dG9tOiA1LCBsZWZ0OiA1fVxuICAgIGNoYXJ0UGFkZGluZzogNSxcbiAgICAvLyBPdmVycmlkZSB0aGUgY2xhc3MgbmFtZXMgdGhhdCBhcmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgU1ZHIHN0cnVjdHVyZSBvZiB0aGUgY2hhcnRcbiAgICBjbGFzc05hbWVzOiB7XG4gICAgICBjaGFydFBpZTogJ2N0LWNoYXJ0LXBpZScsXG4gICAgICBjaGFydERvbnV0OiAnY3QtY2hhcnQtZG9udXQnLFxuICAgICAgc2VyaWVzOiAnY3Qtc2VyaWVzJyxcbiAgICAgIHNsaWNlUGllOiAnY3Qtc2xpY2UtcGllJyxcbiAgICAgIHNsaWNlRG9udXQ6ICdjdC1zbGljZS1kb251dCcsXG4gICAgICBsYWJlbDogJ2N0LWxhYmVsJ1xuICAgIH0sXG4gICAgLy8gVGhlIHN0YXJ0IGFuZ2xlIG9mIHRoZSBwaWUgY2hhcnQgaW4gZGVncmVlcyB3aGVyZSAwIHBvaW50cyBub3J0aC4gQSBoaWdoZXIgdmFsdWUgb2Zmc2V0cyB0aGUgc3RhcnQgYW5nbGUgY2xvY2t3aXNlLlxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgLy8gQW4gb3B0aW9uYWwgdG90YWwgeW91IGNhbiBzcGVjaWZ5LiBCeSBzcGVjaWZ5aW5nIGEgdG90YWwgdmFsdWUsIHRoZSBzdW0gb2YgdGhlIHZhbHVlcyBpbiB0aGUgc2VyaWVzIG11c3QgYmUgdGhpcyB0b3RhbCBpbiBvcmRlciB0byBkcmF3IGEgZnVsbCBwaWUuIFlvdSBjYW4gdXNlIHRoaXMgcGFyYW1ldGVyIHRvIGRyYXcgb25seSBwYXJ0cyBvZiBhIHBpZSBvciBnYXVnZSBjaGFydHMuXG4gICAgdG90YWw6IHVuZGVmaW5lZCxcbiAgICAvLyBJZiBzcGVjaWZpZWQgdGhlIGRvbnV0IENTUyBjbGFzc2VzIHdpbGwgYmUgdXNlZCBhbmQgc3Ryb2tlcyB3aWxsIGJlIGRyYXduIGluc3RlYWQgb2YgcGllIHNsaWNlcy5cbiAgICBkb251dDogZmFsc2UsXG4gICAgLy8gU3BlY2lmeSB0aGUgZG9udXQgc3Ryb2tlIHdpZHRoLCBjdXJyZW50bHkgZG9uZSBpbiBqYXZhc2NyaXB0IGZvciBjb252ZW5pZW5jZS4gTWF5IG1vdmUgdG8gQ1NTIHN0eWxlcyBpbiB0aGUgZnV0dXJlLlxuICAgIC8vIFRoaXMgb3B0aW9uIGNhbiBiZSBzZXQgYXMgbnVtYmVyIG9yIHN0cmluZyB0byBzcGVjaWZ5IGEgcmVsYXRpdmUgd2lkdGggKGkuZS4gMTAwIG9yICczMCUnKS5cbiAgICBkb251dFdpZHRoOiA2MCxcbiAgICAvLyBJZiBhIGxhYmVsIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgLy8gTGFiZWwgcG9zaXRpb24gb2Zmc2V0IGZyb20gdGhlIHN0YW5kYXJkIHBvc2l0aW9uIHdoaWNoIGlzIGhhbGYgZGlzdGFuY2Ugb2YgdGhlIHJhZGl1cy4gVGhpcyB2YWx1ZSBjYW4gYmUgZWl0aGVyIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiBQb3NpdGl2ZSB2YWx1ZXMgd2lsbCBwb3NpdGlvbiB0aGUgbGFiZWwgYXdheSBmcm9tIHRoZSBjZW50ZXIuXG4gICAgbGFiZWxPZmZzZXQ6IDAsXG4gICAgLy8gVGhpcyBvcHRpb24gY2FuIGJlIHNldCB0byAnaW5zaWRlJywgJ291dHNpZGUnIG9yICdjZW50ZXInLiBQb3NpdGlvbmVkIHdpdGggJ2luc2lkZScgdGhlIGxhYmVscyB3aWxsIGJlIHBsYWNlZCBvbiBoYWxmIHRoZSBkaXN0YW5jZSBvZiB0aGUgcmFkaXVzIHRvIHRoZSBib3JkZXIgb2YgdGhlIFBpZSBieSByZXNwZWN0aW5nIHRoZSAnbGFiZWxPZmZzZXQnLiBUaGUgJ291dHNpZGUnIG9wdGlvbiB3aWxsIHBsYWNlIHRoZSBsYWJlbHMgYXQgdGhlIGJvcmRlciBvZiB0aGUgcGllIGFuZCAnY2VudGVyJyB3aWxsIHBsYWNlIHRoZSBsYWJlbHMgaW4gdGhlIGFic29sdXRlIGNlbnRlciBwb2ludCBvZiB0aGUgY2hhcnQuIFRoZSAnY2VudGVyJyBvcHRpb24gb25seSBtYWtlcyBzZW5zZSBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSAnbGFiZWxPZmZzZXQnIG9wdGlvbi5cbiAgICBsYWJlbFBvc2l0aW9uOiAnaW5zaWRlJyxcbiAgICAvLyBBbiBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGZvciB0aGUgbGFiZWwgdmFsdWVcbiAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgLy8gTGFiZWwgZGlyZWN0aW9uIGNhbiBiZSAnbmV1dHJhbCcsICdleHBsb2RlJyBvciAnaW1wbG9kZScuIFRoZSBsYWJlbHMgYW5jaG9yIHdpbGwgYmUgcG9zaXRpb25lZCBiYXNlZCBvbiB0aG9zZSBzZXR0aW5ncyBhcyB3ZWxsIGFzIHRoZSBmYWN0IGlmIHRoZSBsYWJlbHMgYXJlIG9uIHRoZSByaWdodCBvciBsZWZ0IHNpZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgY2hhcnQuIFVzdWFsbHkgZXhwbG9kZSBpcyB1c2VmdWwgd2hlbiBsYWJlbHMgYXJlIHBvc2l0aW9uZWQgZmFyIGF3YXkgZnJvbSB0aGUgY2VudGVyLlxuICAgIGxhYmVsRGlyZWN0aW9uOiAnbmV1dHJhbCcsXG4gICAgLy8gSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBpbmNsdWRpbmcgbGFiZWxzLCB0aGUgc2VyaWVzIG9yZGVyIGFzIHdlbGwgYXMgdGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICByZXZlcnNlRGF0YTogZmFsc2VcbiAgfTtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBTVkcgYW5jaG9yIHBvc2l0aW9uIGJhc2VkIG9uIGRpcmVjdGlvbiBhbmQgY2VudGVyIHBhcmFtZXRlclxuICAgKlxuICAgKiBAcGFyYW0gY2VudGVyXG4gICAqIEBwYXJhbSBsYWJlbFxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIGRldGVybWluZUFuY2hvclBvc2l0aW9uKGNlbnRlciwgbGFiZWwsIGRpcmVjdGlvbikge1xuICAgIHZhciB0b1RoZVJpZ2h0ID0gbGFiZWwueCA+IGNlbnRlci54O1xuXG4gICAgaWYodG9UaGVSaWdodCAmJiBkaXJlY3Rpb24gPT09ICdleHBsb2RlJyB8fFxuICAgICAgIXRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnaW1wbG9kZScpIHtcbiAgICAgIHJldHVybiAnc3RhcnQnO1xuICAgIH0gZWxzZSBpZih0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2ltcGxvZGUnIHx8XG4gICAgICAhdG9UaGVSaWdodCAmJiBkaXJlY3Rpb24gPT09ICdleHBsb2RlJykge1xuICAgICAgcmV0dXJuICdlbmQnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ21pZGRsZSc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIHBpZSBjaGFydFxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ2hhcnQob3B0aW9ucykge1xuICAgIHZhciBzZXJpZXNHcm91cHMgPSBbXSxcbiAgICAgIGxhYmVsc0dyb3VwLFxuICAgICAgY2hhcnRSZWN0LFxuICAgICAgcmFkaXVzLFxuICAgICAgbGFiZWxSYWRpdXMsXG4gICAgICB0b3RhbERhdGFTdW0sXG4gICAgICBzdGFydEFuZ2xlID0gb3B0aW9ucy5zdGFydEFuZ2xlLFxuICAgICAgZGF0YUFycmF5ID0gQ2hhcnRpc3QuZ2V0RGF0YUFycmF5KHRoaXMuZGF0YSwgb3B0aW9ucy5yZXZlcnNlRGF0YSk7XG5cbiAgICAvLyBDcmVhdGUgU1ZHLmpzIGRyYXdcbiAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2Zyh0aGlzLmNvbnRhaW5lciwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsb3B0aW9ucy5kb251dCA/IG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydERvbnV0IDogb3B0aW9ucy5jbGFzc05hbWVzLmNoYXJ0UGllKTtcbiAgICAvLyBDYWxjdWxhdGUgY2hhcnRpbmcgcmVjdFxuICAgIGNoYXJ0UmVjdCA9IENoYXJ0aXN0LmNyZWF0ZUNoYXJ0UmVjdCh0aGlzLnN2Zywgb3B0aW9ucywgZGVmYXVsdE9wdGlvbnMucGFkZGluZyk7XG4gICAgLy8gR2V0IGJpZ2dlc3QgY2lyY2xlIHJhZGl1cyBwb3NzaWJsZSB3aXRoaW4gY2hhcnRSZWN0XG4gICAgcmFkaXVzID0gTWF0aC5taW4oY2hhcnRSZWN0LndpZHRoKCkgLyAyLCBjaGFydFJlY3QuaGVpZ2h0KCkgLyAyKTtcbiAgICAvLyBDYWxjdWxhdGUgdG90YWwgb2YgYWxsIHNlcmllcyB0byBnZXQgcmVmZXJlbmNlIHZhbHVlIG9yIHVzZSB0b3RhbCByZWZlcmVuY2UgZnJvbSBvcHRpb25hbCBvcHRpb25zXG4gICAgdG90YWxEYXRhU3VtID0gb3B0aW9ucy50b3RhbCB8fCBkYXRhQXJyYXkucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWUgKyBjdXJyZW50VmFsdWU7XG4gICAgfSwgMCk7XG5cbiAgICB2YXIgZG9udXRXaWR0aCA9IENoYXJ0aXN0LnF1YW50aXR5KG9wdGlvbnMuZG9udXRXaWR0aCk7XG4gICAgaWYgKGRvbnV0V2lkdGgudW5pdCA9PT0gJyUnKSB7XG4gICAgICBkb251dFdpZHRoLnZhbHVlICo9IHJhZGl1cyAvIDEwMDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGlzIGlzIGEgZG9udXQgY2hhcnQgd2UgbmVlZCB0byBhZGp1c3Qgb3VyIHJhZGl1cyB0byBlbmFibGUgc3Ryb2tlcyB0byBiZSBkcmF3biBpbnNpZGVcbiAgICAvLyBVbmZvcnR1bmF0ZWx5IHRoaXMgaXMgbm90IHBvc3NpYmxlIHdpdGggdGhlIGN1cnJlbnQgU1ZHIFNwZWNcbiAgICAvLyBTZWUgdGhpcyBwcm9wb3NhbCBmb3IgbW9yZSBkZXRhaWxzOiBodHRwOi8vbGlzdHMudzMub3JnL0FyY2hpdmVzL1B1YmxpYy93d3ctc3ZnLzIwMDNPY3QvMDAwMC5odG1sXG4gICAgcmFkaXVzIC09IG9wdGlvbnMuZG9udXQgPyBkb251dFdpZHRoLnZhbHVlIC8gMiAgOiAwO1xuXG4gICAgLy8gSWYgbGFiZWxQb3NpdGlvbiBpcyBzZXQgdG8gYG91dHNpZGVgIG9yIGEgZG9udXQgY2hhcnQgaXMgZHJhd24gdGhlbiB0aGUgbGFiZWwgcG9zaXRpb24gaXMgYXQgdGhlIHJhZGl1cyxcbiAgICAvLyBpZiByZWd1bGFyIHBpZSBjaGFydCBpdCdzIGhhbGYgb2YgdGhlIHJhZGl1c1xuICAgIGlmKG9wdGlvbnMubGFiZWxQb3NpdGlvbiA9PT0gJ291dHNpZGUnIHx8IG9wdGlvbnMuZG9udXQpIHtcbiAgICAgIGxhYmVsUmFkaXVzID0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZihvcHRpb25zLmxhYmVsUG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICAvLyBJZiBsYWJlbFBvc2l0aW9uIGlzIGNlbnRlciB3ZSBzdGFydCB3aXRoIDAgYW5kIHdpbGwgbGF0ZXIgd2FpdCBmb3IgdGhlIGxhYmVsT2Zmc2V0XG4gICAgICBsYWJlbFJhZGl1cyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZmF1bHQgb3B0aW9uIGlzICdpbnNpZGUnIHdoZXJlIHdlIHVzZSBoYWxmIHRoZSByYWRpdXMgc28gdGhlIGxhYmVsIHdpbGwgYmUgcGxhY2VkIGluIHRoZSBjZW50ZXIgb2YgdGhlIHBpZVxuICAgICAgLy8gc2xpY2VcbiAgICAgIGxhYmVsUmFkaXVzID0gcmFkaXVzIC8gMjtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBvZmZzZXQgdG8gdGhlIGxhYmVsUmFkaXVzIHdoZXJlIGEgbmVnYXRpdmUgb2Zmc2V0IG1lYW5zIGNsb3NlZCB0byB0aGUgY2VudGVyIG9mIHRoZSBjaGFydFxuICAgIGxhYmVsUmFkaXVzICs9IG9wdGlvbnMubGFiZWxPZmZzZXQ7XG5cbiAgICAvLyBDYWxjdWxhdGUgZW5kIGFuZ2xlIGJhc2VkIG9uIHRvdGFsIHN1bSBhbmQgY3VycmVudCBkYXRhIHZhbHVlIGFuZCBvZmZzZXQgd2l0aCBwYWRkaW5nXG4gICAgdmFyIGNlbnRlciA9IHtcbiAgICAgIHg6IGNoYXJ0UmVjdC54MSArIGNoYXJ0UmVjdC53aWR0aCgpIC8gMixcbiAgICAgIHk6IGNoYXJ0UmVjdC55MiArIGNoYXJ0UmVjdC5oZWlnaHQoKSAvIDJcbiAgICB9O1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgb25seSBvbmUgbm9uLXplcm8gdmFsdWUgaW4gdGhlIHNlcmllcyBhcnJheS5cbiAgICB2YXIgaGFzU2luZ2xlVmFsSW5TZXJpZXMgPSB0aGlzLmRhdGEuc2VyaWVzLmZpbHRlcihmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykgPyB2YWwudmFsdWUgIT09IDAgOiB2YWwgIT09IDA7XG4gICAgfSkubGVuZ3RoID09PSAxO1xuXG4gICAgLy9pZiB3ZSBuZWVkIHRvIHNob3cgbGFiZWxzIHdlIGNyZWF0ZSB0aGUgbGFiZWwgZ3JvdXAgbm93XG4gICAgaWYob3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgIGxhYmVsc0dyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycsIG51bGwsIG51bGwsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIERyYXcgdGhlIHNlcmllc1xuICAgIC8vIGluaXRpYWxpemUgc2VyaWVzIGdyb3Vwc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlcmllcyA9IHRoaXMuZGF0YS5zZXJpZXNbaV07XG4gICAgICBzZXJpZXNHcm91cHNbaV0gPSB0aGlzLnN2Zy5lbGVtKCdnJywgbnVsbCwgbnVsbCwgdHJ1ZSk7XG5cbiAgICAgIC8vIElmIHRoZSBzZXJpZXMgaXMgYW4gb2JqZWN0IGFuZCBjb250YWlucyBhIG5hbWUgb3IgbWV0YSBkYXRhIHdlIGFkZCBhIGN1c3RvbSBhdHRyaWJ1dGVcbiAgICAgIHNlcmllc0dyb3Vwc1tpXS5hdHRyKHtcbiAgICAgICAgJ3Nlcmllcy1uYW1lJzogc2VyaWVzLm5hbWVcbiAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgIC8vIFVzZSBzZXJpZXMgY2xhc3MgZnJvbSBzZXJpZXMgZGF0YSBvciBpZiBub3Qgc2V0IGdlbmVyYXRlIG9uZVxuICAgICAgc2VyaWVzR3JvdXBzW2ldLmFkZENsYXNzKFtcbiAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyxcbiAgICAgICAgKHNlcmllcy5jbGFzc05hbWUgfHwgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyArICctJyArIENoYXJ0aXN0LmFscGhhTnVtZXJhdGUoaSkpXG4gICAgICBdLmpvaW4oJyAnKSk7XG5cbiAgICAgIHZhciBlbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBkYXRhQXJyYXlbaV0gLyB0b3RhbERhdGFTdW0gKiAzNjA7XG4gICAgICAvLyBJZiB3ZSBuZWVkIHRvIGRyYXcgdGhlIGFyYyBmb3IgYWxsIDM2MCBkZWdyZWVzIHdlIG5lZWQgdG8gYWRkIGEgaGFjayB3aGVyZSB3ZSBjbG9zZSB0aGUgY2lyY2xlXG4gICAgICAvLyB3aXRoIFogYW5kIHVzZSAzNTkuOTkgZGVncmVlc1xuICAgICAgaWYoZW5kQW5nbGUgLSBzdGFydEFuZ2xlID09PSAzNjApIHtcbiAgICAgICAgZW5kQW5nbGUgLT0gMC4wMTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXJ0ID0gQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbihjZW50ZXIueCwgY2VudGVyLnksIHJhZGl1cywgc3RhcnRBbmdsZSAtIChpID09PSAwIHx8IGhhc1NpbmdsZVZhbEluU2VyaWVzID8gMCA6IDAuMikpLFxuICAgICAgICBlbmQgPSBDaGFydGlzdC5wb2xhclRvQ2FydGVzaWFuKGNlbnRlci54LCBjZW50ZXIueSwgcmFkaXVzLCBlbmRBbmdsZSk7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBwYXRoIGVsZW1lbnQgZm9yIHRoZSBwaWUgY2hhcnQuIElmIHRoaXMgaXNuJ3QgYSBkb251dCBjaGFydCB3ZSBzaG91bGQgY2xvc2UgdGhlIHBhdGggZm9yIGEgY29ycmVjdCBzdHJva2VcbiAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCFvcHRpb25zLmRvbnV0KVxuICAgICAgICAubW92ZShlbmQueCwgZW5kLnkpXG4gICAgICAgIC5hcmMocmFkaXVzLCByYWRpdXMsIDAsIGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSA+IDE4MCwgMCwgc3RhcnQueCwgc3RhcnQueSk7XG5cbiAgICAgIC8vIElmIHJlZ3VsYXIgcGllIGNoYXJ0IChubyBkb251dCkgd2UgYWRkIGEgbGluZSB0byB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUgZm9yIGNvbXBsZXRpbmcgdGhlIHBpZVxuICAgICAgaWYoIW9wdGlvbnMuZG9udXQpIHtcbiAgICAgICAgcGF0aC5saW5lKGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgU1ZHIHBhdGhcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBkb251dCBjaGFydCB3ZSBhZGQgdGhlIGRvbnV0IGNsYXNzLCBvdGhlcndpc2UganVzdCBhIHJlZ3VsYXIgc2xpY2VcbiAgICAgIHZhciBwYXRoRWxlbWVudCA9IHNlcmllc0dyb3Vwc1tpXS5lbGVtKCdwYXRoJywge1xuICAgICAgICBkOiBwYXRoLnN0cmluZ2lmeSgpXG4gICAgICB9LCBvcHRpb25zLmRvbnV0ID8gb3B0aW9ucy5jbGFzc05hbWVzLnNsaWNlRG9udXQgOiBvcHRpb25zLmNsYXNzTmFtZXMuc2xpY2VQaWUpO1xuXG4gICAgICAvLyBBZGRpbmcgdGhlIHBpZSBzZXJpZXMgdmFsdWUgdG8gdGhlIHBhdGhcbiAgICAgIHBhdGhFbGVtZW50LmF0dHIoe1xuICAgICAgICAndmFsdWUnOiBkYXRhQXJyYXlbaV0sXG4gICAgICAgICdtZXRhJzogQ2hhcnRpc3Quc2VyaWFsaXplKHNlcmllcy5tZXRhKVxuICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIGRvbnV0LCB3ZSBhZGQgdGhlIHN0cm9rZS13aWR0aCBhcyBzdHlsZSBhdHRyaWJ1dGVcbiAgICAgIGlmKG9wdGlvbnMuZG9udXQpIHtcbiAgICAgICAgcGF0aEVsZW1lbnQuYXR0cih7XG4gICAgICAgICAgJ3N0eWxlJzogJ3N0cm9rZS13aWR0aDogJyArIGRvbnV0V2lkdGgudmFsdWUgKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXJlIG9mZiBkcmF3IGV2ZW50XG4gICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdkcmF3Jywge1xuICAgICAgICB0eXBlOiAnc2xpY2UnLFxuICAgICAgICB2YWx1ZTogZGF0YUFycmF5W2ldLFxuICAgICAgICB0b3RhbERhdGFTdW06IHRvdGFsRGF0YVN1bSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIG1ldGE6IHNlcmllcy5tZXRhLFxuICAgICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgICAgZ3JvdXA6IHNlcmllc0dyb3Vwc1tpXSxcbiAgICAgICAgZWxlbWVudDogcGF0aEVsZW1lbnQsXG4gICAgICAgIHBhdGg6IHBhdGguY2xvbmUoKSxcbiAgICAgICAgY2VudGVyOiBjZW50ZXIsXG4gICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZTogZW5kQW5nbGVcbiAgICAgIH0pO1xuXG4gICAgICAvLyBJZiB3ZSBuZWVkIHRvIHNob3cgbGFiZWxzIHdlIG5lZWQgdG8gYWRkIHRoZSBsYWJlbCBmb3IgdGhpcyBzbGljZSBub3dcbiAgICAgIGlmKG9wdGlvbnMuc2hvd0xhYmVsKSB7XG4gICAgICAgIC8vIFBvc2l0aW9uIGF0IHRoZSBsYWJlbFJhZGl1cyBkaXN0YW5jZSBmcm9tIGNlbnRlciBhbmQgYmV0d2VlbiBzdGFydCBhbmQgZW5kIGFuZ2xlXG4gICAgICAgIHZhciBsYWJlbFBvc2l0aW9uID0gQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbihjZW50ZXIueCwgY2VudGVyLnksIGxhYmVsUmFkaXVzLCBzdGFydEFuZ2xlICsgKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSkgLyAyKSxcbiAgICAgICAgICBpbnRlcnBvbGF0ZWRWYWx1ZSA9IG9wdGlvbnMubGFiZWxJbnRlcnBvbGF0aW9uRm5jKHRoaXMuZGF0YS5sYWJlbHMgPyB0aGlzLmRhdGEubGFiZWxzW2ldIDogZGF0YUFycmF5W2ldLCBpKTtcblxuICAgICAgICBpZihpbnRlcnBvbGF0ZWRWYWx1ZSB8fCBpbnRlcnBvbGF0ZWRWYWx1ZSA9PT0gMCkge1xuICAgICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBsYWJlbHNHcm91cC5lbGVtKCd0ZXh0Jywge1xuICAgICAgICAgICAgZHg6IGxhYmVsUG9zaXRpb24ueCxcbiAgICAgICAgICAgIGR5OiBsYWJlbFBvc2l0aW9uLnksXG4gICAgICAgICAgICAndGV4dC1hbmNob3InOiBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbihjZW50ZXIsIGxhYmVsUG9zaXRpb24sIG9wdGlvbnMubGFiZWxEaXJlY3Rpb24pXG4gICAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsKS50ZXh0KCcnICsgaW50ZXJwb2xhdGVkVmFsdWUpO1xuXG4gICAgICAgICAgLy8gRmlyZSBvZmYgZHJhdyBldmVudFxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICB0eXBlOiAnbGFiZWwnLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBncm91cDogbGFiZWxzR3JvdXAsXG4gICAgICAgICAgICBlbGVtZW50OiBsYWJlbEVsZW1lbnQsXG4gICAgICAgICAgICB0ZXh0OiAnJyArIGludGVycG9sYXRlZFZhbHVlLFxuICAgICAgICAgICAgeDogbGFiZWxQb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogbGFiZWxQb3NpdGlvbi55XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU2V0IG5leHQgc3RhcnRBbmdsZSB0byBjdXJyZW50IGVuZEFuZ2xlLiBVc2Ugc2xpZ2h0IG9mZnNldCBzbyB0aGVyZSBhcmUgbm8gdHJhbnNwYXJlbnQgaGFpcmxpbmUgaXNzdWVzXG4gICAgICAvLyAoZXhjZXB0IGZvciBsYXN0IHNsaWNlKVxuICAgICAgc3RhcnRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2NyZWF0ZWQnLCB7XG4gICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgIHN2ZzogdGhpcy5zdmcsXG4gICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBwaWUgY2hhcnQgYW5kIHJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVkcmF3IHRoZSBjaGFydC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlBpZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBxdWVyeSBBIHNlbGVjdG9yIHF1ZXJ5IHN0cmluZyBvciBkaXJlY3RseSBhIERPTSBlbGVtZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCBpbiB0aGUgcGllIGNoYXJ0IG5lZWRzIHRvIGhhdmUgYSBzZXJpZXMgcHJvcGVydHkgd2l0aCBhIG9uZSBkaW1lbnNpb25hbCBkYXRhIGFycmF5LiBUaGUgdmFsdWVzIHdpbGwgYmUgbm9ybWFsaXplZCBhZ2FpbnN0IGVhY2ggb3RoZXIgYW5kIGRvbid0IG5lY2Vzc2FyaWx5IG5lZWQgdG8gYmUgaW4gcGVyY2VudGFnZS4gVGhlIHNlcmllcyBwcm9wZXJ0eSBjYW4gYWxzbyBiZSBhbiBhcnJheSBvZiB2YWx1ZSBvYmplY3RzIHRoYXQgY29udGFpbiBhIHZhbHVlIHByb3BlcnR5IGFuZCBhIGNsYXNzTmFtZSBwcm9wZXJ0eSB0byBvdmVycmlkZSB0aGUgQ1NTIGNsYXNzIG5hbWUgZm9yIHRoZSBzZXJpZXMgZ3JvdXAuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0IHdpdGggb3B0aW9ucyB0aGF0IG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuIENoZWNrIHRoZSBleGFtcGxlcyBmb3IgYSBkZXRhaWxlZCBsaXN0LlxuICAgKiBAcGFyYW0ge0FycmF5fSBbcmVzcG9uc2l2ZU9wdGlvbnNdIFNwZWNpZnkgYW4gYXJyYXkgb2YgcmVzcG9uc2l2ZSBvcHRpb24gYXJyYXlzIHdoaWNoIGFyZSBhIG1lZGlhIHF1ZXJ5IGFuZCBvcHRpb25zIG9iamVjdCBwYWlyID0+IFtbbWVkaWFRdWVyeVN0cmluZywgb3B0aW9uc09iamVjdF0sW21vcmUuLi5dXVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB3aXRoIGEgdmVyc2lvbiBhbmQgYW4gdXBkYXRlIG1ldGhvZCB0byBtYW51YWxseSByZWRyYXcgdGhlIGNoYXJ0XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFNpbXBsZSBwaWUgY2hhcnQgZXhhbXBsZSB3aXRoIGZvdXIgc2VyaWVzXG4gICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICogICBzZXJpZXM6IFsxMCwgMiwgNCwgM11cbiAgICogfSk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIERyYXdpbmcgYSBkb251dCBjaGFydFxuICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgc2VyaWVzOiBbMTAsIDIsIDQsIDNdXG4gICAqIH0sIHtcbiAgICogICBkb251dDogdHJ1ZVxuICAgKiB9KTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gVXNpbmcgZG9udXQsIHN0YXJ0QW5nbGUgYW5kIHRvdGFsIHRvIGRyYXcgYSBnYXVnZSBjaGFydFxuICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgc2VyaWVzOiBbMjAsIDEwLCAzMCwgNDBdXG4gICAqIH0sIHtcbiAgICogICBkb251dDogdHJ1ZSxcbiAgICogICBkb251dFdpZHRoOiAyMCxcbiAgICogICBzdGFydEFuZ2xlOiAyNzAsXG4gICAqICAgdG90YWw6IDIwMFxuICAgKiB9KTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gRHJhd2luZyBhIHBpZSBjaGFydCB3aXRoIHBhZGRpbmcgYW5kIGxhYmVscyB0aGF0IGFyZSBvdXRzaWRlIHRoZSBwaWVcbiAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIHNlcmllczogWzIwLCAxMCwgMzAsIDQwXVxuICAgKiB9LCB7XG4gICAqICAgY2hhcnRQYWRkaW5nOiAzMCxcbiAgICogICBsYWJlbE9mZnNldDogNTAsXG4gICAqICAgbGFiZWxEaXJlY3Rpb246ICdleHBsb2RlJ1xuICAgKiB9KTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gT3ZlcnJpZGluZyB0aGUgY2xhc3MgbmFtZXMgZm9yIGluZGl2aWR1YWwgc2VyaWVzIGFzIHdlbGwgYXMgYSBuYW1lIGFuZCBtZXRhIGRhdGEuXG4gICAqIC8vIFRoZSBuYW1lIHdpbGwgYmUgd3JpdHRlbiBhcyBjdDpzZXJpZXMtbmFtZSBhdHRyaWJ1dGUgYW5kIHRoZSBtZXRhIGRhdGEgd2lsbCBiZSBzZXJpYWxpemVkIGFuZCB3cml0dGVuXG4gICAqIC8vIHRvIGEgY3Q6bWV0YSBhdHRyaWJ1dGUuXG4gICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICogICBzZXJpZXM6IFt7XG4gICAqICAgICB2YWx1ZTogMjAsXG4gICAqICAgICBuYW1lOiAnU2VyaWVzIDEnLFxuICAgKiAgICAgY2xhc3NOYW1lOiAnbXktY3VzdG9tLWNsYXNzLW9uZScsXG4gICAqICAgICBtZXRhOiAnTWV0YSBPbmUnXG4gICAqICAgfSwge1xuICAgKiAgICAgdmFsdWU6IDEwLFxuICAgKiAgICAgbmFtZTogJ1NlcmllcyAyJyxcbiAgICogICAgIGNsYXNzTmFtZTogJ215LWN1c3RvbS1jbGFzcy10d28nLFxuICAgKiAgICAgbWV0YTogJ01ldGEgVHdvJ1xuICAgKiAgIH0sIHtcbiAgICogICAgIHZhbHVlOiA3MCxcbiAgICogICAgIG5hbWU6ICdTZXJpZXMgMycsXG4gICAqICAgICBjbGFzc05hbWU6ICdteS1jdXN0b20tY2xhc3MtdGhyZWUnLFxuICAgKiAgICAgbWV0YTogJ01ldGEgVGhyZWUnXG4gICAqICAgfV1cbiAgICogfSk7XG4gICAqL1xuICBmdW5jdGlvbiBQaWUocXVlcnksIGRhdGEsIG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgQ2hhcnRpc3QuUGllLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZGF0YSxcbiAgICAgIGRlZmF1bHRPcHRpb25zLFxuICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyksXG4gICAgICByZXNwb25zaXZlT3B0aW9ucyk7XG4gIH1cblxuICAvLyBDcmVhdGluZyBwaWUgY2hhcnQgdHlwZSBpbiBDaGFydGlzdCBuYW1lc3BhY2VcbiAgQ2hhcnRpc3QuUGllID0gQ2hhcnRpc3QuQmFzZS5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBQaWUsXG4gICAgY3JlYXRlQ2hhcnQ6IGNyZWF0ZUNoYXJ0LFxuICAgIGRldGVybWluZUFuY2hvclBvc2l0aW9uOiBkZXRlcm1pbmVBbmNob3JQb3NpdGlvblxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuXG5yZXR1cm4gQ2hhcnRpc3Q7XG5cbn0pKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRpY2t5ID0gcmVxdWlyZSgndGlja3knKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZSAoZm4sIGFyZ3MsIGN0eCkge1xuICBpZiAoIWZuKSB7IHJldHVybjsgfVxuICB0aWNreShmdW5jdGlvbiBydW4gKCkge1xuICAgIGZuLmFwcGx5KGN0eCB8fCBudWxsLCBhcmdzIHx8IFtdKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXRvYSA9IHJlcXVpcmUoJ2F0b2EnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJy4vZGVib3VuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWl0dGVyICh0aGluZywgb3B0aW9ucykge1xuICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBldnQgPSB7fTtcbiAgaWYgKHRoaW5nID09PSB1bmRlZmluZWQpIHsgdGhpbmcgPSB7fTsgfVxuICB0aGluZy5vbiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGlmICghZXZ0W3R5cGVdKSB7XG4gICAgICBldnRbdHlwZV0gPSBbZm5dO1xuICAgIH0gZWxzZSB7XG4gICAgICBldnRbdHlwZV0ucHVzaChmbik7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIGZuLl9vbmNlID0gdHJ1ZTsgLy8gdGhpbmcub2ZmKGZuKSBzdGlsbCB3b3JrcyFcbiAgICB0aGluZy5vbih0eXBlLCBmbik7XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vZmYgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGMgPT09IDEpIHtcbiAgICAgIGRlbGV0ZSBldnRbdHlwZV07XG4gICAgfSBlbHNlIGlmIChjID09PSAwKSB7XG4gICAgICBldnQgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV0ID0gZXZ0W3R5cGVdO1xuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgIGV0LnNwbGljZShldC5pbmRleE9mKGZuKSwgMSk7XG4gICAgfVxuICAgIHJldHVybiB0aGluZztcbiAgfTtcbiAgdGhpbmcuZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGF0b2EoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpbmcuZW1pdHRlclNuYXBzaG90KGFyZ3Muc2hpZnQoKSkuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG4gIHRoaW5nLmVtaXR0ZXJTbmFwc2hvdCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGV0ID0gKGV2dFt0eXBlXSB8fCBbXSkuc2xpY2UoMCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgICAgdmFyIGN0eCA9IHRoaXMgfHwgdGhpbmc7XG4gICAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJyAmJiBvcHRzLnRocm93cyAhPT0gZmFsc2UgJiYgIWV0Lmxlbmd0aCkgeyB0aHJvdyBhcmdzLmxlbmd0aCA9PT0gMSA/IGFyZ3NbMF0gOiBhcmdzOyB9XG4gICAgICBldC5mb3JFYWNoKGZ1bmN0aW9uIGVtaXR0ZXIgKGxpc3Rlbikge1xuICAgICAgICBpZiAob3B0cy5hc3luYykgeyBkZWJvdW5jZShsaXN0ZW4sIGFyZ3MsIGN0eCk7IH0gZWxzZSB7IGxpc3Rlbi5hcHBseShjdHgsIGFyZ3MpOyB9XG4gICAgICAgIGlmIChsaXN0ZW4uX29uY2UpIHsgdGhpbmcub2ZmKHR5cGUsIGxpc3Rlbik7IH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaW5nO1xuICAgIH07XG4gIH07XG4gIHJldHVybiB0aGluZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjdXN0b21FdmVudCA9IHJlcXVpcmUoJ2N1c3RvbS1ldmVudCcpO1xudmFyIGV2ZW50bWFwID0gcmVxdWlyZSgnLi9ldmVudG1hcCcpO1xudmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbnZhciBhZGRFdmVudCA9IGFkZEV2ZW50RWFzeTtcbnZhciByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50RWFzeTtcbnZhciBoYXJkQ2FjaGUgPSBbXTtcblxuaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICBhZGRFdmVudCA9IGFkZEV2ZW50SGFyZDtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50LFxuICBmYWJyaWNhdGU6IGZhYnJpY2F0ZUV2ZW50XG59O1xuXG5mdW5jdGlvbiBhZGRFdmVudEVhc3kgKGVsLCB0eXBlLCBmbiwgY2FwdHVyaW5nKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJpbmcpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZWwuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIHdyYXAoZWwsIHR5cGUsIGZuKSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBsaXN0ZW5lciA9IHVud3JhcChlbCwgdHlwZSwgZm4pO1xuICBpZiAobGlzdGVuZXIpIHtcbiAgICByZXR1cm4gZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmYWJyaWNhdGVFdmVudCAoZWwsIHR5cGUsIG1vZGVsKSB7XG4gIHZhciBlID0gZXZlbnRtYXAuaW5kZXhPZih0eXBlKSA9PT0gLTEgPyBtYWtlQ3VzdG9tRXZlbnQoKSA6IG1ha2VDbGFzc2ljRXZlbnQoKTtcbiAgaWYgKGVsLmRpc3BhdGNoRXZlbnQpIHtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmZpcmVFdmVudCgnb24nICsgdHlwZSwgZSk7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUNsYXNzaWNFdmVudCAoKSB7XG4gICAgdmFyIGU7XG4gICAgaWYgKGRvYy5jcmVhdGVFdmVudCkge1xuICAgICAgZSA9IGRvYy5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGUuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgfVxuICAgIHJldHVybiBlO1xuICB9XG4gIGZ1bmN0aW9uIG1ha2VDdXN0b21FdmVudCAoKSB7XG4gICAgcmV0dXJuIG5ldyBjdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogbW9kZWwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcHBlckZhY3RvcnkgKGVsLCB0eXBlLCBmbikge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlciAob3JpZ2luYWxFdmVudCkge1xuICAgIHZhciBlID0gb3JpZ2luYWxFdmVudCB8fCBnbG9iYWwuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCA9IGUucHJldmVudERlZmF1bHQgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZS53aGljaCA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgIGZuLmNhbGwoZWwsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIHdyYXBwZXIgPSB1bndyYXAoZWwsIHR5cGUsIGZuKSB8fCB3cmFwcGVyRmFjdG9yeShlbCwgdHlwZSwgZm4pO1xuICBoYXJkQ2FjaGUucHVzaCh7XG4gICAgd3JhcHBlcjogd3JhcHBlcixcbiAgICBlbGVtZW50OiBlbCxcbiAgICB0eXBlOiB0eXBlLFxuICAgIGZuOiBmblxuICB9KTtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHVud3JhcCAoZWwsIHR5cGUsIGZuKSB7XG4gIHZhciBpID0gZmluZChlbCwgdHlwZSwgZm4pO1xuICBpZiAoaSkge1xuICAgIHZhciB3cmFwcGVyID0gaGFyZENhY2hlW2ldLndyYXBwZXI7XG4gICAgaGFyZENhY2hlLnNwbGljZShpLCAxKTsgLy8gZnJlZSB1cCBhIHRhZCBvZiBtZW1vcnlcbiAgICByZXR1cm4gd3JhcHBlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGksIGl0ZW07XG4gIGZvciAoaSA9IDA7IGkgPCBoYXJkQ2FjaGUubGVuZ3RoOyBpKyspIHtcbiAgICBpdGVtID0gaGFyZENhY2hlW2ldO1xuICAgIGlmIChpdGVtLmVsZW1lbnQgPT09IGVsICYmIGl0ZW0udHlwZSA9PT0gdHlwZSAmJiBpdGVtLmZuID09PSBmbikge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudG1hcCA9IFtdO1xudmFyIGV2ZW50bmFtZSA9ICcnO1xudmFyIHJvbiA9IC9eb24vO1xuXG5mb3IgKGV2ZW50bmFtZSBpbiBnbG9iYWwpIHtcbiAgaWYgKHJvbi50ZXN0KGV2ZW50bmFtZSkpIHtcbiAgICBldmVudG1hcC5wdXNoKGV2ZW50bmFtZS5zbGljZSgyKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBldmVudG1hcDtcbiIsIlxudmFyIE5hdGl2ZUN1c3RvbUV2ZW50ID0gZ2xvYmFsLkN1c3RvbUV2ZW50O1xuXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xuICB0cnkge1xuICAgIHZhciBwID0gbmV3IE5hdGl2ZUN1c3RvbUV2ZW50KCdjYXQnLCB7IGRldGFpbDogeyBmb286ICdiYXInIH0gfSk7XG4gICAgcmV0dXJuICAnY2F0JyA9PT0gcC50eXBlICYmICdiYXInID09PSBwLmRldGFpbC5mb287XG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ3Jvc3MtYnJvd3NlciBgQ3VzdG9tRXZlbnRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC5DdXN0b21FdmVudFxuICpcbiAqIEBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZU5hdGl2ZSgpID8gTmF0aXZlQ3VzdG9tRXZlbnQgOlxuXG4vLyBJRSA+PSA5XG4nZnVuY3Rpb24nID09PSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPyBmdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICB9IGVsc2Uge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgdm9pZCAwKTtcbiAgfVxuICByZXR1cm4gZTtcbn0gOlxuXG4vLyBJRSA8PSA4XG5mdW5jdGlvbiBDdXN0b21FdmVudCAodHlwZSwgcGFyYW1zKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgZS50eXBlID0gdHlwZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuYnViYmxlcyA9IEJvb2xlYW4ocGFyYW1zLmJ1YmJsZXMpO1xuICAgIGUuY2FuY2VsYWJsZSA9IEJvb2xlYW4ocGFyYW1zLmNhbmNlbGFibGUpO1xuICAgIGUuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgfSBlbHNlIHtcbiAgICBlLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICBlLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgICBlLmRldGFpbCA9IHZvaWQgMDtcbiAgfVxuICByZXR1cm4gZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNhY2hlID0ge307XG52YXIgc3RhcnQgPSAnKD86XnxcXFxccyknO1xudmFyIGVuZCA9ICcoPzpcXFxcc3wkKSc7XG5cbmZ1bmN0aW9uIGxvb2t1cENsYXNzIChjbGFzc05hbWUpIHtcbiAgdmFyIGNhY2hlZCA9IGNhY2hlW2NsYXNzTmFtZV07XG4gIGlmIChjYWNoZWQpIHtcbiAgICBjYWNoZWQubGFzdEluZGV4ID0gMDtcbiAgfSBlbHNlIHtcbiAgICBjYWNoZVtjbGFzc05hbWVdID0gY2FjaGVkID0gbmV3IFJlZ0V4cChzdGFydCArIGNsYXNzTmFtZSArIGVuZCwgJ2cnKTtcbiAgfVxuICByZXR1cm4gY2FjaGVkO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzcyAoZWwsIGNsYXNzTmFtZSkge1xuICB2YXIgY3VycmVudCA9IGVsLmNsYXNzTmFtZTtcbiAgaWYgKCFjdXJyZW50Lmxlbmd0aCkge1xuICAgIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgfSBlbHNlIGlmICghbG9va3VwQ2xhc3MoY2xhc3NOYW1lKS50ZXN0KGN1cnJlbnQpKSB7XG4gICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBybUNsYXNzIChlbCwgY2xhc3NOYW1lKSB7XG4gIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKGxvb2t1cENsYXNzKGNsYXNzTmFtZSksICcgJykudHJpbSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRDbGFzcyxcbiAgcm06IHJtQ2xhc3Ncbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbWl0dGVyID0gcmVxdWlyZSgnY29udHJhL2VtaXR0ZXInKTtcbnZhciBjcm9zc3ZlbnQgPSByZXF1aXJlKCdjcm9zc3ZlbnQnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnLi9jbGFzc2VzJyk7XG52YXIgZG9jID0gZG9jdW1lbnQ7XG52YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jLmRvY3VtZW50RWxlbWVudDtcblxuZnVuY3Rpb24gZHJhZ3VsYSAoaW5pdGlhbENvbnRhaW5lcnMsIG9wdGlvbnMpIHtcbiAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIGlmIChsZW4gPT09IDEgJiYgQXJyYXkuaXNBcnJheShpbml0aWFsQ29udGFpbmVycykgPT09IGZhbHNlKSB7XG4gICAgb3B0aW9ucyA9IGluaXRpYWxDb250YWluZXJzO1xuICAgIGluaXRpYWxDb250YWluZXJzID0gW107XG4gIH1cbiAgdmFyIF9taXJyb3I7IC8vIG1pcnJvciBpbWFnZVxuICB2YXIgX3NvdXJjZTsgLy8gc291cmNlIGNvbnRhaW5lclxuICB2YXIgX2l0ZW07IC8vIGl0ZW0gYmVpbmcgZHJhZ2dlZFxuICB2YXIgX29mZnNldFg7IC8vIHJlZmVyZW5jZSB4XG4gIHZhciBfb2Zmc2V0WTsgLy8gcmVmZXJlbmNlIHlcbiAgdmFyIF9tb3ZlWDsgLy8gcmVmZXJlbmNlIG1vdmUgeFxuICB2YXIgX21vdmVZOyAvLyByZWZlcmVuY2UgbW92ZSB5XG4gIHZhciBfaW5pdGlhbFNpYmxpbmc7IC8vIHJlZmVyZW5jZSBzaWJsaW5nIHdoZW4gZ3JhYmJlZFxuICB2YXIgX2N1cnJlbnRTaWJsaW5nOyAvLyByZWZlcmVuY2Ugc2libGluZyBub3dcbiAgdmFyIF9jb3B5OyAvLyBpdGVtIHVzZWQgZm9yIGNvcHlpbmdcbiAgdmFyIF9yZW5kZXJUaW1lcjsgLy8gdGltZXIgZm9yIHNldFRpbWVvdXQgcmVuZGVyTWlycm9ySW1hZ2VcbiAgdmFyIF9sYXN0RHJvcFRhcmdldCA9IG51bGw7IC8vIGxhc3QgY29udGFpbmVyIGl0ZW0gd2FzIG92ZXJcbiAgdmFyIF9ncmFiYmVkOyAvLyBob2xkcyBtb3VzZWRvd24gY29udGV4dCB1bnRpbCBmaXJzdCBtb3VzZW1vdmVcblxuICB2YXIgbyA9IG9wdGlvbnMgfHwge307XG4gIGlmIChvLm1vdmVzID09PSB2b2lkIDApIHsgby5tb3ZlcyA9IGFsd2F5czsgfVxuICBpZiAoby5hY2NlcHRzID09PSB2b2lkIDApIHsgby5hY2NlcHRzID0gYWx3YXlzOyB9XG4gIGlmIChvLmludmFsaWQgPT09IHZvaWQgMCkgeyBvLmludmFsaWQgPSBpbnZhbGlkVGFyZ2V0OyB9XG4gIGlmIChvLmNvbnRhaW5lcnMgPT09IHZvaWQgMCkgeyBvLmNvbnRhaW5lcnMgPSBpbml0aWFsQ29udGFpbmVycyB8fCBbXTsgfVxuICBpZiAoby5pc0NvbnRhaW5lciA9PT0gdm9pZCAwKSB7IG8uaXNDb250YWluZXIgPSBuZXZlcjsgfVxuICBpZiAoby5jb3B5ID09PSB2b2lkIDApIHsgby5jb3B5ID0gZmFsc2U7IH1cbiAgaWYgKG8uY29weVNvcnRTb3VyY2UgPT09IHZvaWQgMCkgeyBvLmNvcHlTb3J0U291cmNlID0gZmFsc2U7IH1cbiAgaWYgKG8ucmV2ZXJ0T25TcGlsbCA9PT0gdm9pZCAwKSB7IG8ucmV2ZXJ0T25TcGlsbCA9IGZhbHNlOyB9XG4gIGlmIChvLnJlbW92ZU9uU3BpbGwgPT09IHZvaWQgMCkgeyBvLnJlbW92ZU9uU3BpbGwgPSBmYWxzZTsgfVxuICBpZiAoby5kaXJlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmRpcmVjdGlvbiA9ICd2ZXJ0aWNhbCc7IH1cbiAgaWYgKG8uaWdub3JlSW5wdXRUZXh0U2VsZWN0aW9uID09PSB2b2lkIDApIHsgby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPSB0cnVlOyB9XG4gIGlmIChvLm1pcnJvckNvbnRhaW5lciA9PT0gdm9pZCAwKSB7IG8ubWlycm9yQ29udGFpbmVyID0gZG9jLmJvZHk7IH1cblxuICB2YXIgZHJha2UgPSBlbWl0dGVyKHtcbiAgICBjb250YWluZXJzOiBvLmNvbnRhaW5lcnMsXG4gICAgc3RhcnQ6IG1hbnVhbFN0YXJ0LFxuICAgIGVuZDogZW5kLFxuICAgIGNhbmNlbDogY2FuY2VsLFxuICAgIHJlbW92ZTogcmVtb3ZlLFxuICAgIGRlc3Ryb3k6IGRlc3Ryb3ksXG4gICAgZHJhZ2dpbmc6IGZhbHNlXG4gIH0pO1xuXG4gIGlmIChvLnJlbW92ZU9uU3BpbGwgPT09IHRydWUpIHtcbiAgICBkcmFrZS5vbignb3ZlcicsIHNwaWxsT3Zlcikub24oJ291dCcsIHNwaWxsT3V0KTtcbiAgfVxuXG4gIGV2ZW50cygpO1xuXG4gIHJldHVybiBkcmFrZTtcblxuICBmdW5jdGlvbiBpc0NvbnRhaW5lciAoZWwpIHtcbiAgICByZXR1cm4gZHJha2UuY29udGFpbmVycy5pbmRleE9mKGVsKSAhPT0gLTEgfHwgby5pc0NvbnRhaW5lcihlbCk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHMgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZWRvd24nLCBncmFiKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNldXAnLCByZWxlYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50dWFsTW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vtb3ZlJywgc3RhcnRCZWNhdXNlTW91c2VNb3ZlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlbWVudHMgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgY3Jvc3N2ZW50W29wXShkb2N1bWVudEVsZW1lbnQsICdzZWxlY3RzdGFydCcsIHByZXZlbnRHcmFiYmVkKTsgLy8gSUU4XG4gICAgY3Jvc3N2ZW50W29wXShkb2N1bWVudEVsZW1lbnQsICdjbGljaycsIHByZXZlbnRHcmFiYmVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICAgIGV2ZW50cyh0cnVlKTtcbiAgICByZWxlYXNlKHt9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZlbnRHcmFiYmVkIChlKSB7XG4gICAgaWYgKF9ncmFiYmVkKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ3JhYiAoZSkge1xuICAgIF9tb3ZlWCA9IGUuY2xpZW50WDtcbiAgICBfbW92ZVkgPSBlLmNsaWVudFk7XG5cbiAgICB2YXIgaWdub3JlID0gd2hpY2hNb3VzZUJ1dHRvbihlKSAhPT0gMSB8fCBlLm1ldGFLZXkgfHwgZS5jdHJsS2V5O1xuICAgIGlmIChpZ25vcmUpIHtcbiAgICAgIHJldHVybjsgLy8gd2Ugb25seSBjYXJlIGFib3V0IGhvbmVzdC10by1nb2QgbGVmdCBjbGlja3MgYW5kIHRvdWNoIGV2ZW50c1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IGUudGFyZ2V0O1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIF9ncmFiYmVkID0gY29udGV4dDtcbiAgICBldmVudHVhbE1vdmVtZW50cygpO1xuICAgIGlmIChlLnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICBpZiAoaXNJbnB1dChpdGVtKSkgeyAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzIwOFxuICAgICAgICBpdGVtLmZvY3VzKCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNzZcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzE1NVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQgKGUpIHtcbiAgICBpZiAoIV9ncmFiYmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh3aGljaE1vdXNlQnV0dG9uKGUpID09PSAwKSB7XG4gICAgICByZWxlYXNlKHt9KTtcbiAgICAgIHJldHVybjsgLy8gd2hlbiB0ZXh0IGlzIHNlbGVjdGVkIG9uIGFuIGlucHV0IGFuZCB0aGVuIGRyYWdnZWQsIG1vdXNldXAgZG9lc24ndCBmaXJlLiB0aGlzIGlzIG91ciBvbmx5IGhvcGVcbiAgICB9XG4gICAgLy8gdHJ1dGh5IGNoZWNrIGZpeGVzICMyMzksIGVxdWFsaXR5IGZpeGVzICMyMDdcbiAgICBpZiAoZS5jbGllbnRYICE9PSB2b2lkIDAgJiYgZS5jbGllbnRYID09PSBfbW92ZVggJiYgZS5jbGllbnRZICE9PSB2b2lkIDAgJiYgZS5jbGllbnRZID09PSBfbW92ZVkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG8uaWdub3JlSW5wdXRUZXh0U2VsZWN0aW9uKSB7XG4gICAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSk7XG4gICAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSk7XG4gICAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGRvYy5lbGVtZW50RnJvbVBvaW50KGNsaWVudFgsIGNsaWVudFkpO1xuICAgICAgaWYgKGlzSW5wdXQoZWxlbWVudEJlaGluZEN1cnNvcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBncmFiYmVkID0gX2dyYWJiZWQ7IC8vIGNhbGwgdG8gZW5kKCkgdW5zZXRzIF9ncmFiYmVkXG4gICAgZXZlbnR1YWxNb3ZlbWVudHModHJ1ZSk7XG4gICAgbW92ZW1lbnRzKCk7XG4gICAgZW5kKCk7XG4gICAgc3RhcnQoZ3JhYmJlZCk7XG5cbiAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0KF9pdGVtKTtcbiAgICBfb2Zmc2V0WCA9IGdldENvb3JkKCdwYWdlWCcsIGUpIC0gb2Zmc2V0LmxlZnQ7XG4gICAgX29mZnNldFkgPSBnZXRDb29yZCgncGFnZVknLCBlKSAtIG9mZnNldC50b3A7XG5cbiAgICBjbGFzc2VzLmFkZChfY29weSB8fCBfaXRlbSwgJ2d1LXRyYW5zaXQnKTtcbiAgICByZW5kZXJNaXJyb3JJbWFnZSgpO1xuICAgIGRyYWcoZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5TdGFydCAoaXRlbSkge1xuICAgIGlmIChkcmFrZS5kcmFnZ2luZyAmJiBfbWlycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc0NvbnRhaW5lcihpdGVtKSkge1xuICAgICAgcmV0dXJuOyAvLyBkb24ndCBkcmFnIGNvbnRhaW5lciBpdHNlbGZcbiAgICB9XG4gICAgdmFyIGhhbmRsZSA9IGl0ZW07XG4gICAgd2hpbGUgKGdldFBhcmVudChpdGVtKSAmJiBpc0NvbnRhaW5lcihnZXRQYXJlbnQoaXRlbSkpID09PSBmYWxzZSkge1xuICAgICAgaWYgKG8uaW52YWxpZChpdGVtLCBoYW5kbGUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGl0ZW0gPSBnZXRQYXJlbnQoaXRlbSk7IC8vIGRyYWcgdGFyZ2V0IHNob3VsZCBiZSBhIHRvcCBlbGVtZW50XG4gICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc291cmNlID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtb3ZhYmxlID0gby5tb3ZlcyhpdGVtLCBzb3VyY2UsIGhhbmRsZSwgbmV4dEVsKGl0ZW0pKTtcbiAgICBpZiAoIW1vdmFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXRlbTogaXRlbSxcbiAgICAgIHNvdXJjZTogc291cmNlXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hbnVhbFN0YXJ0IChpdGVtKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYW5TdGFydChpdGVtKTtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgc3RhcnQoY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQgKGNvbnRleHQpIHtcbiAgICBpZiAoaXNDb3B5KGNvbnRleHQuaXRlbSwgY29udGV4dC5zb3VyY2UpKSB7XG4gICAgICBfY29weSA9IGNvbnRleHQuaXRlbS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICBkcmFrZS5lbWl0KCdjbG9uZWQnLCBfY29weSwgY29udGV4dC5pdGVtLCAnY29weScpO1xuICAgIH1cblxuICAgIF9zb3VyY2UgPSBjb250ZXh0LnNvdXJjZTtcbiAgICBfaXRlbSA9IGNvbnRleHQuaXRlbTtcbiAgICBfaW5pdGlhbFNpYmxpbmcgPSBfY3VycmVudFNpYmxpbmcgPSBuZXh0RWwoY29udGV4dC5pdGVtKTtcblxuICAgIGRyYWtlLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBkcmFrZS5lbWl0KCdkcmFnJywgX2l0ZW0sIF9zb3VyY2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52YWxpZFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5kICgpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgZHJvcChpdGVtLCBnZXRQYXJlbnQoaXRlbSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5ncmFiICgpIHtcbiAgICBfZ3JhYmJlZCA9IGZhbHNlO1xuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xuICAgIG1vdmVtZW50cyh0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbGVhc2UgKGUpIHtcbiAgICB1bmdyYWIoKTtcblxuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSk7XG4gICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZ2V0RWxlbWVudEJlaGluZFBvaW50KF9taXJyb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBkcm9wVGFyZ2V0ID0gZmluZERyb3BUYXJnZXQoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgaWYgKGRyb3BUYXJnZXQgJiYgKChfY29weSAmJiBvLmNvcHlTb3J0U291cmNlKSB8fCAoIV9jb3B5IHx8IGRyb3BUYXJnZXQgIT09IF9zb3VyY2UpKSkge1xuICAgICAgZHJvcChpdGVtLCBkcm9wVGFyZ2V0KTtcbiAgICB9IGVsc2UgaWYgKG8ucmVtb3ZlT25TcGlsbCkge1xuICAgICAgcmVtb3ZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyb3AgKGl0ZW0sIHRhcmdldCkge1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKF9jb3B5ICYmIG8uY29weVNvcnRTb3VyY2UgJiYgdGFyZ2V0ID09PSBfc291cmNlKSB7XG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2l0ZW0pO1xuICAgIH1cbiAgICBpZiAoaXNJbml0aWFsUGxhY2VtZW50KHRhcmdldCkpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFrZS5lbWl0KCdkcm9wJywgaXRlbSwgdGFyZ2V0LCBfc291cmNlLCBfY3VycmVudFNpYmxpbmcpO1xuICAgIH1cbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUgKCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICB9XG4gICAgZHJha2UuZW1pdChfY29weSA/ICdjYW5jZWwnIDogJ3JlbW92ZScsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSk7XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsIChyZXZlcnQpIHtcbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXZlcnRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgPyByZXZlcnQgOiBvLnJldmVydE9uU3BpbGw7XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChwYXJlbnQgPT09IF9zb3VyY2UgJiYgX2NvcHkpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfY29weSk7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXNJbml0aWFsUGxhY2VtZW50KHBhcmVudCk7XG4gICAgaWYgKGluaXRpYWwgPT09IGZhbHNlICYmICFfY29weSAmJiByZXZlcnRzKSB7XG4gICAgICBfc291cmNlLmluc2VydEJlZm9yZShpdGVtLCBfaW5pdGlhbFNpYmxpbmcpO1xuICAgIH1cbiAgICBpZiAoaW5pdGlhbCB8fCByZXZlcnRzKSB7XG4gICAgICBkcmFrZS5lbWl0KCdjYW5jZWwnLCBpdGVtLCBfc291cmNlLCBfc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcbiAgICB9XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW51cCAoKSB7XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB1bmdyYWIoKTtcbiAgICByZW1vdmVNaXJyb3JJbWFnZSgpO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBjbGFzc2VzLnJtKGl0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgfVxuICAgIGlmIChfcmVuZGVyVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChfcmVuZGVyVGltZXIpO1xuICAgIH1cbiAgICBkcmFrZS5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIGlmIChfbGFzdERyb3BUYXJnZXQpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ291dCcsIGl0ZW0sIF9sYXN0RHJvcFRhcmdldCwgX3NvdXJjZSk7XG4gICAgfVxuICAgIGRyYWtlLmVtaXQoJ2RyYWdlbmQnLCBpdGVtKTtcbiAgICBfc291cmNlID0gX2l0ZW0gPSBfY29weSA9IF9pbml0aWFsU2libGluZyA9IF9jdXJyZW50U2libGluZyA9IF9yZW5kZXJUaW1lciA9IF9sYXN0RHJvcFRhcmdldCA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBpc0luaXRpYWxQbGFjZW1lbnQgKHRhcmdldCwgcykge1xuICAgIHZhciBzaWJsaW5nO1xuICAgIGlmIChzICE9PSB2b2lkIDApIHtcbiAgICAgIHNpYmxpbmcgPSBzO1xuICAgIH0gZWxzZSBpZiAoX21pcnJvcikge1xuICAgICAgc2libGluZyA9IF9jdXJyZW50U2libGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgc2libGluZyA9IG5leHRFbChfY29weSB8fCBfaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQgPT09IF9zb3VyY2UgJiYgc2libGluZyA9PT0gX2luaXRpYWxTaWJsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZERyb3BUYXJnZXQgKGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZWxlbWVudEJlaGluZEN1cnNvcjtcbiAgICB3aGlsZSAodGFyZ2V0ICYmICFhY2NlcHRlZCgpKSB7XG4gICAgICB0YXJnZXQgPSBnZXRQYXJlbnQodGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcblxuICAgIGZ1bmN0aW9uIGFjY2VwdGVkICgpIHtcbiAgICAgIHZhciBkcm9wcGFibGUgPSBpc0NvbnRhaW5lcih0YXJnZXQpO1xuICAgICAgaWYgKGRyb3BwYWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQodGFyZ2V0LCBlbGVtZW50QmVoaW5kQ3Vyc29yKTtcbiAgICAgIHZhciByZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2UodGFyZ2V0LCBpbW1lZGlhdGUsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgICAgdmFyIGluaXRpYWwgPSBpc0luaXRpYWxQbGFjZW1lbnQodGFyZ2V0LCByZWZlcmVuY2UpO1xuICAgICAgaWYgKGluaXRpYWwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIHNob3VsZCBhbHdheXMgYmUgYWJsZSB0byBkcm9wIGl0IHJpZ2h0IGJhY2sgd2hlcmUgaXQgd2FzXG4gICAgICB9XG4gICAgICByZXR1cm4gby5hY2NlcHRzKF9pdGVtLCB0YXJnZXQsIF9zb3VyY2UsIHJlZmVyZW5jZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJhZyAoZSkge1xuICAgIGlmICghX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSk7XG4gICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpO1xuICAgIHZhciB4ID0gY2xpZW50WCAtIF9vZmZzZXRYO1xuICAgIHZhciB5ID0gY2xpZW50WSAtIF9vZmZzZXRZO1xuXG4gICAgX21pcnJvci5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgX21pcnJvci5zdHlsZS50b3AgPSB5ICsgJ3B4JztcblxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBnZXRFbGVtZW50QmVoaW5kUG9pbnQoX21pcnJvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBmaW5kRHJvcFRhcmdldChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgY2hhbmdlZCA9IGRyb3BUYXJnZXQgIT09IG51bGwgJiYgZHJvcFRhcmdldCAhPT0gX2xhc3REcm9wVGFyZ2V0O1xuICAgIGlmIChjaGFuZ2VkIHx8IGRyb3BUYXJnZXQgPT09IG51bGwpIHtcbiAgICAgIG91dCgpO1xuICAgICAgX2xhc3REcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcbiAgICAgIG92ZXIoKTtcbiAgICB9XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoZHJvcFRhcmdldCA9PT0gX3NvdXJjZSAmJiBfY29weSAmJiAhby5jb3B5U29ydFNvdXJjZSkge1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZWZlcmVuY2U7XG4gICAgdmFyIGltbWVkaWF0ZSA9IGdldEltbWVkaWF0ZUNoaWxkKGRyb3BUYXJnZXQsIGVsZW1lbnRCZWhpbmRDdXJzb3IpO1xuICAgIGlmIChpbW1lZGlhdGUgIT09IG51bGwpIHtcbiAgICAgIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZShkcm9wVGFyZ2V0LCBpbW1lZGlhdGUsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIH0gZWxzZSBpZiAoby5yZXZlcnRPblNwaWxsID09PSB0cnVlICYmICFfY29weSkge1xuICAgICAgcmVmZXJlbmNlID0gX2luaXRpYWxTaWJsaW5nO1xuICAgICAgZHJvcFRhcmdldCA9IF9zb3VyY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChfY29weSAmJiBwYXJlbnQpIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICByZWZlcmVuY2UgPT09IG51bGwgfHxcbiAgICAgIHJlZmVyZW5jZSAhPT0gaXRlbSAmJlxuICAgICAgcmVmZXJlbmNlICE9PSBuZXh0RWwoaXRlbSkgJiZcbiAgICAgIHJlZmVyZW5jZSAhPT0gX2N1cnJlbnRTaWJsaW5nXG4gICAgKSB7XG4gICAgICBfY3VycmVudFNpYmxpbmcgPSByZWZlcmVuY2U7XG4gICAgICBkcm9wVGFyZ2V0Lmluc2VydEJlZm9yZShpdGVtLCByZWZlcmVuY2UpO1xuICAgICAgZHJha2UuZW1pdCgnc2hhZG93JywgaXRlbSwgZHJvcFRhcmdldCwgX3NvdXJjZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vdmVkICh0eXBlKSB7IGRyYWtlLmVtaXQodHlwZSwgaXRlbSwgX2xhc3REcm9wVGFyZ2V0LCBfc291cmNlKTsgfVxuICAgIGZ1bmN0aW9uIG92ZXIgKCkgeyBpZiAoY2hhbmdlZCkgeyBtb3ZlZCgnb3ZlcicpOyB9IH1cbiAgICBmdW5jdGlvbiBvdXQgKCkgeyBpZiAoX2xhc3REcm9wVGFyZ2V0KSB7IG1vdmVkKCdvdXQnKTsgfSB9XG4gIH1cblxuICBmdW5jdGlvbiBzcGlsbE92ZXIgKGVsKSB7XG4gICAgY2xhc3Nlcy5ybShlbCwgJ2d1LWhpZGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwaWxsT3V0IChlbCkge1xuICAgIGlmIChkcmFrZS5kcmFnZ2luZykgeyBjbGFzc2VzLmFkZChlbCwgJ2d1LWhpZGUnKTsgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyTWlycm9ySW1hZ2UgKCkge1xuICAgIGlmIChfbWlycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZWN0ID0gX2l0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgX21pcnJvciA9IF9pdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICBfbWlycm9yLnN0eWxlLndpZHRoID0gZ2V0UmVjdFdpZHRoKHJlY3QpICsgJ3B4JztcbiAgICBfbWlycm9yLnN0eWxlLmhlaWdodCA9IGdldFJlY3RIZWlnaHQocmVjdCkgKyAncHgnO1xuICAgIGNsYXNzZXMucm0oX21pcnJvciwgJ2d1LXRyYW5zaXQnKTtcbiAgICBjbGFzc2VzLmFkZChfbWlycm9yLCAnZ3UtbWlycm9yJyk7XG4gICAgby5taXJyb3JDb250YWluZXIuYXBwZW5kQ2hpbGQoX21pcnJvcik7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgJ2FkZCcsICdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICBjbGFzc2VzLmFkZChvLm1pcnJvckNvbnRhaW5lciwgJ2d1LXVuc2VsZWN0YWJsZScpO1xuICAgIGRyYWtlLmVtaXQoJ2Nsb25lZCcsIF9taXJyb3IsIF9pdGVtLCAnbWlycm9yJyk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVNaXJyb3JJbWFnZSAoKSB7XG4gICAgaWYgKF9taXJyb3IpIHtcbiAgICAgIGNsYXNzZXMucm0oby5taXJyb3JDb250YWluZXIsICdndS11bnNlbGVjdGFibGUnKTtcbiAgICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsICdyZW1vdmUnLCAnbW91c2Vtb3ZlJywgZHJhZyk7XG4gICAgICBnZXRQYXJlbnQoX21pcnJvcikucmVtb3ZlQ2hpbGQoX21pcnJvcik7XG4gICAgICBfbWlycm9yID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJbW1lZGlhdGVDaGlsZCAoZHJvcFRhcmdldCwgdGFyZ2V0KSB7XG4gICAgdmFyIGltbWVkaWF0ZSA9IHRhcmdldDtcbiAgICB3aGlsZSAoaW1tZWRpYXRlICE9PSBkcm9wVGFyZ2V0ICYmIGdldFBhcmVudChpbW1lZGlhdGUpICE9PSBkcm9wVGFyZ2V0KSB7XG4gICAgICBpbW1lZGlhdGUgPSBnZXRQYXJlbnQoaW1tZWRpYXRlKTtcbiAgICB9XG4gICAgaWYgKGltbWVkaWF0ZSA9PT0gZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGltbWVkaWF0ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlZmVyZW5jZSAoZHJvcFRhcmdldCwgdGFyZ2V0LCB4LCB5KSB7XG4gICAgdmFyIGhvcml6b250YWwgPSBvLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgIHZhciByZWZlcmVuY2UgPSB0YXJnZXQgIT09IGRyb3BUYXJnZXQgPyBpbnNpZGUoKSA6IG91dHNpZGUoKTtcbiAgICByZXR1cm4gcmVmZXJlbmNlO1xuXG4gICAgZnVuY3Rpb24gb3V0c2lkZSAoKSB7IC8vIHNsb3dlciwgYnV0IGFibGUgdG8gZmlndXJlIG91dCBhbnkgcG9zaXRpb25cbiAgICAgIHZhciBsZW4gPSBkcm9wVGFyZ2V0LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGVsO1xuICAgICAgdmFyIHJlY3Q7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZWwgPSBkcm9wVGFyZ2V0LmNoaWxkcmVuW2ldO1xuICAgICAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGlmIChob3Jpem9udGFsICYmIHJlY3QubGVmdCA+IHgpIHsgcmV0dXJuIGVsOyB9XG4gICAgICAgIGlmICghaG9yaXpvbnRhbCAmJiByZWN0LnRvcCA+IHkpIHsgcmV0dXJuIGVsOyB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnNpZGUgKCkgeyAvLyBmYXN0ZXIsIGJ1dCBvbmx5IGF2YWlsYWJsZSBpZiBkcm9wcGVkIGluc2lkZSBhIGNoaWxkIGVsZW1lbnRcbiAgICAgIHZhciByZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoeCA+IHJlY3QubGVmdCArIGdldFJlY3RXaWR0aChyZWN0KSAvIDIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoeSA+IHJlY3QudG9wICsgZ2V0UmVjdEhlaWdodChyZWN0KSAvIDIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmUgKGFmdGVyKSB7XG4gICAgICByZXR1cm4gYWZ0ZXIgPyBuZXh0RWwodGFyZ2V0KSA6IHRhcmdldDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0NvcHkgKGl0ZW0sIGNvbnRhaW5lcikge1xuICAgIHJldHVybiB0eXBlb2Ygby5jb3B5ID09PSAnYm9vbGVhbicgPyBvLmNvcHkgOiBvLmNvcHkoaXRlbSwgY29udGFpbmVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b3VjaHkgKGVsLCBvcCwgdHlwZSwgZm4pIHtcbiAgdmFyIHRvdWNoID0ge1xuICAgIG1vdXNldXA6ICd0b3VjaGVuZCcsXG4gICAgbW91c2Vkb3duOiAndG91Y2hzdGFydCcsXG4gICAgbW91c2Vtb3ZlOiAndG91Y2htb3ZlJ1xuICB9O1xuICB2YXIgcG9pbnRlcnMgPSB7XG4gICAgbW91c2V1cDogJ3BvaW50ZXJ1cCcsXG4gICAgbW91c2Vkb3duOiAncG9pbnRlcmRvd24nLFxuICAgIG1vdXNlbW92ZTogJ3BvaW50ZXJtb3ZlJ1xuICB9O1xuICB2YXIgbWljcm9zb2Z0ID0ge1xuICAgIG1vdXNldXA6ICdNU1BvaW50ZXJVcCcsXG4gICAgbW91c2Vkb3duOiAnTVNQb2ludGVyRG93bicsXG4gICAgbW91c2Vtb3ZlOiAnTVNQb2ludGVyTW92ZSdcbiAgfTtcbiAgaWYgKGdsb2JhbC5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQpIHtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCBwb2ludGVyc1t0eXBlXSwgZm4pO1xuICB9IGVsc2UgaWYgKGdsb2JhbC5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIG1pY3Jvc29mdFt0eXBlXSwgZm4pO1xuICB9IGVsc2Uge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHRvdWNoW3R5cGVdLCBmbik7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgdHlwZSwgZm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdoaWNoTW91c2VCdXR0b24gKGUpIHtcbiAgaWYgKGUudG91Y2hlcyAhPT0gdm9pZCAwKSB7IHJldHVybiBlLnRvdWNoZXMubGVuZ3RoOyB9XG4gIGlmIChlLmJ1dHRvbnMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS5idXR0b25zOyB9XG4gIGlmIChlLndoaWNoICE9PSB2b2lkIDApIHsgcmV0dXJuIGUud2hpY2g7IH1cbiAgdmFyIGJ1dHRvbiA9IGUuYnV0dG9uO1xuICBpZiAoYnV0dG9uICE9PSB2b2lkIDApIHsgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvOTllOGZmMWJhYTdhZTM0MWU5NGJiODljM2U4NDU3MGM3YzNhZDllYS9zcmMvZXZlbnQuanMjTDU3My1MNTc1XG4gICAgcmV0dXJuIGJ1dHRvbiAmIDEgPyAxIDogYnV0dG9uICYgMiA/IDMgOiAoYnV0dG9uICYgNCA/IDIgOiAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXQgKGVsKSB7XG4gIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgbGVmdDogcmVjdC5sZWZ0ICsgZ2V0U2Nyb2xsKCdzY3JvbGxMZWZ0JywgJ3BhZ2VYT2Zmc2V0JyksXG4gICAgdG9wOiByZWN0LnRvcCArIGdldFNjcm9sbCgnc2Nyb2xsVG9wJywgJ3BhZ2VZT2Zmc2V0JylcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsIChzY3JvbGxQcm9wLCBvZmZzZXRQcm9wKSB7XG4gIGlmICh0eXBlb2YgZ2xvYmFsW29mZnNldFByb3BdICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWxbb2Zmc2V0UHJvcF07XG4gIH1cbiAgaWYgKGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRFbGVtZW50W3Njcm9sbFByb3BdO1xuICB9XG4gIHJldHVybiBkb2MuYm9keVtzY3JvbGxQcm9wXTtcbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudEJlaGluZFBvaW50IChwb2ludCwgeCwgeSkge1xuICB2YXIgcCA9IHBvaW50IHx8IHt9O1xuICB2YXIgc3RhdGUgPSBwLmNsYXNzTmFtZTtcbiAgdmFyIGVsO1xuICBwLmNsYXNzTmFtZSArPSAnIGd1LWhpZGUnO1xuICBlbCA9IGRvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICBwLmNsYXNzTmFtZSA9IHN0YXRlO1xuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIG5ldmVyICgpIHsgcmV0dXJuIGZhbHNlOyB9XG5mdW5jdGlvbiBhbHdheXMgKCkgeyByZXR1cm4gdHJ1ZTsgfVxuZnVuY3Rpb24gZ2V0UmVjdFdpZHRoIChyZWN0KSB7IHJldHVybiByZWN0LndpZHRoIHx8IChyZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0KTsgfVxuZnVuY3Rpb24gZ2V0UmVjdEhlaWdodCAocmVjdCkgeyByZXR1cm4gcmVjdC5oZWlnaHQgfHwgKHJlY3QuYm90dG9tIC0gcmVjdC50b3ApOyB9XG5mdW5jdGlvbiBnZXRQYXJlbnQgKGVsKSB7IHJldHVybiBlbC5wYXJlbnROb2RlID09PSBkb2MgPyBudWxsIDogZWwucGFyZW50Tm9kZTsgfVxuZnVuY3Rpb24gaXNJbnB1dCAoZWwpIHsgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdJTlBVVCcgfHwgZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyB8fCBlbC50YWdOYW1lID09PSAnU0VMRUNUJyB8fCBpc0VkaXRhYmxlKGVsKTsgfVxuZnVuY3Rpb24gaXNFZGl0YWJsZSAoZWwpIHtcbiAgaWYgKCFlbCkgeyByZXR1cm4gZmFsc2U7IH0gLy8gbm8gcGFyZW50cyB3ZXJlIGVkaXRhYmxlXG4gIGlmIChlbC5jb250ZW50RWRpdGFibGUgPT09ICdmYWxzZScpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIHN0b3AgdGhlIGxvb2t1cFxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAndHJ1ZScpIHsgcmV0dXJuIHRydWU7IH0gLy8gZm91bmQgYSBjb250ZW50RWRpdGFibGUgZWxlbWVudCBpbiB0aGUgY2hhaW5cbiAgcmV0dXJuIGlzRWRpdGFibGUoZ2V0UGFyZW50KGVsKSk7IC8vIGNvbnRlbnRFZGl0YWJsZSBpcyBzZXQgdG8gJ2luaGVyaXQnXG59XG5cbmZ1bmN0aW9uIG5leHRFbCAoZWwpIHtcbiAgcmV0dXJuIGVsLm5leHRFbGVtZW50U2libGluZyB8fCBtYW51YWxseSgpO1xuICBmdW5jdGlvbiBtYW51YWxseSAoKSB7XG4gICAgdmFyIHNpYmxpbmcgPSBlbDtcbiAgICBkbyB7XG4gICAgICBzaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZztcbiAgICB9IHdoaWxlIChzaWJsaW5nICYmIHNpYmxpbmcubm9kZVR5cGUgIT09IDEpO1xuICAgIHJldHVybiBzaWJsaW5nO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEV2ZW50SG9zdCAoZSkge1xuICAvLyBvbiB0b3VjaGVuZCBldmVudCwgd2UgaGF2ZSB0byB1c2UgYGUuY2hhbmdlZFRvdWNoZXNgXG4gIC8vIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzcxOTI1NjMvdG91Y2hlbmQtZXZlbnQtcHJvcGVydGllc1xuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzM0XG4gIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgIHJldHVybiBlLnRhcmdldFRvdWNoZXNbMF07XG4gIH1cbiAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgfVxuICByZXR1cm4gZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29vcmQgKGNvb3JkLCBlKSB7XG4gIHZhciBob3N0ID0gZ2V0RXZlbnRIb3N0KGUpO1xuICB2YXIgbWlzc01hcCA9IHtcbiAgICBwYWdlWDogJ2NsaWVudFgnLCAvLyBJRThcbiAgICBwYWdlWTogJ2NsaWVudFknIC8vIElFOFxuICB9O1xuICBpZiAoY29vcmQgaW4gbWlzc01hcCAmJiAhKGNvb3JkIGluIGhvc3QpICYmIG1pc3NNYXBbY29vcmRdIGluIGhvc3QpIHtcbiAgICBjb29yZCA9IG1pc3NNYXBbY29vcmRdO1xuICB9XG4gIHJldHVybiBob3N0W2Nvb3JkXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkcmFndWxhO1xuIiwiLyohIG5vdWlzbGlkZXIgLSA4LjIuMSAtIDIwMTUtMTItMDIgMjE6NDM6MTQgKi9cclxuXHJcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xyXG5cclxuICAgIGlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xyXG5cclxuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKCB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vZGUvQ29tbW9uSlNcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcclxuICAgICAgICB3aW5kb3cubm9VaVNsaWRlciA9IGZhY3RvcnkoKTtcclxuICAgIH1cclxuXHJcbn0oZnVuY3Rpb24oICl7XHJcblxyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG5cdC8vIFJlbW92ZXMgZHVwbGljYXRlcyBmcm9tIGFuIGFycmF5LlxyXG5cdGZ1bmN0aW9uIHVuaXF1ZShhcnJheSkge1xyXG5cdFx0cmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihhKXtcclxuXHRcdFx0cmV0dXJuICF0aGlzW2FdID8gdGhpc1thXSA9IHRydWUgOiBmYWxzZTtcclxuXHRcdH0sIHt9KTtcclxuXHR9XHJcblxyXG5cdC8vIFJvdW5kIGEgdmFsdWUgdG8gdGhlIGNsb3Nlc3QgJ3RvJy5cclxuXHRmdW5jdGlvbiBjbG9zZXN0ICggdmFsdWUsIHRvICkge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQodmFsdWUgLyB0bykgKiB0bztcclxuXHR9XHJcblxyXG5cdC8vIEN1cnJlbnQgcG9zaXRpb24gb2YgYW4gZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gb2Zmc2V0ICggZWxlbSApIHtcclxuXHJcblx0dmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxyXG5cdFx0ZG9jID0gZWxlbS5vd25lckRvY3VtZW50LFxyXG5cdFx0ZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQsXHJcblx0XHRwYWdlT2Zmc2V0ID0gZ2V0UGFnZU9mZnNldCgpO1xyXG5cclxuXHRcdC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBjb250YWlucyBsZWZ0IHNjcm9sbCBpbiBDaHJvbWUgb24gQW5kcm9pZC5cclxuXHRcdC8vIEkgaGF2ZW4ndCBmb3VuZCBhIGZlYXR1cmUgZGV0ZWN0aW9uIHRoYXQgcHJvdmVzIHRoaXMuIFdvcnN0IGNhc2VcclxuXHRcdC8vIHNjZW5hcmlvIG9uIG1pcy1tYXRjaDogdGhlICd0YXAnIGZlYXR1cmUgb24gaG9yaXpvbnRhbCBzbGlkZXJzIGJyZWFrcy5cclxuXHRcdGlmICggL3dlYmtpdC4qQ2hyb21lLipNb2JpbGUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICkge1xyXG5cdFx0XHRwYWdlT2Zmc2V0LnggPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHRvcDogcmVjdC50b3AgKyBwYWdlT2Zmc2V0LnkgLSBkb2NFbGVtLmNsaWVudFRvcCxcclxuXHRcdFx0bGVmdDogcmVjdC5sZWZ0ICsgcGFnZU9mZnNldC54IC0gZG9jRWxlbS5jbGllbnRMZWZ0XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0Ly8gQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBudW1lcmljYWwuXHJcblx0ZnVuY3Rpb24gaXNOdW1lcmljICggYSApIHtcclxuXHRcdHJldHVybiB0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKCBhICkgJiYgaXNGaW5pdGUoIGEgKTtcclxuXHR9XHJcblxyXG5cdC8vIFJvdW5kcyBhIG51bWJlciB0byA3IHN1cHBvcnRlZCBkZWNpbWFscy5cclxuXHRmdW5jdGlvbiBhY2N1cmF0ZU51bWJlciggbnVtYmVyICkge1xyXG5cdFx0dmFyIHAgPSBNYXRoLnBvdygxMCwgNyk7XHJcblx0XHRyZXR1cm4gTnVtYmVyKChNYXRoLnJvdW5kKG51bWJlcipwKS9wKS50b0ZpeGVkKDcpKTtcclxuXHR9XHJcblxyXG5cdC8vIFNldHMgYSBjbGFzcyBhbmQgcmVtb3ZlcyBpdCBhZnRlciBbZHVyYXRpb25dIG1zLlxyXG5cdGZ1bmN0aW9uIGFkZENsYXNzRm9yICggZWxlbWVudCwgY2xhc3NOYW1lLCBkdXJhdGlvbiApIHtcclxuXHRcdGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcblx0XHR9LCBkdXJhdGlvbik7XHJcblx0fVxyXG5cclxuXHQvLyBMaW1pdHMgYSB2YWx1ZSB0byAwIC0gMTAwXHJcblx0ZnVuY3Rpb24gbGltaXQgKCBhICkge1xyXG5cdFx0cmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGEsIDEwMCksIDApO1xyXG5cdH1cclxuXHJcblx0Ly8gV3JhcHMgYSB2YXJpYWJsZSBhcyBhbiBhcnJheSwgaWYgaXQgaXNuJ3Qgb25lIHlldC5cclxuXHRmdW5jdGlvbiBhc0FycmF5ICggYSApIHtcclxuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGEpID8gYSA6IFthXTtcclxuXHR9XHJcblxyXG5cdC8vIENvdW50cyBkZWNpbWFsc1xyXG5cdGZ1bmN0aW9uIGNvdW50RGVjaW1hbHMgKCBudW1TdHIgKSB7XHJcblx0XHR2YXIgcGllY2VzID0gbnVtU3RyLnNwbGl0KFwiLlwiKTtcclxuXHRcdHJldHVybiBwaWVjZXMubGVuZ3RoID4gMSA/IHBpZWNlc1sxXS5sZW5ndGggOiAwO1xyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI2FkZF9jbGFzc1xyXG5cdGZ1bmN0aW9uIGFkZENsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI3JlbW92ZV9jbGFzc1xyXG5cdGZ1bmN0aW9uIHJlbW92ZUNsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gaHR0cDovL3lvdW1pZ2h0bm90bmVlZGpxdWVyeS5jb20vI2hhc19jbGFzc1xyXG5cdGZ1bmN0aW9uIGhhc0NsYXNzICggZWwsIGNsYXNzTmFtZSApIHtcclxuXHRcdGlmICggZWwuY2xhc3NMaXN0ICkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG5ldyBSZWdFeHAoJyhefCApJyArIGNsYXNzTmFtZSArICcoIHwkKScsICdnaScpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cvc2Nyb2xsWSNOb3Rlc1xyXG5cdGZ1bmN0aW9uIGdldFBhZ2VPZmZzZXQgKCApIHtcclxuXHJcblx0XHR2YXIgc3VwcG9ydFBhZ2VPZmZzZXQgPSB3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCxcclxuXHRcdFx0aXNDU1MxQ29tcGF0ID0gKChkb2N1bWVudC5jb21wYXRNb2RlIHx8IFwiXCIpID09PSBcIkNTUzFDb21wYXRcIiksXHJcblx0XHRcdHggPSBzdXBwb3J0UGFnZU9mZnNldCA/IHdpbmRvdy5wYWdlWE9mZnNldCA6IGlzQ1NTMUNvbXBhdCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IDogZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0LFxyXG5cdFx0XHR5ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIFNob3J0aGFuZCBmb3Igc3RvcFByb3BhZ2F0aW9uIHNvIHdlIGRvbid0IGhhdmUgdG8gY3JlYXRlIGEgZHluYW1pYyBtZXRob2RcclxuXHRmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCBlICkge1xyXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHR9XHJcblxyXG5cdC8vIHRvZG9cclxuXHRmdW5jdGlvbiBhZGRDc3NQcmVmaXgoY3NzUHJlZml4KSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XHJcblx0XHRcdHJldHVybiBjc3NQcmVmaXggKyBjbGFzc05hbWU7XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblxyXG5cdHZhclxyXG5cdC8vIERldGVybWluZSB0aGUgZXZlbnRzIHRvIGJpbmQuIElFMTEgaW1wbGVtZW50cyBwb2ludGVyRXZlbnRzIHdpdGhvdXRcclxuXHQvLyBhIHByZWZpeCwgd2hpY2ggYnJlYWtzIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgSUUxMCBpbXBsZW1lbnRhdGlvbi5cclxuXHQvKiogQGNvbnN0ICovXHJcblx0YWN0aW9ucyA9IHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgPyB7XHJcblx0XHRzdGFydDogJ3BvaW50ZXJkb3duJyxcclxuXHRcdG1vdmU6ICdwb2ludGVybW92ZScsXHJcblx0XHRlbmQ6ICdwb2ludGVydXAnXHJcblx0fSA6IHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCA/IHtcclxuXHRcdHN0YXJ0OiAnTVNQb2ludGVyRG93bicsXHJcblx0XHRtb3ZlOiAnTVNQb2ludGVyTW92ZScsXHJcblx0XHRlbmQ6ICdNU1BvaW50ZXJVcCdcclxuXHR9IDoge1xyXG5cdFx0c3RhcnQ6ICdtb3VzZWRvd24gdG91Y2hzdGFydCcsXHJcblx0XHRtb3ZlOiAnbW91c2Vtb3ZlIHRvdWNobW92ZScsXHJcblx0XHRlbmQ6ICdtb3VzZXVwIHRvdWNoZW5kJ1xyXG5cdH0sXHJcblx0ZGVmYXVsdENzc1ByZWZpeCA9ICdub1VpLSc7XHJcblxyXG5cclxuLy8gVmFsdWUgY2FsY3VsYXRpb25cclxuXHJcblx0Ly8gRGV0ZXJtaW5lIHRoZSBzaXplIG9mIGEgc3ViLXJhbmdlIGluIHJlbGF0aW9uIHRvIGEgZnVsbCByYW5nZS5cclxuXHRmdW5jdGlvbiBzdWJSYW5nZVJhdGlvICggcGEsIHBiICkge1xyXG5cdFx0cmV0dXJuICgxMDAgLyAocGIgLSBwYSkpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEhvdyBtYW55IHBlcmNlbnQgaXMgdGhpcyB2YWx1ZSBvZiB0aGlzIHJhbmdlP1xyXG5cdGZ1bmN0aW9uIGZyb21QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICh2YWx1ZSAqIDEwMCkgLyAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBXaGVyZSBpcyB0aGlzIHZhbHVlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gdG9QZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuIGZyb21QZXJjZW50YWdlKCByYW5nZSwgcmFuZ2VbMF0gPCAwID9cclxuXHRcdFx0dmFsdWUgKyBNYXRoLmFicyhyYW5nZVswXSkgOlxyXG5cdFx0XHRcdHZhbHVlIC0gcmFuZ2VbMF0gKTtcclxuXHR9XHJcblxyXG5cdC8vICh2YWx1ZSkgSG93IG11Y2ggaXMgdGhpcyBwZXJjZW50YWdlIG9uIHRoaXMgcmFuZ2U/XHJcblx0ZnVuY3Rpb24gaXNQZXJjZW50YWdlICggcmFuZ2UsIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuICgodmFsdWUgKiAoIHJhbmdlWzFdIC0gcmFuZ2VbMF0gKSkgLyAxMDApICsgcmFuZ2VbMF07XHJcblx0fVxyXG5cclxuXHJcbi8vIFJhbmdlIGNvbnZlcnNpb25cclxuXHJcblx0ZnVuY3Rpb24gZ2V0SiAoIHZhbHVlLCBhcnIgKSB7XHJcblxyXG5cdFx0dmFyIGogPSAxO1xyXG5cclxuXHRcdHdoaWxlICggdmFsdWUgPj0gYXJyW2pdICl7XHJcblx0XHRcdGogKz0gMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gajtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBJbnB1dCBhIHZhbHVlLCBmaW5kIHdoZXJlLCBvbiBhIHNjYWxlIG9mIDAtMTAwLCBpdCBhcHBsaWVzLlxyXG5cdGZ1bmN0aW9uIHRvU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHRpZiAoIHZhbHVlID49IHhWYWwuc2xpY2UoLTEpWzBdICl7XHJcblx0XHRcdHJldHVybiAxMDA7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFZhbCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBwYSArICh0b1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sIHZhbHVlKSAvIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHZhbHVlKSBJbnB1dCBhIHBlcmNlbnRhZ2UsIGZpbmQgd2hlcmUgaXQgaXMgb24gdGhlIHNwZWNpZmllZCByYW5nZS5cclxuXHRmdW5jdGlvbiBmcm9tU3RlcHBpbmcgKCB4VmFsLCB4UGN0LCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBUaGVyZSBpcyBubyByYW5nZSBncm91cCB0aGF0IGZpdHMgMTAwXHJcblx0XHRpZiAoIHZhbHVlID49IDEwMCApe1xyXG5cdFx0XHRyZXR1cm4geFZhbC5zbGljZSgtMSlbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGogPSBnZXRKKCB2YWx1ZSwgeFBjdCApLCB2YSwgdmIsIHBhLCBwYjtcclxuXHJcblx0XHR2YSA9IHhWYWxbai0xXTtcclxuXHRcdHZiID0geFZhbFtqXTtcclxuXHRcdHBhID0geFBjdFtqLTFdO1xyXG5cdFx0cGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdHJldHVybiBpc1BlcmNlbnRhZ2UoW3ZhLCB2Yl0sICh2YWx1ZSAtIHBhKSAqIHN1YlJhbmdlUmF0aW8gKHBhLCBwYikpO1xyXG5cdH1cclxuXHJcblx0Ly8gKHBlcmNlbnRhZ2UpIEdldCB0aGUgc3RlcCB0aGF0IGFwcGxpZXMgYXQgYSBjZXJ0YWluIHZhbHVlLlxyXG5cdGZ1bmN0aW9uIGdldFN0ZXAgKCB4UGN0LCB4U3RlcHMsIHNuYXAsIHZhbHVlICkge1xyXG5cclxuXHRcdGlmICggdmFsdWUgPT09IDEwMCApIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBqID0gZ2V0SiggdmFsdWUsIHhQY3QgKSwgYSwgYjtcclxuXHJcblx0XHQvLyBJZiAnc25hcCcgaXMgc2V0LCBzdGVwcyBhcmUgdXNlZCBhcyBmaXhlZCBwb2ludHMgb24gdGhlIHNsaWRlci5cclxuXHRcdGlmICggc25hcCApIHtcclxuXHJcblx0XHRcdGEgPSB4UGN0W2otMV07XHJcblx0XHRcdGIgPSB4UGN0W2pdO1xyXG5cclxuXHRcdFx0Ly8gRmluZCB0aGUgY2xvc2VzdCBwb3NpdGlvbiwgYSBvciBiLlxyXG5cdFx0XHRpZiAoKHZhbHVlIC0gYSkgPiAoKGItYSkvMikpe1xyXG5cdFx0XHRcdHJldHVybiBiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gYTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICF4U3RlcHNbai0xXSApe1xyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHhQY3Rbai0xXSArIGNsb3Nlc3QoXHJcblx0XHRcdHZhbHVlIC0geFBjdFtqLTFdLFxyXG5cdFx0XHR4U3RlcHNbai0xXVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cclxuLy8gRW50cnkgcGFyc2luZ1xyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVFbnRyeVBvaW50ICggaW5kZXgsIHZhbHVlLCB0aGF0ICkge1xyXG5cclxuXHRcdHZhciBwZXJjZW50YWdlO1xyXG5cclxuXHRcdC8vIFdyYXAgbnVtZXJpY2FsIGlucHV0IGluIGFuIGFycmF5LlxyXG5cdFx0aWYgKCB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgKSB7XHJcblx0XHRcdHZhbHVlID0gW3ZhbHVlXTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSZWplY3QgYW55IGludmFsaWQgaW5wdXQsIGJ5IHRlc3Rpbmcgd2hldGhlciB2YWx1ZSBpcyBhbiBhcnJheS5cclxuXHRcdGlmICggT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCB2YWx1ZSApICE9PSAnW29iamVjdCBBcnJheV0nICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgY29udGFpbnMgaW52YWxpZCB2YWx1ZS5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ292ZXJ0IG1pbi9tYXggc3ludGF4IHRvIDAgYW5kIDEwMC5cclxuXHRcdGlmICggaW5kZXggPT09ICdtaW4nICkge1xyXG5cdFx0XHRwZXJjZW50YWdlID0gMDtcclxuXHRcdH0gZWxzZSBpZiAoIGluZGV4ID09PSAnbWF4JyApIHtcclxuXHRcdFx0cGVyY2VudGFnZSA9IDEwMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHBlcmNlbnRhZ2UgPSBwYXJzZUZsb2F0KCBpbmRleCApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENoZWNrIGZvciBjb3JyZWN0IGlucHV0LlxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKCBwZXJjZW50YWdlICkgfHwgIWlzTnVtZXJpYyggdmFsdWVbMF0gKSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ3JhbmdlJyB2YWx1ZSBpc24ndCBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdG9yZSB2YWx1ZXMuXHJcblx0XHR0aGF0LnhQY3QucHVzaCggcGVyY2VudGFnZSApO1xyXG5cdFx0dGhhdC54VmFsLnB1c2goIHZhbHVlWzBdICk7XHJcblxyXG5cdFx0Ly8gTmFOIHdpbGwgZXZhbHVhdGUgdG8gZmFsc2UgdG9vLCBidXQgdG8ga2VlcFxyXG5cdFx0Ly8gbG9nZ2luZyBjbGVhciwgc2V0IHN0ZXAgZXhwbGljaXRseS4gTWFrZSBzdXJlXHJcblx0XHQvLyBub3QgdG8gb3ZlcnJpZGUgdGhlICdzdGVwJyBzZXR0aW5nIHdpdGggZmFsc2UuXHJcblx0XHRpZiAoICFwZXJjZW50YWdlICkge1xyXG5cdFx0XHRpZiAoICFpc05hTiggdmFsdWVbMV0gKSApIHtcclxuXHRcdFx0XHR0aGF0LnhTdGVwc1swXSA9IHZhbHVlWzFdO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGF0LnhTdGVwcy5wdXNoKCBpc05hTih2YWx1ZVsxXSkgPyBmYWxzZSA6IHZhbHVlWzFdICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVTdGVwUG9pbnQgKCBpLCBuLCB0aGF0ICkge1xyXG5cclxuXHRcdC8vIElnbm9yZSAnZmFsc2UnIHN0ZXBwaW5nLlxyXG5cdFx0aWYgKCAhbiApIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmFjdG9yIHRvIHJhbmdlIHJhdGlvXHJcblx0XHR0aGF0LnhTdGVwc1tpXSA9IGZyb21QZXJjZW50YWdlKFtcclxuXHRcdFx0IHRoYXQueFZhbFtpXVxyXG5cdFx0XHQsdGhhdC54VmFsW2krMV1cclxuXHRcdF0sIG4pIC8gc3ViUmFuZ2VSYXRpbyAoXHJcblx0XHRcdHRoYXQueFBjdFtpXSxcclxuXHRcdFx0dGhhdC54UGN0W2krMV0gKTtcclxuXHR9XHJcblxyXG5cclxuLy8gSW50ZXJmYWNlXHJcblxyXG5cdC8vIFRoZSBpbnRlcmZhY2UgdG8gU3BlY3RydW0gaGFuZGxlcyBhbGwgZGlyZWN0aW9uLWJhc2VkXHJcblx0Ly8gY29udmVyc2lvbnMsIHNvIHRoZSBhYm92ZSB2YWx1ZXMgYXJlIHVuYXdhcmUuXHJcblxyXG5cdGZ1bmN0aW9uIFNwZWN0cnVtICggZW50cnksIHNuYXAsIGRpcmVjdGlvbiwgc2luZ2xlU3RlcCApIHtcclxuXHJcblx0XHR0aGlzLnhQY3QgPSBbXTtcclxuXHRcdHRoaXMueFZhbCA9IFtdO1xyXG5cdFx0dGhpcy54U3RlcHMgPSBbIHNpbmdsZVN0ZXAgfHwgZmFsc2UgXTtcclxuXHRcdHRoaXMueE51bVN0ZXBzID0gWyBmYWxzZSBdO1xyXG5cclxuXHRcdHRoaXMuc25hcCA9IHNuYXA7XHJcblx0XHR0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHJcblx0XHR2YXIgaW5kZXgsIG9yZGVyZWQgPSBbIC8qIFswLCAnbWluJ10sIFsxLCAnNTAlJ10sIFsyLCAnbWF4J10gKi8gXTtcclxuXHJcblx0XHQvLyBNYXAgdGhlIG9iamVjdCBrZXlzIHRvIGFuIGFycmF5LlxyXG5cdFx0Zm9yICggaW5kZXggaW4gZW50cnkgKSB7XHJcblx0XHRcdGlmICggZW50cnkuaGFzT3duUHJvcGVydHkoaW5kZXgpICkge1xyXG5cdFx0XHRcdG9yZGVyZWQucHVzaChbZW50cnlbaW5kZXhdLCBpbmRleF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU29ydCBhbGwgZW50cmllcyBieSB2YWx1ZSAobnVtZXJpYyBzb3J0KS5cclxuXHRcdGlmICggb3JkZXJlZC5sZW5ndGggJiYgdHlwZW9mIG9yZGVyZWRbMF1bMF0gPT09IFwib2JqZWN0XCIgKSB7XHJcblx0XHRcdG9yZGVyZWQuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhWzBdWzBdIC0gYlswXVswXTsgfSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRvcmRlcmVkLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYVswXSAtIGJbMF07IH0pO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvLyBDb252ZXJ0IGFsbCBlbnRyaWVzIHRvIHN1YnJhbmdlcy5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBvcmRlcmVkLmxlbmd0aDsgaW5kZXgrKyApIHtcclxuXHRcdFx0aGFuZGxlRW50cnlQb2ludChvcmRlcmVkW2luZGV4XVsxXSwgb3JkZXJlZFtpbmRleF1bMF0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0b3JlIHRoZSBhY3R1YWwgc3RlcCB2YWx1ZXMuXHJcblx0XHQvLyB4U3RlcHMgaXMgc29ydGVkIGluIHRoZSBzYW1lIG9yZGVyIGFzIHhQY3QgYW5kIHhWYWwuXHJcblx0XHR0aGlzLnhOdW1TdGVwcyA9IHRoaXMueFN0ZXBzLnNsaWNlKDApO1xyXG5cclxuXHRcdC8vIENvbnZlcnQgYWxsIG51bWVyaWMgc3RlcHMgdG8gdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIHN1YnJhbmdlIHRoZXkgcmVwcmVzZW50LlxyXG5cdFx0Zm9yICggaW5kZXggPSAwOyBpbmRleCA8IHRoaXMueE51bVN0ZXBzLmxlbmd0aDsgaW5kZXgrKyApIHtcclxuXHRcdFx0aGFuZGxlU3RlcFBvaW50KGluZGV4LCB0aGlzLnhOdW1TdGVwc1tpbmRleF0sIHRoaXMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmdldE1hcmdpbiA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy54UGN0Lmxlbmd0aCA9PT0gMiA/IGZyb21QZXJjZW50YWdlKHRoaXMueFZhbCwgdmFsdWUpIDogZmFsc2U7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLnRvU3RlcHBpbmcgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdHZhbHVlID0gdG9TdGVwcGluZyggdGhpcy54VmFsLCB0aGlzLnhQY3QsIHZhbHVlICk7XHJcblxyXG5cdFx0Ly8gSW52ZXJ0IHRoZSB2YWx1ZSBpZiB0aGlzIGlzIGEgcmlnaHQtdG8tbGVmdCBzbGlkZXIuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZnJvbVN0ZXBwaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBJbnZlcnQgdGhlIHZhbHVlIGlmIHRoaXMgaXMgYSByaWdodC10by1sZWZ0IHNsaWRlci5cclxuXHRcdGlmICggdGhpcy5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdHZhbHVlID0gMTAwIC0gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFjY3VyYXRlTnVtYmVyKGZyb21TdGVwcGluZyggdGhpcy54VmFsLCB0aGlzLnhQY3QsIHZhbHVlICkpO1xyXG5cdH07XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5nZXRTdGVwID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBGaW5kIHRoZSBwcm9wZXIgc3RlcCBmb3IgcnRsIHNsaWRlcnMgYnkgc2VhcmNoIGluIGludmVyc2UgZGlyZWN0aW9uLlxyXG5cdFx0Ly8gRml4ZXMgaXNzdWUgIzI2Mi5cclxuXHRcdGlmICggdGhpcy5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdHZhbHVlID0gMTAwIC0gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFsdWUgPSBnZXRTdGVwKHRoaXMueFBjdCwgdGhpcy54U3RlcHMsIHRoaXMuc25hcCwgdmFsdWUgKTtcclxuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZ2V0QXBwbGljYWJsZVN0ZXAgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cclxuXHRcdC8vIElmIHRoZSB2YWx1ZSBpcyAxMDAlLCByZXR1cm4gdGhlIG5lZ2F0aXZlIHN0ZXAgdHdpY2UuXHJcblx0XHR2YXIgaiA9IGdldEoodmFsdWUsIHRoaXMueFBjdCksIG9mZnNldCA9IHZhbHVlID09PSAxMDAgPyAyIDogMTtcclxuXHRcdHJldHVybiBbdGhpcy54TnVtU3RlcHNbai0yXSwgdGhpcy54VmFsW2otb2Zmc2V0XSwgdGhpcy54TnVtU3RlcHNbai1vZmZzZXRdXTtcclxuXHR9O1xyXG5cclxuXHQvLyBPdXRzaWRlIHRlc3RpbmdcclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRTdGVwKHRoaXMudG9TdGVwcGluZyh2YWx1ZSkpO1xyXG5cdH07XHJcblxyXG4vKlx0RXZlcnkgaW5wdXQgb3B0aW9uIGlzIHRlc3RlZCBhbmQgcGFyc2VkLiBUaGlzJ2xsIHByZXZlbnRcclxuXHRlbmRsZXNzIHZhbGlkYXRpb24gaW4gaW50ZXJuYWwgbWV0aG9kcy4gVGhlc2UgdGVzdHMgYXJlXHJcblx0c3RydWN0dXJlZCB3aXRoIGFuIGl0ZW0gZm9yIGV2ZXJ5IG9wdGlvbiBhdmFpbGFibGUuIEFuXHJcblx0b3B0aW9uIGNhbiBiZSBtYXJrZWQgYXMgcmVxdWlyZWQgYnkgc2V0dGluZyB0aGUgJ3InIGZsYWcuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gaXMgcHJvdmlkZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6XHJcblx0XHQtIFRoZSBwcm92aWRlZCB2YWx1ZSBmb3IgdGhlIG9wdGlvbjtcclxuXHRcdC0gQSByZWZlcmVuY2UgdG8gdGhlIG9wdGlvbnMgb2JqZWN0O1xyXG5cdFx0LSBUaGUgbmFtZSBmb3IgdGhlIG9wdGlvbjtcclxuXHJcblx0VGhlIHRlc3RpbmcgZnVuY3Rpb24gcmV0dXJucyBmYWxzZSB3aGVuIGFuIGVycm9yIGlzIGRldGVjdGVkLFxyXG5cdG9yIHRydWUgd2hlbiBldmVyeXRoaW5nIGlzIE9LLiBJdCBjYW4gYWxzbyBtb2RpZnkgdGhlIG9wdGlvblxyXG5cdG9iamVjdCwgdG8gbWFrZSBzdXJlIGFsbCB2YWx1ZXMgY2FuIGJlIGNvcnJlY3RseSBsb29wZWQgZWxzZXdoZXJlLiAqL1xyXG5cclxuXHR2YXIgZGVmYXVsdEZvcm1hdHRlciA9IHsgJ3RvJzogZnVuY3Rpb24oIHZhbHVlICl7XHJcblx0XHRyZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZS50b0ZpeGVkKDIpO1xyXG5cdH0sICdmcm9tJzogTnVtYmVyIH07XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTdGVwICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoICFpc051bWVyaWMoIGVudHJ5ICkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdzdGVwJyBpcyBub3QgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGhlIHN0ZXAgb3B0aW9uIGNhbiBzdGlsbCBiZSB1c2VkIHRvIHNldCBzdGVwcGluZ1xyXG5cdFx0Ly8gZm9yIGxpbmVhciBzbGlkZXJzLiBPdmVyd3JpdHRlbiBpZiBzZXQgaW4gJ3JhbmdlJy5cclxuXHRcdHBhcnNlZC5zaW5nbGVTdGVwID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0UmFuZ2UgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIEZpbHRlciBpbmNvcnJlY3QgaW5wdXQuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShlbnRyeSkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2F0Y2ggbWlzc2luZyBzdGFydCBvciBlbmQuXHJcblx0XHRpZiAoIGVudHJ5Lm1pbiA9PT0gdW5kZWZpbmVkIHx8IGVudHJ5Lm1heCA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiBNaXNzaW5nICdtaW4nIG9yICdtYXgnIGluICdyYW5nZScuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENhdGNoIGVxdWFsIHN0YXJ0IG9yIGVuZC5cclxuXHRcdGlmICggZW50cnkubWluID09PSBlbnRyeS5tYXggKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgJ21pbicgYW5kICdtYXgnIGNhbm5vdCBiZSBlcXVhbC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLnNwZWN0cnVtID0gbmV3IFNwZWN0cnVtKGVudHJ5LCBwYXJzZWQuc25hcCwgcGFyc2VkLmRpciwgcGFyc2VkLnNpbmdsZVN0ZXApO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFN0YXJ0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRlbnRyeSA9IGFzQXJyYXkoZW50cnkpO1xyXG5cclxuXHRcdC8vIFZhbGlkYXRlIGlucHV0LiBWYWx1ZXMgYXJlbid0IHRlc3RlZCwgYXMgdGhlIHB1YmxpYyAudmFsIG1ldGhvZFxyXG5cdFx0Ly8gd2lsbCBhbHdheXMgcHJvdmlkZSBhIHZhbGlkIGxvY2F0aW9uLlxyXG5cdFx0aWYgKCAhQXJyYXkuaXNBcnJheSggZW50cnkgKSB8fCAhZW50cnkubGVuZ3RoIHx8IGVudHJ5Lmxlbmd0aCA+IDIgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdzdGFydCcgb3B0aW9uIGlzIGluY29ycmVjdC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdGhlIG51bWJlciBvZiBoYW5kbGVzLlxyXG5cdFx0cGFyc2VkLmhhbmRsZXMgPSBlbnRyeS5sZW5ndGg7XHJcblxyXG5cdFx0Ly8gV2hlbiB0aGUgc2xpZGVyIGlzIGluaXRpYWxpemVkLCB0aGUgLnZhbCBtZXRob2Qgd2lsbFxyXG5cdFx0Ly8gYmUgY2FsbGVkIHdpdGggdGhlIHN0YXJ0IG9wdGlvbnMuXHJcblx0XHRwYXJzZWQuc3RhcnQgPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTbmFwICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5zbmFwID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnc25hcCcgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RBbmltYXRlICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBFbmZvcmNlIDEwMCUgc3RlcHBpbmcgd2l0aGluIHN1YnJhbmdlcy5cclxuXHRcdHBhcnNlZC5hbmltYXRlID0gZW50cnk7XHJcblxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdib29sZWFuJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnYW5pbWF0ZScgb3B0aW9uIG11c3QgYmUgYSBib29sZWFuLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RDb25uZWN0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ID09PSAnbG93ZXInICYmIHBhcnNlZC5oYW5kbGVzID09PSAxICkge1xyXG5cdFx0XHRwYXJzZWQuY29ubmVjdCA9IDE7XHJcblx0XHR9IGVsc2UgaWYgKCBlbnRyeSA9PT0gJ3VwcGVyJyAmJiBwYXJzZWQuaGFuZGxlcyA9PT0gMSApIHtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSAyO1xyXG5cdFx0fSBlbHNlIGlmICggZW50cnkgPT09IHRydWUgJiYgcGFyc2VkLmhhbmRsZXMgPT09IDIgKSB7XHJcblx0XHRcdHBhcnNlZC5jb25uZWN0ID0gMztcclxuXHRcdH0gZWxzZSBpZiAoIGVudHJ5ID09PSBmYWxzZSApIHtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSAwO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2Nvbm5lY3QnIG9wdGlvbiBkb2Vzbid0IG1hdGNoIGhhbmRsZSBjb3VudC5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0T3JpZW50YXRpb24gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIFNldCBvcmllbnRhdGlvbiB0byBhbiBhIG51bWVyaWNhbCB2YWx1ZSBmb3IgZWFzeVxyXG5cdFx0Ly8gYXJyYXkgc2VsZWN0aW9uLlxyXG5cdFx0c3dpdGNoICggZW50cnkgKXtcclxuXHRcdCAgY2FzZSAnaG9yaXpvbnRhbCc6XHJcblx0XHRcdHBhcnNlZC5vcnQgPSAwO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdCAgY2FzZSAndmVydGljYWwnOlxyXG5cdFx0XHRwYXJzZWQub3J0ID0gMTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGRlZmF1bHQ6XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdvcmllbnRhdGlvbicgb3B0aW9uIGlzIGludmFsaWQuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdE1hcmdpbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnbWFyZ2luJyBvcHRpb24gbXVzdCBiZSBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQubWFyZ2luID0gcGFyc2VkLnNwZWN0cnVtLmdldE1hcmdpbihlbnRyeSk7XHJcblxyXG5cdFx0aWYgKCAhcGFyc2VkLm1hcmdpbiApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ21hcmdpbicgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIG9uIGxpbmVhciBzbGlkZXJzLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RMaW1pdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKGVudHJ5KSApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnbGltaXQnIG9wdGlvbiBtdXN0IGJlIG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5saW1pdCA9IHBhcnNlZC5zcGVjdHJ1bS5nZXRNYXJnaW4oZW50cnkpO1xyXG5cclxuXHRcdGlmICggIXBhcnNlZC5saW1pdCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2xpbWl0JyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgb24gbGluZWFyIHNsaWRlcnMuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdERpcmVjdGlvbiAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gU2V0IGRpcmVjdGlvbiBhcyBhIG51bWVyaWNhbCB2YWx1ZSBmb3IgZWFzeSBwYXJzaW5nLlxyXG5cdFx0Ly8gSW52ZXJ0IGNvbm5lY3Rpb24gZm9yIFJUTCBzbGlkZXJzLCBzbyB0aGF0IHRoZSBwcm9wZXJcclxuXHRcdC8vIGhhbmRsZXMgZ2V0IHRoZSBjb25uZWN0L2JhY2tncm91bmQgY2xhc3Nlcy5cclxuXHRcdHN3aXRjaCAoIGVudHJ5ICkge1xyXG5cdFx0ICBjYXNlICdsdHInOlxyXG5cdFx0XHRwYXJzZWQuZGlyID0gMDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGNhc2UgJ3J0bCc6XHJcblx0XHRcdHBhcnNlZC5kaXIgPSAxO1xyXG5cdFx0XHRwYXJzZWQuY29ubmVjdCA9IFswLDIsMSwzXVtwYXJzZWQuY29ubmVjdF07XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnZGlyZWN0aW9uJyBvcHRpb24gd2FzIG5vdCByZWNvZ25pemVkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RCZWhhdmlvdXIgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgaW5wdXQgaXMgYSBzdHJpbmcuXHJcblx0XHRpZiAoIHR5cGVvZiBlbnRyeSAhPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdiZWhhdmlvdXInIG11c3QgYmUgYSBzdHJpbmcgY29udGFpbmluZyBvcHRpb25zLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBpZiB0aGUgc3RyaW5nIGNvbnRhaW5zIGFueSBrZXl3b3Jkcy5cclxuXHRcdC8vIE5vbmUgYXJlIHJlcXVpcmVkLlxyXG5cdFx0dmFyIHRhcCA9IGVudHJ5LmluZGV4T2YoJ3RhcCcpID49IDAsXHJcblx0XHRcdGRyYWcgPSBlbnRyeS5pbmRleE9mKCdkcmFnJykgPj0gMCxcclxuXHRcdFx0Zml4ZWQgPSBlbnRyeS5pbmRleE9mKCdmaXhlZCcpID49IDAsXHJcblx0XHRcdHNuYXAgPSBlbnRyeS5pbmRleE9mKCdzbmFwJykgPj0gMCxcclxuXHRcdFx0aG92ZXIgPSBlbnRyeS5pbmRleE9mKCdob3ZlcicpID49IDA7XHJcblxyXG5cdFx0Ly8gRml4ICM0NzJcclxuXHRcdGlmICggZHJhZyAmJiAhcGFyc2VkLmNvbm5lY3QgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdkcmFnJyBiZWhhdmlvdXIgbXVzdCBiZSB1c2VkIHdpdGggJ2Nvbm5lY3QnOiB0cnVlLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQuZXZlbnRzID0ge1xyXG5cdFx0XHR0YXA6IHRhcCB8fCBzbmFwLFxyXG5cdFx0XHRkcmFnOiBkcmFnLFxyXG5cdFx0XHRmaXhlZDogZml4ZWQsXHJcblx0XHRcdHNuYXA6IHNuYXAsXHJcblx0XHRcdGhvdmVyOiBob3ZlclxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RUb29sdGlwcyAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0dmFyIGk7XHJcblxyXG5cdFx0aWYgKCBlbnRyeSA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH0gZWxzZSBpZiAoIGVudHJ5ID09PSB0cnVlICkge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gW107XHJcblxyXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IHBhcnNlZC5oYW5kbGVzOyBpKysgKSB7XHJcblx0XHRcdFx0cGFyc2VkLnRvb2x0aXBzLnB1c2godHJ1ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzID0gYXNBcnJheShlbnRyeSk7XHJcblxyXG5cdFx0XHRpZiAoIHBhcnNlZC50b29sdGlwcy5sZW5ndGggIT09IHBhcnNlZC5oYW5kbGVzICkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6IG11c3QgcGFzcyBhIGZvcm1hdHRlciBmb3IgYWxsIGhhbmRsZXMuXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJzZWQudG9vbHRpcHMuZm9yRWFjaChmdW5jdGlvbihmb3JtYXR0ZXIpe1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIGZvcm1hdHRlciAhPT0gJ2Jvb2xlYW4nICYmICh0eXBlb2YgZm9ybWF0dGVyICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgZm9ybWF0dGVyLnRvICE9PSAnZnVuY3Rpb24nKSApIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICd0b29sdGlwcycgbXVzdCBiZSBwYXNzZWQgYSBmb3JtYXR0ZXIgb3IgJ2ZhbHNlJy5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RGb3JtYXQgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdHBhcnNlZC5mb3JtYXQgPSBlbnRyeTtcclxuXHJcblx0XHQvLyBBbnkgb2JqZWN0IHdpdGggYSB0byBhbmQgZnJvbSBtZXRob2QgaXMgc3VwcG9ydGVkLlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkudG8gPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVudHJ5LmZyb20gPT09ICdmdW5jdGlvbicgKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRocm93IG5ldyBFcnJvciggXCJub1VpU2xpZGVyOiAnZm9ybWF0JyByZXF1aXJlcyAndG8nIGFuZCAnZnJvbScgbWV0aG9kcy5cIik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Q3NzUHJlZml4ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRpZiAoIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVudHJ5ICE9PSAnc3RyaW5nJyApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIm5vVWlTbGlkZXI6ICdjc3NQcmVmaXgnIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5jc3NQcmVmaXggPSBlbnRyeTtcclxuXHR9XHJcblxyXG5cdC8vIFRlc3QgYWxsIGRldmVsb3BlciBzZXR0aW5ncyBhbmQgcGFyc2UgdG8gYXNzdW1wdGlvbi1zYWZlIHZhbHVlcy5cclxuXHRmdW5jdGlvbiB0ZXN0T3B0aW9ucyAoIG9wdGlvbnMgKSB7XHJcblxyXG5cdFx0Ly8gVG8gcHJvdmUgYSBmaXggZm9yICM1MzcsIGZyZWV6ZSBvcHRpb25zIGhlcmUuXHJcblx0XHQvLyBJZiB0aGUgb2JqZWN0IGlzIG1vZGlmaWVkLCBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cclxuXHRcdC8vIE9iamVjdC5mcmVlemUob3B0aW9ucyk7XHJcblxyXG5cdFx0dmFyIHBhcnNlZCA9IHtcclxuXHRcdFx0bWFyZ2luOiAwLFxyXG5cdFx0XHRsaW1pdDogMCxcclxuXHRcdFx0YW5pbWF0ZTogdHJ1ZSxcclxuXHRcdFx0Zm9ybWF0OiBkZWZhdWx0Rm9ybWF0dGVyXHJcblx0XHR9LCB0ZXN0cztcclxuXHJcblx0XHQvLyBUZXN0cyBhcmUgZXhlY3V0ZWQgaW4gdGhlIG9yZGVyIHRoZXkgYXJlIHByZXNlbnRlZCBoZXJlLlxyXG5cdFx0dGVzdHMgPSB7XHJcblx0XHRcdCdzdGVwJzogeyByOiBmYWxzZSwgdDogdGVzdFN0ZXAgfSxcclxuXHRcdFx0J3N0YXJ0JzogeyByOiB0cnVlLCB0OiB0ZXN0U3RhcnQgfSxcclxuXHRcdFx0J2Nvbm5lY3QnOiB7IHI6IHRydWUsIHQ6IHRlc3RDb25uZWN0IH0sXHJcblx0XHRcdCdkaXJlY3Rpb24nOiB7IHI6IHRydWUsIHQ6IHRlc3REaXJlY3Rpb24gfSxcclxuXHRcdFx0J3NuYXAnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0U25hcCB9LFxyXG5cdFx0XHQnYW5pbWF0ZSc6IHsgcjogZmFsc2UsIHQ6IHRlc3RBbmltYXRlIH0sXHJcblx0XHRcdCdyYW5nZSc6IHsgcjogdHJ1ZSwgdDogdGVzdFJhbmdlIH0sXHJcblx0XHRcdCdvcmllbnRhdGlvbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RPcmllbnRhdGlvbiB9LFxyXG5cdFx0XHQnbWFyZ2luJzogeyByOiBmYWxzZSwgdDogdGVzdE1hcmdpbiB9LFxyXG5cdFx0XHQnbGltaXQnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0TGltaXQgfSxcclxuXHRcdFx0J2JlaGF2aW91cic6IHsgcjogdHJ1ZSwgdDogdGVzdEJlaGF2aW91ciB9LFxyXG5cdFx0XHQnZm9ybWF0JzogeyByOiBmYWxzZSwgdDogdGVzdEZvcm1hdCB9LFxyXG5cdFx0XHQndG9vbHRpcHMnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0VG9vbHRpcHMgfSxcclxuXHRcdFx0J2Nzc1ByZWZpeCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RDc3NQcmVmaXggfVxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgZGVmYXVsdHMgPSB7XHJcblx0XHRcdCdjb25uZWN0JzogZmFsc2UsXHJcblx0XHRcdCdkaXJlY3Rpb24nOiAnbHRyJyxcclxuXHRcdFx0J2JlaGF2aW91cic6ICd0YXAnLFxyXG5cdFx0XHQnb3JpZW50YXRpb24nOiAnaG9yaXpvbnRhbCdcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gUnVuIGFsbCBvcHRpb25zIHRocm91Z2ggYSB0ZXN0aW5nIG1lY2hhbmlzbSB0byBlbnN1cmUgY29ycmVjdFxyXG5cdFx0Ly8gaW5wdXQuIEl0IHNob3VsZCBiZSBub3RlZCB0aGF0IG9wdGlvbnMgbWlnaHQgZ2V0IG1vZGlmaWVkIHRvXHJcblx0XHQvLyBiZSBoYW5kbGVkIHByb3Blcmx5LiBFLmcuIHdyYXBwaW5nIGludGVnZXJzIGluIGFycmF5cy5cclxuXHRcdE9iamVjdC5rZXlzKHRlc3RzKS5mb3JFYWNoKGZ1bmN0aW9uKCBuYW1lICl7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGUgb3B0aW9uIGlzbid0IHNldCwgYnV0IGl0IGlzIHJlcXVpcmVkLCB0aHJvdyBhbiBlcnJvci5cclxuXHRcdFx0aWYgKCBvcHRpb25zW25hbWVdID09PSB1bmRlZmluZWQgJiYgZGVmYXVsdHNbbmFtZV0gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcblx0XHRcdFx0aWYgKCB0ZXN0c1tuYW1lXS5yICkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ1wiICsgbmFtZSArIFwiJyBpcyByZXF1aXJlZC5cIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGVzdHNbbmFtZV0udCggcGFyc2VkLCBvcHRpb25zW25hbWVdID09PSB1bmRlZmluZWQgPyBkZWZhdWx0c1tuYW1lXSA6IG9wdGlvbnNbbmFtZV0gKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEZvcndhcmQgcGlwcyBvcHRpb25zXHJcblx0XHRwYXJzZWQucGlwcyA9IG9wdGlvbnMucGlwcztcclxuXHJcblx0XHQvLyBQcmUtZGVmaW5lIHRoZSBzdHlsZXMuXHJcblx0XHRwYXJzZWQuc3R5bGUgPSBwYXJzZWQub3J0ID8gJ3RvcCcgOiAnbGVmdCc7XHJcblxyXG5cdFx0cmV0dXJuIHBhcnNlZDtcclxuXHR9XHJcblxyXG5cclxuZnVuY3Rpb24gY2xvc3VyZSAoIHRhcmdldCwgb3B0aW9ucyApe1xyXG5cclxuXHQvLyBBbGwgdmFyaWFibGVzIGxvY2FsIHRvICdjbG9zdXJlJyBhcmUgcHJlZml4ZWQgd2l0aCAnc2NvcGVfJ1xyXG5cdHZhciBzY29wZV9UYXJnZXQgPSB0YXJnZXQsXHJcblx0XHRzY29wZV9Mb2NhdGlvbnMgPSBbLTEsIC0xXSxcclxuXHRcdHNjb3BlX0Jhc2UsXHJcblx0XHRzY29wZV9IYW5kbGVzLFxyXG5cdFx0c2NvcGVfU3BlY3RydW0gPSBvcHRpb25zLnNwZWN0cnVtLFxyXG5cdFx0c2NvcGVfVmFsdWVzID0gW10sXHJcblx0XHRzY29wZV9FdmVudHMgPSB7fSxcclxuXHRcdHNjb3BlX1NlbGY7XHJcblxyXG4gIHZhciBjc3NDbGFzc2VzID0gW1xyXG4gICAgLyogIDAgKi8gICd0YXJnZXQnXHJcbiAgICAvKiAgMSAqLyAsJ2Jhc2UnXHJcbiAgICAvKiAgMiAqLyAsJ29yaWdpbidcclxuICAgIC8qICAzICovICwnaGFuZGxlJ1xyXG4gICAgLyogIDQgKi8gLCdob3Jpem9udGFsJ1xyXG4gICAgLyogIDUgKi8gLCd2ZXJ0aWNhbCdcclxuICAgIC8qICA2ICovICwnYmFja2dyb3VuZCdcclxuICAgIC8qICA3ICovICwnY29ubmVjdCdcclxuICAgIC8qICA4ICovICwnbHRyJ1xyXG4gICAgLyogIDkgKi8gLCdydGwnXHJcbiAgICAvKiAxMCAqLyAsJ2RyYWdnYWJsZSdcclxuICAgIC8qIDExICovICwnJ1xyXG4gICAgLyogMTIgKi8gLCdzdGF0ZS1kcmFnJ1xyXG4gICAgLyogMTMgKi8gLCcnXHJcbiAgICAvKiAxNCAqLyAsJ3N0YXRlLXRhcCdcclxuICAgIC8qIDE1ICovICwnYWN0aXZlJ1xyXG4gICAgLyogMTYgKi8gLCcnXHJcbiAgICAvKiAxNyAqLyAsJ3N0YWNraW5nJ1xyXG4gICAgLyogMTggKi8gLCd0b29sdGlwJ1xyXG4gICAgLyogMTkgKi8gLCcnXHJcbiAgICAvKiAyMCAqLyAsJ3BpcHMnXHJcbiAgICAvKiAyMSAqLyAsJ21hcmtlcidcclxuICAgIC8qIDIyICovICwndmFsdWUnXHJcbiAgXS5tYXAoYWRkQ3NzUHJlZml4KG9wdGlvbnMuY3NzUHJlZml4IHx8IGRlZmF1bHRDc3NQcmVmaXgpKTtcclxuXHJcblxyXG5cdC8vIERlbGltaXQgcHJvcG9zZWQgdmFsdWVzIGZvciBoYW5kbGUgcG9zaXRpb25zLlxyXG5cdGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAoIGEsIGIsIGRlbGltaXQgKSB7XHJcblxyXG5cdFx0Ly8gQWRkIG1vdmVtZW50IHRvIGN1cnJlbnQgcG9zaXRpb24uXHJcblx0XHR2YXIgYyA9IGEgKyBiWzBdLCBkID0gYSArIGJbMV07XHJcblxyXG5cdFx0Ly8gT25seSBhbHRlciB0aGUgb3RoZXIgcG9zaXRpb24gb24gZHJhZyxcclxuXHRcdC8vIG5vdCBvbiBzdGFuZGFyZCBzbGlkaW5nLlxyXG5cdFx0aWYgKCBkZWxpbWl0ICkge1xyXG5cdFx0XHRpZiAoIGMgPCAwICkge1xyXG5cdFx0XHRcdGQgKz0gTWF0aC5hYnMoYyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCBkID4gMTAwICkge1xyXG5cdFx0XHRcdGMgLT0gKCBkIC0gMTAwICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIExpbWl0IHZhbHVlcyB0byAwIGFuZCAxMDAuXHJcblx0XHRcdHJldHVybiBbbGltaXQoYyksIGxpbWl0KGQpXTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gW2MsZF07XHJcblx0fVxyXG5cclxuXHQvLyBQcm92aWRlIGEgY2xlYW4gZXZlbnQgd2l0aCBzdGFuZGFyZGl6ZWQgb2Zmc2V0IHZhbHVlcy5cclxuXHRmdW5jdGlvbiBmaXhFdmVudCAoIGUsIHBhZ2VPZmZzZXQgKSB7XHJcblxyXG5cdFx0Ly8gUHJldmVudCBzY3JvbGxpbmcgYW5kIHBhbm5pbmcgb24gdG91Y2ggZXZlbnRzLCB3aGlsZVxyXG5cdFx0Ly8gYXR0ZW1wdGluZyB0byBzbGlkZS4gVGhlIHRhcCBldmVudCBhbHNvIGRlcGVuZHMgb24gdGhpcy5cclxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHQvLyBGaWx0ZXIgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSB0eXBlLCB3aGljaCBjYW4gYmVcclxuXHRcdC8vIHRvdWNoLCBtb3VzZSBvciBwb2ludGVyLiBPZmZzZXQgY2hhbmdlcyBuZWVkIHRvIGJlXHJcblx0XHQvLyBtYWRlIG9uIGFuIGV2ZW50IHNwZWNpZmljIGJhc2lzLlxyXG5cdFx0dmFyIHRvdWNoID0gZS50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDAsXHJcblx0XHRcdG1vdXNlID0gZS50eXBlLmluZGV4T2YoJ21vdXNlJykgPT09IDAsXHJcblx0XHRcdHBvaW50ZXIgPSBlLnR5cGUuaW5kZXhPZigncG9pbnRlcicpID09PSAwLFxyXG5cdFx0XHR4LHksIGV2ZW50ID0gZTtcclxuXHJcblx0XHQvLyBJRTEwIGltcGxlbWVudGVkIHBvaW50ZXIgZXZlbnRzIHdpdGggYSBwcmVmaXg7XHJcblx0XHRpZiAoIGUudHlwZS5pbmRleE9mKCdNU1BvaW50ZXInKSA9PT0gMCApIHtcclxuXHRcdFx0cG9pbnRlciA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB0b3VjaCApIHtcclxuXHRcdFx0Ly8gbm9VaVNsaWRlciBzdXBwb3J0cyBvbmUgbW92ZW1lbnQgYXQgYSB0aW1lLFxyXG5cdFx0XHQvLyBzbyB3ZSBjYW4gc2VsZWN0IHRoZSBmaXJzdCAnY2hhbmdlZFRvdWNoJy5cclxuXHRcdFx0eCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVg7XHJcblx0XHRcdHkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhZ2VPZmZzZXQgPSBwYWdlT2Zmc2V0IHx8IGdldFBhZ2VPZmZzZXQoKTtcclxuXHJcblx0XHRpZiAoIG1vdXNlIHx8IHBvaW50ZXIgKSB7XHJcblx0XHRcdHggPSBlLmNsaWVudFggKyBwYWdlT2Zmc2V0Lng7XHJcblx0XHRcdHkgPSBlLmNsaWVudFkgKyBwYWdlT2Zmc2V0Lnk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZXZlbnQucGFnZU9mZnNldCA9IHBhZ2VPZmZzZXQ7XHJcblx0XHRldmVudC5wb2ludHMgPSBbeCwgeV07XHJcblx0XHRldmVudC5jdXJzb3IgPSBtb3VzZSB8fCBwb2ludGVyOyAvLyBGaXggIzQzNVxyXG5cclxuXHRcdHJldHVybiBldmVudDtcclxuXHR9XHJcblxyXG5cdC8vIEFwcGVuZCBhIGhhbmRsZSB0byB0aGUgYmFzZS5cclxuXHRmdW5jdGlvbiBhZGRIYW5kbGUgKCBkaXJlY3Rpb24sIGluZGV4ICkge1xyXG5cclxuXHRcdHZhciBvcmlnaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuXHRcdFx0aGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdGFkZGl0aW9ucyA9IFsgJy1sb3dlcicsICctdXBwZXInIF07XHJcblxyXG5cdFx0aWYgKCBkaXJlY3Rpb24gKSB7XHJcblx0XHRcdGFkZGl0aW9ucy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0YWRkQ2xhc3MoaGFuZGxlLCBjc3NDbGFzc2VzWzNdKTtcclxuXHRcdGFkZENsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1szXSArIGFkZGl0aW9uc1tpbmRleF0pO1xyXG5cclxuXHRcdGFkZENsYXNzKG9yaWdpbiwgY3NzQ2xhc3Nlc1syXSk7XHJcblx0XHRvcmlnaW4uYXBwZW5kQ2hpbGQoaGFuZGxlKTtcclxuXHJcblx0XHRyZXR1cm4gb3JpZ2luO1xyXG5cdH1cclxuXHJcblx0Ly8gQWRkIHRoZSBwcm9wZXIgY29ubmVjdGlvbiBjbGFzc2VzLlxyXG5cdGZ1bmN0aW9uIGFkZENvbm5lY3Rpb24gKCBjb25uZWN0LCB0YXJnZXQsIGhhbmRsZXMgKSB7XHJcblxyXG5cdFx0Ly8gQXBwbHkgdGhlIHJlcXVpcmVkIGNvbm5lY3Rpb24gY2xhc3NlcyB0byB0aGUgZWxlbWVudHNcclxuXHRcdC8vIHRoYXQgbmVlZCB0aGVtLiBTb21lIGNsYXNzZXMgYXJlIG1hZGUgdXAgZm9yIHNldmVyYWxcclxuXHRcdC8vIHNlZ21lbnRzIGxpc3RlZCBpbiB0aGUgY2xhc3MgbGlzdCwgdG8gYWxsb3cgZWFzeVxyXG5cdFx0Ly8gcmVuYW1pbmcgYW5kIHByb3ZpZGUgYSBtaW5vciBjb21wcmVzc2lvbiBiZW5lZml0LlxyXG5cdFx0c3dpdGNoICggY29ubmVjdCApIHtcclxuXHRcdFx0Y2FzZSAxOlx0YWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzddKTtcclxuXHRcdFx0XHRcdGFkZENsYXNzKGhhbmRsZXNbMF0sIGNzc0NsYXNzZXNbNl0pO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgMzogYWRkQ2xhc3MoaGFuZGxlc1sxXSwgY3NzQ2xhc3Nlc1s2XSk7XHJcblx0XHRcdFx0XHQvKiBmYWxscyB0aHJvdWdoICovXHJcblx0XHRcdGNhc2UgMjogYWRkQ2xhc3MoaGFuZGxlc1swXSwgY3NzQ2xhc3Nlc1s3XSk7XHJcblx0XHRcdFx0XHQvKiBmYWxscyB0aHJvdWdoICovXHJcblx0XHRcdGNhc2UgMDogYWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzZdKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQWRkIGhhbmRsZXMgdG8gdGhlIHNsaWRlciBiYXNlLlxyXG5cdGZ1bmN0aW9uIGFkZEhhbmRsZXMgKCBuckhhbmRsZXMsIGRpcmVjdGlvbiwgYmFzZSApIHtcclxuXHJcblx0XHR2YXIgaW5kZXgsIGhhbmRsZXMgPSBbXTtcclxuXHJcblx0XHQvLyBBcHBlbmQgaGFuZGxlcy5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBuckhhbmRsZXM7IGluZGV4ICs9IDEgKSB7XHJcblxyXG5cdFx0XHQvLyBLZWVwIGEgbGlzdCBvZiBhbGwgYWRkZWQgaGFuZGxlcy5cclxuXHRcdFx0aGFuZGxlcy5wdXNoKCBiYXNlLmFwcGVuZENoaWxkKGFkZEhhbmRsZSggZGlyZWN0aW9uLCBpbmRleCApKSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVzO1xyXG5cdH1cclxuXHJcblx0Ly8gSW5pdGlhbGl6ZSBhIHNpbmdsZSBzbGlkZXIuXHJcblx0ZnVuY3Rpb24gYWRkU2xpZGVyICggZGlyZWN0aW9uLCBvcmllbnRhdGlvbiwgdGFyZ2V0ICkge1xyXG5cclxuXHRcdC8vIEFwcGx5IGNsYXNzZXMgYW5kIGRhdGEgdG8gdGhlIHRhcmdldC5cclxuXHRcdGFkZENsYXNzKHRhcmdldCwgY3NzQ2xhc3Nlc1swXSk7XHJcblx0XHRhZGRDbGFzcyh0YXJnZXQsIGNzc0NsYXNzZXNbOCArIGRpcmVjdGlvbl0pO1xyXG5cdFx0YWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzQgKyBvcmllbnRhdGlvbl0pO1xyXG5cclxuXHRcdHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGFkZENsYXNzKGRpdiwgY3NzQ2xhc3Nlc1sxXSk7XHJcblx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQoZGl2KTtcclxuXHRcdHJldHVybiBkaXY7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gYWRkVG9vbHRpcCAoIGhhbmRsZSwgaW5kZXggKSB7XHJcblxyXG5cdFx0aWYgKCAhb3B0aW9ucy50b29sdGlwc1tpbmRleF0gKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBjc3NDbGFzc2VzWzE4XTtcclxuXHRcdHJldHVybiBoYW5kbGUuZmlyc3RDaGlsZC5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZSB0b29sdGlwcyBvcHRpb24gaXMgYSBzaG9ydGhhbmQgZm9yIHVzaW5nIHRoZSAndXBkYXRlJyBldmVudC5cclxuXHRmdW5jdGlvbiB0b29sdGlwcyAoICkge1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5kaXIgKSB7XHJcblx0XHRcdG9wdGlvbnMudG9vbHRpcHMucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRvb2x0aXBzIGFyZSBhZGRlZCB3aXRoIG9wdGlvbnMudG9vbHRpcHMgaW4gb3JpZ2luYWwgb3JkZXIuXHJcblx0XHR2YXIgdGlwcyA9IHNjb3BlX0hhbmRsZXMubWFwKGFkZFRvb2x0aXApO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5kaXIgKSB7XHJcblx0XHRcdHRpcHMucmV2ZXJzZSgpO1xyXG5cdFx0XHRvcHRpb25zLnRvb2x0aXBzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRiaW5kRXZlbnQoJ3VwZGF0ZScsIGZ1bmN0aW9uKGYsIG8sIHIpIHtcclxuXHRcdFx0aWYgKCB0aXBzW29dICkge1xyXG5cdFx0XHRcdHRpcHNbb10uaW5uZXJIVE1MID0gb3B0aW9ucy50b29sdGlwc1tvXSA9PT0gdHJ1ZSA/IGZbb10gOiBvcHRpb25zLnRvb2x0aXBzW29dLnRvKHJbb10pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHRmdW5jdGlvbiBnZXRHcm91cCAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApIHtcclxuXHJcblx0XHQvLyBVc2UgdGhlIHJhbmdlLlxyXG5cdFx0aWYgKCBtb2RlID09PSAncmFuZ2UnIHx8IG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS54VmFsO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggbW9kZSA9PT0gJ2NvdW50JyApIHtcclxuXHJcblx0XHRcdC8vIERpdmlkZSAwIC0gMTAwIGluICdjb3VudCcgcGFydHMuXHJcblx0XHRcdHZhciBzcHJlYWQgPSAoIDEwMCAvICh2YWx1ZXMtMSkgKSwgdiwgaSA9IDA7XHJcblx0XHRcdHZhbHVlcyA9IFtdO1xyXG5cclxuXHRcdFx0Ly8gTGlzdCB0aGVzZSBwYXJ0cyBhbmQgaGF2ZSB0aGVtIGhhbmRsZWQgYXMgJ3Bvc2l0aW9ucycuXHJcblx0XHRcdHdoaWxlICgodj1pKysqc3ByZWFkKSA8PSAxMDAgKSB7XHJcblx0XHRcdFx0dmFsdWVzLnB1c2godik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1vZGUgPSAncG9zaXRpb25zJztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICdwb3NpdGlvbnMnICkge1xyXG5cclxuXHRcdFx0Ly8gTWFwIGFsbCBwZXJjZW50YWdlcyB0byBvbi1yYW5nZSB2YWx1ZXMuXHJcblx0XHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKCB2YWx1ZSApe1xyXG5cdFx0XHRcdHJldHVybiBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHN0ZXBwZWQgPyBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCB2YWx1ZSApIDogdmFsdWUgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBtb2RlID09PSAndmFsdWVzJyApIHtcclxuXHJcblx0XHRcdC8vIElmIHRoZSB2YWx1ZSBtdXN0IGJlIHN0ZXBwZWQsIGl0IG5lZWRzIHRvIGJlIGNvbnZlcnRlZCB0byBhIHBlcmNlbnRhZ2UgZmlyc3QuXHJcblx0XHRcdGlmICggc3RlcHBlZCApIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24oIHZhbHVlICl7XHJcblxyXG5cdFx0XHRcdFx0Ly8gQ29udmVydCB0byBwZXJjZW50YWdlLCBhcHBseSBzdGVwLCByZXR1cm4gdG8gdmFsdWUuXHJcblx0XHRcdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0uZnJvbVN0ZXBwaW5nKCBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCB2YWx1ZSApICkgKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgd2UgY2FuIHNpbXBseSB1c2UgdGhlIHZhbHVlcy5cclxuXHRcdFx0cmV0dXJuIHZhbHVlcztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdlbmVyYXRlU3ByZWFkICggZGVuc2l0eSwgbW9kZSwgZ3JvdXAgKSB7XHJcblxyXG5cdFx0ZnVuY3Rpb24gc2FmZUluY3JlbWVudCh2YWx1ZSwgaW5jcmVtZW50KSB7XHJcblx0XHRcdC8vIEF2b2lkIGZsb2F0aW5nIHBvaW50IHZhcmlhbmNlIGJ5IGRyb3BwaW5nIHRoZSBzbWFsbGVzdCBkZWNpbWFsIHBsYWNlcy5cclxuXHRcdFx0cmV0dXJuICh2YWx1ZSArIGluY3JlbWVudCkudG9GaXhlZCg3KSAvIDE7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG9yaWdpbmFsU3BlY3RydW1EaXJlY3Rpb24gPSBzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24sXHJcblx0XHRcdGluZGV4ZXMgPSB7fSxcclxuXHRcdFx0Zmlyc3RJblJhbmdlID0gc2NvcGVfU3BlY3RydW0ueFZhbFswXSxcclxuXHRcdFx0bGFzdEluUmFuZ2UgPSBzY29wZV9TcGVjdHJ1bS54VmFsW3Njb3BlX1NwZWN0cnVtLnhWYWwubGVuZ3RoLTFdLFxyXG5cdFx0XHRpZ25vcmVGaXJzdCA9IGZhbHNlLFxyXG5cdFx0XHRpZ25vcmVMYXN0ID0gZmFsc2UsXHJcblx0XHRcdHByZXZQY3QgPSAwO1xyXG5cclxuXHRcdC8vIFRoaXMgZnVuY3Rpb24gbG9vcHMgdGhlIHNwZWN0cnVtIGluIGFuIGx0ciBsaW5lYXIgZmFzaGlvbixcclxuXHRcdC8vIHdoaWxlIHRoZSB0b1N0ZXBwaW5nIG1ldGhvZCBpcyBkaXJlY3Rpb24gYXdhcmUuIFRyaWNrIGl0IGludG9cclxuXHRcdC8vIGJlbGlldmluZyBpdCBpcyBsdHIuXHJcblx0XHRzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24gPSAwO1xyXG5cclxuXHRcdC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGdyb3VwLCBzb3J0IGl0IGFuZCBmaWx0ZXIgYXdheSBhbGwgZHVwbGljYXRlcy5cclxuXHRcdGdyb3VwID0gdW5pcXVlKGdyb3VwLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKXsgcmV0dXJuIGEgLSBiOyB9KSk7XHJcblxyXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSByYW5nZSBzdGFydHMgd2l0aCB0aGUgZmlyc3QgZWxlbWVudC5cclxuXHRcdGlmICggZ3JvdXBbMF0gIT09IGZpcnN0SW5SYW5nZSApIHtcclxuXHRcdFx0Z3JvdXAudW5zaGlmdChmaXJzdEluUmFuZ2UpO1xyXG5cdFx0XHRpZ25vcmVGaXJzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTGlrZXdpc2UgZm9yIHRoZSBsYXN0IG9uZS5cclxuXHRcdGlmICggZ3JvdXBbZ3JvdXAubGVuZ3RoIC0gMV0gIT09IGxhc3RJblJhbmdlICkge1xyXG5cdFx0XHRncm91cC5wdXNoKGxhc3RJblJhbmdlKTtcclxuXHRcdFx0aWdub3JlTGFzdCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Z3JvdXAuZm9yRWFjaChmdW5jdGlvbiAoIGN1cnJlbnQsIGluZGV4ICkge1xyXG5cclxuXHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IHN0ZXAgYW5kIHRoZSBsb3dlciArIHVwcGVyIHBvc2l0aW9ucy5cclxuXHRcdFx0dmFyIHN0ZXAsIGksIHEsXHJcblx0XHRcdFx0bG93ID0gY3VycmVudCxcclxuXHRcdFx0XHRoaWdoID0gZ3JvdXBbaW5kZXgrMV0sXHJcblx0XHRcdFx0bmV3UGN0LCBwY3REaWZmZXJlbmNlLCBwY3RQb3MsIHR5cGUsXHJcblx0XHRcdFx0c3RlcHMsIHJlYWxTdGVwcywgc3RlcHNpemU7XHJcblxyXG5cdFx0XHQvLyBXaGVuIHVzaW5nICdzdGVwcycgbW9kZSwgdXNlIHRoZSBwcm92aWRlZCBzdGVwcy5cclxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSdsbCBzdGVwIG9uIHRvIHRoZSBuZXh0IHN1YnJhbmdlLlxyXG5cdFx0XHRpZiAoIG1vZGUgPT09ICdzdGVwcycgKSB7XHJcblx0XHRcdFx0c3RlcCA9IHNjb3BlX1NwZWN0cnVtLnhOdW1TdGVwc1sgaW5kZXggXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRGVmYXVsdCB0byBhICdmdWxsJyBzdGVwLlxyXG5cdFx0XHRpZiAoICFzdGVwICkge1xyXG5cdFx0XHRcdHN0ZXAgPSBoaWdoLWxvdztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gTG93IGNhbiBiZSAwLCBzbyB0ZXN0IGZvciBmYWxzZS4gSWYgaGlnaCBpcyB1bmRlZmluZWQsXHJcblx0XHRcdC8vIHdlIGFyZSBhdCB0aGUgbGFzdCBzdWJyYW5nZS4gSW5kZXggMCBpcyBhbHJlYWR5IGhhbmRsZWQuXHJcblx0XHRcdGlmICggbG93ID09PSBmYWxzZSB8fCBoaWdoID09PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBGaW5kIGFsbCBzdGVwcyBpbiB0aGUgc3VicmFuZ2UuXHJcblx0XHRcdGZvciAoIGkgPSBsb3c7IGkgPD0gaGlnaDsgaSA9IHNhZmVJbmNyZW1lbnQoaSwgc3RlcCkgKSB7XHJcblxyXG5cdFx0XHRcdC8vIEdldCB0aGUgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgc3RlcCxcclxuXHRcdFx0XHQvLyBjYWxjdWxhdGUgdGhlIHNpemUgZm9yIHRoZSBzdWJyYW5nZS5cclxuXHRcdFx0XHRuZXdQY3QgPSBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCBpICk7XHJcblx0XHRcdFx0cGN0RGlmZmVyZW5jZSA9IG5ld1BjdCAtIHByZXZQY3Q7XHJcblxyXG5cdFx0XHRcdHN0ZXBzID0gcGN0RGlmZmVyZW5jZSAvIGRlbnNpdHk7XHJcblx0XHRcdFx0cmVhbFN0ZXBzID0gTWF0aC5yb3VuZChzdGVwcyk7XHJcblxyXG5cdFx0XHRcdC8vIFRoaXMgcmF0aW8gcmVwcmVzZW50cyB0aGUgYW1tb3VudCBvZiBwZXJjZW50YWdlLXNwYWNlIGEgcG9pbnQgaW5kaWNhdGVzLlxyXG5cdFx0XHRcdC8vIEZvciBhIGRlbnNpdHkgMSB0aGUgcG9pbnRzL3BlcmNlbnRhZ2UgPSAxLiBGb3IgZGVuc2l0eSAyLCB0aGF0IHBlcmNlbnRhZ2UgbmVlZHMgdG8gYmUgcmUtZGV2aWRlZC5cclxuXHRcdFx0XHQvLyBSb3VuZCB0aGUgcGVyY2VudGFnZSBvZmZzZXQgdG8gYW4gZXZlbiBudW1iZXIsIHRoZW4gZGl2aWRlIGJ5IHR3b1xyXG5cdFx0XHRcdC8vIHRvIHNwcmVhZCB0aGUgb2Zmc2V0IG9uIGJvdGggc2lkZXMgb2YgdGhlIHJhbmdlLlxyXG5cdFx0XHRcdHN0ZXBzaXplID0gcGN0RGlmZmVyZW5jZS9yZWFsU3RlcHM7XHJcblxyXG5cdFx0XHRcdC8vIERpdmlkZSBhbGwgcG9pbnRzIGV2ZW5seSwgYWRkaW5nIHRoZSBjb3JyZWN0IG51bWJlciB0byB0aGlzIHN1YnJhbmdlLlxyXG5cdFx0XHRcdC8vIFJ1biB1cCB0byA8PSBzbyB0aGF0IDEwMCUgZ2V0cyBhIHBvaW50LCBldmVudCBpZiBpZ25vcmVMYXN0IGlzIHNldC5cclxuXHRcdFx0XHRmb3IgKCBxID0gMTsgcSA8PSByZWFsU3RlcHM7IHEgKz0gMSApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBUaGUgcmF0aW8gYmV0d2VlbiB0aGUgcm91bmRlZCB2YWx1ZSBhbmQgdGhlIGFjdHVhbCBzaXplIG1pZ2h0IGJlIH4xJSBvZmYuXHJcblx0XHRcdFx0XHQvLyBDb3JyZWN0IHRoZSBwZXJjZW50YWdlIG9mZnNldCBieSB0aGUgbnVtYmVyIG9mIHBvaW50c1xyXG5cdFx0XHRcdFx0Ly8gcGVyIHN1YnJhbmdlLiBkZW5zaXR5ID0gMSB3aWxsIHJlc3VsdCBpbiAxMDAgcG9pbnRzIG9uIHRoZVxyXG5cdFx0XHRcdFx0Ly8gZnVsbCByYW5nZSwgMiBmb3IgNTAsIDQgZm9yIDI1LCBldGMuXHJcblx0XHRcdFx0XHRwY3RQb3MgPSBwcmV2UGN0ICsgKCBxICogc3RlcHNpemUgKTtcclxuXHRcdFx0XHRcdGluZGV4ZXNbcGN0UG9zLnRvRml4ZWQoNSldID0gWyd4JywgMF07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBEZXRlcm1pbmUgdGhlIHBvaW50IHR5cGUuXHJcblx0XHRcdFx0dHlwZSA9IChncm91cC5pbmRleE9mKGkpID4gLTEpID8gMSA6ICggbW9kZSA9PT0gJ3N0ZXBzJyA/IDIgOiAwICk7XHJcblxyXG5cdFx0XHRcdC8vIEVuZm9yY2UgdGhlICdpZ25vcmVGaXJzdCcgb3B0aW9uIGJ5IG92ZXJ3cml0aW5nIHRoZSB0eXBlIGZvciAwLlxyXG5cdFx0XHRcdGlmICggIWluZGV4ICYmIGlnbm9yZUZpcnN0ICkge1xyXG5cdFx0XHRcdFx0dHlwZSA9IDA7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoICEoaSA9PT0gaGlnaCAmJiBpZ25vcmVMYXN0KSkge1xyXG5cdFx0XHRcdFx0Ly8gTWFyayB0aGUgJ3R5cGUnIG9mIHRoaXMgcG9pbnQuIDAgPSBwbGFpbiwgMSA9IHJlYWwgdmFsdWUsIDIgPSBzdGVwIHZhbHVlLlxyXG5cdFx0XHRcdFx0aW5kZXhlc1tuZXdQY3QudG9GaXhlZCg1KV0gPSBbaSwgdHlwZV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHBlcmNlbnRhZ2UgY291bnQuXHJcblx0XHRcdFx0cHJldlBjdCA9IG5ld1BjdDtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUmVzZXQgdGhlIHNwZWN0cnVtLlxyXG5cdFx0c2NvcGVfU3BlY3RydW0uZGlyZWN0aW9uID0gb3JpZ2luYWxTcGVjdHJ1bURpcmVjdGlvbjtcclxuXHJcblx0XHRyZXR1cm4gaW5kZXhlcztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZE1hcmtpbmcgKCBzcHJlYWQsIGZpbHRlckZ1bmMsIGZvcm1hdHRlciApIHtcclxuXHJcblx0XHR2YXIgc3R5bGUgPSBbJ2hvcml6b250YWwnLCAndmVydGljYWwnXVtvcHRpb25zLm9ydF0sXHJcblx0XHRcdGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjc3NDbGFzc2VzWzIwXSk7XHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjc3NDbGFzc2VzWzIwXSArICctJyArIHN0eWxlKTtcclxuXHJcblx0XHRmdW5jdGlvbiBnZXRTaXplKCB0eXBlICl7XHJcblx0XHRcdHJldHVybiBbICctbm9ybWFsJywgJy1sYXJnZScsICctc3ViJyBdW3R5cGVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGdldFRhZ3MoIG9mZnNldCwgc291cmNlLCB2YWx1ZXMgKSB7XHJcblx0XHRcdHJldHVybiAnY2xhc3M9XCInICsgc291cmNlICsgJyAnICtcclxuXHRcdFx0XHRzb3VyY2UgKyAnLScgKyBzdHlsZSArICcgJyArXHJcblx0XHRcdFx0c291cmNlICsgZ2V0U2l6ZSh2YWx1ZXNbMV0pICtcclxuXHRcdFx0XHQnXCIgc3R5bGU9XCInICsgb3B0aW9ucy5zdHlsZSArICc6ICcgKyBvZmZzZXQgKyAnJVwiJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBhZGRTcHJlYWQgKCBvZmZzZXQsIHZhbHVlcyApe1xyXG5cclxuXHRcdFx0aWYgKCBzY29wZV9TcGVjdHJ1bS5kaXJlY3Rpb24gKSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gMTAwIC0gb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBBcHBseSB0aGUgZmlsdGVyIGZ1bmN0aW9uLCBpZiBpdCBpcyBzZXQuXHJcblx0XHRcdHZhbHVlc1sxXSA9ICh2YWx1ZXNbMV0gJiYgZmlsdGVyRnVuYykgPyBmaWx0ZXJGdW5jKHZhbHVlc1swXSwgdmFsdWVzWzFdKSA6IHZhbHVlc1sxXTtcclxuXHJcblx0XHRcdC8vIEFkZCBhIG1hcmtlciBmb3IgZXZlcnkgcG9pbnRcclxuXHRcdFx0ZWxlbWVudC5pbm5lckhUTUwgKz0gJzxkaXYgJyArIGdldFRhZ3Mob2Zmc2V0LCBjc3NDbGFzc2VzWzIxXSwgdmFsdWVzKSArICc+PC9kaXY+JztcclxuXHJcblx0XHRcdC8vIFZhbHVlcyBhcmUgb25seSBhcHBlbmRlZCBmb3IgcG9pbnRzIG1hcmtlZCAnMScgb3IgJzInLlxyXG5cdFx0XHRpZiAoIHZhbHVlc1sxXSApIHtcclxuXHRcdFx0XHRlbGVtZW50LmlubmVySFRNTCArPSAnPGRpdiAnK2dldFRhZ3Mob2Zmc2V0LCBjc3NDbGFzc2VzWzIyXSwgdmFsdWVzKSsnPicgKyBmb3JtYXR0ZXIudG8odmFsdWVzWzBdKSArICc8L2Rpdj4nO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGFsbCBwb2ludHMuXHJcblx0XHRPYmplY3Qua2V5cyhzcHJlYWQpLmZvckVhY2goZnVuY3Rpb24oYSl7XHJcblx0XHRcdGFkZFNwcmVhZChhLCBzcHJlYWRbYV0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwaXBzICggZ3JpZCApIHtcclxuXHJcblx0dmFyIG1vZGUgPSBncmlkLm1vZGUsXHJcblx0XHRkZW5zaXR5ID0gZ3JpZC5kZW5zaXR5IHx8IDEsXHJcblx0XHRmaWx0ZXIgPSBncmlkLmZpbHRlciB8fCBmYWxzZSxcclxuXHRcdHZhbHVlcyA9IGdyaWQudmFsdWVzIHx8IGZhbHNlLFxyXG5cdFx0c3RlcHBlZCA9IGdyaWQuc3RlcHBlZCB8fCBmYWxzZSxcclxuXHRcdGdyb3VwID0gZ2V0R3JvdXAoIG1vZGUsIHZhbHVlcywgc3RlcHBlZCApLFxyXG5cdFx0c3ByZWFkID0gZ2VuZXJhdGVTcHJlYWQoIGRlbnNpdHksIG1vZGUsIGdyb3VwICksXHJcblx0XHRmb3JtYXQgPSBncmlkLmZvcm1hdCB8fCB7XHJcblx0XHRcdHRvOiBNYXRoLnJvdW5kXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBzY29wZV9UYXJnZXQuYXBwZW5kQ2hpbGQoYWRkTWFya2luZyhcclxuXHRcdFx0c3ByZWFkLFxyXG5cdFx0XHRmaWx0ZXIsXHJcblx0XHRcdGZvcm1hdFxyXG5cdFx0KSk7XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gU2hvcnRoYW5kIGZvciBiYXNlIGRpbWVuc2lvbnMuXHJcblx0ZnVuY3Rpb24gYmFzZVNpemUgKCApIHtcclxuXHRcdHJldHVybiBzY29wZV9CYXNlWydvZmZzZXQnICsgWydXaWR0aCcsICdIZWlnaHQnXVtvcHRpb25zLm9ydF1dO1xyXG5cdH1cclxuXHJcblx0Ly8gRXh0ZXJuYWwgZXZlbnQgaGFuZGxpbmdcclxuXHRmdW5jdGlvbiBmaXJlRXZlbnQgKCBldmVudCwgaGFuZGxlTnVtYmVyLCB0YXAgKSB7XHJcblxyXG5cdFx0aWYgKCBoYW5kbGVOdW1iZXIgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmhhbmRsZXMgIT09IDEgKSB7XHJcblx0XHRcdGhhbmRsZU51bWJlciA9IE1hdGguYWJzKGhhbmRsZU51bWJlciAtIG9wdGlvbnMuZGlyKTtcclxuXHRcdH1cclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIHRhcmdldEV2ZW50ICkge1xyXG5cclxuXHRcdFx0dmFyIGV2ZW50VHlwZSA9IHRhcmdldEV2ZW50LnNwbGl0KCcuJylbMF07XHJcblxyXG5cdFx0XHRpZiAoIGV2ZW50ID09PSBldmVudFR5cGUgKSB7XHJcblx0XHRcdFx0c2NvcGVfRXZlbnRzW3RhcmdldEV2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuXHRcdFx0XHRcdC8vIC5yZXZlcnNlIGlzIGluIHBsYWNlXHJcblx0XHRcdFx0XHQvLyBSZXR1cm4gdmFsdWVzIGFzIGFycmF5LCBzbyBhcmdfMVthcmdfMl0gaXMgYWx3YXlzIHZhbGlkLlxyXG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChzY29wZV9TZWxmLCBhc0FycmF5KHZhbHVlR2V0KCkpLCBoYW5kbGVOdW1iZXIsIGFzQXJyYXkoaW5TbGlkZXJPcmRlcihBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzY29wZV9WYWx1ZXMpKSksIHRhcCB8fCBmYWxzZSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gUmV0dXJucyB0aGUgaW5wdXQgYXJyYXksIHJlc3BlY3RpbmcgdGhlIHNsaWRlciBkaXJlY3Rpb24gY29uZmlndXJhdGlvbi5cclxuXHRmdW5jdGlvbiBpblNsaWRlck9yZGVyICggdmFsdWVzICkge1xyXG5cclxuXHRcdC8vIElmIG9ubHkgb25lIGhhbmRsZSBpcyB1c2VkLCByZXR1cm4gYSBzaW5nbGUgdmFsdWUuXHJcblx0XHRpZiAoIHZhbHVlcy5sZW5ndGggPT09IDEgKXtcclxuXHRcdFx0cmV0dXJuIHZhbHVlc1swXTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICkge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWVzO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIEhhbmRsZXIgZm9yIGF0dGFjaGluZyBldmVudHMgdHJvdWdoIGEgcHJveHkuXHJcblx0ZnVuY3Rpb24gYXR0YWNoICggZXZlbnRzLCBlbGVtZW50LCBjYWxsYmFjaywgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvICdmaWx0ZXInIGV2ZW50cyB0byB0aGUgc2xpZGVyLlxyXG5cdFx0Ly8gZWxlbWVudCBpcyBhIG5vZGUsIG5vdCBhIG5vZGVMaXN0XHJcblxyXG5cdFx0dmFyIG1ldGhvZCA9IGZ1bmN0aW9uICggZSApe1xyXG5cclxuXHRcdFx0aWYgKCBzY29wZV9UYXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gU3RvcCBpZiBhbiBhY3RpdmUgJ3RhcCcgdHJhbnNpdGlvbiBpcyB0YWtpbmcgcGxhY2UuXHJcblx0XHRcdGlmICggaGFzQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzE0XSkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlID0gZml4RXZlbnQoZSwgZGF0YS5wYWdlT2Zmc2V0KTtcclxuXHJcblx0XHRcdC8vIElnbm9yZSByaWdodCBvciBtaWRkbGUgY2xpY2tzIG9uIHN0YXJ0ICM0NTRcclxuXHRcdFx0aWYgKCBldmVudHMgPT09IGFjdGlvbnMuc3RhcnQgJiYgZS5idXR0b25zICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b25zID4gMSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIElnbm9yZSByaWdodCBvciBtaWRkbGUgY2xpY2tzIG9uIHN0YXJ0ICM0NTRcclxuXHRcdFx0aWYgKCBkYXRhLmhvdmVyICYmIGUuYnV0dG9ucyApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGUuY2FsY1BvaW50ID0gZS5wb2ludHNbIG9wdGlvbnMub3J0IF07XHJcblxyXG5cdFx0XHQvLyBDYWxsIHRoZSBldmVudCBoYW5kbGVyIHdpdGggdGhlIGV2ZW50IFsgYW5kIGFkZGl0aW9uYWwgZGF0YSBdLlxyXG5cdFx0XHRjYWxsYmFjayAoIGUsIGRhdGEgKTtcclxuXHJcblx0XHR9LCBtZXRob2RzID0gW107XHJcblxyXG5cdFx0Ly8gQmluZCBhIGNsb3N1cmUgb24gdGhlIHRhcmdldCBmb3IgZXZlcnkgZXZlbnQgdHlwZS5cclxuXHRcdGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24oIGV2ZW50TmFtZSApe1xyXG5cdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBtZXRob2QsIGZhbHNlKTtcclxuXHRcdFx0bWV0aG9kcy5wdXNoKFtldmVudE5hbWUsIG1ldGhvZF0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIG1ldGhvZHM7XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGUgbW92ZW1lbnQgb24gZG9jdW1lbnQgZm9yIGhhbmRsZSBhbmQgcmFuZ2UgZHJhZy5cclxuXHRmdW5jdGlvbiBtb3ZlICggZXZlbnQsIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gRml4ICM0OThcclxuXHRcdC8vIENoZWNrIHZhbHVlIG9mIC5idXR0b25zIGluICdzdGFydCcgdG8gd29yayBhcm91bmQgYSBidWcgaW4gSUUxMCBtb2JpbGUgKGRhdGEuYnV0dG9uc1Byb3BlcnR5KS5cclxuXHRcdC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvOTI3MDA1L21vYmlsZS1pZTEwLXdpbmRvd3MtcGhvbmUtYnV0dG9ucy1wcm9wZXJ0eS1vZi1wb2ludGVybW92ZS1ldmVudC1hbHdheXMtemVyb1xyXG5cdFx0Ly8gSUU5IGhhcyAuYnV0dG9ucyBhbmQgLndoaWNoIHplcm8gb24gbW91c2Vtb3ZlLlxyXG5cdFx0Ly8gRmlyZWZveCBicmVha3MgdGhlIHNwZWMgTUROIGRlZmluZXMuXHJcblx0XHRpZiAoIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoXCJNU0lFIDlcIikgPT09IC0xICYmIGV2ZW50LmJ1dHRvbnMgPT09IDAgJiYgZGF0YS5idXR0b25zUHJvcGVydHkgIT09IDAgKSB7XHJcblx0XHRcdHJldHVybiBlbmQoZXZlbnQsIGRhdGEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBoYW5kbGVzID0gZGF0YS5oYW5kbGVzIHx8IHNjb3BlX0hhbmRsZXMsIHBvc2l0aW9ucywgc3RhdGUgPSBmYWxzZSxcclxuXHRcdFx0cHJvcG9zYWwgPSAoKGV2ZW50LmNhbGNQb2ludCAtIGRhdGEuc3RhcnQpICogMTAwKSAvIGRhdGEuYmFzZVNpemUsXHJcblx0XHRcdGhhbmRsZU51bWJlciA9IGhhbmRsZXNbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAwIDogMSwgaTtcclxuXHJcblx0XHQvLyBDYWxjdWxhdGUgcmVsYXRpdmUgcG9zaXRpb25zIGZvciB0aGUgaGFuZGxlcy5cclxuXHRcdHBvc2l0aW9ucyA9IGdldFBvc2l0aW9ucyggcHJvcG9zYWwsIGRhdGEucG9zaXRpb25zLCBoYW5kbGVzLmxlbmd0aCA+IDEpO1xyXG5cclxuXHRcdHN0YXRlID0gc2V0SGFuZGxlICggaGFuZGxlc1swXSwgcG9zaXRpb25zW2hhbmRsZU51bWJlcl0sIGhhbmRsZXMubGVuZ3RoID09PSAxICk7XHJcblxyXG5cdFx0aWYgKCBoYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblxyXG5cdFx0XHRzdGF0ZSA9IHNldEhhbmRsZSAoIGhhbmRsZXNbMV0sIHBvc2l0aW9uc1toYW5kbGVOdW1iZXI/MDoxXSwgZmFsc2UgKSB8fCBzdGF0ZTtcclxuXHJcblx0XHRcdGlmICggc3RhdGUgKSB7XHJcblx0XHRcdFx0Ly8gZmlyZSBmb3IgYm90aCBoYW5kbGVzXHJcblx0XHRcdFx0Zm9yICggaSA9IDA7IGkgPCBkYXRhLmhhbmRsZXMubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRcdFx0XHRmaXJlRXZlbnQoJ3NsaWRlJywgaSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKCBzdGF0ZSApIHtcclxuXHRcdFx0Ly8gRmlyZSBmb3IgYSBzaW5nbGUgaGFuZGxlXHJcblx0XHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVW5iaW5kIG1vdmUgZXZlbnRzIG9uIGRvY3VtZW50LCBjYWxsIGNhbGxiYWNrcy5cclxuXHRmdW5jdGlvbiBlbmQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHQvLyBUaGUgaGFuZGxlIGlzIG5vIGxvbmdlciBhY3RpdmUsIHNvIHJlbW92ZSB0aGUgY2xhc3MuXHJcblx0XHR2YXIgYWN0aXZlID0gc2NvcGVfQmFzZS5xdWVyeVNlbGVjdG9yKCAnLicgKyBjc3NDbGFzc2VzWzE1XSApLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXIgPSBkYXRhLmhhbmRsZXNbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAwIDogMTtcclxuXHJcblx0XHRpZiAoIGFjdGl2ZSAhPT0gbnVsbCApIHtcclxuXHRcdFx0cmVtb3ZlQ2xhc3MoYWN0aXZlLCBjc3NDbGFzc2VzWzE1XSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUmVtb3ZlIGN1cnNvciBzdHlsZXMgYW5kIHRleHQtc2VsZWN0aW9uIGV2ZW50cyBib3VuZCB0byB0aGUgYm9keS5cclxuXHRcdGlmICggZXZlbnQuY3Vyc29yICkge1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICcnO1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZG9jdW1lbnQuYm9keS5ub1VpTGlzdGVuZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuXHRcdC8vIFVuYmluZCB0aGUgbW92ZSBhbmQgZW5kIGV2ZW50cywgd2hpY2ggYXJlIGFkZGVkIG9uICdzdGFydCcuXHJcblx0XHRkLm5vVWlMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiggYyApIHtcclxuXHRcdFx0ZC5yZW1vdmVFdmVudExpc3RlbmVyKGNbMF0sIGNbMV0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUmVtb3ZlIGRyYWdnaW5nIGNsYXNzLlxyXG5cdFx0cmVtb3ZlQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzEyXSk7XHJcblxyXG5cdFx0Ly8gRmlyZSB0aGUgY2hhbmdlIGFuZCBzZXQgZXZlbnRzLlxyXG5cdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIpO1xyXG5cdFx0ZmlyZUV2ZW50KCdjaGFuZ2UnLCBoYW5kbGVOdW1iZXIpO1xyXG5cclxuXHRcdC8vIElmIHRoaXMgaXMgYSBzdGFuZGFyZCBoYW5kbGUgbW92ZW1lbnQsIGZpcmUgdGhlIGVuZCBldmVudC5cclxuXHRcdGlmICggZGF0YS5oYW5kbGVOdW1iZXIgIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0ZmlyZUV2ZW50KCdlbmQnLCBkYXRhLmhhbmRsZU51bWJlcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBGaXJlICdlbmQnIHdoZW4gYSBtb3VzZSBvciBwZW4gbGVhdmVzIHRoZSBkb2N1bWVudC5cclxuXHRmdW5jdGlvbiBkb2N1bWVudExlYXZlICggZXZlbnQsIGRhdGEgKSB7XHJcblx0XHRpZiAoIGV2ZW50LnR5cGUgPT09IFwibW91c2VvdXRcIiAmJiBldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSFRNTFwiICYmIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPT09IG51bGwgKXtcclxuXHRcdFx0ZW5kICggZXZlbnQsIGRhdGEgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEJpbmQgbW92ZSBldmVudHMgb24gZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gc3RhcnQgKCBldmVudCwgZGF0YSApIHtcclxuXHJcblx0XHR2YXIgZCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHJcblx0XHQvLyBNYXJrIHRoZSBoYW5kbGUgYXMgJ2FjdGl2ZScgc28gaXQgY2FuIGJlIHN0eWxlZC5cclxuXHRcdGlmICggZGF0YS5oYW5kbGVzLmxlbmd0aCA9PT0gMSApIHtcclxuXHRcdFx0YWRkQ2xhc3MoZGF0YS5oYW5kbGVzWzBdLmNoaWxkcmVuWzBdLCBjc3NDbGFzc2VzWzE1XSk7XHJcblxyXG5cdFx0XHQvLyBTdXBwb3J0ICdkaXNhYmxlZCcgaGFuZGxlc1xyXG5cdFx0XHRpZiAoIGRhdGEuaGFuZGxlc1swXS5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRml4ICM1NTEsIHdoZXJlIGEgaGFuZGxlIGdldHMgc2VsZWN0ZWQgaW5zdGVhZCBvZiBkcmFnZ2VkLlxyXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHQvLyBBIGRyYWcgc2hvdWxkIG5ldmVyIHByb3BhZ2F0ZSB1cCB0byB0aGUgJ3RhcCcgZXZlbnQuXHJcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHQvLyBBdHRhY2ggdGhlIG1vdmUgYW5kIGVuZCBldmVudHMuXHJcblx0XHR2YXIgbW92ZUV2ZW50ID0gYXR0YWNoKGFjdGlvbnMubW92ZSwgZCwgbW92ZSwge1xyXG5cdFx0XHRzdGFydDogZXZlbnQuY2FsY1BvaW50LFxyXG5cdFx0XHRiYXNlU2l6ZTogYmFzZVNpemUoKSxcclxuXHRcdFx0cGFnZU9mZnNldDogZXZlbnQucGFnZU9mZnNldCxcclxuXHRcdFx0aGFuZGxlczogZGF0YS5oYW5kbGVzLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXI6IGRhdGEuaGFuZGxlTnVtYmVyLFxyXG5cdFx0XHRidXR0b25zUHJvcGVydHk6IGV2ZW50LmJ1dHRvbnMsXHJcblx0XHRcdHBvc2l0aW9uczogW1xyXG5cdFx0XHRcdHNjb3BlX0xvY2F0aW9uc1swXSxcclxuXHRcdFx0XHRzY29wZV9Mb2NhdGlvbnNbc2NvcGVfSGFuZGxlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRdXHJcblx0XHR9KSwgZW5kRXZlbnQgPSBhdHRhY2goYWN0aW9ucy5lbmQsIGQsIGVuZCwge1xyXG5cdFx0XHRoYW5kbGVzOiBkYXRhLmhhbmRsZXMsXHJcblx0XHRcdGhhbmRsZU51bWJlcjogZGF0YS5oYW5kbGVOdW1iZXJcclxuXHRcdH0pO1xyXG5cclxuXHRcdHZhciBvdXRFdmVudCA9IGF0dGFjaChcIm1vdXNlb3V0XCIsIGQsIGRvY3VtZW50TGVhdmUsIHtcclxuXHRcdFx0aGFuZGxlczogZGF0YS5oYW5kbGVzLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXI6IGRhdGEuaGFuZGxlTnVtYmVyXHJcblx0XHR9KTtcclxuXHJcblx0XHRkLm5vVWlMaXN0ZW5lcnMgPSBtb3ZlRXZlbnQuY29uY2F0KGVuZEV2ZW50LCBvdXRFdmVudCk7XHJcblxyXG5cdFx0Ly8gVGV4dCBzZWxlY3Rpb24gaXNuJ3QgYW4gaXNzdWUgb24gdG91Y2ggZGV2aWNlcyxcclxuXHRcdC8vIHNvIGFkZGluZyBjdXJzb3Igc3R5bGVzIGNhbiBiZSBza2lwcGVkLlxyXG5cdFx0aWYgKCBldmVudC5jdXJzb3IgKSB7XHJcblxyXG5cdFx0XHQvLyBQcmV2ZW50IHRoZSAnSScgY3Vyc29yIGFuZCBleHRlbmQgdGhlIHJhbmdlLWRyYWcgY3Vyc29yLlxyXG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5jdXJzb3I7XHJcblxyXG5cdFx0XHQvLyBNYXJrIHRoZSB0YXJnZXQgd2l0aCBhIGRyYWdnaW5nIHN0YXRlLlxyXG5cdFx0XHRpZiAoIHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSApIHtcclxuXHRcdFx0XHRhZGRDbGFzcyhzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTJdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGYgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGRvY3VtZW50LmJvZHkubm9VaUxpc3RlbmVyID0gZjtcclxuXHJcblx0XHRcdC8vIFByZXZlbnQgdGV4dCBzZWxlY3Rpb24gd2hlbiBkcmFnZ2luZyB0aGUgaGFuZGxlcy5cclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGYsIGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIGRhdGEuaGFuZGxlTnVtYmVyICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgnc3RhcnQnLCBkYXRhLmhhbmRsZU51bWJlcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBNb3ZlIGNsb3Nlc3QgaGFuZGxlIHRvIHRhcHBlZCBsb2NhdGlvbi5cclxuXHRmdW5jdGlvbiB0YXAgKCBldmVudCApIHtcclxuXHJcblx0XHR2YXIgbG9jYXRpb24gPSBldmVudC5jYWxjUG9pbnQsIHRvdGFsID0gMCwgaGFuZGxlTnVtYmVyLCB0bztcclxuXHJcblx0XHQvLyBUaGUgdGFwIGV2ZW50IHNob3VsZG4ndCBwcm9wYWdhdGUgdXAgYW5kIGNhdXNlICdlZGdlJyB0byBydW4uXHJcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcblx0XHQvLyBBZGQgdXAgdGhlIGhhbmRsZSBvZmZzZXRzLlxyXG5cdFx0c2NvcGVfSGFuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xyXG5cdFx0XHR0b3RhbCArPSBvZmZzZXQoYSlbIG9wdGlvbnMuc3R5bGUgXTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEZpbmQgdGhlIGhhbmRsZSBjbG9zZXN0IHRvIHRoZSB0YXBwZWQgcG9zaXRpb24uXHJcblx0XHRoYW5kbGVOdW1iZXIgPSAoIGxvY2F0aW9uIDwgdG90YWwvMiB8fCBzY29wZV9IYW5kbGVzLmxlbmd0aCA9PT0gMSApID8gMCA6IDE7XHJcblxyXG5cdFx0bG9jYXRpb24gLT0gb2Zmc2V0KHNjb3BlX0Jhc2UpWyBvcHRpb25zLnN0eWxlIF07XHJcblxyXG5cdFx0Ly8gQ2FsY3VsYXRlIHRoZSBuZXcgcG9zaXRpb24uXHJcblx0XHR0byA9ICggbG9jYXRpb24gKiAxMDAgKSAvIGJhc2VTaXplKCk7XHJcblxyXG5cdFx0aWYgKCAhb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0Ly8gRmxhZyB0aGUgc2xpZGVyIGFzIGl0IGlzIG5vdyBpbiBhIHRyYW5zaXRpb25hbCBzdGF0ZS5cclxuXHRcdFx0Ly8gVHJhbnNpdGlvbiB0YWtlcyAzMDAgbXMsIHNvIHJlLWVuYWJsZSB0aGUgc2xpZGVyIGFmdGVyd2FyZHMuXHJcblx0XHRcdGFkZENsYXNzRm9yKCBzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTRdLCAzMDAgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdXBwb3J0ICdkaXNhYmxlZCcgaGFuZGxlc1xyXG5cdFx0aWYgKCBzY29wZV9IYW5kbGVzW2hhbmRsZU51bWJlcl0uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmluZCB0aGUgY2xvc2VzdCBoYW5kbGUgYW5kIGNhbGN1bGF0ZSB0aGUgdGFwcGVkIHBvaW50LlxyXG5cdFx0Ly8gVGhlIHNldCBoYW5kbGUgdG8gdGhlIG5ldyBwb3NpdGlvbi5cclxuXHRcdHNldEhhbmRsZSggc2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdLCB0byApO1xyXG5cclxuXHRcdGZpcmVFdmVudCgnc2xpZGUnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdzZXQnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cdFx0ZmlyZUV2ZW50KCdjaGFuZ2UnLCBoYW5kbGVOdW1iZXIsIHRydWUpO1xyXG5cclxuXHRcdGlmICggb3B0aW9ucy5ldmVudHMuc25hcCApIHtcclxuXHRcdFx0c3RhcnQoZXZlbnQsIHsgaGFuZGxlczogW3Njb3BlX0hhbmRsZXNbaGFuZGxlTnVtYmVyXV0gfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBGaXJlcyBhICdob3ZlcicgZXZlbnQgZm9yIGEgaG92ZXJlZCBtb3VzZS9wZW4gcG9zaXRpb24uXHJcblx0ZnVuY3Rpb24gaG92ZXIgKCBldmVudCApIHtcclxuXHJcblx0XHR2YXIgbG9jYXRpb24gPSBldmVudC5jYWxjUG9pbnQgLSBvZmZzZXQoc2NvcGVfQmFzZSlbIG9wdGlvbnMuc3R5bGUgXSxcclxuXHRcdFx0dG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCggbG9jYXRpb24gKiAxMDAgKSAvIGJhc2VTaXplKCkpLFxyXG5cdFx0XHR2YWx1ZSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggdG8gKTtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIHRhcmdldEV2ZW50ICkge1xyXG5cdFx0XHRpZiAoICdob3ZlcicgPT09IHRhcmdldEV2ZW50LnNwbGl0KCcuJylbMF0gKSB7XHJcblx0XHRcdFx0c2NvcGVfRXZlbnRzW3RhcmdldEV2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIHNjb3BlX1NlbGYsIHZhbHVlICk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gQXR0YWNoIGV2ZW50cyB0byBzZXZlcmFsIHNsaWRlciBwYXJ0cy5cclxuXHRmdW5jdGlvbiBldmVudHMgKCBiZWhhdmlvdXIgKSB7XHJcblxyXG5cdFx0dmFyIGksIGRyYWc7XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSBzdGFuZGFyZCBkcmFnIGV2ZW50IHRvIHRoZSBoYW5kbGVzLlxyXG5cdFx0aWYgKCAhYmVoYXZpb3VyLmZpeGVkICkge1xyXG5cclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBzY29wZV9IYW5kbGVzLmxlbmd0aDsgaSArPSAxICkge1xyXG5cclxuXHRcdFx0XHQvLyBUaGVzZSBldmVudHMgYXJlIG9ubHkgYm91bmQgdG8gdGhlIHZpc3VhbCBoYW5kbGVcclxuXHRcdFx0XHQvLyBlbGVtZW50LCBub3QgdGhlICdyZWFsJyBvcmlnaW4gZWxlbWVudC5cclxuXHRcdFx0XHRhdHRhY2ggKCBhY3Rpb25zLnN0YXJ0LCBzY29wZV9IYW5kbGVzW2ldLmNoaWxkcmVuWzBdLCBzdGFydCwge1xyXG5cdFx0XHRcdFx0aGFuZGxlczogWyBzY29wZV9IYW5kbGVzW2ldIF0sXHJcblx0XHRcdFx0XHRoYW5kbGVOdW1iZXI6IGlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEF0dGFjaCB0aGUgdGFwIGV2ZW50IHRvIHRoZSBzbGlkZXIgYmFzZS5cclxuXHRcdGlmICggYmVoYXZpb3VyLnRhcCApIHtcclxuXHJcblx0XHRcdGF0dGFjaCAoIGFjdGlvbnMuc3RhcnQsIHNjb3BlX0Jhc2UsIHRhcCwge1xyXG5cdFx0XHRcdGhhbmRsZXM6IHNjb3BlX0hhbmRsZXNcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmlyZSBob3ZlciBldmVudHNcclxuXHRcdGlmICggYmVoYXZpb3VyLmhvdmVyICkge1xyXG5cdFx0XHRhdHRhY2ggKCBhY3Rpb25zLm1vdmUsIHNjb3BlX0Jhc2UsIGhvdmVyLCB7IGhvdmVyOiB0cnVlIH0gKTtcclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBzY29wZV9IYW5kbGVzLmxlbmd0aDsgaSArPSAxICkge1xyXG5cdFx0XHRcdFsnbW91c2Vtb3ZlIE1TUG9pbnRlck1vdmUgcG9pbnRlcm1vdmUnXS5mb3JFYWNoKGZ1bmN0aW9uKCBldmVudE5hbWUgKXtcclxuXHRcdFx0XHRcdHNjb3BlX0hhbmRsZXNbaV0uY2hpbGRyZW5bMF0uYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHN0b3BQcm9wYWdhdGlvbiwgZmFsc2UpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTWFrZSB0aGUgcmFuZ2UgZHJhZ2dhYmxlLlxyXG5cdFx0aWYgKCBiZWhhdmlvdXIuZHJhZyApe1xyXG5cclxuXHRcdFx0ZHJhZyA9IFtzY29wZV9CYXNlLnF1ZXJ5U2VsZWN0b3IoICcuJyArIGNzc0NsYXNzZXNbN10gKV07XHJcblx0XHRcdGFkZENsYXNzKGRyYWdbMF0sIGNzc0NsYXNzZXNbMTBdKTtcclxuXHJcblx0XHRcdC8vIFdoZW4gdGhlIHJhbmdlIGlzIGZpeGVkLCB0aGUgZW50aXJlIHJhbmdlIGNhblxyXG5cdFx0XHQvLyBiZSBkcmFnZ2VkIGJ5IHRoZSBoYW5kbGVzLiBUaGUgaGFuZGxlIGluIHRoZSBmaXJzdFxyXG5cdFx0XHQvLyBvcmlnaW4gd2lsbCBwcm9wYWdhdGUgdGhlIHN0YXJ0IGV2ZW50IHVwd2FyZCxcclxuXHRcdFx0Ly8gYnV0IGl0IG5lZWRzIHRvIGJlIGJvdW5kIG1hbnVhbGx5IG9uIHRoZSBvdGhlci5cclxuXHRcdFx0aWYgKCBiZWhhdmlvdXIuZml4ZWQgKSB7XHJcblx0XHRcdFx0ZHJhZy5wdXNoKHNjb3BlX0hhbmRsZXNbKGRyYWdbMF0gPT09IHNjb3BlX0hhbmRsZXNbMF0gPyAxIDogMCldLmNoaWxkcmVuWzBdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZHJhZy5mb3JFYWNoKGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRcdGF0dGFjaCAoIGFjdGlvbnMuc3RhcnQsIGVsZW1lbnQsIHN0YXJ0LCB7XHJcblx0XHRcdFx0XHRoYW5kbGVzOiBzY29wZV9IYW5kbGVzXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG5cdC8vIFRlc3Qgc3VnZ2VzdGVkIHZhbHVlcyBhbmQgYXBwbHkgbWFyZ2luLCBzdGVwLlxyXG5cdGZ1bmN0aW9uIHNldEhhbmRsZSAoIGhhbmRsZSwgdG8sIG5vTGltaXRPcHRpb24gKSB7XHJcblxyXG5cdFx0dmFyIHRyaWdnZXIgPSBoYW5kbGUgIT09IHNjb3BlX0hhbmRsZXNbMF0gPyAxIDogMCxcclxuXHRcdFx0bG93ZXJNYXJnaW4gPSBzY29wZV9Mb2NhdGlvbnNbMF0gKyBvcHRpb25zLm1hcmdpbixcclxuXHRcdFx0dXBwZXJNYXJnaW4gPSBzY29wZV9Mb2NhdGlvbnNbMV0gLSBvcHRpb25zLm1hcmdpbixcclxuXHRcdFx0bG93ZXJMaW1pdCA9IHNjb3BlX0xvY2F0aW9uc1swXSArIG9wdGlvbnMubGltaXQsXHJcblx0XHRcdHVwcGVyTGltaXQgPSBzY29wZV9Mb2NhdGlvbnNbMV0gLSBvcHRpb25zLmxpbWl0O1xyXG5cclxuXHRcdC8vIEZvciBzbGlkZXJzIHdpdGggbXVsdGlwbGUgaGFuZGxlcyxcclxuXHRcdC8vIGxpbWl0IG1vdmVtZW50IHRvIHRoZSBvdGhlciBoYW5kbGUuXHJcblx0XHQvLyBBcHBseSB0aGUgbWFyZ2luIG9wdGlvbiBieSBhZGRpbmcgaXQgdG8gdGhlIGhhbmRsZSBwb3NpdGlvbnMuXHJcblx0XHRpZiAoIHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSApIHtcclxuXHRcdFx0dG8gPSB0cmlnZ2VyID8gTWF0aC5tYXgoIHRvLCBsb3dlck1hcmdpbiApIDogTWF0aC5taW4oIHRvLCB1cHBlck1hcmdpbiApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBsaW1pdCBvcHRpb24gaGFzIHRoZSBvcHBvc2l0ZSBlZmZlY3QsIGxpbWl0aW5nIGhhbmRsZXMgdG8gYVxyXG5cdFx0Ly8gbWF4aW11bSBkaXN0YW5jZSBmcm9tIGFub3RoZXIuIExpbWl0IG11c3QgYmUgPiAwLCBhcyBvdGhlcndpc2VcclxuXHRcdC8vIGhhbmRsZXMgd291bGQgYmUgdW5tb3ZlYWJsZS4gJ25vTGltaXRPcHRpb24nIGlzIHNldCB0byAnZmFsc2UnXHJcblx0XHQvLyBmb3IgdGhlIC52YWwoKSBtZXRob2QsIGV4Y2VwdCBmb3IgcGFzcyA0LzQuXHJcblx0XHRpZiAoIG5vTGltaXRPcHRpb24gIT09IGZhbHNlICYmIG9wdGlvbnMubGltaXQgJiYgc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxICkge1xyXG5cdFx0XHR0byA9IHRyaWdnZXIgPyBNYXRoLm1pbiAoIHRvLCBsb3dlckxpbWl0ICkgOiBNYXRoLm1heCggdG8sIHVwcGVyTGltaXQgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBIYW5kbGUgdGhlIHN0ZXAgb3B0aW9uLlxyXG5cdFx0dG8gPSBzY29wZV9TcGVjdHJ1bS5nZXRTdGVwKCB0byApO1xyXG5cclxuXHRcdC8vIExpbWl0IHRvIDAvMTAwIGZvciAudmFsIGlucHV0LCB0cmltIGFueXRoaW5nIGJleW9uZCA3IGRpZ2l0cywgYXNcclxuXHRcdC8vIEphdmFTY3JpcHQgaGFzIHNvbWUgaXNzdWVzIGluIGl0cyBmbG9hdGluZyBwb2ludCBpbXBsZW1lbnRhdGlvbi5cclxuXHRcdHRvID0gbGltaXQocGFyc2VGbG9hdCh0by50b0ZpeGVkKDcpKSk7XHJcblxyXG5cdFx0Ly8gUmV0dXJuIGZhbHNlIGlmIGhhbmRsZSBjYW4ndCBtb3ZlXHJcblx0XHRpZiAoIHRvID09PSBzY29wZV9Mb2NhdGlvbnNbdHJpZ2dlcl0gKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZXQgdGhlIGhhbmRsZSB0byB0aGUgbmV3IHBvc2l0aW9uLlxyXG5cdFx0Ly8gVXNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBmb3IgZWZmaWNpZW50IHBhaW50aW5nLlxyXG5cdFx0Ly8gTm8gc2lnbmlmaWNhbnQgZWZmZWN0IGluIENocm9tZSwgRWRnZSBzZWVzIGRyYW1hdGljXHJcblx0XHQvLyBwZXJmb3JtYWNlIGltcHJvdmVtZW50cy5cclxuXHRcdGlmICggd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSApIHtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGhhbmRsZS5zdHlsZVtvcHRpb25zLnN0eWxlXSA9IHRvICsgJyUnO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGhhbmRsZS5zdHlsZVtvcHRpb25zLnN0eWxlXSA9IHRvICsgJyUnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZvcmNlIHByb3BlciBoYW5kbGUgc3RhY2tpbmdcclxuXHRcdGlmICggIWhhbmRsZS5wcmV2aW91c1NpYmxpbmcgKSB7XHJcblx0XHRcdHJlbW92ZUNsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1sxN10pO1xyXG5cdFx0XHRpZiAoIHRvID4gNTAgKSB7XHJcblx0XHRcdFx0YWRkQ2xhc3MoaGFuZGxlLCBjc3NDbGFzc2VzWzE3XSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBVcGRhdGUgbG9jYXRpb25zLlxyXG5cdFx0c2NvcGVfTG9jYXRpb25zW3RyaWdnZXJdID0gdG87XHJcblxyXG5cdFx0Ly8gQ29udmVydCB0aGUgdmFsdWUgdG8gdGhlIHNsaWRlciBzdGVwcGluZy9yYW5nZS5cclxuXHRcdHNjb3BlX1ZhbHVlc1t0cmlnZ2VyXSA9IHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggdG8gKTtcclxuXHJcblx0XHRmaXJlRXZlbnQoJ3VwZGF0ZScsIHRyaWdnZXIpO1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gTG9vcCB2YWx1ZXMgZnJvbSB2YWx1ZSBtZXRob2QgYW5kIGFwcGx5IHRoZW0uXHJcblx0ZnVuY3Rpb24gc2V0VmFsdWVzICggY291bnQsIHZhbHVlcyApIHtcclxuXHJcblx0XHR2YXIgaSwgdHJpZ2dlciwgdG87XHJcblxyXG5cdFx0Ly8gV2l0aCB0aGUgbGltaXQgb3B0aW9uLCB3ZSdsbCBuZWVkIGFub3RoZXIgbGltaXRpbmcgcGFzcy5cclxuXHRcdGlmICggb3B0aW9ucy5saW1pdCApIHtcclxuXHRcdFx0Y291bnQgKz0gMTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaGFuZGxlcyB0byBiZSBzZXQgcnVuIHRoZSBzZXR0aW5nXHJcblx0XHQvLyBtZWNoYW5pc20gdHdpY2UgZm9yIHRoZSBmaXJzdCBoYW5kbGUsIHRvIG1ha2Ugc3VyZSBpdFxyXG5cdFx0Ly8gY2FuIGJlIGJvdW5jZWQgb2YgdGhlIHNlY29uZCBvbmUgcHJvcGVybHkuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IGNvdW50OyBpICs9IDEgKSB7XHJcblxyXG5cdFx0XHR0cmlnZ2VyID0gaSUyO1xyXG5cclxuXHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IGFyZ3VtZW50IGZyb20gdGhlIGFycmF5LlxyXG5cdFx0XHR0byA9IHZhbHVlc1t0cmlnZ2VyXTtcclxuXHJcblx0XHRcdC8vIFNldHRpbmcgd2l0aCBudWxsIGluZGljYXRlcyBhbiAnaWdub3JlJy5cclxuXHRcdFx0Ly8gSW5wdXR0aW5nICdmYWxzZScgaXMgaW52YWxpZC5cclxuXHRcdFx0aWYgKCB0byAhPT0gbnVsbCAmJiB0byAhPT0gZmFsc2UgKSB7XHJcblxyXG5cdFx0XHRcdC8vIElmIGEgZm9ybWF0dGVkIG51bWJlciB3YXMgcGFzc2VkLCBhdHRlbXQgdG8gZGVjb2RlIGl0LlxyXG5cdFx0XHRcdGlmICggdHlwZW9mIHRvID09PSAnbnVtYmVyJyApIHtcclxuXHRcdFx0XHRcdHRvID0gU3RyaW5nKHRvKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRvID0gb3B0aW9ucy5mb3JtYXQuZnJvbSggdG8gKTtcclxuXHJcblx0XHRcdFx0Ly8gUmVxdWVzdCBhbiB1cGRhdGUgZm9yIGFsbCBsaW5rcyBpZiB0aGUgdmFsdWUgd2FzIGludmFsaWQuXHJcblx0XHRcdFx0Ly8gRG8gc28gdG9vIGlmIHNldHRpbmcgdGhlIGhhbmRsZSBmYWlscy5cclxuXHRcdFx0XHRpZiAoIHRvID09PSBmYWxzZSB8fCBpc05hTih0bykgfHwgc2V0SGFuZGxlKCBzY29wZV9IYW5kbGVzW3RyaWdnZXJdLCBzY29wZV9TcGVjdHJ1bS50b1N0ZXBwaW5nKCB0byApLCBpID09PSAoMyAtIG9wdGlvbnMuZGlyKSApID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgdHJpZ2dlcik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZVNldCAoIGlucHV0ICkge1xyXG5cclxuXHRcdHZhciBjb3VudCwgdmFsdWVzID0gYXNBcnJheSggaW5wdXQgKSwgaTtcclxuXHJcblx0XHQvLyBUaGUgUlRMIHNldHRpbmdzIGlzIGltcGxlbWVudGVkIGJ5IHJldmVyc2luZyB0aGUgZnJvbnQtZW5kLFxyXG5cdFx0Ly8gaW50ZXJuYWwgbWVjaGFuaXNtcyBhcmUgdGhlIHNhbWUuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICYmIG9wdGlvbnMuaGFuZGxlcyA+IDEgKSB7XHJcblx0XHRcdHZhbHVlcy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQW5pbWF0aW9uIGlzIG9wdGlvbmFsLlxyXG5cdFx0Ly8gTWFrZSBzdXJlIHRoZSBpbml0aWFsIHZhbHVlcyB3aGVyZSBzZXQgYmVmb3JlIHVzaW5nIGFuaW1hdGVkIHBsYWNlbWVudC5cclxuXHRcdGlmICggb3B0aW9ucy5hbmltYXRlICYmIHNjb3BlX0xvY2F0aW9uc1swXSAhPT0gLTEgKSB7XHJcblx0XHRcdGFkZENsYXNzRm9yKCBzY29wZV9UYXJnZXQsIGNzc0NsYXNzZXNbMTRdLCAzMDAgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBEZXRlcm1pbmUgaG93IG9mdGVuIHRvIHNldCB0aGUgaGFuZGxlcy5cclxuXHRcdGNvdW50ID0gc2NvcGVfSGFuZGxlcy5sZW5ndGggPiAxID8gMyA6IDE7XHJcblxyXG5cdFx0aWYgKCB2YWx1ZXMubGVuZ3RoID09PSAxICkge1xyXG5cdFx0XHRjb3VudCA9IDE7XHJcblx0XHR9XHJcblxyXG5cdFx0c2V0VmFsdWVzICggY291bnQsIHZhbHVlcyApO1xyXG5cclxuXHRcdC8vIEZpcmUgdGhlICdzZXQnIGV2ZW50IGZvciBib3RoIGhhbmRsZXMuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IHNjb3BlX0hhbmRsZXMubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgnc2V0JywgaSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIHNsaWRlciB2YWx1ZS5cclxuXHRmdW5jdGlvbiB2YWx1ZUdldCAoICkge1xyXG5cclxuXHRcdHZhciBpLCByZXRvdXIgPSBbXTtcclxuXHJcblx0XHQvLyBHZXQgdGhlIHZhbHVlIGZyb20gYWxsIGhhbmRsZXMuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IG9wdGlvbnMuaGFuZGxlczsgaSArPSAxICl7XHJcblx0XHRcdHJldG91cltpXSA9IG9wdGlvbnMuZm9ybWF0LnRvKCBzY29wZV9WYWx1ZXNbaV0gKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaW5TbGlkZXJPcmRlciggcmV0b3VyICk7XHJcblx0fVxyXG5cclxuXHQvLyBSZW1vdmVzIGNsYXNzZXMgZnJvbSB0aGUgcm9vdCBhbmQgZW1wdGllcyBpdC5cclxuXHRmdW5jdGlvbiBkZXN0cm95ICggKSB7XHJcblx0XHRjc3NDbGFzc2VzLmZvckVhY2goZnVuY3Rpb24oY2xzKXtcclxuXHRcdFx0aWYgKCAhY2xzICkgeyByZXR1cm47IH0gLy8gSWdub3JlIGVtcHR5IGNsYXNzZXNcclxuXHRcdFx0cmVtb3ZlQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjbHMpO1xyXG5cdFx0fSk7XHJcblx0XHRzY29wZV9UYXJnZXQuaW5uZXJIVE1MID0gJyc7XHJcblx0XHRkZWxldGUgc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXI7XHJcblx0fVxyXG5cclxuXHQvLyBHZXQgdGhlIGN1cnJlbnQgc3RlcCBzaXplIGZvciB0aGUgc2xpZGVyLlxyXG5cdGZ1bmN0aW9uIGdldEN1cnJlbnRTdGVwICggKSB7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgYWxsIGxvY2F0aW9ucywgbWFwIHRoZW0gdG8gdGhlaXIgc3RlcHBpbmcgcG9pbnQuXHJcblx0XHQvLyBHZXQgdGhlIHN0ZXAgcG9pbnQsIHRoZW4gZmluZCBpdCBpbiB0aGUgaW5wdXQgbGlzdC5cclxuXHRcdHZhciByZXRvdXIgPSBzY29wZV9Mb2NhdGlvbnMubWFwKGZ1bmN0aW9uKCBsb2NhdGlvbiwgaW5kZXggKXtcclxuXHJcblx0XHRcdHZhciBzdGVwID0gc2NvcGVfU3BlY3RydW0uZ2V0QXBwbGljYWJsZVN0ZXAoIGxvY2F0aW9uICksXHJcblxyXG5cdFx0XHRcdC8vIEFzIHBlciAjMzkxLCB0aGUgY29tcGFyaXNvbiBmb3IgdGhlIGRlY3JlbWVudCBzdGVwIGNhbiBoYXZlIHNvbWUgcm91bmRpbmcgaXNzdWVzLlxyXG5cdFx0XHRcdC8vIFJvdW5kIHRoZSB2YWx1ZSB0byB0aGUgcHJlY2lzaW9uIHVzZWQgaW4gdGhlIHN0ZXAuXHJcblx0XHRcdFx0c3RlcERlY2ltYWxzID0gY291bnREZWNpbWFscyhTdHJpbmcoc3RlcFsyXSkpLFxyXG5cclxuXHRcdFx0XHQvLyBHZXQgdGhlIGN1cnJlbnQgbnVtZXJpYyB2YWx1ZVxyXG5cdFx0XHRcdHZhbHVlID0gc2NvcGVfVmFsdWVzW2luZGV4XSxcclxuXHJcblx0XHRcdFx0Ly8gVG8gbW92ZSB0aGUgc2xpZGVyICdvbmUgc3RlcCB1cCcsIHRoZSBjdXJyZW50IHN0ZXAgdmFsdWUgbmVlZHMgdG8gYmUgYWRkZWQuXHJcblx0XHRcdFx0Ly8gVXNlIG51bGwgaWYgd2UgYXJlIGF0IHRoZSBtYXhpbXVtIHNsaWRlciB2YWx1ZS5cclxuXHRcdFx0XHRpbmNyZW1lbnQgPSBsb2NhdGlvbiA9PT0gMTAwID8gbnVsbCA6IHN0ZXBbMl0sXHJcblxyXG5cdFx0XHRcdC8vIEdvaW5nICdvbmUgc3RlcCBkb3duJyBtaWdodCBwdXQgdGhlIHNsaWRlciBpbiBhIGRpZmZlcmVudCBzdWItcmFuZ2UsIHNvIHdlXHJcblx0XHRcdFx0Ly8gbmVlZCB0byBzd2l0Y2ggYmV0d2VlbiB0aGUgY3VycmVudCBvciB0aGUgcHJldmlvdXMgc3RlcC5cclxuXHRcdFx0XHRwcmV2ID0gTnVtYmVyKCh2YWx1ZSAtIHN0ZXBbMl0pLnRvRml4ZWQoc3RlcERlY2ltYWxzKSksXHJcblxyXG5cdFx0XHRcdC8vIElmIHRoZSB2YWx1ZSBmaXRzIHRoZSBzdGVwLCByZXR1cm4gdGhlIGN1cnJlbnQgc3RlcCB2YWx1ZS4gT3RoZXJ3aXNlLCB1c2UgdGhlXHJcblx0XHRcdFx0Ly8gcHJldmlvdXMgc3RlcC4gUmV0dXJuIG51bGwgaWYgdGhlIHNsaWRlciBpcyBhdCBpdHMgbWluaW11bSB2YWx1ZS5cclxuXHRcdFx0XHRkZWNyZW1lbnQgPSBsb2NhdGlvbiA9PT0gMCA/IG51bGwgOiAocHJldiA+PSBzdGVwWzFdKSA/IHN0ZXBbMl0gOiAoc3RlcFswXSB8fCBmYWxzZSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gW2RlY3JlbWVudCwgaW5jcmVtZW50XTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJldHVybiB2YWx1ZXMgaW4gdGhlIHByb3BlciBvcmRlci5cclxuXHRcdHJldHVybiBpblNsaWRlck9yZGVyKCByZXRvdXIgKTtcclxuXHR9XHJcblxyXG5cdC8vIEF0dGFjaCBhbiBldmVudCB0byB0aGlzIHNsaWRlciwgcG9zc2libHkgaW5jbHVkaW5nIGEgbmFtZXNwYWNlXHJcblx0ZnVuY3Rpb24gYmluZEV2ZW50ICggbmFtZXNwYWNlZEV2ZW50LCBjYWxsYmFjayApIHtcclxuXHRcdHNjb3BlX0V2ZW50c1tuYW1lc3BhY2VkRXZlbnRdID0gc2NvcGVfRXZlbnRzW25hbWVzcGFjZWRFdmVudF0gfHwgW107XHJcblx0XHRzY29wZV9FdmVudHNbbmFtZXNwYWNlZEV2ZW50XS5wdXNoKGNhbGxiYWNrKTtcclxuXHJcblx0XHQvLyBJZiB0aGUgZXZlbnQgYm91bmQgaXMgJ3VwZGF0ZSwnIGZpcmUgaXQgaW1tZWRpYXRlbHkgZm9yIGFsbCBoYW5kbGVzLlxyXG5cdFx0aWYgKCBuYW1lc3BhY2VkRXZlbnQuc3BsaXQoJy4nKVswXSA9PT0gJ3VwZGF0ZScgKSB7XHJcblx0XHRcdHNjb3BlX0hhbmRsZXMuZm9yRWFjaChmdW5jdGlvbihhLCBpbmRleCl7XHJcblx0XHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBpbmRleCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gVW5kbyBhdHRhY2htZW50IG9mIGV2ZW50XHJcblx0ZnVuY3Rpb24gcmVtb3ZlRXZlbnQgKCBuYW1lc3BhY2VkRXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIGV2ZW50ID0gbmFtZXNwYWNlZEV2ZW50LnNwbGl0KCcuJylbMF0sXHJcblx0XHRcdG5hbWVzcGFjZSA9IG5hbWVzcGFjZWRFdmVudC5zdWJzdHJpbmcoZXZlbnQubGVuZ3RoKTtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhzY29wZV9FdmVudHMpLmZvckVhY2goZnVuY3Rpb24oIGJpbmQgKXtcclxuXHJcblx0XHRcdHZhciB0RXZlbnQgPSBiaW5kLnNwbGl0KCcuJylbMF0sXHJcblx0XHRcdFx0dE5hbWVzcGFjZSA9IGJpbmQuc3Vic3RyaW5nKHRFdmVudC5sZW5ndGgpO1xyXG5cclxuXHRcdFx0aWYgKCAoIWV2ZW50IHx8IGV2ZW50ID09PSB0RXZlbnQpICYmICghbmFtZXNwYWNlIHx8IG5hbWVzcGFjZSA9PT0gdE5hbWVzcGFjZSkgKSB7XHJcblx0XHRcdFx0ZGVsZXRlIHNjb3BlX0V2ZW50c1tiaW5kXTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBVcGRhdGVhYmxlOiBtYXJnaW4sIGxpbWl0LCBzdGVwLCByYW5nZSwgYW5pbWF0ZSwgc25hcFxyXG5cdGZ1bmN0aW9uIHVwZGF0ZU9wdGlvbnMgKCBvcHRpb25zVG9VcGRhdGUgKSB7XHJcblxyXG5cdFx0dmFyIHYgPSB2YWx1ZUdldCgpLCBpLCBuZXdPcHRpb25zID0gdGVzdE9wdGlvbnMoe1xyXG5cdFx0XHRzdGFydDogWzAsIDBdLFxyXG5cdFx0XHRtYXJnaW46IG9wdGlvbnNUb1VwZGF0ZS5tYXJnaW4sXHJcblx0XHRcdGxpbWl0OiBvcHRpb25zVG9VcGRhdGUubGltaXQsXHJcblx0XHRcdHN0ZXA6IG9wdGlvbnNUb1VwZGF0ZS5zdGVwLFxyXG5cdFx0XHRyYW5nZTogb3B0aW9uc1RvVXBkYXRlLnJhbmdlLFxyXG5cdFx0XHRhbmltYXRlOiBvcHRpb25zVG9VcGRhdGUuYW5pbWF0ZSxcclxuXHRcdFx0c25hcDogb3B0aW9uc1RvVXBkYXRlLnNuYXAgPT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuc25hcCA6IG9wdGlvbnNUb1VwZGF0ZS5zbmFwXHJcblx0XHR9KTtcclxuXHJcblx0XHRbJ21hcmdpbicsICdsaW1pdCcsICdzdGVwJywgJ3JhbmdlJywgJ2FuaW1hdGUnXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0XHRpZiAoIG9wdGlvbnNUb1VwZGF0ZVtuYW1lXSAhPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBvcHRpb25zVG9VcGRhdGVbbmFtZV07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHNjb3BlX1NwZWN0cnVtID0gbmV3T3B0aW9ucy5zcGVjdHJ1bTtcclxuXHJcblx0XHQvLyBJbnZhbGlkYXRlIHRoZSBjdXJyZW50IHBvc2l0aW9uaW5nIHNvIHZhbHVlU2V0IGZvcmNlcyBhbiB1cGRhdGUuXHJcblx0XHRzY29wZV9Mb2NhdGlvbnMgPSBbLTEsIC0xXTtcclxuXHRcdHZhbHVlU2V0KHYpO1xyXG5cclxuXHRcdGZvciAoIGkgPSAwOyBpIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGg7IGkrKyApIHtcclxuXHRcdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCBpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUaHJvdyBhbiBlcnJvciBpZiB0aGUgc2xpZGVyIHdhcyBhbHJlYWR5IGluaXRpYWxpemVkLlxyXG5cdGlmICggc2NvcGVfVGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1NsaWRlciB3YXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuXHR9XHJcblxyXG5cdC8vIENyZWF0ZSB0aGUgYmFzZSBlbGVtZW50LCBpbml0aWFsaXNlIEhUTUwgYW5kIHNldCBjbGFzc2VzLlxyXG5cdC8vIEFkZCBoYW5kbGVzIGFuZCBsaW5rcy5cclxuXHRzY29wZV9CYXNlID0gYWRkU2xpZGVyKCBvcHRpb25zLmRpciwgb3B0aW9ucy5vcnQsIHNjb3BlX1RhcmdldCApO1xyXG5cdHNjb3BlX0hhbmRsZXMgPSBhZGRIYW5kbGVzKCBvcHRpb25zLmhhbmRsZXMsIG9wdGlvbnMuZGlyLCBzY29wZV9CYXNlICk7XHJcblxyXG5cdC8vIFNldCB0aGUgY29ubmVjdCBjbGFzc2VzLlxyXG5cdGFkZENvbm5lY3Rpb24gKCBvcHRpb25zLmNvbm5lY3QsIHNjb3BlX1RhcmdldCwgc2NvcGVfSGFuZGxlcyApO1xyXG5cclxuXHRpZiAoIG9wdGlvbnMucGlwcyApIHtcclxuXHRcdHBpcHMob3B0aW9ucy5waXBzKTtcclxuXHR9XHJcblxyXG5cdGlmICggb3B0aW9ucy50b29sdGlwcyApIHtcclxuXHRcdHRvb2x0aXBzKCk7XHJcblx0fVxyXG5cclxuXHRzY29wZV9TZWxmID0ge1xyXG5cdFx0ZGVzdHJveTogZGVzdHJveSxcclxuXHRcdHN0ZXBzOiBnZXRDdXJyZW50U3RlcCxcclxuXHRcdG9uOiBiaW5kRXZlbnQsXHJcblx0XHRvZmY6IHJlbW92ZUV2ZW50LFxyXG5cdFx0Z2V0OiB2YWx1ZUdldCxcclxuXHRcdHNldDogdmFsdWVTZXQsXHJcblx0XHR1cGRhdGVPcHRpb25zOiB1cGRhdGVPcHRpb25zXHJcblx0fTtcclxuXHJcblx0Ly8gQXR0YWNoIHVzZXIgZXZlbnRzLlxyXG5cdGV2ZW50cyggb3B0aW9ucy5ldmVudHMgKTtcclxuXHJcblx0cmV0dXJuIHNjb3BlX1NlbGY7XHJcblxyXG59XHJcblxyXG5cclxuXHQvLyBSdW4gdGhlIHN0YW5kYXJkIGluaXRpYWxpemVyXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSAoIHRhcmdldCwgb3JpZ2luYWxPcHRpb25zICkge1xyXG5cclxuXHRcdGlmICggIXRhcmdldC5ub2RlTmFtZSApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdub1VpU2xpZGVyLmNyZWF0ZSByZXF1aXJlcyBhIHNpbmdsZSBlbGVtZW50LicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRlc3QgdGhlIG9wdGlvbnMgYW5kIGNyZWF0ZSB0aGUgc2xpZGVyIGVudmlyb25tZW50O1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB0ZXN0T3B0aW9ucyggb3JpZ2luYWxPcHRpb25zLCB0YXJnZXQgKSxcclxuXHRcdFx0c2xpZGVyID0gY2xvc3VyZSggdGFyZ2V0LCBvcHRpb25zICk7XHJcblxyXG5cdFx0Ly8gVXNlIHRoZSBwdWJsaWMgdmFsdWUgbWV0aG9kIHRvIHNldCB0aGUgc3RhcnQgdmFsdWVzLlxyXG5cdFx0c2xpZGVyLnNldChvcHRpb25zLnN0YXJ0KTtcclxuXHJcblx0XHR0YXJnZXQubm9VaVNsaWRlciA9IHNsaWRlcjtcclxuXHRcdHJldHVybiBzbGlkZXI7XHJcblx0fVxyXG5cclxuXHQvLyBVc2UgYW4gb2JqZWN0IGluc3RlYWQgb2YgYSBmdW5jdGlvbiBmb3IgZnV0dXJlIGV4cGFuc2liaWxpdHk7XHJcblx0cmV0dXJuIHtcclxuXHRcdGNyZWF0ZTogaW5pdGlhbGl6ZVxyXG5cdH07XHJcblxyXG59KSk7IiwiLypcbkNvcHlyaWdodCAoYykgMjAxMCwyMDExLDIwMTIsMjAxMywyMDE0IE1vcmdhbiBSb2RlcmljayBodHRwOi8vcm9kZXJpY2suZGtcbkxpY2Vuc2U6IE1JVCAtIGh0dHA6Ly9tcmducmRyY2subWl0LWxpY2Vuc2Uub3JnXG5cbmh0dHBzOi8vZ2l0aHViLmNvbS9tcm9kZXJpY2svUHViU3ViSlNcbiovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3Rvcnkpe1xuXHQndXNlIHN0cmljdCc7XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKXtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpe1xuICAgICAgICAvLyBDb21tb25KU1xuICAgICAgICBmYWN0b3J5KGV4cG9ydHMpO1xuXG4gICAgfVxuXG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgdmFyIFB1YlN1YiA9IHt9O1xuICAgIHJvb3QuUHViU3ViID0gUHViU3ViO1xuICAgIGZhY3RvcnkoUHViU3ViKTtcbiAgICBcbn0oKCB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cgKSB8fCB0aGlzLCBmdW5jdGlvbiAoUHViU3ViKXtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBtZXNzYWdlcyA9IHt9LFxuXHRcdGxhc3RVaWQgPSAtMTtcblxuXHRmdW5jdGlvbiBoYXNLZXlzKG9iail7XG5cdFx0dmFyIGtleTtcblxuXHRcdGZvciAoa2V5IGluIG9iail7XG5cdFx0XHRpZiAoIG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpICl7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICpcdFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHRocm93cyB0aGUgcGFzc2VkIGV4Y2VwdGlvbiwgZm9yIHVzZSBhcyBhcmd1bWVudCBmb3Igc2V0VGltZW91dFxuXHQgKlx0QHBhcmFtIHsgT2JqZWN0IH0gZXggQW4gRXJyb3Igb2JqZWN0XG5cdCAqL1xuXHRmdW5jdGlvbiB0aHJvd0V4Y2VwdGlvbiggZXggKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24gcmVUaHJvd0V4Y2VwdGlvbigpe1xuXHRcdFx0dGhyb3cgZXg7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aERlbGF5ZWRFeGNlcHRpb25zKCBzdWJzY3JpYmVyLCBtZXNzYWdlLCBkYXRhICl7XG5cdFx0dHJ5IHtcblx0XHRcdHN1YnNjcmliZXIoIG1lc3NhZ2UsIGRhdGEgKTtcblx0XHR9IGNhdGNoKCBleCApe1xuXHRcdFx0c2V0VGltZW91dCggdGhyb3dFeGNlcHRpb24oIGV4ICksIDApO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMoIHN1YnNjcmliZXIsIG1lc3NhZ2UsIGRhdGEgKXtcblx0XHRzdWJzY3JpYmVyKCBtZXNzYWdlLCBkYXRhICk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxpdmVyTWVzc2FnZSggb3JpZ2luYWxNZXNzYWdlLCBtYXRjaGVkTWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuXHRcdHZhciBzdWJzY3JpYmVycyA9IG1lc3NhZ2VzW21hdGNoZWRNZXNzYWdlXSxcblx0XHRcdGNhbGxTdWJzY3JpYmVyID0gaW1tZWRpYXRlRXhjZXB0aW9ucyA/IGNhbGxTdWJzY3JpYmVyV2l0aEltbWVkaWF0ZUV4Y2VwdGlvbnMgOiBjYWxsU3Vic2NyaWJlcldpdGhEZWxheWVkRXhjZXB0aW9ucyxcblx0XHRcdHM7XG5cblx0XHRpZiAoICFtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggbWF0Y2hlZE1lc3NhZ2UgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKHMgaW4gc3Vic2NyaWJlcnMpe1xuXHRcdFx0aWYgKCBzdWJzY3JpYmVycy5oYXNPd25Qcm9wZXJ0eShzKSl7XG5cdFx0XHRcdGNhbGxTdWJzY3JpYmVyKCBzdWJzY3JpYmVyc1tzXSwgb3JpZ2luYWxNZXNzYWdlLCBkYXRhICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGVsaXZlcnlGdW5jdGlvbiggbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApe1xuXHRcdHJldHVybiBmdW5jdGlvbiBkZWxpdmVyTmFtZXNwYWNlZCgpe1xuXHRcdFx0dmFyIHRvcGljID0gU3RyaW5nKCBtZXNzYWdlICksXG5cdFx0XHRcdHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoICcuJyApO1xuXG5cdFx0XHQvLyBkZWxpdmVyIHRoZSBtZXNzYWdlIGFzIGl0IGlzIG5vd1xuXHRcdFx0ZGVsaXZlck1lc3NhZ2UobWVzc2FnZSwgbWVzc2FnZSwgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyk7XG5cblx0XHRcdC8vIHRyaW0gdGhlIGhpZXJhcmNoeSBhbmQgZGVsaXZlciBtZXNzYWdlIHRvIGVhY2ggbGV2ZWxcblx0XHRcdHdoaWxlKCBwb3NpdGlvbiAhPT0gLTEgKXtcblx0XHRcdFx0dG9waWMgPSB0b3BpYy5zdWJzdHIoIDAsIHBvc2l0aW9uICk7XG5cdFx0XHRcdHBvc2l0aW9uID0gdG9waWMubGFzdEluZGV4T2YoJy4nKTtcblx0XHRcdFx0ZGVsaXZlck1lc3NhZ2UoIG1lc3NhZ2UsIHRvcGljLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIG1lc3NhZ2VIYXNTdWJzY3JpYmVycyggbWVzc2FnZSApe1xuXHRcdHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuXHRcdFx0Zm91bmQgPSBCb29sZWFuKG1lc3NhZ2VzLmhhc093blByb3BlcnR5KCB0b3BpYyApICYmIGhhc0tleXMobWVzc2FnZXNbdG9waWNdKSksXG5cdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblxuXHRcdHdoaWxlICggIWZvdW5kICYmIHBvc2l0aW9uICE9PSAtMSApe1xuXHRcdFx0dG9waWMgPSB0b3BpYy5zdWJzdHIoIDAsIHBvc2l0aW9uICk7XG5cdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblx0XHRcdGZvdW5kID0gQm9vbGVhbihtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggdG9waWMgKSAmJiBoYXNLZXlzKG1lc3NhZ2VzW3RvcGljXSkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3VuZDtcblx0fVxuXG5cdGZ1bmN0aW9uIHB1Ymxpc2goIG1lc3NhZ2UsIGRhdGEsIHN5bmMsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKXtcblx0XHR2YXIgZGVsaXZlciA9IGNyZWF0ZURlbGl2ZXJ5RnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKSxcblx0XHRcdGhhc1N1YnNjcmliZXJzID0gbWVzc2FnZUhhc1N1YnNjcmliZXJzKCBtZXNzYWdlICk7XG5cblx0XHRpZiAoICFoYXNTdWJzY3JpYmVycyApe1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICggc3luYyA9PT0gdHJ1ZSApe1xuXHRcdFx0ZGVsaXZlcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZXRUaW1lb3V0KCBkZWxpdmVyLCAwICk7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqXHRQdWJTdWIucHVibGlzaCggbWVzc2FnZVssIGRhdGFdICkgLT4gQm9vbGVhblxuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBwdWJsaXNoXG5cdCAqXHQtIGRhdGE6IFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcblx0ICpcdFB1Ymxpc2hlcyB0aGUgdGhlIG1lc3NhZ2UsIHBhc3NpbmcgdGhlIGRhdGEgdG8gaXQncyBzdWJzY3JpYmVyc1xuXHQqKi9cblx0UHViU3ViLnB1Ymxpc2ggPSBmdW5jdGlvbiggbWVzc2FnZSwgZGF0YSApe1xuXHRcdHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCBmYWxzZSwgUHViU3ViLmltbWVkaWF0ZUV4Y2VwdGlvbnMgKTtcblx0fTtcblxuXHQvKipcblx0ICpcdFB1YlN1Yi5wdWJsaXNoU3luYyggbWVzc2FnZVssIGRhdGFdICkgLT4gQm9vbGVhblxuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBwdWJsaXNoXG5cdCAqXHQtIGRhdGE6IFRoZSBkYXRhIHRvIHBhc3MgdG8gc3Vic2NyaWJlcnNcblx0ICpcdFB1Ymxpc2hlcyB0aGUgdGhlIG1lc3NhZ2Ugc3luY2hyb25vdXNseSwgcGFzc2luZyB0aGUgZGF0YSB0byBpdCdzIHN1YnNjcmliZXJzXG5cdCoqL1xuXHRQdWJTdWIucHVibGlzaFN5bmMgPSBmdW5jdGlvbiggbWVzc2FnZSwgZGF0YSApe1xuXHRcdHJldHVybiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCB0cnVlLCBQdWJTdWIuaW1tZWRpYXRlRXhjZXB0aW9ucyApO1xuXHR9O1xuXG5cdC8qKlxuXHQgKlx0UHViU3ViLnN1YnNjcmliZSggbWVzc2FnZSwgZnVuYyApIC0+IFN0cmluZ1xuXHQgKlx0LSBtZXNzYWdlIChTdHJpbmcpOiBUaGUgbWVzc2FnZSB0byBzdWJzY3JpYmUgdG9cblx0ICpcdC0gZnVuYyAoRnVuY3Rpb24pOiBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgbmV3IG1lc3NhZ2UgaXMgcHVibGlzaGVkXG5cdCAqXHRTdWJzY3JpYmVzIHRoZSBwYXNzZWQgZnVuY3Rpb24gdG8gdGhlIHBhc3NlZCBtZXNzYWdlLiBFdmVyeSByZXR1cm5lZCB0b2tlbiBpcyB1bmlxdWUgYW5kIHNob3VsZCBiZSBzdG9yZWQgaWZcblx0ICpcdHlvdSBuZWVkIHRvIHVuc3Vic2NyaWJlXG5cdCoqL1xuXHRQdWJTdWIuc3Vic2NyaWJlID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGZ1bmMgKXtcblx0XHRpZiAoIHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBtZXNzYWdlIGlzIG5vdCByZWdpc3RlcmVkIHlldFxuXHRcdGlmICggIW1lc3NhZ2VzLmhhc093blByb3BlcnR5KCBtZXNzYWdlICkgKXtcblx0XHRcdG1lc3NhZ2VzW21lc3NhZ2VdID0ge307XG5cdFx0fVxuXG5cdFx0Ly8gZm9yY2luZyB0b2tlbiBhcyBTdHJpbmcsIHRvIGFsbG93IGZvciBmdXR1cmUgZXhwYW5zaW9ucyB3aXRob3V0IGJyZWFraW5nIHVzYWdlXG5cdFx0Ly8gYW5kIGFsbG93IGZvciBlYXN5IHVzZSBhcyBrZXkgbmFtZXMgZm9yIHRoZSAnbWVzc2FnZXMnIG9iamVjdFxuXHRcdHZhciB0b2tlbiA9ICd1aWRfJyArIFN0cmluZygrK2xhc3RVaWQpO1xuXHRcdG1lc3NhZ2VzW21lc3NhZ2VdW3Rva2VuXSA9IGZ1bmM7XG5cblx0XHQvLyByZXR1cm4gdG9rZW4gZm9yIHVuc3Vic2NyaWJpbmdcblx0XHRyZXR1cm4gdG9rZW47XG5cdH07XG5cblx0LyogUHVibGljOiBDbGVhcnMgYWxsIHN1YnNjcmlwdGlvbnNcblx0ICovXG5cdFB1YlN1Yi5jbGVhckFsbFN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiBjbGVhckFsbFN1YnNjcmlwdGlvbnMoKXtcblx0XHRtZXNzYWdlcyA9IHt9O1xuXHR9O1xuXG5cdC8qUHVibGljOiBDbGVhciBzdWJzY3JpcHRpb25zIGJ5IHRoZSB0b3BpY1xuXHQqL1xuXHRQdWJTdWIuY2xlYXJTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gY2xlYXJTdWJzY3JpcHRpb25zKHRvcGljKXtcblx0XHR2YXIgbTsgXG5cdFx0Zm9yIChtIGluIG1lc3NhZ2VzKXtcblx0XHRcdGlmIChtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eShtKSAmJiBtLmluZGV4T2YodG9waWMpID09PSAwKXtcblx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2VzW21dO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKiBQdWJsaWM6IHJlbW92ZXMgc3Vic2NyaXB0aW9ucy5cblx0ICogV2hlbiBwYXNzZWQgYSB0b2tlbiwgcmVtb3ZlcyBhIHNwZWNpZmljIHN1YnNjcmlwdGlvbi5cblx0ICogV2hlbiBwYXNzZWQgYSBmdW5jdGlvbiwgcmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBmb3IgdGhhdCBmdW5jdGlvblxuXHQgKiBXaGVuIHBhc3NlZCBhIHRvcGljLCByZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGZvciB0aGF0IHRvcGljIChoaWVyYXJjaHkpXG5cdCAqXG5cdCAqIHZhbHVlIC0gQSB0b2tlbiwgZnVuY3Rpb24gb3IgdG9waWMgdG8gdW5zdWJzY3JpYmUuXG5cdCAqXG5cdCAqIEV4YW1wbGVzXG5cdCAqXG5cdCAqXHRcdC8vIEV4YW1wbGUgMSAtIHVuc3Vic2NyaWJpbmcgd2l0aCBhIHRva2VuXG5cdCAqXHRcdHZhciB0b2tlbiA9IFB1YlN1Yi5zdWJzY3JpYmUoJ215dG9waWMnLCBteUZ1bmMpO1xuXHQgKlx0XHRQdWJTdWIudW5zdWJzY3JpYmUodG9rZW4pO1xuXHQgKlxuXHQgKlx0XHQvLyBFeGFtcGxlIDIgLSB1bnN1YnNjcmliaW5nIHdpdGggYSBmdW5jdGlvblxuXHQgKlx0XHRQdWJTdWIudW5zdWJzY3JpYmUobXlGdW5jKTtcblx0ICpcblx0ICpcdFx0Ly8gRXhhbXBsZSAzIC0gdW5zdWJzY3JpYmluZyBhIHRvcGljXG5cdCAqXHRcdFB1YlN1Yi51bnN1YnNjcmliZSgnbXl0b3BpYycpO1xuXHQgKi9cblx0UHViU3ViLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24odmFsdWUpe1xuXHRcdHZhciBpc1RvcGljICAgID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSh2YWx1ZSksXG5cdFx0XHRpc1Rva2VuICAgID0gIWlzVG9waWMgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcblx0XHRcdGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicsXG5cdFx0XHRyZXN1bHQgPSBmYWxzZSxcblx0XHRcdG0sIG1lc3NhZ2UsIHQ7XG5cblx0XHRpZiAoaXNUb3BpYyl7XG5cdFx0XHRkZWxldGUgbWVzc2FnZXNbdmFsdWVdO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoIG0gaW4gbWVzc2FnZXMgKXtcblx0XHRcdGlmICggbWVzc2FnZXMuaGFzT3duUHJvcGVydHkoIG0gKSApe1xuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZXNbbV07XG5cblx0XHRcdFx0aWYgKCBpc1Rva2VuICYmIG1lc3NhZ2VbdmFsdWVdICl7XG5cdFx0XHRcdFx0ZGVsZXRlIG1lc3NhZ2VbdmFsdWVdO1xuXHRcdFx0XHRcdHJlc3VsdCA9IHZhbHVlO1xuXHRcdFx0XHRcdC8vIHRva2VucyBhcmUgdW5pcXVlLCBzbyB3ZSBjYW4ganVzdCBzdG9wIGhlcmVcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChpc0Z1bmN0aW9uKSB7XG5cdFx0XHRcdFx0Zm9yICggdCBpbiBtZXNzYWdlICl7XG5cdFx0XHRcdFx0XHRpZiAobWVzc2FnZS5oYXNPd25Qcm9wZXJ0eSh0KSAmJiBtZXNzYWdlW3RdID09PSB2YWx1ZSl7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBtZXNzYWdlW3RdO1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG59KSk7XG4iLCJ2YXIgc2kgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nLCB0aWNrO1xuaWYgKHNpKSB7XG4gIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfTtcbn0gZWxzZSB7XG4gIHRpY2sgPSBmdW5jdGlvbiAoZm4pIHsgc2V0VGltZW91dChmbiwgMCk7IH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGljazsiXX0=
