// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/24    MB       File Creation, dynamic loading of city
//                  data by using the dbHandler.
// 3/25    MB       Modifications to how data is requested.
// 3/27    MB       Added charts with sample data

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.code = $routeParams.code;

    // Data for the city, comes from DBService
    $scope.dataLoaded = false;

    $scope.cityData = null;

    $scope.recordCount = 0;


    DatabaseService.getData("topics",{'code':$scope.code},function(err,data) {
        $scope.dataLoaded = true;
        $scope.cityData = data.data.Items;
        $scope.recordCount = $scope.cityData.length;
        var dataPie = [
            {
                value: 300,
                color:"#F7464A",
                highlight: "#FF5A5E",
                label: "Red"
            },
            {
                value: 50,
                color: "#46BFBD",
                highlight: "#5AD3D1",
                label: "Green"
            },
            {
                value: 100,
                color: "#FDB45C",
                highlight: "#FFC870",
                label: "Yellow"
            }
        ]
        var dataLine = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "My First dataset",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: "My Second dataset",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };
        var ctxPie = document.getElementById("pieChart").getContext("2d");
        var ctxLine = document.getElementById("lineChart").getContext("2d");
        var myPieChart = new Chart(ctxPie).Pie(dataPie,{});
        var myLineChart = new Chart(ctxLine).Line(dataLine, {});
        //console.log($scope.recordCount);
    })


    //var myNewChart = new Chart(ctx).PolarArea(data);

}]);