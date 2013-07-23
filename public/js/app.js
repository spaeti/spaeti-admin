'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'list', controller: 'SpaetiListCtrl'});
    $routeProvider.when('/add', {templateUrl: 'add', controller: 'SpaetiAddCtrl'});
    $routeProvider.when('/spaeti/:spaeti', {templateUrl: 'details', controller: 'SpaetiDetailsCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]).factory("flash", function ($rootScope) {
    var messages = {
      error: '',
      success: ''
    }, nextmessages = {
      error: '',
      success: ''
    };

    $rootScope.$on('$routeChangeSuccess', function () {
      messages = nextmessages;
      nextmessages = {
        error: '',
        success: ''
      };
    });

    return {
      error: function (message) {
        if (message) {
          nextmessages.error = message;
        }
        return messages.error;
      },
      success: function (message) {
        if (message) {
          nextmessages.success = message;
        }
        return messages.success;
      }
    };
  });