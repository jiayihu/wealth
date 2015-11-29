app.views.about = (function(window) {
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
    optionLists: 'about__select'
  };

  var ageSlider, incomeSlider,
      situation, living;

  var createSliders = function() {
    window.createSlider(ageSlider, configMap.ageOptions);
    window.createSlider(incomeSlider, configMap.incomeOptions);
  };

  var onSliderUpdate = function(slider, values) {
    var tooltip = slider.getElementsByTagName('span')[0];
    if(slider.classList.contains(configMap.incomeSlider)) {
      tooltip.innerHTML = '$' + values[0];
    } else {
      tooltip.innerHTML = values[0];
    }
  };

  var bindSlidersEvents = function() {
    ageSlider.noUiSlider.on('update', function(values) {
      onSliderUpdate(ageSlider, values);
    });
    ageSlider.noUiSlider.on('change', function(values) {
      wealthApp.model.update('aboutAge', parseInt(values[0]));
    });

    incomeSlider.noUiSlider.on('update', function(values) {
      onSliderUpdate(incomeSlider, values);
    });
    incomeSlider.noUiSlider.on('change', function(values) {
      wealthApp.model.update('aboutIncome', parseInt(values[0].replace('.', '')));
    });
  };

  var bindSelectListsEvent = function() {
    situation.addEventListener('change', function(event){
      wealthApp.model.update('aboutSituation', event.target.value);
    });
    living.addEventListener('change', function(event){
      wealthApp.model.update('aboutLiving', event.target.value);
    });
  };

  var configModule = function(inputMap) {
    window.setConfigMap(inputMap, configMap);
  };

  var init = function(container) {
    //init sliders
    ageSlider = container.getElementsByClassName(configMap.ageSlider)[0];
    incomeSlider = container.getElementsByClassName(configMap.incomeSlider)[0];

    createSliders();
    bindSlidersEvents();

    //init situation and living select lists
    situation = container.getElementsByClassName('about__select')[0];
    living = container.getElementsByClassName('about__select')[1];

    bindSelectListsEvent();
  };

  return {
    configModule: configModule,
    init: init
  };

})(window);
