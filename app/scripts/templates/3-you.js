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
