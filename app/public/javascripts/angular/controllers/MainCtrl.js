// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/1    MB       File Creation
// 3/25   MB       Live datta now pulled from server.

(function(angular) {
    'use strict';
    angular.module('MainCtrl', []).controller('MainController',['$scope','DatabaseService', function($scope,DatabaseService) {
        console.log('back');
        $scope.test = 'nud';
        // Data for the city, comes from DBService
        $scope.dataLoaded = false;

        $scope.cityListData = null;

        // Should figure this out dynamically in future
        //$scope.cities = [{city:'Denver',state:'CO'},{city:'Boulder',state:'CO'},{city:'Broomfield',state:'CO'},{city:'Superior',state:'CO'},{city:'Austin',state:'TX'}];

        DatabaseService.getData('citylist',{},function(err,data) {
            $scope.dataLoaded = true;
            $scope.cityListData = data.data.Items;
            console.log(data.data.Items)
        })

    }]);
})(window.angular);