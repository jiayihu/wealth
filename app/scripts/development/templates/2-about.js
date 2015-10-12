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
          'max': 100000
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
      tooltip.innerHTML = values[0];
    },

    updateModel: function() {
      var age = aboutModule.ageSlider.noUiSlider.get(),
        income = aboutModule.incomeSlider.noUiSlider.get(),
        situation = aboutModule.wrapper.getElementsByClassName('about__select')[0].value,
        living = aboutModule.wrapper.getElementsByClassName('about__select')[1].value;

      gModel.aboutAge = parseInt(age);
      gModel.aboutIncome = parseInt(income.replace('.', ''));
      gModel.aboutSituation = situation;
      gModel.aboutLiving = living;

      console.log(gModel);
    }

  };

  aboutModule.init();

})();
