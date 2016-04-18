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
// 4/17    MB       Controls updated and reduced to 10 entries.
// 4/17    MB       Fixed bug with percent calculation.

const COLORS = ['#4D4D4D','#5DA5DA','#FAA43A','#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854','#e0e0e0']

angular.module('CityCtrl', []).controller('CityController', ['$scope','DatabaseService','$routeParams',function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.code = $routeParams.code;

    // Booleans that control content display.
    $scope.topicDataLoaded = false;
    $scope.categoryDataLoaded = false;
    $scope.cityDataLoaded = false;
    $scope.topicCacheDataLoaded = false;

    //$scope.buttons = [{'text': 'today','selected':false},{'text': 'month','selected':true},{'text': 'year','selected':false},{'text': 'history','selected':false}]
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
        console.log('inside draw pie chart')
        console.log(data);
        var chartData = [];
        var scoreSum = 0;

        // Count number of categories
        var keys = Object.keys($scope.categoryHash)
        var numKeys = keys.length;

        for (var i = 0; i < numKeys; i++) {
            scoreSum += parseFloat($scope.categoryHash[Object.keys($scope.categoryHash)[i]])
        }
        console.log("SUM:" + scoreSum)

        // Create a data point for each category
        for (var i = 0; i < numKeys; i++)
        {
            var key = Object.keys($scope.categoryHash)[i]
            //console.log($scope.categoryHash[key])
            var curPercent = parseFloat((100 * ($scope.categoryHash[key] / scoreSum)).toFixed(2));
            console.log(curPercent);
            chartData.push({
                value: curPercent,
                highlight: "#1E1E1E",
                label: Object.keys($scope.categoryHash)[i]
            })
        }

        // Aggregate anything not in top-10.
        chartData = _.sortBy(chartData, 'value').reverse();
        console.log(chartData[0])
        for (var i = 0; i < chartData.length; i++)
        {
            if (i < 10) {
                chartData[i].color = COLORS[i];
            }
            if (i == 9) {
                chartData[i].label = "Other";
            }
            if (i > 9) {
                chartData[9].value += chartData[i].value;
            }
        }
        chartData[9].value = chartData[9].value.toFixed(2)
        chartData.length = 10;

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
    var today = new Date();
    today.setHours(today.getHours()-6); // UTC Offset for MT
    var todayString = today.toISOString().slice(0,10).replace(/-/g,"");
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
    function loadCategoryDataRange(start) {
        DatabaseService.getData("cache", {
            'code': $scope.code,
            'type': 'cat',
            'time': start,
        }, function (err, data) {
            $scope.categoryDataLoaded = true;
            categoryData = data.data;
            $scope.categoryHash = categoryData;
            drawPieChart(categoryData)
        })
    }

    $scope.reloadPieChart = function(){
        console.log('Reloading chart');
        $scope.categoryDataLoaded = false;
        var start;
        var rightNow = new Date();

        // Calculate end
        //var end = rightNow.toISOString().slice(0,10).replace(/-/g,"");

        // Calculate start
        if ($scope.pieFilter == 'Today')
        {
            start = new Date(rightNow)
            start = start.toISOString().slice(0,10).replace(/-/g,"");

        }
        else if ($scope.pieFilter == 'Month')
        {
            start = new Date(rightNow)
            start = start.toISOString().slice(0,10).replace(/-/g,"").slice(0, -2);
        }
        else if ($scope.pieFilter == 'Year')
        {
            start = new Date(rightNow)
            start = start.toISOString().slice(0,10).replace(/-/g,"").slice(0, -4);
        }
        else if ($scope.pieFilter == 'Complete')
        {
            start = ""
        }

        loadCategoryDataRange(start);
    }

    initPieChart();

    //var myNewChart = new Chart(ctx).PolarArea(data);

}]);