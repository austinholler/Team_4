// routes.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB       File Creation
// 3/2    MB       Router no longer explodes the page.


angular.module('routes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/splash.html',
            controller: 'MainController'
        });
    $locationProvider.html5Mode(true);

}]);

