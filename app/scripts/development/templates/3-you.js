app.views.you = (function(window) {
  var configMap = {
    needsSlider: 'about__savings__slider--needs',
    expensesSlider: 'about__savings__slider--expenses',
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

  var $pieChart, needsSlider, expensesSlider;

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
      moneyFormat.to(parseInt(value)/100 * wealthApp.model.read('aboutIncome') ) ).show();
    });

    //For mobiles
    $chart.on('click', '.ct-slice-donut', function() {
      if(!isTooltipShown) {
        var $slice = $(this),
          value = $slice.attr('ct:value'),
          seriesName = $slice.parent().attr('ct:series-name');
        $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
        moneyFormat.to(parseInt(value)/100 * wealthApp.model.read('aboutIncome') ) ).show();
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

  var sliderEventHandler = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    tooltip.innerHTML = values[0] + '%';
  };


  /**
   * Update Doughnut when sliders value change
   */
  var updateDoughnut = function() {
    needsSlider.noUiSlider.on('change', function(values){
      configMap.doughnutData.series[0].value = parseInt(values[0]);
      configMap.doughnutData.series[2].value = 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value;
      $pieChart.update();
    });
    expensesSlider.noUiSlider.on('change', function(values){
      configMap.doughnutData.series[1].value = parseInt(values[0]);
      configMap.doughnutData.series[2].value = 100 - configMap.doughnutData.series[0].value - configMap.doughnutData.series[1].value;
      $pieChart.update();
    });
  };

  var bindSlidersEvents = function() {
    needsSlider.noUiSlider.on('change', function(){
      wealthApp.model.update('aboutBasicRate', configMap.doughnutData.series[0].value);
      wealthApp.model.update('aboutSavingsRate', configMap.doughnutData.series[2].value);
      wealthApp.model.updateMoneyValues();
    });
    expensesSlider.noUiSlider.on('change', function(){
      wealthApp.model.update('aboutDiscretionaryRate', configMap.doughnutData.series[1].value);
      wealthApp.model.update('aboutSavingsRate', configMap.doughnutData.series[2].value);
      wealthApp.model.updateMoneyValues();
    });
  };

  /**
   * PUBLIC FUNCTIONS
   */

   var configModule = function(inputMap) {
     window.setConfigMap(inputMap, configMap);
   };

  var init = function(container) {
    needsSlider = container.getElementsByClassName(configMap.needsSlider)[0];
    expensesSlider = container.getElementsByClassName(configMap.expensesSlider)[0];

    //Create sliders
    window.createSlider(needsSlider, configMap.needsOptions);
    needsSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(needsSlider, values);
    });

    window.createSlider(expensesSlider, configMap.expensesOptions);
    expensesSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(expensesSlider, values);
    });

    //Init Doughnut Chart
    var doughnutHtml = container.getElementsByClassName(configMap.doughnutClass)[0];
    createChart(doughnutHtml);

    updateDoughnut();
    bindSlidersEvents();
  };

  return {
    configModule: configModule,
    init: init
  };

})(window);
