'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('spaetiTime', function(){
    return {
      restrict: 'A',
      scope: {
        spaetiTime: '='
      },
      link: function (scope, element, attrs) {
        // set the initial value of the textbox
        element.val(Math.round(scope.spaetiTime / 100) + ":" + scope.spaetiTime - Math.round(scope.spaetiTime / 100));
        element.data('old-value', Math.round(scope.spaetiTime / 100) + ":" + scope.spaetiTime - Math.round(scope.spaetiTime / 100));

        // detect outside changes and update our input
        scope.$watch('spaetiTime', function (val) {
          element.val(Math.round(scope.spaetiTime / 100) + ":" + scope.spaetiTime - Math.round(scope.spaetiTime / 100));
        });

        // on blur, update the value in scope
        element.bind('propertychange keyup paste', function (blurEvent) {
          if (element.data('old-value') !== element.val()) {
            scope.$apply(function () {
              scope.spaetiTime = parseInt(element.val().replace(":", ""), 10);
              element.data('old-value', element.val());
            });
            console.log('element value: ' + element.val() + ' model value: ' + scope.spaetiTime);
          }
        });
      }
    };
  });
