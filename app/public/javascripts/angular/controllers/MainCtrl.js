// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==============================================================
// 3/1    MB       File Creation
// 3/25   MB       Live datta now pulled from server.
// 3/27   MB       Modified pin selection to redirect using code.
// 4/10   MB       Load trending global topics from cache.
// 4/14   MB       Added links to topics.
// 4/17   MB       Updated cache query. Top topics for the month.

(function(angular) {
    'use strict';
    angular.module('MainCtrl', []).controller('MainController',['$scope','DatabaseService', function($scope,DatabaseService) {

        // Data for the city, comes from DBService
        $scope.dataLoaded = false;
        $scope.topicTrendDataLoaded = false;

        $scope.cityListData = null;
        $scope.topicCacheDataArr = null;
        var topicCacheDataMap = null;

        // Async call to load cache data.
        var yearMonth = (new Date()).toISOString().slice(0,10).replace(/-/g,"").slice(0, -2);
        DatabaseService.getData("cache",{'code':'ALL','type':'TOP','time':yearMonth},function(err,data) {
            topicCacheDataMap = data.data;
            $scope.topicCacheDataArr = Object.keys(topicCacheDataMap).map(function(key) {
                return {"topic" : key, "score" : Number(topicCacheDataMap[key]), "url" : "topic/" + key}
            })
            $scope.topicTrendDataLoaded = true;
        });



        // Leaflet stuff
        var mymap = L.map('mapid').setView([39.5, -98.35], 4);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(mymap);

        DatabaseService.getData('citylist',{},function(err,data) {
            $scope.dataLoaded = true;
            $scope.cityListData = data.data.Items;
            for (var i = 0; i < $scope.cityListData.length; i++){
                var curCity = $scope.cityListData[i];
                var marker = L.marker([curCity.lat, curCity.lon],{url:"city/" + curCity.code}).bindPopup(curCity.name)
                marker.on('mouseover', function (e) {
                        this.openPopup();
                    });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });
                marker.on('click',markerOnClick);

                marker.addTo(mymap);
            }
        })

        function markerOnClick(e)
        {
            console.log(this.options.url);
            window.location.href = this.options.url;
        }

    }]);
})(window.angular);