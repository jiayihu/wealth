/////////////////////
// REMOVED FOR NOW //
/////////////////////

(function() {
  var peopleModule = {
    config: {
      wrapper: 'people-wrapper',
      tooltips: '.label'
    },

    init: function() {
      peopleModule.wrapper = document.getElementsByClassName(peopleModule.config.wrapper)[0];

      peopleModule.createTooltips();

      peopleModule.continueButton = peopleModule.wrapper.getElementsByClassName('continue')[0];
      peopleModule.continueButton.addEventListener('click', peopleModule.updateModel);
    },

    createTooltips: function() {
      $(peopleModule.config.tooltips).tooltip();
    },

    updateModel: function() {
      gModel.aboutStage = peopleModule.wrapper.querySelector('input:checked').value;
      console.log(gModel);
    }

  };

})();
