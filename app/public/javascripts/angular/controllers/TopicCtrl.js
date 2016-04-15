// TopicCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 4/14    MB       File creation.
// 4/14    MB       Now loads cache and displays rank.

angular.module('TopicCtrl', []).controller('TopicController', ['$scope','DatabaseService','$routeParams',
function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.topic = $routeParams.topic;
    $scope.globalRank = "Calcuating...";

    // Topic Cache request
    $scope.topicCacheDataArr = null;
    var topicCacheDataMap = null;

    // Async call to load cache data.
    DatabaseService.getData("cache",{'code':'ALL'},function(err,data) {
        topicCacheDataMap = data.data;
        $scope.topicCacheDataArr = Object.keys(topicCacheDataMap).map(function(key) {
            return {"topic" : key, "score" : Number(topicCacheDataMap[key]), "url" : "topic/" + key}
        })
        $scope.globalRank = getRank(data);
    });


    function getRank() {
        if ($scope.topic in topicCacheDataMap) {
            var rank = 1;
            var curScore = topicCacheDataMap[$scope.topic]
            //console.log(topicCacheDataMap);
            //console.log($scope.topic);
            for (var x in $scope.topicCacheDataArr) {
                //console.log($scope.topicCacheDataArr[x]);
                if ($scope.topicCacheDataArr[x].score > curScore) rank++;
            }
            return rank;
        }
        else return "N/A"
    }
}]);









