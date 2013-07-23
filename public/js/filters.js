'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }]).filter('checkmark',function () {
        return function (input) {
            return input ? '\u2713' : '\u2718';
        };
    }).filter('owner',function () {
        return function (input) {
            return input ? '\u2713' : '';
        };
    }).filter('published',function () {
        return function (input) {
            return input ? 'icon-ok-sign text-success' : 'icon-certificate text-warning';
        };
    }).filter('publishedButtonClass',function () {
        return function (input) {
            return input ? '' : 'btn-success';
        };
    }).filter('publishedButtonName', function () {
        return function (input) {
            return input ? 'Details' : 'Bestätigen';
        };
    }).filter('publishedButtonIcon', function () {
        return function (input) {
            return input ? 'icon-pencil' : 'icon-check';
        };
    }).filter('redIfTrue', function () {
    return function (input) {
      return input ? 'red' : 'black';
    };
  });
