// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/1    MB       File Creation
(function(angular) {
    'use strict';
    angular.module('MainCtrl', []).controller('MainController', function($scope) {
        $scope.test = "I am the main controller";
        // Should figure this out dynamically in future
        $scope.cities = [{city:'Denver',state:'CO'},{city:'Boulder',state:'CO'},{city:'Broomfield',state:'CO'},{city:'Superior',state:'CO'},{city:'Austin',state:'TX'}];


    });
})(window.angular);