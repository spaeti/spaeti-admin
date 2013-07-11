'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('SpaetiListCtrl', function ($scope, $http) {
    function refresh() {
      $http.get("http://spaeti.pavo.uberspace.de/dev/spaeti/")
        .success(function (data) {
          $scope.spaetis = data;
        });
    }

    refresh();

    $scope.remove = function (spaeti) {
      if(spaeti !== undefined) {
        $scope.spaetiToDelete = spaeti;
        return;
      }
      $http.delete("http://spaeti.pavo.uberspace.de/dev/spaeti/" + $scope.spaetiToDelete._id)
        .success(function () {
          $scope.lastDeletedSpaeti = $scope.spaetiToDelete;
          refresh();
        }).error(function (data, status) {
          alert("Delete failed:" + status);
        });
    };

    $scope.restoreLastDeletedSpaeti = function () {
      $http.post("http://spaeti.pavo.uberspace.de/dev/spaeti/", $scope.lastDeletedSpaeti)
        .success(refresh).error(function (data, status) {
          alert("Creation failed:" + status);
        });
    };

    $scope.update = function (spaeti, attr) {
      $http.put("http://spaeti.pavo.uberspace.de/dev/spaeti/" + spaeti._id, spaeti)
        .success(refresh).error(function (data, status) {
          alert("Update failed:" + status);
        });
      spaeti.edit[attr] = false;
    };

    $scope.edit = function (spaeti, attr) {
      if(!spaeti.edit) {
        spaeti.edit = {};
      }
      spaeti.edit[attr] = true;
    };

    $scope.cancelEdit = function (spaeti, attr) {
      spaeti.edit[attr] = false;
    };
  })
  .controller('SpaetiAddCtrl', function ($scope, $http) {
    function add() {
      $http.post("http://spaeti.pavo.uberspace.de/dev/spaeti/", $scope.spaeti)
        .success(function (data) {
              // yes
        });
    }
  });