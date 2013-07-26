'use strict';

var google = window.google,
  angular = window.angular;

/* Controllers */

function makeCodeLatLng($scope, geocoder) {
  return function (latLng) {
    geocoder.geocode({'latLng': latLng}, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $scope.spaeti.location.street = results[0].formatted_address;
        }
      }
    });
  };
}

function makeCodeAddress($scope, geocoder, map) {
  return function () {
    geocoder.geocode({ 'address': $scope.spaeti.location.street}, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        var location = results[0].geometry.location;
        map.setCenter(location);
        $scope.spaeti.location.lat = location.lat();
        $scope.spaeti.location.lng = location.lng();
        $scope.$digest();
      }
    });
  };
}

function timeToInt(businessHours) {
  var i, opened = [], closed = [];
  for (i = businessHours.opened.length - 1; i >= 0; i--) {
    opened[i] = parseInt(businessHours.opened[i].replace(":", ""), 10);
    closed[i] = parseInt(businessHours.closed[i].replace(":", ""), 10);
  }
  return {
    opened: opened,
    closed: closed
  };
}

function intToTime(businessHours){
  var i, opened = [], closed = [], open, close;
  for (i = businessHours.opened.length - 1; i >= 0; i--) {
    open = businessHours.opened[i];
    close = businessHours.closed[i];
    opened[i] = Math.round(open / 100) + ":" + (open - Math.round(open / 100) * 100);
    closed[i] = Math.round(close / 100) + ":" + (close - Math.round(close / 100) * 100);
  }
  return {
    opened: opened,
    closed: closed
  };
}

angular.module('myApp.controllers', [])
  .controller('NavCtrl',function ($scope, $location) {
    $scope.nav = function (page) {
      var currentRoute = $location.path().substring(1) || 'home';
      return page === currentRoute ? 'active' : '';
    };
  }).controller('SpaetiListCtrl', function ($scope, $http, flash) {
    function refresh() {
      $http.get("http://spaeti.pavo.uberspace.de/dev/spaeti/")
        .success(function (data) {
          $scope.spaetis = data;
        });
    }

    $scope.flash = {
      success: [],
      error: [],
      deleted : []
    };

    if(flash.success()){
      $scope.flash.success.push(flash.success());
    }

    if(flash.error()){
      $scope.flash.error.push(flash.error());
    }

    refresh();

    $scope.remove = function (spaeti) {
      if (spaeti !== undefined) {
        $scope.spaetiToDelete = spaeti;
        return;
      }
      $http.delete("http://spaeti.pavo.uberspace.de/dev/spaeti/" + $scope.spaetiToDelete._id)
        .success(function () {
          $scope.lastDeletedSpaeti = $scope.spaetiToDelete;
          refresh();
          $scope.flash.deleted.push("Späti gelöscht!");
        }).error(function (data, status) {
          window.alert("Delete failed:" + status);
        });
    };

    $scope.restoreLastDeletedSpaeti = function () {
      $http.post("http://spaeti.pavo.uberspace.de/dev/spaeti/", $scope.lastDeletedSpaeti)
        .success(function () {
          $scope.flash.success.push("Späti neu erstellt.");
          refresh();
        }).error(function (data, status) {
          window.alert("Creation failed:" + status);
        });
    };

    $scope.update = function (spaeti) {
      $http.put("http://spaeti.pavo.uberspace.de/dev/spaeti/" + spaeti._id, spaeti)
        .success(refresh).error(function (data, status) {
          window.alert("Update failed:" + status);
        });
    };
  })
  .controller('SpaetiAddCtrl', function ($scope, $http, flash) {
    $scope.spaeti = {
      location: {
        street: "",
        lat: 52.519171,
        lng: 13.406091
      },
      assortment: {
        pizza: false,
        condoms: false,
        newspapers: false,
        chips: false
      },
      businessHours: {
        opened: ["9:30", "9:30", "9:30", "9:30", "9:30", "9:30", "9:30"],
        closed: ["22:30", "22:30", "22:30", "22:30", "22:30", "22:30", "22:30"]
      }
    };

    $scope.flash = flash;

    var geocoder = new google.maps.Geocoder(),

      map = new google.maps.Map(document.getElementById("map-canvas"), {
        center: new google.maps.LatLng($scope.spaeti.location.lat, $scope.spaeti.location.lng),
        zoom: 14,
        zoomControl: true,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }),

      marker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        draggable: true
      }),

      codeLatLng = makeCodeLatLng($scope, geocoder);

    $scope.codeAddress = makeCodeAddress($scope, geocoder, map);

    $scope.$watch('spaeti.location.lng * spaeti.location.lat', function () {
      marker.setPosition(new google.maps.LatLng($scope.spaeti.location.lat, $scope.spaeti.location.lng));
    });

    google.maps.event.addListener(marker, 'drag', function (e) {
      $scope.spaeti.location.lat = e.latLng.lat();
      $scope.spaeti.location.lng = e.latLng.lng();
      codeLatLng(e.latLng);
      $scope.$digest();
    });

    $scope.add = function () {
      $scope.spaeti.businessHours = timeToInt($scope.spaeti.businessHours);
      $http.post("http://spaeti.pavo.uberspace.de/dev/spaeti/", $scope.spaeti)
        .success(function () {
          flash.success("Neuer Späti erzeugt.");
          window.location = "./#";
        }).error(function (data, status) {
          window.alert("Creation failed:" + status);
        });
    };
  })
  .controller('SpaetiDetailsCtrl', function ($scope, $http, $routeParams) {
    var geocoder = new google.maps.Geocoder(),
      map, marker, codeLatLng;
    $http.get("http://spaeti.pavo.uberspace.de/dev/spaeti/" + $routeParams.spaeti)
      .success(function (data) {
        $scope.spaeti = data;

        $scope.spaeti.businessHoursText = intToTime($scope.spaeti.businessHours);

        map = new google.maps.Map(document.getElementById("map-canvas"), {
          center: new google.maps.LatLng($scope.spaeti.location.lat, $scope.spaeti.location.lng),
          zoom: 14,
          zoomControl: true,
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        marker = new google.maps.Marker({
          position: map.getCenter(),
          map: map,
          draggable: false
        });

        $scope.$watch('editLocation',function(newVal){
          marker.setDraggable(newVal);
        });

        codeLatLng = makeCodeLatLng($scope, geocoder);

        $scope.codeAddress = makeCodeAddress($scope, geocoder, map);

        $scope.$watch('spaeti.location.lng * spaeti.location.lat', function () {
          marker.setPosition(new google.maps.LatLng($scope.spaeti.location.lat, $scope.spaeti.location.lng));
        });

        google.maps.event.addListener(marker, 'drag', function (e) {
          $scope.spaeti.location.lat = e.latLng.lat();
          $scope.spaeti.location.lng = e.latLng.lng();
          codeLatLng(e.latLng);
          $scope.$digest();
        });

      });

    $scope.remove = function () {
      $http.delete("http://spaeti.pavo.uberspace.de/dev/spaeti/" + $scope.spaeti._id)
        .success(function () {
          window.location = "./#";
        }).error(function (data, status) {
          window.alert("Delete failed:" + status);
        });
    };

    $scope.convertBusinessHours = function(){
      $scope.spaeti.businessHours = timeToInt($scope.spaeti.businessHoursText);
    };

    $scope.old = {};

    $scope.edit = function (attr) {
      $scope.old[attr] = angular.copy($scope.spaeti[attr]);
    };

    $scope.reset = function (attr) {
      $scope.spaeti[attr] = angular.copy($scope.old[attr]);
    };

    $scope.update = function () {
      $http.put("http://spaeti.pavo.uberspace.de/dev/spaeti/" + $scope.spaeti._id, $scope.spaeti)
        .error(function (data, status) {
          window.alert("Update failed:" + status);
        });
    };

  });