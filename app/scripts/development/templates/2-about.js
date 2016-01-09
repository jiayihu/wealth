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
