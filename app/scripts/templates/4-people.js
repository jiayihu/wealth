(function() {
  $('.label').tooltip();

  //Save data on global variable
  var wrapper = document.getElementsByClassName('people-wrapper')[0],
    continueButton = wrapper.getElementsByClassName('continue')[0];
  continueButton.addEventListener('click', function() {
    gModel.aboutStage = document.querySelector('input:checked').value;
    console.log(gModel);
  });

})();
