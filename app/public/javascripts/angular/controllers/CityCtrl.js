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
// 4/2     MB       Support for basic city information.
// 4/9     MB       Buttons for filtering pie chart, and correct
//                  queries for pie chart data.
// 4/9     MB       fixed accumulation of category hash bug.
// 4/15    MB       Support for topic links.
// 4/17    MB       Queries for cache for the day.

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.code = $routeParams.code;

    // Booleans that control content display.
    $scope.topicDataLoaded = false;
    $scope.categoryDataLoaded = false;
    $scope.cityDataLoaded = false;
    $scope.topicCacheDataLoaded = false;

    //$scope.buttons = [{'text': 'week','selected':false},{'text': 'month','selected':true},{'text': 'year','selected':false},{'text': 'history','selected':false}]
    $scope.pieFilter = 'Month';

    // Store data that has been loaded for this controller.
    $scope.cityData = null;
    var categoryData = null;
    var topicData = null;
    var topicCacheDataMap = null;
    $scope.topicCacheDataArr = null;

    // Pie Chart Vars
    var ctxPie = null;
    var myPieChart = null;

    // Number of records we have for our data.
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

    function initPieChart() {
        ctxPie = document.getElementById("pieChart").getContext("2d");
        $scope.reloadPieChart();
    }

    function drawPieChart(data) {
        var chartData = [];
        var scoreSum = 0;
        $scope.categoryHash = {};
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

        // Load Chart
        if (myPieChart != null) {
            myPieChart.destroy();
        }
        myPieChart = new Chart(ctxPie).Pie(chartData, {
            tooltipTemplate: "<%= label %> : <%= value %>%"
        });

        document.getElementById('pieChartLegend').innerHTML = myPieChart.generateLegend();

    }

    function drawLineChart(data) {
        //var ctxLine = document.getElementById("lineChart").getContext("2d");
        //var myLineChart = new Chart(ctxLine).Line(data, {});

    }


    // Async call to load info for this city.
    DatabaseService.getData("citylist",{'code':$scope.code},function(err,data) {
        $scope.cityDataLoaded = true;
        $scope.cityData = data.data.Items[0];
        $scope.cityData.imgURL = "images/stateIcons/state-" + $scope.cityData.stateFull.toLowerCase() + ".png";
        console.log($scope.cityData);

    })

    // Async call to load cache data.
    var todayString = (new Date()).toISOString().slice(0,10).replace(/-/g,"")
    DatabaseService.getData("cache",{'code':$scope.code,'type':'top','time':todayString},function(err,data) {
        topicCacheDataMap = data.data;
        console.log("Got Cache Data:");
        console.log(topicCacheDataMap);
        $scope.topicCacheDataArr = Object.keys(topicCacheDataMap).map(function(key) {
            return {"topic" : key, "score" : Number(topicCacheDataMap[key]), "url" : "topic/" + key}
        })
        console.log($scope.topicCacheDataArr);
        $scope.topicCacheDataLoaded = true;
    });



    // Async call to load data for this city pie chart.
    function loadCategoryDataRange(start,end) {
        DatabaseService.getData("categories", {
            'code': $scope.code,
            'category': 'all',
            'start': start,
            'end': end
        }, function (err, data) {
            $scope.categoryDataLoaded = true;
            categoryData = data.data.Items;
            $scope.recordCount = categoryData.length;
            drawPieChart(categoryData)
        })
    }

    $scope.reloadPieChart = function(){
        console.log('Reloading chart');
        $scope.categoryDataLoaded = false;
        var start;
        var rightNow = new Date();

        // Calculate end
        var end = rightNow.toISOString().slice(0,10).replace(/-/g,"");

        // Calculate start
        if ($scope.pieFilter == 'Week') { start = new Date(rightNow.setDate(rightNow.getDate() -7 )) }
        else if ($scope.pieFilter == 'Month') { start = new Date(rightNow.setMonth(rightNow.getMonth() - 1)) }
        else if ($scope.pieFilter == 'Year') { start = new Date(rightNow.setMonth(rightNow.getMonth() - 12)) }
        else if ($scope.pieFilter == 'Complete') { start = new Date(rightNow.setMonth(rightNow.getMonth() - 120)) }
        start = start.toISOString().slice(0,10).replace(/-/g,"");

        loadCategoryDataRange(start,end);
    }

    initPieChart();

    //var myNewChart = new Chart(ctx).PolarArea(data);

}]);