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
// 4/18    MB       Monthy graph.

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

angular.module('TopicCtrl', []).controller('TopicController', ['$scope','DatabaseService','$routeParams',
function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.topic = $routeParams.topic;
    $scope.globalRankDay = "Calcuating...";
    $scope.globalRankMonth = "Calcuating...";
    $scope.globalRankYear = "Calcuating...";

    // Topic Cache request
    var topicDataMonthlyMap = {}
    $scope.lineChartReady = false;

    $scope.topicCacheArrToday = null;
    var topicCacheMapToday = null;
    $scope.topicCacheArrMonth = null;
    var topicCacheMapMonth = null;
    $scope.topicCacheArrYear = null;
    var topicCacheMapYear = null;

    // Pie Chart Vars
    var ctxLine = null;
    var myLineChart = null;

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

    function getMonthDataRec(numMonthsBack, callback) {
        console.log('TopicCtrl.getMonthDataRec: ' + numMonthsBack + " months back.");
        if (numMonthsBack > 0) {
            var newToday = new Date();
            newToday.setHours(newToday.getHours() - 6); // UTC Offset for MT
            newToday.setMonth(newToday.getMonth() - numMonthsBack); // X number of months into the past.
            var monthString = newToday.toISOString().slice(0, 10).replace(/-/g, "").slice(0, -2);
            DatabaseService.getData("cache", {'code': 'ALL', 'type': 'top', 'time': monthString}, function (err, data) {
                topicDataMonthlyMap[monthString] = data.data;
                getMonthDataRec(numMonthsBack - 1, function (err, data2) {
                    callback(null,data2)
                });
            });
        }
        else {
            callback(null,topicDataMonthlyMap);
        }
    }


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

    function loadMonthlyLineChartData(range) {
        console.log("TopicCtrl.loadCategoryDataRange: Called")

        getMonthDataRec(range, function(err,data) {
            // Indicate we have the data loaded.
            $scope.lineChartReady = true;
            // Draw the line chart with the data we receive.
            drawLineChart(data);
        })
    }



    function initLineChart() {
        console.log("TopicCtrl.initLineChart: Called")

        // Initialize the chart object.
        ctxLine = document.getElementById("lineChart").getContext("2d");

        // Call a reload on the chart.
        reloadLineChart();
    }

    function drawLineChart(data) {
        console.log("TopicCtrl.drawLineChart: Called")
        console.log(data);
        var dataPoints = Object.keys(data).map(function(key) {
            return (data[key] != undefined && data[key][$scope.topic] != undefined) ? data[key][$scope.topic] : 0;
        });
        var labelPoints = Object.keys(data).map(function(key) {
            return MONTH_NAMES[(parseInt(key.slice(-2))-1)%12]
        });
        console.log(dataPoints);

        var dataLine = {
            labels: labelPoints,
            datasets: [
                {
                    label: "My First dataset",
                    fillColor: "rgba(2,136,209,.5)",
                    strokeColor: "rgba(2,136,209,1)",
                    pointColor: "rgba(229,115,115,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: dataPoints//[65, 59, 80, 81, 56, 55, 40]
                }
            ],
            height:1000,
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        };

        var ctxLine = document.getElementById("lineChart").getContext("2d");

        // Load Chart
        if (myLineChart != null) {
            myLineChart.destroy();
        }


        myLineChart = new Chart(ctxLine).Line(dataLine, {});



    }

    function reloadLineChart(){
        console.log("TopicCtrl.reloadPieChart: Called")

        // Load data for the range that has been specified. Default to 3.
        loadMonthlyLineChartData(12);
    }

    initLineChart();


}]);









