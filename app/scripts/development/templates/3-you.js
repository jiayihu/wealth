app.views.you = (function() {

  var config = {
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
  };

  var doughnutData = config.doughnutData,
    doughnutOptions = config.doughnutOptions,
    doughnutResponsiveOptions = config.doughnutResponsiveOptions;

  var $pieChart, needsSlider, expensesSlider;

  var sliderEventHandler = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    tooltip.innerHTML = values[0] + '%';
  };

  var createChart = function(element, data, options, responsiveOptions) {
    doughnutData.series[2] = {
      value: 100 - doughnutData.series[0].value - doughnutData.series[1].value,
      name: 'Savings'
    };

      $pieChart = new Chartist.Pie(element,
      doughnutData,
      doughnutOptions,
      doughnutResponsiveOptions);

    animateDoughnut($pieChart);

    createDoughnutTooltip();

  };

  var animateDoughnut = function($pieChart) {
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
  };

  var createDoughnutTooltip = function() {
    var $chart = $(config.doughnutClass),
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
  };

  var updateDoughnut = function() {
    needsSlider.noUiSlider.on('change', function(values){
      doughnutData.series[0].value = parseInt(values[0]);
      doughnutData.series[2].value = 100 - doughnutData.series[0].value - doughnutData.series[1].value;
      $pieChart.update();
    });
    expensesSlider.noUiSlider.on('change', function(values){
      doughnutData.series[1].value = parseInt(values[0]);
      doughnutData.series[2].value = 100 - doughnutData.series[0].value - doughnutData.series[1].value;
      $pieChart.update();
    });
  };

  var updateModel = function() {
    gModel.aboutBasicRate = doughnutData.series[0].value;
    gModel.aboutDiscretionaryRate = doughnutData.series[1].value;
    gModel.aboutSavingsRate = doughnutData.series[2].value;
    gModel.basicNeeds = gModel.aboutIncome * gModel.aboutBasicRate * 0.01;
    gModel.discretionaryExpenses = gModel.aboutIncome * gModel.aboutDiscretionaryRate * 0.01;
    gModel.savings = gModel.aboutIncome * gModel.aboutSavingsRate * 0.01;
    console.log(gModel);
  };

  var init = function(container) {
    needsSlider = container.getElementsByClassName(config.needsSlider)[0];
    expensesSlider = container.getElementsByClassName(config.expensesSlider)[0];

    //Create sliders
    window.createSlider(needsSlider, config.needsOptions);
    needsSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(needsSlider, values);
    });

    window.createSlider(expensesSlider, config.expensesOptions);
    expensesSlider.noUiSlider.on('update', function(values) {
      sliderEventHandler(expensesSlider, values);
    });

    //Create Doughnut Chart
    createChart(config.doughnutClass,
      config.doughnutData,
      config.doughnutOptions,
      config.doughnutResponsiveOptions);

    //Update doughnut chart when sliders values change
    updateDoughnut();

    //Update the model when 'Continue' is pressed
    var continueButton = container.getElementsByClassName('continue')[0];
    continueButton.addEventListener('click', updateModel);
  };

})();
