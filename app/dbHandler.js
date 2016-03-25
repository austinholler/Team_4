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

// Method for connecting to our DB instance
DBHandler.connect = function(inputParam,accessKey,secretAccessKey) {
    console.log('Connecting...');
    AWS.config.update({
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
        // Region/Endpoint must be specified by user.
        region: inputParam,
        //endpoint: endpointParam
    });

    dynamodb = new AWS.DynamoDB();
    docClient = new AWS.DynamoDB.DocumentClient();

    console.log('Connected to Dynamo DB');
}

// Method for querrying the db
DBHandler.get = function(tableName,tableParams,callback) {
    console.log("getting the data...");
    var outData = null
    // tableParams should be a dictionary of key->values, not currently using until DB format is finalized.
    var params = {
        TableName : tableName,
    };
    var error = "none"

    // Scan for retreiving all documents
    // Query for retreiving specific documents.
    docClient.scan(params, function(err, data) {
        if (err) {
            var error = "Unable to query. Error:" + JSON.stringify(err, null, 2)
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            callback(err,null)
        } else {
            console.log("Query succeeded.");
            callback(null,data)
        }

    });

}

// Method for putting item into the database
DBHandler.put = function(tableName) {
    console.log("putting in data...");

    var params = {
        TableName: tableName,
        Item: {
            "name":  "bowling",
            "city": "denver"
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add event", params.Item.name, " to", tableName , ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", params.Item.name);
        }
    });
}

//Method for creating a table
DBHandler.createTable = function(tableName) {

    var params = {
        TableName: tableName,
        KeySchema: [
            {AttributeName: "name", KeyType: "HASH"},  //Partition key
            {AttributeName: "city", KeyType: "RANGE"}  //Sort key
        ],
        AttributeDefinitions: [
            {AttributeName: "name", AttributeType: "S"},
            {AttributeName: "city", AttributeType: "S"}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

// Method for deleting a table.
DBHandler.deleteTable = function(tableName) {
    var AWS = require("aws-sdk");

    AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
    });

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : tableName
    };

    dynamodb.deleteTable(params, function(err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

// Export the module
module.exports = DBHandler;