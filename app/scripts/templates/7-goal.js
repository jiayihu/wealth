$('.goal__details > span').tooltip();

var addButtons = document.getElementsByClassName('add-goal');
var displayPickedGoal = function() {
  var picked = this.dataset.picked;
  document.getElementsByClassName('picked--' + picked)[0].classList.add('picked--show');
  document.getElementsByClassName('goal--' + picked)[0].classList.add('goal--hide');
};

for(var i=0; i < addButtons.length; i++) {
  addButtons[i].addEventListener('click', displayPickedGoal);
}

var deleteButtons = document.getElementsByClassName('picked__actions__delete');
var hidePickedGoal = function() {
  var goal = this.dataset.goal;
  document.getElementsByClassName('picked--' + goal)[0].classList.remove('picked--show');
  document.getElementsByClassName('goal--' + goal)[0].classList.remove('goal--hide');
};

for(var i=0; i < deleteButtons.length; i++) {
  deleteButtons[i].addEventListener('click', hidePickedGoal);
}

var pickedContainer = document.getElementsByClassName('picked-goals')[0];
dragula([pickedContainer]);
