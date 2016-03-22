// routes.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB       File Creation
// 3/2    MB       Router no longer explodes the page.
// 3/22   MB       Added route for index and about

angular.module('routes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/splash.html',
            controller: 'MainController'
        })
        .when('/index.html', {
            templateUrl: 'pages/splash.html',
            controller: 'MainController'
        })
        .when('/city.html', {
            templateUrl: 'pages/city.html',
            controller: 'CityController'
        })
        .when('/about.html', {
            templateUrl: 'pages/about.html',
            controller: 'MainController'
        });
    $locationProvider.html5Mode(true);

}]);

