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

        // Leaflet stuff
        var mymap = L.map('mapid').setView([39.5, -98.35], 3);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(mymap);

        // Should figure this out dynamically in future
        //$scope.cities = [{city:'Denver',state:'CO'},{city:'Boulder',state:'CO'},{city:'Broomfield',state:'CO'},{city:'Superior',state:'CO'},{city:'Austin',state:'TX'}];

        DatabaseService.getData('citylist',{},function(err,data) {
            $scope.dataLoaded = true;
            $scope.cityListData = data.data.Items;
            for (var i = 0; i < $scope.cityListData.length; i++){
                var curCity = $scope.cityListData[i];
                var marker = L.marker([curCity.lat, curCity.lon],{url:"city/" + curCity.state + "/" + curCity.name}).bindPopup(curCity.name)
                marker.on('mouseover', function (e) {
                        this.openPopup();
                    });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });
                marker.on('click',markerOnClick);

                /*function (e) {
                    console.log("city/" + curCity.state + "/" + curCity.name);
                    document.location.href = "city/" + curCity.state + "/" + curCity.name;
                });*/

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