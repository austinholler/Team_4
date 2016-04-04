// dbHandler.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =========================================================
// 3/12    MB       DB Handler to abstract the implementation
//                  of database connection/use.
// 3/24    MB       get method is callback function now.


// Required for Dynamo Connection
var AWS = require("aws-sdk");
var DBHandler = new Object();
var dynamodb;
var docClient;
var _ = require('lodash');


// Method for connecting to our DB instance
DBHandler.connect = function(inputParam,accessKey,secretAccessKey) {
    console.log('DBHandler.Connect: Connecting...');
    AWS.config.update({
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
        // Region/Endpoint must be specified by user.
        region: inputParam,
        //endpoint: endpointParam
    });

    dynamodb = new AWS.DynamoDB();
    docClient = new AWS.DynamoDB.DocumentClient();

    console.log('DBHandler.Connect: Connected to Dynamo DB');
}

// Method for querrying the db
DBHandler.get = function(tableName,tableParams,callback) {
    console.log("DBHandler.Get: New Get");
    console.log("DBHandler.Get: Table: " + tableName);
    console.log("DBHandler.Get: Params");
    console.log(tableParams);

    // Scan for retreiving all documents
    if (_.isEmpty(tableParams)) {
        console.log('DBHandler.Get: Query using Scan');

        var params = {
            TableName : tableName,
        };

        // Call the recursive FullScan to ensure we get all of the data.
        DBHandler.FullScan(params,callback);

    }
    // Query for retreiving specific documents.
    else {
        console.log('DBHandler.Get: Query using Params');
        var params = {
            TableName : tableName,
            KeyConditionExpression: "#fld = :val",
            ExpressionAttributeNames:{
                "#fld": "code"
            },
            ExpressionAttributeValues: {
                ":val":tableParams['code']
            }
        };
        docClient.query(params, function (err, data) {
            if (err) {
                var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
                console.error("DBHandler.Get: Unable to query. Error:", JSON.stringify(err, null, 2));
                callback(err, null)
            } else {
                console.log("DBHandler.Get: Query succeeded.");
                console.log(data);
                callback(null, data)
            }

        });
    }

}

// Method to be used when scan may exceed 1 MB limit. Recursively scans
// until all data has been collected, and then returns it.
DBHandler.FullScan = function(params,callback) {
    console.log("DBHandler.FullScan: New FullScan");
    console.log(params);
    docClient.scan(params, function (err, data) {
        if (err) {
            var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
            console.error("DBHandler.FullScan: Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err, null)
        } else {
            console.log("DBHandler.FullScan: Query succeeded.");

            // If we haven't consumed all the data, do the next scan.
            if (data.LastEvaluatedKey != null) {
                console.log("DBHandler.FullScan: Scan was not exhaustive, recursing.");
                var newParams = params
                newParams['ExclusiveStartKey'] = data.LastEvaluatedKey;

                DBHandler.FullScan(newParams, function (err,nextData) {
                    var combinedData = nextData
                    //console.log(Object.keys(nextData));
                    combinedData['Items'] = nextData.Items.concat(data.Items)
                    callback(null,combinedData);
                })

            }

            // Else trigger the callback
            else {
                console.log("DBHandler.FullScan: Scan was exhaustive. Returning.");
                callback(null, data)
            }
        }
    })

}


// Export the module
module.exports = DBHandler;