// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/24    MB       File Creation, dynamic loading of city
//                  data by using the dbHandler.

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.cityName = $routeParams.cityName;

    // City State
    $scope.cityState = $routeParams.cityState;

    // Data for the city, comes from DBService
    $scope.dataLoaded = false;

    $scope.cityData = null;

    DatabaseService.getData(function(err,data) {
        $scope.dataLoaded = true;
        $scope.cityData = data;
    })

}]);