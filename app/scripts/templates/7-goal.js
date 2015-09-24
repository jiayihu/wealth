(function() {
  var wrapper = document.getElementsByClassName('goal-wrapper')[0];

  $('.goal__details > span').tooltip();

  var addButtons = wrapper.getElementsByClassName('add-goal');
  var displayPickedGoal = function() {
    var picked = this.dataset.picked;
    wrapper.getElementsByClassName('picked--' + picked)[0].classList.add('picked--show');
    wrapper.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
  };

  for(var i=0; i < addButtons.length; i++) {
    addButtons[i].addEventListener('click', displayPickedGoal);
  }

  var deleteButtons = wrapper.getElementsByClassName('picked__actions__delete');
  var hidePickedGoal = function() {
    var goal = this.dataset.goal;
    wrapper.getElementsByClassName('picked--' + goal)[0].classList.remove('picked--show');
    wrapper.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
  };

  for(var i=0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', hidePickedGoal);
  }

  var pickedContainer = wrapper.getElementsByClassName('picked-goals')[0];
  dragula([pickedContainer]);

})();
