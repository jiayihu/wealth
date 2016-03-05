// var helpers = require('../helpers');
var Chartist = require('chartist');

var stateMap = {
  chart: null
};


var showDetailedChart = function() {
  var chartData = {
    labels: ['Miscellaneous', 'Education', 'Entertainment & Reading', 'Healthcare', 'Trasportation', 'Apparel & services', 'Utilities, fuels, public services', 'Housing', 'Food away from home', 'Food at home'],
    series: [
      [9, 5, 5, 9, 12, 4, 5, 36, 3, 12],
      [8, 3, 5, 9, 16, 4, 10, 30, 5, 10]
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

// var updateSerie = function(category, value) {
//   if( (typeof category !== 'string') || (typeof value !== 'number') ) {
//     helpers.makeError('params', {category: category, value: value});
//   }

//   var index = configMap.chartData.labels.indexOf(category);

//   if(~index) {
//     configMap.chartData.series[0][index] = value;
//   }
// };

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

var render = function(cmd) {
  switch(cmd) {
    case 'showDetailedChart':
      showDetailedChart();
      break;
    default:
      console.error('No command found.');
      return;
  }
};

/**
 * Sets the serie of categories expenses of others of the category
 * @param  {array} othersSerie Array of values
 */
// var setOthersSerie = function(othersSerie) {
//   if(!Array.isArray(othersSerie)) {
//     helpers.makeError('params', othersSerie);
//   }

//   configMap.chartData.series[1] = othersSerie;
// };

module.exports = {
  render:  render
};
