var helpers = require('../helpers');
var Chartist = require('chartist');

var stateMap = {
  chart: null
};


var showDetailedChart = function(data) {
  var userExpenses = data.userExpenses;
  var othersExpenses = data.othersExpenses;

  if(!Array.isArray(userExpenses) || !Array.isArray(othersExpenses)) {
    helpers.makeError('params', data);
  }

  var chartData = {
    labels: ['Miscellaneous', 'Education', 'Entertainment & Reading', 'Healthcare', 'Trasportation', 'Apparel & services', 'Utilities, fuels, public services', 'Housing', 'Food away from home', 'Food at home'],
    series: [
      userExpenses,
      othersExpenses
    ]
  };
  var chartOptions =  {
    axisY: {
      offset: 100
    },
    axisX: {
      labelOffset: {
        x: -7,
        y: 0
      }
    },
    seriesBarDistance: 10,
    horizontalBars: true
  };
  stateMap.chart = new Chartist.Bar('.detailed-chart', chartData, chartOptions);
};

// For now it's used only when user changes his expenses and not for 'income changes/default expenses changes' since they are dealt with showDetailedChart()
var updateDetailedChart = function(data) {
  var userExpenses = data.userExpenses;

  if(!Array.isArray(userExpenses)) {
    helpers.makeError('params', data);
  }

  stateMap.chart.data.series[0] = userExpenses;
  stateMap.chart.update();
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd, data) {
  switch(cmd) {
    case 'showDetailedChart':
      showDetailedChart(data);
      break;
    case 'updateDetailedChart':
      updateDetailedChart(data);
      break;
    default:
      console.error('No command found.');
      return;
  }
};

module.exports = {
  render:  render
};
