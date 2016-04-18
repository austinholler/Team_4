// TopicCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 4/14    MB       File creation.
// 4/14    MB       Now loads cache and displays rank.
// 4/17    MB       Supports topic rank for current day.
// 4/17    MB       Updated time to reflect UTC offset.
// 4/17    MB       Additional rankings

angular.module('TopicCtrl', []).controller('TopicController', ['$scope','DatabaseService','$routeParams',
function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.topic = $routeParams.topic;
    $scope.globalRankDay = "Calcuating...";
    $scope.globalRankMonth = "Calcuating...";
    $scope.globalRankYear = "Calcuating...";

    // Topic Cache request
    $scope.topicCacheArrToday = null;
    var topicCacheMapToday = null;
    $scope.topicCacheArrMonth = null;
    var topicCacheMapMonth = null;
    $scope.topicCacheArrYear = null;
    var topicCacheMapYear = null;

    // Async call to load cache data.
    var today = new Date();
    today.setHours(today.getHours()-6); // UTC Offset for MT
    var todayString = today.toISOString().slice(0,10).replace(/-/g,"");
    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':todayString},function(err,data) {
        topicCacheMapToday = data.data;
        $scope.topicCacheArrToday = Object.keys(topicCacheMapToday).map(function(key) {
            return {"topic" : key, "score" : Number(topicCacheMapToday[key]), "url" : "topic/" + key}
        })
        $scope.globalRankDay = getRank(topicCacheMapToday,$scope.topicCacheArrToday);
    });

    var monthString = today.toISOString().slice(0,10).replace(/-/g,"").slice(0,-2);
    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':monthString},function(err,data) {
        topicCacheMapMonth = data.data;
        $scope.topicCacheArrMonth = Object.keys(topicCacheMapMonth).map(function(key) {
            return {"topic" : key, "score" : Number(topicCacheMapMonth[key]), "url" : "topic/" + key}
        })
        $scope.globalRankMonth = getRank(topicCacheMapMonth,$scope.topicCacheArrMonth);
    });

    var yearString = today.toISOString().slice(0,10).replace(/-/g,"").slice(0,-4);
    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':yearString},function(err,data) {
        topicCacheMapYear = data.data;
        $scope.topicCacheArrYear = Object.keys(topicCacheMapYear).map(function(key) {
            return {"topic" : key, "score" : Number(topicCacheMapYear[key]), "url" : "topic/" + key}
        })
        $scope.globalRankYear = getRank(topicCacheMapYear,$scope.topicCacheArrYear);
    });


    function getRank(topicMap,topicArr) {
        if ($scope.topic in topicMap) {
            var rank = 1;
            var curScore = topicMap[$scope.topic]
            for (var x in topicArr) {
                if (topicArr[x].score > curScore) rank++;
            }
            return rank;
        }
        else return "N/A"
    }
}]);









