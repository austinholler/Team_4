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
// 4/26    MB       Added new chart type and fixed for chartjs 2.0
// 4/27    MB       Moved legend to bottom.

const COLORS = ['#5DA5DA','#FAA43A','#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854','#9deb38',"#e0e0e0"]
const LINECOLORSSTROKE = ["rgba(93,165,218,0.8)","rgba(250,164,58,0.8)","rgba(96,189,104,0.8)","rgba(241,124,176,0.8)","rgba(178,145,47,.8)","rgba(178,118,178,.8)"]
const LINECOLORSFILL = ["rgba(93,165,218,0.4)","rgba(250,164,58,0.4)","rgba(96,189,104,0.4)","rgba(241,124,176,0.4)","rgba(178,145,47,.4)","rgba(178,118,178,.4)"]
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

    // Line Chart Vars
    var topicDataForLineChart = {};
    $scope.selectedTopics = ['lifestyle','games','singles'];
    var lineChartDatasets = {};
    var myLineChartCity = null;

    // Number of records we have for our data.
    $scope.recordCount = 0;

    // Category -> Sum of Scores
    $scope.categoryHash = {};

    // Topic Selector
    $scope.topicList = null;
    $scope.topicListLoaded = false;
    // Load topic list.
    DatabaseService.getData("cache",{'code':$scope.code,'type':'TOP'},function(err,data) {
        $scope.topicList = data.data;
        $scope.topicList = Object.keys($scope.topicList).map(function(key) {
            return {"topic" : key, "url" : "topic/" + key}
        })
        $scope.topicListLoaded = true;
    });


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
                chartData[i].color = COLORS[9];
            }
            if (i > 9) {
                chartData[9].value += chartData[i].value;
            }
        }
        chartData[9].value = chartData[9].value.toFixed(2)
        chartData.length = 10;

        // Chart Data Format changed with Chart JS 2.0
        var newChartData = {
            labels: [],
            datasets:
                [{
                    data:[],
                    backgroundColor:[],
                    hoverBackgroundColor:[]
                }]
        };
        for (var i in chartData) {
            newChartData.labels.push(chartData[i].label);
            newChartData.datasets[0].data.push(chartData[i].value);
            newChartData.datasets[0].backgroundColor.push(chartData[i].color);
            newChartData.datasets[0].hoverBackgroundColor.push(chartData[i].color);
        }

        // Load Chart
        if (myPieChart != null) {
            myPieChart.destroy();
        }
        /*myPieChart = new Chart(ctxPie).Pie(chartData, {
            tooltipTemplate: "<%= label %> : <%= value %>%"
        });*/

        myPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: newChartData,
            options: { legend: {position:'bottom'}}
        });

        //document.getElementById('pieChartLegend').innerHTML = myPieChart.generateLegend();

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

    //$scope.removeFromSelected = function(topic) {
    //    for
    //}

    $scope.reloadPieChart = function(){
        console.log('Reloading chart');
        $scope.categoryDataLoaded = false;
        var start;
        var rightNow = new Date();

        // Calculate end
        //var end = rightNow.toISOString().slice(0,10).replace(/-/g,"");

        // Calculate start
        start = new Date(rightNow)
        start.setHours(start.getHours()-6); // UTC Offset for MT
        if ($scope.pieFilter == 'Today')
        {
            start = start.toISOString().slice(0,10).replace(/-/g,"");

        }
        else if ($scope.pieFilter == 'Month')
        {
            start = start.toISOString().slice(0,10).replace(/-/g,"").slice(0, -2);
        }
        else if ($scope.pieFilter == 'Year')
        {
            start = start.toISOString().slice(0,10).replace(/-/g,"").slice(0, -4);
        }
        else if ($scope.pieFilter == 'Complete')
        {
            start = ""
        }

        loadCategoryDataRange(start);
    };


    function initLineChart() {
        console.log("TopicCtrl.initLineChart: Called")

        // Get all of the data loaded in.
        loadMonthlyLineChartData(11, function(err,data) {
            console.log("GOT THE DATA")
            console.log(topicDataForLineChart);
            $scope.reloadLineChart();
        })

    }

    $scope.reloadLineChart = function(){
        console.log("TopicCtrl.reloadLineChart: Called")
        lineChartDatasets = {};
        for (var i in $scope.selectedTopics)
        {
            var curTop = $scope.selectedTopics[i];
            var curTopDataPoints = Object.keys(topicDataForLineChart).map(function(key) {
                return (topicDataForLineChart[key] != undefined && topicDataForLineChart[key][curTop] != undefined) ? Number(topicDataForLineChart[key][curTop]).toFixed(2) : 0;
            });
            lineChartDatasets[curTop] = {
                label: curTop,
                backgroundColor: LINECOLORSFILL[i],
                borderColor: LINECOLORSSTROKE[i],
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: curTopDataPoints
            }
        }
        drawLineChart(lineChartDatasets)
    }

    // Function used for grabbing all of the entries for a given month.
    function getMonthDataRec(numMonthsBack, callback) {
        console.log('TopicCtrl.getMonthDataRec: ' + numMonthsBack + " months back.");
        if (numMonthsBack >= 0) {
            var newToday = new Date();
            newToday.setHours(newToday.getHours() - 6); // UTC Offset for MT
            newToday.setMonth(newToday.getMonth() - numMonthsBack); // X number of months into the past.
            var monthString = newToday.toISOString().slice(0, 10).replace(/-/g, "").slice(0, -2);
            console.log("monthString:" + monthString);
            DatabaseService.getData("cache", {'code': $scope.code, 'type': 'top', 'time': monthString}, function (err, data) {
                console.log(data);
                topicDataForLineChart[monthString] = data.data;
                getMonthDataRec(numMonthsBack - 1, function (err, data2) {
                    callback(null,data2)
                });
            });
        }
        else {
            callback(null,topicDataForLineChart);
        }
    }

    // Requests and processes the data for the line chart.
    function loadMonthlyLineChartData(range,callback) {
        console.log("TopicCtrl.loadCategoryDataRange: Called")
        getMonthDataRec(range, function(err,data) {
            // process the data into a city with 12 datapoints
            /*
            for (i in topicDataMonthlyMap.keys()) {
                console.log(topic)
                monthofdata = null;
                for (j in topicDataMonthlyMap[i].keys())
                    lineData[i].key = topicDataMonthlyMap[i][topic];
                monthOfData.push(topicDataMonthlyMap[i][topic].value());
                lineData[i].value = monthOfData
                //drawLineChart(data);
            }*/

            callback(topicDataForLineChart)
        })

    }

    // Draws the line chart based on input data.
    function drawLineChart(lineChartDatasets) {
        console.log("TopicCtrl.drawLineChart: Called")
        var labelPoints = Object.keys(topicDataForLineChart).map(function(key) {
            return MONTH_NAMES[(parseInt(key.slice(-2))-1)%12]
        });
        var dataSetArr = Object.keys(lineChartDatasets).map(function(key) {
            return lineChartDatasets[key];
        });
        console.log(dataSetArr);
        var dataLine = {
            labels: labelPoints,
            datasets: dataSetArr,
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        };

        var ctxLine = document.getElementById("lineChart").getContext("2d");

        // Load Chart
        if (myLineChartCity != null) {
            myLineChartCity.destroy();
        }

         myLineChartCity = new Chart(ctxLine, {
            type: 'line',
            data: dataLine,
            options: {legend: {position:'bottom'}},

        });


    }



    initLineChart();
    initPieChart();

}]);