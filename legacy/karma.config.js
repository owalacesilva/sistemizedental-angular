//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './src/app',

    files: [
      'controller/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ]

  });
};