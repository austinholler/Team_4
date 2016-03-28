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



var StateEnum = {Loaded:1, Loading:2, NotLoaded:3}

angular.module('DBService', []).service('DatabaseService', function($http,$q) {
    this.data = [];
    this.state = StateEnum.NotLoaded;
    /*
    this.init = function(callback) {
        console.log('inside init');

        // Change state to loading...
        this.state = StateEnum.Loading;

        // Put in some sample data for now...
        $http.get('http://ec2-52-36-192-18.us-west-2.compute.amazonaws.com/api/cities/boulder/co').then(function (data) {
            // Update data
            this.data = data;
            // Update state to loaded.
            this.state = StateEnum.Loaded;
            // Call the callback.
            callback(null, data)
        })

    }
    */
    this.getData = function(db,params,callback){
        console.log('inside getData');

        // If we haven't yet loaded the data into the service.
        //if (this.state == StateEnum.NotLoaded)
        //{
        //    this.init(callback)
        //}

        // If the data has already been loaded into the service.
        //if (this.state == StateEnum.Loaded) {
        //
        var queryURL = ""
        var queryURLBase = 'http://localhost:3000/api/'
        if (db == "topics") {
            var queryURL = queryURLBase + "topics/" + params['code']
        }
        if (db == "citylist") {
            var queryURL = queryURLBase + "citylist"
        }

        $http.get(queryURL).then(function (data) {
            // Update data
            //this.data = data;
            // Update state to loaded.
            //this.state = StateEnum.Loaded;
            // Call the callback.
            console.log('got the data back');
            callback(null, data)
        })

    }
})