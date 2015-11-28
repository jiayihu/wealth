app.views.about = (function(window) {
  var config = {
    container: 'about-container',
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
    },
    optionLists: 'about__select'
  };

  var ageSlider,
    incomeSlider;

  var createSlider = function(element, options) {
    noUiSlider.create(element, options);
    element.handle = element.getElementsByClassName('noUi-handle')[0];
    element.tooltip = document.createElement('div');
    element.handle.appendChild(element.tooltip);

    element.tooltip.classList.add('slider-tooltip');
    element.tooltip.innerHTML = '<span></span>';
    element.tooltip = element.tooltip.firstElementChild;
  };

  var eventHandler = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    if(slider.classList.contains(config.incomeSlider)) {
      tooltip.innerHTML = '$' + values[0];
    } else {
      tooltip.innerHTML = values[0];
    }
  };

  var init = function(container) {
    ageSlider = container.getElementsByClassName(config.ageSlider)[0];
    incomeSlider = container.getElementsByClassName(config.incomeSlider)[0];

    createSlider(ageSlider, config.ageOptions);
    ageSlider.noUiSlider.on('update', function(values) {
      eventHandler(ageSlider, values);
    });
    ageSlider.noUiSlider.on('change', function(values) {
      wealthApp.model.update('aboutAge', parseInt(values[0]));
    });

    createSlider(incomeSlider, config.incomeOptions);
    incomeSlider.noUiSlider.on('update', function(values) {
      eventHandler(incomeSlider, values);
    });
    incomeSlider.noUiSlider.on('change', function(values) {
      wealthApp.model.update('aboutIncome', parseInt(values[0].replace('.', '')));
    });

    var situation = container.getElementsByClassName('about__select')[0],
      living = container.getElementsByClassName('about__select')[1];

    situation.addEventListener('change', function(event){
      wealthApp.model.update('aboutSituation', event.target.value);
    } );
    living.addEventListener('change', function(event){
      wealthApp.model.update('aboutLiving', event.target.value);
    } );
  };

})(window);
