'use strict';

/**
 * Including JS Partials
 */

(function (window) {
	'use strict';

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

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);

(function (window) {
	'use strict';

  var defaultModel = {
    aboutAge: 20,
    aboutSituation: 'married',
    aboutLiving: 'rent',
    aboutIncome: 60000,
    aboutBasicRate: 45,
    aboutDiscretionaryRate: 25,
    aboutSavingsRate: 30,
    //aboutStage: 'home',
    basicNeeds: 27000,
    discretionaryExpenses: 15000,
    savings: 18000,
    pickedGoals: [],
    savedActions: []
  };

	/**
	 * Creates a new Model instance which saves data on local storage.
	 *
	 * @constructor
	 * @param {object} storage A reference to the client side storage class
	 */
	var Model = function(name) {
    this._dbName = name;

    if(typeof Storage === undefined) {
      console.log('Error: localStorage is not supported.');
      return;
    }

		var data = {
			user: defaultModel
		};

		localStorage[name] = JSON.stringify(data);
	}

  /**
   * Returns the value of the property in the model.
   * @param  {string} property The name of the property
   */
  Model.prototype.read = function(property) {
    var data = JSON.parse(localStorage[this._dbName]);
    var user = data.user;

    return user[property];
  };

	/**
	 * Updates model by giving it the property name and its value.
	 * @param  {string} property   The name of the property to update
	 * @param  {object} updateData The new value of the property
	 */
	Model.prototype.update = function (property, updateData) {
	   var data = JSON.parse(localStorage[this._dbName]);
     var user = data.user;

     user[property] = updateData;

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


/*global app, $on */
var gModel = {
  aboutAge: 20,
  aboutSituation: 'married',
  aboutLiving: 'rent',
  aboutIncome: 60000,
  aboutBasicRate: 45,
  aboutDiscretionaryRate: 25,
  aboutSavingsRate: 30,
  //aboutStage: 'home',
  basicNeeds: 27000,
  discretionaryExpenses: 15000,
  savings: 18000,
  pickedGoals: [],
  savedActions: []
};

(function(window) {
  'use strict';

  var WealthApp = function(name) {
    this.model = new app.Model(name);
  };

  window.wealthApp = new WealthApp('wealth');


})(window);


/* Templates */


(function() {
  var aboutModule = {
    config: {
      wrapper: 'about-wrapper',
      ageSlider: 'about__age__slider',
      incomeSlider: 'about__income__slider',
      ageOptions: {
        start: 35,
        step: 1,
        range: {
          'min': 18,
          'max': 70
        },
        pips: {
          mode: 'values',
          values: [20, 30, 40, 50, 60, 70],
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
      }
    },

    init: function() {
      aboutModule.wrapper = document.getElementsByClassName(aboutModule.config.wrapper)[0];
      aboutModule.ageSlider = aboutModule.wrapper.getElementsByClassName(aboutModule.config.ageSlider)[0];
      aboutModule.incomeSlider = aboutModule.wrapper.getElementsByClassName(aboutModule.config.incomeSlider)[0];

      aboutModule.createSlider(aboutModule.ageSlider, aboutModule.config.ageOptions);
      aboutModule.ageSlider.noUiSlider.on('update', function(values) {
        aboutModule.eventHandler(aboutModule.ageSlider, values);
      });

      aboutModule.createSlider(aboutModule.incomeSlider, aboutModule.config.incomeOptions);
      aboutModule.incomeSlider.noUiSlider.on('update', function(values) {
        aboutModule.eventHandler(aboutModule.incomeSlider, values);
      });

      aboutModule.continueButton = aboutModule.wrapper.getElementsByClassName('continue')[0];
      aboutModule.continueButton.addEventListener('click', aboutModule.updateModel);
    },

    createSlider: function(element, options) {
      noUiSlider.create(element, options);
      element.handle = element.getElementsByClassName('noUi-handle')[0];
      element.tooltip = document.createElement('div');
      element.handle.appendChild(element.tooltip);

      element.tooltip.classList.add('slider-tooltip');
      element.tooltip.innerHTML = '<span></span>';
      element.tooltip = element.tooltip.firstElementChild;
    },

    eventHandler: function(slider, values) {
      var tooltip = slider.getElementsByTagName('span')[0];
      if(slider.classList.contains(aboutModule.config.incomeSlider)) {
        tooltip.innerHTML = '$' + values[0];
      } else {
        tooltip.innerHTML = values[0];
      }
    },

    updateModel: function() {
      var age = aboutModule.ageSlider.noUiSlider.get(),
        situation = aboutModule.wrapper.getElementsByClassName('about__select')[0].value,
        living = aboutModule.wrapper.getElementsByClassName('about__select')[1].value;

      gModel.aboutAge = parseInt(age);
      gModel.aboutSituation = situation;
      gModel.aboutLiving = living;

      console.log(gModel);
    }

  };

  aboutModule.init();

})();

(function() {
  var youModule = {
    config: {
      wrapper: 'you-wrapper',
      needsSlider: 'about__savings__slider--needs',
      expensesSlider: 'about__savings__slider--expenses',

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

      //Doughnut options
      doughnutClass: '.about__savings__circle',
      doughnutData: {
          series: [{
            value: 45,
            name: 'Basic Needs'
          },
          {
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
    },

    init: function() {
      //DOM Elements
      youModule.wrapper = document.getElementsByClassName(youModule.config.wrapper)[0];
      youModule.needsSlider = youModule.wrapper.getElementsByClassName(youModule.config.needsSlider)[0];
      youModule.expensesSlider = youModule.wrapper.getElementsByClassName(youModule.config.expensesSlider)[0];

      //Create sliders
      youModule.createSlider(youModule.needsSlider, youModule.config.needsOptions);
      youModule.needsSlider.noUiSlider.on('update', function(values) {
        youModule.sliderEventHandler(youModule.needsSlider, values);
      });

      youModule.createSlider(youModule.expensesSlider, youModule.config.expensesOptions);
      youModule.expensesSlider.noUiSlider.on('update', function(values) {
        youModule.sliderEventHandler(youModule.expensesSlider, values);
      });

      //Create Doughnut Chart
      youModule.createChart(youModule.config.doughnutClass,
        youModule.config.doughnutData,
        youModule.config.doughnutOptions,
        youModule.config.doughnutResponsiveOptions);

      //Update doughnut chart when sliders values change
      youModule.updateDoughnut();

      //Update the model when 'Continue' is pressed
      youModule.continueButton = youModule.wrapper.getElementsByClassName('continue')[0];
      youModule.continueButton.addEventListener('click', youModule.updateModel);
    },

    createSlider: function(element, options) {
      noUiSlider.create(element, options);
      element.handle = element.getElementsByClassName('noUi-handle')[0];
      element.tooltip = document.createElement('div');
      element.handle.appendChild(element.tooltip);

      element.tooltip.classList.add('slider-tooltip');
      element.tooltip.innerHTML = '<span></span>';
      element.tooltip = element.tooltip.firstElementChild;
    },

    sliderEventHandler: function(slider, values) {
      var tooltip = slider.getElementsByTagName('span')[0];
      tooltip.innerHTML = values[0] + '%';
    },

    createChart: function(element, data, options, responsiveOptions) {
      youModule.doughnutData = data;
      youModule.doughnutOptions = options;
      youModule.doughnutResponsiveOptions = responsiveOptions;
      youModule.doughnutData.series[2] = {
        value: 100 - youModule.doughnutData.series[0].value - youModule.doughnutData.series[1].value,
        name: 'Savings'
      };

      youModule.$pieChart = new Chartist.Pie(element,
        youModule.doughnutData,
        youModule.doughnutOptions,
        youModule.doughnutResponsiveOptions);

      youModule.animateDoughnut(youModule.$pieChart);

      youModule.createDoughnutTooltip();

    },

    animateDoughnut: function($pieChart) {
      $pieChart.on('draw', function(data) {
        if(data.type === 'slice') {
          // Get the total path length in order to use for dash array animation
          var pathLength = data.element._node.getTotalLength();

          // Set a dasharray that matches the path length as prerequisite to animate dashoffset
          data.element.attr({
            'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
          });

          // Create animation definition while also assigning an ID to the animation for later sync usage
          var animationDefinition = {
            'stroke-dashoffset': {
              id: 'anim' + data.index,
              dur: 1000,
              from: -pathLength + 'px',
              to:  '0px',
              easing: Chartist.Svg.Easing.easeOutQuint,
              // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
              fill: 'freeze'
            }
          };

          // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
          if(data.index !== 0) {
            animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
          }

          // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
          data.element.attr({
            'stroke-dashoffset': -pathLength + 'px'
          });

          // We can't use guided mode as the animations need to rely on setting begin manually
          // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
          data.element.animate(animationDefinition, false);
        }
      });
    },

    createDoughnutTooltip: function() {
      var $chart = $(youModule.config.doughnutClass),
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
        moneyFormat.to(parseInt(value)/100 * gModel.aboutIncome) ).show();
      });

      //For mobiles
      $chart.on('click', '.ct-slice-donut', function() {
        if(!isTooltipShown) {
          var $slice = $(this),
            value = $slice.attr('ct:value'),
            seriesName = $slice.parent().attr('ct:series-name');
          $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
          moneyFormat.to(parseInt(value)/100 * gModel.aboutIncome) ).show();
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
    },

    updateDoughnut: function() {
      youModule.needsSlider.noUiSlider.on('change', function(values){
        youModule.doughnutData.series[0].value = parseInt(values[0]);
        youModule.doughnutData.series[2].value = 100 - youModule.doughnutData.series[0].value - youModule.doughnutData.series[1].value;
        youModule.$pieChart.update();
      });
      youModule.expensesSlider.noUiSlider.on('change', function(values){
        youModule.doughnutData.series[1].value = parseInt(values[0]);
        youModule.doughnutData.series[2].value = 100 - youModule.doughnutData.series[0].value - youModule.doughnutData.series[1].value;
        youModule.$pieChart.update();
      });
    },

    updateModel: function() {
      gModel.aboutBasicRate = youModule.doughnutData.series[0].value;
      gModel.aboutDiscretionaryRate = youModule.doughnutData.series[1].value;
      gModel.aboutSavingsRate = youModule.doughnutData.series[2].value;
      gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
      gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
      gModel.savings = gModel.aboutIncome * gModel.aboutSavingsRate * 0.01;
      console.log(gModel);
    }

  };

  youModule.init();

})();

var Pyramid = (function() {
  var pyramidModule = {
    config: {
      savingsId: 'pyramid-savings',
      basicId: 'pyramid-basic',
      discretiotionaryId: 'pyramid-discretionary',
      incomeId: 'pyramid-income'
    },

    init: function() {
      pyramidModule.updateLabels();
    },

    updateLabels: function() {
      var savingsText = document.getElementById(pyramidModule.config.savingsId),
        basicText = document.getElementById(pyramidModule.config.basicId),
        discretionaryText = document.getElementById(pyramidModule.config.discretiotionaryId),
        incomeText = document.getElementById(pyramidModule.config.incomeId);

      var moneyFormat = wNumb({
        thousand: '.',
        prefix: '$ '
      });

      savingsText.textContent = ' ' + moneyFormat.to(gModel.savings) + '/yr';
      basicText.textContent = moneyFormat.to(gModel.basicNeeds) + '/yr';
      discretionaryText.textContent = moneyFormat.to(gModel.discretionaryExpenses) + '/yr';
      incomeText.textContent = moneyFormat.to(gModel.aboutIncome) + '/yr';
    }
  };

  pyramidModule.init();

  return {
    updateLabels: pyramidModule.updateLabels
  };

})();

var Scenarios = (function() {
  var scenariosModule = {
    config: {
      wrapper: 'scenarios-wrapper',

      //Sliders options
      savingRateSlider: 'option__slider--saving',
      incomeRateSlider: 'option__slider--income',
      savingRateOptions: {
        start: gModel.aboutSavingsRate,
        step: 1,
        range: {
          'min': 1,
          'max': 100
        },
        format: wNumb({
          decimals: 0
        })
      },
      incomeRateOptions: {
        start: gModel.aboutIncome,
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

      //Line chart options
      chartClass: '.scenario__chart',
      chartData: {
        labels: [18, 25, 35, 45, 55, 65],
        series: [
          [gModel.savings * 1, gModel.savings * 7, gModel.savings * 17, gModel.savings * 27, gModel.savings * 37, gModel.savings * 47]
        ]
      },
      chartOptions: {
        showArea: true,
        width: '410px',
        height: '250px',
        plugins: [
          Chartist.plugins.ctAxisTitle({
            axisX: {
              axisTitle: 'Age',
              axisClass: 'ct-axis-age',
              offset: {
                x: 0,
                y: 35
              },
              textAnchor: 'middle'
            },
            axisY: {
              axisTitle: 'Savings ($)',
              axisClass: 'ct-axis-savings',
              offset: {
                x: 0,
                y: 20
              },
              textAnchor: 'middle'
            }
          })
        ]
      }
    },

    init: function() {
      scenariosModule.wrapper = document.getElementsByClassName(scenariosModule.config.wrapper)[0];
      scenariosModule.savingRateSlider = scenariosModule.wrapper.getElementsByClassName(scenariosModule.config.savingRateSlider)[0];
      scenariosModule.incomeRateSlider = scenariosModule.wrapper.getElementsByClassName(scenariosModule.config.incomeRateSlider)[0];

      //Sliders
      scenariosModule.createSlider(scenariosModule.savingRateSlider, scenariosModule.config.savingRateOptions);
      scenariosModule.savingRateSlider.noUiSlider.on('update', function(values) {
        scenariosModule.eventHandler(scenariosModule.savingRateSlider, values);
      });

      scenariosModule.createSlider(scenariosModule.incomeRateSlider, scenariosModule.config.incomeRateOptions);
      scenariosModule.incomeRateSlider.noUiSlider.on('update', function(values) {
        scenariosModule.eventHandler(scenariosModule.incomeRateSlider, values);
      });

      //Line Chart
      scenariosModule.createLineChart(scenariosModule.config.chartData);
      scenariosModule.updateLineChart();
    },

    createSlider: function(element, options) {
      noUiSlider.create(element, options);
      element.handle = element.getElementsByClassName('noUi-handle')[0];
      element.tooltip = document.createElement('div');
      element.handle.appendChild(element.tooltip);

      element.tooltip.classList.add('slider-tooltip');
      element.tooltip.innerHTML = '<span></span>';
      element.tooltip = element.tooltip.firstElementChild;
    },

    eventHandler: function(slider, values) {
      var tooltip = slider.getElementsByTagName('span')[0];
      if(slider.classList.contains(scenariosModule.config.savingRateSlider)) {
        tooltip.innerHTML = values[0] + '%';
      } else {
        tooltip.innerHTML = '$' + values[0];
      }
    },

    createLineChart: function(data) {
      scenariosModule.chartData = data;

      scenariosModule.lineChart = new Chartist.Line(scenariosModule.config.chartClass, scenariosModule.chartData, scenariosModule.config.chartOptions);
    },

    updateLineChart: function() {
      scenariosModule.savingRateSlider.noUiSlider.on('change', function( values ){
        for(var i=0; i < scenariosModule.chartData.series[0].length; i++) {
          scenariosModule.chartData.series[0][i] = parseInt(values[0]) * 0.01 * gModel.aboutIncome * (scenariosModule.chartData.labels[i] - 18);
        }
        scenariosModule.lineChart.update(scenariosModule.chartData);
      });
      scenariosModule.incomeRateSlider.noUiSlider.on('change', function( values ){
        for(var i=0; i < scenariosModule.chartData.series[0].length; i++) {
          scenariosModule.chartData.series[0][i] = scenariosModule.savingRateSlider.noUiSlider.get() * 0.01 * parseInt(values[0].replace('.', '')) * (scenariosModule.chartData.labels[i] - 18);
        }
        scenariosModule.lineChart.update(scenariosModule.chartData);
      });
    },

    updateSeries: function() {
      return [gModel.savings * 1, gModel.savings * 7, gModel.savings * 17, gModel.savings * 27, gModel.savings * 37, gModel.savings * 47];
    }

  };

  scenariosModule.init();

  return scenariosModule;

})();

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

(function() {
  var retirementModule = {
    config: {
      wrapper: 'retirement-wrapper',
      jsonUrl: 'scripts/model/actions.json'
    },

    init: function() {
      retirementModule.wrapper = document.getElementsByClassName(retirementModule.config.wrapper)[0];
      retirementModule.loadJson(retirementModule.config.jsonUrl);
    },

    loadJson: function(jsonUrl) {
      var request = new XMLHttpRequest();
      request.open('GET', jsonUrl, true);
      request.onload = function() {
        if(request.status >=200 && request.status < 400) {
          retirementModule.data = JSON.parse(request.responseText);
          retirementModule.createActions();

          //Tooltips
          $('.retirement-wrapper .zmdi-info-outline').tooltip();

          //Update the model when 'Continue' is pressed
          retirementModule.continueButton = retirementModule.wrapper.getElementsByClassName('continue')[0];
          retirementModule.continueButton.addEventListener('click', retirementModule.updateModel);
        } else {
          console.log('Error with the connection.');
        }
      };
      request.onerror = function() {
        console.log('Error with the connection.');
      };
      request.send();
    },

    createActions: function() {
      var tbody = retirementModule.wrapper.getElementsByTagName('tbody')[0],
        row;

      retirementModule.data.actions.forEach(function(element, index) {
        row = document.createElement('tr');
        row.innerHTML = '<td><i class="zmdi zmdi-check-circle" data-action="' + index + '"></i></td>' +
          '<td>' + element.todo + '</td>' +
          '<td>' + element.todonot + '</td>' +
          '<td><i class="zmdi zmdi-info-outline" data-toggle="tooltip" data-placement="left" title="' + element.why + '"></i></td>';
          tbody.appendChild(row);
      });

      retirementModule.checkEventListener();
    },

    checkEventListener: function() {
      var checks = retirementModule.wrapper.getElementsByClassName('zmdi-check-circle');
      Array.prototype.forEach.call(checks, function(element) {
        element.addEventListener('click', function() {
          this.classList.toggle('saved');
        });
      });
    },

    updateModel: function() {
      gModel.savedActions = [];
      var checkedActions = retirementModule.wrapper.getElementsByClassName('saved');
      Array.prototype.forEach.call(checkedActions, function(element) {
        gModel.savedActions.push(retirementModule.data.actions[parseInt(element.dataset.action)]);
      });
      console.log(gModel.savedActions);
    }

  };

  retirementModule.init();

})();

(function() {
  var planModule = {
    config: {
      wrapper: 'plan-wrapper',
      actionTitleClasses: 'action__title',
      popoverClasses: '.plan-wrapper .zmdi-info-outline',
      datepickerClasses: '.plan-wrapper .zmdi-calendar-alt'
    },

    init: function() {
      planModule.wrapper = document.getElementsByClassName(planModule.config.wrapper)[0];

      //Popover
      $(planModule.popoverClasses).popover({
        placement: 'left'
      });

      //Datepickers
      $(planModule.config.datepickerClasses)
        .datepicker({
          autoclose: true,
          format: 'M d yyyy'
        })
        .on('changeDate', function(event) {
          this.dataset.date = event.format();
        });

      var printButton = planModule.wrapper.getElementsByClassName('print')[0];
      printButton.addEventListener('click', planModule.printPlan);

      planModule.rotateChevron();
    },

    printPlan: function() {
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
    },

    rotateChevron: function() {
      var actionTitles = document.getElementsByClassName(planModule.config.actionTitleClasses);
      Array.prototype.forEach.call(actionTitles, function(element) {
        element.addEventListener('click', function() {
          this.firstElementChild.classList.toggle('rotate');
        });
      });
    }
  };

  planModule.init();

})();


(function() {
  var bindings = {
    config: {
      incomeSliderClass: 'about__income__slider',
      basicRateSliderClass: 'about__savings__slider--needs',
      discretionaryRateSliderClass: 'about__savings__slider--expenses'
    },

    init: function() {
      bindings.incomeBinding();
      bindings.basicRateBinding();
      bindings.discretionaryRateBinding();
    },

    incomeBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.incomeSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        //Update the model
        gModel.aboutIncome = parseInt(values[0].replace('.', ''));
        gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
        gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series[0] = Scenarios.updateSeries();
        Scenarios.incomeRateSlider.noUiSlider.set(values[0]);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    },

    basicRateBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.basicRateSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        gModel.aboutBasicRate = parseInt(values[0]);
        gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
        gModel.aboutSavingsRate = 100 - gModel.aboutBasicRate - gModel.aboutDiscretionaryRate;
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series[0] = Scenarios.updateSeries();
        Scenarios.savingRateSlider.noUiSlider.set(gModel.aboutSavingsRate);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    },

    discretionaryRateBinding: function() {
      var slider = document.getElementsByClassName(bindings.config.discretionaryRateSliderClass)[0];
      slider.noUiSlider.on('change', function(values) {
        gModel.aboutDiscretionaryRate = parseInt(values[0]);
        gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
        gModel.aboutSavingsRate = 100 - gModel.aboutBasicRate - gModel.aboutDiscretionaryRate;
        gModel.savings = gModel.aboutSavingsRate * 0.01 * gModel.aboutIncome;

        Pyramid.updateLabels();

        Scenarios.chartData.series[0] = Scenarios.updateSeries();
        Scenarios.savingRateSlider.noUiSlider.set(gModel.aboutSavingsRate);
        Scenarios.lineChart.update(Scenarios.chartData);
      });
    }
  };

  bindings.init();
})();


/* Components */
(function() {
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
    // if(!clickedLink.classList.contains('disabled')) {
      setActive(clickedLink, 'active');
      nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];
      setActive(nextStepElement, 'show');
    // }
  };

  var nav = document.querySelector('.nav');
  nav.addEventListener('click', onNavClick);
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

(function() {
  var app = {
    config: {
      navClass: '.nav ul'
    },

    init: function() {
      var continueButtons = document.getElementsByClassName('continue');
      Array.prototype.forEach.call(continueButtons, function(element) {
        element.addEventListener('click', app.onContinueClick);
      });
    },

    onContinueClick: function() {
      var nextStep = this.dataset.template,
        nextStepElement = document.getElementsByClassName(nextStep + '-wrapper')[0];

      app.setActive(nextStepElement, 'show');
      var newActiveNavLink = document.getElementsByClassName('active')[0].nextElementSibling;
      //Check if it is the last nav link
      if(newActiveNavLink) {
        //Active the navigation item
        if(newActiveNavLink.classList.contains('disabled')) {
          newActiveNavLink.classList.remove('disabled');
        }
        app.setActive(newActiveNavLink, 'active');
      }
    },

    setActive: function(newActive, className) {
      var oldActive = document.getElementsByClassName(className)[0];
      oldActive.classList.remove(className);
      newActive.classList.add(className);
    }
  };

  app.init();
})();

