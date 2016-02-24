#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  load_query_db.py
#
#  Created By: Matt Bubernak 
#  Date: Feb 24, 2016
#  Purpose: Loads json file into specific mongo instance. 
#
# Requires pymongo: 
# python -m pip install pymongo

import json
import time
import pymongo


def main():
	# TODO: Should come from user IO in future. 
	loadJsonIntoMongo("test","meetupsample","basic_json.json")

	return 0

def loadJsonIntoMongo(dbName,collectionName,jsonPath):

	print("Using DB: " + dbName + "\nCollection: " + collectionName + "\nJson Path:" + jsonPath)
	# Create mongo client
	from pymongo import MongoClient
	client = MongoClient()

	# Connect to test database
	db = client[dbName]

	# Use meetupsample collection within test database
	collection = db[collectionName]

	# Open a json file 
	json_data = open(jsonPath).read()

	# Load json into data 
	data = json.loads(json_data)

	# insert json array into the database
	collection.insert(data)

if __name__ == '__main__':
	main()

