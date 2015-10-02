(function() {
  var wrapper = document.getElementsByClassName('you-wrapper')[0],
      needsSlider = wrapper.getElementsByClassName('about__savings__slider--needs')[0],
      expensesSlider = wrapper.getElementsByClassName('about__savings__slider--expenses')[0];

  var needsOptions = {
    start: 20,
    step: 1,
    range: {
      'min': 1,
      'max': 40
    },
    format: wNumb({
      decimals: 0
    })
  },
  expensesOptions = {
    start: 20,
    step: 1,
    range: {
      'min': 1,
      'max': 60
    },
    format: wNumb({
      decimals: 0
    })
  };

  createSlider(needsSlider, needsOptions);
  needsSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = needsSlider.querySelector('.slider-tooltip span');
    tooltip.innerHTML = values[handle] + '%';
  });

  createSlider(expensesSlider, expensesOptions);
  expensesSlider.noUiSlider.on('update', function( values, handle ){
    var tooltip = expensesSlider.querySelector('.slider-tooltip span');
    tooltip.innerHTML = values[handle] + '%';
  });

    //Chart
    var data = {
        series: [{
          value: 20,
          name: 'Basic Needs'
        },
        {
          value: 20,
          name: 'Discretionary'
        }]
      },
      options = {
        donut: true,
        donutWidth: 20,
        chartPadding: 10,
        labelOffset: 50,
        width: '220px',
        height: '220px'
      },
      responsiveOptions = [
        ['screen and (max-width: 480px)', {
          width: '180px',
          height: '180px'
        }]
      ];
    data.series[2] = {
      value: 100 - data.series[0].value - data.series[1].value,
      name: 'Savings'
    };

    var $pieChart = new Chartist.Pie('.about__savings__circle', data, options, responsiveOptions);

    var $chart = $('.about__savings__circle');

    var $toolTip = $chart
      .append('<div class="pie-tooltip"></div>')
      .find('.pie-tooltip')
      .hide();
    var moneyFormat = wNumb({
    	thousand: '.',
    	prefix: '$ '
    });

    $chart.on('mouseenter', '.ct-slice-donut', function() {
      var $slice = $(this),
        value = $slice.attr('ct:value'),
        seriesName = $slice.parent().attr('ct:series-name');
      $toolTip.html('<strong>' + seriesName + '</strong>: ' + value + '%/ ' +
      moneyFormat.to(parseInt(value)/100 * gModel.aboutIncome) ).show();
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

    //Bind slider changes to circle update
    needsSlider.noUiSlider.on('change', function( values){
      data.series[0].value = parseInt(values[0]);
      data.series[2].value = 100 - data.series[0].value - data.series[1].value;
      $pieChart.update();
    });
    expensesSlider.noUiSlider.on('change', function( values){
      data.series[1].value = parseInt(values[0]);
      data.series[2].value = 100 - data.series[0].value - data.series[1].value;
      $pieChart.update();
    });

})();
