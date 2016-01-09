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
