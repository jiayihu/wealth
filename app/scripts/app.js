'use strict';

requirejs.config({
  baseUrl: './scripts',
  deps: ['app'],
  paths: {
    'bootstrap': 'lib/bootstrap',
    'jquery': 'lib/jquery',
    'nouislider': 'lib/nouislider.min'
  },
  shim: {
    'bootstrap': ['jquery'],
    'nouislider': {
      exports: 'noUiSlider'
    }
  }
});

requirejs(['main', 'components/hamburger']);
