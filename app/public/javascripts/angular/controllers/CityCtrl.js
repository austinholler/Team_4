// MainCtrl.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// ==========================================================
// 3/24    MB       File Creation, dynamic loading of city
//                  data by using the dbHandler.
// 3/25    MB       Modifications to how data is requested.
// 3/27    MB       Added charts with sample data
// 3/27    MB       Test run with real data.

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.code = $routeParams.code;

    // Data for the city, comes from DBService
    $scope.dataLoaded = false;

    $scope.cityData = null;

    $scope.recordCount = 0;

    // Category -> Sum of Scores
    $scope.categoryHash = {};

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

    // NOTE: Logic in here is pretty janky. Just testing things out.
    $scope.drawPieChart = function(data) {
        var chartData = [];
        var scoreSum = 0;
        // Sum up all same-category entries
        for (var i = 0; i < data.length; i++){
            scoreSum += data[i]['Score'];
            if (data[i]['Category'] in $scope.categoryHash) {
                $scope.categoryHash[data[i]['Category']] += data[i]['Score']
            }
            else {
                $scope.categoryHash[data[i]['Category']] = data[i]['Score']
            }
        }

        // Count number of categories
        var keys = Object.keys($scope.categoryHash)
        var numKeys = keys.length;
        //console.log('there are:' + numKeys + 'keys')
        //console.log(keys)
        // Create a data point for each category
        for (var i = 0; i < numKeys; i++)
        {
            var key = Object.keys($scope.categoryHash)[i]
            console.log($scope.categoryHash[key])
            chartData.push({
                value: (100 * ($scope.categoryHash[key] / scoreSum)).toFixed(2),
                color: randomColor(),
                highlight: "#1E1E1E",
                label: Object.keys($scope.categoryHash)[i]
            })
        }

        var ctxPie = document.getElementById("pieChart").getContext("2d");
        var myPieChart = new Chart(ctxPie).Pie(chartData,{
            tooltipTemplate: "<%= label %> : <%= value %>%"
        });
        document.getElementById('pieChartLegend').innerHTML = myPieChart.generateLegend();

    }

    $scope.drawLineChart = function(data) {
        //var ctxLine = document.getElementById("lineChart").getContext("2d");
        //var myLineChart = new Chart(ctxLine).Line(data, {});

    }

    DatabaseService.getData("topics",{'code':$scope.code},function(err,data) {
        $scope.dataLoaded = true;
        $scope.cityData = data.data.Items;
        $scope.recordCount = $scope.cityData.length;
        $scope.drawLineChart($scope.cityData)
        $scope.drawPieChart($scope.cityData)
    })


    //var myNewChart = new Chart(ctx).PolarArea(data);

}]);