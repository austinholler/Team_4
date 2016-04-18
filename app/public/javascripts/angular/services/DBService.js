/**
 * Created by socce on 3/24/2016.
 */
// Edit History
// Date    Author   Description
// ==========================================================
// 3/24    MB       File Creation
// 3/25    MB       No longer caches data. Works for multiple
//                  types of requests.
// 3/27    MB       Supports topics query.
// 4/2     MB       Supports more robust city query.
// 4/8     MB       Removed state related code, added support
//                  for new query types.
// 4/9     MB       Supports basic cache query.
// 4/17    MB       Support new cache query.
// 4/17    MB       support for prod mode.

const PRODMODE = true;
const EC2URL = "ec2-52-38-5-96.us-west-2.compute.amazonaws.com"

var StateEnum = {Loaded:1, Loading:2, NotLoaded:3}

angular.module('DBService', []).service('DatabaseService', function($http,$q) {
    this.data = [];

    this.getData = function(db,params,callback){
        console.log('DBService.getData: Inside getData');
        var queryURL = ""

        // queryURLBase must be changed to ec2 URL for running in prod.
        if (PRODMODE == false) {
            var queryURLBase = 'http://localhost:3000/api/'
        }
        else {
            var queryURLBase = 'http://' +EC2URL + ':3000/api/';
        }

        // Query to cache endpoint.
        if (db.toLowerCase() == "cache") {
            if (params['code'] != undefined && params['type'] != undefined) {
                var queryURL = queryURLBase + "cache/" + params['type'] + "/" + params['code'];
            }
            else {
                console.log('DBService.getData: Invalid params for cache request.');
            }
            if (params['time'] != undefined)
            {
                queryURL = queryURL + "/" + params['time']
            }
        }

        // Query to topics table.
        else if (db.toLowerCase() == "topics") {
            if (params['start'] != undefined && params['end'] != undefined) {
                var queryURL = queryURLBase + "topics/" + params['code'] + "/all/" + params['start'] + "/" + params['end']
            }
            else if (params['code'] != undefined && params['category'] != undefined) {
                var queryURL = queryURLBase + "topics/" + params['code'] + "/" + params['category']
            }
            else {
                console.log('DBService.getData: Invalid params for topics query.');
            }
        }

        // Query to categories GSI
        else if (db.toLowerCase() == "categories") {
            if (params['start'] != undefined && params['end'] != undefined) {
                var queryURL = queryURLBase + "categories/" + params['code'] + "/all/" + params['start'] + "/" + params['end']
            }
            else if (params['code'] != undefined && params['category'] != undefined) {
                var queryURL = queryURLBase + "categories/" + params['code'] + "/" + params['category']
            }
            else {
                console.log('DBService.getData: Invalid params for categories query.');
            }
        }

        // Query for list of cities.
        else if (db.toLowerCase() == "citylist") {
            if (params['code'] != undefined) {
                var queryURL = queryURLBase + "citylist/" + params['code']
            }

            else {
                var queryURL = queryURLBase + "citylist"
            }
        }

        // Execute the query.
        console.log('DBService.getData: QueryURL: ' + queryURL);
        $http.get(queryURL).then(function (data) {
            callback(null, data)
        })

    }
})