// cacheHandler.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =====================================================================
// 4/9     MB       File Creation
// 4/16    MB       Support for more complicated cache entries.

// Required for Dynamo Connection
var AWS = require("aws-sdk");
var CacheHandler = new Object();
var _ = require('lodash');
var redis = require("redis");
var productionMode = false;
var client;

// Connect to redis.
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
    console.log("CacheHandler: Connected to REDIS.")
};

// Grabs all cache data for the following city code.
CacheHandler.getCacheEntry = function(type,code,time, callback){
    console.log("CacheHandler.getCacheEntry: Cache request.")
    var cacheEntry = type + "-" + code + time
    console.log("CacheHandler.getCacheEntry: Searching cache for " + cacheEntry)
    // Codes should look like: CAT-DEN2016 or TOP-DEN20160101
    client.hgetall(cacheEntry, function (err,obj) {
        callback(null,obj);
    })

};

// Export the module
module.exports = CacheHandler;