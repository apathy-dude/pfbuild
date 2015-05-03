'use strict';

/**
 * @ngdoc overview
 * @name dprCalcApp
 * @description
 * # dprCalcApp
 *
 * Main module of the application.
 */
angular
  .module('dprCalcApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/class-list/', {
        templateUrl: 'views/class-list.html',
        controller: 'ClassListCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
