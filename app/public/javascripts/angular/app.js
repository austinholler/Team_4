// app.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =================================================
// 3/1    MB       File Creation
// 3/2    MB       Added ngRoute
// 3/24   MB       Added DBService
// 4/14   MB       Loaded topic controller.

var app = angular.module("app",
    ['ngRoute','routes','MainCtrl','CityCtrl','DBService','TopicCtrl']);

