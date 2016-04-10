// dbHandler.js
// Created by: Matt Bubernak

// Edit History
// Date    Author   Description
// =====================================================================
// 3/12    MB       DB Handler to abstract the implementation
//                  of database connection/use.
// 3/24    MB       get method is callback function now.
// 4/3     MB       Support for recursive scans to get entire data sets.
// 4/9     MB       Support for queries for topics/categories, as well
//                  as recursive queries for all categories.

// Required for Dynamo Connection
var AWS = require("aws-sdk");
var DBHandler = new Object();
var dynamodb;
var docClient;
var _ = require('lodash');

var CATEGORY_LIST = ['new-age-spirituality', 'sci-fi-fantasy', 'socializing', 'outdoors-adventure', 'career-business',
    'singles', 'government-politics', 'sports-recreation', 'tech', 'lifestyle','health-wellbeing', 'food-drink',
    'education-learning', 'music', 'arts-culture', 'cars-motorcycles', 'community-environment', 'hobbies-crafts',
    'dancing', 'religion-beliefs', 'language', 'games', 'parents-family', 'fitness', 'lgbt', 'writing', 'fashion-beauty',
    'photography', 'support', 'movies-film', 'pets-animals'];


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

    // Params that will actually be used for the request.
    var params = {};

    // Scan for retreiving all documents from a given table. (SLOW)
    if (_.isEmpty(tableParams)) {
        console.log('DBHandler.Get: Query using Scan');
        var params = {
            TableName : tableName,
        };
        // Call the recursive FullScan to ensure we get all of the data.
        DBHandler.ScanRec(params,callback);
    }

    // All queries relating to the cities table,with params.
    else if (tableName == 'Cities') {
        console.log('DBHandler.Get: Query using Params of Cities Table');

        // Params structure for a cities request.
        console.log("DBHandler.Get: Query within Cities Table")
        var params = {
            TableName: tableName,
            KeyConditionExpression: "#fld = :val",
            ExpressionAttributeNames: {
                "#fld": "code"
            },
            ExpressionAttributeValues: {
                ":val": tableParams['code']
            }
        };
        DBHandler.QueryRec(params, callback);
    }


    // All queries to the topics table, with params.
    else if (tableName == 'Topics')
    {

        // If we are searching based on categories.
        if (tableParams['Category'] != undefined) {
            console.log('DBHandler.Get: Query with defined category. ');

            // If we have 1 specific category provided.
            if (tableParams['Category'] != 'all') {
                console.log('DBHandler.Get: Query with category != all. ');
                var params = {
                    TableName: tableName,
                    IndexName: "Categories",
                    KeyConditionExpression: "#category = :category and #date BETWEEN :start AND :end",
                    ExpressionAttributeNames: {
                        "#category": "Category",
                        "#date": "Date"
                    },
                    ExpressionAttributeValues: {
                        ":start": tableParams['start'],
                        ":category": tableParams['Category'],
                        ":end": tableParams['end']
                    }
                };
                DBHandler.QueryRec(params, callback);
            }

            // If we have a request for "all"
            if (tableParams['Category'] == 'all') {
                console.log('DBHandler.Get: Query with category == all. ');
                console.log("list:");

                var params = {
                    TableName: tableName,
                    IndexName: "Categories",
                    KeyConditionExpression: "#category = :category and #date BETWEEN :start AND :end",
                    ExpressionAttributeNames: {
                        "#category": "Category",
                        "#date": "Date"
                    },
                    ExpressionAttributeValues: {
                        ":start": tableParams['start'],
                        ":category": tableParams['Category'],
                        ":end": tableParams['end']
                    }
                };
                DBHandler.BatchCategoryQuery(params,CATEGORY_LIST.slice(), callback);
            }

        }

        // If we are searching based on topics.
        else if (tableParams['Topic'] != undefined)
        {
            console.log('DBHandler.Get: Query with defined topic. ');

            // If we are querying for specific topic.
            if (tableParams['topic'] != 'all') {
                var params = {
                    TableName: tableName,
                    KeyConditionExpression: "#name = :topic and #date BETWEEN :start AND :end",
                    ExpressionAttributeNames: {
                        "#name": "Name",
                        "#date": "Date"
                    },
                    ExpressionAttributeValues: {
                        ":start": tableParams['start'],
                        ":topic": tableParams['Topic'],
                        ":end": tableParams['end']
                    }
                };
                console.log(params);
                DBHandler.QueryRec(params, callback);
            }

            else {
                console.log('DBHandler.Get: Something has gone wrong.');
            }
        }

        else {
            console.log('DBHandler.Get: Something has gone wrong. ')
        }

    }

}


DBHandler.BatchCategoryQuery = function(params,list,callback) {
    console.log("DBHandler.BatchCategoryQuery: New BatchCategoryQuery");
    console.log(params);
    console.log(list);

    // Pop the last thing in the list, for this queryRec parameter.
    params.ExpressionAttributeValues[":category"] = list.pop();

    DBHandler.QueryRec(params, function (err, data) {
        if (err) {
            var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
            console.error("DBHandler.BatchCategoryQuery: Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err, null)
        } else {
            console.log("DBHandler.BatchCategoryQuery: Query succeeded.");

            // If we haven't consumed all the data, do the next scan.
            if (list.length > 0) {
                console.log("DBHandler.BatchCategoryQuery: List is not empty, recursing.");

                DBHandler.BatchCategoryQuery(params, list, function (err,nextData) {
                    var combinedData = nextData
                    combinedData['Items'] = nextData.Items.concat(data.Items)
                    callback(null,combinedData);
                })

            }

            // Else trigger the callback
            else {
                console.log("DBHandler.QueryRec: List is empty. Returning.");
                callback(null, data)
            }
        }
    })
}

// Method to be used when query may exceed 1 MB limit. Recursively querries
// until all data has been collected, and then returns it.
DBHandler.QueryRec = function(params,callback) {
    console.log("DBHandler.QueryRec: New QueryRec");
    console.log(params);
    docClient.query(params, function (err, data) {
        if (err) {
            var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
            console.error("DBHandler.QueryRec: Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err, null)
        } else {
            console.log("DBHandler.QueryRec: Query succeeded.");

            // If we haven't consumed all the data, do the next scan.
            if (data.LastEvaluatedKey != null) {
                console.log("DBHandler.QueryRec: Scan was not exhaustive, recursing.");
                var newParams = params
                newParams['ExclusiveStartKey'] = data.LastEvaluatedKey;

                DBHandler.QueryRec(newParams, function (err,nextData) {
                    var combinedData = nextData
                    //console.log(Object.keys(nextData));
                    combinedData['Items'] = nextData.Items.concat(data.Items)
                    callback(null,combinedData);
                })

            }

            // Else trigger the callback
            else {
                console.log("DBHandler.QueryRec: Scan was exhaustive. Returning.");
                callback(null, data)
            }
        }
    })

}



// Method to be used when scan may exceed 1 MB limit. Recursively scans
// until all data has been collected, and then returns it.
DBHandler.ScanRec = function(params,callback) {
    console.log("DBHandler.ScanRec: New ScanRec");
    console.log(params);
    docClient.scan(params, function (err, data) {
        if (err) {
            var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
            console.error("DBHandler.ScanRec: Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err, null)
        } else {
            console.log("DBHandler.ScanRec: Query succeeded.");

            // If we haven't consumed all the data, do the next scan.
            if (data.LastEvaluatedKey != null) {
                console.log("DBHandler.ScanRec: Scan was not exhaustive, recursing.");
                var newParams = params
                newParams['ExclusiveStartKey'] = data.LastEvaluatedKey;

                DBHandler.ScanRec(newParams, function (err,nextData) {
                    var combinedData = nextData
                    //console.log(Object.keys(nextData));
                    combinedData['Items'] = nextData.Items.concat(data.Items)
                    callback(null,combinedData);
                })

            }

            // Else trigger the callback
            else {
                console.log("DBHandler.ScanRec: Scan was exhaustive. Returning.");
                callback(null, data)
            }
        }
    })

}


// Export the module
module.exports = DBHandler;