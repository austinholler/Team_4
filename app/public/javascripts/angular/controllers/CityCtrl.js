// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/24    MB       File Creation

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    $scope.cityName = $routeParams.cityName;
    $scope.cityState = $routeParams.cityState;
    $scope.test = "I am the city Controller";
    DatabaseService.init();
}]);