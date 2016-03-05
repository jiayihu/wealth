/**
 * Controller module. This module executes the controllers for each view, in MVC
 * pattern. To be more precise this is more likely the Presenter in MVP pattern.
 * Our views/screens are 'dumb'. They don't know anything about the Model, so
 * the Presenter has the job to update the screens when Model changes and viceversa.
 * @see {@link https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvp}
 * @module controller
 */

var controllers = [
  require('./controllers/about'),
  require('./controllers/expenses'),
  require('./controllers/comparison'),
  require('./controllers/scenarios'),
  require('./controllers/goal'),
  require('./controllers/retirement'),
  require('./controllers/plan'),
  require('./controllers/nav'),
  require('./controllers/continue')
];

module.exports = function(model, view, initialState) {
  /*
   * Every controller's job is almost the same:
   * - to set/render the view the first time, on window load
   * - to bind user interactions to functions which update the model
   * - to update the DOM (rendering the data) whenever the Model is changed by
   *   subscribing to Model changes
   * @see {@url https://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript}
   */
  controllers.forEach(function(controller, index) {
    controller(model, view[index], initialState);
  });
};