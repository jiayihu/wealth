(function() {
  var actions = [],
    savedActions = [];

  actions = [
    {
      todo: 'Open an account with an online discount broker 0',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker 1',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker 2',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker 3',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker 4',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    },
    {
      todo: 'Open an account with an online discount broker',
      todonot: 'Hire a full service commission broker',
      why: 'Explanation for this action'
    }
  ];

  var retirementWrapper = document.getElementsByClassName('retirement-wrapper')[0],
    tbody = retirementWrapper.getElementsByTagName('tbody')[0],
    row;

  for(var i = 0; i < actions.length; i++) {
    row = document.createElement('tr');
    row.innerHTML = '<td><i class="fa fa-check" data-action="' + i + '"></i></td>' +
      '<td>' + actions[i].todo + '</td>' +
      '<td>' + actions[i].todonot + '</td>' +
      '<td><i class="fa fa-info-circle" data-toggle="tooltip" data-placement="left" title="' + actions[i].why + '"></i></td>';
      tbody.appendChild(row);
  }

  var checks = retirementWrapper.getElementsByClassName('fa-check');
  for(var j = 0; j < checks.length; j++) {
    checks[j].addEventListener('click', function() {
      this.classList.toggle('saved');
    });
  }

  var continueButton = retirementWrapper.getElementsByClassName('continue')[0];
  continueButton.addEventListener('click', function() {
    savedActions = [];
    var checkedActions = retirementWrapper.getElementsByClassName('saved');
    for(var k = 0; k < checkedActions.length; k++) {
      savedActions.push(actions[parseInt(checkedActions[k].dataset.action)]);
    }
    console.log(savedActions);
  });

  $('.fa-info-circle').tooltip();
})();
