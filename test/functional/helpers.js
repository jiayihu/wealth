var enableNav = function() {
  var disabled = document.querySelectorAll('.nav .disabled');
  Array.prototype.forEach.call(disabled, function(link) {
    link.classList.remove('disabled');
  });
};

module.exports = {
  enableNav: enableNav
};