// routes.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ===================================================
// 3/1    MB       File Creation
// 3/2    MB       Router no longer explodes the page.
// 3/22   MB       Added route for index and about
// 3/24   MB       Parameters for city routing.
// 3/27   MB       Route for city changes to use code.
// 4/14   MB       Support for topic page.

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
        .when('/city/:code', {
            templateUrl: 'pages/city.html',
            controller: 'CityController'
        })
        .when('/topic/:topicName', {
            templateUrl: 'pages/topic.html',
            controller: 'TopicController'
        })
        .when('/about.html', {
            templateUrl: 'pages/about.html',
            controller: 'MainController'
        });
    $locationProvider.html5Mode(true);

}]);

