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
// 4/23    MB       Added rankings.

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Basic Info for TODAY
const today = new Date();
today.setHours(today.getHours()-6); // UTC Offset for MT
const todayString = today.toISOString().slice(0,10).replace(/-/g,"");
const monthString = today.toISOString().slice(0,10).replace(/-/g,"").slice(0,-2);
const yearString = today.toISOString().slice(0,10).replace(/-/g,"").slice(0,-4);

const yesterday = new Date();
yesterday.setHours(today.getHours()-30); // UTC Offset for MT
const yesterdayString = yesterday.toISOString().slice(0,10).replace(/-/g,"");

const lastMonth = new Date();
lastMonth.setHours(today.getHours()-736); // UTC Offset for MT
const lastMonthString = lastMonth.toISOString().slice(0,10).replace(/-/g,"").slice(0,-2);

const lastYear = new Date();
lastYear.setHours(today.getHours()-8766); // UTC Offset for MT
const lastYearString = lastYear.toISOString().slice(0,10).replace(/-/g,"").slice(0,-4);


angular.module('TopicCtrl', []).controller('TopicController', ['$scope','DatabaseService','$routeParams',
function($scope,DatabaseService,$routeParams) {
    // City Name
    $scope.topic = $routeParams.topic;
    $scope.globalRankDay = "N/A";
    $scope.globalRankMonth = "N/A";
    $scope.globalRankYear = "N/A";
    $scope.globalRankDayIcon = "images/arrow/SAME.png";
    $scope.globalRankMonthIcon = "images/arrow/SAME.png";
    $scope.globalRankYearIcon = "images/arrow/SAME.png";
    $scope.globalRankHash = {};

    // Topic Cache request
    var topicDataMonthlyMap = {}
    $scope.lineChartReady = false;

    var topicCacheMapToday = null;
    var topicCacheMapMonth = null;
    var topicCacheMapYear = null;
    var topicCacheMapYesterday = null;
    var topicCacheMapLastMonth = null;
    var topicCacheMapLastYear = null;

    // Pie Chart Vars
    var ctxLine = null;
    var myLineChart = null;

    // Async calls to load all of the ranks fro the ranking bar.
    // =========================================================
    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':todayString},function(err,data) {
        topicCacheMapToday = data.data;
        $scope.globalRankDay = getRank(topicCacheMapToday,$scope.topic);
        DatabaseService.getData("cache",{'code':'ALL','type':'top','time':yesterdayString},function(err,data) {
            topicCacheMapYesterday = data.data;
            if (topicCacheMapYesterday[$scope.topic] != null) {
                var yesterdayRank = getRank(topicCacheMapYesterday, $scope.topic)
                if (yesterdayRank == $scope.globalRankDay) {$scope.globalRankDayIcon = "images/arrow/SAME.png"}
                else $scope.globalRankDayIcon = yesterdayRank > $scope.globalRankDay ? "images/arrow/UP.png" : "images/arrow/DOWN.png"
            }
            else $scope.globalRankDayIcon = "images/arrow/UP.png"
        });
    });

    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':monthString},function(err,data) {
        console.log("SEARCHING FOR" + monthString);
        topicCacheMapMonth = data.data;
        $scope.globalRankMonth = getRank(topicCacheMapMonth,$scope.topic);
        console.log("RANK:" + $scope.globalRankMonth);
        DatabaseService.getData("cache",{'code':'ALL','type':'top','time':lastMonthString},function(err,data) {
            topicCacheMapLastMonth = data.data;
            if (topicCacheMapLastMonth[$scope.topic] != null) {
                var lastMonthRank = getRank(topicCacheMapLastMonth, $scope.topic)
                if (lastMonthRank == $scope.globalRankMonth) {$scope.globalRankMonthIcon = "images/arrow/SAME.png"}
                else $scope.globalRankMonthIcon = lastMonthRank > $scope.globalRankMonth ? "images/arrow/UP.png" : "images/arrow/DOWN.png"
            }
            else $scope.globalRankMonthIcon = "images/arrow/UP.png"
        });
    });

    DatabaseService.getData("cache",{'code':'ALL','type':'top','time':yearString},function(err,data) {
        topicCacheMapYear = data.data;
        $scope.globalRankYear = getRank(topicCacheMapYear, $scope.topic);
        DatabaseService.getData("cache",{'code':'ALL','type':'top','time':lastYearString},function(err,data) {
            topicCacheMapLastYear = data.data;
            if (topicCacheMapLastYear[$scope.topic] != null) {
                var lastYearRank = getRank(topicCacheMapLastYear, $scope.topic)
                if (lastYearRank == $scope.globalRankYear) {$scope.globalRankYearIcon = "images/arrow/SAME.png"}
                $scope.globalRankYearIcon = lastYearRank > $scope.globalRankYear ? "images/arrow/UP.png" : "images/arrow/DOWN.png"
            }
            else $scope.globalRankYearIcon = "images/arrow/UP.png"
        });
    });


    // =========================================================


    // Function used for grabbing all of the entries for a given month.
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


    // Takes a topic array and a topic and returns it's rank in that array.
    function getRank(topicMap,topic) {
        console.log("TopicCtrl.getRank: Called:" + topic);

        if (topic in topicMap) {
            console.log(topic)
            var rank = 1;
            var curScore = Number(topicMap[topic]);
            for (var x in topicMap) {
                if (Number(topicMap[x]) > curScore) rank++;
            }
            return rank;
        }
        else return "N/A"
    }


    // Converts a topic map to an array for that topic.
    function topicMapToArr(topicMap) {
        var topicArr = Object.keys(topicMap).map(function(key) {
            return {"topic" : key, "score" : Number(topicMap[key]), "url" : "topic/" + key}
        })
        return topicArr
    }


    // Loads all the data for a chart based on a time range, and then calls the draw method.
    function loadMonthlyLineChartData(range) {
        console.log("TopicCtrl.loadCategoryDataRange: Called")
        getMonthDataRec(range, function(err,data) {
            // Indicate we have the data loaded.

            $scope.lineChartReady = true;
            // Add ranks to the data.
            console.log("Topic: " + $scope.topic)
            console.log(data);
            for (var x in (data))
            {
                console.log(x);
                /*if (data[x] != null && data[x] != "")
                {
                    console.log("NOT NULL");
                    console.log(data[x]);
                    data[x].RANK = getRank(data[x],$scope.topic);
                    console.log(getRank(22000 - data[x],$scope.topic));
                }*/
                //else {
                    //data[x] = {rank: 22000 }
                //}
            }

            // Draw the line chart with the data we receive.
            //console.log(data);
            drawLineChart(data);
        })
    }


    // Initiates the line chart for trends.
    function initLineChart() {
        console.log("TopicCtrl.initLineChart: Called")

        // Initialize the chart object.
        ctxLine = document.getElementById("lineChart").getContext("2d");

        // Call a reload on the chart.
        reloadLineChart();
    }

    // Draws the line chart based on input data.
    function drawLineChart(data) {
        console.log("TopicCtrl.drawLineChart: Called")
        console.log(data);
        var dataPoints = Object.keys(data).map(function(key) {
            return (data[key] != undefined && data[key][$scope.topic] != undefined) ? data[key][$scope.topic] : 0;
            return (data[key] != undefined && data[key]['RANK'] != undefined) ? data[key]['RANK'] : 0;
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









