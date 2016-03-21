(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./polyfills');
require('./components/hamburger');
// var helpers = require('./helpers');
var model = require('./model');
var view = require('./view');
var controller = require('./controller');

var init = function() {
  model.init('wealthApp');
  var initialState = model.read();
  view.init();
  controller(model, view.getViews(), initialState);

  window.model = model;
};

init();

// try {
//   init();
// } catch (e) {
//   console.error(e);
//   //@FIXME update email address
//   helpers.makeError(null, 'Something wrong happened. Please try refreshing the page and report the problem at ...');
// }

},{"./components/hamburger":2,"./controller":3,"./model":15,"./polyfills":19,"./view":20}],2:[function(require,module,exports){
'use strict';

var toggle = document.querySelector('.c-hamburger');
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
},{}],3:[function(require,module,exports){
/**
 * Controller module. This module executes the controllers for each view, in MVC
 * pattern. To be more precise this is more likely the Presenter in MVP pattern.
 * Our views/screens are 'dumb'. They don't know anything about the Model, so
 * the Presenter has the job to update the screens when Model changes and viceversa.
 * @see {@link https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvp}
 * @module controller
 */

var controllers = [
  require('./controllers/about'),
  require('./controllers/expenses'),
  require('./controllers/comparison'),
  require('./controllers/scenarios'),
  require('./controllers/goal'),
  require('./controllers/plan'),
  require('./controllers/reminders'),
  require('./controllers/nav'),
  require('./controllers/continue')
];

module.exports = function(model, view, initialState) {
  /*
   * Every controller's job is almost the same:
   * - to set/render the view the first time, on window load
   * - to bind user interactions to functions which update the model
   * - to update the DOM (rendering the data) whenever the Model is changed by
   *   subscribing to Model changes
   * @see {@url https://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript}
   */
  controllers.forEach(function(controller, index) {
    controller(model, view[index], initialState);
  });
};
},{"./controllers/about":4,"./controllers/comparison":5,"./controllers/continue":6,"./controllers/expenses":7,"./controllers/goal":8,"./controllers/nav":9,"./controllers/plan":10,"./controllers/reminders":11,"./controllers/scenarios":12}],4:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('ageChanged', function(value) {
    model.update({'aboutAge': value});
  });
  view.bind('incomeChanged', function(value) {
    model.update({'aboutIncome': value});
  });
  view.bind('situationChanged', function(value) {
    model.update({'aboutSituation': value});
  });
  view.bind('livingChanged', function(value) {
    model.update({'aboutLiving': value});
  });
};

var setView = function(view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var situation = initialState.aboutSituation;
  var living = initialState.aboutLiving;

  view.render('showSliders', {age: age, income: income});
  view.render('setSelects', {situation: situation, living: living});
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
};
},{}],5:[function(require,module,exports){
// var helpers = require('../helpers');
var PubSub = require('pubsub-js');

var setView = function(model, view) {
  //we don't use initialState because setView() is used also when there are
  //events which need a complete re-render such as 'aboutIncome' changed
  var state = model.read();
  var income = state.aboutIncome;
  var basicRate = state.aboutBasicRate;
  var discRate = state.aboutDiscretionaryRate;
  var savingsRate = state.aboutSavingsRate;
  var userExpenses = state.expenses;
  var othersExpenses = model.getDefaultRates(income, true);

  view.render('showSummaryChart', {
    user: {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    },
    others: othersExpenses
  });
  view.render('showUserExpenses', {
    income: income,
    basicRate: basicRate,
    discRate: discRate,
    savingsRate: savingsRate
  });
  view.render('showOthersExpenses', {
    income: income,
    othersExpenses: othersExpenses
  });
  view.render('showDetailedChart', {
    userExpenses: userExpenses,
    othersExpenses: othersExpenses.detailed
  });
  view.render('showConclusion', {
    userExpenses: {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    },
    othersExpenses: othersExpenses
  });
};

var subscriber = function(model, view, topic, msg) {
  if (topic === 'aboutSavingsRate') {
    var data = model.read();
    var income = data.aboutIncome;
    var basicRate = data.aboutBasicRate;
    var discRate = data.aboutDiscretionaryRate;
    var savingsRate = data.aboutSavingsRate;
    var userExpenses = {
      basic: basicRate,
      discretionary: discRate,
      savings: savingsRate
    };
    var othersExpenses =  model.getDefaultRates(income);

    view.render('showUserExpenses', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
    view.render('updateSummaryChart', {
      userExpenses: userExpenses,
      othersExpenses:othersExpenses
    });
    view.render('showConclusion', {
      userExpenses: userExpenses,
      othersExpenses: othersExpenses
    });
  } else if(topic === 'expenses') {
    view.render('updateDetailedChart', {
      userExpenses: msg
    });
  }
};

module.exports = function(model, view) {
  setView(model, view);
  PubSub.subscribe('aboutIncome', function() {
    setView(model, view);
  });
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('step.comparison', function() {
    setView(model, view);
  });
  PubSub.subscribe('expenses', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],6:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('continueClicked', function(stepName) {
    PubSub.publish('activateStep', stepName);
  });
};

module.exports = function(model, view) {
  bindView(model, view);
};
},{"pubsub-js":42}],7:[function(require,module,exports){
var helpers = require('../helpers');
var PubSub = require('pubsub-js');
var notie = require('notie');

var bindView = function(model, view) {
  view.bind('basicRateChanged', function(basicRate) {
    var discRate = model.read('aboutDiscretionaryRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'basic',
        value: model.read('aboutBasicRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({aboutBasicRate: basicRate});
    model.update({aboutSavingsRate: savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });
  view.bind('discRateChanged', function(discRate) {
    var basicRate = model.read('aboutBasicRate');
    var savingsRate = 100 - basicRate - discRate;

    if(savingsRate < 0) {
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: model.read('aboutDiscretionaryRate')
      });
      helpers.makeError('user', 'Error: the sum of basic & discretionary rates are superior than 100', notie.alert.bind(null, 3));
    }

    model.update({'aboutDiscretionaryRate': discRate});
    model.update({'aboutSavingsRate': savingsRate});
    view.render('updatePieChart', {
      basicRate: basicRate,
      discRate: discRate,
      savingsRate: savingsRate
    });
  });
  view.bind('currentSavingsChanged', function(currentSavings) {
    model.update({'currentSavings': currentSavings});
  });
  view.bind('detailsChanged', function() {});
  view.bind('detailsReset', function() {
    var income = model.read('aboutIncome');
    var defaultExpenses = model.getDefaultRates(income, true).detailed;

    view.render('showDetailed', {
      expenses: defaultExpenses
    });
  });
  view.bind('detailsSaved', function(err, values) {
    if(err) {
      notie.alert(3, err);
    } else {
      var summaryExpenses = model.getSummaryExpenses(values);
      view.render('setSlider', {
        sliderName: 'basic',
        value: summaryExpenses.basic
      });
      view.render('setSlider', {
        sliderName: 'discretionary',
        value: summaryExpenses.discretionary
      });
      model.update({expenses: values});
    }
  });
};

var setView = function(model, view, initialState) {
  var income = initialState.aboutIncome;
  var basicRate = initialState.aboutBasicRate;
  var discRate = initialState.aboutDiscretionaryRate;
  var currentSavings = initialState.currentSavings;
  var expenses = initialState.expenses;

  //If user has not entered detailed expenses yet
  if(expenses.length == 0) {
    expenses = model.getDefaultRates(income, true).detailed;
  }

  view.render('showSliders', {
    basicRate: basicRate,
    discRate: discRate,
    currentSavings: currentSavings
  });
  view.render('showPieChart', {
    income: income,
    basicRate: basicRate,
    discRate: discRate
  });
  view.render('showDetailed', {
    expenses: expenses
  });
};

var subscriber = function(model, view, topic, data) {
  if (topic === 'aboutIncome') {
    //data is the new income
    var defaultRates = model.getDefaultRates(data, true);
    view.render('setSlider', {
      sliderName: 'basic',
      value: defaultRates.basic
    });
    view.render('setSlider', {
      sliderName: 'discretionary',
      value: defaultRates.discretionary
    });
    view.render('updatePieTooltip', data);
    view.render('showDetailed', {
      expenses: defaultRates.detailed
    });
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
};
},{"../helpers":14,"notie":40,"pubsub-js":42}],8:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('goalToggled', function(goal) {
    model.toggleGoal(goal);
  });
};

var setView = function(model, view, initialState) {
  view.render('showGoals', {
    goalsList: model.getGoals(),
    pickedGoals: initialState.goals
  });
  view.render('createTooltips');
  view.render('setDragDrop');
  view.render('createDatepickers');
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
};
},{}],9:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('linkClicked', function(nextStep) {
    if(nextStep) {
      PubSub.publish('step.' + nextStep);
    }
  });
};

var setView = function(view, initialState) {
  var lastUserStep = initialState.lastUserStep;

  view.render('disableLinks', {lastUserStep: lastUserStep});
};

var subscriber = function(model, view, topic, data) {
  var stepName = data;
  var stepNumber = Number(document.get('step-name--' + stepName).get('step-number').textContent);
  var lastUserStep = model.read('lastUserStep');

  view.render('activateStep', {
    stepName: stepName
  });

  if(lastUserStep < stepNumber) {
    model.update({lastUserStep: stepNumber});
  }

  PubSub.publish('step.' + stepName);
};

module.exports = function(model, view, initialState) {
  setView(view, initialState);
  bindView(model, view);
  PubSub.subscribe('activateStep', subscriber.bind(null, model, view));

  /* DEVELOPMENT ONLY */
  //@NOTE This could be useful also for users and not only for development
  var resetButton = document.get('reset-model');
  resetButton.addEventListener('click', function() {
    model.reset();
    document.location.reload();
  });
};
},{"pubsub-js":42}],10:[function(require,module,exports){
var PubSub = require('pubsub-js');

var bindView = function(model, view) {
  view.bind('actionToggled', function(action) {
    model.toggleActions(action);
  });
};

var setView = function(model, view, initialState) {
  var goals = initialState.goals;
  var goalsActions = goals.map(function(goal) {
    var actions = model.getActions(goal.id);
    if(actions) {
      return Object.assign({}, goal, {actions: actions});
    }

    return;
  }).filter(function(goalActions) { //filter not undefined goal actions
    return goalActions;
  });
  // We add the general tips to the beginning
  goalsActions.unshift({
    id: 'general',
    actions: model.getActions('general')
  });

  view.render('showGoalsActions', goalsActions);
  view.render('createPopovers');
};

var subscriber = function(model, view, topic, data) {
  setView(model, view, {goals: data});
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);
  PubSub.subscribe('goals', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],11:[function(require,module,exports){
var bindView = function(model, view) {
  view.bind('printClicked', function() {
    view.render('printPlan');
  });
};

var setView = function(model, view) {
  view.render('createPopovers');
  view.render('createDatePickers');
};

module.exports = function(model, view) {
  setView(model, view);
  bindView(model, view);
};
},{}],12:[function(require,module,exports){
// var helpers = require('../helpers');
var PubSub = require('pubsub-js');
// var notie = require('notie');

var renderUpdate = function(model, view, propName, propValue) {
  var state = model.read();
  var data = {
    income: state.aboutIncome,
    savingsRate: state.aboutSavingsRate,
    age: state.aboutAge,
    currentSavings: state.currentSavings
  };
  data[propName] = propValue;

  view.render('updateLineChartSerie', data);
};

var setView = function(model, view, initialState) {
  var age = initialState.aboutAge;
  var income = initialState.aboutIncome;
  var savingsRate = initialState.aboutSavingsRate;
  var currentSavings = initialState.currentSavings;

  view.render('showSliders', {
    income: income,
    savingsRate: savingsRate
  });
  view.render('showLineChart', {
    age: age,
    income: income,
    savingsRate: savingsRate,
    currentSavings: currentSavings
  });
};

var bindView = function(model, view) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);
  var events = [
    'annualInterestRateChanged',
    'savingsRateChanged',
    'incomeChanged',
    'investmentRateChanged',
    'retirementAgeChanged'
  ];

  events.forEach(function(eventName) {
    view.bind(eventName, bindedRenderUpdate.bind(null,  eventName.replace('Changed', '')));
  });
};

var subscriber = function(model, view, topic, data) {
  var bindedRenderUpdate = renderUpdate.bind(null, model, view);

  if (topic === 'aboutAge') {
    bindedRenderUpdate('age', data);
  } else if(topic === 'aboutIncome') {
    view.render('setSlider', {
      sliderName: 'income',
      value: data
    });
    bindedRenderUpdate('income', data);
  } else if(topic === 'aboutSavingsRate') {
    view.render('setSlider', {
      sliderName: 'savingsRate',
      value: data
    });
    bindedRenderUpdate('savingsRate', data);
  } else if (topic === 'currentSavings') {
    bindedRenderUpdate('currentSavings', data);
  }
};

module.exports = function(model, view, initialState) {
  setView(model, view, initialState);
  bindView(model, view);

  PubSub.subscribe('aboutAge', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutIncome', subscriber.bind(null, model, view));
  PubSub.subscribe('aboutSavingsRate', subscriber.bind(null, model, view));
  PubSub.subscribe('currentSavings', subscriber.bind(null, model, view));
};
},{"pubsub-js":42}],13:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');
var noUiSlider = require('nouislider');

/**
 * Appends an HTML element as tooltip to the slider
 * @param  {object} slider Slider DOM Element
 * @return {object}
 */
var appendTooltip = function(slider) {
  if(!slider.appendChild) {
    helpers.makeError('params', slider);
  }

  var handle = slider.get('noUi-handle');
  var tooltip = document.createElement('div');
  tooltip.classList.add('slider-tooltip');
  tooltip.innerHTML = '<span></span>';
  handle.appendChild(tooltip);

  return slider;
};

/**
 * Create a slider using noUiSlider
 * @param  {HTMLElement} element HTML Node of the slider
 * @param  {object} options Slider options
 * @param  {string} format Tooltip value format
 * @return {HTMLElement} tooltip-handle
 */
var createSlider = function(element, options) {
  if (typeof noUiSlider !== 'object') {
    helpers.makeError(null, 'nouislider object is not declared.');
  }
  noUiSlider.create(element, options);
  return element;
};

var updateHandler = function(slider, format) {
  var tooltip = slider.getElementsByTagName('span')[0];
  slider.noUiSlider.on('update', function(values) {
    tooltip.innerHTML = helpers.format(values[0], format);
  });
};

var sliderWithTooltips = function(element, options, format) {
  updateHandler(
    appendTooltip( createSlider(element, options) ),
    format
  );
};

/**
 * Removes a className from the current active element and applies it to the
 * new one
 * @param {Element} newActive New active element
 * @param {string} className Classname to apply
 */
var setActive = function(newActive, className) {
  var oldActive = document.get(className);
  oldActive.classList.remove(className);
  newActive.classList.add(className);
};

module.exports = {
  createSlider: sliderWithTooltips,
  setActive: setActive
};

},{"./helpers":14,"nouislider":41}],14:[function(require,module,exports){
/**
 * Helpers module
 * @module helpers
 */

'use strict';

var customErrorConstructor = function(name, desc) {
  var ErrorConstructor = function(msg) {
    this.message = desc + msg;
    this.stack = (new Error()).stack;
  };
  ErrorConstructor.prototype = Object.create(Error.prototype);
  ErrorConstructor.prototype.name = name;

  return ErrorConstructor;
};

var ParamsError = customErrorConstructor('ParamsError', 'Invalid parameters: ');
var UserError = customErrorConstructor('UserError', 'Invalid user input: ');

/**
 * Throws an error
 * @param  {string} type Error type/constructor
 * @param  {object} data Data to pass in the msg
 * @param  {Function} callback Optional callback. Useful if you need to display
 * the error to the user for example.
 */
var makeError = function(type, data, callback) {
  var msg;
  callback = callback || function() {};

  try {
    msg = JSON.stringify(data);
  } catch (e) {
    msg = JSON.stringify(e);
  }

  callback(msg);

  switch (type) {
    case 'params':
      throw new ParamsError(msg);
    case 'user':
      throw new UserError(msg);
    default:
      throw new Error(msg);
  }
};

/**
 * Formats the value to a specified type
 * @param  {string} value Value to be formatted
 * @param  {string} type Format
 * @return {string} Formatted value
 */
var format = function(value, type) {
  if( (typeof value !== 'number') && (typeof value !== 'string') ) {
    makeError('params', value);
  }

  var newValue = '';

  switch (type) {
    case '$':
      newValue = '$' + value;
      break;
    case '%':
      newValue = value + '%';
      break;
    default:
      newValue = value;
  }

  return newValue;
};

/**
 * Checks whether the input is strictly a isNumber
 * @param {*} value Value to check
 * @return {boolean}
 */
var isNumber = function(value) {
  //Check also with isNaN because (typeof NaN === 'number') is true
  return !isNaN(value) && (typeof value === 'number');
};

/**
 * Returns the reversed array without side effects
 * @param  {array} array Initial array
 * @return {array}
 */
var reverse = function(array) {
  if(!Array.isArray(array)) {
    makeError('params', array);
  }

  return array.slice().reverse();
};

/**
 * Set the configMap of the module - It goes deep in the object
 * @param  {object} inputMap Object map with new properties and values
 * @param  {object} configMap Initial object map
 * @return {object} configMap Updated map
 */
var setConfigMap = function(inputMap, configMap) {
  var key;

  for (key in inputMap) {
    if (configMap.hasOwnProperty(key)) {
      if (inputMap[key] instanceof Object) {
        setConfigMap(inputMap[key], configMap[key]);
      } else {
        configMap[key] = inputMap[key];
      }
    }
  }

  return configMap;
};

/**
 * Replaces mustache-wrapped words with values
 * @param  {string} string Initial string
 * @param  {object} valuesMap Object map of values
 * @return {string}
 */
var template = function(string, valuesMap){
  var s = string || '';

  Object.keys(valuesMap).forEach(function(value) {
    s = s.replace(new RegExp('{' + value + '}', 'g'), valuesMap[value]);
  });

  return s;
};

/**
 * Toggles a item in array, adding or removing it whether it's already contained
 * @param  {array} array Array
 * @param  {object} item Item
 * @return {array} myArray Updated array
 */
var toggleArrayItem = function(array, item) {
  //We clone the array to avoid side effects
  var myArray = array.slice(0);

  var isThere = myArray.find(function(arrayItem, index) {
    if(arrayItem.id === item.id) {
      myArray.splice(index, 1);
      return true;
    }
  });

  if(!isThere) {
    myArray.push(item);
  }

  return myArray;
};

/**
 * Returns the actual value of a rate
 * @param  {number} total Total
 * @param  {number} rate Rate
 * @return {number}
 */
var valueOfRate = function(total, rate) {
  if( (typeof rate !== 'number') || (typeof total !== 'number') ) {
    makeError('params', {rate: rate, total: total});
  }

  return rate * total * 0.01;
};

/**
 * Returns the actual values of summary rates based on income
 * @param  {number} income Income
 * @param  {number} basicRate Basic needs rate
 * @param  {number} discRate Discretionary Expenses rate
 * @param  {number} savingsRate Savings rate
 * @return {object}
 */
var valuesOfSummary = function(income, basicRate, discRate, savingsRate) {
  var valueOfCategory = valueOfRate.bind(null, income);
  return {
    basicNeeds: valueOfCategory(basicRate),
    discretionaryExpenses: valueOfCategory(discRate),
    annualSavings: valueOfCategory(savingsRate)
  };
};


module.exports = {
  format: format,
  makeError: makeError,
  isNumber: isNumber,
  reverse: reverse,
  setConfigMap: setConfigMap,
  template: template,
  toggleArrayItem: toggleArrayItem,
  valueOfRate: valueOfRate,
  valuesOfSummary: valuesOfSummary
};

},{}],15:[function(require,module,exports){
/**
 * Model module
 * @module model
 */

'use strict';

var helpers = require('./helpers');
var PubSub = require('pubsub-js');
var notie = require('notie').alert;

var actions = require('./model/actions');
var budget = require('./model/budget');
var goalsList = require('./model/goals');

var stateMap = {
  dbName: ''
};

var defaultModel = {
  aboutAge: 35,
  aboutSituation: 'married',
  aboutLiving: 'own',
  aboutIncome: 60000,
  aboutBasicRate: 35,
  aboutDiscretionaryRate: 52,
  aboutSavingsRate: 13,
  currentSavings: 10000,
  expenses: [],
  //aboutStage: 'home',
  lastUserStep: 1,
  goals: [],
  actions: []
};


///////////////////////////
// BASIC STORE FUNCTIONS //
///////////////////////////

/**
 * Returns the value of the property in the model.
 * @param  {string} property The name of the property
 * @return {anything}
 */
var read = function(property) {
  var data = JSON.parse(localStorage[stateMap.dbName]);

  if(typeof property === 'undefined') {
    return data;
  }

  return data[property];
};

/**
 * Updates model by giving it the property name and its value.
 * @param  {string} updateMap The name of the property to update
 */
var update = function (updateMap) {
  if(typeof updateMap !== 'object') {
    helpers.makeError('params', updateMap);
  }

  var data = read();

  Object.keys(updateMap).forEach(function(property) {
    data[property] = updateMap[property];
    PubSub.publish(property, updateMap[property]);
    console.log(property, updateMap[property]);
  });

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * Removes data from model
 * @param  {string} property The name of the property to be removed from model.
 */
var remove = function (property) {
  var data = read();

  delete data[property];

  localStorage[stateMap.dbName] = JSON.stringify(data);
};

/**
 * WARNING: Will remove ALL data from storage.
 */
var reset = function () {
  localStorage[stateMap.dbName] = JSON.stringify(defaultModel);
};


//////////////////////////////
// SPECIFIC MODEL FUNCTIONS //
//////////////////////////////

/**
 * Returns the list of available goals
 * @return {array}
 */
var getGoals = function() {
  return goalsList;
};


/**
 * Returns summary expenses from the detailed one
 * @param  {array} detailedExpenses Array of the values of detailed expenses
 * @return {Object}
 */
var getSummaryExpenses = function(detailedExpenses) {
  /**
   * Positions of the basic categories in the list of detailed expenses
   * @type {Array}
   * @NOTE This should be improved since it requires the parameter array to
   * have always the same structure, but it would require much more code
   */
  var basicCategories = [0, 2, 4];
  var basicExpenses = 0;
  var discExpenses = 0;

  if(!Array.isArray(detailedExpenses)) {
    helpers.makeError('params', detailedExpenses);
  }

  detailedExpenses.forEach(function(expense, index) {
    if(~basicCategories.indexOf(index)) {
      basicExpenses += expense;
    } else {
      discExpenses += expense;
    }
  });

  return {
    basic: basicExpenses,
    discretionary: discExpenses
  };
};

/**
 * Updates the stored list adding or removing the element
 * @param  {string} listName Name of the list
 * @param  {object} item item to add or delete
 */
var toggleListItem = function(listName, item) {
  if(typeof listName !== 'string') {
    helpers.makeError('params', listName);
  }

  var list = read()[listName];
  var updatedList = helpers.toggleArrayItem(list, item);
  var updateMap = {};
  updateMap[listName] = updatedList;
  update(updateMap);
};

var init = function(name) {
  stateMap.dbName = name;

  if(typeof window.Storage === undefined) {
    helpers.makeError(null, 'localStorage support', 'Error: localStorage is not supported.', notie.bind(null, 3));
  }

  if(!localStorage[name]) {
    localStorage[name] = JSON.stringify(defaultModel);
  }
};

module.exports = {
  getActions: actions,
  getDefaultRates: budget.getDefaultRates,
  getGoals: getGoals,
  getSummaryExpenses: getSummaryExpenses,
  init: init,
  read: read,
  reset: reset,
  remove: remove,
  toggleActions: toggleListItem.bind(null, 'actions'),
  toggleGoal: toggleListItem.bind(null, 'goals'),
  update: update
};

},{"./helpers":14,"./model/actions":16,"./model/budget":17,"./model/goals":18,"notie":40,"pubsub-js":42}],16:[function(require,module,exports){
/**
 * Action data
 * @module actions
 */

var helpers = require('../helpers');

var actions = {
  general: [
    {
      id: 0,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 1,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 2,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    },
    {
      id: 3,
      toDo: 'Thing to do',
      details: [
        'Details',
        'Details',
        'Details'
      ],
      notToDo: 'Thing not to do'
    }
  ],
  college: [
    {
      id: 0,
      toDo: 'Start a tax-deferred saving plan',
      details: [
        'Tax-free investment growth and tax-free withdrawals will save you 10% to 30% on taxes that you would otherwise give to the tax man',
        '529 Plan for College',
        'Coverdell Education Savings Account (ESA) for K thru 12'
      ],
      notToDo: 'Rely on a conventional savings account'
    },
    {
      id: 1,
      toDo: 'Calculate Your College Expense',
      details: [
        'Use this resource to estimate how much you will need: <a href=\'http://www.savingforcollege.com/college-savings-calculator/index.php\'>College cost calculator</a>'
      ],
      notToDo: 'Guess on how much you will need. Chances are it will be more than you expected.'
    },
    {
      id: 2,
      toDo: 'Estimate Your Expected Family Contribution (EFC) ',
      details: [
        '<a href=\'https://fafsa.ed.gov/FAFSA/app/f4cForm\'>Federal Student Aid</a>'
      ],
      notToDo: 'Assume that everyone pays the same amount.'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Plan this into your budget. Use automatic payments if possible'
      ],
      notToDo: 'Be inconsistent with your savings. Slow and steady wins the race.'
    },
    {
      id: 4,
      toDo: 'Take classes for college credits at a lower cost community college',
      details: [
        'Save money by taking required general education class at a city college',
        'Make sure credits are transferable first',
        'AP classes in high school are another great option'
      ],
      notToDo: 'Assume that all of your course work has to be at a 4-year institution'
    },
    {
      id: 5,
      toDo: 'Apply to colleges with large endowments',
      details: [
        'Expensive private colleges may actually be the least expensive when you factor in generous endowments for qualified students'
      ],
      notToDo: 'Assume that private school is cheaper than public'
    },
    {
      id: 6,
      toDo: 'Find Scholarships',
      details: [
        'Go to <a href=\'http://www2.ed.gov/programs/fws/index.html\'>FastWeb.com</a> to find scholarships and explore work-study programs'
      ],
      notToDo: 'Think that a scholarship is too small to apply for. Multiple scholarships add up'
    }
  ],
  funds: [
    {
      id: 0,
      toDo: 'Determine how much you need',
      details: [
        'Calculate your monthly expenses and use this calculator: <a href=\'http://www.moneyunder30.com/emergency-fund-calculator\'>Emergency fund calculator</a>'
      ],
      notToDo: 'Underestimate what you\'ll need or how long it will take you to find a new job if you lose yours.'
    },
    {
      id: 1,
      toDo: 'Setup a separate account exclusively for you Emergency Fund',
      details: [
        'Keep your emergency fund separate from you checking and saving account. You\'ll think differently about this fund if dedicate to an emergency (i.e. you\'ll be less likely to spend it)'
      ],
      notToDo: 'Co-mingle funds with your checking or saving account'
    },
    {
      id: 2,
      toDo: 'Start now - make a minum deposit of $25',
      details: [
        'This is your safety-net. You\'ll need more later but this will go a long way toward getting started.'
      ],
      notToDo: 'Wait until you have an emergency'
    },
    {
      id: 3,
      toDo: 'Add the same amount every time you get paid',
      details: [
        'Make this a priority before any other financial goals. '
      ],
      notToDo: 'Quit before you achieve your goal. Consistancy is key.'
    },
    {
      id: 4,
      toDo: 'Pay yourself first',
      details: [
        'Setup direct deposit for your monthly budgeted contribution to this fund'
      ],
      notToDo: 'Assume you\'ll stay diciplined after you start saving.'
    },
    {
      id: 5,
      toDo: 'Add windfalls (rebates, cash gift, bonuses, etc.)',
      details: [

      ],
      notToDo: ''
    },
    {
      id: 6,
      toDo: 'Make sure you have disability insurance',
      details: [
        'You may already have this through your employer. If not, consider getting a policy on your own.'
      ],
      notToDo: 'Assume you already have a policy or think you don\'t need one.'
    }
  ]
};

module.exports = function(goal) {
  if(typeof goal !== 'string') {
    helpers.makeError('params', goal);
  }

  return actions[goal];
};

},{"../helpers":14}],17:[function(require,module,exports){
/**
 * Budget by Income
 */

var getDefaultRates = function(income, isDetailed) {
  if(typeof income !== 'number') {
    throw new Error('getDefaultRates(): wrong param: ' + JSON.stringify(income));
  }

  var rates;

  if(income < 5000) {
    rates = {
      basic: 46,
      discretionary: 52,
      savings: 2,
      detailed: [10, 6, 26, 5, 10, 4, 14, 7, 5, 7, 4]
    };
  } else if (income < 10e3) {
    rates = {
      basic: 48,
      discretionary: 51,
      savings: 1,
      detailed: [11, 6, 27, 6, 10, 3, 15, 6, 5, 4, 6]
    };
  } else if (income < 15e3) {
    rates = {
      basic: 47,
      discretionary: 50,
      savings: 3,
      detailed: [11, 5, 25, 6, 11, 3, 16, 8, 5, 4, 3]
    };
  } else if (income < 20e3) {
    rates = {
      basic: 43,
      discretionary: 51,
      savings: 6,
      detailed: [10, 6, 23, 6, 10, 3, 15, 10, 5, 2, 4]
    };
  } else if (income < 30e3) {
    rates = {
      basic: 41,
      discretionary: 52,
      savings: 7,
      detailed: [9, 6, 22, 6, 10, 3, 18, 10, 5, 1, 3]
    };
  } else if (income < 40e3) {
    rates = {
      basic: 39,
      discretionary: 51,
      savings: 10,
      detailed: [9, 5, 21, 6, 9, 4, 17, 9, 5, 1, 4]
    };
  } else if (income < 50e3) {
    rates = {
      basic: 37,
      discretionary: 54,
      savings: 9,
      detailed: [8, 5, 20, 6, 9, 4, 19, 9, 5, 1, 5]
    };
  } else if (income < 70e3) {
    rates = {
      basic: 35,
      discretionary: 52,
      savings: 13,
      detailed: [8, 5, 19, 6, 8, 3, 19, 9, 5, 1, 4]
    };
  } else if (income >= 70e3) {
    rates = {
      basic: 31,
      discretionary: 52,
      savings: 17,
      detailed: [6, 5, 18, 7, 6, 3, 17, 7, 6, 3, 4]
    };
  }

  if(!isDetailed) {
    delete rates.detailed;
  }

  return rates;
};

module.exports = {
  getDefaultRates: getDefaultRates
};

},{}],18:[function(require,module,exports){
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

module.exports = goalsList;

},{}],19:[function(require,module,exports){
/**
 * PROTOTYPE FUNCTIONS
 */

// Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
// qsa('.foo').forEach(function () {})
NodeList.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 * Shortcut for getElementsByClassName, returns the first found element of the
 * HTMLCollection
 * @param  {string} className Class name
 * @param  {number} [index] HTMLCollection index of the element to return
 * @return {Element}
 */
Element.prototype.get = function(className, index) {
  if( (typeof className !== 'string') || (index && (typeof index !== 'number')) ) {
    throw new Error('Wrong className or index');
  }

  index = index || 0;

  return this.getElementsByClassName(className)[index];
};

Element.prototype.getAll = function(className) {
  if(typeof className !== 'string') {
    throw new Error('Wrong className');
  }

  return this.getElementsByClassName(className);
};

document.get = Element.prototype.get;
document.getAll = Element.prototype.getAll;

if (Element && !Element.prototype.matches) {
  var proto = Element.prototype;
  proto.matches = proto.matchesSelector ||
    proto.mozMatchesSelector || proto.msMatchesSelector ||
    proto.oMatchesSelector || proto.webkitMatchesSelector ||
    function(selector) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
      var i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) ;
      return i > -1;
    };
}

/*
 * Implements the ECMAScript 2015 'find' function in Arrays
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

//The Object.assign() method is used to copy the values of all enumerable own
//properties from one or more source objects to a target object. It will return
//the target object.
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

},{}],20:[function(require,module,exports){
'use strict';

var viewsNames = [
  'about',
  'expenses',
  'comparison',
  'scenarios',
  'goal',
  'plan',
  'reminders'
];
var views = [
  require('./views/about'),
  require('./views/expenses'),
  require('./views/comparison'),
  require('./views/scenarios'),
  require('./views/goal'),
  require('./views/plan'),
  require('./views/reminders'),
  require('./views/nav'),
  require('./views/continue')
];

var getViews = function() {
  return views;
};

var init = function() {
  views.forEach(function(view, index) {
    var container = index < 7? document.get('step--' + viewsNames[index]) : null;
    view.setStateMap(container);
  });
};

module.exports = {
  init: init,
  getViews: getViews
};
},{"./views/about":21,"./views/comparison":23,"./views/continue":24,"./views/expenses":25,"./views/goal":26,"./views/nav":27,"./views/plan":28,"./views/reminders":29,"./views/scenarios":30}],21:[function(require,module,exports){
(function (global){
/**
 * Screen #2 - About module
 * @module about
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);

var stateMap = {
  ageSlider: null,
  incomeSlider: null,
  situation: null,
  living: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////


var showSliders = function(data) {
  var age = data.age;
  var income = data.income;

  if(!age || !income) {
    helpers.makeError('params', data);
  }

  var ageOptions = {
    start: age,
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
      decimals: 0
    })
  };
  var incomeOptions = {
    start: income,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  };

  domHelpers.createSlider(stateMap.ageSlider, ageOptions);
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
};

var setSelects = function(data) {
  var situation = data.situation;
  var living = data.living;

  if(!situation || !living) {
    helpers.makeError('params', data);
  }

  stateMap.situation.value = situation;
  stateMap.living.value = living;
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch(event) {
    case 'ageChanged':
      stateMap.ageSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0].replace('.', '')));
      });
      break;
    case 'situationChanged':
      stateMap.situation.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    case 'livingChanged':
      stateMap.living.addEventListener('change', function(event) {
        handler(event.target.value);
      });
      break;
    default:
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'setSelects':
      setSelects(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.ageSlider = container.get('age__slider');
  stateMap.incomeSlider = container.get('income__slider');
  stateMap.situation = container.get('select');
  stateMap.living = container.get('select', 1);
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap,
  render: render
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14}],22:[function(require,module,exports){
var helpers = require('../helpers');
var Chartist = require('chartist');

var stateMap = {
  chartWrapper: null,
  chart: null
};


var showDetailedChart = function(data) {
  var userExpenses = helpers.reverse(data.userExpenses);
  var othersExpenses = helpers.reverse(data.othersExpenses);

  if(!Array.isArray(userExpenses) || !Array.isArray(othersExpenses)) {
    helpers.makeError('params', data);
  }

  //If user has not entered detailed expenses yet
  if(userExpenses.length == 0) {
    userExpenses = othersExpenses;
  } else {
    stateMap.chartWrapper.classList.add('show-chart');
  }

  var chartData = {
    labels: ['Miscellaneous', 'Education', 'Entertainment & Reading', 'Healthcare', 'Trasportation', 'Apparel & services', 'Utilities, fuels, public services', 'Misc Housing Related', 'Housing', 'Food away from home', 'Food at home'],
    series: [
      userExpenses,
      othersExpenses
    ]
  };
  var chartOptions =  {
    axisY: {
      offset: 100
    },
    axisX: {
      labelOffset: {
        x: -7,
        y: 0
      }
    },
    seriesBarDistance: 10,
    horizontalBars: true
  };
  stateMap.chart = new Chartist.Bar('.detailed-chart', chartData, chartOptions);
};

//For now it's used only when user changes his expenses and not for 'income
//changes/default expenses changes' since they are dealt with showDetailedChart()
var updateDetailedChart = function(data) {
  var userExpenses = helpers.reverse(data.userExpenses);

  if(!Array.isArray(userExpenses)) {
    helpers.makeError('params', data);
  }

  stateMap.chartWrapper.classList.add('show-chart');
  stateMap.chart.data.series[0] = userExpenses;
  stateMap.chart.update();
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showDetailedChart':
      showDetailedChart(data);
      break;
    case 'updateDetailedChart':
      updateDetailedChart(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.chartWrapper = container.get('advanced-comparison');
};

module.exports = {
  render:  render,
  setStateMap: setStateMap
};

},{"../helpers":14,"chartist":32}],23:[function(require,module,exports){
(function (global){
/**
 * Screen #5 - Pyramid module
 * @module 5-Pyramid
 */

'use strict';

var helpers = require('../helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var Chartist = require('chartist');
var details = require('./comparison-details');

var stateMap = {
  income: null,
  budget: {},
  others: {},
  barChart: null,
  conclusion: null
};


////////////////////
// DATA FUNCTIONS //
////////////////////

/**
 * Copies the actual values of the summary into a new object whose key names
 * are needed to be 'basic', 'discretionary' and 'savings'.
 * @param  {object} values Category values of the summary
 * @return {object}
 */
var mapActualValues = function(values) {
  return {
    basic: values.basicNeeds,
    discretionary: values.discretionaryExpenses,
    savings: values.annualSavings
  };
};

var moneyFormat = wNumb({
  thousand: ',',
  prefix: '$ '
});


///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Returns an object map of the DOM elements which displays the categories
 * @param  {Object.DOM} container DOM Container
 * @param  {string} who user budget or others
 * @param  {array} categories Array of names of categories
 * @return {object}
 */
var getSummaryDOM = function(container, who, categories) {
  var domMap = {};
  who = '.' + who;

  //The leverage HTML Elements which can be selected with a className like
  //'.budget__category--basic .budget__category__value'
  categories.forEach(function(category) {
    var htmlClass = who + '__category--' + category + ' ' + who + '__category__value';
    domMap[category] = container.querySelector(htmlClass);
  });

  return domMap;
};

var updateTextContent = function(element, text) {
  element.textContent = text;
};

/**
 * Updates the text for user & others summary categories, with the rates and
 * actual values.
 * @param  {object} domMap       Object with the DOM nodes for basic, discretionary
 * and savings
 * @param  {object} actualValues Object with the actual values for each category
 * @param  {object} rates        Object with the rates for each category
 * @example
 * updateSummary(
 *   {
 *     basic: HTMLNode,
 *     discretionary: HTMLNode,
 *     savings: HTMLNode
 *   },
 *   {
 *     basic: 20000,
 *     discretionary: 13000,
 *     savings: 8000
 *   },
 *   {
 *     basic: 45,
 *     discretionary: 35,
 *     savings: 20
 *   }
 *  )
 */
var updateSummary = function(domMap, actualValues, rates) {
  Object.keys(domMap).forEach(function(category) {
    updateTextContent(
      domMap[category].querySelector('.actual'),
      moneyFormat.to(actualValues[category])
    );
    updateTextContent(
      domMap[category].querySelector('.rate'),
      helpers.format(rates[category], '%')
    );
  });
};

//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showSummaryChart = function(data) {
  var user = data.user;
  var others = data.others;

  if(
    !helpers.isNumber(user.basicRate + user.discRate + user.savingsRate) ||
    !helpers.isNumber(others.basic + others.discretionary + others.savings)
  ) {
    helpers.makeError('params', data);
  }

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [user.basicRate, user.discRate, user.savingsRate],
      [others.basic, others.discretionary, others.savings]
    ]
  };
  var chartOptions = {
    seriesBarDistance: 22
  };

  stateMap.barChart = new Chartist.Bar('.comparison-chart', chartData, chartOptions);
};

var showUserExpenses = function(data) {
  var income = data.income || 0;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = data.savingsRate;

  if(typeof (income + basicRate + discRate + savingsRate) !== 'number') {
    helpers.makeError('params', data);
  }

  var actualValues = mapActualValues(
    helpers.valuesOfSummary(income, basicRate, discRate, savingsRate)
  );
  var budgetRates = {
    basic: basicRate,
    discretionary: discRate,
    savings: savingsRate
  };

  if(income) {
    updateTextContent(stateMap.income, moneyFormat.to(income));
  }
  updateSummary(stateMap.budget, actualValues, budgetRates);
};

var showOthersExpenses = function(data) {
  var income = data.income;
  var othersExpenses = data.othersExpenses;

  if( (typeof income !== 'number') || (typeof othersExpenses !== 'object') ) {
    helpers.makeError('params', data);
  }

  var othersValues = mapActualValues(helpers.valuesOfSummary(
    income,
    othersExpenses.basic,
    othersExpenses.discretionary,
    othersExpenses.savings
  ));

  updateSummary(stateMap.others, othersValues, othersExpenses);
};

var updateSummaryChart = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var chartData = {
    labels: ['Basic Needs', 'Discretionary Expenses', 'Savings'],
    series: [
      [userExpenses.basic, userExpenses.discretionary, userExpenses.savings],
      [41, 51, 8]
    ]
  };

  var series = chartData.series;
  var expense;

  series[0] = Object.keys(userExpenses).map(function(category) {
    expense = userExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  series[1] = Object.keys(othersExpenses).map(function(category) {
    expense = othersExpenses[category];
    if(typeof expense !== 'number') {
      helpers.makeError('params', data);
    }
    return expense;
  });
  stateMap.barChart.update(chartData);
};

var showConclusion = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  var template = 'You spend {spend} on {category} so you save {save} than others';
  var text, spend, save;
  var category = Math.abs(userExpenses.basic < othersExpenses.basic) > Math.abs(userExpenses.discretionary < othersExpenses.discretionary) ? 'Basic Needs' : 'Discretionary Expenses';

  if(userExpenses.savings === othersExpenses.savings) {
    text = 'You spend the same as others of your category';
  } else if(userExpenses.savings > othersExpenses.savings) {
    spend = 'less';
    save = 'more';
  } else {
    spend = 'more';
    save = 'less';
  }

  if(spend && save) {
    text = helpers.template(template, {
      spend: spend,
      category: category,
      save: save
    });
  }
  stateMap.conclusion.textContent = text;
};


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSummaryChart':
      showSummaryChart(data);
      break;
    case 'showUserExpenses':
      showUserExpenses(data);
      break;
    case 'showOthersExpenses':
      showOthersExpenses(data);
      break;
    case 'showDetailedChart':
      details.render('showDetailedChart', data);
      break;
    case 'showConclusion':
      showConclusion(data);
      break;
    case 'updateDetailedChart':
      details.render('updateDetailedChart', data);
      break;
    case 'updateSummaryChart':
      updateSummaryChart(data);
      break;
    default:
      console.error('No command found');
      return;
  }
};

var setStateMap = function(container) {
  var categories = ['basic', 'discretionary', 'savings'];

  stateMap.income = container.querySelector('.budget__income .value__actual');

  stateMap.budget = getSummaryDOM(container, 'budget', categories);
  stateMap.others = getSummaryDOM(container, 'others', categories);

  stateMap.conclusion = container.querySelector('.conclusion');

  details.setStateMap(container);
};

module.exports = {
  setStateMap: setStateMap,
  render: render
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14,"./comparison-details":22,"chartist":32}],24:[function(require,module,exports){
/**
 * Continue buttons module
 * @module continue
 */

'use strict';

var stateMap = {
  continue: null,
  backward: null
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'continueClicked') {
    stateMap.continue.forEach(function(button) {
      button.addEventListener('click', function() {
        var template = this.dataset.template;
        handler(template);
      });
    });
    stateMap.backward.forEach(function(button) {
      button.addEventListener('click', function() {
        handler(this.dataset.template);
      });
    });
  }
};

var setStateMap = function() {
  stateMap.continue = document.getAll('continue');
  stateMap.backward = document.getAll('backward');
};

module.exports = {
  bind: bind,
  setStateMap: setStateMap
};

},{}],25:[function(require,module,exports){
(function (global){
/**
 * Screen #3 - You module
 * @module 3-you
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var Chartist = require('chartist');

var stateMap = {
  chartNode: null,
  $pieChart: null,

  basicSlider: null,
  expensesSlider: null,
  savingsSlider: null,

  $modal: null,
  detailsList: null,
  detailsInputs: null,
  detailsSum: null,
  detailsSavings: null,
  saveDetails: null
};

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/**
 * Returns if every item is not equal zero
 * @param  {array} values Array of values to be checked
 * @return {boolean}
 */
var areNotZero = function(values) {
  if(!Array.isArray(values)) {
    helpers.makeError('params', values);
  }

  return !values.some(function(element) {
    return element === 0;
  });
};

/**
 * Returns the innerHTML of the list of inputs for detailed expenses
 * @param  {string} detailTemplate Template for each input of the list
 * @param  {array} detailsNames   Input names corresponding to the expense category
 * @param  {array} defaultValues  Value for the inputs
 * @return {string}
 */
var getDetailsList = function(detailTemplate, detailsNames, defaultValues) {
  var listHTML = '';
  detailsNames.forEach(function(name, index) {
    listHTML += helpers.template(detailTemplate, {
      name: name,
      value: defaultValues[index]
    });
  });
  return listHTML;
};

/**
 * Returns the sum of the values
 * @param  {Array}  values Array of values to be summed
 * @return {Number}
 */
var sum = function(values) {
  if(!Array.isArray(values)) {
    helpers.makeError('params', values);
  }

  return values.reduce(function(previous, current) {
    return previous + current;
  });
};

///////////////////////
// RENDER FUNCTIONS ///
///////////////////////

var createPieTooltip = function(pieChart, income) {
  var $chart = $(pieChart);
  var $toolTip = $chart
    .append('<div class="pie-tooltip"></div>')
    .find('.pie-tooltip')
    .hide();
  var moneyFormat = wNumb({
    thousand: '.',
    prefix: '$ '
  });
  var isTooltipShown = false;

  //For mobiles
  $chart.on('click mouseenter', '.ct-slice-donut', function(e) {
    if (!isTooltipShown || e.type === 'mouseenter') {
      var $slice = $(this);
      var value = $slice.attr('ct:value');
      var seriesName = $slice.parent().attr('ct:series-name');
      $toolTip
      .html(
        '<strong>' + seriesName + '</strong>: ' +
          value + '%/ ' +
        moneyFormat.to(Number(value) / 100 * income)
      )
      .show();
      isTooltipShown = true;
    } else {
      $toolTip.hide();
      isTooltipShown = false;
    }
  });

  $chart.on('mouseleave', '.ct-slice-donut', function() {
    $toolTip.hide();
  });

  $chart.on('click mousemove', function(event) {
    $toolTip.css({
      left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
      top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 30
    });
  });
};

var showDetailed = function(data) {
  var detailsNames = ['Food at home', 'Food away from home', 'Housing', 'Misc Housing Related', 'Utilities, fuels, public services', 'Apparel & services', 'Trasportation', 'Healthcare', 'Entertainment & Reading', 'Education', 'Miscellaneous'];
  var expenses = data.expenses;

  if(!Array.isArray(expenses)) {
    helpers.makeError('params', data);
  }

  var detailTemplate =
    '<li class="detail">' +
      '<span class="detail__name">{name}</span>' +
      '<span class="value-wrapper">' +
        '<input class="detail__value" type="number" value="{value}" name="{name}" >' +
      '</span>' +
    '</li>';

  stateMap.detailsList.innerHTML = getDetailsList(detailTemplate, detailsNames, expenses);
};

var showDetailsSum = function(data) {
  var sum = data.sum;

  if(!helpers.isNumber(sum)) {
    helpers.makeError('params', data);
  }

  stateMap.detailsSum.textContent = sum;
  stateMap.detailsSavings.textContent = 100 - sum;
};

var showSliders = function(data) {
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var currentSavings = data.currentSavings;

  //We check data are all numbers by summing them
  if(typeof (basicRate + discRate + currentSavings) !== 'number') {
    helpers.makeError('params', data);
  }

  var basicOptions = {
    start: basicRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var discOptions = {
    start: discRate,
    step: 1,
    range: {
      'min': 1,
      'max': 70
    },
    format: wNumb({
      decimals: 0
    })
  };
  var savingsOptions = {
    start: currentSavings,
    step: 1000,
    range: {
      'min': 1000,
      'max': 500000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  };

  domHelpers.createSlider(stateMap.basicSlider, basicOptions, '%');
  domHelpers.createSlider(stateMap.expensesSlider, discOptions, '%');
  domHelpers.createSlider(stateMap.savingsSlider, savingsOptions, '$');
};

var showPieChart = function(data) {
  var income = data.income;
  var basicRate = data.basicRate;
  var discRate = data.discRate;
  var savingsRate = 100 - basicRate - discRate;

  //We check data are all numbers by summing them
  if(typeof savingsRate !== 'number') {
    helpers.makeError('params', data);
  }

  var pieData = {
    series: [
      {
        value: basicRate,
        name: 'Basic Needs'
      },
      {
        value: discRate,
        name: 'Discretionary'
      },
      {
        value: savingsRate,
        name: 'Savings'
      }
    ]
  };
  var pieOptions = {
    donut: true,
    donutWidth: 20,
    chartPadding: 10,
    labelOffset: 50,
    width: '220px',
    height: '220px'
  };
  var pieResponsiveOptions = [
    ['screen and (max-width: 480px)', {
      donutWidth: 30,
      width: '280px',
      height: '280px'
    }]
  ];

  stateMap.$pieChart = new Chartist.Pie(stateMap.chartNode, pieData, pieOptions, pieResponsiveOptions);
  createPieTooltip(stateMap.chartNode, income);
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens.
 * @param {object} data Object with sliderName and value properties
 */
var setSlider = function(data) {
  var sliderName = data.sliderName;
  var value = data.value;

  if( (typeof sliderName !== 'string') || (typeof value !== 'number') ) {
    helpers.makeError('params', data);
  }

  if (sliderName === 'basic') {
    stateMap.basicSlider.noUiSlider.set(value);
  } else if (sliderName === 'discretionary') {
    stateMap.expensesSlider.noUiSlider.set(value);
  }
};

var updateDetailsSum = function() {
  var values = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
    return Number(input.value);
  });
  var detailsSum = sum(values);
  showDetailsSum({sum: detailsSum});
};

/**
 * Update the view of the Doughnut when sliders values change
 * @param {object} rates Object with the new rates
 * @example
 * updatePieChart({
 *   basicRate: 30,
 *   discRate: 40,
 *   savingsRate: 30
 * })
 */
var updatePieChart = function(rates) {
  var updatedData = {
    series: [
      {
        value: rates.basicRate,
        name: 'Basic Needs'
      },
      {
        value: rates.discRate,
        name: 'Discretionary'
      },
      {
        value: rates.savingsRate,
        name: 'Savings'
      }
    ]
  };
  stateMap.$pieChart.update(updatedData);
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Used by shell to bind event handlers to this module DOM events. It usually
 * means that we want the shell to update model when user interacts with this
 * screen.
 * @param  {string} event Event name
 * @param  {function} handler Event handler
 */
var bind = function(event, handler) {
  switch (event) {
    case 'basicRateChanged':
      stateMap.basicSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'discRateChanged':
      stateMap.expensesSlider.noUiSlider.on('set', function(values) {
        handler( Number(values[0]) );
      });
      break;
    case 'currentSavingsChanged':
      stateMap.savingsSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0].replace('.', '')));
      });
      break;
    case 'detailsChanged':
      stateMap.detailsList.addEventListener('change', updateDetailsSum);
      break;
    case 'detailsReset':
      stateMap.detailsReset.addEventListener('click', handler);
      break;
    case 'detailsSaved':
      stateMap.saveDetails.addEventListener('click', function() {
        var values = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
          return Number(input.value);
        });
        var valid = areNotZero(values) && (sum(values) <= 100);
        if(valid) {
          handler(null, values);
          stateMap.$modal.modal('hide');
        } else {
          handler(new Error('Values must not be zeros and their sum not superior 100'), null);
        }
      });
      break;
    default:
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showSliders':
      showSliders(data);
      break;
    case 'showPieChart':
      showPieChart(data);
      break;
    case 'showDetailed':
      showDetailed(data);
      stateMap.detailsInputs = stateMap.detailsList.getAll('detail__value');
      var inputsValues = Array.prototype.map.call(stateMap.detailsInputs, function(input) {
        return Number(input.value);
      });
      showDetailsSum({
        sum: sum(inputsValues)
      });
      break;
    case 'setSlider':
      setSlider(data);
      break;
    case 'updatePieChart':
      updatePieChart(data);
      break;
    case 'updatePieTooltip':
      createPieTooltip(stateMap.chartNode, data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  window.sum = sum;
  stateMap.basicSlider = container.get('slider--needs');
  stateMap.expensesSlider = container.get('slider--expenses');
  stateMap.savingsSlider = container.get('current-savings__slider');

  stateMap.chartNode = container.get('summary__chart');

  stateMap.$modal = $('#details-modal');
  stateMap.detailsList = container.get('details-values');
  stateMap.detailsReset = container.get('reset-detailed');
  stateMap.detailsSum = container.get('details-sum');
  stateMap.detailsSavings = container.get('details-savings');
  stateMap.saveDetails = container.get('save-detailed-expense');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14,"chartist":32}],26:[function(require,module,exports){
(function (global){
/**
 * Screen #7 - Goal module
 * @module 7-Goal
 */

'use strict';

var helpers = require('../helpers');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14,"dragula":39}],27:[function(require,module,exports){
'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');

var stateMap = {
  nav: null
};


///////////////////
// DOM FUNCTIONS //
///////////////////

var activateNav = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var newActiveLink = stateMap.nav.get('step-name--' + stepName).parentNode;

  //Activate the navigation item
  if(newActiveLink.classList.contains('disabled')) {
    newActiveLink.classList.remove('disabled');
  }

  domHelpers.setActive(newActiveLink, 'active');
};

var activateStep = function(stepName) {
  if(typeof stepName !== 'string') {
    helpers.makeError('params', stepName);
  }

  var nextStepWrapper = document.get('step--' + stepName);
  domHelpers.setActive(nextStepWrapper, 'show');
};

var bindLinkClicked = function(e, handler) {
  var nodeName = e.target.nodeName;
  var nextStepName, clickedLink;

  //If it is the 'Reset Model' button
  if (nodeName === 'A') {
    return;
  }

  if (nodeName === 'SPAN') {
    nextStepName = e.target.dataset.template;
    clickedLink = e.target.parentNode;
  } else if (nodeName === 'LI') {
    nextStepName = e.target.firstElementChild.dataset.template;
    clickedLink = e.target;
  }

  if ( clickedLink && !clickedLink.classList.contains('disabled')) {
    domHelpers.setActive(clickedLink, 'active');
    activateStep(nextStepName);
    handler(nextStepName);
  }
};

/**
 * Adds 'disabled' class to navigation links from the item number 'start'
 * @param  {object} data Object with the number of the first link to start with
 */
var disableLinks = function(data) {
  var lastUserStep = data.lastUserStep;

  if(typeof lastUserStep !== 'number') {
    helpers.makeError('params', lastUserStep);
  }

  var navItems = stateMap.nav.getElementsByTagName('li');

  //We disable links after the last one seen by user in previous session
  for (var i = lastUserStep, len = navItems.length; i < len; i++) {
    navItems[i].classList.add('disabled');
  }
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if(event === 'linkClicked') {
    stateMap.nav.addEventListener('click', function(e) {
      bindLinkClicked(e, handler);
    });
  }
};

var setStateMap = function() {
  stateMap.nav = document.get('nav');
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'activateStep':
      activateStep(data.stepName);
      activateNav(data.stepName);
      break;
    case 'disableLinks':
      disableLinks(data);
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
},{"../dom-helpers":13,"../helpers":14}],28:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */

'use strict';

var helpers = require('../helpers');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var stateMap = {
  tbody: null
};

var actionTemplate = '<tr><td><i class="zmdi zmdi-check-circle" data-action="{index}"></i></td>' +
  '<td>{toDo}</td>' +
  '<td>{notToDo}</td>' +
  '<td><i class="zmdi zmdi-info-outline" data-toggle="popover" data-placement="left" data-content="{details}""></i></td></tr>';


///////////////////
// DOM FUNCTIONS //
///////////////////

/**
 * Returns the markup for the goals
 * @param  {object} goal Object map with goal properties and its actions
 * @return {string}
 */
var getActionsHTML = function(goal) {
  var id = goal.id;
  var actions = goal.actions;
  var markup = '';

  if( (typeof id !== 'string') || (typeof actions !== 'object') ) {
    helpers.makeError('params', goal);
  }

  markup +=
    '<tr class="' + id + '">' +
      '<td colspan="4"><h4>' + id[0].toUpperCase() + id.slice(1) + '</h4></td>' +
    '</tr>';

  actions.forEach(function(action) {
    var details = action.details.reduce(function(prev, cur) {
      return prev + '<li>' + cur + '</li>';
    }, '');

    details = '<ul>' + details + '</ul>';
    markup += helpers.template(actionTemplate, {
      id: id,
      index: action.id,
      toDo: action.toDo,
      notToDo: action.notToDo,
      details: details
    });
  });

  return markup;
};


//////////////////////
// RENDER FUNCTIONS //
//////////////////////

var showGoalsActions = function(data) {
  var goals = data;
  if(!Array.isArray(goals)) {
    helpers.makeError('params', goals);
  }

  if(goals.length == 0) {
    return;
  }

  var actionsHTML = '';

  goals.forEach(function(goal) {
    actionsHTML += getActionsHTML(goal);
  });

  stateMap.tbody.innerHTML = actionsHTML;
};

/**
 * PUBLIC FUNCTIONS
 */

var bind = function(event, handler) {
  if (event === 'actionToggled') {
    stateMap.tbody.addEventListener('click', function(event) {
      var target = event.target;
      if (target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
        target.classList.toggle('saved');
        console.log(target.dataset.action);
      }
    });
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'showGoalsActions':
      showGoalsActions(data);
      break;
    case 'createPopovers':
      $('.step--plan .zmdi-info-outline').popover({
        html: true,
        title: 'Details'
      });
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.tbody = container.getElementsByTagName('tbody')[0];
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../helpers":14}],29:[function(require,module,exports){
(function (global){
/**
 * Screen #8 - Retirement module
 * @module 8-Retirement
 */
'use strict';

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var stateMap = {
  actionTitles: null,
  printButton: null
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

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  if(event === 'printClicked') {
    stateMap.printButton.addEventListener('click', function() {
      handler();
    });
  }
};

var render = function(cmd) {
  switch(cmd) {
    case 'createPopovers':
      $('.plan-wrapper .zmdi-info-outline').popover({
        placement: 'left'
      });
      break;
    case 'createDatepickers':
      $('.plan-wrapper .zmdi-calendar-alt')
        .datepicker({
          autoclose: true,
          format: 'M d yyyy'
        })
        .on('changeDate', function(event) {
          this.dataset.date = event.format();
        });
      break;
    case 'printPlan':
      printPlan();
      break;
  }
};

var setStateMap = function(container) {
  stateMap.actionTitles = container.getAll('action__title');
  stateMap.printButton = container.get('print');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],30:[function(require,module,exports){
(function (global){
/**
 * Screen #6 - Scenarios module
 * @module 6-Scenarios
 */

'use strict';

var helpers = require('../helpers');
var domHelpers = require('../dom-helpers');
var wNumb = (typeof window !== "undefined" ? window['wNumb'] : typeof global !== "undefined" ? global['wNumb'] : null);
var Chartist = require('chartist');

var stateMap = {
  incomeSlider: null,
  investmentRateSlider: null,
  retirementSlider: null,

  investmentStyle: null,
  lineChart: null,
  retirementSavings: null
};


///////////////////////
// HELPERS FUNCTIONS //
///////////////////////

var moneyFormat = wNumb({
  thousand: ','
});

/**
 * returns the annualInterestRate relative to a given investment style
 * @param  {string} investmentStyle   Style of investment
 * @return {number} annualInterestRate
 */
var getInterestByInvestment = function(investmentStyle) {
  if(typeof investmentStyle !== 'string') {
    helpers.makeError('params', investmentStyle);
  }

  var annualInterestRate;

  switch (investmentStyle) {
    case 'safe':
      annualInterestRate = 0.02;
      break;
    case 'moderate':
      annualInterestRate = 0.06;
      break;
    case 'risky':
      annualInterestRate = 0.15;
      break;
    default:
      annualInterestRate = 0.06;
  }

  return annualInterestRate;
};

/**
 * Returns the accumulated money with the compound interest
 * @param  {number} interestRate % of interest (from 0 to 1)
 * @param  {number} term Years
 * @param  {number} amtInvested Initial investment
 * @param  {number} contribAmt Yearly contribution
 * @return {number}
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
 * Returns an array containing the values for x axis ticks. You pass the first
 * and last values as parameters and it returns also the other values of the range.
 * In our case it's used to show the savings progress as the years increase
 * towards the retirement age.
 * @param  {Number} firstValue First value of the axis
 * @param  {Number} lastValue Last value of the axis
 * @return {Array}
 */
var getXTicks = function(firstValue, lastValue) {
  if(!helpers.isNumber(firstValue + lastValue)) {
    helpers.makeError('params', {firstValue: firstValue, lastValue: lastValue});
  }

  var values = [];
  //First and last values must be precise
  values[0] = firstValue;
  values[5] = lastValue;

  var difference = (lastValue - firstValue) / 5;
  for (var i = 1; i < 5; i++) {
    values[i] = Math.round(firstValue + (difference * i));
  }

  return values;
};

/**
 * Returns an array with the Y axis values
 * @param  {object} data Object with data needed for the calculation
 * @return {array} serie Array with Y axis values
 * @example
 * getYSerie({
 *   income: 35000,
 *   investmentRate: 100,
 *   savingsRate: 30,
 *   currentSavings: 20000,
 *   xTicks: [23, 33, 43, 53, 63, 73],
 *   annualInterestRate: 0.06
 * })
 */
var getYSerie = function(data) {
  var income = data.income;
  var investmentRate = data.investmentRate;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;
  var xTicks = data.xTicks;
  var annualInterestRate =  data.annualInterestRate;

  if(
    !helpers.isNumber(income + investmentRate + savingsRate + currentSavings + annualInterestRate) ||
    !Array.isArray(xTicks)
  ) {
    helpers.makeError('params', data);
  }

  // We are also considering the investment rate in Advanced options.
  // So this is (annualSavings * investmentRate) to be precise.
  var annualSavings = (savingsRate / 100) * income * (investmentRate / 100);

  var i = 0;
  var serie = [];

  //We are settings the first Y value of the line chart, which corresponds
  //to the initial investment.
  serie[0] = currentSavings;

  //We calculate the other values of Y serie with the Compound interest function
  for (i = 1; i < 6; i+= 1) {
    serie[i] = getAccumulatedValue(
      annualInterestRate,
      xTicks[i] - xTicks[0],
      currentSavings,
      annualSavings
    );
  }

  return serie;
};

var updateRetirementSavings = function(retirementSavings) {
  stateMap.retirementSavings.childNodes[1].textContent = moneyFormat.to(retirementSavings);
};

//////////////////////
// RENDER FUNCTIONS //
//////////////////////


var showSliders = function(data) {
  var income = data.income;
  var savingsRate = data.savingsRate;

  //We check data are all numbers by summing them
  if(!helpers.isNumber(income + savingsRate)) {
    helpers.makeError('params', data);
  }

  var savingRateOptions = {
    start: savingsRate,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var incomeOptions = {
    start: income,
    step: 1000,
    range: {
      'min': 18000,
      'max': 200000
    },
    format: wNumb({
      decimals: 1,
      thousand: '.'
    })
  };

  var investmentOptions = {
    start: 100,
    step: 1,
    range: {
      'min': 1,
      'max': 100
    },
    format: wNumb({
      decimals: 0
    })
  };
  var retirementOptions = {
    start: 65,
    step: 1,
    range: {
      'min': 55,
      'max': 75
    },
    format: wNumb({
      decimals: 0
    })
  };

  domHelpers.createSlider(stateMap.savingRateSlider, savingRateOptions, '%');
  domHelpers.createSlider(stateMap.incomeSlider, incomeOptions, '$');
  domHelpers.createSlider(stateMap.investmentRateSlider, investmentOptions, '%');
  domHelpers.createSlider(stateMap.retirementSlider, retirementOptions);
};

var showLineChart = function(data) {
  var age = data.age;
  var income = data.income;
  var savingsRate = data.savingsRate;
  var currentSavings = data.currentSavings;

  if(!helpers.isNumber(age + income + savingsRate + currentSavings)) {
    helpers.makeError('params', data);
  }

  var annualInterestRate = 0.06;
  var investmentRate = Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var retirementAge = Number( stateMap.retirementSlider.noUiSlider.get() );
  var xTicks = getXTicks(age, retirementAge);
  var ySerie = getYSerie({
    income: income,
    investmentRate: investmentRate,
    savingsRate: savingsRate,
    currentSavings: currentSavings,
    xTicks: xTicks,
    annualInterestRate: annualInterestRate
  });
  var chartData = {
    labels: xTicks,
    series: [ySerie]
  };
  var chartOptions = {
    axisY: {
      labelInterpolationFnc: function(value) {
        return (value/1000) + 'K';
      },
      high: 2000000,
      ticks: [currentSavings, 250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000],
      type: Chartist.FixedScaleAxis
    },
    showArea: true,
    width: '400px',
    height: '250px'
  };
  var responsiveOptions = [
    ['screen and (max-width: 480px)', {
      width: '300px'
    }]
  ];

  stateMap.lineChart = new Chartist.Line('.scenario__chart', chartData, chartOptions, responsiveOptions);
  updateRetirementSavings(ySerie[5]);
};

/**
 * Used by shell to set the sliders values when data is changed on some other
 * screens.
 * @param {object} data Object with sliderName and value properties
 */
var setSlider = function(data) {
  var sliderName = data.sliderName;
  var value = data.value;

  if( (typeof sliderName !== 'string') || (typeof value !== 'number') ) {
    helpers.makeError('params', data);
  }

  if (sliderName === 'income') {
    stateMap.incomeSlider.noUiSlider.set(value);
  } else if (sliderName === 'savingsRate') {
    stateMap.savingRateSlider.noUiSlider.set(value);
  }
};

/**
 * Updates the line chart with a new Y serie when user changes investment style
 * @param  {object} data Object with the data needed to calculate the serie
 * @example
 * updateLineChartSerie({
 *   income: 30000,
 *   investmentRate: 100, //optional
 *   savingsRate: 30,
 *   annualInterestRate: 0.06, //optional
 *   age: 20,
 *   retirementAge: 65, //optional
 *   currentSavings: 20000
 * })
 */
var updateLineChartSerie = function(data) {
  var lineChart = stateMap.lineChart;
  var chartData = lineChart.data;
  var chartOptions = lineChart.options;

  var age = data.age;
  var investmentRate = data.investmentRate || Number( stateMap.investmentRateSlider.noUiSlider.get() );
  var annualInterestRate = data.annualInterestRate || getInterestByInvestment( stateMap.investmentStyle.querySelector('input:checked').value );
  var retirementAge = data.retirementAge || Number( stateMap.retirementSlider.noUiSlider.get() ) ;
  var xTicks = getXTicks(age, retirementAge);

  if(!Array.isArray(xTicks)) {
    helpers.makeError('params', data);
  }

  var ySerie = getYSerie({
    income: data.income,
    investmentRate: investmentRate,
    savingsRate: data.savingsRate,
    annualInterestRate: annualInterestRate,
    currentSavings: data.currentSavings,
    xTicks: xTicks
  });

  chartData.labels = xTicks;
  chartData.series[0] = ySerie;
  chartOptions.axisY.ticks[0] = data.currentSavings;

  lineChart.update(chartData, chartOptions);
  updateRetirementSavings(ySerie[5]);
};


//////////////////////
// PUBLiC FUNCTIONS //
//////////////////////

var bind = function(event, handler) {
  switch(event) {
    case 'annualInterestRateChanged':
      stateMap.investmentStyle.addEventListener('change', function(e) {
        handler( getInterestByInvestment(e.target.value) );
      });
      break;
    case 'savingsRateChanged':
      stateMap.savingRateSlider.noUiSlider.on('set', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'incomeChanged':
      stateMap.incomeSlider.noUiSlider.on('set', function(values) {
        var income = Number(values[0].replace('.', ''));
        handler(income);
      });
      break;
    case 'investmentRateChanged':
      stateMap.investmentRateSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    case 'retirementAgeChanged':
      stateMap.retirementSlider.noUiSlider.on('change', function(values) {
        handler(Number(values[0]));
      });
      break;
    default:
      console.error('No bind event found.');
      return;
  }
};

var render = function(cmd, data) {
  switch(cmd) {
    case 'setSlider':
      setSlider(data);
      break;
    case 'showSliders':
      showSliders(data);
      break;
    case 'showLineChart':
      showLineChart(data);
      break;
    case 'updateLineChartSerie':
      updateLineChartSerie(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

var setStateMap = function(container) {
  stateMap.savingRateSlider = container.get('option__slider--saving');
  stateMap.incomeSlider = container.get('option__slider--income');
  stateMap.investmentRateSlider = container.get('option__slider--investment');
  stateMap.retirementSlider = container.get('option__slider--retirement');

  stateMap.investmentStyle = container.get('investment');

  stateMap.retirementSavings = container.get('savings__amount');
};

module.exports = {
  bind: bind,
  render: render,
  setStateMap: setStateMap
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../dom-helpers":13,"../helpers":14,"chartist":32}],31:[function(require,module,exports){
module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
'use strict';

var ticky = require('ticky');

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};

},{"ticky":43}],34:[function(require,module,exports){
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

},{"./debounce":33,"atoa":31}],35:[function(require,module,exports){
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

},{"./eventmap":36,"custom-event":37}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"./classes":38,"contra/emitter":34,"crossvent":35}],40:[function(require,module,exports){
/*
 * notie.js - A clean and simple notification plugin (alert/growl style) for javascript, with no dependencies.
 *
 * Copyright (c) 2015 Jared Reich
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://jaredreich.com/projects/notie.js
 *
 * Version:  2.1.0
 *
*/

var notie = function(){

    // SETTINGS
    // *********************************************
    
    // General
    var shadow = true;
    var font_size_small = '18px';
    var font_size_big = '24px';
    var font_change_screen_width = 600;
    var animation_delay = 0.3;
    var background_click_dismiss = true;
    
    // notie.alert colors
    var alert_color_success_background = '#57BF57';
    var alert_color_warning_background = '#E3B771';
    var alert_color_error_background = '#E1715B';
    var alert_color_info_background = '#4D82D6';
    var alert_color_text = '#FFF';

    // notie.confirm colors
    var confirm_and_input_color_background = '#4D82D6';
    var confirm_and_input_color_yes_background = '#57BF57';
    var confirm_and_input_color_no_background = '#E1715B';
    var confirm_and_input_color_text = '#FFF';
    var confirm_and_input_color_yes_text = '#FFF';
    var confirm_and_input_color_no_text = '#FFF';
    
    // ID's for use within your own .css file (OPTIONAL)
    // (Be sure to use !important to override the javascript)
    // Example: #notie-alert-inner { padding: 30px !important; }
    var alert_outer_id = 'notie-alert-outer';
    var alert_inner_id = 'notie-alert-inner';
    var alert_text_id = 'notie-alert-text';
    var confirm_outer_id = 'notie-confirm-outer';
    var confirm_inner_id = 'notie-confirm-inner';
    var confirm_background_id = 'notie-confirm-background';
    var confirm_yes_id = 'notie-confirm-yes';
    var confirm_no_id = 'notie-confirm-no';
    var confirm_text_id = 'notie-confirm-text';
    var confirm_yes_text_id = 'notie-confirm-yes-text';
    var confirm_no_text_id = 'notie-confirm-no-text';
    var input_outer_id = 'notie-input-outer';
    var input_inner_id = 'notie-input-inner';
    var input_background_id = 'notie-input-background';
    var input_div_id = 'notie-input-div';
    var input_field_id = 'notie-input-field';
    var input_yes_id = 'notie-input-yes';
    var input_no_id = 'notie-input-no';
    var input_text_id = 'notie-input-text';
    var input_yes_text_id = 'notie-input-yes-text';
    var input_no_text_id = 'notie-input-no-text';
    
    // *********************************************
    
    
    
    
    
    // HELPERS
    // *********************************************
    
    // Function for resize listeners for font-size
    var resizeListener = function resizeListener(ele) {
        if (window.innerWidth <= font_change_screen_width) { ele.style.fontSize = font_size_small; }
        else { ele.style.fontSize = font_size_big; }
    };
    
    
    // Debounce function (credit to Underscore.js)
    var debounce_time = 500;
    var debounce = function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    
    // Event listener for enter and escape keys
    window.addEventListener('keydown', function(event) {
        var enter_clicked = (event.which == 13 || event.keyCode == 13);
        var escape_clicked = (event.which == 27 || event.keyCode == 27);
        if (alert_is_showing) {
            if (enter_clicked || escape_clicked) {
                clearTimeout(alert_timeout_1);
                clearTimeout(alert_timeout_2);
                alert_hide();
            }
        }
        else if (confirm_is_showing) {
            if (enter_clicked) {
                confirm_yes.click();
            }
            else if (escape_clicked) {
                confirm_no.click();
            }
        }
        else if (input_is_showing) {
            if (enter_clicked) {
                input_yes.click();
            }
            else if (escape_clicked) {
                input_no.click();
            }
        }
    });
    
    
    // addEventListener polyfill, fixes a style.height issue for IE8
    if (typeof Element.prototype.addEventListener === 'undefined') {
        Element.prototype.addEventListener = Window.prototype.addEventListener = function (e, callback) {
            e = 'on' + e;
            return this.attachEvent(e, callback);
        };
    }


    // Scroll disable and enable for notie.confirm and notie.input
    var original_body_height, original_body_overflow;
    function scroll_disable() {
        original_body_height = document.body.style.height;
        original_body_overflow = document.body.style.overflow;
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }
    function scroll_enable() {
        document.body.style.height = original_body_height;
        document.body.style.overflow = original_body_overflow;
    }
    // *********************************************
    
    
    
    // NOTIE.ALERT
    // *********************************************

    // notie elements and styling
    var alert_outer = document.createElement('div');
    alert_outer.id = alert_outer_id;
    alert_outer.style.position = 'fixed';
    alert_outer.style.top = '0';
    alert_outer.style.left = '0';
    alert_outer.style.zIndex = '999999999';
    alert_outer.style.height = 'auto';
    alert_outer.style.width = '100%';
    alert_outer.style.display = 'none';
    alert_outer.style.textAlign = 'center';
    alert_outer.style.cursor = 'default';
    alert_outer.style.MozTransition = '';
    alert_outer.style.WebkitTransition = '';
    alert_outer.style.transition = '';
    alert_outer.style.cursor = 'pointer';
    
    // Hide alert on click
    alert_outer.onclick = function() {
        clearTimeout(alert_timeout_1);
        clearTimeout(alert_timeout_2);
        alert_hide();
    };
    
    var alert_inner = document.createElement('div');
    alert_inner.id = alert_inner_id;
    alert_inner.style.padding = '20px';
    alert_inner.style.display = 'table-cell';
    alert_inner.style.verticalAlign = 'middle';
    alert_outer.appendChild(alert_inner);
    
    // Initialize notie text
    var alert_text = document.createElement('span');
    alert_text.id = alert_text_id;
    alert_text.style.color = alert_color_text;
    if (window.innerWidth <= font_change_screen_width) { alert_text.style.fontSize = font_size_small; }
    else { alert_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, alert_text), debounce_time), true);
    alert_inner.appendChild(alert_text);

    // Attach notie to the body element
    document.body.appendChild(alert_outer);

    // Declare variables
    var height = 0;
    var alert_is_showing = false;
    var alert_timeout_1;
    var alert_timeout_2;
    var was_clicked_counter = 0;

    function alert(type, message, seconds) {
        
        // Blur active element for use of enter key, focus input
        document.activeElement.blur();

        was_clicked_counter++;

        setTimeout(function() {
            was_clicked_counter--;
        }, (animation_delay * 1000 + 10));

        if (was_clicked_counter == 1) {

            if (alert_is_showing) {

                clearTimeout(alert_timeout_1);
                clearTimeout(alert_timeout_2);

                alert_hide(function() {
                    alert_show(type, message, seconds);
                });

            }
            else {
                alert_show(type, message, seconds);
            }

        }

    }

    function alert_show(type, message, seconds) {

        alert_is_showing = true;

        var duration = 0;
        if (typeof seconds == 'undefined') {
            var duration = 3000;
        }
        else if (seconds < 1) {
            duration = 1000;
        }
        else {
            duration = seconds * 1000;
        }

        // Set notie type (background color)
        switch(type) {
            case 1:
                alert_outer.style.backgroundColor = alert_color_success_background;
                break;
            case 2:
                alert_outer.style.backgroundColor = alert_color_warning_background;
                break;
            case 3:
                alert_outer.style.backgroundColor = alert_color_error_background;
                break;
            case 4:
                alert_outer.style.backgroundColor = alert_color_info_background;
                break;
        }

        // Set notie text
        alert_text.innerHTML = message;

        // Get notie's height
        alert_outer.style.top = '-10000px';
        alert_outer.style.display = 'table';
        alert_outer.style.top = '-' + alert_outer.offsetHeight - 5 + 'px';

        alert_timeout_1 = setTimeout(function() {

            if (shadow) { alert_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
            alert_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
            alert_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
            alert_outer.style.transition = 'all ' + animation_delay + 's ease';

            alert_outer.style.top = 0;

            alert_timeout_2 = setTimeout(function() {

                alert_hide(function() {
                    // Nothing
                });

            }, duration);

        }, 20);

    }

    function alert_hide(callback) {

        alert_outer.style.top = '-' + alert_outer.offsetHeight - 5 + 'px';

        setTimeout(function() {

            if (shadow) { alert_outer.style.boxShadow = ''; }
            alert_outer.style.MozTransition = '';
            alert_outer.style.WebkitTransition = '';
            alert_outer.style.transition = '';
            
            alert_outer.style.top = '-10000px';

            alert_is_showing = false;

            if (callback) { callback(); }

        }, (animation_delay * 1000 + 10));

    }



    // NOTIE.CONFIRM
    // *********************************************

    // confirm elements and styling
    var confirm_outer = document.createElement('div');
    confirm_outer.id = confirm_outer_id;
    confirm_outer.style.position = 'fixed';
    confirm_outer.style.top = '0';
    confirm_outer.style.left = '0';
    confirm_outer.style.zIndex = '999999998';
    confirm_outer.style.height = 'auto';
    confirm_outer.style.width = '100%';
    confirm_outer.style.display = 'none';
    confirm_outer.style.textAlign = 'center';
    confirm_outer.style.MozTransition = '';
    confirm_outer.style.WebkitTransition = '';
    confirm_outer.style.transition = '';

    var confirm_background = document.createElement('div');
    confirm_background.id = confirm_background_id;
    confirm_background.style.position = 'fixed';
    confirm_background.style.top = '0';
    confirm_background.style.left = '0';
    confirm_background.style.zIndex = '999999997';
    confirm_background.style.height = '100%';
    confirm_background.style.width = '100%';
    confirm_background.style.display = 'none';
    confirm_background.style.backgroundColor = 'white';
    confirm_background.style.MozTransition = 'all ' + animation_delay + 's ease';
    confirm_background.style.WebkitTransition = 'all ' + animation_delay + 's ease';
    confirm_background.style.transition = 'all ' + animation_delay + 's ease';
    confirm_background.style.opacity = '0';
    
    // Hide notie.confirm on background click
    confirm_background.onclick = function() {
        if (background_click_dismiss) {
            confirm_hide();
        }
    };

    var confirm_inner = document.createElement('div');
    confirm_inner.id = confirm_inner_id;
    confirm_inner.style.boxSizing = 'border-box';
    confirm_inner.style.width = '100%';
    confirm_inner.style.padding = '20px';
    confirm_inner.style.display = 'block';
    confirm_inner.style.cursor = 'default';
    confirm_inner.style.backgroundColor = confirm_and_input_color_background;
    confirm_outer.appendChild(confirm_inner);

    var confirm_yes = document.createElement('div');
    confirm_yes.id = confirm_yes_id;
    confirm_yes.style.cssFloat = 'left';
    confirm_yes.style.height = '50px';
    confirm_yes.style.lineHeight = '50px';
    confirm_yes.style.width = '50%';
    confirm_yes.style.cursor = 'pointer';
    confirm_yes.style.backgroundColor = confirm_and_input_color_yes_background;
    confirm_outer.appendChild(confirm_yes);

    var confirm_no = document.createElement('div');
    confirm_no.id = confirm_no_id;
    confirm_no.style.cssFloat = 'right';
    confirm_no.style.height = '50px';
    confirm_no.style.lineHeight = '50px';
    confirm_no.style.width = '50%';
    confirm_no.style.cursor = 'pointer';
    confirm_no.style.backgroundColor = confirm_and_input_color_no_background;
    confirm_no.onclick = function() { confirm_hide(); }
    confirm_outer.appendChild(confirm_no);

    // Initialize confirm text
    var confirm_text = document.createElement('span');
    confirm_text.id = confirm_text_id;
    confirm_text.style.color = confirm_and_input_color_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_text.style.fontSize = font_size_small; }
    else { confirm_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_text), debounce_time), true);
    confirm_inner.appendChild(confirm_text);

    var confirm_yes_text = document.createElement('span');
    confirm_yes_text.id = confirm_yes_text_id;
    confirm_yes_text.style.color = confirm_and_input_color_yes_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_yes_text.style.fontSize = font_size_small; }
    else { confirm_yes_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_yes_text), debounce_time), true);
    confirm_yes.appendChild(confirm_yes_text);

    var confirm_no_text = document.createElement('span');
    confirm_no_text.id = confirm_no_text_id;
    confirm_no_text.style.color = confirm_and_input_color_no_text;
    if (window.innerWidth <= font_change_screen_width) { confirm_no_text.style.fontSize = font_size_small; }
    else { confirm_no_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, confirm_no_text), debounce_time), true);
    confirm_no.appendChild(confirm_no_text);

    // Attach confirm elements to the body element
    document.body.appendChild(confirm_outer);
    document.body.appendChild(confirm_background);

    // Declare variables
    var confirm_height = 0;
    var confirm_is_showing = false;

    function confirm(title, yes_text, no_text, yes_callback) {
        
        // Blur active element for use of enter key
        document.activeElement.blur();
        
        if (alert_is_showing) {
            // Hide notie.alert
            clearTimeout(alert_timeout_1);
            clearTimeout(alert_timeout_2);
            alert_hide(function() {
                confirm_show(title, yes_text, no_text, yes_callback);
            });
        }
        else {
            confirm_show(title, yes_text, no_text, yes_callback);
        }
        

    }
    function confirm_show(title, yes_text, no_text, yes_callback) {

        scroll_disable();

        // Yes callback function
        confirm_yes.onclick = function() {
            confirm_hide();
            setTimeout(function() {
                yes_callback();
            }, (animation_delay * 1000 + 10));
        }

        function confirm_show_inner() {

            // Set confirm text
            confirm_text.innerHTML = title;
            confirm_yes_text.innerHTML = yes_text;
            confirm_no_text.innerHTML = no_text;

            // Get confirm's height
            confirm_outer.style.top = '-10000px';
            confirm_outer.style.display = 'table';
            confirm_outer.style.top = '-' + confirm_outer.offsetHeight - 5 + 'px';
            confirm_background.style.display = 'block';

            setTimeout(function() {

                if (shadow) { confirm_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
                confirm_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
                confirm_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
                confirm_outer.style.transition = 'all ' + animation_delay + 's ease';

                confirm_outer.style.top = 0;
                confirm_background.style.opacity = '0.75';

                setTimeout(function() {
                    confirm_is_showing = true;
                }, (animation_delay * 1000 + 10));

            }, 20);

        }

        if (confirm_is_showing) {
            confirm_hide();
            setTimeout(function() {
                confirm_show_inner();
            }, (animation_delay * 1000 + 10));
        }
        else {
            confirm_show_inner();
        }

    }

    function confirm_hide() {

        confirm_outer.style.top = '-' + confirm_outer.offsetHeight - 5 + 'px';
        confirm_background.style.opacity = '0';

        setTimeout(function() {

            if (shadow) { confirm_outer.style.boxShadow = ''; }
            confirm_outer.style.MozTransition = '';
            confirm_outer.style.WebkitTransition = '';
            confirm_outer.style.transition = '';
            confirm_background.style.display = 'none';
            
            confirm_outer.style.top = '-10000px';

            scroll_enable();

            confirm_is_showing = false;

        }, (animation_delay * 1000 + 10));

    }
    
    
    
    
    // NOTIE.INPUT
    // *********************************************

    // input elements and styling
    var input_outer = document.createElement('div');
    input_outer.id = input_outer_id;
    input_outer.style.position = 'fixed';
    input_outer.style.top = '0';
    input_outer.style.left = '0';
    input_outer.style.zIndex = '999999998';
    input_outer.style.height = 'auto';
    input_outer.style.width = '100%';
    input_outer.style.display = 'none';
    input_outer.style.textAlign = 'center';
    input_outer.style.MozTransition = '';
    input_outer.style.WebkitTransition = '';
    input_outer.style.transition = '';

    var input_background = document.createElement('div');
    input_background.id = input_background_id;
    input_background.style.position = 'fixed';
    input_background.style.top = '0';
    input_background.style.left = '0';
    input_background.style.zIndex = '999999997';
    input_background.style.height = '100%';
    input_background.style.width = '100%';
    input_background.style.display = 'none';
    input_background.style.backgroundColor = 'white';
    input_background.style.MozTransition = 'all ' + animation_delay + 's ease';
    input_background.style.WebkitTransition = 'all ' + animation_delay + 's ease';
    input_background.style.transition = 'all ' + animation_delay + 's ease';
    input_background.style.opacity = '0';
    
    // Hide notie.input on background click
    input_background.onclick = function() {
        if (background_click_dismiss) {
            input_hide();
        }
    };

    var input_inner = document.createElement('div');
    input_inner.id = input_inner_id;
    input_inner.style.boxSizing = 'border-box';
    input_inner.style.width = '100%';
    input_inner.style.padding = '20px';
    input_inner.style.display = 'block';
    input_inner.style.cursor = 'default';
    input_inner.style.backgroundColor = confirm_and_input_color_background;
    input_outer.appendChild(input_inner);
    
    var input_div = document.createElement('div');
    input_div.id = input_div_id;
    input_div.style.boxSizing = 'border-box';
    input_div.style.height = '55px';
    input_div.style.width = '100%';
    input_div.style.display = 'block';
    input_div.style.cursor = 'default';
    input_div.style.backgroundColor = '#FFF';
    input_outer.appendChild(input_div);
    
    var input_field = document.createElement('input');
    input_field.id = input_field_id;    
    input_field.setAttribute('autocomplete', 'off');
    input_field.setAttribute('autocorrect', 'off');
    input_field.setAttribute('autocapitalize', 'off');
    input_field.setAttribute('spellcheck', 'false');
    input_field.style.boxSizing = 'border-box';
    input_field.style.height = '55px';
    input_field.style.width = '100%';
    input_field.style.textAlign = 'center';
    input_field.style.textIndent = '10px';
    input_field.style.paddingRight = '10px';
    input_field.style.outline = '0';
    input_field.style.border = '0';
    input_field.style.fontFamily = 'inherit';
    input_field.style.fontSize = font_size_big;
    if (window.innerWidth <= font_change_screen_width) { input_field.style.fontSize = font_size_small; }
    else { input_field.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_field), debounce_time), true);
    input_div.appendChild(input_field);

    var input_yes = document.createElement('div');
    input_yes.id = input_yes_id;
    input_yes.style.cssFloat = 'left';
    input_yes.style.height = '50px';
    input_yes.style.lineHeight = '50px';
    input_yes.style.width = '50%';
    input_yes.style.cursor = 'pointer';
    input_yes.style.backgroundColor = confirm_and_input_color_yes_background;
    input_outer.appendChild(input_yes);

    var input_no = document.createElement('div');
    input_no.id = input_no_id;
    input_no.style.cssFloat = 'right';
    input_no.style.height = '50px';
    input_no.style.lineHeight = '50px';
    input_no.style.width = '50%';
    input_no.style.cursor = 'pointer';
    input_no.style.backgroundColor = confirm_and_input_color_no_background;
    input_no.onclick = function() { input_hide(); }
    input_outer.appendChild(input_no);

    // Initialize input text
    var input_text = document.createElement('span');
    input_text.id = input_text_id;
    input_text.style.color = confirm_and_input_color_text;
    if (window.innerWidth <= font_change_screen_width) { input_text.style.fontSize = font_size_small; }
    else { input_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_text), debounce_time), true);
    input_inner.appendChild(input_text);

    var input_yes_text = document.createElement('span');
    input_yes_text.id = input_yes_text_id;
    input_yes_text.style.color = confirm_and_input_color_yes_text;
    if (window.innerWidth <= font_change_screen_width) { input_yes_text.style.fontSize = font_size_small; }
    else { input_yes_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_yes_text), debounce_time), true);
    input_yes.appendChild(input_yes_text);

    var input_no_text = document.createElement('span');
    input_no_text.id = input_no_text_id;
    input_no_text.style.color = confirm_and_input_color_no_text;
    if (window.innerWidth <= font_change_screen_width) { input_no_text.style.fontSize = font_size_small; }
    else { input_no_text.style.fontSize = font_size_big; }
    window.addEventListener('resize', debounce(resizeListener.bind(null, input_no_text), debounce_time), true);
    input_no.appendChild(input_no_text);

    // Attach input elements to the body element
    document.body.appendChild(input_outer);
    document.body.appendChild(input_background);

    // Declare variables
    var input_height = 0;
    var input_is_showing = false;

    function input(title, submit_text, cancel_text, type, placeholder, submit_callback, prefilled_value_optional) {
        
        // Blur active element for use of enter key, focus input
        document.activeElement.blur();
        setTimeout(function() { input_field.focus(); }, (animation_delay * 1000));
        
        input_field.setAttribute('type', type);
        input_field.setAttribute('placeholder', placeholder);
        input_field.value = '';
        if (typeof prefilled_value_optional !== 'undefined' && prefilled_value_optional.length > 0) { input_field.value = prefilled_value_optional }
        
        if (alert_is_showing) {
            // Hide notie.alert
            clearTimeout(alert_timeout_1);
            clearTimeout(alert_timeout_2);
            alert_hide(function() {
                input_show(title, submit_text, cancel_text, submit_callback);
            });
        }
        else {
            input_show(title, submit_text, cancel_text, submit_callback);
        }

    }
    function input_show(title, submit_text, cancel_text, submit_callback) {

        scroll_disable();

        // Yes callback function
        input_yes.onclick = function() {
            input_hide();
            setTimeout(function() {
                submit_callback(input_field.value);
            }, (animation_delay * 1000 + 10));
        }

        function input_show_inner() {

            // Set input text
            input_text.innerHTML = title;
            input_yes_text.innerHTML = submit_text;
            input_no_text.innerHTML = cancel_text;

            // Get input's height
            input_outer.style.top = '-10000px';
            input_outer.style.display = 'table';
            input_outer.style.top = '-' + input_outer.offsetHeight - 5 + 'px';
            input_background.style.display = 'block';

            setTimeout(function() {

                if (shadow) { input_outer.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.5)'; }
                input_outer.style.MozTransition = 'all ' + animation_delay + 's ease';
                input_outer.style.WebkitTransition = 'all ' + animation_delay + 's ease';
                input_outer.style.transition = 'all ' + animation_delay + 's ease';

                input_outer.style.top = 0;
                input_background.style.opacity = '0.75';

                setTimeout(function() {
                    input_is_showing = true;
                }, (animation_delay * 1000 + 10));

            }, 20);

        }

        if (input_is_showing) {
            input_hide();
            setTimeout(function() {
                input_show_inner();
            }, (animation_delay * 1000 + 10));
        }
        else {
            input_show_inner();
        }

    }

    function input_hide() {

        input_outer.style.top = '-' + input_outer.offsetHeight - 5 + 'px';
        input_background.style.opacity = '0';

        setTimeout(function() {

            if (shadow) { input_outer.style.boxShadow = ''; }
            input_outer.style.MozTransition = '';
            input_outer.style.WebkitTransition = '';
            input_outer.style.transition = '';
            input_background.style.display = 'none';
            
            input_outer.style.top = '-10000px';

            scroll_enable();

            input_is_showing = false;

        }, (animation_delay * 1000 + 10));

    }
    
    
    
    return {
        alert: alert,
        confirm: confirm,
        input: input
    };

}();

if (typeof module !== 'undefined' && module) {
    module.exports = notie;
}
},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvamF2YXNjcmlwdHMvYXBwLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbXBvbmVudHMvaGFtYnVyZ2VyLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXIuanMiLCJhcHAvamF2YXNjcmlwdHMvY29udHJvbGxlcnMvYWJvdXQuanMiLCJhcHAvamF2YXNjcmlwdHMvY29udHJvbGxlcnMvY29tcGFyaXNvbi5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9jb250aW51ZS5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9leHBlbnNlcy5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9nb2FsLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXJzL25hdi5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9wbGFuLmpzIiwiYXBwL2phdmFzY3JpcHRzL2NvbnRyb2xsZXJzL3JlbWluZGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy9jb250cm9sbGVycy9zY2VuYXJpb3MuanMiLCJhcHAvamF2YXNjcmlwdHMvZG9tLWhlbHBlcnMuanMiLCJhcHAvamF2YXNjcmlwdHMvaGVscGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC9hY3Rpb25zLmpzIiwiYXBwL2phdmFzY3JpcHRzL21vZGVsL2J1ZGdldC5qcyIsImFwcC9qYXZhc2NyaXB0cy9tb2RlbC9nb2Fscy5qcyIsImFwcC9qYXZhc2NyaXB0cy9wb2x5ZmlsbHMuanMiLCJhcHAvamF2YXNjcmlwdHMvdmlldy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9hYm91dC5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9jb21wYXJpc29uLWRldGFpbHMuanMiLCJhcHAvamF2YXNjcmlwdHMvdmlld3MvY29tcGFyaXNvbi5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9jb250aW51ZS5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9leHBlbnNlcy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9nb2FsLmpzIiwiYXBwL2phdmFzY3JpcHRzL3ZpZXdzL25hdi5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9wbGFuLmpzIiwiYXBwL2phdmFzY3JpcHRzL3ZpZXdzL3JlbWluZGVycy5qcyIsImFwcC9qYXZhc2NyaXB0cy92aWV3cy9zY2VuYXJpb3MuanMiLCJub2RlX21vZHVsZXMvYXRvYS9hdG9hLmpzIiwibm9kZV9tb2R1bGVzL2NoYXJ0aXN0L2Rpc3QvY2hhcnRpc3QuanMiLCJub2RlX21vZHVsZXMvY29udHJhL2RlYm91bmNlLmpzIiwibm9kZV9tb2R1bGVzL2NvbnRyYS9lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvY3Jvc3N2ZW50LmpzIiwibm9kZV9tb2R1bGVzL2Nyb3NzdmVudC9zcmMvZXZlbnRtYXAuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RyYWd1bGEvY2xhc3Nlcy5qcyIsIm5vZGVfbW9kdWxlcy9kcmFndWxhL2RyYWd1bGEuanMiLCJub2RlX21vZHVsZXMvbm90aWUvbm90aWUuanMiLCJub2RlX21vZHVsZXMvbm91aXNsaWRlci9kaXN0cmlidXRlL25vdWlzbGlkZXIuanMiLCJub2RlX21vZHVsZXMvcHVic3ViLWpzL3NyYy9wdWJzdWIuanMiLCJub2RlX21vZHVsZXMvdGlja3kvdGlja3ktYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxYUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3QwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9wb2x5ZmlsbHMnKTtcbnJlcXVpcmUoJy4vY29tcG9uZW50cy9oYW1idXJnZXInKTtcbi8vIHZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgbW9kZWwgPSByZXF1aXJlKCcuL21vZGVsJyk7XG52YXIgdmlldyA9IHJlcXVpcmUoJy4vdmlldycpO1xudmFyIGNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXInKTtcblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcbiAgbW9kZWwuaW5pdCgnd2VhbHRoQXBwJyk7XG4gIHZhciBpbml0aWFsU3RhdGUgPSBtb2RlbC5yZWFkKCk7XG4gIHZpZXcuaW5pdCgpO1xuICBjb250cm9sbGVyKG1vZGVsLCB2aWV3LmdldFZpZXdzKCksIGluaXRpYWxTdGF0ZSk7XG5cbiAgd2luZG93Lm1vZGVsID0gbW9kZWw7XG59O1xuXG5pbml0KCk7XG5cbi8vIHRyeSB7XG4vLyAgIGluaXQoKTtcbi8vIH0gY2F0Y2ggKGUpIHtcbi8vICAgY29uc29sZS5lcnJvcihlKTtcbi8vICAgLy9ARklYTUUgdXBkYXRlIGVtYWlsIGFkZHJlc3Ncbi8vICAgaGVscGVycy5tYWtlRXJyb3IobnVsbCwgJ1NvbWV0aGluZyB3cm9uZyBoYXBwZW5lZC4gUGxlYXNlIHRyeSByZWZyZXNoaW5nIHRoZSBwYWdlIGFuZCByZXBvcnQgdGhlIHByb2JsZW0gYXQgLi4uJyk7XG4vLyB9XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYy1oYW1idXJnZXInKTtcbnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtZW51LW9wZW4nKTtcbiAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbWVudS1vcGVuJyk7XG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgfVxufSk7IiwiLyoqXG4gKiBDb250cm9sbGVyIG1vZHVsZS4gVGhpcyBtb2R1bGUgZXhlY3V0ZXMgdGhlIGNvbnRyb2xsZXJzIGZvciBlYWNoIHZpZXcsIGluIE1WQ1xuICogcGF0dGVybi4gVG8gYmUgbW9yZSBwcmVjaXNlIHRoaXMgaXMgbW9yZSBsaWtlbHkgdGhlIFByZXNlbnRlciBpbiBNVlAgcGF0dGVybi5cbiAqIE91ciB2aWV3cy9zY3JlZW5zIGFyZSAnZHVtYicuIFRoZXkgZG9uJ3Qga25vdyBhbnl0aGluZyBhYm91dCB0aGUgTW9kZWwsIHNvXG4gKiB0aGUgUHJlc2VudGVyIGhhcyB0aGUgam9iIHRvIHVwZGF0ZSB0aGUgc2NyZWVucyB3aGVuIE1vZGVsIGNoYW5nZXMgYW5kIHZpY2V2ZXJzYS5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vYWRkeW9zbWFuaS5jb20vcmVzb3VyY2VzL2Vzc2VudGlhbGpzZGVzaWducGF0dGVybnMvYm9vay8jZGV0YWlsbXZwfVxuICogQG1vZHVsZSBjb250cm9sbGVyXG4gKi9cblxudmFyIGNvbnRyb2xsZXJzID0gW1xuICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2Fib3V0JyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvZXhwZW5zZXMnKSxcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9jb21wYXJpc29uJyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvc2NlbmFyaW9zJyksXG4gIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvZ29hbCcpLFxuICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL3BsYW4nKSxcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9yZW1pbmRlcnMnKSxcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9uYXYnKSxcbiAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9jb250aW51ZScpXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgLypcbiAgICogRXZlcnkgY29udHJvbGxlcidzIGpvYiBpcyBhbG1vc3QgdGhlIHNhbWU6XG4gICAqIC0gdG8gc2V0L3JlbmRlciB0aGUgdmlldyB0aGUgZmlyc3QgdGltZSwgb24gd2luZG93IGxvYWRcbiAgICogLSB0byBiaW5kIHVzZXIgaW50ZXJhY3Rpb25zIHRvIGZ1bmN0aW9ucyB3aGljaCB1cGRhdGUgdGhlIG1vZGVsXG4gICAqIC0gdG8gdXBkYXRlIHRoZSBET00gKHJlbmRlcmluZyB0aGUgZGF0YSkgd2hlbmV2ZXIgdGhlIE1vZGVsIGlzIGNoYW5nZWQgYnlcbiAgICogICBzdWJzY3JpYmluZyB0byBNb2RlbCBjaGFuZ2VzXG4gICAqIEBzZWUge0B1cmwgaHR0cHM6Ly9hZGR5b3NtYW5pLmNvbS9yZXNvdXJjZXMvZXNzZW50aWFsanNkZXNpZ25wYXR0ZXJucy9ib29rLyNvYnNlcnZlcnBhdHRlcm5qYXZhc2NyaXB0fVxuICAgKi9cbiAgY29udHJvbGxlcnMuZm9yRWFjaChmdW5jdGlvbihjb250cm9sbGVyLCBpbmRleCkge1xuICAgIGNvbnRyb2xsZXIobW9kZWwsIHZpZXdbaW5kZXhdLCBpbml0aWFsU3RhdGUpO1xuICB9KTtcbn07IiwidmFyIGJpbmRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgdmlldy5iaW5kKCdhZ2VDaGFuZ2VkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICBtb2RlbC51cGRhdGUoeydhYm91dEFnZSc6IHZhbHVlfSk7XG4gIH0pO1xuICB2aWV3LmJpbmQoJ2luY29tZUNoYW5nZWQnLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIG1vZGVsLnVwZGF0ZSh7J2Fib3V0SW5jb21lJzogdmFsdWV9KTtcbiAgfSk7XG4gIHZpZXcuYmluZCgnc2l0dWF0aW9uQ2hhbmdlZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgbW9kZWwudXBkYXRlKHsnYWJvdXRTaXR1YXRpb24nOiB2YWx1ZX0pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdsaXZpbmdDaGFuZ2VkJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICBtb2RlbC51cGRhdGUoeydhYm91dExpdmluZyc6IHZhbHVlfSk7XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbih2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgdmFyIGFnZSA9IGluaXRpYWxTdGF0ZS5hYm91dEFnZTtcbiAgdmFyIGluY29tZSA9IGluaXRpYWxTdGF0ZS5hYm91dEluY29tZTtcbiAgdmFyIHNpdHVhdGlvbiA9IGluaXRpYWxTdGF0ZS5hYm91dFNpdHVhdGlvbjtcbiAgdmFyIGxpdmluZyA9IGluaXRpYWxTdGF0ZS5hYm91dExpdmluZztcblxuICB2aWV3LnJlbmRlcignc2hvd1NsaWRlcnMnLCB7YWdlOiBhZ2UsIGluY29tZTogaW5jb21lfSk7XG4gIHZpZXcucmVuZGVyKCdzZXRTZWxlY3RzJywge3NpdHVhdGlvbjogc2l0dWF0aW9uLCBsaXZpbmc6IGxpdmluZ30pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHNldFZpZXcodmlldywgaW5pdGlhbFN0YXRlKTtcbiAgYmluZFZpZXcobW9kZWwsIHZpZXcpO1xufTsiLCIvLyB2YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBQdWJTdWIgPSByZXF1aXJlKCdwdWJzdWItanMnKTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICAvL3dlIGRvbid0IHVzZSBpbml0aWFsU3RhdGUgYmVjYXVzZSBzZXRWaWV3KCkgaXMgdXNlZCBhbHNvIHdoZW4gdGhlcmUgYXJlXG4gIC8vZXZlbnRzIHdoaWNoIG5lZWQgYSBjb21wbGV0ZSByZS1yZW5kZXIgc3VjaCBhcyAnYWJvdXRJbmNvbWUnIGNoYW5nZWRcbiAgdmFyIHN0YXRlID0gbW9kZWwucmVhZCgpO1xuICB2YXIgaW5jb21lID0gc3RhdGUuYWJvdXRJbmNvbWU7XG4gIHZhciBiYXNpY1JhdGUgPSBzdGF0ZS5hYm91dEJhc2ljUmF0ZTtcbiAgdmFyIGRpc2NSYXRlID0gc3RhdGUuYWJvdXREaXNjcmV0aW9uYXJ5UmF0ZTtcbiAgdmFyIHNhdmluZ3NSYXRlID0gc3RhdGUuYWJvdXRTYXZpbmdzUmF0ZTtcbiAgdmFyIHVzZXJFeHBlbnNlcyA9IHN0YXRlLmV4cGVuc2VzO1xuICB2YXIgb3RoZXJzRXhwZW5zZXMgPSBtb2RlbC5nZXREZWZhdWx0UmF0ZXMoaW5jb21lLCB0cnVlKTtcblxuICB2aWV3LnJlbmRlcignc2hvd1N1bW1hcnlDaGFydCcsIHtcbiAgICB1c2VyOiB7XG4gICAgICBiYXNpY1JhdGU6IGJhc2ljUmF0ZSxcbiAgICAgIGRpc2NSYXRlOiBkaXNjUmF0ZSxcbiAgICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZVxuICAgIH0sXG4gICAgb3RoZXJzOiBvdGhlcnNFeHBlbnNlc1xuICB9KTtcbiAgdmlldy5yZW5kZXIoJ3Nob3dVc2VyRXhwZW5zZXMnLCB7XG4gICAgaW5jb21lOiBpbmNvbWUsXG4gICAgYmFzaWNSYXRlOiBiYXNpY1JhdGUsXG4gICAgZGlzY1JhdGU6IGRpc2NSYXRlLFxuICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZVxuICB9KTtcbiAgdmlldy5yZW5kZXIoJ3Nob3dPdGhlcnNFeHBlbnNlcycsIHtcbiAgICBpbmNvbWU6IGluY29tZSxcbiAgICBvdGhlcnNFeHBlbnNlczogb3RoZXJzRXhwZW5zZXNcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93RGV0YWlsZWRDaGFydCcsIHtcbiAgICB1c2VyRXhwZW5zZXM6IHVzZXJFeHBlbnNlcyxcbiAgICBvdGhlcnNFeHBlbnNlczogb3RoZXJzRXhwZW5zZXMuZGV0YWlsZWRcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93Q29uY2x1c2lvbicsIHtcbiAgICB1c2VyRXhwZW5zZXM6IHtcbiAgICAgIGJhc2ljOiBiYXNpY1JhdGUsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiBkaXNjUmF0ZSxcbiAgICAgIHNhdmluZ3M6IHNhdmluZ3NSYXRlXG4gICAgfSxcbiAgICBvdGhlcnNFeHBlbnNlczogb3RoZXJzRXhwZW5zZXNcbiAgfSk7XG59O1xuXG52YXIgc3Vic2NyaWJlciA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCB0b3BpYywgbXNnKSB7XG4gIGlmICh0b3BpYyA9PT0gJ2Fib3V0U2F2aW5nc1JhdGUnKSB7XG4gICAgdmFyIGRhdGEgPSBtb2RlbC5yZWFkKCk7XG4gICAgdmFyIGluY29tZSA9IGRhdGEuYWJvdXRJbmNvbWU7XG4gICAgdmFyIGJhc2ljUmF0ZSA9IGRhdGEuYWJvdXRCYXNpY1JhdGU7XG4gICAgdmFyIGRpc2NSYXRlID0gZGF0YS5hYm91dERpc2NyZXRpb25hcnlSYXRlO1xuICAgIHZhciBzYXZpbmdzUmF0ZSA9IGRhdGEuYWJvdXRTYXZpbmdzUmF0ZTtcbiAgICB2YXIgdXNlckV4cGVuc2VzID0ge1xuICAgICAgYmFzaWM6IGJhc2ljUmF0ZSxcbiAgICAgIGRpc2NyZXRpb25hcnk6IGRpc2NSYXRlLFxuICAgICAgc2F2aW5nczogc2F2aW5nc1JhdGVcbiAgICB9O1xuICAgIHZhciBvdGhlcnNFeHBlbnNlcyA9ICBtb2RlbC5nZXREZWZhdWx0UmF0ZXMoaW5jb21lKTtcblxuICAgIHZpZXcucmVuZGVyKCdzaG93VXNlckV4cGVuc2VzJywge1xuICAgICAgYmFzaWNSYXRlOiBiYXNpY1JhdGUsXG4gICAgICBkaXNjUmF0ZTogZGlzY1JhdGUsXG4gICAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgICB9KTtcbiAgICB2aWV3LnJlbmRlcigndXBkYXRlU3VtbWFyeUNoYXJ0Jywge1xuICAgICAgdXNlckV4cGVuc2VzOiB1c2VyRXhwZW5zZXMsXG4gICAgICBvdGhlcnNFeHBlbnNlczpvdGhlcnNFeHBlbnNlc1xuICAgIH0pO1xuICAgIHZpZXcucmVuZGVyKCdzaG93Q29uY2x1c2lvbicsIHtcbiAgICAgIHVzZXJFeHBlbnNlczogdXNlckV4cGVuc2VzLFxuICAgICAgb3RoZXJzRXhwZW5zZXM6IG90aGVyc0V4cGVuc2VzXG4gICAgfSk7XG4gIH0gZWxzZSBpZih0b3BpYyA9PT0gJ2V4cGVuc2VzJykge1xuICAgIHZpZXcucmVuZGVyKCd1cGRhdGVEZXRhaWxlZENoYXJ0Jywge1xuICAgICAgdXNlckV4cGVuc2VzOiBtc2dcbiAgICB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICBzZXRWaWV3KG1vZGVsLCB2aWV3KTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRJbmNvbWUnLCBmdW5jdGlvbigpIHtcbiAgICBzZXRWaWV3KG1vZGVsLCB2aWV3KTtcbiAgfSk7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2Fib3V0U2F2aW5nc1JhdGUnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnc3RlcC5jb21wYXJpc29uJywgZnVuY3Rpb24oKSB7XG4gICAgc2V0Vmlldyhtb2RlbCwgdmlldyk7XG4gIH0pO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdleHBlbnNlcycsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xufTsiLCJ2YXIgUHViU3ViID0gcmVxdWlyZSgncHVic3ViLWpzJyk7XG5cbnZhciBiaW5kVmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHZpZXcuYmluZCgnY29udGludWVDbGlja2VkJywgZnVuY3Rpb24oc3RlcE5hbWUpIHtcbiAgICBQdWJTdWIucHVibGlzaCgnYWN0aXZhdGVTdGVwJywgc3RlcE5hbWUpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgYmluZFZpZXcobW9kZWwsIHZpZXcpO1xufTsiLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBQdWJTdWIgPSByZXF1aXJlKCdwdWJzdWItanMnKTtcbnZhciBub3RpZSA9IHJlcXVpcmUoJ25vdGllJyk7XG5cbnZhciBiaW5kVmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHZpZXcuYmluZCgnYmFzaWNSYXRlQ2hhbmdlZCcsIGZ1bmN0aW9uKGJhc2ljUmF0ZSkge1xuICAgIHZhciBkaXNjUmF0ZSA9IG1vZGVsLnJlYWQoJ2Fib3V0RGlzY3JldGlvbmFyeVJhdGUnKTtcbiAgICB2YXIgc2F2aW5nc1JhdGUgPSAxMDAgLSBiYXNpY1JhdGUgLSBkaXNjUmF0ZTtcblxuICAgIGlmKHNhdmluZ3NSYXRlIDwgMCkge1xuICAgICAgdmlldy5yZW5kZXIoJ3NldFNsaWRlcicsIHtcbiAgICAgICAgc2xpZGVyTmFtZTogJ2Jhc2ljJyxcbiAgICAgICAgdmFsdWU6IG1vZGVsLnJlYWQoJ2Fib3V0QmFzaWNSYXRlJylcbiAgICAgIH0pO1xuICAgICAgaGVscGVycy5tYWtlRXJyb3IoJ3VzZXInLCAnRXJyb3I6IHRoZSBzdW0gb2YgYmFzaWMgJiBkaXNjcmV0aW9uYXJ5IHJhdGVzIGFyZSBzdXBlcmlvciB0aGFuIDEwMCcsIG5vdGllLmFsZXJ0LmJpbmQobnVsbCwgMykpO1xuICAgIH1cblxuICAgIG1vZGVsLnVwZGF0ZSh7YWJvdXRCYXNpY1JhdGU6IGJhc2ljUmF0ZX0pO1xuICAgIG1vZGVsLnVwZGF0ZSh7YWJvdXRTYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGV9KTtcbiAgICB2aWV3LnJlbmRlcigndXBkYXRlUGllQ2hhcnQnLCB7XG4gICAgICBiYXNpY1JhdGU6IGJhc2ljUmF0ZSxcbiAgICAgIGRpc2NSYXRlOiBkaXNjUmF0ZSxcbiAgICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZVxuICAgIH0pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdkaXNjUmF0ZUNoYW5nZWQnLCBmdW5jdGlvbihkaXNjUmF0ZSkge1xuICAgIHZhciBiYXNpY1JhdGUgPSBtb2RlbC5yZWFkKCdhYm91dEJhc2ljUmF0ZScpO1xuICAgIHZhciBzYXZpbmdzUmF0ZSA9IDEwMCAtIGJhc2ljUmF0ZSAtIGRpc2NSYXRlO1xuXG4gICAgaWYoc2F2aW5nc1JhdGUgPCAwKSB7XG4gICAgICB2aWV3LnJlbmRlcignc2V0U2xpZGVyJywge1xuICAgICAgICBzbGlkZXJOYW1lOiAnZGlzY3JldGlvbmFyeScsXG4gICAgICAgIHZhbHVlOiBtb2RlbC5yZWFkKCdhYm91dERpc2NyZXRpb25hcnlSYXRlJylcbiAgICAgIH0pO1xuICAgICAgaGVscGVycy5tYWtlRXJyb3IoJ3VzZXInLCAnRXJyb3I6IHRoZSBzdW0gb2YgYmFzaWMgJiBkaXNjcmV0aW9uYXJ5IHJhdGVzIGFyZSBzdXBlcmlvciB0aGFuIDEwMCcsIG5vdGllLmFsZXJ0LmJpbmQobnVsbCwgMykpO1xuICAgIH1cblxuICAgIG1vZGVsLnVwZGF0ZSh7J2Fib3V0RGlzY3JldGlvbmFyeVJhdGUnOiBkaXNjUmF0ZX0pO1xuICAgIG1vZGVsLnVwZGF0ZSh7J2Fib3V0U2F2aW5nc1JhdGUnOiBzYXZpbmdzUmF0ZX0pO1xuICAgIHZpZXcucmVuZGVyKCd1cGRhdGVQaWVDaGFydCcsIHtcbiAgICAgIGJhc2ljUmF0ZTogYmFzaWNSYXRlLFxuICAgICAgZGlzY1JhdGU6IGRpc2NSYXRlLFxuICAgICAgc2F2aW5nc1JhdGU6IHNhdmluZ3NSYXRlXG4gICAgfSk7XG4gIH0pO1xuICB2aWV3LmJpbmQoJ2N1cnJlbnRTYXZpbmdzQ2hhbmdlZCcsIGZ1bmN0aW9uKGN1cnJlbnRTYXZpbmdzKSB7XG4gICAgbW9kZWwudXBkYXRlKHsnY3VycmVudFNhdmluZ3MnOiBjdXJyZW50U2F2aW5nc30pO1xuICB9KTtcbiAgdmlldy5iaW5kKCdkZXRhaWxzQ2hhbmdlZCcsIGZ1bmN0aW9uKCkge30pO1xuICB2aWV3LmJpbmQoJ2RldGFpbHNSZXNldCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbmNvbWUgPSBtb2RlbC5yZWFkKCdhYm91dEluY29tZScpO1xuICAgIHZhciBkZWZhdWx0RXhwZW5zZXMgPSBtb2RlbC5nZXREZWZhdWx0UmF0ZXMoaW5jb21lLCB0cnVlKS5kZXRhaWxlZDtcblxuICAgIHZpZXcucmVuZGVyKCdzaG93RGV0YWlsZWQnLCB7XG4gICAgICBleHBlbnNlczogZGVmYXVsdEV4cGVuc2VzXG4gICAgfSk7XG4gIH0pO1xuICB2aWV3LmJpbmQoJ2RldGFpbHNTYXZlZCcsIGZ1bmN0aW9uKGVyciwgdmFsdWVzKSB7XG4gICAgaWYoZXJyKSB7XG4gICAgICBub3RpZS5hbGVydCgzLCBlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3VtbWFyeUV4cGVuc2VzID0gbW9kZWwuZ2V0U3VtbWFyeUV4cGVuc2VzKHZhbHVlcyk7XG4gICAgICB2aWV3LnJlbmRlcignc2V0U2xpZGVyJywge1xuICAgICAgICBzbGlkZXJOYW1lOiAnYmFzaWMnLFxuICAgICAgICB2YWx1ZTogc3VtbWFyeUV4cGVuc2VzLmJhc2ljXG4gICAgICB9KTtcbiAgICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICAgIHNsaWRlck5hbWU6ICdkaXNjcmV0aW9uYXJ5JyxcbiAgICAgICAgdmFsdWU6IHN1bW1hcnlFeHBlbnNlcy5kaXNjcmV0aW9uYXJ5XG4gICAgICB9KTtcbiAgICAgIG1vZGVsLnVwZGF0ZSh7ZXhwZW5zZXM6IHZhbHVlc30pO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgc2V0VmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgdmFyIGluY29tZSA9IGluaXRpYWxTdGF0ZS5hYm91dEluY29tZTtcbiAgdmFyIGJhc2ljUmF0ZSA9IGluaXRpYWxTdGF0ZS5hYm91dEJhc2ljUmF0ZTtcbiAgdmFyIGRpc2NSYXRlID0gaW5pdGlhbFN0YXRlLmFib3V0RGlzY3JldGlvbmFyeVJhdGU7XG4gIHZhciBjdXJyZW50U2F2aW5ncyA9IGluaXRpYWxTdGF0ZS5jdXJyZW50U2F2aW5ncztcbiAgdmFyIGV4cGVuc2VzID0gaW5pdGlhbFN0YXRlLmV4cGVuc2VzO1xuXG4gIC8vSWYgdXNlciBoYXMgbm90IGVudGVyZWQgZGV0YWlsZWQgZXhwZW5zZXMgeWV0XG4gIGlmKGV4cGVuc2VzLmxlbmd0aCA9PSAwKSB7XG4gICAgZXhwZW5zZXMgPSBtb2RlbC5nZXREZWZhdWx0UmF0ZXMoaW5jb21lLCB0cnVlKS5kZXRhaWxlZDtcbiAgfVxuXG4gIHZpZXcucmVuZGVyKCdzaG93U2xpZGVycycsIHtcbiAgICBiYXNpY1JhdGU6IGJhc2ljUmF0ZSxcbiAgICBkaXNjUmF0ZTogZGlzY1JhdGUsXG4gICAgY3VycmVudFNhdmluZ3M6IGN1cnJlbnRTYXZpbmdzXG4gIH0pO1xuICB2aWV3LnJlbmRlcignc2hvd1BpZUNoYXJ0Jywge1xuICAgIGluY29tZTogaW5jb21lLFxuICAgIGJhc2ljUmF0ZTogYmFzaWNSYXRlLFxuICAgIGRpc2NSYXRlOiBkaXNjUmF0ZVxuICB9KTtcbiAgdmlldy5yZW5kZXIoJ3Nob3dEZXRhaWxlZCcsIHtcbiAgICBleHBlbnNlczogZXhwZW5zZXNcbiAgfSk7XG59O1xuXG52YXIgc3Vic2NyaWJlciA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCB0b3BpYywgZGF0YSkge1xuICBpZiAodG9waWMgPT09ICdhYm91dEluY29tZScpIHtcbiAgICAvL2RhdGEgaXMgdGhlIG5ldyBpbmNvbWVcbiAgICB2YXIgZGVmYXVsdFJhdGVzID0gbW9kZWwuZ2V0RGVmYXVsdFJhdGVzKGRhdGEsIHRydWUpO1xuICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICBzbGlkZXJOYW1lOiAnYmFzaWMnLFxuICAgICAgdmFsdWU6IGRlZmF1bHRSYXRlcy5iYXNpY1xuICAgIH0pO1xuICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICBzbGlkZXJOYW1lOiAnZGlzY3JldGlvbmFyeScsXG4gICAgICB2YWx1ZTogZGVmYXVsdFJhdGVzLmRpc2NyZXRpb25hcnlcbiAgICB9KTtcbiAgICB2aWV3LnJlbmRlcigndXBkYXRlUGllVG9vbHRpcCcsIGRhdGEpO1xuICAgIHZpZXcucmVuZGVyKCdzaG93RGV0YWlsZWQnLCB7XG4gICAgICBleHBlbnNlczogZGVmYXVsdFJhdGVzLmRldGFpbGVkXG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2Fib3V0SW5jb21lJywgc3Vic2NyaWJlci5iaW5kKG51bGwsIG1vZGVsLCB2aWV3KSk7XG59OyIsInZhciBiaW5kVmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHZpZXcuYmluZCgnZ29hbFRvZ2dsZWQnLCBmdW5jdGlvbihnb2FsKSB7XG4gICAgbW9kZWwudG9nZ2xlR29hbChnb2FsKTtcbiAgfSk7XG59O1xuXG52YXIgc2V0VmlldyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgdmlldy5yZW5kZXIoJ3Nob3dHb2FscycsIHtcbiAgICBnb2Fsc0xpc3Q6IG1vZGVsLmdldEdvYWxzKCksXG4gICAgcGlja2VkR29hbHM6IGluaXRpYWxTdGF0ZS5nb2Fsc1xuICB9KTtcbiAgdmlldy5yZW5kZXIoJ2NyZWF0ZVRvb2x0aXBzJyk7XG4gIHZpZXcucmVuZGVyKCdzZXREcmFnRHJvcCcpO1xuICB2aWV3LnJlbmRlcignY3JlYXRlRGF0ZXBpY2tlcnMnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG59OyIsInZhciBQdWJTdWIgPSByZXF1aXJlKCdwdWJzdWItanMnKTtcblxudmFyIGJpbmRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgdmlldy5iaW5kKCdsaW5rQ2xpY2tlZCcsIGZ1bmN0aW9uKG5leHRTdGVwKSB7XG4gICAgaWYobmV4dFN0ZXApIHtcbiAgICAgIFB1YlN1Yi5wdWJsaXNoKCdzdGVwLicgKyBuZXh0U3RlcCk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24odmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHZhciBsYXN0VXNlclN0ZXAgPSBpbml0aWFsU3RhdGUubGFzdFVzZXJTdGVwO1xuXG4gIHZpZXcucmVuZGVyKCdkaXNhYmxlTGlua3MnLCB7bGFzdFVzZXJTdGVwOiBsYXN0VXNlclN0ZXB9KTtcbn07XG5cbnZhciBzdWJzY3JpYmVyID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIHRvcGljLCBkYXRhKSB7XG4gIHZhciBzdGVwTmFtZSA9IGRhdGE7XG4gIHZhciBzdGVwTnVtYmVyID0gTnVtYmVyKGRvY3VtZW50LmdldCgnc3RlcC1uYW1lLS0nICsgc3RlcE5hbWUpLmdldCgnc3RlcC1udW1iZXInKS50ZXh0Q29udGVudCk7XG4gIHZhciBsYXN0VXNlclN0ZXAgPSBtb2RlbC5yZWFkKCdsYXN0VXNlclN0ZXAnKTtcblxuICB2aWV3LnJlbmRlcignYWN0aXZhdGVTdGVwJywge1xuICAgIHN0ZXBOYW1lOiBzdGVwTmFtZVxuICB9KTtcblxuICBpZihsYXN0VXNlclN0ZXAgPCBzdGVwTnVtYmVyKSB7XG4gICAgbW9kZWwudXBkYXRlKHtsYXN0VXNlclN0ZXA6IHN0ZXBOdW1iZXJ9KTtcbiAgfVxuXG4gIFB1YlN1Yi5wdWJsaXNoKCdzdGVwLicgKyBzdGVwTmFtZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpIHtcbiAgc2V0Vmlldyh2aWV3LCBpbml0aWFsU3RhdGUpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG4gIFB1YlN1Yi5zdWJzY3JpYmUoJ2FjdGl2YXRlU3RlcCcsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xuXG4gIC8qIERFVkVMT1BNRU5UIE9OTFkgKi9cbiAgLy9ATk9URSBUaGlzIGNvdWxkIGJlIHVzZWZ1bCBhbHNvIGZvciB1c2VycyBhbmQgbm90IG9ubHkgZm9yIGRldmVsb3BtZW50XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldCgncmVzZXQtbW9kZWwnKTtcbiAgcmVzZXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBtb2RlbC5yZXNldCgpO1xuICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9KTtcbn07IiwidmFyIFB1YlN1YiA9IHJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LmJpbmQoJ2FjdGlvblRvZ2dsZWQnLCBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBtb2RlbC50b2dnbGVBY3Rpb25zKGFjdGlvbik7XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHZhciBnb2FscyA9IGluaXRpYWxTdGF0ZS5nb2FscztcbiAgdmFyIGdvYWxzQWN0aW9ucyA9IGdvYWxzLm1hcChmdW5jdGlvbihnb2FsKSB7XG4gICAgdmFyIGFjdGlvbnMgPSBtb2RlbC5nZXRBY3Rpb25zKGdvYWwuaWQpO1xuICAgIGlmKGFjdGlvbnMpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBnb2FsLCB7YWN0aW9uczogYWN0aW9uc30pO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uKGdvYWxBY3Rpb25zKSB7IC8vZmlsdGVyIG5vdCB1bmRlZmluZWQgZ29hbCBhY3Rpb25zXG4gICAgcmV0dXJuIGdvYWxBY3Rpb25zO1xuICB9KTtcbiAgLy8gV2UgYWRkIHRoZSBnZW5lcmFsIHRpcHMgdG8gdGhlIGJlZ2lubmluZ1xuICBnb2Fsc0FjdGlvbnMudW5zaGlmdCh7XG4gICAgaWQ6ICdnZW5lcmFsJyxcbiAgICBhY3Rpb25zOiBtb2RlbC5nZXRBY3Rpb25zKCdnZW5lcmFsJylcbiAgfSk7XG5cbiAgdmlldy5yZW5kZXIoJ3Nob3dHb2Fsc0FjdGlvbnMnLCBnb2Fsc0FjdGlvbnMpO1xuICB2aWV3LnJlbmRlcignY3JlYXRlUG9wb3ZlcnMnKTtcbn07XG5cbnZhciBzdWJzY3JpYmVyID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIHRvcGljLCBkYXRhKSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcsIHtnb2FsczogZGF0YX0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2RlbCwgdmlldywgaW5pdGlhbFN0YXRlKSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSk7XG4gIGJpbmRWaWV3KG1vZGVsLCB2aWV3KTtcbiAgUHViU3ViLnN1YnNjcmliZSgnZ29hbHMnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbn07IiwidmFyIGJpbmRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcpIHtcbiAgdmlldy5iaW5kKCdwcmludENsaWNrZWQnLCBmdW5jdGlvbigpIHtcbiAgICB2aWV3LnJlbmRlcigncHJpbnRQbGFuJyk7XG4gIH0pO1xufTtcblxudmFyIHNldFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2aWV3LnJlbmRlcignY3JlYXRlUG9wb3ZlcnMnKTtcbiAgdmlldy5yZW5kZXIoJ2NyZWF0ZURhdGVQaWNrZXJzJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3KSB7XG4gIHNldFZpZXcobW9kZWwsIHZpZXcpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG59OyIsIi8vIHZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyIFB1YlN1YiA9IHJlcXVpcmUoJ3B1YnN1Yi1qcycpO1xuLy8gdmFyIG5vdGllID0gcmVxdWlyZSgnbm90aWUnKTtcblxudmFyIHJlbmRlclVwZGF0ZSA9IGZ1bmN0aW9uKG1vZGVsLCB2aWV3LCBwcm9wTmFtZSwgcHJvcFZhbHVlKSB7XG4gIHZhciBzdGF0ZSA9IG1vZGVsLnJlYWQoKTtcbiAgdmFyIGRhdGEgPSB7XG4gICAgaW5jb21lOiBzdGF0ZS5hYm91dEluY29tZSxcbiAgICBzYXZpbmdzUmF0ZTogc3RhdGUuYWJvdXRTYXZpbmdzUmF0ZSxcbiAgICBhZ2U6IHN0YXRlLmFib3V0QWdlLFxuICAgIGN1cnJlbnRTYXZpbmdzOiBzdGF0ZS5jdXJyZW50U2F2aW5nc1xuICB9O1xuICBkYXRhW3Byb3BOYW1lXSA9IHByb3BWYWx1ZTtcblxuICB2aWV3LnJlbmRlcigndXBkYXRlTGluZUNoYXJ0U2VyaWUnLCBkYXRhKTtcbn07XG5cbnZhciBzZXRWaWV3ID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICB2YXIgYWdlID0gaW5pdGlhbFN0YXRlLmFib3V0QWdlO1xuICB2YXIgaW5jb21lID0gaW5pdGlhbFN0YXRlLmFib3V0SW5jb21lO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBpbml0aWFsU3RhdGUuYWJvdXRTYXZpbmdzUmF0ZTtcbiAgdmFyIGN1cnJlbnRTYXZpbmdzID0gaW5pdGlhbFN0YXRlLmN1cnJlbnRTYXZpbmdzO1xuXG4gIHZpZXcucmVuZGVyKCdzaG93U2xpZGVycycsIHtcbiAgICBpbmNvbWU6IGluY29tZSxcbiAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGVcbiAgfSk7XG4gIHZpZXcucmVuZGVyKCdzaG93TGluZUNoYXJ0Jywge1xuICAgIGFnZTogYWdlLFxuICAgIGluY29tZTogaW5jb21lLFxuICAgIHNhdmluZ3NSYXRlOiBzYXZpbmdzUmF0ZSxcbiAgICBjdXJyZW50U2F2aW5nczogY3VycmVudFNhdmluZ3NcbiAgfSk7XG59O1xuXG52YXIgYmluZFZpZXcgPSBmdW5jdGlvbihtb2RlbCwgdmlldykge1xuICB2YXIgYmluZGVkUmVuZGVyVXBkYXRlID0gcmVuZGVyVXBkYXRlLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpO1xuICB2YXIgZXZlbnRzID0gW1xuICAgICdhbm51YWxJbnRlcmVzdFJhdGVDaGFuZ2VkJyxcbiAgICAnc2F2aW5nc1JhdGVDaGFuZ2VkJyxcbiAgICAnaW5jb21lQ2hhbmdlZCcsXG4gICAgJ2ludmVzdG1lbnRSYXRlQ2hhbmdlZCcsXG4gICAgJ3JldGlyZW1lbnRBZ2VDaGFuZ2VkJ1xuICBdO1xuXG4gIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgIHZpZXcuYmluZChldmVudE5hbWUsIGJpbmRlZFJlbmRlclVwZGF0ZS5iaW5kKG51bGwsICBldmVudE5hbWUucmVwbGFjZSgnQ2hhbmdlZCcsICcnKSkpO1xuICB9KTtcbn07XG5cbnZhciBzdWJzY3JpYmVyID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIHRvcGljLCBkYXRhKSB7XG4gIHZhciBiaW5kZWRSZW5kZXJVcGRhdGUgPSByZW5kZXJVcGRhdGUuYmluZChudWxsLCBtb2RlbCwgdmlldyk7XG5cbiAgaWYgKHRvcGljID09PSAnYWJvdXRBZ2UnKSB7XG4gICAgYmluZGVkUmVuZGVyVXBkYXRlKCdhZ2UnLCBkYXRhKTtcbiAgfSBlbHNlIGlmKHRvcGljID09PSAnYWJvdXRJbmNvbWUnKSB7XG4gICAgdmlldy5yZW5kZXIoJ3NldFNsaWRlcicsIHtcbiAgICAgIHNsaWRlck5hbWU6ICdpbmNvbWUnLFxuICAgICAgdmFsdWU6IGRhdGFcbiAgICB9KTtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ2luY29tZScsIGRhdGEpO1xuICB9IGVsc2UgaWYodG9waWMgPT09ICdhYm91dFNhdmluZ3NSYXRlJykge1xuICAgIHZpZXcucmVuZGVyKCdzZXRTbGlkZXInLCB7XG4gICAgICBzbGlkZXJOYW1lOiAnc2F2aW5nc1JhdGUnLFxuICAgICAgdmFsdWU6IGRhdGFcbiAgICB9KTtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ3NhdmluZ3NSYXRlJywgZGF0YSk7XG4gIH0gZWxzZSBpZiAodG9waWMgPT09ICdjdXJyZW50U2F2aW5ncycpIHtcbiAgICBiaW5kZWRSZW5kZXJVcGRhdGUoJ2N1cnJlbnRTYXZpbmdzJywgZGF0YSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kZWwsIHZpZXcsIGluaXRpYWxTdGF0ZSkge1xuICBzZXRWaWV3KG1vZGVsLCB2aWV3LCBpbml0aWFsU3RhdGUpO1xuICBiaW5kVmlldyhtb2RlbCwgdmlldyk7XG5cbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRBZ2UnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRJbmNvbWUnLCBzdWJzY3JpYmVyLmJpbmQobnVsbCwgbW9kZWwsIHZpZXcpKTtcbiAgUHViU3ViLnN1YnNjcmliZSgnYWJvdXRTYXZpbmdzUmF0ZScsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xuICBQdWJTdWIuc3Vic2NyaWJlKCdjdXJyZW50U2F2aW5ncycsIHN1YnNjcmliZXIuYmluZChudWxsLCBtb2RlbCwgdmlldykpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgbm9VaVNsaWRlciA9IHJlcXVpcmUoJ25vdWlzbGlkZXInKTtcblxuLyoqXG4gKiBBcHBlbmRzIGFuIEhUTUwgZWxlbWVudCBhcyB0b29sdGlwIHRvIHRoZSBzbGlkZXJcbiAqIEBwYXJhbSAge29iamVjdH0gc2xpZGVyIFNsaWRlciBET00gRWxlbWVudFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIgYXBwZW5kVG9vbHRpcCA9IGZ1bmN0aW9uKHNsaWRlcikge1xuICBpZighc2xpZGVyLmFwcGVuZENoaWxkKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHNsaWRlcik7XG4gIH1cblxuICB2YXIgaGFuZGxlID0gc2xpZGVyLmdldCgnbm9VaS1oYW5kbGUnKTtcbiAgdmFyIHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdG9vbHRpcC5jbGFzc0xpc3QuYWRkKCdzbGlkZXItdG9vbHRpcCcpO1xuICB0b29sdGlwLmlubmVySFRNTCA9ICc8c3Bhbj48L3NwYW4+JztcbiAgaGFuZGxlLmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gIHJldHVybiBzbGlkZXI7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIHNsaWRlciB1c2luZyBub1VpU2xpZGVyXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCBIVE1MIE5vZGUgb2YgdGhlIHNsaWRlclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIFNsaWRlciBvcHRpb25zXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGZvcm1hdCBUb29sdGlwIHZhbHVlIGZvcm1hdFxuICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRvb2x0aXAtaGFuZGxlXG4gKi9cbnZhciBjcmVhdGVTbGlkZXIgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2Ygbm9VaVNsaWRlciAhPT0gJ29iamVjdCcpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcihudWxsLCAnbm91aXNsaWRlciBvYmplY3QgaXMgbm90IGRlY2xhcmVkLicpO1xuICB9XG4gIG5vVWlTbGlkZXIuY3JlYXRlKGVsZW1lbnQsIG9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn07XG5cbnZhciB1cGRhdGVIYW5kbGVyID0gZnVuY3Rpb24oc2xpZGVyLCBmb3JtYXQpIHtcbiAgdmFyIHRvb2x0aXAgPSBzbGlkZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHRvb2x0aXAuaW5uZXJIVE1MID0gaGVscGVycy5mb3JtYXQodmFsdWVzWzBdLCBmb3JtYXQpO1xuICB9KTtcbn07XG5cbnZhciBzbGlkZXJXaXRoVG9vbHRpcHMgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zLCBmb3JtYXQpIHtcbiAgdXBkYXRlSGFuZGxlcihcbiAgICBhcHBlbmRUb29sdGlwKCBjcmVhdGVTbGlkZXIoZWxlbWVudCwgb3B0aW9ucykgKSxcbiAgICBmb3JtYXRcbiAgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBhIGNsYXNzTmFtZSBmcm9tIHRoZSBjdXJyZW50IGFjdGl2ZSBlbGVtZW50IGFuZCBhcHBsaWVzIGl0IHRvIHRoZVxuICogbmV3IG9uZVxuICogQHBhcmFtIHtFbGVtZW50fSBuZXdBY3RpdmUgTmV3IGFjdGl2ZSBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lIENsYXNzbmFtZSB0byBhcHBseVxuICovXG52YXIgc2V0QWN0aXZlID0gZnVuY3Rpb24obmV3QWN0aXZlLCBjbGFzc05hbWUpIHtcbiAgdmFyIG9sZEFjdGl2ZSA9IGRvY3VtZW50LmdldChjbGFzc05hbWUpO1xuICBvbGRBY3RpdmUuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICBuZXdBY3RpdmUuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZVNsaWRlcjogc2xpZGVyV2l0aFRvb2x0aXBzLFxuICBzZXRBY3RpdmU6IHNldEFjdGl2ZVxufTtcbiIsIi8qKlxuICogSGVscGVycyBtb2R1bGVcbiAqIEBtb2R1bGUgaGVscGVyc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGN1c3RvbUVycm9yQ29uc3RydWN0b3IgPSBmdW5jdGlvbihuYW1lLCBkZXNjKSB7XG4gIHZhciBFcnJvckNvbnN0cnVjdG9yID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gZGVzYyArIG1zZztcbiAgICB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcbiAgfTtcbiAgRXJyb3JDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG4gIEVycm9yQ29uc3RydWN0b3IucHJvdG90eXBlLm5hbWUgPSBuYW1lO1xuXG4gIHJldHVybiBFcnJvckNvbnN0cnVjdG9yO1xufTtcblxudmFyIFBhcmFtc0Vycm9yID0gY3VzdG9tRXJyb3JDb25zdHJ1Y3RvcignUGFyYW1zRXJyb3InLCAnSW52YWxpZCBwYXJhbWV0ZXJzOiAnKTtcbnZhciBVc2VyRXJyb3IgPSBjdXN0b21FcnJvckNvbnN0cnVjdG9yKCdVc2VyRXJyb3InLCAnSW52YWxpZCB1c2VyIGlucHV0OiAnKTtcblxuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3JcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSBFcnJvciB0eXBlL2NvbnN0cnVjdG9yXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgRGF0YSB0byBwYXNzIGluIHRoZSBtc2dcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBPcHRpb25hbCBjYWxsYmFjay4gVXNlZnVsIGlmIHlvdSBuZWVkIHRvIGRpc3BsYXlcbiAqIHRoZSBlcnJvciB0byB0aGUgdXNlciBmb3IgZXhhbXBsZS5cbiAqL1xudmFyIG1ha2VFcnJvciA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciBtc2c7XG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcblxuICB0cnkge1xuICAgIG1zZyA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbXNnID0gSlNPTi5zdHJpbmdpZnkoZSk7XG4gIH1cblxuICBjYWxsYmFjayhtc2cpO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3BhcmFtcyc6XG4gICAgICB0aHJvdyBuZXcgUGFyYW1zRXJyb3IobXNnKTtcbiAgICBjYXNlICd1c2VyJzpcbiAgICAgIHRocm93IG5ldyBVc2VyRXJyb3IobXNnKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gIH1cbn07XG5cbi8qKlxuICogRm9ybWF0cyB0aGUgdmFsdWUgdG8gYSBzcGVjaWZpZWQgdHlwZVxuICogQHBhcmFtICB7c3RyaW5nfSB2YWx1ZSBWYWx1ZSB0byBiZSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSBGb3JtYXRcbiAqIEByZXR1cm4ge3N0cmluZ30gRm9ybWF0dGVkIHZhbHVlXG4gKi9cbnZhciBmb3JtYXQgPSBmdW5jdGlvbih2YWx1ZSwgdHlwZSkge1xuICBpZiggKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpICYmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSApIHtcbiAgICBtYWtlRXJyb3IoJ3BhcmFtcycsIHZhbHVlKTtcbiAgfVxuXG4gIHZhciBuZXdWYWx1ZSA9ICcnO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJyQnOlxuICAgICAgbmV3VmFsdWUgPSAnJCcgKyB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyUnOlxuICAgICAgbmV3VmFsdWUgPSB2YWx1ZSArICclJztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBuZXdWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5ld1ZhbHVlO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgaW5wdXQgaXMgc3RyaWN0bHkgYSBpc051bWJlclxuICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBjaGVja1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudmFyIGlzTnVtYmVyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgLy9DaGVjayBhbHNvIHdpdGggaXNOYU4gYmVjYXVzZSAodHlwZW9mIE5hTiA9PT0gJ251bWJlcicpIGlzIHRydWVcbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByZXZlcnNlZCBhcnJheSB3aXRob3V0IHNpZGUgZWZmZWN0c1xuICogQHBhcmFtICB7YXJyYXl9IGFycmF5IEluaXRpYWwgYXJyYXlcbiAqIEByZXR1cm4ge2FycmF5fVxuICovXG52YXIgcmV2ZXJzZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gIGlmKCFBcnJheS5pc0FycmF5KGFycmF5KSkge1xuICAgIG1ha2VFcnJvcigncGFyYW1zJywgYXJyYXkpO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5LnNsaWNlKCkucmV2ZXJzZSgpO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbmZpZ01hcCBvZiB0aGUgbW9kdWxlIC0gSXQgZ29lcyBkZWVwIGluIHRoZSBvYmplY3RcbiAqIEBwYXJhbSAge29iamVjdH0gaW5wdXRNYXAgT2JqZWN0IG1hcCB3aXRoIG5ldyBwcm9wZXJ0aWVzIGFuZCB2YWx1ZXNcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnTWFwIEluaXRpYWwgb2JqZWN0IG1hcFxuICogQHJldHVybiB7b2JqZWN0fSBjb25maWdNYXAgVXBkYXRlZCBtYXBcbiAqL1xudmFyIHNldENvbmZpZ01hcCA9IGZ1bmN0aW9uKGlucHV0TWFwLCBjb25maWdNYXApIHtcbiAgdmFyIGtleTtcblxuICBmb3IgKGtleSBpbiBpbnB1dE1hcCkge1xuICAgIGlmIChjb25maWdNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgaWYgKGlucHV0TWFwW2tleV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgc2V0Q29uZmlnTWFwKGlucHV0TWFwW2tleV0sIGNvbmZpZ01hcFtrZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbmZpZ01hcFtrZXldID0gaW5wdXRNYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlnTWFwO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyBtdXN0YWNoZS13cmFwcGVkIHdvcmRzIHdpdGggdmFsdWVzXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHN0cmluZyBJbml0aWFsIHN0cmluZ1xuICogQHBhcmFtICB7b2JqZWN0fSB2YWx1ZXNNYXAgT2JqZWN0IG1hcCBvZiB2YWx1ZXNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oc3RyaW5nLCB2YWx1ZXNNYXApe1xuICB2YXIgcyA9IHN0cmluZyB8fCAnJztcblxuICBPYmplY3Qua2V5cyh2YWx1ZXNNYXApLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBzID0gcy5yZXBsYWNlKG5ldyBSZWdFeHAoJ3snICsgdmFsdWUgKyAnfScsICdnJyksIHZhbHVlc01hcFt2YWx1ZV0pO1xuICB9KTtcblxuICByZXR1cm4gcztcbn07XG5cbi8qKlxuICogVG9nZ2xlcyBhIGl0ZW0gaW4gYXJyYXksIGFkZGluZyBvciByZW1vdmluZyBpdCB3aGV0aGVyIGl0J3MgYWxyZWFkeSBjb250YWluZWRcbiAqIEBwYXJhbSAge2FycmF5fSBhcnJheSBBcnJheVxuICogQHBhcmFtICB7b2JqZWN0fSBpdGVtIEl0ZW1cbiAqIEByZXR1cm4ge2FycmF5fSBteUFycmF5IFVwZGF0ZWQgYXJyYXlcbiAqL1xudmFyIHRvZ2dsZUFycmF5SXRlbSA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtKSB7XG4gIC8vV2UgY2xvbmUgdGhlIGFycmF5IHRvIGF2b2lkIHNpZGUgZWZmZWN0c1xuICB2YXIgbXlBcnJheSA9IGFycmF5LnNsaWNlKDApO1xuXG4gIHZhciBpc1RoZXJlID0gbXlBcnJheS5maW5kKGZ1bmN0aW9uKGFycmF5SXRlbSwgaW5kZXgpIHtcbiAgICBpZihhcnJheUl0ZW0uaWQgPT09IGl0ZW0uaWQpIHtcbiAgICAgIG15QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYoIWlzVGhlcmUpIHtcbiAgICBteUFycmF5LnB1c2goaXRlbSk7XG4gIH1cblxuICByZXR1cm4gbXlBcnJheTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWN0dWFsIHZhbHVlIG9mIGEgcmF0ZVxuICogQHBhcmFtICB7bnVtYmVyfSB0b3RhbCBUb3RhbFxuICogQHBhcmFtICB7bnVtYmVyfSByYXRlIFJhdGVcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xudmFyIHZhbHVlT2ZSYXRlID0gZnVuY3Rpb24odG90YWwsIHJhdGUpIHtcbiAgaWYoICh0eXBlb2YgcmF0ZSAhPT0gJ251bWJlcicpIHx8ICh0eXBlb2YgdG90YWwgIT09ICdudW1iZXInKSApIHtcbiAgICBtYWtlRXJyb3IoJ3BhcmFtcycsIHtyYXRlOiByYXRlLCB0b3RhbDogdG90YWx9KTtcbiAgfVxuXG4gIHJldHVybiByYXRlICogdG90YWwgKiAwLjAxO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhY3R1YWwgdmFsdWVzIG9mIHN1bW1hcnkgcmF0ZXMgYmFzZWQgb24gaW5jb21lXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY29tZSBJbmNvbWVcbiAqIEBwYXJhbSAge251bWJlcn0gYmFzaWNSYXRlIEJhc2ljIG5lZWRzIHJhdGVcbiAqIEBwYXJhbSAge251bWJlcn0gZGlzY1JhdGUgRGlzY3JldGlvbmFyeSBFeHBlbnNlcyByYXRlXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHNhdmluZ3NSYXRlIFNhdmluZ3MgcmF0ZVxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIgdmFsdWVzT2ZTdW1tYXJ5ID0gZnVuY3Rpb24oaW5jb21lLCBiYXNpY1JhdGUsIGRpc2NSYXRlLCBzYXZpbmdzUmF0ZSkge1xuICB2YXIgdmFsdWVPZkNhdGVnb3J5ID0gdmFsdWVPZlJhdGUuYmluZChudWxsLCBpbmNvbWUpO1xuICByZXR1cm4ge1xuICAgIGJhc2ljTmVlZHM6IHZhbHVlT2ZDYXRlZ29yeShiYXNpY1JhdGUpLFxuICAgIGRpc2NyZXRpb25hcnlFeHBlbnNlczogdmFsdWVPZkNhdGVnb3J5KGRpc2NSYXRlKSxcbiAgICBhbm51YWxTYXZpbmdzOiB2YWx1ZU9mQ2F0ZWdvcnkoc2F2aW5nc1JhdGUpXG4gIH07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmb3JtYXQ6IGZvcm1hdCxcbiAgbWFrZUVycm9yOiBtYWtlRXJyb3IsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgcmV2ZXJzZTogcmV2ZXJzZSxcbiAgc2V0Q29uZmlnTWFwOiBzZXRDb25maWdNYXAsXG4gIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgdG9nZ2xlQXJyYXlJdGVtOiB0b2dnbGVBcnJheUl0ZW0sXG4gIHZhbHVlT2ZSYXRlOiB2YWx1ZU9mUmF0ZSxcbiAgdmFsdWVzT2ZTdW1tYXJ5OiB2YWx1ZXNPZlN1bW1hcnlcbn07XG4iLCIvKipcbiAqIE1vZGVsIG1vZHVsZVxuICogQG1vZHVsZSBtb2RlbFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBQdWJTdWIgPSByZXF1aXJlKCdwdWJzdWItanMnKTtcbnZhciBub3RpZSA9IHJlcXVpcmUoJ25vdGllJykuYWxlcnQ7XG5cbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9tb2RlbC9hY3Rpb25zJyk7XG52YXIgYnVkZ2V0ID0gcmVxdWlyZSgnLi9tb2RlbC9idWRnZXQnKTtcbnZhciBnb2Fsc0xpc3QgPSByZXF1aXJlKCcuL21vZGVsL2dvYWxzJyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgZGJOYW1lOiAnJ1xufTtcblxudmFyIGRlZmF1bHRNb2RlbCA9IHtcbiAgYWJvdXRBZ2U6IDM1LFxuICBhYm91dFNpdHVhdGlvbjogJ21hcnJpZWQnLFxuICBhYm91dExpdmluZzogJ293bicsXG4gIGFib3V0SW5jb21lOiA2MDAwMCxcbiAgYWJvdXRCYXNpY1JhdGU6IDM1LFxuICBhYm91dERpc2NyZXRpb25hcnlSYXRlOiA1MixcbiAgYWJvdXRTYXZpbmdzUmF0ZTogMTMsXG4gIGN1cnJlbnRTYXZpbmdzOiAxMDAwMCxcbiAgZXhwZW5zZXM6IFtdLFxuICAvL2Fib3V0U3RhZ2U6ICdob21lJyxcbiAgbGFzdFVzZXJTdGVwOiAxLFxuICBnb2FsczogW10sXG4gIGFjdGlvbnM6IFtdXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQkFTSUMgU1RPUkUgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsLlxuICogQHBhcmFtICB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHlcbiAqIEByZXR1cm4ge2FueXRoaW5nfVxuICovXG52YXIgcmVhZCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBkYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSk7XG5cbiAgaWYodHlwZW9mIHByb3BlcnR5ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcmV0dXJuIGRhdGFbcHJvcGVydHldO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIG1vZGVsIGJ5IGdpdmluZyBpdCB0aGUgcHJvcGVydHkgbmFtZSBhbmQgaXRzIHZhbHVlLlxuICogQHBhcmFtICB7c3RyaW5nfSB1cGRhdGVNYXAgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHVwZGF0ZVxuICovXG52YXIgdXBkYXRlID0gZnVuY3Rpb24gKHVwZGF0ZU1hcCkge1xuICBpZih0eXBlb2YgdXBkYXRlTWFwICE9PSAnb2JqZWN0Jykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCB1cGRhdGVNYXApO1xuICB9XG5cbiAgdmFyIGRhdGEgPSByZWFkKCk7XG5cbiAgT2JqZWN0LmtleXModXBkYXRlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgZGF0YVtwcm9wZXJ0eV0gPSB1cGRhdGVNYXBbcHJvcGVydHldO1xuICAgIFB1YlN1Yi5wdWJsaXNoKHByb3BlcnR5LCB1cGRhdGVNYXBbcHJvcGVydHldKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wZXJ0eSwgdXBkYXRlTWFwW3Byb3BlcnR5XSk7XG4gIH0pO1xuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgZGF0YSBmcm9tIG1vZGVsXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBiZSByZW1vdmVkIGZyb20gbW9kZWwuXG4gKi9cbnZhciByZW1vdmUgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgdmFyIGRhdGEgPSByZWFkKCk7XG5cbiAgZGVsZXRlIGRhdGFbcHJvcGVydHldO1xuXG4gIGxvY2FsU3RvcmFnZVtzdGF0ZU1hcC5kYk5hbWVdID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG59O1xuXG4vKipcbiAqIFdBUk5JTkc6IFdpbGwgcmVtb3ZlIEFMTCBkYXRhIGZyb20gc3RvcmFnZS5cbiAqL1xudmFyIHJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICBsb2NhbFN0b3JhZ2Vbc3RhdGVNYXAuZGJOYW1lXSA9IEpTT04uc3RyaW5naWZ5KGRlZmF1bHRNb2RlbCk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU1BFQ0lGSUMgTU9ERUwgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBnb2Fsc1xuICogQHJldHVybiB7YXJyYXl9XG4gKi9cbnZhciBnZXRHb2FscyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZ29hbHNMaXN0O1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgc3VtbWFyeSBleHBlbnNlcyBmcm9tIHRoZSBkZXRhaWxlZCBvbmVcbiAqIEBwYXJhbSAge2FycmF5fSBkZXRhaWxlZEV4cGVuc2VzIEFycmF5IG9mIHRoZSB2YWx1ZXMgb2YgZGV0YWlsZWQgZXhwZW5zZXNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xudmFyIGdldFN1bW1hcnlFeHBlbnNlcyA9IGZ1bmN0aW9uKGRldGFpbGVkRXhwZW5zZXMpIHtcbiAgLyoqXG4gICAqIFBvc2l0aW9ucyBvZiB0aGUgYmFzaWMgY2F0ZWdvcmllcyBpbiB0aGUgbGlzdCBvZiBkZXRhaWxlZCBleHBlbnNlc1xuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBOT1RFIFRoaXMgc2hvdWxkIGJlIGltcHJvdmVkIHNpbmNlIGl0IHJlcXVpcmVzIHRoZSBwYXJhbWV0ZXIgYXJyYXkgdG9cbiAgICogaGF2ZSBhbHdheXMgdGhlIHNhbWUgc3RydWN0dXJlLCBidXQgaXQgd291bGQgcmVxdWlyZSBtdWNoIG1vcmUgY29kZVxuICAgKi9cbiAgdmFyIGJhc2ljQ2F0ZWdvcmllcyA9IFswLCAyLCA0XTtcbiAgdmFyIGJhc2ljRXhwZW5zZXMgPSAwO1xuICB2YXIgZGlzY0V4cGVuc2VzID0gMDtcblxuICBpZighQXJyYXkuaXNBcnJheShkZXRhaWxlZEV4cGVuc2VzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkZXRhaWxlZEV4cGVuc2VzKTtcbiAgfVxuXG4gIGRldGFpbGVkRXhwZW5zZXMuZm9yRWFjaChmdW5jdGlvbihleHBlbnNlLCBpbmRleCkge1xuICAgIGlmKH5iYXNpY0NhdGVnb3JpZXMuaW5kZXhPZihpbmRleCkpIHtcbiAgICAgIGJhc2ljRXhwZW5zZXMgKz0gZXhwZW5zZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlzY0V4cGVuc2VzICs9IGV4cGVuc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGJhc2ljOiBiYXNpY0V4cGVuc2VzLFxuICAgIGRpc2NyZXRpb25hcnk6IGRpc2NFeHBlbnNlc1xuICB9O1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBzdG9yZWQgbGlzdCBhZGRpbmcgb3IgcmVtb3ZpbmcgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSAge3N0cmluZ30gbGlzdE5hbWUgTmFtZSBvZiB0aGUgbGlzdFxuICogQHBhcmFtICB7b2JqZWN0fSBpdGVtIGl0ZW0gdG8gYWRkIG9yIGRlbGV0ZVxuICovXG52YXIgdG9nZ2xlTGlzdEl0ZW0gPSBmdW5jdGlvbihsaXN0TmFtZSwgaXRlbSkge1xuICBpZih0eXBlb2YgbGlzdE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGxpc3ROYW1lKTtcbiAgfVxuXG4gIHZhciBsaXN0ID0gcmVhZCgpW2xpc3ROYW1lXTtcbiAgdmFyIHVwZGF0ZWRMaXN0ID0gaGVscGVycy50b2dnbGVBcnJheUl0ZW0obGlzdCwgaXRlbSk7XG4gIHZhciB1cGRhdGVNYXAgPSB7fTtcbiAgdXBkYXRlTWFwW2xpc3ROYW1lXSA9IHVwZGF0ZWRMaXN0O1xuICB1cGRhdGUodXBkYXRlTWFwKTtcbn07XG5cbnZhciBpbml0ID0gZnVuY3Rpb24obmFtZSkge1xuICBzdGF0ZU1hcC5kYk5hbWUgPSBuYW1lO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cuU3RvcmFnZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IobnVsbCwgJ2xvY2FsU3RvcmFnZSBzdXBwb3J0JywgJ0Vycm9yOiBsb2NhbFN0b3JhZ2UgaXMgbm90IHN1cHBvcnRlZC4nLCBub3RpZS5iaW5kKG51bGwsIDMpKTtcbiAgfVxuXG4gIGlmKCFsb2NhbFN0b3JhZ2VbbmFtZV0pIHtcbiAgICBsb2NhbFN0b3JhZ2VbbmFtZV0gPSBKU09OLnN0cmluZ2lmeShkZWZhdWx0TW9kZWwpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0QWN0aW9uczogYWN0aW9ucyxcbiAgZ2V0RGVmYXVsdFJhdGVzOiBidWRnZXQuZ2V0RGVmYXVsdFJhdGVzLFxuICBnZXRHb2FsczogZ2V0R29hbHMsXG4gIGdldFN1bW1hcnlFeHBlbnNlczogZ2V0U3VtbWFyeUV4cGVuc2VzLFxuICBpbml0OiBpbml0LFxuICByZWFkOiByZWFkLFxuICByZXNldDogcmVzZXQsXG4gIHJlbW92ZTogcmVtb3ZlLFxuICB0b2dnbGVBY3Rpb25zOiB0b2dnbGVMaXN0SXRlbS5iaW5kKG51bGwsICdhY3Rpb25zJyksXG4gIHRvZ2dsZUdvYWw6IHRvZ2dsZUxpc3RJdGVtLmJpbmQobnVsbCwgJ2dvYWxzJyksXG4gIHVwZGF0ZTogdXBkYXRlXG59O1xuIiwiLyoqXG4gKiBBY3Rpb24gZGF0YVxuICogQG1vZHVsZSBhY3Rpb25zXG4gKi9cblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbnZhciBhY3Rpb25zID0ge1xuICBnZW5lcmFsOiBbXG4gICAge1xuICAgICAgaWQ6IDAsXG4gICAgICB0b0RvOiAnVGhpbmcgdG8gZG8nLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1RoaW5nIG5vdCB0byBkbydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAxLFxuICAgICAgdG9EbzogJ1RoaW5nIHRvIGRvJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0RldGFpbHMnLFxuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdUaGluZyBub3QgdG8gZG8nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMixcbiAgICAgIHRvRG86ICdUaGluZyB0byBkbycsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnLFxuICAgICAgICAnRGV0YWlscydcbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnVGhpbmcgbm90IHRvIGRvJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDMsXG4gICAgICB0b0RvOiAnVGhpbmcgdG8gZG8nLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRGV0YWlscycsXG4gICAgICAgICdEZXRhaWxzJyxcbiAgICAgICAgJ0RldGFpbHMnXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1RoaW5nIG5vdCB0byBkbydcbiAgICB9XG4gIF0sXG4gIGNvbGxlZ2U6IFtcbiAgICB7XG4gICAgICBpZDogMCxcbiAgICAgIHRvRG86ICdTdGFydCBhIHRheC1kZWZlcnJlZCBzYXZpbmcgcGxhbicsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdUYXgtZnJlZSBpbnZlc3RtZW50IGdyb3d0aCBhbmQgdGF4LWZyZWUgd2l0aGRyYXdhbHMgd2lsbCBzYXZlIHlvdSAxMCUgdG8gMzAlIG9uIHRheGVzIHRoYXQgeW91IHdvdWxkIG90aGVyd2lzZSBnaXZlIHRvIHRoZSB0YXggbWFuJyxcbiAgICAgICAgJzUyOSBQbGFuIGZvciBDb2xsZWdlJyxcbiAgICAgICAgJ0NvdmVyZGVsbCBFZHVjYXRpb24gU2F2aW5ncyBBY2NvdW50IChFU0EpIGZvciBLIHRocnUgMTInXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1JlbHkgb24gYSBjb252ZW50aW9uYWwgc2F2aW5ncyBhY2NvdW50J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDEsXG4gICAgICB0b0RvOiAnQ2FsY3VsYXRlIFlvdXIgQ29sbGVnZSBFeHBlbnNlJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1VzZSB0aGlzIHJlc291cmNlIHRvIGVzdGltYXRlIGhvdyBtdWNoIHlvdSB3aWxsIG5lZWQ6IDxhIGhyZWY9XFwnaHR0cDovL3d3dy5zYXZpbmdmb3Jjb2xsZWdlLmNvbS9jb2xsZWdlLXNhdmluZ3MtY2FsY3VsYXRvci9pbmRleC5waHBcXCc+Q29sbGVnZSBjb3N0IGNhbGN1bGF0b3I8L2E+J1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdHdWVzcyBvbiBob3cgbXVjaCB5b3Ugd2lsbCBuZWVkLiBDaGFuY2VzIGFyZSBpdCB3aWxsIGJlIG1vcmUgdGhhbiB5b3UgZXhwZWN0ZWQuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDIsXG4gICAgICB0b0RvOiAnRXN0aW1hdGUgWW91ciBFeHBlY3RlZCBGYW1pbHkgQ29udHJpYnV0aW9uIChFRkMpICcsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICc8YSBocmVmPVxcJ2h0dHBzOi8vZmFmc2EuZWQuZ292L0ZBRlNBL2FwcC9mNGNGb3JtXFwnPkZlZGVyYWwgU3R1ZGVudCBBaWQ8L2E+J1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgdGhhdCBldmVyeW9uZSBwYXlzIHRoZSBzYW1lIGFtb3VudC4nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMyxcbiAgICAgIHRvRG86ICdBZGQgdGhlIHNhbWUgYW1vdW50IGV2ZXJ5IHRpbWUgeW91IGdldCBwYWlkJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1BsYW4gdGhpcyBpbnRvIHlvdXIgYnVkZ2V0LiBVc2UgYXV0b21hdGljIHBheW1lbnRzIGlmIHBvc3NpYmxlJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdCZSBpbmNvbnNpc3RlbnQgd2l0aCB5b3VyIHNhdmluZ3MuIFNsb3cgYW5kIHN0ZWFkeSB3aW5zIHRoZSByYWNlLidcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiA0LFxuICAgICAgdG9EbzogJ1Rha2UgY2xhc3NlcyBmb3IgY29sbGVnZSBjcmVkaXRzIGF0IGEgbG93ZXIgY29zdCBjb21tdW5pdHkgY29sbGVnZScsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdTYXZlIG1vbmV5IGJ5IHRha2luZyByZXF1aXJlZCBnZW5lcmFsIGVkdWNhdGlvbiBjbGFzcyBhdCBhIGNpdHkgY29sbGVnZScsXG4gICAgICAgICdNYWtlIHN1cmUgY3JlZGl0cyBhcmUgdHJhbnNmZXJhYmxlIGZpcnN0JyxcbiAgICAgICAgJ0FQIGNsYXNzZXMgaW4gaGlnaCBzY2hvb2wgYXJlIGFub3RoZXIgZ3JlYXQgb3B0aW9uJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgdGhhdCBhbGwgb2YgeW91ciBjb3Vyc2Ugd29yayBoYXMgdG8gYmUgYXQgYSA0LXllYXIgaW5zdGl0dXRpb24nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogNSxcbiAgICAgIHRvRG86ICdBcHBseSB0byBjb2xsZWdlcyB3aXRoIGxhcmdlIGVuZG93bWVudHMnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnRXhwZW5zaXZlIHByaXZhdGUgY29sbGVnZXMgbWF5IGFjdHVhbGx5IGJlIHRoZSBsZWFzdCBleHBlbnNpdmUgd2hlbiB5b3UgZmFjdG9yIGluIGdlbmVyb3VzIGVuZG93bWVudHMgZm9yIHF1YWxpZmllZCBzdHVkZW50cydcbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnQXNzdW1lIHRoYXQgcHJpdmF0ZSBzY2hvb2wgaXMgY2hlYXBlciB0aGFuIHB1YmxpYydcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiA2LFxuICAgICAgdG9EbzogJ0ZpbmQgU2Nob2xhcnNoaXBzJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0dvIHRvIDxhIGhyZWY9XFwnaHR0cDovL3d3dzIuZWQuZ292L3Byb2dyYW1zL2Z3cy9pbmRleC5odG1sXFwnPkZhc3RXZWIuY29tPC9hPiB0byBmaW5kIHNjaG9sYXJzaGlwcyBhbmQgZXhwbG9yZSB3b3JrLXN0dWR5IHByb2dyYW1zJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdUaGluayB0aGF0IGEgc2Nob2xhcnNoaXAgaXMgdG9vIHNtYWxsIHRvIGFwcGx5IGZvci4gTXVsdGlwbGUgc2Nob2xhcnNoaXBzIGFkZCB1cCdcbiAgICB9XG4gIF0sXG4gIGZ1bmRzOiBbXG4gICAge1xuICAgICAgaWQ6IDAsXG4gICAgICB0b0RvOiAnRGV0ZXJtaW5lIGhvdyBtdWNoIHlvdSBuZWVkJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ0NhbGN1bGF0ZSB5b3VyIG1vbnRobHkgZXhwZW5zZXMgYW5kIHVzZSB0aGlzIGNhbGN1bGF0b3I6IDxhIGhyZWY9XFwnaHR0cDovL3d3dy5tb25leXVuZGVyMzAuY29tL2VtZXJnZW5jeS1mdW5kLWNhbGN1bGF0b3JcXCc+RW1lcmdlbmN5IGZ1bmQgY2FsY3VsYXRvcjwvYT4nXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1VuZGVyZXN0aW1hdGUgd2hhdCB5b3VcXCdsbCBuZWVkIG9yIGhvdyBsb25nIGl0IHdpbGwgdGFrZSB5b3UgdG8gZmluZCBhIG5ldyBqb2IgaWYgeW91IGxvc2UgeW91cnMuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDEsXG4gICAgICB0b0RvOiAnU2V0dXAgYSBzZXBhcmF0ZSBhY2NvdW50IGV4Y2x1c2l2ZWx5IGZvciB5b3UgRW1lcmdlbmN5IEZ1bmQnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnS2VlcCB5b3VyIGVtZXJnZW5jeSBmdW5kIHNlcGFyYXRlIGZyb20geW91IGNoZWNraW5nIGFuZCBzYXZpbmcgYWNjb3VudC4gWW91XFwnbGwgdGhpbmsgZGlmZmVyZW50bHkgYWJvdXQgdGhpcyBmdW5kIGlmIGRlZGljYXRlIHRvIGFuIGVtZXJnZW5jeSAoaS5lLiB5b3VcXCdsbCBiZSBsZXNzIGxpa2VseSB0byBzcGVuZCBpdCknXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ0NvLW1pbmdsZSBmdW5kcyB3aXRoIHlvdXIgY2hlY2tpbmcgb3Igc2F2aW5nIGFjY291bnQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogMixcbiAgICAgIHRvRG86ICdTdGFydCBub3cgLSBtYWtlIGEgbWludW0gZGVwb3NpdCBvZiAkMjUnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnVGhpcyBpcyB5b3VyIHNhZmV0eS1uZXQuIFlvdVxcJ2xsIG5lZWQgbW9yZSBsYXRlciBidXQgdGhpcyB3aWxsIGdvIGEgbG9uZyB3YXkgdG93YXJkIGdldHRpbmcgc3RhcnRlZC4nXG4gICAgICBdLFxuICAgICAgbm90VG9EbzogJ1dhaXQgdW50aWwgeW91IGhhdmUgYW4gZW1lcmdlbmN5J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDMsXG4gICAgICB0b0RvOiAnQWRkIHRoZSBzYW1lIGFtb3VudCBldmVyeSB0aW1lIHlvdSBnZXQgcGFpZCcsXG4gICAgICBkZXRhaWxzOiBbXG4gICAgICAgICdNYWtlIHRoaXMgYSBwcmlvcml0eSBiZWZvcmUgYW55IG90aGVyIGZpbmFuY2lhbCBnb2Fscy4gJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdRdWl0IGJlZm9yZSB5b3UgYWNoaWV2ZSB5b3VyIGdvYWwuIENvbnNpc3RhbmN5IGlzIGtleS4nXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogNCxcbiAgICAgIHRvRG86ICdQYXkgeW91cnNlbGYgZmlyc3QnLFxuICAgICAgZGV0YWlsczogW1xuICAgICAgICAnU2V0dXAgZGlyZWN0IGRlcG9zaXQgZm9yIHlvdXIgbW9udGhseSBidWRnZXRlZCBjb250cmlidXRpb24gdG8gdGhpcyBmdW5kJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgeW91XFwnbGwgc3RheSBkaWNpcGxpbmVkIGFmdGVyIHlvdSBzdGFydCBzYXZpbmcuJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDUsXG4gICAgICB0b0RvOiAnQWRkIHdpbmRmYWxscyAocmViYXRlcywgY2FzaCBnaWZ0LCBib251c2VzLCBldGMuKScsXG4gICAgICBkZXRhaWxzOiBbXG5cbiAgICAgIF0sXG4gICAgICBub3RUb0RvOiAnJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IDYsXG4gICAgICB0b0RvOiAnTWFrZSBzdXJlIHlvdSBoYXZlIGRpc2FiaWxpdHkgaW5zdXJhbmNlJyxcbiAgICAgIGRldGFpbHM6IFtcbiAgICAgICAgJ1lvdSBtYXkgYWxyZWFkeSBoYXZlIHRoaXMgdGhyb3VnaCB5b3VyIGVtcGxveWVyLiBJZiBub3QsIGNvbnNpZGVyIGdldHRpbmcgYSBwb2xpY3kgb24geW91ciBvd24uJ1xuICAgICAgXSxcbiAgICAgIG5vdFRvRG86ICdBc3N1bWUgeW91IGFscmVhZHkgaGF2ZSBhIHBvbGljeSBvciB0aGluayB5b3UgZG9uXFwndCBuZWVkIG9uZS4nXG4gICAgfVxuICBdXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGdvYWwpIHtcbiAgaWYodHlwZW9mIGdvYWwgIT09ICdzdHJpbmcnKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGdvYWwpO1xuICB9XG5cbiAgcmV0dXJuIGFjdGlvbnNbZ29hbF07XG59O1xuIiwiLyoqXG4gKiBCdWRnZXQgYnkgSW5jb21lXG4gKi9cblxudmFyIGdldERlZmF1bHRSYXRlcyA9IGZ1bmN0aW9uKGluY29tZSwgaXNEZXRhaWxlZCkge1xuICBpZih0eXBlb2YgaW5jb21lICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBFcnJvcignZ2V0RGVmYXVsdFJhdGVzKCk6IHdyb25nIHBhcmFtOiAnICsgSlNPTi5zdHJpbmdpZnkoaW5jb21lKSk7XG4gIH1cblxuICB2YXIgcmF0ZXM7XG5cbiAgaWYoaW5jb21lIDwgNTAwMCkge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDQ2LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTIsXG4gICAgICBzYXZpbmdzOiAyLFxuICAgICAgZGV0YWlsZWQ6IFsxMCwgNiwgMjYsIDUsIDEwLCA0LCAxNCwgNywgNSwgNywgNF1cbiAgICB9O1xuICB9IGVsc2UgaWYgKGluY29tZSA8IDEwZTMpIHtcbiAgICByYXRlcyA9IHtcbiAgICAgIGJhc2ljOiA0OCxcbiAgICAgIGRpc2NyZXRpb25hcnk6IDUxLFxuICAgICAgc2F2aW5nczogMSxcbiAgICAgIGRldGFpbGVkOiBbMTEsIDYsIDI3LCA2LCAxMCwgMywgMTUsIDYsIDUsIDQsIDZdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCAxNWUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogNDcsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MCxcbiAgICAgIHNhdmluZ3M6IDMsXG4gICAgICBkZXRhaWxlZDogWzExLCA1LCAyNSwgNiwgMTEsIDMsIDE2LCA4LCA1LCA0LCAzXVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgMjBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDQzLFxuICAgICAgZGlzY3JldGlvbmFyeTogNTEsXG4gICAgICBzYXZpbmdzOiA2LFxuICAgICAgZGV0YWlsZWQ6IFsxMCwgNiwgMjMsIDYsIDEwLCAzLCAxNSwgMTAsIDUsIDIsIDRdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCAzMGUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogNDEsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MixcbiAgICAgIHNhdmluZ3M6IDcsXG4gICAgICBkZXRhaWxlZDogWzksIDYsIDIyLCA2LCAxMCwgMywgMTgsIDEwLCA1LCAxLCAzXVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgNDBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDM5LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTEsXG4gICAgICBzYXZpbmdzOiAxMCxcbiAgICAgIGRldGFpbGVkOiBbOSwgNSwgMjEsIDYsIDksIDQsIDE3LCA5LCA1LCAxLCA0XVxuICAgIH07XG4gIH0gZWxzZSBpZiAoaW5jb21lIDwgNTBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDM3LFxuICAgICAgZGlzY3JldGlvbmFyeTogNTQsXG4gICAgICBzYXZpbmdzOiA5LFxuICAgICAgZGV0YWlsZWQ6IFs4LCA1LCAyMCwgNiwgOSwgNCwgMTksIDksIDUsIDEsIDVdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPCA3MGUzKSB7XG4gICAgcmF0ZXMgPSB7XG4gICAgICBiYXNpYzogMzUsXG4gICAgICBkaXNjcmV0aW9uYXJ5OiA1MixcbiAgICAgIHNhdmluZ3M6IDEzLFxuICAgICAgZGV0YWlsZWQ6IFs4LCA1LCAxOSwgNiwgOCwgMywgMTksIDksIDUsIDEsIDRdXG4gICAgfTtcbiAgfSBlbHNlIGlmIChpbmNvbWUgPj0gNzBlMykge1xuICAgIHJhdGVzID0ge1xuICAgICAgYmFzaWM6IDMxLFxuICAgICAgZGlzY3JldGlvbmFyeTogNTIsXG4gICAgICBzYXZpbmdzOiAxNyxcbiAgICAgIGRldGFpbGVkOiBbNiwgNSwgMTgsIDcsIDYsIDMsIDE3LCA3LCA2LCAzLCA0XVxuICAgIH07XG4gIH1cblxuICBpZighaXNEZXRhaWxlZCkge1xuICAgIGRlbGV0ZSByYXRlcy5kZXRhaWxlZDtcbiAgfVxuXG4gIHJldHVybiByYXRlcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXREZWZhdWx0UmF0ZXM6IGdldERlZmF1bHRSYXRlc1xufTtcbiIsInZhciBnb2Fsc0xpc3QgPSBbXG4gIHtcbiAgICBpZDogJ2NvbGxlZ2UnLFxuICAgIHRpdGxlOiAnU2F2ZSBmb3IgY29sbGVnZScsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hvbWUnLFxuICAgIHRpdGxlOiAnQnV5IGEgaG9tZScsXG4gICAgZGF0ZTogJ0phbnVhcnkgMjAxNycsXG4gICAgcHJvYmFiaWxpdHk6ICc1MCUnXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NhcicsXG4gICAgdGl0bGU6ICdTYXZlIGZvciBjYXInLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdmdW5kcycsXG4gICAgdGl0bGU6ICdFbWVyZ2VuY3kgZnVuZHMnLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdjYXJkcycsXG4gICAgdGl0bGU6ICdQYXktZG93biBDcmVkaXQgQ2FyZHMnLFxuICAgIGRhdGU6ICdKYW51YXJ5IDIwMTcnLFxuICAgIHByb2JhYmlsaXR5OiAnNTAlJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdyZXRpcmUnLFxuICAgIHRpdGxlOiAnUmV0aXJlJyxcbiAgICBkYXRlOiAnSmFudWFyeSAyMDE3JyxcbiAgICBwcm9iYWJpbGl0eTogJzUwJSdcbiAgfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBnb2Fsc0xpc3Q7XG4iLCIvKipcbiAqIFBST1RPVFlQRSBGVU5DVElPTlNcbiAqL1xuXG4vLyBBbGxvdyBmb3IgbG9vcGluZyBvbiBub2RlcyBieSBjaGFpbmluZyBhbmQgdXNpbmcgZm9yRWFjaCBvbiBib3RoIE5vZGVsaXN0cyBhbmQgSFRNTENvbGxlY3Rpb25zXG4vLyBxc2EoJy5mb28nKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHt9KVxuTm9kZUxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbkhUTUxDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cbi8qKlxuICogU2hvcnRjdXQgZm9yIGdldEVsZW1lbnRzQnlDbGFzc05hbWUsIHJldHVybnMgdGhlIGZpcnN0IGZvdW5kIGVsZW1lbnQgb2YgdGhlXG4gKiBIVE1MQ29sbGVjdGlvblxuICogQHBhcmFtICB7c3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZVxuICogQHBhcmFtICB7bnVtYmVyfSBbaW5kZXhdIEhUTUxDb2xsZWN0aW9uIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIHJldHVyblxuICogQHJldHVybiB7RWxlbWVudH1cbiAqL1xuRWxlbWVudC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBpbmRleCkge1xuICBpZiggKHR5cGVvZiBjbGFzc05hbWUgIT09ICdzdHJpbmcnKSB8fCAoaW5kZXggJiYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpKSApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGNsYXNzTmFtZSBvciBpbmRleCcpO1xuICB9XG5cbiAgaW5kZXggPSBpbmRleCB8fCAwO1xuXG4gIHJldHVybiB0aGlzLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKVtpbmRleF07XG59O1xuXG5FbGVtZW50LnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgaWYodHlwZW9mIGNsYXNzTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGNsYXNzTmFtZScpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbGFzc05hbWUpO1xufTtcblxuZG9jdW1lbnQuZ2V0ID0gRWxlbWVudC5wcm90b3R5cGUuZ2V0O1xuZG9jdW1lbnQuZ2V0QWxsID0gRWxlbWVudC5wcm90b3R5cGUuZ2V0QWxsO1xuXG5pZiAoRWxlbWVudCAmJiAhRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICB2YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcbiAgcHJvdG8ubWF0Y2hlcyA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgIHByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fCBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgIHZhciBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoLS1pID49IDAgJiYgbWF0Y2hlcy5pdGVtKGkpICE9PSB0aGlzKSA7XG4gICAgICByZXR1cm4gaSA+IC0xO1xuICAgIH07XG59XG5cbi8qXG4gKiBJbXBsZW1lbnRzIHRoZSBFQ01BU2NyaXB0IDIwMTUgJ2ZpbmQnIGZ1bmN0aW9uIGluIEFycmF5c1xuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZmluZFxuICogQHBhcmFtICB7ZnVuY3Rpb259ICFBcnJheS5wcm90b3R5cGUuZmluZCBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5XG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbmlmICghQXJyYXkucHJvdG90eXBlLmZpbmQpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkucHJvdG90eXBlLmZpbmQgY2FsbGVkIG9uIG51bGwgb3IgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciBsaXN0ID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcbn1cblxuLy9UaGUgT2JqZWN0LmFzc2lnbigpIG1ldGhvZCBpcyB1c2VkIHRvIGNvcHkgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSBvd25cbi8vcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIGEgdGFyZ2V0IG9iamVjdC4gSXQgd2lsbCByZXR1cm5cbi8vdGhlIHRhcmdldCBvYmplY3QuXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT0gJ2Z1bmN0aW9uJykge1xuICAoZnVuY3Rpb24gKCkge1xuICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAndXNlIHN0cmljdCc7XG4gICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0cHV0ID0gT2JqZWN0KHRhcmdldCk7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KG5leHRLZXkpKSB7XG4gICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbiAgfSkoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZpZXdzTmFtZXMgPSBbXG4gICdhYm91dCcsXG4gICdleHBlbnNlcycsXG4gICdjb21wYXJpc29uJyxcbiAgJ3NjZW5hcmlvcycsXG4gICdnb2FsJyxcbiAgJ3BsYW4nLFxuICAncmVtaW5kZXJzJ1xuXTtcbnZhciB2aWV3cyA9IFtcbiAgcmVxdWlyZSgnLi92aWV3cy9hYm91dCcpLFxuICByZXF1aXJlKCcuL3ZpZXdzL2V4cGVuc2VzJyksXG4gIHJlcXVpcmUoJy4vdmlld3MvY29tcGFyaXNvbicpLFxuICByZXF1aXJlKCcuL3ZpZXdzL3NjZW5hcmlvcycpLFxuICByZXF1aXJlKCcuL3ZpZXdzL2dvYWwnKSxcbiAgcmVxdWlyZSgnLi92aWV3cy9wbGFuJyksXG4gIHJlcXVpcmUoJy4vdmlld3MvcmVtaW5kZXJzJyksXG4gIHJlcXVpcmUoJy4vdmlld3MvbmF2JyksXG4gIHJlcXVpcmUoJy4vdmlld3MvY29udGludWUnKVxuXTtcblxudmFyIGdldFZpZXdzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB2aWV3cztcbn07XG5cbnZhciBpbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZpZXdzLmZvckVhY2goZnVuY3Rpb24odmlldywgaW5kZXgpIHtcbiAgICB2YXIgY29udGFpbmVyID0gaW5kZXggPCA3PyBkb2N1bWVudC5nZXQoJ3N0ZXAtLScgKyB2aWV3c05hbWVzW2luZGV4XSkgOiBudWxsO1xuICAgIHZpZXcuc2V0U3RhdGVNYXAoY29udGFpbmVyKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogaW5pdCxcbiAgZ2V0Vmlld3M6IGdldFZpZXdzXG59OyIsIi8qKlxuICogU2NyZWVuICMyIC0gQWJvdXQgbW9kdWxlXG4gKiBAbW9kdWxlIGFib3V0XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBkb21IZWxwZXJzID0gcmVxdWlyZSgnLi4vZG9tLWhlbHBlcnMnKTtcbnZhciB3TnVtYiA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3TnVtYiddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd051bWInXSA6IG51bGwpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGFnZVNsaWRlcjogbnVsbCxcbiAgaW5jb21lU2xpZGVyOiBudWxsLFxuICBzaXR1YXRpb246IG51bGwsXG4gIGxpdmluZzogbnVsbFxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBET00gRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxudmFyIHNob3dTbGlkZXJzID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgYWdlID0gZGF0YS5hZ2U7XG4gIHZhciBpbmNvbWUgPSBkYXRhLmluY29tZTtcblxuICBpZighYWdlIHx8ICFpbmNvbWUpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgYWdlT3B0aW9ucyA9IHtcbiAgICBzdGFydDogYWdlLFxuICAgIHN0ZXA6IDEsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxOCxcbiAgICAgICdtYXgnOiA2NVxuICAgIH0sXG4gICAgcGlwczoge1xuICAgICAgbW9kZTogJ3ZhbHVlcycsXG4gICAgICB2YWx1ZXM6IFsyMCwgMzAsIDQwLCA1MCwgNjAsIDY1XSxcbiAgICAgIGRlbnNpdHk6IDVcbiAgICB9LFxuICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgZGVjaW1hbHM6IDBcbiAgICB9KVxuICB9O1xuICB2YXIgaW5jb21lT3B0aW9ucyA9IHtcbiAgICBzdGFydDogaW5jb21lLFxuICAgIHN0ZXA6IDEwMDAsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxODAwMCxcbiAgICAgICdtYXgnOiAyMDAwMDBcbiAgICB9LFxuICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgZGVjaW1hbHM6IDEsXG4gICAgICB0aG91c2FuZDogJy4nXG4gICAgfSlcbiAgfTtcblxuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5hZ2VTbGlkZXIsIGFnZU9wdGlvbnMpO1xuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5pbmNvbWVTbGlkZXIsIGluY29tZU9wdGlvbnMsICckJyk7XG59O1xuXG52YXIgc2V0U2VsZWN0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNpdHVhdGlvbiA9IGRhdGEuc2l0dWF0aW9uO1xuICB2YXIgbGl2aW5nID0gZGF0YS5saXZpbmc7XG5cbiAgaWYoIXNpdHVhdGlvbiB8fCAhbGl2aW5nKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgc3RhdGVNYXAuc2l0dWF0aW9uLnZhbHVlID0gc2l0dWF0aW9uO1xuICBzdGF0ZU1hcC5saXZpbmcudmFsdWUgPSBsaXZpbmc7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFBVQkxJQyBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBVc2VkIGJ5IHNoZWxsIHRvIGJpbmQgZXZlbnQgaGFuZGxlcnMgdG8gdGhpcyBtb2R1bGUgRE9NIGV2ZW50cy4gSXQgdXN1YWxseVxuICogbWVhbnMgdGhhdCB3ZSB3YW50IHRoZSBzaGVsbCB0byB1cGRhdGUgbW9kZWwgd2hlbiB1c2VyIGludGVyYWN0cyB3aXRoIHRoaXNcbiAqIHNjcmVlbi5cbiAqIEBwYXJhbSAge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICogQHBhcmFtICB7ZnVuY3Rpb259IGhhbmRsZXIgRXZlbnQgaGFuZGxlclxuICovXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIHN3aXRjaChldmVudCkge1xuICAgIGNhc2UgJ2FnZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuYWdlU2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0pKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5jb21lQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5pbmNvbWVTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGhhbmRsZXIoTnVtYmVyKHZhbHVlc1swXS5yZXBsYWNlKCcuJywgJycpKSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NpdHVhdGlvbkNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuc2l0dWF0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGhhbmRsZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGl2aW5nQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5saXZpbmcuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlcihldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdzaG93U2xpZGVycyc6XG4gICAgICBzaG93U2xpZGVycyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NldFNlbGVjdHMnOlxuICAgICAgc2V0U2VsZWN0cyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBjb21tYW5kIGZvdW5kLicpO1xuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc3RhdGVNYXAuYWdlU2xpZGVyID0gY29udGFpbmVyLmdldCgnYWdlX19zbGlkZXInKTtcbiAgc3RhdGVNYXAuaW5jb21lU2xpZGVyID0gY29udGFpbmVyLmdldCgnaW5jb21lX19zbGlkZXInKTtcbiAgc3RhdGVNYXAuc2l0dWF0aW9uID0gY29udGFpbmVyLmdldCgnc2VsZWN0Jyk7XG4gIHN0YXRlTWFwLmxpdmluZyA9IGNvbnRhaW5lci5nZXQoJ3NlbGVjdCcsIDEpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcCxcbiAgcmVuZGVyOiByZW5kZXJcbn07XG4iLCJ2YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgY2hhcnRXcmFwcGVyOiBudWxsLFxuICBjaGFydDogbnVsbFxufTtcblxuXG52YXIgc2hvd0RldGFpbGVkQ2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciB1c2VyRXhwZW5zZXMgPSBoZWxwZXJzLnJldmVyc2UoZGF0YS51c2VyRXhwZW5zZXMpO1xuICB2YXIgb3RoZXJzRXhwZW5zZXMgPSBoZWxwZXJzLnJldmVyc2UoZGF0YS5vdGhlcnNFeHBlbnNlcyk7XG5cbiAgaWYoIUFycmF5LmlzQXJyYXkodXNlckV4cGVuc2VzKSB8fCAhQXJyYXkuaXNBcnJheShvdGhlcnNFeHBlbnNlcykpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICAvL0lmIHVzZXIgaGFzIG5vdCBlbnRlcmVkIGRldGFpbGVkIGV4cGVuc2VzIHlldFxuICBpZih1c2VyRXhwZW5zZXMubGVuZ3RoID09IDApIHtcbiAgICB1c2VyRXhwZW5zZXMgPSBvdGhlcnNFeHBlbnNlcztcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZU1hcC5jaGFydFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnc2hvdy1jaGFydCcpO1xuICB9XG5cbiAgdmFyIGNoYXJ0RGF0YSA9IHtcbiAgICBsYWJlbHM6IFsnTWlzY2VsbGFuZW91cycsICdFZHVjYXRpb24nLCAnRW50ZXJ0YWlubWVudCAmIFJlYWRpbmcnLCAnSGVhbHRoY2FyZScsICdUcmFzcG9ydGF0aW9uJywgJ0FwcGFyZWwgJiBzZXJ2aWNlcycsICdVdGlsaXRpZXMsIGZ1ZWxzLCBwdWJsaWMgc2VydmljZXMnLCAnTWlzYyBIb3VzaW5nIFJlbGF0ZWQnLCAnSG91c2luZycsICdGb29kIGF3YXkgZnJvbSBob21lJywgJ0Zvb2QgYXQgaG9tZSddLFxuICAgIHNlcmllczogW1xuICAgICAgdXNlckV4cGVuc2VzLFxuICAgICAgb3RoZXJzRXhwZW5zZXNcbiAgICBdXG4gIH07XG4gIHZhciBjaGFydE9wdGlvbnMgPSAge1xuICAgIGF4aXNZOiB7XG4gICAgICBvZmZzZXQ6IDEwMFxuICAgIH0sXG4gICAgYXhpc1g6IHtcbiAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgIHg6IC03LFxuICAgICAgICB5OiAwXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXJpZXNCYXJEaXN0YW5jZTogMTAsXG4gICAgaG9yaXpvbnRhbEJhcnM6IHRydWVcbiAgfTtcbiAgc3RhdGVNYXAuY2hhcnQgPSBuZXcgQ2hhcnRpc3QuQmFyKCcuZGV0YWlsZWQtY2hhcnQnLCBjaGFydERhdGEsIGNoYXJ0T3B0aW9ucyk7XG59O1xuXG4vL0ZvciBub3cgaXQncyB1c2VkIG9ubHkgd2hlbiB1c2VyIGNoYW5nZXMgaGlzIGV4cGVuc2VzIGFuZCBub3QgZm9yICdpbmNvbWVcbi8vY2hhbmdlcy9kZWZhdWx0IGV4cGVuc2VzIGNoYW5nZXMnIHNpbmNlIHRoZXkgYXJlIGRlYWx0IHdpdGggc2hvd0RldGFpbGVkQ2hhcnQoKVxudmFyIHVwZGF0ZURldGFpbGVkQ2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciB1c2VyRXhwZW5zZXMgPSBoZWxwZXJzLnJldmVyc2UoZGF0YS51c2VyRXhwZW5zZXMpO1xuXG4gIGlmKCFBcnJheS5pc0FycmF5KHVzZXJFeHBlbnNlcykpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICBzdGF0ZU1hcC5jaGFydFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnc2hvdy1jaGFydCcpO1xuICBzdGF0ZU1hcC5jaGFydC5kYXRhLnNlcmllc1swXSA9IHVzZXJFeHBlbnNlcztcbiAgc3RhdGVNYXAuY2hhcnQudXBkYXRlKCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQVUJMSUMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQsIGRhdGEpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ3Nob3dEZXRhaWxlZENoYXJ0JzpcbiAgICAgIHNob3dEZXRhaWxlZENoYXJ0KGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXBkYXRlRGV0YWlsZWRDaGFydCc6XG4gICAgICB1cGRhdGVEZXRhaWxlZENoYXJ0KGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBzdGF0ZU1hcC5jaGFydFdyYXBwZXIgPSBjb250YWluZXIuZ2V0KCdhZHZhbmNlZC1jb21wYXJpc29uJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVuZGVyOiAgcmVuZGVyLFxuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXBcbn07XG4iLCIvKipcbiAqIFNjcmVlbiAjNSAtIFB5cmFtaWQgbW9kdWxlXG4gKiBAbW9kdWxlIDUtUHlyYW1pZFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgd051bWIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd051bWInXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dOdW1iJ10gOiBudWxsKTtcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG52YXIgZGV0YWlscyA9IHJlcXVpcmUoJy4vY29tcGFyaXNvbi1kZXRhaWxzJyk7XG5cbnZhciBzdGF0ZU1hcCA9IHtcbiAgaW5jb21lOiBudWxsLFxuICBidWRnZXQ6IHt9LFxuICBvdGhlcnM6IHt9LFxuICBiYXJDaGFydDogbnVsbCxcbiAgY29uY2x1c2lvbjogbnVsbFxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gREFUQSBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogQ29waWVzIHRoZSBhY3R1YWwgdmFsdWVzIG9mIHRoZSBzdW1tYXJ5IGludG8gYSBuZXcgb2JqZWN0IHdob3NlIGtleSBuYW1lc1xuICogYXJlIG5lZWRlZCB0byBiZSAnYmFzaWMnLCAnZGlzY3JldGlvbmFyeScgYW5kICdzYXZpbmdzJy5cbiAqIEBwYXJhbSAge29iamVjdH0gdmFsdWVzIENhdGVnb3J5IHZhbHVlcyBvZiB0aGUgc3VtbWFyeVxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG52YXIgbWFwQWN0dWFsVmFsdWVzID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gIHJldHVybiB7XG4gICAgYmFzaWM6IHZhbHVlcy5iYXNpY05lZWRzLFxuICAgIGRpc2NyZXRpb25hcnk6IHZhbHVlcy5kaXNjcmV0aW9uYXJ5RXhwZW5zZXMsXG4gICAgc2F2aW5nczogdmFsdWVzLmFubnVhbFNhdmluZ3NcbiAgfTtcbn07XG5cbnZhciBtb25leUZvcm1hdCA9IHdOdW1iKHtcbiAgdGhvdXNhbmQ6ICcsJyxcbiAgcHJlZml4OiAnJCAnXG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBET00gRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgbWFwIG9mIHRoZSBET00gZWxlbWVudHMgd2hpY2ggZGlzcGxheXMgdGhlIGNhdGVnb3JpZXNcbiAqIEBwYXJhbSAge09iamVjdC5ET019IGNvbnRhaW5lciBET00gQ29udGFpbmVyXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHdobyB1c2VyIGJ1ZGdldCBvciBvdGhlcnNcbiAqIEBwYXJhbSAge2FycmF5fSBjYXRlZ29yaWVzIEFycmF5IG9mIG5hbWVzIG9mIGNhdGVnb3JpZXNcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xudmFyIGdldFN1bW1hcnlET00gPSBmdW5jdGlvbihjb250YWluZXIsIHdobywgY2F0ZWdvcmllcykge1xuICB2YXIgZG9tTWFwID0ge307XG4gIHdobyA9ICcuJyArIHdobztcblxuICAvL1RoZSBsZXZlcmFnZSBIVE1MIEVsZW1lbnRzIHdoaWNoIGNhbiBiZSBzZWxlY3RlZCB3aXRoIGEgY2xhc3NOYW1lIGxpa2VcbiAgLy8nLmJ1ZGdldF9fY2F0ZWdvcnktLWJhc2ljIC5idWRnZXRfX2NhdGVnb3J5X192YWx1ZSdcbiAgY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgdmFyIGh0bWxDbGFzcyA9IHdobyArICdfX2NhdGVnb3J5LS0nICsgY2F0ZWdvcnkgKyAnICcgKyB3aG8gKyAnX19jYXRlZ29yeV9fdmFsdWUnO1xuICAgIGRvbU1hcFtjYXRlZ29yeV0gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihodG1sQ2xhc3MpO1xuICB9KTtcblxuICByZXR1cm4gZG9tTWFwO1xufTtcblxudmFyIHVwZGF0ZVRleHRDb250ZW50ID0gZnVuY3Rpb24oZWxlbWVudCwgdGV4dCkge1xuICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dDtcbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgdGV4dCBmb3IgdXNlciAmIG90aGVycyBzdW1tYXJ5IGNhdGVnb3JpZXMsIHdpdGggdGhlIHJhdGVzIGFuZFxuICogYWN0dWFsIHZhbHVlcy5cbiAqIEBwYXJhbSAge29iamVjdH0gZG9tTWFwICAgICAgIE9iamVjdCB3aXRoIHRoZSBET00gbm9kZXMgZm9yIGJhc2ljLCBkaXNjcmV0aW9uYXJ5XG4gKiBhbmQgc2F2aW5nc1xuICogQHBhcmFtICB7b2JqZWN0fSBhY3R1YWxWYWx1ZXMgT2JqZWN0IHdpdGggdGhlIGFjdHVhbCB2YWx1ZXMgZm9yIGVhY2ggY2F0ZWdvcnlcbiAqIEBwYXJhbSAge29iamVjdH0gcmF0ZXMgICAgICAgIE9iamVjdCB3aXRoIHRoZSByYXRlcyBmb3IgZWFjaCBjYXRlZ29yeVxuICogQGV4YW1wbGVcbiAqIHVwZGF0ZVN1bW1hcnkoXG4gKiAgIHtcbiAqICAgICBiYXNpYzogSFRNTE5vZGUsXG4gKiAgICAgZGlzY3JldGlvbmFyeTogSFRNTE5vZGUsXG4gKiAgICAgc2F2aW5nczogSFRNTE5vZGVcbiAqICAgfSxcbiAqICAge1xuICogICAgIGJhc2ljOiAyMDAwMCxcbiAqICAgICBkaXNjcmV0aW9uYXJ5OiAxMzAwMCxcbiAqICAgICBzYXZpbmdzOiA4MDAwXG4gKiAgIH0sXG4gKiAgIHtcbiAqICAgICBiYXNpYzogNDUsXG4gKiAgICAgZGlzY3JldGlvbmFyeTogMzUsXG4gKiAgICAgc2F2aW5nczogMjBcbiAqICAgfVxuICogIClcbiAqL1xudmFyIHVwZGF0ZVN1bW1hcnkgPSBmdW5jdGlvbihkb21NYXAsIGFjdHVhbFZhbHVlcywgcmF0ZXMpIHtcbiAgT2JqZWN0LmtleXMoZG9tTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgdXBkYXRlVGV4dENvbnRlbnQoXG4gICAgICBkb21NYXBbY2F0ZWdvcnldLnF1ZXJ5U2VsZWN0b3IoJy5hY3R1YWwnKSxcbiAgICAgIG1vbmV5Rm9ybWF0LnRvKGFjdHVhbFZhbHVlc1tjYXRlZ29yeV0pXG4gICAgKTtcbiAgICB1cGRhdGVUZXh0Q29udGVudChcbiAgICAgIGRvbU1hcFtjYXRlZ29yeV0ucXVlcnlTZWxlY3RvcignLnJhdGUnKSxcbiAgICAgIGhlbHBlcnMuZm9ybWF0KHJhdGVzW2NhdGVnb3J5XSwgJyUnKVxuICAgICk7XG4gIH0pO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUkVOREVSIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgc2hvd1N1bW1hcnlDaGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHVzZXIgPSBkYXRhLnVzZXI7XG4gIHZhciBvdGhlcnMgPSBkYXRhLm90aGVycztcblxuICBpZihcbiAgICAhaGVscGVycy5pc051bWJlcih1c2VyLmJhc2ljUmF0ZSArIHVzZXIuZGlzY1JhdGUgKyB1c2VyLnNhdmluZ3NSYXRlKSB8fFxuICAgICFoZWxwZXJzLmlzTnVtYmVyKG90aGVycy5iYXNpYyArIG90aGVycy5kaXNjcmV0aW9uYXJ5ICsgb3RoZXJzLnNhdmluZ3MpXG4gICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBjaGFydERhdGEgPSB7XG4gICAgbGFiZWxzOiBbJ0Jhc2ljIE5lZWRzJywgJ0Rpc2NyZXRpb25hcnkgRXhwZW5zZXMnLCAnU2F2aW5ncyddLFxuICAgIHNlcmllczogW1xuICAgICAgW3VzZXIuYmFzaWNSYXRlLCB1c2VyLmRpc2NSYXRlLCB1c2VyLnNhdmluZ3NSYXRlXSxcbiAgICAgIFtvdGhlcnMuYmFzaWMsIG90aGVycy5kaXNjcmV0aW9uYXJ5LCBvdGhlcnMuc2F2aW5nc11cbiAgICBdXG4gIH07XG4gIHZhciBjaGFydE9wdGlvbnMgPSB7XG4gICAgc2VyaWVzQmFyRGlzdGFuY2U6IDIyXG4gIH07XG5cbiAgc3RhdGVNYXAuYmFyQ2hhcnQgPSBuZXcgQ2hhcnRpc3QuQmFyKCcuY29tcGFyaXNvbi1jaGFydCcsIGNoYXJ0RGF0YSwgY2hhcnRPcHRpb25zKTtcbn07XG5cbnZhciBzaG93VXNlckV4cGVuc2VzID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgaW5jb21lID0gZGF0YS5pbmNvbWUgfHwgMDtcbiAgdmFyIGJhc2ljUmF0ZSA9IGRhdGEuYmFzaWNSYXRlO1xuICB2YXIgZGlzY1JhdGUgPSBkYXRhLmRpc2NSYXRlO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBkYXRhLnNhdmluZ3NSYXRlO1xuXG4gIGlmKHR5cGVvZiAoaW5jb21lICsgYmFzaWNSYXRlICsgZGlzY1JhdGUgKyBzYXZpbmdzUmF0ZSkgIT09ICdudW1iZXInKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIGFjdHVhbFZhbHVlcyA9IG1hcEFjdHVhbFZhbHVlcyhcbiAgICBoZWxwZXJzLnZhbHVlc09mU3VtbWFyeShpbmNvbWUsIGJhc2ljUmF0ZSwgZGlzY1JhdGUsIHNhdmluZ3NSYXRlKVxuICApO1xuICB2YXIgYnVkZ2V0UmF0ZXMgPSB7XG4gICAgYmFzaWM6IGJhc2ljUmF0ZSxcbiAgICBkaXNjcmV0aW9uYXJ5OiBkaXNjUmF0ZSxcbiAgICBzYXZpbmdzOiBzYXZpbmdzUmF0ZVxuICB9O1xuXG4gIGlmKGluY29tZSkge1xuICAgIHVwZGF0ZVRleHRDb250ZW50KHN0YXRlTWFwLmluY29tZSwgbW9uZXlGb3JtYXQudG8oaW5jb21lKSk7XG4gIH1cbiAgdXBkYXRlU3VtbWFyeShzdGF0ZU1hcC5idWRnZXQsIGFjdHVhbFZhbHVlcywgYnVkZ2V0UmF0ZXMpO1xufTtcblxudmFyIHNob3dPdGhlcnNFeHBlbnNlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGluY29tZSA9IGRhdGEuaW5jb21lO1xuICB2YXIgb3RoZXJzRXhwZW5zZXMgPSBkYXRhLm90aGVyc0V4cGVuc2VzO1xuXG4gIGlmKCAodHlwZW9mIGluY29tZSAhPT0gJ251bWJlcicpIHx8ICh0eXBlb2Ygb3RoZXJzRXhwZW5zZXMgIT09ICdvYmplY3QnKSApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgb3RoZXJzVmFsdWVzID0gbWFwQWN0dWFsVmFsdWVzKGhlbHBlcnMudmFsdWVzT2ZTdW1tYXJ5KFxuICAgIGluY29tZSxcbiAgICBvdGhlcnNFeHBlbnNlcy5iYXNpYyxcbiAgICBvdGhlcnNFeHBlbnNlcy5kaXNjcmV0aW9uYXJ5LFxuICAgIG90aGVyc0V4cGVuc2VzLnNhdmluZ3NcbiAgKSk7XG5cbiAgdXBkYXRlU3VtbWFyeShzdGF0ZU1hcC5vdGhlcnMsIG90aGVyc1ZhbHVlcywgb3RoZXJzRXhwZW5zZXMpO1xufTtcblxudmFyIHVwZGF0ZVN1bW1hcnlDaGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHVzZXJFeHBlbnNlcyA9IGRhdGEudXNlckV4cGVuc2VzO1xuICB2YXIgb3RoZXJzRXhwZW5zZXMgPSBkYXRhLm90aGVyc0V4cGVuc2VzO1xuXG4gIHZhciBjaGFydERhdGEgPSB7XG4gICAgbGFiZWxzOiBbJ0Jhc2ljIE5lZWRzJywgJ0Rpc2NyZXRpb25hcnkgRXhwZW5zZXMnLCAnU2F2aW5ncyddLFxuICAgIHNlcmllczogW1xuICAgICAgW3VzZXJFeHBlbnNlcy5iYXNpYywgdXNlckV4cGVuc2VzLmRpc2NyZXRpb25hcnksIHVzZXJFeHBlbnNlcy5zYXZpbmdzXSxcbiAgICAgIFs0MSwgNTEsIDhdXG4gICAgXVxuICB9O1xuXG4gIHZhciBzZXJpZXMgPSBjaGFydERhdGEuc2VyaWVzO1xuICB2YXIgZXhwZW5zZTtcblxuICBzZXJpZXNbMF0gPSBPYmplY3Qua2V5cyh1c2VyRXhwZW5zZXMpLm1hcChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGV4cGVuc2UgPSB1c2VyRXhwZW5zZXNbY2F0ZWdvcnldO1xuICAgIGlmKHR5cGVvZiBleHBlbnNlICE9PSAnbnVtYmVyJykge1xuICAgICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZXhwZW5zZTtcbiAgfSk7XG4gIHNlcmllc1sxXSA9IE9iamVjdC5rZXlzKG90aGVyc0V4cGVuc2VzKS5tYXAoZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICBleHBlbnNlID0gb3RoZXJzRXhwZW5zZXNbY2F0ZWdvcnldO1xuICAgIGlmKHR5cGVvZiBleHBlbnNlICE9PSAnbnVtYmVyJykge1xuICAgICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZXhwZW5zZTtcbiAgfSk7XG4gIHN0YXRlTWFwLmJhckNoYXJ0LnVwZGF0ZShjaGFydERhdGEpO1xufTtcblxudmFyIHNob3dDb25jbHVzaW9uID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgdXNlckV4cGVuc2VzID0gZGF0YS51c2VyRXhwZW5zZXM7XG4gIHZhciBvdGhlcnNFeHBlbnNlcyA9IGRhdGEub3RoZXJzRXhwZW5zZXM7XG5cbiAgdmFyIHRlbXBsYXRlID0gJ1lvdSBzcGVuZCB7c3BlbmR9IG9uIHtjYXRlZ29yeX0gc28geW91IHNhdmUge3NhdmV9IHRoYW4gb3RoZXJzJztcbiAgdmFyIHRleHQsIHNwZW5kLCBzYXZlO1xuICB2YXIgY2F0ZWdvcnkgPSBNYXRoLmFicyh1c2VyRXhwZW5zZXMuYmFzaWMgPCBvdGhlcnNFeHBlbnNlcy5iYXNpYykgPiBNYXRoLmFicyh1c2VyRXhwZW5zZXMuZGlzY3JldGlvbmFyeSA8IG90aGVyc0V4cGVuc2VzLmRpc2NyZXRpb25hcnkpID8gJ0Jhc2ljIE5lZWRzJyA6ICdEaXNjcmV0aW9uYXJ5IEV4cGVuc2VzJztcblxuICBpZih1c2VyRXhwZW5zZXMuc2F2aW5ncyA9PT0gb3RoZXJzRXhwZW5zZXMuc2F2aW5ncykge1xuICAgIHRleHQgPSAnWW91IHNwZW5kIHRoZSBzYW1lIGFzIG90aGVycyBvZiB5b3VyIGNhdGVnb3J5JztcbiAgfSBlbHNlIGlmKHVzZXJFeHBlbnNlcy5zYXZpbmdzID4gb3RoZXJzRXhwZW5zZXMuc2F2aW5ncykge1xuICAgIHNwZW5kID0gJ2xlc3MnO1xuICAgIHNhdmUgPSAnbW9yZSc7XG4gIH0gZWxzZSB7XG4gICAgc3BlbmQgPSAnbW9yZSc7XG4gICAgc2F2ZSA9ICdsZXNzJztcbiAgfVxuXG4gIGlmKHNwZW5kICYmIHNhdmUpIHtcbiAgICB0ZXh0ID0gaGVscGVycy50ZW1wbGF0ZSh0ZW1wbGF0ZSwge1xuICAgICAgc3BlbmQ6IHNwZW5kLFxuICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgc2F2ZTogc2F2ZVxuICAgIH0pO1xuICB9XG4gIHN0YXRlTWFwLmNvbmNsdXNpb24udGV4dENvbnRlbnQgPSB0ZXh0O1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQVUJMSUMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQsIGRhdGEpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ3Nob3dTdW1tYXJ5Q2hhcnQnOlxuICAgICAgc2hvd1N1bW1hcnlDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dVc2VyRXhwZW5zZXMnOlxuICAgICAgc2hvd1VzZXJFeHBlbnNlcyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dPdGhlcnNFeHBlbnNlcyc6XG4gICAgICBzaG93T3RoZXJzRXhwZW5zZXMoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93RGV0YWlsZWRDaGFydCc6XG4gICAgICBkZXRhaWxzLnJlbmRlcignc2hvd0RldGFpbGVkQ2hhcnQnLCBkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dDb25jbHVzaW9uJzpcbiAgICAgIHNob3dDb25jbHVzaW9uKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXBkYXRlRGV0YWlsZWRDaGFydCc6XG4gICAgICBkZXRhaWxzLnJlbmRlcigndXBkYXRlRGV0YWlsZWRDaGFydCcsIGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXBkYXRlU3VtbWFyeUNoYXJ0JzpcbiAgICAgIHVwZGF0ZVN1bW1hcnlDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBjb21tYW5kIGZvdW5kJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICB2YXIgY2F0ZWdvcmllcyA9IFsnYmFzaWMnLCAnZGlzY3JldGlvbmFyeScsICdzYXZpbmdzJ107XG5cbiAgc3RhdGVNYXAuaW5jb21lID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5idWRnZXRfX2luY29tZSAudmFsdWVfX2FjdHVhbCcpO1xuXG4gIHN0YXRlTWFwLmJ1ZGdldCA9IGdldFN1bW1hcnlET00oY29udGFpbmVyLCAnYnVkZ2V0JywgY2F0ZWdvcmllcyk7XG4gIHN0YXRlTWFwLm90aGVycyA9IGdldFN1bW1hcnlET00oY29udGFpbmVyLCAnb3RoZXJzJywgY2F0ZWdvcmllcyk7XG5cbiAgc3RhdGVNYXAuY29uY2x1c2lvbiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY29uY2x1c2lvbicpO1xuXG4gIGRldGFpbHMuc2V0U3RhdGVNYXAoY29udGFpbmVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXAsXG4gIHJlbmRlcjogcmVuZGVyXG59O1xuIiwiLyoqXG4gKiBDb250aW51ZSBidXR0b25zIG1vZHVsZVxuICogQG1vZHVsZSBjb250aW51ZVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0YXRlTWFwID0ge1xuICBjb250aW51ZTogbnVsbCxcbiAgYmFja3dhcmQ6IG51bGxcbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbnZhciBiaW5kID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgaWYgKGV2ZW50ID09PSAnY29udGludWVDbGlja2VkJykge1xuICAgIHN0YXRlTWFwLmNvbnRpbnVlLmZvckVhY2goZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy5kYXRhc2V0LnRlbXBsYXRlO1xuICAgICAgICBoYW5kbGVyKHRlbXBsYXRlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHN0YXRlTWFwLmJhY2t3YXJkLmZvckVhY2goZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaGFuZGxlcih0aGlzLmRhdGFzZXQudGVtcGxhdGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKCkge1xuICBzdGF0ZU1hcC5jb250aW51ZSA9IGRvY3VtZW50LmdldEFsbCgnY29udGludWUnKTtcbiAgc3RhdGVNYXAuYmFja3dhcmQgPSBkb2N1bWVudC5nZXRBbGwoJ2JhY2t3YXJkJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59O1xuIiwiLyoqXG4gKiBTY3JlZW4gIzMgLSBZb3UgbW9kdWxlXG4gKiBAbW9kdWxlIDMteW91XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciBkb21IZWxwZXJzID0gcmVxdWlyZSgnLi4vZG9tLWhlbHBlcnMnKTtcbnZhciB3TnVtYiA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3TnVtYiddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd051bWInXSA6IG51bGwpO1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xudmFyIENoYXJ0aXN0ID0gcmVxdWlyZSgnY2hhcnRpc3QnKTtcblxudmFyIHN0YXRlTWFwID0ge1xuICBjaGFydE5vZGU6IG51bGwsXG4gICRwaWVDaGFydDogbnVsbCxcblxuICBiYXNpY1NsaWRlcjogbnVsbCxcbiAgZXhwZW5zZXNTbGlkZXI6IG51bGwsXG4gIHNhdmluZ3NTbGlkZXI6IG51bGwsXG5cbiAgJG1vZGFsOiBudWxsLFxuICBkZXRhaWxzTGlzdDogbnVsbCxcbiAgZGV0YWlsc0lucHV0czogbnVsbCxcbiAgZGV0YWlsc1N1bTogbnVsbCxcbiAgZGV0YWlsc1NhdmluZ3M6IG51bGwsXG4gIHNhdmVEZXRhaWxzOiBudWxsXG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIRUxQRVIgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogUmV0dXJucyBpZiBldmVyeSBpdGVtIGlzIG5vdCBlcXVhbCB6ZXJvXG4gKiBAcGFyYW0gIHthcnJheX0gdmFsdWVzIEFycmF5IG9mIHZhbHVlcyB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG52YXIgYXJlTm90WmVybyA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICBpZighQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHZhbHVlcyk7XG4gIH1cblxuICByZXR1cm4gIXZhbHVlcy5zb21lKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudCA9PT0gMDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGlubmVySFRNTCBvZiB0aGUgbGlzdCBvZiBpbnB1dHMgZm9yIGRldGFpbGVkIGV4cGVuc2VzXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRldGFpbFRlbXBsYXRlIFRlbXBsYXRlIGZvciBlYWNoIGlucHV0IG9mIHRoZSBsaXN0XG4gKiBAcGFyYW0gIHthcnJheX0gZGV0YWlsc05hbWVzICAgSW5wdXQgbmFtZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZXhwZW5zZSBjYXRlZ29yeVxuICogQHBhcmFtICB7YXJyYXl9IGRlZmF1bHRWYWx1ZXMgIFZhbHVlIGZvciB0aGUgaW5wdXRzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXREZXRhaWxzTGlzdCA9IGZ1bmN0aW9uKGRldGFpbFRlbXBsYXRlLCBkZXRhaWxzTmFtZXMsIGRlZmF1bHRWYWx1ZXMpIHtcbiAgdmFyIGxpc3RIVE1MID0gJyc7XG4gIGRldGFpbHNOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIGluZGV4KSB7XG4gICAgbGlzdEhUTUwgKz0gaGVscGVycy50ZW1wbGF0ZShkZXRhaWxUZW1wbGF0ZSwge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHZhbHVlOiBkZWZhdWx0VmFsdWVzW2luZGV4XVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGxpc3RIVE1MO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzdW0gb2YgdGhlIHZhbHVlc1xuICogQHBhcmFtICB7QXJyYXl9ICB2YWx1ZXMgQXJyYXkgb2YgdmFsdWVzIHRvIGJlIHN1bW1lZFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG52YXIgc3VtID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gIGlmKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgdmFsdWVzKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXMucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcbiAgfSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUkVOREVSIEZVTkNUSU9OUyAvLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBjcmVhdGVQaWVUb29sdGlwID0gZnVuY3Rpb24ocGllQ2hhcnQsIGluY29tZSkge1xuICB2YXIgJGNoYXJ0ID0gJChwaWVDaGFydCk7XG4gIHZhciAkdG9vbFRpcCA9ICRjaGFydFxuICAgIC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwaWUtdG9vbHRpcFwiPjwvZGl2PicpXG4gICAgLmZpbmQoJy5waWUtdG9vbHRpcCcpXG4gICAgLmhpZGUoKTtcbiAgdmFyIG1vbmV5Rm9ybWF0ID0gd051bWIoe1xuICAgIHRob3VzYW5kOiAnLicsXG4gICAgcHJlZml4OiAnJCAnXG4gIH0pO1xuICB2YXIgaXNUb29sdGlwU2hvd24gPSBmYWxzZTtcblxuICAvL0ZvciBtb2JpbGVzXG4gICRjaGFydC5vbignY2xpY2sgbW91c2VlbnRlcicsICcuY3Qtc2xpY2UtZG9udXQnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFpc1Rvb2x0aXBTaG93biB8fCBlLnR5cGUgPT09ICdtb3VzZWVudGVyJykge1xuICAgICAgdmFyICRzbGljZSA9ICQodGhpcyk7XG4gICAgICB2YXIgdmFsdWUgPSAkc2xpY2UuYXR0cignY3Q6dmFsdWUnKTtcbiAgICAgIHZhciBzZXJpZXNOYW1lID0gJHNsaWNlLnBhcmVudCgpLmF0dHIoJ2N0OnNlcmllcy1uYW1lJyk7XG4gICAgICAkdG9vbFRpcFxuICAgICAgLmh0bWwoXG4gICAgICAgICc8c3Ryb25nPicgKyBzZXJpZXNOYW1lICsgJzwvc3Ryb25nPjogJyArXG4gICAgICAgICAgdmFsdWUgKyAnJS8gJyArXG4gICAgICAgIG1vbmV5Rm9ybWF0LnRvKE51bWJlcih2YWx1ZSkgLyAxMDAgKiBpbmNvbWUpXG4gICAgICApXG4gICAgICAuc2hvdygpO1xuICAgICAgaXNUb29sdGlwU2hvd24gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkdG9vbFRpcC5oaWRlKCk7XG4gICAgICBpc1Rvb2x0aXBTaG93biA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgJGNoYXJ0Lm9uKCdtb3VzZWxlYXZlJywgJy5jdC1zbGljZS1kb251dCcsIGZ1bmN0aW9uKCkge1xuICAgICR0b29sVGlwLmhpZGUoKTtcbiAgfSk7XG5cbiAgJGNoYXJ0Lm9uKCdjbGljayBtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICR0b29sVGlwLmNzcyh7XG4gICAgICBsZWZ0OiAoZXZlbnQub2Zmc2V0WCB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmxheWVyWCkgLSAkdG9vbFRpcC53aWR0aCgpIC8gMiAtIDEwLFxuICAgICAgdG9wOiAoZXZlbnQub2Zmc2V0WSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmxheWVyWSkgLSAkdG9vbFRpcC5oZWlnaHQoKSAtIDMwXG4gICAgfSk7XG4gIH0pO1xufTtcblxudmFyIHNob3dEZXRhaWxlZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGRldGFpbHNOYW1lcyA9IFsnRm9vZCBhdCBob21lJywgJ0Zvb2QgYXdheSBmcm9tIGhvbWUnLCAnSG91c2luZycsICdNaXNjIEhvdXNpbmcgUmVsYXRlZCcsICdVdGlsaXRpZXMsIGZ1ZWxzLCBwdWJsaWMgc2VydmljZXMnLCAnQXBwYXJlbCAmIHNlcnZpY2VzJywgJ1RyYXNwb3J0YXRpb24nLCAnSGVhbHRoY2FyZScsICdFbnRlcnRhaW5tZW50ICYgUmVhZGluZycsICdFZHVjYXRpb24nLCAnTWlzY2VsbGFuZW91cyddO1xuICB2YXIgZXhwZW5zZXMgPSBkYXRhLmV4cGVuc2VzO1xuXG4gIGlmKCFBcnJheS5pc0FycmF5KGV4cGVuc2VzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBkZXRhaWxUZW1wbGF0ZSA9XG4gICAgJzxsaSBjbGFzcz1cImRldGFpbFwiPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwiZGV0YWlsX19uYW1lXCI+e25hbWV9PC9zcGFuPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwidmFsdWUtd3JhcHBlclwiPicgK1xuICAgICAgICAnPGlucHV0IGNsYXNzPVwiZGV0YWlsX192YWx1ZVwiIHR5cGU9XCJudW1iZXJcIiB2YWx1ZT1cInt2YWx1ZX1cIiBuYW1lPVwie25hbWV9XCIgPicgK1xuICAgICAgJzwvc3Bhbj4nICtcbiAgICAnPC9saT4nO1xuXG4gIHN0YXRlTWFwLmRldGFpbHNMaXN0LmlubmVySFRNTCA9IGdldERldGFpbHNMaXN0KGRldGFpbFRlbXBsYXRlLCBkZXRhaWxzTmFtZXMsIGV4cGVuc2VzKTtcbn07XG5cbnZhciBzaG93RGV0YWlsc1N1bSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHN1bSA9IGRhdGEuc3VtO1xuXG4gIGlmKCFoZWxwZXJzLmlzTnVtYmVyKHN1bSkpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICBzdGF0ZU1hcC5kZXRhaWxzU3VtLnRleHRDb250ZW50ID0gc3VtO1xuICBzdGF0ZU1hcC5kZXRhaWxzU2F2aW5ncy50ZXh0Q29udGVudCA9IDEwMCAtIHN1bTtcbn07XG5cbnZhciBzaG93U2xpZGVycyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGJhc2ljUmF0ZSA9IGRhdGEuYmFzaWNSYXRlO1xuICB2YXIgZGlzY1JhdGUgPSBkYXRhLmRpc2NSYXRlO1xuICB2YXIgY3VycmVudFNhdmluZ3MgPSBkYXRhLmN1cnJlbnRTYXZpbmdzO1xuXG4gIC8vV2UgY2hlY2sgZGF0YSBhcmUgYWxsIG51bWJlcnMgYnkgc3VtbWluZyB0aGVtXG4gIGlmKHR5cGVvZiAoYmFzaWNSYXRlICsgZGlzY1JhdGUgKyBjdXJyZW50U2F2aW5ncykgIT09ICdudW1iZXInKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIGJhc2ljT3B0aW9ucyA9IHtcbiAgICBzdGFydDogYmFzaWNSYXRlLFxuICAgIHN0ZXA6IDEsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxLFxuICAgICAgJ21heCc6IDcwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfTtcbiAgdmFyIGRpc2NPcHRpb25zID0ge1xuICAgIHN0YXJ0OiBkaXNjUmF0ZSxcbiAgICBzdGVwOiAxLFxuICAgIHJhbmdlOiB7XG4gICAgICAnbWluJzogMSxcbiAgICAgICdtYXgnOiA3MFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH07XG4gIHZhciBzYXZpbmdzT3B0aW9ucyA9IHtcbiAgICBzdGFydDogY3VycmVudFNhdmluZ3MsXG4gICAgc3RlcDogMTAwMCxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDEwMDAsXG4gICAgICAnbWF4JzogNTAwMDAwXG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAxLFxuICAgICAgdGhvdXNhbmQ6ICcuJ1xuICAgIH0pXG4gIH07XG5cbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuYmFzaWNTbGlkZXIsIGJhc2ljT3B0aW9ucywgJyUnKTtcbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuZXhwZW5zZXNTbGlkZXIsIGRpc2NPcHRpb25zLCAnJScpO1xuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5zYXZpbmdzU2xpZGVyLCBzYXZpbmdzT3B0aW9ucywgJyQnKTtcbn07XG5cbnZhciBzaG93UGllQ2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBpbmNvbWUgPSBkYXRhLmluY29tZTtcbiAgdmFyIGJhc2ljUmF0ZSA9IGRhdGEuYmFzaWNSYXRlO1xuICB2YXIgZGlzY1JhdGUgPSBkYXRhLmRpc2NSYXRlO1xuICB2YXIgc2F2aW5nc1JhdGUgPSAxMDAgLSBiYXNpY1JhdGUgLSBkaXNjUmF0ZTtcblxuICAvL1dlIGNoZWNrIGRhdGEgYXJlIGFsbCBudW1iZXJzIGJ5IHN1bW1pbmcgdGhlbVxuICBpZih0eXBlb2Ygc2F2aW5nc1JhdGUgIT09ICdudW1iZXInKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgdmFyIHBpZURhdGEgPSB7XG4gICAgc2VyaWVzOiBbXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiBiYXNpY1JhdGUsXG4gICAgICAgIG5hbWU6ICdCYXNpYyBOZWVkcydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiBkaXNjUmF0ZSxcbiAgICAgICAgbmFtZTogJ0Rpc2NyZXRpb25hcnknXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZTogc2F2aW5nc1JhdGUsXG4gICAgICAgIG5hbWU6ICdTYXZpbmdzJ1xuICAgICAgfVxuICAgIF1cbiAgfTtcbiAgdmFyIHBpZU9wdGlvbnMgPSB7XG4gICAgZG9udXQ6IHRydWUsXG4gICAgZG9udXRXaWR0aDogMjAsXG4gICAgY2hhcnRQYWRkaW5nOiAxMCxcbiAgICBsYWJlbE9mZnNldDogNTAsXG4gICAgd2lkdGg6ICcyMjBweCcsXG4gICAgaGVpZ2h0OiAnMjIwcHgnXG4gIH07XG4gIHZhciBwaWVSZXNwb25zaXZlT3B0aW9ucyA9IFtcbiAgICBbJ3NjcmVlbiBhbmQgKG1heC13aWR0aDogNDgwcHgpJywge1xuICAgICAgZG9udXRXaWR0aDogMzAsXG4gICAgICB3aWR0aDogJzI4MHB4JyxcbiAgICAgIGhlaWdodDogJzI4MHB4J1xuICAgIH1dXG4gIF07XG5cbiAgc3RhdGVNYXAuJHBpZUNoYXJ0ID0gbmV3IENoYXJ0aXN0LlBpZShzdGF0ZU1hcC5jaGFydE5vZGUsIHBpZURhdGEsIHBpZU9wdGlvbnMsIHBpZVJlc3BvbnNpdmVPcHRpb25zKTtcbiAgY3JlYXRlUGllVG9vbHRpcChzdGF0ZU1hcC5jaGFydE5vZGUsIGluY29tZSk7XG59O1xuXG4vKipcbiAqIFVzZWQgYnkgc2hlbGwgdG8gc2V0IHRoZSBzbGlkZXJzIHZhbHVlcyB3aGVuIGRhdGEgaXMgY2hhbmdlZCBvbiBzb21lIG90aGVyXG4gKiBzY3JlZW5zLlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgT2JqZWN0IHdpdGggc2xpZGVyTmFtZSBhbmQgdmFsdWUgcHJvcGVydGllc1xuICovXG52YXIgc2V0U2xpZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgc2xpZGVyTmFtZSA9IGRhdGEuc2xpZGVyTmFtZTtcbiAgdmFyIHZhbHVlID0gZGF0YS52YWx1ZTtcblxuICBpZiggKHR5cGVvZiBzbGlkZXJOYW1lICE9PSAnc3RyaW5nJykgfHwgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIGlmIChzbGlkZXJOYW1lID09PSAnYmFzaWMnKSB7XG4gICAgc3RhdGVNYXAuYmFzaWNTbGlkZXIubm9VaVNsaWRlci5zZXQodmFsdWUpO1xuICB9IGVsc2UgaWYgKHNsaWRlck5hbWUgPT09ICdkaXNjcmV0aW9uYXJ5Jykge1xuICAgIHN0YXRlTWFwLmV4cGVuc2VzU2xpZGVyLm5vVWlTbGlkZXIuc2V0KHZhbHVlKTtcbiAgfVxufTtcblxudmFyIHVwZGF0ZURldGFpbHNTdW0gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChzdGF0ZU1hcC5kZXRhaWxzSW5wdXRzLCBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiBOdW1iZXIoaW5wdXQudmFsdWUpO1xuICB9KTtcbiAgdmFyIGRldGFpbHNTdW0gPSBzdW0odmFsdWVzKTtcbiAgc2hvd0RldGFpbHNTdW0oe3N1bTogZGV0YWlsc1N1bX0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHZpZXcgb2YgdGhlIERvdWdobnV0IHdoZW4gc2xpZGVycyB2YWx1ZXMgY2hhbmdlXG4gKiBAcGFyYW0ge29iamVjdH0gcmF0ZXMgT2JqZWN0IHdpdGggdGhlIG5ldyByYXRlc1xuICogQGV4YW1wbGVcbiAqIHVwZGF0ZVBpZUNoYXJ0KHtcbiAqICAgYmFzaWNSYXRlOiAzMCxcbiAqICAgZGlzY1JhdGU6IDQwLFxuICogICBzYXZpbmdzUmF0ZTogMzBcbiAqIH0pXG4gKi9cbnZhciB1cGRhdGVQaWVDaGFydCA9IGZ1bmN0aW9uKHJhdGVzKSB7XG4gIHZhciB1cGRhdGVkRGF0YSA9IHtcbiAgICBzZXJpZXM6IFtcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6IHJhdGVzLmJhc2ljUmF0ZSxcbiAgICAgICAgbmFtZTogJ0Jhc2ljIE5lZWRzJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6IHJhdGVzLmRpc2NSYXRlLFxuICAgICAgICBuYW1lOiAnRGlzY3JldGlvbmFyeSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiByYXRlcy5zYXZpbmdzUmF0ZSxcbiAgICAgICAgbmFtZTogJ1NhdmluZ3MnXG4gICAgICB9XG4gICAgXVxuICB9O1xuICBzdGF0ZU1hcC4kcGllQ2hhcnQudXBkYXRlKHVwZGF0ZWREYXRhKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFBVQkxJQyBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBVc2VkIGJ5IHNoZWxsIHRvIGJpbmQgZXZlbnQgaGFuZGxlcnMgdG8gdGhpcyBtb2R1bGUgRE9NIGV2ZW50cy4gSXQgdXN1YWxseVxuICogbWVhbnMgdGhhdCB3ZSB3YW50IHRoZSBzaGVsbCB0byB1cGRhdGUgbW9kZWwgd2hlbiB1c2VyIGludGVyYWN0cyB3aXRoIHRoaXNcbiAqIHNjcmVlbi5cbiAqIEBwYXJhbSAge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICogQHBhcmFtICB7ZnVuY3Rpb259IGhhbmRsZXIgRXZlbnQgaGFuZGxlclxuICovXG52YXIgYmluZCA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gIHN3aXRjaCAoZXZlbnQpIHtcbiAgICBjYXNlICdiYXNpY1JhdGVDaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLmJhc2ljU2xpZGVyLm5vVWlTbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKCBOdW1iZXIodmFsdWVzWzBdKSApO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkaXNjUmF0ZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuZXhwZW5zZXNTbGlkZXIubm9VaVNsaWRlci5vbignc2V0JywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGhhbmRsZXIoIE51bWJlcih2YWx1ZXNbMF0pICk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2N1cnJlbnRTYXZpbmdzQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5zYXZpbmdzU2xpZGVyLm5vVWlTbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0ucmVwbGFjZSgnLicsICcnKSkpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXRhaWxzQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5kZXRhaWxzTGlzdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB1cGRhdGVEZXRhaWxzU3VtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RldGFpbHNSZXNldCc6XG4gICAgICBzdGF0ZU1hcC5kZXRhaWxzUmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RldGFpbHNTYXZlZCc6XG4gICAgICBzdGF0ZU1hcC5zYXZlRGV0YWlscy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHN0YXRlTWFwLmRldGFpbHNJbnB1dHMsIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgcmV0dXJuIE51bWJlcihpbnB1dC52YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdmFsaWQgPSBhcmVOb3RaZXJvKHZhbHVlcykgJiYgKHN1bSh2YWx1ZXMpIDw9IDEwMCk7XG4gICAgICAgIGlmKHZhbGlkKSB7XG4gICAgICAgICAgaGFuZGxlcihudWxsLCB2YWx1ZXMpO1xuICAgICAgICAgIHN0YXRlTWFwLiRtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhbmRsZXIobmV3IEVycm9yKCdWYWx1ZXMgbXVzdCBub3QgYmUgemVyb3MgYW5kIHRoZWlyIHN1bSBub3Qgc3VwZXJpb3IgMTAwJyksIG51bGwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQsIGRhdGEpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ3Nob3dTbGlkZXJzJzpcbiAgICAgIHNob3dTbGlkZXJzKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2hvd1BpZUNoYXJ0JzpcbiAgICAgIHNob3dQaWVDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dEZXRhaWxlZCc6XG4gICAgICBzaG93RGV0YWlsZWQoZGF0YSk7XG4gICAgICBzdGF0ZU1hcC5kZXRhaWxzSW5wdXRzID0gc3RhdGVNYXAuZGV0YWlsc0xpc3QuZ2V0QWxsKCdkZXRhaWxfX3ZhbHVlJyk7XG4gICAgICB2YXIgaW5wdXRzVmFsdWVzID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHN0YXRlTWFwLmRldGFpbHNJbnB1dHMsIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIoaW5wdXQudmFsdWUpO1xuICAgICAgfSk7XG4gICAgICBzaG93RGV0YWlsc1N1bSh7XG4gICAgICAgIHN1bTogc3VtKGlucHV0c1ZhbHVlcylcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2V0U2xpZGVyJzpcbiAgICAgIHNldFNsaWRlcihkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZVBpZUNoYXJ0JzpcbiAgICAgIHVwZGF0ZVBpZUNoYXJ0KGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXBkYXRlUGllVG9vbHRpcCc6XG4gICAgICBjcmVhdGVQaWVUb29sdGlwKHN0YXRlTWFwLmNoYXJ0Tm9kZSwgZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gY29tbWFuZCBmb3VuZC4nKTtcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIHdpbmRvdy5zdW0gPSBzdW07XG4gIHN0YXRlTWFwLmJhc2ljU2xpZGVyID0gY29udGFpbmVyLmdldCgnc2xpZGVyLS1uZWVkcycpO1xuICBzdGF0ZU1hcC5leHBlbnNlc1NsaWRlciA9IGNvbnRhaW5lci5nZXQoJ3NsaWRlci0tZXhwZW5zZXMnKTtcbiAgc3RhdGVNYXAuc2F2aW5nc1NsaWRlciA9IGNvbnRhaW5lci5nZXQoJ2N1cnJlbnQtc2F2aW5nc19fc2xpZGVyJyk7XG5cbiAgc3RhdGVNYXAuY2hhcnROb2RlID0gY29udGFpbmVyLmdldCgnc3VtbWFyeV9fY2hhcnQnKTtcblxuICBzdGF0ZU1hcC4kbW9kYWwgPSAkKCcjZGV0YWlscy1tb2RhbCcpO1xuICBzdGF0ZU1hcC5kZXRhaWxzTGlzdCA9IGNvbnRhaW5lci5nZXQoJ2RldGFpbHMtdmFsdWVzJyk7XG4gIHN0YXRlTWFwLmRldGFpbHNSZXNldCA9IGNvbnRhaW5lci5nZXQoJ3Jlc2V0LWRldGFpbGVkJyk7XG4gIHN0YXRlTWFwLmRldGFpbHNTdW0gPSBjb250YWluZXIuZ2V0KCdkZXRhaWxzLXN1bScpO1xuICBzdGF0ZU1hcC5kZXRhaWxzU2F2aW5ncyA9IGNvbnRhaW5lci5nZXQoJ2RldGFpbHMtc2F2aW5ncycpO1xuICBzdGF0ZU1hcC5zYXZlRGV0YWlscyA9IGNvbnRhaW5lci5nZXQoJ3NhdmUtZGV0YWlsZWQtZXhwZW5zZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHJlbmRlcjogcmVuZGVyLFxuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXBcbn07XG4iLCIvKipcbiAqIFNjcmVlbiAjNyAtIEdvYWwgbW9kdWxlXG4gKiBAbW9kdWxlIDctR29hbFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG52YXIgZHJhZ3VsYSA9IHJlcXVpcmUoJ2RyYWd1bGEnKTtcblxudmFyIGNvbmZpZ01hcCA9IHtcbiAgdG9nZ2xlQnV0dG9uczogJ3RvZ2dsZS1nb2FsJyxcbiAgZGF0ZXBpY2tlcjogJy5nb2FsX19kYXRlX19waWNrZXInXG59O1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGZyZWVHb2FsczogbnVsbCxcbiAgcGlja2VkR29hbHM6IG51bGwsXG4gIHRvZ2dsZUJ1dHRvbnM6IG51bGxcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vXG4vLyBURU1QTEFURVMgLy9cbi8vLy8vLy8vLy8vLy8vL1xuXG4vKipcbiAqIFRlbXBsYXRlcyBmb3IgZ29hbHMgdG8gYmUgcGlja2VkIGFuZCB0aGUgcGlja2VkIG9uZS4gV2UgYXJlIHVzaW5nIHRlbXBsYXRlc1xuICogaGVyZSBpbiBKYXZhc2NyaXB0IGluc3RlYWQgb2YgcHV0dGluZyBpdCBkaXJlY3RseSBpbnRvIEhUTUwgZmlsZXMgYmVjYXVzZVxuICogaXQncyBlYXNpZXIgdG8gZ2VuZXJhdGUgYW5kIG1hbmlwdWxhdGUgdGhlbSBkaW5hbWljYWxseSBiYXNlZCBvbiB0aGUgTW9kZWwuXG4gKiBAdHlwZSB7c3RyaW5nfVxuICovXG52YXIgZnJlZUdvYWxUZW1wbGF0ZSA9XG4gICc8ZGl2IGNsYXNzPVwiZ29hbCBnb2FsLS17aWR9IHtwaWNrZWR9XCI+JyArXG4gICAgJzxkaXYgY2xhc3M9XCJnb2FsX19kZXRhaWxzXCI+JyArXG4gICAgICAnPHAgY2xhc3M9XCJnb2FsX190aXRsZVwiPnt0aXRsZX08L3A+JyArXG4gICAgICAnPHNwYW4gY2xhc3M9XCJnb2FsX19kYXRlXCIgZGF0YS1wbGFjZW1lbnQ9XCJib3R0b21cIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkV4cGVjdGVkIGFjaGlldmVtZW50IGRhdGUgYmFzZWQgb24geW91ciBkYXRhXCI+JyArXG4gICAgICAgICc8aSBjbGFzcz1cInptZGkgem1kaS1jYWxlbmRhci1hbHRcIj48L2k+JyArXG4gICAgICAgICc8c3Bhbj57ZGF0ZX08L3NwYW4+JyArXG4gICAgICAnPC9zcGFuPicgK1xuICAgICAgJzxzcGFuIGNsYXNzPVwiZ29hbF9fc3VjY2Vzc1wiIGRhdGEtcGxhY2VtZW50PVwiYm90dG9tXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgdGl0bGU9XCJFeHBlY3RlZCBhY2hpZXZlbWVudCBwcm9iYWJpbGl0eSBiYXNlZCBvbiB5b3VyIGRhdGFcIj4nICtcbiAgICAgICAgJzxpIGNsYXNzPVwiem1kaSB6bWRpLWNoYXJ0XCI+PC9pPicgK1xuICAgICAgICAnPHNwYW4+e3Byb2JhYmlsaXR5fTwvc3Bhbj4nICtcbiAgICAgICc8L3NwYW4+JyArXG4gICAgJzwvZGl2PicgK1xuICAgICc8aSBjbGFzcz1cInRvZ2dsZS1nb2FsIGFkZC1nb2FsIHptZGkgem1kaS1wbHVzLWNpcmNsZVwiIGRhdGEtZ29hbD1cIntpZH1cIj48L2k+JyArXG4gICc8L2Rpdj4nO1xudmFyIHBpY2tlZEdvYWxUZW1wbGF0ZSA9XG4gICc8ZGl2IGNsYXNzPVwicGlja2VkIHBpY2tlZC0te2lkfSB7cGlja2VkfVwiPicgK1xuICAgICc8ZGl2IGNsYXNzPVwicGlja2VkX19kZXRhaWxzXCI+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cImRyYWdnZXJcIj48L2Rpdj4nICtcbiAgICAgICc8cCBjbGFzcz1cInBpY2tlZF9fdGl0bGVcIj57dGl0bGV9PC9wPicgK1xuICAgICAgJzxwIGNsYXNzPVwicGlja2VkX19kYXRlXCI+JyArXG4gICAgICAgICc8aSBjbGFzcz1cInptZGkgem1kaS1jYWxlbmRhci1hbHRcIj48L2k+JyArXG4gICAgICAgICc8aW5wdXQgY2xhc3M9XCJnb2FsX19kYXRlX19waWNrZXJcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwie2RhdGV9XCIgcmVhZG9ubHk+JyArXG4gICAgICAgICc8aSBjbGFzcz1cInptZGkgem1kaS1lZGl0XCI+PC9pPicgK1xuICAgICAgJzwvcD4nICtcbiAgICAgICc8cCBjbGFzcz1cInBpY2tlZF9fc3VjY2Vzc1wiPjxpIGNsYXNzPVwiem1kaSB6bWRpLWNoYXJ0XCI+PC9pPntwcm9iYWJpbGl0eX08L3A+JyArXG4gICAgJzwvZGl2PicgK1xuICAgICc8aSBjbGFzcz1cInRvZ2dsZS1nb2FsIGRlbGV0ZS1nb2FsIHptZGkgem1kaS1taW51cy1jaXJjbGVcIiBkYXRhLWdvYWw9XCJ7aWR9XCI+PC9pPicgK1xuICAnPC9kaXY+JztcblxuLypcbiAqIEdlbmVyYXRlcyB0aGUgSFRNTCBsaXN0IG9mIGdvYWxzIHRvIGJlIHBpY2tlZC4gSWYgdGhlIGdvYWwgaXMgYWxyZWFkeSBwaWNrZWRcbiAqIHdlIGFkZCBhIENTUyBjbGFzcyB0byBoaWRlIGl0LiBJbiB0aGlzIHdheSBpdCdzIGZhc3RlciB0byBoaWRlL3Nob3cgZ29hbHMgaW5cbiAqIGJvdGggbGlzdHMgKHRvIGJlIHBpY2tlZCAmIGFscmVhZHkgcGlja2VkKSB3aGVuIHRoZSB1c2VyIGludGVyYWN0cyBhbmQgbW9yZW92ZXJcbiAqIHdlIGF2b2lkIHJlY3JlYXRpbmcgRE9NIGZvciB0aGUgZ29hbHMgZWFjaCB0aW1lLlxuICogQHBhcmFtICB7YXJyYXl9IGdvYWxzTGlzdCBMaXN0IG9mIGF2YWlsYWJsZSBnb2Fsc1xuICogQHBhcmFtICB7YXJyYXl9IHBpY2tlZEdvYWxzIEdvYWxzIGFscmVhZHkgcGlja2VkIGJ5IHRoZSB1c2VyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXRMaXN0R29hbHMgPSBmdW5jdGlvbihnb2Fsc0xpc3QsIHBpY2tlZEdvYWxzLCB0ZW1wbGF0ZSwgY2xhc3NOYW1lKSB7XG4gIHZhciB2aWV3ID0gJyc7XG5cbiAgZ29hbHNMaXN0LmZvckVhY2goZnVuY3Rpb24oZ29hbCkge1xuICAgIHZhciBnb2FsQ2xhc3NOYW1lID0gJyc7XG4gICAgdmFyIGlzUGlja2VkID0gcGlja2VkR29hbHMuZmluZChmdW5jdGlvbihwaWNrZWRHb2FsKSB7XG4gICAgICByZXR1cm4gcGlja2VkR29hbC5pZCA9PT0gZ29hbC5pZDtcbiAgICB9KTtcblxuICAgIGlmIChpc1BpY2tlZCkge1xuICAgICAgZ29hbENsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgICB9XG5cbiAgICB2aWV3ICs9IGhlbHBlcnMudGVtcGxhdGUodGVtcGxhdGUsIHtcbiAgICAgIGlkOiBnb2FsLmlkLFxuICAgICAgdGl0bGU6IGdvYWwudGl0bGUsXG4gICAgICBwaWNrZWQ6IGdvYWxDbGFzc05hbWUsXG4gICAgICBkYXRlOiBnb2FsLmRhdGUsXG4gICAgICBwcm9iYWJpbGl0eTogZ29hbC5wcm9iYWJpbGl0eVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gdmlldztcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUkVOREVSIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgc2hvd0dvYWxzID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgZ29hbHNMaXN0ID0gZGF0YS5nb2Fsc0xpc3Q7XG4gIHZhciBwaWNrZWRHb2FscyA9IGRhdGEucGlja2VkR29hbHM7XG5cbiAgaWYoICFBcnJheS5pc0FycmF5KGdvYWxzTGlzdCkgfHwgIUFycmF5LmlzQXJyYXkocGlja2VkR29hbHMpICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBmcmVlR29hbHNWaWV3ID0gZ2V0TGlzdEdvYWxzKGdvYWxzTGlzdCwgcGlja2VkR29hbHMsIGZyZWVHb2FsVGVtcGxhdGUsICdnb2FsLS1oaWRlJyk7XG4gIHZhciBwaWNrZWRHb2Fsc1ZpZXcgPSBnZXRMaXN0R29hbHMoZ29hbHNMaXN0LCBwaWNrZWRHb2FscywgcGlja2VkR29hbFRlbXBsYXRlLCAncGlja2VkLS1zaG93Jyk7XG4gIHN0YXRlTWFwLmZyZWVHb2Fscy5pbm5lckhUTUwgPSBmcmVlR29hbHNWaWV3O1xuICBzdGF0ZU1hcC5waWNrZWRHb2Fscy5pbm5lckhUTUwgPSBwaWNrZWRHb2Fsc1ZpZXc7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQVUJMSUMgRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBiaW5kID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgaWYgKGV2ZW50ID09PSAnZ29hbFRvZ2dsZWQnKSB7XG4gICAgLyoqXG4gICAgICogRXZlcnkgdGltZSBhIGJ1dHRvbiB0byBhZGQvcmVtb3ZlIGEgZ29hbCAoaW4gYm90aCBsaXN0cykgaXMgY2xpY2tlZFxuICAgICAqIHdlIHRvZ2dsZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZ29hbCBhbmQgY2FsbCB0aGUgc2hlbGwncyBmdW5jdGlvbiB0b1xuICAgICAqIHVwZGF0ZSB0aGUgTW9kZWxcbiAgICAgKi9cbiAgICBzdGF0ZU1hcC50b2dnbGVCdXR0b25zLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgLyogQEZJWE1FIFRoaXMgY291bGQgbmVlZCBhbiBpbXByb3ZlbWVudCB3aXRoICdFdmVudCBEZWxlZ2F0aW9uJyBpZiB0aGVcbiAgICAgICAgbnVtYmVyIG9mIGdvYWxzIGluY3JlYXNlIGJlY2F1c2Ugd2UgYXJlIGFkZGluZyBhbiBFdmVudCBMaXN0ZW5lciB0byBlYWNoXG4gICAgICAgIGdvYWwgKi9cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdvYWxOYW1lID0gdGhpcy5kYXRhc2V0LmdvYWw7XG4gICAgICAgIHZhciB0b2dnbGVkR29hbCA9IHN0YXRlTWFwLnBpY2tlZEdvYWxzLmdldCgncGlja2VkLS0nICsgZ29hbE5hbWUpO1xuICAgICAgICB2YXIgZGF0ZSA9IHRvZ2dsZWRHb2FsLnF1ZXJ5U2VsZWN0b3IoY29uZmlnTWFwLmRhdGVwaWNrZXIpLnZhbHVlO1xuXG4gICAgICAgIHRvZ2dsZWRHb2FsLmNsYXNzTGlzdC50b2dnbGUoJ3BpY2tlZC0tc2hvdycpO1xuICAgICAgICBzdGF0ZU1hcC5mcmVlR29hbHMuZ2V0KCdnb2FsLS0nICsgZ29hbE5hbWUpLmNsYXNzTGlzdC50b2dnbGUoJ2dvYWwtLWhpZGUnKTtcblxuICAgICAgICBoYW5kbGVyKHtcbiAgICAgICAgICBpZDogZ29hbE5hbWUsXG4gICAgICAgICAgZGF0ZTogZGF0ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc3RhdGVNYXAuZnJlZUdvYWxzID0gY29udGFpbmVyLmdldCgnZ29hbHMnKTtcbiAgc3RhdGVNYXAucGlja2VkR29hbHMgPSBjb250YWluZXIuZ2V0KCdwaWNrZWQtZ29hbHMnKTtcblxuICBzdGF0ZU1hcC50b2dnbGVCdXR0b25zID0gY29udGFpbmVyLmdldEFsbChjb25maWdNYXAudG9nZ2xlQnV0dG9ucyk7XG59O1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdzaG93R29hbHMnOlxuICAgICAgc2hvd0dvYWxzKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3JlYXRlVG9vbHRpcHMnOlxuICAgICAgJCgnLmdvYWxfX2RldGFpbHMgPiBzcGFuJykudG9vbHRpcCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2V0RHJhZ0Ryb3AnOlxuICAgICAgZHJhZ3VsYShbc3RhdGVNYXAucGlja2VkR29hbHNdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZURhdGVwaWNrZXJzJzpcbiAgICAgICQoY29uZmlnTWFwLmRhdGVwaWNrZXIpLmRhdGVwaWNrZXIoe1xuICAgICAgICBhdXRvY2xvc2U6IHRydWUsXG4gICAgICAgIGZvcm1hdDogJ00gZCB5eXl5J1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcignTm8gY29tbWFuZCBmb3VuZC4nKTtcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHJlbmRlcjogcmVuZGVyLFxuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXBcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyIGRvbUhlbHBlcnMgPSByZXF1aXJlKCcuLi9kb20taGVscGVycycpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIG5hdjogbnVsbFxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBET00gRlVOQ1RJT05TIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBhY3RpdmF0ZU5hdiA9IGZ1bmN0aW9uKHN0ZXBOYW1lKSB7XG4gIGlmKHR5cGVvZiBzdGVwTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgc3RlcE5hbWUpO1xuICB9XG5cbiAgdmFyIG5ld0FjdGl2ZUxpbmsgPSBzdGF0ZU1hcC5uYXYuZ2V0KCdzdGVwLW5hbWUtLScgKyBzdGVwTmFtZSkucGFyZW50Tm9kZTtcblxuICAvL0FjdGl2YXRlIHRoZSBuYXZpZ2F0aW9uIGl0ZW1cbiAgaWYobmV3QWN0aXZlTGluay5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc2FibGVkJykpIHtcbiAgICBuZXdBY3RpdmVMaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICBkb21IZWxwZXJzLnNldEFjdGl2ZShuZXdBY3RpdmVMaW5rLCAnYWN0aXZlJyk7XG59O1xuXG52YXIgYWN0aXZhdGVTdGVwID0gZnVuY3Rpb24oc3RlcE5hbWUpIHtcbiAgaWYodHlwZW9mIHN0ZXBOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBzdGVwTmFtZSk7XG4gIH1cblxuICB2YXIgbmV4dFN0ZXBXcmFwcGVyID0gZG9jdW1lbnQuZ2V0KCdzdGVwLS0nICsgc3RlcE5hbWUpO1xuICBkb21IZWxwZXJzLnNldEFjdGl2ZShuZXh0U3RlcFdyYXBwZXIsICdzaG93Jyk7XG59O1xuXG52YXIgYmluZExpbmtDbGlja2VkID0gZnVuY3Rpb24oZSwgaGFuZGxlcikge1xuICB2YXIgbm9kZU5hbWUgPSBlLnRhcmdldC5ub2RlTmFtZTtcbiAgdmFyIG5leHRTdGVwTmFtZSwgY2xpY2tlZExpbms7XG5cbiAgLy9JZiBpdCBpcyB0aGUgJ1Jlc2V0IE1vZGVsJyBidXR0b25cbiAgaWYgKG5vZGVOYW1lID09PSAnQScpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAobm9kZU5hbWUgPT09ICdTUEFOJykge1xuICAgIG5leHRTdGVwTmFtZSA9IGUudGFyZ2V0LmRhdGFzZXQudGVtcGxhdGU7XG4gICAgY2xpY2tlZExpbmsgPSBlLnRhcmdldC5wYXJlbnROb2RlO1xuICB9IGVsc2UgaWYgKG5vZGVOYW1lID09PSAnTEknKSB7XG4gICAgbmV4dFN0ZXBOYW1lID0gZS50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuZGF0YXNldC50ZW1wbGF0ZTtcbiAgICBjbGlja2VkTGluayA9IGUudGFyZ2V0O1xuICB9XG5cbiAgaWYgKCBjbGlja2VkTGluayAmJiAhY2xpY2tlZExpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNhYmxlZCcpKSB7XG4gICAgZG9tSGVscGVycy5zZXRBY3RpdmUoY2xpY2tlZExpbmssICdhY3RpdmUnKTtcbiAgICBhY3RpdmF0ZVN0ZXAobmV4dFN0ZXBOYW1lKTtcbiAgICBoYW5kbGVyKG5leHRTdGVwTmFtZSk7XG4gIH1cbn07XG5cbi8qKlxuICogQWRkcyAnZGlzYWJsZWQnIGNsYXNzIHRvIG5hdmlnYXRpb24gbGlua3MgZnJvbSB0aGUgaXRlbSBudW1iZXIgJ3N0YXJ0J1xuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhIE9iamVjdCB3aXRoIHRoZSBudW1iZXIgb2YgdGhlIGZpcnN0IGxpbmsgdG8gc3RhcnQgd2l0aFxuICovXG52YXIgZGlzYWJsZUxpbmtzID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbGFzdFVzZXJTdGVwID0gZGF0YS5sYXN0VXNlclN0ZXA7XG5cbiAgaWYodHlwZW9mIGxhc3RVc2VyU3RlcCAhPT0gJ251bWJlcicpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgbGFzdFVzZXJTdGVwKTtcbiAgfVxuXG4gIHZhciBuYXZJdGVtcyA9IHN0YXRlTWFwLm5hdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcblxuICAvL1dlIGRpc2FibGUgbGlua3MgYWZ0ZXIgdGhlIGxhc3Qgb25lIHNlZW4gYnkgdXNlciBpbiBwcmV2aW91cyBzZXNzaW9uXG4gIGZvciAodmFyIGkgPSBsYXN0VXNlclN0ZXAsIGxlbiA9IG5hdkl0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbmF2SXRlbXNbaV0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQVUJMSUMgRlVOQ1RJT05TXG4gKi9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBpZihldmVudCA9PT0gJ2xpbmtDbGlja2VkJykge1xuICAgIHN0YXRlTWFwLm5hdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGJpbmRMaW5rQ2xpY2tlZChlLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oKSB7XG4gIHN0YXRlTWFwLm5hdiA9IGRvY3VtZW50LmdldCgnbmF2Jyk7XG59O1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kLCBkYXRhKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdhY3RpdmF0ZVN0ZXAnOlxuICAgICAgYWN0aXZhdGVTdGVwKGRhdGEuc3RlcE5hbWUpO1xuICAgICAgYWN0aXZhdGVOYXYoZGF0YS5zdGVwTmFtZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkaXNhYmxlTGlua3MnOlxuICAgICAgZGlzYWJsZUxpbmtzKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kLFxuICByZW5kZXI6IHJlbmRlcixcbiAgc2V0U3RhdGVNYXA6IHNldFN0YXRlTWFwXG59OyIsIi8qKlxuICogU2NyZWVuICM4IC0gUmV0aXJlbWVudCBtb2R1bGVcbiAqIEBtb2R1bGUgOC1SZXRpcmVtZW50XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxudmFyIHN0YXRlTWFwID0ge1xuICB0Ym9keTogbnVsbFxufTtcblxudmFyIGFjdGlvblRlbXBsYXRlID0gJzx0cj48dGQ+PGkgY2xhc3M9XCJ6bWRpIHptZGktY2hlY2stY2lyY2xlXCIgZGF0YS1hY3Rpb249XCJ7aW5kZXh9XCI+PC9pPjwvdGQ+JyArXG4gICc8dGQ+e3RvRG99PC90ZD4nICtcbiAgJzx0ZD57bm90VG9Eb308L3RkPicgK1xuICAnPHRkPjxpIGNsYXNzPVwiem1kaSB6bWRpLWluZm8tb3V0bGluZVwiIGRhdGEtdG9nZ2xlPVwicG9wb3ZlclwiIGRhdGEtcGxhY2VtZW50PVwibGVmdFwiIGRhdGEtY29udGVudD1cIntkZXRhaWxzfVwiXCI+PC9pPjwvdGQ+PC90cj4nO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERPTSBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXJrdXAgZm9yIHRoZSBnb2Fsc1xuICogQHBhcmFtICB7b2JqZWN0fSBnb2FsIE9iamVjdCBtYXAgd2l0aCBnb2FsIHByb3BlcnRpZXMgYW5kIGl0cyBhY3Rpb25zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXRBY3Rpb25zSFRNTCA9IGZ1bmN0aW9uKGdvYWwpIHtcbiAgdmFyIGlkID0gZ29hbC5pZDtcbiAgdmFyIGFjdGlvbnMgPSBnb2FsLmFjdGlvbnM7XG4gIHZhciBtYXJrdXAgPSAnJztcblxuICBpZiggKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHx8ICh0eXBlb2YgYWN0aW9ucyAhPT0gJ29iamVjdCcpICkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBnb2FsKTtcbiAgfVxuXG4gIG1hcmt1cCArPVxuICAgICc8dHIgY2xhc3M9XCInICsgaWQgKyAnXCI+JyArXG4gICAgICAnPHRkIGNvbHNwYW49XCI0XCI+PGg0PicgKyBpZFswXS50b1VwcGVyQ2FzZSgpICsgaWQuc2xpY2UoMSkgKyAnPC9oND48L3RkPicgK1xuICAgICc8L3RyPic7XG5cbiAgYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHZhciBkZXRhaWxzID0gYWN0aW9uLmRldGFpbHMucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgICAgcmV0dXJuIHByZXYgKyAnPGxpPicgKyBjdXIgKyAnPC9saT4nO1xuICAgIH0sICcnKTtcblxuICAgIGRldGFpbHMgPSAnPHVsPicgKyBkZXRhaWxzICsgJzwvdWw+JztcbiAgICBtYXJrdXAgKz0gaGVscGVycy50ZW1wbGF0ZShhY3Rpb25UZW1wbGF0ZSwge1xuICAgICAgaWQ6IGlkLFxuICAgICAgaW5kZXg6IGFjdGlvbi5pZCxcbiAgICAgIHRvRG86IGFjdGlvbi50b0RvLFxuICAgICAgbm90VG9EbzogYWN0aW9uLm5vdFRvRG8sXG4gICAgICBkZXRhaWxzOiBkZXRhaWxzXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBtYXJrdXA7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJFTkRFUiBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIHNob3dHb2Fsc0FjdGlvbnMgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBnb2FscyA9IGRhdGE7XG4gIGlmKCFBcnJheS5pc0FycmF5KGdvYWxzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBnb2Fscyk7XG4gIH1cblxuICBpZihnb2Fscy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBhY3Rpb25zSFRNTCA9ICcnO1xuXG4gIGdvYWxzLmZvckVhY2goZnVuY3Rpb24oZ29hbCkge1xuICAgIGFjdGlvbnNIVE1MICs9IGdldEFjdGlvbnNIVE1MKGdvYWwpO1xuICB9KTtcblxuICBzdGF0ZU1hcC50Ym9keS5pbm5lckhUTUwgPSBhY3Rpb25zSFRNTDtcbn07XG5cbi8qKlxuICogUFVCTElDIEZVTkNUSU9OU1xuICovXG5cbnZhciBiaW5kID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgaWYgKGV2ZW50ID09PSAnYWN0aW9uVG9nZ2xlZCcpIHtcbiAgICBzdGF0ZU1hcC50Ym9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gJ0knICYmIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3ptZGktY2hlY2stY2lyY2xlJykpIHtcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoJ3NhdmVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRhcmdldC5kYXRhc2V0LmFjdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQsIGRhdGEpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ3Nob3dHb2Fsc0FjdGlvbnMnOlxuICAgICAgc2hvd0dvYWxzQWN0aW9ucyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZVBvcG92ZXJzJzpcbiAgICAgICQoJy5zdGVwLS1wbGFuIC56bWRpLWluZm8tb3V0bGluZScpLnBvcG92ZXIoe1xuICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICB0aXRsZTogJ0RldGFpbHMnXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBjb21tYW5kIGZvdW5kLicpO1xuICAgICAgcmV0dXJuO1xuICB9XG59O1xuXG52YXIgc2V0U3RhdGVNYXAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgc3RhdGVNYXAudGJvZHkgPSBjb250YWluZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3Rib2R5JylbMF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgcmVuZGVyOiByZW5kZXIsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcFxufTtcbiIsIi8qKlxuICogU2NyZWVuICM4IC0gUmV0aXJlbWVudCBtb2R1bGVcbiAqIEBtb2R1bGUgOC1SZXRpcmVtZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGFjdGlvblRpdGxlczogbnVsbCxcbiAgcHJpbnRCdXR0b246IG51bGxcbn07XG5cbi8qKlxuICogRE9NIEZVTkNUSU9OU1xuICovXG5cbnZhciBwcmludFBsYW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByaW50UGFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgIGh0bWwgPSAnPGgxIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3VyIEFjdGlvbiBQbGFuPC9oMT4nO1xuXG4gIHByaW50UGFnZS5jbGFzc0xpc3QuYWRkKCdwcmludC1wYWdlJyk7XG5cbiAgdmFyIHBsYW5BY3Rpb25zID0gW3tcbiAgICB0aXRsZTogJ1BsYXkgYSBzdGF5LWNhdGlvbicsXG4gICAgdHlwZTogJ1ZhcmlhYmxlIGV4cGVuc2UnLFxuICAgIGRhdGU6ICdOb3ZlbWJlciAyOHRoIDIwMTYnLFxuICAgIGRldGFpbHM6ICdCYW5rIHdoYXQgeW91IHNhdmUnXG4gIH0sIHtcbiAgICB0aXRsZTogJ1BsYXkgYSBzdGF5LWNhdGlvbicsXG4gICAgdHlwZTogJ1ZhcmlhYmxlIGV4cGVuc2UnLFxuICAgIGRhdGU6ICdOb3ZlbWJlciAyOHRoIDIwMTYnLFxuICAgIGRldGFpbHM6ICdCYW5rIHdoYXQgeW91IHNhdmUnXG4gIH0sIHtcbiAgICB0aXRsZTogJ1BsYXkgYSBzdGF5LWNhdGlvbicsXG4gICAgdHlwZTogJ1ZhcmlhYmxlIGV4cGVuc2UnLFxuICAgIGRhdGU6ICdOb3ZlbWJlciAyOHRoIDIwMTYnLFxuICAgIGRldGFpbHM6ICdCYW5rIHdoYXQgeW91IHNhdmUnXG4gIH0sIHtcbiAgICB0aXRsZTogJ1BsYXkgYSBzdGF5LWNhdGlvbicsXG4gICAgdHlwZTogJ1ZhcmlhYmxlIGV4cGVuc2UnLFxuICAgIGRhdGU6ICdOb3ZlbWJlciAyOHRoIDIwMTYnLFxuICAgIGRldGFpbHM6ICdCYW5rIHdoYXQgeW91IHNhdmUnXG4gIH0sIHtcbiAgICB0aXRsZTogJ1BsYXkgYSBzdGF5LWNhdGlvbicsXG4gICAgdHlwZTogJ1ZhcmlhYmxlIGV4cGVuc2UnLFxuICAgIGRhdGU6ICdOb3ZlbWJlciAyOHRoIDIwMTYnLFxuICAgIGRldGFpbHM6ICdCYW5rIHdoYXQgeW91IHNhdmUnXG4gIH1dO1xuXG4gIHZhciB0SGVhZCA9ICc8dGFibGUgY2xhc3M9XCJ0YWJsZVwiPjx0aGVhZD48dHI+PHRoPlRpdGxlPC90aD48dGg+dHlwZTwvdGg+PHRoPkRhdGU8L3RoPjx0aD5EZXRhaWxzPC90aD48L3RyPjwvdGhlYWQ+JyxcbiAgICB0Qm9keSA9ICc8dGJvZHk+JztcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGxhbkFjdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB0Qm9keSArPSAnPHRyPjx0ZD4nICsgcGxhbkFjdGlvbnNbaV0udGl0bGUgKyAnPC90ZD4nICtcbiAgICAgICc8dGQ+JyArIHBsYW5BY3Rpb25zW2ldLnR5cGUgKyAnPC90ZD4nICtcbiAgICAgICc8dGQ+JyArIHBsYW5BY3Rpb25zW2ldLmRhdGUgKyAnPC90ZD4nICtcbiAgICAgICc8dGQ+JyArIHBsYW5BY3Rpb25zW2ldLmRldGFpbHMgKyAnPC90ZD48dHI+JztcbiAgfVxuXG4gIHRCb2R5ICs9ICc8L3Rib2R5PjwvdGFibGU+JztcbiAgaHRtbCArPSB0SGVhZCArIHRCb2R5O1xuXG4gIHByaW50UGFnZS5pbm5lckhUTUwgPSBodG1sO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHByaW50UGFnZSk7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbm8tcHJpbnQnKTtcblxuICB3aW5kb3cucHJpbnQoKTtcblxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLXByaW50Jyk7XG4gIHByaW50UGFnZS5pbm5lckhUTUwgPSAnJztcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFBVQkxJQyBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBpZihldmVudCA9PT0gJ3ByaW50Q2xpY2tlZCcpIHtcbiAgICBzdGF0ZU1hcC5wcmludEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oY21kKSB7XG4gIHN3aXRjaChjbWQpIHtcbiAgICBjYXNlICdjcmVhdGVQb3BvdmVycyc6XG4gICAgICAkKCcucGxhbi13cmFwcGVyIC56bWRpLWluZm8tb3V0bGluZScpLnBvcG92ZXIoe1xuICAgICAgICBwbGFjZW1lbnQ6ICdsZWZ0J1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGVEYXRlcGlja2Vycyc6XG4gICAgICAkKCcucGxhbi13cmFwcGVyIC56bWRpLWNhbGVuZGFyLWFsdCcpXG4gICAgICAgIC5kYXRlcGlja2VyKHtcbiAgICAgICAgICBhdXRvY2xvc2U6IHRydWUsXG4gICAgICAgICAgZm9ybWF0OiAnTSBkIHl5eXknXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2hhbmdlRGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdGhpcy5kYXRhc2V0LmRhdGUgPSBldmVudC5mb3JtYXQoKTtcbiAgICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmludFBsYW4nOlxuICAgICAgcHJpbnRQbGFuKCk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxudmFyIHNldFN0YXRlTWFwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gIHN0YXRlTWFwLmFjdGlvblRpdGxlcyA9IGNvbnRhaW5lci5nZXRBbGwoJ2FjdGlvbl9fdGl0bGUnKTtcbiAgc3RhdGVNYXAucHJpbnRCdXR0b24gPSBjb250YWluZXIuZ2V0KCdwcmludCcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmQsXG4gIHJlbmRlcjogcmVuZGVyLFxuICBzZXRTdGF0ZU1hcDogc2V0U3RhdGVNYXBcbn07XG4iLCIvKipcbiAqIFNjcmVlbiAjNiAtIFNjZW5hcmlvcyBtb2R1bGVcbiAqIEBtb2R1bGUgNi1TY2VuYXJpb3NcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xudmFyIGRvbUhlbHBlcnMgPSByZXF1aXJlKCcuLi9kb20taGVscGVycycpO1xudmFyIHdOdW1iID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dOdW1iJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3TnVtYiddIDogbnVsbCk7XG52YXIgQ2hhcnRpc3QgPSByZXF1aXJlKCdjaGFydGlzdCcpO1xuXG52YXIgc3RhdGVNYXAgPSB7XG4gIGluY29tZVNsaWRlcjogbnVsbCxcbiAgaW52ZXN0bWVudFJhdGVTbGlkZXI6IG51bGwsXG4gIHJldGlyZW1lbnRTbGlkZXI6IG51bGwsXG5cbiAgaW52ZXN0bWVudFN0eWxlOiBudWxsLFxuICBsaW5lQ2hhcnQ6IG51bGwsXG4gIHJldGlyZW1lbnRTYXZpbmdzOiBudWxsXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIRUxQRVJTIEZVTkNUSU9OUyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIG1vbmV5Rm9ybWF0ID0gd051bWIoe1xuICB0aG91c2FuZDogJywnXG59KTtcblxuLyoqXG4gKiByZXR1cm5zIHRoZSBhbm51YWxJbnRlcmVzdFJhdGUgcmVsYXRpdmUgdG8gYSBnaXZlbiBpbnZlc3RtZW50IHN0eWxlXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGludmVzdG1lbnRTdHlsZSAgIFN0eWxlIG9mIGludmVzdG1lbnRcbiAqIEByZXR1cm4ge251bWJlcn0gYW5udWFsSW50ZXJlc3RSYXRlXG4gKi9cbnZhciBnZXRJbnRlcmVzdEJ5SW52ZXN0bWVudCA9IGZ1bmN0aW9uKGludmVzdG1lbnRTdHlsZSkge1xuICBpZih0eXBlb2YgaW52ZXN0bWVudFN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBpbnZlc3RtZW50U3R5bGUpO1xuICB9XG5cbiAgdmFyIGFubnVhbEludGVyZXN0UmF0ZTtcblxuICBzd2l0Y2ggKGludmVzdG1lbnRTdHlsZSkge1xuICAgIGNhc2UgJ3NhZmUnOlxuICAgICAgYW5udWFsSW50ZXJlc3RSYXRlID0gMC4wMjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vZGVyYXRlJzpcbiAgICAgIGFubnVhbEludGVyZXN0UmF0ZSA9IDAuMDY7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaXNreSc6XG4gICAgICBhbm51YWxJbnRlcmVzdFJhdGUgPSAwLjE1O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGFubnVhbEludGVyZXN0UmF0ZSA9IDAuMDY7XG4gIH1cblxuICByZXR1cm4gYW5udWFsSW50ZXJlc3RSYXRlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCBtb25leSB3aXRoIHRoZSBjb21wb3VuZCBpbnRlcmVzdFxuICogQHBhcmFtICB7bnVtYmVyfSBpbnRlcmVzdFJhdGUgJSBvZiBpbnRlcmVzdCAoZnJvbSAwIHRvIDEpXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHRlcm0gWWVhcnNcbiAqIEBwYXJhbSAge251bWJlcn0gYW10SW52ZXN0ZWQgSW5pdGlhbCBpbnZlc3RtZW50XG4gKiBAcGFyYW0gIHtudW1iZXJ9IGNvbnRyaWJBbXQgWWVhcmx5IGNvbnRyaWJ1dGlvblxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG52YXIgZ2V0QWNjdW11bGF0ZWRWYWx1ZSA9IGZ1bmN0aW9uKGludGVyZXN0UmF0ZSwgdGVybSwgYW10SW52ZXN0ZWQsIGNvbnRyaWJBbXQpIHtcbiAgdmFyIGFwcCA9IFtdO1xuICBhcHBbMF0gPSBhbXRJbnZlc3RlZDtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIG1vbnRobHlUZXJtID0gdGVybSAqIDEyO1xuICB2YXIgbW9udGhseUNvbnRyaWJBbXQgPSBjb250cmliQW10IC8gMTI7XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbW9udGhseVRlcm07IGkrKykge1xuICAgIHZhciBhcHByZWNpYXRpb24gPSAoaW50ZXJlc3RSYXRlIC8gMTIpICogKGFwcFtpIC0gMV0pO1xuICAgIGFwcFtpXSA9IGFwcHJlY2lhdGlvbiArIGFwcFtpIC0gMV0gKyBtb250aGx5Q29udHJpYkFtdDtcbiAgICB0b3RhbCA9IGFwcFtpIC0gMV07XG4gIH1cbiAgYXBwID0gbnVsbDtcbiAgcmV0dXJuIE1hdGgucm91bmQodG90YWwpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgdmFsdWVzIGZvciB4IGF4aXMgdGlja3MuIFlvdSBwYXNzIHRoZSBmaXJzdFxuICogYW5kIGxhc3QgdmFsdWVzIGFzIHBhcmFtZXRlcnMgYW5kIGl0IHJldHVybnMgYWxzbyB0aGUgb3RoZXIgdmFsdWVzIG9mIHRoZSByYW5nZS5cbiAqIEluIG91ciBjYXNlIGl0J3MgdXNlZCB0byBzaG93IHRoZSBzYXZpbmdzIHByb2dyZXNzIGFzIHRoZSB5ZWFycyBpbmNyZWFzZVxuICogdG93YXJkcyB0aGUgcmV0aXJlbWVudCBhZ2UuXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGZpcnN0VmFsdWUgRmlyc3QgdmFsdWUgb2YgdGhlIGF4aXNcbiAqIEBwYXJhbSAge051bWJlcn0gbGFzdFZhbHVlIExhc3QgdmFsdWUgb2YgdGhlIGF4aXNcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG52YXIgZ2V0WFRpY2tzID0gZnVuY3Rpb24oZmlyc3RWYWx1ZSwgbGFzdFZhbHVlKSB7XG4gIGlmKCFoZWxwZXJzLmlzTnVtYmVyKGZpcnN0VmFsdWUgKyBsYXN0VmFsdWUpKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIHtmaXJzdFZhbHVlOiBmaXJzdFZhbHVlLCBsYXN0VmFsdWU6IGxhc3RWYWx1ZX0pO1xuICB9XG5cbiAgdmFyIHZhbHVlcyA9IFtdO1xuICAvL0ZpcnN0IGFuZCBsYXN0IHZhbHVlcyBtdXN0IGJlIHByZWNpc2VcbiAgdmFsdWVzWzBdID0gZmlyc3RWYWx1ZTtcbiAgdmFsdWVzWzVdID0gbGFzdFZhbHVlO1xuXG4gIHZhciBkaWZmZXJlbmNlID0gKGxhc3RWYWx1ZSAtIGZpcnN0VmFsdWUpIC8gNTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCA1OyBpKyspIHtcbiAgICB2YWx1ZXNbaV0gPSBNYXRoLnJvdW5kKGZpcnN0VmFsdWUgKyAoZGlmZmVyZW5jZSAqIGkpKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCB0aGUgWSBheGlzIHZhbHVlc1xuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhIE9iamVjdCB3aXRoIGRhdGEgbmVlZGVkIGZvciB0aGUgY2FsY3VsYXRpb25cbiAqIEByZXR1cm4ge2FycmF5fSBzZXJpZSBBcnJheSB3aXRoIFkgYXhpcyB2YWx1ZXNcbiAqIEBleGFtcGxlXG4gKiBnZXRZU2VyaWUoe1xuICogICBpbmNvbWU6IDM1MDAwLFxuICogICBpbnZlc3RtZW50UmF0ZTogMTAwLFxuICogICBzYXZpbmdzUmF0ZTogMzAsXG4gKiAgIGN1cnJlbnRTYXZpbmdzOiAyMDAwMCxcbiAqICAgeFRpY2tzOiBbMjMsIDMzLCA0MywgNTMsIDYzLCA3M10sXG4gKiAgIGFubnVhbEludGVyZXN0UmF0ZTogMC4wNlxuICogfSlcbiAqL1xudmFyIGdldFlTZXJpZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGluY29tZSA9IGRhdGEuaW5jb21lO1xuICB2YXIgaW52ZXN0bWVudFJhdGUgPSBkYXRhLmludmVzdG1lbnRSYXRlO1xuICB2YXIgc2F2aW5nc1JhdGUgPSBkYXRhLnNhdmluZ3NSYXRlO1xuICB2YXIgY3VycmVudFNhdmluZ3MgPSBkYXRhLmN1cnJlbnRTYXZpbmdzO1xuICB2YXIgeFRpY2tzID0gZGF0YS54VGlja3M7XG4gIHZhciBhbm51YWxJbnRlcmVzdFJhdGUgPSAgZGF0YS5hbm51YWxJbnRlcmVzdFJhdGU7XG5cbiAgaWYoXG4gICAgIWhlbHBlcnMuaXNOdW1iZXIoaW5jb21lICsgaW52ZXN0bWVudFJhdGUgKyBzYXZpbmdzUmF0ZSArIGN1cnJlbnRTYXZpbmdzICsgYW5udWFsSW50ZXJlc3RSYXRlKSB8fFxuICAgICFBcnJheS5pc0FycmF5KHhUaWNrcylcbiAgKSB7XG4gICAgaGVscGVycy5tYWtlRXJyb3IoJ3BhcmFtcycsIGRhdGEpO1xuICB9XG5cbiAgLy8gV2UgYXJlIGFsc28gY29uc2lkZXJpbmcgdGhlIGludmVzdG1lbnQgcmF0ZSBpbiBBZHZhbmNlZCBvcHRpb25zLlxuICAvLyBTbyB0aGlzIGlzIChhbm51YWxTYXZpbmdzICogaW52ZXN0bWVudFJhdGUpIHRvIGJlIHByZWNpc2UuXG4gIHZhciBhbm51YWxTYXZpbmdzID0gKHNhdmluZ3NSYXRlIC8gMTAwKSAqIGluY29tZSAqIChpbnZlc3RtZW50UmF0ZSAvIDEwMCk7XG5cbiAgdmFyIGkgPSAwO1xuICB2YXIgc2VyaWUgPSBbXTtcblxuICAvL1dlIGFyZSBzZXR0aW5ncyB0aGUgZmlyc3QgWSB2YWx1ZSBvZiB0aGUgbGluZSBjaGFydCwgd2hpY2ggY29ycmVzcG9uZHNcbiAgLy90byB0aGUgaW5pdGlhbCBpbnZlc3RtZW50LlxuICBzZXJpZVswXSA9IGN1cnJlbnRTYXZpbmdzO1xuXG4gIC8vV2UgY2FsY3VsYXRlIHRoZSBvdGhlciB2YWx1ZXMgb2YgWSBzZXJpZSB3aXRoIHRoZSBDb21wb3VuZCBpbnRlcmVzdCBmdW5jdGlvblxuICBmb3IgKGkgPSAxOyBpIDwgNjsgaSs9IDEpIHtcbiAgICBzZXJpZVtpXSA9IGdldEFjY3VtdWxhdGVkVmFsdWUoXG4gICAgICBhbm51YWxJbnRlcmVzdFJhdGUsXG4gICAgICB4VGlja3NbaV0gLSB4VGlja3NbMF0sXG4gICAgICBjdXJyZW50U2F2aW5ncyxcbiAgICAgIGFubnVhbFNhdmluZ3NcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHNlcmllO1xufTtcblxudmFyIHVwZGF0ZVJldGlyZW1lbnRTYXZpbmdzID0gZnVuY3Rpb24ocmV0aXJlbWVudFNhdmluZ3MpIHtcbiAgc3RhdGVNYXAucmV0aXJlbWVudFNhdmluZ3MuY2hpbGROb2Rlc1sxXS50ZXh0Q29udGVudCA9IG1vbmV5Rm9ybWF0LnRvKHJldGlyZW1lbnRTYXZpbmdzKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFJFTkRFUiBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG52YXIgc2hvd1NsaWRlcnMgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBpbmNvbWUgPSBkYXRhLmluY29tZTtcbiAgdmFyIHNhdmluZ3NSYXRlID0gZGF0YS5zYXZpbmdzUmF0ZTtcblxuICAvL1dlIGNoZWNrIGRhdGEgYXJlIGFsbCBudW1iZXJzIGJ5IHN1bW1pbmcgdGhlbVxuICBpZighaGVscGVycy5pc051bWJlcihpbmNvbWUgKyBzYXZpbmdzUmF0ZSkpIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICB2YXIgc2F2aW5nUmF0ZU9wdGlvbnMgPSB7XG4gICAgc3RhcnQ6IHNhdmluZ3NSYXRlLFxuICAgIHN0ZXA6IDEsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxLFxuICAgICAgJ21heCc6IDEwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH07XG4gIHZhciBpbmNvbWVPcHRpb25zID0ge1xuICAgIHN0YXJ0OiBpbmNvbWUsXG4gICAgc3RlcDogMTAwMCxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDE4MDAwLFxuICAgICAgJ21heCc6IDIwMDAwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMSxcbiAgICAgIHRob3VzYW5kOiAnLidcbiAgICB9KVxuICB9O1xuXG4gIHZhciBpbnZlc3RtZW50T3B0aW9ucyA9IHtcbiAgICBzdGFydDogMTAwLFxuICAgIHN0ZXA6IDEsXG4gICAgcmFuZ2U6IHtcbiAgICAgICdtaW4nOiAxLFxuICAgICAgJ21heCc6IDEwMFxuICAgIH0sXG4gICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICBkZWNpbWFsczogMFxuICAgIH0pXG4gIH07XG4gIHZhciByZXRpcmVtZW50T3B0aW9ucyA9IHtcbiAgICBzdGFydDogNjUsXG4gICAgc3RlcDogMSxcbiAgICByYW5nZToge1xuICAgICAgJ21pbic6IDU1LFxuICAgICAgJ21heCc6IDc1XG4gICAgfSxcbiAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgIGRlY2ltYWxzOiAwXG4gICAgfSlcbiAgfTtcblxuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5zYXZpbmdSYXRlU2xpZGVyLCBzYXZpbmdSYXRlT3B0aW9ucywgJyUnKTtcbiAgZG9tSGVscGVycy5jcmVhdGVTbGlkZXIoc3RhdGVNYXAuaW5jb21lU2xpZGVyLCBpbmNvbWVPcHRpb25zLCAnJCcpO1xuICBkb21IZWxwZXJzLmNyZWF0ZVNsaWRlcihzdGF0ZU1hcC5pbnZlc3RtZW50UmF0ZVNsaWRlciwgaW52ZXN0bWVudE9wdGlvbnMsICclJyk7XG4gIGRvbUhlbHBlcnMuY3JlYXRlU2xpZGVyKHN0YXRlTWFwLnJldGlyZW1lbnRTbGlkZXIsIHJldGlyZW1lbnRPcHRpb25zKTtcbn07XG5cbnZhciBzaG93TGluZUNoYXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgYWdlID0gZGF0YS5hZ2U7XG4gIHZhciBpbmNvbWUgPSBkYXRhLmluY29tZTtcbiAgdmFyIHNhdmluZ3NSYXRlID0gZGF0YS5zYXZpbmdzUmF0ZTtcbiAgdmFyIGN1cnJlbnRTYXZpbmdzID0gZGF0YS5jdXJyZW50U2F2aW5ncztcblxuICBpZighaGVscGVycy5pc051bWJlcihhZ2UgKyBpbmNvbWUgKyBzYXZpbmdzUmF0ZSArIGN1cnJlbnRTYXZpbmdzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciBhbm51YWxJbnRlcmVzdFJhdGUgPSAwLjA2O1xuICB2YXIgaW52ZXN0bWVudFJhdGUgPSBOdW1iZXIoIHN0YXRlTWFwLmludmVzdG1lbnRSYXRlU2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkgKTtcbiAgdmFyIHJldGlyZW1lbnRBZ2UgPSBOdW1iZXIoIHN0YXRlTWFwLnJldGlyZW1lbnRTbGlkZXIubm9VaVNsaWRlci5nZXQoKSApO1xuICB2YXIgeFRpY2tzID0gZ2V0WFRpY2tzKGFnZSwgcmV0aXJlbWVudEFnZSk7XG4gIHZhciB5U2VyaWUgPSBnZXRZU2VyaWUoe1xuICAgIGluY29tZTogaW5jb21lLFxuICAgIGludmVzdG1lbnRSYXRlOiBpbnZlc3RtZW50UmF0ZSxcbiAgICBzYXZpbmdzUmF0ZTogc2F2aW5nc1JhdGUsXG4gICAgY3VycmVudFNhdmluZ3M6IGN1cnJlbnRTYXZpbmdzLFxuICAgIHhUaWNrczogeFRpY2tzLFxuICAgIGFubnVhbEludGVyZXN0UmF0ZTogYW5udWFsSW50ZXJlc3RSYXRlXG4gIH0pO1xuICB2YXIgY2hhcnREYXRhID0ge1xuICAgIGxhYmVsczogeFRpY2tzLFxuICAgIHNlcmllczogW3lTZXJpZV1cbiAgfTtcbiAgdmFyIGNoYXJ0T3B0aW9ucyA9IHtcbiAgICBheGlzWToge1xuICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlLzEwMDApICsgJ0snO1xuICAgICAgfSxcbiAgICAgIGhpZ2g6IDIwMDAwMDAsXG4gICAgICB0aWNrczogW2N1cnJlbnRTYXZpbmdzLCAyNTAwMDAsIDUwMDAwMCwgNzUwMDAwLCAxMDAwMDAwLCAxMjUwMDAwLCAxNTAwMDAwLCAxNzUwMDAwLCAyMDAwMDAwXSxcbiAgICAgIHR5cGU6IENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzXG4gICAgfSxcbiAgICBzaG93QXJlYTogdHJ1ZSxcbiAgICB3aWR0aDogJzQwMHB4JyxcbiAgICBoZWlnaHQ6ICcyNTBweCdcbiAgfTtcbiAgdmFyIHJlc3BvbnNpdmVPcHRpb25zID0gW1xuICAgIFsnc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0ODBweCknLCB7XG4gICAgICB3aWR0aDogJzMwMHB4J1xuICAgIH1dXG4gIF07XG5cbiAgc3RhdGVNYXAubGluZUNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5zY2VuYXJpb19fY2hhcnQnLCBjaGFydERhdGEsIGNoYXJ0T3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICB1cGRhdGVSZXRpcmVtZW50U2F2aW5ncyh5U2VyaWVbNV0pO1xufTtcblxuLyoqXG4gKiBVc2VkIGJ5IHNoZWxsIHRvIHNldCB0aGUgc2xpZGVycyB2YWx1ZXMgd2hlbiBkYXRhIGlzIGNoYW5nZWQgb24gc29tZSBvdGhlclxuICogc2NyZWVucy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIE9iamVjdCB3aXRoIHNsaWRlck5hbWUgYW5kIHZhbHVlIHByb3BlcnRpZXNcbiAqL1xudmFyIHNldFNsaWRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNsaWRlck5hbWUgPSBkYXRhLnNsaWRlck5hbWU7XG4gIHZhciB2YWx1ZSA9IGRhdGEudmFsdWU7XG5cbiAgaWYoICh0eXBlb2Ygc2xpZGVyTmFtZSAhPT0gJ3N0cmluZycpIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSApIHtcbiAgICBoZWxwZXJzLm1ha2VFcnJvcigncGFyYW1zJywgZGF0YSk7XG4gIH1cblxuICBpZiAoc2xpZGVyTmFtZSA9PT0gJ2luY29tZScpIHtcbiAgICBzdGF0ZU1hcC5pbmNvbWVTbGlkZXIubm9VaVNsaWRlci5zZXQodmFsdWUpO1xuICB9IGVsc2UgaWYgKHNsaWRlck5hbWUgPT09ICdzYXZpbmdzUmF0ZScpIHtcbiAgICBzdGF0ZU1hcC5zYXZpbmdSYXRlU2xpZGVyLm5vVWlTbGlkZXIuc2V0KHZhbHVlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBsaW5lIGNoYXJ0IHdpdGggYSBuZXcgWSBzZXJpZSB3aGVuIHVzZXIgY2hhbmdlcyBpbnZlc3RtZW50IHN0eWxlXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRhdGEgT2JqZWN0IHdpdGggdGhlIGRhdGEgbmVlZGVkIHRvIGNhbGN1bGF0ZSB0aGUgc2VyaWVcbiAqIEBleGFtcGxlXG4gKiB1cGRhdGVMaW5lQ2hhcnRTZXJpZSh7XG4gKiAgIGluY29tZTogMzAwMDAsXG4gKiAgIGludmVzdG1lbnRSYXRlOiAxMDAsIC8vb3B0aW9uYWxcbiAqICAgc2F2aW5nc1JhdGU6IDMwLFxuICogICBhbm51YWxJbnRlcmVzdFJhdGU6IDAuMDYsIC8vb3B0aW9uYWxcbiAqICAgYWdlOiAyMCxcbiAqICAgcmV0aXJlbWVudEFnZTogNjUsIC8vb3B0aW9uYWxcbiAqICAgY3VycmVudFNhdmluZ3M6IDIwMDAwXG4gKiB9KVxuICovXG52YXIgdXBkYXRlTGluZUNoYXJ0U2VyaWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBsaW5lQ2hhcnQgPSBzdGF0ZU1hcC5saW5lQ2hhcnQ7XG4gIHZhciBjaGFydERhdGEgPSBsaW5lQ2hhcnQuZGF0YTtcbiAgdmFyIGNoYXJ0T3B0aW9ucyA9IGxpbmVDaGFydC5vcHRpb25zO1xuXG4gIHZhciBhZ2UgPSBkYXRhLmFnZTtcbiAgdmFyIGludmVzdG1lbnRSYXRlID0gZGF0YS5pbnZlc3RtZW50UmF0ZSB8fCBOdW1iZXIoIHN0YXRlTWFwLmludmVzdG1lbnRSYXRlU2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkgKTtcbiAgdmFyIGFubnVhbEludGVyZXN0UmF0ZSA9IGRhdGEuYW5udWFsSW50ZXJlc3RSYXRlIHx8IGdldEludGVyZXN0QnlJbnZlc3RtZW50KCBzdGF0ZU1hcC5pbnZlc3RtZW50U3R5bGUucXVlcnlTZWxlY3RvcignaW5wdXQ6Y2hlY2tlZCcpLnZhbHVlICk7XG4gIHZhciByZXRpcmVtZW50QWdlID0gZGF0YS5yZXRpcmVtZW50QWdlIHx8IE51bWJlciggc3RhdGVNYXAucmV0aXJlbWVudFNsaWRlci5ub1VpU2xpZGVyLmdldCgpICkgO1xuICB2YXIgeFRpY2tzID0gZ2V0WFRpY2tzKGFnZSwgcmV0aXJlbWVudEFnZSk7XG5cbiAgaWYoIUFycmF5LmlzQXJyYXkoeFRpY2tzKSkge1xuICAgIGhlbHBlcnMubWFrZUVycm9yKCdwYXJhbXMnLCBkYXRhKTtcbiAgfVxuXG4gIHZhciB5U2VyaWUgPSBnZXRZU2VyaWUoe1xuICAgIGluY29tZTogZGF0YS5pbmNvbWUsXG4gICAgaW52ZXN0bWVudFJhdGU6IGludmVzdG1lbnRSYXRlLFxuICAgIHNhdmluZ3NSYXRlOiBkYXRhLnNhdmluZ3NSYXRlLFxuICAgIGFubnVhbEludGVyZXN0UmF0ZTogYW5udWFsSW50ZXJlc3RSYXRlLFxuICAgIGN1cnJlbnRTYXZpbmdzOiBkYXRhLmN1cnJlbnRTYXZpbmdzLFxuICAgIHhUaWNrczogeFRpY2tzXG4gIH0pO1xuXG4gIGNoYXJ0RGF0YS5sYWJlbHMgPSB4VGlja3M7XG4gIGNoYXJ0RGF0YS5zZXJpZXNbMF0gPSB5U2VyaWU7XG4gIGNoYXJ0T3B0aW9ucy5heGlzWS50aWNrc1swXSA9IGRhdGEuY3VycmVudFNhdmluZ3M7XG5cbiAgbGluZUNoYXJ0LnVwZGF0ZShjaGFydERhdGEsIGNoYXJ0T3B0aW9ucyk7XG4gIHVwZGF0ZVJldGlyZW1lbnRTYXZpbmdzKHlTZXJpZVs1XSk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFBVQkxpQyBGVU5DVElPTlMgLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIGJpbmQgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICBzd2l0Y2goZXZlbnQpIHtcbiAgICBjYXNlICdhbm51YWxJbnRlcmVzdFJhdGVDaGFuZ2VkJzpcbiAgICAgIHN0YXRlTWFwLmludmVzdG1lbnRTdHlsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGhhbmRsZXIoIGdldEludGVyZXN0QnlJbnZlc3RtZW50KGUudGFyZ2V0LnZhbHVlKSApO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzYXZpbmdzUmF0ZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuc2F2aW5nUmF0ZVNsaWRlci5ub1VpU2xpZGVyLm9uKCdzZXQnLCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaGFuZGxlcihOdW1iZXIodmFsdWVzWzBdKSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luY29tZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuaW5jb21lU2xpZGVyLm5vVWlTbGlkZXIub24oJ3NldCcsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgaW5jb21lID0gTnVtYmVyKHZhbHVlc1swXS5yZXBsYWNlKCcuJywgJycpKTtcbiAgICAgICAgaGFuZGxlcihpbmNvbWUpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbnZlc3RtZW50UmF0ZUNoYW5nZWQnOlxuICAgICAgc3RhdGVNYXAuaW52ZXN0bWVudFJhdGVTbGlkZXIubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIGhhbmRsZXIoTnVtYmVyKHZhbHVlc1swXSkpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXRpcmVtZW50QWdlQ2hhbmdlZCc6XG4gICAgICBzdGF0ZU1hcC5yZXRpcmVtZW50U2xpZGVyLm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBoYW5kbGVyKE51bWJlcih2YWx1ZXNbMF0pKTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGJpbmQgZXZlbnQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciByZW5kZXIgPSBmdW5jdGlvbihjbWQsIGRhdGEpIHtcbiAgc3dpdGNoKGNtZCkge1xuICAgIGNhc2UgJ3NldFNsaWRlcic6XG4gICAgICBzZXRTbGlkZXIoZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG93U2xpZGVycyc6XG4gICAgICBzaG93U2xpZGVycyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3dMaW5lQ2hhcnQnOlxuICAgICAgc2hvd0xpbmVDaGFydChkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwZGF0ZUxpbmVDaGFydFNlcmllJzpcbiAgICAgIHVwZGF0ZUxpbmVDaGFydFNlcmllKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvbW1hbmQgZm91bmQuJyk7XG4gICAgICByZXR1cm47XG4gIH1cbn07XG5cbnZhciBzZXRTdGF0ZU1hcCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBzdGF0ZU1hcC5zYXZpbmdSYXRlU2xpZGVyID0gY29udGFpbmVyLmdldCgnb3B0aW9uX19zbGlkZXItLXNhdmluZycpO1xuICBzdGF0ZU1hcC5pbmNvbWVTbGlkZXIgPSBjb250YWluZXIuZ2V0KCdvcHRpb25fX3NsaWRlci0taW5jb21lJyk7XG4gIHN0YXRlTWFwLmludmVzdG1lbnRSYXRlU2xpZGVyID0gY29udGFpbmVyLmdldCgnb3B0aW9uX19zbGlkZXItLWludmVzdG1lbnQnKTtcbiAgc3RhdGVNYXAucmV0aXJlbWVudFNsaWRlciA9IGNvbnRhaW5lci5nZXQoJ29wdGlvbl9fc2xpZGVyLS1yZXRpcmVtZW50Jyk7XG5cbiAgc3RhdGVNYXAuaW52ZXN0bWVudFN0eWxlID0gY29udGFpbmVyLmdldCgnaW52ZXN0bWVudCcpO1xuXG4gIHN0YXRlTWFwLnJldGlyZW1lbnRTYXZpbmdzID0gY29udGFpbmVyLmdldCgnc2F2aW5nc19fYW1vdW50Jyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmluZDogYmluZCxcbiAgcmVuZGVyOiByZW5kZXIsXG4gIHNldFN0YXRlTWFwOiBzZXRTdGF0ZU1hcFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXRvYSAoYSwgbikgeyByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwgbik7IH1cbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlIHVubGVzcyBhbWRNb2R1bGVJZCBpcyBzZXRcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAocm9vdFsnQ2hhcnRpc3QnXSA9IGZhY3RvcnkoKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIHJvb3RbJ0NoYXJ0aXN0J10gPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4vKiBDaGFydGlzdC5qcyAwLjkuNVxuICogQ29weXJpZ2h0IMKpIDIwMTUgR2lvbiBLdW56XG4gKiBGcmVlIHRvIHVzZSB1bmRlciB0aGUgV1RGUEwgbGljZW5zZS5cbiAqIGh0dHA6Ly93d3cud3RmcGwubmV0L1xuICovXG4vKipcbiAqIFRoZSBjb3JlIG1vZHVsZSBvZiBDaGFydGlzdCB0aGF0IGlzIG1haW5seSBwcm92aWRpbmcgc3RhdGljIGZ1bmN0aW9ucyBhbmQgaGlnaGVyIGxldmVsIGZ1bmN0aW9ucyBmb3IgY2hhcnQgbW9kdWxlcy5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkNvcmVcbiAqL1xudmFyIENoYXJ0aXN0ID0ge1xuICB2ZXJzaW9uOiAnMC45LjUnXG59O1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogSGVscHMgdG8gc2ltcGxpZnkgZnVuY3Rpb25hbCBzdHlsZSBjb2RlXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7Kn0gbiBUaGlzIGV4YWN0IHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQgYnkgdGhlIG5vb3AgZnVuY3Rpb25cbiAgICogQHJldHVybiB7Kn0gVGhlIHNhbWUgdmFsdWUgdGhhdCB3YXMgcHJvdmlkZWQgdG8gdGhlIG4gcGFyYW1ldGVyXG4gICAqL1xuICBDaGFydGlzdC5ub29wID0gZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gbjtcbiAgfTtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEteiBmcm9tIGEgbnVtYmVyIDAgdG8gMjZcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG4gQSBudW1iZXIgZnJvbSAwIHRvIDI2IHRoYXQgd2lsbCByZXN1bHQgaW4gYSBsZXR0ZXIgYS16XG4gICAqIEByZXR1cm4ge1N0cmluZ30gQSBjaGFyYWN0ZXIgZnJvbSBhLXogYmFzZWQgb24gdGhlIGlucHV0IG51bWJlciBuXG4gICAqL1xuICBDaGFydGlzdC5hbHBoYU51bWVyYXRlID0gZnVuY3Rpb24gKG4pIHtcbiAgICAvLyBMaW1pdCB0byBhLXpcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSg5NyArIG4gJSAyNik7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNpbXBsZSByZWN1cnNpdmUgb2JqZWN0IGV4dGVuZFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IFRhcmdldCBvYmplY3Qgd2hlcmUgdGhlIHNvdXJjZSB3aWxsIGJlIG1lcmdlZCBpbnRvXG4gICAqIEBwYXJhbSB7T2JqZWN0Li4ufSBzb3VyY2VzIFRoaXMgb2JqZWN0IChvYmplY3RzKSB3aWxsIGJlIG1lcmdlZCBpbnRvIHRhcmdldCBhbmQgdGhlbiB0YXJnZXQgaXMgcmV0dXJuZWRcbiAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3QgdGhhdCBoYXMgdGhlIHNhbWUgcmVmZXJlbmNlIGFzIHRhcmdldCBidXQgaXMgZXh0ZW5kZWQgYW5kIG1lcmdlZCB3aXRoIHRoZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZVxuICAgKi9cbiAgQ2hhcnRpc3QuZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcblxuICAgIHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZVtwcm9wXSA9PT0gJ29iamVjdCcgJiYgc291cmNlW3Byb3BdICE9PSBudWxsICYmICEoc291cmNlW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W3Byb3BdID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCB0YXJnZXRbcHJvcF0sIHNvdXJjZVtwcm9wXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyBhbGwgb2NjdXJyZW5jZXMgb2Ygc3ViU3RyIGluIHN0ciB3aXRoIG5ld1N1YlN0ciBhbmQgcmV0dXJucyBhIG5ldyBzdHJpbmcuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN1YlN0clxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmV3U3ViU3RyXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG4gIENoYXJ0aXN0LnJlcGxhY2VBbGwgPSBmdW5jdGlvbihzdHIsIHN1YlN0ciwgbmV3U3ViU3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoc3ViU3RyLCAnZycpLCBuZXdTdWJTdHIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG51bWJlciB0byBhIHN0cmluZyB3aXRoIGEgdW5pdC4gSWYgYSBzdHJpbmcgaXMgcGFzc2VkIHRoZW4gdGhpcyB3aWxsIGJlIHJldHVybmVkIHVubW9kaWZpZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdW5pdFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFJldHVybnMgdGhlIHBhc3NlZCBudW1iZXIgdmFsdWUgd2l0aCB1bml0LlxuICAgKi9cbiAgQ2hhcnRpc3QuZW5zdXJlVW5pdCA9IGZ1bmN0aW9uKHZhbHVlLCB1bml0KSB7XG4gICAgaWYodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgdmFsdWUgPSB2YWx1ZSArIHVuaXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG51bWJlciBvciBzdHJpbmcgdG8gYSBxdWFudGl0eSBvYmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gaW5wdXRcbiAgICogQHJldHVybiB7T2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSB2YWx1ZSBhcyBudW1iZXIgYW5kIHRoZSB1bml0IGFzIHN0cmluZy5cbiAgICovXG4gIENoYXJ0aXN0LnF1YW50aXR5ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIG1hdGNoID0gKC9eKFxcZCspXFxzKiguKikkL2cpLmV4ZWMoaW5wdXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUgOiArbWF0Y2hbMV0sXG4gICAgICAgIHVuaXQ6IG1hdGNoWzJdIHx8IHVuZGVmaW5lZFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgdmFsdWU6IGlucHV0IH07XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYSB3cmFwcGVyIGFyb3VuZCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIHRoYXQgd2lsbCByZXR1cm4gdGhlIHF1ZXJ5IGlmIGl0J3MgYWxyZWFkeSBvZiB0eXBlIE5vZGVcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgVGhlIHF1ZXJ5IHRvIHVzZSBmb3Igc2VsZWN0aW5nIGEgTm9kZSBvciBhIERPTSBub2RlIHRoYXQgd2lsbCBiZSByZXR1cm5lZCBkaXJlY3RseVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cbiAgQ2hhcnRpc3QucXVlcnlTZWxlY3RvciA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgcmV0dXJuIHF1ZXJ5IGluc3RhbmNlb2YgTm9kZSA/IHF1ZXJ5IDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uYWwgc3R5bGUgaGVscGVyIHRvIHByb2R1Y2UgYXJyYXkgd2l0aCBnaXZlbiBsZW5ndGggaW5pdGlhbGl6ZWQgd2l0aCB1bmRlZmluZWQgdmFsdWVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBsZW5ndGhcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBDaGFydGlzdC50aW1lcyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHJldHVybiBBcnJheS5hcHBseShudWxsLCBuZXcgQXJyYXkobGVuZ3RoKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN1bSBoZWxwZXIgdG8gYmUgdXNlZCBpbiByZWR1Y2UgZnVuY3Rpb25zXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBwcmV2aW91c1xuICAgKiBAcGFyYW0gY3VycmVudFxuICAgKiBAcmV0dXJuIHsqfVxuICAgKi9cbiAgQ2hhcnRpc3Quc3VtID0gZnVuY3Rpb24ocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICByZXR1cm4gcHJldmlvdXMgKyAoY3VycmVudCA/IGN1cnJlbnQgOiAwKTtcbiAgfTtcblxuICAvKipcbiAgICogTXVsdGlwbHkgaGVscGVyIHRvIGJlIHVzZWQgaW4gYEFycmF5Lm1hcGAgZm9yIG11bHRpcGx5aW5nIGVhY2ggdmFsdWUgb2YgYW4gYXJyYXkgd2l0aCBhIGZhY3Rvci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGZhY3RvclxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgaW4gYEFycmF5Lm1hcGAgdG8gbXVsdGlwbHkgZWFjaCB2YWx1ZSBpbiBhbiBhcnJheVxuICAgKi9cbiAgQ2hhcnRpc3QubWFwTXVsdGlwbHkgPSBmdW5jdGlvbihmYWN0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtKSB7XG4gICAgICByZXR1cm4gbnVtICogZmFjdG9yO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBoZWxwZXIgdG8gYmUgdXNlZCBpbiBgQXJyYXkubWFwYCBmb3IgYWRkaW5nIGEgYWRkZW5kIHRvIGVhY2ggdmFsdWUgb2YgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBhZGRlbmRcbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIGluIGBBcnJheS5tYXBgIHRvIGFkZCBhIGFkZGVuZCB0byBlYWNoIHZhbHVlIGluIGFuIGFycmF5XG4gICAqL1xuICBDaGFydGlzdC5tYXBBZGQgPSBmdW5jdGlvbihhZGRlbmQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtKSB7XG4gICAgICByZXR1cm4gbnVtICsgYWRkZW5kO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcCBmb3IgbXVsdGkgZGltZW5zaW9uYWwgYXJyYXlzIHdoZXJlIHRoZWlyIG5lc3RlZCBhcnJheXMgd2lsbCBiZSBtYXBwZWQgaW4gc2VyaWFsLiBUaGUgb3V0cHV0IGFycmF5IHdpbGwgaGF2ZSB0aGUgbGVuZ3RoIG9mIHRoZSBsYXJnZXN0IG5lc3RlZCBhcnJheS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHZhcmlhYmxlIGFyZ3VtZW50cyB3aGVyZSBlYWNoIGFyZ3VtZW50IGlzIHRoZSBuZXN0ZWQgYXJyYXkgdmFsdWUgKG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbW9yZSB2YWx1ZXMpLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gYXJyXG4gICAqIEBwYXJhbSBjYlxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIENoYXJ0aXN0LnNlcmlhbE1hcCA9IGZ1bmN0aW9uKGFyciwgY2IpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgIGxlbmd0aCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGFyci5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBlLmxlbmd0aDtcbiAgICAgICAgfSkpO1xuXG4gICAgQ2hhcnRpc3QudGltZXMobGVuZ3RoKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGluZGV4KSB7XG4gICAgICB2YXIgYXJncyA9IGFyci5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gZVtpbmRleF07XG4gICAgICB9KTtcblxuICAgICAgcmVzdWx0W2luZGV4XSA9IGNiLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gcm91bmQgdmFsdWVzIHdpdGggY2VydGFpbiBwcmVjaXNpb24gbGV2ZWwgYWZ0ZXIgZGVjaW1hbC4gVGhpcyBpcyB1c2VkIHRvIHByZXZlbnQgcm91bmRpbmcgZXJyb3JzIG5lYXIgZmxvYXQgcG9pbnQgcHJlY2lzaW9uIGxpbWl0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHJvdW5kZWQgd2l0aCBwcmVjaXNpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtkaWdpdHNdIFRoZSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGRlY2ltYWwgdXNlZCB0byBkbyB0aGUgcm91bmRpbmdcbiAgICogQHJldHVybnMge251bWJlcn0gUm91bmRlZCB2YWx1ZVxuICAgKi9cbiAgQ2hhcnRpc3Qucm91bmRXaXRoUHJlY2lzaW9uID0gZnVuY3Rpb24odmFsdWUsIGRpZ2l0cykge1xuICAgIHZhciBwcmVjaXNpb24gPSBNYXRoLnBvdygxMCwgZGlnaXRzIHx8IENoYXJ0aXN0LnByZWNpc2lvbik7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiBwcmVjaXNpb24pIC8gcHJlY2lzaW9uO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcmVjaXNpb24gbGV2ZWwgdXNlZCBpbnRlcm5hbGx5IGluIENoYXJ0aXN0IGZvciByb3VuZGluZy4gSWYgeW91IHJlcXVpcmUgbW9yZSBkZWNpbWFsIHBsYWNlcyB5b3UgY2FuIGluY3JlYXNlIHRoaXMgbnVtYmVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKi9cbiAgQ2hhcnRpc3QucHJlY2lzaW9uID0gODtcblxuICAvKipcbiAgICogQSBtYXAgd2l0aCBjaGFyYWN0ZXJzIHRvIGVzY2FwZSBmb3Igc3RyaW5ncyB0byBiZSBzYWZlbHkgdXNlZCBhcyBhdHRyaWJ1dGUgdmFsdWVzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgQ2hhcnRpc3QuZXNjYXBpbmdNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgICdcXCcnOiAnJiMwMzk7J1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHNlcmlhbGl6ZXMgYXJiaXRyYXJ5IGRhdGEgdG8gYSBzdHJpbmcuIEluIGNhc2Ugb2YgZGF0YSB0aGF0IGNhbid0IGJlIGVhc2lseSBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcsIHRoaXMgZnVuY3Rpb24gd2lsbCBjcmVhdGUgYSB3cmFwcGVyIG9iamVjdCBhbmQgc2VyaWFsaXplIHRoZSBkYXRhIHVzaW5nIEpTT04uc3RyaW5naWZ5LiBUaGUgb3V0Y29taW5nIHN0cmluZyB3aWxsIGFsd2F5cyBiZSBlc2NhcGVkIHVzaW5nIENoYXJ0aXN0LmVzY2FwaW5nTWFwLlxuICAgKiBJZiBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCB0aGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gaW1tZWRpYXRlbHkgd2l0aCBudWxsIG9yIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfE9iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBDaGFydGlzdC5zZXJpYWxpemUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGF0YSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRhdGEgPSAnJytkYXRhO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7ZGF0YTogZGF0YX0pO1xuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhDaGFydGlzdC5lc2NhcGluZ01hcCkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgICByZXR1cm4gQ2hhcnRpc3QucmVwbGFjZUFsbChyZXN1bHQsIGtleSwgQ2hhcnRpc3QuZXNjYXBpbmdNYXBba2V5XSk7XG4gICAgfSwgZGF0YSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gZGUtc2VyaWFsaXplcyBhIHN0cmluZyBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgd2l0aCBDaGFydGlzdC5zZXJpYWxpemUuIFRoZSBzdHJpbmcgd2lsbCBhbHdheXMgYmUgdW5lc2NhcGVkIHVzaW5nIENoYXJ0aXN0LmVzY2FwaW5nTWFwIGJlZm9yZSBpdCdzIHJldHVybmVkLiBCYXNlZCBvbiB0aGUgaW5wdXQgdmFsdWUgdGhlIHJldHVybiB0eXBlIGNhbiBiZSBOdW1iZXIsIFN0cmluZyBvciBPYmplY3QuIEpTT04ucGFyc2UgaXMgdXNlZCB3aXRoIHRyeSAvIGNhdGNoIHRvIHNlZSBpZiB0aGUgdW5lc2NhcGVkIHN0cmluZyBjYW4gYmUgcGFyc2VkIGludG8gYW4gT2JqZWN0IGFuZCB0aGlzIE9iamVjdCB3aWxsIGJlIHJldHVybmVkIG9uIHN1Y2Nlc3MuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gICAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ8T2JqZWN0fVxuICAgKi9cbiAgQ2hhcnRpc3QuZGVzZXJpYWxpemUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBkYXRhID0gT2JqZWN0LmtleXMoQ2hhcnRpc3QuZXNjYXBpbmdNYXApLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgICAgcmV0dXJuIENoYXJ0aXN0LnJlcGxhY2VBbGwocmVzdWx0LCBDaGFydGlzdC5lc2NhcGluZ01hcFtrZXldLCBrZXkpO1xuICAgIH0sIGRhdGEpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgZGF0YSA9IGRhdGEuZGF0YSAhPT0gdW5kZWZpbmVkID8gZGF0YS5kYXRhIDogZGF0YTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIG9yIHJlaW5pdGlhbGl6ZSB0aGUgU1ZHIGVsZW1lbnQgZm9yIHRoZSBjaGFydFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lciBUaGUgY29udGFpbmluZyBET00gTm9kZSBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcGxhbnQgdGhlIFNWRyBlbGVtZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aCBTZXQgdGhlIHdpZHRoIG9mIHRoZSBTVkcgZWxlbWVudC4gRGVmYXVsdCBpcyAxMDAlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBoZWlnaHQgU2V0IHRoZSBoZWlnaHQgb2YgdGhlIFNWRyBlbGVtZW50LiBEZWZhdWx0IGlzIDEwMCVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBTcGVjaWZ5IGEgY2xhc3MgdG8gYmUgYWRkZWQgdG8gdGhlIFNWRyBlbGVtZW50XG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNyZWF0ZWQvcmVpbml0aWFsaXplZCBTVkcgZWxlbWVudFxuICAgKi9cbiAgQ2hhcnRpc3QuY3JlYXRlU3ZnID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgd2lkdGgsIGhlaWdodCwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHN2ZztcblxuICAgIHdpZHRoID0gd2lkdGggfHwgJzEwMCUnO1xuICAgIGhlaWdodCA9IGhlaWdodCB8fCAnMTAwJSc7XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHByZXZpb3VzIFNWRyBlbGVtZW50IGluIHRoZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgQ2hhcnRpc3QgWE1MIG5hbWVzcGFjZSBhbmQgcmVtb3ZlIGl0XG4gICAgLy8gU2luY2UgdGhlIERPTSBBUEkgZG9lcyBub3Qgc3VwcG9ydCBuYW1lc3BhY2VzIHdlIG5lZWQgdG8gbWFudWFsbHkgc2VhcmNoIHRoZSByZXR1cm5lZCBsaXN0IGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy1hcGkvXG4gICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ3N2ZycpKS5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQ2hhcnRpc3RTdmdPYmplY3RzKHN2Zykge1xuICAgICAgcmV0dXJuIHN2Zy5nZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy8nLCBDaGFydGlzdC54bWxOcy5wcmVmaXgpO1xuICAgIH0pLmZvckVhY2goZnVuY3Rpb24gcmVtb3ZlUHJldmlvdXNFbGVtZW50KHN2Zykge1xuICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHN2Zyk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgc3ZnIG9iamVjdCB3aXRoIHdpZHRoIGFuZCBoZWlnaHQgb3IgdXNlIDEwMCUgYXMgZGVmYXVsdFxuICAgIHN2ZyA9IG5ldyBDaGFydGlzdC5TdmcoJ3N2ZycpLmF0dHIoe1xuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9KS5hZGRDbGFzcyhjbGFzc05hbWUpLmF0dHIoe1xuICAgICAgc3R5bGU6ICd3aWR0aDogJyArIHdpZHRoICsgJzsgaGVpZ2h0OiAnICsgaGVpZ2h0ICsgJzsnXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdGhlIERPTSBub2RlIHRvIG91ciBjb250YWluZXJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc3ZnLl9ub2RlKTtcblxuICAgIHJldHVybiBzdmc7XG4gIH07XG5cblxuICAvKipcbiAgICogUmV2ZXJzZXMgdGhlIHNlcmllcywgbGFiZWxzIGFuZCBzZXJpZXMgZGF0YSBhcnJheXMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBkYXRhXG4gICAqL1xuICBDaGFydGlzdC5yZXZlcnNlRGF0YSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhLmxhYmVscy5yZXZlcnNlKCk7XG4gICAgZGF0YS5zZXJpZXMucmV2ZXJzZSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5zZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHR5cGVvZihkYXRhLnNlcmllc1tpXSkgPT09ICdvYmplY3QnICYmIGRhdGEuc2VyaWVzW2ldLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhLnNlcmllc1tpXS5kYXRhLnJldmVyc2UoKTtcbiAgICAgIH0gZWxzZSBpZihkYXRhLnNlcmllc1tpXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGRhdGEuc2VyaWVzW2ldLnJldmVyc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgZGF0YSBzZXJpZXMgaW50byBwbGFpbiBhcnJheVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgc2VyaWVzIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIHRvIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmV2ZXJzZSBJZiB0cnVlIHRoZSB3aG9sZSBkYXRhIGlzIHJldmVyc2VkIGJ5IHRoZSBnZXREYXRhQXJyYXkgY2FsbC4gVGhpcyB3aWxsIG1vZGlmeSB0aGUgZGF0YSBvYmplY3QgcGFzc2VkIGFzIGZpcnN0IHBhcmFtZXRlci4gVGhlIGxhYmVscyBhcyB3ZWxsIGFzIHRoZSBzZXJpZXMgb3JkZXIgaXMgcmV2ZXJzZWQuIFRoZSB3aG9sZSBzZXJpZXMgZGF0YSBhcnJheXMgYXJlIHJldmVyc2VkIHRvby5cbiAgICogQHBhcmFtIHtCb29sZWFufSBtdWx0aSBDcmVhdGUgYSBtdWx0aSBkaW1lbnNpb25hbCBhcnJheSBmcm9tIGEgc2VyaWVzIGRhdGEgYXJyYXkgd2hlcmUgYSB2YWx1ZSBvYmplY3Qgd2l0aCBgeGAgYW5kIGB5YCB2YWx1ZXMgd2lsbCBiZSBjcmVhdGVkLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gQSBwbGFpbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIHRvIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0XG4gICAqL1xuICBDaGFydGlzdC5nZXREYXRhQXJyYXkgPSBmdW5jdGlvbiAoZGF0YSwgcmV2ZXJzZSwgbXVsdGkpIHtcbiAgICAvLyBJZiB0aGUgZGF0YSBzaG91bGQgYmUgcmV2ZXJzZWQgYnV0IGlzbid0IHdlIG5lZWQgdG8gcmV2ZXJzZSBpdFxuICAgIC8vIElmIGl0J3MgcmV2ZXJzZWQgYnV0IGl0IHNob3VsZG4ndCB3ZSBuZWVkIHRvIHJldmVyc2UgaXQgYmFja1xuICAgIC8vIFRoYXQncyByZXF1aXJlZCB0byBoYW5kbGUgZGF0YSB1cGRhdGVzIGNvcnJlY3RseSBhbmQgdG8gcmVmbGVjdCB0aGUgcmVzcG9uc2l2ZSBjb25maWd1cmF0aW9uc1xuICAgIGlmKHJldmVyc2UgJiYgIWRhdGEucmV2ZXJzZWQgfHwgIXJldmVyc2UgJiYgZGF0YS5yZXZlcnNlZCkge1xuICAgICAgQ2hhcnRpc3QucmV2ZXJzZURhdGEoZGF0YSk7XG4gICAgICBkYXRhLnJldmVyc2VkID0gIWRhdGEucmV2ZXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gUmVjdXJzaXZlbHkgd2Fsa3MgdGhyb3VnaCBuZXN0ZWQgYXJyYXlzIGFuZCBjb252ZXJ0IHN0cmluZyB2YWx1ZXMgdG8gbnVtYmVycyBhbmQgb2JqZWN0cyB3aXRoIHZhbHVlIHByb3BlcnRpZXNcbiAgICAvLyB0byB2YWx1ZXMuIENoZWNrIHRoZSB0ZXN0cyBpbiBkYXRhIGNvcmUgLT4gZGF0YSBub3JtYWxpemF0aW9uIGZvciBhIGRldGFpbGVkIHNwZWNpZmljYXRpb24gb2YgZXhwZWN0ZWQgdmFsdWVzXG4gICAgZnVuY3Rpb24gcmVjdXJzaXZlQ29udmVydCh2YWx1ZSkge1xuICAgICAgaWYoQ2hhcnRpc3QuaXNGYWxzZXlCdXRaZXJvKHZhbHVlKSkge1xuICAgICAgICAvLyBUaGlzIGlzIGEgaG9sZSBpbiBkYXRhIGFuZCB3ZSBzaG91bGQgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmKCh2YWx1ZS5kYXRhIHx8IHZhbHVlKSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHJldHVybiAodmFsdWUuZGF0YSB8fCB2YWx1ZSkubWFwKHJlY3Vyc2l2ZUNvbnZlcnQpO1xuICAgICAgfSBlbHNlIGlmKHZhbHVlLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgICAgIHJldHVybiByZWN1cnNpdmVDb252ZXJ0KHZhbHVlLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKG11bHRpKSB7XG4gICAgICAgICAgdmFyIG11bHRpVmFsdWUgPSB7fTtcblxuICAgICAgICAgIC8vIFNpbmdsZSBzZXJpZXMgdmFsdWUgYXJyYXlzIGFyZSBhc3N1bWVkIHRvIHNwZWNpZnkgdGhlIFktQXhpcyB2YWx1ZVxuICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBbMSwgMl0gPT4gW3t4OiB1bmRlZmluZWQsIHk6IDF9LCB7eDogdW5kZWZpbmVkLCB5OiAyfV1cbiAgICAgICAgICAvLyBJZiBtdWx0aSBpcyBhIHN0cmluZyB0aGVuIGl0J3MgYXNzdW1lZCB0aGF0IGl0IHNwZWNpZmllZCB3aGljaCBkaW1lbnNpb24gc2hvdWxkIGJlIGZpbGxlZCBhcyBkZWZhdWx0XG4gICAgICAgICAgaWYodHlwZW9mIG11bHRpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbXVsdGlWYWx1ZVttdWx0aV0gPSBDaGFydGlzdC5nZXROdW1iZXJPclVuZGVmaW5lZCh2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG11bHRpVmFsdWUueSA9IENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkKHZhbHVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtdWx0aVZhbHVlLnggPSB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgneCcpID8gQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQodmFsdWUueCkgOiBtdWx0aVZhbHVlLng7XG4gICAgICAgICAgbXVsdGlWYWx1ZS55ID0gdmFsdWUuaGFzT3duUHJvcGVydHkoJ3knKSA/IENoYXJ0aXN0LmdldE51bWJlck9yVW5kZWZpbmVkKHZhbHVlLnkpIDogbXVsdGlWYWx1ZS55O1xuXG4gICAgICAgICAgcmV0dXJuIG11bHRpVmFsdWU7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEuc2VyaWVzLm1hcChyZWN1cnNpdmVDb252ZXJ0KTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBudW1iZXIgaW50byBhIHBhZGRpbmcgb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdHxOdW1iZXJ9IHBhZGRpbmdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtmYWxsYmFja10gVGhpcyB2YWx1ZSBpcyB1c2VkIHRvIGZpbGwgbWlzc2luZyB2YWx1ZXMgaWYgYSBpbmNvbXBsZXRlIHBhZGRpbmcgb2JqZWN0IHdhcyBwYXNzZWRcbiAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhIHBhZGRpbmcgb2JqZWN0IGNvbnRhaW5pbmcgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IHByb3BlcnRpZXMgZmlsbGVkIHdpdGggdGhlIHBhZGRpbmcgbnVtYmVyIHBhc3NlZCBpbiBhcyBhcmd1bWVudC4gSWYgdGhlIGFyZ3VtZW50IGlzIHNvbWV0aGluZyBlbHNlIHRoYW4gYSBudW1iZXIgKHByZXN1bWFibHkgYWxyZWFkeSBhIGNvcnJlY3QgcGFkZGluZyBvYmplY3QpIHRoZW4gdGhpcyBhcmd1bWVudCBpcyBkaXJlY3RseSByZXR1cm5lZC5cbiAgICovXG4gIENoYXJ0aXN0Lm5vcm1hbGl6ZVBhZGRpbmcgPSBmdW5jdGlvbihwYWRkaW5nLCBmYWxsYmFjaykge1xuICAgIGZhbGxiYWNrID0gZmFsbGJhY2sgfHwgMDtcblxuICAgIHJldHVybiB0eXBlb2YgcGFkZGluZyA9PT0gJ251bWJlcicgPyB7XG4gICAgICB0b3A6IHBhZGRpbmcsXG4gICAgICByaWdodDogcGFkZGluZyxcbiAgICAgIGJvdHRvbTogcGFkZGluZyxcbiAgICAgIGxlZnQ6IHBhZGRpbmdcbiAgICB9IDoge1xuICAgICAgdG9wOiB0eXBlb2YgcGFkZGluZy50b3AgPT09ICdudW1iZXInID8gcGFkZGluZy50b3AgOiBmYWxsYmFjayxcbiAgICAgIHJpZ2h0OiB0eXBlb2YgcGFkZGluZy5yaWdodCA9PT0gJ251bWJlcicgPyBwYWRkaW5nLnJpZ2h0IDogZmFsbGJhY2ssXG4gICAgICBib3R0b206IHR5cGVvZiBwYWRkaW5nLmJvdHRvbSA9PT0gJ251bWJlcicgPyBwYWRkaW5nLmJvdHRvbSA6IGZhbGxiYWNrLFxuICAgICAgbGVmdDogdHlwZW9mIHBhZGRpbmcubGVmdCA9PT0gJ251bWJlcicgPyBwYWRkaW5nLmxlZnQgOiBmYWxsYmFja1xuICAgIH07XG4gIH07XG5cbiAgQ2hhcnRpc3QuZ2V0TWV0YURhdGEgPSBmdW5jdGlvbihzZXJpZXMsIGluZGV4KSB7XG4gICAgdmFyIHZhbHVlID0gc2VyaWVzLmRhdGEgPyBzZXJpZXMuZGF0YVtpbmRleF0gOiBzZXJpZXNbaW5kZXhdO1xuICAgIHJldHVybiB2YWx1ZSA/IENoYXJ0aXN0LnNlcmlhbGl6ZSh2YWx1ZS5tZXRhKSA6IHVuZGVmaW5lZDtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSBvcmRlciBvZiBtYWduaXR1ZGUgZm9yIHRoZSBjaGFydCBzY2FsZVxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgVGhlIHZhbHVlIFJhbmdlIG9mIHRoZSBjaGFydFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBvcmRlciBvZiBtYWduaXR1ZGVcbiAgICovXG4gIENoYXJ0aXN0Lm9yZGVyT2ZNYWduaXR1ZGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmxvZyhNYXRoLmFicyh2YWx1ZSkpIC8gTWF0aC5MTjEwKTtcbiAgfTtcblxuICAvKipcbiAgICogUHJvamVjdCBhIGRhdGEgbGVuZ3RoIGludG8gc2NyZWVuIGNvb3JkaW5hdGVzIChwaXhlbHMpXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBheGlzTGVuZ3RoIFRoZSBzdmcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggU2luZ2xlIGRhdGEgdmFsdWUgZnJvbSBhIHNlcmllcyBhcnJheVxuICAgKiBAcGFyYW0ge09iamVjdH0gYm91bmRzIEFsbCB0aGUgdmFsdWVzIHRvIHNldCB0aGUgYm91bmRzIG9mIHRoZSBjaGFydFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBwcm9qZWN0ZWQgZGF0YSBsZW5ndGggaW4gcGl4ZWxzXG4gICAqL1xuICBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoID0gZnVuY3Rpb24gKGF4aXNMZW5ndGgsIGxlbmd0aCwgYm91bmRzKSB7XG4gICAgcmV0dXJuIGxlbmd0aCAvIGJvdW5kcy5yYW5nZSAqIGF4aXNMZW5ndGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaGVpZ2h0IG9mIHRoZSBhcmVhIGluIHRoZSBjaGFydCBmb3IgdGhlIGRhdGEgc2VyaWVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdmcgVGhlIHN2ZyBlbGVtZW50IGZvciB0aGUgY2hhcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIE9iamVjdCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgb3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgY2hhcnRcbiAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgaGVpZ2h0IG9mIHRoZSBhcmVhIGluIHRoZSBjaGFydCBmb3IgdGhlIGRhdGEgc2VyaWVzXG4gICAqL1xuICBDaGFydGlzdC5nZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbiAoc3ZnLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KChDaGFydGlzdC5xdWFudGl0eShvcHRpb25zLmhlaWdodCkudmFsdWUgfHwgc3ZnLmhlaWdodCgpKSAtIChvcHRpb25zLmNoYXJ0UGFkZGluZy50b3AgKyAgb3B0aW9ucy5jaGFydFBhZGRpbmcuYm90dG9tKSAtIG9wdGlvbnMuYXhpc1gub2Zmc2V0LCAwKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IGhpZ2hlc3QgYW5kIGxvd2VzdCB2YWx1ZSBvZiBkYXRhIGFycmF5LiBUaGlzIEFycmF5IGNvbnRhaW5zIHRoZSBkYXRhIHRoYXQgd2lsbCBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHtBcnJheX0gZGF0YSBUaGUgYXJyYXkgdGhhdCBjb250YWlucyB0aGUgZGF0YSB0byBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGNoYXJ0IG9wdGlvbnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRpbWVuc2lvbiBBeGlzIGRpbWVuc2lvbiAneCcgb3IgJ3knIHVzZWQgdG8gYWNjZXNzIHRoZSBjb3JyZWN0IHZhbHVlIGFuZCBoaWdoIC8gbG93IGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IHZhbHVlIHRoYXQgd2lsbCBiZSB2aXN1YWxpemVkIG9uIHRoZSBjaGFydC5cbiAgICovXG4gIENoYXJ0aXN0LmdldEhpZ2hMb3cgPSBmdW5jdGlvbiAoZGF0YSwgb3B0aW9ucywgZGltZW5zaW9uKSB7XG4gICAgLy8gVE9ETzogUmVtb3ZlIHdvcmthcm91bmQgZm9yIGRlcHJlY2F0ZWQgZ2xvYmFsIGhpZ2ggLyBsb3cgY29uZmlnLiBBeGlzIGhpZ2ggLyBsb3cgY29uZmlndXJhdGlvbiBpcyBwcmVmZXJyZWRcbiAgICBvcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLCBkaW1lbnNpb24gPyBvcHRpb25zWydheGlzJyArIGRpbWVuc2lvbi50b1VwcGVyQ2FzZSgpXSA6IHt9KTtcblxuICAgIHZhciBoaWdoTG93ID0ge1xuICAgICAgICBoaWdoOiBvcHRpb25zLmhpZ2ggPT09IHVuZGVmaW5lZCA/IC1OdW1iZXIuTUFYX1ZBTFVFIDogK29wdGlvbnMuaGlnaCxcbiAgICAgICAgbG93OiBvcHRpb25zLmxvdyA9PT0gdW5kZWZpbmVkID8gTnVtYmVyLk1BWF9WQUxVRSA6ICtvcHRpb25zLmxvd1xuICAgICAgfTtcbiAgICB2YXIgZmluZEhpZ2ggPSBvcHRpb25zLmhpZ2ggPT09IHVuZGVmaW5lZDtcbiAgICB2YXIgZmluZExvdyA9IG9wdGlvbnMubG93ID09PSB1bmRlZmluZWQ7XG5cbiAgICAvLyBGdW5jdGlvbiB0byByZWN1cnNpdmVseSB3YWxrIHRocm91Z2ggYXJyYXlzIGFuZCBmaW5kIGhpZ2hlc3QgYW5kIGxvd2VzdCBudW1iZXJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVIaWdoTG93KGRhdGEpIHtcbiAgICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZWN1cnNpdmVIaWdoTG93KGRhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWUgPSBkaW1lbnNpb24gPyArZGF0YVtkaW1lbnNpb25dIDogK2RhdGE7XG5cbiAgICAgICAgaWYgKGZpbmRIaWdoICYmIHZhbHVlID4gaGlnaExvdy5oaWdoKSB7XG4gICAgICAgICAgaGlnaExvdy5oaWdoID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmluZExvdyAmJiB2YWx1ZSA8IGhpZ2hMb3cubG93KSB7XG4gICAgICAgICAgaGlnaExvdy5sb3cgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0YXJ0IHRvIGZpbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG51bWJlciByZWN1cnNpdmVseVxuICAgIGlmKGZpbmRIaWdoIHx8IGZpbmRMb3cpIHtcbiAgICAgIHJlY3Vyc2l2ZUhpZ2hMb3coZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gT3ZlcnJpZGVzIG9mIGhpZ2ggLyBsb3cgYmFzZWQgb24gcmVmZXJlbmNlIHZhbHVlLCBpdCB3aWxsIG1ha2Ugc3VyZSB0aGF0IHRoZSBpbnZpc2libGUgcmVmZXJlbmNlIHZhbHVlIGlzXG4gICAgLy8gdXNlZCB0byBnZW5lcmF0ZSB0aGUgY2hhcnQuIFRoaXMgaXMgdXNlZnVsIHdoZW4gdGhlIGNoYXJ0IGFsd2F5cyBuZWVkcyB0byBjb250YWluIHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAgICAvLyBpbnZpc2libGUgcmVmZXJlbmNlIHZhbHVlIGluIHRoZSB2aWV3IGkuZS4gZm9yIGJpcG9sYXIgc2NhbGVzLlxuICAgIGlmIChvcHRpb25zLnJlZmVyZW5jZVZhbHVlIHx8IG9wdGlvbnMucmVmZXJlbmNlVmFsdWUgPT09IDApIHtcbiAgICAgIGhpZ2hMb3cuaGlnaCA9IE1hdGgubWF4KG9wdGlvbnMucmVmZXJlbmNlVmFsdWUsIGhpZ2hMb3cuaGlnaCk7XG4gICAgICBoaWdoTG93LmxvdyA9IE1hdGgubWluKG9wdGlvbnMucmVmZXJlbmNlVmFsdWUsIGhpZ2hMb3cubG93KTtcbiAgICB9XG5cbiAgICAvLyBJZiBoaWdoIGFuZCBsb3cgYXJlIHRoZSBzYW1lIGJlY2F1c2Ugb2YgbWlzY29uZmlndXJhdGlvbiBvciBmbGF0IGRhdGEgKG9ubHkgdGhlIHNhbWUgdmFsdWUpIHdlIG5lZWRcbiAgICAvLyB0byBzZXQgdGhlIGhpZ2ggb3IgbG93IHRvIDAgZGVwZW5kaW5nIG9uIHRoZSBwb2xhcml0eVxuICAgIGlmIChoaWdoTG93LmhpZ2ggPD0gaGlnaExvdy5sb3cpIHtcbiAgICAgIC8vIElmIGJvdGggdmFsdWVzIGFyZSAwIHdlIHNldCBoaWdoIHRvIDFcbiAgICAgIGlmIChoaWdoTG93LmxvdyA9PT0gMCkge1xuICAgICAgICBoaWdoTG93LmhpZ2ggPSAxO1xuICAgICAgfSBlbHNlIGlmIChoaWdoTG93LmxvdyA8IDApIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSB0aGUgc2FtZSBuZWdhdGl2ZSB2YWx1ZSBmb3IgdGhlIGJvdW5kcyB3ZSBzZXQgYm91bmRzLmhpZ2ggdG8gMFxuICAgICAgICBoaWdoTG93LmhpZ2ggPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSB0aGUgc2FtZSBwb3NpdGl2ZSB2YWx1ZSBmb3IgdGhlIGJvdW5kcyB3ZSBzZXQgYm91bmRzLmxvdyB0byAwXG4gICAgICAgIGhpZ2hMb3cubG93ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaGlnaExvdztcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSB2YWx1ZSBpcyBhIHZhbGlkIG51bWJlciBvciBzdHJpbmcgd2l0aCBhIG51bWJlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgQ2hhcnRpc3QuaXNOdW0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiAhaXNOYU4odmFsdWUpICYmIGlzRmluaXRlKHZhbHVlKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIG9uIGFsbCBmYWxzZXkgdmFsdWVzIGV4Y2VwdCB0aGUgbnVtZXJpYyB2YWx1ZSAwLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBDaGFydGlzdC5pc0ZhbHNleUJ1dFplcm8gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiAhdmFsdWUgJiYgdmFsdWUgIT09IDA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBudW1iZXIgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgYSB2YWxpZCBudW1iZXIgb3IgdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHVuZGVmaW5lZC4gT24gYWxsIG90aGVyIHZhbHVlcyB0aGFuIGEgdmFsaWQgbnVtYmVyLCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0TnVtYmVyT3JVbmRlZmluZWQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBpc05hTigrdmFsdWUpID8gdW5kZWZpbmVkIDogK3ZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgdmFsdWUgZnJvbSBhIGRpbWVuc2lvbiBgdmFsdWUueGAgb3IgYHZhbHVlLnlgIHdoaWxlIHJldHVybmluZyB2YWx1ZSBkaXJlY3RseSBpZiBpdCdzIGEgdmFsaWQgbnVtZXJpYyB2YWx1ZS4gSWYgdGhlIHZhbHVlIGlzIG5vdCBudW1lcmljIGFuZCBpdCdzIGZhbHNleSB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBkaW1lbnNpb25cbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBDaGFydGlzdC5nZXRNdWx0aVZhbHVlID0gZnVuY3Rpb24odmFsdWUsIGRpbWVuc2lvbikge1xuICAgIGlmKENoYXJ0aXN0LmlzTnVtKHZhbHVlKSkge1xuICAgICAgcmV0dXJuICt2YWx1ZTtcbiAgICB9IGVsc2UgaWYodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZVtkaW1lbnNpb24gfHwgJ3knXSB8fCAwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvbGxhcmQgUmhvIEFsZ29yaXRobSB0byBmaW5kIHNtYWxsZXN0IGZhY3RvciBvZiBhbiBpbnRlZ2VyIHZhbHVlLiBUaGVyZSBhcmUgbW9yZSBlZmZpY2llbnQgYWxnb3JpdGhtcyBmb3IgZmFjdG9yaXphdGlvbiwgYnV0IHRoaXMgb25lIGlzIHF1aXRlIGVmZmljaWVudCBhbmQgbm90IHNvIGNvbXBsZXguXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBudW0gQW4gaW50ZWdlciBudW1iZXIgd2hlcmUgdGhlIHNtYWxsZXN0IGZhY3RvciBzaG91bGQgYmUgc2VhcmNoZWQgZm9yXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBzbWFsbGVzdCBpbnRlZ2VyIGZhY3RvciBvZiB0aGUgcGFyYW1ldGVyIG51bS5cbiAgICovXG4gIENoYXJ0aXN0LnJobyA9IGZ1bmN0aW9uKG51bSkge1xuICAgIGlmKG51bSA9PT0gMSkge1xuICAgICAgcmV0dXJuIG51bTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnY2QocCwgcSkge1xuICAgICAgaWYgKHAgJSBxID09PSAwKSB7XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGdjZChxLCBwICUgcSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZih4KSB7XG4gICAgICByZXR1cm4geCAqIHggKyAxO1xuICAgIH1cblxuICAgIHZhciB4MSA9IDIsIHgyID0gMiwgZGl2aXNvcjtcbiAgICBpZiAobnVtICUgMiA9PT0gMCkge1xuICAgICAgcmV0dXJuIDI7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgeDEgPSBmKHgxKSAlIG51bTtcbiAgICAgIHgyID0gZihmKHgyKSkgJSBudW07XG4gICAgICBkaXZpc29yID0gZ2NkKE1hdGguYWJzKHgxIC0geDIpLCBudW0pO1xuICAgIH0gd2hpbGUgKGRpdmlzb3IgPT09IDEpO1xuXG4gICAgcmV0dXJuIGRpdmlzb3I7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBhbmQgcmV0cmlldmUgYWxsIHRoZSBib3VuZHMgZm9yIHRoZSBjaGFydCBhbmQgcmV0dXJuIHRoZW0gaW4gb25lIGFycmF5XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBheGlzTGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIEF4aXMgdXNlZCBmb3JcbiAgICogQHBhcmFtIHtPYmplY3R9IGhpZ2hMb3cgQW4gb2JqZWN0IGNvbnRhaW5pbmcgYSBoaWdoIGFuZCBsb3cgcHJvcGVydHkgaW5kaWNhdGluZyB0aGUgdmFsdWUgcmFuZ2Ugb2YgdGhlIGNoYXJ0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGVNaW5TcGFjZSBUaGUgbWluaW11bSBwcm9qZWN0ZWQgbGVuZ3RoIGEgc3RlcCBzaG91bGQgcmVzdWx0IGluXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb25seUludGVnZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBBbGwgdGhlIHZhbHVlcyB0byBzZXQgdGhlIGJvdW5kcyBvZiB0aGUgY2hhcnRcbiAgICovXG4gIENoYXJ0aXN0LmdldEJvdW5kcyA9IGZ1bmN0aW9uIChheGlzTGVuZ3RoLCBoaWdoTG93LCBzY2FsZU1pblNwYWNlLCBvbmx5SW50ZWdlcikge1xuICAgIHZhciBpLFxuICAgICAgb3B0aW1pemF0aW9uQ291bnRlciA9IDAsXG4gICAgICBuZXdNaW4sXG4gICAgICBuZXdNYXgsXG4gICAgICBib3VuZHMgPSB7XG4gICAgICAgIGhpZ2g6IGhpZ2hMb3cuaGlnaCxcbiAgICAgICAgbG93OiBoaWdoTG93Lmxvd1xuICAgICAgfTtcblxuICAgIGJvdW5kcy52YWx1ZVJhbmdlID0gYm91bmRzLmhpZ2ggLSBib3VuZHMubG93O1xuICAgIGJvdW5kcy5vb20gPSBDaGFydGlzdC5vcmRlck9mTWFnbml0dWRlKGJvdW5kcy52YWx1ZVJhbmdlKTtcbiAgICBib3VuZHMuc3RlcCA9IE1hdGgucG93KDEwLCBib3VuZHMub29tKTtcbiAgICBib3VuZHMubWluID0gTWF0aC5mbG9vcihib3VuZHMubG93IC8gYm91bmRzLnN0ZXApICogYm91bmRzLnN0ZXA7XG4gICAgYm91bmRzLm1heCA9IE1hdGguY2VpbChib3VuZHMuaGlnaCAvIGJvdW5kcy5zdGVwKSAqIGJvdW5kcy5zdGVwO1xuICAgIGJvdW5kcy5yYW5nZSA9IGJvdW5kcy5tYXggLSBib3VuZHMubWluO1xuICAgIGJvdW5kcy5udW1iZXJPZlN0ZXBzID0gTWF0aC5yb3VuZChib3VuZHMucmFuZ2UgLyBib3VuZHMuc3RlcCk7XG5cbiAgICAvLyBPcHRpbWl6ZSBzY2FsZSBzdGVwIGJ5IGNoZWNraW5nIGlmIHN1YmRpdmlzaW9uIGlzIHBvc3NpYmxlIGJhc2VkIG9uIGhvcml6b250YWxHcmlkTWluU3BhY2VcbiAgICAvLyBJZiB3ZSBhcmUgYWxyZWFkeSBiZWxvdyB0aGUgc2NhbGVNaW5TcGFjZSB2YWx1ZSB3ZSB3aWxsIHNjYWxlIHVwXG4gICAgdmFyIGxlbmd0aCA9IENoYXJ0aXN0LnByb2plY3RMZW5ndGgoYXhpc0xlbmd0aCwgYm91bmRzLnN0ZXAsIGJvdW5kcyk7XG4gICAgdmFyIHNjYWxlVXAgPSBsZW5ndGggPCBzY2FsZU1pblNwYWNlO1xuICAgIHZhciBzbWFsbGVzdEZhY3RvciA9IG9ubHlJbnRlZ2VyID8gQ2hhcnRpc3QucmhvKGJvdW5kcy5yYW5nZSkgOiAwO1xuXG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgd2Ugc2hvdWxkIG9ubHkgdXNlIGludGVnZXIgc3RlcHMgYW5kIGlmIHN0ZXAgMSBpcyBzdGlsbCBsYXJnZXIgdGhhbiBzY2FsZU1pblNwYWNlIHNvIHdlIGNhbiB1c2UgMVxuICAgIGlmKG9ubHlJbnRlZ2VyICYmIENoYXJ0aXN0LnByb2plY3RMZW5ndGgoYXhpc0xlbmd0aCwgMSwgYm91bmRzKSA+PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICBib3VuZHMuc3RlcCA9IDE7XG4gICAgfSBlbHNlIGlmKG9ubHlJbnRlZ2VyICYmIHNtYWxsZXN0RmFjdG9yIDwgYm91bmRzLnN0ZXAgJiYgQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCBzbWFsbGVzdEZhY3RvciwgYm91bmRzKSA+PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICAvLyBJZiBzdGVwIDEgd2FzIHRvbyBzbWFsbCwgd2UgY2FuIHRyeSB0aGUgc21hbGxlc3QgZmFjdG9yIG9mIHJhbmdlXG4gICAgICAvLyBJZiB0aGUgc21hbGxlc3QgZmFjdG9yIGlzIHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBib3VuZHMuc3RlcCBhbmQgdGhlIHByb2plY3RlZCBsZW5ndGggb2Ygc21hbGxlc3QgZmFjdG9yXG4gICAgICAvLyBpcyBsYXJnZXIgdGhhbiB0aGUgc2NhbGVNaW5TcGFjZSB3ZSBzaG91bGQgZ28gZm9yIGl0LlxuICAgICAgYm91bmRzLnN0ZXAgPSBzbWFsbGVzdEZhY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVHJ5aW5nIHRvIGRpdmlkZSBvciBtdWx0aXBseSBieSAyIGFuZCBmaW5kIHRoZSBiZXN0IHN0ZXAgdmFsdWVcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmIChzY2FsZVVwICYmIENoYXJ0aXN0LnByb2plY3RMZW5ndGgoYXhpc0xlbmd0aCwgYm91bmRzLnN0ZXAsIGJvdW5kcykgPD0gc2NhbGVNaW5TcGFjZSkge1xuICAgICAgICAgIGJvdW5kcy5zdGVwICo9IDI7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNjYWxlVXAgJiYgQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCBib3VuZHMuc3RlcCAvIDIsIGJvdW5kcykgPj0gc2NhbGVNaW5TcGFjZSkge1xuICAgICAgICAgIGJvdW5kcy5zdGVwIC89IDI7XG4gICAgICAgICAgaWYob25seUludGVnZXIgJiYgYm91bmRzLnN0ZXAgJSAxICE9PSAwKSB7XG4gICAgICAgICAgICBib3VuZHMuc3RlcCAqPSAyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYob3B0aW1pemF0aW9uQ291bnRlcisrID4gMTAwMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhjZWVkZWQgbWF4aW11bSBudW1iZXIgb2YgaXRlcmF0aW9ucyB3aGlsZSBvcHRpbWl6aW5nIHNjYWxlIHN0ZXAhJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOYXJyb3cgbWluIGFuZCBtYXggYmFzZWQgb24gbmV3IHN0ZXBcbiAgICBuZXdNaW4gPSBib3VuZHMubWluO1xuICAgIG5ld01heCA9IGJvdW5kcy5tYXg7XG4gICAgd2hpbGUobmV3TWluICsgYm91bmRzLnN0ZXAgPD0gYm91bmRzLmxvdykge1xuICAgICAgbmV3TWluICs9IGJvdW5kcy5zdGVwO1xuICAgIH1cbiAgICB3aGlsZShuZXdNYXggLSBib3VuZHMuc3RlcCA+PSBib3VuZHMuaGlnaCkge1xuICAgICAgbmV3TWF4IC09IGJvdW5kcy5zdGVwO1xuICAgIH1cbiAgICBib3VuZHMubWluID0gbmV3TWluO1xuICAgIGJvdW5kcy5tYXggPSBuZXdNYXg7XG4gICAgYm91bmRzLnJhbmdlID0gYm91bmRzLm1heCAtIGJvdW5kcy5taW47XG5cbiAgICBib3VuZHMudmFsdWVzID0gW107XG4gICAgZm9yIChpID0gYm91bmRzLm1pbjsgaSA8PSBib3VuZHMubWF4OyBpICs9IGJvdW5kcy5zdGVwKSB7XG4gICAgICBib3VuZHMudmFsdWVzLnB1c2goQ2hhcnRpc3Qucm91bmRXaXRoUHJlY2lzaW9uKGkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYm91bmRzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgY2FydGVzaWFuIGNvb3JkaW5hdGVzIG9mIHBvbGFyIGNvb3JkaW5hdGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBjZW50ZXJYIFgtYXhpcyBjb29yZGluYXRlcyBvZiBjZW50ZXIgcG9pbnQgb2YgY2lyY2xlIHNlZ21lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNlbnRlclkgWC1heGlzIGNvb3JkaW5hdGVzIG9mIGNlbnRlciBwb2ludCBvZiBjaXJjbGUgc2VnbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiBjaXJjbGUgc2VnbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gYW5nbGVJbkRlZ3JlZXMgQW5nbGUgb2YgY2lyY2xlIHNlZ21lbnQgaW4gZGVncmVlc1xuICAgKiBAcmV0dXJuIHt7eDpOdW1iZXIsIHk6TnVtYmVyfX0gQ29vcmRpbmF0ZXMgb2YgcG9pbnQgb24gY2lyY3VtZmVyZW5jZVxuICAgKi9cbiAgQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbiA9IGZ1bmN0aW9uIChjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIGFuZ2xlSW5EZWdyZWVzKSB7XG4gICAgdmFyIGFuZ2xlSW5SYWRpYW5zID0gKGFuZ2xlSW5EZWdyZWVzIC0gOTApICogTWF0aC5QSSAvIDE4MC4wO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IGNlbnRlclggKyAocmFkaXVzICogTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpKSxcbiAgICAgIHk6IGNlbnRlclkgKyAocmFkaXVzICogTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpKVxuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgY2hhcnQgZHJhd2luZyByZWN0YW5nbGUgKGFyZWEgd2hlcmUgY2hhcnQgaXMgZHJhd24pIHgxLHkxID0gYm90dG9tIGxlZnQgLyB4Mix5MiA9IHRvcCByaWdodFxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gc3ZnIFRoZSBzdmcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBPYmplY3QgdGhhdCBjb250YWlucyBhbGwgdGhlIG9wdGlvbmFsIHZhbHVlcyBmb3IgdGhlIGNoYXJ0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbZmFsbGJhY2tQYWRkaW5nXSBUaGUgZmFsbGJhY2sgcGFkZGluZyBpZiBwYXJ0aWFsIHBhZGRpbmcgb2JqZWN0cyBhcmUgdXNlZFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjaGFydCByZWN0YW5nbGVzIGNvb3JkaW5hdGVzIGluc2lkZSB0aGUgc3ZnIGVsZW1lbnQgcGx1cyB0aGUgcmVjdGFuZ2xlcyBtZWFzdXJlbWVudHNcbiAgICovXG4gIENoYXJ0aXN0LmNyZWF0ZUNoYXJ0UmVjdCA9IGZ1bmN0aW9uIChzdmcsIG9wdGlvbnMsIGZhbGxiYWNrUGFkZGluZykge1xuICAgIHZhciBoYXNBeGlzID0gISEob3B0aW9ucy5heGlzWCB8fCBvcHRpb25zLmF4aXNZKTtcbiAgICB2YXIgeUF4aXNPZmZzZXQgPSBoYXNBeGlzID8gb3B0aW9ucy5heGlzWS5vZmZzZXQgOiAwO1xuICAgIHZhciB4QXhpc09mZnNldCA9IGhhc0F4aXMgPyBvcHRpb25zLmF4aXNYLm9mZnNldCA6IDA7XG4gICAgLy8gSWYgd2lkdGggb3IgaGVpZ2h0IHJlc3VsdHMgaW4gaW52YWxpZCB2YWx1ZSAoaW5jbHVkaW5nIDApIHdlIGZhbGxiYWNrIHRvIHRoZSB1bml0bGVzcyBzZXR0aW5ncyBvciBldmVuIDBcbiAgICB2YXIgd2lkdGggPSBzdmcud2lkdGgoKSB8fCBDaGFydGlzdC5xdWFudGl0eShvcHRpb25zLndpZHRoKS52YWx1ZSB8fCAwO1xuICAgIHZhciBoZWlnaHQgPSBzdmcuaGVpZ2h0KCkgfHwgQ2hhcnRpc3QucXVhbnRpdHkob3B0aW9ucy5oZWlnaHQpLnZhbHVlIHx8IDA7XG4gICAgdmFyIG5vcm1hbGl6ZWRQYWRkaW5nID0gQ2hhcnRpc3Qubm9ybWFsaXplUGFkZGluZyhvcHRpb25zLmNoYXJ0UGFkZGluZywgZmFsbGJhY2tQYWRkaW5nKTtcblxuICAgIC8vIElmIHNldHRpbmdzIHdlcmUgdG8gc21hbGwgdG8gY29wZSB3aXRoIG9mZnNldCAobGVnYWN5KSBhbmQgcGFkZGluZywgd2UnbGwgYWRqdXN0XG4gICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgeUF4aXNPZmZzZXQgKyBub3JtYWxpemVkUGFkZGluZy5sZWZ0ICsgbm9ybWFsaXplZFBhZGRpbmcucmlnaHQpO1xuICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgeEF4aXNPZmZzZXQgKyBub3JtYWxpemVkUGFkZGluZy50b3AgKyBub3JtYWxpemVkUGFkZGluZy5ib3R0b20pO1xuXG4gICAgdmFyIGNoYXJ0UmVjdCA9IHtcbiAgICAgIHBhZGRpbmc6IG5vcm1hbGl6ZWRQYWRkaW5nLFxuICAgICAgd2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDIgLSB0aGlzLngxO1xuICAgICAgfSxcbiAgICAgIGhlaWdodDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy55MSAtIHRoaXMueTI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmKGhhc0F4aXMpIHtcbiAgICAgIGlmIChvcHRpb25zLmF4aXNYLnBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgIGNoYXJ0UmVjdC55MiA9IG5vcm1hbGl6ZWRQYWRkaW5nLnRvcCArIHhBeGlzT2Zmc2V0O1xuICAgICAgICBjaGFydFJlY3QueTEgPSBNYXRoLm1heChoZWlnaHQgLSBub3JtYWxpemVkUGFkZGluZy5ib3R0b20sIGNoYXJ0UmVjdC55MiArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhcnRSZWN0LnkyID0gbm9ybWFsaXplZFBhZGRpbmcudG9wO1xuICAgICAgICBjaGFydFJlY3QueTEgPSBNYXRoLm1heChoZWlnaHQgLSBub3JtYWxpemVkUGFkZGluZy5ib3R0b20gLSB4QXhpc09mZnNldCwgY2hhcnRSZWN0LnkyICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmF4aXNZLnBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgIGNoYXJ0UmVjdC54MSA9IG5vcm1hbGl6ZWRQYWRkaW5nLmxlZnQgKyB5QXhpc09mZnNldDtcbiAgICAgICAgY2hhcnRSZWN0LngyID0gTWF0aC5tYXgod2lkdGggLSBub3JtYWxpemVkUGFkZGluZy5yaWdodCwgY2hhcnRSZWN0LngxICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFydFJlY3QueDEgPSBub3JtYWxpemVkUGFkZGluZy5sZWZ0O1xuICAgICAgICBjaGFydFJlY3QueDIgPSBNYXRoLm1heCh3aWR0aCAtIG5vcm1hbGl6ZWRQYWRkaW5nLnJpZ2h0IC0geUF4aXNPZmZzZXQsIGNoYXJ0UmVjdC54MSArIDEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGFydFJlY3QueDEgPSBub3JtYWxpemVkUGFkZGluZy5sZWZ0O1xuICAgICAgY2hhcnRSZWN0LngyID0gTWF0aC5tYXgod2lkdGggLSBub3JtYWxpemVkUGFkZGluZy5yaWdodCwgY2hhcnRSZWN0LngxICsgMSk7XG4gICAgICBjaGFydFJlY3QueTIgPSBub3JtYWxpemVkUGFkZGluZy50b3A7XG4gICAgICBjaGFydFJlY3QueTEgPSBNYXRoLm1heChoZWlnaHQgLSBub3JtYWxpemVkUGFkZGluZy5ib3R0b20sIGNoYXJ0UmVjdC55MiArIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFydFJlY3Q7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBncmlkIGxpbmUgYmFzZWQgb24gYSBwcm9qZWN0ZWQgdmFsdWUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBwb3NpdGlvblxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGF4aXNcbiAgICogQHBhcmFtIG9mZnNldFxuICAgKiBAcGFyYW0gbGVuZ3RoXG4gICAqIEBwYXJhbSBncm91cFxuICAgKiBAcGFyYW0gY2xhc3Nlc1xuICAgKiBAcGFyYW0gZXZlbnRFbWl0dGVyXG4gICAqL1xuICBDaGFydGlzdC5jcmVhdGVHcmlkID0gZnVuY3Rpb24ocG9zaXRpb24sIGluZGV4LCBheGlzLCBvZmZzZXQsIGxlbmd0aCwgZ3JvdXAsIGNsYXNzZXMsIGV2ZW50RW1pdHRlcikge1xuICAgIHZhciBwb3NpdGlvbmFsRGF0YSA9IHt9O1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMudW5pdHMucG9zICsgJzEnXSA9IHBvc2l0aW9uO1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMudW5pdHMucG9zICsgJzInXSA9IHBvc2l0aW9uO1xuICAgIHBvc2l0aW9uYWxEYXRhW2F4aXMuY291bnRlclVuaXRzLnBvcyArICcxJ10gPSBvZmZzZXQ7XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzInXSA9IG9mZnNldCArIGxlbmd0aDtcblxuICAgIHZhciBncmlkRWxlbWVudCA9IGdyb3VwLmVsZW0oJ2xpbmUnLCBwb3NpdGlvbmFsRGF0YSwgY2xhc3Nlcy5qb2luKCcgJykpO1xuXG4gICAgLy8gRXZlbnQgZm9yIGdyaWQgZHJhd1xuICAgIGV2ZW50RW1pdHRlci5lbWl0KCdkcmF3JyxcbiAgICAgIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgIHR5cGU6ICdncmlkJyxcbiAgICAgICAgYXhpczogYXhpcyxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBncm91cDogZ3JvdXAsXG4gICAgICAgIGVsZW1lbnQ6IGdyaWRFbGVtZW50XG4gICAgICB9LCBwb3NpdGlvbmFsRGF0YSlcbiAgICApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbGFiZWwgYmFzZWQgb24gYSBwcm9qZWN0ZWQgdmFsdWUgYW5kIGFuIGF4aXMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAqIEBwYXJhbSBwb3NpdGlvblxuICAgKiBAcGFyYW0gbGVuZ3RoXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gbGFiZWxzXG4gICAqIEBwYXJhbSBheGlzXG4gICAqIEBwYXJhbSBheGlzT2Zmc2V0XG4gICAqIEBwYXJhbSBsYWJlbE9mZnNldFxuICAgKiBAcGFyYW0gZ3JvdXBcbiAgICogQHBhcmFtIGNsYXNzZXNcbiAgICogQHBhcmFtIHVzZUZvcmVpZ25PYmplY3RcbiAgICogQHBhcmFtIGV2ZW50RW1pdHRlclxuICAgKi9cbiAgQ2hhcnRpc3QuY3JlYXRlTGFiZWwgPSBmdW5jdGlvbihwb3NpdGlvbiwgbGVuZ3RoLCBpbmRleCwgbGFiZWxzLCBheGlzLCBheGlzT2Zmc2V0LCBsYWJlbE9mZnNldCwgZ3JvdXAsIGNsYXNzZXMsIHVzZUZvcmVpZ25PYmplY3QsIGV2ZW50RW1pdHRlcikge1xuICAgIHZhciBsYWJlbEVsZW1lbnQ7XG4gICAgdmFyIHBvc2l0aW9uYWxEYXRhID0ge307XG5cbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLnBvc10gPSBwb3NpdGlvbiArIGxhYmVsT2Zmc2V0W2F4aXMudW5pdHMucG9zXTtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5wb3NdID0gbGFiZWxPZmZzZXRbYXhpcy5jb3VudGVyVW5pdHMucG9zXTtcbiAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLmxlbl0gPSBsZW5ndGg7XG4gICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMubGVuXSA9IGF4aXNPZmZzZXQgLSAxMDtcblxuICAgIGlmKHVzZUZvcmVpZ25PYmplY3QpIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gc2V0IHdpZHRoIGFuZCBoZWlnaHQgZXhwbGljaXRseSB0byBweCBhcyBzcGFuIHdpbGwgbm90IGV4cGFuZCB3aXRoIHdpZHRoIGFuZCBoZWlnaHQgYmVpbmdcbiAgICAgIC8vIDEwMCUgaW4gYWxsIGJyb3dzZXJzXG4gICAgICB2YXIgY29udGVudCA9ICc8c3BhbiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIiBzdHlsZT1cIicgK1xuICAgICAgICBheGlzLnVuaXRzLmxlbiArICc6ICcgKyBNYXRoLnJvdW5kKHBvc2l0aW9uYWxEYXRhW2F4aXMudW5pdHMubGVuXSkgKyAncHg7ICcgK1xuICAgICAgICBheGlzLmNvdW50ZXJVbml0cy5sZW4gKyAnOiAnICsgTWF0aC5yb3VuZChwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5sZW5dKSArICdweFwiPicgK1xuICAgICAgICBsYWJlbHNbaW5kZXhdICsgJzwvc3Bhbj4nO1xuXG4gICAgICBsYWJlbEVsZW1lbnQgPSBncm91cC5mb3JlaWduT2JqZWN0KGNvbnRlbnQsIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgIHN0eWxlOiAnb3ZlcmZsb3c6IHZpc2libGU7J1xuICAgICAgfSwgcG9zaXRpb25hbERhdGEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFiZWxFbGVtZW50ID0gZ3JvdXAuZWxlbSgndGV4dCcsIHBvc2l0aW9uYWxEYXRhLCBjbGFzc2VzLmpvaW4oJyAnKSkudGV4dChsYWJlbHNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICB0eXBlOiAnbGFiZWwnLFxuICAgICAgYXhpczogYXhpcyxcbiAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgIGVsZW1lbnQ6IGxhYmVsRWxlbWVudCxcbiAgICAgIHRleHQ6IGxhYmVsc1tpbmRleF1cbiAgICB9LCBwb3NpdGlvbmFsRGF0YSkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gcmVhZCBzZXJpZXMgc3BlY2lmaWMgb3B0aW9ucyBmcm9tIG9wdGlvbnMgb2JqZWN0LiBJdCBhdXRvbWF0aWNhbGx5IGZhbGxzIGJhY2sgdG8gdGhlIGdsb2JhbCBvcHRpb24gaWZcbiAgICogdGhlcmUgaXMgbm8gb3B0aW9uIGluIHRoZSBzZXJpZXMgb3B0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHNlcmllcyBTZXJpZXMgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIENoYXJ0aXN0IG9wdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG9wdGlvbnMga2V5IHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gb2J0YWluIHRoZSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uID0gZnVuY3Rpb24oc2VyaWVzLCBvcHRpb25zLCBrZXkpIHtcbiAgICBpZihzZXJpZXMubmFtZSAmJiBvcHRpb25zLnNlcmllcyAmJiBvcHRpb25zLnNlcmllc1tzZXJpZXMubmFtZV0pIHtcbiAgICAgIHZhciBzZXJpZXNPcHRpb25zID0gb3B0aW9ucy5zZXJpZXNbc2VyaWVzLm5hbWVdO1xuICAgICAgcmV0dXJuIHNlcmllc09wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSA/IHNlcmllc09wdGlvbnNba2V5XSA6IG9wdGlvbnNba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnNba2V5XTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIG9wdGlvbnMgaGFuZGxpbmcgZnVuY3Rpb25hbGl0eSB3aXRoIGNhbGxiYWNrIGZvciBvcHRpb25zIGNoYW5nZXMgdHJpZ2dlcmVkIGJ5IHJlc3BvbnNpdmUgb3B0aW9ucyBhbmQgbWVkaWEgcXVlcnkgbWF0Y2hlc1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIHNldCBieSB1c2VyXG4gICAqIEBwYXJhbSB7QXJyYXl9IHJlc3BvbnNpdmVPcHRpb25zIE9wdGlvbmFsIGZ1bmN0aW9ucyB0byBhZGQgcmVzcG9uc2l2ZSBiZWhhdmlvciB0byBjaGFydFxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRFbWl0dGVyIFRoZSBldmVudCBlbWl0dGVyIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGVtaXQgdGhlIG9wdGlvbnMgY2hhbmdlZCBldmVudHNcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY29uc29saWRhdGVkIG9wdGlvbnMgb2JqZWN0IGZyb20gdGhlIGRlZmF1bHRzLCBiYXNlIGFuZCBtYXRjaGluZyByZXNwb25zaXZlIG9wdGlvbnNcbiAgICovXG4gIENoYXJ0aXN0Lm9wdGlvbnNQcm92aWRlciA9IGZ1bmN0aW9uIChvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucywgZXZlbnRFbWl0dGVyKSB7XG4gICAgdmFyIGJhc2VPcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zKSxcbiAgICAgIGN1cnJlbnRPcHRpb25zLFxuICAgICAgbWVkaWFRdWVyeUxpc3RlbmVycyA9IFtdLFxuICAgICAgaTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUN1cnJlbnRPcHRpb25zKHByZXZlbnRDaGFuZ2VkRXZlbnQpIHtcbiAgICAgIHZhciBwcmV2aW91c09wdGlvbnMgPSBjdXJyZW50T3B0aW9ucztcbiAgICAgIGN1cnJlbnRPcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBiYXNlT3B0aW9ucyk7XG5cbiAgICAgIGlmIChyZXNwb25zaXZlT3B0aW9ucykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzcG9uc2l2ZU9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgbXFsID0gd2luZG93Lm1hdGNoTWVkaWEocmVzcG9uc2l2ZU9wdGlvbnNbaV1bMF0pO1xuICAgICAgICAgIGlmIChtcWwubWF0Y2hlcykge1xuICAgICAgICAgICAgY3VycmVudE9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoY3VycmVudE9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zW2ldWzFdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZXZlbnRFbWl0dGVyICYmICFwcmV2ZW50Q2hhbmdlZEV2ZW50KSB7XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdvcHRpb25zQ2hhbmdlZCcsIHtcbiAgICAgICAgICBwcmV2aW91c09wdGlvbnM6IHByZXZpb3VzT3B0aW9ucyxcbiAgICAgICAgICBjdXJyZW50T3B0aW9uczogY3VycmVudE9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTWVkaWFRdWVyeUxpc3RlbmVycygpIHtcbiAgICAgIG1lZGlhUXVlcnlMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihtcWwpIHtcbiAgICAgICAgbXFsLnJlbW92ZUxpc3RlbmVyKHVwZGF0ZUN1cnJlbnRPcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghd2luZG93Lm1hdGNoTWVkaWEpIHtcbiAgICAgIHRocm93ICd3aW5kb3cubWF0Y2hNZWRpYSBub3QgZm91bmQhIE1ha2Ugc3VyZSB5b3VcXCdyZSB1c2luZyBhIHBvbHlmaWxsLic7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zaXZlT3B0aW9ucykge1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzcG9uc2l2ZU9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG1xbCA9IHdpbmRvdy5tYXRjaE1lZGlhKHJlc3BvbnNpdmVPcHRpb25zW2ldWzBdKTtcbiAgICAgICAgbXFsLmFkZExpc3RlbmVyKHVwZGF0ZUN1cnJlbnRPcHRpb25zKTtcbiAgICAgICAgbWVkaWFRdWVyeUxpc3RlbmVycy5wdXNoKG1xbCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEV4ZWN1dGUgaW5pdGlhbGx5IHNvIHdlIGdldCB0aGUgY29ycmVjdCBvcHRpb25zXG4gICAgdXBkYXRlQ3VycmVudE9wdGlvbnModHJ1ZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlTWVkaWFRdWVyeUxpc3RlbmVyczogcmVtb3ZlTWVkaWFRdWVyeUxpc3RlbmVycyxcbiAgICAgIGdldEN1cnJlbnRPcHRpb25zOiBmdW5jdGlvbiBnZXRDdXJyZW50T3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIENoYXJ0aXN0LmV4dGVuZCh7fSwgY3VycmVudE9wdGlvbnMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIENoYXJ0aXN0IHBhdGggaW50ZXJwb2xhdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBDaGFydGlzdC5JbnRlcnBvbGF0aW9uID0ge307XG5cbiAgLyoqXG4gICAqIFRoaXMgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBkb2VzIG5vdCBzbW9vdGggdGhlIHBhdGggYW5kIHRoZSByZXN1bHQgaXMgb25seSBjb250YWluaW5nIGxpbmVzIGFuZCBubyBjdXJ2ZXMuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAqICAgc2VyaWVzOiBbWzEsIDIsIDgsIDEsIDddXVxuICAgKiB9LCB7XG4gICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lKHtcbiAgICogICAgIGZpbGxIb2xlczogZmFsc2VcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkludGVycG9sYXRpb25cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgIH07XG4gICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBub25lKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKSB7XG4gICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpO1xuICAgICAgdmFyIGhvbGUgPSB0cnVlO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBjdXJyWCA9IHBhdGhDb29yZGluYXRlc1tpXTtcbiAgICAgICAgdmFyIGN1cnJZID0gcGF0aENvb3JkaW5hdGVzW2kgKyAxXTtcbiAgICAgICAgdmFyIGN1cnJEYXRhID0gdmFsdWVEYXRhW2kgLyAyXTtcblxuICAgICAgICBpZihjdXJyRGF0YS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICBpZihob2xlKSB7XG4gICAgICAgICAgICBwYXRoLm1vdmUoY3VyclgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoLmxpbmUoY3VyclgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGhvbGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmKCFvcHRpb25zLmZpbGxIb2xlcykge1xuICAgICAgICAgIGhvbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIFNpbXBsZSBzbW9vdGhpbmcgY3JlYXRlcyBob3Jpem9udGFsIGhhbmRsZXMgdGhhdCBhcmUgcG9zaXRpb25lZCB3aXRoIGEgZnJhY3Rpb24gb2YgdGhlIGxlbmd0aCBiZXR3ZWVuIHR3byBkYXRhIHBvaW50cy4gWW91IGNhbiB1c2UgdGhlIGRpdmlzb3Igb3B0aW9uIHRvIHNwZWNpZnkgdGhlIGFtb3VudCBvZiBzbW9vdGhpbmcuXG4gICAqXG4gICAqIFNpbXBsZSBzbW9vdGhpbmcgY2FuIGJlIHVzZWQgaW5zdGVhZCBvZiBgQ2hhcnRpc3QuU21vb3RoaW5nLmNhcmRpbmFsYCBpZiB5b3UnZCBsaWtlIHRvIGdldCByaWQgb2YgdGhlIGFydGlmYWN0cyBpdCBwcm9kdWNlcyBzb21ldGltZXMuIFNpbXBsZSBzbW9vdGhpbmcgcHJvZHVjZXMgbGVzcyBmbG93aW5nIGxpbmVzIGJ1dCBpcyBhY2N1cmF0ZSBieSBoaXR0aW5nIHRoZSBwb2ludHMgYW5kIGl0IGFsc28gZG9lc24ndCBzd2luZyBiZWxvdyBvciBhYm92ZSB0aGUgZ2l2ZW4gZGF0YSBwb2ludC5cbiAgICpcbiAgICogQWxsIHNtb290aGluZyBmdW5jdGlvbnMgd2l0aGluIENoYXJ0aXN0IGFyZSBmYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IGFjY2VwdCBhbiBvcHRpb25zIHBhcmFtZXRlci4gVGhlIHNpbXBsZSBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGFjY2VwdHMgb25lIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyIGBkaXZpc29yYCwgYmV0d2VlbiAxIGFuZCDiiJ4sIHdoaWNoIGNvbnRyb2xzIHRoZSBzbW9vdGhpbmcgY2hhcmFjdGVyaXN0aWNzLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgKiAgIHNlcmllczogW1sxLCAyLCA4LCAxLCA3XV1cbiAgICogfSwge1xuICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24uc2ltcGxlKHtcbiAgICogICAgIGRpdmlzb3I6IDIsXG4gICAqICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9mIHRoZSBzaW1wbGUgaW50ZXJwb2xhdGlvbiBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG4gIENoYXJ0aXN0LkludGVycG9sYXRpb24uc2ltcGxlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGRpdmlzb3I6IDIsXG4gICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAgfTtcbiAgICBvcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB2YXIgZCA9IDEgLyBNYXRoLm1heCgxLCBvcHRpb25zLmRpdmlzb3IpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHNpbXBsZShwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSkge1xuICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKTtcbiAgICAgIHZhciBwcmV2WCwgcHJldlksIHByZXZEYXRhO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBjdXJyWCA9IHBhdGhDb29yZGluYXRlc1tpXTtcbiAgICAgICAgdmFyIGN1cnJZID0gcGF0aENvb3JkaW5hdGVzW2kgKyAxXTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IChjdXJyWCAtIHByZXZYKSAqIGQ7XG4gICAgICAgIHZhciBjdXJyRGF0YSA9IHZhbHVlRGF0YVtpIC8gMl07XG5cbiAgICAgICAgaWYoY3VyckRhdGEudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgaWYocHJldkRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcGF0aC5tb3ZlKGN1cnJYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aC5jdXJ2ZShcbiAgICAgICAgICAgICAgcHJldlggKyBsZW5ndGgsXG4gICAgICAgICAgICAgIHByZXZZLFxuICAgICAgICAgICAgICBjdXJyWCAtIGxlbmd0aCxcbiAgICAgICAgICAgICAgY3VyclksXG4gICAgICAgICAgICAgIGN1cnJYLFxuICAgICAgICAgICAgICBjdXJyWSxcbiAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgIGN1cnJEYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByZXZYID0gY3Vyclg7XG4gICAgICAgICAgcHJldlkgPSBjdXJyWTtcbiAgICAgICAgICBwcmV2RGF0YSA9IGN1cnJEYXRhO1xuICAgICAgICB9IGVsc2UgaWYoIW9wdGlvbnMuZmlsbEhvbGVzKSB7XG4gICAgICAgICAgcHJldlggPSBjdXJyWCA9IHByZXZEYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIENhcmRpbmFsIC8gQ2F0bXVsbC1Sb21lIHNwbGluZSBpbnRlcnBvbGF0aW9uIGlzIHRoZSBkZWZhdWx0IHNtb290aGluZyBmdW5jdGlvbiBpbiBDaGFydGlzdC4gSXQgcHJvZHVjZXMgbmljZSByZXN1bHRzIHdoZXJlIHRoZSBzcGxpbmVzIHdpbGwgYWx3YXlzIG1lZXQgdGhlIHBvaW50cy4gSXQgcHJvZHVjZXMgc29tZSBhcnRpZmFjdHMgdGhvdWdoIHdoZW4gZGF0YSB2YWx1ZXMgYXJlIGluY3JlYXNlZCBvciBkZWNyZWFzZWQgcmFwaWRseS4gVGhlIGxpbmUgbWF5IG5vdCBmb2xsb3cgYSB2ZXJ5IGFjY3VyYXRlIHBhdGggYW5kIGlmIHRoZSBsaW5lIHNob3VsZCBiZSBhY2N1cmF0ZSB0aGlzIHNtb290aGluZyBmdW5jdGlvbiBkb2VzIG5vdCBwcm9kdWNlIHRoZSBiZXN0IHJlc3VsdHMuXG4gICAqXG4gICAqIENhcmRpbmFsIHNwbGluZXMgY2FuIG9ubHkgYmUgY3JlYXRlZCBpZiB0aGVyZSBhcmUgbW9yZSB0aGFuIHR3byBkYXRhIHBvaW50cy4gSWYgdGhpcyBpcyBub3QgdGhlIGNhc2UgdGhpcyBzbW9vdGhpbmcgd2lsbCBmYWxsYmFjayB0byBgQ2hhcnRpc3QuU21vb3RoaW5nLm5vbmVgLlxuICAgKlxuICAgKiBBbGwgc21vb3RoaW5nIGZ1bmN0aW9ucyB3aXRoaW4gQ2hhcnRpc3QgYXJlIGZhY3RvcnkgZnVuY3Rpb25zIHRoYXQgYWNjZXB0IGFuIG9wdGlvbnMgcGFyYW1ldGVyLiBUaGUgY2FyZGluYWwgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBhY2NlcHRzIG9uZSBjb25maWd1cmF0aW9uIHBhcmFtZXRlciBgdGVuc2lvbmAsIGJldHdlZW4gMCBhbmQgMSwgd2hpY2ggY29udHJvbHMgdGhlIHNtb290aGluZyBpbnRlbnNpdHkuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAqICAgc2VyaWVzOiBbWzEsIDIsIDgsIDEsIDddXVxuICAgKiB9LCB7XG4gICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCh7XG4gICAqICAgICB0ZW5zaW9uOiAxLFxuICAgKiAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBUaGUgb3B0aW9ucyBvZiB0aGUgY2FyZGluYWwgZmFjdG9yeSBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuICBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRlbnNpb246IDEsXG4gICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAgfTtcblxuICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICAgIHZhciB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgb3B0aW9ucy50ZW5zaW9uKSksXG4gICAgICBjID0gMSAtIHQ7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHdpbGwgaGVscCB1cyB0byBzcGxpdCBwYXRoQ29vcmRpbmF0ZXMgYW5kIHZhbHVlRGF0YSBpbnRvIHNlZ21lbnRzIHRoYXQgYWxzbyBjb250YWluIHBhdGhDb29yZGluYXRlc1xuICAgIC8vIGFuZCB2YWx1ZURhdGEuIFRoaXMgd2F5IHRoZSBleGlzdGluZyBmdW5jdGlvbnMgY2FuIGJlIHJldXNlZCBhbmQgdGhlIHNlZ21lbnQgcGF0aHMgY2FuIGJlIGpvaW5lZCBhZnRlcndhcmRzLlxuICAgIC8vIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBuZWNlc3NhcnkgdG8gdHJlYXQgXCJob2xlc1wiIGluIHRoZSBsaW5lIGNoYXJ0c1xuICAgIGZ1bmN0aW9uIHNwbGl0SW50b1NlZ21lbnRzKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKSB7XG4gICAgICB2YXIgc2VnbWVudHMgPSBbXTtcbiAgICAgIHZhciBob2xlID0gdHJ1ZTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAvLyBJZiB0aGlzIHZhbHVlIGlzIGEgXCJob2xlXCIgd2Ugc2V0IHRoZSBob2xlIGZsYWdcbiAgICAgICAgaWYodmFsdWVEYXRhW2kgLyAyXS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYoIW9wdGlvbnMuZmlsbEhvbGVzKSB7XG4gICAgICAgICAgICBob2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgaXQncyBhIHZhbGlkIHZhbHVlIHdlIG5lZWQgdG8gY2hlY2sgaWYgd2UncmUgY29taW5nIG91dCBvZiBhIGhvbGUgYW5kIGNyZWF0ZSBhIG5ldyBlbXB0eSBzZWdtZW50XG4gICAgICAgICAgaWYoaG9sZSkge1xuICAgICAgICAgICAgc2VnbWVudHMucHVzaCh7XG4gICAgICAgICAgICAgIHBhdGhDb29yZGluYXRlczogW10sXG4gICAgICAgICAgICAgIHZhbHVlRGF0YTogW11cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQXMgd2UgaGF2ZSBhIHZhbGlkIHZhbHVlIG5vdywgd2UgYXJlIG5vdCBpbiBhIFwiaG9sZVwiIGFueW1vcmVcbiAgICAgICAgICAgIGhvbGUgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBZGQgdG8gdGhlIHNlZ21lbnQgcGF0aENvb3JkaW5hdGVzIGFuZCB2YWx1ZURhdGFcbiAgICAgICAgICBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5wYXRoQ29vcmRpbmF0ZXMucHVzaChwYXRoQ29vcmRpbmF0ZXNbaV0sIHBhdGhDb29yZGluYXRlc1tpICsgMV0pO1xuICAgICAgICAgIHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLnZhbHVlRGF0YS5wdXNoKHZhbHVlRGF0YVtpIC8gMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gY2FyZGluYWwocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpIHtcbiAgICAgIC8vIEZpcnN0IHdlIHRyeSB0byBzcGxpdCB0aGUgY29vcmRpbmF0ZXMgaW50byBzZWdtZW50c1xuICAgICAgLy8gVGhpcyBpcyBuZWNlc3NhcnkgdG8gdHJlYXQgXCJob2xlc1wiIGluIGxpbmUgY2hhcnRzXG4gICAgICB2YXIgc2VnbWVudHMgPSBzcGxpdEludG9TZWdtZW50cyhwYXRoQ29vcmRpbmF0ZXMsIHZhbHVlRGF0YSk7XG5cbiAgICAgIC8vIElmIHRoZSBzcGxpdCByZXN1bHRlZCBpbiBtb3JlIHRoYXQgb25lIHNlZ21lbnQgd2UgbmVlZCB0byBpbnRlcnBvbGF0ZSBlYWNoIHNlZ21lbnQgaW5kaXZpZHVhbGx5IGFuZCBqb2luIHRoZW1cbiAgICAgIC8vIGFmdGVyd2FyZHMgdG9nZXRoZXIgaW50byBhIHNpbmdsZSBwYXRoLlxuICAgICAgaWYoc2VnbWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgcGF0aHMgPSBbXTtcbiAgICAgICAgLy8gRm9yIGVhY2ggc2VnbWVudCB3ZSB3aWxsIHJlY3Vyc2UgdGhlIGNhcmRpbmFsIGZ1bmN0aW9uXG4gICAgICAgIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oc2VnbWVudCkge1xuICAgICAgICAgIHBhdGhzLnB1c2goY2FyZGluYWwoc2VnbWVudC5wYXRoQ29vcmRpbmF0ZXMsIHNlZ21lbnQudmFsdWVEYXRhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBKb2luIHRoZSBzZWdtZW50IHBhdGggZGF0YSBpbnRvIGEgc2luZ2xlIHBhdGggYW5kIHJldHVyblxuICAgICAgICByZXR1cm4gQ2hhcnRpc3QuU3ZnLlBhdGguam9pbihwYXRocyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGVyZSB3YXMgb25seSBvbmUgc2VnbWVudCB3ZSBjYW4gcHJvY2VlZCByZWd1bGFybHkgYnkgdXNpbmcgcGF0aENvb3JkaW5hdGVzIGFuZCB2YWx1ZURhdGEgZnJvbSB0aGUgZmlyc3RcbiAgICAgICAgLy8gc2VnbWVudFxuICAgICAgICBwYXRoQ29vcmRpbmF0ZXMgPSBzZWdtZW50c1swXS5wYXRoQ29vcmRpbmF0ZXM7XG4gICAgICAgIHZhbHVlRGF0YSA9IHNlZ21lbnRzWzBdLnZhbHVlRGF0YTtcblxuICAgICAgICAvLyBJZiBsZXNzIHRoYW4gdHdvIHBvaW50cyB3ZSBuZWVkIHRvIGZhbGxiYWNrIHRvIG5vIHNtb290aGluZ1xuICAgICAgICBpZihwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICByZXR1cm4gQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lKCkocGF0aENvb3JkaW5hdGVzLCB2YWx1ZURhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKS5tb3ZlKHBhdGhDb29yZGluYXRlc1swXSwgcGF0aENvb3JkaW5hdGVzWzFdLCBmYWxzZSwgdmFsdWVEYXRhWzBdKSxcbiAgICAgICAgICB6O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaUxlbiAtIDIgKiAheiA+IGk7IGkgKz0gMikge1xuICAgICAgICAgIHZhciBwID0gW1xuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaSAtIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgLSAxXX0sXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpXSwgeTogK3BhdGhDb29yZGluYXRlc1tpICsgMV19LFxuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyAzXX0sXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpICsgNF0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDVdfVxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIGlmICghaSkge1xuICAgICAgICAgICAgICBwWzBdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaUxlbiAtIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2lMZW4gLSAxXX07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSA0ID09PSBpKSB7XG4gICAgICAgICAgICAgIHBbM10gPSB7eDogK3BhdGhDb29yZGluYXRlc1swXSwgeTogK3BhdGhDb29yZGluYXRlc1sxXX07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSAyID09PSBpKSB7XG4gICAgICAgICAgICAgIHBbMl0gPSB7eDogK3BhdGhDb29yZGluYXRlc1swXSwgeTogK3BhdGhDb29yZGluYXRlc1sxXX07XG4gICAgICAgICAgICAgIHBbM10gPSB7eDogK3BhdGhDb29yZGluYXRlc1syXSwgeTogK3BhdGhDb29yZGluYXRlc1szXX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpTGVuIC0gNCA9PT0gaSkge1xuICAgICAgICAgICAgICBwWzNdID0gcFsyXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgcFswXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzW2ldLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyAxXX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcGF0aC5jdXJ2ZShcbiAgICAgICAgICAgICh0ICogKC1wWzBdLnggKyA2ICogcFsxXS54ICsgcFsyXS54KSAvIDYpICsgKGMgKiBwWzJdLngpLFxuICAgICAgICAgICAgKHQgKiAoLXBbMF0ueSArIDYgKiBwWzFdLnkgKyBwWzJdLnkpIC8gNikgKyAoYyAqIHBbMl0ueSksXG4gICAgICAgICAgICAodCAqIChwWzFdLnggKyA2ICogcFsyXS54IC0gcFszXS54KSAvIDYpICsgKGMgKiBwWzJdLngpLFxuICAgICAgICAgICAgKHQgKiAocFsxXS55ICsgNiAqIHBbMl0ueSAtIHBbM10ueSkgLyA2KSArIChjICogcFsyXS55KSxcbiAgICAgICAgICAgIHBbMl0ueCxcbiAgICAgICAgICAgIHBbMl0ueSxcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgdmFsdWVEYXRhWyhpICsgMikgLyAyXVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGVwIGludGVycG9sYXRpb24gd2lsbCBjYXVzZSB0aGUgbGluZSBjaGFydCB0byBtb3ZlIGluIHN0ZXBzIHJhdGhlciB0aGFuIGRpYWdvbmFsIG9yIHNtb290aGVkIGxpbmVzLiBUaGlzIGludGVycG9sYXRpb24gd2lsbCBjcmVhdGUgYWRkaXRpb25hbCBwb2ludHMgdGhhdCB3aWxsIGFsc28gYmUgZHJhd24gd2hlbiB0aGUgYHNob3dQb2ludGAgb3B0aW9uIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEFsbCBzbW9vdGhpbmcgZnVuY3Rpb25zIHdpdGhpbiBDaGFydGlzdCBhcmUgZmFjdG9yeSBmdW5jdGlvbnMgdGhhdCBhY2NlcHQgYW4gb3B0aW9ucyBwYXJhbWV0ZXIuIFRoZSBzdGVwIGludGVycG9sYXRpb24gZnVuY3Rpb24gYWNjZXB0cyBvbmUgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgYHBvc3Rwb25lYCwgdGhhdCBjYW4gYmUgYHRydWVgIG9yIGBmYWxzZWAuIFRoZSBkZWZhdWx0IHZhbHVlIGlzIGB0cnVlYCBhbmQgd2lsbCBjYXVzZSB0aGUgc3RlcCB0byBvY2N1ciB3aGVyZSB0aGUgdmFsdWUgYWN0dWFsbHkgY2hhbmdlcy4gSWYgYSBkaWZmZXJlbnQgYmVoYXZpb3VyIGlzIG5lZWRlZCB3aGVyZSB0aGUgc3RlcCBpcyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGFuZCBoYXBwZW5zIGJlZm9yZSB0aGUgYWN0dWFsIHZhbHVlLCB0aGlzIG9wdGlvbiBjYW4gYmUgc2V0IHRvIGBmYWxzZWAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAqICAgc2VyaWVzOiBbWzEsIDIsIDgsIDEsIDddXVxuICAgKiB9LCB7XG4gICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5zdGVwKHtcbiAgICogICAgIHBvc3Rwb25lOiB0cnVlLFxuICAgKiAgICAgZmlsbEhvbGVzOiBmYWxzZVxuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gICAqL1xuICBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLnN0ZXAgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgcG9zdHBvbmU6IHRydWUsXG4gICAgICBmaWxsSG9sZXM6IGZhbHNlXG4gICAgfTtcblxuICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiBzdGVwKHBhdGhDb29yZGluYXRlcywgdmFsdWVEYXRhKSB7XG4gICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpO1xuXG4gICAgICB2YXIgcHJldlgsIHByZXZZLCBwcmV2RGF0YTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdmFyIGN1cnJYID0gcGF0aENvb3JkaW5hdGVzW2ldO1xuICAgICAgICB2YXIgY3VyclkgPSBwYXRoQ29vcmRpbmF0ZXNbaSArIDFdO1xuICAgICAgICB2YXIgY3VyckRhdGEgPSB2YWx1ZURhdGFbaSAvIDJdO1xuXG4gICAgICAgIC8vIElmIHRoZSBjdXJyZW50IHBvaW50IGlzIGFsc28gbm90IGEgaG9sZSB3ZSBjYW4gZHJhdyB0aGUgc3RlcCBsaW5lc1xuICAgICAgICBpZihjdXJyRGF0YS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYocHJldkRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcGF0aC5tb3ZlKGN1cnJYLCBjdXJyWSwgZmFsc2UsIGN1cnJEYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYob3B0aW9ucy5wb3N0cG9uZSkge1xuICAgICAgICAgICAgICAvLyBJZiBwb3N0cG9uZWQgd2Ugc2hvdWxkIGRyYXcgdGhlIHN0ZXAgbGluZSB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgICAgICAgcGF0aC5saW5lKGN1cnJYLCBwcmV2WSwgZmFsc2UsIHByZXZEYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIElmIG5vdCBwb3N0cG9uZWQgd2Ugc2hvdWxkIGRyYXcgdGhlIHN0ZXAgbGluZSB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudCB2YWx1ZVxuICAgICAgICAgICAgICBwYXRoLmxpbmUocHJldlgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTGluZSB0byB0aGUgYWN0dWFsIHBvaW50ICh0aGlzIHNob3VsZCBvbmx5IGJlIGEgWS1BeGlzIG1vdmVtZW50XG4gICAgICAgICAgICBwYXRoLmxpbmUoY3VyclgsIGN1cnJZLCBmYWxzZSwgY3VyckRhdGEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHByZXZYID0gY3Vyclg7XG4gICAgICAgICAgcHJldlkgPSBjdXJyWTtcbiAgICAgICAgICBwcmV2RGF0YSA9IGN1cnJEYXRhO1xuICAgICAgICB9IGVsc2UgaWYoIW9wdGlvbnMuZmlsbEhvbGVzKSB7XG4gICAgICAgICAgcHJldlggPSBwcmV2WSA9IHByZXZEYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH07XG4gIH07XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIEEgdmVyeSBiYXNpYyBldmVudCBtb2R1bGUgdGhhdCBoZWxwcyB0byBnZW5lcmF0ZSBhbmQgY2F0Y2ggZXZlbnRzLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuRXZlbnRcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBDaGFydGlzdC5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhhbmRsZXJzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYW4gZXZlbnQgaGFuZGxlciBmb3IgYSBzcGVjaWZpYyBldmVudFxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBBIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZXJzW2V2ZW50XSB8fCBbXTtcbiAgICAgIGhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbiBldmVudCBoYW5kbGVyIG9mIGEgc3BlY2lmaWMgZXZlbnQgbmFtZSBvciByZW1vdmUgYWxsIGV2ZW50IGhhbmRsZXJzIGZvciBhIHNwZWNpZmljIGV2ZW50LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lIHdoZXJlIGEgc3BlY2lmaWMgb3IgYWxsIGhhbmRsZXJzIHNob3VsZCBiZSByZW1vdmVkXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdIEFuIG9wdGlvbmFsIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uIElmIHNwZWNpZmllZCBvbmx5IHRoaXMgc3BlY2lmaWMgaGFuZGxlciB3aWxsIGJlIHJlbW92ZWQgYW5kIG90aGVyd2lzZSBhbGwgaGFuZGxlcnMgYXJlIHJlbW92ZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAvLyBPbmx5IGRvIHNvbWV0aGluZyBpZiB0aGVyZSBhcmUgZXZlbnQgaGFuZGxlcnMgd2l0aCB0aGlzIG5hbWUgZXhpc3RpbmdcbiAgICAgIGlmKGhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgICAvLyBJZiBoYW5kbGVyIGlzIHNldCB3ZSB3aWxsIGxvb2sgZm9yIGEgc3BlY2lmaWMgaGFuZGxlciBhbmQgb25seSByZW1vdmUgdGhpc1xuICAgICAgICBpZihoYW5kbGVyKSB7XG4gICAgICAgICAgaGFuZGxlcnNbZXZlbnRdLnNwbGljZShoYW5kbGVyc1tldmVudF0uaW5kZXhPZihoYW5kbGVyKSwgMSk7XG4gICAgICAgICAgaWYoaGFuZGxlcnNbZXZlbnRdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVsZXRlIGhhbmRsZXJzW2V2ZW50XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgbm8gaGFuZGxlciBpcyBzcGVjaWZpZWQgd2UgcmVtb3ZlIGFsbCBoYW5kbGVycyBmb3IgdGhpcyBldmVudFxuICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBlbWl0IGFuIGV2ZW50LiBBbGwgaGFuZGxlcnMgdGhhdCBhcmUgbGlzdGVuaW5nIGZvciB0aGlzIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdpdGggdGhlIGRhdGEgcGFyYW1ldGVyLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lIHRoYXQgc2hvdWxkIGJlIHRyaWdnZXJlZFxuICAgICAqIEBwYXJhbSB7Kn0gZGF0YSBBcmJpdHJhcnkgZGF0YSB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyIGNhbGxiYWNrIGZ1bmN0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgIC8vIE9ubHkgZG8gc29tZXRoaW5nIGlmIHRoZXJlIGFyZSBldmVudCBoYW5kbGVycyB3aXRoIHRoaXMgbmFtZSBleGlzdGluZ1xuICAgICAgaWYoaGFuZGxlcnNbZXZlbnRdKSB7XG4gICAgICAgIGhhbmRsZXJzW2V2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgICAgICBoYW5kbGVyKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRW1pdCBldmVudCB0byBzdGFyIGV2ZW50IGhhbmRsZXJzXG4gICAgICBpZihoYW5kbGVyc1snKiddKSB7XG4gICAgICAgIGhhbmRsZXJzWycqJ10uZm9yRWFjaChmdW5jdGlvbihzdGFySGFuZGxlcikge1xuICAgICAgICAgIHN0YXJIYW5kbGVyKGV2ZW50LCBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFkZEV2ZW50SGFuZGxlcjogYWRkRXZlbnRIYW5kbGVyLFxuICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyOiByZW1vdmVFdmVudEhhbmRsZXIsXG4gICAgICBlbWl0OiBlbWl0XG4gICAgfTtcbiAgfTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgc29tZSBiYXNpYyBwcm90b3R5cGUgaW5oZXJpdGFuY2UgdXRpbGl0aWVzLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuQ2xhc3NcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIGxpc3RUb0FycmF5KGxpc3QpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgaWYgKGxpc3QubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyLnB1c2gobGlzdFtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnI7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRvIGV4dGVuZCBmcm9tIGN1cnJlbnQgcHJvdG90eXBlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ2xhc3NcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgVGhlIG9iamVjdCB0aGF0IHNlcnZlcyBhcyBkZWZpbml0aW9uIGZvciB0aGUgcHJvdG90eXBlIHRoYXQgZ2V0cyBjcmVhdGVkIGZvciB0aGUgbmV3IGNsYXNzLiBUaGlzIG9iamVjdCBzaG91bGQgYWx3YXlzIGNvbnRhaW4gYSBjb25zdHJ1Y3RvciBwcm9wZXJ0eSB0aGF0IGlzIHRoZSBkZXNpcmVkIGNvbnN0cnVjdG9yIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBjbGFzcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtzdXBlclByb3RvT3ZlcnJpZGVdIEJ5IGRlZmF1bHQgZXh0ZW5zIHdpbGwgdXNlIHRoZSBjdXJyZW50IGNsYXNzIHByb3RvdHlwZSBvciBDaGFydGlzdC5jbGFzcy4gV2l0aCB0aGlzIHBhcmFtZXRlciB5b3UgY2FuIHNwZWNpZnkgYW55IHN1cGVyIHByb3RvdHlwZSB0aGF0IHdpbGwgYmUgdXNlZC5cbiAgICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZ1bmN0aW9uIG9mIHRoZSBuZXcgY2xhc3NcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdmFyIEZydWl0ID0gQ2xhc3MuZXh0ZW5kKHtcbiAgICAgKiBjb2xvcjogdW5kZWZpbmVkLFxuICAgICAqICAgc3VnYXI6IHVuZGVmaW5lZCxcbiAgICAgKlxuICAgICAqICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKGNvbG9yLCBzdWdhcikge1xuICAgICAqICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICogICAgIHRoaXMuc3VnYXIgPSBzdWdhcjtcbiAgICAgKiAgIH0sXG4gICAgICpcbiAgICAgKiAgIGVhdDogZnVuY3Rpb24oKSB7XG4gICAgICogICAgIHRoaXMuc3VnYXIgPSAwO1xuICAgICAqICAgICByZXR1cm4gdGhpcztcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICpcbiAgICogdmFyIEJhbmFuYSA9IEZydWl0LmV4dGVuZCh7XG4gICAgICogICBsZW5ndGg6IHVuZGVmaW5lZCxcbiAgICAgKlxuICAgICAqICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKGxlbmd0aCwgc3VnYXIpIHtcbiAgICAgKiAgICAgQmFuYW5hLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgJ1llbGxvdycsIHN1Z2FyKTtcbiAgICAgKiAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAqXG4gICAqIHZhciBiYW5hbmEgPSBuZXcgQmFuYW5hKDIwLCA0MCk7XG4gICAqIGNvbnNvbGUubG9nKCdiYW5hbmEgaW5zdGFuY2VvZiBGcnVpdCcsIGJhbmFuYSBpbnN0YW5jZW9mIEZydWl0KTtcbiAgICogY29uc29sZS5sb2coJ0ZydWl0IGlzIHByb3RvdHlwZSBvZiBiYW5hbmEnLCBGcnVpdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihiYW5hbmEpKTtcbiAgICogY29uc29sZS5sb2coJ2JhbmFuYXMgcHJvdG90eXBlIGlzIEZydWl0JywgT2JqZWN0LmdldFByb3RvdHlwZU9mKGJhbmFuYSkgPT09IEZydWl0LnByb3RvdHlwZSk7XG4gICAqIGNvbnNvbGUubG9nKGJhbmFuYS5zdWdhcik7XG4gICAqIGNvbnNvbGUubG9nKGJhbmFuYS5lYXQoKS5zdWdhcik7XG4gICAqIGNvbnNvbGUubG9nKGJhbmFuYS5jb2xvcik7XG4gICAqL1xuICBmdW5jdGlvbiBleHRlbmQocHJvcGVydGllcywgc3VwZXJQcm90b092ZXJyaWRlKSB7XG4gICAgdmFyIHN1cGVyUHJvdG8gPSBzdXBlclByb3RvT3ZlcnJpZGUgfHwgdGhpcy5wcm90b3R5cGUgfHwgQ2hhcnRpc3QuQ2xhc3M7XG4gICAgdmFyIHByb3RvID0gT2JqZWN0LmNyZWF0ZShzdXBlclByb3RvKTtcblxuICAgIENoYXJ0aXN0LkNsYXNzLmNsb25lRGVmaW5pdGlvbnMocHJvdG8sIHByb3BlcnRpZXMpO1xuXG4gICAgdmFyIGNvbnN0ciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZuID0gcHJvdG8uY29uc3RydWN0b3IgfHwgZnVuY3Rpb24gKCkge30sXG4gICAgICAgIGluc3RhbmNlO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIGxpbmtlZCB0byB0aGUgQ2hhcnRpc3QgbmFtZXNwYWNlIHRoZSBjb25zdHJ1Y3RvciB3YXMgbm90IGNhbGxlZCB3aXRoIG5ld1xuICAgICAgLy8gVG8gcHJvdmlkZSBhIGZhbGxiYWNrIHdlIHdpbGwgaW5zdGFudGlhdGUgaGVyZSBhbmQgcmV0dXJuIHRoZSBpbnN0YW5jZVxuICAgICAgaW5zdGFuY2UgPSB0aGlzID09PSBDaGFydGlzdCA/IE9iamVjdC5jcmVhdGUocHJvdG8pIDogdGhpcztcbiAgICAgIGZuLmFwcGx5KGluc3RhbmNlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcblxuICAgICAgLy8gSWYgdGhpcyBjb25zdHJ1Y3RvciB3YXMgbm90IGNhbGxlZCB3aXRoIG5ldyB3ZSBuZWVkIHRvIHJldHVybiB0aGUgaW5zdGFuY2VcbiAgICAgIC8vIFRoaXMgd2lsbCBub3QgaGFybSB3aGVuIHRoZSBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjYWxsZWQgd2l0aCBuZXcgYXMgdGhlIHJldHVybmVkIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgY29uc3RyLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIGNvbnN0ci5zdXBlciA9IHN1cGVyUHJvdG87XG4gICAgY29uc3RyLmV4dGVuZCA9IHRoaXMuZXh0ZW5kO1xuXG4gICAgcmV0dXJuIGNvbnN0cjtcbiAgfVxuXG4gIC8vIFZhcmlhYmxlIGFyZ3VtZW50IGxpc3QgY2xvbmVzIGFyZ3MgPiAwIGludG8gYXJnc1swXSBhbmQgcmV0cnVucyBtb2RpZmllZCBhcmdzWzBdXG4gIGZ1bmN0aW9uIGNsb25lRGVmaW5pdGlvbnMoKSB7XG4gICAgdmFyIGFyZ3MgPSBsaXN0VG9BcnJheShhcmd1bWVudHMpO1xuICAgIHZhciB0YXJnZXQgPSBhcmdzWzBdO1xuXG4gICAgYXJncy5zcGxpY2UoMSwgYXJncy5sZW5ndGggLSAxKS5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0IGluIHRhcmdldCB3ZSBkZWxldGUgaXQgZmlyc3RcbiAgICAgICAgZGVsZXRlIHRhcmdldFtwcm9wTmFtZV07XG4gICAgICAgIC8vIERlZmluZSB0aGUgcHJvcGVydHkgd2l0aCB0aGUgZGVzY3JpcHRvciBmcm9tIHNvdXJjZVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wTmFtZSxcbiAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgcHJvcE5hbWUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIENoYXJ0aXN0LkNsYXNzID0ge1xuICAgIGV4dGVuZDogZXh0ZW5kLFxuICAgIGNsb25lRGVmaW5pdGlvbnM6IGNsb25lRGVmaW5pdGlvbnNcbiAgfTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogQmFzZSBmb3IgYWxsIGNoYXJ0IHR5cGVzLiBUaGUgbWV0aG9kcyBpbiBDaGFydGlzdC5CYXNlIGFyZSBpbmhlcml0ZWQgdG8gYWxsIGNoYXJ0IHR5cGVzLlxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuQmFzZVxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVE9ETzogQ3VycmVudGx5IHdlIG5lZWQgdG8gcmUtZHJhdyB0aGUgY2hhcnQgb24gd2luZG93IHJlc2l6ZS4gVGhpcyBpcyB1c3VhbGx5IHZlcnkgYmFkIGFuZCB3aWxsIGFmZmVjdCBwZXJmb3JtYW5jZS5cbiAgLy8gVGhpcyBpcyBkb25lIGJlY2F1c2Ugd2UgY2FuJ3Qgd29yayB3aXRoIHJlbGF0aXZlIGNvb3JkaW5hdGVzIHdoZW4gZHJhd2luZyB0aGUgY2hhcnQgYmVjYXVzZSBTVkcgUGF0aCBkb2VzIG5vdFxuICAvLyB3b3JrIHdpdGggcmVsYXRpdmUgcG9zaXRpb25zIHlldC4gV2UgbmVlZCB0byBjaGVjayBpZiB3ZSBjYW4gZG8gYSB2aWV3Qm94IGhhY2sgdG8gc3dpdGNoIHRvIHBlcmNlbnRhZ2UuXG4gIC8vIFNlZSBodHRwOi8vbW96aWxsYS42NTA2Lm43Lm5hYmJsZS5jb20vU3BlY3lmaW5nLXBhdGhzLXdpdGgtcGVyY2VudGFnZXMtdW5pdC10ZDI0NzQ3NC5odG1sXG4gIC8vIFVwZGF0ZTogY2FuIGJlIGRvbmUgdXNpbmcgdGhlIGFib3ZlIG1ldGhvZCB0ZXN0ZWQgaGVyZTogaHR0cDovL2NvZGVwZW4uaW8vZ2lvbmt1bnovcGVuL0tEdkxqXG4gIC8vIFRoZSBwcm9ibGVtIGlzIHdpdGggdGhlIGxhYmVsIG9mZnNldHMgdGhhdCBjYW4ndCBiZSBjb252ZXJ0ZWQgaW50byBwZXJjZW50YWdlIGFuZCBhZmZlY3RpbmcgdGhlIGNoYXJ0IGNvbnRhaW5lclxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY2hhcnQgd2hpY2ggY3VycmVudGx5IGRvZXMgYSBmdWxsIHJlY29uc3RydWN0aW9uIG9mIHRoZSBTVkcgRE9NXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gT3B0aW9uYWwgZGF0YSB5b3UnZCBsaWtlIHRvIHNldCBmb3IgdGhlIGNoYXJ0IGJlZm9yZSBpdCB3aWxsIHVwZGF0ZS4gSWYgbm90IHNwZWNpZmllZCB0aGUgdXBkYXRlIG1ldGhvZCB3aWxsIHVzZSB0aGUgZGF0YSB0aGF0IGlzIGFscmVhZHkgY29uZmlndXJlZCB3aXRoIHRoZSBjaGFydC5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBvcHRpb25zIHlvdSdkIGxpa2UgdG8gYWRkIHRvIHRoZSBwcmV2aW91cyBvcHRpb25zIGZvciB0aGUgY2hhcnQgYmVmb3JlIGl0IHdpbGwgdXBkYXRlLiBJZiBub3Qgc3BlY2lmaWVkIHRoZSB1cGRhdGUgbWV0aG9kIHdpbGwgdXNlIHRoZSBvcHRpb25zIHRoYXQgaGF2ZSBiZWVuIGFscmVhZHkgY29uZmlndXJlZCB3aXRoIHRoZSBjaGFydC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3ZlcnJpZGVdIElmIHNldCB0byB0cnVlLCB0aGUgcGFzc2VkIG9wdGlvbnMgd2lsbCBiZSB1c2VkIHRvIGV4dGVuZCB0aGUgb3B0aW9ucyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuIE90aGVyd2lzZSB0aGUgY2hhcnQgZGVmYXVsdCBvcHRpb25zIHdpbGwgYmUgdXNlZCBhcyB0aGUgYmFzZVxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlKGRhdGEsIG9wdGlvbnMsIG92ZXJyaWRlKSB7XG4gICAgaWYoZGF0YSkge1xuICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgIC8vIEV2ZW50IGZvciBkYXRhIHRyYW5zZm9ybWF0aW9uIHRoYXQgYWxsb3dzIHRvIG1hbmlwdWxhdGUgdGhlIGRhdGEgYmVmb3JlIGl0IGdldHMgcmVuZGVyZWQgaW4gdGhlIGNoYXJ0c1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZGF0YScsIHtcbiAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYob3B0aW9ucykge1xuICAgICAgdGhpcy5vcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvdmVycmlkZSA/IHRoaXMub3B0aW9ucyA6IHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAvLyBJZiBjaGFydGlzdCB3YXMgbm90IGluaXRpYWxpemVkIHlldCwgd2UganVzdCBzZXQgdGhlIG9wdGlvbnMgYW5kIGxlYXZlIHRoZSByZXN0IHRvIHRoZSBpbml0aWFsaXphdGlvblxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIHJlLWNyZWF0ZSB0aGUgb3B0aW9uc1Byb3ZpZGVyIGF0IHRoaXMgcG9pbnRcbiAgICAgIGlmKCF0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zUHJvdmlkZXIucmVtb3ZlTWVkaWFRdWVyeUxpc3RlbmVycygpO1xuICAgICAgICB0aGlzLm9wdGlvbnNQcm92aWRlciA9IENoYXJ0aXN0Lm9wdGlvbnNQcm92aWRlcih0aGlzLm9wdGlvbnMsIHRoaXMucmVzcG9uc2l2ZU9wdGlvbnMsIHRoaXMuZXZlbnRFbWl0dGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbmx5IHJlLWNyZWF0ZWQgdGhlIGNoYXJ0IGlmIGl0IGhhcyBiZWVuIGluaXRpYWxpemVkIHlldFxuICAgIGlmKCF0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ2hhcnQodGhpcy5vcHRpb25zUHJvdmlkZXIuZ2V0Q3VycmVudE9wdGlvbnMoKSk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBjaGFydCBvYmplY3QgdG8gY2hhaW4gdXAgY2FsbHNcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIG9uIHRoZSBBUEkgb2JqZWN0IG9mIGVhY2ggY2hhcnQgYW5kIHdpbGwgdW4tcmVnaXN0ZXIgYWxsIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQgdG8gb3RoZXIgY29tcG9uZW50cy4gVGhpcyBjdXJyZW50bHkgaW5jbHVkZXMgYSB3aW5kb3cucmVzaXplIGxpc3RlbmVyIGFzIHdlbGwgYXMgbWVkaWEgcXVlcnkgbGlzdGVuZXJzIGlmIGFueSByZXNwb25zaXZlIG9wdGlvbnMgaGF2ZSBiZWVuIHByb3ZpZGVkLiBVc2UgdGhpcyBmdW5jdGlvbiBpZiB5b3UgbmVlZCB0byBkZXN0cm95IGFuZCByZWNyZWF0ZSBDaGFydGlzdCBjaGFydHMgZHluYW1pY2FsbHkuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXNlXG4gICAqL1xuICBmdW5jdGlvbiBkZXRhY2goKSB7XG4gICAgLy8gT25seSBkZXRhY2ggaWYgaW5pdGlhbGl6YXRpb24gYWxyZWFkeSBvY2N1cnJlZCBvbiB0aGlzIGNoYXJ0LiBJZiB0aGlzIGNoYXJ0IHN0aWxsIGhhc24ndCBpbml0aWFsaXplZCAodGhlcmVmb3JlXG4gICAgLy8gdGhlIGluaXRpYWxpemF0aW9uVGltZW91dElkIGlzIHN0aWxsIGEgdmFsaWQgdGltZW91dCByZWZlcmVuY2UsIHdlIHdpbGwgY2xlYXIgdGhlIHRpbWVvdXRcbiAgICBpZighdGhpcy5pbml0aWFsaXplVGltZW91dElkKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemVMaXN0ZW5lcik7XG4gICAgICB0aGlzLm9wdGlvbnNQcm92aWRlci5yZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5pbml0aWFsaXplVGltZW91dElkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byByZWdpc3RlciBldmVudCBoYW5kbGVycy4gVGhlIGhhbmRsZXIgY2FsbGJhY2tzIGFyZSBzeW5jaHJvbm91cyBhbmQgd2lsbCBydW4gaW4gdGhlIG1haW4gdGhyZWFkIHJhdGhlciB0aGFuIHRoZSBldmVudCBsb29wLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuIENoZWNrIHRoZSBleGFtcGxlcyBmb3Igc3VwcG9ydGVkIGV2ZW50cy5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBUaGUgaGFuZGxlciBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gYW4gZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSB3YXMgZW1pdHRlZC4gVGhpcyBmdW5jdGlvbiB3aWxsIHJlY2VpdmUgYSBkYXRhIGFyZ3VtZW50IHdoaWNoIGNvbnRhaW5zIGV2ZW50IGRhdGEuIFNlZSB0aGUgZXhhbXBsZSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgZnVuY3Rpb24gb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmV2ZW50RW1pdHRlci5hZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHVuLXJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzLiBJZiB0aGUgaGFuZGxlciBmdW5jdGlvbiBwYXJhbWV0ZXIgaXMgb21pdHRlZCBhbGwgaGFuZGxlcnMgZm9yIHRoZSBnaXZlbiBldmVudCB3aWxsIGJlIHVuLXJlZ2lzdGVyZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudCBmb3Igd2hpY2ggYSBoYW5kbGVyIHNob3VsZCBiZSByZW1vdmVkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSBUaGUgaGFuZGxlciBmdW5jdGlvbiB0aGF0IHRoYXQgd2FzIHByZXZpb3VzbHkgdXNlZCB0byByZWdpc3RlciBhIG5ldyBldmVudCBoYW5kbGVyLiBUaGlzIGhhbmRsZXIgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50IGhhbmRsZXIgbGlzdC4gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgb21pdHRlZCB0aGVuIGFsbCBldmVudCBoYW5kbGVycyBmb3IgdGhlIGdpdmVuIGV2ZW50IGFyZSByZW1vdmVkIGZyb20gdGhlIGxpc3QuXG4gICAqL1xuICBmdW5jdGlvbiBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmV2ZW50RW1pdHRlci5yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAvLyBBZGQgd2luZG93IHJlc2l6ZSBsaXN0ZW5lciB0aGF0IHJlLWNyZWF0ZXMgdGhlIGNoYXJ0XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplTGlzdGVuZXIpO1xuXG4gICAgLy8gT2J0YWluIGN1cnJlbnQgb3B0aW9ucyBiYXNlZCBvbiBtYXRjaGluZyBtZWRpYSBxdWVyaWVzIChpZiByZXNwb25zaXZlIG9wdGlvbnMgYXJlIGdpdmVuKVxuICAgIC8vIFRoaXMgd2lsbCBhbHNvIHJlZ2lzdGVyIGEgbGlzdGVuZXIgdGhhdCBpcyByZS1jcmVhdGluZyB0aGUgY2hhcnQgYmFzZWQgb24gbWVkaWEgY2hhbmdlc1xuICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyID0gQ2hhcnRpc3Qub3B0aW9uc1Byb3ZpZGVyKHRoaXMub3B0aW9ucywgdGhpcy5yZXNwb25zaXZlT3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuICAgIC8vIFJlZ2lzdGVyIG9wdGlvbnMgY2hhbmdlIGxpc3RlbmVyIHRoYXQgd2lsbCB0cmlnZ2VyIGEgY2hhcnQgdXBkYXRlXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuYWRkRXZlbnRIYW5kbGVyKCdvcHRpb25zQ2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gQmVmb3JlIHRoZSBmaXJzdCBjaGFydCBjcmVhdGlvbiB3ZSBuZWVkIHRvIHJlZ2lzdGVyIHVzIHdpdGggYWxsIHBsdWdpbnMgdGhhdCBhcmUgY29uZmlndXJlZFxuICAgIC8vIEluaXRpYWxpemUgYWxsIHJlbGV2YW50IHBsdWdpbnMgd2l0aCBvdXIgY2hhcnQgb2JqZWN0IGFuZCB0aGUgcGx1Z2luIG9wdGlvbnMgc3BlY2lmaWVkIGluIHRoZSBjb25maWdcbiAgICBpZih0aGlzLm9wdGlvbnMucGx1Z2lucykge1xuICAgICAgdGhpcy5vcHRpb25zLnBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbihwbHVnaW4pIHtcbiAgICAgICAgaWYocGx1Z2luIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICBwbHVnaW5bMF0odGhpcywgcGx1Z2luWzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwbHVnaW4odGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLy8gRXZlbnQgZm9yIGRhdGEgdHJhbnNmb3JtYXRpb24gdGhhdCBhbGxvd3MgdG8gbWFuaXB1bGF0ZSB0aGUgZGF0YSBiZWZvcmUgaXQgZ2V0cyByZW5kZXJlZCBpbiB0aGUgY2hhcnRzXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZGF0YScsIHtcbiAgICAgIHR5cGU6ICdpbml0aWFsJyxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBmaXJzdCBjaGFydFxuICAgIHRoaXMuY3JlYXRlQ2hhcnQodGhpcy5vcHRpb25zUHJvdmlkZXIuZ2V0Q3VycmVudE9wdGlvbnMoKSk7XG5cbiAgICAvLyBBcyBjaGFydCBpcyBpbml0aWFsaXplZCBmcm9tIHRoZSBldmVudCBsb29wIG5vdyB3ZSBjYW4gcmVzZXQgb3VyIHRpbWVvdXQgcmVmZXJlbmNlXG4gICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQgaWYgdGhlIGNoYXJ0IGdldHMgaW5pdGlhbGl6ZWQgb24gdGhlIHNhbWUgZWxlbWVudCB0d2ljZVxuICAgIHRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvciBvZiBjaGFydCBiYXNlIGNsYXNzLlxuICAgKlxuICAgKiBAcGFyYW0gcXVlcnlcbiAgICogQHBhcmFtIGRhdGFcbiAgICogQHBhcmFtIGRlZmF1bHRPcHRpb25zXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIEBwYXJhbSByZXNwb25zaXZlT3B0aW9uc1xuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIEJhc2UocXVlcnksIGRhdGEsIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucykge1xuICAgIHRoaXMuY29udGFpbmVyID0gQ2hhcnRpc3QucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnJlc3BvbnNpdmVPcHRpb25zID0gcmVzcG9uc2l2ZU9wdGlvbnM7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXIgPSBDaGFydGlzdC5FdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCA9IENoYXJ0aXN0LlN2Zy5pc1N1cHBvcnRlZCgnRXh0ZW5zaWJpbGl0eScpO1xuICAgIHRoaXMuc3VwcG9ydHNBbmltYXRpb25zID0gQ2hhcnRpc3QuU3ZnLmlzU3VwcG9ydGVkKCdBbmltYXRpb25FdmVudHNBdHRyaWJ1dGUnKTtcbiAgICB0aGlzLnJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoKXtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgaWYodGhpcy5jb250YWluZXIpIHtcbiAgICAgIC8vIElmIGNoYXJ0aXN0IHdhcyBhbHJlYWR5IGluaXRpYWxpemVkIGluIHRoaXMgY29udGFpbmVyIHdlIGFyZSBkZXRhY2hpbmcgYWxsIGV2ZW50IGxpc3RlbmVycyBmaXJzdFxuICAgICAgaWYodGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLl9fY2hhcnRpc3RfXy5kZXRhY2goKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fID0gdGhpcztcbiAgICB9XG5cbiAgICAvLyBVc2luZyBldmVudCBsb29wIGZvciBmaXJzdCBkcmF3IHRvIG1ha2UgaXQgcG9zc2libGUgdG8gcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIGluIHRoZSBzYW1lIGNhbGwgc3RhY2sgd2hlcmVcbiAgICAvLyB0aGUgY2hhcnQgd2FzIGNyZWF0ZWQuXG4gICAgdGhpcy5pbml0aWFsaXplVGltZW91dElkID0gc2V0VGltZW91dChpbml0aWFsaXplLmJpbmQodGhpcyksIDApO1xuICB9XG5cbiAgLy8gQ3JlYXRpbmcgdGhlIGNoYXJ0IGJhc2UgY2xhc3NcbiAgQ2hhcnRpc3QuQmFzZSA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IEJhc2UsXG4gICAgb3B0aW9uc1Byb3ZpZGVyOiB1bmRlZmluZWQsXG4gICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgc3ZnOiB1bmRlZmluZWQsXG4gICAgZXZlbnRFbWl0dGVyOiB1bmRlZmluZWQsXG4gICAgY3JlYXRlQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXNlIGNoYXJ0IHR5cGUgY2FuXFwndCBiZSBpbnN0YW50aWF0ZWQhJyk7XG4gICAgfSxcbiAgICB1cGRhdGU6IHVwZGF0ZSxcbiAgICBkZXRhY2g6IGRldGFjaCxcbiAgICBvbjogb24sXG4gICAgb2ZmOiBvZmYsXG4gICAgdmVyc2lvbjogQ2hhcnRpc3QudmVyc2lvbixcbiAgICBzdXBwb3J0c0ZvcmVpZ25PYmplY3Q6IGZhbHNlXG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBDaGFydGlzdCBTVkcgbW9kdWxlIGZvciBzaW1wbGUgU1ZHIERPTSBhYnN0cmFjdGlvblxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuU3ZnXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgc3ZnTnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLFxuICAgIHhtbE5zID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvJyxcbiAgICB4aHRtbE5zID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xuXG4gIENoYXJ0aXN0LnhtbE5zID0ge1xuICAgIHF1YWxpZmllZE5hbWU6ICd4bWxuczpjdCcsXG4gICAgcHJlZml4OiAnY3QnLFxuICAgIHVyaTogJ2h0dHA6Ly9naW9ua3Vuei5naXRodWIuY29tL2NoYXJ0aXN0LWpzL2N0J1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFydGlzdC5TdmcgY3JlYXRlcyBhIG5ldyBTVkcgb2JqZWN0IHdyYXBwZXIgd2l0aCBhIHN0YXJ0aW5nIGVsZW1lbnQuIFlvdSBjYW4gdXNlIHRoZSB3cmFwcGVyIHRvIGZsdWVudGx5IGNyZWF0ZSBzdWItZWxlbWVudHMgYW5kIG1vZGlmeSB0aGVtLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBTVkcgZWxlbWVudCB0byBjcmVhdGUgb3IgYW4gU1ZHIGRvbSBlbGVtZW50IHdoaWNoIHNob3VsZCBiZSB3cmFwcGVkIGludG8gQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIEFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGFkZGVkIGFzIGF0dHJpYnV0ZXMgdG8gdGhlIFNWRyBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgVGhpcyBjbGFzcyBvciBjbGFzcyBsaXN0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNWRyBlbGVtZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJlbnQgVGhlIHBhcmVudCBTVkcgd3JhcHBlciBvYmplY3Qgd2hlcmUgdGhpcyBuZXdseSBjcmVhdGVkIHdyYXBwZXIgYW5kIGl0J3MgZWxlbWVudCB3aWxsIGJlIGF0dGFjaGVkIHRvIGFzIGNoaWxkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5zZXJ0Rmlyc3QgSWYgdGhpcyBwYXJhbSBpcyBzZXQgdG8gdHJ1ZSBpbiBjb25qdW5jdGlvbiB3aXRoIGEgcGFyZW50IGVsZW1lbnQgdGhlIG5ld2x5IGNyZWF0ZWQgZWxlbWVudCB3aWxsIGJlIGFkZGVkIGFzIGZpcnN0IGNoaWxkIGVsZW1lbnQgaW4gdGhlIHBhcmVudCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBTdmcobmFtZSwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBwYXJlbnQsIGluc2VydEZpcnN0KSB7XG4gICAgLy8gSWYgU3ZnIGlzIGdldHRpbmcgY2FsbGVkIHdpdGggYW4gU1ZHIGVsZW1lbnQgd2UganVzdCByZXR1cm4gdGhlIHdyYXBwZXJcbiAgICBpZihuYW1lIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgdGhpcy5fbm9kZSA9IG5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoc3ZnTnMsIG5hbWUpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIGFuIFNWRyBlbGVtZW50IGNyZWF0ZWQgdGhlbiBjdXN0b20gbmFtZXNwYWNlXG4gICAgICBpZihuYW1lID09PSAnc3ZnJykge1xuICAgICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZU5TKHhtbE5zLCBDaGFydGlzdC54bWxOcy5xdWFsaWZpZWROYW1lLCBDaGFydGlzdC54bWxOcy51cmkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuYXR0cihhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBpZihjbGFzc05hbWUpIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB9XG5cbiAgICBpZihwYXJlbnQpIHtcbiAgICAgIGlmIChpbnNlcnRGaXJzdCAmJiBwYXJlbnQuX25vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICBwYXJlbnQuX25vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuX25vZGUsIHBhcmVudC5fbm9kZS5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudC5fbm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9ub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGF0dHJpYnV0ZXMgb24gdGhlIGN1cnJlbnQgU1ZHIGVsZW1lbnQgb2YgdGhlIHdyYXBwZXIgeW91J3JlIGN1cnJlbnRseSB3b3JraW5nIG9uLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gYXR0cmlidXRlcyBBbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhZGRlZCBhcyBhdHRyaWJ1dGVzIHRvIHRoZSBTVkcgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWQuIEF0dHJpYnV0ZXMgd2l0aCB1bmRlZmluZWQgdmFsdWVzIHdpbGwgbm90IGJlIGFkZGVkLiBJZiB0aGlzIHBhcmFtZXRlciBpcyBhIFN0cmluZyB0aGVuIHRoZSBmdW5jdGlvbiBpcyB1c2VkIGFzIGEgZ2V0dGVyIGFuZCB3aWxsIHJldHVybiB0aGUgYXR0cmlidXRlIHZhbHVlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbnMgSWYgc3BlY2lmaWVkLCB0aGUgYXR0cmlidXRlcyB3aWxsIGJlIHNldCBhcyBuYW1lc3BhY2UgYXR0cmlidXRlcyB3aXRoIG5zIGFzIHByZWZpeC5cbiAgICogQHJldHVybiB7T2JqZWN0fFN0cmluZ30gVGhlIGN1cnJlbnQgd3JhcHBlciBvYmplY3Qgd2lsbCBiZSByZXR1cm5lZCBzbyBpdCBjYW4gYmUgdXNlZCBmb3IgY2hhaW5pbmcgb3IgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpZiB1c2VkIGFzIGdldHRlciBmdW5jdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGF0dHIoYXR0cmlidXRlcywgbnMpIHtcbiAgICBpZih0eXBlb2YgYXR0cmlidXRlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmKG5zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZU5TKG5zLCBhdHRyaWJ1dGVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgLy8gSWYgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpcyB1bmRlZmluZWQgd2UgY2FuIHNraXAgdGhpcyBvbmVcbiAgICAgIGlmKGF0dHJpYnV0ZXNba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYobnMpIHtcbiAgICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGVOUyhucywgW0NoYXJ0aXN0LnhtbE5zLnByZWZpeCwgJzonLCBrZXldLmpvaW4oJycpLCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgU1ZHIGVsZW1lbnQgd2hvc2Ugd3JhcHBlciBvYmplY3Qgd2lsbCBiZSBzZWxlY3RlZCBmb3IgZnVydGhlciBvcGVyYXRpb25zLiBUaGlzIHdheSB5b3UgY2FuIGFsc28gY3JlYXRlIG5lc3RlZCBncm91cHMgZWFzaWx5LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBTVkcgZWxlbWVudCB0aGF0IHNob3VsZCBiZSBjcmVhdGVkIGFzIGNoaWxkIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50IHdyYXBwZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IFthdHRyaWJ1dGVzXSBBbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhZGRlZCBhcyBhdHRyaWJ1dGVzIHRvIHRoZSBTVkcgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWQuIEF0dHJpYnV0ZXMgd2l0aCB1bmRlZmluZWQgdmFsdWVzIHdpbGwgbm90IGJlIGFkZGVkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2NsYXNzTmFtZV0gVGhpcyBjbGFzcyBvciBjbGFzcyBsaXN0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNWRyBlbGVtZW50XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2luc2VydEZpcnN0XSBJZiB0aGlzIHBhcmFtIGlzIHNldCB0byB0cnVlIGluIGNvbmp1bmN0aW9uIHdpdGggYSBwYXJlbnQgZWxlbWVudCB0aGUgbmV3bHkgY3JlYXRlZCBlbGVtZW50IHdpbGwgYmUgYWRkZWQgYXMgZmlyc3QgY2hpbGQgZWxlbWVudCBpbiB0aGUgcGFyZW50IGVsZW1lbnRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBSZXR1cm5zIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIgb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gbW9kaWZ5IHRoZSBjb250YWluaW5nIFNWRyBkYXRhXG4gICAqL1xuICBmdW5jdGlvbiBlbGVtKG5hbWUsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgaW5zZXJ0Rmlyc3QpIHtcbiAgICByZXR1cm4gbmV3IENoYXJ0aXN0LlN2ZyhuYW1lLCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIHRoaXMsIGluc2VydEZpcnN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwYXJlbnQgQ2hhcnRpc3QuU1ZHIHdyYXBwZXIgb2JqZWN0XG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBSZXR1cm5zIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIgYXJvdW5kIHRoZSBwYXJlbnQgbm9kZSBvZiB0aGUgY3VycmVudCBub2RlLiBJZiB0aGUgcGFyZW50IG5vZGUgaXMgbm90IGV4aXN0aW5nIG9yIGl0J3Mgbm90IGFuIFNWRyBub2RlIHRoZW4gdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBudWxsLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlLnBhcmVudE5vZGUgaW5zdGFuY2VvZiBTVkdFbGVtZW50ID8gbmV3IENoYXJ0aXN0LlN2Zyh0aGlzLl9ub2RlLnBhcmVudE5vZGUpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIgYXJvdW5kIHRoZSByb290IFNWRyBlbGVtZW50IG9mIHRoZSBjdXJyZW50IHRyZWUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgcm9vdCBTVkcgZWxlbWVudCB3cmFwcGVkIGluIGEgQ2hhcnRpc3QuU3ZnIGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIHJvb3QoKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9ub2RlO1xuICAgIHdoaWxlKG5vZGUubm9kZU5hbWUgIT09ICdzdmcnKSB7XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENoYXJ0aXN0LlN2Zyhub2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBmaXJzdCBjaGlsZCBTVkcgZWxlbWVudCBvZiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgbWF0Y2hlcyBhIENTUyBzZWxlY3Rvci4gVGhlIHJldHVybmVkIG9iamVjdCBpcyBhIENoYXJ0aXN0LlN2ZyB3cmFwcGVyLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBBIENTUyBzZWxlY3RvciB0aGF0IGlzIHVzZWQgdG8gcXVlcnkgZm9yIGNoaWxkIFNWRyBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBTVkcgd3JhcHBlciBmb3IgdGhlIGVsZW1lbnQgZm91bmQgb3IgbnVsbCBpZiBubyBlbGVtZW50IHdhcyBmb3VuZFxuICAgKi9cbiAgZnVuY3Rpb24gcXVlcnlTZWxlY3RvcihzZWxlY3Rvcikge1xuICAgIHZhciBmb3VuZE5vZGUgPSB0aGlzLl9ub2RlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIHJldHVybiBmb3VuZE5vZGUgPyBuZXcgQ2hhcnRpc3QuU3ZnKGZvdW5kTm9kZSkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIGFsbCBjaGlsZCBTVkcgZWxlbWVudHMgb2YgdGhlIGN1cnJlbnQgZWxlbWVudCB0aGF0IG1hdGNoIGEgQ1NTIHNlbGVjdG9yLiBUaGUgcmV0dXJuZWQgb2JqZWN0IGlzIGEgQ2hhcnRpc3QuU3ZnLkxpc3Qgd3JhcHBlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgQSBDU1Mgc2VsZWN0b3IgdGhhdCBpcyB1c2VkIHRvIHF1ZXJ5IGZvciBjaGlsZCBTVkcgZWxlbWVudHNcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLkxpc3R9IFRoZSBTVkcgd3JhcHBlciBsaXN0IGZvciB0aGUgZWxlbWVudCBmb3VuZCBvciBudWxsIGlmIG5vIGVsZW1lbnQgd2FzIGZvdW5kXG4gICAqL1xuICBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSB7XG4gICAgdmFyIGZvdW5kTm9kZXMgPSB0aGlzLl9ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIHJldHVybiBmb3VuZE5vZGVzLmxlbmd0aCA/IG5ldyBDaGFydGlzdC5TdmcuTGlzdChmb3VuZE5vZGVzKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIGZvcmVpZ25PYmplY3QgKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9TVkcvRWxlbWVudC9mb3JlaWduT2JqZWN0KSB0aGF0IGFsbG93cyB0byBlbWJlZCBIVE1MIGNvbnRlbnQgaW50byBhIFNWRyBncmFwaGljLiBXaXRoIHRoZSBoZWxwIG9mIGZvcmVpZ25PYmplY3RzIHlvdSBjYW4gZW5hYmxlIHRoZSB1c2FnZSBvZiByZWd1bGFyIEhUTUwgZWxlbWVudHMgaW5zaWRlIG9mIFNWRyB3aGVyZSB0aGV5IGFyZSBzdWJqZWN0IGZvciBTVkcgcG9zaXRpb25pbmcgYW5kIHRyYW5zZm9ybWF0aW9uIGJ1dCB0aGUgQnJvd3NlciB3aWxsIHVzZSB0aGUgSFRNTCByZW5kZXJpbmcgY2FwYWJpbGl0aWVzIGZvciB0aGUgY29udGFpbmluZyBET00uXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtOb2RlfFN0cmluZ30gY29udGVudCBUaGUgRE9NIE5vZGUsIG9yIEhUTUwgc3RyaW5nIHRoYXQgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYSBET00gTm9kZSwgdGhhdCBpcyB0aGVuIHBsYWNlZCBpbnRvIGFuZCB3cmFwcGVkIGJ5IHRoZSBmb3JlaWduT2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbYXR0cmlidXRlc10gQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgZm9yZWlnbk9iamVjdCBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbY2xhc3NOYW1lXSBUaGlzIGNsYXNzIG9yIGNsYXNzIGxpc3Qgd2lsbCBiZSBhZGRlZCB0byB0aGUgU1ZHIGVsZW1lbnRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zZXJ0Rmlyc3RdIFNwZWNpZmllcyBpZiB0aGUgZm9yZWlnbk9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgYXMgZmlyc3QgY2hpbGRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBOZXcgd3JhcHBlciBvYmplY3QgdGhhdCB3cmFwcyB0aGUgZm9yZWlnbk9iamVjdCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBmb3JlaWduT2JqZWN0KGNvbnRlbnQsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgaW5zZXJ0Rmlyc3QpIHtcbiAgICAvLyBJZiBjb250ZW50IGlzIHN0cmluZyB0aGVuIHdlIGNvbnZlcnQgaXQgdG8gRE9NXG4gICAgLy8gVE9ETzogSGFuZGxlIGNhc2Ugd2hlcmUgY29udGVudCBpcyBub3QgYSBzdHJpbmcgbm9yIGEgRE9NIE5vZGVcbiAgICBpZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgICAgY29udGVudCA9IGNvbnRhaW5lci5maXJzdENoaWxkO1xuICAgIH1cblxuICAgIC8vIEFkZGluZyBuYW1lc3BhY2UgdG8gY29udGVudCBlbGVtZW50XG4gICAgY29udGVudC5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgeGh0bWxOcyk7XG5cbiAgICAvLyBDcmVhdGluZyB0aGUgZm9yZWlnbk9iamVjdCB3aXRob3V0IHJlcXVpcmVkIGV4dGVuc2lvbiBhdHRyaWJ1dGUgKGFzIGRlc2NyaWJlZCBoZXJlXG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2V4dGVuZC5odG1sI0ZvcmVpZ25PYmplY3RFbGVtZW50KVxuICAgIHZhciBmbk9iaiA9IHRoaXMuZWxlbSgnZm9yZWlnbk9iamVjdCcsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgaW5zZXJ0Rmlyc3QpO1xuXG4gICAgLy8gQWRkIGNvbnRlbnQgdG8gZm9yZWlnbk9iamVjdEVsZW1lbnRcbiAgICBmbk9iai5fbm9kZS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIHJldHVybiBmbk9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgbmV3IHRleHQgZWxlbWVudCB0byB0aGUgY3VycmVudCBDaGFydGlzdC5Tdmcgd3JhcHBlci5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdCBUaGUgdGV4dCB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgdGV4dCBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBzYW1lIHdyYXBwZXIgb2JqZWN0IHRoYXQgd2FzIHVzZWQgdG8gYWRkIHRoZSBuZXdseSBjcmVhdGVkIGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIHRleHQodCkge1xuICAgIHRoaXMuX25vZGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodCkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgY2xlYXIgYWxsIGNoaWxkIG5vZGVzIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgb2JqZWN0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHNhbWUgd3JhcHBlciBvYmplY3QgdGhhdCBnb3QgZW1wdGllZFxuICAgKi9cbiAgZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgd2hpbGUgKHRoaXMuX25vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5fbm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9ub2RlLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgY2F1c2UgdGhlIGN1cnJlbnQgd3JhcHBlciB0byByZW1vdmUgaXRzZWxmIGZyb20gaXRzIHBhcmVudCB3cmFwcGVyLiBVc2UgdGhpcyBtZXRob2QgaWYgeW91J2QgbGlrZSB0byBnZXQgcmlkIG9mIGFuIGVsZW1lbnQgaW4gYSBnaXZlbiBET00gc3RydWN0dXJlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHBhcmVudCB3cmFwcGVyIG9iamVjdCBvZiB0aGUgZWxlbWVudCB0aGF0IGdvdCByZW1vdmVkXG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgdGhpcy5fbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX25vZGUpO1xuICAgIHJldHVybiB0aGlzLnBhcmVudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgcmVwbGFjZSB0aGUgZWxlbWVudCB3aXRoIGEgbmV3IGVsZW1lbnQgdGhhdCBjYW4gYmUgY3JlYXRlZCBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IERPTS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge0NoYXJ0aXN0LlN2Z30gbmV3RWxlbWVudCBUaGUgbmV3IENoYXJ0aXN0LlN2ZyBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSB0aGUgY3VycmVudCB3cmFwcGVyIG9iamVjdFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBuZXcgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZShuZXdFbGVtZW50KSB7XG4gICAgdGhpcy5fbm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdFbGVtZW50Ll9ub2RlLCB0aGlzLl9ub2RlKTtcbiAgICByZXR1cm4gbmV3RWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIGFwcGVuZCBhbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IGVsZW1lbnQgYXMgYSBjaGlsZC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge0NoYXJ0aXN0LlN2Z30gZWxlbWVudCBUaGUgQ2hhcnRpc3QuU3ZnIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgYWRkZWQgYXMgYSBjaGlsZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpbnNlcnRGaXJzdF0gU3BlY2lmaWVzIGlmIHRoZSBlbGVtZW50IHNob3VsZCBiZSBpbnNlcnRlZCBhcyBmaXJzdCBjaGlsZFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBhcHBlbmRlZCBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIGFwcGVuZChlbGVtZW50LCBpbnNlcnRGaXJzdCkge1xuICAgIGlmKGluc2VydEZpcnN0ICYmIHRoaXMuX25vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5fbm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudC5fbm9kZSwgdGhpcy5fbm9kZS5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbm9kZS5hcHBlbmRDaGlsZChlbGVtZW50Ll9ub2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNsYXNzIG5hbWVzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIHRoZSBjdXJyZW50IHdyYXBwZXIgZWxlbWVudC4gVGhpcyBtZXRob2QgY2FuIG5vdCBiZSBjaGFpbmVkIGZ1cnRoZXIuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7QXJyYXl9IEEgbGlzdCBvZiBjbGFzc2VzIG9yIGFuIGVtcHR5IGFycmF5IGlmIHRoZXJlIGFyZSBubyBjbGFzc2VzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIGNsYXNzZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpID8gdGhpcy5fbm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykudHJpbSgpLnNwbGl0KC9cXHMrLykgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG9uZSBvciBhIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgdG8gdGhlIGN1cnJlbnQgZWxlbWVudCBhbmQgZW5zdXJlcyB0aGUgY2xhc3NlcyBhcmUgb25seSBleGlzdGluZyBvbmNlLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lcyBBIHdoaXRlIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gYWRkQ2xhc3MobmFtZXMpIHtcbiAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLFxuICAgICAgdGhpcy5jbGFzc2VzKHRoaXMuX25vZGUpXG4gICAgICAgIC5jb25jYXQobmFtZXMudHJpbSgpLnNwbGl0KC9cXHMrLykpXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZWxlbSwgcG9zLCBzZWxmKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihlbGVtKSA9PT0gcG9zO1xuICAgICAgICB9KS5qb2luKCcgJylcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBvbmUgb3IgYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzc2VzIGZyb20gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXMgQSB3aGl0ZSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzcyBuYW1lc1xuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKG5hbWVzKSB7XG4gICAgdmFyIHJlbW92ZWRDbGFzc2VzID0gbmFtZXMudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG5cbiAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLmNsYXNzZXModGhpcy5fbm9kZSkuZmlsdGVyKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiByZW1vdmVkQ2xhc3Nlcy5pbmRleE9mKG5hbWUpID09PSAtMTtcbiAgICB9KS5qb2luKCcgJykpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgY2xhc3NlcyBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmVBbGxDbGFzc2VzKCkge1xuICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsICcnKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFwiU2F2ZVwiIHdheSB0byBnZXQgcHJvcGVydHkgdmFsdWUgZnJvbSBzdmcgQm91bmRpbmdCb3guXG4gICAqIFRoaXMgaXMgYSB3b3JrYXJvdW5kLiBGaXJlZm94IHRocm93cyBhbiBOU19FUlJPUl9GQUlMVVJFIGVycm9yIGlmIGdldEJCb3goKSBpcyBjYWxsZWQgb24gYW4gaW52aXNpYmxlIG5vZGUuXG4gICAqIFNlZSBbTlNfRVJST1JfRkFJTFVSRTogQ29tcG9uZW50IHJldHVybmVkIGZhaWx1cmUgY29kZTogMHg4MDAwNDAwNV0oaHR0cDovL2pzZmlkZGxlLm5ldC9zeW0zdHJpL2tXV0RLLylcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IG5vZGUgVGhlIHN2ZyBub2RlIHRvXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wIFRoZSBwcm9wZXJ0eSB0byBmZXRjaCAoZXguOiBoZWlnaHQsIHdpZHRoLCAuLi4pXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gYmJveCBwcm9wZXJ0eVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0QkJveFByb3BlcnR5KG5vZGUsIHByb3ApIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5vZGUuZ2V0QkJveCgpW3Byb3BdO1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBlbGVtZW50IGhlaWdodCB3aXRoIGZhbGxiYWNrIHRvIHN2ZyBCb3VuZGluZ0JveCBvciBwYXJlbnQgY29udGFpbmVyIGRpbWVuc2lvbnM6XG4gICAqIFNlZSBbYnVnemlsbGEubW96aWxsYS5vcmddKGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTUzMDk4NSlcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBlbGVtZW50cyBoZWlnaHQgaW4gcGl4ZWxzXG4gICAqL1xuICBmdW5jdGlvbiBoZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vZGUuY2xpZW50SGVpZ2h0IHx8IE1hdGgucm91bmQoZ2V0QkJveFByb3BlcnR5KHRoaXMuX25vZGUsICdoZWlnaHQnKSkgfHwgdGhpcy5fbm9kZS5wYXJlbnROb2RlLmNsaWVudEhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZWxlbWVudCB3aWR0aCB3aXRoIGZhbGxiYWNrIHRvIHN2ZyBCb3VuZGluZ0JveCBvciBwYXJlbnQgY29udGFpbmVyIGRpbWVuc2lvbnM6XG4gICAqIFNlZSBbYnVnemlsbGEubW96aWxsYS5vcmddKGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTUzMDk4NSlcbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgZWxlbWVudHMgd2lkdGggaW4gcGl4ZWxzXG4gICAqL1xuICBmdW5jdGlvbiB3aWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZS5jbGllbnRXaWR0aCB8fCBNYXRoLnJvdW5kKGdldEJCb3hQcm9wZXJ0eSh0aGlzLl9ub2RlLCAnd2lkdGgnKSkgfHwgdGhpcy5fbm9kZS5wYXJlbnROb2RlLmNsaWVudFdpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBhbmltYXRlIGZ1bmN0aW9uIGxldHMgeW91IGFuaW1hdGUgdGhlIGN1cnJlbnQgZWxlbWVudCB3aXRoIFNNSUwgYW5pbWF0aW9ucy4gWW91IGNhbiBhZGQgYW5pbWF0aW9ucyBmb3IgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCB0aGUgc2FtZSB0aW1lIGJ5IHVzaW5nIGFuIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdC4gVGhpcyBvYmplY3Qgc2hvdWxkIGNvbnRhaW4gU01JTCBhbmltYXRpb24gYXR0cmlidXRlcy4gUGxlYXNlIHJlZmVyIHRvIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9hbmltYXRlLmh0bWwgZm9yIGEgZGV0YWlsZWQgc3BlY2lmaWNhdGlvbiBhYm91dCB0aGUgYXZhaWxhYmxlIGFuaW1hdGlvbiBhdHRyaWJ1dGVzLiBBZGRpdGlvbmFsbHkgYW4gZWFzaW5nIHByb3BlcnR5IGNhbiBiZSBwYXNzZWQgaW4gdGhlIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdC4gVGhpcyBjYW4gYmUgYSBzdHJpbmcgd2l0aCBhIG5hbWUgb2YgYW4gZWFzaW5nIGZ1bmN0aW9uIGluIGBDaGFydGlzdC5TdmcuRWFzaW5nYCBvciBhbiBhcnJheSB3aXRoIGZvdXIgbnVtYmVycyBzcGVjaWZ5aW5nIGEgY3ViaWMgQsOpemllciBjdXJ2ZS5cbiAgICogKipBbiBhbmltYXRpb25zIG9iamVjdCBjb3VsZCBsb29rIGxpa2UgdGhpczoqKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIGVsZW1lbnQuYW5pbWF0ZSh7XG4gICAqICAgb3BhY2l0eToge1xuICAgKiAgICAgZHVyOiAxMDAwLFxuICAgKiAgICAgZnJvbTogMCxcbiAgICogICAgIHRvOiAxXG4gICAqICAgfSxcbiAgICogICB4MToge1xuICAgKiAgICAgZHVyOiAnMTAwMG1zJyxcbiAgICogICAgIGZyb206IDEwMCxcbiAgICogICAgIHRvOiAyMDAsXG4gICAqICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhcnQnXG4gICAqICAgfSxcbiAgICogICB5MToge1xuICAgKiAgICAgZHVyOiAnMnMnLFxuICAgKiAgICAgZnJvbTogMCxcbiAgICogICAgIHRvOiAxMDBcbiAgICogICB9XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICogKipBdXRvbWF0aWMgdW5pdCBjb252ZXJzaW9uKipcbiAgICogRm9yIHRoZSBgZHVyYCBhbmQgdGhlIGBiZWdpbmAgYW5pbWF0ZSBhdHRyaWJ1dGUgeW91IGNhbiBhbHNvIG9taXQgYSB1bml0IGJ5IHBhc3NpbmcgYSBudW1iZXIuIFRoZSBudW1iZXIgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGNvbnZlcnRlZCB0byBtaWxsaSBzZWNvbmRzLlxuICAgKiAqKkd1aWRlZCBtb2RlKipcbiAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgU01JTCBhbmltYXRpb25zIHdpdGggb2Zmc2V0IHVzaW5nIHRoZSBgYmVnaW5gIGF0dHJpYnV0ZSBpcyB0aGF0IHRoZSBhdHRyaWJ1dGUgd2lsbCBrZWVwIGl0J3Mgb3JpZ2luYWwgdmFsdWUgdW50aWwgdGhlIGFuaW1hdGlvbiBzdGFydHMuIE1vc3RseSB0aGlzIGJlaGF2aW9yIGlzIG5vdCBkZXNpcmVkIGFzIHlvdSdkIGxpa2UgdG8gaGF2ZSB5b3VyIGVsZW1lbnQgYXR0cmlidXRlcyBhbHJlYWR5IGluaXRpYWxpemVkIHdpdGggdGhlIGFuaW1hdGlvbiBgZnJvbWAgdmFsdWUgZXZlbiBiZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHMuIEFsc28gaWYgeW91IGRvbid0IHNwZWNpZnkgYGZpbGw9XCJmcmVlemVcImAgb24gYW4gYW5pbWF0ZSBlbGVtZW50IG9yIGlmIHlvdSBkZWxldGUgdGhlIGFuaW1hdGlvbiBhZnRlciBpdCdzIGRvbmUgKHdoaWNoIGlzIGRvbmUgaW4gZ3VpZGVkIG1vZGUpIHRoZSBhdHRyaWJ1dGUgd2lsbCBzd2l0Y2ggYmFjayB0byB0aGUgaW5pdGlhbCB2YWx1ZS4gVGhpcyBiZWhhdmlvciBpcyBhbHNvIG5vdCBkZXNpcmVkIHdoZW4gcGVyZm9ybWluZyBzaW1wbGUgb25lLXRpbWUgYW5pbWF0aW9ucy4gRm9yIG9uZS10aW1lIGFuaW1hdGlvbnMgeW91J2Qgd2FudCB0byB0cmlnZ2VyIGFuaW1hdGlvbnMgaW1tZWRpYXRlbHkgaW5zdGVhZCBvZiByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQgYmVnaW4gdGltZS4gVGhhdCdzIHdoeSBpbiBndWlkZWQgbW9kZSBDaGFydGlzdC5Tdmcgd2lsbCBhbHNvIHVzZSB0aGUgYGJlZ2luYCBwcm9wZXJ0eSB0byBzY2hlZHVsZSBhIHRpbWVvdXQgYW5kIG1hbnVhbGx5IHN0YXJ0IHRoZSBhbmltYXRpb24gYWZ0ZXIgdGhlIHRpbWVvdXQuIElmIHlvdSdyZSB1c2luZyBtdWx0aXBsZSBTTUlMIGRlZmluaXRpb24gb2JqZWN0cyBmb3IgYW4gYXR0cmlidXRlIChpbiBhbiBhcnJheSksIGd1aWRlZCBtb2RlIHdpbGwgYmUgZGlzYWJsZWQgZm9yIHRoaXMgYXR0cmlidXRlLCBldmVuIGlmIHlvdSBleHBsaWNpdGx5IGVuYWJsZWQgaXQuXG4gICAqIElmIGd1aWRlZCBtb2RlIGlzIGVuYWJsZWQgdGhlIGZvbGxvd2luZyBiZWhhdmlvciBpcyBhZGRlZDpcbiAgICogLSBCZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHMgKGV2ZW4gd2hlbiBkZWxheWVkIHdpdGggYGJlZ2luYCkgdGhlIGFuaW1hdGVkIGF0dHJpYnV0ZSB3aWxsIGJlIHNldCBhbHJlYWR5IHRvIHRoZSBgZnJvbWAgdmFsdWUgb2YgdGhlIGFuaW1hdGlvblxuICAgKiAtIGBiZWdpbmAgaXMgZXhwbGljaXRseSBzZXQgdG8gYGluZGVmaW5pdGVgIHNvIGl0IGNhbiBiZSBzdGFydGVkIG1hbnVhbGx5IHdpdGhvdXQgcmVseWluZyBvbiBkb2N1bWVudCBiZWdpbiB0aW1lIChjcmVhdGlvbilcbiAgICogLSBUaGUgYW5pbWF0ZSBlbGVtZW50IHdpbGwgYmUgZm9yY2VkIHRvIHVzZSBgZmlsbD1cImZyZWV6ZVwiYFxuICAgKiAtIFRoZSBhbmltYXRpb24gd2lsbCBiZSB0cmlnZ2VyZWQgd2l0aCBgYmVnaW5FbGVtZW50KClgIGluIGEgdGltZW91dCB3aGVyZSBgYmVnaW5gIG9mIHRoZSBkZWZpbml0aW9uIG9iamVjdCBpcyBpbnRlcnByZXRlZCBpbiBtaWxsaSBzZWNvbmRzLiBJZiBubyBgYmVnaW5gIHdhcyBzcGVjaWZpZWQgdGhlIHRpbWVvdXQgaXMgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5LlxuICAgKiAtIEFmdGVyIHRoZSBhbmltYXRpb24gdGhlIGVsZW1lbnQgYXR0cmlidXRlIHZhbHVlIHdpbGwgYmUgc2V0IHRvIHRoZSBgdG9gIHZhbHVlIG9mIHRoZSBhbmltYXRpb25cbiAgICogLSBUaGUgYW5pbWF0ZSBlbGVtZW50IGlzIGRlbGV0ZWQgZnJvbSB0aGUgRE9NXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICogQHBhcmFtIHtPYmplY3R9IGFuaW1hdGlvbnMgQW4gYW5pbWF0aW9ucyBvYmplY3Qgd2hlcmUgdGhlIHByb3BlcnR5IGtleXMgYXJlIHRoZSBhdHRyaWJ1dGVzIHlvdSdkIGxpa2UgdG8gYW5pbWF0ZS4gVGhlIHByb3BlcnRpZXMgc2hvdWxkIGJlIG9iamVjdHMgYWdhaW4gdGhhdCBjb250YWluIHRoZSBTTUlMIGFuaW1hdGlvbiBhdHRyaWJ1dGVzICh1c3VhbGx5IGJlZ2luLCBkdXIsIGZyb20sIGFuZCB0bykuIFRoZSBwcm9wZXJ0eSBiZWdpbiBhbmQgZHVyIGlzIGF1dG8gY29udmVydGVkIChzZWUgQXV0b21hdGljIHVuaXQgY29udmVyc2lvbikuIFlvdSBjYW4gYWxzbyBzY2hlZHVsZSBtdWx0aXBsZSBhbmltYXRpb25zIGZvciB0aGUgc2FtZSBhdHRyaWJ1dGUgYnkgcGFzc2luZyBhbiBBcnJheSBvZiBTTUlMIGRlZmluaXRpb24gb2JqZWN0cy4gQXR0cmlidXRlcyB0aGF0IGNvbnRhaW4gYW4gYXJyYXkgb2YgU01JTCBkZWZpbml0aW9uIG9iamVjdHMgd2lsbCBub3QgYmUgZXhlY3V0ZWQgaW4gZ3VpZGVkIG1vZGUuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZ3VpZGVkIFNwZWNpZnkgaWYgZ3VpZGVkIG1vZGUgc2hvdWxkIGJlIGFjdGl2YXRlZCBmb3IgdGhpcyBhbmltYXRpb24gKHNlZSBHdWlkZWQgbW9kZSkuIElmIG5vdCBvdGhlcndpc2Ugc3BlY2lmaWVkLCBndWlkZWQgbW9kZSB3aWxsIGJlIGFjdGl2YXRlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RW1pdHRlciBJZiBzcGVjaWZpZWQsIHRoaXMgZXZlbnQgZW1pdHRlciB3aWxsIGJlIG5vdGlmaWVkIHdoZW4gYW4gYW5pbWF0aW9uIHN0YXJ0cyBvciBlbmRzLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBjdXJyZW50IGVsZW1lbnQgd2hlcmUgdGhlIGFuaW1hdGlvbiB3YXMgYWRkZWRcbiAgICovXG4gIGZ1bmN0aW9uIGFuaW1hdGUoYW5pbWF0aW9ucywgZ3VpZGVkLCBldmVudEVtaXR0ZXIpIHtcbiAgICBpZihndWlkZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZ3VpZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhhbmltYXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIGNyZWF0ZUFuaW1hdGVGb3JBdHRyaWJ1dGVzKGF0dHJpYnV0ZSkge1xuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVBbmltYXRlKGFuaW1hdGlvbkRlZmluaXRpb24sIGd1aWRlZCkge1xuICAgICAgICB2YXIgYXR0cmlidXRlUHJvcGVydGllcyA9IHt9LFxuICAgICAgICAgIGFuaW1hdGUsXG4gICAgICAgICAgdGltZW91dCxcbiAgICAgICAgICBlYXNpbmc7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYW4gZWFzaW5nIGlzIHNwZWNpZmllZCBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QgYW5kIGRlbGV0ZSBpdCBmcm9tIHRoZSBvYmplY3QgYXMgaXQgd2lsbCBub3RcbiAgICAgICAgLy8gYmUgcGFydCBvZiB0aGUgYW5pbWF0ZSBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gICAgICAgIGlmKGFuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nKSB7XG4gICAgICAgICAgLy8gSWYgYWxyZWFkeSBhbiBlYXNpbmcgQsOpemllciBjdXJ2ZSBhcnJheSB3ZSB0YWtlIGl0IG9yIHdlIGxvb2t1cCBhIGVhc2luZyBhcnJheSBpbiB0aGUgRWFzaW5nIG9iamVjdFxuICAgICAgICAgIGVhc2luZyA9IGFuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nIGluc3RhbmNlb2YgQXJyYXkgP1xuICAgICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmcgOlxuICAgICAgICAgICAgQ2hhcnRpc3QuU3ZnLkVhc2luZ1thbmltYXRpb25EZWZpbml0aW9uLmVhc2luZ107XG4gICAgICAgICAgZGVsZXRlIGFuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgbnVtZXJpYyBkdXIgb3IgYmVnaW4gd2FzIHByb3ZpZGVkIHdlIGFzc3VtZSBtaWxsaSBzZWNvbmRzXG4gICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uYmVnaW4gPSBDaGFydGlzdC5lbnN1cmVVbml0KGFuaW1hdGlvbkRlZmluaXRpb24uYmVnaW4sICdtcycpO1xuICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmR1ciA9IENoYXJ0aXN0LmVuc3VyZVVuaXQoYW5pbWF0aW9uRGVmaW5pdGlvbi5kdXIsICdtcycpO1xuXG4gICAgICAgIGlmKGVhc2luZykge1xuICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24uY2FsY01vZGUgPSAnc3BsaW5lJztcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmtleVNwbGluZXMgPSBlYXNpbmcuam9pbignICcpO1xuICAgICAgICAgIGFuaW1hdGlvbkRlZmluaXRpb24ua2V5VGltZXMgPSAnMDsxJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZGluZyBcImZpbGw6IGZyZWV6ZVwiIGlmIHdlIGFyZSBpbiBndWlkZWQgbW9kZSBhbmQgc2V0IGluaXRpYWwgYXR0cmlidXRlIHZhbHVlc1xuICAgICAgICBpZihndWlkZWQpIHtcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmZpbGwgPSAnZnJlZXplJztcbiAgICAgICAgICAvLyBBbmltYXRlZCBwcm9wZXJ0eSBvbiBvdXIgZWxlbWVudCBzaG91bGQgYWxyZWFkeSBiZSBzZXQgdG8gdGhlIGFuaW1hdGlvbiBmcm9tIHZhbHVlIGluIGd1aWRlZCBtb2RlXG4gICAgICAgICAgYXR0cmlidXRlUHJvcGVydGllc1thdHRyaWJ1dGVdID0gYW5pbWF0aW9uRGVmaW5pdGlvbi5mcm9tO1xuICAgICAgICAgIHRoaXMuYXR0cihhdHRyaWJ1dGVQcm9wZXJ0aWVzKTtcblxuICAgICAgICAgIC8vIEluIGd1aWRlZCBtb2RlIHdlIGFsc28gc2V0IGJlZ2luIHRvIGluZGVmaW5pdGUgc28gd2UgY2FuIHRyaWdnZXIgdGhlIHN0YXJ0IG1hbnVhbGx5IGFuZCBwdXQgdGhlIGJlZ2luXG4gICAgICAgICAgLy8gd2hpY2ggbmVlZHMgdG8gYmUgaW4gbXMgYXNpZGVcbiAgICAgICAgICB0aW1lb3V0ID0gQ2hhcnRpc3QucXVhbnRpdHkoYW5pbWF0aW9uRGVmaW5pdGlvbi5iZWdpbiB8fCAwKS52YWx1ZTtcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luID0gJ2luZGVmaW5pdGUnO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5pbWF0ZSA9IHRoaXMuZWxlbSgnYW5pbWF0ZScsIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgICAgYXR0cmlidXRlTmFtZTogYXR0cmlidXRlXG4gICAgICAgIH0sIGFuaW1hdGlvbkRlZmluaXRpb24pKTtcblxuICAgICAgICBpZihndWlkZWQpIHtcbiAgICAgICAgICAvLyBJZiBndWlkZWQgd2UgdGFrZSB0aGUgdmFsdWUgdGhhdCB3YXMgcHV0IGFzaWRlIGluIHRpbWVvdXQgYW5kIHRyaWdnZXIgdGhlIGFuaW1hdGlvbiBtYW51YWxseSB3aXRoIGEgdGltZW91dFxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBJZiBiZWdpbkVsZW1lbnQgZmFpbHMgd2Ugc2V0IHRoZSBhbmltYXRlZCBhdHRyaWJ1dGUgdG8gdGhlIGVuZCBwb3NpdGlvbiBhbmQgcmVtb3ZlIHRoZSBhbmltYXRlIGVsZW1lbnRcbiAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBpZiB0aGUgU01JTCBFbGVtZW50VGltZUNvbnRyb2wgaW50ZXJmYWNlIGlzIG5vdCBzdXBwb3J0ZWQgb3IgYW55IG90aGVyIHByb2JsZW1zIG9jY3VyZWQgaW5cbiAgICAgICAgICAgIC8vIHRoZSBicm93c2VyLiAoQ3VycmVudGx5IEZGIDM0IGRvZXMgbm90IHN1cHBvcnQgYW5pbWF0ZSBlbGVtZW50cyBpbiBmb3JlaWduT2JqZWN0cylcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGFuaW1hdGUuX25vZGUuYmVnaW5FbGVtZW50KCk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAvLyBTZXQgYW5pbWF0ZWQgYXR0cmlidXRlIHRvIGN1cnJlbnQgYW5pbWF0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgYXR0cmlidXRlUHJvcGVydGllc1thdHRyaWJ1dGVdID0gYW5pbWF0aW9uRGVmaW5pdGlvbi50bztcbiAgICAgICAgICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZVByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGFuaW1hdGUgZWxlbWVudCBhcyBpdCdzIG5vIGxvbmdlciByZXF1aXJlZFxuICAgICAgICAgICAgICBhbmltYXRlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSwgdGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihldmVudEVtaXR0ZXIpIHtcbiAgICAgICAgICBhbmltYXRlLl9ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZ2luRXZlbnQnLCBmdW5jdGlvbiBoYW5kbGVCZWdpbkV2ZW50KCkge1xuICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2FuaW1hdGlvbkJlZ2luJywge1xuICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLFxuICAgICAgICAgICAgICBhbmltYXRlOiBhbmltYXRlLl9ub2RlLFxuICAgICAgICAgICAgICBwYXJhbXM6IGFuaW1hdGlvbkRlZmluaXRpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBhbmltYXRlLl9ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZEV2ZW50JywgZnVuY3Rpb24gaGFuZGxlRW5kRXZlbnQoKSB7XG4gICAgICAgICAgaWYoZXZlbnRFbWl0dGVyKSB7XG4gICAgICAgICAgICBldmVudEVtaXR0ZXIuZW1pdCgnYW5pbWF0aW9uRW5kJywge1xuICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLFxuICAgICAgICAgICAgICBhbmltYXRlOiBhbmltYXRlLl9ub2RlLFxuICAgICAgICAgICAgICBwYXJhbXM6IGFuaW1hdGlvbkRlZmluaXRpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGd1aWRlZCkge1xuICAgICAgICAgICAgLy8gU2V0IGFuaW1hdGVkIGF0dHJpYnV0ZSB0byBjdXJyZW50IGFuaW1hdGVkIHZhbHVlXG4gICAgICAgICAgICBhdHRyaWJ1dGVQcm9wZXJ0aWVzW2F0dHJpYnV0ZV0gPSBhbmltYXRpb25EZWZpbml0aW9uLnRvO1xuICAgICAgICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZVByb3BlcnRpZXMpO1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbmltYXRlIGVsZW1lbnQgYXMgaXQncyBubyBsb25nZXIgcmVxdWlyZWRcbiAgICAgICAgICAgIGFuaW1hdGUucmVtb3ZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBjdXJyZW50IGF0dHJpYnV0ZSBpcyBhbiBhcnJheSBvZiBkZWZpbml0aW9uIG9iamVjdHMgd2UgY3JlYXRlIGFuIGFuaW1hdGUgZm9yIGVhY2ggYW5kIGRpc2FibGUgZ3VpZGVkIG1vZGVcbiAgICAgIGlmKGFuaW1hdGlvbnNbYXR0cmlidXRlXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGFuaW1hdGlvbnNbYXR0cmlidXRlXS5mb3JFYWNoKGZ1bmN0aW9uKGFuaW1hdGlvbkRlZmluaXRpb24pIHtcbiAgICAgICAgICBjcmVhdGVBbmltYXRlLmJpbmQodGhpcykoYW5pbWF0aW9uRGVmaW5pdGlvbiwgZmFsc2UpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3JlYXRlQW5pbWF0ZS5iaW5kKHRoaXMpKGFuaW1hdGlvbnNbYXR0cmlidXRlXSwgZ3VpZGVkKTtcbiAgICAgIH1cblxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIENoYXJ0aXN0LlN2ZyA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IFN2ZyxcbiAgICBhdHRyOiBhdHRyLFxuICAgIGVsZW06IGVsZW0sXG4gICAgcGFyZW50OiBwYXJlbnQsXG4gICAgcm9vdDogcm9vdCxcbiAgICBxdWVyeVNlbGVjdG9yOiBxdWVyeVNlbGVjdG9yLFxuICAgIHF1ZXJ5U2VsZWN0b3JBbGw6IHF1ZXJ5U2VsZWN0b3JBbGwsXG4gICAgZm9yZWlnbk9iamVjdDogZm9yZWlnbk9iamVjdCxcbiAgICB0ZXh0OiB0ZXh0LFxuICAgIGVtcHR5OiBlbXB0eSxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICByZXBsYWNlOiByZXBsYWNlLFxuICAgIGFwcGVuZDogYXBwZW5kLFxuICAgIGNsYXNzZXM6IGNsYXNzZXMsXG4gICAgYWRkQ2xhc3M6IGFkZENsYXNzLFxuICAgIHJlbW92ZUNsYXNzOiByZW1vdmVDbGFzcyxcbiAgICByZW1vdmVBbGxDbGFzc2VzOiByZW1vdmVBbGxDbGFzc2VzLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBhbmltYXRlOiBhbmltYXRlXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjaGVja3MgZm9yIHN1cHBvcnQgb2YgYSBnaXZlbiBTVkcgZmVhdHVyZSBsaWtlIEV4dGVuc2liaWxpdHksIFNWRy1hbmltYXRpb24gb3IgdGhlIGxpa2UuIENoZWNrIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge1N0cmluZ30gZmVhdHVyZSBUaGUgU1ZHIDEuMSBmZWF0dXJlIHRoYXQgc2hvdWxkIGJlIGNoZWNrZWQgZm9yIHN1cHBvcnQuXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFRydWUgb2YgZmFsc2UgaWYgdGhlIGZlYXR1cmUgaXMgc3VwcG9ydGVkIG9yIG5vdFxuICAgKi9cbiAgQ2hhcnRpc3QuU3ZnLmlzU3VwcG9ydGVkID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5oYXNGZWF0dXJlKCdodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlIycgKyBmZWF0dXJlLCAnMS4xJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgT2JqZWN0IGNvbnRhaW5zIHNvbWUgc3RhbmRhcmQgZWFzaW5nIGN1YmljIGJlemllciBjdXJ2ZXMuIFRoZW4gY2FuIGJlIHVzZWQgd2l0aCB0aGVpciBuYW1lIGluIHRoZSBgQ2hhcnRpc3QuU3ZnLmFuaW1hdGVgLiBZb3UgY2FuIGFsc28gZXh0ZW5kIHRoZSBsaXN0IGFuZCB1c2UgeW91ciBvd24gbmFtZSBpbiB0aGUgYGFuaW1hdGVgIGZ1bmN0aW9uLiBDbGljayB0aGUgc2hvdyBjb2RlIGJ1dHRvbiB0byBzZWUgdGhlIGF2YWlsYWJsZSBiZXppZXIgZnVuY3Rpb25zLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAqL1xuICB2YXIgZWFzaW5nQ3ViaWNCZXppZXJzID0ge1xuICAgIGVhc2VJblNpbmU6IFswLjQ3LCAwLCAwLjc0NSwgMC43MTVdLFxuICAgIGVhc2VPdXRTaW5lOiBbMC4zOSwgMC41NzUsIDAuNTY1LCAxXSxcbiAgICBlYXNlSW5PdXRTaW5lOiBbMC40NDUsIDAuMDUsIDAuNTUsIDAuOTVdLFxuICAgIGVhc2VJblF1YWQ6IFswLjU1LCAwLjA4NSwgMC42OCwgMC41M10sXG4gICAgZWFzZU91dFF1YWQ6IFswLjI1LCAwLjQ2LCAwLjQ1LCAwLjk0XSxcbiAgICBlYXNlSW5PdXRRdWFkOiBbMC40NTUsIDAuMDMsIDAuNTE1LCAwLjk1NV0sXG4gICAgZWFzZUluQ3ViaWM6IFswLjU1LCAwLjA1NSwgMC42NzUsIDAuMTldLFxuICAgIGVhc2VPdXRDdWJpYzogWzAuMjE1LCAwLjYxLCAwLjM1NSwgMV0sXG4gICAgZWFzZUluT3V0Q3ViaWM6IFswLjY0NSwgMC4wNDUsIDAuMzU1LCAxXSxcbiAgICBlYXNlSW5RdWFydDogWzAuODk1LCAwLjAzLCAwLjY4NSwgMC4yMl0sXG4gICAgZWFzZU91dFF1YXJ0OiBbMC4xNjUsIDAuODQsIDAuNDQsIDFdLFxuICAgIGVhc2VJbk91dFF1YXJ0OiBbMC43NywgMCwgMC4xNzUsIDFdLFxuICAgIGVhc2VJblF1aW50OiBbMC43NTUsIDAuMDUsIDAuODU1LCAwLjA2XSxcbiAgICBlYXNlT3V0UXVpbnQ6IFswLjIzLCAxLCAwLjMyLCAxXSxcbiAgICBlYXNlSW5PdXRRdWludDogWzAuODYsIDAsIDAuMDcsIDFdLFxuICAgIGVhc2VJbkV4cG86IFswLjk1LCAwLjA1LCAwLjc5NSwgMC4wMzVdLFxuICAgIGVhc2VPdXRFeHBvOiBbMC4xOSwgMSwgMC4yMiwgMV0sXG4gICAgZWFzZUluT3V0RXhwbzogWzEsIDAsIDAsIDFdLFxuICAgIGVhc2VJbkNpcmM6IFswLjYsIDAuMDQsIDAuOTgsIDAuMzM1XSxcbiAgICBlYXNlT3V0Q2lyYzogWzAuMDc1LCAwLjgyLCAwLjE2NSwgMV0sXG4gICAgZWFzZUluT3V0Q2lyYzogWzAuNzg1LCAwLjEzNSwgMC4xNSwgMC44Nl0sXG4gICAgZWFzZUluQmFjazogWzAuNiwgLTAuMjgsIDAuNzM1LCAwLjA0NV0sXG4gICAgZWFzZU91dEJhY2s6IFswLjE3NSwgMC44ODUsIDAuMzIsIDEuMjc1XSxcbiAgICBlYXNlSW5PdXRCYWNrOiBbMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1XVxuICB9O1xuXG4gIENoYXJ0aXN0LlN2Zy5FYXNpbmcgPSBlYXNpbmdDdWJpY0JlemllcnM7XG5cbiAgLyoqXG4gICAqIFRoaXMgaGVscGVyIGNsYXNzIGlzIHRvIHdyYXAgbXVsdGlwbGUgYENoYXJ0aXN0LlN2Z2AgZWxlbWVudHMgaW50byBhIGxpc3Qgd2hlcmUgeW91IGNhbiBjYWxsIHRoZSBgQ2hhcnRpc3QuU3ZnYCBmdW5jdGlvbnMgb24gYWxsIGVsZW1lbnRzIGluIHRoZSBsaXN0IHdpdGggb25lIGNhbGwuIFRoaXMgaXMgaGVscGZ1bCB3aGVuIHlvdSdkIGxpa2UgdG8gcGVyZm9ybSBjYWxscyB3aXRoIGBDaGFydGlzdC5TdmdgIG9uIG11bHRpcGxlIGVsZW1lbnRzLlxuICAgKiBBbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGlzIGFsc28gcmV0dXJuZWQgYnkgYENoYXJ0aXN0LlN2Zy5xdWVyeVNlbGVjdG9yQWxsYC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgKiBAcGFyYW0ge0FycmF5PE5vZGU+fE5vZGVMaXN0fSBub2RlTGlzdCBBbiBBcnJheSBvZiBTVkcgRE9NIG5vZGVzIG9yIGEgU1ZHIERPTSBOb2RlTGlzdCAoYXMgcmV0dXJuZWQgYnkgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbClcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBTdmdMaXN0KG5vZGVMaXN0KSB7XG4gICAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gICAgdGhpcy5zdmdFbGVtZW50cyA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBub2RlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5zdmdFbGVtZW50cy5wdXNoKG5ldyBDaGFydGlzdC5Tdmcobm9kZUxpc3RbaV0pKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgZGVsZWdhdGlvbiBtZXRob2RzIGZvciBDaGFydGlzdC5TdmdcbiAgICBPYmplY3Qua2V5cyhDaGFydGlzdC5TdmcucHJvdG90eXBlKS5maWx0ZXIoZnVuY3Rpb24ocHJvdG90eXBlUHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBbJ2NvbnN0cnVjdG9yJyxcbiAgICAgICAgICAncGFyZW50JyxcbiAgICAgICAgICAncXVlcnlTZWxlY3RvcicsXG4gICAgICAgICAgJ3F1ZXJ5U2VsZWN0b3JBbGwnLFxuICAgICAgICAgICdyZXBsYWNlJyxcbiAgICAgICAgICAnYXBwZW5kJyxcbiAgICAgICAgICAnY2xhc3NlcycsXG4gICAgICAgICAgJ2hlaWdodCcsXG4gICAgICAgICAgJ3dpZHRoJ10uaW5kZXhPZihwcm90b3R5cGVQcm9wZXJ0eSkgPT09IC0xO1xuICAgIH0pLmZvckVhY2goZnVuY3Rpb24ocHJvdG90eXBlUHJvcGVydHkpIHtcbiAgICAgIGxpc3RbcHJvdG90eXBlUHJvcGVydHldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgbGlzdC5zdmdFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICBDaGFydGlzdC5TdmcucHJvdG90eXBlW3Byb3RvdHlwZVByb3BlcnR5XS5hcHBseShlbGVtZW50LCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIENoYXJ0aXN0LlN2Zy5MaXN0ID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogU3ZnTGlzdFxuICB9KTtcbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIENoYXJ0aXN0IFNWRyBwYXRoIG1vZHVsZSBmb3IgU1ZHIHBhdGggZGVzY3JpcHRpb24gY3JlYXRpb24gYW5kIG1vZGlmaWNhdGlvbi5cbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LlN2Zy5QYXRoXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogQ29udGFpbnMgdGhlIGRlc2NyaXB0b3JzIG9mIHN1cHBvcnRlZCBlbGVtZW50IHR5cGVzIGluIGEgU1ZHIHBhdGguIEN1cnJlbnRseSBvbmx5IG1vdmUsIGxpbmUgYW5kIGN1cnZlIGFyZSBzdXBwb3J0ZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdmFyIGVsZW1lbnREZXNjcmlwdGlvbnMgPSB7XG4gICAgbTogWyd4JywgJ3knXSxcbiAgICBsOiBbJ3gnLCAneSddLFxuICAgIGM6IFsneDEnLCAneTEnLCAneDInLCAneTInLCAneCcsICd5J10sXG4gICAgYTogWydyeCcsICdyeScsICd4QXInLCAnbEFmJywgJ3NmJywgJ3gnLCAneSddXG4gIH07XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBmb3IgbmV3bHkgY3JlYXRlZCBTVkcgcGF0aCBvYmplY3RzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAvLyBUaGUgYWNjdXJhY3kgaW4gZGlnaXQgY291bnQgYWZ0ZXIgdGhlIGRlY2ltYWwgcG9pbnQuIFRoaXMgd2lsbCBiZSB1c2VkIHRvIHJvdW5kIG51bWJlcnMgaW4gdGhlIFNWRyBwYXRoLiBJZiB0aGlzIG9wdGlvbiBpcyBzZXQgdG8gZmFsc2UgdGhlbiBubyByb3VuZGluZyB3aWxsIGJlIHBlcmZvcm1lZC5cbiAgICBhY2N1cmFjeTogM1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVsZW1lbnQoY29tbWFuZCwgcGFyYW1zLCBwYXRoRWxlbWVudHMsIHBvcywgcmVsYXRpdmUsIGRhdGEpIHtcbiAgICB2YXIgcGF0aEVsZW1lbnQgPSBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgY29tbWFuZDogcmVsYXRpdmUgPyBjb21tYW5kLnRvTG93ZXJDYXNlKCkgOiBjb21tYW5kLnRvVXBwZXJDYXNlKClcbiAgICB9LCBwYXJhbXMsIGRhdGEgPyB7IGRhdGE6IGRhdGEgfSA6IHt9ICk7XG5cbiAgICBwYXRoRWxlbWVudHMuc3BsaWNlKHBvcywgMCwgcGF0aEVsZW1lbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9yRWFjaFBhcmFtKHBhdGhFbGVtZW50cywgY2IpIHtcbiAgICBwYXRoRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihwYXRoRWxlbWVudCwgcGF0aEVsZW1lbnRJbmRleCkge1xuICAgICAgZWxlbWVudERlc2NyaXB0aW9uc1twYXRoRWxlbWVudC5jb21tYW5kLnRvTG93ZXJDYXNlKCldLmZvckVhY2goZnVuY3Rpb24ocGFyYW1OYW1lLCBwYXJhbUluZGV4KSB7XG4gICAgICAgIGNiKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIGNvbnN0cnVjdCBhIG5ldyBwYXRoIG9iamVjdC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgSWYgc2V0IHRvIHRydWUgdGhlbiB0aGlzIHBhdGggd2lsbCBiZSBjbG9zZWQgd2hlbiBzdHJpbmdpZmllZCAod2l0aCBhIFogYXQgdGhlIGVuZClcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QgdGhhdCBvdmVycmlkZXMgdGhlIGRlZmF1bHQgb2JqZWN0cy4gU2VlIGRlZmF1bHQgb3B0aW9ucyBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIFN2Z1BhdGgoY2xvc2UsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnBhdGhFbGVtZW50cyA9IFtdO1xuICAgIHRoaXMucG9zID0gMDtcbiAgICB0aGlzLmNsb3NlID0gY2xvc2U7XG4gICAgdGhpcy5vcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBvciBzZXRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIChjdXJzb3IpIGluc2lkZSBvZiB0aGUgcGF0aC4gWW91IGNhbiBtb3ZlIGFyb3VuZCB0aGUgY3Vyc29yIGZyZWVseSBidXQgbGltaXRlZCB0byAwIG9yIHRoZSBjb3VudCBvZiBleGlzdGluZyBlbGVtZW50cy4gQWxsIG1vZGlmaWNhdGlvbnMgd2l0aCBlbGVtZW50IGZ1bmN0aW9ucyB3aWxsIGluc2VydCBuZXcgZWxlbWVudHMgYXQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgY3Vyc29yLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwb3NdIElmIGEgbnVtYmVyIGlzIHBhc3NlZCB0aGVuIHRoZSBjdXJzb3IgaXMgc2V0IHRvIHRoaXMgcG9zaXRpb24gaW4gdGhlIHBhdGggZWxlbWVudCBhcnJheS5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh8TnVtYmVyfSBJZiB0aGUgcG9zaXRpb24gcGFyYW1ldGVyIHdhcyBwYXNzZWQgdGhlbiB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYmUgdGhlIHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuIElmIG5vIHBvc2l0aW9uIHBhcmFtZXRlciB3YXMgcGFzc2VkIHRoZW4gdGhlIGN1cnJlbnQgcG9zaXRpb24gaXMgcmV0dXJuZWQuXG4gICAqL1xuICBmdW5jdGlvbiBwb3NpdGlvbihwb3MpIHtcbiAgICBpZihwb3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5wb3MgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih0aGlzLnBhdGhFbGVtZW50cy5sZW5ndGgsIHBvcykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBlbGVtZW50cyBmcm9tIHRoZSBwYXRoIHN0YXJ0aW5nIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiBwYXRoIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmUoY291bnQpIHtcbiAgICB0aGlzLnBhdGhFbGVtZW50cy5zcGxpY2UodGhpcy5wb3MsIGNvdW50KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgbW92ZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIG1vdmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIG1vdmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbcmVsYXRpdmVdIElmIHNldCB0byB0cnVlIHRoZSBtb3ZlIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgKGxvd2VyY2FzZSBsZXR0ZXIpXG4gICAqIEBwYXJhbSB7Kn0gW2RhdGFdIEFueSBkYXRhIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCB3aXRoIHRoZSBlbGVtZW50IG9iamVjdCB0aGF0IHdpbGwgYmUgYWNjZXNzaWJsZSBpbiBwYXRoRWxlbWVudFxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIG1vdmUoeCwgeSwgcmVsYXRpdmUsIGRhdGEpIHtcbiAgICBlbGVtZW50KCdNJywge1xuICAgICAgeDogK3gsXG4gICAgICB5OiAreVxuICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSwgZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYWRkIGEgbmV3IGxpbmUgU1ZHIHBhdGggZWxlbWVudC5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBsaW5lIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvb3JkaW5hdGUgZm9yIHRoZSBsaW5lIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlbGF0aXZlXSBJZiBzZXQgdG8gdHJ1ZSB0aGUgbGluZSBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZCB3aXRoIHJlbGF0aXZlIGNvb3JkaW5hdGVzIChsb3dlcmNhc2UgbGV0dGVyKVxuICAgKiBAcGFyYW0geyp9IFtkYXRhXSBBbnkgZGF0YSB0aGF0IHNob3VsZCBiZSBzdG9yZWQgd2l0aCB0aGUgZWxlbWVudCBvYmplY3QgdGhhdCB3aWxsIGJlIGFjY2Vzc2libGUgaW4gcGF0aEVsZW1lbnRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBsaW5lKHgsIHksIHJlbGF0aXZlLCBkYXRhKSB7XG4gICAgZWxlbWVudCgnTCcsIHtcbiAgICAgIHg6ICt4LFxuICAgICAgeTogK3lcbiAgICB9LCB0aGlzLnBhdGhFbGVtZW50cywgdGhpcy5wb3MrKywgcmVsYXRpdmUsIGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBjdXJ2ZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHgxIFRoZSB4IGNvb3JkaW5hdGUgZm9yIHRoZSBmaXJzdCBjb250cm9sIHBvaW50IG9mIHRoZSBiZXppZXIgY3VydmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5MSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgZmlyc3QgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgKiBAcGFyYW0ge051bWJlcn0geDIgVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIHNlY29uZCBjb250cm9sIHBvaW50IG9mIHRoZSBiZXppZXIgY3VydmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5MiBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQgb2YgdGhlIGJlemllciBjdXJ2ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIHRhcmdldCBwb2ludCBvZiB0aGUgY3VydmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIHRhcmdldCBwb2ludCBvZiB0aGUgY3VydmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbcmVsYXRpdmVdIElmIHNldCB0byB0cnVlIHRoZSBjdXJ2ZSBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZCB3aXRoIHJlbGF0aXZlIGNvb3JkaW5hdGVzIChsb3dlcmNhc2UgbGV0dGVyKVxuICAgKiBAcGFyYW0geyp9IFtkYXRhXSBBbnkgZGF0YSB0aGF0IHNob3VsZCBiZSBzdG9yZWQgd2l0aCB0aGUgZWxlbWVudCBvYmplY3QgdGhhdCB3aWxsIGJlIGFjY2Vzc2libGUgaW4gcGF0aEVsZW1lbnRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBjdXJ2ZSh4MSwgeTEsIHgyLCB5MiwgeCwgeSwgcmVsYXRpdmUsIGRhdGEpIHtcbiAgICBlbGVtZW50KCdDJywge1xuICAgICAgeDE6ICt4MSxcbiAgICAgIHkxOiAreTEsXG4gICAgICB4MjogK3gyLFxuICAgICAgeTI6ICt5MixcbiAgICAgIHg6ICt4LFxuICAgICAgeTogK3lcbiAgICB9LCB0aGlzLnBhdGhFbGVtZW50cywgdGhpcy5wb3MrKywgcmVsYXRpdmUsIGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIGFkZCBhIG5ldyBub24tYmV6aWVyIGN1cnZlIFNWRyBwYXRoIGVsZW1lbnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0gcnggVGhlIHJhZGl1cyB0byBiZSB1c2VkIGZvciB0aGUgeC1heGlzIG9mIHRoZSBhcmMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByeSBUaGUgcmFkaXVzIHRvIGJlIHVzZWQgZm9yIHRoZSB5LWF4aXMgb2YgdGhlIGFyYy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHhBciBEZWZpbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgYXJjXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsQWYgTGFyZ2UgYXJjIGZsYWdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNmIFN3ZWVwIGZsYWdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIHRhcmdldCBwb2ludCBvZiB0aGUgY3VydmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIHRhcmdldCBwb2ludCBvZiB0aGUgY3VydmUgZWxlbWVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBbcmVsYXRpdmVdIElmIHNldCB0byB0cnVlIHRoZSBjdXJ2ZSBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZCB3aXRoIHJlbGF0aXZlIGNvb3JkaW5hdGVzIChsb3dlcmNhc2UgbGV0dGVyKVxuICAgKiBAcGFyYW0geyp9IFtkYXRhXSBBbnkgZGF0YSB0aGF0IHNob3VsZCBiZSBzdG9yZWQgd2l0aCB0aGUgZWxlbWVudCBvYmplY3QgdGhhdCB3aWxsIGJlIGFjY2Vzc2libGUgaW4gcGF0aEVsZW1lbnRcbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAqL1xuICBmdW5jdGlvbiBhcmMocngsIHJ5LCB4QXIsIGxBZiwgc2YsIHgsIHksIHJlbGF0aXZlLCBkYXRhKSB7XG4gICAgZWxlbWVudCgnQScsIHtcbiAgICAgIHJ4OiArcngsXG4gICAgICByeTogK3J5LFxuICAgICAgeEFyOiAreEFyLFxuICAgICAgbEFmOiArbEFmLFxuICAgICAgc2Y6ICtzZixcbiAgICAgIHg6ICt4LFxuICAgICAgeTogK3lcbiAgICB9LCB0aGlzLnBhdGhFbGVtZW50cywgdGhpcy5wb3MrKywgcmVsYXRpdmUsIGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbiBTVkcgcGF0aCBzZWVuIGluIHRoZSBkIGF0dHJpYnV0ZSBvZiBwYXRoIGVsZW1lbnRzLCBhbmQgaW5zZXJ0cyB0aGUgcGFyc2VkIGVsZW1lbnRzIGludG8gdGhlIGV4aXN0aW5nIHBhdGggb2JqZWN0IGF0IHRoZSBjdXJyZW50IGN1cnNvciBwb3NpdGlvbi4gQW55IGNsb3NpbmcgcGF0aCBpbmRpY2F0b3JzIChaIGF0IHRoZSBlbmQgb2YgdGhlIHBhdGgpIHdpbGwgYmUgaWdub3JlZCBieSB0aGUgcGFyc2VyIGFzIHRoaXMgaXMgcHJvdmlkZWQgYnkgdGhlIGNsb3NlIG9wdGlvbiBpbiB0aGUgb3B0aW9ucyBvZiB0aGUgcGF0aCBvYmplY3QuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBBbnkgU1ZHIHBhdGggdGhhdCBjb250YWlucyBtb3ZlIChtKSwgbGluZSAobCkgb3IgY3VydmUgKGMpIGNvbXBvbmVudHMuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2UocGF0aCkge1xuICAgIC8vIFBhcnNpbmcgdGhlIFNWRyBwYXRoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBbWydNJywgJzEwJywgJzEwJ10sIFsnTCcsICcxMDAnLCAnMTAwJ11dXG4gICAgdmFyIGNodW5rcyA9IHBhdGgucmVwbGFjZSgvKFtBLVphLXpdKShbMC05XSkvZywgJyQxICQyJylcbiAgICAgIC5yZXBsYWNlKC8oWzAtOV0pKFtBLVphLXpdKS9nLCAnJDEgJDInKVxuICAgICAgLnNwbGl0KC9bXFxzLF0rLylcbiAgICAgIC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XG4gICAgICAgIGlmKGVsZW1lbnQubWF0Y2goL1tBLVphLXpdLykpIHtcbiAgICAgICAgICByZXN1bHQucHVzaChbXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdLnB1c2goZWxlbWVudCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbXSk7XG5cbiAgICAvLyBJZiB0aGlzIGlzIGEgY2xvc2VkIHBhdGggd2UgcmVtb3ZlIHRoZSBaIGF0IHRoZSBlbmQgYmVjYXVzZSB0aGlzIGlzIGRldGVybWluZWQgYnkgdGhlIGNsb3NlIG9wdGlvblxuICAgIGlmKGNodW5rc1tjaHVua3MubGVuZ3RoIC0gMV1bMF0udG9VcHBlckNhc2UoKSA9PT0gJ1onKSB7XG4gICAgICBjaHVua3MucG9wKCk7XG4gICAgfVxuXG4gICAgLy8gVXNpbmcgc3ZnUGF0aEVsZW1lbnREZXNjcmlwdGlvbnMgdG8gbWFwIHJhdyBwYXRoIGFycmF5cyBpbnRvIG9iamVjdHMgdGhhdCBjb250YWluIHRoZSBjb21tYW5kIGFuZCB0aGUgcGFyYW1ldGVyc1xuICAgIC8vIEZvciBleGFtcGxlIHtjb21tYW5kOiAnTScsIHg6ICcxMCcsIHk6ICcxMCd9XG4gICAgdmFyIGVsZW1lbnRzID0gY2h1bmtzLm1hcChmdW5jdGlvbihjaHVuaykge1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNodW5rLnNoaWZ0KCksXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBlbGVtZW50RGVzY3JpcHRpb25zW2NvbW1hbmQudG9Mb3dlckNhc2UoKV07XG5cbiAgICAgICAgcmV0dXJuIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgICAgY29tbWFuZDogY29tbWFuZFxuICAgICAgICB9LCBkZXNjcmlwdGlvbi5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBwYXJhbU5hbWUsIGluZGV4KSB7XG4gICAgICAgICAgcmVzdWx0W3BhcmFtTmFtZV0gPSArY2h1bmtbaW5kZXhdO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sIHt9KSk7XG4gICAgICB9KTtcblxuICAgIC8vIFByZXBhcmluZyBhIHNwbGljZSBjYWxsIHdpdGggdGhlIGVsZW1lbnRzIGFycmF5IGFzIHZhciBhcmcgcGFyYW1zIGFuZCBpbnNlcnQgdGhlIHBhcnNlZCBlbGVtZW50cyBhdCB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgIHZhciBzcGxpY2VBcmdzID0gW3RoaXMucG9zLCAwXTtcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShzcGxpY2VBcmdzLCBlbGVtZW50cyk7XG4gICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLnBhdGhFbGVtZW50cywgc3BsaWNlQXJncyk7XG4gICAgLy8gSW5jcmVhc2UgdGhlIGludGVybmFsIHBvc2l0aW9uIGJ5IHRoZSBlbGVtZW50IGNvdW50XG4gICAgdGhpcy5wb3MgKz0gZWxlbWVudHMubGVuZ3RoO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiByZW5kZXJzIHRvIGN1cnJlbnQgU1ZHIHBhdGggb2JqZWN0IGludG8gYSBmaW5hbCBTVkcgc3RyaW5nIHRoYXQgY2FuIGJlIHVzZWQgaW4gdGhlIGQgYXR0cmlidXRlIG9mIFNWRyBwYXRoIGVsZW1lbnRzLiBJdCB1c2VzIHRoZSBhY2N1cmFjeSBvcHRpb24gdG8gcm91bmQgYmlnIGRlY2ltYWxzLiBJZiB0aGUgY2xvc2UgcGFyYW1ldGVyIHdhcyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yIG9mIHRoaXMgcGF0aCBvYmplY3QgdGhlbiBhIHBhdGggY2xvc2luZyBaIHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIG91dHB1dCBzdHJpbmcuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBzdHJpbmdpZnkoKSB7XG4gICAgdmFyIGFjY3VyYWN5TXVsdGlwbGllciA9IE1hdGgucG93KDEwLCB0aGlzLm9wdGlvbnMuYWNjdXJhY3kpO1xuXG4gICAgcmV0dXJuIHRoaXMucGF0aEVsZW1lbnRzLnJlZHVjZShmdW5jdGlvbihwYXRoLCBwYXRoRWxlbWVudCkge1xuICAgICAgICB2YXIgcGFyYW1zID0gZWxlbWVudERlc2NyaXB0aW9uc1twYXRoRWxlbWVudC5jb21tYW5kLnRvTG93ZXJDYXNlKCldLm1hcChmdW5jdGlvbihwYXJhbU5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFjY3VyYWN5ID9cbiAgICAgICAgICAgIChNYXRoLnJvdW5kKHBhdGhFbGVtZW50W3BhcmFtTmFtZV0gKiBhY2N1cmFjeU11bHRpcGxpZXIpIC8gYWNjdXJhY3lNdWx0aXBsaWVyKSA6XG4gICAgICAgICAgICBwYXRoRWxlbWVudFtwYXJhbU5hbWVdO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJldHVybiBwYXRoICsgcGF0aEVsZW1lbnQuY29tbWFuZCArIHBhcmFtcy5qb2luKCcsJyk7XG4gICAgICB9LmJpbmQodGhpcyksICcnKSArICh0aGlzLmNsb3NlID8gJ1onIDogJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjYWxlcyBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgU1ZHIHBhdGggb2JqZWN0LiBUaGVyZSBpcyBhbiBpbmRpdmlkdWFsIHBhcmFtZXRlciBmb3IgZWFjaCBjb29yZGluYXRlLiBTY2FsaW5nIHdpbGwgYWxzbyBiZSBkb25lIGZvciBjb250cm9sIHBvaW50cyBvZiBjdXJ2ZXMsIGFmZmVjdGluZyB0aGUgZ2l2ZW4gY29vcmRpbmF0ZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHNjYWxlIHRoZSB4LCB4MSBhbmQgeDIgb2YgYWxsIHBhdGggZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHNjYWxlIHRoZSB5LCB5MSBhbmQgeTIgb2YgYWxsIHBhdGggZWxlbWVudHMuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gc2NhbGUoeCwgeSkge1xuICAgIGZvckVhY2hQYXJhbSh0aGlzLnBhdGhFbGVtZW50cywgZnVuY3Rpb24ocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSkge1xuICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXSAqPSBwYXJhbU5hbWVbMF0gPT09ICd4JyA/IHggOiB5O1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgYWxsIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IFNWRyBwYXRoIG9iamVjdC4gVGhlIHRyYW5zbGF0aW9uIGlzIHJlbGF0aXZlIGFuZCB0aGVyZSBpcyBhbiBpbmRpdmlkdWFsIHBhcmFtZXRlciBmb3IgZWFjaCBjb29yZGluYXRlLiBUcmFuc2xhdGlvbiB3aWxsIGFsc28gYmUgZG9uZSBmb3IgY29udHJvbCBwb2ludHMgb2YgY3VydmVzLCBhZmZlY3RpbmcgdGhlIGdpdmVuIGNvb3JkaW5hdGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgbnVtYmVyIHdoaWNoIHdpbGwgYmUgdXNlZCB0byB0cmFuc2xhdGUgdGhlIHgsIHgxIGFuZCB4MiBvZiBhbGwgcGF0aCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIG51bWJlciB3aGljaCB3aWxsIGJlIHVzZWQgdG8gdHJhbnNsYXRlIHRoZSB5LCB5MSBhbmQgeTIgb2YgYWxsIHBhdGggZWxlbWVudHMuXG4gICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHgsIHkpIHtcbiAgICBmb3JFYWNoUGFyYW0odGhpcy5wYXRoRWxlbWVudHMsIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUpIHtcbiAgICAgIHBhdGhFbGVtZW50W3BhcmFtTmFtZV0gKz0gcGFyYW1OYW1lWzBdID09PSAneCcgPyB4IDogeTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcnVuIG92ZXIgYWxsIGV4aXN0aW5nIHBhdGggZWxlbWVudHMgYW5kIHRoZW4gbG9vcCBvdmVyIHRoZWlyIGF0dHJpYnV0ZXMuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcGF0aCBlbGVtZW50IGF0dHJpYnV0ZSB0aGF0IGV4aXN0cyBpbiB0aGUgY3VycmVudCBwYXRoLlxuICAgKiBUaGUgbWV0aG9kIHNpZ25hdHVyZSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gbG9va3MgbGlrZSB0aGlzOlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cylcbiAgICogYGBgXG4gICAqIElmIHNvbWV0aGluZyBlbHNlIHRoYW4gdW5kZWZpbmVkIGlzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbiwgdGhpcyB2YWx1ZSB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSB0aGUgb2xkIHZhbHVlLiBUaGlzIGFsbG93cyB5b3UgdG8gYnVpbGQgY3VzdG9tIHRyYW5zZm9ybWF0aW9ucyBvZiBwYXRoIG9iamVjdHMgdGhhdCBjYW4ndCBiZSBhY2hpZXZlZCB1c2luZyB0aGUgYmFzaWMgdHJhbnNmb3JtYXRpb24gZnVuY3Rpb25zIHNjYWxlIGFuZCB0cmFuc2xhdGUuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm1GbmMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgdHJhbnNmb3JtYXRpb24uIENoZWNrIHRoZSBzaWduYXR1cmUgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh0cmFuc2Zvcm1GbmMpIHtcbiAgICBmb3JFYWNoUGFyYW0odGhpcy5wYXRoRWxlbWVudHMsIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cykge1xuICAgICAgdmFyIHRyYW5zZm9ybWVkID0gdHJhbnNmb3JtRm5jKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cyk7XG4gICAgICBpZih0cmFuc2Zvcm1lZCB8fCB0cmFuc2Zvcm1lZCA9PT0gMCkge1xuICAgICAgICBwYXRoRWxlbWVudFtwYXJhbU5hbWVdID0gdHJhbnNmb3JtZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBjbG9uZXMgYSB3aG9sZSBwYXRoIG9iamVjdCB3aXRoIGFsbCBpdHMgcHJvcGVydGllcy4gVGhpcyBpcyBhIGRlZXAgY2xvbmUgYW5kIHBhdGggZWxlbWVudCBvYmplY3RzIHdpbGwgYWxzbyBiZSBjbG9uZWQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtjbG9zZV0gT3B0aW9uYWwgb3B0aW9uIHRvIHNldCB0aGUgbmV3IGNsb25lZCBwYXRoIHRvIGNsb3NlZC4gSWYgbm90IHNwZWNpZmllZCBvciBmYWxzZSwgdGhlIG9yaWdpbmFsIHBhdGggY2xvc2Ugb3B0aW9uIHdpbGwgYmUgdXNlZC5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9XG4gICAqL1xuICBmdW5jdGlvbiBjbG9uZShjbG9zZSkge1xuICAgIHZhciBjID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKGNsb3NlIHx8IHRoaXMuY2xvc2UpO1xuICAgIGMucG9zID0gdGhpcy5wb3M7XG4gICAgYy5wYXRoRWxlbWVudHMgPSB0aGlzLnBhdGhFbGVtZW50cy5zbGljZSgpLm1hcChmdW5jdGlvbiBjbG9uZUVsZW1lbnRzKHBhdGhFbGVtZW50KSB7XG4gICAgICByZXR1cm4gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBwYXRoRWxlbWVudCk7XG4gICAgfSk7XG4gICAgYy5vcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMpO1xuICAgIHJldHVybiBjO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0IGEgU3ZnLlBhdGggb2JqZWN0IGJ5IGEgc3BlY2lmaWMgY29tbWFuZCBpbiB0aGUgcGF0aCBjaGFpbi4gVGhlIHBhdGggY2hhaW4gd2lsbCBiZSBzcGxpdCBhbmQgYW4gYXJyYXkgb2YgbmV3bHkgY3JlYXRlZCBwYXRocyBvYmplY3RzIHdpbGwgYmUgcmV0dXJuZWQuIFRoaXMgaXMgdXNlZnVsIGlmIHlvdSdkIGxpa2UgdG8gc3BsaXQgYW4gU1ZHIHBhdGggYnkgaXQncyBtb3ZlIGNvbW1hbmRzLCBmb3IgZXhhbXBsZSwgaW4gb3JkZXIgdG8gaXNvbGF0ZSBjaHVua3Mgb2YgZHJhd2luZ3MuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZCBUaGUgY29tbWFuZCB5b3UnZCBsaWtlIHRvIHVzZSB0byBzcGxpdCB0aGUgcGF0aFxuICAgKiBAcmV0dXJuIHtBcnJheTxDaGFydGlzdC5TdmcuUGF0aD59XG4gICAqL1xuICBmdW5jdGlvbiBzcGxpdEJ5Q29tbWFuZChjb21tYW5kKSB7XG4gICAgdmFyIHNwbGl0ID0gW1xuICAgICAgbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKClcbiAgICBdO1xuXG4gICAgdGhpcy5wYXRoRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihwYXRoRWxlbWVudCkge1xuICAgICAgaWYocGF0aEVsZW1lbnQuY29tbWFuZCA9PT0gY29tbWFuZC50b1VwcGVyQ2FzZSgpICYmIHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnBhdGhFbGVtZW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgc3BsaXQucHVzaChuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKSk7XG4gICAgICB9XG5cbiAgICAgIHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnBhdGhFbGVtZW50cy5wdXNoKHBhdGhFbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzcGxpdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHN0YXRpYyBmdW5jdGlvbiBvbiBgQ2hhcnRpc3QuU3ZnLlBhdGhgIGlzIGpvaW5pbmcgbXVsdGlwbGUgcGF0aHMgdG9nZXRoZXIgaW50byBvbmUgcGF0aHMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgKiBAcGFyYW0ge0FycmF5PENoYXJ0aXN0LlN2Zy5QYXRoPn0gcGF0aHMgQSBsaXN0IG9mIHBhdGhzIHRvIGJlIGpvaW5lZCB0b2dldGhlci4gVGhlIG9yZGVyIGlzIGltcG9ydGFudC5cbiAgICogQHBhcmFtIHtib29sZWFufSBjbG9zZSBJZiB0aGUgbmV3bHkgY3JlYXRlZCBwYXRoIHNob3VsZCBiZSBhIGNsb3NlZCBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFBhdGggb3B0aW9ucyBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgcGF0aC5cbiAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGpvaW4ocGF0aHMsIGNsb3NlLCBvcHRpb25zKSB7XG4gICAgdmFyIGpvaW5lZFBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoY2xvc2UsIG9wdGlvbnMpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBwYXRoLnBhdGhFbGVtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICBqb2luZWRQYXRoLnBhdGhFbGVtZW50cy5wdXNoKHBhdGgucGF0aEVsZW1lbnRzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGpvaW5lZFBhdGg7XG4gIH1cblxuICBDaGFydGlzdC5TdmcuUGF0aCA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IFN2Z1BhdGgsXG4gICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgIHJlbW92ZTogcmVtb3ZlLFxuICAgIG1vdmU6IG1vdmUsXG4gICAgbGluZTogbGluZSxcbiAgICBjdXJ2ZTogY3VydmUsXG4gICAgYXJjOiBhcmMsXG4gICAgc2NhbGU6IHNjYWxlLFxuICAgIHRyYW5zbGF0ZTogdHJhbnNsYXRlLFxuICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtLFxuICAgIHBhcnNlOiBwYXJzZSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeSxcbiAgICBjbG9uZTogY2xvbmUsXG4gICAgc3BsaXRCeUNvbW1hbmQ6IHNwbGl0QnlDb21tYW5kXG4gIH0pO1xuXG4gIENoYXJ0aXN0LlN2Zy5QYXRoLmVsZW1lbnREZXNjcmlwdGlvbnMgPSBlbGVtZW50RGVzY3JpcHRpb25zO1xuICBDaGFydGlzdC5TdmcuUGF0aC5qb2luID0gam9pbjtcbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBheGlzVW5pdHMgPSB7XG4gICAgeDoge1xuICAgICAgcG9zOiAneCcsXG4gICAgICBsZW46ICd3aWR0aCcsXG4gICAgICBkaXI6ICdob3Jpem9udGFsJyxcbiAgICAgIHJlY3RTdGFydDogJ3gxJyxcbiAgICAgIHJlY3RFbmQ6ICd4MicsXG4gICAgICByZWN0T2Zmc2V0OiAneTInXG4gICAgfSxcbiAgICB5OiB7XG4gICAgICBwb3M6ICd5JyxcbiAgICAgIGxlbjogJ2hlaWdodCcsXG4gICAgICBkaXI6ICd2ZXJ0aWNhbCcsXG4gICAgICByZWN0U3RhcnQ6ICd5MicsXG4gICAgICByZWN0RW5kOiAneTEnLFxuICAgICAgcmVjdE9mZnNldDogJ3gxJ1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBBeGlzKHVuaXRzLCBjaGFydFJlY3QsIHRpY2tzLCBvcHRpb25zKSB7XG4gICAgdGhpcy51bml0cyA9IHVuaXRzO1xuICAgIHRoaXMuY291bnRlclVuaXRzID0gdW5pdHMgPT09IGF4aXNVbml0cy54ID8gYXhpc1VuaXRzLnkgOiBheGlzVW5pdHMueDtcbiAgICB0aGlzLmNoYXJ0UmVjdCA9IGNoYXJ0UmVjdDtcbiAgICB0aGlzLmF4aXNMZW5ndGggPSBjaGFydFJlY3RbdW5pdHMucmVjdEVuZF0gLSBjaGFydFJlY3RbdW5pdHMucmVjdFN0YXJ0XTtcbiAgICB0aGlzLmdyaWRPZmZzZXQgPSBjaGFydFJlY3RbdW5pdHMucmVjdE9mZnNldF07XG4gICAgdGhpcy50aWNrcyA9IHRpY2tzO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVHcmlkQW5kTGFiZWxzKGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdXNlRm9yZWlnbk9iamVjdCwgY2hhcnRPcHRpb25zLCBldmVudEVtaXR0ZXIpIHtcbiAgICB2YXIgYXhpc09wdGlvbnMgPSBjaGFydE9wdGlvbnNbJ2F4aXMnICsgdGhpcy51bml0cy5wb3MudG9VcHBlckNhc2UoKV07XG4gICAgdmFyIHByb2plY3RlZFZhbHVlcyA9IHRoaXMudGlja3MubWFwKHRoaXMucHJvamVjdFZhbHVlLmJpbmQodGhpcykpO1xuICAgIHZhciBsYWJlbFZhbHVlcyA9IHRoaXMudGlja3MubWFwKGF4aXNPcHRpb25zLmxhYmVsSW50ZXJwb2xhdGlvbkZuYyk7XG5cbiAgICBwcm9qZWN0ZWRWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbihwcm9qZWN0ZWRWYWx1ZSwgaW5kZXgpIHtcbiAgICAgIHZhciBsYWJlbE9mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfTtcblxuICAgICAgLy8gVE9ETzogRmluZCBiZXR0ZXIgc29sdXRpb24gZm9yIHNvbHZpbmcgdGhpcyBwcm9ibGVtXG4gICAgICAvLyBDYWxjdWxhdGUgaG93IG11Y2ggc3BhY2Ugd2UgaGF2ZSBhdmFpbGFibGUgZm9yIHRoZSBsYWJlbFxuICAgICAgdmFyIGxhYmVsTGVuZ3RoO1xuICAgICAgaWYocHJvamVjdGVkVmFsdWVzW2luZGV4ICsgMV0pIHtcbiAgICAgICAgLy8gSWYgd2Ugc3RpbGwgaGF2ZSBvbmUgbGFiZWwgYWhlYWQsIHdlIGNhbiBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIHRvIHRoZSBuZXh0IHRpY2sgLyBsYWJlbFxuICAgICAgICBsYWJlbExlbmd0aCA9IHByb2plY3RlZFZhbHVlc1tpbmRleCArIDFdIC0gcHJvamVjdGVkVmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgbGFiZWwgYWhlYWQgYW5kIHdlIGhhdmUgb25seSB0d28gbGFiZWxzIGluIHRvdGFsLCB3ZSBqdXN0IHRha2UgdGhlIHJlbWFpbmluZyBkaXN0YW5jZSB0b1xuICAgICAgICAvLyBvbiB0aGUgd2hvbGUgYXhpcyBsZW5ndGguIFdlIGxpbWl0IHRoYXQgdG8gYSBtaW5pbXVtIG9mIDMwIHBpeGVsLCBzbyB0aGF0IGxhYmVscyBjbG9zZSB0byB0aGUgYm9yZGVyIHdpbGxcbiAgICAgICAgLy8gc3RpbGwgYmUgdmlzaWJsZSBpbnNpZGUgb2YgdGhlIGNoYXJ0IHBhZGRpbmcuXG4gICAgICAgIGxhYmVsTGVuZ3RoID0gTWF0aC5tYXgodGhpcy5heGlzTGVuZ3RoIC0gcHJvamVjdGVkVmFsdWUsIDMwKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBncmlkIGxpbmVzIGFuZCBsYWJlbHMgd2hlcmUgaW50ZXJwb2xhdGVkIGxhYmVsIHZhbHVlcyBhcmUgZmFsc2V5IChleGVjcHQgZm9yIDApXG4gICAgICBpZighbGFiZWxWYWx1ZXNbaW5kZXhdICYmIGxhYmVsVmFsdWVzW2luZGV4XSAhPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRyYW5zZm9ybSB0byBnbG9iYWwgY29vcmRpbmF0ZXMgdXNpbmcgdGhlIGNoYXJ0UmVjdFxuICAgICAgLy8gV2UgYWxzbyBuZWVkIHRvIHNldCB0aGUgbGFiZWwgb2Zmc2V0IGZvciB0aGUgY3JlYXRlTGFiZWwgZnVuY3Rpb25cbiAgICAgIGlmKHRoaXMudW5pdHMucG9zID09PSAneCcpIHtcbiAgICAgICAgcHJvamVjdGVkVmFsdWUgPSB0aGlzLmNoYXJ0UmVjdC54MSArIHByb2plY3RlZFZhbHVlO1xuICAgICAgICBsYWJlbE9mZnNldC54ID0gY2hhcnRPcHRpb25zLmF4aXNYLmxhYmVsT2Zmc2V0Lng7XG5cbiAgICAgICAgLy8gSWYgdGhlIGxhYmVscyBzaG91bGQgYmUgcG9zaXRpb25lZCBpbiBzdGFydCBwb3NpdGlvbiAodG9wIHNpZGUgZm9yIHZlcnRpY2FsIGF4aXMpIHdlIG5lZWQgdG8gc2V0IGFcbiAgICAgICAgLy8gZGlmZmVyZW50IG9mZnNldCBhcyBmb3IgcG9zaXRpb25lZCB3aXRoIGVuZCAoYm90dG9tKVxuICAgICAgICBpZihjaGFydE9wdGlvbnMuYXhpc1gucG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgICBsYWJlbE9mZnNldC55ID0gdGhpcy5jaGFydFJlY3QucGFkZGluZy50b3AgKyBjaGFydE9wdGlvbnMuYXhpc1gubGFiZWxPZmZzZXQueSArICh1c2VGb3JlaWduT2JqZWN0ID8gNSA6IDIwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYWJlbE9mZnNldC55ID0gdGhpcy5jaGFydFJlY3QueTEgKyBjaGFydE9wdGlvbnMuYXhpc1gubGFiZWxPZmZzZXQueSArICh1c2VGb3JlaWduT2JqZWN0ID8gNSA6IDIwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvamVjdGVkVmFsdWUgPSB0aGlzLmNoYXJ0UmVjdC55MSAtIHByb2plY3RlZFZhbHVlO1xuICAgICAgICBsYWJlbE9mZnNldC55ID0gY2hhcnRPcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnkgLSAodXNlRm9yZWlnbk9iamVjdCA/IGxhYmVsTGVuZ3RoIDogMCk7XG5cbiAgICAgICAgLy8gSWYgdGhlIGxhYmVscyBzaG91bGQgYmUgcG9zaXRpb25lZCBpbiBzdGFydCBwb3NpdGlvbiAobGVmdCBzaWRlIGZvciBob3Jpem9udGFsIGF4aXMpIHdlIG5lZWQgdG8gc2V0IGFcbiAgICAgICAgLy8gZGlmZmVyZW50IG9mZnNldCBhcyBmb3IgcG9zaXRpb25lZCB3aXRoIGVuZCAocmlnaHQgc2lkZSlcbiAgICAgICAgaWYoY2hhcnRPcHRpb25zLmF4aXNZLnBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgbGFiZWxPZmZzZXQueCA9IHVzZUZvcmVpZ25PYmplY3QgPyB0aGlzLmNoYXJ0UmVjdC5wYWRkaW5nLmxlZnQgKyBjaGFydE9wdGlvbnMuYXhpc1kubGFiZWxPZmZzZXQueCA6IHRoaXMuY2hhcnRSZWN0LngxIC0gMTA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFiZWxPZmZzZXQueCA9IHRoaXMuY2hhcnRSZWN0LngyICsgY2hhcnRPcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnggKyAxMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihheGlzT3B0aW9ucy5zaG93R3JpZCkge1xuICAgICAgICBDaGFydGlzdC5jcmVhdGVHcmlkKHByb2plY3RlZFZhbHVlLCBpbmRleCwgdGhpcywgdGhpcy5ncmlkT2Zmc2V0LCB0aGlzLmNoYXJ0UmVjdFt0aGlzLmNvdW50ZXJVbml0cy5sZW5dKCksIGdyaWRHcm91cCwgW1xuICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jbGFzc05hbWVzLmdyaWQsXG4gICAgICAgICAgY2hhcnRPcHRpb25zLmNsYXNzTmFtZXNbdGhpcy51bml0cy5kaXJdXG4gICAgICAgIF0sIGV2ZW50RW1pdHRlcik7XG4gICAgICB9XG5cbiAgICAgIGlmKGF4aXNPcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICBDaGFydGlzdC5jcmVhdGVMYWJlbChwcm9qZWN0ZWRWYWx1ZSwgbGFiZWxMZW5ndGgsIGluZGV4LCBsYWJlbFZhbHVlcywgdGhpcywgYXhpc09wdGlvbnMub2Zmc2V0LCBsYWJlbE9mZnNldCwgbGFiZWxHcm91cCwgW1xuICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsLFxuICAgICAgICAgIGNoYXJ0T3B0aW9ucy5jbGFzc05hbWVzW3RoaXMudW5pdHMuZGlyXSxcbiAgICAgICAgICBjaGFydE9wdGlvbnMuY2xhc3NOYW1lc1theGlzT3B0aW9ucy5wb3NpdGlvbl1cbiAgICAgICAgXSwgdXNlRm9yZWlnbk9iamVjdCwgZXZlbnRFbWl0dGVyKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9XG5cbiAgQ2hhcnRpc3QuQXhpcyA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IEF4aXMsXG4gICAgY3JlYXRlR3JpZEFuZExhYmVsczogY3JlYXRlR3JpZEFuZExhYmVscyxcbiAgICBwcm9qZWN0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXNlIGF4aXMgY2FuXFwndCBiZSBpbnN0YW50aWF0ZWQhJyk7XG4gICAgfVxuICB9KTtcblxuICBDaGFydGlzdC5BeGlzLnVuaXRzID0gYXhpc1VuaXRzO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgYXV0byBzY2FsZSBheGlzIHVzZXMgc3RhbmRhcmQgbGluZWFyIHNjYWxlIHByb2plY3Rpb24gb2YgdmFsdWVzIGFsb25nIGFuIGF4aXMuIEl0IHVzZXMgb3JkZXIgb2YgbWFnbml0dWRlIHRvIGZpbmQgYSBzY2FsZSBhdXRvbWF0aWNhbGx5IGFuZCBldmFsdWF0ZXMgdGhlIGF2YWlsYWJsZSBzcGFjZSBpbiBvcmRlciB0byBmaW5kIHRoZSBwZXJmZWN0IGFtb3VudCBvZiB0aWNrcyBmb3IgeW91ciBjaGFydC5cbiAqICoqT3B0aW9ucyoqXG4gKiBUaGUgZm9sbG93aW5nIG9wdGlvbnMgYXJlIHVzZWQgYnkgdGhpcyBheGlzIGluIGFkZGl0aW9uIHRvIHRoZSBkZWZhdWx0IGF4aXMgb3B0aW9ucyBvdXRsaW5lZCBpbiB0aGUgYXhpcyBjb25maWd1cmF0aW9uIG9mIHRoZSBjaGFydCBkZWZhdWx0IHNldHRpbmdzLlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIG9wdGlvbnMgPSB7XG4gKiAgIC8vIElmIGhpZ2ggaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGF4aXMgd2lsbCBkaXNwbGF5IHZhbHVlcyBleHBsaWNpdGx5IHVwIHRvIHRoaXMgdmFsdWUgYW5kIHRoZSBjb21wdXRlZCBtYXhpbXVtIGZyb20gdGhlIGRhdGEgaXMgaWdub3JlZFxuICogICBoaWdoOiAxMDAsXG4gKiAgIC8vIElmIGxvdyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgYXhpcyB3aWxsIGRpc3BsYXkgdmFsdWVzIGV4cGxpY2l0bHkgZG93biB0byB0aGlzIHZhbHVlIGFuZCB0aGUgY29tcHV0ZWQgbWluaW11bSBmcm9tIHRoZSBkYXRhIGlzIGlnbm9yZWRcbiAqICAgbG93OiAwLFxuICogICAvLyBUaGlzIG9wdGlvbiB3aWxsIGJlIHVzZWQgd2hlbiBmaW5kaW5nIHRoZSByaWdodCBzY2FsZSBkaXZpc2lvbiBzZXR0aW5ncy4gVGhlIGFtb3VudCBvZiB0aWNrcyBvbiB0aGUgc2NhbGUgd2lsbCBiZSBkZXRlcm1pbmVkIHNvIHRoYXQgYXMgbWFueSB0aWNrcyBhcyBwb3NzaWJsZSB3aWxsIGJlIGRpc3BsYXllZCwgd2hpbGUgbm90IHZpb2xhdGluZyB0aGlzIG1pbmltdW0gcmVxdWlyZWQgc3BhY2UgKGluIHBpeGVsKS5cbiAqICAgc2NhbGVNaW5TcGFjZTogMjAsXG4gKiAgIC8vIENhbiBiZSBzZXQgdG8gdHJ1ZSBvciBmYWxzZS4gSWYgc2V0IHRvIHRydWUsIHRoZSBzY2FsZSB3aWxsIGJlIGdlbmVyYXRlZCB3aXRoIHdob2xlIG51bWJlcnMgb25seS5cbiAqICAgb25seUludGVnZXI6IHRydWUsXG4gKiAgIC8vIFRoZSByZWZlcmVuY2UgdmFsdWUgY2FuIGJlIHVzZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhpcyB2YWx1ZSB3aWxsIGFsd2F5cyBiZSBvbiB0aGUgY2hhcnQuIFRoaXMgaXMgZXNwZWNpYWxseSB1c2VmdWwgb24gYmlwb2xhciBjaGFydHMgd2hlcmUgdGhlIGJpcG9sYXIgY2VudGVyIGFsd2F5cyBuZWVkcyB0byBiZSBwYXJ0IG9mIHRoZSBjaGFydC5cbiAqICAgcmVmZXJlbmNlVmFsdWU6IDVcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LkF1dG9TY2FsZUF4aXNcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBBdXRvU2NhbGVBeGlzKGF4aXNVbml0LCBkYXRhLCBjaGFydFJlY3QsIG9wdGlvbnMpIHtcbiAgICAvLyBVc3VhbGx5IHdlIGNhbGN1bGF0ZSBoaWdoTG93IGJhc2VkIG9uIHRoZSBkYXRhIGJ1dCB0aGlzIGNhbiBiZSBvdmVycmlkZW4gYnkgYSBoaWdoTG93IG9iamVjdCBpbiB0aGUgb3B0aW9uc1xuICAgIHZhciBoaWdoTG93ID0gb3B0aW9ucy5oaWdoTG93IHx8IENoYXJ0aXN0LmdldEhpZ2hMb3coZGF0YS5ub3JtYWxpemVkLCBvcHRpb25zLCBheGlzVW5pdC5wb3MpO1xuICAgIHRoaXMuYm91bmRzID0gQ2hhcnRpc3QuZ2V0Qm91bmRzKGNoYXJ0UmVjdFtheGlzVW5pdC5yZWN0RW5kXSAtIGNoYXJ0UmVjdFtheGlzVW5pdC5yZWN0U3RhcnRdLCBoaWdoTG93LCBvcHRpb25zLnNjYWxlTWluU3BhY2UgfHwgMjAsIG9wdGlvbnMub25seUludGVnZXIpO1xuICAgIHRoaXMucmFuZ2UgPSB7XG4gICAgICBtaW46IHRoaXMuYm91bmRzLm1pbixcbiAgICAgIG1heDogdGhpcy5ib3VuZHMubWF4XG4gICAgfTtcblxuICAgIENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgYXhpc1VuaXQsXG4gICAgICBjaGFydFJlY3QsXG4gICAgICB0aGlzLmJvdW5kcy52YWx1ZXMsXG4gICAgICBvcHRpb25zKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2plY3RWYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmF4aXNMZW5ndGggKiAoK0NoYXJ0aXN0LmdldE11bHRpVmFsdWUodmFsdWUsIHRoaXMudW5pdHMucG9zKSAtIHRoaXMuYm91bmRzLm1pbikgLyB0aGlzLmJvdW5kcy5yYW5nZTtcbiAgfVxuXG4gIENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMgPSBDaGFydGlzdC5BeGlzLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IEF1dG9TY2FsZUF4aXMsXG4gICAgcHJvamVjdFZhbHVlOiBwcm9qZWN0VmFsdWVcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBmaXhlZCBzY2FsZSBheGlzIHVzZXMgc3RhbmRhcmQgbGluZWFyIHByb2plY3Rpb24gb2YgdmFsdWVzIGFsb25nIGFuIGF4aXMuIEl0IG1ha2VzIHVzZSBvZiBhIGRpdmlzb3Igb3B0aW9uIHRvIGRpdmlkZSB0aGUgcmFuZ2UgcHJvdmlkZWQgZnJvbSB0aGUgbWluaW11bSBhbmQgbWF4aW11bSB2YWx1ZSBvciB0aGUgb3B0aW9ucyBoaWdoIGFuZCBsb3cgdGhhdCB3aWxsIG92ZXJyaWRlIHRoZSBjb21wdXRlZCBtaW5pbXVtIGFuZCBtYXhpbXVtLlxuICogKipPcHRpb25zKipcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBhcmUgdXNlZCBieSB0aGlzIGF4aXMgaW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHQgYXhpcyBvcHRpb25zIG91dGxpbmVkIGluIHRoZSBheGlzIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGNoYXJ0IGRlZmF1bHQgc2V0dGluZ3MuXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgb3B0aW9ucyA9IHtcbiAqICAgLy8gSWYgaGlnaCBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgYXhpcyB3aWxsIGRpc3BsYXkgdmFsdWVzIGV4cGxpY2l0bHkgdXAgdG8gdGhpcyB2YWx1ZSBhbmQgdGhlIGNvbXB1dGVkIG1heGltdW0gZnJvbSB0aGUgZGF0YSBpcyBpZ25vcmVkXG4gKiAgIGhpZ2g6IDEwMCxcbiAqICAgLy8gSWYgbG93IGlzIHNwZWNpZmllZCB0aGVuIHRoZSBheGlzIHdpbGwgZGlzcGxheSB2YWx1ZXMgZXhwbGljaXRseSBkb3duIHRvIHRoaXMgdmFsdWUgYW5kIHRoZSBjb21wdXRlZCBtaW5pbXVtIGZyb20gdGhlIGRhdGEgaXMgaWdub3JlZFxuICogICBsb3c6IDAsXG4gKiAgIC8vIElmIHNwZWNpZmllZCB0aGVuIHRoZSB2YWx1ZSByYW5nZSBkZXRlcm1pbmVkIGZyb20gbWluaW11bSB0byBtYXhpbXVtIChvciBsb3cgYW5kIGhpZ2gpIHdpbGwgYmUgZGl2aWRlZCBieSB0aGlzIG51bWJlciBhbmQgdGlja3Mgd2lsbCBiZSBnZW5lcmF0ZWQgYXQgdGhvc2UgZGl2aXNpb24gcG9pbnRzLiBUaGUgZGVmYXVsdCBkaXZpc29yIGlzIDEuXG4gKiAgIGRpdmlzb3I6IDQsXG4gKiAgIC8vIElmIHRpY2tzIGlzIGV4cGxpY2l0bHkgc2V0LCB0aGVuIHRoZSBheGlzIHdpbGwgbm90IGNvbXB1dGUgdGhlIHRpY2tzIHdpdGggdGhlIGRpdmlzb3IsIGJ1dCBkaXJlY3RseSB1c2UgdGhlIGRhdGEgaW4gdGlja3MgdG8gZGV0ZXJtaW5lIGF0IHdoYXQgcG9pbnRzIG9uIHRoZSBheGlzIGEgdGljayBuZWVkIHRvIGJlIGdlbmVyYXRlZC5cbiAqICAgdGlja3M6IFsxLCAxMCwgMjAsIDMwXVxuICogfTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXNcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBGaXhlZFNjYWxlQXhpcyhheGlzVW5pdCwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zKSB7XG4gICAgdmFyIGhpZ2hMb3cgPSBvcHRpb25zLmhpZ2hMb3cgfHwgQ2hhcnRpc3QuZ2V0SGlnaExvdyhkYXRhLm5vcm1hbGl6ZWQsIG9wdGlvbnMsIGF4aXNVbml0LnBvcyk7XG4gICAgdGhpcy5kaXZpc29yID0gb3B0aW9ucy5kaXZpc29yIHx8IDE7XG4gICAgdGhpcy50aWNrcyA9IG9wdGlvbnMudGlja3MgfHwgQ2hhcnRpc3QudGltZXModGhpcy5kaXZpc29yKS5tYXAoZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICByZXR1cm4gaGlnaExvdy5sb3cgKyAoaGlnaExvdy5oaWdoIC0gaGlnaExvdy5sb3cpIC8gdGhpcy5kaXZpc29yICogaW5kZXg7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnRpY2tzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0pO1xuICAgIHRoaXMucmFuZ2UgPSB7XG4gICAgICBtaW46IGhpZ2hMb3cubG93LFxuICAgICAgbWF4OiBoaWdoTG93LmhpZ2hcbiAgICB9O1xuXG4gICAgQ2hhcnRpc3QuRml4ZWRTY2FsZUF4aXMuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgYXhpc1VuaXQsXG4gICAgICBjaGFydFJlY3QsXG4gICAgICB0aGlzLnRpY2tzLFxuICAgICAgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnN0ZXBMZW5ndGggPSB0aGlzLmF4aXNMZW5ndGggLyB0aGlzLmRpdmlzb3I7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9qZWN0VmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5heGlzTGVuZ3RoICogKCtDaGFydGlzdC5nZXRNdWx0aVZhbHVlKHZhbHVlLCB0aGlzLnVuaXRzLnBvcykgLSB0aGlzLnJhbmdlLm1pbikgLyAodGhpcy5yYW5nZS5tYXggLSB0aGlzLnJhbmdlLm1pbik7XG4gIH1cblxuICBDaGFydGlzdC5GaXhlZFNjYWxlQXhpcyA9IENoYXJ0aXN0LkF4aXMuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogRml4ZWRTY2FsZUF4aXMsXG4gICAgcHJvamVjdFZhbHVlOiBwcm9qZWN0VmFsdWVcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBzdGVwIGF4aXMgZm9yIHN0ZXAgYmFzZWQgY2hhcnRzIGxpa2UgYmFyIGNoYXJ0IG9yIHN0ZXAgYmFzZWQgbGluZSBjaGFydHMuIEl0IHVzZXMgYSBmaXhlZCBhbW91bnQgb2YgdGlja3MgdGhhdCB3aWxsIGJlIGVxdWFsbHkgZGlzdHJpYnV0ZWQgYWNyb3NzIHRoZSB3aG9sZSBheGlzIGxlbmd0aC4gVGhlIHByb2plY3Rpb24gaXMgZG9uZSB1c2luZyB0aGUgaW5kZXggb2YgdGhlIGRhdGEgdmFsdWUgcmF0aGVyIHRoYW4gdGhlIHZhbHVlIGl0c2VsZiBhbmQgdGhlcmVmb3JlIGl0J3Mgb25seSB1c2VmdWwgZm9yIGRpc3RyaWJ1dGlvbiBwdXJwb3NlLlxuICogKipPcHRpb25zKipcbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBhcmUgdXNlZCBieSB0aGlzIGF4aXMgaW4gYWRkaXRpb24gdG8gdGhlIGRlZmF1bHQgYXhpcyBvcHRpb25zIG91dGxpbmVkIGluIHRoZSBheGlzIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGNoYXJ0IGRlZmF1bHQgc2V0dGluZ3MuXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgb3B0aW9ucyA9IHtcbiAqICAgLy8gVGlja3MgdG8gYmUgdXNlZCB0byBkaXN0cmlidXRlIGFjcm9zcyB0aGUgYXhpcyBsZW5ndGguIEFzIHRoaXMgYXhpcyB0eXBlIHJlbGllcyBvbiB0aGUgaW5kZXggb2YgdGhlIHZhbHVlIHJhdGhlciB0aGFuIHRoZSB2YWx1ZSwgYXJiaXRyYXJ5IGRhdGEgdGhhdCBjYW4gYmUgY29udmVydGVkIHRvIGEgc3RyaW5nIGNhbiBiZSB1c2VkIGFzIHRpY2tzLlxuICogICB0aWNrczogWydPbmUnLCAnVHdvJywgJ1RocmVlJ10sXG4gKiAgIC8vIElmIHNldCB0byB0cnVlIHRoZSBmdWxsIHdpZHRoIHdpbGwgYmUgdXNlZCB0byBkaXN0cmlidXRlIHRoZSB2YWx1ZXMgd2hlcmUgdGhlIGxhc3QgdmFsdWUgd2lsbCBiZSBhdCB0aGUgbWF4aW11bSBvZiB0aGUgYXhpcyBsZW5ndGguIElmIGZhbHNlIHRoZSBzcGFjZXMgYmV0d2VlbiB0aGUgdGlja3Mgd2lsbCBiZSBldmVubHkgZGlzdHJpYnV0ZWQgaW5zdGVhZC5cbiAqICAgc3RyZXRjaDogdHJ1ZVxuICogfTtcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGUgQ2hhcnRpc3QuU3RlcEF4aXNcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBTdGVwQXhpcyhheGlzVW5pdCwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zKSB7XG4gICAgQ2hhcnRpc3QuU3RlcEF4aXMuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgYXhpc1VuaXQsXG4gICAgICBjaGFydFJlY3QsXG4gICAgICBvcHRpb25zLnRpY2tzLFxuICAgICAgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnN0ZXBMZW5ndGggPSB0aGlzLmF4aXNMZW5ndGggLyAob3B0aW9ucy50aWNrcy5sZW5ndGggLSAob3B0aW9ucy5zdHJldGNoID8gMSA6IDApKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2plY3RWYWx1ZSh2YWx1ZSwgaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGVwTGVuZ3RoICogaW5kZXg7XG4gIH1cblxuICBDaGFydGlzdC5TdGVwQXhpcyA9IENoYXJ0aXN0LkF4aXMuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogU3RlcEF4aXMsXG4gICAgcHJvamVjdFZhbHVlOiBwcm9qZWN0VmFsdWVcbiAgfSk7XG5cbn0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbjsvKipcbiAqIFRoZSBDaGFydGlzdCBsaW5lIGNoYXJ0IGNhbiBiZSB1c2VkIHRvIGRyYXcgTGluZSBvciBTY2F0dGVyIGNoYXJ0cy4gSWYgdXNlZCBpbiB0aGUgYnJvd3NlciB5b3UgY2FuIGFjY2VzcyB0aGUgZ2xvYmFsIGBDaGFydGlzdGAgbmFtZXNwYWNlIHdoZXJlIHlvdSBmaW5kIHRoZSBgTGluZWAgZnVuY3Rpb24gYXMgYSBtYWluIGVudHJ5IHBvaW50LlxuICpcbiAqIEZvciBleGFtcGxlcyBvbiBob3cgdG8gdXNlIHRoZSBsaW5lIGNoYXJ0IHBsZWFzZSBjaGVjayB0aGUgZXhhbXBsZXMgb2YgdGhlIGBDaGFydGlzdC5MaW5lYCBtZXRob2QuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5MaW5lXG4gKi9cbi8qIGdsb2JhbCBDaGFydGlzdCAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgaW4gbGluZSBjaGFydHMuIEV4cGFuZCB0aGUgY29kZSB2aWV3IHRvIHNlZSBhIGRldGFpbGVkIGxpc3Qgb2Ygb3B0aW9ucyB3aXRoIGNvbW1lbnRzLlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuTGluZVxuICAgKi9cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIC8vIE9wdGlvbnMgZm9yIFgtQXhpc1xuICAgIGF4aXNYOiB7XG4gICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBsYWJlbHMgdG8gdGhlIGNoYXJ0IGFyZWFcbiAgICAgIG9mZnNldDogMzAsXG4gICAgICAvLyBQb3NpdGlvbiB3aGVyZSBsYWJlbHMgYXJlIHBsYWNlZC4gQ2FuIGJlIHNldCB0byBgc3RhcnRgIG9yIGBlbmRgIHdoZXJlIGBzdGFydGAgaXMgZXF1aXZhbGVudCB0byBsZWZ0IG9yIHRvcCBvbiB2ZXJ0aWNhbCBheGlzIGFuZCBgZW5kYCBpcyBlcXVpdmFsZW50IHRvIHJpZ2h0IG9yIGJvdHRvbSBvbiBob3Jpem9udGFsIGF4aXMuXG4gICAgICBwb3NpdGlvbjogJ2VuZCcsXG4gICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgbGFiZWxPZmZzZXQ6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIC8vIElmIGxhYmVscyBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAvLyBJZiB0aGUgYXhpcyBncmlkIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgIHNob3dHcmlkOiB0cnVlLFxuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgICAvLyBTZXQgdGhlIGF4aXMgdHlwZSB0byBiZSB1c2VkIHRvIHByb2plY3QgdmFsdWVzIG9uIHRoaXMgYXhpcy4gSWYgbm90IGRlZmluZWQsIENoYXJ0aXN0LlN0ZXBBeGlzIHdpbGwgYmUgdXNlZCBmb3IgdGhlIFgtQXhpcywgd2hlcmUgdGhlIHRpY2tzIG9wdGlvbiB3aWxsIGJlIHNldCB0byB0aGUgbGFiZWxzIGluIHRoZSBkYXRhIGFuZCB0aGUgc3RyZXRjaCBvcHRpb24gd2lsbCBiZSBzZXQgdG8gdGhlIGdsb2JhbCBmdWxsV2lkdGggb3B0aW9uLiBUaGlzIHR5cGUgY2FuIGJlIGNoYW5nZWQgdG8gYW55IGF4aXMgY29uc3RydWN0b3IgYXZhaWxhYmxlIChlLmcuIENoYXJ0aXN0LkZpeGVkU2NhbGVBeGlzKSwgd2hlcmUgYWxsIGF4aXMgb3B0aW9ucyBzaG91bGQgYmUgcHJlc2VudCBoZXJlLlxuICAgICAgdHlwZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICAvLyBPcHRpb25zIGZvciBZLUF4aXNcbiAgICBheGlzWToge1xuICAgICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgbGFiZWxzIHRvIHRoZSBjaGFydCBhcmVhXG4gICAgICBvZmZzZXQ6IDQwLFxuICAgICAgLy8gUG9zaXRpb24gd2hlcmUgbGFiZWxzIGFyZSBwbGFjZWQuIENhbiBiZSBzZXQgdG8gYHN0YXJ0YCBvciBgZW5kYCB3aGVyZSBgc3RhcnRgIGlzIGVxdWl2YWxlbnQgdG8gbGVmdCBvciB0b3Agb24gdmVydGljYWwgYXhpcyBhbmQgYGVuZGAgaXMgZXF1aXZhbGVudCB0byByaWdodCBvciBib3R0b20gb24gaG9yaXpvbnRhbCBheGlzLlxuICAgICAgcG9zaXRpb246ICdzdGFydCcsXG4gICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgbGFiZWxPZmZzZXQ6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIC8vIElmIGxhYmVscyBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAvLyBJZiB0aGUgYXhpcyBncmlkIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgIHNob3dHcmlkOiB0cnVlLFxuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgICAvLyBTZXQgdGhlIGF4aXMgdHlwZSB0byBiZSB1c2VkIHRvIHByb2plY3QgdmFsdWVzIG9uIHRoaXMgYXhpcy4gSWYgbm90IGRlZmluZWQsIENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMgd2lsbCBiZSB1c2VkIGZvciB0aGUgWS1BeGlzLCB3aGVyZSB0aGUgaGlnaCBhbmQgbG93IG9wdGlvbnMgd2lsbCBiZSBzZXQgdG8gdGhlIGdsb2JhbCBoaWdoIGFuZCBsb3cgb3B0aW9ucy4gVGhpcyB0eXBlIGNhbiBiZSBjaGFuZ2VkIHRvIGFueSBheGlzIGNvbnN0cnVjdG9yIGF2YWlsYWJsZSAoZS5nLiBDaGFydGlzdC5GaXhlZFNjYWxlQXhpcyksIHdoZXJlIGFsbCBheGlzIG9wdGlvbnMgc2hvdWxkIGJlIHByZXNlbnQgaGVyZS5cbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIC8vIFRoaXMgdmFsdWUgc3BlY2lmaWVzIHRoZSBtaW5pbXVtIGhlaWdodCBpbiBwaXhlbCBvZiB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIHNjYWxlTWluU3BhY2U6IDIwLFxuICAgICAgLy8gVXNlIG9ubHkgaW50ZWdlciB2YWx1ZXMgKHdob2xlIG51bWJlcnMpIGZvciB0aGUgc2NhbGUgc3RlcHNcbiAgICAgIG9ubHlJbnRlZ2VyOiBmYWxzZVxuICAgIH0sXG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIHdpZHRoIGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCBoZWlnaHQgZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIGhlaWdodDogdW5kZWZpbmVkLFxuICAgIC8vIElmIHRoZSBsaW5lIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICBzaG93TGluZTogdHJ1ZSxcbiAgICAvLyBJZiBkb3RzIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICBzaG93UG9pbnQ6IHRydWUsXG4gICAgLy8gSWYgdGhlIGxpbmUgY2hhcnQgc2hvdWxkIGRyYXcgYW4gYXJlYVxuICAgIHNob3dBcmVhOiBmYWxzZSxcbiAgICAvLyBUaGUgYmFzZSBmb3IgdGhlIGFyZWEgY2hhcnQgdGhhdCB3aWxsIGJlIHVzZWQgdG8gY2xvc2UgdGhlIGFyZWEgc2hhcGUgKGlzIG5vcm1hbGx5IDApXG4gICAgYXJlYUJhc2U6IDAsXG4gICAgLy8gU3BlY2lmeSBpZiB0aGUgbGluZXMgc2hvdWxkIGJlIHNtb290aGVkLiBUaGlzIHZhbHVlIGNhbiBiZSB0cnVlIG9yIGZhbHNlIHdoZXJlIHRydWUgd2lsbCByZXN1bHQgaW4gc21vb3RoaW5nIHVzaW5nIHRoZSBkZWZhdWx0IHNtb290aGluZyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwgYW5kIGZhbHNlIHJlc3VsdHMgaW4gQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lLiBZb3UgY2FuIGFsc28gY2hvb3NlIG90aGVyIHNtb290aGluZyAvIGludGVycG9sYXRpb24gZnVuY3Rpb25zIGF2YWlsYWJsZSBpbiB0aGUgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbiBtb2R1bGUsIG9yIHdyaXRlIHlvdXIgb3duIGludGVycG9sYXRpb24gZnVuY3Rpb24uIENoZWNrIHRoZSBleGFtcGxlcyBmb3IgYSBicmllZiBkZXNjcmlwdGlvbi5cbiAgICBsaW5lU21vb3RoOiB0cnVlLFxuICAgIC8vIE92ZXJyaWRpbmcgdGhlIG5hdHVyYWwgbG93IG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBsb3dlc3QgZGlzcGxheWVkIHZhbHVlXG4gICAgbG93OiB1bmRlZmluZWQsXG4gICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBoaWdoIG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBoaWdoZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgIGhpZ2g6IHVuZGVmaW5lZCxcbiAgICAvLyBQYWRkaW5nIG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGNvbnRhaW5lciBlbGVtZW50IGFuZCBsYWJlbHMgYXMgYSBudW1iZXIgb3IgcGFkZGluZyBvYmplY3Qge3RvcDogNSwgcmlnaHQ6IDUsIGJvdHRvbTogNSwgbGVmdDogNX1cbiAgICBjaGFydFBhZGRpbmc6IHtcbiAgICAgIHRvcDogMTUsXG4gICAgICByaWdodDogMTUsXG4gICAgICBib3R0b206IDUsXG4gICAgICBsZWZ0OiAxMFxuICAgIH0sXG4gICAgLy8gV2hlbiBzZXQgdG8gdHJ1ZSwgdGhlIGxhc3QgZ3JpZCBsaW5lIG9uIHRoZSB4LWF4aXMgaXMgbm90IGRyYXduIGFuZCB0aGUgY2hhcnQgZWxlbWVudHMgd2lsbCBleHBhbmQgdG8gdGhlIGZ1bGwgYXZhaWxhYmxlIHdpZHRoIG9mIHRoZSBjaGFydC4gRm9yIHRoZSBsYXN0IGxhYmVsIHRvIGJlIGRyYXduIGNvcnJlY3RseSB5b3UgbWlnaHQgbmVlZCB0byBhZGQgY2hhcnQgcGFkZGluZyBvciBvZmZzZXQgdGhlIGxhc3QgbGFiZWwgd2l0aCBhIGRyYXcgZXZlbnQgaGFuZGxlci5cbiAgICBmdWxsV2lkdGg6IGZhbHNlLFxuICAgIC8vIElmIHRydWUgdGhlIHdob2xlIGRhdGEgaXMgcmV2ZXJzZWQgaW5jbHVkaW5nIGxhYmVscywgdGhlIHNlcmllcyBvcmRlciBhcyB3ZWxsIGFzIHRoZSB3aG9sZSBzZXJpZXMgZGF0YSBhcnJheXMuXG4gICAgcmV2ZXJzZURhdGE6IGZhbHNlLFxuICAgIC8vIE92ZXJyaWRlIHRoZSBjbGFzcyBuYW1lcyB0aGF0IGdldCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBTVkcgc3RydWN0dXJlIG9mIHRoZSBjaGFydFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGNoYXJ0OiAnY3QtY2hhcnQtbGluZScsXG4gICAgICBsYWJlbDogJ2N0LWxhYmVsJyxcbiAgICAgIGxhYmVsR3JvdXA6ICdjdC1sYWJlbHMnLFxuICAgICAgc2VyaWVzOiAnY3Qtc2VyaWVzJyxcbiAgICAgIGxpbmU6ICdjdC1saW5lJyxcbiAgICAgIHBvaW50OiAnY3QtcG9pbnQnLFxuICAgICAgYXJlYTogJ2N0LWFyZWEnLFxuICAgICAgZ3JpZDogJ2N0LWdyaWQnLFxuICAgICAgZ3JpZEdyb3VwOiAnY3QtZ3JpZHMnLFxuICAgICAgdmVydGljYWw6ICdjdC12ZXJ0aWNhbCcsXG4gICAgICBob3Jpem9udGFsOiAnY3QtaG9yaXpvbnRhbCcsXG4gICAgICBzdGFydDogJ2N0LXN0YXJ0JyxcbiAgICAgIGVuZDogJ2N0LWVuZCdcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY2hhcnRcbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KG9wdGlvbnMpIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHJhdzogdGhpcy5kYXRhLFxuICAgICAgbm9ybWFsaXplZDogQ2hhcnRpc3QuZ2V0RGF0YUFycmF5KHRoaXMuZGF0YSwgb3B0aW9ucy5yZXZlcnNlRGF0YSwgdHJ1ZSlcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIG5ldyBzdmcgb2JqZWN0XG4gICAgdGhpcy5zdmcgPSBDaGFydGlzdC5jcmVhdGVTdmcodGhpcy5jb250YWluZXIsIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0LCBvcHRpb25zLmNsYXNzTmFtZXMuY2hhcnQpO1xuICAgIC8vIENyZWF0ZSBncm91cHMgZm9yIGxhYmVscywgZ3JpZCBhbmQgc2VyaWVzXG4gICAgdmFyIGdyaWRHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZXMuZ3JpZEdyb3VwKTtcbiAgICB2YXIgc2VyaWVzR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJyk7XG4gICAgdmFyIGxhYmVsR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsR3JvdXApO1xuXG4gICAgdmFyIGNoYXJ0UmVjdCA9IENoYXJ0aXN0LmNyZWF0ZUNoYXJ0UmVjdCh0aGlzLnN2Zywgb3B0aW9ucywgZGVmYXVsdE9wdGlvbnMucGFkZGluZyk7XG4gICAgdmFyIGF4aXNYLCBheGlzWTtcblxuICAgIGlmKG9wdGlvbnMuYXhpc1gudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBheGlzWCA9IG5ldyBDaGFydGlzdC5TdGVwQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNYLCB7XG4gICAgICAgIHRpY2tzOiBkYXRhLnJhdy5sYWJlbHMsXG4gICAgICAgIHN0cmV0Y2g6IG9wdGlvbnMuZnVsbFdpZHRoXG4gICAgICB9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF4aXNYID0gb3B0aW9ucy5heGlzWC50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueCwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zLmF4aXNYKTtcbiAgICB9XG5cbiAgICBpZihvcHRpb25zLmF4aXNZLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXhpc1kgPSBuZXcgQ2hhcnRpc3QuQXV0b1NjYWxlQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBvcHRpb25zLmF4aXNZLCB7XG4gICAgICAgIGhpZ2g6IENoYXJ0aXN0LmlzTnVtKG9wdGlvbnMuaGlnaCkgPyBvcHRpb25zLmhpZ2ggOiBvcHRpb25zLmF4aXNZLmhpZ2gsXG4gICAgICAgIGxvdzogQ2hhcnRpc3QuaXNOdW0ob3B0aW9ucy5sb3cpID8gb3B0aW9ucy5sb3cgOiBvcHRpb25zLmF4aXNZLmxvd1xuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlzWSA9IG9wdGlvbnMuYXhpc1kudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucy5heGlzWSk7XG4gICAgfVxuXG4gICAgYXhpc1guY3JlYXRlR3JpZEFuZExhYmVscyhncmlkR3JvdXAsIGxhYmVsR3JvdXAsIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0LCBvcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG4gICAgYXhpc1kuY3JlYXRlR3JpZEFuZExhYmVscyhncmlkR3JvdXAsIGxhYmVsR3JvdXAsIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0LCBvcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG5cbiAgICAvLyBEcmF3IHRoZSBzZXJpZXNcbiAgICBkYXRhLnJhdy5zZXJpZXMuZm9yRWFjaChmdW5jdGlvbihzZXJpZXMsIHNlcmllc0luZGV4KSB7XG4gICAgICB2YXIgc2VyaWVzRWxlbWVudCA9IHNlcmllc0dyb3VwLmVsZW0oJ2cnKTtcblxuICAgICAgLy8gV3JpdGUgYXR0cmlidXRlcyB0byBzZXJpZXMgZ3JvdXAgZWxlbWVudC4gSWYgc2VyaWVzIG5hbWUgb3IgbWV0YSBpcyB1bmRlZmluZWQgdGhlIGF0dHJpYnV0ZXMgd2lsbCBub3QgYmUgd3JpdHRlblxuICAgICAgc2VyaWVzRWxlbWVudC5hdHRyKHtcbiAgICAgICAgJ3Nlcmllcy1uYW1lJzogc2VyaWVzLm5hbWUsXG4gICAgICAgICdtZXRhJzogQ2hhcnRpc3Quc2VyaWFsaXplKHNlcmllcy5tZXRhKVxuICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgLy8gVXNlIHNlcmllcyBjbGFzcyBmcm9tIHNlcmllcyBkYXRhIG9yIGlmIG5vdCBzZXQgZ2VuZXJhdGUgb25lXG4gICAgICBzZXJpZXNFbGVtZW50LmFkZENsYXNzKFtcbiAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyxcbiAgICAgICAgKHNlcmllcy5jbGFzc05hbWUgfHwgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyArICctJyArIENoYXJ0aXN0LmFscGhhTnVtZXJhdGUoc2VyaWVzSW5kZXgpKVxuICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICB2YXIgcGF0aENvb3JkaW5hdGVzID0gW10sXG4gICAgICAgIHBhdGhEYXRhID0gW107XG5cbiAgICAgIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgdmFsdWVJbmRleCkge1xuICAgICAgICB2YXIgcCA9IHtcbiAgICAgICAgICB4OiBjaGFydFJlY3QueDEgKyBheGlzWC5wcm9qZWN0VmFsdWUodmFsdWUsIHZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pLFxuICAgICAgICAgIHk6IGNoYXJ0UmVjdC55MSAtIGF4aXNZLnByb2plY3RWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCwgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSlcbiAgICAgICAgfTtcbiAgICAgICAgcGF0aENvb3JkaW5hdGVzLnB1c2gocC54LCBwLnkpO1xuICAgICAgICBwYXRoRGF0YS5wdXNoKHtcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgdmFsdWVJbmRleDogdmFsdWVJbmRleCxcbiAgICAgICAgICBtZXRhOiBDaGFydGlzdC5nZXRNZXRhRGF0YShzZXJpZXMsIHZhbHVlSW5kZXgpXG4gICAgICAgIH0pO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdmFyIHNlcmllc09wdGlvbnMgPSB7XG4gICAgICAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LmdldFNlcmllc09wdGlvbihzZXJpZXMsIG9wdGlvbnMsICdsaW5lU21vb3RoJyksXG4gICAgICAgIHNob3dQb2ludDogQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uKHNlcmllcywgb3B0aW9ucywgJ3Nob3dQb2ludCcpLFxuICAgICAgICBzaG93TGluZTogQ2hhcnRpc3QuZ2V0U2VyaWVzT3B0aW9uKHNlcmllcywgb3B0aW9ucywgJ3Nob3dMaW5lJyksXG4gICAgICAgIHNob3dBcmVhOiBDaGFydGlzdC5nZXRTZXJpZXNPcHRpb24oc2VyaWVzLCBvcHRpb25zLCAnc2hvd0FyZWEnKSxcbiAgICAgICAgYXJlYUJhc2U6IENoYXJ0aXN0LmdldFNlcmllc09wdGlvbihzZXJpZXMsIG9wdGlvbnMsICdhcmVhQmFzZScpXG4gICAgICB9O1xuXG4gICAgICB2YXIgc21vb3RoaW5nID0gdHlwZW9mIHNlcmllc09wdGlvbnMubGluZVNtb290aCA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHNlcmllc09wdGlvbnMubGluZVNtb290aCA6IChzZXJpZXNPcHRpb25zLmxpbmVTbW9vdGggPyBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsKCkgOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUoKSk7XG4gICAgICAvLyBJbnRlcnBvbGF0aW5nIHBhdGggd2hlcmUgcGF0aERhdGEgd2lsbCBiZSB1c2VkIHRvIGFubm90YXRlIGVhY2ggcGF0aCBlbGVtZW50IHNvIHdlIGNhbiB0cmFjZSBiYWNrIHRoZSBvcmlnaW5hbFxuICAgICAgLy8gaW5kZXgsIHZhbHVlIGFuZCBtZXRhIGRhdGFcbiAgICAgIHZhciBwYXRoID0gc21vb3RoaW5nKHBhdGhDb29yZGluYXRlcywgcGF0aERhdGEpO1xuXG4gICAgICAvLyBJZiB3ZSBzaG91bGQgc2hvdyBwb2ludHMgd2UgbmVlZCB0byBjcmVhdGUgdGhlbSBub3cgdG8gYXZvaWQgc2Vjb25kYXJ5IGxvb3BcbiAgICAgIC8vIFBvaW50cyBhcmUgZHJhd24gZnJvbSB0aGUgcGF0aEVsZW1lbnRzIHJldHVybmVkIGJ5IHRoZSBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uXG4gICAgICAvLyBTbWFsbCBvZmZzZXQgZm9yIEZpcmVmb3ggdG8gcmVuZGVyIHNxdWFyZXMgY29ycmVjdGx5XG4gICAgICBpZiAoc2VyaWVzT3B0aW9ucy5zaG93UG9pbnQpIHtcblxuICAgICAgICBwYXRoLnBhdGhFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGhFbGVtZW50KSB7XG4gICAgICAgICAgdmFyIHBvaW50ID0gc2VyaWVzRWxlbWVudC5lbGVtKCdsaW5lJywge1xuICAgICAgICAgICAgeDE6IHBhdGhFbGVtZW50LngsXG4gICAgICAgICAgICB5MTogcGF0aEVsZW1lbnQueSxcbiAgICAgICAgICAgIHgyOiBwYXRoRWxlbWVudC54ICsgMC4wMSxcbiAgICAgICAgICAgIHkyOiBwYXRoRWxlbWVudC55XG4gICAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLnBvaW50KS5hdHRyKHtcbiAgICAgICAgICAgICd2YWx1ZSc6IFtwYXRoRWxlbWVudC5kYXRhLnZhbHVlLngsIHBhdGhFbGVtZW50LmRhdGEudmFsdWUueV0uZmlsdGVyKGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgICAgfSkuam9pbignLCcpLFxuICAgICAgICAgICAgJ21ldGEnOiBwYXRoRWxlbWVudC5kYXRhLm1ldGFcbiAgICAgICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgICAgIHR5cGU6ICdwb2ludCcsXG4gICAgICAgICAgICB2YWx1ZTogcGF0aEVsZW1lbnQuZGF0YS52YWx1ZSxcbiAgICAgICAgICAgIGluZGV4OiBwYXRoRWxlbWVudC5kYXRhLnZhbHVlSW5kZXgsXG4gICAgICAgICAgICBtZXRhOiBwYXRoRWxlbWVudC5kYXRhLm1ldGEsXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0luZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgICAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgICAgICAgIGdyb3VwOiBzZXJpZXNFbGVtZW50LFxuICAgICAgICAgICAgZWxlbWVudDogcG9pbnQsXG4gICAgICAgICAgICB4OiBwYXRoRWxlbWVudC54LFxuICAgICAgICAgICAgeTogcGF0aEVsZW1lbnQueVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfVxuXG4gICAgICBpZihzZXJpZXNPcHRpb25zLnNob3dMaW5lKSB7XG4gICAgICAgIHZhciBsaW5lID0gc2VyaWVzRWxlbWVudC5lbGVtKCdwYXRoJywge1xuICAgICAgICAgIGQ6IHBhdGguc3RyaW5naWZ5KClcbiAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLmxpbmUsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgIHZhbHVlczogZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSxcbiAgICAgICAgICBwYXRoOiBwYXRoLmNsb25lKCksXG4gICAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgICAgaW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgIHNlcmllczogc2VyaWVzLFxuICAgICAgICAgIHNlcmllc0luZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICBheGlzWDogYXhpc1gsXG4gICAgICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgICAgIGdyb3VwOiBzZXJpZXNFbGVtZW50LFxuICAgICAgICAgIGVsZW1lbnQ6IGxpbmVcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFyZWEgY3VycmVudGx5IG9ubHkgd29ya3Mgd2l0aCBheGVzIHRoYXQgc3VwcG9ydCBhIHJhbmdlIVxuICAgICAgaWYoc2VyaWVzT3B0aW9ucy5zaG93QXJlYSAmJiBheGlzWS5yYW5nZSkge1xuICAgICAgICAvLyBJZiBhcmVhQmFzZSBpcyBvdXRzaWRlIHRoZSBjaGFydCBhcmVhICg8IG1pbiBvciA+IG1heCkgd2UgbmVlZCB0byBzZXQgaXQgcmVzcGVjdGl2ZWx5IHNvIHRoYXRcbiAgICAgICAgLy8gdGhlIGFyZWEgaXMgbm90IGRyYXduIG91dHNpZGUgdGhlIGNoYXJ0IGFyZWEuXG4gICAgICAgIHZhciBhcmVhQmFzZSA9IE1hdGgubWF4KE1hdGgubWluKHNlcmllc09wdGlvbnMuYXJlYUJhc2UsIGF4aXNZLnJhbmdlLm1heCksIGF4aXNZLnJhbmdlLm1pbik7XG5cbiAgICAgICAgLy8gV2UgcHJvamVjdCB0aGUgYXJlYUJhc2UgdmFsdWUgaW50byBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgdmFyIGFyZWFCYXNlUHJvamVjdGVkID0gY2hhcnRSZWN0LnkxIC0gYXhpc1kucHJvamVjdFZhbHVlKGFyZWFCYXNlKTtcblxuICAgICAgICAvLyBJbiBvcmRlciB0byBmb3JtIHRoZSBhcmVhIHdlJ2xsIGZpcnN0IHNwbGl0IHRoZSBwYXRoIGJ5IG1vdmUgY29tbWFuZHMgc28gd2UgY2FuIGNodW5rIGl0IHVwIGludG8gc2VnbWVudHNcbiAgICAgICAgcGF0aC5zcGxpdEJ5Q29tbWFuZCgnTScpLmZpbHRlcihmdW5jdGlvbiBvbmx5U29saWRTZWdtZW50cyhwYXRoU2VnbWVudCkge1xuICAgICAgICAgIC8vIFdlIGZpbHRlciBvbmx5IFwic29saWRcIiBzZWdtZW50cyB0aGF0IGNvbnRhaW4gbW9yZSB0aGFuIG9uZSBwb2ludC4gT3RoZXJ3aXNlIHRoZXJlJ3Mgbm8gbmVlZCBmb3IgYW4gYXJlYVxuICAgICAgICAgIHJldHVybiBwYXRoU2VnbWVudC5wYXRoRWxlbWVudHMubGVuZ3RoID4gMTtcbiAgICAgICAgfSkubWFwKGZ1bmN0aW9uIGNvbnZlcnRUb0FyZWEoc29saWRQYXRoU2VnbWVudHMpIHtcbiAgICAgICAgICAvLyBSZWNlaXZpbmcgdGhlIGZpbHRlcmVkIHNvbGlkIHBhdGggc2VnbWVudHMgd2UgY2FuIG5vdyBjb252ZXJ0IHRob3NlIHNlZ21lbnRzIGludG8gZmlsbCBhcmVhc1xuICAgICAgICAgIHZhciBmaXJzdEVsZW1lbnQgPSBzb2xpZFBhdGhTZWdtZW50cy5wYXRoRWxlbWVudHNbMF07XG4gICAgICAgICAgdmFyIGxhc3RFbGVtZW50ID0gc29saWRQYXRoU2VnbWVudHMucGF0aEVsZW1lbnRzW3NvbGlkUGF0aFNlZ21lbnRzLnBhdGhFbGVtZW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICAgIC8vIENsb25pbmcgdGhlIHNvbGlkIHBhdGggc2VnbWVudCB3aXRoIGNsb3Npbmcgb3B0aW9uIGFuZCByZW1vdmluZyB0aGUgZmlyc3QgbW92ZSBjb21tYW5kIGZyb20gdGhlIGNsb25lXG4gICAgICAgICAgLy8gV2UgdGhlbiBpbnNlcnQgYSBuZXcgbW92ZSB0aGF0IHNob3VsZCBzdGFydCBhdCB0aGUgYXJlYSBiYXNlIGFuZCBkcmF3IGEgc3RyYWlnaHQgbGluZSB1cCBvciBkb3duXG4gICAgICAgICAgLy8gYXQgdGhlIGVuZCBvZiB0aGUgcGF0aCB3ZSBhZGQgYW4gYWRkaXRpb25hbCBzdHJhaWdodCBsaW5lIHRvIHRoZSBwcm9qZWN0ZWQgYXJlYSBiYXNlIHZhbHVlXG4gICAgICAgICAgLy8gQXMgdGhlIGNsb3Npbmcgb3B0aW9uIGlzIHNldCBvdXIgcGF0aCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgY2xvc2VkXG4gICAgICAgICAgcmV0dXJuIHNvbGlkUGF0aFNlZ21lbnRzLmNsb25lKHRydWUpXG4gICAgICAgICAgICAucG9zaXRpb24oMClcbiAgICAgICAgICAgIC5yZW1vdmUoMSlcbiAgICAgICAgICAgIC5tb3ZlKGZpcnN0RWxlbWVudC54LCBhcmVhQmFzZVByb2plY3RlZClcbiAgICAgICAgICAgIC5saW5lKGZpcnN0RWxlbWVudC54LCBmaXJzdEVsZW1lbnQueSlcbiAgICAgICAgICAgIC5wb3NpdGlvbihzb2xpZFBhdGhTZWdtZW50cy5wYXRoRWxlbWVudHMubGVuZ3RoICsgMSlcbiAgICAgICAgICAgIC5saW5lKGxhc3RFbGVtZW50LngsIGFyZWFCYXNlUHJvamVjdGVkKTtcblxuICAgICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIGNyZWF0ZUFyZWEoYXJlYVBhdGgpIHtcbiAgICAgICAgICAvLyBGb3IgZWFjaCBvZiBvdXIgbmV3bHkgY3JlYXRlZCBhcmVhIHBhdGhzLCB3ZSdsbCBub3cgY3JlYXRlIHBhdGggZWxlbWVudHMgYnkgc3RyaW5naWZ5aW5nIG91ciBwYXRoIG9iamVjdHNcbiAgICAgICAgICAvLyBhbmQgYWRkaW5nIHRoZSBjcmVhdGVkIERPTSBlbGVtZW50cyB0byB0aGUgY29ycmVjdCBzZXJpZXMgZ3JvdXBcbiAgICAgICAgICB2YXIgYXJlYSA9IHNlcmllc0VsZW1lbnQuZWxlbSgncGF0aCcsIHtcbiAgICAgICAgICAgIGQ6IGFyZWFQYXRoLnN0cmluZ2lmeSgpXG4gICAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLmFyZWEsIHRydWUpLmF0dHIoe1xuICAgICAgICAgICAgJ3ZhbHVlcyc6IGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF1cbiAgICAgICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAgICAgLy8gRW1pdCBhbiBldmVudCBmb3IgZWFjaCBhcmVhIHRoYXQgd2FzIGRyYXduXG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgICAgIHR5cGU6ICdhcmVhJyxcbiAgICAgICAgICAgIHZhbHVlczogZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XSxcbiAgICAgICAgICAgIHBhdGg6IGFyZWFQYXRoLmNsb25lKCksXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgICAgICAgIHNlcmllc0luZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgICAgICAgIGF4aXNZOiBheGlzWSxcbiAgICAgICAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgICAgICAgaW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgICAgZ3JvdXA6IHNlcmllc0VsZW1lbnQsXG4gICAgICAgICAgICBlbGVtZW50OiBhcmVhXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2NyZWF0ZWQnLCB7XG4gICAgICBib3VuZHM6IGF4aXNZLmJvdW5kcyxcbiAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgc3ZnOiB0aGlzLnN2ZyxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGxpbmUgY2hhcnQuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5MaW5lXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IHF1ZXJ5IEEgc2VsZWN0b3IgcXVlcnkgc3RyaW5nIG9yIGRpcmVjdGx5IGEgRE9NIGVsZW1lbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IHRoYXQgbmVlZHMgdG8gY29uc2lzdCBvZiBhIGxhYmVscyBhbmQgYSBzZXJpZXMgYXJyYXlcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3Qgd2l0aCBvcHRpb25zIHRoYXQgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBhIGRldGFpbGVkIGxpc3QuXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtyZXNwb25zaXZlT3B0aW9uc10gU3BlY2lmeSBhbiBhcnJheSBvZiByZXNwb25zaXZlIG9wdGlvbiBhcnJheXMgd2hpY2ggYXJlIGEgbWVkaWEgcXVlcnkgYW5kIG9wdGlvbnMgb2JqZWN0IHBhaXIgPT4gW1ttZWRpYVF1ZXJ5U3RyaW5nLCBvcHRpb25zT2JqZWN0XSxbbW9yZS4uLl1dXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdoaWNoIGV4cG9zZXMgdGhlIEFQSSBmb3IgdGhlIGNyZWF0ZWQgY2hhcnRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gQ3JlYXRlIGEgc2ltcGxlIGxpbmUgY2hhcnRcbiAgICogdmFyIGRhdGEgPSB7XG4gICAqICAgLy8gQSBsYWJlbHMgYXJyYXkgdGhhdCBjYW4gY29udGFpbiBhbnkgc29ydCBvZiB2YWx1ZXNcbiAgICogICBsYWJlbHM6IFsnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaSddLFxuICAgKiAgIC8vIE91ciBzZXJpZXMgYXJyYXkgdGhhdCBjb250YWlucyBzZXJpZXMgb2JqZWN0cyBvciBpbiB0aGlzIGNhc2Ugc2VyaWVzIGRhdGEgYXJyYXlzXG4gICAqICAgc2VyaWVzOiBbXG4gICAqICAgICBbNSwgMiwgNCwgMiwgMF1cbiAgICogICBdXG4gICAqIH07XG4gICAqXG4gICAqIC8vIEFzIG9wdGlvbnMgd2UgY3VycmVudGx5IG9ubHkgc2V0IGEgc3RhdGljIHNpemUgb2YgMzAweDIwMCBweFxuICAgKiB2YXIgb3B0aW9ucyA9IHtcbiAgICogICB3aWR0aDogJzMwMHB4JyxcbiAgICogICBoZWlnaHQ6ICcyMDBweCdcbiAgICogfTtcbiAgICpcbiAgICogLy8gSW4gdGhlIGdsb2JhbCBuYW1lIHNwYWNlIENoYXJ0aXN0IHdlIGNhbGwgdGhlIExpbmUgZnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSBhIGxpbmUgY2hhcnQuIEFzIGEgZmlyc3QgcGFyYW1ldGVyIHdlIHBhc3MgaW4gYSBzZWxlY3RvciB3aGVyZSB3ZSB3b3VsZCBsaWtlIHRvIGdldCBvdXIgY2hhcnQgY3JlYXRlZC4gU2Vjb25kIHBhcmFtZXRlciBpcyB0aGUgYWN0dWFsIGRhdGEgb2JqZWN0IGFuZCBhcyBhIHRoaXJkIHBhcmFtZXRlciB3ZSBwYXNzIGluIG91ciBvcHRpb25zXG4gICAqIG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCBkYXRhLCBvcHRpb25zKTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gVXNlIHNwZWNpZmljIGludGVycG9sYXRpb24gZnVuY3Rpb24gd2l0aCBjb25maWd1cmF0aW9uIGZyb20gdGhlIENoYXJ0aXN0LkludGVycG9sYXRpb24gbW9kdWxlXG4gICAqXG4gICAqIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAqICAgc2VyaWVzOiBbXG4gICAqICAgICBbMSwgMSwgOCwgMSwgN11cbiAgICogICBdXG4gICAqIH0sIHtcbiAgICogICBsaW5lU21vb3RoOiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsKHtcbiAgICogICAgIHRlbnNpb246IDAuMlxuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBDcmVhdGUgYSBsaW5lIGNoYXJ0IHdpdGggcmVzcG9uc2l2ZSBvcHRpb25zXG4gICAqXG4gICAqIHZhciBkYXRhID0ge1xuICAgKiAgIC8vIEEgbGFiZWxzIGFycmF5IHRoYXQgY2FuIGNvbnRhaW4gYW55IHNvcnQgb2YgdmFsdWVzXG4gICAqICAgbGFiZWxzOiBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknXSxcbiAgICogICAvLyBPdXIgc2VyaWVzIGFycmF5IHRoYXQgY29udGFpbnMgc2VyaWVzIG9iamVjdHMgb3IgaW4gdGhpcyBjYXNlIHNlcmllcyBkYXRhIGFycmF5c1xuICAgKiAgIHNlcmllczogW1xuICAgKiAgICAgWzUsIDIsIDQsIDIsIDBdXG4gICAqICAgXVxuICAgKiB9O1xuICAgKlxuICAgKiAvLyBJbiBhZGl0aW9uIHRvIHRoZSByZWd1bGFyIG9wdGlvbnMgd2Ugc3BlY2lmeSByZXNwb25zaXZlIG9wdGlvbiBvdmVycmlkZXMgdGhhdCB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGNvbmZpZ3V0YXRpb24gYmFzZWQgb24gdGhlIG1hdGNoaW5nIG1lZGlhIHF1ZXJpZXMuXG4gICAqIHZhciByZXNwb25zaXZlT3B0aW9ucyA9IFtcbiAgICogICBbJ3NjcmVlbiBhbmQgKG1pbi13aWR0aDogNjQxcHgpIGFuZCAobWF4LXdpZHRoOiAxMDI0cHgpJywge1xuICAgKiAgICAgc2hvd1BvaW50OiBmYWxzZSxcbiAgICogICAgIGF4aXNYOiB7XG4gICAqICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICogICAgICAgICAvLyBXaWxsIHJldHVybiBNb24sIFR1ZSwgV2VkIGV0Yy4gb24gbWVkaXVtIHNjcmVlbnNcbiAgICogICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoMCwgMyk7XG4gICAqICAgICAgIH1cbiAgICogICAgIH1cbiAgICogICB9XSxcbiAgICogICBbJ3NjcmVlbiBhbmQgKG1heC13aWR0aDogNjQwcHgpJywge1xuICAgKiAgICAgc2hvd0xpbmU6IGZhbHNlLFxuICAgKiAgICAgYXhpc1g6IHtcbiAgICogICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgKiAgICAgICAgIC8vIFdpbGwgcmV0dXJuIE0sIFQsIFcgZXRjLiBvbiBzbWFsbCBzY3JlZW5zXG4gICAqICAgICAgICAgcmV0dXJuIHZhbHVlWzBdO1xuICAgKiAgICAgICB9XG4gICAqICAgICB9XG4gICAqICAgfV1cbiAgICogXTtcbiAgICpcbiAgICogbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIGRhdGEsIG51bGwsIHJlc3BvbnNpdmVPcHRpb25zKTtcbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIExpbmUocXVlcnksIGRhdGEsIG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgQ2hhcnRpc3QuTGluZS5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICBxdWVyeSxcbiAgICAgIGRhdGEsXG4gICAgICBkZWZhdWx0T3B0aW9ucyxcbiAgICAgIENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLFxuICAgICAgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICB9XG5cbiAgLy8gQ3JlYXRpbmcgbGluZSBjaGFydCB0eXBlIGluIENoYXJ0aXN0IG5hbWVzcGFjZVxuICBDaGFydGlzdC5MaW5lID0gQ2hhcnRpc3QuQmFzZS5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBMaW5lLFxuICAgIGNyZWF0ZUNoYXJ0OiBjcmVhdGVDaGFydFxuICB9KTtcblxufSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuOy8qKlxuICogVGhlIGJhciBjaGFydCBtb2R1bGUgb2YgQ2hhcnRpc3QgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmF3IHVuaXBvbGFyIG9yIGJpcG9sYXIgYmFyIGFuZCBncm91cGVkIGJhciBjaGFydHMuXG4gKlxuICogQG1vZHVsZSBDaGFydGlzdC5CYXJcbiAqL1xuLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3Qpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBpbiBiYXIgY2hhcnRzLiBFeHBhbmQgdGhlIGNvZGUgdmlldyB0byBzZWUgYSBkZXRhaWxlZCBsaXN0IG9mIG9wdGlvbnMgd2l0aCBjb21tZW50cy5cbiAgICpcbiAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhclxuICAgKi9cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIC8vIE9wdGlvbnMgZm9yIFgtQXhpc1xuICAgIGF4aXNYOiB7XG4gICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGJvcmRlciBvZiB0aGUgY29udGFpbmVyXG4gICAgICBvZmZzZXQ6IDMwLFxuICAgICAgLy8gUG9zaXRpb24gd2hlcmUgbGFiZWxzIGFyZSBwbGFjZWQuIENhbiBiZSBzZXQgdG8gYHN0YXJ0YCBvciBgZW5kYCB3aGVyZSBgc3RhcnRgIGlzIGVxdWl2YWxlbnQgdG8gbGVmdCBvciB0b3Agb24gdmVydGljYWwgYXhpcyBhbmQgYGVuZGAgaXMgZXF1aXZhbGVudCB0byByaWdodCBvciBib3R0b20gb24gaG9yaXpvbnRhbCBheGlzLlxuICAgICAgcG9zaXRpb246ICdlbmQnLFxuICAgICAgLy8gQWxsb3dzIHlvdSB0byBjb3JyZWN0IGxhYmVsIHBvc2l0aW9uaW5nIG9uIHRoaXMgYXhpcyBieSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSB4IGFuZCB5IG9mZnNldC5cbiAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgICAgLy8gSWYgdGhlIGF4aXMgZ3JpZCBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgIC8vIEludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCB0aGUgdmFsdWUgZnJvbSB0aGUgYXhpcyBsYWJlbFxuICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgICAgLy8gVGhpcyB2YWx1ZSBzcGVjaWZpZXMgdGhlIG1pbmltdW0gd2lkdGggaW4gcGl4ZWwgb2YgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBzY2FsZU1pblNwYWNlOiAzMCxcbiAgICAgIC8vIFVzZSBvbmx5IGludGVnZXIgdmFsdWVzICh3aG9sZSBudW1iZXJzKSBmb3IgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBvbmx5SW50ZWdlcjogZmFsc2VcbiAgICB9LFxuICAgIC8vIE9wdGlvbnMgZm9yIFktQXhpc1xuICAgIGF4aXNZOiB7XG4gICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGJvcmRlciBvZiB0aGUgY29udGFpbmVyXG4gICAgICBvZmZzZXQ6IDQwLFxuICAgICAgLy8gUG9zaXRpb24gd2hlcmUgbGFiZWxzIGFyZSBwbGFjZWQuIENhbiBiZSBzZXQgdG8gYHN0YXJ0YCBvciBgZW5kYCB3aGVyZSBgc3RhcnRgIGlzIGVxdWl2YWxlbnQgdG8gbGVmdCBvciB0b3Agb24gdmVydGljYWwgYXhpcyBhbmQgYGVuZGAgaXMgZXF1aXZhbGVudCB0byByaWdodCBvciBib3R0b20gb24gaG9yaXpvbnRhbCBheGlzLlxuICAgICAgcG9zaXRpb246ICdzdGFydCcsXG4gICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgbGFiZWxPZmZzZXQ6IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgICAgfSxcbiAgICAgIC8vIElmIGxhYmVscyBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAvLyBJZiB0aGUgYXhpcyBncmlkIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgIHNob3dHcmlkOiB0cnVlLFxuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgICAvLyBUaGlzIHZhbHVlIHNwZWNpZmllcyB0aGUgbWluaW11bSBoZWlnaHQgaW4gcGl4ZWwgb2YgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBzY2FsZU1pblNwYWNlOiAyMCxcbiAgICAgIC8vIFVzZSBvbmx5IGludGVnZXIgdmFsdWVzICh3aG9sZSBudW1iZXJzKSBmb3IgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICBvbmx5SW50ZWdlcjogZmFsc2VcbiAgICB9LFxuICAgIC8vIFNwZWNpZnkgYSBmaXhlZCB3aWR0aCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgaGVpZ2h0IGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAvLyBPdmVycmlkaW5nIHRoZSBuYXR1cmFsIGhpZ2ggb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGhpZ2hlc3QgZGlzcGxheWVkIHZhbHVlXG4gICAgaGlnaDogdW5kZWZpbmVkLFxuICAgIC8vIE92ZXJyaWRpbmcgdGhlIG5hdHVyYWwgbG93IG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBsb3dlc3QgZGlzcGxheWVkIHZhbHVlXG4gICAgbG93OiB1bmRlZmluZWQsXG4gICAgLy8gVXNlIG9ubHkgaW50ZWdlciB2YWx1ZXMgKHdob2xlIG51bWJlcnMpIGZvciB0aGUgc2NhbGUgc3RlcHNcbiAgICBvbmx5SW50ZWdlcjogZmFsc2UsXG4gICAgLy8gUGFkZGluZyBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBjb250YWluZXIgZWxlbWVudCBhbmQgbGFiZWxzIGFzIGEgbnVtYmVyIG9yIHBhZGRpbmcgb2JqZWN0IHt0b3A6IDUsIHJpZ2h0OiA1LCBib3R0b206IDUsIGxlZnQ6IDV9XG4gICAgY2hhcnRQYWRkaW5nOiB7XG4gICAgICB0b3A6IDE1LFxuICAgICAgcmlnaHQ6IDE1LFxuICAgICAgYm90dG9tOiA1LFxuICAgICAgbGVmdDogMTBcbiAgICB9LFxuICAgIC8vIFNwZWNpZnkgdGhlIGRpc3RhbmNlIGluIHBpeGVsIG9mIGJhcnMgaW4gYSBncm91cFxuICAgIHNlcmllc0JhckRpc3RhbmNlOiAxNSxcbiAgICAvLyBJZiBzZXQgdG8gdHJ1ZSB0aGlzIHByb3BlcnR5IHdpbGwgY2F1c2UgdGhlIHNlcmllcyBiYXJzIHRvIGJlIHN0YWNrZWQuIENoZWNrIHRoZSBgc3RhY2tNb2RlYCBvcHRpb24gZm9yIGZ1cnRoZXIgc3RhY2tpbmcgb3B0aW9ucy5cbiAgICBzdGFja0JhcnM6IGZhbHNlLFxuICAgIC8vIElmIHNldCB0byAnb3ZlcmxhcCcgdGhpcyBwcm9wZXJ0eSB3aWxsIGZvcmNlIHRoZSBzdGFja2VkIGJhcnMgdG8gZHJhdyBmcm9tIHRoZSB6ZXJvIGxpbmUuXG4gICAgLy8gSWYgc2V0IHRvICdhY2N1bXVsYXRlJyB0aGlzIHByb3BlcnR5IHdpbGwgZm9ybSBhIHRvdGFsIGZvciBlYWNoIHNlcmllcyBwb2ludC4gVGhpcyB3aWxsIGFsc28gaW5mbHVlbmNlIHRoZSB5LWF4aXMgYW5kIHRoZSBvdmVyYWxsIGJvdW5kcyBvZiB0aGUgY2hhcnQuIEluIHN0YWNrZWQgbW9kZSB0aGUgc2VyaWVzQmFyRGlzdGFuY2UgcHJvcGVydHkgd2lsbCBoYXZlIG5vIGVmZmVjdC5cbiAgICBzdGFja01vZGU6ICdhY2N1bXVsYXRlJyxcbiAgICAvLyBJbnZlcnRzIHRoZSBheGVzIG9mIHRoZSBiYXIgY2hhcnQgaW4gb3JkZXIgdG8gZHJhdyBhIGhvcml6b250YWwgYmFyIGNoYXJ0LiBCZSBhd2FyZSB0aGF0IHlvdSBhbHNvIG5lZWQgdG8gaW52ZXJ0IHlvdXIgYXhpcyBzZXR0aW5ncyBhcyB0aGUgWSBBeGlzIHdpbGwgbm93IGRpc3BsYXkgdGhlIGxhYmVscyBhbmQgdGhlIFggQXhpcyB0aGUgdmFsdWVzLlxuICAgIGhvcml6b250YWxCYXJzOiBmYWxzZSxcbiAgICAvLyBJZiBzZXQgdG8gdHJ1ZSB0aGVuIGVhY2ggYmFyIHdpbGwgcmVwcmVzZW50IGEgc2VyaWVzIGFuZCB0aGUgZGF0YSBhcnJheSBpcyBleHBlY3RlZCB0byBiZSBhIG9uZSBkaW1lbnNpb25hbCBhcnJheSBvZiBkYXRhIHZhbHVlcyByYXRoZXIgdGhhbiBhIHNlcmllcyBhcnJheSBvZiBzZXJpZXMuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBiYXIgY2hhcnQgc2hvdWxkIHJlcHJlc2VudCBhIHByb2ZpbGUgcmF0aGVyIHRoYW4gc29tZSBkYXRhIG92ZXIgdGltZS5cbiAgICBkaXN0cmlidXRlU2VyaWVzOiBmYWxzZSxcbiAgICAvLyBJZiB0cnVlIHRoZSB3aG9sZSBkYXRhIGlzIHJldmVyc2VkIGluY2x1ZGluZyBsYWJlbHMsIHRoZSBzZXJpZXMgb3JkZXIgYXMgd2VsbCBhcyB0aGUgd2hvbGUgc2VyaWVzIGRhdGEgYXJyYXlzLlxuICAgIHJldmVyc2VEYXRhOiBmYWxzZSxcbiAgICAvLyBPdmVycmlkZSB0aGUgY2xhc3MgbmFtZXMgdGhhdCBnZXQgdXNlZCB0byBnZW5lcmF0ZSB0aGUgU1ZHIHN0cnVjdHVyZSBvZiB0aGUgY2hhcnRcbiAgICBjbGFzc05hbWVzOiB7XG4gICAgICBjaGFydDogJ2N0LWNoYXJ0LWJhcicsXG4gICAgICBob3Jpem9udGFsQmFyczogJ2N0LWhvcml6b250YWwtYmFycycsXG4gICAgICBsYWJlbDogJ2N0LWxhYmVsJyxcbiAgICAgIGxhYmVsR3JvdXA6ICdjdC1sYWJlbHMnLFxuICAgICAgc2VyaWVzOiAnY3Qtc2VyaWVzJyxcbiAgICAgIGJhcjogJ2N0LWJhcicsXG4gICAgICBncmlkOiAnY3QtZ3JpZCcsXG4gICAgICBncmlkR3JvdXA6ICdjdC1ncmlkcycsXG4gICAgICB2ZXJ0aWNhbDogJ2N0LXZlcnRpY2FsJyxcbiAgICAgIGhvcml6b250YWw6ICdjdC1ob3Jpem9udGFsJyxcbiAgICAgIHN0YXJ0OiAnY3Qtc3RhcnQnLFxuICAgICAgZW5kOiAnY3QtZW5kJ1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjaGFydFxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ2hhcnQob3B0aW9ucykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgcmF3OiB0aGlzLmRhdGEsXG4gICAgICBub3JtYWxpemVkOiBvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgPyBDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhLCBvcHRpb25zLmhvcml6b250YWxCYXJzID8gJ3gnIDogJ3knKS5tYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgICB9KSA6IENoYXJ0aXN0LmdldERhdGFBcnJheSh0aGlzLmRhdGEsIG9wdGlvbnMucmV2ZXJzZURhdGEsIG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAneCcgOiAneScpXG4gICAgfTtcblxuICAgIHZhciBoaWdoTG93O1xuXG4gICAgLy8gQ3JlYXRlIG5ldyBzdmcgZWxlbWVudFxuICAgIHRoaXMuc3ZnID0gQ2hhcnRpc3QuY3JlYXRlU3ZnKFxuICAgICAgdGhpcy5jb250YWluZXIsXG4gICAgICBvcHRpb25zLndpZHRoLFxuICAgICAgb3B0aW9ucy5oZWlnaHQsXG4gICAgICBvcHRpb25zLmNsYXNzTmFtZXMuY2hhcnQgKyAob3B0aW9ucy5ob3Jpem9udGFsQmFycyA/ICcgJyArIG9wdGlvbnMuY2xhc3NOYW1lcy5ob3Jpem9udGFsQmFycyA6ICcnKVxuICAgICk7XG5cbiAgICAvLyBEcmF3aW5nIGdyb3VwcyBpbiBjb3JyZWN0IG9yZGVyXG4gICAgdmFyIGdyaWRHcm91cCA9IHRoaXMuc3ZnLmVsZW0oJ2cnKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZXMuZ3JpZEdyb3VwKTtcbiAgICB2YXIgc2VyaWVzR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJyk7XG4gICAgdmFyIGxhYmVsR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsR3JvdXApO1xuXG4gICAgaWYob3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgIC8vIElmIHN0YWNrZWQgYmFycyB3ZSBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgaGlnaCBsb3cgZnJvbSBzdGFja2VkIHZhbHVlcyBmcm9tIGVhY2ggc2VyaWVzXG4gICAgICB2YXIgc2VyaWFsU3VtcyA9IENoYXJ0aXN0LnNlcmlhbE1hcChkYXRhLm5vcm1hbGl6ZWQsIGZ1bmN0aW9uIHNlcmlhbFN1bXMoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cnIpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcHJldi54ICsgY3Vyci54IHx8IDAsXG4gICAgICAgICAgICB5OiBwcmV2LnkgKyBjdXJyLnkgfHwgMFxuICAgICAgICAgIH07XG4gICAgICAgIH0sIHt4OiAwLCB5OiAwfSk7XG4gICAgICB9KTtcblxuICAgICAgaGlnaExvdyA9IENoYXJ0aXN0LmdldEhpZ2hMb3coW3NlcmlhbFN1bXNdLCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMsIHtcbiAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgIH0pLCBvcHRpb25zLmhvcml6b250YWxCYXJzID8gJ3gnIDogJ3knKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlnaExvdyA9IENoYXJ0aXN0LmdldEhpZ2hMb3coZGF0YS5ub3JtYWxpemVkLCBDaGFydGlzdC5leHRlbmQoe30sIG9wdGlvbnMsIHtcbiAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgIH0pLCBvcHRpb25zLmhvcml6b250YWxCYXJzID8gJ3gnIDogJ3knKTtcbiAgICB9XG4gICAgLy8gT3ZlcnJpZGVzIG9mIGhpZ2ggLyBsb3cgZnJvbSBzZXR0aW5nc1xuICAgIGhpZ2hMb3cuaGlnaCA9ICtvcHRpb25zLmhpZ2ggfHwgKG9wdGlvbnMuaGlnaCA9PT0gMCA/IDAgOiBoaWdoTG93LmhpZ2gpO1xuICAgIGhpZ2hMb3cubG93ID0gK29wdGlvbnMubG93IHx8IChvcHRpb25zLmxvdyA9PT0gMCA/IDAgOiBoaWdoTG93Lmxvdyk7XG5cbiAgICB2YXIgY2hhcnRSZWN0ID0gQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0KHRoaXMuc3ZnLCBvcHRpb25zLCBkZWZhdWx0T3B0aW9ucy5wYWRkaW5nKTtcblxuICAgIHZhciB2YWx1ZUF4aXMsXG4gICAgICBsYWJlbEF4aXNUaWNrcyxcbiAgICAgIGxhYmVsQXhpcyxcbiAgICAgIGF4aXNYLFxuICAgICAgYXhpc1k7XG5cbiAgICAvLyBXZSBuZWVkIHRvIHNldCBzdGVwIGNvdW50IGJhc2VkIG9uIHNvbWUgb3B0aW9ucyBjb21iaW5hdGlvbnNcbiAgICBpZihvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgJiYgb3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhcmUgZW5hYmxlZCBhbmQgYmFycyBuZWVkIHRvIGJlIHN0YWNrZWQsIHdlJ2xsIG9ubHkgaGF2ZSBvbmUgYmFyIGFuZCB0aGVyZWZvcmUgc2hvdWxkXG4gICAgICAvLyB1c2Ugb25seSB0aGUgZmlyc3QgbGFiZWwgZm9yIHRoZSBzdGVwIGF4aXNcbiAgICAgIGxhYmVsQXhpc1RpY2tzID0gZGF0YS5yYXcubGFiZWxzLnNsaWNlKDAsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBkaXN0cmlidXRlZCBzZXJpZXMgYXJlIGVuYWJsZWQgYnV0IHN0YWNrZWQgYmFycyBhcmVuJ3QsIHdlIHNob3VsZCB1c2UgdGhlIHNlcmllcyBsYWJlbHNcbiAgICAgIC8vIElmIHdlIGFyZSBkcmF3aW5nIGEgcmVndWxhciBiYXIgY2hhcnQgd2l0aCB0d28gZGltZW5zaW9uYWwgc2VyaWVzIGRhdGEsIHdlIGp1c3QgdXNlIHRoZSBsYWJlbHMgYXJyYXlcbiAgICAgIC8vIGFzIHRoZSBiYXJzIGFyZSBub3JtYWxpemVkXG4gICAgICBsYWJlbEF4aXNUaWNrcyA9IGRhdGEucmF3LmxhYmVscztcbiAgICB9XG5cbiAgICAvLyBTZXQgbGFiZWxBeGlzIGFuZCB2YWx1ZUF4aXMgYmFzZWQgb24gdGhlIGhvcml6b250YWxCYXJzIHNldHRpbmcuIFRoaXMgc2V0dGluZyB3aWxsIGZsaXAgdGhlIGF4ZXMgaWYgbmVjZXNzYXJ5LlxuICAgIGlmKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMpIHtcbiAgICAgIGlmKG9wdGlvbnMuYXhpc1gudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhbHVlQXhpcyA9IGF4aXNYID0gbmV3IENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWCwge1xuICAgICAgICAgIGhpZ2hMb3c6IGhpZ2hMb3csXG4gICAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVBeGlzID0gYXhpc1ggPSBvcHRpb25zLmF4aXNYLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWCwge1xuICAgICAgICAgIGhpZ2hMb3c6IGhpZ2hMb3csXG4gICAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICBpZihvcHRpb25zLmF4aXNZLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYWJlbEF4aXMgPSBheGlzWSA9IG5ldyBDaGFydGlzdC5TdGVwQXhpcyhDaGFydGlzdC5BeGlzLnVuaXRzLnksIGRhdGEsIGNoYXJ0UmVjdCwge1xuICAgICAgICAgIHRpY2tzOiBsYWJlbEF4aXNUaWNrc1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsQXhpcyA9IGF4aXNZID0gb3B0aW9ucy5heGlzWS50eXBlLmNhbGwoQ2hhcnRpc3QsIENoYXJ0aXN0LkF4aXMudW5pdHMueSwgZGF0YSwgY2hhcnRSZWN0LCBvcHRpb25zLmF4aXNZKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYob3B0aW9ucy5heGlzWC50eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGFiZWxBeGlzID0gYXhpc1ggPSBuZXcgQ2hhcnRpc3QuU3RlcEF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy54LCBkYXRhLCBjaGFydFJlY3QsIHtcbiAgICAgICAgICB0aWNrczogbGFiZWxBeGlzVGlja3NcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYWJlbEF4aXMgPSBheGlzWCA9IG9wdGlvbnMuYXhpc1gudHlwZS5jYWxsKENoYXJ0aXN0LCBDaGFydGlzdC5BeGlzLnVuaXRzLngsIGRhdGEsIGNoYXJ0UmVjdCwgb3B0aW9ucy5heGlzWCk7XG4gICAgICB9XG5cbiAgICAgIGlmKG9wdGlvbnMuYXhpc1kudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhbHVlQXhpcyA9IGF4aXNZID0gbmV3IENoYXJ0aXN0LkF1dG9TY2FsZUF4aXMoQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWSwge1xuICAgICAgICAgIGhpZ2hMb3c6IGhpZ2hMb3csXG4gICAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgICAgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVBeGlzID0gYXhpc1kgPSBvcHRpb25zLmF4aXNZLnR5cGUuY2FsbChDaGFydGlzdCwgQ2hhcnRpc3QuQXhpcy51bml0cy55LCBkYXRhLCBjaGFydFJlY3QsIENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucy5heGlzWSwge1xuICAgICAgICAgIGhpZ2hMb3c6IGhpZ2hMb3csXG4gICAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb2plY3RlZCAwIHBvaW50XG4gICAgdmFyIHplcm9Qb2ludCA9IG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAoY2hhcnRSZWN0LngxICsgdmFsdWVBeGlzLnByb2plY3RWYWx1ZSgwKSkgOiAoY2hhcnRSZWN0LnkxIC0gdmFsdWVBeGlzLnByb2plY3RWYWx1ZSgwKSk7XG4gICAgLy8gVXNlZCB0byB0cmFjayB0aGUgc2NyZWVuIGNvb3JkaW5hdGVzIG9mIHN0YWNrZWQgYmFyc1xuICAgIHZhciBzdGFja2VkQmFyVmFsdWVzID0gW107XG5cbiAgICBsYWJlbEF4aXMuY3JlYXRlR3JpZEFuZExhYmVscyhncmlkR3JvdXAsIGxhYmVsR3JvdXAsIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0LCBvcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG4gICAgdmFsdWVBeGlzLmNyZWF0ZUdyaWRBbmRMYWJlbHMoZ3JpZEdyb3VwLCBsYWJlbEdyb3VwLCB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCwgb3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuXG4gICAgLy8gRHJhdyB0aGUgc2VyaWVzXG4gICAgZGF0YS5yYXcuc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oc2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgICAgLy8gQ2FsY3VsYXRpbmcgYmktcG9sYXIgdmFsdWUgb2YgaW5kZXggZm9yIHNlcmllc09mZnNldC4gRm9yIGkgPSAwLi40IGJpUG9sIHdpbGwgYmUgLTEuNSwgLTAuNSwgMC41LCAxLjUgZXRjLlxuICAgICAgdmFyIGJpUG9sID0gc2VyaWVzSW5kZXggLSAoZGF0YS5yYXcuc2VyaWVzLmxlbmd0aCAtIDEpIC8gMjtcbiAgICAgIC8vIEhhbGYgb2YgdGhlIHBlcmlvZCB3aWR0aCBiZXR3ZWVuIHZlcnRpY2FsIGdyaWQgbGluZXMgdXNlZCB0byBwb3NpdGlvbiBiYXJzXG4gICAgICB2YXIgcGVyaW9kSGFsZkxlbmd0aDtcbiAgICAgIC8vIEN1cnJlbnQgc2VyaWVzIFNWRyBlbGVtZW50XG4gICAgICB2YXIgc2VyaWVzRWxlbWVudDtcblxuICAgICAgLy8gV2UgbmVlZCB0byBzZXQgcGVyaW9kSGFsZkxlbmd0aCBiYXNlZCBvbiBzb21lIG9wdGlvbnMgY29tYmluYXRpb25zXG4gICAgICBpZihvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgJiYgIW9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhcmUgZW5hYmxlZCBidXQgc3RhY2tlZCBiYXJzIGFyZW4ndCwgd2UgbmVlZCB0byB1c2UgdGhlIGxlbmd0aCBvZiB0aGUgbm9ybWFpemVkRGF0YSBhcnJheVxuICAgICAgICAvLyB3aGljaCBpcyB0aGUgc2VyaWVzIGNvdW50IGFuZCBkaXZpZGUgYnkgMlxuICAgICAgICBwZXJpb2RIYWxmTGVuZ3RoID0gbGFiZWxBeGlzLmF4aXNMZW5ndGggLyBkYXRhLm5vcm1hbGl6ZWQubGVuZ3RoIC8gMjtcbiAgICAgIH0gZWxzZSBpZihvcHRpb25zLmRpc3RyaWJ1dGVTZXJpZXMgJiYgb3B0aW9ucy5zdGFja0JhcnMpIHtcbiAgICAgICAgLy8gSWYgZGlzdHJpYnV0ZWQgc2VyaWVzIGFuZCBzdGFja2VkIGJhcnMgYXJlIGVuYWJsZWQgd2UnbGwgb25seSBnZXQgb25lIGJhciBzbyB3ZSBzaG91bGQganVzdCBkaXZpZGUgdGhlIGF4aXNcbiAgICAgICAgLy8gbGVuZ3RoIGJ5IDJcbiAgICAgICAgcGVyaW9kSGFsZkxlbmd0aCA9IGxhYmVsQXhpcy5heGlzTGVuZ3RoIC8gMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE9uIHJlZ3VsYXIgYmFyIGNoYXJ0cyB3ZSBzaG91bGQganVzdCB1c2UgdGhlIHNlcmllcyBsZW5ndGhcbiAgICAgICAgcGVyaW9kSGFsZkxlbmd0aCA9IGxhYmVsQXhpcy5heGlzTGVuZ3RoIC8gZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XS5sZW5ndGggLyAyO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGRpbmcgdGhlIHNlcmllcyBncm91cCB0byB0aGUgc2VyaWVzIGVsZW1lbnRcbiAgICAgIHNlcmllc0VsZW1lbnQgPSBzZXJpZXNHcm91cC5lbGVtKCdnJyk7XG5cbiAgICAgIC8vIFdyaXRlIGF0dHJpYnV0ZXMgdG8gc2VyaWVzIGdyb3VwIGVsZW1lbnQuIElmIHNlcmllcyBuYW1lIG9yIG1ldGEgaXMgdW5kZWZpbmVkIHRoZSBhdHRyaWJ1dGVzIHdpbGwgbm90IGJlIHdyaXR0ZW5cbiAgICAgIHNlcmllc0VsZW1lbnQuYXR0cih7XG4gICAgICAgICdzZXJpZXMtbmFtZSc6IHNlcmllcy5uYW1lLFxuICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LnNlcmlhbGl6ZShzZXJpZXMubWV0YSlcbiAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgIC8vIFVzZSBzZXJpZXMgY2xhc3MgZnJvbSBzZXJpZXMgZGF0YSBvciBpZiBub3Qgc2V0IGdlbmVyYXRlIG9uZVxuICAgICAgc2VyaWVzRWxlbWVudC5hZGRDbGFzcyhbXG4gICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMsXG4gICAgICAgIChzZXJpZXMuY2xhc3NOYW1lIHx8IG9wdGlvbnMuY2xhc3NOYW1lcy5zZXJpZXMgKyAnLScgKyBDaGFydGlzdC5hbHBoYU51bWVyYXRlKHNlcmllc0luZGV4KSlcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgZGF0YS5ub3JtYWxpemVkW3Nlcmllc0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCB2YWx1ZUluZGV4KSB7XG4gICAgICAgIHZhciBwcm9qZWN0ZWQsXG4gICAgICAgICAgYmFyLFxuICAgICAgICAgIHByZXZpb3VzU3RhY2ssXG4gICAgICAgICAgbGFiZWxBeGlzVmFsdWVJbmRleDtcblxuICAgICAgICAvLyBXZSBuZWVkIHRvIHNldCBsYWJlbEF4aXNWYWx1ZUluZGV4IGJhc2VkIG9uIHNvbWUgb3B0aW9ucyBjb21iaW5hdGlvbnNcbiAgICAgICAgaWYob3B0aW9ucy5kaXN0cmlidXRlU2VyaWVzICYmICFvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhcmUgZW5hYmxlZCBidXQgc3RhY2tlZCBiYXJzIGFyZW4ndCwgd2UgY2FuIHVzZSB0aGUgc2VyaWVzSW5kZXggZm9yIGxhdGVyIHByb2plY3Rpb25cbiAgICAgICAgICAvLyBvbiB0aGUgc3RlcCBheGlzIGZvciBsYWJlbCBwb3NpdGlvbmluZ1xuICAgICAgICAgIGxhYmVsQXhpc1ZhbHVlSW5kZXggPSBzZXJpZXNJbmRleDtcbiAgICAgICAgfSBlbHNlIGlmKG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcyAmJiBvcHRpb25zLnN0YWNrQmFycykge1xuICAgICAgICAgIC8vIElmIGRpc3RyaWJ1dGVkIHNlcmllcyBhbmQgc3RhY2tlZCBiYXJzIGFyZSBlbmFibGVkLCB3ZSB3aWxsIG9ubHkgZ2V0IG9uZSBiYXIgYW5kIHRoZXJlZm9yZSBhbHdheXMgdXNlXG4gICAgICAgICAgLy8gMCBmb3IgcHJvamVjdGlvbiBvbiB0aGUgbGFiZWwgc3RlcCBheGlzXG4gICAgICAgICAgbGFiZWxBeGlzVmFsdWVJbmRleCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT24gcmVndWxhciBiYXIgY2hhcnRzIHdlIGp1c3QgdXNlIHRoZSB2YWx1ZSBpbmRleCB0byBwcm9qZWN0IG9uIHRoZSBsYWJlbCBzdGVwIGF4aXNcbiAgICAgICAgICBsYWJlbEF4aXNWYWx1ZUluZGV4ID0gdmFsdWVJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gdHJhbnNmb3JtIGNvb3JkaW5hdGVzIGRpZmZlcmVudGx5IGJhc2VkIG9uIHRoZSBjaGFydCBsYXlvdXRcbiAgICAgICAgaWYob3B0aW9ucy5ob3Jpem9udGFsQmFycykge1xuICAgICAgICAgIHByb2plY3RlZCA9IHtcbiAgICAgICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIHZhbHVlQXhpcy5wcm9qZWN0VmFsdWUodmFsdWUgJiYgdmFsdWUueCA/IHZhbHVlLnggOiAwLCB2YWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKSxcbiAgICAgICAgICAgIHk6IGNoYXJ0UmVjdC55MSAtIGxhYmVsQXhpcy5wcm9qZWN0VmFsdWUodmFsdWUgJiYgdmFsdWUueSA/IHZhbHVlLnkgOiAwLCBsYWJlbEF4aXNWYWx1ZUluZGV4LCBkYXRhLm5vcm1hbGl6ZWRbc2VyaWVzSW5kZXhdKVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvamVjdGVkID0ge1xuICAgICAgICAgICAgeDogY2hhcnRSZWN0LngxICsgbGFiZWxBeGlzLnByb2plY3RWYWx1ZSh2YWx1ZSAmJiB2YWx1ZS54ID8gdmFsdWUueCA6IDAsIGxhYmVsQXhpc1ZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pLFxuICAgICAgICAgICAgeTogY2hhcnRSZWN0LnkxIC0gdmFsdWVBeGlzLnByb2plY3RWYWx1ZSh2YWx1ZSAmJiB2YWx1ZS55ID8gdmFsdWUueSA6IDAsIHZhbHVlSW5kZXgsIGRhdGEubm9ybWFsaXplZFtzZXJpZXNJbmRleF0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGxhYmVsIGF4aXMgaXMgYSBzdGVwIGJhc2VkIGF4aXMgd2Ugd2lsbCBvZmZzZXQgdGhlIGJhciBpbnRvIHRoZSBtaWRkbGUgb2YgYmV0d2VlbiB0d28gc3RlcHMgdXNpbmdcbiAgICAgICAgLy8gdGhlIHBlcmlvZEhhbGZMZW5ndGggdmFsdWUuIEFsc28gd2UgZG8gYXJyYW5nZSB0aGUgZGlmZmVyZW50IHNlcmllcyBzbyB0aGF0IHRoZXkgYWxpZ24gdXAgdG8gZWFjaCBvdGhlciB1c2luZ1xuICAgICAgICAvLyB0aGUgc2VyaWVzQmFyRGlzdGFuY2UuIElmIHdlIGRvbid0IGhhdmUgYSBzdGVwIGF4aXMsIHRoZSBiYXIgcG9zaXRpb25zIGNhbiBiZSBjaG9zZW4gZnJlZWx5IHNvIHdlIHNob3VsZCBub3RcbiAgICAgICAgLy8gYWRkIGFueSBhdXRvbWF0ZWQgcG9zaXRpb25pbmcuXG4gICAgICAgIGlmKGxhYmVsQXhpcyBpbnN0YW5jZW9mIENoYXJ0aXN0LlN0ZXBBeGlzKSB7XG4gICAgICAgICAgLy8gT2Zmc2V0IHRvIGNlbnRlciBiYXIgYmV0d2VlbiBncmlkIGxpbmVzLCBidXQgb25seSBpZiB0aGUgc3RlcCBheGlzIGlzIG5vdCBzdHJldGNoZWRcbiAgICAgICAgICBpZighbGFiZWxBeGlzLm9wdGlvbnMuc3RyZXRjaCkge1xuICAgICAgICAgICAgcHJvamVjdGVkW2xhYmVsQXhpcy51bml0cy5wb3NdICs9IHBlcmlvZEhhbGZMZW5ndGggKiAob3B0aW9ucy5ob3Jpem9udGFsQmFycyA/IC0xIDogMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFVzaW5nIGJpLXBvbGFyIG9mZnNldCBmb3IgbXVsdGlwbGUgc2VyaWVzIGlmIG5vIHN0YWNrZWQgYmFycyBvciBzZXJpZXMgZGlzdHJpYnV0aW9uIGlzIHVzZWRcbiAgICAgICAgICBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc10gKz0gKG9wdGlvbnMuc3RhY2tCYXJzIHx8IG9wdGlvbnMuZGlzdHJpYnV0ZVNlcmllcykgPyAwIDogYmlQb2wgKiBvcHRpb25zLnNlcmllc0JhckRpc3RhbmNlICogKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAtMSA6IDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW50ZXIgdmFsdWUgaW4gc3RhY2tlZCBiYXIgdmFsdWVzIHVzZWQgdG8gcmVtZW1iZXIgcHJldmlvdXMgc2NyZWVuIHZhbHVlIGZvciBzdGFja2luZyB1cCBiYXJzXG4gICAgICAgIHByZXZpb3VzU3RhY2sgPSBzdGFja2VkQmFyVmFsdWVzW3ZhbHVlSW5kZXhdIHx8IHplcm9Qb2ludDtcbiAgICAgICAgc3RhY2tlZEJhclZhbHVlc1t2YWx1ZUluZGV4XSA9IHByZXZpb3VzU3RhY2sgLSAoemVyb1BvaW50IC0gcHJvamVjdGVkW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zXSk7XG5cbiAgICAgICAgLy8gU2tpcCBpZiB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgICAgICAgaWYodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSB7fTtcbiAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy51bml0cy5wb3MgKyAnMSddID0gcHJvamVjdGVkW2xhYmVsQXhpcy51bml0cy5wb3NdO1xuICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLnVuaXRzLnBvcyArICcyJ10gPSBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc107XG5cbiAgICAgICAgaWYob3B0aW9ucy5zdGFja0JhcnMgJiYgKG9wdGlvbnMuc3RhY2tNb2RlID09PSAnYWNjdW11bGF0ZScgfHwgIW9wdGlvbnMuc3RhY2tNb2RlKSkge1xuICAgICAgICAgIC8vIFN0YWNrIG1vZGU6IGFjY3VtdWxhdGUgKGRlZmF1bHQpXG4gICAgICAgICAgLy8gSWYgYmFycyBhcmUgc3RhY2tlZCB3ZSB1c2UgdGhlIHN0YWNrZWRCYXJWYWx1ZXMgcmVmZXJlbmNlIGFuZCBvdGhlcndpc2UgYmFzZSBhbGwgYmFycyBvZmYgdGhlIHplcm8gbGluZVxuICAgICAgICAgIC8vIFdlIHdhbnQgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIHNvIHRoZSBleHBlY3RlZCBmYWxsYmFjayB3aXRob3V0IHRoZSAnc3RhY2tNb2RlJyBvcHRpb25cbiAgICAgICAgICAvLyB0byBiZSB0aGUgb3JpZ2luYWwgYmVoYXZpb3VyIChhY2N1bXVsYXRlKVxuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvcyArICcxJ10gPSBwcmV2aW91c1N0YWNrO1xuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvcyArICcyJ10gPSBzdGFja2VkQmFyVmFsdWVzW3ZhbHVlSW5kZXhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERyYXcgZnJvbSB0aGUgemVybyBsaW5lIG5vcm1hbGx5XG4gICAgICAgICAgLy8gVGhpcyBpcyBhbHNvIHRoZSBzYW1lIGNvZGUgZm9yIFN0YWNrIG1vZGU6IG92ZXJsYXBcbiAgICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMSddID0gemVyb1BvaW50O1xuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvcyArICcyJ10gPSBwcm9qZWN0ZWRbbGFiZWxBeGlzLmNvdW50ZXJVbml0cy5wb3NdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGltaXQgeCBhbmQgeSBzbyB0aGF0IHRoZXkgYXJlIHdpdGhpbiB0aGUgY2hhcnQgcmVjdFxuICAgICAgICBwb3NpdGlvbnMueDEgPSBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbnMueDEsIGNoYXJ0UmVjdC54MSksIGNoYXJ0UmVjdC54Mik7XG4gICAgICAgIHBvc2l0aW9ucy54MiA9IE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9ucy54MiwgY2hhcnRSZWN0LngxKSwgY2hhcnRSZWN0LngyKTtcbiAgICAgICAgcG9zaXRpb25zLnkxID0gTWF0aC5taW4oTWF0aC5tYXgocG9zaXRpb25zLnkxLCBjaGFydFJlY3QueTIpLCBjaGFydFJlY3QueTEpO1xuICAgICAgICBwb3NpdGlvbnMueTIgPSBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbnMueTIsIGNoYXJ0UmVjdC55MiksIGNoYXJ0UmVjdC55MSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGJhciBlbGVtZW50XG4gICAgICAgIGJhciA9IHNlcmllc0VsZW1lbnQuZWxlbSgnbGluZScsIHBvc2l0aW9ucywgb3B0aW9ucy5jbGFzc05hbWVzLmJhcikuYXR0cih7XG4gICAgICAgICAgJ3ZhbHVlJzogW3ZhbHVlLngsIHZhbHVlLnldLmZpbHRlcihmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICB9KS5qb2luKCcsJyksXG4gICAgICAgICAgJ21ldGEnOiBDaGFydGlzdC5nZXRNZXRhRGF0YShzZXJpZXMsIHZhbHVlSW5kZXgpXG4gICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgICAgdHlwZTogJ2JhcicsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGluZGV4OiB2YWx1ZUluZGV4LFxuICAgICAgICAgIG1ldGE6IENoYXJ0aXN0LmdldE1ldGFEYXRhKHNlcmllcywgdmFsdWVJbmRleCksXG4gICAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgICAgc2VyaWVzSW5kZXg6IHNlcmllc0luZGV4LFxuICAgICAgICAgIGF4aXNYOiBheGlzWCxcbiAgICAgICAgICBheGlzWTogYXhpc1ksXG4gICAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgICAgZ3JvdXA6IHNlcmllc0VsZW1lbnQsXG4gICAgICAgICAgZWxlbWVudDogYmFyXG4gICAgICAgIH0sIHBvc2l0aW9ucykpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnY3JlYXRlZCcsIHtcbiAgICAgIGJvdW5kczogdmFsdWVBeGlzLmJvdW5kcyxcbiAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgYXhpc1g6IGF4aXNYLFxuICAgICAgYXhpc1k6IGF4aXNZLFxuICAgICAgc3ZnOiB0aGlzLnN2ZyxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGJhciBjaGFydCBhbmQgcmV0dXJucyBBUEkgb2JqZWN0IHRoYXQgeW91IGNhbiB1c2UgZm9yIGxhdGVyIGNoYW5nZXMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5CYXJcbiAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgQSBzZWxlY3RvciBxdWVyeSBzdHJpbmcgb3IgZGlyZWN0bHkgYSBET00gZWxlbWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgdGhhdCBuZWVkcyB0byBjb25zaXN0IG9mIGEgbGFiZWxzIGFuZCBhIHNlcmllcyBhcnJheVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICogQHBhcmFtIHtBcnJheX0gW3Jlc3BvbnNpdmVPcHRpb25zXSBTcGVjaWZ5IGFuIGFycmF5IG9mIHJlc3BvbnNpdmUgb3B0aW9uIGFycmF5cyB3aGljaCBhcmUgYSBtZWRpYSBxdWVyeSBhbmQgb3B0aW9ucyBvYmplY3QgcGFpciA9PiBbW21lZGlhUXVlcnlTdHJpbmcsIG9wdGlvbnNPYmplY3RdLFttb3JlLi4uXV1cbiAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2hpY2ggZXhwb3NlcyB0aGUgQVBJIGZvciB0aGUgY3JlYXRlZCBjaGFydFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBDcmVhdGUgYSBzaW1wbGUgYmFyIGNoYXJ0XG4gICAqIHZhciBkYXRhID0ge1xuICAgKiAgIGxhYmVsczogWydNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJ10sXG4gICAqICAgc2VyaWVzOiBbXG4gICAqICAgICBbNSwgMiwgNCwgMiwgMF1cbiAgICogICBdXG4gICAqIH07XG4gICAqXG4gICAqIC8vIEluIHRoZSBnbG9iYWwgbmFtZSBzcGFjZSBDaGFydGlzdCB3ZSBjYWxsIHRoZSBCYXIgZnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSBhIGJhciBjaGFydC4gQXMgYSBmaXJzdCBwYXJhbWV0ZXIgd2UgcGFzcyBpbiBhIHNlbGVjdG9yIHdoZXJlIHdlIHdvdWxkIGxpa2UgdG8gZ2V0IG91ciBjaGFydCBjcmVhdGVkIGFuZCBhcyBhIHNlY29uZCBwYXJhbWV0ZXIgd2UgcGFzcyBvdXIgZGF0YSBvYmplY3QuXG4gICAqIG5ldyBDaGFydGlzdC5CYXIoJy5jdC1jaGFydCcsIGRhdGEpO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBUaGlzIGV4YW1wbGUgY3JlYXRlcyBhIGJpcG9sYXIgZ3JvdXBlZCBiYXIgY2hhcnQgd2hlcmUgdGhlIGJvdW5kYXJpZXMgYXJlIGxpbWl0dGVkIHRvIC0xMCBhbmQgMTBcbiAgICogbmV3IENoYXJ0aXN0LkJhcignLmN0LWNoYXJ0Jywge1xuICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDUsIDYsIDddLFxuICAgKiAgIHNlcmllczogW1xuICAgKiAgICAgWzEsIDMsIDIsIC01LCAtMywgMSwgLTZdLFxuICAgKiAgICAgWy01LCAtMiwgLTQsIC0xLCAyLCAtMywgMV1cbiAgICogICBdXG4gICAqIH0sIHtcbiAgICogICBzZXJpZXNCYXJEaXN0YW5jZTogMTIsXG4gICAqICAgbG93OiAtMTAsXG4gICAqICAgaGlnaDogMTBcbiAgICogfSk7XG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBCYXIocXVlcnksIGRhdGEsIG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgQ2hhcnRpc3QuQmFyLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZGF0YSxcbiAgICAgIGRlZmF1bHRPcHRpb25zLFxuICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyksXG4gICAgICByZXNwb25zaXZlT3B0aW9ucyk7XG4gIH1cblxuICAvLyBDcmVhdGluZyBiYXIgY2hhcnQgdHlwZSBpbiBDaGFydGlzdCBuYW1lc3BhY2VcbiAgQ2hhcnRpc3QuQmFyID0gQ2hhcnRpc3QuQmFzZS5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBCYXIsXG4gICAgY3JlYXRlQ2hhcnQ6IGNyZWF0ZUNoYXJ0XG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG47LyoqXG4gKiBUaGUgcGllIGNoYXJ0IG1vZHVsZSBvZiBDaGFydGlzdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYXcgcGllLCBkb251dCBvciBnYXVnZSBjaGFydHNcbiAqXG4gKiBAbW9kdWxlIENoYXJ0aXN0LlBpZVxuICovXG4vKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBpbiBsaW5lIGNoYXJ0cy4gRXhwYW5kIHRoZSBjb2RlIHZpZXcgdG8gc2VlIGEgZGV0YWlsZWQgbGlzdCBvZiBvcHRpb25zIHdpdGggY29tbWVudHMuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBDaGFydGlzdC5QaWVcbiAgICovXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgd2lkdGggZm9yIHRoZSBjaGFydCBhcyBhIHN0cmluZyAoaS5lLiAnMTAwcHgnIG9yICc1MCUnKVxuICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgLy8gU3BlY2lmeSBhIGZpeGVkIGhlaWdodCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgaGVpZ2h0OiB1bmRlZmluZWQsXG4gICAgLy8gUGFkZGluZyBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBjb250YWluZXIgZWxlbWVudCBhbmQgbGFiZWxzIGFzIGEgbnVtYmVyIG9yIHBhZGRpbmcgb2JqZWN0IHt0b3A6IDUsIHJpZ2h0OiA1LCBib3R0b206IDUsIGxlZnQ6IDV9XG4gICAgY2hhcnRQYWRkaW5nOiA1LFxuICAgIC8vIE92ZXJyaWRlIHRoZSBjbGFzcyBuYW1lcyB0aGF0IGFyZSB1c2VkIHRvIGdlbmVyYXRlIHRoZSBTVkcgc3RydWN0dXJlIG9mIHRoZSBjaGFydFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGNoYXJ0UGllOiAnY3QtY2hhcnQtcGllJyxcbiAgICAgIGNoYXJ0RG9udXQ6ICdjdC1jaGFydC1kb251dCcsXG4gICAgICBzZXJpZXM6ICdjdC1zZXJpZXMnLFxuICAgICAgc2xpY2VQaWU6ICdjdC1zbGljZS1waWUnLFxuICAgICAgc2xpY2VEb251dDogJ2N0LXNsaWNlLWRvbnV0JyxcbiAgICAgIGxhYmVsOiAnY3QtbGFiZWwnXG4gICAgfSxcbiAgICAvLyBUaGUgc3RhcnQgYW5nbGUgb2YgdGhlIHBpZSBjaGFydCBpbiBkZWdyZWVzIHdoZXJlIDAgcG9pbnRzIG5vcnRoLiBBIGhpZ2hlciB2YWx1ZSBvZmZzZXRzIHRoZSBzdGFydCBhbmdsZSBjbG9ja3dpc2UuXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICAvLyBBbiBvcHRpb25hbCB0b3RhbCB5b3UgY2FuIHNwZWNpZnkuIEJ5IHNwZWNpZnlpbmcgYSB0b3RhbCB2YWx1ZSwgdGhlIHN1bSBvZiB0aGUgdmFsdWVzIGluIHRoZSBzZXJpZXMgbXVzdCBiZSB0aGlzIHRvdGFsIGluIG9yZGVyIHRvIGRyYXcgYSBmdWxsIHBpZS4gWW91IGNhbiB1c2UgdGhpcyBwYXJhbWV0ZXIgdG8gZHJhdyBvbmx5IHBhcnRzIG9mIGEgcGllIG9yIGdhdWdlIGNoYXJ0cy5cbiAgICB0b3RhbDogdW5kZWZpbmVkLFxuICAgIC8vIElmIHNwZWNpZmllZCB0aGUgZG9udXQgQ1NTIGNsYXNzZXMgd2lsbCBiZSB1c2VkIGFuZCBzdHJva2VzIHdpbGwgYmUgZHJhd24gaW5zdGVhZCBvZiBwaWUgc2xpY2VzLlxuICAgIGRvbnV0OiBmYWxzZSxcbiAgICAvLyBTcGVjaWZ5IHRoZSBkb251dCBzdHJva2Ugd2lkdGgsIGN1cnJlbnRseSBkb25lIGluIGphdmFzY3JpcHQgZm9yIGNvbnZlbmllbmNlLiBNYXkgbW92ZSB0byBDU1Mgc3R5bGVzIGluIHRoZSBmdXR1cmUuXG4gICAgLy8gVGhpcyBvcHRpb24gY2FuIGJlIHNldCBhcyBudW1iZXIgb3Igc3RyaW5nIHRvIHNwZWNpZnkgYSByZWxhdGl2ZSB3aWR0aCAoaS5lLiAxMDAgb3IgJzMwJScpLlxuICAgIGRvbnV0V2lkdGg6IDYwLFxuICAgIC8vIElmIGEgbGFiZWwgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAvLyBMYWJlbCBwb3NpdGlvbiBvZmZzZXQgZnJvbSB0aGUgc3RhbmRhcmQgcG9zaXRpb24gd2hpY2ggaXMgaGFsZiBkaXN0YW5jZSBvZiB0aGUgcmFkaXVzLiBUaGlzIHZhbHVlIGNhbiBiZSBlaXRoZXIgcG9zaXRpdmUgb3IgbmVnYXRpdmUuIFBvc2l0aXZlIHZhbHVlcyB3aWxsIHBvc2l0aW9uIHRoZSBsYWJlbCBhd2F5IGZyb20gdGhlIGNlbnRlci5cbiAgICBsYWJlbE9mZnNldDogMCxcbiAgICAvLyBUaGlzIG9wdGlvbiBjYW4gYmUgc2V0IHRvICdpbnNpZGUnLCAnb3V0c2lkZScgb3IgJ2NlbnRlcicuIFBvc2l0aW9uZWQgd2l0aCAnaW5zaWRlJyB0aGUgbGFiZWxzIHdpbGwgYmUgcGxhY2VkIG9uIGhhbGYgdGhlIGRpc3RhbmNlIG9mIHRoZSByYWRpdXMgdG8gdGhlIGJvcmRlciBvZiB0aGUgUGllIGJ5IHJlc3BlY3RpbmcgdGhlICdsYWJlbE9mZnNldCcuIFRoZSAnb3V0c2lkZScgb3B0aW9uIHdpbGwgcGxhY2UgdGhlIGxhYmVscyBhdCB0aGUgYm9yZGVyIG9mIHRoZSBwaWUgYW5kICdjZW50ZXInIHdpbGwgcGxhY2UgdGhlIGxhYmVscyBpbiB0aGUgYWJzb2x1dGUgY2VudGVyIHBvaW50IG9mIHRoZSBjaGFydC4gVGhlICdjZW50ZXInIG9wdGlvbiBvbmx5IG1ha2VzIHNlbnNlIGluIGNvbmp1bmN0aW9uIHdpdGggdGhlICdsYWJlbE9mZnNldCcgb3B0aW9uLlxuICAgIGxhYmVsUG9zaXRpb246ICdpbnNpZGUnLFxuICAgIC8vIEFuIGludGVycG9sYXRpb24gZnVuY3Rpb24gZm9yIHRoZSBsYWJlbCB2YWx1ZVxuICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAvLyBMYWJlbCBkaXJlY3Rpb24gY2FuIGJlICduZXV0cmFsJywgJ2V4cGxvZGUnIG9yICdpbXBsb2RlJy4gVGhlIGxhYmVscyBhbmNob3Igd2lsbCBiZSBwb3NpdGlvbmVkIGJhc2VkIG9uIHRob3NlIHNldHRpbmdzIGFzIHdlbGwgYXMgdGhlIGZhY3QgaWYgdGhlIGxhYmVscyBhcmUgb24gdGhlIHJpZ2h0IG9yIGxlZnQgc2lkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBjaGFydC4gVXN1YWxseSBleHBsb2RlIGlzIHVzZWZ1bCB3aGVuIGxhYmVscyBhcmUgcG9zaXRpb25lZCBmYXIgYXdheSBmcm9tIHRoZSBjZW50ZXIuXG4gICAgbGFiZWxEaXJlY3Rpb246ICduZXV0cmFsJyxcbiAgICAvLyBJZiB0cnVlIHRoZSB3aG9sZSBkYXRhIGlzIHJldmVyc2VkIGluY2x1ZGluZyBsYWJlbHMsIHRoZSBzZXJpZXMgb3JkZXIgYXMgd2VsbCBhcyB0aGUgd2hvbGUgc2VyaWVzIGRhdGEgYXJyYXlzLlxuICAgIHJldmVyc2VEYXRhOiBmYWxzZVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIFNWRyBhbmNob3IgcG9zaXRpb24gYmFzZWQgb24gZGlyZWN0aW9uIGFuZCBjZW50ZXIgcGFyYW1ldGVyXG4gICAqXG4gICAqIEBwYXJhbSBjZW50ZXJcbiAgICogQHBhcmFtIGxhYmVsXG4gICAqIEBwYXJhbSBkaXJlY3Rpb25cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gZGV0ZXJtaW5lQW5jaG9yUG9zaXRpb24oY2VudGVyLCBsYWJlbCwgZGlyZWN0aW9uKSB7XG4gICAgdmFyIHRvVGhlUmlnaHQgPSBsYWJlbC54ID4gY2VudGVyLng7XG5cbiAgICBpZih0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2V4cGxvZGUnIHx8XG4gICAgICAhdG9UaGVSaWdodCAmJiBkaXJlY3Rpb24gPT09ICdpbXBsb2RlJykge1xuICAgICAgcmV0dXJuICdzdGFydCc7XG4gICAgfSBlbHNlIGlmKHRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnaW1wbG9kZScgfHxcbiAgICAgICF0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2V4cGxvZGUnKSB7XG4gICAgICByZXR1cm4gJ2VuZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnbWlkZGxlJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgcGllIGNoYXJ0XG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDaGFydChvcHRpb25zKSB7XG4gICAgdmFyIHNlcmllc0dyb3VwcyA9IFtdLFxuICAgICAgbGFiZWxzR3JvdXAsXG4gICAgICBjaGFydFJlY3QsXG4gICAgICByYWRpdXMsXG4gICAgICBsYWJlbFJhZGl1cyxcbiAgICAgIHRvdGFsRGF0YVN1bSxcbiAgICAgIHN0YXJ0QW5nbGUgPSBvcHRpb25zLnN0YXJ0QW5nbGUsXG4gICAgICBkYXRhQXJyYXkgPSBDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhKTtcblxuICAgIC8vIENyZWF0ZSBTVkcuanMgZHJhd1xuICAgIHRoaXMuc3ZnID0gQ2hhcnRpc3QuY3JlYXRlU3ZnKHRoaXMuY29udGFpbmVyLCBvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCxvcHRpb25zLmRvbnV0ID8gb3B0aW9ucy5jbGFzc05hbWVzLmNoYXJ0RG9udXQgOiBvcHRpb25zLmNsYXNzTmFtZXMuY2hhcnRQaWUpO1xuICAgIC8vIENhbGN1bGF0ZSBjaGFydGluZyByZWN0XG4gICAgY2hhcnRSZWN0ID0gQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0KHRoaXMuc3ZnLCBvcHRpb25zLCBkZWZhdWx0T3B0aW9ucy5wYWRkaW5nKTtcbiAgICAvLyBHZXQgYmlnZ2VzdCBjaXJjbGUgcmFkaXVzIHBvc3NpYmxlIHdpdGhpbiBjaGFydFJlY3RcbiAgICByYWRpdXMgPSBNYXRoLm1pbihjaGFydFJlY3Qud2lkdGgoKSAvIDIsIGNoYXJ0UmVjdC5oZWlnaHQoKSAvIDIpO1xuICAgIC8vIENhbGN1bGF0ZSB0b3RhbCBvZiBhbGwgc2VyaWVzIHRvIGdldCByZWZlcmVuY2UgdmFsdWUgb3IgdXNlIHRvdGFsIHJlZmVyZW5jZSBmcm9tIG9wdGlvbmFsIG9wdGlvbnNcbiAgICB0b3RhbERhdGFTdW0gPSBvcHRpb25zLnRvdGFsIHx8IGRhdGFBcnJheS5yZWR1Y2UoZnVuY3Rpb24ocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSB7XG4gICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZSArIGN1cnJlbnRWYWx1ZTtcbiAgICB9LCAwKTtcblxuICAgIHZhciBkb251dFdpZHRoID0gQ2hhcnRpc3QucXVhbnRpdHkob3B0aW9ucy5kb251dFdpZHRoKTtcbiAgICBpZiAoZG9udXRXaWR0aC51bml0ID09PSAnJScpIHtcbiAgICAgIGRvbnV0V2lkdGgudmFsdWUgKj0gcmFkaXVzIC8gMTAwO1xuICAgIH1cblxuICAgIC8vIElmIHRoaXMgaXMgYSBkb251dCBjaGFydCB3ZSBuZWVkIHRvIGFkanVzdCBvdXIgcmFkaXVzIHRvIGVuYWJsZSBzdHJva2VzIHRvIGJlIGRyYXduIGluc2lkZVxuICAgIC8vIFVuZm9ydHVuYXRlbHkgdGhpcyBpcyBub3QgcG9zc2libGUgd2l0aCB0aGUgY3VycmVudCBTVkcgU3BlY1xuICAgIC8vIFNlZSB0aGlzIHByb3Bvc2FsIGZvciBtb3JlIGRldGFpbHM6IGh0dHA6Ly9saXN0cy53My5vcmcvQXJjaGl2ZXMvUHVibGljL3d3dy1zdmcvMjAwM09jdC8wMDAwLmh0bWxcbiAgICByYWRpdXMgLT0gb3B0aW9ucy5kb251dCA/IGRvbnV0V2lkdGgudmFsdWUgLyAyICA6IDA7XG5cbiAgICAvLyBJZiBsYWJlbFBvc2l0aW9uIGlzIHNldCB0byBgb3V0c2lkZWAgb3IgYSBkb251dCBjaGFydCBpcyBkcmF3biB0aGVuIHRoZSBsYWJlbCBwb3NpdGlvbiBpcyBhdCB0aGUgcmFkaXVzLFxuICAgIC8vIGlmIHJlZ3VsYXIgcGllIGNoYXJ0IGl0J3MgaGFsZiBvZiB0aGUgcmFkaXVzXG4gICAgaWYob3B0aW9ucy5sYWJlbFBvc2l0aW9uID09PSAnb3V0c2lkZScgfHwgb3B0aW9ucy5kb251dCkge1xuICAgICAgbGFiZWxSYWRpdXMgPSByYWRpdXM7XG4gICAgfSBlbHNlIGlmKG9wdGlvbnMubGFiZWxQb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIC8vIElmIGxhYmVsUG9zaXRpb24gaXMgY2VudGVyIHdlIHN0YXJ0IHdpdGggMCBhbmQgd2lsbCBsYXRlciB3YWl0IGZvciB0aGUgbGFiZWxPZmZzZXRcbiAgICAgIGxhYmVsUmFkaXVzID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVmYXVsdCBvcHRpb24gaXMgJ2luc2lkZScgd2hlcmUgd2UgdXNlIGhhbGYgdGhlIHJhZGl1cyBzbyB0aGUgbGFiZWwgd2lsbCBiZSBwbGFjZWQgaW4gdGhlIGNlbnRlciBvZiB0aGUgcGllXG4gICAgICAvLyBzbGljZVxuICAgICAgbGFiZWxSYWRpdXMgPSByYWRpdXMgLyAyO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIG9mZnNldCB0byB0aGUgbGFiZWxSYWRpdXMgd2hlcmUgYSBuZWdhdGl2ZSBvZmZzZXQgbWVhbnMgY2xvc2VkIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNoYXJ0XG4gICAgbGFiZWxSYWRpdXMgKz0gb3B0aW9ucy5sYWJlbE9mZnNldDtcblxuICAgIC8vIENhbGN1bGF0ZSBlbmQgYW5nbGUgYmFzZWQgb24gdG90YWwgc3VtIGFuZCBjdXJyZW50IGRhdGEgdmFsdWUgYW5kIG9mZnNldCB3aXRoIHBhZGRpbmdcbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgeDogY2hhcnRSZWN0LngxICsgY2hhcnRSZWN0LndpZHRoKCkgLyAyLFxuICAgICAgeTogY2hhcnRSZWN0LnkyICsgY2hhcnRSZWN0LmhlaWdodCgpIC8gMlxuICAgIH07XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBvbmx5IG9uZSBub24temVybyB2YWx1ZSBpbiB0aGUgc2VyaWVzIGFycmF5LlxuICAgIHZhciBoYXNTaW5nbGVWYWxJblNlcmllcyA9IHRoaXMuZGF0YS5zZXJpZXMuZmlsdGVyKGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKSA/IHZhbC52YWx1ZSAhPT0gMCA6IHZhbCAhPT0gMDtcbiAgICB9KS5sZW5ndGggPT09IDE7XG5cbiAgICAvL2lmIHdlIG5lZWQgdG8gc2hvdyBsYWJlbHMgd2UgY3JlYXRlIHRoZSBsYWJlbCBncm91cCBub3dcbiAgICBpZihvcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgbGFiZWxzR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJywgbnVsbCwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gRHJhdyB0aGUgc2VyaWVzXG4gICAgLy8gaW5pdGlhbGl6ZSBzZXJpZXMgZ3JvdXBzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuc2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VyaWVzID0gdGhpcy5kYXRhLnNlcmllc1tpXTtcbiAgICAgIHNlcmllc0dyb3Vwc1tpXSA9IHRoaXMuc3ZnLmVsZW0oJ2cnLCBudWxsLCBudWxsLCB0cnVlKTtcblxuICAgICAgLy8gSWYgdGhlIHNlcmllcyBpcyBhbiBvYmplY3QgYW5kIGNvbnRhaW5zIGEgbmFtZSBvciBtZXRhIGRhdGEgd2UgYWRkIGEgY3VzdG9tIGF0dHJpYnV0ZVxuICAgICAgc2VyaWVzR3JvdXBzW2ldLmF0dHIoe1xuICAgICAgICAnc2VyaWVzLW5hbWUnOiBzZXJpZXMubmFtZVxuICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgLy8gVXNlIHNlcmllcyBjbGFzcyBmcm9tIHNlcmllcyBkYXRhIG9yIGlmIG5vdCBzZXQgZ2VuZXJhdGUgb25lXG4gICAgICBzZXJpZXNHcm91cHNbaV0uYWRkQ2xhc3MoW1xuICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzLFxuICAgICAgICAoc2VyaWVzLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShpKSlcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgdmFyIGVuZEFuZ2xlID0gc3RhcnRBbmdsZSArIGRhdGFBcnJheVtpXSAvIHRvdGFsRGF0YVN1bSAqIDM2MDtcbiAgICAgIC8vIElmIHdlIG5lZWQgdG8gZHJhdyB0aGUgYXJjIGZvciBhbGwgMzYwIGRlZ3JlZXMgd2UgbmVlZCB0byBhZGQgYSBoYWNrIHdoZXJlIHdlIGNsb3NlIHRoZSBjaXJjbGVcbiAgICAgIC8vIHdpdGggWiBhbmQgdXNlIDM1OS45OSBkZWdyZWVzXG4gICAgICBpZihlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgPT09IDM2MCkge1xuICAgICAgICBlbmRBbmdsZSAtPSAwLjAxO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhcnQgPSBDaGFydGlzdC5wb2xhclRvQ2FydGVzaWFuKGNlbnRlci54LCBjZW50ZXIueSwgcmFkaXVzLCBzdGFydEFuZ2xlIC0gKGkgPT09IDAgfHwgaGFzU2luZ2xlVmFsSW5TZXJpZXMgPyAwIDogMC4yKSksXG4gICAgICAgIGVuZCA9IENoYXJ0aXN0LnBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyLngsIGNlbnRlci55LCByYWRpdXMsIGVuZEFuZ2xlKTtcblxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBhdGggZWxlbWVudCBmb3IgdGhlIHBpZSBjaGFydC4gSWYgdGhpcyBpc24ndCBhIGRvbnV0IGNoYXJ0IHdlIHNob3VsZCBjbG9zZSB0aGUgcGF0aCBmb3IgYSBjb3JyZWN0IHN0cm9rZVxuICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoIW9wdGlvbnMuZG9udXQpXG4gICAgICAgIC5tb3ZlKGVuZC54LCBlbmQueSlcbiAgICAgICAgLmFyYyhyYWRpdXMsIHJhZGl1cywgMCwgZW5kQW5nbGUgLSBzdGFydEFuZ2xlID4gMTgwLCAwLCBzdGFydC54LCBzdGFydC55KTtcblxuICAgICAgLy8gSWYgcmVndWxhciBwaWUgY2hhcnQgKG5vIGRvbnV0KSB3ZSBhZGQgYSBsaW5lIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZSBmb3IgY29tcGxldGluZyB0aGUgcGllXG4gICAgICBpZighb3B0aW9ucy5kb251dCkge1xuICAgICAgICBwYXRoLmxpbmUoY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIHRoZSBTVkcgcGF0aFxuICAgICAgLy8gSWYgdGhpcyBpcyBhIGRvbnV0IGNoYXJ0IHdlIGFkZCB0aGUgZG9udXQgY2xhc3MsIG90aGVyd2lzZSBqdXN0IGEgcmVndWxhciBzbGljZVxuICAgICAgdmFyIHBhdGhFbGVtZW50ID0gc2VyaWVzR3JvdXBzW2ldLmVsZW0oJ3BhdGgnLCB7XG4gICAgICAgIGQ6IHBhdGguc3RyaW5naWZ5KClcbiAgICAgIH0sIG9wdGlvbnMuZG9udXQgPyBvcHRpb25zLmNsYXNzTmFtZXMuc2xpY2VEb251dCA6IG9wdGlvbnMuY2xhc3NOYW1lcy5zbGljZVBpZSk7XG5cbiAgICAgIC8vIEFkZGluZyB0aGUgcGllIHNlcmllcyB2YWx1ZSB0byB0aGUgcGF0aFxuICAgICAgcGF0aEVsZW1lbnQuYXR0cih7XG4gICAgICAgICd2YWx1ZSc6IGRhdGFBcnJheVtpXSxcbiAgICAgICAgJ21ldGEnOiBDaGFydGlzdC5zZXJpYWxpemUoc2VyaWVzLm1ldGEpXG4gICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgZG9udXQsIHdlIGFkZCB0aGUgc3Ryb2tlLXdpZHRoIGFzIHN0eWxlIGF0dHJpYnV0ZVxuICAgICAgaWYob3B0aW9ucy5kb251dCkge1xuICAgICAgICBwYXRoRWxlbWVudC5hdHRyKHtcbiAgICAgICAgICAnc3R5bGUnOiAnc3Ryb2tlLXdpZHRoOiAnICsgZG9udXRXaWR0aC52YWx1ZSArICdweCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcmUgb2ZmIGRyYXcgZXZlbnRcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgIHR5cGU6ICdzbGljZScsXG4gICAgICAgIHZhbHVlOiBkYXRhQXJyYXlbaV0sXG4gICAgICAgIHRvdGFsRGF0YVN1bTogdG90YWxEYXRhU3VtLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgbWV0YTogc2VyaWVzLm1ldGEsXG4gICAgICAgIHNlcmllczogc2VyaWVzLFxuICAgICAgICBncm91cDogc2VyaWVzR3JvdXBzW2ldLFxuICAgICAgICBlbGVtZW50OiBwYXRoRWxlbWVudCxcbiAgICAgICAgcGF0aDogcGF0aC5jbG9uZSgpLFxuICAgICAgICBjZW50ZXI6IGNlbnRlcixcbiAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlOiBlbmRBbmdsZVxuICAgICAgfSk7XG5cbiAgICAgIC8vIElmIHdlIG5lZWQgdG8gc2hvdyBsYWJlbHMgd2UgbmVlZCB0byBhZGQgdGhlIGxhYmVsIGZvciB0aGlzIHNsaWNlIG5vd1xuICAgICAgaWYob3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgLy8gUG9zaXRpb24gYXQgdGhlIGxhYmVsUmFkaXVzIGRpc3RhbmNlIGZyb20gY2VudGVyIGFuZCBiZXR3ZWVuIHN0YXJ0IGFuZCBlbmQgYW5nbGVcbiAgICAgICAgdmFyIGxhYmVsUG9zaXRpb24gPSBDaGFydGlzdC5wb2xhclRvQ2FydGVzaWFuKGNlbnRlci54LCBjZW50ZXIueSwgbGFiZWxSYWRpdXMsIHN0YXJ0QW5nbGUgKyAoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSAvIDIpLFxuICAgICAgICAgIGludGVycG9sYXRlZFZhbHVlID0gb3B0aW9ucy5sYWJlbEludGVycG9sYXRpb25GbmModGhpcy5kYXRhLmxhYmVscyA/IHRoaXMuZGF0YS5sYWJlbHNbaV0gOiBkYXRhQXJyYXlbaV0sIGkpO1xuXG4gICAgICAgIGlmKGludGVycG9sYXRlZFZhbHVlIHx8IGludGVycG9sYXRlZFZhbHVlID09PSAwKSB7XG4gICAgICAgICAgdmFyIGxhYmVsRWxlbWVudCA9IGxhYmVsc0dyb3VwLmVsZW0oJ3RleHQnLCB7XG4gICAgICAgICAgICBkeDogbGFiZWxQb3NpdGlvbi54LFxuICAgICAgICAgICAgZHk6IGxhYmVsUG9zaXRpb24ueSxcbiAgICAgICAgICAgICd0ZXh0LWFuY2hvcic6IGRldGVybWluZUFuY2hvclBvc2l0aW9uKGNlbnRlciwgbGFiZWxQb3NpdGlvbiwgb3B0aW9ucy5sYWJlbERpcmVjdGlvbilcbiAgICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMubGFiZWwpLnRleHQoJycgKyBpbnRlcnBvbGF0ZWRWYWx1ZSk7XG5cbiAgICAgICAgICAvLyBGaXJlIG9mZiBkcmF3IGV2ZW50XG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgICAgIHR5cGU6ICdsYWJlbCcsXG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIGdyb3VwOiBsYWJlbHNHcm91cCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IGxhYmVsRWxlbWVudCxcbiAgICAgICAgICAgIHRleHQ6ICcnICsgaW50ZXJwb2xhdGVkVmFsdWUsXG4gICAgICAgICAgICB4OiBsYWJlbFBvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBsYWJlbFBvc2l0aW9uLnlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgbmV4dCBzdGFydEFuZ2xlIHRvIGN1cnJlbnQgZW5kQW5nbGUuIFVzZSBzbGlnaHQgb2Zmc2V0IHNvIHRoZXJlIGFyZSBubyB0cmFuc3BhcmVudCBoYWlybGluZSBpc3N1ZXNcbiAgICAgIC8vIChleGNlcHQgZm9yIGxhc3Qgc2xpY2UpXG4gICAgICBzdGFydEFuZ2xlID0gZW5kQW5nbGU7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnY3JlYXRlZCcsIHtcbiAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgc3ZnOiB0aGlzLnN2ZyxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IHBpZSBjaGFydCBhbmQgcmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZWRyYXcgdGhlIGNoYXJ0LlxuICAgKlxuICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuUGllXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IHF1ZXJ5IEEgc2VsZWN0b3IgcXVlcnkgc3RyaW5nIG9yIGRpcmVjdGx5IGEgRE9NIGVsZW1lbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IGluIHRoZSBwaWUgY2hhcnQgbmVlZHMgdG8gaGF2ZSBhIHNlcmllcyBwcm9wZXJ0eSB3aXRoIGEgb25lIGRpbWVuc2lvbmFsIGRhdGEgYXJyYXkuIFRoZSB2YWx1ZXMgd2lsbCBiZSBub3JtYWxpemVkIGFnYWluc3QgZWFjaCBvdGhlciBhbmQgZG9uJ3QgbmVjZXNzYXJpbHkgbmVlZCB0byBiZSBpbiBwZXJjZW50YWdlLiBUaGUgc2VyaWVzIHByb3BlcnR5IGNhbiBhbHNvIGJlIGFuIGFycmF5IG9mIHZhbHVlIG9iamVjdHMgdGhhdCBjb250YWluIGEgdmFsdWUgcHJvcGVydHkgYW5kIGEgY2xhc3NOYW1lIHByb3BlcnR5IHRvIG92ZXJyaWRlIHRoZSBDU1MgY2xhc3MgbmFtZSBmb3IgdGhlIHNlcmllcyBncm91cC5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3Qgd2l0aCBvcHRpb25zIHRoYXQgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBhIGRldGFpbGVkIGxpc3QuXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtyZXNwb25zaXZlT3B0aW9uc10gU3BlY2lmeSBhbiBhcnJheSBvZiByZXNwb25zaXZlIG9wdGlvbiBhcnJheXMgd2hpY2ggYXJlIGEgbWVkaWEgcXVlcnkgYW5kIG9wdGlvbnMgb2JqZWN0IHBhaXIgPT4gW1ttZWRpYVF1ZXJ5U3RyaW5nLCBvcHRpb25zT2JqZWN0XSxbbW9yZS4uLl1dXG4gICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdpdGggYSB2ZXJzaW9uIGFuZCBhbiB1cGRhdGUgbWV0aG9kIHRvIG1hbnVhbGx5IHJlZHJhdyB0aGUgY2hhcnRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gU2ltcGxlIHBpZSBjaGFydCBleGFtcGxlIHdpdGggZm91ciBzZXJpZXNcbiAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIHNlcmllczogWzEwLCAyLCA0LCAzXVxuICAgKiB9KTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gRHJhd2luZyBhIGRvbnV0IGNoYXJ0XG4gICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICogICBzZXJpZXM6IFsxMCwgMiwgNCwgM11cbiAgICogfSwge1xuICAgKiAgIGRvbnV0OiB0cnVlXG4gICAqIH0pO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBVc2luZyBkb251dCwgc3RhcnRBbmdsZSBhbmQgdG90YWwgdG8gZHJhdyBhIGdhdWdlIGNoYXJ0XG4gICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICogICBzZXJpZXM6IFsyMCwgMTAsIDMwLCA0MF1cbiAgICogfSwge1xuICAgKiAgIGRvbnV0OiB0cnVlLFxuICAgKiAgIGRvbnV0V2lkdGg6IDIwLFxuICAgKiAgIHN0YXJ0QW5nbGU6IDI3MCxcbiAgICogICB0b3RhbDogMjAwXG4gICAqIH0pO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBEcmF3aW5nIGEgcGllIGNoYXJ0IHdpdGggcGFkZGluZyBhbmQgbGFiZWxzIHRoYXQgYXJlIG91dHNpZGUgdGhlIHBpZVxuICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAqICAgc2VyaWVzOiBbMjAsIDEwLCAzMCwgNDBdXG4gICAqIH0sIHtcbiAgICogICBjaGFydFBhZGRpbmc6IDMwLFxuICAgKiAgIGxhYmVsT2Zmc2V0OiA1MCxcbiAgICogICBsYWJlbERpcmVjdGlvbjogJ2V4cGxvZGUnXG4gICAqIH0pO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBPdmVycmlkaW5nIHRoZSBjbGFzcyBuYW1lcyBmb3IgaW5kaXZpZHVhbCBzZXJpZXMgYXMgd2VsbCBhcyBhIG5hbWUgYW5kIG1ldGEgZGF0YS5cbiAgICogLy8gVGhlIG5hbWUgd2lsbCBiZSB3cml0dGVuIGFzIGN0OnNlcmllcy1uYW1lIGF0dHJpYnV0ZSBhbmQgdGhlIG1ldGEgZGF0YSB3aWxsIGJlIHNlcmlhbGl6ZWQgYW5kIHdyaXR0ZW5cbiAgICogLy8gdG8gYSBjdDptZXRhIGF0dHJpYnV0ZS5cbiAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgKiAgIHNlcmllczogW3tcbiAgICogICAgIHZhbHVlOiAyMCxcbiAgICogICAgIG5hbWU6ICdTZXJpZXMgMScsXG4gICAqICAgICBjbGFzc05hbWU6ICdteS1jdXN0b20tY2xhc3Mtb25lJyxcbiAgICogICAgIG1ldGE6ICdNZXRhIE9uZSdcbiAgICogICB9LCB7XG4gICAqICAgICB2YWx1ZTogMTAsXG4gICAqICAgICBuYW1lOiAnU2VyaWVzIDInLFxuICAgKiAgICAgY2xhc3NOYW1lOiAnbXktY3VzdG9tLWNsYXNzLXR3bycsXG4gICAqICAgICBtZXRhOiAnTWV0YSBUd28nXG4gICAqICAgfSwge1xuICAgKiAgICAgdmFsdWU6IDcwLFxuICAgKiAgICAgbmFtZTogJ1NlcmllcyAzJyxcbiAgICogICAgIGNsYXNzTmFtZTogJ215LWN1c3RvbS1jbGFzcy10aHJlZScsXG4gICAqICAgICBtZXRhOiAnTWV0YSBUaHJlZSdcbiAgICogICB9XVxuICAgKiB9KTtcbiAgICovXG4gIGZ1bmN0aW9uIFBpZShxdWVyeSwgZGF0YSwgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICBDaGFydGlzdC5QaWUuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgcXVlcnksXG4gICAgICBkYXRhLFxuICAgICAgZGVmYXVsdE9wdGlvbnMsXG4gICAgICBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKSxcbiAgICAgIHJlc3BvbnNpdmVPcHRpb25zKTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIHBpZSBjaGFydCB0eXBlIGluIENoYXJ0aXN0IG5hbWVzcGFjZVxuICBDaGFydGlzdC5QaWUgPSBDaGFydGlzdC5CYXNlLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IFBpZSxcbiAgICBjcmVhdGVDaGFydDogY3JlYXRlQ2hhcnQsXG4gICAgZGV0ZXJtaW5lQW5jaG9yUG9zaXRpb246IGRldGVybWluZUFuY2hvclBvc2l0aW9uXG4gIH0pO1xuXG59KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG5cbnJldHVybiBDaGFydGlzdDtcblxufSkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGlja3kgPSByZXF1aXJlKCd0aWNreScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlIChmbiwgYXJncywgY3R4KSB7XG4gIGlmICghZm4pIHsgcmV0dXJuOyB9XG4gIHRpY2t5KGZ1bmN0aW9uIHJ1biAoKSB7XG4gICAgZm4uYXBwbHkoY3R4IHx8IG51bGwsIGFyZ3MgfHwgW10pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhdG9hID0gcmVxdWlyZSgnYXRvYScpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtaXR0ZXIgKHRoaW5nLCBvcHRpb25zKSB7XG4gIHZhciBvcHRzID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGV2dCA9IHt9O1xuICBpZiAodGhpbmcgPT09IHVuZGVmaW5lZCkgeyB0aGluZyA9IHt9OyB9XG4gIHRoaW5nLm9uID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgaWYgKCFldnRbdHlwZV0pIHtcbiAgICAgIGV2dFt0eXBlXSA9IFtmbl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2dFt0eXBlXS5wdXNoKGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vbmNlID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgZm4uX29uY2UgPSB0cnVlOyAvLyB0aGluZy5vZmYoZm4pIHN0aWxsIHdvcmtzIVxuICAgIHRoaW5nLm9uKHR5cGUsIGZuKTtcbiAgICByZXR1cm4gdGhpbmc7XG4gIH07XG4gIHRoaW5nLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAoYyA9PT0gMSkge1xuICAgICAgZGVsZXRlIGV2dFt0eXBlXTtcbiAgICB9IGVsc2UgaWYgKGMgPT09IDApIHtcbiAgICAgIGV2dCA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXQgPSBldnRbdHlwZV07XG4gICAgICBpZiAoIWV0KSB7IHJldHVybiB0aGluZzsgfVxuICAgICAgZXQuc3BsaWNlKGV0LmluZGV4T2YoZm4pLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGluZy5lbWl0dGVyU25hcHNob3QoYXJncy5zaGlmdCgpKS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbiAgdGhpbmcuZW1pdHRlclNuYXBzaG90ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICB2YXIgZXQgPSAoZXZ0W3R5cGVdIHx8IFtdKS5zbGljZSgwKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhdG9hKGFyZ3VtZW50cyk7XG4gICAgICB2YXIgY3R4ID0gdGhpcyB8fCB0aGluZztcbiAgICAgIGlmICh0eXBlID09PSAnZXJyb3InICYmIG9wdHMudGhyb3dzICE9PSBmYWxzZSAmJiAhZXQubGVuZ3RoKSB7IHRocm93IGFyZ3MubGVuZ3RoID09PSAxID8gYXJnc1swXSA6IGFyZ3M7IH1cbiAgICAgIGV0LmZvckVhY2goZnVuY3Rpb24gZW1pdHRlciAobGlzdGVuKSB7XG4gICAgICAgIGlmIChvcHRzLmFzeW5jKSB7IGRlYm91bmNlKGxpc3RlbiwgYXJncywgY3R4KTsgfSBlbHNlIHsgbGlzdGVuLmFwcGx5KGN0eCwgYXJncyk7IH1cbiAgICAgICAgaWYgKGxpc3Rlbi5fb25jZSkgeyB0aGluZy5vZmYodHlwZSwgbGlzdGVuKTsgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpbmc7XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIHRoaW5nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGN1c3RvbUV2ZW50ID0gcmVxdWlyZSgnY3VzdG9tLWV2ZW50Jyk7XG52YXIgZXZlbnRtYXAgPSByZXF1aXJlKCcuL2V2ZW50bWFwJyk7XG52YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIGFkZEV2ZW50ID0gYWRkRXZlbnRFYXN5O1xudmFyIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRFYXN5O1xudmFyIGhhcmRDYWNoZSA9IFtdO1xuXG5pZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gIGFkZEV2ZW50ID0gYWRkRXZlbnRIYXJkO1xuICByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50SGFyZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkRXZlbnQsXG4gIHJlbW92ZTogcmVtb3ZlRXZlbnQsXG4gIGZhYnJpY2F0ZTogZmFicmljYXRlRXZlbnRcbn07XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgd3JhcChlbCwgdHlwZSwgZm4pKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGxpc3RlbmVyID0gdW53cmFwKGVsLCB0eXBlLCBmbik7XG4gIGlmIChsaXN0ZW5lcikge1xuICAgIHJldHVybiBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZhYnJpY2F0ZUV2ZW50IChlbCwgdHlwZSwgbW9kZWwpIHtcbiAgdmFyIGUgPSBldmVudG1hcC5pbmRleE9mKHR5cGUpID09PSAtMSA/IG1ha2VDdXN0b21FdmVudCgpIDogbWFrZUNsYXNzaWNFdmVudCgpO1xuICBpZiAoZWwuZGlzcGF0Y2hFdmVudCkge1xuICAgIGVsLmRpc3BhdGNoRXZlbnQoZSk7XG4gIH0gZWxzZSB7XG4gICAgZWwuZmlyZUV2ZW50KCdvbicgKyB0eXBlLCBlKTtcbiAgfVxuICBmdW5jdGlvbiBtYWtlQ2xhc3NpY0V2ZW50ICgpIHtcbiAgICB2YXIgZTtcbiAgICBpZiAoZG9jLmNyZWF0ZUV2ZW50KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZS5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChkb2MuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIGU7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUN1c3RvbUV2ZW50ICgpIHtcbiAgICByZXR1cm4gbmV3IGN1c3RvbUV2ZW50KHR5cGUsIHsgZGV0YWlsOiBtb2RlbCB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cmFwcGVyRmFjdG9yeSAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVyIChvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSBvcmlnaW5hbEV2ZW50IHx8IGdsb2JhbC5ldmVudDtcbiAgICBlLnRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLnByZXZlbnREZWZhdWx0ID0gZS5wcmV2ZW50RGVmYXVsdCB8fCBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCAoKSB7IGUucmV0dXJuVmFsdWUgPSBmYWxzZTsgfTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbiA9IGUuc3RvcFByb3BhZ2F0aW9uIHx8IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbiAoKSB7IGUuY2FuY2VsQnViYmxlID0gdHJ1ZTsgfTtcbiAgICBlLndoaWNoID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAgZm4uY2FsbChlbCwgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHdyYXAgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgd3JhcHBlciA9IHVud3JhcChlbCwgdHlwZSwgZm4pIHx8IHdyYXBwZXJGYWN0b3J5KGVsLCB0eXBlLCBmbik7XG4gIGhhcmRDYWNoZS5wdXNoKHtcbiAgICB3cmFwcGVyOiB3cmFwcGVyLFxuICAgIGVsZW1lbnQ6IGVsLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgZm46IGZuXG4gIH0pO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gdW53cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGkgPSBmaW5kKGVsLCB0eXBlLCBmbik7XG4gIGlmIChpKSB7XG4gICAgdmFyIHdyYXBwZXIgPSBoYXJkQ2FjaGVbaV0ud3JhcHBlcjtcbiAgICBoYXJkQ2FjaGUuc3BsaWNlKGksIDEpOyAvLyBmcmVlIHVwIGEgdGFkIG9mIG1lbW9yeVxuICAgIHJldHVybiB3cmFwcGVyO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmQgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgaSwgaXRlbTtcbiAgZm9yIChpID0gMDsgaSA8IGhhcmRDYWNoZS5sZW5ndGg7IGkrKykge1xuICAgIGl0ZW0gPSBoYXJkQ2FjaGVbaV07XG4gICAgaWYgKGl0ZW0uZWxlbWVudCA9PT0gZWwgJiYgaXRlbS50eXBlID09PSB0eXBlICYmIGl0ZW0uZm4gPT09IGZuKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50bWFwID0gW107XG52YXIgZXZlbnRuYW1lID0gJyc7XG52YXIgcm9uID0gL15vbi87XG5cbmZvciAoZXZlbnRuYW1lIGluIGdsb2JhbCkge1xuICBpZiAocm9uLnRlc3QoZXZlbnRuYW1lKSkge1xuICAgIGV2ZW50bWFwLnB1c2goZXZlbnRuYW1lLnNsaWNlKDIpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50bWFwO1xuIiwiXG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbmZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHAgPSBuZXcgTmF0aXZlQ3VzdG9tRXZlbnQoJ2NhdCcsIHsgZGV0YWlsOiB7IGZvbzogJ2JhcicgfSB9KTtcbiAgICByZXR1cm4gICdjYXQnID09PSBwLnR5cGUgJiYgJ2JhcicgPT09IHAuZGV0YWlsLmZvbztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50LkN1c3RvbUV2ZW50XG4gKlxuICogQHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBOYXRpdmVDdXN0b21FdmVudCA6XG5cbi8vIElFID49IDlcbidmdW5jdGlvbicgPT09IHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA/IGZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgaWYgKHBhcmFtcykge1xuICAgIGUuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gIH0gZWxzZSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCB2b2lkIDApO1xuICB9XG4gIHJldHVybiBlO1xufSA6XG5cbi8vIElFIDw9IDhcbmZ1bmN0aW9uIEN1c3RvbUV2ZW50ICh0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICBlLnR5cGUgPSB0eXBlO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5idWJibGVzID0gQm9vbGVhbihwYXJhbXMuYnViYmxlcyk7XG4gICAgZS5jYW5jZWxhYmxlID0gQm9vbGVhbihwYXJhbXMuY2FuY2VsYWJsZSk7XG4gICAgZS5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICB9IGVsc2Uge1xuICAgIGUuYnViYmxlcyA9IGZhbHNlO1xuICAgIGUuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgIGUuZGV0YWlsID0gdm9pZCAwO1xuICB9XG4gIHJldHVybiBlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FjaGUgPSB7fTtcbnZhciBzdGFydCA9ICcoPzpefFxcXFxzKSc7XG52YXIgZW5kID0gJyg/OlxcXFxzfCQpJztcblxuZnVuY3Rpb24gbG9va3VwQ2xhc3MgKGNsYXNzTmFtZSkge1xuICB2YXIgY2FjaGVkID0gY2FjaGVbY2xhc3NOYW1lXTtcbiAgaWYgKGNhY2hlZCkge1xuICAgIGNhY2hlZC5sYXN0SW5kZXggPSAwO1xuICB9IGVsc2Uge1xuICAgIGNhY2hlW2NsYXNzTmFtZV0gPSBjYWNoZWQgPSBuZXcgUmVnRXhwKHN0YXJ0ICsgY2xhc3NOYW1lICsgZW5kLCAnZycpO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzIChlbCwgY2xhc3NOYW1lKSB7XG4gIHZhciBjdXJyZW50ID0gZWwuY2xhc3NOYW1lO1xuICBpZiAoIWN1cnJlbnQubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICB9IGVsc2UgaWYgKCFsb29rdXBDbGFzcyhjbGFzc05hbWUpLnRlc3QoY3VycmVudCkpIHtcbiAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJtQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobG9va3VwQ2xhc3MoY2xhc3NOYW1lKSwgJyAnKS50cmltKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZENsYXNzLFxuICBybTogcm1DbGFzc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVtaXR0ZXIgPSByZXF1aXJlKCdjb250cmEvZW1pdHRlcicpO1xudmFyIGNyb3NzdmVudCA9IHJlcXVpcmUoJ2Nyb3NzdmVudCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMnKTtcbnZhciBkb2MgPSBkb2N1bWVudDtcbnZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG5mdW5jdGlvbiBkcmFndWxhIChpbml0aWFsQ29udGFpbmVycywgb3B0aW9ucykge1xuICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGluaXRpYWxDb250YWluZXJzKSA9PT0gZmFsc2UpIHtcbiAgICBvcHRpb25zID0gaW5pdGlhbENvbnRhaW5lcnM7XG4gICAgaW5pdGlhbENvbnRhaW5lcnMgPSBbXTtcbiAgfVxuICB2YXIgX21pcnJvcjsgLy8gbWlycm9yIGltYWdlXG4gIHZhciBfc291cmNlOyAvLyBzb3VyY2UgY29udGFpbmVyXG4gIHZhciBfaXRlbTsgLy8gaXRlbSBiZWluZyBkcmFnZ2VkXG4gIHZhciBfb2Zmc2V0WDsgLy8gcmVmZXJlbmNlIHhcbiAgdmFyIF9vZmZzZXRZOyAvLyByZWZlcmVuY2UgeVxuICB2YXIgX21vdmVYOyAvLyByZWZlcmVuY2UgbW92ZSB4XG4gIHZhciBfbW92ZVk7IC8vIHJlZmVyZW5jZSBtb3ZlIHlcbiAgdmFyIF9pbml0aWFsU2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgd2hlbiBncmFiYmVkXG4gIHZhciBfY3VycmVudFNpYmxpbmc7IC8vIHJlZmVyZW5jZSBzaWJsaW5nIG5vd1xuICB2YXIgX2NvcHk7IC8vIGl0ZW0gdXNlZCBmb3IgY29weWluZ1xuICB2YXIgX3JlbmRlclRpbWVyOyAvLyB0aW1lciBmb3Igc2V0VGltZW91dCByZW5kZXJNaXJyb3JJbWFnZVxuICB2YXIgX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDsgLy8gbGFzdCBjb250YWluZXIgaXRlbSB3YXMgb3ZlclxuICB2YXIgX2dyYWJiZWQ7IC8vIGhvbGRzIG1vdXNlZG93biBjb250ZXh0IHVudGlsIGZpcnN0IG1vdXNlbW92ZVxuXG4gIHZhciBvID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKG8ubW92ZXMgPT09IHZvaWQgMCkgeyBvLm1vdmVzID0gYWx3YXlzOyB9XG4gIGlmIChvLmFjY2VwdHMgPT09IHZvaWQgMCkgeyBvLmFjY2VwdHMgPSBhbHdheXM7IH1cbiAgaWYgKG8uaW52YWxpZCA9PT0gdm9pZCAwKSB7IG8uaW52YWxpZCA9IGludmFsaWRUYXJnZXQ7IH1cbiAgaWYgKG8uY29udGFpbmVycyA9PT0gdm9pZCAwKSB7IG8uY29udGFpbmVycyA9IGluaXRpYWxDb250YWluZXJzIHx8IFtdOyB9XG4gIGlmIChvLmlzQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5pc0NvbnRhaW5lciA9IG5ldmVyOyB9XG4gIGlmIChvLmNvcHkgPT09IHZvaWQgMCkgeyBvLmNvcHkgPSBmYWxzZTsgfVxuICBpZiAoby5jb3B5U29ydFNvdXJjZSA9PT0gdm9pZCAwKSB7IG8uY29weVNvcnRTb3VyY2UgPSBmYWxzZTsgfVxuICBpZiAoby5yZXZlcnRPblNwaWxsID09PSB2b2lkIDApIHsgby5yZXZlcnRPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdm9pZCAwKSB7IG8ucmVtb3ZlT25TcGlsbCA9IGZhbHNlOyB9XG4gIGlmIChvLmRpcmVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uZGlyZWN0aW9uID0gJ3ZlcnRpY2FsJzsgfVxuICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24gPT09IHZvaWQgMCkgeyBvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9IHRydWU7IH1cbiAgaWYgKG8ubWlycm9yQ29udGFpbmVyID09PSB2b2lkIDApIHsgby5taXJyb3JDb250YWluZXIgPSBkb2MuYm9keTsgfVxuXG4gIHZhciBkcmFrZSA9IGVtaXR0ZXIoe1xuICAgIGNvbnRhaW5lcnM6IG8uY29udGFpbmVycyxcbiAgICBzdGFydDogbWFudWFsU3RhcnQsXG4gICAgZW5kOiBlbmQsXG4gICAgY2FuY2VsOiBjYW5jZWwsXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgZGVzdHJveTogZGVzdHJveSxcbiAgICBkcmFnZ2luZzogZmFsc2VcbiAgfSk7XG5cbiAgaWYgKG8ucmVtb3ZlT25TcGlsbCA9PT0gdHJ1ZSkge1xuICAgIGRyYWtlLm9uKCdvdmVyJywgc3BpbGxPdmVyKS5vbignb3V0Jywgc3BpbGxPdXQpO1xuICB9XG5cbiAgZXZlbnRzKCk7XG5cbiAgcmV0dXJuIGRyYWtlO1xuXG4gIGZ1bmN0aW9uIGlzQ29udGFpbmVyIChlbCkge1xuICAgIHJldHVybiBkcmFrZS5jb250YWluZXJzLmluZGV4T2YoZWwpICE9PSAtMSB8fCBvLmlzQ29udGFpbmVyKGVsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNlZG93bicsIGdyYWIpO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2V1cCcsIHJlbGVhc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnR1YWxNb3ZlbWVudHMgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZW1vdmUnLCBzdGFydEJlY2F1c2VNb3VzZU1vdmVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmVtZW50cyAocmVtb3ZlKSB7XG4gICAgdmFyIG9wID0gcmVtb3ZlID8gJ3JlbW92ZScgOiAnYWRkJztcbiAgICBjcm9zc3ZlbnRbb3BdKGRvY3VtZW50RWxlbWVudCwgJ3NlbGVjdHN0YXJ0JywgcHJldmVudEdyYWJiZWQpOyAvLyBJRThcbiAgICBjcm9zc3ZlbnRbb3BdKGRvY3VtZW50RWxlbWVudCwgJ2NsaWNrJywgcHJldmVudEdyYWJiZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveSAoKSB7XG4gICAgZXZlbnRzKHRydWUpO1xuICAgIHJlbGVhc2Uoe30pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJldmVudEdyYWJiZWQgKGUpIHtcbiAgICBpZiAoX2dyYWJiZWQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBncmFiIChlKSB7XG4gICAgX21vdmVYID0gZS5jbGllbnRYO1xuICAgIF9tb3ZlWSA9IGUuY2xpZW50WTtcblxuICAgIHZhciBpZ25vcmUgPSB3aGljaE1vdXNlQnV0dG9uKGUpICE9PSAxIHx8IGUubWV0YUtleSB8fCBlLmN0cmxLZXk7XG4gICAgaWYgKGlnbm9yZSkge1xuICAgICAgcmV0dXJuOyAvLyB3ZSBvbmx5IGNhcmUgYWJvdXQgaG9uZXN0LXRvLWdvZCBsZWZ0IGNsaWNrcyBhbmQgdG91Y2ggZXZlbnRzXG4gICAgfVxuICAgIHZhciBpdGVtID0gZS50YXJnZXQ7XG4gICAgdmFyIGNvbnRleHQgPSBjYW5TdGFydChpdGVtKTtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgX2dyYWJiZWQgPSBjb250ZXh0O1xuICAgIGV2ZW50dWFsTW92ZW1lbnRzKCk7XG4gICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgIGlmIChpc0lucHV0KGl0ZW0pKSB7IC8vIHNlZSBhbHNvOiBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMjA4XG4gICAgICAgIGl0ZW0uZm9jdXMoKTsgLy8gZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzE3NlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMTU1XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRCZWNhdXNlTW91c2VNb3ZlZCAoZSkge1xuICAgIGlmICghX2dyYWJiZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHdoaWNoTW91c2VCdXR0b24oZSkgPT09IDApIHtcbiAgICAgIHJlbGVhc2Uoe30pO1xuICAgICAgcmV0dXJuOyAvLyB3aGVuIHRleHQgaXMgc2VsZWN0ZWQgb24gYW4gaW5wdXQgYW5kIHRoZW4gZHJhZ2dlZCwgbW91c2V1cCBkb2Vzbid0IGZpcmUuIHRoaXMgaXMgb3VyIG9ubHkgaG9wZVxuICAgIH1cbiAgICAvLyB0cnV0aHkgY2hlY2sgZml4ZXMgIzIzOSwgZXF1YWxpdHkgZml4ZXMgIzIwN1xuICAgIGlmIChlLmNsaWVudFggIT09IHZvaWQgMCAmJiBlLmNsaWVudFggPT09IF9tb3ZlWCAmJiBlLmNsaWVudFkgIT09IHZvaWQgMCAmJiBlLmNsaWVudFkgPT09IF9tb3ZlWSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoby5pZ25vcmVJbnB1dFRleHRTZWxlY3Rpb24pIHtcbiAgICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKTtcbiAgICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKTtcbiAgICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoY2xpZW50WCwgY2xpZW50WSk7XG4gICAgICBpZiAoaXNJbnB1dChlbGVtZW50QmVoaW5kQ3Vyc29yKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGdyYWJiZWQgPSBfZ3JhYmJlZDsgLy8gY2FsbCB0byBlbmQoKSB1bnNldHMgX2dyYWJiZWRcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHMoKTtcbiAgICBlbmQoKTtcbiAgICBzdGFydChncmFiYmVkKTtcblxuICAgIHZhciBvZmZzZXQgPSBnZXRPZmZzZXQoX2l0ZW0pO1xuICAgIF9vZmZzZXRYID0gZ2V0Q29vcmQoJ3BhZ2VYJywgZSkgLSBvZmZzZXQubGVmdDtcbiAgICBfb2Zmc2V0WSA9IGdldENvb3JkKCdwYWdlWScsIGUpIC0gb2Zmc2V0LnRvcDtcblxuICAgIGNsYXNzZXMuYWRkKF9jb3B5IHx8IF9pdGVtLCAnZ3UtdHJhbnNpdCcpO1xuICAgIHJlbmRlck1pcnJvckltYWdlKCk7XG4gICAgZHJhZyhlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhblN0YXJ0IChpdGVtKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nICYmIF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzQ29udGFpbmVyKGl0ZW0pKSB7XG4gICAgICByZXR1cm47IC8vIGRvbid0IGRyYWcgY29udGFpbmVyIGl0c2VsZlxuICAgIH1cbiAgICB2YXIgaGFuZGxlID0gaXRlbTtcbiAgICB3aGlsZSAoZ2V0UGFyZW50KGl0ZW0pICYmIGlzQ29udGFpbmVyKGdldFBhcmVudChpdGVtKSkgPT09IGZhbHNlKSB7XG4gICAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaXRlbSA9IGdldFBhcmVudChpdGVtKTsgLy8gZHJhZyB0YXJnZXQgc2hvdWxkIGJlIGEgdG9wIGVsZW1lbnRcbiAgICAgIGlmICghaXRlbSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzb3VyY2UgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG8uaW52YWxpZChpdGVtLCBoYW5kbGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1vdmFibGUgPSBvLm1vdmVzKGl0ZW0sIHNvdXJjZSwgaGFuZGxlLCBuZXh0RWwoaXRlbSkpO1xuICAgIGlmICghbW92YWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpdGVtOiBpdGVtLFxuICAgICAgc291cmNlOiBzb3VyY2VcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbWFudWFsU3RhcnQgKGl0ZW0pIHtcbiAgICB2YXIgY29udGV4dCA9IGNhblN0YXJ0KGl0ZW0pO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBzdGFydChjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydCAoY29udGV4dCkge1xuICAgIGlmIChpc0NvcHkoY29udGV4dC5pdGVtLCBjb250ZXh0LnNvdXJjZSkpIHtcbiAgICAgIF9jb3B5ID0gY29udGV4dC5pdGVtLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIGRyYWtlLmVtaXQoJ2Nsb25lZCcsIF9jb3B5LCBjb250ZXh0Lml0ZW0sICdjb3B5Jyk7XG4gICAgfVxuXG4gICAgX3NvdXJjZSA9IGNvbnRleHQuc291cmNlO1xuICAgIF9pdGVtID0gY29udGV4dC5pdGVtO1xuICAgIF9pbml0aWFsU2libGluZyA9IF9jdXJyZW50U2libGluZyA9IG5leHRFbChjb250ZXh0Lml0ZW0pO1xuXG4gICAgZHJha2UuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGRyYWtlLmVtaXQoJ2RyYWcnLCBfaXRlbSwgX3NvdXJjZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZhbGlkVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBlbmQgKCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICBkcm9wKGl0ZW0sIGdldFBhcmVudChpdGVtKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmdyYWIgKCkge1xuICAgIF9ncmFiYmVkID0gZmFsc2U7XG4gICAgZXZlbnR1YWxNb3ZlbWVudHModHJ1ZSk7XG4gICAgbW92ZW1lbnRzKHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVsZWFzZSAoZSkge1xuICAgIHVuZ3JhYigpO1xuXG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKTtcbiAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSk7XG4gICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBnZXRFbGVtZW50QmVoaW5kUG9pbnQoX21pcnJvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBmaW5kRHJvcFRhcmdldChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICBpZiAoZHJvcFRhcmdldCAmJiAoKF9jb3B5ICYmIG8uY29weVNvcnRTb3VyY2UpIHx8ICghX2NvcHkgfHwgZHJvcFRhcmdldCAhPT0gX3NvdXJjZSkpKSB7XG4gICAgICBkcm9wKGl0ZW0sIGRyb3BUYXJnZXQpO1xuICAgIH0gZWxzZSBpZiAoby5yZW1vdmVPblNwaWxsKSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJvcCAoaXRlbSwgdGFyZ2V0KSB7XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoX2NvcHkgJiYgby5jb3B5U29ydFNvdXJjZSAmJiB0YXJnZXQgPT09IF9zb3VyY2UpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfaXRlbSk7XG4gICAgfVxuICAgIGlmIChpc0luaXRpYWxQbGFjZW1lbnQodGFyZ2V0KSkge1xuICAgICAgZHJha2UuZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSwgX3NvdXJjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2Ryb3AnLCBpdGVtLCB0YXJnZXQsIF9zb3VyY2UsIF9jdXJyZW50U2libGluZyk7XG4gICAgfVxuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgIH1cbiAgICBkcmFrZS5lbWl0KF9jb3B5ID8gJ2NhbmNlbCcgOiAncmVtb3ZlJywgaXRlbSwgcGFyZW50LCBfc291cmNlKTtcbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwgKHJldmVydCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJldmVydHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCA/IHJldmVydCA6IG8ucmV2ZXJ0T25TcGlsbDtcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKHBhcmVudCA9PT0gX3NvdXJjZSAmJiBfY29weSkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKF9jb3B5KTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWwgPSBpc0luaXRpYWxQbGFjZW1lbnQocGFyZW50KTtcbiAgICBpZiAoaW5pdGlhbCA9PT0gZmFsc2UgJiYgIV9jb3B5ICYmIHJldmVydHMpIHtcbiAgICAgIF9zb3VyY2UuaW5zZXJ0QmVmb3JlKGl0ZW0sIF9pbml0aWFsU2libGluZyk7XG4gICAgfVxuICAgIGlmIChpbml0aWFsIHx8IHJldmVydHMpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2NhbmNlbCcsIGl0ZW0sIF9zb3VyY2UsIF9zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFrZS5lbWl0KCdkcm9wJywgaXRlbSwgcGFyZW50LCBfc291cmNlLCBfY3VycmVudFNpYmxpbmcpO1xuICAgIH1cbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwICgpIHtcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHVuZ3JhYigpO1xuICAgIHJlbW92ZU1pcnJvckltYWdlKCk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGNsYXNzZXMucm0oaXRlbSwgJ2d1LXRyYW5zaXQnKTtcbiAgICB9XG4gICAgaWYgKF9yZW5kZXJUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KF9yZW5kZXJUaW1lcik7XG4gICAgfVxuICAgIGRyYWtlLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgaWYgKF9sYXN0RHJvcFRhcmdldCkge1xuICAgICAgZHJha2UuZW1pdCgnb3V0JywgaXRlbSwgX2xhc3REcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZHJha2UuZW1pdCgnZHJhZ2VuZCcsIGl0ZW0pO1xuICAgIF9zb3VyY2UgPSBfaXRlbSA9IF9jb3B5ID0gX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gX3JlbmRlclRpbWVyID0gX2xhc3REcm9wVGFyZ2V0ID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5pdGlhbFBsYWNlbWVudCAodGFyZ2V0LCBzKSB7XG4gICAgdmFyIHNpYmxpbmc7XG4gICAgaWYgKHMgIT09IHZvaWQgMCkge1xuICAgICAgc2libGluZyA9IHM7XG4gICAgfSBlbHNlIGlmIChfbWlycm9yKSB7XG4gICAgICBzaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaWJsaW5nID0gbmV4dEVsKF9jb3B5IHx8IF9pdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldCA9PT0gX3NvdXJjZSAmJiBzaWJsaW5nID09PSBfaW5pdGlhbFNpYmxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kRHJvcFRhcmdldCAoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSkge1xuICAgIHZhciB0YXJnZXQgPSBlbGVtZW50QmVoaW5kQ3Vyc29yO1xuICAgIHdoaWxlICh0YXJnZXQgJiYgIWFjY2VwdGVkKCkpIHtcbiAgICAgIHRhcmdldCA9IGdldFBhcmVudCh0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gYWNjZXB0ZWQgKCkge1xuICAgICAgdmFyIGRyb3BwYWJsZSA9IGlzQ29udGFpbmVyKHRhcmdldCk7XG4gICAgICBpZiAoZHJvcHBhYmxlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbW1lZGlhdGUgPSBnZXRJbW1lZGlhdGVDaGlsZCh0YXJnZXQsIGVsZW1lbnRCZWhpbmRDdXJzb3IpO1xuICAgICAgdmFyIHJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZSh0YXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgICB2YXIgaW5pdGlhbCA9IGlzSW5pdGlhbFBsYWNlbWVudCh0YXJnZXQsIHJlZmVyZW5jZSk7XG4gICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gc2hvdWxkIGFsd2F5cyBiZSBhYmxlIHRvIGRyb3AgaXQgcmlnaHQgYmFjayB3aGVyZSBpdCB3YXNcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLmFjY2VwdHMoX2l0ZW0sIHRhcmdldCwgX3NvdXJjZSwgcmVmZXJlbmNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcmFnIChlKSB7XG4gICAgaWYgKCFfbWlycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBjbGllbnRYID0gZ2V0Q29vcmQoJ2NsaWVudFgnLCBlKTtcbiAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSk7XG4gICAgdmFyIHggPSBjbGllbnRYIC0gX29mZnNldFg7XG4gICAgdmFyIHkgPSBjbGllbnRZIC0gX29mZnNldFk7XG5cbiAgICBfbWlycm9yLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBfbWlycm9yLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGdldEVsZW1lbnRCZWhpbmRQb2ludChfbWlycm9yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB2YXIgZHJvcFRhcmdldCA9IGZpbmREcm9wVGFyZ2V0KGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBjaGFuZ2VkID0gZHJvcFRhcmdldCAhPT0gbnVsbCAmJiBkcm9wVGFyZ2V0ICE9PSBfbGFzdERyb3BUYXJnZXQ7XG4gICAgaWYgKGNoYW5nZWQgfHwgZHJvcFRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgb3V0KCk7XG4gICAgICBfbGFzdERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgb3ZlcigpO1xuICAgIH1cbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50KGl0ZW0pO1xuICAgIGlmIChkcm9wVGFyZ2V0ID09PSBfc291cmNlICYmIF9jb3B5ICYmICFvLmNvcHlTb3J0U291cmNlKSB7XG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlZmVyZW5jZTtcbiAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQoZHJvcFRhcmdldCwgZWxlbWVudEJlaGluZEN1cnNvcik7XG4gICAgaWYgKGltbWVkaWF0ZSAhPT0gbnVsbCkge1xuICAgICAgcmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKGRyb3BUYXJnZXQsIGltbWVkaWF0ZSwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgfSBlbHNlIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHRydWUgJiYgIV9jb3B5KSB7XG4gICAgICByZWZlcmVuY2UgPSBfaW5pdGlhbFNpYmxpbmc7XG4gICAgICBkcm9wVGFyZ2V0ID0gX3NvdXJjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9jb3B5ICYmIHBhcmVudCkge1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHJlZmVyZW5jZSA9PT0gbnVsbCB8fFxuICAgICAgcmVmZXJlbmNlICE9PSBpdGVtICYmXG4gICAgICByZWZlcmVuY2UgIT09IG5leHRFbChpdGVtKSAmJlxuICAgICAgcmVmZXJlbmNlICE9PSBfY3VycmVudFNpYmxpbmdcbiAgICApIHtcbiAgICAgIF9jdXJyZW50U2libGluZyA9IHJlZmVyZW5jZTtcbiAgICAgIGRyb3BUYXJnZXQuaW5zZXJ0QmVmb3JlKGl0ZW0sIHJlZmVyZW5jZSk7XG4gICAgICBkcmFrZS5lbWl0KCdzaGFkb3cnLCBpdGVtLCBkcm9wVGFyZ2V0LCBfc291cmNlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW92ZWQgKHR5cGUpIHsgZHJha2UuZW1pdCh0eXBlLCBpdGVtLCBfbGFzdERyb3BUYXJnZXQsIF9zb3VyY2UpOyB9XG4gICAgZnVuY3Rpb24gb3ZlciAoKSB7IGlmIChjaGFuZ2VkKSB7IG1vdmVkKCdvdmVyJyk7IH0gfVxuICAgIGZ1bmN0aW9uIG91dCAoKSB7IGlmIChfbGFzdERyb3BUYXJnZXQpIHsgbW92ZWQoJ291dCcpOyB9IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNwaWxsT3ZlciAoZWwpIHtcbiAgICBjbGFzc2VzLnJtKGVsLCAnZ3UtaGlkZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdXQgKGVsKSB7XG4gICAgaWYgKGRyYWtlLmRyYWdnaW5nKSB7IGNsYXNzZXMuYWRkKGVsLCAnZ3UtaGlkZScpOyB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJNaXJyb3JJbWFnZSAoKSB7XG4gICAgaWYgKF9taXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJlY3QgPSBfaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBfbWlycm9yID0gX2l0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgIF9taXJyb3Iuc3R5bGUud2lkdGggPSBnZXRSZWN0V2lkdGgocmVjdCkgKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUuaGVpZ2h0ID0gZ2V0UmVjdEhlaWdodChyZWN0KSArICdweCc7XG4gICAgY2xhc3Nlcy5ybShfbWlycm9yLCAnZ3UtdHJhbnNpdCcpO1xuICAgIGNsYXNzZXMuYWRkKF9taXJyb3IsICdndS1taXJyb3InKTtcbiAgICBvLm1pcnJvckNvbnRhaW5lci5hcHBlbmRDaGlsZChfbWlycm9yKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAnYWRkJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgIGNsYXNzZXMuYWRkKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX21pcnJvciwgX2l0ZW0sICdtaXJyb3InKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgY2xhc3Nlcy5ybShvLm1pcnJvckNvbnRhaW5lciwgJ2d1LXVuc2VsZWN0YWJsZScpO1xuICAgICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgJ3JlbW92ZScsICdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICAgIGdldFBhcmVudChfbWlycm9yKS5yZW1vdmVDaGlsZChfbWlycm9yKTtcbiAgICAgIF9taXJyb3IgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltbWVkaWF0ZUNoaWxkIChkcm9wVGFyZ2V0LCB0YXJnZXQpIHtcbiAgICB2YXIgaW1tZWRpYXRlID0gdGFyZ2V0O1xuICAgIHdoaWxlIChpbW1lZGlhdGUgIT09IGRyb3BUYXJnZXQgJiYgZ2V0UGFyZW50KGltbWVkaWF0ZSkgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgIGltbWVkaWF0ZSA9IGdldFBhcmVudChpbW1lZGlhdGUpO1xuICAgIH1cbiAgICBpZiAoaW1tZWRpYXRlID09PSBkb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gaW1tZWRpYXRlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlIChkcm9wVGFyZ2V0LCB0YXJnZXQsIHgsIHkpIHtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IG8uZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCc7XG4gICAgdmFyIHJlZmVyZW5jZSA9IHRhcmdldCAhPT0gZHJvcFRhcmdldCA/IGluc2lkZSgpIDogb3V0c2lkZSgpO1xuICAgIHJldHVybiByZWZlcmVuY2U7XG5cbiAgICBmdW5jdGlvbiBvdXRzaWRlICgpIHsgLy8gc2xvd2VyLCBidXQgYWJsZSB0byBmaWd1cmUgb3V0IGFueSBwb3NpdGlvblxuICAgICAgdmFyIGxlbiA9IGRyb3BUYXJnZXQuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgZWw7XG4gICAgICB2YXIgcmVjdDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBlbCA9IGRyb3BUYXJnZXQuY2hpbGRyZW5baV07XG4gICAgICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGhvcml6b250YWwgJiYgcmVjdC5sZWZ0ID4geCkgeyByZXR1cm4gZWw7IH1cbiAgICAgICAgaWYgKCFob3Jpem9udGFsICYmIHJlY3QudG9wID4geSkgeyByZXR1cm4gZWw7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoKSB7IC8vIGZhc3RlciwgYnV0IG9ubHkgYXZhaWxhYmxlIGlmIGRyb3BwZWQgaW5zaWRlIGEgY2hpbGQgZWxlbWVudFxuICAgICAgdmFyIHJlY3QgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAoaG9yaXpvbnRhbCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh4ID4gcmVjdC5sZWZ0ICsgZ2V0UmVjdFdpZHRoKHJlY3QpIC8gMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh5ID4gcmVjdC50b3AgKyBnZXRSZWN0SGVpZ2h0KHJlY3QpIC8gMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZSAoYWZ0ZXIpIHtcbiAgICAgIHJldHVybiBhZnRlciA/IG5leHRFbCh0YXJnZXQpIDogdGFyZ2V0O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ29weSAoaXRlbSwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvLmNvcHkgPT09ICdib29sZWFuJyA/IG8uY29weSA6IG8uY29weShpdGVtLCBjb250YWluZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvdWNoeSAoZWwsIG9wLCB0eXBlLCBmbikge1xuICB2YXIgdG91Y2ggPSB7XG4gICAgbW91c2V1cDogJ3RvdWNoZW5kJyxcbiAgICBtb3VzZWRvd246ICd0b3VjaHN0YXJ0JyxcbiAgICBtb3VzZW1vdmU6ICd0b3VjaG1vdmUnXG4gIH07XG4gIHZhciBwb2ludGVycyA9IHtcbiAgICBtb3VzZXVwOiAncG9pbnRlcnVwJyxcbiAgICBtb3VzZWRvd246ICdwb2ludGVyZG93bicsXG4gICAgbW91c2Vtb3ZlOiAncG9pbnRlcm1vdmUnXG4gIH07XG4gIHZhciBtaWNyb3NvZnQgPSB7XG4gICAgbW91c2V1cDogJ01TUG9pbnRlclVwJyxcbiAgICBtb3VzZWRvd246ICdNU1BvaW50ZXJEb3duJyxcbiAgICBtb3VzZW1vdmU6ICdNU1BvaW50ZXJNb3ZlJ1xuICB9O1xuICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHBvaW50ZXJzW3R5cGVdLCBmbik7XG4gIH0gZWxzZSBpZiAoZ2xvYmFsLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgbWljcm9zb2Z0W3R5cGVdLCBmbik7XG4gIH0gZWxzZSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgdG91Y2hbdHlwZV0sIGZuKTtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0eXBlLCBmbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2hpY2hNb3VzZUJ1dHRvbiAoZSkge1xuICBpZiAoZS50b3VjaGVzICE9PSB2b2lkIDApIHsgcmV0dXJuIGUudG91Y2hlcy5sZW5ndGg7IH1cbiAgaWYgKGUuYnV0dG9ucyAhPT0gdm9pZCAwKSB7IHJldHVybiBlLmJ1dHRvbnM7IH1cbiAgaWYgKGUud2hpY2ggIT09IHZvaWQgMCkgeyByZXR1cm4gZS53aGljaDsgfVxuICB2YXIgYnV0dG9uID0gZS5idXR0b247XG4gIGlmIChidXR0b24gIT09IHZvaWQgMCkgeyAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvYmxvYi85OWU4ZmYxYmFhN2FlMzQxZTk0YmI4OWMzZTg0NTcwYzdjM2FkOWVhL3NyYy9ldmVudC5qcyNMNTczLUw1NzVcbiAgICByZXR1cm4gYnV0dG9uICYgMSA/IDEgOiBidXR0b24gJiAyID8gMyA6IChidXR0b24gJiA0ID8gMiA6IDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldCAoZWwpIHtcbiAgdmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICBsZWZ0OiByZWN0LmxlZnQgKyBnZXRTY3JvbGwoJ3Njcm9sbExlZnQnLCAncGFnZVhPZmZzZXQnKSxcbiAgICB0b3A6IHJlY3QudG9wICsgZ2V0U2Nyb2xsKCdzY3JvbGxUb3AnLCAncGFnZVlPZmZzZXQnKVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRTY3JvbGwgKHNjcm9sbFByb3AsIG9mZnNldFByb3ApIHtcbiAgaWYgKHR5cGVvZiBnbG9iYWxbb2Zmc2V0UHJvcF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGdsb2JhbFtvZmZzZXRQcm9wXTtcbiAgfVxuICBpZiAoZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnRbc2Nyb2xsUHJvcF07XG4gIH1cbiAgcmV0dXJuIGRvYy5ib2R5W3Njcm9sbFByb3BdO1xufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50QmVoaW5kUG9pbnQgKHBvaW50LCB4LCB5KSB7XG4gIHZhciBwID0gcG9pbnQgfHwge307XG4gIHZhciBzdGF0ZSA9IHAuY2xhc3NOYW1lO1xuICB2YXIgZWw7XG4gIHAuY2xhc3NOYW1lICs9ICcgZ3UtaGlkZSc7XG4gIGVsID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gIHAuY2xhc3NOYW1lID0gc3RhdGU7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gbmV2ZXIgKCkgeyByZXR1cm4gZmFsc2U7IH1cbmZ1bmN0aW9uIGFsd2F5cyAoKSB7IHJldHVybiB0cnVlOyB9XG5mdW5jdGlvbiBnZXRSZWN0V2lkdGggKHJlY3QpIHsgcmV0dXJuIHJlY3Qud2lkdGggfHwgKHJlY3QucmlnaHQgLSByZWN0LmxlZnQpOyB9XG5mdW5jdGlvbiBnZXRSZWN0SGVpZ2h0IChyZWN0KSB7IHJldHVybiByZWN0LmhlaWdodCB8fCAocmVjdC5ib3R0b20gLSByZWN0LnRvcCk7IH1cbmZ1bmN0aW9uIGdldFBhcmVudCAoZWwpIHsgcmV0dXJuIGVsLnBhcmVudE5vZGUgPT09IGRvYyA/IG51bGwgOiBlbC5wYXJlbnROb2RlOyB9XG5mdW5jdGlvbiBpc0lucHV0IChlbCkgeyByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbC50YWdOYW1lID09PSAnVEVYVEFSRUEnIHx8IGVsLnRhZ05hbWUgPT09ICdTRUxFQ1QnIHx8IGlzRWRpdGFibGUoZWwpOyB9XG5mdW5jdGlvbiBpc0VkaXRhYmxlIChlbCkge1xuICBpZiAoIWVsKSB7IHJldHVybiBmYWxzZTsgfSAvLyBubyBwYXJlbnRzIHdlcmUgZWRpdGFibGVcbiAgaWYgKGVsLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ2ZhbHNlJykgeyByZXR1cm4gZmFsc2U7IH0gLy8gc3RvcCB0aGUgbG9va3VwXG4gIGlmIChlbC5jb250ZW50RWRpdGFibGUgPT09ICd0cnVlJykgeyByZXR1cm4gdHJ1ZTsgfSAvLyBmb3VuZCBhIGNvbnRlbnRFZGl0YWJsZSBlbGVtZW50IGluIHRoZSBjaGFpblxuICByZXR1cm4gaXNFZGl0YWJsZShnZXRQYXJlbnQoZWwpKTsgLy8gY29udGVudEVkaXRhYmxlIGlzIHNldCB0byAnaW5oZXJpdCdcbn1cblxuZnVuY3Rpb24gbmV4dEVsIChlbCkge1xuICByZXR1cm4gZWwubmV4dEVsZW1lbnRTaWJsaW5nIHx8IG1hbnVhbGx5KCk7XG4gIGZ1bmN0aW9uIG1hbnVhbGx5ICgpIHtcbiAgICB2YXIgc2libGluZyA9IGVsO1xuICAgIGRvIHtcbiAgICAgIHNpYmxpbmcgPSBzaWJsaW5nLm5leHRTaWJsaW5nO1xuICAgIH0gd2hpbGUgKHNpYmxpbmcgJiYgc2libGluZy5ub2RlVHlwZSAhPT0gMSk7XG4gICAgcmV0dXJuIHNpYmxpbmc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRIb3N0IChlKSB7XG4gIC8vIG9uIHRvdWNoZW5kIGV2ZW50LCB3ZSBoYXZlIHRvIHVzZSBgZS5jaGFuZ2VkVG91Y2hlc2BcbiAgLy8gc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzE5MjU2My90b3VjaGVuZC1ldmVudC1wcm9wZXJ0aWVzXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV2YWNxdWEvZHJhZ3VsYS9pc3N1ZXMvMzRcbiAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGUudGFyZ2V0VG91Y2hlc1swXTtcbiAgfVxuICBpZiAoZS5jaGFuZ2VkVG91Y2hlcyAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCkge1xuICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuICB9XG4gIHJldHVybiBlO1xufVxuXG5mdW5jdGlvbiBnZXRDb29yZCAoY29vcmQsIGUpIHtcbiAgdmFyIGhvc3QgPSBnZXRFdmVudEhvc3QoZSk7XG4gIHZhciBtaXNzTWFwID0ge1xuICAgIHBhZ2VYOiAnY2xpZW50WCcsIC8vIElFOFxuICAgIHBhZ2VZOiAnY2xpZW50WScgLy8gSUU4XG4gIH07XG4gIGlmIChjb29yZCBpbiBtaXNzTWFwICYmICEoY29vcmQgaW4gaG9zdCkgJiYgbWlzc01hcFtjb29yZF0gaW4gaG9zdCkge1xuICAgIGNvb3JkID0gbWlzc01hcFtjb29yZF07XG4gIH1cbiAgcmV0dXJuIGhvc3RbY29vcmRdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRyYWd1bGE7XG4iLCIvKlxuICogbm90aWUuanMgLSBBIGNsZWFuIGFuZCBzaW1wbGUgbm90aWZpY2F0aW9uIHBsdWdpbiAoYWxlcnQvZ3Jvd2wgc3R5bGUpIGZvciBqYXZhc2NyaXB0LCB3aXRoIG5vIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgSmFyZWQgUmVpY2hcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIFByb2plY3QgaG9tZTpcbiAqIGh0dHBzOi8vamFyZWRyZWljaC5jb20vcHJvamVjdHMvbm90aWUuanNcbiAqXG4gKiBWZXJzaW9uOiAgMi4xLjBcbiAqXG4qL1xuXG52YXIgbm90aWUgPSBmdW5jdGlvbigpe1xuXG4gICAgLy8gU0VUVElOR1NcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBcbiAgICAvLyBHZW5lcmFsXG4gICAgdmFyIHNoYWRvdyA9IHRydWU7XG4gICAgdmFyIGZvbnRfc2l6ZV9zbWFsbCA9ICcxOHB4JztcbiAgICB2YXIgZm9udF9zaXplX2JpZyA9ICcyNHB4JztcbiAgICB2YXIgZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoID0gNjAwO1xuICAgIHZhciBhbmltYXRpb25fZGVsYXkgPSAwLjM7XG4gICAgdmFyIGJhY2tncm91bmRfY2xpY2tfZGlzbWlzcyA9IHRydWU7XG4gICAgXG4gICAgLy8gbm90aWUuYWxlcnQgY29sb3JzXG4gICAgdmFyIGFsZXJ0X2NvbG9yX3N1Y2Nlc3NfYmFja2dyb3VuZCA9ICcjNTdCRjU3JztcbiAgICB2YXIgYWxlcnRfY29sb3Jfd2FybmluZ19iYWNrZ3JvdW5kID0gJyNFM0I3NzEnO1xuICAgIHZhciBhbGVydF9jb2xvcl9lcnJvcl9iYWNrZ3JvdW5kID0gJyNFMTcxNUInO1xuICAgIHZhciBhbGVydF9jb2xvcl9pbmZvX2JhY2tncm91bmQgPSAnIzREODJENic7XG4gICAgdmFyIGFsZXJ0X2NvbG9yX3RleHQgPSAnI0ZGRic7XG5cbiAgICAvLyBub3RpZS5jb25maXJtIGNvbG9yc1xuICAgIHZhciBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl9iYWNrZ3JvdW5kID0gJyM0RDgyRDYnO1xuICAgIHZhciBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl95ZXNfYmFja2dyb3VuZCA9ICcjNTdCRjU3JztcbiAgICB2YXIgY29uZmlybV9hbmRfaW5wdXRfY29sb3Jfbm9fYmFja2dyb3VuZCA9ICcjRTE3MTVCJztcbiAgICB2YXIgY29uZmlybV9hbmRfaW5wdXRfY29sb3JfdGV4dCA9ICcjRkZGJztcbiAgICB2YXIgY29uZmlybV9hbmRfaW5wdXRfY29sb3JfeWVzX3RleHQgPSAnI0ZGRic7XG4gICAgdmFyIGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX25vX3RleHQgPSAnI0ZGRic7XG4gICAgXG4gICAgLy8gSUQncyBmb3IgdXNlIHdpdGhpbiB5b3VyIG93biAuY3NzIGZpbGUgKE9QVElPTkFMKVxuICAgIC8vIChCZSBzdXJlIHRvIHVzZSAhaW1wb3J0YW50IHRvIG92ZXJyaWRlIHRoZSBqYXZhc2NyaXB0KVxuICAgIC8vIEV4YW1wbGU6ICNub3RpZS1hbGVydC1pbm5lciB7IHBhZGRpbmc6IDMwcHggIWltcG9ydGFudDsgfVxuICAgIHZhciBhbGVydF9vdXRlcl9pZCA9ICdub3RpZS1hbGVydC1vdXRlcic7XG4gICAgdmFyIGFsZXJ0X2lubmVyX2lkID0gJ25vdGllLWFsZXJ0LWlubmVyJztcbiAgICB2YXIgYWxlcnRfdGV4dF9pZCA9ICdub3RpZS1hbGVydC10ZXh0JztcbiAgICB2YXIgY29uZmlybV9vdXRlcl9pZCA9ICdub3RpZS1jb25maXJtLW91dGVyJztcbiAgICB2YXIgY29uZmlybV9pbm5lcl9pZCA9ICdub3RpZS1jb25maXJtLWlubmVyJztcbiAgICB2YXIgY29uZmlybV9iYWNrZ3JvdW5kX2lkID0gJ25vdGllLWNvbmZpcm0tYmFja2dyb3VuZCc7XG4gICAgdmFyIGNvbmZpcm1feWVzX2lkID0gJ25vdGllLWNvbmZpcm0teWVzJztcbiAgICB2YXIgY29uZmlybV9ub19pZCA9ICdub3RpZS1jb25maXJtLW5vJztcbiAgICB2YXIgY29uZmlybV90ZXh0X2lkID0gJ25vdGllLWNvbmZpcm0tdGV4dCc7XG4gICAgdmFyIGNvbmZpcm1feWVzX3RleHRfaWQgPSAnbm90aWUtY29uZmlybS15ZXMtdGV4dCc7XG4gICAgdmFyIGNvbmZpcm1fbm9fdGV4dF9pZCA9ICdub3RpZS1jb25maXJtLW5vLXRleHQnO1xuICAgIHZhciBpbnB1dF9vdXRlcl9pZCA9ICdub3RpZS1pbnB1dC1vdXRlcic7XG4gICAgdmFyIGlucHV0X2lubmVyX2lkID0gJ25vdGllLWlucHV0LWlubmVyJztcbiAgICB2YXIgaW5wdXRfYmFja2dyb3VuZF9pZCA9ICdub3RpZS1pbnB1dC1iYWNrZ3JvdW5kJztcbiAgICB2YXIgaW5wdXRfZGl2X2lkID0gJ25vdGllLWlucHV0LWRpdic7XG4gICAgdmFyIGlucHV0X2ZpZWxkX2lkID0gJ25vdGllLWlucHV0LWZpZWxkJztcbiAgICB2YXIgaW5wdXRfeWVzX2lkID0gJ25vdGllLWlucHV0LXllcyc7XG4gICAgdmFyIGlucHV0X25vX2lkID0gJ25vdGllLWlucHV0LW5vJztcbiAgICB2YXIgaW5wdXRfdGV4dF9pZCA9ICdub3RpZS1pbnB1dC10ZXh0JztcbiAgICB2YXIgaW5wdXRfeWVzX3RleHRfaWQgPSAnbm90aWUtaW5wdXQteWVzLXRleHQnO1xuICAgIHZhciBpbnB1dF9ub190ZXh0X2lkID0gJ25vdGllLWlucHV0LW5vLXRleHQnO1xuICAgIFxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIC8vIEhFTFBFUlNcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBcbiAgICAvLyBGdW5jdGlvbiBmb3IgcmVzaXplIGxpc3RlbmVycyBmb3IgZm9udC1zaXplXG4gICAgdmFyIHJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZWxlKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8PSBmb250X2NoYW5nZV9zY3JlZW5fd2lkdGgpIHsgZWxlLnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgICAgIGVsc2UgeyBlbGUuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvLyBEZWJvdW5jZSBmdW5jdGlvbiAoY3JlZGl0IHRvIFVuZGVyc2NvcmUuanMpXG4gICAgdmFyIGRlYm91bmNlX3RpbWUgPSA1MDA7XG4gICAgdmFyIGRlYm91bmNlID0gZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgICAgIHZhciB0aW1lb3V0O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgICAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgZW50ZXIgYW5kIGVzY2FwZSBrZXlzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZW50ZXJfY2xpY2tlZCA9IChldmVudC53aGljaCA9PSAxMyB8fCBldmVudC5rZXlDb2RlID09IDEzKTtcbiAgICAgICAgdmFyIGVzY2FwZV9jbGlja2VkID0gKGV2ZW50LndoaWNoID09IDI3IHx8IGV2ZW50LmtleUNvZGUgPT0gMjcpO1xuICAgICAgICBpZiAoYWxlcnRfaXNfc2hvd2luZykge1xuICAgICAgICAgICAgaWYgKGVudGVyX2NsaWNrZWQgfHwgZXNjYXBlX2NsaWNrZWQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8xKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8yKTtcbiAgICAgICAgICAgICAgICBhbGVydF9oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29uZmlybV9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICBpZiAoZW50ZXJfY2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGNvbmZpcm1feWVzLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlc2NhcGVfY2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGNvbmZpcm1fbm8uY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dF9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICBpZiAoZW50ZXJfY2xpY2tlZCkge1xuICAgICAgICAgICAgICAgIGlucHV0X3llcy5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXNjYXBlX2NsaWNrZWQpIHtcbiAgICAgICAgICAgICAgICBpbnB1dF9uby5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgXG4gICAgLy8gYWRkRXZlbnRMaXN0ZW5lciBwb2x5ZmlsbCwgZml4ZXMgYSBzdHlsZS5oZWlnaHQgaXNzdWUgZm9yIElFOFxuICAgIGlmICh0eXBlb2YgRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IFdpbmRvdy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgZSA9ICdvbicgKyBlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoRXZlbnQoZSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgLy8gU2Nyb2xsIGRpc2FibGUgYW5kIGVuYWJsZSBmb3Igbm90aWUuY29uZmlybSBhbmQgbm90aWUuaW5wdXRcbiAgICB2YXIgb3JpZ2luYWxfYm9keV9oZWlnaHQsIG9yaWdpbmFsX2JvZHlfb3ZlcmZsb3c7XG4gICAgZnVuY3Rpb24gc2Nyb2xsX2Rpc2FibGUoKSB7XG4gICAgICAgIG9yaWdpbmFsX2JvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS5oZWlnaHQ7XG4gICAgICAgIG9yaWdpbmFsX2JvZHlfb3ZlcmZsb3cgPSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93O1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzY3JvbGxfZW5hYmxlKCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmhlaWdodCA9IG9yaWdpbmFsX2JvZHlfaGVpZ2h0O1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gb3JpZ2luYWxfYm9keV9vdmVyZmxvdztcbiAgICB9XG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgXG4gICAgXG4gICAgXG4gICAgLy8gTk9USUUuQUxFUlRcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgIC8vIG5vdGllIGVsZW1lbnRzIGFuZCBzdHlsaW5nXG4gICAgdmFyIGFsZXJ0X291dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYWxlcnRfb3V0ZXIuaWQgPSBhbGVydF9vdXRlcl9pZDtcbiAgICBhbGVydF9vdXRlci5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUudG9wID0gJzAnO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuekluZGV4ID0gJzk5OTk5OTk5OSc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnJztcbiAgICBhbGVydF9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgYWxlcnRfb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgIGFsZXJ0X291dGVyLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBcbiAgICAvLyBIaWRlIGFsZXJ0IG9uIGNsaWNrXG4gICAgYWxlcnRfb3V0ZXIub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8xKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGFsZXJ0X3RpbWVvdXRfMik7XG4gICAgICAgIGFsZXJ0X2hpZGUoKTtcbiAgICB9O1xuICAgIFxuICAgIHZhciBhbGVydF9pbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGFsZXJ0X2lubmVyLmlkID0gYWxlcnRfaW5uZXJfaWQ7XG4gICAgYWxlcnRfaW5uZXIuc3R5bGUucGFkZGluZyA9ICcyMHB4JztcbiAgICBhbGVydF9pbm5lci5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlLWNlbGwnO1xuICAgIGFsZXJ0X2lubmVyLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSAnbWlkZGxlJztcbiAgICBhbGVydF9vdXRlci5hcHBlbmRDaGlsZChhbGVydF9pbm5lcik7XG4gICAgXG4gICAgLy8gSW5pdGlhbGl6ZSBub3RpZSB0ZXh0XG4gICAgdmFyIGFsZXJ0X3RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYWxlcnRfdGV4dC5pZCA9IGFsZXJ0X3RleHRfaWQ7XG4gICAgYWxlcnRfdGV4dC5zdHlsZS5jb2xvciA9IGFsZXJ0X2NvbG9yX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBhbGVydF90ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGFsZXJ0X3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgYWxlcnRfdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBhbGVydF9pbm5lci5hcHBlbmRDaGlsZChhbGVydF90ZXh0KTtcblxuICAgIC8vIEF0dGFjaCBub3RpZSB0byB0aGUgYm9keSBlbGVtZW50XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhbGVydF9vdXRlcik7XG5cbiAgICAvLyBEZWNsYXJlIHZhcmlhYmxlc1xuICAgIHZhciBoZWlnaHQgPSAwO1xuICAgIHZhciBhbGVydF9pc19zaG93aW5nID0gZmFsc2U7XG4gICAgdmFyIGFsZXJ0X3RpbWVvdXRfMTtcbiAgICB2YXIgYWxlcnRfdGltZW91dF8yO1xuICAgIHZhciB3YXNfY2xpY2tlZF9jb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGFsZXJ0KHR5cGUsIG1lc3NhZ2UsIHNlY29uZHMpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIEJsdXIgYWN0aXZlIGVsZW1lbnQgZm9yIHVzZSBvZiBlbnRlciBrZXksIGZvY3VzIGlucHV0XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuXG4gICAgICAgIHdhc19jbGlja2VkX2NvdW50ZXIrKztcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgd2FzX2NsaWNrZWRfY291bnRlci0tO1xuICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG5cbiAgICAgICAgaWYgKHdhc19jbGlja2VkX2NvdW50ZXIgPT0gMSkge1xuXG4gICAgICAgICAgICBpZiAoYWxlcnRfaXNfc2hvd2luZykge1xuXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFsZXJ0X3RpbWVvdXRfMSk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFsZXJ0X3RpbWVvdXRfMik7XG5cbiAgICAgICAgICAgICAgICBhbGVydF9oaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBhbGVydF9zaG93KHR5cGUsIG1lc3NhZ2UsIHNlY29uZHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbGVydF9zaG93KHR5cGUsIG1lc3NhZ2UsIHNlY29uZHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsZXJ0X3Nob3codHlwZSwgbWVzc2FnZSwgc2Vjb25kcykge1xuXG4gICAgICAgIGFsZXJ0X2lzX3Nob3dpbmcgPSB0cnVlO1xuXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IDA7XG4gICAgICAgIGlmICh0eXBlb2Ygc2Vjb25kcyA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gMzAwMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzZWNvbmRzIDwgMSkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSAxMDAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZHVyYXRpb24gPSBzZWNvbmRzICogMTAwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBub3RpZSB0eXBlIChiYWNrZ3JvdW5kIGNvbG9yKVxuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFsZXJ0X2NvbG9yX3N1Y2Nlc3NfYmFja2dyb3VuZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhbGVydF9jb2xvcl93YXJuaW5nX2JhY2tncm91bmQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYWxlcnRfY29sb3JfZXJyb3JfYmFja2dyb3VuZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhbGVydF9jb2xvcl9pbmZvX2JhY2tncm91bmQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgbm90aWUgdGV4dFxuICAgICAgICBhbGVydF90ZXh0LmlubmVySFRNTCA9IG1lc3NhZ2U7XG5cbiAgICAgICAgLy8gR2V0IG5vdGllJ3MgaGVpZ2h0XG4gICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG4gICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgICAgICBhbGVydF9vdXRlci5zdHlsZS50b3AgPSAnLScgKyBhbGVydF9vdXRlci5vZmZzZXRIZWlnaHQgLSA1ICsgJ3B4JztcblxuICAgICAgICBhbGVydF90aW1lb3V0XzEgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoc2hhZG93KSB7IGFsZXJ0X291dGVyLnN0eWxlLmJveFNoYWRvdyA9ICcwcHggMHB4IDEwcHggMHB4IHJnYmEoMCwwLDAsMC41KSc7IH1cbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcblxuICAgICAgICAgICAgYWxlcnRfb3V0ZXIuc3R5bGUudG9wID0gMDtcblxuICAgICAgICAgICAgYWxlcnRfdGltZW91dF8yID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGFsZXJ0X2hpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGhpbmdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSwgZHVyYXRpb24pO1xuXG4gICAgICAgIH0sIDIwKTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsZXJ0X2hpZGUoY2FsbGJhY2spIHtcblxuICAgICAgICBhbGVydF9vdXRlci5zdHlsZS50b3AgPSAnLScgKyBhbGVydF9vdXRlci5vZmZzZXRIZWlnaHQgLSA1ICsgJ3B4JztcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoc2hhZG93KSB7IGFsZXJ0X291dGVyLnN0eWxlLmJveFNoYWRvdyA9ICcnOyB9XG4gICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBhbGVydF9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFsZXJ0X291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG5cbiAgICAgICAgICAgIGFsZXJ0X2lzX3Nob3dpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7IGNhbGxiYWNrKCk7IH1cblxuICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG5cbiAgICB9XG5cblxuXG4gICAgLy8gTk9USUUuQ09ORklSTVxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgLy8gY29uZmlybSBlbGVtZW50cyBhbmQgc3R5bGluZ1xuICAgIHZhciBjb25maXJtX291dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uZmlybV9vdXRlci5pZCA9IGNvbmZpcm1fb3V0ZXJfaWQ7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS50b3AgPSAnMCc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuekluZGV4ID0gJzk5OTk5OTk5OCc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgY29uZmlybV9vdXRlci5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLldlYmtpdFRyYW5zaXRpb24gPSAnJztcbiAgICBjb25maXJtX291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcblxuICAgIHZhciBjb25maXJtX2JhY2tncm91bmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25maXJtX2JhY2tncm91bmQuaWQgPSBjb25maXJtX2JhY2tncm91bmRfaWQ7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUudG9wID0gJzAnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS56SW5kZXggPSAnOTk5OTk5OTk3JztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLnRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICBcbiAgICAvLyBIaWRlIG5vdGllLmNvbmZpcm0gb24gYmFja2dyb3VuZCBjbGlja1xuICAgIGNvbmZpcm1fYmFja2dyb3VuZC5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChiYWNrZ3JvdW5kX2NsaWNrX2Rpc21pc3MpIHtcbiAgICAgICAgICAgIGNvbmZpcm1faGlkZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjb25maXJtX2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uZmlybV9pbm5lci5pZCA9IGNvbmZpcm1faW5uZXJfaWQ7XG4gICAgY29uZmlybV9pbm5lci5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgY29uZmlybV9pbm5lci5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLnBhZGRpbmcgPSAnMjBweCc7XG4gICAgY29uZmlybV9pbm5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgICBjb25maXJtX2lubmVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX2JhY2tncm91bmQ7XG4gICAgY29uZmlybV9vdXRlci5hcHBlbmRDaGlsZChjb25maXJtX2lubmVyKTtcblxuICAgIHZhciBjb25maXJtX3llcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbmZpcm1feWVzLmlkID0gY29uZmlybV95ZXNfaWQ7XG4gICAgY29uZmlybV95ZXMuc3R5bGUuY3NzRmxvYXQgPSAnbGVmdCc7XG4gICAgY29uZmlybV95ZXMuc3R5bGUuaGVpZ2h0ID0gJzUwcHgnO1xuICAgIGNvbmZpcm1feWVzLnN0eWxlLmxpbmVIZWlnaHQgPSAnNTBweCc7XG4gICAgY29uZmlybV95ZXMuc3R5bGUud2lkdGggPSAnNTAlJztcbiAgICBjb25maXJtX3llcy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgY29uZmlybV95ZXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfeWVzX2JhY2tncm91bmQ7XG4gICAgY29uZmlybV9vdXRlci5hcHBlbmRDaGlsZChjb25maXJtX3llcyk7XG5cbiAgICB2YXIgY29uZmlybV9ubyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbmZpcm1fbm8uaWQgPSBjb25maXJtX25vX2lkO1xuICAgIGNvbmZpcm1fbm8uc3R5bGUuY3NzRmxvYXQgPSAncmlnaHQnO1xuICAgIGNvbmZpcm1fbm8uc3R5bGUuaGVpZ2h0ID0gJzUwcHgnO1xuICAgIGNvbmZpcm1fbm8uc3R5bGUubGluZUhlaWdodCA9ICc1MHB4JztcbiAgICBjb25maXJtX25vLnN0eWxlLndpZHRoID0gJzUwJSc7XG4gICAgY29uZmlybV9uby5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgY29uZmlybV9uby5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl9ub19iYWNrZ3JvdW5kO1xuICAgIGNvbmZpcm1fbm8ub25jbGljayA9IGZ1bmN0aW9uKCkgeyBjb25maXJtX2hpZGUoKTsgfVxuICAgIGNvbmZpcm1fb3V0ZXIuYXBwZW5kQ2hpbGQoY29uZmlybV9ubyk7XG5cbiAgICAvLyBJbml0aWFsaXplIGNvbmZpcm0gdGV4dFxuICAgIHZhciBjb25maXJtX3RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgY29uZmlybV90ZXh0LmlkID0gY29uZmlybV90ZXh0X2lkO1xuICAgIGNvbmZpcm1fdGV4dC5zdHlsZS5jb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBjb25maXJtX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgY29uZmlybV90ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX2JpZzsgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZShyZXNpemVMaXN0ZW5lci5iaW5kKG51bGwsIGNvbmZpcm1fdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBjb25maXJtX2lubmVyLmFwcGVuZENoaWxkKGNvbmZpcm1fdGV4dCk7XG5cbiAgICB2YXIgY29uZmlybV95ZXNfdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25maXJtX3llc190ZXh0LmlkID0gY29uZmlybV95ZXNfdGV4dF9pZDtcbiAgICBjb25maXJtX3llc190ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfeWVzX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBjb25maXJtX3llc190ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGNvbmZpcm1feWVzX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgY29uZmlybV95ZXNfdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBjb25maXJtX3llcy5hcHBlbmRDaGlsZChjb25maXJtX3llc190ZXh0KTtcblxuICAgIHZhciBjb25maXJtX25vX3RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgY29uZmlybV9ub190ZXh0LmlkID0gY29uZmlybV9ub190ZXh0X2lkO1xuICAgIGNvbmZpcm1fbm9fdGV4dC5zdHlsZS5jb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX25vX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBjb25maXJtX25vX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfc21hbGw7IH1cbiAgICBlbHNlIHsgY29uZmlybV9ub190ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX2JpZzsgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZShyZXNpemVMaXN0ZW5lci5iaW5kKG51bGwsIGNvbmZpcm1fbm9fdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBjb25maXJtX25vLmFwcGVuZENoaWxkKGNvbmZpcm1fbm9fdGV4dCk7XG5cbiAgICAvLyBBdHRhY2ggY29uZmlybSBlbGVtZW50cyB0byB0aGUgYm9keSBlbGVtZW50XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb25maXJtX291dGVyKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbmZpcm1fYmFja2dyb3VuZCk7XG5cbiAgICAvLyBEZWNsYXJlIHZhcmlhYmxlc1xuICAgIHZhciBjb25maXJtX2hlaWdodCA9IDA7XG4gICAgdmFyIGNvbmZpcm1faXNfc2hvd2luZyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gY29uZmlybSh0aXRsZSwgeWVzX3RleHQsIG5vX3RleHQsIHllc19jYWxsYmFjaykge1xuICAgICAgICBcbiAgICAgICAgLy8gQmx1ciBhY3RpdmUgZWxlbWVudCBmb3IgdXNlIG9mIGVudGVyIGtleVxuICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChhbGVydF9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICAvLyBIaWRlIG5vdGllLmFsZXJ0XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8xKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzIpO1xuICAgICAgICAgICAgYWxlcnRfaGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25maXJtX3Nob3codGl0bGUsIHllc190ZXh0LCBub190ZXh0LCB5ZXNfY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25maXJtX3Nob3codGl0bGUsIHllc190ZXh0LCBub190ZXh0LCB5ZXNfY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbmZpcm1fc2hvdyh0aXRsZSwgeWVzX3RleHQsIG5vX3RleHQsIHllc19jYWxsYmFjaykge1xuXG4gICAgICAgIHNjcm9sbF9kaXNhYmxlKCk7XG5cbiAgICAgICAgLy8gWWVzIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgIGNvbmZpcm1feWVzLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbmZpcm1faGlkZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB5ZXNfY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNvbmZpcm1fc2hvd19pbm5lcigpIHtcblxuICAgICAgICAgICAgLy8gU2V0IGNvbmZpcm0gdGV4dFxuICAgICAgICAgICAgY29uZmlybV90ZXh0LmlubmVySFRNTCA9IHRpdGxlO1xuICAgICAgICAgICAgY29uZmlybV95ZXNfdGV4dC5pbm5lckhUTUwgPSB5ZXNfdGV4dDtcbiAgICAgICAgICAgIGNvbmZpcm1fbm9fdGV4dC5pbm5lckhUTUwgPSBub190ZXh0O1xuXG4gICAgICAgICAgICAvLyBHZXQgY29uZmlybSdzIGhlaWdodFxuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50b3AgPSAnLTEwMDAwcHgnO1xuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlJztcbiAgICAgICAgICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUudG9wID0gJy0nICsgY29uZmlybV9vdXRlci5vZmZzZXRIZWlnaHQgLSA1ICsgJ3B4JztcbiAgICAgICAgICAgIGNvbmZpcm1fYmFja2dyb3VuZC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFkb3cpIHsgY29uZmlybV9vdXRlci5zdHlsZS5ib3hTaGFkb3cgPSAnMHB4IDBweCAxMHB4IDBweCByZ2JhKDAsMCwwLDAuNSknOyB9XG4gICAgICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG5cbiAgICAgICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLnRvcCA9IDA7XG4gICAgICAgICAgICAgICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLm9wYWNpdHkgPSAnMC43NSc7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25maXJtX2lzX3Nob3dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgICAgICAgICAgfSwgMjApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlybV9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICBjb25maXJtX2hpZGUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uZmlybV9zaG93X2lubmVyKCk7XG4gICAgICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25maXJtX3Nob3dfaW5uZXIoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlybV9oaWRlKCkge1xuXG4gICAgICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUudG9wID0gJy0nICsgY29uZmlybV9vdXRlci5vZmZzZXRIZWlnaHQgLSA1ICsgJ3B4JztcbiAgICAgICAgY29uZmlybV9iYWNrZ3JvdW5kLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKHNoYWRvdykgeyBjb25maXJtX291dGVyLnN0eWxlLmJveFNoYWRvdyA9ICcnOyB9XG4gICAgICAgICAgICBjb25maXJtX291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnJztcbiAgICAgICAgICAgIGNvbmZpcm1fb3V0ZXIuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgICAgICAgICBjb25maXJtX2JhY2tncm91bmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uZmlybV9vdXRlci5zdHlsZS50b3AgPSAnLTEwMDAwcHgnO1xuXG4gICAgICAgICAgICBzY3JvbGxfZW5hYmxlKCk7XG5cbiAgICAgICAgICAgIGNvbmZpcm1faXNfc2hvd2luZyA9IGZhbHNlO1xuXG4gICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcblxuICAgIH1cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICAvLyBOT1RJRS5JTlBVVFxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgLy8gaW5wdXQgZWxlbWVudHMgYW5kIHN0eWxpbmdcbiAgICB2YXIgaW5wdXRfb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dF9vdXRlci5pZCA9IGlucHV0X291dGVyX2lkO1xuICAgIGlucHV0X291dGVyLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS50b3AgPSAnMCc7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUubGVmdCA9ICcwJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS56SW5kZXggPSAnOTk5OTk5OTk4JztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBpbnB1dF9vdXRlci5zdHlsZS5Nb3pUcmFuc2l0aW9uID0gJyc7XG4gICAgaW5wdXRfb3V0ZXIuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgIGlucHV0X291dGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcblxuICAgIHZhciBpbnB1dF9iYWNrZ3JvdW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5pZCA9IGlucHV0X2JhY2tncm91bmRfaWQ7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS50b3AgPSAnMCc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUuekluZGV4ID0gJzk5OTk5OTk5Nyc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUudHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuICAgIGlucHV0X2JhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgICBcbiAgICAvLyBIaWRlIG5vdGllLmlucHV0IG9uIGJhY2tncm91bmQgY2xpY2tcbiAgICBpbnB1dF9iYWNrZ3JvdW5kLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGJhY2tncm91bmRfY2xpY2tfZGlzbWlzcykge1xuICAgICAgICAgICAgaW5wdXRfaGlkZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBpbnB1dF9pbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlucHV0X2lubmVyLmlkID0gaW5wdXRfaW5uZXJfaWQ7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIGlucHV0X2lubmVyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGlucHV0X2lubmVyLnN0eWxlLnBhZGRpbmcgPSAnMjBweCc7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgaW5wdXRfaW5uZXIuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIGlucHV0X2lubmVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX2JhY2tncm91bmQ7XG4gICAgaW5wdXRfb3V0ZXIuYXBwZW5kQ2hpbGQoaW5wdXRfaW5uZXIpO1xuICAgIFxuICAgIHZhciBpbnB1dF9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dF9kaXYuaWQgPSBpbnB1dF9kaXZfaWQ7XG4gICAgaW5wdXRfZGl2LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICBpbnB1dF9kaXYuc3R5bGUuaGVpZ2h0ID0gJzU1cHgnO1xuICAgIGlucHV0X2Rpdi5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBpbnB1dF9kaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgaW5wdXRfZGl2LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgICBpbnB1dF9kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNGRkYnO1xuICAgIGlucHV0X291dGVyLmFwcGVuZENoaWxkKGlucHV0X2Rpdik7XG4gICAgXG4gICAgdmFyIGlucHV0X2ZpZWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBpbnB1dF9maWVsZC5pZCA9IGlucHV0X2ZpZWxkX2lkOyAgICBcbiAgICBpbnB1dF9maWVsZC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcbiAgICBpbnB1dF9maWVsZC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb3JyZWN0JywgJ29mZicpO1xuICAgIGlucHV0X2ZpZWxkLnNldEF0dHJpYnV0ZSgnYXV0b2NhcGl0YWxpemUnLCAnb2ZmJyk7XG4gICAgaW5wdXRfZmllbGQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgaW5wdXRfZmllbGQuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLmhlaWdodCA9ICc1NXB4JztcbiAgICBpbnB1dF9maWVsZC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICBpbnB1dF9maWVsZC5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBpbnB1dF9maWVsZC5zdHlsZS50ZXh0SW5kZW50ID0gJzEwcHgnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLnBhZGRpbmdSaWdodCA9ICcxMHB4JztcbiAgICBpbnB1dF9maWVsZC5zdHlsZS5vdXRsaW5lID0gJzAnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLmJvcmRlciA9ICcwJztcbiAgICBpbnB1dF9maWVsZC5zdHlsZS5mb250RmFtaWx5ID0gJ2luaGVyaXQnO1xuICAgIGlucHV0X2ZpZWxkLnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX2JpZztcbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gZm9udF9jaGFuZ2Vfc2NyZWVuX3dpZHRoKSB7IGlucHV0X2ZpZWxkLnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGlucHV0X2ZpZWxkLnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX2JpZzsgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZShyZXNpemVMaXN0ZW5lci5iaW5kKG51bGwsIGlucHV0X2ZpZWxkKSwgZGVib3VuY2VfdGltZSksIHRydWUpO1xuICAgIGlucHV0X2Rpdi5hcHBlbmRDaGlsZChpbnB1dF9maWVsZCk7XG5cbiAgICB2YXIgaW5wdXRfeWVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5wdXRfeWVzLmlkID0gaW5wdXRfeWVzX2lkO1xuICAgIGlucHV0X3llcy5zdHlsZS5jc3NGbG9hdCA9ICdsZWZ0JztcbiAgICBpbnB1dF95ZXMuc3R5bGUuaGVpZ2h0ID0gJzUwcHgnO1xuICAgIGlucHV0X3llcy5zdHlsZS5saW5lSGVpZ2h0ID0gJzUwcHgnO1xuICAgIGlucHV0X3llcy5zdHlsZS53aWR0aCA9ICc1MCUnO1xuICAgIGlucHV0X3llcy5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgaW5wdXRfeWVzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX3llc19iYWNrZ3JvdW5kO1xuICAgIGlucHV0X291dGVyLmFwcGVuZENoaWxkKGlucHV0X3llcyk7XG5cbiAgICB2YXIgaW5wdXRfbm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbnB1dF9uby5pZCA9IGlucHV0X25vX2lkO1xuICAgIGlucHV0X25vLnN0eWxlLmNzc0Zsb2F0ID0gJ3JpZ2h0JztcbiAgICBpbnB1dF9uby5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgaW5wdXRfbm8uc3R5bGUubGluZUhlaWdodCA9ICc1MHB4JztcbiAgICBpbnB1dF9uby5zdHlsZS53aWR0aCA9ICc1MCUnO1xuICAgIGlucHV0X25vLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICBpbnB1dF9uby5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maXJtX2FuZF9pbnB1dF9jb2xvcl9ub19iYWNrZ3JvdW5kO1xuICAgIGlucHV0X25vLm9uY2xpY2sgPSBmdW5jdGlvbigpIHsgaW5wdXRfaGlkZSgpOyB9XG4gICAgaW5wdXRfb3V0ZXIuYXBwZW5kQ2hpbGQoaW5wdXRfbm8pO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBpbnB1dCB0ZXh0XG4gICAgdmFyIGlucHV0X3RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgaW5wdXRfdGV4dC5pZCA9IGlucHV0X3RleHRfaWQ7XG4gICAgaW5wdXRfdGV4dC5zdHlsZS5jb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBpbnB1dF90ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGlucHV0X3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgaW5wdXRfdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBpbnB1dF9pbm5lci5hcHBlbmRDaGlsZChpbnB1dF90ZXh0KTtcblxuICAgIHZhciBpbnB1dF95ZXNfdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBpbnB1dF95ZXNfdGV4dC5pZCA9IGlucHV0X3llc190ZXh0X2lkO1xuICAgIGlucHV0X3llc190ZXh0LnN0eWxlLmNvbG9yID0gY29uZmlybV9hbmRfaW5wdXRfY29sb3JfeWVzX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBpbnB1dF95ZXNfdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9zbWFsbDsgfVxuICAgIGVsc2UgeyBpbnB1dF95ZXNfdGV4dC5zdHlsZS5mb250U2l6ZSA9IGZvbnRfc2l6ZV9iaWc7IH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UocmVzaXplTGlzdGVuZXIuYmluZChudWxsLCBpbnB1dF95ZXNfdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBpbnB1dF95ZXMuYXBwZW5kQ2hpbGQoaW5wdXRfeWVzX3RleHQpO1xuXG4gICAgdmFyIGlucHV0X25vX3RleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgaW5wdXRfbm9fdGV4dC5pZCA9IGlucHV0X25vX3RleHRfaWQ7XG4gICAgaW5wdXRfbm9fdGV4dC5zdHlsZS5jb2xvciA9IGNvbmZpcm1fYW5kX2lucHV0X2NvbG9yX25vX3RleHQ7XG4gICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IGZvbnRfY2hhbmdlX3NjcmVlbl93aWR0aCkgeyBpbnB1dF9ub190ZXh0LnN0eWxlLmZvbnRTaXplID0gZm9udF9zaXplX3NtYWxsOyB9XG4gICAgZWxzZSB7IGlucHV0X25vX3RleHQuc3R5bGUuZm9udFNpemUgPSBmb250X3NpemVfYmlnOyB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHJlc2l6ZUxpc3RlbmVyLmJpbmQobnVsbCwgaW5wdXRfbm9fdGV4dCksIGRlYm91bmNlX3RpbWUpLCB0cnVlKTtcbiAgICBpbnB1dF9uby5hcHBlbmRDaGlsZChpbnB1dF9ub190ZXh0KTtcblxuICAgIC8vIEF0dGFjaCBpbnB1dCBlbGVtZW50cyB0byB0aGUgYm9keSBlbGVtZW50XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbnB1dF9vdXRlcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbnB1dF9iYWNrZ3JvdW5kKTtcblxuICAgIC8vIERlY2xhcmUgdmFyaWFibGVzXG4gICAgdmFyIGlucHV0X2hlaWdodCA9IDA7XG4gICAgdmFyIGlucHV0X2lzX3Nob3dpbmcgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGlucHV0KHRpdGxlLCBzdWJtaXRfdGV4dCwgY2FuY2VsX3RleHQsIHR5cGUsIHBsYWNlaG9sZGVyLCBzdWJtaXRfY2FsbGJhY2ssIHByZWZpbGxlZF92YWx1ZV9vcHRpb25hbCkge1xuICAgICAgICBcbiAgICAgICAgLy8gQmx1ciBhY3RpdmUgZWxlbWVudCBmb3IgdXNlIG9mIGVudGVyIGtleSwgZm9jdXMgaW5wdXRcbiAgICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGlucHV0X2ZpZWxkLmZvY3VzKCk7IH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwKSk7XG4gICAgICAgIFxuICAgICAgICBpbnB1dF9maWVsZC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCB0eXBlKTtcbiAgICAgICAgaW5wdXRfZmllbGQuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgaW5wdXRfZmllbGQudmFsdWUgPSAnJztcbiAgICAgICAgaWYgKHR5cGVvZiBwcmVmaWxsZWRfdmFsdWVfb3B0aW9uYWwgIT09ICd1bmRlZmluZWQnICYmIHByZWZpbGxlZF92YWx1ZV9vcHRpb25hbC5sZW5ndGggPiAwKSB7IGlucHV0X2ZpZWxkLnZhbHVlID0gcHJlZmlsbGVkX3ZhbHVlX29wdGlvbmFsIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChhbGVydF9pc19zaG93aW5nKSB7XG4gICAgICAgICAgICAvLyBIaWRlIG5vdGllLmFsZXJ0XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYWxlcnRfdGltZW91dF8xKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhbGVydF90aW1lb3V0XzIpO1xuICAgICAgICAgICAgYWxlcnRfaGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpbnB1dF9zaG93KHRpdGxlLCBzdWJtaXRfdGV4dCwgY2FuY2VsX3RleHQsIHN1Ym1pdF9jYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0X3Nob3codGl0bGUsIHN1Ym1pdF90ZXh0LCBjYW5jZWxfdGV4dCwgc3VibWl0X2NhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGZ1bmN0aW9uIGlucHV0X3Nob3codGl0bGUsIHN1Ym1pdF90ZXh0LCBjYW5jZWxfdGV4dCwgc3VibWl0X2NhbGxiYWNrKSB7XG5cbiAgICAgICAgc2Nyb2xsX2Rpc2FibGUoKTtcblxuICAgICAgICAvLyBZZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgaW5wdXRfeWVzLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlucHV0X2hpZGUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3VibWl0X2NhbGxiYWNrKGlucHV0X2ZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgIH0sIChhbmltYXRpb25fZGVsYXkgKiAxMDAwICsgMTApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGlucHV0X3Nob3dfaW5uZXIoKSB7XG5cbiAgICAgICAgICAgIC8vIFNldCBpbnB1dCB0ZXh0XG4gICAgICAgICAgICBpbnB1dF90ZXh0LmlubmVySFRNTCA9IHRpdGxlO1xuICAgICAgICAgICAgaW5wdXRfeWVzX3RleHQuaW5uZXJIVE1MID0gc3VibWl0X3RleHQ7XG4gICAgICAgICAgICBpbnB1dF9ub190ZXh0LmlubmVySFRNTCA9IGNhbmNlbF90ZXh0O1xuXG4gICAgICAgICAgICAvLyBHZXQgaW5wdXQncyBoZWlnaHRcbiAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLnRvcCA9ICctMTAwMDBweCc7XG4gICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlJztcbiAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLnRvcCA9ICctJyArIGlucHV0X291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuICAgICAgICAgICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFkb3cpIHsgaW5wdXRfb3V0ZXIuc3R5bGUuYm94U2hhZG93ID0gJzBweCAwcHggMTBweCAwcHggcmdiYSgwLDAsMCwwLjUpJzsgfVxuICAgICAgICAgICAgICAgIGlucHV0X291dGVyLnN0eWxlLk1velRyYW5zaXRpb24gPSAnYWxsICcgKyBhbmltYXRpb25fZGVsYXkgKyAncyBlYXNlJztcbiAgICAgICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS5XZWJraXRUcmFuc2l0aW9uID0gJ2FsbCAnICsgYW5pbWF0aW9uX2RlbGF5ICsgJ3MgZWFzZSc7XG4gICAgICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICdhbGwgJyArIGFuaW1hdGlvbl9kZWxheSArICdzIGVhc2UnO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgICAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLm9wYWNpdHkgPSAnMC43NSc7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dF9pc19zaG93aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG5cbiAgICAgICAgICAgIH0sIDIwKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlucHV0X2lzX3Nob3dpbmcpIHtcbiAgICAgICAgICAgIGlucHV0X2hpZGUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRfc2hvd19pbm5lcigpO1xuICAgICAgICAgICAgfSwgKGFuaW1hdGlvbl9kZWxheSAqIDEwMDAgKyAxMCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5wdXRfc2hvd19pbm5lcigpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnB1dF9oaWRlKCkge1xuXG4gICAgICAgIGlucHV0X291dGVyLnN0eWxlLnRvcCA9ICctJyArIGlucHV0X291dGVyLm9mZnNldEhlaWdodCAtIDUgKyAncHgnO1xuICAgICAgICBpbnB1dF9iYWNrZ3JvdW5kLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKHNoYWRvdykgeyBpbnB1dF9vdXRlci5zdHlsZS5ib3hTaGFkb3cgPSAnJzsgfVxuICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUuTW96VHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUuV2Via2l0VHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgaW5wdXRfb3V0ZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgICAgICAgICAgaW5wdXRfYmFja2dyb3VuZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbnB1dF9vdXRlci5zdHlsZS50b3AgPSAnLTEwMDAwcHgnO1xuXG4gICAgICAgICAgICBzY3JvbGxfZW5hYmxlKCk7XG5cbiAgICAgICAgICAgIGlucHV0X2lzX3Nob3dpbmcgPSBmYWxzZTtcblxuICAgICAgICB9LCAoYW5pbWF0aW9uX2RlbGF5ICogMTAwMCArIDEwKSk7XG5cbiAgICB9XG4gICAgXG4gICAgXG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxlcnQ6IGFsZXJ0LFxuICAgICAgICBjb25maXJtOiBjb25maXJtLFxuICAgICAgICBpbnB1dDogaW5wdXRcbiAgICB9O1xuXG59KCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG5vdGllO1xufSIsIi8qISBub3Vpc2xpZGVyIC0gOC4yLjEgLSAyMDE1LTEyLTAyIDIxOjQzOjE0ICovXHJcblxyXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcclxuXHJcbiAgICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcclxuXHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xyXG5cclxuICAgICAgICAvLyBOb2RlL0NvbW1vbkpTXHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXHJcbiAgICAgICAgd2luZG93Lm5vVWlTbGlkZXIgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcblxyXG59KGZ1bmN0aW9uKCApe1xyXG5cclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cclxuXHQvLyBSZW1vdmVzIGR1cGxpY2F0ZXMgZnJvbSBhbiBhcnJheS5cclxuXHRmdW5jdGlvbiB1bmlxdWUoYXJyYXkpIHtcclxuXHRcdHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oYSl7XHJcblx0XHRcdHJldHVybiAhdGhpc1thXSA/IHRoaXNbYV0gPSB0cnVlIDogZmFsc2U7XHJcblx0XHR9LCB7fSk7XHJcblx0fVxyXG5cclxuXHQvLyBSb3VuZCBhIHZhbHVlIHRvIHRoZSBjbG9zZXN0ICd0bycuXHJcblx0ZnVuY3Rpb24gY2xvc2VzdCAoIHZhbHVlLCB0byApIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHZhbHVlIC8gdG8pICogdG87XHJcblx0fVxyXG5cclxuXHQvLyBDdXJyZW50IHBvc2l0aW9uIG9mIGFuIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50LlxyXG5cdGZ1bmN0aW9uIG9mZnNldCAoIGVsZW0gKSB7XHJcblxyXG5cdHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcclxuXHRcdGRvYyA9IGVsZW0ub3duZXJEb2N1bWVudCxcclxuXHRcdGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxyXG5cdFx0cGFnZU9mZnNldCA9IGdldFBhZ2VPZmZzZXQoKTtcclxuXHJcblx0XHQvLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgY29udGFpbnMgbGVmdCBzY3JvbGwgaW4gQ2hyb21lIG9uIEFuZHJvaWQuXHJcblx0XHQvLyBJIGhhdmVuJ3QgZm91bmQgYSBmZWF0dXJlIGRldGVjdGlvbiB0aGF0IHByb3ZlcyB0aGlzLiBXb3JzdCBjYXNlXHJcblx0XHQvLyBzY2VuYXJpbyBvbiBtaXMtbWF0Y2g6IHRoZSAndGFwJyBmZWF0dXJlIG9uIGhvcml6b250YWwgc2xpZGVycyBicmVha3MuXHJcblx0XHRpZiAoIC93ZWJraXQuKkNocm9tZS4qTW9iaWxlL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSApIHtcclxuXHRcdFx0cGFnZU9mZnNldC54ID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0b3A6IHJlY3QudG9wICsgcGFnZU9mZnNldC55IC0gZG9jRWxlbS5jbGllbnRUb3AsXHJcblx0XHRcdGxlZnQ6IHJlY3QubGVmdCArIHBhZ2VPZmZzZXQueCAtIGRvY0VsZW0uY2xpZW50TGVmdFxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8vIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgbnVtZXJpY2FsLlxyXG5cdGZ1bmN0aW9uIGlzTnVtZXJpYyAoIGEgKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIGEgPT09ICdudW1iZXInICYmICFpc05hTiggYSApICYmIGlzRmluaXRlKCBhICk7XHJcblx0fVxyXG5cclxuXHQvLyBSb3VuZHMgYSBudW1iZXIgdG8gNyBzdXBwb3J0ZWQgZGVjaW1hbHMuXHJcblx0ZnVuY3Rpb24gYWNjdXJhdGVOdW1iZXIoIG51bWJlciApIHtcclxuXHRcdHZhciBwID0gTWF0aC5wb3coMTAsIDcpO1xyXG5cdFx0cmV0dXJuIE51bWJlcigoTWF0aC5yb3VuZChudW1iZXIqcCkvcCkudG9GaXhlZCg3KSk7XHJcblx0fVxyXG5cclxuXHQvLyBTZXRzIGEgY2xhc3MgYW5kIHJlbW92ZXMgaXQgYWZ0ZXIgW2R1cmF0aW9uXSBtcy5cclxuXHRmdW5jdGlvbiBhZGRDbGFzc0ZvciAoIGVsZW1lbnQsIGNsYXNzTmFtZSwgZHVyYXRpb24gKSB7XHJcblx0XHRhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRyZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xyXG5cdFx0fSwgZHVyYXRpb24pO1xyXG5cdH1cclxuXHJcblx0Ly8gTGltaXRzIGEgdmFsdWUgdG8gMCAtIDEwMFxyXG5cdGZ1bmN0aW9uIGxpbWl0ICggYSApIHtcclxuXHRcdHJldHVybiBNYXRoLm1heChNYXRoLm1pbihhLCAxMDApLCAwKTtcclxuXHR9XHJcblxyXG5cdC8vIFdyYXBzIGEgdmFyaWFibGUgYXMgYW4gYXJyYXksIGlmIGl0IGlzbid0IG9uZSB5ZXQuXHJcblx0ZnVuY3Rpb24gYXNBcnJheSAoIGEgKSB7XHJcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhKSA/IGEgOiBbYV07XHJcblx0fVxyXG5cclxuXHQvLyBDb3VudHMgZGVjaW1hbHNcclxuXHRmdW5jdGlvbiBjb3VudERlY2ltYWxzICggbnVtU3RyICkge1xyXG5cdFx0dmFyIHBpZWNlcyA9IG51bVN0ci5zcGxpdChcIi5cIik7XHJcblx0XHRyZXR1cm4gcGllY2VzLmxlbmd0aCA+IDEgPyBwaWVjZXNbMV0ubGVuZ3RoIDogMDtcclxuXHR9XHJcblxyXG5cdC8vIGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tLyNhZGRfY2xhc3NcclxuXHRmdW5jdGlvbiBhZGRDbGFzcyAoIGVsLCBjbGFzc05hbWUgKSB7XHJcblx0XHRpZiAoIGVsLmNsYXNzTGlzdCApIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tLyNyZW1vdmVfY2xhc3NcclxuXHRmdW5jdGlvbiByZW1vdmVDbGFzcyAoIGVsLCBjbGFzc05hbWUgKSB7XHJcblx0XHRpZiAoIGVsLmNsYXNzTGlzdCApIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cCgnKF58XFxcXGIpJyArIGNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJ3wnKSArICcoXFxcXGJ8JCknLCAnZ2knKSwgJyAnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tLyNoYXNfY2xhc3NcclxuXHRmdW5jdGlvbiBoYXNDbGFzcyAoIGVsLCBjbGFzc05hbWUgKSB7XHJcblx0XHRpZiAoIGVsLmNsYXNzTGlzdCApIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRuZXcgUmVnRXhwKCcoXnwgKScgKyBjbGFzc05hbWUgKyAnKCB8JCknLCAnZ2knKS50ZXN0KGVsLmNsYXNzTmFtZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93L3Njcm9sbFkjTm90ZXNcclxuXHRmdW5jdGlvbiBnZXRQYWdlT2Zmc2V0ICggKSB7XHJcblxyXG5cdFx0dmFyIHN1cHBvcnRQYWdlT2Zmc2V0ID0gd2luZG93LnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWQsXHJcblx0XHRcdGlzQ1NTMUNvbXBhdCA9ICgoZG9jdW1lbnQuY29tcGF0TW9kZSB8fCBcIlwiKSA9PT0gXCJDU1MxQ29tcGF0XCIpLFxyXG5cdFx0XHR4ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVhPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCxcclxuXHRcdFx0eSA9IHN1cHBvcnRQYWdlT2Zmc2V0ID8gd2luZG93LnBhZ2VZT2Zmc2V0IDogaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvLyBTaG9ydGhhbmQgZm9yIHN0b3BQcm9wYWdhdGlvbiBzbyB3ZSBkb24ndCBoYXZlIHRvIGNyZWF0ZSBhIGR5bmFtaWMgbWV0aG9kXHJcblx0ZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICggZSApIHtcclxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0fVxyXG5cclxuXHQvLyB0b2RvXHJcblx0ZnVuY3Rpb24gYWRkQ3NzUHJlZml4KGNzc1ByZWZpeCkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xyXG5cdFx0XHRyZXR1cm4gY3NzUHJlZml4ICsgY2xhc3NOYW1lO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cclxuXHR2YXJcclxuXHQvLyBEZXRlcm1pbmUgdGhlIGV2ZW50cyB0byBiaW5kLiBJRTExIGltcGxlbWVudHMgcG9pbnRlckV2ZW50cyB3aXRob3V0XHJcblx0Ly8gYSBwcmVmaXgsIHdoaWNoIGJyZWFrcyBjb21wYXRpYmlsaXR5IHdpdGggdGhlIElFMTAgaW1wbGVtZW50YXRpb24uXHJcblx0LyoqIEBjb25zdCAqL1xyXG5cdGFjdGlvbnMgPSB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkID8ge1xyXG5cdFx0c3RhcnQ6ICdwb2ludGVyZG93bicsXHJcblx0XHRtb3ZlOiAncG9pbnRlcm1vdmUnLFxyXG5cdFx0ZW5kOiAncG9pbnRlcnVwJ1xyXG5cdH0gOiB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgPyB7XHJcblx0XHRzdGFydDogJ01TUG9pbnRlckRvd24nLFxyXG5cdFx0bW92ZTogJ01TUG9pbnRlck1vdmUnLFxyXG5cdFx0ZW5kOiAnTVNQb2ludGVyVXAnXHJcblx0fSA6IHtcclxuXHRcdHN0YXJ0OiAnbW91c2Vkb3duIHRvdWNoc3RhcnQnLFxyXG5cdFx0bW92ZTogJ21vdXNlbW92ZSB0b3VjaG1vdmUnLFxyXG5cdFx0ZW5kOiAnbW91c2V1cCB0b3VjaGVuZCdcclxuXHR9LFxyXG5cdGRlZmF1bHRDc3NQcmVmaXggPSAnbm9VaS0nO1xyXG5cclxuXHJcbi8vIFZhbHVlIGNhbGN1bGF0aW9uXHJcblxyXG5cdC8vIERldGVybWluZSB0aGUgc2l6ZSBvZiBhIHN1Yi1yYW5nZSBpbiByZWxhdGlvbiB0byBhIGZ1bGwgcmFuZ2UuXHJcblx0ZnVuY3Rpb24gc3ViUmFuZ2VSYXRpbyAoIHBhLCBwYiApIHtcclxuXHRcdHJldHVybiAoMTAwIC8gKHBiIC0gcGEpKTtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBIb3cgbWFueSBwZXJjZW50IGlzIHRoaXMgdmFsdWUgb2YgdGhpcyByYW5nZT9cclxuXHRmdW5jdGlvbiBmcm9tUGVyY2VudGFnZSAoIHJhbmdlLCB2YWx1ZSApIHtcclxuXHRcdHJldHVybiAodmFsdWUgKiAxMDApIC8gKCByYW5nZVsxXSAtIHJhbmdlWzBdICk7XHJcblx0fVxyXG5cclxuXHQvLyAocGVyY2VudGFnZSkgV2hlcmUgaXMgdGhpcyB2YWx1ZSBvbiB0aGlzIHJhbmdlP1xyXG5cdGZ1bmN0aW9uIHRvUGVyY2VudGFnZSAoIHJhbmdlLCB2YWx1ZSApIHtcclxuXHRcdHJldHVybiBmcm9tUGVyY2VudGFnZSggcmFuZ2UsIHJhbmdlWzBdIDwgMCA/XHJcblx0XHRcdHZhbHVlICsgTWF0aC5hYnMocmFuZ2VbMF0pIDpcclxuXHRcdFx0XHR2YWx1ZSAtIHJhbmdlWzBdICk7XHJcblx0fVxyXG5cclxuXHQvLyAodmFsdWUpIEhvdyBtdWNoIGlzIHRoaXMgcGVyY2VudGFnZSBvbiB0aGlzIHJhbmdlP1xyXG5cdGZ1bmN0aW9uIGlzUGVyY2VudGFnZSAoIHJhbmdlLCB2YWx1ZSApIHtcclxuXHRcdHJldHVybiAoKHZhbHVlICogKCByYW5nZVsxXSAtIHJhbmdlWzBdICkpIC8gMTAwKSArIHJhbmdlWzBdO1xyXG5cdH1cclxuXHJcblxyXG4vLyBSYW5nZSBjb252ZXJzaW9uXHJcblxyXG5cdGZ1bmN0aW9uIGdldEogKCB2YWx1ZSwgYXJyICkge1xyXG5cclxuXHRcdHZhciBqID0gMTtcclxuXHJcblx0XHR3aGlsZSAoIHZhbHVlID49IGFycltqXSApe1xyXG5cdFx0XHRqICs9IDE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGo7XHJcblx0fVxyXG5cclxuXHQvLyAocGVyY2VudGFnZSkgSW5wdXQgYSB2YWx1ZSwgZmluZCB3aGVyZSwgb24gYSBzY2FsZSBvZiAwLTEwMCwgaXQgYXBwbGllcy5cclxuXHRmdW5jdGlvbiB0b1N0ZXBwaW5nICggeFZhbCwgeFBjdCwgdmFsdWUgKSB7XHJcblxyXG5cdFx0aWYgKCB2YWx1ZSA+PSB4VmFsLnNsaWNlKC0xKVswXSApe1xyXG5cdFx0XHRyZXR1cm4gMTAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBqID0gZ2V0SiggdmFsdWUsIHhWYWwgKSwgdmEsIHZiLCBwYSwgcGI7XHJcblxyXG5cdFx0dmEgPSB4VmFsW2otMV07XHJcblx0XHR2YiA9IHhWYWxbal07XHJcblx0XHRwYSA9IHhQY3Rbai0xXTtcclxuXHRcdHBiID0geFBjdFtqXTtcclxuXHJcblx0XHRyZXR1cm4gcGEgKyAodG9QZXJjZW50YWdlKFt2YSwgdmJdLCB2YWx1ZSkgLyBzdWJSYW5nZVJhdGlvIChwYSwgcGIpKTtcclxuXHR9XHJcblxyXG5cdC8vICh2YWx1ZSkgSW5wdXQgYSBwZXJjZW50YWdlLCBmaW5kIHdoZXJlIGl0IGlzIG9uIHRoZSBzcGVjaWZpZWQgcmFuZ2UuXHJcblx0ZnVuY3Rpb24gZnJvbVN0ZXBwaW5nICggeFZhbCwgeFBjdCwgdmFsdWUgKSB7XHJcblxyXG5cdFx0Ly8gVGhlcmUgaXMgbm8gcmFuZ2UgZ3JvdXAgdGhhdCBmaXRzIDEwMFxyXG5cdFx0aWYgKCB2YWx1ZSA+PSAxMDAgKXtcclxuXHRcdFx0cmV0dXJuIHhWYWwuc2xpY2UoLTEpWzBdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBqID0gZ2V0SiggdmFsdWUsIHhQY3QgKSwgdmEsIHZiLCBwYSwgcGI7XHJcblxyXG5cdFx0dmEgPSB4VmFsW2otMV07XHJcblx0XHR2YiA9IHhWYWxbal07XHJcblx0XHRwYSA9IHhQY3Rbai0xXTtcclxuXHRcdHBiID0geFBjdFtqXTtcclxuXHJcblx0XHRyZXR1cm4gaXNQZXJjZW50YWdlKFt2YSwgdmJdLCAodmFsdWUgLSBwYSkgKiBzdWJSYW5nZVJhdGlvIChwYSwgcGIpKTtcclxuXHR9XHJcblxyXG5cdC8vIChwZXJjZW50YWdlKSBHZXQgdGhlIHN0ZXAgdGhhdCBhcHBsaWVzIGF0IGEgY2VydGFpbiB2YWx1ZS5cclxuXHRmdW5jdGlvbiBnZXRTdGVwICggeFBjdCwgeFN0ZXBzLCBzbmFwLCB2YWx1ZSApIHtcclxuXHJcblx0XHRpZiAoIHZhbHVlID09PSAxMDAgKSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaiA9IGdldEooIHZhbHVlLCB4UGN0ICksIGEsIGI7XHJcblxyXG5cdFx0Ly8gSWYgJ3NuYXAnIGlzIHNldCwgc3RlcHMgYXJlIHVzZWQgYXMgZml4ZWQgcG9pbnRzIG9uIHRoZSBzbGlkZXIuXHJcblx0XHRpZiAoIHNuYXAgKSB7XHJcblxyXG5cdFx0XHRhID0geFBjdFtqLTFdO1xyXG5cdFx0XHRiID0geFBjdFtqXTtcclxuXHJcblx0XHRcdC8vIEZpbmQgdGhlIGNsb3Nlc3QgcG9zaXRpb24sIGEgb3IgYi5cclxuXHRcdFx0aWYgKCh2YWx1ZSAtIGEpID4gKChiLWEpLzIpKXtcclxuXHRcdFx0XHRyZXR1cm4gYjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIGE7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCAheFN0ZXBzW2otMV0gKXtcclxuXHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB4UGN0W2otMV0gKyBjbG9zZXN0KFxyXG5cdFx0XHR2YWx1ZSAtIHhQY3Rbai0xXSxcclxuXHRcdFx0eFN0ZXBzW2otMV1cclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHJcbi8vIEVudHJ5IHBhcnNpbmdcclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlRW50cnlQb2ludCAoIGluZGV4LCB2YWx1ZSwgdGhhdCApIHtcclxuXHJcblx0XHR2YXIgcGVyY2VudGFnZTtcclxuXHJcblx0XHQvLyBXcmFwIG51bWVyaWNhbCBpbnB1dCBpbiBhbiBhcnJheS5cclxuXHRcdGlmICggdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiICkge1xyXG5cdFx0XHR2YWx1ZSA9IFt2YWx1ZV07XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUmVqZWN0IGFueSBpbnZhbGlkIGlucHV0LCBieSB0ZXN0aW5nIHdoZXRoZXIgdmFsdWUgaXMgYW4gYXJyYXkuXHJcblx0XHRpZiAoIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggdmFsdWUgKSAhPT0gJ1tvYmplY3QgQXJyYXldJyApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAncmFuZ2UnIGNvbnRhaW5zIGludmFsaWQgdmFsdWUuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENvdmVydCBtaW4vbWF4IHN5bnRheCB0byAwIGFuZCAxMDAuXHJcblx0XHRpZiAoIGluZGV4ID09PSAnbWluJyApIHtcclxuXHRcdFx0cGVyY2VudGFnZSA9IDA7XHJcblx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gJ21heCcgKSB7XHJcblx0XHRcdHBlcmNlbnRhZ2UgPSAxMDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwZXJjZW50YWdlID0gcGFyc2VGbG9hdCggaW5kZXggKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBmb3IgY29ycmVjdCBpbnB1dC5cclxuXHRcdGlmICggIWlzTnVtZXJpYyggcGVyY2VudGFnZSApIHx8ICFpc051bWVyaWMoIHZhbHVlWzBdICkgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdyYW5nZScgdmFsdWUgaXNuJ3QgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RvcmUgdmFsdWVzLlxyXG5cdFx0dGhhdC54UGN0LnB1c2goIHBlcmNlbnRhZ2UgKTtcclxuXHRcdHRoYXQueFZhbC5wdXNoKCB2YWx1ZVswXSApO1xyXG5cclxuXHRcdC8vIE5hTiB3aWxsIGV2YWx1YXRlIHRvIGZhbHNlIHRvbywgYnV0IHRvIGtlZXBcclxuXHRcdC8vIGxvZ2dpbmcgY2xlYXIsIHNldCBzdGVwIGV4cGxpY2l0bHkuIE1ha2Ugc3VyZVxyXG5cdFx0Ly8gbm90IHRvIG92ZXJyaWRlIHRoZSAnc3RlcCcgc2V0dGluZyB3aXRoIGZhbHNlLlxyXG5cdFx0aWYgKCAhcGVyY2VudGFnZSApIHtcclxuXHRcdFx0aWYgKCAhaXNOYU4oIHZhbHVlWzFdICkgKSB7XHJcblx0XHRcdFx0dGhhdC54U3RlcHNbMF0gPSB2YWx1ZVsxXTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhhdC54U3RlcHMucHVzaCggaXNOYU4odmFsdWVbMV0pID8gZmFsc2UgOiB2YWx1ZVsxXSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlU3RlcFBvaW50ICggaSwgbiwgdGhhdCApIHtcclxuXHJcblx0XHQvLyBJZ25vcmUgJ2ZhbHNlJyBzdGVwcGluZy5cclxuXHRcdGlmICggIW4gKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZhY3RvciB0byByYW5nZSByYXRpb1xyXG5cdFx0dGhhdC54U3RlcHNbaV0gPSBmcm9tUGVyY2VudGFnZShbXHJcblx0XHRcdCB0aGF0LnhWYWxbaV1cclxuXHRcdFx0LHRoYXQueFZhbFtpKzFdXHJcblx0XHRdLCBuKSAvIHN1YlJhbmdlUmF0aW8gKFxyXG5cdFx0XHR0aGF0LnhQY3RbaV0sXHJcblx0XHRcdHRoYXQueFBjdFtpKzFdICk7XHJcblx0fVxyXG5cclxuXHJcbi8vIEludGVyZmFjZVxyXG5cclxuXHQvLyBUaGUgaW50ZXJmYWNlIHRvIFNwZWN0cnVtIGhhbmRsZXMgYWxsIGRpcmVjdGlvbi1iYXNlZFxyXG5cdC8vIGNvbnZlcnNpb25zLCBzbyB0aGUgYWJvdmUgdmFsdWVzIGFyZSB1bmF3YXJlLlxyXG5cclxuXHRmdW5jdGlvbiBTcGVjdHJ1bSAoIGVudHJ5LCBzbmFwLCBkaXJlY3Rpb24sIHNpbmdsZVN0ZXAgKSB7XHJcblxyXG5cdFx0dGhpcy54UGN0ID0gW107XHJcblx0XHR0aGlzLnhWYWwgPSBbXTtcclxuXHRcdHRoaXMueFN0ZXBzID0gWyBzaW5nbGVTdGVwIHx8IGZhbHNlIF07XHJcblx0XHR0aGlzLnhOdW1TdGVwcyA9IFsgZmFsc2UgXTtcclxuXHJcblx0XHR0aGlzLnNuYXAgPSBzbmFwO1xyXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblxyXG5cdFx0dmFyIGluZGV4LCBvcmRlcmVkID0gWyAvKiBbMCwgJ21pbiddLCBbMSwgJzUwJSddLCBbMiwgJ21heCddICovIF07XHJcblxyXG5cdFx0Ly8gTWFwIHRoZSBvYmplY3Qga2V5cyB0byBhbiBhcnJheS5cclxuXHRcdGZvciAoIGluZGV4IGluIGVudHJ5ICkge1xyXG5cdFx0XHRpZiAoIGVudHJ5Lmhhc093blByb3BlcnR5KGluZGV4KSApIHtcclxuXHRcdFx0XHRvcmRlcmVkLnB1c2goW2VudHJ5W2luZGV4XSwgaW5kZXhdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNvcnQgYWxsIGVudHJpZXMgYnkgdmFsdWUgKG51bWVyaWMgc29ydCkuXHJcblx0XHRpZiAoIG9yZGVyZWQubGVuZ3RoICYmIHR5cGVvZiBvcmRlcmVkWzBdWzBdID09PSBcIm9iamVjdFwiICkge1xyXG5cdFx0XHRvcmRlcmVkLnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYVswXVswXSAtIGJbMF1bMF07IH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0b3JkZXJlZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdOyB9KTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0Ly8gQ29udmVydCBhbGwgZW50cmllcyB0byBzdWJyYW5nZXMuXHJcblx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgb3JkZXJlZC5sZW5ndGg7IGluZGV4KysgKSB7XHJcblx0XHRcdGhhbmRsZUVudHJ5UG9pbnQob3JkZXJlZFtpbmRleF1bMV0sIG9yZGVyZWRbaW5kZXhdWzBdLCB0aGlzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTdG9yZSB0aGUgYWN0dWFsIHN0ZXAgdmFsdWVzLlxyXG5cdFx0Ly8geFN0ZXBzIGlzIHNvcnRlZCBpbiB0aGUgc2FtZSBvcmRlciBhcyB4UGN0IGFuZCB4VmFsLlxyXG5cdFx0dGhpcy54TnVtU3RlcHMgPSB0aGlzLnhTdGVwcy5zbGljZSgwKTtcclxuXHJcblx0XHQvLyBDb252ZXJ0IGFsbCBudW1lcmljIHN0ZXBzIHRvIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBzdWJyYW5nZSB0aGV5IHJlcHJlc2VudC5cclxuXHRcdGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnhOdW1TdGVwcy5sZW5ndGg7IGluZGV4KysgKSB7XHJcblx0XHRcdGhhbmRsZVN0ZXBQb2ludChpbmRleCwgdGhpcy54TnVtU3RlcHNbaW5kZXhdLCB0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS5nZXRNYXJnaW4gPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuIHRoaXMueFBjdC5sZW5ndGggPT09IDIgPyBmcm9tUGVyY2VudGFnZSh0aGlzLnhWYWwsIHZhbHVlKSA6IGZhbHNlO1xyXG5cdH07XHJcblxyXG5cdFNwZWN0cnVtLnByb3RvdHlwZS50b1N0ZXBwaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHR2YWx1ZSA9IHRvU3RlcHBpbmcoIHRoaXMueFZhbCwgdGhpcy54UGN0LCB2YWx1ZSApO1xyXG5cclxuXHRcdC8vIEludmVydCB0aGUgdmFsdWUgaWYgdGhpcyBpcyBhIHJpZ2h0LXRvLWxlZnQgc2xpZGVyLlxyXG5cdFx0aWYgKCB0aGlzLmRpcmVjdGlvbiApIHtcclxuXHRcdFx0dmFsdWUgPSAxMDAgLSB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmZyb21TdGVwcGluZyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0Ly8gSW52ZXJ0IHRoZSB2YWx1ZSBpZiB0aGlzIGlzIGEgcmlnaHQtdG8tbGVmdCBzbGlkZXIuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhY2N1cmF0ZU51bWJlcihmcm9tU3RlcHBpbmcoIHRoaXMueFZhbCwgdGhpcy54UGN0LCB2YWx1ZSApKTtcclxuXHR9O1xyXG5cclxuXHRTcGVjdHJ1bS5wcm90b3R5cGUuZ2V0U3RlcCA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XHJcblxyXG5cdFx0Ly8gRmluZCB0aGUgcHJvcGVyIHN0ZXAgZm9yIHJ0bCBzbGlkZXJzIGJ5IHNlYXJjaCBpbiBpbnZlcnNlIGRpcmVjdGlvbi5cclxuXHRcdC8vIEZpeGVzIGlzc3VlICMyNjIuXHJcblx0XHRpZiAoIHRoaXMuZGlyZWN0aW9uICkge1xyXG5cdFx0XHR2YWx1ZSA9IDEwMCAtIHZhbHVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhbHVlID0gZ2V0U3RlcCh0aGlzLnhQY3QsIHRoaXMueFN0ZXBzLCB0aGlzLnNuYXAsIHZhbHVlICk7XHJcblxyXG5cdFx0aWYgKCB0aGlzLmRpcmVjdGlvbiApIHtcclxuXHRcdFx0dmFsdWUgPSAxMDAgLSB2YWx1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmdldEFwcGxpY2FibGVTdGVwID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBJZiB0aGUgdmFsdWUgaXMgMTAwJSwgcmV0dXJuIHRoZSBuZWdhdGl2ZSBzdGVwIHR3aWNlLlxyXG5cdFx0dmFyIGogPSBnZXRKKHZhbHVlLCB0aGlzLnhQY3QpLCBvZmZzZXQgPSB2YWx1ZSA9PT0gMTAwID8gMiA6IDE7XHJcblx0XHRyZXR1cm4gW3RoaXMueE51bVN0ZXBzW2otMl0sIHRoaXMueFZhbFtqLW9mZnNldF0sIHRoaXMueE51bVN0ZXBzW2otb2Zmc2V0XV07XHJcblx0fTtcclxuXHJcblx0Ly8gT3V0c2lkZSB0ZXN0aW5nXHJcblx0U3BlY3RydW0ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0U3RlcCh0aGlzLnRvU3RlcHBpbmcodmFsdWUpKTtcclxuXHR9O1xyXG5cclxuLypcdEV2ZXJ5IGlucHV0IG9wdGlvbiBpcyB0ZXN0ZWQgYW5kIHBhcnNlZC4gVGhpcydsbCBwcmV2ZW50XHJcblx0ZW5kbGVzcyB2YWxpZGF0aW9uIGluIGludGVybmFsIG1ldGhvZHMuIFRoZXNlIHRlc3RzIGFyZVxyXG5cdHN0cnVjdHVyZWQgd2l0aCBhbiBpdGVtIGZvciBldmVyeSBvcHRpb24gYXZhaWxhYmxlLiBBblxyXG5cdG9wdGlvbiBjYW4gYmUgbWFya2VkIGFzIHJlcXVpcmVkIGJ5IHNldHRpbmcgdGhlICdyJyBmbGFnLlxyXG5cdFRoZSB0ZXN0aW5nIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIHdpdGggdGhyZWUgYXJndW1lbnRzOlxyXG5cdFx0LSBUaGUgcHJvdmlkZWQgdmFsdWUgZm9yIHRoZSBvcHRpb247XHJcblx0XHQtIEEgcmVmZXJlbmNlIHRvIHRoZSBvcHRpb25zIG9iamVjdDtcclxuXHRcdC0gVGhlIG5hbWUgZm9yIHRoZSBvcHRpb247XHJcblxyXG5cdFRoZSB0ZXN0aW5nIGZ1bmN0aW9uIHJldHVybnMgZmFsc2Ugd2hlbiBhbiBlcnJvciBpcyBkZXRlY3RlZCxcclxuXHRvciB0cnVlIHdoZW4gZXZlcnl0aGluZyBpcyBPSy4gSXQgY2FuIGFsc28gbW9kaWZ5IHRoZSBvcHRpb25cclxuXHRvYmplY3QsIHRvIG1ha2Ugc3VyZSBhbGwgdmFsdWVzIGNhbiBiZSBjb3JyZWN0bHkgbG9vcGVkIGVsc2V3aGVyZS4gKi9cclxuXHJcblx0dmFyIGRlZmF1bHRGb3JtYXR0ZXIgPSB7ICd0byc6IGZ1bmN0aW9uKCB2YWx1ZSApe1xyXG5cdFx0cmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUudG9GaXhlZCgyKTtcclxuXHR9LCAnZnJvbSc6IE51bWJlciB9O1xyXG5cclxuXHRmdW5jdGlvbiB0ZXN0U3RlcCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCAhaXNOdW1lcmljKCBlbnRyeSApICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnc3RlcCcgaXMgbm90IG51bWVyaWMuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBzdGVwIG9wdGlvbiBjYW4gc3RpbGwgYmUgdXNlZCB0byBzZXQgc3RlcHBpbmdcclxuXHRcdC8vIGZvciBsaW5lYXIgc2xpZGVycy4gT3ZlcndyaXR0ZW4gaWYgc2V0IGluICdyYW5nZScuXHJcblx0XHRwYXJzZWQuc2luZ2xlU3RlcCA9IGVudHJ5O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdFJhbmdlICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBGaWx0ZXIgaW5jb3JyZWN0IGlucHV0LlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZW50cnkpICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAncmFuZ2UnIGlzIG5vdCBhbiBvYmplY3QuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENhdGNoIG1pc3Npbmcgc3RhcnQgb3IgZW5kLlxyXG5cdFx0aWYgKCBlbnRyeS5taW4gPT09IHVuZGVmaW5lZCB8fCBlbnRyeS5tYXggPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogTWlzc2luZyAnbWluJyBvciAnbWF4JyBpbiAncmFuZ2UnLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDYXRjaCBlcXVhbCBzdGFydCBvciBlbmQuXHJcblx0XHRpZiAoIGVudHJ5Lm1pbiA9PT0gZW50cnkubWF4ICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAncmFuZ2UnICdtaW4nIGFuZCAnbWF4JyBjYW5ub3QgYmUgZXF1YWwuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlZC5zcGVjdHJ1bSA9IG5ldyBTcGVjdHJ1bShlbnRyeSwgcGFyc2VkLnNuYXAsIHBhcnNlZC5kaXIsIHBhcnNlZC5zaW5nbGVTdGVwKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RTdGFydCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0ZW50cnkgPSBhc0FycmF5KGVudHJ5KTtcclxuXHJcblx0XHQvLyBWYWxpZGF0ZSBpbnB1dC4gVmFsdWVzIGFyZW4ndCB0ZXN0ZWQsIGFzIHRoZSBwdWJsaWMgLnZhbCBtZXRob2RcclxuXHRcdC8vIHdpbGwgYWx3YXlzIHByb3ZpZGUgYSB2YWxpZCBsb2NhdGlvbi5cclxuXHRcdGlmICggIUFycmF5LmlzQXJyYXkoIGVudHJ5ICkgfHwgIWVudHJ5Lmxlbmd0aCB8fCBlbnRyeS5sZW5ndGggPiAyICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnc3RhcnQnIG9wdGlvbiBpcyBpbmNvcnJlY3QuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFN0b3JlIHRoZSBudW1iZXIgb2YgaGFuZGxlcy5cclxuXHRcdHBhcnNlZC5oYW5kbGVzID0gZW50cnkubGVuZ3RoO1xyXG5cclxuXHRcdC8vIFdoZW4gdGhlIHNsaWRlciBpcyBpbml0aWFsaXplZCwgdGhlIC52YWwgbWV0aG9kIHdpbGxcclxuXHRcdC8vIGJlIGNhbGxlZCB3aXRoIHRoZSBzdGFydCBvcHRpb25zLlxyXG5cdFx0cGFyc2VkLnN0YXJ0ID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0U25hcCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gRW5mb3JjZSAxMDAlIHN0ZXBwaW5nIHdpdGhpbiBzdWJyYW5nZXMuXHJcblx0XHRwYXJzZWQuc25hcCA9IGVudHJ5O1xyXG5cclxuXHRcdGlmICggdHlwZW9mIGVudHJ5ICE9PSAnYm9vbGVhbicgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ3NuYXAnIG9wdGlvbiBtdXN0IGJlIGEgYm9vbGVhbi5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0QW5pbWF0ZSAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0Ly8gRW5mb3JjZSAxMDAlIHN0ZXBwaW5nIHdpdGhpbiBzdWJyYW5nZXMuXHJcblx0XHRwYXJzZWQuYW5pbWF0ZSA9IGVudHJ5O1xyXG5cclxuXHRcdGlmICggdHlwZW9mIGVudHJ5ICE9PSAnYm9vbGVhbicgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2FuaW1hdGUnIG9wdGlvbiBtdXN0IGJlIGEgYm9vbGVhbi5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Q29ubmVjdCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCBlbnRyeSA9PT0gJ2xvd2VyJyAmJiBwYXJzZWQuaGFuZGxlcyA9PT0gMSApIHtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSAxO1xyXG5cdFx0fSBlbHNlIGlmICggZW50cnkgPT09ICd1cHBlcicgJiYgcGFyc2VkLmhhbmRsZXMgPT09IDEgKSB7XHJcblx0XHRcdHBhcnNlZC5jb25uZWN0ID0gMjtcclxuXHRcdH0gZWxzZSBpZiAoIGVudHJ5ID09PSB0cnVlICYmIHBhcnNlZC5oYW5kbGVzID09PSAyICkge1xyXG5cdFx0XHRwYXJzZWQuY29ubmVjdCA9IDM7XHJcblx0XHR9IGVsc2UgaWYgKCBlbnRyeSA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdHBhcnNlZC5jb25uZWN0ID0gMDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdjb25uZWN0JyBvcHRpb24gZG9lc24ndCBtYXRjaCBoYW5kbGUgY291bnQuXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdE9yaWVudGF0aW9uICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBTZXQgb3JpZW50YXRpb24gdG8gYW4gYSBudW1lcmljYWwgdmFsdWUgZm9yIGVhc3lcclxuXHRcdC8vIGFycmF5IHNlbGVjdGlvbi5cclxuXHRcdHN3aXRjaCAoIGVudHJ5ICl7XHJcblx0XHQgIGNhc2UgJ2hvcml6b250YWwnOlxyXG5cdFx0XHRwYXJzZWQub3J0ID0gMDtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHQgIGNhc2UgJ3ZlcnRpY2FsJzpcclxuXHRcdFx0cGFyc2VkLm9ydCA9IDE7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnb3JpZW50YXRpb24nIG9wdGlvbiBpcyBpbnZhbGlkLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3RNYXJnaW4gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggIWlzTnVtZXJpYyhlbnRyeSkgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ21hcmdpbicgb3B0aW9uIG11c3QgYmUgbnVtZXJpYy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLm1hcmdpbiA9IHBhcnNlZC5zcGVjdHJ1bS5nZXRNYXJnaW4oZW50cnkpO1xyXG5cclxuXHRcdGlmICggIXBhcnNlZC5tYXJnaW4gKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdtYXJnaW4nIG9wdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBvbiBsaW5lYXIgc2xpZGVycy5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0TGltaXQgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdGlmICggIWlzTnVtZXJpYyhlbnRyeSkgKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2xpbWl0JyBvcHRpb24gbXVzdCBiZSBudW1lcmljLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQubGltaXQgPSBwYXJzZWQuc3BlY3RydW0uZ2V0TWFyZ2luKGVudHJ5KTtcclxuXHJcblx0XHRpZiAoICFwYXJzZWQubGltaXQgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdsaW1pdCcgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIG9uIGxpbmVhciBzbGlkZXJzLlwiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRlc3REaXJlY3Rpb24gKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdC8vIFNldCBkaXJlY3Rpb24gYXMgYSBudW1lcmljYWwgdmFsdWUgZm9yIGVhc3kgcGFyc2luZy5cclxuXHRcdC8vIEludmVydCBjb25uZWN0aW9uIGZvciBSVEwgc2xpZGVycywgc28gdGhhdCB0aGUgcHJvcGVyXHJcblx0XHQvLyBoYW5kbGVzIGdldCB0aGUgY29ubmVjdC9iYWNrZ3JvdW5kIGNsYXNzZXMuXHJcblx0XHRzd2l0Y2ggKCBlbnRyeSApIHtcclxuXHRcdCAgY2FzZSAnbHRyJzpcclxuXHRcdFx0cGFyc2VkLmRpciA9IDA7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0ICBjYXNlICdydGwnOlxyXG5cdFx0XHRwYXJzZWQuZGlyID0gMTtcclxuXHRcdFx0cGFyc2VkLmNvbm5lY3QgPSBbMCwyLDEsM11bcGFyc2VkLmNvbm5lY3RdO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdCAgZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibm9VaVNsaWRlcjogJ2RpcmVjdGlvbicgb3B0aW9uIHdhcyBub3QgcmVjb2duaXplZC5cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0QmVoYXZpb3VyICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgdGhlIGlucHV0IGlzIGEgc3RyaW5nLlxyXG5cdFx0aWYgKCB0eXBlb2YgZW50cnkgIT09ICdzdHJpbmcnICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnYmVoYXZpb3VyJyBtdXN0IGJlIGEgc3RyaW5nIGNvbnRhaW5pbmcgb3B0aW9ucy5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIHN0cmluZyBjb250YWlucyBhbnkga2V5d29yZHMuXHJcblx0XHQvLyBOb25lIGFyZSByZXF1aXJlZC5cclxuXHRcdHZhciB0YXAgPSBlbnRyeS5pbmRleE9mKCd0YXAnKSA+PSAwLFxyXG5cdFx0XHRkcmFnID0gZW50cnkuaW5kZXhPZignZHJhZycpID49IDAsXHJcblx0XHRcdGZpeGVkID0gZW50cnkuaW5kZXhPZignZml4ZWQnKSA+PSAwLFxyXG5cdFx0XHRzbmFwID0gZW50cnkuaW5kZXhPZignc25hcCcpID49IDAsXHJcblx0XHRcdGhvdmVyID0gZW50cnkuaW5kZXhPZignaG92ZXInKSA+PSAwO1xyXG5cclxuXHRcdC8vIEZpeCAjNDcyXHJcblx0XHRpZiAoIGRyYWcgJiYgIXBhcnNlZC5jb25uZWN0ICkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAnZHJhZycgYmVoYXZpb3VyIG11c3QgYmUgdXNlZCB3aXRoICdjb25uZWN0JzogdHJ1ZS5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cGFyc2VkLmV2ZW50cyA9IHtcclxuXHRcdFx0dGFwOiB0YXAgfHwgc25hcCxcclxuXHRcdFx0ZHJhZzogZHJhZyxcclxuXHRcdFx0Zml4ZWQ6IGZpeGVkLFxyXG5cdFx0XHRzbmFwOiBzbmFwLFxyXG5cdFx0XHRob3ZlcjogaG92ZXJcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0VG9vbHRpcHMgKCBwYXJzZWQsIGVudHJ5ICkge1xyXG5cclxuXHRcdHZhciBpO1xyXG5cclxuXHRcdGlmICggZW50cnkgPT09IGZhbHNlICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9IGVsc2UgaWYgKCBlbnRyeSA9PT0gdHJ1ZSApIHtcclxuXHJcblx0XHRcdHBhcnNlZC50b29sdGlwcyA9IFtdO1xyXG5cclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBwYXJzZWQuaGFuZGxlczsgaSsrICkge1xyXG5cdFx0XHRcdHBhcnNlZC50b29sdGlwcy5wdXNoKHRydWUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHBhcnNlZC50b29sdGlwcyA9IGFzQXJyYXkoZW50cnkpO1xyXG5cclxuXHRcdFx0aWYgKCBwYXJzZWQudG9vbHRpcHMubGVuZ3RoICE9PSBwYXJzZWQuaGFuZGxlcyApIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiBtdXN0IHBhc3MgYSBmb3JtYXR0ZXIgZm9yIGFsbCBoYW5kbGVzLlwiKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFyc2VkLnRvb2x0aXBzLmZvckVhY2goZnVuY3Rpb24oZm9ybWF0dGVyKXtcclxuXHRcdFx0XHRpZiAoIHR5cGVvZiBmb3JtYXR0ZXIgIT09ICdib29sZWFuJyAmJiAodHlwZW9mIGZvcm1hdHRlciAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIGZvcm1hdHRlci50byAhPT0gJ2Z1bmN0aW9uJykgKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJub1VpU2xpZGVyOiAndG9vbHRpcHMnIG11c3QgYmUgcGFzc2VkIGEgZm9ybWF0dGVyIG9yICdmYWxzZScuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0ZXN0Rm9ybWF0ICggcGFyc2VkLCBlbnRyeSApIHtcclxuXHJcblx0XHRwYXJzZWQuZm9ybWF0ID0gZW50cnk7XHJcblxyXG5cdFx0Ly8gQW55IG9iamVjdCB3aXRoIGEgdG8gYW5kIGZyb20gbWV0aG9kIGlzIHN1cHBvcnRlZC5cclxuXHRcdGlmICggdHlwZW9mIGVudHJ5LnRvID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbnRyeS5mcm9tID09PSAnZnVuY3Rpb24nICkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwibm9VaVNsaWRlcjogJ2Zvcm1hdCcgcmVxdWlyZXMgJ3RvJyBhbmQgJ2Zyb20nIG1ldGhvZHMuXCIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdGVzdENzc1ByZWZpeCAoIHBhcnNlZCwgZW50cnkgKSB7XHJcblxyXG5cdFx0aWYgKCBlbnRyeSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbnRyeSAhPT0gJ3N0cmluZycgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvciggXCJub1VpU2xpZGVyOiAnY3NzUHJlZml4JyBtdXN0IGJlIGEgc3RyaW5nLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRwYXJzZWQuY3NzUHJlZml4ID0gZW50cnk7XHJcblx0fVxyXG5cclxuXHQvLyBUZXN0IGFsbCBkZXZlbG9wZXIgc2V0dGluZ3MgYW5kIHBhcnNlIHRvIGFzc3VtcHRpb24tc2FmZSB2YWx1ZXMuXHJcblx0ZnVuY3Rpb24gdGVzdE9wdGlvbnMgKCBvcHRpb25zICkge1xyXG5cclxuXHRcdC8vIFRvIHByb3ZlIGEgZml4IGZvciAjNTM3LCBmcmVlemUgb3B0aW9ucyBoZXJlLlxyXG5cdFx0Ly8gSWYgdGhlIG9iamVjdCBpcyBtb2RpZmllZCwgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXHJcblx0XHQvLyBPYmplY3QuZnJlZXplKG9wdGlvbnMpO1xyXG5cclxuXHRcdHZhciBwYXJzZWQgPSB7XHJcblx0XHRcdG1hcmdpbjogMCxcclxuXHRcdFx0bGltaXQ6IDAsXHJcblx0XHRcdGFuaW1hdGU6IHRydWUsXHJcblx0XHRcdGZvcm1hdDogZGVmYXVsdEZvcm1hdHRlclxyXG5cdFx0fSwgdGVzdHM7XHJcblxyXG5cdFx0Ly8gVGVzdHMgYXJlIGV4ZWN1dGVkIGluIHRoZSBvcmRlciB0aGV5IGFyZSBwcmVzZW50ZWQgaGVyZS5cclxuXHRcdHRlc3RzID0ge1xyXG5cdFx0XHQnc3RlcCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RTdGVwIH0sXHJcblx0XHRcdCdzdGFydCc6IHsgcjogdHJ1ZSwgdDogdGVzdFN0YXJ0IH0sXHJcblx0XHRcdCdjb25uZWN0JzogeyByOiB0cnVlLCB0OiB0ZXN0Q29ubmVjdCB9LFxyXG5cdFx0XHQnZGlyZWN0aW9uJzogeyByOiB0cnVlLCB0OiB0ZXN0RGlyZWN0aW9uIH0sXHJcblx0XHRcdCdzbmFwJzogeyByOiBmYWxzZSwgdDogdGVzdFNuYXAgfSxcclxuXHRcdFx0J2FuaW1hdGUnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0QW5pbWF0ZSB9LFxyXG5cdFx0XHQncmFuZ2UnOiB7IHI6IHRydWUsIHQ6IHRlc3RSYW5nZSB9LFxyXG5cdFx0XHQnb3JpZW50YXRpb24nOiB7IHI6IGZhbHNlLCB0OiB0ZXN0T3JpZW50YXRpb24gfSxcclxuXHRcdFx0J21hcmdpbic6IHsgcjogZmFsc2UsIHQ6IHRlc3RNYXJnaW4gfSxcclxuXHRcdFx0J2xpbWl0JzogeyByOiBmYWxzZSwgdDogdGVzdExpbWl0IH0sXHJcblx0XHRcdCdiZWhhdmlvdXInOiB7IHI6IHRydWUsIHQ6IHRlc3RCZWhhdmlvdXIgfSxcclxuXHRcdFx0J2Zvcm1hdCc6IHsgcjogZmFsc2UsIHQ6IHRlc3RGb3JtYXQgfSxcclxuXHRcdFx0J3Rvb2x0aXBzJzogeyByOiBmYWxzZSwgdDogdGVzdFRvb2x0aXBzIH0sXHJcblx0XHRcdCdjc3NQcmVmaXgnOiB7IHI6IGZhbHNlLCB0OiB0ZXN0Q3NzUHJlZml4IH1cclxuXHRcdH07XHJcblxyXG5cdFx0dmFyIGRlZmF1bHRzID0ge1xyXG5cdFx0XHQnY29ubmVjdCc6IGZhbHNlLFxyXG5cdFx0XHQnZGlyZWN0aW9uJzogJ2x0cicsXHJcblx0XHRcdCdiZWhhdmlvdXInOiAndGFwJyxcclxuXHRcdFx0J29yaWVudGF0aW9uJzogJ2hvcml6b250YWwnXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFJ1biBhbGwgb3B0aW9ucyB0aHJvdWdoIGEgdGVzdGluZyBtZWNoYW5pc20gdG8gZW5zdXJlIGNvcnJlY3RcclxuXHRcdC8vIGlucHV0LiBJdCBzaG91bGQgYmUgbm90ZWQgdGhhdCBvcHRpb25zIG1pZ2h0IGdldCBtb2RpZmllZCB0b1xyXG5cdFx0Ly8gYmUgaGFuZGxlZCBwcm9wZXJseS4gRS5nLiB3cmFwcGluZyBpbnRlZ2VycyBpbiBhcnJheXMuXHJcblx0XHRPYmplY3Qua2V5cyh0ZXN0cykuZm9yRWFjaChmdW5jdGlvbiggbmFtZSApe1xyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIG9wdGlvbiBpc24ndCBzZXQsIGJ1dCBpdCBpcyByZXF1aXJlZCwgdGhyb3cgYW4gZXJyb3IuXHJcblx0XHRcdGlmICggb3B0aW9uc1tuYW1lXSA9PT0gdW5kZWZpbmVkICYmIGRlZmF1bHRzW25hbWVdID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdFx0XHRcdGlmICggdGVzdHNbbmFtZV0uciApIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm5vVWlTbGlkZXI6ICdcIiArIG5hbWUgKyBcIicgaXMgcmVxdWlyZWQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRlc3RzW25hbWVdLnQoIHBhcnNlZCwgb3B0aW9uc1tuYW1lXSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdHNbbmFtZV0gOiBvcHRpb25zW25hbWVdICk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBGb3J3YXJkIHBpcHMgb3B0aW9uc1xyXG5cdFx0cGFyc2VkLnBpcHMgPSBvcHRpb25zLnBpcHM7XHJcblxyXG5cdFx0Ly8gUHJlLWRlZmluZSB0aGUgc3R5bGVzLlxyXG5cdFx0cGFyc2VkLnN0eWxlID0gcGFyc2VkLm9ydCA/ICd0b3AnIDogJ2xlZnQnO1xyXG5cclxuXHRcdHJldHVybiBwYXJzZWQ7XHJcblx0fVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsb3N1cmUgKCB0YXJnZXQsIG9wdGlvbnMgKXtcclxuXHJcblx0Ly8gQWxsIHZhcmlhYmxlcyBsb2NhbCB0byAnY2xvc3VyZScgYXJlIHByZWZpeGVkIHdpdGggJ3Njb3BlXydcclxuXHR2YXIgc2NvcGVfVGFyZ2V0ID0gdGFyZ2V0LFxyXG5cdFx0c2NvcGVfTG9jYXRpb25zID0gWy0xLCAtMV0sXHJcblx0XHRzY29wZV9CYXNlLFxyXG5cdFx0c2NvcGVfSGFuZGxlcyxcclxuXHRcdHNjb3BlX1NwZWN0cnVtID0gb3B0aW9ucy5zcGVjdHJ1bSxcclxuXHRcdHNjb3BlX1ZhbHVlcyA9IFtdLFxyXG5cdFx0c2NvcGVfRXZlbnRzID0ge30sXHJcblx0XHRzY29wZV9TZWxmO1xyXG5cclxuICB2YXIgY3NzQ2xhc3NlcyA9IFtcclxuICAgIC8qICAwICovICAndGFyZ2V0J1xyXG4gICAgLyogIDEgKi8gLCdiYXNlJ1xyXG4gICAgLyogIDIgKi8gLCdvcmlnaW4nXHJcbiAgICAvKiAgMyAqLyAsJ2hhbmRsZSdcclxuICAgIC8qICA0ICovICwnaG9yaXpvbnRhbCdcclxuICAgIC8qICA1ICovICwndmVydGljYWwnXHJcbiAgICAvKiAgNiAqLyAsJ2JhY2tncm91bmQnXHJcbiAgICAvKiAgNyAqLyAsJ2Nvbm5lY3QnXHJcbiAgICAvKiAgOCAqLyAsJ2x0cidcclxuICAgIC8qICA5ICovICwncnRsJ1xyXG4gICAgLyogMTAgKi8gLCdkcmFnZ2FibGUnXHJcbiAgICAvKiAxMSAqLyAsJydcclxuICAgIC8qIDEyICovICwnc3RhdGUtZHJhZydcclxuICAgIC8qIDEzICovICwnJ1xyXG4gICAgLyogMTQgKi8gLCdzdGF0ZS10YXAnXHJcbiAgICAvKiAxNSAqLyAsJ2FjdGl2ZSdcclxuICAgIC8qIDE2ICovICwnJ1xyXG4gICAgLyogMTcgKi8gLCdzdGFja2luZydcclxuICAgIC8qIDE4ICovICwndG9vbHRpcCdcclxuICAgIC8qIDE5ICovICwnJ1xyXG4gICAgLyogMjAgKi8gLCdwaXBzJ1xyXG4gICAgLyogMjEgKi8gLCdtYXJrZXInXHJcbiAgICAvKiAyMiAqLyAsJ3ZhbHVlJ1xyXG4gIF0ubWFwKGFkZENzc1ByZWZpeChvcHRpb25zLmNzc1ByZWZpeCB8fCBkZWZhdWx0Q3NzUHJlZml4KSk7XHJcblxyXG5cclxuXHQvLyBEZWxpbWl0IHByb3Bvc2VkIHZhbHVlcyBmb3IgaGFuZGxlIHBvc2l0aW9ucy5cclxuXHRmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKCBhLCBiLCBkZWxpbWl0ICkge1xyXG5cclxuXHRcdC8vIEFkZCBtb3ZlbWVudCB0byBjdXJyZW50IHBvc2l0aW9uLlxyXG5cdFx0dmFyIGMgPSBhICsgYlswXSwgZCA9IGEgKyBiWzFdO1xyXG5cclxuXHRcdC8vIE9ubHkgYWx0ZXIgdGhlIG90aGVyIHBvc2l0aW9uIG9uIGRyYWcsXHJcblx0XHQvLyBub3Qgb24gc3RhbmRhcmQgc2xpZGluZy5cclxuXHRcdGlmICggZGVsaW1pdCApIHtcclxuXHRcdFx0aWYgKCBjIDwgMCApIHtcclxuXHRcdFx0XHRkICs9IE1hdGguYWJzKGMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICggZCA+IDEwMCApIHtcclxuXHRcdFx0XHRjIC09ICggZCAtIDEwMCApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBMaW1pdCB2YWx1ZXMgdG8gMCBhbmQgMTAwLlxyXG5cdFx0XHRyZXR1cm4gW2xpbWl0KGMpLCBsaW1pdChkKV07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFtjLGRdO1xyXG5cdH1cclxuXHJcblx0Ly8gUHJvdmlkZSBhIGNsZWFuIGV2ZW50IHdpdGggc3RhbmRhcmRpemVkIG9mZnNldCB2YWx1ZXMuXHJcblx0ZnVuY3Rpb24gZml4RXZlbnQgKCBlLCBwYWdlT2Zmc2V0ICkge1xyXG5cclxuXHRcdC8vIFByZXZlbnQgc2Nyb2xsaW5nIGFuZCBwYW5uaW5nIG9uIHRvdWNoIGV2ZW50cywgd2hpbGVcclxuXHRcdC8vIGF0dGVtcHRpbmcgdG8gc2xpZGUuIFRoZSB0YXAgZXZlbnQgYWxzbyBkZXBlbmRzIG9uIHRoaXMuXHJcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0Ly8gRmlsdGVyIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgdHlwZSwgd2hpY2ggY2FuIGJlXHJcblx0XHQvLyB0b3VjaCwgbW91c2Ugb3IgcG9pbnRlci4gT2Zmc2V0IGNoYW5nZXMgbmVlZCB0byBiZVxyXG5cdFx0Ly8gbWFkZSBvbiBhbiBldmVudCBzcGVjaWZpYyBiYXNpcy5cclxuXHRcdHZhciB0b3VjaCA9IGUudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwLFxyXG5cdFx0XHRtb3VzZSA9IGUudHlwZS5pbmRleE9mKCdtb3VzZScpID09PSAwLFxyXG5cdFx0XHRwb2ludGVyID0gZS50eXBlLmluZGV4T2YoJ3BvaW50ZXInKSA9PT0gMCxcclxuXHRcdFx0eCx5LCBldmVudCA9IGU7XHJcblxyXG5cdFx0Ly8gSUUxMCBpbXBsZW1lbnRlZCBwb2ludGVyIGV2ZW50cyB3aXRoIGEgcHJlZml4O1xyXG5cdFx0aWYgKCBlLnR5cGUuaW5kZXhPZignTVNQb2ludGVyJykgPT09IDAgKSB7XHJcblx0XHRcdHBvaW50ZXIgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggdG91Y2ggKSB7XHJcblx0XHRcdC8vIG5vVWlTbGlkZXIgc3VwcG9ydHMgb25lIG1vdmVtZW50IGF0IGEgdGltZSxcclxuXHRcdFx0Ly8gc28gd2UgY2FuIHNlbGVjdCB0aGUgZmlyc3QgJ2NoYW5nZWRUb3VjaCcuXHJcblx0XHRcdHggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYO1xyXG5cdFx0XHR5ID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWTtcclxuXHRcdH1cclxuXHJcblx0XHRwYWdlT2Zmc2V0ID0gcGFnZU9mZnNldCB8fCBnZXRQYWdlT2Zmc2V0KCk7XHJcblxyXG5cdFx0aWYgKCBtb3VzZSB8fCBwb2ludGVyICkge1xyXG5cdFx0XHR4ID0gZS5jbGllbnRYICsgcGFnZU9mZnNldC54O1xyXG5cdFx0XHR5ID0gZS5jbGllbnRZICsgcGFnZU9mZnNldC55O1xyXG5cdFx0fVxyXG5cclxuXHRcdGV2ZW50LnBhZ2VPZmZzZXQgPSBwYWdlT2Zmc2V0O1xyXG5cdFx0ZXZlbnQucG9pbnRzID0gW3gsIHldO1xyXG5cdFx0ZXZlbnQuY3Vyc29yID0gbW91c2UgfHwgcG9pbnRlcjsgLy8gRml4ICM0MzVcclxuXHJcblx0XHRyZXR1cm4gZXZlbnQ7XHJcblx0fVxyXG5cclxuXHQvLyBBcHBlbmQgYSBoYW5kbGUgdG8gdGhlIGJhc2UuXHJcblx0ZnVuY3Rpb24gYWRkSGFuZGxlICggZGlyZWN0aW9uLCBpbmRleCApIHtcclxuXHJcblx0XHR2YXIgb3JpZ2luID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRhZGRpdGlvbnMgPSBbICctbG93ZXInLCAnLXVwcGVyJyBdO1xyXG5cclxuXHRcdGlmICggZGlyZWN0aW9uICkge1xyXG5cdFx0XHRhZGRpdGlvbnMucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGFkZENsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1szXSk7XHJcblx0XHRhZGRDbGFzcyhoYW5kbGUsIGNzc0NsYXNzZXNbM10gKyBhZGRpdGlvbnNbaW5kZXhdKTtcclxuXHJcblx0XHRhZGRDbGFzcyhvcmlnaW4sIGNzc0NsYXNzZXNbMl0pO1xyXG5cdFx0b3JpZ2luLmFwcGVuZENoaWxkKGhhbmRsZSk7XHJcblxyXG5cdFx0cmV0dXJuIG9yaWdpbjtcclxuXHR9XHJcblxyXG5cdC8vIEFkZCB0aGUgcHJvcGVyIGNvbm5lY3Rpb24gY2xhc3Nlcy5cclxuXHRmdW5jdGlvbiBhZGRDb25uZWN0aW9uICggY29ubmVjdCwgdGFyZ2V0LCBoYW5kbGVzICkge1xyXG5cclxuXHRcdC8vIEFwcGx5IHRoZSByZXF1aXJlZCBjb25uZWN0aW9uIGNsYXNzZXMgdG8gdGhlIGVsZW1lbnRzXHJcblx0XHQvLyB0aGF0IG5lZWQgdGhlbS4gU29tZSBjbGFzc2VzIGFyZSBtYWRlIHVwIGZvciBzZXZlcmFsXHJcblx0XHQvLyBzZWdtZW50cyBsaXN0ZWQgaW4gdGhlIGNsYXNzIGxpc3QsIHRvIGFsbG93IGVhc3lcclxuXHRcdC8vIHJlbmFtaW5nIGFuZCBwcm92aWRlIGEgbWlub3IgY29tcHJlc3Npb24gYmVuZWZpdC5cclxuXHRcdHN3aXRjaCAoIGNvbm5lY3QgKSB7XHJcblx0XHRcdGNhc2UgMTpcdGFkZENsYXNzKHRhcmdldCwgY3NzQ2xhc3Nlc1s3XSk7XHJcblx0XHRcdFx0XHRhZGRDbGFzcyhoYW5kbGVzWzBdLCBjc3NDbGFzc2VzWzZdKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIDM6IGFkZENsYXNzKGhhbmRsZXNbMV0sIGNzc0NsYXNzZXNbNl0pO1xyXG5cdFx0XHRcdFx0LyogZmFsbHMgdGhyb3VnaCAqL1xyXG5cdFx0XHRjYXNlIDI6IGFkZENsYXNzKGhhbmRsZXNbMF0sIGNzc0NsYXNzZXNbN10pO1xyXG5cdFx0XHRcdFx0LyogZmFsbHMgdGhyb3VnaCAqL1xyXG5cdFx0XHRjYXNlIDA6IGFkZENsYXNzKHRhcmdldCwgY3NzQ2xhc3Nlc1s2XSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIEFkZCBoYW5kbGVzIHRvIHRoZSBzbGlkZXIgYmFzZS5cclxuXHRmdW5jdGlvbiBhZGRIYW5kbGVzICggbnJIYW5kbGVzLCBkaXJlY3Rpb24sIGJhc2UgKSB7XHJcblxyXG5cdFx0dmFyIGluZGV4LCBoYW5kbGVzID0gW107XHJcblxyXG5cdFx0Ly8gQXBwZW5kIGhhbmRsZXMuXHJcblx0XHRmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgbnJIYW5kbGVzOyBpbmRleCArPSAxICkge1xyXG5cclxuXHRcdFx0Ly8gS2VlcCBhIGxpc3Qgb2YgYWxsIGFkZGVkIGhhbmRsZXMuXHJcblx0XHRcdGhhbmRsZXMucHVzaCggYmFzZS5hcHBlbmRDaGlsZChhZGRIYW5kbGUoIGRpcmVjdGlvbiwgaW5kZXggKSkgKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlcztcclxuXHR9XHJcblxyXG5cdC8vIEluaXRpYWxpemUgYSBzaW5nbGUgc2xpZGVyLlxyXG5cdGZ1bmN0aW9uIGFkZFNsaWRlciAoIGRpcmVjdGlvbiwgb3JpZW50YXRpb24sIHRhcmdldCApIHtcclxuXHJcblx0XHQvLyBBcHBseSBjbGFzc2VzIGFuZCBkYXRhIHRvIHRoZSB0YXJnZXQuXHJcblx0XHRhZGRDbGFzcyh0YXJnZXQsIGNzc0NsYXNzZXNbMF0pO1xyXG5cdFx0YWRkQ2xhc3ModGFyZ2V0LCBjc3NDbGFzc2VzWzggKyBkaXJlY3Rpb25dKTtcclxuXHRcdGFkZENsYXNzKHRhcmdldCwgY3NzQ2xhc3Nlc1s0ICsgb3JpZW50YXRpb25dKTtcclxuXHJcblx0XHR2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0XHRhZGRDbGFzcyhkaXYsIGNzc0NsYXNzZXNbMV0pO1xyXG5cdFx0dGFyZ2V0LmFwcGVuZENoaWxkKGRpdik7XHJcblx0XHRyZXR1cm4gZGl2O1xyXG5cdH1cclxuXHJcblxyXG5cdGZ1bmN0aW9uIGFkZFRvb2x0aXAgKCBoYW5kbGUsIGluZGV4ICkge1xyXG5cclxuXHRcdGlmICggIW9wdGlvbnMudG9vbHRpcHNbaW5kZXhdICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gY3NzQ2xhc3Nlc1sxOF07XHJcblx0XHRyZXR1cm4gaGFuZGxlLmZpcnN0Q2hpbGQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcblx0fVxyXG5cclxuXHQvLyBUaGUgdG9vbHRpcHMgb3B0aW9uIGlzIGEgc2hvcnRoYW5kIGZvciB1c2luZyB0aGUgJ3VwZGF0ZScgZXZlbnQuXHJcblx0ZnVuY3Rpb24gdG9vbHRpcHMgKCApIHtcclxuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICkge1xyXG5cdFx0XHRvcHRpb25zLnRvb2x0aXBzLnJldmVyc2UoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUb29sdGlwcyBhcmUgYWRkZWQgd2l0aCBvcHRpb25zLnRvb2x0aXBzIGluIG9yaWdpbmFsIG9yZGVyLlxyXG5cdFx0dmFyIHRpcHMgPSBzY29wZV9IYW5kbGVzLm1hcChhZGRUb29sdGlwKTtcclxuXHJcblx0XHRpZiAoIG9wdGlvbnMuZGlyICkge1xyXG5cdFx0XHR0aXBzLnJldmVyc2UoKTtcclxuXHRcdFx0b3B0aW9ucy50b29sdGlwcy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0YmluZEV2ZW50KCd1cGRhdGUnLCBmdW5jdGlvbihmLCBvLCByKSB7XHJcblx0XHRcdGlmICggdGlwc1tvXSApIHtcclxuXHRcdFx0XHR0aXBzW29dLmlubmVySFRNTCA9IG9wdGlvbnMudG9vbHRpcHNbb10gPT09IHRydWUgPyBmW29dIDogb3B0aW9ucy50b29sdGlwc1tvXS50byhyW29dKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gZ2V0R3JvdXAgKCBtb2RlLCB2YWx1ZXMsIHN0ZXBwZWQgKSB7XHJcblxyXG5cdFx0Ly8gVXNlIHRoZSByYW5nZS5cclxuXHRcdGlmICggbW9kZSA9PT0gJ3JhbmdlJyB8fCBtb2RlID09PSAnc3RlcHMnICkge1xyXG5cdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0ueFZhbDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIG1vZGUgPT09ICdjb3VudCcgKSB7XHJcblxyXG5cdFx0XHQvLyBEaXZpZGUgMCAtIDEwMCBpbiAnY291bnQnIHBhcnRzLlxyXG5cdFx0XHR2YXIgc3ByZWFkID0gKCAxMDAgLyAodmFsdWVzLTEpICksIHYsIGkgPSAwO1xyXG5cdFx0XHR2YWx1ZXMgPSBbXTtcclxuXHJcblx0XHRcdC8vIExpc3QgdGhlc2UgcGFydHMgYW5kIGhhdmUgdGhlbSBoYW5kbGVkIGFzICdwb3NpdGlvbnMnLlxyXG5cdFx0XHR3aGlsZSAoKHY9aSsrKnNwcmVhZCkgPD0gMTAwICkge1xyXG5cdFx0XHRcdHZhbHVlcy5wdXNoKHYpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRtb2RlID0gJ3Bvc2l0aW9ucyc7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBtb2RlID09PSAncG9zaXRpb25zJyApIHtcclxuXHJcblx0XHRcdC8vIE1hcCBhbGwgcGVyY2VudGFnZXMgdG8gb24tcmFuZ2UgdmFsdWVzLlxyXG5cdFx0XHRyZXR1cm4gdmFsdWVzLm1hcChmdW5jdGlvbiggdmFsdWUgKXtcclxuXHRcdFx0XHRyZXR1cm4gc2NvcGVfU3BlY3RydW0uZnJvbVN0ZXBwaW5nKCBzdGVwcGVkID8gc2NvcGVfU3BlY3RydW0uZ2V0U3RlcCggdmFsdWUgKSA6IHZhbHVlICk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggbW9kZSA9PT0gJ3ZhbHVlcycgKSB7XHJcblxyXG5cdFx0XHQvLyBJZiB0aGUgdmFsdWUgbXVzdCBiZSBzdGVwcGVkLCBpdCBuZWVkcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBwZXJjZW50YWdlIGZpcnN0LlxyXG5cdFx0XHRpZiAoIHN0ZXBwZWQgKSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZXMubWFwKGZ1bmN0aW9uKCB2YWx1ZSApe1xyXG5cclxuXHRcdFx0XHRcdC8vIENvbnZlcnQgdG8gcGVyY2VudGFnZSwgYXBwbHkgc3RlcCwgcmV0dXJuIHRvIHZhbHVlLlxyXG5cdFx0XHRcdFx0cmV0dXJuIHNjb3BlX1NwZWN0cnVtLmZyb21TdGVwcGluZyggc2NvcGVfU3BlY3RydW0uZ2V0U3RlcCggc2NvcGVfU3BlY3RydW0udG9TdGVwcGluZyggdmFsdWUgKSApICk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBPdGhlcndpc2UsIHdlIGNhbiBzaW1wbHkgdXNlIHRoZSB2YWx1ZXMuXHJcblx0XHRcdHJldHVybiB2YWx1ZXM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZW5lcmF0ZVNwcmVhZCAoIGRlbnNpdHksIG1vZGUsIGdyb3VwICkge1xyXG5cclxuXHRcdGZ1bmN0aW9uIHNhZmVJbmNyZW1lbnQodmFsdWUsIGluY3JlbWVudCkge1xyXG5cdFx0XHQvLyBBdm9pZCBmbG9hdGluZyBwb2ludCB2YXJpYW5jZSBieSBkcm9wcGluZyB0aGUgc21hbGxlc3QgZGVjaW1hbCBwbGFjZXMuXHJcblx0XHRcdHJldHVybiAodmFsdWUgKyBpbmNyZW1lbnQpLnRvRml4ZWQoNykgLyAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBvcmlnaW5hbFNwZWN0cnVtRGlyZWN0aW9uID0gc2NvcGVfU3BlY3RydW0uZGlyZWN0aW9uLFxyXG5cdFx0XHRpbmRleGVzID0ge30sXHJcblx0XHRcdGZpcnN0SW5SYW5nZSA9IHNjb3BlX1NwZWN0cnVtLnhWYWxbMF0sXHJcblx0XHRcdGxhc3RJblJhbmdlID0gc2NvcGVfU3BlY3RydW0ueFZhbFtzY29wZV9TcGVjdHJ1bS54VmFsLmxlbmd0aC0xXSxcclxuXHRcdFx0aWdub3JlRmlyc3QgPSBmYWxzZSxcclxuXHRcdFx0aWdub3JlTGFzdCA9IGZhbHNlLFxyXG5cdFx0XHRwcmV2UGN0ID0gMDtcclxuXHJcblx0XHQvLyBUaGlzIGZ1bmN0aW9uIGxvb3BzIHRoZSBzcGVjdHJ1bSBpbiBhbiBsdHIgbGluZWFyIGZhc2hpb24sXHJcblx0XHQvLyB3aGlsZSB0aGUgdG9TdGVwcGluZyBtZXRob2QgaXMgZGlyZWN0aW9uIGF3YXJlLiBUcmljayBpdCBpbnRvXHJcblx0XHQvLyBiZWxpZXZpbmcgaXQgaXMgbHRyLlxyXG5cdFx0c2NvcGVfU3BlY3RydW0uZGlyZWN0aW9uID0gMDtcclxuXHJcblx0XHQvLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBncm91cCwgc29ydCBpdCBhbmQgZmlsdGVyIGF3YXkgYWxsIGR1cGxpY2F0ZXMuXHJcblx0XHRncm91cCA9IHVuaXF1ZShncm91cC5zbGljZSgpLnNvcnQoZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSkpO1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgcmFuZ2Ugc3RhcnRzIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQuXHJcblx0XHRpZiAoIGdyb3VwWzBdICE9PSBmaXJzdEluUmFuZ2UgKSB7XHJcblx0XHRcdGdyb3VwLnVuc2hpZnQoZmlyc3RJblJhbmdlKTtcclxuXHRcdFx0aWdub3JlRmlyc3QgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIExpa2V3aXNlIGZvciB0aGUgbGFzdCBvbmUuXHJcblx0XHRpZiAoIGdyb3VwW2dyb3VwLmxlbmd0aCAtIDFdICE9PSBsYXN0SW5SYW5nZSApIHtcclxuXHRcdFx0Z3JvdXAucHVzaChsYXN0SW5SYW5nZSk7XHJcblx0XHRcdGlnbm9yZUxhc3QgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGdyb3VwLmZvckVhY2goZnVuY3Rpb24gKCBjdXJyZW50LCBpbmRleCApIHtcclxuXHJcblx0XHRcdC8vIEdldCB0aGUgY3VycmVudCBzdGVwIGFuZCB0aGUgbG93ZXIgKyB1cHBlciBwb3NpdGlvbnMuXHJcblx0XHRcdHZhciBzdGVwLCBpLCBxLFxyXG5cdFx0XHRcdGxvdyA9IGN1cnJlbnQsXHJcblx0XHRcdFx0aGlnaCA9IGdyb3VwW2luZGV4KzFdLFxyXG5cdFx0XHRcdG5ld1BjdCwgcGN0RGlmZmVyZW5jZSwgcGN0UG9zLCB0eXBlLFxyXG5cdFx0XHRcdHN0ZXBzLCByZWFsU3RlcHMsIHN0ZXBzaXplO1xyXG5cclxuXHRcdFx0Ly8gV2hlbiB1c2luZyAnc3RlcHMnIG1vZGUsIHVzZSB0aGUgcHJvdmlkZWQgc3RlcHMuXHJcblx0XHRcdC8vIE90aGVyd2lzZSwgd2UnbGwgc3RlcCBvbiB0byB0aGUgbmV4dCBzdWJyYW5nZS5cclxuXHRcdFx0aWYgKCBtb2RlID09PSAnc3RlcHMnICkge1xyXG5cdFx0XHRcdHN0ZXAgPSBzY29wZV9TcGVjdHJ1bS54TnVtU3RlcHNbIGluZGV4IF07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIERlZmF1bHQgdG8gYSAnZnVsbCcgc3RlcC5cclxuXHRcdFx0aWYgKCAhc3RlcCApIHtcclxuXHRcdFx0XHRzdGVwID0gaGlnaC1sb3c7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIExvdyBjYW4gYmUgMCwgc28gdGVzdCBmb3IgZmFsc2UuIElmIGhpZ2ggaXMgdW5kZWZpbmVkLFxyXG5cdFx0XHQvLyB3ZSBhcmUgYXQgdGhlIGxhc3Qgc3VicmFuZ2UuIEluZGV4IDAgaXMgYWxyZWFkeSBoYW5kbGVkLlxyXG5cdFx0XHRpZiAoIGxvdyA9PT0gZmFsc2UgfHwgaGlnaCA9PT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gRmluZCBhbGwgc3RlcHMgaW4gdGhlIHN1YnJhbmdlLlxyXG5cdFx0XHRmb3IgKCBpID0gbG93OyBpIDw9IGhpZ2g7IGkgPSBzYWZlSW5jcmVtZW50KGksIHN0ZXApICkge1xyXG5cclxuXHRcdFx0XHQvLyBHZXQgdGhlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIHRoZSBjdXJyZW50IHN0ZXAsXHJcblx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBzaXplIGZvciB0aGUgc3VicmFuZ2UuXHJcblx0XHRcdFx0bmV3UGN0ID0gc2NvcGVfU3BlY3RydW0udG9TdGVwcGluZyggaSApO1xyXG5cdFx0XHRcdHBjdERpZmZlcmVuY2UgPSBuZXdQY3QgLSBwcmV2UGN0O1xyXG5cclxuXHRcdFx0XHRzdGVwcyA9IHBjdERpZmZlcmVuY2UgLyBkZW5zaXR5O1xyXG5cdFx0XHRcdHJlYWxTdGVwcyA9IE1hdGgucm91bmQoc3RlcHMpO1xyXG5cclxuXHRcdFx0XHQvLyBUaGlzIHJhdGlvIHJlcHJlc2VudHMgdGhlIGFtbW91bnQgb2YgcGVyY2VudGFnZS1zcGFjZSBhIHBvaW50IGluZGljYXRlcy5cclxuXHRcdFx0XHQvLyBGb3IgYSBkZW5zaXR5IDEgdGhlIHBvaW50cy9wZXJjZW50YWdlID0gMS4gRm9yIGRlbnNpdHkgMiwgdGhhdCBwZXJjZW50YWdlIG5lZWRzIHRvIGJlIHJlLWRldmlkZWQuXHJcblx0XHRcdFx0Ly8gUm91bmQgdGhlIHBlcmNlbnRhZ2Ugb2Zmc2V0IHRvIGFuIGV2ZW4gbnVtYmVyLCB0aGVuIGRpdmlkZSBieSB0d29cclxuXHRcdFx0XHQvLyB0byBzcHJlYWQgdGhlIG9mZnNldCBvbiBib3RoIHNpZGVzIG9mIHRoZSByYW5nZS5cclxuXHRcdFx0XHRzdGVwc2l6ZSA9IHBjdERpZmZlcmVuY2UvcmVhbFN0ZXBzO1xyXG5cclxuXHRcdFx0XHQvLyBEaXZpZGUgYWxsIHBvaW50cyBldmVubHksIGFkZGluZyB0aGUgY29ycmVjdCBudW1iZXIgdG8gdGhpcyBzdWJyYW5nZS5cclxuXHRcdFx0XHQvLyBSdW4gdXAgdG8gPD0gc28gdGhhdCAxMDAlIGdldHMgYSBwb2ludCwgZXZlbnQgaWYgaWdub3JlTGFzdCBpcyBzZXQuXHJcblx0XHRcdFx0Zm9yICggcSA9IDE7IHEgPD0gcmVhbFN0ZXBzOyBxICs9IDEgKSB7XHJcblxyXG5cdFx0XHRcdFx0Ly8gVGhlIHJhdGlvIGJldHdlZW4gdGhlIHJvdW5kZWQgdmFsdWUgYW5kIHRoZSBhY3R1YWwgc2l6ZSBtaWdodCBiZSB+MSUgb2ZmLlxyXG5cdFx0XHRcdFx0Ly8gQ29ycmVjdCB0aGUgcGVyY2VudGFnZSBvZmZzZXQgYnkgdGhlIG51bWJlciBvZiBwb2ludHNcclxuXHRcdFx0XHRcdC8vIHBlciBzdWJyYW5nZS4gZGVuc2l0eSA9IDEgd2lsbCByZXN1bHQgaW4gMTAwIHBvaW50cyBvbiB0aGVcclxuXHRcdFx0XHRcdC8vIGZ1bGwgcmFuZ2UsIDIgZm9yIDUwLCA0IGZvciAyNSwgZXRjLlxyXG5cdFx0XHRcdFx0cGN0UG9zID0gcHJldlBjdCArICggcSAqIHN0ZXBzaXplICk7XHJcblx0XHRcdFx0XHRpbmRleGVzW3BjdFBvcy50b0ZpeGVkKDUpXSA9IFsneCcsIDBdO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gRGV0ZXJtaW5lIHRoZSBwb2ludCB0eXBlLlxyXG5cdFx0XHRcdHR5cGUgPSAoZ3JvdXAuaW5kZXhPZihpKSA+IC0xKSA/IDEgOiAoIG1vZGUgPT09ICdzdGVwcycgPyAyIDogMCApO1xyXG5cclxuXHRcdFx0XHQvLyBFbmZvcmNlIHRoZSAnaWdub3JlRmlyc3QnIG9wdGlvbiBieSBvdmVyd3JpdGluZyB0aGUgdHlwZSBmb3IgMC5cclxuXHRcdFx0XHRpZiAoICFpbmRleCAmJiBpZ25vcmVGaXJzdCApIHtcclxuXHRcdFx0XHRcdHR5cGUgPSAwO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKCAhKGkgPT09IGhpZ2ggJiYgaWdub3JlTGFzdCkpIHtcclxuXHRcdFx0XHRcdC8vIE1hcmsgdGhlICd0eXBlJyBvZiB0aGlzIHBvaW50LiAwID0gcGxhaW4sIDEgPSByZWFsIHZhbHVlLCAyID0gc3RlcCB2YWx1ZS5cclxuXHRcdFx0XHRcdGluZGV4ZXNbbmV3UGN0LnRvRml4ZWQoNSldID0gW2ksIHR5cGVdO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBwZXJjZW50YWdlIGNvdW50LlxyXG5cdFx0XHRcdHByZXZQY3QgPSBuZXdQY3Q7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJlc2V0IHRoZSBzcGVjdHJ1bS5cclxuXHRcdHNjb3BlX1NwZWN0cnVtLmRpcmVjdGlvbiA9IG9yaWdpbmFsU3BlY3RydW1EaXJlY3Rpb247XHJcblxyXG5cdFx0cmV0dXJuIGluZGV4ZXM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRNYXJraW5nICggc3ByZWFkLCBmaWx0ZXJGdW5jLCBmb3JtYXR0ZXIgKSB7XHJcblxyXG5cdFx0dmFyIHN0eWxlID0gWydob3Jpem9udGFsJywgJ3ZlcnRpY2FsJ11bb3B0aW9ucy5vcnRdLFxyXG5cdFx0XHRlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0YWRkQ2xhc3MoZWxlbWVudCwgY3NzQ2xhc3Nlc1syMF0pO1xyXG5cdFx0YWRkQ2xhc3MoZWxlbWVudCwgY3NzQ2xhc3Nlc1syMF0gKyAnLScgKyBzdHlsZSk7XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0U2l6ZSggdHlwZSApe1xyXG5cdFx0XHRyZXR1cm4gWyAnLW5vcm1hbCcsICctbGFyZ2UnLCAnLXN1YicgXVt0eXBlXTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBnZXRUYWdzKCBvZmZzZXQsIHNvdXJjZSwgdmFsdWVzICkge1xyXG5cdFx0XHRyZXR1cm4gJ2NsYXNzPVwiJyArIHNvdXJjZSArICcgJyArXHJcblx0XHRcdFx0c291cmNlICsgJy0nICsgc3R5bGUgKyAnICcgK1xyXG5cdFx0XHRcdHNvdXJjZSArIGdldFNpemUodmFsdWVzWzFdKSArXHJcblx0XHRcdFx0J1wiIHN0eWxlPVwiJyArIG9wdGlvbnMuc3R5bGUgKyAnOiAnICsgb2Zmc2V0ICsgJyVcIic7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWRkU3ByZWFkICggb2Zmc2V0LCB2YWx1ZXMgKXtcclxuXHJcblx0XHRcdGlmICggc2NvcGVfU3BlY3RydW0uZGlyZWN0aW9uICkge1xyXG5cdFx0XHRcdG9mZnNldCA9IDEwMCAtIG9mZnNldDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gQXBwbHkgdGhlIGZpbHRlciBmdW5jdGlvbiwgaWYgaXQgaXMgc2V0LlxyXG5cdFx0XHR2YWx1ZXNbMV0gPSAodmFsdWVzWzFdICYmIGZpbHRlckZ1bmMpID8gZmlsdGVyRnVuYyh2YWx1ZXNbMF0sIHZhbHVlc1sxXSkgOiB2YWx1ZXNbMV07XHJcblxyXG5cdFx0XHQvLyBBZGQgYSBtYXJrZXIgZm9yIGV2ZXJ5IHBvaW50XHJcblx0XHRcdGVsZW1lbnQuaW5uZXJIVE1MICs9ICc8ZGl2ICcgKyBnZXRUYWdzKG9mZnNldCwgY3NzQ2xhc3Nlc1syMV0sIHZhbHVlcykgKyAnPjwvZGl2Pic7XHJcblxyXG5cdFx0XHQvLyBWYWx1ZXMgYXJlIG9ubHkgYXBwZW5kZWQgZm9yIHBvaW50cyBtYXJrZWQgJzEnIG9yICcyJy5cclxuXHRcdFx0aWYgKCB2YWx1ZXNbMV0gKSB7XHJcblx0XHRcdFx0ZWxlbWVudC5pbm5lckhUTUwgKz0gJzxkaXYgJytnZXRUYWdzKG9mZnNldCwgY3NzQ2xhc3Nlc1syMl0sIHZhbHVlcykrJz4nICsgZm9ybWF0dGVyLnRvKHZhbHVlc1swXSkgKyAnPC9kaXY+JztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEFwcGVuZCBhbGwgcG9pbnRzLlxyXG5cdFx0T2JqZWN0LmtleXMoc3ByZWFkKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe1xyXG5cdFx0XHRhZGRTcHJlYWQoYSwgc3ByZWFkW2FdKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBlbGVtZW50O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGlwcyAoIGdyaWQgKSB7XHJcblxyXG5cdHZhciBtb2RlID0gZ3JpZC5tb2RlLFxyXG5cdFx0ZGVuc2l0eSA9IGdyaWQuZGVuc2l0eSB8fCAxLFxyXG5cdFx0ZmlsdGVyID0gZ3JpZC5maWx0ZXIgfHwgZmFsc2UsXHJcblx0XHR2YWx1ZXMgPSBncmlkLnZhbHVlcyB8fCBmYWxzZSxcclxuXHRcdHN0ZXBwZWQgPSBncmlkLnN0ZXBwZWQgfHwgZmFsc2UsXHJcblx0XHRncm91cCA9IGdldEdyb3VwKCBtb2RlLCB2YWx1ZXMsIHN0ZXBwZWQgKSxcclxuXHRcdHNwcmVhZCA9IGdlbmVyYXRlU3ByZWFkKCBkZW5zaXR5LCBtb2RlLCBncm91cCApLFxyXG5cdFx0Zm9ybWF0ID0gZ3JpZC5mb3JtYXQgfHwge1xyXG5cdFx0XHR0bzogTWF0aC5yb3VuZFxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gc2NvcGVfVGFyZ2V0LmFwcGVuZENoaWxkKGFkZE1hcmtpbmcoXHJcblx0XHRcdHNwcmVhZCxcclxuXHRcdFx0ZmlsdGVyLFxyXG5cdFx0XHRmb3JtYXRcclxuXHRcdCkpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIFNob3J0aGFuZCBmb3IgYmFzZSBkaW1lbnNpb25zLlxyXG5cdGZ1bmN0aW9uIGJhc2VTaXplICggKSB7XHJcblx0XHRyZXR1cm4gc2NvcGVfQmFzZVsnb2Zmc2V0JyArIFsnV2lkdGgnLCAnSGVpZ2h0J11bb3B0aW9ucy5vcnRdXTtcclxuXHR9XHJcblxyXG5cdC8vIEV4dGVybmFsIGV2ZW50IGhhbmRsaW5nXHJcblx0ZnVuY3Rpb24gZmlyZUV2ZW50ICggZXZlbnQsIGhhbmRsZU51bWJlciwgdGFwICkge1xyXG5cclxuXHRcdGlmICggaGFuZGxlTnVtYmVyICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5oYW5kbGVzICE9PSAxICkge1xyXG5cdFx0XHRoYW5kbGVOdW1iZXIgPSBNYXRoLmFicyhoYW5kbGVOdW1iZXIgLSBvcHRpb25zLmRpcik7XHJcblx0XHR9XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCB0YXJnZXRFdmVudCApIHtcclxuXHJcblx0XHRcdHZhciBldmVudFR5cGUgPSB0YXJnZXRFdmVudC5zcGxpdCgnLicpWzBdO1xyXG5cclxuXHRcdFx0aWYgKCBldmVudCA9PT0gZXZlbnRUeXBlICkge1xyXG5cdFx0XHRcdHNjb3BlX0V2ZW50c1t0YXJnZXRFdmVudF0uZm9yRWFjaChmdW5jdGlvbiggY2FsbGJhY2sgKSB7XHJcblx0XHRcdFx0XHQvLyAucmV2ZXJzZSBpcyBpbiBwbGFjZVxyXG5cdFx0XHRcdFx0Ly8gUmV0dXJuIHZhbHVlcyBhcyBhcnJheSwgc28gYXJnXzFbYXJnXzJdIGlzIGFsd2F5cyB2YWxpZC5cclxuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoc2NvcGVfU2VsZiwgYXNBcnJheSh2YWx1ZUdldCgpKSwgaGFuZGxlTnVtYmVyLCBhc0FycmF5KGluU2xpZGVyT3JkZXIoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoc2NvcGVfVmFsdWVzKSkpLCB0YXAgfHwgZmFsc2UpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIFJldHVybnMgdGhlIGlucHV0IGFycmF5LCByZXNwZWN0aW5nIHRoZSBzbGlkZXIgZGlyZWN0aW9uIGNvbmZpZ3VyYXRpb24uXHJcblx0ZnVuY3Rpb24gaW5TbGlkZXJPcmRlciAoIHZhbHVlcyApIHtcclxuXHJcblx0XHQvLyBJZiBvbmx5IG9uZSBoYW5kbGUgaXMgdXNlZCwgcmV0dXJuIGEgc2luZ2xlIHZhbHVlLlxyXG5cdFx0aWYgKCB2YWx1ZXMubGVuZ3RoID09PSAxICl7XHJcblx0XHRcdHJldHVybiB2YWx1ZXNbMF07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBvcHRpb25zLmRpciApIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlcy5yZXZlcnNlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlcztcclxuXHR9XHJcblxyXG5cclxuXHQvLyBIYW5kbGVyIGZvciBhdHRhY2hpbmcgZXZlbnRzIHRyb3VnaCBhIHByb3h5LlxyXG5cdGZ1bmN0aW9uIGF0dGFjaCAoIGV2ZW50cywgZWxlbWVudCwgY2FsbGJhY2ssIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byAnZmlsdGVyJyBldmVudHMgdG8gdGhlIHNsaWRlci5cclxuXHRcdC8vIGVsZW1lbnQgaXMgYSBub2RlLCBub3QgYSBub2RlTGlzdFxyXG5cclxuXHRcdHZhciBtZXRob2QgPSBmdW5jdGlvbiAoIGUgKXtcclxuXHJcblx0XHRcdGlmICggc2NvcGVfVGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIFN0b3AgaWYgYW4gYWN0aXZlICd0YXAnIHRyYW5zaXRpb24gaXMgdGFraW5nIHBsYWNlLlxyXG5cdFx0XHRpZiAoIGhhc0NsYXNzKHNjb3BlX1RhcmdldCwgY3NzQ2xhc3Nlc1sxNF0pICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZSA9IGZpeEV2ZW50KGUsIGRhdGEucGFnZU9mZnNldCk7XHJcblxyXG5cdFx0XHQvLyBJZ25vcmUgcmlnaHQgb3IgbWlkZGxlIGNsaWNrcyBvbiBzdGFydCAjNDU0XHJcblx0XHRcdGlmICggZXZlbnRzID09PSBhY3Rpb25zLnN0YXJ0ICYmIGUuYnV0dG9ucyAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9ucyA+IDEgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBJZ25vcmUgcmlnaHQgb3IgbWlkZGxlIGNsaWNrcyBvbiBzdGFydCAjNDU0XHJcblx0XHRcdGlmICggZGF0YS5ob3ZlciAmJiBlLmJ1dHRvbnMgKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlLmNhbGNQb2ludCA9IGUucG9pbnRzWyBvcHRpb25zLm9ydCBdO1xyXG5cclxuXHRcdFx0Ly8gQ2FsbCB0aGUgZXZlbnQgaGFuZGxlciB3aXRoIHRoZSBldmVudCBbIGFuZCBhZGRpdGlvbmFsIGRhdGEgXS5cclxuXHRcdFx0Y2FsbGJhY2sgKCBlLCBkYXRhICk7XHJcblxyXG5cdFx0fSwgbWV0aG9kcyA9IFtdO1xyXG5cclxuXHRcdC8vIEJpbmQgYSBjbG9zdXJlIG9uIHRoZSB0YXJnZXQgZm9yIGV2ZXJ5IGV2ZW50IHR5cGUuXHJcblx0XHRldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uKCBldmVudE5hbWUgKXtcclxuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbWV0aG9kLCBmYWxzZSk7XHJcblx0XHRcdG1ldGhvZHMucHVzaChbZXZlbnROYW1lLCBtZXRob2RdKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBtZXRob2RzO1xyXG5cdH1cclxuXHJcblx0Ly8gSGFuZGxlIG1vdmVtZW50IG9uIGRvY3VtZW50IGZvciBoYW5kbGUgYW5kIHJhbmdlIGRyYWcuXHJcblx0ZnVuY3Rpb24gbW92ZSAoIGV2ZW50LCBkYXRhICkge1xyXG5cclxuXHRcdC8vIEZpeCAjNDk4XHJcblx0XHQvLyBDaGVjayB2YWx1ZSBvZiAuYnV0dG9ucyBpbiAnc3RhcnQnIHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluIElFMTAgbW9iaWxlIChkYXRhLmJ1dHRvbnNQcm9wZXJ0eSkuXHJcblx0XHQvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzkyNzAwNS9tb2JpbGUtaWUxMC13aW5kb3dzLXBob25lLWJ1dHRvbnMtcHJvcGVydHktb2YtcG9pbnRlcm1vdmUtZXZlbnQtYWx3YXlzLXplcm9cclxuXHRcdC8vIElFOSBoYXMgLmJ1dHRvbnMgYW5kIC53aGljaCB6ZXJvIG9uIG1vdXNlbW92ZS5cclxuXHRcdC8vIEZpcmVmb3ggYnJlYWtzIHRoZSBzcGVjIE1ETiBkZWZpbmVzLlxyXG5cdFx0aWYgKCBuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiTVNJRSA5XCIpID09PSAtMSAmJiBldmVudC5idXR0b25zID09PSAwICYmIGRhdGEuYnV0dG9uc1Byb3BlcnR5ICE9PSAwICkge1xyXG5cdFx0XHRyZXR1cm4gZW5kKGV2ZW50LCBkYXRhKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaGFuZGxlcyA9IGRhdGEuaGFuZGxlcyB8fCBzY29wZV9IYW5kbGVzLCBwb3NpdGlvbnMsIHN0YXRlID0gZmFsc2UsXHJcblx0XHRcdHByb3Bvc2FsID0gKChldmVudC5jYWxjUG9pbnQgLSBkYXRhLnN0YXJ0KSAqIDEwMCkgLyBkYXRhLmJhc2VTaXplLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXIgPSBoYW5kbGVzWzBdID09PSBzY29wZV9IYW5kbGVzWzBdID8gMCA6IDEsIGk7XHJcblxyXG5cdFx0Ly8gQ2FsY3VsYXRlIHJlbGF0aXZlIHBvc2l0aW9ucyBmb3IgdGhlIGhhbmRsZXMuXHJcblx0XHRwb3NpdGlvbnMgPSBnZXRQb3NpdGlvbnMoIHByb3Bvc2FsLCBkYXRhLnBvc2l0aW9ucywgaGFuZGxlcy5sZW5ndGggPiAxKTtcclxuXHJcblx0XHRzdGF0ZSA9IHNldEhhbmRsZSAoIGhhbmRsZXNbMF0sIHBvc2l0aW9uc1toYW5kbGVOdW1iZXJdLCBoYW5kbGVzLmxlbmd0aCA9PT0gMSApO1xyXG5cclxuXHRcdGlmICggaGFuZGxlcy5sZW5ndGggPiAxICkge1xyXG5cclxuXHRcdFx0c3RhdGUgPSBzZXRIYW5kbGUgKCBoYW5kbGVzWzFdLCBwb3NpdGlvbnNbaGFuZGxlTnVtYmVyPzA6MV0sIGZhbHNlICkgfHwgc3RhdGU7XHJcblxyXG5cdFx0XHRpZiAoIHN0YXRlICkge1xyXG5cdFx0XHRcdC8vIGZpcmUgZm9yIGJvdGggaGFuZGxlc1xyXG5cdFx0XHRcdGZvciAoIGkgPSAwOyBpIDwgZGF0YS5oYW5kbGVzLmxlbmd0aDsgaSsrICkge1xyXG5cdFx0XHRcdFx0ZmlyZUV2ZW50KCdzbGlkZScsIGkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICggc3RhdGUgKSB7XHJcblx0XHRcdC8vIEZpcmUgZm9yIGEgc2luZ2xlIGhhbmRsZVxyXG5cdFx0XHRmaXJlRXZlbnQoJ3NsaWRlJywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFVuYmluZCBtb3ZlIGV2ZW50cyBvbiBkb2N1bWVudCwgY2FsbCBjYWxsYmFja3MuXHJcblx0ZnVuY3Rpb24gZW5kICggZXZlbnQsIGRhdGEgKSB7XHJcblxyXG5cdFx0Ly8gVGhlIGhhbmRsZSBpcyBubyBsb25nZXIgYWN0aXZlLCBzbyByZW1vdmUgdGhlIGNsYXNzLlxyXG5cdFx0dmFyIGFjdGl2ZSA9IHNjb3BlX0Jhc2UucXVlcnlTZWxlY3RvciggJy4nICsgY3NzQ2xhc3Nlc1sxNV0gKSxcclxuXHRcdFx0aGFuZGxlTnVtYmVyID0gZGF0YS5oYW5kbGVzWzBdID09PSBzY29wZV9IYW5kbGVzWzBdID8gMCA6IDE7XHJcblxyXG5cdFx0aWYgKCBhY3RpdmUgIT09IG51bGwgKSB7XHJcblx0XHRcdHJlbW92ZUNsYXNzKGFjdGl2ZSwgY3NzQ2xhc3Nlc1sxNV0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFJlbW92ZSBjdXJzb3Igc3R5bGVzIGFuZCB0ZXh0LXNlbGVjdGlvbiBldmVudHMgYm91bmQgdG8gdGhlIGJvZHkuXHJcblx0XHRpZiAoIGV2ZW50LmN1cnNvciApIHtcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnJztcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGRvY3VtZW50LmJvZHkubm9VaUxpc3RlbmVyKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuXHJcblx0XHQvLyBVbmJpbmQgdGhlIG1vdmUgYW5kIGVuZCBldmVudHMsIHdoaWNoIGFyZSBhZGRlZCBvbiAnc3RhcnQnLlxyXG5cdFx0ZC5ub1VpTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24oIGMgKSB7XHJcblx0XHRcdGQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjWzBdLCBjWzFdKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJlbW92ZSBkcmFnZ2luZyBjbGFzcy5cclxuXHRcdHJlbW92ZUNsYXNzKHNjb3BlX1RhcmdldCwgY3NzQ2xhc3Nlc1sxMl0pO1xyXG5cclxuXHRcdC8vIEZpcmUgdGhlIGNoYW5nZSBhbmQgc2V0IGV2ZW50cy5cclxuXHRcdGZpcmVFdmVudCgnc2V0JywgaGFuZGxlTnVtYmVyKTtcclxuXHRcdGZpcmVFdmVudCgnY2hhbmdlJywgaGFuZGxlTnVtYmVyKTtcclxuXHJcblx0XHQvLyBJZiB0aGlzIGlzIGEgc3RhbmRhcmQgaGFuZGxlIG1vdmVtZW50LCBmaXJlIHRoZSBlbmQgZXZlbnQuXHJcblx0XHRpZiAoIGRhdGEuaGFuZGxlTnVtYmVyICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgnZW5kJywgZGF0YS5oYW5kbGVOdW1iZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gRmlyZSAnZW5kJyB3aGVuIGEgbW91c2Ugb3IgcGVuIGxlYXZlcyB0aGUgZG9jdW1lbnQuXHJcblx0ZnVuY3Rpb24gZG9jdW1lbnRMZWF2ZSAoIGV2ZW50LCBkYXRhICkge1xyXG5cdFx0aWYgKCBldmVudC50eXBlID09PSBcIm1vdXNlb3V0XCIgJiYgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIkhUTUxcIiAmJiBldmVudC5yZWxhdGVkVGFyZ2V0ID09PSBudWxsICl7XHJcblx0XHRcdGVuZCAoIGV2ZW50LCBkYXRhICk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBCaW5kIG1vdmUgZXZlbnRzIG9uIGRvY3VtZW50LlxyXG5cdGZ1bmN0aW9uIHN0YXJ0ICggZXZlbnQsIGRhdGEgKSB7XHJcblxyXG5cdFx0dmFyIGQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG5cdFx0Ly8gTWFyayB0aGUgaGFuZGxlIGFzICdhY3RpdmUnIHNvIGl0IGNhbiBiZSBzdHlsZWQuXHJcblx0XHRpZiAoIGRhdGEuaGFuZGxlcy5sZW5ndGggPT09IDEgKSB7XHJcblx0XHRcdGFkZENsYXNzKGRhdGEuaGFuZGxlc1swXS5jaGlsZHJlblswXSwgY3NzQ2xhc3Nlc1sxNV0pO1xyXG5cclxuXHRcdFx0Ly8gU3VwcG9ydCAnZGlzYWJsZWQnIGhhbmRsZXNcclxuXHRcdFx0aWYgKCBkYXRhLmhhbmRsZXNbMF0uaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpeCAjNTUxLCB3aGVyZSBhIGhhbmRsZSBnZXRzIHNlbGVjdGVkIGluc3RlYWQgb2YgZHJhZ2dlZC5cclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0Ly8gQSBkcmFnIHNob3VsZCBuZXZlciBwcm9wYWdhdGUgdXAgdG8gdGhlICd0YXAnIGV2ZW50LlxyXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG5cdFx0Ly8gQXR0YWNoIHRoZSBtb3ZlIGFuZCBlbmQgZXZlbnRzLlxyXG5cdFx0dmFyIG1vdmVFdmVudCA9IGF0dGFjaChhY3Rpb25zLm1vdmUsIGQsIG1vdmUsIHtcclxuXHRcdFx0c3RhcnQ6IGV2ZW50LmNhbGNQb2ludCxcclxuXHRcdFx0YmFzZVNpemU6IGJhc2VTaXplKCksXHJcblx0XHRcdHBhZ2VPZmZzZXQ6IGV2ZW50LnBhZ2VPZmZzZXQsXHJcblx0XHRcdGhhbmRsZXM6IGRhdGEuaGFuZGxlcyxcclxuXHRcdFx0aGFuZGxlTnVtYmVyOiBkYXRhLmhhbmRsZU51bWJlcixcclxuXHRcdFx0YnV0dG9uc1Byb3BlcnR5OiBldmVudC5idXR0b25zLFxyXG5cdFx0XHRwb3NpdGlvbnM6IFtcclxuXHRcdFx0XHRzY29wZV9Mb2NhdGlvbnNbMF0sXHJcblx0XHRcdFx0c2NvcGVfTG9jYXRpb25zW3Njb3BlX0hhbmRsZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XVxyXG5cdFx0fSksIGVuZEV2ZW50ID0gYXR0YWNoKGFjdGlvbnMuZW5kLCBkLCBlbmQsIHtcclxuXHRcdFx0aGFuZGxlczogZGF0YS5oYW5kbGVzLFxyXG5cdFx0XHRoYW5kbGVOdW1iZXI6IGRhdGEuaGFuZGxlTnVtYmVyXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgb3V0RXZlbnQgPSBhdHRhY2goXCJtb3VzZW91dFwiLCBkLCBkb2N1bWVudExlYXZlLCB7XHJcblx0XHRcdGhhbmRsZXM6IGRhdGEuaGFuZGxlcyxcclxuXHRcdFx0aGFuZGxlTnVtYmVyOiBkYXRhLmhhbmRsZU51bWJlclxyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZC5ub1VpTGlzdGVuZXJzID0gbW92ZUV2ZW50LmNvbmNhdChlbmRFdmVudCwgb3V0RXZlbnQpO1xyXG5cclxuXHRcdC8vIFRleHQgc2VsZWN0aW9uIGlzbid0IGFuIGlzc3VlIG9uIHRvdWNoIGRldmljZXMsXHJcblx0XHQvLyBzbyBhZGRpbmcgY3Vyc29yIHN0eWxlcyBjYW4gYmUgc2tpcHBlZC5cclxuXHRcdGlmICggZXZlbnQuY3Vyc29yICkge1xyXG5cclxuXHRcdFx0Ly8gUHJldmVudCB0aGUgJ0knIGN1cnNvciBhbmQgZXh0ZW5kIHRoZSByYW5nZS1kcmFnIGN1cnNvci5cclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBnZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldCkuY3Vyc29yO1xyXG5cclxuXHRcdFx0Ly8gTWFyayB0aGUgdGFyZ2V0IHdpdGggYSBkcmFnZ2luZyBzdGF0ZS5cclxuXHRcdFx0aWYgKCBzY29wZV9IYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblx0XHRcdFx0YWRkQ2xhc3Moc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzEyXSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBmID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRkb2N1bWVudC5ib2R5Lm5vVWlMaXN0ZW5lciA9IGY7XHJcblxyXG5cdFx0XHQvLyBQcmV2ZW50IHRleHQgc2VsZWN0aW9uIHdoZW4gZHJhZ2dpbmcgdGhlIGhhbmRsZXMuXHJcblx0XHRcdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBmLCBmYWxzZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCBkYXRhLmhhbmRsZU51bWJlciAhPT0gdW5kZWZpbmVkICkge1xyXG5cdFx0XHRmaXJlRXZlbnQoJ3N0YXJ0JywgZGF0YS5oYW5kbGVOdW1iZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gTW92ZSBjbG9zZXN0IGhhbmRsZSB0byB0YXBwZWQgbG9jYXRpb24uXHJcblx0ZnVuY3Rpb24gdGFwICggZXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIGxvY2F0aW9uID0gZXZlbnQuY2FsY1BvaW50LCB0b3RhbCA9IDAsIGhhbmRsZU51bWJlciwgdG87XHJcblxyXG5cdFx0Ly8gVGhlIHRhcCBldmVudCBzaG91bGRuJ3QgcHJvcGFnYXRlIHVwIGFuZCBjYXVzZSAnZWRnZScgdG8gcnVuLlxyXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG5cdFx0Ly8gQWRkIHVwIHRoZSBoYW5kbGUgb2Zmc2V0cy5cclxuXHRcdHNjb3BlX0hhbmRsZXMuZm9yRWFjaChmdW5jdGlvbihhKXtcclxuXHRcdFx0dG90YWwgKz0gb2Zmc2V0KGEpWyBvcHRpb25zLnN0eWxlIF07XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBGaW5kIHRoZSBoYW5kbGUgY2xvc2VzdCB0byB0aGUgdGFwcGVkIHBvc2l0aW9uLlxyXG5cdFx0aGFuZGxlTnVtYmVyID0gKCBsb2NhdGlvbiA8IHRvdGFsLzIgfHwgc2NvcGVfSGFuZGxlcy5sZW5ndGggPT09IDEgKSA/IDAgOiAxO1xyXG5cclxuXHRcdGxvY2F0aW9uIC09IG9mZnNldChzY29wZV9CYXNlKVsgb3B0aW9ucy5zdHlsZSBdO1xyXG5cclxuXHRcdC8vIENhbGN1bGF0ZSB0aGUgbmV3IHBvc2l0aW9uLlxyXG5cdFx0dG8gPSAoIGxvY2F0aW9uICogMTAwICkgLyBiYXNlU2l6ZSgpO1xyXG5cclxuXHRcdGlmICggIW9wdGlvbnMuZXZlbnRzLnNuYXAgKSB7XHJcblx0XHRcdC8vIEZsYWcgdGhlIHNsaWRlciBhcyBpdCBpcyBub3cgaW4gYSB0cmFuc2l0aW9uYWwgc3RhdGUuXHJcblx0XHRcdC8vIFRyYW5zaXRpb24gdGFrZXMgMzAwIG1zLCBzbyByZS1lbmFibGUgdGhlIHNsaWRlciBhZnRlcndhcmRzLlxyXG5cdFx0XHRhZGRDbGFzc0Zvciggc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzE0XSwgMzAwICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3VwcG9ydCAnZGlzYWJsZWQnIGhhbmRsZXNcclxuXHRcdGlmICggc2NvcGVfSGFuZGxlc1toYW5kbGVOdW1iZXJdLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpbmQgdGhlIGNsb3Nlc3QgaGFuZGxlIGFuZCBjYWxjdWxhdGUgdGhlIHRhcHBlZCBwb2ludC5cclxuXHRcdC8vIFRoZSBzZXQgaGFuZGxlIHRvIHRoZSBuZXcgcG9zaXRpb24uXHJcblx0XHRzZXRIYW5kbGUoIHNjb3BlX0hhbmRsZXNbaGFuZGxlTnVtYmVyXSwgdG8gKTtcclxuXHJcblx0XHRmaXJlRXZlbnQoJ3NsaWRlJywgaGFuZGxlTnVtYmVyLCB0cnVlKTtcclxuXHRcdGZpcmVFdmVudCgnc2V0JywgaGFuZGxlTnVtYmVyLCB0cnVlKTtcclxuXHRcdGZpcmVFdmVudCgnY2hhbmdlJywgaGFuZGxlTnVtYmVyLCB0cnVlKTtcclxuXHJcblx0XHRpZiAoIG9wdGlvbnMuZXZlbnRzLnNuYXAgKSB7XHJcblx0XHRcdHN0YXJ0KGV2ZW50LCB7IGhhbmRsZXM6IFtzY29wZV9IYW5kbGVzW2hhbmRsZU51bWJlcl1dIH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gRmlyZXMgYSAnaG92ZXInIGV2ZW50IGZvciBhIGhvdmVyZWQgbW91c2UvcGVuIHBvc2l0aW9uLlxyXG5cdGZ1bmN0aW9uIGhvdmVyICggZXZlbnQgKSB7XHJcblxyXG5cdFx0dmFyIGxvY2F0aW9uID0gZXZlbnQuY2FsY1BvaW50IC0gb2Zmc2V0KHNjb3BlX0Jhc2UpWyBvcHRpb25zLnN0eWxlIF0sXHJcblx0XHRcdHRvID0gc2NvcGVfU3BlY3RydW0uZ2V0U3RlcCgoIGxvY2F0aW9uICogMTAwICkgLyBiYXNlU2l6ZSgpKSxcclxuXHRcdFx0dmFsdWUgPSBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHRvICk7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCB0YXJnZXRFdmVudCApIHtcclxuXHRcdFx0aWYgKCAnaG92ZXInID09PSB0YXJnZXRFdmVudC5zcGxpdCgnLicpWzBdICkge1xyXG5cdFx0XHRcdHNjb3BlX0V2ZW50c1t0YXJnZXRFdmVudF0uZm9yRWFjaChmdW5jdGlvbiggY2FsbGJhY2sgKSB7XHJcblx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKCBzY29wZV9TZWxmLCB2YWx1ZSApO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIEF0dGFjaCBldmVudHMgdG8gc2V2ZXJhbCBzbGlkZXIgcGFydHMuXHJcblx0ZnVuY3Rpb24gZXZlbnRzICggYmVoYXZpb3VyICkge1xyXG5cclxuXHRcdHZhciBpLCBkcmFnO1xyXG5cclxuXHRcdC8vIEF0dGFjaCB0aGUgc3RhbmRhcmQgZHJhZyBldmVudCB0byB0aGUgaGFuZGxlcy5cclxuXHRcdGlmICggIWJlaGF2aW91ci5maXhlZCApIHtcclxuXHJcblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGg7IGkgKz0gMSApIHtcclxuXHJcblx0XHRcdFx0Ly8gVGhlc2UgZXZlbnRzIGFyZSBvbmx5IGJvdW5kIHRvIHRoZSB2aXN1YWwgaGFuZGxlXHJcblx0XHRcdFx0Ly8gZWxlbWVudCwgbm90IHRoZSAncmVhbCcgb3JpZ2luIGVsZW1lbnQuXHJcblx0XHRcdFx0YXR0YWNoICggYWN0aW9ucy5zdGFydCwgc2NvcGVfSGFuZGxlc1tpXS5jaGlsZHJlblswXSwgc3RhcnQsIHtcclxuXHRcdFx0XHRcdGhhbmRsZXM6IFsgc2NvcGVfSGFuZGxlc1tpXSBdLFxyXG5cdFx0XHRcdFx0aGFuZGxlTnVtYmVyOiBpXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBBdHRhY2ggdGhlIHRhcCBldmVudCB0byB0aGUgc2xpZGVyIGJhc2UuXHJcblx0XHRpZiAoIGJlaGF2aW91ci50YXAgKSB7XHJcblxyXG5cdFx0XHRhdHRhY2ggKCBhY3Rpb25zLnN0YXJ0LCBzY29wZV9CYXNlLCB0YXAsIHtcclxuXHRcdFx0XHRoYW5kbGVzOiBzY29wZV9IYW5kbGVzXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEZpcmUgaG92ZXIgZXZlbnRzXHJcblx0XHRpZiAoIGJlaGF2aW91ci5ob3ZlciApIHtcclxuXHRcdFx0YXR0YWNoICggYWN0aW9ucy5tb3ZlLCBzY29wZV9CYXNlLCBob3ZlciwgeyBob3ZlcjogdHJ1ZSB9ICk7XHJcblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgc2NvcGVfSGFuZGxlcy5sZW5ndGg7IGkgKz0gMSApIHtcclxuXHRcdFx0XHRbJ21vdXNlbW92ZSBNU1BvaW50ZXJNb3ZlIHBvaW50ZXJtb3ZlJ10uZm9yRWFjaChmdW5jdGlvbiggZXZlbnROYW1lICl7XHJcblx0XHRcdFx0XHRzY29wZV9IYW5kbGVzW2ldLmNoaWxkcmVuWzBdLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzdG9wUHJvcGFnYXRpb24sIGZhbHNlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE1ha2UgdGhlIHJhbmdlIGRyYWdnYWJsZS5cclxuXHRcdGlmICggYmVoYXZpb3VyLmRyYWcgKXtcclxuXHJcblx0XHRcdGRyYWcgPSBbc2NvcGVfQmFzZS5xdWVyeVNlbGVjdG9yKCAnLicgKyBjc3NDbGFzc2VzWzddICldO1xyXG5cdFx0XHRhZGRDbGFzcyhkcmFnWzBdLCBjc3NDbGFzc2VzWzEwXSk7XHJcblxyXG5cdFx0XHQvLyBXaGVuIHRoZSByYW5nZSBpcyBmaXhlZCwgdGhlIGVudGlyZSByYW5nZSBjYW5cclxuXHRcdFx0Ly8gYmUgZHJhZ2dlZCBieSB0aGUgaGFuZGxlcy4gVGhlIGhhbmRsZSBpbiB0aGUgZmlyc3RcclxuXHRcdFx0Ly8gb3JpZ2luIHdpbGwgcHJvcGFnYXRlIHRoZSBzdGFydCBldmVudCB1cHdhcmQsXHJcblx0XHRcdC8vIGJ1dCBpdCBuZWVkcyB0byBiZSBib3VuZCBtYW51YWxseSBvbiB0aGUgb3RoZXIuXHJcblx0XHRcdGlmICggYmVoYXZpb3VyLmZpeGVkICkge1xyXG5cdFx0XHRcdGRyYWcucHVzaChzY29wZV9IYW5kbGVzWyhkcmFnWzBdID09PSBzY29wZV9IYW5kbGVzWzBdID8gMSA6IDApXS5jaGlsZHJlblswXSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGRyYWcuZm9yRWFjaChmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdFx0XHRhdHRhY2ggKCBhY3Rpb25zLnN0YXJ0LCBlbGVtZW50LCBzdGFydCwge1xyXG5cdFx0XHRcdFx0aGFuZGxlczogc2NvcGVfSGFuZGxlc1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHQvLyBUZXN0IHN1Z2dlc3RlZCB2YWx1ZXMgYW5kIGFwcGx5IG1hcmdpbiwgc3RlcC5cclxuXHRmdW5jdGlvbiBzZXRIYW5kbGUgKCBoYW5kbGUsIHRvLCBub0xpbWl0T3B0aW9uICkge1xyXG5cclxuXHRcdHZhciB0cmlnZ2VyID0gaGFuZGxlICE9PSBzY29wZV9IYW5kbGVzWzBdID8gMSA6IDAsXHJcblx0XHRcdGxvd2VyTWFyZ2luID0gc2NvcGVfTG9jYXRpb25zWzBdICsgb3B0aW9ucy5tYXJnaW4sXHJcblx0XHRcdHVwcGVyTWFyZ2luID0gc2NvcGVfTG9jYXRpb25zWzFdIC0gb3B0aW9ucy5tYXJnaW4sXHJcblx0XHRcdGxvd2VyTGltaXQgPSBzY29wZV9Mb2NhdGlvbnNbMF0gKyBvcHRpb25zLmxpbWl0LFxyXG5cdFx0XHR1cHBlckxpbWl0ID0gc2NvcGVfTG9jYXRpb25zWzFdIC0gb3B0aW9ucy5saW1pdDtcclxuXHJcblx0XHQvLyBGb3Igc2xpZGVycyB3aXRoIG11bHRpcGxlIGhhbmRsZXMsXHJcblx0XHQvLyBsaW1pdCBtb3ZlbWVudCB0byB0aGUgb3RoZXIgaGFuZGxlLlxyXG5cdFx0Ly8gQXBwbHkgdGhlIG1hcmdpbiBvcHRpb24gYnkgYWRkaW5nIGl0IHRvIHRoZSBoYW5kbGUgcG9zaXRpb25zLlxyXG5cdFx0aWYgKCBzY29wZV9IYW5kbGVzLmxlbmd0aCA+IDEgKSB7XHJcblx0XHRcdHRvID0gdHJpZ2dlciA/IE1hdGgubWF4KCB0bywgbG93ZXJNYXJnaW4gKSA6IE1hdGgubWluKCB0bywgdXBwZXJNYXJnaW4gKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUaGUgbGltaXQgb3B0aW9uIGhhcyB0aGUgb3Bwb3NpdGUgZWZmZWN0LCBsaW1pdGluZyBoYW5kbGVzIHRvIGFcclxuXHRcdC8vIG1heGltdW0gZGlzdGFuY2UgZnJvbSBhbm90aGVyLiBMaW1pdCBtdXN0IGJlID4gMCwgYXMgb3RoZXJ3aXNlXHJcblx0XHQvLyBoYW5kbGVzIHdvdWxkIGJlIHVubW92ZWFibGUuICdub0xpbWl0T3B0aW9uJyBpcyBzZXQgdG8gJ2ZhbHNlJ1xyXG5cdFx0Ly8gZm9yIHRoZSAudmFsKCkgbWV0aG9kLCBleGNlcHQgZm9yIHBhc3MgNC80LlxyXG5cdFx0aWYgKCBub0xpbWl0T3B0aW9uICE9PSBmYWxzZSAmJiBvcHRpb25zLmxpbWl0ICYmIHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSApIHtcclxuXHRcdFx0dG8gPSB0cmlnZ2VyID8gTWF0aC5taW4gKCB0bywgbG93ZXJMaW1pdCApIDogTWF0aC5tYXgoIHRvLCB1cHBlckxpbWl0ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSGFuZGxlIHRoZSBzdGVwIG9wdGlvbi5cclxuXHRcdHRvID0gc2NvcGVfU3BlY3RydW0uZ2V0U3RlcCggdG8gKTtcclxuXHJcblx0XHQvLyBMaW1pdCB0byAwLzEwMCBmb3IgLnZhbCBpbnB1dCwgdHJpbSBhbnl0aGluZyBiZXlvbmQgNyBkaWdpdHMsIGFzXHJcblx0XHQvLyBKYXZhU2NyaXB0IGhhcyBzb21lIGlzc3VlcyBpbiBpdHMgZmxvYXRpbmcgcG9pbnQgaW1wbGVtZW50YXRpb24uXHJcblx0XHR0byA9IGxpbWl0KHBhcnNlRmxvYXQodG8udG9GaXhlZCg3KSkpO1xyXG5cclxuXHRcdC8vIFJldHVybiBmYWxzZSBpZiBoYW5kbGUgY2FuJ3QgbW92ZVxyXG5cdFx0aWYgKCB0byA9PT0gc2NvcGVfTG9jYXRpb25zW3RyaWdnZXJdICkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2V0IHRoZSBoYW5kbGUgdG8gdGhlIG5ldyBwb3NpdGlvbi5cclxuXHRcdC8vIFVzZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZm9yIGVmZmljaWVudCBwYWludGluZy5cclxuXHRcdC8vIE5vIHNpZ25pZmljYW50IGVmZmVjdCBpbiBDaHJvbWUsIEVkZ2Ugc2VlcyBkcmFtYXRpY1xyXG5cdFx0Ly8gcGVyZm9ybWFjZSBpbXByb3ZlbWVudHMuXHJcblx0XHRpZiAoIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKSB7XHJcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRoYW5kbGUuc3R5bGVbb3B0aW9ucy5zdHlsZV0gPSB0byArICclJztcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRoYW5kbGUuc3R5bGVbb3B0aW9ucy5zdHlsZV0gPSB0byArICclJztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGb3JjZSBwcm9wZXIgaGFuZGxlIHN0YWNraW5nXHJcblx0XHRpZiAoICFoYW5kbGUucHJldmlvdXNTaWJsaW5nICkge1xyXG5cdFx0XHRyZW1vdmVDbGFzcyhoYW5kbGUsIGNzc0NsYXNzZXNbMTddKTtcclxuXHRcdFx0aWYgKCB0byA+IDUwICkge1xyXG5cdFx0XHRcdGFkZENsYXNzKGhhbmRsZSwgY3NzQ2xhc3Nlc1sxN10pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVXBkYXRlIGxvY2F0aW9ucy5cclxuXHRcdHNjb3BlX0xvY2F0aW9uc1t0cmlnZ2VyXSA9IHRvO1xyXG5cclxuXHRcdC8vIENvbnZlcnQgdGhlIHZhbHVlIHRvIHRoZSBzbGlkZXIgc3RlcHBpbmcvcmFuZ2UuXHJcblx0XHRzY29wZV9WYWx1ZXNbdHJpZ2dlcl0gPSBzY29wZV9TcGVjdHJ1bS5mcm9tU3RlcHBpbmcoIHRvICk7XHJcblxyXG5cdFx0ZmlyZUV2ZW50KCd1cGRhdGUnLCB0cmlnZ2VyKTtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8vIExvb3AgdmFsdWVzIGZyb20gdmFsdWUgbWV0aG9kIGFuZCBhcHBseSB0aGVtLlxyXG5cdGZ1bmN0aW9uIHNldFZhbHVlcyAoIGNvdW50LCB2YWx1ZXMgKSB7XHJcblxyXG5cdFx0dmFyIGksIHRyaWdnZXIsIHRvO1xyXG5cclxuXHRcdC8vIFdpdGggdGhlIGxpbWl0IG9wdGlvbiwgd2UnbGwgbmVlZCBhbm90aGVyIGxpbWl0aW5nIHBhc3MuXHJcblx0XHRpZiAoIG9wdGlvbnMubGltaXQgKSB7XHJcblx0XHRcdGNvdW50ICs9IDE7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIGhhbmRsZXMgdG8gYmUgc2V0IHJ1biB0aGUgc2V0dGluZ1xyXG5cdFx0Ly8gbWVjaGFuaXNtIHR3aWNlIGZvciB0aGUgZmlyc3QgaGFuZGxlLCB0byBtYWtlIHN1cmUgaXRcclxuXHRcdC8vIGNhbiBiZSBib3VuY2VkIG9mIHRoZSBzZWNvbmQgb25lIHByb3Blcmx5LlxyXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBjb3VudDsgaSArPSAxICkge1xyXG5cclxuXHRcdFx0dHJpZ2dlciA9IGklMjtcclxuXHJcblx0XHRcdC8vIEdldCB0aGUgY3VycmVudCBhcmd1bWVudCBmcm9tIHRoZSBhcnJheS5cclxuXHRcdFx0dG8gPSB2YWx1ZXNbdHJpZ2dlcl07XHJcblxyXG5cdFx0XHQvLyBTZXR0aW5nIHdpdGggbnVsbCBpbmRpY2F0ZXMgYW4gJ2lnbm9yZScuXHJcblx0XHRcdC8vIElucHV0dGluZyAnZmFsc2UnIGlzIGludmFsaWQuXHJcblx0XHRcdGlmICggdG8gIT09IG51bGwgJiYgdG8gIT09IGZhbHNlICkge1xyXG5cclxuXHRcdFx0XHQvLyBJZiBhIGZvcm1hdHRlZCBudW1iZXIgd2FzIHBhc3NlZCwgYXR0ZW10IHRvIGRlY29kZSBpdC5cclxuXHRcdFx0XHRpZiAoIHR5cGVvZiB0byA9PT0gJ251bWJlcicgKSB7XHJcblx0XHRcdFx0XHR0byA9IFN0cmluZyh0byk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0byA9IG9wdGlvbnMuZm9ybWF0LmZyb20oIHRvICk7XHJcblxyXG5cdFx0XHRcdC8vIFJlcXVlc3QgYW4gdXBkYXRlIGZvciBhbGwgbGlua3MgaWYgdGhlIHZhbHVlIHdhcyBpbnZhbGlkLlxyXG5cdFx0XHRcdC8vIERvIHNvIHRvbyBpZiBzZXR0aW5nIHRoZSBoYW5kbGUgZmFpbHMuXHJcblx0XHRcdFx0aWYgKCB0byA9PT0gZmFsc2UgfHwgaXNOYU4odG8pIHx8IHNldEhhbmRsZSggc2NvcGVfSGFuZGxlc1t0cmlnZ2VyXSwgc2NvcGVfU3BlY3RydW0udG9TdGVwcGluZyggdG8gKSwgaSA9PT0gKDMgLSBvcHRpb25zLmRpcikgKSA9PT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0XHRmaXJlRXZlbnQoJ3VwZGF0ZScsIHRyaWdnZXIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gU2V0IHRoZSBzbGlkZXIgdmFsdWUuXHJcblx0ZnVuY3Rpb24gdmFsdWVTZXQgKCBpbnB1dCApIHtcclxuXHJcblx0XHR2YXIgY291bnQsIHZhbHVlcyA9IGFzQXJyYXkoIGlucHV0ICksIGk7XHJcblxyXG5cdFx0Ly8gVGhlIFJUTCBzZXR0aW5ncyBpcyBpbXBsZW1lbnRlZCBieSByZXZlcnNpbmcgdGhlIGZyb250LWVuZCxcclxuXHRcdC8vIGludGVybmFsIG1lY2hhbmlzbXMgYXJlIHRoZSBzYW1lLlxyXG5cdFx0aWYgKCBvcHRpb25zLmRpciAmJiBvcHRpb25zLmhhbmRsZXMgPiAxICkge1xyXG5cdFx0XHR2YWx1ZXMucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEFuaW1hdGlvbiBpcyBvcHRpb25hbC5cclxuXHRcdC8vIE1ha2Ugc3VyZSB0aGUgaW5pdGlhbCB2YWx1ZXMgd2hlcmUgc2V0IGJlZm9yZSB1c2luZyBhbmltYXRlZCBwbGFjZW1lbnQuXHJcblx0XHRpZiAoIG9wdGlvbnMuYW5pbWF0ZSAmJiBzY29wZV9Mb2NhdGlvbnNbMF0gIT09IC0xICkge1xyXG5cdFx0XHRhZGRDbGFzc0Zvciggc2NvcGVfVGFyZ2V0LCBjc3NDbGFzc2VzWzE0XSwgMzAwICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRGV0ZXJtaW5lIGhvdyBvZnRlbiB0byBzZXQgdGhlIGhhbmRsZXMuXHJcblx0XHRjb3VudCA9IHNjb3BlX0hhbmRsZXMubGVuZ3RoID4gMSA/IDMgOiAxO1xyXG5cclxuXHRcdGlmICggdmFsdWVzLmxlbmd0aCA9PT0gMSApIHtcclxuXHRcdFx0Y291bnQgPSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHNldFZhbHVlcyAoIGNvdW50LCB2YWx1ZXMgKTtcclxuXHJcblx0XHQvLyBGaXJlIHRoZSAnc2V0JyBldmVudCBmb3IgYm90aCBoYW5kbGVzLlxyXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBzY29wZV9IYW5kbGVzLmxlbmd0aDsgaSsrICkge1xyXG5cdFx0XHRmaXJlRXZlbnQoJ3NldCcsIGkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBzbGlkZXIgdmFsdWUuXHJcblx0ZnVuY3Rpb24gdmFsdWVHZXQgKCApIHtcclxuXHJcblx0XHR2YXIgaSwgcmV0b3VyID0gW107XHJcblxyXG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBmcm9tIGFsbCBoYW5kbGVzLlxyXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBvcHRpb25zLmhhbmRsZXM7IGkgKz0gMSApe1xyXG5cdFx0XHRyZXRvdXJbaV0gPSBvcHRpb25zLmZvcm1hdC50byggc2NvcGVfVmFsdWVzW2ldICk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGluU2xpZGVyT3JkZXIoIHJldG91ciApO1xyXG5cdH1cclxuXHJcblx0Ly8gUmVtb3ZlcyBjbGFzc2VzIGZyb20gdGhlIHJvb3QgYW5kIGVtcHRpZXMgaXQuXHJcblx0ZnVuY3Rpb24gZGVzdHJveSAoICkge1xyXG5cdFx0Y3NzQ2xhc3Nlcy5mb3JFYWNoKGZ1bmN0aW9uKGNscyl7XHJcblx0XHRcdGlmICggIWNscyApIHsgcmV0dXJuOyB9IC8vIElnbm9yZSBlbXB0eSBjbGFzc2VzXHJcblx0XHRcdHJlbW92ZUNsYXNzKHNjb3BlX1RhcmdldCwgY2xzKTtcclxuXHRcdH0pO1xyXG5cdFx0c2NvcGVfVGFyZ2V0LmlubmVySFRNTCA9ICcnO1xyXG5cdFx0ZGVsZXRlIHNjb3BlX1RhcmdldC5ub1VpU2xpZGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gR2V0IHRoZSBjdXJyZW50IHN0ZXAgc2l6ZSBmb3IgdGhlIHNsaWRlci5cclxuXHRmdW5jdGlvbiBnZXRDdXJyZW50U3RlcCAoICkge1xyXG5cclxuXHRcdC8vIENoZWNrIGFsbCBsb2NhdGlvbnMsIG1hcCB0aGVtIHRvIHRoZWlyIHN0ZXBwaW5nIHBvaW50LlxyXG5cdFx0Ly8gR2V0IHRoZSBzdGVwIHBvaW50LCB0aGVuIGZpbmQgaXQgaW4gdGhlIGlucHV0IGxpc3QuXHJcblx0XHR2YXIgcmV0b3VyID0gc2NvcGVfTG9jYXRpb25zLm1hcChmdW5jdGlvbiggbG9jYXRpb24sIGluZGV4ICl7XHJcblxyXG5cdFx0XHR2YXIgc3RlcCA9IHNjb3BlX1NwZWN0cnVtLmdldEFwcGxpY2FibGVTdGVwKCBsb2NhdGlvbiApLFxyXG5cclxuXHRcdFx0XHQvLyBBcyBwZXIgIzM5MSwgdGhlIGNvbXBhcmlzb24gZm9yIHRoZSBkZWNyZW1lbnQgc3RlcCBjYW4gaGF2ZSBzb21lIHJvdW5kaW5nIGlzc3Vlcy5cclxuXHRcdFx0XHQvLyBSb3VuZCB0aGUgdmFsdWUgdG8gdGhlIHByZWNpc2lvbiB1c2VkIGluIHRoZSBzdGVwLlxyXG5cdFx0XHRcdHN0ZXBEZWNpbWFscyA9IGNvdW50RGVjaW1hbHMoU3RyaW5nKHN0ZXBbMl0pKSxcclxuXHJcblx0XHRcdFx0Ly8gR2V0IHRoZSBjdXJyZW50IG51bWVyaWMgdmFsdWVcclxuXHRcdFx0XHR2YWx1ZSA9IHNjb3BlX1ZhbHVlc1tpbmRleF0sXHJcblxyXG5cdFx0XHRcdC8vIFRvIG1vdmUgdGhlIHNsaWRlciAnb25lIHN0ZXAgdXAnLCB0aGUgY3VycmVudCBzdGVwIHZhbHVlIG5lZWRzIHRvIGJlIGFkZGVkLlxyXG5cdFx0XHRcdC8vIFVzZSBudWxsIGlmIHdlIGFyZSBhdCB0aGUgbWF4aW11bSBzbGlkZXIgdmFsdWUuXHJcblx0XHRcdFx0aW5jcmVtZW50ID0gbG9jYXRpb24gPT09IDEwMCA/IG51bGwgOiBzdGVwWzJdLFxyXG5cclxuXHRcdFx0XHQvLyBHb2luZyAnb25lIHN0ZXAgZG93bicgbWlnaHQgcHV0IHRoZSBzbGlkZXIgaW4gYSBkaWZmZXJlbnQgc3ViLXJhbmdlLCBzbyB3ZVxyXG5cdFx0XHRcdC8vIG5lZWQgdG8gc3dpdGNoIGJldHdlZW4gdGhlIGN1cnJlbnQgb3IgdGhlIHByZXZpb3VzIHN0ZXAuXHJcblx0XHRcdFx0cHJldiA9IE51bWJlcigodmFsdWUgLSBzdGVwWzJdKS50b0ZpeGVkKHN0ZXBEZWNpbWFscykpLFxyXG5cclxuXHRcdFx0XHQvLyBJZiB0aGUgdmFsdWUgZml0cyB0aGUgc3RlcCwgcmV0dXJuIHRoZSBjdXJyZW50IHN0ZXAgdmFsdWUuIE90aGVyd2lzZSwgdXNlIHRoZVxyXG5cdFx0XHRcdC8vIHByZXZpb3VzIHN0ZXAuIFJldHVybiBudWxsIGlmIHRoZSBzbGlkZXIgaXMgYXQgaXRzIG1pbmltdW0gdmFsdWUuXHJcblx0XHRcdFx0ZGVjcmVtZW50ID0gbG9jYXRpb24gPT09IDAgPyBudWxsIDogKHByZXYgPj0gc3RlcFsxXSkgPyBzdGVwWzJdIDogKHN0ZXBbMF0gfHwgZmFsc2UpO1xyXG5cclxuXHRcdFx0cmV0dXJuIFtkZWNyZW1lbnQsIGluY3JlbWVudF07XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBSZXR1cm4gdmFsdWVzIGluIHRoZSBwcm9wZXIgb3JkZXIuXHJcblx0XHRyZXR1cm4gaW5TbGlkZXJPcmRlciggcmV0b3VyICk7XHJcblx0fVxyXG5cclxuXHQvLyBBdHRhY2ggYW4gZXZlbnQgdG8gdGhpcyBzbGlkZXIsIHBvc3NpYmx5IGluY2x1ZGluZyBhIG5hbWVzcGFjZVxyXG5cdGZ1bmN0aW9uIGJpbmRFdmVudCAoIG5hbWVzcGFjZWRFdmVudCwgY2FsbGJhY2sgKSB7XHJcblx0XHRzY29wZV9FdmVudHNbbmFtZXNwYWNlZEV2ZW50XSA9IHNjb3BlX0V2ZW50c1tuYW1lc3BhY2VkRXZlbnRdIHx8IFtdO1xyXG5cdFx0c2NvcGVfRXZlbnRzW25hbWVzcGFjZWRFdmVudF0ucHVzaChjYWxsYmFjayk7XHJcblxyXG5cdFx0Ly8gSWYgdGhlIGV2ZW50IGJvdW5kIGlzICd1cGRhdGUsJyBmaXJlIGl0IGltbWVkaWF0ZWx5IGZvciBhbGwgaGFuZGxlcy5cclxuXHRcdGlmICggbmFtZXNwYWNlZEV2ZW50LnNwbGl0KCcuJylbMF0gPT09ICd1cGRhdGUnICkge1xyXG5cdFx0XHRzY29wZV9IYW5kbGVzLmZvckVhY2goZnVuY3Rpb24oYSwgaW5kZXgpe1xyXG5cdFx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgaW5kZXgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFVuZG8gYXR0YWNobWVudCBvZiBldmVudFxyXG5cdGZ1bmN0aW9uIHJlbW92ZUV2ZW50ICggbmFtZXNwYWNlZEV2ZW50ICkge1xyXG5cclxuXHRcdHZhciBldmVudCA9IG5hbWVzcGFjZWRFdmVudC5zcGxpdCgnLicpWzBdLFxyXG5cdFx0XHRuYW1lc3BhY2UgPSBuYW1lc3BhY2VkRXZlbnQuc3Vic3RyaW5nKGV2ZW50Lmxlbmd0aCk7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMoc2NvcGVfRXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKCBiaW5kICl7XHJcblxyXG5cdFx0XHR2YXIgdEV2ZW50ID0gYmluZC5zcGxpdCgnLicpWzBdLFxyXG5cdFx0XHRcdHROYW1lc3BhY2UgPSBiaW5kLnN1YnN0cmluZyh0RXZlbnQubGVuZ3RoKTtcclxuXHJcblx0XHRcdGlmICggKCFldmVudCB8fCBldmVudCA9PT0gdEV2ZW50KSAmJiAoIW5hbWVzcGFjZSB8fCBuYW1lc3BhY2UgPT09IHROYW1lc3BhY2UpICkge1xyXG5cdFx0XHRcdGRlbGV0ZSBzY29wZV9FdmVudHNbYmluZF07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gVXBkYXRlYWJsZTogbWFyZ2luLCBsaW1pdCwgc3RlcCwgcmFuZ2UsIGFuaW1hdGUsIHNuYXBcclxuXHRmdW5jdGlvbiB1cGRhdGVPcHRpb25zICggb3B0aW9uc1RvVXBkYXRlICkge1xyXG5cclxuXHRcdHZhciB2ID0gdmFsdWVHZXQoKSwgaSwgbmV3T3B0aW9ucyA9IHRlc3RPcHRpb25zKHtcclxuXHRcdFx0c3RhcnQ6IFswLCAwXSxcclxuXHRcdFx0bWFyZ2luOiBvcHRpb25zVG9VcGRhdGUubWFyZ2luLFxyXG5cdFx0XHRsaW1pdDogb3B0aW9uc1RvVXBkYXRlLmxpbWl0LFxyXG5cdFx0XHRzdGVwOiBvcHRpb25zVG9VcGRhdGUuc3RlcCxcclxuXHRcdFx0cmFuZ2U6IG9wdGlvbnNUb1VwZGF0ZS5yYW5nZSxcclxuXHRcdFx0YW5pbWF0ZTogb3B0aW9uc1RvVXBkYXRlLmFuaW1hdGUsXHJcblx0XHRcdHNuYXA6IG9wdGlvbnNUb1VwZGF0ZS5zbmFwID09PSB1bmRlZmluZWQgPyBvcHRpb25zLnNuYXAgOiBvcHRpb25zVG9VcGRhdGUuc25hcFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0WydtYXJnaW4nLCAnbGltaXQnLCAnc3RlcCcsICdyYW5nZScsICdhbmltYXRlJ10uZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcclxuXHRcdFx0aWYgKCBvcHRpb25zVG9VcGRhdGVbbmFtZV0gIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRvcHRpb25zW25hbWVdID0gb3B0aW9uc1RvVXBkYXRlW25hbWVdO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRzY29wZV9TcGVjdHJ1bSA9IG5ld09wdGlvbnMuc3BlY3RydW07XHJcblxyXG5cdFx0Ly8gSW52YWxpZGF0ZSB0aGUgY3VycmVudCBwb3NpdGlvbmluZyBzbyB2YWx1ZVNldCBmb3JjZXMgYW4gdXBkYXRlLlxyXG5cdFx0c2NvcGVfTG9jYXRpb25zID0gWy0xLCAtMV07XHJcblx0XHR2YWx1ZVNldCh2KTtcclxuXHJcblx0XHRmb3IgKCBpID0gMDsgaSA8IHNjb3BlX0hhbmRsZXMubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRcdGZpcmVFdmVudCgndXBkYXRlJywgaSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0Ly8gVGhyb3cgYW4gZXJyb3IgaWYgdGhlIHNsaWRlciB3YXMgYWxyZWFkeSBpbml0aWFsaXplZC5cclxuXHRpZiAoIHNjb3BlX1RhcmdldC5ub1VpU2xpZGVyICkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdTbGlkZXIgd2FzIGFscmVhZHkgaW5pdGlhbGl6ZWQuJyk7XHJcblx0fVxyXG5cclxuXHQvLyBDcmVhdGUgdGhlIGJhc2UgZWxlbWVudCwgaW5pdGlhbGlzZSBIVE1MIGFuZCBzZXQgY2xhc3Nlcy5cclxuXHQvLyBBZGQgaGFuZGxlcyBhbmQgbGlua3MuXHJcblx0c2NvcGVfQmFzZSA9IGFkZFNsaWRlciggb3B0aW9ucy5kaXIsIG9wdGlvbnMub3J0LCBzY29wZV9UYXJnZXQgKTtcclxuXHRzY29wZV9IYW5kbGVzID0gYWRkSGFuZGxlcyggb3B0aW9ucy5oYW5kbGVzLCBvcHRpb25zLmRpciwgc2NvcGVfQmFzZSApO1xyXG5cclxuXHQvLyBTZXQgdGhlIGNvbm5lY3QgY2xhc3Nlcy5cclxuXHRhZGRDb25uZWN0aW9uICggb3B0aW9ucy5jb25uZWN0LCBzY29wZV9UYXJnZXQsIHNjb3BlX0hhbmRsZXMgKTtcclxuXHJcblx0aWYgKCBvcHRpb25zLnBpcHMgKSB7XHJcblx0XHRwaXBzKG9wdGlvbnMucGlwcyk7XHJcblx0fVxyXG5cclxuXHRpZiAoIG9wdGlvbnMudG9vbHRpcHMgKSB7XHJcblx0XHR0b29sdGlwcygpO1xyXG5cdH1cclxuXHJcblx0c2NvcGVfU2VsZiA9IHtcclxuXHRcdGRlc3Ryb3k6IGRlc3Ryb3ksXHJcblx0XHRzdGVwczogZ2V0Q3VycmVudFN0ZXAsXHJcblx0XHRvbjogYmluZEV2ZW50LFxyXG5cdFx0b2ZmOiByZW1vdmVFdmVudCxcclxuXHRcdGdldDogdmFsdWVHZXQsXHJcblx0XHRzZXQ6IHZhbHVlU2V0LFxyXG5cdFx0dXBkYXRlT3B0aW9uczogdXBkYXRlT3B0aW9uc1xyXG5cdH07XHJcblxyXG5cdC8vIEF0dGFjaCB1c2VyIGV2ZW50cy5cclxuXHRldmVudHMoIG9wdGlvbnMuZXZlbnRzICk7XHJcblxyXG5cdHJldHVybiBzY29wZV9TZWxmO1xyXG5cclxufVxyXG5cclxuXHJcblx0Ly8gUnVuIHRoZSBzdGFuZGFyZCBpbml0aWFsaXplclxyXG5cdGZ1bmN0aW9uIGluaXRpYWxpemUgKCB0YXJnZXQsIG9yaWdpbmFsT3B0aW9ucyApIHtcclxuXHJcblx0XHRpZiAoICF0YXJnZXQubm9kZU5hbWUgKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignbm9VaVNsaWRlci5jcmVhdGUgcmVxdWlyZXMgYSBzaW5nbGUgZWxlbWVudC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBUZXN0IHRoZSBvcHRpb25zIGFuZCBjcmVhdGUgdGhlIHNsaWRlciBlbnZpcm9ubWVudDtcclxuXHRcdHZhciBvcHRpb25zID0gdGVzdE9wdGlvbnMoIG9yaWdpbmFsT3B0aW9ucywgdGFyZ2V0ICksXHJcblx0XHRcdHNsaWRlciA9IGNsb3N1cmUoIHRhcmdldCwgb3B0aW9ucyApO1xyXG5cclxuXHRcdC8vIFVzZSB0aGUgcHVibGljIHZhbHVlIG1ldGhvZCB0byBzZXQgdGhlIHN0YXJ0IHZhbHVlcy5cclxuXHRcdHNsaWRlci5zZXQob3B0aW9ucy5zdGFydCk7XHJcblxyXG5cdFx0dGFyZ2V0Lm5vVWlTbGlkZXIgPSBzbGlkZXI7XHJcblx0XHRyZXR1cm4gc2xpZGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gVXNlIGFuIG9iamVjdCBpbnN0ZWFkIG9mIGEgZnVuY3Rpb24gZm9yIGZ1dHVyZSBleHBhbnNpYmlsaXR5O1xyXG5cdHJldHVybiB7XHJcblx0XHRjcmVhdGU6IGluaXRpYWxpemVcclxuXHR9O1xyXG5cclxufSkpOyIsIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTAsMjAxMSwyMDEyLDIwMTMsMjAxNCBNb3JnYW4gUm9kZXJpY2sgaHR0cDovL3JvZGVyaWNrLmRrXG5MaWNlbnNlOiBNSVQgLSBodHRwOi8vbXJnbnJkcmNrLm1pdC1saWNlbnNlLm9yZ1xuXG5odHRwczovL2dpdGh1Yi5jb20vbXJvZGVyaWNrL1B1YlN1YkpTXG4qL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KXtcblx0J3VzZSBzdHJpY3QnO1xuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCl7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKXtcbiAgICAgICAgLy8gQ29tbW9uSlNcbiAgICAgICAgZmFjdG9yeShleHBvcnRzKTtcblxuICAgIH1cblxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIHZhciBQdWJTdWIgPSB7fTtcbiAgICByb290LlB1YlN1YiA9IFB1YlN1YjtcbiAgICBmYWN0b3J5KFB1YlN1Yik7XG4gICAgXG59KCggdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93ICkgfHwgdGhpcywgZnVuY3Rpb24gKFB1YlN1Yil7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgbWVzc2FnZXMgPSB7fSxcblx0XHRsYXN0VWlkID0gLTE7XG5cblx0ZnVuY3Rpb24gaGFzS2V5cyhvYmope1xuXHRcdHZhciBrZXk7XG5cblx0XHRmb3IgKGtleSBpbiBvYmope1xuXHRcdFx0aWYgKCBvYmouaGFzT3duUHJvcGVydHkoa2V5KSApe1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqXHRSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB0aHJvd3MgdGhlIHBhc3NlZCBleGNlcHRpb24sIGZvciB1c2UgYXMgYXJndW1lbnQgZm9yIHNldFRpbWVvdXRcblx0ICpcdEBwYXJhbSB7IE9iamVjdCB9IGV4IEFuIEVycm9yIG9iamVjdFxuXHQgKi9cblx0ZnVuY3Rpb24gdGhyb3dFeGNlcHRpb24oIGV4ICl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHJlVGhyb3dFeGNlcHRpb24oKXtcblx0XHRcdHRocm93IGV4O1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBjYWxsU3Vic2NyaWJlcldpdGhEZWxheWVkRXhjZXB0aW9ucyggc3Vic2NyaWJlciwgbWVzc2FnZSwgZGF0YSApe1xuXHRcdHRyeSB7XG5cdFx0XHRzdWJzY3JpYmVyKCBtZXNzYWdlLCBkYXRhICk7XG5cdFx0fSBjYXRjaCggZXggKXtcblx0XHRcdHNldFRpbWVvdXQoIHRocm93RXhjZXB0aW9uKCBleCApLCAwKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjYWxsU3Vic2NyaWJlcldpdGhJbW1lZGlhdGVFeGNlcHRpb25zKCBzdWJzY3JpYmVyLCBtZXNzYWdlLCBkYXRhICl7XG5cdFx0c3Vic2NyaWJlciggbWVzc2FnZSwgZGF0YSApO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVsaXZlck1lc3NhZ2UoIG9yaWdpbmFsTWVzc2FnZSwgbWF0Y2hlZE1lc3NhZ2UsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKXtcblx0XHR2YXIgc3Vic2NyaWJlcnMgPSBtZXNzYWdlc1ttYXRjaGVkTWVzc2FnZV0sXG5cdFx0XHRjYWxsU3Vic2NyaWJlciA9IGltbWVkaWF0ZUV4Y2VwdGlvbnMgPyBjYWxsU3Vic2NyaWJlcldpdGhJbW1lZGlhdGVFeGNlcHRpb25zIDogY2FsbFN1YnNjcmliZXJXaXRoRGVsYXllZEV4Y2VwdGlvbnMsXG5cdFx0XHRzO1xuXG5cdFx0aWYgKCAhbWVzc2FnZXMuaGFzT3duUHJvcGVydHkoIG1hdGNoZWRNZXNzYWdlICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yIChzIGluIHN1YnNjcmliZXJzKXtcblx0XHRcdGlmICggc3Vic2NyaWJlcnMuaGFzT3duUHJvcGVydHkocykpe1xuXHRcdFx0XHRjYWxsU3Vic2NyaWJlciggc3Vic2NyaWJlcnNbc10sIG9yaWdpbmFsTWVzc2FnZSwgZGF0YSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZURlbGl2ZXJ5RnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMgKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZGVsaXZlck5hbWVzcGFjZWQoKXtcblx0XHRcdHZhciB0b3BpYyA9IFN0cmluZyggbWVzc2FnZSApLFxuXHRcdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCAnLicgKTtcblxuXHRcdFx0Ly8gZGVsaXZlciB0aGUgbWVzc2FnZSBhcyBpdCBpcyBub3dcblx0XHRcdGRlbGl2ZXJNZXNzYWdlKG1lc3NhZ2UsIG1lc3NhZ2UsIGRhdGEsIGltbWVkaWF0ZUV4Y2VwdGlvbnMpO1xuXG5cdFx0XHQvLyB0cmltIHRoZSBoaWVyYXJjaHkgYW5kIGRlbGl2ZXIgbWVzc2FnZSB0byBlYWNoIGxldmVsXG5cdFx0XHR3aGlsZSggcG9zaXRpb24gIT09IC0xICl7XG5cdFx0XHRcdHRvcGljID0gdG9waWMuc3Vic3RyKCAwLCBwb3NpdGlvbiApO1xuXHRcdFx0XHRwb3NpdGlvbiA9IHRvcGljLmxhc3RJbmRleE9mKCcuJyk7XG5cdFx0XHRcdGRlbGl2ZXJNZXNzYWdlKCBtZXNzYWdlLCB0b3BpYywgZGF0YSwgaW1tZWRpYXRlRXhjZXB0aW9ucyApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBtZXNzYWdlSGFzU3Vic2NyaWJlcnMoIG1lc3NhZ2UgKXtcblx0XHR2YXIgdG9waWMgPSBTdHJpbmcoIG1lc3NhZ2UgKSxcblx0XHRcdGZvdW5kID0gQm9vbGVhbihtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggdG9waWMgKSAmJiBoYXNLZXlzKG1lc3NhZ2VzW3RvcGljXSkpLFxuXHRcdFx0cG9zaXRpb24gPSB0b3BpYy5sYXN0SW5kZXhPZiggJy4nICk7XG5cblx0XHR3aGlsZSAoICFmb3VuZCAmJiBwb3NpdGlvbiAhPT0gLTEgKXtcblx0XHRcdHRvcGljID0gdG9waWMuc3Vic3RyKCAwLCBwb3NpdGlvbiApO1xuXHRcdFx0cG9zaXRpb24gPSB0b3BpYy5sYXN0SW5kZXhPZiggJy4nICk7XG5cdFx0XHRmb3VuZCA9IEJvb2xlYW4obWVzc2FnZXMuaGFzT3duUHJvcGVydHkoIHRvcGljICkgJiYgaGFzS2V5cyhtZXNzYWdlc1t0b3BpY10pKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZm91bmQ7XG5cdH1cblxuXHRmdW5jdGlvbiBwdWJsaXNoKCBtZXNzYWdlLCBkYXRhLCBzeW5jLCBpbW1lZGlhdGVFeGNlcHRpb25zICl7XG5cdFx0dmFyIGRlbGl2ZXIgPSBjcmVhdGVEZWxpdmVyeUZ1bmN0aW9uKCBtZXNzYWdlLCBkYXRhLCBpbW1lZGlhdGVFeGNlcHRpb25zICksXG5cdFx0XHRoYXNTdWJzY3JpYmVycyA9IG1lc3NhZ2VIYXNTdWJzY3JpYmVycyggbWVzc2FnZSApO1xuXG5cdFx0aWYgKCAhaGFzU3Vic2NyaWJlcnMgKXtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoIHN5bmMgPT09IHRydWUgKXtcblx0XHRcdGRlbGl2ZXIoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2V0VGltZW91dCggZGVsaXZlciwgMCApO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKlx0UHViU3ViLnB1Ymxpc2goIG1lc3NhZ2VbLCBkYXRhXSApIC0+IEJvb2xlYW5cblx0ICpcdC0gbWVzc2FnZSAoU3RyaW5nKTogVGhlIG1lc3NhZ2UgdG8gcHVibGlzaFxuXHQgKlx0LSBkYXRhOiBUaGUgZGF0YSB0byBwYXNzIHRvIHN1YnNjcmliZXJzXG5cdCAqXHRQdWJsaXNoZXMgdGhlIHRoZSBtZXNzYWdlLCBwYXNzaW5nIHRoZSBkYXRhIHRvIGl0J3Mgc3Vic2NyaWJlcnNcblx0KiovXG5cdFB1YlN1Yi5wdWJsaXNoID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEgKXtcblx0XHRyZXR1cm4gcHVibGlzaCggbWVzc2FnZSwgZGF0YSwgZmFsc2UsIFB1YlN1Yi5pbW1lZGlhdGVFeGNlcHRpb25zICk7XG5cdH07XG5cblx0LyoqXG5cdCAqXHRQdWJTdWIucHVibGlzaFN5bmMoIG1lc3NhZ2VbLCBkYXRhXSApIC0+IEJvb2xlYW5cblx0ICpcdC0gbWVzc2FnZSAoU3RyaW5nKTogVGhlIG1lc3NhZ2UgdG8gcHVibGlzaFxuXHQgKlx0LSBkYXRhOiBUaGUgZGF0YSB0byBwYXNzIHRvIHN1YnNjcmliZXJzXG5cdCAqXHRQdWJsaXNoZXMgdGhlIHRoZSBtZXNzYWdlIHN5bmNocm9ub3VzbHksIHBhc3NpbmcgdGhlIGRhdGEgdG8gaXQncyBzdWJzY3JpYmVyc1xuXHQqKi9cblx0UHViU3ViLnB1Ymxpc2hTeW5jID0gZnVuY3Rpb24oIG1lc3NhZ2UsIGRhdGEgKXtcblx0XHRyZXR1cm4gcHVibGlzaCggbWVzc2FnZSwgZGF0YSwgdHJ1ZSwgUHViU3ViLmltbWVkaWF0ZUV4Y2VwdGlvbnMgKTtcblx0fTtcblxuXHQvKipcblx0ICpcdFB1YlN1Yi5zdWJzY3JpYmUoIG1lc3NhZ2UsIGZ1bmMgKSAtPiBTdHJpbmdcblx0ICpcdC0gbWVzc2FnZSAoU3RyaW5nKTogVGhlIG1lc3NhZ2UgdG8gc3Vic2NyaWJlIHRvXG5cdCAqXHQtIGZ1bmMgKEZ1bmN0aW9uKTogVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBhIG5ldyBtZXNzYWdlIGlzIHB1Ymxpc2hlZFxuXHQgKlx0U3Vic2NyaWJlcyB0aGUgcGFzc2VkIGZ1bmN0aW9uIHRvIHRoZSBwYXNzZWQgbWVzc2FnZS4gRXZlcnkgcmV0dXJuZWQgdG9rZW4gaXMgdW5pcXVlIGFuZCBzaG91bGQgYmUgc3RvcmVkIGlmXG5cdCAqXHR5b3UgbmVlZCB0byB1bnN1YnNjcmliZVxuXHQqKi9cblx0UHViU3ViLnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBtZXNzYWdlLCBmdW5jICl7XG5cdFx0aWYgKCB0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gbWVzc2FnZSBpcyBub3QgcmVnaXN0ZXJlZCB5ZXRcblx0XHRpZiAoICFtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eSggbWVzc2FnZSApICl7XG5cdFx0XHRtZXNzYWdlc1ttZXNzYWdlXSA9IHt9O1xuXHRcdH1cblxuXHRcdC8vIGZvcmNpbmcgdG9rZW4gYXMgU3RyaW5nLCB0byBhbGxvdyBmb3IgZnV0dXJlIGV4cGFuc2lvbnMgd2l0aG91dCBicmVha2luZyB1c2FnZVxuXHRcdC8vIGFuZCBhbGxvdyBmb3IgZWFzeSB1c2UgYXMga2V5IG5hbWVzIGZvciB0aGUgJ21lc3NhZ2VzJyBvYmplY3Rcblx0XHR2YXIgdG9rZW4gPSAndWlkXycgKyBTdHJpbmcoKytsYXN0VWlkKTtcblx0XHRtZXNzYWdlc1ttZXNzYWdlXVt0b2tlbl0gPSBmdW5jO1xuXG5cdFx0Ly8gcmV0dXJuIHRva2VuIGZvciB1bnN1YnNjcmliaW5nXG5cdFx0cmV0dXJuIHRva2VuO1xuXHR9O1xuXG5cdC8qIFB1YmxpYzogQ2xlYXJzIGFsbCBzdWJzY3JpcHRpb25zXG5cdCAqL1xuXHRQdWJTdWIuY2xlYXJBbGxTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gY2xlYXJBbGxTdWJzY3JpcHRpb25zKCl7XG5cdFx0bWVzc2FnZXMgPSB7fTtcblx0fTtcblxuXHQvKlB1YmxpYzogQ2xlYXIgc3Vic2NyaXB0aW9ucyBieSB0aGUgdG9waWNcblx0Ki9cblx0UHViU3ViLmNsZWFyU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uIGNsZWFyU3Vic2NyaXB0aW9ucyh0b3BpYyl7XG5cdFx0dmFyIG07IFxuXHRcdGZvciAobSBpbiBtZXNzYWdlcyl7XG5cdFx0XHRpZiAobWVzc2FnZXMuaGFzT3duUHJvcGVydHkobSkgJiYgbS5pbmRleE9mKHRvcGljKSA9PT0gMCl7XG5cdFx0XHRcdGRlbGV0ZSBtZXNzYWdlc1ttXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0LyogUHVibGljOiByZW1vdmVzIHN1YnNjcmlwdGlvbnMuXG5cdCAqIFdoZW4gcGFzc2VkIGEgdG9rZW4sIHJlbW92ZXMgYSBzcGVjaWZpYyBzdWJzY3JpcHRpb24uXG5cdCAqIFdoZW4gcGFzc2VkIGEgZnVuY3Rpb24sIHJlbW92ZXMgYWxsIHN1YnNjcmlwdGlvbnMgZm9yIHRoYXQgZnVuY3Rpb25cblx0ICogV2hlbiBwYXNzZWQgYSB0b3BpYywgcmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBmb3IgdGhhdCB0b3BpYyAoaGllcmFyY2h5KVxuXHQgKlxuXHQgKiB2YWx1ZSAtIEEgdG9rZW4sIGZ1bmN0aW9uIG9yIHRvcGljIHRvIHVuc3Vic2NyaWJlLlxuXHQgKlxuXHQgKiBFeGFtcGxlc1xuXHQgKlxuXHQgKlx0XHQvLyBFeGFtcGxlIDEgLSB1bnN1YnNjcmliaW5nIHdpdGggYSB0b2tlblxuXHQgKlx0XHR2YXIgdG9rZW4gPSBQdWJTdWIuc3Vic2NyaWJlKCdteXRvcGljJywgbXlGdW5jKTtcblx0ICpcdFx0UHViU3ViLnVuc3Vic2NyaWJlKHRva2VuKTtcblx0ICpcblx0ICpcdFx0Ly8gRXhhbXBsZSAyIC0gdW5zdWJzY3JpYmluZyB3aXRoIGEgZnVuY3Rpb25cblx0ICpcdFx0UHViU3ViLnVuc3Vic2NyaWJlKG15RnVuYyk7XG5cdCAqXG5cdCAqXHRcdC8vIEV4YW1wbGUgMyAtIHVuc3Vic2NyaWJpbmcgYSB0b3BpY1xuXHQgKlx0XHRQdWJTdWIudW5zdWJzY3JpYmUoJ215dG9waWMnKTtcblx0ICovXG5cdFB1YlN1Yi51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHZhbHVlKXtcblx0XHR2YXIgaXNUb3BpYyAgICA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZXMuaGFzT3duUHJvcGVydHkodmFsdWUpLFxuXHRcdFx0aXNUb2tlbiAgICA9ICFpc1RvcGljICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG5cdFx0XHRpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nLFxuXHRcdFx0cmVzdWx0ID0gZmFsc2UsXG5cdFx0XHRtLCBtZXNzYWdlLCB0O1xuXG5cdFx0aWYgKGlzVG9waWMpe1xuXHRcdFx0ZGVsZXRlIG1lc3NhZ2VzW3ZhbHVlXTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKCBtIGluIG1lc3NhZ2VzICl7XG5cdFx0XHRpZiAoIG1lc3NhZ2VzLmhhc093blByb3BlcnR5KCBtICkgKXtcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2VzW21dO1xuXG5cdFx0XHRcdGlmICggaXNUb2tlbiAmJiBtZXNzYWdlW3ZhbHVlXSApe1xuXHRcdFx0XHRcdGRlbGV0ZSBtZXNzYWdlW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXN1bHQgPSB2YWx1ZTtcblx0XHRcdFx0XHQvLyB0b2tlbnMgYXJlIHVuaXF1ZSwgc28gd2UgY2FuIGp1c3Qgc3RvcCBoZXJlXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNGdW5jdGlvbikge1xuXHRcdFx0XHRcdGZvciAoIHQgaW4gbWVzc2FnZSApe1xuXHRcdFx0XHRcdFx0aWYgKG1lc3NhZ2UuaGFzT3duUHJvcGVydHkodCkgJiYgbWVzc2FnZVt0XSA9PT0gdmFsdWUpe1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgbWVzc2FnZVt0XTtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xufSkpO1xuIiwidmFyIHNpID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJywgdGljaztcbmlmIChzaSkge1xuICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH07XG59IGVsc2Uge1xuICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldFRpbWVvdXQoZm4sIDApOyB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpY2s7Il19
