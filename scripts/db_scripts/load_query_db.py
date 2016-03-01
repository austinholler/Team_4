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
import sys


def main():
	# User must provide 3 arguments
	if (len(sys.argv) < 4):
		sys.exit("USAGE: py load_query_db.py [dbName] [collectionName] [jsonPath]")
	name = sys.argv[1]
	collection = sys.argv[2]
	path = sys.argv[3]
	
	# Load the data
	loadJsonIntoMongo(name,collection,path)

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
	collection.insert(data[collectionName])

if __name__ == '__main__':
	main()

