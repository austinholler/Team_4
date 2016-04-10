// cacheHandler.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =====================================================================
// 4/9     MB       File Creation

// Required for Dynamo Connection
var AWS = require("aws-sdk");
var CacheHandler = new Object();
var _ = require('lodash');
var redis = require("redis");
var productionMode = false;
var client;

CacheHandler.init = function(cacheURL) {
    console.log("CacheHandler: Initialized.")

    if (productionMode) {
        client = redis.createClient(6379, cacheURL, {no_ready_check: true});
    }
    else {
        client = redis.createClient();
    }

    client.on("error", function (err) {
        console.log("Error " + err);
    });

    CacheHandler.getCacheEntry("HOU");


}

CacheHandler.getCacheEntry = function(code){
    client.hgetall(code, function (err,obj) {
        console.log(obj);
    })
}

// Export the module
module.exports = CacheHandler;