/**
 * Including JS Partials
 */

(function (window) {
	'use strict';

	/**
	 * 	JQUERY FUNCTIONS
	 */

	// Get element(s) by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
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
		if(document.readyState !== 'loading') {
			callback();
		} else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	};

	/**
	 * 	NO JQUERY FUNCTIONS
	 */

	/**
	 * Throws a new Error
	 */
	window.makeError = function(name, msg, data) {
		var error = {};
		error.name = name;
		error.msg = msg;
		if(data) {
			error.data = data;
		}
		console.error(error.msg);
	};

	/**
	 * Create a slider using noUiSlider
	 * @param  {DOM Node} element HTML Node of the slider
	 * @param  {object} options Slider options
	 */
	window.createSlider = function(element, options) {
		if(typeof noUiSlider === 'undefined') {
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

 	  for(key in inputMap) {
 	    if(configMap.hasOwnProperty(key)) {
 	      if(inputMap[key] instanceof Object) {
 	        window.setConfigMap(inputMap[key], configMap[key]);
 	      } else {
 	        configMap[key] = inputMap[key];
 	      }
 	    } else {
				window.makeError('Wrong inputMap', 'Property "' + key + '" is not available in configMap');
			}
 	  }
 	};

	// Allow for looping on nodes by chaining and using forEach on both Nodelists and HTMLCollections
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
	HTMLCollection.prototype.forEach = Array.prototype.forEach;
})(window);


(function (window) {
	'use strict';

  var defaultModel = {
    aboutAge: 35,
    aboutSituation: 'married',
    aboutLiving: 'own',
    aboutIncome: 60000,
    aboutBasicRate: 45,
    aboutDiscretionaryRate: 25,
    aboutSavingsRate: 30,
		annualSavings: 18000,
		currentSavings: 1000,
    //aboutStage: 'home',
    basicNeeds: 27000,
		lastUserStep: 1,
    discretionaryExpenses: 15000,
		pickedGoals: [],
    savedActions: []
  };

	/**
	 * Creates a new Model instance which saves data on local storage.
	 * @param {string} name The name of the localstorage
	 */
	var Model = function(name) {
    this._dbName = name;

    if(typeof Storage === undefined) {
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

  /**
   * Returns the value of the property in the model.
   * @param  {string} property The name of the property
   */
  Model.prototype.read = function(property) {
    var data = JSON.parse(localStorage[this._dbName]);
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
	Model.prototype.update = function (property, updateData, callback) {
	   var data = JSON.parse(localStorage[this._dbName]);
     var user = data.user;

     user[property] = updateData;

     localStorage[this._dbName] = JSON.stringify(data);

		 callback = callback || function() {};
		 callback(updateData);
	};

	/**
	 * Update basic needs, discretionary and annual savings actual values based on rates
	 */
	Model.prototype.updateMoneyValues = function(callback) {
		var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

		user.basicNeeds = user.aboutIncome * user.aboutBasicRate * 0.01;
		user.discretionaryExpenses = user.aboutIncome * user.aboutDiscretionaryRate * 0.01;
		user.annualSavings = user.aboutIncome * user.aboutSavingsRate * 0.01;

		localStorage[this._dbName] = JSON.stringify(data);

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
	Model.prototype.toggleGoal = function(goal) {
		var data = JSON.parse(localStorage[this._dbName]);
		var goals = data.user.pickedGoals;

		var i = 0, alreadyPicked = false;
		for(i = 0; i < goals.length && !alreadyPicked; i++) {
			if(goals[i].name === goal.name) {
				goals.splice(i, 1);
				alreadyPicked = true;
			}
		}

		if(!alreadyPicked) {
			goals.push(goal);
		}

		localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * Update the array of saved adding or removing the goal
	 * @param  {object} action The action to remove or add to the list
	 */
	Model.prototype.toggleActions = function(action) {
		var data = JSON.parse(localStorage[this._dbName]);
		var actions = data.user.savedActions;

		var i = 0, alreadySaved = false;
		for(i = 0; i < actions.length && !alreadySaved; i++) {
			if(actions[i].id === action.id) {
				actions.splice(i, 1);
				alreadySaved = true;
			}
		}

		if(!alreadySaved) {
			actions.push(action);
		}

		localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * [remove description]
	 * @param  {string} property The name of the property to be removed from model.
	 */
	Model.prototype.remove = function (property) {
    var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

    delete user[property];

    localStorage[this._dbName] = JSON.stringify(data);
	};

	/**
	 * WARNING: Will remove ALL data from storage.
	 */
	Model.prototype.reset = function () {
		localStorage[this._dbName] = JSON.stringify({ user: defaultModel });
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);


/* Templates */
var app = window.app || {};

app.views = {};


app.views.about = (function(window, noUiSlider) {
  var configMap = {
    ageSlider: 'about__age__slider',
    incomeSlider: 'about__income__slider',
    ageOptions: {
      start: 35,
      step: 1,
      range: {'min': 18, 'max': 65},
      pips: {mode: 'values', values: [20, 30, 40, 50, 60, 65], density: 5},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    incomeOptions: {
      start: 60000,
      step: 1000,
      range: {'min': 18000, 'max': 200000},
      format: wNumb({decimals: 1, thousand: '.'})
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
    if(slider.classList.contains(configMap.incomeSlider)) {
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
    if(event === 'ageChanged') {
      ageSlider.noUiSlider.on('change', function(values) {
        handler( Number(values[0]) );
      });
    } else if(event === 'incomeChanged') {
      incomeSlider.noUiSlider.on('change', function(values) {
        handler( Number(values[0].replace('.', '')) );
      });
    } else if(event === 'situationChanged') {
      situation.addEventListener('change', function(event){
        handler(event.target.value);
      });
    } else if(event === 'livingChanged') {
      living.addEventListener('change', function(event){
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

  return {
    bind: bind,
    configModule: configModule,
    init: init
  };

})(window, noUiSlider);

app.views.you = (function(window) {
  var configMap = {
    aboutIncome: 60000,
    needsSlider: 'about__savings__slider--needs',
    expensesSlider: 'about__savings__slider--expenses',
    savingsSlider: 'current-savings__slider',
    //Slider options
    needsOptions: {
      start: 45,
      step: 1,
      range: {'min': 1, 'max': 60},
      format: wNumb({decimals: 0})
    },
    expensesOptions: {
      start: 25,
      step: 1,
      range: {'min': 1, 'max': 40},
      format: wNumb({decimals: 0})
    },
    savingsOptions: {
      start: 10000,
      step: 1000,
      range: {'min': 1000, 'max': 100000},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    //Doughnut options
    doughnutClass: 'about__savings__circle',
    doughnutData: {
        series: [{value: 45, name: 'Basic Needs'}, {value: 25,name: 'Discretionary'}]
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
      if(data.type === 'slice') {
        var pathLength = data.element._node.getTotalLength();
        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });
        var animationDefinition = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1000,
            from: -pathLength + 'px',
            to:  '0px',
            easing: Chartist.Svg.Easing.easeOutQuint,
            fill: 'freeze'
          }
        };

        if(data.index !== 0) {
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
      moneyFormat.to(Number(value)/100 * configMap.aboutIncome ) ).show();
    });

    //For mobiles
    $chart.on('click', '.ct-slice-donut', function() {
      if(!isTooltipShown) {
        var $slice = $(this),
          value = $slice.attr('ct:value'),
          seriesName = $slice.parent().attr('ct:series-name');
        $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
        moneyFormat.to(Number(value)/100 * configMap.aboutIncome ) ).show();
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
    if(slider.classList.contains(configMap.savingsSlider)) {
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
    if(slider === 'needsSlider') {
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
    if(event === 'basicNeedsChanged') {
      needsSlider.noUiSlider.on('change', function(values){
        updateDOMDoughnut('needsSlider', values);
        handler(configMap.doughnutData.series[0].value, configMap.doughnutData.series[2].value);
      });
    } else if(event === 'expensesChanged') {
      expensesSlider.noUiSlider.on('change', function(values){
        updateDOMDoughnut('expensesSlider', values);
        handler(configMap.doughnutData.series[1].value, configMap.doughnutData.series[2].value);
      });
    } else if(event === 'savingsChanged') {
      savingsSlider.noUiSlider.on('change', function(values){
        handler( Number(values[0].replace('.', '')) );
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

  return {
    bind: bind,
    configModule: configModule,
    init: init
  };

})(window);

app.views.pyramid = (function() {
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

  return {
    configModule: configModule,
    init: init,
    updateLabels: updateLabels
  };

})();

app.views.scenarios = (function(window, Chartist, wNumb) {
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
      range: {'min': 1, 'max': 100},
      format: wNumb({ decimals: 0})
    },
    incomeOptions: {
      start: 60000,
      step: 1000,
      range: {'min': 18000, 'max': 200000},
      format: wNumb({decimals: 1, thousand: '.'})
    },
    investmentOptions: {
      start: 100,
      step: 1,
      range: {'min': 1, 'max': 100},
      format: wNumb({ decimals: 0})
    },
    retirementOptions: {
      start: 65,
      step: 1,
      range: {'min': 65, 'max': 70},
      format: wNumb({ decimals: 0})
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
    if(format === '%') {
      tooltip.innerHTML = values[0] + '%';
    } else if(format === '$') {
      tooltip.innerHTML = '$' + values[0];
    } else {
      tooltip.innerHTML = values[0];
    }
  };

  var bindSlidersToChart = function() {
    savingRateSlider.noUiSlider.on('change', function( values ){
      configMap.savingsRate = Number(values[0]);
      updateLineChart();
    });
    incomeRateSlider.noUiSlider.on('change', function( values ){
      configMap.income = Number(values[0].replace('.', ''));
      updateLineChart();
    });

    //Advanced options
    investmentRateSlider.noUiSlider.on('change', function( values ){
      configMap.investment = Number(values[0]);
      updateLineChart();
    });
    retirementSlider.noUiSlider.on('change', function( values ){
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
   * @return {number}
   */
  var getAccumulatedValue = function(interestRate, term, amtInvested, contribAmt) {
      var app = [];
      app[0] = amtInvested;
      var total = 0;
      var monthlyTerm = term * 12;
      var monthlyContribAmt = contribAmt / 12;

      for (var i = 1; i <= monthlyTerm; i++) {
          var appreciation = (interestRate/12) * (app[i - 1]);
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
   * @return {Array}
   */
  var getAbscissas = function(firstValue, lastValue) {
    var values = [];
    values[0] = firstValue;
    values[5] = lastValue;

    var difference = (lastValue - firstValue) / 5;
    for(var i = 1; i < 5; i++) {
      values[i] = Math.round( firstValue + (difference * i) );
    }

    return values;
  };

  var updateLineChart = function() {
    var xValues = getAbscissas(configMap.aboutAge, configMap.retirementAge);
    var i = 0;

    configMap.chartData.labels = xValues;
    configMap.annualSavings = (configMap.savingsRate/100) * configMap.income * (configMap.investment/100);

    configMap.chartData.series[0][0] = configMap.currentSavings;
    for(i = 1; i < 6; i+=1) {
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
    if(slider === 'income') {
      incomeRateSlider.noUiSlider.set(value);
    } else if(slider === 'savingsRate') {
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

  return {
    updateLineChart: updateLineChart,
    configModule: configModule,
    init: init,
    getAbscissas: getAbscissas,
    setSlider: setSlider
  };

})(window, Chartist, wNumb);

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

app.views.retirement = (function() {
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
    if(event === 'actionToggled') {
      tbody.addEventListener('click', function(event) {
        var target = event.target;
        if(target.nodeName === 'I' && target.classList.contains('zmdi-check-circle')) {
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
      if(request.status >=200 && request.status < 400) {
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

  return {
    bind: bind,
    init: init
  };

})();

app.views.plan = (function() {
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

    var planActions = [
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      },
      {
        title: 'Play a stay-cation',
        type: 'Variable expense',
        date: 'November 28th 2016',
        details: 'Bank what you save'
      }
    ];

    var tHead = '<table class="table"><thead><tr><th>Title</th><th>type</th><th>Date</th><th>Details</th></tr></thead>',
      tBody = '<tbody>';

      for(var i = 0; i < planActions.length; i++) {
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

  return {
    init: init
  };

})();


/* Components */
app.views.nav = (function() {
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
    if (nodeName === 'SPAN') {
      nextStep = e.target.dataset.template;
      clickedLink = e.target.parentNode;
    } else if (nodeName === 'LI') {
      nextStep = e.target.firstElementChild.dataset.template;
      clickedLink = e.target;
    }
    // if(!clickedLink.classList.contains('disabled') && configMap.blocking) {
      setActive(clickedLink, 'active');
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
      setActive(nextStepElement, 'show');
    // }
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
    var i;
    var navItems = nav.getElementsByTagName('li');
    for(i = start; i < navItems.length; i++) {
      navItems[i].classList.add('disabled');
    }
  };

  return {
    init: init,
    setDisabledLinks: setDisabledLinks
  };
})();

(function() {

  var toggle = document.querySelector('.c-hamburger');
  toggleHandler(toggle);

  function toggleHandler(toggle) {
    toggle.addEventListener( 'click', function(e) {
      e.preventDefault();
      if(this.classList.contains('is-active')) {
        document.body.classList.remove('menu-open');
        this.classList.remove('is-active');
      } else {
        document.body.classList.add('menu-open');
        this.classList.add('is-active');
      }
    });
  }

})();

app.views.continue = (function() {
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
    if(newActiveNavLink) {
      //Activate the navigation item
      if(newActiveNavLink.classList.contains('disabled')) {
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
    if(event === 'continueClicked') {
      continueButtons.forEach(function(element) {
        element.addEventListener('click', function(event) {
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

  return {
    bind: bind,
    init: init
  };

})();


var app = window.app || {};

app.shell = (function(window, PubSub) {
  var data;

  /**
   * VIEWS CONTROLLERS
   */

  /**
   * 2-About
   */
  var aboutController = function() {
    app.views.about.bind('ageChanged', function(value) {
      wealthApp.model.update('aboutAge', value, function(value) {
        PubSub.publish('ageChanged', value);
      });
    });
    app.views.about.bind('incomeChanged', function(value) {
      wealthApp.model.update('aboutIncome', value, function(value) {
        PubSub.publish('aboutIncomeChanged', value);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });
    app.views.about.bind('situationChanged', function(value) {
      wealthApp.model.update('aboutSituation', value);
    });
    app.views.about.bind('livingChanged', function(value) {
      wealthApp.model.update('aboutLiving', value);
    });
  };

  /**
   * 3-You
   */
  var youSubscriber = function(topic, data) {
    if(topic === 'aboutIncomeChanged') {
      app.views.you.configModule({
        aboutIncome: data
      });
    }
  };

  var youController = function() {
    app.views.you.bind('basicNeedsChanged', function(basicRate, savingsRate) {
      wealthApp.model.update('aboutBasicRate', basicRate);
      wealthApp.model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
        PubSub.publish('savingsRateChanged', savingsRate);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });
    app.views.you.bind('expensesChanged', function(expensesRate, savingsRate) {
      wealthApp.model.update('aboutDiscretionaryRate', expensesRate);
      wealthApp.model.update('aboutSavingsRate', savingsRate, function(savingsRate) {
        PubSub.publish('savingsRateChanged', savingsRate);
      });
      wealthApp.model.updateMoneyValues(function(moneyValues) {
        PubSub.publish('moneyValuesChanged', moneyValues);
      });
    });
    app.views.you.bind('savingsChanged', function(currentSavings) {
      wealthApp.model.update('currentSavings', currentSavings, function(currentSavings) {
        PubSub.publish('currentSavingsChanged', currentSavings);
      });
    });

    PubSub.subscribe('aboutIncomeChanged', youSubscriber);
  };

  /**
   * 5-Pyramid
   */
  var pyramidSubscriber = function(topic, data) {
    if(topic === 'aboutIncomeChanged') {
      app.views.pyramid.configModule({
        aboutIncome: data
      });
    } else if(topic === 'moneyValuesChanged') {
      app.views.pyramid.configModule(data);
    }
    app.views.pyramid.updateLabels();
  };

  var pyramidController = function() {
    PubSub.subscribe('aboutIncomeChanged', pyramidSubscriber);
    PubSub.subscribe('moneyValuesChanged', pyramidSubscriber);
  };

  /**
   * 6-Scenarios
   */
  var scenariosSubscriber = function(topic, data) {
    if(topic === 'ageChanged') {
      app.views.scenarios.configModule({aboutAge: data});
    } else if(topic === 'aboutIncomeChanged') {
      app.views.scenarios.configModule({income: data});
      app.views.scenarios.setSlider('income', data);
    } else if(topic === 'savingsRateChanged') {
      app.views.scenarios.configModule({savingsRate: data});
      app.views.scenarios.setSlider('savingsRate', data);
    } else if(topic === 'currentSavingsChanged') {
      app.views.scenarios.configModule({currentSavings: data});
    }

    app.views.scenarios.updateLineChart();
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
    app.views.goal.bind('goalToggled', function(goal) {
      wealthApp.model.toggleGoal(goal);
    });
  };

  /**
   * 8-Retirement
   */
  var retirementController = function() {
    app.views.retirement.bind('actionToggled', function(action) {
      wealthApp.model.toggleActions(action);
    });
  };

  /**
   * COMPONENTS CONTROLLERS
   */

  /**
   * Navigation
   */
  var navController = function() {
    app.views.nav.setDisabledLinks(data.lastUserStep);
  };

  /**
   * Continue button
   */
  var continueController = function() {
    app.views.continue.bind('continueClicked', function(nextActiveNavLink) {
      //When user is on the last step the value of 'nextActiveNavLink' is 'false'
      if(nextActiveNavLink) {
        var lastUserStep = Number(
          nextActiveNavLink
            .getElementsByClassName('step-number')[0]
            .textContent
        );
        var savedLastStep = data.lastUserStep;
        if(lastUserStep > savedLastStep) {
          wealthApp.model.update('lastUserStep', lastUserStep);
        }
      }
    });
  };


  /**
   * PUBLIC FUNCTIONS
   */

  var init = function() {
    data = wealthApp.model.read();
    //Screen #2
    var aboutContainer = document.getElementsByClassName('about-wrapper')[0];
    app.views.about.configModule({
      ageOptions: {
        start: data.aboutAge
      },
      incomeOptions: {
        start: data.aboutIncome
      },
      aboutSituation: data.aboutSituation,
      aboutLiving: data.aboutLiving
    });
    app.views.about.init(aboutContainer);
    aboutController();

    //Screen #3
    var youContainer = document.getElementsByClassName('you-wrapper')[0];
    app.views.you.configModule({
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
          series: [{value: data.aboutBasicRate, name: 'Basic Needs'}, {value: data.aboutDiscretionaryRate,name: 'Discretionary'}]
      }
    });
    app.views.you.init(youContainer);
    youController();

    //Screen #5
    var pyramidContainer = document.getElementsByClassName('pyramid-wrapper')[0];
    app.views.pyramid.configModule({
      basicNeeds: data.basicNeeds,
      annualSavings: data.annualSavings,
      discretionaryExpenses: data.discretionaryExpenses,
      aboutIncome: data.aboutIncome
    });
    app.views.pyramid.init(pyramidContainer);
    pyramidController();

    //Screen #6
    var scenariosContainer = document.getElementsByClassName('scenarios-wrapper')[0];
    app.views.scenarios.configModule({
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
        labels: app.views.scenarios.getAbscissas(data.aboutAge, 65)
      }
    });
    app.views.scenarios.init(scenariosContainer);
    scenariosController();

    //Screen #7
    var goalContainer = document.getElementsByClassName('goal-wrapper')[0];
    app.views.goal.init(goalContainer);
    goalController();

    //Screen #8
    var retirementContainer = document.getElementsByClassName('retirement-wrapper')[0];
    app.views.retirement.init(retirementContainer);
    retirementController();

    //Screen #9
    var planContainer = document.getElementsByClassName('plan-wrapper')[0];
    app.views.plan.init(planContainer);


    /* COMPONENTS */

    //Navigation
    app.views.nav.init();
    navController();

    //Continue buttons
    app.views.continue.init();
    continueController();

    /* DEVELOPMENT ONLY */
    var resetButton = document.getElementsByClassName('reset-model')[0];
    resetButton.addEventListener('click', function() {
      wealthApp.model.reset();
      document.location.reload();
    });
  };

  return {
    init: init
  };

})(window, PubSub);

(function() {

  var init = function(window) {
    var WealthApp = function(name) {
      this.model = new app.Model(name);
    };

    window.wealthApp = new WealthApp('wealth');

    app.shell.init();
  };

  // Export to window
	window.app = window.app || {};
	window.app.init = init;

})();

app.init(window);

